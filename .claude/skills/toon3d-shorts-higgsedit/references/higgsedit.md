# Higgsedit: API, сборка, рендер, грабли

Higgsedit (пакет Fable) — нативный движок монтажа в песочнице Higgsfield. Типы API лежат в `/opt/fable/types/fable.d.ts` (смотреть через grep), справка — `higgsedit <cmd> --help`.

## Скелет `film.jsx`
```jsx
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000000" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf"); // кириллица
  const audio = await p.add("../mix.wav");
  const q = (t) => Math.round(t * 30) / 30;            // ВСЕ времена квантовать до кадра
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {/* один полнокадровый frame на план: <Shot at={q(a)} dur={q(b)-q(a)} /> */}
      {/* субтитры: frame на карточку */}
    </frame>,
    { at: 0, dur: T }
  );
  p.cut(audio, { at: 0 });
};
```
- Весь ролик — **один** `p.compose`. Если композиций несколько и они перекрываются, они раскладываются по чередующимся дорожкам, и каждый второй наплыв превращается в жёсткую склейку.
- Наплыв: у входящего фрейма-плана анимировать `opacity` (и слегка `scale`) поверх уходящего.
- Компоненты должны возвращать полнокадровые `frame`, а не `<group>`: временной дочерний узел внутри группы получает её полную длину, и сборка падает.

## Примитивы
- `path` (`d`: команды `M L H V C Q Z`; **`T` и дуги не поддерживаются**), `rect` с `radius`, `text`, `ellipse` через `path`.
- Заливки: hex, линейный и радиальный градиент. `stroke={{width, color, cap}}`. `shadow={{x, y, blur, color}}`.
- Морф: `morphTo="<d>"` плюс анимация `morphProgress`. Так сделаны моргания, рот и позы рук.
- Маски: у `frame` **нет** `mask`, только `matte="name"` (видно только там, где у соседнего узла с этим именем есть альфа). Пример — ирис-бинокль.
- `blendMode`.
- Размытие только эффектом: `effects={[{kind:"blur", params:{px:30}}]}`. Проп `blur` молча игнорируется. Есть ещё `effects: [{kind: "shader", params: {glsl, ...}}]`.
- Прямоугольник с обводкой без заливки рисуется белым. Нужно указать `fill="#00000000"`.
- Радиальный градиент свечения заканчивать примерно на offset 0.7, иначе виден квадрат.
- Текст `" "` (просто пробел) ломает сборку. Узлу `text` цвет задаётся через `color`, а не `fill`. Вложенных спанов нет: каждое цветное слово — отдельный узел.

## Анимация
```jsx
animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.29, value: 1 }, { at: dur - 0.01, value: 1 }] }]}
animate={[{ property: "scale", from: 1.18, to: 1, at: 0, duration: 0.22, easing: "ease-out" }]}
```
- Свойства: `opacity`, `scale`, `offsetX`, `offsetY`, `rotation`, `blur`, `morphProgress`, `effectParam`.
- `at` отсчитывается от начала узла. Каждая цепочка ключей обязана закончиться **внутри длительности узла**. Самая частая ошибка: «the chain ends at 2.17s but the node is only 2.1667s long». Поэтому всё квантовать через `q()`, а у последнего ключа ставить `dur - 0.01`.
- Ключей минимум 2, `at` строго возрастает. `repeat` должен быть ≥ 2, повторяющаяся цепочка заканчивается там же, где началась.
- У `frame` нет статичного `scale`: держать масштаб через `from == to` с короткой `duration` (0.02).
- Easing: `linear`, `ease-in`, `ease-out`, `ease-in-out`, `smooth`, `hold`, `bounce`, `[x1,y1,x2,y2]`. Для смены поз «на двойках» использовать `hold`.
- Видимость окном: ключи `opacity` с `hold` (функция `win` в `char.jsx`).

## Шрифты
- Кириллица: `await p.add("<ttf>")` с файлом из `fc-list :lang=ru family file`, например `/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf`. Затем `fontFamily="Montserrat" fontWeight={800}`.
- **Не делать** `higgsedit fonts add` для семейства с кириллицей: латинская версия Montserrat перекроет её, и вместо букв будут пустые квадраты.
- Свои шрифты (Inter, Unbounded) можно скачать в `~/.fonts` (`curl` с github google/fonts) → `fc-cache -f` → `p.add("~/.fonts/X.ttf")`.

## Сборка и превью
- `cd edit && higgsedit build film.jsx`: если всё в порядке, ничего не печатает.
- Кадр: `higgsedit frame . <сек> --out prev/fN.png` → `ffmpeg ... scale=540:960` → смотреть через `image_paths` (до 4 JPEG, суммарно ≤ 512 КБ).
- Сравнение с референсом: `ffmpeg -i ref.jpg -i ours.jpg -filter_complex hstack cmp.jpg`.

## Рендер
- `higgsedit render . --bitrate 10M --range A:B --out renders/pA_B.mp4`. Флаги `--workers` и `--shards` не указывать, движок сам делит на окна.
- Фоновые задачи (`background:true`) ограничены 15 минутами. Делить на части по 7–13 с, по одной или три подряд в одном фоновом вызове, если влезают.
- XL-песочница (`size:"xl"`) даёт 4 ядра и примерно в 4 раза быстрее. После работы она гаснет через минуту, файлы сохраняются.
- Склейка: `printf "file 'p1.mp4'\n..." > l.txt && ffmpeg -f concat -safe 0 -i l.txt -an -c copy v.mp4`, потом `-i v.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out.mp4`.
- Пока рендер идёт, ждать опросами по 40–55 с (`sleep 50; tail log`). Длинные `sleep`-циклы обрывают соединение с коннектором.
- Остановка: `ps aux | grep higgsedit` → `kill <pid>`. **Не** `pkill -f`: он убьёт собственную оболочку.

## Громкость и выгрузка
- Рендер воспроизводит моно-дубль примерно на 3 dB тише, поэтому финальный звук подставлять из `mix.wav`.
- Цель — около −14 LUFS, пики ≤ −1 dBTP. Измерять: `ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`.
- Выгрузка:
  1. `media_upload {filename}`;
  2. в той же команде песочницы `curl -f -X PUT -H "Content-Type: video/mp4" -H "If-None-Match: *" --upload-file out.mp4 '<url>'`;
  3. после HTTP 200 — `media_confirm {type:"video"}`;
  4. `register_what_if_result`;
  5. `show_result {action:"content_factory_video"}`.
- Скачать на диск пользователя через `curl` из `https://d2ol7oe51mr4n9.cloudfront.net/...`.
- Передать локальные файлы (шаблоны, скрипты) в песочницу: `media_upload` general file (`.zip`/`.txt`, расширение `.sh` иногда даёт ошибку) → `curl PUT` с Windows → `media_confirm {type:"file"}` → `curl` в песочнице.

## Новая песочница
Ответ с `sandbox_created: true` значит, что всё стёрто. Залить шаблон и голос заново. Голос лежит по URL из `voice.json` или `media_id`.
