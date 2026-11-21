---
name: asset-compressor
description: Автоматическое сжатие и оптимизация картинок (в WebP с уменьшением до размера кадра) и аудио (MP3, голос моно, выравнивание громкости) перед рендером, чтобы проект весил мало, быстро собирался и открывался на телефоне. Оригиналы не трогает, сжатые копии кладёт в render/remotion/public/<id>/. Использовать перед рендером, когда добавлены новые картинки или звук, или когда проект тяжёлый.
---

# asset-compressor — лёгкие ассеты для быстрого рендера

## Пути проекта

| Откуда (оригиналы, не меняются) | Куда (сжатые копии) |
|---|---|
| `render/assets/<id>/`, `render/assets/obshchie/` | `render/remotion/public/<id>/kadry/` |
| `golos/<id>.*` | `render/remotion/public/<id>/audio/` |
| трек из `muzyka/` | `render/remotion/public/<id>/audio/` |

`<id>` — имя ролика (`01-nazvanie`). В коде Remotion: `staticFile('<id>/kadry/kadr-01-fon.webp')`.

## Запуск

```bash
S=.claude/skills/asset-compressor/scripts/compress.py
python3 $S --vhod render/assets/<id> render/assets/obshchie --vyhod render/remotion/public/<id>/kadry --format 1080x1920
python3 $S --vhod golos/<id>.mp3 --vyhod render/remotion/public/<id>/audio --tip golos --norm
python3 $S --vhod muzyka/<trek>.mp3 --vyhod render/remotion/public/<id>/audio --tip muzyka --norm
```

Повторный запуск пропускает уже сжатые файлы (копия новее оригинала). В каждой папке выхода появляется отчёт `szhatie.json` (размеры до/после) — по нему one-click-director видит, что сжатие сделано.

## Что делает

- **Картинки** (png, jpg, webp, bmp, tif) → WebP, качество 82, уменьшение так, чтобы стороны были не больше длинной стороны кадра (1920 для 1080×1920), без увеличения. Прозрачность сохраняется — слои персонажей остаются вырезанными.
- **Голос** → MP3 моно 44.1 кГц 96 кбит/с; с `--norm` громкость −16 LUFS.
- **Музыка** → MP3 стерео 44.1 кГц 160 кбит/с; с `--norm` −20 LUFS (тише голоса; итоговый баланс задаётся `volume` в Remotion).
- Если сжатая копия того же формата вышла больше оригинала — берётся оригинал (кроме аудио с `--norm`).

## После сжатия

- Проверь глазами 2–3 картинки (Read) — нет ли полос на градиентах и потери краёв. Если есть — `--kachestvo 90` для этих файлов.
- Итоговый размер ролика для телефона задаётся при рендере (one-click-director: H.264, CRF 23, 1080×1920).
- Если поменялся голос или музыка — перезапусти и `audio-sync-master` (тайминги считаются по оригиналам в `golos/` и `muzyka/`).
