---
name: remotion-saas
description: Build an app with Remotion
version: 4.0.542
---

One can build apps with Remotion.  
It is possible to have a simple form and hook it up to a render, or have a complex video editor.

## Choosing a template or a framework

We have several templates for SaaS which can be cloned or used as a reference.
See [Choosing a framework](framework.md) for help choosing a template or framework.

## The `<Player>`

This component allows embedding a Remotion preview in a React app. See [Player](player.md) for more information about the Player.

## Rendering

There are client-side and server-side rendering options available. See [Rendering](rendering.md) for advice on how to choose, and about the Lambda, Vercel, Node.js and Cloudflare options.

## With Vue

See https://www.remotion.dev/docs/vue.md for how to use Remotion with Vue.

## Angular

See https://www.remotion.dev/docs/angular.md for how to use Remotion with Angular.

## Svelte

See https://www.remotion.dev/docs/svelte.md for how to use Remotion with Svelte.

## Пути проекта (обязательно для этого репозитория)

Ищи и сохраняй файлы только в этих папках в корне репозитория:

- `stsenarii/` — тексты роликов (сценарии). Читай сценарий отсюда.
- `golos/` — файлы озвучки (voiceover). Бери озвучку отсюда, новую сохраняй сюда.
- `muzyka/` — фоновая музыка с правом на использование. Используй только треки из этой папки.
- `render/` — код сцены и рендера (проекты Remotion и HyperFrames).
- `gotovo/` — готовые видео и обложки. Итоговый рендер и обложку сохраняй сюда.

Из `render/` эти папки доступны как `../stsenarii`, `../golos`, `../muzyka`, `../gotovo`.
