---
name: toon3d-shorts-local
description: Делает вертикальный мультролик (1080×1920, 30–60 с) в стиле «2D-человечки в 3D-декорациях» без Higgsfield — голос ElevenLabs через Neuralbox, 3D-сцены на GLSL, рендер кадров через WebGL в Chromium (Playwright), субтитры и звук ffmpeg. Используй, когда просят «сделай ролик как Маяк», «новый шортс со стикменами/человечками», «toon 3D ролик локально», дают тему истории «он поставил всё на…» или просят дорендерить/исправить «Маяк». Шаблон и рабочий пример — projects/mayak.
---

# Toon-3D шортс: локальный пайплайн (Neuralbox + WebGL)

Это рабочий путь, которым сделан ролик «Маяк» (`projects/mayak`). Стиль, персонажи, свет и правила самопроверки — из соседнего скилла `toon3d-shorts-higgsedit` (читать его `references/STYLE_RULES.md`, `characters.md`, `self_check.md`, `prompts.md`). Higgsedit для этого пути **не нужен**.

## Что нужно на машине
Node.js 20+, Python 3 (`pillow`, `numpy`), ffmpeg. В папке проекта: `npm i esbuild@0.24.0 playwright@1.48.2` и `npx playwright install chromium`. На ПК с видеокартой рендер — с переменной `GPU=1`; если кадры чёрные, без неё.

## Пайплайн (по шагам, как в projects/mayak)
1. **Сценарий** — формула и промт в `toon3d-shorts-higgsedit/references/prompts.md` §2. Учесть разбор виральности (`projects/mayak/virality.md`): крючок «Как X подстроил Y» в первые 1,5 с, трюк героя — причина победы (не удача), понятное правило/сигнал, финал с петлёй к первому кадру, слова «пари» вместо «ставки» (монетизация). Файл: `projects/<slug>/script.md`.
2. **Голос** — Neuralbox, ElevenLabs, голос **Mell** (`voice_id 0haPZKt9OsEyLoUPKrop`), модель **`eleven_v4`** (выбор юзера):
   `POST https://neuralbox.ru/api/tts/generate {"text":"[dry, punchy storyteller, brisk pace] <весь текст>","voice_id":"0haPZKt9OsEyLoUPKrop","model_id":"eleven_v4"}` → `audio_url`, `segments`. Цена ≈10 токенов/символ — **спросить юзера перед генерацией**. Проверка текста: `POST /api/audio/transcribe {"audio_url":...,"language":"ru"}` (~250 токенов). Вне облачной сессии Claude Code нужен API-ключ Neuralbox юзера в заголовке `Authorization: Bearer …` (не хранить в репозитории).
3. **Ужатие и тайминги** — `python3 projects/mayak/edit/voice_full.py raw.wav tts_response.json out_dir` → `voice.wav` (~205 слов/мин, паузы на «Раз. Два. Три.» длиннее), `segments.json`, `words.json`. Склейки планов ставить на начала предложений из `segments.json`.
4. **3D-сцены** — GLSL ES 1.00 поверх `toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/lib.glsl`. Пример: `projects/mayak/edit/lighthouse.glsl` (причал, море с волнами/отражением заката, туман клочьями, шхуны, пароход, баржа, мыс, маяк) и `tavern.glsl` (стойка). Параметры = `uniform float u_<имя>`.
5. **Планы** — `projects/<slug>/edit/shots_full.jsx` по образцу `projects/mayak/edit/shots_full.jsx`: на план `scene`, `p(t)` (камера и параметры), `focus/blur` (двухслойная глубина), `mid(t)` (персонажи `Toon` из `char.jsx` между слоями), `top(t)`, `cam(t)`, `enter` (cut/fade/whip), `iris(t)` (бинокль/труба).
6. **Рендер** — из `edit/`: `node anim.mjs list 330` (пробный кадр), `node anim.mjs 0 <N-1>` (все). Кадры с субтитрами → `projects/<slug>/render/frames/`.
7. **Звук** — SFX по событиям (пример `edit/sfx_full.py`), музыка по желанию (Neuralbox `/api/music/generate`, Lyria 3.5 ≈1500 токенов — спросить), сведение: голос + SFX −8 dB + музыка −24 dB с приглушением под голос, `loudnorm` −14 LUFS (пример команды — в истории `projects/mayak/audio/mix_music_bg.wav`, см. RENDER.md).
8. **Склейка** — `ffmpeg -framerate 30 -i render/frames/f%04d.png -i audio/<mix>.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart out/<slug>.mp4`.

## Самопроверка (обязательно, до показа юзеру)
- Контактный лист: по кадру на план, подписать номера (как `projects/mayak/edit/preview/sheet_v2_*.jpg`). Смотреть: персонажи стоят на полу/галерее, не висят и не перекрыты столом; маяк/здания стоят на земле; нет обводки под водой; море — вода, а не розовая заливка; туман не красит воду.
- 6 кадров подряд в планах с движущимися кораблями — ничего не пропадает и не мерцает.
- `ffprobe` (1080×1920, длительность, аудио) и `ebur128` (≈ −14 LUFS).

## Уроки «Маяка» (не повторять)
- Туман не применять к самой воде (иначе всё море розовое); обводку объектов не рисовать, если ближе вода.
- Тонкие паруса: без внутренней обводки (мерцают). Марш-луч — до 200 шагов, иначе далёкие мачты пропадают.
- Ограничивающие объёмы помечать id 0, иначе контур рисуется на невидимой границе.
- Ближний слой глубины резкости — только до `focus*1.4`, иначе рендер в 3 раза медленнее.
- В `props.jsx` параметр `h` перекрывает JSX-фабрику — фабрика называется `__h`.
- Пути в Node — через `pathToFileURL` (Windows).
