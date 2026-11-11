# Серия 10 «777 домов на Марсе» (ДЕНЬ 10)
Сцена = живая карта `render/karta/index.html?video` + 2D-слой (субтитры, плашки, телефон, счётчик) в `index.html`/`seriya.js`.

## Рендер на ПК (быстро, на видеокарте)
1. Нужны Node.js 18+ и ffmpeg в PATH.
2. В корне репозитория один раз: `npm i playwright` и `npx playwright install chromium`.
3. Положи озвучку в `golos/10-777-domov.mp3` (подмешается сама).
4. `node render/seriya/10-777-domov/render.mjs` → `gotovo/10-777-domov.mp4` (1080×1920, 30 к/с).
   - Черновик: `--fps 10 --scale 0.5 --out gotovo/chernovik.mp4`
   - Кусок: `--from 14 --to 20`
   - Свой Chrome: `--chrome "C:\Program Files\Google\Chrome\Application\chrome.exe"`

## Подгонка под голос
Время слов — массив `SUB` в `seriya.js`, камера — массив `CAM` (`[начало, конец, откуда, куда]`). После записи голоса сдвинуть секунды.
