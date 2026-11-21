---
name: audio-sync-master
description: Посекундный анализ озвучки из golos/ и музыки из muzyka/ (речь, паузы, темп речи, BPM и доли) и автоматический расчёт таймингов смены кадров для Remotion по сценарию из stsenarii/ — JSON с from/durationInFrames для каждой сцены. Использовать, когда есть сценарий и озвучка и нужно синхронизировать кадры с голосом и битом, или когда кадры не попадают в речь.
---

# audio-sync-master — тайминги кадров по звуку

## Пути проекта

- Вход: `stsenarii/<id>.md` (таблица «Таймлайн»), `golos/<id>.mp3|wav`, трек из `muzyka/` (указан в сценарии в строке «Музыка:»).
- Выход: `render/remotion/src/data/<id>.timing.json` — его импортирует композиция Remotion.

## Запуск

Из корня репозитория:

```bash
python3 .claude/skills/audio-sync-master/scripts/sync.py \
  --stsenariy stsenarii/<id>.md --golos golos/<id>.mp3 \
  --muzyka muzyka/<trek>.mp3 --fps 30 \
  --out render/remotion/src/data/<id>.timing.json
```

Нужны только `ffmpeg` и `numpy`. `--muzyka` можно не указывать. `--hvost 0.8` — сколько секунд оставить после последней фразы.

## Как считается

1. **Речь и паузы:** `silencedetect` (−35 дБ, от 0.25 с) — участки речи и тишины.
2. **Строки сценария по речи:** каждая строка таймлайна получает долю речи по числу слов (ремарки в скобках не считаются). Темп речи (слов в минуту) — в JSON.
3. **Границы в паузах:** граница кадра переносится в ближайшую паузу (±0.4 с): в середину паузы, а в длинной (>0.8 с) — за 0.3 с до новой фразы. Так кадр не меняется посреди слова.
4. **Музыка:** темп (BPM) и сетка долей по атакам в спектре. Если доля попадает в ту же паузу — граница встаёт на долю (склейка в бит). Если пауз рядом нет — граница подтягивается к доле в пределах ±0.15 с.
5. **Фреймы:** секунды × fps → `from` и `durationInFrames` каждой сцены; `durationInFrames` всего ролика.

Колонка `granica` в JSON показывает, как поставлена граница: `пауза`, `пауза+доля`, `доля`, `по словам`.

## Проверка результата

- Сравни таблицу в выводе с плановым временем сценария: расхождение больше 30 % — повод пересмотреть текст строки или переозвучить.
- `по словам` у многих границ — пауз не нашлось: попробуй порог тише (в коде `noise_db`, например −40) или проверь, что в озвучке нет фонового шума/музыки.
- BPM может определиться вдвое больше или меньше настоящего (особенность всех детекторов) — сверь на слух; при сомнении запусти без `--muzyka`.
- Точность: доли ±20 мс, паузы ±30 мс — в пределах одного кадра при 30 fps.

## Использование в Remotion

```tsx
import timing from './data/<id>.timing.json';
import {Series, Audio, staticFile} from 'remotion';

// в Root.tsx: <Composition id="<id>" durationInFrames={timing.durationInFrames} fps={timing.fps} width={1080} height={1920} component={Video} />
export const Video = () => (
  <>
    <Audio src={staticFile('<id>/audio/<id>.mp3')} />
    <Audio src={staticFile('<id>/audio/<trek>.mp3')} volume={0.25} />
    <Series>
      {timing.sceny.map((s) => (
        <Series.Sequence key={s.id} durationInFrames={s.durationInFrames}>
          {/* сцена s.id: s.kadr */}
        </Series.Sequence>
      ))}
    </Series>
  </>
);
```

В HyperFrames используй те же `start`/`end` в секундах из `sceny`.
