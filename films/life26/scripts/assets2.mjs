// Pre-render cardboard puppets at 2x (4000×2800, feet at 2000,2200) into public/cut2/<id>_raw.png; trim with scripts/trim2.py.
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const browserExecutable = process.env.VE_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const ids = process.argv.slice(2);
fs.mkdirSync('public/cut2', { recursive: true });
for (const id of ids) {
  const inputProps = { id, k: 2 };
  const composition = await selectComposition({ serveUrl, id: 'Asset2', inputProps, browserExecutable });
  await renderStill({ composition, serveUrl, frame: 0, inputProps, output: `public/cut2/${id}_raw.png`, imageFormat: 'png', browserExecutable, timeoutInMilliseconds: 180000 });
  console.log('cut', id);
}
