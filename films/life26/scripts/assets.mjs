// Pre-render every cardboard puppet (transparent PNG, trimmed later) and every background (JPG) into public/.
//   node scripts/assets.mjs [ids...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const browserExecutable = process.env.VE_BROWSER || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const PUP = ['zhuang','hui','nagel','kant','bentham','singer','schweitzer','lecky','researcher','we','cat','rhino','fly','dog','chicken','bird','frog','fish','bat','hippo','lamp','window','swatter','heart','clipboard','ruler','boat','bridge','sign','tag','b_s_l','b_s_r','b_m_l','b_m_r','b_l_l','b_l_r','b_xl_l','b_xl_r'];
const BG = ['night','savanna','room','studio','pond','river','dusk'];
const only = process.argv.slice(2);
fs.mkdirSync('public/cut', { recursive: true }); fs.mkdirSync('public/bg', { recursive: true });
for (const id of PUP.filter((x) => !only.length || only.includes(x))) {
  const inputProps = { id };
  const composition = await selectComposition({ serveUrl, id: 'Asset', inputProps, browserExecutable });
  await renderStill({ composition, serveUrl, frame: 0, inputProps, output: `public/cut/${id}_raw.png`, imageFormat: 'png', browserExecutable, timeoutInMilliseconds: 120000 });
  console.log('cut', id);
}
for (const id of BG.filter((x) => !only.length || only.includes(x))) {
  const inputProps = { id };
  const composition = await selectComposition({ serveUrl, id: 'Bg', inputProps, browserExecutable });
  await renderStill({ composition, serveUrl, frame: 0, inputProps, output: `public/bg/${id}.jpg`, imageFormat: 'jpeg', jpegQuality: 90, browserExecutable, timeoutInMilliseconds: 120000 });
  console.log('bg', id);
}
