// Разметка озвучки «Один на Марсе» по предложениям: node render/seriya/d04-mars/timing.mjs → render/seriya/d04-mars/timing.js
// Метод: оценка по доле символов в «чистой речи» + привязка начала каждой фразы к ближайшему концу паузы (с переякорением, без дрейфа).
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {execFileSync} from 'node:child_process';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const text=fs.readFileSync(path.join(ROOT,'stsenarii/d04-ozvuchka/ves-film.txt'),'utf8').replace(/\r/g,'');
const S=text.split(/(?<=[.!?…»])\s+(?=[А-ЯЁ«])/).map(s=>s.trim()).filter(Boolean);
const DUR=+execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',path.join(ROOT,'golos/d04-mars.mp3')]).toString();
const SIL=fs.readFileSync(path.join(HERE,'tishina.txt'),'utf8').trim().split(/\n/).map(l=>l.split(' ').map(Number)).filter(a=>a.length===2&&!isNaN(a[1]));
const w=s=>s.replace(/[^А-Яа-яЁёA-Za-z0-9]/g,'').length+(s.match(/\.\.\./g)||[]).length*6;// вес: буквы + паузы «...»
const W=S.map(w),TOT=W.reduce((a,b)=>a+b,0);
const speechStart=SIL.length&&SIL[0][0]<0.05?SIL[0][1]:0;
// длительность речи без пауз
const silTot=SIL.reduce((a,[s,e])=>a+(e-s),0);
const rate=(DUR-silTot)/TOT;// сек на единицу веса
const ends=SIL.map(a=>a[1]);
const real=(t0,sp)=>{// пройти sp секунд речи от момента t0, перепрыгивая паузы
 let t=t0,left=sp;for(const [s,e] of SIL){if(e<=t)continue;if(s<=t){t=e;continue}const run=s-t;if(run>=left)return t+left;left-=run;t=e}return Math.min(DUR,t+left)};
const T=[];let cur=speechStart;
for(let i=0;i<S.length;i++){if(i===0){T.push(cur);continue}
 const est=real(T[i-1],W[i-1]*rate);let best=null,bd=1e9;for(const e of ends){const d=Math.abs(e-est);if(d<bd){bd=d;best=e}}
 T.push(bd<1.6&&best>T[i-1]+0.4?best:est)}
const out=S.map((s,i)=>({i,t0:+T[i].toFixed(2),t1:+(i<S.length-1?T[i+1]:DUR).toFixed(2),s}));
fs.writeFileSync(path.join(HERE,'timing.js'),'// автогенерация timing.mjs — не править руками\nwindow.TM='+JSON.stringify({dur:DUR,s:out})+';\n');
const snapped=out.filter((o,i)=>i&&ends.some(e=>Math.abs(e-o.t0)<.01)).length;
console.log(`фраз ${S.length}, длительность ${DUR.toFixed(1)} с, привязано к паузам ${snapped}/${S.length-1}`);
[0,7,13,30,44,74,106,138,167,203,209,226,233,236].forEach(i=>out[i]&&console.log(String(out[i].t0).padStart(7),i,out[i].s.slice(0,60)));
