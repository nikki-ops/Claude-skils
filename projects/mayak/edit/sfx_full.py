"""SFX + ambience for the full «Маяк» (44.2 s, no music). numpy only.
usage: python3 sfx_full.py out_sfx.wav
Times are absolute seconds on the final timeline (shot starts from shots_full.jsx).
"""
import sys, wave
import numpy as np

SR = 48000; T = 44.2; N = int(SR * T)
rng = np.random.default_rng(11)
def env(n, a=0.005, d=0.3):
    t = np.arange(n) / SR; return np.minimum(1, t / a) * np.exp(-t / d)
def add(t0, sig, g=1.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if 0 <= i < N: out[i:j] += sig[:j - i] * g
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, len(x))
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def bell(f, dur=1.4):
    n = int(SR * dur); t = np.arange(n) / SR
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k) for a, r, k in [(1, 1, 2.5), (0.6, 2.76, 4), (0.35, 5.4, 7), (0.2, 8.9, 11)])
    return s * env(n, 0.001, 0.8)
def noise(n): return rng.standard_normal(n)
def tick(): n = int(SR * 0.012); return bp(noise(n), 3000, 9000) * env(n, 0.0005, 0.003)
def thud(d=0.12, lo=60, hi=900): n = int(SR * d); return bp(noise(n), lo, hi) * env(n, 0.001, d / 4)
def whoosh(d=0.35, lo=500, hi=4000): n = int(SR * d); return bp(noise(n), lo, hi) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
def horn(f0=196, d=0.9, wheeze=0.15):
    n = int(SR * d); tt = np.arange(n) / SR
    f = f0 * (1 + 0.03 * np.sin(2 * np.pi * 5.5 * tt)) * (1 - 0.06 * tt); ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.3) * np.minimum(1, tt / 0.05) * np.exp(-np.maximum(0, tt - d * 0.7) * 10)
    return bp(s + wheeze * noise(n), 60, 2500)
def gull(f0=2600):
    n = int(SR * 0.35); tt = np.arange(n) / SR; fr = f0 * (1 - 0.35 * tt / 0.35); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * np.sin(np.pi * tt / 0.35) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * tt))
def laugh(d=2.6, voices=5):
    s = np.zeros(int(SR * d))
    for v in range(voices):
        f0 = 140 + 70 * v; t = 0.05 * v
        while t < d - 0.2:
            n = int(SR * (0.09 + 0.04 * rng.random())); tt = np.arange(n) / SR
            ph = 2 * np.pi * f0 * (1 + 0.1 * rng.random()) * tt
            syl = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.sin(np.pi * tt / tt[-1]) ** 2
            syl = bp(syl + 0.3 * noise(n), 150, 3500)
            i = int(t * SR); s[i:i + n] += syl[: len(s) - i] * (0.7 + 0.3 * rng.random())
            t += 0.16 + 0.05 * rng.random()
    return s / max(1e-9, np.abs(s).max())
def murmur(d): n = int(SR * d); return bp(noise(n), 200, 1500) * (0.6 + 0.4 * np.sin(2 * np.pi * 3.1 * np.arange(n) / SR)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.5
def coins(k=6):
    s = np.zeros(int(SR * 0.8))
    for i in range(k):
        b = bell(mtof(96 + rng.integers(0, 6)), 0.25); j = int(SR * 0.09 * i); s[j:j + len(b)] += b[: len(s) - j] * 0.4
    return s
def crunch():
    n = int(SR * 0.9); tt = np.arange(n) / SR
    s = bp(noise(n), 40, 400) * np.exp(-tt * 5) * 1.2 + bp(noise(n), 800, 5000) * np.exp(-tt * 9) * (0.5 + 0.5 * (noise(n) > 1.2))
    return s
def foghorn(d=1.6):
    n = int(SR * d); tt = np.arange(n) / SR; f = 98
    s = (np.sin(2 * np.pi * f * tt) + 0.6 * np.sin(2 * np.pi * 2 * f * tt) + 0.3 * np.sin(2 * np.pi * 3 * f * tt)) * np.minimum(1, tt / 0.15) * np.minimum(1, (d - tt) / 0.4)
    return s

out = np.zeros(N)
# ambience: sea + wind for the whole film, a little louder in the fog shots
amb = bp(noise(N), 80, 700) * 0.05 + bp(noise(N), 1500, 6000) * 0.012
fogw = np.zeros(N); a, b = int(8.78 * SR), int(13.39 * SR); fogw[a:b] = np.sin(np.linspace(0, np.pi, b - a)) * 0.05
out += amb + bp(noise(N), 200, 1200) * fogw / 0.05 * 0.04
# L1 three red flashes
for k, t0 in enumerate([0.18, 0.6, 1.02]): add(t0, bell(mtof(74 + (0, 0, 5)[k])), 0.5)
# L2 watch to the counter, badge
for k in range(6): add(2.12 + k * 0.1, tick(), 0.5)
add(2.66, thud(), 0.9); add(2.66, bell(mtof(96), 0.3), 0.12); add(3.04, thud(0.15, 60, 400), 1.0)
# L3 whip, wheezy horn, gulls
add(4.48, whoosh(), 0.7); add(4.8, horn(), 0.5); add(5.05, gull(2400), 0.2); add(5.45, gull(2900), 0.18)
# L4 tavern laughs
add(5.9, laugh(2.8, 6), 0.45); add(6.4, gull(2700), 0.12)
# L5 fog, foghorn on "до гудка"
add(11.9, foghorn(1.4), 0.45)
# L6 small sting, L7 iris + spyglass squeak
add(15.39, whoosh(0.25, 300, 2500), 0.4)
n = int(SR * 0.25); tt = np.arange(n) / SR; add(15.7, np.sin(2 * np.pi * (1800 + 900 * tt / 0.25) * tt) * env(n, 0.01, 0.1), 0.08)
# L8 POV wind (already in amb) + distant steamer horn
add(18.6, horn(330, 0.7, 0.05), 0.12)
# L8b demo flashes (soft bells)
for k, t0 in enumerate([22.53, 22.98, 23.43]): add(t0, bell(mtof(86), 0.6), 0.18)
# L9 six evenings: chalk taps
for k in range(6): add(24.3 + k * 0.27, thud(0.05, 1500, 6000), 0.35)
# L10 crowd bets, coins
add(25.94, murmur(2.2), 0.35); add(26.2, coins(8), 0.6)
# L11 «Раз. Два. Три.» big bells
for k, t0 in enumerate([29.8, 30.46, 31.09]): add(t0, bell(mtof(69 + (0, 0, 5)[k]), 1.6), 0.7)
# L12 whip + stack slide
add(31.52, whoosh(), 0.6); n = int(SR * 0.7); add(32.1, bp(noise(n), 300, 2500) * np.sin(np.pi * np.linspace(0, 1, n)), 0.35)
# L13 ticking watch on the chain
for k in range(20): add(33.2 + k * 0.11, tick(), 0.45)
# L14 crunch on the shoal + splinters
add(36.3, crunch(), 0.9); add(36.3, thud(0.4, 30, 200), 1.0)
# L15 the Lastochka's horn, the same tune an octave lower and louder
add(37.55, horn(98, 1.3, 0.1), 0.8); add(38.8, gull(2500), 0.15)
# L16 laughter cut, only gulls
add(39.6, gull(2600), 0.3); add(40.2, gull(3000), 0.25)
# L17 watch back, next evening, click
add(41.0, bell(mtof(96), 0.3), 0.2); add(41.0, thud(0.08, 800, 5000), 0.4)
for k in range(5): add(42.2 + k * 0.1, tick(), 0.45)
add(42.75, thud(), 0.8); add(43.6, thud(0.05, 2000, 8000), 0.6)

out = np.tanh(out * 1.1) / np.tanh(1.1)
out = out / np.abs(out).max() * 0.8
st = np.stack([out, out], 1)
with wave.open(sys.argv[1], "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((st * 32767).astype(np.int16).tobytes())
print("ok", T)
