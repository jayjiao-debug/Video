#!/bin/bash
# THE ENGINE PROOF, part 2: render frames of the Newton film twice, once through its own engine (NewtonFilm) and once
# through the kit's (src/kit/day: makeDayFilm, DayWorld, makeSets; the shots and HUD are Newton's), and compare them
# pixel by pixel. Nothing of the film changes: the kit-wired copy (proof/newton/*) is copied into
# src/videos/newton/_kitproof/ and a temporary composition is added to src/Root.tsx; both are removed on exit.
#   bash scripts/kit/day/proof/render_compare.sh [out_dir] [frames...]      (default: one frame per scene and the joins)
# Exit 0 = every frame identical.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../../.." && pwd)"
cd "$REPO" || exit 2
OUT="${1:-/tmp/dayproof}"; shift || true
FRAMES=("$@"); [ ${#FRAMES[@]} -eq 0 ] && FRAMES=(0 70 300 760 1000 1250 1700 2300 2900 3500 4100 4700 5000)
HS="${KIT_CHROME:-/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell}"
mkdir -p "$OUT"
cp "$REPO/src/Root.tsx" "$OUT/Root.tsx.orig"
cleanup() { cp "$OUT/Root.tsx.orig" "$REPO/src/Root.tsx"; rm -rf "$REPO/src/videos/newton/_kitproof"; }
trap cleanup EXIT
mkdir -p src/videos/newton/_kitproof && cp "$HERE/newton/"* src/videos/newton/_kitproof/
python3 - "$REPO/src/Root.tsx" <<'PY'
import sys; p = sys.argv[1]; s = open(p).read()
s = s.replace('import { NewtonFilm, NEWTON_FRAMES } from "./videos/newton/Film";', 'import { NewtonFilm, NEWTON_FRAMES } from "./videos/newton/Film";\nimport { NewtonKitProof } from "./videos/newton/_kitproof/Film";', 1)
i = s.index('<Composition id="NewtonFilm"'); j = s.index("\n", i)
s = s[:j] + '\n  <Composition id="NewtonKitProof" component={NewtonKitProof} durationInFrames={NEWTON_FRAMES} fps={30} width={1080} height={1920} />' + s[j:]
open(p, "w").write(s)
PY
npx remotion bundle src/index.ts --out-dir "$OUT/bundle" --log=error >/dev/null || exit 3
bad=0
for f in "${FRAMES[@]}"; do
  for c in NewtonFilm NewtonKitProof; do
    npx remotion still "$OUT/bundle" "$c" "$OUT/$c-$f.png" --frame="$f" --gl=swangle --scale="${SCALE:-0.5}" --browser-executable="$HS" --timeout=600000 --log=error >/dev/null 2>&1 || { echo "f$f $c: render failed"; bad=1; }
  done
  n=$(compare -metric AE "$OUT/NewtonFilm-$f.png" "$OUT/NewtonKitProof-$f.png" "$OUT/diff-$f.png" 2>&1 >/dev/null)
  echo "f$f: $n pixels differ"; [ "$n" = "0" ] || bad=1
done
[ $bad = 0 ] && echo "every frame identical" || echo "DIFFERENCES (see $OUT/diff-*.png)"
exit $bad
