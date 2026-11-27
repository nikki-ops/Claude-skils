// Мир нового города: детальные дома и рельеф (река, мост, озеро, горы, вулкан). ES-модуль для Three.js r160.
// import { makeHouse, makeWorld } from '/render/novyy-gorod/mir.js'
let SEED = 7; const rnd = () => ((SEED = (SEED * 16807) % 2147483647) - 1) / 2147483646;
const hashStr = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.codePointAt(0), 16777619); return h >>> 0; };
function ctex(THREE, w, h, draw, o = {}) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (o.px) { t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestMipmapLinearFilter; } if (o.rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.rep[0], o.rep[1]); } t.anisotropy = 8; return t; }
const WALLS = ['#f2e2c4', '#f6d8d0', '#dfe9f2', '#e8f0d8', '#f4ead0', '#e9dccf', '#d8e4f0', '#f0d9b8'];
const ROOFS = ['#c8503a', '#3e6fb8', '#4f8a3a', '#7a4a9a', '#2f3a48', '#b8742a', '#2a8a80', '#a83a5a'];
const SHUT = ['#2f6fb8', '#3a8a3a', '#a83a3a', '#5a3a20', '#e8b830', '#2a2a2a'];
const texCache = {};
function tx(THREE, key, f) { return texCache[key] || (texCache[key] = f()); }
// стены: штукатурка / доска / кирпич
function wallTex(THREE, col, kind) {
  return tx(THREE, 'w' + col + kind, () => ctex(THREE, 256, 256, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    if (kind === 0) { for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(${rnd() < .5 ? 0 : 255},${rnd() < .5 ? 0 : 255},${rnd() < .5 ? 0 : 255},.035)`; x.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 3, 2 + rnd() * 3); } }
    if (kind === 1) { for (let y = 0; y < h; y += 21) { x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, y, w, 3); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, y + 3, w, 2); } }
    if (kind === 2) { for (let r = 0; r < 16; r++) for (let c = 0; c < 8; c++) { const ox = (r % 2) * 16; x.fillStyle = `hsl(${12 + rnd() * 10},${45 + rnd() * 15}%,${42 + rnd() * 12}%)`; x.fillRect(c * 32 + ox - 16, r * 16, 30, 14); } }
  }, { rep: [1, 1] }));
}
function roofTex(THREE, col) {
  return tx(THREE, 'r' + col, () => ctex(THREE, 256, 256, (x, w, h) => {
    x.fillStyle = col; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 12; r++) for (let c = 0; c < 9; c++) { const ox = (r % 2) * 14; x.fillStyle = `rgba(0,0,0,${.08 + rnd() * .12})`; x.beginPath(); x.arc(c * 28 + ox, r * 22 + 20, 14, 0, Math.PI); x.fill(); x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 2; x.stroke(); }
  }, { rep: [2, 2] }));
}
// ---------- Дом ----------
// opts: { nick, floors(1|2), porch(bool), seed } — вид детерминирован ником.
export function makeHouse(THREE, opts = {}) {
  const h = hashStr(opts.nick || 'дом'), pick = (arr, k) => arr[(h >>> k) % arr.length];
  const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const g = new THREE.Group();
  const floors = opts.floors || (1 + ((h >>> 3) % 2)), Wd = 3.4, D = 3.0, FH = 1.55, WH = floors * FH;
  const wallKind = (h >>> 5) % 3, wallCol = wallKind === 2 ? '#c06a4a' : pick(WALLS, 7), roofCol = pick(ROOFS, 11), shut = pick(SHUT, 15);
  const add = (geo, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  // цоколь
  add(new THREE.BoxGeometry(Wd + .3, .35, D + .3), L(0x8a8078), 0, .17, 0);
  // стены
  const wm = L(0xffffff, { map: wallTex(THREE, wallCol, wallKind) });
  add(new THREE.BoxGeometry(Wd, WH, D), wm, 0, .35 + WH / 2, 0);
  // угловые доски
  const trim = L(0xf6f2ea);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.BoxGeometry(.14, WH, .14), trim, sx * Wd / 2, .35 + WH / 2, sz * D / 2);
  if (floors === 2) add(new THREE.BoxGeometry(Wd + .08, .12, D + .08), trim, 0, .35 + FH, 0);
  // окна: рама, стекло с бликом, ставни, подоконник с цветами
  const glass = new THREE.MeshLambertMaterial({ color: 0x9fd4f0, emissive: 0x223344 }), shm = L(shut), flowers = [0xff5a7a, 0xffd23a, 0xff8a3d, 0xffffff, 0xb48cff];
  const win = (x, y, z, ry) => { const wg = new THREE.Group(); wg.position.set(x, y, z); wg.rotation.y = ry; g.add(wg);
    const a = (geo, mat, px, py, pz) => { const m = new THREE.Mesh(geo, mat); m.position.set(px, py, pz); m.castShadow = true; wg.add(m); return m; };
    a(new THREE.BoxGeometry(.78, .9, .06), trim, 0, 0, .02); a(new THREE.BoxGeometry(.62, .74, .04), glass, 0, 0, .05);
    a(new THREE.BoxGeometry(.05, .74, .05), trim, 0, 0, .08); a(new THREE.BoxGeometry(.62, .05, .05), trim, 0, 0, .08);
    for (const s of [-1, 1]) a(new THREE.BoxGeometry(.28, .9, .05), shm, s * .55, 0, .04);
    a(new THREE.BoxGeometry(.9, .07, .22), trim, 0, -.49, .1); a(new THREE.BoxGeometry(.8, .16, .2), L(0x8a5a32), 0, -.58, .14);
    for (let k = 0; k < 5; k++) a(new THREE.SphereGeometry(.07, 6, 5), L(flowers[(h + k) % flowers.length]), -.3 + k * .15, -.47, .17); };
  for (let f = 0; f < floors; f++) { const y = .35 + FH * f + FH * .55;
    if (f === 0) win(.95, y, D / 2 + .01, 0); else { win(-.85, y, D / 2 + .01, 0); win(.85, y, D / 2 + .01, 0); }
    win(-.6, y, -D / 2 - .01, Math.PI); win(Wd / 2 + .01, y, 0, Math.PI / 2); win(-Wd / 2 - .01, y, 0, -Math.PI / 2); }
  // дверь: рама, ручка, ступенька, фонарь
  const doorCol = (h >>> 19) % 2 ? 0x6a4326 : new THREE.Color(shut).getHex();
  add(new THREE.BoxGeometry(.85, 1.25, .08), trim, -.7, .35 + .62, D / 2 + .02); add(new THREE.BoxGeometry(.68, 1.12, .07), L(doorCol), -.7, .35 + .58, D / 2 + .05);
  add(new THREE.SphereGeometry(.05, 8, 6), L(0xe8c040), -.45, .35 + .55, D / 2 + .1);
  add(new THREE.BoxGeometry(1.1, .16, .5), L(0x9a928a), -.7, .08, D / 2 + .3);
  const lamp = add(new THREE.BoxGeometry(.14, .2, .14), new THREE.MeshBasicMaterial({ color: 0xfff0b0 }), -.1, .35 + 1.15, D / 2 + .1);
  // крыльцо-навес
  if (opts.porch ?? ((h >>> 21) % 2)) { add(new THREE.BoxGeometry(1.3, .07, .8), L(roofCol), -.7, .35 + 1.42, D / 2 + .38); for (const s of [-1, 1]) add(new THREE.CylinderGeometry(.04, .04, 1.42, 6), trim, -.7 + s * .55, .35 + .71, D / 2 + .7); }
  // крыша: два ската со свесом + фронтоны + конёк
  const top = .35 + WH, RH = 1.35, over = .35, rl = Math.hypot(Wd / 2 + over, RH), ang = Math.atan2(RH, Wd / 2 + over), rm = L(0xffffff, { map: roofTex(THREE, roofCol) });
  for (const s of [-1, 1]) { const r = add(new THREE.BoxGeometry(rl, .12, D + over * 2), rm, s * (Wd / 4 + over / 2) * .98, top + RH / 2 - .02, 0); r.rotation.z = -s * ang; }
  const gs = new THREE.Shape(); gs.moveTo(-Wd / 2, 0); gs.lineTo(Wd / 2, 0); gs.lineTo(0, RH); gs.closePath();
  for (const s of [-1, 1]) { const m = add(new THREE.ShapeGeometry(gs), wm, 0, top, s * D / 2); m.rotation.y = s > 0 ? 0 : Math.PI; }
  add(new THREE.CylinderGeometry(.07, .07, D + over * 2, 8), L(0x5a3a28), 0, top + RH + .02, 0).rotation.x = Math.PI / 2;
  // круглое окошко на фронтоне
  add(new THREE.CircleGeometry(.22, 16), glass, 0, top + RH * .42, D / 2 + .02);
  // труба
  add(new THREE.BoxGeometry(.38, 1.1, .38), L(0x9a5a40), Wd * .25, top + RH * .7, -D * .15);
  add(new THREE.BoxGeometry(.48, .1, .48), L(0x6a3a28), Wd * .25, top + RH * .7 + .55, -D * .15);
  // забор, дорожка, почтовый ящик с ником, кусты
  const fence = L(0xf6f2ea), FZ = D / 2 + 1.5;
  for (let i = -6; i <= 6; i++) { if (Math.abs(i) <= 1) continue; add(new THREE.BoxGeometry(.1, .6, .06), fence, i * .32, .3, FZ); }
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(1.6, .06, .05), fence, s * 1.25, .45, FZ);
  add(new THREE.BoxGeometry(.6, .03, 1.5), L(0xc8b89a), -.7, .02, D / 2 + 1.05);
  add(new THREE.CylinderGeometry(.05, .05, .9, 6), L(0x5a3a28), 1.6, .45, FZ + .25); const mb = add(new THREE.BoxGeometry(.32, .24, .4), L(0x2f6fb8), 1.6, .95, FZ + .25);
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) add(new THREE.SphereGeometry(.32 + rnd() * .12, 10, 8), L(0x3f8a2e), s * (Wd / 2 + .4), .3, D / 2 - .4 - k * 1.2);
  g.userData = { top: top + RH, lamp, mailbox: mb, nickY: top + RH + .6 };
  return g;
}
// ---------- Рельеф ----------
// Высота: равнина города в центре, холмы вокруг, горы на севере, вулкан на северо-востоке, русло реки с юго-запада на северо-восток.
export const RIVER = (z) => 22 + Math.sin(z * .045) * 9; // x-координата оси реки при данном z
export function height(x, z) {
  const d = Math.hypot(x, z);
  let y = Math.sin(x * .05) * Math.cos(z * .045) * 1.2 * Math.min(1, d / 40);
  if (d > 55) y += Math.pow((d - 55) / 50, 1.6) * 3 * (1 + Math.sin(x * .07 + z * .03));
  if (z < -80) y += Math.pow((-z - 80) / 35, 1.4) * (7 + 5 * Math.sin(x * .04));
  const vx = 70, vz = -95, vd = Math.hypot(x - vx, z - vz); if (vd < 38) y = Math.max(y, 34 * (1 - vd / 38) - (vd < 5 ? (5 - vd) * 2.2 : 0));
  if (d < (globalThis.CITY_R||30)) y *= .03; else if (d < (globalThis.CITY_R||30)+15) y *= .03+.97*(d-(globalThis.CITY_R||30))/15; // ровная площадка под город растёт вместе с городом
  const rd = Math.abs(x - RIVER(z)); if (rd < 7) y = Math.min(y, -1.4 * (1 - rd / 7) * (1 - rd / 7) + y * (rd / 7)); // русло реки
  return y;
}
export function makeWorld(THREE, sc, opts = {}) {
  const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  // земля с цветом по высоте
  const g = new THREE.PlaneGeometry(400, 400, 260, 260); g.rotateX(-Math.PI / 2); const p = g.attributes.position, col = [], c = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = height(x, z); p.setY(i, y);
    const vd = Math.hypot(x - 70, z + 95), n = Math.sin(x * .9) * Math.cos(z * .8) * .5 + .5;
    if (vd < 38 && y > 6) c.setHSL(.04, .25, .22 + .1 * (y / 34)); else if (y > 12) c.setHSL(.3, .15, .5 + n * .05); else if (y > 6) c.setHSL(.27, .45, .38 + n * .04); else if (y < -.5) c.setHSL(.12, .35, .55); else c.setHSL(.26 + n * .02, .6, .44 + n * .05);
    col.push(c.r, c.g, c.b); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const ground = new THREE.Mesh(g, L(0xffffff, { vertexColors: true })); ground.receiveShadow = true; sc.add(ground);
  // вода реки: лента по оси с бликами
  const pts = []; for (let z = -200; z <= 200; z += 4) pts.push(new THREE.Vector3(RIVER(z), -.25, z));
  const wg = new THREE.BufferGeometry(), pos = [], idx = [];
  pts.forEach((q, i) => { pos.push(q.x - 4.5, q.y, q.z, q.x + 4.5, q.y, q.z); if (i) { const a = i * 2; idx.push(a - 2, a - 1, a, a - 1, a + 1, a); } });
  wg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); wg.setIndex(idx); wg.computeVertexNormals();
  const water = new THREE.Mesh(wg, new THREE.MeshPhongMaterial({ color: 0x3a9ae0, shininess: 90, specular: 0xbfe8ff, transparent: true, opacity: .92, side: THREE.DoubleSide })); sc.add(water);
  // мост через реку у города
  const bz = 0, bx = RIVER(bz), bridge = new THREE.Group(); bridge.position.set(bx, 0, bz); sc.add(bridge);
  const wood = L(0x8a5a32); for (let i = -6; i <= 6; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.5, .14, 3), wood); m.position.set(i * .55, .45 + Math.cos(i / 6 * Math.PI / 2) * .5, 0); m.castShadow = true; bridge.add(m); }
  for (const s of [-1, 1]) for (let i = -6; i <= 6; i += 2) { const m = new THREE.Mesh(new THREE.BoxGeometry(.12, .8, .12), wood); m.position.set(i * .55, .85 + Math.cos(i / 6 * Math.PI / 2) * .5, s * 1.4); bridge.add(m); }
  // вулкан: кратер с лавой, свечение, дым
  const lava = new THREE.Mesh(new THREE.CircleGeometry(4.2, 24), new THREE.MeshBasicMaterial({ color: 0xff5a1a })); lava.rotation.x = -Math.PI / 2; lava.position.set(70, 23.5, -95); sc.add(lava);
  const glow = new THREE.PointLight(0xff6a2a, 30, 60, 1.6); glow.position.set(70, 28, -95); sc.add(glow);
  const smoke = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 8), new THREE.MeshLambertMaterial({ color: 0x8a8a90, transparent: true, opacity: .6, depthWrite: false })); sc.add(m); smoke.push({ m, ph: i / 14 }); }
  // лавовые потоки по склону
  for (let k = 0; k < 3; k++) { const pts2 = []; for (let i = 0; i <= 20; i++) { const t = i / 20, a = -1.9 + k * .5, r = 4 + t * 30; const x = 70 + Math.cos(a) * r, z = -95 + Math.sin(a) * r * .9; pts2.push(new THREE.Vector3(x, height(x, z) + .3, z)); }
    sc.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 40, .7, 6), new THREE.MeshBasicMaterial({ color: 0xff7a2a }))); }
  // лес: деревья по холмам, не на реке и не в городе
  const leaf = [0x3f8a2e, 0x4f9a3a, 0x2f7a2e, 0x5aa040], trunk = L(0x6d4a2e);
  for (let i = 0; i < 260; i++) { const a = rnd() * Math.PI * 2, r = 34 + rnd() * 120, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x - RIVER(z)) < 8 || Math.hypot(x, z) < (globalThis.CITY_R||0) + 8 || Math.hypot(x - 70, z + 95) < 36 || height(x, z) > 18) continue;
    const t = new THREE.Group(), s = .8 + rnd() * .9, y = height(x, z); const tr = new THREE.Mesh(new THREE.CylinderGeometry(.2 * s, .3 * s, 2.4 * s, 6), trunk); tr.position.y = 1.2 * s; t.add(tr);
    if (rnd() < .5) { for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry((1.2 + rnd() * .5) * s, 10, 8), L(leaf[(i + k) % 4])); b.position.set((rnd() - .5) * 1.4 * s, (2.8 + rnd()) * s, (rnd() - .5) * s); b.castShadow = true; t.add(b); } }
    else { for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.ConeGeometry((1.5 - k * .35) * s, 1.6 * s, 8), L(0x2f6a32)); b.position.y = (2 + k * .9) * s; b.castShadow = true; t.add(b); } }
    t.position.set(x, y, z); sc.add(t); }
  // озеро на западе
  const lake = new THREE.Mesh(new THREE.CircleGeometry(13, 32), new THREE.MeshPhongMaterial({ color: 0x3a9ae0, shininess: 90, specular: 0xbfe8ff })); lake.rotation.x = -Math.PI / 2; lake.position.set(-60, .15, 25); lake.scale.set(1, 1.3, 1); sc.add(lake);
  return { tick: (t) => { smoke.forEach((s) => { const k = (t * .12 + s.ph) % 1; s.m.position.set(70 + Math.sin(k * 6 + s.ph * 9) * 3 * k, 26 + k * 34, -95 - k * 8); s.m.scale.setScalar(.6 + k * 2.6); s.m.material.opacity = .65 * (1 - k); }); lava.material.color.setHSL(.04, 1, .5 + .06 * Math.sin(t * 3)); glow.intensity = 26 + 8 * Math.sin(t * 2.3); } };
}
