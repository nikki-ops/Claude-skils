import React from "react";
import { interpolate, Easing, useCurrentFrame } from "remotion";
import { C, FONT_HUD, FONT_TITLE } from "../style/tokens";

// Финальная карточка-«итог»: огромное число (жёлтое или красное, со свечением),
// под ним белая строка-пояснение и мелкая серая сноска-источник. Выход — число «пролетает» в камеру.
export const StatCard: React.FC<{ big: string; sub: string; src?: string; from: number; dur: number; color?: "y" | "r" }> = ({ big, sub, src, from, dur, color = "y" }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f >= dur) return null;
  const col = color === "y" ? C.yellow : C.red;
  const inP = interpolate(f, [0, 7], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.back(1.6)) });
  const outP = interpolate(f, [dur - 6, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const size = Math.min(190, 900 / (big.length * 0.82));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      <div
        style={{
          fontFamily: FONT_TITLE,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1,
          color: col,
          letterSpacing: -size * 0.03,
          textShadow: `0 0 ${size * 0.25}px ${col}aa, 0 6px 0 rgba(0,0,0,0.6)`,
          transform: `scale(${interpolate(inP, [0, 1], [0.6, 1]) * (1 + outP * 2.2)})`,
          opacity: inP * (1 - outP),
          filter: `blur(${(1 - inP) * 6 + outP * 14}px)`,
          whiteSpace: "nowrap",
        }}
      >
        {big}
      </div>
      <div style={{ fontFamily: FONT_TITLE, fontWeight: 800, fontSize: 40, color: C.white, opacity: interpolate(f, [4, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - outP), textAlign: "center", padding: "0 60px", textShadow: "0 3px 0 #000" }}>{sub}</div>
      {src && <div style={{ fontFamily: FONT_HUD, fontWeight: 700, fontSize: 24, color: "#9a9a9a", opacity: interpolate(f, [8, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * (1 - outP) }}>{src}</div>}
    </div>
  );
};

// Подложка финала: размытая тёмная сцена с тёплым «тлеющим» светом снизу и красными частицами
export const EmberBG: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 50% at 50% 100%, #3a0d02 0%, #140402 45%, #050101 100%)" }} />
      {Array.from({ length: 40 }, (_, i) => {
        const x = (i * 263) % 1080, sp = 1.2 + ((i * 7) % 5) * 0.4, y = 1920 - ((f * sp + i * 97) % 1500);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 6 + (i % 4) * 3, height: 6 + (i % 4) * 3, borderRadius: 99, background: "#ff7a1a", opacity: 0.25 + (i % 3) * 0.15, filter: "blur(3px)", boxShadow: "0 0 18px #ff5a00" }} />;
      })}
    </>
  );
};
