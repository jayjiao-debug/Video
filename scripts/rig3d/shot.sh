#!/bin/bash
# usage: shot.sh <preview-entry.ts> <out.png>   (bundles with esbuild, screenshots in headless Chromium)
set -e
ENTRY=$(realpath "$1"); OUT=$(realpath -m "$2"); B=$(cd "$(dirname "$0")/../.." && pwd)
TMP=$(mktemp -d "${TMPDIR:-/tmp}/rig3d.XXXXXX")
cd $B && npx esbuild "$ENTRY" --bundle --format=iife --outfile=$TMP/app.js --log-level=error --define:process.env.NODE_ENV='"production"'
echo '<!doctype html><html><head><meta charset="utf-8"></head><body><script src="app.js"></script></body></html>' > $TMP/index.html
node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('console', m => { if (m.type() === 'error' || m.text().startsWith('QA')) console.log('console:', m.text()); });
  p.on('pageerror', e => console.log('pageerror:', e.message));
  await p.goto('file://$TMP/index.html', { timeout: 300000 });
  await p.waitForFunction(() => window.__done === true, null, { timeout: 300000 });
  const c = await p.\$('canvas'); await c.screenshot({ path: '$OUT' }); await b.close();
})();"
rm -rf "$TMP"
echo "wrote $OUT"
