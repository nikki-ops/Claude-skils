// Three.js look test: depot + procedural steam locomotive + 3D toon character. Everything is code (no downloaded assets).
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8a96a8);
scene.fog = new THREE.Fog(0x6a7080, 10, 40);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.35;

// ---------- procedural canvas textures ----------
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
function canvasTex(w, h, draw, rep = [1, 1], color = true) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace; return t;
}
const noise = (g, w, h, a, n = 4000, col = "0,0,0") => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${col},${rnd() * a})`; const s = 1 + rnd() * 3; g.fillRect(rnd() * w, rnd() * h, s, s); } };
const brick = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#b9b0a4"; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 16; r++) for (let c = -1; c < 8; c++) {
    const x = c * 64 + (r % 2) * 32, y = r * 32; const v = 0.75 + rnd() * 0.35;
    g.fillStyle = `rgb(${150 * v | 0},${68 * v | 0},${50 * v | 0})`; g.fillRect(x + 3, y + 3, 58, 26);
  }
  noise(g, w, h, 0.25, 9000);
}, [6, 3]);
const concrete = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#7d7a74"; g.fillRect(0, 0, w, h); noise(g, w, h, 0.18, 20000); noise(g, w, h, 0.1, 3000, "255,255,255");
  g.strokeStyle = "rgba(40,36,30,0.35)"; g.lineWidth = 3; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(0, i * 128); g.lineTo(w, i * 128); g.stroke(); g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, h); g.stroke(); }
  for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(30,24,18,${0.05 + rnd() * 0.12})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 20 + rnd() * 60, 10 + rnd() * 30, rnd() * 3, 0, 7); g.fill(); }
}, [8, 8]);
const metalRough = canvasTex(256, 256, (g, w, h) => { g.fillStyle = "#777"; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.12})`; g.fillRect(0, y, w, 1); } noise(g, w, h, 0.3, 3000); }, [4, 1], false);
const wood = canvasTex(512, 128, (g, w, h) => { for (let i = 0; i < 8; i++) { const v = 0.8 + rnd() * 0.3; g.fillStyle = `rgb(${120 * v | 0},${82 * v | 0},${52 * v | 0})`; g.fillRect(0, i * 16, w, 16); g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, i * 16, w, 1.5); } noise(g, w, h, 0.15, 4000); }, [1, 1]);
const denim = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "#2f4f86"; g.fillRect(0, 0, w, h); for (let i = -h; i < w; i += 3) { g.strokeStyle = `rgba(255,255,255,${0.05 + rnd() * 0.06})`; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } }, [3, 3]);

// ---------- materials ----------
const M = {
  iron: new THREE.MeshStandardMaterial({ color: 0x2a2c30, metalness: 0.85, roughness: 0.38, roughnessMap: metalRough }),
  ironLight: new THREE.MeshStandardMaterial({ color: 0x6d7078, metalness: 0.9, roughness: 0.3, roughnessMap: metalRough }),
  red: new THREE.MeshStandardMaterial({ color: 0xc8231e, metalness: 0.3, roughness: 0.45 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xc9a14a, metalness: 1, roughness: 0.25 }),
  brick: new THREE.MeshStandardMaterial({ map: brick, roughness: 0.9 }),
  floor: new THREE.MeshStandardMaterial({ map: concrete, roughness: 0.85 }),
  wood: new THREE.MeshStandardMaterial({ map: wood, roughness: 0.8 }),
  steel: new THREE.MeshStandardMaterial({ color: 0x9a9ea6, metalness: 1, roughness: 0.25 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xdfe8f2, emissive: 0xcfe0f5, emissiveIntensity: 1.3, roughness: 0.2 }),
};
const add = (geo, mat, x = 0, y = 0, z = 0, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; scene.add(m); return m; };

// ---------- depot ----------
add(new THREE.PlaneGeometry(80, 80), M.floor).rotation.x = -Math.PI / 2;
const back = add(new THREE.BoxGeometry(60, 14, 0.6), M.brick, 0, 7, -9);
for (let i = -5; i <= 5; i++) {               // tall windows with iron mullions
  const x = i * 4.2; add(new THREE.PlaneGeometry(2.4, 6), M.glass, x, 6.5, -8.68, false);
  for (let k = 0; k < 3; k++) add(new THREE.BoxGeometry(2.5, 0.08, 0.08), M.iron, x, 4.5 + k * 2, -8.6, false);
  for (let k = -1; k <= 1; k++) add(new THREE.BoxGeometry(0.08, 6, 0.08), M.iron, x + k * 0.8, 6.5, -8.6, false);
}
for (let i = -6; i <= 6; i++) add(new THREE.BoxGeometry(0.4, 0.5, 30), M.iron, i * 4.2, 12.5, 4, false);   // roof trusses
// rails + sleepers
for (const z of [-0.72, 0.72]) add(new THREE.BoxGeometry(40, 0.16, 0.1), M.steel, 0, 0.18, z);
for (let i = -30; i <= 30; i++) add(new THREE.BoxGeometry(0.35, 0.12, 2.4), M.wood, i * 0.65, 0.06, 0);

// ---------- locomotive (boiler along x) ----------
const loco = new THREE.Group(); scene.add(loco); loco.position.set(-1.0, 0, 0);
const L = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; loco.add(m); return m; };
const boiler = L(new THREE.CylinderGeometry(1.05, 1.05, 7.0, 48), M.iron, 0.6, 2.35, 0); boiler.rotation.z = Math.PI / 2;
for (let k = 0; k < 6; k++) { const b = L(new THREE.TorusGeometry(1.06, 0.035, 8, 64), M.ironLight, -2.4 + k * 1.2, 2.35, 0); b.rotation.y = Math.PI / 2; }   // boiler bands
const rivetG = new THREE.SphereGeometry(0.03, 6, 4), rivets = new THREE.InstancedMesh(rivetG, M.ironLight, 600); let ri = 0; const mtx = new THREE.Matrix4();
for (let k = 0; k < 12; k++) for (let a = 0; a < 48; a++) { const ang = a / 48 * Math.PI * 2, x = -2.7 + k * 0.6; if (ri < 600) rivets.setMatrixAt(ri++, mtx.makeTranslation(x - 1.0, 2.35 + Math.sin(ang) * 1.07, Math.cos(ang) * 1.07)); }
rivets.castShadow = true; scene.add(rivets);
const smoke = L(new THREE.CylinderGeometry(1.12, 1.12, 1.2, 48), M.iron, 4.6, 2.35, 0); smoke.rotation.z = Math.PI / 2;
const door = L(new THREE.CylinderGeometry(0.85, 0.9, 0.12, 48), M.iron, 5.25, 2.35, 0); door.rotation.z = Math.PI / 2;
const hub = L(new THREE.SphereGeometry(0.16, 16, 12), M.steel, 5.33, 2.35, 0);
L(new THREE.CylinderGeometry(0.32, 0.4, 1.1, 32), M.iron, 4.5, 3.75, 0);          // chimney
L(new THREE.CylinderGeometry(0.42, 0.32, 0.12, 32), M.iron, 4.5, 4.32, 0);
L(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.brass, 1.4, 3.3, 0);   // brass dome
L(new THREE.CylinderGeometry(0.22, 0.26, 0.5, 24), M.brass, -0.6, 3.5, 0);         // safety valve
L(new THREE.BoxGeometry(8.6, 0.35, 2.3), M.red, 0.4, 1.15, 0);                      // red running board / frame
L(new THREE.BoxGeometry(0.3, 0.6, 2.4), M.red, 5.55, 1.0, 0);                       // buffer beam
for (const z of [-0.75, 0.75]) { const bf = L(new THREE.CylinderGeometry(0.14, 0.14, 0.5, 16), M.steel, 5.9, 1.0, z); bf.rotation.z = Math.PI / 2; L(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 24), M.steel, 6.15, 1.0, z).rotation.z = Math.PI / 2; }
L(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffd98a, emissiveIntensity: 2 }), 5.4, 3.55, 0);   // head lamp
// cab
L(new THREE.BoxGeometry(2.2, 2.6, 2.5), M.iron, -3.6, 2.6, 0);
L(new THREE.BoxGeometry(2.5, 0.12, 2.8), M.iron, -3.6, 3.96, 0);
for (const z of [-1.26, 1.26]) L(new THREE.PlaneGeometry(0.8, 0.7), M.glass, -3.3, 3.1, z).rotation.y = z > 0 ? 0 : Math.PI;
// wheels: big red drivers with spokes + small leading wheels
function wheel(x, r, z) {
  const g = new THREE.Group(); g.position.set(x, r + 0.05, z); loco.add(g);
  const tire = new THREE.Mesh(new THREE.TorusGeometry(r - 0.05, 0.07, 12, 48), M.steel); g.add(tire);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.14, 0.06, 10, 48), M.red); g.add(rim);
  for (let s = 0; s < 14; s++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.06, r - 0.2, 0.06), M.red); sp.position.set(Math.cos(s / 14 * Math.PI * 2) * (r - 0.2) / 2, Math.sin(s / 14 * Math.PI * 2) * (r - 0.2) / 2, 0); sp.rotation.z = s / 14 * Math.PI * 2 - Math.PI / 2; g.add(sp); }
  const hb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.2, 20), M.red); hb.rotation.x = Math.PI / 2; g.add(hb);
  g.traverse((m) => { m.castShadow = m.receiveShadow = true; }); return g;
}
for (const z of [-1.0, 1.0]) { for (const x of [-1.9, 0.0, 1.9]) wheel(x, 0.95, z); for (const x of [3.6, 4.6]) wheel(x, 0.45, z); }
const rod = L(new THREE.BoxGeometry(3.9, 0.1, 0.06), M.steel, 0.0, 0.75, 1.12);   // coupling rod
const cyl = L(new THREE.CylinderGeometry(0.38, 0.38, 1.2, 24), M.iron, 3.3, 1.1, 1.05); cyl.rotation.z = Math.PI / 2;

// ---------- 3D toon character (sphere head with painted face, cap, denim body, tube limbs) ----------
function faceTex(kind) {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = "#f2c9a0"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1e1418"; g.strokeStyle = "#1e1418"; g.lineCap = "round";
    // face drawn on the front quarter (u ~ 0.25 is +z when sphere default)
    const cx = w * 0.25, cy = h * 0.52;
    g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 52, cy - 38); g.lineTo(cx - 14, cy - 26); g.stroke(); g.beginPath(); g.moveTo(cx + 52, cy - 38); g.lineTo(cx + 14, cy - 26); g.stroke();
    g.beginPath(); g.ellipse(cx - 30, cy - 6, 11, 14, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx + 30, cy - 6, 11, 14, 0, 0, 7); g.fill();
    g.fillStyle = "#fff"; g.beginPath(); g.arc(cx - 27, cy - 10, 4, 0, 7); g.fill(); g.beginPath(); g.arc(cx + 33, cy - 10, 4, 0, 7); g.fill();
    g.fillStyle = "#1e1418"; g.beginPath(); g.moveTo(cx - 28, cy + 34); g.quadraticCurveTo(cx, cy + 56, cx + 32, cy + 28); g.lineWidth = 8; g.stroke();
    g.fillStyle = "rgba(230,120,110,0.35)"; g.beginPath(); g.ellipse(cx - 56, cy + 22, 16, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(cx + 56, cy + 22, 16, 9, 0, 0, 7); g.fill();
  });
}
function toon({ x, z, rotY = 0, cap = 0x3a5fa8, body = denim }) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; scene.add(g);
  const skin = new THREE.MeshStandardMaterial({ map: faceTex(), roughness: 0.55 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 48, 32), skin); head.position.y = 1.62; head.scale.set(1.15,1.1,1.05); g.add(head);
  const capM = new THREE.MeshStandardMaterial({ color: cap, roughness: 0.6 });
  const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.3), capM); c1.position.y = 1.74; c1.scale.set(1, 0.62, 1); g.add(c1);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24, 1, false, -Math.PI / 2, Math.PI), capM); brim.position.set(0, 1.76, 0.36); brim.scale.set(1.25, 1, 1.0); g.add(brim);
  const jacket = new THREE.MeshStandardMaterial({ map: body, roughness: 0.85 });
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.42, 8, 24), jacket); torso.position.y = 0.95; torso.scale.set(1, 1, 0.8); g.add(torso);
  const limb = new THREE.MeshStandardMaterial({ color: 0x1c2233, roughness: 0.6 });
  const tube = (pts, r = 0.045) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), 24, r, 10), limb); g.add(m); return m; };
  tube([[-0.12, 0.6, 0], [-0.15, 0.32, 0.05], [-0.17, 0.02, 0.02]]); tube([[0.12, 0.6, 0], [0.16, 0.3, -0.04], [0.2, 0.02, 0.0]]);
  tube([[-0.24, 1.15, 0], [-0.42, 0.95, 0.12], [-0.5, 0.75, 0.3]], 0.04); tube([[0.24, 1.15, 0], [0.5, 1.3, 0.2], [0.62, 1.62, 0.35]], 0.04);   // right arm raised (pointing)
  for (const sx of [-0.17, 0.2]) { const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 8), limb); shoe.position.set(sx, 0.04, 0.06); shoe.scale.set(1, 0.6, 1.6); g.add(shoe); }
  g.traverse((m) => { m.castShadow = m.receiveShadow = true; }); return g;
}
// toon({ x: 3.4, z: 2.9, rotY: 0.75 });
// toon({ x: 5.6, z: 1.6, rotY: 1.1, cap: 0x8a3a2a });

// ---------- lights ----------
scene.add(new THREE.HemisphereLight(0xcfdcf0, 0x4a3a2c, 0.35));
const sun = new THREE.DirectionalLight(0xffe6c4, 4.0); sun.position.set(10, 12, 6); sun.target.position.set(1, 0, 0);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 }); sun.shadow.bias = -0.0004; sun.shadow.radius = 4;
scene.add(sun, sun.target);
const warm = new THREE.PointLight(0xffb070, 18, 12, 1.6); warm.position.set(6.2, 3.4, 2.2); scene.add(warm);

// ---------- camera: low 3/4 view on the smokebox ----------
const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
cam.position.set(9.0, 1.6, 7.5); cam.lookAt(1.4, 2.0, 0.2);
renderer.render(scene, cam);
window.DONE = true;
