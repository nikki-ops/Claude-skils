// Рендер шортса «ВСЕ НИКИ» в mp4 (1080×1920, 30 к/с, с голосом golos/13-vse-niki.mp3, если есть timing.js):
//   node render/seriya/13-vse-niki/video.mjs                 → gotovo/13-vse-niki.mp4
//   node render/seriya/13-vse-niki/video.mjs --bez-zvuka     → без голоса
//   node render/seriya/13-vse-niki/video.mjs --kadry 0.3,2.7,7,11   → PNG-кадры в render/_istochniki/13/
// Длительность пролёта — CFG.FLY_SEC в scene.html (6 = демо, 50 = финал); --fly 50 переопределяет без правки файла.
// Рядом с видео пишется <out>-taymkody.txt: «ник — секунда», где он появляется (для закрепа / Telegram).
import http from 'node:http';import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:d};
const FPS=+arg('fps',30),KADRY=arg('kadry',null),FLY=arg('fly',null),OUT=path.join(ROOT,arg('out','gotovo/13-vse-niki.mp4'));
const THREE_LOCAL=process.env.THREE_LOCAL;// путь к three.min.js r128, если cdnjs недоступен
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader',...(process.env.SWGL?['--use-gl=swiftshader']:[])]});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{const x=m.text();if(x.startsWith('['))console.log(x)});
if(THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/13-vse-niki/scene.html?render`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});const ERR=await p.evaluate(()=>window.SCENE_ERR);if(ERR){console.log('Сцена не запустилась:',ERR);await b.close();srv.close();process.exit(1)}
if(FLY)await p.evaluate(f=>{CFG.FLY_SEC=+f;window.DUR=CFG.FLY_SEC+CFG.PHONE_SEC;SUBS=subs()},FLY);
const C=await p.evaluate(()=>({audio:window.T13&&T13.audio,slots:COVER.slots,d:COVER.d,gold:COVER.gold,total:COVER.total,covered:COVER.covered,frames:COVER.frames,missing:COVER.missing,tc:COVER.timecodes,fly:CFG.FLY_SEC,frame:CFG.FRAME,dur:window.DUR}));
console.log(`ников: ${C.total}, показано: ${C.covered}, кадров покрытия: ${C.frames}, слотов пролёта: ${C.slots}, камера d=${C.d}, золотой дом: @${C.gold}, всего ${C.dur.toFixed(2)} с`);
if(C.missing.length)console.log('НЕ ПОПАЛИ:',C.missing.join(', '));
const ink=Math.round(C.fly/C.frame),shown=Object.entries(C.tc).filter(([,s])=>s<C.fly).sort((a,b)=>a[1]-b[1]||a[0].localeCompare(b[0],'ru'));
if(KADRY){const dir=path.join(ROOT,'render/_istochniki/13');fs.mkdirSync(dir,{recursive:true});for(const t of KADRY.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.waitForTimeout(150);await p.screenshot({path:path.join(dir,`k-${String(t).replace('.','_')}.png`)})}
 console.log('кадры →',dir);await b.close();srv.close();process.exit(0)}
fs.mkdirSync(path.dirname(OUT),{recursive:true});
fs.writeFileSync(OUT.replace(/\.mp4$/,'-taymkody.txt'),`# Где искать свой ник (${shown.length} из ${C.total}; пролёт ${C.fly} с)\n`+shown.map(([n,s])=>`${Math.floor(s/60)}:${String((s%60).toFixed(1)).padStart(4,'0')} — @${n}`).join('\n')+'\n');
let AUD=null;const VOICE=C.audio&&fs.existsSync(path.join(ROOT,C.audio))?path.join(ROOT,C.audio):null;
if(!process.argv.includes('--bez-zvuka')){// звук: голос + музыка (muzyka/rost-96bpm.mp3, своя) + SFX сцены → одна дорожка
 const tmp=path.join(ROOT,'render/_istochniki/13');fs.mkdirSync(tmp,{recursive:true});
 fs.writeFileSync(path.join(tmp,'sfx.json'),JSON.stringify(await p.evaluate(()=>sfxList())));
 execFileSync('python3',[path.join(HERE,'zvuk.py'),path.join(tmp,'sfx.json'),String(C.dur),path.join(tmp,'sfx.wav')],{stdio:'inherit'});
 const MUS=path.join(ROOT,'muzyka/rost-96bpm.mp3'),ins=[],fl=[];let k=0;
 if(VOICE){ins.push('-i',VOICE);fl.push(`[${k}:a]aresample=44100,aformat=channel_layouts=stereo,volume=1.0[v]`);k++}
 if(fs.existsSync(MUS)){ins.push('-stream_loop','-1','-i',MUS);fl.push(`[${k}:a]aresample=44100,aformat=channel_layouts=stereo,atrim=0:${C.dur},afade=t=out:st=${(C.dur-1).toFixed(2)}:d=1,volume=0.20[m]`);k++}
 ins.push('-i',path.join(tmp,'sfx.wav'));fl.push(`[${k}:a]volume=0.45[s]`);k++;
 const tags=fl.map(x=>x.match(/\[(\w)\]$/)[0]).join('');
 AUD=path.join(tmp,'mix.wav');execFileSync('ffmpeg',['-v','error','-y',...ins,'-filter_complex',fl.join(';')+`;${tags}amix=inputs=${k}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9`,'-t',String(C.dur),'-ar','44100',AUD],{stdio:'inherit'});
 console.log('звук:',VOICE?'голос + ':'',fs.existsSync(MUS)?'музыка + ':'','SFX →',AUD)}
const N=Math.round(C.dur*FPS);const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(FPS),'-i','-',...(AUD?['-i',AUD,'-map','0:v','-map','1:a','-c:a','aac','-b:a','192k','-shortest']:[]),'-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-r',String(FPS),'-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
const t0=Date.now();let lastK=null,buf=null,shots=0;for(let i=0;i<N;i++){const k=await p.evaluate(t=>window.vkey?vkey(t):Math.random(),i/FPS);if(k!==lastK||!buf){await p.evaluate(t=>seek(t),i/FPS);buf=await p.screenshot({type:'jpeg',quality:92});lastK=k;shots++}if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%60===0)process.stdout.write(`\r${i}/${N} кадров (снимков ${shots}) · ${((Date.now()-t0)/1000).toFixed(0)} с`)}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log(`\nГотово: ${OUT} (${C.dur.toFixed(1)} с${AUD?', с голосом':''}), ников в пролёте: ${shown.length}, снимков ${shots} из ${N}`);
