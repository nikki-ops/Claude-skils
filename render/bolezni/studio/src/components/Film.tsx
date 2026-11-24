import React from "react";
import { useCurrentFrame } from "remotion";

// Зерно + виньетка: общий «плёночный» слой поверх картинки (под HUD и титрами)
export const Grain: React.FC<{ amount?: number; vignette?: number; fps?: number }> = ({ amount = 0.13, vignette = 0.6, fps = 12 }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / (30 / fps));
  return (
    <>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: amount * 2.2 }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 62% at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </>
  );
};

// Бумажная/штукатурная фактура для «средневековых» и «бумажных» сцен
export const PaperTexture: React.FC<{ tint?: string; strength?: number; seed?: number }> = ({ tint = "#bfae8a", strength = 0.55, seed = 11 }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <filter id={`paper${seed}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={5} seed={seed} />
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.05" />
    </filter>
    <rect width="100%" height="100%" fill={tint} />
    <rect width="100%" height="100%" fill="#2a2216" filter={`url(#paper${seed})`} opacity={strength} />
  </svg>
);
