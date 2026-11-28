import { Toon, OUTFIT, INK } from "/home/user/Claude-skils/.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/char.jsx";
OUTFIT.kid = { body: "#3A5FA8", shade: "#25417A", hat: "cap" };
OUTFIT.boss = { body: "#2A2A30", shade: "#18181C", hat: "bowler", tie: "#C9302C" };
export const node = <frame x={0} y={0} width={1080} height={1920} layout="none">
  <Toon env="in" x={120} y={760} s={1.05} o="kid" dur={2} face={{ eyes: "squint", brows: "angry", mouth: "teeth" }} arms={{ r: ["point"] }} />
  <Toon env="in" x={560} y={860} s={0.9} o="boss" dur={2} flip face={{ eyes: "smug", brows: "angry", mouth: "smirk", stache: true }} arms={{ l: ["hip"], r: ["hip"] }} />
</frame>;
