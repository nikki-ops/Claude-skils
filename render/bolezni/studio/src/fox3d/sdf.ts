// Signed-distance modelling + Surface Nets mesher + automatic skin weights.
// Everything is deterministic and runs once per browser tab (results are cached by callers).
export type V3 = [number, number, number];

export interface Prim {
  t: "e" | "c"; // ellipsoid | round cone (capsule with two radii)
  bone: number;
  k?: number; // smooth-union / smooth-subtract radius
  sub?: boolean; // subtract from the field so far
  noW?: boolean; // do not use for skin weights
  c?: V3; r?: V3; rot?: V3; // ellipsoid centre, radii, euler XYZ
  a?: V3; b?: V3; ra?: number; rb?: number; // round cone
  sq?: { o: V3; n: V3; s: number }; // flatten along axis n around point o (s<1)
}

type F3 = (x: number, y: number, z: number) => number;

const eulerMat = (e: V3) => {
  const [a, b, c] = e;
  const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b), cc = Math.cos(c), sc = Math.sin(c);
  // R = Rx(a) * Ry(b) * Rz(c)  (three.js 'XYZ')
  return [
    cb * cc, -cb * sc, sb,
    ca * sc + sa * sb * cc, ca * cc - sa * sb * sc, -sa * cb,
    sa * sc - ca * sb * cc, sa * cc + ca * sb * sc, ca * cb,
  ];
};

const compilePrim = (p: Prim): F3 => {
  let f: F3;
  if (p.t === "e") {
    const [cx, cy, cz] = p.c!, [rx, ry, rz] = p.r!;
    const m = p.rot ? eulerMat(p.rot) : null;
    f = (x, y, z) => {
      let px = x - cx, py = y - cy, pz = z - cz;
      if (m) {
        // local = R^T * p
        const lx = m[0] * px + m[3] * py + m[6] * pz;
        const ly = m[1] * px + m[4] * py + m[7] * pz;
        const lz = m[2] * px + m[5] * py + m[8] * pz;
        px = lx; py = ly; pz = lz;
      }
      const ax = px / rx, ay = py / ry, az = pz / rz;
      const k0 = Math.sqrt(ax * ax + ay * ay + az * az);
      const bx = ax / rx, by = ay / ry, bz = az / rz;
      const k1 = Math.sqrt(bx * bx + by * by + bz * bz);
      if (k1 < 1e-9) return -Math.min(rx, ry, rz);
      return (k0 * (k0 - 1)) / k1;
    };
  } else {
    const [ax, ay, az] = p.a!, [bx, by, bz] = p.b!;
    const r1 = p.ra!, r2 = p.rb!;
    const bax = bx - ax, bay = by - ay, baz = bz - az;
    const l2 = bax * bax + bay * bay + baz * baz;
    const rr = r1 - r2;
    const a2 = l2 - rr * rr;
    const il2 = 1 / l2;
    f = (x, y, z) => {
      const pax = x - ax, pay = y - ay, paz = z - az;
      const yy = pax * bax + pay * bay + paz * baz;
      const zz = yy - l2;
      const qx = pax * l2 - bax * yy, qy = pay * l2 - bay * yy, qz = paz * l2 - baz * yy;
      const x2 = qx * qx + qy * qy + qz * qz;
      const y2 = yy * yy * l2;
      const z2 = zz * zz * l2;
      const k = Math.sign(rr) * rr * rr * x2;
      if (Math.sign(zz) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
      if (Math.sign(yy) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
      return (Math.sqrt(x2 * a2 * il2) + yy * rr) * il2 - r1;
    };
  }
  if (p.sq) {
    const [ox, oy, oz] = p.sq.o;
    let [nx, ny, nz] = p.sq.n;
    const nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
    const s = p.sq.s, g = 1 / s - 1;
    const inner = f;
    f = (x, y, z) => {
      const d = (x - ox) * nx + (y - oy) * ny + (z - oz) * nz;
      return inner(x + nx * d * g, y + ny * d * g, z + nz * d * g) * s;
    };
  }
  return f;
};

const smin = (a: number, b: number, k: number) => {
  if (k <= 0) return a < b ? a : b;
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

export interface SDFModel {
  field: F3;
  bones: (x: number, y: number, z: number, out: Float64Array) => void;
  nb: number;
}

export const compileModel = (prims: Prim[], nb: number): SDFModel => {
  const fs = prims.map(compilePrim);
  const n = prims.length;
  const ks = prims.map((p) => p.k ?? 0), subs = prims.map((p) => !!p.sub), bs = prims.map((p) => p.bone), nw = prims.map((p) => !!p.noW);
  const field: F3 = (x, y, z) => {
    let d = 1e9;
    for (let i = 0; i < n; i++) {
      const v = fs[i](x, y, z);
      if (subs[i]) d = -smin(-d, v, ks[i]);
      else d = smin(d, v, ks[i]);
    }
    return d;
  };
  const bones = (x: number, y: number, z: number, out: Float64Array) => {
    out.fill(1e9);
    for (let i = 0; i < n; i++) {
      if (subs[i] || nw[i]) continue;
      const v = fs[i](x, y, z);
      if (v < out[bs[i]]) out[bs[i]] = v;
    }
  };
  return { field, bones, nb };
};

export interface MeshData {
  pos: Float32Array;
  nrm: Float32Array;
  index: Uint32Array;
}

// Surface Nets over a narrow band; vertices are then projected onto the true surface.
export const meshSDF = (field: F3, bmin: V3, bmax: V3, h: number): MeshData => {
  const nx = Math.ceil((bmax[0] - bmin[0]) / h) + 1;
  const ny = Math.ceil((bmax[1] - bmin[1]) / h) + 1;
  const nz = Math.ceil((bmax[2] - bmin[2]) / h) + 1;
  const sy = nx, sz = nx * ny;
  const F = new Float32Array(nx * ny * nz);
  const B = 8;
  const half = B * h * 0.5;
  const far = Math.sqrt(3) * half * 1.4 + 2 * h;
  for (let bz = 0; bz < nz; bz += B)
    for (let by = 0; by < ny; by += B)
      for (let bx = 0; bx < nx; bx += B) {
        const ex = Math.min(bx + B, nx), ey = Math.min(by + B, ny), ez = Math.min(bz + B, nz);
        const cx = bmin[0] + (bx + (ex - bx - 1) / 2) * h;
        const cy = bmin[1] + (by + (ey - by - 1) / 2) * h;
        const cz = bmin[2] + (bz + (ez - bz - 1) / 2) * h;
        const dc = field(cx, cy, cz);
        if (Math.abs(dc) > far) {
          for (let z = bz; z < ez; z++) for (let y = by; y < ey; y++) for (let x = bx; x < ex; x++) F[x + y * sy + z * sz] = dc;
        } else {
          for (let z = bz; z < ez; z++) {
            const wz = bmin[2] + z * h;
            for (let y = by; y < ey; y++) {
              const wy = bmin[1] + y * h;
              for (let x = bx; x < ex; x++) F[x + y * sy + z * sz] = field(bmin[0] + x * h, wy, wz);
            }
          }
        }
      }

  const cellV = new Int32Array(nx * ny * nz).fill(-1);
  const P: number[] = [];
  const Q: number[] = [];
  const g = new Float32Array(8);
  const EDGES = [
    [0, 1], [2, 3], [4, 5], [6, 7],
    [0, 2], [1, 3], [4, 6], [5, 7],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  const strides = [1, sy, sz];
  const co = [0, 0, 0];
  for (let z = 0; z < nz - 1; z++)
    for (let y = 0; y < ny - 1; y++)
      for (let x = 0; x < nx - 1; x++) {
        const i0 = x + y * sy + z * sz;
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const v = F[i0 + (c & 1) + ((c >> 1) & 1) * sy + ((c >> 2) & 1) * sz];
          g[c] = v;
          if (v < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let sx = 0, syy = 0, szz = 0, cnt = 0;
        for (const [a, b] of EDGES) {
          const ga = g[a], gb = g[b];
          if (ga < 0 === gb < 0) continue;
          const t = ga / (ga - gb);
          const ax = a & 1, ay = (a >> 1) & 1, az = (a >> 2) & 1;
          const bx = b & 1, by = (b >> 1) & 1, bz = (b >> 2) & 1;
          sx += ax + (bx - ax) * t; syy += ay + (by - ay) * t; szz += az + (bz - az) * t;
          cnt++;
        }
        cellV[i0] = P.length / 3;
        P.push(bmin[0] + (x + sx / cnt) * h, bmin[1] + (y + syy / cnt) * h, bmin[2] + (z + szz / cnt) * h);
        co[0] = x; co[1] = y; co[2] = z;
        for (let i = 0; i < 3; i++) {
          const inA = mask & 1, inB = (mask >> (1 << i)) & 1;
          if (inA === inB) continue;
          const iu = (i + 1) % 3, iv = (i + 2) % 3;
          if (co[iu] === 0 || co[iv] === 0) continue;
          const c0 = i0, c1 = i0 - strides[iu], c2 = i0 - strides[iu] - strides[iv], c3 = i0 - strides[iv];
          Q.push(cellV[c0], cellV[c1], cellV[c2], cellV[c3]);
        }
      }

  const nv = P.length / 3;
  const pos = new Float32Array(P);
  const grad = (x: number, y: number, z: number, out: number[]) => {
    const e = h * 0.35;
    out[0] = field(x + e, y, z) - field(x - e, y, z);
    out[1] = field(x, y + e, z) - field(x, y - e, z);
    out[2] = field(x, y, z + e) - field(x, y, z - e);
    const l = Math.hypot(out[0], out[1], out[2]) || 1;
    out[0] /= l; out[1] /= l; out[2] /= l;
  };
  const gr = [0, 0, 0];
  // project onto the surface (2 Newton steps), clamp the move to one voxel
  for (let it = 0; it < 2; it++)
    for (let i = 0; i < nv; i++) {
      const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
      const d = field(x, y, z);
      grad(x, y, z, gr);
      const m = Math.max(-h, Math.min(h, d));
      pos[i * 3] -= gr[0] * m; pos[i * 3 + 1] -= gr[1] * m; pos[i * 3 + 2] -= gr[2] * m;
    }
  const nrm = new Float32Array(nv * 3);
  for (let i = 0; i < nv; i++) {
    grad(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], gr);
    nrm[i * 3] = gr[0]; nrm[i * 3 + 1] = gr[1]; nrm[i * 3 + 2] = gr[2];
  }
  // triangulate quads along the shorter diagonal and orient with the gradient
  const idx: number[] = [];
  const pushTri = (a: number, b: number, c: number) => {
    const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
    const ux = pos[b * 3] - ax, uy = pos[b * 3 + 1] - ay, uz = pos[b * 3 + 2] - az;
    const vx = pos[c * 3] - ax, vy = pos[c * 3 + 1] - ay, vz = pos[c * 3 + 2] - az;
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    const s = fx * (nrm[a * 3] + nrm[b * 3] + nrm[c * 3]) + fy * (nrm[a * 3 + 1] + nrm[b * 3 + 1] + nrm[c * 3 + 1]) + fz * (nrm[a * 3 + 2] + nrm[b * 3 + 2] + nrm[c * 3 + 2]);
    if (s >= 0) idx.push(a, b, c);
    else idx.push(a, c, b);
  };
  const d2 = (a: number, b: number) => {
    const dx = pos[a * 3] - pos[b * 3], dy = pos[a * 3 + 1] - pos[b * 3 + 1], dz = pos[a * 3 + 2] - pos[b * 3 + 2];
    return dx * dx + dy * dy + dz * dz;
  };
  for (let q = 0; q < Q.length; q += 4) {
    const a = Q[q], b = Q[q + 1], c = Q[q + 2], d = Q[q + 3];
    if (d2(a, c) < d2(b, d)) { pushTri(a, b, c); pushTri(a, c, d); }
    else { pushTri(a, b, d); pushTri(b, c, d); }
  }
  return { pos, nrm, index: new Uint32Array(idx) };
};

// Skin weights from per-bone distances: softmax(-(d_b - d_min)/k), top 4.
export const skinWeights = (model: SDFModel, pos: Float32Array, k: number, override?: (i: number, x: number, y: number, z: number, dist: Float64Array) => void) => {
  const nv = pos.length / 3;
  const si = new Uint16Array(nv * 4);
  const sw = new Float32Array(nv * 4);
  const dist = new Float64Array(model.nb);
  const order: number[] = [];
  for (let i = 0; i < nv; i++) {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    model.bones(x, y, z, dist);
    if (override) override(i, x, y, z, dist);
    let dm = 1e9;
    for (let b = 0; b < model.nb; b++) if (dist[b] < dm) dm = dist[b];
    order.length = 0;
    for (let b = 0; b < model.nb; b++) if (dist[b] < dm + k * 6) order.push(b);
    order.sort((p, q) => dist[p] - dist[q]);
    let tot = 0;
    for (let j = 0; j < 4; j++) {
      if (j < order.length) {
        const w = Math.exp(-(dist[order[j]] - dm) / k);
        si[i * 4 + j] = order[j]; sw[i * 4 + j] = w; tot += w;
      } else { si[i * 4 + j] = order[0]; sw[i * 4 + j] = 0; }
    }
    for (let j = 0; j < 4; j++) sw[i * 4 + j] /= tot;
  }
  return { si, sw };
};
