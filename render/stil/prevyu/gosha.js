// Гоша — первый житель пояса. Воксельный космонавт с пиксельными глазами на визоре.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const rb = (w, h, d, r = .05) => new RoundedBoxGeometry(w, h, d, 4, r);
const C = {suit: 0xff8a3d, patch: 0x5ee6b0, dark: 0x2a3040, sole: 0x35e8ff, silver: 0xd9dde6, eye: 0x6ff3ff};
const mat = (c, o = {}) => new THREE.MeshPhysicalMaterial({color: c, roughness: .45, clearcoat: .5, clearcoatRoughness: .3, ...o});
const ANT = {calm: 0x45f08a, joy: 0x45f08a, proud: 0xffd23f, sad: 0x4d8dff, dream: 0xffd23f, love: 0xff7ad9, wow: 0xffffff};

// пиксельные глаза на визоре
function drawEyes(ctx, mood) {
  ctx.fillStyle = '#0d1424'; ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#6ff3ff'; ctx.shadowColor = '#6ff3ff'; ctx.shadowBlur = 12;
  const px = (x, y, w = 1, h = 1) => ctx.fillRect(x * 8, y * 8, w * 8, h * 8);
  const both = (f) => { f(8); f(20); };
  const shapes = {
    calm: x => px(x, 5, 3, 4),
    joy: x => { px(x, 7); px(x + 1, 6); px(x + 2, 5, 1, 1); px(x + 3, 6); px(x + 4, 7); },
    proud: x => { px(x + 2, 3, 1, 7); px(x, 6, 5, 1); px(x + 1, 5, 3, 3); },
    wow: x => { px(x, 4, 4, 1); px(x, 8, 4, 1); px(x, 5, 1, 3); px(x + 3, 5, 1, 3); },
    sad: x => { px(x, 7, 4, 1); },
    love: x => { px(x, 5, 2, 2); px(x + 3, 5, 2, 2); px(x, 6, 5, 2); px(x + 1, 8, 3, 1); px(x + 2, 9); },
    dream: x => { px(x + 1, 4); px(x + 3, 6); px(x, 8); },
  };
  both(shapes[mood] || shapes.calm);
  if (mood === 'sad') { ctx.fillStyle = '#4d8dff'; px(23, 9, 1, 2); }
  ctx.shadowBlur = 0;
}

export function gosha({mood = 'calm', pose = 'stand', flag = false} = {}) {
  const g = new THREE.Group();
  const add = (geo, m, x, y, z, parent = g) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o; };
  const suit = mat(C.suit), patch = mat(C.patch), dark = mat(C.dark, {metalness: .7, roughness: .35}), silver = mat(C.silver, {metalness: .9, roughness: .2});
  // ноги и ботинки
  for (const s of [-1, 1]) {
    add(rb(.17, .22, .2), suit, s * .11, .27, 0);
    add(rb(.22, .14, .3, .05), dark, s * .12, .08, .03);
    add(new THREE.BoxGeometry(.2, .025, .28), new THREE.MeshStandardMaterial({color: C.sole, emissive: C.sole, emissiveIntensity: 2.2}), s * .12, .012, .03);
  }
  add(rb(.08, .08, .02, .02), patch, .11, .3, .105);
  // корпус
  const torso = add(rb(.42, .38, .3, .1), suit, 0, .55, 0);
  add(rb(.12, .07, .02, .02), mat(0xffffff), -.08, .62, .155);
  const badge = document.createElement('canvas'); badge.width = 128; badge.height = 64; const bx = badge.getContext('2d');
  bx.fillStyle = '#ffffff'; bx.fillRect(0, 0, 128, 64); bx.fillStyle = '#ff6a1a'; bx.font = '900 46px M'; bx.textAlign = 'center'; bx.textBaseline = 'middle'; bx.fillText('№1', 64, 34);
  const bt = new THREE.CanvasTexture(badge); bt.colorSpace = THREE.SRGBColorSpace;
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(.12, .06), new THREE.MeshStandardMaterial({map: bt})); bm.position.set(-.08, .62, .166); g.add(bm);
  add(rb(.44, .06, .32, .03), dark, 0, .4, 0);
  // джетпак-термос
  add(new THREE.CylinderGeometry(.09, .09, .34, 24), silver, 0, .58, -.21);
  add(new THREE.CylinderGeometry(.095, .085, .07, 24), mat(C.patch), 0, .78, -.21);
  // руки (плечо → кисть), поворачиваются от плеча
  const arms = {};
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .25, .66, 0); g.add(sh);
    add(rb(.12, .26, .12, .05), suit, 0, -.12, 0, sh);
    add(rb(.13, .11, .13, .05), mat(0xf3efe7), 0, -.29, 0, sh);   // варежка
    if (s === -1) add(rb(.07, .07, .02, .02), patch, 0, -.08, .065, sh);
    arms[s] = sh;
  }
  // шлем
  const head = new THREE.Group(); head.position.set(0, 1.0, 0); g.add(head);
  add(new THREE.TorusGeometry(.2, .035, 10, 32), dark, 0, -.24, 0, head).rotation.x = Math.PI / 2;
  const visorC = document.createElement('canvas'); visorC.width = 256; visorC.height = 128; drawEyes(visorC.getContext('2d'), mood);
  const vt = new THREE.CanvasTexture(visorC); vt.colorSpace = THREE.SRGBColorSpace;
  const visor = new THREE.Mesh(new THREE.SphereGeometry(.27, 32, 16, Math.PI / 2 - Math.PI * .32, Math.PI * .64, Math.PI * .3, Math.PI * .35),
    new THREE.MeshStandardMaterial({map: vt, emissiveMap: vt, emissive: 0xffffff, emissiveIntensity: 2.2, roughness: .15, metalness: .3}));
  visor.rotation.y = 0; head.add(visor);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.29, 40, 24), new THREE.MeshPhysicalMaterial({color: 0xcfefff, roughness: .03, transparent: true, opacity: .14, clearcoat: 1, depthWrite: false}));
  head.add(dome);
  add(new THREE.SphereGeometry(.262, 32, 16), new THREE.MeshStandardMaterial({color: 0x0d1424, roughness: .3, metalness: .4}), 0, 0, -.02, head).scale.set(1, 1, .92);
  add(new THREE.CylinderGeometry(.012, .012, .16), dark, .08, .33, 0, head);
  const ant = add(new THREE.SphereGeometry(.035, 12, 8), new THREE.MeshStandardMaterial({color: ANT[mood], emissive: ANT[mood], emissiveIntensity: 3}), .08, .42, 0, head);
  // позы
  const P = {
    stand: () => {arms[-1].rotation.z = -.15; arms[1].rotation.z = .15;},
    wave: () => {arms[-1].rotation.z = -.15; arms[1].rotation.z = 2.6; arms[1].rotation.x = .2; head.rotation.z = -.12;},
    flag: () => {arms[1].rotation.z = .35; arms[1].rotation.x = -1.7; arms[-1].rotation.z = -.3; head.rotation.x = .1;},
    marshal: () => {arms[-1].rotation.z = -1.4; arms[-1].rotation.y = .4; arms[1].rotation.z = 1.4; arms[1].rotation.y = -.4; g.rotation.y = -.5;},
    facepalm: () => {arms[-1].rotation.z = -.15; arms[1].rotation.x = -2.75; arms[1].rotation.z = -.55; head.rotation.x = .3; head.position.z = -.02;},
    dream: () => {arms[-1].rotation.x = .9; arms[-1].rotation.z = .35; arms[1].rotation.x = .9; arms[1].rotation.z = -.35; head.rotation.x = -.25; g.position.y = .25;},
  };
  (P[pose] || P.stand)();
  if (flag) {
    const f = new THREE.Group(); f.position.set(0, -.32, .02); f.rotation.x = 1.7; f.scale.setScalar(1.6); arms[1].add(f);
    add(new THREE.CylinderGeometry(.008, .008, .36), dark, 0, -.08, 0, f);
    add(new THREE.BoxGeometry(.14, .09, .01), new THREE.MeshStandardMaterial({color: 0xffd23f, emissive: 0xffb000, emissiveIntensity: .4}), .07, .05, 0, f);
  }
  if (pose === 'dream') {
    for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(.03 + i * .008, 10, 8), new THREE.MeshStandardMaterial({color: 0xffffff, transparent: true, opacity: .5 - i * .06})); p.position.set((Math.random() - .5) * .08, .35 - i * .08, -.21); g.add(p); }
  }
  let cur = mood;
  const setMood = (m) => { if (m === cur) return; cur = m; drawEyes(visorC.getContext('2d'), m); vt.needsUpdate = true; ant.material.color.setHex(ANT[m] || ANT.calm); ant.material.emissive.setHex(ANT[m] || ANT.calm); };
  g.userData = {head, arms, ant, setMood};
  return g;
}
