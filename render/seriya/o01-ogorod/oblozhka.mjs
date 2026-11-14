// Обложка пилота «Огородные страсти»: node render/seriya/o01-ogorod/oblozhka.mjs → gotovo/o01-ogorod-oblozhka.png (9:16) и -youtube.png (16:9)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/o01-ogorod/video2d.html`);await p.waitForFunction(()=>window.READY);
await p.evaluate(()=>{document.getElementById('ov').style.display='none';TT=.4;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);OFF=0;
 garden();focus(1.35,W*.5,GY-260,1120);pomidorka(W*.3,GY,1.2,{wide:1,mouth:{o:1},armL:2.6,armR:-2.6,veilFly:.3});jar(W*.73,GY,.85,{twist:1});x.save();x.setTransform(1,0,0,1,0,0);lines(W*.3,980,0);x.restore();
 x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,0,H*.4);g.addColorStop(0,'rgba(14,10,30,.85)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,W,H*.4);
 txt('ОГОРОДНЫЕ СТРАСТИ',W/2,190,70,'#ffd860',EYE);txt('ЖЕНИХ —',W/2,350,130,'#fff',EYE);txt('СОЛЁНЫЙ?!',W/2,500,140,'#ff5a6a',EYE);
 rr(W/2-200,1700,400,110,30,'#3aa04a','#fff',8);txt('ЧАСТЬ 1',W/2,1757,62,'#fff')});
await p.screenshot({path:path.join(ROOT,'gotovo/o01-ogorod-oblozhka.png')});
await p.setViewportSize({width:1920,height:1080});await p.evaluate(()=>{const c=document.getElementById('c');c.width=1920;c.height=1080;x.setTransform(1,0,0,1,0,0);OFF=0;
 OFF=-560;garden();x.setTransform(1,0,0,1,820,-560);pomidorka(W*.35,GY,1.05,{wide:1,mouth:{o:1},armL:2.6,armR:-2.6});jar(W*.85,GY,.8,{twist:1});OFF=0;
 x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,1100,0);g.addColorStop(0,'rgba(14,10,30,.88)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,1920,1080);
 const L=(t,X,Y,sz,f)=>{x.font=`900 ${sz}px Rubik`;x.textAlign='left';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle=EYE;x.lineWidth=sz*.22;x.strokeText(t,X,Y);x.fillStyle=f;x.fillText(t,X,Y)};
 L('ОГОРОДНЫЕ СТРАСТИ',80,170,72,'#ffd860');L('ЖЕНИХ —',80,330,130,'#fff');L('СОЛЁНЫЙ?!',80,480,140,'#ff5a6a');rr(80,600,360,100,28,'#3aa04a','#fff',8);L('ЧАСТЬ 1',125,652,58,'#fff')});
await p.screenshot({path:path.join(ROOT,'gotovo/o01-ogorod-oblozhka-youtube.png'),clip:{x:0,y:0,width:1920,height:1080}});await b.close();srv.close();console.log('ok');
