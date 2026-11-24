// Процедурная анатомия взрослого мужчины (178 см), единицы — сантиметры.
// y — вверх (от пола), z — вперёд (к зрителю), правая сторона пациента — x < 0 (как на снимке AP).
// Каждая кость: SDF → Surface Nets; две изоповерхности: наружная (+плотность кортикала)
// и внутренняя (−разница, остаётся губчатая кость). Аддитивная «толщина» даёт настоящий рентген.
import {
  V3, Prim, Op, Grid, MeshData, BBox, add3, sub3, mul3, dot3, cross3, norm3, lerp3, len3,
  sphere, cone, capsule, ellipsoid, shell, torus, rbox, tri, plane, chain, sweep, spline, basis,
} from "./sdf";
import { mulberry } from "../components/rand";

export interface Part { pos: Float32Array; idx: Uint32Array; den: [number, number, number] }

const parts: Part[] = [];
const push = (m: MeshData, den: [number, number, number]) => { if (m.idx.length) parts.push({ pos: m.pos, idx: m.idx, den }); };

const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// Комбинаторы примитивов
const inter = (a: Prim, b: Prim): Prim => ({ b: a.b, f: (x, y, z) => Math.max(a.f(x, y, z), b.f(x, y, z)) });
const diff = (a: Prim, b: Prim, k = 0): Prim => ({ b: a.b, f: (x, y, z) => { const d1 = a.f(x, y, z), d2 = -b.f(x, y, z); if (k <= 0) return Math.max(d1, d2); const h = Math.max(k - Math.abs(d1 - d2), 0) / k; return Math.max(d1, d2) + h * h * k * 0.25; } });
// Сплющивание вдоль оси n (q<1 — тоньше)
const squash = (p: Prim, c: V3, n: V3, q: number): Prim => {
  const nn = norm3(n), s = 1 / q - 1;
  return { b: p.b, f: (x, y, z) => { const d = (x - c[0]) * nn[0] + (y - c[1]) * nn[1] + (z - c[2]) * nn[2]; return p.f(x + nn[0] * d * s, y + nn[1] * d * s, z + nn[2] * d * s) * q; } };
};

const bboxOf = (ops: Op[], pad: number): BBox => {
  const b: BBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const o of ops) if (o.t === "add") for (let i = 0; i < 3; i++) { b[i] = Math.min(b[i], o.p.b[i]); b[i + 3] = Math.max(b[i + 3], o.p.b[i + 3]); }
  return [b[0] - pad, b[1] - pad, b[2] - pad, b[3] + pad, b[4] + pad, b[5] + pad];
};

type Thick = number | ((x: number, y: number, z: number) => number);
// Кость: наружный кортикал + губчатое нутро
function bone(ops: Op[], h: number, t: Thick = 0.12, rho = 1, spongy = 0.38, chan = 0) {
  const g = new Grid(bboxOf(ops, 4 * h + 0.4), h);
  for (const o of ops) g.apply(o);
  const d: [number, number, number] = [0, 0, 0];
  d[chan] = rho;
  push(g.mesh(0), [...d] as [number, number, number]);
  if (spongy < rho) {
    const off = typeof t === "number" ? (() => t) : t;
    const di: [number, number, number] = [0, 0, 1];
    di[chan] = -(rho - spongy);
    push(g.mesh(0, off), di);
  }
}
// Мягкие ткани / воздух: одна поверхность
function soft(ops: Op[], h: number, rho: number, bb?: BBox) {
  const g = new Grid(bb || bboxOf(ops, 3 * h + 0.5), h);
  for (const o of ops) g.apply(o);
  push(g.mesh(0), [0, rho, 0]);
}
const A = (p: Prim, k = 0): Op => ({ t: "add", p, k });
const S = (p: Prim, k = 0): Op => ({ t: "sub", p, k });

// =============== ПОЗВОНОЧНИК ===============
const SPZ: [number, number][] = [[166, -2.6], [160.5, -2.3], [156, -1.5], [152, -1.5], [148.3, -2.5], [143.5, -4.4], [138, -5.6], [133, -6.3], [126, -6.4], [118.5, -5.3], [111.8, -3.5], [104.7, -2.1], [101, -2.5], [97, -4.2], [88, -8.8], [80, -9]];
const spzLin = (y: number) => {
  if (y >= SPZ[0][0]) return SPZ[0][1];
  for (let i = 0; i < SPZ.length - 1; i++) {
    const [y0, z0] = SPZ[i], [y1, z1] = SPZ[i + 1];
    if (y <= y0 && y >= y1) return z0 + ((y - y0) / (y1 - y0)) * (z1 - z0);
  }
  return SPZ[SPZ.length - 1][1];
};
export const spineZ = (y: number) => { let s = 0; for (let k = -4; k <= 4; k++) s += spzLin(y + k * 0.6); return s / 9; };
const spineSlope = (y: number) => (spineZ(y + 0.5) - spineZ(y - 0.5));

// Тело позвонка: эллиптический цилиндр с талией и скруглением
const vbody = (c: V3, w: number, d: number, h: number, slope: number): Prim => {
  const ey = norm3([0, 1, slope]); const ex: V3 = [1, 0, 0]; const ez = cross3(ex, ey);
  const a = w / 2, b = d / 2, rr = Math.min(0.3, h * 0.22), m = Math.max(a, b, h / 2) + 0.3;
  return {
    b: [c[0] - m, c[1] - m, c[2] - m, c[0] + m, c[1] + m, c[2] + m],
    f: (x, y, z) => {
      const px = x - c[0], py = y - c[1], pz = z - c[2];
      const lx = px, ly = px * ex[1] + py * ey[1] + pz * ey[2], lz = py * ez[1] + pz * ez[2];
      const yy = Math.min(1, Math.abs(ly) / (h / 2));
      const waist = 0.13 * (1 - yy * yy);
      const q = (Math.sqrt((lx / a) ** 2 + (lz / b) ** 2) - 1) * Math.min(a, b) + waist + rr;
      const vy = Math.abs(ly) - h / 2 + rr;
      return Math.sqrt(Math.max(q, 0) ** 2 + Math.max(vy, 0) ** 2) + Math.min(Math.max(q, vy), 0) - rr;
    },
  };
};

type VInfo = { name: string; y: number; kind: "atlas" | "axis" | "c" | "t" | "l"; w: number; d: number; h: number; i: number };
export const VERTS: VInfo[] = [];
VERTS.push({ name: "C1", y: 160.5, kind: "atlas", w: 2.0, d: 1.5, h: 1, i: 0 });
VERTS.push({ name: "C2", y: 158.3, kind: "axis", w: 2.1, d: 1.6, h: 1.8, i: 1 });
[156.3, 154.3, 152.3, 150.3, 148.3].forEach((y, k) => VERTS.push({ name: `C${k + 3}`, y, kind: "c", w: 2.0 + k * 0.15, d: 1.55 + k * 0.04, h: 1.2 + k * 0.04, i: k }));
for (let k = 0; k < 12; k++) VERTS.push({ name: `T${k + 1}`, y: 146 - 2.5 * k, kind: "t", w: 2.8 + (k / 11) * 1.2, d: 2.1 + (k / 11) * 0.9, h: 1.75 + (k / 11) * 0.5, i: k });
[115.2, 111.6, 108.0, 104.4, 100.8].forEach((y, k) => VERTS.push({ name: `L${k + 1}`, y, kind: "l", w: 4.2 + k * 0.15, d: 3.1 + k * 0.05, h: 2.45 + k * 0.05, i: k }));
export const canalZ = (y: number) => {
  // центр позвоночного канала (за телами)
  const d = y > 147 ? 1.6 : y > 117 ? 2.1 + ((147 - y) / 30) * 0.9 : 3.1;
  return spineZ(y) - d / 2 - (y > 147 ? 0.75 : 0.85);
};

function vertebra(v: VInfo) {
  const { y, w, d, h } = v;
  const zb = spineZ(y), back = zb - d / 2;
  const ops: Op[] = [];
  const k = 0.22;
  if (v.kind === "atlas") {
    ops.push(A(torus([0, y, zb - 0.75], [0, 1, 0], 1.45, 0.33, [0, 0, 1], 1.22, 1.32)));
    for (const s of [-1, 1]) {
      ops.push(A(ellipsoid([s * 1.65, y, zb - 0.5], [0.62, 0.68, 1.0]), k));
      ops.push(A(cone([s * 1.9, y, zb - 0.4], [s * 3.6, y - 0.1, zb - 0.6], 0.36, 0.45), k));
    }
    ops.push(A(sphere([0, y, zb + 0.75], 0.4), 0.2));
    ops.push(A(sphere([0, y, zb - 2.55], 0.36), 0.2));
    bone(ops, 0.1, 0.1);
    return;
  }
  ops.push(A(vbody([0, y, zb], w, d, h, spineSlope(y))));
  if (v.kind === "axis") {
    ops.push(A(cone([0, y + 0.7, zb + 0.05], [0, y + 2.35, zb + 0.02], 0.52, 0.4), 0.25));
    for (const s of [-1, 1]) {
      ops.push(A(ellipsoid([s * 1.25, y + 0.75, zb - 0.25], [0.7, 0.42, 0.8]), k));
      ops.push(A(cone([s * 1.5, y + 0.2, back - 0.5], [s * 1.0, y - 0.3, back - 1.4], 0.4, 0.33), k));
      ops.push(A(cone([s * 1.0, y - 0.3, back - 1.4], [0, y - 0.6, back - 1.8], 0.33, 0.35), k));
      ops.push(A(cone([s * 1.4, y + 0.1, zb], [s * 2.3, y + 0.0, zb - 0.3], 0.28, 0.25), k));
      ops.push(A(sphere([s * 0.38, y - 1.05, back - 3.0], 0.33), k));
    }
    ops.push(A(cone([0, y - 0.6, back - 1.8], [0, y - 0.95, back - 2.9], 0.42, 0.36), k));
    bone(ops, 0.1, 0.11);
    return;
  }
  if (v.kind === "c") {
    const c7 = v.name === "C7";
    for (const s of [-1, 1]) {
      ops.push(A(ellipsoid([s * (w / 2 - 0.1), y + h / 2, zb], [0.2, 0.32, 0.6]), 0.15)); // унковертебральные
      ops.push(A(ellipsoid([s * 1.75, y, back - 0.6], [0.55, 0.78, 0.62]), k)); // суставные столбы
      ops.push(A(cone([s * 0.85, y + 0.1, back + 0.1], [s * 1.55, y, back - 0.5], 0.3, 0.3), k));
      ops.push(A(cone([s * 1.15, y + 0.15, zb + 0.1], [s * (c7 ? 3.3 : 2.6), y + 0.05, zb - 0.35], 0.3, 0.26), k));
      ops.push(A(cone([s * 1.6, y - 0.1, back - 0.9], [0, y - 0.3, back - 1.6], 0.25, 0.25), k));
      if (!c7) ops.push(A(sphere([s * 0.3, y - 0.95, back - 2.8], 0.26), 0.15));
    }
    ops.push(A(cone([0, y - 0.3, back - 1.6], [0, y - (c7 ? 1.3 : 0.9), back - (c7 ? 4.1 : 2.8)], 0.27, c7 ? 0.38 : 0.28), k));
    bone(ops, 0.1, 0.1);
    return;
  }
  if (v.kind === "t") {
    const f = v.i / 11;
    const tpx = 3.5 - f * 1.1;
    const spDrop = v.i < 3 ? 1.4 : v.i < 9 ? 2.6 : 1.6;
    for (const s of [-1, 1]) {
      ops.push(A(ellipsoid([s * (w / 2 - 0.4), y + h * 0.18, back - 0.4], [0.36, 0.58, 0.78]), k)); // ножки дуги
      ops.push(A(cone([s * (w / 2 - 0.3), y + 0.1, back - 1.0], [0, y - 0.2, back - 1.9], 0.34, 0.34), k)); // пластинки
      ops.push(A(cone([s * (w / 2 - 0.3), y + 0.3, back - 1.0], [s * tpx, y + 0.55, back - 1.9], 0.42, 0.5), k)); // поперечные
      ops.push(A(ellipsoid([s * (w / 2 - 0.45), y + h * 0.58, back - 1.1], [0.36, 0.42, 0.32]), 0.15));
      ops.push(A(ellipsoid([s * (w / 2 - 0.55), y - h * 0.42, back - 1.4], [0.32, 0.42, 0.3]), 0.15));
    }
    ops.push(A(cone([0, y - 0.2, back - 1.9], [0, y - spDrop, back - 4.2], 0.36, 0.3), k));
    ops.push(A(sphere([0, y - spDrop, back - 4.25], 0.38), 0.2));
    bone(ops, 0.13, 0.13);
    return;
  }
  // поясничные
  const tpl = [1.9, 2.3, 2.55, 2.2, 1.9][v.i];
  for (const s of [-1, 1]) {
    ops.push(A(ellipsoid([s * (w / 2 - 0.5), y + 0.3, back - 0.45], [0.48, 0.72, 0.85]), k));
    ops.push(A(squash(cone([s * (w / 2 - 0.2), y + 0.2, back - 1.0], [s * (w / 2 + tpl), y + 0.25, back - 1.35], 0.42, 0.32), [0, y, 0], [0, 1, 0], 0.8), k));
    ops.push(A(cone([s * (w / 2 - 0.55), y - 0.1, back - 1.25], [0, y - 0.35, back - 2.0], 0.45, 0.45), k));
    ops.push(A(ellipsoid([s * 1.65, y + 1.25, back - 1.4], [0.45, 0.72, 0.52]), 0.2));
    ops.push(A(ellipsoid([s * 1.2, y - 1.35, back - 1.8], [0.4, 0.62, 0.45]), 0.2));
  }
  ops.push(A(ellipsoid([0, y - 0.4, back - 3.0], [0.38, 1.05, 1.5]), k));
  bone(ops, 0.15, 0.16);
}

// =============== ТАЗ + БЕДРО ===============
function pelvis() {
  // крестец
  const sops: Op[] = [];
  sops.push(A(vbody([0, 97.4, spineZ(97.4)], 4.6, 3.1, 2.1, spineSlope(97.4) * 1.4)));
  sops.push(A(tri([-5.6, 97.6, -5.4], [5.6, 97.6, -5.4], [0, 86.0, -9.6], 0.75), 0.6));
  sops.push(A(ellipsoid([0, 93, -6.6], [3.6, 4.2, 1.2]), 0.8));
  for (const s of [-1, 1]) for (const yy of [95.2, 92.6, 90.2]) sops.push(S(sphere([s * (1.5 - (95.2 - yy) * 0.07), yy, -7.0 - (95.2 - yy) * 0.25], 0.42), 0.15));
  sops.push(A(cone([0, 86.0, -9.6], [0, 83.6, -9.0], 0.55, 0.3), 0.3));
  bone(sops, 0.25, 0.18);
  for (const s of [-1, 1]) {
    const o: Op[] = [];
    o.push(A(ellipsoid([s * 5.0, 97.3, -6.0], [1.2, 3.0, 1.5])));
    o.push(A(tri([s * 5.2, 100.6, -7.0], [s * 14.0, 106.2, -2.0], [s * 11.8, 100.8, 4.8], 0.28), 0.5));
    o.push(A(tri([s * 5.3, 96.0, -6.0], [s * 11.8, 100.8, 4.8], [s * 9.2, 91.5, 1.0], 0.4), 0.5));
    o.push(A(tri([s * 5.3, 96.0, -6.0], [s * 9.2, 91.5, 1.0], [s * 7.6, 90.5, -3.5], 0.45), 0.5));
    chain([[s * 6.4, 104.2, -7.6], [s * 10.5, 106.4, -5.2], [s * 14.0, 106.2, -1.6], [s * 13.6, 104.6, 2.6], [s * 11.8, 101.0, 5.0]], [0.5, 0.6, 0.62, 0.55, 0.5]).forEach((p) => o.push(A(p, 0.4)));
    chain([[s * 5.2, 97.0, -5.6], [s * 6.5, 93.5, -2.6], [s * 6.8, 91.0, 0.8], [s * 5.4, 88.4, 3.4], [s * 2.0, 87.6, 5.0]], [0.5, 0.45, 0.45, 0.45, 0.5]).forEach((p) => o.push(A(p, 0.35)));
    const ac: V3 = [s * 9.4, 92.0, 0.8];
    o.push(A(inter(shell(ac, [2.75, 2.75, 2.75], 0.38), plane(ac, [s * 1, 0.25, 0])), 0.4));
    o.push(A(torus([s * 5.9, 86.4, 2.2], [s * 0.3, 0, 1], 2.0, 0.55, [0, 1, 0], 1.0, 1.35), 0.4));
    o.push(A(ellipsoid([s * 7.0, 83.4, -0.8], [1.0, 1.6, 1.2]), 0.4));
    o.push(A(cone([s * 4.4, 87.8, 4.3], [s * 0.75, 87.2, 5.4], 0.8, 0.75), 0.4));
    o.push(A(cone([s * 8.4, 90.8, 1.0], [s * 6.4, 88.3, 3.0], 0.9, 0.6), 0.4));
    bone(o, 0.25, 0.16);
    // бедренная кость
    const f: Op[] = [];
    f.push(A(sphere(ac, 2.35)));
    f.push(A(cone([s * 9.8, 91.6, 0.7], [s * 13.0, 89.5, 0.0], 1.55, 1.6), 0.5));
    f.push(A(ellipsoid([s * 14.6, 91.0, -0.6], [1.4, 2.3, 1.8]), 0.6));
    f.push(A(cone([s * 14.3, 89.5, -0.5], [s * 12.6, 85.8, -0.3], 1.3, 1.1), 0.5));
    f.push(A(sphere([s * 12.0, 85.8, -0.7], 0.85), 0.4));
    chain([[s * 14.0, 88.5, -0.3], [s * 13.3, 80, 0.3], [s * 12.2, 66, 1.0], [s * 11.7, 56.5, 1.3]], [1.75, 1.45, 1.4, 1.5]).forEach((p) => f.push(A(p, 0.6)));
    f.push({ t: "int", p: plane([0, 58, 0], [0, -1, 0]) });
    bone(f, 0.28, (x, y) => 0.15 + 0.4 * smooth(86, 80, y), 1, 0.38);
  }
}

// =============== ЧЕРЕП ===============
export const HEAD_C: V3 = [0, 166.6, -1.5];
const hc = (x: number, y: number, z: number): V3 => [HEAD_C[0] + x, HEAD_C[1] + y, HEAD_C[2] + z];
function skull() {
  const o: Op[] = [];
  // свод
  const vault = inter(shell(hc(0, 1.5, -0.8), [7.3, 8.0, 9.4], 0.33), {
    b: [-1e9, -1e9, -1e9, 1e9, 1e9, 1e9],
    f: (x, y, z) => { const zr = z - HEAD_C[2]; const c = zr > -1 ? -2.2 + 0.22 * zr : -2.42 + 0.6 * (zr + 1); return -((y - HEAD_C[1]) - c) * 0.97; },
  });
  o.push(A(vault));
  // затылочная кость: чаша задней черепной ямки
  const occ = inter(shell(hc(0, -2.4, -3.7), [5.5, 3.0, 5.1], 0.3), { b: [-1e9, -1e9, -1e9, 1e9, 1e9, 1e9], f: (x, y, z) => Math.max(y - (HEAD_C[1] - 2.0), z - (HEAD_C[2] + 0.2)) });
  o.push(A(occ, 0.6));
  // надбровье/лобная толще
  o.push(A(ellipsoid(hc(0, 1.6, 8.2), [5.0, 1.1, 0.7]), 0.6));
  // основание: передняя ямка (крыши орбит), клиновидная кость, пирамиды, затылок
  o.push(A(ellipsoid(hc(0, -1.0, 4.6), [5.2, 0.35, 2.6]), 0.5));
  o.push(A(ellipsoid(hc(0, -1.9, 0.6), [1.8, 1.4, 1.9]), 0.5));
  for (const s of [-1, 1]) {
    o.push(A(cone(hc(s * 5.6, -3.0, -3.4), hc(s * 1.5, -1.6, -0.4), 1.05, 0.5), 0.5)); // пирамида височной кости
    o.push(A(ellipsoid(hc(s * 5.6, -4.4, -3.0), [0.8, 1.4, 1.0]), 0.6)); // сосцевидный отросток
    o.push(A(ellipsoid(hc(s * 3.9, -2.4, 1.4), [1.8, 0.25, 2.0]), 0.5)); // средняя ямка
  }
  o.push(A(torus(hc(0, -5.1, -2.7), [0, 1, 0.25], 1.6, 0.45, [0, 0, 1], 1.0, 1.25), 0.5)); // большое отверстие
  // лицевой череп
  const face = ellipsoid(hc(0, -3.9, 5.2), [5.1, 3.6, 2.8]);
  o.push(A(face, 0.6));
  for (const s of [-1, 1]) {
    o.push(A(torus(hc(s * 3.25, -0.9, 7.15), [s * 0.22, 0, 1], 1.8, 0.36, [0, 1, 0], 1.08, 0.98), 0.4)); // край орбиты
    o.push(A(ellipsoid(hc(s * 5.1, -2.7, 4.6), [1.0, 1.45, 1.4]), 0.5)); // скуловая
    o.push(A(capsule(hc(s * 5.4, -2.9, 3.6), hc(s * 5.9, -3.0, -0.9), 0.36), 0.4)); // дуга
  }
  for (const s of [-1, 1]) {
    o.push(S(ellipsoid(hc(s * 3.2, -0.95, 6.2), [1.75, 1.6, 2.7]), 0.3)); // орбиты
    o.push(S(ellipsoid(hc(s * 2.55, -4.25, 5.1), [1.45, 1.5, 1.9]), 0.3)); // гайморовы пазухи
    o.push(S(ellipsoid(hc(s * 0.9, 1.9, 7.9), [0.75, 0.9, 0.4], basis([s * 0.4, 1, 0], [0, 0, 1])), 0.2)); // лобные пазухи
  }
  o.push(S(ellipsoid(hc(0, -3.6, 6.3), [1.12, 2.05, 3.4]), 0.25)); // полость носа
  o.push(A(ellipsoid(hc(0, -3.5, 6.0), [0.09, 1.8, 2.9]), 0.1)); // перегородка
  for (const s of [-1, 1]) {
    o.push(A(ellipsoid(hc(s * 0.85, -4.3, 6.0), [0.28, 0.42, 2.4]), 0.15)); // раковины
    o.push(A(capsule(hc(s * 0.35, -1.1, 8.25), hc(s * 0.75, -2.7, 8.65), 0.2), 0.2)); // носовые кости
  }
  // альвеолярный отросток + нёбо
  const arch = (X: number) => 7.85 - 4.6 * (X / 2.85) ** 2;
  o.push(A(ellipsoid(hc(0, -6.0, 5.3), [2.8, 0.4, 2.3]), 0.5));
  for (let X = -2.9; X <= 2.91; X += 0.58) o.push(A(sphere(hc(X, -6.35, arch(X) - 0.4), 0.62), 0.6));
  bone(o, 0.2, 0.13, 1, 0.2);

  // нижняя челюсть: пластина между альвеолярным краем и толстым нижним краем
  const m: Op[] = [];
  const marchZ = (X: number) => 8.0 - 5.0 * (Math.abs(X) / 4.7) ** 1.8;
  const up: V3[] = [], lo: V3[] = [];
  for (let X = -4.7; X <= 4.71; X += 0.47) {
    up.push(hc(X, -8.25 + 0.35 * (X / 4.7) ** 2, marchZ(X) - 0.3));
    lo.push(hc(X * 1.02, -10.9 + 1.75 * (X / 4.7) ** 2, marchZ(X) - 0.55));
  }
  for (let i = 0; i < up.length - 1; i++) {
    m.push(A(tri(up[i], up[i + 1], lo[i], 0.36), 0.3));
    m.push(A(tri(up[i + 1], lo[i + 1], lo[i], 0.36), 0.3));
    m.push(A(capsule(lo[i], lo[i + 1], 0.46), 0.4));
    m.push(A(capsule(up[i], up[i + 1], 0.36), 0.3));
  }
  m.push(A(ellipsoid(hc(0, -10.5, 7.35), [1.5, 0.75, 0.6]), 0.6)); // подбородочный выступ
  for (const s of [-1, 1]) {
    const ang = hc(s * 4.55, -9.3, -0.35), lastLo = lo[s < 0 ? 0 : lo.length - 1], lastUp = up[s < 0 ? 0 : up.length - 1];
    const cond = hc(s * 5.35, -4.2, -1.35), notch = hc(s * 4.95, -5.6, 0.0), cor = hc(s * 4.7, -4.6, 1.2);
    m.push(A(capsule(lastLo, ang, 0.46), 0.4));
    m.push(A(tri(lastUp, lastLo, ang, 0.3), 0.3));
    m.push(A(tri(lastUp, ang, notch, 0.24), 0.3));
    m.push(A(tri(ang, cond, notch, 0.24), 0.3));
    m.push(A(tri(lastUp, notch, cor, 0.22), 0.3));
    m.push(A(cone(ang, cond, 0.36, 0.3), 0.4)); // задний край ветви
    m.push(A(ellipsoid(add3(cond, [0, 0.2, 0]), [0.9, 0.5, 0.55]), 0.4)); // мыщелок
  }
  bone(m, 0.15, 0.14, 1, 0.42);

  // зубы: эмаль плотнее
  for (const up of [1, -1]) {
    const yo = up > 0 ? -7.15 : -7.55;
    const archT = (X: number) => (up > 0 ? 7.95 - 4.6 * (X / 2.85) ** 2 : 7.6 - 4.4 * (X / 2.7) ** 2);
    const xs = [0.42, 1.2, 1.85, 2.3, 2.6, 2.85, 3.0, 3.1];
    for (const s of [-1, 1]) xs.forEach((ax, i) => {
      const X = s * ax * (up > 0 ? 0.98 : 0.93);
      const Z = archT(Math.min(Math.abs(X), 2.84) * Math.sign(X)) + (i >= 5 ? -(i - 4) * 0.95 : 0);
      const wide = i >= 5 ? 0.55 : i >= 3 ? 0.42 : 0.36;
      const t: Op[] = [];
      t.push(A(ellipsoid(hc(X, yo, Z), [wide * 0.85, 0.42, i >= 3 ? wide : 0.3])));
      t.push(A(cone(hc(X, yo + up * 0.25, Z), hc(X, yo + up * (i === 2 ? 1.5 : 1.25), Z - 0.1), wide * 0.6, 0.17), 0.2));
      if (i >= 5) t.push(A(cone(hc(X, yo + up * 0.25, Z + 0.25), hc(X + 0.1, yo + up * 1.2, Z + 0.35), 0.24, 0.15), 0.2));
      bone(t, 0.08, 0.13, 1.05, 0.5);
    });
  }
}

// =============== РЁБРА, ГРУДИНА, КЛЮЧИЦЫ ===============
const sternumZ = (y: number) => 5.0 + ((143.5 - y) / 25.5) * 3.8;
function ribs() {
  const Aw = [6.8, 9.8, 11.8, 13.0, 13.9, 14.4, 14.6, 14.6, 14.3, 13.7, 12.6, 10.6];
  const drop = [4.0, 5.0, 6.3, 7.3, 8.3, 9.3, 10.2, 11.2, 11.8, 11.8, 9.0, 6.0];
  const Db = [5.6, 7.3, 8.5, 9.2, 9.6, 9.8, 9.9, 9.8, 9.6, 9.3, 9.0, 8.6];
  const Df = [5.4, 6.6, 7.5, 8.3, 8.9, 9.4, 9.7, 9.7, 9.3, 8.5, 0, 0];
  const xe = [3.6, 5.0, 6.0, 7.0, 7.8, 8.6, 9.6, 10.6, 11.6, 12.4, 0, 0];
  const ySt = [141.8, 138.6, 135.8, 132.8, 129.8, 126.6, 122.6];
  const cartTarget = [[5.0, 120.0], [6.8, 117.8], [8.6, 115.8]];
  const zc = -0.6;
  for (let i = 0; i < 12; i++) {
    const v = VERTS.find((q) => q.name === `T${i + 1}`)!;
    const zb = spineZ(v.y), back = zb - v.d / 2, yh = v.y + 0.55;
    for (const s of [-1, 1]) {
      const ctrl: V3[] = [[s * (v.w / 2 + 0.15), yh, zb - 0.35], [s * (v.w / 2 + 1.5), yh + 0.25, back - 1.4]];
      const b0 = Math.asin(Math.min(0.95, (v.w / 2 + 2.9) / Aw[i]));
      const bEnd = i < 10 ? Math.PI - Math.asin(Math.min(0.99, xe[i] / Aw[i])) : i === 10 ? 1.95 : 1.35;
      const N = 9;
      for (let k = 0; k <= N; k++) {
        const b = b0 + ((bEnd - b0) * k) / N;
        const D = b <= Math.PI / 2 ? Db[i] : Df[i];
        const yy = yh + 0.25 - drop[i] * Math.pow(smooth(b0, bEnd, b), 1.3);
        ctrl.push([s * Aw[i] * Math.sin(b), yy, zc - D * Math.cos(b)]);
      }
      const pts = spline(ctrl, 90);
      const ax = pts.map((p) => norm3([p[0], 0, p[2] - zc]) as V3);
      const n = pts.length;
      const first = i === 0;
      const ra = pts.map((_, k) => { const u = k / (n - 1); const base = first ? 0.65 : 0.27 - 0.07 * smooth(0.45, 1, u); return k < 3 ? base * 0.9 + 0.15 : base; });
      const rb = pts.map((_, k) => { const u = k / (n - 1); const base = first ? 0.3 : (0.36 + 0.16 * smooth(0.05, 0.3, u)) * (1 + 0.15 * u); return k < 3 ? Math.max(base, 0.42) : base; });
      push(sweep(pts, ax, ra, rb, 12), [1, 0, 0]);
      push(sweep(pts, ax, ra.map((r) => Math.max(0.06, r - 0.09)), rb.map((r) => Math.max(0.06, r - 0.11)), 10), [-0.66, 0, 1]);
      // хрящ
      if (i < 10) {
        const E = pts[n - 1];
        const T = norm3(sub3(pts[n - 1], pts[n - 4]));
        let S: V3;
        if (i < 7) S = [s * 1.6, ySt[i], sternumZ(ySt[i]) - 0.2];
        else S = [s * cartTarget[i - 7][0], cartTarget[i - 7][1], sternumZ(cartTarget[i - 7][1]) - 0.6 - (i - 7) * 0.7];
        const M1 = add3(E, mul3(T, 1.2));
        const mid = lerp3(M1, S, 0.5);
        if (i >= 4) mid[1] = Math.min(M1[1], S[1]) - 0.4 * (i - 3);
        mid[2] += 0.4;
        const cp = spline([E, M1, mid, S], 40);
        const cax = cp.map((p) => norm3([p[0], 0, p[2] - zc]) as V3);
        push(sweep(cp, cax, cp.map(() => 0.32), cp.map((_, k) => 0.62 - 0.12 * (k / 39)), 10), [0.2, 0.25, 0]);
      }
    }
  }
  // грудина
  const ax = basis([0, 25.5, -3.8], [0, 0, 1]);
  const st: Op[] = [];
  st.push(A(ellipsoid([0, 141.3, sternumZ(141.3)], [2.6, 2.3, 0.65], ax)));
  st.push(S(sphere([0, 143.9, sternumZ(143.9)], 0.8), 0.3));
  st.push(A(rbox([0, 130.4, sternumZ(130.4)], [1.25, 8.0, 0.35], 0.4, ax), 0.5));
  st.push(A(cone([0, 122.2, sternumZ(122.2)], [0, 118.6, sternumZ(118.6) - 0.2], 0.6, 0.3), 0.3));
  bone(st, 0.18, 0.12, 0.9, 0.3);
  // ключицы
  for (const s of [-1, 1]) {
    const pts = spline([[s * 1.8, 143.2, 5.0], [s * 4, 143.4, 6.2], [s * 8, 144.0, 6.3], [s * 12, 144.9, 4.4], [s * 15.5, 145.9, 1.2], [s * 18.4, 146.3, -1.7]], 70);
    const n = pts.length;
    const ax = pts.map(() => [0, 1, 0] as V3);
    const ra = pts.map((_, k) => { const u = k / (n - 1); return 0.95 - 0.4 * smooth(0, 0.3, u) - 0.12 * smooth(0.65, 1, u); });
    const rb = pts.map((_, k) => { const u = k / (n - 1); return 0.95 - 0.35 * smooth(0, 0.3, u) + 0.18 * smooth(0.6, 1, u); });
    push(sweep(pts, ax, ra, rb, 14), [1, 0, 0]);
    push(sweep(pts, ax, ra.map((r) => r - 0.17), rb.map((r) => r - 0.17), 12), [-0.62, 0, 0]);
  }
}

// =============== ПЛЕЧЕВОЙ ПОЯС И РУКИ ===============
export const SHOULDER_H = (s: number): V3 => [s * 18.1, 140.8, -2.7];
export const ELBOW = (s: number): V3 => [s * 22.8, 110.2, -2.2];
export const WRIST = (s: number): V3 => [s * 27.0, 85.6, -1.0];

// Кисть: локальная система (u — к пальцам, v — к большому пальцу (латерально), w — к ладони)
export const handFrame = (s: number) => {
  const W = WRIST(s), E = ELBOW(s);
  const d = norm3(add3(norm3(sub3(W, E)), [s * 0.03, 0, 0]));
  let n: V3 = [0, 0, 1];
  n = norm3(sub3(n, mul3(d, dot3(n, d))));
  let l = cross3(d, n);
  if (Math.sign(l[0]) !== s) l = mul3(l, -1);
  return { W, d, l, n, at: (u: number, v: number, w: number): V3 => add3(W, add3(mul3(d, u), add3(mul3(l, v), mul3(n, w)))) };
};

function scapula(s: number) {
  const o: Op[] = [];
  const SA: V3 = [s * 6.5, 144.8, -9.2], IA: V3 = [s * 9.0, 127.5, -9.0], N: V3 = [s * 14.0, 140.2, -4.8], SB: V3 = [s * 12.4, 143.5, -6.1];
  o.push(A(tri(SA, IA, N, 0.3)));
  o.push(A(tri(SA, N, SB, 0.3), 0.3));
  chain([[s * 14.0, 139.2, -4.9], [s * 12.4, 134, -7.0], IA], [0.78, 0.62, 0.48]).forEach((p) => o.push(A(p, 0.5)));
  chain([SA, [s * 5.8, 137, -9.6], IA], [0.3, 0.3, 0.38]).forEach((p) => o.push(A(p, 0.3)));
  o.push(A(capsule(SA, SB, 0.25), 0.3));
  chain([[s * 6.2, 140.2, -10.0], [s * 11, 142.3, -9.5], [s * 15.5, 144.3, -6.9], [s * 17.6, 145.2, -4.6]], [0.3, 0.5, 0.6, 0.6]).forEach((p) => o.push(A(p, 0.4)));
  o.push(A(ellipsoid([s * 18.0, 145.2, -4.0], [1.15, 0.85, 1.9], basis([s * 0.25, 1, 0.1], [s * 0.6, 0, 1])), 0.7)); // акромион
  chain([[s * 13.0, 142.8, -4.8], [s * 13.6, 143.6, -2.6], [s * 13.3, 142.5, 0.2]], [0.62, 0.55, 0.45]).forEach((p) => o.push(A(p, 0.4))); // клювовидный
  const G: V3 = [s * 15.0, 140.6, -3.8];
  o.push(A(ellipsoid(G, [0.95, 1.9, 1.3]), 0.5));
  o.push(S(sphere(SHOULDER_H(s), 2.6), 0.2));
  bone(o, 0.17, 0.11, 1, 0.42);
}

function humerus(s: number) {
  const H = SHOULDER_H(s), E = ELBOW(s);
  const ax = norm3(sub3(E, H)), L = len3(sub3(E, H));
  const P = (t: number) => lerp3(H, E, t);
  const o: Op[] = [];
  o.push(A(sphere(H, 2.35)));
  o.push(A(ellipsoid(add3(H, [s * 2.15, 0.5, 0.5]), [1.2, 1.7, 1.45]), 0.6));
  o.push(A(sphere(add3(H, [s * 0.8, -0.7, 1.9]), 0.8), 0.5));
  chain([add3(H, [s * 1.0, -1.9, 0.1]), P(0.2), P(0.55), P(0.83)], [1.85, 1.2, 1.08, 1.2]).forEach((p) => o.push(A(p, 0.7)));
  o.push(A(ellipsoid(add3(P(0.42), [s * 0.95, 0, 0.3]), [0.45, 2.2, 0.6]), 0.5));
  // дистальный эпифиз
  const me = add3(E, [-s * 2.95, 0.5, -0.5]), le = add3(E, [s * 2.5, 0.6, -0.4]);
  o.push(A(ellipsoid(me, [0.9, 0.8, 0.8]), 0.4));
  o.push(A(ellipsoid(le, [0.6, 0.8, 0.7]), 0.4));
  o.push(A(cone(add3(P(0.8), [-s * 0.5, 0, 0]), me, 0.6, 0.55), 0.6));
  o.push(A(cone(add3(P(0.8), [s * 0.5, 0, 0]), le, 0.55, 0.5), 0.6));
  o.push(A(squash(ellipsoid(add3(E, [0, 1.3, -0.3]), [2.3, 1.6, 1.3]), E, [0, 0, 1], 0.8), 0.6));
  o.push(A(ellipsoid(add3(E, [-s * 1.0, -0.3, 0]), [1.3, 1.1, 1.25]), 0.3)); // блок
  o.push(A(sphere(add3(E, [s * 1.2, -0.2, 0.5]), 1.0), 0.3)); // головочка
  o.push(S(ellipsoid(add3(E, [-s * 0.3, 1.6, -1.35]), [1.0, 1.15, 0.8]), 0.3)); // ямка локтевого отростка
  o.push(S(ellipsoid(add3(E, [-s * 0.3, 1.6, 1.15]), [0.8, 0.8, 0.6]), 0.3));
  const thick = (x: number, y: number, z: number) => {
    const u = dot3(sub3([x, y, z], H), ax) / L;
    return 0.11 + 0.36 * smooth(0.1, 0.28, u) * (1 - smooth(0.72, 0.9, u));
  };
  bone(o, 0.19, thick, 1, 0.36);
}

function forearm(s: number) {
  const E = ELBOW(s), hf = handFrame(s), at = hf.at;
  const fa = norm3(sub3(hf.W, E)), L = len3(sub3(hf.W, E));
  const thickF = (o: V3) => (x: number, y: number, z: number) => {
    const u = dot3(sub3([x, y, z], o), fa) / L;
    return 0.1 + 0.3 * smooth(0.12, 0.3, u) * (1 - smooth(0.7, 0.9, u));
  };
  // локтевая
  const u: Op[] = [];
  const O = add3(E, [-s * 1.3, 0.6, -1.7]);
  const uh = at(-0.7, -1.75, -0.35);
  u.push(A(ellipsoid(O, [1.0, 1.35, 1.1])));
  u.push(A(cone(add3(E, [-s * 1.0, -1.0, 1.0]), add3(E, [-s * 1.2, -1.8, -0.4]), 0.6, 0.9), 0.5));
  chain([O, add3(E, [-s * 1.25, -1.8, -0.6]), lerp3(add3(E, [-s * 1.25, -1.8, -0.6]), uh, 0.5), at(-2.6, -1.7, -0.35)], [0.95, 0.95, 0.62, 0.52]).forEach((p) => u.push(A(p, 0.6)));
  u.push(A(ellipsoid(uh, [0.85, 0.82, 0.85]), 0.6));
  u.push(A(cone(uh, at(0.15, -2.05, -0.55), 0.38, 0.17), 0.3));
  u.push(S(ellipsoid(add3(E, [-s * 1.0, -0.3, 0]), [1.45, 1.25, 1.4]), 0.2));
  bone(u, 0.17, thickF(E), 1, 0.36);
  // лучевая
  const r: Op[] = [];
  const rh = add3(E, [s * 1.2, -1.75, 0.4]);
  r.push(A(ellipsoid(rh, [1.12, 0.55, 1.12])));
  r.push(A(cone(rh, add3(E, [s * 1.0, -3.4, 0.4]), 0.7, 0.62), 0.4));
  r.push(A(ellipsoid(add3(E, [s * 0.55, -4.3, 0.25]), [0.65, 1.0, 0.7]), 0.4));
  const rMid = add3(lerp3(E, hf.W, 0.5), [s * 1.75, 0, 0.2]);
  chain([add3(E, [s * 1.0, -3.0, 0.4]), rMid, at(-3.6, 1.15, 0.0), at(-1.8, 0.95, 0.0)], [0.66, 0.78, 0.85, 1.0]).forEach((p) => r.push(A(p, 0.6)));
  r.push(A(ellipsoid(at(-0.75, 0.9, 0.0), [0.75, 1.75, 1.05], [hf.d, hf.l, hf.n]), 1.2));
  r.push(A(ellipsoid(at(-2.0, 0.95, 0.0), [1.6, 1.25, 0.95], [hf.d, hf.l, hf.n]), 1.0));
  r.push(S(ellipsoid(at(0.55, 0.6, 0.0), [0.5, 1.4, 1.2], [hf.d, hf.l, hf.n]), 0.3));
  r.push(A(cone(at(-0.7, 2.1, 0.0), at(0.45, 2.5, -0.05), 0.45, 0.18), 0.4));
  bone(r, 0.15, thickF(E), 1, 0.36);
}

// Кисть (только правая — именно её кусают)
export const FINGERS = (() => {
  const hf = handFrame(-1), at = hf.at;
  type F = { base: V3; head: V3; dir: V3; lens: number[]; sc: number };
  const mc = [
    { b: [3.2, 2.75, 0.55], dir: norm3([0.74, 0.55, 0.4]), len: 4.4, lens: [3.1, 0, 2.35], sc: 1.08 },
    { b: [3.75, 1.2, 0.0], dir: norm3([1, 0.08, 0.05]), len: 6.9, lens: [4.0, 2.35, 1.65], sc: 1.0 },
    { b: [3.9, 0.0, 0.0], dir: norm3([1, 0.02, 0.05]), len: 6.45, lens: [4.45, 2.8, 1.8], sc: 1.02 },
    { b: [3.85, -1.15, 0.0], dir: norm3([1, -0.07, 0.05]), len: 5.85, lens: [4.15, 2.65, 1.75], sc: 0.95 },
    { b: [3.6, -2.15, -0.05], dir: norm3([1, -0.16, 0.05]), len: 5.35, lens: [3.3, 1.9, 1.55], sc: 0.86 },
  ];
  // мировые точки суставов каждого луча
  return mc.map((m, fi) => {
    const toW = (v: V3): V3 => add3(mul3(hf.d, v[0]), add3(mul3(hf.l, v[1]), mul3(hf.n, v[2])));
    let dir = m.dir;
    const base = at(m.b[0], m.b[1], m.b[2]);
    const joints: V3[] = [base];
    let p = add3(base, toW(mul3(dir, m.len)));
    joints.push(p);
    const segs: { a: V3; b: V3; kind: number }[] = [{ a: base, b: p, kind: 0 }];
    m.lens.forEach((len, k) => {
      if (!len) return;
      // лёгкое сгибание к ладони
      dir = norm3(add3(dir, [0, 0, 0.1 + 0.02 * k]));
      const a = add3(p, toW(mul3(dir, 0.3)));
      const b = add3(a, toW(mul3(dir, len)));
      segs.push({ a, b, kind: k + 1 });
      joints.push(b);
      p = b;
    });
    return { segs, joints, sc: m.sc, thumb: fi === 0, tip: p };
  });
})();

function hand() {
  const hf = handFrame(-1), at = hf.at, F: [V3, V3, V3] = [hf.d, hf.l, hf.n];
  const carp = (c: V3, r: V3, dirU?: V3) => {
    const axes: [V3, V3, V3] = dirU ? (() => { const e1 = norm3(add3(mul3(hf.d, dirU[0]), add3(mul3(hf.l, dirU[1]), mul3(hf.n, dirU[2])))); const e3 = hf.n; const e2 = norm3(cross3(e3, e1)); return [e1, e2, norm3(cross3(e1, e2))] as [V3, V3, V3]; })() : F;
    return ellipsoid(at(c[0], c[1], c[2]), r, axes);
  };
  bone([A(carp([1.15, 1.4, 0.15], [1.3, 0.68, 0.72], [0.75, 0.66, 0]))], 0.08, 0.09, 1, 0.42); // ладьевидная
  bone([A(carp([1.05, 0.08, 0.05], [0.8, 0.8, 0.85])), S(sphere(at(2.25, -0.05, 0.1), 0.85), 0.15)], 0.08, 0.09, 1, 0.42); // полулунная
  bone([A(carp([1.4, -1.22, -0.15], [0.7, 0.72, 0.65]))], 0.08, 0.09, 1, 0.42); // трёхгранная
  bone([A(carp([1.5, -1.45, 0.78], [0.5, 0.42, 0.45]))], 0.08, 0.09, 1, 0.42); // гороховидная
  bone([A(carp([2.55, 2.15, 0.35], [0.82, 0.68, 0.75], [0.6, 0.8, 0]))], 0.08, 0.09, 1, 0.42); // трапеция
  bone([A(carp([2.7, 1.1, 0.0], [0.75, 0.55, 0.65]))], 0.08, 0.09, 1, 0.42); // трапециевидная
  bone([A(carp([2.75, -0.02, 0.05], [1.35, 0.68, 0.8])), A(sphere(at(1.75, 0.0, 0.1), 0.72), 0.3)], 0.08, 0.09, 1, 0.42); // головчатая
  bone([A(carp([2.65, -1.2, 0.0], [1.1, 0.72, 0.75])), A(sphere(at(2.75, -1.15, 0.95), 0.36), 0.25)], 0.08, 0.09, 1, 0.42); // крючковидная
  for (const f of FINGERS) {
    for (const sg of f.segs) {
      const o: Op[] = [];
      const dir = norm3(sub3(sg.b, sg.a)), len = len3(sub3(sg.b, sg.a));
      const P = (t: number) => lerp3(sg.a, sg.b, t);
      const sc = f.sc;
      const ax = basis(dir, hf.n);
      // оси эллипсоидов: [поперёк(лат), вдоль, к ладони]
      const ell = (c: V3, rl: number, ru: number, rw: number) => ellipsoid(c, [rl, ru, rw], ax);
      if (sg.kind === 0) {
        o.push(A(ell(add3(sg.a, mul3(dir, 0.45)), 0.64 * sc, 0.45, 0.6 * sc)));
        o.push(A(cone(P(0.12), P(0.5), 0.45 * sc, 0.33 * sc), 0.4));
        o.push(A(cone(P(0.5), P(0.86), 0.33 * sc, 0.42 * sc), 0.4));
        o.push(A(ell(sub3(sg.b, mul3(dir, 0.55)), 0.56 * sc, 0.62 * sc, 0.62 * sc), 0.3));
        bone(o, 0.085, (x, y, z) => { const t = dot3(sub3([x, y, z], sg.a), dir) / len; return 0.08 + 0.13 * smooth(0.15, 0.35, t) * (1 - smooth(0.65, 0.85, t)); }, 1, 0.38);
      } else {
        const k = sg.kind === 1 ? 1 : sg.kind === 2 ? 0.84 : 0.76;
        const distal = sg.kind === 3 || (f.thumb && sg.kind === 3);
        o.push(A(ell(add3(sg.a, mul3(dir, 0.3)), 0.52 * sc * k, 0.3, 0.42 * sc * k)));
        o.push(A(cone(P(0.12), P(0.55), 0.37 * sc * k, 0.27 * sc * k), 0.3));
        if (!distal) {
          o.push(A(cone(P(0.55), P(0.86), 0.27 * sc * k, 0.33 * sc * k), 0.3));
          o.push(A(ell(sub3(sg.b, mul3(dir, 0.28)), 0.43 * sc * k, 0.28, 0.36 * sc * k), 0.2));
        } else {
          o.push(A(cone(P(0.55), P(0.88), 0.26 * sc * k, 0.22 * sc * k), 0.2));
          o.push(A(ell(P(0.92), 0.36 * sc, 0.22, 0.2 * sc), 0.2));
        }
        bone(o, 0.07, (x, y, z) => { const t = dot3(sub3([x, y, z], sg.a), dir) / len; return 0.07 + 0.09 * smooth(0.2, 0.4, t) * (1 - smooth(0.6, 0.8, t)); }, 1, 0.38);
      }
    }
  }
  // сесамовидные у большого пальца
  const th = FINGERS[0].joints[1];
  bone([A(sphere(add3(th, mul3(hf.n, 0.75)), 0.24)), A(sphere(add3(add3(th, mul3(hf.n, 0.7)), mul3(hf.l, -0.45)), 0.22))], 0.06, 0.06, 1, 0.5);
}

// =============== МЯГКИЕ ТКАНИ ===============
const PROFILE: [number, number, number, number][] = [
  [84, 16.0, 10.5, -1.0], [95, 17.0, 11.0, -1.0], [104, 15.0, 10.0, 0.0], [112, 14.6, 10.3, 0.5], [122, 15.8, 11.3, 0.3],
  [132, 16.8, 11.2, -0.2], [140, 17.0, 9.8, -1.2], [145, 14.0, 7.8, -2.0], [149, 8.5, 6.4, -2.0],
];
const torsoPrim: Prim = {
  b: [-18, 80, -13, 18, 150, 12],
  f: (x, y, z) => {
    const yc = Math.min(149, Math.max(84, y));
    let i = 0;
    while (i < PROFILE.length - 2 && PROFILE[i + 1][0] < yc) i++;
    const [y0, a0, b0, z0] = PROFILE[i], [y1, a1, b1, z1] = PROFILE[i + 1];
    const t = smooth(0, 1, (yc - y0) / (y1 - y0)) * 0.6 + ((yc - y0) / (y1 - y0)) * 0.4;
    const a = a0 + (a1 - a0) * t, b = b0 + (b1 - b0) * t, zc = z0 + (z1 - z0) * t;
    const de = (Math.sqrt((x / a) ** 2 + ((z - zc) / b) ** 2) - 1) * Math.min(a, b) * 0.95;
    const dy = Math.max(84 - y, y - 149);
    return dy > 0 ? Math.sqrt(Math.max(de, 0) ** 2 + dy * dy) : de;
  },
};

export const FOREARM_CUT = (() => {
  const E = ELBOW(-1), W = WRIST(-1);
  const fa = norm3(sub3(W, E));
  return { p: add3(E, mul3(fa, 6.5)), n: fa };
})();

function softTissue() {
  const o: Op[] = [];
  o.push(A(torsoPrim));
  for (const s of [-1, 1]) {
    o.push(A(sphere([s * 19.0, 141.4, -2.2], 4.7), 3));
    o.push(A(squash(cone([s * 3, 150.5, -2.8], [s * 16.5, 145.6, -3.0], 4.0, 3.2), [0, 147, -3], [0, 1, 0], 0.75), 3));
    const H = SHOULDER_H(s), E = ELBOW(s), W = WRIST(s);
    o.push(A(squash(cone(add3(H, [s * 0.5, -1.5, 0]), E, 4.4, 3.7), E, [0, 0, 1], 0.92), 2.0));
    o.push(A(ellipsoid(add3(lerp3(H, E, 0.45), [0, 0, 1.6]), [2.6, 7.0, 2.4]), 2.0));
    const fore = squash(cone(add3(E, [0, 0, 0.3]), add3(W, mul3(norm3(sub3(W, E)), -1.0)), 4.3, 2.75), E, [0, 0, 1], 0.78);
    if (s < 0) o.push(A(fore, 1.5));
    else {
      o.push(A(fore, 1.5));
      const hf = handFrame(1);
      o.push(A(rbox(hf.at(5.2, 0, 0.1), [4.2, 3.1, 0.7], 0.75, [hf.d, hf.l, hf.n]), 1.2));
      o.push(A(capsule(hf.at(8, 0, 0.2), hf.at(17.5, -0.4, 1.0), 2.2), 1.0));
      o.push(A(capsule(hf.at(4, 2.5, 0.8), hf.at(9.5, 4.3, 2.0), 1.1), 1.0));
    }
    o.push(A(cone([s * 9.5, 92, 0], [s * 10.5, 56, 1.0], 8.5, 6.8), 4));
  }
  o.push(A(squash(cone([0, 145.5, -2.0], [0, 160.5, -1.8], 6.0, 5.4), [0, 150, -2], [1, 0, 0], 1.0), 4));
  o.push(A(ellipsoid([0, 168.4, -1.6], [8.1, 9.6, 10.3]), 2));
  o.push(A(ellipsoid([0, 160.2, 3.0], [5.6, 4.4, 5.4]), 2.5));
  o.push(A(ellipsoid([0, 156.9, 6.5], [2.6, 1.6, 1.8]), 1.2));
  o.push(A(cone([0, 165.0, 8.9], [0, 161.4, 11.0], 0.7, 1.1), 1.0));
  for (const s of [-1, 1]) o.push(A(ellipsoid([s * 7.95, 165.6, -1.9], [0.75, 3.1, 1.7]), 0.8));
  // правое предплечье + кисть — мелкая сетка
  const hf = handFrame(-1), at = hf.at;
  const b = o, W = WRIST(-1);
  b.push(A(squash(cone(at(-1.5, 0.1, 0), at(1.5, 0.1, 0.1), 2.8, 2.9), W, hf.n, 0.7), 1.0));
  b.push(A(rbox(at(5.6, -0.4, 0.15), [3.6, 2.55, 0.5], 0.75, [hf.d, hf.l, hf.n]), 1.2));
  b.push(A(ellipsoid(at(4.6, 2.5, 0.9), [1.3, 2.6, 1.2], basis(add3(mul3(hf.d, 0.8), mul3(hf.l, 0.6)), hf.n)), 1.0)); // тенар
  b.push(A(ellipsoid(at(5.0, -2.75, 0.55), [3.0, 0.8, 0.95], [hf.d, hf.l, hf.n]), 1.0));
  for (const f of FINGERS) {
    const j = f.joints;
    const pts = f.thumb ? j.slice(1) : j.slice(1);
    const r0 = f.thumb ? 1.12 : 0.98 * f.sc + 0.05;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = add3(pts[i], mul3(hf.n, 0.12)), c = add3(pts[i + 1], mul3(hf.n, 0.12));
      const isLast = i === pts.length - 2;
      const end = isLast ? add3(c, mul3(norm3(sub3(c, a)), 0.35)) : c;
      b.push(A(squash(cone(a, end, r0 * (1 - i * 0.07), r0 * (1 - (i + 1) * 0.07) * (isLast ? 0.92 : 1)), a, hf.n, 0.88), i === 0 ? 0.9 : 0.25));
    }
  }


  soft(o, 0.45, 0.03, [-42, 55, -16, 36, 181, 16]);

  // лёгкие (воздух), трахея, газовый пузырь
  for (const s of [-1, 1]) {
    const l: Op[] = [];
    l.push(A(ellipsoid([s * 7.7, 131.0, -0.9], [6.3, 15.8, 8.6])));
    l.push(S(sphere([s * 6.0, 104.0 + (s < 0 ? 1.6 : 0), 1.2], 16.2), 1.0));
    l.push(S(rbox([0, 135, 0], [2.2, 20, 12], 0.5), 1.5));
    l.push(S(ellipsoid([1.6, 121.6, 3.0], [6.9, 6.1, 5.7], basis([0.35, 1, 0], [0, 0, 1])), 1.2));
    l.push(S(sphere([2.6, 134.6, -1.6], 2.3), 1.0));
    l.push(S(ellipsoid([0, 130, -6.5], [3.6, 30, 3.6]), 1.0));
    l.push(S(ellipsoid([s * 3.6, 131.0, -0.6], [1.6, 2.6, 1.6]), 0.8)); // корень лёгкого
    soft(l, 0.55, -0.025);
  }
  const air: Op[] = [];
  air.push(A(cone([0, 154.5, 1.6], [0, 140, 0.2], 0.85, 0.95)));
  air.push(A(cone([0, 140, 0.2], [0, 133.6, -0.9], 0.95, 0.85), 0.3));
  air.push(A(ellipsoid([0, 153.6, 2.4], [0.8, 1.6, 0.9]), 0.4));
  for (const s of [-1, 1]) air.push(A(cone([0, 133.6, -0.9], [s * 4.3, 130.3 + (s < 0 ? 0.6 : 0), -1.1], 0.75, 0.55), 0.3));
  soft(air, 0.25, -0.03);
  soft([A(ellipsoid([5.4, 115.8, 1.0], [3.6, 2.2, 3.0]))], 0.4, -0.028);
  // сердце чуть плотнее
  soft([A(ellipsoid([1.6, 121.6, 3.0], [6.6, 5.8, 5.4], basis([0.35, 1, 0], [0, 0, 1])))], 0.5, 0.012);
}

// сосудистый рисунок лёгких (ветвящиеся трубочки)
function lungVessels() {
  const r = mulberry(2024);
  for (const s of [-1, 1]) {
    const grow = (p: V3, dir: V3, rad: number, len: number, depth: number) => {
      const pts: V3[] = [p];
      let q = p, d = dir;
      const steps = 5;
      for (let i = 0; i < steps; i++) {
        d = norm3(add3(d, [(r() - 0.5) * 0.35, (r() - 0.5) * 0.35, (r() - 0.5) * 0.35]));
        q = add3(q, mul3(d, len / steps));
        pts.push(q);
      }
      const sm = spline(pts, 14);
      const rs = sm.map((_, k) => rad * (1 - 0.35 * (k / 13)));
      push(sweep(sm, sm.map(() => [0, 1, 0] as V3), rs, rs, 6), [0, 0.07, 0]);
      if (depth > 0) {
        const n = depth > 2 ? 3 : 2;
        for (let b = 0; b < n; b++) {
          const nd = norm3(add3(d, [(r() - 0.5) * 1.2, (r() - 0.5) * 1.2, (r() - 0.5) * 0.8]));
          grow(q, nd, rad * 0.68, len * 0.72, depth - 1);
        }
      }
    };
    const hil: V3 = [s * 4.4, 130.5, -0.6];
    const dirs: V3[] = [[s * 0.4, 1, 0], [s * 1, 0.25, 0.1], [s * 0.7, -0.8, 0.2], [s * 0.6, -0.4, -0.5], [s * 0.8, 0.6, -0.3]];
    dirs.forEach((d) => grow(hil, norm3(d), 0.32, 4.6, 3));
  }
}

// =============== НЕРВ: путь вируса и окружающие стволы ===============
export const NERVE = (() => {
  const s = -1;
  const hf = handFrame(s), at = hf.at;
  const E = ELBOW(s), H = SHOULDER_H(s);
  const ctrl: V3[] = [
    at(6.3, 0.75, -1.35), at(5.0, 0.6, -0.65), at(3.2, 0.15, 0.6), at(1.2, 0.2, 1.05), at(-1.5, 0.35, 1.25),
    at(-7, 0.1, 1.45), at(-13, -0.15, 1.5), at(-19, -0.3, 1.4), at(-23.0, -0.7, 1.7),
    add3(E, [-s * 1.2, 1.2, 2.2]),
    add3(lerp3(E, H, 0.3), [-s * 1.9, 0, 1.0]), add3(lerp3(E, H, 0.6), [-s * 2.1, 0, 0.8]), add3(lerp3(E, H, 0.83), [-s * 2.7, 0, 0.6]),
    [s * 13.0, 135.6, 0.2], [s * 11.0, 139.6, 0.6], [s * 8.8, 142.7, 1.2], [s * 6.4, 145.6, 0.2], [s * 4.4, 148.1, -1.0],
    [s * 2.4, 150.0, -2.6], [s * 0.9, 150.6, canalZ(150.6)],
  ];
  for (let y = 152.5; y <= 161.0; y += 2.1) ctrl.push([0, y, canalZ(y)]);
  ctrl.push([0, 162.6, -3.75], [0, 164.2, -3.2], [0, 165.7, -2.5], [0, 167.2, -2.0], [0, 168.6, -1.7]);
  const main = spline(ctrl, 900);
  const L = [0];
  for (let i = 1; i < main.length; i++) L.push(L[i - 1] + len3(sub3(main[i], main[i - 1])));
  const total = L[L.length - 1];
  // где начинается спинной мозг (для толщины трубки)
  let cordU = 0;
  for (let i = 0; i < main.length; i++) if (Math.abs(main[i][0]) < 0.95 && main[i][1] > 150) { cordU = L[i] / total; break; }
  // боковые стволы (не заражены)
  const side: V3[][] = [];
  for (const sd of [-1, 1]) {
    // сплетение: корни C5..T1
    const roots = [[153.3, 0], [151.4, 0], [149.4, 0], [147.4, 0], [145.4, 0]];
    roots.forEach(([y], k) => {
      const trunkJoin: V3 = k < 2 ? [sd * 6.0, 147.0, -0.4] : k === 2 ? [sd * 6.3, 146.0, -0.2] : [sd * 6.6, 144.8, -0.3];
      side.push(spline([[sd * 0.8, y + 0.3, canalZ(y)], [sd * 2.3, y, canalZ(y) + 0.9], lerp3([sd * 2.3, y, -1.8], trunkJoin, 0.5), trunkJoin, [sd * 9.0, 142.4, 1.0], [sd * 11.2, 139.4, 0.5]], 60));
    });
  }
  // спинной мозг вниз
  const cord: V3[] = [];
  for (let y = 151.2; y >= 118; y -= 2.0) cord.push([0, y, canalZ(y)]);
  side.push(spline(cord, 60));
  // правые: локтевой и лучевой нервы, пальцевые ветви срединного
  side.push(spline([[s * 13.0, 135.6, 0.0], add3(lerp3(E, H, 0.7), [-s * 2.4, 0, -0.6]), add3(lerp3(E, H, 0.3), [-s * 2.4, 0, -1.0]), add3(E, [-s * 3.1, 0.3, -1.5]), add3(E, [-s * 2.4, -3.0, 0.4]), at(-12, -1.9, 1.0), at(-1, -1.95, 1.0), at(3, -1.6, 1.0), at(9, -2.7, 0.9), at(14, -3.1, 1.3)], 120));
  side.push(spline([[s * 13.0, 135.6, 0.0], add3(lerp3(E, H, 0.7), [s * 0.6, 0, -1.8]), add3(lerp3(E, H, 0.45), [s * 1.8, 0, -0.6]), add3(lerp3(E, H, 0.2), [s * 2.0, 0, 1.0]), add3(E, [s * 2.0, 0.5, 1.6]), add3(E, [s * 2.2, -4, 1.0]), at(-12, 1.9, 0.0), at(-2, 2.4, -0.5), at(4, 3.2, -0.6), at(8, 4.2, -0.4)], 120));
  for (const f of [FINGERS[1], FINGERS[2], FINGERS[3], FINGERS[0]]) {
    const j = f.joints;
    side.push(spline([at(1.2, 0.2, 1.05), at(3.5, 0, 1.2), add3(lerp3(j[0], j[1], 0.7), mul3(hf.n, 0.9)), add3(j[2], mul3(hf.n, 0.8)), add3(j[j.length - 1], mul3(hf.n, 0.5))], 50));
  }
  return { main, L, total, cordU, side };
})();

export const nerveAt = (p: number): V3 => {
  const { main, L, total } = NERVE;
  const d = Math.min(1, Math.max(0, p)) * total;
  let lo = 0, hi = L.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m; else hi = m; }
  const t = (d - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
  return lerp3(main[lo], main[hi], t);
};

export const BITE = (() => {
  const hf = handFrame(-1);
  return { c: hf.at(6.3, 0.75, -1.55), n: mul3(hf.n, -1), d: hf.d, l: hf.l };
})();

// =============== СБОРКА ===============
let built: { parts: Part[]; ms: number } | null = null;
export function buildAnatomy() {
  if (built) return built;
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  VERTS.forEach(vertebra);
  pelvis();
  skull();
  ribs();
  for (const s of [-1, 1]) { scapula(s); humerus(s); forearm(s); }
  hand();
  softTissue();
  lungVessels();
  const ms = (typeof performance !== "undefined" ? performance.now() : Date.now()) - t0;
  built = { parts: parts.slice(), ms };
  return built;
}

// Мозг — эмиссионная поверхность для вспышки
export function buildBrain(): MeshData {
  const o: Op[] = [];
  const gyri: Prim = (() => {
    const e = ellipsoid([0, 168.7, -1.9], [6.5, 6.0, 8.3]);
    return { b: e.b, f: (x, y, z) => e.f(x, y, z) + 0.22 * Math.sin(x * 1.9 + Math.sin(z * 0.7) * 2) * Math.sin(y * 2.1 + z * 0.4) + 0.12 * Math.sin(z * 2.6 + y) };
  })();
  o.push(A(gyri));
  o.push(S(rbox([0, 172, -1.9], [0.12, 5, 9], 0.05), 0.4));
  o.push(A(ellipsoid([0, 162.9, -6.0], [4.4, 2.5, 3.0]), 0.6));
  o.push(A(cone([0, 165, -2.4], [0, 159.8, -3.4], 1.25, 0.85), 0.8));
  const g = new Grid(bboxOf(o, 1.2), 0.3);
  for (const op of o) g.apply(op);
  return g.mesh(0);
}
