#!/usr/bin/env python3
"""audio-sync-master: тайминги смены кадров для Remotion по озвучке и музыке.

Использование:
  python3 sync.py --stsenariy stsenarii/01-kot.md --golos golos/01-kot.mp3 \
      [--muzyka muzyka/trek.mp3] [--fps 30] [--out render/remotion/src/data/01-kot.timing.json]

Что делает:
  1. Читает таблицу «Таймлайн» из сценария (колонки «Время», «Кадр», «Текст озвучки»).
  2. Находит в озвучке участки речи и паузы (ffmpeg silencedetect).
  3. Раскладывает строки сценария по речи пропорционально числу слов и
     переносит каждую границу кадра в ближайшую паузу (±0.4 с): в середину
     паузы, а в длинной паузе — за 0.3 с до новой фразы.
  4. Если дана музыка — находит темп (BPM) и сетку долей; если доля попадает
     в ту же паузу, граница встаёт на долю. Без паузы рядом — на долю ±0.15 с.
  5. Пишет JSON с кадрами в секундах и во фреймах Remotion.
Нужны только ffmpeg/ffprobe и numpy.
"""
import argparse, json, re, subprocess, sys
from pathlib import Path

import numpy as np

PAUSE_SNAP = 0.4
BEAT_SNAP = 0.15


def ffprobe_duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "default=nw=1:nk=1", str(path)], capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def speech_segments(path, noise_db=-35, min_sil=0.25):
    """Участки речи [(start, end)] по silencedetect."""
    dur = ffprobe_duration(path)
    err = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-af",
                          f"silencedetect=noise={noise_db}dB:d={min_sil}", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", err)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    silences = []
    for i, s in enumerate(starts):
        e = ends[i] if i < len(ends) else dur
        silences.append((max(0.0, s), min(dur, e)))
    segs, t = [], 0.0
    for s, e in silences:
        if s > t + 0.05:
            segs.append((t, s))
        t = max(t, e)
    if dur > t + 0.05:
        segs.append((t, dur))
    return dur, segs, silences


def parse_time(s):
    s = s.strip()
    m = re.match(r"(?:(\d+):)?(\d+(?:[.,]\d+)?)$", s)
    if not m:
        return None
    return int(m.group(1) or 0) * 60 + float(m.group(2).replace(",", "."))


def read_timeline(path):
    rows, header = [], None
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line.startswith("|"):
            if header and rows:
                break
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if header is None:
            low = [c.lower() for c in cells]
            if any("текст озвучки" in c for c in low):
                header = low
            continue
        if set("".join(cells)) <= set("-: "):
            continue
        get = lambda key: next((cells[i] for i, h in enumerate(header) if key in h and i < len(cells)), "")
        t = get("время")
        a, _, b = t.replace("—", "–").replace("-", "–").partition("–")
        rows.append({
            "id": get("#") or str(len(rows) + 1),
            "plan_start": parse_time(a) if a else None,
            "plan_end": parse_time(b) if b else None,
            "kadr": get("кадр"),
            "tekst": get("текст озвучки"),
        })
    if not rows:
        sys.exit(f"В {path} не найдена таблица с колонкой «Текст озвучки»")
    return rows


def words(text):
    text = re.sub(r"[\[(].*?[\])]", " ", text)  # ремарки в скобках не произносятся
    return len(re.findall(r"\w+", text))


def speech_time_to_abs(x, segs):
    """x — секунды «чистой речи» от начала → абсолютное время в файле."""
    for s, e in segs:
        if x <= e - s:
            return s + x
        x -= e - s
    return segs[-1][1]


def snap(t, points, radius):
    if not points:
        return t, None
    p = min(points, key=lambda q: abs(q - t))
    return (p, p) if abs(p - t) <= radius else (t, None)


def beats(path, sr=22050, hop=128):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(sr),
                          "-f", "f32le", "-"], capture_output=True, check=True).stdout
    y = np.frombuffer(raw, dtype=np.float32)
    if len(y) < sr * 3:
        return None, []
    win = 1024
    n = (len(y) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(n)[:, None]
    spec = np.abs(np.fft.rfft(y[idx] * np.hanning(win), axis=1))
    flux = np.maximum(np.diff(np.log1p(spec), axis=0), 0).sum(axis=1)
    flux = np.maximum(flux - np.convolve(flux, np.ones(64) / 64, mode="same"), 0)
    fps = sr / hop
    ac = np.correlate(flux, flux, mode="full")[len(flux) - 1:]
    lo, hi = int(fps * 60 / 180), int(fps * 60 / 60)
    lags = np.arange(lo, hi)
    w = np.exp(-0.5 * np.log2((60 * fps / lags) / 120) ** 2)  # предпочтение ~120 BPM
    k = lo + int(np.argmax(ac[lo:hi] * w))
    a_, b_, c_ = ac[k - 1], ac[k], ac[k + 1]
    lag = k + 0.5 * (a_ - c_) / (a_ - 2 * b_ + c_ or 1)  # уточнение до долей фрейма
    t_flux = (np.arange(len(flux)) + 1) * hop / sr + win / (2 * sr) - hop / (2 * sr)
    period = lag / fps
    phases = np.linspace(0, period, 200, endpoint=False)
    score = [np.interp(np.arange(ph, t_flux[-1], period), t_flux, flux).sum() for ph in phases]
    ph = phases[int(np.argmax(score))]
    grid = [round(float(t), 3) for t in np.arange(ph, t_flux[-1], period)]
    return round(60 / period, 1), grid


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--stsenariy", required=True)
    ap.add_argument("--golos", required=True)
    ap.add_argument("--muzyka")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--hvost", type=float, default=0.8, help="секунды после последней фразы")
    ap.add_argument("--out")
    a = ap.parse_args()

    rows = read_timeline(a.stsenariy)
    dur, segs, silences = speech_segments(a.golos)
    if not segs:
        sys.exit("В озвучке не найдена речь (всё тише порога) — проверьте файл")
    speech_total = sum(e - s for s, e in segs)

    counts = [words(r["tekst"]) for r in rows]
    total_words = sum(counts) or 1
    # строки без текста получают долю по плановой длительности (или 1 слово)
    starts, acc = [], 0
    for c in counts:
        starts.append(speech_time_to_abs(speech_total * acc / total_words, segs) if acc else 0.0)
        acc += c

    bpm, grid = (None, [])
    if a.muzyka:
        bpm, grid = beats(a.muzyka)

    bounds, notes = [0.0], []
    for i in range(1, len(rows)):
        t, how = starts[i], "по словам"
        lo = bounds[-1] + 0.3
        near = [(s_, e_) for s_, e_ in silences
                if e_ > lo and min(abs(t - s_), abs(t - e_), 0 if s_ <= t <= e_ else 9) <= PAUSE_SNAP]
        if near:
            s_, e_ = min(near, key=lambda se: abs((se[0] + se[1]) / 2 - t))
            # кадр меняется внутри паузы: посередине, а в длинной паузе — за 0.3 с до новой фразы
            t, how = (max(s_, e_ - 0.3) if e_ - s_ > 0.8 else (s_ + e_) / 2), "пауза"
            inside = [b for b in grid if max(s_, lo) <= b <= e_]
            if inside:
                t, how = min(inside, key=lambda b: abs(b - t)), "пауза+доля"
        elif grid:
            t2, b = snap(t, [g for g in grid if g > lo], BEAT_SNAP)
            if b is not None:
                t, how = t2, "доля"
        bounds.append(round(max(t, lo), 3))
        notes.append(how)
    end = round(min(dur, segs[-1][1] + a.hvost) if dur > segs[-1][1] else dur, 3)
    end = max(end, segs[-1][1])
    bounds.append(end)

    scenes = []
    for i, r in enumerate(rows):
        s, e = bounds[i], bounds[i + 1]
        f0, f1 = round(s * a.fps), round(e * a.fps)
        scenes.append({
            "id": r["id"], "start": s, "end": e, "from": f0, "durationInFrames": max(1, f1 - f0),
            "plan": [r["plan_start"], r["plan_end"]], "slov": counts[i],
            "granica": "начало" if i == 0 else notes[i - 1],
            "kadr": r["kadr"], "tekst": r["tekst"],
        })
    result = {
        "stsenariy": a.stsenariy, "golos": a.golos, "muzyka": a.muzyka, "fps": a.fps,
        "durationInFrames": round(end * a.fps), "dlitelnost": end,
        "rech": {"segmenty": [[round(s, 3), round(e, 3)] for s, e in segs],
                 "slov_v_minutu": round(total_words / (speech_total / 60), 1)},
        "muzyka_bpm": bpm, "doli": grid[:2000],
        "sceny": scenes,
    }
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if a.out:
        Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        Path(a.out).write_text(text, encoding="utf-8")
    # краткий отчёт
    print(f"Озвучка {dur:.2f} с, речь {speech_total:.2f} с, {result['rech']['slov_v_minutu']} слов/мин"
          + (f", музыка ~{bpm} BPM" if bpm else ""))
    for sc in scenes:
        plan = sc["plan"]
        pl = f"план {plan[0]}–{plan[1]}" if plan[0] is not None else ""
        print(f"  #{sc['id']:>3} {sc['start']:6.2f}–{sc['end']:6.2f} с  кадры {sc['from']:>5}+{sc['durationInFrames']:<4} "
              f"[{sc['granica']}] {pl}")
    if a.out:
        print(f"JSON: {a.out}")


if __name__ == "__main__":
    main()
