// Night silhouettes only (night.mjs: 差拨 / 富安 / 陆谦 in the snow, shapes with a rim light in the dark).
// The lit side cast is no longer code-drawn: see traced.mjs (traced like the 林冲 rig, 林冲's face construction).
// figure() below is the first-pass code-drawn construction, kept because silFigure() shares its helpers.
export const LINE = '#2A1C17';
const f = (n) => (Math.round(n * 1000) / 1000).toString();
const P = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])},${f(p[1])}`).join(' ') + 'Z';

/** Smooth closed path through points (Catmull-Rom). */
export function blob(pts, k = 0.5, closed = true) {
  const n = pts.length, Q = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
    d += ` C${f(p1[0] + ((p2[0] - p0[0]) * k) / 3)},${f(p1[1] + ((p2[1] - p0[1]) * k) / 3)} ${f(p2[0] - ((p3[0] - p1[0]) * k) / 3)},${f(p2[1] - ((p3[1] - p1[1]) * k) / 3)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, w, col = LINE, extra = '') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${f(w)}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

export const SKIN = { base: '#e6b896', shade: '#c99a7a', line: '#8a5a44' }; // a touch less saturated than 林冲's #efb58e
export const PX_PER_M = (heightPx180) => heightPx180 / 1.8;

// ------------------------------------------------------------------ faces (deliberately simpler than the rig)
function faceFront(spec, e, sw) {
  const s = [];
  const ey = -6.6, ex = 0.155;
  // brows
  const bt = e.brow ?? 0; // -1 knit .. +1 raised
  s.push(line(`M${-ex - 0.09},${ey - 0.15 - bt * 0.02} Q${-ex},${ey - 0.19 - bt * 0.03} ${-ex + 0.08},${ey - 0.14 + bt * 0.03}`, sw * 1.15));
  s.push(line(`M${ex + 0.09},${ey - 0.15 - bt * 0.02} Q${ex},${ey - 0.19 - bt * 0.03} ${ex - 0.08},${ey - 0.14 + bt * 0.03}`, sw * 1.15));
  // eyes: short dark strokes (narrow) or small dots — no whites, no highlights
  const open = e.eye ?? 0.7;
  if (open > 0.45) {
    s.push(`<ellipse cx="${-ex}" cy="${ey}" rx="0.045" ry="${f(0.02 + 0.022 * open)}" fill="${LINE}"/>`, `<ellipse cx="${ex}" cy="${ey}" rx="0.045" ry="${f(0.02 + 0.022 * open)}" fill="${LINE}"/>`);
  } else {
    s.push(line(`M${-ex - 0.06},${ey} Q${-ex},${ey + 0.025 * (1 - open)} ${-ex + 0.06},${ey}`, sw), line(`M${ex - 0.06},${ey} Q${ex},${ey + 0.025 * (1 - open)} ${ex + 0.06},${ey}`, sw));
  }
  // nose + mouth
  s.push(line(`M0.0,-6.52 L-0.025,-6.44 L0.01,-6.43`, sw * 0.8, SKIN.line));
  const m = e.mouth ?? 0, sm = e.smirk ?? 0;
  s.push(line(`M-0.085,${-6.315 - m * 0.012} Q0,${-6.305 + m * 0.03} ${0.085},${-6.315 - (m + sm) * 0.03}`, sw * 0.95));
  if (e.lines) s.push(line('M-0.27,-6.58 l-0.05,0.03 M-0.27,-6.55 l-0.05,0.04 M0.27,-6.58 l0.05,0.03 M0.27,-6.55 l0.05,0.04', sw * 0.6, SKIN.line)); // crow's feet
  return s.join('');
}
function faceSide(spec, e, sw) {
  const s = [];
  const open = e.eye ?? 0.6;
  s.push(line(`M-0.31,-6.79 Q-0.24,-6.82 -0.17,-6.78`, sw * 1.15));
  if (open > 0.45) s.push(`<ellipse cx="-0.25" cy="-6.62" rx="0.03" ry="${f(0.02 + 0.02 * open)}" fill="${LINE}"/>`);
  else s.push(line('M-0.29,-6.62 Q-0.25,-6.6 -0.21,-6.62', sw));
  const m = e.mouth ?? 0, sm = e.smirk ?? 0;
  s.push(line(`M-0.4,-6.33 Q-0.35,${-6.32 + m * 0.02} -0.31,${-6.335 - (m + sm) * 0.025}`, sw * 0.95));
  if (e.lines) s.push(line('M-0.16,-6.63 l0.05,0.02 M-0.16,-6.6 l0.05,0.03', sw * 0.6, SKIN.line));
  return s.join('');
}

// ------------------------------------------------------------------ the figure
/**
 * spec: { heads (7.0–7.3), robe:{base, shade, fold}, inner (collar), sash:{col, tails}, hemY (robe hem, head units, e.g. -0.45
 *         long robe / -2.3 tunic), trousers, boots, sleeve: 'wide'|'narrow', hands: 'hidden'|'fist', head: fn(view, sw) → svg
 *         (headwear + hair), beard: fn(view, sw), stoop (0..0.15) }
 * opts: { view: 'front'|'side'|'back'|'back34', x, y, height (px for this character's real height), flip, expr, pose:{step -1..1,
 *         staff:{col1,col2}, brush:true, lean (deg)}, sil: null | {fill, rim, rimW} (night silhouette), id }
 */
export function figure(spec, opts = {}) {
  const n = spec.heads || 7.2;
  const H = (opts.height || 560) / n;
  const view = opts.view || 'front';
  const e = { ...(spec.expr || {}), ...(opts.expr || {}) };
  const pose = opts.pose || {};
  const sw = 0.022; // feature line, head units (≈ 1.7 px at H 78)
  const sil = opts.sil || null;
  const R = { ...spec.robe, ...(opts.col || {}) }, top = -n; // opts.col overrides {base, shade, fold}
  const SW = spec.sleeveW || 1; // sleeve width factor (高衙内's extra-wide sleeves)
  const k = (yy) => yy + (n - 7.2) * 0; // all body y's are authored for 7.2 heads; head block is shifted by (7.2 - n)
  const dy = 7.2 - n; // shift of the head/shoulders for shorter figures
  let body = '';

  if (view === 'front' || view === 'back' || view === 'back34') {
    const back = view !== 'front';
    // legs / boots
    const hem = spec.hemY ?? -0.45;
    if (hem < -0.6) { // short tunic: trousers
      body += path(P([[-0.42, hem], [-0.05, hem], [-0.1, -0.3], [-0.4, -0.3]]), spec.trousers || '#2e2a28');
      body += path(P([[0.05, hem], [0.42, hem], [0.4, -0.3], [0.1, -0.3]]), spec.trousers || '#2e2a28');
    }
    body += path(blob([[-0.52, -0.42], [-0.15, -0.42], [-0.13, 0], [-0.6, 0.02]], 0.3), spec.boots || '#2b2826');
    body += path(blob([[0.15, -0.42], [0.52, -0.42], [0.6, 0.02], [0.13, 0]], 0.3), spec.boots || '#2b2826');
    body += path(P([[-0.62, -0.02], [-0.12, -0.02], [-0.12, 0.04], [-0.64, 0.04]]), '#8f8a84');
    body += path(P([[0.12, -0.02], [0.62, -0.02], [0.64, 0.04], [0.12, 0.04]]), '#8f8a84');
    // robe body — collar reaches the jaw like the rig (short neck), broad sloped shoulders, explicit hem (no spline overshoot)
    const sh = -6.08 + dy;
    const robe = `M-0.2,${f(sh)} C-0.42,${f(sh + 0.02)} -0.7,${f(sh + 0.12)} -0.92,${f(sh + 0.4)} C-0.9,${f(sh + 0.9)} -0.8,-4.9 -0.76,-4.3 ` +
      `Q-0.86,${f((hem - 4.3) / 2 - 0.2)} -1.0,${f(hem)} Q0,${f(hem + 0.06)} 1.0,${f(hem)} Q0.86,${f((hem - 4.3) / 2 - 0.2)} 0.76,-4.3 ` +
      `C0.8,-4.9 0.9,${f(sh + 0.9)} 0.92,${f(sh + 0.4)} C0.7,${f(sh + 0.12)} 0.42,${f(sh + 0.02)} 0.2,${f(sh)} Z`;
    body += path(robe, R.base);
    // hard cel shadow: right third of the robe
    body += `<clipPath id="${opts.id || 'v4'}rc"><path d="${robe}"/></clipPath>`;
    body += `<g clip-path="url(#${opts.id || 'v4'}rc)">${path(P([[0.36, sh - 0.2], [1.2, sh - 0.2], [1.2, hem + 0.2], [0.55, hem + 0.2], [0.42, -2.6], [0.48, -4.4]]), R.shade)}</g>`;
    // folds
    body += line(`M-0.35,-4.0 Q-0.42,${(hem - 4) / 2} -0.48,${hem + 0.15}`, sw * 0.8, R.fold || R.shade);
    body += line(`M0.2,-4.0 Q0.25,${(hem - 4) / 2} 0.3,${hem + 0.15}`, sw * 0.8, R.fold || R.shade);
    if (!back) {
      // cross collar (交领): white inner V tucked right under the jaw, darker collar bands
      body += path(P([[-0.16, sh - 0.16], [0.16, sh - 0.16], [0.18, sh + 0.04], [-0.18, sh + 0.04]]), SKIN.shade);
      body += path(P([[-0.22, sh - 0.02], [0.22, sh - 0.02], [0.03, sh + 0.62]]), spec.inner || '#e9e4d8');
      body += line(`M-0.24,${sh - 0.02} L0.12,${sh + 0.52}`, 0.075, R.shade);
      body += line(`M0.24,${sh - 0.02} L-0.02,${sh + 0.3}`, 0.075, R.shade);
    } else {
      body += path(blob([[-0.24, sh - 0.04], [0.24, sh - 0.04], [0.2, sh + 0.12], [-0.2, sh + 0.12]], 0.4), spec.inner || '#e9e4d8');
    }
    // sash
    if (spec.sash) {
      body += path(P([[-0.78, -4.5], [0.78, -4.5], [0.77, -4.22], [-0.77, -4.22]]), spec.sash.col);
      if (spec.sash.tails && !back) body += path(P([[0.12, -4.25], [0.28, -4.25], [0.3, -3.2], [0.16, -3.25]]), spec.sash.col);
    }
    // sleeves: 'tuck' (袖手: both sleeves meet in front at the waist, hands hidden) or hanging with a closed fist (guards)
    const wide = spec.sleeve !== 'narrow';
    const cuffY = wide ? -3.35 : -3.6;
    const tuck = spec.hands !== 'fist';
    for (const sgn of [-1, 1]) {
      const col = sgn > 0 ? R.shade : R.base;
      if (tuck && !back) {
        // upper arm down the side, forearm across the front; the two cuffs overlap at the centre
        const sl = `M${sgn * 0.62},${f(sh + 0.1)} C${f(sgn * 0.98 * SW)},${f(sh + 0.3)} ${f(sgn * 1.22 * SW)},${f(sh + 1.0)} ${f(sgn * 1.22 * SW)},-4.5 ` +
          `C${f(sgn * 1.22 * SW)},-4.0 ${f(sgn * 1.05 * SW)},${f(-3.55 + (SW - 1) * 0.5)} ${sgn * 0.75},${f(-3.45 + (SW - 1) * 0.6)} L${sgn * -0.12},-3.62 C${sgn * 0.0},-3.95 ${sgn * 0.3},-4.12 ${sgn * 0.6},-4.18 ` +
          `C${sgn * 0.78},-4.5 ${sgn * 0.8},${f(sh + 1.0)} ${sgn * 0.62},${f(sh + 0.1)} Z`;
        body += path(sl, col);
        body += line(`M${sgn * 1.02},${f(sh + 1.0)} Q${sgn * 1.12},-4.6 ${sgn * 1.0},-3.75`, sw * 0.7, R.fold || R.shade);
        body += line(`M${sgn * 0.55},-3.92 L${sgn * 0.02},-3.72`, sw * 0.7, R.fold || R.shade);
      } else if (back) {
        const sl = blob([[sgn * 0.7, sh + 0.08], [sgn * (wide ? 1.3 : 1.06), sh + 1.2], [sgn * (wide ? 1.42 : 1.1), cuffY], [sgn * (wide ? 0.92 : 0.86), cuffY + 0.05], [sgn * 0.8, sh + 0.95]], 0.4);
        body += path(sl, col);
      } else {
        // narrow hanging sleeve + closed fist (guards)
        const sl = `M${sgn * 0.62},${f(sh + 0.1)} C${sgn * 0.98},${f(sh + 0.3)} ${sgn * 1.08},${f(sh + 1.0)} ${sgn * 1.1},${f(cuffY)} L${sgn * 0.84},${f(cuffY + 0.04)} C${sgn * 0.82},${f(sh + 1.2)} ${sgn * 0.78},${f(sh + 0.6)} ${sgn * 0.62},${f(sh + 0.1)} Z`;
        body += path(sl, col);
        const hx = sgn * 0.97, hy = cuffY + 0.17;
        body += path(blob([[hx - 0.13, hy - 0.13], [hx + 0.13, hy - 0.13], [hx + 0.14, hy + 0.08], [hx + 0.02, hy + 0.17], [hx - 0.13, hy + 0.09]], 0.5), SKIN.base);
        body += line(`M${hx - 0.1},${hy - 0.02} Q${hx},${hy + 0.01} ${hx + 0.1},${hy - 0.02}`, sw * 0.6, SKIN.line);
      }
    }
    // staff (guards): held in the right hand, vertical
    if (pose.staff && !back) {
      const hx = 0.97, top2 = -7.6, bot = 0;
      body = path(P([[hx - 0.05, top2], [hx + 0.05, top2], [hx + 0.05, (top2 + bot) / 2], [hx - 0.05, (top2 + bot) / 2]]), pose.staff.col1 || '#8e3a30') +
        path(P([[hx - 0.05, (top2 + bot) / 2], [hx + 0.05, (top2 + bot) / 2], [hx + 0.05, bot], [hx - 0.05, bot]]), pose.staff.col2 || '#1e1b1a') + body;
    }
    // head
    const hd = -6.62 + dy;
    let head = '';
    if (!back) {
      head += path(blob([[-0.37, hd - 0.12], [-0.33, hd + 0.18], [-0.18, hd + 0.36], [0, hd + 0.42], [0.18, hd + 0.36], [0.33, hd + 0.18], [0.37, hd - 0.12], [0.3, hd - 0.38], [0, hd - 0.42], [-0.3, hd - 0.38]], 0.45), SKIN.base);
      head += path(blob([[0.12, hd - 0.38], [0.3, hd - 0.38], [0.37, hd - 0.12], [0.33, hd + 0.18], [0.18, hd + 0.36], [0.06, hd + 0.4], [0.2, hd + 0.1], [0.2, hd - 0.2]], 0.45), SKIN.shade, 'opacity="0.55"');
      head += path(blob([[-0.38, hd - 0.08], [-0.44, hd - 0.02], [-0.42, hd + 0.1], [-0.35, hd + 0.12]], 0.5), SKIN.base);
      head += path(blob([[0.38, hd - 0.08], [0.44, hd - 0.02], [0.42, hd + 0.1], [0.35, hd + 0.12]], 0.5), SKIN.shade);
      head += path(blob([[-0.38, hd - 0.26], [-0.3, hd - 0.36], [-0.3, hd - 0.05], [-0.37, hd + 0.04]], 0.5), spec.hair || '#1e1b1a');
      head += path(blob([[0.38, hd - 0.26], [0.3, hd - 0.36], [0.3, hd - 0.05], [0.37, hd + 0.04]], 0.5), spec.hair || '#1e1b1a');
      head += `<g transform="translate(0 ${f(dy)})">${faceFront(spec, e, sw)}</g>`;
      if (spec.beard) head += `<g transform="translate(0 ${f(dy)})">${spec.beard('front', sw)}</g>`;
      head += `<rect data-face="1" x="-0.42" y="${f(hd - 0.45)}" width="0.84" height="0.9" fill="none"/>`;
    } else {
      // back of the head (hair) — face never shown
      head += path(blob([[-0.38, hd - 0.1], [-0.34, hd + 0.2], [0, hd + 0.34], [0.34, hd + 0.2], [0.38, hd - 0.1], [0.3, hd - 0.4], [0, hd - 0.45], [-0.3, hd - 0.4]], 0.45), spec.hair || '#1e1b1a');
      if (view === 'back34') head += path(blob([[-0.38, hd - 0.06], [-0.42, hd + 0.08], [-0.36, hd + 0.26], [-0.3, hd + 0.1]], 0.5), SKIN.shade); // a sliver of cheek/ear, no features
    }
    if (spec.head) head += `<g transform="translate(0 ${f(dy)})">${spec.head(view, sw)}</g>`;
    body += head;
  } else if (view === 'side') {
    const st = pose.step || 0; // -1..1 walk phase
    const hem = spec.hemY ?? -0.45;
    const sh = -6.08 + dy;
    const lean = pose.lean || 0;
    // legs (long robe: boots only peeking; tunic: trousered legs)
    const legA = st * 22, legB = -st * 22;
    const leg = (ang, col, front) => {
      const hipY = hem < -0.6 ? hem + 0.2 : -1.2;
      const g = `<g transform="rotate(${f(ang)} 0 ${f(hipY)})">` +
        (hem < -0.6 ? path(P([[-0.16, hipY], [0.16, hipY], [0.12, -0.3], [-0.14, -0.3]]), spec.trousers || '#2e2a28') : '') +
        path(blob([[-0.15, -0.45], [0.15, -0.45], [0.16, 0.0], [-0.42, 0.02], [-0.42, -0.08]], 0.3), spec.boots || '#2b2826') +
        path(P([[-0.44, -0.01], [0.17, -0.01], [0.17, 0.04], [-0.46, 0.04]]), '#8f8a84') + '</g>';
      return g;
    };
    body += leg(legB, '#000', false);
    body += leg(legA, '#000', true);
    // robe profile
    const fw = 0.6, bw = 0.62;
    const sp = st * 0.18;
    const robe = `M-0.22,${f(sh)} C-0.42,${f(sh + 0.1)} ${f(-fw)},${f(sh + 0.4)} ${f(-fw)},${f(sh + 1.0)} C${f(-fw - 0.04)},-4.6 ${f(-fw - 0.02)},-4.4 ${f(-fw)},-4.3 ` +
      `Q${f(-fw - 0.12)},${f((hem - 4.3) / 2)} ${f(-0.72 - Math.max(0, sp))},${f(hem)} L${f(0.66 + Math.max(0, -sp))},${f(hem)} Q${f(bw + 0.08)},${f((hem - 4.3) / 2)} ${f(bw)},-4.3 ` +
      `C${f(bw + 0.06)},-4.8 ${f(bw + 0.08)},${f(sh + 0.6)} ${f(bw - 0.06)},${f(sh + 0.25)} C0.4,${f(sh + 0.02)} 0.2,${f(sh - 0.06)} 0.12,${f(sh - 0.06)} Z`;
    body += path(robe, R.base);
    body += `<clipPath id="${opts.id || 'v4'}rs"><path d="${robe}"/></clipPath><g clip-path="url(#${opts.id || 'v4'}rs)">${path(P([[0.12, sh - 0.3], [1.0, sh - 0.3], [1.0, hem + 0.2], [0.2, hem + 0.2]]), R.shade)}</g>`;
    body += line(`M-0.1,-4.0 Q-0.2,${(hem - 4) / 2} -0.3,${hem + 0.15}`, sw * 0.8, R.fold || R.shade);
    // collar edge + neck
    body += path(P([[-0.16, sh - 0.2], [0.1, sh - 0.2], [0.14, sh + 0.02], [-0.2, sh + 0.02]]), SKIN.shade);
    body += path(P([[-0.26, sh - 0.02], [0.04, sh - 0.06], [-0.14, sh + 0.42]]), spec.inner || '#e9e4d8');
    if (spec.sash) body += path(P([[-fw - 0.05, -4.5], [bw + 0.05, -4.5], [bw + 0.05, -4.22], [-fw - 0.06, -4.22]]), spec.sash.col);
    // sleeve (near arm) hanging in front, hand hidden or fist
    const wide = spec.sleeve !== 'narrow';
    const swing = st * 10;
    const cuffY = wide ? -3.25 : -3.55;
    let arm = (spec.hands !== 'fist' && !pose.brush && !pose.staff
      ? path(`M-0.24,${f(sh + 0.08)} C0.22,${f(sh + 0.02)} 0.46,${f(sh + 0.7)} 0.44,-4.6 C0.42,-4.0 0.14,-3.62 -0.3,-3.52 L-0.72,-3.62 C-0.6,-3.95 -0.38,-4.1 -0.16,-4.2 C-0.18,-4.7 -0.38,${f(sh + 0.9)} -0.24,${f(sh + 0.08)} Z`, R.base)
      : path(blob([[-0.16, sh + 0.06], [0.2, sh + 0.1], [wide ? 0.34 : 0.22, cuffY], [wide ? -0.32 : -0.12, cuffY + 0.05], [-0.26, sh + 0.9]], 0.4), R.base)) +
      line(`M0.05,${sh + 0.6} Q0.12,${(sh + cuffY) / 2} 0.18,${cuffY - 0.1}`, sw * 0.7, R.fold || R.shade);
    if (spec.hands !== 'fist' && !pose.brush && !pose.staff) {
      // tucked sleeve: show its edge and the dark cuff opening where the hands hide
      arm += line(`M0.16,${f(sh + 0.25)} C0.4,${f(sh + 0.9)} 0.45,-4.5 0.42,-4.4 C0.38,-3.95 0.1,-3.64 -0.3,-3.53`, sw * 1.1, R.fold || R.shade);
      arm += path(blob([[-0.74, -3.63], [-0.6, -3.8], [-0.54, -3.58]], 0.5), R.fold || R.shade);
    }
    if (spec.hands === 'fist') arm += path(blob([[-0.12, cuffY + 0.02], [0.12, cuffY + 0.02], [0.13, cuffY + 0.24], [-0.1, cuffY + 0.27]], 0.5), SKIN.base);
    else if (pose.brush || pose.staff) arm += path(blob([[wide ? -0.3 : -0.1, cuffY + 0.03], [wide ? 0.3 : 0.18, cuffY - 0.01], [0.02, cuffY + 0.08]], 0.5), R.fold || R.shade);
    if (pose.brush) arm += line(`M-0.05,${cuffY + 0.05} L-0.32,${cuffY + 0.42}`, 0.035, '#6b4a2e') + path(blob([[-0.34, cuffY + 0.4], [-0.29, cuffY + 0.44], [-0.38, cuffY + 0.56]], 0.4), '#17120E');
    if (pose.staff) arm = path(P([[-0.03, -7.5], [0.05, -7.5], [0.05, -3.4], [-0.03, -3.4]]), pose.staff.col1 || '#8e3a30') + path(P([[-0.03, -3.4], [0.05, -3.4], [0.05, 0], [-0.03, 0]]), pose.staff.col2 || '#1e1b1a') + arm;
    body += `<g transform="rotate(${f(swing)} 0 ${f(sh + 0.1)})">${arm}</g>`;
    // head profile
    const hd = -6.62 + dy;
    let head = path(blob([[0.05, hd - 0.44], [0.36, hd - 0.3], [0.4, hd + 0.05], [0.2, hd + 0.3], [-0.05, hd + 0.4], [-0.3, hd + 0.42], [-0.36, hd + 0.3], [-0.4, hd + 0.24], [-0.38, hd + 0.17], [-0.44, hd + 0.08], [-0.37, hd - 0.02], [-0.35, hd - 0.2], [-0.25, hd - 0.38]], 0.45), SKIN.base);
    head += path(blob([[0.05, hd - 0.1], [0.14, hd - 0.04], [0.14, hd + 0.08], [0.06, hd + 0.12]], 0.5), SKIN.shade);
    head += `<g transform="translate(0 ${f(dy)})">${faceSide(spec, e, sw)}</g>`;
    if (spec.beard) head += `<g transform="translate(0 ${f(dy)})">${spec.beard('side', sw)}</g>`;
    head += `<rect data-face="1" x="-0.46" y="${f(hd - 0.45)}" width="0.88" height="0.9" fill="none"/>`;
    if (spec.head) head += `<g transform="translate(0 ${f(dy)})">${spec.head('side', sw)}</g>`;
    body += `<g transform="rotate(${f(lean)} 0 ${f(sh)})">${head}</g>`;
  }

  // stoop: head + shoulders forward
  const stoop = spec.stoop || 0;
  let inner = body;
  if (sil) {
    // night silhouette: everything in one dark fill, with an optional rim stroke
    inner = `<g filter="url(#${opts.id || 'v4'}sil)">${body}</g>`;
  }
  const flip = opts.flip ? -1 : 1;
  const tf = `translate(${f(opts.x || 0)} ${f(opts.y || 0)}) scale(${f(H * flip)} ${f(H)})${stoop ? ` skewX(${f(-stoop * 20)})` : ''}`;
  let defs = '';
  if (sil) {
    defs = `<filter id="${opts.id || 'v4'}sil" x="-20%" y="-10%" width="140%" height="120%" color-interpolation-filters="sRGB">` +
      `<feFlood flood-color="${sil.fill || '#120C0A'}"/><feComposite in2="SourceAlpha" operator="in" result="s"/>` +
      (sil.rim ? `<feMorphology in="SourceAlpha" operator="dilate" radius="${f((sil.rimW || 2) / H)}" result="d"/><feFlood flood-color="${sil.rim}"/><feComposite in2="d" operator="in" result="r"/><feOffset in="r" dx="${f((sil.rimDx ?? 1.5) / H)}" dy="0" result="ro"/><feMerge><feMergeNode in="ro"/><feMergeNode in="s"/></feMerge>` : '') +
      `</filter>`;
  }
  return `<g data-cast="${spec.name || 'v4'}" transform="${tf}"><defs>${defs}</defs>${inner}</g>`;
}

/** Night silhouettes (差拨, 富安, 陆谦 at night): posed volumes in one fill with an optional rim light. pose: run|fall|stand|cower */
export function silFigure(opts = {}) {
  const n = 7.0, H = (opts.height || 560) / n;
  const pose = opts.pose || 'run';
  const fill = opts.fill || '#120C0A', rim = opts.rim, flip = opts.flip ? -1 : 1;
  // tapered limb with round ends
  const seg = (a, b, w1, w2) => {
    const dx = b[0] - a[0], dy2 = b[1] - a[1], L = Math.hypot(dx, dy2) || 1, nx = -dy2 / L, ny = dx / L;
    return `<path d="M${f(a[0] + nx * w1 / 2)},${f(a[1] + ny * w1 / 2)} L${f(b[0] + nx * w2 / 2)},${f(b[1] + ny * w2 / 2)} L${f(b[0] - nx * w2 / 2)},${f(b[1] - ny * w2 / 2)} L${f(a[0] - nx * w1 / 2)},${f(a[1] - ny * w1 / 2)} Z" fill="${fill}"/>` +
      `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(w1 / 2)}" fill="${fill}"/><circle cx="${f(b[0])}" cy="${f(b[1])}" r="${f(w2 / 2)}" fill="${fill}"/>`;
  };
  const cap = (cx, cy, ang = 0) => {
    const c = opts.cap === 'official'
      ? `<path d="${blob([[-0.36, 0.05], [-0.3, -0.36], [0, -0.5], [0.3, -0.36], [0.36, 0.05]], 0.4)}" fill="${fill}"/><path d="M-0.62,-0.12 L0.62,-0.12" stroke="${fill}" stroke-width="0.09" stroke-linecap="round"/>`
      : opts.cap === 'scarf' ? `<path d="${blob([[-0.4, 0.06], [-0.32, -0.34], [0.05, -0.48], [0.4, -0.25], [0.42, 0.06]], 0.4)}" fill="${fill}"/><path d="M0.36,-0.1 Q0.62,0.1 0.56,0.5 L0.46,0.48 Q0.5,0.15 0.3,0.0Z" fill="${fill}"/>` : '';
    return `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})"><circle cx="0" cy="0" r="0.41" fill="${fill}"/>${c}</g>`;
  };
  const coat = (pts) => `<path d="${blob(pts, 0.45)}" fill="${fill}"/>`;
  const fat = opts.fat || 0;
  let s = '';
  if (pose === 'run') {
    // leaning forward, long stride, arms pumping, coat flying back
    s += coat([[-0.35, -5.75], [0.45, -5.6], [0.8 + fat, -4.3], [0.55, -3.2], [-0.2, -2.9], [-0.95, -3.1], [-0.6, -4.5]]);
    s += coat([[-0.5, -3.4], [0.5, -3.3], [0.7, -2.4], [-1.25, -2.2]]);
    s += seg([0.3, -3.2], [1.1, -1.9], 0.5, 0.38) + seg([1.1, -1.9], [0.95, -0.25], 0.38, 0.28) + seg([0.95, -0.2], [1.38, -0.12], 0.22, 0.2);
    s += seg([-0.2, -3.1], [-1.0, -2.0], 0.5, 0.38) + seg([-1.0, -2.0], [-1.75, -1.2], 0.38, 0.28) + seg([-1.75, -1.2], [-1.95, -1.45], 0.22, 0.2);
    s += seg([0.25, -5.35], [-0.45, -4.55], 0.36, 0.3) + seg([-0.45, -4.55], [-0.9, -3.95], 0.3, 0.26);
    s += seg([0.45, -5.35], [1.15, -4.75], 0.36, 0.3) + seg([1.15, -4.75], [1.55, -5.2], 0.3, 0.26);
    s += seg([0.35, -5.8], [0.55, -6.05], 0.3, 0.3) + cap(0.7, -6.35, 15);
  } else if (pose === 'fall') {
    // thrown backwards off his feet, arms flung
    s += `<g transform="translate(-0.3 -3.6) rotate(-62)">${coat([[-0.55 - fat, -1.25], [0.55 + fat, -1.25], [0.75 + fat, 0.2], [0.7, 1.25], [-0.7, 1.25], [-0.75 - fat, 0.2]])}</g>`;
    s += seg([0.45, -2.8], [1.3, -3.7], 0.5, 0.38) + seg([1.3, -3.7], [2.0, -3.25], 0.38, 0.28);
    s += seg([0.4, -2.55], [1.05, -1.5], 0.5, 0.38) + seg([1.05, -1.5], [1.55, -0.95], 0.38, 0.28);
    s += seg([-0.85, -4.35], [-0.55, -5.55], 0.36, 0.3) + seg([-0.55, -5.55], [-0.15, -6.15], 0.3, 0.26);
    s += seg([-1.05, -4.05], [-1.85, -3.4], 0.36, 0.3) + seg([-1.85, -3.4], [-2.35, -3.7], 0.3, 0.26);
    s += cap(-1.6, -4.65, -60);
  } else if (pose === 'cower') {
    // on his back in the snow, knees up, both hands raised pleading
    s += coat([[-1.3, -0.95], [0.9, -0.85], [1.1, -0.1], [-1.4, -0.1]]);
    s += seg([0.8, -0.6], [1.6, -1.55], 0.5, 0.38) + seg([1.6, -1.55], [2.45, -0.45], 0.38, 0.28) + seg([0.85, -0.35], [1.85, -1.2], 0.48, 0.36) + seg([1.85, -1.2], [2.75, -0.2], 0.36, 0.26);
    s += seg([-0.8, -0.9], [-0.75, -2.0], 0.34, 0.28) + seg([-0.75, -2.0], [-0.45, -2.65], 0.28, 0.24);
    s += seg([-1.05, -0.95], [-1.25, -2.05], 0.34, 0.28) + seg([-1.25, -2.05], [-1.0, -2.75], 0.28, 0.24);
    s += cap(-1.75, -0.75, -85);
  } else {
    s += coat([[-0.5 - fat, -5.75], [0.5 + fat, -5.75], [0.62 + fat * 1.3, -4.3], [0.75, -0.45], [-0.75, -0.45], [-0.62 - fat * 1.3, -4.3]]);
    s += seg([-0.62, -5.55], [-0.82, -3.7], 0.36, 0.3) + seg([0.62, -5.55], [0.82, -3.7], 0.36, 0.3);
    s += seg([-0.25, -0.6], [-0.3, -0.02], 0.3, 0.3) + seg([0.25, -0.6], [0.3, -0.02], 0.3, 0.3);
    s += seg([0, -5.7], [0, -6.0], 0.32, 0.32) + cap(0, -6.3, 0);
  }
  const id = opts.id || 'sil';
  const filt = rim ? `<defs><filter id="${id}rim" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="${f((opts.rimW || 2.2) / H)}" result="d"/><feFlood flood-color="${rim}"/><feComposite in2="d" operator="in" result="r"/><feOffset in="r" dx="${f((opts.rimDx ?? -1.8) / H)}" dy="${f(-0.6 / H)}" result="ro"/><feMerge><feMergeNode in="ro"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` : '';
  return `<g data-cast="${opts.name || 'sil'}" transform="translate(${f(opts.x || 0)} ${f(opts.y || 0)}) scale(${f(H * flip)} ${f(H)})">${filt}<g${rim ? ` filter="url(#${id}rim)"` : ''}>${s}</g></g>`;
}
