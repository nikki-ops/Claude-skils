import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Fox3D, gaitPose, curvePath, TROT, WALK } from "./Fox3D";

// Debug stage: fox trotting on a plain floor, camera tracks it.
const Cam: React.FC<{ target: THREE.Vector3; view: string }> = ({ target, view }) => {
  const { camera } = useThree();
  const off = view === "side" ? new THREE.Vector3(0, 0.3, 2.9) : view === "front" ? new THREE.Vector3(2.4, 0.3, 0.9) : view === "head" ? new THREE.Vector3(0.75, 0.2, 0.45) : new THREE.Vector3(-1.6, 0.7, 2.0);
  camera.position.copy(target).add(off);
  const tg = target.clone().add(new THREE.Vector3(view === "head" ? 0.3 : 0, view === "head" ? 0.12 : -0.05, 0)); if (view === "head") camera.position.add(new THREE.Vector3(0.3, 0.12, 0)); camera.lookAt(tg);
  return null;
};

export const FoxStage: React.FC<{ view?: string; gait?: string }> = ({ view = "side", gait = "trot" }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = f / 30;
  const v = gait === "walk" ? 0.4 : 1.3;
  const path = curvePath([new THREE.Vector3(-10, 0, 0), new THREE.Vector3(10, 0, 0)], (tt) => 10 + v * tt);
  const pose = gaitPose(t, path, gait === "walk" ? { ...WALK, freq: 0.9, stalk: 1 } : { ...TROT, freq: 2.4, wobble: gait === "rabid" ? 1 : 0 });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#1d2430" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 30, near: 0.02, far: 50 }}>
        <color attach="background" args={["#2a3242"]} />
        <Cam target={pose.pos.clone().setY(0.3)} view={view} />
        <hemisphereLight args={["#bcd0ff", "#3a2a20", 0.9]} />
        <directionalLight position={[2, 4, 3]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={3} shadow-camera-bottom={-3} />
        <directionalLight position={[-3, 2, -3]} intensity={1.5} color="#9fc0ff" />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial color="#4a4038" roughness={1} />
        </mesh>
        <Fox3D pose={pose} glow={view === "head" ? 0.6 : 0} drool={gait === "rabid" ? 0.8 : 0} droolSwing={t} />
      </ThreeCanvas>
    </div>
  );
};
