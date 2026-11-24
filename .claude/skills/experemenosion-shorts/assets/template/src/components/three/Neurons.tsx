import React, { useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry } from "../rand";
import { glowTexture, ballTexture } from "./glow";

// Сеть нейронов: сома + ветвящиеся дендриты (трубки), голубое свечение,
// оранжевые «бляшки» (клубки волокон) растут по параметру plaque 0..1,
// гаснущие нейроны темнеют по параметру loss 0..1. Импульсы бегут по веткам.
type Branch = { pts: THREE.Vector3[]; r: number };

const growBranches = (r: () => number, origin: THREE.Vector3, dir: THREE.Vector3, len: number, depth: number, out: Branch[], rad: number) => {
  const pts = [origin.clone()];
  let p = origin.clone();
  let d = dir.clone().normalize();
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    d.add(new THREE.Vector3((r() - 0.5) * 0.7, (r() - 0.5) * 0.7, (r() - 0.5) * 0.35)).normalize();
    p = p.clone().add(d.clone().multiplyScalar(len / steps));
    pts.push(p);
  }
  out.push({ pts, r: rad });
  if (depth > 0) {
    const k = depth > 1 ? 2 : 3;
    for (let i = 0; i < k; i++) {
      const at = pts[2 + Math.floor(r() * (pts.length - 2))];
      const nd = d.clone().add(new THREE.Vector3((r() - 0.5) * 1.6, (r() - 0.5) * 1.6, (r() - 0.5) * 0.6));
      growBranches(r, at, nd, len * 0.62, depth - 1, out, Math.max(0.014, rad * 0.5));
    }
  }
};

export type NeuronSceneProps = { t: number; plaque: number; loss: number; seed?: number; virus?: boolean };

export const Neurons: React.FC<NeuronSceneProps> = ({ t, plaque, loss, seed = 4, virus = false }) => {
  const PC = virus ? { fib: "#8be04a", glow: "#4ad01a", inner: "#c8ff7a" } : { fib: "#ff9424", glow: "#ff6a00", inner: "#ffb347" };
  const data = useMemo(() => {
    const r = mulberry(seed);
    const somas: { p: THREE.Vector3; dies: number }[] = [];
    // раскладка сеткой с джиттером: равномерные тёмные промежутки, как у автора
    for (let gy = 0; gy < 5; gy++) for (let gx = 0; gx < 3; gx++) {
      somas.push({ p: new THREE.Vector3((gx - 1) * 5.2 + (r() - 0.5) * 2.6 + (gy % 2) * 1.6, (gy - 2) * 5.0 + (r() - 0.5) * 2.2, -r() * 3), dies: r() });
    }
    const branches: Branch[] = [];
    const owner: number[] = [];
    somas.forEach((s, si) => {
      const n = 4 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + r();
        const before = branches.length;
        growBranches(r, s.p, new THREE.Vector3(Math.cos(a), Math.sin(a), (r() - 0.5) * 0.3), 2.4 + r() * 1.6, 2, branches, 0.075);
        for (let k = before; k < branches.length; k++) owner.push(si);
      }
    });
    // геометрия по нейронам (чтобы гасить каждый отдельно)
    const perNeuron = somas.map((_, si) => {
      const gs = branches
        .map((b, bi) => (owner[bi] === si ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b.pts), 12, b.r, 5, false) : null))
        .filter(Boolean) as THREE.BufferGeometry[];
      return mergeGeometries(gs);
    });
    const glowGeo = somas.map((_, si) => {
      const gs = branches
        .map((b, bi) => (owner[bi] === si ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(b.pts), 12, b.r * 2.6, 5, false) : null))
        .filter(Boolean) as THREE.BufferGeometry[];
      return mergeGeometries(gs);
    });
    // бляшки: центры между нейронами, каждая — клубок коротких волокон
    const plaques = Array.from({ length: 7 }, () => {
      const c = new THREE.Vector3((r() - 0.5) * 9, (r() - 0.5) * 15, -0.5 - r() * 2);
      const fibers: THREE.BufferGeometry[] = [];
      for (let i = 0; i < 130; i++) {
        const a = new THREE.Vector3((r() - 0.5), (r() - 0.5), (r() - 0.5) * 0.4).normalize();
        const p0 = c.clone().add(a.clone().multiplyScalar(0.25));
        const p1 = c.clone().add(a.clone().multiplyScalar(0.7 + r() * 0.4)).add(new THREE.Vector3((r() - 0.5) * 0.25, (r() - 0.5) * 0.25, 0));
        const p2 = c.clone().add(a.clone().multiplyScalar(1.1 + r() * 0.6)).add(new THREE.Vector3((r() - 0.5) * 0.5, (r() - 0.5) * 0.5, 0));
        fibers.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p2]), 10, 0.01 + r() * 0.012, 3, false));
      }
      return { c, geo: mergeGeometries(fibers), delay: r() * 0.5 };
    });
    // искры-импульсы: бегут по случайным веткам
    const sparks = Array.from({ length: 26 }, () => ({ b: Math.floor(r() * branches.length), ph: r(), sp: 0.4 + r() * 0.6 }));
    return { somas, branches, perNeuron, glowGeo, plaques, sparks, cyanTex: glowTexture(), somaTex: ballTexture("#7fe6ff", "#1aa6d6", "#0b4f78", "#062b3d"), coreTex: ballTexture("#fff0b0", "#ffa02a", "#d4580a"), coreTexV: ballTexture("#f4ffd0", "#8be04a", "#2f7a0a"), orangeTex: glowTexture("rgba(255,200,120,1)", "rgba(255,120,20,0.35)") };
  }, [seed]);

  return (
    <>
      {data.somas.map((s, i) => {
        const dead = loss > s.dies ? Math.min(1, (loss - s.dies) * 6) : 0;
        const bright = 1 - dead * 0.85;
        const col = new THREE.Color("#22a9dc").lerp(new THREE.Color("#2a2f4a"), dead);
        return (
          <group key={i}>
            <mesh geometry={data.perNeuron[i]}>
              <meshBasicMaterial color={col} transparent opacity={0.95 * bright + 0.1} />
            </mesh>
            <mesh geometry={data.glowGeo[i]}>
              <meshBasicMaterial color="#1aa8d8" transparent opacity={0.1 * bright} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
            <sprite renderOrder={10} position={[s.p.x, s.p.y, s.p.z + 0.02]} scale={[1.7, 1.7, 1]}>
              <spriteMaterial depthTest={false} map={data.somaTex} color={new THREE.Color("#ffffff").lerp(new THREE.Color(virus ? "#9bff4a" : "#3a3f55"), dead)} transparent />
            </sprite>
            <sprite position={s.p} scale={[3.6 * bright + 0.2, 3.6 * bright + 0.2, 1]}>
              <spriteMaterial map={data.cyanTex} color="#1590d0" transparent opacity={0.4 * bright} blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>
          </group>
        );
      })}
      {data.plaques.map((p, i) => {
        const g = Math.max(0, Math.min(1, (plaque - p.delay) / 0.5));
        if (g <= 0) return null;
        const pulse = 1 + Math.sin(t * 2 + i) * 0.05;
        return (
          <group key={i} position={p.c} scale={[g * pulse, g * pulse, g * pulse]}>
            <mesh geometry={p.geo} position={p.c.clone().multiplyScalar(-1)}>
              <meshBasicMaterial color={PC.fib} transparent opacity={0.95} />
            </mesh>
            <sprite scale={[5, 5, 1]}>
              <spriteMaterial map={data.orangeTex} color={PC.glow} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>
            <sprite scale={[1.1, 1.1, 1]}>
              <spriteMaterial map={virus ? data.coreTexV : data.coreTex} transparent />
            </sprite>
            <sprite scale={[2.4, 2.4, 1]}>
              <spriteMaterial map={data.orangeTex} color={PC.inner} transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
            </sprite>
          </group>
        );
      })}
      {data.sparks.map((s, i) => {
        const b = data.branches[s.b];
        const u = (((s.ph + t * s.sp * 0.5) % 1) + 1) % 1;
        const curve = new THREE.CatmullRomCurve3(b.pts);
        const p = curve.getPoint(u);
        const fade = Math.sin(u * Math.PI) * (1 - loss * 0.8);
        return (
          <sprite key={i} position={p} scale={[0.9, 0.9, 1]}>
            <spriteMaterial map={data.cyanTex} color="#e8ffff" transparent opacity={fade} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        );
      })}
    </>
  );
};
