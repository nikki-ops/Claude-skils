import React from "react";

// Стакан воды перед лицом: прозрачное стекло, вода, блики, дрожь (shake 0..1), рябь
export const WaterGlass: React.FC<{ frame: number; shake?: number; y?: number; scale?: number; opacity?: number }> = ({ frame, shake = 0, y = 1500, scale = 1, opacity = 1 }) => {
  const dx = Math.sin(frame * 1.7) * 7 * shake + Math.sin(frame * 3.1) * 3 * shake;
  const tilt = Math.sin(frame * 1.3) * 2 * shake;
  const level = 140 + Math.sin(frame * 2.2) * 6 * shake;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#cfe6f0" stopOpacity="0.35" />
          <stop offset="20%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="80%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#cfe6f0" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="waterGl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d8ec" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5a9ab8" stopOpacity="0.7" />
        </linearGradient>
        <filter id="gl8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={8} /></filter>
      </defs>
      <g transform={`translate(${540 + dx} ${y}) rotate(${tilt}) scale(${scale})`}>
        <ellipse cx={0} cy={210} rx={150} ry={22} fill="#000" opacity={0.4} filter="url(#gl8)" />
        <path d={`M-120 -200 L-95 200 Q0 222 95 200 L120 -200 Z`} fill="url(#glassG)" stroke="#dff0f8" strokeWidth={4} strokeOpacity={0.7} />
        <path d={`M${-120 + (200 - level) * 0.0625 * 0} ${200 - level - 60} L-95 200 Q0 222 95 200 L${110} ${200 - level - 60} Z`} fill="url(#waterGl)" />
        <ellipse cx={0} cy={200 - level - 60} rx={112} ry={16} fill="#d8f0fa" opacity={0.75} />
        <ellipse cx={Math.sin(frame / 2) * 20 * shake} cy={200 - level - 60} rx={50 * shake + 10} ry={5} fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />
        <ellipse cx={0} cy={-200} rx={120} ry={18} fill="none" stroke="#e8f6fc" strokeWidth={4} opacity={0.8} />
        <path d="M-88 -170 L-70 170" stroke="#fff" strokeWidth={10} opacity={0.35} strokeLinecap="round" />
        <path d="M80 -160 L68 150" stroke="#fff" strokeWidth={4} opacity={0.3} strokeLinecap="round" />
      </g>
    </svg>
  );
};

// Ветер: полупрозрачные штрихи летят слева направо
export const Wind: React.FC<{ frame: number; amount?: number }> = ({ frame, amount = 1 }) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 22 }, (_, i) => {
      const y = 600 + ((i * 137) % 900);
      const len = 160 + (i % 5) * 60;
      const x = ((frame * (40 + (i % 4) * 12) + i * 211) % 1700) - 400;
      return <path key={i} d={`M${x} ${y} q${len / 2} ${-14} ${len} ${0}`} stroke="#dfe9ef" strokeWidth={3 + (i % 3)} fill="none" opacity={0.35 * amount} strokeLinecap="round" />;
    })}
  </svg>
);

// ЭКГ: amp 1 — нормальный ритм, 0 — прямая линия. Зелёная «мониторная» линия на чёрном
export const Monitor: React.FC<{ frame: number; amp: number; bpm?: number }> = ({ frame, amp, bpm = 110 }) => {
  const pts: string[] = [];
  const t = frame / 30;
  for (let x = 40; x <= 1040; x += 4) {
    const tt = t - (1040 - x) / 420;
    const ph = (((tt * bpm) / 60) % 1 + 1) % 1;
    let v = 0;
    if (ph < 0.04) v = -Math.sin((ph / 0.04) * Math.PI) * 25;
    else if (ph < 0.08) v = Math.sin(((ph - 0.04) / 0.04) * Math.PI) * 200;
    else if (ph < 0.12) v = -Math.sin(((ph - 0.08) / 0.04) * Math.PI) * 60;
    else if (ph > 0.3 && ph < 0.42) v = Math.sin(((ph - 0.3) / 0.12) * Math.PI) * 35;
    pts.push(`${x},${980 - v * amp}`);
  }
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs><filter id="mg" x="-10%" y="-50%" width="120%" height="200%"><feGaussianBlur stdDeviation={6} /></filter></defs>
      {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1={0} x2={1080} y1={620 + i * 60} y2={620 + i * 60} stroke="#0f3a24" strokeWidth={2} />)}
      {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} y1={620} y2={1280} x1={i * 60} x2={i * 60} stroke="#0f3a24" strokeWidth={2} />)}
      <polyline points={pts.join(" ")} fill="none" stroke="#3dff8a" strokeWidth={10} opacity={0.5} filter="url(#mg)" />
      <polyline points={pts.join(" ")} fill="none" stroke="#b8ffd2" strokeWidth={4} />
    </svg>
  );
};
