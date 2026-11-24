import React, { useMemo } from "react";
import { mulberry } from "./rand";

// Персонаж «дед», версия 2: проработанная форма головы, светотень аэрографом, фактура кожи,
// морщины тонкими линиями разной толщины, брови штрихами — по технике автора (см. analysis/faces).
// Координаты 1080x1920, лицо фронтально по центру.
export type FaceProps = {
  blink?: number; // 0..1
  mouth?: number; // 0 закрыт .. 1 открыт
  look?: number; // -1..1 взгляд по горизонтали
  pallor?: number; // 0..1 бледность
  erase?: number; // 0..1 «лицо стирается»
  frame?: number;
  fear?: number; // 0..1 глаза шире, брови вверх
  pupil?: number; // 0..1 расширение зрачка
  redEye?: number; // 0..1 красные белки
  sweat?: number; // 0..1 капли пота, блеск
  flush?: number; // 0..1 жар: красные щёки и лоб
  spasm?: number; // 0..1 судорога: оскал, жилы на шее
  drool?: number; // 0..1 слюна из уголка рта
};

const CX = 540;
const LINE = "#6b3d2e";

// Catmull-Rom -> кубические Безье, замкнутый контур
const smoothClosed = (pts: [number, number][]) => {
  const n = pts.length;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d + " Z";
};
// симметричный контур из правой половины (x — смещение от центра), сверху вниз
const mirror = (half: [number, number][]) => {
  const right = half.map(([x, y]) => [CX + x, y] as [number, number]);
  const left = half.slice(1, -1).reverse().map(([x, y]) => [CX - x, y] as [number, number]);
  return smoothClosed([...right, ...left]);
};

// Голова: плоский широкий лоб, вмятина на висках, скулы, брыли, широкий подбородок
const HEAD = mirror([
  [0, 626], [95, 634], [168, 664], [216, 724], [236, 800], [238, 870], [232, 925], [246, 995], [244, 1070],
  [232, 1145], [214, 1205], [178, 1258], [118, 1296], [0, 1312],
]);

const soft = (id: string, s: number) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={s} />
  </filter>
);

// сужающийся штрих-морщина: две линии разной толщины поверх друг друга дают «живую» линию
const Wr: React.FC<{ d: string; w?: number; o?: number; c?: string }> = ({ d, w = 2.6, o = 0.75, c = LINE }) => (
  <>
    <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" opacity={o * 0.55} />
    <path d={d} stroke={c} strokeWidth={w * 0.5} strokeLinecap="round" fill="none" opacity={o} />
  </>
);

export const FaceOld: React.FC<FaceProps> = ({ blink = 0, mouth = 0, look = 0, pallor = 0, erase = 0, frame = 0, fear = 0, pupil = 0, redEye = 0, sweat = 0, flush = 0, spasm = 0, drool = 0 }) => {
  const R = useMemo(() => {
    const r = mulberry(31);
    // брови: пучки коротких штрихов вдоль дуги
    const brow = (side: 1 | -1) =>
      Array.from({ length: 46 }, () => {
        const u = r();
        const x = CX + side * (55 + u * 120);
        const y = 922 - Math.sin(u * Math.PI * 0.9 + 0.2) * 22 + (r() - 0.5) * 16;
        const a = -0.35 - r() * 0.5 + (u > 0.8 ? 0.4 : 0);
        const L = 16 + r() * 22;
        return { x, y, x2: x + Math.cos(a) * L * side, y2: y + Math.sin(a) * L * 0.6 - 4, c: r() > 0.45 ? "#d9d3c8" : "#8f887c", w: 2 + r() * 2.2 };
      });
    const spots = Array.from({ length: 14 }, () => ({ x: CX + (r() - 0.5) * 380, y: 690 + r() * 210, rx: 4 + r() * 8, ry: 3 + r() * 6, o: 0.12 + r() * 0.15 }));
    const stubble = Array.from({ length: 420 }, () => {
      const a = r() * Math.PI, rr = Math.sqrt(r());
      return { x: CX + Math.cos(a) * 225 * rr * (r() > 0.5 ? 1 : -1), y: 1150 + Math.sin(a) * 150 * rr - 20, s: 1.2 + r() * 1.4 };
    }).filter((p) => p.y > 1150 || Math.abs(p.x - CX) > 120);
    const fringe = (side: 1 | -1) =>
      Array.from({ length: 34 }, () => {
        const y = 780 + r() * 190, x = CX + side * (232 + r() * 26);
        return { d: `M${x} ${y} q${side * (6 + r() * 10)} ${20 + r() * 20} ${side * (3 + r() * 6)} ${40 + r() * 30}`, c: r() > 0.5 ? "#f1eee8" : "#a9a49b", w: 1.5 + r() * 2 };
      });
    return { browL: brow(-1), browR: brow(1), spots, stubble, fringeL: fringe(-1), fringeR: fringe(1) };
  }, []);

  const lid = 1 - blink;
  const ex = look * 8;
  const sat = 1 - pallor * 0.85;
  const dispId = `erase${Math.round(erase * 100)}_${Math.floor(frame / 2)}`;
  const mo = Math.max(mouth, spasm * 0.85) * 40;
  const grin = spasm * 40; // растяжение рта в стороны

  return (
    <svg viewBox="70 190 940 1671" width="100%" height="100%" style={{ position: "absolute", inset: 0, filter: `saturate(${sat * 0.92}) brightness(${1 - pallor * 0.06}) blur(0.6px)` }}>
      <defs>
        {soft("b40", 40)}
        {soft("b28", 28)}
        {soft("b18", 18)}
        {soft("b10", 10)}
        {soft("b4", 4)}
        <clipPath id="head"><path d={HEAD} /></clipPath>
        <radialGradient id="vol" cx="50%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#f0cbae" />
          <stop offset="55%" stopColor="#dca88c" />
          <stop offset="85%" stopColor="#bf8670" />
          <stop offset="100%" stopColor="#9c6655" />
        </radialGradient>
        <radialGradient id="neckG" cx="50%" cy="100%" r="100%">
          <stop offset="0%" stopColor="#d49e84" />
          <stop offset="100%" stopColor="#b47a64" />
        </radialGradient>
        <linearGradient id="cardigan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4b5560" />
          <stop offset="100%" stopColor="#262c33" />
        </linearGradient>
        <filter id="skinTex" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={3} seed={5} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.28  0 0 0 0 0.22  0 0 0 -1.2 0.95" />
        </filter>
        <filter id="blotch" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={9} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.33  0 0 0 0 0.36  0 0 0 -2.2 1.25" />
        </filter>
        <filter id={dispId} x="-20%" y="-5%" width="140%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0015 0.06" numOctaves={2} seed={Math.floor(frame / 3) + 1} result="n" />
          <feColorMatrix in="n" type="matrix" values="1 0 0 0 0  0 0 0 0 0.5  0 0 0 0 0  0 0 0 0 1" result="nx" />
          <feDisplacementMap in="SourceGraphic" in2="nx" scale={erase * 150} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={`${erase * 26} ${erase * 1.2}`} />
        </filter>
      </defs>

      {/* ---------- тело ---------- */}

      {/* шея */}
      <defs><clipPath id="neckClip"><path d="M420 1220 C425 1330 418 1420 400 1480 L680 1480 C662 1420 655 1330 660 1220 Z" /></clipPath></defs>
      <path d="M420 1220 C425 1330 418 1420 400 1480 L680 1480 C662 1420 655 1330 660 1220 Z" fill="url(#neckG)" stroke={LINE} strokeWidth={2.5} />
      <g clipPath="url(#neckClip)">
        <ellipse cx={CX} cy={1318} rx={190} ry={60} fill="#6a3a2c" opacity={0.75} filter="url(#b18)" />
        {[-1, 1].map((s) => <rect key={s} x={s < 0 ? 400 : 620} y={1220} width={60} height={260} fill="#8a5646" opacity={0.35} filter="url(#b18)" />)}
      </g>

      {spasm > 0.1 && [-1, 1].map((s) => <path key={`t${s}`} d={`M${CX + s * 60} 1300 C${CX + s * 70} 1360 ${CX + s * 90} 1410 ${CX + s * 115} 1450`} stroke="#b87a62" strokeWidth={14} fill="none" opacity={spasm * 0.8} strokeLinecap="round" />)}
      {spasm > 0.1 && [-1, 1].map((s) => <path key={`t2${s}`} d={`M${CX + s * 66} 1300 C${CX + s * 76} 1360 ${CX + s * 96} 1410 ${CX + s * 121} 1450`} stroke="#7a4636" strokeWidth={2.5} fill="none" opacity={spasm * 0.8} />)}
      <ellipse cx={CX} cy={1385} rx={14} ry={22} fill="#d8a68c" opacity={0.45} filter="url(#b10)" />
      {[1360, 1392, 1424].map((y, i) => <Wr key={y} d={`M${465 + i * 4} ${y} Q540 ${y + 14} ${615 - i * 4} ${y}`} w={2.4} o={0.45} />)}
      <g transform="translate(0 -60)">
      <path d="M120 1980 C140 1600 300 1475 540 1465 C780 1475 940 1600 960 1980 Z" fill="url(#cardigan)" stroke="#1d2228" strokeWidth={3} />
      <path d="M430 1470 L540 1580 L470 1610 L405 1500 Z" fill="#e9e3d6" stroke="#8d8578" strokeWidth={2.5} />
      <path d="M650 1470 L540 1580 L610 1610 L675 1500 Z" fill="#e9e3d6" stroke="#8d8578" strokeWidth={2.5} />
      </g>

      {/* ---------- уши ---------- */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${CX + s * 232} 960 C${CX + s * 284} 930 ${CX + s * 296} 1000 ${CX + s * 284} 1050 C${CX + s * 276} 1095 ${CX + s * 259} 1118 ${CX + s * 236} 1110 Z`} fill="#d29a80" stroke={LINE} strokeWidth={2.5} />
          <path d={`M${CX + s * 246} 985 C${CX + s * 274} 975 ${CX + s * 276} 1030 ${CX + s * 262} 1065`} stroke="#9a5f4c" strokeWidth={3} fill="none" opacity={0.7} />
          <ellipse cx={CX + s * 256} cy={1020} rx={12} ry={30} fill="#9a5f4c" opacity={0.35} filter="url(#b4)" />
        </g>
      ))}

      {/* ---------- голова: заливка и светотень ---------- */}
      <path d={HEAD} fill="url(#vol)" />
      <g clipPath="url(#head)">
        <g filter={erase > 0.001 ? `url(#${dispId})` : undefined}>
          <rect x={0} y={600} width={1080} height={760} fill="url(#vol)" />
          <ellipse cx={CX - 20} cy={720} rx={150} ry={70} fill="#fbe6d2" opacity={0.75} filter="url(#b28)" />
          <ellipse cx={CX - 60} cy={690} rx={50} ry={22} fill="#fff6ec" opacity={0.6} filter="url(#b10)" />
          {[-1, 1].map((s) => <ellipse key={s} cx={CX + s * 222} cy={890} rx={45} ry={90} fill="#8f5a4a" opacity={0.55} filter="url(#b28)" />)}
          {[-1, 1].map((s) => <ellipse key={`cb${s}`} cx={CX + s * 175} cy={1020} rx={70} ry={38} fill="#f0c4a8" opacity={0.45} filter="url(#b18)" />)}
          {[-1, 1].map((s) => <ellipse key={`ch${s}`} cx={CX + s * 185} cy={1120} rx={55} ry={75} fill="#94604f" opacity={0.5} filter="url(#b28)" />)}
          {[-1, 1].map((s) => <ellipse key={`r${s}`} cx={CX + s * 150} cy={1070} rx={70} ry={50} fill="#c46f72" opacity={0.42} filter="url(#b28)" />)}
          {[-1, 1].map((s) => <ellipse key={`es${s}`} cx={CX + s * 108} cy={985} rx={78} ry={46} fill="#704660" opacity={0.42} filter="url(#b18)" />)}
          {[-1, 1].map((s) => <ellipse key={`j${s}`} cx={CX + s * 200} cy={1230} rx={70} ry={60} fill="#86503f" opacity={0.55} filter="url(#b28)" />)}
          <ellipse cx={CX} cy={1325} rx={190} ry={60} fill="#6e4034" opacity={0.5} filter="url(#b28)" />
          <ellipse cx={CX} cy={1262} rx={70} ry={30} fill="#efc3a8" opacity={0.5} filter="url(#b18)" />
          <rect x={0} y={600} width={1080} height={760} filter="url(#blotch)" opacity={0.35} />
          <rect x={0} y={600} width={1080} height={760} filter="url(#skinTex)" opacity={0.22} style={{ mixBlendMode: "multiply" }} />
          {R.spots.map((p, i) => <ellipse key={i} cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#9a5f45" opacity={p.o} filter="url(#b4)" />)}
          {R.stubble.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s * 0.7} fill="#7d756e" opacity={0.16} />)}

          {/* морщины лба */}
          {[778, 806, 836, 866].map((y, i) => (
            <g key={y}>
              <Wr d={`M${CX - 128 + i * 10} ${y + 4} C${CX - 90} ${y - 4} ${CX - 40} ${y - 6} ${CX - 8 - (i % 2) * 20} ${y - 3}`} w={3} o={0.6 - i * 0.05} />
              <Wr d={`M${CX + 14 + (i % 2) * 26} ${y - 4} C${CX + 50} ${y - 6} ${CX + 95} ${y - 3} ${CX + 124 - i * 12} ${y + 5}`} w={3} o={0.6 - i * 0.05} />
            </g>
          ))}
          <Wr d={`M${CX - 14} 905 C${CX - 18} 930 ${CX - 16} 950 ${CX - 12} 968`} w={3} o={0.6} />
          <Wr d={`M${CX + 14} 905 C${CX + 18} 930 ${CX + 16} 950 ${CX + 12} 968`} w={3} o={0.6} />
          {[-1, 1].map((s) => [-14, 0, 14, 26].map((dy, i) => (
            <Wr key={`cf${s}${i}`} d={`M${CX + s * 172} ${990 + dy * 0.6} L${CX + s * (210 + i * 3)} ${990 + dy * 1.6}`} w={2.4} o={0.55} />
          )))}
          {[-1, 1].map((s) => (
            <g key={`bag${s}`}>
              <ellipse cx={CX + s * 108} cy={1032} rx={48} ry={18} fill="#6e4258" opacity={0.32} filter="url(#b10)" />
              <Wr d={`M${CX + s * 62} 1022 Q${CX + s * 108} 1046 ${CX + s * 158} 1020`} w={2.6} o={0.6} />
              <Wr d={`M${CX + s * 70} 1046 Q${CX + s * 110} 1068 ${CX + s * 152} 1044`} w={2.2} o={0.4} />
            </g>
          ))}
          {[-1, 1].map((s) => (
            <g key={`nl${s}`}>
              <Wr d={`M${CX + s * 62} 1112 C${CX + s * 100} 1150 ${CX + s * 108} 1190 ${CX + s * 98} 1238`} w={3.4} o={0.7} />
              <Wr d={`M${CX + s * 82} 1225 C${CX + s * 92} 1255 ${CX + s * 98} 1275 ${CX + s * 108} 1292`} w={2.6} o={0.5} />
              <ellipse cx={CX + s * 118} cy={1180} rx={20} ry={60} fill="#8a5646" opacity={0.35} filter="url(#b10)" />
            </g>
          ))}
          {[-40, -24, -8, 8, 24, 40].map((dx) => <Wr key={dx} d={`M${CX + dx} 1162 L${CX + dx * 1.05} 1180`} w={2} o={0.45} />)}
          <Wr d={`M${CX - 45} 1262 Q${CX} 1254 ${CX + 45} 1262`} w={2.6} o={0.5} />

          {/* нос: без контура спинки — две линии, кончик, крылья, ноздри */}
          <Wr d={`M${CX - 26} 975 C${CX - 30} 1020 ${CX - 34} 1060 ${CX - 42} 1090`} w={2.6} o={0.55} />
          <Wr d={`M${CX + 26} 975 C${CX + 30} 1020 ${CX + 34} 1060 ${CX + 42} 1090`} w={2.6} o={0.55} />
          <ellipse cx={CX + 8} cy={1092} rx={46} ry={34} fill="#e8b49a" opacity={0.85} filter="url(#b4)" />
          <ellipse cx={CX - 6} cy={1080} rx={18} ry={10} fill="#fbe0cc" opacity={0.7} filter="url(#b4)" />
          {[-1, 1].map((s) => (
            <g key={`n${s}`}>
              <path d={`M${CX + s * 40} 1080 C${CX + s * 70} 1086 ${CX + s * 72} 1122 ${CX + s * 44} 1126`} stroke={LINE} strokeWidth={3} fill="none" opacity={0.75} />
              <ellipse cx={CX + s * 26} cy={1118} rx={16} ry={9} fill="#3b1c17" transform={`rotate(${s * 18} ${CX + s * 26} 1118)`} />
            </g>
          ))}
          <ellipse cx={CX} cy={1128} rx={60} ry={14} fill="#8a5646" opacity={0.45} filter="url(#b10)" />

          {/* глаза: миндаль, радужка с ободком, блик, тень века, нависающая складка */}
          {[-1, 1].map((s) => {
            const ecx = CX + s * 108, ecy = 992;
            const h = 22 * lid * (1 + fear * 0.6);
            const eye = `M${ecx - 48} ${ecy + 2} Q${ecx - 10} ${ecy - h - 6} ${ecx + 46} ${ecy - 2} Q${ecx + 6} ${ecy + h * 0.7 + 4} ${ecx - 48} ${ecy + 2} Z`;
            return (
              <g key={`e${s}`}>
                <defs><clipPath id={`eyeClip${s}`}><path d={eye} /></clipPath></defs>
                <path d={eye} fill={redEye > 0 ? `rgb(${239 - redEye * 10},${230 - redEye * 70},${220 - redEye * 70})` : "#efe6dc"} />
                {redEye > 0.1 && [0, 1, 2].map((k) => <path key={k} d={`M${ecx + s * 44} ${ecy - 4 + k * 5} q${-s * 14} ${k - 1} ${-s * 24} ${(k - 1) * 4}`} stroke="#c0393a" strokeWidth={1.5} fill="none" opacity={redEye} />)}
                <g clipPath={`url(#eyeClip${s})`}>
                  <circle cx={ecx + ex} cy={ecy} r={16} fill="#5f7f90" />
                  <circle cx={ecx + ex} cy={ecy} r={16} fill="none" stroke="#2c3e48" strokeWidth={3} />
                  <circle cx={ecx + ex} cy={ecy} r={7 + pupil * 6} fill="#0d1114" />
                  <circle cx={ecx + ex + 5} cy={ecy - 6} r={4} fill="#fff" opacity={0.95} />
                  <rect x={ecx - 60} y={ecy - 40} width={120} height={30} fill="#5a3a34" opacity={0.35} filter="url(#b4)" />
                </g>
                <path d={`M${ecx - 52} ${ecy} Q${ecx - 8} ${ecy - h - 26} ${ecx + 52} ${ecy - 6} Q${ecx + 6} ${ecy - h - 10} ${ecx - 52} ${ecy} Z`} fill="#c99079" />
                <path d={`M${ecx - 48} ${ecy + 2} Q${ecx - 10} ${ecy - h - 6} ${ecx + 46} ${ecy - 2}`} stroke="#3a2019" strokeWidth={4.5} fill="none" strokeLinecap="round" />
                <Wr d={`M${ecx - 46} ${ecy - 4} Q${ecx - 6} ${ecy - h - 30} ${ecx + 54} ${ecy - 10}`} w={2.6} o={0.6} />
                <path d={`M${ecx - 40} ${ecy + 6} Q${ecx + 4} ${ecy + h * 0.7 + 8} ${ecx + 44} ${ecy + 2}`} stroke="#7a4636" strokeWidth={2} fill="none" opacity={0.7} />
              </g>
            );
          })}
          <g transform={`translate(0 ${-fear * 22})`}>
            {[...R.browL, ...R.browR].map((b, i) => <line key={i} x1={b.x} y1={b.y - (Math.abs(b.x - CX) < 110 ? fear * 10 : 0)} x2={b.x2} y2={b.y2 - (Math.abs(b.x2 - CX) < 110 ? fear * 10 : 0)} stroke={b.c} strokeWidth={b.w} strokeLinecap="round" />)}
          </g>
          {/* жар */}
          {flush > 0 && [-1, 1].map((s) => <ellipse key={`fl${s}`} cx={CX + s * 150} cy={1060} rx={85} ry={60} fill="#d4484a" opacity={flush * 0.4} filter="url(#b28)" />)}
          {flush > 0 && <ellipse cx={CX} cy={760} rx={160} ry={60} fill="#d4584a" opacity={flush * 0.25} filter="url(#b28)" />}

          {/* рот: тонкие губы, опущенные уголки */}
          <path d={`M${CX - 58} ${1206 + mo * 0.1} Q${CX - 30} 1192 ${CX} 1198 Q${CX + 30} 1192 ${CX + 58} ${1206 + mo * 0.1} Q${CX} ${1206 + mo * 0.3} ${CX - 58} ${1206 + mo * 0.1} Z`} fill="#a9635c" />
          {mo > 0.8 && <ellipse cx={CX} cy={1210 + mo * 0.45} rx={42 + grin} ry={mo * 0.55} fill="#3d1715" />}
          {spasm > 0.15 && (
            <g>
              <rect x={CX - 36 - grin * 0.8} y={1204} width={72 + grin * 1.6} height={Math.max(4, mo * 0.28)} rx={4} fill="#ece4cf" />
              <rect x={CX - 32 - grin * 0.7} y={1210 + mo * 0.75} width={64 + grin * 1.4} height={Math.max(3, mo * 0.2)} rx={4} fill="#ddd2b8" />
              {[-2, -1, 0, 1, 2].map((k) => <line key={k} x1={CX + k * 14} y1={1204} x2={CX + k * 14} y2={1204 + mo * 0.28} stroke="#a89c84" strokeWidth={1.5} />)}
            </g>
          )}
          <path d={`M${CX - 52} ${1210 + mo * 0.9} Q${CX} ${1232 + mo} ${CX + 52} ${1210 + mo * 0.9} Q${CX} ${1212 + mo * 0.9} ${CX - 52} ${1210 + mo * 0.9} Z`} fill="#bc7770" />
          <path d={`M${CX - 62 - grin} 1212 Q${CX} ${1208 + mo * 0.6} ${CX + 62 + grin} 1212`} stroke="#4e221e" strokeWidth={3} fill="none" strokeLinecap="round" />
          {[-1, 1].map((s) => <Wr key={`mc${s}`} d={`M${CX + s * 62} 1212 Q${CX + s * 70} 1222 ${CX + s * 72} 1234`} w={2.4} o={0.55} />)}
          <ellipse cx={CX} cy={1236 + mo} rx={34} ry={7} fill="#f2c8ae" opacity={0.5} filter="url(#b4)" />
        </g>
      </g>

      {sweat > 0 && (
        <g clipPath="url(#head)">
          {Array.from({ length: 14 }, (_, i) => {
            const r = mulberry(100 + i);
            const x = CX + (r() - 0.5) * 420, y0 = 700 + r() * 380;
            const y = y0 + ((frame * (0.6 + r())) % 120) * (r() > 0.6 ? 1 : 0.15);
            const sz = 6 + r() * 7;
            return (
              <g key={i} opacity={sweat}>
                <path d={`M${x} ${y - sz * 1.8} Q${x + sz} ${y} ${x} ${y + sz} Q${x - sz} ${y} ${x} ${y - sz * 1.8} Z`} fill="#f6e6dc" opacity={0.55} stroke="#9a6a58" strokeWidth={1.2} />
                <circle cx={x - sz * 0.3} cy={y - sz * 0.2} r={sz * 0.25} fill="#fff" />
              </g>
            );
          })}
          <ellipse cx={CX - 40} cy={760} rx={120} ry={40} fill="#fff" opacity={sweat * 0.25} filter="url(#b10)" />
        </g>
      )}
      {drool > 0 && (
        <g opacity={Math.min(1, drool * 1.5)}>
          <path d={`M${CX + 58 + grin} 1214 C${CX + 64 + grin} ${1250 + drool * 40} ${CX + 56 + grin} ${1270 + drool * 80} ${CX + 62 + grin} ${1260 + drool * 160}`} stroke="#e8f0f2" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.75} />
          <circle cx={CX + 62 + grin} cy={1262 + drool * 160} r={9} fill="#eef5f6" opacity={0.8} />
          {Array.from({ length: 10 }, (_, k) => <circle key={k} cx={CX - 50 - grin + k * (11 + grin * 0.2)} cy={1212 + (k % 3) * 3} r={4 + (k % 3) * 2} fill="#f4f8f8" opacity={0.8 * drool} />)}
        </g>
      )}
      {[-1, 1].map((s) => (
        <path key={`hm${s}`} d={`M${CX + s * 232} 780 C${CX + s * 262} 820 ${CX + s * 270} 900 ${CX + s * 262} 990 C${CX + s * 258} 1010 ${CX + s * 244} 1010 ${CX + s * 238} 990 C${CX + s * 236} 920 ${CX + s * 236} 840 ${CX + s * 226} 790 Z`} fill="#b8b3aa" stroke="#7d776d" strokeWidth={2} />
      ))}
      {[...R.fringeL, ...R.fringeR].map((h, i) => <path key={i} d={h.d} stroke={h.c} strokeWidth={h.w} fill="none" strokeLinecap="round" opacity={0.9} />)}

      {erase > 0.02 && (
        <g clipPath="url(#head)" opacity={Math.min(1, erase * 1.8)} style={{ filter: "blur(2.5px)" }}>
          {(() => {
            const r = mulberry(7 + Math.floor(frame / 4));
            const pal = ["#e6bfa9", "#b78371", "#d29e88", "#efd2c2", "#a87464", "#c8907c"];
            return Array.from({ length: 34 }, (_, i) => {
              const y = 840 + r() * 420;
              const w = 120 + r() * 300 * (0.5 + erase);
              const x = 300 + r() * (480 - w * 0.5);
              return <rect key={i} x={x} y={y} width={w} height={8 + r() * 18} rx={8} fill={pal[i % pal.length]} opacity={0.55 + r() * 0.4} />;
            });
          })()}
        </g>
      )}
      <path d={HEAD} fill="none" stroke={LINE} strokeWidth={3} />
    </svg>
  );
};
