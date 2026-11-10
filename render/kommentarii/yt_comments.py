#!/usr/bin/env python3
"""Комментарии со всех роликов YouTube-канала (YouTube Data API v3).

Использование (из корня репозитория):
  python3 render/kommentarii/yt_comments.py @gorodpodpiscikov [--posle 2026-11-08] [--video ID]

Ключ API: заголовок X-Goog-Api-Key. В облачной сессии его подставляет прокси (ключ сохранён
в окружении); локально — переменная окружения YT_API_KEY.
Результат: render/kommentarii/out/<дата>/comments.json, comments.csv, svodka.md
(по роликам: ник, текст, лайки, дата; ответы тоже собираются).
"""
import argparse, csv, json, os, sys, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

API = "https://www.googleapis.com/youtube/v3/"


def get(method, **params):
    url = API + method + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    if os.environ.get("YT_API_KEY"):
        req.add_header("X-Goog-Api-Key", os.environ["YT_API_KEY"])
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        if e.code == 403 and "commentsDisabled" in body:
            return {"items": [], "disabled": True}
        sys.exit(f"Ошибка API {e.code} для {method}: {body[:400]}")


def pages(method, **params):
    tok = None
    while True:
        d = get(method, **params, **({"pageToken": tok} if tok else {}))
        yield from d.get("items", [])
        tok = d.get("nextPageToken")
        if not tok:
            break


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kanal", help="@handle канала")
    ap.add_argument("--posle", help="только комментарии после даты ГГГГ-ММ-ДД")
    ap.add_argument("--video", action="append", help="только эти ID роликов")
    a = ap.parse_args()

    ch = get("channels", part="contentDetails,snippet", forHandle=a.kanal.lstrip("@"))
    if not ch.get("items"):
        sys.exit("Канал не найден")
    uploads = ch["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    vids = [(i["contentDetails"]["videoId"], i["snippet"]["title"], i["contentDetails"].get("videoPublishedAt", ""))
            for i in pages("playlistItems", part="contentDetails,snippet", playlistId=uploads, maxResults=50)]
    if a.video:
        vids = [v for v in vids if v[0] in a.video]
    since = datetime.fromisoformat(a.posle).replace(tzinfo=timezone.utc) if a.posle else None

    rows = []
    for vid, title, pub in vids:
        for th in pages("commentThreads", part="snippet,replies", videoId=vid, maxResults=100, textFormat="plainText"):
            items = [th["snippet"]["topLevelComment"]] + th.get("replies", {}).get("comments", [])
            for k, c in enumerate(items):
                s = c["snippet"]
                when = datetime.fromisoformat(s["publishedAt"].replace("Z", "+00:00"))
                if since and when < since:
                    continue
                rows.append({"video": vid, "title": title, "nik": s.get("authorDisplayName", "").lstrip("@"),
                             "tekst": s.get("textDisplay", "").replace("\n", " "), "laiki": s.get("likeCount", 0),
                             "data": s["publishedAt"], "otvet": k > 0})
    out = Path(__file__).parent / "out" / datetime.now().strftime("%Y-%m-%d_%H%M")
    out.mkdir(parents=True, exist_ok=True)
    (out / "comments.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(out / "comments.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["video"])
        w.writeheader(); w.writerows(rows)
    md = [f"# Комментарии {a.kanal} — {len(rows)} шт., роликов {len(vids)}\n"]
    for vid, title, pub in vids:
        rs = [r for r in rows if r["video"] == vid and not r["otvet"]]
        md.append(f"\n## {title} ({pub[:10]}) — {len(rs)}\n")
        md += [f"- **{r['nik']}**: {r['tekst']}" + (f" ❤{r['laiki']}" if r["laiki"] else "") for r in rs]
    (out / "svodka.md").write_text("\n".join(md), encoding="utf-8")
    uniq = len({r["nik"] for r in rows if not r["otvet"]})
    print(f"Роликов: {len(vids)}, комментариев: {len(rows)}, уникальных авторов: {uniq}\nПапка: {out}")


if __name__ == "__main__":
    main()
