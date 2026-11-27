import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const S = process.env.SCR;
await build({ entryPoints: ["frames.jsx"], bundle: true, platform: "node", format: "esm", outfile: S + "/frames.mjs", jsxFactory: "__h", jsxFragment: "__F", inject: ["h.mjs"], loader: { ".jsx": "jsx" } });
const { FRAMES, CAP } = await import(S + "/frames.mjs?" + Date.now());
const { toSVG, svgDefs } = await import("./svg.mjs");
const LIB = readFileSync("../../../.claude/skills/toon3d-shorts-higgsedit/templates/boat-lantern/edit3d/lib.glsl", "utf8");
const SCN = readFileSync("lighthouse.glsl", "utf8");
const only = process.argv[2];
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const F of FRAMES) {
  if (only && F.name !== only) continue;
  const params = { ...F.p, layer: 0, focus: 1000 };
  const uni = Object.keys(params).map((k) => `uniform float u_${k};`).join("\n");
  const frag = `precision highp float;\nuniform vec2 u_resolution;\nuniform float u_time;\n${uni}\n${LIB}\n${SCN}\nvoid main(){ vec2 uv=vec2(gl_FragCoord.x/u_resolution.x,1.0-gl_FragCoord.y/u_resolution.y); gl_FragColor=pixel(uv); }`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>${""}</defs>${toSVG(F.chars, F.t)}${toSVG(CAP(F.cap), 0)}</svg>`;
  const html = `<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap"><style>body{margin:0;background:#000;width:1080px;height:1920px;overflow:hidden}canvas,svg{position:absolute;left:0;top:0}#bg{filter:blur(${F.blur / 2}px)}</style></head><body>
<canvas id="bg" width="540" height="960" style="width:1080px;height:1920px"></canvas>${svg.replace("<defs></defs>", "<defs>" + svgDefs() + "</defs>").replace(/(<text[\s\S]*<\/text>)<\/svg>$/, "</svg>")}
<canvas id="fg" width="1080" height="1920"></canvas>
<svg width="1080" height="1920" style="position:absolute;left:0;top:0">${toSVG(CAP(F.cap), 0)}</svg>
<script>
const FS=${JSON.stringify(frag)}, P=${JSON.stringify(params)};
function draw(id,layer,focus){ const c=document.getElementById(id); const gl=c.getContext('webgl',{premultipliedAlpha:true,preserveDrawingBuffer:true,alpha:true});
 const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
 const pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(pr);gl.useProgram(pr);
 const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const l=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,2,gl.FLOAT,false,0,0);
 gl.uniform2f(gl.getUniformLocation(pr,'u_resolution'),c.width,c.height);gl.uniform1f(gl.getUniformLocation(pr,'u_time'),${F.t});
 const Q={...P,layer,focus};for(const k in Q){const u=gl.getUniformLocation(pr,'u_'+k);if(u)gl.uniform1f(u,Q[k]);}
 gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.enable(gl.SCISSOR_TEST);
 for(let y=0;y<c.height;y+=64){gl.scissor(0,y,c.width,64);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);gl.finish();} }
try{ draw('bg',1,1000); draw('fg',2,${F.focus}); document.title='done'; }catch(e){ document.title='ERR '+e.message; }
</script></body></html>`;
  writeFileSync(S + "/" + F.name + ".html", html);
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto("file://" + S + "/" + F.name + ".html");
  await page.waitForFunction(() => document.title.length > 0, null, { timeout: 600000 });
  const title = await page.title();
  if (title !== "done") { console.log(F.name, title.slice(0, 1500)); continue; }
  await page.waitForTimeout(800);
  await page.screenshot({ path: "preview/" + F.name + ".png" });
  console.log("rendered", F.name);
}
await browser.close();
