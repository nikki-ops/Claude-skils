---
name: remotion-docs
description: Search Remotion documentation
version: 4.0.542
---

This skill teaches you how to discover and read current Remotion documentation.
If this is not relevant, load Remotion Best Practices instead.

## Searching the docs

Use the Algolia search API to find relevant documentation pages:

```
POST https://plsduol1ca-dsn.algolia.net/1/indexes/*/queries?x-algolia-api-key=3e42dbd4f895fe93ff5cf40d860c4a85&x-algolia-application-id=PLSDUOL1CA
Content-Type: application/x-www-form-urlencoded

{
  "requests": [
    {
      "query": "<your search query>",
      "indexName": "remotion",
      "params": "attributesToRetrieve=[\"hierarchy.lvl0\",\"hierarchy.lvl1\",\"hierarchy.lvl2\",\"url\"]&hitsPerPage=10"
    }
  ]
}
```

Each hit contains a `url` field pointing to the documentation page.

## Fetching a page as Markdown

Append `.md` to any Remotion docs URL to retrieve its Markdown source (saves tokens):

```
https://www.remotion.dev/docs/use-video-config.md
https://www.remotion.dev/docs/sequence.md
https://www.remotion.dev/docs/lambda/rendermediaonlambda.md
```

## Workflow

1. Search Algolia for the concept or API you need.
2. Pick the most relevant URL(s) from the results.
3. Fetch each URL with the `.md` suffix.
4. Implement using the current documentation rather than memorized API knowledge.

## Пути проекта (обязательно для этого репозитория)

Ищи и сохраняй файлы только в этих папках в корне репозитория:

- `stsenarii/` — тексты роликов (сценарии). Читай сценарий отсюда.
- `golos/` — файлы озвучки (voiceover). Бери озвучку отсюда, новую сохраняй сюда.
- `muzyka/` — фоновая музыка с правом на использование. Используй только треки из этой папки.
- `render/` — код сцены и рендера (проекты Remotion и HyperFrames).
- `gotovo/` — готовые видео и обложки. Итоговый рендер и обложку сохраняй сюда.

Из `render/` эти папки доступны как `../stsenarii`, `../golos`, `../muzyka`, `../gotovo`.
