// Собирает страницу-обучение из gotovo/obuchenie/obuchenie.md → gotovo/obuchenie/index.html (картинки — img/*.png рядом)
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),D=path.join(ROOT,'gotovo/obuchenie');
const md=fs.readFileSync(path.join(D,'obuchenie.md'),'utf8').replace(/\r/g,'');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inl=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/«([^»]{1,60})»/g,'«$1»');
const slug=(t,i)=>'g'+i;
const L=md.split('\n');let h='',toc=[],i=0,hn=0,inList=null;
const closeList=()=>{if(inList){h+=`</${inList}>`;inList=null}};
while(i<L.length){let l=L[i];
 if(l.startsWith('```')){closeList();const b=[];i++;while(i<L.length&&!L[i].startsWith('```'))b.push(L[i++]);i++;const code=b.join('\n').replace(/\n+$/,'');h+=`<div class="code"><button class="copy" type="button">Копировать</button><pre><code>${esc(code)}</code></pre></div>`;continue}
 if(/^#{1,3} /.test(l)){closeList();const lv=l.match(/^#+/)[0].length,t=l.slice(lv+1).trim();const id=slug(t,hn++);if(lv===1&&i===0){h+=`<h1 class="title">${inl(t)}</h1>`}else{h+=`<h${lv} id="${id}">${inl(t)}</h${lv}>`;if(lv<=2)toc.push([lv,id,t])}i++;continue}
 if(l.startsWith('![')){closeList();const m=l.match(/^!\[(.*?)\]\((.*?)\)/);h+=`<figure><img src="${m[2]}" alt="${esc(m[1]||'Иллюстрация с котом-мэром')}" loading="lazy" width="1280" height="600">${m[1]?`<figcaption>${inl(m[1])}</figcaption>`:''}</figure>`;i++;continue}
 if(l.startsWith('|')){closeList();const rows=[];while(i<L.length&&L[i].startsWith('|'))rows.push(L[i++]);const cells=r=>r.slice(1,-1).split('|').map(c=>c.trim());const head=cells(rows[0]);
  h+=`<div class="tbl"><table><thead><tr>${head.map(c=>`<th>${inl(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(2).map(r=>`<tr>${cells(r).map(c=>`<td>${inl(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;continue}
 if(l.startsWith('>')){closeList();const b=[];while(i<L.length&&L[i].startsWith('>'))b.push(L[i++].replace(/^> ?/,''));let t=b.join('\n');const kot=/🐱/.test(t),ok=/^✅/.test(t);t=t.replace(/^🐱 ?/,'').replace(/^✅ ?/,'');
  // внутри цитаты может быть код
  let inner='';const parts=t.split(/```/);parts.forEach((p,k)=>{if(k%2)inner+=`<div class="code"><button class="copy" type="button">Копировать</button><pre><code>${esc(p.replace(/^\n|\n$/g,''))}</code></pre></div>`;else p.split(/\n{2,}/).forEach(pp=>{if(pp.trim())inner+=`<p>${inl(pp.trim()).replace(/\n/g,'<br>')}</p>`})});
  h+=`<aside class="${kot?'kot':ok?'ok':'note'}">${kot?'<span class="badge">Как у MARS CITY</span>':ok?'<span class="badge">Проверка</span>':''}${inner}</aside>`;continue}
 if(/^- \[ \] /.test(l)){if(inList!=='ul class="todo"'){closeList();h+='<ul class="todo">';inList='ul'}h+=`<li><span class="box"></span>${inl(l.slice(6))}</li>`;i++;continue}
 if(/^- /.test(l)){if(inList!=='ul'){closeList();h+='<ul>';inList='ul'}h+=`<li>${inl(l.slice(2))}</li>`;i++;continue}
 if(/^\d+\. /.test(l)){if(inList!=='ol'){closeList();h+='<ol>';inList='ol'}h+=`<li>${inl(l.replace(/^\d+\. /,''))}</li>`;i++;continue}
 if(l.trim()==='---'){closeList();h+='<hr>';i++;continue}
 if(!l.trim()){closeList();i++;continue}
 closeList();const isOS=/^(Mac|Windows)$/.test(l.trim());h+=isOS?`<p class="os">${l.trim()}</p>`:`<p>${inl(l)}</p>`;i++}
closeList();
const tocHtml=toc.map(([lv,id,t])=>`<a href="#${id}" class="l${lv}">${esc(t)}</a>`).join('');
const page=`<title>Мультики через терминал</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;700;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
/* Макет: узкая колонка курса + липкое оглавление слева на широком экране; ночной Марс канала MARS CITY (одна тёмная тема намеренно) */
:root{--bg:#121022;--panel:#1b1931;--panel2:#221f3b;--line:#332e55;--fg:#ece9f6;--muted:#a9a3c4;--gold:#f7c24a;--mars:#c8642e;--ok:#5dd88a;--code:#0d0c1a;
 --display:'Rubik',system-ui,sans-serif;--body:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono',Consolas,monospace;color-scheme:dark}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--fg);font:16px/1.65 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
.wrap{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:240px minmax(0,1fr);gap:48px;padding-block:32px 80px}
nav{position:sticky;top:calc(env(safe-area-inset-top,0px) + 16px);align-self:start;max-height:calc(100vh - 32px);overflow:auto;padding-right:8px;font-size:13.5px}
nav .h{font:900 13px var(--display);letter-spacing:.08em;text-transform:uppercase;color:var(--gold);margin:0 0 10px}
nav a{display:block;color:var(--muted);text-decoration:none;padding:4px 0 4px 10px;border-left:2px solid var(--line);line-height:1.35}
nav a.l1{color:var(--fg);font-weight:600;margin-top:12px;border-left-color:var(--mars)}
nav a:hover,nav a:focus-visible{color:var(--gold);border-left-color:var(--gold);outline:none}
main{min-width:0;max-width:760px}
.hero{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:8px}
.chip{font:700 12px var(--display);letter-spacing:.06em;text-transform:uppercase;color:#1a1410;background:var(--gold);padding:4px 10px;border-radius:6px}
.chip.alt{background:transparent;color:var(--muted);border:1px solid var(--line)}
h1.title{font:900 clamp(32px,5vw,52px)/1.05 var(--display);margin:12px 0 20px;text-wrap:balance}
h1{font:900 30px/1.15 var(--display);color:var(--gold);margin:56px 0 8px;text-wrap:balance}
h2{font:700 25px/1.2 var(--display);margin:44px 0 12px;text-wrap:balance;scroll-margin-top:16px}
h3{font:700 19px/1.3 var(--display);margin:28px 0 8px;scroll-margin-top:16px}
h1[id]{scroll-margin-top:16px}
p{margin:0 0 14px}
strong{color:#fff}
code{font:500 .9em var(--mono);background:var(--panel2);padding:1px 6px;border-radius:5px}
figure{margin:18px 0 22px}figure img{width:100%;height:auto;border-radius:14px;border:1px solid var(--line);display:block}
figcaption{color:var(--muted);font-size:13.5px;margin-top:8px}
ul,ol{margin:0 0 16px;padding-left:24px}li{margin:4px 0}
ul.todo{list-style:none;padding-left:0}ul.todo li{display:flex;gap:10px;align-items:baseline}.box{width:15px;height:15px;border:2px solid var(--gold);border-radius:4px;flex:none;transform:translateY(2px)}
.os{font:700 13px var(--display);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:18px 0 6px}
.code{position:relative;margin:10px 0 18px}
pre{margin:0;background:var(--code);border:1px solid var(--line);border-radius:12px;padding:16px 18px;overflow-x:auto}
pre code{background:none;padding:0;font:400 14px/1.6 var(--mono);color:#cfe9d9;white-space:pre}
.copy{position:absolute;top:8px;right:8px;font:600 12px var(--body);color:var(--muted);background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:5px 10px;cursor:pointer}
.copy:hover,.copy:focus-visible{color:var(--gold);border-color:var(--gold);outline:none}
.tbl{overflow-x:auto;margin:10px 0 20px;border:1px solid var(--line);border-radius:12px}
table{border-collapse:collapse;width:100%;font-size:14.5px;min-width:480px}
th{font:700 13px var(--display);letter-spacing:.04em;text-transform:uppercase;color:var(--gold);text-align:left;background:var(--panel2)}
th,td{padding:10px 14px;border-bottom:1px solid var(--line);vertical-align:top}tr:last-child td{border-bottom:0}
aside{border-radius:14px;padding:16px 18px 4px;margin:14px 0 20px}
aside.ok{background:rgba(93,216,138,.08);border:1px solid rgba(93,216,138,.35)}
aside.kot{background:linear-gradient(135deg,rgba(200,100,46,.18),rgba(247,194,74,.08));border:1px solid rgba(247,194,74,.45)}
aside.note{background:var(--panel);border:1px solid var(--line)}
aside .badge{display:inline-block;font:700 11.5px var(--display);letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;padding:3px 8px;border-radius:5px}
aside.ok .badge{color:#0d2a18;background:var(--ok)}aside.kot .badge{color:#1a1410;background:var(--gold)}
hr{border:0;border-top:1px solid var(--line);margin:36px 0}
@media (max-width:900px){.wrap{grid-template-columns:minmax(0,1fr);gap:0}nav{position:static;max-height:none;margin-bottom:24px;padding:14px 16px;border:1px solid var(--line);border-radius:14px;background:var(--panel)}nav a{padding-block:6px}}
</style>
<div class="wrap">
<nav aria-label="Содержание"><p class="h">Содержание</p>${tocHtml}</nav>
<main><div class="hero"><span class="chip">MARS CITY</span><span class="chip alt">обучение · Claude Code</span></div>
${h}
</main></div>
<script>
document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{const t=b.nextElementSibling.innerText;const done=()=>{b.textContent='Скопировано';setTimeout(()=>b.textContent='Копировать',1500)};
 try{navigator.clipboard.writeText(t).then(done,()=>{const r=document.createRange();r.selectNodeContents(b.nextElementSibling);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Выделено — Ctrl+C'})}catch(e){}}));
</script>`;
fs.writeFileSync(path.join(D,'index.html'),page);console.log('ok',page.length,toc.length);
