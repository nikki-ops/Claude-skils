// 3 обложки 16:9 для теста: node render/seriya/d04-mars/oblozhka.mjs → gotovo/d04-mars-oblozhka-A/B/C.png
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/kadry.html`);await p.waitForFunction(()=>window.READY);
const V={
A:()=>{// шлем с трещиной + «1 → 100»
 marsSky('dusk');marsGround(H*.74,'dusk');x.save();x.translate(W*.7,H*1.25);x.scale(2.6,2.6);hero(0,0,1,{helmet:1,eyes:'wide',mouth:'o'});x.restore();
 x.save();x.beginPath();const cx=W*.66,cy=H*.18;[[0,0],[40,50],[10,110],[60,170],[30,240]].forEach((p,i)=>i?x.lineTo(cx+p[0],cy+p[1]):x.moveTo(cx+p[0],cy+p[1]));x.strokeStyle='#fff';x.lineWidth=10;x.stroke();x.restore();
 const g=x.createLinearGradient(0,0,W*.6,0);g.addColorStop(0,'rgba(10,8,20,.85)');g.addColorStop(1,'rgba(10,8,20,0)');x.fillStyle=g;x.fillRect(0,0,W,H);
 L('ОДИН',80,250,190,'#fff');L('НА МАРСЕ',80,430,150,'#ff5a3a');rr(80,540,640,130,30,'rgba(10,14,26,.9)','#ff4a4a',6);L('ДЕНЬ 1 → 100',110,610,84,'#ff4a4a');
 rr(80,720,520,90,20,'#d8263a','#fff',5);L('ВОЗДУХ: 3 %',110,768,58,'#fff')},
B:()=>{// стена 100 чёрточек «кто поставил сотую?»
 interior('dark');rr(W*.05,H*.08,W*.9,H*.84,14,'#3e4e60',OUT,8);for(let i=0;i<100;i++){const c=i%5,r=Math.floor(i/5),X=W*.1+(r%10)*150,Y=H*.42+Math.floor(r/10)*150;if(c<4)line(X+c*22,Y,X+c*22,Y+90,i===99?'#ff4a4a':'rgba(255,255,255,.9)',10);else line(X-10,Y+60,X+90,Y+20,i===99?'#ff4a4a':'rgba(255,255,255,.9)',10)}
 circ(W*.1+9*150+50,H*.42+150+45,95,null,'#ff4a4a',12);L('КТО ПОСТАВИЛ',W*.1,H*.17,96,'#fff');L('СОТУЮ?',W*.1,H*.31,120,'#ff4a4a');kluchM(W*.86,H*1.02,.75,'',{});circ(W*.86+28,H*1.02-290,12,'#ff4a4a')},
C:()=>{// буря, герой и Ключ, «100 ДНЕЙ ОДИН»
 marsSky('storm');marsGround(H*.72,'storm');base(W*.75,H*.82,.7,{lit:1});hero(W*.32,H*1.05,1.5,{helmet:1,visor:1});kluchM(W*.48,H*.98,.8,'>_<',{dust:1});storm(1,.35);hero(W*.32,H*1.05,1.5,{helmet:1,visor:1});kluchM(W*.48,H*.98,.8,'>_<',{dust:1});
 L('100 ДНЕЙ',W*.05,H*.2,170,'#fff');L('ОДИН НА МАРСЕ',W*.05,H*.37,110,'#ffd860');rr(W*.05,H*.47,560,96,20,'rgba(10,14,26,.9)','#ff4a4a',5);L('ЕДА: 40 · НАДО 100',W*.05+30,H*.47+50,48,'#ff4a4a')}};
for(const k of Object.keys(V)){await p.evaluate(src=>{TT=1.4;OFF=0;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);
 window.L=(t,X,Y,sz,f)=>{x.save();x.setTransform(1,0,0,1,0,0);x.font=`900 ${sz}px Rubik`;x.textAlign='left';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle='#0a0a14';x.lineWidth=sz*.2;x.strokeText(t,X,Y);x.fillStyle=f;x.fillText(t,X,Y);x.restore()};
 (new Function(src))()},V[k].toString().replace(/^\(\)=>\{/,'').replace(/\}$/,''));await p.screenshot({path:path.join(ROOT,`gotovo/d04-mars-oblozhka-${k}.png`)})}
await b.close();srv.close();console.log('ok');
