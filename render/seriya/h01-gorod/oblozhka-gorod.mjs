// Обложка серии 1 из кадра сцены (город + бульдозер), без субтитров: node oblozhka-gorod.mjs <время> <выход.png> [tt]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
await new Promise(r=>srv.on('listening',r));
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=swiftshader']});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/h01-gorod/buldozer.html`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});
const t=+process.argv[2],out=process.argv[3],tt=process.argv[4]==='tt';
await p.evaluate(t=>seek(t),t);
await p.evaluate(tt=>{for(const id of['sub','title','timer','tm','card','phone','nicks','steps','bell','cnt'])document.getElementById(id)?.style.setProperty('display','none','important');
 const o=document.createElement('div');o.style.cssText='position:absolute;inset:0;z-index:99;pointer-events:none;font-family:Inter,Arial,sans-serif;font-weight:900;text-align:center';
 const S='-webkit-text-stroke:24px #120808;paint-order:stroke fill;line-height:.92';
 const top=tt?330:230; // TikTok: сверху интерфейс, текст ниже
 o.innerHTML=`<div style="position:absolute;left:0;right:0;top:${top}px;font-size:230px;color:#ff2a1a;${S}">СНОС!</div>
 <div style="position:absolute;left:0;right:0;top:${top+235}px;font-size:110px;color:#fff;${S}">ЭТОГО ГОРОДА</div>
 <div style="position:absolute;left:0;right:0;top:${tt?1330:1420}px"><span style="display:inline-block;background:#ffe23a;color:#120808;font-size:100px;padding:12px 44px;border-radius:28px;border:10px solid #120808;transform:rotate(-3deg)">ЧЕРЕЗ 24 ЧАСА</span></div>`;
 (document.getElementById('stage')||document.body).appendChild(o)},tt);
await p.waitForTimeout(300);await p.screenshot({path:out});await b.close();srv.close();console.log('ok',out);
