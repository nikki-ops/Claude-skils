import React from "react";
import { GripHand } from "./GripHand";
import { Glass } from "./Glass";
import { YOUNG } from "./skin";

// Рука дочери (моложе: гладкая кожа, тонкие пальцы, без пятен) входит справа и протягивает стакан воды.
// Оверлей для фронтального кадра FaceOld. progress 0..1 — выезд из-за правого края.
export type OfferedGlassProps = { frame: number; progress?: number; x?: number; y?: number };

export const OfferedGlass: React.FC<OfferedGlassProps> = ({ frame, progress = 1, x = 650, y = 1560 }) => {
  const p = Math.max(0, Math.min(1, progress));
  const gx = x + (1 - p) * 760;
  const gy = y + (1 - p) * 60 + Math.sin(frame * 0.12) * 3;
  const rot = (1 - p) * -8 + Math.sin(frame * 0.09) * 0.6;
  const slosh = Math.sin(p * Math.PI) * 7 + Math.sin(frame * 0.3) * 0.8 * (1 - p);
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, filter: "blur(0.6px)" }}>
      <g transform={`translate(${gx.toFixed(2)} ${gy.toFixed(2)}) rotate(${rot.toFixed(3)}) scale(0.95)`}>
        <GripHand uid="og" side={-1} pal={YOUNG} layer="back" frame={frame} arm="side" fingerScale={0.86} sleeve={["#8f5650", "#5a302c", "#c08a80"]} />
        <Glass uid="ogG" frame={frame} shake={0.15 + (1 - p) * 0.5} slosh={slosh} skin={YOUNG.mid} skinShadow={YOUNG.shadow} handsBehind={false} />
        <GripHand uid="og" side={-1} pal={YOUNG} layer="front" frame={frame} arm="side" fingerScale={0.86} sleeve={["#8f5650", "#5a302c", "#c08a80"]} />
      </g>
    </svg>
  );
};
