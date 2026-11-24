import React from "react";

// «Бумажная анатомия»: плоские заливки + диагональная штриховка, толстый тёмный контур,
// красные артерии / синие вены, всё на шершавой бумаге. Сердце пульсирует по биту.
const INK = "#2b1a14";

export const Hatch: React.FC<{ id: string; color?: string; angle?: number; gap?: number; w?: number }> = ({ id, color = INK, angle = 35, gap = 9, w = 1.6 }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform={`rotate(${angle})`}>
    <line x1={0} y1={0} x2={0} y2={gap} stroke={color} strokeWidth={w} opacity={0.55} />
  </pattern>
);

export const HeartPaper: React.FC<{ beat: number; strain?: number; cracks?: number }> = ({ beat, strain = 0, cracks = 0 }) => {
  // beat 0..1 — фаза удара (0 = момент удара). Сжатие быстрое, расслабление медленное.
  const squeeze = Math.exp(-beat * 7) * (0.07 + strain * 0.05);
  const s = 1 - squeeze;
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <Hatch id="h1" />
        <Hatch id="h2" angle={-30} gap={12} />
        <linearGradient id="muscle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8402e" />
          <stop offset="100%" stopColor="#8e2416" />
        </linearGradient>
      </defs>
      <g transform={`translate(540 960) scale(${s * 0.92}) translate(-540 -1010)`}>
        {/* сосуды сверху */}
        <path d="M455 700 C440 560 520 520 600 540 C690 560 700 640 690 700" fill="none" stroke={INK} strokeWidth={70} strokeLinecap="round" />
        <path d="M455 700 C440 560 520 520 600 540 C690 560 700 640 690 700" fill="none" stroke="#d6402c" strokeWidth={58} strokeLinecap="round" />
        <path d="M600 540 L620 430 M560 545 L540 440 M640 555 L690 455" stroke={INK} strokeWidth={40} strokeLinecap="round" />
        <path d="M600 540 L620 430 M560 545 L540 440 M640 555 L690 455" stroke="#d6402c" strokeWidth={28} strokeLinecap="round" />
        <path d="M395 820 C360 700 380 610 420 560" fill="none" stroke={INK} strokeWidth={66} strokeLinecap="round" />
        <path d="M395 820 C360 700 380 610 420 560" fill="none" stroke="#3a5aa8" strokeWidth={54} strokeLinecap="round" />
        <path d="M720 760 C800 720 840 700 900 700" fill="none" stroke={INK} strokeWidth={56} strokeLinecap="round" />
        <path d="M720 760 C800 720 840 700 900 700" fill="none" stroke="#3a5aa8" strokeWidth={44} strokeLinecap="round" />
        {/* предсердия */}
        <circle cx="365" cy="790" r="82" fill="#8a1e12" stroke={INK} strokeWidth={9} />
        <circle cx="770" cy="790" r="70" fill="#8a1e12" stroke={INK} strokeWidth={9} />
        {/* тело сердца */}
        <path d="M350 820 C270 890 265 1040 330 1150 C400 1265 515 1335 585 1395 C650 1320 775 1225 825 1095 C865 965 835 835 745 795 C660 755 465 750 350 820 Z" fill="url(#muscle)" stroke={INK} strokeWidth={9} />
        <path d="M350 820 C270 890 265 1040 330 1150 C400 1265 515 1335 585 1395 C650 1320 775 1225 825 1095 C865 965 835 835 745 795 C660 755 465 750 350 820 Z" fill="url(#h1)" />
        <path d="M350 820 C270 890 265 1040 330 1150 C400 1265 515 1335 585 1395 C650 1320 775 1225 825 1095 C865 965 835 835 745 795 C660 755 465 750 350 820 Z" fill="url(#h2)" opacity={0.7} />
        {/* правая часть темнее (объём) */}
        <path d="M585 1395 C650 1320 775 1225 825 1095 C865 965 835 835 745 795 C730 960 680 1180 585 1395 Z" fill="#6e1a10" opacity={0.45} />
        <path d="M585 1395 C650 1320 775 1225 825 1095 C865 965 835 835 745 795 C730 960 680 1180 585 1395 Z" fill="url(#h2)" />
        {/* коронарные сосуды */}
        <path d="M590 790 C560 920 590 1060 590 1330" fill="none" stroke="#e6b84a" strokeWidth={9} />
        <path d="M590 790 C560 920 590 1060 590 1330" fill="none" stroke={INK} strokeWidth={2} />
        <path d="M575 900 C520 980 470 1040 430 1120 M600 1010 C660 1060 720 1080 760 1060 M520 1000 C470 990 420 1000 380 1040" fill="none" stroke="#e6b84a" strokeWidth={7} />
        {/* трещины от перегрузки */}
        {cracks > 0 && (
          <g stroke="#1a0905" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={600 * (1 - cracks)}>
            <path d="M440 900 L480 960 L460 1020 L510 1090 L495 1150" />
            <path d="M700 900 L670 980 L705 1040 L660 1120" />
          </g>
        )}
      </g>
    </svg>
  );
};

// ЭКГ-лента: пики на каждой доле; amp падает, когда сердце «устаёт»
export const ECG: React.FC<{ t: number; bps: number; y?: number; color?: string; chaos?: number }> = ({ t, bps, y = 1500, color = "#9a1d10", chaos = 0 }) => {
  const pts: string[] = [];
  for (let x = 60; x <= 1020; x += 4) {
    const tt = t - (1020 - x) / 520;
    const ph = ((tt * bps) % 1 + 1) % 1;
    let v = 0;
    if (ph < 0.04) v = -Math.sin((ph / 0.04) * Math.PI) * 18;
    else if (ph < 0.08) v = Math.sin(((ph - 0.04) / 0.04) * Math.PI) * 110;
    else if (ph < 0.12) v = -Math.sin(((ph - 0.08) / 0.04) * Math.PI) * 40;
    else if (ph > 0.3 && ph < 0.42) v = Math.sin(((ph - 0.3) / 0.12) * Math.PI) * 22;
    v += Math.sin(tt * 47 + x * 0.05) * chaos * 60;
    pts.push(`${x},${y - v}`);
  }
  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={5} strokeLinejoin="round" />
    </svg>
  );
};

// «Рамка анатомической таблицы»: тонкая двойная линия и точки-кнопки по углам
export const PlateFrame: React.FC<{ top?: number; bottom?: number }> = ({ top = 270, bottom = 1530 }) => (
  <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    <rect x={34} y={top} width={1012} height={bottom - top} fill="none" stroke="#5a2a20" strokeWidth={3} opacity={0.8} />
    <rect x={50} y={top + 16} width={980} height={bottom - top - 32} fill="none" stroke="#5a2a20" strokeWidth={1.5} opacity={0.6} />
    {[[34, top], [1046, top], [34, bottom], [1046, bottom]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={10} fill="#8a2a1c" stroke="#2b1a14" strokeWidth={2} />)}
  </svg>
);
