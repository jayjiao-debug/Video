// ep64 素纱襌衣 — the embroidered look (owner 2026-11-09 14:24: 「能不能做的像刺绣的质感」).
// The whole film is stitched: a dark silk ground, 锁绣 chain stitch for lines (the Mawangdui technique), 平针 satin for
// filled shapes; the gauze gown in thin sparse pale-gold threads so the ground shows through. Subtitles stay clean type.
//   node frames_emb.mjs <out_dir> [names…]
import fs from 'fs';
import { createRequire } from 'module';
import { chain, satin, sparse, floss, ground } from './embroider.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');

const W = 1920, H = 1080, f2 = (v) => Math.round(v * 100) / 100;
const OUT = process.argv[2] || '.', ONLY = process.argv.slice(3);
const JSEAL = 'data:image/png;base64,' + fs.readFileSync('/home/claude/video/docs/history-video-style/jseal.png').toString('base64');
const WENKAI = '/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai/wenkai-bold.css';
const T = { cream: '#F2E6CC', gold: '#E8BC66', red: '#B8402C', redHi: '#F09A72', brown: '#6A3524', brownHi: '#B07050', thread: '#F2DCB0' };

// ---------------------------------------------------------------- furniture (same as the series)
function sub(rows, o = {}) {
  const x = o.x ?? 150, y0 = o.y ?? 132, fs = o.fs ?? 65, lh = fs * 1.42;
  let s = `<defs><filter id="subsh" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="16"/></filter></defs>`;
  const widths = rows.map((r) => r.replace(/[\[\]]/g, '').length * fs);
  s += `<rect x="${x - 40}" y="${y0 - fs * 1.05}" width="${Math.max(...widths) + 80}" height="${rows.length * lh + 30}" rx="40" fill="#000" opacity="0.45" filter="url(#subsh)"/>`;
  rows.forEach((r, i) => {
    const y = y0 + i * lh; let cx = x, t = '';
    for (const part of r.split(/(\[[^\]]+\])/)) {
      if (!part) continue; const key = part.startsWith('['), txt = key ? part.slice(1, -1) : part;
      t += `<tspan fill="${key ? '#FFF6E6' : T.cream}">${txt}</tspan>`;
      if (key) s += `<rect x="${cx}" y="${y + fs * 0.16}" width="${txt.length * fs}" height="${fs * 0.1}" rx="3" fill="${T.gold}"/>`;
      cx += txt.length * fs;
    }
    s += `<text x="${x}" y="${y}" font-family="Noto Sans CJK SC" font-weight="900" font-size="${fs}">${t}</text>`;
  });
  return s;
}
const stamp = (l1, l2) => `<g font-family="LXGW WenKai" font-weight="700" text-anchor="end"><text x="${W - 160}" y="112" font-size="52" fill="${T.cream}">${l1}</text><rect x="${W - 460}" y="130" width="300" height="3" fill="${T.gold}" opacity="0.8"/><text x="${W - 160}" y="182" font-size="34" fill="${T.cream}" opacity="0.85">${l2}</text></g>`;
const seal = () => `<image href="${JSEAL}" x="${W - 194}" y="${H - 132}" width="74" height="74" opacity="0.9" transform="rotate(-6 ${W - 157} ${H - 95})"/>`;

// ---------------------------------------------------------------- shapes
const P = (x, y) => `${f2(x)},${f2(y)}`;
// a thick polyline as a polygon (for satin bands); simple miter joins
function band(pts, w) {
  const L = [], R = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const nx = (-dy / l) * w / 2, ny = (dx / l) * w / 2; L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]);
  }
  return 'M' + [...L, ...R.reverse()].map((p) => P(...p)).join(' L') + ' Z';
}
const angOf = (a, b) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
// the gown (直裾素纱襌衣), front, laid flat: 通袖长 181.5 : 衣长 132
function gown(cx, top, w, o = {}) {
  const k = w / 181.5, L = 132 * k, hw = w / 2, ch = 26 * k, ax = 34 * k, ay = 50 * k, hx = 40 * k;
  const X = (x) => cx + x, Y = (y) => top + y;
  const outline = `M${P(X(-hw), Y(0))} L${P(X(hw), Y(0))} L${P(X(hw), Y(ch))} C${P(X(hw - 34 * k), Y(ch + 2 * k))} ${P(X(ax + 34 * k), Y(ay - 8 * k))} ${P(X(ax), Y(ay))} L${P(X(hx), Y(L))} L${P(X(-hx), Y(L))} L${P(X(-ax), Y(ay))} C${P(X(-ax - 34 * k), Y(ay - 8 * k))} ${P(X(-hw + 34 * k), Y(ch + 2 * k))} ${P(X(-hw), Y(ch))} Z`;
  const lapA = [X(8 * k), Y(2.5 * k)], lapB = [X(-ax + 3 * k), Y(ay + 6 * k)], lapC = [X(-hx + 4 * k), Y(L - 2.5 * k)];
  const lap = `M${P(...lapA)} L${P(...lapB)} L${P(...lapC)} L${P(X(12 * k), Y(L))} L${P(X(12 * k), Y(12 * k))} Z`;
  const bw = 5.5 * k;
  // the gauze: sparse floss along the grain — down the body, across the sleeves — and a second layer where the front
  // panels overlap, laid at a slight angle so the doubled gauze shows its moiré
  const tw = o.tw ?? Math.max(0.6, 0.4 * k), fg = o.gap ?? Math.max(2.4, 2.1 * k);
  const bodyClip = rect(X(-ax - 2 * k), Y(0), 2 * ax + 4 * k, L + 2), sleeveClip = `M${P(X(-hw - 2), Y(-2))} L${P(X(-ax - 2 * k), Y(-2))} L${P(X(-ax - 2 * k), Y(ay + 10 * k))} L${P(X(-hw - 2), Y(ay + 10 * k))} Z M${P(X(ax + 2 * k), Y(-2))} L${P(X(hw + 2), Y(-2))} L${P(X(hw + 2), Y(ay + 10 * k))} L${P(X(ax + 2 * k), Y(ay + 10 * k))} Z`;
  const gid = 'gw' + Math.round(cx) + Math.round(w);
  let s = `<defs><clipPath id="${gid}c"><path d="${outline}"/></clipPath><filter id="${gid}h" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${f2(Math.max(1.2, 1.4 * k))}"/><feColorMatrix values="0.7 0 0 0 0.16  0 0.7 0 0 0.13  0 0 0.7 0 0.09  0 0 0 1 0"/></filter>` +
    `<linearGradient id="${gid}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF4DA" stop-opacity="0.22"/><stop offset="0.4" stop-color="#FFF4DA" stop-opacity="0.03"/><stop offset="0.62" stop-color="#FFF4DA" stop-opacity="0.15"/><stop offset="1" stop-color="#FFF4DA" stop-opacity="0.02"/></linearGradient></defs>`;
  // what lies behind the gauze, seen through it: softened and lifted (the haze of a sheer layer)
  s += `<g clip-path="url(#${gid}c)"><rect x="${X(-hw)}" y="${Y(0)}" width="${w}" height="${L}" fill="#1C0F0A"/>${o.behind ? `<g filter="url(#${gid}h)">${o.behind}</g>` : ''}<path d="${outline}" fill="#EAD2A2" opacity="${o.film ?? 0.12}"/></g>`;
  const fl = (d, ang, extra = {}) => floss(d, { angle: ang, gap: fg, w: tw, op: o.macro ? 0.7 : 0.34, shadow: o.macro ? 0.3 : 0.12, stitch: o.macro ? 120 : 70, ...extra });
  if (o.macro) s += fl(outline, 90, { seed: 3 }) + fl(outline, 0, { seed: 4 });
  else s += fl(outline, 90, { clip: bodyClip, seed: 3 }) + fl(outline, 0, { clip: sleeveClip, seed: 4 }) + fl(lap, 84, { op: 0.24, seed: 9 });
  s += `<path d="${outline}" fill="url(#${gid}s)"/>`;
  // the brown 绢 bands in dense satin, stitches across each band
  const sat = (a, b, wd) => satin(band([a, b], wd), { angle: angOf(a, b) + 90, gap: Math.max(2.6, 1.9 * k), stitch: wd * 1.1, color: T.brown, hi: T.brownHi, dark: '#2A120A', seed: Math.round(a[0]) });
  const vy = Y((8 * k * (ay + 6 * k)) / (8 * k + ax - 3 * k));
  s += sat([X(-9 * k), Y(bw / 2)], [X(9 * k), Y(bw / 2)], bw) + sat([X(-8 * k), Y(bw / 2)], [X(0), vy], bw);
  s += sat(lapA, lapB, bw) + sat(lapB, lapC, bw);
  s += sat([X(-hw + bw / 2), Y(0)], [X(-hw + bw / 2), Y(ch)], bw) + sat([X(hw - bw / 2), Y(0)], [X(hw - bw / 2), Y(ch)], bw);
  s += sat([X(-hx), Y(L - bw / 2)], [X(hx), Y(L - bw / 2)], bw);
  // the outline in a fine chain stitch, pale gold
  if (o.outline !== false) s += `<g opacity="0.75">${chain(outline, { len: Math.max(4.5, 2.6 * k), w: Math.max(2.2, 1.2 * k), color: '#A88A60', hi: '#E8D2A8' })}</g>`;
  return s;
}
// 云气纹 in chain stitch: three bands of hooked curls across the ground
function clouds(op = 0.9, color = T.red, hi = T.redHi, rowsY = [260, 560, 860]) {
  let d = '', d2 = '';
  rowsY.forEach((y, row) => {
    for (let i = -1; i < 9; i++) {
      const x = i * 260 + (row % 2) * 130;
      d += `M${x},${y} C${x + 60},${y - 70} ${x + 150},${y - 60} ${x + 170},${y - 10} C${x + 185},${y + 30} ${x + 140},${y + 50} ${x + 115},${y + 25} C${x + 100},${y + 10} ${x + 115},${y - 10} ${x + 135},${y - 4} `;
      d2 += `M${x + 170},${y - 10} C${x + 210},${y + 40} ${x + 250},${y + 50} ${x + 290},${y + 20} `;
    }
  });
  return `<g opacity="${op}">${chain(d, { len: 10, w: 6.5, color, hi })}${chain(d2, { len: 9, w: 5, color, hi })}</g>`;
}
const rect = (x, y, w, h) => `M${P(x, y)} L${P(x + w, y)} L${P(x + w, y + h)} L${P(x, y + h)} Z`;
function balance(cx, top, span, tilt, left, right) {
  const a = (tilt * Math.PI) / 180, hx = span / 2, Lp = [cx - hx * Math.cos(a), top - hx * Math.sin(a)], Rp = [cx + hx * Math.cos(a), top + hx * Math.sin(a)];
  const gold = { color: '#C9954E', hi: '#FFE2A8', dark: '#3A2410' };
  let s = satin(`M${P(cx - 110, top + 560)} L${P(cx + 110, top + 560)} L${P(cx + 70, top + 528)} L${P(cx - 70, top + 528)} Z`, { angle: 90, gap: 4, stitch: 40, ...gold, seed: 3 });
  s += satin(rect(cx - 11, top, 22, 530), { angle: 0, gap: 4, stitch: 26, ...gold, seed: 4 });
  s += satin(band([Lp, Rp], 18), { angle: angOf(Lp, Rp) + 90, gap: 4, stitch: 22, ...gold, seed: 5 });
  s += satin(`M${P(cx, top - 16)} L${P(cx - 13, top - 66)} L${P(cx + 13, top - 66)} Z`, { angle: 90, gap: 3.5, stitch: 60, ...gold, seed: 6 });
  for (const [Q, inner] of [[Lp, left], [Rp, right]]) {
    const py = Q[1] + 250, pw = 150;
    s += chain(`M${P(Q[0], Q[1])} L${P(Q[0] - pw, py)} M${P(Q[0], Q[1])} L${P(Q[0] + pw, py)}`, { len: 7, w: 3.2, color: '#B88A50', hi: '#F2D08A' });
    s += satin(`M${P(Q[0] - pw - 12, py)} Q${P(Q[0], py + 48)} ${P(Q[0] + pw + 12, py)} Z`, { angle: 75, gap: 3.6, stitch: 30, ...gold, seed: 8 });
    s += inner(Q[0], py);
  }
  return s;
}
const egg = (cx, cy, r) => {
  const d = `M${P(cx, cy - r * 1.3)} C${P(cx + r * 0.95, cy - r * 1.3)} ${P(cx + r, cy + r * 0.2)} ${P(cx + r * 0.92, cy + r * 0.5)} C${P(cx + r * 0.7, cy + r * 1.05)} ${P(cx - r * 0.7, cy + r * 1.05)} ${P(cx - r * 0.92, cy + r * 0.5)} C${P(cx - r, cy + r * 0.2)} ${P(cx - r * 0.95, cy - r * 1.3)} ${P(cx, cy - r * 1.3)} Z`;
  const shade = `M${P(cx + r * 0.1, cy - r * 1.4)} C${P(cx + r * 1.2, cy - r)} ${P(cx + r * 1.2, cy + r)} ${P(cx - r * 0.2, cy + r * 1.2)} L${P(cx + r * 2, cy + r * 2)} L${P(cx + r * 2, cy - r * 2)} Z`;
  return satin(d, { angle: 62, gap: 3.4, stitch: 18, color: '#F2E6D2', hi: '#FFFFFF', dark: '#6A5640', shade, shadeColor: '#C9B496', seed: 11 }) + chain(d, { len: 6, w: 3, color: '#BCA582', hi: '#FFF4E0' });
};
function silkworm(x, y, len, thick, seed) {
  const n = 12, seg = len / n; let s = '';
  for (let i = n - 1; i >= 0; i--) {
    const t = i / (n - 1), r = thick * (0.62 + 0.38 * Math.sin(Math.min(1, t * 1.15) * Math.PI) ** 0.6) * (i === 0 ? 0.8 : 1);
    const cx = x + i * seg, cy = y - Math.sin(t * Math.PI * 1.2) * thick * 0.18, rx = seg * 0.8;
    const d = `M${P(cx - rx, cy)} C${P(cx - rx, cy - r * 1.1)} ${P(cx + rx, cy - r * 1.1)} ${P(cx + rx, cy)} C${P(cx + rx, cy + r * 1.1)} ${P(cx - rx, cy + r * 1.1)} ${P(cx - rx, cy)} Z`;
    s += satin(d, { angle: 90, gap: 3.2, stitch: r * 2.4, color: '#EFE7D6', hi: '#FFFFFF', dark: '#8C8068', seed: seed + i });
    if (i >= 2 && i <= 10 && i !== 7 && i !== 8) s += satin(rect(cx - seg * 0.18, cy + r * 0.78, seg * 0.36, thick * 0.22), { angle: 90, gap: 3, stitch: 20, color: '#BFB094', hi: '#E8DCC0', dark: '#5A4E3C', seed: seed + 40 + i });
  }
  const hx = x - seg * 0.5;
  s += satin(`M${P(hx - seg * 0.55, y)} C${P(hx - seg * 0.55, y - thick * 0.55)} ${P(hx + seg * 0.55, y - thick * 0.55)} ${P(hx + seg * 0.55, y)} C${P(hx + seg * 0.55, y + thick * 0.55)} ${P(hx - seg * 0.55, y + thick * 0.55)} ${P(hx - seg * 0.55, y)} Z`, { angle: 20, gap: 3, stitch: 16, color: '#7A6A56', hi: '#B8A88C', dark: '#2E261C', seed: seed + 80 });
  s += chain(`M${P(x + seg, y - thick * 0.55)} Q${P(x + seg * 1.5, y - thick * 0.8)} ${P(x + seg * 1.95, y - thick * 0.55)}`, { len: 5, w: 3, color: '#5E5244', hi: '#9A8A74' });
  return s;
}
const leaf = (cx, cy, sc) => {
  const d = `M${P(cx - 520 * sc, cy)} C${P(cx - 380 * sc, cy - 230 * sc)} ${P(cx + 260 * sc, cy - 260 * sc)} ${P(cx + 540 * sc, cy - 30 * sc)} C${P(cx + 300 * sc, cy + 210 * sc)} ${P(cx - 360 * sc, cy + 220 * sc)} ${P(cx - 520 * sc, cy)} Z`;
  return satin(d, { angle: 35, gap: 4.2, stitch: 34, color: '#3E4C30', hi: '#6E8050', dark: '#1A2012', seed: 21 }) + chain(`M${P(cx - 520 * sc, cy)} C${P(cx - 100 * sc, cy - 20 * sc)} ${P(cx + 240 * sc, cy - 26 * sc)} ${P(cx + 540 * sc, cy - 30 * sc)}`, { len: 9, w: 5, color: '#6E8050', hi: '#A8B88A' });
};

// ---------------------------------------------------------------- frames
const FR = {
  hook() {
    let s = ground(W, H, { cx: 0.6, cy: 0.5 }) + clouds(0.55);
    s += balance(1180, 300, 760, 7, (x, y) => gown(x, y - 206, 290, { gap: 1.8, tw: 0.5, film: 0.34 }), (x, y) => egg(x, y - 52, 46));
    s += `<g font-family="Noto Sans CJK SC" font-weight="900" text-anchor="middle"><text x="${1180 - 377}" y="630" font-size="84" fill="${T.gold}">49<tspan font-size="50">克</tspan></text><text x="${1180 + 377}" y="690" font-size="46" fill="${T.cream}" opacity="0.85">一个鸡蛋</text></g>`;
    return s + sub(['这件衣服，', '比一个[鸡蛋]还轻。']) + seal();
  },
  title() {
    const cl = clouds(0.85);
    let s = ground(W, H, { cx: 0.5, cy: 0.38, sheen: 0.2 }) + cl;
    s += gown(960, 80, 1000, { behind: cl });
    s += `<g font-family="Noto Serif CJK SC" font-weight="900" text-anchor="middle"><text x="960" y="920" font-size="70" fill="${T.cream}" letter-spacing="6">2000年前的衣服只有<tspan fill="${T.gold}">49克</tspan>，</text><text x="960" y="1004" font-size="70" fill="${T.cream}" letter-spacing="6">为什么今天织不出来？</text></g>`;
    return s + seal();
  },
  macro() {
    // macro: the plain weave itself. Round threads with a sheen and a twist, over-under at every crossing, open square
    // gaps (方孔) through which the stitched clouds behind glow, out of focus
    let s = ground(W, H, { cx: 0.5, cy: 0.5, sheen: 0.18 });
    s += `<defs><filter id="bok"><feGaussianBlur stdDeviation="7"/></filter></defs><g filter="url(#bok)" opacity="0.9"><g transform="translate(-700 -420) scale(2.0)">${clouds(1)}</g></g>`;
    const gp = 54, tw = 17, ang = -8, R = (n) => { let x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); };
    const thread = (x1, y1, x2, y2, seed) => `<path d="M${f2(x1)},${f2(y1)} L${f2(x2)},${f2(y2)}" stroke="#000" stroke-width="${tw + 4}" opacity="0.45" transform="translate(2 3)"/>` +
      `<path d="M${f2(x1)},${f2(y1)} L${f2(x2)},${f2(y2)}" stroke="#B8955E" stroke-width="${tw}"/>` +
      `<path d="M${f2(x1)},${f2(y1)} L${f2(x2)},${f2(y2)}" stroke="#E8CC94" stroke-width="${tw * 0.55}" transform="translate(-1.5 -1.5)"/>` +
      `<path d="M${f2(x1)},${f2(y1)} L${f2(x2)},${f2(y2)}" stroke="#FFF4DA" stroke-width="${tw * 0.18}" stroke-dasharray="7 5" stroke-dashoffset="${f2(seed * 9)}" transform="translate(-3 -3)" opacity="0.85"/>`;
    let warp = '', weft = '', over = '';
    const N = 28;
    for (let i = -6; i < N; i++) { const x = i * gp + (R(i) - 0.5) * 6; warp += thread(x, -100, x + 30, 1180, i); }
    for (let j = -4; j < N; j++) { const y = j * gp + (R(j + 50) - 0.5) * 6; weft += thread(-100, y, 2020, y - 20, j + 50); }
    // weft on top where (i + j) is odd: redraw a short weft piece across the warp there
    for (let i = -6; i < N; i++) for (let j = -4; j < N; j++) {
      if ((i + j) % 2 === 0) continue;
      const y = j * gp + (R(j + 50) - 0.5) * 6, x = i * gp + (R(i) - 0.5) * 6 + 30 * ((y + 100) / 1280), yy = y - 20 * ((x + 100) / 2120);
      over += thread(x - tw * 0.95, yy + 0.18, x + tw * 0.95, yy - 0.18, j + 50);
    }
    s += `<g transform="rotate(${ang} 960 540)">${weft}${warp}${over}</g>`;
    // the band's edge coming into frame bottom-right, in satin
    s += satin(band([[1500, 1180], [2050, 640]], 260), { angle: angOf([1500, 1180], [2050, 640]) + 90, gap: 9, stitch: 280, color: T.brown, hi: T.brownHi, dark: '#2A120A', seed: 77 });
    s += `<defs><radialGradient id="mv"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#mv)"/>`;
    return s + sub(['900米长的丝，', '只有[1克]。']) + seal();
  },
  worms() {
    let s = ground(W, H, { cx: 0.45, cy: 0.6 }) + leaf(900, 640, 1.25);
    s += silkworm(520, 470, 560, 52, 100) + silkworm(520, 790, 640, 92, 300);
    s += chain(`M470,478 C330,470 250,500 120,486`, { len: 5, w: 2.2, color: T.thread, hi: '#FFFFFF' });
    s += chain(`M465,800 C330,790 250,830 120,812`, { len: 8, w: 6, color: T.thread, hi: '#FFFFFF' });
    s += `<g font-family="Noto Sans CJK SC" font-weight="900"><text x="1230" y="440" font-size="54" fill="${T.cream}">西汉 · <tspan fill="${T.gold}">三眠蚕</tspan></text><text x="1230" y="500" font-size="36" fill="${T.cream}" opacity="0.8">丝细</text><text x="1300" y="770" font-size="54" fill="${T.cream}">今天 · 四眠蚕</text><text x="1300" y="830" font-size="36" fill="${T.cream}" opacity="0.8">个头大，丝更粗</text></g>`;
    return s + sub(['今天的蚕，', '[吃得太好了]。']) + seal();
  },
};

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
fs.mkdirSync(OUT, { recursive: true });
for (const [name, fn] of Object.entries(FR)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  const t0 = Date.now();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg>`;
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${WENKAI}"><style>html,body{margin:0;background:#000}</style></head><body>${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('ok', name, (svg.length / 1e6).toFixed(1) + 'MB', Date.now() - t0 + 'ms');
}
await browser.close();
