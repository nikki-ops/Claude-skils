import React from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";
import { C, FONT_TITLE } from "../style/tokens";

// Разметка: строки через "\n"; [слова] — красный акцент, {слова} — жёлтый акцент.
// Пример: "ОНИ ТАНЦЕВАЛИ\n[ДО СМЕРТИ]"
export type Tok = { t: string; kind: "w" | "r" | "y" };
export const parseCaption = (s: string): Tok[][] =>
  s.split("\n").map((line) => {
    const out: Tok[] = [];
    const re = /\[([^\]]+)\]|\{([^}]+)\}|([^\s[{]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m[1]) m[1].split(/\s+/).forEach((t) => out.push({ t, kind: "r" }));
      else if (m[2]) m[2].split(/\s+/).forEach((t) => out.push({ t, kind: "y" }));
      else out.push({ t: m[3], kind: "w" });
    }
    return out;
  });

const OUT = (w: number) =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1.3], [0, 1.3], [-1.3, 0], [1.3, 0]]
    .map(([x, y]) => `${x * w}px ${y * w}px 0 #000`)
    .join(",");

export const wordStyle = (kind: Tok["kind"], size: number): React.CSSProperties => {
  const o = Math.max(3, size * 0.05);
  if (kind === "r")
    return { color: C.red, textShadow: `${OUT(o)}, 0 ${o * 1.4}px 0 ${C.redDeep}, 0 0 ${size * 0.35}px rgba(244,42,16,0.6)` };
  if (kind === "y")
    return { color: C.yellow, textShadow: `${OUT(o)}, 0 ${o * 1.2}px 0 #3a2a00, 0 0 ${size * 0.3}px rgba(255,208,0,0.55)` };
  return { color: C.white, textShadow: `${OUT(o)}, 0 ${o * 1.3}px ${o}px rgba(0,0,0,0.8)` };
};

// Оценка ширины для автоподгонки (Unbounded 900, капс): ~0.80 em на букву, пробел ~0.3 em
const estW = (toks: Tok[]) => toks.reduce((a, t) => a + t.t.length * 0.8, 0) + (toks.length - 1) * 0.3;

export const RoughFilter: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    {/* красный акцент: горизонтальные «разрывы» строк, как у автора (смаз по X полосами) */}
    <filter id="rough" x="-15%" y="-20%" width="130%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.003 0.22" numOctaves={1} seed={7} result="n" />
      <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1" result="nx" />
      <feDisplacementMap in="SourceGraphic" in2="nx" scale={22} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);

export const Caption: React.FC<{
  text: string;
  from: number;
  dur: number;
  top?: number;
  maxW?: number;
  base?: number;
  stagger?: number;
  inF?: number;
  outF?: number;
}> = ({ text, from, dur, top = 250, maxW = 900, base = 92, stagger = 3, inF = 5, outF = 5 }) => {
  const frame = useCurrentFrame() - from;
  if (frame < 0 || frame >= dur) return null;
  const lines = parseCaption(text);
  let idx = 0;
  const exitP = interpolate(frame, [dur - outF, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      <RoughFilter />
      {lines.map((toks, li) => {
        const accent = toks.every((t) => t.kind !== "w");
        const want = accent ? base * 1.12 : base;
        const size = Math.min(want, maxW / estW(toks));
        return (
          <div
            key={li}
            style={{ display: "flex", gap: size * 0.28, fontFamily: FONT_TITLE, fontWeight: 900, fontSize: size, lineHeight: 1.1, letterSpacing: -size * 0.025, whiteSpace: "nowrap" }}
          >
            {toks.map((tk, wi) => {
              const k = idx++;
              const f = frame - (k * stagger + (li > 0 ? 2 : 0));
              const p = interpolate(f, [0, inF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
              const spread = (wi - (toks.length - 1) / 2) * size * 0.6 * exitP;
              const rough = tk.kind === "r" ? "url(#rough) " : "";
              return (
                <span
                  key={wi}
                  style={{
                    display: "inline-block",
                    ...wordStyle(tk.kind, size),
                    transform: `translateX(${spread}px) scale(${interpolate(p, [0, 1], [1.55, 1]) * (1 + 0.06 * exitP)})`,
                    opacity: f < 0 ? 0 : interpolate(p, [0, 1], [0.35, 1]) * (1 - exitP),
                    filter: `${rough}blur(${(1 - p) * 9 + exitP * 7}px) grayscale(${(1 - p) * 0.8})`,
                  }}
                >
                  {tk.t}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
