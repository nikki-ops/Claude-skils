"""SFX for the 6 s test of «Сто будильников»: clatter of falling clocks, one ringing, slap, roommates' laughter."""
import sys, wave
import numpy as np
SR = 48000; T = 6.0; N = int(SR * T); rng = np.random.default_rng(5); out = np.zeros(N)
def add(t0, s, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(s))
    if 0 <= i < N: out[i:j] += s[:j - i] * g
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def ding(f, d=0.25):
    n = int(SR * d); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for a, r, k in [(1, 1, 9), (0.5, 2.7, 14), (0.3, 5.4, 20)]) * env(n, 0.001, 0.2)
def ring(d):   # mechanical alarm bell: hammer at ~22 Hz between two bells
    n = int(SR * d); s = np.zeros(n)
    for k in range(int(d * 22)):
        b = ding(2100 + 300 * (k % 2), 0.08); i = int(k / 22 * SR); s[i:i + len(b)] += b[: n - i]
    return s
for i in range(26):    # clocks hitting the bed / floor
    t0 = 0.3 + i * 0.05 + 0.25 + rng.random() * 0.1
    add(t0, bp(rng.standard_normal(int(SR * 0.05)), 300, 3000) * env(int(SR * 0.05), 0.001, 0.015), 0.5)
    add(t0, ding(1500 + rng.random() * 1500, 0.15), 0.12)
add(2.85, ring(0.55), 0.35)                       # B2: one clock rings
n = int(SR * 0.12); add(3.35, bp(rng.standard_normal(n), 60, 900) * env(n, 0.001, 0.03), 1.0)   # slap
def laugh(d, voices=3):
    s = np.zeros(int(SR * d))
    for v in range(voices):
        f0 = 160 + 70 * v; t = 0.05 * v
        while t < d - 0.2:
            n = int(SR * (0.09 + 0.04 * rng.random())); tt = np.arange(n) / SR; ph = 2 * np.pi * f0 * tt
            syl = bp((np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.sin(np.pi * tt / tt[-1]) ** 2 + 0.3 * rng.standard_normal(n), 150, 3500)
            i = int(t * SR); s[i:i + n] += syl[: len(s) - i]; t += 0.16 + 0.05 * rng.random()
    return s / np.abs(s).max()
add(4.05, laugh(1.9), 0.5)
out += bp(rng.standard_normal(N), 80, 600) * 0.01   # room tone
out = out / np.abs(out).max() * 0.8
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print("ok")
