import { readFileSync } from "node:fs";
import { S1a, S1b, S2, S3, S4a, S4b, S5, S6, S7 } from "./scenes1.jsx";
import { S8, S9a, S9b, S10, S11, S12, S13, S14 } from "./scenes2.jsx";
const G = JSON.parse(readFileSync(new URL("./captions.json", import.meta.url), "utf8"));
const T = 47.3;
const CUTS = [[S1a, 0], [S1b, 1.95], [S2, 3.95], [S3, 7.0], [S4a, 9.95], [S4b, 12.45], [S5, 14.9], [S6, 17.45], [S7, 21.55], [S8, 26.5], [S9a, 29.25], [S9b, 30.9], [S10, 32.1], [S11, 36.75], [S12, 39.5], [S13, 41.7], [S14, 44.35]];
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000000" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../voice_mix.wav");
  const scenes = CUTS.map(([C, a], i) => { const b = i + 1 < CUTS.length ? CUTS[i + 1][1] : T; return <C at={a} dur={+(b - a).toFixed(2)} />; });
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {scenes}
      {G.map((g) => (
        <frame at={g.at} duration={g.dur} width={1080} height={1920} layout="none">
          <text x={40} y={1300} width={1000} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={64} color="#FFFFFF" strokeColor="#111111" strokeWidth={5} shadow={{ x: 0, y: 4, blur: 8, color: "#000000AA" }}>{g.t}</text>
        </frame>
      ))}
    </frame>,
    { at: 0, dur: T }
  );
  p.cut(voice, { at: 0 });
};
