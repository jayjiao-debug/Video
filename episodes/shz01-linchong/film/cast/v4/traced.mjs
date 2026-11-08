// v4 side cast — traced the same way as the 林冲 rig, so every character shares 林冲's look.
//
// Pipeline (film/cast/v4/build): Z-Image-Turbo reference in 林冲's prompt template (art_log.md) ->
// trace_cast.py (chars/rig/build/tracelib.py: k-means palette, mode filter, vtracer fills) with the painted
// eyes / brows / moustache inpainted -> data/<name>.json (source px of the 864x1536 reference).
// The face is drawn in code with 林冲's face construction (face.mjs) at the anchors measured on the reference.
//
// render(name, P, opts) -> '<g>…</g>', feet (ground point) at (x, y), y down.
//   opts.height  px for this character's stature (skull top to sole), default stature_m * 680 / 1.8 (the rig's FS scale)
//   opts.flip    mirror. 3/4 ('side') views face LEFT by default like the rig's side views; flip faces right.
//   opts.expr    { brow, eye, look, mouth, open, tear, jaw } as in the rig (NE / EX)
//   opts.pose    { headTilt deg, headTurn -0.3..0.3 (features slide) }  — head pivot at the neck
//   opts.col     { robe: '#hex', ... } recolour families defined per character (P.fam)
// Proportions: references come out with heads 11–39 % larger than 林冲's; the head group is scaled about the
// neck (s ≥ 0.84) and the lower legs are lengthened (knee → ankle, feet unscaled) to reach P.heads (7.5 for men,
// 7.0 for 张教头 and 娘子), measured with 林冲's own ratio (eye line → chin = 0.443 head).
import fs from 'fs';
import { faceFront, anchors } from './face.mjs';
import { NE } from '../../../chars/rig/linchong.mjs';

const DIR = new URL('./data/', import.meta.url);
const CACHE = {};
export function data(name) {
  if (!CACHE[name]) CACHE[name] = JSON.parse(fs.readFileSync(new URL(`${name}.json`, DIR), 'utf8'));
  return CACHE[name];
}
const f = (n) => (Math.round(n * 100) / 100).toString();
let UID = 0;
const uid = (s) => `cv${s}${(UID++).toString(36)}`;

const hex2rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const rgb2hex = (r) => '#' + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
function hsl(c) {
  const [r, g, b] = hex2rgb(c).map((v) => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, sl = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, sl, l];
}
const lum = (c) => { const [r, g, b] = hex2rgb(c); return 0.299 * r + 0.587 * g + 0.114 * b + 1; };
const shade = (c, k) => rgb2hex(hex2rgb(c).map((v, i) => v * k[i]));

/** recolour map for opts.col: every traced colour in a family keeps its luminance ratio to the family base */
function recolourMap(D, fam, col) {
  const map = {};
  if (!col) return map;
  for (const [name, target] of Object.entries(col)) {
    const test = fam && fam[name];
    if (!test) continue;
    const members = {};
    for (const [c, d] of D.paths) { const h = hsl(c); if (test(...h)) members[c] = (members[c] || 0) + d.length; }
    const keys = Object.keys(members);
    if (!keys.length) continue;
    const base = (fam.base && fam.base[name]) || keys.reduce((a, b) => (members[b] > members[a] ? b : a));
    const T = hex2rgb(target), lb = lum(base);
    for (const c of keys) { const r = lum(c) / lb; map[c] = rgb2hex(T.map((v) => v * r + (r > 1 ? (255 - v) * (r - 1) * 0.15 : 0))); }
  }
  return map;
}

/** proportion fix (source px): head scale s about the neck, lower-leg stretch */
export function geometry(D, P) {
  const F = D.face, g = { ...(P.geo || {}) };
  if (F && F.eyes && g.skull == null) {
    const ey = (F.eyes[0][1] + F.eyes[1][1]) / 2, chin = F.chin[1], head = (chin - ey) / 0.443;
    g.chin = chin; g.head = head; g.skull = chin - head; g.px = F.chin[0];
  }
  const N = P.heads || 7.5, h = g.head, b = D.sole - g.chin;
  g.s = g.s ?? Math.max(0.84, Math.min(1, (b * 1.13) / ((N - 1) * h)));
  g.cut = g.chin + 0.07 * h;                                       // neck cut, just under the jaw
  const want0 = (N - 1) * h * g.s;                                 // wanted chin → sole length
  g.knee = g.knee ?? D.top + (D.sole - D.top) * 0.58;            // below the hanging hands
  g.ankle = g.ankle ?? D.sole - (D.sole - D.top) * 0.045;
  { const yA = g.chin - 0.05 * h, yB = g.cut + 0.25 * h, rr = Math.pow(g.s, 0.1); let sm = 0; for (let m = 1; m <= 10; m++) sm += Math.pow(rr, m);
    const chinToSole = (yB - yA) / 10 * sm - (g.chin - yA) * g.s + (D.sole - yB);
    g.sy = 1 + Math.max(0, want0 - chinToSole) / (g.ankle - g.knee); }
  const y0 = g.chin - 0.05 * h, yN = g.cut + 0.25 * h, NB = 10, r = Math.pow(g.s, 1 / NB);
  let sum = 0; for (let m = 1; m <= NB; m++) sum += Math.pow(r, m);
  g.y0S = yN - ((yN - y0) / NB) * sum;                             // top of the graded neck after the joints
  g.skullS = g.y0S - (y0 - g.skull) * g.s;                         // skull top after the head scale
  g.chinS = g.y0S + (g.chin - y0) * g.s;
  g.soleS = D.sole + (g.sy - 1) * (g.ankle - g.knee);
  return g;
}

export function render(name, P, o = {}) {
  const D = data(name), g = geometry(D, P);
  const stature = o.height ?? (P.stature * 680) / 1.8;
  const k = stature / (g.soleS - g.skullS);
  const facing = D.face ? D.face.facing : 0;
  const mx = (facing > 0 ? -1 : 1) * (o.flip ? -1 : 1);   // 3/4 data facing right is mirrored to face left by default
  const cx = g.px ?? D.cx;
  const id = uid(name.replace(/_.*/, ''));
  const rmap = recolourMap(D, P.fam, { ...(P.col || {}), ...(o.col || {}) });
  // figure fills (+ optional colour split, e.g. the 水火棍 half red / half black)
  let fig = '';
  for (const [c, d] of D.paths) fig += `<path d="${d}" fill="${rmap[c] || c}"/>`;
  let split = '';
  if (P.split) {
    const S = P.split; let s2 = '';
    for (const [c, d] of D.paths) {
      const h = hsl(c);
      if (!S.test(...h)) continue;
      const xs = d.match(/-?\d+\.?\d*/g).filter((_, i) => i % 2 === 0).map(Number);
      if (Math.max(...xs) > S.xMax) continue;
      s2 += `<path d="${d}" fill="${shade(S.col, [1, 1, 1].map(() => Math.min(1.25, lum(c) / lum(S.ref))))}"/>`;
    }
    split = `<clipPath id="${id}ss"><rect x="-50" y="${f(S.yMid)}" width="${D.w + 100}" height="${D.h}"/></clipPath><g clip-path="url(#${id}ss)">${s2}</g>`;
  }
  // face
  let face = '', faceRect = '';
  if (D.face && D.face.eyes && !P.noFace) {
    const pose = o.pose || {};
    const turn = (D.face.turn ?? (facing * 0.55)) + (pose.headTurn || 0) * (facing === 0 ? 1 : 0.5);
    const A = anchors(D.face.eyes, D.face.mouth, D.face.chin, turn);
    const E = { ...NE, ...(P.expr || {}), ...(o.expr || {}) };
    const skin = D.face.skin;
    const col = { skin, skinS: shade(skin, [0.88, 0.85, 0.83]), skinD: shade(skin, [0.77, 0.66, 0.63]), ...(P.faceCol || {}) };
    face = faceFront(A, E, { ...(P.face || {}), turn, col });
    const x0 = A.jaw[0][0] - 6 * A.u, x1 = A.jaw[6][0] + 6 * A.u, y0 = A.browR[1][1] - 18 * A.u;
    faceRect = `<rect data-face="${name}" x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(A.chin[1] - y0)}" fill="none" stroke="none"/>`;
  }
  // bands: head (scaled + tilted through a graded neck), torso, lower legs (stretched), feet (shifted).
  // The neck is a chain of NB thin bands, each a small joint (scale s^(1/NB), tilt/NB) about its lower edge,
  // nested like a bone chain, so hair ribbons and beards that cross the neck bend smoothly instead of breaking.
  const tilt = (o.pose && o.pose.headTilt) || 0;
  const ov = 1.5, W = D.w + 400, NB = 10;
  const y0 = g.chin - 0.05 * g.head, yN = g.cut + 0.25 * g.head;
  const ys = Array.from({ length: NB + 1 }, (_, i) => y0 + ((yN - y0) * i) / NB);
  const r = Math.pow(g.s, 1 / NB), a = tilt / NB;
  // bands are cut with masks, not clip-paths: a mask applies to the composited band, so the stacked traced fills
  // do not leak through each other along the cut (clip-path antialiasing conflates every layer -> seam lines)
  const clip = (cid, ya, yb) => `<mask id="${id}${cid}" maskUnits="userSpaceOnUse" x="-400" y="${f(ya - ov - 1)}" width="${W + 400}" height="${f(yb - ya + 2 * ov + 2)}"><rect x="-200" y="${f(ya - ov)}" width="${W}" height="${f(yb - ya + 2 * ov)}" fill="#fff"/></mask>`;
  let defs = `<defs><g id="${id}f">${fig}${split}</g>` + clip('h', -200, y0) + clip('t', yN, g.knee) + clip('l', g.knee, g.ankle) + clip('a', g.ankle, D.h + 200);
  for (let j = 1; j <= NB; j++) defs += clip(`n${j}`, ys[j - 1], ys[j]);
  defs += '</defs>';
  let head = `<g mask="url(#${id}h)"><use href="#${id}f"/></g>${face}${faceRect}`;
  for (let j = 1; j <= NB; j++) {
    const J = `translate(${f(cx)} ${f(ys[j])}) rotate(${f(a)}) scale(${f(r)}) translate(${f(-cx)} ${f(-ys[j])})`;
    head = `<g transform="${J}">${head}<g mask="url(#${id}n${j})"><use href="#${id}f"/></g></g>`;
  }
  const legT = `translate(0 ${f(g.knee)}) scale(1 ${f(g.sy)}) translate(0 ${f(-g.knee)})`;
  const footT = `translate(0 ${f((g.sy - 1) * (g.ankle - g.knee))})`;
  const body =
    `<g mask="url(#${id}t)"><use href="#${id}f"/></g>` +
    `<g transform="${legT}"><g mask="url(#${id}l)"><use href="#${id}f"/></g></g>` +
    `<g transform="${footT}"><g mask="url(#${id}a)"><use href="#${id}f"/></g></g>` + head;
  const T = `translate(${f(o.x ?? 0)} ${f(o.y ?? 0)}) scale(${f(k * mx)} ${f(k)}) translate(${f(-cx)} ${f(-g.soleS)})`;
  return `<g class="cast-${name}">${defs}<g transform="${T}">${body}</g></g>`;
}

/** where the face sits after render() with the same opts (for framing / two-shot staging), in output px */
export function headBox(name, P, o = {}) {
  const D = data(name), g = geometry(D, P);
  const stature = o.height ?? (P.stature * 680) / 1.8, k = stature / (g.soleS - g.skullS);
  return { top: (o.y ?? 0) - stature, chin: (o.y ?? 0) - (g.soleS - g.chinS) * k, head: g.head * g.s * k };
}
