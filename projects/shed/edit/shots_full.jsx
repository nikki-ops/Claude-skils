// «Ресторан из сарая» — 16 shots on the Dipper voice (Neuralbox API). Times = sentence starts of audio/segments.json.
// Voice + music only (no SFX): sound is shown as comic lettering.
import { Toon, OUTFIT, INK } from "../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";

OUTFIT.chef = { body: "#2F3A4A", shade: "#1F2834", hat: null, bodyIn: "#3A4760", shadeIn: "#26303F" };
OUTFIT.f1 = { body: "#5B8DE8", shade: "#3A64B8", hat: null };
OUTFIT.f2 = { body: "#E86A7A", shade: "#B84858", hat: null };
OUTFIT.f3 = { body: "#8FD06A", shade: "#5FA048", hat: null };
OUTFIT.g1 = { body: "#B79AE8", shade: "#8A70C0", hat: null };
OUTFIT.g2 = { body: "#F2C14E", shade: "#C0962E", hat: null };
OUTFIT.g3 = { body: "#5ED5C6", shade: "#3AA89A", hat: null };

const lerp = (a, b, u) => a + (b - a) * u;
const cl = (u) => (u < 0 ? 0 : u > 1 ? 1 : u);
const ease = (u) => { u = cl(u); return u * u * (3 - 2 * u); };
const key = (kf, t) => { if (t <= kf[0][0]) return kf[0][1]; for (let i = 0; i < kf.length - 1; i++) { const [a, va] = kf[i], [b, vb] = kf[i + 1]; if (t < b) return lerp(va, vb, ease((t - a) / (b - a))); } return kf[kf.length - 1][1]; };
const pop = (t, t0, len = 0.6) => (t < t0 || t > t0 + len ? 0 : t < t0 + 0.08 ? (t - t0) / 0.08 * 1.25 : t < t0 + 0.16 ? lerp(1.25, 1.0, (t - t0 - 0.08) / 0.08) : 1);
const circ = (cx, cy, rx, ry = rx) => { const k = 0.5523, ox = rx * k, oy = ry * k; return `M${cx} ${cy - ry} C${cx + ox} ${cy - ry} ${cx + rx} ${cy - oy} ${cx + rx} ${cy} C${cx + rx} ${cy + oy} ${cx + ox} ${cy + ry} ${cx} ${cy + ry} C${cx - ox} ${cy + ry} ${cx - rx} ${cy + oy} ${cx - rx} ${cy} C${cx - rx} ${cy - oy} ${cx - ox} ${cy - ry} ${cx} ${cy - ry} Z`; };
const P = (d, o = {}) => <path d={d} x={0} y={0} {...o} />;
const S = (s, r = 0) => [{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", from: r, to: r, at: 0, duration: 0.02 }];
const star = (cx, cy, r) => { let d = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; d += (i ? "L" : "M") + (cx + Math.cos(a) * rr).toFixed(1) + " " + (cy + Math.sin(a) * rr).toFixed(1); } return d + "Z"; };
const bob = (n, per = 0.17, amp = -14) => [{ property: "offsetY", keyframes: Array.from({ length: n }, (_, i) => ({ at: i * per, value: i % 2 ? amp : 0 })) }];

// --- hero look & props ---
const BEANIE = [P("M170 120 C170 20 430 20 430 120 Z", { fill: "#D21E34", stroke: { width: 8, color: INK } }), <rect x={160} y={105} width={280} height={40} radius={14} fill="#A8172A" strokeColor={INK} strokeWidth={7} />, P(circ(300, 24, 24), { fill: "#FBF4E2", stroke: { width: 6, color: INK } })];
const PHONE = (x = 380, y = 470) => [<rect x={x} y={y} width={110} height={180} radius={16} fill="#2A2A36" strokeColor={INK} strokeWidth={7} />, <rect x={x + 12} y={y + 14} width={86} height={140} radius={8} fill="#8FD0F0" />];
const PLATE0 = (x, y, w = 240) => [P(circ(x, y, w / 2, w / 5.5), { fill: "#FFFFFF", stroke: { width: 7, color: INK } }), P(circ(x, y - 4, w / 3, w / 9), { stroke: { width: 4, color: "#CFCDEA" } })];
function Boom({ x, y, text, s = 1, rot = -8, col = "#FFD34A", size = 110, w = 560 }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={w} height={size * 1.8} layout="none" origin="center" animate={S(s, rot)}>
    <text x={6} y={10} width={w} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={size} color="#1E1418">{text}</text>
    <text x={0} y={0} width={w} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={size} color={col} strokeColor="#1E1418" strokeWidth={6}>{text}</text>
  </frame>;
}
function Label({ x, y, text, s = 1, w = 520, bg = "#FFFFFF", fg = "#1E1418", size = 56, rot = 0 }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={w} height={size * 1.7} layout="none" origin="center" animate={S(s, rot)}>
    <rect x={8} y={10} width={w} height={size * 1.6} radius={18} fill="#1E1418" />
    <rect x={0} y={0} width={w} height={size * 1.6} radius={18} fill={bg} strokeColor="#1E1418" strokeWidth={7} />
    <text x={0} y={size * 0.28} width={w} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={size} color={fg}>{text}</text>
  </frame>;
}
function Stars({ x, y, s = 1, n = 5 }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={560} height={120} layout="none" origin="center" animate={S(s, -4)}>
    {Array.from({ length: 5 }, (_, i) => P(star(56 + i * 112, 60, 52), { fill: i < n ? "#FFD34A" : "#E6E0D0", stroke: { width: 7, color: INK } }))}
  </frame>;
}
function Coin({ x, y, s = 1 }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={220} height={220} layout="none" origin="center" animate={S(s, 8)}>
    {P(circ(110, 110, 100), { fill: "#F2C14E", stroke: { width: 9, color: INK } })}{P(circ(110, 110, 76), { stroke: { width: 5, color: "#C0962E" } })}
    <text x={0} y={62} width={220} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={72} color="#5A3A10">£10</text>
  </frame>;
}
// dishes for the fake photos: k = foam | tab | sponge | foot
function Dish({ x, y, s = 1, k, rot = -3 }) {
  const food = {
    foam: [P("M70 170 C40 110 110 70 150 100 C170 40 260 50 260 110 C320 100 330 170 290 180 Z", { fill: "#FFFFFF", stroke: { width: 7, color: INK } }), P("M140 120 C160 100 190 110 200 130", { stroke: { width: 5, color: "#CFCDEA", cap: "round" } }), P(circ(250, 90, 16), { fill: "#D21E34", stroke: { width: 5, color: INK } })],
    tab: [<rect x={110} y={110} width={90} height={60} radius={10} fill="#FFFFFF" strokeColor={INK} strokeWidth={7} />, <rect x={110} y={110} width={45} height={60} radius={10} fill="#4C9AE8" strokeColor={INK} strokeWidth={7} />,
      <rect x={200} y={100} width={90} height={60} radius={10} fill="#FFFFFF" strokeColor={INK} strokeWidth={7} />, <rect x={245} y={100} width={45} height={60} radius={10} fill="#8FD06A" strokeColor={INK} strokeWidth={7} />, P(circ(170, 100, 14), { fill: "#D21E34", stroke: { width: 5, color: INK } })],
    sponge: [<rect x={110} y={90} width={180} height={50} radius={10} fill="#3FAE5A" strokeColor={INK} strokeWidth={7} />, <rect x={110} y={130} width={180} height={50} radius={10} fill="#F2D24E" strokeColor={INK} strokeWidth={7} />,
      P("M140 150 l8 0 M190 160 l8 0 M240 150 l8 0", { stroke: { width: 6, color: "#C0A030", cap: "round" } }), P("M200 90 C210 60 240 60 250 80", { stroke: { width: 7, color: "#3FAE5A", cap: "round" } })],
    foot: [P("M60 150 C60 110 120 100 200 108 C250 112 290 100 320 110 C345 118 345 160 320 168 C250 186 120 190 80 180 C66 176 60 166 60 150 Z", { fill: "#F2C9A8", stroke: { width: 7, color: INK } }),
      ...[0, 1, 2, 3, 4].map((i) => P(circ(320 - i * 4, 112 + i * 13, 13 - i, 9), { fill: "#F2C9A8", stroke: { width: 5, color: INK } })),
      P("M120 104 C130 80 150 80 156 100 M170 100 C176 78 196 80 200 104", { fill: "#3FAE5A", stroke: { width: 5, color: INK } })],
  }[k];
  return <frame x={x} y={y} width={400} height={260} layout="none" origin="center" animate={S(s, rot)}>
    {P(circ(200, 160, 190, 70), { fill: "#FFFFFF", stroke: { width: 8, color: INK } })}{P(circ(200, 156, 130, 44), { stroke: { width: 5, color: "#CFCDEA" } })}
    {food}
  </frame>;
}
function Phone({ x, y, s = 1, rot = 0, children }) {
  return <frame x={x} y={y} width={560} height={1000} layout="none" origin="center" animate={S(s, rot)}>
    <rect x={14} y={18} width={540} height={980} radius={60} fill="#1E1418" />
    <rect x={0} y={0} width={540} height={980} radius={60} fill="#2A2A36" strokeColor="#1E1418" strokeWidth={8} />
    <rect x={26} y={60} width={488} height={880} radius={30} fill="#FBF6E6" />
    {children}
  </frame>;
}
function Laptop({ x, y, s = 1, glow = 1 }) {
  return <frame x={x} y={y} width={520} height={360} layout="none" origin="center" animate={S(s)}>
    <rect x={40} y={0} width={440} height={280} radius={18} fill="#3A3A4A" strokeColor={INK} strokeWidth={8} />
    <rect x={62} y={20} width={396} height={236} radius={8} fill={glow ? "#BFE6FF" : "#5A6A8A"} />
    {[0, 1, 2, 3].map((i) => <rect x={90} y={50 + i * 46} width={300 - (i % 2) * 90} height={18} radius={9} fill="#7FA8C8" />)}
    {P("M0 290 L520 290 L490 340 L30 340 Z", { fill: "#55556A", stroke: { width: 8, color: INK } })}
  </frame>;
}
function Bulb({ x, y, s = 1 }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={220} height={300} layout="none" origin="center" animate={S(s, 6)}>
    {P("M110 10 C190 10 220 80 200 130 C185 165 150 175 150 215 L70 215 C70 175 35 165 20 130 C0 80 30 10 110 10 Z", { fill: "#FFE45C", stroke: { width: 9, color: INK } })}
    <rect x={68} y={215} width={84} height={50} radius={8} fill="#B8B8C8" strokeColor={INK} strokeWidth={7} />
    {P("M0 30 L-40 0 M220 30 L260 0 M110 -10 L110 -50", { stroke: { width: 9, color: "#FFE45C", cap: "round" } })}
  </frame>;
}
function Rank({ x, y, s = 1, n }) {
  return <frame x={x} y={y} width={760} height={300} layout="none" origin="center" animate={S(s, -3)}>
    <rect x={14} y={18} width={740} height={280} radius={30} fill="#1E1418" />
    <rect x={0} y={0} width={740} height={280} radius={30} fill="#FFFFFF" strokeColor="#1E1418" strokeWidth={9} />
    <text x={0} y={26} width={740} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={42} color="#6A6A7A">РЕСТОРАНЫ ЛОНДОНА</text>
    <text x={0} y={92} width={740} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={140} color={n === "1" ? "#2E9E4E" : "#D21E34"}>№{n}</text>
  </frame>;
}
function Medal({ x, y, s = 1 }) {
  if (s <= 0.01) return null;
  return <frame x={x} y={y} width={420} height={520} layout="none" origin="center" animate={S(s, -6)}>
    {P("M120 0 L180 200 L120 240 L60 30 Z M300 0 L240 200 L300 240 L360 30 Z", { fill: "#D21E34", stroke: { width: 8, color: INK } })}
    {P(circ(210, 330, 170), { fill: "#F2C14E", stroke: { width: 10, color: INK } })}{P(circ(210, 330, 130), { stroke: { width: 6, color: "#C0962E" } })}
    <text x={0} y={250} width={420} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={150} color="#5A3A10">№1</text>
  </frame>;
}
function Microwave({ x, y, s = 1, on = 0 }) {
  return <frame x={x} y={y} width={520} height={320} layout="none" origin="center" animate={S(s)}>
    <rect x={10} y={14} width={500} height={300} radius={20} fill="#1E1418" />
    <rect x={0} y={0} width={500} height={300} radius={20} fill="#E6E0D0" strokeColor={INK} strokeWidth={8} />
    <rect x={30} y={30} width={330} height={240} radius={14} fill={on ? "#FFD98A" : "#4A4A5A"} strokeColor={INK} strokeWidth={7} />
    <rect x={390} y={40} width={80} height={44} radius={6} fill="#1E2A2A" />
    <text x={390} y={44} width={80} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={30} color="#7CEC7C">{on ? "0:42" : "0:00"}</text>
    {[0, 1, 2].map((i) => P(circ(430, 140 + i * 50, 16), { fill: "#B8B8C8", stroke: { width: 5, color: INK } }))}
  </frame>;
}
function Tray({ x, y, s = 1, rot = 0 }) {
  return <frame x={x} y={y} width={300} height={200} layout="none" origin="center" animate={S(s, rot)}>
    <rect x={0} y={30} width={300} height={140} radius={18} fill="#2A2A36" strokeColor={INK} strokeWidth={8} />
    <rect x={20} y={46} width={260} height={100} radius={12} fill="#E8A050" />
    {P("M40 90 C80 70 120 110 160 90 C200 70 240 100 260 88", { stroke: { width: 10, color: "#C9602C", cap: "round" } })}
    <rect x={190} y={0} width={110} height={70} radius={10} fill="#D21E34" strokeColor={INK} strokeWidth={7} />
    <text x={190} y={8} width={110} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={44} color="#FFFFFF">£1</text>
  </frame>;
}
const flash = (t, ts) => { const d = ts.map((x) => t - x).filter((u) => u >= 0 && u < 0.18); return d.length ? 1 - d[0] / 0.18 : 0; };
const Flash = ({ a }) => (a > 0.01 ? <rect x={0} y={0} width={1080} height={1920} fill="#FFFFFF" opacity={a * 0.85} /> : null);

// --- 3D placement: characters stand on the floor of the scene, size from depth ---
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nrm = (a) => { const l = Math.hypot(...a); return a.map((v) => v / l); };
export const proj = (c, X, Y, Z) => { const ro = [c.rx, c.ry, c.rz], ww = nrm(sub([c.tx, c.ty, c.tz], ro)), uu = nrm(crs(ww, [0, 1, 0])), vv = crs(uu, ww), d = sub([X, Y, Z], ro), z = dot(d, ww);
  return { px: 540 + dot(d, uu) * c.lens / z * 1920, py: 960 - dot(d, vv) * c.lens / z * 1920, z }; };
export const stand = (c, X, Z, H = 1.55) => { const f = proj(c, X, 0, Z), s = H * c.lens * 1920 / (f.z * 985); return { x: f.px - 300, y: f.py - 500 - 485 * s, s }; };
// sign text glued to the 3D sign board over the door (centre -0.35,1.98,-1.91; 1.24 m wide)
function Sign({ c, s = 1 }) {
  if (s <= 0.01) return null; const f = proj(c, -0.35, 1.98, -1.91), w = 1.24 * c.lens / f.z * 1920, h = 0.32 * c.lens / f.z * 1920;
  return <frame x={f.px - w / 2} y={f.py - h / 2} width={w} height={h} layout="none" origin="center" animate={S(s)}>
    <text x={0} y={h * 0.2} width={w} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={h * 0.58} color="#FFF3C8" strokeColor="#1E1418" strokeWidth={Math.max(2, h * 0.05)}>THE SHED</text>
  </frame>;
}

const A = { S1: 0, S2: 2.68, S3: 4.11, S4: 6.90, S5: 9.74, S6: 10.79, S7: 13.48, S8: 15.19, S9: 16.61, S10: 19.33, S11: 22.90, S12: 24.72, S13: 25.82, S14: 29.86, S15: 31.80, S16: 35.15 };
export const T = 38.3;
export const CAP_Y = 1330;
const DAY = { night: 0, lights: 0, table: 0, dawn: 0, sign: 1 };
const NIGHT = { night: 1, lights: 1, table: 1, dawn: 0, sign: 1 };
const ROOM = { night: 0, lamp: 0.5, cut: 0, pbed: 0, prof: 0 };
const HERO = (o) => ({ env: "out", o: "chef", hold: [...BEANIE, ...(o || [])] });
const LAPTOP = [<rect x={330} y={470} width={250} height={160} radius={12} fill="#3A3A4A" strokeColor={INK} strokeWidth={8} />, <rect x={346} y={484} width={218} height={120} radius={6} fill="#BFE6FF" />,
  <rect x={366} y={506} width={150} height={12} radius={6} fill="#7FA8C8" />, <rect x={366} y={534} width={110} height={12} radius={6} fill="#7FA8C8" />, <rect x={310} y={624} width={290} height={24} radius={8} fill="#55556A" strokeColor={INK} strokeWidth={7} />];

export const C = {
  S1: (t) => ({ rx: key([[0, 1.4], [2.6, 0.9]], t), ry: 1.3, rz: key([[0, 2.6], [2.6, 2.0]], t), tx: -0.2, ty: 1.5, tz: -2.0, lens: 1.0 }),
  S2: () => ({ rx: 0.8, ry: 1.3, rz: 0.9, tx: -0.1, ty: 1.25, tz: -2.0, lens: 1.1 }),
  S3: (t) => ({ rx: key([[0, 0.2], [2.8, 0.5]], t), ry: 1.45, rz: 1.9, tx: 0.5, ty: 1.0, tz: -2.0, lens: 1.0 }),
  S4: (t) => ({ rx: 0.9, ry: 1.5, rz: 0.7, tx: 0.5, ty: 1.35, tz: -2.0, lens: 1.1 }),
  S5: (t) => ({ rx: -0.9, ry: 1.3, rz: 1.5, tx: 0.2, ty: 1.1, tz: -2.2, lens: 1.05 }),
  S7: (t) => ({ rx: -0.4, ry: 1.55, rz: 1.1, tx: 0.2, ty: 1.15, tz: -1.4, lens: 1.1 }),
  S9: (t) => ({ rx: key([[0, 1.2], [2.7, 0.6]], t), ry: 1.35, rz: 2.6, tx: 0.0, ty: 1.15, tz: -2.0, lens: 1.0 }),
  S10: (t) => ({ rx: 0.0, ry: key([[0, 0.5], [3.5, 2.6]], t), rz: key([[0, 3.6], [3.5, 3.0]], t), tx: -0.2, ty: key([[0, 1.3], [3.5, 1.7]], t), tz: -3.0, lens: 1.0 }),
  S11: (t) => ({ rx: 2.2, ry: 1.4, rz: 3.2, tx: -0.2, ty: 1.1, tz: -2.2, lens: 1.0 }),
  S12: (t) => ({ rx: 0.7, ry: 1.45, rz: 0.8, tx: 0.5, ty: 1.3, tz: -2.0, lens: 1.1 }),
  S13: (t) => ({ rx: key([[0, -1.6], [4.0, -0.8]], t), ry: 0.8, rz: 4.6, tx: 0.0, ty: 1.5, tz: -3.0, lens: 1.05 }),
  S14: (t) => ({ rx: key([[0, 2.6], [1.9, 2.0]], t), ry: 1.6, rz: 3.8, tx: 0.0, ty: 1.0, tz: -1.4, lens: 1.0 }),
  S15: (t) => ({ rx: 0.4, ry: 1.4, rz: 1.5, tx: 0.6, ty: 1.0, tz: -2.0, lens: 1.05 }),
  S16: (t) => ({ rx: key([[0, 2.0], [3.1, 1.6]], t), ry: 1.5, rz: 2.6, tx: 0.0, ty: 0.95, tz: -0.6, lens: 1.0 }),
};

export const SHOTS = [
  // 0.00 hook: he slams the sign onto the shed, №1 medal drops
  { name: "S1", at: A.S1, scene: "garden", focus: null,
    p: (t) => ({ ...DAY, sign: t > 0.55 ? 1 : 0, ...C.S1(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [2.6, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => [<Sign c={C.S1(t)} s={t > 0.55 ? 1 : 0} />,
      <Toon {...HERO()} {...stand(C.S1(t), 0.45, -1.45)} dur={3} face={{ eyes: t < 0.6 ? "open" : "smug", brows: t < 0.6 ? "angry" : "smug", mouth: t < 0.6 ? "teeth" : "smirk", blinks: [1.6] }}
        arms={{ l: ["lift", "point", 0.45], r: ["down"] }} anim={[{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.25, value: -40 }, { at: 0.5, value: 0 }, { at: 3, value: 0 }] }]} />],
    top: (t) => [<Boom x={60} y={330} text="БАХ!" s={pop(t, 0.5, 0.5)} rot={8} />,
      <Medal x={600} y={key([[1.7, -60], [1.85, 60]], t)} s={pop(t, 1.7, 5) * 0.75} />] },
  // 2.68 «Не приготовив ни одного блюда.»
  { name: "S2", at: A.S2, scene: "garden", focus: null, enter: "whip",
    p: () => ({ ...DAY, ...C.S2() }),
    cam: (t) => ({ s: key([[0, 1.0], [1.4, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => [<Sign c={C.S2()} />, <Toon {...HERO(PLATE0(470, 560, 260))} {...stand(C.S2(), 0.35, -1.2)} dur={2} face={{ eyes: "smug", brows: "up", mouth: "smirk", blinks: [0.9] }} arms={{ r: ["hold"], l: ["down", "up", 0.5] }} />],
    top: (t) => [<Boom x={260} y={250} text="0 БЛЮД" s={pop(t, 0.35, 2)} col="#FFFFFF" rot={-6} />] },
  // 4.11 fake reviews for £10
  { name: "S3", at: A.S3, scene: "room", focus: null, enter: "fade",
    p: (t) => ({ ...ROOM, lamp: 0.9, ...C.S3(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [2.8, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon {...HERO(LAPTOP)} env="in" {...stand(C.S3(t), 0.3, -1.3)} dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.1, 2.4] }} arms={{ r: ["hold"], l: ["fwd"] }} />],
    top: (t) => [...[0.3, 1.0, 1.7, 2.3].map((t0, i) => <Coin x={760 - (i % 2) * 640 + 30 * i} y={key([[t0, 700], [t0 + 0.8, 480]], t) - i * 40} s={pop(t, t0, 3) * 0.75} />),
      <Stars x={260} y={key([[0.6, 330], [2.4, 260]], t)} s={pop(t, 0.6, 3) * 0.95} />,
      <Label x={180} y={150} w={720} size={52} text="«ЛУЧШЕЕ КАФЕ!!!»" bg="#FFFFFF" s={pop(t, 1.4, 3) * 0.9} rot={3} />] },
  // 6.90 the idea
  { name: "S4", at: A.S4, scene: "room", focus: null, enter: "cut",
    p: (t) => ({ ...ROOM, lamp: 0.9, ...C.S4(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [2.8, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon {...HERO()} env="in" {...stand(C.S4(t), 0.5, -1.2)} dur={3} face={t < 0.9 ? { eyes: "open", brows: "flat", mouth: "flat" } : { eyes: "smug", brows: "smug", mouth: "grin", blinks: [2.2] }} arms={{ r: ["down", "point", 0.9] }} />],
    top: (t) => [<Bulb x={700} y={180} s={pop(t, 0.85, 3) * 0.8} />,
      t > 1.4 ? <frame x={60} y={120} width={420} height={360} layout="none" origin="center" animate={S(pop(t, 1.4, 3) * 0.85, -4)}>
        {P(circ(210, 170, 200, 160), { fill: "#FFFFFF", stroke: { width: 9, color: INK } })}
        {P("M120 230 L120 140 L210 80 L300 140 L300 230 Z", { fill: "#7AA070", stroke: { width: 8, color: INK } })}
        <rect x={180} y={160} width={50} height={70} radius={4} fill="#C45C40" strokeColor={INK} strokeWidth={6} />
        <text x={250} y={30} width={140} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={110} color="#D21E34">?</text>
      </frame> : null] },
  // 9.74 he photographs the «dishes»
  { name: "S5", at: A.S5, scene: "garden", focus: null, enter: "whip",
    p: (t) => ({ ...DAY, ...C.S5(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [1.05, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => [<Sign c={C.S5(t)} />, <Toon {...HERO([<rect x={330} y={300} width={190} height={130} radius={18} fill="#3A3A4A" strokeColor={INK} strokeWidth={8} />, P(circ(425, 365, 44), { fill: "#8FD0F0", stroke: { width: 8, color: INK } }), <rect x={470} y={280} width={40} height={24} radius={6} fill="#D21E34" strokeColor={INK} strokeWidth={5} />])}
      {...stand(C.S5(t), -0.15, -1.0)} dur={2} face={{ eyes: "squint", brows: "smug", mouth: "smirk" }} arms={{ r: ["fwd"], l: ["fwd"] }} />],
    top: (t) => [<Boom x={460} y={240} text="ЩЁЛК!" s={pop(t, 0.3, 0.6)} col="#FFFFFF" rot={8} />, <Flash a={flash(t, [0.3])} />] },
  // 10.79 / 11.55 / 12.67 dish photos
  { name: "S6", at: A.S6, scene: "garden", focus: 0.9, blur: 14, enter: "cut",
    p: (t) => ({ ...DAY, table: 1, rx: 0.3, ry: 1.6, rz: 0.9, tx: 0.0, ty: 0.8, tz: -0.4, lens: 1.1 }),
    cam: (t) => ({ s: key([[0, 1.0], [2.7, 1.06]], t), x: 0, y: 0 }),
    top: (t) => { const k = t < 0.76 ? "foam" : t < 1.88 ? "tab" : "sponge", t0 = t < 0.76 ? 0 : t < 1.88 ? 0.76 : 1.88;
      const name = { foam: "ПЕНА ДЛЯ БРИТЬЯ", tab: "ТАБЛЕТКИ ДЛЯ ПОСУДОМОЙКИ", sponge: "ГУБКА ДЛЯ ПОСУДЫ" }[k];
      return [<frame x={90} y={360} width={900} height={900} layout="none" origin="center" animate={S(0.98 + 0.03 * pop(t, t0, 0.3), -3)}>
          <rect x={16} y={20} width={880} height={880} radius={20} fill="#1E1418" />
          <rect x={0} y={0} width={880} height={880} radius={20} fill="#FFFFFF" strokeColor={INK} strokeWidth={9} />
          <rect x={30} y={30} width={820} height={700} radius={8} fill="#E8DCC8" />
          <frame x={40} y={170} width={800} height={520} layout="none" origin="center" animate={S(1.9)}><Dish x={200} y={130} k={k} rot={0} /></frame>
          <text x={0} y={760} width={880} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={k === "tab" ? 44 : 56} color="#1E1418">{name}</text>
        </frame>,
        <Stars x={260} y={210} s={pop(t, t0 + 0.15, 2) * 0.9} />, <Flash a={flash(t, [0.0, 0.76, 1.88])} />]; } },
  // 13.48 his own foot as a dish — he stands BEHIND the table (table is in the near layer and covers his legs)
  { name: "S7", at: A.S7, scene: "garden", focus: 2.1, blur: 3, enter: "cut",
    p: (t) => ({ ...DAY, table: 1, ...C.S7(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [1.7, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => [<Sign c={C.S7(t)} />, <Toon {...HERO()} {...stand(C.S7(t), 0.45, -1.8)} dur={2} face={{ eyes: t < 0.8 ? "squint" : "smug", brows: "smug", mouth: t < 0.8 ? "teeth" : "smirk" }} arms={{ r: ["down"], l: ["up"] }} />],
    top: (t) => [<frame x={40} y={900} width={1000} height={600} layout="none" origin="center" animate={S(1.6, -2)}><Dish x={300} y={170} k="foot" rot={0} /></frame>,
      <Boom x={260} y={120} text="ФИРМЕННОЕ" s={pop(t, 0.7, 2) * 0.85} rot={-6} />, <Flash a={flash(t, [0.05])} />] },
  // 15.19 website: address ???, appointment only
  { name: "S8", at: A.S8, scene: "garden", focus: 0.6, blur: 16, enter: "fade",
    p: (t) => ({ ...DAY, rx: 0.4, ry: 1.2, rz: 1.4, tx: 0.0, ty: 1.3, tz: -2.0, lens: 1.0 }),
    cam: (t) => ({ s: 1.04, x: 0, y: 0 }),
    top: (t) => [<Phone x={260} y={key([[0, 520], [0.4, 300]], t)} s={1.0} rot={-3}>
        <rect x={26} y={60} width={488} height={300} radius={30} fill="#3F6A48" />
        <text x={26} y={120} width={488} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={66} color="#FFFFFF">THE SHED</text>
        <text x={26} y={210} width={488} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={30} color="#DDEEDD">ресторан • Лондон</text>
        <text x={50} y={400} width={440} fontFamily="Montserrat" fontWeight={800} fontSize={40} color="#1E1418">Адрес:</text>
        <text x={50} y={460} width={440} fontFamily="Montserrat" fontWeight={800} fontSize={80} color="#D21E34">???</text>
        <rect x={60} y={720} width={420} height={110} radius={55} fill="#2E9E4E" />
        <text x={60} y={748} width={420} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={40} color="#FFFFFF">ЗАПИСАТЬСЯ</text>
      </Phone>,
      <Label x={110} y={1080} w={860} size={64} text="ТОЛЬКО ПО ЗАПИСИ" bg="#FFE45C" s={pop(t, 0.62, 3)} rot={-6} />] },
  // 16.61 friends laugh, then write reviews
  { name: "S9", at: A.S9, scene: "garden", focus: null, enter: "whip",
    p: (t) => ({ ...DAY, ...C.S9(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [2.7, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => { const typing = t > 1.77, c = C.S9(t); return [<Sign c={c} />,
      <Toon env="out" {...stand(c, -0.8, -1.25)} o="f1" dur={3} face={typing ? { eyes: "squint", brows: "flat", mouth: "smirk" } : { eyes: "happy", brows: "up", mouth: "grin" }} laugh={!typing} arms={typing ? { r: ["hold"] } : {}} hold={typing ? PHONE() : []} />,
      <Toon env="out" {...stand(c, 0.0, -0.95)} o="f2" dur={3} face={typing ? { eyes: "squint", brows: "flat", mouth: "smirk" } : { eyes: "open", brows: "up", mouth: "talk", talk: [[0.1, 1.6]] }} arms={typing ? { r: ["hold"] } : { r: ["down", "point", 0.3] }} hold={typing ? PHONE() : []} />,
      <Toon env="out" {...stand(c, 0.8, -1.25)} o="f3" dur={3} face={typing ? { eyes: "squint", brows: "flat", mouth: "smirk" } : { eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh={!typing} arms={typing ? { r: ["hold"] } : {}} hold={typing ? PHONE() : []} />]; },
    top: (t) => [<Label x={160} y={240} w={760} size={60} text="«ШЕФ-ПОВАР ГУБОК»" bg="#FFFFFF" s={t < 1.77 ? pop(t, 0.5, 2) : 0} rot={-4} />,
      <Boom x={260} y={90} text="ХА-ХА" s={t < 1.77 ? pop(t, 0.05, 2) * 0.8 : 0} col="#FFFFFF" rot={8} />,
      ...[0, 1, 2].map((i) => <Stars x={40 + i * 300} y={key([[1.9 + i * 0.2, 560], [2.7, 300]], t)} s={pop(t, 1.9 + i * 0.2, 2) * 0.5} />)] },
  // 19.33 rank climbs 18 149 → 1 000 → 100
  { name: "S10", at: A.S10, scene: "garden", focus: null, enter: "cut",
    p: (t) => ({ ...DAY, ...C.S10(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [3.5, 1.1]], t), x: 0, y: 0 }),
    mid: (t) => [<Sign c={C.S10(t)} />],
    top: (t) => { const n = t < 1.01 ? null : t < 2.43 ? "18 149" : t < 3.07 ? "1 000" : "100", t0 = t < 2.43 ? 1.01 : t < 3.07 ? 2.43 : 3.07; return [
      n ? <Rank x={160} y={300} s={1 + 0.08 * pop(t, t0, 0.2)} n={n} /> : null,
      P(`M${880} ${key([[0, 1250], [3.5, 650]], t)} l-80 110 l50 0 l0 160 l60 0 l0 -160 l50 0 Z`, { fill: "#2E9E4E", stroke: { width: 8, color: INK } }),
      <Boom x={120} y={key([[0, 900], [1.0, 700]], t)} text="ВВЕРХ!" s={t < 1.01 ? pop(t, 0.1, 1) * 0.9 : 0} col="#8FD06A" rot={-6} />]; } },
  // 22.90 no tables — everyone wants a table: queue on the lawn
  { name: "S11", at: A.S11, scene: "garden", focus: null, enter: "whip",
    p: (t) => ({ ...DAY, ...C.S11(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [1.8, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => { const c = C.S11(t); return [<Sign c={c} />, ...["g1", "g2", "g3", "f1", "f2"].map((o, i) => [o, i]).sort((a, b) => (b[1] % 2) - (a[1] % 2)).map(([o, i]) =>
      <Toon env="out" {...stand(c, -1.7 + i * 0.85, i % 2 ? -0.9 : -0.3)} o={o} dur={2} face={{ eyes: i % 2 ? "open" : "squint", brows: "up", mouth: i % 2 ? "o" : "talk", talk: [[0, 1.8]] }} arms={{ r: ["down", "up", 0.2 + i * 0.15] }} anim={bob(12, 0.15 + i * 0.01, -10)} />)]; },
    top: (t) => [<Label x={330} y={140} w={420} size={64} text="МЕСТ НЕТ" bg="#D21E34" fg="#FFFFFF" s={pop(t, 0.15, 3)} rot={4} />,
      <Boom x={100} y={330} text="ХОЧУ!" s={pop(t, 0.8, 2) * 0.8} col="#FFFFFF" rot={-8} />] },
  // 24.72 the phone explodes
  { name: "S12", at: A.S12, scene: "room", focus: null, enter: "cut",
    p: (t) => ({ ...ROOM, lamp: 0.6, ...C.S12(t) }),
    cam: (t) => ({ s: 1.04, x: Math.sin(t * 50) * 6, y: 0 }),
    mid: (t) => [<Toon {...HERO(PHONE(370, 400))} env="in" {...stand(C.S12(t), 0.5, -1.2)} dur={2} face={{ eyes: "shock", brows: "up", mouth: "o" }} arms={{ r: ["hold"] }} anim={[{ property: "offsetX", keyframes: Array.from({ length: 14 }, (_, i) => ({ at: i * 0.08, value: i % 2 ? -8 : 8 })) }]} />],
    top: (t) => [<Boom x={480} y={220} text="ДЗЫНЬ!" s={0.85 + 0.06 * Math.sin(t * 40)} rot={-6} />,
      <Boom x={0} y={420} text="ДЗЫНЬ!" s={t > 0.4 ? 0.6 + 0.05 * Math.sin(t * 36) : 0} col="#FFFFFF" rot={8} />,
      <Label x={600} y={470} w={380} size={46} text="+99 ЗВОНКОВ" bg="#FFFFFF" s={pop(t, 0.6, 2) * 0.85} rot={5} />] },
  // 25.82 one morning: №1 in London
  { name: "S13", at: A.S13, scene: "garden", focus: null, enter: "fade",
    p: (t) => ({ ...DAY, dawn: key([[0, 1], [4, 0.6]], t), ...C.S13(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [4.0, 1.1]], t), x: 0, y: 0 }),
    mid: (t) => [<Sign c={C.S13(t)} />, <Toon {...HERO()} {...stand(C.S13(t), 0.35, -1.0)} dur={4} face={t < 1.2 ? { eyes: "open", brows: "up", mouth: "o" } : { eyes: "happy", brows: "up", mouth: "grin" }} arms={{ r: ["down", "up", 1.2], l: ["down", "up", 1.25] }}
      anim={[{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 1.2, value: 0 }, { at: 1.45, value: -120 }, { at: 1.7, value: 0 }, { at: 1.95, value: -80 }, { at: 2.2, value: 0 }, { at: 4.1, value: 0 }] }]} />],
    top: (t) => [<Medal x={330} y={key([[1.1, -260], [1.3, 40]], t)} s={t > 1.1 ? 0.8 : 0} />,
      t > 2.4 ? <frame x={140} y={1400} width={800} height={600} layout="none" origin="center" animate={S(pop(t, 2.4, 5) * 0.68, -3)}>
        <rect x={14} y={18} width={780} height={560} radius={24} fill="#1E1418" />
        <rect x={0} y={0} width={780} height={560} radius={24} fill="#FFFFFF" strokeColor={INK} strokeWidth={8} />
        <rect x={20} y={20} width={740} height={110} radius={16} fill="#FFE45C" />
        <text x={40} y={42} width={700} fontFamily="Montserrat" fontWeight={800} fontSize={56} color="#1E1418">1. САРАЙ ★★★★★</text>
        {["2. Ресторан", "3. Ресторан", "4. Ресторан"].map((r, i) => <text x={40} y={170 + i * 110} width={700} fontFamily="Montserrat" fontWeight={800} fontSize={50} color="#8A8A9A">{r}</text>)}
      </frame> : null] },
  // 29.86 open for one evening: lights on, guests walk in (all stand on the lawn in front of the table)
  { name: "S14", at: A.S14, scene: "garden", focus: null, enter: "fade",
    p: (t) => ({ ...NIGHT, lights: t > 0.35 ? 1 : 0, ...C.S14(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [1.9, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => { const c = C.S14(t); return [<Sign c={c} />,
      <Toon env="out" {...stand(c, key([[0.6, -3.2], [1.9, -1.3]], t), 0.9)} o="g1" dur={2} face={{ eyes: "open", brows: "up", mouth: "o" }} anim={bob(12, 0.16, -12)} />,
      <Toon env="out" {...stand(c, key([[0.8, 3.2], [1.9, 1.3]], t), 0.9)} o="g2" dur={2} face={{ eyes: "open", brows: "up", mouth: "o" }} anim={bob(12, 0.16, -12)} />,
      <Toon {...HERO()} {...stand(c, 0.9, 0.6)} dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} arms={{ r: ["down", "wave", 0.3] }} />]; },
    top: (t) => [<Label x={250} y={160} w={580} size={64} text="ОТКРЫТО" bg="#2E9E4E" fg="#FFFFFF" s={pop(t, 0.35, 0.95)} rot={-4} />,
      <Label x={250} y={160} w={580} size={64} text="1 ВЕЧЕР" bg="#FFE45C" s={pop(t, 1.32, 2)} rot={4} />] },
  // 31.80 ready meals for £1, microwave, served
  { name: "S15", at: A.S15, scene: "room", focus: null, enter: "whip",
    p: (t) => ({ ...ROOM, night: 1, lamp: 0.9, ...C.S15(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [3.3, 1.08]], t), x: 0, y: 0 }),
    mid: (t) => [<Toon {...HERO(t >= 3.02 ? PLATE0(480, 560, 260) : [])} env="in" {...stand(C.S15(t), 0.25, -1.2)} dur={4} face={t < 3.02 ? { eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.8, 2.4] } : { eyes: "smug", brows: "smug", mouth: "grin" }} arms={t < 3.02 ? { r: ["down", "point", 1.9] } : { r: ["hold"] }} />],
    top: (t) => { if (t >= 3.02) return [<Tray x={520} y={key([[3.02, 820], [3.2, 800]], t)} s={0.6} />, <Boom x={300} y={160} text="ПОДАНО!" s={pop(t, 3.05, 1)} rot={-6} />];
      const trays = Math.min(5, Math.floor(t / 0.25) + 1); return [
      ...(t < 1.9 ? Array.from({ length: trays }, (_, i) => <Tray x={680 - (i % 2) * 40} y={1100 - i * 110} s={0.9} rot={(i % 2 ? 4 : -3)} />) : [<Microwave x={600} y={760} s={0.95} on={t > 2.0 ? 1 : 0} />]),
      <Label x={500} y={200} w={520} size={44} text="ГОТОВЫЕ ОБЕДЫ" bg="#FFFFFF" s={t < 1.9 ? pop(t, 0.2, 2) * 0.9 : 0} rot={4} />,
      <Boom x={520} y={480} text="ДЗЫНЬ!" s={pop(t, 2.6, 0.45) * 0.85} rot={6} />]; } },
  // 35.15 guests behind the table ask to come again; hero steps in front, «реальная история»
  { name: "S16", at: A.S16, scene: "garden", focus: 3.4, blur: 2, enter: "cut",
    p: (t) => ({ ...NIGHT, ...C.S16(t) }),
    cam: (t) => ({ s: key([[0, 1.0], [3.1, 1.06]], t), x: 0, y: 0 }),
    mid: (t) => { const c = C.S16(t); return [<Sign c={c} />,
      <Toon env="out" {...stand(c, -0.75, -1.15)} o="g1" dur={4} face={{ eyes: "happy", brows: "up", mouth: "grin" }} arms={{ r: ["down", "up", 0.4] }} />,
      <Toon env="out" {...stand(c, 0.0, -1.15)} o="g2" dur={4} face={{ eyes: "happy", brows: "up", mouth: "talk", talk: [[0.3, 1.5]] }} />,
      <Toon env="out" {...stand(c, 0.75, -1.15)} o="g3" dur={4} face={{ eyes: "open", brows: "up", mouth: "grin", blush: true }} arms={{ l: ["down", "up", 0.6] }} />]; },
    top: (t) => [<Boom x={300} y={120} text="ЕЩЁ!" s={pop(t, 0.4, 1.4)} col="#FFFFFF" rot={-6} />,
      t > 1.6 ? <Toon {...HERO()} {...stand(C.S16(t), key([[1.6, 2.2], [2.0, 0.75]], t), 0.75)} dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [2.4] }} arms={{ r: ["down", "point", 1.9] }} /> : null,
      <Label x={130} y={1600} w={820} size={60} text="РЕАЛЬНАЯ ИСТОРИЯ" bg="#FFE45C" s={pop(t, 1.75, 5)} rot={-3} />] },
];
for (const s of SHOTS) s.enter = s.enter || "cut";
