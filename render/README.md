# render — код сцены и рендера

```
render/
  paths.mjs                    общие пути проекта
  stil/                        библия стиля, персонажи, промпты (ai-art-prompter)
  assets/<id>/                 оригиналы картинок ролика; assets/obshchie/ — общие
  remotion/                    проект Remotion (remotion-create)
    public/<id>/kadry|audio/   сжатые ассеты (asset-compressor)
    src/data/<id>.timing.json  тайминги кадров (audio-sync-master)
  _istochniki/                 материалы разбора чужих роликов (video-analyst, не в git)
```

`<id>` — имя ролика (`01-nazvanie`), общее для `stsenarii/`, `golos/`, `gotovo/`.

Навыки: Remotion (`remotion-best-practices` — начинать с него), HyperFrames (`hyperframes`), `ai-art-prompter`, `audio-sync-master`, `asset-compressor`, `one-click-director` (сборка в `gotovo/` одной командой). Remotion для компаний может требовать платную лицензию — см. `remotion-license`.
