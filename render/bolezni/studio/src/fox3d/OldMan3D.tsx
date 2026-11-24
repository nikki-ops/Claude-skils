import React from "react";
import * as THREE from "three";
import { Prim, V3, compileModel, meshSDF, skinWeights } from "./sdf";
import { Rig, BoneDef, SkinnedModel, ik2, makeBaseMaterial, makeFurMaterial, sstep, lerp, qEuler, clamp01 } from "./rig";

// =====================================================================================
// 68-year-old villager: bald with grey side hair, dark knitted cardigan over a light shirt,
// dark trousers, rubber boots. SDF-built, 17 bones, CPU-skinned. Rest: facing +x, right = +z.
// =====================================================================================
export const MB = { pelvis: 0, spine: 1, chest: 2, neck: 3, head: 4, armL: [5, 6, 7], armR: [8, 9, 10], legL: [11, 12, 13], legR: [14, 15, 16] };

const BONES: BoneDef[] = (() => {
  const b: BoneDef[] = [
    { name: "pelvis", parent: -1, pivot: [0, 0.95, 0], tip: [0, 1.08, 0] },
    { name: "spine", parent: 0, pivot: [0, 1.02, 0], tip: [0, 1.22, 0] },
    { name: "chest", parent: 1, pivot: [0, 1.2, 0], tip: [0, 1.42, 0] },
    { name: "neck", parent: 2, pivot: [-0.005, 1.43, 0], tip: [0.02, 1.54, 0] },
    { name: "head", parent: 3, pivot: [0.02, 1.53, 0], tip: [0.04, 1.72, 0] },
  ];
  for (const s of [-1, 1]) {
    const k = b.length;
    b.push({ name: "uarm" + s, parent: 2, pivot: [-0.01, 1.41, s * 0.19], tip: [-0.01, 1.13, s * 0.25] });
    b.push({ name: "farm" + s, parent: k, pivot: [-0.01, 1.13, s * 0.25], tip: [0.01, 0.885, s * 0.28] });
    b.push({ name: "hand" + s, parent: k + 1, pivot: [0.01, 0.885, s * 0.28], tip: [0.02, 0.73, s * 0.29] });
  }
  for (const s of [-1, 1]) {
    const k = b.length;
    b.push({ name: "thigh" + s, parent: 0, pivot: [0, 0.92, s * 0.095], tip: [0.01, 0.5, s * 0.1] });
    b.push({ name: "shin" + s, parent: k, pivot: [0.01, 0.5, s * 0.1], tip: [0, 0.095, s * 0.1] });
    b.push({ name: "foot" + s, parent: k + 1, pivot: [0, 0.095, s * 0.1], tip: [0.17, 0.03, s * 0.1] });
  }
  return b;
})();

const prims = (): Prim[] => {
  const P: Prim[] = [];
  const e = (bone: number, c: V3, r: V3, k = 0, rot?: V3, x: Partial<Prim> = {}) => P.push({ t: "e", bone, c, r, k, rot, ...x });
  const c = (bone: number, a: V3, b: V3, ra: number, rb: number, k = 0, x: Partial<Prim> = {}) => P.push({ t: "c", bone, a, b, ra, rb, k, ...x });
  e(MB.pelvis, [-0.015, 0.94, 0], [0.12, 0.12, 0.172]);
  e(MB.pelvis, [-0.005, 1.0, 0], [0.14, 0.07, 0.185], 0.05); // cardigan hem
  e(MB.spine, [0.035, 1.09, 0], [0.135, 0.13, 0.165], 0.08);
  e(MB.chest, [-0.005, 1.27, 0], [0.115, 0.16, 0.18], 0.08);
  e(MB.chest, [-0.045, 1.35, 0], [0.09, 0.09, 0.15], 0.06); // stoop
  for (const s of [-1, 1]) e(MB.chest, [-0.012, 1.395, s * 0.15], [0.075, 0.065, 0.085], 0.05);
  c(MB.neck, [-0.005, 1.4, 0], [0.025, 1.55, 0], 0.06, 0.05, 0.03);
  e(MB.head, [0.012, 1.635, 0], [0.1, 0.112, 0.086], 0.02);
  e(MB.head, [0.055, 1.565, 0], [0.068, 0.065, 0.066], 0.04);
  e(MB.head, [0.075, 1.545, 0], [0.035, 0.03, 0.04], 0.03); // chin
  c(MB.head, [0.1, 1.638, 0], [0.122, 1.598, 0], 0.011, 0.017, 0.012);
  e(MB.head, [0.088, 1.662, 0], [0.02, 0.013, 0.062], 0.02); // brow
  e(MB.head, [0.11, 1.585, 0], [0.012, 0.008, 0.03], 0.01); // moustache
  for (const s of [-1, 1]) e(MB.head, [0.002, 1.618, s * 0.084], [0.026, 0.038, 0.013], 0.012);
  for (const s of [-1, 1]) e(MB.head, [0.104, 1.636, s * 0.034], [0.015, 0.0095, 0.016], 0.006, undefined, { sub: true });
  for (const s of [-1, 1]) {
    const [ua, fa, hd] = s < 0 ? MB.armL : MB.armR;
    c(ua, [-0.01, 1.41, s * 0.19], [-0.01, 1.13, s * 0.25], 0.056, 0.047, 0.04);
    c(fa, [-0.01, 1.13, s * 0.25], [0.01, 0.9, s * 0.28], 0.047, 0.04, 0.02);
    e(hd, [0.02, 0.835, s * 0.284], [0.036, 0.05, 0.017], 0.012);
    c(hd, [0.022, 0.8, s * 0.284], [0.028, 0.735, s * 0.286], 0.016, 0.012, 0.012, { sq: { o: [0.025, 0.77, s * 0.285], n: [0, 0, 1], s: 0.65 } });
    c(hd, [0.048, 0.86, s * 0.274], [0.066, 0.808, s * 0.27], 0.011, 0.009, 0.01);
  }
  for (const s of [-1, 1]) {
    const [th, sh, ft] = s < 0 ? MB.legL : MB.legR;
    c(th, [0, 0.92, s * 0.095], [0.01, 0.5, s * 0.1], 0.086, 0.058, 0.05);
    c(sh, [0.01, 0.5, s * 0.1], [0, 0.1, s * 0.1], 0.056, 0.046, 0.02);
    c(sh, [0.005, 0.34, s * 0.1], [0, 0.11, s * 0.1], 0.063, 0.056, 0.012); // boot shaft
    e(ft, [0.06, 0.052, s * 0.1], [0.135, 0.054, 0.058], 0.03);
    e(ft, [0.14, 0.04, s * 0.1], [0.06, 0.04, 0.055], 0.02);
  }
  return P;
};

interface ManAssets { rig: Rig; model: SkinnedModel; buildMs: number }
let _man: ManAssets | null = null;
const hash3 = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };

export const getManAssets = (): ManAssets => {
  if (_man) return _man;
  const t0 = performance.now();
  const NB = BONES.length;
  const model = compileModel(prims(), NB);
  const mesh = meshSDF(model.field, [-0.2, -0.01, -0.36], [0.24, 1.77, 0.36], 0.0075);
  const { si, sw } = skinWeights(model, mesh.pos, 0.025);
  const nv = mesh.pos.length / 3;
  const W = (i: number, b: number) => { let w = 0; for (let j = 0; j < 4; j++) if (si[i * 4 + j] === b) w += sw[i * 4 + j]; return w; };
  const color = new Float32Array(nv * 3), fur = new Float32Array(nv), comb = new Float32Array(nv * 3);
  const SKIN = [0.8, 0.58, 0.47], SCALP = [0.84, 0.63, 0.53], HAIR = [0.74, 0.73, 0.7], CARD = [0.25, 0.25, 0.27], SHIRT = [0.8, 0.79, 0.72], TROU = [0.14, 0.14, 0.16], BOOT = [0.07, 0.085, 0.07];
  const mixc = (a: number[], b: number[], t: number) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  for (let i = 0; i < nv; i++) {
    const x = mesh.pos[i * 3], y = mesh.pos[i * 3 + 1], z = mesh.pos[i * 3 + 2];
    const ny = mesh.nrm[i * 3 + 1], nx = mesh.nrm[i * 3];
    const az = Math.abs(z);
    const wHead = W(i, MB.head), wNeck = W(i, MB.neck);
    const wHand = W(i, MB.armL[2]) + W(i, MB.armR[2]);
    const wArm = W(i, MB.armL[0]) + W(i, MB.armL[1]) + W(i, MB.armR[0]) + W(i, MB.armR[1]);
    const wLeg = [...MB.legL, ...MB.legR].reduce((s, b) => s + W(i, b), 0);
    let col = CARD;
    let fl = 0;
    // knit rib texture
    const rib = 0.9 + 0.1 * Math.sin((az * 0.9 + x * 0.4) * 420) + 0.05 * (hash3(Math.floor(x * 300), Math.floor(y * 300), Math.floor(z * 300)) - 0.5);
    col = col.map((v) => v * rib);
    // V-neck shirt + collar
    const vneck = x > 0.03 && y > 1.24 && az < 0.006 + (y - 1.24) * 0.32 && nx > 0.25;
    if (vneck) col = SHIRT;
    if (y > 1.42 && y < 1.47 && az < 0.075 && wNeck + W(i, MB.chest) > 0.4) col = SHIRT;
    // buttons
    if (x > 0.1 && az < 0.012 && y > 0.98 && y < 1.2 && Math.abs(((y - 0.98) % 0.065) - 0.032) < 0.008) col = [0.55, 0.5, 0.42];
    // trousers below the hem
    if (y < 0.955 && wArm + wHand < 0.3) col = TROU;
    if (wLeg > 0.5) col = TROU;
    if (y < 0.355 && wLeg > 0.3) col = BOOT;
    // sleeves: shirt cuff at the wrist
    if (wArm > 0.3 && y < 0.93 && y > 0.875) col = SHIRT;
    if (wHand > 0.5) col = SKIN;
    // head
    if (wHead + wNeck * (y > 1.47 ? 1 : 0) > 0.5) {
      col = SKIN;
      if (y > 1.66) col = mixc(SKIN, SCALP, sstep(1.66, 1.7, y));
      // age spots on the scalp
      if (y > 1.68 && hash3(Math.floor(x * 60), Math.floor(y * 60), Math.floor(z * 60)) > 0.95) col = mixc(col, [0.68, 0.48, 0.38], 0.3);
      // grey side/back hair band
      const band = sstep(1.565, 1.59, y) * sstep(1.705, 1.67, y) * sstep(0.03, -0.01, x);
      if (band > 0.3 && !(az > 0.075 && Math.abs(y - 1.62) < 0.045 && x > -0.03)) { col = mixc(col, HAIR, band); fl = 0.011 * band; }
      // moustache, brows, stubble
      if (x > 0.108 && y > 1.578 && y < 1.594 && az < 0.032) { col = [0.62, 0.6, 0.57]; fl = 0.004; }
      if (x > 0.09 && y > 1.658 && y < 1.672 && az > 0.014 && az < 0.055) { col = [0.55, 0.53, 0.5]; fl = 0.003; }
      if (x > 0.03 && y < 1.575 && y > 1.5) col = mixc(col, [0.6, 0.55, 0.52], 0.35);
      // eye sockets darker, lips
      if (x > 0.085 && Math.abs(y - 1.636) < 0.014 && az > 0.018 && az < 0.052) col = mixc(col, [0.45, 0.28, 0.24], 0.45);
      if (x > 0.105 && Math.abs(y - 1.566) < 0.005 && az < 0.03) col = [0.45, 0.25, 0.22];
      // ears pinker
      if (az > 0.075 && Math.abs(y - 1.62) < 0.045) col = mixc(col, [0.85, 0.5, 0.45], 0.4);
    }
    const nz = 0.95 + 0.1 * hash3(Math.floor(x * 90), Math.floor(y * 90), Math.floor(z * 90));
    color[i * 3] = Math.pow(col[0] * nz, 2.2); color[i * 3 + 1] = Math.pow(col[1] * nz, 2.2); color[i * 3 + 2] = Math.pow(col[2] * nz, 2.2);
    fur[i] = fl;
    comb[i * 3] = -0.6; comb[i * 3 + 1] = -0.8; comb[i * 3 + 2] = 0;
    void ny;
  }
  const smodel = new SkinnedModel({ mesh, si, sw, color, fur, comb });
  _man = { rig: new Rig(BONES), model: smodel, buildMs: performance.now() - t0 };
  return _man;
};

// =====================================================================================
export interface ManPose {
  pos: THREE.Vector3; // pelvis pivot (world)
  yaw: number; lean: number; // lean: forward pitch of the pelvis (rad, + = forward)
  roll?: number;
  spine?: [number, number, number]; // forward bend, twist, side bend
  chest?: [number, number, number];
  head?: [number, number, number]; // nod (+down), turn, tilt
  feet: [THREE.Vector3, THREE.Vector3]; // ankle targets L R (world)
  footYaw?: [number, number];
  hands: [THREE.Vector3, THREE.Vector3]; // wrist targets L R (world)
  handBend?: [number, number];
  elbowOut?: [number, number];
  kneeOut?: number;
}

const Z = new THREE.Vector3(0, 0, 1), X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);
export const solveMan = (rig: Rig, s: ManPose) => {
  rig.setWorld(MB.pelvis, qEuler(s.roll ?? 0, s.yaw, -s.lean), s.pos);
  const sp = s.spine ?? [0, 0, 0], ch = s.chest ?? [0, 0, 0], hd = s.head ?? [0, 0, 0];
  rig.setLocal(MB.spine, qEuler(sp[2], sp[1], -sp[0]));
  rig.setLocal(MB.chest, qEuler(ch[2], ch[1], -ch[0]));
  rig.setLocal(MB.neck, qEuler(hd[2] * 0.4, hd[1] * 0.4, -hd[0] * 0.4));
  rig.setLocal(MB.head, qEuler(hd[2] * 0.6, hd[1] * 0.6, -hd[0] * 0.6));
  const pq = rig.R[MB.pelvis], cq = rig.R[MB.chest];
  // legs
  [MB.legL, MB.legR].forEach(([th, sh, ft], k) => {
    const sd = k ? 1 : -1;
    const fwd = X.clone().applyQuaternion(pq), side = Z.clone().applyQuaternion(pq);
    const S = rig.inheritPos(th);
    const T = s.feet[k];
    const pole = fwd.clone().addScaledVector(side, sd * (s.kneeOut ?? 0.15));
    const E = ik2(S, T, rig.len[th], rig.len[sh], pole);
    const lat = new THREE.Vector3().crossVectors(E.clone().sub(S), pole).normalize();
    rig.setWorld(th, Rig.align(rig.restDir[th], Z, E.clone().sub(S), lat.lengthSq() > 0.5 ? lat : side));
    rig.setWorld(sh, Rig.align(rig.restDir[sh], Z, T.clone().sub(E), lat.lengthSq() > 0.5 ? lat : side));
    rig.setWorld(ft, qEuler(0, s.yaw + (s.footYaw?.[k] ?? 0), 0));
  });
  // arms
  [MB.armL, MB.armR].forEach(([ua, fa, hd2], k) => {
    const sd = k ? 1 : -1;
    const fwd = X.clone().applyQuaternion(cq), side = Z.clone().applyQuaternion(cq), up = Y.clone().applyQuaternion(cq);
    const S = rig.inheritPos(ua);
    const T = s.hands[k];
    const pole = fwd.clone().multiplyScalar(-0.6).addScaledVector(up, -0.6).addScaledVector(side, sd * (s.elbowOut?.[k] ?? 0.6));
    const E = ik2(S, T, rig.len[ua], rig.len[fa], pole);
    const lat = side.clone();
    rig.setWorld(ua, Rig.align(rig.restDir[ua], Z.clone().multiplyScalar(1), E.clone().sub(S), lat));
    const dirF = T.clone().sub(E);
    rig.setWorld(fa, Rig.align(rig.restDir[fa], Z, dirF, lat));
    const bend = s.handBend?.[k] ?? 0.2;
    rig.setLocal(hd2, qEuler(0, 0, -bend));
  });
  return rig.M;
};

// world position of a point on the right forearm (u: 0 elbow .. 1 wrist)
export const manForearm = (rig: Rig, u: number) => {
  const [, fa] = MB.armR;
  const a = new THREE.Vector3(-0.01, 1.13, 0.25), b = new THREE.Vector3(0.01, 0.885, 0.28);
  return a.lerp(b, u).applyMatrix4(rig.M[fa]);
};

interface ManRuntime { group: THREE.Group; base: THREE.Mesh; shells: THREE.Mesh[]; eyes: THREE.Mesh[] }
let _rt: ManRuntime | null = null;
const getRuntime = () => {
  if (_rt) return _rt;
  const A = getManAssets();
  const group = new THREE.Group();
  const base = new THREE.Mesh(A.model.geo, makeBaseMaterial({ dark: 1.0, rough: 0.82, back: "#201510" }));
  base.castShadow = true; base.receiveShadow = true; base.frustumCulled = false;
  group.add(base);
  const shells: THREE.Mesh[] = [];
  for (let i = 1; i <= 7; i++) {
    const m = new THREE.Mesh(A.model.geo, makeFurMaterial(i / 7, { density: 700, dark: 0.7, sheen: 0.4 }));
    m.frustumCulled = false; shells.push(m); group.add(m);
  }
  const eyes: THREE.Mesh[] = [];
  for (const s of [-1, 1]) {
    const g = new THREE.SphereGeometry(0.0082, 16, 12);
    g.translate(0.097, 1.636, s * 0.034);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#a89c8e", roughness: 0.2 }));
    m.matrixAutoUpdate = false; m.frustumCulled = false;
    const gi = new THREE.SphereGeometry(0.0055, 12, 10);
    gi.translate(0.1025, 1.6355, s * 0.034);
    const mi = new THREE.Mesh(gi, new THREE.MeshStandardMaterial({ color: "#2a2018", roughness: 0.1 }));
    mi.matrixAutoUpdate = false; mi.frustumCulled = false;
    eyes.push(m, mi); group.add(m, mi);
  }
  _rt = { group, base, shells, eyes };
  return _rt;
};

export const OldMan3D: React.FC<{ pose: ManPose }> = ({ pose }) => {
  const A = getManAssets();
  const R = getRuntime();
  const M = solveMan(A.rig, pose);
  A.model.update(M);
  R.eyes.forEach((e) => e.matrix.copy(M[MB.head]));
  return <primitive object={R.group} />;
};

// --------------------------------------------------------------- handy poses
// crouched weeding at (x, z), facing yaw; phase drives the weeding hand
export const crouchPose = (x: number, z: number, yaw: number, phase: number, ground = 0): ManPose => {
  const fwd = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)), side = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const at = (f: number, s: number, y: number) => new THREE.Vector3(x, ground + y, z).addScaledVector(fwd, f).addScaledVector(side, s);
  const pull = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
  return {
    pos: at(-0.2, 0, 0.47),
    yaw, lean: 0.55,
    spine: [0.25, 0.05, 0], chest: [0.15, 0.1 * Math.sin(phase * Math.PI * 2), 0],
    head: [-0.35, 0.05, 0.05],
    feet: [at(0.08, -0.17, 0.095), at(0.12, 0.17, 0.095)],
    footYaw: [-0.3, 0.3],
    hands: [at(0.28, -0.13, 0.42), at(0.42 - 0.08 * pull, 0.1, 0.08 + 0.12 * pull)],
    handBend: [0.6, 0.9 - 0.4 * pull],
    kneeOut: 0.55,
    elbowOut: [0.5, 0.4],
  };
};

export const blendMan = (a: ManPose, b: ManPose, t: number): ManPose => {
  const L3 = (p?: [number, number, number], q?: [number, number, number]) => [0, 1, 2].map((i) => lerp(p?.[i] ?? 0, q?.[i] ?? 0, t)) as [number, number, number];
  const L2 = (p?: [number, number], q?: [number, number], d = 0) => [0, 1].map((i) => lerp(p?.[i] ?? d, q?.[i] ?? d, t)) as [number, number];
  return {
    pos: a.pos.clone().lerp(b.pos, t), yaw: lerp(a.yaw, b.yaw, t), lean: lerp(a.lean, b.lean, t), roll: lerp(a.roll ?? 0, b.roll ?? 0, t),
    spine: L3(a.spine, b.spine), chest: L3(a.chest, b.chest), head: L3(a.head, b.head),
    feet: [a.feet[0].clone().lerp(b.feet[0], t), a.feet[1].clone().lerp(b.feet[1], t)],
    footYaw: L2(a.footYaw, b.footYaw), hands: [a.hands[0].clone().lerp(b.hands[0], t), a.hands[1].clone().lerp(b.hands[1], t)],
    handBend: L2(a.handBend, b.handBend, 0.2), elbowOut: L2(a.elbowOut, b.elbowOut, 0.6), kneeOut: lerp(a.kneeOut ?? 0.15, b.kneeOut ?? 0.15, t),
  };
};
export { clamp01 };
