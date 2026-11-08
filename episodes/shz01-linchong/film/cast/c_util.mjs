// Builder C helpers (T05–T07): traced secondary figures, recolouring, silhouette masks, rig part surgery.
import fs from 'fs';
import { f2 } from '../lib.mjs';

const CACHE = {};
export function traced(name) {
  if (!CACHE[name]) CACHE[name] = JSON.parse(fs.readFileSync(new URL(`./data/${name}.json`, import.meta.url), 'utf8'));
  return CACHE[name];
}
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const tohex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function hsl(c) {
  const [r, g, b] = hex(c).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  let h = 0, s = 0;
  if (mx !== mn) {
    const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
  }
  return [h, s, l];
}
/** Recolour a palette colour: fn(hex, [h,s,l]) -> hex|null. */
export function recolourPaths(paths, fn) { return paths.map(([c, d]) => [fn(c, hsl(c)) || c, d]); }
export const mulHex = (c, k) => tohex(hex(c).map((v) => v * k));
export const mixHex = (a, b, k) => { const A = hex(a), B = hex(b); return tohex(A.map((v, i) => v + (B[i] - v) * k)); };
/** Apply a uniform grade to a hex colour: multiply by tint and lift toward haze. */
export function grade(c, { tint = null, k = 1, haze = null, hk = 0, sat = 1 } = {}) {
  let r = hex(c);
  if (sat !== 1) { const L = 0.3 * r[0] + 0.59 * r[1] + 0.11 * r[2]; r = r.map((v) => L + (v - L) * sat); }
  if (tint) { const T = hex(tint); r = r.map((v, i) => (v * T[i]) / 255); }
  r = r.map((v) => v * k);
  if (haze) { const Hh = hex(haze); r = r.map((v, i) => v + (Hh[i] - v) * hk); }
  return tohex(r);
}

/** <g> of traced paths, placed so that the figure's sole is at (x, y) and its top-to-sole is h px. */
export function tracedG(name, o = {}) {
  const D = traced(name);
  const k = (o.h || 600) / (D.sole - D.top);
  const cx = o.cx ?? D.cx;
  const paths = o.recol ? recolourPaths(D.paths, o.recol) : D.paths;
  const sx = o.flip ? -k : k;
  const inner = paths.map(([c, d]) => `<path d="${d}" fill="${o.mono || c}"/>`).join('') + (o.extra || '');
  const rot = o.rot ? ` rotate(${f2(o.rot)} ${f2(o.rotAt ? o.rotAt[0] : cx)} ${f2(o.rotAt ? o.rotAt[1] : D.sole)})` : '';
  return `<g transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) scale(${f2(sx * 10000) / 10000} ${f2(k * 10000) / 10000}) translate(${f2(-cx)} ${f2(-D.sole)})${rot}"${o.clip ? ` clip-path="url(#${o.clip})"` : ''}>${inner}</g>`;
}
/** Matrix mapping source px of a traced figure to the screen (same placement as tracedG). */
export function tracedMap(name, o = {}) {
  const D = traced(name);
  const k = (o.h || 600) / (D.sole - D.top), cx = o.cx ?? D.cx, sx = o.flip ? -k : k;
  return (p) => [(o.x || 0) + (p[0] - cx) * sx, (o.y || 0) + (p[1] - D.sole) * k];
}

/** A <mask> whose white area is the silhouette of `inner` (any SVG). */
export function silMask(id, inner) {
  return `<filter id="${id}w" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>` +
    `<mask id="${id}" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="12000" height="12000"><g filter="url(#${id}w)">${inner}</g></mask>`;
}

/** Remove balanced <g data-part="NAME" …>…</g> groups from a rig SVG string. */
export function dropParts(svg, names) {
  for (const n of names) {
    let i;
    while ((i = svg.indexOf(`<g data-part="${n}"`)) >= 0) {
      let depth = 0, j = i;
      const re = /<g[\s>]|<\/g>/g;
      re.lastIndex = i;
      let m;
      while ((m = re.exec(svg))) {
        if (m[0] === '</g>') { depth--; if (depth === 0) { j = re.lastIndex; break; } } else depth++;
      }
      svg = svg.slice(0, i) + svg.slice(j);
    }
  }
  return svg;
}

const RIGDATA = {};
/** Rig rest data (meta, parts) for a view/costume. */
export function rigData(view, costume) {
  const k = `${costume}_${view}`;
  if (!RIGDATA[k]) RIGDATA[k] = JSON.parse(fs.readFileSync(new URL(`../../chars/rig/data/lc_${k}.json`, import.meta.url), 'utf8'));
  return RIGDATA[k];
}
/** Screen position of a rest-pose point of the rig (data coords) for lin() options {x, y, height, flip}. */
export function rigPoint(view, costume, o, p) {
  const D = rigData(view, costume), M = D.meta;
  const Href = (M.sole - M.chin[1]) / 6.5, k = (o.height || 680) / 7.5 / Href;
  const sx = o.flip ? -k : k;
  return [(o.x || 0) + (p[0] - M.origin_x) * sx, (o.y || 0) + (p[1] - M.sole) * k];
}
export function rigScale(view, costume, height) {
  const M = rigData(view, costume).meta;
  return height / 7.5 / ((M.sole - M.chin[1]) / 6.5);
}
