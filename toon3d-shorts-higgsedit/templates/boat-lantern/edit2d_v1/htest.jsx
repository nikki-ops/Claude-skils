import { Toon } from "./char.jsx";
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FC6F8" });
  p.compose(<frame width={1080} height={1920} layout="none">
    <rect x={0} y={0} width={1080} height={1920} fill="#8CC8F0" />
    <Toon x={293} y={666} s={1.27} o="hero" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} />
  </frame>, { at: 0, dur: 2 });
};
