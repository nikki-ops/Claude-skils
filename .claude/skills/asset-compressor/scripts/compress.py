#!/usr/bin/env python3
"""asset-compressor: сжатие картинок и аудио перед рендером.

Использование:
  python3 compress.py --vhod <папка или файл> [...] --vyhod render/remotion/public/01-kot \
      [--format 1080x1920] [--kachestvo 82] [--tip auto|golos|muzyka] [--norm]

Оригиналы НЕ меняются: сжатые копии пишутся в --vyhod (структура подпапок сохраняется).
Картинки (png, jpg, jpeg, webp, bmp, tif) → WebP, уменьшение до размера кадра
  (каждая сторона не больше длинной стороны --format, без увеличения;
  прозрачность сохраняется).
Аудио (wav, mp3, m4a, aac, flac, ogg, opus) → MP3:
  голос — моно 44.1 кГц 96 кбит/с; музыка — стерео 44.1 кГц 160 кбит/с.
  --norm — выровнять громкость: голос −16 LUFS, музыка −20 LUFS (ffmpeg loudnorm).
Повторный запуск пропускает файлы, у которых готовая копия новее оригинала.
Нужен только ffmpeg.
"""
import argparse, json, subprocess, sys
from pathlib import Path

IMG = {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff"}
AUD = {".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg", ".opus"}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "ffmpeg error")


def img(src, dst, w, h, q):
    vf = f"scale='min(iw,{w})':'min(ih,{h})':force_original_aspect_ratio=decrease:flags=lanczos"
    run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vf", vf, "-frames:v", "1",
         "-c:v", "libwebp", "-quality", str(q), "-compression_level", "6", str(dst)])


def aud(src, dst, kind, norm):
    voice = kind == "golos"
    af = []
    if norm:
        af.append(f"loudnorm=I={-16 if voice else -20}:TP=-1.5:LRA=11")
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", str(src), "-vn"]
    if af:
        cmd += ["-af", ",".join(af)]
    cmd += ["-ac", "1" if voice else "2", "-ar", "44100", "-c:a", "libmp3lame",
            "-b:a", "96k" if voice else "160k", str(dst)]
    run(cmd)


def kind_of(path, forced):
    if forced != "auto":
        return forced
    parts = {p.lower() for p in path.parts}
    return "golos" if "golos" in parts or "voice" in parts else "muzyka"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vhod", nargs="+", required=True)
    ap.add_argument("--vyhod", required=True)
    ap.add_argument("--format", default="1080x1920", help="максимальный размер картинки ШxВ")
    ap.add_argument("--kachestvo", type=int, default=82)
    ap.add_argument("--tip", default="auto", choices=["auto", "golos", "muzyka"])
    ap.add_argument("--norm", action="store_true")
    a = ap.parse_args()
    w, h = (int(x) for x in a.format.lower().split("x"))
    # фон может быть шире кадра (панорама) — ограничиваем обе стороны длинной стороной кадра
    side = max(w, h)

    out = Path(a.vyhod)
    files = []
    for v in a.vhod:
        p = Path(v)
        if p.is_dir():
            files += [(f, f.relative_to(p)) for f in sorted(p.rglob("*")) if f.is_file()]
        elif p.is_file():
            files.append((p, Path(p.name)))
        else:
            print(f"нет такого пути: {p}", file=sys.stderr)

    total_in = total_out = 0
    report = []
    for src, rel in files:
        ext = src.suffix.lower()
        if ext in IMG:
            dst = out / rel.with_suffix(".webp")
        elif ext in AUD:
            dst = out / rel.with_suffix(".mp3")
        else:
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
            status = "уже сжат"
        else:
            try:
                if ext in IMG:
                    img(src, dst, side, side, a.kachestvo)
                else:
                    aud(src, dst, kind_of(src, a.tip), a.norm)
                status = "ok"
            except RuntimeError as e:
                report.append({"fail": str(src), "oshibka": str(e)})
                print(f"ОШИБКА {src}: {e}")
                continue
        si, so = src.stat().st_size, dst.stat().st_size
        # если «сжатая» копия больше оригинала того же формата — оставляем оригинал
        # (кроме аудио с --norm: там важна выровненная громкость)
        if so >= si and src.suffix.lower() == dst.suffix.lower() and not (ext in AUD and a.norm):
            dst.write_bytes(src.read_bytes())
            so, status = si, "оригинал меньше"
        total_in += si
        total_out += so
        report.append({"vhod": str(src), "vyhod": str(dst), "do_kb": si // 1024, "posle_kb": so // 1024, "status": status})
        print(f"{status:>15}  {si / 1024:9.0f} КБ → {so / 1024:8.0f} КБ  {dst}")

    if total_in:
        print(f"Итого: {total_in / 1048576:.2f} МБ → {total_out / 1048576:.2f} МБ "
              f"(−{100 * (1 - total_out / total_in):.0f} %)")
    (out / "szhatie.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
