// Музыка v2: тема с развитием, живые партии, драматургия по сюжету ролика.
// node tools/music2.mjs <music_plan.json> <out.wav>
// План (JSON): bpm, bars, sections [{from, chords[], sec}], themes {NAME: [[ [доля, длит, нота], ...], ...]},
// melodies [{bars[], theme, phrases?[], oct, vel, inst: "lead"|"piano"}]. Пример: src/rabies/music_plan.json.
// Секции: hook | intro | dropA | tension | break | lift | final | outro.
import fs from "node:fs";
const PLAN_FILE = process.argv[2];
const CFG = JSON.parse(fs.readFileSync(PLAN_FILE, "utf8"));

const SR = 44100, TAU = Math.PI * 2;
const BPM = CFG.bpm || 96, BEAT = 60 / BPM, BAR = BEAT * 4, BARS = CFG.bars || 36;
const LEN = Math.ceil((BARS * BAR + 4) * SR);

let seed = 777;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const NOTE = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const n = (s) => { const m = s.match(/^([A-G][b#]?)(-?\d)$/); return NOTE[m[1]] + (+m[2] + 1) * 12; };
const human = (t, ms = 12) => t + (rnd() - 0.5) * 2 * (ms / 1000);

class Bus { constructor() { this.L = new Float32Array(LEN); this.R = new Float32Array(LEN); } add(i, v, pan = 0) { if (i < 0 || i >= LEN) return; this.L[i] += v * (1 - Math.max(0, pan)); this.R[i] += v * (1 + Math.min(0, pan)); } }
class BQ {
  constructor(type, f, q = 0.707) { this.t = type; this.x1 = this.x2 = this.y1 = this.y2 = 0; this.set(f, q); }
  set(f, q = this.q) { this.q = q; const w = (TAU * Math.min(f, SR * 0.45)) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q); let b0, b1, b2; if (this.t === "lp") { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; } else if (this.t === "hp") { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; } else { b0 = a; b1 = 0; b2 = -a; } const a0 = 1 + a; this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = (-2 * c) / a0; this.a2 = (1 - a) / a0; }
  p(x) { const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2; this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y; }
}

// ---------------- инструменты ----------------
// Пианино: 3 струны на ноту (лёгкая расстройка), 10 обертонов с негармоничностью,
// яркость зависит от силы удара, молоточек — короткий шум, спад верхов быстрее низов.
function piano(bus, t0, midi, vel = 0.7, dur = 1.5, pan = 0) {
  const s0 = Math.round(human(t0, 8) * SR), f = hz(midi);
  const B = 0.0004 * Math.pow(2, (midi - 60) / 24);
  const partials = 10, len = Math.round((dur + 1.2) * SR);
  const ph = new Float64Array(partials * 3);
  const amp = [], dec = [], fr = [];
  for (let h = 1; h <= partials; h++) {
    const bright = Math.pow(vel, 0.5 + h * 0.15);
    amp.push((1 / Math.pow(h, 1.1)) * bright);
    dec.push(0.6 + h * 0.9 + (midi - 48) * 0.03);
    fr.push(f * h * Math.sqrt(1 + B * h * h));
  }
  const det = [0, 0.7, -0.6];
  const hp = new BQ("hp", 40), lp = new BQ("lp", 2500 + vel * 6000);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    let v = 0;
    for (let h = 0; h < partials; h++) {
      const e = Math.exp(-t * dec[h] * (t > dur ? 3.5 : 1));
      if (e < 0.0005) continue;
      for (let s = 0; s < 3; s++) { const idx = h * 3 + s; ph[idx] += (TAU * fr[h] * (1 + det[s] * 0.0008)) / SR; v += Math.sin(ph[idx]) * amp[h] * e; }
    }
    v = v / 3 + (t < 0.01 ? noise() * (1 - t / 0.01) * 0.15 * vel : 0);
    const out = lp.p(hp.p(v)) * Math.min(1, t * 2000) * vel * 0.22;
    bus.add(s0 + k, out, pan);
  }
}
// Струнные: ансамбль из 7 расстроенных пил, ФНЧ, медленная атака, вибрато с задержкой
function strings(bus, t0, midi, dur, vol = 0.5, { pan = 0, attack = 0.35, cutoff = 2600, trem = 0 } = {}) {
  const s0 = Math.round(t0 * SR), len = Math.round((dur + 0.8) * SR), f = hz(midi);
  const voices = Array.from({ length: 7 }, (_, i) => ({ d: (i - 3) * 0.0035 + (rnd() - 0.5) * 0.002, p: rnd(), vr: 4.6 + rnd() * 0.8 }));
  const lp1 = new BQ("lp", cutoff, 0.6), lp2 = new BQ("lp", cutoff * 1.4, 0.6);
  for (let k = 0; k < len; k++) {
    const t = k / SR;
    const vib = 1 + Math.min(1, Math.max(0, (t - 0.4) / 0.6)) * 0.004 * Math.sin(TAU * 5.2 * t);
    let v = 0;
    for (const o of voices) { o.p += (f * (1 + o.d) * vib) / SR; v += (o.p % 1) * 2 - 1; }
    let env = Math.min(1, t / attack) * (t > dur ? Math.exp(-(t - dur) * 4) : 1);
    if (trem) env *= 0.6 + 0.4 * Math.abs(Math.sin(TAU * trem * t)); // тремоло смычком
    bus.add(s0 + k, lp2.p(lp1.p(v / 7)) * env * vol * 0.25, pan + Math.sin(t * 0.7) * 0.15);
  }
}
// Хор «а-а»: пила через три форманты, вибрато
function choir(bus, t0, midi, dur, vol = 0.4, pan = 0) {
  const s0 = Math.round(t0 * SR), len = Math.round((dur + 1) * SR), f = hz(midi);
  const F = [new BQ("bp", 760, 6), new BQ("bp", 1150, 7), new BQ("bp", 2650, 9)], G = [1, 0.55, 0.25];
  const vs = [0, 0.004, -0.004].map((d) => ({ d, p: rnd() }));
  for (let k = 0; k < len; k++) {
    const t = k / SR, vib = 1 + 0.005 * Math.sin(TAU * 5 * t + 1);
    let x = 0; for (const o of vs) { o.p += (f * (1 + o.d) * vib) / SR; x += (o.p % 1) * 2 - 1; }
    x /= 3; let v = 0; for (let i = 0; i < 3; i++) v += F[i].p(x) * G[i];
    const env = Math.min(1, t / 0.6) * (t > dur ? Math.exp(-(t - dur) * 3) : 1);
    bus.add(s0 + k, v * env * vol * 0.9, pan);
  }
}
// Ведущий голос темы: мягкая «флейта/вокализ» — треугольник + немного пилы через ФНЧ, легато, вибрато
function lead(bus, notes, vol = 0.45, pan = 0) {
  // notes: [{t, d, m}] — легато: высота скользит к следующей ноте
  if (!notes.length) return;
  const tStart = notes[0].t, tEnd = notes[notes.length - 1].t + notes[notes.length - 1].d;
  const s0 = Math.round(tStart * SR), len = Math.round((tEnd - tStart + 0.6) * SR);
  const lp = new BQ("lp", 4200, 0.7);
  let ph = 0, cur = hz(notes[0].m), ni = 0;
  for (let k = 0; k < len; k++) {
    const t = tStart + k / SR;
    while (ni < notes.length - 1 && t >= notes[ni + 1].t) ni++;
    const nt = notes[ni], target = hz(nt.m);
    cur += (target - cur) * 0.0025; // портаменто
    const inNote = t - nt.t;
    const vib = 1 + Math.min(1, Math.max(0, (inNote - 0.25) / 0.4)) * 0.006 * Math.sin(TAU * 5.4 * t);
    ph += (cur * vib) / SR;
    const tri = 1 - 4 * Math.abs((ph % 1) - 0.5), saw = (ph % 1) * 2 - 1;
    const gap = nt.rest ? 0 : 1;
    const envNote = Math.min(1, inNote / 0.04) * (inNote > nt.d - 0.05 && ni === notes.length - 1 ? Math.max(0, 1 - (inNote - nt.d + 0.05) / 0.5) : 1);
    const breath = noise() * 0.02;
    bus.add(s0 + k, lp.p(tri * 0.8 + saw * 0.25 + breath) * vol * 0.3 * gap * envNote, pan);
  }
}
// Виолончель-бас: пила через ФНЧ, мягкая атака
function cello(bus, t0, midi, dur, vol = 0.5) {
  const s0 = Math.round(human(t0, 6) * SR), len = Math.round((dur + 0.4) * SR), f = hz(midi);
  const lp = new BQ("lp", 700, 0.8); let p1 = 0, p2 = 0.3;
  for (let k = 0; k < len; k++) {
    const t = k / SR, vib = 1 + 0.003 * Math.sin(TAU * 5 * t);
    p1 += (f * vib) / SR; p2 += (f * 1.003 * vib) / SR;
    const env = Math.min(1, t / 0.12) * (t > dur ? Math.exp(-(t - dur) * 8) : 1);
    bus.add(s0 + k, lp.p(((p1 % 1) + (p2 % 1)) - 1) * env * vol * 0.35);
  }
}
function sub808(bus, t0, midi, dur, vol = 0.7) {
  const s0 = Math.round(t0 * SR), len = Math.round(dur * SR); let ph = 0;
  for (let k = 0; k < len; k++) { const t = k / SR; ph += (TAU * hz(midi) * (1 + 0.8 * Math.exp(-t * 40))) / SR; const env = Math.min(1, t * 300) * Math.exp(-t * 0.7) * Math.min(1, (dur - t) * 30); bus.add(s0 + k, Math.tanh(Math.sin(ph) * 1.6) * env * vol * 0.6); }
}
function kick(bus, t0, vel = 1) {
  const s0 = Math.round(human(t0, 4) * SR); let ph = 0;
  for (let k = 0; k < SR * 0.4; k++) { const t = k / SR; ph += (TAU * (46 + 120 * Math.exp(-t * 30))) / SR; bus.add(s0 + k, (Math.sin(ph) * Math.exp(-t * 7) + noise() * Math.exp(-t * 250) * 0.15) * vel * 0.8); }
}
function snare(bus, t0, vel = 1) {
  const s0 = Math.round(human(t0, 6) * SR); const bp = new BQ("bp", 1800, 0.8), hp = new BQ("hp", 400); let ph = 0;
  for (let k = 0; k < SR * 0.5; k++) { const t = k / SR; ph += (TAU * 190) / SR; bus.add(s0 + k, (hp.p(bp.p(noise())) * Math.exp(-t * 12) * 1.6 + Math.sin(ph) * Math.exp(-t * 25) * 0.4) * vel * 0.45, (rnd() - 0.5) * 0.2); }
}
function hat(bus, t0, vel = 0.5, open = false) {
  const s0 = Math.round(human(t0, 7) * SR); const hp = new BQ("hp", 8000, 0.8);
  for (let k = 0; k < SR * (open ? 0.35 : 0.07); k++) { const t = k / SR; bus.add(s0 + k, hp.p(noise()) * Math.exp(-t * (open ? 8 : 60)) * vel * 0.16, 0.25); }
}
function riser(bus, t0, dur, vol = 0.3) {
  const s0 = Math.round(t0 * SR), len = Math.round(dur * SR); const bp = new BQ("bp", 300, 2);
  for (let k = 0; k < len; k++) { const u = k / len; if (k % 64 === 0) bp.set(300 * Math.pow(25, u), 2); bus.add(s0 + k, bp.p(noise()) * u * u * vol * 2.2, Math.sin(u * 14) * 0.4); }
}
function boom(bus, t0, vol = 0.8) {
  const s0 = Math.round(t0 * SR); let ph = 0; const lp = new BQ("lp", 1800);
  for (let k = 0; k < SR * 3; k++) { const t = k / SR; ph += (TAU * (30 + 70 * Math.exp(-t * 5))) / SR; bus.add(s0 + k, (Math.sin(ph) * Math.exp(-t * 1.3) + lp.p(noise()) * Math.exp(-t * 3) * 0.35) * vol); }
}

// ---------------- гармония и тема ----------------
const CH = {
  Am: ["A2", ["A3", "C4", "E4"]], F: ["F2", ["F3", "A3", "C4"]], C: ["C3", ["G3", "C4", "E4"]], G: ["G2", ["G3", "B3", "D4"]],
  Dm: ["D3", ["F3", "A3", "D4"]], E: ["E2", ["E3", "G#3", "B3"]], E7: ["E2", ["D4", "G#3", "B3"]], Em: ["E2", ["E3", "G3", "B3"]], Fmaj7: ["F2", ["E4", "A3", "C4"]],
};
// Тема (8 тактов): [доля в такте, длительность в долях, нота]
const THEME = [
  [[0.5, 0.5, "A4"], [1, 0.5, "C5"], [1.5, 1.5, "E5"], [3, 1, "D5"]],
  [[0, 1.5, "C5"], [1.5, 0.5, "B4"], [2, 2, "A4"]],
  [[0, 0.5, "G4"], [0.5, 0.5, "A4"], [1, 1, "C5"], [2, 1, "E5"], [3, 1, "G5"]],
  [[0, 1.5, "F5"], [1.5, 0.5, "E5"], [2, 2, "D5"]],
  [[0.5, 0.5, "A4"], [1, 0.5, "C5"], [1.5, 1.5, "E5"], [3, 1, "A5"]],
  [[0, 1, "G5"], [1, 1, "F5"], [2, 1, "E5"], [3, 1, "C5"]],
  [[0, 1, "D5"], [1, 0.5, "E5"], [1.5, 1.5, "F5"], [3, 1, "E5"]],
  [[0, 1, "D5"], [1, 1, "C5"], [2, 2, "B4"]],
];
// тревожный вариант (быстрее, выше, повторяющиеся ноты)
const THEME_T = [
  [[0, 0.5, "F5"], [0.5, 0.5, "F5"], [1, 0.5, "E5"], [1.5, 0.5, "D5"], [2, 2, "A5"]],
  [[0, 0.5, "E5"], [0.5, 0.5, "E5"], [1, 0.5, "D5"], [1.5, 0.5, "C5"], [2, 2, "E5"]],
  [[0, 0.5, "G#5"], [0.5, 0.5, "A5"], [1, 0.5, "B5"], [1.5, 1.5, "D6"], [3, 1, "C6"]],
  [[0, 1.5, "B5"], [1.5, 0.5, "A5"], [2, 2, "E5"]],
];

if (CFG.themes?.THEME) THEME.splice(0, THEME.length, ...CFG.themes.THEME);
if (CFG.themes?.THEME_T) THEME_T.splice(0, THEME_T.length, ...CFG.themes.THEME_T);
const THEMES = { THEME, THEME_T, ...(CFG.themes || {}) };
// План по тактам: аккорд, секция
const PLAN = [];
const put = (from, chords, sec) => chords.forEach((c, i) => (PLAN[from + i] = { ch: c, sec }));
CFG.sections.forEach((x) => put(x.from, x.chords, x.sec));
const secAt = (b) => (PLAN[b] ? PLAN[b].sec : null);
const isStart = (b, sec) => secAt(b) === sec && secAt(b - 1) !== sec;

const S = { piano: new Bus(), str: new Bus(), choir: new Bus(), lead: new Bus(), bass: new Bus(), drums: new Bus(), fx: new Bus() };
const kicks = [];
const melody = (bars, theme, octShift = 0, velBase = 0.7, inst = "lead") => {
  const notes = [];
  bars.forEach((b, i) => {
    const ph = theme[i % theme.length];
    ph.forEach(([beat, d, m]) => {
      const t = b * BAR + beat * BEAT, mid = n(m) + octShift;
      if (inst === "piano") piano(S.piano, t, mid, velBase + (rnd() - 0.5) * 0.12, d * BEAT, 0.1);
      else notes.push({ t, d: d * BEAT, m: mid });
    });
  });
  if (inst === "lead") lead(S.lead, notes, velBase, 0);
};

for (let b = 0; b < BARS; b++) {
  const { ch, sec } = PLAN[b];
  const [root, tri] = CH[ch];
  const t = b * BAR;
  const vel = (base) => base + (rnd() - 0.5) * 0.1;
  if (sec === "hook") {
    boom(S.fx, 0, 0.8);
    piano(S.piano, 0.05, n("A1"), 0.9, 3); piano(S.piano, 0.07, n("A2"), 0.8, 3);
    strings(S.str, 0.1, n("E5"), BAR, 0.35, { attack: 1.2 });
    piano(S.piano, BEAT * 2, n("E5"), 0.5, 1.5); piano(S.piano, BEAT * 3, n("C5"), 0.45, 1.5);
    continue;
  }
  if (sec === "intro") {
    // одинокое пианино: бас + тихие аккорды на 1 и 3, тема — пианино
    piano(S.piano, t, n(root) - 12, vel(0.55), BAR);
    tri.forEach((m, i) => piano(S.piano, t + BEAT * 0 + i * 0.03, n(m), vel(0.35), BEAT * 2));
    tri.forEach((m, i) => piano(S.piano, t + BEAT * 2 + i * 0.03, n(m), vel(0.3), BEAT * 2));
    strings(S.str, t, n(tri[0]), BAR, 0.18, { attack: 0.8, cutoff: 1500 });
    if (secAt(b + 1) !== "intro") { strings(S.str, t, n("E5"), BAR, 0.35, { trem: 8, attack: 0.3 }); riser(S.fx, t + BAR * 0.25, BAR * 0.75, 0.3); }
    continue;
  }
  if (sec === "break") {
    // остановка сердца: пианино тихо, затем одна высокая струна тает
    if (isStart(b, "break")) { tri.forEach((m, i) => piano(S.piano, t + i * 0.12, n(m), 0.35, BAR)); strings(S.str, t, n("A4"), BAR * 2, 0.22, { attack: 1 }); melody([b], [THEME[1]], 0, 0.45, "piano"); }
    if (!isStart(b, "break")) { strings(S.str, t, n("E6"), BAR * 0.9, 0.12, { attack: 0.5, cutoff: 3500 }); riser(S.fx, t + BAR * 0.5, BAR * 0.5, 0.2); }
    continue;
  }
  if (sec === "outro") {
    piano(S.piano, t, n("A2"), 0.5, BAR); piano(S.piano, t + 0.02, n("E4"), 0.4, BAR); piano(S.piano, t + BEAT, n("C5"), 0.4, BAR);
    strings(S.str, t, n("A3"), BAR, 0.2, { attack: 0.5 });
    continue;
  }
  // ----- секции с ритмом -----
  const intense = sec === "tension" ? 1 : sec === "final" ? 0.9 : sec === "lift" ? 0.6 : 0.75;
  // аккомпанемент пианино: ломаные аккорды восьмыми, но с вариацией и динамикой
  const pat = sec === "tension" ? [0, 1, 2, 1, 0, 1, 2, 1] : [0, 2, 1, 2, 0, 2, 1, 2];
  pat.forEach((ix, i) => { if (sec === "lift" && i % 2) return; piano(S.piano, t + i * (BEAT / 2), n(tri[ix]) + (i >= 4 && sec !== "tension" ? 12 : 0), vel(0.32 + (i === 0 ? 0.12 : 0)), BEAT * 0.9, i % 2 ? 0.2 : -0.2); });
  // струнные: аккорд на октаву выше (меньше «каши» в середине)
  tri.forEach((m, i) => strings(S.str, t, n(m) + 12, BAR + 0.05, 0.22 * intense, { pan: (i - 1) * 0.5, trem: sec === "tension" ? 10 : 0, cutoff: sec === "tension" ? 3200 : 2400 }));
  cello(S.bass, t, n(root), BAR * 0.98, 0.6);
  if (sec !== "lift") sub808(S.bass, t, n(root) - 12, BAR * 0.95, 0.55 * intense);
  if (sec === "final" || sec === "tension") choir(S.choir, t, n(tri[0]) + 12, BAR, 0.18 * intense, -0.3);
  if (sec === "final") choir(S.choir, t, n(tri[2]) + 12, BAR, 0.14, 0.3);
  // ударные: half-time, живые
  [0, 6].forEach((s) => { kick(S.drums, t + s * BEAT / 4, s ? 0.8 : 1); kicks.push(t + s * BEAT / 4); });
  if (b % 2 === 1 && sec !== "lift") { kick(S.drums, t + 11 * BEAT / 4, 0.6); kicks.push(t + 11 * BEAT / 4); }
  snare(S.drums, t + BEAT * 2, sec === "lift" ? 0.6 : 0.9);
  if (sec === "tension" && b % 2) snare(S.drums, t + BEAT * 3.75, 0.25);
  for (let h = 0; h < 8; h++) hat(S.drums, t + h * BEAT / 2, (h % 2 ? 0.35 : 0.6) * (sec === "lift" ? 0.6 : 1), sec === "final" && h === 7);
  if (sec === "tension" && b % 4 === 3) for (let r = 0; r < 6; r++) hat(S.drums, t + BEAT * 3 + r * BEAT / 6, 0.3 + r * 0.06);
  if (["dropA", "tension", "lift", "final"].some((x) => isStart(b, x))) boom(S.fx, t, isStart(b, "tension") ? 0.8 : 0.55);
  if (isStart(b + 1, "tension") || isStart(b + 1, "final")) riser(S.fx, t + BAR * 0.5, BAR * 0.5, 0.25);
}
// мелодии по секциям
CFG.melodies.forEach((m) => {
  const th = THEMES[m.theme];
  const phrases = m.phrases ? m.phrases.map((i) => th[i]) : th;
  melody(m.bars, phrases, m.oct || 0, m.vel || 0.5, m.inst || "lead");
});

// ---------------- сведение ----------------
// реверб: Freeverb с предзадержкой 30 мс
class Reverb {
  constructor(size, damp) { const cl = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], al = [556, 441, 341, 225]; this.ch = [0, 23].map((sp) => ({ c: cl.map((l) => ({ b: new Float32Array(l + sp), i: 0, f: 0 })), a: al.map((l) => ({ b: new Float32Array(l + sp), i: 0 })) })); this.size = size; this.damp = damp; this.pre = [new Float32Array(1323), new Float32Array(1323)]; this.pi = 0; }
  p(x, c) { const pb = this.pre[c]; const d = pb[this.pi]; pb[this.pi] = x; if (c === 1) this.pi = (this.pi + 1) % pb.length; const ch = this.ch[c]; let o = 0; for (const cb of ch.c) { const y = cb.b[cb.i]; cb.f = y * (1 - this.damp) + cb.f * this.damp; cb.b[cb.i] = d + cb.f * this.size; cb.i = (cb.i + 1) % cb.b.length; o += y; } for (const ap of ch.a) { const bo = ap.b[ap.i]; const y = -o + bo; ap.b[ap.i] = o + bo * 0.5; ap.i = (ap.i + 1) % ap.b.length; o = y; } return o * 0.1; }
}
const sc = new Float32Array(LEN).fill(1);
for (const t of kicks) { const s0 = Math.round(t * SR); for (let k = 0; k < SR * BEAT * 0.8 && s0 + k < LEN; k++) { const u = k / (SR * BEAT * 0.8); sc[s0 + k] = Math.min(sc[s0 + k], 1 - 0.35 * (1 - u) * (1 - u)); } }
const stems = [
  [S.piano, 1.0, 0.35, false], [S.str, 0.9, 0.5, true], [S.choir, 0.8, 0.6, true], [S.lead, 0.85, 0.45, false],
  [S.bass, 0.7, 0.05, false], [S.drums, 0.9, 0.12, false], [S.fx, 0.8, 0.3, false],
];
const rv = new Reverb(0.88, 0.4);
const L = new Float32Array(LEN), R = new Float32Array(LEN);
for (const [bus, gain, send, duck] of stems) { const hpL = new BQ("hp", bus === S.bass || bus === S.drums || bus === S.fx ? 25 : 140), hpR = new BQ("hp", bus === S.bass || bus === S.drums || bus === S.fx ? 25 : 140); for (let i = 0; i < LEN; i++) { const d = duck ? sc[i] : 1; const l = hpL.p(bus.L[i]) * gain * d, r = hpR.p(bus.R[i]) * gain * d; L[i] += l + rv.p(l * send, 0); R[i] += r + rv.p(r * send, 1); } }
// мягкая компрессия шины + лимитер
let env = 0; const att = Math.exp(-1 / (0.01 * SR)), rel = Math.exp(-1 / (0.2 * SR));
let peak = 0;
for (let i = 0; i < LEN; i++) {
  const x = Math.max(Math.abs(L[i]), Math.abs(R[i]));
  env = x > env ? att * env + (1 - att) * x : rel * env + (1 - rel) * x;
  const thr = 0.35, g = env > thr ? Math.pow(thr / env, 0.4) : 1;
  L[i] = Math.tanh(L[i] * g * 1.3); R[i] = Math.tanh(R[i] * g * 1.3);
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const norm = 0.89 / peak;
const out = process.argv[3] || "public/music.wav";
const buf = Buffer.alloc(44 + LEN * 4);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + LEN * 4, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(LEN * 4, 40);
for (let i = 0; i < LEN; i++) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * norm)) * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * norm)) * 32767), 46 + i * 4); }
fs.writeFileSync(out, buf);
console.log("written", out);
