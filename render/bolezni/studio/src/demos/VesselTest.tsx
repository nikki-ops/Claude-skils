import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Vessel } from "../components/three/Vessel";
import { Grain } from "../components/Film";
import { HUD, Note } from "../components/HUD";
import { Caption } from "../components/Caption";
import { C, grid } from "../style/tokens";

// Улучшение №1 — 3D-вставка: полёт по сосуду. 4 такта @128 BPM (7.5 с).
export const VesselTest: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const g = grid(128);
  const thick = interpolate(f, [2 * g.bar, 4 * g.bar], [0, 1], { extrapolateLeft: "clamp" });
  return (
    <AbsoluteFill style={{ background: "#120202" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 62, near: 0.05, far: 120 }}>
        <fog attach="fog" args={["#1a0202", 6, 34 - thick * 14]} />
        <Vessel t={f / 30} progress={f / 225} thick={thick} />
      </ThreeCanvas>
      <Grain amount={0.08} vignette={0.7} />
      <HUD left="ДЕНЬ 19" label="СИЛЫ" value={interpolate(f, [0, 225], [31, 18])} />
      <Caption text={"ВОДЫ НЕТ.\nКРОВЬ {ГУСТЕЕТ}"} from={0} dur={Math.round(2 * g.bar)} top={300} base={84} />
      <Caption text={"КЛЕТКИ\n{ВСТАЮТ В ПРОБКУ}"} from={Math.round(2 * g.bar)} dur={Math.round(2 * g.bar)} top={300} base={92} />
      <Note text={`ПОТЕРЯНО ВОДЫ: ${interpolate(f, [0, 225], [3.1, 4.4]).toFixed(1)} Л`} y={1640} color={C.red} />
    </AbsoluteFill>
  );
};
