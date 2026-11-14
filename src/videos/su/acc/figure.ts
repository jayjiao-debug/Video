// FIGURE FIXES of the Su film's cast (WP3-fix, 2026-11-14): two things a kit Look cannot say, put on a figure the rig
// has built (people.ts addPerson does it for every Person). The rig (group/kit/rig3d.ts) is read only: both reach the
// figure's OWN uniforms / materials, the way Qin's miniInk and the kit's hairOverBeard do, and both are guarded: if the
// rig's insides change they switch themselves off with one console line and the figure is drawn exactly as before.
//
//   napeHair(rig, look, { nape })   THE BACK OF THE HEAD. Why it was wrong: the rig paints the hair on the head ball
//              wherever the angle from the crown is under the look's hairline (hairLine(look, az), az measured round
//              the head from the face). Every hair kind stops at 112-135 deg from the crown at the back ("buzz": 51 + 61 *
//              back = 112), and the ball has no neck: its lower third is the nape, and it is painted skin. From behind
//              (state.turn 1) that is a big skin-coloured oval under a band of hair: it reads as a blank face, whatever the
//              hat (the bamboo hat and the 东坡巾 stand above the hair). The fix: the figure's own hairline lookup (the
//              head shader's uHair, a 256 x 1 texture the rig made once from the look) is swapped for one whose line goes
//              on down the back of the head to `nape` deg from the crown (default NAPE = 165: the whole back of the
//              ball down into the collar), blended in from the ears (|az| 80 deg round from the face) to the back
//              (140 deg): from behind, the sides of the head (the outline at |az| 90) are hair too, not two skin wedges.
//              The face side is untouched (in front of |az| 80 the line is the rig's own, to the degree), so a front
//              view is drawn as before; a three-quarter view shows a little more hair behind the far ear (SU's far side
//              is his beard's anyway); a back or back three-quarter view shows the back of a head of hair. Under a
//              cut hat (the rig's "hat: { hair: 'cut' }": SU_OLD's 东坡巾, the 幞头) the rig's under-the-rim line is
//              kept and the nape is added to it the same way. nape false = the rig's own line; a number = its depth;
//              { deg, from, full } = its depth and where round the head it blends in. SU's three ages (a full beard
//              of the hair's colour) take NAPE_BEARD (from 55, full 115): from a back three-quarter (the face drawing,
//              and with it the beard, has faded out there) the side of his head below the ear is hair and beard, not a
//              bare skin cheek; seen from the front that band lies under the beard's sideburn, which is the same colour.
//   limbColours(rig, { hand, arm })   HANDS THAT READ. The rig draws both arms (tubes) and the ball hands in LIMB_COL
//              (near-ink), the colour of SU's grey-black beard: a hand over the beard vanished (B f586). The Look has no
//              field for it (rig3d.ts: mkLimb / mkBall take LIMB_COL), so this recolours the figure's own two arm
//              materials and gives its two hands a material of their own (the legs and feet keep theirs): hand = the
//              ball hands' colour (SU: his skin), arm = the arm tubes' and shoulder caps' (undefined = keep
//              near-ink). The highlight stripe the rig puts on limbs (x 1.86: made for near-ink) is toned down to
//              x STRIPE on a light colour so a skin hand is not a white spot. Geometry, ink outlines, the layering and
//              the clearance are untouched (only colours).
import * as THREE from "three";
import { hairLine, type Rig } from "../../group/kit/rig3d";
import type { Look } from "../../group/kit/toon";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;

// ---------------------------------------------------------------------------------------------------- the nape
/** how far down the back of the head the hair goes (deg from the crown; the ball's bottom is 180, the collar ~136) */
export const NAPE = 165;
/** the nape is blended in from behind the ears (NAPE_FROM, deg round from the face) to the back (NAPE_FULL) */
export const NAPE_FROM = 80, NAPE_FULL = 140;
/** SU's nape (a full beard of the hair's colour wraps the jaw: see the head of this file) */
export const NAPE_BEARD: Nape = { deg: NAPE, from: 55, full: 115 };
/** the rig's lookup resolution (rig3d.ts HAIR_N; module private there: any width samples right, the lookup is by u) */
const HAIR_N = 256;
/** rig3d.ts hairLineHat (module private there; the same one line): the hairline under a hat whose rim is `rim` deg */
const hairLineHat = (L: Look, az: number, rim: number): number =>
  lerp(rim - 22, Math.max(hairLine(L, az), rim + 11), smooth((Math.abs(az) - rad(50)) / rad(12)));
/** the nape's shape: deg = how far down (from the crown), from / full = the azimuths (deg round from the face) where it
 *  starts to blend in and where it is full. A full beard of the hair's colour (SU) wraps the jaw: from 55 / full 115
 *  (see napeHair) */
export type Nape = { deg?: number; from?: number; full?: number };
/** the hairline with the nape: the rig's own line in front of `from`, going down to `deg` behind it (deg) */
export const napeLine = (L: Look, az: number, rim: number, n: Nape = {}): number => {
  const base = rim ? hairLineHat(L, az, rim) : hairLine(L, az), deg = n.deg ?? NAPE, from = n.from ?? NAPE_FROM, full = Math.max(from + 5, n.full ?? NAPE_FULL);
  if (deg <= base) return base;
  return lerp(base, deg, smooth((Math.abs(az) - rad(from)) / rad(full - from)));
};
const napeTexCache = new Map<string, THREE.DataTexture>();
/** the head shader's hairline lookup with the nape (encoded as rig3d.ts hairTex: 16 bits of deg / 180, R high, G low) */
const napeTex = (L: Look, rim: number, nape: Nape) => {
  const key = `${L.hair}|${L.part ?? 1}|${rim}|${nape.deg ?? NAPE}|${nape.from ?? NAPE_FROM}|${nape.full ?? NAPE_FULL}`;
  let t = napeTexCache.get(key);
  if (!t) {
    const data = new Uint8Array(HAIR_N * 4);
    for (let k = 0; k < HAIR_N; k++) {
      const az = -Math.PI + ((k + 0.5) / HAIR_N) * 2 * Math.PI, v = Math.round((clamp(napeLine(L, az, rim, nape), 8, 170) / 180) * 65535);
      data[k * 4] = v >> 8; data[k * 4 + 1] = v & 255; data[k * 4 + 3] = 255;
    }
    t = new THREE.DataTexture(data, HAIR_N, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    t.wrapS = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    napeTexCache.set(key, t);
  }
  return t;
};
/** the rig's private fields these fixes touch (rig3d.ts Rig: faceU.uHair, hatLine, armMats, hands, under) */
type RigInner = { faceU?: { uHair?: { value: THREE.Texture } }; hatLine?: number; armMats?: THREE.Material[][]; hands?: THREE.Mesh[]; under?: THREE.Material[] };
const warned = new Set<string>();
const warnOnce = (id: string, msg: string) => { if (!warned.has(id)) { warned.add(id); console.warn(`[su acc/figure] ${msg}`); } };

/** THE BACK OF THE HEAD (see the head of this file): the figure's hair goes on down the back of its head to `nape`
 *  deg from the crown. Call once, after the rig built the figure. Returns false (and changes nothing) when the rig's
 *  insides are not as expected or nape is false. */
export const napeHair = (r: Rig, L: Look, o: { nape?: number | Nape | false } = {}): boolean => {
  if (o.nape === false) return false;
  const rr = r as unknown as RigInner, u = rr.faceU?.uHair;
  if (!u || !(u.value instanceof THREE.DataTexture)) { warnOnce("nape", "napeHair: the rig's head has no uHair lookup (rig3d.ts changed?): the back of the head is the rig's own"); return false; }
  const rim = typeof rr.hatLine === "number" ? rr.hatLine : 0;
  u.value = napeTex(L, rim, typeof o.nape === "number" ? { deg: o.nape } : o.nape ?? {});
  return true;
};

// ---------------------------------------------------------------------------------------------------- the hands
/** the limb highlight on a recoloured (light) hand or arm: x STRIPE instead of the rig's x 1.86 */
export const STRIPE = 1.16;
const recolour = (m: THREE.Material, col: string) => {
  const b = m as THREE.MeshBasicMaterial;
  if (!b.color) return false;
  b.color.set(col);
  const c = new THREE.Color(col).convertLinearToSRGB(), luma = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  if (luma > 0.3 && !m.userData.suStripe) {
    m.userData.suStripe = true;
    const base = m.onBeforeCompile;
    // (a new uniform object every compile, after the rig's own: the rig's stripe position w is kept)
    m.onBeforeCompile = function (this: THREE.Material, sh, renderer) {
      base.call(this, sh, renderer);
      const u = sh.uniforms as Record<string, { value: THREE.Vector4 } | undefined>;
      if (u.uStripe) u.uStripe = { value: new THREE.Vector4(STRIPE, STRIPE, STRIPE * 0.97, u.uStripe.value.w) };
    };
    m.needsUpdate = true;
  }
  return true;
};
/** HANDS THAT READ (see the head of this file): hand = the ball hands' colour, arm = the arm tubes' (each optional).
 *  Call once, after the rig built the figure. Returns false (and changes nothing) when the rig's insides are not as
 *  expected. The rig's ball material of an arm is also its shoulder cap (the arm's rounded root): the hand gets a
 *  material of its own (a copy that keeps the rig's shader, layering and stencil), the cap keeps the arm's colour. */
export const limbColours = (r: Rig, o: { hand?: string; arm?: string }): boolean => {
  if (!o.hand && !o.arm) return false;
  const rr = r as unknown as RigInner, mats = rr.armMats, hands = rr.hands, under = rr.under;
  // each arm's list starts [tube, ball (hand + shoulder cap), tube ink, hand ink] (rig3d.ts: "Each arm has its own
  // materials"); rr.hands = the two hand meshes; rr.under = the materials whose stencil the rig sets every frame
  const ok = !!mats && mats.length === 2 && mats.every((a) => a.length >= 4 && a[0].customProgramCacheKey() === "rig3-tube" && a[1].customProgramCacheKey() === "rig3-plain")
    && !!hands && hands.length === 2 && hands.every((h, i) => h.material === mats[i][1]) && Array.isArray(under);
  if (!ok) { warnOnce("limbs", "limbColours: the rig's arm materials are not as expected (rig3d.ts changed?): the arms and hands keep the rig's colour"); return false; }
  for (let i = 0; i < 2; i++) {
    const a = mats![i], ball = a[1];
    if (o.hand) {
      const hm = ball.clone();
      hm.onBeforeCompile = ball.onBeforeCompile; hm.customProgramCacheKey = ball.customProgramCacheKey;
      recolour(hm, o.hand);
      hands![i].material = hm; a.push(hm); under!.push(hm);
    }
    if (o.arm) { recolour(a[0], o.arm); recolour(ball, o.arm); }
  }
  return true;
};
