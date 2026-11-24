import React from "react";
import { Composition } from "remotion";
import { PaperTest } from "./demos/PaperTest";
import { VesselTest } from "./demos/VesselTest";
import { RabiesVideo, RABIES_FRAMES } from "./rabies/RabiesVideo";

// Новый ролик: скопировать src/rabies → src/<slug>, поменять shots.json / сцены / music_plan.json,
// и добавить сюда <Composition id="<Slug>" ...> по образцу Rabies.
export const Root: React.FC = () => (
  <>
    <Composition id="Rabies" component={RabiesVideo} durationInFrames={RABIES_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="DemoPaperHeart" component={PaperTest} durationInFrames={225} fps={30} width={1080} height={1920} />
    <Composition id="DemoVessel3D" component={VesselTest} durationInFrames={225} fps={30} width={1080} height={1920} />
  </>
);
