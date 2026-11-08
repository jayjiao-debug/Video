// 林冲 storyboard v2: 16:9 (1920x1080), every frame built from z-ordered layers.
// Layer = { id, z, depth, body, bleed }. depth = parallax factor for the camera later
// (0 = fixed sky, 1 = subject plane, >1 = foreground). bleed = which frame edges the
// layer may cross on purpose: '' none, 'b' bottom, 'l','r','t' or combos, 'all'.
// Faces carry an invisible data-face rect so the checker can keep subtitles off them.
import { front, side, EX, NE } from './manhua.mjs';
import { fullFront } from './fullbody2.mjs';
import { fullSide as inkSide } from './fullbody.mjs';
export const W = 1920, H = 1080;
const f = (n) => (Math.round(n * 10) / 10).toString();
const LN = '#2a1c17';
const L = (w = 4) => `stroke="${LN}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const rnd = (seed) => { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
const grad = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const radial = (id, c, op = 1) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${op}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
function snow(n, seed, rmin, rmax, op = 1, blur = 0) {
  const r = rnd(seed); let o = '';
  for (let i = 0; i < n; i++) o += `<circle cx="${f(r() * W)}" cy="${f(r() * H)}" r="${f(rmin + (rmax - rmin) * r() * r())}" fill="#fff" opacity="${f((0.5 + r() * 0.5) * op)}"/>`;
  return blur ? `<g filter="url(#blur${blur})">${o}</g>` : o;
}
const BLUR = [2, 4, 8, 14].map((b) => `<filter id="blur${b}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${b}"/></filter>`).join('');
const FACE_RECT = '<rect data-face="1" x="196" y="206" width="208" height="380" fill="none"/>';
const headF = (part, cx, cy, k, rot = 0) => `<g transform="translate(${f(cx)},${f(cy)}) rotate(${rot}) scale(${k}) translate(-300,-400)">${part.body}${FACE_RECT}</g>`;
const headS = (part, cx, cy, k, flip = false) => `<g transform="translate(${f(cx)},${f(cy)}) scale(${flip ? -k : k},${k}) translate(-300,-400)">${part.body}<rect data-face="1" x="250" y="200" width="160" height="340" fill="none"/></g>`;
const lay = (id, z, depth, body, bleed = '') => ({ id, z, depth, body, bleed });

function splitSub(t) {
  const n = t.replace(/[，。：？！—…\s]/g, '').length;
  if (n <= 16) return [t];
  const cuts = [...t.matchAll(/[，：—]/g)].map((m) => m.index + 1);
  if (!cuts.length) return [t];
  const best = cuts.reduce((a, b) => (Math.abs(b - t.length / 2) < Math.abs(a - t.length / 2) ? b : a));
  return [t.slice(0, best).replace(/[，]$/, ''), t.slice(best)];
}
const subtitle = (t) => splitSub(t).map((row, i, arr) => `<text data-sub="1" x="960" y="${1010 + (i - (arr.length - 1)) * 70}" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="700" font-size="54" fill="#fbf7ef" stroke="#141010" stroke-width="10" paint-order="stroke" stroke-linejoin="round">${row}</text>`).join('');

export function compose(defs, layers, sub = '') {
  const all = [...layers];
  if (sub) all.push(lay('text', 100, 0, subtitle(sub)));
  all.sort((a, b) => a.z - b.z);
  const body = all.map((l) => `<g data-layer="${l.id}" data-z="${l.z}" data-depth="${l.depth}" data-bleed="${l.bleed}">${l.body}</g>`).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>${BLUR}${defs}</defs>${body}</svg>`;
}

// ------------------------------------------------------------------ shared props
const XIUSHU = ['东京八十万禁军教头林冲', '为因身犯重罪断配沧州', '去后存亡不保有妻张氏', '年少情愿立此休书任从', '改嫁永无争执委是自行', '情愿即非相逼恐后无凭', '立此文约为照', '年月日'];
function paper(x, y, w, h, fs, cols = XIUSHU, op = 1) {
  let o = `<g data-container="1"><rect data-box="1" x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#pg)" ${L(3)}/><path d="M${x + 6},${y + h - 30} L${x + w - 6},${y + h - 30}" stroke="#d9c7a4" stroke-width="2"/>`;
  const sp = Math.min(fs * 1.42, (w - fs * 1.9) / Math.max(1, cols.length - 1));
  cols.forEach((c, i) => (o += `<text data-inbox="1" x="${f(x + w - fs * 0.95 - i * sp)}" y="${y + fs * 0.9}" font-family="Ma Shan Zheng" font-size="${fs}" fill="#1d1712" opacity="${op}" style="writing-mode:vertical-rl;letter-spacing:${f(fs * 0.06)}px">${c}</text>`));
  return o + '</g>';
}
function thumbprint(cx, cy, r, op = 1) {
  let o = `<g opacity="${op}"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.28}" fill="#c4372f" opacity="0.2"/>`;
  for (let k = 0; k < 8; k++) o += `<ellipse cx="${cx}" cy="${cy + k * 1.2}" rx="${f(r - k * r / 9)}" ry="${f((r - k * r / 9) * 1.28)}" fill="none" stroke="#c4372f" stroke-width="${f(r / 16)}" stroke-dasharray="${f(r / 5 + k)} ${f(r / 12)}"/>`;
  return o + '</g>';
}
const wood = (id) => grad(id, '#4a3528', '#2c1f17');
const grain = (n, y0, dy, col) => [...Array(n)].map((_, i) => `<path d="M-20,${y0 + i * dy} C500,${y0 + i * dy - 18} 1300,${y0 + i * dy + 22} 1940,${y0 + i * dy - 6}" stroke="${col}" stroke-width="4" fill="none"/>`).join('');
// a hand seen from the back, fingers over an edge (pointing +x); flip for the other hand
function gripHand(x, y, k = 1, flip = false, sleeve = '#e7c4c9') {
  const s = flip ? -k : k;
  return `<g transform="translate(${x},${y}) scale(${s},${k})">
<path d="M-260,-70 C-180,-90 -120,-80 -90,-60 L-80,90 C-130,110 -200,110 -260,96Z" fill="${sleeve}" ${L()}/>
<path d="M-100,-62 C-40,-80 30,-70 52,-40 L60,70 C30,96 -50,100 -96,84Z" fill="#f2d1b8" ${L()}/>
${[0, 1, 2, 3].map((i) => `<path d="M40,${-48 + i * 34} C70,${-54 + i * 34} 98,${-46 + i * 34} 104,${-30 + i * 34} C104,${-16 + i * 34} 76,${-12 + i * 34} 44,${-16 + i * 34}Z" fill="#f2d1b8" ${L(3)}/>`).join('')}
<path d="M-60,-20 C-30,-26 0,-24 20,-14" fill="none" ${L(2)} opacity="0.5"/></g>`;
}
// a fist with the knuckles toward the camera; open = 0..1 loosens the fingers (for 「拳头，软了」)
function fist(x, y, k = 1, open = 0, sleeve = '#2f6b52', rot = 0) {
  const o = open;
  let fingers = '';
  for (let i = 0; i < 4; i++) {
    const cx = -112 + i * 75 + (i - 1.5) * 8 * o, top = -150 - 26 * o + (i === 0 || i === 3 ? 14 : 0);
    fingers += `<path d="M${cx - 34},20 L${cx - 34},${top + 30} C${cx - 34},${top} ${cx + 34},${top} ${cx + 34},${top + 30} L${cx + 34},20Z" fill="#f3d3b8" ${L(4)}/>` +
      `<path d="M${cx - 26},${top + 70} C${cx - 10},${top + 78} ${cx + 10},${top + 78} ${cx + 26},${top + 70}" fill="none" ${L(2.4)} opacity="0.6"/>` +
      `<path d="M${cx - 16},${top + 22} C${cx - 6},${top + 14} ${cx + 8},${top + 14} ${cx + 16},${top + 22}" fill="none" stroke="#fff3e6" stroke-width="5" stroke-linecap="round"/>`;
  }
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${k})">
<path d="M-176,120 L176,120 L210,560 L-210,560Z" fill="${sleeve}" ${L(5)}/><path d="M-182,170 L182,170" stroke="#1b3d2e" stroke-width="10"/>
<path d="M-164,-40 C-170,60 -150,150 -110,170 L110,170 C150,150 170,60 164,-40Z" fill="#f3d3b8" ${L(5)}/>
${fingers}
<path d="M-196,10 C-200,-24 -170,-40 -130,-34 L40,${f(-10 + 30 * o)} C80,${f(-4 + 30 * o)} 84,${f(52 + 30 * o)} 44,${f(62 + 30 * o)} L-130,70 C-176,72 -196,46 -196,10Z" fill="#f3d3b8" ${L(4)}/>
<path d="M-60,${f(4 + 15 * o)} C-40,${f(10 + 15 * o)} -20,${f(10 + 15 * o)} 0,${f(6 + 15 * o)}" fill="none" ${L(2.4)} opacity="0.55"/></g>`;
}
const spearProp = (x0, y0, x1, y1, w = 12) => `<path d="M${x0},${y0} L${x1},${y1}" stroke="${LN}" stroke-width="${w + 8}" stroke-linecap="round"/><path d="M${x0},${y0} L${x1},${y1}" stroke="#7a5332" stroke-width="${w}" stroke-linecap="round"/>`;
const vignette = (op = 0.55) => `<rect width="${W}" height="${H}" fill="url(#vig)" opacity="${op}"/>`;
const VIG = `<radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="1"/></radialGradient>`;
const PG = grad('pg', '#fbf3e1', '#e2d0ad');
const GAO = { hat: false, cap: 'gao', beard: false, col: { coat: '#7a3a5a', cloak: '#a34f6f', cloakS: '#7a3a5a', scarf: '#5a2a40', scarfS: '#40202e' } };
const TOKYO_F = { hat: false, headscarf: 'tokyo', noScarf: true, col: { coat: '#2f6b52', coatS: '#22513e', cloak: '#2f6b52', cloakS: '#22513e' } };
const TOKYO_S = { hat: false, headscarf: 'tokyo', col: { coat: '#2f6b52', cloak: '#2f6b52', cloakS: '#22513e', scarf: '#22513e', scarfS: '#183a2c' } };

// ------------------------------------------------------------------ frames
export const FRAMES = [
  { id: 'S01', t: '0.5', note: '木桌上的休书，第八回原文；砚台、毛笔；灯光', make: () => compose(wood('wd') + PG + radial('lamp', '#ffcf8a', 0.55) + VIG, [
    lay('table', 0, 0.2, `<rect x="-40" y="-40" width="2000" height="1160" fill="url(#wd)"/>${grain(9, 60, 130, '#55402f')}`, 'all'),
    lay('paper', 10, 0.6, `<g transform="rotate(-4 880 520)">${paper(540, 70, 700, 900, 62)}</g>`),
    lay('props', 20, 0.8, `<rect x="1400" y="600" width="300" height="220" rx="40" fill="#2a2522" ${L()}/><ellipse cx="1550" cy="680" rx="110" ry="50" fill="#0f0c0b"/><ellipse cx="1520" cy="668" rx="30" ry="10" fill="#4a4a52" opacity="0.6"/>
<g transform="rotate(-24 1520 380)"><rect x="1300" y="370" width="460" height="24" rx="12" fill="#6b4a2c" ${L(3)}/><path d="M1300,370 L1236,382 L1300,394Z" fill="#1d1712" ${L(2)}/><rect x="1700" y="366" width="40" height="32" rx="6" fill="#c4372f" ${L(2)}/></g>`),
    lay('fx', 60, 1.0, `<circle cx="300" cy="200" r="700" fill="url(#lamp)"/>${vignette(0.6)}`, 'all'),
  ], '如果有一天，你要亲手写一封休书，给你最爱的人。') },

  { id: 'S02', t: '5.5', note: '她攥着休书的两只手，一滴泪落下，墨字晕开', make: () => compose(grad('bg2', '#3a2b26', '#1d1512') + PG + VIG, [
    lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg2)"/>`, 'all'),
    lay('paper', 10, 0.6, `<g transform="rotate(2 960 600)">${paper(420, 260, 1080, 640, 50, XIUSHU.slice(0, 7))}</g><ellipse cx="1010" cy="590" rx="58" ry="34" fill="#4a3a2a" opacity="0.35" filter="url(#blur4)"/>`),
    lay('hands', 30, 0.9, `${gripHand(380, 560, 1.15, false)}${gripHand(1540, 600, 1.15, true)}`, 'lr'),
    lay('fx', 60, 1.1, `<path d="M1010,150 C996,196 990,226 1010,250 C1030,226 1024,196 1010,150Z" fill="#d6eef9" ${L(2.4)}/><path d="M1004,180 C1000,200 1000,214 1006,224" stroke="#fff" stroke-width="4" fill="none"/>${vignette(0.5)}`, 'all'),
  ], '她哭着问你：我清清白白，你为什么不要我？') },

  { id: 'S03', t: '9.8', note: '林冲特写（右三分）：红眼、咬牙、套着枷；左侧虚化的她', make: () => {
    const h = front({ ...EX['隐忍'], tear: 1 }, { ...TOKYO_F, cangue: true });
    return compose(grad('bg3', '#4b3529', '#1e140e') + radial('bk', '#ffc77a', 0.5) + VIG + h.defs, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg3)"/><rect x="180" y="0" width="70" height="1080" fill="#2a1d15"/>`, 'all'),
      lay('her', 10, 0.5, `<g filter="url(#blur14)"><path d="M300,1100 C270,800 330,620 440,600 C560,610 610,800 600,1100Z" fill="#e7c4c9" opacity="0.8"/><circle cx="450" cy="520" r="90" fill="#1c1a20" opacity="0.8"/></g>`, 'b'),
      lay('linchong', 30, 1.0, headF(h, 1250, 470, 1.2), 'b'),
      lay('fx', 60, 1.2, `<circle cx="760" cy="200" r="120" fill="url(#bk)"/><circle cx="1700" cy="160" r="80" fill="url(#bk)"/><circle cx="560" cy="900" r="60" fill="url(#bk)"/>${vignette(0.55)}`, 'all'),
    ], '你说不出口——你是怕自己回不来，误了她一辈子。');
  } },

  { id: 'S04', t: '14.6', note: '雪中长街：远处公差押着他，她瘫坐在近处门口', make: () => compose(grad('sk4', '#4f5f74', '#aab6c2') + VIG, [
    lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk4)"/>`, 'all'),
    lay('houses', 10, 0.4, `<path d="M-20,180 L860,560 L860,640 L-20,980Z" fill="#3a4554" ${L(3)}/><path d="M1940,180 L1060,560 L1060,640 L1940,980Z" fill="#46505f" ${L(3)}/>
<path d="M-20,160 L880,552 L-20,552Z M1940,160 L1040,552 L1940,552Z" fill="#272d36"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${120 + i * 150}" y="${420 + i * 34}" width="${70 - i * 8}" height="${120 - i * 14}" fill="#f6c67a" opacity="0.5"/>`).join('')}`, 'all'),
    lay('road', 5, 0.3, `<path d="M-20,1100 L860,640 L1060,640 L1940,1100Z" fill="#e8edf1"/>`, 'all'),
    lay('figures', 20, 0.5, [0, 1, 2].map((i) => `<g transform="translate(${930 + i * 30},${640 - i * 2}) scale(${0.62 - i * 0.03})"><rect x="-14" y="-92" width="28" height="70" rx="12" fill="#1f2530"/><circle cx="0" cy="-106" r="13" fill="#1f2530"/><rect x="-12" y="-24" width="10" height="40" fill="#1f2530"/><rect x="2" y="-24" width="10" height="40" fill="#1f2530"/>${i === 1 ? '<rect x="-34" y="-88" width="68" height="14" fill="#7a5a3a"/>' : ''}</g>`).join('')),
    lay('door', 40, 1.2, `<path d="M1380,320 L1760,320 L1760,1100 L1380,1100Z" fill="#2a2420" ${L(4)}/><path d="M1420,360 L1720,360 L1720,1100 L1420,1100Z" fill="#14100e"/>
<path d="M1460,900 C1490,820 1580,800 1630,860 C1660,910 1650,1010 1610,1060 L1480,1060 C1450,1010 1446,950 1460,900Z" fill="#e7c4c9" ${L(3)}/><circle cx="1545" cy="800" r="46" fill="#1c1a20" ${L(3)}/><circle cx="1568" cy="762" r="22" fill="#1c1a20"/>`, 'b'),
    lay('snowBack', 30, 0.7, snow(220, 4, 1.5, 4, 0.8), 'all'),
    lay('snowFront', 70, 1.4, snow(40, 44, 6, 12, 0.9, 2) + vignette(0.45), 'all'),
  ], '可这一别，就是一辈子。') },

  { id: 'S05', t: '19.5', note: '片名「林冲 · 豹子头」，风雪中的剪影', make: () => {
    const sil = inkSide('P', undefined, { silhouette: true }).replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(/<rect width="1000" height="2000"[^>]*\/>/, '').replace(/<path d="M0,1830[^>]*\/>/, '');
    return compose(grad('sk5', '#141b26', '#33445a') + VIG, [
      lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk5)"/>`, 'all'),
      lay('figure', 10, 0.5, `<g opacity="0.55" transform="translate(240,150) scale(0.42)">${sil}</g>`),
      lay('title', 40, 1.0, `<text x="1180" y="560" text-anchor="middle" font-family="Zhi Mang Xing" font-size="330" fill="#f4efe6">林冲</text>
<text x="1180" y="700" text-anchor="middle" font-family="Ma Shan Zheng" font-size="68" fill="#d8d0c2" letter-spacing="24">豹子头</text>
<rect x="1460" y="740" width="96" height="96" fill="#c4372f"/><text x="1508" y="802" text-anchor="middle" font-family="Ma Shan Zheng" font-size="40" fill="#f4efe6">人物志</text>
<rect x="1576" y="752" width="72" height="72" fill="none" stroke="#c4372f" stroke-width="6"/><text x="1612" y="806" text-anchor="middle" font-family="Ma Shan Zheng" font-size="50" fill="#c4372f">壹</text>`),
      lay('snow', 70, 1.3, snow(200, 9, 1.5, 6, 0.8) + vignette(0.5), 'all'),
    ], '这个人，叫林冲。');
  } },

  { id: 'S06', t: '27.0', note: '东京校场：绿袍头巾的禁军教头；远处士兵操练', make: () => {
    const b = fullFront(EX['平静'], { tokyo: true, inner: true });
    const troops = [...Array(7)].map((_, i) => `<g transform="translate(${1060 + i * 110},640) scale(0.42)"><rect x="-18" y="-120" width="36" height="96" rx="14" fill="#5a3a2a"/><circle cx="0" cy="-140" r="17" fill="#3a2a22"/><rect x="-14" y="-28" width="12" height="60" fill="#3a2a22"/><rect x="2" y="-28" width="12" height="60" fill="#3a2a22"/><path d="M24,-150 L60,40" stroke="#3a2a22" stroke-width="6"/></g>`).join('');
    return compose(grad('sk6', '#f5e6c8', '#e3c393') + b.defs + VIG, [
      lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk6)"/>`, 'all'),
      lay('wall', 10, 0.3, `<rect x="-20" y="440" width="1960" height="170" fill="#a6483a" ${L(3)}/><path d="M-20,440 L1940,440 L1940,410 L-20,410Z" fill="#3a2a22"/>${[300, 820, 1340, 1760].map((x) => `<rect x="${x}" y="150" width="10" height="300" fill="#3a2a22"/><path d="M${x + 10},160 L${x + 130},186 L${x + 10},250Z" fill="#c4372f" ${L(2.5)}/>`).join('')}`, 'lr'),
      lay('ground', 5, 0.3, `<rect x="-20" y="600" width="1960" height="500" fill="#d8b584"/>`, 'all'),
      lay('troops', 20, 0.5, troops),
      lay('rack', 25, 0.6, `<rect x="1660" y="560" width="200" height="16" fill="#5a3a2a" ${L(3)}/><rect x="1660" y="700" width="200" height="16" fill="#5a3a2a" ${L(3)}/>${[0, 1, 2, 3].map((i) => `<path d="M${1690 + i * 46},470 L${1690 + i * 46},820" stroke="#3a2a22" stroke-width="7"/>`).join('')}`),
      lay('linchong', 40, 1.0, `<g transform="translate(330,36) scale(0.5)">${b.body}</g>`),
      lay('fx', 60, 1.1, vignette(0.35), 'all'),
    ], '你本来什么都有：八十万禁军教头，一身本事。');
  } },

  { id: 'S07', t: '31.5', note: '夜里亮灯的窗，窗上是她缝衣的剪影；灯笼', make: () => compose(grad('sk7', '#1b2230', '#2b3445') + radial('lg', '#ffcf8a', 0.7) + VIG, [
    lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk7)"/><circle cx="300" cy="180" r="56" fill="#f2ecd8"/>`, 'all'),
    lay('house', 10, 0.5, `<rect x="560" y="200" width="1200" height="900" fill="#3d3530" ${L(4)}/><path d="M520,210 L1800,210 L1740,140 L580,140Z" fill="#252020" ${L(4)}/>`, 'b'),
    lay('window', 20, 0.5, `<rect x="860" y="360" width="560" height="440" fill="#ffd99a" ${L(4)}/>${[1, 2, 3].map((i) => `<rect x="${860 + i * 140}" y="360" width="8" height="440" fill="#3d3530"/>`).join('')}<rect x="860" y="574" width="560" height="8" fill="#3d3530"/>
<path d="M1060,800 C1050,710 1080,650 1130,640 C1160,600 1210,600 1220,640 C1270,660 1290,730 1270,800Z" fill="#3a2a22" opacity="0.85"/><circle cx="1174" cy="590" r="40" fill="#3a2a22" opacity="0.85"/><circle cx="1198" cy="556" r="22" fill="#3a2a22" opacity="0.85"/><path d="M1220,690 L1320,640" stroke="#3a2a22" stroke-width="5" opacity="0.85"/>`),
    lay('lantern', 40, 0.8, `<path d="M620,140 L620,250" stroke="${LN}" stroke-width="4"/><ellipse cx="620" cy="300" rx="44" ry="56" fill="#c4372f" ${L(3)}/><circle cx="620" cy="300" r="160" fill="url(#lg)"/>`),
    lay('fx', 60, 1.1, vignette(0.5), 'all'),
  ], '家里的娘子，成亲三年，没跟你红过一次脸。') },

  { id: 'S08', t: '38.8', note: '岳庙：香炉青烟；高衙内（簪花）拦住她', make: () => {
    const g = side({ ...NE, brow: 0.3, eye: 0.8, mouth: 0.8 }, GAO);
    return compose(grad('sk8', '#f3dfba', '#e1bc8e') + g.defs + VIG, [
      lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk8)"/>`, 'all'),
      lay('temple', 10, 0.3, `<path d="M180,250 L1740,250 L1820,340 L100,340Z" fill="#7a3a2a" ${L(3)}/><rect x="260" y="340" width="40" height="500" fill="#9a4a36" ${L(3)}/><rect x="1620" y="340" width="40" height="500" fill="#9a4a36" ${L(3)}/><rect x="300" y="340" width="1320" height="80" fill="#5a2a20"/>`, 'lr'),
      lay('crowd', 15, 0.4, [...Array(9)].map((_, i) => `<g transform="translate(${360 + i * 150},760) scale(0.5)" opacity="0.5"><rect x="-26" y="-150" width="52" height="130" rx="20" fill="#6a4a3a"/><circle cx="0" cy="-176" r="24" fill="#4a3226"/></g>`).join('')),
      lay('ground', 5, 0.3, `<rect x="-20" y="760" width="1960" height="340" fill="#c9a679"/>`, 'all'),
      lay('burner', 25, 0.6, `<path d="M860,700 L1060,700 L1040,820 L880,820Z" fill="#6b5a3a" ${L(3)}/><rect x="880" y="820" width="20" height="60" fill="#6b5a3a"/><rect x="1020" y="820" width="20" height="60" fill="#6b5a3a"/><path d="M940,700 C920,600 980,560 960,470 C1020,540 980,610 1000,700" fill="none" stroke="#efe8dc" stroke-width="7" opacity="0.8"/>`),
      lay('wife', 30, 1.0, `<g transform="translate(440,380)"><path d="M0,720 C-30,520 10,360 90,330 C170,320 220,380 220,520 L250,720Z" fill="#efd9dc" ${L()}/><circle cx="110" cy="280" r="66" fill="#1c1a20" ${L()}/><circle cx="136" cy="214" r="36" fill="#1c1a20"/><path d="M70,380 C50,470 60,580 90,680" stroke="#d8b7bc" stroke-width="6" fill="none"/></g>`, 'b'),
      lay('gao', 35, 1.0, headS(g, 1250, 600, 0.95, true), 'b'),
      lay('fx', 60, 1.1, vignette(0.35), 'all'),
    ], '直到那天在岳庙，有人当众调戏她。');
  } },

  { id: 'S09', t: '42.4', note: '他扳过那人，拳头举起；对面是得意的笑脸', make: () => {
    const l = side(EX['怒'], TOKYO_S);
    const g = side({ ...NE, brow: 0.35, eye: 0.75, mouth: 0.9 }, GAO);
    return compose(grad('sk9', '#ecd0a6', '#b98a5c') + l.defs + g.defs + VIG, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#sk9)"/><rect x="-20" y="0" width="1960" height="200" fill="#7a3a2a" opacity="0.5"/>`, 'all'),
      lay('linchong', 30, 1.0, headS(l, 640, 640, 1.08), 'b'),
      lay('fistArm', 32, 1.05, `<path d="M790,860 C860,760 900,660 950,420" stroke="${LN}" stroke-width="122" stroke-linecap="round" fill="none"/><path d="M790,860 C860,760 900,660 950,420" stroke="#2f6b52" stroke-width="110" stroke-linecap="round" fill="none"/>${fist(975, 270, 0.6, 0, '#2f6b52', 12)}`, 'b'),
      lay('gao', 35, 1.0, headS(g, 1340, 660, 1.0, true), 'b'),
      lay('fx', 60, 1.1, vignette(0.4), 'all'),
    ], '却认出，那是你上司的干儿子。');
  } },

  { id: 'S10', t: '49.0', note: '特写：拳头一点点松开（颤抖线）', make: () => compose(grad('bg10', '#2a1f1a', '#110c0a') + VIG, [
    lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg10)"/>`, 'all'),
    lay('fist', 30, 1.0, fist(960, 470, 1.25, 0.45), 'b'),
    lay('fx', 60, 1.1, `<path d="M1270,240 l60,-26 M1300,380 l80,0 M1270,520 l60,26 M650,240 l-60,-26 M620,380 l-80,0 M650,520 l-60,26" ${L(5)} stroke="#d8c8b8" opacity="0.6"/>${vignette(0.5)}`, 'all'),
  ], '拳头，软了。') },

  { id: 'S11', t: '50.8', note: '隐忍：侧脸咬紧牙关（左三分）', make: () => { const h = side(EX['隐忍'], TOKYO_S);
    return compose(grad('bg11', '#3a2f2a', '#171210') + VIG + h.defs, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg11)"/>`, 'all'),
      lay('linchong', 30, 1.0, headS(h, 700, 560, 1.15), 'b'),
      lay('fx', 60, 1.1, vignette(0.6), 'all'),
    ], '你忍了。'); } },

  { id: 'S12', t: '52.4', note: '过肩：前景林冲的背影，陆谦笑着斟酒，半张脸在阴影里', make: () => {
    const h = front({ ...NE, mouth: 0.6, eye: 0.85, look: [-0.4, 0.2] }, { hat: false, headscarf: 'futou', beard: false, thinMoustache: true, shade: 'half', col: { coat: '#5a4a6a', cloak: '#3a3040', cloakS: '#2a2230', scarf: '#2a2230', scarfS: '#1a1620' } });
    return compose(grad('bg12', '#4a3328', '#1c130f') + radial('lp', '#ffc77a', 0.5) + VIG + h.defs, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg12)"/><circle cx="1500" cy="260" r="300" fill="url(#lp)"/>`, 'all'),
      lay('luqian', 20, 0.8, headF(h, 1180, 500, 1.05), 'b'),
      lay('table', 30, 1.0, `<path d="M-20,860 L1940,860 L1940,1100 L-20,1100Z" fill="#3a281e" ${L(4)}/><path d="M820,780 C820,730 880,712 916,728 L966,680 L992,698 L960,756 C988,800 970,880 910,890 C842,890 820,840 820,780Z" fill="#8a6a4a" ${L(4)}/><path d="M966,700 C990,750 1006,800 1012,850" stroke="#e8d8b0" stroke-width="7" fill="none"/>
<path d="M990,840 L1080,840 L1070,900 L1000,900Z" fill="#d8d0c0" ${L(4)}/><path d="M640,840 L730,840 L720,900 L650,900Z" fill="#d8d0c0" ${L(4)}/>`, 'lrb'),
      lay('lcBack', 50, 1.5, `<g filter="url(#blur4)"><path d="M-80,1100 C-60,820 60,700 220,680 C380,700 470,820 480,1100Z" fill="#1d3a2c"/><path d="M60,660 C60,520 140,450 230,450 C320,450 380,520 380,640 C330,700 120,700 60,660Z" fill="#16181d"/></g>`, 'lb'),
      lay('fx', 60, 1.1, vignette(0.5), 'all'),
    ], '最好的朋友陆谦，帮着他们害你，');
  } },

  { id: 'S13', t: '60.3', note: '脸上刺了字，戴着枷，低下头（冷色）', make: () => { const h = front({ ...EX['隐忍'], eye: 0.25, look: [0, 0.8] }, { ...TOKYO_F, cangue: true, tattoo: true });
    return compose(grad('bg13', '#5b6470', '#262b33') + VIG + h.defs, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg13)"/>`, 'all'),
      lay('linchong', 30, 1.0, headF(h, 960, 480, 1.08, -5), 'b'),
      lay('snow', 50, 1.3, snow(90, 13, 1.5, 4, 0.5) + vignette(0.5), 'all'),
    ], '你还是忍了。'); } },

  { id: 'S14', t: '75.1', note: '雪夜山神庙：石头抵门；远处草料场火光；前景枯枝', make: () => compose(grad('sk14', '#121924', '#33445a') + radial('fire', '#ff8a3a', 0.7) + VIG, [
    lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk14)"/>`, 'all'),
    lay('fireFar', 5, 0.2, `<circle cx="260" cy="620" r="360" fill="url(#fire)"/><path d="M150,640 C190,540 230,570 260,470 C290,560 330,520 370,640Z" fill="#e2562f" opacity="0.85"/><path d="M100,650 L420,650 L400,610 L120,610Z" fill="#1d1a1c"/>`, 'l'),
    lay('hills', 8, 0.25, `<path d="M-20,640 C300,560 600,600 900,540 C1200,500 1500,560 1940,520 L1940,700 L-20,700Z" fill="#2a3442"/>`, 'lr'),
    lay('ground', 10, 0.3, `<path d="M-20,700 C500,670 1200,690 1940,660 L1940,1100 L-20,1100Z" fill="#e4eaef"/>`, 'all'),
    lay('temple', 20, 0.6, `<path d="M860,400 L1460,400 L1560,500 L760,500Z" fill="#2a2b30" ${L()}/><path d="M850,392 L1470,392 L1540,470 C1360,450 960,450 780,470Z" fill="#f5f8fa" ${L(3)}/>
<rect x="850" y="500" width="620" height="300" fill="#4a3d36" ${L()}/><rect x="1090" y="560" width="140" height="240" fill="#16110f" ${L()}/><rect x="890" y="560" width="130" height="100" fill="#2a221d" ${L(3)}/><rect x="1300" y="560" width="130" height="100" fill="#2a221d" ${L(3)}/>
<path d="M1222,800 C1206,752 1264,736 1300,752 C1340,770 1330,808 1300,814 L1230,814Z" fill="#8a8a92" ${L(3)}/>`),
    lay('snowBack', 30, 0.7, snow(240, 14, 1.5, 4, 0.85), 'all'),
    lay('branches', 50, 1.4, `<path d="M1940,40 C1800,120 1700,160 1560,180 M1720,150 C1680,210 1660,250 1640,300 M1620,176 C1560,150 1520,150 1470,170" fill="none" stroke="#14100e" stroke-width="16" stroke-linecap="round"/><path d="M1940,36 C1800,114 1700,152 1560,172" fill="none" stroke="#f5f8fa" stroke-width="6" stroke-linecap="round" opacity="0.9"/>`, 'r'),
    lay('snowFront', 70, 1.5, snow(36, 141, 6, 12, 0.9, 2) + vignette(0.45), 'all'),
  ], '雪压塌了草屋，你躲进山神庙，搬石头抵住了门。') },

  { id: 'S15', t: '86.9', note: '大特写：黑暗里的双眼，被火光映红（遮幅）', make: () => { const h = front({ ...NE, brow: -0.6, eye: 1.05 }, { ...TOKYO_F, tattoo: true, light: '#ff5a2a' });
    const k = 3.3;
    return compose(h.defs + VIG, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="#0d0a0a"/>`, 'all'),
      lay('eyes', 30, 1.0, `<g transform="translate(${f(960 - 300 * k)},${f(520 - 372 * k)}) scale(${k})">${h.body}</g>`, 'all'),
      lay('bars', 80, 0, `<rect x="0" y="0" width="${W}" height="300" fill="#0d0a0a"/><rect x="0" y="780" width="${W}" height="300" fill="#0d0a0a"/>`, 'all'),
    ], '忍，是回不去的。'); } },

  { id: 'S16', t: '96.2', note: '远景：他一个人走进风雪（斗笠、花枪、葫芦剪影）', make: () => {
    const sil = inkSide('P', undefined, { silhouette: true }).replace(/<svg[^>]*>/, '').replace('</svg>', '').replace(/<rect width="1000" height="2000"[^>]*\/>/, '').replace(/<path d="M0,1830[^>]*\/>/, '');
    return compose(grad('sk16', '#8d9cad', '#e3e9ee') + VIG, [
      lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk16)"/>`, 'all'),
      lay('mountains', 5, 0.2, `<path d="M-20,640 L300,380 L560,620 L900,300 L1260,620 L1560,420 L1940,640 L1940,700 L-20,700Z" fill="#7c8a9a" opacity="0.6"/>`, 'lr'),
      lay('plain', 10, 0.3, `<path d="M-20,700 C600,660 1300,690 1940,650 L1940,1100 L-20,1100Z" fill="#f2f5f8"/>`, 'all'),
      lay('steps', 15, 0.5, [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${700 - i * 90}" cy="${790 + (i % 2) * 10}" rx="22" ry="6" fill="#9aa8b6" opacity="0.6"/>`).join('')),
      lay('figure', 30, 1.0, `<g transform="translate(700,330) scale(0.24)">${sil}</g>`),
      lay('snowBack', 40, 0.8, snow(260, 16, 1.5, 4, 0.9), 'all'),
      lay('snowFront', 70, 1.5, snow(40, 161, 6, 12, 0.9, 2) + vignette(0.35), 'all'),
    ], '那一夜雪越下越大，你一个人，上了梁山。');
  } },

  { id: 'S17', t: '109.8', note: '梁山泊：小船归来，芦苇；「已故半载」', make: () => compose(grad('sk17', '#c9d3d6', '#93a7b0') + VIG, [
    lay('sky', 0, 0.1, `<rect width="${W}" height="${H}" fill="url(#sk17)"/>`, 'all'),
    lay('farShore', 5, 0.2, `<path d="M-20,560 C400,520 800,540 1200,510 C1500,500 1700,530 1940,520 L1940,580 L-20,580Z" fill="#7d8f96"/>`, 'lr'),
    lay('water', 8, 0.3, `<rect x="-20" y="570" width="1960" height="530" fill="#6f8790"/>${[...Array(8)].map((_, i) => `<path d="M${200 + i * 160},${640 + i * 46} h${360 - i * 12}" stroke="#a9bcc3" stroke-width="5" stroke-linecap="round"/>`).join('')}`, 'all'),
    lay('boat', 20, 0.6, `<path d="M520,700 L860,700 L810,750 L570,750Z" fill="#2a2420" ${L(3)}/><rect x="680" y="626" width="26" height="74" fill="#2a2420"/><circle cx="693" cy="610" r="17" fill="#2a2420"/><path d="M730,610 L790,780" stroke="#2a2420" stroke-width="5"/>`),
    lay('title', 40, 0.9, `<text x="1520" y="140" font-family="Zhi Mang Xing" font-size="180" fill="#1d2326" style="writing-mode:vertical-rl">已故半载</text>`),
    lay('reeds', 50, 1.4, [...Array(16)].map((_, i) => `<path d="M${-20 + i * 26},1100 C${-20 + i * 26},800 ${0 + i * 26},700 ${30 + i * 28},${560 + (i % 4) * 40}" stroke="#36463a" stroke-width="8" fill="none"/>`).join(''), 'lb'),
    lay('fx', 60, 1.1, vignette(0.35), 'all'),
  ], '娘子被逼，自缢身死，已故半载。') },

  { id: 'S18', t: '113.6', note: '悲：一滴泪（右三分，冷色）', make: () => { const h = front(EX['悲'], { ...TOKYO_F, tattoo: true });
    return compose(grad('bg18', '#5b6c78', '#28313a') + VIG + h.defs, [
      lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg18)"/>`, 'all'),
      lay('linchong', 30, 1.0, headF(h, 1260, 520, 1.2), 'b'),
      lay('fx', 60, 1.1, vignette(0.55), 'all'),
    ], '你哭了。'); } },

  { id: 'S19', t: '124.8', note: '六和寺空屋：窗光；斗笠在地，花枪靠门', make: () => compose(grad('bg19', '#3a3230', '#1f1918') + grad('ray', '#f3e6c4', '#f3e6c4') + VIG, [
    lay('bg', 0, 0.2, `<rect width="${W}" height="${H}" fill="url(#bg19)"/>`, 'all'),
    lay('window', 10, 0.4, `<rect x="1180" y="160" width="420" height="440" fill="#e8dcc0" ${L(4)}/>${[1, 2, 3].map((i) => `<rect x="${1180 + i * 105}" y="160" width="8" height="440" fill="#3a3230"/>`).join('')}`),
    lay('floor', 5, 0.3, `<rect x="-20" y="760" width="1960" height="340" fill="#4a3d36"/>`, 'all'),
    lay('bed', 20, 0.6, `<rect x="1300" y="720" width="520" height="90" fill="#6a5244" ${L(4)}/><rect x="1320" y="690" width="480" height="40" fill="#d8cdb8" ${L(3)}/>`),
    lay('spear', 25, 0.7, `${spearProp(330, 120, 420, 880)}<path d="M322,120 L306,30 L346,112Z" fill="#d4dadf" ${L(3)}/><path d="M326,126 q-36,32 -26,96 M334,128 q-18,42 -8,100 M342,128 q12,40 2,94" stroke="#c4372f" stroke-width="8" fill="none" stroke-linecap="round"/>`),
    lay('hat', 30, 0.8, `<ellipse cx="760" cy="860" rx="210" ry="38" fill="#ddd6ca" ${L(4)}/><path d="M650,856 C660,786 714,764 760,764 C812,764 858,792 868,856Z" fill="#ddd6ca" ${L(4)}/>`),
    lay('rays', 50, 0.5, `<path d="M1180,600 L1600,600 L1840,1100 L800,1100Z" fill="url(#ray)" opacity="0.14"/>`, 'b'),
    lay('fx', 60, 1.1, vignette(0.5), 'all'),
  ], '再后来，你病倒在杭州六和寺，再没起来。') },

  { id: 'S20', t: '138.8', note: '回到开场的休书，手印淡去；结尾提问', make: () => compose(wood('wd') + PG + VIG, [
    lay('table', 0, 0.2, `<rect x="-40" y="-40" width="2000" height="1160" fill="url(#wd)"/>${grain(9, 60, 130, '#55402f')}`, 'all'),
    lay('paper', 10, 0.6, `<g transform="rotate(-4 880 520)" opacity="0.6">${paper(540, 70, 700, 900, 62, XIUSHU, 0.6)}${thumbprint(640, 860, 44, 0.3)}</g>`),
    lay('dim', 50, 0, `<rect width="${W}" height="${H}" fill="#000" opacity="0.45"/>`, 'all'),
    lay('question', 90, 0, `<text x="960" y="500" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="80" fill="#fbf7ef">如果重来一次，</text><text x="960" y="620" text-anchor="middle" font-family="Noto Sans CJK SC" font-weight="900" font-size="80" fill="#fbf7ef">岳庙那一拳，你打不打？</text>`),
  ], '') },
];
