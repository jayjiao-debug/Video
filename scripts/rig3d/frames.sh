#!/bin/bash
# usage: frames.sh <preview-entry.ts> <outdir> <frames> [w h]   entry must call rigLab({... frames: N})
set -e
ENTRY=$(realpath "$1"); OUT=$(realpath -m "$2"); N=$3; W=${4:-540}; H=${5:-960}; B=$(cd "$(dirname "$0")/../.." && pwd)
mkdir -p "$OUT"
TMP=$(mktemp -d "${TMPDIR:-/tmp}/rig3d.XXXXXX")
cd $B && npx esbuild "$ENTRY" --bundle --format=iife --outfile=$TMP/app.js --log-level=error --define:process.env.NODE_ENV='"production"'
echo '<!doctype html><html><head><meta charset="utf-8"></head><body><script src="app.js"></script></body></html>' > $TMP/index.html
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: $W, height: $H } });
  p.on('console', m => { if (m.type() === 'error' || m.text().startsWith('QA')) console.log('console:', m.text()); });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://$TMP/index.html');
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  const c = await p.\$('canvas');
  for (let i = 0; i < $N; i++) { await p.evaluate((i) => window.__frame(i), i); await c.screenshot({ path: '$OUT/f' + String(i).padStart(4,'0') + '.png' }); }
  await b.close();
})();"
rm -rf "$TMP"
echo "wrote $N frames to $OUT"
