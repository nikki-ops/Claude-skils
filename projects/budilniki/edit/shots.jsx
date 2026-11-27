// «Сто будильников» — test cut 0–6 s (B1 pour, B2 silence one, B3 roommates laugh). Captions are a timing stub until the voice exists.
import { Toon, OUTFIT, INK } from "../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";

OUTFIT.student = { body: "#E8B23A", shade: "#B9862A", hat: null };
OUTFIT.mate1 = { body: "#5B8DE8", shade: "#3A64B8", hat: null };
OUTFIT.mate2 = { body: "#E86A7A", shade: "#B84858", hat: null };
OUTFIT.mate3 = { body: "#8FD06A", shade: "#5FA048", hat: null };
const lerp = (a, b, u) => a + (b - a) * u;
const cl = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => { u = cl(u); return u * u * (3 - 2 * u); };
const key = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 0; i < kf.length - 1; i++) { const [a, va] = kf[i], [b, vb] = kf[i + 1]; if (t < b) return lerp(va, vb, ease((t - a) / (b - a))); } return kf[kf.length - 1][1]; };
const circ = (cx, cy, rx, ry = rx) => { const k = 0.5523, ox = rx * k, oy = ry * k; return `M${cx} ${cy - ry} C${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy} C${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry} C${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy} C${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry} Z`; };
const P = (d, o = {}) => <path d={d} x={0} y={0} {...o} />;
const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// alarm clock, 200x230 box: twin bells, hammer, legs; ring = shaking + sound lines
const CLK = ["#E2453C", "#F2C14E", "#5ED5C6", "#B79AE8", "#4C9AE8", "#F28C3A"];
export function Alarm({ x, y, s = 1, rot = 0, col = "#E2453C", ring = 0, t = 0 }) {
  const shake = ring ? Math.sin(t * 70) * 9 * ring : 0, hop = ring ? -Math.abs(Math.sin(t * 35)) * 10 * ring : 0;
  return <frame x={x} y={y + hop} width={200} height={230} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: rot + shake, to: rot + shake, at: 0, duration: 0.02 }]}>
    {P("M60 190 L40 222 M140 190 L160 222", { stroke: { width: 12, color: INK, cap: "round" } })}
    {P(circ(52, 50, 30, 30), { fill: "#C9962E", stroke: { width: 8, color: INK } })}
    {P(circ(148, 50, 30, 30), { fill: "#C9962E", stroke: { width: 8, color: INK } })}
    {P("M100 26 L100 50", { stroke: { width: 9, color: INK, cap: "round" } })}
    {P(circ(100, 128, 80, 78), { fill: col, stroke: { width: 9, color: INK } })}
    {P(circ(100, 128, 58, 56), { fill: "#FBF4E2", stroke: { width: 6, color: INK } })}
    {P("M100 128 L100 88", { stroke: { width: 8, color: INK, cap: "round" } })}
    {P("M100 128 L130 140", { stroke: { width: 6, color: INK, cap: "round" } })}
    {P("M54 92 C66 78 82 72 96 72", { stroke: { width: 7, color: "#FFFFFF", cap: "round" }, opacity: 0.7 })}
    {...(ring ? [P("M8 30 L-22 14 M2 60 L-30 60 M192 30 L222 14 M198 60 L230 60", { stroke: { width: 8, color: INK, cap: "round" }, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 20)) })] : [])}
  </frame>;
}
// cardboard box held over the head; tilts to pour
function Box({ x, y, s = 1, rot = 0 }) {
  return <frame x={x} y={y} width={360} height={260} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: rot, to: rot, at: 0, duration: 0.02 }]}>
    {P("M20 40 L340 40 L320 250 L40 250 Z", { fill: "#C98E52", stroke: { width: 10, color: INK } })}
    {P("M20 40 L340 40 L300 10 L60 10 Z", { fill: "#E0A868", stroke: { width: 8, color: INK } })}
    {P("M120 120 L240 120 M120 150 L210 150", { stroke: { width: 8, color: "#8A5A30", cap: "round" } })}
    <text x={40} y={170} width={280} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={44} color="#5A3A20">×100</text>
  </frame>;
}
// hair tuft for the student (local Toon coords)
const HAIR = [P("M170 110 C190 40 260 30 300 60 C330 20 400 30 420 90 C380 70 340 80 330 100 C300 70 230 70 170 110 Z", { fill: "#4A3226", stroke: { width: 8, color: INK } })];

const DORM = { night: 0.0, lamp: 0.35, cut: 0, pbed: 0 };
export const T = 6.0;
export const SHOTS = [
  // B1 0–2.6: pours a box of alarm clocks onto the bed, already moving at frame 0
  { name: "B1", at: 0, scene: "dorm", focus: null, enter: "cut",
    p: (t) => ({ ...DORM, rx: key([[0, 1.3], [2.6, 1.0]], t), ry: 1.3, rz: key([[0, 0.9], [2.6, 0.6]], t), tx: -0.7, ty: 0.75, tz: -2.4, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.6, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => {
      const tilt = key([[0, 15], [0.35, 95], [1.9, 105], [2.4, 20]], t);
      const pile = [];
      for (let i = 0; i < 26; i++) {
        const t0 = 0.3 + i * 0.05, u = t - t0; if (u < 0) continue;
        const sx = 640 + (rnd(i, 1) - 0.5) * 140, sy = 230, vx = (rnd(i, 2) - 0.5) * 520, g = 3600;
        const restY = 1020 + rnd(i, 3) * 160 + (i % 3) * 25, yy = Math.min(restY, sy + 300 * u + 0.5 * g * u * u);
        const landed = yy >= restY, xx = sx + vx * Math.min(u, (restY - sy) / 900);
        pile.push(<Alarm x={xx - 100} y={yy - 115} s={0.42 + rnd(i, 4) * 0.12} rot={landed ? (rnd(i, 5) - 0.5) * 60 : u * 600 * (rnd(i, 6) - 0.5)} col={CLK[i % CLK.length]} ring={landed && u < 0.05 + (restY - sy) / 2000 ? 0.6 : 0} t={t} />);
      }
      return [
        <Toon env="in" x={300} y={520} s={1.0} o="student" dur={3} face={{ eyes: t < 1.4 ? "open" : "happy", brows: "up", mouth: t < 1.4 ? "o" : "grin" }} arms={{ r: ["lift"], l: ["lift"] }}
          hold={[...HAIR, <Box x={120} y={-260} s={0.95} rot={tilt} />]} anim={[{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.35, value: -14 }, { at: 0.7, value: 0 }, { at: 1.05, value: -10 }, { at: 1.4, value: 0 }, { at: 2.9, value: 0 }] }]} />,
        ...pile,
      ];
    } },
  // B2 2.6–4.0: one clock starts ringing, he slaps it quiet and smirks
  { name: "B2", at: 2.6, scene: "dorm", focus: null, enter: "cut",
    p: (t) => ({ ...DORM, rx: 0.2, ry: 1.0, rz: -0.6, tx: -0.9, ty: 0.55, tz: -2.45, lens: 1.15 }),
    cam: (t) => ({ s: key([[0, 1.04], [1.4, 1.1]], t), x: 0, y: 0 }),
    mid: (t) => {
      const ring = t > 0.25 && t < 0.78 ? 1 : 0, slap = key([[0.55, 0], [0.75, 1], [1.4, 1]], t);
      return [
        ...[0, 1, 2, 3, 4, 5, 6].map((i) => <Alarm x={120 + i * 120 + (i % 2) * 30} y={1180 + (i % 3) * 40} s={0.55} rot={(rnd(i, 8) - 0.5) * 40} col={CLK[(i + 2) % CLK.length]} t={t} />),
        <Toon env="in" x={430} y={300} s={1.3} o="student" dur={2} face={t < 0.8 ? { eyes: "squint", brows: "angry", mouth: "teeth" } : { eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.2] }}
          arms={{ r: ["down", "slap", 0.45] }} hold={HAIR} />,
        <Alarm x={680} y={1000 + 18 * slap} s={0.85} rot={-6} col="#E2453C" ring={ring} t={t} />,
      ];
    } },
  // B3 4.0–6.0: roommates in the doorway laugh at him
  { name: "B3", at: 4.0, scene: "dorm", focus: null, enter: "whip",
    p: (t) => ({ ...DORM, rx: 0.9, ry: 1.45, rz: -0.6, tx: -2.3, ty: 1.05, tz: 0.15, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.0, 1.12]], t), x: key([[0, 0], [2.0, 40]], t), y: 0 }),
    mid: (t) => [
      <Toon env="in" x={40} y={720} s={0.8} o="mate1" dur={3} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh />,
      <Toon env="in" x={300} y={660} s={0.86} o="mate2" dur={3} face={{ eyes: "open", brows: "up", mouth: "talk", talk: [[0.1, 1.4]] }} arms={{ r: ["down", "wave", 0.3] }} />,
      <Toon env="in" x={560} y={740} s={0.78} o="mate3" dur={3} face={{ eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh />,
    ] },
];
export const CAPS = [[0.0, "Студент"], [0.45, "потратил"], [0.85, "всю"], [1.05, "стипендию"], [1.55, "на сто"], [1.95, "будильников."], [2.6, "И ни один"], [3.1, "не завёл"], [3.45, "для себя."], [4.0, "Общага"], [4.45, "ржала:"], [4.9, "«В часовщики"], [5.45, "подался?»"]];
export const CAP_Y = 880;
