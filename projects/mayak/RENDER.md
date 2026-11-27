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
npm i esbuild@0.24.0 playwright@1.48.2
npx playwright install chromium
```

## 2. Рендер кадров
Windows (PowerShell), из папки `projects/mayak/edit`:
```powershell
$env:SCR = "$PWD\..\render"; $env:SHOTS = "shots_full.jsx"; $env:WORDS = "$PWD\..\audio\words.json"; $env:OUT = "frames"
mkdir $env:SCR -Force
node anim.mjs 0 1325
```
macOS / Linux:
```bash
export SCR="$PWD/../render" SHOTS=shots_full.jsx WORDS="$PWD/../audio/words.json" OUT=frames
mkdir -p "$SCR" && node anim.mjs 0 1325
```
- Кадры появятся в `projects/mayak/render/frames/f0000.png … f1325.png` (30 fps, 44,2 с).
- Можно частями: `node anim.mjs 0 600`, потом `node anim.mjs 601 1325`.
- Если в `anim.mjs` браузер не видит видеокарту, убери из `chromium.launch` аргументы `--use-angle=swiftshader` и `--enable-unsafe-swiftshader`. Тогда WebGL пойдёт через GPU.

## 3. Склейка со звуком (голос Mell v4 + звуки, без музыки)
```bash
ffmpeg -framerate 30 -i ../render/frames/f%04d.png -i ../audio/mix_nomusic.wav -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart ../out/mayak_full.mp4
```
С музыкой: подмешай `../audio/lyria_heist_110s.m4a` на −21 dB (см. `toon3d-shorts-higgsedit/scripts/mix.sh`).

## Что где
| Файл | Что это |
|---|---|
| `edit/shots_full.jsx` | 18 планов: камеры, персонажи, тайминги |
| `edit/lighthouse.glsl`, `edit/tavern.glsl` | 3D-сцены: причал, море, туман, корабли, маяк; трактир |
| `edit/anim.mjs` | покадровый рендер: WebGL + SVG-персонажи + субтитры |
| `audio/voice_mell_v4.wav`, `audio/words.json` | голос и тайминги слов |
| `audio/sfx_full.wav`, `audio/mix_nomusic.wav` | звуки и готовый микс без музыки |
