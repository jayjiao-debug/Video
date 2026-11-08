// node sheet.mjs <out.png> — all 8 key poses large, with the props they work against
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { hand, POSE_NAMES } = await import('./poses.mjs?v=' + Date.now());
const out = process.argv[2];
const CW = 720, CH = 760, cols = 4;
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW * cols}" height="${CH * 2}" viewBox="0 0 ${CW * cols} ${CH * 2}"><rect width="100%" height="100%" fill="#e9dfcc"/>`;
const label = ['1 fist (3/4, knuckles on top)', '2 loosening', '3 open, relaxed (side)', '4 palm down (the press)', '5 holding the brush', '6 gripping the paper edge', '7 resting on a shoulder', '8 pushing the stone'];
POSE_NAMES.forEach((p, i) => {
  const cx = (i % cols) * CW, cy = Math.floor(i / cols) * CH;
  s += `<g transform="translate(${cx} ${cy})"><rect x="8" y="8" width="${CW - 16}" height="${CH - 16}" rx="10" fill="#f3ead9"/>`;
  const size = 420, x = CW / 2, y = CH - 150;
  if (p === 'grip') {
    s += hand(p, { x, y, size, layer: 'back' });
    s += `<rect x="60" y="${y - size * 0.5 - 520}" width="${CW - 120}" height="520" fill="#F1E4C6" stroke="#b9a37c" stroke-width="2"/>`;
    s += hand(p, { x, y, size, layer: 'front', sleeve: false });
  } else if (p === 'shoulder') {
    const k = size / 100;
    s += `<path d="M40,${y - 330} C200,${y - 360} 520,${y - 360} ${CW - 40},${y - 330} L${CW - 40},${y + 140} L40,${y + 140}Z" fill="#5b5f6e"/>`;
    s += hand(p, { x, y, size, layer: 'back', sleeve: false });
    s += `<path d="M40,${y - 70 * k + 10} C220,${y - 66 * k - 40} 520,${y - 66 * k - 40} ${CW - 40},${y - 70 * k + 10} L${CW - 40},${y - 70 * k - 120} L40,${y - 70 * k - 120}Z" fill="#e9dfcc"/>`;
    s += `<path d="M40,${y - 70 * k + 10} C220,${y - 66 * k - 40} 520,${y - 66 * k - 40} ${CW - 40},${y - 70 * k + 10}" stroke="#2A1C17" stroke-width="5" fill="none"/>`;
    s += hand(p, { x, y, size, layer: 'front' });
  } else if (p === 'stone') {
    const k = size / 100;
    s += `<path d="M${x + 15 * k},${y - 470} L${CW - 30},${y - 490} L${CW - 30},${y + 120} L${x + 15 * k},${y + 120}Z" fill="#8f8a80" stroke="#2A1C17" stroke-width="5"/>`;
    s += hand(p, { x, y, size });
  } else s += hand(p, { x, y, size });
  s += `<text x="24" y="44" font-family="Noto Sans CJK SC" font-size="26" fill="#5a4a3a">${label[i]}</text></g>`;
});
s += '</svg>';
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: CW * cols, height: CH * 2 } });
await pg.setContent(`<html><body style="margin:0">${s}</body></html>`); await pg.screenshot({ path: out }); await b.close(); console.log('wrote', out);
