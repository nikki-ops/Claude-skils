import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const P = { rx: 0.0, ry: 1.4, rz: 3.5, tx: -2.0, ty: 0.9, tz: -7.0, lens: 1.1, a1: 0, a2: 0, a3: 0, a7: 0, cap: 0, storm: 0, dusk: 0 };
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000" });
  const sh = (o, at) => <frame at={at} duration={1} width={1080} height={1920} layout="none"><rect x={0} y={0} width={1080} height={1920} fill="#000" effects={[{ kind: "shader", params: { glsl: read("./lib.glsl") + read("./sea.glsl"), ...P, ...o } }]} /></frame>;
  p.compose(<frame width={1080} height={1920} layout="none">{sh({}, 0)}{sh({ storm: 1, cap: 0.7 }, 1)}{sh({ dusk: 1 }, 2)}</frame>, { at: 0, dur: 3 });
};
