#!/bin/bash
# sheet.sh outDir out.jpg  -> 3-col contact sheet of all f_*.png in outDir
d=$1; o=$2; files=($(ls $d/f_*.png | sort -t_ -k2 -g)); n=${#files[@]}; args=(); fl=""; lay=""
for i in "${!files[@]}"; do args+=(-i "${files[$i]}"); fl+="[$i]scale=640:360[v$i];"; x=$(( (i%3)*640 )); y=$(( (i/3)*360 )); lay+="${x}_${y}|"; done
ins=""; for i in "${!files[@]}"; do ins+="[v$i]"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${fl}${ins}xstack=inputs=$n:layout=${lay%|}:fill=black" $o
