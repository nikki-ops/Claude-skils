import { Toon, circ, INK } from "./char.jsx";
import { Sky, Cloud, Sea, CapeFar, CliffNear, Terrace, StringLights, Umbrella, Table, Booth, Counter, lg } from "./bg.jsx";
import { Yacht, Radio, Waves, Searchlight, CashStack, Lemonade, Piggy, Burst, Hammer, Bill } from "./props.jsx";
export const ODDS = [[1, "ЧАЙКА", "2-1"], [2, "БРИЗ", "3-1"], [3, "ВОЛНА", "4-1"], [4, "ШТОРМ", "6-1"], [7, "КОРЫТО", "100-1"]];
// scene shell: outer = entrance (cut/fade/whip), inner = camera (scale/offset), all children full-canvas
export function Sc({ at, dur, cam = [1, 1.08, 0, 0, 0, 0], enter = "cut", bg = "#000000", children }) {
  const e = enter === "fade" ? [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.25, value: 1 }, { at: dur - 0.01, value: 1 }] }]
    : enter === "whip" ? [{ property: "offsetX", keyframes: [{ at: 0, value: 1100, easing: "ease-out" }, { at: 0.22, value: 0 }, { at: dur - 0.01, value: 0 }] }, { property: "blur", keyframes: [{ at: 0, value: 40 }, { at: 0.22, value: 0 }, { at: dur - 0.01, value: 0 }] }] : [];
  const c = [{ property: "scale", from: cam[0], to: cam[1], at: 0, duration: dur, easing: "ease-in-out" }];
  if (cam[2] !== cam[3]) c.push({ property: "offsetX", from: cam[2], to: cam[3], at: 0, duration: dur, easing: "ease-in-out" });
  if (cam[4] !== cam[5]) c.push({ property: "offsetY", from: cam[4], to: cam[5], at: 0, duration: dur, easing: "ease-in-out" });
  return (
    <frame at={at} duration={dur} width={1080} height={1920} layout="none" animate={e} background={bg}>
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" animate={c}>{children}</frame>
    </frame>
  );
}
const seaSet = (dur, y0 = 1000) => [<Sky w={1600} h={y0 + 10} />, <Cloud x={60} y={180} s={1.2} drift={60} dur={dur} />, <Cloud x={640} y={320} s={0.9} drift={50} dur={dur} />, ...Sea({ w: 1600, y0, dur }), <CapeFar x={760} y0={y0} s={0.8} />];

// 1a: smash the piggy bank (0 -> 1.95)
export function S1a({ at, dur }) {
  return <Sc at={at} dur={dur} cam={[1.0, 1.1, 0, -40, 0, 0]}>
    {seaSet(dur, 900)}
    {Terrace({ w: 1600, railY: 1080 })}
    <Toon x={-110} y={780} s={1.05} o="hero" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.4] }} arms={{ r: ["up"], l: ["hip"] }} />
    <Table x={380} y={1280} s={1.3} />
    <Piggy x={500} y={1050} s={1.0} smashAt={0.96} dur={dur} />
    <Hammer hx={360} hy={1013} s={1.3} swingAt={0.93} dur={dur} />
    {Burst({ cx: 710, cy: 1190, at: 0.96, dur, n: 60, seed: 2 })}
  </Sc>;
}
// 1b: the race at sea, slowest yacht (1.95 -> 3.95)
export function S1b({ at, dur }) {
  const sail = [0, 1, 2].map((i) => <Yacht x={200 + i * 300} y={760 + i * 40} s={0.8 - i * 0.05} n={i + 1} sail={["#FFFFFF", "#FFE9A8", "#FFD0D6"][i]} stripe={["#E0383E", "#2F6FB8", "#3FBF6A"][i]} dur={dur} anim={[{ property: "offsetX", from: 0, to: 260, at: 0, duration: dur, easing: "linear" }]} />);
  return <Sc at={at} dur={dur} enter="whip" cam={[1.05, 1.15, 0, 120, 0, 0]}>
    {seaSet(dur, 820)}
    {sail}
    <Yacht x={-160} y={1180} s={1.25} n={7} old dur={dur} anim={[{ property: "offsetX", from: 0, to: 70, at: 0, duration: dur, easing: "linear" }]} />
  </Sc>;
}
// 2: the whole terrace laughs (3.95 -> 7.0)
export function S2({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.0, 1.12, 0, -60, 0, 30]}>
    {seaSet(dur, 900)}
    {Terrace({ w: 1600, railY: 1060 })}
    {StringLights({ w: 1600, y: 90, dur })}
    <Umbrella x={-120} y={420} s={1.0} />
    <Toon x={-190} y={900} s={0.6} o="old" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin", glasses: true, stache: true }} laugh />
    <Toon x={40} y={860} s={0.64} o="skeptic" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh arms={{ r: ["down", "wave", 0.3] }} />
    <Toon x={270} y={920} s={0.58} o="red" dur={dur} face={{ eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh />
    <Toon x={500} y={880} s={0.62} o="sailor" dur={dur} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh arms={{ l: ["down", "up", 0.5] }} />
    <Toon x={700} y={1120} s={0.66} o="hero" dur={dur} sit face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.2, 2.6] }} />
  </Sc>;
}
// 3: bookie takes bets all day (7.0 -> 9.95)
export function S3({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip" cam={[1.15, 1.05, 60, -40, 120, -60]}>
    {Booth({ w: 1400, h: 1920, odds: ODDS })}
    <Toon x={480} y={760} s={0.95} o="bookie" dur={dur} face={{ eyes: "smug", brows: "smug", mouth: "talk", talk: [[0.2, 1.4], [1.8, 2.6]], blinks: [1.6] }} arms={{ r: ["down", "hold", 0.4] }} />
    {Counter({ w: 1400, y: 1430 })}
    <CashStack x={40} y={1130} s={0.8} rows={3} cols={2} dur={dur} />
    <CashStack x={620} y={1150} s={0.6} rows={2} cols={2} dur={dur} />
  </Sc>;
}
// 4a: the race runs far out to sea, past the cape (9.95 -> 12.45)
export function S4a({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.0, 2.1, 0, -700, 0, 160]}>
    {seaSet(dur, 1000)}
    <Yacht x={740} y={830} s={0.22} n={1} dur={dur} />
    <Yacht x={800} y={835} s={0.2} n={2} sail="#FFE9A8" stripe="#2F6FB8" dur={dur} />
    <Yacht x={1000} y={840} s={0.18} n={7} old dur={dur} />
  </Sc>;
}
// 4b: results by radio, minutes late (12.45 -> 14.9)
export function S4b({ at, dur }) {
  return <Sc at={at} dur={dur} enter="whip" cam={[1.0, 1.15, 0, 0, 0, -40]}>
    <rect x={0} y={0} width={1080} height={1920} fill={lg([[0, "#7A1E2E"], [1, "#4A101C"]])} />
    {Counter({ w: 1400, y: 1250 })}
    <Toon x={-200} y={480} s={0.95} o="bookie" dur={dur} face={{ eyes: "open", brows: "flat", mouth: "flat", blinks: [0.9] }} />
    <Radio x={330} y={760} s={1.2} shake dur={dur} at={0.4} />
    {Waves({ x: 760, y: 820, at: 0.5, dur })}
    <frame x={620} y={1320} width={400} height={160} layout="none">
      <rect x={0} y={0} width={400} height={150} radius={20} fill="#F6EAD0" strokeColor={INK} strokeWidth={8} />
      <text x={0} y={30} width={400} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={80} color="#B0302A">+2 МИН</text>
    </frame>
  </Sc>;
}
// 5: he sips lemonade and stares at the sea (14.9 -> 17.45)
export function S5({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.0, 1.35, 0, 140, 0, 260]}>
    {seaSet(dur, 950)}
    {Terrace({ w: 1600, railY: 1080 })}
    <Umbrella x={520} y={380} s={1.1} c1="#2F6FB8" />
    <Toon x={140} y={820} s={1.0} o="hero" dur={dur} sit face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [0.7, 2.0] }} arms={{ r: ["down", "hold", 1.0] }} />
    <Table x={420} y={1330} s={1.2} />
    <Lemonade x={620} y={1170} s={1.0} />
  </Sc>;
}
// 6: on the cape, at the very edge of the cliff: partner with an army searchlight (17.45 -> 21.55)
export function S6({ at, dur }) {
  return <Sc at={at} dur={dur} enter="fade" cam={[1.25, 1.0, -120, 0, 220, 0]}>
    <Sky w={1600} h={1100} />
    <Cloud x={100} y={150} s={1.3} drift={70} dur={dur} />
    <Cloud x={700} y={380} s={0.9} drift={60} dur={dur} />
    {Sea({ w: 1600, y0: 1050, dur })}
    {CliffNear({ w: 1400, h: 1920 })}
    <Searchlight x={480} y={500} s={0.9} dur={dur} />
    <Toon x={300} y={330} s={0.72} o="buddy" dur={dur} sit face={{ eyes: "open", brows: "flat", mouth: "smirk", blinks: [1.0, 3.0] }} arms={{ r: ["down", "hold", 2.0] }} />
  </Sc>;
}
// 7: binocular view: favourite leads, No.7 far behind (21.55 -> 26.5)
export function S7({ at, dur }) {
  const lens = "M60 960 C60 680 260 520 470 520 C560 520 610 560 640 600 C670 560 720 520 810 520 C1020 520 1220 680 1220 960 C1220 1240 1020 1400 810 1400 C720 1400 670 1360 640 1320 C610 1360 560 1400 470 1400 C260 1400 60 1240 60 960 Z";
  return <Sc at={at} dur={dur} cam={[1, 1, 0, 0, 0, 0]} bg="#0A0A12">
    <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" animate={[{ property: "scale", keyframes: [{ at: 0, value: 0.08 }, { at: 0.18, value: 1, easing: "ease-in" }, { at: dur - 0.01, value: 1 }] }]}>
      <frame name="lensM" x={-100} y={0} width={1280} height={1920} layout="none"><path d={lens} x={0} y={0} width={1280} height={1920} fill="#FFFFFF" /></frame>
      <frame x={-100} y={0} width={1280} height={1920} layout="none" matte="lensM">
        <frame x={0} y={0} width={3400} height={1920} layout="none" animate={[{ property: "offsetX", keyframes: [{ at: 0, value: 0 }, { at: 1.8, value: -150 }, { at: 2.6, value: -1700, easing: "ease-in-out" }, { at: dur - 0.01, value: -1850 }] }]}>
          <Sky w={3400} h={900} />
          {[<Cloud x={300} y={560} s={1} />, <Cloud x={1500} y={600} s={1.1} />, <Cloud x={2600} y={560} s={0.9} />]}
          {Sea({ w: 3400, y0: 880, dur })}
          <Yacht x={300} y={700} s={1.3} n={1} dur={dur} anim={[{ property: "offsetX", from: 0, to: 380, at: 0, duration: dur, easing: "linear" }]} />
          <Yacht x={0} y={760} s={1.0} n={2} sail="#FFE9A8" stripe="#2F6FB8" dur={dur} anim={[{ property: "offsetX", from: 0, to: 330, at: 0, duration: dur, easing: "linear" }]} />
          <Yacht x={2300} y={720} s={1.3} n={7} old dur={dur} anim={[{ property: "offsetX", from: 0, to: 90, at: 0, duration: dur, easing: "linear" }]} />
        </frame>
      </frame>
      <path d={lens} x={-100} y={0} width={1280} height={1920} stroke={{ width: 26, color: "#2E3A2A" }} />
    </frame>
  </Sc>;
}
