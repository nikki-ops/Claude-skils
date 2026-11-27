import { circ, INK } from "./char.jsx";
import { lg } from "./bg.jsx";
const P = (d, w, h, o = {}) => <path d={d} x={0} y={0} width={w} height={h} {...o} />;
const S = (s, dur = 0.02) => [{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }];
// yacht in a 400x420 box; old=true -> patched brown tub with smoke
export function Yacht({ x, y, s = 1, n = 1, sail = "#FFFFFF", hull = "#FFFFFF", stripe = "#E0383E", old = false, tilt = 0, anim = [], dur = 10 }) {
  const hc = old ? "#8A5A3A" : hull;
  return (
    <frame x={x} y={y} width={400} height={420} layout="none" origin="center" animate={[...S(s, dur), ...(tilt ? [{ property: "rotation", from: tilt, to: tilt, at: 0, duration: dur }] : []), ...(Math.floor((dur - 0.02) / 1.2) >= 2 ? [{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.6, value: -8 }, { at: 1.2, value: 0 }], repeat: Math.floor((dur - 0.02) / 1.2) }] : []), ...anim]}>
      <rect x={196} y={40} width={10} height={300} fill="#5A4038" />
      {P("M206 50 L206 300 L350 300 C330 220 280 120 206 50 Z", 400, 420, { fill: old ? "#D9C7A0" : sail, stroke: { width: 6, color: INK } })}
      {P("M192 90 L192 300 L90 300 C110 230 140 160 192 90 Z", 400, 420, { fill: old ? "#C9B48A" : sail, stroke: { width: 6, color: INK } })}
      {old ? P("M230 170 L290 170 L290 230 L230 230 Z", 400, 420, { fill: "#A88B5E", stroke: { width: 4, color: INK } }) : null}
      {P(circ(268, 220, 34, 34), 400, 420, { fill: "#FFFFFF", stroke: { width: 5, color: INK } })}
      <text x={234} y={190} width={68} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={50} color={old ? "#8A2A1A" : "#1E3A6E"}>{String(n)}</text>
      {P("M40 310 L370 310 C350 370 300 390 200 390 C110 390 60 370 40 310 Z", 400, 420, { fill: hc, stroke: { width: 7, color: INK } })}
      {old ? null : P("M48 330 L362 330 L356 345 L54 345 Z", 400, 420, { fill: stripe })}
      {old ? [P("M80 340 L120 335 M150 350 L200 345 M250 345 L300 352", 400, 420, { stroke: { width: 5, color: "#5A3A22" } }), P(circ(60, 250, 22, 18), 400, 420, { fill: "#9A9AAA", opacity: 0.7 }), P(circ(40, 210, 28, 22), 400, 420, { fill: "#B0B0C0", opacity: 0.6 })] : null}
      {P("M20 395 C100 380 300 380 390 395 C300 410 100 410 20 395 Z", 400, 420, { fill: "#FFFFFF", opacity: 0.8 })}
    </frame>
  );
}
export function Radio({ x, y, s = 1, shake = false, dur = 10, at = 0 }) {
  const nrep = Math.floor((dur - at - 0.05) / 0.15); const sh = shake && nrep >= 2 ? [{ property: "rotation", keyframes: [{ at: at, value: 0 }, { at: at + 0.05, value: -3 }, { at: at + 0.1, value: 3 }, { at: at + 0.15, value: 0 }], repeat: nrep }] : [];
  return (
    <frame x={x} y={y} width={500} height={520} layout="none" origin="center" animate={[...S(s, dur), ...sh]}>
      <rect x={330} y={0} width={12} height={200} fill="#3A3A44" />
      {P(circ(336, 0, 14, 14), 500, 520, { fill: "#E0383E", stroke: { width: 4, color: INK } })}
      <rect x={40} y={180} width={420} height={320} radius={30} fill="#6B7A4A" strokeColor={INK} strokeWidth={9} />
      <rect x={70} y={210} width={220} height={180} radius={16} fill="#3E4A2C" strokeColor={INK} strokeWidth={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect x={85} y={226 + i * 27} width={190} height={10} radius={5} fill="#2A321E" />)}
      {P(circ(370, 260, 44, 44), 500, 520, { fill: "#D9CFA8", stroke: { width: 6, color: INK } })}
      {P("M370 260 L395 228", 500, 520, { stroke: { width: 6, color: "#B0302A", cap: "round" } })}
      {P(circ(330, 400, 24, 24), 500, 520, { fill: "#2A2A2A", stroke: { width: 5, color: INK } })}
      {P(circ(410, 400, 24, 24), 500, 520, { fill: "#2A2A2A", stroke: { width: 5, color: INK } })}
      <rect x={70} y={420} width={220} height={52} radius={8} fill="#F2C14E" strokeColor={INK} strokeWidth={5} />
      <text x={70} y={428} width={220} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={34} color="#2B2A28">РАЦИЯ</text>
    </frame>
  );
}
// sound waves next to the radio, visible from `at`
export function Waves({ x, y, at = 0, dur }) {
  return [0, 1, 2].map((i) => (
    <frame x={x} y={y} width={300} height={400} layout="none" origin="center" animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: at + i * 0.08, value: 1 }, { at: Math.min(dur - 0.01, at + 0.5 + i * 0.08), value: 0.2 }]  }]}>
      {P(`M${60 + i * 60} ${120 - i * 30} Q${130 + i * 70} 200 ${60 + i * 60} ${280 + i * 30}`, 300, 400, { stroke: { width: 12, color: "#FFFFFF", cap: "round" } })}
    </frame>
  ));
}
export function Searchlight({ x, y, s = 1, on = null, dur = 10 }) {
  const beam = on == null ? [] : [{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: on, value: 1 }, { at: Math.min(dur - 0.02, on + 0.9), value: 1 }, { at: Math.min(dur - 0.01, on + 1.2), value: 0 }] }];
  return (
    <frame x={x} y={y} width={700} height={700} layout="none" origin="center" animate={S(s, dur)}>
      {P("M300 420 L200 690 M360 420 L360 690 M420 420 L520 690", 700, 700, { stroke: { width: 14, color: "#3A3A30", cap: "round" } })}
      <rect x={250} y={180} width={260} height={250} radius={40} fill="#5E6B3A" strokeColor={INK} strokeWidth={10} />
      <rect x={270} y={200} width={60} height={210} radius={20} fill="#738244" />
      {P(circ(510, 305, 40, 120), 700, 700, { fill: "#C9D4A0", stroke: { width: 10, color: INK } })}
      {P(circ(512, 305, 26, 100), 700, 700, { fill: "#FFF6C8" })}
      <rect x={290} y={130} width={180} height={60} radius={12} fill="#4A5530" strokeColor={INK} strokeWidth={8} />
      {on == null ? null : <frame x={0} y={0} width={700} height={700} layout="none" animate={beam}>
        {P(circ(530, 305, 120, 190), 700, 700, { fill: "#FFF6C8", blendMode: "screen", effects: [{ kind: "blur", params: { px: 30 } }] })}
      </frame>}
    </frame>
  );
}
// big lens-flare star (screen blend), visible from `at`
const mono = (kf) => kf.filter((k, i) => i === 0 || k.at > kf[i - 1].at + 0.001).reduce((a, k) => (a.length && k.at <= a[a.length - 1].at ? a : [...a, k]), []);
export function Flash({ x, y, s = 1, at = 0, len = 1.0, dur }) {
  const a = [{ property: "opacity", keyframes: mono([{ at: 0, value: 0, easing: "hold" }, { at: at, value: 0 }, { at: at + 0.08, value: 1 }, { at: Math.min(dur - 0.02, at + len), value: 1 }, { at: Math.min(dur - 0.01, at + len + 0.3), value: 0 }]) }, { property: "scale", keyframes: mono([{ at: 0, value: s * 0.3 }, { at: at, value: s * 0.3 }, { at: at + 0.15, value: s * 1.1 }, { at: Math.min(dur - 0.01, at + len + 0.3), value: s }]) }];
  const rays = [];
  for (let i = 0; i < 12; i++) { const ang = (i / 12) * Math.PI * 2, r = i % 2 ? 300 : 480; rays.push(P(`M400 400 L${400 + Math.cos(ang - 0.05) * r} ${400 + Math.sin(ang - 0.05) * r} L${400 + Math.cos(ang + 0.05) * r} ${400 + Math.sin(ang + 0.05) * r} Z`, 800, 800, { fill: "#FFF3B0" })); }
  return (
    <frame x={x - 400} y={y - 400} width={800} height={800} layout="none" origin="center" blendMode="screen" animate={a}>
      {P(circ(400, 400, 260, 260), 800, 800, { fill: { kind: "radial", stops: [{ offset: 0, color: "#FFFFFF" }, { offset: 0.25, color: "#FFF3B0" }, { offset: 0.65, color: "#FFB34A00" }] } })}
      {rays}
      {P(circ(400, 400, 70, 70), 800, 800, { fill: "#FFFFFF" })}
    </frame>
  );
}
export function Bill({ x, y, s = 1, rot = 0 }) {
  return (
    <frame x={x} y={y} width={220} height={110} layout="none" origin="center" animate={[...S(s), { property: "rotation", from: rot, to: rot, at: 0, duration: 0.02 }]}>
      <rect x={0} y={0} width={220} height={110} radius={8} fill="#9FD88A" strokeColor="#2E6A3A" strokeWidth={6} />
      <rect x={18} y={16} width={184} height={78} radius={6} fill="#00000000" strokeColor="#3E8A4A" strokeWidth={4} />
      {P(circ(110, 55, 26, 26), 220, 110, { fill: "#7FC46A", stroke: { width: 4, color: "#2E6A3A" } })}
    </frame>
  );
}
export function CashStack({ x, y, s = 1, rows = 4, cols = 3, anim = [], dur = 10 }) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push(
    <frame x={c * 150 + (r % 2) * 20} y={300 - r * 70} width={170} height={90} layout="none">
      <rect x={0} y={0} width={170} height={80} radius={8} fill="#8CCB76" strokeColor="#2E6A3A" strokeWidth={6} />
      <rect x={70} y={0} width={30} height={80} fill="#E8D7A8" strokeColor="#8A6A3A" strokeWidth={3} />
    </frame>);
  return <frame x={x} y={y} width={520} height={420} layout="none" origin="center" animate={[...S(s, dur), ...anim]}>{out}</frame>;
}
export function Lemonade({ x, y, s = 1 }) {
  return (
    <frame x={x} y={y} width={200} height={320} layout="none" origin="center" animate={S(s)}>
      {P("M150 0 L120 120", 200, 320, { stroke: { width: 10, color: "#E0383E", cap: "round" } })}
      {P("M30 80 L170 80 L150 300 L50 300 Z", 200, 320, { fill: "#FFF2A8", stroke: { width: 7, color: INK } })}
      {P("M36 110 L164 110 L150 300 L50 300 Z", 200, 320, { fill: "#FFE04A" })}
      {P(circ(150, 85, 34, 34), 200, 320, { fill: "#C9F06A", stroke: { width: 6, color: INK } })}
      <rect x={60} y={150} width={36} height={36} radius={8} fill="#FFFFFFAA" />
    </frame>
  );
}
export function Piggy({ x, y, s = 1, smashAt = 99, dur = 10 }) {
  const hide = [{ property: "opacity", keyframes: [{ at: 0, value: 1, easing: "hold" }, { at: Math.min(dur - 0.02, smashAt + 0.06), value: 0 }, { at: Math.min(dur - 0.01, smashAt + 0.07), value: 0 }] }];
  const crack = [{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: Math.min(dur - 0.03, smashAt), value: 1, easing: "hold" }, { at: Math.min(dur - 0.02, smashAt + 0.06), value: 0 }] }];
  return (
    <frame x={x} y={y} width={420} height={360} layout="none" origin="center" animate={[...S(s, dur), ...hide]}>
      {P("M60 300 L80 340 M300 300 L280 340 M120 310 L130 345 M250 310 L240 345", 420, 360, { stroke: { width: 26, color: "#E87A96", cap: "round" } })}
      {P(circ(200, 200, 170, 130), 420, 360, { fill: "#F59AB2", stroke: { width: 9, color: INK } })}
      {P(circ(360, 190, 40, 46), 420, 360, { fill: "#F7B3C6", stroke: { width: 7, color: INK } })}
      {P(circ(350, 180, 7, 9) + circ(372, 180, 7, 9), 420, 360, { fill: INK })}
      {P(circ(310, 130, 10, 14), 420, 360, { fill: INK })}
      {P("M120 80 L150 40 L170 85 Z M230 75 L260 35 L275 82 Z", 420, 360, { fill: "#F59AB2", stroke: { width: 7, color: INK } })}
      <rect x={160} y={78} width={70} height={14} radius={6} fill={INK} />
      <frame x={0} y={0} width={420} height={360} layout="none" animate={crack}>
        {P("M200 70 L180 140 L215 190 L170 260 M180 140 L120 160 M215 190 L290 210 L330 260", 420, 360, { stroke: { width: 6, color: INK, cap: "round" } })}
      </frame>
    </frame>
  );
}
// burst of shards/coins from (cx,cy) at time `at`
export function Burst({ cx, cy, at, dur, n = 34, seed = 1, colors = ["#F59AB2", "#F7B3C6", "#FFD54A", "#E8A93A", "#D9D9E6"] }) {
  const out = [];
  let r = seed * 9301;
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  for (let i = 0; i < n; i++) {
    const ang = rnd() * Math.PI * 2, sp = 300 + rnd() * 700, life = 0.7 + rnd() * 0.5;
    const vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp - 500, t1 = Math.min(dur - 0.02, at + life);
    const T = t1 - at, sz = 18 + rnd() * 34, col = colors[i % colors.length], coin = i % 3 === 2;
    const k = (t) => ({ x: vx * t, y: vy * t + 1400 * t * t });
    const kf = (prop) => [{ at: 0, value: 0, easing: "hold" }, { at: at, value: 0 }, { at: at + T * 0.5, value: prop === "x" ? k(T * 0.5).x : k(T * 0.5).y }, { at: t1, value: prop === "x" ? k(T).x : k(T).y }];
    out.push(
      <frame x={cx - sz / 2} y={cy - sz / 2} width={sz} height={sz} layout="none" origin="center"
        animate={[{ property: "offsetX", keyframes: kf("x"), easing: "linear" }, { property: "offsetY", keyframes: kf("y"), easing: "linear" },
          { property: "rotation", keyframes: [{ at: 0, value: 0 }, { at: t1, value: (rnd() - 0.5) * 900 }] },
          { property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: at, value: 1, easing: "hold" }, { at: t1, value: 0 }] }]}>
        {coin ? P(circ(sz / 2, sz / 2, sz / 2.2, sz / 2.2), sz, sz, { fill: "#FFD54A", stroke: { width: 3, color: "#8A6418" } }) : P(`M0 ${sz * 0.3} L${sz} 0 L${sz * 0.7} ${sz} Z`, sz, sz, { fill: col, stroke: { width: 3, color: INK } })}
      </frame>);
  }
  return out;
}
// bills raining from the top between t0 and dur
export function MoneyRain({ t0, dur, n = 26, seed = 3, w = 1080 }) {
  let r = seed * 7919;
  const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = rnd() * w, st = t0 + rnd() * Math.max(0.1, dur - t0 - 0.8), T = Math.min(dur - 0.02, st + 1.4) - st, rot0 = rnd() * 360;
    out.push(
      <frame x={x - 110} y={-200} width={220} height={110} layout="none" origin="center"
        animate={[{ property: "offsetY", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: st, value: 0 }, { at: st + T, value: 2300 }], easing: "linear" },
          { property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: st + T * 0.5, value: 80 * (rnd() - 0.5) * 2 }, { at: st + T, value: 0 }] },
          { property: "rotation", keyframes: [{ at: 0, value: rot0 }, { at: st + T, value: rot0 + 540 }] }]}>
        <rect x={0} y={0} width={220} height={110} radius={8} fill="#9FD88A" strokeColor="#2E6A3A" strokeWidth={6} />
        {P(circ(110, 55, 26, 26), 220, 110, { fill: "#7FC46A", stroke: { width: 4, color: "#2E6A3A" } })}
      </frame>);
  }
  return out;
}
export function Hammer({ hx, hy, s = 1, swingAt, dur }) {
  // pivot = hand (frame centre)
  return (
    <frame x={hx - 300} y={hy - 300} width={600} height={600} layout="none" origin="center"
      animate={[{ property: "scale", from: s, to: s, at: 0, duration: 0.02 }, { property: "rotation", keyframes: [{ at: 0, value: -15 }, { at: Math.max(0.02, swingAt - 0.35), value: -35 }, { at: swingAt, value: 105, easing: "ease-out" }, { at: Math.min(dur - 0.01, swingAt + 0.3), value: 95 }] }]}>
      <rect x={288} y={70} width={24} height={240} radius={8} fill="#B5683A" strokeColor="#1E1418" strokeWidth={6} />
      <rect x={236} y={20} width={128} height={74} radius={10} fill="#C0583A" strokeColor="#1E1418" strokeWidth={7} />
      <rect x={244} y={28} width={112} height={14} radius={6} fill="#E0886A" />
    </frame>
  );
}
