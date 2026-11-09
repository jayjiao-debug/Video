// Embroidery renderer for ep64: everything is stitched on a silk ground.
//  - chain(): 锁绣 chain stitch along a path (the Mawangdui technique: loops, each caught by the next)
//  - satin(): a filled shape in parallel stitches (平针), broken into stitches, with thread sheen and a raised shadow
//  - sparse(): the gauze: thin, widely spaced threads so the ground shows through
//  - ground(): a dark silk ground with a visible weave
// Paths use absolute M/L/C/Q/Z commands only.
const f2 = (v) => Math.round(v * 100) / 100;

// ---------------------------------------------------------------- path sampling
export function parse(d) {
  const t = d.match(/[MLCQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi), segs = [];
  let i = 0, cmd = '', cur = [0, 0], start = [0, 0];
  const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[MLCQZ]/i.test(t[i])) cmd = t[i++].toUpperCase();
    if (cmd === 'M') { cur = [num(), num()]; start = cur; segs.push({ m: cur }); cmd = 'L'; }
    else if (cmd === 'L') { const p = [num(), num()]; segs.push({ l: [cur, p] }); cur = p; }
    else if (cmd === 'C') { const a = [num(), num()], b = [num(), num()], p = [num(), num()]; segs.push({ c: [cur, a, b, p] }); cur = p; }
    else if (cmd === 'Q') { const a = [num(), num()], p = [num(), num()]; segs.push({ c: [cur, [cur[0] + (2 / 3) * (a[0] - cur[0]), cur[1] + (2 / 3) * (a[1] - cur[1])], [p[0] + (2 / 3) * (a[0] - p[0]), p[1] + (2 / 3) * (a[1] - p[1])], p] }); cur = p; }
    else if (cmd === 'Z') { segs.push({ l: [cur, start] }); cur = start; }
  }
  return segs;
}
// polylines (one per subpath), densely sampled
export function sample(d, step = 2) {
  const polys = []; let P = null;
  for (const s of parse(d)) {
    if (s.m) { P = [s.m]; polys.push(P); continue; }
    if (s.l) { const [a, b] = s.l, n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); for (let k = 1; k <= n; k++) P.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]); }
    if (s.c) {
      const [a, b, c, e] = s.c, est = Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1]) + Math.hypot(e[0] - c[0], e[1] - c[1]), n = Math.max(2, Math.ceil(est / step));
      for (let k = 1; k <= n; k++) { const u = k / n, v = 1 - u; P.push([v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * e[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * e[1]]); }
    }
  }
  return polys;
}
// points every `len` along a polyline
function resample(P, len) {
  const out = [P[0]]; let acc = 0;
  for (let i = 1; i < P.length; i++) {
    let a = P[i - 1]; const b = P[i]; let seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (acc + seg >= len) { const u = (len - acc) / seg; a = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; out.push(a); seg = Math.hypot(b[0] - a[0], b[1] - a[1]); acc = 0; }
    acc += seg;
  }
  return out;
}
// a tiny deterministic random
export const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// ---------------------------------------------------------------- 锁绣 chain stitch
// Each loop runs from p_i to p_{i+1}: out on one side, round at the far end, back on the other side. Drawn as thread:
// a dark under-shadow, the coloured thread, a thin light sheen along the outer curve.
export function chain(d, o = {}) {
  const len = o.len ?? 9, w = o.w ?? 5.5, col = o.color ?? '#C0432C', hi = o.hi ?? '#F2A07A', sh = o.shadow ?? '#000';
  const tw = o.thread ?? w * 0.46;
  let base = '', light = '';
  for (const P of sample(d, 1.5)) {
    const Q = resample(P, len);
    for (let i = 0; i + 1 < Q.length; i++) {
      const a = Q[i], b = Q[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      const tail = [a[0] - dx * 0.25, a[1] - dy * 0.25], end = [b[0] + dx * 0.12, b[1] + dy * 0.12];
      const L1 = [a[0] + dx * 0.55 + nx * w * 0.5, a[1] + dy * 0.55 + ny * w * 0.5], R1 = [a[0] + dx * 0.55 - nx * w * 0.5, a[1] + dy * 0.55 - ny * w * 0.5];
      const loop = `M${f2(tail[0])},${f2(tail[1])} Q${f2(L1[0] - dx * 0.3)},${f2(L1[1] - dy * 0.3)} ${f2(L1[0])},${f2(L1[1])} Q${f2(end[0] + nx * w * 0.35)},${f2(end[1] + ny * w * 0.35)} ${f2(end[0])},${f2(end[1])} Q${f2(end[0] - nx * w * 0.35)},${f2(end[1] - ny * w * 0.35)} ${f2(R1[0])},${f2(R1[1])} Q${f2(R1[0] - dx * 0.3)},${f2(R1[1] - dy * 0.3)} ${f2(tail[0])},${f2(tail[1])}`;
      base += loop + ' ';
      light += `M${f2(L1[0] - dx * 0.1)},${f2(L1[1] - dy * 0.1)} Q${f2(end[0] + nx * w * 0.3)},${f2(end[1] + ny * w * 0.3)} ${f2(end[0])},${f2(end[1])} `;
    }
  }
  return `<path d="${base}" fill="none" stroke="${sh}" stroke-width="${f2(tw * 1.25)}" opacity="0.55" transform="translate(0.9 1.3)"/>` +
    `<path d="${base}" fill="none" stroke="${col}" stroke-width="${f2(tw)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${light}" fill="none" stroke="${hi}" stroke-width="${f2(tw * 0.42)}" stroke-linecap="round" opacity="0.75"/>`;
}

// ---------------------------------------------------------------- 平针 satin fill
// Parallel rows at `angle` (deg), `gap` apart, broken into stitches of ~`stitch` with staggered joins. Optional
// `shade`: a second colour laid over part of the shape (long-and-short shading), given as a path to clip it to.
let UID = 0;
export function satin(d, o = {}) {
  const id = 'st' + UID++, ang = ((o.angle ?? 30) * Math.PI) / 180, gap = o.gap ?? 4.2, st = o.stitch ?? 26;
  const col = o.color ?? '#C9954E', hi = o.hi ?? '#FFE2A8', dark = o.dark ?? '#3A2410';
  const pts = sample(d, 6).flat(), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
  const c = Math.cos(ang), s = Math.sin(ang), R0 = rng(o.seed ?? 7);
  let rows = '';
  for (let v = -R; v <= R; v += gap) {
    // a row across the shape, perpendicular offset v
    const ax = cx - c * R - s * v, ay = cy - s * R + c * v, bx = cx + c * R - s * v, by = cy + s * R + c * v;
    rows += `<path d="M${f2(ax)},${f2(ay)} L${f2(bx)},${f2(by)}" stroke-dashoffset="${f2(R0() * st)}"/>`;
  }
  const dash = `${f2(st - 1.6)} 1.6`;
  const layer = (color, wdt, op, dx, dy, extra = '') => `<g stroke="${color}" stroke-width="${f2(wdt)}" stroke-dasharray="${dash}" stroke-linecap="round" opacity="${op}" transform="translate(${dx} ${dy})" ${extra}>${rows}</g>`;
  let out = `<defs><clipPath id="${id}"><path d="${d}"/></clipPath>${o.shade ? `<clipPath id="${id}s"><path d="${o.shade}"/></clipPath>` : ''}</defs><g clip-path="url(#${id})">`;
  out += `<path d="${d}" fill="${dark}"/>`;
  out += layer(dark, gap * 1.15, 0.9, 0.6, 0.9) + layer(col, gap * 0.98, 1, 0, 0);
  if (o.shade) out += `<g clip-path="url(#${id}s)">${layer(o.shadeColor, gap * 0.98, 1, 0, 0)}</g>`;
  out += layer(hi, gap * 0.3, 0.55, -0.4, -gap * 0.22);
  out += `</g>`;
  // the raised edge: a soft dark rim just outside
  return `<g filter="url(#raise)">${out}</g>`;
}

// ---------------------------------------------------------------- the gauze: thin, sparse threads
export function sparse(d, o = {}) {
  const id = 'sp' + UID++, gap = o.gap ?? 9, col = o.color ?? '#F2DCB0';
  const pts = sample(d, 6).flat(), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 4, x1 = Math.max(...xs) + 4, y0 = Math.min(...ys) - 4, y1 = Math.max(...ys) + 4;
  let warp = '', weft = '';
  for (let x = x0; x <= x1; x += gap) warp += `M${f2(x)},${f2(y0)} V${f2(y1)} `;
  for (let y = y0; y <= y1; y += gap) weft += `M${f2(x0)},${f2(y)} H${f2(x1)} `;
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs><g clip-path="url(#${id})">` +
    `<path d="${d}" fill="${col}" opacity="${o.film ?? 0.07}"/>` +
    `<path d="${warp}${weft}" stroke="#000" stroke-width="${f2((o.w ?? 1.1) * 1.4)}" opacity="0.35" transform="translate(0.6 0.8)"/>` +
    `<path d="${warp}" stroke="${col}" stroke-width="${o.w ?? 1.1}" opacity="${o.op ?? 0.55}" stroke-dasharray="${o.dash ?? '7 2'}"/>` +
    `<path d="${weft}" stroke="${col}" stroke-width="${o.w ?? 1.1}" opacity="${(o.op ?? 0.55) * 0.85}" stroke-dasharray="${o.dash ?? '7 2'}" stroke-dashoffset="4"/></g>`;
}

// ---------------------------------------------------------------- the silk ground and the shared filter
export function ground(W, H, o = {}) {
  const c0 = o.c0 ?? '#1C0F0A', c1 = o.c1 ?? '#2E1810';
  return `<defs><pattern id="weave" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${c0}"/><path d="M0,1 H4" stroke="${c1}" stroke-width="1.2"/><path d="M1,0 V4" stroke="#000" stroke-width="0.6" opacity="0.5"/></pattern>` +
    `<radialGradient id="gsheen" cx="${o.cx ?? 0.55}" cy="${o.cy ?? 0.4}" r="0.75"><stop offset="0" stop-color="#FFD9A8" stop-opacity="${o.sheen ?? 0.16}"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>` +
    `<filter id="raise" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="1.2" dy="2" stdDeviation="1.4" flood-color="#000" flood-opacity="0.7"/></filter></defs>` +
    `<rect width="${W}" height="${H}" fill="url(#weave)"/><rect width="${W}" height="${H}" fill="url(#gsheen)"/>`;
}

// ---------------------------------------------------------------- the gauze as floss: long, very sparse satin threads
// laid along the grain (no dark fill under them), so the ground shows between every thread. Two layers at a slight
// angle make the moiré of doubled gauze. `clip` (optional path) limits it further (e.g. sleeves vs body grain).
export function floss(d, o = {}) {
  const id = 'fl' + UID++, ang = ((o.angle ?? 90) * Math.PI) / 180, gap = o.gap ?? 4.6, st = o.stitch ?? 70;
  const col = o.color ?? '#EAD2A2', hi = o.hi ?? '#FFF6DE', w = o.w ?? 1.0;
  const pts = sample(d, 6).flat(), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 4;
  const c = Math.cos(ang), s = Math.sin(ang), R0 = rng(o.seed ?? 5);
  let rows = '';
  for (let v = -R; v <= R; v += gap * (0.8 + 0.4 * R0())) {
    const wob = (R0() - 0.5) * 1.2;
    const ax = cx - c * R - s * v, ay = cy - s * R + c * v, bx = cx + c * R - s * (v + wob), by = cy + s * R + c * (v + wob);
    rows += `<path d="M${f2(ax)},${f2(ay)} L${f2(bx)},${f2(by)}" stroke-dashoffset="${f2(R0() * st)}" opacity="${f2(0.55 + 0.45 * R0())}"/>`;
  }
  const dash = `${f2(st)} ${f2(1.4)}`;
  return `<defs><clipPath id="${id}"><path d="${d}"/></clipPath>${o.clip ? `<clipPath id="${id}c"><path d="${o.clip}"/></clipPath>` : ''}</defs>` +
    `<g ${o.clip ? `clip-path="url(#${id}c)"` : ''}><g clip-path="url(#${id})">` +
    `<g stroke="#000" stroke-width="${f2(w * 1.5)}" stroke-dasharray="${dash}" opacity="${o.shadow ?? 0.25}" transform="translate(0.6 0.9)">${rows}</g>` +
    `<g stroke="${col}" stroke-width="${f2(w)}" stroke-dasharray="${dash}" opacity="${o.op ?? 0.6}">${rows}</g>` +
    `<g stroke="${hi}" stroke-width="${f2(w * 0.45)}" stroke-dasharray="${dash}" opacity="${(o.op ?? 0.6) * 0.6}" transform="translate(-0.3 -0.3)">${rows}</g>` +
    `</g></g>`;
}
