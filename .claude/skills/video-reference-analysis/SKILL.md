---
name: video-reference-analysis
description: Разбирает ролик-референс по ссылке YouTube / YouTube Shorts / TikTok / Reels или из файла — скачивает, режет на кадры, находит склейки, расшифровывает речь и параллельно запускает агентов (покадровый разбор отрезков, 3D-вид и свет, звук и темп, виральность). Итог — стиль-гайд refs/style.md для нового ролика. Используй, когда дают ссылку на ролик и просят «разбери», «сделай в таком стиле», «проанализируй референс», «почему он залетел».
---

# Разбор ролика-референса по ссылке

Результат кладётся в `projects/<slug>/refs/`. Дальше по нему делается ролик скиллом `toon3d-shorts-local` (или `toon3d-shorts-higgsedit`).

## 0. Что нужно
`yt-dlp` (`winget install yt-dlp` / `pip install -U yt-dlp`), `ffmpeg`, Python 3 с `pillow numpy`. Для расшифровки — `faster-whisper` (`pip install faster-whisper`) или Neuralbox (`NEURALBOX_API_KEY`).

## 1. Скачать
```bash
mkdir -p projects/<slug>/refs && cd projects/<slug>/refs
yt-dlp -f "bv*[height<=1920][ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b" --merge-output-format mp4 -o ref.mp4 "<ссылка>"
```
TikTok/Instagram иногда требуют входа: `--cookies-from-browser edge` (или chrome). Если не качается — попросить юзера скачать файл и положить в `refs/ref.mp4`.

## 2. Подготовка (быстро, без агентов)
```bash
python ../../../.claude/skills/video-reference-analysis/scripts/prep.py ref.mp4 .
```
Скрипт: длительность/размер/fps, склейки (scene > 0.3), контакт-листы всего ролика (1 кадр/с), аудио `ref.wav`, деление на отрезки по ~11 с → `prep.json`. Посмотри контакт-листы сам.

## 3. Расшифровка
faster-whisper `small`, `int8`, `word_timestamps=True` → `words.json` (или Neuralbox `/api/audio/transcribe`). Сверить текст глазами.

## 4. Агенты — параллельно, одним сообщением
- `ref-segment-analyst` × N (по одному на отрезок из `prep.json`): путь к видео, A–B, папка `refs/`.
- `ref-look-analyst` × 1.
- `ref-audio-analyst` × 1 (передать `words.json`).
- По желанию `virality-critic` × 5–20 с разными углами (см. описание агента) — «почему залетел» и что взять.

## 5. Сводка
Собери `refs/style.md` по образцу `.claude/skills/toon3d-shorts-higgsedit/references/STYLE_RULES.md`: формула истории, персонажи, фоны и свет, анимация, камера и переходы, субтитры, звук. Где отчёты расходятся — верить покадровым замерам. Отдельно: `refs/virality.md` (если запускались критики) — топ-5 приёмов, которые переносим.

## 6. Не копировать
Сюжет, персонажей, текст и узнаваемую графику референса не переносить — только формат, темп, приёмы и стиль.
