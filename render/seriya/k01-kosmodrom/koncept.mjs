// Концепт-кадры «Космодром за 1 рубль»: node render/seriya/k01-kosmodrom/koncept.mjs → gotovo/k01-kosmodrom-koncept-*.png
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization']});
const SH=[[1,1920,1080,'geroi'],[2,1080,1920,'kadr-huk'],[3,1080,1920,'kadr-kluch'],[4,1080,1920,'kadr-raketa'],[5,1080,1920,'kadr-vybor']];
for(const [s,w,h,name] of SH){const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>console.log('ERR',s,e.message));
 await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/k01-kosmodrom/koncept.html?shot=${s}&w=${w}&h=${h}`);await p.waitForFunction(()=>window.READY,null,{timeout:60000});await p.waitForTimeout(400);
 const out=path.join(ROOT,`gotovo/k01-kosmodrom-koncept-${name}.png`);await p.screenshot({path:out});console.log(out);await p.close()}
await b.close();srv.close();
