// Frame-by-frame renderer for shots.jsx: WebGL (SwiftShader) for the 3D sets, SVG for the 2D cards.
// usage: SCR=<scratch dir> NODE_PATH=<global node_modules> node anim.mjs [from_frame to_frame]
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const S = process.env.SCR, FPS = 30;
await build({ entryPoints: ["shots.jsx"], bundle: true, platform: "node", format: "esm", outfile: S + "/shots.mjs", jsxFactory: "h", jsxFragment: "Fragment", inject: ["h.js"], loader: { ".jsx": "jsx" } });
const { SHOTS, CAPS, T, Cap } = await import(S + "/shots.mjs?" + Date.now());
const { toSVG, svgDefs, resetDefs } = await import("./svg.mjs?" + Date.now());
const TPL = "../../../toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/";
const LIB = readFileSync(TPL + "lib.glsl", "utf8");
const SCN = { lighthouse: readFileSync("lighthouse.glsl", "utf8"), booth: readFileSync(TPL + "booth.glsl", "utf8") };
mkdirSync(S + "/frames", { recursive: true });
const LIST = process.argv[2] === "list" ? process.argv.slice(3).map(Number) : null;
const [f0, f1] = [Number(process.argv[2] ?? 0), Number(process.argv[3] ?? Math.round(T * FPS) - 1)];

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const shell = `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap">
<style>body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}#cam{position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 960px}
canvas,svg{position:absolute;left:0;top:0}#cap{position:absolute;left:0;top:0}</style></head><body>
<div id="cam"><canvas id="bg" width="540" height="960" style="width:1080px;height:1920px"></canvas><div id="mid"></div><canvas id="fg" width="1080" height="1920"></canvas><div id="top"></div></div><div id="cap"></div>
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
await page.goto("file://" + S + "/anim.html");
await page.waitForTimeout(1500);

const fragFor = (scene, P) => {
  const uni = Object.keys(P).map((k) => `uniform float u_${k};`).join("\n");
  return `precision highp float;\nuniform vec2 u_resolution;\nuniform float u_time;\n${uni}\n${LIB}\n${SCN[scene]}\nvoid main(){ vec2 uv=vec2(gl_FragCoord.x/u_resolution.x,1.0-gl_FragCoord.y/u_resolution.y); gl_FragColor=pixel(uv); }`;
};
const svgWrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>${svgDefs()}</defs>${inner}</svg>`;
const t0 = Date.now();
for (const f of LIST ?? Array.from({ length: f1 - f0 + 1 }, (_, i) => f0 + i)) {
  const T_ = f / FPS; resetDefs();
  const sh = SHOTS.filter((s) => T_ >= s.at - 1e-6).pop();
  const t = T_ - sh.at;
  const P = { ...sh.p(t), layer: 1, focus: 1000 };
  const frag = fragFor(sh.scene, P);
  const cap = CAPS.filter((c) => T_ >= c[0] - 1e-6).pop();
  const cam = sh.cam(t);
  let s = cam.s, blur = 0;
  if (sh.enter === "whip" && t < 0.22) { const u = t / 0.22; s *= 1.18 - 0.18 * (1 - (1 - u) * (1 - u)); blur = 55 * (1 - u) * (1 - u); }
  await page.evaluate(({ frag, P, sh, t, T_, mid, top, cap, s, cx, cy, blur }) => {
    if (sh.focus == null) { window.draw('bg', sh.name, frag, { ...P, layer: 0 }, T_); window.clear('fg'); document.getElementById('bg').style.filter = 'none'; }
    else { window.draw('bg', sh.name, frag, P, T_); window.draw('fg', sh.name, frag, { ...P, layer: 2, focus: sh.focus }, T_); document.getElementById('bg').style.filter = 'blur(' + sh.blur / 2 + 'px)'; }
    document.getElementById('mid').innerHTML = mid; document.getElementById('top').innerHTML = top; document.getElementById('cap').innerHTML = cap;
    const c = document.getElementById('cam'); c.style.transform = 'translate(' + cx + 'px,' + cy + 'px) scale(' + s + ')'; c.style.filter = blur > 0.5 ? 'blur(' + blur / 2 + 'px)' : 'none';
  }, { frag, P, sh: { name: sh.name, focus: sh.focus, blur: sh.blur }, t, T_, mid: svgWrap(toSVG(sh.mid ? sh.mid(t) : [], t)), top: svgWrap(toSVG(sh.top ? sh.top(t) : [], t)), cap: svgWrap(cap ? toSVG(Cap(cap[1]), 0) : ""), s, cx: cam.x, cy: cam.y, blur });
  await page.screenshot({ path: `${S}/frames/f${String(f).padStart(4, "0")}.png` });
  if (f % 10 === 0) console.log(`frame ${f} (${sh.name} t=${t.toFixed(2)}) ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
console.log("done", f0, f1);
