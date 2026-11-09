---
name: remotion-studio
description: Preview a Remotion video
version: 4.0.542
---

When creating or editing a video, start Studio and open its preview as soon as the project can run, before building the composition. Keep it open while you work so the user can see changes and steer.

In Cursor, run Studio without `--no-open` so the browser opens automatically:

```bash
npx remotion studio
```

In other agent clients, you can also let Studio open the browser automatically with the command above. If you have an in-app browser and intend to use it, run:

```bash
npx remotion studio --no-open
```

If the Studio is already opened, the URL will be printed and the command will exit.
Otherwise, a long-running process will start, and the URL will be printed.

When using `--no-open`, open the exact printed URL in the in-app browser and verify that Studio loads. Once a composition exists, verify that its video preview loads. Do not use `--no-open` if you cannot open the URL in the in-app browser.

## Useful flags

| Argument          | Purpose                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `--log=<level>`   | Set `error`, `warn`, `info` (default), or `verbose` logging.                                  |
| `--port=<number>` | Request a Studio server port; otherwise Remotion finds a free port.                           |
| `--force-new`     | Start another Studio instance even when one is already running for the same project and port. |

## Пути проекта (обязательно для этого репозитория)

Ищи и сохраняй файлы только в этих папках в корне репозитория:

- `stsenarii/` — тексты роликов (сценарии). Читай сценарий отсюда.
- `golos/` — файлы озвучки (voiceover). Бери озвучку отсюда, новую сохраняй сюда.
- `muzyka/` — фоновая музыка с правом на использование. Используй только треки из этой папки.
- `render/` — код сцены и рендера (проекты Remotion и HyperFrames).
- `gotovo/` — готовые видео и обложки. Итоговый рендер и обложку сохраняй сюда.

Из `render/` эти папки доступны как `../stsenarii`, `../golos`, `../muzyka`, `../gotovo`.

Пути также заданы в коде: `render/paths.mjs` (`PATHS.stsenarii`, `PATHS.golos`, `PATHS.muzyka`, `PATHS.gotovo`, `outputFile(name)`). Готовый рендер выводи в `gotovo/`, например `npx remotion render <Comp> ../../gotovo/<name>.mp4` или `npx hyperframes render --output ../../gotovo/<name>.mp4` из проекта в `render/<project>/`. Аудио из `golos/` и `muzyka/` копируй в папку ассетов проекта (`public/` у Remotion) перед рендером, не меняя оригиналы.
