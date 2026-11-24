import * as THREE from "three";
import { mulberry } from "../components/rand";

const cache: Record<string, THREE.Texture> = {};
const make = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, srgb = true, repeat = true) => {
  if (cache[key]) return cache[key];
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d")!;
  draw(g, mulberry(key.length * 7919 + key.charCodeAt(0)));
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  cache[key] = t;
  return t;
};

// soil detail: clods, pebbles, straw (grey-ish, multiplied by vertex colour)
export const soilTex = () =>
  make("soil", 1024, 1024, (g, r) => {
    g.fillStyle = "#9a9a9a";
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 9000; i++) {
      const x = r() * 1024, y = r() * 1024, s = 1 + r() * r() * 14;
      const v = 90 + r() * 120;
      g.fillStyle = `rgba(${v},${v * 0.97},${v * 0.92},${0.25 + r() * 0.5})`;
      g.beginPath();
      g.ellipse(x, y, s, s * (0.6 + r() * 0.5), r() * 3, 0, Math.PI * 2);
      g.fill();
      // clod shadow
      if (s > 6) {
        g.fillStyle = "rgba(30,30,30,0.35)";
        g.beginPath(); g.ellipse(x + s * 0.3, y + s * 0.35, s * 0.9, s * 0.5, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = `rgba(${v + 30},${v + 28},${v + 22},0.6)`;
        g.beginPath(); g.ellipse(x - s * 0.2, y - s * 0.25, s * 0.6, s * 0.4, 0, 0, Math.PI * 2); g.fill();
      }
    }
    for (let i = 0; i < 260; i++) {
      const x = r() * 1024, y = r() * 1024, l = 6 + r() * 20, a = r() * Math.PI;
      g.strokeStyle = `rgba(${200 + r() * 40},${180 + r() * 30},${120},${0.5})`;
      g.lineWidth = 1 + r();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 400; i++) {
      const x = r() * 1024, y = r() * 1024, s = 1.5 + r() * 4;
      g.fillStyle = `rgba(${170 + r() * 60},${170 + r() * 50},${165 + r() * 40},0.9)`;
      g.beginPath(); g.arc(x, y, s, 0, Math.PI * 2); g.fill();
    }
  }, true);

// weathered grey planks (vertical grain)
export const woodTex = () =>
  make("wood", 256, 1024, (g, r) => {
    g.fillStyle = "#8d8a82";
    g.fillRect(0, 0, 256, 1024);
    for (let i = 0; i < 140; i++) {
      const x = r() * 256, w = 0.5 + r() * 2.5;
      const v = 80 + r() * 90;
      g.strokeStyle = `rgba(${v},${v * 0.96},${v * 0.9},${0.25 + r() * 0.4})`;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x, 0);
      for (let y = 0; y <= 1024; y += 64) g.lineTo(x + Math.sin(y * 0.01 + i) * 4, y);
      g.stroke();
    }
    for (let i = 0; i < 6; i++) {
      // knots
      const x = r() * 256, y = r() * 1024;
      g.fillStyle = "rgba(50,40,30,0.6)";
      g.beginPath(); g.ellipse(x, y, 6 + r() * 6, 10 + r() * 10, 0, 0, Math.PI * 2); g.fill();
    }
    for (let i = 0; i < 40; i++) {
      // lichen / dirt patches
      const x = r() * 256, y = r() * 1024;
      g.fillStyle = r() < 0.5 ? "rgba(140,150,110,0.25)" : "rgba(40,35,30,0.25)";
      g.beginPath(); g.ellipse(x, y, 8 + r() * 30, 8 + r() * 40, 0, 0, Math.PI * 2); g.fill();
    }
  });

// old dark logs (grain along u)
export const logTex = () =>
  make("log", 1024, 256, (g, r) => {
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#5a4a3a"); gr.addColorStop(0.5, "#7a6550"); gr.addColorStop(1, "#4d3f31");
    g.fillStyle = gr;
    g.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 220; i++) {
      const y = r() * 256, v = 50 + r() * 70;
      g.strokeStyle = `rgba(${v},${v * 0.85},${v * 0.7},${0.3 + r() * 0.4})`;
      g.lineWidth = 0.5 + r() * 2;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3);
      g.stroke();
    }
    for (let i = 0; i < 30; i++) {
      // drying cracks
      const x = r() * 1024, y = r() * 256, l = 40 + r() * 200;
      g.strokeStyle = "rgba(20,14,10,0.8)"; g.lineWidth = 1 + r() * 2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y + (r() - 0.5) * 8); g.stroke();
    }
  });

// warm interior seen through a window: lamp glow, lace half-curtains, geraniums on the sill
export const windowTex = () =>
  make("window", 256, 384, (g, r) => {
    const gr = g.createRadialGradient(128, 150, 10, 128, 180, 260);
    gr.addColorStop(0, "#fff1c4"); gr.addColorStop(0.3, "#ffb860"); gr.addColorStop(1, "#7a3510");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 384);
    // hanging lamp shade
    g.fillStyle = "rgba(255,250,220,1)";
    g.beginPath(); g.ellipse(150, 90, 34, 14, 0, 0, Math.PI * 2); g.fill();
    // lace half curtains on the lower half
    for (const side of [0, 1]) {
      const x0 = side ? 136 : 0, x1 = side ? 256 : 120;
      g.fillStyle = "rgba(255,245,225,0.55)";
      g.fillRect(x0, 200, x1 - x0, 140);
      g.strokeStyle = "rgba(160,90,40,0.5)";
      for (let i = 0; i < 30; i++) {
        g.beginPath(); g.arc(x0 + r() * (x1 - x0), 200 + r() * 140, 3 + r() * 6, 0, Math.PI * 2); g.stroke();
      }
      g.fillStyle = "rgba(255,245,225,0.7)";
      for (let x = x0; x < x1; x += 12) { g.beginPath(); g.arc(x + 6, 200, 6, 0, Math.PI); g.fill(); }
    }
    // geraniums silhouettes on the sill
    for (const cx of [60, 196]) {
      g.fillStyle = "#3a1a08"; g.fillRect(cx - 18, 330, 36, 40);
      g.fillStyle = "rgba(40,30,10,0.9)";
      for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(cx + (r() - 0.5) * 60, 300 + (r() - 0.5) * 40, 8 + r() * 8, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = "rgba(220,40,30,0.95)";
      for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(cx + (r() - 0.5) * 40, 280 + (r() - 0.5) * 20, 7, 0, Math.PI * 2); g.fill(); }
    }
  }, true, false);

export const windowDayTex = () =>
  make("windowDay", 256, 384, (g) => {
    const gr = g.createLinearGradient(0, 0, 256, 384);
    gr.addColorStop(0, "#9fb8c8"); gr.addColorStop(0.5, "#3c4a55"); gr.addColorStop(1, "#1d252c");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
    g.fillStyle = "rgba(255,250,240,0.6)"; g.fillRect(0, 200, 120, 140); g.fillRect(136, 200, 120, 140);
  }, true, false);

// carved platband (nalichnik): white-painted fretwork with alpha
export const nalichnikTex = () =>
  make("nal", 512, 768, (g) => {
    g.clearRect(0, 0, 512, 768);
    const W = "#e9e6dc", B = "#3c6ea0";
    // side boards
    g.fillStyle = W;
    g.fillRect(40, 230, 70, 470); g.fillRect(402, 230, 70, 470);
    // top pediment (kokoshnik)
    g.beginPath(); g.moveTo(20, 230); g.lineTo(492, 230); g.lineTo(470, 160); g.quadraticCurveTo(256, 20, 42, 160); g.closePath(); g.fill();
    // bottom board with scallops
    g.fillRect(20, 690, 472, 40);
    for (let x = 30; x < 490; x += 32) { g.beginPath(); g.arc(x + 16, 730, 16, 0, Math.PI); g.fill(); }
    // fretwork holes
    g.globalCompositeOperation = "destination-out";
    for (let y = 260; y < 680; y += 46) {
      for (const cx of [75, 437]) {
        g.beginPath(); g.ellipse(cx, y, 12, 18, 0, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(cx, y + 24); g.lineTo(cx - 8, y + 34); g.lineTo(cx + 8, y + 34); g.fill();
      }
    }
    for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.0875); g.beginPath(); g.ellipse(256 + Math.cos(a) * 150, 205 - Math.sin(a) * 95, 9, 18, -a + Math.PI / 2, 0, Math.PI * 2); g.fill(); }
    g.globalCompositeOperation = "source-over";
    // painted sun rosette and blue trim
    g.fillStyle = B; g.beginPath(); g.arc(256, 175, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = W; g.beginPath(); g.arc(256, 175, 20, 0, Math.PI * 2); g.fill();
    g.strokeStyle = B; g.lineWidth = 6;
    g.strokeRect(46, 236, 58, 458); g.strokeRect(408, 236, 58, 458);
    g.beginPath(); g.moveTo(30, 226); g.lineTo(482, 226); g.stroke();
  }, true, false);

// soft cloudy alpha for mist sheets
export const mistTex = () =>
  make("mist", 512, 256, (g, r) => {
    g.clearRect(0, 0, 512, 256);
    for (let i = 0; i < 70; i++) {
      const x = r() * 512, y = 90 + r() * 110, s = 30 + r() * 90;
      const gr = g.createRadialGradient(x, y, 0, x, y, s);
      gr.addColorStop(0, "rgba(255,255,255,0.22)"); gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr; g.fillRect(x - s, y - s, s * 2, s * 2);
    }
    // fade edges
    g.globalCompositeOperation = "destination-in";
    const e = g.createLinearGradient(0, 0, 512, 0);
    e.addColorStop(0, "rgba(0,0,0,0)"); e.addColorStop(0.2, "rgba(0,0,0,1)"); e.addColorStop(0.8, "rgba(0,0,0,1)"); e.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = e; g.fillRect(0, 0, 512, 256);
  }, false, false);
