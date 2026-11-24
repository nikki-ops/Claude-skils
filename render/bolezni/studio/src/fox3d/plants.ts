import * as THREE from "three";
import { mulberry } from "../components/rand";

// Small geometry accumulator with vertex colours (colours given in sRGB, stored linear).
export class Geo {
  pos: number[] = [];
  col: number[] = [];
  idx: number[] = [];
  vert(x: number, y: number, z: number, c: number[]) {
    this.pos.push(x, y, z);
    this.col.push(Math.pow(c[0], 2.2), Math.pow(c[1], 2.2), Math.pow(c[2], 2.2));
    return this.pos.length / 3 - 1;
  }
  grid(nu: number, nv: number, f: (u: number, v: number) => { p: THREE.Vector3; c: number[] }) {
    const base = this.pos.length / 3;
    for (let i = 0; i <= nu; i++)
      for (let j = 0; j <= nv; j++) {
        const { p, c } = f(i / nu, j / nv);
        this.vert(p.x, p.y, p.z, c);
      }
    for (let i = 0; i < nu; i++)
      for (let j = 0; j < nv; j++) {
        const a = base + i * (nv + 1) + j, b = a + nv + 1;
        this.idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
  }
  tube(pts: THREE.Vector3[], r0: number, r1: number, sides: number, c0: number[], c1 = c0) {
    const n = pts.length;
    const frames: { t: THREE.Vector3; a: THREE.Vector3; b: THREE.Vector3 }[] = [];
    let ref = new THREE.Vector3(0, 0, 1);
    for (let i = 0; i < n; i++) {
      const t = pts[Math.min(n - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize();
      if (Math.abs(t.dot(ref)) > 0.95) ref = new THREE.Vector3(1, 0, 0);
      const a = new THREE.Vector3().crossVectors(t, ref).normalize();
      const b = new THREE.Vector3().crossVectors(t, a).normalize();
      ref = b.clone();
      frames.push({ t, a, b });
    }
    this.grid(n - 1, sides, (u, v) => {
      const i = Math.round(u * (n - 1));
      const ang = v * Math.PI * 2;
      const r = r0 + (r1 - r0) * u;
      const { a, b } = frames[i];
      const p = pts[i].clone().addScaledVector(a, Math.cos(ang) * r).addScaledVector(b, Math.sin(ang) * r);
      return { p, c: [c0[0] + (c1[0] - c0[0]) * u, c0[1] + (c1[1] - c0[1]) * u, c0[2] + (c1[2] - c0[2]) * u] };
    });
  }
  // leaf blade along a bending midrib
  leaf(o: {
    base: THREE.Vector3; yaw: number; rise: number; bend: number; len: number; wid: number;
    cup?: number; ruffle?: number; twist?: number; nu?: number; nv?: number;
    shape?: (u: number) => number;
    color: (u: number, v: number) => number[];
  }) {
    const nu = o.nu ?? 10, nv = o.nv ?? 6;
    const shape = o.shape ?? ((u: number) => Math.pow(Math.sin(Math.PI * Math.pow(u, 0.75)), 0.85));
    const mid: THREE.Vector3[] = [], tans: THREE.Vector3[] = [];
    const p = o.base.clone();
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const pitch = o.rise - o.bend * u;
      const t = new THREE.Vector3(Math.cos(o.yaw) * Math.cos(pitch), Math.sin(pitch), Math.sin(o.yaw) * Math.cos(pitch));
      mid.push(p.clone()); tans.push(t);
      p.addScaledVector(t, o.len / nu);
    }
    const side0 = new THREE.Vector3(-Math.sin(o.yaw), 0, Math.cos(o.yaw));
    this.grid(nu, nv, (u, vv) => {
      const i = Math.round(u * nu);
      const v = vv * 2 - 1;
      const w = o.wid * 0.5 * shape(u);
      const tw = (o.twist ?? 0) * u;
      const side = side0.clone().applyAxisAngle(tans[i], tw);
      const nrm = new THREE.Vector3().crossVectors(side, tans[i]).normalize();
      const q = mid[i].clone().addScaledVector(side, v * w).addScaledVector(nrm, (o.cup ?? 0) * v * v * w + (o.ruffle ?? 0) * Math.sin(v * 9 + u * 23) * Math.abs(v) * Math.sqrt(u));
      return { p: q, c: o.color(u, v) };
    });
  }
  sphere(c: THREE.Vector3, r: THREE.Vector3, col: (n: THREE.Vector3) => number[], nu = 14, nv = 10, jitter = 0, rnd?: () => number) {
    const jit: number[] = [];
    this.grid(nu, nv, (u, v) => {
      const th = u * Math.PI * 2, ph = v * Math.PI;
      const n = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th));
      const k = 1 + (jitter && rnd ? (rnd() - 0.5) * jitter : 0);
      jit.push(k);
      return { p: new THREE.Vector3(c.x + n.x * r.x * k, c.y + n.y * r.y * k, c.z + n.z * r.z * k), c: col(n) };
    });
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
    g.setIndex(this.idx);
    g.computeVertexNormals();
    return g;
  }
}

const mixc = (a: number[], b: number[], t: number) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const ss = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- cabbage
export const makeCabbage = (seed: number) => {
  const r = mulberry(seed);
  const g = new Geo();
  const headR = 0.085 + r() * 0.02;
  const HEAD = [0.78, 0.86, 0.6], VEIN = [0.9, 0.93, 0.78];
  g.sphere(new THREE.Vector3(0, headR * 0.95, 0), new THREE.Vector3(headR, headR * 0.88, headR), (n) => {
    const seam = Math.pow(Math.abs(Math.sin(Math.atan2(n.z, n.x) * 2.5 + n.y * 2)), 12);
    return mixc(mixc(HEAD, [0.6, 0.74, 0.45], ss(0.6, -0.2, n.y)), VEIN, seam * 0.6);
  }, 24, 16, 0.06, r);
  // wrapper leaves hugging the head
  for (let i = 0; i < 6; i++) {
    const yaw = (i / 6) * Math.PI * 2 + r() * 0.5;
    g.leaf({
      base: new THREE.Vector3(Math.cos(yaw) * 0.02, 0.01, Math.sin(yaw) * 0.02), yaw, rise: 1.35, bend: 2.2 + r() * 0.4, len: headR * 2.3, wid: headR * 1.9, cup: -0.35, ruffle: 0.004, nu: 12, nv: 8,
      color: (u, v) => {
        const base = mixc([0.62, 0.78, 0.5], [0.8, 0.88, 0.62], u);
        const vein = Math.max(ss(0.07, 0.0, Math.abs(v)), ss(0.1, 0.0, Math.abs(((u - Math.abs(v) * 0.5) * 6) % 1 - 0.5) - 0.38) * 0.0);
        return mixc(base, VEIN, vein * 0.8);
      },
    });
  }
  // outer spreading leaves, glaucous blue-green with pale veins
  const n = 8 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const yaw = (i / n) * Math.PI * 2 + r() * 0.4;
    const old = r() < 0.25;
    const len = 0.2 + r() * 0.08;
    g.leaf({
      base: new THREE.Vector3(Math.cos(yaw) * 0.03, 0.015 + r() * 0.02, Math.sin(yaw) * 0.03), yaw,
      rise: old ? 0.35 : 0.75 + r() * 0.35, bend: old ? 1.0 : 1.3 + r() * 0.5, len, wid: len * (0.95 + r() * 0.2), cup: 0.28 + r() * 0.15, ruffle: 0.012, twist: (r() - 0.5) * 0.5, nu: 12, nv: 10,
      color: (u, v) => {
        let c = mixc([0.3, 0.48, 0.4], [0.42, 0.6, 0.5], u * 0.7 + r() * 0.06);
        if (old) c = mixc(c, [0.62, 0.62, 0.32], 0.45 * u);
        const mid = ss(0.06, 0.0, Math.abs(v)) * (1 - u * 0.6);
        const sv = Math.abs(((u * 1.0 - Math.abs(v) * 0.55) * 7) % 1 - 0.5);
        const side = ss(0.06, 0.0, sv) * ss(0.95, 0.4, Math.abs(v)) * 0.6;
        c = mixc(c, [0.72, 0.82, 0.7], Math.max(mid, side));
        c = mixc(c, [0.36, 0.3, 0.4], ss(0.85, 1.0, Math.abs(v)) * 0.35);
        return c;
      },
    });
  }
  return g.build();
};

// ---------------------------------------------------------------- potato bush
export const makePotato = (seed: number) => {
  const r = mulberry(seed);
  const g = new Geo();
  const stems = 6 + Math.floor(r() * 4);
  const LEAF = [0.17, 0.32, 0.11], LEAF2 = [0.24, 0.4, 0.15];
  for (let s = 0; s < stems; s++) {
    const yaw = r() * Math.PI * 2;
    const tilt = 0.25 + r() * 0.45;
    const L = 0.32 + r() * 0.2;
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 8;
      const out = Math.sin(tilt + u * 0.6) * L * u;
      pts.push(new THREE.Vector3(Math.cos(yaw) * out, Math.cos(tilt + u * 0.5) * L * u, Math.sin(yaw) * out));
    }
    g.tube(pts, 0.0055, 0.003, 5, [0.25, 0.28, 0.12], [0.22, 0.38, 0.14]);
    // compound leaves at nodes
    for (let k = 1; k <= 4; k++) {
      const node = pts[k * 2];
      const lyaw = yaw + (k % 2 ? 1 : -1) * (0.8 + r() * 0.6);
      const plen = 0.1 + r() * 0.05;
      const pp: THREE.Vector3[] = [];
      for (let i = 0; i <= 4; i++) pp.push(node.clone().add(new THREE.Vector3(Math.cos(lyaw) * plen * i / 4, 0.03 * Math.sin(i / 4 * 2.5), Math.sin(lyaw) * plen * i / 4)));
      g.tube(pp, 0.0025, 0.0015, 4, [0.2, 0.34, 0.12]);
      for (let j = 0; j < 3; j++) {
        const at = pp[1 + j];
        for (const sd of [-1, 1]) {
          g.leaf({
            base: at, yaw: lyaw + sd * (1.2 - j * 0.15), rise: 0.2 + r() * 0.3, bend: 0.6, len: 0.045 + r() * 0.02, wid: 0.03, cup: 0.15, nu: 5, nv: 3,
            shape: (u) => Math.pow(Math.sin(Math.PI * u), 0.8) * (1 - 0.3 * u),
            color: (u, v) => mixc(mixc(LEAF, LEAF2, r() * 0.6), [0.35, 0.5, 0.25], ss(0.1, 0.0, Math.abs(v)) * 0.5),
          });
        }
      }
      g.leaf({
        base: pp[4], yaw: lyaw, rise: 0.1, bend: 0.5, len: 0.06, wid: 0.038, cup: 0.15, nu: 5, nv: 3,
        shape: (u) => Math.pow(Math.sin(Math.PI * u), 0.8) * (1 - 0.3 * u),
        color: () => mixc(LEAF, LEAF2, r()),
      });
    }
    // a few flowers on top
    if (r() < 0.45) {
      const top = pts[8];
      for (let f = 0; f < 3; f++) {
        const c = top.clone().add(new THREE.Vector3((r() - 0.5) * 0.04, 0.02 + r() * 0.02, (r() - 0.5) * 0.04));
        const col = r() < 0.5 ? [0.95, 0.94, 0.98] : [0.78, 0.7, 0.92];
        for (let p = 0; p < 5; p++)
          g.leaf({ base: c, yaw: (p / 5) * Math.PI * 2, rise: 0.25, bend: 0.3, len: 0.011, wid: 0.009, nu: 2, nv: 2, color: () => col });
        g.sphere(c.clone().add(new THREE.Vector3(0, 0.003, 0)), new THREE.Vector3(0.003, 0.004, 0.003), () => [0.95, 0.8, 0.1], 5, 4);
      }
    }
  }
  return g.build();
};

// ---------------------------------------------------------------- tomato on a stake
export const makeTomato = (seed: number) => {
  const r = mulberry(seed);
  const g = new Geo();
  const H = 1.0 + r() * 0.2;
  // stake (square-ish tube)
  g.tube([new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0.005, H, 0.003)], 0.017, 0.015, 4, [0.45, 0.36, 0.25], [0.5, 0.42, 0.3]);
  const stem: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    stem.push(new THREE.Vector3(0.035 * Math.sin(u * 7 + seed), u * H * 0.92, 0.03 * Math.cos(u * 5 + seed)));
  }
  g.tube(stem, 0.008, 0.004, 5, [0.25, 0.35, 0.15], [0.3, 0.45, 0.2]);
  // ties
  for (let k = 1; k < 4; k++) {
    const y = k * 0.28;
    g.tube([new THREE.Vector3(-0.03, y, -0.025), new THREE.Vector3(0.03, y + 0.005, -0.02), new THREE.Vector3(0.035, y, 0.03), new THREE.Vector3(-0.03, y - 0.005, 0.03)], 0.004, 0.004, 4, [0.85, 0.82, 0.7]);
  }
  for (let k = 0; k < 9; k++) {
    const node = stem[1 + k];
    const yaw = k * 2.4 + r();
    const plen = 0.16 + r() * 0.08;
    const pp: THREE.Vector3[] = [];
    for (let i = 0; i <= 4; i++) pp.push(node.clone().add(new THREE.Vector3(Math.cos(yaw) * plen * i / 4, 0.05 * Math.sin(i / 4 * 2) - 0.04 * (i / 4) ** 2, Math.sin(yaw) * plen * i / 4)));
    g.tube(pp, 0.003, 0.0018, 4, [0.24, 0.38, 0.15]);
    for (let j = 1; j <= 4; j++)
      for (const sd of [-1, 1])
        g.leaf({
          base: pp[j], yaw: yaw + sd * 1.1, rise: -0.1, bend: 0.6, len: 0.05 + r() * 0.025, wid: 0.032, cup: 0.12, ruffle: 0.004, nu: 5, nv: 4,
          color: () => mixc([0.15, 0.3, 0.12], [0.22, 0.4, 0.16], r()),
        });
    // fruit trusses
    if (k > 1 && k < 7 && r() < 0.6) {
      const c0 = node.clone().add(new THREE.Vector3(Math.cos(yaw + 1.6) * 0.06, -0.06, Math.sin(yaw + 1.6) * 0.06));
      const ripe = r();
      for (let f = 0; f < 3 + Math.floor(r() * 3); f++) {
        const rad = 0.022 + r() * 0.014;
        const c = c0.clone().add(new THREE.Vector3((r() - 0.5) * 0.08, -r() * 0.06, (r() - 0.5) * 0.08));
        const col = ripe > 0.45 ? mixc([0.75, 0.1, 0.05], [0.85, 0.3, 0.08], r() * 0.5) : mixc([0.45, 0.6, 0.2], [0.75, 0.55, 0.15], r() * 0.4);
        g.sphere(c, new THREE.Vector3(rad, rad * 0.85, rad), (n) => mixc(col, [1, 0.8, 0.7], ss(0.75, 1.0, n.y) * 0.3), 10, 8);
      }
    }
  }
  return g.build();
};

// ---------------------------------------------------------------- grass tuft / onion
export const makeTuft = (seed: number, kind: "grass" | "dry" | "onion" | "weed") => {
  const r = mulberry(seed);
  const g = new Geo();
  const nb = kind === "onion" ? 7 : kind === "weed" ? 6 : 10 + Math.floor(r() * 8);
  for (let b = 0; b < nb; b++) {
    const yaw = r() * Math.PI * 2;
    const L = kind === "onion" ? 0.25 + r() * 0.15 : kind === "weed" ? 0.08 + r() * 0.06 : 0.1 + r() * 0.22;
    const lean = kind === "onion" ? 0.15 + r() * 0.35 : 0.2 + r() * 0.6;
    const base = new THREE.Vector3((r() - 0.5) * 0.04, 0, (r() - 0.5) * 0.04);
    const dry = kind === "dry" ? r() < 0.7 : kind === "grass" ? r() < 0.15 : false;
    const c0 = kind === "onion" ? [0.2, 0.35, 0.25] : dry ? [0.35, 0.3, 0.18] : [0.12, 0.22, 0.07];
    const c1 = kind === "onion" ? [0.45, 0.6, 0.5] : dry ? [0.75, 0.66, 0.42] : [0.42, 0.55, 0.2];
    if (kind === "onion") {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 6; i++) {
        const u = i / 6;
        const bend = lean * u * u;
        pts.push(base.clone().add(new THREE.Vector3(Math.cos(yaw) * bend * L, u * L * (1 - 0.3 * bend), Math.sin(yaw) * bend * L)));
      }
      g.tube(pts, 0.004, 0.0015, 5, c0, c1);
    } else if (kind === "weed") {
      g.leaf({ base, yaw, rise: 0.6, bend: 1.2, len: L, wid: 0.03, cup: 0.1, nu: 4, nv: 2, color: (u) => mixc(c0, c1, u) });
    } else {
      g.leaf({ base, yaw, rise: 1.45 - lean * 0.5, bend: lean * 1.6, len: L, wid: 0.007 + r() * 0.005, nu: 5, nv: 1, shape: (u) => 1 - u * 0.95, twist: (r() - 0.5) * 1.5, color: (u) => mixc(c0, c1, Math.pow(u, 0.8)) });
    }
  }
  return g.build();
};

// ---------------------------------------------------------------- trees
export const makeSpruce = (seed: number) => {
  const r = mulberry(seed);
  const g = new Geo();
  const H = 1;
  g.tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.3, 0)], 0.025, 0.02, 5, [0.15, 0.1, 0.07]);
  const tiers = 9;
  for (let t = 0; t < tiers; t++) {
    const u = t / tiers;
    const y0 = 0.12 + u * 0.8 * H;
    const rad = (1 - u) * 0.32 + 0.03;
    const sides = 14;
    const base = g.pos.length / 3;
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2;
      const rr = rad * (0.7 + r() * 0.5);
      g.vert(Math.cos(a) * rr, y0 - 0.02 - r() * 0.04, Math.sin(a) * rr, [0.07, 0.13, 0.08]);
    }
    const tip = g.vert(0, y0 + 0.2 * (1 - u * 0.4), 0, [0.1, 0.18, 0.1]);
    for (let i = 0; i < sides; i++) g.idx.push(base + i, tip, base + ((i + 1) % sides));
  }
  return g.build();
};

export const makeBirch = (seed: number) => {
  const r = mulberry(seed);
  const g = new Geo();
  g.tube([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.02, 0.5, 0), new THREE.Vector3(-0.01, 0.9, 0.01)], 0.02, 0.008, 6, [0.8, 0.8, 0.76], [0.85, 0.85, 0.8]);
  for (let k = 0; k < 7; k++) {
    const c = new THREE.Vector3((r() - 0.5) * 0.35, 0.5 + r() * 0.45, (r() - 0.5) * 0.35);
    const s = 0.14 + r() * 0.12;
    g.sphere(c, new THREE.Vector3(s, s * 0.9, s), () => mixc([0.12, 0.2, 0.08], [0.2, 0.3, 0.1], r()), 9, 6, 0.35, r);
  }
  return g.build();
};
