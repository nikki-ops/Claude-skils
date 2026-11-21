// Рендер фильма «Один на Марсе» 16:9: node render/seriya/d04-mars/film.mjs [--fps 30] [--kadry 1,60,300] [--out gotovo/d04-mars.mp4] [--do 120]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn,execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30),KADRY=arg('kadry',null),OUT=path.resolve(ROOT,arg('out','gotovo/d04-mars.mp4')),DO=arg('do',null);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization']});const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/film.html`);await p.waitForFunction(()=>window.READY,null,{timeout:120000});
const frame=async t=>{await p.evaluate(t=>window.seek(t),t)};
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/d04/film');fs.mkdirSync(dir,{recursive:true});for(const t of KADRY.split(',').map(Number)){await frame(t);await p.screenshot({path:path.join(dir,`t-${String(t).padStart(4,'0')}.png`)})}await b.close();srv.close();console.log('кадры:',dir);process.exit(0)}
const END=DO?Math.min(+DO,await p.evaluate(()=>window.END)):await p.evaluate(()=>window.END),N=Math.round(END*FPS);
const voice=path.join(ROOT,'golos/d04-mars.mp3'),music=path.join(ROOT,'muzyka/podlozhka-trevoga.mp3'),hasM=fs.existsSync(music)&&fs.existsSync(music.replace(/\.mp3$/,'.litsenziya.md'));
const ain=['-i',voice];let fc=`[1]loudnorm=I=-16:TP=-2,aformat=channel_layouts=stereo,atrim=0:${END}[v];`,lab='[v]';
if(hasM){ain.push('-stream_loop','-1','-i',music);fc+=`[2]volume=0.08,atrim=0:${END},afade=t=in:d=2,afade=t=out:st=${END-3}:d=3[m];`;lab+='[m]'}
fc+=`${lab}amix=inputs=${hasM?2:1}:normalize=0:duration=first,alimiter=limit=0.9,aresample=48000[a]`;
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...ain,'-filter_complex',fc,'-map','0:v','-map','[a]','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-r',String(FPS),'-t',String(END),'-c:a','aac','-b:a','192k','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();for(let i=0;i<N;i++){await frame(i/FPS);const buf=await p.screenshot({type:'jpeg',quality:90});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%(FPS*30)===0)console.log(`${(i/FPS|0)}/${END|0} с · ${((Date.now()-t0)/1000|0)} с`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('Готово:',OUT);
