import React from "react";
import { Composition, interpolate, useCurrentFrame, Easing } from "remotion";
import { XrayShot } from "./XrayShot";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.inOut(Easing.sin);

const Hand: React.FC = () => {
  const f = useCurrentFrame();
  return <XrayShot frame={f} p={interpolate(f, [0, 74], [0, 0.15], { ...clamp, easing: ease })} cam="hand" />;
};
const Shoulder: React.FC = () => {
  const f = useCurrentFrame();
  return <XrayShot frame={f} p={interpolate(f, [0, 74], [0.45, 0.62], { ...clamp, easing: ease })} cam="shoulder" />;
};
const Brain: React.FC = () => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, 56], [0.85, 1], { ...clamp, easing: Easing.inOut(Easing.quad) });
  return <XrayShot frame={f} p={p} brainHit={interpolate(f, [55, 74], [0, 1], clamp)} cam="brain" />;
};

const Debug: React.FC<{ pos: number[]; target: number[]; fov: number; expo: number; soft: number; p: number }> = (pr) => (
  <XrayShot frame={0} p={pr.p} expo={pr.expo} debugCam={{ pos: pr.pos, target: pr.target, fov: pr.fov, soft: pr.soft }} />
);

export const XrayRoot: React.FC = () => (
  <>
    <Composition id="XrayHand" component={Hand} durationInFrames={75} fps={30} width={1080} height={1920} />
    <Composition id="XrayShoulder" component={Shoulder} durationInFrames={75} fps={30} width={1080} height={1920} />
    <Composition id="XrayBrain" component={Brain} durationInFrames={75} fps={30} width={1080} height={1920} />
    <Composition id="XrayDebug" component={Debug as any} durationInFrames={1} fps={30} width={1080} height={1920} defaultProps={{ pos: [0, 165, 90], target: [0, 165, 0], fov: 24, expo: 0.4, soft: 1.5, p: 0 }} />
  </>
);
