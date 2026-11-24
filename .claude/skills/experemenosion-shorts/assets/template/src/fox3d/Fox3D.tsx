import React from "react";
import * as THREE from "three";
import { Prim, V3, compileModel, meshSDF, skinWeights } from "./sdf";
import { Rig, BoneDef, SkinnedModel, ik2, makeBaseMaterial, makeFurMaterial, softGlow, sstep, lerp, qEuler, clamp01, noise1 } from "./rig";

// =====================================================================================
// Red fox: SDF body (smooth-min of ellipsoids / round cones), Surface Nets mesh, 26-bone rig,
// CPU skinning, 3D-noise fur shells, amber slit-pupil eyes with eyeshine, teeth, tongue, drool.
// Rest pose: facing +x, y up, ground at y = 0. Left = -z, right = +z. Units: metres.
// =====================================================================================

const zF = 0.046, zH = 0.05;
export const FB = {
  root: 0, pelvis: 1, chest: 2, neck: 3, head: 4, jaw: 5, t0: 6, t1: 7, t2: 8, t3: 9,
  FL: [10, 11, 12], FR: [13, 14, 15], HL: [16, 17, 18, 19], HR: [20, 21, 22, 23], earL: 24, earR: 25,
};

const BONES: BoneDef[] = (() => {
  const b: BoneDef[] = [
    { name: "root", parent: -1, pivot: [-0.02, 0.315, 0], tip: [0.1, 0.315, 0] },
    { name: "pelvis", parent: 0, pivot: [-0.06, 0.32, 0], tip: [-0.22, 0.32, 0] },
    { name: "chest", parent: 0, pivot: [0.0, 0.32, 0], tip: [0.16, 0.33, 0] },
    { name: "neck", parent: 2, pivot: [0.16, 0.335, 0], tip: [0.265, 0.425, 0] },
    { name: "head", parent: 3, pivot: [0.265, 0.425, 0], tip: [0.41, 0.42, 0] },
    { name: "jaw", parent: 4, pivot: [0.29, 0.418, 0], tip: [0.395, 0.402, 0] },
    { name: "t0", parent: 1, pivot: [-0.23, 0.315, 0], tip: [-0.32, 0.285, 0] },
    { name: "t1", parent: 6, pivot: [-0.32, 0.285, 0], tip: [-0.43, 0.235, 0] },
    { name: "t2", parent: 7, pivot: [-0.43, 0.235, 0], tip: [-0.545, 0.185, 0] },
    { name: "t3", parent: 8, pivot: [-0.545, 0.185, 0], tip: [-0.66, 0.155, 0] },
  ];
  for (const [nm, s] of [["L", -1], ["R", 1]] as const) {
    const z = s * zF, base = b.length;
    b.push({ name: "hum" + nm, parent: 2, pivot: [0.14, 0.27, z], tip: [0.112, 0.172, z] });
    b.push({ name: "rad" + nm, parent: base, pivot: [0.112, 0.172, z], tip: [0.124, 0.046, z] });
    b.push({ name: "fpaw" + nm, parent: base + 1, pivot: [0.124, 0.046, z], tip: [0.16, 0.012, z] });
  }
  for (const [nm, s] of [["L", -1], ["R", 1]] as const) {
    const z = s * zH, base = b.length;
    b.push({ name: "fem" + nm, parent: 1, pivot: [-0.165, 0.295, z], tip: [-0.115, 0.19, z] });
    b.push({ name: "tib" + nm, parent: base, pivot: [-0.115, 0.19, z], tip: [-0.2, 0.092, z] });
    b.push({ name: "met" + nm, parent: base + 1, pivot: [-0.2, 0.092, z], tip: [-0.186, 0.03, z] });
    b.push({ name: "hpaw" + nm, parent: base + 2, pivot: [-0.186, 0.03, z], tip: [-0.15, 0.01, z] });
  }
  b.push({ name: "earL", parent: 4, pivot: [0.283, 0.472, -0.03], tip: [0.272, 0.56, -0.056] });
  b.push({ name: "earR", parent: 4, pivot: [0.283, 0.472, 0.03], tip: [0.272, 0.56, 0.056] });
  return b;
})();

const EYE_R = 0.0088;

const buildPrims = (withSockets: boolean, eyes?: { c: V3 }[]): Prim[] => {
  const P: Prim[] = [];
  const e = (bone: number, c: V3, r: V3, k = 0, rot?: V3, extra: Partial<Prim> = {}) => P.push({ t: "e", bone, c, r, k, rot, ...extra });
  const c = (bone: number, a: V3, b: V3, ra: number, rb: number, k = 0, extra: Partial<Prim> = {}) => P.push({ t: "c", bone, a, b, ra, rb, k, ...extra });
  // --- torso
  e(FB.chest, [0.095, 0.305, 0], [0.12, 0.083, 0.06]);
  e(FB.chest, [0.125, 0.262, 0], [0.07, 0.052, 0.048], 0.05);
  e(FB.chest, [0.085, 0.352, 0], [0.085, 0.034, 0.05], 0.05); // withers
  e(FB.root, [-0.04, 0.318, 0], [0.12, 0.058, 0.05], 0.06);
  e(FB.pelvis, [-0.165, 0.318, 0], [0.085, 0.062, 0.056], 0.06);
  e(FB.pelvis, [-0.2, 0.335, 0], [0.05, 0.035, 0.045], 0.04); // croup
  // --- neck + throat ruff
  c(FB.neck, [0.13, 0.322, 0], [0.27, 0.425, 0], 0.056, 0.036, 0.05);
  e(FB.neck, [0.205, 0.338, 0], [0.06, 0.058, 0.048], 0.05, [0, 0, 0.7]);
  // --- head
  e(FB.head, [0.288, 0.442, 0], [0.056, 0.044, 0.046], 0.035);
  e(FB.head, [0.282, 0.418, -0.03], [0.04, 0.03, 0.026], 0.025, [0, 0.3, 0]); // cheek ruffs
  e(FB.head, [0.282, 0.418, 0.03], [0.04, 0.03, 0.026], 0.025, [0, -0.3, 0]);
  c(FB.head, [0.305, 0.433, 0], [0.402, 0.419, 0], 0.029, 0.0105, 0.03, { sq: { o: [0.35, 0.426, 0], n: [0, 1, 0], s: 0.86 } });
  e(FB.head, [0.31, 0.456, -0.021], [0.026, 0.014, 0.017], 0.02); // brows
  e(FB.head, [0.31, 0.456, 0.021], [0.026, 0.014, 0.017], 0.02);
  e(FB.head, [0.405, 0.4215, 0], [0.0075, 0.0068, 0.0078], 0.007); // nose
  // --- lower jaw (hard union so the mouth can be cut open)
  c(FB.jaw, [0.292, 0.402, 0], [0.392, 0.405, 0], 0.021, 0.0085, 0.004);
  // --- ears: flattened round cones
  for (const s of [-1, 1]) {
    const bone = s < 0 ? FB.earL : FB.earR;
    c(bone, [0.284, 0.468, s * 0.029], [0.27, 0.562, s * 0.056], 0.026, 0.002, 0.018, { sq: { o: [0.28, 0.5, s * 0.04], n: [0.88, 0.0, s * 0.47], s: 0.33 } });
  }
  // --- legs
  for (const s of [-1, 1]) {
    const z = s * zF;
    const [hum, rad, paw] = s < 0 ? FB.FL : FB.FR;
    e(hum, [0.128, 0.24, z * 0.92], [0.042, 0.072, 0.026], 0.035, [0, 0, 0.25]); // shoulder/triceps
    c(hum, [0.14, 0.27, z], [0.112, 0.172, z], 0.024, 0.017, 0.03);
    c(rad, [0.112, 0.172, z], [0.124, 0.046, z], 0.0145, 0.0105, 0.012);
    e(rad, [0.103, 0.172, z], [0.012, 0.014, 0.012], 0.01); // elbow point
    c(paw, [0.124, 0.046, z], [0.142, 0.02, z], 0.0105, 0.012, 0.01);
    e(paw, [0.152, 0.0135, z], [0.024, 0.0135, 0.0165], 0.012);
  }
  for (const s of [-1, 1]) {
    const z = s * zH;
    const [fem, tib, met, paw] = s < 0 ? FB.HL : FB.HR;
    e(fem, [-0.15, 0.25, z * 0.92], [0.062, 0.082, 0.03], 0.04, [0, 0, -0.35]); // thigh
    c(fem, [-0.165, 0.295, z], [-0.115, 0.19, z], 0.03, 0.02, 0.03);
    c(tib, [-0.115, 0.19, z], [-0.2, 0.092, z], 0.018, 0.0115, 0.012);
    e(tib, [-0.15, 0.158, z], [0.034, 0.042, 0.019], 0.02, [0, 0, 0.75]); // calf
    c(met, [-0.2, 0.092, z], [-0.186, 0.03, z], 0.011, 0.0105, 0.01);
    e(met, [-0.208, 0.094, z], [0.01, 0.012, 0.009], 0.008); // hock point
    c(paw, [-0.186, 0.03, z], [-0.168, 0.016, z], 0.0105, 0.012, 0.01);
    e(paw, [-0.16, 0.0135, z], [0.024, 0.0135, 0.0165], 0.012);
  }
  // --- tail: bushy chain
  c(FB.t0, [-0.215, 0.318, 0], [-0.32, 0.285, 0], 0.026, 0.036, 0.04);
  c(FB.t1, [-0.32, 0.285, 0], [-0.43, 0.235, 0], 0.036, 0.047, 0.03);
  c(FB.t2, [-0.43, 0.235, 0], [-0.545, 0.185, 0], 0.047, 0.044, 0.03);
  c(FB.t3, [-0.545, 0.185, 0], [-0.645, 0.157, 0], 0.044, 0.02, 0.03);
  // --- eye sockets (almond)
  if (withSockets && eyes) {
    for (const ey of eyes) e(FB.head, ey.c, [EYE_R * 1.15, EYE_R * 0.62, EYE_R * 1.15], 0.003, [0, 0, 0], { sub: true });
  }
  return P;
};

// rest-space reference points
export const FOX_REST = {
  nose: new THREE.Vector3(0.418, 0.421, 0),
  mouth: new THREE.Vector3(0.37, 0.41, 0), // between the jaws
  lip: new THREE.Vector3(0.372, 0.398, 0.012),
  head: new THREE.Vector3(0.3, 0.44, 0),
  chest: new THREE.Vector3(0.12, 0.3, 0),
  tailTip: new THREE.Vector3(-0.66, 0.155, 0),
  wristH: 0.046,
  fetlockH: 0.03,
};

interface FoxAssets {
  rig: Rig;
  model: SkinnedModel;
  eyes: { c: THREE.Vector3; d: THREE.Vector3 }[];
  teethUp: THREE.BufferGeometry;
  teethLo: THREE.BufferGeometry;
  buildMs: number;
}

let _fox: FoxAssets | null = null;
const hash3 = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

export const getFoxAssets = (): FoxAssets => {
  if (_fox) return _fox;
  const t0 = performance.now();
  const NB = BONES.length;
  // --- eyes: find the head surface along the gaze direction, sink the eyeball half-way
  const pre = compileModel(buildPrims(false), NB);
  const eyes = [-1, 1].map((s) => {
    const d = new THREE.Vector3(0.84, 0.16, s * 0.52).normalize();
    const o = new THREE.Vector3(0.315, 0.449, s * 0.012);
    let tt = 0;
    for (let i = 0; i < 200; i++) {
      const p = o.clone().addScaledVector(d, tt);
      if (pre.field(p.x, p.y, p.z) > 0) break;
      tt += 0.0005;
    }
    const surf = o.clone().addScaledVector(d, tt);
    return { c: surf.addScaledVector(d, -EYE_R * 0.62), d };
  });
  const prims = buildPrims(true, eyes.map((e) => ({ c: [e.c.x, e.c.y, e.c.z] as V3 })));
  const model = compileModel(prims, NB);
  const mesh = meshSDF(model.field, [-0.72, -0.01, -0.13], [0.47, 0.6, 0.13], 0.0036);
  const { si, sw } = skinWeights(model, mesh.pos, 0.011, (_i, x, y, _z, dist) => {
    // binary head/jaw split in front of the mouth corner so the mouth can open cleanly
    if (x > 0.302 && y < 0.44) {
      if (dist[FB.jaw] < dist[FB.head]) { dist[FB.head] = 1e9; dist[FB.neck] = Math.max(dist[FB.neck], dist[FB.jaw] + 0.05); }
      else dist[FB.jaw] = 1e9;
    }
  });
  const nv = mesh.pos.length / 3;
  const W = (i: number, b: number) => {
    let w = 0;
    for (let j = 0; j < 4; j++) if (si[i * 4 + j] === b) w += sw[i * 4 + j];
    return w;
  };
  // --- cut the mouth slit: drop triangles that straddle head/jaw in front of the corner
  const isJaw = new Uint8Array(nv), inMouth = new Uint8Array(nv);
  for (let i = 0; i < nv; i++) {
    const x = mesh.pos[i * 3], y = mesh.pos[i * 3 + 1];
    isJaw[i] = W(i, FB.jaw) > 0.5 ? 1 : 0;
    inMouth[i] = x > 0.322 && y < 0.435 && y > 0.385 ? 1 : 0;
  }
  const keep: number[] = [];
  for (let t = 0; t < mesh.index.length; t += 3) {
    const a = mesh.index[t], b = mesh.index[t + 1], c = mesh.index[t + 2];
    const mix = isJaw[a] + isJaw[b] + isJaw[c];
    const hd = W(a, FB.head) + W(b, FB.head) + W(c, FB.head);
    if (inMouth[a] && inMouth[b] && inMouth[c] && mix > 0 && mix < 3 && hd > 0.5) continue;
    keep.push(a, b, c);
  }
  mesh.index = new Uint32Array(keep);

  // --- colours, fur length, comb direction
  const color = new Float32Array(nv * 3), fur = new Float32Array(nv), comb = new Float32Array(nv * 3);
  const ORANGE = [0.8, 0.39, 0.15], RUST = [0.6, 0.24, 0.09], LIGHT = [0.9, 0.55, 0.27];
  const WHITE = [0.93, 0.91, 0.86], CREAM = [0.9, 0.82, 0.66], BLACK = [0.045, 0.035, 0.03], DARKB = [0.2, 0.12, 0.08];
  const mixc = (a: number[], b: number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const segDist = (p: THREE.Vector3, a: THREE.Vector3, b: THREE.Vector3) => {
    const ab = b.clone().sub(a), t = clamp01(p.clone().sub(a).dot(ab) / ab.lengthSq());
    return p.distanceTo(a.clone().addScaledVector(ab, t));
  };
  const p = new THREE.Vector3(), n = new THREE.Vector3();
  const noseC = new THREE.Vector3(0.407, 0.4215, 0);
  for (let i = 0; i < nv; i++) {
    p.set(mesh.pos[i * 3], mesh.pos[i * 3 + 1], mesh.pos[i * 3 + 2]);
    n.set(mesh.nrm[i * 3], mesh.nrm[i * 3 + 1], mesh.nrm[i * 3 + 2]);
    const { x, y, z } = p;
    const az = Math.abs(z);
    const wHead = W(i, FB.head), wJaw = W(i, FB.jaw), wNeck = W(i, FB.neck);
    const wEar = W(i, FB.earL) + W(i, FB.earR);
    const wTail = W(i, FB.t0) + W(i, FB.t1) + W(i, FB.t2) + W(i, FB.t3);
    const wFront = FB.FL.concat(FB.FR).reduce((s, b) => s + W(i, b), 0);
    const wHind = FB.HL.concat(FB.HR).reduce((s, b) => s + W(i, b), 0);
    const wBody = clamp01(1 - wHead - wJaw - wEar - wTail - wFront * 0.6 - wHind * 0.6);
    let col = mixc(LIGHT, ORANGE, sstep(-0.4, 0.3, n.y));
    col = mixc(col, RUST, sstep(0.5, 0.95, n.y) * (wBody + wNeck * 0.5 + wTail * 0.6));
    let fl = 0.016 + 0.004 * sstep(0.3, 0.9, n.y) * wBody;
    let cb = [-1, -0.3, 0];
    // belly
    const belly = sstep(-0.2, -0.65, n.y) * sstep(-0.22, -0.15, x) * sstep(0.2, 0.12, x) * (1 - wFront) * (1 - wHind * 0.5);
    col = mixc(col, mixc(CREAM, WHITE, 0.4), belly * 0.85);
    fl = lerp(fl, 0.012, belly);
    // throat / chest bib
    const yc = 0.335 + (x - 0.16) * (0.09 / 0.105);
    const bib = sstep(0.85, 0.55, Math.abs(n.z)) * sstep(0.004, -0.02, y - (yc - 0.008)) * sstep(0.07, 0.115, x) * sstep(0.3, 0.27, x) * (1 - wFront);
    col = mixc(col, WHITE, bib);
    fl = lerp(fl, 0.026, bib * (1 - wHead));
    // head
    const headish = clamp01(wHead + wJaw);
    if (headish > 0.01) {
      const lowFace = sstep(0.003, -0.006, y - (0.431 - (x - 0.27) * 0.13));
      const cheekRuff = sstep(0.018, 0.03, az) * sstep(0.318, 0.3, x) * sstep(0.447, 0.437, y);
      let hc = mixc(col, WHITE, clamp01(Math.max(lowFace, cheekRuff, wJaw)));
      // muzzle top a touch darker
      hc = mixc(hc, RUST, sstep(0.33, 0.39, x) * sstep(0.2, 0.8, n.y) * 0.5);
      col = mixc(col, hc, headish);
      const flHead = wJaw > 0.5 ? 0.003 : x > 0.33 ? 0.0025 : cheekRuff > 0.3 ? 0.016 : 0.005;
      fl = lerp(fl, flHead, headish);
      cb = [-1, 0.15, 0];
      if (cheekRuff > 0.3) cb = [-0.5, -0.45, Math.sign(z) * 0.75];
      // nose, lips, eye rims, tear lines
      const dn = p.distanceTo(noseC);
      const nose = sstep(0.0112, 0.0085, dn);
      const lips = x > 0.318 ? sstep(0.5, 0.85, 4 * wJaw * wHead) + sstep(0.006, 0.0, Math.abs(y - (0.4105 - (x - 0.3) * 0.02))) * sstep(0.31, 0.32, x) * sstep(0.2, -0.3, n.y + 0.2) * 0.0 : 0;
      let rim = 0, tear = 0;
      for (const ey of eyes) {
        rim = Math.max(rim, sstep(EYE_R * 1.45, EYE_R * 1.12, p.distanceTo(ey.c)));
        const a = ey.c.clone().add(new THREE.Vector3(0.006, -0.006, -Math.sign(ey.c.z) * 0.004));
        const b = new THREE.Vector3(0.372, 0.421, Math.sign(ey.c.z) * 0.016);
        tear = Math.max(tear, sstep(0.0028, 0.0008, segDist(p, a, b)) * sstep(0.372, 0.35, x));
      }
      col = mixc(col, BLACK, Math.max(nose, rim, lips));
      col = mixc(col, DARKB, tear * 0.6);
      fl *= 1 - Math.max(nose, rim, lips, tear * 0.6);
      // lip line on the upper muzzle edge
      if (x > 0.305 && wHead > 0.5 && n.y < -0.25 && y < 0.418) { col = mixc(col, BLACK, 0.85); fl = 0; }
      if (x > 0.318 && wJaw > 0.5 && n.y > 0.35) { col = mixc(col, BLACK, 0.85); fl = 0; }
    }
    // ears: black backs, cream inside, black tips
    if (wEar > 0.05) {
      const s = Math.sign(z) || 1;
      const face = new THREE.Vector3(0.88, 0, s * 0.47);
      const front = sstep(-0.1, 0.25, n.dot(face));
      let ec = mixc(BLACK, mixc(ORANGE, CREAM, sstep(0.48, 0.5, y) * 0.8), front);
      ec = mixc(ec, BLACK, sstep(0.528, 0.545, y));
      col = mixc(col, ec, clamp01(wEar * 1.3));
      fl = lerp(fl, front > 0.5 ? 0.007 : 0.003, wEar);
      cb = [0, 1, 0];
    }
    // legs: black stockings
    if (wFront > 0.05) {
      const st = sstep(0.225 + 0.02 * n.x, 0.16, y);
      col = mixc(col, mixc(col, BLACK, st), clamp01(wFront * 1.5));
      fl = lerp(fl, lerp(0.013, 0.0045, sstep(0.25, 0.14, y)), wFront);
      cb = [-0.25, -1, 0];
    }
    if (wHind > 0.05) {
      const st = sstep(0.13 + 0.03 * Math.max(0, n.x), 0.085, y);
      col = mixc(col, mixc(col, BLACK, st), clamp01(wHind * 1.4));
      const thigh = sstep(0.2, 0.26, y);
      col = mixc(col, mixc(col, CREAM, 0.6), thigh * sstep(0.2, 0.7, -n.x) * sstep(0.6, 0.0, n.y) * 0.4);
      fl = lerp(fl, lerp(0.0045, 0.018, sstep(0.12, 0.22, y)), wHind);
      cb = [-0.4, -1, 0];
    }
    if (y < 0.03) { col = mixc(col, BLACK, 0.9); fl = Math.min(fl, 0.003); }
    // tail: grizzled top, dark ring, white tip
    if (wTail > 0.05) {
      let tc = mixc(col, mixc(ORANGE, DARKB, 0.45), 0.55 * sstep(0.0, 0.9, n.y));
      tc = mixc(tc, mixc(ORANGE, BLACK, 0.55), sstep(-0.53, -0.585, x) * sstep(-0.635, -0.6, x) * 0.6);
      tc = mixc(tc, WHITE, sstep(-0.6, -0.635, x));
      col = mixc(col, tc, clamp01(wTail * 1.2));
      const u = clamp01((-x - 0.22) / 0.42);
      fl = lerp(fl, 0.03 + 0.03 * Math.sin(Math.PI * Math.min(1, u * 1.1)), clamp01(wTail * 1.3));
      cb = [-0.9, -0.35, 0];
    }
    // tiny value noise
    const nz = 0.9 + 0.2 * hash3(Math.floor(x * 140), Math.floor(y * 140), Math.floor(z * 140));
    color[i * 3] = Math.pow(col[0] * nz, 2.2); color[i * 3 + 1] = Math.pow(col[1] * nz, 2.2); color[i * 3 + 2] = Math.pow(col[2] * nz, 2.2);
    fur[i] = fl;
    // comb tangent to the surface
    const cv = new THREE.Vector3(cb[0], cb[1], cb[2]).normalize();
    cv.addScaledVector(n, -cv.dot(n));
    if (cv.lengthSq() < 1e-6) cv.set(0, -1, 0);
    cv.normalize();
    comb[i * 3] = cv.x; comb[i * 3 + 1] = cv.y; comb[i * 3 + 2] = cv.z;
  }
  const smodel = new SkinnedModel({ mesh, si, sw, color, fur, comb });

  // --- teeth (rest space; carried by head / jaw)
  const findSide = (x: number, y: number) => {
    let zz = 0;
    for (let i = 0; i < 60; i++) { if (model.field(x, y, zz) > 0) break; zz += 0.0005; }
    return zz;
  };
  const tooth = (base: THREE.Vector3, len: number, rad: number, dir: number) => {
    const g = new THREE.ConeGeometry(rad, len, 6);
    g.translate(0, (dir * len) / 2, 0);
    if (dir < 0) g.rotateX(Math.PI);
    if (dir < 0) g.translate(0, 0, 0);
    g.translate(base.x, base.y, base.z);
    return g.toNonIndexed();
  };
  const ups: THREE.BufferGeometry[] = [], los: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    for (let k = 0; k < 6; k++) {
      const x = 0.322 + k * 0.0135;
      const zU = findSide(x, 0.418) * 0.78, zL = findSide(x, 0.404) * 0.75;
      const canine = k === 4;
      ups.push(tooth(new THREE.Vector3(x, 0.4185, s * zU), canine ? 0.014 : 0.0065, canine ? 0.0032 : 0.0024, -1));
      los.push(tooth(new THREE.Vector3(x - 0.004, 0.4065, s * zL), k === 3 ? 0.012 : 0.0055, k === 3 ? 0.003 : 0.0022, 1));
    }
    ups.push(tooth(new THREE.Vector3(0.398, 0.4175, s * 0.004), 0.005, 0.002, -1));
    los.push(tooth(new THREE.Vector3(0.39, 0.408, s * 0.004), 0.004, 0.0018, 1));
  }
  const merge = (gs: THREE.BufferGeometry[]) => {
    const tot = gs.reduce((s, g) => s + g.attributes.position.count, 0);
    const pos = new Float32Array(tot * 3);
    let o = 0;
    for (const g of gs) { pos.set(g.attributes.position.array as Float32Array, o); o += g.attributes.position.array.length; }
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    out.computeVertexNormals();
    return out;
  };
  _fox = { rig: new Rig(BONES), model: smodel, eyes, teethUp: merge(ups), teethLo: merge(los), buildMs: performance.now() - t0 };
  return _fox;
};

// =====================================================================================
// Pose
// =====================================================================================
export interface LegTarget {
  p: THREE.Vector3; // world position of the wrist (front) / fetlock (hind) pivot
  paw: number; // paw pitch: 0 flat, negative = curled
  meta?: number; // hind only: metatarsus tilt (rad, + = hock behind fetlock)
}
export interface FoxPose {
  pos: THREE.Vector3; // world position of the root pivot
  yaw: number; pitch: number; roll: number;
  spinePitch?: number; spineYaw?: number;
  neckPitch?: number; headPitch?: number; headYaw?: number; headRoll?: number;
  jaw?: number; ears?: number; tongue?: number;
  tailLift?: number; tailSway?: number; tailCurl?: number; tailPhase?: number;
  legs: [LegTarget, LegTarget, LegTarget, LegTarget]; // FL FR HL HR
}

const Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);

export const solveFox = (rig: Rig, s: FoxPose) => {
  const rootQ = qEuler(s.roll, s.yaw, s.pitch);
  rig.setWorld(FB.root, rootQ, s.pos);
  const sp = s.spinePitch ?? 0, sy = s.spineYaw ?? 0;
  rig.setLocal(FB.pelvis, qEuler(0, -sy / 2, -sp / 2));
  rig.setLocal(FB.chest, qEuler(0, sy / 2, sp / 2));
  const yawQ = qEuler(0, s.yaw + sy / 2, 0);
  // neck + head in world space (head stabilised)
  const hy = s.yaw + sy / 2 + (s.headYaw ?? 0);
  rig.setWorld(FB.neck, qEuler(0, s.yaw + sy / 2 + (s.headYaw ?? 0) * 0.5, (s.neckPitch ?? 0) + s.pitch * 0.4 + sp * 0.3));
  rig.setWorld(FB.head, qEuler(s.headRoll ?? 0, hy, s.headPitch ?? 0));
  rig.setLocal(FB.jaw, qEuler(0, 0, -(s.jaw ?? 0)));
  const ear = s.ears ?? 0;
  rig.setLocal(FB.earL, qEuler(-0.35 * ear, -0.25 * ear, 0.95 * ear));
  rig.setLocal(FB.earR, qEuler(0.35 * ear, 0.25 * ear, 0.95 * ear));
  // tail chain
  const lift = s.tailLift ?? 0, sway = s.tailSway ?? 0, curl = s.tailCurl ?? 0, ph = s.tailPhase ?? 0;
  [FB.t0, FB.t1, FB.t2, FB.t3].forEach((b, k) => {
    const sw = sway * Math.sin(ph - k * 0.7) * (0.5 + k * 0.25);
    rig.setLocal(b, qEuler(0, sw, k === 0 ? -lift : -curl * (0.6 + k * 0.2)));
  });
  // legs
  const chestQ = rig.R[FB.chest], pelvQ = rig.R[FB.pelvis];
  const legs = [FB.FL, FB.FR, FB.HL, FB.HR];
  legs.forEach((ch, li) => {
    const tgt = s.legs[li];
    const front = li < 2;
    const bq = front ? chestQ : pelvQ;
    const fwd = X.clone().applyQuaternion(bq), side = Z.clone().applyQuaternion(bq), up = Y.clone().applyQuaternion(bq);
    const pawQ = yawQ.clone().multiply(qEuler(0, 0, tgt.paw));
    if (front) {
      const [hum, rad, paw] = ch;
      const S = rig.inheritPos(hum);
      const E = ik2(S, tgt.p, rig.len[hum], rig.len[rad], fwd.clone().multiplyScalar(-1).addScaledVector(up, -0.2));
      rig.setWorld(hum, Rig.align(rig.restDir[hum], Z, E.clone().sub(S), side));
      rig.setWorld(rad, Rig.align(rig.restDir[rad], Z, tgt.p.clone().sub(E), side));
      rig.setWorld(paw, pawQ);
    } else {
      const [fem, tib, met, paw] = ch;
      const S = rig.inheritPos(fem);
      const a = tgt.meta ?? 0.22;
      // metatarsus direction hock -> fetlock in the sagittal plane
      const m = fwd.clone().multiplyScalar(Math.sin(a)).addScaledVector(up, -Math.cos(a)).normalize();
      const Hk = tgt.p.clone().addScaledVector(m, -rig.len[met]);
      const E = ik2(S, Hk, rig.len[fem], rig.len[tib], fwd.clone().addScaledVector(up, -0.1));
      rig.setWorld(fem, Rig.align(rig.restDir[fem], Z, E.clone().sub(S), side));
      rig.setWorld(tib, Rig.align(rig.restDir[tib], Z, Hk.clone().sub(E), side));
      rig.setWorld(met, Rig.align(rig.restDir[met], Z, m, side));
      rig.setWorld(paw, pawQ);
    }
  });
  return rig.M;
};

// =====================================================================================
// Gaits (pure functions of time)
// =====================================================================================
export interface PathSample { p: THREE.Vector3; yaw: number }
export type PathFn = (t: number) => PathSample;

// straight/curved path helper from a CatmullRom curve and a distance function
export const curvePath = (pts: THREE.Vector3[], dist: (t: number) => number): PathFn => {
  const cv = new THREE.CatmullRomCurve3(pts);
  const L = cv.getLength();
  return (t) => {
    const u = Math.max(0, Math.min(1, dist(t) / L));
    const p = cv.getPointAt(u);
    const tg = cv.getTangentAt(u);
    return { p, yaw: Math.atan2(-tg.z, tg.x) };
  };
};

const LEG_OFF = [
  { x: 0.144, z: -zF, front: true },
  { x: 0.144, z: zF, front: true },
  { x: -0.166, z: -zH, front: false },
  { x: -0.166, z: zH, front: false },
];

export interface GaitOpts {
  freq: number; // stride cycles per second
  duty: number;
  offsets: [number, number, number, number]; // FL FR HL HR phase offsets
  height: number; // root height above ground
  lift: number; // swing foot lift
  bob: number;
  wobble?: number; // rabid unsteadiness 0..1
  stalk?: number; // 0..1 low crouched stalking posture
  t0?: number;
}

const rot2 = (x: number, z: number, yaw: number) => new THREE.Vector3(x * Math.cos(yaw) + z * Math.sin(yaw), 0, -x * Math.sin(yaw) + z * Math.cos(yaw));
const hashN = (n: number, k: number) => {
  const s = Math.sin(n * 91.7 + k * 47.3) * 43758.5453;
  return s - Math.floor(s);
};

export const TROT: Omit<GaitOpts, "freq"> = { duty: 0.42, offsets: [0, 0.5, 0.5, 0], height: 0.0, lift: 0.055, bob: 0.009 };
export const WALK: Omit<GaitOpts, "freq"> = { duty: 0.66, offsets: [0.25, 0.75, 0.0, 0.5], height: 0.0, lift: 0.04, bob: 0.004 };

export const gaitPose = (t: number, path: PathFn, g: GaitOpts): FoxPose => {
  const wob = g.wobble ?? 0, stalk = g.stalk ?? 0;
  const here = path(t);
  const legs = LEG_OFF.map((lo, li) => {
    const ph = g.freq * t + g.offsets[li];
    const n = Math.floor(ph), u = ph - n;
    const plant = (k: number) => {
      const tk = (k + g.duty / 2 - g.offsets[li]) / g.freq;
      const s = path(tk);
      const lat = wob * (hashN(k, li) - 0.5) * 0.05;
      const fx = lo.x + (lo.front ? 0.01 : 0) - stalk * (lo.front ? -0.01 : 0.02);
      const off = rot2(fx, lo.z + lat, s.yaw);
      return s.p.clone().add(off);
    };
    const hgt = lo.front ? FOX_REST.wristH : FOX_REST.fetlockH;
    let p: THREE.Vector3, paw = 0, meta = 0.22;
    if (u < g.duty) {
      p = plant(n);
      const st = u / g.duty;
      p.y += hgt;
      paw = lo.front ? lerp(0.05, -0.25, sstep(0.6, 1, st)) : lerp(0.0, -0.2, sstep(0.6, 1, st));
      meta = lerp(0.42, -0.05, st);
    } else {
      const sw = (u - g.duty) / (1 - g.duty);
      const e = sstep(0, 1, sw);
      const a = plant(n), b = plant(n + 1);
      p = a.lerp(b, e);
      const lift = g.lift * Math.sin(Math.PI * Math.min(1, sw * 1.1)) * (lo.front ? 1.1 : 0.9);
      p.y += hgt + lift;
      paw = lo.front ? -1.5 * Math.sin(Math.PI * Math.pow(sw, 0.7)) : -1.0 * Math.sin(Math.PI * sw);
      meta = lerp(-0.05, 0.42, e) - 0.55 * Math.sin(Math.PI * sw);
    }
    return { p, paw, meta } as LegTarget;
  }) as FoxPose["legs"];
  const phase = g.freq * t;
  const bob = -g.bob * Math.cos(phase * Math.PI * 4) - wob * 0.012 * Math.abs(noise1(t * 3, 3));
  const sway = wob * (0.06 * noise1(t * 1.3, 1) + 0.03 * Math.sin(phase * Math.PI * 2));
  const pos = here.p.clone();
  pos.y = 0.315 + g.height + bob - stalk * 0.075;
  const side = rot2(0, 1, here.yaw);
  pos.addScaledVector(side, wob * 0.015 * Math.sin(phase * Math.PI * 2));
  return {
    pos,
    yaw: here.yaw + sway,
    pitch: 0.012 * Math.sin(phase * Math.PI * 4 + 0.6) - stalk * 0.04,
    roll: 0.025 * Math.sin(phase * Math.PI * 2) + wob * 0.07 * noise1(t * 1.7, 2),
    spinePitch: 0.02 * Math.sin(phase * Math.PI * 4) - stalk * 0.08,
    spineYaw: 0.05 * Math.sin(phase * Math.PI * 2),
    neckPitch: lerp(0.0, -0.55, stalk) + wob * 0.1 * noise1(t * 2.1, 4),
    headPitch: lerp(-0.05, -0.2, stalk) + 0.025 * Math.cos(phase * Math.PI * 4) + wob * 0.12 * noise1(t * 2.5, 5),
    headYaw: wob * 0.22 * noise1(t * 1.9, 6),
    headRoll: wob * (0.22 + 0.15 * noise1(t * 1.1, 7)),
    jaw: wob * 0.16,
    ears: wob * 0.25 + stalk * 0.1,
    tailLift: lerp(0.05, -0.12, stalk) + 0.04 * Math.sin(phase * Math.PI * 4),
    tailSway: 0.18 + wob * 0.12,
    tailCurl: lerp(-0.08, -0.12, stalk),
    tailPhase: phase * Math.PI * 2,
    legs,
  };
};

// world-space leg target from a body-relative offset (for flight poses)
export const bodyLeg = (pos: THREE.Vector3, yaw: number, pitch: number, x: number, y: number, z: number) => {
  const q = qEuler(0, yaw, pitch);
  return new THREE.Vector3(x, y, z).applyQuaternion(q).add(pos);
};

export const blendPose = (a: FoxPose, b: FoxPose, t: number): FoxPose => {
  const L = (x?: number, y?: number) => lerp(x ?? 0, y ?? 0, t);
  return {
    pos: a.pos.clone().lerp(b.pos, t),
    yaw: L(a.yaw, b.yaw), pitch: L(a.pitch, b.pitch), roll: L(a.roll, b.roll),
    spinePitch: L(a.spinePitch, b.spinePitch), spineYaw: L(a.spineYaw, b.spineYaw),
    neckPitch: L(a.neckPitch, b.neckPitch), headPitch: L(a.headPitch, b.headPitch), headYaw: L(a.headYaw, b.headYaw), headRoll: L(a.headRoll, b.headRoll),
    jaw: L(a.jaw, b.jaw), ears: L(a.ears, b.ears), tongue: L(a.tongue, b.tongue),
    tailLift: L(a.tailLift, b.tailLift), tailSway: L(a.tailSway, b.tailSway), tailCurl: L(a.tailCurl, b.tailCurl), tailPhase: L(a.tailPhase, b.tailPhase),
    legs: a.legs.map((la, i) => ({ p: la.p.clone().lerp(b.legs[i].p, t), paw: L(la.paw, b.legs[i].paw), meta: L(la.meta ?? 0.22, b.legs[i].meta ?? 0.22) })) as FoxPose["legs"],
  };
};

// =====================================================================================
// Rendering
// =====================================================================================
const eyeMaterial = (glow: { value: number }) =>
  new THREE.ShaderMaterial({
    uniforms: { uGlow: glow },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normal; vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uGlow; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 n = normalize(vN);
        vec2 q = n.xy; float r = length(q);
        float front = smoothstep(-0.2, 0.3, n.z);
        float ang = atan(q.y, q.x);
        float fib = 0.85 + 0.15*sin(ang*38.0 + r*20.0);
        vec3 iris = mix(vec3(1.0,0.78,0.22), vec3(0.78,0.36,0.04), smoothstep(0.1,0.85,r)) * fib;
        iris = mix(iris, vec3(0.12,0.05,0.0), smoothstep(0.78,0.92,r));
        float slit = 1.0 - smoothstep(0.0, 0.025, abs(q.x) - 0.11*(1.0 - pow(clamp(q.y/0.72,-1.0,1.0),2.0)));
        slit *= step(abs(q.y), 0.72) * front;
        vec3 col = mix(vec3(0.05,0.03,0.02), iris, front);
        col = mix(col, vec3(0.01,0.0,0.0), slit);
        // tapetum eyeshine: pupil and iris glow
        col += uGlow * (vec3(1.0,0.82,0.35)*slit*1.6 + iris*0.55*front);
        float spec = smoothstep(0.1, 0.0, length(q - vec2(-0.28, 0.34)));
        col += spec * 0.9 * front;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });

interface FoxRuntime {
  group: THREE.Group;
  base: THREE.Mesh;
  shells: THREE.Mesh[];
  eyeMeshes: THREE.Mesh[];
  corneas: THREE.Mesh[];
  glows: THREE.Sprite[];
  teethU: THREE.Mesh;
  teethL: THREE.Mesh;
  tongue: THREE.Mesh;
  drool: THREE.Mesh;
  ghosts: THREE.Mesh[];
  glowU: { value: number };
}
let _rt: FoxRuntime | null = null;
const SHELLS = 26;
const getRuntime = (): FoxRuntime => {
  if (_rt) return _rt;
  const A = getFoxAssets();
  const group = new THREE.Group();
  const base = new THREE.Mesh(A.model.geo, makeBaseMaterial({ dark: 0.62, back: "#6a1712" }));
  base.castShadow = true; base.receiveShadow = true; base.frustumCulled = false;
  group.add(base);
  const shells: THREE.Mesh[] = [];
  for (let i = 1; i <= SHELLS; i++) {
    const m = new THREE.Mesh(A.model.geo, makeFurMaterial(i / SHELLS, { density: 430, dark: 0.55, guard: 0.1, sheen: 0.15 }));
    m.frustumCulled = false; m.receiveShadow = true;
    m.renderOrder = i;
    shells.push(m); group.add(m);
  }
  const glowU = { value: 0 };
  const eyeMat = eyeMaterial(glowU);
  const cornMat = new THREE.MeshStandardMaterial({ color: "#000000", roughness: 0.04, metalness: 0.0, transparent: true, opacity: 0.25, depthWrite: false });
  const eyeMeshes: THREE.Mesh[] = [], corneas: THREE.Mesh[] = [], glows: THREE.Sprite[] = [];
  for (let k = 0; k < 2; k++) {
    const em = new THREE.Mesh(new THREE.SphereGeometry(EYE_R, 32, 24), eyeMat);
    em.matrixAutoUpdate = false; em.frustumCulled = false;
    const cm = new THREE.Mesh(new THREE.SphereGeometry(EYE_R * 1.04, 24, 16), cornMat);
    cm.matrixAutoUpdate = false; cm.frustumCulled = false;
    const gs = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow(), color: "#ffc860", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true }));
    eyeMeshes.push(em); corneas.push(cm); glows.push(gs);
    group.add(em, cm, gs);
  }
  const toothMat = new THREE.MeshStandardMaterial({ color: "#efe6cf", roughness: 0.3, emissive: "#3a352a", emissiveIntensity: 0.6 });
  const teethU = new THREE.Mesh(A.teethUp, toothMat), teethL = new THREE.Mesh(A.teethLo, toothMat);
  teethU.matrixAutoUpdate = teethL.matrixAutoUpdate = false;
  teethU.frustumCulled = teethL.frustumCulled = false;
  const tg = new THREE.SphereGeometry(1, 24, 12);
  tg.scale(0.042, 0.0055, 0.0125);
  tg.translate(0.348, 0.403, 0);
  const tongue = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ color: "#a8424a", roughness: 0.3 }));
  tongue.matrixAutoUpdate = false; tongue.frustumCulled = false;
  const drool = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: "#cfdae6", roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.4, emissive: "#1a2633", emissiveIntensity: 0.3 }));
  drool.frustumCulled = false;
  group.add(teethU, teethL, tongue, drool);
  const ghosts: THREE.Mesh[] = [];
  for (let k = 0; k < 4; k++) {
    const gm = new THREE.Mesh(A.model.ghost(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, transparent: true, opacity: 0.2, depthWrite: false }));
    gm.frustumCulled = false; gm.visible = false;
    ghosts.push(gm); group.add(gm);
  }
  _rt = { group, base, shells, eyeMeshes, corneas, glows, teethU, teethL, tongue, drool, ghosts, glowU };
  return _rt;
};

export interface FoxProps {
  pose: FoxPose;
  glow?: number; // eyeshine 0..1+
  glowSize?: number;
  drool?: number; // 0..1 drool strand length
  droolSwing?: number; // time for pendulum motion
  ghosts?: FoxPose[]; // motion blur trail (oldest last)
  shells?: number;
  furDensity?: number;
  tongueOut?: number;
}

// Renders the fox. All work happens synchronously during render (deterministic per frame).
export const Fox3D: React.FC<FoxProps> = ({ pose, glow = 0, glowSize = 1, drool = 0, droolSwing = 0, ghosts = [], shells = 16, tongueOut = 0, furDensity = 430 }) => {
  const A = getFoxAssets();
  const R = getRuntime();
  const M = solveFox(A.rig, pose);
  A.model.update(M);
  R.shells.forEach((m, i) => (m.visible = i < shells));
  R.shells.forEach((m, i) => { const u = (m.material as any).userData.uni; u.uShell.value = (i + 1) / Math.max(1, shells); u.uDensity.value = furDensity; });
  // eyes
  R.glowU.value = glow;
  const mh = M[FB.head];
  A.eyes.forEach((e, k) => {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), e.d);
    const local = new THREE.Matrix4().compose(e.c, q, new THREE.Vector3(1, 1, 1));
    R.eyeMeshes[k].matrix.copy(mh).multiply(local);
    R.corneas[k].matrix.copy(R.eyeMeshes[k].matrix);
    const wp = e.c.clone().addScaledVector(e.d, EYE_R * 1.4).applyMatrix4(mh);
    R.glows[k].position.copy(wp);
    const s = 0.09 * glow * glowSize;
    R.glows[k].scale.set(s, s, s);
    R.glows[k].visible = glow > 0.01;
    (R.glows[k].material as THREE.SpriteMaterial).opacity = Math.min(1, glow);
  });
  const open = pose.jaw ?? 0;
  const tv = sstep(0.09, 0.2, open);
  R.teethU.visible = R.teethL.visible = tv > 0.01;
  R.teethU.matrix.copy(mh);
  R.teethL.matrix.copy(M[FB.jaw]);
  const tq = new THREE.Matrix4().makeTranslation(tongueOut * 0.035, -tongueOut * 0.004, 0);
  R.tongue.matrix.copy(M[FB.jaw]).multiply(tq);
  R.tongue.visible = open > 0.03 || tongueOut > 0;
  // drool strand: hangs from the lower lip with a pendulum lag
  R.drool.visible = drool > 0.01;
  if (drool > 0.01) {
    const top = FOX_REST.lip.clone().applyMatrix4(M[FB.jaw]);
    const len = 0.03 + drool * 0.11;
    const sw = 0.25 * Math.sin(droolSwing * 5.0) + 0.1 * Math.sin(droolSwing * 11.0);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const u = i / 12;
      pts.push(new THREE.Vector3(top.x + Math.sin(sw) * len * u * u, top.y - len * u, top.z + Math.cos(droolSwing * 3) * 0.01 * u * u));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.TubeGeometry(curve, 24, 0.00045, 6, false);
    // thicken the strand towards a drop at the bottom
    const pa = tube.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const seg = Math.floor(i / 7) / 24;
      const c = curve.getPointAt(Math.min(1, seg));
      const k = 1 + 2.4 * Math.pow(seg, 6);
      pa.setXYZ(i, c.x + (pa.getX(i) - c.x) * k, c.y + (pa.getY(i) - c.y) * k, c.z + (pa.getZ(i) - c.z) * k);
    }
    tube.computeVertexNormals();
    R.drool.geometry.dispose();
    R.drool.geometry = tube;
  }
  // motion-blur ghosts
  R.ghosts.forEach((g, k) => {
    const gp = ghosts[k];
    g.visible = !!gp;
    if (gp) {
      const gm = solveFox(A.rig, gp);
      A.model.updateGhost(g.geometry, gm);
      (g.material as THREE.MeshStandardMaterial).opacity = 0.22 * (1 - k / Math.max(1, ghosts.length));
    }
  });
  if (ghosts.length) solveFox(A.rig, pose); // restore main pose matrices
  return <primitive object={R.group} />;
};
