# SFX «Купол треснул» (набор «Небоскрёба» + стекло, ветер, скрип, цепи, треск). Было: SFX «Небоскрёб для семьи» (синтез numpy, без сэмплов): набор серии 13 + удар петли, свист взлёта, падение дома, стройка, часы.
#   python3 render/seriya/kupol-01/zvuk.py события.json длительность выход.wav
# события.json — [[секунда, тип, громкость], ...] (scene.html → sfxList()).
import json, sys, wave
import numpy as np

SR = 44100
rng = np.random.default_rng(13)
T = lambda d: np.arange(int(SR * d)) / SR
lp = lambda x, k: np.convolve(x, np.ones(k) / k, 'same')


def env(t, a, d):
    return np.minimum(1, t / a) * np.exp(-t * d)


def snd(kind):
    if kind == 'whoosh':   # склейка: короткий «вжух» (шум с нарастанием и спадом)
        t = T(.26); n = rng.standard_normal(len(t)); s = lp(n, 5) - lp(n, 40)
        return s * np.sin(np.pi * t / t[-1]) ** 2 * .9
    if kind == 'swish':    # длиннее и мягче
        t = T(.55); n = rng.standard_normal(len(t)); s = lp(n, 9) - lp(n, 80)
        return s * np.sin(np.pi * t / t[-1]) ** 1.5 * .8
    if kind == 'pop':      # комментарий выскочил
        t = T(.16); f = 420 + 900 * np.exp(-t * 30)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(t, .004, 22)
    if kind == 'tick':     # маленький щелчок
        t = T(.06); return (np.sin(2 * np.pi * 2300 * t) * .6 + lp(rng.standard_normal(len(t)), 3) * .4) * env(t, .001, 70)
    if kind == 'blip':     # красный «?»
        t = T(.14); return np.sign(np.sin(2 * np.pi * 740 * t)) * .35 * env(t, .003, 26)
    if kind == 'boom':     # акцент на особый дом
        t = T(.55); return (np.sin(2 * np.pi * (55 + 90 * np.exp(-t * 20)) * t) + lp(rng.standard_normal(len(t)), 20) * .3) * env(t, .003, 7)
    if kind == 'drum':     # барабанная дробь под счётчик
        t = T(1.55); s = np.zeros(len(t))
        for i, tt in enumerate(np.linspace(0, 1.4, 30)):
            a = int(tt * SR); n = int(SR * .05)
            s[a:a + n] += lp(rng.standard_normal(n), 6) * np.exp(-np.arange(n) / SR * 60) * (.35 + .65 * i / 30)
        return s
    if kind == 'ding':     # колокольчик
        t = T(1.3); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) * g for f, k, g in [(1320, 3.5, 1), (1980, 5, .5), (2640, 8, .3), (660, 3, .4)])
    if kind == 'sparkle':  # золото
        t = T(.9); s = np.zeros(len(t))
        for i in range(9):
            a = int(i * .07 * SR); n = min(int(SR * .25), len(s) - a); tt = np.arange(n) / SR
            s[a:a + n] += np.sin(2 * np.pi * (1800 + 260 * i) * tt) * np.exp(-tt * 16) * .5
        return s
    if kind == 'click':    # клавиатура телефона
        t = T(.04); return lp(rng.standard_normal(len(t)), 2) * env(t, .0005, 120)
    if kind == 'udar':     # низкий удар петли (одинаковый в 0 с и в конце)
        t = T(1.4); f = 42 + 70 * np.exp(-t * 14)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * 1.0 + lp(rng.standard_normal(len(t)), 30) * .5 * np.exp(-t * 18)) * env(t, .002, 2.6)
    if kind == 'gul':      # низкий гул под удар
        t = T(1.2); return (np.sin(2 * np.pi * 38 * t) + np.sin(2 * np.pi * 57 * t) * .5) * np.sin(np.pi * t / t[-1]) * .6
    if kind == 'vzlet':    # свист взлёта камеры: шум + тон вверх
        t = T(1.3); n = rng.standard_normal(len(t)); f = 300 + 1500 * (t / t[-1]) ** 2
        return ((lp(n, 4) - lp(n, 30)) * .7 + np.sin(2 * np.pi * np.cumsum(f) / SR) * .25) * np.sin(np.pi * t / t[-1]) ** 1.2
    if kind == 'fall':     # дом падает с неба: свист вниз
        t = T(1.1); f = 1700 * np.exp(-t * 1.6) + 250
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 * np.minimum(1, t / .1)
    if kind == 'thud':     # глухой бум приземления
        t = T(.7); return (np.sin(2 * np.pi * (48 + 60 * np.exp(-t * 25)) * t) + lp(rng.standard_normal(len(t)), 40) * .6) * env(t, .002, 9)
    if kind == 'etazh':    # этаж: короткий строительный щелчок-удар
        t = T(.09); return (lp(rng.standard_normal(len(t)), 3) * .7 + np.sin(2 * np.pi * 900 * t) * .4) * env(t, .0008, 55)
    if kind == 'chasy':    # тиканье часов (деревянный щелчок)
        t = T(.07); return (np.sin(2 * np.pi * 1600 * t) * .7 + np.sin(2 * np.pi * 2900 * t) * .3) * env(t, .0005, 90)
    if kind == 'steklo':   # звон стекла: шумовой треск + высокие тона с затуханием
        t = T(1.6); n = rng.standard_normal(len(t)); s = (n - lp(n, 3)) * np.exp(-t * 9) * .8
        for f, k in [(2630, 5), (3910, 7), (5170, 9), (3320, 6), (4480, 8)]: s += np.sin(2 * np.pi * f * t + rng.random() * 6) * np.exp(-t * k) * .35
        return s
    if kind == 'tresk':    # треск трещины: серия коротких щелчков
        t = T(.9); s = np.zeros(len(t))
        for i in range(22):
            a = int(rng.random() * .8 * SR); m = int(SR * .012); s[a:a + m] += lp(rng.standard_normal(m), 2) * (.4 + rng.random() * .6)
        return s
    if kind == 'veter':    # вой ветра: полосовой шум с плавающим тоном
        t = T(3.2); n = rng.standard_normal(len(t)); s = lp(n, 6) - lp(n, 60)
        s = s * (1 + .6 * np.sin(2 * np.pi * .7 * t)) + np.sin(2 * np.pi * np.cumsum(300 + 180 * np.sin(2 * np.pi * .4 * t)) / SR) * .25
        return s * np.sin(np.pi * t / t[-1]) ** .8
    if kind == 'skrip':    # скрип отрыва дома
        t = T(.7); f = 140 + 60 * np.sin(2 * np.pi * 6 * t) + 120 * t
        return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .3 * np.sin(np.pi * t / t[-1])
    if kind == 'svist':    # свист улёта вверх
        t = T(1.0); f = 500 + 1600 * (t / t[-1]) ** 1.5
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * .45 * np.sin(np.pi * t / t[-1])
    if kind == 'lyazg':    # лязг цепи: металлические удары
        t = T(.6); s = np.zeros(len(t))
        for i in range(5):
            a = int(i * .09 * SR); m = len(t) - a; tt = np.arange(m) / SR
            s[a:] += sum(np.sin(2 * np.pi * f * tt) for f in (1210 + i * 90, 2470, 3330)) * np.exp(-tt * 28) * .3
        return s
    if kind == 'natyag':   # натяжение цепи: низкий скрип
        t = T(1.0); f = 70 + 40 * t
        return (np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * .25 + lp(rng.standard_normal(len(t)), 30) * .3) * np.sin(np.pi * t / t[-1])
    return np.zeros(1)


def main():
    ev = json.load(open(sys.argv[1])); dur = float(sys.argv[2]); out = sys.argv[3]
    mix = np.zeros(int(SR * (dur + 1.5)))
    cache = {}
    for t, kind, g in ev:
        if kind not in cache:
            x = snd(kind); m = np.max(np.abs(x)) or 1; cache[kind] = x / m
        x = cache[kind] * g; a = int(t * SR); mix[a:a + len(x)] += x[:max(0, len(mix) - a)]
    mix = mix[:int(SR * dur)]
    mix = mix / (np.max(np.abs(mix)) or 1) * .8
    st = np.stack([mix, mix], 1)
    with wave.open(out, 'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
    print('sfx:', len(ev), 'событий →', out)


if __name__ == '__main__':
    main()
