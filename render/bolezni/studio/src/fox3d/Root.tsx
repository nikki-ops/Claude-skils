import React from "react";
import { Composition, useCurrentFrame } from "remotion";
import { FoxStage } from "./Stage";
import { FoxEnterShot, GardenDayShot, FoxAttackShot, FoxCloseUpShot } from "./Shots";

const wrap = (C: React.FC<{ frame: number }>) => () => <C frame={useCurrentFrame()} />;
const D = { durationInFrames: 75, fps: 30, width: 1080, height: 1920 };

export const FoxRoot: React.FC = () => (
  <>
    <Composition id="FoxEnter" component={wrap(FoxEnterShot)} {...D} />
    <Composition id="FoxAttack" component={wrap(FoxAttackShot)} {...D} />
    <Composition id="FoxCloseUp" component={wrap(FoxCloseUpShot)} {...D} />
    <Composition id="GardenDay" component={wrap(GardenDayShot)} {...D} />
    <Composition id="FoxStageSide" component={FoxStage} defaultProps={{ view: "side" }} {...D} />
    <Composition id="FoxStage34" component={FoxStage} defaultProps={{ view: "34" }} {...D} />
    <Composition id="FoxStageHead" component={FoxStage} defaultProps={{ view: "head", gait: "rabid" }} {...D} />
    <Composition id="FoxStageFront" component={FoxStage} defaultProps={{ view: "front" }} {...D} />
  </>
);
