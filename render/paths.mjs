// Общие пути проекта для кода рендера (Remotion и HyperFrames).
// Использование: import { PATHS } from '../paths.mjs' (из проекта внутри render/).
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const PATHS = {
  root: ROOT,
  stsenarii: path.join(ROOT, 'stsenarii'), // тексты роликов
  golos: path.join(ROOT, 'golos'),         // озвучка
  muzyka: path.join(ROOT, 'muzyka'),       // фоновая музыка с правом на использование
  render: path.join(ROOT, 'render'),       // код сцены и рендера
  gotovo: path.join(ROOT, 'gotovo'),       // готовые видео и обложки
};

// Путь для готового файла: outputFile('01-nazvanie.mp4') -> <repo>/gotovo/01-nazvanie.mp4
export const outputFile = (name) => path.join(PATHS.gotovo, name);
