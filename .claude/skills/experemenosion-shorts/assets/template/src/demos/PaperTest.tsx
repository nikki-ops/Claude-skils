import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { HeartPaper, ECG, PlateFrame } from "../components/HeartPaper";
import { PaperTexture, Grain } from "../components/Film";
import { HUD, Counter } from "../components/HUD";
import { Caption } from "../components/Caption";
import { grid } from "../style/tokens";

// Тест «бумажная анатомия» под фонк 128 BPM: 4 такта = 7.5 с. Сердце бьётся на каждую долю,
// пульс-счётчик растёт, на 3-м такте появляются трещины, на 4-м ЭКГ срывается.
export const PaperTest: React.FC = () => {
  const f = useCurrentFrame();
  const g = grid(128);
  const beatPh = (f % g.beat) / g.beat;
  const bar = Math.floor(f / g.bar);
  const pulse = Math.round(interpolate(f, [0, 4 * g.bar], [150, 214]));
  const push = interpolate(f, [0, 4 * g.bar], [1, 1.08]);
  return (
    <AbsoluteFill>
      <PaperTexture tint="#cdbb95" strength={0.55} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(255,245,220,0.45), rgba(255,245,220,0) 70%)" }} />
      <PlateFrame />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <HeartPaper beat={beatPh} strain={bar / 3} cracks={interpolate(f, [2 * g.bar, 3 * g.bar], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </AbsoluteFill>
      <ECG y={1330} t={f / 30} bps={128 / 60} chaos={bar >= 3 ? interpolate(f, [3 * g.bar, 4 * g.bar], [0, 1]) : 0} />
      <Grain amount={0.14} vignette={0.75} />
      <HUD left={`ДЕНЬ ${21 + bar}`} label="СИЛЫ" value={interpolate(f, [0, 4 * g.bar], [22, 6])} />
      <Counter text={`ПУЛЬС: ${pulse}`} y={1440} danger={pulse > 180} />
      <Caption text={"СЕРДЦЕ\n{НЕ УСПЕВАЕТ}"} from={0} dur={Math.round(2 * g.bar)} top={320} base={84} />
      <Caption text={"МЫШЦА\n[РВЁТСЯ]"} from={Math.round(2 * g.bar)} dur={Math.round(2 * g.bar)} top={320} base={92} />
    </AbsoluteFill>
  );
};
