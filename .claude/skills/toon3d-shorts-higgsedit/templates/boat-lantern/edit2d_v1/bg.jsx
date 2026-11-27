import { circ, INK } from "./char.jsx";
const P = (d, w, h, o = {}) => <path d={d} x={0} y={0} width={w} height={h} {...o} />;
export const lg = (stops, angle = 180) => ({ kind: "linear", angle, stops: stops.map(([offset, color]) => ({ offset, color })) });
// full-scene layer frame W x H placed at (x,y)
export const L = ({ x = 0, y = 0, w = 1080, h = 1920, anim = [], children, op }) => (
  <frame x={x} y={y} width={w} height={h} layout="none" animate={anim}>{children}</frame>
);
export function Sky({ w = 1600, h = 1200, top = "#5AB0F6", bot = "#B0E1FF", dusk = false }) {
  const st = dusk ? [[0, "#3A1E8C"], [0.55, "#C64AA8"], [1, "#FF9A5A"]] : [[0, top], [1, bot]];
  return <rect x={0} y={0} width={w} height={h} fill={lg(st)} />;
}
export function Cloud({ x, y, s = 1, drift = 0, dur = 5 }) {
  const d = "M20 120 C0 120 0 80 30 75 C30 40 80 30 100 55 C115 15 185 15 195 60 C230 40 270 70 255 100 C290 105 285 140 255 140 L40 140 C20 140 10 125 20 120 Z";
  return (
    <frame x={x} y={y} width={300} height={170} layout="none" origin="top-left" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, ...(drift ? [{ property: "offsetX", from: 0, to: drift, at: 0, duration: dur, easing: "linear" }] : [])]}>
      {P(d, 300, 170, { fill: "#D9D6EE" })}
      {P(d, 300, 170, { fill: "#F6F5F8" })}
      {P("M40 128 C80 145 220 145 255 128 L255 140 L40 140 Z", 300, 170, { fill: "#DCD8F0" })}
    </frame>
  );
}
// sea band from y0 to h, with wave dashes and glints
export function Sea({ w = 1600, y0 = 900, h = 1920, dur = 5, dark = false }) {
  const rows = [];
  for (let i = 0; i < 14; i++) {
    const yy = y0 + 18 + i * i * 6.5, len = 30 + i * 9;
    for (let j = 0; j < 9; j++) {
      const xx = ((j * 197 + i * 83) % (w + 200)) - 100;
      rows.push(P(`M${xx} ${yy} Q${xx + len / 2} ${yy - 4 - i * 0.4} ${xx + len} ${yy}`, w, h, { stroke: { width: 3 + i * 0.5, color: dark ? "#5E7FB0" : "#8FD3FF", cap: "round" } }));
    }
  }
  return [
    <rect x={0} y={y0} width={w} height={h - y0} fill={lg(dark ? [[0, "#2C4A7A"], [1, "#16294D"]] : [[0, "#58B7EE"], [0.25, "#2E8FD8"], [1, "#1B5BA6"]])} />,
    <rect x={0} y={y0} width={w} height={6} fill={dark ? "#8AA0C8" : "#CDEBFF"} />,
    <frame x={0} y={0} width={w} height={h} layout="none" animate={[{ property: "offsetX", from: 0, to: -40, at: 0, duration: dur, easing: "linear" }]}>{rows}</frame>,
  ];
}
// distant cape on the right side of horizon (y0 = horizon)
export function CapeFar({ x = 820, y0 = 900, s = 1 }) {
  return (
    <frame x={x} y={y0 - 160 * s} width={520 * s} height={200 * s} layout="none">
      {P(`M0 ${160 * s} C${60 * s} ${120 * s} ${120 * s} ${60 * s} ${200 * s} ${40 * s} C${260 * s} ${20 * s} ${330 * s} ${30 * s} ${380 * s} ${50 * s} L${520 * s} ${70 * s} L${520 * s} ${160 * s} Z`, 520 * s, 200 * s, { fill: "#6E7F9E", stroke: { width: 4, color: "#4A5878" } })}
      {P(`M${150 * s} ${55 * s} C${210 * s} ${30 * s} ${300 * s} ${25 * s} ${380 * s} ${50 * s} L${400 * s} ${60 * s} C${300 * s} ${45 * s} ${220 * s} ${50 * s} ${150 * s} ${70 * s} Z`, 520 * s, 200 * s, { fill: "#7FA86A" })}
    </frame>
  );
}
// big cliff edge (close shot) occupying lower-right; buddy sits on top at around (cx, topY)
export function CliffNear({ w = 1400, h = 1920 }) {
  return [
    P(`M360 980 C420 940 520 930 640 935 C820 940 1000 925 ${w} 900 L${w} ${h} L300 ${h} C330 1500 300 1200 360 980 Z`, w, h, { fill: lg([[0, "#B08A6A"], [1, "#6B4A3A"]]), stroke: { width: 8, color: INK } }),
    P("M360 990 C420 950 520 940 640 945 C820 950 1000 935 1400 910 L1400 960 C1000 985 800 990 640 985 C520 982 430 990 370 1030 Z", w, h, { fill: "#6DC34A", stroke: { width: 6, color: INK } }),
    ...[[420, 1150, 60], [520, 1350, 90], [380, 1550, 70], [700, 1250, 50], [900, 1500, 80], [600, 1700, 60]].map(([cx, cy, r]) => P(`M${cx - r} ${cy} L${cx - r * 0.4} ${cy - r * 0.7} L${cx + r * 0.6} ${cy - r * 0.5} L${cx + r} ${cy + r * 0.3} Z`, w, h, { fill: "#8B6650", stroke: { width: 4, color: "#5A3E30" } })),
    ...[480, 560, 760, 980, 1180].map((gx) => P(`M${gx} 950 l8 -30 l6 28 l9 -24 l4 26`, w, h, { stroke: { width: 5, color: "#3E9A3A", cap: "round" } })),
  ];
}
// restaurant terrace: deck floor, railing at railY, sea behind
export function Terrace({ w = 1600, railY = 980, h = 1920 }) {
  const planks = [];
  for (let i = 0; i < 16; i++) { const yy = railY + 140 + i * i * 4 + i * 28; planks.push(<rect x={0} y={yy} width={w} height={6} fill="#7A3E22" />); }
  for (let i = -8; i < 24; i++) { const bx = 700 + i * 90; planks.push(P(`M${700 + i * 26} ${railY + 130} L${bx} ${h}`, w, h, { stroke: { width: 4, color: "#8B4A28" } })); }
  const posts = [];
  for (let i = 0; i < 22; i++) posts.push(<rect x={i * 76} y={railY - 150} width={22} height={160} radius={6} fill="#FFF4E6" strokeColor="#6E5A50" strokeWidth={4} />);
  return [
    <rect x={0} y={railY + 120} width={w} height={h - railY} fill={lg([[0, "#C9783F"], [1, "#9A5328"]])} />,
    ...planks,
    <rect x={0} y={railY - 10} width={w} height={135} fill="#E8C9A8" opacity={0.0} />,
    ...posts,
    <rect x={0} y={railY - 175} width={w} height={34} radius={10} fill="#FFFFFF" strokeColor="#6E5A50" strokeWidth={5} />,
    <rect x={0} y={railY + 5} width={w} height={22} fill="#EADBC8" strokeColor="#6E5A50" strokeWidth={4} />,
    <rect x={0} y={railY + 27} width={w} height={100} fill="#00000022" />,
  ];
}
export function StringLights({ w = 1600, y = 120, n = 9, dur = 5 }) {
  const out = [];
  for (let k = 0; k < 2; k++) {
    const y0 = y + k * 70, seg = w / n;
    let d = `M0 ${y0}`;
    for (let i = 0; i < n; i++) d += ` Q${i * seg + seg / 2} ${y0 + 60} ${(i + 1) * seg} ${y0}`;
    out.push(P(d, w, 400 + y, { stroke: { width: 4, color: "#3A2A2A" } }));
    for (let i = 0; i < n * 2; i++) { const t = (i + 0.5) / 2, bx = t * seg, by = y0 + 60 * 4 * ((t % 1) * (1 - (t % 1))) * 0.5 + 14; out.push(P(circ(bx, by, 11, 14), w, 400 + y, { fill: i % 3 === 0 ? "#FFD54A" : i % 3 === 1 ? "#FF8A5A" : "#9BE3FF", stroke: { width: 3, color: "#3A2A2A" } })); }
  }
  return out;
}
export function Umbrella({ x, y, s = 1, c1 = "#E0383E", c2 = "#FFF4E6" }) {
  const segs = [];
  for (let i = 0; i < 6; i++) { const a = 30 + i * 90, b = a + 90; segs.push(P(`M300 40 L${a} 200 Q${(a + b) / 2} 225 ${b} 200 Z`, 600, 700, { fill: i % 2 ? c2 : c1, stroke: { width: 6, color: INK } })); }
  return (
    <frame x={x} y={y} width={600} height={700} layout="none" origin="top-left" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }]}>
      <rect x={292} y={40} width={16} height={640} fill="#6E5A50" />
      {segs.slice(0, 5)}
      {P(circ(300, 36, 14, 14), 600, 700, { fill: "#FFD54A", stroke: { width: 5, color: INK } })}
    </frame>
  );
}
export function Table({ x, y, s = 1, children }) {
  return (
    <frame x={x} y={y} width={500} height={420} layout="none" origin="top-left" animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }]}>
      <rect x={235} y={120} width={30} height={290} fill="#5A4038" />
      <rect x={150} y={395} width={200} height={20} radius={8} fill="#5A4038" />
      {P("M20 90 L480 90 L470 200 C350 230 150 230 30 200 Z", 500, 420, { fill: "#FFFFFF", stroke: { width: 7, color: INK } })}
      {P("M30 200 C150 230 350 230 470 200 L468 180 C350 205 150 205 32 180 Z", 500, 420, { fill: "#D8D6EE" })}
      <rect x={20} y={70} width={460} height={34} radius={14} fill="#F4F2FA" strokeColor={INK} strokeWidth={7} />
      {children}
    </frame>
  );
}
// bookie booth interior: bordeaux wall, odds chalkboard, green-felt counter
export function Booth({ w = 1400, h = 1920, odds, winner }) {
  const rows = (odds || []).map(([n, name, o], i) => (
    <frame x={110} y={360 + i * 112} width={900} height={100} layout="none">
      <rect x={0} y={0} width={80} height={86} radius={8} fill="#F6EAD0" strokeColor="#2B2A28" strokeWidth={4} />
      <text x={0} y={8} width={80} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={58} color="#2B2A28">{String(n)}</text>
      <rect x={96} y={0} width={480} height={86} radius={8} fill="#F6EAD0" strokeColor="#2B2A28" strokeWidth={4} />
      <text x={110} y={12} width={460} fontFamily="Montserrat" fontWeight={800} fontSize={52} color="#2B2A28">{name}</text>
      <text x={600} y={6} width={280} fontFamily="Montserrat" fontWeight={800} fontSize={64} color="#F2F2EA">{o}</text>
    </frame>
  ));
  const wall = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 14; j++) wall.push(P(circ(60 + i * 120 + (j % 2) * 60, 60 + j * 130, 14, 20), w, h, { fill: "#8E2A3C" }));
  return [
    <rect x={0} y={0} width={w} height={h} fill={lg([[0, "#7A1E2E"], [1, "#5A1422"]])} />,
    ...wall,
    <rect x={60} y={200} width={1000} height={(odds || []).length * 112 + 200} radius={16} fill="#24302E" strokeColor="#A6762E" strokeWidth={22} />,
    <rect x={250} y={130} width={620} height={110} radius={12} fill="#F2C14E" strokeColor={INK} strokeWidth={8} />,
    <text x={250} y={146} width={620} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={70} color="#2B2A28">{winner ? "ПОБЕДИТЕЛЬ" : "СТАВКИ"}</text>,
    ...rows,
  ];
}
export function Counter({ w = 1400, y = 1300, h = 1920 }) {
  return [
    <rect x={0} y={y} width={w} height={60} fill="#1F5A44" strokeColor={INK} strokeWidth={8} />,
    <rect x={0} y={y + 60} width={w} height={h - y - 60} fill={lg([[0, "#6A2A1E"], [1, "#3E160E"]])} />,
    ...[0, 1, 2, 3, 4].map((i) => <rect x={60 + i * 280} y={y + 120} width={220} height={400} radius={10} fill="#00000000" strokeColor="#2A0E08" strokeWidth={8} />),
  ];
}
