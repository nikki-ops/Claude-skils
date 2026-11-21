// Обложки серии 11 из чистых кадров сцены (без субтитров и плашек видео) + крупный текст Rubik 900.
// Запуск из корня репозитория: node render/seriya/11-zahvat/oblozhka.mjs → gotovo/11-zahvat-oblozhka-a|b|c.png (1080×1920)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';const require=createRequire(import.meta.url);
let chromium;try{({chromium}=await import('playwright'))}catch{({chromium}=require('playwright'))}
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
const srv=http.createServer((q,r)=>{const f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(0);
const b=await chromium.launch({args:['--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-angle=default']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto(`http://127.0.0.1:${srv.address().port}/render/seriya/11-zahvat/index.html`);
await p.waitForFunction(()=>{const w=document.getElementById('map').contentWindow;return w&&w.MP},null,{timeout:180000});await p.waitForTimeout(2500);
// [время голоса, вариант, html текста (верх), html текста (низ)]
const TOP={a:.3,b:.3,c:.6};
const V=[
 [3.9,'a',()=>`<div class="t big"><b>${window.__N1}</b></div><div class="t">УЧАСТКОВ</div><div class="t">ЗА НОЧЬ</div>`],
 [5.6,'b',()=>`<div class="t">ТВОЙ ДОМ</div><div class="t red">ЗАХВАЧЕН?</div>`],
 [15.3,'c',()=>`<div class="t">КОТ-МЭР</div><div class="t gold">ПРОТИВ IMEN</div>`]];
await p.addStyleTag({content:`#cov{position:absolute;left:0;right:0;top:${Math.round(1920*.3)}px;text-align:center;pointer-events:none;z-index:50}
 #cov .t{font-family:Rubik,sans-serif;font-weight:900;font-size:150px;line-height:1.02;color:#fff;-webkit-text-stroke:22px #141829;paint-order:stroke fill;text-shadow:0 14px 0 #141829,0 0 40px rgba(20,24,41,.55)}
 #cov .big{font-size:340px}#cov b{color:#f7c24a}#cov .red{color:#ff5a6a}#cov .gold{color:#f7c24a;font-size:128px}
 #sub,#plq,#cnt,#nick,#tg,#vote,#like,#cmt,#tgp,#flash{display:none!important}`});
for(const [tv,id,html] of V){await p.evaluate(t=>window.seek(t),tv);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await p.evaluate(h=>{window.__N1=(typeof W!=='undefined'&&W.N1)||'';let c=document.getElementById('cov');if(!c){c=document.createElement('div');c.id='cov';document.body.appendChild(c)}c.innerHTML=(new Function('return '+h))()()},html.toString());await p.evaluate(tp=>{document.getElementById('cov').style.top=Math.round(1920*tp)+'px'},TOP[id]);
 await p.waitForTimeout(400);const out=path.join(ROOT,`gotovo/11-zahvat-oblozhka-${id}.png`);await p.screenshot({path:out});console.log('готово',out)}
await b.close();srv.close();
