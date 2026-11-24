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
// Тело — толстые штрихи по кривой (торс, ноги, руки), голова запрокинута на подушку; аэрограф: размытые тени и блик.
export const ArchBody: React.FC<{ frame: number; B?: number }> = ({ frame: f, B = 75 }) => {
  const wave = Math.max(0, Math.sin((f / B) * Math.PI * 3 - 0.4));
  const a = 0.6 + 0.4 * wave;
  const tremor = Math.sin(f * 2.3) * 2.5 * a;
  const bedY = 1240, L = 260 * a; // подъём середины
  const sh = { x: 290, y: bedY - 95 - L * 0.55 }, hip = { x: 640, y: bedY - 95 - L * 0.75 }, mid = { x: 470, y: bedY - 120 - L };
  const torso = `M ${sh.x} ${sh.y} Q ${mid.x} ${mid.y - 40} ${hip.x} ${hip.y}`;
  const knee = { x: 800, y: bedY - 80 - L * 0.25 }, heel = { x: 960, y: bedY - 45 };
  const legs = `M ${hip.x} ${hip.y} Q ${knee.x - 30} ${knee.y - 10} ${knee.x} ${knee.y} T ${heel.x} ${heel.y}`;
  const head = { x: 215, y: bedY - 105 };
  const arm = `M ${sh.x + 20} ${sh.y + 10} Q ${sh.x + 70} ${sh.y + 120} ${sh.x + 60} ${bedY - 40}`;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 55% at 50% 60%, #2a1c14, #090504)" }}>
      <AbsoluteFill style={{ transform: `translate(${tremor}px,0) scale(${interpolate(f, [0, B], [1.02, 1.08])})`, transformOrigin: "50% 60%" }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920">
          <defs>
            <filter id="abB14"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="abB6"><feGaussianBlur stdDeviation="6" /></filter>
            <filter id="abTex"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={2} seed={7} /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
            <radialGradient id="abSkin" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stopColor="#E2B59C" /><stop offset="0.6" stopColor="#C99179" /><stop offset="1" stopColor="#94604E" /></radialGradient>
            <radialGradient id="abLamp" cx="0.3" cy="0.2" r="0.8"><stop offset="0" stopColor="#ffb36a" stopOpacity="0.35" /><stop offset="1" stopColor="#ffb36a" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={1080} height={1920} fill="url(#abLamp)" />
          {/* кровать */}
          <rect x={40} y={bedY + 10} width={1000} height={80} rx={16} fill="#5a4636" />
          <rect x={40} y={bedY + 90} width={1000} height={40} fill="#2a1e16" />
          <rect x={50} y={bedY - 35} width={980} height={50} rx={22} fill="#cfc4b2" />
          <rect x={50} y={bedY - 35} width={980} height={50} rx={22} fill="#000" opacity={0.15} filter="url(#abTex)" />
          <ellipse cx={190} cy={bedY - 52} rx={140} ry={44} fill="#ece5d8" />
          {/* тень под дугой */}
          <ellipse cx={470} cy={bedY - 30} rx={300} ry={26} fill="#000" opacity={0.25 + 0.25 * a} filter="url(#abB14)" />
          {/* ноги (брюки) */}
          <path d={legs} stroke="#3c3f4e" strokeWidth={84} fill="none" strokeLinecap="round" />
          <path d={legs} stroke="#22242e" strokeWidth={84} fill="none" strokeLinecap="round" opacity={0.5} transform="translate(0 14)" filter="url(#abB6)" />
          <path d={`M ${heel.x - 10} ${heel.y - 10} q 40 -40 60 -20 q 10 20 -20 40 z`} fill="#c8b9a2" stroke="#2a1a12" strokeWidth={3} />
          {/* торс (рубаха) */}
          <path d={torso} stroke="#2a1a12" strokeWidth={156} fill="none" strokeLinecap="round" />
          <path d={torso} stroke="#d8d0c0" strokeWidth={148} fill="none" strokeLinecap="round" />
          <path d={torso} stroke="#8a8274" strokeWidth={60} fill="none" strokeLinecap="round" opacity={0.55} transform="translate(0 40)" filter="url(#abB14)" />
          <path d={torso} stroke="#fff" strokeWidth={30} fill="none" strokeLinecap="round" opacity={0.35} transform="translate(0 -40)" filter="url(#abB6)" />
          {/* рука вдоль тела, кулак сжат */}
          <path d={arm} stroke="#2a1a12" strokeWidth={50} fill="none" strokeLinecap="round" />
          <path d={arm} stroke="#cfc6b4" strokeWidth={44} fill="none" strokeLinecap="round" />
          <circle cx={sh.x + 60} cy={bedY - 40} r={27} fill="url(#abSkin)" stroke="#6B3D2E" strokeWidth={3} />
          {/* шея и запрокинутая голова */}
          <path d={`M ${sh.x - 30} ${sh.y + 10} L ${head.x + 40} ${head.y + 10}`} stroke="#b98670" strokeWidth={70} strokeLinecap="round" />
          <g transform={`translate(${head.x} ${head.y}) rotate(${-35 - 12 * a})`}>
            <ellipse cx={0} cy={0} rx={88} ry={98} fill="url(#abSkin)" stroke="#6B3D2E" strokeWidth={3} />
            <ellipse cx={-20} cy={-30} rx={40} ry={26} fill="#fff" opacity={0.18} filter="url(#abB6)" />
            <ellipse cx={20} cy={40} rx={60} ry={34} fill="#94604E" opacity={0.35} filter="url(#abB6)" />
            {/* оскал сжатых зубов, зажмуренные глаза */}
            <path d="M -44 34 Q 0 58 44 34 L 40 46 Q 0 66 -40 46 Z" fill="#f2ece0" stroke="#5a2a20" strokeWidth={4} />
            <path d="M -36 40 L 36 40" stroke="#5a2a20" strokeWidth={2} />
            <path d="M -40 -14 Q -24 -6 -8 -14 M 10 -14 Q 26 -6 42 -14" stroke="#2a1a12" strokeWidth={5} fill="none" />
            <path d="M -40 -34 L -10 -26 M 12 -26 L 42 -34" stroke="#3a2a22" strokeWidth={6} />
            <path d="M -70 -60 Q -40 -88 0 -84" stroke="#c8c0b0" strokeWidth={12} fill="none" />
          </g>
          {/* дуги напряжения над спиной */}
          {[0, 1, 2].map((i) => <path key={i} d={`M ${mid.x - 60 + i * 50} ${mid.y - 120 - i * 14} q 30 -22 60 0`} stroke="#F42A10" strokeWidth={6} fill="none" opacity={wave * (0.85 - i * 0.2)} strokeLinecap="round" />)}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
