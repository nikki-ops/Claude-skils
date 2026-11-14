// Обложки серии 3 (оба варианта): node render/seriya/k03-kosmodrom/oblozhka.mjs → gotovo/k03-kosmodrom-<var>-oblozhka.png (9:16) и -youtube.png (16:9)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();
const TXT={vera:['ЗАРЕВЕЛ…','НА 3 СЕКУНДЫ','БИЛЕТЫ или СЕРЫЙ?'],dengi:['ТРЕЩИНА','ЗА 4 МЛН','СОПЛО или ВЕРА?']};
for(const VAR of ['vera','dengi']){const p=await b.newPage({viewport:{width:1080,height:1920}});
 await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/k03-kosmodrom/video2d.html?var=${VAR}`);await p.waitForFunction(()=>window.READY);
 const scene=(VAR,X0,s)=>{TT=1.3;worldT('dawn');const [X,Y]=standE(X0,H*.84,s,{crack:VAR==='dengi'?1:0});trench(X,H*.84,s);flame(X,Y,620*s,1.3,s);
  if(VAR==='vera'){vera(X0-330*s,H*.9,1.1*s,{goggles:1,armR:-2.6,armL:-2.6,still:1})}else{x.save();const q=1;x.translate(X-20*s,Y-60*s);circ(0,0,130*s,null,'#d8263a',14);x.restore();kluchX(X0-330*s,H*.9,.6*s,'X_X',{soot:1,armL:-2.6,armR:-2.6})}};
 await p.evaluate(([VAR,T,sc])=>{document.getElementById('ov').style.display='none';x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);OFF=0;cam(1,W/2,H/2);(new Function('VAR','X0','s',sc))(VAR,W*.62,1.15);
  x.setTransform(1,0,0,1,0,0);const g=x.createLinearGradient(0,0,0,H*.42);g.addColorStop(0,'rgba(14,10,30,.88)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,W,H*.42);
  txt('КОСМОДРОМ ЗА 1 ₽',W/2,205,96,'#ffd860',OUT);txt(T[0],W/2,365,120,'#fff',OUT);txt(T[1],W/2,500,100,VAR==='vera'?'#ff5a6a':'#ff5a6a',OUT);
  rr(W/2-410,620,820,110,30,'#d8263a','#fff',8);txt(T[2],W/2,677,58,'#fff');rr(60,1700,960,120,30,'#11162a','#2b3556',6);txt('ДЕНЬ 3 ИЗ 30',W/2,1761,58,'#ffd860')},[VAR,TXT[VAR],scene.toString().replace(/^[^{]*\{/,'').replace(/\}$/,'')]);
 await p.screenshot({path:path.join(ROOT,`gotovo/k03-kosmodrom-${VAR}-oblozhka.png`)});
 await p.setViewportSize({width:1920,height:1080});await p.evaluate(([VAR,T,sc])=>{const c=document.getElementById('c');c.width=1920;c.height=1080;x.setTransform(1,0,0,1,0,0);
  x.save();x.translate(760,-620);OFF=0;(new Function('VAR','X0','s',sc))(VAR,W*.62,1.0);x.restore();x.setTransform(1,0,0,1,0,0);
  const g=x.createLinearGradient(0,0,1100,0);g.addColorStop(0,'rgba(14,10,30,.88)');g.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g;x.fillRect(0,0,1920,1080);
  const L=(t,X,Y,sz,f)=>{x.font=`900 ${sz}px Rubik`;x.textAlign='left';x.textBaseline='middle';x.lineJoin='round';x.strokeStyle=OUT;x.lineWidth=sz*.22;x.strokeText(t,X,Y);x.fillStyle=f;x.fillText(t,X,Y)};
  L('КОСМОДРОМ ЗА 1 ₽',80,170,104,'#ffd860');L(T[0],80,330,120,'#fff');L(T[1],80,470,104,'#ff5a6a');rr(80,580,700,100,28,'#d8263a','#fff',8);L(T[2],115,632,54,'#fff');L('ДЕНЬ 3 ИЗ 30',80,770,54,'#ffd860')},[VAR,TXT[VAR],scene.toString().replace(/^[^{]*\{/,'').replace(/\}$/,'')]);
 await p.screenshot({path:path.join(ROOT,`gotovo/k03-kosmodrom-${VAR}-oblozhka-youtube.png`),clip:{x:0,y:0,width:1920,height:1080}});await p.close()}
await b.close();srv.close();console.log('ok');
