import { readFileSync } from "node:fs";
import { S1, S2, S3, S4, S5, S6, S7, S8a, S8b } from "./shotsA.jsx";
import { S9, S10, S11, S12, S13, S14, S15, S16, S17 } from "./shotsB.jsx";
const G = JSON.parse(readFileSync(new URL("./captions.json", import.meta.url), "utf8"));
const T = 41.8;
const CUTS = [[S1, 0], [S2, 1.48], [S3, 3.42], [S4, 6.06], [S5, 8.70], [S6, 10.80], [S7, 13.10], [S8a, 15.34], [S8b, 15.95], [S9, 18.74], [S10, 23.22], [S11, 25.36], [S12, 26.86], [S13, 28.16], [S14, 32.10], [S15, 34.52], [S16, 36.56], [S17, 38.90]];
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000000" });
  await p.add("/usr/share/fonts/truetype/higgsfield/Montserrat-ExtraBold.ttf");
  const voice = await p.add("../mix.wav");
  const q = (t) => Math.round(t * 30) / 30;
  const scenes = CUTS.map(([C, a], i) => { const b = i + 1 < CUTS.length ? q(CUTS[i + 1][1]) : T; return <C at={q(a)} dur={+(b - q(a)).toFixed(4)} />; });
  p.compose(
    <frame width={1080} height={1920} layout="none">
      {scenes}
      {G.map((g) => (
        <frame at={g.at} duration={g.dur} width={1080} height={1920} layout="none">
          <text x={40} y={1303} width={1000} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={70} color="#FFFFFF" strokeColor="#000000" strokeWidth={5} shadow={{ x: 3, y: 4, blur: 0, color: "#000000" }}>{g.t}</text>
        </frame>
      ))}
    </frame>,
    { at: 0, dur: T }
  );
  p.cut(voice, { at: 0 });
};
