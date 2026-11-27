// 月老 v6 (28 Nov 2026): HIS NEW LOOK. The owner on the v5 cut: "Scary eyes, generic hair and style ... redesign his
// character design completely"; "His line in hair, eyebrow clipping with hair ... redesign his whole esthetic,
// clothing, look, also think carefully about the layering of different parts like brow, beard"; "just give him normal
// round hands". Every part here is film-local (the rig and the kit are read only) and is drawn in a fixed order, so no
// part can cross another:
//   FACE DRAWING, bottom to top:  skin -> nose, beard (faceUnder) -> the rig's mouth -> ylEyes (the rig's eyes wiped and
//   drawn again as the series' ink eye) -> the moustache (over the mouth's top) -> the long brows (over everything,
//   above the eyes) -> the forehead (lines and the shine, above the brows).
//   He is BALD (people.ts Person.bald: no hair is painted on the head ball at all), so no brow, beard or line of the
//   face can ever meet a painted hairline again; his white hair is 3D: a ring round the back of the head that comes
//   down in front of the ears onto the beard (romeo/acc/head.ts hairRing), and a small topknot tied in red.
//   3D, in front of the chest: the cloud beard (cloudBeard), drawn at its TRUE depth (people.ts freeDepth), so a hand in
//   front of it is in front of it.
//   ylEyes(o)         the ink eye for every face (romeo/acc/eyes.ts inkEye), keyed by the rig expression of the face's
//                     eyes; the white ring eyes of nervous / shock / aghast are gone. squeeze (laugh, wince), spiral and
//                     bead keep the rig's own. Under-eye lines drawn last (never wiped).
//   longBrows(o)      寿眉: long white brows, outlined, a tufted top edge, a lock hanging from each outer end past the eye
//   cloudMoustache(o) a white moustache that sweeps out and down to a cloud curl at each end (slot lip: the mouth moves
//                     down under it)
//   cloudBeard(o)     the face part (round the mouth, the chin and the jaw up to the hair ring's locks) and, in 3D, a
//                     beard hanging over the chest in three cloud tiers (祥云) to a point
//   forehead(o)       two soft age lines above the brows and the shine on the bald dome
//   wideSleeves(o)    广袖: a wide sleeve round each arm, rebuilt from the arm every frame (as kit armour.ts limbSleeve),
//                     wider toward the wrist, the cloth hanging below the arm, a gold cuff, a dark opening the hand
//                     comes out of
//   robeTrim(o)       on the kit robe: gold cloud scrolls along the collar bands, large faint cloud roundels on the cloth
//   moonToken(o)      the kit pendant's jade ring swapped for a crescent moon of pale jade with a red tassel (月)
//   officialBadge(o)  option B: a square badge (补子) on the chest with the crescent and a knot of red thread
//   cloudCollar(o)    option C: a cloud collar (云肩) over the shoulders
//   staff(o)          option C: a tall staff in the hand with a gourd and a skein of red thread
import * as THREE from "three";
import type { Acc, FaceKit, OutfitKit, P2, PartKit } from "../../group/kit/rig3d";
import { inkEye, type EyeSet, type InkEyeO } from "../../romeo/acc/eyes";
import { shade, turned } from "../../group/kit/rigacc/shapes";
import { leafGeo } from "../../wanbi/acc/envoy";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;
const wrapA = (a: number) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const luma = (col: string) => { const c = new THREE.Color(col).convertLinearToSRGB(); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };
/** runs fn whenever the object's world matrix is brought up to date (once per traversal of the scene) */
const everyFrame = (o: THREE.Object3D, fn: () => void) => {
  const base = o.updateMatrixWorld;
  o.updateMatrixWorld = function (force?: boolean) { fn(); base.call(o, force); };
};
/** one normal per position (the mean of the faces that meet there), so that the ink hull stays closed over seams */
const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};

/** HIS COLOURS. White never brighter than WHITE (the ink and the lights need room above it) */
export const YL = {
  red: "#c8332b", redDeep: "#8e2320", redLight: "#d9503f", gold: "#d9a640", goldDeep: "#9c7024", cream: "#f1e6cc",
  white: "#ece7de", whiteLo: "#cfc7ba", jade: "#9ad4b0", jadeDeep: "#4f9a76", skin: "#f0b993", line: "#c48466", ink: "#2a211c",
} as const;

// =============================================================================================================== EYES
type RigEye = "dot" | "lid" | "down" | "slit" | "shut" | "ring";
/** the rig's eye kind for each rig expression (rig3d.ts FACES, not exported): what it draws when the face is open */
const RIG: Record<string, RigEye> = {
  smile: "dot", lick: "dot", neutral: "lid", stern: "lid", smug: "lid", huff: "lid", rage: "lid", scheming: "lid",
  sad: "down", focus: "down", deadpan: "slit", cool: "slit", hush: "slit",
  relief: "shut", relief_open: "shut", grin: "shut", happy: "shut", smile_closed: "shut", sleep: "shut", sigh: "shut", whistle: "shut", gloom: "shut", laughcry: "shut",
  nervous: "ring", shock: "ring", aghast: "ring",
};
/** 月老'S EYES by the rig expression of the face's eyes. His resting eye is KIND: half shut under an arched lid, the
 *  pupil half hidden. Worry is the eye wide with a small pupil, shock the whole round pupil under a high round lid,
 *  aghast a pin pupil: never the white ring. */
export const YL_EYES: Record<string, EyeSet> = {
  smile: { open: 0.74, pupil: "round", round: 0.8, tilt: -3 }, lick: { open: 0.74, pupil: "round", round: 0.8 },
  neutral: { open: 0.62, pupil: "round", round: 0.4 },
  stern: { open: 0.46, pupil: "round", tilt: 9, round: 0.1 }, huff: { open: 0.44, pupil: "round", tilt: 10 }, rage: { open: 0.42, pupil: "round", tilt: 13 },
  scheming: { open: 0.38, pupil: "round", tilt: 11 }, smug: { open: 0.42, pupil: "round", tilt: 3, round: 0.3 },
  sad: { open: 0.5, pupil: "round", tilt: -9, round: 0.15 }, focus: { open: 0.4, pupil: "round", tilt: -2, round: 0.2 },
  deadpan: { open: 0.3, pupil: "round" }, cool: { open: 0.32, pupil: "round", tilt: 3 }, hush: { open: 0.32, pupil: "round", tilt: 3 },
  relief: { open: 0, shut: "smile" }, relief_open: { open: 0, shut: "smile" }, grin: { open: 0, shut: "smile" }, happy: { open: 0, shut: "smile" },
  smile_closed: { open: 0, shut: "smile" }, laughcry: { open: 0, shut: "smile" },
  sleep: { open: 0, shut: "sleep" }, sigh: { open: 0, shut: "line" }, whistle: { open: 0, shut: "line" }, gloom: { open: 0, shut: "line" },
  nervous: { open: 0.84, pupil: "round", pk: 0.72, tilt: -6, round: 0.55 },
  shock: { open: 1, pupil: "round", pk: 0.8, round: 0.9 },
  aghast: { open: 1, pupil: "dot", round: 1 },
};
/** the rig expressions that draw their own blush (rig3d.ts FACES blush: true): put back where the box was wiped */
const RIG_BLUSH = new Set(["relief", "relief_open", "smile_closed", "happy"]);

const trace = (f: FaceKit, pts: P2[]) => { const g = f.g; g.beginPath(); pts.forEach((p, i) => { const [a, b] = f.px(p[0], p[1]); if (i) g.lineTo(a, b); else g.moveTo(a, b); }); g.closePath(); };
const clipTo = (f: FaceKit, pts: P2[], fn: () => void) => { f.g.save(); trace(f, pts); f.g.clip(); fn(); f.g.restore(); };
const wipe = (f: FaceKit, pts: P2[]) => { const g = f.g; g.save(); g.globalCompositeOperation = "destination-out"; trace(f, pts); g.fillStyle = "#000"; g.fill(); g.restore(); };
const dark = (d: Uint8ClampedArray, k: number) => d[k + 3] >= 150 && d[k] + d[k + 1] + d[k + 2] <= 330;
/** the pixels of a box in u (x0..x1, y0..y1) and how to read one */
const grab = (f: FaceKit, x0: number, y0: number, x1: number, y1: number) => {
  const [pxa, pya] = f.px(x0, y0), [pxb, pyb] = f.px(x1, y1), X = Math.round(pxa), Y = Math.round(pya), W = Math.max(1, Math.round(pxb - pxa)), H = Math.max(1, Math.round(pyb - pya));
  return { d: f.g.getImageData(X, Y, W, H).data, W, H, ux: (i: number) => x0 + i / f.u, uy: (j: number) => y0 + j / f.u };
};
/** what the rig drew for an open-kind eye (as romeo/acc/eyes.ts readEye): its ink box and the middle of its lower half.
 *  (The window reaches 8 u toward the nose and 10 u outward, not romeo's 12 each way: his nose's line sits high, its
 *  ends at x 3.4 and y 6.7, and the wider window took them for part of the eye. A box that wide is a half blink, and
 *  every open eye was drawn half shut.) */
const readEye = (f: FaceKit, s: number) => {
  const x0 = s * f.sp, G = s > 0 ? grab(f, x0 - 8, -9, x0 + 10, 8.2) : grab(f, x0 - 10, -9, x0 + 8, 8.2);
  let l = G.W, r = -1, t = G.H, b = -1;
  for (let yy = 0; yy < G.H; yy++) for (let xx = 0; xx < G.W; xx++) {
    if (!dark(G.d, (yy * G.W + xx) * 4)) continue;
    if (xx < l) l = xx; if (xx > r) r = xx; if (yy < t) t = yy; if (yy > b) b = yy;
  }
  if (r < 0) return null;
  const mid = Math.round((t + b) / 2);
  let n = 0, sx = 0;
  for (let yy = mid; yy <= b; yy++) for (let xx = l; xx <= r; xx++) if (dark(G.d, (yy * G.W + xx) * 4)) { n++; sx += xx; }
  return { w: (r - l + 1) / f.u, h: (b - t + 1) / f.u, cx: n ? G.ux(sx / n) : x0 };
};
/** is there ink in the column x between y0 and y1 (u)? */
const inkIn = (f: FaceKit, x: number, y0: number, y1: number) => {
  const G = grab(f, x - 0.8, y0, x + 0.8, y1);
  for (let k = 0; k < G.d.length; k += 4) if (dark(G.d, k)) return true;
  return false;
};
/** the blink (0 open, 0.5 half, 1 shut) and the gaze (-1..1) on the rig's drawing of the eye at side s */
const blinkGaze = (f: FaceKit, s: number, kind: RigEye): { lid: number; gaze: number } => {
  const x0 = s * f.sp;
  if (kind === "shut") return { lid: 0, gaze: 0 };
  if (kind === "ring") {
    // the ring (r 10.75 round y -1): open = ink at its top and its bottom; the half blink erases its top half; a full
    // blink is a dash with neither. The gaze from the pupil alone (inside r 7: the ring's own ink is further out)
    const top = inkIn(f, x0, -14.2, -9.6), bot = inkIn(f, x0, 7.6, 12.2), lid = !bot ? 1 : !top ? 0.5 : 0;
    if (lid >= 1) return { lid, gaze: 0 };
    const G = grab(f, x0 - 7, -8, x0 + 7, 6);
    let n = 0, sx = 0;
    for (let yy = 0; yy < G.H; yy++) for (let xx = 0; xx < G.W; xx++) {
      const ux = G.ux(xx) - x0, uy = G.uy(yy) + 0.6;
      if (ux * ux + uy * uy > 49 || !dark(G.d, (yy * G.W + xx) * 4)) continue;
      n++; sx += ux;
    }
    return { lid, gaze: n ? clamp(sx / n / 4.4, -1, 1) : 0 };
  }
  const e = readEye(f, s);
  if (!e) return { lid: 0, gaze: 0 };
  let lid = 0;
  if (kind === "dot") lid = e.h < 6 ? 1 : e.w > 13 ? 0.5 : 0;
  else if (kind === "lid") lid = e.h < 4.8 ? 1 : e.h < 9 ? 0.5 : 0;
  else if (kind === "down") lid = e.h < 4.8 ? 1 : e.h < 7.2 ? 0.5 : 0;
  else lid = e.h < 4.8 ? 1 : 0;
  const k = kind === "dot" ? 2.2 : 3.6;
  return { lid, gaze: lid >= 1 ? 0 : clamp((e.cx - x0) / k, -1, 1) };
};
/** the box the rig's eye lives in (a ring eye: the disc round it) */
const BOX = (x: number): P2[] => [[x - 10.6, -8.6], [x + 10.6, -8.6], [x + 10.6, 7.9], [x - 10.6, 7.9]];
const RING_BOX = (x: number): P2[] => Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return [x + Math.cos(a) * 12.9, -1 + Math.sin(a) * 12.9] as P2; });
/** the rig's own blush (rig3d.ts drawFace, FX.blush) laid again inside the wiped box */
const rigBlush = (f: FaceKit, s: number, box: P2[]) => clipTo(f, box, () => {
  const g = f.g, [bx, by] = f.px(s * 20.5, 9.6), r = 6.6 * f.u, gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, "rgba(238,118,140,0.5)"); gr.addColorStop(0.55, "rgba(238,118,140,0.3)"); gr.addColorStop(1, "rgba(238,118,140,0)");
  g.globalCompositeOperation = "destination-over"; g.translate(bx, by); g.scale(1, 0.6); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
});
/** HIS EYES (see the head of this file). bags = the soft lines under each eye (an old man's), in this colour */
export const ylEyes = (o: InkEyeO & { bags?: string | false } = {}): Acc => {
  const O: InkEyeO = { wing: 0, pupilK: 0.94, lidK: 1, wide: 0.92, sparkle: false, ...o }, bags = o.bags === undefined ? YL.line : o.bags;
  return {
    name: "ylEyes", slots: [], key: `ylEyes|${JSON.stringify(O)}|${bags}`,
    face(f) {
      const E = YL_EYES[f.expr as string];
      if (!E || f.lens) return;
      const kind = RIG[f.expr as string] ?? "shut";
      for (const s of [-1, 1]) {
        const x = s * f.sp, { lid, gaze } = blinkGaze(f, s, kind), box = kind === "ring" ? RING_BOX(x) : BOX(x);
        wipe(f, box);
        if (RIG_BLUSH.has(f.expr as string)) rigBlush(f, s, box);
        inkEye(f, x, 0.4, s, E, lid, gaze, O);
        if (bags) f.line(f.quad([x - s * 5.2, 9.2], [x + s * 0.8, 11.9], [x + s * 6.6, 9.5], 7), 1.35, bags);
      }
    },
  };
};

// ============================================================================================================== BROWS
const firstInk = (f: FaceKit, x: number, y0: number, y1: number): number | null => {
  const [px, pa] = f.px(x, y0), [, pb] = f.px(x, y1), h = Math.max(1, Math.round(pb - pa));
  const d = f.g.getImageData(Math.round(px), Math.round(pa), 1, h).data;
  for (let i = 0; i < h; i++) if (d[i * 4 + 3] > 150) return y0 + ((y1 - y0) * i) / h;
  return null;
};
/** the brow as the rig drew it: its top edge through three places (inner, middle, outer); t = -1 .. 1 */
const browEdge = (f: FaceKit, s: number, D = 6.2) => {
  const x0 = s * f.sp, yi = firstInk(f, x0 - s * D, -36, -3), ym = firstInk(f, x0, -36, -3), yo = firstInk(f, x0 + s * D, -36, -3);
  if (yi === null || ym === null || yo === null) return null;
  const b1 = (yo - yi) / 2, b2 = (yo + yi - 2 * ym) / 2;
  return { x0, D, edge: (t: number) => (Math.abs(t) <= 1 ? ym + b1 * t + b2 * t * t : (t > 0 ? yo : yi) + (b1 + 2 * b2 * Math.sign(t)) * (t - Math.sign(t)) * 0.5) };
};
/** a tapered stroke along the curve a -> k -> b (u): w0 wide at a, w1 at b; its outline as one closed shape */
const taper = (a: P2, k: P2, b: P2, w0: number, w1: number, n = 14): P2[] => {
  const L: P2[] = [], R: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t, x = s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], y = s * s * a[1] + 2 * s * t * k[1] + t * t * b[1];
    const dx = 2 * s * (k[0] - a[0]) + 2 * t * (b[0] - k[0]), dy = 2 * s * (k[1] - a[1]) + 2 * t * (b[1] - k[1]), l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, t ** 0.85) / 2;
    L.push([x - (dy / l) * w, y + (dx / l) * w]); R.push([x + (dy / l) * w, y - (dx / l) * w]);
  }
  return [...L, ...R.reverse()];
};
/** shapes of one colour with one outline round them all (no seam where they meet): the ink first, then the fills */
const fillAll = (f: FaceKit, shapes: P2[][], col: string, ol: number) => {
  for (const s of shapes) f.line([...s, s[0], s[1]], ol * 2, f.INK);
  for (const s of shapes) f.fill(s, col, 0);
};
/** 寿眉, HIS LONG BROWS: white, outlined, a tufted top edge, the outer end running on into a lock that hangs past the
 *  outer corner of the eye (tail = its length, 1 = 13 u). They lie on the rig's brows as the rig drew them (read off
 *  the drawing), so every expression and every blink moves them. */
export const longBrows = (o: { col?: string; weight?: number; tail?: number } = {}): Acc => {
  const weight = o.weight ?? 4.8, tail = o.tail ?? 1;
  return {
    name: "longBrows", slots: [], key: `ylBrows|${o.col ?? ""}|${weight}|${tail}`,
    face(f) {
      const col = o.col ?? f.look.hairCol, strand = shade(col, 0.8), shapes: P2[][] = [], lines: P2[][] = [];
      const B2 = [browEdge(f, -1), browEdge(f, 1)];
      for (const s of [-1, 1]) {
        const B = B2[s < 0 ? 0 : 1];
        if (!B) continue;
        const X = (t: number) => B.x0 + s * B.D * t, tIn = -1.3, tOut = 1.5, N = 20, up: P2[] = [], lo: P2[] = [];
        for (let k = 0; k <= N; k++) {
          const u = k / N, t = lerp(tIn, tOut, u), e = B.edge(clamp(t, -1.45, 1.45));
          up.push([X(t), e - 1.5 - 1.25 * Math.abs(Math.sin(u * Math.PI * 3.5)) * (1 - 0.4 * u)]);
          lo.push([X(t), e - 0.4 + lerp(weight, weight * 0.84, u)]);
        }
        shapes.push([...up, ...lo.reverse()]);
        // the lock: from the brow's outer part, out a little and down past the outer corner of the eye, to a point
        const tA = 1.15, eA = B.edge(tA), A: P2 = [X(tA), eA + weight * 0.42], K: P2 = [B.x0 + s * 13.4, eA + 3.6 + 2 * tail], Bt: P2 = [B.x0 + s * (13.2 + 1.4 * tail), eA + 4.2 + 12.5 * tail];
        shapes.push(taper(A, K, Bt, weight * 0.92, 0.7));
        lines.push(f.quad([X(-0.9), B.edge(-0.9) + weight * 0.42], [X(0.2), B.edge(0.2) + weight * 0.3], [X(1.05), B.edge(1.05) + weight * 0.5], 8));
        lines.push(f.quad([A[0] + s * 0.4, A[1] + 1.2], [K[0], K[1] + 1.4], [lerp(K[0], Bt[0], 0.7), lerp(K[1], Bt[1], 0.7)], 8));
      }
      fillAll(f, shapes, col, 1.3);
      for (const l of lines) f.line(l, 0.95, strand);
    },
  };
};

// ========================================================================================================= MOUSTACHE
/** HIS MOUSTACHE: two white halves from under the nose out and down to a cloud curl at each end, beside the corners of
 *  the mouth (slot lip: the rig lowers the mouth under it). One outline round both halves. */
export const cloudMoustache = (o: { col?: string; wide?: number } = {}): Acc => {
  const wide = o.wide ?? 1;
  return {
    name: "moustache", slots: ["lip"], key: `ylMoustache|${o.col ?? ""}|${wide}`,
    face(f) {
      const col = o.col ?? f.look.hairCol, [mx] = f.mouth, y = f.lip + 0.2, q = f.quad, curl = shade(col, 0.72);
      const half = (s: number): P2[] => {
        const X = (x: number) => mx + s * x * wide;
        return [...q([X(0.6), y - 2.4], [X(7.6), y - 5.6], [X(14.2), y - 1.4], 10), ...q([X(14.2), y - 1.4], [X(19.8), y + 2.6], [X(18.4), y + 8.4], 8).slice(1),
          ...q([X(18.4), y + 8.4], [X(17), y + 11.8], [X(14.2), y + 9.8], 6).slice(1), ...q([X(14.2), y + 9.8], [X(11.4), y + 3.6], [X(0.6), y + 3.9], 10).slice(1)];
      };
      fillAll(f, [half(-1), half(1)], col, 0.8);
      for (const s of [-1, 1]) {
        const X = (x: number) => mx + s * x * wide, sp: P2[] = [];
        // the cloud curl at the end: a small spiral
        for (let i = 0; i <= 14; i++) { const a = rad(-30 + i * 26), r = 2.7 - i * 0.13; sp.push([X(15.8) + s * Math.cos(a) * r * wide, y + 7.2 + Math.sin(a) * r]); }
        f.line(sp, 1.05, curl);
        f.line(q([X(3), y + 0.9], [X(9), y - 1.6], [X(13.8), y + 3.4], 7), 0.95, curl);
      }
    },
  };
};

// ============================================================================================================= BEARD
/** the cloud beard's hanging part: a tongue of hair from inside the chin down over the chest (as kit facehair.ts
 *  beardGeo) whose width swells in three rounded tiers with a notch between them, and runs out to a point. Head units
 *  through toM. uv: u round it (0.25 = its front), v along it (0 at the chin). */
const TIERS: [number, number, number][] = [[0.24, 0.47, 0.07], [0.47, 0.69, 0.09], [0.69, 0.88, 0.1]];
const tierK = (t: number) => { for (const [a, b, A] of TIERS) if (t >= a && t <= b) return 1 + A * Math.sin((Math.PI * (t - a)) / (b - a)) ** 0.55; return 1; };
const cloudBeardGeo = (toM: (v: THREE.Vector3) => THREE.Vector3, len: number, wide: number, deep: number) => {
  const NS = 40, NC = 18, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3();
  // (its top stays inside the head until it is under the chin: it comes out of the drawn beard there, so no outline
  // of it crosses the face; then it swings forward over the chest)
  const y0 = -0.45, mid = (t: number): [number, number] => [lerp(y0, -len, t), 0.3 + 0.46 * smooth((t - 0.08) / 0.3) - 0.1 * smooth((t - 0.45) / 0.55)];
  const [ya, za] = mid(0), [yb, zb] = mid(1);
  toM(v.set(0, ya, za)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, [y, z] = mid(t);
    const k = (0.35 + 0.65 * smooth(t / 0.3)) * (1 - 0.82 * smooth((t - 0.32) / 0.68) ** 1.1) * tierK(t), w = (wide / 2) * k, d = (deep / 2) * (0.55 + 0.45 * Math.min(1, k));
    for (let j = 0; j < NC; j++) { const p = (j / NC) * Math.PI * 2; toM(v.set(w * Math.cos(p), y, z + d * Math.sin(p))); pos.push(v.x, v.y, v.z); uv.push(j / NC, t); }
  }
  toM(v.set(0, yb, zb)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const R = (i: number, j: number) => 1 + (i - 1) * NC + (j % NC), end = 1 + (NS - 1) * NC;
  for (let j = 0; j < NC; j++) { idx.push(0, R(1, j + 1), R(1, j)); idx.push(end, R(NS - 1, j), R(NS - 1, j + 1)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NC; j++) idx.push(R(i, j), R(i, j + 1), R(i + 1, j), R(i, j + 1), R(i + 1, j + 1), R(i + 1, j));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return weld(g);
};
/** a small cloud curl (祥云): a spiral of r px at (x, y) turning toward s, and its tail */
const curlAt = (g: CanvasRenderingContext2D, x: number, y: number, r: number, s: number) => {
  g.beginPath();
  for (let i = 0; i <= 24; i++) { const a = rad(90 + s * i * 22), rr = r * (1 - i / 30); const px = x + Math.cos(a) * rr * s, py = y - Math.sin(a) * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.stroke();
};
/** HIS BEARD (see the head of this file). len = how far below the head's middle the hanging part ends (head radii),
 *  wide = its width (head radii). face = false: only the 3D part (a figure that draws its own face part). */
export const cloudBeard = (o: { col?: string; len?: number; wide?: number; face?: boolean } = {}): Acc => {
  const len = o.len ?? 2.45, wide = o.wide ?? 0.86, faceOn = o.face ?? true;
  return {
    name: "beard", slots: ["chin"], key: `ylBeard|${o.col ?? ""}|${len}|${wide}|${faceOn}`,
    faceUnder: faceOn ? (f) => {
      const col = o.col ?? f.look.hairCol, my = f.mouth[1], q = f.quad, strand = shade(col, 0.78);
      // the upper edge, from the head's outline at the side (under the hair ring's lock) in under the cheek, round to
      // the corner of the mouth and under the moustache; the mouth is drawn on the beard
      const side = (s: number): P2[] => [[s * 51, 4], ...q([s * 48.5, 8], [s * 42, 18.5], [s * 31, 19.6], 8), ...q([s * 31, 19.6], [s * 21.5, 20.6], [s * 15.6, my - 6.6], 6).slice(1)];
      const top = [...side(-1), ...side(1).reverse()];
      f.fill([...top, [64, 6], [64, 30], [52, 72], [-52, 72], [-64, 30], [-64, 6]], col, 1.6);
      for (const [x, y, s] of [[-31, my + 8.5, -1], [-13, my + 15, -1], [13, my + 15, 1], [31, my + 8.5, 1]] as [number, number, number][]) {
        const pts: P2[] = [];
        for (let i = 0; i <= 12; i++) { const a = rad(200 - s * i * 24), r = 3.2 - i * 0.16; pts.push([x + Math.cos(a) * r * s, y + Math.sin(a) * r]); }
        f.line(pts, 1.1, strand);
      }
    } : undefined,
    build(b) {
      const col = o.col ?? b.look.hairCol, lo = shade(col, luma(col) > 0.6 ? 0.8 : 1.5);
      const map = b.tex(128, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 128, 256);
        g.strokeStyle = lo; g.lineCap = "round";
        // flowing strands down the front (u 0.25 = the front), gathering toward the point; a curl or two at the tiers' sides
        g.lineWidth = 2.6;
        for (const [u, v0, v1, sw] of [[0.1, 0.18, 0.62, 5], [0.17, 0.3, 0.86, -4], [0.25, 0.22, 0.95, 4], [0.33, 0.32, 0.84, -5], [0.4, 0.2, 0.6, 4]] as [number, number, number, number][]) {
          const x0 = u * 128, x1 = lerp(x0, 32, 0.55);
          g.beginPath(); g.moveTo(x0, v0 * 256); g.bezierCurveTo(x0 + sw, lerp(v0, v1, 0.33) * 256, x1 - sw, lerp(v0, v1, 0.66) * 256, x1, v1 * 256); g.stroke();
        }
        g.lineWidth = 2.2;
        curlAt(g, 12, 0.5 * 256, 5, -1); curlAt(g, 52, 0.72 * 256, 5, 1); curlAt(g, 20, 0.86 * 256, 4, -1);
      }, `ylBeard|${col}`);
      const mesh = b.solid("head", cloudBeardGeo(b.toM, len, wide, 0.42), { map, paint: "hair", ink: 0.0085 });
      // drawn at its true depth against the body (people.ts addPerson: freeDepth): a hand in front of it is in front
      mesh.userData.under = true; mesh.userData.rjFreeDepth = true;
      // it hangs from a pivot at the head's middle that turns about the head's upright axis toward the drawn face (as
      // the kit's long beard), and draws back into the head with the face in a back view
      const head = mesh.parent!, pv = new THREE.Group();
      head.add(pv); pv.add(mesh);
      everyFrame(pv, () => {
        const root = head.parent?.parent, fy = root ? (root.userData.hmFaceYaw as number | undefined) : undefined;
        if (fy === undefined) { pv.rotation.y = 0; pv.visible = true; pv.scale.set(1, 1, 1); return; }
        const e = head.matrixWorld.elements, on = smooth((root!.userData.hmFaceOn as number | undefined) ?? 1);
        pv.rotation.y = clamp(wrapA(fy - Math.atan2(e[8], e[10])), -rad(50), rad(50));
        pv.visible = on > 0.02; pv.scale.set(0.3 + 0.7 * on, 0.45 + 0.55 * on, 0.3 + 0.7 * on);
      });
    },
  };
};

// ========================================================================================================== FOREHEAD
/** TWO SOFT LINES above the brows (an old man's forehead) and THE SHINE on the bald dome, high on the side of the
 *  light (the person's right: screen left). Drawn after the brows, well above them. */
export const forehead = (o: { col?: string; shine?: boolean; lines?: number } = {}): Acc => {
  const col = o.col ?? YL.line, shine = o.shine ?? true, n = o.lines ?? 2;
  return {
    name: "forehead", slots: [], key: `ylForehead|${col}|${shine}|${n}`,
    face(f) {
      const q = f.quad;
      for (let i = 0; i < n; i++) {
        const y = -32.5 - i * 4.4, w = 9.5 - i * 2.2;
        f.line(q([-w, y + 0.9], [0, y - 1.3], [w, y + 0.9], 9), 1.3, col);
        for (const s of [-1, 1]) if (i === 0) f.line(q([s * 13, y + 2.4], [s * 17.5, y + 0.8], [s * 21.5, y + 2.6], 6), 1.2, col);
      }
      if (shine) {
        const g = f.g;
        g.save(); g.globalAlpha = 0.8;
        f.line(f.arc(-4, -27, 23, 17, 205, 238, 10), 3.4, "#fffaf2");
        f.fill(f.arc(-21.5, -40.5, 1.9, 1.6), "#fffaf2", 0);
        g.restore();
      }
    },
  };
};

// ================================================================================================== HAIR AT THE BACK
/** HIS HAIR: a band of short white locks lying on the back of the head from behind the ears round to the nape (from =
 *  the first lock's azimuth in degrees from the face; 116 = behind the ear). From the front nothing of it shows past
 *  the face: the head is a bald dome (romeo/acc/head.ts hairRing starts at the ear, and its front locks stood out
 *  beside the face like earmuffs). y = the band's middle (head units), puff = how far the locks stand out. */
export const backHair = (o: { col?: string; y?: number; from?: number; puff?: number } = {}): Acc => {
  const y0 = o.y ?? -0.12, from = o.from ?? 116, puff = o.puff ?? 0.6;
  return {
    name: "hairRing", slots: [], key: ["ylBackHair", o.col ?? "", y0, from, puff].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      const P = (az: number, y: number, r: number) => { const c = Math.sqrt(Math.max(0, 1 - y * y)), a = rad(az); return new THREE.Vector3(r * c * Math.sin(a), y, r * c * Math.cos(a)); };
      // each lock lies flat on the skull and runs down to a point; long and short locks in turn, so the band's lower
      // edge is a row of points (hair), not a roll
      const tuft = (az: number, k: number, long: boolean) => b.solid("head", leafGeo(b.toM, P(az, y0 + 0.2, 0.985), P(az, y0 - 0.05, 1.0 + 0.12 * k * puff), P(az, y0 - 0.3 - (long ? 0.14 : 0), 0.99), 0.17 + 0.04 * k, 0.3 + 0.06 * k, 0.42), { col, paint: "hair", ink: 0.0075 });
      const n = Math.max(1, Math.round((180 - from) / 14));
      for (const s of [-1, 1]) for (let i = 0; i < n; i++) tuft(s * (from + ((180 - from) * i) / n), lerp(0.55, 0.95, i / Math.max(1, n - 1)), i % 2 === 1);
      tuft(180, 0.9, true);
    },
  };
};

// ============================================================================================================ SLEEVES
const RING = 14, LIMB_RINGS = 33;
/** the figure's four limb tubes (the kit's limbs are the meshes with a "tangent3" attribute, children of the figure's
 *  group: right arm, left arm, right leg, left leg), or null before they exist (as kit armour.ts limbsOf) */
const limbsOf = (root: THREE.Object3D): THREE.BufferGeometry[] | null => {
  const U = root.userData;
  let t = U.hmxTubes as THREE.BufferGeometry[] | undefined;
  if (!t) {
    const seen: THREE.BufferGeometry[] = [];
    for (const c of root.children) { const g = (c as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if (g && g.attributes && g.attributes.tangent3 && !seen.includes(g)) seen.push(g); }
    if (seen.length < 4) return null;
    t = U.hmxTubes = seen.slice(0, 4);
  }
  return t;
};
const ringMid = (g: THREE.BufferGeometry, i: number, out: THREE.Vector3) => {
  const P = g.attributes.position.array as Float32Array;
  let x = 0, y = 0, z = 0;
  for (let j = 0, q = i * RING * 3; j < RING; j++, q += 3) { x += P[q]; y += P[q + 1]; z += P[q + 2]; }
  return out.set(x / RING, y / RING, z / RING);
};
/** the arm tube's own radius (m): the sleeve's cloth hangs below the arm by what it has beyond this */
const ARM_R = 0.013;
/** A WIDE SLEEVE round arm `limb` (0 right, 1 left) from ring i0 to ring i1 of the kit's tube (0 = the shoulder .. 32
 *  = the hand), rad(u) thick at share u along it. The cloth below the arm hangs: each ring's middle drops (toward the
 *  ground, square to the arm) by `droop` of what the ring has beyond the arm, so the arm runs along the top of the
 *  sleeve and the sleeve's belly hangs under it (an arm hanging down: no drop). The opening at the wrist is a dark
 *  funnel the hand comes out of. Rebuilt from the arm every frame (as kit armour.ts limbSleeve). */
const sleeveOn = (b: PartKit, o: { limb: number; i0: number; i1: number; rad: (u: number) => number; map: THREE.Texture; droop: number; ink: number }) => {
  // rings: 0 = the cap at the shoulder, 1..n = round the arm, n+1 = the lining's lip just inside the opening, n+2 = the
  // dark far end of the funnel. v: 1 at the shoulder .. 0.04 at the opening's edge (the lining), 0.014 the lip (a thin
  // cream rim between the edge and it), 0 the dark inside
  const M = 16, n = o.i1 - o.i0 + 1, NR = n + 3, pos = new Float32Array(NR * (M + 1) * 3), nor = new Float32Array(NR * (M + 1) * 3), uv = new Float32Array(NR * (M + 1) * 2), idx: number[] = [];
  const vOf = (i: number) => (i === 0 ? 1 : i <= n ? 1 - ((i - 1) / (n - 1)) * 0.96 : i === n + 1 ? 0.014 : 0.002);
  for (let i = 0; i < NR; i++) for (let j = 0; j <= M; j++) { uv[(i * (M + 1) + j) * 2] = j / M; uv[(i * (M + 1) + j) * 2 + 1] = vOf(i); }
  for (let i = 0; i < NR - 1; i++) for (let j = 0; j < M; j++) { const A = i * (M + 1) + j, B = A + 1, C = A + M + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  geo.userData.hull = () => geo;
  const mesh = b.solid("body", geo, { map: o.map, paint: "cloth", ink: o.ink });
  const torso = mesh.parent!, root = torso.parent!;
  root.add(mesh); mesh.frustumCulled = false;
  const C = Array.from({ length: n }, () => new THREE.Vector3()), T = new THREE.Vector3(), N = new THREE.Vector3(), Bn = new THREE.Vector3(), Dn = new THREE.Vector3(), Q = new THREE.Vector3();
  let last = NaN;
  const refresh = () => {
    const limbs = root.visible ? limbsOf(root) : null;
    if (!limbs || limbs[o.limb].attributes.position.count < LIMB_RINGS * RING) return;
    let sig = 0;
    for (let k = 0; k < n; k++) { ringMid(limbs[o.limb], o.i0 + k, C[k]); sig += C[k].x * (1.3 + 0.07 * k) + C[k].y * (2.1 + 0.05 * k) + C[k].z * (3.3 + 0.03 * k); }
    const e = torso.matrix.elements;
    sig += e[8] * 0.9 + e[10] * 1.9;
    if (sig === last) return;
    last = sig;
    N.set(e[8], e[9], e[10]);
    for (let i = 0; i < NR; i++) {
      const k = clamp(i - 1, 0, n - 1), cap = i === 0 ? -1 : i > n ? 1 : 0;
      T.copy(C[Math.min(k + 1, n - 1)]).sub(C[Math.max(k - 1, 0)]);
      if (T.lengthSq() < 1e-12) T.set(0, -1, 0); else T.normalize();
      N.addScaledVector(T, -N.dot(T));
      if (N.lengthSq() < 1e-8) { N.set(1, 0, 0).addScaledVector(T, -T.x); if (N.lengthSq() < 1e-6) N.set(0, 0, 1).addScaledVector(T, -T.z); }
      N.normalize(); Bn.crossVectors(T, N);
      const rr = o.rad(k / (n - 1)), r = i === n + 1 ? rr * 0.9 : cap ? 0.0015 : rr;
      // the drop: toward the ground, square to the arm (its length = how far the arm is from hanging plumb)
      Dn.set(0, -1, 0).addScaledVector(T, T.y);
      Q.copy(C[k]).addScaledVector(Dn, Math.max(0, rr - ARM_R) * o.droop);
      // the opening: the end cap is pulled back up the sleeve into a funnel (its far end inside, out of sight)
      if (cap > 0) Q.addScaledVector(T, i === n + 1 ? -0.16 * rr : -0.8 * rr);
      for (let j = 0; j <= M; j++) {
        const a = (j / M) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a), q = (i * (M + 1) + j) * 3;
        const nx = N.x * cs + Bn.x * sn, ny = N.y * cs + Bn.y * sn, nz = N.z * cs + Bn.z * sn;
        pos[q] = Q.x + nx * r; pos[q + 1] = Q.y + ny * r; pos[q + 2] = Q.z + nz * r;
        if (cap) { nor[q] = T.x * cap; nor[q + 1] = T.y * cap; nor[q + 2] = T.z * cap; } else { nor[q] = nx; nor[q + 1] = ny; nor[q + 2] = nz; }
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
  };
  everyFrame(mesh, refresh);
  return mesh;
};
/** 广袖, HIS WIDE SLEEVES (see sleeveOn): wide = the radius at the wrist (m), droop = how much of the cloth hangs below
 *  the arm. The cloth's colour, folds along it, the cuff (gold band, a cream lining at the edge) and the dark opening.
 *  No slot; hide: ["sleeves"] (the arm is then the rig's thin red arm again). */
export const wideSleeves = (o: { col?: string; cuff?: string; lining?: string; wide?: number; droop?: number; end?: number } = {}): Acc => {
  const col = o.col ?? YL.red, cuff = o.cuff ?? YL.gold, lining = o.lining ?? YL.cream, wide = o.wide ?? 0.07, droop = o.droop ?? 1, end = o.end ?? 30;
  const key = ["ylSleeves", col, cuff, lining, wide, droop, end].join("|");
  return {
    name: "sleeves", slots: [], key,
    build(b) {
      const map = b.tex(128, 512, (g) => {
        const Y = (v: number) => 512 * (1 - v);
        g.fillStyle = col; g.fillRect(0, 0, 128, 512);
        // folds down the sleeve: soft darker lines that fan out toward the wrist
        g.strokeStyle = shade(col, 0.84); g.lineCap = "round"; g.lineWidth = 4;
        for (const u of [0.12, 0.38, 0.62, 0.88]) { g.beginPath(); g.moveTo(u * 128, Y(0.7)); g.quadraticCurveTo(u * 128 + 3, Y(0.4), u * 128 + 7, Y(0.2)); g.stroke(); }
        // a cloud scroll above the cuff (u 0.25 and 0.75: front and back of the arm)
        g.strokeStyle = shade(col, 0.78); g.lineWidth = 3;
        for (const u of [0.25, 0.75]) { curlAt(g, u * 128 - 9, Y(0.27), 8, -1); curlAt(g, u * 128 + 9, Y(0.27), 8, 1); }
        // the cuff: a gold band, a cream lining at the very edge, the dark inside
        g.fillStyle = cuff; g.fillRect(0, Y(0.17), 128, Y(0.065) - Y(0.17));
        g.fillStyle = shade(cuff, 0.62); g.fillRect(0, Y(0.17) - 2, 128, 4); g.fillRect(0, Y(0.065) - 2, 128, 4);
        g.strokeStyle = shade(cuff, 0.7); g.lineWidth = 2.4;
        for (let x = 8; x < 128; x += 21) curlAt(g, x, (Y(0.17) + Y(0.065)) / 2 + 3, 5, x % 2 ? 1 : -1);
        g.fillStyle = lining; g.fillRect(0, Y(0.065), 128, Y(0.012) - Y(0.065));
        g.fillStyle = shade(col, 0.42); g.fillRect(0, Y(0.012), 128, 512 - Y(0.012));
      }, key);
      const rad0 = 0.03, rad1 = 0.033;
      const radF = (u: number) => (u < 0.38 ? lerp(rad0, rad1, u / 0.38) : lerp(rad1, wide, smooth((u - 0.38) / 0.62) ** 0.85));
      for (let i = 0; i < 2; i++) sleeveOn(b, { limb: i, i0: 1, i1: end, rad: radF, map, droop, ink: 0.0072 });
    },
  };
};

// ============================================================================================================== ROBE
/** where the kit robe puts its sash (garb.ts SASH_T / SASH_H) */
const SASH_T = 0.385, SASH_H = 0.042;
const bend = (a: P2, k: P2, b: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
/** a cloud roundel (团云) of radius rm metres at (az, t) on the clothes, in lines of colour col */
const roundel = (c: OutfitKit, az: number, t: number, rm: number, col: string, lw: number) => {
  const [x, y] = c.P(az, t), ry = rm * c.pxUp(t), rx = (c.az(rm, t) / 360) * c.W, g = c.g;
  for (const dx of [0, -c.W, c.W]) {
    if (x + dx + rx < 0 || x + dx - rx > c.W) continue;
    g.save(); g.translate(x + dx, y); g.scale(rx / ry, 1); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round";
    g.beginPath(); g.arc(0, 0, ry, 0, Math.PI * 2); g.stroke();
    curlAt(g, -ry * 0.32, ry * 0.08, ry * 0.42, -1); curlAt(g, ry * 0.32, ry * 0.08, ry * 0.42, 1);
    g.beginPath(); g.moveTo(-ry * 0.62, ry * 0.5); g.quadraticCurveTo(0, ry * 0.18, ry * 0.62, ry * 0.5); g.stroke();
    g.restore();
  }
};
/** ON THE KIT ROBE (list it after robe()): gold cloud scrolls along the two collar bands and large faint cloud
 *  roundels on the cloth (front, sides, back), a gold line along the sash's edges. col = the robe's cloth. */
export const robeTrim = (o: { col?: string; band?: string; roundels?: boolean } = {}): Acc => {
  const col = o.col ?? YL.red, band = o.band ?? YL.gold, rd = o.roundels ?? true;
  return {
    name: "robeTrim", slots: [], key: ["ylRobeTrim", col, band, rd].join("|"),
    outfit(c) {
      const P = c.P, ch = c.chin, g = c.g;
      if (rd) for (const [az, t, r] of [[-52, 0.6, 0.06], [64, 0.47, 0.055], [-118, 0.66, 0.06], [128, 0.55, 0.06], [180, 0.7, 0.065], [-160, 0.47, 0.055]] as [number, number, number][]) roundel(c, az, t, r, shade(col, 0.88), 4);
      // the collar bands (where the kit robe draws them): a darker line down the middle and small curls along it
      const over = bend(P(46, 1), P(20, ch - 0.1), P(-34, SASH_T + SASH_H - 0.01), 14), under = bend(P(-46, 1), P(-24, ch - 0.06), P(3, ch - 0.215), 10);
      g.strokeStyle = shade(band, 0.66); g.lineWidth = 2.6; g.lineCap = "round";
      for (const pts of [over, under]) for (let i = 1; i < pts.length - 1; i += 2) curlAt(g, pts[i][0], pts[i][1] + 2, 4.2, i % 4 === 1 ? 1 : -1);
      // the sash: a gold line along each edge
      c.line([P(-180, SASH_T + SASH_H - 0.006), P(180, SASH_T + SASH_H - 0.006)], band, 3);
      c.line([P(-180, SASH_T - SASH_H + 0.006), P(180, SASH_T - SASH_H + 0.006)], band, 3);
    },
  };
};

/** THE ROBE'S HEM (wrap the kit robe: hemmed(robe({...}))): the skirt's gold hem band gets a row of cloud scrolls and a
 *  thin gold line above it. The kit robe paints its skirt through PartKit.tex; this listens to that painting (the
 *  band's fill and the front edge's line say where the band is) and draws over it. If the painting is not as expected
 *  it draws nothing and prints one line. */
export const hemmed = (base: Acc, o: { band?: string; line?: string } = {}): Acc => {
  if (!base.build) return base;
  const band = (o.band ?? YL.gold).toLowerCase(), line = o.line ?? YL.goldDeep, build = base.build;
  return {
    ...base, key: base.key + "|ylHem",
    build(b) {
      const tex0 = b.tex;
      const tex: typeof b.tex = (w, h, draw, key) => tex0(w, h, (g) => {
        if (w !== 512 || h !== 512) { draw(g); return; }
        const rects: [string, number, number, number, number][] = [], fr = g.fillRect.bind(g);
        g.fillRect = (x: number, y: number, ww: number, hh: number) => { rects.push([String(g.fillStyle).toLowerCase(), x, y, ww, hh]); fr(x, y, ww, hh); };
        try { draw(g); } finally { g.fillRect = fr; }
        const bandR = rects.find((r) => r[0] === band && r[1] === 0 && r[3] >= w), edgeR = rects.find((r) => r[3] < w * 0.02 && r[4] > h * 0.1);
        if (!bandR || !edgeR) { console.log("QA: hemmed: the kit robe's skirt is not painted as expected (garb.ts changed?): no cloud hem"); return; }
        // the band from its top (y at 0.075 of the skirt's height) down to the hem (y at 0, from the front line's top at 0.78)
        const yB = bandR[2], y78 = edgeR[2], yH = yB + ((yB - y78) * 0.075) / 0.705, hb = yH - yB;
        g.strokeStyle = line; g.lineCap = "round"; g.lineWidth = Math.max(2, hb * 0.09);
        const cy = yB + hb * 0.55, r = hb * 0.3;
        for (let x = r * 1.6, i = 0; x < w; x += r * 3.4, i++) { curlAt(g, x - r * 0.9, cy, r, -1); curlAt(g, x + r * 0.9, cy, r, 1); g.beginPath(); g.moveTo(x - r * 1.7, cy + r * 0.9); g.quadraticCurveTo(x, cy + r * 0.2, x + r * 1.7, cy + r * 0.9); g.stroke(); }
        // a thin gold line above the band
        g.fillStyle = band; fr(0, yB - hb * 0.42, w, Math.max(2, hb * 0.12));
      }, key + "|ylHem");
      (b as { tex: typeof b.tex }).tex = tex;
      try { build(b); } finally { (b as { tex: typeof b.tex }).tex = tex0; }
    },
  };
};

// ========================================================================================================== THE TOKEN
/** the crescent's outline (m): a disc of radius R with a disc of radius r cut out of it, off-centre by (dx, dy) */
const crescent = (R: number, r: number, dx: number, dy: number, n = 26): THREE.Shape => {
  const d = Math.hypot(dx, dy), a = (R * R - r * r + d * d) / (2 * d), phi = Math.atan2(dy, dx), half = Math.acos(clamp(a / R, -1, 1));
  const p1 = [Math.cos(phi + half) * R, Math.sin(phi + half) * R], p2 = [Math.cos(phi - half) * R, Math.sin(phi - half) * R];
  const s = new THREE.Shape();
  // the outer arc the long way round, from p1 to p2, away from the cut
  for (let i = 0; i <= n; i++) { const th = phi + half + (i / n) * (2 * Math.PI - 2 * half); const x = Math.cos(th) * R, y = Math.sin(th) * R; if (i) s.lineTo(x, y); else s.moveTo(x, y); }
  // back along the cut, from p2 to p1, the short way (inside the disc)
  const b1 = Math.atan2(p2[1] - dy, p2[0] - dx), b2 = Math.atan2(p1[1] - dy, p1[0] - dx);
  let span = b2 - b1;
  while (span > 0) span -= 2 * Math.PI;
  if (span < -Math.PI * 2) span += 2 * Math.PI;
  // (the cut's arc that lies inside the big disc runs from p2 to p1 the way that passes nearest the big disc's middle)
  const midA = b1 + span / 2, mx = dx + Math.cos(midA) * r, my = dy + Math.sin(midA) * r;
  if (Math.hypot(mx, my) > R) span += 2 * Math.PI;
  for (let i = 1; i <= n; i++) { const th = b1 + (i / n) * span; s.lineTo(dx + Math.cos(th) * r, dy + Math.sin(th) * r); }
  return s;
};
/** HIS TOKEN (月): list it AFTER the kit pendant (garb.ts pendant). It finds that pendant's jade ring and hangs a
 *  crescent moon of pale jade in its place, on the same red cord, with a red silk tassel under it. It lies on the
 *  skirt in every pose (the pendant places it each frame). hide: ["pendant"] hides it with the pendant. */
export const moonToken = (o: { jade?: string; tassel?: string } = {}): Acc => {
  const jade = o.jade ?? YL.jade, tassel = o.tassel ?? YL.red;
  return {
    name: "moonToken", slots: [], key: ["ylMoon", jade, tassel].join("|"),
    build(b) {
      const geo = new THREE.ExtrudeGeometry(crescent(0.034, 0.027, 0.016, 0.009), { depth: 0.008, bevelEnabled: true, bevelThickness: 0.0028, bevelSize: 0.0026, bevelSegments: 2, curveSegments: 20 });
      geo.translate(0, 0, -0.004);
      const moon = b.solid("body", weld(geo), { col: jade, ink: 0.005 });
      const tas = b.solid("body", turned([[0, -0.056], [0.011, -0.05], [0.012, -0.012], [0.006, 0], [0, 0.002]], 0.002, 12), { col: tassel, paint: "cloth", ink: 0.004 });
      const bead = b.solid("body", new THREE.SphereGeometry(0.0062, 10, 8), { col: YL.gold, ink: 0.003 });
      const root = moon.parent!.parent!;
      let host: THREE.Object3D | null = null;
      for (const c of root.children) {
        if ((c as THREE.Group).isGroup && c.children.some((m) => (m as THREE.Mesh).geometry?.type === "TorusGeometry")) host = c;
      }
      if (!host) { console.log("QA: moonToken: no kit pendant on this figure (list pendant() before moonToken()): no crescent"); moon.visible = tas.visible = bead.visible = false; return; }
      // (the ring is shrunk out of sight: the rig sets every part's visibility itself each frame)
      for (const m of host.children) if ((m as THREE.Mesh).geometry?.type === "TorusGeometry") m.scale.setScalar(1e-4);
      host.add(moon, tas, bead);
      moon.position.set(0, -0.1, 0); moon.rotation.z = rad(-62);
      bead.position.set(0, -0.137, 0); tas.position.set(0, -0.142, 0);
    },
  };
};

// =============================================================================================== OPTION B: THE CLERK
/** option B: a square badge (补子) on the chest, gold-edged, with a cream crescent and a knot of red thread in it */
export const officialBadge = (o: { field?: string; edge?: string } = {}): Acc => {
  const field = o.field ?? "#2b3354", edge = o.edge ?? YL.gold;
  return {
    name: "badge", slots: ["chest"], key: ["ylBadge", field, edge].join("|"),
    outfit(c) {
      const t = 0.62, hm = 0.068, P = c.P, w = c.az(hm, t), g = c.g;
      const [x0, y0] = P(-w, t), [x1] = P(w, t), ry = hm * c.pxUp(t), top = y0 - ry, bot = y0 + ry;
      g.fillStyle = edge; g.fillRect(x0 - 6, top - 6, x1 - x0 + 12, bot - top + 12);
      g.fillStyle = field; g.fillRect(x0, top, x1 - x0, bot - top);
      const cx = (x0 + x1) / 2, cy = y0, R = ry * 0.5, sx = (x1 - x0) / (2 * ry);
      g.save(); g.translate(cx, cy - ry * 0.12); g.scale(sx, 1);
      g.fillStyle = YL.cream; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill();
      g.fillStyle = field; g.beginPath(); g.arc(R * 0.42, -R * 0.22, R * 0.82, 0, Math.PI * 2); g.fill();
      g.strokeStyle = YL.red; g.lineWidth = 5; g.lineCap = "round";
      g.beginPath(); g.moveTo(-R * 1.3, R * 1.25); g.bezierCurveTo(-R * 0.4, R * 0.55, R * 0.2, R * 1.7, R * 1.2, R * 0.9); g.stroke();
      g.restore();
    },
  };
};

// ================================================================================================ OPTION C: THE WANDERER
/** option C: a cloud collar (云肩) over the shoulders: four scalloped lobes round the neck, gold-edged */
export const cloudCollar = (o: { col?: string; edge?: string } = {}): Acc => {
  const col = o.col ?? YL.cream, edge = o.edge ?? YL.gold;
  return {
    name: "cloudCollar", slots: ["shoulder"], key: ["ylCollar", col, edge].join("|"),
    outfit(c) {
      const P = c.P, t1 = c.chin + 0.04, lobe = (a0: number, a1: number, low: number) => {
        const pts: P2[] = [P(a0, t1)];
        for (let i = 0; i <= 10; i++) { const u = i / 10, az = lerp(a0, a1, u), tt = lerp(t1 - 0.02, low, Math.sin(Math.PI * u) ** 0.7); pts.push(P(az, tt)); }
        pts.push(P(a1, t1));
        return pts;
      };
      for (const [a0, a1, low] of [[-92, -28, 0.64], [-28, 28, 0.6], [28, 92, 0.64], [92, 152, 0.66], [152, 208, 0.62], [-152, -92, 0.66]] as [number, number, number][]) c.poly(lobe(a0, a1, low), col, edge, 5);
    },
  };
};
/** option C: a tall staff (a bent branch) in hand `hand`, its foot on the ground, a gourd tied under its head with a
 *  skein of red thread hanging from it */
export const staff = (o: { hand?: 0 | 1; wood?: string; len?: number } = {}): Acc => {
  const hand = o.hand ?? 1, wood = o.wood ?? "#8a5a34", len = o.len ?? 1.28;
  return {
    name: "staff", slots: [hand ? "hand1" : "hand0"], key: ["ylStaff", hand, wood, len].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [0, 0, 0], rot: [0, 0, 0], hang: false });
      const low = -0.62, top = low + len;
      const pole = b.solid(g, new THREE.CylinderGeometry(0.0115, 0.0135, len, 10, 1), { col: wood, ink: 0.004 });
      pole.position.set(0, (low + top) / 2, 0);
      // the head: a knot of the branch curling over
      const knot = b.solid(g, new THREE.TorusGeometry(0.035, 0.012, 8, 18, Math.PI * 1.4), { col: wood, ink: 0.004 });
      knot.position.set(0.03, top + 0.012, 0); knot.rotation.z = rad(-20);
      // the gourd under it, and the red skein
      const gourd = b.solid(g, turned([[0, -0.07], [0.034, -0.05], [0.036, -0.03], [0.02, -0.006], [0.016, 0.004], [0.026, 0.024], [0.022, 0.044], [0.006, 0.054], [0, 0.056]], 0.004, 16), { col: "#e2b04a", ink: 0.004 });
      gourd.position.set(0.05, top - 0.09, 0.012);
      const skein = b.solid(g, new THREE.TorusGeometry(0.022, 0.006, 8, 16), { col: YL.red, paint: "cloth", ink: 0.003 });
      skein.position.set(0.05, top - 0.19, 0.01);
    },
  };
};
