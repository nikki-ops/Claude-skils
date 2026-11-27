// Frame-by-frame renderer for shots.jsx: WebGL (SwiftShader) for the 3D sets, SVG for the 2D cards.
// usage: SCR=<scratch dir> NODE_PATH=<global node_modules> node anim.mjs [from_frame to_frame]
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { resolve, dirname, join } from "node:path";
// defaults let a plain `node anim.mjs` render the full film from projects/mayak/edit
if (!process.env.SHOTS) { process.env.SHOTS = "shots_full.jsx"; process.env.WORDS = process.env.WORDS || resolve("../audio/words.json"); }
process.env.SCR = resolve(process.env.SCR || "../render");
import { h } from "./h.mjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const S = process.env.SCR, FPS = 30;
// supersampling: canvases at SS x resolution, shown at 1080x1920 (anti-aliasing of thin masts/ropes). Default 2 on GPU, 1 on CPU.
const SS = Number(process.env.SS || (process.env.GPU ? 2 : 1));
const SHOTS_SRC = process.env.SHOTS || "shots.jsx";
await build({ entryPoints: [SHOTS_SRC], bundle: true, platform: "node", format: "esm", outfile: S + "/shots.mjs", jsxFactory: "__h", jsxFragment: "__F", inject: ["h.mjs"], loader: { ".jsx": "jsx" } });
const MOD = await import(pathToFileURL(S + "/shots.mjs").href + "?" + Date.now());
const { SHOTS, T } = MOD;
const Cap = (s) => h("text", { x: 40, y: MOD.CAP_Y ?? 1303, width: 1000, align: "center", fontFamily: "Montserrat", fontWeight: 800, fontSize: 70, color: "#FFFFFF", strokeColor: "#000000", strokeWidth: 5, shadow: { x: 3, y: 4, blur: 0, color: "#000000" } }, s);
let CAPS = MOD.CAPS || [];
if (process.env.WORDS) {            // 1-2 word cards, break at punctuation, 3 frames before the word
  const W = JSON.parse(readFileSync(process.env.WORDS, "utf8")); CAPS = []; let cur = [];
  for (const w of W) { cur.push(w); if (cur.length >= 2 || /[.,!?:;…»—]$/.test(w[0])) { CAPS.push(cur); cur = []; } }
  if (cur.length) CAPS.push(cur);
  CAPS = CAPS.map((c) => [Math.max(0, Math.round((c[0][1] - 0.1) * 30) / 30), c.map((x) => x[0]).join(" ")]);
}
const { toSVG, svgDefs, resetDefs } = await import("./svg.mjs?" + Date.now());
const TPL = "../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/";
const LIB = readFileSync(TPL + "lib.glsl", "utf8");
// scenes: <name>.glsl next to the shots file, then here (mayak/edit), then the template; "booth" = mayak tavern
const SHOT_DIR = dirname(resolve(SHOTS_SRC));
const SCN = new Proxy({}, { get: (c, name) => { if (!(name in c)) { const f = name === "booth" ? "tavern" : name;
  const cands = [join(SHOT_DIR, f + ".glsl"), resolve(f + ".glsl"), resolve(TPL + f + ".glsl")]; const hit = cands.find((x) => existsSync(x));
  if (!hit) throw new Error("scene not found: " + name); c[name] = readFileSync(hit, "utf8"); } return c[name]; } });
mkdirSync(S + "/" + (process.env.OUT || "frames"), { recursive: true });



// On Windows use the installed Microsoft Edge (Chromium) unless CHANNEL says otherwise: no Playwright browser download needed.
const CHANNEL = process.env.CHANNEL ?? (process.platform === "win32" ? "msedge" : "");
const launchOpts = process.env.GPU ? { args: ["--ignore-gpu-blocklist", "--enable-gpu"] } : { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] };
if (CHANNEL) launchOpts.channel = CHANNEL;
const browser = await chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const shell = `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap">
<style>body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}#cam{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 960px}
canvas,svg{position:absolute;left:0;top:0}#cap{position:absolute;left:0;top:0}</style></head><body>
<div id="cam"><canvas id="bg" width="${540 * SS}" height="${960 * SS}" style="width:1080px;height:1920px"></canvas><div id="mid"></div><canvas id="fg" width="${1080 * SS}" height="${1920 * SS}" style="width:1080px;height:1920px"></canvas><div id="top"></div></div><div id="iris"></div><div id="cap"></div>
<script>
const progs={};
function prog(id,key,fs){ const c=document.getElementById(id); const gl=c.getContext('webgl',{premultipliedAlpha:true,preserveDrawingBuffer:true,alpha:true});
  const k=id+key; if(progs[k]) return [gl,progs[k],c];
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
  const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  progs[k]=pr; return [gl,pr,c]; }
window.draw=(id,key,fs,P,time)=>{ const [gl,pr,c]=prog(id,key,fs); gl.useProgram(pr); const l=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
  gl.viewport(0,0,c.width,c.height); gl.uniform2f(gl.getUniformLocation(pr,'u_resolution'),c.width,c.height); gl.uniform1f(gl.getUniformLocation(pr,'u_time'),time);
  for(const k in P){const u=gl.getUniformLocation(pr,'u_'+k);if(u)gl.uniform1f(u,P[k]);}
  gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.SCISSOR_TEST);
  for(let y=0;y<c.height;y+=96){gl.scissor(0,y,c.width,96);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);} gl.finish(); };
window.clear=(id)=>{ const c=document.getElementById(id); const gl=c.getContext('webgl'); if(gl){gl.disable(gl.SCISSOR_TEST);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);} };
</script></body></html>`;
writeFileSync(S + "/anim.html", shell);
await page.goto(pathToFileURL(S + "/anim.html").href);
await page.waitForTimeout(1500);

const fragFor = (scene, P) => {
  const uni = Object.keys(P).map((k) => `uniform float u_${k};`).join("\n");
  return `precision highp float;\nuniform vec2 u_resolution;\nuniform float u_time;\n${uni}\n${LIB}\n${SCN[scene]}\nvoid main(){ vec2 uv=vec2(gl_FragCoord.x/u_resolution.x,1.0-gl_FragCoord.y/u_resolution.y); gl_FragColor=pixel(uv); }`;
};
const svgWrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>${svgDefs()}</defs>${inner}</svg>`;
const t0 = Date.now();
const LIST = process.argv[2] === "list" ? process.argv.slice(3).map(Number) : null;
const [f0, f1] = [Number(process.argv[2] ?? 0), Number(process.argv[3] ?? Math.round(T * FPS) - 1)];
for (const f of LIST ?? Array.from({ length: f1 - f0 + 1 }, (_, i) => f0 + i)) {
  const T_ = f / FPS; resetDefs();
  const sh = SHOTS.filter((s) => T_ >= s.at - 1e-6).pop();
  const t = T_ - sh.at;
  const P = { ...sh.p(t), layer: 1, focus: 1000 };
  const frag = fragFor(sh.scene, P);
  const cap = process.env.NOCAP ? null : CAPS.filter((c) => T_ >= c[0] - 1e-6).pop();
  const cam = sh.cam(t);
  let s = cam.s, blur = 0;
  let op = 1; if (sh.enter === "fade" && t < 0.27) op = 0.35 + 0.65 * t / 0.27;
  if (sh.enter === "whip" && t < 0.22) { const u = t / 0.22; s *= 1.18 - 0.18 * (1 - (1 - u) * (1 - u)); blur = 55 * (1 - u) * (1 - u); }
  const ir = sh.iris ? sh.iris(t) : null;
  await page.evaluate(({ frag, P, sh, t, T_, mid, top, cap, s, cx, cy, blur, ir, op }) => {
    if (sh.focus == null) { window.draw('bg', sh.name, frag, { ...P, layer: 0 }, T_); window.clear('fg'); document.getElementById('bg').style.filter = 'none'; }
    else { window.draw('bg', sh.name, frag, P, T_); window.draw('fg', sh.name, frag, { ...P, layer: 2, focus: sh.focus }, T_); document.getElementById('bg').style.filter = 'blur(' + sh.blur / 2 + 'px)'; }
    document.getElementById('mid').innerHTML = mid; document.getElementById('top').innerHTML = top; document.getElementById('cap').innerHTML = cap;
    const c = document.getElementById('cam'); const I = document.getElementById('iris');
    if (ir && ir.r < 1500) { const r = ir.r, cy0 = ir.cy || 860; const circ = (x) => `M${x - r} ${cy0} A${r} ${r} 0 1 0 ${x + r} ${cy0} A${r} ${r} 0 1 0 ${x - r} ${cy0} Z`;
      const d = ir.two ? circ(540 - r * 0.62) + ' ' + circ(540 + r * 0.62) : circ(540);
      c.style.clipPath = `path('${d}')`; document.body.style.background = '#110b19';
      I.innerHTML = `<svg width="1080" height="1920" style="position:absolute;left:0;top:0"><path d="${d}" fill="none" stroke="#B8902F" stroke-width="14"/><path d="${d}" fill="none" stroke="#1E1418" stroke-width="5"/></svg>`; }
    else { c.style.clipPath = 'none'; I.innerHTML = ''; document.body.style.background = '#000'; } c.style.transform = 'translate(' + cx + 'px,' + cy + 'px) scale(' + s + ')'; c.style.filter = blur > 0.5 ? 'blur(' + blur / 2 + 'px)' : 'none'; c.style.opacity = op;
  }, { ir, frag, P, sh: { name: sh.name, focus: sh.focus, blur: sh.blur }, t, T_, mid: svgWrap(toSVG(sh.mid ? sh.mid(t) : [], t)), top: svgWrap(toSVG(sh.top ? sh.top(t) : [], t)), cap: svgWrap(cap ? toSVG(Cap(cap[1]), 0) : ""), s, cx: cam.x, cy: cam.y, blur, op });
  await page.screenshot({ path: `${S}/${process.env.OUT || "frames"}/f${String(f).padStart(4, "0")}.png` });
  if (f % 10 === 0) console.log(`frame ${f} (${sh.name} t=${t.toFixed(2)}) ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
console.log("done", f0, f1);
