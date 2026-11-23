// Обложка шортса «Все ники» (9:16, 1080×1920): ночной город с горящими никами + «ВСЕ 1 434» + комментарий «А где я?».
//   node render/seriya/13-vse-niki/oblozhka.mjs [--t 11.8] [--out gotovo/13-vse-niki-oblozhka.png]
//   --tt → обложка TikTok (gotovo/13-vse-niki-oblozhka-tt.png): всё в центре 3:4 (сетка профиля режет верх/низ),
//          левее кнопок справа и выше подписи снизу.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const TT=process.argv.includes('--tt'),T=+arg('t',11.9),OUT=path.join(ROOT,arg('out',TT?'gotovo/13-vse-niki-oblozhka-tt.png':'gotovo/13-vse-niki-oblozhka.png'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.SWGL?['--use-gl=swiftshader']:[])]});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
if(process.env.THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:process.env.THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/13-vse-niki/scene.html?render`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});
await p.evaluate(([t,TT])=>{seek(t);
 ['sub','bot','cnt','top','qs'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
 const st=document.getElementById('stage'),o=document.createElement('div');o.style.cssText='position:absolute;inset:0;pointer-events:none;font-family:Rubik,"Arial Black",sans-serif;font-weight:900';
 o.innerHTML=`<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 30%,rgba(0,0,0,.55) 100%)"></div>
 <div style="position:absolute;left:50%;top:250px;transform:translateX(-50%) rotate(-3deg);background:#1f1f1f;border-radius:36px;padding:28px 40px;display:flex;gap:22px;align-items:center;box-shadow:0 20px 50px rgba(0,0,0,.6);white-space:nowrap;font-family:Rubik,Arial,sans-serif">
  <div style="width:120px;height:120px;border-radius:50%;background:#e8503a;color:#fff;font-size:64px;display:flex;align-items:center;justify-content:center;font-weight:700">Г</div>
  <div><div style="color:#aaa;font-size:36px;font-weight:500">@Глбушек</div><div style="color:#fff;font-size:76px;font-weight:700">А где я? 😢</div></div></div>
 <div style="position:absolute;left:0;right:0;top:700px;text-align:center;line-height:.95">
  <div style="font-size:250px;color:#ffd23a;-webkit-text-stroke:22px #000;paint-order:stroke fill">ТВОЙ</div>
  <div style="font-size:250px;color:#ffd23a;-webkit-text-stroke:22px #000;paint-order:stroke fill">НИК</div>
  <div style="font-size:190px;color:#fff;-webkit-text-stroke:20px #000;paint-order:stroke fill;margin-top:10px">ТУТ 👇</div></div>`;
 if(TT)o.innerHTML=`<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 45% 50%,rgba(0,0,0,0) 28%,rgba(0,0,0,.6) 100%)"></div>
 <div style="position:absolute;left:470px;top:330px;transform:translateX(-50%) rotate(-3deg);background:#1f1f1f;border-radius:32px;padding:24px 34px;display:flex;gap:20px;align-items:center;box-shadow:0 20px 50px rgba(0,0,0,.6);white-space:nowrap;font-family:Rubik,Arial,sans-serif">
  <div style="width:104px;height:104px;border-radius:50%;background:#e8503a;color:#fff;font-size:56px;display:flex;align-items:center;justify-content:center;font-weight:700">Г</div>
  <div><div style="color:#aaa;font-size:32px;font-weight:500">@Глбушек</div><div style="color:#fff;font-size:66px;font-weight:700">А где я? 😢</div></div></div>
 <div style="position:absolute;left:40px;width:860px;top:620px;text-align:center;line-height:.95">
  <div style="font-size:215px;color:#ffd23a;-webkit-text-stroke:20px #000;paint-order:stroke fill">ТВОЙ НИК</div>
  <div style="font-size:180px;color:#fff;-webkit-text-stroke:18px #000;paint-order:stroke fill;margin-top:6px">ТУТ 👇</div>
  <div style="display:inline-block;margin-top:34px;background:#ffd23a;color:#000;font-size:64px;padding:14px 36px;border-radius:24px;transform:rotate(2deg);box-shadow:0 12px 30px rgba(0,0,0,.5)">ВСЕ 1434 ДОМА 🏠</div></div>`;
 st.appendChild(o)},[T,TT]);
await p.waitForTimeout(600);await p.screenshot({path:OUT});await b.close();srv.close();console.log('Обложка:',OUT);
