# Как дорендерить «Маяк» на своём компьютере

На ПК с видеокартой рендер идёт в десятки раз быстрее, чем в облачном контейнере (там 4 ядра без GPU).

## 1. Один раз: поставить
Нужны **Git**, **Node.js 20+**, **Python 3** (с `pip install pillow numpy`) и **ffmpeg** (в PATH).
```bash
git clone https://github.com/nikki-ops/Claude-skils.git
cd Claude-skils
git checkout claude/bold-cerf-an70j4
cd projects/mayak/edit
npm init -y
npm i esbuild@0.24.0 playwright@latest
```

На **Windows** браузер отдельно качать не нужно: рендер сам берёт установленный Microsoft Edge (`CHANNEL=msedge`). На macOS/Linux один раз выполни `npx playwright install chromium`. Если `npm init` дописал в `package.json` строку `"type": "commonjs"`, её можно оставить: файлы рендера — `.mjs`.

## 2. Рендер кадров
Из папки `projects/mayak/edit`, команда одна для Windows, macOS и Linux:
```bash
node anim.mjs 0 1325
```
- Кадры появятся в `projects/mayak/render/frames/f0000.png … f1325.png` (30 fps, 44,2 с). Субтитры уже впечатаны.
- **Быстрее на видеокарте:** перед запуском задай `GPU=1`.
  - Windows PowerShell: `$env:GPU=1; node anim.mjs 0 1325`
  - macOS/Linux: `GPU=1 node anim.mjs 0 1325`

  Если с `GPU=1` кадры получаются чёрными, запусти без него.
- Можно частями: `node anim.mjs 0 600`, потом `node anim.mjs 601 1325`.
- Один кадр для проверки: `node anim.mjs list 330`.

## 3. Склейка со звуком (голос Mell v4 + звуки, без музыки)
```bash
ffmpeg -framerate 30 -i ../render/frames/f%04d.png -i ../audio/mix_nomusic.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart ../out/mayak_full.mp4
```
С тихой фоновой музыкой (уже сведено): замени `../audio/mix_nomusic.wav` на `../audio/mix_music_bg.wav`.

## Что где
| Файл | Что это |
|---|---|
| `edit/shots_full.jsx` | 18 планов: камеры, персонажи, тайминги |
| `edit/lighthouse.glsl`, `edit/tavern.glsl` | 3D-сцены: причал, море, туман, корабли, маяк; трактир |
| `edit/anim.mjs` | покадровый рендер: WebGL + SVG-персонажи + субтитры |
| `audio/voice_mell_v4.wav`, `audio/words.json` | голос и тайминги слов |
| `audio/sfx_full.wav`, `audio/mix_nomusic.wav` | звуки и готовый микс без музыки |
