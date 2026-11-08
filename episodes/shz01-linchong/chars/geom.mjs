// 林冲 rig geometry shared by every style. Front view in a 800x900 box (face centre x=400),
// side view (facing right) in the same box. Expressions are small parametric offsets so
// the same rig can act in the film (brows, lids, gaze, mouth corners, jaw, nostrils).
export const f = (n) => (Math.round(n * 10) / 10).toString();
export const P = (pts) => pts.map((p) => f(p[0]) + ',' + f(p[1]));

export function smooth(pts, closed = true, t = 1) {
  const n = pts.length;
  const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = [p1[0] + ((p2[0] - p0[0]) * t) / 6, p1[1] + ((p2[1] - p0[1]) * t) / 6];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * t) / 6, p2[1] - ((p3[1] - p1[1]) * t) / 6];
    d += `C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}
export const poly = (pts, closed = true) => 'M' + P(pts).join('L') + (closed ? 'Z' : '');
export const mir = (pts, cx = 400) => pts.map(([x, y]) => [2 * cx - x, y]);
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// zig-zag spikes along a polyline (beard bristles: 虎须)
export function spiky(base, amp = 14, every = 2, seed = 1) {
  const out = [];
  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < base.length - 1; i++) {
    const a = base[i], b = base[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const nx = dy / L, ny = -dx / L; // outward normal (left of travel)
    const k = Math.max(2, Math.round(L / 18) * every);
    for (let j = 0; j < k; j++) {
      const t = j / k;
      const p = [a[0] + dx * t, a[1] + dy * t];
      const o = j % 2 === 1 ? amp * (0.7 + 0.6 * rnd()) : 0;
      out.push([p[0] + nx * o, p[1] + ny * o]);
    }
  }
  out.push(base[base.length - 1]);
  return out;
}

export const NEUTRAL = { browIn: 0, browOut: 0, eye: 1, look: [0, 0], mouth: 0, open: 0, jaw: 0, flare: 0, tear: 0, squint: 0 };
export const EXPR = {
  平静: { ...NEUTRAL },
  隐忍: { ...NEUTRAL, browIn: -0.75, eye: 0.74, look: [0, 0.55], mouth: -0.35, jaw: 1, squint: 0.35 },
  怒: { ...NEUTRAL, browIn: -1, browOut: 0.35, eye: 1.18, look: [0, -0.1], mouth: -0.55, open: 0.35, flare: 1 },
  悲: { ...NEUTRAL, browIn: 0.85, browOut: -0.3, eye: 0.7, look: [-0.2, 0.55], mouth: -0.5, tear: 1 },
};

// ---------------------------------------------------------------- front view
export function front(E = NEUTRAL, o = {}) {
  const eyeW = o.eyeW ?? 1, eyeY = o.eyeY ?? 410;
  const faceR = [[400, 246], [474, 250], [528, 272], [548, 330], [560, 410], [558, 482], [542, 560], [514, 622], [468, 668], [400, 684]];
  const face = [...faceR, ...mir(faceR).reverse().slice(1, -1)];
  const earR = [[556, 404], [588, 390], [605, 424], [599, 468], [576, 491], [557, 487]];
  const scarf = [[258, 304], [254, 242], [280, 190], [328, 160], [368, 152], [380, 128], [400, 120], [420, 128], [432, 152], [472, 160], [520, 190], [546, 242], [542, 304], [482, 290], [400, 299], [318, 290]];
  const cornerR = [[498, 196], [568, 168], [606, 170], [590, 188], [548, 210], [522, 236]];
  const band = [[262, 284], [330, 273], [400, 281], [470, 273], [538, 284]];
  // brows (right = image right). browIn<0 knits and lowers the inner end; >0 lifts it.
  const brow = (side) => {
    const s = side; // +1 right, -1 left
    const by = o.browY ?? 0, bt = o.browT ?? 1, arch = o.browArch ?? 1;
    const iy = 368 + by - 15 * E.browIn, ix = 400 + s * (22 + 7 * Math.min(0, E.browIn));
    const oy = 334 + by * 1.2 + (1 - arch) * 22 - 12 * E.browOut + 7 * Math.max(0, E.browIn), ox = 400 + s * 126 * (o.browL ?? 1);
    const m = [400 + s * 72 * (o.browL ?? 1), (iy + oy) / 2 - 11 * arch + 3 * Math.max(0, E.browIn)];
    return [[ix, iy - 13 * bt], [m[0], m[1] - 9 * bt], [ox + s * 8, oy - 1], [m[0], m[1] + 7 * bt], [ix, iy + 12 * bt]];
  };
  // eyes: big and round (环眼); lids open with E.eye, squint lifts the lower lid
  const eye = (side) => {
    const s = side, cx = 400 + s * (o.eyeDX ?? 62), cy = eyeY;
    const op = E.eye * (o.eyeH ?? 1), w = 34 * eyeW;
    const tilt = o.eyeTilt ?? 1;
    const ci = [cx - s * w, cy + 4 * tilt], co = [cx + s * (w + 1), cy - 6 * tilt];
    const up = [[cx - s * w * 0.62, cy - 21 * op], [cx, cy - 26 * op], [cx + s * w * 0.66, cy - 22 * op]];
    const lowY = (18 - 9 * E.squint) * (o.eyeLo ?? 1);
    const lo = [[cx + s * w * 0.62, cy + lowY * 0.85], [cx, cy + lowY], [cx - s * w * 0.62, cy + lowY * 0.8]];
    const white = [ci, ...up, co, ...lo];
    const iris = [cx + E.look[0] * 11, cy + E.look[1] * 7 - 2];
    return { white, upLine: [ci, ...up, co, [co[0] + s * 8, co[1] - 4]], loLine: [co, ...lo, ci], iris, cx, cy, s };
  };
  const nose = [[362, 500], [375, 485], [390, 499], [400, 507], [410, 499], [425, 485], [438, 500]];
  const noseTip = [[384, 492], [390, 470], [400, 462], [410, 470], [416, 492], [400, 500]];
  const sideburnR = [[530, 300], [546, 300], [552, 380], [546, 440], [532, 440], [536, 380]];
  const noseSideR = [[413, 420], [419, 468], [428, 490]];
  const fl = 6 * E.flare;
  const nostrils = [[383 - fl, 497], [417 + fl, 497]];
  const mustR = [[401, 518], [437, 514], [471, 529], [493, 560], [501, 592], [482, 568], [453, 550], [421, 545], [401, 547]];
  const mc = 9 * E.mouth;
  const mouthY = 588;
  const mouthL = [370 - 4 * E.jaw, mouthY - mc + 2 * E.jaw], mouthRr = [430 + 4 * E.jaw, mouthY - mc + 2 * E.jaw];
  const mouth = { l: mouthL, r: mouthRr, up: [400, mouthY - 3], lo: [400, mouthY + 9 + 22 * E.open], open: E.open };
  // beard ring (outer edge spiky), mustache drawn over it
  const ob = [[548, 446], [566, 500], [562, 558], [541, 616], [503, 662], [456, 696], [400, 716]];
  const ba = o.beardAmp ?? 11;
  const outerR = spiky(ob, ba, 1, 7);
  const outerL = mir(spiky(ob, ba, 1, 11)).reverse();
  const innerL = [[256, 452], [280, 506], [304, 556], [336, 598], [372, 612], [400, 616]];
  const innerR = mir(innerL).reverse();
  const beard = [...outerR, ...outerL.slice(1), ...innerL, ...innerR.slice(1)];
  const neck = [[336, 640], [464, 640], [474, 840], [326, 840]];
  const robe = [[40, 900], [70, 818], [190, 768], [326, 732], [400, 770], [474, 732], [610, 768], [730, 818], [760, 900]];
  const innerV = [[342, 734], [400, 808], [458, 734], [470, 760], [400, 900], [330, 760]];
  const trim = [[446, 738], [478, 744], [336, 900], [292, 900]];
  const clench = [[[498, 500], [508, 524]], [[302, 500], [292, 524]]];
  // per-style proportions: fw widens the face, fl stretches everything below the eyes
  const fw = o.fw ?? 1, flen = o.fl ?? 1, Y0 = 430;
  const T = (pts) => pts.map(([x, y]) => [400 + (x - 400) * fw, y <= Y0 ? y : Y0 + (y - Y0) * flen]);
  const Tx = (pts) => pts.map(([x, y]) => [400 + (x - 400) * fw, y]);
  const dyB = (700 - Y0) * (flen - 1);
  const bwF = o.bodyW ?? 1;
  const Td = (pts) => pts.map(([x, y]) => [400 + (x - 400) * bwF, y + dyB]);
  const mT = (q) => T([q])[0];
  const mo = { l: mT(mouth.l), r: mT(mouth.r), up: mT(mouth.up), lo: mT(mouth.lo), open: mouth.open };
  if (o.mouthW) { mo.l[0] = 400 + (mo.l[0] - 400) * o.mouthW; mo.r[0] = 400 + (mo.r[0] - 400) * o.mouthW; }
  return { face: T(face), noseTip: T(noseTip), sideburnR: Tx(sideburnR), sideburnL: Tx(mir(sideburnR)), earR: T(earR), earL: T(mir(earR)), scarf: Tx(scarf),
    cornerR: Tx(cornerR), cornerL: Tx(mir(cornerR)), band: Tx(band), ringR: [400 + 168 * fw, 300], ringL: [400 - 168 * fw, 300],
    browR: brow(1), browL: brow(-1), eyeR: eye(1), eyeL: eye(-1), nose: T(nose), noseSideR: T(noseSideR), nostrils: T(nostrils), mustR: T(mustR), mustL: T(mir(mustR)), mouth: mo,
    beard: T(beard), neck: T(neck).map(([x, y], i) => (i < 2 ? [x, y] : [400 + (x - 400) * Math.min(1, bwF * 1.3), y + dyB])), robe: Td(robe), innerV: Td(innerV), trim: Td(trim), clench: clench.map(T), E, o, T };
}

// ---------------------------------------------------------------- side view (facing right)
export function side(E = NEUTRAL, o = {}) {
  const head = [[520, 282], [546, 336], [556, 372], [552, 396], [570, 438], [592, 472], [588, 488], [574, 496], [568, 512], [574, 528], [562, 541],
    [571, 553], [566, 600], [540, 650], [470, 664], [452, 700], [470, 820], [350, 820], [330, 700], [300, 600], [262, 500], [258, 420], [300, 320], [400, 270]];
  const ear = [[402, 432], [430, 420], [446, 452], [440, 500], [418, 518], [404, 506]];
  const scarf = [[528, 300], [532, 262], [512, 222], [470, 198], [420, 188], [396, 160], [362, 150], [332, 160], [324, 186], [282, 202], [248, 242], [234, 300], [238, 390], [258, 430], [296, 412], [300, 340],
    [360, 300], [450, 292]];
  const corner = [[268, 236], [206, 196], [214, 214], [252, 270]];
  const ribbon = [[262, 430], [236, 520], [224, 640], [250, 660], [262, 540], [286, 440]];
  const ring = [252, 452];
  const iy = 366 - 12 * E.browIn;
  const brow = [[478, iy - 2], [512, iy - 12], [553, 360 - 8 * E.browOut], [548, 372 + 0], [510, iy + 8], [480, iy + 10]];
  const op = E.eye;
  const eye = { cx: 516, cy: 402, up: [[494, 398], [512, 402 - 15 * op], [538, 404]], lo: [[538, 404], [520, 413 - 4 * E.squint], [498, 406]], iris: [527 + 4 * E.look[0], 403 + 4 * E.look[1]] };
  const nostril = [[566 - 3 * E.flare, 480], [580, 488]];
  const must = [[566, 506], [578, 512], [566, 530], [546, 548], [528, 572], [530, 546], [548, 520]];
  const mc = 6 * E.mouth;
  const mouth = [[570, 543], [556, 545 - mc]];
  const beard = [...spiky([[452, 440], [470, 520], [520, 560], [566, 556], [590, 596], [586, 650], [560, 694], [500, 700], [450, 680]], 10, 1, 5),
    [440, 640], [420, 560], [418, 470]];
  const neck = [[440, 640], [470, 640], [480, 820], [350, 820], [360, 690]];
  const robe = [[200, 900], [230, 790], [330, 740], [430, 728], [520, 760], [590, 820], [610, 900]];
  const collar = [[430, 728], [520, 760], [560, 900], [500, 900], [470, 790], [410, 740]];
  const flen = o.fl ?? 1, Y0 = 430, es = o.eyeS ?? 1, bw = o.bodyW ?? 1;
  const T = (pts) => pts.map(([x, y]) => [x, y <= Y0 ? y : Y0 + (y - Y0) * flen]);
  const dyB = (700 - Y0) * (flen - 1);
  const B = (pts) => pts.map(([x, y]) => [420 + (x - 420) * bw, y + dyB]);
  const ES = (pts) => pts.map(([x, y]) => [eye.cx + (x - eye.cx) * es, eye.cy + (y - eye.cy) * es]);
  const eyeT = { cx: eye.cx, cy: eye.cy, up: ES(eye.up), lo: ES(eye.lo), iris: ES([eye.iris])[0], r: 12 * es };
  const headT = T(head).map(([x, y], i) => (y > 640 + dyB ? [420 + (x - 420) * Math.min(1, bw * 1.2), y] : [x, y]));
  return { head: headT, ear, scarf, corner, ribbon: T(ribbon), ring, brow, eye: eyeT, nostril, must: T(must), mouth: T(mouth), beard: T(beard),
    neck: B(neck).map(([x, y], i) => (i < 2 ? [x, y - dyB * 0.5] : [x, y])), robe: B(robe), collar: B(collar), E };
}
