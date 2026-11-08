// node sheet.mjs <out.png> — all 8 key poses large, with the props they work against
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { hand, POSE_NAMES } = await import('./poses.mjs?v=' + Date.now());
const out = process.argv[2];
const CW = 720, CH = 760, cols = 4;
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW * cols}" height="${CH * 2}" viewBox="0 0 ${CW * cols} ${CH * 2}"><rect width="100%" height="100%" fill="#e9dfcc"/>`;
const label = ['1 fist (3/4, knuckles on top)', '2 loosening', '3 open, relaxed (side)', '4 palm down (the press)', '5 执笔 brush — REDESIGNED', '6 paper-corner grip — REDESIGNED', '7 on a shoulder — REDESIGNED', '8 pushing the stone'];
POSE_NAMES.forEach((p, i) => {
  const cx = (i % cols) * CW, cy = Math.floor(i / cols) * CH;
  s += `<g transform="translate(${cx} ${cy})"><clipPath id="cell${i}"><rect x="8" y="8" width="${CW - 16}" height="${CH - 16}" rx="10"/></clipPath><rect x="8" y="8" width="${CW - 16}" height="${CH - 16}" rx="10" fill="#f3ead9"/><g clip-path="url(#cell${i})">`;
  const size = 420, x = CW / 2, y = CH - 150;
  if (p === 'grip') {
    const k = size / 100, gx = x + 60, gy = y + 60;
    s += hand(p, { x: gx, y: gy, size, layer: 'back' });
    // the sheet: its lower-right corner at local (24, -40)
    const cx = gx + 24 * k, cy = gy - 40 * k;
    s += `<rect x="${cx - 470}" y="${cy - 400}" width="470" height="400" fill="#F1E4C6" stroke="#b9a37c" stroke-width="2"/><rect x="${cx - 470}" y="${cy - 400}" width="470" height="400" fill="#FFD9A0" opacity="0.12"/>`;
    s += hand(p, { x: gx, y: gy, size, layer: 'front', sleeve: false });
  } else if (p === 'shoulder') {
    const k = size / 100, hx = x + 10, hy = y - 300;
    // 林冲's shoulder seen from behind: the knuckle row sits on the top curve, fingers drape over the near side toward us
    const top = hy + 30 * k;
    s += `<path d="M30,${top + 120} C140,${top + 10} 420,${top - 20} ${CW - 30},${top + 30} L${CW - 30},${CH - 20} L30,${CH - 20}Z" fill="#3B4356" stroke="#2A1C17" stroke-width="5"/>`;
    s += `<path d="M30,${top + 170} C160,${top + 70} 420,${top + 40} ${CW - 30},${top + 90}" stroke="#2E3446" stroke-width="10" fill="none" opacity="0.7"/>`;
    s += hand(p, { x: hx, y: hy, size, rot: -8 });
  } else if (p === 'brush') {
    const k = size / 100, bx = x + 150, by = y - 150;
    s += `<rect x="20" y="${by + 59 * k}" width="${CW - 40}" height="${CH - (by + 59 * k) - 20}" fill="#F1E4C6" stroke="#b9a37c" stroke-width="2"/>`;
    s += hand(p, { x: bx, y: by, size });
  } else if (p === 'stone') {
    const k = size / 100;
    s += `<path d="M${x + 15 * k},${y - 470} L${CW - 30},${y - 490} L${CW - 30},${y + 120} L${x + 15 * k},${y + 120}Z" fill="#8f8a80" stroke="#2A1C17" stroke-width="5"/>`;
    s += hand(p, { x, y, size });
  } else s += hand(p, { x, y, size });
  s += `</g><rect x="14" y="14" width="${label[i].length * 15 + 30}" height="42" rx="8" fill="#f3ead9" opacity="0.92"/><text x="24" y="44" font-family="Noto Sans CJK SC" font-size="26" fill="${i >= 4 && i <= 6 ? '#B3302A' : '#5a4a3a'}">${label[i]}</text></g>`;
});
s += '</svg>';
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: CW * cols, height: CH * 2 } });
await pg.setContent(`<html><body style="margin:0">${s}</body></html>`); await pg.screenshot({ path: out }); await b.close(); console.log('wrote', out);
