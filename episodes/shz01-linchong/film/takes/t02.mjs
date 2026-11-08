// T02 · S05 title · 18.657–26.970 (+ drawn under T03 until 27.17 for the paper-tear match cut)
// 「林冲」 brushed on the 休书 paper; the two 冫 dots are tears that turn to ink; 豹子头; the seal; the emblem (林冲 in
// 毡笠, spear on the shoulder, gourd) as an ink silhouette on a wash ridge; the music's silence: picture pause, the
// spear lowers and pushes through the paper at its tip.
import { L, kf, ramp, E, bake, f2, clamp, lerp, rng, noise1, snow, ridge, toScreen, ASSET, furl } from '../lib.mjs';
import { lin } from '../../chars/rig/linchong.mjs';

const ID = 't02';
// title group: glyphs laid out at font 360 (x 20, baseline 420), mapped to the screen by scale 1.08 + offset
const TS = 1.08, TO = [354, 64];
const ref2scr = (p) => [TO[0] + p[0] * TS, TO[1] + p[1] * TS];
// emblem (world coords at d 0.5)
const EM = { x: 1520, y: 1010, h: 500 };
const TIP_W = [863, 648]; // measured spear tip of the final pose (rig, flip none, height 500)
const T_PAUSE = 25.45, T_LOWER = 26.15, T_HIT = 26.97;

export function cam(t) {
  const z = lerp(1.0, 1.06, ramp(t, 23.65, T_PAUSE, E.inOut));
  return { x: 0, y: 0, zoom: z };
}
/** Screen point where the spear tip meets the paper (shared with T03 for the match cut). */
export const TIP = (() => toScreen(cam(T_HIT), 0.5, TIP_W))();

/** The tear opening along the spear line, p 0..1 (screen coords). */
export function tearPath(p) {
  const [cx, cy] = TIP;
  const W = lerp(40, 1500, E.out(clamp(p * 1.25)));
  const Hh = lerp(3, 1000, E.in(clamp(p)));
  const top = [], bot = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const u = -1 + (2 * i) / n, x = cx + u * W;
    const env = Math.sqrt(Math.max(0, 1 - u * u));
    const jag = (noise1(x / 23, 3) * 0.6 + noise1(x / 7, 9) * 0.4) * lerp(5, 26, clamp(p * 2));
    top.push([x, cy - Hh * env - Math.abs(jag) - 2]);
    bot.push([x, cy + Hh * env + Math.abs(noise1(x / 19, 5)) * lerp(5, 22, clamp(p * 2)) + 2]);
  }
  const pts = [...top, ...bot.reverse()];
  return 'M' + pts.map((q) => `${f2(q[0])},${f2(q[1])}`).join(' L') + 'Z';
}

// ------------------------------------------------------------------ stroke order (ref coords, font 360)
// each: [t0, t1, path (centre line), width]
const STROKES = [
  // 林: left 木 on the four beats, the right 木 in one rush
  [18.657, 18.80, 'M70,252 L196,240', 64],
  [18.866, 19.02, 'M140,138 L142,445', 70],
  [19.075, 19.23, 'M150,262 L92,340 L22,398', 80],
  [19.284, 19.40, 'M148,292 L196,336', 58],
  [19.493, 19.55, 'M196,246 L340,226', 66],
  [19.535, 19.60, 'M250,128 L250,452', 74],
  [19.575, 19.65, 'M252,268 L196,340 L150,382', 78],
  [19.615, 19.70, 'M262,262 L320,330 L382,388', 84],
  // 冲: 冫 dots arrive as tears (handled below); 口 then the long vertical of 中
  [20.13, 20.20, 'M528,186 L544,300', 52],
  [20.17, 20.25, 'M530,198 L690,198 L668,282', 42],
  [20.22, 20.30, 'M546,286 L676,282', 48],
  [20.329, 20.43, 'M590,122 L592,466', 76],
];
const DOT1 = { at: 19.911, ref: [489, 196], r: 34 };         // upper dot of 冫
const DOT2 = { at: 20.120, ref: [446, 336], to: [512, 238] }; // the rising tick of 冫

function titleInk(t) {
  let defs = `<filter id="${ID}ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>` +
    `<filter id="${ID}bleed" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.5"/></filter>`;
  let mask = '';
  for (const [a, b, d, w] of STROKES) {
    const p = clamp((t - a) / (b - a));
    if (p <= 0) continue;
    mask += `<path d="${d}" pathLength="1" stroke="#fff" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-dasharray="1 1" stroke-dashoffset="${f2(1 - E.out(p))}"/>`;
  }
  // 冫 dots appear on the tears' impact
  const k1 = ramp(DOT1.at, DOT1.at, DOT1.at) && clamp((t - DOT1.at) / 0.08);
  if (k1 > 0) mask += `<circle cx="${DOT1.ref[0]}" cy="${DOT1.ref[1]}" r="${f2(DOT1.r * 1.3 * E.out(k1))}" fill="#fff"/>`;
  const k2 = clamp((t - DOT2.at) / 0.1);
  if (k2 > 0) mask += `<path d="M${DOT2.ref[0]},${DOT2.ref[1]} L${DOT2.to[0]},${DOT2.to[1]}" pathLength="1" stroke="#fff" stroke-width="64" stroke-linecap="round" fill="none" stroke-dasharray="1 1" stroke-dashoffset="${f2(1 - E.out(k2))}"/>`;
  defs += `<mask id="${ID}m" maskUnits="userSpaceOnUse" x="0" y="0" width="800" height="520"><rect width="800" height="520" fill="#000"/>${mask}</mask>`;
  const glyphs = `<text x="20" y="420" font-family="Ma Shan Zheng" font-size="360" fill="#17120E">林冲</text>`;
  let s = `<defs>${defs}</defs><g transform="translate(${TO[0]} ${TO[1]}) scale(${TS})" mask="url(#${ID}m)">` +
    `<g filter="url(#${ID}bleed)" opacity="0.32">${glyphs.replace('#17120E', '#3A2E26')}</g><g filter="url(#${ID}ink)">${glyphs}</g></g>`;
  // the two tears falling onto the 冫 positions (screen coords)
  for (const [at, ref] of [[DOT1.at, DOT1.ref], [DOT2.at, DOT2.ref]]) {
    const fall = 0.26, p = (t - (at - fall)) / fall;
    const [x, y1] = ref2scr(ref);
    if (p > 0 && p < 1) {
      const y = lerp(-60, y1, p * p), st = 1 + p * 1.6;
      s += `<g transform="translate(${f2(x)} ${f2(y)}) scale(1 ${f2(st)})"><path d="M0,-22 C8,-8 14,2 14,10 C14,20 7,26 0,26 C-7,26 -14,20 -14,10 C-14,2 -8,-8 0,-22Z" fill="#D6EEFA" stroke="#8FB9CF" stroke-width="1.5" opacity="0.92"/><ellipse cx="-4" cy="10" rx="3.5" ry="5" fill="#fff" opacity="0.9"/></g>`;
    }
    const q = (t - at) / 0.32;
    if (q > 0 && q < 1) {
      // splash ring as the tear turns to ink
      s += `<ellipse cx="${f2(x)}" cy="${f2(y1 + 6)}" rx="${f2(16 + q * 46)}" ry="${f2(6 + q * 16)}" fill="none" stroke="#9FC3D6" stroke-width="${f2(3 * (1 - q))}" opacity="${f2(0.8 * (1 - q))}"/>`;
      for (let i = 0; i < 5; i++) {
        const a = (-160 + i * 35) * Math.PI / 180;
        s += `<circle cx="${f2(x + Math.cos(a) * (20 + q * 40))}" cy="${f2(y1 + Math.sin(a) * (10 + q * 22) - q * 10)}" r="${f2(3 * (1 - q))}" fill="#3A2E26" opacity="${f2(1 - q)}"/>`;
      }
    }
  }
  return s;
}

function nickname(t) {
  // 豹子头: a vertical inscription column right of 冲, fades up at 21.153 (12 frames)
  const k = ramp(t, 21.153, 21.153 + 0.4, E.out);
  if (k <= 0) return '';
  const x = 1176, y0 = 236;
  return `<g opacity="${f2(k)}" transform="translate(0 ${f2((1 - k) * 8)})">` + ['豹', '子', '头'].map((ch, i) => `<text x="${x}" y="${y0 + i * 76}" font-family="Ma Shan Zheng" font-size="70" fill="#2B211B" text-anchor="middle" dominant-baseline="hanging">${ch}</text>`).join('') + '</g>';
}

function seal(t) {
  // 「水浒人物志 · 壹」 red square seal, stamps at 22.814 (scale 1.25 → 1 in 4 frames, 3-frame jolt, ink spreads 2 px)
  const at = 22.814;
  if (t < at - 0.12) return '';
  const p = clamp((t - (at - 0.12)) / 0.133);
  const sc = lerp(1.25, 1.0, E.in(p));
  const jolt = t > at && t < at + 0.1 ? Math.sin((t - at) * 90) * 3 * (1 - (t - at) / 0.1) : 0;
  const op = clamp(p * 3);
  const spread = clamp((t - at) / 0.4) * 2;
  const cx = 1176, cy = 560, S = 128;
  const cols = [['水', '浒'], ['人', '物'], ['志', '壹']];
  let txt = '';
  cols.forEach((col, ci) => col.forEach((ch, ri) => {
    txt += `<text x="${f2(cx + S / 2 - 22 - ci * 42)}" y="${f2(cy - S / 2 + 12 + ri * 54)}" font-family="Noto Serif CJK SC" font-weight="700" font-size="44" fill="#F6EBD9" text-anchor="middle" dominant-baseline="hanging">${ch}</text>`;
  }));
  return `<defs><filter id="${ID}seal" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="11"/><feDisplacementMap in="SourceGraphic" scale="${f2(5 + spread)}"/><feGaussianBlur stdDeviation="${f2(0.3 + spread * 0.25)}"/></filter></defs>` +
    `<g transform="translate(${f2(cx + jolt)} ${f2(cy + jolt * 0.6)}) scale(${f2(sc)}) translate(${-cx} ${-cy})" opacity="${f2(op)}"><g filter="url(#${ID}seal)">` +
    `<rect x="${cx - S / 2}" y="${cy - S / 2}" width="${S}" height="${S}" rx="6" fill="#B3302A"/>` +
    `<rect x="${cx - S / 2 + 6}" y="${cy - S / 2 + 6}" width="${S - 12}" height="${S - 12}" rx="4" fill="none" stroke="#F6EBD9" stroke-width="2.5" opacity="0.85"/>${txt}</g></g>`;
}

// ------------------------------------------------------------------ backgrounds (baked)
const SKY = bake(`${ID}_sky`, 2200, 760, (() => {
  let s = `<defs><linearGradient id="${ID}sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AA3AD" stop-opacity="0.85"/><stop offset="0.45" stop-color="#B4BBC2" stop-opacity="0.55"/><stop offset="1" stop-color="#C9CED3" stop-opacity="0"/></linearGradient>` +
    `<filter id="${ID}cl" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="34"/></filter></defs>`;
  s += `<rect width="2200" height="760" fill="url(#${ID}sg)"/>`;
  const R = rng(21);
  let cl = '';
  for (let i = 0; i < 14; i++) cl += `<ellipse cx="${f2(R() * 2200)}" cy="${f2(60 + R() * 320)}" rx="${f2(160 + R() * 260)}" ry="${f2(40 + R() * 60)}" fill="${R() > 0.5 ? '#7E8892' : '#E4E7EA'}" opacity="${f2(0.25 + R() * 0.3)}"/>`;
  s += `<g filter="url(#${ID}cl)">${cl}</g>`;
  return s;
})());
const FAR = bake(`${ID}_far`, 2200, 700, (() => {
  // far ink-wash ranges fading into the paper toward the left
  let s = `<defs><linearGradient id="${ID}ff" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.5"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>` +
    `<mask id="${ID}fm"><rect width="2200" height="700" fill="url(#${ID}ff)"/></mask><filter id="${ID}fb"><feGaussianBlur stdDeviation="2.5"/></filter>` +
    `<linearGradient id="${ID}fv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E959B"/><stop offset="1" stop-color="#C7CBCD" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="${ID}fv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F767C"/><stop offset="1" stop-color="#B8BDC0" stop-opacity="0"/></linearGradient></defs>`;
  s += `<g mask="url(#${ID}fm)" filter="url(#${ID}fb)"><path d="${ridge(5, 0, 2200, 360, 220, 700)}" fill="url(#${ID}fv)" opacity="0.65"/><path d="${ridge(8, 0, 2200, 470, 200, 700)}" fill="url(#${ID}fv2)" opacity="0.7"/></g>`;
  return s;
})());
const NEAR = bake(`${ID}_near`, 1300, 420, (() => {
  // the ridge he stands on (d 0.5): dark wash with a dry-brush top edge
  let s = `<defs><linearGradient id="${ID}nv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E2B29"/><stop offset="0.35" stop-color="#5A5753" stop-opacity="0.85"/><stop offset="1" stop-color="#9A9894" stop-opacity="0.2"/></linearGradient>` +
    `<linearGradient id="${ID}nh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.3" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="${ID}nm"><rect width="1300" height="420" fill="url(#${ID}nh)"/></mask>` +
    `<filter id="${ID}nd" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.06 0.02" numOctaves="3" seed="2"/><feDisplacementMap in="SourceGraphic" scale="14"/></filter></defs>`;
  const pts = [];
  for (let x = 0; x <= 1300; x += 20) pts.push([x, 150 - 70 * Math.exp(-(((x - 560) / 330) ** 2)) + noise1(x / 60, 4) * 10]);
  const d = `M0,420 L` + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(' L') + ' L1300,420Z';
  s += `<g mask="url(#${ID}nm)" filter="url(#${ID}nd)"><path d="${d}" fill="url(#${ID}nv)"/></g>`;
  return s;
})());

function emblem(t) {
  // pose: shoulder carry (tip up and back, gourd behind) → lowered to horizontal, pointing forward (left)
  const k = ramp(t, T_LOWER, 26.90, E.in);
  const pose = {
    shoulderL: lerp(26, 75, k), elbowL: lerp(122, 5, k), headTilt: lerp(0, -3, k),
    spear: { hand: 'L', angle: lerp(-30, 90, k), grip: lerp(0.12, 0.2, k), gourd: true },
  };
  const fig = lin({ view: 'side', costume: 'C', x: EM.x, y: EM.y, height: EM.h, pose });
  return `<defs><filter id="${ID}sil" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feFlood flood-color="#15110E"/><feComposite in2="SourceAlpha" operator="in"/><feGaussianBlur stdDeviation="0.6"/></filter></defs>` +
    `<g filter="url(#${ID}sil)">${fig}</g>`;
}

function fleckTime(t) {
  // flecks drift; gusts at 24.486 and 24.892 race them; from 25.45 they slow to 10 % and hang
  const g = (a) => clamp((t - a) / 0.35) * 0.35 * 2.2; // extra distance from a gust
  let tau = Math.min(t, T_PAUSE) + g(24.486) + g(24.892);
  if (t > T_PAUSE) tau += (t - T_PAUSE) * 0.1 + Math.min(t - T_PAUSE, 0.2) * 0.4;
  return tau;
}

export default {
  noFibre: () => false,
  frame(t) {
    const c = cam(t);
    const tau = fleckTime(t);
    let s = '';
    // paper ground (screen-fixed under the camera, d 1)
    s += L(c, 1, `<image href="${furl(ASSET + '/paper.png')}" x="-80" y="-120" width="2080" height="1320" preserveAspectRatio="xMidYMid slice"/>`, { id: `${ID}paper`, bleed: 'all' });
    s += L(c, 0.2, `<g style="mix-blend-mode:multiply">${SKY.replace('x="0" y="0"', 'x="-140" y="-80"')}</g>`, { id: `${ID}sky`, bleed: 'all' });
    s += L(c, 0.2, `<g style="mix-blend-mode:multiply">${FAR.replace('x="0" y="0"', 'x="-140" y="330"')}</g>`, { id: `${ID}far`, bleed: 'all' });
    s += snow(tau, { seed: 31, n: 46, d: 0.6, r: [1.4, 3.2], fall: 46, slant: -38, sway: 10, color: '#FBF7EE', op: 0.85, cam: c, z: 300 });
    s += L(c, 0.5, `<g style="mix-blend-mode:multiply">${NEAR.replace('x="0" y="0"', 'x="760" y="760"')}</g>` + emblem(t), { id: `${ID}emblem`, bleed: 'rb' });
    // paper bulge at the spear tip in the silence (26.75 → 26.97)
    const bk = ramp(t, 26.75, T_HIT, E.in);
    let bulge = '';
    if (bk > 0) {
      const [bx, by] = TIP;
      bulge = `<defs><radialGradient id="${ID}bg"><stop offset="0" stop-color="#FFFDF5" stop-opacity="0.9"/><stop offset="0.55" stop-color="#FFF8E8" stop-opacity="0.35"/><stop offset="0.8" stop-color="#6B5A44" stop-opacity="0.22"/><stop offset="1" stop-color="#6B5A44" stop-opacity="0"/></radialGradient></defs>` +
        `<ellipse cx="${f2(bx - 6)}" cy="${f2(by)}" rx="${f2(20 + 46 * bk)}" ry="${f2(16 + 34 * bk)}" fill="url(#${ID}bg)"/>`;
    }
    s += L(c, 1, titleInk(t) + nickname(t) + seal(t), { id: `${ID}title` });
    s += `<g data-layer="${ID}bulge" data-z="160">${bulge}</g>`;
    s += snow(tau, { seed: 37, n: 14, d: 1.2, r: [3, 6], fall: 70, slant: -38, sway: 16, color: '#FBF7EE', op: 0.75, blur: 1.5, cam: c, z: 400 });
    // torn paper edge during the match cut (T03 is drawn inside the tear on top of this)
    if (t >= T_HIT) {
      const p = clamp((t - T_HIT) / 0.2);
      const d = tearPath(p);
      s += `<g data-layer="${ID}tear" data-z="700" data-bleed="all"><path d="${d}" fill="none" stroke="#5A4630" stroke-width="16" opacity="0.35"/><path d="${d}" fill="none" stroke="#FBF5E6" stroke-width="10"/></g>`;
    }
    return s;
  },
};
