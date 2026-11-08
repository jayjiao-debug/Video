// v4 side cast — one construction language for every non-protagonist character.
// Design rules (owner 2026-11-08: "side characters should not steal the show of the protag"):
//  * flat fills + ONE hard cel shadow shape (light from upper left), no gradients, no rim light (except night silhouettes);
//  * no dark outline around the clothes (like the traced 林冲 rig); thin #2A1C17 line only for face features and a few folds;
//  * simpler than 林冲: dot/stroke eyes with no whites or highlights, tiny nose, single-line mouth, flat face;
//  * muted, low-chroma palettes (林冲's green / slate and the seal red stay the strongest colours in any frame);
//  * same proportion system as the rig (model_sheet.md): height in metres → px via pxPerM, 7.0–7.3 heads, short neck;
//  * hands hidden in sleeves (袖手) or simple closed silhouettes — never open fingers.
// Local units: 1 = one head height (H px). Origin at the feet centre, y up is negative. Side views face LEFT unless flip.
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
  const open = e.eye ?? 0.6;
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
  const R = spec.robe, top = -n;
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
    // robe body
    const sh = -5.86 + dy;
    const robe = blob([[-0.22, sh - 0.1], [-0.92, sh + 0.04], [-0.86, sh + 0.7], [-0.76, -4.3], [-0.98, hem + 0.6], [-1.04, hem], [0, hem + 0.05], [1.04, hem], [0.98, hem + 0.6], [0.76, -4.3], [0.86, sh + 0.7], [0.92, sh + 0.04], [0.22, sh - 0.1]], 0.35);
    body += path(robe, R.base);
    // hard cel shadow: right third of the robe
    body += `<clipPath id="${opts.id || 'v4'}rc"><path d="${robe}"/></clipPath>`;
    body += `<g clip-path="url(#${opts.id || 'v4'}rc)">${path(P([[0.38, sh - 0.2], [1.2, sh - 0.2], [1.2, hem + 0.2], [0.55, hem + 0.2], [0.42, -2.6], [0.5, -4.4]]), R.shade)}</g>`;
    // folds
    body += line(`M-0.35,-4.0 Q-0.42,${(hem - 4) / 2} -0.48,${hem + 0.15}`, sw * 0.8, R.fold || R.shade);
    body += line(`M0.2,-4.0 Q0.25,${(hem - 4) / 2} 0.3,${hem + 0.15}`, sw * 0.8, R.fold || R.shade);
    if (!back) {
      // cross collar (交领) + short neck
      body += path(P([[-0.17, sh - 0.42], [0.17, sh - 0.42], [0.15, sh - 0.02], [-0.15, sh - 0.02]]), SKIN.shade);
      body += path(P([[-0.24, sh - 0.12], [0.24, sh - 0.12], [0.03, sh + 0.72]]), spec.inner || '#e9e4d8');
      body += line(`M-0.24,${sh - 0.12} L0.12,${sh + 0.6}`, 0.07, R.shade);
      body += line(`M0.24,${sh - 0.12} L-0.02,${sh + 0.36}`, 0.07, R.shade);
    } else {
      body += path(P([[-0.15, sh - 0.42], [0.15, sh - 0.42], [0.16, sh - 0.02], [-0.16, sh - 0.02]]), SKIN.shade);
      body += path(blob([[-0.26, sh - 0.12], [0.26, sh - 0.12], [0.2, sh + 0.08], [-0.2, sh + 0.08]], 0.4), spec.inner || '#e9e4d8');
    }
    // sash
    if (spec.sash) {
      body += path(P([[-0.78, -4.5], [0.78, -4.5], [0.77, -4.22], [-0.77, -4.22]]), spec.sash.col);
      if (spec.sash.tails && !back) body += path(P([[0.12, -4.25], [0.28, -4.25], [0.3, -3.2], [0.16, -3.25]]), spec.sash.col);
    }
    // sleeves
    const wide = spec.sleeve !== 'narrow';
    const cuffY = wide ? -3.25 : -3.55;
    for (const sgn of [-1, 1]) {
      const sl = blob([[sgn * 0.9, sh + 0.02], [sgn * (wide ? 1.32 : 1.08), sh + 1.2], [sgn * (wide ? 1.46 : 1.12), cuffY], [sgn * (wide ? 0.92 : 0.86), cuffY + 0.05], [sgn * 0.8, sh + 0.9]], 0.4);
      body += path(sl, sgn > 0 ? R.shade : R.base);
      body += line(`M${sgn * 1.0},${sh + 0.9} Q${sgn * 1.12},${(sh + cuffY) / 2 + 0.6} ${sgn * 1.18},${cuffY - 0.1}`, sw * 0.7, R.fold || R.shade);
      // hands: hidden (cuff opening dark) or closed fist below the cuff
      if (spec.hands === 'fist' && !back) {
        const hx = sgn * (wide ? 1.19 : 0.99), hy = cuffY + 0.18;
        body += path(blob([[hx - 0.13, hy - 0.12], [hx + 0.13, hy - 0.12], [hx + 0.14, hy + 0.1], [hx, hy + 0.17], [hx - 0.14, hy + 0.1]], 0.5), SKIN.base);
        body += line(`M${hx - 0.09},${hy + 0.0} L${hx + 0.09},${hy + 0.0}`, sw * 0.6, SKIN.line);
      } else {
        body += path(blob([[sgn * (wide ? 0.95 : 0.88), cuffY + 0.02], [sgn * (wide ? 1.42 : 1.1), cuffY - 0.02], [sgn * (wide ? 1.2 : 1.0), cuffY + 0.07]], 0.5), R.fold || R.shade);
      }
    }
    // staff (guards): held in the right hand, vertical
    if (pose.staff && !back) {
      const hx = (wide ? 1.19 : 0.99), top2 = -7.6, bot = 0;
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
    const sh = -5.86 + dy;
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
    const fw = 0.42, bw = 0.38;
    const sp = st * 0.18;
    const robe = blob([[-0.18, sh - 0.12], [-fw, sh + 0.25], [-fw - 0.04, -4.3], [-0.62 - Math.max(0, sp), hem + 0.5], [-0.72 - Math.max(0, sp), hem], [0, hem + 0.06], [0.64 + Math.max(0, -sp), hem], [0.58, hem + 0.5], [bw, -4.3], [bw + 0.04, sh + 0.25], [0.18, sh - 0.18]], 0.35);
    body += path(robe, R.base);
    body += `<clipPath id="${opts.id || 'v4'}rs"><path d="${robe}"/></clipPath><g clip-path="url(#${opts.id || 'v4'}rs)">${path(P([[0.12, sh - 0.3], [1.0, sh - 0.3], [1.0, hem + 0.2], [0.2, hem + 0.2]]), R.shade)}</g>`;
    body += line(`M-0.1,-4.0 Q-0.2,${(hem - 4) / 2} -0.3,${hem + 0.15}`, sw * 0.8, R.fold || R.shade);
    // collar edge + neck
    body += path(P([[-0.14, sh - 0.45], [0.12, sh - 0.45], [0.16, sh - 0.05], [-0.2, sh - 0.05]]), SKIN.shade);
    body += path(P([[-0.24, sh - 0.12], [0.06, sh - 0.14], [-0.12, sh + 0.42]]), spec.inner || '#e9e4d8');
    if (spec.sash) body += path(P([[-fw - 0.05, -4.5], [bw + 0.05, -4.5], [bw + 0.05, -4.22], [-fw - 0.06, -4.22]]), spec.sash.col);
    // sleeve (near arm) hanging in front, hand hidden or fist
    const wide = spec.sleeve !== 'narrow';
    const swing = st * 10;
    const cuffY = wide ? -3.25 : -3.55;
    let arm = path(blob([[-0.12, sh + 0.02], [0.18, sh + 0.08], [wide ? 0.32 : 0.2, cuffY], [wide ? -0.3 : -0.12, cuffY + 0.05], [-0.22, sh + 0.9]], 0.4), R.base) +
      line(`M0.05,${sh + 0.6} Q0.12,${(sh + cuffY) / 2} 0.18,${cuffY - 0.1}`, sw * 0.7, R.fold || R.shade);
    if (spec.hands === 'fist') arm += path(blob([[-0.12, cuffY + 0.02], [0.12, cuffY + 0.02], [0.13, cuffY + 0.24], [-0.1, cuffY + 0.27]], 0.5), SKIN.base);
    else arm += path(blob([[wide ? -0.28 : -0.1, cuffY + 0.03], [wide ? 0.3 : 0.18, cuffY - 0.01], [0.02, cuffY + 0.08]], 0.5), R.fold || R.shade);
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

/** Running / falling night silhouette (差拨, 富安): a simple jointed stick-volume figure in one fill. */
export function silFigure(opts = {}) {
  const n = 7.0, H = (opts.height || 560) / n;
  const pose = opts.pose || 'run'; // 'run' | 'fall' | 'stand' | 'cower'
  const fill = opts.fill || '#120C0A', rim = opts.rim, flip = opts.flip ? -1 : 1;
  const limb = (x1, y1, x2, y2, w) => `<path d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" stroke="${fill}" stroke-width="${f(w)}" stroke-linecap="round"/>`;
  let s = '';
  const torso = (cx, cy, ang, w = 0.95, h = 2.4, fat = 0) => `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(ang)})"><path d="${blob([[-w / 2 - fat, -h / 2], [w / 2 + fat, -h / 2], [w / 2 + fat * 1.4, 0], [w / 2 + 0.1, h / 2], [-w / 2 - 0.1, h / 2], [-w / 2 - fat * 1.4, 0]], 0.4)}" fill="${fill}"/></g>`;
  const head = (cx, cy, cap) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="0.42" fill="${fill}"/>` + (cap === 'official' ? `<path d="M${f(cx - 0.45)},${f(cy - 0.18)} L${f(cx + 0.45)},${f(cy - 0.18)} L${f(cx + 0.32)},${f(cy - 0.62)} L${f(cx - 0.32)},${f(cy - 0.62)} Z" fill="${fill}"/><path d="M${f(cx - 0.9)},${f(cy - 0.3)} L${f(cx + 0.9)},${f(cy - 0.3)}" stroke="${fill}" stroke-width="0.07"/>` : cap === 'scarf' ? `<path d="M${f(cx - 0.42)},${f(cy - 0.05)} Q${f(cx)},${f(cy - 0.75)} ${f(cx + 0.42)},${f(cy - 0.05)} Z" fill="${fill}"/>` : '');
  if (pose === 'run') {
    s += torso(0.15, -4.4, 18, 0.9, 2.3, opts.fat || 0);
    s += head(0.62, -6.05, opts.cap);
    s += limb(0.0, -3.3, 0.85, -1.9, 0.36) + limb(0.85, -1.9, 0.75, -0.25, 0.3) + limb(0.75, -0.25, 1.15, -0.15, 0.2); // front leg
    s += limb(-0.05, -3.3, -0.85, -2.2, 0.36) + limb(-0.85, -2.2, -1.55, -1.3, 0.3) + limb(-1.55, -1.3, -1.75, -1.55, 0.2); // back leg
    s += limb(0.35, -5.2, -0.4, -4.4, 0.3) + limb(-0.4, -4.4, -0.75, -3.6, 0.26); // arm back
    s += limb(0.45, -5.2, 1.1, -4.6, 0.3) + limb(1.1, -4.6, 1.5, -5.1, 0.26); // arm forward
    s += `<path d="${blob([[-0.45, -3.6], [0.55, -3.5], [0.9, -2.5], [-0.75, -2.6]], 0.4)}" fill="${fill}"/>`; // coat skirt
  } else if (pose === 'fall') {
    // knocked backwards, off his feet
    s += torso(-0.4, -3.4, -58, 1.05, 2.4, opts.fat || 0.12);
    s += head(-1.55, -4.5, opts.cap);
    s += limb(0.3, -2.7, 1.2, -3.6, 0.38) + limb(1.2, -3.6, 1.9, -3.2, 0.32);
    s += limb(0.25, -2.5, 0.9, -1.4, 0.38) + limb(0.9, -1.4, 1.4, -0.9, 0.32);
    s += limb(-0.9, -4.1, -0.6, -5.5, 0.3) + limb(-0.6, -5.5, -0.2, -6.2, 0.26);
    s += limb(-1.0, -3.9, -1.8, -3.2, 0.3) + limb(-1.8, -3.2, -2.3, -3.5, 0.26);
  } else if (pose === 'cower') {
    // on his back in the snow, hands up pleading
    s += `<g transform="translate(0 -0.55) rotate(-90)">${torso(0, 0, 0, 1.0, 2.4, 0)}</g>`;
    s += head(-1.75, -0.75, opts.cap);
    s += limb(1.0, -0.5, 1.9, -1.3, 0.36) + limb(1.9, -1.3, 2.7, -0.4, 0.3);
    s += limb(1.0, -0.4, 2.0, -0.3, 0.36) + limb(2.0, -0.3, 2.9, -0.15, 0.3);
    s += limb(-0.9, -0.9, -0.9, -2.0, 0.28) + limb(-0.9, -2.0, -0.6, -2.7, 0.24);
    s += limb(-1.2, -0.9, -1.4, -2.1, 0.28) + limb(-1.4, -2.1, -1.1, -2.8, 0.24);
  } else {
    s += torso(0, -4.4, 0, 1.0, 2.4, opts.fat || 0);
    s += head(0, -6.2, opts.cap);
    s += `<path d="${blob([[-0.6, -3.5], [0.6, -3.5], [0.75, -0.4], [-0.75, -0.4]], 0.3)}" fill="${fill}"/>`;
    s += limb(-0.25, -0.5, -0.3, 0, 0.3) + limb(0.25, -0.5, 0.3, 0, 0.3);
    s += limb(-0.55, -5.4, -0.75, -3.6, 0.3) + limb(0.55, -5.4, 0.75, -3.6, 0.3);
  }
  const id = opts.id || 'sil';
  const filt = rim ? `<defs><filter id="${id}rim" x="-30%" y="-30%" width="160%" height="160%"><feMorphology in="SourceAlpha" operator="dilate" radius="${f((opts.rimW || 2.2) / H)}" result="d"/><feFlood flood-color="${rim}"/><feComposite in2="d" operator="in" result="r"/><feOffset in="r" dx="${f((opts.rimDx ?? -1.8) / H)}" dy="${f(-0.6 / H)}" result="ro"/><feMerge><feMergeNode in="ro"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>` : '';
  return `<g data-cast="${opts.name || 'sil'}" transform="translate(${f(opts.x || 0)} ${f(opts.y || 0)}) scale(${f(H * flip)} ${f(H)})">${filt}<g${rim ? ` filter="url(#${id}rim)"` : ''}>${s}</g></g>`;
}
