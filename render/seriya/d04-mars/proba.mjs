// Рендер пробной сцены: node render/seriya/d04-mars/proba.mjs [--kadry 563,570] → gotovo/d04-mars-proba-den82.mp4
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};const KADRY=arg('kadry',null),FPS=30,OUT=path.join(ROOT,arg('out','gotovo/d04-mars-proba-den82.mp4'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/proba.html`);await p.waitForFunction(()=>window.READY);
const [T0,T1]=await p.evaluate(()=>[window.T0,window.T1]);
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/d04/proba');fs.mkdirSync(dir,{recursive:true});for(const t of KADRY.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.screenshot({path:path.join(dir,`p-${t}.png`)})}await b.close();srv.close();console.log(dir);process.exit(0)}
const D=T1-T0,N=Math.round(D*FPS);
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-ss',String(T0),'-t',String(D),'-i',path.join(ROOT,'golos/d04-mars.mp3'),'-map','0:v','-map','1:a','-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-r',String(FPS),'-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),T0+i/FPS);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('Готово:',OUT);
