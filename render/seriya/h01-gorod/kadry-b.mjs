// Кадры сцены в PNG: node render/seriya/u01-40-km-do-mamy/kadry.mjs 1,3,5,15,24  → render/_istochniki/ng01b/
// Нужен three.js 0.160 в render/_istochniki/three (npm pack three@0.160.0, распаковать build/ и examples/).
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-unsafe-swiftshader','--use-gl=swiftshader']});
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});p.on('pageerror',e=>console.log('Ошибка:',e.message));p.on('console',m=>{if(/ERR|error/i.test(m.text()))console.log(m.text())});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/h01-gorod/buldozer.html`);
await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});const E=await p.evaluate(()=>window.SCENE_ERR);if(E){console.log(E);process.exit(1)}
const dir=path.join(ROOT,'render/_istochniki/ng01b');fs.mkdirSync(dir,{recursive:true});
for(const t of (process.argv[2]||'0.5,2,3.8,5.5').split(',').map(Number)){const t0=Date.now();await p.evaluate(t=>seek(t),t);await p.screenshot({path:path.join(dir,`k-${String(t).replace('.','_')}.png`)});console.log('кадр',t,((Date.now()-t0)/1000).toFixed(1)+'с')}
await b.close();srv.close();
