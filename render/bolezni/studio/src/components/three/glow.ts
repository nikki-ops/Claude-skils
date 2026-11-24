import * as THREE from "three";

// Радиальная текстура для «свечения» (фейковый bloom через аддитивные спрайты)
export const glowTexture = (inner = "rgba(255,255,255,1)", mid = "rgba(255,255,255,0.25)") => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner);
  gr.addColorStop(0.25, mid);
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

// «Шар» с объёмной заливкой: светлый центр, тёмный край, жёсткая граница — сома/клетка
export const ballTexture = (light: string, mid: string, edge: string, nucleus?: string) => {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(110, 100, 4, 128, 128, 124);
  gr.addColorStop(0, light);
  gr.addColorStop(0.55, mid);
  gr.addColorStop(1, edge);
  g.fillStyle = gr;
  g.beginPath();
  g.arc(128, 128, 122, 0, Math.PI * 2);
  g.fill();
  if (nucleus) {
    const n = g.createRadialGradient(128, 128, 0, 128, 128, 44);
    n.addColorStop(0, nucleus);
    n.addColorStop(0.8, nucleus);
    n.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = n;
    g.beginPath();
    g.arc(128, 128, 46, 0, Math.PI * 2);
    g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
