// ep64 素纱襌衣 — look frames (style B「漆」 dark, the series standard). The gown is the only light thing in the frame,
// half transparent: what is behind it shows through. People only as silhouettes; no hands; no human remains; the 1983
// thief (17, a minor) never appears — only the empty case, the torch beam, the glass.
//   node frames.mjs <out_dir> [names…]
import fs from 'fs';
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');

const W = 1920, H = 1080;
const f2 = (v) => Math.round(v * 100) / 100;
const OUT = process.argv[2] || '.';
const ONLY = process.argv.slice(3);
const JSEAL = 'data:image/png;base64,' + fs.readFileSync('/home/claude/video/docs/history-video-style/jseal.png').toString('base64');
const WENKAI = '/home/claude/video/episodes/36-shanghuo/remotion/public/fonts/wenkai/wenkai-bold.css';

// ---------------------------------------------------------------- palette (lacquer)
const C = { g0: '#0E0705', g1: '#1A0D09', g2: '#2A130C', red: '#9E2B1E', red2: '#C0432C', cream: '#F2E6CC', gold: '#E8BC66',
  gauze: '#E6C89E', gauzeHi: '#FFF0D2', edge: '#6A3524', edge2: '#8A4A30' };

// ---------------------------------------------------------------- furniture: layout-D subtitle, stamp, seal
function sub(rows, o = {}) {
  // rows: strings with [key] marks; top-left, stacked
  const x = o.x ?? 150, y0 = o.y ?? 132, fs = o.fs ?? 65, lh = fs * 1.42;
  let s = `<defs><filter id="subsh" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="16"/></filter></defs>`;
  const widths = rows.map((r) => r.replace(/[\[\]]/g, '').length * fs);
  s += `<rect x="${x - 40}" y="${y0 - fs * 1.05}" width="${Math.max(...widths) + 80}" height="${rows.length * lh + 30}" rx="40" fill="#000" opacity="0.38" filter="url(#subsh)"/>`;
  rows.forEach((r, i) => {
    const y = y0 + i * lh;
    let cx = x, t = '';
    for (const part of r.split(/(\[[^\]]+\])/)) {
      if (!part) continue;
      const key = part.startsWith('[');
      const txt = key ? part.slice(1, -1) : part;
      t += `<tspan fill="${key ? '#FFF6E6' : C.cream}">${txt}</tspan>`;
      if (key) s += `<rect x="${cx}" y="${y + fs * 0.16}" width="${txt.length * fs}" height="${fs * 0.1}" rx="3" fill="${C.gold}"/>`;
      cx += txt.length * fs;
    }
    s += `<text x="${x}" y="${y}" font-family="Noto Sans CJK SC" font-weight="900" font-size="${fs}" letter-spacing="0">${t}</text>`;
  });
  return s;
}
const stamp = (l1, l2) => `<g font-family="LXGW WenKai" font-weight="700" text-anchor="end"><text x="${W - 160}" y="112" font-size="52" fill="${C.cream}">${l1}</text>` +
  `<rect x="${W - 160 - 300}" y="130" width="300" height="3" fill="${C.gold}" opacity="0.8"/><text x="${W - 160}" y="182" font-size="34" fill="${C.cream}" opacity="0.85">${l2}</text></g>`;
const seal = () => `<image href="${JSEAL}" x="${W - 120 - 74}" y="${H - 58 - 74}" width="74" height="74" opacity="0.9" transform="rotate(-6 ${W - 120 - 37} ${H - 58 - 37})"/>`;

// ---------------------------------------------------------------- the lacquer world
function lacquer(o = {}) {
  let s = `<defs><radialGradient id="lq" cx="${o.cx ?? 0.5}" cy="${o.cy ?? 0.48}" r="0.8"><stop offset="0" stop-color="${o.mid || C.g2}"/><stop offset="0.6" stop-color="${C.g1}"/><stop offset="1" stop-color="${C.g0}"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#lq)"/>`;
  if (o.clouds !== false) s += clouds(o.cloudOp ?? 0.5, o.cloudY ?? 0);
  return s;
}
// 云气纹: the scrolling cloud pattern of Mawangdui lacquer, cinnabar on black, drawn as a band of long hooked curls
function clouds(op, dy = 0, color = C.red) {
  let s = `<g opacity="${op}" fill="none" stroke="${color}" stroke-linecap="round">`;
  for (let row = 0; row < 3; row++) {
    const y = 260 + row * 300 + dy;
    for (let i = -1; i < 9; i++) {
      const x = i * 260 + (row % 2) * 130;
      s += `<path d="M${x},${y} C${x + 60},${y - 70} ${x + 150},${y - 60} ${x + 170},${y - 10} C${x + 185},${y + 30} ${x + 140},${y + 50} ${x + 115},${y + 25} C${x + 100},${y + 10} ${x + 115},${y - 10} ${x + 135},${y - 4}" stroke-width="7"/>` +
        `<path d="M${x + 170},${y - 10} C${x + 210},${y + 40} ${x + 250},${y + 50} ${x + 290},${y + 20}" stroke-width="4"/>` +
        `<path d="M${x + 40},${y + 60} q30,-26 60,-6" stroke-width="3"/>`;
    }
  }
  return s + '</g>';
}
const spot = (cx, cy, rx, ry, op = 0.5, col = '#FFD9A0') => `<defs><radialGradient id="sp${cx}${cy}"><stop offset="0" stop-color="${col}" stop-opacity="${op}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#sp${cx}${cy})" style="mix-blend-mode:screen"/>`;

// ---------------------------------------------------------------- the gown (直裾素纱襌衣), laid flat, sleeves out
// width = 通袖长 181.5 cm, length = 衣长 132 cm (ratio 1.375). Gauze body half transparent with the weave; collar,
// lapel, cuffs and hem in the heavier brown 绢 (opaque). Returns SVG centred on (cx, top), width w.
function gown(cx, top, w, o = {}) {
  const k = w / 181.5, L = 132 * k, id = o.id || 'g';
  const hw = w / 2, ch = 26 * k;              // cuff height (袖口)
  const ax = 34 * k, ay = 50 * k;             // the armpit: the sleeve deepens toward the body (the curved 胡)
  const hx = 40 * k;                          // half-width at the hem (the body flares a little)
  const P = (x, y) => `${f2(cx + x)},${f2(top + y)}`;
  const outline = `M${P(-hw, 0)} L${P(hw, 0)} L${P(hw, ch)} C${P(hw - 34 * k, ch + 2 * k)} ${P(ax + 34 * k, ay - 8 * k)} ${P(ax, ay)} L${P(hx, L)} L${P(-hx, L)} L${P(-ax, ay)} C${P(-ax - 34 * k, ay - 8 * k)} ${P(-hw + 34 * k, ch + 2 * k)} ${P(-hw, ch)}Z`;
  if (o.outlineOnly) return `<path d="${outline}" fill="${o.fill || 'none'}" stroke="${o.stroke || C.gauzeHi}" stroke-width="${f2(1.6 * k)}" opacity="${o.opacity ?? 1}"/>`;
  const cell = o.cell ?? 4;
  let s = `<defs><pattern id="${id}weave" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><rect width="${cell}" height="${cell}" fill="${C.gauze}" opacity="${o.op ?? 0.15}"/>` +
    `<path d="M0,0.4 H${cell} M0.4,0 V${cell}" stroke="${C.gauzeHi}" stroke-width="0.7" opacity="${o.mesh ?? 0.32}"/></pattern>` +
    `<linearGradient id="${id}sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.gauzeHi}" stop-opacity="0.30"/><stop offset="0.45" stop-color="${C.gauzeHi}" stop-opacity="0.04"/><stop offset="0.7" stop-color="${C.gauzeHi}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.gauzeHi}" stop-opacity="0.02"/></linearGradient>` +
    `<filter id="${id}glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f2(10 * k)}"/></filter><clipPath id="${id}clip"><path d="${outline}"/></clipPath></defs>`;
  if (o.glow !== false) s += `<path d="${outline}" fill="${C.gauzeHi}" opacity="0.10" filter="url(#${id}glow)"/>`;
  s += `<path d="${outline}" fill="url(#${id}weave)"/><path d="${outline}" fill="url(#${id}sheen)"/>`;
  // 右衽: the outer front panel's edge runs from the right of the neck down to the left armpit, then straight down
  // (直裾); where the two front panels overlap the gauze is doubled, so it reads denser
  const lapA = [8 * k, 0], lapB = [-ax + 3 * k, ay + 6 * k], lapC = [-hx + 4 * k, L];
  s += `<g clip-path="url(#${id}clip)"><path d="M${P(...lapA)} L${P(...lapB)} L${P(...lapC)} L${P(12 * k, L)} L${P(12 * k, 12 * k)}Z" fill="url(#${id}weave)" opacity="0.95"/></g>`;
  s += `<g stroke="${C.gauzeHi}" stroke-width="${f2(1.1 * k)}" opacity="0.18" fill="none"><path d="M${P(ax - 6 * k, ay + 4 * k)} C${P(ax - 4 * k, 80 * k)} ${P(hx - 8 * k, 110 * k)} ${P(hx - 10 * k, L - 3 * k)}"/><path d="M${P(-hw + 40 * k, 3 * k)} q${f2(3 * k)},${f2(12 * k)} 0,${f2(24 * k)}"/><path d="M${P(hw - 46 * k, 3 * k)} q${f2(-3 * k)},${f2(12 * k)} 0,${f2(24 * k)}"/></g>`;
  // the heavier brown 绢 bands: the outer lapel (neck → armpit → hem), the inner lapel's short stroke into the V,
  // the back of the neck, the cuffs, the hem
  const bwd = 5.5 * k;
  const band = (d) => `<path d="${d}" stroke="${C.edge}" stroke-width="${f2(bwd)}" fill="none" stroke-linejoin="round"/><path d="${d}" stroke="${C.edge2}" stroke-width="${f2(bwd * 0.28)}" fill="none" opacity="0.45" transform="translate(${f2(-bwd * 0.2)} ${f2(-bwd * 0.12)})"/>`;
  const vx = 0, vy = 8 * k * (ay + 6 * k) / (8 * k + ax - 3 * k);   // where the inner lapel meets the outer one
  s += band(`M${P(-8 * k, bwd * 0.5)} L${P(8 * k, bwd * 0.5)}`);
  s += band(`M${P(-8 * k, bwd * 0.5)} L${P(vx, vy)}`);
  s += band(`M${P(lapA[0], bwd * 0.5)} L${P(...lapB)} L${P(lapC[0], L - bwd * 0.5)}`);
  s += band(`M${P(-hw + bwd / 2, 0)} L${P(-hw + bwd / 2, ch)}`) + band(`M${P(hw - bwd / 2, 0)} L${P(hw - bwd / 2, ch)}`);
  s += band(`M${P(-hx, L - bwd / 2)} L${P(hx, L - bwd / 2)}`);
  s += `<path d="${outline}" fill="none" stroke="${C.gauzeHi}" stroke-width="${f2(1.2 * k)}" opacity="0.3"/>`;
  return s;
}

// ---------------------------------------------------------------- props
const egg = (cx, cy, r) => `<defs><radialGradient id="egg" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#FFF8EC"/><stop offset="0.6" stop-color="#EBD9BC"/><stop offset="1" stop-color="#A88C68"/></radialGradient></defs>` +
  `<path d="M${cx},${cy - r * 1.3} C${cx + r * 0.95},${cy - r * 1.3} ${cx + r},${cy + r * 0.2} ${cx + r * 0.92},${cy + r * 0.5} C${cx + r * 0.7},${cy + r * 1.05} ${cx - r * 0.7},${cy + r * 1.05} ${cx - r * 0.92},${cy + r * 0.5} C${cx - r},${cy + r * 0.2} ${cx - r * 0.95},${cy - r * 1.3} ${cx},${cy - r * 1.3}Z" fill="url(#egg)"/>`;
// a balance: a bronze post, a beam tilted by `tilt` degrees (right side down), two pans on three cords each
function balance(cx, top, span, tilt, left, right) {
  const a = (tilt * Math.PI) / 180, hx = span / 2;
  const L = [cx - hx * Math.cos(a), top - hx * Math.sin(a)], R = [cx + hx * Math.cos(a), top + hx * Math.sin(a)];
  const cord = 250, pw = 150;
  let s = `<defs><linearGradient id="brz" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A3A1C"/><stop offset="0.5" stop-color="#C9954E"/><stop offset="1" stop-color="#4A2E14"/></linearGradient></defs>`;
  s += `<path d="M${cx - 110},${top + 560} L${cx + 110},${top + 560} L${cx + 70},${top + 530} L${cx - 70},${top + 530}Z" fill="url(#brz)"/><rect x="${cx - 9}" y="${top}" width="18" height="535" fill="url(#brz)"/>`;
  s += `<line x1="${f2(L[0])}" y1="${f2(L[1])}" x2="${f2(R[0])}" y2="${f2(R[1])}" stroke="url(#brz)" stroke-width="14" stroke-linecap="round"/><circle cx="${cx}" cy="${top}" r="16" fill="#C9954E"/><path d="M${cx},${top - 18} l-12,-46 l24,0Z" fill="#C9954E"/>`;
  for (const [P, inner] of [[L, left], [R, right]]) {
    const py = P[1] + cord;
    s += `<g stroke="#B88A50" stroke-width="2" opacity="0.8"><line x1="${f2(P[0])}" y1="${f2(P[1])}" x2="${f2(P[0] - pw)}" y2="${f2(py)}"/><line x1="${f2(P[0])}" y1="${f2(P[1])}" x2="${f2(P[0])}" y2="${f2(py + 6)}"/><line x1="${f2(P[0])}" y1="${f2(P[1])}" x2="${f2(P[0] + pw)}" y2="${f2(py)}"/></g>`;
    s += `<path d="M${f2(P[0] - pw - 10)},${f2(py)} Q${f2(P[0])},${f2(py + 46)} ${f2(P[0] + pw + 10)},${f2(py)}Z" fill="url(#brz)"/>`;
    s += inner(P[0], py);
  }
  return s;
}
// a silkworm, side view, head to the left: segmented pale body, the eye-spot crescents, prolegs, the tail horn
function silkworm(x, y, len, thick, o = {}) {
  const n = 12, seg = len / n;
  let s = `<g>`;
  let body = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), r = thick * (0.62 + 0.38 * Math.sin(Math.min(1, t * 1.15) * Math.PI) ** 0.6) * (i === 0 ? 0.8 : 1);
    const cx = x + i * seg, cy = y - Math.sin(t * Math.PI * 1.2 + (o.ph || 0)) * thick * 0.18;
    body += `<ellipse cx="${f2(cx)}" cy="${f2(cy - r * 0.15)}" rx="${f2(seg * 0.78)}" ry="${f2(r)}" fill="#EFE7D6"/>`;
    if (i > 0) body += `<path d="M${f2(cx - seg * 0.5)},${f2(cy - r * 1.05)} q${f2(-seg * 0.12)},${f2(r)} 0,${f2(r * 1.9)}" stroke="#C9BCA4" stroke-width="2.2" fill="none" opacity="0.7"/>`;
    if (i >= 2 && i <= 10 && i !== 7 && i !== 8) body += `<ellipse cx="${f2(cx)}" cy="${f2(cy + r * 0.86)}" rx="${f2(seg * 0.2)}" ry="${f2(thick * 0.14)}" fill="#BFB094"/>`;
  }
  const hx = x - seg * 0.55, hy = y + thick * 0.05;
  s += body + `<ellipse cx="${f2(hx)}" cy="${f2(hy)}" rx="${f2(seg * 0.55)}" ry="${f2(thick * 0.5)}" fill="#7A6A56"/>`;
  // eye-spot crescents on the 2nd segment (the markings, not eyes) and the tail horn
  s += `<path d="M${f2(x + seg * 1.0)},${f2(y - thick * 0.55)} q${f2(seg * 0.5)},${f2(-thick * 0.25)} ${f2(seg * 0.95)},0" stroke="#5E5244" stroke-width="${f2(thick * 0.12)}" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${f2(x + seg * 10.2)},${f2(y - thick * 0.8)} l${f2(seg * 0.5)},${f2(-thick * 0.45)} l${f2(seg * 0.15)},${f2(thick * 0.5)}Z" fill="#B8A88C"/>`;
  return s + '</g>';
}
const leaf = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) rotate(-8) scale(${s})"><path d="M-520,0 C-380,-230 260,-260 540,-30 C300,210 -360,220 -520,0Z" fill="#33402A"/><path d="M-520,0 C-100,-20 240,-26 540,-30" stroke="#4E5E3C" stroke-width="7" fill="none"/>` +
  [-300, -120, 60, 240].map((x) => `<path d="M${x},-12 q90,-90 160,-150 M${x},-12 q90,80 170,140" stroke="#46553A" stroke-width="4" fill="none"/>`).join('') + `</g>`;

// ---------------------------------------------------------------- the frames
const FR = {
  // F1 · frame 0: lighter than an egg
  hook() {
    let s = lacquer({ cy: 0.55, cloudOp: 0.32 });
    s += spot(1180, 560, 760, 560, 0.42);
    s += balance(1180, 300, 760, 7,
      (x, y) => { // the gown, folded small and draped over the pan, half transparent
        return gown(x, y - 206, 290, { id: 'hf', op: 0.24, cell: 3 });
      },
      (x, y) => egg(x, y - 52, 46));
    s += `<g font-family="Noto Sans CJK SC" font-weight="900" text-anchor="middle"><text x="${1180 - 377}" y="630" font-size="84" fill="${C.gold}">49<tspan font-size="50">克</tspan></text><text x="${1180 + 377}" y="690" font-size="46" fill="${C.cream}" opacity="0.8">一个鸡蛋</text></g>`;
    s += sub(['这件衣服，', '比一个[鸡蛋]还轻。']);
    return s + seal();
  },
  // F2 · the title: the whole gown, floating, the lacquer clouds showing through it
  title() {
    let s = lacquer({ cy: 0.42, cloudOp: 0.55 });
    s += spot(960, 440, 900, 520, 0.38);
    s += gown(960, 80, 1000, { id: 'tg' });
    s += `<g font-family="Noto Serif CJK SC" font-weight="900" text-anchor="middle"><text x="960" y="920" font-size="70" fill="${C.cream}" letter-spacing="6">2000年前的衣服只有<tspan fill="${C.gold}">49克</tspan>，</text>` +
      `<text x="960" y="1004" font-size="70" fill="${C.cream}" letter-spacing="6">为什么今天织不出来？</text></g>`;
    return s + seal();
  },
  // F3 · the answer: the silkworm changed. Western Han 三眠蚕 vs today's 四眠蚕, and their threads
  worms() {
    let s = lacquer({ cy: 0.55, cloudOp: 0.18, mid: '#24140C' });
    s += leaf(900, 640, 1.25);
    s += spot(900, 600, 900, 520, 0.3);
    s += silkworm(520, 470, 560, 52, { ph: 0.2 });
    s += silkworm(520, 790, 640, 92, { ph: 1.1 });
    // the threads they spin, out to the right: thin vs thick
    s += `<path d="M470,478 C330,470 250,500 120,486" stroke="${C.gauzeHi}" stroke-width="1.6" fill="none" opacity="0.95"/><path d="M465,800 C330,790 250,830 120,812" stroke="${C.gauzeHi}" stroke-width="6" fill="none" opacity="0.95"/>`;
    s += `<g font-family="Noto Sans CJK SC" font-weight="900"><text x="1230" y="440" font-size="54" fill="${C.cream}">西汉 · <tspan fill="${C.gold}">三眠蚕</tspan></text><text x="1230" y="500" font-size="36" fill="${C.cream}" opacity="0.75">丝细</text>` +
      `<text x="1300" y="770" font-size="54" fill="${C.cream}">今天 · 四眠蚕</text><text x="1300" y="830" font-size="36" fill="${C.cream}" opacity="0.75">个头大，丝更粗</text></g>`;
    s += sub(['今天的蚕，', '[吃得太好了]。']);
    return s + seal();
  },
  // F4 · 1983: the empty case at night; the torch beam; the glass on the floor
  theft() {
    let s = `<rect width="${W}" height="${H}" fill="#07080B"/>`;
    s += `<rect x="0" y="0" width="${W}" height="${H}" fill="#120A08" opacity="0.6"/>`;
    // the hall: floor, back wall panels
    s += `<path d="M0,820 L${W},820 L${W},${H} L0,${H}Z" fill="#100A08"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${i * 260 + 40}" y="120" width="220" height="640" fill="#140C09" stroke="#20130D" stroke-width="3"/>`;
    // the case: glass box on a plinth; the backboard keeps a clean outline where the gown hung
    const cx = 1020;
    s += `<rect x="${cx - 420}" y="700" width="840" height="140" fill="#1E120C"/><rect x="${cx - 420}" y="700" width="840" height="8" fill="#3A2416"/>`;
    s += `<rect x="${cx - 400}" y="240" width="800" height="460" fill="#1A100B"/>`;
    // where it hung: a cleaner, paler patch on the backboard, and the empty pins
    s += gown(cx, 300, 620, { outlineOnly: true, fill: '#24160F', stroke: '#4A3424', opacity: 1 });
    for (const [x, y] of [[-300, 6], [300, 6], [-60, 6], [60, 6]]) s += `<circle cx="${cx + x}" cy="${300 + y}" r="7" fill="#8A7A66"/>`;
    s += `<rect x="${cx - 400}" y="240" width="800" height="460" fill="none" stroke="#5E6A70" stroke-width="4" opacity="0.6"/>`;
    // the broken pane: a hole with cracks, shards on the plinth and floor
    s += `<path d="M${cx + 180},${520} l60,-40 l40,30 l-20,70 l-70,10Z" fill="#07080B" opacity="0.9"/>`;
    s += `<g stroke="#9AA8B0" stroke-width="2" opacity="0.7" fill="none"><path d="M${cx + 220},520 l120,-110 M${cx + 230},540 l170,40 M${cx + 210},560 l40,140 M${cx + 200},520 l-140,-90"/></g>`;
    for (let i = 0; i < 14; i++) { const x = cx + 120 + (i * 53) % 330, y = 845 + (i * 37) % 160, r = 8 + (i * 7) % 14; s += `<path d="M${x},${y} l${r},-${r * 0.4} l-${r * 0.3},${r}Z" fill="#B8C8D0" opacity="0.55"/>`; }
    // the torch beam from the right, sweeping across the empty case
    s += `<defs><linearGradient id="beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFF2D0" stop-opacity="0.55"/><stop offset="1" stop-color="#FFF2D0" stop-opacity="0"/></linearGradient></defs>`;
    s += `<path d="M${W + 40},380 L${cx - 120},300 L${cx - 160},620 Z" fill="url(#beam)" style="mix-blend-mode:screen"/>`;
    s += `<ellipse cx="${cx - 60}" cy="460" rx="160" ry="170" fill="#FFF2D0" opacity="0.10"/>`;
    s += sub(['1983年，', '它被[偷]了。']);
    s += stamp('1983 · 长沙', '湖南省博物馆');
    return s + seal();
  },
};

const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
fs.mkdirSync(OUT, { recursive: true });
for (const [name, fn] of Object.entries(FR)) {
  if (ONLY.length && !ONLY.includes(name)) continue;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${fn()}</svg>`;
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://${WENKAI}"><style>html,body{margin:0;background:#000}</style></head><body>${svg}</body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('ok', name);
}
await browser.close();
