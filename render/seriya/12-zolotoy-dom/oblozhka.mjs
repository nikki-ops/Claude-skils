// Обложка серии 12 «Золотая башня»: node render/seriya/12-zolotoy-dom/oblozhka.mjs [--nik ИМЯ] → gotovo/12-zolotoy-dom-oblozhka.png (9:16) и -youtube.png (16:9)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');const ni=process.argv.indexOf('--nik'),NIK=ni>0?process.argv[ni+1]:'БалгинДоканова';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-angle=default']});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/12-zolotoy-dom/index.html?nik=${encodeURIComponent(NIK)}`);
await p.waitForFunction(()=>{const w=document.getElementById('map').contentWindow;return w&&w.MP},null,{timeout:180000});await p.waitForTimeout(2500);
await p.evaluate(()=>window.seek(11.4));await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await p.addStyleTag({content:'#sub,#plq,#cnt,#nick,#conf,#flash{display:none!important}'});
const T=(nik)=>`<div id="ob" style="position:fixed;inset:0;font-family:Rubik,'Arial Black',sans-serif;font-weight:900;text-align:center;pointer-events:none">
 <div style="position:absolute;left:0;right:0;top:0;height:46%;background:linear-gradient(rgba(14,10,30,.85),rgba(14,10,30,0))"></div>
 <div style="position:absolute;left:0;right:0;top:150px;color:#fff;font-size:80px;line-height:1.05;white-space:nowrap;-webkit-text-stroke:18px #1b1426;paint-order:stroke fill">1000 ПОДПИСЧИКОВ =</div>
 <div style="position:absolute;left:0;right:0;top:265px;color:#ffd860;font-size:136px;line-height:1.05;-webkit-text-stroke:24px #1b1426;paint-order:stroke fill">ЗОЛОТАЯ<br>БАШНЯ</div>
 <div style="position:absolute;left:0;right:0;top:600px"><span style="display:inline-block;background:#d8263a;color:#fff;font-size:58px;padding:14px 40px;border-radius:28px;border:7px solid #fff">100 ЭТАЖЕЙ · КТО ПОЛУЧИЛ?</span></div>
 <div style="position:absolute;left:0;right:0;bottom:120px"><span style="display:inline-block;background:#11162a;color:#ffd860;font-size:54px;padding:18px 44px;border-radius:30px;border:6px solid #2b3556">ЗАСЕЛЯЙСЯ НА СВОЙ ЭТАЖ 👇</span></div></div>`;
await p.evaluate(h=>document.body.insertAdjacentHTML('beforeend',h),T(NIK));await p.waitForTimeout(300);
await p.screenshot({path:path.join(ROOT,'gotovo/12-zolotoy-dom-oblozhka.png')});
await b.close();srv.close();console.log('ok');
