// Обложка серии 17: node render/seriya/17-naydi-svoy-dom/oblozhka.mjs → gotovo/17-naydi-svoy-dom-oblozhka.png (кадр золотой волны + крупный текст)
//   node render/seriya/17-naydi-svoy-dom/video.mjs            → gotovo/17-naydi-svoy-dom.mp4
//   node render/seriya/17-naydi-svoy-dom/video.mjs --kadry 0.5,3,8,11.5  → PNG в render/_istochniki/17-naydi-svoy-dom/
import http from 'node:http';import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30),KADRY=arg('kadry',null),FLY=arg('fly',null),OUT=path.join(ROOT,arg('out','gotovo/17-naydi-svoy-dom.mp4'));
const THREE_LOCAL=process.env.THREE_LOCAL;// путь к three.min.js r128, если cdnjs недоступен
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.SWGL?['--use-gl=swiftshader']:[])]});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{const x=m.text();if(x.startsWith('['))console.log(x)});
if(THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/17-naydi-svoy-dom/scene.html?render`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});const ERR=await p.evaluate(()=>window.SCENE_ERR);if(ERR){console.log('Сцена не запустилась:',ERR);await b.close();srv.close();process.exit(1)}

await p.evaluate(()=>{seek(9.6);document.querySelectorAll('#head,#tg,#cnt,.pl,#flash').forEach(e=>e.style.display='none');
 const st=document.createElement('style');st.textContent=`.cv{position:absolute;left:0;right:0;text-align:center;z-index:9000;font-family:Rubik,'Arial Black',Arial,sans-serif;font-weight:900}
 #c1{top:150px;font-size:150px;line-height:.98;color:#fff;-webkit-text-stroke:22px #000;paint-order:stroke fill}#c1 b{color:#ffd23a}
 #c2{top:1430px}#c2 span{display:inline-block;background:#2aa3e0;color:#fff;border:10px solid #000;border-radius:34px;padding:16px 34px;font-size:60px;white-space:nowrap;transform:rotate(-2deg);box-shadow:0 14px 0 #000}`;
 document.head.appendChild(st);const s=document.getElementById('stage');
 s.insertAdjacentHTML('beforeend','<div class="cv" id="c1">НАЙДИ<br><b>СВОЙ ДОМ</b> 🔍</div><div class="cv" id="c2"><span>🗺 КАРТА С КАЖДЫМ НИКОМ</span></div>')});
await p.waitForTimeout(800);const OB=path.join(ROOT,'gotovo/17-naydi-svoy-dom-oblozhka.png');await p.screenshot({path:OB});console.log('обложка →',OB);await b.close();srv.close();
