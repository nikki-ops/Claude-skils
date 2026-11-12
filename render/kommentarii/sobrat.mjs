// Node-версия sobrat.py (для Windows без Python): комментарии со всех роликов канала через yt-dlp.
// node render/kommentarii/sobrat.mjs [@kanal] [--tolko-novye]
// Результат: render/kommentarii/out/<дата_время>/comments.json, avtory.md; база out/vse.json, out/vidennye.json
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const ROOT=path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1')),'out');
const args=process.argv.slice(2),kanal=args.find(a=>a.startsWith('@'))||'@gorodpodpiscikov',novye=args.includes('--tolko-novye');
function ytdlp(){if(process.env.YTDLP)return process.env.YTDLP;const d=path.join(os.homedir(),'AppData/Local/Microsoft/WinGet/Packages');
 try{for(const p of fs.readdirSync(d))if(p.startsWith('yt-dlp.yt-dlp')){const f=path.join(d,p,'yt-dlp.exe');if(fs.existsSync(f))return f}}catch{}return 'yt-dlp'}
const Y=ytdlp(),run=a=>{try{return execFileSync(Y,a,{encoding:'utf8',maxBuffer:1<<28,stdio:['ignore','pipe','ignore']})}catch(e){return e.stdout||''}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const vids=[];for(const tab of ['shorts','videos'])for(const l of run(['--encoding','utf-8','--flat-playlist','--print','%(id)s\t%(title)s',`https://www.youtube.com/${kanal}/${tab}`]).split(/\r?\n/)){const [i,...t]=l.split('\t');if(t.length&&!vids.some(v=>v[0]===i))vids.push([i,t.join('\t')])}
if(!vids.length){console.error('Ролики не найдены');process.exit(1)}
fs.mkdirSync(ROOT,{recursive:true});
const seenF=path.join(ROOT,'vidennye.json'),baseF=path.join(ROOT,'vse.json');
const seen=new Set(fs.existsSync(seenF)?JSON.parse(fs.readFileSync(seenF,'utf8')):[]);
const base=Object.fromEntries((fs.existsSync(baseF)?JSON.parse(fs.readFileSync(baseF,'utf8')):[]).map(c=>[c.id,c]));
const rows=[];
for(const [vid,title] of vids){let cs=[];
 for(let k=0;k<3;k++){const d=fs.mkdtempSync(path.join(os.tmpdir(),'yc'));run(['--skip-download','--write-comments','--no-warnings','-q','--extractor-args','youtube:comment_sort=new;max_comments=all,all,all,all','-o',path.join(d,'%(id)s.%(ext)s'),`https://www.youtube.com/shorts/${vid}`]);
  const f=path.join(d,vid+'.info.json');let info=null;if(fs.existsSync(f)){info=JSON.parse(fs.readFileSync(f,'utf8'));cs=info.comments||[]}fs.rmSync(d,{recursive:true,force:true});
  if(cs.length||(info&&!info.comment_count))break;await sleep(15000*(k+1))}
 console.log(title.slice(0,60).padEnd(60),'—',cs.length);
 for(const c of cs){if(novye&&seen.has(c.id))continue;rows.push({video:vid,title,nik:(c.author||'').replace(/^@/,''),tekst:(c.text||'').replace(/\n/g,' '),laiki:c.like_count||0,data:new Date((c.timestamp||0)*1000).toISOString().slice(0,16).replace('T',' '),otvet:(c.parent||'root')!=='root',id:c.id})}
 await sleep(8000)}
for(const r of rows)base[r.id]=r;
fs.writeFileSync(baseF,JSON.stringify(Object.values(base),null,1));
const out=path.join(ROOT,new Date().toISOString().slice(0,16).replace(/[-:]/g,'').replace('T','_'));fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'comments.json'),JSON.stringify(rows,null,1));
const by={};for(const r of rows)if(!r.otvet)(by[r.nik]??=[]).push(`[${r.title.slice(0,30)}] ${r.tekst}`);
fs.writeFileSync(path.join(out,'avtory.md'),`# Авторы: ${Object.keys(by).length}\n\n`+Object.entries(by).sort((a,b)=>a[0].toLowerCase().localeCompare(b[0].toLowerCase())).map(([n,t])=>`- **${n}**: `+t.join(' | ')).join('\n'));
fs.writeFileSync(seenF,JSON.stringify([...new Set([...seen,...rows.map(r=>r.id)])].sort()));
console.log(`Итого: ${rows.length} комментариев, ${Object.keys(by).length} авторов → ${out}`);
