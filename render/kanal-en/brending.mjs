// Оформление английского канала «Comment Decides»: аватар 800×800 и шапка 2560×1440 (безопасная зона 1546×423 по центру).
// node render/kanal-en/brending.mjs → gotovo/kanal-en/avatar.png, gotovo/kanal-en/shapka.png
// Рисует теми же 2D-функциями, что и серии «Космодрома» (render/seriya/k02-kosmodrom/video2d.html).
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../..'),OUT=path.join(ROOT,'gotovo/kanal-en');fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:800,height:800}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/k02-kosmodrom/video2d.html`);await p.waitForFunction(()=>window.READY);
// аватар: голова робота Ключа (Key), на экране «$1»
await p.evaluate(()=>{document.getElementById('ov').style.display='none';TT=0;const c=document.getElementById('c');c.width=800;c.height=800;x.setTransform(1,0,0,1,0,0);
 const g=x.createRadialGradient(400,380,60,400,400,560);g.addColorStop(0,'#f8a25a');g.addColorStop(.55,'#b2507a');g.addColorStop(1,'#2a1a4a');x.fillStyle=g;x.fillRect(0,0,800,800);
 for(let i=0;i<40;i++)circ((i*197)%800,(i*331)%330,(i%3+1)*1.6,'rgba(255,255,255,.5)');
 kluch(400,1180,1.75,'1 / 2',{});});
await p.screenshot({path:path.join(OUT,'avatar.png')});
// шапка
await p.setViewportSize({width:2560,height:1440});await p.evaluate(()=>{const c=document.getElementById('c');c.width=2560;c.height=1440;x.setTransform(1,0,0,1,0,0);OFF=0;TT=0;
 const g=x.createLinearGradient(0,0,0,1440);g.addColorStop(0,'#24184a');g.addColorStop(.5,'#b2507a');g.addColorStop(.75,'#f8a25a');x.fillStyle=g;x.fillRect(0,0,2560,1440);
 for(let i=0;i<120;i++)circ((i*997)%2560,(i*571)%600,(i%3+1)*1.8,'rgba(255,255,255,.55)');circ(2120,560,120,'#ffd27a');circ(2120,560,170,'rgba(255,210,122,.25)');
 x.fillStyle='#5a2a5a';x.beginPath();x.moveTo(0,1440);for(let i=0;i<=26;i++)x.lineTo(i*100,930-Math.sin(i*1.7)*50-Math.cos(i*.9)*30);x.lineTo(2560,1440);x.fill();
 x.fillStyle='#d39a5a';x.fillRect(0,1010,2560,430);
 tower(2230,1040,620,.7);rocketE(1980,1040,.75);x.save();x.translate(250,420);x.rotate(-.2);x.beginPath();x.ellipse(0,0,100,92,0,0,7);x.fillStyle='#d9dde2';x.fill();x.strokeStyle=OUT;x.lineWidth=6;x.stroke();x.beginPath();x.ellipse(0,0,80,72,0,0,7);x.strokeStyle='#a9adb6';x.lineWidth=4;x.stroke();txt('$1',0,4,72,'#7a7e86');x.restore();for(let i=0;i<60;i++){const X=(i*263)%2560,Y=1060+((i*137)%360);poly([[X,Y],[X+12,Y-40],[X+24,Y]],'#8a8a3a',OUT,2)}kluch(420,1060,.75,'1 / 2',{armR:-2.3});vera(2420,1060,.62,{helmet:1,armR:-2.4,still:1});vorona(1980,1040-760*.75*.94-200,.7);
 const g2=x.createLinearGradient(0,420,0,1000);g2.addColorStop(0,'rgba(14,10,30,0)');g2.addColorStop(.5,'rgba(14,10,30,.55)');g2.addColorStop(1,'rgba(14,10,30,0)');x.fillStyle=g2;x.fillRect(507,480,1546,480);
 txt('COMMENT DECIDES',1280,615,118,'#ffd860',OUT);
 rr(820,700,920,82,26,'#d8263a','#fff',7);txt('YOU CHOOSE WHAT HAPPENS NEXT',1280,742,44,'#fff');
 txt('ANIMATED SERIES · NEW EPISODE EVERY DAY',1280,850,38,'#fff',OUT)});
await p.screenshot({path:path.join(OUT,'shapka.png')});
await b.close();srv.close();console.log('ok');
