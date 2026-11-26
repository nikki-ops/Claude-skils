// MARS CITY — прогулка по городу: свой космонавт, гуляющие жители, онлайн с другими подписчиками.
// Подключается в index.html одной строкой: <script src="igra.js"></script>
// Онлайн: адрес сервера — window.IGRA_SERVER, параметр ?srv=wss://… или тот же сайт, если карта открыта с сервера игры.
(function () {
  'use strict';
  const wait = setInterval(() => { if (window.MP && window.THREE && typeof MAPCFG !== 'undefined' && typeof sc !== 'undefined' && typeof cam !== 'undefined') { clearInterval(wait); try { init(); } catch (e) { console.warn('igra', e); } } }, 300);

  function init() {
    const $ = (id) => document.getElementById(id);
    const st = $('st'), K = MP.K, L = MAPCFG.list;
    const LITE = typeof LITEMAP !== 'undefined' && LITEMAP;
    const Q = new URLSearchParams(location.search);
    const nrm = (s) => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[\s_.\-·@]+/g, '');
    const hash = (s) => { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
    const COLORS = [0xee6c3a, 0xf7c24a, 0x44c26b, 0x3e93a6, 0x9b6cf0, 0xe84a8a, 0x5aa0ff, 0xffffff, 0x2fd0c0, 0xff8f3a];
    const rnd = (a, b) => a + Math.random() * (b - a);

    // ---------- стили и интерфейс ----------
    const css = document.createElement('style');
    css.textContent = `
body.igwalk .bub.mpn{font-size:1.5em!important;opacity:.9}
#igBtn{background:linear-gradient(#ffd36a,#f7a83a)!important;color:#1a1410!important;font-weight:900}
#igUI{position:absolute;inset:0;z-index:40;display:none;font-family:Rubik,'Arial Black',Arial,sans-serif;color:#fff;touch-action:none;user-select:none;-webkit-user-select:none}
#igUI .ig{position:absolute}
#igTouch{inset:0}
#igTop{left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 10px);display:flex;gap:8px;align-items:center;justify-content:space-between;pointer-events:none}
#igTop>*{pointer-events:auto}
.igP{background:rgba(16,14,24,.82);border:2px solid rgba(247,194,74,.55);border-radius:14px;padding:6px 12px;font-size:14px;font-weight:800;white-space:nowrap}
.igB{background:rgba(16,14,24,.85);border:2px solid rgba(255,255,255,.28);border-radius:50%;width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer}
.igB:active{transform:scale(.92)}
#igBtns{right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;flex-direction:column;gap:10px}
#igUI:not(.touch) #igJoy{display:none}
@media (max-width:700px){#igHint{display:none}}
#igJoy{left:22px;bottom:calc(env(safe-area-inset-bottom,0px) + 26px);width:130px;height:130px;border-radius:50%;background:rgba(20,16,30,.35);border:3px solid rgba(255,255,255,.55);pointer-events:none}
#igJoy i{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:50%;background:rgba(247,194,74,.9);box-shadow:0 3px 8px rgba(0,0,0,.4)}
#igLog{left:10px;top:calc(env(safe-area-inset-top,0px) + 58px);max-width:min(70%,420px);font-size:14px;font-weight:700;pointer-events:none;display:flex;flex-direction:column;gap:4px}
#igLog div{background:rgba(10,10,20,.62);border-radius:10px;padding:4px 10px;transition:opacity 1s}
#igLog b{color:#f7c24a}
#igChat{left:10px;right:76px;bottom:calc(env(safe-area-inset-bottom,0px) + 170px);display:none;gap:6px}
#igChat input{flex:1;font:700 16px Arial,sans-serif;padding:10px 12px;border-radius:12px;border:2px solid #f7c24a;background:#15121e;color:#fff;outline:none}
#igChat button{font:900 16px Arial,sans-serif;border:0;border-radius:12px;background:#f7c24a;color:#1a1410;padding:0 14px}
#igHint{left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 20px);transform:translateX(-50%);font-size:13px;opacity:.85;pointer-events:none;text-align:center;white-space:nowrap}
.igN{position:absolute;transform:translate(-50%,-100%);pointer-events:none;text-align:center;white-space:nowrap;font-weight:900}
.igN s{text-decoration:none;display:inline-block;font-size:12px;background:rgba(15,12,22,.78);color:#fff;border-radius:8px;padding:2px 7px}
.igN.pl s{background:#f7c24a;color:#1a1410}
.igN.me s{background:#44c26b;color:#08200f}
.igN q{quotes:none;display:block;margin:0 auto 4px;max-width:220px;white-space:normal;font-size:13px;font-weight:700;background:#fff6e2;color:#16120f;border-radius:12px;padding:5px 10px;box-shadow:0 2px 6px rgba(0,0,0,.35)}
.igN q:empty{display:none}
#igStart{position:absolute;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(8,6,14,.72);font-family:Rubik,Arial,sans-serif;color:#fff;padding:16px}
#igStart>div{background:linear-gradient(#2a1d3a,#1a1426);border:3px solid #f7c24a;border-radius:20px;padding:20px;width:min(100%,380px);text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.5)}
#igStart h2{margin:0 0 6px;font-size:24px;font-weight:900}#igStart p{margin:0 0 12px;font:500 14px/1.35 Arial,sans-serif;opacity:.9}
#igStart input{width:100%;box-sizing:border-box;font:700 18px Arial,sans-serif;padding:12px;border-radius:12px;border:2px solid #f7c24a;background:#120f1a;color:#fff;outline:none;text-align:center}
#igStart .cl{display:flex;gap:8px;justify-content:center;margin:12px 0;flex-wrap:wrap}
#igStart .cl i{width:30px;height:30px;border-radius:50%;cursor:pointer;border:3px solid transparent}
#igStart .cl i.on{border-color:#fff}
#igStart button{width:100%;font:900 19px Rubik,Arial,sans-serif;padding:14px;border:0;border-radius:14px;background:#f7c24a;color:#1a1410;cursor:pointer;margin-top:4px}
#igStart small{display:block;margin-top:10px;font:500 12px Arial,sans-serif;opacity:.7}
#igFound{font:700 13px Arial,sans-serif;color:#7fe39a;min-height:18px;margin-top:6px}`;
    document.head.appendChild(css);

    const ui = document.createElement('div');
    ui.id = 'igUI';
    ui.innerHTML = `<div class="ig" id="igTouch"></div><div id="igLabels"></div>
<div class="ig" id="igTop"><div class="igP" id="igOn">⚪ Прогулка</div><div class="igP" id="igWhere"></div><div class="igB" id="igExit" title="Выйти на карту">✖</div></div>
<div class="ig" id="igLog"></div>
<div class="ig" id="igJoy"><i></i></div>
<div class="ig" id="igBtns"><div class="igB" id="igTalk" title="Поговорить (E)">🗣</div><div class="igB" id="igSay" title="Чат (Enter)">💬</div><div class="igB" id="igRun" title="Бег (Shift)">🏃</div><div class="igB" id="igHome" title="К моему дому">🏠</div><div class="igB" id="igNight" title="День / ночь">🌙</div></div>
<div class="ig" id="igChat"><input id="igChatI" maxlength="120" placeholder="Напиши всем…" enterkeyhint="send"><button id="igChatB">➤</button></div>
<div class="ig" id="igHint"></div>`;
    st.appendChild(ui);

    const start = document.createElement('div');
    start.id = 'igStart';
    start.innerHTML = `<div><h2>🚶 Прогулка по MARS CITY</h2><p>Гуляй по городу, заходи к соседям и болтай с подписчиками, которые сейчас тоже здесь.</p>
<input id="igName" maxlength="24" placeholder="Твой ник" autocomplete="off"><div id="igFound"></div>
<div class="cl" id="igCl"></div><button id="igGo">Гулять!</button>
<small>Если ник есть на карте, появишься у своего дома 🏠</small></div>`;
    st.appendChild(start);

    // кнопка входа на карте
    const mk = () => {
      const bb = $('mpBtns');
      if (!bb || $('igBtn')) return;
      const b = document.createElement('div');
      b.id = 'igBtn'; b.textContent = '🚶 Гулять';
      b.onclick = (e) => { e.stopPropagation(); openStart(); };
      bb.insertBefore(b, bb.firstChild);
    };
    mk(); setInterval(mk, 2000);

    // ---------- 3D-персонажи ----------
    const GEO = {
      leg: new THREE.BoxGeometry(0.28, 0.75, 0.3).translate(0, -0.375, 0),
      body: new THREE.CylinderGeometry(0.36, 0.42, 0.85, 10),
      head: new THREE.SphereGeometry(0.36, 14, 10),
      visor: new THREE.SphereGeometry(0.3, 12, 8, -0.9, 1.8, 0.9, 1.0),
      pack: new THREE.BoxGeometry(0.5, 0.6, 0.25),
      arm: new THREE.BoxGeometry(0.18, 0.62, 0.2).translate(0, -0.28, 0),
      ring: new THREE.RingGeometry(0.55, 0.75, 24),
    };
    const MAT = {};
    const mat = (c) => MAT[c] || (MAT[c] = new THREE.MeshLambertMaterial({ color: c }));
    const MWHITE = mat(0xf1ede6), MVIS = new THREE.MeshLambertMaterial({ color: 0x22324a, emissive: 0x0b2440 }), MDARK = mat(0x3a3440);
    const MRING = new THREE.MeshBasicMaterial({ color: 0x44c26b, transparent: true, opacity: 0.8, side: THREE.DoubleSide });

    function makeChar(color, me) {
      const g = new THREE.Group();
      const c = mat(color);
      const lL = new THREE.Mesh(GEO.leg, MDARK), lR = new THREE.Mesh(GEO.leg, MDARK);
      lL.position.set(-0.15, 0.75, 0); lR.position.set(0.15, 0.75, 0);
      const body = new THREE.Mesh(GEO.body, c); body.position.y = 1.18;
      const aL = new THREE.Mesh(GEO.arm, c), aR = new THREE.Mesh(GEO.arm, c);
      aL.position.set(-0.5, 1.5, 0); aR.position.set(0.5, 1.5, 0);
      const head = new THREE.Mesh(GEO.head, MWHITE); head.position.y = 1.9;
      const vis = new THREE.Mesh(GEO.visor, MVIS); vis.position.set(0, 1.92, 0.07); vis.rotation.y = 0;
      const pack = new THREE.Mesh(GEO.pack, MWHITE); pack.position.set(0, 1.25, -0.4);
      g.add(lL, lR, body, aL, aR, head, vis, pack);
      if (me) { const r = new THREE.Mesh(GEO.ring, MRING); r.rotation.x = -Math.PI / 2; r.position.y = 0.05; g.add(r); }
      g.userData = { lL, lR, aL, aR, body, ph: Math.random() * 6 };
      g.traverse((o) => { o.matrixAutoUpdate = true; });
      sc.add(g);
      return g;
    }
    function animChar(g, moving, dt, speed) {
      const u = g.userData;
      if (moving) u.ph += dt * (6 + speed * 0.9); else u.ph *= 0.85;
      const s = moving ? Math.sin(u.ph) * 0.7 : 0;
      u.lL.rotation.x = s; u.lR.rotation.x = -s; u.aL.rotation.x = -s * 0.8; u.aR.rotation.x = s * 0.8;
      u.body.position.y = 1.18 + (moving ? Math.abs(Math.cos(u.ph)) * 0.06 : 0);
    }

    // ---------- столкновения с домами ----------
    const CELL = 12, GRID = new Map(), BOX = new THREE.Box3(), V = new THREE.Vector3(), V2 = new THREE.Vector3();
    let X0 = 1e9, X1 = -1e9, Z0 = 1e9, Z1 = -1e9;
    const homes = [];
    function buildGrid() {
      GRID.clear(); homes.length = 0;
      L.forEach((h) => {
        if (h.n && !h.site && !h.anon) homes.push(h);
        if (Number.isFinite(h.x)) { X0 = Math.min(X0, h.x); X1 = Math.max(X1, h.x); Z0 = Math.min(Z0, h.z); Z1 = Math.max(Z1, h.z); }
        if (!h.g || !h.g.visible || h.site) return;
        BOX.setFromObject(h.g); if (BOX.isEmpty()) return;
        BOX.getSize(V); BOX.getCenter(V2);
        if (V.x > 40 || V.z > 40) return; // огромные постройки (космодром и т.п.) не мешают ходить
        const r = Math.max(1.6, Math.min(6, Math.min(V.x, V.z) * 0.36));
        const o = { x: V2.x, z: V2.z, r };
        const cx = Math.floor(o.x / CELL), cz = Math.floor(o.z / CELL);
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
          const k = (cx + i) + ',' + (cz + j);
          if (!GRID.has(k)) GRID.set(k, []);
          GRID.get(k).push(o);
        }
      });
      X0 -= 60; X1 += 60; Z0 -= 60; Z1 += 60;
    }
    const PR = 0.45; // радиус человечка
    function blocked(x, z) {
      if (x < X0 || x > X1 || z < Z0 || z > Z1) return true;
      const a = GRID.get(Math.floor(x / CELL) + ',' + Math.floor(z / CELL));
      if (!a) return false;
      for (const o of a) { const dx = x - o.x, dz = z - o.z, rr = o.r + PR; if (dx * dx + dz * dz < rr * rr) return true; }
      return false;
    }
    function move(p, dx, dz) { // скольжение вдоль стен
      if (!blocked(p.x + dx, p.z + dz)) { p.x += dx; p.z += dz; return true; }
      let ok = false;
      if (!blocked(p.x + dx, p.z)) { p.x += dx; ok = true; }
      else if (!blocked(p.x, p.z + dz)) { p.z += dz; ok = true; }
      return ok;
    }
    function freeSpot(x, z) {
      for (let r = 0; r < 40; r += 1.5) for (let a = 0; a < 6.28; a += 0.5) {
        const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        if (!blocked(px, pz)) return { x: px, z: pz };
      }
      return { x, z };
    }
    const houseDoor = (h) => freeSpot(h.x, h.z + 6.5);

    // ---------- подписи над головами ----------
    const LB = $('igLabels');
    function label(cls) {
      const e = document.createElement('div');
      e.className = 'igN ' + (cls || '');
      e.innerHTML = '<q></q><s></s>';
      LB.appendChild(e);
      return { e, q: e.firstChild, s: e.lastChild, until: 0 };
    }
    function sayOn(lb, text, sec) { lb.q.textContent = text; lb.until = performance.now() + (sec || 5) * 1000; }

    // ---------- игрок ----------
    const me = { x: 0, z: 0, a: 0, name: '', color: COLORS[0], home: null, g: null, lb: null, run: false, moving: false };
    let camYaw = 0.5, camP = 0.5, camD = 15, active = false, night = false;

    // ---------- жители, которые гуляют ----------
    const NPC_N = LITE ? 16 : 32, npcs = [];
    const PH_HI = ['Привет! 👋', 'О, новенький!', 'Здорово!', 'Хай!', 'Добро пожаловать на Марс!'];
    const PH = ['Говорят, скоро будет 1000 жителей!', 'Смотрел новую серию?', 'Заходи в гости!', 'Тут кислород по талонам 😅', 'Видел Золотую статую кота?',
      'Напиши в комментах, что построить, — и построят!', 'Я тут с первого выпуска', 'Не наступи на кратер!', 'Кто-нибудь видел KAPAOKE_KOT?', 'Сегодня хорошая пыльная буря ☀️',
      'Ищу соседа для огорода 🥔', 'Подпишись, а то дом не дадут 😉', 'Красиво у нас, правда?'];
    const usedNick = new Set();
    function pickHome(x, z, rad) {
      let best = null, tries = 0;
      while (tries++ < 40) {
        const h = homes[Math.floor(Math.random() * homes.length)];
        if (!h || usedNick.has(h.n) || (h.day != null && h.day > MAPCFG.days.max)) continue;
        const d = Math.hypot(h.x - x, h.z - z);
        if (d < rad) return h;
        if (!best || d < Math.hypot(best.x - x, best.z - z)) best = h;
      }
      // ближайшие дома
      let bd = 1e9;
      for (const h of homes) { if (usedNick.has(h.n)) continue; const d = Math.hypot(h.x - x, h.z - z); if (d < bd && d > 8) { bd = d; best = h; } if (bd < rad * 0.5) break; }
      return best;
    }
    function spawnNpc(n, near) {
      const a = Math.random() * 6.28, r = near ? rnd(18, 60) : rnd(35, 90);
      const cx = me.x + Math.cos(a) * r, cz = me.z + Math.sin(a) * r;
      const h = pickHome(cx, cz, 60);
      if (n.h) usedNick.delete(n.h.n);
      n.h = h; if (h) usedNick.add(h.n);
      const p = h ? houseDoor(h) : freeSpot(cx, cz);
      n.x = p.x; n.z = p.z; n.tx = n.x; n.tz = n.z; n.wait = rnd(0, 2);
      const col = COLORS[hash(h ? h.n : String(Math.random())) % COLORS.length];
      if (!n.g || n.col !== col) { if (n.g) sc.remove(n.g); n.g = makeChar(col); n.col = col; }
      n.lb.s.textContent = '@' + (h ? h.n : 'житель');
      n.lb.q.textContent = ''; n.hi = false;
      n.sp = rnd(1.2, 2.2);
    }
    function npcTarget(n) {
      for (let k = 0; k < 8; k++) {
        const a = Math.random() * 6.28, r = rnd(6, 26);
        const bx = n.h && Math.random() < 0.35 ? houseDoor(n.h) : null;
        const tx = bx ? bx.x : n.x + Math.cos(a) * r, tz = bx ? bx.z : n.z + Math.sin(a) * r;
        if (!blocked(tx, tz)) { n.tx = tx; n.tz = tz; return; }
      }
    }
    function updNpc(n, dt, now) {
      const dpx = n.x - me.x, dpz = n.z - me.z, dp = Math.hypot(dpx, dpz);
      if (dp > 130) { spawnNpc(n, false); return; }
      let moving = false;
      if (dp < 3.2) { // остановился поболтать
        n.g.rotation.y = Math.atan2(-dpx, -dpz);
        if (!n.hi) { n.hi = true; sayOn(n.lb, PH_HI[Math.floor(Math.random() * PH_HI.length)], 3); }
      } else if (n.wait > 0) n.wait -= dt;
      else {
        const dx = n.tx - n.x, dz = n.tz - n.z, d = Math.hypot(dx, dz);
        if (d < 0.6) { n.wait = rnd(1, 5); npcTarget(n); }
        else {
          const s = Math.min(d, n.sp * dt);
          if (!move(n, dx / d * s, dz / d * s)) { n.wait = rnd(0.3, 1.5); npcTarget(n); }
          else { n.g.rotation.y = Math.atan2(dx, dz); moving = true; }
        }
        if (dp > 6) n.hi = false;
      }
      if (Math.random() < dt * 0.012 && dp < 30 && !n.lb.q.textContent) sayOn(n.lb, PH[Math.floor(Math.random() * PH.length)], 5);
      n.g.position.set(n.x, 0, n.z);
      animChar(n.g, moving, dt, n.sp);
    }
    const kindOf = (h) => String((h && h.kind) || 'дом').split(' · ')[0].slice(0, 60);
    function talkTo(n) {
      const h = n.h;
      const lines = h ? [
        'Я @' + h.n + '. Живу тут: ' + kindOf(h) + ' 🏠',
        'Мой дом — ' + kindOf(h) + '. Район: ' + (h.district || 'Марс') + '.',
        PH[Math.floor(Math.random() * PH.length)],
      ] : PH;
      n.talkI = ((n.talkI || 0) + 1) % lines.length;
      sayOn(n.lb, lines[n.talkI === 1 ? 0 : n.talkI], 6);
      n.wait = Math.max(n.wait, 4);
    }
    function nearestNpc(max) {
      let best = null, bd = max;
      npcs.forEach((n) => { const d = Math.hypot(n.x - me.x, n.z - me.z); if (d < bd) { bd = d; best = n; } });
      return best;
    }

    // ---------- онлайн ----------
    const others = new Map();
    let ws = null, myId = null, online = false, lastSend = 0, retry = 0;
    function serverUrl() {
      const s = Q.get('srv') || window.IGRA_SERVER || '';
      if (s) return s.replace(/^http/, 'ws').replace(/\/?$/, '') + (/\/ws$/.test(s) ? '' : '/ws');
      if (/^https?:$/.test(location.protocol) && !/netlify\.app$/.test(location.hostname) && location.port !== '8123')
        return (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
      return '';
    }
    function setOn() {
      const n = others.size + 1;
      $('igOn').textContent = online ? '🟢 Онлайн: ' + n : '⚪ Одиночная прогулка';
    }
    function connect() {
      const url = serverUrl();
      if (!url || !active) { setOn(); return; }
      try { ws = new WebSocket(url); } catch (_) { setOn(); return; }
      ws.onopen = () => { online = true; retry = 0; ws.send(JSON.stringify({ t: 'hi', n: me.name, c: me.color, x: me.x, z: me.z, a: me.a })); setOn(); };
      ws.onmessage = (ev) => {
        let m; try { m = JSON.parse(ev.data); } catch (_) { return; }
        if (m.t === 'welcome') { myId = m.id; (m.players || []).forEach(addOther); log('🛰', 'Ты в онлайне. Сейчас в городе: ' + (others.size + 1)); }
        else if (m.t === 'join') { addOther(m); log('👋', m.n + ' пришёл в город'); }
        else if (m.t === 'leave') { const o = others.get(m.id); if (o) { sc.remove(o.g); o.lb.e.remove(); others.delete(m.id); log('🚪', o.n + ' ушёл'); } }
        else if (m.t === 'ps') (m.l || []).forEach(([id, x, z, a, mv]) => { const o = others.get(id); if (o) { o.tx = x; o.tz = z; o.ta = a; o.mv = mv; } });
        else if (m.t === 'say') { const o = m.id === myId ? null : others.get(m.id); if (o) { sayOn(o.lb, m.s, 7); log(o.n, m.s); } }
        setOn();
      };
      ws.onclose = () => {
        online = false; others.forEach((o) => { sc.remove(o.g); o.lb.e.remove(); }); others.clear(); setOn();
        if (active && retry < 6) setTimeout(connect, 2000 * ++retry);
      };
      ws.onerror = () => {};
    }
    function addOther(p) {
      if (p.id === myId || others.has(p.id)) return;
      const o = { id: p.id, n: String(p.n || 'гость').slice(0, 24), x: p.x, z: p.z, tx: p.x, tz: p.z, a: p.a || 0, ta: p.a || 0, mv: 0 };
      o.g = makeChar(COLORS.includes(p.c) ? p.c : COLORS[0]);
      o.lb = label('pl'); o.lb.s.textContent = '🧑‍🚀 ' + o.n;
      others.set(p.id, o);
    }
    const send = (o) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); };

    // ---------- журнал сообщений ----------
    function log(who, text) {
      const d = document.createElement('div');
      const b = document.createElement('b'); b.textContent = who + ' ';
      d.appendChild(b); d.appendChild(document.createTextNode(text));
      const lg = $('igLog'); lg.appendChild(d);
      while (lg.children.length > 5) lg.firstChild.remove();
      setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 1000); }, 9000);
    }

    // ---------- управление ----------
    const keys = {}, joy = { on: false, id: null, x0: 0, y0: 0, dx: 0, dy: 0 }, look = new Map();
    const chatOpen = () => $('igChat').style.display === 'flex';
    addEventListener('keydown', (e) => {
      if (!active) return;
      if (chatOpen()) { if (e.key === 'Escape') closeChat(); return; }
      if (e.target && e.target.tagName === 'INPUT' && e.target.offsetParent) return;
      keys[e.code] = true;
      if (e.code === 'Enter') { e.preventDefault(); openChat(); }
      if (e.code === 'KeyE') doTalk();
      if (e.code === 'Escape') exitWalk();
      if (/^(Arrow|Space)/.test(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => { keys[e.code] = false; });
    addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

    const T = $('igTouch'), JE = $('igJoy'), JK = JE.firstChild;
    T.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const r = st.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (e.pointerType !== 'mouse' && x < r.width * 0.45 && y > r.height * 0.35 && !joy.on) {
        joy.on = true; joy.id = e.pointerId; joy.x0 = e.clientX; joy.y0 = e.clientY; joy.dx = joy.dy = 0;
        JE.style.left = (x - 65) + 'px'; JE.style.top = (y - 65) + 'px'; JE.style.bottom = 'auto';
      } else look.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now(), m: 0 });
      try { T.setPointerCapture(e.pointerId); } catch (_) {}
    });
    T.addEventListener('pointermove', (e) => {
      if (joy.on && e.pointerId === joy.id) {
        let dx = e.clientX - joy.x0, dy = e.clientY - joy.y0; const d = Math.hypot(dx, dy), m = 55;
        if (d > m) { dx = dx / d * m; dy = dy / d * m; }
        joy.dx = dx / m; joy.dy = dy / m; JK.style.transform = `translate(${dx}px,${dy}px)`;
        return;
      }
      const o = look.get(e.pointerId); if (!o) return;
      const dx = e.clientX - o.x, dy = e.clientY - o.y; o.m += Math.abs(dx) + Math.abs(dy);
      if (look.size === 1) { camYaw -= dx * 0.008; camP = Math.max(0.12, Math.min(1.25, camP + dy * 0.005)); }
      o.x = e.clientX; o.y = e.clientY;
    });
    const up = (e) => {
      if (joy.on && e.pointerId === joy.id) { joy.on = false; joy.dx = joy.dy = 0; JK.style.transform = ''; JE.style.left = '22px'; JE.style.top = ''; JE.style.bottom = ''; return; }
      const o = look.get(e.pointerId); look.delete(e.pointerId);
      if (o && o.m < 8) tapAt(e.clientX, e.clientY);
    };
    T.addEventListener('pointerup', up); T.addEventListener('pointercancel', up);
    T.addEventListener('wheel', (e) => { e.preventDefault(); camD = Math.max(5, Math.min(60, camD * (e.deltaY > 0 ? 1.1 : 0.9))); }, { passive: false });

    function tapAt(cx, cy) {
      const r = st.getBoundingClientRect();
      let best = null, bd = 60;
      npcs.forEach((n) => {
        V.set(n.x, 1.2, n.z).project(cam); if (V.z > 1) return;
        const sx = (V.x * 0.5 + 0.5) * r.width + r.left, sy = (-V.y * 0.5 + 0.5) * r.height + r.top, d = Math.hypot(sx - cx, sy - cy);
        if (d < bd) { bd = d; best = n; }
      });
      if (best) { if (Math.hypot(best.x - me.x, best.z - me.z) < 14) talkTo(best); else sayOn(best.lb, 'Подойди поближе! 👋', 3); }
    }
    function doTalk() { const n = nearestNpc(6); if (n) talkTo(n); else log('💡', 'Подойди к жителю поближе, чтобы поговорить'); }
    function openChat() { $('igChat').style.display = 'flex'; const i = $('igChatI'); i.value = ''; setTimeout(() => i.focus(), 30); }
    function closeChat() { $('igChat').style.display = 'none'; $('igChatI').blur(); }
    function sendChat() {
      const s = $('igChatI').value.replace(/[\u0000-\u001f]/g, '').trim().slice(0, 120);
      closeChat(); if (!s) return;
      sayOn(me.lb, s, 7); log(me.name, s); send({ t: 'say', s });
    }
    $('igChatB').onclick = sendChat;
    $('igChatI').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
    $('igSay').onclick = () => (chatOpen() ? closeChat() : openChat());
    $('igTalk').onclick = doTalk;
    $('igRun').onclick = () => { me.run = !me.run; $('igRun').style.borderColor = me.run ? '#f7c24a' : ''; };
    $('igHome').onclick = () => {
      if (!me.home) { log('🏠', 'Твоего ника нет на карте. Напиши комментарий под роликом, и тебе построят дом!'); return; }
      const p = houseDoor(me.home); me.x = p.x; me.z = p.z; log('🏠', 'Ты у своего дома');
    };
    $('igNight').onclick = () => { night = !night; MP.night(night); $('igNight').textContent = night ? '☀️' : '🌙'; };
    $('igExit').onclick = exitWalk;

    // ---------- старт и выход ----------
    let color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const cl = $('igCl');
    cl.innerHTML = COLORS.map((c) => `<i data-c="${c}" style="background:#${c.toString(16).padStart(6, '0')}"></i>`).join('');
    const setCl = () => cl.querySelectorAll('i').forEach((i) => i.classList.toggle('on', +i.dataset.c === color));
    cl.onclick = (e) => { const i = e.target.closest('[data-c]'); if (i) { color = +i.dataset.c; setCl(); } };
    setCl();
    const findHome = (name) => { const v = nrm(name); return v ? homes.find((h) => nrm(h.n) === v) || null : null; };
    $('igName').addEventListener('input', () => {
      if (!homes.length) buildGrid();
      const h = findHome($('igName').value);
      $('igFound').textContent = h ? '🏠 Нашли твой дом: ' + kindOf(h) + ' · ' + (h.district || '') : '';
    });
    $('igName').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('igGo').click(); });
    $('igGo').onclick = () => {
      const n = $('igName').value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 24) || 'Гость-' + Math.floor(Math.random() * 900 + 100);
      try { localStorage.setItem('igName', n); localStorage.setItem('igColor', color); } catch (_) {}
      $('igName').blur();
      start.style.display = 'none';
      enterWalk(n);
    };
    function openStart() {
      try { $('igName').value = localStorage.getItem('igName') || ''; const c = +localStorage.getItem('igColor'); if (COLORS.includes(c)) { color = c; setCl(); } } catch (_) {}
      $('igName').dispatchEvent(new Event('input'));
      if ($('sys')) $('sys').style.display = 'none';
      const sb = document.querySelector('[title="Звёздная карта"]'); if (sb) sb.style.display = 'none';
      start.style.display = 'flex';
      setTimeout(() => $('igName').focus(), 50);
    }
    start.addEventListener('pointerdown', (e) => { if (e.target === start) { start.style.display = 'none'; const sb = document.querySelector('[title="Звёздная карта"]'); if (sb) sb.style.display = ''; } });

    const HIDE = ['mpTop', 'mpCtl', 'mpBot', 'mpEye', 'mpCard'];
    let saved = null;
    function enterWalk(name) {
      buildGrid();
      me.name = name; me.color = color; me.home = findHome(name);
      const sp = me.home ? houseDoor(me.home) : freeSpot(MAPCFG.center[0], MAPCFG.center[1] + 30);
      me.x = sp.x; me.z = sp.z; me.a = Math.PI;
      if (me.g) sc.remove(me.g);
      me.g = makeChar(color, true);
      if (!me.lb) me.lb = label('me');
      me.lb.s.textContent = '⭐ ' + name;
      saved = { ...K, disp: HIDE.map((id) => $(id) && $(id).style.display) };
      HIDE.forEach((id) => { const e = $(id); if (e) e.style.display = 'none'; });
      const sb = document.querySelector('[title="Звёздная карта"]'); if (sb) sb.style.display = 'none';
      if ($('sys')) $('sys').style.display = 'none';
      ui.classList.toggle('touch', matchMedia('(pointer:coarse)').matches);
      document.body.classList.add('igwalk');
      ui.style.display = 'block'; active = true;
      camYaw = 0; camP = 0.5; camD = LITE ? 13 : 15;
      while (npcs.length < NPC_N) { const n = { lb: label('') }; npcs.push(n); }
      npcs.forEach((n) => { n.lb.e.style.display = ''; spawnNpc(n, true); });
      $('igHint').textContent = matchMedia('(pointer:coarse)').matches ? 'Джойстик слева · крути камеру пальцем · нажми на жителя' : 'WASD / стрелки — идти · Shift — бег · мышь — камера · E — говорить · Enter — чат';
      log('🚀', me.home ? 'С возвращением, ' + name + '! Ты у своего дома.' : 'Привет, ' + name + '! Ты на площади Основателя.');
      retry = 0; connect(); setOn();
      last = performance.now(); requestAnimationFrame(frame);
    }
    function exitWalk() {
      active = false; ui.style.display = 'none'; closeChat(); document.body.classList.remove('igwalk');
      if (ws) { try { ws.close(); } catch (_) {} ws = null; }
      npcs.forEach((n) => { if (n.g) n.g.visible = false; n.lb.e.style.display = 'none'; });
      if (me.g) { sc.remove(me.g); me.g = null; }
      if (saved) { HIDE.forEach((id, i) => { const e = $(id); if (e) e.style.display = saved.disp[i] || ''; }); if ($('mpCard')) $('mpCard').style.display = 'none'; if ($('mpBot')) $('mpBot').style.display = ''; Object.assign(K, { tx: me.x, tz: me.z, d: 80, yaw: camYaw, p: saved.p }); }
      const sb = document.querySelector('[title="Звёздная карта"]'); if (sb) sb.style.display = '';
      MP.draw();
    }

    // ---------- кадр ----------
    let last = 0, whereT = 0;
    function frame(now) {
      if (!active) return;
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      // ввод
      let fx = 0, fz = 0;
      if (!chatOpen()) {
        if (keys.KeyW || keys.ArrowUp) fz += 1;
        if (keys.KeyS || keys.ArrowDown) fz -= 1;
        if (keys.KeyA || keys.ArrowLeft) fx -= 1;
        if (keys.KeyD || keys.ArrowRight) fx += 1;
        if (keys.KeyQ) camYaw += dt * 2; if (keys.KeyR) camYaw -= dt * 2;
      }
      if (joy.on) { fx += joy.dx; fz -= joy.dy; }
      const fl = Math.hypot(fx, fz);
      const run = me.run || keys.ShiftLeft || keys.ShiftRight || (joy.on && Math.hypot(joy.dx, joy.dy) > 0.95);
      const speed = run ? 15 : 7;
      me.moving = fl > 0.1;
      if (me.moving) {
        const k = Math.min(1, fl), s = Math.sin(camYaw), c = Math.cos(camYaw);
        const fwx = -s, fwz = -c, rx = c, rz = -s; // вперёд — от камеры
        let mx = (fwx * fz + rx * fx) / fl, mz = (fwz * fz + rz * fx) / fl;
        move(me, mx * speed * k * dt, mz * speed * k * dt);
        const ta = Math.atan2(mx, mz);
        let da = ta - me.a; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
        me.a += da * Math.min(1, dt * 12);
      }
      me.g.position.set(me.x, 0, me.z); me.g.rotation.y = me.a;
      animChar(me.g, me.moving, dt, speed);
      // жители
      npcs.forEach((n) => { n.g.visible = true; updNpc(n, dt, now); });
      // другие игроки — плавно
      others.forEach((o) => {
        const k = Math.min(1, dt * 10); o.x += (o.tx - o.x) * k; o.z += (o.tz - o.z) * k;
        let da = o.ta - o.a; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283; o.a += da * k;
        o.g.position.set(o.x, 0, o.z); o.g.rotation.y = o.a; animChar(o.g, !!o.mv, dt, 7);
      });
      if (online && now - lastSend > 110) { lastSend = now; send({ t: 'p', x: +me.x.toFixed(2), z: +me.z.toFixed(2), a: +me.a.toFixed(2), m: me.moving ? 1 : 0 }); }
      // камера карты следует за игроком
      K.tx = me.x; K.tz = me.z; K.d = camD; K.yaw = camYaw; K.p = camP;
      MP.draw();
      // подписи
      const r = st.getBoundingClientRect(), W = r.width, H = r.height;
      const place = (lb, x, z, y, maxD) => {
        const d = Math.hypot(x - me.x, z - me.z);
        V.set(x, y, z).project(cam);
        if (d > maxD || V.z > 1 || Math.abs(V.x) > 1.1 || Math.abs(V.y) > 1.1) { lb.e.style.display = 'none'; return; }
        lb.e.style.display = ''; lb.e.style.left = ((V.x * 0.5 + 0.5) * W) + 'px'; lb.e.style.top = ((-V.y * 0.5 + 0.5) * H) + 'px';
        lb.e.style.opacity = d > maxD * 0.7 ? 0.6 : 1;
        if (lb.until && now > lb.until) { lb.q.textContent = ''; lb.until = 0; }
      };
      place(me.lb, me.x, me.z, 2.5, 1e9);
      npcs.forEach((n) => place(n.lb, n.x, n.z, 2.5, 45));
      others.forEach((o) => place(o.lb, o.x, o.z, 2.5, 120));
      // где я
      if (now - whereT > 700) {
        whereT = now;
        let bh = null, bd = 25;
        for (const h of homes) { const d = Math.abs(h.x - me.x) + Math.abs(h.z - me.z); if (d < bd) { bd = d; bh = h; } }
        $('igWhere').textContent = '📍 ' + (bh ? bh.district || 'MARS CITY' : 'MARS CITY');
        $('igTalk').style.opacity = nearestNpc(6) ? 1 : 0.45;
      }
      requestAnimationFrame(frame);
    }

    // ссылка сразу в прогулку: …/index.html?igra
    if (!Q.has('video')) setTimeout(openStart, 800);
    window.IGRA = { me, npcs, others, open: openStart, enter: enterWalk, exit: exitWalk, blocked };
  }
})();
