import React, { useMemo } from "react";
import { mulberry } from "../components/rand";
import { P, buildFinger, smoothClosed, smoothOpen, blobPts, add, mul, DEG } from "./geom";
import { OLD, SkinDefs, Wr, FingerView, Vein, AgeSpots, Crepe, KnitDefs } from "./skin";

// Тыльная сторона ПРАВОЙ кисти 68-летнего мужчины, пальцы вверх, предплечье уходит вниз в рукав кардигана.
// Кадр 1080x1920; верхние ~420px оставлены спокойными (титры/HUD).
export type OldHandProps = {
  frame?: number;
  bite?: number; // 0..1 укус лисы: проколы, царапины, отёк, ореол, струйки крови
  puncture?: boolean; // одиночный прокол (гвоздь/проволока) вместо укуса: без царапин, одна точка
  burn?: number; // 0..1 жжение в шраме: пульсирующий жар + «покалывание» вверх по предплечью
  scar?: number; // 0..1 зажившый шрам (по умолчанию 1, если burn>0)
  water?: number; // 0..1 струя воды из-под крана на рану
  soap?: number; // 0..1 мыльная пена
  syringe?: number; // 0..1 шприц: подлёт, укол, ввод вакцины
  tremble?: number; // 0..1 дрожь
  bg?: string | null; // фон; null — прозрачный
  uid?: string;
};

const PAL = OLD;
const LINE = PAL.line;
export const WOUND: P = [515, 1195];

// ---------- геометрия ----------
const FINGERS = [
  { mcp: [418, 1004] as P, ang: -9, segs: [198, 138, 112], w: 102, bend: [0, 3, 3], knob: 0.05 },
  { mcp: [530, 978] as P, ang: -1.5, segs: [216, 158, 124], w: 108, bend: [0, 1, 1.5], knob: 0.06 },
  { mcp: [637, 996] as P, ang: 6, segs: [204, 146, 116], w: 100, bend: [0, -1.5, -2.5], knob: 0.07 },
  { mcp: [733, 1044] as P, ang: 15, segs: [158, 104, 94], w: 84, bend: [0, -3, -4], knob: 0.05 },
].map((s) => buildFinger({ ...s, root: 120, fadeA: -0.05, fadeB: 0.36 }));

const THUMB = buildFinger({
  mcp: [418, 1372], ang: -33, segs: [172, 128, 106], w: 122, bend: [0, -5, 8], root: 60,
  jf: [1.12, 1.0, 0.95], mf: [1.0, 0.9], pad: [0.86, 0.74], knob: 0.04, nailW: 0.56, nailShift: -0.16, nailL: 0.6, fadeA: 0.15, fadeB: 0.55,
});

const PALM: P[] = [
  [370, 990], [474, 922], [584, 908], [690, 944], [768, 1008], [786, 1080], [795, 1170], [791, 1260], [779, 1340], [764, 1405],
  [752, 1440], [600, 1462], [430, 1452], [395, 1405], [350, 1330], [318, 1250], [312, 1180], [326, 1110], [348, 1050],
];
const PALM_D = smoothClosed(PALM);
const ARM: P[] = [
  [430, 1380], [600, 1390], [752, 1395], [778, 1440], [786, 1475], [790, 1560], [806, 1680], [828, 1820], [846, 2000],
  [350, 2000], [362, 1820], [378, 1680], [394, 1560], [404, 1470],
];
const ARM_D = smoothClosed(ARM);

// рукав кардигана
const SLEEVE: P[] = [
  [300, 1745], [380, 1716], [470, 1706], [560, 1704], [650, 1700], [745, 1696], [830, 1702], [880, 1726], [910, 1820], [930, 2000],
  [270, 2000], [282, 1840],
];
const SLEEVE_D = smoothClosed(SLEEVE);
const CUFF_TOP = smoothOpen([[300, 1745], [380, 1716], [470, 1706], [560, 1704], [650, 1700], [745, 1696], [830, 1702], [880, 1726]]);

const MOTTLE: [number, number, number][] = (() => { const r = mulberry(12); return Array.from({ length: 16 }, () => [360 + r() * 420, 1030 + r() * 640, 30 + r() * 50] as [number, number, number]); })();
// тяжи сухожилий разгибателей: от запястья веером к костяшкам
const TENDONS: P[][] = [
  [[560, 1420], [520, 1300], [470, 1170], [432, 1050]],
  [[585, 1420], [568, 1300], [548, 1160], [534, 1030]],
  [[610, 1420], [620, 1300], [630, 1170], [638, 1045]],
  [[640, 1420], [672, 1300], [705, 1190], [730, 1085]],
];
// вены тыльной венозной сети
const VEINS: { pts: P[]; w: number }[] = [
  { pts: [[474, 1050], [462, 1120], [440, 1200], [424, 1280], [418, 1360], [428, 1450], [420, 1560], [404, 1700]], w: 19 },
  { pts: [[586, 1062], [578, 1130], [552, 1200], [505, 1248], [450, 1270], [424, 1290]], w: 16 },
  { pts: [[690, 1088], [700, 1160], [696, 1240], [670, 1320], [652, 1420], [660, 1540], [684, 1700]], w: 18 },
  { pts: [[578, 1135], [620, 1185], [660, 1225], [690, 1255]], w: 12 },
  { pts: [[318, 1240], [352, 1296], [392, 1338], [420, 1372]], w: 13 },
  { pts: [[655, 1460], [610, 1540], [575, 1620], [560, 1700]], w: 12 },
  { pts: [[770, 1250], [760, 1330], [742, 1400], [745, 1500], [762, 1620]], w: 10 },
];

export const OldHand: React.FC<OldHandProps> = ({ frame = 0, bite = 0, puncture = false, burn = 0, scar, water = 0, soap = 0, syringe = 0, tremble = 0, bg = "#120c08", uid = "oh" }) => {
  const p = `${uid}-`;
  const id = (s: string) => `${p}${s}`;
  const u = (s: string) => `url(#${p}${s})`;
  const scarA = scar ?? (burn > 0 ? 1 : 0);
  const R = useMemo(() => {
    const r = mulberry(77);
    const hairs = Array.from({ length: 300 }, () => {
      const y = 1440 + r() * 300, x = 390 + r() * 420;
      const a = 1.1 + r() * 0.6, L = 12 + r() * 16;
      return { x, y, x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L, c: r() > 0.45 ? "#a8998c" : "#6e5a4e", w: 0.9 + r() * 0.9, o: 0.35 + r() * 0.4 };
    });
    const dorsHairs = Array.from({ length: 50 }, () => {
      const y = 1250 + r() * 190, x = 600 + r() * 190;
      const a = 1.0 + r() * 0.6, L = 8 + r() * 10;
      return { x, y, x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L, c: r() > 0.5 ? "#a8998c" : "#7a6658", w: 0.9 + r() * 0.6, o: 0.35 + r() * 0.3 };
    });
    return { hairs, dorsHairs };
  }, []);

  // дрожь
  const tx = tremble * (Math.sin(frame * 1.9) * 5 + Math.sin(frame * 4.3) * 2.5);
  const ty = tremble * (Math.sin(frame * 2.4 + 1) * 4 + Math.sin(frame * 5.7) * 1.8);
  const rot = tremble * (Math.sin(frame * 1.5) * 0.8 + Math.sin(frame * 3.9) * 0.35);

  const fill = u("vol");
  const fo = (i: number) => ({ id: id(`f${i}`), pal: PAL, fill, seed: 11 + i * 7, hairs: i === 3 ? 4 : 7, mode: "shade" as const });

  return (
    <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0, filter: "blur(0.6px)" }}>
      <defs>
        <SkinDefs p={p} />
        <KnitDefs p={p} c1="#4c5661" c2="#2a3037" c3="#8995a0" />
        <radialGradient id={id("vol")} gradientUnits="userSpaceOnUse" cx={470} cy={1020} r={820}>
          <stop offset="0" stopColor={PAL.light} />
          <stop offset="0.38" stopColor={PAL.base} />
          <stop offset="0.7" stopColor={PAL.mid} />
          <stop offset="1" stopColor={PAL.shadow} />
        </radialGradient>
        <linearGradient id={id("slv")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b7681" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </linearGradient>
        <clipPath id={id("palm")}><path d={PALM_D} /><path d={ARM_D} /></clipPath>
        <clipPath id={id("all")}>
          <path d={PALM_D} /><path d={ARM_D} /><path d={THUMB.path} />
          {FINGERS.map((g, i) => <path key={i} d={g.path} />)}
        </clipPath>
        <clipPath id={id("slvc")}><path d={SLEEVE_D} /></clipPath>
        <linearGradient id={id("waterG")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cfeaf4" stopOpacity="0.7" />
          <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.4" stopColor="#bfe0ec" stopOpacity="0.28" />
          <stop offset="0.75" stopColor="#d9eff7" stopOpacity="0.38" />
          <stop offset="1" stopColor="#8fb8c8" stopOpacity="0.7" />
        </linearGradient>
        <mask id={id("streamMask")} maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
          <rect x="0" y="0" width="1080" height="1920" fill="#fff" />
          <rect x="0" y="0" width="1080" height="420" fill="#000" />
          <rect x="0" y="420" width="1080" height="180" fill={u("streamFade")} />
        </mask>
        <linearGradient id={id("streamFade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
      </defs>

      {bg && (
        <g>
          <rect width={1080} height={1920} fill={bg} />
          <ellipse cx={500} cy={1150} rx={460} ry={640} fill="#5a3a1e" opacity={0.45} filter={u("b42")} />
          <ellipse cx={330} cy={760} rx={300} ry={260} fill="#7a5028" opacity={0.25} filter={u("b42")} />
          <rect width={1080} height={1920} filter={u("tex")} opacity={0.06} />
        </g>
      )}

      <g transform={`translate(${tx.toFixed(2)} ${ty.toFixed(2)}) rotate(${rot.toFixed(3)} 580 1700)`}>
        {/* падающая тень */}
        <g transform="translate(26 34)" opacity={0.55} filter={u("b28")}>
          <path d={PALM_D} fill="#000" /><path d={ARM_D} fill="#000" /><path d={THUMB.path} fill="#000" />
          {FINGERS.map((g, i) => <path key={i} d={g.path} fill="#000" />)}
        </g>

        {/* единый силуэт: сначала обводка всех частей, потом заливка — внутренних швов нет */}
        {[PALM_D, ARM_D, THUMB.path, ...FINGERS.map((g) => g.path)].map((d, i) => <path key={`s${i}`} d={d} fill="none" stroke={LINE} strokeWidth={6} />)}
        {[PALM_D, ARM_D, THUMB.path, ...FINGERS.map((g) => g.path)].map((d, i) => <path key={`f${i}`} d={d} fill={fill} />)}

        {/* аэрограф по тылу кисти и предплечью */}
        <g clipPath={u("all")}>
          <ellipse cx={500} cy={1120} rx={190} ry={130} fill={PAL.hi} opacity={0.55} filter={u("b42")} />
          <ellipse cx={430} cy={1560} rx={70} ry={260} fill={PAL.hi} opacity={0.45} filter={u("b42")} />
          {/* межкостные ложбинки между пястными костями */}
          {[[474, 1080, 492, 1330], [584, 1080, 592, 1340], [690, 1110, 676, 1330]].map(([x1, y1, x2, y2], i) => (
            <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 + 6} ${(y1 + y2) / 2} ${x2} ${y2}`} stroke={PAL.shadow} strokeWidth={36} fill="none" opacity={0.48} filter={u("b18")} strokeLinecap="round" />
          ))}
          {/* бугорки пястно-фаланговых суставов */}
          {FINGERS.map((g, i) => (
            <g key={i}>
              <ellipse cx={g.J[0][0] - 10} cy={g.J[0][1] + 18} rx={46} ry={36} fill={PAL.hi} opacity={0.65} filter={u("b12")} />
              <ellipse cx={g.J[0][0] + 22} cy={g.J[0][1] + 40} rx={30} ry={22} fill={PAL.shadow} opacity={0.35} filter={u("b12")} />
              <ellipse cx={g.J[0][0]} cy={g.J[0][1] + 10} rx={50} ry={40} fill={PAL.red} opacity={0.18} filter={u("b18")} />
            </g>
          ))}
          {/* перепонки между пальцами — тень */}
          {[[474, 935], [584, 922], [690, 958]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y + 18} rx={26} ry={30} fill={PAL.deep} opacity={0.35} filter={u("b8")} />)}
          {/* пятнистая краснота старой кожи */}
          {MOTTLE.map((m, i) => <ellipse key={`mt${i}`} cx={m[0]} cy={m[1]} rx={m[2]} ry={m[2] * 0.7} fill={i % 3 ? PAL.red : "#a86a8a"} opacity={0.16} filter={u("b18")} />)}
          {/* мышца у большого пальца */}
          <ellipse cx={370} cy={1180} rx={58} ry={95} fill={PAL.hi} opacity={0.5} filter={u("b18")} transform="rotate(-25 370 1180)" />
          <ellipse cx={402} cy={1270} rx={40} ry={70} fill={PAL.shadow} opacity={0.35} filter={u("b18")} transform="rotate(-25 402 1270)" />
          {/* холодная тень по локтевому краю */}
          <path d={smoothOpen([[770, 1012], [806, 1110], [812, 1220], [790, 1350], [770, 1440], [790, 1560], [812, 1700], [830, 1900]])} stroke={PAL.cool} strokeWidth={110} fill="none" opacity={0.55} filter={u("b28")} />
          <path d={smoothOpen([[790, 1040], [814, 1150], [812, 1260], [792, 1380]])} stroke={PAL.shadow} strokeWidth={40} fill="none" opacity={0.4} filter={u("b12")} />
          <path d={smoothOpen([[330, 1100], [322, 1200], [350, 1300], [395, 1420], [384, 1560], [370, 1720], [358, 1900]])} stroke={PAL.mid} strokeWidth={50} fill="none" opacity={0.4} filter={u("b18")} />
          {/* запястье: перехват, головка локтевой кости */}
          <path d={smoothOpen([[420, 1420], [520, 1440], [620, 1442], [760, 1430]])} stroke={PAL.shadow} strokeWidth={36} fill="none" opacity={0.28} filter={u("b18")} />
          <ellipse cx={756} cy={1470} rx={26} ry={30} fill={PAL.hi} opacity={0.6} filter={u("b8")} />
          <ellipse cx={770} cy={1505} rx={22} ry={18} fill={PAL.shadow} opacity={0.4} filter={u("b8")} />
          {/* сухожилия */}
          {TENDONS.map((t, i) => (
            <g key={i}>
              <path d={smoothOpen(t.map(([x, y]) => [x + 12, y + 4] as P))} stroke={PAL.shadow} strokeWidth={14} fill="none" opacity={0.42} filter={u("b8")} />
              <path d={smoothOpen(t)} stroke={PAL.hi} strokeWidth={14} fill="none" opacity={0.62} filter={u("b5")} />
            </g>
          ))}
          {/* тень от рукава */}
          <path d={CUFF_TOP} transform="translate(0 -6)" stroke={PAL.deep} strokeWidth={46} fill="none" opacity={0.6} filter={u("b18")} />
          {/* вены */}
          {VEINS.map((v, i) => <Vein key={i} pts={v.pts} w={v.w} pal={PAL} p={p} />)}
          {/* складки запястья и дряблая кожа над костяшками */}
          {[0, 1, 2].map((k) => <Wr key={k} d={smoothOpen([[440 + k * 6, 1418 + k * 16], [520, 1426 + k * 17], [600, 1430 + k * 16], [700 - k * 10, 1422 + k * 14]])} w={2.3} o={0.32 - k * 0.06} c={LINE} />)}
          {FINGERS.map((g, i) => {
            const [x, y] = g.J[0];
            return [0, 1, 2].map((k) => (
              <Wr key={`${i}${k}`} d={`M${x - 34 + k * 6} ${y + 46 + k * 13} Q${x} ${y + 58 + k * 15} ${x + 32 - k * 6} ${y + 44 + k * 12}`} w={2.2} o={0.42 - k * 0.1} c={LINE} />
            ));
          })}
          <Crepe n={240} seed={5} box={[340, 1060, 460, 360]} c={LINE} o={0.13} ang={0.25} />
          <Crepe n={140} seed={6} box={[360, 1460, 460, 260]} c={LINE} o={0.1} ang={0.1} />
          {R.dorsHairs.map((h, i) => <line key={i} x1={h.x} y1={h.y} x2={h.x2} y2={h.y2} stroke={h.c} strokeWidth={h.w} opacity={h.o} strokeLinecap="round" />)}
        </g>

        {/* большой палец и пальцы */}
        <FingerView g={THUMB} o={{ id: id("th"), pal: PAL, fill, seed: 3, hairs: 6, joints: [2], mode: "shade" }} />
        {FINGERS.map((g, i) => <FingerView key={i} g={g} o={fo(i)} />)}

        {/* общие фактуры и пигментные пятна поверх всего силуэта */}
        <g clipPath={u("all")}>
          <rect x={0} y={400} width={1080} height={1520} filter={u("blot")} opacity={0.32} />
          <rect x={0} y={400} width={1080} height={1520} filter={u("tex")} opacity={0.24} style={{ mixBlendMode: "multiply" }} />
          <AgeSpots n={26} seed={21} box={[360, 1040, 440, 400]} pal={PAL} p={p} />
          <AgeSpots n={14} seed={22} box={[380, 1460, 420, 230]} pal={PAL} p={p} />
          <AgeSpots n={7} seed={23} box={[380, 720, 360, 260]} pal={PAL} p={p} scale={0.6} />
          {R.hairs.map((h, i) => <line key={i} x1={h.x} y1={h.y} x2={h.x2} y2={h.y2} stroke={h.c} strokeWidth={h.w} opacity={h.o} strokeLinecap="round" />)}
          {/* шрам и жжение — под кожей */}
          {scarA > 0 && <Scar a={scarA} p={p} />}
          {burn > 0 && <Burn a={burn} frame={frame} p={p} />}
          {bite > 0 && <Bite a={bite} frame={frame} p={p} single={puncture} />}
          {water > 0 && <WetSkin a={water} frame={frame} p={p} />}
        </g>
        {burn > 0 && <ellipse cx={WOUND[0]} cy={WOUND[1]} rx={260} ry={240} fill="#ff4a1e" opacity={burn * 0.16 * (0.6 + 0.4 * Math.sin(frame * 0.35))} filter={u("b42")} style={{ mixBlendMode: "screen" }} />}
        {bite > 0 && <BloodTrickles a={bite} frame={frame} p={p} />}
        {soap > 0 && <Soap a={soap} frame={frame} p={p} wet={water} />}

        {/* рукав кардигана */}
        <g>
          <path d={SLEEVE_D} fill="none" stroke="#161a1f" strokeWidth={6} />
          <path d={SLEEVE_D} fill={u("st")} />
          <g clipPath={u("slvc")}>
            <rect x={250} y={1680} width={700} height={170} fill={u("rib")} transform="rotate(-1 580 1760)" />
            <path d={smoothOpen([[280, 1856], [500, 1846], [700, 1842], [920, 1852]])} stroke="#1b2026" strokeWidth={10} fill="none" opacity={0.7} filter={u("b3")} />
            <rect x={250} y={1680} width={700} height={260} fill={u("slv")} />
            <path d={CUFF_TOP} transform="translate(0 16)" stroke="#a7b2bc" strokeWidth={14} fill="none" opacity={0.35} filter={u("b8")} />
            <ellipse cx={360} cy={1800} rx={90} ry={150} fill="#8796a3" opacity={0.25} filter={u("b28")} />
            <rect x={250} y={1680} width={700} height={260} filter={u("fuzz")} opacity={0.35} />
          </g>
          <path d={CUFF_TOP} stroke="#161a1f" strokeWidth={4} fill="none" />
        </g>

        {syringe > 0 && <Syringe a={syringe} p={p} />}
      </g>

      {water > 0 && <WaterStream a={water} frame={frame} p={p} />}
    </svg>
  );
};

// ---------------- эффекты ----------------
const PUNCT: P[] = [[-44, -40], [46, -32], [-34, 42], [38, 48]];
const SCRATCH: { a: P; b: P; c: number }[] = [
  { a: [-110, -96], b: [70, 92], c: 18 },
  { a: [-82, -116], b: [104, 64], c: 14 },
  { a: [-128, -60], b: [20, 110], c: 10 },
];

const Bite: React.FC<{ a: number; frame: number; p: string; single?: boolean }> = ({ a, p, single }) => {
  const SCR = single ? [] : SCRATCH, PUN = single ? PUNCT.slice(0, 1) : PUNCT;
  const u = (s: string) => `url(#${p}${s})`;
  const [wx, wy] = WOUND;
  const r = mulberry(404);
  const pop = Math.min(1, a * 2.2);
  const sw = Math.min(1, a * 1.3);
  return (
    <g>
      {/* отёк и красный ореол */}
      <ellipse cx={wx} cy={wy} rx={200 * (0.6 + sw * 0.4)} ry={170 * (0.6 + sw * 0.4)} fill="#c8484c" opacity={0.35 * sw} filter={u("b42")} />
      <ellipse cx={wx - 10} cy={wy - 4} rx={120} ry={100} fill="#d4605c" opacity={0.35 * sw} filter={u("b28")} />
      <ellipse cx={wx - 22} cy={wy - 26} rx={95} ry={70} fill="#f6cdb8" opacity={0.4 * sw} filter={u("b18")} />
      <path d={`M${wx + 60} ${wy - 40} Q${wx + 110} ${wy + 40} ${wx + 40} ${wy + 100}`} stroke="#8a3a40" strokeWidth={36} fill="none" opacity={0.3 * sw} filter={u("b18")} />
      {/* синяки-кровоподтёки */}
      {PUN.map(([dx, dy], i) => <ellipse key={`bz${i}`} cx={wx + dx} cy={wy + dy} rx={34} ry={28} fill="#7a2d48" opacity={0.42 * sw} filter={u("b8")} />)}
      {/* царапины: припухший валик, рваный сужающийся порез, тёмная сердцевина, капельки */}
      {SCR.map((s, i) => {
        const A: P = [wx + s.a[0], wy + s.a[1]], B: P = [wx + s.b[0], wy + s.b[1]];
        const M: P = [(A[0] + B[0]) / 2 + s.c, (A[1] + B[1]) / 2 - s.c * 0.6];
        const q = (t: number): P => [(1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * M[0] + t * t * B[0], (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * M[1] + t * t * B[1]];
        const cuts = scratchPieces(q, 7 - i * 1.2, mulberry(500 + i), pop);
        const d = `M${A[0]} ${A[1]} Q${M[0]} ${M[1]} ${B[0]} ${B[1]}`;
        return (
          <g key={`s${i}`} opacity={Math.min(1, a * 1.6)}>
            <path d={d} stroke="#d8726c" strokeWidth={22 - i * 3} fill="none" opacity={0.4} filter={u("b5")} strokeLinecap="round" />
            <path d={d} transform="translate(-4 -5)" stroke="#f7d2c0" strokeWidth={6} fill="none" opacity={0.35} filter={u("b3")} strokeLinecap="round" />
            {cuts.map((c, k) => (
              <g key={k}>
                <path d={c.outer} fill="#b02a30" stroke="#6e1016" strokeWidth={1.2} />
                <path d={c.inner} fill="#4a070b" opacity={0.85} />
              </g>
            ))}
            {Array.from({ length: 3 }, (_, k) => {
              const [x, y] = q(0.2 + k * 0.28 + r() * 0.08);
              const rr = (2.5 + r() * 3.5) * a;
              return <g key={k}><circle cx={x + 2} cy={y + 3} r={rr} fill="#7a0c12" /><circle cx={x + 1} cy={y + 1.8} r={rr * 0.35} fill="#ffc0b8" opacity={0.8} /></g>;
            })}
          </g>
        );
      })}
      {/* проколы клыков */}
      {PUN.map(([dx, dy], i) => {
        const x = wx + dx, y = wy + dy, s = pop * (i < 2 ? 1.1 : 0.95);
        const tear = smoothClosed(blobPts([x, y], 15 * s, 12 * s, mulberry(70 + i), 8, 0.4));
        return (
          <g key={`p${i}`}>
            <path d={tear} fill="#c0545a" stroke="#7a1a20" strokeWidth={2} />
            <ellipse cx={x + 1} cy={y + 1} rx={9 * s} ry={8 * s} fill="#2c0507" />
            <ellipse cx={x + 2} cy={y + 2.5} rx={5.5 * s} ry={4.5 * s} fill="#6b0c10" />
            <ellipse cx={x - 4 * s} cy={y - 4 * s} rx={2.6 * s} ry={1.8 * s} fill="#ffd0c4" opacity={0.85} />
            <path d={`M${x - 13 * s} ${y + 6 * s} q${12 * s} ${10 * s} ${25 * s} -1`} stroke="#ffd8cc" strokeWidth={1.6} fill="none" opacity={0.5} />
          </g>
        );
      })}
    </g>
  );
};

// рваный порез: несколько сужающихся кусков вдоль кривой
const scratchPieces = (q: (t: number) => P, w: number, r: () => number, grow: number) => {
  const out: { outer: string; inner: string }[] = [];
  let t = 0.02;
  while (t < 0.96 * grow) {
    const len = 0.18 + r() * 0.3;
    const t1 = Math.min(0.98 * grow, t + len);
    const N = 7;
    const L: P[] = [], R: P[] = [], Li: P[] = [], Ri: P[] = [];
    for (let k = 0; k <= N; k++) {
      const tt = t + ((t1 - t) * k) / N;
      const p = q(tt), p2 = q(Math.min(1, tt + 0.01));
      const dx = p2[0] - p[0], dy = p2[1] - p[1], l = Math.hypot(dx, dy) || 1;
      const nx = -dy / l, ny = dx / l;
      const env = Math.sin((Math.PI * k) / N) * (0.7 + r() * 0.5);
      const ww = w * env;
      L.push([p[0] - nx * ww * 0.55, p[1] - ny * ww * 0.55]);
      R.push([p[0] + nx * ww * 0.45, p[1] + ny * ww * 0.45]);
      Li.push([p[0] - nx * ww * 0.18, p[1] - ny * ww * 0.18]);
      Ri.push([p[0] + nx * ww * 0.15, p[1] + ny * ww * 0.15]);
    }
    out.push({ outer: smoothClosed([...L, ...R.reverse()]), inner: smoothClosed([...Li, ...Ri.reverse()]) });
    t = t1 + 0.03 + r() * 0.06;
  }
  return out;
};

// струйки крови от нижних (и одной верхней) ран — растут с bite
const BloodTrickles: React.FC<{ a: number; frame: number; p: string }> = ({ a, frame, p }) => {
  const [wx, wy] = WOUND;
  const g = Math.max(0, (a - 0.35) / 0.65);
  if (g <= 0) return null;
  const list: { o: P; L: number; seed: number }[] = [
    { o: PUNCT[2], L: 210, seed: 1 }, { o: PUNCT[3], L: 280, seed: 2 }, { o: PUNCT[1], L: 120, seed: 3 },
  ];
  return (
    <g>
      {list.map((t, i) => {
        const r = mulberry(900 + t.seed);
        const L = t.L * g + Math.sin(frame * 0.08 + i) * 3 * g;
        const x0 = wx + t.o[0] + 2, y0 = wy + t.o[1] + 6;
        const N = 8;
        const cl: P[] = Array.from({ length: N + 1 }, (_, k) => {
          const v = k / N;
          return [x0 + Math.sin(v * 5 + t.seed) * 7 + v * (r() - 0.5) * 18 + v * 14, y0 + v * L] as P;
        });
        const wAt = (v: number) => 6.5 - v * 2.6;
        const left = cl.map(([x, y], k) => [x - wAt(k / N), y] as P);
        const right = cl.map(([x, y], k) => [x + wAt(k / N), y] as P).reverse();
        const end = cl[N];
        const dr = 8.5 + g * 2;
        const drop: P[] = [[end[0] - dr * 0.9, end[1] + dr * 0.2], [end[0] - dr * 0.6, end[1] + dr * 1.1], [end[0], end[1] + dr * 1.4], [end[0] + dr * 0.6, end[1] + dr * 1.1], [end[0] + dr * 0.9, end[1] + dr * 0.2]];
        const body = smoothClosed([...left.slice(0, N), ...drop, ...right.slice(1)]);
        return (
          <g key={i}>
            <path d={body} transform="translate(3 4)" fill="#3a0608" opacity={0.35} filter={`url(#${p}b3)`} />
            <path d={body} fill="#7d0b12" stroke="#420509" strokeWidth={1.8} />
            <path d={smoothOpen(cl.slice(0, N).map(([x, y]) => [x - 2.2, y] as P))} stroke="#c22c32" strokeWidth={2.2} fill="none" opacity={0.8} />
            <ellipse cx={end[0] - dr * 0.3} cy={end[1] + dr * 0.6} rx={dr * 0.25} ry={dr * 0.35} fill="#ffc8c0" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

const Scar: React.FC<{ a: number; p: string }> = ({ a, p }) => {
  const [wx, wy] = WOUND;
  const u = (s: string) => `url(#${p}${s})`;
  return (
    <g opacity={a}>
      <ellipse cx={wx} cy={wy} rx={130} ry={115} fill="#d88a84" opacity={0.28} filter={u("b28")} />
      {SCRATCH.map((s, i) => {
        const A: P = [wx + s.a[0], wy + s.a[1]], B: P = [wx + s.b[0], wy + s.b[1]];
        const M: P = [(A[0] + B[0]) / 2 + s.c, (A[1] + B[1]) / 2 - s.c * 0.6];
        const d = `M${A[0]} ${A[1]} Q${M[0]} ${M[1]} ${B[0]} ${B[1]}`;
        return (
          <g key={i}>
            <path d={d} stroke="#c97a76" strokeWidth={11} fill="none" opacity={0.5} filter={u("b3")} strokeLinecap="round" />
            <path d={d} stroke="#eeb2a8" strokeWidth={5.5} fill="none" strokeLinecap="round" strokeDasharray={`${60 + i * 10} 14 ${40} 10`} />
            <path d={d} transform="translate(-1.5 -2)" stroke="#fff0ea" strokeWidth={1.6} fill="none" opacity={0.75} strokeDasharray={`${60 + i * 10} 14 ${40} 10`} />
          </g>
        );
      })}
      {PUNCT.map(([dx, dy], i) => {
        const x = wx + dx, y = wy + dy;
        return (
          <g key={`p${i}`}>
            <path d={smoothClosed(blobPts([x, y], 14, 11, mulberry(30 + i), 8, 0.45))} fill="#e9a29a" stroke="#a6524e" strokeWidth={1.6} />
            <ellipse cx={x + 2} cy={y + 2} rx={6} ry={5} fill="#b9605e" opacity={0.7} />
            <ellipse cx={x - 3} cy={y - 3} rx={3.5} ry={2.2} fill="#fff4ee" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
};

// жжение: пульсирующий жар + бегущие по нервам «искры» вниз по предплечью (к телу)
const Burn: React.FC<{ a: number; frame: number; p: string }> = ({ a, frame, p }) => {
  const [wx, wy] = WOUND;
  const u = (s: string) => `url(#${p}${s})`;
  const pulse = 0.55 + 0.3 * Math.sin(frame * 0.35) + 0.15 * Math.sin(frame * 0.9 + 1);
  const r = mulberry(606);
  const nerves = Array.from({ length: 8 }, (_, i) => {
    const pts: P[] = [[wx + (r() - 0.5) * 60, wy + (r() - 0.5) * 50]];
    const tx = 400 + i * 52 + (r() - 0.5) * 30;
    for (let k = 1; k <= 9; k++) {
      const v = k / 9;
      const prev = pts[k - 1];
      pts.push([prev[0] + (tx - prev[0]) * 0.28 + (r() - 0.5) * 34, wy + v * (560 + r() * 60)]);
    }
    return pts;
  });
  const up = Array.from({ length: 4 }, (_, i) => {
    const pts: P[] = [[wx, wy]];
    for (let k = 1; k <= 5; k++) pts.push([wx + (i - 1.5) * 26 * k + (r() - 0.5) * 20, wy - k * 34 - r() * 10]);
    return pts;
  });
  return (
    <g>
      <ellipse cx={wx} cy={wy} rx={230} ry={210} fill="#e23a22" opacity={a * 0.75 * pulse} filter={u("b42")} />
      <ellipse cx={wx} cy={wy} rx={110} ry={95} fill="#ff5a28" opacity={a * 0.75 * pulse} filter={u("b28")} />
      <ellipse cx={wx} cy={wy} rx={46} ry={40} fill="#ffc080" opacity={a * 0.55 * pulse} filter={u("b12")} />
      {[...nerves, ...up].map((pts, i) => {
        const d = smoothOpen(pts);
        const off = -frame * 9 - i * 37;
        return (
          <g key={i}>
            <path d={d} stroke="#ff4a1a" strokeWidth={20} fill="none" opacity={a * 0.5 * pulse} filter={u("b8")} />
            <path d={d} stroke="#ff6a2a" strokeWidth={5} fill="none" opacity={a * 0.85} strokeDasharray="26 18 8 22" strokeDashoffset={off} strokeLinecap="round" />
            <path d={d} stroke="#fff0c8" strokeWidth={2.4} fill="none" opacity={a} strokeDasharray="10 60" strokeDashoffset={off * 1.6} strokeLinecap="round" />
          </g>
        );
      })}
      {/* покалывание: мелкие вспыхивающие точки */}
      {Array.from({ length: 40 }, (_, i) => {
        const rr = mulberry(700 + i);
        const x = 400 + rr() * 380, y = wy - 100 + rr() * 700;
        const on = Math.max(0, Math.sin(frame * (0.3 + rr() * 0.4) + rr() * 6));
        const s = 3 + rr() * 4;
        return <g key={`t${i}`} opacity={a * on * 0.9}>
          <circle cx={x} cy={y} r={s * 2.2} fill="#ff5a2a" opacity={0.4} filter={u("b3")} />
          <path d={`M${x - s} ${y} L${x + s} ${y} M${x} ${y - s} L${x} ${y + s}`} stroke="#ffd8a8" strokeWidth={1.4} />
        </g>;
      })}
    </g>
  );
};

// мокрая кожа: потемнение, плёнка воды стекает к запястью, блики
const WetSkin: React.FC<{ a: number; frame: number; p: string }> = ({ a, frame, p }) => {
  const [wx, wy] = WOUND;
  const u = (s: string) => `url(#${p}${s})`;
  const film: P[] = [[wx - 120, wy - 40], [wx - 40, wy - 90], [wx + 70, wy - 60], [wx + 150, wy + 40], [wx + 170, wy + 200], [wx + 190, wy + 380], [wx + 200, 1720], [wx - 140, 1720], [wx - 130, wy + 360], [wx - 150, wy + 150]];
  const filmD = smoothClosed(film);
  return (
    <g opacity={a}>
      <path d={filmD} fill="#8a5a50" opacity={0.18} filter={u("b18")} style={{ mixBlendMode: "multiply" }} />
      <path d={filmD} fill="#e8f6fb" opacity={0.12} filter={u("b8")} />
      {/* ручейки */}
      {[-90, -40, 10, 60, 120].map((dx, i) => {
        const d = smoothOpen([[wx + dx * 0.6, wy + 30], [wx + dx * 0.8 + 8, wy + 160], [wx + dx + Math.sin(i) * 12, wy + 320], [wx + dx * 1.1, 1700]]);
        return (
          <g key={i}>
            <path d={d} stroke="#f4fbfe" strokeWidth={16 + (i % 2) * 8} fill="none" opacity={0.2} filter={u("b5")} />
            <path d={d} stroke="#ffffff" strokeWidth={2.4} fill="none" opacity={0.75} strokeDasharray="30 50 12 40" strokeDashoffset={-frame * 14 - i * 23} strokeLinecap="round" />
            <path d={d} transform="translate(5 3)" stroke="#6a8a98" strokeWidth={1.4} fill="none" opacity={0.3} />
          </g>
        );
      })}
      {/* блики-искорки */}
      {Array.from({ length: 34 }, (_, i) => {
        const r = mulberry(800 + i);
        const x = wx - 140 + r() * 320, y = wy - 60 + r() * 560;
        const tw = 0.5 + 0.5 * Math.sin(frame * (0.4 + r() * 0.5) + r() * 6);
        return <ellipse key={i} cx={x} cy={y} rx={2 + r() * 5} ry={1.4 + r() * 2.5} fill="#fff" opacity={0.85 * tw} />;
      })}
    </g>
  );
};

// струя из-под крана: вверху растворяется (зона титров спокойная), удар, брызги, корона
const WaterStream: React.FC<{ a: number; frame: number; p: string }> = ({ a, frame, p }) => {
  const u = (s: string) => `url(#${p}${s})`;
  const cx = WOUND[0] - 6, iy = WOUND[1] - 18;
  const ys = Array.from({ length: 15 }, (_, i) => 360 + (i / 14) * (iy - 360));
  const hw = (y: number) => 30 - ((y - 360) / (iy - 360)) * 9;
  const wob = (y: number, s: number) => Math.sin(y * 0.021 - frame * 0.9 + s) * 3.5 + Math.sin(y * 0.053 + frame * 1.7 + s) * 1.6;
  const L = ys.map((y) => [cx - hw(y) + wob(y, 0), y] as P);
  const Rt = ys.map((y) => [cx + hw(y) + wob(y, 2), y] as P).reverse();
  const body = smoothClosed([...L, [cx - 34, iy + 10], [cx + 34, iy + 10], ...Rt]);
  return (
    <g opacity={a}>
      <g mask={`url(#${p}streamMask)`}>
        <path d={body} fill="#0b1a20" opacity={0.18} transform="translate(10 0)" filter={u("b8")} />
        <path d={body} fill={u("waterG")} />
        {[-14, -5, 6, 15].map((dx, i) => (
          <path key={i} d={smoothOpen(ys.map((y) => [cx + dx * (hw(y) / 26) + wob(y, i), y] as P))} stroke="#fff" strokeWidth={i === 0 ? 3.5 : 1.8} fill="none" opacity={i === 0 ? 0.85 : 0.5} strokeDasharray={`${40 + i * 12} ${26 + i * 9}`} strokeDashoffset={-frame * (46 + i * 6)} strokeLinecap="round" />
        ))}
        <path d={body} fill="none" stroke="#9fc6d4" strokeWidth={1.6} opacity={0.6} />
      </g>
      {/* корона удара (вид сверху) */}
      {(() => {
        const r = mulberry(31 + (Math.floor(frame / 2) % 5));
        const crown = smoothClosed(blobPts([cx, iy + 8], 92, 58, r, 14, 0.38));
        const inner = smoothClosed(blobPts([cx, iy + 6], 52, 32, r, 10, 0.3));
        return (
          <g>
            <path d={crown} fill="#e8f6fb" opacity={0.3} />
            <path d={crown} fill="none" stroke="#ffffff" strokeWidth={3.5} opacity={0.75} />
            <path d={crown} fill="none" stroke="#7aa0b0" strokeWidth={1.4} opacity={0.5} transform="translate(2 3)" />
            <path d={inner} fill="#ffffff" opacity={0.55} filter={u("b3")} />
          </g>
        );
      })()}
      {/* брызги: разлетаются радиально, затухают */}
      {Array.from({ length: 48 }, (_, i) => {
        const r = mulberry(i * 13 + 5);
        const per = 14 + r() * 12;
        const t = ((frame + r() * per) % per) / per;
        const ang = r() * Math.PI * 2;
        const dist = (70 + r() * 210) * (1 - (1 - t) * (1 - t));
        const x = cx + Math.cos(ang) * dist * 1.25, y = iy + Math.sin(ang) * dist * 0.85 + t * t * 40;
        const s = (3 + r() * 6) * (1 - t * 0.6);
        return (
          <g key={i} opacity={(1 - t) * 0.95}>
            <ellipse cx={x} cy={y} rx={s * 1.3} ry={s} transform={`rotate(${(ang / DEG).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`} fill="#e4f4fa" opacity={0.6} stroke="#8fb4c2" strokeWidth={1} />
            <circle cx={x - s * 0.3} cy={y - s * 0.3} r={s * 0.35} fill="#fff" />
          </g>
        );
      })}
    </g>
  );
};

// мыльная пена: густая микропена + пузыри разного размера с бликами и радужкой
const Soap: React.FC<{ a: number; frame: number; p: string; wet?: number }> = ({ a, frame, p, wet = 0 }) => {
  const u = (s: string) => `url(#${p}${s})`;
  const [wx, wy] = WOUND;
  const r = mulberry(55);
  const micro = Array.from({ length: 160 }, () => {
    const ang = r() * Math.PI * 2, d = Math.sqrt(r());
    return { x: wx + Math.cos(ang) * d * 150, y: wy + Math.sin(ang) * d * 115 + d * 10, r: 5 + r() * 12 };
  });
  const bubbles = Array.from({ length: 48 }, (_, i) => {
    const ang = r() * Math.PI * 2, d = Math.sqrt(r());
    const big = r();
    return { x: wx + Math.cos(ang) * d * 160, y: wy + Math.sin(ang) * d * 125, r: big > 0.85 ? 26 + r() * 14 : big > 0.5 ? 12 + r() * 10 : 5 + r() * 6, ph: r() * 6, th: r() * 0.6 + 0.2, irid: r() > 0.7, i };
  });
  const k = Math.min(1, a * 1.2);
  return (
    <g>
      <g filter={u("b3")}>
        {micro.slice(0, Math.round(160 * k)).map((m, i) => <circle key={i} cx={m.x + 4} cy={m.y + 6} r={m.r * k} fill="#8a9aa6" opacity={0.35} />)}
      </g>
      <g filter={u("b1.5")}>
        {micro.slice(0, Math.round(160 * k)).map((m, i) => <circle key={i} cx={m.x} cy={m.y} r={m.r * k} fill="#f3f7fa" opacity={0.9} />)}
      </g>
      {micro.slice(0, Math.round(160 * k)).filter((_, i) => i % 3 === 0).map((m, i) => <circle key={`mo${i}`} cx={m.x} cy={m.y} r={m.r * k * 0.8} fill="none" stroke="#b9c8d2" strokeWidth={1} opacity={0.6} />)}
      {/* потёки пены вниз с водой */}
      {wet > 0 && [-60, 10, 70].map((dx, i) => (
        <path key={`dr${i}`} d={smoothOpen([[wx + dx, wy + 80], [wx + dx + 6, wy + 170], [wx + dx - 4, wy + 260 + i * 30]])} stroke="#eef4f8" strokeWidth={18 - i * 3} fill="none" opacity={0.55 * wet * k} strokeLinecap="round" filter={u("b3")} />
      ))}
      {bubbles.filter((b) => b.i < 48 * k).map((b) => {
        const pop = 1 + Math.sin(frame * 0.15 + b.ph) * 0.05;
        const R = b.r * pop * (0.5 + 0.5 * k);
        const x = b.x + Math.sin(frame * 0.07 + b.ph) * 2, y = b.y + Math.cos(frame * 0.06 + b.ph) * 2;
        return (
          <g key={b.i}>
            <circle cx={x} cy={y} r={R} fill="#ffffff" opacity={0.16} />
            <circle cx={x} cy={y} r={R} fill="none" stroke="#9fb2be" strokeWidth={1.4} opacity={0.85} />
            {b.irid && <path d={`M${x + R * 0.7} ${y - R * 0.6} A${R} ${R} 0 0 1 ${x + R * 0.5} ${y + R * 0.85}`} stroke="#d99ad0" strokeWidth={2.4} fill="none" opacity={0.45} />}
            {b.irid && <path d={`M${x - R * 0.8} ${y + R * 0.5} A${R} ${R} 0 0 0 ${x + R * 0.2} ${y + R * 0.98}`} stroke="#8fd8c0" strokeWidth={2} fill="none" opacity={0.4} />}
            <path d={`M${x - R * 0.7} ${y - R * 0.25} A${R * 0.75} ${R * 0.75} 0 0 1 ${x - R * 0.15} ${y - R * 0.72}`} stroke="#fff" strokeWidth={Math.max(1.4, R * 0.14)} fill="none" strokeLinecap="round" opacity={0.95} />
            <circle cx={x + R * 0.38} cy={y + R * 0.42} r={Math.max(1, R * 0.1)} fill="#fff" opacity={0.7} />
          </g>
        );
      })}
    </g>
  );
};

// шприц с вакциной: прозрачный цилиндр, жидкость, шкала, поршень; игла входит в предплечье
const Syringe: React.FC<{ a: number; p: string }> = ({ a, p }) => {
  const u = (s: string) => `url(#${p}${s})`;
  const E: P = [600, 1600]; // точка укола
  const ang = 125; // направление к острию (град, 0 = вправо)
  const approach = Math.min(1, a / 0.35);
  const ease = 1 - Math.pow(1 - approach, 3);
  const insert = Math.max(0, Math.min(1, (a - 0.38) / 0.17));
  const push = Math.max(0, Math.min(1, (a - 0.6) / 0.38));
  const depth = -260 * (1 - ease) + 48 * insert; // > 0 — игла под кожей
  const Ln = 150, hubL = 34, barL = 330, bw = 32;
  const hub0 = depth - Ln; // начало иглы
  const bar0 = hub0 - hubL; // носик цилиндра
  const barEnd = bar0 - barL;
  const stop = bar0 - 40 - (barL - 70) * (1 - push) * 0.9; // положение поршня
  const visTip = Math.min(depth, 0);
  return (
    <g>
      {insert > 0 && (
        <g>
          <ellipse cx={E[0] + 6} cy={E[1] + 4} rx={22} ry={13} fill={PAL.shadow} opacity={0.45 * insert} filter={u("b5")} />
          <ellipse cx={E[0] - 4} cy={E[1] - 6} rx={30} ry={16} fill={PAL.hi} opacity={0.35 * insert} filter={u("b5")} />
        </g>
      )}
      <g transform={`translate(${E[0]} ${E[1]}) rotate(${ang}) scale(1.25)`} opacity={Math.min(1, a * 5)}>
        {/* тень */}
        <rect x={barEnd} y={-bw + 26} width={barL + hubL + 30} height={bw * 2} rx={12} fill="#000" opacity={0.25} filter={u("b12")} />
        {/* игла */}
        <path d={`M${hub0} -2.6 L${visTip} -1.6 L${visTip} 1.6 L${hub0} 2.6 Z`} fill="#b9c2c8" stroke="#56616a" strokeWidth={1} />
        <path d={`M${hub0} -1 L${visTip} -0.6`} stroke="#fff" strokeWidth={1.2} opacity={0.9} />
        {depth < 0 && <path d={`M${depth - 12} -1.6 L${depth} 1.6 L${depth - 6} 1.6 Z`} fill="#e6ecef" />}
        {/* канюля */}
        <path d={`M${bar0} -15 L${hub0 - 6} -10 L${hub0} -5 L${hub0} 5 L${hub0 - 6} 10 L${bar0} 15 Z`} fill="#e4893c" opacity={0.85} stroke="#8a4a1a" strokeWidth={1.6} />
        {[0.25, 0.5, 0.75].map((t, i) => <line key={i} x1={bar0 + (hub0 - bar0) * t} y1={-13 + t * 6} x2={bar0 + (hub0 - bar0) * t} y2={13 - t * 6} stroke="#9a5420" strokeWidth={1.2} opacity={0.6} />)}
        {/* шток поршня */}
        <rect x={stop - 186} y={-7} width={186} height={14} fill="#eef3f6" opacity={0.85} stroke="#7d8a93" strokeWidth={1.4} />
        <line x1={stop - 186} y1={0} x2={stop} y2={0} stroke="#9aa6ae" strokeWidth={1.2} opacity={0.7} />
        <rect x={stop - 200} y={-30} width={14} height={60} rx={5} fill="#e9eef1" stroke="#6f7c86" strokeWidth={2} />
        {/* цилиндр: жидкость, поршень, стекло */}
        <rect x={barEnd} y={-bw} width={barL} height={bw * 2} rx={6} fill="#dfeef4" opacity={0.18} />
        <rect x={stop + 14} y={-bw + 4} width={bar0 - stop - 18} height={bw * 2 - 8} fill="#cfe9f0" opacity={0.5} />
        <rect x={stop + 14} y={-bw + 4} width={bar0 - stop - 18} height={10} fill="#ffffff" opacity={0.35} />
        <rect x={stop + 14} y={bw - 14} width={bar0 - stop - 18} height={10} fill="#5f97a8" opacity={0.25} />
        <path d={`M${stop + 16} ${-bw + 4} q-5 ${bw} 0 ${bw * 2 - 8}`} stroke="#ffffff" strokeWidth={2} fill="none" opacity={0.7} />
        <rect x={stop - 2} y={-bw + 3} width={18} height={bw * 2 - 6} rx={4} fill="#2e3338" />
        {[3, 8, 13].map((k) => <line key={k} x1={stop + k - 2} y1={-bw + 4} x2={stop + k - 2} y2={bw - 4} stroke="#555c63" strokeWidth={1.4} />)}
        {/* шкала */}
        {Array.from({ length: 21 }, (_, i) => {
          const x = bar0 - 30 - i * 13;
          const long = i % 5 === 0;
          return <line key={i} x1={x} y1={-bw} x2={x} y2={-bw + (long ? 16 : 9)} stroke="#2f3d46" strokeWidth={long ? 2 : 1.3} opacity={0.85} />;
        })}
        {[0, 1, 2, 3, 4].map((k) => (
          <text key={k} x={bar0 - 30 - k * 65} y={-bw + 28} fontSize={12} fontFamily="Arial, sans-serif" fill="#2f3d46" opacity={0.85} transform={`rotate(180 ${bar0 - 30 - k * 65} ${-bw + 24})`} textAnchor="middle">{(k * 0.25).toFixed(2).replace(/0$/, "")}</text>
        ))}
        {/* стекло: блики и края */}
        <rect x={barEnd} y={-bw} width={barL} height={bw * 2} rx={6} fill="none" stroke="#7c919c" strokeWidth={2.4} />
        <rect x={barEnd + 10} y={-bw + 5} width={barL - 20} height={5} rx={2.5} fill="#fff" opacity={0.8} />
        <rect x={barEnd + 14} y={bw - 9} width={barL - 28} height={3} rx={1.5} fill="#fff" opacity={0.4} />
        <rect x={barEnd} y={bw - 4} width={barL} height={4} fill="#3c5560" opacity={0.3} />
        {/* носик */}
        <path d={`M${bar0} ${-bw} L${bar0} ${bw} M${bar0} -16 L${bar0 + 2} -16`} stroke="#7c919c" strokeWidth={2.4} />
        {/* упор для пальцев */}
        <rect x={barEnd - 10} y={-bw - 22} width={12} height={bw * 2 + 44} rx={6} fill="#e8eef1" opacity={0.9} stroke="#6f7c86" strokeWidth={2} />
      </g>
    </g>
  );
};
