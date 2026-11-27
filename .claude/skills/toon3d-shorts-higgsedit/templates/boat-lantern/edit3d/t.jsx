import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000" });
  p.compose(<frame width={1080} height={1920} layout="none">
    <rect x={0} y={0} width={1080} height={1920} fill="#000" effects={[{ kind: "shader", params: { glsl: read("./lib.glsl") + read("./terrace.glsl"), rx: 0.6, ry: 1.45, rz: 1.6, tx: -0.2, ty: 0.9, tz: -4.0, lens: 1.05 } }]} />
  </frame>, { at: 0, dur: 1 });
};
