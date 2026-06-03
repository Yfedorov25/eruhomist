#!/usr/bin/env bash
# build-frames.sh — збірка туру (секція 05) у WebP frame-sequences
# Вхід: public/videos/tour/scene1_arrival.mp4 (вже склеєний B1->B2->B3),
#        scene2_living.mp4, scene3_water.mp4  (усі готові)
# Вихід: public/frames/tour/desktop/0001..NNNN.webp та /mobile/
set -euo pipefail

IN="public/videos/tour"
OUT_D="public/frames/tour/desktop"
OUT_M="public/frames/tour/mobile"
TMP="public/videos/tour/_tmp"
XFADE=0.8   # крос-фейд між сценами
# FPS=10 → 181 кадрів при master ~18.08с (ціль 150-180). FPS=30 давав ~542 (×3 перебір).
FPS=10

mkdir -p "$OUT_D" "$OUT_M" "$TMP"

# Тривалості сцен
d1=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN/scene1_arrival.mp4")
d2=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN/scene2_living.mp4")
off1=$(python3 -c "print(round($d1-$XFADE,2))")
off2=$(python3 -c "print(round($d1+$d2-2*$XFADE,2))")

# 1) Склеїти 3 сцени з крос-фейдами у майстер
ffmpeg -y \
  -i "$IN/scene1_arrival.mp4" \
  -i "$IN/scene2_living.mp4" \
  -i "$IN/scene3_water.mp4" \
  -filter_complex "\
    [0:v][1:v]xfade=transition=fade:duration=${XFADE}:offset=${off1}[v01]; \
    [v01][2:v]xfade=transition=fade:duration=${XFADE}:offset=${off2},format=yuv420p[vout]" \
  -map "[vout]" -an -c:v libx264 -crf 16 -preset slow "$TMP/tour_master.mp4"

# 2) Desktop 1920w WebP
ffmpeg -y -i "$TMP/tour_master.mp4" \
  -vf "fps=${FPS},scale=1920:-2:flags=lanczos" \
  -c:v libwebp -lossless 0 -q:v 80 -compression_level 6 \
  "$OUT_D/%04d.webp"

# 3) Mobile 1080w WebP
ffmpeg -y -i "$TMP/tour_master.mp4" \
  -vf "fps=${FPS},scale=1080:-2:flags=lanczos" \
  -c:v libwebp -lossless 0 -q:v 78 -compression_level 6 \
  "$OUT_M/%04d.webp"

echo "Desktop frames: $(ls "$OUT_D" | wc -l)"
echo "Mobile frames:  $(ls "$OUT_M" | wc -l)"
echo "Ціль ~150-180 сумарно. Якщо більше — зменш FPS до 24."
rm -rf "$TMP"
