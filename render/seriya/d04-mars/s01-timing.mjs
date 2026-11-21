// Точная разметка фраз: выравнивание слов сценария со словами Whisper (DP, как Нидлман–Вунш) + привязка к паузам.
// node render/seriya/d04-mars/timing-whisper.mjs <whisper.json>  → timing.js
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const J=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const text=fs.readFileSync(path.join(ROOT,'stsenarii/s01-mars-shorts.ozvuchka.txt'),'utf8').replace(/\r/g,'');
const S=text.split(/(?<=[.!?…»])\s+(?=[А-ЯЁ«])/).map(s=>s.trim()).filter(Boolean);
const DUR=+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',path.join(ROOT,'golos/s01-zabyli-na-marse.mp3')]).toString();
const SIL=fs.readFileSync(path.join(HERE,'s01-tishina.txt'),'utf8').trim().split(/\n/).map(l=>l.split(' ').map(Number)).filter(a=>a.length===2&&!isNaN(a[1]));
const ends=SIL.map(a=>a[1]);
const norm=w=>w.toLowerCase().replace(/ё/g,'е').replace(/[^а-яa-z0-9]/g,'');
const WS=[];J.chunks.forEach((c,ci)=>{const t0=c.timestamp[0],t1=c.timestamp[1]??(J.chunks[ci+1]?.timestamp[0]??DUR);const ws=c.text.split(/\s+/).map(norm).filter(Boolean);const L=ws.reduce((a,w)=>a+w.length+1,0)||1;let acc=0;
 ws.forEach(w=>{WS.push({w,t:t0+(t1-t0)*acc/L});acc+=w.length+1})});
const OW=[];S.forEach((s,si)=>s.split(/\s+/).map(norm).filter(Boolean).forEach((w,k)=>OW.push({w,si,first:k===0})));
const sc=(a,b)=>{if(a===b)return 3;const n=Math.min(a.length,b.length);if(n>=4&&a.slice(0,4)===b.slice(0,4))return 2;if(n>=3&&a.slice(0,3)===b.slice(0,3))return 1;return -1};
const n=OW.length,m=WS.length,G=-1;const D=new Float32Array((n+1)*(m+1)),P=new Uint8Array((n+1)*(m+1));const id=(i,j)=>i*(m+1)+j;
for(let i=1;i<=n;i++){D[id(i,0)]=i*G;P[id(i,0)]=1}for(let j=1;j<=m;j++){D[id(0,j)]=j*G;P[id(0,j)]=2}
for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){const a=D[id(i-1,j-1)]+sc(OW[i-1].w,WS[j-1].w),b=D[id(i-1,j)]+G,c=D[id(i,j-1)]+G;if(a>=b&&a>=c){D[id(i,j)]=a;P[id(i,j)]=0}else if(b>=c){D[id(i,j)]=b;P[id(i,j)]=1}else{D[id(i,j)]=c;P[id(i,j)]=2}}
const al=new Array(n).fill(null);let i=n,j=m;while(i>0&&j>0){const p=P[id(i,j)];if(p===0){if(sc(OW[i-1].w,WS[j-1].w)>0)al[i-1]=j-1;i--;j--}else if(p===1)i--;else j--}
// время каждого слова сценария: по выравненному слову или интерполяцией
const tw=OW.map((o,k)=>al[k]!=null?WS[al[k]].t:null);
for(let k=0;k<tw.length;k++)if(tw[k]==null){let a=k-1;while(a>=0&&tw[a]==null)a--;let b=k+1;while(b<tw.length&&tw[b]==null)b++;const ta=a>=0?tw[a]:0,tb=b<tw.length?tw[b]:DUR;tw[k]=ta+(tb-ta)*(k-a)/(b-a)}
const T=S.map((_,si)=>tw[OW.findIndex(o=>o.si===si)]);
for(let k=0;k<T.length;k++){let best=null,bd=1e9;for(const e of ends){const d=Math.abs(e-T[k]);if(d<bd){bd=d;best=e}}if(bd<.7)T[k]=best;if(k&&T[k]<=T[k-1]+.3)T[k]=T[k-1]+.3}T[0]=0;
// время слов внутри фразы: от T[si] до T[si+1], по выравниванию (монотонно) с поправкой на начало фразы
const words=S.map((s,si)=>{const ws=s.split(/\s+/).filter(Boolean);const idx=[];OW.forEach((o,k)=>{if(o.si===si)idx.push(k)});const a=T[si],b=si<S.length-1?T[si+1]:DUR;const raw=idx.map(k=>tw[k]);const r0=raw[0];
 // пропорционально длине слов (речь занимает ~85% фразы), выравнивание Whisper — только как поправка ±0.6 с
 const L=ws.map(w=>w.replace(/[^А-Яа-яЁёA-Za-z0-9]/g,'').length+1+(/\.\.\.|[.,!?—:]$/.test(w)?3:0)),tot=L.reduce((x,y)=>x+y,0);let acc=0;const span=(b-a)*.88;
 let prev=a;return ws.map((w,q)=>{const pr=a+span*acc/tot;acc+=L[q];let t=pr;if(raw[q]!=null){const al=a+(raw[q]-r0);if(Math.abs(al-pr)<.6)t=(al+pr)/2}t=Math.max(prev,Math.min(b-.05,t));prev=t;return +t.toFixed(2)})});
const out=S.map((s,k)=>({i:k,t0:+T[k].toFixed(2),t1:+(k<S.length-1?T[k+1]:DUR).toFixed(2),s,w:words[k]}));
fs.writeFileSync(path.join(HERE,'s01-timing.js'),'// автогенерация timing-whisper.mjs — не править руками\nwindow.S01T='+JSON.stringify({dur:DUR,s:out})+';\n');
console.log('слов сценария',n,'выровнено',al.filter(v=>v!=null).length);[0,1,4,5,7,9,12,14,15,17,18,19,20].forEach(k=>console.log(String(out[k].t0).padStart(7),k,out[k].s.slice(0,55)));
