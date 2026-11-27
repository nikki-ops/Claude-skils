"""List the most-viewed shorts/videos of one or more channels (no video download).
usage: python channel_top.py out.json <channel_url> [<channel_url> ...] [--top 3] [--scan 60]
Works for YouTube channels (uses /shorts tab when given a channel root) and TikTok profiles via yt-dlp.
Writes out.json: [{channel, url, title, view_count, like_count, comment_count, duration, upload_date}], top N per channel.
"""
import json, subprocess, sys
args = sys.argv[1:]
opt = {}
for k in ("--top", "--scan"):
    if k in args:
        i = args.index(k); opt[k] = int(args[i + 1]); del args[i:i + 2]
out, chans = args[0], args[1:]
top, scan = opt.get("--top", 3), opt.get("--scan", 60)
res = []
for ch in chans:
    url = ch.rstrip("/")
    if "youtube.com/" in url and not url.endswith(("/shorts", "/videos")) and "/watch" not in url:
        url += "/shorts"
    p = subprocess.run(["yt-dlp", "--flat-playlist", "-J", "--playlist-end", str(scan), url], capture_output=True, text=True)
    if p.returncode != 0:
        print("FAILED", ch, p.stderr[-300:], file=sys.stderr); continue
    d = json.loads(p.stdout); items = d.get("entries") or []
    rows = []
    for e in items:
        if not e: continue
        rows.append({"channel": d.get("channel") or d.get("uploader") or ch, "url": e.get("url") or e.get("webpage_url"),
                     "title": e.get("title"), "view_count": e.get("view_count"), "like_count": e.get("like_count"),
                     "comment_count": e.get("comment_count"), "duration": e.get("duration"), "upload_date": e.get("upload_date")})
    rows.sort(key=lambda r: r["view_count"] or 0, reverse=True)
    res += rows[:top]
    print(f"{ch}: {len(rows)} scanned, top {top}: " + "; ".join(f"{r['view_count']} {r['title'][:40] if r['title'] else ''}" for r in rows[:top]))
json.dump(res, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
