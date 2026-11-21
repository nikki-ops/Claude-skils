#!/usr/bin/env python3
"""Комментарии со всех роликов YouTube-канала — без API и ключей (через yt-dlp, как обычный зритель).

Использование (из корня репозитория):
  python3 render/kommentarii/sobrat.py                      # канал по умолчанию, все ролики
  python3 render/kommentarii/sobrat.py @kanal --posle 2026-11-08 --tolko-novye
Нужен pip-пакет yt-dlp и доступ к www.youtube.com.

Результат: render/kommentarii/out/<дата_время>/
  comments.json / comments.csv — все комментарии (ролик, ник, текст, лайки, дата, ответ ли);
  svodka.md — по роликам; avtory.md — уникальные авторы со всеми их пожеланиями.
--tolko-novye — только комментарии, которых не было в прошлых выгрузках (база: out/vidennye.json).
"""
import argparse, csv, json, subprocess, sys, tempfile, time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parent / "out"


def ids(kanal):
    res = []
    for tab in ("shorts", "videos"):
        p = subprocess.run(["yt-dlp", "--flat-playlist", "--print", "%(id)s\t%(title)s",
                            f"https://www.youtube.com/{kanal}/{tab}"], capture_output=True, text=True)
        for line in p.stdout.splitlines():
            if "\t" in line:
                i, t = line.split("\t", 1)
                if i not in [r[0] for r in res]:
                    res.append((i, t))
    return res


def comments(vid, popytok=4):
    """YouTube иногда отдаёт пустой список при частых запросах — повторяем с паузой."""
    for k in range(popytok):
        info, cs = _comments(vid)
        if cs or (info and not info.get("comment_count")):
            return info, cs
        time.sleep(15 * (k + 1))
    return info, cs


def _comments(vid):
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["yt-dlp", "--skip-download", "--write-comments", "--no-warnings", "-q", "--js-runtimes", "node",
                        "--extractor-args", "youtube:comment_sort=new;max_comments=all,all,all,all",
                        "-o", f"{d}/%(id)s.%(ext)s", f"https://www.youtube.com/shorts/{vid}"], capture_output=True, text=True)
        f = Path(d) / f"{vid}.info.json"
        if not f.exists():
            return None, []
        info = json.loads(f.read_text(encoding="utf-8"))
        return info, info.get("comments") or []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kanal", nargs="?", default="@gorodpodpiscikov")
    ap.add_argument("--posle", help="ГГГГ-ММ-ДД — только комментарии после даты")
    ap.add_argument("--tolko-novye", action="store_true")
    ap.add_argument("--video", action="append", help="только эти ID роликов (можно несколько)")
    a = ap.parse_args()
    since = datetime.fromisoformat(a.posle).replace(tzinfo=timezone.utc).timestamp() if a.posle else 0
    seen_f = ROOT / "vidennye.json"
    seen = set(json.loads(seen_f.read_text())) if seen_f.exists() else set()

    base_f = ROOT / "vse.json"
    base = {c["id"]: c for c in json.loads(base_f.read_text())} if base_f.exists() else {}
    vids = ids(a.kanal)
    if a.video:
        vids = [v for v in vids if v[0] in a.video]
    if not vids:
        sys.exit("Ролики не найдены (проверьте доступ к www.youtube.com)")
    rows = []
    for vid, title in vids:
        info, cs = comments(vid)
        print(f"{title[:60]:60} — {len(cs)}")
        time.sleep(20)
        for c in cs:
            if c.get("timestamp", 0) < since or (a.tolko_novye and c["id"] in seen):
                continue
            rows.append({"video": vid, "title": title, "nik": (c.get("author") or "").lstrip("@"),
                         "tekst": (c.get("text") or "").replace("\n", " "), "laiki": c.get("like_count") or 0,
                         "data": datetime.fromtimestamp(c.get("timestamp", 0), timezone.utc).strftime("%Y-%m-%d %H:%M"),
                         "otvet": c.get("parent", "root") != "root", "id": c["id"]})
    # всё, что видели когда-либо, остаётся в базе (пустая выгрузка ролика не стирает старое)
    for r in rows:
        base[r["id"]] = r
    ROOT.mkdir(exist_ok=True)
    base_f.write_text(json.dumps(list(base.values()), ensure_ascii=False, indent=1), encoding="utf-8")
    if not a.tolko_novye and not a.posle:
        rows = sorted(base.values(), key=lambda r: r["data"])
    out = ROOT / datetime.now().strftime("%Y-%m-%d_%H%M")
    out.mkdir(parents=True, exist_ok=True)
    (out / "comments.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    with open(out / "comments.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["video", "title", "nik", "tekst", "laiki", "data", "otvet", "id"])
        w.writeheader(); w.writerows(rows)
    md = [f"# Комментарии {a.kanal}: {len(rows)} шт. с {len(vids)} роликов\n"]
    for vid, title in vids:
        rs = [r for r in rows if r["video"] == vid and not r["otvet"]]
        if rs:
            md.append(f"\n## {title} — {len(rs)}\n")
            md += [f"- **{r['nik']}** ({r['data']}): {r['tekst']}" for r in rs]
    (out / "svodka.md").write_text("\n".join(md), encoding="utf-8")
    by = {}
    for r in rows:
        if not r["otvet"]:
            by.setdefault(r["nik"], []).append(f"[{r['title'][:30]}] {r['tekst']}")
    (out / "avtory.md").write_text(f"# Авторы: {len(by)}\n\n" + "\n".join(f"- **{n}**: " + " | ".join(t) for n, t in sorted(by.items(), key=lambda x: x[0].lower())), encoding="utf-8")
    ROOT.mkdir(exist_ok=True)
    seen_f.write_text(json.dumps(sorted(seen | {r["id"] for r in rows})))
    print(f"Итого: {len(rows)} комментариев, {len(by)} авторов → {out}")


if __name__ == "__main__":
    main()
