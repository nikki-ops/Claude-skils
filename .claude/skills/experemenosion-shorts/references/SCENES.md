# Каталог готовых сцен и компонентов шаблона

Все пути — от корня проекта (копия `assets/template`). Каждая сцена рисует кадр целиком (1080×1920) и получает локальный кадр плана `frame`/`f` = 0..74. Всё детерминировано.

## Каркас (всегда)
| компонент | файл | что |
|---|---|---|
| `Caption text from dur top base` | `src/components/Caption.tsx` | титры по словам; `[..]` красный с глитчем, `{..}` жёлтый |
| `HUD left label value` | `src/components/HUD.tsx` | пилюли сверху (день + шкала) |
| `Counter text y danger`, `Note text y color size` | `src/components/HUD.tsx` | нижний счётчик; сноска под объектом |
| `Grain amount vignette` | `src/components/Film.tsx` | зерно + виньетка; `PaperTexture` для бумаги |
| `WarmPortraitBG`, `DeepBG`, `DarkGridBG` | `src/components/Backgrounds.tsx` | фон портрета / медвставки / «кабинет с сеткой» |
| `StatCard big sub src color from dur`, `EmberBG` | `src/components/StatCard.tsx` | итоговая карточка |
| `grid(bpm)`, цвета `C`, шрифты | `src/style/tokens.ts` | сетка тактов и палитра |
| `mulberry(seed)` | `src/components/rand.ts` | детерминированный ГСЧ |

## Сборка ролика — образец `src/rabies/`
- `shots.json` — сценарий: `bpm, bars, dropBar, breakBars, secondDrop, shots[]`. Один элемент = один такт: `{bar, kind, cap, hud:[label, from, to], note:[text, "y"|"r"], ...параметры сцены}`.
- `RabiesVideo.tsx` — диспетчер `kind → сцена`, HUD/титры/сноски поверх, тряска и красная пульсация на `[..]` и на `biteAt`, нырок (`hand.dive` → круг с микроскопом), вспышки на `dropBar`/`secondDrop`, один `<Audio>` с музыкой.
- `music_plan.json` — план трека для `tools/music2.mjs`.
- `previewEntry.tsx` — отдельный вход для быстрых стоп-кадров новых сцен.

## Портрет и руки (2D, аэрограф)
| сцена / kind | компонент | параметры |
|---|---|---|
| портрет `face` | `FaceOld` (`src/components/FaceOld.tsx`) | `frame blink mouth look pallor erase fear pupil redEye sweat flush spasm drool` |
| хук `hook` | `FaceOld` + `HandsWithGlass frame shake lift` (`src/hands/`) | руки держат дрожащий стакан |
| стакан от другого человека `offered` | `OfferedGlass frame progress` | женская рука справа |
| крупно `close`, рот `mouth` | `FaceOld` с масштабом 1,4–1,5 / 2,5–2,7 (origin 50% 61%) | |
| ветер `wind` | `Wind frame` + `Curtain frame` (`src/rabies/Props.tsx`, `Variety.tsx`) | |
| постель сверху `bed` | `BedTop frame face thermo breath` (`Variety.tsx`) | жар, умирание (`breath` 1→0) |
| кисть `hand` | `OldHand frame bite burn water soap syringe tremble` (`src/hands/OldHand.tsx`), `WOUND` = центр раны | нырок: масштаб ×7 в `WOUND` |
| глаз крупно `eye` | `EyeMacro frame pupil red fox dart` | галлюцинация в отражении |
| монитор `monitor` | `Monitor frame amp bpm` (`Props.tsx`) | ЭКГ → прямая |
| секундомер | `Stopwatch frame` | наложение |

Новый герой (женщина, ребёнок, молодой мужчина): копия `FaceOld.tsx` с другой формой головы (`HEAD = mirror([...])` по точкам), причёской, палитрой кожи. Метод тот же.

## 3D (Three.js, процедурно)
| сцена / kind | компонент | что |
|---|---|---|
| `foxEnter` | `FoxEnterShot frame` (`src/fox3d/Shots.tsx`) | ночной огород, лиса идёт к камере, глаза светятся |
| `foxAttack` | `FoxAttackShot frame` | сбоку: подкрадывается → прыжок (кадр 24–39) → укус руки (кадр 40) |
| `foxClose` | `FoxCloseUpShot frame` | морда 3/4, оскал, слюна, мех |
| `gardenDay` | `GardenDayShot frame` | огород днём, дед полет грядку (держать дальше — крупно маска) |
| низкий уровень | `Fox3D pose`, `OldMan3D pose`, `Garden3D daytime`, позы `gaitPose foxAttackPose foxCloseUpPose manAttackPose crouchPose` | своё животное/постановка |
| движок | `src/fox3d/sdf.ts` (SDF-примитивы, мешер, веса скина), `rig.ts` (кости, IK `ik2`, мех оболочками) | новые существа: собака, летучая мышь, крыса, комар… |
| рентген `xray` | `XrayShot frame p brainHit overlay` (`src/xray3d/`) | 3D-анатомия, путь возбудителя `p` 0..1, камера сама следует за `p` |
| нерв изнутри `nerve` | `Nerve t progress swarm speed` (`src/rabies/Nerve.tsx`) | золотой туннель, вирусы-«пули» |
| нейроны `neuro` | `Neurons t plaque loss virus` (`src/components/three/Neurons.tsx`) | бляшки оранжевые или заражение зелёным |
| сосуд | `Vessel t progress thick` (`src/components/three/Vessel.tsx`), демо `DemoVessel3D` | полёт с эритроцитами, кровь густеет |

**Путь возбудителя на рентгене** задан в `src/xray3d/anatomy.ts` → `NERVE` (`ctrl` — контрольные точки: кисть → предплечье → плечо → сплетение → спинной мозг → мозг). Для другой болезни: переписать `ctrl` (например, дыхательные пути → лёгкие для туберкулёза, вена → сердце для тромба), подсветку цели (`buildBrain`/`brainHit`) и кадрирование камеры `cameraRig(p, frame)` в `XrayShot.tsx`.

## Медвставки 2D
| kind | компонент | что |
|---|---|---|
| `throat` | `HeadSection frame spasm water` (`src/rabies/HeadSection.tsx`) | сагиттальный разрез: глотка сжимается, капля застревает |
| `saliva` | `HeadSection frame saliva` | слюнные железы светятся, протоки с вирусом |
| `micro` | `MicroscopeDrop frame density` | капля под микроскопом, возбудители шевелятся |
| `cross` | `NerveCross frame` | срез нерва, иммунные клетки снаружи |
| бумажная анатомия | `HeartPaper beat strain cracks`, `ECG`, `PlateFrame` (`src/components/HeartPaper.tsx`), демо `DemoPaperHeart` | сердце в ритме трека |

## Когда нужной сцены нет
Сделать новую по методу соседей и добавить её `kind` в диспетчер:
- орган/разрез в 2D — как `HeadSection` (силуэт по точкам, заливки, размытые тени, текстура feTurbulence, контур 4 px, процесс в кадре по параметру);
- живое существо в движении — 3D через `fox3d/sdf.ts` + `rig.ts`;
- путь по телу — `XrayShot` с новым `NERVE.ctrl`;
- проверить стоп-кадрами через `previewEntry.tsx` до сборки ролика.
