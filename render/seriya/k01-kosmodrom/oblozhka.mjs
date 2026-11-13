// Обложка серии 1 (1080×1920 для Shorts/TikTok/Reels и 1280×720 для YouTube): node render/seriya/k01-kosmodrom/oblozhka.mjs
// Рисуется теми же 2D-функциями, что и видео (video2d.html), поверх — крупный заголовок.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/k01-kosmodrom/video2d.html`);await p.waitForFunction(()=>window.READY);
await p.evaluate(()=>{document.getElementById('ov').style.display='none';x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);
 OFF=0;cam(1.12,W*.45,H*.62,0,-40);world();tower(W*.7,H*.66,640,.8);rocket(W*.0,H*.74,1.0,Math.PI/2+.03);vorona(W*.58,H*.74-66,1.2);
 coin(W*.75,H*.47,110,-.2);kluch(W*.78,H*.9,.62,':)');reset();x.setTransform(1,0,0,1,0,0);
 const g=x.createLinearGradient(0,0,0,H*.4);g.addColorStop(0,'rgba(14,10,30,.75)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,W,H*.4);
 txt('ТЫ КУПИЛ',W/2,250,120,'#fff',OUT);txt('КОСМОДРОМ',W/2,390,128,'#fff',OUT);txt('ЗА 1 ₽',W/2,550,170,'#ffd860',OUT);
 rr(W/2-380,660,760,110,30,'#d8263a','#fff',8);txt('НО ЕСТЬ УСЛОВИЕ…',W/2,717,56,'#fff');
 rr(60,1640,960,130,30,'#11162a','#2b3556',6);txt('30 ДНЕЙ ДО СТАРТА',W/2,1706,70,'#ff4a4a')});
await p.screenshot({path:path.join(ROOT,'gotovo/k01-kosmodrom-oblozhka.png')});
// горизонтальная для YouTube (обычный ролик/плейлист)
await p.setViewportSize({width:1920,height:1080});await p.evaluate(()=>{const c=document.getElementById('c');c.width=1920;c.height=1080;x.setTransform(1,0,0,1,0,0);
 const s=1080/1920;x.save();x.translate(-80,-760*s);x.scale(1,1);world();tower(1250,H*.66,640,.8);rocket(-60,H*.74,1.0,Math.PI/2+.03);vorona(560,H*.74-66,1.2);coin(1700,H*.5,110,-.2);x.restore();
 x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,1100,0);g.addColorStop(0,'rgba(14,10,30,.8)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,1920,1080);
 x.textAlign='left';const T=(t,X,Y,sz,f)=>{x.font=`900 ${sz}px Rubik`;x.textAlign='left';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle=OUT;x.lineWidth=sz*.22;x.strokeText(t,X,Y);x.fillStyle=f;x.fillText(t,X,Y)};
 T('ТЫ КУПИЛ КОСМОДРОМ',80,180,110,'#fff');T('ЗА 1 ₽',80,330,170,'#ffd860');rr(80,450,620,100,28,'#d8263a','#fff',8);T('НО ЕСТЬ УСЛОВИЕ…',120,502,56,'#fff');T('30 ДНЕЙ ДО СТАРТА',80,640,64,'#ff4a4a')});
await p.screenshot({path:path.join(ROOT,'gotovo/k01-kosmodrom-oblozhka-youtube.png'),clip:{x:0,y:0,width:1920,height:1080}});
await b.close();srv.close();console.log('ok');
