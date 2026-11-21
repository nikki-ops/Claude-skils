// Рендер серии 10. Запуск из корня репозитория:
//   npm i playwright && npx playwright install chromium   (один раз)
//   node render/seriya/10-777-domov/render.mjs            → gotovo/10-777-domov.mp4 (1080x1920, 30 к/с)
//   node render/seriya/10-777-domov/render.mjs --fps 8 --scale 0.5 --out chernovik.mp4   (быстрый черновик)
// Нужен ffmpeg в PATH. Если есть golos/10-777-domov.mp3 — голос подмешивается автоматически.
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30),SC=+arg('scale',1),OUT=path.resolve(ROOT,arg('out','gotovo/10-777-domov.mp4')),EXE=arg('chrome',process.env.CHROME_PATH||undefined),SWS=process.argv.includes('--swiftshader');
const T0=+arg('from',0),T1=arg('to',null);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const port=srv.address().port;
const args=SWS?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-angle=default'];
const b=await chromium.launch({executablePath:EXE,args});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:SC});
p.on('pageerror',e=>console.log('Ошибка страницы:',e.message));
if(process.env.THREE_LOCAL)await p.route('**/three.min.js',r=>r.fulfill({path:process.env.THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${port}/render/seriya/10-777-domov/index.html`);
await p.waitForFunction(()=>{const w=document.getElementById('map').contentWindow;return w&&w.MP},null,{timeout:180000});
await p.waitForTimeout(2500);
const END=T1!=null?+T1:await p.evaluate(()=>window.END),N=Math.round((END-T0)*FPS);
fs.mkdirSync(path.dirname(OUT),{recursive:true});
const voice=path.join(ROOT,'golos/10-777-domov.mp3'),hasV=fs.existsSync(voice)&&T0===0&&!process.argv.includes('--noaudio');
// звук: голос (-14 LUFS) + эффекты по времени голоса + музыка muzyka/10-777-domov.mp3, если есть (тише голоса, с приглушением)
const SFXD=path.join(path.dirname(fileURLToPath(import.meta.url)),'sfx');
const SFX=[[0,'whoosh2',.5],[2.71,'pop',.5],[3.4,'ping',.5],[4.1,'pop',.45],[6.1,'chime',.5],[8.86,'swish',.4],[10.47,'shimmer',.45],[12.48,'thump',.9],[13.8,'shimmer',.5],
[14.78,'swish',.35],[16.89,'swish',.35],[17.86,'swish',.35],[18.98,'whoosh2',.4],[20.36,'chime',.45],[21.53,'pop',.45],[22.56,'pop',.45],[24.57,'pop',.45],[26.77,'swish',.5],[27.3,'pop',.35],[27.8,'pop',.35],
[28.9,'ping',.45],[36.3,'chime',.6],[37.94,'thump',.7],[38.55,'thump',.55],[40.32,'whoosh2',.4]];
const music=path.join(ROOT,'muzyka/10-777-domov.mp3'),hasM=hasV&&fs.existsSync(music)&&fs.existsSync(music.replace(/\.mp3$/,'.litsenziya.md'));
let ain=[],af='';
if(hasV){ain=['-i',voice];const lab=[];SFX.forEach(([t,f,v],i)=>{ain.push('-i',path.join(SFXD,f+'.wav'));af+=`[${i+2}]adelay=${Math.round(t*1000)}|${Math.round(t*1000)},volume=${v}[e${i}];`;lab.push(`[e${i}]`)});
 const vi=1;af=`[${vi}]loudnorm=I=-16:TP=-2,aformat=channel_layouts=stereo,asplit=2[v][vk];`+af;
 if(hasM){ain.push('-i',music);const mi=SFX.length+2;af+=`[${mi}]volume=0.22,afade=t=out:st=${END-1.5}:d=1.5[mr];[mr][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[m];`;lab.push('[m]')}else af+='[vk]anullsink;';
 af+=`[v]${lab.join('')}amix=inputs=${lab.length+1}:normalize=0:duration=first,alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5[a]`}
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...ain,...(hasV?['-filter_complex',af,'-map','0:v','-map','[a]']:[]),'-vf',`scale=${Math.round(1080*SC/2)*2}:${Math.round(1920*SC/2)*2}`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',...(hasV?['-c:a','aac','-b:a','192k','-t',String(END)]:[]),OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();
for(let i=0;i<N;i++){const t=T0+i/FPS;await p.evaluate(t=>window.seek(t),t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
 if(i%FPS===0)process.stdout.write(`\r${(t).toFixed(0)}/${END} с · ${((Date.now()-t0)/1000).toFixed(0)} с прошло`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();
console.log(`\nГотово: ${OUT}${hasV?' (с голосом)':' (без голоса)'}`);
