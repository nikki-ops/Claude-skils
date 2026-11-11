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
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...(hasV?['-i',voice]:[]),'-vf',`scale=${Math.round(1080*SC/2)*2}:${Math.round(1920*SC/2)*2}`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','18','-preset','medium',...(hasV?['-c:a','aac','-b:a','192k','-shortest']:[]),OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();
for(let i=0;i<N;i++){const t=T0+i/FPS;await p.evaluate(t=>window.seek(t),t);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
 if(i%FPS===0)process.stdout.write(`\r${(t).toFixed(0)}/${END} с · ${((Date.now()-t0)/1000).toFixed(0)} с прошло`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();
console.log(`\nГотово: ${OUT}${hasV?' (с голосом)':' (без голоса)'}`);
