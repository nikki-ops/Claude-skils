"""Build captions.json for film.jsx from faster-whisper word timings.

usage: python3 captions.py words.json script.txt captions.json [--words 2] [--lead 3] [--end 41.8]

words.json  : [[word, start, end], ...] from the final voice (word_timestamps=True)
script.txt  : the exact script; its words replace whisper's spelling/punctuation one to one
Cards hold 1-2 words (breaks at punctuation), appear `lead` frames before the word,
end where the next card starts, and every time is quantized to 1/30 s so no frame
shows two cards.
"""
import json, re, sys

args = sys.argv[1:]
words_p, script_p, out_p = args[:3]
opt = dict(zip(args[3::2], args[4::2]))
per = int(opt.get("--words", 2))
lead = int(opt.get("--lead", 3))
q = lambda t: round(t * 30) / 30

W = json.load(open(words_p, encoding="utf8"))
S = re.findall(r"\S+", open(script_p, encoding="utf8").read())
S = [s for s in S if s not in ("—", "-", "–")]
if len(S) != len(W):
    print(f"warning: script has {len(S)} words, whisper {len(W)}; using whisper spelling where counts differ", file=sys.stderr)
toks = []
for i, (w, a, b) in enumerate(W):
    toks.append([S[i] if len(S) == len(W) else w, a, b])

cards, cur = [], []
for t in toks:
    cur.append(t)
    if len(cur) >= per or re.search(r"[.,!?:;…»]$", t[0]):
        cards.append(cur)
        cur = []
if cur:
    cards.append(cur)

end_all = float(opt.get("--end", toks[-1][2] + 0.6))
out = []
for i, c in enumerate(cards):
    at = q(max(0.0, c[0][1] - lead / 30))
    nxt = q(max(0.0, cards[i + 1][0][1] - lead / 30)) if i + 1 < len(cards) else q(end_all)
    if nxt - at < 1 / 30:
        continue
    out.append({"at": round(at, 4), "dur": round(nxt - at, 4), "t": " ".join(x[0] for x in c)})
json.dump(out, open(out_p, "w", encoding="utf8"), ensure_ascii=False, indent=0)
print(len(out), "cards")
