// Авы для TikTok-канала «Огородные страсти»: node render/seriya/o01-ogorod/ava.mjs → gotovo/ogorod-kanal/ava-1..3.png (1080×1080, круг-безопасная зона)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..'),OUT=path.join(ROOT,'gotovo/ogorod-kanal');fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1080}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/o01-ogorod/video2d.html`);await p.waitForFunction(()=>window.READY);
await p.evaluate(()=>{document.getElementById('ov').style.display='none';const c=document.getElementById('c');c.width=1080;c.height=1080;});
const AVA=[
 // 1: Огурец в банке — в солнечных очках и бабочке, «ну и что, что солёный»
 ()=>{const bg=(a,b)=>{const g=x.createRadialGradient(540,540,60,540,540,620);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,1080,1080)};bg('#ffe27a','#f2a23a');
  for(let i=0;i<16;i++){x.save();x.translate(540,540);x.rotate(i/16*6.283+.1);x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(0,0);x.lineTo(700,-60);x.lineTo(700,60);x.fill();x.restore()}
  OFF=0;x.setTransform(1,0,0,1,0,0);jar(540,980,1.75,{twist:1,label:'СОЛЁНЫЙ',ly:150});x.save();x.translate(540,980-1.75*30);x.scale(1.75*.62,1.75*.62);
  rr(-95,-375,190,60,24,'#141018',EYE,5);line(-95,-350,-130,-360,EYE,8);line(95,-350,130,-360,EYE,8);x.restore()},
 // 2: Помидорка в фате кричит «А-А-А»
 ()=>{const g=x.createRadialGradient(540,540,60,540,540,620);g.addColorStop(0,'#8fe0ff');g.addColorStop(1,'#3a8ad8');x.fillStyle=g;x.fillRect(0,0,1080,1080);
  for(let i=0;i<10;i++){const a=i/10*6.283;line(540+Math.cos(a)*380,560+Math.sin(a)*380,540+Math.cos(a)*500,560+Math.sin(a)*500,'#fff',16)}
  OFF=0;x.setTransform(1,0,0,1,0,0);pomidorka(540,1060,2.6,{wide:1,mouth:{o:1},armL:2.6,armR:-2.6,veilFly:.2})},
 // 3: Перчик с усами, розой в зубах и кольцом — «злодей-романтик»
 ()=>{const g=x.createRadialGradient(540,540,60,540,540,620);g.addColorStop(0,'#ff8ab8');g.addColorStop(1,'#a8204a');x.fillStyle=g;x.fillRect(0,0,1080,1080);
  for(let i=0;i<12;i++){const q=i/12;x.save();x.translate(140+((i*317)%800),120+((i*211)%820));x.globalAlpha=.35;txt('♥',0,0,90,'#fff');x.restore()}
  OFF=0;x.setTransform(1,0,0,1,0,0);perchik(540,1000,1.95,{ring:1,armR:-1.6,mouth:{smirk:1},look:1})}];
for(let i=0;i<AVA.length;i++){await p.evaluate(s=>{TT=.6;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,1080,1080);(new Function(s))()},AVA[i].toString().replace(/^\(\)=>\{/,'').replace(/\}$/,''));
 await p.screenshot({path:path.join(OUT,`ava-${i+1}.png`)})}
await b.close();srv.close();console.log('ok');
