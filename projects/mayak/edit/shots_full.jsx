// Full «Маяк» (script v2, voice Mell v4, 44.2 s). Shot starts = sentence starts of the compacted voice.
// Each shot: scene, p(t) uniforms, focus/blur, mid(t) between 3D layers, top(t) in front, cam(t) 2D camera,
// enter cut|whip|fade, iris(t) -> {r, two} binocular/spyglass mask or null.
import { Toon, OUTFIT, INK } from "../../../toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";
import { Bill, CashStack, Burst } from "../../../toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/props.jsx";
import { Watch } from "./shots.jsx";

OUTFIT.aunt = { body: "#E87BA8", shade: "#B9567F", hat: null };
const lerp = (a, b, u) => a + (b - a) * u;
const cl = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => { u = cl(u); return u * u * (3 - 2 * u); };
const key = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 0; i < kf.length - 1; i++) { const [a, va] = kf[i], [b, vb] = kf[i + 1]; if (t < b) return lerp(va, vb, ease((t - a) / (b - a))); } return kf[kf.length - 1][1]; };
const pulse = (t, starts, len = 0.24) => Math.max(0, ...starts.map((f) => (t >= f && t < f + len ? Math.sin(((t - f) / len) * Math.PI) : 0)));
const circ = (cx, cy, rx, ry = rx) => { const k = 0.5523, ox = rx * k, oy = ry * k; return `M${cx} ${cy - ry} C${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy} C${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry} C${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy} C${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry} Z`; };
const P = (d, o = {}) => <path d={d} x={0} y={0} {...o} />;

const PIER = { fsharp: 0, flash: 0, lamp: 1, fogH: -0.9, bx: 60, bz: -9, sx: 60, sz: -16, stilt: 0 };
const BOO = { rx: 0.2, ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05, lamp: 1, radio: 0, shake: 0 };
const curlers = [[-120, -120], [-50, -150], [30, -158], [110, -140], [170, -95]].map(([dx, dy]) => [
  P(circ(300 + dx, 250 + dy, 30, 22), { fill: "#F2A0C0", stroke: { width: 7, color: INK } }), P(`M${300 + dx - 22} ${250 + dy} L${300 + dx + 22} ${250 + dy}`, { stroke: { width: 4, color: "#C9608C" } })]);
const spyglass = [<rect x={420} y={150} width={150} height={44} radius={10} fill="#C9962E" strokeColor={INK} strokeWidth={7} />, <rect x={556} y={140} width={40} height={64} radius={10} fill="#E2B23E" strokeColor={INK} strokeWidth={7} />];
const SixBoard = ({ n }) => <frame x={300} y={300} width={480} height={190} layout="none">
  <rect x={0} y={0} width={480} height={190} radius={16} fill="#24302C" strokeColor="#B8902F" strokeWidth={14} />
  <text x={0} y={36} width={480} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={96} color="#F2EEDC">{`вечер ${n}`}</text>
</frame>;
const RedDots = ({ k }) => <frame x={300} y={1430} width={480} height={160} layout="none">
  {[0, 1, 2].filter((i) => i < k).map((i) => P(circ(80 + i * 160, 80, 56, 56), { fill: "#FF3B30", stroke: { width: 9, color: INK } }))}
</frame>;
const Gull = ({ x, y, s = 1, flap = 0 }) => { const w = 28 * Math.sin(flap);
  return <frame x={x} y={y} width={200} height={120} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }]}>
    {P(`M10 ${60 - w} Q55 ${40 - w * 1.2} 100 64 Q145 ${40 - w * 1.2} 190 ${60 - w}`, { stroke: { width: 14, color: INK, cap: "round" } })}
    {P(`M10 ${60 - w} Q55 ${40 - w * 1.2} 100 64 Q145 ${40 - w * 1.2} 190 ${60 - w}`, { stroke: { width: 6, color: "#FFFFFF", cap: "round" } })}
    {P(circ(100, 70, 16, 12), { fill: "#FFFFFF", stroke: { width: 6, color: INK } })}
    {P("M114 70 L134 74 L114 78 Z", { fill: "#F2A23A", stroke: { width: 3, color: INK } })}
  </frame>; };
const Badge = ({ s }) => <frame x={560} y={330} width={360} height={190} layout="none" origin="center" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: -6, to: -6, at: 0, duration: 0.02 }]}>
  <rect x={10} y={14} width={340} height={166} radius={26} fill="#1E1418" />
  <rect x={0} y={0} width={340} height={166} radius={26} fill="#FFD34A" strokeColor="#1E1418" strokeWidth={10} />
  <text x={0} y={22} width={340} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={104} color="#CC1B44" strokeColor="#1E1418" strokeWidth={5}>50 к 1</text>
</frame>;

// shot starts (s) from voice segments, quantized to frames later
const A = { L1: 0, L2: 2.09, L3: 4.6, L4: 5.86, L5: 8.78, L6: 13.39, L7: 15.39, L8: 17.43, L8b: 21.63, L9: 24.3, L10: 25.94, L11: 28.17, L12: 31.64, L13: 33.17, L14: 35.4, L15: 37.41, L16: 39.43, L17: 40.83 };
export const T = 44.2;
const RAZ = [29.8, 30.46, 31.09].map((x) => x - A.L11);

export const SHOTS = [
  { name: "L1", at: A.L1, scene: "lighthouse", focus: 2.2, blur: 9,
    p: (t) => ({ ...PIER, rx: 0.3, ry: 1.25, rz: key([[0, 1.75], [2.1, 1.35]], t), tx: 2.6, ty: 2.1, tz: -14.0, lens: 1.05, flash: pulse(t, [0.18, 0.6, 1.02], 0.22) }),
    cam: (t) => ({ s: key([[0, 1.0], [2.1, 1.07]], t), x: 0, y: 0 }),
    mid: (t) => [
      <Toon env="dusk" x={560} y={930} s={1.05} o="skeptic" dur={3} face={pulse(t, [0.18, 0.6, 1.02], 0.22) > 0.2 ? { eyes: "squint", brows: "angry", mouth: "flat" } : { eyes: "open", brows: "angry", mouth: "flat" }} />,
      <Toon env="dusk" x={-90} y={760} s={1.55} o="hero" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", glow: t > 0.18, blinks: [1.6] }} />,
    ] },
  { name: "L2", at: A.L2, scene: "booth", focus: 2.3, blur: 4,
    p: (t) => ({ ...BOO, rx: key([[0, 0.35], [2.5, 0.05]], t) }),
    cam: (t) => ({ s: key([[0, 1.04], [0.5, 1.04], [1.1, 1.16], [2.5, 1.19]], t), x: key([[0, 40], [2.5, -30]], t), y: key([[0, 0], [1.1, 60], [2.5, 70]], t) }),
    mid: (t) => [<Toon env="in" x={430} y={600} s={0.85} o="bookie" dur={3} face={t < 1.0 ? { eyes: "smug", brows: "smug", mouth: "smirk" } : { eyes: "smug", brows: "up", mouth: "grin" }} arms={{ r: [t < 0.9 ? "down" : "hold"] }} />],
    top: (t) => { const u = ease((t - 0.1) / 0.45); return [
      <Toon env="in" x={-200} y={760} s={1.05} o="hero" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.7] }} arms={{ r: [u < 0.5 ? "down" : "fwd"] }} />,
      <Watch x={lerp(250, 420, u)} y={lerp(980, 1020, u)} s={0.62} rot={lerp(-20, 8, u)} />,
      ...(t > 0.95 ? [<Badge s={t < 1.07 ? lerp(1.5, 0.95, (t - 0.95) / 0.12) : 1.0} />] : [])]; } },
  { name: "L3", at: A.L3, scene: "lighthouse", focus: null, enter: "whip",
    p: (t) => ({ ...PIER, rx: key([[0, -7.6], [1.3, -7.0]], t), ry: 1.1, rz: -3.1, tx: key([[0, -1.6], [1.3, -1.2]], t), ty: -1.7, tz: -9.6, lens: 1.0, bx: key([[0, -2.2], [1.3, -1.95]], t), fogH: -2.7 }),
    cam: () => ({ s: 1, x: 0, y: 0 }),
    top: (t) => [<Gull x={lerp(-160, 1100, t / 1.3)} y={700} s={1.25} flap={t * 22} />, <Gull x={lerp(-420, 900, t / 1.3)} y={860} s={1.0} flap={t * 22 + 1.3} />, <Gull x={lerp(-700, 760, t / 1.3)} y={560} s={0.75} flap={t * 22 + 2.4} />] },
  { name: "L4", at: A.L4, scene: "lighthouse", focus: 3.6, blur: 7, enter: "fade",
    p: (t) => ({ ...PIER, rx: 0.1, ry: 1.5, rz: key([[0, 2.9], [2.9, 2.5]], t), tx: 0.7, ty: 1.0, tz: -3.0, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.0], [1.4, 1.02], [2.2, 1.3], [2.9, 1.32]], t), x: key([[0, 0], [1.4, 0], [2.2, -200], [2.9, -210]], t), y: key([[0, 0], [2.2, -40]], t) }),
    mid: (t) => [<Toon env="dusk" x={180} y={700} s={0.62} o="hero" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.2] }} />],
    top: (t) => [
      <Toon env="dusk" x={-230} y={880} s={0.78} o="old" dur={4} face={{ eyes: "happy", brows: "up", mouth: "grin", glasses: true, stache: true }} laugh />,
      <Toon env="dusk" x={-20} y={940} s={0.84} o="red" dur={4} face={{ eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh />,
      <Toon env="dusk" x={190} y={840} s={0.92} o="skeptic" dur={4} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh arms={{ r: ["wave"] }} />,
      <Gull x={lerp(1100, 500, ease(t / 2.0))} y={lerp(420, 980, ease(t / 2.0))} s={0.9} flap={t * 18} />] },
  { name: "L5", at: A.L5, scene: "lighthouse", focus: null, enter: "fade",
    p: (t) => ({ ...PIER, rx: -2.0, ry: key([[0, 2.2], [4.6, 0.9]], t), rz: key([[0, -4.0], [4.6, -9.0]], t), tx: -1.0, ty: key([[0, -0.2], [4.6, -0.6]], t), tz: -26.0, lens: 1.0, fogH: -1.5,
      sx: key([[0, -14.0], [3.0, -6.0], [4.6, -4.5]], t), sz: -21.0 }),
    cam: (t) => ({ s: 1, x: 0, y: 0 }),
    top: (t) => [<Gull x={lerp(-200, 1200, t / 4.6)} y={620} s={0.8} flap={t * 16} />] },
  { name: "L6", at: A.L6, scene: "lighthouse", focus: 2.2, blur: 9, enter: "cut",
    p: (t) => ({ ...PIER, rx: 0.3, ry: 1.25, rz: 1.75, tx: key([[0, 0.5], [2.0, 2.6]], t), ty: key([[0, 1.0], [2.0, 2.1]], t), tz: -14.0, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.0], [1.0, 1.0], [2.0, 1.25]], t), x: key([[0, 0], [1.0, 0], [2.0, -180]], t), y: key([[0, 0], [2.0, 180]], t) }),
    mid: (t) => [<Toon env="dusk" x={-60} y={900} s={1.2} o="hero" dur={3} face={{ eyes: "smug", brows: t < 1.0 ? "flat" : "smug", mouth: "smirk", blinks: [0.6] }} />] },
  { name: "L7", at: A.L7, scene: "lighthouse", focus: 4.8, blur: 7, enter: "cut",
    p: (t) => ({ ...PIER, fsharp: 1, rx: 11.6, ry: 15.7, rz: key([[0, -55.8], [2.0, -56.4]], t), tx: 13.0, ty: 15.4, tz: -62.0, lens: 1.05, fogH: -0.9 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.0, 1.06]], t), x: 0, y: 0 }),
    iris: (t) => ({ r: key([[0, 30], [0.25, 400], [1.6, 420], [2.0, 2000]], t), two: true, cy: 620 }),
    mid: (t) => [<Toon env="dusk" x={240} y={200} s={0.85} o="aunt" dur={3} face={{ eyes: "smug", brows: "up", mouth: "smirk", blush: true, blinks: [1.1] }} arms={{ r: ["hold"] }} hold={[...curlers.flat(), ...spyglass]} />] },
  { name: "L8", at: A.L8, scene: "lighthouse", focus: null, enter: "cut",
    p: (t) => ({ ...PIER, rx: 12.0, ry: 15.0, rz: -60.0, tx: key([[0, 2.0], [4.2, 6.0]], t), ty: -1.2, tz: -32.0, lens: 1.8, fogH: -1.0,
      bx: -3.0, bz: -38.0, sx: key([[0, 0.0], [4.2, 3.5]], t), sz: -31.0 }),
    cam: (t) => ({ s: 1, x: 0, y: 0 }),
    iris: () => ({ r: 520, two: false }) },
  { name: "L8b", at: A.L8b, scene: "lighthouse", focus: 4.8, blur: 7, enter: "cut",
    p: (t) => ({ ...PIER, fsharp: 1, rx: 11.6, ry: 15.7, rz: -56.4, tx: 13.0, ty: 15.4, tz: -62.0, lens: 1.05, flash: pulse(t, [0.9, 1.35, 1.8], 0.25) }),
    cam: (t) => ({ s: key([[0, 1.05], [2.7, 1.12]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon env="dusk" x={240} y={200} s={0.85} o="aunt" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blush: true }} arms={{ r: ["up"], l: ["hold"] }} hold={curlers.flat()} />],
    top: (t) => [<RedDots k={t < 0.9 ? 0 : t < 1.35 ? 1 : t < 1.8 ? 2 : 3} />] },
  { name: "L9", at: A.L9, scene: "lighthouse", focus: 3.6, blur: 7, enter: "fade",
    p: (t) => ({ ...PIER, rx: 0.1, ry: 1.5, rz: 2.7, tx: 0.7, ty: 1.0, tz: -3.0, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.25], [1.6, 1.32]], t), x: 0, y: -60 }),
    mid: (t) => [<Toon env="dusk" x={180} y={700} s={0.62} o="hero" dur={3} face={{ eyes: "open", brows: "sad", mouth: "flat", blinks: [0.8] }} />],
    top: (t) => [<SixBoard n={Math.min(6, 1 + Math.floor(t / 0.27))} />] },
  { name: "L10", at: A.L10, scene: "booth", focus: 2.3, blur: 4, enter: "fade",
    p: (t) => ({ ...BOO, rx: key([[0, -0.2], [2.2, 0.2]], t) }),
    cam: (t) => ({ s: key([[0, 1.05], [2.2, 1.12]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon env="in" x={430} y={600} s={0.85} o="bookie" dur={3} face={{ eyes: "smug", brows: "up", mouth: "grin" }} arms={{ r: ["hold"] }} />],
    top: (t) => [
      ...[0, 1, 2, 3, 4, 5].map((i) => { const t0 = 0.2 + i * 0.25, u = cl((t - t0) / 0.5); return t < t0 ? null : <Bill x={lerp(i % 2 ? -100 : 1000, 380 + i * 30, ease(u))} y={lerp(1400, 1000 - i * 18, ease(u))} s={0.8} rot={lerp(i % 2 ? -40 : 40, (i - 2.5) * 6, u)} />; }),
      <Toon env="in" x={-260} y={900} s={0.95} o="sailor" dur={3} face={{ eyes: "happy", brows: "up", mouth: "grin" }} arms={{ r: ["up"] }} />,
      <Toon env="in" x={-40} y={980} s={0.9} o="red" dur={3} face={{ eyes: "open", brows: "up", mouth: "grin", blush: true }} arms={{ l: ["up"] }} />,
      <Toon env="in" x={640} y={940} s={0.95} o="skeptic" dur={3} face={{ eyes: "happy", brows: "up", mouth: "grin" }} arms={{ r: ["wave"] }} />] },
  { name: "L11", at: A.L11, scene: "lighthouse", focus: 2.2, blur: 9, enter: "cut",
    p: (t) => ({ ...PIER, rx: 0.3, ry: 1.25, rz: key([[0, 1.75], [3.5, 1.4]], t), tx: 2.6, ty: 2.1, tz: -14.0, lens: 1.05, flash: pulse(t, RAZ, 0.3) }),
    cam: (t) => ({ s: key([[0, 1.0], [1.5, 1.0], [3.5, 1.12]], t), x: 0, y: key([[0, 0], [3.5, 60]], t) }),
    mid: (t) => { const on = pulse(t, RAZ, 0.3) > 0.15; return [
      <Toon env="dusk" x={560} y={930} s={1.05} o="skeptic" dur={4} face={on ? { eyes: "squint", brows: "angry", mouth: "flat" } : { eyes: "open", brows: "up", mouth: "o" }} />,
      <Toon env="dusk" x={-90} y={760} s={1.55} o="hero" dur={4} face={{ eyes: "smug", brows: "smug", mouth: "smirk", glow: t > RAZ[0], blinks: [3.2] }} />]; } },
  { name: "L12", at: A.L12, scene: "booth", focus: 2.3, blur: 4, enter: "whip",
    p: () => ({ ...BOO }),
    cam: (t) => ({ s: key([[0, 1.05], [1.5, 1.15]], t), x: key([[0, 60], [1.5, -40]], t), y: 0 }),
    mid: (t) => [<Toon env="in" x={480} y={620} s={0.82} o="bookie" dur={3} face={{ eyes: "open", brows: "up", mouth: t < 0.6 ? "smirk" : "o" }} />],
    top: (t) => [<Toon env="in" x={-160} y={760} s={1.0} o="hero" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} arms={{ r: [t < 0.35 ? "down" : "fwd"] }} />,
      <frame x={lerp(-60, 260, ease((t - 0.45) / 0.8))} y={0} width={1080} height={1920} layout="none"><CashStack x={150} y={1150} s={0.8} rows={4} cols={3} dur={3} /></frame>] },
  { name: "L13", at: A.L13, scene: "booth", focus: 1.4, blur: 4, enter: "fade",
    p: () => ({ ...BOO, rx: -0.2, ry: 1.45, rz: 1.6, tx: 0.2, ty: 1.35, tz: -1.5, lens: 1.1 }),
    cam: (t) => ({ s: key([[0, 1.25], [2.2, 1.33]], t), x: 0, y: key([[0, 160], [2.2, 190]], t) }),
    mid: (t) => [<Toon env="in" x={250} y={560} s={1.0} o="bookie" dur={3} face={{ eyes: "smug", brows: "smug", mouth: t > 0.9 && t < 2.0 ? "grin" : "smirk", blinks: [0.5] }} arms={{ r: ["hold"] }} />],
    top: (t) => [<Watch x={600 + Math.sin(t * 7) * 60} y={720 + Math.cos(t * 7) * 30} s={0.55} rot={Math.sin(t * 7) * 30} />] },
  { name: "L14", at: A.L14, scene: "lighthouse", focus: null, enter: "fade",
    p: (t) => { const hit = 0.9; return { ...PIER, rx: 2.0, ry: 1.6, rz: -17.0, tx: 7.5, ty: -1.4, tz: -30.0, lens: 1.05, fogH: -1.9,
      sx: t < hit ? lerp(1.0, 5.6, t / hit) : 5.6 + 0.15 * ease((t - hit) / 0.3), sz: -30.0, stilt: ease((t - hit) / 0.35) }; },
    cam: (t) => { const sh = t > 0.9 && t < 1.25 ? Math.sin(t * 90) * 14 : 0; return { s: 1.02, x: sh, y: sh * 0.5 }; },
    top: (t) => Burst({ cx: 560, cy: 1060, at: 0.9, dur: 2.2, n: 40, seed: 5, colors: ["#3E3040", "#6E5A70", "#F2EEDC", "#B8902F"] }) },
  { name: "L15", at: A.L15, scene: "lighthouse", focus: null, enter: "cut",
    p: (t) => ({ ...PIER, rx: key([[0, -7.6], [2.0, -7.2]], t), ry: 1.1, rz: -3.1, tx: -1.4, ty: -1.7, tz: -9.6, lens: 1.0, bx: key([[0, -6.5], [2.0, -2.6]], t), fogH: key([[0, -1.2], [2.0, -2.4]], t) }),
    cam: (t) => ({ s: key([[0, 1.1], [2.0, 1.0]], t), x: 0, y: 0 }),
    top: (t) => [<Gull x={lerp(1100, 200, t / 2.0)} y={520} s={0.9} flap={t * 20} />] },
  { name: "L16", at: A.L16, scene: "lighthouse", focus: 3.6, blur: 7, enter: "cut",
    p: () => ({ ...PIER, rx: 0.1, ry: 1.5, rz: 2.5, tx: 0.7, ty: 1.0, tz: -3.0, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.0], [1.4, 1.08]], t), x: 0, y: 0 }),
    top: (t) => { const f = (d) => (t < d ? { eyes: "happy", brows: "up", mouth: "grin" } : t < d + 0.45 ? { eyes: "open", brows: "up", mouth: "o" } : { eyes: "shock", brows: "up", mouth: "o" });
      return [
        <Toon env="dusk" x={-230} y={880} s={0.78} o="old" dur={3} face={{ ...f(0.15), glasses: true, stache: true }} />,
        <Toon env="dusk" x={-20} y={940} s={0.84} o="red" dur={3} face={{ ...f(0.3), blush: true }} />,
        <Toon env="dusk" x={190} y={840} s={0.92} o="skeptic" dur={3} face={f(0.45)} />,
        <Gull x={lerp(900, 640, ease(t / 1.0))} y={lerp(300, 760, ease(t / 1.0))} s={0.8} flap={t < 1.0 ? t * 18 : 0} />]; } },
  { name: "L17", at: A.L17, scene: "booth", focus: 2.3, blur: 4, enter: "fade",
    p: (t) => ({ ...BOO, rx: key([[0, 0.35], [3.4, 0.05]], t) }),
    cam: (t) => ({ s: key([[0, 1.04], [1.0, 1.08], [1.05, 1.04], [3.4, 1.16]], t), x: 0, y: key([[0, 0], [3.4, 60]], t) }),
    mid: (t) => [<Toon env="in" x={430} y={600} s={0.85} o="bookie" dur={4} face={t < 1.0 ? { eyes: "open", brows: "sad", mouth: "flat" } : { eyes: "smug", brows: "smug", mouth: "smirk" }} arms={{ r: [t < 0.5 ? "hold" : "down"] }} />],
    top: (t) => { const back = t < 1.0, u = back ? ease(t / 0.6) : ease((t - 1.3) / 0.5); return [
      <Toon env="in" x={-200} y={760} s={1.05} o="hero" dur={4} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [2.9] }} arms={{ r: [back ? (u < 0.5 ? "fwd" : "down") : (u < 0.5 ? "down" : "fwd")] }} />,
      back ? <Watch x={lerp(560, 140, u)} y={lerp(760, 1100, u)} s={0.62} rot={lerp(10, -20, u)} /> : <Watch x={lerp(250, 420, u)} y={lerp(980, 1020, u)} s={0.62} rot={lerp(-20, 8, u)} />]; } },
];
for (const s of SHOTS) s.enter = s.enter || "cut";
