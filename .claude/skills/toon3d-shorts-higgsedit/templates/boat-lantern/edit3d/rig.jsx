import { readFileSync } from "node:fs";
const read = (f) => readFileSync(new URL(f, import.meta.url), "utf8");
const LIB = read("./lib.glsl");
export const GL = { ter: LIB + read("./terrace.glsl"), boo: LIB + read("./booth.glsl"), sea: LIB + read("./sea.glsl"), clf: LIB + read("./cliff.glsl") };
export const DEF = {
  ter: { rx: 0.6, ry: 1.45, rz: 1.6, tx: -0.2, ty: 0.9, tz: -4.0, lens: 1.05 },
  boo: { rx: 0.35, ry: 1.45, rz: 2.2, tx: -0.2, ty: 1.25, tz: -1.5, lens: 1.05, lamp: 1, radio: 0, shake: 0 },
  sea: { rx: 0.0, ry: 1.4, rz: 3.5, tx: -2.0, ty: 0.9, tz: -7.0, lens: 1.1, a1: 0, a2: 0, a3: 0, a7: 0, cap: 0, storm: 0, dusk: 0, fin: -99 },
  clf: { rx: 2.6, ry: 1.3, rz: 3.6, tx: 0.2, ty: 0.6, tz: 0.0, lens: 1.0, dusk: 0, storm: 0, beam: 0, aim: 0.5 },
};
const eps = (kf, end) => kf.map(([t, v]) => ({ at: Math.min(t, end), value: v })).filter((k, i, a) => i === 0 || k.at > a[i - 1].at + 0.001);
// one 3D set; keys: {param: [[t,v],...]}; focus: DOF focus distance (null = single sharp layer)
export function Set3D({ set, dur, p = {}, keys = {}, focus = null, blur = 7 }) {
  const end = Math.max(0.05, dur - 0.02);
  const base = { glsl: GL[set], ...DEF[set], ...p, layer: 0, focus: 1000 };
  const anim = Object.entries(keys).map(([k, kf]) => { base[k] = kf[0][1]; return { property: "effectParam", effectIndex: 0, effectParam: k, keyframes: eps(kf, end) }; });
  if (focus == null) return [<rect x={0} y={0} width={1080} height={1920} fill="#000" effects={[{ kind: "shader", params: base }]} animate={anim} />];
  return [
    <frame x={0} y={0} width={540} height={960} layout="none" origin="top-left" animate={[{ property: "scale", from: 2, to: 2, at: 0, duration: 0.02 }]}>
      <rect x={-8} y={-8} width={556} height={976} fill="#000" effects={[{ kind: "shader", params: { ...base, layer: 1 } }, { kind: "blur", params: { px: blur / 2 } }]} animate={anim} />
    </frame>,
    <rect x={0} y={0} width={1080} height={1920} fill="#00000000" effects={[{ kind: "shader", params: { ...base, layer: 2, focus } }]} animate={anim} />,
  ];
}
// scene shell: entrance + 2D camera (keyframed scale / x / y)
export function Sc({ at, dur, enter = "cut", cam = {}, bg = "#000000", children }) {
  const end = dur - 0.01;
  const e = enter === "fade" ? [{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.29, value: 1 }, { at: end, value: 1 }] }]
    : enter === "whip" ? [{ property: "scale", keyframes: [{ at: 0, value: 1.18, easing: "ease-out" }, { at: 0.22, value: 1.0 }, { at: end, value: 1.0 }] }, { property: "blur", keyframes: [{ at: 0, value: 55, easing: "ease-out" }, { at: 0.22, value: 0 }, { at: end, value: 0 }] }] : [];
  const c = [];
  const mk = (prop, kf, def) => { if (!kf) return; c.push({ property: prop, keyframes: eps(kf, end).map((k) => ({ ...k, easing: "ease-in-out" })) }); };
  mk("scale", cam.s); mk("offsetX", cam.x); mk("offsetY", cam.y); mk("rotation", cam.r);
  return (
    <frame at={at} duration={dur} width={1080} height={1920} layout="none" origin="center" animate={e} background={bg}>
      <frame x={0} y={0} width={1080} height={1920} layout="none" origin="center" animate={c}>{children}</frame>
    </frame>
  );
}
