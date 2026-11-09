# Правила репозитория

Структура папок (использовать только её):

| Папка | Что лежит |
|---|---|
| `stsenarii/` | тексты роликов |
| `golos/` | файлы озвучки |
| `muzyka/` | фоновая музыка с правом на использование |
| `render/` | код сцены и рендера (Remotion, HyperFrames) |
| `gotovo/` | готовые видео и обложки |

- Сценарии читать из `stsenarii/`, озвучку — из `golos/`, музыку — только из `muzyka/`.
- Проекты Remotion и HyperFrames создавать внутри `render/`.
- Итоговые видео и обложки сохранять в `gotovo/`.
- Навыки Remotion и HyperFrames лежат в `.claude/skills/`.

## Навыки и пути в коде

- Все навыки — в `.claude/skills/`: 13 навыков Remotion, HyperFrames (+ cli, registry, media-use и др.), find-skills (vercel-labs), webapp-testing, frontend-design, algorithmic-art, canvas-design, skill-creator (anthropics/skills, плагин example-skills).
- Маркетплейсы `claude-plugins-official` и `anthropic-agent-skills` прописаны в `.claude/settings.json`.
- Пути для кода рендера: `render/paths.mjs`.
- Разбор чужих роликов: навык `video-analyst` — рой из 10 агентов (`.claude/agents/va-01…va-10`) с перекрёстным аудитом; главная сессия — дирижёр. Быстрый одиночный режим — агент `video-analyst`. Разбор и сценарий сохраняются в `stsenarii/`, рабочие файлы — в `render/_istochniki/` (не коммитятся).

## Конвейер мультика

1. `video-analyst` — разбор ролика-образца → сценарий `stsenarii/<id>.md`.
2. `ai-art-prompter` — библия стиля `render/stil/`, промпты, картинки в `render/assets/<id>/`.
3. Озвучка → `golos/<id>.mp3`; трек + `*.litsenziya.md` → `muzyka/`.
4. `asset-compressor` — сжатие в `render/remotion/public/<id>/`.
5. `audio-sync-master` — тайминги `render/remotion/src/data/<id>.timing.json`.
6. `one-click-director` — проверка, рендер, обложка → `gotovo/<id>.mp4`, `gotovo/<id>-oblozhka.png`.

`<id>` = `NN-nazvanie`, одинаковый во всех папках.
