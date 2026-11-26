// Сервер онлайна MARS CITY. Раздаёт карту (render/karta) и держит WebSocket /ws.
// Запуск: cd render/karta/igra-server && npm install && npm start  → http://localhost:3000/igra.html
const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');
const MAX_PLAYERS = +process.env.MAX_PLAYERS || 300;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
const COLORS = [0xee6c3a, 0xf7c24a, 0x44c26b, 0x3e93a6, 0x9b6cf0, 0xe84a8a, 0x5aa0ff, 0xffffff, 0x2fd0c0, 0xff8f3a];

const server = http.createServer((req, res) => {
  let u = decodeURIComponent((req.url || '/').split('?')[0]);
  if (u === '/health') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ ok: true, players: players.size })); }
  if (u === '/') u = '/igra.html';
  if (u.endsWith('/')) u += 'index.html';
  const f = path.join(ROOT, u);
  if (!f.startsWith(ROOT + path.sep) || f.includes(`${path.sep}igra-server${path.sep}`) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache' });
  fs.createReadStream(f).pipe(res);
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 2048 });
const players = new Map();
let nextId = 1;
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
const num = (v, d) => (Number.isFinite(+v) ? Math.max(-5000, Math.min(5000, +v)) : d);
const pub = (p) => ({ id: p.id, n: p.n, c: p.c, x: p.x, z: p.z, a: p.a });
const toAll = (msg, except) => { const s = JSON.stringify(msg); players.forEach((p) => { if (p !== except && p.ws.readyState === 1) p.ws.send(s); }); };

wss.on('connection', (ws) => {
  if (players.size >= MAX_PLAYERS) { ws.close(1013, 'full'); return; }
  let me = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', (data) => {
    let m; try { m = JSON.parse(data); } catch (_) { return; }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'hi' && !me) {
      me = { id: nextId++, ws, n: clean(m.n, 24) || 'гость', c: COLORS.includes(m.c) ? m.c : COLORS[0], x: num(m.x, 0), z: num(m.z, 0), a: num(m.a, 0), mv: 0, dirty: true, sayAt: 0 };
      ws.send(JSON.stringify({ t: 'welcome', id: me.id, players: [...players.values()].map(pub) }));
      players.set(me.id, me);
      toAll({ t: 'join', ...pub(me) }, me);
      console.log(`+ ${me.n} (${players.size} онлайн)`);
    } else if (!me) return;
    else if (m.t === 'p') { me.x = num(m.x, me.x); me.z = num(m.z, me.z); me.a = num(m.a, me.a); me.mv = m.m ? 1 : 0; me.dirty = true; }
    else if (m.t === 'say') {
      const now = Date.now(); if (now - me.sayAt < 1200) return; me.sayAt = now;
      const s = clean(m.s, 120); if (s) toAll({ t: 'say', id: me.id, s });
    }
  });
  ws.on('close', () => { if (me && players.delete(me.id)) { toAll({ t: 'leave', id: me.id }); console.log(`- ${me.n} (${players.size} онлайн)`); } });
});

// 10 раз в секунду рассылаем, кто куда сдвинулся
setInterval(() => {
  const l = []; players.forEach((p) => { if (p.dirty) { p.dirty = false; l.push([p.id, p.x, p.z, p.a, p.mv]); } });
  if (l.length) toAll({ t: 'ps', l });
}, 100);
// отключаем «зависших»
setInterval(() => { wss.clients.forEach((ws) => { if (!ws.isAlive) return ws.terminate(); ws.isAlive = false; try { ws.ping(); } catch (_) {} }); }, 30000);

server.listen(PORT, () => console.log(`MARS CITY онлайн: http://localhost:${PORT}/igra.html`));
