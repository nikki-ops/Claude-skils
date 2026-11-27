"""Make placeholder captions.json and a silent ../mix.wav so `higgsedit build film.jsx` works
before the real voice exists. Words are spread over the shot timings from film.jsx (CUTS),
sentence by sentence, at the film's real length.

usage: python3 stub_assets.py script.txt <edit-dir> [--end 41.8] [--words 2]

Writes <edit-dir>/captions.json, <edit-dir>/words.json (fake timings) and <edit-dir>/../mix.wav.
Replace all three with the real ones (voice_compact.py -> captions.py -> mix.sh) before render.
Standard library only.
"""
import json, re, sys, wave, os

args = sys.argv[1:]
script_p, edit = args[0], args[1]
opt = dict(zip(args[2::2], args[3::2]))
end = float(opt.get("--end", 41.8))
per = int(opt.get("--words", 2))
q = lambda t: round(t * 30) / 30

text = open(script_p, encoding="utf8").read().strip()
sents = [s.strip() for s in re.findall(r"[^.!?…]+[.!?…]+»?", text)]

# shot starts from film.jsx, if present: one sentence per shot boundary where possible
starts = []
fj = os.path.join(edit, "film.jsx")
if os.path.exists(fj):
    m = re.search(r"CUTS\s*=\s*\[(.*?)\];", open(fj, encoding="utf8").read(), re.S)
    if m:
        starts = [float(x) for x in re.findall(r",\s*([\d.]+)\]", m.group(1))]
        tm = re.search(r"const T\s*=\s*([\d.]+)", open(fj, encoding="utf8").read())
        if tm:
            end = float(tm.group(1))

# time each sentence proportionally to its length (syllable proxy = vowels)
vow = lambda s: max(1, len(re.findall(r"[аеёиоуыэюяaeiouy]", s, re.I)))
total = sum(vow(s) for s in sents)
speak = end - 0.4
words, t = [], 0.0
for s in sents:
    d = speak * vow(s) / total
    ws = s.split()
    wt = [vow(w) for w in ws]
    tw = sum(wt)
    a = t
    for w, k in zip(ws, wt):
        b = a + d * k / tw
        words.append([w, round(a, 3), round(b, 3)])
        a = b
    t += d
json.dump(words, open(os.path.join(edit, "words.json"), "w", encoding="utf8"), ensure_ascii=False)

cards, cur = [], []
for w in words:
    cur.append(w)
    if len(cur) >= per or re.search(r"[.,!?:;…»]$", w[0]):
        cards.append(cur); cur = []
if cur:
    cards.append(cur)
out = []
for i, c in enumerate(cards):
    at = q(max(0.0, c[0][1] - 0.1))
    nxt = q(cards[i + 1][0][1] - 0.1) if i + 1 < len(cards) else q(end)
    if nxt - at >= 1 / 30:
        out.append({"at": round(at, 4), "dur": round(nxt - at, 4), "t": " ".join(x[0] for x in c)})
json.dump(out, open(os.path.join(edit, "captions.json"), "w", encoding="utf8"), ensure_ascii=False, indent=0)

mix = os.path.join(edit, "..", "mix.wav")
with wave.open(mix, "wb") as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(48000)
    f.writeframes(b"\0\0\0\0" * int(48000 * end))
wpm = len(words) / end * 60
print(f"{len(sents)} sentences, {len(words)} words ({wpm:.0f} wpm at {end}s), {len(out)} cards; shots in film: {len(starts)}")
if wpm > 215:
    print("note: text is faster than ~205-210 wpm; shorten the script or lengthen the film", file=sys.stderr)
