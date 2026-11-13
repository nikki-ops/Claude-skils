// 12 обложек серий для всех соцсетей (1080×1920) → gotovo/oblozhki-serii/
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),OUT=path.join(ROOT,'gotovo/oblozhki-serii');fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const only=process.argv[2];
for(let n=1;n<=12;n++){if(only&&!only.split(',').includes(String(n)))continue;const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',n,e.message));
 await p.goto(`http://127.0.0.1:${srv.address().port}/render/obuchenie/illustracii.html?id=ep&n=${n}&w=1080&h=1920`);await p.waitForFunction(()=>window.READY,null,{timeout:30000});
 await p.screenshot({path:path.join(OUT,`seriya-${String(n).padStart(2,'0')}.png`)});await p.close()}
await b.close();srv.close();console.log('ok');
