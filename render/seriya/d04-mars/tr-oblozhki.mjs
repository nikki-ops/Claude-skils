// Обложки для 3 шортс-трейлеров: node render/seriya/d04-mars/tr-oblozhki.mjs → gotovo/d04-mars-trailer-N-oblozhka.png (1080×1920)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();
const C={1:{sc:'sc1',i:146,t:'ST(146)+1.2',l1:'ВОЗДУХ',l2:'УХОДИТ',c2:'#ff4a4a',pill:'14 ДНЕЙ · КОРАБЛЬ ЧЕРЕЗ 33',day:'ДЕНЬ 67'},
 2:{sc:'sc2',i:79,t:'ST(79)+1',l1:'СТЕНА ПЫЛИ',l2:'ЗАКРЫЛА СОЛНЦЕ',c2:'#ffb040',pill:'ЭНЕРГИЯ: 8 %',day:'ДЕНЬ 31'},
 3:{sc:'sc3',i:127,t:'ST(127)+1',l1:'С КЕМ ОН',l2:'ГОВОРИТ НОЧЬЮ?',c2:'#5dff8a',pill:'> SOUTH · LINK OK',day:'ДЕНЬ 55'}};
for(const n of [1,2,3]){const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/trailer.html?n=${n}`);await p.waitForFunction(()=>window.READY);
 await p.evaluate(o=>{TT=3.3;_st(1,0,0,1,0,0);x.clearRect(0,0,VW,VH);const t=eval(o.t);window[o.sc](t,o.i);motes(20);_st(1,0,0,1,0,0);
  const g=x.createLinearGradient(0,0,0,VH*.5);g.addColorStop(0,'rgba(8,6,16,.85)');g.addColorStop(1,'rgba(8,6,16,0)');x.fillStyle=g;x.fillRect(0,0,VW,VH*.5);
  const T=(s,y,sz,c)=>{x.font=`900 ${sz}px Rubik`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle='#0a0a14';x.lineWidth=sz*.22;x.strokeText(s,VW/2,y);x.fillStyle=c;x.fillText(s,VW/2,y)};
  T('ОДИН НА МАРСЕ · 100 ДНЕЙ',150,46,'#ffd860');T(o.l1,330,o.l1.length>9?130:150,'#fff');T(o.l2,490,o.l2.length>11?104:130,o.c2);
  x.font="900 52px Rubik";const w=x.measureText(o.pill).width+90;rr(VW/2-w/2,600,w,104,30,'#d8263a','#fff',6);x.fillStyle='#fff';x.fillText(o.pill,VW/2,654);
  rr(VW/2-200,VH*.7,400,110,24,'rgba(10,14,26,.9)','#ff4a4a',6);x.font="900 70px 'Courier New',monospace";x.fillStyle='#ff4a4a';x.fillText(o.day,VW/2,VH*.7+58)},C[n]);
 await p.screenshot({path:path.join(ROOT,`gotovo/d04-mars-trailer-${n}-oblozhka.png`)});await p.close()}
await b.close();srv.close();console.log('ok');
