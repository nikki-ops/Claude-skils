"""Music bed + SFX for the first 5.4 s of «Маяк» (no voice yet). numpy only.
usage: python3 audio_intro.py out.wav
Events: three bells with the red flashes (0.18/0.58/0.98), watch tick + thud on the counter (1.7-2.2),
stamp on the "50 к 1" badge (2.55), whip whoosh (3.9), funny wheezy horn of the Lastochka (4.15), gulls (4.4, 4.9).
"""
import sys, wave
import numpy as np

SR = 48000; T = 5.4; N = int(SR * T)
rng = np.random.default_rng(3)
def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def add(buf, t0, sig, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if i < len(buf): buf[i:j] += sig[:j - i] * g
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, dur=0.35):
    n = int(SR * dur); L = max(2, int(SR / f)); b = rng.uniform(-1, 1, L); out = np.zeros(n)
    for i in range(n):
        out[i] = b[i % L]; b[i % L] = 0.5 * (b[i % L] + b[(i + 1) % L]) * 0.996
    return out * env(n, 0.002, dur * 0.5)
def bell(f, dur=1.4):
    n = int(SR * dur); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for a, r, k in [(1, 1, 2.5), (0.6, 2.76, 4), (0.35, 5.4, 7), (0.2, 8.9, 11)])
    return s * env(n, 0.001, 0.8)
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))

# music: 151 BPM, D minor, sneaky pizzicato; drops out under the flashes, comes back at 1.6
mus = np.zeros(N); beat = 60 / 151
bass = [38, 38, 45, 38, 41, 41, 45, 40]
mel = [62, None, 65, None, 69, None, 67, 65, 64, None, 61, None, 62, None, None, None]
for i in range(int(T / beat) + 1):
    t = i * beat
    if t < 1.55: continue
    add(mus, t, pluck(mtof(bass[i % 8]), 0.4), 0.5)
    for h in (0, 1):
        m = mel[(i * 2 + h) % len(mel)]
        if m: add(mus, t + h * beat / 2, pluck(mtof(m + 12), 0.3), 0.32)
# low drone under the flashes
n = int(SR * 1.6); tt = np.arange(n) / SR
add(mus, 0.0, (np.sin(2 * np.pi * 73.4 * tt) + 0.4 * np.sin(2 * np.pi * 110 * tt)) * np.minimum(1, tt / 0.3) * np.exp(-np.maximum(0, tt - 1.3) * 8), 0.35)

sfx = np.zeros(N)
for k, t0 in enumerate([0.18, 0.58, 0.98]):                         # bells with the flashes
    add(sfx, t0, bell(mtof(74 + (0, 0, 5)[k])), 0.55)
for k in range(6):                                                 # watch ticking while it travels
    add(sfx, 1.62 + k * 0.1, bp(rng.standard_normal(int(SR * 0.01)), 3000, 9000) * env(int(SR * 0.01), 0.0005, 0.003), 0.5)
n = int(SR * 0.12); add(sfx, 2.18, bp(rng.standard_normal(n), 80, 900) * env(n, 0.001, 0.03), 0.9)   # thud on the counter
add(sfx, 2.18, bell(mtof(96), 0.3), 0.12)                          # little metallic clink
n = int(SR * 0.15); add(sfx, 2.55, bp(rng.standard_normal(n), 60, 400) * env(n, 0.001, 0.04), 1.0)   # badge stamp
n = int(SR * 0.35); w = rng.standard_normal(n); sw = np.linspace(0, 1, n)                           # whip whoosh
add(sfx, 3.78, bp(w, 500, 4000) * np.sin(np.pi * sw) ** 2, 0.7)
n = int(SR * 0.9); tt = np.arange(n) / SR                                                           # wheezy horn
f = 196 * (1 + 0.03 * np.sin(2 * np.pi * 5.5 * tt)) * (1 - 0.06 * tt)
ph = 2 * np.pi * np.cumsum(f) / SR
horn = (np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.3) * np.minimum(1, tt / 0.05) * np.exp(-np.maximum(0, tt - 0.6) * 10)
horn = bp(horn + 0.15 * rng.standard_normal(n), 150, 2500)
add(sfx, 4.15, horn, 0.5)
for t0, f0 in [(4.4, 2400), (4.9, 2900)]:                          # gull cries
    n = int(SR * 0.35); tt = np.arange(n) / SR
    fr = f0 * (1 - 0.35 * tt / 0.35); ph = 2 * np.pi * np.cumsum(fr) / SR
    add(sfx, t0, np.sin(ph) * np.sin(np.pi * tt / 0.35) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * tt)), 0.18)
n = N; amb = bp(rng.standard_normal(n), 100, 800) * 0.05                                            # sea/wind bed
mix = mus * 0.55 + sfx + amb
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix = mix / np.max(np.abs(mix)) * 0.8
st = np.stack([mix, mix], 1)
with wave.open(sys.argv[1], "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", T)
