"""Build one voice version of the intro: compact pauses, fit tempo, word timings, captions JSON, voice.wav.
usage: python3 voice_build.py raw.wav segments.json target_seconds out_dir
segments.json: TTS response segments [{text,start,end}] (bracket tags are stripped).
"""
import json, re, subprocess, sys
raw, segp, target, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
run = lambda c: subprocess.run(c, shell=True, check=True, capture_output=True, text=True)
dur = float(run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {raw}").stdout)
log = subprocess.run(f"ffmpeg -i {raw} -af silencedetect=n=-38dB:d=0.12 -f null -", shell=True, capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]; en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
cap = 0.12; keep, cur = [], 0.0
for s, e in zip(st, en):
    if s < 0.05: cur = max(cur, e - 0.03); continue
    if e - s > cap: keep.append((cur, s + cap / 2)); cur = e - cap / 2
end = en[-1] if len(en) > len(st) - 0 and st and st[-1] > dur - 0.6 else dur
keep.append((cur, min(dur, (st[-1] + 0.08) if st and st[-1] > dur - 0.6 else dur)))
comp = sum(b - a for a, b in keep)
tempo = comp / (target - 0.1)
def mapt(t):                                   # raw time -> output time
    acc = 0.0
    for a, b in keep:
        if t < a: return acc / tempo
        if t <= b: return (acc + t - a) / tempo
        acc += b - a
    return acc / tempo
sel = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in keep)
atm = f"atempo={min(2.0, tempo):.4f}" + (f",atempo={tempo / 2.0:.4f}" if tempo > 2 else "")
run(f"ffmpeg -v error -y -i {raw} -af \"aselect='{sel}',asetpts=N/SR/TB,{atm},highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80\" -ar 48000 -ac 1 {out}/voice.wav")
segs = json.load(open(segp))
vow = lambda w: max(1, len(re.findall(r"[аеёиоуыэюя]", w, re.I)))
words = []
for sg in segs:
    txt = re.sub(r"\[[^\]]*\]", "", sg["text"]).split()
    tot = sum(vow(w) for w in txt); a = sg["start"]
    if sg is segs[0]: a = max(a, 0.1)
    span = sg["end"] - a
    for w in txt:
        b = a + span * vow(w) / tot; words.append([w, round(mapt(a), 3), round(mapt(b), 3)]); a = b
json.dump(words, open(f"{out}/words.json", "w"), ensure_ascii=False)
print(f"tempo {tempo:.3f}  kept {comp:.2f}s of {dur:.2f}s  ->  {comp / tempo:.2f}s, {len(words) / (comp / tempo) * 60:.0f} wpm")
