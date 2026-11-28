import { Toon, OUTFIT, INK } from "../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";
const G = { night: 0, lights: 0, table: 0, dawn: 0, sign: 1 };
export const T = 3; export const CAP_Y = 1330;
export const SHOTS = [
 { name: "A", at: 0, scene: "garden", focus: null, enter: "cut", cam: () => ({ s: 1, x: 0, y: 0 }), p: () => ({ ...G, rx: 0.6, ry: 1.4, rz: 3.2, tx: 0.0, ty: 1.2, tz: -2.6, lens: 1.0 }), mid: () => [<Toon env="out" x={60} y={700} s={0.9} o="hero" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} />] },
 { name: "B", at: 1, scene: "garden", focus: null, enter: "cut", cam: () => ({ s: 1, x: 0, y: 0 }), p: () => ({ ...G, night: 1, lights: 1, table: 1, rx: 2.4, ry: 1.7, rz: 3.6, tx: 0.0, ty: 0.9, tz: -1.4, lens: 1.0 }) },
 { name: "C", at: 2, scene: "garden", focus: null, enter: "cut", cam: () => ({ s: 1, x: 0, y: 0 }), p: () => ({ ...G, dawn: 1, rx: -2.5, ry: 0.6, rz: 4.5, tx: 0.0, ty: 1.6, tz: -3.0, lens: 1.1 }) },
];
