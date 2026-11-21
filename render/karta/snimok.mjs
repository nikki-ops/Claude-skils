// Снимок карты сверху: node render/karta/snimok.mjs [out.png] [tx tz d yaw p]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../..');
const [out='karta-sverhu.png',tx,tz,d,yaw,pp]=process.argv.slice(2);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization']});
const p=await b.newPage({viewport:{width:1600,height:1600}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errs.push(m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/karta/index.html?video`);
await p.waitForFunction(()=>window.MP,null,{timeout:180000});await p.waitForTimeout(2500);
const info=await p.evaluate(([tx,tz,d,yaw,pp])=>{const K=MP.K;if(tx!=null){K.tx=+tx;K.tz=+tz;K.d=+d;K.yaw=+(yaw??0);K.p=+(pp??1.45)}MP.draw();
 const L=MAPCFG.list,by={};L.forEach(h=>{const k=h.district||'?';by[k]=(by[k]||0)+1});let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;L.forEach(h=>{if(!h.g)return;const v=h.g.position;x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z)});
 return {n:L.length,by,box:[x0,x1,z0,z1].map(Math.round),K:{...K}}},[tx,tz,d,yaw,pp]);
await p.waitForTimeout(1500);await p.screenshot({path:out});
console.log(JSON.stringify(info));if(errs.length)console.log('ОШИБКИ:\n'+[...new Set(errs)].slice(0,20).join('\n'));
await b.close();srv.close();
