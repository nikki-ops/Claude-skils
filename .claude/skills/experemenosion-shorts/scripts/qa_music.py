"""Проверка музыкального трека по цифрам (звук не слушаем — меряем).
python -I qa_music.py <track.wav> --bpm 96 --out checks/
Нужно: pip install librosa numpy; ffmpeg в PATH."""
import sys as _s
_s.stdout.reconfigure(encoding="utf-8")
import argparse, json, os, subprocess, sys
import numpy as np
import librosa

ap = argparse.ArgumentParser()
ap.add_argument("wav"); ap.add_argument("--bpm", type=float, default=96); ap.add_argument("--out", default="checks")
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
y, sr = librosa.load(a.wav, sr=22050)
bar = 4 * 60 / a.bpm
tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
tempo = float(np.atleast_1d(tempo)[0])
rms = librosa.feature.rms(y=y)[0]; t = librosa.times_like(rms, sr=sr)
nb = int(len(y) / sr / bar)
per_bar = [round(float(20 * np.log10(rms[(t >= b * bar) & (t < (b + 1) * bar)].mean() + 1e-9)), 1) for b in range(nb)]
S = np.abs(librosa.stft(y)); f = librosa.fft_frequencies(sr=sr)
band = lambda lo, hi: float(S[(f >= lo) & (f < hi)].mean())
tot = band(20, 8000)
centroid = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())
names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
chroma = librosa.feature.chroma_cqt(y=y, sr=sr).mean(1)
res = {
  "tempo": round(tempo, 1), "tempo_ok": abs(tempo - a.bpm) <= 1.5 or abs(tempo - 2 * a.bpm) <= 2 or abs(tempo - a.bpm / 2) <= 1,
  "peak": round(float(np.abs(y).max()), 3), "peak_ok": float(np.abs(y).max()) <= 0.92,
  "centroid_hz": int(centroid), "centroid_ok": centroid >= 1100,
  "lowmid_200_500_share": round(band(200, 500) / tot, 2),
  "top_notes": [names[i] for i in np.argsort(-chroma)[:5]],
  "rms_db_per_bar": per_bar,
}
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.wav, "-lavfi", "showspectrumpic=s=1600x600:legend=1:scale=log:fscale=log:stop=12000", os.path.join(a.out, "spectrogram.png")])
json.dump(res, open(os.path.join(a.out, "music_qa.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
bad = [k for k in ("tempo_ok", "peak_ok", "centroid_ok") if not res[k]]
print("ПРОВАЛ: " + ", ".join(bad) if bad else "Цифры в норме. Посмотри checks/spectrogram.png и профиль RMS по тактам.")
sys.exit(1 if bad else 0)
