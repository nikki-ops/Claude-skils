import { Toon } from "./char.jsx";
import { Set3D, Sc } from "./rig.jsx";
import { Piggy, Hammer, Burst, Lemonade, CashStack, Bill, OddsBoard, Binoculars, Waves } from "./props.jsx";
export const ODDS = [[1, "ЧАЙКА", "2-1"], [2, "БРИЗ", "3-1"], [3, "ВОЛНА", "4-1"], [7, "КОРЫТО", "100-1"]];
const TER1 = { rx: 0.9, ry: 1.3, rz: 0.75, tx: 0.9, ty: 0.85, tz: -2.2, lens: 1.1 };
const TERW = { rx: 0.2, ry: 1.5, rz: 2.8, tx: 0.2, ty: 0.9, tz: -3.0, lens: 1.0 };
const BOO = { rx: 0.2, ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05 };
// S1 smash the savings (0 - 1.48)
export function S1({ at, dur }) {
  const [bg, fg] = Set3D({ set: "ter", dur, p: TER1, focus: 3.4 });
  return <Sc at={at} dur={dur} cam={{ s: [[0, 1.0], [dur, 1.05]] }}>
    {bg}
    <Toon env="out" x={30} y={297} s={0.95} o="hero" dur={dur} faces={[{ at: 0, eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.27] }, { at: 0.45, eyes: "open", brows: "angry", mouth: "o" }, { at: 0.95, eyes: "happy", brows: "up", mouth: "grin" }]} arms={{ r: ["up"], l: ["down"] }} />
    {fg}
    <Piggy x={390} y={682} s={0.9} smashAt={0.92} dur={dur} />
    <Hammer hx={484} hy={556} s={1.25} swingAt={0.9} dur={dur} />
    {Burst({ cx: 600, cy: 860, at: 0.92, dur, n: 70, seed: 2 })}
  </Sc>;
}
// S2 the regatta, slowest yacht (1.48 - 3.42)
export function S2({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip">
    {Set3D({ set: "sea", dur, focus: 9, p: { a7: 6.6 }, keys: { rx: [[0, -2.0], [dur, 0.8]], ry: [[0, 1.3], [dur, 1.6]], rz: [[0, 4.0], [dur, 3.6]], tx: [[0, -2.5], [dur, -1.2]], ty: [[0, 0.8], [dur, 0.85]], tz: [[0, -7.0], [dur, -7.0]], a1: [[0, 0], [dur, 2.2]], a2: [[0, 0], [dur, 2.0]], a3: [[0, 0], [dur, 1.9]], a7: [[0, 6.4], [dur, 6.9]] } })}
  </Sc>;
}
// S3 the whole terrace laughs (3.42 - 6.06)
export function S3({ at, dur }) {
  const [bg, fg] = Set3D({ set: "ter", dur, p: TERW, focus: 3.6 });
  return <Sc at={at} dur={dur} enter="fade" cam={{ s: [[0, 1.0], [1.45, 1.03], [2.3, 1.42], [dur, 1.45]], x: [[0, 0], [1.45, 0], [2.3, -230], [dur, -240]], y: [[0, 0], [1.45, 0], [2.3, -60], [dur, -60]] }}>
    {bg}
    <Toon env="out" x={590} y={820} s={0.62} o="hero" dur={dur} sit face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.9, 2.2] }} />
    {fg}
    <Toon env="out" x={-230} y={880} s={0.78} o="old" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin", glasses: true, stache: true }} laugh />
    <Toon env="out" x={-20} y={940} s={0.84} o="red" dur={dur} face={{ eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh />
    <Toon env="out" x={170} y={830} s={0.92} o="skeptic" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh arms={{ r: ["down", "wave", 0.2] }} />
  </Sc>;
}
// S4 bets taken all day (6.06 - 8.70)
export function S4({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={{ s: [[0, 1.08], [dur, 1.18]], x: [[0, 120], [dur, -120]] }}>
    {Set3D({ set: "boo", dur, p: BOO, focus: 2.3, blur: 3 })[0]}
    <OddsBoard x={40} y={360} s={0.8} rows={ODDS} />
    <Toon env="in" x={420} y={620} s={0.85} o="bookie" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "talk", talk: [[0.2, 1.2], [1.6, 2.4]], blinks: [1.4] }} arms={{ r: ["down", "hold", 0.5] }} />
    {Set3D({ set: "boo", dur, p: BOO, focus: 2.3, blur: 3 })[1]}
    <CashStack x={60} y={1010} s={0.7} rows={3} cols={2} dur={dur} />
    <CashStack x={720} y={1040} s={0.55} rows={2} cols={2} dur={dur} />
    <Toon env="in" x={-260} y={980} s={0.9} o="sailor" dur={dur} face={{ eyes: "open", brows: "up", mouth: "talk", talk: [[0.3, 2.3]] }} arms={{ r: ["down", "fwd", 0.6] }} />
  </Sc>;
}
// S5 far out to sea, past the cape (8.70 - 10.80)
export function S5({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade">
    {Set3D({ set: "sea", dur, focus: 12, keys: { a1: [[0, 3.0], [dur, 6.0]], a2: [[0, 4.6], [dur, 7.4]], a3: [[0, 6.0], [dur, 8.6]], a7: [[0, 5.0], [dur, 5.6]], rx: [[0, -1.0], [dur, 0.5]], ry: [[0, 1.8], [dur, 3.2]], rz: [[0, 4.0], [dur, 2.0]], tx: [[0, 4.0], [dur, 6.0]], ty: [[0, 0.4], [dur, 0.2]], tz: [[0, -30.0], [dur, -40.0]] } })}
  </Sc>;
}
// S6 results come by radio, minutes late (10.80 - 13.10)
export function S6({ at, dur }) {
  const L = Set3D({ set: "boo", dur, p: { rx: 0.6, ry: 1.6, rz: 2.3, tx: 0.45, ty: 1.3, tz: -0.2, lens: 1.15, radio: 1 }, keys: { shake: [[0, 0], [0.5, 0], [0.55, 1], [dur, 1]] }, focus: 2.1, blur: 3 });
  return <Sc at={at} dur={dur} enter="whip" cam={{ s: [[0, 1.0], [dur, 1.12]] }}>
    {L[0]}
    <Toon env="in" x={-180} y={560} s={0.8} o="bookie" dur={dur} face={{ eyes: "open", brows: "flat", mouth: "flat", blinks: [1.3] }} arms={{ r: ["down", "hold", 0.6] }} />
    {L[1]}
    {Waves({ x: 820, y: 640, at: 0.6, dur })}
  </Sc>;
}
// S7 lemonade, staring out to sea (13.10 - 15.34)
export function S7({ at, dur }) {
  const [bg, fg] = Set3D({ set: "ter", dur, p: { rx: 1.9, ry: 1.25, rz: 0.6, tx: 0.4, ty: 0.85, tz: -3.0, lens: 1.1 }, focus: 3.2 });
  return <Sc at={at} dur={dur} enter="fade" cam={{ s: [[0, 1.0], [dur, 1.38]], x: [[0, 0], [dur, 120]], y: [[0, 0], [dur, 220]] }}>
    {bg}
    <Toon env="out" x={220} y={560} s={0.9} o="hero" dur={dur} sit face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.6, 1.8] }} arms={{ r: ["down", "hold", 0.8] }} />
    {fg}
    <Lemonade x={540} y={1010} s={1.0} />
  </Sc>;
}
export function S8a({ at, dur }) {
  return <Sc at={at} dur={dur} cam={{ s: [[0, 1.4], [dur, 3.0]], x: [[0, -300], [dur, -1250]], y: [[0, 300], [dur, 800]] }}>{Set3D({ set: "ter", dur, p: TERW })}</Sc>;
}
// S8b on the cape: partner with an army searchlight (15.95 - 18.74)
export function S8b({ at, dur }) {
  const [bg, fg] = Set3D({ set: "clf", dur, focus: 5.5, keys: { rx: [[0, 3.4], [dur, 2.4]], ry: [[0, 1.6], [dur, 1.25]], rz: [[0, 4.4], [dur, 3.4]], tx: [[0, 0.3], [dur, 0.2]], ty: [[0, 0.7], [dur, 0.6]], tz: [[0, 0.0], [dur, 0.0]] } });
  return <Sc at={at} dur={dur} enter="fade">
    {bg}
    <Toon env="out" x={470} y={700} s={0.72} o="buddy" dur={dur} sit face={{ eyes: "open", brows: "flat", mouth: "smirk", blush: true, blinks: [1.0, 2.2] }} />
    {fg}
  </Sc>;
}
