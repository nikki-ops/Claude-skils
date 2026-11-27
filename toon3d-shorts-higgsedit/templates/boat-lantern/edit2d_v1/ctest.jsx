import { Toon } from "./char.jsx";
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#7FC6F8" });
  p.compose(<frame width={1080} height={1920} layout="none">
    <rect x={0} y={0} width={1080} height={1920} fill={{ kind: "linear", angle: 180, stops: [{ offset: 0, color: "#5AB0F6" }, { offset: 1, color: "#B0E1FF" }] }} />
    <Toon x={-60} y={150} s={0.9} o="hero" dur={3} face={{ eyes: "smug", brows: "smug", mouth: "smirk", blinks: [1.0] }} arms={{ r: ["down", "up", 1.2] }} />
    <Toon x={520} y={150} s={0.9} o="skeptic" dur={3} face={{ eyes: "open", brows: "angry", mouth: "talk", talk: [[0.2, 2.5]] }} />
    <Toon x={-60} y={950} s={0.9} o="buddy" dur={3} face={{ eyes: "happy", brows: "up", mouth: "grin", blush: true }} laugh />
    <Toon x={520} y={950} s={0.9} o="bookie" dur={3} face={{ eyes: "shock", brows: "up", mouth: "o", sweat: true }} />
  </frame>, { at: 0, dur: 3 });
};
