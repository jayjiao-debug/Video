// THE CAST of the Newton film (PLAN 2). WP3. Each Person is Wanbi's type (a kit Look made ONCE + its accessories +
// scale + resting face); addPerson / personalise are Wanbi's (re-exported) with Qin's miniature-ink fix.
//   NEWTON (+ NEWTON_INK, NEWTON_GOWN, NEWTON_GOWN_INK, NEWTON_GOWN_SMUDGE)   HUMPHREY (+ HUMPHREY_SOOT)
//   PEOPLE = all by key;  SPEAKER_PERSON = who plays each speaker (ji = the camera: null);  newtonAt(f, keys) = which
//   Newton plays frame f;  NEWTON_BY / newtonFor({ ink, gown }) = the figure for a state;  laugh(t) = THE LAUGH (G53);
//   HUMPHREY_BY;  addPerson(rc, p) -> Rig
// (the same Person object every time: World.actor caches one figure per Person)
// WHO IS WHO AT A GLANCE (preview/people_lineup.ts):
//   NEWTON    43, scale 1.06, narrow (width 0.9), leaning 5 deg forward at rest. A ROUND head, his OWN long GREY hair
//             parted in the middle falling past the jaw to the shoulders (locks), the uncombed bird's nest of tufts on
//             the crown ("nest") and a goose quill behind his right ear ("earQuill"), BOTH ALL DAY (ONE quill: when he
//             writes it is in his hand and gone from the ear); a DARK BROWN coat
//             open wide over a CRIMSON waistcoat with a row of pale brass buttons (his one colour), the white FALLING
//             BAND (two broad tabs) under the chin, the coat's skirts to the knees, dark breeches and grey stockings.
//             Resting face: deadpan. (Gate 1, 14 Nov 2026: personality_sheet.md section 3, fixes 1-5.)
//   (gown)    the same under the black academic gown: black panels down both sides of the front, black behind to the
//             knees (outdoors in C and D, the lecture)
//   (ink)     a blue-black ink smear across his nose (A until D's wipe); "smudge" = the ghost after her first stroke
//   HUMPHREY  early 20s, scale 0.94, rounder (width 1.16): a round face, short brown hair to the collar, a plain DRAB
//             grey-brown coat (it steps back from Newton's crimson) with a small white collar; resting face smile
//             (open dot eyes, polite: never Newton's lidded slits; a shot's "neutral" shows as "smile")
//   (soot)    the same at night: soot on a cheek, the brow and the chin, smudges down the coat
// NOTES FOR SHOT BUILDERS:
//   - Variants that change the DRAWING (the ink smear, the gown, the soot) are SWAPS of figures with one Look: show one,
//     hide the others (beginFrame hides every figure; only the one you set shows). Hide a change under a cut, a blink
//     or her handkerchief (D's wipe: NEWTON_GOWN_INK -> NEWTON_GOWN_SMUDGE on the first stroke -> NEWTON_GOWN on the
//     second): const r = w.actor(newtonAt(f, KEYS)) with KEYS = [[S.from, "gownInk"], [stroke1, "gownSmudge"], [stroke2, "gown"]]
//   - Variants that are 3D parts HIDE BY NAME (state.hide): "earQuill" (the quill behind his ear), "nest" (the
//     tufts), "locks", "coat" / "gown" (only their 3D skirts). GATE 1: the nest and the quill stay on ALL DAY (they no
//     longer go after scene A): the shots pass hide: NEWTON_HIDE, which is now []. ONE QUILL (gate 1 director note 2:
//     "behind his ear when he walks, in his hand when he writes"): on every frame the "quill" PROP is in his hand,
//     pass hide: newtonHide({ quill: false }) (= NEWTON_HIDE_WRITING) instead, and swap under a cut or a blink.
//   - EYE LINES: frame on N_EYE / H_EYE (1.14 x the figure's scale), never on 1.14; seated, read r.headWorld(). The
//     lean carries his head N_LEAN_FWD forward: close and medium frames aim at newtonEyes(at, facing).
//   - A prop or hand that must touch his head (fork, handkerchief, candle) aims at facePoint(r, qx, qy, out) or
//     headSurface(r, toward, out) (points ON the head), never at headWorld() (its centre).
//   - POSTURE: every Newton figure leans NEWTON_LEAN (5 deg forward) through RigState.lean on every frame whose state
//     sets no lean (addPerson below puts it in, as personalise puts in the resting face). Another lean for a frame:
//     r.set({ ..., lean: { pitch: 0 } }) (upright) or any { pitch, roll } in degrees.
//   - THE LAUGH (G53): r.set({ ...laugh(t), ... }) gives expr "laugh" (eyes squeezed shut), the open mouth beating once a
//     "ha" (every 7 frames) and the whole round head shaking side to side and bobbing; t = seconds since it burst out.
//     It reads at quarter-screen size (preview/people_lineup.ts view face). After it: "smile_closed" (eyes shut, a
//     smile, a blush) or "smile" for the smile that stays on him.
//   - Expressions: only RIG_EXPRS (group/kit/rig3d.ts): neutral, smile, happy, grin, laugh, smile_closed, relief, smug,
//     deadpan, focus, stern, huff, sad, sigh, nervous, shock, dazed, pained, wince, sleep, cool, hush ... Newton:
//     deadpan (rest), focus (writing, reading), cool (the crack), sigh, sad (49-51), laugh. Humphrey: smile
//     (rest, polite), shock (startled: "Laugh? Mr Newton?"), sleep / sigh (sleepy, yawning: add mouth "round").
//   - Faces never turn to profile (FACE_MAX 12 deg): turning away = a body turn / back view (turn: 1), gaze, head tilt.
//   - Everybody stands on y 0; addPerson scales a figure about its ground point (NEWTON 1.06, HUMPHREY 0.94). Read world points back
//     after w.update() (headWorld, handWorld).
//   - ji (the reporter) is the camera: she has no figure. Her hand and mic are props (props/index.ts "mic", "hand",
//     "handR") placed from the camera by cam.ts (micPose / putMic, the free-hand helpers).
import * as THREE from "three";
import type { Look, Expr } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigHead, RigMouth, RigState } from "../group/kit/rig3d";
import { rigHeadAccent, rigHeadAdd } from "../group/kit/rig3d";
import { addPerson as addKitPerson, personalise, type Person } from "../wanbi/people";
import { blush, BLUSH } from "./acc/blush";
import { coat, gown, locks, nest, earQuill, inkSmear, soot, band } from "./acc/newton";
import type { Speaker } from "./voice";

export { personalise, blush, BLUSH, type Person };

// ---------------------------------------------------------------------------------------------------- miniatures
/** A figure smaller than this (Person.scale) is a MINIATURE (Qin's fix, kept generic). */
export const MINI_BELOW = 0.5;
/** Adds the figure to the cast (Wanbi's addPerson: accessories, rim light, resting face, size) and, for a miniature,
 *  scales the rig's ink hulls (their width is in METRES) and the curls' offsets with it (Qin's fix). Every other
 *  figure is built exactly as Wanbi builds it. */
export function addPerson(rc: RigCast, p: Person): Rig {
  const r = addKitPerson(rc, p), s = p.scale ?? 1;
  if (s < MINI_BELOW) miniInk(r, s);
  const lean = (p as NPerson).lean;
  if (lean) restLean(r, lean);
  return r;
}
/** a lean (RigState.lean): degrees added to the pose's own lean, pitch + = forward, roll + = to the person's left */
export type Lean = NonNullable<RigState["lean"]>;
/** a Person of this film: Wanbi's Person + its RESTING POSTURE (lean, applied whenever the shot sets none) */
export type NPerson = Person & { lean?: Lean };
/** THE RESTING POSTURE, the way personalise gives the resting face: on every solve in which the shot's state has no
 *  `lean`, the Person's lean stands in, and is taken out of the state again afterwards (the state the shot set is left
 *  as it was). World.beginFrame clears every state, so a shot's own `lean` lasts one frame, like everything it sets. */
const restLean = (r: Rig, lean: Lean) => {
  const rr = r as unknown as RigInner, up = rr._update;
  rr._update = (cam: THREE.Camera) => {
    const st = r.state, l0 = st.lean;
    if (l0 !== undefined) { up(cam); return; }
    st.lean = lean;
    try { up(cam); } finally { st.lean = l0; }
  };
};
type InkU = { value: number };
type RigInner = { _update: (cam: THREE.Camera) => void; curlPullU: InkU; depthU: InkU; curlDepthU: InkU };
type V3U = { value: THREE.Vector3 };
/** the rig's face drawing (rig3d drawFace's uniforms, set by every solve): the head ball (centre, radius), the face's
 *  forward / right / up axes (right and up carry the slide narrowing in their length), the head layer's scale */
type RigFace = { faceU: { uHead: { value: THREE.Vector4 }; uFF: V3U; uFR: V3U; uFU: V3U }; headG: THREE.Object3D };

// ---------------------------------------------------------------------------------------------------- points on the head
/** A POINT ON A FIGURE'S DRAWN FACE, in world space (read it after w.update(), like headWorld): (qx, qy) in head-ball
 *  radii in the face drawing (the same coordinates as scripts/newton/qa/faces: the eye line at qy 0.03, the eyes at
 *  qx -+0.28, the nose qy -0.15, the MOUTH qy -0.35, the chin qy -0.7), laid on the front of the ball, then `out`
 *  metres further straight out of the face. For a prop that must TOUCH the face and stay out of the head (gate 1 note 3:
 *  his head is 6 % bigger and leans 5 deg, so an aim at headWorld() now lands inside it):
 *    const mouth = facePoint(n, 0, -0.35, 0.01)     G4: the fork's tines go here
 *    const nose = facePoint(n, 0, -0.15, 0.012)     D: her handkerchief's wipe goes here */
export const facePoint = (r: Rig, qx: number, qy: number, out = 0): THREE.Vector3 => {
  const { faceU: U, headG } = r as unknown as RigFace, h = U.uHead.value, R = h.w;
  const uR = U.uFR.value, uU = U.uFU.value;
  const lenR = 1 / Math.max(1e-6, uR.length()), lenU = 1 / Math.max(1e-6, uU.length());
  const z = Math.sqrt(Math.max(0, 1 - qx * qx - qy * qy)) * headG.scale.x;
  return new THREE.Vector3(h.x, h.y, h.z)
    .addScaledVector(uR.clone().normalize(), qx * lenR * R)
    .addScaledVector(uU.clone().normalize(), qy * lenU * R)
    .addScaledVector(U.uFF.value.clone().normalize(), z * R + out);
};
/** the radius of a figure's head ball in metres (its head layer's scale included; Newton 0.26, Humphrey 0.23) */
export const headRadius = (r: Rig): number => { const { faceU: U, headG } = r as unknown as RigFace; return U.uHead.value.w * headG.scale.x; };
/** THE POINT ON THE HEAD'S SURFACE toward `toward` (her lens, a candle, any world point): headWorld() plus the head
 *  radius + `out` metres. Aim a hand or a prop that comes at his head from that side here, never at headWorld().
 *    const tip = headSurface(n, posOf(cam), 0.015)  */
export const headSurface = (r: Rig, toward: THREE.Vector3, out = 0): THREE.Vector3 => {
  const c = r.headWorld();
  return c.clone().add(toward.clone().sub(c).setLength(headRadius(r) + out));
};
const miniInk = (r: Rig, s: number) => {
  r.group.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const mat of Array.isArray(m) ? m : m ? [m] : []) {
      if (mat.userData.nwMiniInk || mat.customProgramCacheKey() !== "rig3-hull") continue;
      mat.userData.nwMiniInk = s;
      const base = mat.onBeforeCompile;
      mat.onBeforeCompile = function (this: THREE.Material, sh, renderer) {
        base.call(this, sh, renderer);
        const u = sh.uniforms as Record<string, InkU | undefined>;
        if (u.uW) u.uW = { value: u.uW.value * s };
      };
      mat.needsUpdate = true;
    }
  });
  const rr = r as unknown as RigInner;
  rr.curlPullU.value *= s;
  const up = rr._update;
  rr._update = (cam: THREE.Camera) => { up(cam); rr.curlDepthU.value = rr.depthU.value - 0.03 * s; };
};
/** a miniature of a Person (a figure of its own) at `scale` */
export const miniature = (p: Person, name: string, scale: number): Person => ({ ...p, name, scale });

// ---------------------------------------------------------------------------------------------------- colours
/** the film's cast colours (never pure black: the ink stays the darkest thing; nothing brighter than #f4f1ea) */
export const COL = {
  coat: "#4d3b30",          // Newton's dark brown coat
  vest: "#9a2630",          // his waistcoat: CRIMSON, his one colour (gate 1, 14 Nov: invented, never on a card)
  vestButton: "#d8b46a",    // the waistcoat's and the coat's buttons (pale brass on the crimson)
  gown: "#322e36",          // the black academic gown (kept off black)
  grey: "#a29b92",          // his greying hair
  collar: "#eeeae2",        // the falling band
  breeches: "#3a3034", stockings: "#6e6870", shoes: "#2e2a2e",
  hCoat: "#7e7466",         // Humphrey's plain DRAB grey-brown coat (gate 1: steps back from the lead's crimson)
  hVest: "#6a6258",
  hButton: "#8a8070",
  hHair: "#5e4130",
  button: "#b49866",        // (the old dull brass: nobody wears it now)
  ink: "#2f3a55",           // the ink on the nose
} as const;
/** GATE 1 (14 Nov, approved): Newton taller and narrower, Humphrey a little smaller and rounder */
export const N_SCALE = 1.06, H_SCALE = 0.94;
/** THE EYE-LINE AIM of a scale-1 figure standing: the height over its floor that every framing of a face in this film
 *  was built on (layout/ third(), the scenes' N_EYE). It is not the drawn eye line (that is the head ball's centre,
 *  1.21 m on a scale-1 figure): it is the AIM the frames were tuned with, so it must grow with the figure. */
export const EYE_AIM = 1.14;
/** the eye-line aim of a Person standing: EYE_AIM x its scale (addPerson scales a figure about its ground point, so
 *  aiming here puts the head where it sat in the frame before gate 1). Seated, read r.headWorld() (the stool does not
 *  grow: on it his drawn eye line rose 3.8 cm with gate 1, against 7.0 cm standing). */
export const eyeAim = (p: Person) => EYE_AIM * (p.scale ?? 1);
/** NEWTON's eye-line aim standing: 1.14 x 1.06 = 1.208 m (his drawn eye line: 1.285 m standing, 1.17-1.21 m on the F / G
 *  stool). Every camera that frames on his face aims here, never at 1.14 (gate 1 director note 1). */
export const N_EYE = EYE_AIM * N_SCALE;
/** HUMPHREY's eye-line aim standing: 1.14 x 0.94 = 1.072 m (his drawn eye line: 1.146 m) */
export const H_EYE = EYE_AIM * H_SCALE;
/** how far NEWTON_LEAN carries his head FORWARD (along his facing) of where it was before gate 1, in metres: measured
 *  6.4 cm standing (E f2600) and 6.2-6.3 cm on the stool (F f3823, G f4440), the 5 deg lean plus the bigger figure. A
 *  camera that was aimed at his head (a point over his floor mark) now sees the head off its aim by this much. */
export const N_LEAN_FWD = 0.063;
/** NEWTON'S EYES TO AIM AT, standing at `at` facing `facing` (radians, the rig's: forward = (sin, 0, cos)): N_EYE up and
 *  N_LEAN_FWD forward. The aim that keeps his head where the scenes framed it before gate 1 (director note 1). */
export const newtonEyes = (at: THREE.Vector3, facing: number, eye = N_EYE): THREE.Vector3 =>
  new THREE.Vector3(at.x + Math.sin(facing) * N_LEAN_FWD, at.y + eye, at.z + Math.cos(facing) * N_LEAN_FWD);
/** NEWTON'S RESTING POSTURE (gate 1 acting profile, section 2: "5 degrees forward, toward the work"): RigState.lean
 *  (group/kit/rig3d, degrees added to the pose's own lean). addPerson applies a Person's `lean` on every frame in which
 *  the shot gives none; a shot that wants another lean sets `lean` itself ({ pitch: 0 } = upright). */
export const NEWTON_LEAN: Lean = { pitch: 5 };
const S_NEWTON = "#f4d8bf", S_HUMPHREY = "#f6d2b2";

// ---------------------------------------------------------------------------------------------------- NEWTON
/** NEWTON's ONE look (every swap shares it): a round head, the long grey hair (painted "long" + the locks), dark clothes */
const NEWTON_LOOK: Look = {
  seed: 4307, skin: S_NEWTON, top: "jacket", topCol: COL.coat, inner: COL.vest,
  bottom: "shorts", botCol: COL.breeches, legCol: COL.stockings, shoes: COL.shoes, shoeSole: "#1f1c22",
  hair: "long", hairCol: COL.grey, part: 1, width: 0.9,
  head: { nTop: 2.0, nBot: 2.05, egg: 0.04, asym: 0.02 },
};
/** his coat open wider (19 deg at the waist, was the default 13) over the crimson waistcoat */
const newtonCoat = (skirt = true) => coat({ col: COL.coat, vest: COL.vest, button: COL.vestButton, collar: COL.collar, collarW: 42, collarDrop: 0.15, open: 19, skirt });
/** his head ALL DAY (gate 1): the long locks, the uncombed bird's nest and the quill behind his ear */
const newtonHead = (): Acc[] => [locks({ n: 4, wild: 0.7 }), nest({ n: 7 }), earQuill()];
type NState = "plain" | "ink" | "gown" | "gownInk" | "gownSmudge";
const newton = (name: string, o: { ink?: number; gown?: boolean }): NPerson => ({
  name, scale: N_SCALE, expr: "deadpan", look: NEWTON_LOOK, lean: NEWTON_LEAN,
  acc: () => [newtonCoat(!o.gown), ...(o.gown ? [gown({ col: COL.gown, open: 20 })] : []), ...newtonHead(), ...(o.ink ? [inkSmear(o.ink)] : [])],
});
/** NEWTON, clean face, in his coat (E, F, G) */
export const NEWTON: NPerson = newton("newton", {});
/** NEWTON with the ink smear on his nose, in his coat (A, B, the end of C in his room) */
export const NEWTON_INK: NPerson = newton("newtonInk", { ink: 1 });
/** NEWTON under the black gown, clean (D after the wipe) */
export const NEWTON_GOWN: NPerson = newton("newtonGown", { gown: true });
/** NEWTON under the gown with the ink on his nose (C in the garden, D before the wipe) */
export const NEWTON_GOWN_INK: NPerson = newton("newtonGownInk", { gown: true, ink: 1 });
/** NEWTON under the gown with the smudged ghost of the ink (D: between her two strokes) */
export const NEWTON_GOWN_SMUDGE: NPerson = newton("newtonGownSmudge", { gown: true, ink: 0.45 });
export const NEWTON_BY: Record<NState, Person> = { plain: NEWTON, ink: NEWTON_INK, gown: NEWTON_GOWN, gownInk: NEWTON_GOWN_INK, gownSmudge: NEWTON_GOWN_SMUDGE };
export type NewtonState = NState;
/** the Newton figure for a state: ink 0 / 0.5 (the smudge: gown only) / 1, gown on or off */
export const newtonFor = (o: { ink?: number; gown?: boolean } = {}): Person => {
  const ink = o.ink ?? 0;
  if (o.gown) return ink >= 0.75 ? NEWTON_GOWN_INK : ink > 0 ? NEWTON_GOWN_SMUDGE : NEWTON_GOWN;
  return ink > 0 ? NEWTON_INK : NEWTON;
};
/** WHICH NEWTON PLAYS FRAME f: step keys [frame, state] (the first key's state before it). Hide each change under a
 *  cut, a blink or her handkerchief.  w.actor(newtonAt(f, [[S.from, "gownInk"], [wipe1, "gownSmudge"], [wipe2, "gown"]])) */
export const newtonAt = (f: number, keys: [number, NState][]): Person => {
  let s = keys[0][1];
  for (const [k, x] of keys) if (f >= k) s = x;
  return NEWTON_BY[s];
};
/** what to hide on Newton when the quill is NOT in his hand: NOTHING (gate 1, 14 Nov: the bird's nest and the quill
 *  behind his ear stay on ALL DAY, in every scene). The shots pass hide: NEWTON_HIDE, so this one list decides it. */
export const NEWTON_HIDE: string[] = [];
/** the hide list for Newton: quill / nest on (true, the default since gate 1) or hidden (false) */
export const newtonHide = (o: { quill?: boolean; nest?: boolean } = {}): string[] => [...((o.quill ?? true) ? [] : ["earQuill"]), ...((o.nest ?? true) ? [] : ["nest"])];
/** what to hide while HE WRITES: the ear quill, because the same quill is the prop in his hand (ONE quill: "behind his
 *  ear when he walks, in his hand when he writes"; gate 1 director note 2). Pass it on every frame on which
 *  w.prop("quill") is put in his hand; take the quill from the ear or put it back under a cut or a blink. */
export const NEWTON_HIDE_WRITING: string[] = newtonHide({ quill: false });

// ---------------------------------------------------------------------------------------------------- HUMPHREY
/** HUMPHREY's one look: round-faced, short brown hair, a plain mid-brown coat */
const HUMPHREY_LOOK: Look = {
  seed: 1685, skin: S_HUMPHREY, top: "jacket", topCol: COL.hCoat, inner: COL.hVest,
  bottom: "shorts", botCol: "#4a3c36", legCol: "#8a8078", shoes: COL.shoes, shoeSole: "#1f1c22",
  hair: "short", hairCol: COL.hHair, part: -1, width: 1.16,
  head: { nTop: 2.15, nBot: 2.0, egg: 0.16 },
};
/** resting face "smile" (gate 1): open dot eyes and a small polite smile, never Newton's lidded slits. personalise puts
 *  it on whenever the shot gives no expr or "neutral". */
const humphrey = (name: string, sooty: number): NPerson => ({
  name, scale: H_SCALE, expr: "smile", look: HUMPHREY_LOOK,
  acc: () => [coat({ col: COL.hCoat, vest: COL.hVest, button: COL.hButton, collar: false, open: 9, soot: sooty }), band({ w: 17, drop: 0.055 }), ...(sooty ? [soot(sooty)] : [])],
});
/** HUMPHREY (Humphrey Newton, the assistant): A, B, E */
export const HUMPHREY: NPerson = humphrey("humphrey", 0);
/** HUMPHREY sooty from the furnace (F, G) */
export const HUMPHREY_SOOT: NPerson = humphrey("humphreySoot", 1);
export const HUMPHREY_BY: Record<"plain" | "soot", Person> = { plain: HUMPHREY, soot: HUMPHREY_SOOT };

// ---------------------------------------------------------------------------------------------------- THE LAUGH
/** THE LAUGH (G53), t = seconds since it burst out: expr "laugh" (eyes squeezed shut), the mouth opening wide on every
 *  "ha" (7 frames each: wide, wide, half, half, wide ...), the whole round head shaking side to side (about 2.2 a
 *  second, 7 deg) and bobbing with each ha. amp scales the head (1); fade 0..1 eases it all out (the tail).
 *    r.set({ at, facing, pose, ...laugh((f - BEAT.G.laugh) / FPS), visible: true }) */
export const laugh = (t: number, o: { amp?: number; fade?: number } = {}): { expr: Expr; mouth?: RigMouth; head?: RigHead } => {
  const a = (o.amp ?? 1) * (1 - Math.max(0, Math.min(1, o.fade ?? 0))), f = Math.max(0, Math.floor(t * 30 + 1e-6));
  // the burst: a jolt up as it breaks out, then the shake and the ha bob
  const ha = f % 7, open: RigMouth = ha < 3 ? "wide" : ha < 5 ? "half" : "wide";
  const shake: RigHead = { tilt: 7 * a * Math.sin((f / 13.6) * Math.PI * 2), dx: 0.05 * a * Math.sin((f / 13.6) * Math.PI * 2 + 0.6) };
  const head = rigHeadAdd(shake, rigHeadAccent("laugh", t, { dur: 600, amp: 2.2 * a }), rigHeadAccent("jolt", t, { amp: 0.9 }));
  return { expr: "laugh", mouth: a > 0.15 ? open : undefined, head };
};

// ---------------------------------------------------------------------------------------------------- tables
/** every Person by its key */
export const PEOPLE = {
  newton: NEWTON, newtonInk: NEWTON_INK, newtonGown: NEWTON_GOWN, newtonGownInk: NEWTON_GOWN_INK, newtonGownSmudge: NEWTON_GOWN_SMUDGE,
  humphrey: HUMPHREY, humphreySoot: HUMPHREY_SOOT,
} satisfies Record<string, Person>;
export type PersonKey = keyof typeof PEOPLE;
/** who plays each speaker (ji, the reporter, is the camera: null) */
export const SPEAKER_PERSON: Record<Speaker, Person | null> = { ji: null, nt: NEWTON, hm: HUMPHREY };
/** every Person the film uses, for a line-up */
export const ALL_PEOPLE: Person[] = Object.values(PEOPLE);
/** one figure per role (the line-up's phone-size and silhouette tests) */
export const NAMED: Person[] = [NEWTON_INK, HUMPHREY];
/** NEWTON's swaps (one Look) */
export const NEWTON_SWAPS: Person[] = [NEWTON, NEWTON_INK, NEWTON_GOWN, NEWTON_GOWN_INK, NEWTON_GOWN_SMUDGE];
