"""Concatenate chosen takes, cap every pause, speed up, then re-time words.

usage: python3 voice_compact.py out_dir take1.mp3 take2.mp3 ... [--cap 0.2] [--tempo 1.19]

Writes out_dir/voice.wav (48 kHz mono) and out_dir/words.json ([[word,start,end],...]).
Pick --tempo so the result hits the target length (about 205-210 words per minute).
"""
import json, re, subprocess, sys

args = sys.argv[1:]
opts = {}
for k in ("--cap", "--tempo"):
    if k in args:
        i = args.index(k); opts[k] = float(args[i + 1]); del args[i:i + 2]
out, takes = args[0], args[1:]
cap, tempo = opts.get("--cap", 0.2), opts.get("--tempo", 1.19)
run = lambda c: subprocess.run(c, shell=True, check=True, capture_output=True, text=True)

for i, t in enumerate(takes):
    run(f"ffmpeg -v error -y -i '{t}' -ar 48000 -ac 1 {out}/_t{i}.wav")
open(f"{out}/_list.txt", "w").write("".join(f"file '_t{i}.wav'\n" for i in range(len(takes))))
run(f"cd {out} && ffmpeg -v error -y -f concat -safe 0 -i _list.txt -c copy _raw.wav")
log = subprocess.run(f"ffmpeg -i {out}/_raw.wav -af silencedetect=n=-38dB:d=0.12 -f null -", shell=True, capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
dur = float(run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {out}/_raw.wav").stdout)
keep, cur = [], 0.0
for s, e in zip(st, en):
    if s < 0.05:
        cur = max(cur, e - 0.05); continue
    if e - s > cap:
        keep.append((cur, s + cap / 2)); cur = e - cap / 2
keep.append((cur, dur))
sel = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in keep)
run(f"ffmpeg -v error -y -i {out}/_raw.wav -af \"aselect='{sel}',asetpts=N/SR/TB\" {out}/_comp.wav")
run(f"ffmpeg -v error -y -i {out}/_comp.wav -af \"atempo={tempo},highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=80\" {out}/voice.wav")
from faster_whisper import WhisperModel
m = WhisperModel("small", compute_type="int8")
segs, _ = m.transcribe(f"{out}/voice.wav", language="ru", beam_size=5, word_timestamps=True)
ws = [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for s in segs for w in s.words]
json.dump(ws, open(f"{out}/words.json", "w", encoding="utf8"), ensure_ascii=False)
final = float(run(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {out}/voice.wav").stdout)
print(f"raw {dur:.2f}s -> {final:.2f}s, {len(ws)} words, {len(ws) / final * 60:.0f} wpm")
print(" ".join(w for w, a, b in ws))
