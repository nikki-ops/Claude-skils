// Обложка шортса 80 с: node render/seriya/d04-mars/s80-oblozhka.mjs → gotovo/d04-mars-short80-oblozhka.png
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/short80.html`);await p.waitForFunction(()=>window.READY);
await p.evaluate(()=>{TT=4;_st(1,0,0,1,0,0);x.clearRect(0,0,VW,VH);scene(ST(9)+3,9,0);motes(20);_st(1,0,0,1,0,0);
 const g=x.createLinearGradient(0,0,0,VH*.45);g.addColorStop(0,'rgba(8,6,16,.88)');g.addColorStop(1,'rgba(8,6,16,0)');x.fillStyle=g;x.fillRect(0,0,VW,VH*.45);
 const T=(s,y,sz,c)=>{x.font=`900 ${sz}px Rubik`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle='#0a0a14';x.lineWidth=sz*.22;x.strokeText(s,VW/2,y);x.fillStyle=c;x.fillText(s,VW/2,y)};
 T('ТЕБЯ ЗАБЫЛИ',230,120,'#fff');T('НА МАРСЕ',370,140,'#ff5a3a');x.font="900 54px Rubik";const s='ВОЗДУХА НА 30 ДНЕЙ';const w=x.measureText(s).width+80;rr(VW/2-w/2,480,w,100,28,'#d8263a','#fff',6);x.fillStyle='#fff';x.fillText(s,VW/2,532);T('КОРАБЛЬ — ЧЕРЕЗ 100',660,64,'#ffd860')});
await p.screenshot({path:path.join(ROOT,'gotovo/d04-mars-short80-oblozhka.png')});await b.close();srv.close();console.log('ok');
