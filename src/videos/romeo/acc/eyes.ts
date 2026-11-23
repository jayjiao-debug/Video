// EYES of 采访罗密欧与朱丽叶 (v3b, 23 Nov 2026). The owner, on the v3 sheet: "v3 juliet her eyes are weird, try learning
// from Ra's daughter ... give them expressive emotion showing they are in love".
// What 拉的女儿 did (her faces.ts drawHumanEyes, read on the Drive on 23 Nov): the rig's own two eyes are WIPED and hers
// drawn in their place, as THE SERIES' INK EYE: one lid line of the pen and a round ink pupil hanging under it with one
// small light in it; no outline, no white, no iris. What makes them hers is one mark of her own at the lid's outer end
// (her kohl wing). Juliet's v3 eyes were the rig's tall dot with three loose strokes laid over it (lash flicks, a wing,
// a liner line) and they read as scribbles. Here they are drawn the 拉的女儿 way, with Juliet's marks: the wing (her
// liner: 大小姐) and a second small light (the sparkle).
// Everything is in the rig's face units (u = 1 % of the head's width, from the middle of the eye line, y down).
// WHICH EYE: a face's eyes are a setting (how open, how arched the lid, its slope, the pupil), never a swapped picture.
// The setting comes from the rig expression of the face's eyes (f.expr), and the blink and the gaze from the rig's own
// drawing, read off the canvas before it is wiped (a half lid, a shut lid, the pupil's place).
// LOVE (the owner: "showing they are in love"): two settings, keyed by rig eye expressions that no face of this film
// used before, so a face asks for them by name (people.ts FACES):
//   eyes "lick" (the rig's plain dot eyes)      SMITTEN: big pupils with a heart-shaped light, a deeper blush with three
//                                               strokes on each cheek
//   eyes "speechless" (the rig's bead eyes)     HEART EYES, the film's one signature emote: red hearts with a light
//   herEyes(o)    Juliet: every open, half and shut eye redrawn; the love eyes too
//   loveEyes(o)   Romeo (and anyone): his own eyes stay the rig's; only the two love settings are drawn
import type { Acc, FaceKit, P2 } from "../../group/kit/rig3d";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;
const RED = "#e0364e", BLUSH = "#e2536c";

type Pupil = "round" | "big" | "dot";
/** ONE EYE'S SETTING (拉的女儿's EyeSpec, cut to the ink eye): open = how far the lids are apart, 0..1 (under 0.12 the eye
 *  is drawn shut as `shut`); round = how arched the lid is, 0..1; tilt = the lid line's slope (deg, + = the inner end
 *  lower: a frown); pk = the pupil's size against its usual one; love = a heart light / heart pupils */
export type EyeSet = { open: number; pupil?: Pupil; pk?: number; tilt?: number; round?: number; shut?: "smile" | "sleep" | "line"; love?: "light" | "heart" };
/** the rig's eye kind for each rig expression the film's faces use (rig3d.ts FACES; it is not exported): what the rig
 *  draws when the face is open, so a half or a shut lid can be told from it */
type RigEye = "dot" | "lid" | "down" | "slit" | "bead" | "shut";
const RIG: Record<string, RigEye> = {
  smile: "dot", lick: "dot", neutral: "lid", stern: "lid", smug: "lid", huff: "lid", rage: "lid", scheming: "lid",
  sad: "down", focus: "down", deadpan: "slit", cool: "slit", hush: "slit", speechless: "bead",
  relief: "shut", relief_open: "shut", grin: "shut", happy: "shut", smile_closed: "shut", sleep: "shut", sigh: "shut", whistle: "shut", gloom: "shut",
};
/** JULIET'S EYES by the rig expression of the face's eyes (the rest keep the rig's own: the squeezed, the ring, the
 *  spiral eyes and laughing to tears) */
export const HER_EYES: Record<string, EyeSet> = {
  /** her resting face (sure, bossy, caught, soft): open and warm, the lid a little arched, the whole round pupil */
  smile: { open: 0.92, pupil: "round", round: 0.5 },
  /** composed (brave, waking) */
  neutral: { open: 0.7, pupil: "round", round: 0.3 },
  /** sorrow (tender, grief): the lids lower, their inner ends up */
  sad: { open: 0.55, pupil: "round", tilt: -8, round: 0.15 },
  focus: { open: 0.5, pupil: "round", tilt: -3 },
  smug: { open: 0.46, pupil: "round", tilt: 3 }, stern: { open: 0.5, pupil: "round", tilt: 8 }, huff: { open: 0.46, pupil: "round", tilt: 9 },
  rage: { open: 0.46, pupil: "round", tilt: 12 }, scheming: { open: 0.42, pupil: "round", tilt: 10 },
  deadpan: { open: 0.3, pupil: "round" }, cool: { open: 0.32, pupil: "round", tilt: 3 }, hush: { open: 0.32, pupil: "round", tilt: 3 },
  /** delight (swoon): shut in two arcs that bulge up */
  relief: { open: 0, shut: "smile" }, relief_open: { open: 0, shut: "smile" }, grin: { open: 0, shut: "smile" }, happy: { open: 0, shut: "smile" }, smile_closed: { open: 0, shut: "smile" },
  /** asleep (the bier): hanging arcs */
  sleep: { open: 0, shut: "sleep" },
  sigh: { open: 0, shut: "line" }, whistle: { open: 0, shut: "line" }, gloom: { open: 0, shut: "line" },
};
/** THE LOVE EYES (both of them) */
export const LOVE_EYES: Record<string, EyeSet> = {
  lick: { open: 1, pupil: "big", pk: 1.04, round: 0.6, love: "light" },
  speechless: { open: 1, pupil: "big", round: 0.7, love: "heart" },
};
Object.assign(HER_EYES, LOVE_EYES);
/** the rig expressions that draw their own blush (rig3d.ts FACES blush: true): the blush is put back where the eye's
 *  box was wiped */
const RIG_BLUSH = new Set(["relief", "relief_open", "smile_closed", "happy"]);

/** a heart (its middle at x, y; r = half its width) */
const heart = (x: number, y: number, r: number, n = 30): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    o.push([x + r * Math.pow(Math.sin(t), 3), y + 0.2 * r - (r * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 16]);
  }
  return o;
};
const trace = (f: FaceKit, pts: P2[]) => { const g = f.g; g.beginPath(); pts.forEach((p, i) => { const [a, b] = f.px(p[0], p[1]); if (i) g.lineTo(a, b); else g.moveTo(a, b); }); g.closePath(); };
const clipTo = (f: FaceKit, pts: P2[], fn: () => void) => { f.g.save(); trace(f, pts); f.g.clip(); fn(); f.g.restore(); };

/** WHAT THE RIG DREW for the eye at side s (before it is wiped): its ink box in u and the middle of its lower half (the
 *  pupil). Only dark pixels count (the blush and the white are not ink); the scan stops at y 8.2, above any mouth. */
const readEye = (f: FaceKit, s: number) => {
  const x0 = s * f.sp, u = f.u, [pxa, pya] = f.px(x0 - 12, -9), [pxb, pyb] = f.px(x0 + 12, 8.2);
  const X = Math.round(pxa), Y = Math.round(pya), Wd = Math.max(1, Math.round(pxb - pxa)), Hd = Math.max(1, Math.round(pyb - pya)), d = f.g.getImageData(X, Y, Wd, Hd).data;
  let l = Wd, r = -1, t = Hd, b = -1;
  for (let yy = 0; yy < Hd; yy++) for (let xx = 0; xx < Wd; xx++) {
    const k = (yy * Wd + xx) * 4;
    if (d[k + 3] < 150 || d[k] + d[k + 1] + d[k + 2] > 330) continue;
    if (xx < l) l = xx; if (xx > r) r = xx; if (yy < t) t = yy; if (yy > b) b = yy;
  }
  if (r < 0) return null;
  const mid = Math.round((t + b) / 2);
  let n = 0, sx = 0;
  for (let yy = mid; yy <= b; yy++) for (let xx = l; xx <= r; xx++) {
    const k = (yy * Wd + xx) * 4;
    if (d[k + 3] < 150 || d[k] + d[k + 1] + d[k + 2] > 330) continue;
    n++; sx += xx;
  }
  return { w: (r - l + 1) / u, h: (b - t + 1) / u, cx: n ? x0 - 12 + sx / n / u : x0 };
};
/** the blink on the rig's drawing (0 open, 0.5 half, 1 shut) and the gaze (-1..1), from what it drew */
const blinkGaze = (f: FaceKit, s: number, kind: RigEye): { lid: number; gaze: number } => {
  const e = readEye(f, s);
  if (!e || kind === "shut") return { lid: 0, gaze: 0 };
  const x0 = s * f.sp;
  let lid = 0;
  if (kind === "dot") lid = e.h < 6 ? 1 : e.w > 13 ? 0.5 : 0;
  else if (kind === "bead") lid = e.w > 10 ? 1 : 0;
  else if (kind === "lid") lid = e.h < 4.8 ? 1 : e.h < 9 ? 0.5 : 0;
  else if (kind === "down") lid = e.h < 4.8 ? 1 : e.h < 7.2 ? 0.5 : 0;
  else lid = e.h < 4.8 ? 1 : 0;
  const k = kind === "dot" || kind === "bead" ? 2.2 : 3.6;
  return { lid, gaze: lid >= 1 ? 0 : clamp((e.cx - x0) / k, -1, 1) };
};

export type InkEyeO = { /** the wing at the lid's outer end (0 = none) */ wing?: number; /** a round pupil's size (1 = the series') */ pupilK?: number;
  /** the lid line's weight (1 = 拉的女儿's heavy line) */ lidK?: number; /** the almond's width (1) */ wide?: number;
  /** a second, smaller light low in the pupil (the sparkle) */ sparkle?: boolean };
/** THE INK EYE (拉的女儿's drawEye without an iris; with the love settings). (x, y) = its middle; s = +1 the eye on screen
 *  right (the person's left); lid = the blink on top of the setting's own lids (0, 0.5, 1); gaze -1..1 */
export const inkEye = (f: FaceKit, x: number, y: number, s: number, E: EyeSet, lid: number, gaze: number, o: InkEyeO = {}) => {
  const PEN = f.PEN, INK = f.INK;
  let open = E.open;
  if (lid >= 1) open = 0; else if (lid > 0) open = Math.min(open, 0.5) * 0.62;
  const tilt = -s * (E.tilt ?? 0), hw = 8.4 * (o.wide ?? 1), wing = o.wing ?? 0;
  const rot = (p: P2): P2 => { const a = rad(tilt), c = Math.cos(a), sn = Math.sin(a), dx = p[0] - x, dy = p[1] - y; return [x + dx * c - dy * sn, y + dx * sn + dy * c]; };
  const R = (a: P2[]) => a.map(rot);
  // the wing: from the outer end of the lid line out and a little up, thinning to a point
  const wingAt = (ox: number, oy: number, w0: number) => {
    if (wing <= 0) return;
    const L = 7.2 * wing, up = 2.6 * wing;
    f.fill(R([[ox - s * 1.0, oy - w0 / 2], ...f.quad([ox, oy - w0 / 2], [ox + s * L * 0.55, oy - w0 / 2 - up * 0.25], [ox + s * L, oy - up], 8), ...f.quad([ox + s * L, oy - up], [ox + s * L * 0.5, oy + w0 * 0.45 - up * 0.1], [ox - s * 1.0, oy + w0 / 2], 8)]), INK, 0);
  };
  if (open < 0.12) {
    // shut: one line of the pen. "smile" bulges up, "sleep" hangs, "line" is flat (a blink's shut frame hangs a little)
    const kind = E.shut ?? (lid >= 1 ? "sleep" : "line"), dy = kind === "smile" ? -4.6 : kind === "sleep" ? 3.4 : 0.8, y0 = y + (kind === "smile" ? 2.2 : kind === "sleep" ? -0.6 : 0);
    f.line(R(f.quad([x - hw * 0.94, y0], [x, y0 + dy * 2], [x + hw * 0.94, y0], 14)), PEN + 0.2);
    wingAt(x + s * hw * 0.94, y0, PEN * 0.9);
    return;
  }
  const pk = (o.pupilK ?? 1) * (E.pk ?? 1), P = E.pupil ?? "round", big = P === "big", dot = P === "dot";
  const rx = (big ? 6.3 : dot ? 3.0 : 5.6) * pk, ry = (big ? 6.5 : dot ? 3.0 : 5.8) * pk;
  // (wide open, the lid line RESTS on the pupil's top and the whole round pupil shows; as the eye narrows the line comes
  // down over it: half the pupil at 0.45, most of it at 0.25)
  const lw = (PEN + 0.35) * (o.lidK ?? 1), cy = y + 1.4, drop = lerp(0.66, 0, smoothstep(0.22, 0.88, open)) * 2 * ry, yL = cy - ry - lw * 0.3 + drop;
  const arch = 0.6 + 2.4 * (E.round ?? 0) * clamp(open / 0.7, 0, 1), gx = gaze * 2.6;
  const lidPts = f.quad([x - hw, yL + arch * 0.55], [x, yL - arch * 1.45], [x + hw, yL + arch * 0.55], 16);
  if (E.love === "heart") {
    // HEART EYES: a red heart for each pupil, an ink rim, a light; it stands whole under the arched lid
    const hr = 6.9 * pk;
    f.fill(heart(x + gx, cy + 0.2, hr), RED, 1.25);
    f.fill(f.arc(x + gx - 0.42 * hr, cy - 0.28 * hr, 0.2 * hr, 0.24 * hr, 0, 360, 14), "#ffffff", 0);
    f.fill(f.arc(x + gx + 0.3 * hr, cy + 0.32 * hr, 0.09 * hr, 0.09 * hr, 0, 360, 10), "#ffffff", 0);
  } else {
    clipTo(f, R([...lidPts, [x + hw + 3, cy + ry + 5], [x - hw - 3, cy + ry + 5]]), () => {
      f.fill(R(f.arc(x + gx, cy, rx, ry)), INK, 0);
      if (dot) return;
      const m = Math.min(rx, ry * 0.9);
      // the light: round, high on the side of the light; a heart when smitten
      if (E.love === "light") f.fill(heart(x + gx - 0.3 * rx, cy - 0.3 * ry, 0.4 * m), "#ffffff", 0);
      else f.fill(f.arc(x + gx - 0.34 * rx, cy - 0.3 * ry, 0.3 * m, 0.3 * m), "#ffffff", 0);
      if (o.sparkle || E.love) f.fill(f.arc(x + gx + 0.34 * rx, cy + 0.38 * ry, 0.13 * m, 0.13 * m), "#ffffff", 0);
    });
  }
  f.line(R(lidPts), lw);
  wingAt(x + s * hw, yL + arch * 0.55, lw);
};

/** the wipe: the rig's eye lives within 10.6 u of its middle sideways, from 8.6 above to 7.9 below (a dot eye is the
 *  tallest); the brows above it and the mouth below stay */
const BOX = (x: number): P2[] => [[x - 10.6, -8.6], [x + 10.6, -8.6], [x + 10.6, 7.9], [x - 10.6, 7.9]];
const wipe = (f: FaceKit, pts: P2[]) => { const g = f.g; g.save(); g.globalCompositeOperation = "destination-out"; trace(f, pts); g.fillStyle = "#000"; g.fill(); g.restore(); };
/** the rig's own blush (rig3d.ts drawFace, FX.blush) laid again inside the wiped box, so it runs on unbroken */
const rigBlush = (f: FaceKit, s: number, box: P2[]) => clipTo(f, box, () => {
  const g = f.g, [bx, by] = f.px(s * 20.5, 9.6), r = 6.6 * f.u, gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, "rgba(238,118,140,0.5)"); gr.addColorStop(0.55, "rgba(238,118,140,0.3)"); gr.addColorStop(1, "rgba(238,118,140,0)");
  g.globalCompositeOperation = "destination-over"; g.translate(bx, by); g.scale(1, 0.6); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
});
/** THE FLUSH of the love eyes: a warm blush on each cheek with three short strokes across it */
const flush = (f: FaceKit) => {
  const g = f.g;
  for (const s of [-1, 1]) {
    const [bx, by] = f.px(s * 21.5, 10.6), r = 8.4 * f.u, gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, "rgba(232,86,110,0.62)"); gr.addColorStop(0.6, "rgba(232,86,110,0.32)"); gr.addColorStop(1, "rgba(232,86,110,0)");
    g.save(); g.globalCompositeOperation = "destination-over"; g.translate(bx, by); g.scale(1, 0.6); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore();
    for (let i = -1; i <= 1; i++) { const x0 = s * 21.5 + i * 3.6; f.line([[x0 + 1.3, 8.6], [x0 - 1.3, 12.4]], 1.35, BLUSH); }
  }
};
const drawOver = (f: FaceKit, E: EyeSet, o: InkEyeO) => {
  if (f.lens) return;
  const kind = RIG[f.expr as string] ?? "shut";
  for (const s of [-1, 1]) {
    const x = s * f.sp, { lid, gaze } = blinkGaze(f, s, kind), box = BOX(x);
    wipe(f, box);
    if (RIG_BLUSH.has(f.expr as string)) rigBlush(f, s, box);
    inkEye(f, x, 0.4, s, E, lid, gaze, o);
  }
  if (E.love) flush(f);
};

/** JULIET'S EYES (see the head of this file): wing = her liner's wing, pupilK = her pupils' size */
export const herEyes = (o: InkEyeO = {}): Acc => {
  const O: InkEyeO = { wing: 0.9, pupilK: 1.1, lidK: 0.95, wide: 0.95, sparkle: true, ...o };
  return {
    name: "herEyes", slots: [], key: `rjHerEyes|${JSON.stringify(O)}`,
    face(f) { const E = HER_EYES[f.expr as string]; if (E) drawOver(f, E, O); },
  };
};
/** THE LOVE EYES on a figure whose own eyes stay the rig's (Romeo): only the two love settings are drawn */
export const loveEyes = (o: InkEyeO = {}): Acc => {
  const O: InkEyeO = { wing: 0, pupilK: 1.06, lidK: 1, wide: 0.95, sparkle: true, ...o };
  return {
    name: "loveEyes", slots: [], key: `rjLoveEyes|${JSON.stringify(O)}`,
    face(f) { const E = LOVE_EYES[f.expr as string]; if (E) drawOver(f, E, O); },
  };
};
