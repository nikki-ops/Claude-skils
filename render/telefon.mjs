// Смотреть работы с телефона по Wi-Fi (компьютер и телефон в одной сети):
//   node render/telefon.mjs            → печатает адрес вида http://192.168.x.x:8080
// Что открывается:
//   /            — галерея «Космодром за 1 ₽» (2D и 3D)
//   /video       — список готовых видео из gotovo/ (смотреть прямо в браузере телефона)
//   /karta       — карта MARS CITY (облегчённый режим на телефоне включается сам)
//   /img/<файл>  — любой файл из gotovo/
// Порт можно поменять: node render/telefon.mjs 9000. Остановить — Ctrl+C.
// Windows при первом запуске может спросить разрешение для Node.js в брандмауэре — разрешить «Частные сети».
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),GOT=path.join(ROOT,'gotovo'),PORT=+(process.argv[2]||8080);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.mp3':'audio/mpeg','.json':'application/json','.svg':'image/svg+xml','.zip':'application/zip'};
function send(res,f,req){if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});return res.end('Нет такого файла')}
 const st=fs.statSync(f),type=MIME[path.extname(f).toLowerCase()]||'application/octet-stream',range=req.headers.range;
 if(range){const [a,b]=range.replace('bytes=','').split('-'),s=+a,e=b?+b:st.size-1;res.writeHead(206,{'content-type':type,'content-range':`bytes ${s}-${e}/${st.size}`,'accept-ranges':'bytes','content-length':e-s+1});return fs.createReadStream(f,{start:s,end:e}).pipe(res)}
 res.writeHead(200,{'content-type':type,'content-length':st.size,'accept-ranges':'bytes'});fs.createReadStream(f).pipe(res)}
http.createServer((req,res)=>{const u=decodeURIComponent(req.url.split('?')[0]);
 if(u==='/'||u==='/galereya')return send(res,path.join(ROOT,'render/seriya/k01-kosmodrom/galereya.html'),req);
 if(u==='/karta')return send(res,path.join(ROOT,'render/karta/index.html'),req);
 if(u==='/video'){const v=fs.readdirSync(GOT).filter(n=>n.endsWith('.mp4')).sort((a,b)=>fs.statSync(path.join(GOT,b)).mtimeMs-fs.statSync(path.join(GOT,a)).mtimeMs);
  res.writeHead(200,{'content-type':'text/html; charset=utf-8'});return res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Видео</title><body style="margin:0;padding:16px;background:#141020;color:#fff;font-family:system-ui"><h2>Видео из gotovo/</h2>${v.map(n=>`<p style="margin:18px 0 6px;font-weight:700">${n}</p><video src="/img/${encodeURIComponent(n)}" controls playsinline preload="metadata" style="width:100%;max-width:480px;border-radius:12px;background:#000"></video>`).join('')}</body>`)}
 if(u.startsWith('/img/'))return send(res,path.join(GOT,path.basename(u)),req);
 const f=path.join(ROOT,u);if(!f.startsWith(ROOT)){res.writeHead(403);return res.end()}send(res,f,req)}).listen(PORT,'0.0.0.0',()=>{
 const ips=Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address);
 console.log('\nОткрой на телефоне (тот же Wi-Fi):');ips.forEach(ip=>console.log(`  галерея:  http://${ip}:${PORT}/\n  видео:    http://${ip}:${PORT}/video\n  карта:    http://${ip}:${PORT}/karta`));console.log('\nОстановить: Ctrl+C\n')});
