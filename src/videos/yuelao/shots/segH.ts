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
import { STEP, COIL_AT, oldLine } from "./night";

const S = seg("H");
/** she sits on the same step, a little way off: the camera at his head's height */
export const CAM_H: [number, number, number] = [0.45, 0.78, -1.15];
export const HEAD_H: [number, number, number] = [-0.85, 0.8, -2.16];
/** the framing the scene ends on (scene I starts from it) */
export const END_H = { pos: CAM_H, at: HEAD_H, sx: 560, sy: 790, fov: 62 };

export const SEG: Segment = {
  id: "H", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("street"); w.set.param("time", "night"); w.set.param("door", 0); w.set.param("lit", 0.35); w.set.param("moon", 0.6);
    const h01 = startOf("H01"), h02 = startOf("H02"), x02 = endOf("H02"), h03 = startOf("H03"), plan = wordAt("H03", "想着"), tie = wordAt("H03", "绑"), x03 = endOf("H03");
    const h04 = startOf("H04"), years = wordAt("H04", "一千"), x04 = endOf("H04"), h05 = startOf("H05"), fate = wordAt("H05", "缘分"), x05 = endOf("H05");
    // ---------------------------------------------------------------------------------------------- the camera
    const keys: ShotKey[] = [
      { f: S.from, pos: CAM_H, at: HEAD_H, sx: 540, sy: 760, fov: 78 }, { f: h01 + 12, pos: CAM_H, at: HEAD_H, sx: 540, sy: 760, fov: 78 },
      { f: h03 - 4, ...END_H }, { f: S.to, ...END_H },
    ];
    const camera = shotCam("street", f, keys, { mood: "calm", amp: 0.22 });
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    // his upper body: turned a little her way; to her for 我？; away into the night for the telling; to her for 也记
    // (the rig draws a face only within about 45 degrees of the lens: his head never turns further from her than that)
    const twist = ky(f, [[S.from, 0.35], [h02 - 16, 0.35], [h02 - 4, 0.85], [x02 + 16, 0.85], [h03 - 6, 0.3], [h05 - 14, 0.3], [h05 - 2, 0.85], [x05 + 14, 0.85], [x05 + 30, 0.35]]);
    const toHer = smooth((twist - 0.4) / 0.4), away = f >= h03 - 6 && f < h05 - 14;
    const lookDown = ky(f, [[S.from, 15], [h01 + 26, 15], [h02 - 6, 2], [x02 + 12, 2], [h03 - 2, -7], [plan - 6, -7], [plan + 10, 0], [tie - 12, 6], [x03 + 8, 4], [h04 - 4, 10], [years, 14], [x04 + 14, 14], [h05 - 6, 2], [x05 + 12, 2], [x05 + 30, 13]]);
    const SH = (dx: number, y: number, z: number) => rel(STEP.top.clone().setY(0), 0, dx, y, z);
    // 就给自己绑一根: his near hand lifts off his knee, thumb and finger turn a small loop in the air, and it sinks back
    const tieK = win(f, tie - 22, tie + 26, 12, 16), loop = f * 0.5;
    const kneeR = SH(-0.1, 0.42, 0.26), kneeL = SH(0.1, 0.42, 0.26), tying = SH(0.15 + 0.024 * Math.cos(loop), 0.68 + 0.024 * Math.sin(loop), 0.3);
    const sink = ky(f, [[h04 - 4, 0], [years + 10, 1], [h05 - 10, 1], [h05, 0.4]]);
    const faces: MoodKey[] = [
      [S.from, "sag"], [h01 + 24, "lost"], [h02 - 5, "look", "take", 0.5], [h03 - 6, "quiet"], [plan - 2, "wry"], [x03 + 8, "quiet"], [years - 2, "sag", "sink"], [h05 - 5, "wry"], [x05 + 16, "quiet"],
    ];
    act(w, f, YL, {
      at: STEP.top.clone().setY(0), facing: 0, seat: STEP, faces, turn: 1, twist, lookDown, still: true,
      gaze: toHer > 0.5 ? 0 : away ? -1 : -0.5, talkGaze: toHer > 0.5 ? 0 : away ? -1 : -0.5, hands: [kneeR, kneeL.clone().lerp(tying, tieK)],
      lean: { pitch: 5 + 4 * sink }, head: { dy: -0.02 - 0.02 * sink },
    });
    w.update();
    // the knot where he dropped it, on the old thread nobody has noticed
    w.prop("tangle", "his").put(COIL_AT, { yaw: 1.5 });
    oldLine(w, 0);
    void THREE; void V; void fate;
    return { camera, shown: [], post: { bloom: 0.35 } };
  },
};
