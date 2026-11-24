import React, { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { buildAnatomy, buildBrain, NERVE, nerveAt, BITE } from "./anatomy";
import { mulberry } from "../components/rand";

// ============ Шейдеры ============
// Плотность: + для задних граней, − для передних → интеграл толщины × плотность вдоль луча (настоящий рентген)
const DEN_VS = /* glsl */ `
attribute vec3 aDen; attribute vec3 aCtr;
varying vec3 vDen; varying vec3 vView; varying float vRef; varying vec3 vW;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vView = mv.xyz; vDen = aDen; vW = position;
  vRef = length((modelViewMatrix * vec4(aCtr,1.0)).xyz);
  gl_Position = projectionMatrix * mv;
}`;
const DEN_FS = /* glsl */ `
precision highp float;
varying vec3 vDen; varying vec3 vView; varying float vRef; varying vec3 vW;
// Ворлей F2-F1: сетка балок губчатой кости, привязана к миру
vec3 h3(vec3 p){ p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6))); return fract(sin(p)*43758.5453); }
float trab(vec3 p){
  vec3 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
  for(int x=-1;x<=1;x++) for(int y=-1;y<=1;y++) for(int z=-1;z<=1;z++){
    vec3 g = vec3(float(x),float(y),float(z)); vec3 o = h3(i+g);
    vec3 r = g + o - f; float d = dot(r,r);
    if(d<d1){ d2=d1; d1=d; } else if(d<d2) d2=d;
  }
  return sqrt(d2)-sqrt(d1);
}
void main(){
  float d = length(vView) - vRef;
  float s = gl_FrontFacing ? -1.0 : 1.0;
  float tb = 0.0;
  if (vDen.b > 0.5) { float w = trab(vW * 4.2); tb = (1.0 - smoothstep(0.0, 0.22, w)) - 0.45; }
  gl_FragColor = vec4(vDen.rg * d * s, tb, 0.0);
}`;

const QUAD_VS = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const BLUR_FS = /* glsl */ `
precision highp float;
uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv;
void main(){
  vec4 c = texture2D(tSrc, vUv) * 0.1964825501511404;
  c += (texture2D(tSrc, vUv + uDir*1.411764705882353) + texture2D(tSrc, vUv - uDir*1.411764705882353)) * 0.2969069646728344;
  c += (texture2D(tSrc, vUv + uDir*3.2941176470588234) + texture2D(tSrc, vUv - uDir*3.2941176470588234)) * 0.09447039785044732;
  c += (texture2D(tSrc, vUv + uDir*5.176470588235294) + texture2D(tSrc, vUv - uDir*5.176470588235294)) * 0.010381362401148057;
  gl_FragColor = c;
}`;

// Тон: плотность → яркость плёнки, нерезкое маскирование (как в цифровой рентгенографии), эмиссия поверх
const TONE_FS = /* glsl */ `
precision highp float;
uniform sampler2D tDen; uniform sampler2D tDenB; uniform sampler2D tDenB2; uniform sampler2D tEm;
uniform float uExpo; uniform float uTrab; uniform float uBone; uniform float uSoft; uniform float uSharp; uniform float uSharp2;
varying vec2 vUv;
void main(){
  vec3 d = texture2D(tDen, vUv).rgb;
  vec3 b = texture2D(tDenB, vUv).rgb;
  vec3 b2 = texture2D(tDenB2, vUv).rgb;
  float T  = uBone*d.r + uSoft*d.g + uTrab*d.b;
  float Tb = uBone*b.r + uSoft*b.g;
  float Tb2 = uBone*b2.r + uSoft*b2.g;
  float Te = T + uSharp*(T - Tb) + uSharp2*(Tb - Tb2);
  Te = max(Te, 0.0);
  float I = 1.0 - exp(-uExpo * Te);
  I = pow(I, 1.12);
  // плёночная кривая: холодный сине-серый монитор
  vec3 dark = vec3(0.006, 0.012, 0.02);
  vec3 mid  = vec3(0.36, 0.47, 0.58);
  vec3 hi   = vec3(0.90, 0.96, 1.0);
  vec3 col = I < 0.5 ? mix(dark, mid, I*2.0) : mix(mid, hi, (I-0.5)*2.0);
  col += vec3(0.85,0.95,1.0) * pow(max(I-0.82,0.0)*5.0, 2.0) * 0.12;
  vec3 em = texture2D(tEm, vUv).rgb;
  gl_FragColor = vec4(col + em, 1.0);
}`;

const FINAL_FS = /* glsl */ `
precision highp float;
uniform sampler2D tImg; uniform sampler2D tB1; uniform sampler2D tB2;
uniform float uFrame; uniform vec2 uRes; uniform float uTopDark; uniform float uFlash;
varying vec2 vUv;
float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
void main(){
  vec3 c = texture2D(tImg, vUv).rgb;
  vec3 b1 = texture2D(tB1, vUv).rgb;
  vec3 b2 = texture2D(tB2, vUv).rgb;
  c += b1 * 0.22 + b2 * 0.30;
  vec2 px = vUv * uRes;
  // зерно (квантовый шум): сильнее в тёмном
  float lum = dot(c, vec3(0.3,0.5,0.2));
  float g = hash(floor(px) + vec2(uFrame*17.0, uFrame*31.0)) - 0.5;
  float g2 = hash(floor(px*0.5) + vec2(uFrame*7.0, 3.0)) - 0.5;
  c += (g*0.055 + g2*0.035) * (0.55 + 0.45*(1.0-lum)) * vec3(0.85,0.95,1.0);
  // строки монитора
  c *= 0.965 + 0.035*sin(px.y * 3.14159 * 0.5);
  // виньетка + затемнение верхней зоны под титры
  vec2 q = vUv - 0.5; q.x *= uRes.x/uRes.y;
  float vig = smoothstep(0.95, 0.25, length(q*vec2(1.35,0.95)));
  c *= mix(0.35, 1.0, vig);
  float top = smoothstep(0.70, 0.88, vUv.y);
  c *= 1.0 - uTopDark * top;
  c += vec3(1.0,0.12,0.05) * uFlash * 0.18 * (1.0 - vig*0.6);
  c = max(c, vec3(0.0));
  gl_FragColor = vec4(c, 1.0);
}`;

// Нерв: светящаяся трубка; зелёная — заражённая часть, янтарная — впереди
const NERVE_VS = /* glsl */ `
attribute float aU; attribute float aSide;
varying float vU; varying float vSide; varying vec3 vN; varying vec3 vV;
void main(){
  vU = aU; vSide = aSide;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;
const NERVE_FS = /* glsl */ `
precision highp float;
uniform float uP; uniform float uT; uniform float uAmber;
varying float vU; varying float vSide; varying vec3 vN; varying vec3 vV;
void main(){
  float core = pow(abs(dot(normalize(vN), normalize(vV))), 1.6);
  vec3 amber = vec3(1.0, 0.56, 0.14);
  vec3 green = vec3(0.61, 1.0, 0.29);
  if (vSide > 0.5) { gl_FragColor = vec4(amber * uAmber * 0.3 * core, 1.0); return; }
  float inf = 1.0 - smoothstep(uP - 0.002, uP + 0.002, vU);
  float wave = 0.8 + 0.2 * sin((vU - uT*0.004) * 260.0);
  float head = exp(-pow((vU - uP)/0.010, 2.0));
  vec3 c = mix(amber * uAmber * core, green * (0.75*wave) * (0.3 + 0.7*core), inf);
  c += vec3(0.7, 1.0, 0.5) * head * 0.9 * core;
  gl_FragColor = vec4(c, 1.0);
}`;

// Точки-свечения (вирус, искры, укус, вспышка мозга)
const PT_VS = /* glsl */ `
attribute float aSize; attribute vec3 aCol;
uniform float uScale;
varying vec3 vCol;
void main(){
  vCol = aCol;
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  gl_PointSize = min(900.0, aSize * uScale / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const PT_FS = /* glsl */ `
precision highp float;
varying vec3 vCol;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  float r2 = dot(q,q) * 4.0;
  float a = exp(-r2 * 5.0) + 0.5*exp(-r2*22.0);
  gl_FragColor = vec4(vCol * a, 1.0);
}`;

const BRAIN_VS = /* glsl */ `
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
  vec4 mv = modelViewMatrix * vec4(position,1.0);
  vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vW = position;
  gl_Position = projectionMatrix * mv;
}`;
const BRAIN_FS = /* glsl */ `
precision highp float;
uniform float uHit; uniform float uT;
varying vec3 vN; varying vec3 vV; varying vec3 vW;
void main(){
  float ndv = abs(dot(normalize(vN), normalize(vV)));
  float rim = pow(1.0 - ndv, 2.2);
  float pulse = 0.75 + 0.25*sin(uT*0.45 + vW.y*0.8);
  vec3 c = vec3(1.0, 0.07, 0.02) * (rim*0.6 + 0.05) * uHit * pulse;
  gl_FragColor = vec4(c, 1.0);
}`;

// ============ Ассеты (кэш на вкладку) ============
type Assets = ReturnType<typeof makeAssets>;
let ASSETS: Assets | null = null;
const additive = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, side: THREE.DoubleSide } as const;

// полусферические торцы трубки
const capR = (u: number, e: number) => { const a = Math.min(1, u / e), b = Math.min(1, (1 - u) / e); const k = Math.min(a, b); return Math.sqrt(Math.max(0.02, 1 - (1 - k) * (1 - k))); };
function tubeWithU(pts: THREE.Vector3[], radius: (u: number) => number, side: boolean, segs: number) {
  const curve = new THREE.CatmullRomCurve3(pts);
  const g = new THREE.TubeGeometry(curve, segs, 1, 8, false);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const n = pos.count;
  const aU = new Float32Array(n), aS = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = uv.getX(i);
    const ring = Math.round(u * segs);
    const c = curve.getPointAt(ring / segs);
    const r = radius(u);
    pos.setXYZ(i, c.x + (pos.getX(i) - c.x) * r, c.y + (pos.getY(i) - c.y) * r, c.z + (pos.getZ(i) - c.z) * r);
    aU[i] = u; aS[i] = side ? 1 : 0;
  }
  g.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
  g.setAttribute("aSide", new THREE.BufferAttribute(aS, 1));
  return g;
}

function makeAssets() {
  const { parts, ms } = buildAnatomy();
  let nv = 0, ni = 0;
  for (const p of parts) { nv += p.pos.length / 3; ni += p.idx.length; }
  const pos = new Float32Array(nv * 3), den = new Float32Array(nv * 3), ctr = new Float32Array(nv * 3);
  const idx = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const p of parts) {
    const n = p.pos.length / 3;
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i < n; i++) { cx += p.pos[i * 3]; cy += p.pos[i * 3 + 1]; cz += p.pos[i * 3 + 2]; }
    cx /= n; cy /= n; cz /= n;
    pos.set(p.pos, ov * 3);
    for (let i = 0; i < n; i++) {
      den[(ov + i) * 3] = p.den[0]; den[(ov + i) * 3 + 1] = p.den[1]; den[(ov + i) * 3 + 2] = p.den[2];
      ctr[(ov + i) * 3] = cx; ctr[(ov + i) * 3 + 1] = cy; ctr[(ov + i) * 3 + 2] = cz;
    }
    for (let i = 0; i < p.idx.length; i++) idx[oi + i] = p.idx[i] + ov;
    ov += n; oi += p.idx.length;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aDen", new THREE.BufferAttribute(den, 3));
  geo.setAttribute("aCtr", new THREE.BufferAttribute(ctr, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  const denMat = new THREE.ShaderMaterial({ vertexShader: DEN_VS, fragmentShader: DEN_FS, ...additive });
  const denScene = new THREE.Scene();
  const denMesh = new THREE.Mesh(geo, denMat);
  denMesh.frustumCulled = false;
  denScene.add(denMesh);

  // эмиссия
  const emScene = new THREE.Scene();
  const nerveMat = new THREE.ShaderMaterial({ vertexShader: NERVE_VS, fragmentShader: NERVE_FS, uniforms: { uP: { value: 0 }, uT: { value: 0 }, uAmber: { value: 0.5 } }, ...additive });
  const V = (a: number[]) => new THREE.Vector3(a[0], a[1], a[2]);
  const cordU = NERVE.cordU;
  const mainGeo = tubeWithU(NERVE.main.map(V), (u) => (u < cordU - 0.01 ? 0.16 : u < cordU + 0.01 ? 0.16 + ((u - cordU + 0.01) / 0.02) * 0.12 : 0.28) * capR(u, 0.004), false, 1400);
  const m1 = new THREE.Mesh(mainGeo, nerveMat);
  m1.frustumCulled = false;
  emScene.add(m1);
  NERVE.side.forEach((s, i) => {
    const g = tubeWithU(s.map(V), (u) => (i === 10 ? 0.26 : 0.085) * capR(u, 0.01), true, 200);
    const m = new THREE.Mesh(g, nerveMat);
    m.frustumCulled = false;
    emScene.add(m);
  });
  const brainMd = buildBrain();
  const bg = new THREE.BufferGeometry();
  bg.setAttribute("position", new THREE.BufferAttribute(brainMd.pos, 3));
  bg.setIndex(new THREE.BufferAttribute(brainMd.idx, 1));
  bg.computeVertexNormals();
  const brainMat = new THREE.ShaderMaterial({ vertexShader: BRAIN_VS, fragmentShader: BRAIN_FS, uniforms: { uHit: { value: 0 }, uT: { value: 0 } }, ...additive });
  const brain = new THREE.Mesh(bg, brainMat);
  brain.frustumCulled = false;
  emScene.add(brain);

  const NP = 420;
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  ptGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(NP), 1));
  ptGeo.setAttribute("aCol", new THREE.BufferAttribute(new Float32Array(NP * 3), 3));
  const ptMat = new THREE.ShaderMaterial({ vertexShader: PT_VS, fragmentShader: PT_FS, uniforms: { uScale: { value: 1000 } }, ...additive });
  const pts = new THREE.Points(ptGeo, ptMat);
  pts.frustumCulled = false;
  emScene.add(pts);

  // пост-обработка
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const mk = (fs: string, u: Record<string, THREE.IUniform>) => new THREE.ShaderMaterial({ vertexShader: QUAD_VS, fragmentShader: fs, uniforms: u, depthTest: false, depthWrite: false });
  const blurMat = mk(BLUR_FS, { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } });
  const toneMat = mk(TONE_FS, {
    tDen: { value: null }, tDenB: { value: null }, tDenB2: { value: null }, tEm: { value: null },
    uExpo: { value: 1 }, uTrab: { value: 0.045 }, uBone: { value: 1 }, uSoft: { value: 1 }, uSharp: { value: 0.55 }, uSharp2: { value: 0.35 },
  });
  const finalMat = mk(FINAL_FS, { tImg: { value: null }, tB1: { value: null }, tB2: { value: null }, uFrame: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uTopDark: { value: 0.45 }, uFlash: { value: 0 } });
  const postScene = new THREE.Scene();
  const postQuad = new THREE.Mesh(quadGeo, blurMat);
  postQuad.frustumCulled = false;
  postScene.add(postQuad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const rng = mulberry(91);
  const sparks = Array.from({ length: 90 }, () => ({ lag: Math.pow(rng(), 1.6) * 0.07, ox: rng() - 0.5, oy: rng() - 0.5, oz: rng() - 0.5, ph: rng() * 6.28, sp: 0.5 + rng(), sz: 0.25 + rng() * 0.45 }));
  const brainPts = Array.from({ length: 200 }, () => {
    let x = 0, y = 0, z = 0;
    for (;;) { x = rng() * 2 - 1; y = rng() * 2 - 1; z = rng() * 2 - 1; if (x * x + y * y + z * z < 1) break; }
    return { p: [x * 6.0, 168.6 + y * 5.6, -1.9 + z * 7.8], ph: rng() * 6.28, sz: 2.5 + rng() * 4, d: Math.sqrt(x * x + y * y + z * z) };
  });
  return { geo, denMat, denScene, emScene, nerveMat, brainMat, ptGeo, ptMat, NP, blurMat, toneMat, finalMat, postScene, postQuad, postCam, quadGeo, sparks, brainPts, buildMs: ms, rts: null as null | Record<string, THREE.WebGLRenderTarget>, rtKey: "" };
}
const getAssets = () => (ASSETS ||= makeAssets());

// ============ Камера по p ============
const keys = (k: [number, number][], x: number) => {
  if (x <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (x <= k[i + 1][0]) {
    const t = (x - k[i][0]) / (k[i + 1][0] - k[i][0]);
    const s = t * t * (3 - 2 * t);
    return k[i][1] + (k[i + 1][1] - k[i][1]) * s;
  }
  return k[k.length - 1][1];
};
export const FOV = 24;
export type CamName = "hand" | "shoulder" | "brain" | "auto";
export function cameraRig(p: number, frame: number) {
  const D = keys([[0, 64], [0.15, 72], [0.3, 90], [0.45, 100], [0.62, 104], [0.78, 98], [0.86, 100], [1, 92]], p) * (1 - 0.045 * Math.min(1, frame / 75));
  const yaw = (keys([[0, -16], [0.2, -8], [0.45, -26], [0.62, -18], [0.78, -8], [0.88, -10], [1, 5]], p) + 3.0 * Math.sin(frame / 38)) * (Math.PI / 180);
  const pitch = (keys([[0, 5], [0.5, -2], [0.8, 1], [1, 2]], p) + 1.2 * Math.sin(frame / 53)) * (Math.PI / 180);
  const lead = keys([[0, 0.05], [0.2, 0.08], [0.45, 0.1], [0.65, 0.07], [0.85, 0.05], [1, 0.0]], p);
  let tx = 0, ty = 0, tz = 0, n = 0;
  for (let k = 0; k <= 8; k++) { const q = nerveAt(p - 0.02 + (lead + 0.02) * (k / 8)); tx += q[0]; ty += q[1]; tz += q[2]; n++; }
  const t = new THREE.Vector3(tx / n, ty / n, tz / n);
  // мягко тянем к центру тела у мозга
  if (p > 0.76) { const w = Math.min(1, (p - 0.76) / 0.12); const hy = 161.5 + 3.5 * Math.min(1, Math.max(0, (p - 0.85) / 0.15)); t.lerp(new THREE.Vector3(0, hy, -1.5), w * w * (3 - 2 * w)); }
  const viewH = 2 * D * Math.tan((FOV * Math.PI) / 360);
  t.y -= viewH * keys([[0, 0.0], [0.5, 0.02], [1, 0.04]], p);
  const pos = new THREE.Vector3(t.x + D * Math.sin(yaw) * Math.cos(pitch), t.y + D * Math.sin(pitch), t.z + D * Math.cos(yaw) * Math.cos(pitch));
  const roll = 0.012 * Math.sin(frame / 45);
  return { pos, target: t, D, viewH, roll };
}

// ============ Сцена ============
export type DebugCam = { pos: number[]; target: number[]; fov?: number; soft?: number };
const XrayScene: React.FC<{ frame: number; p: number; brainHit: number; expo?: number; debugCam?: DebugCam }> = ({ frame, p, brainHit, expo, debugCam }) => {
  const { camera, size } = useThree();
  const a = getAssets();
  const cam = camera as THREE.PerspectiveCamera;
  const rig = cameraRig(p, frame);
  if (debugCam) { rig.pos.set(debugCam.pos[0], debugCam.pos[1], debugCam.pos[2]); rig.target.set(debugCam.target[0], debugCam.target[1], debugCam.target[2]); rig.roll = 0; rig.D = rig.pos.distanceTo(rig.target); }
  cam.fov = debugCam?.fov ?? FOV; cam.near = 5; cam.far = 600;
  cam.position.copy(rig.pos);
  cam.up.set(Math.sin(rig.roll), Math.cos(rig.roll), 0);
  cam.lookAt(rig.target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();

  // экспозиция по зоне: кисть тонкая, череп плотный
  const ex = expo ?? keys([[0, 0.62], [0.2, 0.58], [0.45, 0.5], [0.65, 0.46], [0.8, 0.38], [0.88, 0.33], [1, 0.32]], p);
  a.toneMat.uniforms.uExpo.value = ex;
  a.toneMat.uniforms.uBone.value = keys([[0, 1.0], [0.3, 0.95], [0.5, 0.8], [0.75, 0.85], [1, 0.95]], p);
  a.toneMat.uniforms.uSoft.value = debugCam?.soft ?? keys([[0, 4.0], [0.2, 3.2], [0.45, 2.6], [0.7, 2.2], [0.85, 1.6], [1, 1.5]], p);
  a.nerveMat.uniforms.uP.value = p;
  a.nerveMat.uniforms.uT.value = frame;
  a.nerveMat.uniforms.uAmber.value = 0.32;
  a.brainMat.uniforms.uHit.value = brainHit;
  a.brainMat.uniforms.uT.value = frame;
  a.finalMat.uniforms.uFrame.value = frame;
  a.finalMat.uniforms.uFlash.value = brainHit * (0.6 + 0.4 * Math.sin(frame * 0.9));

  // точки
  const P = a.ptGeo.attributes.position.array as Float32Array;
  const SZ = a.ptGeo.attributes.aSize.array as Float32Array;
  const CL = a.ptGeo.attributes.aCol.array as Float32Array;
  let n = 0;
  const put = (x: number, y: number, z: number, s: number, r: number, g: number, b: number) => {
    if (n >= a.NP) return;
    P[n * 3] = x; P[n * 3 + 1] = y; P[n * 3 + 2] = z; SZ[n] = s; CL[n * 3] = r; CL[n * 3 + 1] = g; CL[n * 3 + 2] = b; n++;
  };
  const h = nerveAt(p);
  const beat = 0.8 + 0.2 * Math.sin(frame * 0.7);
  const hs = rig.D / 100;
  put(h[0], h[1], h[2], 9 * hs, 0.07 * beat, 0.16 * beat, 0.03 * beat);
  put(h[0], h[1], h[2], 3.2 * hs, 0.3 * beat, 0.7 * beat, 0.15 * beat);
  put(h[0], h[1], h[2], 1.1 * hs, 0.9, 1.4, 0.6);
  for (const s of a.sparks) {
    const q = p - s.lag;
    if (q < 0) continue;
    const c = nerveAt(q);
    const tw = Math.max(0, Math.sin(frame * 0.35 * s.sp + s.ph));
    const r = 0.9 + s.lag * 8;
    const dr = frame * 0.01 * s.sp;
    put(c[0] + (s.ox + Math.sin(dr + s.ph) * 0.2) * r, c[1] + s.oy * r + dr * 0.3, c[2] + s.oz * r, s.sz * (0.6 + tw), 0.45 * tw, 1.0 * tw, 0.25 * tw);
  }
  // укус: два полукруга отпечатков зубов на тыле кисти + ореол
  const bp = 0.75 + 0.25 * Math.sin(frame * 0.3);
  const B = BITE;
  put(B.c[0] + B.n[0] * 0.3, B.c[1] + B.n[1] * 0.3, B.c[2] + B.n[2] * 0.3, 4.2, 0.45 * bp, 0.015, 0.01);
  // отпечаток пасти: верхняя и нижняя дуги, крупные проколы клыков по краям
  const BT: [number, number, number][] = [
    [0.95, -1.25, 1.25], [1.1, -0.55, 0.7], [1.15, 0.0, 0.6], [1.1, 0.5, 0.65], [0.92, 1.2, 1.3],
    [-0.85, -1.15, 1.15], [-1.0, -0.4, 0.6], [-1.02, 0.25, 0.55], [-0.85, 1.05, 1.2],
  ];
  for (const [du, dv, sz] of BT) {
    const x = B.c[0] + B.d[0] * du + B.l[0] * dv, y = B.c[1] + B.d[1] * du + B.l[1] * dv, z = B.c[2] + B.d[2] * du + B.l[2] * dv;
    put(x, y, z, 0.55 * sz, 1.5 * bp, 0.05, 0.03);
    put(x, y, z, 1.6 * sz, 0.22 * bp, 0.0, 0.0);
  }
  // вспышка мозга
  if (brainHit > 0.001) {
    for (const bpnt of a.brainPts) {
      const spread = Math.min(1, brainHit * 1.6 - bpnt.d * 0.6 + 0.2);
      if (spread <= 0) continue;
      const fl = (0.6 + 0.4 * Math.sin(frame * 0.6 + bpnt.ph)) * spread * brainHit;
      put(bpnt.p[0], bpnt.p[1], bpnt.p[2], bpnt.sz, 0.16 * fl, 0.018 * fl, 0.006 * fl);
    }
    put(0, 168.4, -1.8, 30 * (0.6 + brainHit * 0.6), 0.12 * brainHit, 0.012 * brainHit, 0.004 * brainHit);
  }
  for (let i = n; i < a.NP; i++) SZ[i] = 0;
  a.ptGeo.attributes.position.needsUpdate = true;
  a.ptGeo.attributes.aSize.needsUpdate = true;
  a.ptGeo.attributes.aCol.needsUpdate = true;
  a.ptGeo.setDrawRange(0, n);

  const onBefore = useMemo(
    () => (gl: THREE.WebGLRenderer, _s: THREE.Scene, camera: THREE.Camera) => {
      const A = getAssets();
      const buf = gl.getDrawingBufferSize(new THREE.Vector2());
      const W = Math.max(2, Math.floor(buf.x)), H = Math.max(2, Math.floor(buf.y));
      const key = `${W}x${H}`;
      if (A.rtKey !== key) {
        if (A.rts) Object.values(A.rts).forEach((r) => r.dispose());
        const ext = gl.extensions;
        const fType = ext.has("EXT_float_blend") ? THREE.FloatType : THREE.HalfFloatType;
        const mkRT = (w: number, h: number, type: THREE.TextureDataType, filt: THREE.MagnificationTextureFilter) =>
          new THREE.WebGLRenderTarget(w, h, { type, format: THREE.RGBAFormat, minFilter: filt as any, magFilter: filt, depthBuffer: false, generateMipmaps: false });
        const hw = Math.max(2, W >> 1), hh = Math.max(2, H >> 1), qw = Math.max(2, W >> 2), qh = Math.max(2, H >> 2), ew = Math.max(2, W >> 3), eh = Math.max(2, H >> 3);
        A.rts = {
          den: mkRT(W, H, fType, THREE.NearestFilter),
          em: mkRT(W, H, THREE.HalfFloatType, THREE.LinearFilter),
          d1: mkRT(hw, hh, THREE.HalfFloatType, THREE.LinearFilter),
          d2: mkRT(hw, hh, THREE.HalfFloatType, THREE.LinearFilter),
          d3: mkRT(qw, qh, THREE.HalfFloatType, THREE.LinearFilter),
          d4: mkRT(qw, qh, THREE.HalfFloatType, THREE.LinearFilter),
          img: mkRT(W, H, THREE.HalfFloatType, THREE.LinearFilter),
          b1: mkRT(qw, qh, THREE.HalfFloatType, THREE.LinearFilter),
          b2: mkRT(qw, qh, THREE.HalfFloatType, THREE.LinearFilter),
          c1: mkRT(ew, eh, THREE.HalfFloatType, THREE.LinearFilter),
          c2: mkRT(ew, eh, THREE.HalfFloatType, THREE.LinearFilter),
        };
        A.rtKey = key;
      }
      const R = A.rts!;
      const prevTarget = gl.getRenderTarget();
      const prevAuto = gl.autoClear;
      const prevClear = gl.getClearColor(new THREE.Color());
      const prevAlpha = gl.getClearAlpha();
      gl.autoClear = true;
      gl.setClearColor(0x000000, 0);
      gl.setRenderTarget(R.den); gl.render(A.denScene, camera);
      A.ptMat.uniforms.uScale.value = H / (2 * Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360));
      gl.setRenderTarget(R.em); gl.render(A.emScene, camera);
      const blur = (src: THREE.WebGLRenderTarget, dst: THREE.WebGLRenderTarget, dx: number, dy: number) => {
        A.postQuad.material = A.blurMat;
        A.blurMat.uniforms.tSrc.value = src.texture;
        A.blurMat.uniforms.uDir.value.set(dx / dst.width, dy / dst.height);
        gl.setRenderTarget(dst); gl.render(A.postScene, A.postCam);
      };
      const s1 = H / 960; // радиус размытия привязан к высоте кадра
      blur(R.den, R.d1, 1.4 * s1, 0); blur(R.d1, R.d2, 0, 1.4 * s1);
      blur(R.d2, R.d3, 2.6 * s1, 0); blur(R.d3, R.d4, 0, 2.6 * s1);
      A.postQuad.material = A.toneMat;
      A.toneMat.uniforms.tDen.value = R.den.texture;
      A.toneMat.uniforms.tDenB.value = R.d2.texture;
      A.toneMat.uniforms.tDenB2.value = R.d4.texture;
      A.toneMat.uniforms.tEm.value = R.em.texture;
      gl.setRenderTarget(R.img); gl.render(A.postScene, A.postCam);
      blur(R.img, R.b1, 1.5 * s1, 0); blur(R.b1, R.b2, 0, 1.5 * s1);
      blur(R.b2, R.c1, 2.0 * s1, 0); blur(R.c1, R.c2, 0, 2.0 * s1);
      A.finalMat.uniforms.tImg.value = R.img.texture;
      A.finalMat.uniforms.tB1.value = R.b2.texture;
      A.finalMat.uniforms.tB2.value = R.c2.texture;
      A.finalMat.uniforms.uRes.value.set(W, H);
      gl.setRenderTarget(prevTarget);
      gl.setClearColor(prevClear, prevAlpha);
      gl.autoClear = prevAuto;
    },
    [],
  );

  return (
    <mesh geometry={a.quadGeo} material={a.finalMat} frustumCulled={false} onBeforeRender={onBefore as any} />
  );
};

// ============ Оверлей: маркер стороны и линейка ============
const Overlay: React.FC<{ p: number; frame: number; width: number; height: number }> = ({ p, frame, width, height }) => {
  const rig = cameraRig(p, frame);
  const pxPerCm = height / rig.viewH;
  const ticks: React.ReactNode[] = [];
  const x0 = width - 64, y0 = 640, len = 760;
  const n = Math.floor(len / pxPerCm);
  for (let i = 0; i <= n; i++) {
    const y = y0 + i * pxPerCm;
    const major = i % 5 === 0;
    ticks.push(<line key={i} x1={x0} x2={x0 + (major ? 26 : 14)} y1={y} y2={y} stroke="rgba(200,225,255,0.55)" strokeWidth={major ? 2.2 : 1.4} />);
    if (major && i > 0) ticks.push(<text key={`t${i}`} x={x0 - 8} y={y + 7} fill="rgba(200,225,255,0.5)" fontSize={20} textAnchor="end" fontFamily="monospace">{i}</text>);
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} x2={x0} y1={y0} y2={y0 + n * pxPerCm} stroke="rgba(200,225,255,0.5)" strokeWidth={2} />
        {ticks}
        <text x={x0 + 4} y={y0 - 16} fill="rgba(200,225,255,0.45)" fontSize={20} textAnchor="middle" fontFamily="monospace">CM</text>
        <g transform={`translate(66, 470)`}>
          <rect x={0} y={0} width={70} height={84} rx={6} fill="rgba(255,255,255,0.06)" stroke="rgba(225,240,255,0.75)" strokeWidth={3} />
          <text x={35} y={66} fill="rgba(235,245,255,0.92)" fontSize={62} fontWeight={700} textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif">R</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ============ Публичный компонент ============
export const XrayShot: React.FC<{ frame: number; p: number; brainHit?: number; cam?: CamName; expo?: number; overlay?: boolean; debugCam?: DebugCam }> = ({ frame, p, brainHit = 0, expo, overlay = true, debugCam }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: FOV, near: 5, far: 600, position: [0, 120, 100] }} gl={{ antialias: false, alpha: false, preserveDrawingBuffer: true }}>
        <XrayScene frame={frame} p={p} brainHit={brainHit} expo={expo} debugCam={debugCam} />
      </ThreeCanvas>
      {overlay && !debugCam && <Overlay p={p} frame={frame} width={width} height={height} />}
    </AbsoluteFill>
  );
};
