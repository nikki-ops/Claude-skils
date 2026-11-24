import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { mulberry } from "../components/rand";

// Новые сцены ролика «Столбняк»: сарай с ржавой проволокой (2D) и тело дугой — опистотонус (2D, аэрограф).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------- Сарай: доски, луч света, пыль, моток ржавой проволоки ----------
export const ShedWire: React.FC<{ frame: number; B?: number }> = ({ frame: f, B = 75 }) => {
  const r = mulberry(31);
  const boards = Array.from({ length: 9 }, (_, i) => ({ x: i * 122 - 10, w: 118 + r() * 8, tone: 22 + r() * 14 }));
  const dust = Array.from({ length: 90 }, () => ({ x: r(), y: r(), s: 1 + r() * 3, v: 0.2 + r() * 0.6, ph: r() * 6 }));
  // моток: 26 витков-эллипсов с дрожанием и разной ржавчиной
  const loops = Array.from({ length: 26 }, (_, i) => ({ rx: 210 + r() * 40, ry: 120 + r() * 30, rot: -18 + r() * 36, dx: (r() - 0.5) * 50, dy: (r() - 0.5) * 34, c: ["#7a3a1a", "#9a4a20", "#5c2a12", "#b0602a", "#6a4a3a"][i % 5], w: 5 + r() * 3 }));
  const zoom = interpolate(f, [0, B], [1, 1.08]);
  return (
    <AbsoluteFill style={{ background: "#0d0805", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 62%" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <defs>
            <filter id="shBlur"><feGaussianBlur stdDeviation="18" /></filter>
            <filter id="shGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.03" numOctaves={2} seed={4} /><feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.03  0 0 0 0.5 0" /></filter>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" /><stop offset="1" stopColor="#ffb060" stopOpacity="0" /></linearGradient>
            <radialGradient id="wireLight" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffb060" stopOpacity="0.35" /><stop offset="1" stopColor="#ffb060" stopOpacity="0" /></radialGradient>
          </defs>
          {boards.map((b, i) => <rect key={i} x={b.x} y={0} width={b.w} height={1920} fill={`rgb(${b.tone + 18},${b.tone + 8},${b.tone})`} />)}
          {boards.map((b, i) => <rect key={`g${i}`} x={b.x + b.w - 4} y={0} width={4} height={1920} fill="#050302" />)}
          <rect x={0} y={0} width={1080} height={1920} filter="url(#shGrain)" />
          {/* щель в стене и луч */}
          <rect x={760} y={180} width={26} height={520} fill="#ffe8c0" opacity={0.85} />
          <polygon points="760,180 786,180 640,1920 -200,1920" fill="url(#beam)" opacity={0.75 + Math.sin(f / 9) * 0.05} />
          {/* верстак */}
          <rect x={-20} y={1360} width={1120} height={60} fill="#3a2414" />
          <rect x={-20} y={1420} width={1120} height={500} fill="#1a0f08" />
          <ellipse cx={540} cy={1300} rx={420} ry={150} fill="url(#wireLight)" />
          {/* моток проволоки */}
          <g transform="translate(540 1200)">
            <ellipse cx={0} cy={170} rx={300} ry={40} fill="#000" opacity={0.55} filter="url(#shBlur)" />
            {loops.map((l, i) => <ellipse key={i} cx={l.dx} cy={l.dy} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot})`} fill="none" stroke={l.c} strokeWidth={l.w} opacity={0.92} />)}
            {loops.filter((_, i) => i % 3 === 0).map((l, i) => <ellipse key={`h${i}`} cx={l.dx - 4} cy={l.dy - 4} rx={l.rx} ry={l.ry} transform={`rotate(${l.rot})`} fill="none" stroke="#e0905a" strokeWidth={1.5} strokeDasharray="30 90" opacity={0.6} />)}
            {/* торчащий острый конец */}
            <path d="M 180 -40 C 260 -120 300 -200 330 -330" stroke="#8a4420" strokeWidth={7} fill="none" strokeLinecap="round" />
            <path d="M 326 -322 L 338 -350" stroke="#d07040" strokeWidth={4} strokeLinecap="round" />
            {Array.from({ length: 14 }, (_, i) => { const t = i / 13; return <circle key={i} cx={180 + t * 150} cy={-40 - t * 290 + Math.sin(t * 9) * 8} r={3 + (i % 3)} fill="#5a2408" opacity={0.8} />; })}
          </g>
          {/* пыль в луче */}
          {dust.map((d, i) => { const y = ((d.y * 1920 - f * d.v * 2) % 1920 + 1920) % 1920; const x = 300 + d.x * 500 + Math.sin(f / 20 + d.ph) * 20 + (y / 1920) * -200; return <circle key={i} cx={x} cy={y} r={d.s} fill="#ffe2b0" opacity={0.25 + 0.35 * Math.abs(Math.sin(f / 15 + d.ph))} />; })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Опистотонус: тело выгнуто дугой, вид сбоку, в постели ----------
export const ArchBody: React.FC<{ frame: number; B?: number }> = ({ frame: f, B = 75 }) => {
  const wave = Math.max(0, Math.sin((f / B) * Math.PI * 3 - 0.4));
  const a = 0.55 + 0.45 * wave; // сила дуги
  const tremor = Math.sin(f * 2.3) * 3 * a;
  const lift = 260 * a; // подъём середины спины
  const bedY = 1250;
  // линия спины: пятки (900) → поясница (поднята) → затылок (180)
  const back = `M 930 ${bedY - 40} C 820 ${bedY - 60 - lift * 0.4} 700 ${bedY - 90 - lift} 560 ${bedY - 100 - lift} C 420 ${bedY - 100 - lift} 300 ${bedY - 80 - lift * 0.6} 230 ${bedY - 60}`;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 55% at 50% 60%, #241812, #0a0605)" }}>
      <AbsoluteFill style={{ transform: `translate(${tremor}px,0) scale(${interpolate(f, [0, B], [1, 1.06])})`, transformOrigin: "50% 62%" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <defs>
            <filter id="abBlur"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="abSoft"><feGaussianBlur stdDeviation="0.8" /></filter>
            <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9d2c4" /><stop offset="1" stopColor="#8a8276" /></linearGradient>
            <radialGradient id="skinH" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#E2B59C" /><stop offset="0.6" stopColor="#C99179" /><stop offset="1" stopColor="#94604E" /></radialGradient>
          </defs>
          {/* кровать */}
          <rect x={60} y={bedY} width={960} height={70} rx={14} fill="#6a5a48" />
          <rect x={60} y={bedY + 70} width={960} height={40} fill="#3a2e24" />
          <rect x={70} y={bedY - 30} width={940} height={40} rx={18} fill="#cfc6b6" />
          <rect x={90} y={bedY - 90} width={240} height={80} rx={40} fill="#e8e2d6" />
          {/* тень под дугой */}
          <ellipse cx={560} cy={bedY - 10} rx={330} ry={30} fill="#000" opacity={0.35 * a} filter="url(#abBlur)" />
          {/* тело: толщина между линией спины и живота */}
          <g filter="url(#abSoft)">
            <path d={`${back} L 260 ${bedY - 150} C 330 ${bedY - 200 - lift * 0.65} 430 ${bedY - 235 - lift} 560 ${bedY - 230 - lift} C 700 ${bedY - 210 - lift} 800 ${bedY - 150 - lift * 0.45} 900 ${bedY - 110} Z`} fill="url(#shirt)" stroke="#2a1a12" strokeWidth={3} />
            {/* ноги к пяткам */}
            <path d={`M 900 ${bedY - 110} L 1000 ${bedY - 70} L 1000 ${bedY - 30} L 930 ${bedY - 40} Z`} fill="#4a4a5a" stroke="#2a1a12" strokeWidth={3} />
            {/* голова запрокинута на подушку */}
            <g transform={`translate(205 ${bedY - 120}) rotate(${-25 - 15 * a})`}>
              <ellipse cx={0} cy={0} rx={78} ry={92} fill="url(#skinH)" stroke="#6B3D2E" strokeWidth={3} />
              <path d="M -40 30 Q 0 52 40 30" stroke="#5a2a20" strokeWidth={6} fill="none" />
              <path d="M -30 -20 L -8 -20 M 10 -20 L 32 -20" stroke="#2a1a12" strokeWidth={5} />
              <path d="M -46 -46 Q -20 -62 6 -50" stroke="#c8c0b0" strokeWidth={9} fill="none" />
            </g>
            {/* рука сжата в кулак, напряжена */}
            <path d={`M 540 ${bedY - 200 - lift} C 520 ${bedY - 120 - lift * 0.5} 500 ${bedY - 70} 490 ${bedY - 40}`} stroke="#d9d2c4" strokeWidth={34} fill="none" strokeLinecap="round" />
            <circle cx={488} cy={bedY - 36} r={24} fill="url(#skinH)" stroke="#6B3D2E" strokeWidth={3} />
          </g>
          {/* напряжение — дуги-линии над спиной */}
          {[0, 1, 2].map((i) => <path key={i} d={`M ${400 + i * 60} ${bedY - 260 - lift - i * 10} q 30 -20 60 0`} stroke="#F42A10" strokeWidth={5} fill="none" opacity={wave * (0.8 - i * 0.2)} />)}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
