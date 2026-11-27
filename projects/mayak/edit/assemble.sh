#!/usr/bin/env bash
# usage: assemble.sh <frames_dir_without_captions> <voice_dir with voice.wav + caps/caps.json> <music.wav> <sfx.wav> <out.mp4>
set -e
F="$1"; V="$2"; M="$3"; X="$4"; O="$5"; T=5.4
ffmpeg -v error -y -i "$V/voice.wav" -i "$M" -i "$X" -filter_complex \
"[0:a]aresample=48000,apad=whole_dur=$T,asplit[va][vb];[1:a]volume=-21dB[m];[2:a]volume=-7dB[s];\
[m][va]sidechaincompress=threshold=0.05:ratio=3:attack=20:release=300[md];\
[md][vb][s]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:$T[o]" -map "[o]" -ar 48000 -ac 2 "$V/mix.wav"
IN=""; FC=""; prev="0:v"; i=1
while read -r file at end; do IN="$IN -i $file"; FC="$FC[$prev][$i:v]overlay=0:0:enable='between(t,$at,$(python3 -c "print(round($end-0.001,3))"))'[v$i];"; prev="v$i"; i=$((i+1)); done < <(python3 -c "import json;[print(c['file'],c['at'],c['end']) for c in json.load(open('$V/caps/caps.json'))]")
ffmpeg -v error -y -framerate 30 -i "$F/f%04d.png" $IN -i "$V/mix.wav" -filter_complex "${FC%;}" -map "[$prev]" -map $i:a -c:v libx264 -pix_fmt yuv420p -crf 18 -c:a aac -b:a 192k -shortest -movflags +faststart "$O"
ffmpeg -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' '
