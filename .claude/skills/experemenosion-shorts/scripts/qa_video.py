"""Проверка готового ролика: формат, громкость, лист кадров по тактам, склейки относительно сетки.
python -I qa_video.py <video.mp4> --bpm 96 --out checks/
Нужно: ffmpeg/ffprobe в PATH, numpy."""
import sys as _s
_s.stdout.reconfigure(encoding="utf-8")
import argparse, json, os, re, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("mp4"); ap.add_argument("--bpm", type=float, default=96); ap.add_argument("--out", default="checks")
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
FPS = 30
BAR = round(4 * 60 / a.bpm * FPS)

probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate:format=duration,size", "-of", "json", a.mp4], capture_output=True, text=True).stdout)
v = [s for s in probe["streams"] if s["codec_type"] == "video"][0]
has_audio = any(s["codec_type"] == "audio" for s in probe["streams"])
dur = float(probe["format"]["duration"]); size_mb = int(probe["format"]["size"]) / 1e6
vol = subprocess.run(["ffmpeg", "-i", a.mp4, "-af", "volumedetect", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
mean_db = float(re.search(r"mean_volume: (-?[\d.]+)", vol).group(1)) if has_audio else None
max_db = float(re.search(r"max_volume: (-?[\d.]+)", vol).group(1)) if has_audio else None

# лист: кадр 50 каждого такта
bars = int(round(dur * FPS / BAR))
cols = 12
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.mp4, "-vf", f"select='eq(mod(n\\,{BAR})\\,50)',scale=180:320,tile={cols}x{(bars + cols - 1) // cols}", "-vsync", "0", "-frames:v", "1", os.path.join(a.out, "bars.jpg")])

# склейки: разность кадров
W, H = 108, 192
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.mp4, "-vf", f"fps={FPS},scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
diff = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
thr = max(18.0, float(np.percentile(diff, 99)))
cuts = [i + 1 for i, d in enumerate(diff) if d > thr]
off = [c for c in cuts if min(c % BAR, BAR - c % BAR) > 1]
with open(os.path.join(a.out, "cuts.txt"), "w", encoding="utf8") as fh:
    fh.write(f"bar={BAR} frames; cuts (frame: offset from grid)\n")
    for c in cuts: fh.write(f"{c}: {min(c % BAR, BAR - c % BAR)}\n")

res = {
  "size": f"{v['width']}x{v['height']}", "fps": v["r_frame_rate"], "duration_s": round(dur, 2), "size_mb": round(size_mb, 1),
  "audio": has_audio, "mean_volume_db": mean_db, "max_volume_db": max_db,
  "bars": bars, "cuts_total": len(cuts), "cuts_off_grid": off[:30],
  "ok_format": v["width"] == 1080 and v["height"] == 1920, "ok_peaks": max_db is not None and max_db <= -0.9,
}
json.dump(res, open(os.path.join(a.out, "video_qa.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(json.dumps(res, ensure_ascii=False, indent=1))
print("Лист кадров: checks/bars.jpg (кадр 50 каждого такта). Склейки вне сетки: проверь, задуманы ли они (нырок/вспышка).")
