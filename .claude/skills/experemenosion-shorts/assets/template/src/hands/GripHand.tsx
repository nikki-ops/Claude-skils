import React, { useMemo } from "react";
import { mulberry } from "../components/rand";
import { P, buildFinger, smoothClosed, smoothOpen, FingerSpec } from "./geom";
import { Pal, FingerView, Vein, AgeSpots, Crepe, KnitDefs, Wr, SkinDefs } from "./skin";

// Кисть, обхватившая стакан сбоку. Координаты локальные (центр стакана = 0,0).
// side = 1: кисть слева от стакана, пальцы идут вправо по передней стенке; side = -1 — зеркально.
// layer="back" — defs + большой палец (за краем стакана); layer="front" — тыл кисти, пальцы, рукав.
export type GripProps = {
  uid: string; side: 1 | -1; pal: Pal; layer: "back" | "front"; frame?: number;
  arm?: "down" | "side"; fingerScale?: number; dy?: number;
  sleeve?: [string, string, string]; // светлый, тёмный, нитка
};

const FING: FingerSpec[] = [
  { mcp: [-122, -60], ang: 84, segs: [36, 42, 34], w: 54, bend: [0, 6, 9] },
  { mcp: [-126, -6], ang: 90, segs: [40, 46, 36], w: 56, bend: [0, 6, 9] },
  { mcp: [-123, 46], ang: 96, segs: [36, 42, 34], w: 52, bend: [0, 6, 9] },
  { mcp: [-115, 94], ang: 104, segs: [28, 32, 28], w: 44, bend: [0, 7, 9] },
];
const DORSUM: P[] = [[-112, -92], [-150, -86], [-196, -48], [-232, 12], [-246, 80], [-228, 150], [-192, 198], [-146, 178], [-112, 142], [-102, 100], [-106, 48], [-110, 0], [-112, -48]];
const ARM_DOWN: P[] = [[-236, 30], [-290, 150], [-318, 360], [-170, 360], [-170, 220], [-196, 180]];
const SLV_DOWN: P[] = [[-334, 104], [-282, 136], [-224, 180], [-176, 226], [-156, 300], [-160, 720], [-540, 720], [-480, 330], [-410, 160]];
const CUFF_DOWN: P[] = [[-334, 104], [-282, 136], [-224, 180], [-176, 226]];
const ARM_SIDE: P[] = [[-236, 30], [-500, 10], [-760, 20], [-760, 250], [-500, 250], [-190, 198], [-226, 150]];
const SLV_SIDE: P[] = [[-300, -6], [-288, 70], [-284, 150], [-292, 230], [-300, 282], [-560, 300], [-1000, 320], [-1000, -40], [-560, -30]];
const CUFF_SIDE: P[] = [[-300, -6], [-288, 70], [-284, 150], [-292, 230], [-300, 282]];

export const GripHand: React.FC<GripProps> = ({ uid, side: s, pal, layer, frame = 0, arm = "down", fingerScale = 1, dy = 0, sleeve = ["#4c5661", "#2a3037", "#8995a0"] }) => {
  const m = (p: P): P => [s * p[0], p[1] + dy];
  const ms = (pts: P[]) => pts.map(m);
  const young = pal.age < 0.5;
  const G = useMemo(() => {
    const fingers = FING.map((f) => buildFinger({
      ...f, mcp: m(f.mcp), ang: s * f.ang, bend: f.bend!.map((b) => s * b), w: f.w * fingerScale,
      segs: f.segs.map((x) => x * (young ? 1.06 : 1)), root: 40, fadeA: -0.35, fadeB: 0.2, knob: young ? 0 : 0.06,
      nailL: young ? 0.66 : 0.56,
    }));
    const thumb = buildFinger({
      mcp: m([-196, -30]), ang: s * 22, segs: [70, 52, 44], w: 54 * fingerScale, bend: [0, -6 * s, -6 * s], root: 75,
      jf: [1.15, 1.02, 0.95], mf: [1.05, 0.92], pad: [0.88, 0.78], nailW: 0.5, nailShift: -0.28 * s, fadeA: -0.95, fadeB: -0.3, knob: young ? 0 : 0.04,
    });
    return { fingers, thumb };
  }, [s, dy, fingerScale, young]);
  const id = (k: string) => `${uid}-${k}`;
  const u = (k: string) => `url(#${uid}-${k})`;
  const dors = smoothClosed(ms(DORSUM));
  const armD = smoothClosed(ms(arm === "down" ? ARM_DOWN : ARM_SIDE));
  const slvD = smoothClosed(ms(arm === "down" ? SLV_DOWN : SLV_SIDE));
  const cuffD = smoothOpen(ms(arm === "down" ? CUFF_DOWN : CUFF_SIDE));
  const lit = s > 0 ? 1 : 0.7;
  const c = m([-180, 20]);

  if (layer === "back") {
    return (
      <g>
        <defs>
          <SkinDefs p={`${uid}-`} seed={s > 0 ? 3 : 8} />
          <radialGradient id={id("vol")} gradientUnits="userSpaceOnUse" cx={c[0] - 30} cy={c[1] - 60} r={330}>
            <stop offset="0" stopColor={s > 0 ? pal.light : pal.base} />
            <stop offset="0.4" stopColor={pal.base} />
            <stop offset="0.75" stopColor={pal.mid} />
            <stop offset="1" stopColor={pal.shadow} />
          </radialGradient>
          <KnitDefs p={`${uid}-`} c1={sleeve[0]} c2={sleeve[1]} c3={sleeve[2]} rib={16} rot={arm === "down" ? s * 35 : 0} />
          <clipPath id={id("dc")}><path d={dors} /><path d={armD} /></clipPath>
          <clipPath id={id("sc")}><path d={slvD} /></clipPath>
        </defs>
        <FingerView g={G.thumb} o={{ id: `${uid}-th`, pal, fill: u("vol"), seed: 5, hairs: young ? 0 : 3, joints: [2], stroke: 5 }} />
      </g>
    );
  }

  const r = mulberry(s > 0 ? 3 : 4);
  const mcps = G.fingers.map((g) => g.J[0]);
  const wrist = m([-210, 130]);
  return (
    <g>
      {/* тыл кисти и запястье */}
      <path d={dors} fill="none" stroke={pal.line} strokeWidth={5} />
      <path d={armD} fill="none" stroke={pal.line} strokeWidth={5} />
      <path d={dors} fill={u("vol")} />
      <path d={armD} fill={u("vol")} />
      <g clipPath={u("dc")}>
        <ellipse cx={m([-180, -10])[0]} cy={m([-180, -10])[1]} rx={55} ry={70} fill={pal.hi} opacity={0.55 * lit} filter={`url(#${uid}-b18)`} />
        <path d={smoothOpen(ms([[-110, -80], [-104, 20], [-108, 140]]))} stroke={pal.shadow} strokeWidth={30} fill="none" opacity={0.4} filter={`url(#${uid}-b12)`} />
        <path d={smoothOpen(ms([[-240, 40], [-236, 120], [-196, 196]]))} stroke={s > 0 ? pal.mid : pal.cool} strokeWidth={36} fill="none" opacity={s > 0 ? 0.35 : 0.55} filter={`url(#${uid}-b12)`} />
        <path d={smoothOpen(ms([[-150, 180], [-120, 130]]))} stroke={pal.cool} strokeWidth={30} fill="none" opacity={0.4} filter={`url(#${uid}-b12)`} />
        {/* сухожилия к костяшкам */}
        {mcps.map((q, i) => (
          <g key={i}>
            <path d={smoothOpen([[wrist[0] + s * i * 8, wrist[1] - i * 6], [(wrist[0] + q[0]) / 2, (wrist[1] + q[1]) / 2 - 4], [q[0] - s * 6, q[1]]])} transform="translate(3 7)" stroke={pal.shadow} strokeWidth={9} fill="none" opacity={0.3 * (1 - 0.6 * pal.age * 0)} filter={`url(#${uid}-b5)`} />
            <path d={smoothOpen([[wrist[0] + s * i * 8, wrist[1] - i * 6], [(wrist[0] + q[0]) / 2, (wrist[1] + q[1]) / 2 - 4], [q[0] - s * 6, q[1]]])} stroke={pal.hi} strokeWidth={8} fill="none" opacity={young ? 0.3 : 0.5} filter={`url(#${uid}-b3)`} />
            <ellipse cx={q[0] - s * 4} cy={q[1]} rx={18} ry={22} fill={pal.hi} opacity={0.5} filter={`url(#${uid}-b5)`} />
            <ellipse cx={q[0] - s * 2} cy={q[1] + 6} rx={22} ry={22} fill={pal.red} opacity={0.2} filter={`url(#${uid}-b8)`} />
          </g>
        ))}
        {!young && <Vein pts={ms([[-118, 22], [-150, 50], [-176, 100], [-200, 160], [-215, 220]])} w={10} pal={pal} p={`${uid}-`} />}
        {!young && <Vein pts={ms([[-120, 72], [-148, 112], [-160, 160]])} w={8} pal={pal} p={`${uid}-`} />}
        {young && <Vein pts={ms([[-120, 22], [-160, 70], [-200, 160]])} w={8} pal={pal} p={`${uid}-`} o={0.35} />}
        {/* дряблые складки над костяшками */}
        {!young && mcps.map((q, i) => [0, 1].map((k) => <Wr key={`${i}${k}`} d={`M${q[0] - s * (16 + k * 9)} ${q[1] - 14} Q${q[0] - s * (22 + k * 9)} ${q[1]} ${q[0] - s * (16 + k * 9)} ${q[1] + 14}`} w={2} o={0.4 - k * 0.1} c={pal.line} />))}
        {!young && <Crepe n={90} seed={s > 0 ? 8 : 9} box={[Math.min(s * -240, s * -110), -80, 130, 270]} c={pal.line} o={0.14} ang={1.2} />}
        <rect x={-1500} y={-1500} width={3000} height={3000} filter={`url(#${uid}-blot)`} opacity={0.3} />
        <rect x={-1500} y={-1500} width={3000} height={3000} filter={`url(#${uid}-tex)`} opacity={young ? 0.12 : 0.22} style={{ mixBlendMode: "multiply" }} />
        {!young && <AgeSpots n={10} seed={s > 0 ? 31 : 32} box={[Math.min(s * -235, s * -115), -70, 120, 230]} pal={pal} p={`${uid}-`} scale={0.7} />}
        <path d={cuffD} stroke={pal.deep} strokeWidth={30} fill="none" opacity={0.55} filter={`url(#${uid}-b8)`} />
      </g>
      {/* пальцы: мизинец сзади, указательный спереди; тонкая линия разделяет соседние */}
      {[3, 2, 1, 0].map((i) => (
        <g key={i}>
          <path d={G.fingers[i].path} transform="translate(3 6)" fill="#1a0f0a" opacity={0.25} filter={`url(#${uid}-b5)`} />
          <FingerView g={G.fingers[i]} o={{ id: `${uid}-f${i}`, pal, fill: u("vol"), seed: 20 + i * 5 + (s > 0 ? 0 : 50), hairs: young || i === 3 ? 0 : 2, joints: [2, 3], stroke: 5, edge: true, wrinkle: young ? 0.5 : 1 }} />
        </g>
      ))}
      {/* волоски на запястье у старика */}
      {!young && Array.from({ length: 30 }, (_, i) => {
        const p = m([-240 + r() * 60, 40 + r() * 120]);
        return <line key={i} x1={p[0]} y1={p[1]} x2={p[0] - s * (6 + r() * 6)} y2={p[1] + 8 + r() * 6} stroke="#a8998c" strokeWidth={1} opacity={0.5} />;
      })}
      {/* рукав */}
      <path d={slvD} fill="none" stroke="#14181c" strokeWidth={5} />
      <path d={slvD} fill={u("st")} />
      <g clipPath={u("sc")}>
        <path d={cuffD} transform={`translate(${arm === "down" ? -s * 30 : -s * 40} ${arm === "down" ? 40 : 0})`} stroke={u("rib")} strokeWidth={90} fill="none" />
        <path d={cuffD} transform={`translate(${arm === "down" ? -s * 58 : -s * 84} ${arm === "down" ? 80 : 0})`} stroke="#000" strokeWidth={8} fill="none" opacity={0.35} filter={`url(#${uid}-b3)`} />
        <path d={cuffD} transform={`translate(${-s * 8} 8)`} stroke="#fff" strokeWidth={12} fill="none" opacity={0.18} filter={`url(#${uid}-b8)`} />
        <path d={slvD} transform={`translate(${s * 60} 0)`} fill="none" stroke="#000" strokeWidth={120} opacity={0.35} filter={`url(#${uid}-b28)`} />
        <rect x={-1500} y={-1500} width={3000} height={3000} filter={u("fuzz")} opacity={0.3} />
      </g>
      <path d={cuffD} stroke="#14181c" strokeWidth={3.5} fill="none" />
    </g>
  );
};
