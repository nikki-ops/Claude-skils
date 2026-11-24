import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry } from "../components/rand";
import { glowTexture } from "../components/three/glow";

// 3D: полёт внутри нервного волокна. Стенка — золотистая миелиновая трубка с перетяжками
// (перехваты Ранвье), внутри — продольные нити, по ним ползут вирусы-«пули» (зелёные, светятся).
const PATH = new THREE.CatmullRomCurve3(
  Array.from({ length: 16 }, (_, i) => new THREE.Vector3(Math.sin(i * 0.6) * 4, Math.cos(i * 0.45) * 3, -i * 12)),
);

const bulletGeometry = () => {
  const body = new THREE.CylinderGeometry(0.3, 0.3, 1.0, 20, 1, false);
  const nose = new THREE.SphereGeometry(0.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  nose.translate(0, 0.5, 0);
  const base = new THREE.CircleGeometry(0.3, 20);
  base.rotateX(Math.PI / 2);
  base.translate(0, -0.5, 0);
  const g = mergeGeometries([body.toNonIndexed(), nose.toNonIndexed(), base.toNonIndexed()]);
  g.computeVertexNormals();
  return g;
};

export const Nerve: React.FC<{ t: number; progress: number; swarm?: number; speed?: number }> = ({ t, progress, swarm = 1, speed = 1 }) => {
  const { camera } = useThree();
  const d = useMemo(() => {
    const r = mulberry(77);
    const wall = new THREE.TubeGeometry(PATH, 500, 3.0, 40, false);
    const pos = wall.attributes.position as THREE.BufferAttribute;
    const nrm = wall.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const ring = Math.floor(i / 41), ang = ((i % 41) / 40) * Math.PI * 2;
      // перетяжки каждые 50 колец + мелкий рельеф
      const node = Math.exp(-Math.pow(((ring % 50) - 25) / 3, 2)) * 0.9;
      const k = node + Math.sin(ang * 5 + ring * 0.2) * 0.06;
      pos.setXYZ(i, pos.getX(i) + nrm.getX(i) * k, pos.getY(i) + nrm.getY(i) * k, pos.getZ(i) + nrm.getZ(i) * k);
    }
    wall.computeVertexNormals();
    // нити
    const fibers: THREE.BufferGeometry[] = [];
    for (let f = 0; f < 26; f++) {
      const a = r() * Math.PI * 2, rad = 0.6 + r() * 1.7;
      const pts = Array.from({ length: 60 }, (_, i) => {
        const u = i / 59, p = PATH.getPointAt(u), tan = PATH.getTangentAt(u);
        const side = new THREE.Vector3(0, 1, 0).cross(tan).normalize(), up = tan.clone().cross(side).normalize();
        return p.add(side.multiplyScalar(Math.cos(a + u * 3) * rad)).add(up.multiplyScalar(Math.sin(a + u * 3) * rad));
      });
      fibers.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 300, 0.035 + r() * 0.03, 5, false));
    }
    const N = 90;
    const inst = new THREE.InstancedMesh(bulletGeometry(), new THREE.MeshStandardMaterial({ color: "#8be04a", emissive: "#2a7a08", emissiveIntensity: 0.6, roughness: 0.35 }), N);
    inst.frustumCulled = false;
    const viruses = Array.from({ length: N }, (_, i) => ({ u: 0.055 + r() * 0.45, a: r() * Math.PI * 2, rad: 0.4 + r() * 1.9, sp: 0.7 + r() * 0.6, wob: r() * 6, on: i / N }));
    return { wall, fibers: mergeGeometries(fibers), inst, viruses, glow: glowTexture("rgba(220,255,160,1)", "rgba(120,255,40,0.3)") };
  }, []);

  const cu = Math.min(0.95, Math.max(0.005, 0.02 + progress * 0.45));
  const cp = PATH.getPointAt(cu), look = PATH.getPointAt(Math.min(1, cu + 0.03));
  camera.position.copy(cp);
  camera.lookAt(look);

  const dummy = new THREE.Object3D();
  const glows: THREE.Vector3[] = [];
  d.viruses.forEach((v, i) => {
    const u = Math.min(0.99, Math.max(0.001, v.u + t * 0.008 * v.sp * speed));
    const p = PATH.getPointAt(u), tan = PATH.getTangentAt(u);
    const side = new THREE.Vector3(0, 1, 0).cross(tan).normalize(), up = tan.clone().cross(side).normalize();
    p.add(side.clone().multiplyScalar(Math.cos(v.a) * v.rad + Math.sin(t * 2 + v.wob) * 0.05)).add(up.clone().multiplyScalar(Math.sin(v.a) * v.rad));
    dummy.position.copy(p);
    // носом вперёд-вбок: так в кадре читается профиль «пули», а не донце
    const perp = side.clone().multiplyScalar(Math.cos(v.wob)).add(up.clone().multiplyScalar(Math.sin(v.wob)));
    const dir = tan.clone().multiplyScalar(0.45).add(perp.multiplyScalar(0.9)).normalize();
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const s = v.on < swarm ? 0.8 : 0.0001;
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    d.inst.setMatrixAt(i, dummy.matrix);
    if (v.on < swarm && i % 2 === 0) glows.push(p.clone());
  });
  d.inst.instanceMatrix.needsUpdate = true;

  return (
    <>
      <ambientLight intensity={0.22} color="#ffcf7a" />
      <pointLight position={cp} intensity={18} distance={30} decay={1.6} color="#fff0d0" />
      <pointLight position={PATH.getPointAt(Math.min(1, cu + 0.1))} intensity={35} distance={45} decay={1.6} color="#ffb040" />
      <mesh geometry={d.wall}>
        <meshStandardMaterial color="#9a6a20" roughness={0.55} metalness={0.05} side={THREE.BackSide} emissive="#1a0e02" />
      </mesh>
      <mesh geometry={d.fibers}>
        <meshStandardMaterial color="#f0d9a0" roughness={0.5} transparent opacity={0.65} emissive="#3a2a10" />
      </mesh>
      <primitive object={d.inst} />
      {glows.map((g, i) => (
        <sprite key={i} position={g} scale={[2.6, 2.6, 1]}>
          <spriteMaterial map={d.glow} color="#9bff4a" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
      ))}
    </>
  );
};
