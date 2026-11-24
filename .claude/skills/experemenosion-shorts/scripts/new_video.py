"""Заготовка нового ролика из образца src/rabies.
python -I new_video.py <путь к проекту> <slug латиницей> <ИмяКомпозиции>
Копирует src/rabies → src/<slug>, переименовывает компонент и музыку, регистрирует композицию в src/Root.tsx."""
import sys as _s
_s.stdout.reconfigure(encoding="utf-8")
import os, re, shutil, sys

proj, slug, comp = sys.argv[1], sys.argv[2], sys.argv[3]
src = os.path.join(proj, "src", "rabies"); dst = os.path.join(proj, "src", slug)
if os.path.exists(dst):
    sys.exit(f"{dst} уже существует")
shutil.copytree(src, dst)
os.rename(os.path.join(dst, "RabiesVideo.tsx"), os.path.join(dst, f"{comp}Video.tsx"))
p = os.path.join(dst, f"{comp}Video.tsx")
s = open(p, encoding="utf8").read()
s = s.replace("RabiesVideo", f"{comp}Video").replace("RABIES_FRAMES", f"{comp.upper()}_FRAMES").replace("rabies_music.wav", f"{slug}_music.wav")
open(p, "w", encoding="utf8").write(s)
root = os.path.join(proj, "src", "Root.tsx")
r = open(root, encoding="utf8").read()
r = r.replace('import { RabiesVideo, RABIES_FRAMES } from "./rabies/RabiesVideo";',
              f'import {{ RabiesVideo, RABIES_FRAMES }} from "./rabies/RabiesVideo";\nimport {{ {comp}Video, {comp.upper()}_FRAMES }} from "./{slug}/{comp}Video";')
r = r.replace("  </>\n);", f'    <Composition id="{comp}" component={{{comp}Video}} durationInFrames={{{comp.upper()}_FRAMES}} fps={{30}} width={{1080}} height={{1920}} />\n  </>\n);')
open(root, "w", encoding="utf8").write(r)
print(f"Готово: src/{slug}/ ({comp}Video.tsx, shots.json, music_plan.json), композиция {comp} в Root.tsx")
