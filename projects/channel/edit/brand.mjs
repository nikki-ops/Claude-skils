import { build } from "esbuild";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const S = "/tmp/claude-0/-home-user-Claude-skils/f621c769-eec0-5a82-826d-a72a98aff867/scratchpad";
const E = "/home/user/Claude-skils/projects/mayak/edit";
await build({ entryPoints: ["brand.jsx"], bundle: true, platform: "node", format: "esm", outfile: S + "/brand.mjs", jsxFactory: "__h", jsxFragment: "__F", inject: [E + "/h.mjs"], loader: { ".jsx": "jsx" } });
const B = await import(pathToFileURL(S + "/brand.mjs").href + "?" + Date.now());
const { toSVG, svgDefs } = await import(pathToFileURL(E + "/svg.mjs").href);
const font = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap">`;
const st = `.t{font-family:Montserrat,sans-serif;font-weight:900;-webkit-text-stroke:16px #1E1418;paint-order:stroke fill;text-shadow:8px 10px 0 #1E1418;white-space:nowrap}`;
const b = await chromium.launch(); const pg = await b.newPage();
// avatar 800x800
const av = toSVG(B.avatar, 0);
await pg.setViewportSize({ width: 800, height: 800 });
await pg.setContent(`<html><head>${font}<style>body{margin:0}${st}</style></head><body style="width:800px;height:800px;background:radial-gradient(circle at 50% 45%,#FFE45C 0%,#FFB13B 60%,#F2783A 100%);overflow:hidden">
<svg width="800" height="800" viewBox="0 0 800 800" style="position:absolute;left:0;top:0"><defs>${svgDefs()}</defs>${av}</svg></body></html>`);
await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400); await pg.screenshot({ path: "../out/avatar.png" });
// banner 2560x1440 (safe area 1546x423 in the centre)
const bn = toSVG(B.banner, 0);
await pg.setViewportSize({ width: 2560, height: 1440 });
await pg.setContent(`<html><head>${font}<style>body{margin:0}${st}</style></head><body style="width:2560px;height:1440px;background:linear-gradient(160deg,#FFE45C 0%,#FFB13B 45%,#F2783A 100%);overflow:hidden">
<svg width="2560" height="1440" viewBox="0 0 2560 1440" style="position:absolute;left:0;top:0"><defs>${svgDefs()}</defs>${bn}</svg>
<div class="t" style="position:absolute;left:0;right:0;top:580px;text-align:center;font-size:150px;color:#FFFFFF;transform:rotate(-2deg)">ХИТРЫЙ ПЛАН</div>
<div class="t" style="position:absolute;left:0;right:0;top:770px;text-align:center;font-size:54px;color:#1E1418;-webkit-text-stroke:0;text-shadow:none">мультики о тех, кто всех перехитрил</div>
</body></html>`);
await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(400); await pg.screenshot({ path: "../out/banner.png" });
await b.close(); console.log("ok");
