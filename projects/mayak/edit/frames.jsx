import { Toon } from "../../../toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";
const CAP = (t) => <text x={40} y={1303} width={1000} align="center" fontFamily="Montserrat" fontWeight={800} fontSize={70} color="#FFFFFF" strokeColor="#000000" strokeWidth={5} shadow={{ x: 3, y: 4, blur: 0, color: "#000000" }}>{t}</text>;
export const FRAMES = [
  { name: "L11_flash", t: 0.6,
    p: { rx: 0.3, ry: 1.25, rz: 1.6, tx: 2.6, ty: 2.1, tz: -14.0, lens: 1.05, flash: 1, lamp: 1, fogH: -0.9 }, focus: 2.2, blur: 9,
    chars: [
      <Toon env="dusk" x={560} y={930} s={1.05} o="skeptic" dur={2} face={{ eyes: "squint", brows: "angry", mouth: "flat" }} />,
      <Toon env="dusk" x={-90} y={760} s={1.55} o="hero" dur={2} face={{ eyes: "smug", brows: "smug", mouth: "smirk", glow: true }} />,
    ], cap: "раз. два." },
  { name: "L4_laugh", t: 0.25,
    p: { rx: 0.1, ry: 1.5, rz: 2.7, tx: 0.7, ty: 1.0, tz: -3.0, lens: 1.0, flash: 0, lamp: 1, fogH: -0.9 }, focus: 3.6, blur: 7,
    chars: [
      <Toon env="dusk" x={600} y={640} s={0.62} o="hero" dur={2} sit face={{ eyes: "smug", brows: "smug", mouth: "smirk" }} />,
      <Toon env="dusk" x={-230} y={880} s={0.78} o="old" dur={2} face={{ eyes: "happy", brows: "up", mouth: "grin", glasses: true, stache: true }} laugh />,
      <Toon env="dusk" x={-20} y={940} s={0.84} o="red" dur={2} face={{ eyes: "squint", brows: "up", mouth: "grin", blush: true }} laugh />,
      <Toon env="dusk" x={190} y={840} s={0.92} o="skeptic" dur={2} face={{ eyes: "happy", brows: "up", mouth: "grin" }} laugh arms={{ r: ["wave"] }} />,
    ], cap: "кабак ржал:" },
];
export { CAP };
