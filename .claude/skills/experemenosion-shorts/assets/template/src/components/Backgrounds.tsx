import React from "react";

// Тёмный «кабинетный» фон: сине-зелёная темнота, тонкая сетка, мягкое пятно света за головой
export const DarkGridBG: React.FC<{ base?: string; glow?: string; grid?: boolean }> = ({ base = "#0b1a1f", glow = "#1f4048", grid = true }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 45% at 50% 52%, ${glow} 0%, ${base} 70%, #03080a 100%)` }} />
    {grid && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(150,200,210,0.35) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(150,200,210,0.35) 1.5px, transparent 1.5px)",
          backgroundSize: "120px 120px",
          backgroundPosition: "0 40px",
        }}
      />
    )}
  </>
);

// Тёплый портретный фон (как у автора за бабушкой): почти чёрный коричневый + янтарное пятно света сбоку-сзади
export const WarmPortraitBG: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "#140d08" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 45% 30% at 78% 42%, rgba(120,70,20,0.55), rgba(0,0,0,0) 70%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(70,45,25,0.6), rgba(0,0,0,0) 75%)" }} />
  </>
);

// Глубокий тёмно-синий фон для вставок «внутри тела»
export const DeepBG: React.FC<{ center?: string }> = ({ center = "#0d2238" }) => (
  <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 55% at 50% 50%, ${center} 0%, #050b16 65%, #010307 100%)` }} />
);
