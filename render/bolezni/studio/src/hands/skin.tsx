import React from "react";
import { mulberry } from "../components/rand";
import { FingerGeom, LIGHT, P, add, mul, sub, dirOf, nrmOf, smoothClosed, smoothOpen, offsetPoly, DEG } from "./geom";

// Палитры кожи. Старая — приглушённая, как у FaceOld; молодая — светлее и розовее.
export type Pal = {
  hi: string; light: string; base: string; mid: string; shadow: string; deep: string; cool: string; line: string;
  vein: string; nailBed: string; lunula: string; freeEdge: string; spot: string; red: string; age: number;
};
export const OLD: Pal = {
  hi: "#f3d3bb", light: "#ecc4a8", base: "#e2b59c", mid: "#c99179", shadow: "#94604e", deep: "#6e4034", cool: "#6f5a70", line: "#6b3d2e",
  vein: "#6f7fae", nailBed: "#e0b0a2", lunula: "#f0dcd0", freeEdge: "#ece0c4", spot: "#9a5f45", red: "#c4706a", age: 1,
};
export const YOUNG: Pal = {
  hi: "#fde6d6", light: "#f6d2bb", base: "#efc2a7", mid: "#dca286", shadow: "#b4735e", deep: "#8a4e40", cool: "#8c6c7c", line: "#7a4434",
  vein: "#a9b2cc", nailBed: "#eab0ab", lunula: "#f8e4de", freeEdge: "#faf1e8", spot: "#c48a70", red: "#d98a80", age: 0,
};

export const Blur = ({ id, s }: { id: string; s: number }) => (
  // область фильтра в координатах пользователя: иначе размытие тонких прямых линий обрезается по их bbox
  <filter id={id} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={7000} height={7000}><feGaussianBlur stdDeviation={s} /></filter>
);

// общие фильтры: размытия + две процедурные текстуры кожи (крупные пятна и мелкий шум) + «креп» (сетка мелких складок)
export const SkinDefs: React.FC<{ p: string; seed?: number }> = ({ p, seed = 3 }) => (
  <>
    {[1.5, 3, 5, 8, 12, 18, 28, 42].map((s) => <Blur key={s} id={`${p}b${s}`} s={s} />)}
    <filter id={`${p}tex`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} seed={seed} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 -1.25 0.98" />
    </filter>
    <filter id={`${p}blot`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves={3} seed={seed + 6} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.33  0 0 0 0 0.34  0 0 0 -2.3 1.28" />
    </filter>
    <filter id={`${p}crepe`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.09 0.022" numOctaves={2} seed={seed + 11} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.22  0 0 0 0 0.18  0 0 0 -3.2 1.15" />
    </filter>
  </>
);

// морщина: две линии разной толщины
export const Wr: React.FC<{ d: string; w?: number; o?: number; c?: string }> = ({ d, w = 2.6, o = 0.7, c = "#6b3d2e" }) => (
  <>
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" opacity={o * 0.5} />
    <path d={d} stroke={c} strokeWidth={w * 0.48} strokeLinecap="round" fill="none" opacity={o} />
  </>
);

const pd = (pts: P[]) => smoothOpen(pts);
const litSignOf = (t: number) => (nrmOf(t)[0] * LIGHT[0] + nrmOf(t)[1] * LIGHT[1] > 0 ? 1 : -1);

// морщинистые кольца на суставе: дуги поперёк пальца с разрывами
const jointLines = (J: P, t: number, hw: number, cnt: number, spread: number, rnd: () => number, bowSign = 1) => {
  const out: string[] = [];
  const d = dirOf(t), n = nrmOf(t);
  const sp = hw * 0.2;
  for (let k = 0; k < cnt; k++) {
    const o = (k - (cnt - 1) / 2) * sp + (rnd() - 0.5) * sp * 0.4;
    const a = hw * spread * (0.95 - Math.abs(o) / hw * 0.7) * (0.85 + rnd() * 0.25);
    const bow = hw * (0.1 + rnd() * 0.08) * bowSign * (o < 0 ? 0.6 : 1);
    const c = add(J, mul(d, o));
    const pt = (u: number): P => add(add(c, mul(n, u * a)), mul(d, bow * (1 - u * u)));
    const gap = 0.25 + rnd() * 0.5;
    const us1 = [-1, -0.5, gap - 0.62, gap - 0.5].filter((u, i, arr) => i === 0 || u > arr[i - 1]);
    const us2 = [gap - 0.38, gap - 0.1, 0.5, 1].filter((u, i, arr) => i === 0 || u > arr[i - 1]);
    if (rnd() > 0.25) out.push(pd(us1.map(pt)));
    out.push(pd(us2.map(pt)));
  }
  return out;
};

export type FingerOpts = { id: string; pal: Pal; frame?: number; seed?: number; hairs?: number; wrinkle?: number; nails?: boolean; fill: string; stroke?: number; mcpWrinkles?: boolean; joints?: number[]; mode?: "full" | "shade"; edge?: boolean };

// Один палец: обводка + заливка + аэрограф + морщины + ноготь, всё растворяется к корню через маску
export const FingerView: React.FC<{ g: FingerGeom; o: FingerOpts }> = ({ g, o }) => {
  const { pal, id } = o;
  const rnd = mulberry(o.seed ?? 7);
  const hw = g.hw;
  const t0 = g.th[0];
  const ls = litSignOf(t0);
  const n = g.spec.segs.length;
  const strip = (k: number) => pd(offsetPoly(g.axis, k * hw * ls));
  const wr = o.wrinkle ?? 1;
  const joints = o.joints ?? (n === 3 ? [2, 3] : [2]);
  const nailLs = litSignOf(g.nail.t);
  const nl = g.nail;
  const nailPts: P[] = [
    [-0.47, 0.42], [-0.5, 0.05], [-0.47, -0.36], [-0.32, -0.5], [0, -0.54], [0.32, -0.5], [0.47, -0.36], [0.5, 0.05], [0.47, 0.42], [0.26, 0.53], [0, 0.56], [-0.26, 0.53],
  ].map(([x, y]) => [x * nl.w, y * nl.L] as P);
  const nailD = smoothClosed(nailPts);
  const hairs = o.hairs ?? 0;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}fg`} gradientUnits="userSpaceOnUse" x1={g.fadeFrom[0]} y1={g.fadeFrom[1]} x2={g.fadeTo[0]} y2={g.fadeTo[1]}>
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000">
          <path d={g.path} fill={`url(#${id}fg)`} stroke={`url(#${id}fg)`} strokeWidth={8} />
        </mask>
        <clipPath id={`${id}c`}><path d={g.path} /></clipPath>
        <clipPath id={`${id}nc`}><path d={nailD} /></clipPath>
      </defs>
      <g mask={`url(#${id}m)`}>
        {o.mode !== "shade" && <path d={g.path} fill="none" stroke={pal.line} strokeWidth={o.stroke ?? 6} />}
        {o.mode !== "shade" && <path d={g.path} fill={o.fill} />}
        <g clipPath={`url(#${id}c)`}>
          {/* объём цилиндра: освещённая сторона, блик, теневая сторона, холодный рефлекс */}
          <path d={strip(1.05)} stroke={pal.mid} strokeWidth={hw * 0.3} fill="none" opacity={0.35} filter={`url(#${o.id.split("-")[0]}-b5)`} />
          <path d={strip(0.42)} stroke={pal.hi} strokeWidth={hw * 0.75} fill="none" opacity={0.6} strokeLinecap="round" filter={`url(#${o.id.split("-")[0]}-b8)`} />
          <path d={strip(0.2)} stroke="#fff4ea" strokeWidth={hw * 0.16} fill="none" opacity={0.28} strokeLinecap="round" filter={`url(#${o.id.split("-")[0]}-b3)`} />
          <path d={strip(-0.8)} stroke={pal.shadow} strokeWidth={hw * 0.75} fill="none" opacity={0.55} filter={`url(#${o.id.split("-")[0]}-b8)`} />
          <path d={strip(-1.02)} stroke={pal.cool} strokeWidth={hw * 0.35} fill="none" opacity={0.45} filter={`url(#${o.id.split("-")[0]}-b5)`} />
          {/* кончик розовее, суставы краснее */}
          <path d={pd([g.J[n - 1], g.J[n]].map((p, i) => (i ? p : add(p, mul(dirOf(g.th[n - 1]), g.spec.segs[n - 1] * 0.5)))))} stroke={pal.red} strokeWidth={hw * 1.3} opacity={0.22} filter={`url(#${o.id.split("-")[0]}-b12)`} />
          {joints.map((j) => {
            const J = g.J[j], t = g.jointAng[j], d = dirOf(t), nn = nrmOf(t);
            const hiP = add(add(J, mul(nn, ls * hw * 0.25)), mul(d, -hw * 0.05));
            return (
              <g key={`k${j}`}>
                <ellipse cx={J[0]} cy={J[1]} rx={hw * 0.75} ry={hw * 0.6} transform={`rotate(${t / DEG} ${J[0]} ${J[1]})`} fill={pal.red} opacity={0.18 + 0.1 * pal.age} filter={`url(#${o.id.split("-")[0]}-b8)`} />
                <ellipse cx={hiP[0]} cy={hiP[1]} rx={hw * 0.32} ry={hw * 0.42} transform={`rotate(${t / DEG} ${hiP[0]} ${hiP[1]})`} fill={pal.hi} opacity={0.55} filter={`url(#${o.id.split("-")[0]}-b5)`} />
                {[-1, 1].map((sg) => {
                  const q = add(J, mul(d, sg * hw * 0.62));
                  return <ellipse key={sg} cx={q[0]} cy={q[1]} rx={hw * 0.7} ry={hw * 0.16} transform={`rotate(${t / DEG} ${q[0]} ${q[1]})`} fill={pal.shadow} opacity={0.22} filter={`url(#${o.id.split("-")[0]}-b5)`} />;
                })}
              </g>
            );
          })}
          {/* волоски на основной фаланге */}
          {hairs > 0 && Array.from({ length: hairs }, (_, i) => {
            const u = 0.3 + rnd() * 0.5;
            const base = add(lerpP(g.J[0], g.J[1], u), mul(nrmOf(t0), (rnd() - 0.5) * hw * 1.2));
            const a = t0 + (rnd() * 0.5 + 0.2) * ls * -1;
            const L = 9 + rnd() * 9;
            const e = add(base, mul(dirOf(a), L));
            return <path key={`h${i}`} d={`M${base[0].toFixed(1)} ${base[1].toFixed(1)} Q${(base[0] + e[0]) / 2 + 2} ${(base[1] + e[1]) / 2} ${e[0].toFixed(1)} ${e[1].toFixed(1)}`} stroke={rnd() > 0.5 ? "#8a7366" : "#b7a89a"} strokeWidth={1.2} fill="none" opacity={0.65} strokeLinecap="round" />;
          })}
        </g>
        {/* морщины суставов */}
        <g clipPath={`url(#${id}c)`}>
          {joints.map((j) => {
            const cnt = j === joints[0] ? Math.round(4 + 3 * pal.age * wr) : Math.round(2 + 2 * pal.age * wr);
            return jointLines(g.J[j], g.jointAng[j], hw, cnt, 0.82, rnd, 1).map((d, k) => <Wr key={`w${j}${k}`} d={d} w={2.4} o={(0.35 + 0.3 * pal.age) * wr} c={pal.line} />);
          })}
        </g>
        {o.edge && <path d={g.path} fill="none" stroke={pal.line} strokeWidth={3} />}
      </g>
      {/* ноготь: ложе, лунка, свободный край, продольные бороздки, блик, кутикула */}
      {o.nails !== false && (
        <g transform={`translate(${nl.c[0].toFixed(1)} ${nl.c[1].toFixed(1)}) rotate(${(nl.t / DEG).toFixed(2)})`}>
          <path d={`M${-nl.w * 0.62} ${nl.L * 0.42} Q0 ${nl.L * 0.82} ${nl.w * 0.62} ${nl.L * 0.42}`} stroke={pal.shadow} strokeWidth={nl.w * 0.22} fill="none" opacity={0.3} filter={`url(#${o.id.split("-")[0]}-b3)`} />
          <path d={nailD} fill={pal.nailBed} />
          <g clipPath={`url(#${id}nc)`}>
            <rect x={-nl.w} y={-nl.L} width={nl.w * 2} height={nl.L * 2} fill={pal.mid} opacity={0.25} />
            <ellipse cx={0} cy={0} rx={nl.w * 0.42} ry={nl.L * 0.5} fill={pal.nailBed} opacity={0.9} filter={`url(#${o.id.split("-")[0]}-b3)`} />
            <ellipse cx={0} cy={nl.L * 0.52} rx={nl.w * 0.3} ry={nl.L * (0.12 + 0.08 * (1 - pal.age))} fill={pal.lunula} opacity={0.8} />
            <path d={`M${-nl.w} ${-nl.L * 0.38} Q0 ${-nl.L * 0.44} ${nl.w} ${-nl.L * 0.38} L${nl.w} ${-nl.L} L${-nl.w} ${-nl.L} Z`} fill={pal.freeEdge} opacity={0.85} />
            <path d={`M${-nl.w} ${-nl.L * 0.36} Q0 ${-nl.L * 0.42} ${nl.w} ${-nl.L * 0.36}`} stroke={pal.shadow} strokeWidth={1.4} fill="none" opacity={0.45} />
            {[-0.3, -0.12, 0.08, 0.26].map((x, i) => <path key={i} d={`M${x * nl.w} ${nl.L * 0.38} L${x * nl.w * 1.05} ${-nl.L * 0.34}`} stroke={pal.shadow} strokeWidth={1.1} opacity={0.12 + 0.12 * pal.age} />)}
            <ellipse cx={nailLs * nl.w * 0.24} cy={-nl.L * 0.02} rx={nl.w * 0.09} ry={nl.L * 0.32} fill="#fff" opacity={0.6} filter={`url(#${o.id.split("-")[0]}-b1.5)`} />
            <rect x={-nl.w * 0.6 * nailLs - nl.w * 0.12} y={-nl.L} width={nl.w * 0.24} height={nl.L * 2} fill={pal.shadow} opacity={0.3} filter={`url(#${o.id.split("-")[0]}-b3)`} />
          </g>
          <path d={nailD} fill="none" stroke={pal.line} strokeWidth={1.8} opacity={0.85} />
          {/* кутикула — складка кожи над лункой */}
          <path d={`M${-nl.w * 0.5} ${nl.L * 0.4} Q0 ${nl.L * 0.7} ${nl.w * 0.5} ${nl.L * 0.4}`} stroke={pal.hi} strokeWidth={3} fill="none" opacity={0.7} />
          <path d={`M${-nl.w * 0.47} ${nl.L * 0.44} Q0 ${nl.L * 0.68} ${nl.w * 0.47} ${nl.L * 0.44}`} stroke={pal.line} strokeWidth={1.4} fill="none" opacity={0.7} />
          {[-1, 1].map((sg) => <path key={sg} d={`M${sg * nl.w * 0.56} ${nl.L * 0.38} Q${sg * nl.w * 0.62} 0 ${sg * nl.w * 0.5} ${-nl.L * 0.38}`} stroke={pal.line} strokeWidth={1.2} fill="none" opacity={0.4} />)}
        </g>
      )}
    </g>
  );
};
const lerpP = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// выпуклая вена: тень снизу-справа, голубое тело, блик сверху-слева
export const Vein: React.FC<{ pts: P[]; w: number; pal: Pal; p: string; o?: number }> = ({ pts, w, pal, p, o = 1 }) => {
  const d = smoothOpen(pts);
  return (
    <g opacity={o}>
      <path d={d} transform={`translate(${w * 0.45} ${w * 0.5})`} stroke={pal.deep} strokeWidth={w * 0.8} fill="none" opacity={0.32} strokeLinecap="round" filter={`url(#${p}b5)`} />
      <path d={d} transform={`translate(${-w * 0.35} ${-w * 0.35})`} stroke={pal.hi} strokeWidth={w * 0.9} fill="none" opacity={0.45} strokeLinecap="round" filter={`url(#${p}b5)`} />
      <path d={d} stroke={pal.vein} strokeWidth={w * 0.75} fill="none" opacity={0.5} strokeLinecap="round" filter={`url(#${p}b3)`} />
      <path d={d} transform={`translate(${w * 0.12} ${w * 0.12})`} stroke="#5d5f8c" strokeWidth={w * 0.32} fill="none" opacity={0.3} strokeLinecap="round" filter={`url(#${p}b1.5)`} />
      <path d={d} transform={`translate(${-w * 0.22} ${-w * 0.22})`} stroke="#fff1e6" strokeWidth={w * 0.14} fill="none" opacity={0.45} strokeLinecap="round" filter={`url(#${p}b1.5)`} />
    </g>
  );
};

export const AgeSpots: React.FC<{ n: number; seed: number; box: [number, number, number, number]; pal: Pal; p: string; scale?: number }> = ({ n, seed, box, pal, p, scale = 1 }) => {
  const r = mulberry(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const c: P = [box[0] + r() * box[2], box[1] + r() * box[3]];
        const big = r() > 0.7;
        const rx = (big ? 10 + r() * 14 : 3 + r() * 6) * scale, ry = rx * (0.6 + r() * 0.5);
        const pts = Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2, rr = 0.75 + r() * 0.45;
          return [c[0] + Math.cos(a) * rx * rr, c[1] + Math.sin(a) * ry * rr] as P;
        });
        return <path key={i} d={smoothClosed(pts)} fill={r() > 0.4 ? pal.spot : "#7d4a36"} opacity={big ? 0.22 + r() * 0.16 : 0.3 + r() * 0.25} filter={`url(#${p}b${big ? 3 : 1.5})`} />;
      })}
    </g>
  );
};

// мелкая «креповая» морщинистость: короткие тонкие штрихи
export const Crepe: React.FC<{ n: number; seed: number; box: [number, number, number, number]; c: string; o?: number; ang?: number }> = ({ n, seed, box, c, o = 0.2, ang = 0 }) => {
  const r = mulberry(seed);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = box[0] + r() * box[2], y = box[1] + r() * box[3];
        const a = ang + (r() - 0.5) * 0.9, L = 8 + r() * 22;
        const dx = Math.cos(a) * L, dy = Math.sin(a) * L;
        return <path key={i} d={`M${(x - dx / 2).toFixed(1)} ${(y - dy / 2).toFixed(1)} q${(dx / 2 + (r() - 0.5) * 4).toFixed(1)} ${(dy / 2 + (r() - 0.5) * 5).toFixed(1)} ${dx.toFixed(1)} ${dy.toFixed(1)}`} stroke={c} strokeWidth={0.9 + r() * 0.8} fill="none" opacity={o * (0.5 + r())} strokeLinecap="round" />;
      })}
    </g>
  );
};

// вязаная фактура: резинка (вертикальные рубчики) и гладь (V-петли)
export const KnitDefs: React.FC<{ p: string; c1: string; c2: string; c3: string; rib?: number; rot?: number }> = ({ p, c1, c2, c3, rib = 20, rot = 0 }) => (
  <>
    <pattern id={`${p}rib`} width={rib} height={24} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}>
      <rect width={rib} height={24} fill={c2} />
      <rect x={rib * 0.08} width={rib * 0.5} height={24} rx={rib * 0.22} fill={c1} />
      <rect x={rib * 0.18} width={rib * 0.14} height={24} fill={c3} opacity={0.35} />
      <path d={`M${rib * 0.08} 6 q${rib * 0.25} 5 ${rib * 0.5} 0 M${rib * 0.08} 18 q${rib * 0.25} 5 ${rib * 0.5} 0`} stroke={c2} strokeWidth={1.2} fill="none" opacity={0.6} />
    </pattern>
    <pattern id={`${p}st`} width={22} height={18} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rot})`}>
      <rect width={22} height={18} fill={c2} />
      <path d="M2 1 Q4 12 11 17 Q8 6 2 1 Z" fill={c1} />
      <path d="M20 1 Q18 12 11 17 Q14 6 20 1 Z" fill={c1} opacity={0.85} />
      <path d="M4 3 Q6 10 10 14" stroke={c3} strokeWidth={1.2} fill="none" opacity={0.45} />
    </pattern>
    <filter id={`${p}fuzz`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves={2} seed={4} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.11  0 0 0 0 0.13  0 0 0 -1.4 0.95" />
    </filter>
  </>
);
