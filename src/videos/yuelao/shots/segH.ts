// SCENE H · 22:40, the same step. THE QUIET SCENE: no effects, no meter, no stamp, one slow move. From the moon we
// cut to his round white head (the match): forty minutes later she has sat down on the step a little way off, her
// camera level with him and a little in front, the dim shop window behind his head. She asks about his own thread. He meant to tie one for
// himself once this busy spell was over; the busy spell has lasted twelve hundred years. File his as 缘分未到 too.
// What plays: his head turning to her and away, his eyes, a small tying gesture that comes to nothing.
// CAMERA PLAN (her eyes, one take; 22 s, ONE move):
//   open        LOOK AT his round head where the moon was        medium wide, level, from his left        still (the match cut from G)
//   那您自己呢  him taking the question                          the same, slowly tighter                 ONE slow push (5 s), done before he tells it
//   当年…一千二百年 / 也记  his face                              medium close                             still to the end
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { startOf, endOf, wordAt, ky, rel, V, smooth, win, shotCam, type ShotKey } from "./kit";
import { act, YL, type MoodKey } from "./act";
import { STEP, COIL_AT, oldLine, cushion } from "./night";

const S = seg("H");
/** she sits on the same step, a little way off: the camera at his head's height */
export const CAM_H: [number, number, number] = [0.45, 0.85, -1.15];   // (v6: his seat is 6 cm higher, on his cushion)
export const HEAD_H: [number, number, number] = [-0.85, 0.87, -2.09];
/** the framing the scene ends on (scene I starts from it) */
export const END_H = { pos: CAM_H, at: HEAD_H, sx: 560, sy: 735, fov: 62 };   // (a little higher in the frame than at first: the shop's neon sign stays clear above the REC display)

export const SEG: Segment = {
  id: "H", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", 0); w.set.param("lit", 0.35); w.set.param("moon", 0.6);
    const h01 = startOf("H01"), h02 = startOf("H02"), x02 = endOf("H02"), h03 = startOf("H03"), plan = wordAt("H03", "想着"), tie = wordAt("H03", "绑"), x03 = endOf("H03");
    const h04 = startOf("H04"), years = wordAt("H04", "一千"), x04 = endOf("H04"), h05 = startOf("H05"), fate = wordAt("H05", "缘分"), x05 = endOf("H05");
    // ---------------------------------------------------------------------------------------------- the camera
    const keys: ShotKey[] = [
      { f: S.from, pos: CAM_H, at: HEAD_H, sx: 540, sy: 700, fov: 78 }, { f: h01 + 12, pos: CAM_H, at: HEAD_H, sx: 540, sy: 700, fov: 78 },   // (his head lands where scene G's moon was: MOON in segG)
      { f: h03 - 4, ...END_H }, { f: S.to, ...END_H },
    ];
    const camera = shotCam("street", f, keys, { mood: "calm", amp: 0.22 });
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    // his upper body: turned a little her way; to her for 我？; away into the night for the telling; to her for 也记
    // (the rig draws a face only within about 45 degrees of the lens: his head never turns further from her than that)
    // Every turn is slow (two thirds of a second) and led by the head: the eyes and the face go first, the shoulders
    // follow five frames later. The gaze is a smooth value, never a step: a stepped gaze threw his whole head round in
    // one frame.
    const TW: [number, number][] = [[S.from, 0.35], [h02 - 22, 0.35], [h02 - 3, 0.85], [x02 + 10, 0.85], [h03 - 2, 0.3], [h05 - 20, 0.3], [h05 - 1, 0.85], [x05 + 12, 0.85], [x05 + 34, 0.35]];
    const twist = ky(f, TW), toHer = smooth((ky(f + 5, TW) - 0.4) / 0.4), awayK = win(f + 5, h03 - 12, h05 - 10, 16, 16);
    const eyes = -(0.5 + 0.5 * awayK) * (1 - toHer);
    const lookDown = ky(f, [[S.from, 15], [h01 + 26, 15], [h02 - 6, 2], [x02 + 12, 2], [h03 - 2, -7], [plan - 6, -7], [plan + 10, 0], [tie - 12, 6], [x03 + 8, 4], [h04 - 4, 10], [years, 14], [x04 + 14, 14], [h05 - 6, 2], [x05 + 12, 2], [x05 + 30, 13]]);
    const SH = (dx: number, y: number, z: number) => rel(STEP.top.clone().setY(0), 0, dx, y, z);
    // 就给自己绑一根: both mittens lift a hand's breadth off his knees, close together over his lap, and wind round each
    // other the way he ties every couple's knot; they pull it tight... on nothing, and the pull ends with a mitten over
    // each knee. A beat with the empty hands apart, then they sink back onto his knees. (A mime with no thread: there is
    // no thread for him.) The knot is tied low, over the knees and clear of the beard: tied out in front of the beard
    // (0.6 high, 0.4 out) the arms went straight through it. armFront for the beard's tip.
    const kneeR = SH(-0.1, 0.42, 0.26), kneeL = SH(0.1, 0.42, 0.26), TC = SH(0.08, 0.48, 0.32);
    const tieK = win(f, tie - 24, tie + 40, 12, 18), windK = smooth((f - (tie - 12)) / 20), pullK = smooth((f - (tie + 8)) / 4);
    // He sits side-on to her, so the winding turns in his up-and-forward plane (the one she sees): the two mittens circle
    // round each other there, half a turn apart, over his near (left) knee, so the near arm never crosses the beard. The
    // pull is cheated toward her too: the left mitten goes out in front and up, the right one only drops a little (back
    // toward him it went into the beard).
    const th = windK * Math.PI * 5, wob = 1 - pullK;
    const mime = (side: number) => {
      const a = th + (side > 0 ? Math.PI : 0), r = 0.045 * wob;
      return TC.clone().add(side > 0 ? rel(V(0, 0, 0), 0, 0.03 + 0.06 * pullK, r * Math.sin(a) + 0.02 * pullK, r * Math.cos(a) + 0.1 * pullK)
        : rel(V(0, 0, 0), 0, -0.03, r * Math.sin(a) - 0.02 * pullK, r * Math.cos(a)));
    };
    const tying = (side: number, knee: THREE.Vector3) => knee.clone().lerp(mime(side), tieK);
    const sink = ky(f, [[h04 - 4, 0], [years + 10, 1], [h05 - 10, 1], [h05, 0.4]]);
    const faces: MoodKey[] = [
      [S.from, "sag"], [h01 + 24, "lost"], [h02 - 5, "look", "take", 0.5], [h03 - 6, "quiet"], [plan - 2, "wry"], [tie - 8, "hope"], [tie + 13, "quiet"], [years - 2, "sag", "sink"], [h05 - 5, "wry"], [x05 + 16, "quiet"],
    ];
    act(w, f, YL, {
      at: STEP.top.clone().setY(0), facing: 0, seat: STEP, faces, turn: 1, twist, lookDown, still: true,
      gaze: eyes, talkGaze: eyes, hands: tieK > 0.001 ? [tying(-1, kneeR), tying(1, kneeL)] : [kneeR, kneeL], armFront: tieK > 0.3 ? [true, true] : undefined,
      lean: { pitch: 5 + 4 * sink }, head: { dy: -0.02 - 0.02 * sink },
    });
    w.update();
    // the knot where he dropped it, on the old thread nobody has noticed
    w.prop("tangle", "his").put(COIL_AT.clone().add(V(0, 0.018, 0)), { yaw: 1.5 });   // (its ball is 7 cm round: it lies on the tread, not in it)
    cushion(w, 1);
    oldLine(w, 0);
    void THREE; void V; void fate;
    return { camera, shown: [], post: { bloom: 0.35 } };
  },
};
