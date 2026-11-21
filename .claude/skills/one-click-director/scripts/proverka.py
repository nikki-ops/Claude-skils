#!/usr/bin/env python3
"""one-click-director: проверка готовности ролика к рендеру.

Использование (из корня репозитория):
  python3 .claude/skills/one-click-director/scripts/proverka.py 01-kot [--json]

<id> — имя ролика вида NN-nazvanie: stsenarii/<id>.md, golos/<id>.*, gotovo/<id>.mp4.
Код выхода: 0 — можно рендерить, 1 — есть блокирующие проблемы.
"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
REMOTION = ROOT / "render" / "remotion"
AUD = (".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    vid = args[0].removesuffix(".md")
    res = []  # (статус, что, деталь, как исправить)

    def add(ok, what, detail="", fix="", block=True):
        res.append(("ok" if ok else ("blok" if block else "vnim"), what, detail, fix))
        return ok

    # 1. сценарий
    st = ROOT / "stsenarii" / f"{vid}.md"
    text = st.read_text(encoding="utf-8") if st.exists() else ""
    add(bool(text), "Сценарий", f"stsenarii/{vid}.md",
        "написать сценарий (навык video-analyst или вручную)")
    if text:
        add("текст озвучки" in text.lower() and "|" in text, "Таймлайн в сценарии",
            "таблица с колонкой «Текст озвучки»", "добавить таблицу «Таймлайн»")

    # 2. озвучка
    golos = [p for p in (ROOT / "golos").glob(f"{vid}.*") if p.suffix.lower() in AUD]
    add(bool(golos), "Озвучка", golos[0].relative_to(ROOT).as_posix() if golos else f"golos/{vid}.mp3",
        "записать/сгенерировать озвучку по разделу «Текст озвучки целиком»")

    # 3. музыка и лицензия
    tracks = re.findall(r"muzyka/([^\s`)|*]+\.(?:mp3|wav|m4a|aac|flac|ogg))", text, re.I)
    track = ROOT / "muzyka" / tracks[0] if tracks else None
    if not track:
        add(False, "Музыка", "в сценарии нет ссылки на трек вида muzyka/<файл>",
            "указать трек в строке «Музыка:» или рендерить без музыки", block=False)
    elif add(track.exists(), "Музыка", f"muzyka/{track.name}", "положить трек в muzyka/"):
        lic = [track.with_name(track.stem + s) for s in (".litsenziya.md", ".litsenziya.txt", ".license.txt")]
        add(any(p.exists() for p in lic), "Лицензия на музыку", f"muzyka/{track.stem}.litsenziya.md",
            "добавить файл с источником и условиями лицензии; без него трек не используем")

    # 4. стиль
    add((ROOT / "render" / "stil" / "stil.md").exists(), "Библия стиля", "render/stil/stil.md",
        "навык ai-art-prompter: создать библию стиля", block=False)

    # 5. проект Remotion
    pkg = REMOTION / "package.json"
    has_remotion = pkg.exists() and '"remotion"' in pkg.read_text(encoding="utf-8")
    add(has_remotion, "Проект Remotion", "render/remotion/package.json",
        "навык remotion-create: создать проект в render/remotion")
    if has_remotion:
        add((REMOTION / "node_modules" / "remotion").exists(), "Зависимости", "render/remotion/node_modules",
            "cd render/remotion && npm install")
        src = "\n".join(p.read_text(encoding="utf-8", errors="ignore")
                        for p in (REMOTION / "src").rglob("*.tsx")) if (REMOTION / "src").exists() else ""
        add(re.search(rf"id=[\"'{{`]+{re.escape(vid)}[\"'`}}]", src) is not None, "Композиция",
            f'<Composition id="{vid}"> в render/remotion/src', "добавить композицию с этим id в Root.tsx")

    # 6. сжатые ассеты
    pub = REMOTION / "public" / vid
    marks = sorted(m.parent.relative_to(pub).as_posix() for m in pub.rglob("szhatie.json")) if pub.exists() else []
    add(bool(marks), "Сжатые ассеты", f"render/remotion/public/{vid}/" + (f" ({', '.join(marks)})" if marks else ""),
        "навык asset-compressor")
    if marks and "audio" not in marks and golos:
        add(False, "Сжатое аудио", f"render/remotion/public/{vid}/audio/", "asset-compressor для golos/ и muzyka/", block=False)

    # 7. тайминги
    tj = REMOTION / "src" / "data" / f"{vid}.timing.json"
    if add(tj.exists(), "Тайминги", f"render/remotion/src/data/{vid}.timing.json", "навык audio-sync-master"):
        newer = [p for p in [st, *golos] + ([track] if track and track.exists() else [])
                 if p.exists() and p.stat().st_mtime > tj.stat().st_mtime]
        add(not newer, "Тайминги актуальны", ", ".join(p.name for p in newer) + " новее JSON" if newer else "",
            "перезапустить audio-sync-master")
        try:
            d = json.loads(tj.read_text(encoding="utf-8"))
            add(d.get("durationInFrames", 0) > 0 and d.get("sceny"), "JSON таймингов читается",
                f"{len(d.get('sceny', []))} сцен, {d.get('dlitelnost')} с", "перезапустить audio-sync-master")
        except ValueError as e:
            add(False, "JSON таймингов читается", str(e), "перезапустить audio-sync-master")

    # 8. папка результата
    out = ROOT / "gotovo" / f"{vid}.mp4"
    add((ROOT / "gotovo").is_dir(), "Папка gotovo", "gotovo/", "mkdir gotovo")
    if out.exists():
        add(False, "Готовый файл уже есть", f"gotovo/{vid}.mp4 будет перезаписан", "", block=False)

    if "--json" in sys.argv:
        print(json.dumps([dict(zip(("status", "chto", "detal", "ispravit"), r)) for r in res],
                         ensure_ascii=False, indent=2))
    else:
        icon = {"ok": "✔", "blok": "✖", "vnim": "⚠"}
        print(f"Проверка готовности: {vid}")
        for s, what, detail, fix in res:
            print(f" {icon[s]} {what}: {detail}" + (f"\n     → {fix}" if s != "ok" and fix else ""))
        blocks = sum(1 for r in res if r[0] == "blok")
        print("ГОТОВО К РЕНДЕРУ" if not blocks else f"НЕ ГОТОВО: блокирующих проблем — {blocks}")
    sys.exit(1 if any(r[0] == "blok" for r in res) else 0)


if __name__ == "__main__":
    main()
