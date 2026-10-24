#!/bin/bash
# Copy the ep41 v3 sources and assets into the render-farm clone and point it at EP41V3.
set -e
SRC=/home/claude/video/episodes/37-qiqing/remotion
FARM=/home/claude/vibe-render
mkdir -p $FARM/src/ep41 $FARM/public/ep41
for f in Ep41Film3.tsx scenes3.tsx subs3.ts v3base.tsx figure4.tsx gaits.ts spritesizes.ts fx.tsx vhs.tsx props41.tsx sky41.tsx voyager.tsx s41*.tsx ep41scenes.tsx walker3.tsx mandel.ts; do
  for g in $SRC/src/qq/$f; do [ -f "$g" ] && cp "$g" $FARM/src/ep41/; done
done
cp -r $SRC/public/ep41/. $FARM/public/ep41/
echo "// Remotion entry (the render farm requires this file to mention registerRoot): ./ep41/Ep41Film3 calls registerRoot() itself.
import './ep41/Ep41Film3';" > $FARM/src/index.ts
ls $FARM/src/ep41 | wc -l; du -sh $FARM/public/ep41
