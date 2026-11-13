// Рендер 17 иллюстраций обучения: node render/obuchenie/illustracii.mjs → gotovo/obuchenie/img/NN-*.png (2560×1200)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../..'),OUT=path.join(ROOT,'gotovo/obuchenie/img');fs.mkdirSync(OUT,{recursive:true});
const N=['01-kot-mer','02-checklist','03-put','04-klyuch','05-terminal','06-instrumenty','07-papki','08-geroi','09-scenariy','10-golos','11-prompt','12-sborka','13-oshibki','14-publikaciya','15-dannye','16-telegram','17-dalshe'];
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();const only=process.argv[2];
for(const n of N){const id=n.slice(0,2);if(only&&!only.split(',').includes(id))continue;const p=await b.newPage({viewport:{width:1280,height:600},deviceScaleFactor:2});p.on('pageerror',e=>console.log('ERR',id,e.message));
 await p.goto(`http://127.0.0.1:${srv.address().port}/render/obuchenie/illustracii.html?id=${id}`);await p.waitForFunction(()=>window.READY,null,{timeout:30000});await p.screenshot({path:path.join(OUT,n+'.png')});await p.close()}
await b.close();srv.close();console.log('ok');
