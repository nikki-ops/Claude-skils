// Снимок 10 ключевых кадров «Один на Марсе»: node render/seriya/d04-mars/kadry.mjs → render/_istochniki/d04/kadr-N.png + list.png
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..'),OUT=path.join(ROOT,'render/_istochniki/d04');fs.mkdirSync(OUT,{recursive:true});
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('console',m=>{if(m.type()==='error')console.log('console:',m.text())});p.on('pageerror',e=>console.log('err',e.message));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/d04-mars/kadry.html`);await p.waitForFunction(()=>window.READY);
const files=[];for(let k=0;k<10;k++){await p.evaluate(k=>shot(k,1.3),k);const f=path.join(OUT,`kadr-${k+1}.png`);await p.screenshot({path:f});files.push(f)}
await b.close();srv.close();
const args=[];files.forEach(f=>args.push('-i',f));execFileSync('ffmpeg',['-v','error','-y',...args,'-filter_complex',files.map((_,i)=>`[${i}]scale=640:360[v${i}]`).join(';')+';'+files.map((_,i)=>`[v${i}]`).join('')+'xstack=inputs=10:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h3|w0_h0+h3|w0+w1_h0+h3|0_h0+h3+h6[o]','-map','[o]',path.join(OUT,'list.png')]);
console.log('ok');
