// SDF-моделирование + собственный Surface Nets меш-генератор + свип-трубки.
// Всё детерминированно, без three.js (чистые массивы) — чтобы быстро считаться при загрузке модуля.

export type V3 = [number, number, number];
export type BBox = [number, number, number, number, number, number];
export interface Prim {
  b: BBox;
  f: (x: number, y: number, z: number) => number;
}

export const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub3 = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul3 = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const dot3 = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross3 = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len3 = (a: V3) => Math.sqrt(dot3(a, a));
export const norm3 = (a: V3): V3 => mul3(a, 1 / (len3(a) || 1));
export const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

export const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return Math.min(a, b);
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
export const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

const boxOf = (pts: V3[], r: number): BBox => {
  const b: BBox = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const p of pts) for (let i = 0; i < 3; i++) {
    b[i] = Math.min(b[i], p[i] - r);
    b[i + 3] = Math.max(b[i + 3], p[i] + r);
  }
  return b;
};

export const sphere = (c: V3, r: number): Prim => ({
  b: boxOf([c], r),
  f: (x, y, z) => Math.sqrt((x - c[0]) ** 2 + (y - c[1]) ** 2 + (z - c[2]) ** 2) - r,
});

// Round cone (IQ): сферы r1 в a и r2 в b, соединённые касательным конусом
export const cone = (a: V3, b: V3, r1: number, r2: number): Prim => {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  let rr = r1 - r2;
  if (rr * rr >= l2 * 0.98) rr = Math.sign(rr) * Math.sqrt(l2) * 0.98;
  const a2 = l2 - rr * rr, il2 = 1 / l2, sr = Math.sign(rr);
  return {
    b: boxOf([a, b], Math.max(r1, r2)),
    f: (x, y, z) => {
      const pax = x - a[0], pay = y - a[1], paz = z - a[2];
      const yy = pax * bax + pay * bay + paz * baz;
      const zz = yy - l2;
      const qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy;
      const x2 = qx * qx + qy * qy + qz * qz;
      const y2 = yy * yy * l2, z2 = zz * zz * l2;
      const k = sr * rr * rr * x2;
      if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
      if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
      return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
    },
  };
};
export const capsule = (a: V3, b: V3, r: number) => cone(a, b, r, r);

// Ортонормированный базис из «главной» оси и подсказки
export const basis = (ey: V3, hint: V3 = [0, 0, 1]): [V3, V3, V3] => {
  const y = norm3(ey);
  let x = cross3(y, hint);
  if (len3(x) < 1e-4) x = cross3(y, [1, 0, 0]);
  x = norm3(x);
  const z = cross3(x, y);
  return [x, y, z];
};

// Эллипсоид с произвольной ориентацией (оси ex,ey,ez — единичные), приближение IQ
export const ellipsoid = (c: V3, r: V3, ax?: [V3, V3, V3]): Prim => {
  const [ex, ey, ez] = ax || [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const ext = [0, 1, 2].map((i) => Math.sqrt((ex[i] * r[0]) ** 2 + (ey[i] * r[1]) ** 2 + (ez[i] * r[2]) ** 2));
  return {
    b: [c[0] - ext[0], c[1] - ext[1], c[2] - ext[2], c[0] + ext[0], c[1] + ext[1], c[2] + ext[2]],
    f: (x, y, z) => {
      const px = x - c[0], py = y - c[1], pz = z - c[2];
      const lx = (px * ex[0] + py * ex[1] + pz * ex[2]), ly = (px * ey[0] + py * ey[1] + pz * ey[2]), lz = (px * ez[0] + py * ez[1] + pz * ez[2]);
      const k0 = Math.sqrt((lx / r[0]) ** 2 + (ly / r[1]) ** 2 + (lz / r[2]) ** 2);
      const k1 = Math.sqrt((lx / (r[0] * r[0])) ** 2 + (ly / (r[1] * r[1])) ** 2 + (lz / (r[2] * r[2])) ** 2);
      return k1 < 1e-9 ? -Math.min(r[0], r[1], r[2]) : (k0 * (k0 - 1)) / k1;
    },
  };
};

// Оболочка эллипсоида (свод черепа): |sdf| - th
export const shell = (c: V3, r: V3, th: number, ax?: [V3, V3, V3]): Prim => {
  const e = ellipsoid(c, r, ax);
  return { b: [e.b[0] - th, e.b[1] - th, e.b[2] - th, e.b[3] + th, e.b[4] + th, e.b[5] + th], f: (x, y, z) => Math.abs(e.f(x, y, z)) - th };
};

// Тор: центр, нормаль плоскости кольца, радиусы; sx/sy — эллиптичность кольца по осям плоскости
export const torus = (c: V3, n: V3, R: number, r: number, hint: V3 = [0, 1, 0], sx = 1, sy = 1): Prim => {
  const [ex, ez, ey] = basis(n, hint); // ez == n
  const m = R * Math.max(sx, sy) + r;
  return {
    b: [c[0] - m, c[1] - m, c[2] - m, c[0] + m, c[1] + m, c[2] + m],
    f: (x, y, z) => {
      const px = x - c[0], py = y - c[1], pz = z - c[2];
      const lx = (px * ex[0] + py * ex[1] + pz * ex[2]) / sx, ly = (px * ey[0] + py * ey[1] + pz * ey[2]) / sy, ln = px * ez[0] + py * ez[1] + pz * ez[2];
      const q = Math.sqrt(lx * lx + ly * ly) - R;
      return Math.sqrt(q * q + ln * ln) - r;
    },
  };
};

// Скруглённый ориентированный бокс
export const rbox = (c: V3, half: V3, round: number, ax?: [V3, V3, V3]): Prim => {
  const [ex, ey, ez] = ax || [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const hr: V3 = [half[0] + round, half[1] + round, half[2] + round];
  const ext = [0, 1, 2].map((i) => Math.abs(ex[i]) * hr[0] + Math.abs(ey[i]) * hr[1] + Math.abs(ez[i]) * hr[2]);
  return {
    b: [c[0] - ext[0], c[1] - ext[1], c[2] - ext[2], c[0] + ext[0], c[1] + ext[1], c[2] + ext[2]],
    f: (x, y, z) => {
      const px = x - c[0], py = y - c[1], pz = z - c[2];
      const qx = Math.abs(px * ex[0] + py * ex[1] + pz * ex[2]) - half[0];
      const qy = Math.abs(px * ey[0] + py * ey[1] + pz * ey[2]) - half[1];
      const qz = Math.abs(px * ez[0] + py * ez[1] + pz * ez[2]) - half[2];
      const o = Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2 + Math.max(qz, 0) ** 2);
      return o + Math.min(Math.max(qx, qy, qz), 0) - round;
    },
  };
};

// Пластина-треугольник толщиной r (лопатка, крылья таза)
export const tri = (a: V3, b: V3, c: V3, r: number): Prim => {
  const ba = sub3(b, a), cb = sub3(c, b), ac = sub3(a, c);
  const nor = cross3(ba, ac);
  const d2 = (v: V3) => dot3(v, v);
  const cl = (v: number) => Math.min(1, Math.max(0, v));
  const s1 = cross3(ba, nor), s2 = cross3(cb, nor), s3 = cross3(ac, nor);
  const nn = d2(nor);
  return {
    b: boxOf([a, b, c], r),
    f: (x, y, z) => {
      const p: V3 = [x, y, z];
      const pa = sub3(p, a), pb = sub3(p, b), pc = sub3(p, c);
      const sgn = Math.sign(dot3(s1, pa)) + Math.sign(dot3(s2, pb)) + Math.sign(dot3(s3, pc));
      let dd: number;
      if (sgn < 2) {
        dd = Math.min(
          d2(sub3(mul3(ba, cl(dot3(ba, pa) / d2(ba))), pa)),
          d2(sub3(mul3(cb, cl(dot3(cb, pb) / d2(cb))), pb)),
          d2(sub3(mul3(ac, cl(dot3(ac, pc) / d2(ac))), pc)),
        );
      } else dd = (dot3(nor, pa) * dot3(nor, pa)) / nn;
      return Math.sqrt(dd) - r;
    },
  };
};

// Полупространство: внутри там, где (p-o)·n < 0
export const plane = (o: V3, n: V3): Prim => {
  const nn = norm3(n);
  return { b: [-1e9, -1e9, -1e9, 1e9, 1e9, 1e9], f: (x, y, z) => (x - o[0]) * nn[0] + (y - o[1]) * nn[1] + (z - o[2]) * nn[2] };
};

// Цепочка конусов по точкам с радиусами
export const chain = (pts: V3[], rs: number[]): Prim[] => {
  const out: Prim[] = [];
  for (let i = 0; i < pts.length - 1; i++) out.push(cone(pts[i], pts[i + 1], rs[i], rs[i + 1]));
  return out;
};

// ---------------- Сетка и Surface Nets ----------------
export type Op = { t: "add" | "sub" | "int"; p: Prim; k?: number };

export interface MeshData {
  pos: Float32Array;
  idx: Uint32Array;
}

export class Grid {
  nx: number; ny: number; nz: number; ox: number; oy: number; oz: number; h: number;
  v: Float32Array;
  constructor(b: BBox, h: number) {
    this.h = h;
    this.ox = b[0]; this.oy = b[1]; this.oz = b[2];
    this.nx = Math.max(3, Math.ceil((b[3] - b[0]) / h) + 1);
    this.ny = Math.max(3, Math.ceil((b[4] - b[1]) / h) + 1);
    this.nz = Math.max(3, Math.ceil((b[5] - b[2]) / h) + 1);
    this.v = new Float32Array(this.nx * this.ny * this.nz).fill(1e3);
  }
  private range(b: BBox | null, m: number) {
    const { nx, ny, nz, ox, oy, oz, h } = this;
    if (!b) return [0, nx - 1, 0, ny - 1, 0, nz - 1];
    const c = (v: number, n: number) => Math.min(n - 1, Math.max(0, v));
    return [
      c(Math.floor((b[0] - m - ox) / h), nx), c(Math.ceil((b[3] + m - ox) / h), nx),
      c(Math.floor((b[1] - m - oy) / h), ny), c(Math.ceil((b[4] + m - oy) / h), ny),
      c(Math.floor((b[2] - m - oz) / h), nz), c(Math.ceil((b[5] + m - oz) / h), nz),
    ];
  }
  apply(op: Op) {
    const k = op.k || 0;
    const { nx, ny, ox, oy, oz, h, v } = this;
    const [i0, i1, j0, j1, k0, k1] = this.range(op.t === "int" ? null : op.p.b, k + 3 * h);
    const f = op.p.f;
    for (let kk = k0; kk <= k1; kk++) {
      const z = oz + kk * h;
      for (let j = j0; j <= j1; j++) {
        const y = oy + j * h;
        let id = i0 + nx * (j + ny * kk);
        for (let i = i0; i <= i1; i++, id++) {
          const x = ox + i * h;
          const d = f(x, y, z);
          const a = v[id];
          if (op.t === "add") v[id] = k > 0 ? smin(a, d, k) : Math.min(a, d);
          else if (op.t === "sub") v[id] = k > 0 ? smax(a, -d, k) : Math.max(a, -d);
          else v[id] = k > 0 ? smax(a, d, k) : Math.max(a, d);
        }
      }
    }
  }
  // Извлечь изоповерхность: field = v + off(x,y,z) - iso  (off — переменная толщина кортикала)
  mesh(iso: number, off?: (x: number, y: number, z: number) => number): MeshData {
    const { nx, ny, nz, ox, oy, oz, h } = this;
    let f = this.v;
    if (off || iso !== 0) {
      f = new Float32Array(this.v.length);
      let id = 0;
      for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++, id++) {
        f[id] = this.v[id] - iso + (off ? off(ox + i * h, oy + j * h, oz + k * h) : 0);
      }
    }
    return surfaceNets(f, nx, ny, nz, ox, oy, oz, h);
  }
}

const CORNERS = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
const EDGES: [number, number][] = [];
for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) {
  const d = Math.abs(CORNERS[a][0] - CORNERS[b][0]) + Math.abs(CORNERS[a][1] - CORNERS[b][1]) + Math.abs(CORNERS[a][2] - CORNERS[b][2]);
  if (d === 1) EDGES.push([a, b]);
}

export function surfaceNets(f: Float32Array, nx: number, ny: number, nz: number, ox: number, oy: number, oz: number, h: number): MeshData {
  const cx = nx - 1, cy = ny - 1, cz = nz - 1;
  const cell = new Int32Array(cx * cy * cz).fill(-1);
  const pos: number[] = [];
  const idx: number[] = [];
  const c = new Float64Array(8);
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let q = 0; q < 8; q++) {
      const cc = CORNERS[q];
      const val = f[i + cc[0] + nx * (j + cc[1] + ny * (k + cc[2]))];
      c[q] = val;
      if (val < 0) mask |= 1 << q;
    }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of EDGES) {
      const va = c[a], vb = c[b];
      if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb);
      const A = CORNERS[a], B = CORNERS[b];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t;
      n++;
    }
    cell[i + cx * (j + cy * k)] = pos.length / 3;
    pos.push(ox + (i + sx / n) * h, oy + (j + sy / n) * h, oz + (k + sz / n) * h);
  }
  const C = (i: number, j: number, k: number) => cell[i + cx * (j + cy * k)];
  const quad = (a: number, b: number, c2: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c2 < 0 || d < 0) return;
    if (!flip) idx.push(a, b, c2, a, c2, d);
    else idx.push(a, c2, b, a, d, c2);
  };
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v0 = f[i + nx * (j + ny * k)];
    const in0 = v0 < 0;
    // ребро по x
    if (i < nx - 1 && j > 0 && k > 0 && j < ny - 1 && k < nz - 1) {
      const v1 = f[i + 1 + nx * (j + ny * k)];
      if (in0 !== v1 < 0) quad(C(i, j - 1, k - 1), C(i, j, k - 1), C(i, j, k), C(i, j - 1, k), !in0);
    }
    if (j < ny - 1 && i > 0 && k > 0 && i < nx - 1 && k < nz - 1) {
      const v1 = f[i + nx * (j + 1 + ny * k)];
      if (in0 !== v1 < 0) quad(C(i - 1, j, k - 1), C(i - 1, j, k), C(i, j, k), C(i, j, k - 1), !in0);
    }
    if (k < nz - 1 && i > 0 && j > 0 && i < nx - 1 && j < ny - 1) {
      const v1 = f[i + nx * (j + ny * (k + 1))];
      if (in0 !== v1 < 0) quad(C(i - 1, j - 1, k), C(i, j - 1, k), C(i, j, k), C(i - 1, j, k), !in0);
    }
  }
  const md = { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
  orient(md);
  return md;
}

// Гарантируем наружную ориентацию: знак объёма
export function orient(m: MeshData) {
  const { pos: p, idx: ix } = m;
  let vol = 0;
  for (let t = 0; t < ix.length; t += 3) {
    const a = ix[t] * 3, b = ix[t + 1] * 3, c = ix[t + 2] * 3;
    vol += p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c]);
  }
  if (vol < 0) for (let t = 0; t < ix.length; t += 3) { const s = ix[t + 1]; ix[t + 1] = ix[t + 2]; ix[t + 2] = s; }
  return vol / 6;
}

// Свип-трубка с эллиптическим сечением; концы закрыты вершинами-«апексами».
// pts — центры, ax — направление полуоси A в каждой точке (будет ортогонализовано), ra/rb — полуоси.
export function sweep(pts: V3[], ax: V3[], ra: number[], rb: number[], seg = 14): MeshData {
  const n = pts.length;
  const pos: number[] = [];
  const idx: number[] = [];
  const tang = (i: number) => norm3(sub3(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]));
  for (let i = 0; i < n; i++) {
    const T = tang(i);
    let A = sub3(ax[i], mul3(T, dot3(ax[i], T)));
    A = norm3(A);
    const B = cross3(T, A);
    for (let s = 0; s < seg; s++) {
      const a = (s / seg) * Math.PI * 2;
      const ca = Math.cos(a) * ra[i], sa = Math.sin(a) * rb[i];
      pos.push(pts[i][0] + A[0] * ca + B[0] * sa, pts[i][1] + A[1] * ca + B[1] * sa, pts[i][2] + A[2] * ca + B[2] * sa);
    }
  }
  for (let i = 0; i < n - 1; i++) for (let s = 0; s < seg; s++) {
    const a = i * seg + s, b = i * seg + ((s + 1) % seg), c = (i + 1) * seg + ((s + 1) % seg), d = (i + 1) * seg + s;
    idx.push(a, b, c, a, c, d);
  }
  const T0 = tang(0), T1 = tang(n - 1);
  const e0 = n * seg, e1 = n * seg + 1;
  const r0 = Math.min(ra[0], rb[0]) * 0.8, r1 = Math.min(ra[n - 1], rb[n - 1]) * 0.8;
  pos.push(pts[0][0] - T0[0] * r0, pts[0][1] - T0[1] * r0, pts[0][2] - T0[2] * r0);
  pos.push(pts[n - 1][0] + T1[0] * r1, pts[n - 1][1] + T1[1] * r1, pts[n - 1][2] + T1[2] * r1);
  for (let s = 0; s < seg; s++) {
    idx.push(e0, (s + 1) % seg, s);
    idx.push(e1, (n - 1) * seg + s, (n - 1) * seg + ((s + 1) % seg));
  }
  const md = { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
  orient(md);
  return md;
}

// Катмулл-Ром по точкам, равномерная выборка по длине
export function spline(ctrl: V3[], samples: number): V3[] {
  const dense: V3[] = [];
  const P = (i: number) => ctrl[Math.min(ctrl.length - 1, Math.max(0, i))];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let s = 0; s < 24; s++) {
      const t = s / 24, t2 = t * t, t3 = t2 * t;
      dense.push([0, 1, 2].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)) as V3);
    }
  }
  dense.push(ctrl[ctrl.length - 1]);
  const L = [0];
  for (let i = 1; i < dense.length; i++) L.push(L[i - 1] + len3(sub3(dense[i], dense[i - 1])));
  const tot = L[L.length - 1];
  const out: V3[] = [];
  let j = 0;
  for (let s = 0; s < samples; s++) {
    const d = (s / (samples - 1)) * tot;
    while (j < L.length - 2 && L[j + 1] < d) j++;
    const t = (d - L[j]) / Math.max(1e-9, L[j + 1] - L[j]);
    out.push(lerp3(dense[j], dense[j + 1], Math.min(1, Math.max(0, t))));
  }
  return out;
}
