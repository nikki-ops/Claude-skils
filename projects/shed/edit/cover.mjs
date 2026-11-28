import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const B = "/home/user/Claude-skils/projects/shed";
const covers = [
  { img: B + "/render/nocap/f0060.png", out: B + "/publish/cover_B.png", top: "ЛУЧШИЙ РЕСТОРАН", bot: "ЛОНДОНА — САРАЙ", col: "#FFD34A" },
  { img: B + "/render/nocap/f0440.png", out: B + "/publish/cover_A.png", top: "НОГА ВМЕСТО ЕДЫ", bot: "И №1 В ЛОНДОНЕ", col: "#FF6A7A" },
];
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
for (const c of covers) {
  await pg.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap">
  <style>body{margin:0;width:1080px;height:1920px;background:url('data:image/png;base64,${readFileSync(c.img).toString("base64")}') center/cover;font-family:Montserrat,sans-serif}
  .box{position:absolute;left:30px;right:30px;top:1180px;display:flex;flex-direction:column;align-items:center;gap:18px;transform:rotate(-3deg)}
  .t{text-align:center;font-weight:900;line-height:1.05;white-space:nowrap;-webkit-text-stroke:16px #1E1418;paint-order:stroke fill;text-shadow:6px 8px 0 #1E1418}
  .a{font-size:84px;color:${c.col}}.b{font-size:70px;color:#fff}</style></head>
  <body><div class="box"><div class="t a">${c.top}</div><div class="t b">${c.bot}</div></div></body></html>`);
  await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
  await pg.screenshot({ path: c.out });
}
await b.close(); console.log("ok");
