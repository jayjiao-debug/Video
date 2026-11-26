// SCENE E · 人间 14:00, her office. THE JOB. The spool comes away from her lens: an open-plan floor, 林小满 typing, and
// 月老 tiptoeing up beside her chair (mortals cannot see us: he waves a hand in front of her face). He flicks the
// thread: it runs along the floor, under the desk, and ties itself round her ANKLE with a bow. (Not the wrist: THE FACT
// CARD, in the silence.) Then he draws three candidates' threads in through the glass and holds them like reins, and
// she picks up her phone: 不合适, 不合适, 下一个. Every swipe snaps one. He is left holding three limp ends.
// CAMERA PLAN (her eyes, one take; 24 s, five moves):
//   open     LOOK AT her at the laptop, him creeping up     medium wide two-shot, she left, he right     still (the spool comes away from the lens)
//   the flick the thread running to her ankle                low, under the desk: the ankle and the bow   she ducks after the thread
//   唐朝起    his face, lecturing down at her lens           medium close from below                      up from the ankle to him; still through the fact card
//   不合适    the two of them, the three threads behind      medium wide two-shot                         a step back as she picks up the phone; still for the three snaps
//   断一根    his face                                       close (snap zoom, a third tighter)           lands on the word; eases back for 缘分未到
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { zoomBy } from "../cam";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, faceTo, v3, hit, shotCam, VERBS, SEATS, type ShotKey } from "./kit";
import { act, YL, XM, stroke, type MoodKey } from "./act";
import { sideCard, snaps, stamp, spoolLens, draw, type Fx } from "./fx";
import { lay, droop, taut, recoil, anklet, knotAt, bowKnot, part, join, FLAT } from "./thread";

const S = seg("E");
const STAND = P("work", 0.84, 0, -1.5), IN = [P("work", 2.3, 0, -1.0), P("work", 1.3, 0, -1.3), STAND];
const FRONTP = [0.45, 1.45, 1.45], MID = [0.42, 1.05, -1.48], HEADY = [0.84, 1.195, -1.5];
/** the three candidates' threads come in through the glass from these points of the window wall */
const FAR = [P("work", -2.3, 2.25, -2.96), P("work", 0.5, 2.6, -2.96), P("work", 2.7, 2.2, -2.96)];
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("work"); w.set.param("glow", 1); w.set.param("late", 0.15);
    const e01 = startOf("E01"), e02 = startOf("E02"), e03 = startOf("E03"), wrist = wordAt("E03", "绑手"), x03 = endOf("E03"), e04 = startOf("E04"), x04 = endOf("E04"), e05 = startOf("E05"), x05 = endOf("E05"), e06 = startOf("E06");
    const flick = e02 - 26, tied = flick + 12, cardEnd = x03 + 78, reins = cardEnd - 14, phone = e04 - 18, one = wordAt("E05", "断一根"), fate = wordAt("E06", "缘分");
    const hits = [e04 + 6, wordAt("E04", "不合适下") + 6, wordAt("E04", "下一个") + 6];
    const t = f / 30;
    // ---------------------------------------------------------------------------------------------- the camera
    const ANK0 = [0.06, 0.09, -1.14];
    const keys: ShotKey[] = [
      { f: S.from, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: flick - 2, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: flick + 12, pos: [0.98, 0.3, -0.56], at: ANK0, sx: 470, sy: 980, fov: 46 },
      { f: e03 - 15, pos: [0.98, 0.3, -0.56], at: ANK0, sx: 470, sy: 980, fov: 46 },
      { f: e03 - 1, pos: [0.95, 1.0, 0.25], at: HEADY, sx: 560, sy: 760, fov: 50 },
      { f: cardEnd - 4, pos: [0.95, 1.0, 0.25], at: HEADY, sx: 560, sy: 760, fov: 50 },
      { f: e04 - 6, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: one - 5, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: one, pos: FRONTP, at: HEADY, sx: 610, sy: 830, fov: zoomBy(56, 0.64) },
      { f: e06 - 14, pos: FRONTP, at: HEADY, sx: 610, sy: 830, fov: zoomBy(56, 0.64) },
      { f: e06 + 2, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: S.to, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
    ];
    const camera = shotCam("work", f, keys, { mood: "calm", amp: 0.6, walk: [[S.from, 0], [flick, 0], [flick + 4, 0.3], [flick + 12, 0], [cardEnd - 4, 0], [cardEnd, 0.3], [e04 - 6, 0]] });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // ---------------------------------------------------------------------------------------------- 林小满
    const onPhone = f >= phone, swipe = Math.max(...hits.map((x) => hit(f, x - 4, 9)));
    const key = (dx: number) => P("work", dx + 0.012 * Math.sin(f * 1.9 + dx * 40), 0.655 + 0.006 * Math.abs(Math.sin(f * 2.3 + dx * 31)), -1.14);
    const xm = act(w, f, XM, {
      at: SEATS.chair.top.clone().setY(0), facing: 0, seat: SEATS.chair,
      faces: [[S.from, "flat"], [phone - 6, "tired"], [e04 - 2, "flat"], [x04 + 8, "tired"]],
      pose: onPhone ? { kind: "phone", t, amount: 0.34, arm: 1 } : undefined, show: onPhone ? ["phone"] : undefined,
      hands: onPhone ? undefined : [key(-0.07), key(0.07)],
      lookDown: onPhone ? 6 : 9, gaze: 0, talkGaze: 0,
      head: { dx: -0.07 * swipe, tilt: onPhone ? 3 : 0 },
    });
    // ---------------------------------------------------------------------------------------------- 月老
    const leg = walkAlong(IN, 0.95, (f - S.from) / 30), moving = leg.moving;
    const at = leg.at.clone(), front = faceTo(STAND, camP);
    const facing = moving ? leg.facing : front + 0.3 * ky(f, [[e04 - 12, 0], [e04 - 2, -1], [e05 - 6, -1], [e05 + 2, 0]]);
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z), hangR = hang(at, facing, 0), hangL = hang(at, facing, 1);
    const hush = !moving && f >= e01 - 8 && f < e01 + 14;
    const waveK = ky(f, [[e01 + 16, 0], [e01 + 23, 1], [flick - 14, 1], [flick - 8, 0]]), windK = ky(f, [[flick - 8, 0], [flick - 2, 1], [flick + 3, -0.6], [flick + 14, 0]]);
    const lectK = ky(f, [[e03 - 6, 0], [e03 + 2, 1], [x03 + 4, 1], [x03 + 12, 0]]), strokeK = ky(f, [[x03 + 12, 0], [x03 + 20, 1], [reins - 6, 1], [reins, 0]]);
    const reinK = ky(f, [[reins, 0], [reins + 10, 1]]), shakeK = ky(f, [[e05 - 3, 0], [e05 + 3, 1], [x05 + 2, 1], [x05 + 10, 0]]), hideK = ky(f, [[x05 + 6, 0], [x05 + 16, 1]]);
    const jolt = 0.04 * Math.max(...hits.map((x) => hit(f, x, 7)));
    const beat = 0.03 * (hit(f, e03 + 1, 7) + hit(f, wordAt("E03", "绑脚"), 7)), flap = f >= wrist - 2 && f < x03 ? 0.04 * Math.sin(f * 1.3) : 0;
    const fist = H(0.2, 1.03 - jolt + 0.05 * shakeK * Math.sin(f * 1.5), 0.08 + 0.1 * shakeK).lerp(H(0.07, 0.6, -0.19), smooth(hideK));
    const right = waveK > 0.02 ? hangR.clone().lerp(H(-0.34, 1.02 + 0.07 * Math.sin(f * 0.9), 0.1), smooth(waveK))
      : f >= flick - 8 && f < flick + 14 ? hangR.clone().lerp(H(-0.16, 0.86 + 0.2 * windK, 0.12 + 0.16 * Math.max(0, -windK)), 1)
      : lectK > 0.02 ? hangR.clone().lerp(H(-0.25, 1.06 + beat + flap - (f >= wrist - 2 ? 0.12 : 0), 0.14), smooth(lectK))
      : strokeK > 0.02 ? (stroke(at, facing, f, strokeK)?.[0] ?? hangR)
      : shakeK > 0.02 || hideK > 0.02 ? hangR.clone().lerp(H(-0.2, 0.98 + 0.05 * Math.sin(f * 1.5 + 1), 0.18), smooth(shakeK)).lerp(H(-0.07, 0.6, -0.19), smooth(hideK))
      : hangR;
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined = moving || hush ? undefined : [right, reinK > 0.02 ? hangL.clone().lerp(fist, smooth(reinK)) : hangL];
    const faces: MoodKey[] = [
      [S.from, "sly"], [e01 - 6, "hush"], [e01 + 18, "sly"], [flick - 6, "resolve"], [tied + 4, "proud"], [e02 + 14, "look"], [e03 - 2, "proud"], [wrist - 2, "grumble"], [x03 + 10, "sly"],
      [reins + 4, "hope"], [hits[0] + 1, "worry", "take", 0.6], [hits[1] + 1, "panic", "take"], [hits[2] + 1, "aghast", "take", 0.7], [e05 - 1, "shout"], [x05 + 8, "sag", "sink"], [e06 - 2, "sheepish"], [fate - 2, "small"],
    ];
    const r = act(w, f, YL, {
      at, facing, faces,
      pose: moving ? leg.pose : hush ? { kind: "shh", t, arm: 1, amount: ky(f, [[e01 - 8, 0], [e01 - 2, 1], [e01 + 8, 1], [e01 + 14, 0]]) } : undefined,
      hands, show: hush ? ["finger"] : undefined,
      lean: { roll: -7 * waveK, pitch: 5 * (f >= flick && f < e03 - 10 ? 1 : 0) + 4 * lectK },
      gaze: waveK > 0.5 ? -1 : f >= reins + 6 && f < e05 - 4 ? -1 : undefined,
      lookDown: (f >= flick - 2 && f < e02 + 10 ? 12 : 0) + 8 * hideK,
      head: { dy: 0.05 * hit(f, e05, 8) - 0.04 * hideK, tilt: -5 * waveK },
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the threads
    const TH = { r: 0.0065 }, h0 = r.handWorld(0), h1 = r.handWorld(1);
    const foot = xm.footWorld(1), ank = foot.clone().add(V(0, 0.07, 0)), toHim = V(1, 0, -0.35).normalize();
    // the end he carries hangs from his right hand; on the flick it runs out along the floor, under the desk, to her ankle
    const floorRun = lay([P("work", 0.66, 0, -1.3), P("work", 0.38, 0, -1.2), knotAt(ank, toHim, 0.03)], FLAT, { wander: 0.012, seed: 3 });
    if (f < flick) w.props.thread("end", droop(h0, h0.clone().add(V(0.02, -0.34, 0.03)), 0.02, FLAT, { n: 6, sway: 0.01 * Math.sin(f * 0.2) }), TH);
    else if (f < tied) w.props.thread("end", part(join(droop(h0, floorRun[0], 0.12, FLAT, { n: 8 }), floorRun), smooth((f - flick) / 9)), TH);
    else {
      // tied: the loop and its bow on her ankle; the rest lies on the floor where it fell from his hand
      w.props.thread("ank", anklet(ank, 0.026, 0.25, 0.4), { r: 0.007, closed: true });
      w.props.thread("bow", bowKnot(knotAt(ank, toHim, 0.026), toHim, 0.03 * smooth((f - tied) / 6)), { r: 0.006, closed: true });
      const drop = smooth((f - tied) / 8), endPt = h0.clone().lerp(P("work", 0.78, 0.0065, -1.24), drop);
      w.props.thread("end", join([endPt], lay([P("work", 0.7, 0, -1.27), P("work", 0.38, 0, -1.2), knotAt(ank, toHim, 0.03)], FLAT, { wander: 0.012, seed: 3 })), TH);
    }
    // the three candidates: in through the glass to his fist, taut; each snaps on its swipe
    FAR.forEach((far, i) => {
      const on = reins + i * 5;
      if (f < on) return;
      const hand = h1.clone().add(V(0, 0.02, 0));
      if (f < hits[i]) { const run = taut(far, hand, f, [on + 10], { sag: 0.05, n: 10 }); w.props.thread(`c${i}`, part(run, smooth((f - on) / 10)), { r: 0.007, glow: 0.5 }); return; }
      const d = f - hits[i], brk = hand.clone().lerp(far, 0.3);
      w.props.thread(`c${i}`, recoil(hand, brk, d, FLAT, { n: 10, whip: 0.5 }), { r: 0.007 });
      if (d < 26) w.props.thread(`c${i}far`, recoil(far, brk, d * 1.3, FLAT, { n: 8, whip: 0.3 }), { r: 0.007, glow: 0.4 * (1 - d / 26) });
    });
    // ---------------------------------------------------------------------------------------------- over the picture
    const FX: Fx[] = [
      sideCard(f, { from: S.from + 24, to: e01 + 30, name: "林小满", note: "30 岁 · 程序员 · 今天也加班", face: VERBS.headPx(w, xm), side: "above", keep: [(() => { const q = VERBS.headPx(w, r); return { x0: q.x - q.r * 1.2, y0: q.y - q.r * 1.6, x1: q.x + q.r * 1.2, y1: q.y + q.r * 1.2 }; })()] }),
      snaps(f, { from: hits[0] - 2, to: e06 - 8, x: 470, y: 480, hits }),
      stamp(f, { from: wordAt("E06", "未到") + 8, to: S.to - 2, x: 470, y: 500 }),
    ];
    const cover = ky(f, [[S.from, 1], [S.from + 3, 0.85], [S.from + 13, 0]]);
    return { camera, overlays: [draw(f, FX), spoolLens(cover)], shown: FX, post: { bloom: 0.4 } };
  },
};
