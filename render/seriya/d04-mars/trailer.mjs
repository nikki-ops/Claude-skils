// Шортс-трейлеры «Один на Марсе»: node render/seriya/d04-mars/trailer.mjs --n 1|2|3 [--kadry 1,5,10] → gotovo/d04-mars-trailer-N.mp4
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn,execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};const NN=arg('n','1'),KADRY=arg('kadry',null),FPS=30,OUT=path.join(ROOT,`gotovo/d04-mars-trailer-${NN}${arg('suf','')}.mp4`);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/trailer.html?n=${NN}`);await p.waitForFunction(()=>window.READY);
const [DUR,SEG]=await p.evaluate(()=>[window.DUR,window.SEG]);
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/d04/trailer');fs.mkdirSync(dir,{recursive:true});for(const t of KADRY.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.screenshot({path:path.join(dir,`t${NN}-${String(t).padStart(5,'0')}.png`)})}await b.close();srv.close();console.log(dir);process.exit(0)}
// звук: склейка кусков голоса + тишина под финальную карточку
const tmp=path.join(ROOT,`render/_istochniki/d04/tr${NN}.m4a`);const ins=[],fc=[];SEG.forEach(([a,c],k)=>{ins.push('-ss',String(a),'-t',String(c-a),'-i',path.join(ROOT,'golos/d04-mars.mp3'));fc.push(`[${k}:a]afade=t=in:d=0.05,afade=t=out:st=${(c-a-.08).toFixed(2)}:d=0.08[a${k}]`)});
execFileSync('ffmpeg',['-v','error','-y',...ins,'-filter_complex',fc.join(';')+';'+SEG.map((_,k)=>`[a${k}]`).join('')+`concat=n=${SEG.length}:v=0:a=1,apad=pad_dur=3,loudnorm=I=-15:TP=-1.5[o]`,'-map','[o]','-t',String(DUR),'-c:a','aac','-b:a','160k',tmp]);
const N=Math.round(DUR*FPS);const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-i',tmp,'-map','0:v','-map','1:a','-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-r',String(FPS),'-c:a','copy','-t',String(DUR),'-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('Готово:',OUT,DUR.toFixed(1)+' с');
