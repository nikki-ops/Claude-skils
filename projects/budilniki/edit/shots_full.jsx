// «Сто будильников» — full cut, 16 shots on the user's own voice (Dipper). Times = sentence starts of audio/segments.json.
// Voice + music only (no SFX): sound is shown as comic lettering (ДЗЫНЬ!, БАМ!, Zzz).
import { Toon, OUTFIT, INK } from "../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";
import { Alarm } from "./shots.jsx";

OUTFIT.student = { body: "#E8B23A", shade: "#B9862A", hat: null };
OUTFIT.mate1 = { body: "#5B8DE8", shade: "#3A64B8", hat: null };
OUTFIT.mate2 = { body: "#E86A7A", shade: "#B84858", hat: null };
OUTFIT.mate3 = { body: "#8FD06A", shade: "#5FA048", hat: null };
OUTFIT.prof = { body: "#7A6A5A", shade: "#54483C", hat: null, tie: "#C9302C" };
OUTFIT.pajama = { body: "#9DB4E8", shade: "#6F88C0", hat: null };
OUTFIT.dean = { body: "#4F5B78", shade: "#353E55", hat: null, tie: "#E8B23A" };

const lerp = (a, b, u) => a + (b - a) * u;
const cl = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => { u = cl(u); return u * u * (3 - 2 * u); };
const key = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 0; i < kf.length - 1; i++) { const [a, va] = kf[i], [b, vb] = kf[i + 1]; if (t < b) return lerp(va, vb, ease((t - a) / (b - a))); } return kf[kf.length - 1][1]; };
const pop = (t, t0, len = 0.6) => (t < t0 || t > t0 + len ? 0 : t < t0 + 0.08 ? (t - t0) / 0.08 * 1.25 : t < t0 + 0.16 ? lerp(1.25, 1.0, (t - t0 - 0.08) / 0.08) : 1);
const circ = (cx, cy, rx, ry = rx) => { const k = 0.5523, ox = rx * k, oy = ry * k; return `M${cx} ${cy - ry} C${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy} C${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry} C${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy} C${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry} Z`; };
const P = (d, o = {}) => <path d={d} x={0} y={0} {...o} />;
const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const S = (s, r = 0) => [{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: r, to: r, at: 0, duration: 0.02 }];
const CLK = ["#E2453C", "#F2C14E", "#5ED5C6", "#B79AE8", "#4C9AE8", "#F28C3A"];

// --- props & lettering ---
const HAIR = [P("M170 110 C190 40 260 30 300 60 C330 20 400 30 420 90 C380 70 340 80 330 100 C300 70 230 70 170 110 Z", { fill: "#4A3226", stroke: { width: 8, color: INK } })];
const NIGHTCAP = [P("M150 120 C160 20 330 -20 420 60 C470 100 500 160 520 200 C470 150 420 120 300 110 C230 105 180 110 150 120 Z", { fill: "#6F88C0", stroke: { width: 8, color: INK } }), P(circ(525, 205, 26, 26), { fill: "#FFFFFF", stroke: { width: 6, color: INK } })];
const BAGS = [P("M215 268 C230 285 262 285 276 268", { stroke: { width: 7, color: "#7A5A8A", cap: "round" } }), P("M323 268 C338 285 370 285 384 268", { stroke: { width: 7, color: "#7A5A8A", cap: "round" } })];
const MASK = [<rect x={190} y={200} width={220} height={62} radius={30} fill="#E86A9A" strokeColor={INK} strokeWidth={8} />, P("M120 230 L190 225 M410 225 L480 230", { stroke: { width: 8, color: INK, cap: "round" } })];
function Boom({ x, y, text, s = 1, rot = -8, col = "#FFD34A" }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={520} height={200} layout="none" origin="center" animate={S(s, rot)}>
    <text x={6} y={10} width={520} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={110} color="#1E1418">{text}</text>
    <text x={0} y={0} width={520} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={110} color={col} strokeColor="#1E1418" strokeWidth={6}>{text}</text>
  </frame>;
}
function Label({ x, y, text, s = 1, w = 520, bg = "#FFFFFF", fg = "#1E1418", size = 56, rot = 0 }) {
  return <frame x={x} y={y} width={w} height={size * 1.7} layout="none" origin="center" animate={S(s, rot)}>
    <rect x={8} y={10} width={w} height={size * 1.6} radius={18} fill="#1E1418" />
    <rect x={0} y={0} width={w} height={size * 1.6} radius={18} fill={bg} strokeColor="#1E1418" strokeWidth={7} />
    <text x={0} y={size * 0.28} width={w} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={size} color={fg}>{text}</text>
  </frame>;
}
function Clock({ x, y, s = 1, h = 9, m = 0 }) {
  const ma = (m / 60) * Math.PI * 2 - Math.PI / 2, ha = ((h % 12) / 12 + m / 720) * Math.PI * 2 - Math.PI / 2;
  return <frame x={x} y={y} width={400} height={400} layout="none" origin="center" animate={S(s)}>
    {P(circ(200, 200, 190, 190), { fill: "#FBF4E2", stroke: { width: 18, color: "#1E1418" } })}
    {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return P(`M${200 + Math.cos(a) * 150} ${200 + Math.sin(a) * 150} L${200 + Math.cos(a) * 170} ${200 + Math.sin(a) * 170}`, { stroke: { width: i % 3 ? 6 : 12, color: INK, cap: "round" } }); })}
    {P(`M200 200 L${200 + Math.cos(ha) * 95} ${200 + Math.sin(ha) * 95}`, { stroke: { width: 16, color: INK, cap: "round" } })}
    {P(`M200 200 L${200 + Math.cos(ma) * 140} ${200 + Math.sin(ma) * 140}`, { stroke: { width: 10, color: "#C9302C", cap: "round" } })}
    {P(circ(200, 200, 14, 14), { fill: INK })}
  </frame>;
}
function Sheet({ x, y, s = 1, rows, strike = 0, title = "ВЕДОМОСТЬ" }) {
  return <frame x={x} y={y} width={620} height={760} layout="none" origin="center" animate={S(s, -3)}>
    <rect x={10} y={14} width={600} height={740} radius={10} fill="#1E1418" />
    <rect x={0} y={0} width={600} height={740} radius={10} fill="#FBF6E6" strokeColor="#1E1418" strokeWidth={7} />
    <text x={0} y={30} width={600} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={54} color="#1E1418">{title}</text>
    {rows.map((r, i) => <text x={50} y={130 + i * 96} width={520} fontFamily="Montserrat" fontWeight={800} fontSize={46} color="#3A3A4A">{r}</text>)}
    {rows.map((r, i) => (i < strike ? P(`M40 ${158 + i * 96} L${560} ${150 + i * 96}`, { stroke: { width: 12, color: "#D21E34", cap: "round" } }) : null))}
  </frame>;
}
function Drum({ x, y, s = 1 }) {
  return <frame x={x} y={y} width={300} height={260} layout="none" origin="center" animate={S(s)}>
    {P("M30 80 L30 200 C30 250 270 250 270 200 L270 80 Z", { fill: "#D21E34", stroke: { width: 9, color: INK } })}
    {P("M30 110 L90 200 L150 110 L210 200 L270 110", { stroke: { width: 7, color: "#F2C14E" } })}
    {P(circ(150, 80, 120, 34), { fill: "#FBF4E2", stroke: { width: 9, color: INK } })}
    {P("M60 20 L140 70 M240 20 L160 70", { stroke: { width: 10, color: "#C9962E", cap: "round" } })}
  </frame>;
}
function Earplugs({ x, y, s = 1 }) {
  return <frame x={x} y={y} width={260} height={200} layout="none" origin="center" animate={S(s, -6)}>
    <rect x={0} y={0} width={260} height={190} radius={16} fill="#4C9AE8" strokeColor="#1E1418" strokeWidth={8} />
    <text x={0} y={22} width={260} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={46} color="#FFFFFF">БЕРУШИ</text>
    {P(circ(90, 130, 30, 22), { fill: "#F28C3A", stroke: { width: 6, color: INK } })}
    {P(circ(170, 130, 30, 22), { fill: "#F28C3A", stroke: { width: 6, color: INK } })}
  </frame>;
}
function Flashlight({ x, y, on = 1, rot = 20 }) {
  return <frame x={x} y={y} width={700} height={300} layout="none" origin="top-left" animate={S(1, rot)}>
    {P("M120 150 L700 20 L700 280 Z", { fill: "#FFF3B0", opacity: 0.45 * on })}
    <rect x={0} y={120} width={130} height={60} radius={14} fill="#3A3A4A" strokeColor={INK} strokeWidth={7} />
  </frame>;
}

const A = { B1: 0, B2: 2.43, B3: 3.74, B4: 5.64, B5: 8.43, B6: 12.65, B7: 16.78, B8: 18.77, B9: 22.33, B10: 25.49, B11: 28.1, B12: 30.07, B13: 32.6, B14: 34.2, B15: 36.95, B16: 38.45 };
export const T = 40.1;
export const CAP_Y = 880;
const DORM = { night: 0, lamp: 0.35, cut: 0, pbed: 0, prof: 0 };
const NIGHT = { night: 1, lamp: 0.9, cut: 0, pbed: 0, prof: 0 };
const HALL = { sun: 1 };
const SHOP = { lamp: 1, radio: 0, shake: 0 };

function pour(t) {
  const tilt = key([[0, 15], [0.35, 95], [1.9, 105], [2.4, 20]], t), pile = [];
  for (let i = 0; i < 26; i++) {
    const t0 = 0.3 + i * 0.05, u = t - t0; if (u < 0) continue;
    const sx = 640 + (rnd(i, 1) - 0.5) * 60, sy = 230, vx = (rnd(i, 2) - 0.5) * 1100, g = 3600;
    const restY = 1020 + rnd(i, 3) * 160 + (i % 3) * 25, yy = Math.min(restY, sy + 300 * u + 0.5 * g * u * u);
    const tl = (restY - sy) / 1000, xx = sx + vx * Math.min(u, tl);
    pile.push(<Alarm x={xx - 100} y={yy - 115} s={0.42 + rnd(i, 4) * 0.12} rot={yy >= restY ? (rnd(i, 5) - 0.5) * 60 : u * 600 * (rnd(i, 6) - 0.5)} col={CLK[i % CLK.length]} t={t} />);
  }
  return { tilt, pile };
}

export const SHOTS = [
  { name: "B1", at: A.B1, scene: "dorm", focus: null,
    p: (t) => ({ ...DORM, rx: key([[0, 1.3], [2.4, 1.0]], t), ry: 1.3, rz: key([[0, 0.9], [2.4, 0.6]], t), tx: -0.7, ty: 0.75, tz: -2.4, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.4, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => { const { tilt, pile } = pour(t); return [
      <Toon env="in" x={300} y={520} s={1.0} o="student" dur={3} face={{ eyes: t < 1.4 ? "open" : "happy", brows: "up", mouth: t < 1.4 ? "o" : "grin" }} arms={{ r: ["lift"], l: ["lift"] }}
        hold={[...HAIR, <frame x={120} y={-260} width={360} height={260} layout="none" origin="center" animate={S(0.95, tilt)}>
          {P("M20 40 L340 40 L320 250 L40 250 Z", { fill: "#C98E52", stroke: { width: 10, color: INK } })}{P("M20 40 L340 40 L300 10 L60 10 Z", { fill: "#E0A868", stroke: { width: 8, color: INK } })}
          <text x={40} y={150} width={280} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={48} color="#5A3A20">×100</text></frame>]}
        anim={[{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.35, value: -14 }, { at: 0.7, value: 0 }, { at: 1.05, value: -10 }, { at: 1.4, value: 0 }, { at: 2.9, value: 0 }] }]} />,
      ...pile]; } },
  { name: "B2", at: A.B2, scene: "dorm", focus: null,
    p: () => ({ ...DORM, rx: 0.2, ry: 1.0, rz: -0.6, tx: -0.9, ty: 0.55, tz: -2.45, lens: 1.15 }),
    cam: (t) => ({ s: key([[0, 1.04], [1.3, 1.12]], t), x: 0, y: 0 }),
    mid: (t) => { const ring = t > 0.15 && t < 0.62 ? 1 : 0, slap = key([[0.42, 0], [0.6, 1], [1.4, 1]], t); return [
      ...[0, 1, 2, 3, 4, 5, 6].map((i) => <Alarm x={120 + i * 120 + (i % 2) * 30} y={1180 + (i % 3) * 40} s={0.55} rot={(rnd(i, 8) - 0.5) * 40} col={CLK[(i + 2) % CLK.length]} t={t} />),
      <Toon env="in" x={430} y={300} s={1.3} o="student" dur={2} face={t < 0.62 ? { eyes: "squint", brows: "angry", mouth: "teeth" } : { eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.0] }} arms={{ r: ["down", "slap", 0.35] }} hold={HAIR} />,
      <Alarm x={680} y={1000 + 18 * slap} s={0.85} rot={-6} col="#E2453C" ring={ring} t={t} />,
      <Boom x={460} y={820} text="ДЗЫНЬ!" s={ring ? 1 + 0.06 * Math.sin(t * 40) : 0} />,
      <Boom x={520} y={900} text="ХЛОП" s={pop(t, 0.6, 0.45) * 0.8} col="#FFFFFF" rot={6} />]; } },
  { name: "B3", at: A.B3, scene: "dorm", focus: null, enter: "whip",
    p: () => ({ ...DORM, rx: 0.9, ry: 1.45, rz: -0.6, tx: -2.3, ty: 1.05, tz: 0.15, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.0], [1.9, 1.12]], t), x: key([[0, 0], [1.9, 40]], t), y: 0 }),
    mid: (t) => [
      <Toon env="in" x={40} y={720} s={0.8} o="mate1" dur={3} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh />,
      <Toon env="in" x={300} y={660} s={0.86} o="mate2" dur={3} face={{ eyes: "open", brows: "up", mouth: "talk", talk: [[0.75, 1.8]] }} arms={{ r: ["down", "wave", 0.6] }} />,
      <Toon env="in" x={560} y={740} s={0.78} o="mate3" dur={3} face={{ eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh />,
      <Boom x={300} y={330} text="ХА-ХА" s={pop(t, 0.1, 2) * 0.9} col="#FFFFFF" rot={-10} />] },
  { name: "B4", at: A.B4, scene: "hall", focus: 3.2, blur: 7, enter: "fade",
    p: (t) => ({ ...HALL, rx: key([[0, -0.4], [2.8, -0.9]], t), ry: 1.6, rz: 0.6, tx: -1.4, ty: 1.1, tz: -3.0, lens: 1.1 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.8, 1.1]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon env="in" x={120} y={420} s={1.0} o="prof" dur={3} face={{ eyes: "smug", brows: "angry", mouth: t > 1.6 ? "grin" : "flat", glasses: true, stache: true, blinks: [1.2] }} arms={{ r: ["down", "point", 1.6] }} />],
    top: (t) => [<Sheet x={500} y={760} s={0.72} rows={["Петров", "Сидоров", "Иванова", "Ким", "Смирнов", "Лебедев"]} strike={Math.floor(cl((t - 0.3) / 1.6) * 4)} />,
      <Label x={60} y={250} w={560} text="ВАЛИТ ПОЛОВИНУ" bg="#D21E34" fg="#FFFFFF" s={pop(t, 1.65, 2) * 0.9} rot={-4} />] },
  { name: "B5", at: A.B5, scene: "dorm", focus: null, enter: "cut",
    p: (t) => ({ ...DORM, cut: 1, rx: key([[0, 0.6], [4.2, 0.1]], t), ry: 2.9, rz: 2.2, tx: -0.4, ty: 0.5, tz: -3.7, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.0], [4.2, 1.1]], t), x: 0, y: 0 }),
    mid: (t) => [
      <Toon env="in" x={300} y={560} s={0.65} o="pajama" dur={5} face={{ eyes: "smug", brows: "flat", mouth: "flat", glasses: true, stache: true, blinks: [1.0, 3.0] }} hold={NIGHTCAP} />,
      <Toon env="in" x={330} y={1040} s={0.75} o="student" dur={5} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [2.0] }} arms={{ r: ["down", "knock", 1.2] }} hold={HAIR} />],
    top: (t) => [<Label x={480} y={560} w={430} size={42} text="ПРОФЕССОР" bg="#B79AE8" s={pop(t, 0.9, 5) * 0.9} rot={4} />,
      <Label x={170} y={1500} w={280} size={70} text="№13" bg="#F2C14E" s={pop(t, 2.2, 5)} rot={-5} />,
      <Boom x={300} y={830} text="СТЕНКА" s={pop(t, 2.6, 5) * 0.55} col="#FFFFFF" rot={0} />] },
  { name: "B6", at: A.B6, scene: "dorm", focus: 0.4, blur: 12, enter: "fade",
    p: () => ({ ...DORM, rx: 1.4, ry: 1.3, rz: -1.0, tx: 1.75, ty: 0.8, tz: -2.3, lens: 1.1 }),
    cam: (t) => ({ s: key([[0, 1.0], [4.1, 1.06]], t), x: 0, y: 0 }),
    top: (t) => { const hl = cl((t - 1.3) / 0.9); return [
      <frame x={80} y={560} width={920} height={1100} layout="none" origin="center" animate={S(key([[0, 0.95], [4.1, 1.02]], t), -2)}>
        <rect x={14} y={18} width={900} height={1080} radius={12} fill="#1E1418" />
        <rect x={0} y={0} width={900} height={1080} radius={12} fill="#FBF6E6" strokeColor="#1E1418" strokeWidth={8} />
        <text x={0} y={50} width={900} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={60} color="#1E1418">ПРАВИЛА УНИВЕРСИТЕТА</text>
        {[0, 1, 2, 3].map((i) => <rect x={70} y={190 + i * 80} width={760 - (i % 2) * 140} height={22} radius={11} fill="#CFC8B4" />)}
        <rect x={50} y={540} width={800 * hl} height={250} radius={20} fill="#FFE45C" opacity={0.85} />
        <text x={70} y={560} width={760} fontFamily="Montserrat" fontWeight={800} fontSize={58} color="#1E1418">§7. Опоздал экзаменатор</text>
        <text x={70} y={640} width={760} fontFamily="Montserrat" fontWeight={800} fontSize={58} color="#1E1418">на 15 минут —</text>
        <text x={70} y={720} width={760} fontFamily="Montserrat" fontWeight={800} fontSize={58} color="#D21E34">студенты свободны</text>
        {[0, 1, 2].map((i) => <rect x={70} y={860 + i * 70} width={700 - i * 120} height={22} radius={11} fill="#CFC8B4" />)}
      </frame>,
      P(`M${lerp(260, 900, hl)} ${1360} l60 -40 l30 70 Z`, { fill: "#F2C14E", stroke: { width: 6, color: INK } })]; } },
  { name: "B7", at: A.B7, scene: "dorm", focus: null, enter: "fade",
    p: (t) => ({ ...NIGHT, rx: key([[0, -0.2], [2.0, 0.6]], t), ry: 1.4, rz: 0.9, tx: -0.4, ty: 0.6, tz: -2.6, lens: 1.0 }),
    cam: () => ({ s: 1.04, x: 0, y: 0 }),
    mid: (t) => { const wx = key([[0, -40], [2.0, 520]], t), n = Math.min(8, Math.floor(t / 0.24)); return [
      ...Array.from({ length: n }, (_, i) => <Alarm x={60 + i * 120} y={1150 - (i % 2) * 20} s={0.45} col={CLK[i % CLK.length]} t={t} />),
      <Toon env="in" x={wx} y={520} s={0.95} o="student" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} arms={{ r: ["hold"], l: ["down"] }} hold={[...HAIR, <frame x={330} y={520} width={200} height={230} layout="none" animate={S(0.55)}><Alarm x={0} y={0} col="#F2C14E" t={t} /></frame>]}
        anim={[{ property: "offsetY", keyframes: Array.from({ length: 13 }, (_, i) => ({ at: i * 0.17, value: i % 2 ? -18 : 0 })) }, { property: "rotation", keyframes: Array.from({ length: 13 }, (_, i) => ({ at: i * 0.17, value: i % 2 ? 4 : -4 })) }]} />,
      <Boom x={560} y={260} text="ТСС…" s={pop(t, 0.2, 3) * 0.7} col="#B79AE8" rot={-4} />]; } },
  { name: "B8", at: A.B8, scene: "dorm", focus: null, enter: "cut",
    p: (t) => { const rings = [0.03, 1.0, 2.02, 2.4, 2.75, 3.1].filter((x) => t >= x && t < x + 0.35).length; return { ...NIGHT, cut: 1, pbed: rings ? 1 : 0, rx: key([[0, 0.2], [3.5, -0.2]], t), ry: 2.9, rz: 2.2, tx: -0.4, ty: 0.5, tz: -3.7, lens: 1.05 }; },
    cam: (t) => ({ s: key([[0, 1.0], [3.5, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => { const R = [0.03, 1.0, 2.02, 2.4, 2.75, 3.1], on = (i) => t >= R[i] && t < R[i] + 0.5, any = R.some((x) => t >= x && t < x + 0.35);
      return [
        <Toon env="in" x={300} y={560} s={0.65} o="pajama" dur={4} face={any ? { eyes: "shock", brows: "up", mouth: "o", glasses: true, stache: true } : { eyes: "happy", brows: "flat", mouth: "flat", glasses: true, stache: true }} hold={NIGHTCAP}
          anim={[{ property: "offsetY", keyframes: [{ at: 0, value: any ? -90 : 0 }, { at: 0.02, value: any ? -90 : 0 }] }]} />,
        ...Array.from({ length: 6 }, (_, i) => <Alarm x={110 + i * 140} y={1150 - (i % 2) * 20} s={0.5} col={CLK[i % CLK.length]} ring={on(i) ? 1 : 0} t={t} />),
        <Boom x={260} y={1300} text="ДЗЫНЬ!" s={any ? 0.9 + 0.05 * Math.sin(t * 40) : 0} rot={-6} />]; },
    top: (t) => [<Label x={600} y={230} w={380} size={70} text={t < 1.0 ? "1:00" : t < 2.02 ? "1:03" : t < 2.4 ? "1:06" : t < 2.75 ? "1:09" : "1:12"} bg="#1E2A5A" fg="#FFE45C" s={1} rot={3} />] },
  { name: "B9", at: A.B9, scene: "dorm", focus: null, enter: "cut",
    p: (t) => ({ ...NIGHT, prof: 1, lamp: 0.2, rx: 0.4, ry: 1.3, rz: 0.9, tx: -0.7, ty: 0.9, tz: -2.8, lens: 1.0 }),
    cam: (t) => { const sh = t < 1.1 ? Math.sin(t * 55) * 10 : 0; return { s: 1.05, x: sh, y: 0 }; },
    mid: (t) => {
      if (t < 1.1) return [<Toon env="in" x={200} y={520} s={1.0} o="pajama" dur={2} face={{ eyes: "open", brows: "angry", mouth: "teeth", glasses: true, stache: true }} arms={{ r: ["knock"] }} hold={NIGHTCAP} anim={[{ property: "offsetX", keyframes: Array.from({ length: 9 }, (_, i) => ({ at: i * 0.13, value: i % 2 ? -14 : 0 })) }]} />,
        <Boom x={440} y={300} text="БАМ! БАМ!" s={0.85 + 0.08 * Math.abs(Math.sin(t * 24))} col="#FFFFFF" />];
      if (t < 2.2) return [<Flashlight x={key([[1.1, 520], [2.2, 380]], t)} y={1120} rot={key([[1.1, -10], [2.2, 15]], t)} />,
        <Toon env="in" x={key([[1.1, 520], [2.2, 380]], t) - 420} y={900} s={0.8} o="pajama" dur={3} face={{ eyes: "open", brows: "up", mouth: "o", glasses: true, stache: true }} arms={{ r: ["fwd"] }} hold={NIGHTCAP} anim={[{ property: "rotation", keyframes: [{ at: 0, value: 25 }, { at: 0.02, value: 25 }] }]} />,
        <Boom x={300} y={300} text="ГДЕ?!" s={pop(t, 1.15, 2) * 0.8} col="#FFFFFF" />];
      return [<Toon env="in" x={200} y={560} s={1.0} o="pajama" dur={2} face={{ eyes: "squint", brows: "angry", mouth: "teeth", glasses: true, stache: true }} arms={{ r: ["up"], l: ["up"] }}
          hold={[<rect x={110} y={20} width={380} height={170} radius={60} fill="#FBF6E6" strokeColor={INK} strokeWidth={9} />]} anim={[{ property: "rotation", keyframes: Array.from({ length: 8 }, (_, i) => ({ at: i * 0.12, value: i % 2 ? 6 : -6 })) }]} />,
        <Boom x={460} y={330} text="ДЗЫНЬ!" s={0.85 + 0.06 * Math.sin(t * 40)} />];
    } },
  { name: "B10", at: A.B10, scene: "dorm", focus: null, enter: "fade",
    p: (t) => ({ ...NIGHT, cut: 1, lamp: t < 1.9 ? 0.9 : 0.0, rx: key([[0, -0.2], [2.6, -0.4]], t), ry: 2.9, rz: 2.2, tx: -0.4, ty: 0.5, tz: -3.7, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.08], [2.6, 1.16]], t), x: 0, y: 0 }),
    mid: (t) => [
      <Toon env="in" x={300} y={560 + key([[1.2, 0], [1.6, 90]], t)} s={0.65} o="pajama" dur={3} face={t < 1.3 ? { eyes: "open", brows: "sad", mouth: "flat", glasses: true, stache: true } : { eyes: "happy", brows: "flat", mouth: "o", glasses: true, stache: true }} hold={NIGHTCAP}
        anim={[{ property: "rotation", keyframes: [{ at: 0, value: 0 }, { at: 1.3, value: 0 }, { at: 1.6, value: -70 }, { at: 2.9, value: -70 }] }]} />,
      ...Array.from({ length: 6 }, (_, i) => <Alarm x={110 + i * 140} y={1150 - (i % 2) * 20} s={0.5} col={CLK[i % CLK.length]} t={t} />),
      <Toon env="in" x={620} y={1000} s={0.7} o="student" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.8] }} arms={{ r: ["down", "up", 1.7] }} hold={HAIR} />],
    top: (t) => [<Label x={600} y={230} w={380} size={70} text="5:00" bg="#1E2A5A" fg="#FFE45C" s={1} rot={3} />,
      <Boom x={160} y={460} text="Zzz" s={t > 1.6 ? 0.8 + 0.1 * Math.sin(t * 6) : 0} col="#B79AE8" rot={-12} />] },
  { name: "B11", at: A.B11, scene: "hall", focus: 4.0, blur: 6, enter: "fade",
    p: (t) => ({ ...HALL, rx: key([[0, 0.6], [2.0, 0.2]], t), ry: 2.0, rz: 3.4, tx: -0.6, ty: 1.2, tz: -3.0, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.0, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon env="in" x={-40} y={760} s={0.72} o="mate1" dur={3} face={{ eyes: "open", brows: "sad", mouth: "flat", blinks: [0.9] }} />,
      <Toon env="in" x={260} y={790} s={0.72} o="mate2" dur={3} face={{ eyes: "open", brows: "sad", mouth: "flat", blinks: [1.4] }} />,
      <Toon env="in" x={560} y={770} s={0.72} o="student" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} hold={HAIR} />],
    top: (t) => [<Clock x={680} y={150} s={0.6} h={9} m={0} />, <Label x={90} y={330} w={480} size={46} text="ГРОМОВА НЕТ" bg="#FFFFFF" s={pop(t, 1.3, 3) * 0.9} rot={-3} />] },
  { name: "B12", at: A.B12, scene: "hall", focus: 0.6, blur: 12, enter: "cut",
    p: () => ({ ...HALL, rx: 0.8, ry: 2.0, rz: 2.0, tx: 0.0, ty: 1.6, tz: -3.9, lens: 1.2 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.5, 1.12]], t), x: 0, y: 0 }),
    top: (t) => { const m = t < 0.78 ? 5 : t < 1.57 ? 10 : 15; return [<Clock x={340} y={420} s={1.6 + 0.08 * pop(t, [0.02, 0.78, 1.57].filter((x) => t >= x).pop() ?? 0, 0.2)} h={9} m={m} />,
      <Toon env="in" x={40} y={1180} s={0.62} o="mate3" dur={3} face={t < 1.57 ? { eyes: "open", brows: "up", mouth: "o" } : { eyes: "happy", brows: "up", mouth: "grin" }} />,
      <Toon env="in" x={440} y={1200} s={0.62} o="mate1" dur={3} face={t < 1.57 ? { eyes: "open", brows: "up", mouth: "flat" } : { eyes: "happy", brows: "up", mouth: "grin" }} />,
      <Boom x={280} y={1080} text="ТИК-ТАК" s={pop(t, 0.05, 3) * 0.6} col="#FFFFFF" rot={-4} />]; } },
  { name: "B13", at: A.B13, scene: "hall", focus: 3.2, blur: 7, enter: "cut",
    p: () => ({ ...HALL, rx: -0.4, ry: 1.6, rz: 0.8, tx: -1.4, ty: 1.1, tz: -3.0, lens: 1.1 }),
    cam: (t) => ({ s: key([[0, 1.04], [1.6, 1.12]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon env="in" x={160} y={440} s={1.0} o="dean" dur={3} face={{ eyes: "open", brows: "flat", mouth: "talk", talk: [[0.05, 1.5]], glasses: true }} arms={{ r: ["hold"] }} hold={[<rect x={380} y={480} width={170} height={210} radius={8} fill="#FBF6E6" strokeColor={INK} strokeWidth={7} />]} />],
    top: (t) => [<Label x={90} y={1300} w={900} size={52} text="ЭКЗАМЕН ЧЕРЕЗ НЕДЕЛЮ" bg="#8FD06A" s={pop(t, 0.5, 2)} rot={-3} />,
      <Boom x={300} y={260} text="УРА!" s={pop(t, 1.0, 1) * 1.0} col="#FFE45C" rot={8} />] },
  { name: "B14", at: A.B14, scene: "dorm", focus: null, enter: "fade",
    p: (t) => ({ ...DORM, lamp: 0.8, rx: key([[0, 0.3], [2.7, 0.0]], t), ry: 1.5, rz: 1.0, tx: 0.2, ty: 0.7, tz: -2.4, lens: 1.0 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.7, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => { const nod = (k) => [{ property: "rotation", keyframes: Array.from({ length: 6 }, (_, i) => ({ at: i * 0.45 + k, value: i % 2 ? 14 : 0 })) }]; return [
      <Toon env="in" x={60} y={720} s={0.72} o="student" dur={3} face={{ eyes: "happy", brows: "flat", mouth: "smirk" }} hold={[...HAIR, ...MASK]} anim={[{ property: "rotation", keyframes: [{ at: 0, value: -80 }, { at: 0.02, value: -80 }] }]} />,
      <Toon env="in" x={420} y={600} s={0.8} o="mate1" dur={3} face={{ eyes: "squint", brows: "sad", mouth: "flat" }} hold={[...BAGS, <rect x={360} y={520} width={200} height={150} radius={8} fill="#D21E34" strokeColor={INK} strokeWidth={7} />]} anim={nod(0)} />,
      <Toon env="in" x={640} y={660} s={0.8} o="mate2" dur={3} face={{ eyes: "open", brows: "sad", mouth: "flat", sweat: true }} hold={[...BAGS, <rect x={360} y={520} width={200} height={150} radius={8} fill="#4C9AE8" strokeColor={INK} strokeWidth={7} />]} anim={nod(0.2)} />,
      <Boom x={60} y={430} text="Zzz" s={0.75 + 0.1 * Math.sin(t * 6)} col="#B79AE8" rot={-10} />]; } },
  { name: "B15", at: A.B15, scene: "booth", focus: 2.3, blur: 4, enter: "whip",
    p: () => ({ ...SHOP, rx: 0.2, ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.04], [1.5, 1.12]], t), x: 0, y: 0 }),
    mid: () => [<Toon env="in" x={430} y={600} s={0.85} o="bookie" dur={2} face={{ eyes: "smug", brows: "up", mouth: "smirk" }} />],
    top: (t) => [<Toon env="in" x={-160} y={760} s={1.05} o="prof" dur={2} face={{ eyes: "smug", brows: "angry", mouth: "flat", glasses: true, stache: true, blinks: [0.9] }} arms={{ r: ["down", "fwd", 0.15] }} />,
      <Earplugs x={420} y={key([[0, 1200], [0.45, 1010]], t)} s={0.9} />] },
  { name: "B16", at: A.B16, scene: "booth", focus: 2.3, blur: 4, enter: "cut",
    p: () => ({ ...SHOP, rx: -0.1, ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05 }),
    cam: (t) => ({ s: key([[0, 1.06], [1.6, 1.16]], t), x: 0, y: 0 }),
    mid: () => [<Toon env="in" x={430} y={600} s={0.85} o="bookie" dur={2} face={{ eyes: "shock", brows: "up", mouth: "o" }} />],
    top: (t) => [<Toon env="in" x={-180} y={740} s={1.08} o="student" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.9] }} arms={{ r: ["down", "fwd", 0.1] }} hold={HAIR} />,
      <Drum x={400} y={key([[0, 1200], [0.4, 960]], t)} s={1.0} />,
      <Boom x={400} y={300} text="БУМ!" s={pop(t, 0.45, 2) * 1.1} col="#FFE45C" rot={-8} />] },
];
for (const s of SHOTS) s.enter = s.enter || "cut";
