# Голос: fish.audio через Claude in Chrome

Проверено 1–2 ноября 2026 на роликах «Свет в самолёте», «Фонарь с катера» и «Что если все перестали врать».

## Параметры
- Голос «Меллстрой»: `https://fish.audio/app/m/0a690dbeb3984a9f88cd39353880775f`. Кнопка «Используйте голос» открывает страницу «Текст в речь» (`/ru/app/text-to-speech/?modelId=...`).
- Модель Fish Audio S2.1 Pro, скорость 1.2x, нормализация громкости включена. Настройки сохраняются в аккаунте, но проверить по скриншоту.
- Бесплатный план: 8000 кредитов в месяц (обновляются 17-го). Лимит 500 «символов» на генерацию, **кириллица считается ×2**, то есть примерно 240 русских букв на кусок. Каждая генерация даёт **2 дубля**.
- Всплывающее окно «Выберите план» — реклама, генерация идёт и без него. Закрыть крестиком.
- Генерация иногда стоит в очереди дольше 2 минут. Не перескакивать к следующему куску: ждать, пока для этого куска не придут 2 файла.

## Код (в `javascript_tool` на странице «Текст в речь»)
**1. Разбить текст на куски по весу ≤ 490, перехватывать mp3, вставлять текст:**
```js
const full = "…весь текст, числа словами…";
const w = s => [...s].reduce((a, c) => a + (/[а-яё]/i.test(c) ? 2 : 1), 0);
const sents = full.match(/[^.!?]+(\.\.\.|[.!?])+»?\s*/g).map(s => s.trim());
const out = []; let cur = "";
for (const s of sents) { const n = cur ? cur + " " + s : s; if (w(n) > 490) { out.push(cur); cur = s; } else cur = n; }
out.push(cur);
window.__chunks = out; window.__caps = []; window.__ci = 0;
if (!window.__hooked) {
  const of = window.fetch;
  window.fetch = async (...a) => { const r = await of(...a);
    try { const ct = r.headers.get("content-type") || ""; const u = (a[0] && a[0].url) || String(a[0]);
      if (/octet|audio/.test(ct) && /task/.test(u)) window.__caps.push({ ci: window.__ci, buf: await r.clone().arrayBuffer() }); } catch (e) {}
    return r; };
  window.__hooked = 1;
}
window.__setText = t => { const ed = document.querySelector(".tiptap.ProseMirror"); ed.focus();
  const rg = document.createRange(); rg.selectNodeContents(ed); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg);
  document.execCommand("insertText", false, t); return ed.innerText.length; };
out.map(w)
```
**2. Генерация куска с ожиданием (запускать без `await`, вызов JS обрывается через 45 с):**
```js
window.__gen = async (i) => {
  for (let k = 0; k < 200; k++) { const b = [...document.querySelectorAll("button")].find(b => /Генерировать речь/.test(b.innerText)); if (b && !b.disabled) break; await new Promise(r => setTimeout(r, 1000)); }
  window.__ci = i; const before = window.__caps.filter(c => c.ci === i).length;
  window.__setText(window.__chunks[i]); await new Promise(r => setTimeout(r, 1200));
  [...document.querySelectorAll("button")].find(b => /Генерировать речь/.test(b.innerText)).click();
  for (let k = 0; k < 300; k++) { await new Promise(r => setTimeout(r, 1000)); if (window.__caps.filter(c => c.ci === i).length >= before + 2) break; }
};
window.__job = (async () => { for (let i = 0; i < window.__chunks.length; i++) await window.__gen(i); window.__done = 1; })(); "started"
```
Опрос: `for(let i=0;i<40&&!window.__done;i++) await new Promise(r=>setTimeout(r,1000)); window.__caps.map(c=>c.ci+':'+c.buf.byteLength)`.

**3. Передача в песочницу.** Локальный приёмник со страницы fish.audio **зависает**, а скачивание через blob уходит в «D:\Собаки мемчики». Рабочий путь:
1. `media_upload` с файлами `x_0a.mp3`, `x_0b.mp3`, … (по одному на дубль) — получить presigned URL;
2. в браузере: `fetch(url, {method:"PUT", headers:{"Content-Type":"audio/mpeg","If-None-Match":"*"}, body: window.__caps[i].buf})` и проверить статус 200;
3. `media_confirm {type:"audio", media_ids:[...]}`;
4. в песочнице `curl -sfL -o cK.mp3 https://d2ol7oe51mr4n9.cloudfront.net/<user>/<media_id>.mp3`.

## Выбор дублей и проверка
- Каждый дубль распознать через faster-whisper (`small`, `int8`, `language="ru"`) и сверить со сценарием. Брать дубль без ошибок, а при равенстве — тот, что короче.
- Числа писать словами («двадцать три пятьдесят девять»). Многоточие даёт паузу, но потом паузы всё равно ужимаются.
- Записать в `/home/user/what-if/<slug>/voice.json`: движок, голос, скорость, `media_id` выбранных дублей, обработку и длительность.

## Альтернатива: ElevenLabs v4 в Content Factory
Если на Higgsfield хватает кредитов (около 4.6 на 60 с) — один `generate_audio`: `model: "elevenlabs_v4"`, русский голос **Alexey** `7c2133e5-68ab-511f-9aed-9a67664382b1`, `stability` 0.40. Весь текст — одним дублем. В начале направление в скобках: `[dry, punchy storyteller, brisk pace]`. Подробнее в `content_factory.md`. Голос, который юзер назвал сам, имеет приоритет.

## Neuralbox (ElevenLabs) — основной путь с 27.11.2026
Юзер выбрал голос **Mell** (ElevenLabs, профессиональный, ru, московский акцент) на модели **`eleven_v4`**.
- `POST https://neuralbox.ru/api/tts/generate` с телом `{"text": "...", "voice_id": "0haPZKt9OsEyLoUPKrop", "model_id": "eleven_v4"}`. Ответ: `audio_url` (mp3 на cdn.neuralbox.ru) и `segments` с таймингами предложений.
- Список голосов: `GET /api/tts/voices`. Распознать готовый файл и сверить текст: `POST /api/audio/transcribe {"audio_url": ...}`.
- Потом как обычно: ужать паузы, подогнать темп, расставить субтитры (`projects/mayak/edit/voice_build.py`, `caps_overlay.mjs`).
