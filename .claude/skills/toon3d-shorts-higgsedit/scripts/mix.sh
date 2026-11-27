#!/usr/bin/env bash
# usage: mix.sh <dir-with voice.wav music.wav sfx.wav> <duration seconds>
# writes <dir>/mix.wav at about -14 LUFS, true peak <= -1.5 dB; music ducks under the voice
set -e
D="$1"; T="$2"
cd "$D"
ffmpeg -v error -y -i voice.wav -i music.wav -i sfx.wav -filter_complex \
"[0:a]aresample=48000,apad=whole_dur=$T,asplit[va][vb];[1:a]volume=-21dB[m];[2:a]volume=-9dB[s];\
[m][va]sidechaincompress=threshold=0.05:ratio=3:attack=20:release=300[md];\
[md][vb][s]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:$T[o]" \
-map "[o]" -ar 48000 -ac 2 mix.wav
ffmpeg -i mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
