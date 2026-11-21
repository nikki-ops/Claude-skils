// Шапка YouTube 2560×1440 → gotovo/oblozhki-serii/youtube-shapka.png (+ превью безопасной зоны)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:2560,height:1440}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/obuchenie/illustracii.html?id=yt-shapka&w=2560&h=1440`);await p.waitForFunction(()=>window.READY,null,{timeout:30000});
await p.screenshot({path:path.join(ROOT,'gotovo/oblozhki-serii/youtube-shapka.png')});
await p.evaluate(()=>{x.strokeStyle='#00ff88';x.lineWidth=6;x.setLineDash([20,14]);x.strokeRect(507,509,1546,423)});await p.screenshot({path:path.join(ROOT,'render/_istochniki/yt-shapka-zona.png')});
await b.close();srv.close();console.log('ok');
