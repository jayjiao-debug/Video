// node check_rig.mjs — joint-gap checker for the 林冲 rig.
// Renders each pose alone on a magenta background and flood-fills the background from the edges;
// any small enclosed background pocket inside the figure is a gap (a seam opened by a joint, or a
// missing repaint). Large pockets (between an arm and the body, between the legs) are expected and
// are only reported when they are new compared with the rest pose.
import { createRequire } from 'module';
import { lin, EX } from './linchong.mjs';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/npm-tools/node_modules/playwright')); }

const H = 1400, W = 1500, CH = 1600;
const CASES = [
  ['A front rest', { view: 'front', costume: 'A' }],
  ['A front fist up', { view: 'front', costume: 'A', pose: { shoulderR: 80, elbowR: 100, fistR: true } }],
  ['A front arms 30/-40', { view: 'front', costume: 'A', pose: { shoulderL: 30, elbowL: -40, shoulderR: 20, elbowR: 20, headTilt: 8 } }],
  ['A front rigid sleeve 45', { view: 'front', costume: 'A', sleeve: 'rigid', pose: { shoulderR: 45, elbowR: 30, shoulderL: 45, elbowL: 30 } }],
  ['A side rest', { view: 'side', costume: 'A' }],
  ['A side fist up (flip)', { view: 'side', costume: 'A', flip: true, pose: { shoulderR: 62, elbowR: 100, fistR: true } }],
  ['A side walk + 怒', { view: 'side', costume: 'A', expr: EX['怒'], pose: { legL: 14, legR: -12, shoulderL: -15, headTilt: -10 } }],
  ['C front rest', { view: 'front', costume: 'C' }],
  ['C front spear', { view: 'front', costume: 'C', pose: { shoulderR: 12, elbowR: -115 }, props: { spear: { hand: 'R', angle: -26, grip: 0.08 } } }],
  ['C side rest', { view: 'side', costume: 'C' }],
  ['C side carry walk', { view: 'side', costume: 'C', pose: { shoulderL: 25, elbowL: 100, legL: 13, legR: -11 }, props: { spear: { hand: 'L', angle: -50, grip: 0.15 } } }],
  ['C side arm 60/40 hat off', { view: 'side', costume: 'C', hat: false, expr: EX['怒'], pose: { shoulderL: 60, elbowL: 40 } }],
];

const br = await chromium.launch();
const pg = await br.newPage({ viewport: { width: W, height: CH } });
async function pockets(o) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${CH}" viewBox="0 0 ${W} ${CH}"><rect width="${W}" height="${CH}" fill="#ff00ff"/>${lin({ ...o, height: H, x: W / 2, y: CH - 60, expr: o.expr || EX['平静'] })}</svg>`;
  await pg.setContent(`<html><body style="margin:0;background:#ff00ff">${svg}</body></html>`);
  const buf = await pg.screenshot({ type: 'png' });
  return pg.evaluate(async ([b64, W, CH]) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas'); c.width = W; c.height = CH;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, W, CH).data;
    const bgc = (i) => d[i] > 200 && d[i + 1] < 70 && d[i + 2] > 200;
    const seen = new Uint8Array(W * CH), stack = [];
    const push = (x, y) => { const k = y * W + x; if (!seen[k] && bgc(k * 4)) { seen[k] = 1; stack.push(k); } };
    for (let x = 0; x < W; x++) { push(x, 0); push(x, CH - 1); }
    for (let y = 0; y < CH; y++) { push(0, y); push(W - 1, y); }
    while (stack.length) { const k = stack.pop(), x = k % W, y = (k / W) | 0; if (x > 0) push(x - 1, y); if (x < W - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < CH - 1) push(x, y + 1); }
    const out = [];
    for (let k = 0; k < W * CH; k++) {
      if (seen[k] || !bgc(k * 4)) continue;
      let n = 0, x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0;
      const st = [k]; seen[k] = 2;
      while (st.length) {
        const q = st.pop(), x = q % W, y = (q / W) | 0; n++;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= CH) continue;
          const r = yy * W + xx;
          if (!seen[r] && bgc(r * 4)) { seen[r] = 2; st.push(r); }
        }
      }
      if (n >= 4) out.push({ n, box: [x0, y0, x1, y1] });
    }
    return out;
  }, [buf.toString('base64'), W, CH]);
}
let bad = 0;
for (const [name, o] of CASES) {
  // baseline: the same figure (view, costume, flip, expression, hat) standing at rest
  const base = await pockets({ ...o, pose: { headTilt: (o.pose || {}).headTilt || 0 }, props: undefined });
  const res = await pockets(o);
  const near = (p, q) => Math.abs(q.box[0] - p.box[0]) < 14 && Math.abs(q.box[1] - p.box[1]) < 14;
  const gaps = res.filter((p) => p.n < 1500 && !base.some((q) => near(p, q)));
  if (gaps.length) bad++;
  console.log(`${gaps.length ? 'GAP ' : 'ok  '} ${name}: ${res.length} pockets (rest ${base.length})${gaps.length ? ' — new small pockets: ' + gaps.map((p) => `${p.n}px @${p.box.join(',')}`).join('; ') : ''}`);
}
await br.close();
console.log(bad ? `${bad} case(s) with gaps (inspect: pockets between a fist and a held shaft are expected)` : 'no joint gaps');
