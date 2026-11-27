import { Toon, OUTFIT, INK } from "../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";
import { Alarm } from "../../budilniki/edit/shots.jsx";
OUTFIT.student = { body: "#E8B23A", shade: "#B9862A", hat: null };
OUTFIT.pajama = { body: "#9DB4E8", shade: "#6F88C0", hat: null };
const P = (d, o = {}) => <path d={d} x={0} y={0} {...o} />;
const HAIR = [P("M170 110 C190 40 260 30 300 60 C330 20 400 30 420 90 C380 70 340 80 330 100 C300 70 230 70 170 110 Z", { fill: "#4A3226", stroke: { width: 8, color: INK } })];
export const avatar = [
  <Toon env="in" x={100} y={300} s={1.4} o="student" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} hold={HAIR} />,
  <Alarm x={70} y={500} s={0.62} rot={-22} col="#E2453C" ring={1} t={0.12} />,
  <Alarm x={530} y={500} s={0.55} rot={18} col="#5ED5C6" ring={1} t={0.3} />,
];
export const banner = [
  <Alarm x={300} y={560} s={0.5} rot={-18} col="#E2453C" ring={1} t={0.1} />,
  <Alarm x={2080} y={580} s={0.5} rot={18} col="#5ED5C6" ring={1} t={0.3} />,
  <Toon env="in" x={180} y={330} s={0.55} o="student" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} arms={{ r: ["wave"] }} hold={HAIR} />,
  <Toon env="in" x={1780} y={340} s={0.53} o="pajama" dur={2} face={{ eyes: "shock", brows: "up", mouth: "o", glasses: true, stache: true }} />,
];
