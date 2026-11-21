// Рендер серии 3: node render/seriya/k03-kosmodrom/video.mjs --var vera|dengi [--kadry 1,15] [--out ...] → gotovo/k03-kosmodrom-<var>.mp4
//   node render/seriya/k01-kosmodrom/video.mjs --v 2d            → gotovo/k02-kosmodrom-2d.mp4
//   node render/seriya/k01-kosmodrom/video.mjs --v 3d            → gotovo/k02-kosmodrom-3d.mp4
//   --fps 30 (по умолчанию) · --kadry 1,15,37 → только PNG-кадры в render/_istochniki/kosmodrom/kadry-k03/ (проверка)
// Звук: голос golos/k03-kosmodrom-'+VAR+'.mp3 (если есть) + музыка muzyka/trevoga-100bpm.mp3 (лицензия рядом) + эффекты из serija1.js.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const V=arg('v','2d'),VAR=arg('var','vera'),FPS=+arg('fps',30),KADRY=arg('kadry',null),OUT=path.resolve(ROOT,arg('out',`gotovo/k03-kosmodrom-${VAR}.mp4`));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-angle=default']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('Ошибка страницы:',e.message));p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/k03-kosmodrom/video${V}.html?var=${VAR}`);await p.waitForFunction(()=>window.READY,null,{timeout:120000});
const frame=async t=>{await p.evaluate(t=>window.seek(t),t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))};
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/kosmodrom/kadry-k03');fs.mkdirSync(dir,{recursive:true});
 for(const t of KADRY.split(',').map(Number)){await frame(t);const f=path.join(dir,`${V}${VAR?'-'+VAR:''}-${String(t).replace('.','_')}.png`);await p.screenshot({path:f});console.log(f)}await b.close();srv.close();process.exit(0)}
const END=await p.evaluate(()=>window.END),N=Math.round(END*FPS),SFX=await p.evaluate(()=>window.SFXV?window.SFXV():SER.SFX);
const voice=path.join(ROOT,'golos/k03-kosmodrom-'+VAR+'.mp3'),hasV=fs.existsSync(voice)&&true,music=path.join(ROOT,'muzyka/trevoga-100bpm.mp3'),hasM=fs.existsSync(music)&&fs.existsSync(music.replace(/\.mp3$/,'.litsenziya.md'));
const SFXD=path.join(ROOT,'render/seriya/10-777-domov/sfx');let ain=[],fc='',lab=[],k=1;
if(hasV){ain.push('-i',voice);fc+=`[${k}]loudnorm=I=-16:TP=-2,aformat=channel_layouts=stereo[v];`;lab.push('[v]');k++}
if(hasM){ain.push('-stream_loop','-1','-i',music);fc+=`[${k}]volume=${hasV?0.12:0.32},atrim=0:${END},afade=t=in:d=0.5,afade=t=out:st=${END-2}:d=2[m];`;lab.push('[m]');k++}
SFX.forEach(([t,f,v])=>{const w=path.join(SFXD,f+'.wav');if(!fs.existsSync(w))return;ain.push('-i',w);const ms=Math.round(t*1000);fc+=`[${k}]adelay=${ms}|${ms},volume=${(v*.7).toFixed(2)}[e${k}];`;lab.push(`[e${k}]`);k++});
const audio=lab.length?['-filter_complex',fc+`${lab.join('')}amix=inputs=${lab.length}:normalize=0:duration=longest,atrim=0:${END},alimiter=limit=0.9,aresample=48000[a]`,'-map','0:v','-map','[a]','-c:a','aac','-b:a','192k']:[];
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...ain,...audio,'-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-preset','medium','-r',String(FPS),'-t',String(END),'-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();for(let i=0;i<N;i++){await frame(i/FPS);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%(FPS*5)===0)process.stdout.write(`\r${V}: ${(i/FPS).toFixed(0)}/${END} с · ${((Date.now()-t0)/1000).toFixed(0)} с`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log(`\nГотово: ${OUT}${hasV?' (с голосом)':' (без голоса)'}`);
