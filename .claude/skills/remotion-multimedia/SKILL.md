---
name: remotion-multimedia
description: Interacting with Mediabunny
version: 4.0.542
---

Mediabunny is a multimedia library for dealing with audio and video in the browser.
Here is a compact overview of its capabilities: https://mediabunny.dev/llms.txt

## Getting audio duration

See [get-audio-duration.md](get-audio-duration.md) for getting the duration of an audio file in seconds with Mediabunny.

## Getting video dimensions

See [get-video-dimensions.md](get-video-dimensions.md) for getting the width and height of a video file with Mediabunny.

## Getting video duration

See [get-video-duration.md](get-video-duration.md) for getting the duration of a video file in seconds with Mediabunny.

## Пути проекта (обязательно для этого репозитория)

Ищи и сохраняй файлы только в этих папках в корне репозитория:

- `stsenarii/` — тексты роликов (сценарии). Читай сценарий отсюда.
- `golos/` — файлы озвучки (voiceover). Бери озвучку отсюда, новую сохраняй сюда.
- `muzyka/` — фоновая музыка с правом на использование. Используй только треки из этой папки.
- `render/` — код сцены и рендера (проекты Remotion и HyperFrames).
- `gotovo/` — готовые видео и обложки. Итоговый рендер и обложку сохраняй сюда.

Из `render/` эти папки доступны как `../stsenarii`, `../golos`, `../muzyka`, `../gotovo`.

Пути также заданы в коде: `render/paths.mjs` (`PATHS.stsenarii`, `PATHS.golos`, `PATHS.muzyka`, `PATHS.gotovo`, `outputFile(name)`). Готовый рендер выводи в `gotovo/`, например `npx remotion render <Comp> ../../gotovo/<name>.mp4` или `npx hyperframes render --output ../../gotovo/<name>.mp4` из проекта в `render/<project>/`. Аудио из `golos/` и `muzyka/` копируй в папку ассетов проекта (`public/` у Remotion) перед рендером, не меняя оригиналы.
