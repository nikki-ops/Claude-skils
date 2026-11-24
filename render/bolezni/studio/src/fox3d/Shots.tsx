import React from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { useVideoConfig } from "remotion";
import { Fox3D, gaitPose, curvePath, TROT, WALK, FoxPose, FB, FOX_REST, solveFox, getFoxAssets, bodyLeg, blendPose } from "./Fox3D";
import { Garden3D, groundH } from "./Garden3D";
import { sstep, lerp, noise1 } from "./rig";
import { OldMan3D, crouchPose } from "./OldMan3D";
import { manAttackPose, foxAttackPose, ZA } from "./AttackShot";

const CamRig: React.FC<{ pos: THREE.Vector3; look: THREE.Vector3; fov?: number; roll?: number }> = ({ pos, look, fov, roll = 0 }) => {
  const { camera } = useThree();
  camera.position.copy(pos);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(look);
  if (fov && (camera as THREE.PerspectiveCamera).fov !== fov) {
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

const Frame: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = "#05080f" }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, background: bg }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 40, near: 0.03, far: 200 }} gl={{ antialias: true }}>
        {children}
      </ThreeCanvas>
    </div>
  );
};

// ---------------------------------------------------------------- 1. FoxEnter
const ENTER_PATH = (() => {
  const pts = [new THREE.Vector3(-1.1, 0, -8.5), new THREE.Vector3(-1.02, 0, -5.5), new THREE.Vector3(-0.92, 0, -3.2), new THREE.Vector3(-0.98, 0, -1.2), new THREE.Vector3(-1.02, 0, 0.3)];
  return curvePath(pts, (t) => 4.1 + 1.68 * t);
})();

export const foxEnterPose = (f: number): FoxPose => {
  const t = f / 30;
  const wob = sstep(40, 66, f);
  const p = gaitPose(t, ENTER_PATH, { ...TROT, freq: 2.55, wobble: wob });
  p.pos.y += groundH(p.pos.x, p.pos.z);
  p.legs.forEach((l) => (l.p.y += groundH(l.p.x, l.p.z)));
  return p;
};

export const FoxEnterShot: React.FC<{ frame: number }> = ({ frame: f }) => {
  const t = f / 30;
  const pose = foxEnterPose(f);
  const head = pose.pos.clone().add(new THREE.Vector3(0, 0.08, 0));
  const cam = new THREE.Vector3(lerp(-0.98, -0.9, f / 74), 0.42 + 0.01 * noise1(t * 0.8, 1), lerp(1.75, 1.45, f / 74));
  const look = head.clone().lerp(new THREE.Vector3(-0.5, 0.5, -6), 0.3);
  look.y += 0.18;
  return (
    <Frame>
      <CamRig pos={cam} look={look} fov={42} roll={0.01 * noise1(t, 3)} />
      <Garden3D shadowCenter={[-0.8, -3.5]} shadowRadius={4.5} fill={0.8} />
      <Fox3D pose={pose} glow={1.0} glowSize={1.3} drool={sstep(45, 70, f) * 0.7} droolSwing={t} />
    </Frame>
  );
};

// ---------------------------------------------------------------- 4. GardenDay
export const GardenDayShot: React.FC<{ frame: number }> = ({ frame: f }) => {
  const t = f / 30;
  const mx = 2.3, mz = -2.875;
  const pose = crouchPose(mx, mz, -Math.PI / 2 + 0.75, t * 0.55, groundH(mx, mz));
  pose.head = [-0.3 + 0.05 * Math.sin(t * 1.3), 0.15 * Math.sin(t * 0.7), 0.05];
  const cam = new THREE.Vector3(lerp(3.95, 3.8, f / 74), 1.25, lerp(0.15, -0.1, f / 74));
  return (
    <Frame bg="#9fb6c9">
      <CamRig pos={cam} look={new THREE.Vector3(2.15, 0.45, -3.1)} fov={40} />
      <Garden3D daytime shadowCenter={[mx, mz]} shadowRadius={5} />
      <OldMan3D pose={pose} />
    </Frame>
  );
};

// ---------------------------------------------------------------- 2. FoxAttack (side view)
export const FoxAttackShot: React.FC<{ frame: number }> = ({ frame: f }) => {
  const t = f / 30;
  const man = manAttackPose(f);
  const fox = foxAttackPose(f);
  const ghosts = f > 24 && f < 40 ? [0.35, 0.7, 1.05].map((dt) => foxAttackPose(f - dt)) : [];
  const d = f - 40;
  const amp = d >= 0 ? 0.05 * Math.exp(-d * 0.28) : 0;
  const shake = new THREE.Vector3(Math.sin(d * 2.7) * amp, Math.cos(d * 3.3) * amp * 0.7, 0);
  const cx = lerp(1.05, 1.2, sstep(8, 40, f)) + 0.32 * sstep(44, 72, f);
  const cam = new THREE.Vector3(cx + 0.01 * noise1(t, 2), 0.95, ZA + 4.3).add(shake);
  const look = new THREE.Vector3(cx, 0.62, ZA).add(shake.clone().multiplyScalar(0.5));
  return (
    <Frame>
      <CamRig pos={cam} look={look} fov={50} roll={amp * 0.6 * Math.sin(d * 2.1)} />
      <Garden3D shadowCenter={[1.2, ZA]} shadowRadius={3.5} fill={0.55} />
      <pointLight position={[0.2, 2.4, ZA + 1.6]} intensity={9} distance={8} decay={2} color="#ffbf80" />
      <OldMan3D pose={man} />
      <Fox3D pose={fox} glow={0.8} glowSize={0.8} ghosts={ghosts} drool={f < 24 ? 0.5 : 0} droolSwing={t} />
    </Frame>
  );
};

// ---------------------------------------------------------------- 3. FoxCloseUp
const CU_POS = new THREE.Vector3(-0.85, 0, -1.6);
const CU_YAW = -Math.PI / 2 + 0.55; // facing the camera, 3/4

export const foxCloseUpPose = (f: number): FoxPose => {
  const t = f / 30;
  const yaw = CU_YAW + 0.04 * noise1(t * 0.9, 11);
  const legAt = (x: number, z: number, h: number) => {
    const p = new THREE.Vector3(x * Math.cos(yaw) + z * Math.sin(yaw), 0, -x * Math.sin(yaw) + z * Math.cos(yaw)).add(CU_POS);
    p.y = groundH(p.x, p.z) + h;
    return p;
  };
  const breath = Math.sin(t * Math.PI * 2 * 0.9);
  const snarl = 0.3 + 0.08 * Math.sin(t * 5.3) + 0.05 * noise1(t * 4, 12);
  const pos = CU_POS.clone();
  pos.y = groundH(pos.x, pos.z) + 0.275 + 0.004 * breath;
  return {
    pos, yaw, pitch: -0.07, roll: 0.03 * noise1(t, 13),
    spinePitch: -0.06, spineYaw: 0.03 * noise1(t * 0.7, 14),
    neckPitch: -0.32 + 0.03 * breath, headPitch: -0.02 + 0.05 * noise1(t * 2.2, 15), headYaw: 0.12 * noise1(t * 1.1, 16) - 0.1, headRoll: 0.2 + 0.08 * noise1(t * 1.7, 17),
    jaw: snarl, ears: 0.65 + 0.1 * noise1(t * 2, 18), tongue: 0,
    tailLift: -0.2, tailSway: 0.15, tailCurl: -0.1, tailPhase: t * 2,
    legs: [
      { p: legAt(0.17, -0.055, 0.046), paw: 0 }, { p: legAt(0.14, 0.05, 0.046), paw: 0 },
      { p: legAt(-0.15, -0.055, 0.03), paw: 0, meta: 0.4 }, { p: legAt(-0.17, 0.055, 0.03), paw: 0, meta: 0.4 },
    ],
  };
};

export const FoxCloseUpShot: React.FC<{ frame: number }> = ({ frame: f }) => {
  const t = f / 30;
  const pose = foxCloseUpPose(f);
  const A = getFoxAssets();
  solveFox(A.rig, pose);
  const head = new THREE.Vector3(0.32, 0.43, 0).applyMatrix4(A.rig.M[FB.head]);
  const yaw = CU_YAW;
  const fwd = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)), side = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const hand = new THREE.Vector3(0.012 * noise1(t * 0.7, 1), 0.01 * noise1(t * 0.9, 2), 0.012 * noise1(t * 0.6, 3));
  const push = lerp(0.5, 0.42, sstep(0, 74, f));
  const cam = head.clone().addScaledVector(fwd, push).addScaledVector(side, push * 0.55).add(new THREE.Vector3(0, 0.0, 0)).add(hand);
  const look = head.clone().add(new THREE.Vector3(0, -0.05, 0)).addScaledVector(fwd, -0.04);
  const keyP = head.clone().addScaledVector(fwd, 0.7).addScaledVector(side, -0.55).add(new THREE.Vector3(0, 0.45, 0));
  const rimP = head.clone().addScaledVector(fwd, -0.5).addScaledVector(side, 0.45).add(new THREE.Vector3(0, 0.35, 0));
  const fillP = cam.clone().add(new THREE.Vector3(0, 0.1, 0));
  return (
    <Frame>
      <CamRig pos={cam} look={look} fov={38} roll={0.02 * noise1(t * 0.8, 4)} />
      <Garden3D shadowCenter={[CU_POS.x, CU_POS.z]} shadowRadius={1.5} fill={0.35} />
      <pointLight position={keyP} intensity={2.6} distance={4} decay={2} color="#ffb070" />
      <pointLight position={rimP} intensity={3.5} distance={3} decay={2} color="#9cb8ff" />
      <pointLight position={fillP} intensity={0.5} distance={3} decay={2} color="#c8d4ff" />
      <Fox3D pose={pose} shells={26} furDensity={900} glow={1.1} glowSize={0.55} drool={0.75 + 0.15 * Math.sin(t * 1.3)} droolSwing={t} />
    </Frame>
  );
};
