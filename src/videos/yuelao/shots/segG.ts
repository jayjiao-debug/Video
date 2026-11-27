// SCENE G · 22:00, the pavement under her tower. HE HAS LOST THE THREAD. His palm comes off her lens: night; he is
// patting himself down, and all the while the thread is right in front of us, wound round her lens. He sees it, creeps
// up on tiptoe (别动别动) until his face fills the frame, picks the strands off one by one, and backs away with a
// hopeless knot in his hands. Behind his back the delivery rider trots up the steps and calls; she comes out; 「又是你
// 啊」. He sees none of it: he has trudged to the lowest step and sat down with his knot. One 时辰 left. 完了: he drops
// the knot on the step beside him (ON a faded old thread nobody has noticed) and she lifts her lens to the moon.
// CAMERA PLAN (her eyes, one take; 14.7 s, seven moves, each with its reason):
//   线呢        LOOK AT him searching, the strands on the lens     medium close, a little from above       still (his palm leaves the lens: the join from F)
//   别动别动    his face coming up to the lens                    EXTREME close (the scene's one)         she only keeps him in frame: he does the moving
//   the knot    the knot in his hands, his face falling           medium close                            still: he backs away
//   外卖        the rider at the door; him walking off            WIDE, two levels: the door above,       a tilt up and a zoom out: someone arrives
//                                                                 the step below
//   又是你啊    her half-smile, his shy grin                      medium two-shot (snap zoom, 38% tighter) lands on 又; holds
//   一个时辰    him small on the step, the rider lingering above  the WIDE again                          back: the speaker changes
//   完了        him and the knot he drops                         medium (slow push, 3 s)                 the thought lands
//   the moon    the moon over the podium roof                     the sky                                 she looks at the night's clock: the join to H
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { zoomBy, palm } from "../cam";
import { P, startOf, endOf, wordAt, ky, rel, V, smooth, walkAlong, hang, win, shotCam, through, turnTo, kick, VERBS, type ShotKey } from "./kit";
import { act, YL, XM, QS, type MoodKey } from "./act";
import { lensThreads } from "./fx";
import { CAMN, STAND_AT, stepSeat, STEP, DOOR_HER, DOOR_RIDER, WAY_OUT, RIDER_UP, COIL_AT, oldLine } from "./night";
import { MOON_LOCAL } from "../sets/street";

const S = seg("G"), HALF = Math.PI / 2;
/** where he searches (1.5 m from her lens), where his face fills it (0.85 m), where he backs to with the knot */
const Z0 = P("street", -0.3, 0, 0.9), Z1 = P("street", -0.3, 0, 1.55), Z2 = P("street", -0.3, 0, 1.0);
const CREEP = 0.75, BACKING = 0.9, TRUDGE = 1.7, TROT = 2.3, STROLL = 1.6, HER_PACE = 1.3;
const AWAY = [Z2, STAND_AT], AWAY_YAW = Math.atan2(STAND_AT.x - Z2.x, STAND_AT.z - Z2.z);
/** her way back in: through the door and on across the lobby to the lifts (she is never switched off behind the glass) */
const RIDER_LEN = VERBS.walkTime(RIDER_UP, 1), RIDER_DOWN = [...RIDER_UP].reverse(), WAY_IN = [...WAY_OUT].reverse().concat([P("street", -0.55, 0.51, -6.2), P("street", -0.7, 0.51, -8.35)]);   // past the plant (x -1.9..-1.1, z -7.5) to the left lift
const DOWN_YAW = Math.atan2(RIDER_DOWN[1].x - RIDER_DOWN[0].x, RIDER_DOWN[1].z - RIDER_DOWN[0].z);
/** where the bag changes hands, between the two of them */
const HAND_PT = P("street", 0.09, 0.51 + 0.84, -3.14);
/** the rider's walked way from the kerb to where he is (d m along RIDER_UP): the old thread trails behind his ankle */
const trail = (d: number): THREE.Vector3[] => { const out: THREE.Vector3[] = []; for (let s = 0; s < d; s += 0.3) out.push(walkAlong(RIDER_UP, 1, s).at); out.push(walkAlong(RIDER_UP, 1, d).at); return out; };

export const SEG: Segment = {
  id: "G", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    const g01 = startOf("G01"), mine = wordAt("G01", "我"), x01 = endOf("G01"), g02 = startOf("G02"), wound = wordAt("G02", "缠"), x02 = endOf("G02");
    const g03 = startOf("G03"), x03 = endOf("G03"), g04 = startOf("G04"), again = wordAt("G04", "又"), x04 = endOf("G04"), g05 = startOf("G05"), over = wordAt("G05", "完"), x05 = endOf("G05");
    // the business: the creep; four strands; backing off with the knot; the trudge to the step; sitting down; the drop
    const creep0 = g02 + 2, creep1 = creep0 + Math.ceil(VERBS.walkTime([Z0, Z1], CREEP) * 30), pulls = [wound + 28, wound + 17, wound + 6, x02 + 1];
    const back0 = x02 + 6, back1 = back0 + Math.ceil(VERBS.walkTime([Z1, Z2], BACKING) * 30), walk0 = back1 + 4, arrive = walk0 + Math.ceil(VERBS.walkTime(AWAY, TRUDGE) * 30), sit0 = arrive + 8, sat = sit0 + 15;
    const tug = g05 + 62, drop0 = over + 4, fell = drop0 + 10, up0 = x05 + 5;
    // the delivery: the rider's trot up, the door, her way out, the bag, her way in, his way down
    const rgo = g03 - 37, rtop = rgo + Math.ceil((RIDER_LEN / TROT) * 30), out0 = g03 + 12, out1 = out0 + Math.ceil(VERBS.walkTime(WAY_OUT, HER_PACE) * 30), take = g04 + 6;
    const in0 = x04 + 10, down0 = x04 + 62;
    // the glass door is locked at night: it slides open for her as she comes up to it from inside, and shuts behind her
    const doorK = ky(f, [[out0 + 8, 0], [out0 + 22, 1], [in0 + 24, 1], [in0 + 38, 0]]);
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", doorK); w.set.param("lit", 0.5); w.set.param("moon", 0.3);
    const t = f / 30;
    // ---------------------------------------------------------------------------------------------- the camera
    const CLOSE = { pos: CAMN, at: [-0.3, 1.19, 0.9], sx: 540, sy: 890, fov: 56 }, ECU = { pos: CAMN, at: [-0.3, 1.24, 1.55], sx: 540, sy: 900, fov: 56 }, KNOT = { pos: CAMN, at: [-0.3, 1.165, 1.0], sx: 540, sy: 820, fov: 56 };
    const WIDE = { pos: CAMN, at: [0.08, 1.7, -3.2], sx: 690, sy: 561, fov: 46 }, PAIR = { pos: CAMN, at: [0.08, 1.62, -3.2], sx: 540, sy: 700, fov: zoomBy(46, 0.62) };
    const HIM = { pos: CAMN, at: [-0.85, 0.8, -2.18], sx: 470, sy: 800, fov: 28 }, MOON = { pos: CAMN, at: MOON_LOCAL, sx: 540, sy: 760, fov: 34 };
    const keys: ShotKey[] = [
      { f: S.from, ...CLOSE }, { f: creep0, ...CLOSE }, { f: creep1, ...ECU }, { f: back0, ...ECU }, { f: back1, ...KNOT },
      { f: g03 - 7, ...KNOT }, { f: g03 + 9, ...WIDE }, { f: again - 5, ...WIDE }, { f: again, ...PAIR }, { f: x04 + 2, ...PAIR }, { f: g05 + 6, ...WIDE },
      { f: g05 + 46, ...WIDE }, { f: over + 2, ...HIM }, { f: up0, ...HIM }, { f: S.to - 5, ...MOON }, { f: S.to, ...MOON },
    ];
    let camera = shotCam("street", f, keys, { mood: "calm", amp: 0.5 });
    for (const on of pulls) camera = kick(camera, f, on + 1, 0.012);
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    const creep = walkAlong([Z0, Z1], CREEP, (f - creep0) / 30, { endFacing: 0 });
    // backing away = the same walk played backwards (he keeps facing her)
    const backT = VERBS.walkTime([Z1, Z2], BACKING), backing = walkAlong([Z2, Z1], BACKING, backT - (f - back0) / 30, { startFacing: 0 });
    const away = walkAlong(AWAY, TRUDGE, (f - walk0) / 30);
    const tip = 0.05 * win(f, creep0 + 6, back0 + 8, 10, 8);
    const sitK = 1 - smooth((f - sit0) / 15), seated = f >= sit0;
    let at: THREE.Vector3, facing = 0, pose = undefined as ReturnType<typeof walkAlong>["pose"] | undefined;
    if (f < creep0) { at = Z0; facing = ky(f, [[S.from, -0.5], [g01 - 4, -0.5], [g01 + 6, 0.55], [mine - 7, 0.55], [mine + 1, 0]]); }
    else if (f < back0) { at = creep.at; if (creep.moving) pose = creep.pose; }
    else if (f < walk0 - 4) { at = backing.at; if (f < back1) pose = backing.pose; }
    else if (f < arrive) { at = f < walk0 ? Z2 : away.at; facing = turnTo(0, f < walk0 ? AWAY_YAW : away.facing, smooth((f - (walk0 - 4)) / 9)); if (away.moving) pose = away.pose; }
    else { at = STAND_AT; facing = turnTo(AWAY_YAW, 0, smooth((f - arrive) / 8)); }
    at = at.clone().add(V(0, tip, 0));
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z), SH = (dx: number, y: number, z: number) => rel(STEP.top.clone().setY(0), 0, dx, y, z);
    // his hands: patting himself down; empty (我的线呢！); at the lens, one at each lower corner of the picture: each pull is
    // a reach in and up, then a jerk down and out; then together round the knot; on his knees
    const pat = Math.sin(f * 0.85), patR = H(-0.12, 0.8 + 0.07 * pat, 0.2), patL = H(0.12, 0.74 - 0.07 * pat, 0.205), sh = 0.012 * Math.sin(f * 1.5) * (f < x01 + 2 ? 1 : 0);
    // each pull: that hand goes up and out of the picture on its own side, to the lens (there it is the big soft mitten
    // of the lens overlay, which pinches the strand and takes it off), and comes back with what it pulled
    const awayOf = (i: number) => win(f, pulls[i] - 10, pulls[i] + 9, 5, 5), aR = Math.max(awayOf(1), awayOf(3)), aL = Math.max(awayOf(2), awayOf(0));
    const lensR = H(-0.13, 1.1, 0.3).lerp(H(-0.44, 1.2, 0.3), aR), lensL = H(0.13, 1.1, 0.3).lerp(H(0.44, 1.2, 0.3), aL);
    const fid = 0.012 * Math.sin(f * 0.55), lapR = SH(-0.07 - fid, 0.44 + 0.006 * Math.sin(f * 0.8), 0.27), lapL = SH(0.07 + fid * 0.6, 0.44 - 0.006 * Math.sin(f * 0.8), 0.27);
    const strainK = win(f, tug, tug + 22, 4, 5), dropK = smooth((f - drop0) / 7);
    let hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined;
    if (f < mine - 5) hands = [patR, patL];
    else if (f < creep0) hands = [through(f, [[mine - 5, patR], [mine + 1, H(-0.3, 0.7 + sh, 0.16)]]), through(f, [[mine - 5, patL], [mine + 1, H(0.3, 0.7 - sh, 0.16)]])];
    else if (f < back0 - 2) hands = [through(f, [[creep0, H(-0.3, 0.7, 0.16)], [creep0 + 9, H(-0.17, 0.95, 0.27)], [wound - 6, lensR]]), through(f, [[creep0, H(0.3, 0.7, 0.16)], [creep0 + 9, H(0.17, 0.95, 0.27)], [wound - 6, lensL]])];
    else if (!seated) { const y = ky(f, [[back0 + 5, 0.93], [walk0 - 4, 0.93], [walk0 + 6, 0.8]]), z = ky(f, [[walk0 - 4, 0.34], [walk0 + 6, 0.3]]); hands = [through(f, [[back0 - 2, lensR], [back0 + 4, H(-0.075, y, z)]]), through(f, [[back0 - 2, lensL], [back0 + 4, H(0.075, y, z)]])]; }
    else {
      const R0 = H(-0.075, 0.8, 0.3).lerp(lapR, 1 - sitK), L0 = H(0.075, 0.8, 0.3).lerp(lapL, 1 - sitK);
      hands = [R0.add(V(-0.03 * strainK, 0, 0)).lerp(SH(-0.13, 0.4, 0.25), dropK), L0.add(V(0.03 * strainK, 0, 0)).lerp(f < fell ? SH(0.4, 0.35, 0.0) : SH(0.13, 0.4, 0.25), f < fell ? dropK : 1)];
      if (f >= fell) hands[1] = SH(0.4, 0.35, 0.0).lerp(SH(0.13, 0.4, 0.25), smooth((f - fell) / 10));
    }
    const faces: MoodKey[] = [
      [S.from, "panic"], [mine - 1, "dread", "take", 0.7], [x01 + 3, "suspicious", "take", 0.8], [g02 + 7, "intent"], [x02 + 3, "look"], [back0 + 11, "small", "sink"],
      [sat + 4, "sag"], [g05 - 3, "worry"], [g05 + 50, "sag"], [tug + 2, "strain"], [over - 3, "gloom", "sink"], [up0 + 2, "lost"],
    ];
    // his eyes: on each strand as he pulls it; up over his shoulder at the moon for the hour; at the sky at the end
    const pk = (i: number) => win(f, pulls[i] - 9, pulls[i] + 5, 4, 4), moonK = win(f, g05 - 2, g05 + 44, 8, 10), skyK = smooth((f - up0) / 8);
    const picking = f >= wound - 6 && f < back0;
    const gaze = f < x01 + 1 ? undefined : f < wound - 6 ? 0 : picking ? (pk(2) > 0.5 ? 1 : pk(3) > 0.5 ? -1 : 0) : seated ? (moonK > 0.4 ? -1 : 0) : 0;
    const turned = f >= walk0 - 4 && f < arrive + 8;
    const lookDown = f < mine - 4 ? 12 : f < creep0 ? -4 : f < back0 ? -12 * smooth((f - creep0) / 20) + 16 * pk(1) - 7 * pk(0) - 4 * pk(3) : !seated ? (turned ? 5 : 15) : 16 * (1 - moonK) * (1 - skyK) - 16 * moonK - 12 * skyK;
    const slump = ky(f, [[back0 + 8, 0], [back0 + 18, 1], [over - 2, 1], [over + 8, 1.7]]);
    const r = act(w, f, YL, {
      at, facing, faces, pose, hands, gaze, talkGaze: 0, lookDown, turn: f < creep0 || turned ? 1 : undefined,
      seat: seated ? stepSeat(sitK) : undefined, rise: seated ? sitK : undefined,
      twist: seated ? -0.75 * moonK : undefined,
      lean: { pitch: (turned ? 2 : 5) * slump }, head: { dy: -0.025 * slump, tilt: 7 * moonK },
    });
    // ---------------------------------------------------------------------------------------------- the rider
    const up = walkAlong(RIDER_UP, TROT, (f - rgo) / 30), dn = walkAlong(RIDER_DOWN, STROLL, (f - down0) / 30, { endFacing: -1.2 }), going = f >= down0;
    const legR = going ? dn : up, rAt = legR.at, toHer = ky(f, [[out0 + 14, 0], [out0 + 26, 1], [in0 + 4, 1], [in0 + 16, 0]]);
    const rFace = legR.moving ? legR.facing : going ? dn.facing : turnTo(turnTo(turnTo(up.facing, 2.75, smooth((f - rtop) / 6)), -HALF, toHer), DOWN_YAW, smooth((f - (down0 - 7)) / 7));
    const RH = (dx: number, y: number, z: number) => rel(rAt, rFace, dx, y, z);
    const giveK = ky(f, [[out1 - 8, 0], [out1 + 4, 1], [take + 2, 1], [take + 12, 0]]), shyK = ky(f, [[again + 8, 0], [again + 16, 1], [x04 + 34, 1], [x04 + 44, 0]]), callK = ky(f, [[rtop - 2, 0], [rtop + 6, 1]]) * (1 - giveK);
    const carry = RH(0.2, 0.66, 0.06), rHandL = f < take + 2 ? carry.clone().lerp(RH(0.17, 0.86, 0.26), callK).lerp(HAND_PT.clone().add(V(0.035, 0, 0.02)), giveK)
      : HAND_PT.clone().add(V(0.035, 0, 0.02)).lerp(hang(rAt, rFace, 1), smooth((f - take - 2) / 10)).lerp(RH(0.1, 1.1 + 0.012 * Math.sin(f * 0.9), -0.3), shyK);
    const rd = act(w, f, QS, {
      at: rAt, facing: rFace, pose: legR.moving ? legR.pose : undefined, hands: going && !legR.moving ? undefined : [null, f >= take + 14 && shyK < 0.01 ? null : rHandL],
      faces: [[S.from, "smile"], [g03 - 3, "beam"], [x03 + 6, "smile"], [again + 9, "shy", "take", 0.5], [x04 + 40, "tender"], [down0 + 6, "smile"]],
      talkGaze: 0, gaze: toHer > 0.5 ? -1 : undefined, turn: going ? (legR.moving ? 1 : undefined) : f < rtop ? (legR.moving ? 1 : undefined) : 1 - 0.45 * toHer,
      head: { tilt: 3 * shyK }, lookDown: 4 * shyK,
    });
    // ---------------------------------------------------------------------------------------------- 林小满
    // she is in the lobby the whole scene: waiting inside the glass on her phone (her delivery is on its way), out for
    // the bag, and back across the lobby to the lifts
    const waiting = f < out0 - 5;
    let xm = null as ReturnType<typeof act> | null;
    {
      const legX = f < in0 ? walkAlong(WAY_OUT, HER_PACE, (f - out0) / 30, { startFacing: 0.5 }) : walkAlong(WAY_IN, HER_PACE, (f - in0) / 30);
      const xAt = legX.at, xFace = legX.moving || f >= in0 ? legX.facing : turnTo(turnTo(legX.facing, HALF, smooth((f - out1) / 7)), Math.PI, smooth((f - (in0 - 7)) / 7));
      const reach = ky(f, [[take - 9, 0], [take, 1], [take + 4, 1], [take + 16, 0]]), XH = (dx: number, y: number, z: number) => rel(xAt, xFace, dx, y, z);
      const hold = XH(-0.2, 0.66, 0.06), hr = hang(xAt, xFace, 0).lerp(hold, smooth((f - take) / 12)).lerp(HAND_PT.clone().add(V(-0.035, 0, 0.02)), reach);
      xm = act(w, f, XM, {
        at: xAt, facing: xFace, pose: legX.moving ? legX.pose : waiting ? { kind: "phone", t, amount: 0.34, arm: 1 } : undefined, show: waiting ? ["phone"] : undefined, hands: f >= take - 9 ? [hr, null] : undefined,
        faces: [[S.from, "tired"], [g03 + 4, "look", "take", 0.4], [out0 + 6, "tired"], [g04 - 2, "polite"], [again - 1, "look", "take", 0.4], [again + 14, "smile"], [in0 + 2, "smile"]],
        talkGaze: 0, gaze: f >= out1 && f < in0 ? 1 : undefined, lookDown: 8 * win(f, take - 8, again - 4, 5, 5) + (waiting ? 7 : 0), turn: f >= in0 - 7 ? Math.min(1, 0.55 + 0.45 * smooth((f - (in0 - 7)) / 7)) : f >= out1 ? 0.55 * smooth((f - out1) / 7) : undefined,
        head: { tilt: -2 * win(f, again, x04 + 6, 5, 6) },
      });
    }
    w.update();
    // ---------------------------------------------------------------------------------------------- the bag
    if (f < take + 2) w.prop("bag", "order").put(rd.handWorld(1).add(V(0, -0.27, 0)), { yaw: rFace });
    else if (xm) w.prop("bag", "order").put(xm.handWorld(0).add(V(0, -0.27, 0)), { yaw: HALF });
    // ---------------------------------------------------------------------------------------------- the knot
    // what each hand has pulled off so far: a wad of thread in it (it grows with the second strand); as he backs away
    // the two hands come together and it is one knot
    if (f < back0 + 3) {
      const wadL = f >= pulls[2] + 7 ? (f >= pulls[0] + 7 ? 0.46 : 0.32) : 0, wadR = f >= pulls[1] + 7 ? (f >= pulls[3] + 7 ? 0.46 : 0.32) : 0;
      if (wadL) w.prop("tangle", "wadL").put(r.handWorld(1).add(V(0.01, -0.04, 0.02)), { yaw: 0.6, scale: wadL });
      if (wadR) w.prop("tangle", "wadR").put(r.handWorld(0).add(V(-0.01, -0.04, 0.02)), { yaw: 2.1, scale: wadR });
    }
    if (f >= back0 + 3) {
      const mid = r.handWorld(0).add(r.handWorld(1)).multiplyScalar(0.5).add(V(0, -0.05, 0)), left = r.handWorld(1).add(V(0, -0.075, 0));
      const fall = smooth((f - (drop0 + 6)) / 4), bounce = 0.02 * Math.max(0, Math.sin(((f - fell) / 7) * Math.PI)) * (f >= fell && f < fell + 7 ? 1 : 0);
      const knot = f < drop0 ? mid : mid.lerp(left, dropK).lerp(COIL_AT, fall).add(V(0, bounce, 0));
      w.prop("tangle", "his").put(knot, { yaw: 0.6 + (f < drop0 ? 0.25 * Math.sin(f * 0.3) * (seated ? 1 : 0) : 0.9 * fall), scale: ky(f, [[back0 + 3, 0.72], [back0 + 8, 1]]) });
    }
    // ---------------------------------------------------------------------------------------------- the old thread
    const herOut = xm && xm.group.position.z > -3.55 ? xm.footWorld(0) : undefined;
    const dNow = going ? Math.max(0, RIDER_LEN - STROLL * Math.max(0, (f - down0) / 30)) : Math.min(RIDER_LEN, TROT * Math.max(0, (f - rgo) / 30));
    oldLine(w, 0, { her: herOut, his: dNow > 0.05 ? [...trail(dNow).slice(0, -1), rd.footWorld(1)] : undefined });
    // ---------------------------------------------------------------------------------------------- over the picture
    const on = pulls.map((p) => 1 - smooth((f - p) / 6)), cover = 1 - smooth((f - (S.from + 3)) / 9);
    return { camera, overlays: [f < back0 + 8 ? lensThreads(on, f, pulls) : null, palm(cover)], shown: [], post: { bloom: 0.45 } };
  },
};
