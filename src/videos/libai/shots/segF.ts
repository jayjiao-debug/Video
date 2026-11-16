// SEGMENT F, lines F34-F44: 子时, night under the blossom tree (Qin's moonlit garden + a blossom tree). beats.ts BEAT.F.
//   F34-F36  alone on a stone under the tree, the jar beside him, the moon over the trees. 人都走了 / 走了好，清静.
//   memory   F37      贺老……: an ink-warm flashback in the tavern: 贺知章 laughs, unties his gold turtle, puts it on the
//                     table for wine (the dissolves in and out are the HUD's TRANSITIONS).
//   F38-F40  back at night. 谁说一个人？ he lifts his cup to the moon.
//   F41      举杯邀明月: he lifts the cup to the moon, points at his shadow, at himself (the camera holds still).
//   F42      he looks into his cup.   F43 我陪您喝一杯: her cup comes up in front of the lens, goes out to clink his and back (no hand).
//   F44      好。四个人。 he drinks, then she sips (her cup tips toward the lens); the camera rises slowly to the moon under cards 4 and 5; her camera switches off.
import * as THREE from "three";
import { trackHead } from "../track";
import { SEGMENTS, FPS, lineId, capWord, clamp01, lerp, smooth, h, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { LI, LI_RED, HE } from "../people";
import { NX, NIGHT_SET } from "../layout";
import { NIGHT_STAND } from "../../qin/layout/night";
import { STONE } from "../props/things";
import { transitionAt } from "../hud";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, standing, frag } from "./common";
import { aim, ramp, mixCam, table, putTable, tavern, LI_TABLE, DRINKER_PEOPLE, atTable, type St } from "./lb";
import { F_OPEN, F_CAM0, MOON, STONE_AT } from "./match";
import { KEEPER } from "../people";
import { setSeat } from "../../../kit/acc/garb";

const S = SEGMENTS[5], F = BEAT.F;
const word = (id: string, w: string) => capWord(id, w).from;
const L42 = lineId("F42"), L43 = lineId("F43"), L44 = lineId("F44");

// ------------------------------------------------------------------------------------------------ the night marks
const FAC = 0.12;
const SEAT = { top: V(STONE_AT.x, STONE.top, STONE_AT.z + 0.12), floor: 0, back: 0.03 };
const TREE = V(NX - 1.25, 0, -5.3);
const JAR = rel(STONE_AT, FAC, -0.62, 0, 0.15);
const HEAD = V(STONE_AT.x, 1.38, STONE_AT.z);
const CAM0 = F_CAM0;
const SHADOW = rel(STONE_AT, FAC, 0.2, 0.7, 0.9);

/** THE CAMERA PLAN: the quiet scene is left alone (no handheld sway, no snaps, no screen effects).
 *    open     the join: E's last picture again (him where he was, the moon where the lantern was); she glides to
 *             her place: him alone on the stone under the tree, then holds
 *    memory   the ink-warm flashback in the tavern: held still
 *    F38-F44  held still: he toasts the moon, points at his shadow; her cup comes up in front of the lens and she sips
 *    end      the one slow move: after 四个人 the lens rises slowly to the moon under cards 4 and 5 */
/** THE CHEERS (Jay, 16 Nov: "She should hit his cup, like a cheers movement"): her arm can't reach him from her place
 *  3 m away, so on 我陪您喝一杯 she walks up to him (1.85 m, about 2.5 s), clinks, stays for his drink and her sip, and
 *  the end's slow rise to the moon takes her back out to her place */
const WALK = (() => { const d = V(HEAD.x - CAM0.x, 0, HEAD.z - CAM0.z).normalize(); return d.multiplyScalar(1.85); })();
const walkK = (f: number) => smooth(ramp(f, L43.from + 4, F.clink - 3)) * (1 - smooth(ramp(f, F.rise[0], F.rise[0] + 90)));
const cam = (f: number): CamPose => {
  const wk = walkK(f), cam0 = CAM0.clone().addScaledVector(WALK, wk);
  const base = aim(cam0, HEAD.clone().add(V(0, -0.2 - 0.12 * wk, 0)), 980, 510 + 30 * wk);   // him a little left: the moon at x ~870
  // the join: she opens on E's last picture (him on the same spot, the moon where the lantern was: match.ts), holds a
  // beat, then glides to her place for the scene
  const down = smooth(ramp(f, S.from + 14, S.from + 74));
  let c = mixCam(F_OPEN, base, down);
  const r = ramp(f, F.rise[0], F.rise[1]);
  if (r > 0) {
    const p = cam0.clone().add(V(0, 0.6 * r, 0.3 * r));
    const l = V(...(base.look as [number, number, number])).lerp(V(...(aim(cam0, MOON, 900).look as [number, number, number])), r);
    c = { pos: [p.x, p.y, p.z], look: [l.x, l.y, l.z], fov: base.fov };
  }
  // her sip: the lens tips up a little with the cup and back
  const s = sipOf(f);
  if (s > 0) c = C.nudge(c, { pitch: 2 * s });
  return c;
};

// ------------------------------------------------------------------------------------------------ the memory
const MT = LI_TABLE;
const HE_AT = rel(MT.at, MT.facing, 0.75, 0, 0.35), HE_F = yawTo(HE_AT, MT.at) - 0.3;
const memoryCam = (f: number): CamPose => { void f; return aim(V(MT.at.x + 0.3, 1.36, MT.at.z + 2.1), rel(MT.at, MT.facing, 0.35, 0.95, 0), 840); };
const PAPER = (f: number) => h("div", { key: "memPaper", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, background: "rgba(236,214,170,0.38)", boxShadow: "inset 0 0 220px 80px rgba(120,90,50,0.55)", opacity: 1, pointerEvents: "none" }, "data-f": f });

// ------------------------------------------------------------------------------------------------ the end
const OFF_MID = 960;
const offBlack = (key: string, top: number, height: number) => h("div", { key, style: { position: "absolute", left: 0, top, width: 1080, height, background: "#000" } });
const offLine = (hw: number, hh: number, a: number) => h("div", { key: "offLine", style: {
  position: "absolute", left: 540 - hw, top: OFF_MID - hh, width: 2 * hw, height: 2 * hh, borderRadius: hh, background: "#fffaf0", opacity: a,
  boxShadow: "0 0 10px 3px rgba(255,242,222,0.9), 0 0 34px 8px rgba(255,226,190,0.32)" } });
const switchOff = (f: number) => {
  const [c0, c1] = F.collapse, d0 = F.dot[0];
  if (f < c0) return null;
  if (f >= F.black) return offBlack("offBlack", 0, 1920);
  const kids: ReturnType<typeof h>[] = [];
  if (f <= c1) {
    const k = (f - c0 + 1) / (c1 - c0 + 1), hh = Math.max(3, OFF_MID * (1 - smooth(k)));
    const edge = 0.04 + 0.45 * k * k * k, mid = 0.08 + 0.8 * k * k * k, grey = 0.2 * k;
    kids.push(
      h("div", { key: "offGrey", style: { position: "absolute", left: 0, top: OFF_MID - hh, width: 1080, height: 2 * hh, background: `rgba(128,124,120,${grey.toFixed(3)})` } }),
      h("div", { key: "offVeil", style: { position: "absolute", left: 0, top: OFF_MID - hh, width: 1080, height: 2 * hh,
        background: `linear-gradient(to bottom, rgba(255,246,232,${edge.toFixed(3)}) 0%, rgba(255,246,232,${mid.toFixed(3)}) 50%, rgba(255,246,232,${edge.toFixed(3)}) 100%)` } }),
      offBlack("offTop", 0, OFF_MID - hh), offBlack("offBottom", OFF_MID + hh, 1920 - OFF_MID - hh),
    );
    const la = clamp01((60 - hh) / 50);
    if (la > 0) kids.push(offLine(540, 3, la));
  } else {
    const n = f - d0, u = smooth(Math.min(1, (n + 1) / 6)), a = n < 6 ? 1 : 1 - (n - 5) / 5;
    kids.push(offBlack("offAll", 0, 1920), offLine(lerp(540, 7, u), lerp(3, 7, u * u), a));
  }
  return h("div", { key: "switchOff", style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden" } }, ...kids);
};

// ------------------------------------------------------------------------------------------------ 李白 at night
/** his hip on the stone (the seat is 0.17 m in front of the stone's middle) */
const SITP = rel(STONE_AT, FAC, 0, 0, 0.17);
const cupAt = (f: number) => {
  const toast = ramp(f, F.toast, F.toast + 10) * (1 - ramp(f, F.cupLook - 12, F.cupLook));
  const look = ramp(f, F.cupLook, F.cupLook + 8) * (1 - ramp(f, F.cupIn - 6, F.cupIn + 4));
  const out = ramp(f, F.cupIn, F.cupIn + 10) * (1 - ramp(f, F.drink - 4, F.drink + 4));
  const drink = drinkK(f);
  const p = rel(SITP, FAC, -0.17, 0.78, 0.22);
  p.lerp(rel(SITP, FAC, -0.22, 1.18, 0.36), toast);
  p.lerp(rel(SITP, FAC, -0.05, 0.92, 0.3), look);
  p.lerp(rel(SITP, FAC, -0.06, 1.0, 0.38), out);
  p.lerp(SIP_AT.clone().add(V(0, 0.01 * sipBob(f), 0)), drink);
  return { p, tilt: (DRINK_TILT - 0.08 * sipBob(f)) * drink, roll: 0 };
};
/** HIS DRINK after 四个人 (Jay, 16 Nov: "give him a simple drink animation, then change to smile"; "the cup is tilted
 *  wrong"): the bowl to his lips, tipped back toward him (the lens sees its foot), two sips, down, and a smile */
const DRINK_LEN = 44, DRINK_TILT = -0.85;
const drinkK = (f: number) => smooth(ramp(f, F.drink, F.drink + 8)) * (1 - smooth(ramp(f, F.drink + DRINK_LEN - 10, F.drink + DRINK_LEN)));
const sipBob = (f: number) => { const d = f - F.drink - 8; return d < 0 || d >= 24 ? 0 : Math.max(0, Math.sin((d / 12) * Math.PI * 2)); };
const SIP_AT = rel(SITP, FAC, -0.05, 1.07, 0.3);
/** HER CUP (Jay, 16 Nov): it comes up just in front of the lens; a cheers: it goes out to his cup, clinks (F.clink) and
 *  comes back; she waits while he drinks; then her own sip: it tips TOWARD the lens (we see into it), and goes down.
 *  In camera space: [right, up, forward] metres */
const SIP0 = F.drink + DRINK_LEN + 4;
const SIP = { up: [F.cupIn, F.cupIn + 10], out: [F.clink - 9, F.clink], back: [F.clink + 3, F.clink + 17], sip: [SIP0, SIP0 + 28], down: [SIP0 + 30, SIP0 + 42] } as const;
const sipOf = (f: number) => smooth(ramp(f, SIP.sip[0], SIP.sip[0] + 9)) * (1 - smooth(ramp(f, SIP.sip[1] - 8, SIP.sip[1])));
const herCup = (f: number, c: CamPose, his: THREE.Vector3) => {
  const inK = smooth(ramp(f, SIP.up[0], SIP.up[1])) * (1 - smooth(ramp(f, SIP.down[0], SIP.down[1]))), s = sipOf(f);
  if (inK <= 0) return null;
  const p = V(...(c.pos as [number, number, number])), l = V(...(c.look as [number, number, number]));
  const fwd = l.clone().sub(p).normalize(), right = fwd.clone().cross(V(0, 1, 0)).normalize(), up = right.clone().cross(fwd).normalize();
  const rest = p.clone().addScaledVector(fwd, 0.46 - 0.04 * s).addScaledVector(right, 0.03).addScaledVector(up, -0.46 + 0.2 * inK + 0.09 * s);
  const cheers = smooth(ramp(f, SIP.out[0], SIP.out[1])) * (1 - smooth(ramp(f, SIP.back[0], SIP.back[1])));
  const bump = f >= F.clink && f < F.clink + 3 ? 0.01 : 0;
  return { at: rest.lerp(his.clone().add(V(0.16, 0.034, 0.06)), cheers).add(V(0, bump, 0)), rot: [0.55 * s, Math.atan2(-fwd.x, -fwd.z), 0] as [number, number, number] };
};

export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit(w) { setSeat(w.actor(LI_RED), null); w.actor(HE).set({ visible: false }); w.actor(LI).set({ visible: false }); DRINKER_PEOPLE.forEach((p) => w.actor(p).set({ visible: false })); w.actor(KEEPER).set({ visible: false }); },
  pose(w, f0) {
    // after the off click the picture is frozen on that frame (the overlays still run on f0)
    const f = Math.min(f0, F.offClick), t = f / FPS;
    const inMemory = f >= F.memory[0] && f <= F.memory[1];
    if (inMemory) {
      // ---------------------------------------------------------------- the memory: the tavern, years before
      w.setPlace("tavern");
      w.set.param("sun", 0.8);
      const camera = memoryCam(f);
      w.setCamera(camera);
      setSeat(w.actor(LI_RED), null);
      w.actor(LI_RED).set({ visible: false });
      tavern(w, f, { drinkers: 2, lamps: 0 });
      const untie = F.turtle, down = word("F37", "换酒");
      w.actor(LI).set({ ...atTable(MT, f, 1, {}), expr: f < untie ? "shock" : "laugh", blink: lid(t, 1), gaze: 1, head: accent("laugh", f, down, { dur: 0.8 }) });
      const tp = rel(HE_AT, HE_F, 0, 1.0 - 0.38 * ramp(f, untie, untie + 10), 0.28).lerp(MT.on(0.18, 0.12).add(V(0, 0.02, 0)), ramp(f, down - 16, down));
      const holding = f >= untie - 2 && f < down;
      w.actor(HE).set({ ...standing(HE_AT, HE_F, f, 8), expr: f < untie ? "laugh" : "happy", head: heads(accent("laugh", f, F.memory[0] + 4, { dur: 1.2 }), headPop(f, untie)), pose: holding ? { kind: "hold", t } : { kind: "idle", t }, hands: holding ? [tp, null] : [null, null] });
      w.update();
      trackHead(w, "he", w.actor(HE), f);
      if (f >= untie - 2) w.prop("turtle").put(tp, { grip: "hilt", rot: HE_F });
      putTable(w, MT);
      return { camera, overlays: frag(PAPER(f), transitionAt(f)?.node), slate: "F memory" };
    }
    // ------------------------------------------------------------------ the night
    w.setPlace("night");
    w.set.param("moon", 1);
    const camera = cam(f);
    w.setCamera(camera);
    w.actor(LI).set({ visible: false }); w.actor(HE).set({ visible: false });
    w.prop("stone").put(STONE_AT, { rot: FAC });
    w.prop("blossomTree").put(TREE, { rot: 0.6, scale: 0.85 });
    w.prop("jar").put(JAR, { rot: 0.4 });
    const expr = at<NonNullable<St["expr"]>>(f, [[0, "smile_closed"], [lineId("F35").from, "smile"], [lineId("F37").from, "smile_closed"], [lineId("F38").from, "sigh"], [lineId("F39").to, "smile"], [F.toast, "happy"], [F.moon, "smile_closed"], [F.cupLook, "sigh"], [L42.to, "sad"], [L43.from + 20, "smile"], [L44.from, "smile_closed"], [F.drink + DRINK_LEN - 6, "smile"]]);
    const m = says("li", ["F35", "F37", "F38", "F40", "F41", "F42", "F44"], f, 2);
    const cp = cupAt(f);
    setSeat(w.actor(LI_RED), SEAT, FAC);
    w.actor(LI_RED).set({
      at: V(STONE_AT.x, 0, STONE_AT.z), facing: FAC, seat: SEAT, pose: { kind: "sit", t }, visible: true,
      hands: [cp.p, null], expr, mouth: m.mouth, blink: m.blink ?? lid(t, 2),
      head: heads(m.head, f >= F.moon && f < F.three ? { dy: 0.08 } : undefined, headPop(f, word("F44", "四个人"))),
      lookDown: f >= F.cupLook && f < F.cupIn ? 20 : 0, gaze: f >= F.toast && f < F.three ? 0.5 : 0,
    });
    w.update();
    // the cup goes where his hand got to (his lean-back posture can leave the hand short of the target on the toast)
    // the bowl sits ON his hand (its foot a hand's radius along the bowl's own up), so the hand never shows through the foot
    const bowlUp = V(0, 1, 0).applyEuler(new THREE.Euler(cp.tilt, 0, cp.roll ?? 0)).multiplyScalar(0.024);
    w.prop("wineBowl").put(w.actor(LI_RED).handWorld(0).add(bowlUp), { grip: "hilt", rot: [cp.tilt, 0, cp.roll ?? 0] });
    const hc = herCup(f, camera, w.actor(LI_RED).handWorld(0));   // the cheers goes to his bowl, wherever his hand is
    if (hc) w.prop("wineBowl", "ji").put(hc.at, { rot: hc.rot });
    const off = f0 >= F.offClick;
    return {
      camera, overlays: frag(transitionAt(f0)?.node, switchOff(f0)), slate: "F night",
      ...(f0 >= F.collapse[0] ? { captions: false } : {}), ...(f0 >= F.black ? { hud: false } : {}), ...(off ? { clock: F.offClick / FPS } : {}),
    };
  },
};
void THREE; void table;
