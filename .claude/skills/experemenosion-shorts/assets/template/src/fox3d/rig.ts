import * as THREE from "three";
import { V3, MeshData } from "./sdf";

// ---------------------------------------------------------------- rig / pose
export interface BoneDef { name: string; parent: number; pivot: V3; tip: V3 }

const _t = new THREE.Vector3();
const _m = new THREE.Matrix4();

export class Rig {
  bones: BoneDef[];
  R: THREE.Quaternion[];
  P: THREE.Vector3[];
  M: THREE.Matrix4[];
  pivot: THREE.Vector3[];
  restDir: THREE.Vector3[];
  len: number[];
  byName: Record<string, number> = {};
  constructor(bones: BoneDef[]) {
    this.bones = bones;
    this.R = bones.map(() => new THREE.Quaternion());
    this.P = bones.map(() => new THREE.Vector3());
    this.M = bones.map(() => new THREE.Matrix4());
    this.pivot = bones.map((b) => new THREE.Vector3(...b.pivot));
    this.restDir = bones.map((b) => new THREE.Vector3(b.tip[0] - b.pivot[0], b.tip[1] - b.pivot[1], b.tip[2] - b.pivot[2]).normalize());
    this.len = bones.map((b) => Math.hypot(b.tip[0] - b.pivot[0], b.tip[1] - b.pivot[1], b.tip[2] - b.pivot[2]));
    bones.forEach((b, i) => (this.byName[b.name] = i));
  }
  i(name: string) { return this.byName[name]; }
  private compose(i: number) {
    const M = this.M[i];
    M.makeRotationFromQuaternion(this.R[i]);
    _t.copy(this.pivot[i]).applyQuaternion(this.R[i]);
    M.setPosition(this.P[i].x - _t.x, this.P[i].y - _t.y, this.P[i].z - _t.z);
  }
  // pivot position of bone i inherited from its parent's current matrix
  inheritPos(i: number, out = new THREE.Vector3()) {
    const p = this.bones[i].parent;
    return out.copy(this.pivot[i]).applyMatrix4(this.M[p]);
  }
  setWorld(i: number, q: THREE.Quaternion, pos?: THREE.Vector3) {
    this.R[i].copy(q);
    if (pos) this.P[i].copy(pos);
    else this.inheritPos(i, this.P[i]);
    this.compose(i);
  }
  setLocal(i: number, q: THREE.Quaternion) {
    const p = this.bones[i].parent;
    this.R[i].copy(this.R[p]).multiply(q);
    this.inheritPos(i, this.P[i]);
    this.compose(i);
  }
  // world position of a rest-space point carried by bone i
  point(i: number, rest: V3 | THREE.Vector3, out = new THREE.Vector3()) {
    if (Array.isArray(rest)) out.set(rest[0], rest[1], rest[2]);
    else out.copy(rest);
    return out.applyMatrix4(this.M[i]);
  }
  // world rotation that maps rest direction d0 (with rest side s0) onto d (with side s)
  static align(d0: THREE.Vector3, s0: THREE.Vector3, d: THREE.Vector3, s: THREE.Vector3, out = new THREE.Quaternion()) {
    const basis = (u: THREE.Vector3, side: THREE.Vector3) => {
      const uu = u.clone().normalize();
      const w = side.clone().addScaledVector(uu, -side.dot(uu)).normalize();
      const v = new THREE.Vector3().crossVectors(w, uu);
      return new THREE.Matrix4().makeBasis(uu, v, w);
    };
    const B0 = basis(d0, s0), B1 = basis(d, s);
    _m.copy(B0).transpose();
    B1.multiply(_m);
    return out.setFromRotationMatrix(B1);
  }
}

// two-bone IK: returns middle joint position
export const ik2 = (S: THREE.Vector3, T: THREE.Vector3, L1: number, L2: number, pole: THREE.Vector3) => {
  const D = T.clone().sub(S);
  let d = D.length();
  const dmax = (L1 + L2) * 0.999, dmin = Math.abs(L1 - L2) * 1.01 + 1e-4;
  d = Math.min(dmax, Math.max(dmin, d));
  const dir = D.normalize();
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
  const hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const pd = pole.clone().addScaledVector(dir, -pole.dot(dir));
  if (pd.lengthSq() < 1e-8) pd.set(0, 1, 0);
  pd.normalize();
  return S.clone().addScaledVector(dir, a).addScaledVector(pd, hh);
};

// ---------------------------------------------------------------- CPU skinned model
export interface SkinInput {
  mesh: MeshData;
  si: Uint16Array;
  sw: Float32Array;
  color: Float32Array;
  fur: Float32Array;
  comb: Float32Array;
}

export class SkinnedModel {
  geo: THREE.BufferGeometry;
  rest: Float32Array;
  restN: Float32Array;
  restC: Float32Array;
  si: Uint16Array;
  sw: Float32Array;
  nv: number;
  constructor(inp: SkinInput) {
    const { mesh } = inp;
    this.nv = mesh.pos.length / 3;
    this.rest = mesh.pos;
    this.restN = mesh.nrm;
    this.restC = inp.comb;
    this.si = inp.si;
    this.sw = inp.sw;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(mesh.pos), 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(mesh.nrm), 3));
    g.setAttribute("color", new THREE.BufferAttribute(inp.color, 3));
    g.setAttribute("aRest", new THREE.BufferAttribute(mesh.pos, 3));
    g.setAttribute("aFur", new THREE.BufferAttribute(inp.fur, 1));
    g.setAttribute("aComb", new THREE.BufferAttribute(new Float32Array(inp.comb), 3));
    g.setIndex(new THREE.BufferAttribute(mesh.index, 1));
    (g.attributes.position as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    (g.attributes.normal as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    (g.attributes.aComb as THREE.BufferAttribute).setUsage(THREE.DynamicDrawUsage);
    this.geo = g;
  }
  skinInto(mats: THREE.Matrix4[], P: Float32Array, N: Float32Array | null, C: Float32Array | null) {
    const nb = mats.length;
    const E = new Float32Array(nb * 16);
    for (let b = 0; b < nb; b++) E.set(mats[b].elements, b * 16);
    const { rest, restN, restC, si, sw, nv } = this;
    for (let i = 0; i < nv; i++) {
      const x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2];
      const nx = restN[i * 3], ny = restN[i * 3 + 1], nz = restN[i * 3 + 2];
      const cx = restC[i * 3], cy = restC[i * 3 + 1], cz = restC[i * 3 + 2];
      let px = 0, py = 0, pz = 0, qx = 0, qy = 0, qz = 0, rx = 0, ry = 0, rz = 0;
      for (let j = 0; j < 4; j++) {
        const w = sw[i * 4 + j];
        if (w < 1e-4) continue;
        const o = si[i * 4 + j] * 16;
        const e0 = E[o], e1 = E[o + 1], e2 = E[o + 2], e4 = E[o + 4], e5 = E[o + 5], e6 = E[o + 6], e8 = E[o + 8], e9 = E[o + 9], e10 = E[o + 10];
        px += w * (e0 * x + e4 * y + e8 * z + E[o + 12]);
        py += w * (e1 * x + e5 * y + e9 * z + E[o + 13]);
        pz += w * (e2 * x + e6 * y + e10 * z + E[o + 14]);
        if (N) {
          qx += w * (e0 * nx + e4 * ny + e8 * nz);
          qy += w * (e1 * nx + e5 * ny + e9 * nz);
          qz += w * (e2 * nx + e6 * ny + e10 * nz);
        }
        if (C) {
          rx += w * (e0 * cx + e4 * cy + e8 * cz);
          ry += w * (e1 * cx + e5 * cy + e9 * cz);
          rz += w * (e2 * cx + e6 * cy + e10 * cz);
        }
      }
      P[i * 3] = px; P[i * 3 + 1] = py; P[i * 3 + 2] = pz;
      if (N) {
        const l = Math.hypot(qx, qy, qz) || 1;
        N[i * 3] = qx / l; N[i * 3 + 1] = qy / l; N[i * 3 + 2] = qz / l;
      }
      if (C) { C[i * 3] = rx; C[i * 3 + 1] = ry; C[i * 3 + 2] = rz; }
    }
  }
  update(mats: THREE.Matrix4[]) {
    const a = this.geo.attributes;
    this.skinInto(mats, a.position.array as Float32Array, a.normal.array as Float32Array, a.aComb.array as Float32Array);
    a.position.needsUpdate = true;
    a.normal.needsUpdate = true;
    a.aComb.needsUpdate = true;
    this.geo.computeBoundingSphere();
  }
  // geometry for motion-blur ghosts: own position/normal, shared index
  ghost() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(this.nv * 3), 3));
    g.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(this.nv * 3), 3));
    g.setAttribute("color", this.geo.attributes.color);
    g.setIndex(this.geo.index);
    return g;
  }
  updateGhost(g: THREE.BufferGeometry, mats: THREE.Matrix4[]) {
    this.skinInto(mats, g.attributes.position.array as Float32Array, g.attributes.normal.array as Float32Array, null);
    g.attributes.position.needsUpdate = true;
    g.attributes.normal.needsUpdate = true;
    g.computeBoundingSphere();
  }
}

// ---------------------------------------------------------------- materials
const NOISE = /* glsl */ `
vec3 fxHash33(vec3 p){ p = fract(p*vec3(.1031,.1030,.0973)); p += dot(p, p.yxz+33.33); return fract((p.xxy + p.yxx)*p.zyx); }
`;

export interface FurOpts {
  density: number; // strands per metre
  rough?: number;
  sheen?: number;
  dark?: number; // root darkening
  guard?: number; // fraction of dark-tipped guard hairs
}

// base skin: double-sided, back faces painted as mouth interior
export const makeBaseMaterial = (opts: { rough?: number; back?: string; dark?: number } = {}) => {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: opts.rough ?? 0.85, side: THREE.DoubleSide });
  const back = new THREE.Color(opts.back ?? "#3a0806");
  m.onBeforeCompile = (s) => {
    s.uniforms.uBack = { value: back };
    s.uniforms.uDark = { value: opts.dark ?? 0.72 };
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uBack; uniform float uDark;")
      .replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb *= uDark; if(!gl_FrontFacing) diffuseColor.rgb = uBack;");
  };
  m.customProgramCacheKey = () => "fxbase" + (opts.back ?? "") + (opts.dark ?? 0.72);
  return m;
};

export const makeFurMaterial = (level: number, o: FurOpts) => {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: o.rough ?? 0.9, side: THREE.FrontSide });
  m.alphaToCoverage = true;
  m.transparent = false;
  const uni = { uShell: { value: level }, uDensity: { value: o.density }, uDark: { value: o.dark ?? 0.55 }, uGuard: { value: o.guard ?? 0.0 }, uSheen: { value: o.sheen ?? 0.25 } };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uni);
    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute vec3 aRest; attribute float aFur; attribute vec3 aComb; uniform float uShell; varying vec3 vRest; varying float vFur; varying float vShellView;",
      )
      .replace(
        "#include <begin_vertex>",
        `vec3 transformed = vec3(position) + normal * aFur * uShell + aComb * aFur * uShell * uShell * 0.9 + vec3(0.0,-1.0,0.0) * aFur * uShell * uShell * 0.25;
         vRest = aRest; vFur = aFur;`,
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nuniform float uShell; uniform float uDensity; uniform float uDark; uniform float uGuard; uniform float uSheen; varying vec3 vRest; varying float vFur;\n${NOISE}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        if (vFur < 0.0012) discard;
        vec3 q = vRest * uDensity;
        vec3 base = floor(q - 0.5);
        float best = 9.0; vec3 bh = vec3(0.0);
        for (int i = 0; i < 8; i++) {
          vec3 c = base + vec3(float(i & 1), float((i >> 1) & 1), float((i >> 2) & 1));
          vec3 h = fxHash33(c);
          vec3 sp = c + 0.15 + 0.7 * h;
          float d = length(q - sp);
          if (d < best) { best = d; bh = h; }
        }
        float hgt = 0.55 + 0.45 * bh.x;
        float lv = uShell / hgt;
        if (lv > 1.0) discard;
        float rad = 0.62 * (1.0 - lv * lv * 0.85);
        float a = smoothstep(rad, rad - 0.18, best);
        if (a < 0.02) discard;
        diffuseColor.a = a;
        float ao = mix(uDark, 1.0, smoothstep(0.0, 0.9, uShell));
        float tint = 0.86 + 0.28 * bh.y;
        diffuseColor.rgb *= ao * tint;
        if (bh.z < uGuard) diffuseColor.rgb *= mix(1.0, 0.25, smoothstep(0.45, 0.9, lv));
        diffuseColor.rgb += uSheen * pow(uShell, 2.0) * 0.18 * vec3(1.0, 0.95, 0.85);`,
      );
  };
  m.customProgramCacheKey = () => "fxfur";
  m.userData.uni = uni;
  return m;
};

// soft glow sprite texture (radial)
let _glow: THREE.Texture | null = null;
export const softGlow = () => {
  if (_glow) return _glow;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.12, "rgba(255,255,255,0.7)");
  gr.addColorStop(0.35, "rgba(255,255,255,0.18)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  _glow = new THREE.CanvasTexture(c);
  _glow.colorSpace = THREE.SRGBColorSpace;
  return _glow;
};

// smooth helpers
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const sstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const qEuler = (x: number, y: number, z: number, order: THREE.EulerOrder = "YZX") => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, order));
// deterministic smooth 1D noise
export const noise1 = (t: number, seed = 0) => {
  const h = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(t), f = t - i;
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
};
