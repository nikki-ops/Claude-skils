# SFX серии «Этот дом снесут»: двигатель бульдозера (по оборотам из audioPlan), удары с треском дерева, сигнал, тиканье, свист склеек.
#   python3 zvuk-snos.py audio.json out.wav
import json, sys, wave
import numpy as np
SR = 44100
rng = np.random.default_rng(7)
d = json.load(open(sys.argv[1]))
N = int(d['dur'] * SR); out = np.zeros(N)
T = lambda s: np.arange(int(SR * s)) / SR
def lp(x, k): return np.convolve(x, np.ones(k) / k, 'same')
def put(sig, t, g):
    i = int(t * SR); j = min(N, i + len(sig))
    if i < N: out[i:j] += sig[:j - i] * g
# двигатель: дизельный рокот — низкие гармоники 35–60 Гц, «стук» цилиндров, шум
eng = np.interp(np.arange(N) / SR, np.arange(len(d['engine'])) * d['step'], d['engine'])
f = 32 + 26 * eng; ph = np.cumsum(2 * np.pi * f / SR)
rumble = np.sign(np.sin(ph)) * .35 + np.sin(2 * ph) * .3 + np.sin(3.02 * ph) * .15
chug = (np.sin(ph * 2) > .6) * 1.0
noise = lp(rng.standard_normal(N), 30) * .4
out += lp(rumble * (.6 + .4 * chug) + noise, 6) * (eng ** 1.2) * .5
def crash():
    t = T(1.4); thump = np.sin(2 * np.pi * (40 + 80 * np.exp(-t * 18)) * t) * np.exp(-t * 6) * 1.2
    n = rng.standard_normal(len(t)); body = (lp(n, 3) - lp(n, 40)) * np.exp(-t * 4) * .9
    s = thump + body
    for k in range(14):  # треск досок
        c0 = rng.uniform(0, .9); i = int(c0 * SR); L = int(.03 * SR)
        s[i:i + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (L / 5)) * rng.uniform(.4, 1)
    return s
def whoosh():
    t = T(.3); n = rng.standard_normal(len(t)); return (lp(n, 4) - lp(n, 30)) * np.sin(np.pi * t / t[-1]) ** 2 * .7
def tick():
    t = T(.05); return np.sin(2 * np.pi * 2600 * t) * np.exp(-t * 90) * .6
def ding():
    t = T(1.2); return (np.sin(2 * np.pi * 1320 * t) + .5 * np.sin(2 * np.pi * 2640 * t)) * np.exp(-t * 3) * .5
def thud():
    t = T(.6); return np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 25)) * t) * np.exp(-t * 9) * 1.2 + lp(rng.standard_normal(len(t)), 8) * np.exp(-t * 12) * .4
def horn():
    t = T(1.0); s = (np.sign(np.sin(2 * np.pi * 330 * t)) + np.sign(np.sin(2 * np.pi * 415 * t))) * .25
    return lp(s, 8) * np.minimum(1, t / .02) * np.minimum(1, (1 - t) / .05)
def sting():
    t = T(1.0); return (np.sin(2 * np.pi * 220 * t) + np.sin(2 * np.pi * 233 * t) + np.sin(2 * np.pi * 311 * t)) * np.exp(-t * 2) * .3
F = {'crash': crash, 'whoosh': whoosh, 'tick': tick, 'ding': ding, 'thud': thud, 'horn': horn, 'sting': sting}
for t, kind, g in d['events']:
    put(F[kind](), t, g)
out = out / max(1e-6, np.abs(out).max()) * .9
w = wave.open(sys.argv[2], 'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype('<i2').tobytes()); w.close()
print('sfx', sys.argv[2])
