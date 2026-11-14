// Розыгрыш среди комментаторов канала: node render/kommentarii/randomayzer.mjs [путь к comments.json]
// Участник = уникальный ник (1 человек = 1 шанс, сколько бы комментариев ни написал). Канал-автор исключён.
// Случайность — crypto.randomInt; список участников, хэш списка и результат сохраняются для проверки.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const ROOT=path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/,'$1')),'out');
let src=process.argv[2];if(!src){const d=fs.readdirSync(ROOT).filter(n=>/^\d{8}_\d{4}$/.test(n)).sort().pop();src=path.join(ROOT,d,'comments.json')}
const rows=JSON.parse(fs.readFileSync(src,'utf8'));
const ISKL=new Set(['GorodPodpiscikov','gorodpodpiscikov','']);
const map=new Map();for(const r of rows){if(ISKL.has(r.nik))continue;const k=r.nik.toLowerCase();if(!map.has(k))map.set(k,{nik:r.nik,komm:0,rolikov:new Set()});const u=map.get(k);u.komm++;u.rolikov.add(r.video)}
const uch=[...map.values()].sort((a,b)=>a.nik.localeCompare(b.nik));
const spisok=uch.map((u,i)=>`${i+1}. @${u.nik}`).join('\n');const hash=crypto.createHash('sha256').update(spisok).digest('hex');
const i=crypto.randomInt(uch.length),w=uch[i];
const out=path.join(path.dirname(src),'rozygrysh.md');
fs.writeFileSync(out,`# Розыгрыш золотой башни (1000 подписчиков)\n\nДата: ${new Date().toISOString().slice(0,16).replace('T',' ')} UTC\nИсточник: ${path.relative(process.cwd(),src)}\nКомментариев: ${rows.length}, участников (уникальных ников, без автора канала): **${uch.length}**\nSHA-256 списка участников: \`${hash}\`\nСлучайное число (crypto.randomInt от 0 до ${uch.length-1}): **${i}** → номер ${i+1}\n\n## Победитель: **@${w.nik}** (комментариев: ${w.komm}, роликов: ${w.rolikov.size})\n\n## Участники\n${spisok}\n`);
console.log(`Участников: ${uch.length} · номер ${i+1} → @${w.nik} (комм. ${w.komm}, роликов ${w.rolikov.size})\n${out}`);
