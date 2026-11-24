import React from "react";
import * as THREE from "three";
import { mulberry } from "../components/rand";
import { makeCabbage, makePotato, makeTomato, makeTuft, makeSpruce, makeBirch, Geo } from "./plants";
import { soilTex, woodTex, logTex, windowTex, windowDayTex, nalichnikTex, mistTex } from "./textures";
import { softGlow, sstep } from "./rig";

// =====================================================================================
// Russian village vegetable garden. World: y up, metres. Beds run along x.
// Fence on the left (x = FENCE_X), log house across the back (z = HOUSE_Z).
// =====================================================================================
export const FENCE_X = -1.45;
export const HOUSE_Z = -12.6;
export const BED_X: [number, number] = [-0.55, 6.4];
export type BedKind = "cabbage" | "potato" | "tomato" | "onion";
export const BEDS: { z: number; kind: BedKind }[] = (["cabbage", "potato", "cabbage", "cabbage", "cabbage", "tomato", "potato", "onion", "potato", "cabbage"] as BedKind[]).map((kind, i) => ({ z: 2.2 - i * 1.45, kind }));
export const WINDOWS = [
  { x: 1.7, y: 1.45, lit: 1.0 },
  { x: 4.35, y: 1.45, lit: 0.35 },
];

const vnoise = (x: number, z: number) => {
  const h = (a: number, b: number) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  return (h(ix, iz) * (1 - ux) + h(ix + 1, iz) * ux) * (1 - uz) + (h(ix, iz + 1) * (1 - ux) + h(ix + 1, iz + 1) * ux) * uz;
};

// ground height (exported so characters can stand on it)
export const groundH = (x: number, z: number) => {
  let h = 0.012 * (vnoise(x * 6, z * 6) - 0.5) + 0.02 * (vnoise(x * 1.3, z * 1.3) - 0.5);
  const inX = sstep(BED_X[0] - 0.15, BED_X[0] + 0.1, x) * sstep(BED_X[1] + 0.15, BED_X[1] - 0.1, x);
  let best = 9, bed = BEDS[0];
  for (const b of BEDS) { const d = Math.abs(z - b.z); if (d < best) { best = d; bed = b; } }
  if (best < 0.75 && inX > 0) {
    const dz = z - bed.z;
    let bh = 0.1 * sstep(0.6, 0.4, Math.abs(dz));
    if (bed.kind === "potato") bh = 0.03 * sstep(0.6, 0.4, Math.abs(dz)) + 0.1 * (Math.exp(-(((dz - 0.24) / 0.13) ** 2)) + Math.exp(-(((dz + 0.24) / 0.13) ** 2)));
    else bh += 0.012 * Math.sin(dz * 38) * sstep(0.45, 0.3, Math.abs(dz));
    bh += 0.015 * (vnoise(x * 14, z * 14) - 0.5) * sstep(0.6, 0.4, Math.abs(dz));
    h += bh * inX;
  }
  return h;
};

const groundColor = (x: number, z: number, out: number[]) => {
  const inX = sstep(BED_X[0] - 0.25, BED_X[0] + 0.05, x) * sstep(BED_X[1] + 0.25, BED_X[1] - 0.05, x);
  let best = 9;
  for (const b of BEDS) best = Math.min(best, Math.abs(z - b.z));
  const bedness = sstep(0.62, 0.45, best) * inX;
  const inGarden = inX * sstep(3.6, 3.2, z) * sstep(-12.3, -11.9, z);
  const n = vnoise(x * 3, z * 3), n2 = vnoise(x * 0.7 + 9, z * 0.7);
  const soil = [0.2 + 0.05 * n, 0.15 + 0.035 * n, 0.11 + 0.02 * n];
  const path = [0.27 + 0.04 * n, 0.22 + 0.03 * n, 0.16 + 0.02 * n];
  const grass = [0.17 + 0.08 * n2, 0.23 + 0.07 * n2, 0.1 + 0.03 * n];
  let c = path.map((p, i) => p + (soil[i] - p) * bedness);
  const g = 1 - inGarden;
  c = c.map((v, i) => v + (grass[i] - v) * g);
  for (let i = 0; i < 3; i++) out[i] = Math.pow(c[i], 2.2);
};

interface GardenAssets { group: THREE.Group; nightOnly: THREE.Object3D[]; dayOnly: THREE.Object3D[]; windowMats: THREE.MeshBasicMaterial[]; sky: THREE.ShaderMaterial; glows: THREE.Sprite[]; buildMs: number }
let _g: GardenAssets | null = null;

const inst = (geo: THREE.BufferGeometry, mat: THREE.Material, mats: THREE.Matrix4[], shadow = true, colors?: THREE.Color[]) => {
  const m = new THREE.InstancedMesh(geo, mat, mats.length);
  mats.forEach((mm, i) => m.setMatrixAt(i, mm));
  if (colors) colors.forEach((c, i) => m.setColorAt(i, c));
  m.castShadow = shadow; m.receiveShadow = true;
  m.frustumCulled = false;
  m.instanceMatrix.needsUpdate = true;
  return m;
};
const TRS = (x: number, y: number, z: number, ry = 0, s = 1, rx = 0, rz = 0, sy = s) =>
  new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(s, sy, s));

const buildGarden = (): GardenAssets => {
  const t0 = performance.now();
  const r = mulberry(4242);
  const group = new THREE.Group();
  const nightOnly: THREE.Object3D[] = [], dayOnly: THREE.Object3D[] = [];
  const plantMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide });
  const grassMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });

  // ---------------- ground (fine mesh over the garden, coarse outside)
  const soil = soilTex().clone();
  soil.needsUpdate = true;
  soil.repeat.set(1, 1);
  const mkGround = (x0: number, x1: number, z0: number, z1: number, step: number, y0: number) => {
    const nx = Math.round((x1 - x0) / step), nz = Math.round((z1 - z0) / step);
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz);
    g.rotateX(-Math.PI / 2);
    g.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3), c = [0, 0, 0];
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i);
      p.setY(i, groundH(x, z) + y0);
      groundColor(x, z, c);
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      uv.setXY(i, x / 1.6, z / 1.6);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, map: soil, bumpMap: soil, bumpScale: 1.5, roughness: 0.97 }));
    m.receiveShadow = true;
    return m;
  };
  group.add(mkGround(-4, 8, -13.5, 5, 0.035, 0));
  group.add(mkGround(-70, 70, -70, 50, 0.6, -0.03));

  // ---------------- beds
  const cabG = [0, 1, 2].map((k) => makeCabbage(100 + k));
  const potG = [0, 1].map((k) => makePotato(200 + k));
  const tomG = [0, 1].map((k) => makeTomato(300 + k));
  const onionG = makeTuft(400, "onion"), weedG = makeTuft(401, "weed");
  const cabM: THREE.Matrix4[][] = [[], [], []], potM: THREE.Matrix4[][] = [[], []], tomM: THREE.Matrix4[][] = [[], []], onM: THREE.Matrix4[] = [], weM: THREE.Matrix4[] = [];
  for (const b of BEDS) {
    if (b.kind === "cabbage") {
      for (const row of [-0.24, 0.24])
        for (let x = BED_X[0] + 0.3 + (row > 0 ? 0.27 : 0); x < BED_X[1] - 0.2; x += 0.55) {
          const xx = x + (r() - 0.5) * 0.08, zz = b.z + row + (r() - 0.5) * 0.06;
          const s = 0.85 + r() * 0.35;
          if (b.z === BEDS[3].z && xx > -0.7 && xx < 1.95) { if (r() < 0.25) weM.push(TRS(xx, groundH(xx, zz), zz, r() * 6.28, 1.2)); continue; } // harvested patch
          cabM[Math.floor(r() * 3)].push(TRS(xx, groundH(xx, zz) - 0.01, zz, r() * 6.28, s, (r() - 0.5) * 0.1, (r() - 0.5) * 0.1));
        }
    } else if (b.kind === "potato") {
      for (const row of [-0.24, 0.24])
        for (let x = BED_X[0] + 0.25; x < BED_X[1] - 0.15; x += 0.38) {
          const xx = x + (r() - 0.5) * 0.1, zz = b.z + row + (r() - 0.5) * 0.05;
          potM[Math.floor(r() * 2)].push(TRS(xx, groundH(xx, zz) - 0.02, zz, r() * 6.28, 0.9 + r() * 0.35));
        }
    } else if (b.kind === "tomato") {
      for (let x = BED_X[0] + 0.35; x < BED_X[1] - 0.2; x += 0.62) {
        const xx = x + (r() - 0.5) * 0.06;
        tomM[Math.floor(r() * 2)].push(TRS(xx, groundH(xx, b.z), b.z + (r() - 0.5) * 0.06, r() * 6.28, 0.9 + r() * 0.15, (r() - 0.5) * 0.06, (r() - 0.5) * 0.06));
      }
    } else {
      for (const row of [-0.3, -0.1, 0.1, 0.3])
        for (let x = BED_X[0] + 0.15; x < BED_X[1] - 0.1; x += 0.13) {
          const xx = x + (r() - 0.5) * 0.04, zz = b.z + row;
          onM.push(TRS(xx, groundH(xx, zz), zz, r() * 6.28, 0.7 + r() * 0.5));
        }
    }
    // sparse weeds
    for (let k = 0; k < 18; k++) {
      const xx = BED_X[0] + r() * (BED_X[1] - BED_X[0]), zz = b.z + (r() - 0.5) * 1.0;
      weM.push(TRS(xx, groundH(xx, zz), zz, r() * 6.28, 0.6 + r() * 0.8));
    }
  }
  cabM.forEach((ms, k) => ms.length && group.add(inst(cabG[k], plantMat, ms)));
  potM.forEach((ms, k) => ms.length && group.add(inst(potG[k], plantMat, ms)));
  tomM.forEach((ms, k) => ms.length && group.add(inst(tomG[k], plantMat, ms)));
  group.add(inst(onionG, plantMat, onM, false));
  group.add(inst(weedG, grassMat, weM, false));

  // ---------------- grass tufts: along the fence strip, outside the garden, path edges
  const tuftG = [0, 1, 2].map((k) => makeTuft(500 + k, k === 2 ? "dry" : "grass"));
  const tM: THREE.Matrix4[][] = [[], [], []];
  const addTuft = (x: number, z: number, s = 1) => tM[Math.floor(r() * 3)].push(TRS(x, groundH(x, z) - 0.005, z, r() * 6.28, s * (0.7 + r() * 0.7)));
  for (let i = 0; i < 2600; i++) {
    const z = -12.3 + r() * 16;
    const x = -3.2 + r() * 2.55;
    if (x > -1.05 && x < -0.75 && r() < 0.8) continue; // keep the trodden fox path clearer
    if (x > -1.3 && x < -0.55 && z > -2.6 && z < 2.6) continue; // FoxEnter camera / close-up spot
    addTuft(x, z, x < FENCE_X ? 1.4 : 1);
  }
  for (let i = 0; i < 900; i++) addTuft(BED_X[1] + 0.2 + r() * 1.5, -12.3 + r() * 16);
  for (let i = 0; i < 600; i++) addTuft(-0.8 + r() * 7.6, 3.4 + r() * 1.6);
  for (let i = 0; i < 700; i++) { const a = r() * 6.28, d = 9 + r() * 25; addTuft(2 + Math.cos(a) * d, -4 + Math.sin(a) * d, 1.6); }
  tM.forEach((ms, k) => group.add(inst(tuftG[k], grassMat, ms, false)));

  // ---------------- picket fence
  const wood = woodTex();
  const fenceMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.92, color: "#ffffff" });
  const pk = new THREE.Shape();
  const pw = 0.085, ph = 1.22;
  pk.moveTo(-pw / 2, 0); pk.lineTo(pw / 2, 0); pk.lineTo(pw / 2, ph); pk.lineTo(0, ph + 0.07); pk.lineTo(-pw / 2, ph); pk.closePath();
  const picket = new THREE.ExtrudeGeometry(pk, { depth: 0.02, bevelEnabled: false });
  picket.translate(0, 0, -0.01);
  const uvp = picket.attributes.uv as THREE.BufferAttribute, pp = picket.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < uvp.count; i++) uvp.setXY(i, pp.getX(i) * 3 + 0.5, pp.getY(i) * 0.8);
  const pkM: THREE.Matrix4[] = [], pkC: THREE.Color[] = [];
  const addRun = (x0: number, z0: number, x1: number, z1: number) => {
    const L = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(L / 0.135), yaw = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < n; i++) {
      if (r() < 0.025) continue; // a missing picket here and there
      const u = (i + 0.5) / n;
      const x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u;
      pkM.push(TRS(x, -0.05, z, yaw, 1, (r() - 0.5) * 0.06, (r() - 0.5) * 0.08, 0.92 + r() * 0.14));
      const v = 0.75 + r() * 0.35;
      pkC.push(new THREE.Color(v, v * (0.97 + r() * 0.04), v * (0.9 + r() * 0.08)));
    }
    // rails + posts (on the outside)
    const rail = new THREE.BoxGeometry(L, 0.07, 0.04);
    const ou = new THREE.Vector3(-(z1 - z0), 0, -(x1 - x0)).normalize().multiplyScalar(-0.035);
    for (const y of [0.32, 0.98]) {
      const m = new THREE.Mesh(rail, fenceMat);
      m.position.set((x0 + x1) / 2 + ou.x, y, (z0 + z1) / 2 + ou.z);
      m.rotation.y = yaw; m.castShadow = true; m.receiveShadow = true;
      group.add(m);
    }
    for (let d = 0; d <= L; d += 2.4) {
      const u = d / L;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.45, 0.1), fenceMat);
      m.position.set(x0 + (x1 - x0) * u + ou.x * 2.4, 0.68, z0 + (z1 - z0) * u + ou.z * 2.4);
      m.rotation.set((r() - 0.5) * 0.04, yaw, (r() - 0.5) * 0.04);
      m.castShadow = true;
      group.add(m);
    }
  };
  addRun(FENCE_X, 4.5, FENCE_X, HOUSE_Z + 0.15);
  addRun(FENCE_X, HOUSE_Z + 0.15, 0.05, HOUSE_Z + 0.15);
  addRun(7.0, HOUSE_Z + 0.15, 7.0, 4.5);
  group.add(inst(picket, fenceMat, pkM, true, pkC));

  // ---------------- log house wall
  const logs = logTex();
  const logMat = new THREE.MeshStandardMaterial({ map: logs, roughness: 0.9, color: "#c8b8a8" });
  const hx0 = 0.15, hx1 = 6.7, step = 0.245, R = 0.135;
  const logGeo = (L: number) => { const g = new THREE.CylinderGeometry(R, R, L, 18, 1); g.rotateZ(Math.PI / 2); return g; };
  const front = logGeo(hx1 - hx0 + 0.5), side = logGeo(4.5);
  for (let k = 0; k < 11; k++) {
    const y = 0.42 + k * step;
    const m = new THREE.Mesh(front, logMat);
    m.position.set((hx0 + hx1) / 2, y, HOUSE_Z);
    m.rotation.x = k * 1.3; m.castShadow = true; m.receiveShadow = true;
    group.add(m);
    const s = new THREE.Mesh(side, logMat);
    s.position.set(hx0 + 0.02, y + step / 2, HOUSE_Z - 2.0);
    s.rotation.set(k * 0.7, Math.PI / 2, 0);
    s.castShadow = true; s.receiveShadow = true;
    group.add(s);
    // caulking between logs
    const ck = new THREE.Mesh(new THREE.BoxGeometry(hx1 - hx0, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: "#8c7a5a", roughness: 1 }));
    ck.position.set((hx0 + hx1) / 2, y + step / 2, HOUSE_Z + R * 0.72);
    group.add(ck);
  }
  const found = new THREE.Mesh(new THREE.BoxGeometry(hx1 - hx0 + 0.4, 0.34, 0.45), new THREE.MeshStandardMaterial({ color: "#3a3835", roughness: 1, map: soilTex() }));
  found.position.set((hx0 + hx1) / 2, 0.14, HOUSE_Z + 0.02);
  found.receiveShadow = true;
  group.add(found);
  // eaves board
  const eave = new THREE.Mesh(new THREE.BoxGeometry(hx1 - hx0 + 0.8, 0.22, 0.05), new THREE.MeshStandardMaterial({ color: "#2b231c", roughness: 1 }));
  eave.position.set((hx0 + hx1) / 2, 3.25, HOUSE_Z + 0.55);
  group.add(eave);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(hx1 - hx0 + 0.8, 0.04, 1.6), new THREE.MeshStandardMaterial({ color: "#1d1d1f", roughness: 0.7, metalness: 0.3 }));
  roof.position.set((hx0 + hx1) / 2, 3.55, HOUSE_Z - 0.1);
  roof.rotation.x = 0.55;
  group.add(roof);

  // windows: glowing interior, white frame cross, carved platband, sill
  const windowMats: THREE.MeshBasicMaterial[] = [];
  const glows: THREE.Sprite[] = [];
  const frameMat = new THREE.MeshStandardMaterial({ color: "#e8e4da", roughness: 0.7 });
  for (const w of WINDOWS) {
    const ww = 0.66, wh = 0.92, zf = HOUSE_Z + R + 0.02;
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: windowTex(), color: new THREE.Color(1, 1, 1).multiplyScalar(w.lit * 1.6), toneMapped: false }));
    pane.position.set(w.x, w.y, zf - 0.03);
    windowMats.push(pane.material as THREE.MeshBasicMaterial);
    group.add(pane);
    const bar = (sx: number, sy: number, x: number, y: number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, 0.04), frameMat);
      m.position.set(w.x + x, w.y + y, zf);
      m.castShadow = true;
      group.add(m);
    };
    bar(ww + 0.08, 0.05, 0, wh / 2); bar(ww + 0.08, 0.05, 0, -wh / 2); bar(0.05, wh, -ww / 2, 0); bar(0.05, wh, ww / 2, 0);
    bar(0.035, wh, 0, 0); bar(ww, 0.035, 0, wh * 0.18);
    const nal = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.62), new THREE.MeshStandardMaterial({ map: nalichnikTex(), transparent: true, alphaTest: 0.5, roughness: 0.75, side: THREE.DoubleSide }));
    nal.position.set(w.x, w.y + 0.12, zf + 0.03);
    nal.castShadow = true;
    group.add(nal);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(ww + 0.25, 0.04, 0.14), frameMat);
    sill.position.set(w.x, w.y - wh / 2 - 0.06, zf + 0.06);
    group.add(sill);
    const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow(), color: "#ffb35c", transparent: true, opacity: 0.55 * w.lit, blending: THREE.AdditiveBlending, depthWrite: false }));
    gl.position.set(w.x, w.y, zf + 0.3);
    gl.scale.set(2.6, 2.6, 1);
    glows.push(gl); group.add(gl); nightOnly.push(gl);
  }
  // rain barrel by the corner
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.27, 0.85, 24), new THREE.MeshStandardMaterial({ map: wood, color: "#7a6550", roughness: 0.9 }));
  barrel.position.set(0.75, 0.43, HOUSE_Z + 0.55);
  barrel.castShadow = true; barrel.receiveShadow = true;
  group.add(barrel);
  for (const y of [0.15, 0.7]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.295, 0.012, 6, 32), new THREE.MeshStandardMaterial({ color: "#2a2a2a", metalness: 0.6, roughness: 0.5 }));
    hoop.rotation.x = Math.PI / 2; hoop.position.set(0.75, y, HOUSE_Z + 0.55);
    group.add(hoop);
  }

  // ---------------- tree line
  const spr = makeSpruce(7), bir = makeBirch(8);
  const sM: THREE.Matrix4[] = [], bM: THREE.Matrix4[] = [];
  for (let i = 0; i < 140; i++) {
    const a = -Math.PI * 0.05 + r() * Math.PI * 1.25; // behind and to the sides
    const d = 34 + r() * 26;
    const x = 2 + Math.cos(a + Math.PI) * d, z = -6 - Math.abs(Math.sin(a)) * d;
    const h = 7 + r() * 7;
    if (r() < 0.65) sM.push(TRS(x, -0.1, z, r() * 6.28, h, 0, 0, h));
    else bM.push(TRS(x, -0.1, z, r() * 6.28, h * 0.9));
  }
  const treeMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  group.add(inst(spr, treeMat, sM, false), inst(bir, treeMat, bM, false));
  // neighbour's roof silhouette far behind
  const nb = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.4, 4), new THREE.MeshStandardMaterial({ color: "#2a2622", roughness: 1 }));
  nb.position.set(-9, 4.0, -22); nb.rotation.y = Math.PI / 4; nb.scale.set(1, 1, 0.6);
  group.add(nb);
  const nbw = new THREE.Mesh(new THREE.BoxGeometry(6, 2.8, 4), new THREE.MeshStandardMaterial({ color: "#2e2824", roughness: 1 }));
  nbw.position.set(-9, 1.4, -22);
  group.add(nbw);
  const nwin = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 0.75, 0.3), toneMapped: false }));
  nwin.position.set(-8.2, 1.6, -19.99);
  group.add(nwin); nightOnly.push(nwin);

  // ---------------- sky dome with stars, moon
  const sky = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uDay: { value: 0 }, uMoon: { value: new THREE.Vector3(-0.35, 0.5, -0.8).normalize() }, uSun: { value: new THREE.Vector3(-0.75, 0.22, -0.6).normalize() } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position.z = gl_Position.w; }`,
    fragmentShader: `uniform float uDay; uniform vec3 uMoon; uniform vec3 uSun; varying vec3 vD;
      void main(){
        float h = clamp(vD.y, -0.2, 1.0);
        vec3 nZen = vec3(0.0015,0.003,0.009), nHor = vec3(0.012,0.02,0.04);
        vec3 night = mix(nHor, nZen, pow(max(h,0.0), 0.45));
        night += vec3(0.03,0.045,0.08) * pow(max(dot(vD, uMoon),0.0), 10.0);
        vec3 dZen = vec3(0.22,0.42,0.75), dHor = vec3(0.86,0.83,0.74);
        vec3 day = mix(dHor, dZen, pow(max(h,0.0), 0.5));
        day += vec3(1.0,0.7,0.35) * 0.35 * pow(max(dot(vD, uSun),0.0), 6.0);
        gl_FragColor = vec4(mix(night, day, uDay), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const skyM = new THREE.Mesh(new THREE.SphereGeometry(95, 32, 16), sky);
  skyM.frustumCulled = false; skyM.renderOrder = -10;
  group.add(skyM);
  const sp: number[] = [], sc: number[] = [], ss: number[] = [];
  for (let i = 0; i < 1600; i++) {
    const y = 0.12 + r() * 0.88, a = r() * Math.PI * 2, rr = Math.sqrt(1 - y * y);
    sp.push(Math.cos(a) * rr * 90, y * 90, Math.sin(a) * rr * 90);
    const b = 0.25 + Math.pow(r(), 5) * 1.2;
    const tint = r();
    sc.push(b * (0.85 + tint * 0.15), b * 0.92, b);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  sg.setAttribute("color", new THREE.Float32BufferAttribute(sc, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, fog: false, transparent: true, depthWrite: false }));
  stars.frustumCulled = false;
  group.add(stars); nightOnly.push(stars);
  const moonDir = new THREE.Vector3(-0.35, 0.5, -0.8).normalize();
  const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: softGlow(), color: "#dfe8ff", fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  moon.position.copy(moonDir).multiplyScalar(85); moon.scale.set(14, 14, 1);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.3, 1.35, 1.45), fog: false, toneMapped: false }));
  disc.position.copy(moonDir).multiplyScalar(88); disc.lookAt(0, 0, 0);
  group.add(moon, disc); nightOnly.push(moon, disc);

  // ---------------- mist sheets
  const mt = mistTex();
  for (let k = 0; k < 6; k++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.2), new THREE.MeshBasicMaterial({ map: mt, color: "#7d93bd", transparent: true, opacity: 0.17, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.position.set(2 + (r() - 0.5) * 4, 0.55, -3 - k * 2.2 - r());
    group.add(m); nightOnly.push(m);
  }
  return { group, nightOnly, dayOnly, windowMats, sky, glows, buildMs: performance.now() - t0 };
};
export const getGarden = () => (_g ??= buildGarden());

export interface GardenProps {
  daytime?: boolean;
  shadowCenter?: [number, number]; // x, z of the area that needs crisp shadows
  shadowRadius?: number;
  fill?: number; // extra camera-side fill (night)
}

export const Garden3D: React.FC<GardenProps> = ({ daytime = false, shadowCenter = [0, -4], shadowRadius = 5, fill = 0.25 }) => {
  const G = getGarden();
  G.nightOnly.forEach((o) => (o.visible = !daytime));
  G.sky.uniforms.uDay.value = daytime ? 1 : 0;
  G.windowMats.forEach((m, i) => {
    m.map = daytime ? windowDayTex() : windowTex();
    m.color.setScalar(daytime ? 0.8 : WINDOWS[i].lit * 1.6);
  });
  const [cx, cz] = shadowCenter;
  const keyDir = daytime ? new THREE.Vector3(-0.75, 0.42, 0.5).normalize() : new THREE.Vector3(-0.35, 0.62, -0.7).normalize();
  const key = React.useMemo(() => {
    const l = new THREE.DirectionalLight();
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0008;
    l.shadow.normalBias = 0.05;
    return l;
  }, []);
  key.color.set(daytime ? "#ffd7a0" : "#a9c0ff");
  key.intensity = daytime ? 3.2 : 1.25;
  key.position.set(cx + keyDir.x * 20, keyDir.y * 20, cz + keyDir.z * 20);
  key.target.position.set(cx, 0, cz);
  key.target.updateMatrixWorld();
  const sc = key.shadow.camera;
  sc.left = -shadowRadius; sc.right = shadowRadius; sc.top = shadowRadius; sc.bottom = -shadowRadius; sc.near = 1; sc.far = 50;
  sc.updateProjectionMatrix();
  const W0 = WINDOWS[0];
  const spot = React.useMemo(() => {
    const l = new THREE.SpotLight("#ffb060", 90, 18, 0.75, 1, 2);
    l.position.set(W0.x, W0.y + 0.2, HOUSE_Z + 0.4);
    l.target.position.set(W0.x, 0, HOUSE_Z + 5);
    l.target.updateMatrixWorld();
    return l;
  }, []);
  return (
    <>
      {daytime ? <fogExp2 attach="fog" args={["#c3cdd2", 0.012]} /> : <fogExp2 attach="fog" args={["#111c30", 0.05]} />}
      <primitive object={G.group} />
      <primitive object={key} />
      <primitive object={key.target} />
      {daytime ? (
        <>
          <hemisphereLight args={["#bcd3f0", "#5a4a30", 1.1]} />
          <directionalLight position={[10, 6, 8]} intensity={0.5} color="#cfe0ff" />
        </>
      ) : (
        <>
          <hemisphereLight args={["#34507e", "#0a0c10", 0.55]} />
          <pointLight position={[W0.x, W0.y, HOUSE_Z + 0.9]} intensity={34} distance={16} decay={2} color="#ffa552" />
          <primitive object={spot} />
          <primitive object={spot.target} />
          <pointLight position={[WINDOWS[1].x, WINDOWS[1].y, HOUSE_Z + 0.9]} intensity={10} distance={10} decay={2} color="#ff9a48" />
          <directionalLight position={[3, 2, 10]} intensity={fill} color="#7f9bd0" />
        </>
      )}
    </>
  );
};
