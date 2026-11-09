// Постройки для метеоритов: свежий «премиальный» стиль —
// светлые панели, яркий акцент, тёплое стекло, дерево, сад на крыше, неоновая подсветка.
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const rb = (w, h, d, r = 0.06) => new RoundedBoxGeometry(w, h, d, 4, r);
const M = {
  panel: new THREE.MeshPhysicalMaterial({color: 0xf3efe7, roughness: .42, clearcoat: .6, clearcoatRoughness: .25}),
  trim: new THREE.MeshStandardMaterial({color: 0x2a3040, metalness: .8, roughness: .35}),
  wood: new THREE.MeshStandardMaterial({color: 0xb5784a, roughness: .65}),
  glass: new THREE.MeshPhysicalMaterial({color: 0x9fc9e8, metalness: .1, roughness: .04, transparent: true, opacity: .32, clearcoat: 1, depthWrite: false}),
  warm: new THREE.MeshStandardMaterial({color: 0xffd9a0, emissive: 0xffb866, emissiveIntensity: 1.35}),
  neon: new THREE.MeshStandardMaterial({color: 0x6ff3ff, emissive: 0x35e8ff, emissiveIntensity: 2.4}),
  solar: new THREE.MeshStandardMaterial({color: 0x1a2c55, metalness: .7, roughness: .18}),
  red: new THREE.MeshStandardMaterial({color: 0xff4d5e, emissive: 0xff2030, emissiveIntensity: 4}),
  grow: new THREE.MeshStandardMaterial({color: 0xff7ad9, emissive: 0xff5ac8, emissiveIntensity: 1.6}),
};
const leaf = (h) => new THREE.MeshStandardMaterial({color: new THREE.Color().setHSL(h, .55, .42), roughness: .8});
const acc = (c) => new THREE.MeshPhysicalMaterial({color: c, roughness: .3, clearcoat: .8, clearcoatRoughness: .2});

function add(g, geo, mat, x, y, z, {cast = true, ry = 0, rx = 0} = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0);
  m.castShadow = cast; m.receiveShadow = true; g.add(m); return m;
}
// окно = рамка + тёплый интерьер + стекло + импосты
function windowPane(g, w, h, x, y, z, {mullions = 2} = {}) {
  add(g, new THREE.BoxGeometry(w + .06, h + .06, .03), M.trim, x, y, z - .005, {cast: false});
  add(g, new THREE.PlaneGeometry(w, h), M.warm, x, y, z + .012, {cast: false});
  add(g, new THREE.PlaneGeometry(w, h), M.glass, x, y, z + .03, {cast: false});
  for (let i = 1; i <= mullions; i++) add(g, new THREE.BoxGeometry(.018, h, .02), M.trim, x - w / 2 + w * i / (mullions + 1), y, z + .035, {cast: false});
}
function bushes(g, n, x0, y0, z0, w, d, seed = 1) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < n; i++) {
    const sz = .07 + r() * .09;
    add(g, new THREE.BoxGeometry(sz, sz, sz), leaf(.27 + r() * .1), x0 + (r() - .5) * w, y0 + sz / 2, z0 + (r() - .5) * d, {ry: r() * 3});
  }
}
function lamp(g, x, y, z) {
  add(g, new THREE.CylinderGeometry(.012, .012, .22), M.trim, x, y + .11, z, {cast: false});
  add(g, new THREE.SphereGeometry(.035, 12, 8), M.warm, x, y + .24, z, {cast: false});
}

// Дом: белый основной объём + консоль акцентного цвета, панорамное окно, терраса, сад на крыше
export function domModern(accent = 0xff7a59, {light = true} = {}) {
  const g = new THREE.Group();
  add(g, rb(1.9, .12, 1.6, .05), M.trim, 0, .06, 0);
  for (const [w, d, x, z] of [[1.86, .02, 0, .8], [1.86, .02, 0, -.8], [.02, 1.56, .95, 0], [.02, 1.56, -.95, 0]])
    add(g, new THREE.BoxGeometry(w, .025, d), M.neon, x, .03, z, {cast: false});
  add(g, rb(1.3, .9, 1.1), M.panel, -.15, .57, -.1);
  add(g, rb(.95, .58, 1.0), acc(accent), .3, 1.31, -.05);
  add(g, rb(1.0, .04, 1.08, .02), M.trim, .3, 1.0, -.05);
  windowPane(g, .95, .5, -.2, .6, .455, {mullions: 2});
  windowPane(g, .6, .3, .38, 1.32, .455, {mullions: 1});
  add(g, rb(.26, .52, .05, .02), acc(accent), .42, .4, .46);
  add(g, new THREE.BoxGeometry(.16, .025, .02), M.warm, .42, .69, .49, {cast: false});
  add(g, new THREE.BoxGeometry(1.5, .05, .38), M.wood, -.05, .145, .72);
  lamp(g, -.72, .17, .86); lamp(g, .62, .17, .86);
  bushes(g, 9, -.55, 1.02, -.1, .35, .9, 3);
  add(g, new THREE.BoxGeometry(.4, .03, .9), leaf(.3), -.55, 1.03, -.1, {cast: false});
  add(g, new THREE.BoxGeometry(.6, .03, .4), M.solar, .32, 1.66, -.25, {rx: -.35});
  add(g, new THREE.CylinderGeometry(.012, .012, .45), M.trim, .62, 1.82, -.4, {cast: false});
  add(g, new THREE.SphereGeometry(.04, 12, 8), M.red, .62, 2.06, -.4, {cast: false});
  if (light) { const pl = new THREE.PointLight(0xffc27a, 1.2, 2.5, 2); pl.position.set(-.1, .7, 1.0); g.add(pl); }
  return g;
}

// Оранжерея: стеклянный полуцилиндр на деревянных рёбрах, растения, розовый фито-свет
export function oranzhereya() {
  const g = new THREE.Group();
  add(g, rb(1.3, .08, .8, .03), M.wood, 0, .04, 0);
  const tube = new THREE.CylinderGeometry(.38, .38, 1.15, 32, 1, true, 0, Math.PI);
  add(g, tube, M.glass, 0, .08, 0, {cast: false}).rotation.set(0, 0, Math.PI / 2);
  for (let i = 0; i < 5; i++) {
    const rib = new THREE.Mesh(new THREE.TorusGeometry(.38, .018, 6, 24, Math.PI), M.wood);
    rib.position.set(-.55 + i * .275, .08, 0); rib.rotation.y = Math.PI / 2; g.add(rib);
  }
  bushes(g, 22, 0, .08, 0, 1.0, .5, 11);
  add(g, new THREE.BoxGeometry(1.0, .015, .03), M.grow, 0, .44, 0, {cast: false});
  const pl = new THREE.PointLight(0xff6ad5, .9, 1.6, 2); pl.position.set(0, .3, 0); g.add(pl);
  return g;
}

// Ангар: белая капсула с полосой акцента, открытые ворота, внутри маленький корабль, посадочная площадка
export function angar(accent = 0x45c8ff) {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(.75, .75, .06, 40), M.trim, 0, .03, 0);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(g, new THREE.SphereGeometry(.03, 8, 6), M.neon, Math.cos(a) * .7, .07, Math.sin(a) * .7, {cast: false}); }
  add(g, rb(1.05, .62, 1.0, .25), M.panel, 0, .37, -.15);
  add(g, rb(1.07, .1, 1.02, .05), acc(accent), 0, .5, -.15, {cast: false});
  add(g, new THREE.PlaneGeometry(.72, .42), new THREE.MeshStandardMaterial({color: 0x0d1424, emissive: 0x16304a, emissiveIntensity: .8}), 0, .3, .356, {cast: false});
  add(g, new THREE.BoxGeometry(.72, .02, .02), M.neon, 0, .52, .36, {cast: false});
  // кораблик
  add(g, rb(.22, .14, .5, .05), acc(0xffffff), 0, .16, .62);
  add(g, new THREE.ConeGeometry(.08, .2, 16), acc(accent), 0, .16, .95, {rx: Math.PI / 2});
  add(g, new THREE.BoxGeometry(.5, .02, .12), acc(accent), 0, .13, .58);
  add(g, new THREE.SphereGeometry(.05, 12, 8), M.neon, 0, .16, .35, {cast: false});
  return g;
}
