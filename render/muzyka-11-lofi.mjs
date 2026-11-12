// Своя фоновая музыка для серии 11: тихий lo-fi бит в духе трендов TikTok, 100 BPM, ля минор.
// Всё синтезируется здесь (без сэмплов и чужих треков) — права у автора канала.
// Запуск из корня репозитория: node render/muzyka-11-lofi.mjs → muzyka/11-zahvat.wav (затем ffmpeg → mp3)
// Аранжировка под голос golos/11-zahvat.mp3 (35,28 с): вход 0–2,4 с только аккорды; бит с 2,4 с;
// пауза перед ре-хуком «Но это было только начало» (16,2–16,8 с); мелодия с 16,8 с;
// «А утром… Империя объявила войну» (31,2 с) — только пэд; конец сходится с началом (петля).
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SR=44100,BPM=100,BEAT=60/BPM,BAR=4*BEAT,DUR=35.28,N=Math.ceil(DUR*SR);
const L=new Float32Array(N),R=new Float32Array(N);
let seed=1107;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const mf=m=>440*Math.pow(2,(m-69)/12),TAU=Math.PI*2;
const put=(i,l,r)=>{if(i>=0&&i<N){L[i]+=l;R[i]+=r}};
const lpA=fc=>1-Math.exp(-TAU*fc/SR);

// аккорды: Am7 – Fmaj7 – Dm9 – Esus4 (по такту)
const CH=[[57,60,64,67],[53,57,60,64],[50,53,57,60,64],[52,57,59,64]],ROOT_=[45,41,38,40];
const bars=Math.ceil(DUR/BAR);
// где что звучит (номер такта)
const drums=b=>b>=1&&b<=12,melody=b=>b>=7&&b<=12;

// электропиано (Rhodes): синус + обертон, затухание, тремоло
function rhodes(t0,m,vel,pan,len=2.2){const f=mf(m),n=Math.floor(len*SR),i0=Math.floor(t0*SR);
 for(let k=0;k<n;k++){const t=k/SR,env=Math.min(1,t/.008)*Math.exp(-t/1.5),trem=1+.18*Math.sin(TAU*4.2*t);
  const v=(Math.sin(TAU*f*t)+.28*Math.sin(TAU*2*f*t)*Math.exp(-t/.25)+.08*Math.sin(TAU*3*f*t))*env*trem*vel;put(i0+k,v*(1-pan),v*(1+pan))}}
// тёплый пэд: расстроенные пилообразные (6 гармоник) через фильтр, медленная атака
function pad(t0,len,ms,vel){const i0=Math.floor(t0*SR),n=Math.floor(len*SR),a=lpA(700);let yl=0,yr=0;
 for(let k=0;k<n;k++){const t=k/SR,env=Math.min(1,t/.9)*Math.min(1,(len-t)/.9);let sl=0,sr=0;
  for(const m of ms){const f=mf(m);for(let h=1;h<=6;h++){sl+=Math.sin(TAU*f*1.0023*h*t)/h;sr+=Math.sin(TAU*f*.9977*h*t)/h}}
  yl+=a*(sl-yl);yr+=a*(sr-yr);put(i0+k,yl*env*vel,yr*env*vel)}}
// мягкая бочка
function kick(t0,vel){const i0=Math.floor(t0*SR),n=Math.floor(.32*SR);let ph=0;
 for(let k=0;k<n;k++){const t=k/SR,f=48+100*Math.exp(-t/.035);ph+=TAU*f/SR;const v=Math.sin(ph)*Math.exp(-t/.11)*vel;put(i0+k,v,v)}}
// щелчок пальцами (snap) с коротким эхом
function snap(t0,vel){for(const [dt,g] of [[0,1],[.031,.35],[.067,.18]]){const i0=Math.floor((t0+dt)*SR),n=Math.floor(.13*SR),a=lpA(1800);let y=0;
 for(let k=0;k<n;k++){const t=k/SR,x=rnd()*2-1;y+=a*(x-y);const v=(x-y)*Math.exp(-t/.035)*vel*g;const p=dt?(dt<.05?.3:-.3):0;put(i0+k,v*(1-p),v*(1+p))}}}
// хэт
function hat(t0,vel,open=false){const i0=Math.floor(t0*SR),n=Math.floor((open?.18:.05)*SR),a=lpA(7000);let y=0;
 for(let k=0;k<n;k++){const t=k/SR,x=rnd()*2-1;y+=a*(x-y);const v=(x-y)*Math.exp(-t/(open?.06:.012))*vel;put(i0+k,v*.85,v*1.15)}}
// 808: синус с лёгким перегрузом
function b808(t0,m,len,vel){const i0=Math.floor(t0*SR),n=Math.floor(len*SR),f=mf(m);let ph=0;
 for(let k=0;k<n;k++){const t=k/SR,ff=f*(1+.5*Math.exp(-t/.02));ph+=TAU*ff/SR;const env=Math.min(1,t/.005)*Math.exp(-t/.7)*Math.min(1,(len-t)/.05);const v=Math.tanh(1.6*Math.sin(ph))*env*vel;put(i0+k,v,v)}}
// мелодия: треугольник + эхо (3/16 доли) пинг-понгом
function pluck(t0,m,vel){const f=mf(m);for(let e=0;e<4;e++){const g=Math.pow(.38,e),i0=Math.floor((t0+e*BEAT*.75)*SR),n=Math.floor(.4*SR),p=e%2?.5:-.5;
 for(let k=0;k<n;k++){const t=k/SR,ph=(f*t)%1,tri=4*Math.abs(ph-.5)-1,v=tri*Math.min(1,t/.004)*Math.exp(-t/.12)*vel*g*(e?.7:1);put(i0+k,v*(1-p*(e?1:0)),v*(1+p*(e?1:0)))}}}

for(let b=0;b<bars;b++){const t=b*BAR,c=CH[b%4],last=b>=13;
 // аккорды: удар на 1 и синкопа на «и» третьей доли
 c.forEach((m,j)=>{const pan=(j/(c.length-1)-.5)*.6;rhodes(t+j*.012,m,.075,pan);if(!last)rhodes(t+2.5*BEAT+j*.01,m,.04,pan,1.2)});
 pad(t,BAR+.9,c.map(m=>m-12),.012);
 if(drums(b)){
  for(let q=0;q<4;q++){const tb=t+q*BEAT;
   // пауза перед ре-хуком
   if(tb>=16.2&&tb<16.8)continue;
   if(q===0||q===2)kick(tb,.55);if(q===1||q===3)snap(tb,.32);
   hat(tb,.12);hat(tb+BEAT/2+BEAT*.06,.08);
   // трэп-дробь хэтов в конце каждого второго такта
   if(q===3&&b%2===1){for(let r=0;r<6;r++)hat(tb+BEAT/2+r*BEAT/12,.05+.01*r)}}
  if(!(t+2*BEAT>=16.2&&t+2*BEAT<16.8))kick(t+2.75*BEAT,.35);
  b808(t,ROOT_[b%4]-12,BEAT*1.8,.22);b808(t+2.5*BEAT,ROOT_[b%4]-12,BEAT*1.2,.16)}
 if(melody(b)){const MP=[[0,76],[.75,74],[1.5,72],[2.5,69],[3,72]],MP2=[[0,79],[.75,76],[1.5,74],[2,72],[3,74]];
  (b%2?MP2:MP).forEach(([d,m])=>pluck(t+d*BEAT,m,.05))}}
// подъём шума к входу бита (0,6–2,4 с) и винил по всему треку
{const a=lpA(3000);let y=0;for(let k=Math.floor(.6*SR);k<Math.floor(2.4*SR);k++){const t=k/SR,x=rnd()*2-1;y+=a*(x-y);const v=(x-y)*.025*Math.pow((t-.6)/1.8,2);put(k,v,v)}}
{const a=lpA(900);let y=0;for(let k=0;k<N;k++){const x=rnd()*2-1;y+=a*(x-y);let v=y*.012;if(rnd()<8/SR)v+=(rnd()*2-1)*.06;L[k]+=v;R[k]+=v}}
// мягкий сатурационный «лоу-фай» фильтр, плавные края для петли, нормализация
{const a=lpA(5200);let yl=0,yr=0,pk=0;for(let k=0;k<N;k++){yl+=a*(Math.tanh(L[k]*1.4)-yl);yr+=a*(Math.tanh(R[k]*1.4)-yr);const t=k/SR,f=Math.min(1,t/.05,(DUR-t)/.4);L[k]=yl*f;R[k]=yr*f;pk=Math.max(pk,Math.abs(L[k]),Math.abs(R[k]))}
 const g=.89/pk;for(let k=0;k<N;k++){L[k]*=g;R[k]*=g}}
// WAV 16 бит
const out=Buffer.alloc(44+N*4);out.write('RIFF',0);out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);
out.writeUInt32LE(SR,24);out.writeUInt32LE(SR*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);
for(let k=0;k<N;k++){out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,L[k]))*32767),44+k*4);out.writeInt16LE(Math.round(Math.max(-1,Math.min(1,R[k]))*32767),46+k*4)}
const f=path.join(ROOT,'muzyka/11-zahvat.wav');fs.writeFileSync(f,out);console.log('готово',f,DUR+' с');
