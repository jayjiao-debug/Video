// THE CAST of the Newton film (PLAN 2). WP3. Each Person is Wanbi's type (a kit Look made ONCE + its accessories +
// scale + resting face); addPerson / personalise are Wanbi's (re-exported) with Qin's miniature-ink fix.
//   NEWTON (+ NEWTON_INK, NEWTON_GOWN, NEWTON_GOWN_INK, NEWTON_GOWN_SMUDGE)   HUMPHREY (+ HUMPHREY_SOOT)
//   PEOPLE = all by key;  SPEAKER_PERSON = who plays each speaker (ji = the camera: null);  newtonAt(f, keys) = which
//   Newton plays frame f;  NEWTON_BY / newtonFor({ ink, gown }) = the figure for a state;  laugh(t) = THE LAUGH (G53);
//   HUMPHREY_BY;  addPerson(rc, p) -> Rig
// (the same Person object every time: World.actor caches one figure per Person)
// WHO IS WHO AT A GLANCE (preview/people_lineup.ts):
//   NEWTON    43, scale 1.0. A ROUND head, his OWN long GREY hair parted in the middle falling past the jaw to the
//             shoulders (locks), a bird's nest of tufts on the crown in the morning (accessory "nest"); a DARK BROWN
//             coat open over a darker waistcoat with a row of buttons, the white FALLING BAND (two broad tabs) under
//             the chin, the coat's skirts to the knees, dark breeches and grey stockings. Resting face: deadpan.
//   (gown)    the same under the black academic gown: black panels down both sides of the front, black behind to the
//             knees (outdoors in C and D, the lecture)
//   (ink)     a blue-black ink smear across his nose (A until D's wipe); "smudge" = the ghost after her first stroke
//   HUMPHREY  early 20s, scale 0.95: a round face, short brown hair to the collar, a plain MID-BROWN coat (lighter and
//             warmer than Newton's) with a small white collar; resting face neutral (polite)
//   (soot)    the same at night: soot on a cheek, the brow and the chin, smudges down the coat
// NOTES FOR SHOT BUILDERS:
//   - Variants that change the DRAWING (the ink smear, the gown, the soot) are SWAPS of figures with one Look: show one,
//     hide the others (beginFrame hides every figure; only the one you set shows). Hide a change under a cut, a blink
//     or her handkerchief (D's wipe: NEWTON_GOWN_INK -> NEWTON_GOWN_SMUDGE on the first stroke -> NEWTON_GOWN on the
//     second): const r = w.actor(newtonAt(f, KEYS)) with KEYS = [[S.from, "gownInk"], [stroke1, "gownSmudge"], [stroke2, "gown"]]
//   - Variants that are 3D parts HIDE BY NAME (state.hide): "earQuill" (the quill behind his ear: A only, hide it
//     elsewhere), "nest" (the morning tufts: A only), "locks" (never), "coat" / "gown" (only their 3D skirts: never).
//     Every NEWTON figure carries the quill and the nest: give hide: NEWTON_HIDE (= ["earQuill", "nest"]) everywhere
//     but scene A, or newtonHide({ quill, nest }).
//   - THE LAUGH (G53): r.set({ ...laugh(t), ... }) gives expr "laugh" (eyes squeezed shut), the open mouth beating once a
//     "ha" (every 7 frames) and the whole round head shaking side to side and bobbing; t = seconds since it burst out.
//     It reads at quarter-screen size (preview/people_lineup.ts view face). After it: "smile_closed" (eyes shut, a
//     smile, a blush) or "smile" for the smile that stays on him.
//   - Expressions: only RIG_EXPRS (group/kit/rig3d.ts): neutral, smile, happy, grin, laugh, smile_closed, relief, smug,
//     deadpan, focus, stern, huff, sad, sigh, nervous, shock, dazed, pained, wince, sleep, cool, hush ... Newton:
//     deadpan (rest), focus (writing, reading), stern (cold answers), sigh, sad (49-51), laugh. Humphrey: neutral
//     (polite), shock (startled: "Laugh? Mr Newton?"), sleep / sigh (sleepy, yawning: add mouth "round").
//   - Faces never turn to profile (FACE_MAX 12 deg): turning away = a body turn / back view (turn: 1), gaze, head tilt.
//   - Everybody stands on y 0; addPerson scales a figure about its ground point (HUMPHREY 0.95). Read world points back
//     after w.update() (headWorld, handWorld).
//   - ji (the reporter) is the camera: she has no figure. Her hand and mic are props (props/index.ts "mic", "hand",
//     "handR") placed from the camera by cam.ts (micPose / putMic, the free-hand helpers).
import * as THREE from "three";
import type { Look, Expr } from "../group/kit/toon";
import type { Acc, Rig, RigCast, RigHead, RigMouth } from "../group/kit/rig3d";
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
  return r;
}
type InkU = { value: number };
type RigInner = { _update: (cam: THREE.Camera) => void; curlPullU: InkU; depthU: InkU; curlDepthU: InkU };
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
  vest: "#3b302b",          // his waistcoat
  gown: "#322e36",          // the black academic gown (kept off black)
  grey: "#a29b92",          // his greying hair
  collar: "#eeeae2",        // the falling band
  breeches: "#3a3034", stockings: "#6e6870", shoes: "#2e2a2e",
  hCoat: "#8a6446",         // Humphrey's plain mid-brown coat
  hVest: "#6e5038",
  hHair: "#5e4130",
  button: "#b49866",
  ink: "#2f3a55",           // the ink on the nose
} as const;
const S_NEWTON = "#f4d8bf", S_HUMPHREY = "#f6d2b2";

// ---------------------------------------------------------------------------------------------------- NEWTON
/** NEWTON's ONE look (every swap shares it): a round head, the long grey hair (painted "long" + the locks), dark clothes */
const NEWTON_LOOK: Look = {
  seed: 4307, skin: S_NEWTON, top: "jacket", topCol: COL.coat, inner: COL.vest,
  bottom: "shorts", botCol: COL.breeches, legCol: COL.stockings, shoes: COL.shoes, shoeSole: "#1f1c22",
  hair: "long", hairCol: COL.grey, part: 1, width: 1.0,
  head: { nTop: 2.0, nBot: 2.05, egg: 0.04, asym: 0.02 },
};
const newtonCoat = (skirt = true) => coat({ col: COL.coat, vest: COL.vest, button: COL.button, collar: COL.collar, collarW: 42, collarDrop: 0.15, skirt });
const newtonHead = (): Acc[] => [locks({ n: 4, wild: 0.55 }), nest({ n: 7 }), earQuill()];
type NState = "plain" | "ink" | "gown" | "gownInk" | "gownSmudge";
const newton = (name: string, o: { ink?: number; gown?: boolean }): Person => ({
  name, scale: 1.0, expr: "deadpan", look: NEWTON_LOOK,
  acc: () => [newtonCoat(!o.gown), ...(o.gown ? [gown({ col: COL.gown, open: 20 })] : []), ...newtonHead(), ...(o.ink ? [inkSmear(o.ink)] : [])],
});
/** NEWTON, clean face, in his coat (E, F, G) */
export const NEWTON: Person = newton("newton", {});
/** NEWTON with the ink smear on his nose, in his coat (A, B, the end of C in his room) */
export const NEWTON_INK: Person = newton("newtonInk", { ink: 1 });
/** NEWTON under the black gown, clean (D after the wipe) */
export const NEWTON_GOWN: Person = newton("newtonGown", { gown: true });
/** NEWTON under the gown with the ink on his nose (C in the garden, D before the wipe) */
export const NEWTON_GOWN_INK: Person = newton("newtonGownInk", { gown: true, ink: 1 });
/** NEWTON under the gown with the smudged ghost of the ink (D: between her two strokes) */
export const NEWTON_GOWN_SMUDGE: Person = newton("newtonGownSmudge", { gown: true, ink: 0.45 });
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
/** what to hide on Newton outside scene A: the quill behind his ear and the morning's bird's nest */
export const NEWTON_HIDE = ["earQuill", "nest"];
/** the hide list for Newton: quill / nest on (true) or hidden */
export const newtonHide = (o: { quill?: boolean; nest?: boolean } = {}): string[] => [...(o.quill ? [] : ["earQuill"]), ...(o.nest ? [] : ["nest"])];

// ---------------------------------------------------------------------------------------------------- HUMPHREY
/** HUMPHREY's one look: round-faced, short brown hair, a plain mid-brown coat */
const HUMPHREY_LOOK: Look = {
  seed: 1685, skin: S_HUMPHREY, top: "jacket", topCol: COL.hCoat, inner: COL.hVest,
  bottom: "shorts", botCol: "#4a3c36", legCol: "#8a8078", shoes: COL.shoes, shoeSole: "#1f1c22",
  hair: "short", hairCol: COL.hHair, part: -1, width: 1.06,
  head: { nTop: 2.15, nBot: 2.0, egg: 0.16 },
};
const humphrey = (name: string, sooty: number): Person => ({
  name, scale: 0.95, look: HUMPHREY_LOOK,
  acc: () => [coat({ col: COL.hCoat, vest: COL.hVest, button: "#9a8460", collar: false, open: 9, soot: sooty }), band({ w: 17, drop: 0.055 }), ...(sooty ? [soot(sooty)] : [])],
});
/** HUMPHREY (Humphrey Newton, the assistant): A, B, E */
export const HUMPHREY: Person = humphrey("humphrey", 0);
/** HUMPHREY sooty from the furnace (F, G) */
export const HUMPHREY_SOOT: Person = humphrey("humphreySoot", 1);
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
