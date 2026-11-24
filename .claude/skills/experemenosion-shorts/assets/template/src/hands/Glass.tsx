import React from "react";
import { mulberry } from "../components/rand";
import { P, smoothClosed, smoothOpen, blobPts } from "./geom";

// Стакан с водой в локальных координатах (центр 0,0). Толстое дно, тёмные края преломления,
// блики слева (ключевой свет), рябь и всплески при дрожи. Внутри — размытые «ладони» за стеклом.
export type GlassProps = {
  uid: string; frame: number; w?: number; h?: number; shake?: number; slosh?: number; level?: number;
  skin?: string; skinShadow?: string; handsBehind?: boolean;
};

export const GLASS_W = 250, GLASS_H = 380;

export const glassHalfW = (y: number, w = GLASS_W, h = GLASS_H) => {
  const t = (y + h / 2) / h;
  return (w / 2) * (1 - 0.12 * t);
};

export const Glass: React.FC<GlassProps> = ({ uid, frame, w = GLASS_W, h = GLASS_H, shake = 0, slosh = 0, level = 0.8, skin = "#d9a88e", skinShadow = "#9a6a58", handsBehind = true }) => {
  const id = (s: string) => `${uid}-${s}`;
  const u = (s: string) => `url(#${uid}-${s})`;
  const top = -h / 2, bot = h / 2;
  const tw = w / 2, bw = glassHalfW(bot, w, h);
  const ry = 15;
  const body = `M${-tw} ${top} L${-bw} ${bot - 10} Q${-bw} ${bot + ry} 0 ${bot + ry} Q${bw} ${bot + ry} ${bw} ${bot - 10} L${tw} ${top} Z`;
  const ws = bot - (h - 34) * level; // уровень воды
  const whw = glassHalfW(ws, w, h) - 3;
  const sl = Math.tan((slosh * Math.PI) / 180) * whw;
  const wave = (x: number) => Math.sin(x * 0.06 + frame * 0.9) * 2.2 * shake + Math.sin(x * 0.13 - frame * 1.7) * 1.2 * shake;
  const surfFront: P[] = Array.from({ length: 11 }, (_, i) => {
    const x = -whw + (2 * whw * i) / 10;
    return [x, ws + (x / whw) * sl + Math.sqrt(Math.max(0, 1 - (x / whw) ** 2)) * 11 + wave(x)];
  });
  const surfBack: P[] = Array.from({ length: 11 }, (_, i) => {
    const x = whw - (2 * whw * i) / 10;
    return [x, ws + (x / whw) * sl - Math.sqrt(Math.max(0, 1 - (x / whw) ** 2)) * 11 + wave(x + 40)];
  });
  const waterD = `${smoothOpen(surfFront)} L${bw} ${bot - 30} L${-bw} ${bot - 30} Z`;
  const surfD = smoothClosed([...surfFront, ...surfBack]);
  return (
    <g>
      <defs>
        <clipPath id={id("gc")}><path d={body} /></clipPath>
        <clipPath id={id("wc")}><path d={waterD} /></clipPath>
        <linearGradient id={id("edge")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#24363b" stopOpacity="0.55" />
          <stop offset="0.07" stopColor="#c8e2ea" stopOpacity="0.32" />
          <stop offset="0.16" stopColor="#ffffff" stopOpacity="0.06" />
          <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="0.92" stopColor="#9fc0ca" stopOpacity="0.25" />
          <stop offset="1" stopColor="#1e2e33" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={id("wat")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9d2dc" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4e7f8e" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={id("surf")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9cc4cf" stopOpacity="0.7" />
          <stop offset="0.35" stopColor="#f2fbfd" stopOpacity="0.75" />
          <stop offset="1" stopColor="#7fa7b4" stopOpacity="0.65" />
        </linearGradient>
        <filter id={id("bl")} filterUnits="userSpaceOnUse" x={-2000} y={-2000} width={4000} height={4000}><feGaussianBlur stdDeviation={6} /></filter>
        <filter id={id("bl2")} filterUnits="userSpaceOnUse" x={-2000} y={-2000} width={4000} height={4000}><feGaussianBlur stdDeviation={2} /></filter>
        <filter id={id("rip")} filterUnits="userSpaceOnUse" x={-400} y={-400} width={800} height={800}>
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves={2} seed={Math.floor(frame / 2) % 7 + 1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={10 + 14 * shake} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={3} />
        </filter>
      </defs>
      {/* лёгкое затемнение того, что за стеклом + тень от стекла на кардиган */}
      <path d={body} fill="#0f1a1e" opacity={0.12} />
      <g clipPath={u("gc")}>
        {/* ладони за стеклом: преломлены, размыты, подкрашены водой */}
        {handsBehind && (
          <g filter={u("rip")} opacity={0.75}>
            {[-1, 1].map((s) => (
              <g key={s}>
                <path d={smoothClosed(blobPts([s * (tw - 18), 30], 40, 120, mulberry(s + 5), 9, 0.2))} fill={skin} />
                <path d={smoothClosed(blobPts([s * (tw - 8), 40], 18, 110, mulberry(s + 9), 8, 0.2))} fill={skinShadow} opacity={0.6} />
                {[-40, 10, 60].map((y) => <path key={y} d={`M${s * (tw - 60)} ${y} Q${s * (tw - 30)} ${y + 6} ${s * tw} ${y + 2}`} stroke={skinShadow} strokeWidth={4} fill="none" opacity={0.7} />)}
              </g>
            ))}
          </g>
        )}
        {/* вода */}
        <path d={waterD} fill={u("wat")} />
        <g clipPath={u("wc")}>
          <rect x={-tw} y={ws - 20} width={w} height={h} fill="#0e2128" opacity={0.12} />
          {[-1, 1].map((s) => <rect key={s} x={s < 0 ? -tw : tw - 26} y={ws} width={26} height={h} fill="#1b3a42" opacity={0.35} filter={u("bl")} />)}
          {/* каустика и пузырьки */}
          {Array.from({ length: 9 }, (_, i) => {
            const r = mulberry(40 + i);
            const x = (r() - 0.5) * w * 0.8, y = ws + 30 + r() * (bot - ws - 70);
            return <circle key={i} cx={x + Math.sin(frame * 0.2 + i) * 2} cy={y - ((frame * (0.4 + r() * 0.5)) % 40) * shake} r={1.5 + r() * 2.5} fill="none" stroke="#eaf8fc" strokeWidth={1} opacity={0.6} />;
          })}
        </g>
        {/* поверхность воды, мениск, рябь */}
        <path d={surfD} fill={u("surf")} />
        <path d={smoothOpen(surfBack)} stroke="#4c7480" strokeWidth={1.6} fill="none" opacity={0.6} />
        <path d={smoothOpen(surfFront)} stroke="#ffffff" strokeWidth={2.6} fill="none" opacity={0.85} />
        {[0, 1, 2].map((k) => {
          const t = ((frame * 0.05 * (0.6 + shake) + k / 3) % 1);
          return <ellipse key={k} cx={Math.sin(frame * 0.3) * 8 * shake} cy={ws + Math.sin(frame * 0.3) * sl * 0.05} rx={whw * 0.9 * t} ry={9 * t} fill="none" stroke="#ffffff" strokeWidth={1.6} opacity={(1 - t) * 0.7 * Math.min(1, shake + 0.2)} />;
        })}
        {/* толстое дно */}
        <path d={`M${-bw} ${bot - 30} Q0 ${bot - 18} ${bw} ${bot - 30} L${bw} ${bot - 6} Q0 ${bot + ry} ${-bw} ${bot - 6} Z`} fill="#c9e2e8" opacity={0.35} />
        <path d={`M${-bw + 10} ${bot - 22} Q0 ${bot - 10} ${bw - 10} ${bot - 22}`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.7} />
        <path d={`M${-bw + 20} ${bot - 4} Q0 ${bot + 10} ${bw - 20} ${bot - 4}`} stroke="#2e4a52" strokeWidth={2.5} fill="none" opacity={0.5} />
        {/* края стекла темнее (преломление), блики */}
        <path d={body} fill={u("edge")} />
        <path d={`M${-tw + 20} ${top + 26} L${-bw + 18} ${bot - 40}`} stroke="#ffffff" strokeWidth={18} opacity={0.22} filter={u("bl")} />
        <path d={`M${-tw + 17} ${top + 30} L${-bw + 15} ${bot - 46}`} stroke="#ffffff" strokeWidth={3.5} opacity={0.75} strokeLinecap="round" />
        <path d={`M${-tw + 34} ${top + 60} L${-tw + 32} ${top + 150}`} stroke="#ffffff" strokeWidth={2} opacity={0.5} strokeLinecap="round" />
        <path d={`M${tw - 13} ${top + 40} L${bw - 12} ${bot - 60}`} stroke="#ffffff" strokeWidth={2.4} opacity={0.45} strokeLinecap="round" />
      </g>
      {/* контур и кромка */}
      <path d={body} fill="none" stroke="#2c3f45" strokeWidth={3.5} opacity={0.45} />
      <path d={body} fill="none" stroke="#d6eef5" strokeWidth={1.6} opacity={0.6} />
      <ellipse cx={0} cy={top} rx={tw} ry={ry} fill="none" stroke="#e9f7fb" strokeWidth={3} opacity={0.75} />
      <ellipse cx={0} cy={top} rx={tw - 5} ry={ry - 4} fill="none" stroke="#3a535a" strokeWidth={1.4} opacity={0.4} />
      <path d={`M${-tw * 0.75} ${top + ry * 0.66} Q${-tw * 0.4} ${top + ry} ${-tw * 0.1} ${top + ry * 1.0}`} stroke="#fff" strokeWidth={3.5} fill="none" opacity={0.9} strokeLinecap="round" />
    </g>
  );
};

// брызги над поверхностью и капля, стекающая по стенке (рисуется поверх рук)
export const GlassSplash: React.FC<{ frame: number; shake: number; w?: number; h?: number; level?: number }> = ({ frame, shake, w = GLASS_W, h = GLASS_H, level = 0.8 }) => {
  if (shake < 0.2) return null;
  const bot = h / 2;
  const ws = bot - (h - 34) * level;
  return (
    <g>
      {Array.from({ length: 9 }, (_, i) => {
        const r = mulberry(300 + i);
        const per = 18 + r() * 16;
        const t = ((frame + r() * per) % per) / per;
        if (r() > shake) return null;
        const x0 = (r() - 0.5) * w * 0.7, vx = (r() - 0.5) * 60;
        const y = ws - (80 + r() * 60) * 4 * t * (1 - t) * shake;
        const s = 2.5 + r() * 3;
        return <g key={i} opacity={1 - t * 0.4}><circle cx={x0 + vx * t} cy={y} r={s} fill="#e6f6fb" opacity={0.8} stroke="#7fa6b2" strokeWidth={0.8} /><circle cx={x0 + vx * t - s * 0.3} cy={y - s * 0.3} r={s * 0.35} fill="#fff" /></g>;
      })}
      {(() => {
        const t = (frame % 70) / 70;
        const x = -w / 2 + 8 + t * 4, y = -h / 2 + 30 + t * t * 260;
        return <g opacity={0.8 * shake}><path d={`M${x} ${-h / 2 + 20} L${x} ${y}`} stroke="#e8f6fa" strokeWidth={2} opacity={0.5} /><ellipse cx={x} cy={y} rx={3.5} ry={5} fill="#eef8fb" stroke="#7fa6b2" strokeWidth={0.8} /></g>;
      })()}
    </g>
  );
};
