// Проба стиля: node render/seriya/h00-proba/video.mjs → gotovo/ng01b-chernovik.mp4 (6 с, без звука)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..'),OUT=path.join(ROOT,'gotovo/ng01b-chernovik.mp4');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/h01-gorod/buldozer.html`);await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:300000});
const DUR=await p.evaluate(()=>window.DUR),N=DUR*30;const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart',OUT],{stdio:['pipe','inherit','inherit']});
for(let i=0;i<N;i++){await p.evaluate(t=>seek(t),i/30);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r))}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();srv.close();console.log('Готово:',OUT);
