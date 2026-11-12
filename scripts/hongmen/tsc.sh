#!/bin/bash
# Type-check the Hongmen film:  bash scripts/hongmen/tsc.sh                (the film + every preview entry)
#                               bash scripts/hongmen/tsc.sh src/videos/hongmen/shots/segA.ts [more files]
# Prints only the errors that are in src/videos/hongmen (errors from the kits / n8ao are known and ignored).
# The root tsconfig.json only includes src/videos/vasa, so a bare `npx tsc` does not look at this film at all.
cd "$(dirname "$0")/../.."
if [ $# -eq 0 ]; then
  set -- src/videos/hongmen/Film.tsx src/videos/hongmen/preview/film.ts src/videos/hongmen/preview/smoke.ts \
    src/videos/hongmen/preview/filmA.ts src/videos/hongmen/preview/filmB.ts src/videos/hongmen/preview/filmC.ts \
    src/videos/hongmen/preview/filmD.ts src/videos/hongmen/preview/filmE.ts
fi
out=$(timeout 240 npx tsc --noEmit --ignoreConfig --skipLibCheck --jsx react-jsx --target es2020 --moduleResolution bundler --module esnext --strict --esModuleInterop "$@" 2>&1)
echo "$out" | grep "src/videos/hongmen" | grep -v "n8ao" | head -80
n=$(echo "$out" | grep "src/videos/hongmen" | grep -vc "n8ao")
echo "tsc done: $n error line(s) in src/videos/hongmen (0 = clean)"
[ "$n" -eq 0 ]
