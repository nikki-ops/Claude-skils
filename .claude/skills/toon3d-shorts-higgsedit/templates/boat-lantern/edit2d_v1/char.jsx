// Toon character in a 600x1000 local box. Head centre (300,240), R=190.
export const INK = "#1E1418", LIMB = "#241E2C";
const f = (n) => Math.round(n * 10) / 10;
export const circ = (cx, cy, rx, ry = rx) => {
  const k = 0.5523, ox = rx * k, oy = ry * k;
  return `M${f(cx)} ${f(cy - ry)} C${f(cx + ox)} ${f(cy - ry)} ${f(cx + rx)} ${f(cy - oy)} ${f(cx + rx)} ${f(cy)} C${f(cx + rx)} ${f(cy + oy)} ${f(cx + ox)} ${f(cy + ry)} ${f(cx)} ${f(cy + ry)} C${f(cx - ox)} ${f(cy + ry)} ${f(cx - rx)} ${f(cy + oy)} ${f(cx - rx)} ${f(cy)} C${f(cx - rx)} ${f(cy - oy)} ${f(cx - ox)} ${f(cy - ry)} ${f(cx)} ${f(cy - ry)} Z`;
};

// Head silhouette measured from the reference (radius per 15deg, 0=right, 90=down), scaled to R~190.
const HR = [157, 150, 146, 142, 139, 137, 140, 144, 149, 149, 147, 151, 158, 162, 163, 164, 161, 154, 150, 152, 155, 159, 163, 163].map((r) => r * 1.19);
// brush outline: thin top-left (~7px), thick right/bottom-right (~26px)
const HT = (deg) => 10 + 17 * Math.pow((1 + Math.cos(((deg - 30) * Math.PI) / 180)) / 2, 1.5);
const blob = (cx, cy, rf, sx = 1, sy = 1, dx = 0, dy = 0) => {
  const pts = [];
  for (let i = 0; i < 24; i++) { const a = (i * 15 * Math.PI) / 180, r = rf(i * 15, HR[i]); pts.push([cx + dx + Math.cos(a) * r * sx, cy + dy + Math.sin(a) * r * sy]); }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < 24; i++) {
    const p0 = pts[(i + 23) % 24], p1 = pts[i], p2 = pts[(i + 1) % 24], p3 = pts[(i + 2) % 24];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + " Z";
};
export const HEAD_INK = blob(300, 250, (deg, r) => r + HT(deg));
export const HEAD_FILL = blob(300, 250, (deg, r) => r);
export const HEAD_LIT = blob(300, 250, (deg, r) => r * 0.9, 1, 1, -16, -14);
const P = (d, o = {}) => <path d={d} x={0} y={0} width={600} height={1000} {...o} />;
// visible only inside [a,b) (local seconds); null = always
const win = (a, b, dur) => {
  if (a == null) return [];
  const k = [];
  if (a > 0) k.push({ at: 0, value: 0, easing: "hold" });
  k.push({ at: a, value: 1, easing: "hold" });
  if (b != null && b < dur) k.push({ at: b, value: 0, easing: "hold" });
  if (k.length < 2) k.push({ at: Math.min(dur, a + 0.01), value: 1, easing: "hold" });
  return [{ property: "opacity", keyframes: k }];
};
const blinkAnim = (blinks, dur) => {
  const kf = [{ at: 0, value: 0 }];
  for (const t of blinks) if (t > 0.05 && t + 0.12 < dur) kf.push({ at: t - 0.01, value: 0 }, { at: t + 0.03, value: 1 }, { at: t + 0.1, value: 0 });
  return kf.length > 1 ? [{ property: "morphProgress", keyframes: kf }] : [];
};
function Eyes({ kind, blinks, dur }) {
  const out = [];
  for (const x of [244, 352]) {
    const cy = 230, rx = 24;
    if (kind === "smug") {
      const d = `M${x - rx} ${cy - 4} L${x + rx} ${cy - 6} C${x + rx * 0.9} ${cy + 12} ${x + rx * 0.5} ${cy + 20} ${x} ${cy + 20} C${x - rx * 0.5} ${cy + 20} ${x - rx * 0.9} ${cy + 12} ${x - rx} ${cy - 4} Z`;
      const c = `M${x - rx} ${cy + 12} L${x + rx} ${cy + 12} C${x + rx} ${cy + 14} ${x + rx * 0.6} ${cy + 15} ${x} ${cy + 15} C${x - rx * 0.6} ${cy + 15} ${x - rx} ${cy + 14} ${x - rx} ${cy + 12} Z`;
      out.push(P(d, { fill: INK, morphTo: c, animate: blinkAnim(blinks, dur) }));
    } else if (kind === "open") {
      out.push(P(circ(x, cy, 17, 25), { fill: INK, morphTo: circ(x, cy + 6, 18, 2.5), animate: blinkAnim(blinks, dur) }));
    } else if (kind === "happy") {
      out.push(P(`M${x - 22} ${cy + 10} Q${x} ${cy - 22} ${x + 22} ${cy + 10}`, { stroke: { width: 11, color: INK, cap: "round" } }));
    } else if (kind === "shock") {
      out.push(P(circ(x, cy, 34, 36), { fill: "#FFFFFF", stroke: { width: 8, color: INK } }));
      out.push(P(circ(x, cy + 2, 9, 9), { fill: INK }));
    } else if (kind === "squint") {
      const s = x < 300 ? 1 : -1;
      out.push(P(`M${x - 18 * s} ${cy - 16} L${x + 16 * s} ${cy} L${x - 18 * s} ${cy + 16}`, { stroke: { width: 11, color: INK, cap: "round" } }));
    }
  }
  return out;
}
function Brows({ kind }) {
  const s = { stroke: { width: 15, color: INK, cap: "round" } };
  const b = { smug: [[-6, 2], [-22, -8]], flat: [[0, 0], [0, 0]], up: [[-30, -24], [-30, -24]], angry: [[8, -14], [8, -14]], sad: [[-14, 10], [-14, 10]] }[kind] || [[0, 0], [0, 0]];
  return [244, 352].map((x, i) => {
    const y = 168 + b[i][0], tilt = (i === 0 ? 1 : -1) * b[i][1] * 0.5;
    return P(`M${x - 30} ${y + tilt + 4} Q${x - 4} ${y - 10} ${x + 30} ${y - tilt}`, s);
  });
}
const MOUTH_CLOSED = "M266 292 L322 292 C322 297 308 301 294 301 C280 301 266 297 266 292 Z";
const MOUTH_OPEN = "M260 282 L328 282 C328 318 310 332 294 332 C278 332 260 318 260 282 Z";
function Mouth({ kind, talk, dur }) {
  if (kind === "smirk") return [P("M252 312 Q276 322 304 296", { stroke: { width: 10, color: INK, cap: "round" } })];
  if (kind === "flat") return [P("M256 310 L302 306", { stroke: { width: 10, color: INK, cap: "round" } })];
  if (kind === "grin") return [P("M246 278 L346 278 C346 330 318 350 296 350 C274 350 246 330 246 278 Z", { fill: INK }), P(circ(296, 332, 24, 12), { fill: "#E86A7A" })];
  if (kind === "o") return [P(circ(296, 304, 17, 22), { fill: INK })];
  if (kind === "teeth") return [P("M252 282 L340 282 L336 318 L256 318 Z", { fill: "#FFFFFF", stroke: { width: 8, color: INK } }), P("M254 300 L338 300", { stroke: { width: 5, color: INK } })];
  // talk: morph closed<->open on the given [a,b] spans
  const kf = [{ at: 0, value: 0 }];
  let last = 0;
  for (const [a, b] of talk || []) {
    let t = Math.max(a, last + 0.02), on = 1;
    while (t < Math.min(b, dur - 0.05)) { kf.push({ at: f(t * 100) / 100, value: on ? 0.9 : 0.15 }); on = !on; t += on ? 0.1 : 0.08; }
    if (t < dur - 0.03) kf.push({ at: f(t * 100) / 100, value: 0 });
    last = t;
  }
  return [P(MOUTH_CLOSED, { fill: INK, morphTo: MOUTH_OPEN, animate: kf.length > 1 ? [{ property: "morphProgress", keyframes: kf }] : [] })];
}
function Face({ e, dur }) {
  return [...Eyes({ kind: e.eyes || "smug", blinks: e.blinks || [], dur }), ...Brows({ kind: e.brows || "smug" }), ...Mouth({ kind: e.mouth || "smirk", talk: e.talk, dur }),
    ...(e.glasses ? [P(circ(244, 232, 40, 40), { stroke: { width: 7, color: INK } }), P(circ(352, 232, 40, 40), { stroke: { width: 7, color: INK } }), P("M284 232 L312 232", { stroke: { width: 7, color: INK } })] : []),
    ...(e.stache ? [P("M250 272 C268 256 288 264 296 272 C304 264 324 256 342 272 C324 280 268 280 250 272 Z", { fill: INK })] : []),
    ...(e.sweat ? [P("M440 170 C460 200 470 215 455 228 C440 238 425 222 432 205 Z", { fill: "#9AD4FF", stroke: { width: 6, color: INK } })] : []),
    ...(e.blush ? [P(circ(200, 286, 26, 14), { fill: "#F5A3B4" }), P(circ(398, 286, 26, 14), { fill: "#F5A3B4" })] : []),
    ...(e.glow ? [<rect x={180} y={200} width={240} height={64} radius={30} fill="#FFE27A" opacity={0.75} blendMode="screen" effects={[{ kind: "blur", params: { px: 10 } }]} />] : [])];
}
const HAT = {
  boater: () => [
    // brim: dark underside, lighter top plane, rim light on the right
    P("M112 108 C112 80 476 72 476 98 C476 126 112 134 112 108 Z", { fill: "#1E1A1E", stroke: { width: 8, color: INK } }),
    P("M128 104 C140 86 460 80 462 96 C430 90 160 96 128 112 Z", { fill: "#4A4448" }),
    P("M380 88 C430 86 462 90 466 100 C460 110 430 116 400 118 C440 108 452 100 380 88 Z", { fill: "#8A8496" }),
    // crown body (near-black) with a recessed glossy window
    P("M188 102 L180 26 C180 6 406 0 408 20 L412 96 C340 104 260 106 188 102 Z", { fill: "#2A2026", stroke: { width: 8, color: INK } }),
    P("M204 88 L198 34 C260 26 340 22 392 26 L396 84 C330 90 262 92 204 88 Z", { fill: "#6B4330" }),
    P("M201 64 C262 62 330 58 394 58 L396 84 C330 90 262 92 204 88 Z", { fill: "#E8DDB0" }),
    P("M201 64 C262 62 330 58 394 58 L394 62 C330 63 262 66 201 68 Z", { fill: "#B89A70" }),
    P(circ(232, 76, 26, 13), { fill: "#C9BE96", opacity: 0.8 }),
    P(circ(318, 44, 30, 8), { fill: "#8A5A44", opacity: 0.6 }),
    P("M206 36 L212 86 L218 86 L212 34 Z", { fill: "#FFFFFF", opacity: 0.12 }),
    P("M198 34 C260 26 340 22 392 26", { stroke: { width: 5, color: "#4A3C40" } }),
    // top rim highlight
    P("M196 14 C260 6 340 4 396 12", { stroke: { width: 5, color: "#5A5058", cap: "round" } }),
  ],
  bowler: () => [P("M150 96 C150 76 450 76 450 96 C450 112 150 112 150 96 Z", { fill: "#4A2F25", stroke: { width: 8, color: INK } }), P("M192 96 C192 -10 408 -10 408 96 Z", { fill: "#5A3B2E", stroke: { width: 8, color: INK } }), P("M200 84 L400 84", { stroke: { width: 12, color: "#3A2219" } })],
  straw: () => [P("M80 110 C80 70 520 70 520 110 C520 140 80 140 80 110 Z", { fill: "#F2C14E", stroke: { width: 8, color: INK } }), P("M190 104 C190 0 410 0 410 104 Z", { fill: "#F5CD62", stroke: { width: 8, color: INK } }), <rect x={194} y={74} width={212} height={24} fill="#2B5FA8" />],
  visor: () => [P("M120 150 C160 70 440 70 480 150 L470 165 C430 105 170 105 130 165 Z", { fill: "#3FBF6A", stroke: { width: 8, color: INK } }), P("M150 150 C200 200 400 200 450 150 C420 190 180 190 150 150 Z", { fill: "#2E9A52", stroke: { width: 6, color: INK } })],
  beret: () => [P("M120 120 C110 20 470 0 480 110 C420 140 180 140 120 120 Z", { fill: "#D94055", stroke: { width: 8, color: INK } })],
  cap: () => [P("M150 120 C150 20 450 20 450 120 Z", { fill: "#2F6FB8", stroke: { width: 8, color: INK } }), P("M420 112 L540 120 L430 132 Z", { fill: "#2A5A99", stroke: { width: 6, color: INK } })],
};
const ARM = {
  down: [[212, 440], [192, 540], [178, 630], [176, 700]],
  hip: [[212, 440], [120, 520], [120, 600], [190, 610]],
  up: [[212, 440], [120, 420], [110, 330], [138, 246]],
  wave: [[212, 440], [100, 440], [70, 360], [90, 280]],
  fwd: [[212, 440], [120, 520], [70, 560], [20, 560]],
  hold: [[212, 440], [170, 540], [220, 580], [270, 560]],
};
const mirrorArm = (a) => a.map(([x, y]) => [600 - x, y]);
const armD = (a) => `M${a[0][0]} ${a[0][1]} C${a[1][0]} ${a[1][1]} ${a[2][0]} ${a[2][1]} ${a[3][0]} ${a[3][1]}`;
function Arm({ side, from, to, at, dur }) {
  let A = ARM[from], B = ARM[to || from];
  if (side === "r") { A = mirrorArm(A); B = mirrorArm(B); }
  const anim = to && to !== from ? [{ property: "morphProgress", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: Math.max(0.01, at), value: 0, easing: [0.3, 1.4, 0.5, 1] }, { at: Math.min(dur - 0.01, at + 0.33), value: 1 }] }] : [];
  return P(armD(A), { stroke: { width: 22, color: LIMB, cap: "round" }, morphTo: armD(B), animate: anim });
}
export const OUTFIT = {
  hero: { body: "#5ED5C6", shade: "#30A298", hat: "boater", bow: true },
  buddy: { body: "#4CC24A", shade: "#2F9A33", hat: "straw", overalls: true },
  skeptic: { body: "#C99A2E", shade: "#8A6418", hat: "bowler", plaid: true, tie: "#6C3FA0" },
  bookie: { body: "#B79AE8", shade: "#8A6CC4", hat: "visor", tie: "#3FBF6A" },
  old: { body: "#8F9BB8", shade: "#66708E", hat: null, tie: "#3A4060" },
  red: { body: "#2FA3A0", shade: "#1E7A78", hat: "beret" },
  sailor: { body: "#F2F2F2", shade: "#C9CCD8", hat: "cap", tie: "#2F6FB8" },
};
// props: x,y (top-left of the 600x1000 box in scene px), s scale, o outfit key, dur, face (or faces [{at,...}]),
// arms {l:[from,to,at], r:[...]}, sit, laugh (bool: shake + hat pop), hold (extra nodes in local px, drawn in front)
export function Toon({ x, y, s = 1, o = "hero", dur, face = {}, faces, arms = {}, sit = false, laugh = false, hold = [], flip = false, anim = [] }) {
  const O = OUTFIT[o];
  const fs = faces || [{ at: 0, ...face }];
  const legs = sit
    ? [P("M250 690 C240 760 170 780 150 790 C140 860 150 930 160 985", { stroke: { width: 22, color: LIMB, cap: "round" } }), P("M350 690 C340 760 290 780 270 790 C262 860 268 930 276 985", { stroke: { width: 22, color: LIMB, cap: "round" } })]
    : [P("M255 690 C252 780 246 880 240 985", { stroke: { width: 22, color: LIMB, cap: "round" } }), P("M345 690 C348 780 354 880 360 985", { stroke: { width: 22, color: LIMB, cap: "round" } })];
  const body = [
    P("M180 450 C180 395 420 395 420 450 L440 655 C447 710 153 710 160 655 Z", { fill: O.body, stroke: { width: 9, color: INK } }),
    P("M350 418 C392 420 404 432 405 440 L438 655 C442 690 410 702 384 703 C410 640 396 500 350 418 Z", { fill: O.shade }),
    P("M180 450 C180 395 420 395 420 450 L440 655 C447 710 153 710 160 655 Z", { stroke: { width: 9, color: INK } }),
  ];
  if (O.plaid) for (let i = 0; i < 6; i++) { body.splice(2, 0, P(`M${190 + i * 45} 410 L${178 + i * 48} 700`, { stroke: { width: 6, color: "#8A6418" } }), P(`M165 ${470 + i * 40} L435 ${470 + i * 40}`, { stroke: { width: 5, color: "#E0B24A" } })); }
  if (O.overalls) body.splice(2, 0, P("M205 520 L395 520 L425 660 C430 700 170 700 175 660 Z", { fill: "#2F6FB8" }), P("M225 520 L215 430 M375 520 L385 430", { stroke: { width: 16, color: "#2F6FB8", cap: "round" } }));
  if (O.tie) body.push(P("M300 425 L318 450 L310 560 L300 580 L290 560 L282 450 Z", { fill: O.tie, stroke: { width: 6, color: INK } }));

  const bowN = O.bow ? [
    P("M300 482 L208 440 C188 458 188 510 208 526 Z", { fill: "#E0283C", stroke: { width: 9, color: INK } }),
    P("M300 482 L392 440 C412 458 412 510 392 526 Z", { fill: "#E0283C", stroke: { width: 9, color: INK } }),
    P("M300 482 L262 466 C258 480 258 494 262 502 Z", { fill: "#B8182E" }),
    P("M300 482 L338 466 C342 480 342 494 338 502 Z", { fill: "#B8182E" }),
    P("M214 448 L270 470", { stroke: { width: 6, color: "#F3A0B0", cap: "round" } }),
    P("M386 448 L330 470", { stroke: { width: 6, color: "#F3A0B0", cap: "round" } }),
    ...[[232, 466, 12, 9], [244, 506, 12, 9], [208, 488, 8, 10], [270, 488, 7, 9], [368, 466, 12, 9], [356, 506, 12, 9], [392, 488, 8, 10], [330, 488, 7, 9]].map(([cx, cy, rx, ry]) => P(circ(cx, cy, rx, ry), { fill: "#F4F2F4" })),
    <rect x={276} y={460} width={48} height={46} radius={9} fill="#D21E34" strokeColor={INK} strokeWidth={7} />,
    P("M282 466 L318 466 L312 472 L288 472 L288 500 L282 500 Z", { fill: "#F06A7A" }),
    <rect x={290} y={472} width={22} height={24} radius={4} fill="#C01428" />,
  ] : [];
  const head = [
    P(HEAD_INK, { fill: "#1E1418" }),
    P(HEAD_FILL, { fill: "#D3D1EE" }),
    P(HEAD_LIT, { fill: "#EDF1F9", effects: [{ kind: "blur", params: { px: 14 } }] }),
  ];
  const faceNodes = fs.map((e, i) => (
    <frame x={0} y={0} width={600} height={1000} layout="none" animate={win(i === 0 ? null : e.at, fs[i + 1] ? fs[i + 1].at : null, dur).length && i > 0 ? win(e.at, fs[i + 1] ? fs[i + 1].at : null, dur) : (fs[i + 1] ? win(0, fs[i + 1].at, dur) : [])}>
      {Face({ e: { ...e, blinks: (e.blinks || []).map((t) => t - (e.at || 0)) }, dur: dur - (e.at || 0) })}
    </frame>
  ));
  const hatK = O.hat && HAT[O.hat];
  const hat = hatK ? (
    <frame x={0} y={0} width={600} height={1000} layout="none" origin="center"
      animate={laugh ? [{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.18, value: -70 }, { at: 0.36, value: 0 }], repeat: Math.max(2, Math.floor((dur - 0.02) / 0.36)) }] : []}>
      {hatK()}
    </frame>
  ) : null;
  const arml = arms.l || ["down"], armr = arms.r || ["down"];
  const armFront = [Arm({ side: "l", from: arml[0], to: arml[1], at: arml[2] || 0, dur }), Arm({ side: "r", from: armr[0], to: armr[1], at: armr[2] || 0, dur })];
  const shake = laugh && dur > 0.5 ? [{ property: "offsetY", keyframes: [{ at: 0, value: 0 }, { at: 0.08, value: -10 }, { at: 0.16, value: 0 }], repeat: Math.max(2, Math.floor((dur - 0.02) / 0.16)) }] : [];
  return (
    <frame x={x} y={y} width={600} height={1000} layout="none" origin="center"
      animate={[{ property: "scale", from: flip ? -s : s, to: flip ? -s : s, at: 0, duration: dur }, ...anim]}>
      {legs}
      <frame x={0} y={0} width={600} height={1000} layout="none" animate={shake}>
        {body}
        {head}
        {bowN}
        {armFront}
        {faceNodes}
        {hat}
        {hold}
      </frame>
    </frame>
  );
}
