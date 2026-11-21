---
name: remotion-upgrade
description: Upgrade Remotion, and related packages
version: 4.0.542
---

# Upgrade Remotion

1. Inspect the project manifests and lockfile to identify the package manager and workspaces. Preserve unrelated changes.
2. Determine whether `@remotion/cli` is locally available. If it is, run:

   ```bash
   npx remotion upgrade
   ```

   This also updates project-local Remotion skills. Skip the manual upgrade below.

3. If `@remotion/cli` is not available, upgrade manually:
   - Get the latest stable Remotion version with `npm view remotion version`.
   - Find every installed `remotion` and `@remotion/*` dependency across the project and upgrade them all to that exact version. Preserve their dependency sections and the project's workspace or catalog conventions.
   - Read the `@remotion/studio` dependencies for the target Remotion version using `npm view @remotion/studio@<version> dependencies --json`. Align installed auxiliary packages such as `zod`, `mediabunny`, and `@huggingface/transformers` with the versions listed there. Use the `mediabunny` version for installed `@mediabunny/*` packages.
   - Run the project's package manager to update its lockfile.
4. If `@remotion/cli` is not available, update the installed Remotion skills:

   ```bash
   npx skills update remotion-best-practices remotion-captions remotion-create remotion-docs remotion-interactivity remotion-license remotion-maps remotion-markup remotion-multimedia remotion-render remotion-saas remotion-studio remotion-upgrade --yes
   ```

5. Review the manifest and lockfile diff. Ensure all Remotion packages use one version and installed auxiliary packages use their recommended versions. If the CLI is available, run `npx remotion versions` as an additional check.

The [Remotion releases](https://github.com/remotion-dev/remotion/releases) contain the changelog and may be useful for summarizing relevant changes after the upgrade.

## Пути проекта (обязательно для этого репозитория)

Ищи и сохраняй файлы только в этих папках в корне репозитория:

- `stsenarii/` — тексты роликов (сценарии). Читай сценарий отсюда.
- `golos/` — файлы озвучки (voiceover). Бери озвучку отсюда, новую сохраняй сюда.
- `muzyka/` — фоновая музыка с правом на использование. Используй только треки из этой папки.
- `render/` — код сцены и рендера (проекты Remotion и HyperFrames).
- `gotovo/` — готовые видео и обложки. Итоговый рендер и обложку сохраняй сюда.

Из `render/` эти папки доступны как `../stsenarii`, `../golos`, `../muzyka`, `../gotovo`.

Пути также заданы в коде: `render/paths.mjs` (`PATHS.stsenarii`, `PATHS.golos`, `PATHS.muzyka`, `PATHS.gotovo`, `outputFile(name)`). Готовый рендер выводи в `gotovo/`, например `npx remotion render <Comp> ../../gotovo/<name>.mp4` или `npx hyperframes render --output ../../gotovo/<name>.mp4` из проекта в `render/<project>/`. Аудио из `golos/` и `muzyka/` копируй в папку ассетов проекта (`public/` у Remotion) перед рендером, не меняя оригиналы.
