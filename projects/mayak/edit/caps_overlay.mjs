// Render caption cards (1-2 words, Montserrat ExtraBold 70px, y=1303) as transparent PNGs + an ffmpeg overlay plan.
// usage: node caps_overlay.mjs words.json out_dir   -> out_dir/cap_NN.png, out_dir/caps.json [{file,at,end}]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [wp, out] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const W = JSON.parse(readFileSync(wp, "utf8"));
const GROUPS = [[0, 1], [2, 3], [4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15], [16, 17]];
const q = (t) => Math.round(t * 30) / 30, T = 5.4;
const cards = GROUPS.map((g) => ({ t: g.map((i) => W[i][0]).join(" "), at: q(Math.max(0, W[g[0]][1] - 3 / 30)) }));
cards.forEach((c, i) => { c.end = i + 1 < cards.length ? cards[i + 1].at : T; c.at = i === 0 ? 0 : c.at; });
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
const plan = [];
for (const [i, c] of cards.entries()) {
  const txt = (dx, dy, fill, stroke) => `<text x="${540 + dx}" y="${1303 + 59.5 + dy}" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="70" fill="${fill}" stroke="${stroke}" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${c.t}</text>`;
  await pg.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap"><style>body{margin:0;background:transparent}</style></head><body><svg width="1080" height="1920">${txt(3, 4, "#000", "#000")}${txt(0, 0, "#FFFFFF", "#000")}</svg></body></html>`);
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300);
  const f = `${out}/cap_${String(i).padStart(2, "0")}.png`;
  await pg.screenshot({ path: f, omitBackground: true }); plan.push({ file: f, at: c.at, end: c.end, t: c.t });
}
await b.close(); writeFileSync(`${out}/caps.json`, JSON.stringify(plan, null, 1)); console.log(plan.map((p) => `${p.at.toFixed(2)} ${p.t}`).join(" | "));
