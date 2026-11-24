import { loadFont as loadUnbounded } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadRusso } from "@remotion/google-fonts/RussoOne";
import { loadFont as loadDela } from "@remotion/google-fonts/DelaGothicOne";
import { loadFont as loadRubikMono } from "@remotion/google-fonts/RubikMonoOne";

export const FONT_TITLE = loadUnbounded("normal", { weights: ["800", "900"], subsets: ["cyrillic", "latin"] }).fontFamily;
export const FONT_HUD = loadMontserrat("normal", { weights: ["700", "800", "900"], subsets: ["cyrillic", "latin"] }).fontFamily;
export const FONT_RUSSO = loadRusso("normal", { subsets: ["cyrillic", "latin"] }).fontFamily;
export const FONT_DELA = loadDela("normal", { subsets: ["cyrillic", "latin"] }).fontFamily;
export const FONT_RUBIKMONO = loadRubikMono("normal", { subsets: ["cyrillic", "latin"] }).fontFamily;

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
