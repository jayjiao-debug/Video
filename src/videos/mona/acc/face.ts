// THE FACE of 采访蒙娜丽莎的一天 (look test, 23 Nov 2026). The owner: "we must get her face correct and her visuals
// perfect, give me your best shot with our character setup". The rig (group/kit/rig3d.ts) is only used: everything here
// is DRAWN on the face (the kit's "face" rule), in u = 1 % of the head's width from the middle of the eye line (x =
// screen right, y = down). Nothing random, nothing per frame.
// What makes the painted face hers, read off the panel (Louvre INV 779), and how each is said in the series' drawing:
//   1. NO EYEBROWS, a high bare forehead        the rig's brows are wiped; when she acts (off duty) a faint ridge of
//                                               shade stands where a brow would move, so the acting still reads
//   2. HEAVY LIDS over almond eyes that look    an almond with a pale white, a brown iris half under the lid, the
//      sideways at you                          lid's fold as a second fine line above it, a soft lower lid
//   3. THE SMILE: a closed mouth, almost level, a fine lip line with both corners tucked up into a smudge of shade
//      its corners lost in shadow               (the screen-left corner a little higher), soft rose lips
//   4. SFUMATO: no hard edge on the skin        a warm umber shade laid under the lines: the far side of the face, the
//                                               eye sockets, beside and under the nose, the mouth's corners, under the
//                                               lip and the jaw; lights on the forehead, the near cheek and the chin
//   5. the long nose                            the under-curve of its tip and one wing in umber, the bridge as shade
//   6. the veil's hem across the forehead       one fine line under the hairline
//   7. 500 years old                            a few hair cracks of the varnish (craquelure), very faint
//   monaFace(o)   all of it, as ONE accessory (name "monaFace"). The eyes are a setting by the rig expression of the
//                 face's eyes (EYES below); the blink and the gaze are read off the rig's own drawing before it is
//                 wiped, the way the Romeo film's eyes.ts does. THE SMILE replaces the rig's closed smile mouth (mouth
//                 "smile") and only that one: every other mouth (speaking, sighing, the sore jaw) is the rig's own, so
//                 when she drops the pose the painted smile is really gone.
import type { Acc, FaceKit, P2 } from "../../group/kit/rig3d";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (d: number) => (d * Math.PI) / 180;

/** her lines are a warm near-black (old oil paint), not the series' violet ink: the lid lines and the lip line */
export const LINE = "#2c1b14";
const UMBER = "118,74,30", LIGHT = "255,247,222", ROSE = "206,112,88";
const IRIS = "#6a4424", WHITE = "#fbf4de";

/** HOW THE FACE IS DRAWN. "soft" (the default, after the owner's "she looks kinda scary", 23 Nov 2026) = the series'
 *  friendly toon read of her: the series' SOLID eyes (a lid line with a solid pupil hanging from it, no white, no
 *  iris: the owner's "lets give her solid eyes, like our style") under her heavy lids, hardly any shade, a blush, a
 *  faint brow.
 *  "panel" = the first read, close to the painting: dark lid lines, shaded sockets, no brow. */
type Style = { shade: number; socket: number; noseShade: number; blush: number; hw: number; lidW: number; openK: number; iris: number; irisCol: string; pupil: number; glint: number; lidShade: number; lower: number; fold: number; line: string; lash: boolean; solid: boolean; lipW: number; lipLine: string; corner: number; lip: number; lift: number; nose: number; bridge: number; brow: number; hem: number; out: number };
const PANEL: Style = { shade: 1, socket: 1, noseShade: 1, blush: 1, hw: 9.3, lidW: 0.94, openK: 1, iris: 5.1, irisCol: "#6a4424", pupil: 0.56, glint: 0.24, lidShade: 0.28, lower: 0.8, fold: 0.78, line: "#2c1b14", lash: false, solid: false, lipW: 1.95, lipLine: "#2c1b14", corner: 1, lip: 1, lift: 0, nose: 0.9, bridge: 0.4, brow: 0, hem: 0.7, out: 0 };
const SOFT: Style = { shade: 0.42, socket: 0.22, noseShade: 0.3, blush: 2.3, hw: 10.4, lidW: 0.9, openK: 1, iris: 6.3, irisCol: "#8a5628", pupil: 0.5, glint: 0.36, lidShade: 0.1, lower: 0.34, fold: 0.38, line: "#2a1a18", lash: false, solid: true, lipW: 1.7, lipLine: "#6a2f24", corner: 0.35, lip: 1.25, lift: 0.55, nose: 0.6, bridge: 0, brow: 0.42, hem: 0.42, out: 0.5 };
let ST: Style = SOFT;

export type MonaFaceO = {
  /** "soft" (default) | "panel": see Style */ style?: "soft" | "panel";
  /** sfumato's strength (1 = the sheet's) */ shade?: number;
  /** the varnish cracks' strength (0 = none) */ cracks?: number;
  /** the veil's hem across the forehead */ veil?: boolean;
  /** the nose */ nose?: boolean;
};

// ------------------------------------------------------------------------------------------------- reading the rig
type RigEye = "dot" | "lid" | "down" | "slit" | "bead" | "shut" | "ring" | "squeeze" | "other";
/** what the rig draws for the eyes of each expression, [screen left, screen right] (rig3d.ts FACES; not exported) */
const RIG: Record<string, [RigEye, RigEye]> = {};
const both = (k: RigEye, ...names: string[]) => names.forEach((n) => { RIG[n] = [k, k]; });
both("dot", "smile", "lick"); both("lid", "neutral", "stern", "smug", "huff", "rage", "scheming"); both("down", "sad", "focus");
both("slit", "deadpan", "cool", "hush"); both("bead", "speechless"); both("ring", "shock", "nervous", "aghast");
both("shut", "relief", "relief_open", "grin", "happy", "smile_closed", "sleep", "sigh", "whistle", "gloom", "laughcry"); both("squeeze", "wince", "laugh");
RIG.pained = ["squeeze", "lid"]; RIG.doze = ["shut", "slit"]; both("other", "dazed");

const dark = (d: Uint8ClampedArray, k: number) => d[k + 3] >= 150 && d[k] + d[k + 1] + d[k + 2] <= 330;
/** the ink the rig drew inside a box (u): its own box in u, and the mean x of its lower half (an eye's pupil) */
const readInk = (f: FaceKit, x0: number, y0: number, x1: number, y1: number) => {
  const u = f.u, [pxa, pya] = f.px(x0, y0), [pxb, pyb] = f.px(x1, y1);
  const X = Math.round(pxa), Y = Math.round(pya), W = Math.max(1, Math.round(pxb - pxa)), H = Math.max(1, Math.round(pyb - pya)), d = f.g.getImageData(X, Y, W, H).data;
  let l = W, r = -1, t = H, b = -1;
  for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) { if (!dark(d, (yy * W + xx) * 4)) continue; if (xx < l) l = xx; if (xx > r) r = xx; if (yy < t) t = yy; if (yy > b) b = yy; }
  if (r < 0) return null;
  const mid = Math.round((t + b) / 2);
  let n = 0, sx = 0;
  for (let yy = mid; yy <= b; yy++) for (let xx = l; xx <= r; xx++) if (dark(d, (yy * W + xx) * 4)) { n++; sx += xx; }
  /** the mean height (u) of the ink in the column at share q of the ink's width (0 = its left end) */
  const colY = (q: number) => { const xx = clamp(Math.round(l + (r - l) * q), l, r); let m = 0, sy = 0; for (let yy = t; yy <= b; yy++) if (dark(d, (yy * W + xx) * 4)) { m++; sy += yy; } return m ? y0 + sy / m / u : NaN; };
  /** how much of the row through the ink's middle is ink (a ring: little; a ring with the lid across it: nearly all) */
  let row = 0; for (let xx = l; xx <= r; xx++) if (dark(d, (mid * W + xx) * 4)) row++;
  return { x0: x0 + l / u, x1: x0 + (r + 1) / u, y0: y0 + t / u, y1: y0 + (b + 1) / u, w: (r - l + 1) / u, h: (b - t + 1) / u, cx: n ? x0 + sx / n / u : (x0 + x1) / 2, colY, row: row / (r - l + 1) };
};
/** the blink on the rig's drawing (0 open, 0.5 half, 1 shut) and the gaze (-1..1), from what it drew for the eye at
 *  side s */
const blinkGaze = (f: FaceKit, s: number, kind: RigEye): { lid: number; gaze: number } => {
  const x0 = s * f.sp, e = readInk(f, x0 - 12, -9, x0 + 12, 8.2);
  if (!e || kind === "shut" || kind === "squeeze" || kind === "other") return { lid: 0, gaze: 0 };
  let lid = 0;
  if (kind === "dot") lid = e.h < 6 ? 1 : e.w > 13 ? 0.5 : 0;
  else if (kind === "bead") lid = e.w > 10 ? 1 : 0;
  else if (kind === "lid") lid = e.h < 4.8 ? 1 : e.h < 9 ? 0.5 : 0;
  else if (kind === "down") lid = e.h < 4.8 ? 1 : e.h < 7.2 ? 0.5 : 0;
  else if (kind === "ring") lid = e.h < 6 ? 1 : e.row > 0.8 ? 0.5 : 0;
  else lid = e.h < 4.8 ? 1 : 0;
  const k = kind === "dot" || kind === "bead" ? 2.2 : kind === "ring" ? 4.4 : 3.6;
  return { lid, gaze: lid >= 1 || kind === "ring" ? 0 : clamp((e.cx - x0) / k, -1, 1) };
};

// ------------------------------------------------------------------------------------------------- canvas helpers
const trace = (f: FaceKit, pts: P2[]) => { const g = f.g; g.beginPath(); pts.forEach((p, i) => { const [a, b] = f.px(p[0], p[1]); if (i) g.lineTo(a, b); else g.moveTo(a, b); }); g.closePath(); };
const clipTo = (f: FaceKit, pts: P2[], fn: () => void) => { f.g.save(); trace(f, pts); f.g.clip(); fn(); f.g.restore(); };
const wipe = (f: FaceKit, pts: P2[]) => { const g = f.g; g.save(); g.globalCompositeOperation = "destination-out"; trace(f, pts); g.fillStyle = "#000"; g.fill(); g.restore(); };
const box = (x0: number, y0: number, x1: number, y1: number): P2[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** a soft round patch of colour (rgb "r,g,b", peak alpha a) centred at (x, y), rx by ry u */
const blob = (f: FaceKit, x: number, y: number, rx: number, ry: number, rgb: string, a: number, rot = 0) => {
  const g = f.g, [px, py] = f.px(x, y), r = rx * f.u, gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(0.5, `rgba(${rgb},${a * 0.62})`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.save(); g.translate(px, py); g.rotate(rad(rot)); g.scale(1, ry / rx); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore();
};
/** a smooth line through points (a Catmull-Rom spline, n steps a span) */
const spline = (p: P2[], n = 8): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      o.push([0.5 * (2 * b[0] + (c[0] - a[0]) * t + (2 * a[0] - 5 * b[0] + 4 * c[0] - d[0]) * t2 + (3 * b[0] - a[0] - 3 * c[0] + d[0]) * t3),
        0.5 * (2 * b[1] + (c[1] - a[1]) * t + (2 * a[1] - 5 * b[1] + 4 * c[1] - d[1]) * t2 + (3 * b[1] - a[1] - 3 * c[1] + d[1]) * t3)]);
    }
  }
  o.push(p[p.length - 1]);
  return o;
};

// ------------------------------------------------------------------------------------------------- sfumato
/** THE SHADE UNDER THE LINES (see the head of this file). k = its strength. The light comes from screen left, as on
 *  the panel: the far (screen right) side of the face falls away into shade. */
const sfumato = (f: FaceKit, k: number) => {
  const U = UMBER;
  k *= ST.shade;
  blob(f, 50, 4, 30, 56, U, 0.4 * k);                       // the far side of the face
  blob(f, 6, 56, 52, 19, U, 0.42 * k);                      // under the jaw
  blob(f, -50, -6, 13, 34, U, 0.2 * k);                     // the near temple, under the hair
  blob(f, 0, -52, 46, 12, U, 0.26 * k);                     // under the veil's hem
  for (const s of [-1, 1]) blob(f, s * 14.6 + 1, -4.6, 13.5, 8.4, U, (s > 0 ? 0.3 : 0.24) * k * ST.socket);   // the eye sockets
  blob(f, 5.2, 3.4, 4.4, 10.5, U, 0.24 * k * ST.noseShade);                // the nose's shaded side
  blob(f, 1, 13, 7, 2.8, U, 0.3 * k);                       // under the nose
  blob(f, 0, 25.2, 8.5, 3.2, U, 0.28 * k);                  // under the lower lip
  const L = LIGHT;
  blob(f, -7, -27, 27, 15, L, 0.55 * k);                    // the forehead
  blob(f, -19.5, 9.5, 12, 9, L, 0.36 * k);                  // the near cheek
  blob(f, -1.6, 2.5, 2.4, 9, L, 0.4 * k);                   // down the nose
  blob(f, -1, 31.5, 9, 6, L, 0.3 * k);                      // the chin
  const bl = (k / ST.shade) * ST.blush;
  blob(f, -22, 12.5, 9.5, 6, ROSE, 0.16 * bl); blob(f, 23, 12.5, 9, 6, ROSE, 0.13 * bl);   // a breath of warmth in the cheeks
};

// ------------------------------------------------------------------------------------------------- the eyes
/** ONE EYE'S SETTING: open = how far the lids are apart, 0..1 (under 0.1 it is drawn shut as `shut`); tilt = the lids'
 *  slope (deg, + = the inner end lower: a frown; - = the inner end up: sorrow); iris = its size against her usual one;
 *  squeeze = shut tight in a ">" */
export type EyeSet = { open: number; tilt?: number; shut?: "smile" | "sleep" | "line"; iris?: number; squeeze?: boolean };
const OPEN_SMILE: EyeSet = { open: 0.5 }, SHUT_SMILE: EyeSet = { open: 0, shut: "smile" }, SHUT_LINE: EyeSet = { open: 0, shut: "line" };
/** HER EYES by the rig expression of the face's eyes */
export const EYES: Record<string, EyeSet> = {
  /** THE LOOK (on duty): the lids half down over the iris */
  smile: OPEN_SMILE, lick: OPEN_SMILE,
  /** off duty, plain: a little more open */
  neutral: { open: 0.64 },
  sad: { open: 0.5, tilt: -9 }, focus: { open: 0.5, tilt: -3 },
  smug: { open: 0.4, tilt: 3 }, stern: { open: 0.5, tilt: 8 }, huff: { open: 0.46, tilt: 9 }, rage: { open: 0.46, tilt: 12 }, scheming: { open: 0.4, tilt: 10 },
  /** worn out: the lids nearly shut */
  deadpan: { open: 0.26 }, cool: { open: 0.3, tilt: 3 }, hush: { open: 0.3, tilt: 3 },
  /** caught (the guard's torch): wide open, the whole iris showing with white over it */
  shock: { open: 1, iris: 0.8 }, nervous: { open: 0.95, iris: 0.7 }, aghast: { open: 1, iris: 0.62 }, speechless: { open: 0.86, iris: 0.5 },
  relief: SHUT_SMILE, relief_open: SHUT_SMILE, grin: SHUT_SMILE, happy: SHUT_SMILE, smile_closed: SHUT_SMILE, laughcry: SHUT_SMILE,
  sleep: { open: 0, shut: "sleep" }, sigh: SHUT_LINE, whistle: SHUT_LINE, gloom: SHUT_LINE,
  wince: { open: 0, squeeze: true }, laugh: { open: 0, squeeze: true },
};
/** the settings of the two eyes of an expression whose eyes differ, [screen left, screen right] */
const EYES2: Record<string, [EyeSet, EyeSet]> = {
  /** the sore jaw: one eye screwed shut, the other half open */
  pained: [{ open: 0, squeeze: true }, { open: 0.5, tilt: -6 }],
  doze: [SHUT_LINE, { open: 0.24 }],
};
/** how strongly the brow ridge shows (0..1): nothing while she holds the pose, clearly when the face acts */
const RIDGE: Record<string, number> = { smile: 0, lick: 0, neutral: 0.5, deadpan: 0.55, relief: 0.35, relief_open: 0.35, happy: 0.35, smile_closed: 0.3, grin: 0.4, sleep: 0.3 };

/** ONE OF HER EYES (x, y) = its middle; s = +1 the eye on screen right; lid = the blink on top of the setting's own
 *  lids (0, 0.5, 1); gaze -1..1 */
export const monaEye = (f: FaceKit, x: number, y: number, s: number, E: EyeSet, lid: number, gaze: number) => {
  const hw = ST.hw, LW = f.PEN * ST.lidW, LINE = ST.line, tilt = -s * (E.tilt ?? 0), g = f.g;
  const rot = (p: P2): P2 => { const a = rad(tilt), c = Math.cos(a), sn = Math.sin(a), dx = p[0] - x, dy = p[1] - y; return [x + dx * c - dy * sn, y + dx * sn + dy * c]; };
  const R = (a: P2[]) => a.map(rot);
  if (E.squeeze) { f.line(R([[x + s * 5.2, y - 4.8], [x - s * 5.2, y + 0.4], [x + s * 5.2, y + 5.2]]), LW, LINE); return; }
  let open = Math.min(1, E.open * ST.openK);
  if (lid >= 1) open = 0; else if (lid > 0) open = Math.min(open, 0.5) * 0.5;
  // the corners: the outer one a touch lower than the inner (her calm, falling lids)
  const I: P2 = [x - s * hw, y + 1.5], O: P2 = [x + s * hw, y + 2.3], mid = (I[1] + O[1]) / 2;
  if (open < 0.1) {
    // shut: the lid line rests on the lower lid. "smile" bulges up, "sleep" and a blink hang, "line" is nearly flat
    const kind = E.shut ?? "sleep", dy = kind === "smile" ? -4.4 : kind === "sleep" ? 3.0 : 1.3, y0 = kind === "smile" ? 2.4 : 0;
    f.line(R(f.quad([I[0], I[1] + y0], [x, mid + y0 + dy * 2], [O[0], O[1] + y0], 14)), LW, LINE);
    if (kind !== "smile") f.line(R(f.quad([I[0] + s * 2.4, I[1] - 3.4], [x, mid - 4.6 + dy], [O[0] - s * 1.6, O[1] - 3.2], 10)), 1.4, `rgba(${UMBER},0.75)`);
    return;
  }
  if (ST.solid) {
    // THE SERIES' EYE in her shape: the lid a soft arch (the outer end a touch lower: her calm, falling lids), a solid
    // pupil hanging from it (the lower the lid, the less of it), and over it the fine fold of her heavy lid
    const ly = y - 4.3, lidPts = f.quad([x - s * 8.8, ly + 1.5], [x - s * 0.6, ly - 2.6], [x + s * 8.8, ly + 2.2], 16);
    const rx = 5.9 * (E.iris ?? 1), ry = (2.8 + 10 * open) * (E.iris ?? 1), cx = x + gaze * 3.2;
    clipTo(f, R([...lidPts, [x + s * 13, y + 15], [x - s * 13, y + 15]]), () => f.fill(R(f.arc(cx, ly - 0.2, rx, ry)), LINE, 0));
    f.line(R(f.quad([x - s * 6.6, ly - 2.4], [x - s * 0.6, ly - 6.3], [x + s * 7.0, ly - 1.6], 12)), 1.4, `rgba(${UMBER},${ST.fold})`);
    f.line(R(lidPts), LW, LINE);
    return;
  }
  const up = 1.3 + 7.5 * open, lo = 1.0 + 2.7 * open, ri = ST.iris * (E.iris ?? 1);
  // (the upper lid peaks a little toward the nose side of the middle, as hers do)
  const top = f.quad(I, [x - s * 0.9, mid - 2 * up], O, 18), bot = f.quad(O, [x + s * 0.4, mid + 2 * lo], I, 18), almond = R([...top, ...bot.slice(1, -1)]);
  g.save(); g.globalAlpha = 0.95; f.fill(almond, WHITE, 0); g.restore();
  clipTo(f, almond, () => {
    // the iris rests on the lower lid; the upper lid cuts its top off unless the eye is wide
    const cx = x + gaze * 3.1, cy = Math.min(mid + lo - ri + 0.9, mid - up + ri + 1.2 + 6 * Math.max(0, open - 0.7));
    f.fill(R(f.arc(cx, cy, ri, ri)), ST.irisCol, 0);
    f.fill(R(f.arc(cx, cy, ri * ST.pupil, ri * ST.pupil)), LINE, 0);
    f.fill(R(f.arc(cx - 0.42 * ri, cy - 0.34 * ri, ST.glint * ri, ST.glint * ri, 0, 360, 12)), "#fffaf0", 0);
    if (ST.lash) f.fill(R(f.arc(cx + 0.4 * ri, cy + 0.42 * ri, 0.15 * ri, 0.15 * ri, 0, 360, 10)), "#fffaf0", 0);
    // the lid's own shadow on the eye
    f.line(R(f.quad([I[0], I[1] + 1.6], [x - s * 0.9, mid - 2 * up + 3.4], [O[0], O[1] + 1.4], 14)), 2.2, `rgba(${UMBER},${ST.lidShade})`);
  });
  // the lower lid: fine and soft; the lid's fold above the eye: a second fine line (her heavy lids); the lid line last
  f.line(R(f.quad([O[0] - s * 0.8, O[1] + 0.2], [x + s * 0.4, mid + 2 * lo + 0.3], [I[0] + s * 1.2, I[1] + 0.6], 14)), 1.25, `rgba(${UMBER},${ST.lower})`);
  if (open < 0.8) f.line(R(f.quad([I[0] + s * 2.2, I[1] - 2.9 - 1.6 * open], [x - s * 0.9, mid - 2 * up - 3.9], [O[0] - s * 1.4, O[1] - 2.8 - 1.4 * open], 12)), 1.5, `rgba(${UMBER},${ST.fold})`);
  f.line(R(top), LW, LINE);
  // (soft) one lash at the outer corner, flicked up
  if (ST.lash) f.line(R(f.quad(O, [O[0] + s * 1.3, O[1] + 0.1], [O[0] + s * 2.1, O[1] - 1.5], 6)), LW * 0.8, LINE);
};

/** the brow the rig drew at side s (its ink above the eye): three points along it (inner, middle, outer) */
const readBrow = (f: FaceKit, s: number): [P2, P2, P2] | null => {
  const x0 = s * f.sp, e = readInk(f, x0 - 11.5, -29, x0 + 11.5, -6.8);
  if (!e || e.w < 6) return null;
  const pts: P2[] = [0.08, 0.5, 0.92].map((q) => [e.x0 + e.w * q, e.colY(q)] as P2);
  if (pts.some((p) => Number.isNaN(p[1]))) return null;
  return (s > 0 ? pts : pts.reverse()) as [P2, P2, P2];
};

// ------------------------------------------------------------------------------------------------- the smile
/** THE SMILE at (mx, my), the rig's mouth middle: see the head of this file */
/** HER MOUTH AT REST (off duty): the same lips with the smile gone: a level line, the corners a touch down, no hooks.
 *  press = the lips pressed thin and wider (the flat mouth of someone who has had enough). */
const rest = (f: FaceKit, mx: number, my: number, press: boolean) => {
  const g = f.g, y = my + 0.3, w = press ? 7.6 : 6.4, d = press ? 0.55 : 0.3, up = press ? 1.3 : 2.3, dn = press ? 2.7 : 3.9;
  const Lc: P2 = [mx - w, y + d], Rc: P2 = [mx + w - 0.3, y + d + 0.1];
  const lipLine = spline([Lc, [mx - w * 0.62, y + 0.08], [mx - 2.5, y + 0.3], [mx, y + 0.05], [mx + 2.5, y + 0.32], [mx + w * 0.6, y + 0.12], Rc], 8);
  const upper = spline([[mx - w * 0.8, y - 0.05], [mx - 2.9, y - up], [mx, y - up * 0.62], [mx + 2.9, y - up], [mx + w * 0.78, y]], 8);
  const lower = spline([[mx + w * 0.72, y + 0.5], [mx + 3, y + dn * 0.86], [mx, y + dn], [mx - 3, y + dn * 0.86], [mx - w * 0.74, y + 0.45]], 8);
  g.save(); g.globalAlpha = Math.min(1, 0.55 * ST.lip); f.fill([...upper, ...lipLine.slice(5, -5).reverse()], `rgb(${ROSE})`, 0); g.globalAlpha = Math.min(1, 0.34 * ST.lip); f.fill([...lipLine.slice(5, -5), ...lower], `rgb(${ROSE})`, 0); g.restore();
  f.line(spline([[mx - 3.6, y + dn - 0.3], [mx, y + dn + 0.5], [mx + 3.6, y + dn - 0.3]], 6), 1.1, `rgba(${UMBER},${0.45 * ST.shade})`);
  f.line(lipLine, ST.lipW, ST.lipLine);
};
const smile = (f: FaceKit, mx: number, my: number, k = 1) => {
  const g = f.g, y = my - 0.3, up = ST.lift;
  blob(f, -10.4, 17.4, 4.6, 4.2, UMBER, 0.46 * k * ST.corner); blob(f, 10, 17.5, 4.4, 4.0, UMBER, 0.42 * k * ST.corner);   // the mouth's corners: where the smile hides
  const Lc: P2 = [mx - 8.8, y - 0.6 - up], Rc: P2 = [mx + 8.4, y - 0.4 - up];
  // the line between the lips: almost level, a slight dip under the cupid's bow, both ends just rising
  const lipLine = spline([Lc, [mx - 6.2, y + 0.3], [mx - 2.9, y + 0.72], [mx, y + 0.5], [mx + 2.9, y + 0.76], [mx + 6, y + 0.42], Rc], 8);
  // the upper lip (deeper rose) and the lower (paler, fuller in the middle)
  const upper = spline([[mx - 7.2, y - 0.5], [mx - 3.1, y - 2.5], [mx, y - 1.6], [mx + 3.1, y - 2.5], [mx + 7, y - 0.4]], 8);
  const lower = spline([[mx + 6.2, y + 0.6], [mx + 3.2, y + 3.4], [mx, y + 4.1], [mx - 3.2, y + 3.4], [mx - 6.4, y + 0.5]], 8);
  g.save(); g.globalAlpha = Math.min(1, 0.6 * ST.lip); f.fill([...upper, ...lipLine.slice(5, -5).reverse()], `rgb(${ROSE})`, 0); g.globalAlpha = Math.min(1, 0.36 * ST.lip); f.fill([...lipLine.slice(5, -5), ...lower], `rgb(${ROSE})`, 0); g.restore();
  f.line(spline([[mx - 3.8, y + 3.7], [mx, y + 4.5], [mx + 3.8, y + 3.7]], 6), 1.1, `rgba(${UMBER},${0.45 * ST.shade})`);
  f.line(lipLine, ST.lipW, ST.lipLine);
  // the corners: each tucked up into the cheek with a very short hook (the screen-left one higher and longer)
  f.line(f.quad(Lc, [mx - 9.7, y - 1.0 - up], [mx - 10.2, y - 2.1 - up], 6), ST.lipW * 0.87, ST.lipLine);
  f.line(f.quad(Rc, [mx + 9.1, y - 0.7 - up], [mx + 9.5, y - 1.4 - up], 6), ST.lipW * 0.8, ST.lipLine);
};

// ------------------------------------------------------------------------------------------------- nose, veil, cracks
const noseOf = (f: FaceKit) => {
  // the tip's under-curve running up into the far wing (no near wing: a "U" reads as a snout)
  f.line(spline([[-3.2, 9.9], [-1.4, 10.9], [0.8, 11.1], [3.0, 10.5], [4.0, 9.1], [3.6, 7.9]], 6), 1.5, `rgba(${UMBER},${ST.nose})`);
  // the bridge: one long soft line down the shaded side, from under the brow ridge
  if (ST.bridge > 0) f.line(spline([[4.9, -5.5], [3.5, -1], [3.3, 3.6], [3.7, 7.6]], 6), 1.25, `rgba(${UMBER},${ST.bridge})`);
};
const veilOf = (f: FaceKit) => {
  // the hem of the gauze: one fine dark line across the top of the forehead, under the hairline, and a little of the
  // gauze's tint between the two
  const hem = f.quad([-45, -12], [0, -42.5], [45, -12], 26);
  clipTo(f, [...hem, [60, -60], [-60, -60]], () => { f.g.fillStyle = "rgba(60,40,22,0.13)"; f.g.fillRect(0, 0, 4000, 4000); });
  // (it fades out toward the temples: the face turns on the head a little more than the hair does, and a hem drawn
  // right out to the head's edge then shows as a stray line beside the temple)
  const g = f.g, [xa] = f.px(-41, 0), [xb] = f.px(41, 0), gr = g.createLinearGradient(xa, 0, xb, 0);
  gr.addColorStop(0, "rgba(60,38,20,0)"); gr.addColorStop(0.2, `rgba(60,38,20,${ST.hem})`); gr.addColorStop(0.8, `rgba(60,38,20,${ST.hem})`); gr.addColorStop(1, "rgba(60,38,20,0)");
  g.save(); g.strokeStyle = gr; g.lineWidth = 1.1 * f.u; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath();
  hem.forEach((p, i) => { const [x, y] = f.px(p[0], p[1]); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
  g.stroke(); g.restore();
};
/** fixed hair cracks of the old varnish: short branching lines, kept off the eyes and the mouth */
const cracksOf = (f: FaceKit, k: number) => {
  const col = `rgba(74,50,26,${0.16 * k})`;
  const h = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const seeds: [number, number, number][] = [[-30, -30, 100], [-12, -36, 80], [14, -33, 95], [33, -24, 120], [-38, 2, 70], [39, 6, 110], [-33, 24, 60], [30, 27, 115], [-8, 36, 85], [14, 37, 100], [-21, -22, 40], [24, -14, 150]];
  seeds.forEach(([x, y, a0], si) => {
    let px = x, py = y, a = a0;
    const pts: P2[] = [[px, py]];
    for (let j = 0; j < 5; j++) { a += (h(si * 17 + j) - 0.5) * 70; const l = 2.2 + 2.6 * h(si * 31 + j); px += Math.cos(rad(a)) * l; py += Math.sin(rad(a)) * l; pts.push([px, py]); }
    f.line(pts, 0.62, col);
    const b = pts[2], ab = a0 + 70 + 40 * h(si * 7);
    f.line([b, [b[0] + Math.cos(rad(ab)) * 3.4, b[1] + Math.sin(rad(ab)) * 3.4], [b[0] + Math.cos(rad(ab + 25)) * 5.6, b[1] + Math.sin(rad(ab + 25)) * 5.6]], 0.55, col);
  });
};

// ------------------------------------------------------------------------------------------------- the accessory
/** MONA LISA'S FACE (see the head of this file) */
export const monaFace = (o: MonaFaceO = {}): Acc => {
  const k = o.shade ?? 1, cracks = o.cracks ?? 0, veil = o.veil ?? true, nose = o.nose ?? true, style = o.style === "panel" ? PANEL : SOFT;
  return {
    name: "monaFace", slots: [], key: `monaFace12|${k}|${cracks}|${veil}|${nose}|${o.style ?? "soft"}`,
    faceUnder(f) { ST = style; sfumato(f, k); },
    face(f) {
      if (f.lens) return;
      ST = style;
      const name = f.expr as string, kinds = RIG[name] ?? ["other", "other"], sets = EYES2[name] ?? (EYES[name] ? [EYES[name], EYES[name]] : null);
      // --- the eyes and the brows
      [-1, 1].forEach((s, i) => {
        const x = s * f.sp, brow = readBrow(f, s);
        // the brow goes (she has none); the shade under it is laid again
        const bb = box(x - 12.4, -30, x + 12.4, ST.solid && kinds[i] === "ring" ? -12.8 : -8.6);   // (a ring eye reaches higher than her own)
        wipe(f, bb); clipTo(f, bb, () => sfumato(f, k));
        const ridge = Math.max(RIDGE[name] ?? 1, ST.brow);
        if (brow && ridge > 0) {
          const [a, m, b] = brow, c: P2 = [2 * m[0] - (a[0] + b[0]) / 2, 2 * m[1] - (a[1] + b[1]) / 2], q = f.quad(a, c, b, 12);
          f.line(q, 5.4, `rgba(${UMBER},${0.2 * ridge})`); f.line(q, 2.6, `rgba(${UMBER},${0.5 * ridge})`);
        }
        if (!sets || (ST.solid && kinds[i] === "ring")) return;   // (solid: a shock keeps the series' own ring eyes)
        // (the rig's ring eye of a shock is far bigger than her eye: all of it goes)
        const { lid, gaze } = blinkGaze(f, s, kinds[i]), eb = kinds[i] === "ring" ? box(x - 14.4, -14, x + 14.4, 13.6) : box(x - 10.8, -8.6, x + 10.8, 8.0);
        wipe(f, eb); clipTo(f, eb, () => sfumato(f, k));
        monaEye(f, x + s * ST.out, 0.3, s, sets[i], lid, gaze);
      });
      // --- THE SMILE in place of the rig's closed smile (a small arc with its ends up and nothing else in the mouth's
      // box: a speaking mouth is a filled bar, a frown bends the other way)
      const [mx, my] = f.mouth, m = readInk(f, mx - 24, my - 9, mx + 24, my + 22);
      if (m && m.w > 9 && m.w < 20 && m.h < 9.5 && m.colY(0.5) > m.colY(0.06) + 1.2 && m.colY(0.5) > m.colY(0.94) + 1.2) {
        const mb = box(m.x0 - 1.5, m.y0 - 1.5, m.x1 + 1.5, m.y1 + 1.5);
        wipe(f, mb); clipTo(f, mb, () => sfumato(f, k));
        smile(f, mx, my, k);
      } else if (m && m.w >= 7 && m.w < 12.5 && m.h < 9.5 && m.y0 > my - 6 && m.y1 < my + 7) {
        // the rig's tiny lens of a mouth (a neutral face) -> her lips at rest (the flat line and the wobble stay the rig's)
        const mb = box(m.x0 - 1.5, m.y0 - 1.5, m.x1 + 1.5, m.y1 + 1.5), press = m.h < 3.4;
        wipe(f, mb); clipTo(f, mb, () => sfumato(f, k));
        rest(f, mx, my, press);
      }
      if (nose) noseOf(f);
      if (veil) veilOf(f);
      if (cracks > 0) cracksOf(f, cracks);
    },
  };
};
