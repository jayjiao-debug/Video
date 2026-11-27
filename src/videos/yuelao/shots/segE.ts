// SCENE E · 人间 14:00, her office. THE JOB. The spool comes away from her lens: an open-plan floor, 林小满 typing, and
// 月老 tiptoeing up beside her chair. Mortals cannot see us: he leans in and waves a mitten right at her glasses, and
// she types on. He draws a thread from his sleeve and casts it: it drops to the floor, runs under the desk, winds once
// round her ANKLE and ties itself in a bow. (Not the wrist: THE FACT CARD, in the silence.) Then three candidates'
// threads come in through the glass, over her head, into his raised fist, and he holds them like reins; she picks up
// her phone: 不合适, 不合适, 下一个. Every swipe snaps one above her: the far half whips back out through the glass, his
// half falls limp. He is left holding three limp ends, shakes them at us, and hides them behind his back.
// CAMERA PLAN (her eyes, one take; 24 s, five moves; she never travels more than a step and a crouch):
//   open     LOOK AT her at the laptop, him creeping up     medium wide two-shot, she left, he right     still (the spool comes away from the lens)
//   the cast the thread running to her ankle                low, from in front of the desk: the ankle    she steps in and crouches after the thread
//   唐朝起    his face, lecturing down at her lens           medium close from below                      she rises where she is; still through the fact card
//   不合适    the two of them, the three threads over her    medium wide two-shot                         a step back as the threads come in; still for the three snaps
//   断一根    his face and the limp ends                     close (snap zoom, a third tighter)           lands on the word; eases back for 缘分未到
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { zoomBy } from "../cam";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, faceTo, v3, hit, win, shotCam, seatedShin, VERBS, SEATS, type ShotKey } from "./kit";
import { act, YL, XM, stroke, type MoodKey } from "./act";
import { sideCard, snaps, stamp, spoolLens, draw, type Fx } from "./fx";
import { lay, droop, taut, limp, retract, bowKnot, part, join, blend, FLAT } from "./thread";

const S = seg("E");
const STAND = P("work", 0.62, 0, -1.5), IN = [P("work", 1.75, 0, -1.36), P("work", 1.2, 0, -1.52), STAND];   // round the back of the desk's corner leg
const FRONTP = [0.34, 1.45, 1.45], MID = [0.31, 1.05, -1.48], HEADY = [0.62, 1.195, -1.5];
const LOW = [0.5, 0.35, 0.3], ANKP = [0.075, 0.075, -1.19], CLOSE = [0.74, 1.0, 0.25];
/** the three candidates' threads come in through the glass from these points of the window wall: two from far off to
 *  the left, over her head, one from straight above. None crosses him, her, or the REC display's cards. */
const FAR = [P("work", -2.7, 2.05, -2.96), P("work", -2.2, 2.45, -2.96), P("work", 0.36, 2.75, -2.96)];
/** where each one snaps, as a share of its length from his fist: over her head, over her head, above his fist */
const BRK = [0.13, 0.2, 0.3];
const hsh = (n: number) => { const x = Math.sin(n * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x); };
export const SEG: Segment = {
  id: "E", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("work"); w.set.param("glow", 1); w.set.param("late", 0.15);
    const e01 = startOf("E01"), e02 = startOf("E02"), e03 = startOf("E03"), wrist = wordAt("E03", "绑手"), x03 = endOf("E03"), e04 = startOf("E04"), x04 = endOf("E04"), e05 = startOf("E05"), x05 = endOf("E05"), e06 = startOf("E06");
    // the cast: the thread leaves his hand at `flick`, reaches her ankle 8 frames on, winds round it, and the bow is tied by flick + 19
    const flick = e02 - 26, wound = flick + 8, bowAt = flick + 12, letGo = flick + 18;
    const cardEnd = x03 + 78, reins = cardEnd - 10, phone = e04 - 18, one = wordAt("E05", "断一根"), fate = wordAt("E06", "缘分");
    const ons = [reins + 2, reins + 7, reins + 12], hits = [e04 + 6, wordAt("E04", "不合适下") + 6, wordAt("E04", "下一个") + 6];
    const t = f / 30;
    // ---------------------------------------------------------------------------------------------- the camera
    const keys: ShotKey[] = [
      { f: S.from, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: flick + 1, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: flick + 15, pos: LOW, at: ANKP, sx: 540, sy: 1000, fov: 26 },
      { f: e03 - 15, pos: LOW, at: ANKP, sx: 540, sy: 1000, fov: 26 },
      { f: e03 - 1, pos: CLOSE, at: HEADY, sx: 560, sy: 850, fov: 55 },
      { f: cardEnd - 4, pos: CLOSE, at: HEADY, sx: 560, sy: 850, fov: 55 },
      { f: e04 - 6, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: one - 5, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: one, pos: FRONTP, at: HEADY, sx: 610, sy: 880, fov: zoomBy(56, 0.64) },
      { f: e06 - 14, pos: FRONTP, at: HEADY, sx: 610, sy: 880, fov: zoomBy(56, 0.64) },
      { f: e06 + 2, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
      { f: S.to, pos: FRONTP, at: MID, sx: 540, sy: 880, fov: 56 },
    ];
    const camera = shotCam("work", f, keys, { mood: "calm", amp: 0.6, walk: [[S.from, 0], [flick + 1, 0], [flick + 6, 0.3], [flick + 15, 0], [cardEnd - 4, 0], [cardEnd, 0.3], [e04 - 6, 0]] });
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // ---------------------------------------------------------------------------------------------- 林小满
    // she types: each hand hops from key to key, the two out of step; her eyes run along the lines; she sees nothing
    const onPhone = f >= phone, swipe = Math.max(...hits.map((x) => hit(f, x - 4, 9)));
    const key = (i: number) => {
      const q = f / 4.2 + i * 0.5, k = Math.floor(q), u = smooth(q - k), x0 = (hsh(k + i * 57) - 0.5) * 0.07, x1 = (hsh(k + 1 + i * 57) - 0.5) * 0.07;
      return P("work", (i ? 0.075 : -0.075) + x0 + (x1 - x0) * u, 0.655 + 0.016 * Math.sin(Math.PI * (q - k)), -1.14 + 0.012 * (hsh(k + 5 + i * 57) - 0.5));
    };
    const xm = act(w, f, XM, {
      at: SEATS.chair.top.clone().setY(0), facing: 0, seat: SEATS.chair,
      faces: [[S.from, "flat"], [e01 + 30, "flat", "blink"], [phone - 6, "tired"], [e04 - 2, "flat"], [x04 + 8, "tired"]],
      pose: onPhone ? { kind: "phone", t, amount: 0.34, arm: 1 } : undefined, show: onPhone ? ["phone"] : undefined,
      hands: onPhone ? undefined : [key(0), key(1)],
      lookDown: onPhone ? 6 : 9, gaze: 0, talkGaze: 0,
      head: { dx: -0.07 * swipe + (onPhone ? 0 : 0.012 * Math.sin(f * 0.085)), dy: onPhone ? 0 : 0.004 * Math.sin(f * 0.21), tilt: onPhone ? 3 : 1.5 * Math.sin(f * 0.05) },
    });
    // ---------------------------------------------------------------------------------------------- 月老
    const leg = walkAlong(IN, 0.7, (f - S.from) / 30), moving = leg.moving;   // he creeps in: slow, from just outside the frame
    const at = leg.at.clone(), front = faceTo(STAND, camP);
    // he turns to her for the wave and the cast, and again while he holds the reins over her
    const turnK = ky(f, [[e01 + 12, 0], [e01 + 20, 1], [flick + 14, 1], [e02 + 4, 0], [e04 - 12, 0], [e04 - 2, 0.75], [e05 - 6, 0.75], [e05 + 2, 0]]);
    const facing = moving ? leg.facing : front - 0.45 * turnK;
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z), hangR = hang(at, facing, 0), hangL = hang(at, facing, 1);
    const hush = !moving && f >= e01 - 8 && f < e01 + 14;
    // the wave: he leans over and waves at the edge of her glasses (as far as his arm goes)
    const waveK = ky(f, [[e01 + 14, 0], [e01 + 22, 1], [flick - 16, 1], [flick - 10, 0]]);
    const waveAt = P("work", 0.215 + 0.035 * Math.sin(f * 0.62), 1.0 + 0.035 * Math.cos(f * 1.24), -1.14);   // in front of her face, a hand's width clear of it
    // the cast: the right hand into the left sleeve, up beside his head with a thread, and down toward her feet
    const sleeveK = ky(f, [[flick - 10, 0], [flick - 6, 1], [flick - 2, 1], [flick + 3, 0]]);
    const windK = ky(f, [[flick - 6, 0], [flick - 1, 1], [flick + 3, -1]]), castOn = Math.min(smooth((f - (flick - 11)) / 5), 1 - smooth((f - (flick + 13)) / 8));
    const SL = H(0.0, 0.78, 0.2), castAt = windK >= 0 ? SL.clone().lerp(H(-0.34, 1.1, 0.02), smooth(windK)) : SL.clone().lerp(H(-0.2, 0.72, 0.32), smooth(-windK));
    const lectK = ky(f, [[e03 - 6, 0], [e03 + 2, 1], [x03 + 4, 1], [x03 + 12, 0]]), strokeK = ky(f, [[x03 + 12, 0], [x03 + 20, 1]]);
    const reinK = ky(f, [[reins, 0], [reins + 8, 1]]);
    const SHAKE: [number, number][] = [[e05 - 3, 0], [e05 + 3, 1], [x05 + 2, 1], [x05 + 10, 0]], HIDE: [number, number][] = [[x05 + 6, 0], [x05 + 16, 1]];
    const shakeK = ky(f, SHAKE), hideK = ky(f, HIDE);
    const beat = 0.03 * (hit(f, e03 + 1, 7) + hit(f, wordAt("E03", "绑脚"), 7)), flap = f >= wrist - 2 && f < x03 ? 0.04 * Math.sin(f * 1.3) : 0;
    // the fist that holds the reins: up beside his head on her side; each thread that arrives tugs it, each snap lets
    // it jerk back; he shakes the limp ends at us, then hides them behind his back
    const fistAt = (g: number) => {
      const sk = ky(g, SHAKE), hk = ky(g, HIDE), jolt = Math.max(...hits.map((x) => hit(g, x, 7))), tug = Math.max(...ons.map((x) => hit(g, x + 8, 6)));
      return H(-0.35 + 0.08 * sk + 0.03 * jolt - 0.012 * tug, 1.24 - 0.08 * sk - 0.04 * jolt + 0.045 * sk * Math.sin(g * 1.4) + 0.012 * tug, 0.03 + 0.14 * sk).lerp(H(-0.07, 0.6, -0.19), smooth(hk));
    };
    const strokeAt = stroke(at, facing, f, strokeK)?.[0] ?? hangR;
    const right = waveK > 0.02 ? hangR.clone().lerp(waveAt, smooth(waveK))
      : castOn > 0.02 ? hangR.clone().lerp(castAt, castOn)
      : lectK > 0.02 ? hangR.clone().lerp(H(-0.25, 1.06 + beat + flap - (f >= wrist - 2 ? 0.12 : 0), 0.14), smooth(lectK))
      : reinK > 0.02 ? strokeAt.clone().lerp(fistAt(f), smooth(reinK))
      : strokeK > 0.02 ? strokeAt
      : hangR;
    const left = sleeveK > 0.02 ? hangL.clone().lerp(H(0.07, 0.76, 0.2), smooth(sleeveK))
      : shakeK > 0.02 || hideK > 0.02 ? hangL.clone().lerp(H(0.22, 0.9 + 0.04 * Math.sin(f * 1.4 + 1), 0.2), smooth(shakeK)).lerp(H(0.07, 0.6, -0.19), smooth(hideK))
      : hangL;
    const hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined = moving || hush ? undefined : [right, left];
    const faces: MoodKey[] = [
      [S.from, "sly"], [e01 - 6, "hush"], [e01 + 18, "sly"], [flick - 6, "resolve"], [flick + 14, "proud"], [e02 + 14, "look"], [e03 - 2, "proud"], [wrist - 2, "grumble"], [x03 + 10, "sly"],
      [reins + 4, "hope"], [hits[0] + 1, "worry", "take", 0.6], [hits[1] + 1, "panic", "take"], [hits[2] + 1, "aghast", "take", 0.7], [e05 - 1, "shout"], [x05 + 8, "sag", "sink"], [e06 - 2, "sheepish"], [fate - 2, "small"],
    ];
    const r = act(w, f, YL, {
      at, facing, faces,
      pose: moving ? leg.pose : hush ? { kind: "shh", t, arm: 1, amount: ky(f, [[e01 - 8, 0], [e01 - 2, 1], [e01 + 8, 1], [e01 + 14, 0]]) } : undefined,
      hands, show: hush ? ["finger"] : undefined, armFront: sleeveK > 0.3 ? [true, true] : undefined,
      lean: { roll: -3 * waveK, pitch: 5 * waveK + 5 * win(f, flick - 2, e03 - 10, 6) + 4 * lectK },
      gaze: waveK > 0.5 ? -1 : f >= reins + 6 && f < e05 - 4 ? -1 : undefined,
      lookDown: 12 * win(f, flick - 6, e02 + 10, 6) + 8 * hideK,
      head: { dy: 0.05 * hit(f, e05, 8) - 0.04 * hideK, tilt: -5 * waveK },
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- her thread
    const TH = { r: 0.0065 }, h0 = r.handWorld(0);
    // where it is tied: round her left shin, just above the shoe, the knot at the front on his side
    const shin = seatedShin(xm, 1), C = shin.a.clone().addScaledVector(shin.up, 0.04), RR = 0.019, D = V(0.5, 0, 0.87), aK = Math.atan2(D.z, D.x);
    const K = C.clone().addScaledVector(D, RR + 0.004), G = V(C.x + 0.05, 0.0065, C.z + 0.03);
    const F0 = P("work", 0.26, 0, -1.27), F1 = P("work", 0.17, 0, -1.2);
    // from the floor up to the knot: the last 5 cm rise beside her shoe
    const rise = [G.clone(), V(C.x + 0.04, 0.03, C.z + 0.028), V(K.x + 0.008, K.y - 0.012, K.z + 0.006), K.clone()];
    const floorRun = join(lay([F0, F1, G], FLAT, { wander: 0.01, seed: 3 }), rise);
    const ring = (k: number) => { const m = Math.max(2, Math.round(14 * k)), pts: THREE.Vector3[] = []; for (let i = 0; i <= m; i++) { const a = aK + (i / m) * 2 * Math.PI * k; pts.push(C.clone().add(V(Math.cos(a) * RR, 0.22 * RR * Math.sin(a + 0.4), Math.sin(a) * RR))); } return pts; };
    if (f >= flick - 5 && f < flick) {
      // out of his sleeve: a short end hangs from the hand as it comes up
      const len = 0.3 * smooth((f - (flick - 5)) / 4);
      w.props.thread("end", droop(h0, h0.clone().add(V(0.02, -len, 0.03)), 0.02, FLAT, { n: 6 }), TH);
    } else if (f >= flick) {
      const fromHand = droop(h0, F0.clone().setY(0.0065), 0.1, FLAT, { n: 8 });
      if (f < wound) { const u = (f - flick) / (wound - flick); w.props.thread("end", part(join(fromHand, floorRun), 1 - (1 - u) * (1 - u)), TH); }
      else {
        // round her ankle once, then the bow: two loops, the long end down to the floor, a short tail on her shoe
        const rk = smooth((f - wound) / (bowAt - wound));
        if (rk < 1) w.props.thread("ank", ring(rk), { r: 0.007 }); else w.props.thread("ank", ring(1).slice(0, -1), { r: 0.007, closed: true });
        if (f >= bowAt) {
          const d = f - bowAt, grow = smooth(d / 5) * (1 + 0.16 * Math.exp(-d / 5) * Math.cos(d * 0.9));
          w.props.thread("bow", bowKnot(K, D, 0.03 * grow), { r: 0.006, closed: true });
          w.props.thread("tail", [K.clone(), K.clone().add(V(-0.012, -0.008, 0.012)), K.clone().add(V(-0.02, -0.02 * grow, 0.026))], { r: 0.006 });
        }
        // he lets go: what hung from his hand falls and lies where it fell
        const fallen = join(lay([P("work", 0.43, 0, -1.37), P("work", 0.35, 0, -1.3), P("work", 0.31, 0, -1.335), F0], FLAT, { wander: 0.025, seed: 5 }), floorRun);
        const dk = (f - letGo) / 8;
        w.props.thread("end", dk <= 0 ? join(fromHand, floorRun) : blend(join(fromHand, floorRun), fallen, Math.min(1, dk * dk), 28), TH);
      }
    }
    // ---------------------------------------------------------------------------------------------- the three candidates
    // in through the glass to his fist, taut; each snaps on its swipe: the far half whips back out, his half falls limp
    const fistNow = fistAt(f);
    FAR.forEach((far, i) => {
      const on = ons[i];
      if (f < on) return;
      const hand = h0.clone().add(V(0, 0.018, 0));
      if (f < hits[i]) { w.props.thread(`c${i}`, part(taut(far, hand, f, [on + 8], { sag: 0.04, n: 12 }), smooth((f - on) / 8)), { r: 0.007, glow: 0.5 }); return; }
      const d = f - hits[i], brk = hand.clone().lerp(far, BRK[i]);
      // his half: limp from the fist; the three ends hang a little apart (each leaves the fist at its own place) and sway on their own
      const fan = (i - 1) * (0.5 + 0.5 * smooth(d / 14)), sway = 0.012 * Math.sin(f * 0.11 + i * 2.1);
      const mine = limp(hand, brk, d, FLAT, { n: 14, trail: (u) => fistAt(f - 2 - 5 * u).sub(fistNow) });
      w.props.thread(`c${i}`, mine.map((q, j) => { const u = j / 14; return q.add(V((0.012 + 0.034 * u) * fan + sway * u * u, 0, 0.004 * fan)); }), { r: 0.007 });
      // the candidate's half: back out through the glass
      const back = retract(far, brk, d, { over: 11, whip: 0.07 });
      if (back.length) w.props.thread(`c${i}far`, back, { r: 0.007, glow: 0.5 * (1 - d / 11) });
      // the snap itself: a few short flecks of thread fly from the break
      if (d < 4) for (let j = 0; j < 5; j++) { const a = j * 1.257 + i, dir = V(Math.cos(a), Math.sin(a) * 0.8 + 0.2, 0.2 * Math.sin(a * 2)), p0 = brk.clone().addScaledVector(dir, 0.02 + 0.035 * d); w.props.thread(`c${i}k${j}`, [p0, p0.clone().addScaledVector(dir, 0.035 - 0.006 * d)], { r: 0.005, glow: 0.9 - 0.2 * d }); }
    });
    // ---------------------------------------------------------------------------------------------- over the picture
    const FX: Fx[] = [
      sideCard(f, { from: S.from + 24, to: e01 + 30, name: "林小满", note: "30 岁 · 程序员 · 今天也加班", face: VERBS.headPx(w, xm), at: { x: 116, y: 486 } }),
      snaps(f, { from: hits[0] - 2, to: one - 6, x: 755, y: 440, hits }),
      stamp(f, { from: wordAt("E06", "未到") + 8, to: S.to - 2, x: 366, y: 560 }),
    ];
    const cover = ky(f, [[S.from, 1], [S.from + 3, 0.85], [S.from + 13, 0]]);
    return { camera, overlays: [draw(f, FX), spoolLens(cover)], shown: FX, post: { bloom: 0.4 } };
  },
};
