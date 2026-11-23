// Обложка шортса «Все ники» (9:16, 1080×1920): ночной город с горящими никами + «ВСЕ 1 434» + комментарий «А где я?».
//   node render/seriya/13-vse-niki/oblozhka.mjs [--t 11.8] [--out gotovo/13-vse-niki-oblozhka.png]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const T=+arg('t',11.9),OUT=path.join(ROOT,arg('out','gotovo/13-vse-niki-oblozhka.png'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.SWGL?['--use-gl=swiftshader']:[])]});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
if(process.env.THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:process.env.THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/13-vse-niki/scene.html?render`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});
await p.evaluate(t=>{seek(t);
 ['sub','bot','cnt','top','qs'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display='none'});
 const st=document.getElementById('stage'),o=document.createElement('div');o.style.cssText='position:absolute;inset:0;pointer-events:none;font-family:Rubik,"Arial Black",sans-serif;font-weight:900';
 o.innerHTML=`<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(0,0,0,0) 30%,rgba(0,0,0,.55) 100%)"></div>
 <div style="position:absolute;left:50%;top:250px;transform:translateX(-50%) rotate(-3deg);background:#1f1f1f;border-radius:36px;padding:28px 40px;display:flex;gap:22px;align-items:center;box-shadow:0 20px 50px rgba(0,0,0,.6);white-space:nowrap;font-family:Rubik,Arial,sans-serif">
  <div style="width:120px;height:120px;border-radius:50%;background:#e8503a;color:#fff;font-size:64px;display:flex;align-items:center;justify-content:center;font-weight:700">Г</div>
  <div><div style="color:#aaa;font-size:36px;font-weight:500">@Глбушек</div><div style="color:#fff;font-size:76px;font-weight:700">А где я? 😢</div></div></div>
 <div style="position:absolute;left:0;right:0;top:640px;text-align:center;line-height:.95">
  <div style="font-size:150px;color:#fff;-webkit-text-stroke:18px #000;paint-order:stroke fill">ВСЕ</div>
  <div style="font-size:300px;color:#ffd23a;-webkit-text-stroke:24px #000;paint-order:stroke fill;letter-spacing:-6px">1 434</div>
  <div style="font-size:116px;color:#fff;-webkit-text-stroke:16px #000;paint-order:stroke fill;margin-top:6px">НИКА ТУТ</div></div>
 <div style="position:absolute;left:50%;top:1320px;transform:translateX(-50%) rotate(2deg);background:#ff2d55;color:#fff;font-size:72px;padding:12px 44px;border-radius:30px;border:7px solid #fff;white-space:nowrap;box-shadow:0 12px 30px rgba(0,0,0,.5)">НАЙДИ СЕБЯ ⏸</div>`;
 st.appendChild(o)},T);
await p.waitForTimeout(600);await p.screenshot({path:OUT});await b.close();srv.close();console.log('Обложка:',OUT);
