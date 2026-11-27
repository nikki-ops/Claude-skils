// First 5.4 s of «Маяк» (script v2): L1 three red flashes, L2 watch on the counter, L3 whip to the Lastochka.
// Each shot: scene (glsl), p(t) uniforms, focus/blur (two-layer DOF), mid(t) = 2D between layers, top(t) = 2D in front,
// cam(t) = 2D camera {s,x,y}, enter = cut|whip. Times are local seconds.
import { Toon, INK } from "../../../toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";

const lerp = (a, b, u) => a + (b - a) * u;
const ease = (u) => (u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u));
const key = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 0; i < kf.length - 1; i++) { const [a, va] = kf[i], [b, vb] = kf[i + 1]; if (t < b) return lerp(va, vb, ease((t - a) / (b - a))); } return kf[kf.length - 1][1]; };
const FL = [0.18, 0.58, 0.98];                         // red flash starts (L1)
const flashAt = (t) => Math.max(0, ...FL.map((f) => (t >= f && t < f + 0.22 ? Math.sin(((t - f) / 0.22) * Math.PI) : 0)));
const inFlash = (t) => FL.some((f) => t >= f + 0.02 && t < f + 0.2);

const circ = (cx, cy, rx, ry = rx) => { const k = 0.5523, ox = rx * k, oy = ry * k; return `M${cx} ${cy - ry} C${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy} C${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry} C${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy} C${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry} Z`; };
const P = (d, o = {}) => <path d={d} x={0} y={0} {...o} />;

// grandfather's pocket watch, 220x300 box, ring at top
export function Watch({ x, y, s = 1, rot = 0, open = true }) {
  return <frame x={x} y={y} width={220} height={300} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: rot, to: rot, at: 0, duration: 0.02 }]}>
    {P("M110 40 C60 -10 20 10 -40 -30", { stroke: { width: 7, color: "#B98321", cap: "round" } })}
    {P("M110 40 C60 -10 20 10 -40 -30", { stroke: { width: 3, color: "#FFF3B8", cap: "round" } })}
    {P(circ(110, 36, 18, 18), { stroke: { width: 10, color: INK } })}
    {P(circ(110, 36, 18, 18), { stroke: { width: 5, color: "#E2B23E" } })}
    {P("M96 52 L124 52 L128 74 L92 74 Z", { fill: "#C9962E", stroke: { width: 7, color: INK } })}
    {P(circ(110, 170, 98, 98), { fill: "#B98321", stroke: { width: 10, color: INK } })}
    {P(circ(104, 164, 88, 88), { fill: "#F2C64A" })}
    {P(circ(110, 170, 74, 74), { fill: "#FBF4E2", stroke: { width: 6, color: "#8A5A1A" } })}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = (i * Math.PI) / 6, r1 = i % 3 === 0 ? 54 : 60; return P(`M${110 + Math.cos(a) * r1} ${170 + Math.sin(a) * r1} L${110 + Math.cos(a) * 66} ${170 + Math.sin(a) * 66}`, { stroke: { width: i % 3 === 0 ? 6 : 3, color: INK, cap: "round" } }); })}
    {P("M110 170 L110 124", { stroke: { width: 7, color: INK, cap: "round" } })}
    {P("M110 170 L146 186", { stroke: { width: 5, color: INK, cap: "round" } })}
    {P(circ(110, 170, 7, 7), { fill: "#CC1B44" })}
    {P("M60 120 C76 104 96 98 112 98", { stroke: { width: 8, color: "#FFFFFF", cap: "round" }, opacity: 0.8 })}
    {P(circ(166, 214, 8, 5), { fill: "#FFFFFF", opacity: 0.7 })}
  </frame>;
}
function Badge({ x, y, s }) {
  return <frame x={x} y={y} width={360} height={190} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: -6, to: -6, at: 0, duration: 0.02 }]}>
    <rect x={10} y={14} width={340} height={166} radius={26} fill="#1E1418" />
    <rect x={0} y={0} width={340} height={166} radius={26} fill="#FFD34A" strokeColor="#1E1418" strokeWidth={10} />
    <text x={0} y={22} width={340} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={104} color="#CC1B44" strokeColor="#1E1418" strokeWidth={5}>50 к 1</text>
  </frame>;
}
function Gull({ x, y, s = 1, flap = 0 }) {
  const w = 28 * Math.sin(flap);
  return <frame x={x} y={y} width={200} height={120} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }]}>
    {P(`M10 ${60 - w} Q55 ${40 - w * 1.2} 100 64 Q145 ${40 - w * 1.2} 190 ${60 - w}`, { stroke: { width: 14, color: INK, cap: "round" } })}
    {P(`M10 ${60 - w} Q55 ${40 - w * 1.2} 100 64 Q145 ${40 - w * 1.2} 190 ${60 - w}`, { stroke: { width: 6, color: "#FFFFFF", cap: "round" } })}
    {P(circ(100, 70, 16, 12), { fill: "#FFFFFF", stroke: { width: 6, color: INK } })}
    {P("M114 70 L134 74 L114 78 Z", { fill: "#F2A23A", stroke: { width: 3, color: INK } })}
  </frame>;
}

export const SHOTS = [
  { name: "L1", at: 0, dur: 1.6, scene: "lighthouse", focus: 2.2, blur: 9, enter: "cut",
    p: (t) => ({ rx: 0.3, ry: 1.25, rz: key([[0, 1.75], [1.6, 1.4]], t), tx: 2.6, ty: 2.1, tz: -14.0, lens: 1.05, flash: flashAt(t), lamp: 1, fogH: -0.9, bx: 40 }),
    cam: (t) => ({ s: key([[0, 1.0], [1.6, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => [
      <Toon env="dusk" x={560} y={930} s={1.05} o="skeptic" dur={2} face={inFlash(t) ? { eyes: "squint", brows: "angry", mouth: "flat" } : { eyes: "open", brows: "angry", mouth: "flat", blinks: [] }} />,
      <Toon env="dusk" x={-90} y={760} s={1.55} o="hero" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk", glow: t > 0.18, blinks: [1.38] }} />,
    ] },
  { name: "L2", at: 1.6, dur: 2.3, scene: "booth", focus: 2.3, blur: 4, enter: "cut",
    p: (t) => ({ rx: key([[0, 0.35], [2.3, 0.05]], t), ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05, lamp: 1, radio: 0, shake: 0 }),
    cam: (t) => ({ s: key([[0, 1.04], [0.5, 1.04], [1.1, 1.16], [2.3, 1.19]], t), x: key([[0, 40], [2.3, -30]], t), y: key([[0, 0], [1.1, 60], [2.3, 70]], t) }),
    mid: (t) => [
      <Toon env="in" x={430} y={600} s={0.85} o="bookie" dur={3} face={t < 1.0 ? { eyes: "smug", brows: "smug", mouth: "smirk" } : { eyes: "smug", brows: "up", mouth: "grin" }} arms={{ r: [t < 0.9 ? "down" : "hold"] }} />,
    ],
    top: (t) => {
      const u = ease((t - 0.1) / 0.45);
      return [
        <Toon env="in" x={-200} y={760} s={1.05} o="hero" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.7] }} arms={{ r: [u < 0.5 ? "down" : "fwd"] }} />,
        <Watch x={lerp(250, 420, u)} y={lerp(980, 1020, u)} s={0.62} rot={lerp(-20, 8, u)} />,
        ...(t > 0.95 ? [<Badge x={560} y={330} s={t < 1.07 ? lerp(1.5, 0.95, (t - 0.95) / 0.12) : 1.0} />] : []),
      ];
    } },
  { name: "L3", at: 3.9, dur: 1.5, scene: "lighthouse", focus: null, blur: 0, enter: "whip",
    p: (t) => ({ rx: key([[0, -7.6], [1.5, -7.0]], t), ry: 1.1, rz: -3.1, tx: key([[0, -1.6], [1.5, -1.2]], t), ty: -1.7, tz: -9.6, lens: 1.0, flash: 0, lamp: 1, fogH: -2.7, bx: key([[0, -2.2], [1.5, -1.95]], t) }),
    cam: (t) => ({ s: 1.0, x: 0, y: 0 }),
    top: (t) => [
      <Gull x={lerp(-160, 1100, t / 1.5)} y={700} s={1.25} flap={t * 22} />,
      <Gull x={lerp(-420, 900, t / 1.5)} y={860} s={1.0} flap={t * 22 + 1.3} />,
      <Gull x={lerp(-700, 760, t / 1.5)} y={560} s={0.75} flap={t * 22 + 2.4} />,
    ] },
];

export const CAPS = [
  [0.0, "Как маяк"], [0.55, "подстроил гонку"], [1.12, "кораблей."], [1.6, "Он заложил"], [2.15, "дедовские часы"],
  [2.8, "и поспорил"], [3.3, "на всё,"], [3.82, "что ржавая"], [4.38, "«Ласточка»"], [4.9, "придёт первой."],
];
export const T = 5.4;
export const Cap = (s) => <text x={40} y={1303} width={1000} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={70} color="#FFFFFF" strokeColor="#000000" strokeWidth={5} shadow={{ x: 3, y: 4, blur: 0, color: "#000000" }}>{s}</text>;
