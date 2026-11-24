// Dark phonk генератор (своя музыка кодом): гул, стук сердца, дисторшн-808 со слайдами, фонковый ковбелл,
// хэты с триольными роллами, хлопок, хор, райзеры и удары на стартах секций.
// node tools/phonk.mjs <plan.json> <out.wav>   (план: bpm, bars, sections[{from, sec}])
import fs from "node:fs";
const [, , planPath, outPath] = process.argv;
const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
const SR = 44100, BPM = plan.bpm, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = plan.bars, DUR = BARS * BAR;
const N = Math.ceil(DUR * SR) + SR;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 1337; const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const n2m = (s) => { const m = s.match(/^([A-G][#b]?)(-?\d)$/); return NOTE[m[1]] + (+m[2] + 1) * 12; };
const secAt = (bar) => { let s = plan.sections[0].sec; for (const x of plan.sections) if (bar >= x.from) s = x.sec; return s; };
const add = (buf, i0, gL, gR) => { for (let i = 0; i < buf.length; i++) { const j = i0 + i; if (j < 0 || j >= N) continue; L[j] += buf[i] * gL; R[j] += buf[i] * gR; } };
// RBJ biquad
function biquad(x, type, f, q = 0.707) {
  const w = 2 * Math.PI * f / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
  let b0, b1, b2, a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
  if (type === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = (1 - c) / 2; }
  else if (type === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = (1 + c) / 2; }
  else { b0 = a; b1 = 0; b2 = -a; }
  const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) { const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; }
  return y;
}
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) * d));
// ---------- инструменты ----------
function kick(dist = 1) { const n = Math.floor(0.45 * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR, f = 45 + 140 * Math.exp(-t * 28); ph += 2 * Math.PI * f / SR; b[i] = Math.tanh(Math.sin(ph) * (1.5 + dist) * Math.exp(-t * 6)) + (i < 300 ? (rnd() * 2 - 1) * 0.4 * (1 - i / 300) : 0); }
  return b; }
function clap() { const n = Math.floor(0.3 * SR); let b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; const e = Math.max(env(t, 0.001, 30), t > 0.012 ? env(t - 0.012, 0.001, 28) : 0, t > 0.024 ? env(t - 0.024, 0.001, 14) : 0); b[i] = (rnd() * 2 - 1) * e; }
  b = biquad(b, "bp", 1400, 0.9); for (let i = 0; i < n; i++) b[i] = Math.tanh(b[i] * 3); return b; }
function hat(open = false) { const n = Math.floor((open ? 0.25 : 0.06) * SR); let b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] = (rnd() * 2 - 1) * env(t, 0.0005, open ? 14 : 70); }
  return biquad(b, "hp", 7500, 0.8); }
// фонковый ковбелл: два квадрата (соотношение 1:1.48), полосовой, короткий хвост
function cowbell(m, len = 0.22) { const f = mtof(m), n = Math.floor(len * SR); let b = new Float32Array(n), p1 = 0, p2 = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; p1 += f / SR; p2 += f * 1.48 / SR; const sq = (p1 % 1 < 0.5 ? 1 : -1) + 0.8 * (p2 % 1 < 0.5 ? 1 : -1); b[i] = sq * env(t, 0.001, 11); }
  b = biquad(b, "bp", f * 1.6, 1.4); for (let i = 0; i < n; i++) b[i] = Math.tanh(b[i] * 2.2); return b; }
// 808 со слайдом и дисторшном
function bass808(m, len, slideTo = null, drive = 2.2) { const n = Math.floor(len * SR), b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; let mm = m; if (slideTo != null && t > len * 0.55) mm = m + (slideTo - m) * Math.min(1, (t - len * 0.55) / (len * 0.25));
    const f = mtof(mm) * (1 + 0.6 * Math.exp(-t * 40)); ph += 2 * Math.PI * f / SR; const e = Math.min(1, t / 0.004) * (t > len - 0.03 ? (len - t) / 0.03 : 1) * Math.exp(-t * 0.6);
    b[i] = Math.tanh(Math.sin(ph) * drive) * e * 0.9; }
  return b; }
function heartbeat() { const n = Math.floor(0.7 * SR), b = new Float32Array(n);
  const thump = (t0, a) => { for (let i = Math.floor(t0 * SR); i < n; i++) { const t = i / SR - t0; b[i] += Math.sin(2 * Math.PI * (38 + 30 * Math.exp(-t * 30)) * t) * a * env(t, 0.004, 14); } };
  thump(0, 1); thump(0.24, 0.7); return b; }
function boom() { const n = Math.floor(2.2 * SR); let b = new Float32Array(n); let ph = 0;
  for (let i = 0; i < n; i++) { const t = i / SR; ph += 2 * Math.PI * (30 + 70 * Math.exp(-t * 5)) / SR; b[i] = Math.tanh(Math.sin(ph) * 2.5) * Math.exp(-t * 1.6) + (rnd() * 2 - 1) * 0.25 * Math.exp(-t * 8); }
  return b; }
function riser(len) { const n = Math.floor(len * SR); let b = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / n; b[i] = (rnd() * 2 - 1) * t * t; }
  const out = new Float32Array(n); const seg = 2048;
  for (let s = 0; s < n; s += seg) { const f = 300 + 7000 * Math.pow(s / n, 2); const part = biquad(b.subarray(s, Math.min(n, s + seg)), "bp", f, 2); out.set(part, s); }
  return out; }
// гул: расстроенные пилы в басу через ФНЧ + шум
function drone(len, m, bright = 0.3) { const n = Math.floor(len * SR); let b = new Float32Array(n); const ph = [0, 0, 0, 0];
  const det = [0, 0.13, -0.11, 12.05];
  for (let i = 0; i < n; i++) { const t = i / SR; let v = 0; det.forEach((d, k) => { ph[k] += mtof(m + d) / SR; v += ((ph[k] % 1) * 2 - 1) * (k === 3 ? 0.35 : 0.5); }); b[i] = v * 0.25 + (rnd() * 2 - 1) * 0.04 * (1 + Math.sin(t * 0.7)); }
  b = biquad(b, "lp", 220 + 900 * bright, 1.2);
  for (let i = 0; i < n; i++) { const t = i / SR; b[i] *= Math.min(1, t / 0.8) * Math.min(1, (len - t) / 0.8); }
  return b; }
// хор «а-а»: пилы через 2 форманты
function choir(len, ms) { const n = Math.floor(len * SR); let b = new Float32Array(n);
  ms.forEach((m) => { let p = 0; for (let i = 0; i < n; i++) { const t = i / SR; p += mtof(m) * (1 + 0.005 * Math.sin(2 * Math.PI * 5.3 * t)) / SR; b[i] += ((p % 1) * 2 - 1) * 0.3; } });
  const f1 = biquad(b, "bp", 760, 3), f2 = biquad(b, "bp", 1150, 4); const o = new Float32Array(n);
  for (let i = 0; i < n; i++) { const t = i / SR; o[i] = (f1[i] + f2[i] * 0.7) * Math.min(1, t / 0.6) * Math.min(1, (len - t) / 0.5); }
  return o; }
// ---------- партитура: A-фригийский (A Bb C D E F G), тревожно ----------
const ROOT = 33; // A1
const BASS_PROG = [0, 0, 1, -2]; // A A Bb G (полутона от A)
const COW = [ // 16 шагов на такт: смещение от A4 (69) или null
  [0, null, 3, null, 1, null, 0, null, 7, null, 8, 7, 3, null, 1, null],
  [0, null, 3, null, 1, null, 0, 12, 10, null, 8, null, 7, 3, 1, null],
];
const t16 = BEAT / 4;
const KICK = kick(1.5), CLAP = clap(), HAT = hat(), OHAT = hat(true), HB = heartbeat(), BOOM = boom();
for (let bar = 0; bar < BARS; bar++) {
  const sec = secAt(bar), T = bar * BAR, i0 = Math.floor(T * SR);
  const first = plan.sections.some((s) => s.from === bar);
  const full = sec === "dropA" || sec === "tension" || sec === "final";
  if (first && ["hook", "dropA", "tension", "lift", "final"].includes(sec)) add(BOOM, i0, 0.9, 0.9);
  // гул всегда (кроме самого конца аутро — тише)
  const dr = drone(BAR + 0.6, ROOT + 12 + BASS_PROG[bar % 4], sec === "tension" ? 0.7 : 0.35);
  add(dr, i0 - Math.floor(0.3 * SR), sec === "break" ? 0.9 : 0.6, sec === "break" ? 0.85 : 0.55);
  // стук сердца: интро, брейк (замедляется и гаснет), аутро
  if (sec === "intro" || sec === "hook" || sec === "outro") for (let b = 0; b < 4; b += 2) add(HB, i0 + Math.floor(b * BEAT * SR), 0.9, 0.9);
  if (sec === "break") { const k = bar === plan.sections.find((s) => s.sec === "break").from ? 0 : 1; add(HB, i0, 0.9 - k * 0.4, 0.9 - k * 0.4); if (!k) add(HB, i0 + Math.floor(2.2 * BEAT * SR), 0.6, 0.6); }
  // ковбелл: в интро — тихо и глухо, в дропах — полностью
  if (sec !== "break" && sec !== "hook") {
    const pat = COW[(bar >> 1) % 2];
    pat.forEach((o, s) => { if (o == null) return; if (sec === "intro" && s % 4) return; if (sec === "outro" && s > 7) return;
      let cb = cowbell(69 + o + (sec === "tension" ? 12 : 0)); if (sec === "intro" || sec === "lift" || sec === "outro") cb = biquad(cb, "lp", 1400);
      const g = full ? 0.42 : 0.25, pan = s % 2 ? 0.8 : 1; add(cb, i0 + Math.floor(s * t16 * SR), g * pan, g * (2 - pan)); });
  }
  if (sec === "hook") add(cowbell(69 + 7, 0.9), i0 + Math.floor(0.2 * SR), 0.3, 0.3);
  // ударные
  if (full || sec === "lift") {
    const soft = sec === "lift" ? 0.55 : 1;
    [0, 2.5].forEach((b) => add(KICK, i0 + Math.floor(b * BEAT * SR), 0.85 * soft, 0.85 * soft)); // half-time
    if (bar % 2 === 1) add(KICK, i0 + Math.floor(3.25 * BEAT * SR), 0.6 * soft, 0.6 * soft);
    add(CLAP, i0 + Math.floor(2 * BEAT * SR), 0.55 * soft, 0.55 * soft);
    for (let s = 0; s < 16; s++) { // хэты 16-ми, роллы-триоли в конце каждого 2-го такта и в тревоге
      const roll = (sec === "tension" ? s >= 12 : bar % 2 && s >= 12);
      if (roll) { for (let r = 0; r < 3; r++) add(HAT, i0 + Math.floor((s * t16 + r * t16 / 3) * SR), 0.18 * soft, 0.22 * soft); continue; }
      if (s % 2 === 0 || sec !== "lift") add(HAT, i0 + Math.floor(s * t16 * SR), (s % 4 === 0 ? 0.24 : 0.14) * soft, (s % 4 === 0 ? 0.2 : 0.17) * soft);
    }
    if (sec === "tension") add(OHAT, i0 + Math.floor(1.5 * BEAT * SR), 0.12, 0.16);
    // 808: корень такта + слайд на последнюю долю
    const m = ROOT + BASS_PROG[bar % 4], nx = ROOT + BASS_PROG[(bar + 1) % 4];
    add(bass808(m, BEAT * 2.4, null, sec === "tension" ? 3 : 2.2), i0, 0.7 * soft, 0.7 * soft);
    add(bass808(m + 12, BEAT * 1.3, nx, sec === "tension" ? 3 : 2.2), i0 + Math.floor(2.5 * BEAT * SR), 0.55 * soft, 0.55 * soft);
  }
  // хор в тревоге и финале
  if (sec === "tension" || sec === "final") { const m = 57 + BASS_PROG[bar % 4]; add(choir(BAR, [m, m + 3, m + 7]), i0, 0.22, 0.26); }
  // райзер перед дропом, тревогой и финалом
  const nextFirst = plan.sections.find((s) => s.from === bar + 1);
  if (nextFirst && ["dropA", "tension", "final"].includes(nextFirst.sec)) add(riser(BAR * 0.9), i0 + Math.floor(BAR * 0.1 * SR), 0.35, 0.35);
}
// ---------- сведение: мягкий клип, нормализация 0.89 ----------
let pk = 0; for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 0.9); R[i] = Math.tanh(R[i] * 0.9); pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
const g = 0.89 / pk, len = Math.floor(DUR * SR), buf = Buffer.alloc(44 + len * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + len * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(len * 4, 40);
for (let i = 0; i < len; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4); }
fs.writeFileSync(outPath, buf); console.log("written", outPath, DUR.toFixed(1) + " s");
