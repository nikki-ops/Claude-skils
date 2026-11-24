import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import { OldHand } from "./OldHand";
import { HandsWithGlass } from "./HandsWithGlass";
import { OfferedGlass } from "./OfferedGlass";
import { FaceOld } from "../components/FaceOld";
import { WarmPortraitBG } from "../components/Backgrounds";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// укус: нарастает на кадрах 8–14 с толчком, дальше медленно течёт кровь
export const HandBite: React.FC = () => {
  const f = useCurrentFrame();
  const bite = f < 14 ? interpolate(f, [8, 14], [0, 0.72], cl) : interpolate(f, [14, 100], [0.72, 1], cl);
  const hit = interpolate(f, [8, 9, 22], [0, 1, 0], cl);
  return <AbsoluteFill><OldHand frame={f} bite={bite} tremble={hit * 2.2 + 0.08} /></AbsoluteFill>;
};

export const HandBurn: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill><OldHand frame={f} burn={interpolate(f, [0, 20], [0.3, 1], cl)} tremble={0.15} /></AbsoluteFill>;
};

export const HandWash: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <OldHand frame={f} bite={0.75} water={interpolate(f, [0, 8], [0, 1], cl)} soap={interpolate(f, [10, 50], [0, 1], cl)} />
    </AbsoluteFill>
  );
};

export const HandSyringe: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill><OldHand frame={f} scar={0.6} syringe={interpolate(f, [0, 80], [0, 1], { ...cl, easing: Easing.inOut(Easing.quad) })} /></AbsoluteFill>;
};

export const HookHands: React.FC = () => {
  const f = useCurrentFrame();
  const lift = interpolate(f, [40, 80], [0, 0.8], { ...cl, easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill>
      <WarmPortraitBG />
      <FaceOld frame={f} fear={0.9} sweat={0.8} redEye={0.6} pupil={0.8} flush={0.4} drool={0.3} />
      <HandsWithGlass frame={f} shake={1} lift={lift} />
    </AbsoluteFill>
  );
};

export const DaughterGlass: React.FC = () => {
  const f = useCurrentFrame();
  const progress = interpolate(f, [0, 45], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill>
      <WarmPortraitBG />
      <FaceOld frame={f} fear={0.5} sweat={0.4} pupil={0.4} />
      <OfferedGlass frame={f} progress={progress} />
    </AbsoluteFill>
  );
};
