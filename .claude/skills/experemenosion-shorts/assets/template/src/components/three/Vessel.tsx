import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { mulberry } from "../rand";

// Улучшение №1: полёт камеры ВНУТРИ сосуда. Стенка — трубка по сплайну с рельефом,
// эритроциты — двояковогнутые диски (LatheGeometry), инстансы, текут и кувыркаются.
// thick 0..1 — «кровь густеет»: клеток больше, поток медленнее, свет темнее.
const PATH = new THREE.CatmullRomCurve3(
  Array.from({ length: 14 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.9) * 6, Math.cos(i * 0.7) * 4, -i * 14)),
);

const rbcGeometry = () => {
  // профиль двояковогнутого диска (как настоящий эритроцит)
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const r = (i / 24) * 1.0;
    const h = 0.18 + 0.32 * Math.pow(r, 2) * (1 - Math.pow(r, 6)) * 1.6;
    pts.push(new THREE.Vector2(r * 0.999, h));
  }
  for (let i = 24; i >= 0; i--) pts.push(new THREE.Vector2((i / 24) * 0.999, -pts[i].y));
  const g = new THREE.LatheGeometry(pts, 40);
  g.computeVertexNormals();
  return g;
};

export const Vessel: React.FC<{ t: number; progress: number; thick: number }> = ({ t, progress, thick }) => {
  const { camera } = useThree();
  const d = useMemo(() => {
    const r = mulberry(21);
    const wall = new THREE.TubeGeometry(PATH, 400, 3.2, 48, false);
    // рельеф стенки: складки вдоль и поперёк
    const pos = wall.attributes.position as THREE.BufferAttribute;
    const nrm = wall.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const ring = Math.floor(i / 49), ang = ((i % 49) / 48) * Math.PI * 2;
      const k = Math.sin(ang * 6 + ring * 0.15) * 0.1 + Math.sin(ring * 0.05) * 0.2 + Math.sin(ang * 13 - ring * 0.4) * 0.04;
      pos.setXYZ(i, pos.getX(i) - nrm.getX(i) * k, pos.getY(i) - nrm.getY(i) * k, pos.getZ(i) - nrm.getZ(i) * k);
    }
    wall.computeVertexNormals();
    const N = 520;
    const cells = Array.from({ length: N }, (_, i) => ({ u: r(), a: r() * Math.PI * 2, rad: Math.sqrt(r()) * 2.5, spin: new THREE.Vector3(r(), r(), r()).normalize(), sp: 0.6 + r() * 0.8, on: i / N }));
    const inst = new THREE.InstancedMesh(rbcGeometry(), new THREE.MeshStandardMaterial({ color: "#c8161c", roughness: 0.35, metalness: 0, emissive: "#3a0000" }), N);
    inst.frustumCulled = false;
    return { wall, cells, inst };
  }, []);

  // камера на пути
  const cu = 0.04 + progress * 0.5;
  const cp = PATH.getPointAt(cu), look = PATH.getPointAt(Math.min(1, cu + 0.03));
  camera.position.copy(cp);
  camera.lookAt(look);

  const visible = 0.45 + thick * 0.55; // доля видимых клеток растёт
  const flow = 1 - thick * 0.7;
  const dummy = new THREE.Object3D();
  {
    d.cells.forEach((c, i) => {
      const u = (c.u + t * 0.012 * c.sp * flow) % 1;
      const p = PATH.getPointAt(u);
      const tan = PATH.getTangentAt(u);
      const side = new THREE.Vector3(0, 1, 0).cross(tan).normalize();
      const up = tan.clone().cross(side).normalize();
      p.add(side.multiplyScalar(Math.cos(c.a + t * 0.2) * c.rad)).add(up.multiplyScalar(Math.sin(c.a + t * 0.2) * c.rad));
      dummy.position.copy(p);
      dummy.setRotationFromAxisAngle(c.spin, t * c.sp * 1.2 * flow + i);
      const s = c.on < visible ? 0.55 : 0.0001;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      d.inst.setMatrixAt(i, dummy.matrix);
    });
    d.inst.instanceMatrix.needsUpdate = true;
  }

  return (
    <>
      <ambientLight intensity={0.25} color="#ff5a4a" />
      <pointLight position={cp} intensity={60 * (1 - thick * 0.4)} distance={40} decay={1.6} color="#ffd2b8" />
      <pointLight position={PATH.getPointAt(Math.min(1, cu + 0.12))} intensity={120} distance={60} decay={1.6} color="#ff3a20" />
      <mesh geometry={d.wall}>
        <meshStandardMaterial color="#8a1414" roughness={0.55} metalness={0.05} side={THREE.BackSide} emissive="#2a0303" />
      </mesh>
      <primitive object={d.inst} />
    </>
  );
};
