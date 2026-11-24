import React from "react";
import { Composition } from "remotion";
import { HandBite, HandBurn, HandWash, HandSyringe, HookHands, DaughterGlass } from "./Previews";

const C = { fps: 30, width: 1080, height: 1920 };
export const HandsRoot: React.FC = () => (
  <>
    <Composition id="HandBite" component={HandBite} durationInFrames={120} {...C} />
    <Composition id="HandBurn" component={HandBurn} durationInFrames={90} {...C} />
    <Composition id="HandWash" component={HandWash} durationInFrames={120} {...C} />
    <Composition id="HandSyringe" component={HandSyringe} durationInFrames={120} {...C} />
    <Composition id="HookHands" component={HookHands} durationInFrames={120} {...C} />
    <Composition id="DaughterGlass" component={DaughterGlass} durationInFrames={90} {...C} />
  </>
);
