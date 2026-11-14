// Обложки серии 2: 1080×1920 (Shorts/TikTok) и 1280×720-пропорция 1920×1080 (YouTube). node render/seriya/k02-kosmodrom/oblozhka.mjs
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/k02-kosmodrom/video2d.html`);await p.waitForFunction(()=>window.READY);
await p.evaluate(()=>{document.getElementById('ov').style.display='none';TT=0;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);OFF=0;
 cam(1,W/2,H/2);world();tower(W*.86,H*.7,640,.8);rocketE(W*.72,H*.8,.85);vera(W*.34,H*.86,1.25,{helmet:1,armR:-2.4,still:1});
 seryi(W*.86,H*.9,.7);briefcase(W*.62,H*.9,.85,1);reset();x.setTransform(1,0,0,1,0,0);
 const g=x.createLinearGradient(0,0,0,H*.42);g.addColorStop(0,'rgba(14,10,30,.85)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,W,H*.42);
 txt('ЗА 1 ₽',W/2,200,150,'#ffd860',OUT);txt('БАБУШКЕ 71 ГОД',W/2,360,100,'#fff',OUT);txt('ЛЕТИТ В КОСМОС?',W/2,490,90,'#fff',OUT);
 rr(W/2-400,640,800,110,30,'#d8263a','#fff',8);txt('РАКЕТА или 5 МЛН?',W/2,697,60,'#fff');
 rr(60,1700,960,120,30,'#11162a','#2b3556',6);txt('КОСМОДРОМ · ДЕНЬ 2 ИЗ 30',W/2,1761,58,'#ffd860')});
await p.screenshot({path:path.join(ROOT,'gotovo/k02-kosmodrom-oblozhka-v2.png')});
await p.setViewportSize({width:1920,height:1080});await p.evaluate(()=>{const c=document.getElementById('c');c.width=1920;c.height=1080;x.setTransform(1,0,0,1,0,0);
 x.save();x.translate(820,-520);world();tower(820,H*.7,640,.8);rocketE(560,H*.8,.75);vera(170,H*.86,1.0,{helmet:1,armR:-2.4,still:1});seryi(980,H*.9,.7);briefcase(770,H*.9,.85,1);x.restore();
 x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,1000,0);g.addColorStop(0,'rgba(14,10,30,.85)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,1920,1080);
 const T=(t,X,Y,sz,f)=>{x.font=`900 ${sz}px Rubik`;x.textAlign='left';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle=OUT;x.lineWidth=sz*.22;x.strokeText(t,X,Y);x.fillStyle=f;x.fillText(t,X,Y)};
 T('ЗА 1 ₽',80,170,150,'#ffd860');T('БАБУШКЕ 71 ГОД',80,330,96,'#fff');T('ЛЕТИТ В КОСМОС?',80,450,96,'#fff');rr(80,570,640,100,28,'#d8263a','#fff',8);T('РАКЕТА или 5 МЛН?',115,622,54,'#fff');T('КОСМОДРОМ · ДЕНЬ 2 ИЗ 30',80,760,54,'#ffd860')});
await p.screenshot({path:path.join(ROOT,'gotovo/k02-kosmodrom-oblozhka-youtube-v2.png'),clip:{x:0,y:0,width:1920,height:1080}});
await b.close();srv.close();console.log('ok');
