// Шортс «Один на Марсе» ~80 с с петлёй: node render/seriya/d04-mars/short80.mjs [--kadry 1,10] [--out gotovo/d04-mars-short80.mp4]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn,execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};const KADRY=arg('kadry',null),FPS=30,OUT=path.join(ROOT,arg('out','gotovo/d04-mars-short80.mp4'));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/short80.html`);await p.waitForFunction(()=>window.READY);
const {DUR,SEG,OFFS,SFX}=await p.evaluate(()=>({DUR:window.DUR,SEG,OFFS:SOFF,SFX:window.SFX}));
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/d04/short80');fs.mkdirSync(dir,{recursive:true});for(const t of KADRY.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.screenshot({path:path.join(dir,`s-${String(t).padStart(5,'0')}.png`)})}await b.close();srv.close();console.log(dir,DUR);process.exit(0)}
// звук: голосовые куски на своих местах + музыка + эффекты
const ins=[],fc=[],lab=[];let k=0;
SEG.forEach(([a,c],j)=>{ins.push('-ss',String(a),'-t',String(c-a),'-i',path.join(ROOT,'golos/d04-mars.mp3'));const ms=Math.round(OFFS[j]*1000);fc.push(`[${k}:a]afade=t=in:d=0.03,afade=t=out:st=${(c-a-.04).toFixed(3)}:d=0.04,adelay=${ms}|${ms},aformat=channel_layouts=stereo[v${k}]`);lab.push(`[v${k}]`);k++});
const music=path.join(ROOT,'muzyka/podlozhka-trevoga.mp3');if(fs.existsSync(music)){ins.push('-stream_loop','-1','-i',music);fc.push(`[${k}:a]volume=0.10,atrim=0:${DUR},afade=t=in:d=0.4,aformat=channel_layouts=stereo[m]`);lab.push('[m]');k++}
const SD=path.join(ROOT,'render/seriya/10-777-domov/sfx');SFX.forEach(([t,f,v])=>{const w=path.join(SD,f+'.wav');if(!fs.existsSync(w))return;ins.push('-i',w);const ms=Math.round(t*1000);fc.push(`[${k}:a]adelay=${ms}|${ms},volume=${(v*.55).toFixed(2)},aformat=channel_layouts=stereo[e${k}]`);lab.push(`[e${k}]`);k++});
const tmp=path.join(ROOT,'render/_istochniki/d04/short80.m4a');
execFileSync('ffmpeg',['-v','error','-y',...ins,'-filter_complex',fc.join(';')+';'+lab.join('')+`amix=inputs=${lab.length}:normalize=0:duration=longest,atrim=0:${DUR},loudnorm=I=-14:TP=-1.5,alimiter=limit=0.95[o]`,'-map','[o]','-c:a','aac','-b:a','192k',tmp]);
const N=Math.round(DUR*FPS);const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-','-i',tmp,'-map','0:v','-map','1:a','-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-r',String(FPS),'-c:a','copy','-t',String(DUR),'-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/FPS);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('Готово:',OUT,DUR.toFixed(1)+' с');
