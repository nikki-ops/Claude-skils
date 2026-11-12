// Пересобрать звук серии 11 по текущему seriya.js и render.mjs-схеме и подложить к готовому видео без перерендера картинки.
// Запуск из корня: node render/seriya/11-zahvat/remix.mjs [вход.mp4] [выход.mp4]   (по умолчанию gotovo/11-zahvat.mp4 → он же)
import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url)),ROOT=path.resolve(HERE,'../../..');
const IN=path.resolve(process.argv[2]||path.join(ROOT,'gotovo/11-zahvat.mp4')),OUT=path.resolve(process.argv[3]||IN),TMP=OUT+'.tmp.mp4';
const ctx={window:{},document:{getElementById:()=>null},Math,console};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(HERE,'seriya.js'),'utf8'),ctx);
const END=ctx.window.END,SFX=ctx.window.SFXV(),SFXD=path.join(HERE,'../10-777-domov/sfx'),voice=path.join(ROOT,'golos/11-zahvat.mp3'),music=path.join(ROOT,'muzyka/11-zahvat.mp3');
const ain=['-i',IN,'-i',voice];let af='';const lab=[];
SFX.forEach(([t,f,v],i)=>{ain.push('-i',path.join(SFXD,f+'.wav'));const ms=Math.max(0,Math.round(t*1000));af+=`[${i+2}]adelay=${ms}|${ms},volume=${(v*.6).toFixed(2)}[e${i}];`;lab.push(`[e${i}]`)});
// голос −16 LUFS (+80 % на «Завтра»); шина эффектов: срез ниже 60 Гц, +5 дБ на 220 Гц (удары слышны на телефоне)
af=`[1]loudnorm=I=-16:TP=-2,aformat=channel_layouts=stereo,volume='if(between(t,34.4,35.3),1.8,1)':eval=frame,asplit=2[v][vk];`+af+`${lab.join('')}amix=inputs=${lab.length}:normalize=0,highpass=f=60,equalizer=f=220:t=h:w=200:g=5[sx];`;
// музыка: тихо, тишина перед поворотами (16,40–16,74 и 31,40–32,66), приглушение под голос
const mi=SFX.length+2;ain.push('-i',music);
af+=`[${mi}]volume=0.13,volume='if(between(t,16.40,16.74)+between(t,31.40,32.66),0,1)':eval=frame,afade=t=out:st=${END-1.5}:d=1.5[mr];[mr][vk]sidechaincompress=threshold=0.05:ratio=6:attack=20:release=300[m];`;
af+=`[v][sx][m]amix=inputs=3:normalize=0:duration=first,alimiter=limit=0.89,loudnorm=I=-15:TP=-2,aresample=48000[a]`;
console.log('эффектов',SFX.length,'конец',END);
const r=spawnSync('ffmpeg',['-v','error','-y',...ain,'-filter_complex',af,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t',String(END),'-movflags','+faststart',TMP],{stdio:'inherit'});
if(r.status!==0)process.exit(1);fs.renameSync(TMP,OUT);console.log('готово',OUT);
