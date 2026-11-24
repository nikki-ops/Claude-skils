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

- Все навыки — в `.claude/skills/`: 13 навыков Remotion, HyperFrames (+ cli, registry, media-use и др.), find-skills (vercel-labs), webapp-testing, frontend-design, algorithmic-art, canvas-design, skill-creator, brand-guidelines, doc-coauthoring, internal-comms, mcp-builder, slack-gif-creator, theme-factory, web-artifacts-builder (anthropics/skills, плагин example-skills — все 12).
- Маркетплейсы `claude-plugins-official` и `anthropic-agent-skills` прописаны в `.claude/settings.json`.
- Пути для кода рендера: `render/paths.mjs`.
- Разбор чужих роликов: навык `video-analyst` — рой из 10 ролей в 8 агентах (`.claude/agents/va-*`, модель sonnet) с протоколом экономии: ≤12 запусков на ролик, аудит один раз, выжимка вместо транскрипта, кэш сети в `kesh/`. Главная сессия — дирижёр. Быстрый режим — агент `video-analyst`. Разбор и сценарий — в `stsenarii/`, рабочие файлы — в `render/_istochniki/` (не коммитятся).

## Навыки для роликов (добавлены 24.11.2026)
- `experemenosion-shorts` — ролики про болезни (аэрограф, Remotion + Three.js, только музыка).
- `directing-stickman-videos` (kaomei) — ролики с человечками для каналов без лица; тяжёлые медиа в `assets/` не коммитятся (см. `.gitignore`).
- `anything2explainer`, `video-talkcraft` (Vincentwei1021) — объясняющие ролики с озвучкой на Remotion.
- `bang-motion` — моушн-графика HTML/GSAP; `manim-video` — анимации в стиле 3Blue1Brown.
- `video-use` (browser-use) — монтаж видео разговором.
- Набор Nate Herk: `edit-video`, `short-form-edit`, `cut-silences`, `cut-mistakes`, `video-storytelling`, `make-a-video`, `motion-showreel`, `hyperframes-video-beats`, `style-library`, `gsap`, `website-to-hyperframes`, `short-form-video`.
- ButterCut (монтаж сырого видео в таймлайны FCP/Premiere, Ruby) — в `render/tools/buttercut/`, его навыки запускать оттуда.
- Внешние сервисы (Gemini, ElevenLabs, Fish Audio, kie.ai) у этих навыков работают только с ключом пользователя.

## Агенты канала MARS CITY
- `mc-proverka-kadrov` — чек-лист кадров перед финальным рендером.
- `mc-zhiteli` — новые жители из комментариев YouTube/TikTok → карта.
- `mc-analitik` — таблица метрик серий `stsenarii/metriki.md`.
- `mc-oblozhki` — 2–3 варианта обложки из финального видео.

## Конвейер мультика

1. `video-analyst` — разбор ролика-образца → сценарий `stsenarii/<id>.md`.
2. `ai-art-prompter` — библия стиля `render/stil/`, промпты, картинки в `render/assets/<id>/`.
3. Озвучка → `golos/<id>.mp3`; трек + `*.litsenziya.md` → `muzyka/`.
4. `asset-compressor` — сжатие в `render/remotion/public/<id>/`.
5. `audio-sync-master` — тайминги `render/remotion/src/data/<id>.timing.json`.
6. `one-click-director` — проверка, рендер, обложка → `gotovo/<id>.mp4`, `gotovo/<id>-oblozhka.png`.

`<id>` = `NN-nazvanie`, одинаковый во всех папках.



## Канал MARS CITY
- Библия канала: `stsenarii/kanal-bibliya.md` — мир, персонажи, летопись, открытые крючки, форматы и шаблон серии. Новые серии делать по ней.
- Карта города: `render/karta/` (копия marsity.netlify.app) — обновлять после каждой серии (жители, постройки).
