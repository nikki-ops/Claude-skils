import { Toon, circ } from "./char.jsx";
import { Set3D, Sc } from "./rig.jsx";
import { Flash, CashStack, Bill, OddsBoard, Binoculars, Waves, MoneyRain } from "./props.jsx";
import { ODDS } from "./shotsA.jsx";
const BOO = { rx: 0.2, ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05 };
const TERW = { rx: 0.2, ry: 1.5, rz: 2.8, tx: 0.2, ty: 0.9, tz: -3.0, lens: 1.0 };
// S9 binocular iris into the race (18.74 - 23.22)
export function S9({ at, dur }) {
  const iin = 0.22, iout = dur - 0.24, cx = 790, cy = 860;
  const [bg, fg] = Set3D({ set: "clf", dur, p: { rx: 2.4, ry: 1.25, rz: 3.4, tx: 0.2, ty: 0.6, tz: 0.0 }, focus: 5.5 });
  const lens = circ(540, 960, 520, 520);
  const sc = [{ property: "scale", keyframes: [{ at: 0, value: 0.1 }, { at: iin, value: 1, easing: "ease-out" }, { at: iout, value: 1, easing: "ease-in" }, { at: dur - 0.01, value: 0.08 }] },
    { property: "offsetX", keyframes: [{ at: 0, value: cx - 540 }, { at: iin, value: 0 }, { at: iout, value: 0 }, { at: dur - 0.01, value: cx - 540 }] },
    { property: "offsetY", keyframes: [{ at: 0, value: cy - 960 }, { at: iin, value: 0 }, { at: iout, value: 0 }, { at: dur - 0.01, value: cy - 960 }] }];
  const dim = [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: iin, value: 1 }, { at: iout, value: 1 }, { at: dur - 0.01, value: 0 }] }];
  return <Sc at={at} dur={dur}>
    {bg}
    <Toon env="out" x={470} y={700} s={0.72} o="buddy" dur={dur} sit face={{ eyes: "open", brows: "flat", mouth: "smirk", blush: true }} arms={{ r: ["down", "up", 0.0] }} />
    {fg}
    <Binoculars x={660} y={790} s={0.8} />
    <rect x={0} y={0} width={1080} height={1920} fill="#110B19" animate={dim} />
    <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" animate={sc}>
      <frame name="lensM" x={0} y={0} width={1080} height={1920} layout="none"><path d={lens} x={0} y={0} width={1080} height={1920} fill="#FFFFFF" /></frame>
      <frame x={0} y={0} width={1080} height={1920} layout="none" matte="lensM">
        {Set3D({ set: "sea", dur, p: { lens: 1.9 }, keys: { rx: [[0, -1.0], [1.4, 0.4], [2.2, -5.5], [dur, -6.0]], ry: [[0, 1.3], [dur, 1.3]], rz: [[0, 4.0], [dur, 4.0]], tx: [[0, -1.0], [1.4, 0.4], [2.2, -5.4], [dur, -5.9]], ty: [[0, 0.9], [dur, 0.9]], tz: [[0, -6.0], [1.4, -6.0], [2.2, -4.5], [dur, -4.5]], a1: [[0, 0.2], [dur, 2.2]], a2: [[0, 0.0], [dur, 1.8]], a3: [[0, 0.0], [dur, 1.6]], a7: [[0, 3.3], [dur, 3.6]] } })}
      </frame>
      <path d={lens} x={0} y={0} width={1080} height={1920} stroke={{ width: 14, color: "#C8B060" }} />
      <path d={circ(540, 960, 530, 530)} x={0} y={0} width={1080} height={1920} stroke={{ width: 8, color: "#3D1C23" }} />
    </frame>
  </Sc>;
}
// S10 the whole terrace bets on the favourite (23.22 - 25.36)
export function S10({ at, dur }) {
  const L = Set3D({ set: "boo", dur, p: BOO, focus: 2.3, blur: 3 });
  return <Sc at={at} dur={dur} enter="fade" cam={{ s: [[0, 1.1], [dur, 1.2]], x: [[0, 40], [dur, -40]] }}>
    {L[0]}
    <OddsBoard x={40} y={360} s={0.8} rows={ODDS} hi={0} />
    <Toon env="in" x={420} y={600} s={0.8} o="bookie" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin" }} />
    {L[1]}
    <Toon env="in" x={-200} y={900} s={0.9} o="skeptic" dur={dur} face={{ eyes: "open", brows: "angry", mouth: "talk", talk: [[0.1, 2.0]] }} arms={{ r: ["down", "wave", 0.2] }} />
    <Toon env="in" x={110} y={980} s={0.85} o="red" dur={dur} face={{ eyes: "open", brows: "up", mouth: "talk", talk: [[0.3, 1.9]] }} arms={{ l: ["down", "up", 0.4] }} />
    <Toon env="in" x={420} y={1040} s={0.8} o="old" dur={dur} face={{ eyes: "smug", brows: "angry", mouth: "talk", talk: [[0.2, 1.8]], glasses: true, stache: true }} arms={{ r: ["down", "fwd", 0.5] }} />
    {[0, 1, 2, 3, 4].map((i) => <frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "offsetY", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 0.25 + i * 0.3, value: 0 }, { at: 0.65 + i * 0.3, value: -420 + i * 25, easing: "ease-out" }, { at: dur - 0.01, value: -420 + i * 25 }] }, { property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: 0.25 + i * 0.3, value: 0 }, { at: 0.65 + i * 0.3, value: 330 - i * 50 }, { at: dur - 0.01, value: 330 - i * 50 }] }]}>
      <Bill x={60 + i * 140} y={1560} s={0.8} rot={-25 + i * 14} />
    </frame>)}
  </Sc>;
}
// S11 partner switches the searchlight on (25.36 - 26.86)
export function S11({ at, dur }) {
  const [bg, fg] = Set3D({ set: "clf", dur, focus: 5.5, p: { aim: 0.5 }, keys: { beam: [[0, 0], [1.42, 0], [1.5, 1]], rx: [[0, 1.9], [dur, 1.6]], ry: [[0, 1.2], [dur, 1.15]], rz: [[0, 3.0], [dur, 2.7]], tx: [[0, 0.5], [dur, 0.5]], ty: [[0, 0.9], [dur, 0.9]], tz: [[0, 0.0], [dur, 0.0]] } });
  return <Sc at={at} dur={dur} enter="whip">
    {bg}
    <Toon env="out" x={660} y={640} s={0.85} o="buddy" dur={dur} faces={[{ at: 0, eyes: "open", brows: "angry", mouth: "flat" }, { at: 1.42, eyes: "squint", brows: "up", mouth: "grin", blush: true }]} arms={{ r: ["down", "fwd", 0.9] }} />
    {fg}
    <Flash x={760} y={760} s={1.3} at={1.42} len={0.6} dur={dur} />
  </Sc>;
}
// S12 the flash reaches the terrace (26.86 - 28.16)
export function S12({ at, dur }) {
  const [bg, fg] = Set3D({ set: "ter", dur, p: { rx: 0.0, ry: 1.3, rz: 1.0, tx: 0.6, ty: 1.15, tz: -6.0, lens: 1.2 }, focus: 2.5 });
  return <Sc at={at} dur={dur} cam={{ s: [[0, 1.0], [dur, 1.08]] }}>
    {bg}
    <Flash x={890} y={830} s={0.9} at={0.0} len={1.0} dur={dur} />
    {fg}
    <Toon env="out" x={130} y={560} s={1.15} o="hero" dur={dur} faces={[{ at: 0, eyes: "happy", brows: "up", mouth: "smirk" }, { at: 0.12, eyes: "smug", brows: "smug", mouth: "smirk", glow: true }]} />
    <Toon env="out" x={-420} y={700} s={1.0} o="skeptic" dur={dur} faces={[{ at: 0, eyes: "happy", brows: "up", mouth: "grin" }, { at: 0.2, eyes: "squint", brows: "angry", mouth: "flat" }]} />
  </Sc>;
}
// S13 squall capsizes the leaders, No.7 wins (28.16 - 32.10)
export function S13({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip">
    {Set3D({ set: "sea", dur, focus: 14, p: { storm: 1, fin: 0.0 }, keys: { cap: [[0, 0], [0.8, 0], [1.5, 1]], a1: [[0, 0.0], [dur, 0.6]], a2: [[0, 0.0], [dur, 0.5]], a3: [[0, 0.0], [dur, 0.4]], a7: [[0, 4.5], [2.4, 7.6], [3.3, 9.2], [dur, 10.0]],
      rx: [[0, -2.0], [2.0, -2.2], [3.0, -1.0], [dur, 0.2]], ry: [[0, 1.6], [dur, 1.4]], rz: [[0, 4.2], [2.0, 4.0], [dur, 2.0]], tx: [[0, -3.0], [2.0, -3.2], [3.0, -1.6], [dur, 0.0]], ty: [[0, 0.8], [dur, 0.9]], tz: [[0, -8.0], [2.0, -8.0], [3.0, -5.0], [dur, -5.0]] } })}
  </Sc>;
}
// S14 he pushes the whole stack on No.7 (32.10 - 34.52)
export function S14({ at, dur }) {
  const L = Set3D({ set: "boo", dur, p: BOO, focus: 2.3, blur: 3 });
  return <Sc at={at} dur={dur} enter="whip" cam={{ s: [[0, 1.05], [dur, 1.15]], x: [[0, 60], [dur, -40]] }}>
    {L[0]}
    <OddsBoard x={40} y={360} s={0.8} rows={ODDS} hi={3} />
    <Toon env="in" x={480} y={620} s={0.82} o="bookie" dur={dur} face={{ eyes: "open", brows: "up", mouth: "o", blinks: [1.9] }} />
    {L[1]}
    <Toon env="in" x={-160} y={760} s={1.0} o="hero" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [2.0] }} arms={{ r: ["down", "fwd", 0.35] }} />
    <CashStack x={150} y={1150} s={0.8} rows={4} cols={3} dur={dur} anim={[{ property: "offsetX", keyframes: [{ at: 0, value: -60 }, { at: 0.45, value: -60 }, { at: 1.3, value: 260, easing: "ease-out" }, { at: dur - 0.01, value: 260 }] }]} />
  </Sc>;
}
// S15 bookie smirks and accepts (34.52 - 36.56)
export function S15({ at, dur }) {
  const L = Set3D({ set: "boo", dur, p: { rx: -0.2, ry: 1.45, rz: 1.6, tx: 0.2, ty: 1.35, tz: -1.5, lens: 1.1 }, focus: 1.4, blur: 3 });
  return <Sc at={at} dur={dur} enter="fade" cam={{ s: [[0, 1.25], [dur, 1.33]], y: [[0, 160], [dur, 190]] }}>
    {L[0]}
    <Toon env="in" x={250} y={560} s={1.0} o="bookie" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "talk", talk: [[0.5, 1.4]], blinks: [1.6] }} arms={{ r: ["down", "hold", 0.6] }}
      hold={[<frame x={340} y={40} width={200} height={100} layout="none" animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 1.0, value: 1 }, { at: dur - 0.01, value: 1 }] }]}><rect x={0} y={0} width={200} height={100} radius={8} fill="#9CC79A" strokeColor="#1E3A2A" strokeWidth={6} /></frame>]} />
    {L[1]}
    <CashStack x={300} y={1080} s={0.85} rows={5} cols={3} dur={dur} />
  </Sc>;
}
// S16 radio crackles the result (36.56 - 38.90)
export function S16({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip" cam={{ s: [[0, 1.0], [dur, 1.18]] }}>
    {Set3D({ set: "boo", dur, p: { rx: 0.7, ry: 1.6, rz: 2.0, tx: 0.5, ty: 1.35, tz: -0.2, lens: 1.1, radio: 1 }, keys: { shake: [[0, 0], [0.5, 0], [0.55, 1], [dur, 1]] } })}
    {Waves({ x: 780, y: 620, at: 0.6, dur })}
    {Waves({ x: 200, y: 620, at: 0.8, dur })}
  </Sc>;
}
// S17 the smirk slides off; money avalanche (38.90 - end)
export function S17({ at, dur }) {
  const L = Set3D({ set: "boo", dur, p: { rx: 0.0, ry: 1.45, rz: 2.0, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05 }, focus: 1.8, blur: 3 });
  return <Sc at={at} dur={dur} enter="fade" cam={{ s: [[0, 1.15], [dur, 1.3]], y: [[0, 100], [dur, 160]] }}>
    {L[0]}
    <OddsBoard x={40} y={360} s={0.8} rows={[[7, "КОРЫТО", "100-1"]]} title="ПОБЕДИТЕЛЬ" hi={0} />
    <Toon env="in" x={330} y={520} s={0.95} o="bookie" dur={dur} faces={[{ at: 0, eyes: "smug", brows: "smug", mouth: "smirk" }, { at: 0.75, eyes: "open", brows: "flat", mouth: "flat" }, { at: 1.3, eyes: "shock", brows: "up", mouth: "o", sweat: true }]} />
    {L[1]}
    <Toon env="in" x={-110} y={860} s={0.85} o="hero" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [2.5] }} arms={{ r: ["down", "up", 1.5] }} />
    {MoneyRain({ t0: 1.45, dur, n: 46, seed: 5, cx: 190, spread: 360 })}
    <CashStack x={-10} y={1260} s={0.9} rows={5} cols={3} dur={dur} anim={[{ property: "opacity", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 1.75, value: 1 }, { at: dur - 0.01, value: 1 }] }, { property: "offsetY", keyframes: [{ at: 0, value: 200 }, { at: 1.75, value: 200 }, { at: 2.6, value: 0, easing: "ease-out" }, { at: dur - 0.01, value: 0 }] }]} />
  </Sc>;
}
