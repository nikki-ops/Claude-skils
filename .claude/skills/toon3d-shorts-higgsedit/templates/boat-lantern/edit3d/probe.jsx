import { Set3D } from "./rig.jsx";
const shots = [
  ["ter", { rx: 0.9, ry: 1.35, rz: 0.2, tx: 0.9, ty: 0.75, tz: -2.2, lens: 1.1 }],
  ["ter", { rx: 0.2, ry: 1.5, rz: 2.8, tx: 0.2, ty: 0.9, tz: -3.0, lens: 1.0 }],
  ["boo", { rx: 0.2, ry: 1.5, rz: 2.4, tx: 0.0, ty: 1.3, tz: -1.5, lens: 1.05, radio: 1 }],
  ["clf", { rx: 2.6, ry: 1.3, rz: 3.6, tx: 0.2, ty: 0.6, tz: 0.0, lens: 1.0 }],
];
export default async ({ project }) => {
  const p = await project({ dir: ".", size: "1080x1920", fps: 30, background: "#000" });
  p.compose(<frame width={1080} height={1920} layout="none">
    {shots.map(([s, pp], i) => <frame at={i} duration={1} width={1080} height={1920} layout="none">{Set3D({ set: s, dur: 1, p: pp })}<rect x={0} y={960} width={1080} height={2} fill="#FF00FF" /><rect x={540} y={0} width={2} height={1920} fill="#FF00FF" /></frame>)}
  </frame>, { at: 0, dur: 4 });
};
