import React from "react";
import { GripHand } from "./GripHand";
import { Glass, GlassSplash } from "./Glass";
import { OLD } from "./skin";

// Хук: дед двумя дрожащими руками держит стакан воды перед грудью.
// Оверлей поверх FaceOld (кадр 1080x1920, подбородок ~y1290). shake 0..1 — дрожь, lift 0..1 — поднести ко рту (~150px).
export type HandsWithGlassProps = { frame: number; shake?: number; lift?: number; x?: number; y?: number };

export const HandsWithGlass: React.FC<HandsWithGlassProps> = ({ frame, shake = 0, lift = 0, x = 540, y = 1615 }) => {
  const f = frame;
  const dx = shake * (Math.sin(f * 1.9) * 4 + Math.sin(f * 3.7) * 2.5 + Math.sin(f * 7.3) * 1.2);
  const dy = shake * (Math.sin(f * 2.3 + 1) * 2.5 + Math.sin(f * 5.1) * 1.2);
  const rot = shake * (Math.sin(f * 1.6) * 1.3 + Math.sin(f * 4.2) * 0.5) + lift * -2;
  const slosh = -shake * (Math.sin(f * 1.6 - 0.9) * 3 + Math.sin(f * 4.2 - 1.2) * 1.2) - rot * 0.5;
  const ly = y - lift * 150;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, filter: "blur(0.6px)" }}>
      <g transform={`translate(${(x + dx).toFixed(2)} ${(ly + dy).toFixed(2)}) rotate(${rot.toFixed(3)})`}>
        {/* тень рук и стакана на кардиган */}
        <ellipse cx={0} cy={60} rx={330} ry={170} fill="#000" opacity={0.25} filter="url(#hgL-b42)" />
        <GripHand uid="hgL" side={1} pal={OLD} layer="back" frame={f} />
        <GripHand uid="hgR" side={-1} pal={OLD} layer="back" frame={f} dy={16} />
        <Glass uid="hgG" frame={f} shake={shake} slosh={slosh} skin={OLD.mid} skinShadow={OLD.shadow} />
        <GripHand uid="hgR" side={-1} pal={OLD} layer="front" frame={f} dy={16} />
        <GripHand uid="hgL" side={1} pal={OLD} layer="front" frame={f} />
        <GlassSplash frame={f} shake={shake} />
      </g>
    </svg>
  );
};
