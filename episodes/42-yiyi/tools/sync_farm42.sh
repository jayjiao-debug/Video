#!/bin/bash
# Copy the ep42 sources and plates into the render-farm clone and point its entry at EP42ROUGH (or $1).
set -e
SRC=/home/claude/video/episodes/37-qiqing/remotion
FARM=/home/claude/vibe-render
ENTRYFILE=${1:-EP42ROUGH}
mkdir -p $FARM/src/qq42 $FARM/src/qq $FARM/public/ep42
cp $SRC/src/qq42/*.ts* $FARM/src/qq42/
rm -f $FARM/src/qq42/CHK*.tsx            # throwaway check compositions call registerRoot too
cp $SRC/src/qq/gaits.ts $FARM/src/qq/
cp -r $SRC/public/ep42/. $FARM/public/ep42/
echo "// Remotion entry (the render farm requires this file to mention registerRoot): ./qq42/$ENTRYFILE calls registerRoot() itself.
import './qq42/$ENTRYFILE';" > $FARM/src/index.ts
ls $FARM/src/qq42 | wc -l; du -sh $FARM/public/ep42
