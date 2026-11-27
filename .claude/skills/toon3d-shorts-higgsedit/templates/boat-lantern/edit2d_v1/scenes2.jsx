import { Toon, circ, INK } from "./char.jsx";
import { Sky, Cloud, Sea, CapeFar, CliffNear, Terrace, StringLights, Umbrella, Table, Booth, Counter, lg } from "./bg.jsx";
import { Yacht, Radio, Waves, Searchlight, Flash, CashStack, Bill, MoneyRain } from "./props.jsx";
import { Sc, ODDS } from "./scenes1.jsx";
// 8: everyone bets on the favourite (26.5 -> 29.25)
export function S8({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip" cam={[1.05, 1.15, 40, -40, 0, 40]}>
    {Booth({ w: 1400, h: 1920, odds: ODDS })}
    <Toon x={560} y={820} s={0.8} o="bookie" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin" }} />
    {Counter({ w: 1400, y: 1300 })}
    <Toon x={-140} y={980} s={0.85} o="skeptic" dur={dur} face={{ eyes: "open", brows: "angry", mouth: "talk", talk: [[0.1, 2.6]] }} arms={{ r: ["down", "wave", 0.2] }} hold={[]} />
    <Toon x={140} y={1040} s={0.8} o="red" dur={dur} face={{ eyes: "open", brows: "up", mouth: "talk", talk: [[0.4, 2.4]] }} arms={{ l: ["down", "up", 0.5] }} />
    <Toon x={380} y={1080} s={0.78} o="sailor" dur={dur} face={{ eyes: "smug", brows: "angry", mouth: "talk", talk: [[0.2, 2.2]] }} arms={{ r: ["down", "fwd", 0.6] }} />
    {[0, 1, 2, 3].map((i) => <frame x={0} y={0} width={1080} height={1920} layout="none" animate={[{ property: "offsetY", keyframes: [{ at: 0, value: 0, easing: "hold" }, { at: 0.3 + i * 0.4, value: 0 }, { at: 0.8 + i * 0.4, value: -330 + i * 20, easing: "ease-out" }, { at: dur - 0.01, value: -330 + i * 20 }] }, { property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: 0.3 + i * 0.4, value: 0 }, { at: 0.8 + i * 0.4, value: 380 - i * 60 }, { at: dur - 0.01, value: 380 - i * 60 }] }]}>
      <Bill x={60 + i * 150} y={1500} s={0.9} rot={-20 + i * 15} />
    </frame>)}
  </Sc>;
}
// 9a: the partner switches the searchlight on (29.25 -> 30.9)
export function S9a({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.15, 1.3, -60, -140, 80, 140]}>
    <Sky w={1600} h={1100} dusk />
    {Sea({ w: 1600, y0: 1050, dur, dark: true })}
    {CliffNear({ w: 1400, h: 1920 })}
    <Searchlight x={480} y={500} s={0.9} on={1.2} dur={dur} />
    <Toon x={300} y={330} s={0.72} o="buddy" dur={dur} sit faces={[{ at: 0, eyes: "open", brows: "angry", mouth: "flat" }, { at: 1.2, eyes: "squint", brows: "up", mouth: "grin" }]} arms={{ r: ["down", "fwd", 0.9] }} />
    <Flash x={1000} y={800} s={1.6} at={1.25} len={0.5} dur={dur} />
  </Sc>;
}
// 9b: the flash reaches the terrace, light across his eyes (30.9 -> 32.1)
export function S9b({ at, dur }) {
  return <Sc at={at} dur={dur} cam={[1.3, 1.45, 60, 80, 220, 260]}>
    {[<Sky w={1600} h={1010} />, ...Sea({ w: 1600, y0: 1000, dur }), <CapeFar x={760} y0={1000} s={0.8} />]}
    {Terrace({ w: 1600, railY: 1180 })}
    <Flash x={950} y={900} s={0.9} at={0} len={0.8} dur={dur} />
    <Toon x={120} y={760} s={1.0} o="hero" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "smirk", glow: true }} />
    <Toon x={-330} y={820} s={0.9} o="skeptic" dur={dur} face={{ eyes: "squint", brows: "angry", mouth: "flat" }} />
  </Sc>;
}
// 10: sudden squall capsizes the leaders, No.7 finishes first (32.1 -> 36.75)
export function S10({ at, dur }) {
  const cap = (d) => [{ property: "rotation", keyframes: [{ at: 0, value: 0 }, { at: 0.9 + d, value: 0 }, { at: 1.4 + d, value: 88, easing: "ease-out" }, { at: dur - 0.01, value: 92 }] }];
  const gust = [];
  for (let i = 0; i < 7; i++) gust.push(<path d={`M0 ${40 + i * 50} Q150 ${10 + i * 50} 300 ${40 + i * 50} Q450 ${70 + i * 50} 600 ${40 + i * 50}`} x={-600} y={700 + i * 20} width={700} height={500} stroke={{ width: 8, color: "#FFFFFF", cap: "round" }}
    animate={[{ property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: 0.6 + i * 0.05, value: 0 }, { at: 1.6 + i * 0.05, value: 2400 }, { at: dur - 0.01, value: 2400 }] }, { property: "opacity", keyframes: [{ at: 0, value: 0.8 }, { at: dur - 0.01, value: 0.8 }] }]} />);
  return <Sc at={at} dur={dur} enter="whip" cam={[1.0, 1.1, 0, 0, 0, 0]}>
    <frame x={0} y={0} width={2600} height={1920} layout="none" animate={[{ property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: 2.0, value: -80 }, { at: 3.0, value: -1300, easing: "ease-in-out" }, { at: dur - 0.01, value: -1440 }] }]}>
      <rect x={0} y={0} width={2600} height={900} fill={lg([[0, "#3B4A6E"], [1, "#8A9AB8"]])} />
      <Cloud x={100} y={150} s={2.2} drift={500} dur={dur} />
      <Cloud x={900} y={100} s={1.8} drift={400} dur={dur} />
      {Sea({ w: 2600, y0: 880, dur, dark: true })}
      <Yacht x={250} y={760} s={1.1} n={1} dur={dur} anim={cap(0)} />
      <Yacht x={620} y={800} s={1.0} n={2} sail="#FFE9A8" stripe="#2F6FB8" dur={dur} anim={cap(0.15)} />
      <Yacht x={980} y={780} s={0.95} n={3} sail="#FFD0D6" stripe="#3FBF6A" dur={dur} anim={cap(0.3)} />
      {[0, 1, 2, 3, 4, 5].map((i) => <frame x={1900 + i * 40} y={700 + i * 60} width={60} height={200} layout="none"><rect x={26} y={0} width={8} height={160} fill="#3A3A3A" /><rect x={34} y={0} width={60} height={40} fill={i % 2 ? "#FFFFFF" : "#1A1A1A"} strokeColor={INK} strokeWidth={4} /></frame>)}
      <Yacht x={1500} y={900} s={1.2} n={7} old dur={dur} anim={[{ property: "offsetX", keyframes: [{ at: 0, value: -300 }, { at: dur - 0.01, value: 700 }], easing: "linear" }]} />
    </frame>
    {gust}
  </Sc>;
}
// 11: he pushes the whole stack on No.7 (36.75 -> 39.5)
export function S11({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip" cam={[1.0, 1.12, 0, -60, 0, 40]}>
    {Booth({ w: 1400, h: 1920, odds: ODDS })}
    <Toon x={560} y={820} s={0.85} o="bookie" dur={dur} face={{ eyes: "open", brows: "up", mouth: "o", blinks: [1.8] }} />
    {Counter({ w: 1400, y: 1330 })}
    <Toon x={-120} y={900} s={0.95} o="hero" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [2.2] }} arms={{ r: ["down", "fwd", 0.4] }} />
    <CashStack x={160} y={1060} s={0.85} rows={5} cols={3} dur={dur} anim={[{ property: "offsetX", keyframes: [{ at: 0, value: -60 }, { at: 0.5, value: -60 }, { at: 1.5, value: 360, easing: "ease-out" }, { at: dur - 0.01, value: 360 }] }]} />
  </Sc>;
}
// 12: the bookie smirks and accepts (39.5 -> 41.7)
export function S12({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.3, 1.45, -80, -120, 200, 260]}>
    {Booth({ w: 1400, h: 1920, odds: ODDS })}
    <Toon x={240} y={700} s={1.0} o="bookie" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "talk", talk: [[0.4, 1.3]], blinks: [1.6] }} arms={{ r: ["down", "hold", 0.6] }}
      hold={[<frame x={360} y={40} width={220} height={110} layout="none"><rect x={0} y={0} width={220} height={110} radius={8} fill="#9FD88A" strokeColor="#2E6A3A" strokeWidth={6} /></frame>]} />
    {Counter({ w: 1400, y: 1420 })}
    <CashStack x={300} y={1150} s={0.8} rows={5} cols={3} dur={dur} />
  </Sc>;
}
// 13: half a minute later the radio crackles the result (41.7 -> 44.35)
export function S13({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip" cam={[1.0, 1.2, 0, 0, 0, -60]}>
    {Booth({ w: 1400, h: 1920, odds: [[7, "КОРЫТО", "100-1"]], winner: true })}
    {Counter({ w: 1400, y: 1250 })}
    <Radio x={290} y={800} s={1.25} shake dur={dur} at={0.6} />
    {Waves({ x: 730, y: 860, at: 0.7, dur })}
    {Waves({ x: 60, y: 860, at: 0.9, dur })}
  </Sc>;
}
// 14: the smirk slides off his face; money rains (44.35 -> end)
export function S14({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.15, 1.4, 0, 0, 120, 220]}>
    {Booth({ w: 1400, h: 1920, odds: [[7, "КОРЫТО", "100-1"]], winner: true })}
    <Toon x={240} y={620} s={1.05} o="bookie" dur={dur} faces={[{ at: 0, eyes: "smug", brows: "smug", mouth: "smirk" }, { at: 1.2, eyes: "open", brows: "flat", mouth: "flat" }, { at: 1.5, eyes: "shock", brows: "up", mouth: "o", sweat: true }]} />
    {Counter({ w: 1400, y: 1400 })}
    <Toon x={-260} y={1000} s={0.8} o="hero" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} arms={{ r: ["down", "up", 1.6] }} />
    {MoneyRain({ t0: 1.6, dur, n: 28, seed: 5 })}
  </Sc>;
}
