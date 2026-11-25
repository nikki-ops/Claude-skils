// Серия 1 «Этот дом снесут»: node render/seriya/h01-gorod/video-b.mjs → gotovo/ng01b-chernovik.mp4 (картинка + SFX + музыка; голос добавляется отдельно)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..'),OUT=path.join(ROOT,'gotovo/ng01b-chernovik.mp4');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/h01-gorod/buldozer.html`);await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:300000});
const AP=await p.evaluate(()=>window.audioPlan?audioPlan():null);const TMP=path.join(ROOT,'render/_istochniki/ng01b');fs.mkdirSync(TMP,{recursive:true});fs.writeFileSync(path.join(TMP,'audio.json'),JSON.stringify(AP));
const DUR=await p.evaluate(()=>window.DUR),N=DUR*30;const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/30);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();const {execFileSync}=await import('node:child_process');const SILENT=OUT.replace('.mp4','_noaudio.mp4');fs.renameSync(OUT,SILENT);
execFileSync('python3',[path.join(HERE,'zvuk-snos.py'),path.join(TMP,'audio.json'),path.join(TMP,'sfx.wav')],{stdio:'inherit'});
execFileSync('node',[path.join(ROOT,'render/bolezni/studio/tools/phonk.mjs'),path.join(HERE,'muzyka-plan.json'),path.join(TMP,'music.wav')],{stdio:'inherit'});
execFileSync('ffmpeg',['-v','error','-y','-i',SILENT,'-i',path.join(TMP,'sfx.wav'),'-i',path.join(TMP,'music.wav'),'-filter_complex','[1:a]aresample=44100,aformat=channel_layouts=stereo,volume=0.8[s];[2:a]volume=0.12[m];[s][m]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[a]','-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-shortest',OUT],{stdio:'inherit'});fs.unlinkSync(SILENT);
console.log('Готово:',OUT);
