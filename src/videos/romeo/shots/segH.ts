// SCENE H · Thursday before dawn, the Capulet vault (认识第4天). THE QUIET SCENE: torchlight, Juliet on the stone bier
// with her hands folded, Romeo standing at her head, bent over her. "Death hath had no power yet upon thy beauty"; he
// bends a little lower over her ("crimson in thy lips"). She says it out loud this time (they're red because she's
// alive!); he does not turn. He holds the dark bottle out to his love with Juliet's own toast; then his eyes close and
// the bottle rises toward his mouth. It never gets there. "I only film, I don't inter— I'm done filming!" The picture
// lurches; the camera leaves her hands and flies at the bottle IN SLOW MOTION, turning over as it goes; glass breaks;
// it lands on the stones; a crack splits the picture; black. The REC display stutters and dies.
// No effects, no snaps, no sway: one slow push, then the throw.
// CAMERA PLAN:
//   1  H01-H04  THE ONE SLOW PUSH (fov 54 -> 49.5)                                                      (the quiet scene)
//   2  H05 插   the picture lurches                                                                    (she decides)
//   3  不要啊   the throw, slowed (shard.tsx FLIGHT): the lens flies at the bottle and turns over        (the throw)
//   4  impact   on the floor, tilted, looking up at the bier; the crack; black                          (the camera breaks)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, nudge, CAM, type CamKey } from "../cam";
import { V, standing, yawTo, accent } from "./common";
import { ROMEO_BOTTLE, JULIET } from "../people";
import { P, camAt, faceAt, talk, wordAt, startOf, endOf, ky, rel, lieDown, REACT } from "./kit";
import { capWord } from "../captions";
import { THROW_AT, IMPACT_AT, FLOWN, flown, worldF } from "../shard";
import { hit } from "./gest";

const S = seg("H");
/** ROMEO STANDS at the bier's head end (its right end in the lens) and BENDS OVER HER, facing along it to her face:
 *  both faces read. (v5, the owner on the v4 cut: "His feet is clipped into the ground? Show him bending rather than
 *  just going six feet under". Until v4 he knelt the kit's way, the figure sunk 38 cm into the floor, and from her eye
 *  height his shins went into the stone.) His feet are 60 cm past the bier's end: bent, his head hangs beside her
 *  crown and not over it (with his beret and her sculpted hair their heads want 66 cm between their centres; the hug
 *  is the only touch). */
export const STAND = P("tomb", 1.6, 0, -1.0);
/** Juliet lying on the bier near its front edge: her feet (the pivot of lieDown), her head toward +x, toward him */
export const JU_FEET = P("tomb", -0.44, 0.87, -1.05), HEAD_DIR = V(1, 0, 0);
const JU_FACE = P("tomb", 0.76, 0.85, -1.05);
export const RO_FACING = yawTo(STAND, JU_FACE);
/** HOW FAR HE BENDS (degrees forward: RigState.lean): over her; less for the toast; nearly upright with his chin up as
 *  the bottle comes to his mouth; over his empty hand after the hit (and at the start of scene I) */
export const BEND = { over: 24, toast: 14, rise: 8, lips: 6, after: 12 };
/** THE BOTTLE'S WAY (his right hand, the far one from the lens).
 *    REST   in front of his belt while he looks at her                                  (his own frame: left, up, forward)
 *    TOAST  held out toward her at chest height ("Here's to my love!", with a small lift on "love"): 10 cm short of her
 *           hair (her sculpted hair stands 9 cm off her crown: at z 0.5 the bottle went 1 cm into it on its way up)
 *    RISE   where it is when she throws: come in from the toast to before his chest, its cork under his chin
 *    LIPS   where it is when the camera hits it: its cork LIP_GAP below his mouth IN THE PICTURE.
 *  That is as near as it ever gets: the bottle stays upright and corked, and nothing is shown at his lips.
 *  (v5, the owner: "romeo closing his eyes as his hand moves towards his mouth as he tries to drink the potion". The
 *  first try raised it at arm's length the way he faces, in profile: level with his mouth in the world, and 28 cm
 *  from it in the picture, because the rig draws a face toward the lens wherever the head points. So RISE and LIPS are
 *  set out IN THE PICTURE: before his face as the lens in her hands sees it (`before`), under the drawn mouth, and
 *  that arm is drawn in front of his own head for the scene (RigState.armFront).) */
const REST = [-0.1, 0.8, 0.34], TOAST = [-0.09, 0.88, 0.43];
/** in the picture, from his head's centre (m): the drawn mouth (measured on the still f5556: 69 px left and 60 px down
 *  at 720 px a metre), how far under it the cork stops, and the bottle's top above the hand that holds it */
const MOUTH = { left: 0.096, down: 0.083 }, LIP_GAP = 0.08, CORK_UP = 0.112;
/** the hand under his chin: `left` of his head's centre in the picture, `out` toward the lens (the bottle clear of his
 *  chin and of his chest), and how far below the mouth its cork is at the throw (RISE) */
const HAND = { left: 0.125, out: 0.25, riseGap: 0.135 };
/** his empty hand after the hit, knocked forward from where the bottle was (scene I starts from it) */
export const EMPTY = [-0.1, 1.0, 0.44];
/** the frames: his eyes close, the bottle starts up */
const T_CLOSE = endOf("H04") + 3, T_UP = endOf("H04") + 9;
/** THE THROWN CAMERA: it ends NEAR m from the point it flies at (the bottle's label), having turned
 *  SPIN degrees (a turn and a quarter: it arrives lying on its side, as the floor view begins); ARC = how far its
 *  path bows up */
const NEAR = 0.38, SPIN = 450, SPIN_SLOW = 4.4, ARC = 0.1;
const v3 = (a: readonly number[] | THREE.Vector3) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));
const sm = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };
const own = (p: number[]) => rel(STAND, RO_FACING, p[0], p[1], p[2]);

/** her camera in her hands: the one slow push (fov 54 -> 49.5), and the lurch on 拍 of 「我只拍……」 (she has decided; until v5
 *  on 插 of 「不插……」) */
const heldCam = (g: number) => {
  const PUSH = camAt("tomb", "push", 0), h04 = startOf("H04"), tLurch = capWord("H05", "拍").from;
  const pk = (fr: number, o: Partial<CamKey> = {}): CamKey => ({ ...PUSH, f: fr, ...o });
  const c = povCam(g, [pk(S.from), pk(h04, { fov: 49.5 }), pk(THROW_AT, { fov: 49.5 })], { mood: "calm", amp: 0.15 });
  const lurch = ky(g, [[tLurch - 1, 0], [tLurch + 2, 1], [tLurch + 9, 0]]);
  return lurch > 0 ? nudge(c, { pitch: -3.5 * lurch, roll: 4 * lurch, fwd: 0.06 * lurch }) : c;
};
/** the lens as it leaves her hands: where it is, and the picture's right and up */
let AXES: { p: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 } | null = null;
const axes = () => (AXES ??= (() => { const a = CAM.camAxes(heldCam(THROW_AT)); return { p: a.p.clone(), right: a.right.clone(), up: a.up.clone() }; })());
/** his head's centre when he bends `deg` forward (the rig: the hips 0.543 m up, the head's centre 0.70 m along the body) */
const headAt = (deg: number) => { const t = (deg * Math.PI) / 180; return own([0, 0.543 + 0.7 * Math.cos(t), 0.7 * Math.sin(t)]); };
/** a point before his face as that lens sees it: `left` and `down` from his head's centre in the picture, `out` toward
 *  the lens (m) */
const before = (deg: number, left: number, down: number, out: number) => {
  const a = axes(), h = headAt(deg), toCam = a.p.clone().sub(h).normalize();
  return h.addScaledVector(toCam, out).addScaledVector(a.right, -left).addScaledVector(a.up, -down);
};
/** the hand that puts the cork `gap` under his mouth in the picture, when he bends `deg` */
const under = (deg: number, gap: number) => before(deg, HAND.left, MOUTH.down + gap + CORK_UP, HAND.out);

/** the bottle's hand (world) and how far he bends, at film frame f before the hit */
function drink(f: number) {
  const h04 = startOf("H04"), wf = worldF(f);
  const toast = ky(f, [[h04 - 6, 0], [h04 + 10, 1]]);
  // up to the throw on the film's frames (it is still on its way when she throws), then on the world's slow ones
  const up = sm(Math.pow(Math.min(1, Math.max(0, (f - T_UP) / (THROW_AT - T_UP))), 1.2)), in2 = Math.min(1, Math.max(0, (wf - THROW_AT) / FLOWN));
  const lift = 0.03 * hit(f, wordAt("H04", "love"), 4, 14);
  const hand = own(REST).lerp(own(TOAST).add(V(0, lift, 0)), sm(toast)).lerp(under(BEND.rise, HAND.riseGap), up).lerp(under(BEND.lips, LIP_GAP), in2);
  const bend = BEND.over + (BEND.toast - BEND.over) * sm(toast) + (BEND.rise - BEND.toast) * up + (BEND.lips - BEND.rise) * in2;
  return { hand, bend, toast, up, in2 };
}

export const SEG: Segment = {
  id: "H", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("tomb");
    const h02 = startOf("H02"), h04 = startOf("H04");
    const wf = worldF(f), knocked = f >= IMPACT_AT, D = drink(Math.min(f, IMPACT_AT));
    // ---------------------------------------------------------------- the camera
    const FLOORC = camAt("tomb", "floor", 0), held = heldCam;
    let camera;
    if (f <= THROW_AT) camera = held(f);
    else if (f < IMPACT_AT) {
      // THE THROW, SLOWED. The lens goes from her hands toward the bottle before his chin at an even
      // speed IN THE WORLD'S TIME (so it leaps out of her hands, all but hangs in the air, and leaps into the bottle),
      // finding that point in its first frames; the picture turns over all the way (a little faster where the world
      // runs faster), and the lens opens up as it closes in
      const u = f - THROW_AT, s = flown(u) / FLOWN, c0 = held(THROW_AT);
      const aimAt = D.hand.clone().add(V(0, 0.05, 0));                               // the bottle's label
      const from = v3(c0.pos as number[]), dir = aimAt.clone().sub(from).normalize();
      const pos = from.clone().lerp(aimAt.clone().addScaledVector(dir, -NEAR), s).add(V(0, ARC * Math.sin(Math.PI * s), 0));
      const look = v3(c0.look as number[]).lerp(aimAt, sm(s / 0.22));
      const spin = SPIN_SLOW * u + ((SPIN - SPIN_SLOW * (IMPACT_AT - THROW_AT)) * flown(u)) / FLOWN;
      camera = { pos: pos.toArray(), look: look.toArray(), fov: c0.fov + (56 - c0.fov) * s, roll: (c0.roll ?? 0) + (spin * Math.PI) / 180 };
    } else {
      // on the stones: a tumble into the floor view, then still
      const k = (fr: number, o: Partial<CamKey> = {}): CamKey => ({ ...FLOORC, f: fr, ...o });
      camera = povCam(f, [k(IMPACT_AT, { roll: 75, fov: 68 }), k(IMPACT_AT + 7, {}), k(S.to, {})], { mood: "calm", amp: 0 });
    }
    w.setCamera(camera);

    // ---------------------------------------------------------------- Romeo, standing at her head
    const ro = w.actor(ROMEO_BOTTLE);
    // on "crimson in thy lips" he bends two degrees lower over her, and comes back. His left hand (the lens side) hangs:
    // the quiet scene has no gestures. (A reach toward her temple was tried in v5: bent over her, his own head and her
    // hair leave it no room in the picture. Short of her hair it lay on his bottle; past it, on her hair. The hug is
    // the only touch.)
    const near = ky(f, [[h02 + 6, 0], [h02 + 26, 1], [endOf("H02") + 4, 1], [endOf("H02") + 22, 0]]);
    // his eyes close before the bottle starts up, and fly open at the hit
    const lids = knocked ? 0 : ky(f, [[T_CLOSE, 0], [T_CLOSE + 12, 1]]);
    ro.set({
      // (his breathing and his sway run on the world's frames: slow through the throw)
      ...standing(STAND, RO_FACING, wf, 1),
      // "idle" until the bottle is knocked away: its elbows go out and back. With "hold" (elbows out and down) the
      // bottle arm passed its own elbow line on the way up and the elbow flipped 30 cm in one frame (f5314)
      pose: { kind: knocked ? "hold" : "idle", t: wf / 30 },
      lean: { pitch: knocked ? BEND.after : D.bend + 2 * sm(near) },
      hands: [knocked ? own(EMPTY) : D.hand, null],
      // the bottle's arm in front of his own head (it comes up before his chin as the lens sees it)
      ...(knocked ? {} : { armFront: [true, undefined] as [boolean | undefined, boolean | undefined] }),
      expr: faceAt(f, [[0, "tender"], [h04 - 4, "grief"], [IMPACT_AT + REACT, "blank"]]),   // eyes on her, never a smile with closed eyes beside her
      ...talk("ro", f, 1),
      ...(lids > 0 ? { blink: lids } : {}),
      ...(knocked ? { head: accent("jolt", f, IMPACT_AT + 1) ?? undefined } : {}),
      // his eyes on her face; level for the toast; his chin comes up as the bottle does; on his empty hand after the hit
      lookDown: knocked ? 12 : 10 - 4 * sm(D.toast) - 16 * D.up - 3 * D.in2,
      hide: knocked ? ["letter", "darkBottle"] : ["letter"],
    });

    // ---------------------------------------------------------------- Juliet on the bier (solved standing, then laid down)
    const ju = w.actor(JULIET);
    ju.set({
      ...standing(JU_FEET, 0, 0, 2),
      pose: { kind: "hold", t: 0 },
      hands: [rel(JU_FEET, 0, -0.035, 0.7, 0.15), rel(JU_FEET, 0, 0.035, 0.7, 0.15)],
      expr: "sleep", blink: 1, gaze: 0, mouth: undefined,
      hide: ["vial"],
    });

    // ---------------------------------------------------------------- after the throw: what fell on the stones
    if (knocked) {
      const t = (f - IMPACT_AT) / 30;
      w.prop("darkBottle").put(P("tomb", 1.02, 0.0, -0.42), { lying: true, rot: 2.2, scale: 1.3 });
      w.prop("spill").put(P("tomb", 0.96, 0.005, -0.38), { amount: Math.min(1, t * 1.2) });
      w.prop("glassShards").put(P("tomb", 0.78, 0.005, -0.12), { rot: 0.6 });
    }
    w.update();
    lieDown(w, ju, JU_FEET, HEAD_DIR, 1, 0.04);

    // ---------------------------------------------------------------- her camera's display stutters and dies at the impact
    const stutter = f >= IMPACT_AT && f < IMPACT_AT + 12;
    const dead = f >= IMPACT_AT + 12;
    // (clock: the torches and the dust run on the world's frames too)
    return { camera, clock: wf / 30, rec: stutter ? f % 3 === 0 : dead ? false : undefined, hud: dead ? false : undefined };
  },
};
