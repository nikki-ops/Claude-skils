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
- Разбор чужих роликов и сценарии по ним: субагент `video-analyst` (`.claude/agents/video-analyst.md`) по навыку `.claude/skills/video-analyst/SKILL.md`. Разбор и сценарий сохраняются в `stsenarii/`.
