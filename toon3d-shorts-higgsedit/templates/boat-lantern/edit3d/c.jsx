import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const P = { rx: 2.6, ry: 1.3, rz: 3.6, tx: 0.2, ty: 0.6, tz: 0.0, lens: 1.0, dusk: 0, storm: 0, beam: 0, aim: 0.5 };
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000" });
  const sh = (o, at) => <frame at={at} duration={1} width={1080} height={1920} layout="none"><rect x={0} y={0} width={1080} height={1920} fill="#000" effects={[{ kind: "shader", params: { glsl: read("./lib.glsl") + read("./cliff.glsl"), ...P, ...o } }]} /></frame>;
  p.compose(<frame width={1080} height={1920} layout="none">{sh({}, 0)}{sh({ dusk: 1, beam: 1 }, 1)}</frame>, { at: 0, dur: 2 });
};
