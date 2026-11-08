// Three candidate vector styles for 林冲, all drawn from the same rig (geom.mjs).
//   A 扁平几何  flat geometric shapes, no outlines, split lighting
//   B 国潮描边  bold outlines, flat colour + one cel shadow, 团花 ornament
//   C 半写实    soft gradients, thin line art, hair-strand beard
import { front, side, smooth, poly, mir, P, f, NEUTRAL } from './geom.mjs';

let UID = 0;
const uid = (p) => `${p}${++UID}`;

export const SHAPE = {
  A: { fw: 1.06, fl: 0.95, eyeW: 0.78, eyeH: 1.0, eyeLo: 1.1, irisR: 10, eyeDX: 66, browT: 1.35, browArch: 0.4, beardAmp: 16 },
  B: { fw: 1.0, browT: 1.15, browArch: 1.2, beardAmp: 11, irisR: 17.5 },
  C: { fw: 0.92, fl: 1.07, eyeW: 0.9, eyeH: 0.62, eyeLo: 0.55, irisR: 13.5, eyeDX: 60, eyeY: 414, browY: 14, browT: 0.7, browArch: 0.8, beardAmp: 6, eyeTilt: 0.6, mouthW: 1.15 },
  D: { fw: 1.2, fl: 0.68, eyeW: 1.38, eyeH: 1.45, eyeLo: 1.35, eyeY: 438, eyeDX: 74, browY: 2, browT: 1.0, browL: 0.85, beardAmp: 6, mouthW: 0.6, irisR: 26, bodyW: 0.62 },
};
export const SIDE = {
  A: {}, B: {}, C: {}, D: { fl: 0.72, eyeS: 1.6, bodyW: 0.8 },
};
const PAL = {
  A: { skin: '#dfa67b', skinS: '#c2845b', scarf: '#1f2a30', scarfHi: '#2d3c44', robe: '#3e6f58', robeS: '#2c5443', trim: '#22392f', beard: '#2b2421',
    white: '#f4efe4', iris: '#2a1c14', lip: '#a65e48', ring: '#efeadf', ringS: '#c9c3b5', gold: '#c99a4a', line: 'none' },
  B: { skin: '#f0be90', skinS: '#d99b6c', scarf: '#232c36', scarfHi: '#3b4858', robe: '#2f7b58', robeS: '#225f43', trim: '#183f2e', beard: '#2a201c',
    white: '#f8f3e8', iris: '#3d2416', lip: '#b8604a', ring: '#f6f3ea', ringS: '#cfc8b6', gold: '#d8a743', line: '#1b1513', red: '#c4352b' },
  D: { skin: '#f6c9a2', skinS: '#e3a47c', scarf: '#2b3442', scarfHi: '#4a5a70', robe: '#3a9a6c', robeS: '#2b7a54', trim: '#1f5a40', beard: '#3a2a22',
    white: '#fffaf0', iris: '#3b2418', lip: '#d9776a', ring: '#fffdf6', ringS: '#d8d0c0', gold: '#e5b54a', line: '#3a2418', red: '#c4352b' },
  C: { skin: '#eebd96', skinS: '#c98a63', scarf: '#1d252d', scarfHi: '#46566a', robe: '#2d6e52', robeS: '#1d4c38', trim: '#163a2b', beard: '#241b17',
    white: '#f3eee6', iris: '#5a3218', lip: '#a9604d', ring: '#f1eee6', ringS: '#bdb6a6', gold: '#b88c45', line: '#3a271e' },
};

// deterministic random
function rng(seed) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

// ------------------------------------------------------------------ front
export function frontSVG(style, E = NEUTRAL, opts = {}) {
  const S = PAL[style];
  const OUT = style === 'B' || style === 'D', LW = style === 'D' ? 5 : 7;
  const g = front(E, SHAPE[style]);
  const id = uid('f' + style);
  const L = OUT ? `stroke="${S.line}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"` : style === 'C' ? `stroke="${S.line}" stroke-width="2.4" stroke-linejoin="round"` : '';
  const Li = OUT ? `stroke="${S.line}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"` : style === 'C' ? `stroke="${S.line}" stroke-width="2" stroke-linecap="round"` : '';
  const sm = (pts, closed = true) => (style === 'A' ? smooth(pts, closed, 0.55) : smooth(pts, closed));
  let defs = '', out = '';
  const add = (s) => (out += s + '\n');

  if (style === 'C') {
    defs += `<radialGradient id="${id}sk" cx="0.45" cy="0.42" r="0.62"><stop offset="0" stop-color="#f6cba6"/><stop offset="0.7" stop-color="${S.skin}"/><stop offset="1" stop-color="#d3956c"/></radialGradient>
<linearGradient id="${id}rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34805f"/><stop offset="1" stop-color="${S.robeS}"/></linearGradient>
<linearGradient id="${id}sc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4757"/><stop offset="0.5" stop-color="${S.scarf}"/><stop offset="1" stop-color="#11161b"/></linearGradient>
<radialGradient id="${id}ir" cx="0.45" cy="0.4" r="0.6"><stop offset="0" stop-color="#9a6a3a"/><stop offset="0.6" stop-color="${S.iris}"/><stop offset="1" stop-color="#24140b"/></radialGradient>
<filter id="${id}bl" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="${id}bl2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>`;
  }
  const skinFill = style === 'C' ? `url(#${id}sk)` : S.skin;
  const robeFill = style === 'C' ? `url(#${id}rb)` : S.robe;
  const scarfFill = style === 'C' ? `url(#${id}sc)` : S.scarf;

  // robe and collar
  add(`<path d="${sm(g.robe)}" fill="${robeFill}" ${L}/>`);
  if (style !== 'A') {
    // 团花 medallion on the chest
    const [mx, my] = [596, 852];
    let petals = '';
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      petals += `<ellipse cx="${f(mx + Math.cos(a) * 26)}" cy="${f(my + Math.sin(a) * 26)}" rx="13" ry="8" transform="rotate(${f((a * 180) / Math.PI)} ${f(mx + Math.cos(a) * 26)} ${f(my + Math.sin(a) * 26)})" fill="${S.gold}" opacity="${style === 'C' ? 0.55 : 1}"/>`;
    }
    add(`<g>${petals}<circle cx="${mx}" cy="${my}" r="12" fill="${S.gold}" opacity="${style === 'C' ? 0.6 : 1}"/><circle cx="${mx}" cy="${my}" r="48" fill="none" stroke="${S.gold}" stroke-width="4" opacity="${style === 'C' ? 0.5 : 1}"/></g>`);
  } else {
    add(`<path d="${poly(g.robe.slice(4).concat([[420, 900]]))}" fill="${S.robeS}"/>`);
  }
  add(`<path d="${poly(g.innerV)}" fill="${S.white}" ${Li}/>`);
  add(`<path d="${poly(g.trim)}" fill="${S.trim}" ${Li}/>`);
  // neck
  add(`<path d="${poly(g.neck)}" fill="${S.skinS}" ${Li}/>`);
  if (style === 'C') add(`<path d="${poly(g.T([[336, 640], [464, 640], [460, 700], [340, 700]]))}" fill="#7a4a30" opacity="0.35" filter="url(#${id}bl)"/>`);
  // jade rings behind the head (白玉圈)
  for (const [rx, ry] of [g.ringR, g.ringL]) {
    add(`<circle cx="${rx}" cy="${ry}" r="27" fill="none" stroke="${OUT ? S.line : S.ringS}" stroke-width="${OUT ? 22 : 15}"/>`);
    add(`<circle cx="${rx}" cy="${ry}" r="27" fill="none" stroke="${S.ring}" stroke-width="${OUT ? 11 : 11}"/>`);
  }
  // ears + face
  for (const e of [g.earR, g.earL]) add(`<path d="${sm(e)}" fill="${style === 'C' ? S.skin : S.skinS}" ${L}/>`);
  add(`<path d="${sm(g.face)}" fill="${skinFill}" ${L}/>`);
  // shading
  if (style === 'A') {
    add(`<clipPath id="${id}fc"><path d="${sm(g.face)}"/></clipPath>`);
    add(`<path clip-path="url(#${id}fc)" d="${poly(g.T([[408, 240], [560, 240], [560, 700], [408, 700], [420, 600], [432, 505], [418, 420]]))}" fill="${S.skinS}"/>`);
  } else if (OUT) {
    add(`<path d="${smooth(g.T([[548, 330], [560, 410], [558, 482], [542, 560], [514, 622], [476, 662], [504, 596], [522, 516], [528, 430], [524, 340]]))}" fill="${S.skinS}"/>`);
    add(`<path d="${smooth(g.T([[270, 300], [400, 306], [530, 300], [526, 322], [400, 330], [274, 322]]))}" fill="${S.skinS}"/>`);
    add(`<path d="${smooth(g.T([[412, 424], [426, 470], [432, 494], [416, 486]]))}" fill="${S.skinS}"/>`);
  } else {
    add(`<path d="${smooth(g.T([[541, 330], [551, 410], [549, 482], [533, 566], [506, 628], [470, 668], [480, 560], [495, 450], [500, 340]]))}" fill="#a8643f" opacity="0.35" filter="url(#${id}bl)"/>`);
    add(`<path d="${smooth(g.T([[290, 300], [400, 304], [510, 300], [500, 340], [400, 336], [300, 340]]))}" fill="#8f5636" opacity="0.4" filter="url(#${id}bl)"/>`);
    add(`<path d="${smooth(g.T([[410, 426], [424, 470], [434, 496], [414, 492]]))}" fill="#9b5e3d" opacity="0.4" filter="url(#${id}bl2)"/>`);
    add(`<ellipse cx="338" cy="458" rx="34" ry="16" fill="#e8956f" opacity="0.25" filter="url(#${id}bl)"/><ellipse cx="462" cy="458" rx="34" ry="16" fill="#e8956f" opacity="0.25" filter="url(#${id}bl)"/>`);
    add(`<path d="${smooth(g.T([[300, 385], [338, 372], [376, 386], [338, 380]]))}" fill="#8a5232" opacity="0.35" filter="url(#${id}bl2)"/><path d="${smooth(g.T([[500, 385], [462, 372], [424, 386], [462, 380]]))}" fill="#8a5232" opacity="0.35" filter="url(#${id}bl2)"/>`);
  }
  for (const sb of [g.sideburnR, g.sideburnL]) add(`<path d="${sm(sb)}" fill="${S.beard}" ${OUT ? Li : ''}/>`);
  if (style === 'D') for (const bx of [400 - 112 * 1.12, 400 + 112 * 1.12]) add(`<ellipse cx="${f(bx)}" cy="${f(g.T([[0, 492]])[0][1])}" rx="30" ry="15" fill="#f08f7f" opacity="0.45"/>`);
  // jaw clench (隐忍)
  if (E.jaw > 0.2) for (const c of g.clench) add(`<path d="${smooth(c, false)}" fill="none" stroke="${style === 'A' ? S.skinS : S.line}" stroke-width="${OUT ? 4 : 3}" opacity="${E.jaw * (style === 'C' ? 0.6 : 0.9)}" stroke-linecap="round"/>`);

  // beard (虎须)
  if (style === 'A') add(`<path d="${poly(g.beard)}" fill="${S.beard}"/>`);
  else if (OUT) {
    add(`<path d="${smooth(g.beard, true, style === 'D' ? 1.0 : 0.7)}" fill="${S.beard}" ${L}/>`);
    const r = rng(3);
    let hairs = '';
    for (let k = 0; k < (style === 'D' ? 0 : 26); k++) {
      const t = r();
      const sideK = k % 2 ? 1 : -1;
      const x = 400 + sideK * (40 + t * 110), y = 640 + (1 - t) * 60 - t * 120 + r() * 30;
      hairs += `<path d="M${f(x)},${f(y)} l${f(sideK * 6)},${f(18 + r() * 10)}" stroke="#4a3a32" stroke-width="3" stroke-linecap="round"/>`;
    }
    add(hairs);
  } else {
    add(`<path d="${smooth(g.beard, true, 0.7)}" fill="${S.beard}" opacity="0.85" filter="url(#${id}bl2)"/>`);
    const r = rng(5);
    let hairs = '';
    const outer = g.beard.slice(0, Math.floor(g.beard.length * 0.62));
    for (let k = 0; k < outer.length; k++) {
      const [x, y] = outer[k];
      const dx = 400 - x, dy = 600 - y;
      const Ld = Math.hypot(dx, dy);
      for (let j = 0; j < 3; j++) {
        const len = 22 + r() * 30;
        const ox = x + (r() - 0.5) * 10, oy = y + (r() - 0.5) * 10;
        const ex = ox + (dx / Ld) * len + (r() - 0.5) * 8, ey = oy + (dy / Ld) * len * 0.6 + len * 0.35;
        hairs += `<path d="M${f(ox)},${f(oy)} Q${f((ox + ex) / 2 + (r() - 0.5) * 10)},${f((oy + ey) / 2)} ${f(ex)},${f(ey)}" stroke="${r() < 0.3 ? '#4d3c32' : '#1a1310'}" stroke-width="${f(1.6 + r() * 1.6)}" fill="none" stroke-linecap="round"/>`;
      }
    }
    add(hairs);
  }
  if (style === 'C') add(`<path d="M${f(372)},${f(g.nose[0][1] + 12)} q-22,30 -14,62 M${f(428)},${f(g.nose[0][1] + 12)} q22,30 14,62" fill="none" stroke="#8a5235" stroke-width="2" opacity="0.45"/>`);
  // mouth
  const m = g.mouth;
  if (m.open > 0.05) {
    add(`<path d="${smooth([m.l, [385, m.up[1] - 1], [415, m.up[1] - 1], m.r, [415, m.lo[1]], [385, m.lo[1]]])}" fill="#3a1610" ${Li}/>`);
    add(`<path d="${smooth([[m.l[0] + 8, m.l[1]], [400, m.up[1]], [m.r[0] - 8, m.r[1]], [400, m.up[1] + 7]])}" fill="${S.white}"/>`);
  } else {
    add(`<path d="M${P([m.l])}Q${f(400)},${f(m.up[1] + 2 + 6 * g.E.mouth)} ${P([m.r])}" fill="none" stroke="${style === 'A' ? '#5a2f22' : S.line}" stroke-width="${OUT ? 5 : 4}" stroke-linecap="round"/>`);
    add(`<path d="M${f(388)},${f(m.lo[1] + 1)} Q400,${f(m.lo[1] + 5)} ${f(412)},${f(m.lo[1] + 1)}" fill="none" stroke="${S.lip}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>`);
  }
  // mustache
  for (const mu of [g.mustR, g.mustL]) {
    if (style === 'A') add(`<path d="${poly(mu)}" fill="${S.beard}"/>`);
    else if (OUT) add(`<path d="${smooth(mu)}" fill="${S.beard}" ${Li}/>`);
    else {
      add(`<path d="${smooth(mu)}" fill="${S.beard}" opacity="0.9" filter="url(#${id}bl2)"/>`);
      const r = rng(mu[1][0] | 0);
      let h = '';
      for (let k = 0; k < 18; k++) {
        const t = k / 17, a = mu[1], b = mu[4];
        const x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + 6;
        h += `<path d="M${f(x)},${f(y - 8)} l${f((b[0] - a[0]) * 0.06)},${f(14 + r() * 8)}" stroke="#15100d" stroke-width="2" stroke-linecap="round"/>`;
      }
      add(h);
    }
  }
  // nose
  if (style === 'A') add(`<path d="${poly(g.T([[402, 430], [430, 498], [400, 506]]))}" fill="${S.skinS}"/>`);
  if (style === 'B' || style === 'C') add(`<path d="${smooth(g.noseTip)}" fill="${style === 'C' ? 'none' : S.skin}" ${OUT ? Li : ''}/>`);
  if (style !== 'D') add(`<path d="${smooth(g.nose, false)}" fill="none" stroke="${style === 'A' ? '#7a4630' : S.line}" stroke-width="${OUT ? 5 : style === 'C' ? 3 : 4}" stroke-linecap="round"/>`);
  if (style === 'C') add(`<path d="${smooth(g.noseSideR, false)}" fill="none" stroke="${S.line}" stroke-width="1.8" opacity="0.5"/>`);
  for (const [nx, ny] of g.nostrils) add(`<ellipse cx="${f(nx)}" cy="${f(ny)}" rx="${f(5 + 2 * E.flare)}" ry="3.5" fill="#4a2418" opacity="${style === 'A' ? 0.9 : 0.8}"/>`);
  // eyes
  for (const ey of [g.eyeR, g.eyeL]) {
    const cid = uid('ec');
    defs += `<clipPath id="${cid}"><path d="${smooth(ey.white)}"/></clipPath>`;
    add(`<path d="${smooth(ey.white)}" fill="${S.white}"/>`);
    const irisFill = style === 'C' ? `url(#${id}ir)` : S.iris;
    const ir = SHAPE[style].irisR ?? 17.5;
    add(`<g clip-path="url(#${cid})"><circle cx="${f(ey.iris[0])}" cy="${f(ey.iris[1])}" r="${ir}" fill="${irisFill}"/><circle cx="${f(ey.iris[0])}" cy="${f(ey.iris[1])}" r="${style === 'A' ? 0 : 8}" fill="#0d0805"/>` +
      `${style === 'C' ? `<path d="${smooth(ey.white)}" fill="none" stroke="#7a5a48" stroke-width="10" opacity="0.25"/>` : ''}</g>`);
    add(`<circle cx="${f(ey.iris[0] - (style === 'D' ? 8 : 5))}" cy="${f(ey.iris[1] - (style === 'D' ? 9 : 6))}" r="${style === 'A' ? 3.5 : style === 'D' ? 8 : 5}" fill="#fff"/>`);
    if (style === 'D') add(`<circle cx="${f(ey.iris[0] + 8)}" cy="${f(ey.iris[1] + 8)}" r="4" fill="#fff" opacity="0.9"/>`);
    if (style === 'A') add(`<path d="${smooth([...ey.upLine.slice(0, 5), [ey.upLine[3][0], ey.upLine[3][1] - 10], [ey.cx, ey.upLine[2][1] - 12], [ey.upLine[1][0], ey.upLine[1][1] - 9]])}" fill="#2a1d18"/>`);
    else add(`<path d="${smooth(ey.upLine, false)}" fill="none" stroke="${S.line}" stroke-width="${OUT ? 8 : 4.5}" stroke-linecap="round"/>`);
    if (style !== 'A') add(`<path d="${smooth(ey.loLine, false)}" fill="none" stroke="${S.line}" stroke-width="${OUT ? 3 : 1.6}" opacity="${OUT ? 1 : 0.7}" stroke-linecap="round"/>`);
    if (style === 'C') add(`<path d="${smooth(ey.upLine.slice(0, 5).map(([x, y]) => [x, y - 13]), false)}" fill="none" stroke="${S.line}" stroke-width="1.6" opacity="0.5"/>`);
    if (E.tear > 0) add(`<path d="M${f(ey.cx - ey.s * 14)},${f(ey.cy + 20)} q${f(-ey.s * 3)},14 0,22" stroke="#cfe6f2" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.85"/>`);
  }
  // brows
  for (const b of [g.browR, g.browL]) {
    if (style === 'A') add(`<path d="${poly(b)}" fill="#231a16"/>`);
    else if (OUT) add(`<path d="${smooth(b)}" fill="${S.beard}" ${Li}/>`);
    else {
      add(`<path d="${smooth(b)}" fill="${S.beard}" opacity="0.9" filter="url(#${id}bl2)"/>`);
      let h = '';
      for (let k = 0; k < 14; k++) {
        const t = k / 13, a = b[0], c = b[2];
        const x = a[0] + (c[0] - a[0]) * t, y = a[1] + (c[1] - a[1]) * t + 10;
        h += `<path d="M${f(x)},${f(y)} l${f((c[0] - a[0]) * 0.08)},${f(-12)}" stroke="#120d0a" stroke-width="2.2" stroke-linecap="round"/>`;
      }
      add(h);
    }
  }
  // headscarf with its two stiff corners (青纱抓角儿头巾)
  for (const c of [g.cornerR, g.cornerL]) add(`<path d="${style === 'A' ? poly(c) : smooth(c)}" fill="${style === 'A' ? S.scarfHi : scarfFill}" ${L}/>`);
  add(`<path d="${sm(g.scarf)}" fill="${scarfFill}" ${L}/>`);
  if (style === 'A') add(`<path d="${poly(g.T([[400, 118], [456, 128], [512, 166], [544, 232], [538, 304], [480, 290], [400, 299]]))}" fill="${S.scarfHi}" opacity="0.6"/>`);
  if (OUT) add(`<path d="${smooth(g.T([[300, 210], [350, 160], [400, 148], [440, 156]]), false)}" fill="none" stroke="${S.scarfHi}" stroke-width="12" stroke-linecap="round"/>`);
  if (style === 'C') add(`<path d="${smooth(g.T([[300, 220], [350, 165], [410, 150], [470, 165]]), false)}" fill="none" stroke="#6b7f96" stroke-width="10" stroke-linecap="round" opacity="0.5" filter="url(#${id}bl2)"/>`);
  add(`<path d="${smooth(g.band, false)}" fill="none" stroke="${style === 'A' ? '#111a1e' : S.line}" stroke-width="${OUT ? 6 : 4}" opacity="${style === 'C' ? 0.6 : 1}"/>`);

  const bg = opts.bg ?? ({ A: '#ece2d0', B: '#f1e6cf', C: '#e9e3d8', D: '#f4ead8' })[style];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.vb ?? '120 60 560 760'}"><defs>${defs}</defs><rect x="0" y="0" width="800" height="900" fill="${bg}"/>${out}</svg>`;
}

// ------------------------------------------------------------------ side
export function sideSVG(style, E = NEUTRAL, opts = {}) {
  const S = PAL[style];
  const OUT = style === 'B' || style === 'D', LW = style === 'D' ? 5 : 7;
  const g = side(E, SIDE[style]);
  const id = uid('s' + style);
  const L = OUT ? `stroke="${S.line}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"` : style === 'C' ? `stroke="${S.line}" stroke-width="2.4" stroke-linejoin="round"` : '';
  const Li = OUT ? `stroke="${S.line}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"` : style === 'C' ? `stroke="${S.line}" stroke-width="2" stroke-linecap="round"` : '';
  const sm = (pts, closed = true) => (style === 'A' ? smooth(pts, closed, 0.55) : smooth(pts, closed));
  let defs = '', out = '';
  const add = (s) => (out += s + '\n');
  if (style === 'C') {
    defs += `<linearGradient id="${id}sk" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#f6cba6"/><stop offset="0.6" stop-color="${S.skin}"/><stop offset="1" stop-color="#c88a62"/></linearGradient>
<linearGradient id="${id}rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34805f"/><stop offset="1" stop-color="${S.robeS}"/></linearGradient>
<linearGradient id="${id}sc" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4757"/><stop offset="0.5" stop-color="${S.scarf}"/><stop offset="1" stop-color="#11161b"/></linearGradient>
<filter id="${id}bl"><feGaussianBlur stdDeviation="8"/></filter><filter id="${id}bl2"><feGaussianBlur stdDeviation="3"/></filter>`;
  }
  const skinFill = style === 'C' ? `url(#${id}sk)` : S.skin;
  // ribbon and robe
  add(`<path d="${sm(g.ribbon)}" fill="${style === 'C' ? `url(#${id}sc)` : S.scarf}" ${L}/>`);
  add(`<path d="${sm(g.robe)}" fill="${style === 'C' ? `url(#${id}rb)` : S.robe}" ${L}/>`);
  add(`<path d="${poly(g.collar)}" fill="${S.trim}" ${Li}/>`);
  add(`<path d="${poly(g.neck)}" fill="${S.skinS}" ${Li}/>`);
  add(`<path d="${sm(g.head)}" fill="${skinFill}" ${L}/>`);
  if (style === 'A') {
    add(`<clipPath id="${id}hc"><path d="${sm(g.head)}"/></clipPath>`);
    add(`<path clip-path="url(#${id}hc)" d="${poly([[240, 260], [470, 260], [455, 420], [470, 560], [430, 700], [240, 700]])}" fill="${S.skinS}"/>`);
  } else if (OUT) {
    add(`<path d="${smooth([[404, 470], [440, 520], [456, 640], [404, 664], [376, 590]])}" fill="${S.skinS}"/>`);
  } else {
    add(`<path d="${smooth([[300, 330], [420, 310], [450, 420], [440, 560], [452, 640], [330, 640], [290, 500]])}" fill="#9b5c3a" opacity="0.35" filter="url(#${id}bl)"/>`);
    add(`<ellipse cx="520" cy="460" rx="30" ry="16" fill="#e8956f" opacity="0.28" filter="url(#${id}bl)"/>`);
  }
  add(`<path d="${sm(g.ear)}" fill="${style === 'C' ? S.skin : S.skinS}" ${L}/>`);
  add(`<path d="M414,452 q16,-6 20,16 q2,18 -12,26" fill="none" stroke="${style === 'A' ? '#9a5f40' : S.line}" stroke-width="${OUT ? 4 : 2.5}" stroke-linecap="round"/>`);
  // beard + mustache + mouth
  if (style === 'C') {
    add(`<path d="${poly(g.beard)}" fill="${S.beard}" opacity="0.85" filter="url(#${id}bl2)"/>`);
    const r = rng(9);
    let h = '';
    for (let k = 0; k < 120; k++) {
      const t = r();
      const x = 450 + t * 140 + (r() - 0.5) * 20, y = 500 + r() * 200;
      h += `<path d="M${f(x)},${f(y)} q${f(6 + r() * 6)},${f(8)} ${f(10 + r() * 10)},${f(18 + r() * 14)}" stroke="${r() < 0.3 ? '#4d3c32' : '#15100d'}" stroke-width="${f(1.5 + r() * 1.4)}" fill="none" stroke-linecap="round"/>`;
    }
    add(`<clipPath id="${id}bc"><path d="${poly(g.beard)}"/></clipPath><g clip-path="url(#${id}bc)">${h}</g>`);
  } else add(`<path d="${OUT ? smooth(g.beard, true, 0.7) : poly(g.beard)}" fill="${S.beard}" ${OUT ? L : ''}/>`);
  add(`<path d="M${P([g.mouth[0]])}L${P([g.mouth[1]])}" stroke="${style === 'A' ? '#5a2f22' : S.line}" stroke-width="4" stroke-linecap="round"/>`);
  add(`<path d="${style === 'A' ? poly(g.must) : smooth(g.must)}" fill="${S.beard}" ${OUT ? Li : ''}/>`);
  // nose nostril, eye, brow
  add(`<path d="M${f(g.nostril[0][0])},${f(g.nostril[0][1])} q8,-6 ${f(g.nostril[1][0] - g.nostril[0][0])},${f(g.nostril[1][1] - g.nostril[0][1])}" fill="none" stroke="${style === 'A' ? '#7a4630' : S.line}" stroke-width="${OUT ? 4 : 3}" stroke-linecap="round"/>`);
  const e = g.eye;
  const white = [...e.up, ...e.lo.slice(1, -1)];
  const cid = uid('sec');
  defs += `<clipPath id="${cid}"><path d="${smooth(white)}"/></clipPath>`;
  add(`<path d="${smooth(white)}" fill="${S.white}"/>`);
  add(`<g clip-path="url(#${cid})"><circle cx="${f(e.iris[0])}" cy="${f(e.iris[1])}" r="${f(e.r)}" fill="${S.iris}"/><circle cx="${f(e.iris[0] + 2)}" cy="${f(e.iris[1])}" r="5" fill="#0d0805"/></g>`);
  add(`<circle cx="${f(e.iris[0] + 3)}" cy="${f(e.iris[1] - 4)}" r="3" fill="#fff"/>`);
  if (style === 'A') add(`<path d="${smooth([...e.up, [e.up[2][0], e.up[2][1] - 8], [e.up[1][0], e.up[1][1] - 10], [e.up[0][0] - 2, e.up[0][1] - 6]])}" fill="#2a1d18"/>`);
  else add(`<path d="${smooth([...e.up, [e.up[2][0] + 6, e.up[2][1] + 2]], false)}" fill="none" stroke="${S.line}" stroke-width="${OUT ? 7 : 4}" stroke-linecap="round"/>`);
  add(`<path d="${style === 'A' ? poly(g.brow) : smooth(g.brow)}" fill="${S.beard}" ${OUT ? Li : ''}/>`);
  // jade ring + scarf + corner
  add(`<circle cx="${g.ring[0]}" cy="${g.ring[1]}" r="27" fill="none" stroke="${OUT ? S.line : S.ringS}" stroke-width="${OUT ? 22 : 15}"/><circle cx="${g.ring[0]}" cy="${g.ring[1]}" r="27" fill="none" stroke="${S.ring}" stroke-width="11"/>`);
  add(`<path d="${style === 'A' ? poly(g.corner) : smooth(g.corner)}" fill="${style === 'A' ? S.scarfHi : style === 'C' ? `url(#${id}sc)` : S.scarf}" ${L}/>`);
  add(`<path d="${sm(g.scarf)}" fill="${style === 'C' ? `url(#${id}sc)` : S.scarf}" ${L}/>`);
  if (OUT) add(`<path d="${smooth([[330, 190], [400, 168], [470, 180]], false)}" fill="none" stroke="${S.scarfHi}" stroke-width="12" stroke-linecap="round"/>`);
  const bg = opts.bg ?? ({ A: '#ece2d0', B: '#f1e6cf', C: '#e9e3d8', D: '#f4ead8' })[style];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${opts.vb ?? '150 60 560 760'}"><defs>${defs}</defs><rect x="0" y="0" width="800" height="900" fill="${bg}"/>${out}</svg>`;
}
