// Обложка «Район башни»: кадр сцены без субтитров + крупный текст. node oblozhka.mjs <время_видео> <out.png> [tt]
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {chromium}=require('playwright');
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':f.endsWith('.html')?'text/html; charset=utf-8':f.endsWith('.json')?'application/json':'text/javascript'});fs.createReadStream(f).pipe(r)}).listen(0);
await new Promise(r=>srv.on('listening',r));
const b=await chromium.launch({args:['--enable-unsafe-swiftshader','--use-gl=swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});
if(process.env.THREE_LOCAL)await p.route(/three\.min\.js/,r=>r.fulfill({path:process.env.THREE_LOCAL,contentType:'text/javascript'}));
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/rb01-rayon-bashni/scene.html?render`);await p.waitForFunction(()=>window.READY||window.SCENE_ERR,null,{timeout:600000});
const tt=process.argv[4]==='tt',tg=process.argv[4]==='tg';await p.evaluate(t=>seek(t),+process.argv[2]);await p.evaluate(v=>window.__TG=v,tg);
await p.evaluate(tt=>{['sub','big','nick'].forEach(id=>document.getElementById(id).style.display='none');const o=document.createElement('div');const S='-webkit-text-stroke:22px #000;paint-order:stroke fill;line-height:.92;font-family:Rubik,Arial Black,sans-serif;font-weight:900';const top=tt?330:220;
 o.style.cssText='position:absolute;inset:0;text-align:center;pointer-events:none';
 o.innerHTML=`<div style="position:absolute;left:0;right:0;top:${top}px;font-size:150px;color:#fff;${S}">БАШНЯ<br><span style="color:#ffd23a">В КОСМОСЕ</span> 🚀</div>
 <div style="position:absolute;left:0;right:0;top:${tt?1520:1580}px"><span style="display:inline-block;background:#ffd23a;color:#120808;font:900 92px Rubik,Arial Black,sans-serif;padding:12px 40px;border-radius:28px;border:10px solid #120808;transform:rotate(-3deg)">2 132 ЭТАЖА</span></div>`;document.getElementById('stage').appendChild(o);if(window.__TG){const e=document.createElement('div');e.style.cssText='position:absolute;left:0;right:0;top:1730px;text-align:center;white-space:nowrap';e.innerHTML='<span style="display:inline-block;background:#e8283a;color:#fff;font:900 54px Rubik,Arial Black,sans-serif;padding:10px 30px;border-radius:22px;border:8px solid #120808">НОВЫЙ РОЛИК · СЕГОДНЯ 17:00 МСК</span>';document.getElementById('stage').appendChild(e)}},tt);
await p.waitForTimeout(300);await p.screenshot({path:process.argv[3]});await b.close();srv.close();console.log('ok')
