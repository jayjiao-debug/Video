// SCULPTED HAIR of 采访罗密欧与朱丽叶 (v3, 23 Nov 2026). The owner, on v2: "we greatly improved on the character designs,
// hair etc for 鲁迅, 拉的女儿 ... make juliet blonde and 大小姐 looking, romeo more charming, the hair matters a lot".
// What those two films did (their code and sheets, read on the Drive on 23 Nov): the hair is a SOLID that wraps the
// head, not paint on the ball, so it has a silhouette of its own from every side (鲁迅's upright brush, 拉的女儿's blunt
// wig); it carries its own painted strands (鲁迅: short matte bristle strokes; 拉的女儿: broad sheen bands and a gold
// diadem); its edge tucks into the skin, so it never stands off the head as a plate; and it covers the back of the
// head down to the nape. The same here, in this film's own folder (the rig is only used, never edited):
//   hairShell(o)  the wrapped crown: from a hairline (by azimuth, with pointed locks at the face) up over a dome of its
//                 own volume; painted strands, a parting and a shine ring (天使环). name "hairShell"
//                 Its edge stays above the brows at the face and above the eye line wherever the drawn face can slide
//                 to: the rig keeps the face within 12 deg of the lens, so on a head turned well away the eyes reach
//                 about 85 deg round. Below the shell the look's own painted hair shows, and the face is drawn over that.
//   drills(o)     JULIET: two drill curls (縦ロール) hanging from behind her ears, each tied with a ribbon bow. name "drills"
//   tiara(o)      JULIET: a low gold tiara over her crown: a red stone in the middle, pearls on its points. name "tiara"
//   comma(o)      ROMEO: the curl at the end of his swept fringe (逗号刘海), turned in over his brow. name "comma"
// Head units: the head's radius = 1; x = the person's left, y = up, z = the face side, from the head's centre.
import * as THREE from "three";
import type { Acc, PartKit } from "../../group/kit/rig3d";
import { shade } from "../../group/kit/rigacc/shapes";
import { leafGeo, meshOf, weld } from "../../wanbi/acc/envoy";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
const sm = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** a fixed hash in 0..1 (the same strands on every render) */
const hash = (i: number, s: number) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const rgb = (col: string) => { const c = new THREE.Color(col); return [c.r * 255, c.g * 255, c.b * 255] as const; };

// ------------------------------------------------------------------------------------------------------- the shell
/** a pointed lock of the fringe: centred at azimuth a (deg from the face, + = the person's left), w deg to each side,
 *  its tip len head units below the hairline; lean -1 .. 1 moves the tip toward one side (a swept fringe) */
export type Lock = { a: number; w: number; len: number; lean?: number };
export type ShellO = {
  /** the hairline's height (y on the ball) at the face between the locks, at the temples (58 deg), over the ears
   *  (95 deg) and at the nape (150 deg on) */
  front: number; temple: number; side: number; back: number;
  locks?: Lock[];
  /** thickness (head units) at the face, over the ears, at the back; top = the dome's radius at the crown (its volume) */
  thF: number; thS: number; thB: number; top: number;
  /** degrees over which the thickness comes up at the face (a soft edge; default 9) and at the back (a blunt one: 2.5) */
  featherF?: number; featherB?: number;
  /** the colours: col = the hair, light / deep = its strands, ring = the shine ring (null = none); ringEl = the
   *  ring's top edge (deg up from the head's middle; default 56: round the crown. Under a hat it goes lower, where
   *  the back of the head shows below the band) */
  col: string; light?: string; deep?: string; ring?: string | null; ringEl?: number;
  /** the ring's strength (default 0.7) and the number of points round its lower edge (default 36) */
  ringA?: number; ringN?: number;
  /** azimuth of the parting (deg; null = none); paint = "hair" (glossy, default) or "cloth" (matte) */
  part?: number | null; paint?: "hair" | "cloth";
  /** a lift on the dome: h head units more at azimuth a, elevation el (deg), falling off over w deg (a forelock that
   *  rises over the brow, a fuller crown) */
  lift?: { a: number; el: number; w: number; h: number }[];
  /** relief: each fringe lock swells out by `relief` at its middle (creases between them, so the bangs read as locks,
   *  not as a helmet's lip); ridges = n locks round the sides and back, `amp` deep, fading toward the crown and the face */
  relief?: number; ridges?: { n: number; amp: number; from?: number };
  /** hat = rim (deg from the crown): the shell tells the rig it is a hat that cuts the painted hair back to rim - 22 in
   *  front, so the rig's own drawn hairline (52 deg) cannot show as a band under the fringe's notches. The shell then
   *  takes the "hat" and "crown" slots, so it cannot go with a real hat (the beret) */
  hat?: number;
  /** the thickness at the very edge of the hair (head units; default 0.018): a thin edge with an ink line */
  edge?: number;
  /** where the side's height holds to (deg; default 95) and where the back's begins (default 150). The hair has to stay
   *  above y 0.35 out to 100 deg (the face slides round toward the lens); behind that it can drop fast, so the skin
   *  behind the ear does not show as a long slanted cut in a three-quarter back view */
  sideTo?: number; backFrom?: number;
};
/** the hairline as elevations (rad) every 0.5 deg round the head, once per cut */
const HL = new WeakMap<ShellO, Float64Array>();
const hlTab = (o: ShellO) => {
  let t = HL.get(o);
  if (!t) { t = new Float64Array(720); for (let i = 0; i < 720; i++) t[i] = Math.asin(clamp(hairlineY(o, -180 + i * 0.5), -0.97, 0.97)); HL.set(o, t); }
  return t;
};
/** the distance (rad, across the ball) from (aDeg, el) to the nearest point of the hairline within 40 deg round */
const edgeDist = (o: ShellO, aDeg: number, el: number) => {
  const t = hlTab(o), i0 = Math.round((aDeg + 180) * 2);
  let best = Infinity;
  for (let k = -80; k <= 80; k++) {
    const e2 = t[(((i0 + k) % 720) + 720) % 720], dx = rad(k * 0.5) * Math.cos((el + e2) / 2), dy = el - e2, d = dx * dx + dy * dy;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
};
/** the hairline's height at azimuth aDeg (see ShellO) */
export const hairlineY = (o: ShellO, aDeg: number) => {
  const a = Math.abs(aDeg);
  const s0 = o.sideTo ?? 95, b0 = o.backFrom ?? 150;
  const base = a <= 28 ? o.front : a <= 58 ? lerp(o.front, o.temple, sm((a - 28) / 30)) : a <= s0 ? lerp(o.temple, o.side, sm((a - 58) / (s0 - 58))) : a <= b0 ? lerp(o.side, o.back, sm((a - s0) / (b0 - s0))) : o.back;
  let dip = 0;
  for (const L of o.locks ?? []) {
    const x = (aDeg - L.a) / L.w;
    if (Math.abs(x) >= 1) continue;
    const tip = clamp((L.lean ?? 0) * 0.6, -0.8, 0.8), s = x < tip ? (x + 1) / (tip + 1) : (1 - x) / (1 - tip);
    dip = Math.max(dip, L.len * Math.pow(s, 1.6));
  }
  return base - dip;
};
/** the map's height for an elevation (deg): v = 0 at EL0 .. 1 at the crown, the same on every column (the shine ring
 *  is level round the head) */
const EL0 = -72, NC = 360, NR = 44;
const vOf = (elDeg: number) => clamp((elDeg - EL0) / (90 - EL0), 0, 1);
/** the shell's outer radius at azimuth aDeg and elevation el (rad) */
const shellR = (o: ShellO, aDeg: number, el: number) => {
  const A = Math.abs(aDeg), el0 = Math.asin(clamp(hairlineY(o, aDeg), -0.97, 0.97));
  const th = A < 100 ? lerp(o.thF, o.thS, sm((A - 30) / 50)) : lerp(o.thS, o.thB, sm((A - 100) / 70));
  const F = lerp(o.featherF ?? 9, o.featherB ?? 2.5, sm((A - 90) / 60)), lip = Math.max(o.edge ?? 0.018, th * (1 - sm((F - 2.5) / 4)));
  // the thickness comes up with the distance to the hairline across the ball, not straight up the column: up the steep
  // side of a lock the column's own height over its hairline is several times the true distance, and the lock came out
  // a slab with a wall down each side (inked: a black line up every notch, a plank on Romeo's crown)
  const ramp = sm(edgeDist(o, aDeg, el) / rad(F));
  let dome = th + (o.top - 1 - th) * Math.pow(Math.max(0, Math.sin(el)), 1.6);
  for (const L of o.lift ?? []) {
    // (the angle on the ball between this point and the lift's middle)
    const e = (el * 180) / Math.PI, da = Math.abs(((aDeg - L.a + 540) % 360) - 180) * Math.cos(rad((e + L.el) / 2)), d = Math.hypot(da, e - L.el);
    dome += L.h * Math.exp(-((d / L.w) ** 2));
  }
  let rel = 0;
  if (o.relief) {
    let k = 0;
    // a soft round swell per lock (a cusp between locks drew an ink crease up every notch: folded paper, not hair)
    // (overlapping locks join as 1 - (1 - a)(1 - b): a max() of the two left a crease where they cross)
    let miss = 1;
    for (const L of o.locks ?? []) { const x = Math.abs((aDeg - L.a) / L.w); if (x < 1) miss *= 1 - (0.5 + 0.5 * Math.cos(Math.PI * x)); }
    k = 1 - miss;
    rel += o.relief * k * (1 - sm((el - el0) / rad(18)));
  }
  if (o.ridges) {
    const ph = ((((aDeg + 180) / 360) * o.ridges.n) % 1 + 1) % 1, tri = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);   // rounded locks (pointed ones read as facets)
    rel += o.ridges.amp * tri * sm((A - (o.ridges.from ?? 45)) / 30) * (1 - Math.pow(Math.max(0, Math.sin(el)), 3));
  }
  return { r: 1 + Math.max(lip, dome * ramp) + rel * ramp, el0, lip };
};
/** the shell's surface point at (azimuth deg, elevation rad), in head units */
export const shellPoint = (o: ShellO, aDeg: number, el: number, out = 0) => {
  const a = rad(aDeg), r = shellR(o, aDeg, el).r + out, ce = Math.cos(el);
  return V(r * ce * Math.sin(a), r * Math.sin(el), r * ce * Math.cos(a));
};
const shellGeo = (b: PartKit, o: ShellO) => {
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), ROWS = NR + 3;
  for (let j = 0; j <= NC; j++) {
    const aDeg = -180 + (360 * j) / NC, a = rad(aDeg), u = j / NC, { el0, lip } = shellR(o, aDeg, 0);
    const put = (el: number, r: number) => { const ce = Math.cos(el); b.toM(v.set(r * ce * Math.sin(a), r * Math.sin(el), r * ce * Math.cos(a))); pos.push(v.x, v.y, v.z); uv.push(u, vOf((el * 180) / Math.PI)); };
    // the edge tucks into the skin (an edge that just stops stands off the head and shows as a forked spike), then its
    // lip (as thick as the hair at a blunt edge, nothing at a soft one), then up over the dome to the crown
    put(el0 - rad(4), 0.93); put(el0, 0.995); put(el0, 1 + lip);
    for (let i = 1; i <= NR; i++) { const el = el0 + (Math.PI / 2 - el0) * (i / NR); put(el, shellR(o, aDeg, el).r); }
  }
  for (let j = 0; j < NC; j++) for (let i = 0; i < ROWS - 1; i++) {
    const A0 = j * ROWS + i, B0 = (j + 1) * ROWS + i;
    idx.push(A0, B0, A0 + 1, B0, B0 + 1, A0 + 1);
  }
  return outward(meshOf(pos, uv, idx), pos, uv, idx);
};
/** the same mesh with its faces turned if its normals point into the middle (checked at the middle of the vertex list) */
const outward = (g: THREE.BufferGeometry, pos: number[], uv: number[], idx: number[], centre = V()) => {
  const P = g.attributes.position, N = g.attributes.normal;
  let s = 0;
  for (let i = 0; i < P.count; i += 7) s += (P.getX(i) - centre.x) * N.getX(i) + (P.getY(i) - centre.y) * N.getY(i) + (P.getZ(i) - centre.z) * N.getZ(i);
  if (s >= 0) return g;
  for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
  return meshOf(pos, uv, idx);
};
/** the shell's paint: the hair's colour in broad soft bands (lighter down the middle of every lock of the relief, as
 *  拉的女儿's wig had its sheen bands), a dark crease up from every notch of the fringe, a few long fine strands, the
 *  shine ring (天使环) and the parting */
const shellMap = (b: PartKit, o: ShellO, key: string) => b.tex(1024, 512, (g) => {
  const W = 1024, H = 512, X = (aDeg: number) => ((aDeg + 180) / 360) * W, Y = (elDeg: number) => H * (1 - vOf(elDeg));
  const light = o.light ?? shade(o.col, 1.3), deep = o.deep ?? shade(o.col, 0.7);
  g.fillStyle = o.col; g.fillRect(0, 0, W, H);
  // broad bands: one light band down the middle of each lock round the sides and back, soft at its edges
  const n = o.ridges?.n ?? 16;
  for (let i = 0; i < n; i++) {
    const x = ((i + 0.5) / n) * W, w = (W / n) * 0.42, gr = g.createLinearGradient(x - w, 0, x + w, 0);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, light); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = 0.35; g.fillStyle = gr; g.fillRect(x - w, 0, 2 * w, H);
  }
  // the fringe's locks: lit down their middles, a dark crease up from each notch between them
  const locks = [...(o.locks ?? [])].sort((p, q) => p.a - q.a);
  for (const L of locks) {
    const gr = g.createLinearGradient(X(L.a - L.w * 0.7), 0, X(L.a + L.w * 0.7), 0);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, light); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.globalAlpha = 0.45; g.fillStyle = gr; g.fillRect(X(L.a - L.w * 0.7), Y(55), X(L.a + L.w * 0.7) - X(L.a - L.w * 0.7), Y(-40) - Y(55));
  }
  g.globalAlpha = 0.3; g.strokeStyle = deep; g.lineCap = "round";
  for (let i = 0; i + 1 < locks.length; i++) {
    const A = locks[i], B = locks[i + 1];
    if (A.a + A.w < B.a - B.w - 2) continue;
    const xa = X((A.a + A.w + B.a - B.w) / 2);
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(xa, Y(10)); g.quadraticCurveTo(xa + 3, Y(30), xa + 6, Y(44)); g.stroke();
  }
  // a few long fine strands round the sides and back only (on the front they read as corrugation at phone size)
  for (let i = 0; i < 90; i++) {
    const aD = 60 + 240 * hash(i, 1), x = X(aD > 180 ? aD - 360 : aD), y0 = Y(EL0 + 162 * (0.1 + 0.5 * hash(i, 3))), y1 = y0 - H * (0.2 + 0.3 * hash(i, 4)), wv = (hash(i, 7) - 0.5) * 16;
    g.strokeStyle = hash(i, 5) < 0.5 ? deep : light; g.globalAlpha = 0.1 + 0.15 * hash(i, 6); g.lineWidth = 1.4 + 2 * hash(i, 2);
    g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + wv, (y0 + y1) / 2, x + wv * 0.4, y1); g.stroke();
  }
  // the shine ring (天使环): one band of light round the head at about 50 deg, its lower edge in points (short upright
  // strokes side by side read as corrugation at phone size: the band is one shape)
  if (o.ring !== null) {
    const r0 = o.ringEl ?? 56;
    const nT = o.ringN ?? 36;
    g.fillStyle = o.ring ?? shade(o.col, 1.5); g.globalAlpha = o.ringA ?? 0.7;
    g.beginPath(); g.moveTo(0, Y(r0));
    for (let x = 0; x <= W; x += 6) g.lineTo(x, Y(r0 + 1.5 * Math.sin(x * 0.05) + 1.2 * hash(x, 15)));
    // a few broad points (thin teeth read as a scribble at phone size)
    for (let i = nT; i >= 0; i--) { const x = (i / nT) * W; g.lineTo(x, Y(r0 - 8 - 1.5 * hash(i, 16))); if (i) g.lineTo(x - W / (2 * nT), Y(r0 - 15.5 - 3 * hash(i, 17))); }
    g.closePath(); g.fill();
  }
  g.globalAlpha = 1;
  if (o.part !== null && o.part !== undefined) {
    g.strokeStyle = shade(o.col, 0.5); g.lineWidth = 4;
    g.beginPath(); g.moveTo(X(o.part), Y(36)); g.quadraticCurveTo(X(o.part * 0.85), Y(62), X(o.part * 0.6), Y(84)); g.stroke();
  }
}, key);
export const hairShell = (o: ShellO): Acc => {
  const key = ["rjShell", JSON.stringify(o)].join("|");
  return {
    name: "hairShell", slots: o.hat ? ["hat", "crown"] : [], key, noHairProps: true,
    ...(o.hat ? { hat: { rim: o.hat, hair: "cut" as const, shade: false } } : {}),
    build(b) {
      const map = shellMap(b, o, key);
      b.solid("head", shellGeo(b, o), { col: "#ffffff", map, paint: o.paint ?? "hair", ink: 0.0085 });
    },
  };
};

// ------------------------------------------------------------------------------------------------------- Juliet
/** a twisted cone (a drill curl) along the curve p0 -> p1 -> p2 (head units): r0 thick at the root, r1 at the tip,
 *  `turns` coils whose grooves cut `amp` deep; wind = which way it winds (+1 / -1). Closed at both ends. */
const drillGeo = (b: PartKit, p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, r0: number, r1: number, turns: number, amp: number, wind: number) => {
  const NS = 110, NCd = 30, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), c = V(), T = V(), N0 = V(), B = V();
  const at = (t: number) => { const s = 1 - t; return c.set(0, 0, 0).addScaledVector(p0, s * s).addScaledVector(p1, 2 * s * t).addScaledVector(p2, t * t); };
  b.toM(v.copy(p0)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, s = 1 - t;
    T.set(0, 0, 0).addScaledVector(p0, -2 * s).addScaledVector(p1, 2 * s - 2 * t).addScaledVector(p2, 2 * t).normalize();
    N0.set(1, 0, 0).addScaledVector(T, -T.x).normalize(); B.crossVectors(T, N0);
    // (round at the root, where it comes out from under the bow; a point at the tip)
    const R0 = lerp(r1, r0, Math.pow(s, 0.8)) * Math.pow(Math.sin(Math.min(1, t / 0.08) * (Math.PI / 2)), 0.6) * Math.pow(Math.sin(Math.min(1, s / 0.05) * (Math.PI / 2)), 0.5);
    at(t);
    for (let j = 0; j <= NCd; j++) {
      const th = (j / NCd) * Math.PI * 2, q = (((t * turns + (wind * j) / NCd) % 1) + 1) % 1, bump = 1 - (2 * q - 1) ** 2;
      const rr = R0 * (1 + amp * (bump - 0.62));
      b.toM(v.copy(c).addScaledVector(N0, rr * Math.cos(th)).addScaledVector(B, rr * Math.sin(th)));
      pos.push(v.x, v.y, v.z); uv.push(j / NCd, t);
    }
  }
  b.toM(v.copy(p2)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const R = (i: number, j: number) => 1 + (i - 1) * (NCd + 1) + j, end = 1 + (NS - 1) * (NCd + 1);
  for (let j = 0; j < NCd; j++) { idx.push(0, R(1, j + 1), R(1, j)); idx.push(end, R(NS - 1, j), R(NS - 1, j + 1)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NCd; j++) idx.push(R(i, j), R(i, j + 1), R(i + 1, j), R(i, j + 1), R(i + 1, j + 1), R(i + 1, j));
  // (the normals must point away from the middle line: checked against the curve's middle)
  const g = meshOf(pos, uv, idx), P = g.attributes.position, N = g.attributes.normal, m = R(NS >> 1, 0), mid = b.toM(at(0.5).clone());
  if ((P.getX(m) - mid.x) * N.getX(m) + (P.getY(m) - mid.y) * N.getY(m) + (P.getZ(m) - mid.z) * N.getZ(m) < 0) {
    for (let i = 0; i < idx.length; i += 3) { const t2 = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t2; }
    return meshOf(pos, uv, idx);
  }
  return g;
};
/** the drill's paint: dark in the grooves, a lit crest on every coil, fine strands that run round with the coil */
const drillMap = (b: PartKit, col: string, light: string, deep: string, turns: number, wind: number, key: string) => b.tex(128, 1024, (g) => {
  const W = 128, H = 1024, img = g.createImageData(W, H), C = rgb(col), L = rgb(light), D = rgb(deep);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = x / W, t = 1 - y / H, q = (((t * turns + wind * u) % 1) + 1) % 1;
    // 0 in the groove .. 1 on the crest
    const crest = 1 - Math.abs(2 * q - 1), groove = 1 - sm(crest / 0.22), lit = sm((crest - 0.62) / 0.16) * (1 - sm((crest - 0.9) / 0.1)) * 0.85;
    const strand = 0.5 + 0.5 * Math.sin(q * Math.PI * 2 * 7 + Math.sin(u * 40) * 0.6), k = 0.1 * strand;
    const mix = (i: number) => C[i] * (1 - groove * 0.75 - k) + D[i] * groove * 0.75 + (L[i] - C[i]) * lit + D[i] * k;
    const o = (y * W + x) * 4;
    img.data[o] = clamp(mix(0), 0, 255); img.data[o + 1] = clamp(mix(1), 0, 255); img.data[o + 2] = clamp(mix(2), 0, 255); img.data[o + 3] = 255;
  }
  g.putImageData(img, 0, 0);
}, key);
/** a ribbon bow, its face toward `face` (head units): two loops, a knot, two short tails. Each part is a solid of its
 *  own (balls squashed and turned: a ribbon's flat plate would show its hull edge-on) */
const bow = (b: PartKit, at: THREE.Vector3, face: THREE.Vector3, k: number, col: string) => {
  const R = b.R, f = face.clone().normalize(), up = V(0, 1, 0), side = V().crossVectors(up, f).normalize(), u2 = V().crossVectors(f, side);
  const basis = new THREE.Matrix4().makeBasis(side, u2, f), q = new THREE.Quaternion().setFromRotationMatrix(basis);
  const part = (geo: THREE.BufferGeometry, x: number, y: number, rot: number, c: string, ink: number) => {
    const m = b.solid("head", weld(geo), { col: c, ink });
    const p = at.clone().addScaledVector(side, x * k).addScaledVector(u2, y * k);
    b.toM(p); m.position.copy(p);
    m.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), rot));
    return m;
  };
  for (const s of [-1, 1]) {
    const loop = new THREE.SphereGeometry(R * 0.15 * k, 18, 12); loop.scale(1.25, 0.72, 0.42);
    part(loop, s * 0.16, 0.035, s * 0.38, col, 0.006);
    const tail = new THREE.SphereGeometry(R * 0.11 * k, 14, 10); tail.scale(0.55, 1.5, 0.35);
    part(tail, s * 0.08, -0.17, s * 0.42, shade(col, 0.88), 0.0055);
  }
  const knot = new THREE.SphereGeometry(R * 0.075 * k, 14, 10); knot.scale(1, 0.95, 0.7);
  part(knot, 0, 0.01, 0, shade(col, 0.92), 0.006);
};
/** JULIET'S DRILL CURLS (see the head of this file): col / light / deep = the hair; len = how far below the head's middle
 *  they end (head units); ribbon = the bows' colour (false = none) */
export const drills = (o: { col: string; light?: string; deep?: string; len?: number; r?: number; turns?: number; ribbon?: string | false; size?: number }): Acc => {
  const len = o.len ?? 2.25, r = o.r ?? 0.27, turns = o.turns ?? 5, ribbon = o.ribbon === undefined ? "#c4202e" : o.ribbon, light = o.light ?? shade(o.col, 1.3), deep = o.deep ?? shade(o.col, 0.62);
  const key = ["rjDrills", o.col, light, deep, len, r, turns, ribbon, o.size ?? 1].join("|");
  return {
    name: "drills", slots: [], key,
    build(b) {
      for (const s of [-1, 1]) {
        // from the side of the head (95 deg round: past where the drawn face can slide), out past the jaw and down in
        // front of the shoulder, so the two of them frame her face
        const p0 = V(s * 0.9, 0.4, -0.16), p1 = V(s * 1.26, -0.5, -0.04), p2 = V(s * 1.1, -len, 0.1);
        const map = drillMap(b, o.col, light, deep, turns, s, key + "|" + s);
        b.solid("head", drillGeo(b, p0, p1, p2, r, 0.03, turns, 0.5, s), { col: "#ffffff", map, paint: "hair", ink: 0.0075 });
        if (ribbon) bow(b, V(s * 1.03, 0.38, 0.16), V(s * 0.45, 0.2, 0.87), 1.3 * (o.size ?? 1), ribbon);
      }
    },
  };
};
/** a band swept along the curve pt(t) (head units, t 0 .. 1): w wide along the surface, th thick out from the head */
const bandGeo = (b: PartKit, pt: (t: number) => THREE.Vector3, w: number, th: number, n = 64) => {
  const NCb = 12, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V(), T = V(), Rd = V(), Wd = V();
  for (let i = 0; i <= n; i++) {
    const t = i / n, c = pt(t), c2 = pt(Math.min(1, t + 0.01)), c1 = pt(Math.max(0, t - 0.01));
    T.subVectors(c2, c1).normalize(); Rd.copy(c).normalize(); Wd.crossVectors(T, Rd).normalize(); Rd.crossVectors(Wd, T).normalize();
    const e = Math.pow(Math.sin(Math.min(1, Math.min(t, 1 - t) / 0.04) * (Math.PI / 2)), 0.5);
    for (let j = 0; j <= NCb; j++) {
      const p = (j / NCb) * Math.PI * 2;
      b.toM(v.copy(c).addScaledVector(Wd, (w / 2) * e * Math.cos(p)).addScaledVector(Rd, (th / 2) * e * Math.sin(p)));
      pos.push(v.x, v.y, v.z); uv.push(j / NCb, t);
    }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < NCb; j++) { const A0 = i * (NCb + 1) + j, B0 = A0 + NCb + 1; idx.push(A0, B0, A0 + 1, A0 + 1, B0, B0 + 1); }
  const g = meshOf(pos, uv, idx), P = g.attributes.position, N = g.attributes.normal, m = (n >> 1) * (NCb + 1), mid = b.toM(pt(0.5).clone());
  if ((P.getX(m) - mid.x) * N.getX(m) + (P.getY(m) - mid.y) * N.getY(m) + (P.getZ(m) - mid.z) * N.getZ(m) < 0) {
    for (let i = 0; i < idx.length; i += 3) { const t2 = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t2; }
    return meshOf(pos, uv, idx);
  }
  return g;
};
/** JULIET'S TIARA (see the head of this file): it lies on the hair shell `on` (the same ShellO), ear to ear, leaning
 *  `lean` deg toward the face; gold / gem / pearl = its colours */
export const tiara = (o: { on: ShellO; lean?: number; gold?: string; gem?: string; pearl?: string; span?: number }): Acc => {
  const lean = rad(o.lean ?? 28), gold = o.gold ?? "#d9a531", gem = o.gem ?? "#c4202e", pearl = o.pearl ?? "#fbf6ea", span = o.span ?? 72;
  return {
    name: "tiara", slots: [], key: ["rjTiara", JSON.stringify(o.on), lean, gold, gem, pearl, span].join("|"),
    build(b) {
      // a point on the arc over the head (phi = 0 on top, + toward the person's left) at the shell's surface
      const dirOf = (phi: number) => V(Math.sin(phi), Math.cos(phi) * Math.cos(lean), Math.cos(phi) * Math.sin(lean));
      const onShell = (phi: number, out: number) => {
        const d = dirOf(phi), el = Math.asin(clamp(d.y, -1, 1)), aDeg = (Math.atan2(d.x, d.z) * 180) / Math.PI;
        return shellPoint(o.on, aDeg, el, out);
      };
      const pt = (t: number) => onShell(rad(lerp(-span, span, t)), 0.022);
      b.solid("head", bandGeo(b, pt, 0.085, 0.045), { col: gold, ink: 0.006 });
      // pearls set along it (the points of a crown read as nails at phone size), the red stone in the middle
      for (const phiD of [-56, -44, -32, -20, 20, 32, 44, 56]) {
        const pr = b.solid("head", weld(new THREE.SphereGeometry(b.R * 0.034, 12, 9)), { col: pearl, ink: 0.0045 });
        pr.position.copy(b.toM(onShell(rad(phiD), 0.06)));
      }
      for (const s2 of [-1, 1]) {
        const leaf = new THREE.SphereGeometry(b.R * 0.05, 12, 9); leaf.scale(1.3, 0.75, 0.6);
        const lf = b.solid("head", weld(leaf), { col: gold, ink: 0.005 }), lp = onShell(rad(s2 * 8.5), 0.055);
        lf.position.copy(b.toM(lp.clone())); lf.quaternion.setFromUnitVectors(V(0, 0, 1), lp.clone().normalize());
      }
      const gp = onShell(0, 0.075), stone = new THREE.SphereGeometry(b.R * 0.078, 16, 12); stone.scale(0.85, 1.05, 0.55);
      const st = b.solid("head", weld(stone), { col: gem, ink: 0.0055 });
      st.position.copy(b.toM(gp.clone())); st.quaternion.setFromUnitVectors(V(0, 0, 1), gp.clone().normalize());
    },
  };
};

/** LOCKS THAT HANG BESIDE THE FACE from the shell's edge over the ears: one per entry, at azimuth a (deg, + = the
 *  person's left; keep |a| at 92 or more, past where the drawn face can slide), from y0 down to y1 (head units), wide,
 *  standing out to radius r and curling its tip `curl` toward the face. They frame the face from the front (the hime
 *  cut's side locks) and cover the step under the shell's side edge */
export const sideLocks = (o: { col: string; locks: { a: number; y0?: number; y1: number; wide?: number; r?: number; curl?: number; peak?: number }[] }): Acc => ({
  name: "sideLocks", slots: [], key: ["rjSideLocks", o.col, JSON.stringify(o.locks)].join("|"),
  build(b) {
    const map = b.tex(64, 256, (g) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
      g.strokeStyle = "#b9b2a8"; g.lineWidth = 2.2; for (let x = 4; x < 64; x += 9) { g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 4, 128, x + 1, 256); g.stroke(); }
    }, "rjLockStrands");
    for (const L of o.locks) {
      const a = rad(L.a), sa = Math.sin(a), ca = Math.cos(a), r = L.r ?? 1.16, y0 = L.y0 ?? 0.45, cu = L.curl ?? 0.12;
      const p0 = V(sa * 0.98, y0, ca * 0.98), p1 = V(sa * (r + 0.06), lerp(y0, L.y1, 0.45), ca * (r + 0.06) + 0.04), p2 = V(sa * (r - 0.04) - Math.sign(sa) * cu, L.y1, ca * r + cu);
      b.solid("head", leafGeo(b.toM, p0, p1, p2, L.wide ?? 0.3, 0.12, L.peak ?? 0.25), { col: o.col, map, paint: "hair", ink: 0.0075 });
    }
  },
});

// ------------------------------------------------------------------------------------------------------- Romeo
/** ROMEO'S COMMA CURL (see the head of this file): the end of his swept lock, turned in over his right brow. It stays
 *  above the brow (y 0.36 and up) */
export const comma = (o: { col: string; side?: 1 | -1; size?: number }): Acc => {
  const s = o.side ?? -1, k = o.size ?? 1;
  return {
    name: "comma", slots: [], key: ["rjComma", o.col, s, k].join("|"),
    build(b) {
      const lock = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number) => b.solid("head", leafGeo(b.toM, p0, p1, p2, wide, deep, 0.35), { col: o.col, paint: "hair", ink: 0.006 });
      // from the swept lock's tip out over the brow and back in toward the middle of the forehead: a hook
      lock(V(s * 0.62, 0.6, 0.74), V(s * 0.58 * k, 0.3, 1.02), V(s * 0.3, 0.4, 0.98), 0.17 * k, 0.08);
    },
  };
};
/** ROMEO: a few pointed locks that flick up and out of the back of his crown (tousled, not combed flat), on the shell `on` */
export const crownFlicks = (o: { col: string; on: ShellO }): Acc => ({
  name: "crownFlicks", slots: [], key: ["rjCrownFlicks", o.col, JSON.stringify(o.on)].join("|"),
  build(b) {
    for (const [aD, elD, len, lean] of [[-150, 40, 0.34, -0.5], [170, 36, 0.3, 0.3], [130, 44, 0.26, 0.6]] as number[][]) {
      const root = shellPoint(o.on, aD, rad(elD), -0.06), out = root.clone().normalize(), side = V(Math.cos(rad(aD)), 0, -Math.sin(rad(aD)));
      const p1 = root.clone().addScaledVector(out, len * 0.6).addScaledVector(side, lean * 0.1), p2 = root.clone().addScaledVector(out, len).add(V(0, -len * 0.25, 0)).addScaledVector(side, lean * 0.22);
      b.solid("head", leafGeo(b.toM, root, p1, p2, 0.2, 0.08, 0.3), { col: o.col, paint: "hair", ink: 0.007 });
    }
  },
});
