import React from "react";
import { C, FONT_HUD, meterColor } from "../style/tokens";

const pill: React.CSSProperties = {
  position: "absolute",
  top: 174,
  height: 62,
  borderRadius: 31,
  background: C.pill,
  display: "flex",
  alignItems: "center",
  fontFamily: FONT_HUD,
  fontWeight: 800,
  color: C.white,
};

export const HUD: React.FC<{ left: string; label?: string; value?: number }> = ({ left, label, value = 100 }) => (
  <>
    <div style={{ ...pill, left: 48, padding: "0 30px 0 26px", fontSize: 34, gap: 16 }}>
      <div style={{ width: 16, height: 16, borderRadius: 8, background: "#ff2b1c", boxShadow: "0 0 10px #ff2b1c" }} />
      {left}
    </div>
    {label !== undefined && (
      <div style={{ ...pill, right: 46, width: 466, padding: "0 22px 0 26px", justifyContent: "space-between" }}>
        <span style={{ fontSize: 25, color: "#cfd3d3", letterSpacing: 0.5 }}>{label}</span>
        <div style={{ width: 208, height: 17, borderRadius: 9, background: C.track, overflow: "hidden" }}>
          <div style={{ width: `${Math.max(2, value)}%`, height: "100%", borderRadius: 9, background: meterColor(value), boxShadow: `0 0 10px ${meterColor(value)}` }} />
        </div>
        <span style={{ fontSize: 31, width: 78, textAlign: "right" }}>{Math.round(value)}%</span>
      </div>
    )}
  </>
);

export const Counter: React.FC<{ text: string; y?: number; danger?: boolean }> = ({ text, y = 1412, danger = false }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div
      style={{
        background: "rgba(14,12,6,0.9)",
        border: danger ? "3px solid rgba(244,42,16,0.6)" : "3px solid rgba(255,208,0,0.55)",
        borderRadius: 44,
        padding: "8px 34px",
        fontFamily: FONT_HUD,
        fontWeight: 800,
        fontSize: 52,
        color: danger ? C.red : C.yellow,
        boxShadow: danger ? "0 0 24px rgba(244,42,16,0.3)" : "0 0 24px rgba(255,208,0,0.25)",
      }}
    >
      {text}
    </div>
  </div>
);

// Подпись-сноска под объектом во вставке (жёлтая/красная, капс, Montserrat 800)
export const Note: React.FC<{ text: string; y: number; color?: string; size?: number; opacity?: number }> = ({ text, y, color = C.yellow, size = 38, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      top: y,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: FONT_HUD,
      fontWeight: 800,
      fontSize: size,
      color,
      opacity,
      textShadow: "0 3px 0 #000, 0 0 14px rgba(0,0,0,0.9)",
    }}
  >
    {text}
  </div>
);
