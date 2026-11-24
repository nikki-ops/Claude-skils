#!/usr/bin/env bash
# Финализация: громкость −14 LUFS, пики ≤ −1 dB, перекодирование, копия 720p для телефона.
# bash finalize.sh <render.mp4> <папка ролика> <имя без расширения>
set -e
IN="$1"; DIR="$2"; NAME="$3"
mkdir -p "$DIR"
TMP="$(dirname "$IN")/_final_tmp.mp4"
ffmpeg -v error -y -i "$IN" -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.84:level=false" -ar 44100 -c:a aac -b:a 192k "$TMP"
ffmpeg -v error -y -i "$TMP" -vf scale=720:1280 -c:v libx264 -crf 27 -preset slow -c:a aac -b:a 160k "$(dirname "$IN")/_preview_tmp.mp4"
# кириллица в путях: копируем уже готовые файлы
cp "$TMP" "$DIR/$NAME.mp4"
cp "$(dirname "$IN")/_preview_tmp.mp4" "$DIR/${NAME}_превью.mp4"
rm -f "$TMP" "$(dirname "$IN")/_preview_tmp.mp4"
ffmpeg -i "$DIR/$NAME.mp4" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_volume|max_volume"
ls -la "$DIR/$NAME.mp4" "$DIR/${NAME}_превью.mp4"
