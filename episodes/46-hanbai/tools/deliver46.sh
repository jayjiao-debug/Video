#!/bin/bash
# deliver46.sh <master.mp4> <ascii-out-name.mp4>
# Push the HD master in 45 MB parts to the throwaway branch deliver-hanbai (never the working branch) and write the
# owner's .bat (download from raw.githubusercontent.com, join, MD5 check) with tools/hd_bat.py.
set -e
M=$1; NAME=$2; ID=hanbai; SP=/tmp/claude-0/-home-claude/2107a540-40e2-5615-b011-548a7d105ff7/scratchpad
D=$SP/deliver-$ID; rm -rf $D; mkdir -p $D/parts; cd $D
git init -q && git checkout -q -b deliver-$ID
split -b 45M -d "$M" parts/master.mp4.part
MD5=$(md5sum "$M" | cut -d' ' -f1); echo $MD5 > parts/md5.txt
printf 'ep46 HD master (%s), parts of %s. Join: copy /b parts\\master.mp4.part* %s\n' "$MD5" "$NAME" "$NAME" > README.txt
git add -A && git -c user.name=Claude -c user.email=noreply@anthropic.com commit -qm "deliver ep46 HD master $NAME"
git remote add origin https://github.com/jayjiao-debug/Video
git push -q --force origin deliver-$ID 2>&1 | grep -iv "moved\|location\|negotiation" || true
python3 /home/claude/video/tools/hd_bat.py deliver-$ID parts "$NAME" $MD5 $SP/get_hanbai_HD.bat
ls -la parts; echo "md5 $MD5"
