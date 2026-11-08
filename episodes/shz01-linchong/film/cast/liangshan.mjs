// Cast and props for T11–T12 (builder F): the snow-night walker (S26), the rear silhouette at the door (S25),
// his back for the OTS (S28), the small boat with boatman and messenger (S28), the banquet shadow-play and the
// lantern boat's shadow (S30), geese (S27).
import { f2, clamp, lerp, rng, noise1, E, smooth } from '../lib.mjs';
import { lin } from '../../chars/rig/linchong.mjs';

const LN = '#2A1C17';

// ------------------------------------------------------------------ helpers on rig strings
/** Cut the balanced <g …>…</g> element that contains `marker` out of an SVG string. -> [rest, element] */
function cutGroup(s, marker) {
  const i = s.indexOf(marker);
  if (i < 0) return [s, ''];
  const a = s.lastIndexOf('<g', i);
  let depth = 0, j = a;
  const re = /<g[\s>]|<\/g>/g;
  re.lastIndex = a;
  let m;
  while ((m = re.exec(s))) {
    if (m[0].startsWith('</')) depth--; else depth++;
    if (depth === 0) { j = m.index + 4; break; }
  }
  return [s.slice(0, a) + s.slice(j), s.slice(a, j)];
}
const rootMatrix = (s) => (s.match(/data-rig="linchong"[^>]*transform="(matrix\([^)]*\))"/) || [])[1] || '';

// ------------------------------------------------------------------ S26: the walker (silhouette, iconic)
/**
 * walker({ t, x, y, height, id, phase, body, rim, gourdCol, wind })
 * Costume C side view facing right (毡笠, cloak, spear on the shoulder, gourd at the tip), filled as a cold
 * silhouette with a rim, own walking legs (the rig has no leg joints), the gourd swinging warm.
 */
export function walker(o) {
  const { t = 0, x = 0, y = 0, height = 160, id = 'wk', body = '#1E2430', rim = '#CFE0EE' } = o;
  const per = o.period || 0.84; // one stride (two steps)
  const ph = ((t / per + (o.phase || 0)) % 1 + 1) % 1;
  const bob = Math.abs(Math.sin(ph * Math.PI * 2)) * height * 0.012;
  const rig = lin({
    view: 'side', costume: 'C', flip: true, x: 0, y: 0, height,
    pose: { shoulderR: 18, elbowR: 112, fistR: true, headTilt: 3, shoulderL: -8, elbowL: 10 },
    props: { spear: { hand: 'R', angle: -52, grip: 0.16, gourd: true } },
  });
  const [noGourd, gourdEl] = cutGroup(rig, 'data-part="gourd"');
  const M = rootMatrix(rig);
  // gourd swing about its hang point
  const hm = gourdEl.match(/translate\(([-\d.]+),([-\d.]+)\)/);
  const sw = Math.sin(t * 5.2 + 0.6) * 9 + (o.wind ?? -6);
  const gourd = hm ? `<g transform="${M}"><g transform="rotate(${f2(sw)} ${hm[1]} ${hm[2]})">${gourdEl}</g></g>` : '';
  // legs: two tapered legs from the hip (hidden under the cloak), stride ±24°
  const H = height / 7.5, hipY = -height * 0.47, L = height * 0.47;
  const leg = (a, k) => {
    const r = (a * Math.PI) / 180, kx = Math.sin(r) * L, ky = Math.cos(r) * L;
    const knee = [Math.sin(r) * L * 0.5 + (k ? 0 : 0), hipY + Math.cos(r) * L * 0.5];
    const foot = [kx, hipY + ky];
    const w0 = H * 0.32, w1 = H * 0.2;
    return `<path d="M${f2(-w0)},${f2(hipY)} L${f2(foot[0] - w1)},${f2(foot[1] - H * 0.3)} L${f2(foot[0] - w1)},${f2(foot[1])} L${f2(foot[0] + w1 * 2.4)},${f2(foot[1])} L${f2(foot[0] + w1)},${f2(foot[1] - H * 0.35)} L${f2(w0)},${f2(hipY)}Z"/>` + (knee ? '' : '');
  };
  const a = Math.sin(ph * Math.PI * 2) * 24;
  const legs = `<g transform="translate(${f2(height * 0.02)} 0)">${leg(a, 0)}${leg(-a, 1)}</g>`;
  // clip the rig's static legs off below the cloak hem
  const clipY = -height * 0.215;
  const fig = `<g clip-path="url(#${id}clip)">${noGourd}</g>`;
  const defs = `<defs><clipPath id="${id}clip"><rect x="${-height}" y="${-height * 2.2}" width="${height * 2}" height="${f2(height * 2.2 + clipY)}"/></clipPath>` +
    `<filter id="${id}sil" color-interpolation-filters="sRGB"><feFlood flood-color="${body}"/><feComposite in2="SourceAlpha" operator="in"/></filter>` +
    `<filter id="${id}rim" color-interpolation-filters="sRGB"><feFlood flood-color="${rim}"/><feComposite in2="SourceAlpha" operator="in"/><feOffset dx="${f2(-height * 0.009)}" dy="${f2(-height * 0.006)}"/></filter>` +
    `<g id="${id}body">${legs}${fig}</g></defs>`;
  const gcol = o.gourdCol ? `<g opacity="0.92">${gourd}</g>` : '';
  return `<g transform="translate(${f2(x)} ${f2(y - bob)})">${defs}<use href="#${id}body" filter="url(#${id}rim)"/><use href="#${id}body" filter="url(#${id}sil)"/>${gcol}</g>`;
}

// ------------------------------------------------------------------ S25: rear silhouette braced at the door
/** Rear silhouette in 毡笠 and cloak at the door: left arm pushing forward-left, right hand low on the spear.
 * Local coords: feet centre at (0,0), height = px for 1.80 m. */
export function rearDoorSil({ height = 980, col = '#120D0B' } = {}) {
  const H = height / 7.5, P = (pts) => smooth(pts.map(([x, y]) => [x * H, y * H]));
  let p = '';
  // cloak (shoulders to the calves, folds at the hem)
  p += `<path d="${P([[-0.32, -6.5], [-0.7, -6.36], [-1.0, -6.12], [-1.13, -5.8], [-1.2, -5.3], [-1.32, -4.4], [-1.45, -3.3], [-1.58, -2.2], [-1.64, -1.55], [-1.1, -1.42], [-0.5, -1.52], [0.1, -1.4], [0.7, -1.5], [1.25, -1.4], [1.66, -1.54], [1.55, -2.4], [1.42, -3.4], [1.3, -4.5], [1.2, -5.4], [1.1, -5.86], [0.95, -6.13], [0.68, -6.37], [0.32, -6.5]])}"/>`;
  // left arm reaching forward-left (sleeve sagging under it) and the hand
  p += `<path d="${P([[-0.95, -6.02], [-1.6, -5.97], [-2.2, -5.78], [-2.62, -5.52], [-2.68, -5.12], [-2.2, -4.98], [-1.7, -4.9], [-1.22, -5.08]])}"/>`;
  p += `<ellipse cx="${f2(-2.84 * H)}" cy="${f2(-5.32 * H)}" rx="${f2(0.2 * H)}" ry="${f2(0.26 * H)}"/>`;
  // right arm down to the spear grip
  p += `<path d="${P([[1.02, -5.92], [1.36, -5.3], [1.5, -4.6], [1.44, -4.0], [1.2, -3.84], [1.1, -4.3], [1.12, -5.0], [0.86, -5.5]])}"/>`;
  p += `<ellipse cx="${f2(1.34 * H)}" cy="${f2(-3.86 * H)}" rx="${f2(0.2 * H)}" ry="${f2(0.24 * H)}"/>`;
  // legs braced apart, boots
  p += `<path d="${P([[-0.78, -1.62], [-1.0, -0.8], [-1.18, -0.2], [-1.3, 0.02], [-0.66, 0.02], [-0.6, -0.5], [-0.32, -1.6]])}"/>`;
  p += `<path d="${P([[0.36, -1.6], [0.62, -0.5], [0.7, 0.02], [1.34, 0.02], [1.22, -0.2], [1.02, -0.8], [0.8, -1.62]])}"/>`;
  // head (back), collar, hat brim and crown
  p += `<ellipse cx="0" cy="${f2(-6.92 * H)}" rx="${f2(0.4 * H)}" ry="${f2(0.46 * H)}"/>`;
  p += `<path d="${P([[-0.46, -6.62], [-0.2, -6.78], [0.2, -6.78], [0.46, -6.62], [0.4, -6.4], [-0.4, -6.4]])}"/>`;
  p += `<ellipse cx="0" cy="${f2(-7.24 * H)}" rx="${f2(1.0 * H)}" ry="${f2(0.15 * H)}" transform="rotate(-3 0 ${f2(-7.24 * H)})"/>`;
  p += `<path d="M${f2(-0.38 * H)},${f2(-7.26 * H)} C${f2(-0.4 * H)},${f2(-7.72 * H)} ${f2(0.4 * H)},${f2(-7.72 * H)} ${f2(0.38 * H)},${f2(-7.26 * H)}Z"/>`;
  return `<g fill="${col}">${p}</g>`;
}
/** The spear held level, pointing into the depth: butt near the camera (lower right) to the tip (vanishing). */
export function spearLevel(x0, y0, x1, y1, w0, w1, col = '#120D0B', tassel = '#8f1f1a') {
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  const P = (x, y) => `${f2(x)},${f2(y)}`;
  let s = `<path d="M${P(x0 + nx * w0, y0 + ny * w0)} L${P(x1 + nx * w1, y1 + ny * w1)} L${P(x1 - nx * w1, y1 - ny * w1)} L${P(x0 - nx * w0, y0 - ny * w0)}Z" fill="${col}"/>`;
  const bx = x1 + (dx / l) * 6, by = y1 + (dy / l) * 6;
  s += `<path d="M${P(x1 + nx * w1 * 2.4, y1 + ny * w1 * 2.4)} L${P(bx + (dx / l) * w1 * 14, by + (dy / l) * w1 * 14)} L${P(x1 - nx * w1 * 2.4, y1 - ny * w1 * 2.4)}Z" fill="${col}"/>`;
  s += `<ellipse cx="${f2(x1 - (dx / l) * w1 * 2)}" cy="${f2(y1 - (dy / l) * w1 * 2 + w1 * 3)}" rx="${f2(w1 * 3)}" ry="${f2(w1 * 5)}" fill="${tassel}"/>`;
  return s;
}

// ------------------------------------------------------------------ S28: his back (OTS, rear bust)
/** Rear bust: centre of the neck base at (0,0), head unit H px. drop 0..1 shoulders sink + head bows. */
export function rearBust({ H = 230, drop = 0, robe = '#2E3446', robeS = '#232837', cloth = '#1E2128', skin = '#D9A07E', hair = '#151312' } = {}) {
  const s = (v) => f2(v * H);
  const sy = drop * 0.12, hb = drop * 5; // shoulders sink, head bows (deg)
  let b = '';
  // shoulders / back (bleeds off the bottom)
  b += `<path d="M${s(-0.32)},${s(-0.18 + sy)} C${s(-0.62)},${s(-0.08 + sy)} ${s(-0.98)},${s(0.0 + sy)} ${s(-1.08)},${s(0.32 + sy)} C${s(-1.18)},${s(0.7)} ${s(-1.22)},${s(1.4)} ${s(-1.25)},${s(2.6)} L${s(1.25)},${s(2.6)} C${s(1.22)},${s(1.4)} ${s(1.18)},${s(0.7)} ${s(1.08)},${s(0.32 + sy)} C${s(0.98)},${s(0.0 + sy)} ${s(0.62)},${s(-0.08 + sy)} ${s(0.32)},${s(-0.18 + sy)}Z" fill="${robe}" stroke="${LN}" stroke-width="${s(0.012)}"/>`;
  b += `<path d="M${s(0.15)},${s(0.05 + sy)} C${s(0.5)},${s(0.4)} ${s(0.55)},${s(1.2)} ${s(0.5)},${s(2.6)} L${s(1.25)},${s(2.6)} C${s(1.22)},${s(1.4)} ${s(1.18)},${s(0.7)} ${s(1.08)},${s(0.32 + sy)} C${s(0.98)},${s(0.0 + sy)} ${s(0.62)},${s(-0.08 + sy)} ${s(0.32)},${s(-0.18 + sy)}Z" fill="${robeS}" opacity="0.85"/>`;
  // collar (back of the cross collar)
  b += `<path d="M${s(-0.34)},${s(-0.16 + sy)} C${s(-0.2)},${s(-0.06 + sy)} ${s(0.2)},${s(-0.06 + sy)} ${s(0.34)},${s(-0.16 + sy)} L${s(0.3)},${s(-0.02 + sy)} C${s(0.15)},${s(0.06 + sy)} ${s(-0.15)},${s(0.06 + sy)} ${s(-0.3)},${s(-0.02 + sy)}Z" fill="#E9E4D6" stroke="${LN}" stroke-width="${s(0.01)}"/>`;
  // neck + head (rotated forward a little)
  let h = '';
  h += `<path d="M${s(-0.2)},${s(-0.1)} L${s(-0.22)},${s(-0.5)} L${s(0.22)},${s(-0.5)} L${s(0.2)},${s(-0.1)}Z" fill="${skin}"/>`;
  h += `<path d="M${s(-0.2)},${s(-0.32)} L${s(0.2)},${s(-0.32)}" stroke="#B57E5E" stroke-width="${s(0.03)}" opacity="0.6"/>`;
  h += `<ellipse cx="${s(-0.4)}" cy="${s(-0.72)}" rx="${s(0.07)}" ry="${s(0.12)}" fill="${skin}" stroke="${LN}" stroke-width="${s(0.01)}"/>`;
  h += `<ellipse cx="${s(0.4)}" cy="${s(-0.72)}" rx="${s(0.07)}" ry="${s(0.12)}" fill="${skin}" stroke="${LN}" stroke-width="${s(0.01)}"/>`;
  h += `<path d="M${s(-0.4)},${s(-0.62)} C${s(-0.46)},${s(-0.95)} ${s(-0.4)},${s(-1.18)} ${s(0)},${s(-1.2)} C${s(0.4)},${s(-1.18)} ${s(0.46)},${s(-0.95)} ${s(0.4)},${s(-0.62)} C${s(0.3)},${s(-0.46)} ${s(-0.3)},${s(-0.46)} ${s(-0.4)},${s(-0.62)}Z" fill="${hair}"/>`;
  // plain head cloth wrapped over the topknot, two short ties hanging
  h += `<path d="M${s(-0.42)},${s(-0.84)} C${s(-0.46)},${s(-1.12)} ${s(-0.3)},${s(-1.3)} ${s(0)},${s(-1.32)} C${s(0.3)},${s(-1.3)} ${s(0.46)},${s(-1.12)} ${s(0.42)},${s(-0.84)} C${s(0.2)},${s(-0.92)} ${s(-0.2)},${s(-0.92)} ${s(-0.42)},${s(-0.84)}Z" fill="${cloth}" stroke="${LN}" stroke-width="${s(0.01)}"/>`;
  h += `<ellipse cx="0" cy="${s(-1.36)}" rx="${s(0.16)}" ry="${s(0.12)}" fill="${cloth}"/>`;
  h += `<path d="M${s(-0.08)},${s(-0.88)} C${s(-0.12)},${s(-0.66)} ${s(-0.16)},${s(-0.5)} ${s(-0.13)},${s(-0.36)} L${s(-0.04)},${s(-0.38)} C${s(-0.06)},${s(-0.55)} ${s(-0.02)},${s(-0.7)} ${s(0.0)},${s(-0.88)}Z" fill="${cloth}"/>`;
  h += `<path d="M${s(0.06)},${s(-0.88)} C${s(0.1)},${s(-0.68)} ${s(0.13)},${s(-0.52)} ${s(0.11)},${s(-0.4)} L${s(0.19)},${s(-0.41)} C${s(0.2)},${s(-0.56)} ${s(0.15)},${s(-0.7)} ${s(0.13)},${s(-0.88)}Z" fill="${cloth}"/>`;
  return `${b}<g transform="translate(0 ${s(sy)}) rotate(${f2(hb)} 0 ${s(-0.2)})">${h}</g>`;
}

// ------------------------------------------------------------------ S28: small boat, boatman, messenger
/** Small boat (6 m) seen from 3/4 side, length px, bow to the right. Local: waterline centre at (0,0). */
export function smallBoat(len = 360, col = '#5E4A36') {
  const s = (v) => f2(v * len);
  return `<path d="M${s(-0.5)},${s(-0.03)} C${s(-0.42)},${s(0.05)} ${s(0.35)},${s(0.06)} ${s(0.52)},${s(-0.06)} L${s(0.47)},${s(-0.085)} C${s(0.3)},${s(-0.03)} ${s(-0.38)},${s(-0.03)} ${s(-0.47)},${s(-0.08)}Z" fill="${col}" stroke="${LN}" stroke-width="1.2"/>` +
    `<path d="M${s(-0.47)},${s(-0.08)} C${s(-0.38)},${s(-0.03)} ${s(0.3)},${s(-0.03)} ${s(0.47)},${s(-0.085)}" fill="none" stroke="#8A7052" stroke-width="2"/>` +
    `<path d="M${s(-0.5)},${s(0.0)} C${s(-0.3)},${s(0.03)} ${s(0.3)},${s(0.03)} ${s(0.52)},${s(-0.02)}" fill="none" stroke="#3A2C20" stroke-width="2" opacity="0.6"/>`;
}
/** A standing small figure (far, ~120 px): local feet at (0,0). kind 'boatman' (斗笠 + pole) | 'messenger'. bow 0..1. */
export function smallMan({ h = 120, kind = 'messenger', bow = 0, pole = 0, coat = '#4E5A62', facing = 1 } = {}) {
  const H = h / 7.2, s = (v) => f2(v * H);
  const tilt = bow * 32 * facing;
  let legs = `<path d="M${s(-0.35)},${s(-3.2)} L${s(-0.45)},0 L${s(-0.05)},0 L${s(0.0)},${s(-3.0)} L${s(0.08)},0 L${s(0.48)},0 L${s(0.38)},${s(-3.2)}Z" fill="#2B2F36"/>`;
  let up = '';
  up += `<path d="M${s(-0.62)},${s(-6.0)} C${s(-0.8)},${s(-5.0)} ${s(-0.75)},${s(-3.6)} ${s(-0.7)},${s(-2.9)} L${s(0.7)},${s(-2.9)} C${s(0.75)},${s(-3.6)} ${s(0.8)},${s(-5.0)} ${s(0.62)},${s(-6.0)}Z" fill="${coat}" stroke="${LN}" stroke-width="1"/>`;
  up += `<rect x="${s(-0.7)}" y="${s(-3.75)}" width="${s(1.4)}" height="${s(0.28)}" fill="#3A2C22"/>`;
  up += `<ellipse cx="${s(0.05 * facing)}" cy="${s(-6.55)}" rx="${s(0.42)}" ry="${s(0.5)}" fill="#C9906E"/>`;
  if (kind === 'boatman') {
    up += `<path d="M${s(-1.15)},${s(-6.75)} L${s(0)},${s(-7.55)} L${s(1.15)},${s(-6.75)} Q0,${s(-6.6)} ${s(-1.15)},${s(-6.75)}Z" fill="#B8A57A" stroke="${LN}" stroke-width="1"/>`;
  } else {
    up += `<path d="M${s(-0.44)},${s(-6.7)} C${s(-0.46)},${s(-7.2)} ${s(0.46)},${s(-7.2)} ${s(0.44)},${s(-6.7)}Z" fill="#23262C"/>`;
  }
  // arms: messenger hands clasped in front when bowing; boatman both hands on the pole
  if (kind === 'messenger') {
    up += `<path d="M${s(0.5 * facing)},${s(-5.7)} C${s(0.9 * facing)},${s(-5.0)} ${s((0.6 + bow * 0.5) * facing)},${s(-4.3)} ${s((0.25 + bow * 0.5) * facing)},${s(-4.45)}" stroke="${coat}" stroke-width="${s(0.38)}" fill="none" stroke-linecap="round"/>`;
    up += `<circle cx="${s((0.25 + bow * 0.5) * facing)}" cy="${s(-4.45)}" r="${s(0.2)}" fill="#C9906E"/>`;
  } else {
    up += `<path d="M${s(0.4)},${s(-5.6)} L${s(0.9)},${s(-4.9)}" stroke="${coat}" stroke-width="${s(0.36)}" stroke-linecap="round"/><path d="M${s(-0.4)},${s(-5.6)} L${s(0.2)},${s(-4.2)}" stroke="${coat}" stroke-width="${s(0.36)}" stroke-linecap="round"/>`;
  }
  const poleSvg = kind === 'boatman' ? `<line x1="${s(0.9 + pole)}" y1="${s(-9.5)}" x2="${s(-0.6 - pole)}" y2="${s(3.2)}" stroke="#6E5638" stroke-width="${s(0.18)}" stroke-linecap="round"/>` : '';
  return `<g>${legs}<g transform="rotate(${f2(tilt)} 0 ${s(-3.0)})">${up}</g>${poleSvg}</g>`;
}

// ------------------------------------------------------------------ S27: geese
export function geese(t, t0, t1, o = {}) {
  if (t < t0 || t > t1) return '';
  const k = (t - t0) / (t1 - t0);
  const x = lerp(o.x0 ?? 2000, o.x1 ?? -120, k), y = lerp(o.y0 ?? 150, o.y1 ?? 120, k);
  let s = '';
  const pos = [[0, 0], [38, -16], [76, -32], [114, -48], [38, 16], [76, 32], [114, 48]];
  pos.forEach(([dx, dy], i) => {
    const fl = Math.sin(t * 9 + i * 0.7) * 5;
    s += `<path d="M${f2(x + dx - 12)},${f2(y + dy - fl)} Q${f2(x + dx - 5)},${f2(y + dy - 2)} ${f2(x + dx)},${f2(y + dy)} Q${f2(x + dx + 5)},${f2(y + dy - 2)} ${f2(x + dx + 12)},${f2(y + dy - fl)}" stroke="#3E3A36" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  });
  return `<g opacity="${f2(Math.min(1, k * 6, (1 - k) * 6) * 0.85)}">${s}</g>`;
}

// ------------------------------------------------------------------ S30: the banquet shadow-play (window-local coords, w 480 × h 576)
/** bow 0..1 (宋江 bows low), toast 0..1 (cups up), fade 0..1 (banquet visible). */
export function banquetShadows({ bow = 0, toast = 0, fade = 1, w = 480, h = 576 } = {}) {
  if (fade <= 0.01) return '';
  const k = w / 480;
  const X = (v) => f2(v * k), Y = (v) => f2(v * k);
  let s = '';
  // 高俅 seated, right, long horizontal 幞头 wings
  const gx = 345, gy = 400;
  s += `<path d="M${X(gx - 40)},${Y(gy + 120)} C${X(gx - 45)},${Y(gy + 40)} ${X(gx - 38)},${Y(gy - 30)} ${X(gx - 30)},${Y(gy - 60)} C${X(gx - 10)},${Y(gy - 75)} ${X(gx + 18)},${Y(gy - 75)} ${X(gx + 34)},${Y(gy - 58)} C${X(gx + 44)},${Y(gy - 20)} ${X(gx + 56)},${Y(gy + 40)} ${X(gx + 70)},${Y(gy + 120)}Z"/>`; // body seated, robe spreading
  s += `<rect x="${X(gx - 60)}" y="${Y(gy + 30)}" width="${X(150)}" height="${Y(14)}"/>`; // lap / chair seat
  s += `<ellipse cx="${X(gx + 2)}" cy="${Y(gy - 98)}" rx="${X(22)}" ry="${Y(26)}"/>`; // head
  s += `<rect x="${X(gx - 18)}" y="${Y(gy - 132)}" width="${X(40)}" height="${Y(20)}" rx="${X(4)}"/>`; // 幞头 cap
  s += `<rect x="${X(gx - 92)}" y="${Y(gy - 126)}" width="${X(186)}" height="${Y(5)}" rx="${X(2)}"/>`; // long wings
  // 宋江 bowing low before him (left), torso from upright to horizontal
  const sx = 190, sy = 520, a = -bow * 78; // degrees: torso rotates toward 高俅 (right)
  s += `<path d="M${X(sx - 22)},${Y(sy)} L${X(sx - 14)},${Y(sy - 120)} L${X(sx + 16)},${Y(sy - 120)} L${X(sx + 26)},${Y(sy)}Z"/>`; // legs/robe skirt
  s += `<g transform="rotate(${f2(-a)} ${X(sx)} ${Y(sy - 118)})"><path d="M${X(sx - 26)},${Y(sy - 112)} C${X(sx - 30)},${Y(sy - 170)} ${X(sx - 20)},${Y(sy - 205)} ${X(sx)},${Y(sy - 210)} C${X(sx + 20)},${Y(sy - 205)} ${X(sx + 30)},${Y(sy - 170)} ${X(sx + 26)},${Y(sy - 112)}Z"/>` +
    `<ellipse cx="${X(sx + 2)}" cy="${Y(sy - 232)}" rx="${X(18)}" ry="${Y(22)}"/><rect x="${X(sx - 14)}" y="${Y(sy - 262)}" width="${X(32)}" height="${Y(16)}" rx="${X(4)}"/>` +
    `<path d="M${X(sx + 14)},${Y(sy - 196)} C${X(sx + 44)},${Y(sy - 180)} ${X(sx + 52)},${Y(sy - 160)} ${X(sx + 48)},${Y(sy - 150)} L${X(sx + 36)},${Y(sy - 148)} C${X(sx + 36)},${Y(sy - 162)} ${X(sx + 24)},${Y(sy - 172)} ${X(sx + 10)},${Y(sy - 178)}Z"/></g>`; // clasped hands
  // toasting figures, far back (smaller, lighter), cups raised
  for (const [tx, ty, sc] of [[70, 470, 0.72], [440, 480, 0.68]]) {
    const ar = toast;
    s += `<g opacity="0.75" transform="translate(${X(tx)} ${Y(ty)}) scale(${f2(sc)})">` +
      `<path d="M-24,0 C-28,-70 -22,-120 0,-128 C22,-120 28,-70 24,0Z"/><ellipse cx="0" cy="-150" rx="18" ry="21"/><rect x="-16" y="-180" width="32" height="14" rx="4"/>` +
      `<path d="M14,-112 L${f2(30 + ar * 10)},${f2(-112 - ar * 70)}" stroke="#000" stroke-width="12" stroke-linecap="round"/><rect x="${f2(24 + ar * 10)}" y="${f2(-128 - ar * 72)}" width="16" height="12"/></g>`;
  }
  // a table edge with cups
  s += `<rect x="${X(20)}" y="${Y(560)}" width="${X(440)}" height="${Y(16)}" opacity="0.7"/>`;
  return `<g opacity="${f2(fade)}">${s}</g>`;
}
/** Lantern boat's shadow crossing the paper: x = boat centre in window-local px. */
export function lanternBoatShadow(x, { w = 480 } = {}) {
  const k = w / 480, X = (v) => f2(v * k);
  const y = 470;
  let s = `<g transform="translate(${X(x)} 0)">`;
  s += `<path d="M${X(-170)},${X(y)} C${X(-120)},${X(y + 40)} ${X(120)},${X(y + 40)} ${X(190)},${X(y - 6)} L${X(170)},${X(y + 10)} C${X(100)},${X(y + 24)} ${X(-110)},${X(y + 24)} ${X(-170)},${X(y)}Z"/>`; // hull
  s += `<path d="M${X(-80)},${X(y + 4)} L${X(-80)},${X(y - 70)} C${X(-40)},${X(y - 92)} ${X(40)},${X(y - 92)} ${X(80)},${X(y - 70)} L${X(80)},${X(y + 4)}Z"/>`; // cabin
  s += `<rect x="${X(-6)}" y="${X(y - 210)}" width="${X(8)}" height="${X(150)}"/>`; // mast
  for (const lx of [-120, 110, 0]) s += `<line x1="${X(lx)}" y1="${X(lx === 0 ? y - 190 : y - 70)}" x2="${X(lx)}" y2="${X(lx === 0 ? y - 160 : y - 40)}" stroke="#000" stroke-width="${X(2)}"/><ellipse cx="${X(lx)}" cy="${X(lx === 0 ? y - 146 : y - 26)}" rx="${X(13)}" ry="${X(16)}"/>`;
  s += `</g>`;
  return s;
}
