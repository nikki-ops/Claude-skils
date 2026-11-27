"""Prepare a reference video for analysis.
usage: python prep.py ref.mp4 out_dir [--seg 11]
Writes: out_dir/prep.json (duration, size, fps, cuts, segments), contact sheets sheet_NN.jpg (1 frame/s, 6x4),
out_dir/ref.wav (48 kHz mono) for transcription.
"""
import json, os, re, subprocess, sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
seg = float(sys.argv[sys.argv.index("--seg") + 1]) if "--seg" in sys.argv else 11.0
os.makedirs(out, exist_ok=True)
run = lambda c: subprocess.run(c, shell=True, capture_output=True, text=True)
pr = json.loads(run(f'ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_type -show_entries format=duration -of json "{src}"').stdout)
dur = float(pr["format"]["duration"]); v = [s for s in pr["streams"] if s["codec_type"] == "video"][0]
n, d = v["r_frame_rate"].split("/"); fps = float(n) / float(d)
log = run(f'ffmpeg -i "{src}" -vf "select=\'gt(scene,0.3)\',showinfo" -f null -').stderr
cuts = [round(float(x), 3) for x in re.findall(r"pts_time:([\d.]+)", log)]
fr = os.path.join(out, "_sheet_frames"); os.makedirs(fr, exist_ok=True)
run(f'ffmpeg -v error -y -i "{src}" -vf fps=1,scale=180:-2 "{fr}/s_%04d.jpg"')
files = sorted(os.listdir(fr)); sheets = []
for k in range(0, len(files), 24):
    ims = [Image.open(os.path.join(fr, f)) for f in files[k:k + 24]]
    w, h = ims[0].size; sh = Image.new("RGB", (w * 6, h * 4), (0, 0, 0))
    for i, im in enumerate(ims): sh.paste(im, ((i % 6) * w, (i // 6) * h))
    p = os.path.join(out, f"sheet_{k // 24 + 1:02d}.jpg"); sh.save(p, quality=85); sheets.append(p)
run(f'ffmpeg -v error -y -i "{src}" -vn -ac 1 -ar 48000 "{os.path.join(out, "ref.wav")}"')
segs = []; a = 0.0
while a < dur - 0.5:
    b = min(dur, a + seg); segs.append([round(a, 2), round(b, 2)]); a = b
info = {"duration": round(dur, 3), "width": v["width"], "height": v["height"], "fps": round(fps, 3), "cuts": cuts, "segments": segs, "sheets": sheets}
json.dump(info, open(os.path.join(out, "prep.json"), "w"), indent=1)
print(json.dumps({k: info[k] for k in ("duration", "width", "height", "fps")}), f"cuts={len(cuts)} segments={len(segs)} sheets={len(sheets)}")
