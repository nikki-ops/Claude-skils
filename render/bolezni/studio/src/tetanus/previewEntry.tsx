import React from "react";
import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import { HeadSection } from "./HeadSection";
import { EyeMacro, BedTop, MicroscopeDrop, NerveCross, Curtain, Stopwatch } from "./Variety";
import { FaceOld } from "../components/FaceOld";
import { WarmPortraitBG } from "../components/Backgrounds";
import { Grain } from "../components/Film";

const P: React.FC<{ which: string }> = ({ which }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {which === "throat" && <><div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 55%, #1a2a3a, #05080e)" }} /><HeadSection frame={f} spasm={f > 20 ? 1 : 0} water={Math.min(1, f / 25)} /></>}
      {which === "saliva" && <><div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 55%, #1a2a3a, #05080e)" }} /><HeadSection frame={f} saliva={Math.min(1, f / 20)} /></>}
      {which === "eye" && <EyeMacro frame={f} pupil={Math.min(1, f / 40)} red={0.7} fox={f > 30 ? 1 : 0} dart={1} />}
      {which === "bed" && <BedTop frame={f} face={{ flush: 0.75, sweat: 0.6, blink: 0.5 }} thermo />}
      {which === "micro" && <MicroscopeDrop frame={f} />}
      {which === "cross" && <NerveCross frame={f} />}
      {which === "wind" && <><WarmPortraitBG /><FaceOld frame={f} fear={0.6} blink={0.55} spasm={0.45} drool={0.6} sweat={0.7} redEye={0.7} /><Curtain frame={f} /></>}
      {which === "watch" && <><div style={{ position: "absolute", inset: 0, background: "#222" }} /><Stopwatch frame={f} /></>}
      <Grain amount={0.1} vignette={0.6} />
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    {["throat", "saliva", "eye", "bed", "micro", "cross", "wind", "watch"].map((w) => (
      <Composition key={w} id={`V-${w}`} component={P} defaultProps={{ which: w }} durationInFrames={75} fps={30} width={1080} height={1920} />
    ))}
  </>
);
registerRoot(Root);
