import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on("console", (m) => console.log("console:", m.text())); p.on("pageerror", (e) => console.log("err:", e.message));
const t0 = Date.now(); await p.goto("http://localhost:8765/index.html"); await p.waitForFunction(() => window.DONE, null, { timeout: 300000 });
console.log("render ms", Date.now() - t0); await p.screenshot({ path: process.argv[2] || "out.png" }); await b.close();
