import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
// Шрифты локально (public/fonts, из @fontsource) — без запросов к Google Fonts при рендере.
const face = (family: string, file: string, weight: string, range: string) =>
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, format: "woff2", unicodeRange: range });
const CYR = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116", LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
for (const w of ["800", "900"]) { face("Unbounded", `unbounded-cyrillic-${w}-normal.woff2`, w, CYR); face("Unbounded", `unbounded-latin-${w}-normal.woff2`, w, LAT); }
for (const w of ["700", "800", "900"]) { face("Montserrat", `montserrat-cyrillic-${w}-normal.woff2`, w, CYR); face("Montserrat", `montserrat-latin-${w}-normal.woff2`, w, LAT); }
export const FONT_TITLE = "Unbounded";
export const FONT_HUD = "Montserrat";
export const FONT_RUSSO = "Unbounded";
export const FONT_DELA = "Unbounded";
export const FONT_RUBIKMONO = "Unbounded";

// Цвета сняты пипеткой с оригиналов (см. analysis/)
export const C = {
  white: "#F2F2F0",
  red: "#F42A10",
  redDeep: "#5a0700",
  yellow: "#FFD000",
  orange: "#FF970F",
  green: "#2FE07A",
  ink: "#000000",
  pill: "rgba(6,8,8,0.82)",
  track: "#1b2626",
  navy: "#04111a",
};

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// Монтажная сетка: всё ставится на сильные доли. bar = 4 доли.
export const grid = (bpm: number) => {
  const beat = (60 / bpm) * FPS; // кадров на долю
  return { beat, bar: beat * 4, at: (bars: number, beats = 0) => Math.round((bars * 4 + beats) * beat) };
};

export const meterColor = (v: number) => (v > 60 ? C.green : v > 25 ? C.orange : C.red);
