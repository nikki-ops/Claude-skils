"""Full-length voice: cap pauses (longer ones kept around 'Раз. Два. Три.'), fit tempo to ~205 wpm,
map TTS sentence segments and word timings to the output.
usage: python3 voice_full.py raw.wav tts_response.json out_dir [--wpm 205]
writes voice.wav, segments.json [{text,start,end}], words.json [[w,start,end]]
"""
import json, re, subprocess, sys
raw, resp, out = sys.argv[1:4]
wpm = float(sys.argv[sys.argv.index("--wpm") + 1]) if "--wpm" in sys.argv else 205
run = lambda c: subprocess.run(c, shell=True, check=True, capture_output=True, text=True)
segs = json.load(open(resp))["segments"]
for s in segs: s["text"] = re.sub(r"\[[^\]]*\]\s*", "", s["text"]).strip()
dur = float(run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {raw}").stdout)
log = subprocess.run(f"ffmpeg -i {raw} -af silencedetect=n=-38dB:d=0.1 -f null -", shell=True, capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
slow = [(s["start"] - 0.3, s["end"] + 0.3) for s in segs if s["text"] in ("Раз.", "Два.", "Три.")]
keep, cur = [], 0.0
for s, e in zip(st, en):
    if s < 0.05: cur = max(cur, e - 0.03); continue
    cap = 0.45 if any(a <= s <= b for a, b in slow) else 0.12
    if e - s > cap: keep.append((cur, s + cap / 2)); cur = e - cap / 2
keep.append((cur, dur))
comp = sum(b - a for a, b in keep)
nw = sum(len(s["text"].split()) for s in segs)
tempo = max(1.0, comp / (nw / wpm * 60))
def mapt(t):
    acc = 0.0
    for a, b in keep:
        if t < a: return acc / tempo
        if t <= b: return (acc + t - a) / tempo
        acc += b - a
    return acc / tempo
sel = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in keep)
run(f"ffmpeg -v error -y -i {raw} -af \"aselect='{sel}',asetpts=N/SR/TB,atempo={tempo:.4f},highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80\" -ar 48000 -ac 1 {out}/voice.wav")
vow = lambda w: max(1, len(re.findall(r"[аеёиоуыэюя]", w, re.I)))
words, oseg = [], []
for s in segs:
    a0 = max(s["start"], 0.08); txt = s["text"].split(); tot = sum(vow(w) for w in txt); a = a0
    for w in txt:
        b = a + (s["end"] - a0) * vow(w) / tot; words.append([w, round(mapt(a), 3), round(mapt(b), 3)]); a = b
    oseg.append({"text": s["text"], "start": round(mapt(a0), 3), "end": round(mapt(s["end"]), 3)})
json.dump(words, open(f"{out}/words.json", "w"), ensure_ascii=False)
json.dump(oseg, open(f"{out}/segments.json", "w"), ensure_ascii=False, indent=0)
total = float(run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {out}/voice.wav").stdout)
print(f"tempo {tempo:.3f}: {dur:.1f}s -> {total:.2f}s, {nw} words, {nw / total * 60:.0f} wpm")
for s in oseg: print(f"{s['start']:6.2f} {s['end']:6.2f}  {s['text'][:50]}")
