#!/usr/bin/env bash
# usage (inside the edit dir, as ONE background sandbox_exec, size xl):
#   bash render_parts.sh <tag> <start1:end1> [<start2:end2> ...]
# Renders each range to renders/<tag>_<i>.mp4 and logs to renders/<tag>.log.
# Keep the total under ~13 minutes per call (background work stops at 15).
# When all parts exist:  bash render_parts.sh join <out.mp4> <mix.wav> renders/a_0.mp4 renders/a_1.mp4 ...
set -e
mkdir -p renders
if [ "$1" = "join" ]; then
  OUT="$2"; MIX="$3"; shift 3
  : > renders/_l.txt; for f in "$@"; do echo "file '$(realpath "$f")'" >> renders/_l.txt; done
  ffmpeg -v error -y -f concat -safe 0 -i renders/_l.txt -an -c copy renders/_v.mp4
  ffmpeg -v error -y -i renders/_v.mp4 -i "$MIX" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
  ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames -show_entries format=duration -of compact "$OUT"
  exit 0
fi
TAG="$1"; shift
i=0
for r in "$@"; do
  higgsedit render . --bitrate 10M --range "$r" --out "renders/${TAG}_$i.mp4" >> "renders/$TAG.log" 2>&1
  echo "PART $i ($r) EXIT $?" >> "renders/$TAG.log"
  i=$((i+1))
done
echo ALL_DONE >> "renders/$TAG.log"
