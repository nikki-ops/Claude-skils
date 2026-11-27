// Обложка «Купол треснул»: node render/seriya/kupol-01/oblozhka.mjs → gotovo/kupol-01-cover.png (кадр с трещиной над городом, крупно «КУПОЛ ТРЕСНУЛ»)
//   node render/seriya/kupol-01/video.mjs            → gotovo/kupol-01.mp4
//   node render/seriya/kupol-01/video.mjs --kadry 0.5,3,8,11.5  → PNG в render/_istochniki/kupol-01/
import http from 'node:http';import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30),KADRY=arg('kadry',null),FLY=arg('fly',null),OUT=path.join(ROOT,arg('out','gotovo/kupol-01.mp4'));
const THREE_LOCAL=process.env.THREE_LOCAL;// путь к three.min.js r128, если cdnjs недоступен
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.SWGL?['--use-gl=swiftshader']:[])]});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{const x=m.text();if(x.startsWith('['))console.log(x)});
if(THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/kupol-01/scene.html?render`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});const ERR=await p.evaluate(()=>window.SCENE_ERR);if(ERR){console.log('Сцена не запустилась:',ERR);await b.close();srv.close();process.exit(1)}


const TT=process.argv.includes('--t')?+process.argv[process.argv.indexOf('--t')+1]:0.9,PL=process.argv.includes('--pl')?process.argv[process.argv.indexOf('--pl')+1]:'❤️ ЛАЙК = ЗАПЛАТКА',OUTN=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:'gotovo/kupol-01-cover.png',PY=process.argv.includes('--py')?+process.argv[process.argv.indexOf('--py')+1]:1480;
await p.evaluate(([TT,PL,PY])=>{seek(TT);document.querySelectorAll('#title,#sub,#cm,#cnt,#lk,#board,#flash,#lbl').forEach(e=>e.style.display='none');
 const st=document.createElement('style');st.textContent=`.cv{position:absolute;left:60px;width:870px;text-align:center;z-index:9000;font-family:Rubik,'Arial Black',Arial,sans-serif;font-weight:900}
 #c1{top:420px;font-size:150px;line-height:.98;color:#fff;-webkit-text-stroke:24px #141829;paint-order:stroke fill}#c1 b{color:#f7c24a}
 #c2{top:${PY}px}#c2 span{display:inline-block;background:#d8263a;color:#fff;border:10px solid #141829;border-radius:34px;padding:12px 30px;font-size:54px;transform:rotate(-2deg);box-shadow:0 14px 0 #141829;white-space:nowrap}`;
 document.head.appendChild(st);document.getElementById('stage').insertAdjacentHTML('beforeend','<div class="cv" id="c1">КУПОЛ<br><b style="color:#ff4a5a">ТРЕСНУЛ</b></div><div class="cv" id="c2"><span>'+PL+'</span></div>')},[TT,PL,PY]);
await p.waitForTimeout(800);const OB=path.join(ROOT,OUTN);await p.screenshot({path:OB});console.log('обложка →',OB);await b.close();srv.close();
