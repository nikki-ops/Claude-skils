// Рендер серии 11. Запуск из корня репозитория:
//   npm i playwright && npx playwright install chromium   (один раз)
//   node render/seriya/11-zahvat/render.mjs --fps 60       → gotovo/11-zahvat.mp4 (1080x1920)
//   node render/seriya/11-zahvat/render.mjs --fps 10 --scale 0.5 --out gotovo/11-zahvat-chernovik.mp4   (черновик)
// Нужен ffmpeg в PATH. Если есть golos/11-zahvat.mp3 — голос (-14 LUFS) + эффекты по времени голоса (+ музыка muzyka/11-zahvat.mp3 при наличии лицензии).
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..'),ID='11-zahvat';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',60),SC=+arg('scale',1),OUT=path.resolve(ROOT,arg('out',`gotovo/${ID}.mp4`)),EXE=arg('chrome',process.env.CHROME_PATH||undefined),SWS=process.argv.includes('--swiftshader');
const T0=+arg('from',0),T1=arg('to',null);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const port=srv.address().port;
const args=SWS?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-angle=default'];
const b=await chromium.launch({executablePath:EXE,args});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:SC});
p.on('pageerror',e=>console.log('Ошибка страницы:',e.message));p.on('console',m=>{if(/нет дома|участков|убрано/.test(m.text()))console.log(m.text())});
await p.goto(`http://127.0.0.1:${port}/render/seriya/${ID}/index.html`);
await p.waitForFunction(()=>{const w=document.getElementById('map').contentWindow;return w&&w.MP},null,{timeout:180000});
await p.waitForTimeout(2500);await p.evaluate(()=>window.seek(0));await p.waitForTimeout(500);
const END=T1!=null?+T1:await p.evaluate(()=>window.END),N=Math.round((END-T0)*FPS);
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const voice=path.join(ROOT,`golos/${ID}.mp3`),hasV=fs.existsSync(voice)&&T0===0&&!process.argv.includes('--noaudio');
// звук: голос (-14 LUFS) + эффекты (их время сцены переведено во время голоса) + музыка с лицензией, тише голоса и с приглушением
const SFXD=path.join(HERE,'../10-777-domov/sfx'),SFX=await p.evaluate(()=>window.SFXV());
const music=path.join(ROOT,`muzyka/${ID}.mp3`),hasM=hasV&&fs.existsSync(music)&&fs.existsSync(music.replace(/\.mp3$/,'.litsenziya.md'));
let ain=[],af='';
if(hasV){ain=['-i',voice];const lab=[];SFX.forEach(([t,f,v],i)=>{ain.push('-i',path.join(SFXD,f+'.wav'));const ms=Math.max(0,Math.round(t*1000));af+=`[${i+2}]adelay=${ms}|${ms},volume=${(v*.6).toFixed(2)}[e${i}];`;lab.push(`[e${i}]`)});
 af=`[1]loudnorm=I=-16:TP=-2,aformat=channel_layouts=stereo,volume='if(between(t,34.4,35.3),1.35,1)':eval=frame,asplit=2[v][vk];`+af+`${lab.join('')}amix=inputs=${lab.length}:normalize=0,highpass=f=60,equalizer=f=220:t=h:w=200:g=5[sx];`;lab.length=0;lab.push('[sx]');
 if(hasM){ain.push('-i',music);const mi=SFX.length+2;af+=`[${mi}]volume=0.13,volume='if(between(t,16.40,16.74)+between(t,31.40,32.66),0,1)':eval=frame,afade=t=out:st=${END-1.5}:d=1.5[mr];[mr][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[m];`;lab.push('[m]')}else af+='[vk]anullsink;';
 af+=`[v]${lab.join('')}amix=inputs=${lab.length+1}:normalize=0:duration=first,alimiter=limit=0.89,loudnorm=I=-15:TP=-2,aresample=48000[a]`}
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...ain,...(hasV?['-filter_complex',af,'-map','0:v','-map','[a]']:[]),'-vf',`scale=${Math.round(1080*SC/2)*2}:${Math.round(1920*SC/2)*2}`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium',...(hasV?['-c:a','aac','-b:a','192k','-ar','48000','-t',String(END)]:[]),'-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();
for(let i=0;i<N;i++){const t=T0+i/FPS;await p.evaluate(t=>window.seek(t),t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
 if(i%FPS===0)process.stdout.write(`\r${(t).toFixed(0)}/${END} с · ${((Date.now()-t0)/1000).toFixed(0)} с прошло`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();
console.log(`\nГотово: ${OUT}${hasV?' (с голосом)':' (без голоса)'}`);
