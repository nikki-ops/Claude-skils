// Геометрия рук: Catmull-Rom сглаживание, генератор пальцев из списка точек (никаких эллипсов по умолчанию)
export type P = [number, number];
export const DEG = Math.PI / 180;
export const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
export const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
export const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// угол t: 0 — вверх, положительный — по часовой (вправо)
export const dirOf = (t: number): P => [Math.sin(t), -Math.cos(t)];
export const nrmOf = (t: number): P => [Math.cos(t), Math.sin(t)];
const f = (v: number) => v.toFixed(1);

export const smoothClosed = (pts: P[]) => {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + " Z";
};

export const smoothOpen = (pts: P[]) => {
  const n = pts.length;
  if (n < 2) return "";
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};

// неровное пятно (пигментное пятно, капля, клочок пены)
export const blobPts = (c: P, rx: number, ry: number, rnd: () => number, k = 9, irr = 0.35, rot = 0): P[] =>
  Array.from({ length: k }, (_, i) => {
    const a = (i / k) * Math.PI * 2;
    const r = 1 - irr / 2 + rnd() * irr;
    const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r;
    return [c[0] + x * Math.cos(rot) - y * Math.sin(rot), c[1] + x * Math.sin(rot) + y * Math.cos(rot)] as P;
  });

// смещение ломаной вдоль нормали (для полос светотени)
export const offsetPoly = (pts: P[], d: number | ((i: number) => number)): P[] =>
  pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const k = typeof d === "number" ? d : d(i);
    return [p[0] + (-dy / L) * k, p[1] + (dx / L) * k] as P;
  });

export type FingerSpec = {
  mcp: P; // основание (пястно-фаланговый сустав)
  ang: number; // град., 0 — вверх
  segs: number[]; // длины фаланг
  bend?: number[]; // доп. изгиб в каждом суставе, град.
  w: number; // ширина у основания
  root?: number; // насколько уходит внутрь кисти
  jf?: number[]; // множители ширины в суставах
  mf?: number[]; // в серединах фаланг (кроме последней)
  pad?: [number, number]; // подушечка и кончик
  knob?: number; // узловатость суставов (возраст)
  nailW?: number; nailL?: number; nailShift?: number;
  fadeA?: number; fadeB?: number; // маска растворения у корня (доли первой фаланги от MCP)
};

export type FingerGeom = {
  spec: FingerSpec; path: string; J: P[]; th: number[]; hw: number; R: P;
  jointAng: number[]; axis: P[];
  nail: { c: P; t: number; L: number; w: number };
  fadeFrom: P; fadeTo: P;
};

export const buildFinger = (s: FingerSpec): FingerGeom => {
  const hw = s.w / 2;
  const n = s.segs.length;
  const th: number[] = [];
  let a = s.ang * DEG;
  for (let i = 0; i < n; i++) { a += (s.bend?.[i] ?? 0) * DEG; th.push(a); }
  const J: P[] = [s.mcp];
  for (let i = 0; i < n; i++) J.push(add(J[i], mul(dirOf(th[i]), s.segs[i])));
  const jointAng = J.map((_, i) => (i === 0 ? th[0] : i >= n ? th[n - 1] : (th[i - 1] + th[i]) / 2));
  const R = sub(s.mcp, mul(dirOf(th[0]), s.root ?? hw * 1.6));
  const jf = s.jf ?? [1.04, 0.98, 0.9];
  const mf = s.mf ?? [0.92, 0.85];
  const pad = s.pad ?? [0.86, 0.76];
  const knob = s.knob ?? 0;
  type St = { p: P; t: number; f: number };
  const st: St[] = [{ p: R, t: th[0], f: jf[0] * 1.04 }];
  for (let i = 0; i < n; i++) {
    st.push({ p: J[i], t: jointAng[i], f: jf[i] + (i > 0 ? knob : 0) });
    const d = dirOf(th[i]);
    if (i < n - 1) st.push({ p: add(J[i], mul(d, s.segs[i] * 0.5)), t: th[i], f: mf[i] });
    else {
      st.push({ p: add(J[i], mul(d, s.segs[i] * 0.45)), t: th[i], f: pad[0] });
      st.push({ p: add(J[i], mul(d, s.segs[i] * 0.78)), t: th[i], f: pad[1] });
    }
  }
  const tipT = th[n - 1];
  const capR = hw * pad[1] * 0.98;
  const C = sub(J[n], mul(dirOf(tipT), capR * 0.9));
  const left = st.map((q) => sub(q.p, mul(nrmOf(q.t), hw * q.f)));
  const right = st.map((q) => add(q.p, mul(nrmOf(q.t), hw * q.f)));
  const cap: P[] = [-62, -30, 0, 30, 62].map((deg) => {
    const ph = deg * DEG;
    return add(C, add(mul(dirOf(tipT), capR * Math.cos(ph)), mul(nrmOf(tipT), capR * Math.sin(ph))));
  });
  const path = smoothClosed([...left, ...cap, ...right.reverse()]);
  const last = s.segs[n - 1];
  const nailL = last * (s.nailL ?? 0.56);
  const nailC = add(sub(J[n], mul(dirOf(tipT), nailL * 0.5 + last * 0.06)), mul(nrmOf(tipT), hw * (s.nailShift ?? 0)));
  const fa = s.fadeA ?? -0.1, fb = s.fadeB ?? 0.32;
  return {
    spec: s, path, J, th, hw, R, jointAng,
    axis: [s.mcp, ...J.slice(1, n), sub(J[n], mul(dirOf(tipT), hw * 0.35))],
    nail: { c: nailC, t: tipT, L: nailL, w: hw * 2 * (s.nailW ?? 0.62) },
    fadeFrom: add(s.mcp, mul(dirOf(th[0]), s.segs[0] * fa)),
    fadeTo: add(s.mcp, mul(dirOf(th[0]), s.segs[0] * fb)),
  };
};

// свет: тёплый ключ сверху-слева
export const LIGHT: P = (() => { const L = Math.hypot(-0.75, -0.66); return [-0.75 / L, -0.66 / L] as P; })();
