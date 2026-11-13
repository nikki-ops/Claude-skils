// Контрольные кадры: node render/seriya/12-zolotoy-dom/kadry.mjs 0.5,2,4,9 [--nik ИМЯ] → render/_istochniki/12-zolotoy-dom/kadry/
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..'),OUT=path.join(ROOT,'render/_istochniki/12-zolotoy-dom/kadry');fs.mkdirSync(OUT,{recursive:true});
const ts=(process.argv[2]||'0.5,2.2,4,6,8.5,11,13,15,16.5,18,20,22,24.5,27,29.5').split(',').map(Number);const ni=process.argv.indexOf('--nik'),NIK=ni>0?process.argv[ni+1]:'';
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-angle=default']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error'||/нет дома/.test(m.text()))console.log('console:',m.text().slice(0,200))});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/12-zolotoy-dom/index.html${NIK?'?nik='+encodeURIComponent(NIK):''}`);
await p.waitForFunction(()=>{const w=document.getElementById('map').contentWindow;return w&&w.MP},null,{timeout:180000});await p.waitForTimeout(2500);
for(const t of ts){await p.evaluate(t=>window.seek(t),t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));const f=path.join(OUT,`k-${String(t).replace('.','_')}.png`);await p.screenshot({path:f,type:'png'})}
await b.close();srv.close();console.log('ok',OUT);
