// (aresample после loudnorm обязателен: иначе amix теряет конец голоса)
// Рендер шортса «Небоскрёб для семьи» (1080×1920, 30 к/с, голос golos/neboskreb.wav + музыка muzyka/trevoga-100bpm.mp3 на ~18 дБ тише + SFX):
//   node render/seriya/neboskreb/video.mjs            → gotovo/neboskreb.mp4
//   node render/seriya/neboskreb/video.mjs --kadry 0.5,3,8,11.5  → PNG в render/_istochniki/neboskreb/
import http from 'node:http';import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30),KADRY=arg('kadry',null),FLY=arg('fly',null),OUT=path.join(ROOT,arg('out','gotovo/neboskreb.mp4'));
const THREE_LOCAL=process.env.THREE_LOCAL;// путь к three.min.js r128, если cdnjs недоступен
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.SWGL?['--use-gl=swiftshader']:[])]});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{const x=m.text();if(x.startsWith('['))console.log(x)});
if(THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/neboskreb/scene.html?render`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});const ERR=await p.evaluate(()=>window.SCENE_ERR);if(ERR){console.log('Сцена не запустилась:',ERR);await b.close();srv.close();process.exit(1)}
const C=await p.evaluate(()=>({dur:window.DUR}));
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/neboskreb');fs.mkdirSync(dir,{recursive:true});for(const t of KADRY.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.waitForTimeout(150);await p.screenshot({path:path.join(dir,`k-${String(t).replace('.','_')}.png`)})}
 console.log('кадры →',dir);await b.close();srv.close();process.exit(0)}
fs.mkdirSync(path.dirname(OUT),{recursive:true});
let AUD=null;const VOICE=(p=>fs.existsSync(p)?p:null)(path.join(ROOT,'golos/neboskreb.wav'));
if(!process.argv.includes('--bez-zvuka')){// звук: голос + музыка (muzyka/rost-96bpm.mp3, своя) + SFX сцены → одна дорожка
 const tmp=path.join(ROOT,'render/_istochniki/neboskreb');fs.mkdirSync(tmp,{recursive:true});
 fs.writeFileSync(path.join(tmp,'sfx.json'),JSON.stringify(await p.evaluate(()=>sfxList())));
 execFileSync('python3',[path.join(HERE,'zvuk.py'),path.join(tmp,'sfx.json'),String(C.dur),path.join(tmp,'sfx.wav')],{stdio:'inherit'});
 const MUS=process.argv.includes('--bez-muzyki')?'/nonexistent':path.join(ROOT,'muzyka/trevoga-100bpm.mp3'),ins=[],fl=[];let k=0;
 if(VOICE){ins.push('-i',VOICE);fl.push(`[${k}:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-15:TP=-2:LRA=7,aresample=44100[v]`);k++}
 if(fs.existsSync(MUS)){ins.push('-stream_loop','-1','-i',MUS);fl.push(`[${k}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${C.dur},afade=t=in:d=0.02,afade=t=out:st=${(C.dur-.03).toFixed(2)}:d=0.03,loudnorm=I=-33:TP=-8,aresample=44100[m]`);k++}
 ins.push('-i',path.join(tmp,'sfx.wav'));fl.push(`[${k}:a]loudnorm=I=-22:TP=-3,aresample=44100[s]`);k++;
 const tags=fl.map(x=>x.match(/\[(\w)\]$/)[0]).join('');
 AUD=path.join(tmp,'mix.wav');execFileSync('ffmpeg',['-v','error','-y',...ins,'-filter_complex',fl.join(';')+`;${tags}amix=inputs=${k}:normalize=0,alimiter=limit=0.89`,'-t',String(C.dur),'-ar','44100',AUD],{stdio:'inherit'});
 console.log('звук:',VOICE?'голос + ':'',fs.existsSync(MUS)?'музыка + ':'','SFX →',AUD)}
const N=Math.round(C.dur*FPS);const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...(AUD?['-i',AUD,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest']:[]),'-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-r',String(FPS),'-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();let lastK=null,buf=null,shots=0;for(let i=0;i<N;i++){const k=await p.evaluate(t=>window.vkey?vkey(t):Math.random(),i/FPS);if(k!==lastK||!buf){await p.evaluate(t=>seek(t),i/FPS);buf=await p.screenshot({type:'jpeg',quality:92});lastK=k;shots++}if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%60===0)process.stdout.write(`\r${i}/${N} кадров (снимков ${shots}) · ${((Date.now()-t0)/1000).toFixed(0)} с`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log(`\nГотово: ${OUT} (${C.dur.toFixed(1)} с${AUD?', музыка + SFX':''}), снимков ${shots} из ${N}`);
