// ВКонтакте: шапка сообщества и обложки 1-й серии → gotovo/vk/
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),OUT=path.join(ROOT,'gotovo/vk');fs.mkdirSync(OUT,{recursive:true});
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':'text/html; charset=utf-8'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch();
for(const [id,w,h,name] of [['vk-shapka',1920,768,'vk-shapka-mars-city'],['vk-klip',1080,1920,'vk-oblozhka-klip-seriya-01'],['vk-video',1280,720,'vk-oblozhka-video-seriya-01']]){
 const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>console.log('ERR',id,e.message));
 await p.goto(`http://127.0.0.1:${srv.address().port}/render/obuchenie/illustracii.html?id=${id}&w=${w}&h=${h}`);await p.waitForFunction(()=>window.READY,null,{timeout:30000});
 await p.screenshot({path:path.join(OUT,name+'.png')});await p.close()}
await b.close();srv.close();console.log('ok');
