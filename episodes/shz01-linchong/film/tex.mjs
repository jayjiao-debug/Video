// Painted-background texture and detail helpers for the 林冲 film.
// Textures are generated at render time by tools/make_textures.py into /dev/shm/shz01/film/assets (render.mjs does it).
// Everything here is deterministic (seeded) and meant for STATIC layers inside bake(): render once, reuse every frame.
//
// Usage in a take (inside the SVG you pass to bake()):
//   import { tex, planks, woodGrain, plasterWall, stoneSlabs, tileRows, dirt, lightGrad, edgeWear, cracks, stains,
//            patina, fabricFolds } from '../tex.mjs';
//   s += planks(0, 0, 2400, 1500, 9, { dir: 'h', cols: ['#5A3E2B', '#523826'] });      // a whole plank table/floor
//   s += plasterWall(0, 0, 2400, 1000, { base: '#4A3F37', skirt: 90 });                  // wall with stains + cracks
//   s += tex('stone', { rect: [x, y, w, h] }, { op: 0.45 });                              // texture over a flat fill
//   s += tex('tiles', { d: roofPath }, { op: 0.4, scale: 0.6 });                          // texture clipped to a path
//   s += edgeWear([[x0, y0], [x1, y1]], { seed: 3 });                                     // chipped, highlighted top edge
//   s += lightGrad(0, 0, 2400, 1500, { key: [700, 300], warm: '#FFE2B0', cool: '#26324A' });
// Trying detail on an existing take without editing it: register a decorator in lib.BAKE_HOOKS[bakeName] that returns
// {inner, defs} for that bake (same coordinates as the take), and render with --hooks=<module> (see tex_demo/hooks.mjs).
// Keep texture contrast low (op 0.3–0.55) behind faces and in the subtitle band (y 820–960); characters stay sharpest.
import { ASSET, furl, rng, f2, noise1, fbm1 } from './lib.mjs';

export const TEX_FILES = {
  wood: 'tex_wood.png', plaster: 'tex_plaster.png', stone: 'tex_stone.png', fabric: 'tex_fabric.png', snow: 'tex_snow.png',
  iron: 'tex_iron.png', tiles: 'tex_tiles.png', wash: 'tex_wash.png', canvas: 'tex_canvas.png', paper: 'paper.png',
};
let UID = 0;
const uid = (p) => `${p}${(UID++).toString(36)}`;
const clipOf = (shape) => (shape.d ? `<path d="${shape.d}"${shape.rule ? ` clip-rule="${shape.rule}"` : ''}/>` : `<rect x="${f2(shape.rect[0])}" y="${f2(shape.rect[1])}" width="${f2(shape.rect[2])}" height="${f2(shape.rect[3])}"/>`);
const bboxOf = (shape) => shape.bbox || shape.rect || [-4000, -4000, 12000, 12000];

/**
 * A texture laid over whatever is already drawn, clipped to a shape.
 * shape: {rect:[x,y,w,h]} | {d:'path', bbox?:[x,y,w,h], rule?:'evenodd'} (evenodd: a rect minus a hole, e.g. a table minus its cloth)
 * Don't wrap the result in another clip-path/filter group: that isolates it and the blend paints flat grey. Clip with shape.
 * o: {op 0.45, scale 1, rot 0 (deg), mode 'overlay'|'soft-light'|'multiply'|'screen', ox, oy}
 */
export function tex(name, shape, o = {}) {
  const id = uid('tx'), sz = 1024 * (o.scale ?? 1);
  const tf = o.rot ? ` patternTransform="rotate(${f2(o.rot)})"` : '';
  const [bx, by, bw, bh] = bboxOf(shape);
  return `<defs><pattern id="${id}p" patternUnits="userSpaceOnUse" x="${f2(o.ox || 0)}" y="${f2(o.oy || 0)}" width="${f2(sz)}" height="${f2(sz)}"${tf}>` +
    `<image href="${furl(ASSET + '/' + TEX_FILES[name])}" width="${f2(sz)}" height="${f2(sz)}"/></pattern><clipPath id="${id}c">${clipOf(shape)}</clipPath></defs>` +
    // the blend mode sits on the clipped group itself: a clip-path group is an isolated stacking context, so a blend
    // mode on its child would only see the group's empty backdrop and paint flat grey
    `<g clip-path="url(#${id}c)" style="mix-blend-mode:${o.mode || 'overlay'}" opacity="${f2(o.op ?? 0.45)}"><rect x="${f2(bx)}" y="${f2(by)}" width="${f2(bw)}" height="${f2(bh)}" fill="url(#${id}p)"/></g>`;
}

/** Wood grain lines inside a rect (dir 'h' grain runs along x, 'v' along y), with optional knots. */
export function woodGrain(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 7), id = uid('wg');
  const along = o.dir === 'v' ? h : w, across = o.dir === 'v' ? w : h;
  const n = Math.max(3, Math.round(across / (o.spacing ?? 9)));
  const dark = o.dark || '#1E140D', light = o.light || '#FFE7C4';
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (i + 0.5 + (R() - 0.5) * 0.6) * (across / n), seed = R() * 100, amp = 1.5 + R() * across * 0.02;
    const pts = [];
    for (let k = 0; k <= 24; k++) {
      const t = (k / 24) * along;
      pts.push([t, a + noise1(t / (90 + R() * 40), seed) * amp + Math.sin(t / 210 + seed) * amp * 0.5]);
    }
    const d = 'M' + pts.map(([p, q]) => (o.dir === 'v' ? `${f2(x + q)},${f2(y + p)}` : `${f2(x + p)},${f2(y + q)}`)).join(' L');
    const isLight = R() < 0.22;
    s += `<path d="${d}" stroke="${isLight ? light : dark}" stroke-width="${f2(isLight ? 1 + R() : 0.8 + R() * 1.8)}" fill="none" opacity="${f2(isLight ? 0.10 + R() * 0.08 : 0.12 + R() * 0.22)}" stroke-linecap="round"/>`;
  }
  const knots = o.knots ?? (R() < 0.5 ? 1 : 0);
  for (let k = 0; k < knots; k++) {
    const kp = R() * along, kq = across * (0.25 + R() * 0.5), kx = o.dir === 'v' ? x + kq : x + kp, ky = o.dir === 'v' ? y + kp : y + kq;
    const rx = across * 0.10 + R() * across * 0.08, ry = rx * 0.45;
    const rot = o.dir === 'v' ? 90 : 0;
    s += `<g transform="translate(${f2(kx)} ${f2(ky)}) rotate(${rot})">` +
      `<ellipse rx="${f2(rx)}" ry="${f2(ry)}" fill="${dark}" opacity="0.28"/>` +
      `<ellipse rx="${f2(rx * 1.8)}" ry="${f2(ry * 1.7)}" fill="none" stroke="${dark}" stroke-width="1.2" opacity="0.2"/>` +
      `<ellipse rx="${f2(rx * 2.6)}" ry="${f2(ry * 2.3)}" fill="none" stroke="${dark}" stroke-width="1" opacity="0.12"/>` +
      `<ellipse cx="${f2(-rx * 0.2)}" cy="${f2(-ry * 0.25)}" rx="${f2(rx * 0.4)}" ry="${f2(ry * 0.3)}" fill="${light}" opacity="0.15"/></g>`;
  }
  return `<defs><clipPath id="${id}"><rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}"/></clipPath></defs><g clip-path="url(#${id})">${s}</g>`;
}

/** A field of n planks with tone variation, seams (dark gap + light lip), butt joints, grain, knots and nails. */
export function planks(x, y, w, h, n, o = {}) {
  const R = rng(o.seed ?? 11), cols = o.cols || ['#5A3E2B', '#523826', '#5E412D'];
  const vert = o.dir === 'v', size = (vert ? w : h) / n;
  let s = '';
  for (let i = 0; i < n; i++) {
    const px = vert ? x + i * size : x, py = vert ? y : y + i * size, pw = vert ? size : w, ph = vert ? h : size;
    if (!o.keepBase) s += `<rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" fill="${cols[i % cols.length]}"/>`;
    s += woodGrain(px, py, pw, ph, { dir: vert ? 'v' : 'h', seed: (o.seed ?? 11) * 31 + i, knots: R() < 0.45 ? 1 : 0, spacing: o.spacing });
    // butt joints along long planks
    const len = vert ? ph : pw;
    for (let j = 1; j < 3; j++) {
      if (R() < 0.5) continue;
      const at = len * (j / 3 + (R() - 0.5) * 0.15);
      s += vert ? `<rect x="${f2(px)}" y="${f2(py + at)}" width="${f2(pw)}" height="3" fill="#1A120C" opacity="0.55"/>` : `<rect x="${f2(px + at)}" y="${f2(py)}" width="3" height="${f2(ph)}" fill="#1A120C" opacity="0.55"/>`;
      if (o.nails !== false) {
        const nx = vert ? px + pw * 0.3 : px + at + 9, ny = vert ? py + at + 9 : py + ph * 0.3;
        s += `<circle cx="${f2(nx)}" cy="${f2(ny)}" r="2.6" fill="#1C1611" opacity="0.6"/><circle cx="${f2(vert ? nx + pw * 0.4 : nx)}" cy="${f2(vert ? ny : ny + ph * 0.4)}" r="2.6" fill="#1C1611" opacity="0.6"/>`;
      }
    }
    // seam: dark gap on one side, a light lip on the other
    s += vert ? `<rect x="${f2(px + pw - 3)}" y="${f2(py)}" width="3" height="${f2(ph)}" fill="#160F0A" opacity="0.7"/><rect x="${f2(px)}" y="${f2(py)}" width="1.5" height="${f2(ph)}" fill="#FFE2B8" opacity="0.12"/>`
      : `<rect x="${f2(px)}" y="${f2(py + ph - 3)}" width="${f2(pw)}" height="3" fill="#160F0A" opacity="0.7"/><rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="1.5" fill="#FFE2B8" opacity="0.12"/>`;
  }
  s += tex('wood', { rect: [x, y, w, h] }, { op: o.texOp ?? 0.42, rot: vert ? 90 : 0, scale: o.texScale ?? 0.8 });
  return s;
}

/** Soft stains (water marks, soot), darker toward the bottom by default. o: {seed, n 8, blur 18, low (false = anywhere), col, op 1 (opacity multiplier)}. Blob size scales with w, so pass op/n down for very wide layers. */
export function stains(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 21), id = uid('st'), n = o.n ?? 8;
  let s = `<defs><filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${f2(o.blur ?? 18)}"/></filter></defs><g filter="url(#${id})" style="mix-blend-mode:multiply">`;
  for (let i = 0; i < n; i++) {
    const cx = x + R() * w, cy = y + h * (o.low === false ? R() : 0.35 + 0.65 * Math.sqrt(R())), rx = w * (0.03 + R() * 0.08), ry = rx * (0.6 + R() * 0.9);
    s += `<ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${f2(rx)}" ry="${f2(ry)}" fill="${o.col || '#5A4636'}" opacity="${f2((0.12 + R() * 0.18) * (o.op ?? 1))}"/>`;
  }
  return s + '</g>';
}

/** Branching hairline cracks with a light lower lip. */
export function cracks(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 31), n = o.n ?? 4;
  let s = '';
  const branch = (px, py, ang, len, depth) => {
    let d = `M${f2(px)},${f2(py)}`, cx = px, cy = py;
    const steps = 6 + Math.floor(R() * 5);
    for (let k = 0; k < steps; k++) {
      ang += (R() - 0.5) * 0.9;
      cx += Math.cos(ang) * (len / steps); cy += Math.sin(ang) * (len / steps);
      d += ` L${f2(cx)},${f2(cy)}`;
      if (depth < 2 && R() < 0.18) branch(cx, cy, ang + (R() < 0.5 ? 0.9 : -0.9), len * 0.45, depth + 1);
    }
    s += `<path d="${d}" stroke="${o.col || '#241A13'}" stroke-width="${f2(depth ? 0.9 : 1.6)}" fill="none" opacity="${f2(depth ? 0.35 : 0.5)}" stroke-linejoin="round"/>`;
    s += `<path d="${d}" transform="translate(1 1.6)" stroke="#FFF1DA" stroke-width="0.8" fill="none" opacity="0.12"/>`;
  };
  for (let i = 0; i < n; i++) branch(x + R() * w, y + R() * h, Math.PI * (0.3 + R() * 0.4), (o.len ?? 140) * (0.6 + R() * 0.8), 0);
  return s;
}

/** Grime: a darkening gradient toward the bottom plus speckles (multiply). */
export function dirt(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 41), id = uid('dt');
  let s = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="${f2(o.from ?? 0.55)}" stop-color="${o.col || '#3A2A1E'}" stop-opacity="0"/><stop offset="1" stop-color="${o.col || '#3A2A1E'}" stop-opacity="${f2(o.op ?? 0.45)}"/></linearGradient></defs>`;
  s += `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="url(#${id})" style="mix-blend-mode:multiply"/>`;
  for (let i = 0; i < (o.specks ?? 60); i++) s += `<circle cx="${f2(x + R() * w)}" cy="${f2(y + h * (0.5 + 0.5 * R()))}" r="${f2(0.8 + R() * 2.2)}" fill="${o.col || '#3A2A1E'}" opacity="${f2(0.15 + R() * 0.25)}"/>`;
  return s;
}

/** Lime-plaster wall: base fill, plaster texture, stains, cracks, a darker skirting with a damp line, grime. */
export function plasterWall(x, y, w, h, o = {}) {
  let s = o.keepBase ? '' : `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${o.base || '#A89C88'}"/>`;
  s += tex('plaster', { rect: [x, y, w, h] }, { op: o.texOp ?? 0.55, scale: o.texScale ?? 1 });
  s += stains(x, y, w, h, { seed: o.seed ?? 21, n: o.stains ?? 9, col: o.stainCol, blur: o.stainBlur });
  s += cracks(x, y, w, h * 0.85, { seed: (o.seed ?? 21) + 5, n: o.cracks ?? 4, len: o.crackLen ?? Math.min(w, h) * 0.18 });
  if (o.skirt) {
    const sy = y + h - o.skirt;
    s += `<rect x="${f2(x)}" y="${f2(sy)}" width="${f2(w)}" height="${f2(o.skirt)}" fill="${o.skirtCol || '#2A221D'}" opacity="0.5"/>` +
      `<path d="M${f2(x)},${f2(sy - 6)} ${Array.from({ length: 30 }, (_, i) => `L${f2(x + (i / 29) * w)},${f2(sy - 10 - Math.abs(noise1(i * 0.7, 3)) * 26)}`).join(' ')}" stroke="#2E241D" stroke-width="2" fill="none" opacity="0.25"/>`;
  }
  s += dirt(x, y, w, h, { seed: (o.seed ?? 21) + 9, op: o.dirtOp ?? 0.35, specks: 40 });
  return s;
}

/**
 * Stone slabs / paving in a rect: irregular joints, per-slab tone, chipped corners, top-edge light, stone texture.
 * o: {rows, cols, base, seed, joint, persp (0..1: rows grow toward the bottom)}
 */
export function stoneSlabs(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 51), rows = o.rows ?? 4, cols = o.cols ?? 6, base = o.base || '#BDB2A0', joint = o.joint || '#857A69';
  let s = o.keepBase ? '' : `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="${base}"/>`;
  // row heights (perspective: growing toward the camera)
  const hs = []; let tot = 0;
  for (let r = 0; r < rows; r++) { const v = Math.pow(1 + (o.persp ?? 0), r); hs.push(v); tot += v; }
  let cy = y;
  for (let r = 0; r < rows; r++) {
    const rh = (hs[r] / tot) * h, off = (r % 2) * 0.5;
    for (let c = -1; c < cols + 1; c++) {
      const sx = x + ((c + off + (R() - 0.5) * 0.15) * w) / cols, sw = (w / cols) * (0.92 + R() * 0.16);
      const tone = R();
      s += `<rect x="${f2(sx)}" y="${f2(cy)}" width="${f2(sw)}" height="${f2(rh)}" fill="${tone < 0.5 ? '#FFF6E6' : '#2E261C'}" opacity="${f2(0.04 + R() * 0.08)}"/>`;
      s += `<rect x="${f2(sx)}" y="${f2(cy)}" width="${f2(sw)}" height="${f2(Math.max(1.5, rh * 0.04))}" fill="#FFF6E6" opacity="0.18"/>`;
      s += `<rect x="${f2(sx)}" y="${f2(cy)}" width="2.2" height="${f2(rh)}" fill="${joint}" opacity="0.6"/>`;
      if (R() < 0.35) { // a chipped corner
        const ccx = sx + (R() < 0.5 ? 4 : sw - 4), ccy = cy + (R() < 0.5 ? 4 : rh - 4), k = 4 + R() * 9;
        s += `<path d="M${f2(ccx)},${f2(ccy)} l${f2(k)},${f2(k * 0.3)} l${f2(-k * 0.5)},${f2(k * 0.8)}Z" fill="${joint}" opacity="0.55"/>`;
      }
    }
    s += `<rect x="${f2(x)}" y="${f2(cy + rh - 2.4)}" width="${f2(w)}" height="2.4" fill="${joint}" opacity="0.65"/>`;
    cy += rh;
  }
  s += tex('stone', { rect: [x, y, w, h] }, { op: o.texOp ?? 0.5, scale: o.texScale ?? 0.7 });
  s += stains(x, y, w, h, { seed: (o.seed ?? 51) + 3, n: o.stains ?? 5, low: false, col: '#6E6250', blur: 24 });
  return s;
}

/** Roof tile rows inside a path (or rect): tile ridges + the tiles texture. */
export function tileRows(shape, o = {}) {
  const id = uid('tr'), [bx, by, bw, bh] = bboxOf(shape), step = o.step ?? 26, col = o.col || '#2E363D';
  let s = `<defs><clipPath id="${id}">${clipOf(shape)}</clipPath></defs><g clip-path="url(#${id})">`;
  for (let xx = bx; xx < bx + bw; xx += step) s += `<rect x="${f2(xx)}" y="${f2(by)}" width="${f2(step * 0.28)}" height="${f2(bh)}" fill="${col}" opacity="0.35"/><rect x="${f2(xx + step * 0.3)}" y="${f2(by)}" width="2" height="${f2(bh)}" fill="#C9D2D8" opacity="0.12"/>`;
  s += '</g>';
  return s + tex('tiles', shape, { op: o.texOp ?? 0.35, scale: o.texScale ?? 0.5 });
}

/** Bronze/iron patina inside a path: rust/verdigris mottling + a few bright wear spots. */
export function patina(shape, o = {}) {
  const id = uid('pt'), R = rng(o.seed ?? 61), [bx, by, bw, bh] = bboxOf(shape);
  let s = tex('iron', shape, { op: o.op ?? 0.4, scale: o.scale ?? 0.35, mode: 'overlay' });
  s += `<defs><clipPath id="${id}">${clipOf(shape)}</clipPath><filter id="${id}b"><feGaussianBlur stdDeviation="4"/></filter></defs><g clip-path="url(#${id})"><g filter="url(#${id}b)">`;
  for (let i = 0; i < (o.n ?? 14); i++) s += `<ellipse cx="${f2(bx + R() * bw)}" cy="${f2(by + R() * bh)}" rx="${f2(6 + R() * 18)}" ry="${f2(4 + R() * 10)}" fill="${o.green || '#6E9A7E'}" opacity="${f2(0.2 + R() * 0.25)}"/>`;
  s += `</g>`;
  for (let i = 0; i < (o.wear ?? 8); i++) s += `<path d="M${f2(bx + R() * bw)},${f2(by + R() * bh)} q${f2(6 + R() * 12)},${f2(-3 - R() * 4)} ${f2(14 + R() * 18)},0" stroke="#D9C89A" stroke-width="2" fill="none" opacity="${f2(0.25 + R() * 0.25)}" stroke-linecap="round"/>`;
  return s + '</g>';
}

/** A worn edge: highlight along the edge + small dark chips. edge = [[x0,y0],[x1,y1]] (top edge, light from above). */
export function edgeWear(edge, o = {}) {
  const R = rng(o.seed ?? 71), [[x0, y0], [x1, y1]] = edge, len = Math.hypot(x1 - x0, y1 - y0);
  const ux = (x1 - x0) / len, uy = (y1 - y0) / len;
  let s = `<path d="M${f2(x0)},${f2(y0 + 1.5)} L${f2(x1)},${f2(y1 + 1.5)}" stroke="${o.light || '#FFEFD2'}" stroke-width="${f2(o.w ?? 2)}" opacity="${f2(o.lop ?? 0.35)}" stroke-linecap="round"/>`;
  const n = Math.round(len / (o.every ?? 60));
  for (let i = 0; i < n; i++) {
    const t = R() * len, k = 3 + R() * 7, px = x0 + ux * t, py = y0 + uy * t;
    s += `<path d="M${f2(px)},${f2(py)} l${f2(ux * k)},${f2(uy * k)} l${f2(-ux * k * 0.4 - uy * k * 0.6)},${f2(-uy * k * 0.4 + ux * k * 0.6)}Z" fill="${o.dark || '#1E1610'}" opacity="${f2(0.4 + R() * 0.3)}"/>`;
  }
  return s;
}

/** Fold strokes for cloth (a hanging cloth / curtain in a rect): soft vertical folds with light and dark sides. */
/* o: {seed, n, dark, light, clip (path d of the cloth), texOp 0.3, texScale 0.6} */
export function fabricFolds(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 81), n = o.n ?? Math.max(3, Math.round(w / 60)), id = uid('ff');
  let s = o.clip ? `<defs><clipPath id="${id}"><path d="${o.clip}"/></clipPath></defs><g clip-path="url(#${id})">` : '';
  for (let i = 0; i < n; i++) {
    const fx = x + ((i + 0.5 + (R() - 0.5) * 0.4) * w) / n, sw = (w / n) * 0.35, sway = (R() - 0.5) * sw;
    s += `<path d="M${f2(fx)},${f2(y + h * 0.05)} C${f2(fx + sway)},${f2(y + h * 0.4)} ${f2(fx - sway)},${f2(y + h * 0.7)} ${f2(fx + sway * 0.5)},${f2(y + h)}" stroke="${o.dark || '#1A1010'}" stroke-width="${f2(sw * 0.5)}" fill="none" opacity="0.18" stroke-linecap="round"/>`;
    s += `<path d="M${f2(fx + sw * 0.45)},${f2(y + h * 0.08)} C${f2(fx + sw * 0.45 + sway)},${f2(y + h * 0.4)} ${f2(fx + sw * 0.45 - sway)},${f2(y + h * 0.7)} ${f2(fx + sw * 0.45 + sway * 0.5)},${f2(y + h)}" stroke="${o.light || '#FFE9D0'}" stroke-width="${f2(sw * 0.2)}" fill="none" opacity="0.07" stroke-linecap="round"/>`;
  }
  if (o.clip) s += '</g>';
  return s + tex('fabric', o.clip ? { d: o.clip, bbox: [x, y, w, h] } : { rect: [x, y, w, h] }, { op: o.texOp ?? 0.3, scale: o.texScale ?? 0.6 });
}

/** Motivated light: a warm key pool (screen) and a cool shadow falloff (multiply) over a rect. */
export function lightGrad(x, y, w, h, o = {}) {
  const id = uid('lg'), [kx, ky] = o.key || [x + w * 0.3, y + h * 0.3];
  const r = o.r ?? Math.max(w, h) * 0.6;
  return `<defs><radialGradient id="${id}k" gradientUnits="userSpaceOnUse" cx="${f2(kx)}" cy="${f2(ky)}" r="${f2(r)}"><stop offset="0" stop-color="${o.warm || '#FFE2B0'}" stop-opacity="${f2(o.warmOp ?? 0.35)}"/><stop offset="1" stop-color="${o.warm || '#FFE2B0'}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${id}c" gradientUnits="userSpaceOnUse" cx="${f2(kx)}" cy="${f2(ky)}" r="${f2(r * 1.6)}"><stop offset="0.35" stop-color="${o.cool || '#26324A'}" stop-opacity="0"/><stop offset="1" stop-color="${o.cool || '#26324A'}" stop-opacity="${f2(o.coolOp ?? 0.35)}"/></radialGradient></defs>` +
    `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="url(#${id}k)" style="mix-blend-mode:screen"/>` +
    `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" fill="url(#${id}c)" style="mix-blend-mode:multiply"/>`;
}

/** Scattered straw / debris strands on a floor band. */
export function straw(x, y, w, h, o = {}) {
  const R = rng(o.seed ?? 91);
  let s = '';
  for (let i = 0; i < (o.n ?? 80); i++) {
    const px = x + R() * w, py = y + R() * h, a = (R() - 0.5) * 2.6, l = 10 + R() * (o.len ?? 34);
    s += `<path d="M${f2(px)},${f2(py)} l${f2(Math.cos(a) * l)},${f2(Math.sin(a) * l * 0.35)}" stroke="${R() < 0.5 ? '#8A7552' : '#6A5A3E'}" stroke-width="${f2(1.2 + R() * 1.6)}" stroke-linecap="round" opacity="${f2(0.4 + R() * 0.4)}"/>`;
  }
  return s;
}
