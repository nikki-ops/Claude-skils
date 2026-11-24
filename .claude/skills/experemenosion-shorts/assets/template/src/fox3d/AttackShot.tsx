import * as THREE from "three";
import { gaitPose, curvePath, WALK, FoxPose, FB, FOX_REST, solveFox, getFoxAssets, bodyLeg, blendPose } from "./Fox3D";
import { groundH } from "./Garden3D";
import { sstep, lerp } from "./rig";
import { crouchPose, blendMan, ManPose, solveMan, getManAssets, manForearm } from "./OldMan3D";

// =====================================================================================
// Choreography of the attack (pure functions of the frame number, fractional frames allowed
// for motion-blur ghosts). Fox: stalk 0-16, crouch 16-24, leap 24-39, bite 40, hang+shake.
// Old man: weeding 0-22, turns + raises right arm 22-33, bitten at 40, falls back 41-68.
// =====================================================================================
export const ZA = -2.875; // path between beds 3 and 4
export const MX = 1.95; // old man position
const YAW0 = -Math.PI / 2 + 0.15, YAW1 = -2.6;

export const manAttackPose = (f: number): ManPose => {
  const t = f / 30;
  const g = groundH(MX, ZA);
  const W = crouchPose(MX, ZA, YAW0, t * 0.8, g);
  W.head = [-0.35, -0.1 + 0.05 * Math.sin(t * 2), 0.05];
  const fwd = new THREE.Vector3(Math.cos(YAW1), 0, -Math.sin(YAW1)), side = new THREE.Vector3(Math.sin(YAW1), 0, Math.cos(YAW1));
  const at = (fw: number, sd: number, y: number) => new THREE.Vector3(MX, g + y, ZA).addScaledVector(fwd, fw).addScaledVector(side, sd);
  const A: ManPose = {
    pos: at(-0.22, 0, 0.6), yaw: YAW1, lean: 0.1,
    spine: [0.0, 0.1, 0], chest: [-0.05, 0.15, 0], head: [0.05, 0.2, -0.1],
    feet: W.feet, footYaw: [-0.4, 0.0],
    hands: [at(0.22, -0.2, 0.82), at(0.4, 0.12, 0.98)],
    handBend: [0.3, 0.1], elbowOut: [0.5, 0.25], kneeOut: 0.5,
  };
  const d = f - 40;
  const shake = d > 0 ? Math.exp(-d * 0.06) : 0;
  const jerk = d > 0 ? Math.sin(d * 1.05) * 0.06 * shake : 0;
  const F: ManPose = {
    pos: at(-0.5, 0.0, 0.2), yaw: YAW1 - 0.1, lean: -0.35, roll: 0.05,
    spine: [-0.05, 0.15, 0.05], chest: [-0.1, 0.25, 0.1], head: [-0.1, 0.55, -0.25],
    feet: [at(0.05, -0.2, 0.09), at(0.2, 0.2, 0.09)], footYaw: [-0.5, 0.2],
    hands: [at(-0.75, -0.3, 0.06), at(0.25 + jerk, 0.08, 0.55 + jerk * 0.6)],
    handBend: [-0.6, 0.0], elbowOut: [0.8, 0.3], kneeOut: 0.4,
  };
  let p = blendMan(W, A, sstep(22, 33, f));
  if (f > 40) p = blendMan(p, F, sstep(41, 68, f));
  if (f > 38 && f <= 41) p.hands[1].y -= 0.05 * sstep(38, 41, f);
  return p;
};

// world-space bite point on the right forearm
export const bitePoint = (f: number) => {
  const A = getManAssets();
  solveMan(A.rig, manAttackPose(f));
  return manForearm(A.rig, 0.62);
};

const FOX_Z = ZA + 0.06;
const STALK_PATH = curvePath([new THREE.Vector3(-2, 0, FOX_Z), new THREE.Vector3(3, 0, FOX_Z)], (t) => 2.25 + 0.5 * t);
const ground = (p: THREE.Vector3, h: number) => p.clone().setY(groundH(p.x, p.z) + h);

// shift a pose so that the fox's mouth lands on a world point
const placeMouth = (pose: FoxPose, target: THREE.Vector3) => {
  const A = getFoxAssets();
  for (let k = 0; k < 3; k++) {
    solveFox(A.rig, pose);
    const m = FOX_REST.mouth.clone().applyMatrix4(A.rig.M[FB.head]);
    pose.pos.add(target.clone().sub(m));
  }
  return pose;
};

const stalkPose = (f: number) => {
  const p = gaitPose(Math.min(f, 16) / 30, STALK_PATH, { ...WALK, freq: 1.25, stalk: 1 });
  p.pos.y += groundH(p.pos.x, p.pos.z);
  p.legs.forEach((l) => (l.p.y += groundH(l.p.x, l.p.z)));
  return p;
};

const crouchFox = (f: number): FoxPose => {
  const s = stalkPose(16);
  const c = sstep(16, 23, f);
  const p: FoxPose = { ...s, pos: s.pos.clone(), legs: s.legs.map((l, i) => ({ p: ground(l.p, i < 2 ? FOX_REST.wristH : FOX_REST.fetlockH), paw: 0, meta: i < 2 ? undefined : 0.55 })) as FoxPose["legs"] };
  p.legs[2].p.x += 0.05 * c; p.legs[3].p.x += 0.05 * c;
  p.pos.y -= 0.075 * c; p.pos.x -= 0.03 * c;
  p.pitch = 0.04 * c; p.spinePitch = -0.15 * c;
  p.neckPitch = lerp(s.neckPitch ?? 0, -0.15, c); p.headPitch = lerp(s.headPitch ?? 0, 0.3, c);
  p.ears = lerp(0.1, 0.55, c); p.jaw = 0.12 * c;
  p.tailLift = lerp(-0.1, -0.05, c); p.tailSway = 0.25 * c; p.tailPhase = f * 0.9;
  return p;
};

const flightPose = (f: number, root: THREE.Vector3, pitch: number): FoxPose => {
  const u = sstep(24, 39, f);
  const yaw = 0;
  return {
    pos: root.clone(), yaw, pitch, roll: 0.03,
    spinePitch: lerp(0.1, -0.05, u), spineYaw: 0,
    neckPitch: -0.35, headPitch: lerp(0.35, 0.15, u), headYaw: 0, headRoll: 0.1,
    jaw: lerp(0.25, 0.62, sstep(25, 36, f)), ears: 1, tailLift: 0.35, tailSway: 0.05, tailCurl: -0.12, tailPhase: f * 0.5,
    legs: [
      { p: bodyLeg(root, yaw, pitch, 0.4, -0.15, -0.04), paw: -0.6 },
      { p: bodyLeg(root, yaw, pitch, 0.37, -0.1, 0.05), paw: -0.4 },
      { p: bodyLeg(root, yaw, pitch, -0.47, -0.08, -0.05), paw: -0.3, meta: -1.3 },
      { p: bodyLeg(root, yaw, pitch, -0.44, -0.12, 0.05), paw: -0.3, meta: -1.2 },
    ],
  };
};

const hangPose = (f: number, B: THREE.Vector3): FoxPose => {
  const d = f - 40;
  const dec = Math.exp(-d * 0.04);
  const sh = Math.sin(d * 1.05) * dec; // ~5 Hz head shake
  const pitch = lerp(0.55, 0.85, sstep(40, 50, f)) + 0.08 * sh;
  const p: FoxPose = {
    pos: B.clone().add(new THREE.Vector3(-0.35, -0.2, 0)), yaw: 0.15 * sh, pitch, roll: 0.15 * sh,
    spinePitch: -0.1, spineYaw: 0.3 * Math.sin(d * 1.05 + 1) * dec,
    neckPitch: -0.55, headPitch: 0.1 + 0.1 * sh, headYaw: 0.35 * sh, headRoll: 0.45 * sh,
    jaw: 0.3 + 0.05 * Math.abs(sh), ears: 1, tailLift: 0.1 + 0.2 * Math.sin(d * 0.5), tailSway: 0.6, tailCurl: 0.15, tailPhase: d * 0.6,
    legs: [
      { p: B.clone().add(new THREE.Vector3(-0.07, -0.2, -0.05)), paw: -0.9 },
      { p: B.clone().add(new THREE.Vector3(-0.04, -0.14 + 0.03 * sh, 0.06)), paw: -0.9 },
      { p: new THREE.Vector3(), paw: 0.1, meta: 0.1 },
      { p: new THREE.Vector3(), paw: 0.1, meta: 0.1 },
    ],
  };
  placeMouth(p, B);
  const A = getFoxAssets();
  solveFox(A.rig, p);
  [2, 3].forEach((i, k) => {
    const hip = A.rig.P[i === 2 ? FB.HL[0] : FB.HR[0]];
    const ph = d * 1.3 + k * 2.2;
    p.legs[i].p = ground(new THREE.Vector3(hip.x - 0.08 + 0.06 * Math.sin(ph), 0, FOX_Z + (k ? 0.06 : -0.06)), FOX_REST.fetlockH + Math.max(0, 0.04 * Math.sin(ph + 1.5)));
  });
  return p;
};

let _contact: { root: THREE.Vector3; pitch: number } | null = null;
const contactRoot = () => {
  if (_contact) return _contact;
  const B = bitePoint(39.5);
  const pitch = 0.42;
  const pz = flightPose(39, new THREE.Vector3(0, 0.6, FOX_Z), pitch);
  placeMouth(pz, B);
  _contact = { root: pz.pos.clone(), pitch };
  return _contact;
};

export const foxAttackPose = (f: number): FoxPose => {
  if (f <= 16) return stalkPose(f);
  if (f <= 24) return crouchFox(f);
  if (f < 40) {
    const c = crouchFox(24);
    const P0 = c.pos.clone();
    const { root: P1, pitch: pe } = contactRoot();
    const u = Math.max(0, (f - 24) / 15.5);
    const e = 1 - Math.pow(1 - u, 1.6);
    const root = P0.clone().lerp(P1, e);
    root.y += 0.12 * 4 * u * (1 - u);
    const pitch = lerp(0.05, pe, sstep(24, 28, f)) + 0.12 * Math.sin(Math.PI * u);
    const fl = flightPose(f, root, pitch);
    const push = 1 - sstep(25, 29, f);
    fl.legs[2] = { ...fl.legs[2], p: fl.legs[2].p.clone().lerp(c.legs[2].p, push), meta: lerp(-1.3, 0.1, push) };
    fl.legs[3] = { ...fl.legs[3], p: fl.legs[3].p.clone().lerp(c.legs[3].p, push), meta: lerp(-1.2, 0.1, push) };
    if (f >= 37) return blendPose(fl, hangPose(40, bitePoint(40)), sstep(37, 40, f));
    return fl;
  }
  return hangPose(f, bitePoint(f));
};
