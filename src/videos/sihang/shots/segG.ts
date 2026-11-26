// SCENE G · 30 Oct, night. The heaviest shelling: a shell has opened the west wall, and 老班长 has a machine gun in the
// hole already ("鬼子给开的窗。"). 满仓 shouts over it: one more line for the letter (等打完仗，我回去割稻). Then a
// runner: the whole battalion is to withdraw into the Settlement. "不是讲共存亡吗？" "是命令。"
// CAMERA:
//   1  pre      the shell hole: fire light outside, a flash and a jolt a second (the fact card says so); 老班长's back
//   2  G01      in on him as he half turns: the dry line; the 真事 seal
//   3  G02-G04  round to 满仓 against the wall, shouting, bright; the letter comes up and takes its last two columns
//   4  after    a close one: dust, a big jolt; he ducks, grins
//   5  G05      a whip east: the runner coming in at a run; the order
//   6  G06      back to 满仓: the grin gone
//   7  G07      to 老班长, his hand off the gun: "是命令。" A long hold; the shelling has stopped; a dip
import { seg, type Segment } from "../story";
import { povCam } from "../cam";
import { MANCANG_RIFLE, LAO, RUNNER, MEN } from "../people";
import { P, ck, put, startOf, screenOf, endOf, ky, h, frag, win, hit, shake, hang, walkAlong } from "./kit";
import { Fact, Letter, Black, type LetterCol } from "../hud/skin";
import { letterCols as colsE } from "./segE";

const S = seg("G");
export const letterCols = (): LetterCol[] => {
  const a = screenOf("G04", 0), b = screenOf("G04", 1), e = endOf("G04");
  return [...colsE(), { text: "等打完仗，", from: a + 12, to: b + 6 }, { text: "我回去割稻。", from: b + 12, to: e + 22 }];
};
export const SEG: Segment = {
  id: "G", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("hall");
    const g01 = startOf("G01"), e01 = endOf("G01"), g02 = startOf("G02"), g04 = startOf("G04"), e04 = endOf("G04"), g05 = startOf("G05"), e05 = endOf("G05");
    const g06 = startOf("G06"), e06 = endOf("G06"), g07 = startOf("G07"), e07 = endOf("G07");
    const NEAR = e04 + 34, STOP = g05 - 8;
    // the shells: about one a second until the runner comes; one close one after the letter's line
    const HITS: [number, number][] = [];
    for (let t = S.from + 8, i = 0; t < STOP; t += 27 + ((i * 7) % 9), i++) HITS.push([t, 0.45 + 0.4 * ((i * 0.618) % 1)]);
    let flash = 0; for (const [t, a] of HITS) flash = Math.max(flash, a * hit(f, t, 7));
    const near = hit(f, NEAR, 26);
    w.set.param("time", "siege"); w.set.param("lamp", "mid"); w.set.param("hole", true);
    w.set.param("flash", Math.min(1, flash + near));
    w.set.param("dust", Math.min(1, ky(f, [[S.from, 0.4], [STOP, 0.4], [STOP + 90, 0.18]]) + 0.8 * hit(f, NEAR, 70)));
    const LB = P("hall", -6.3, 0, 1.85), MC = P("hall", -5.1, 0, 3.0), RUN = P("hall", -1.95, 0, 2.75);
    const LBH = [-6.3, 1.16, 1.85], MCH = [-5.1, 1.1, 3.0], RUNH = [-1.95, 1.12, 2.75], HOLE = [-7.2, 1.2, 1.25];
    const EYE = [-3.7, 1.5, 2.3];
    let camera = povCam(f, [
      ck("hall", S.from, [-3.3, 1.5, 2.1], HOLE, 62),
      ck("hall", g01 - 20, [-3.6, 1.5, 2.2], HOLE, 56),
      ck("hall", g01 - 4, EYE, LBH, 54),
      ck("hall", g02 - 8, [-3.8, 1.48, 2.3], LBH, 52),
      ck("hall", g02 + 2, EYE, MCH, 54),
      ck("hall", NEAR - 2, EYE, MCH, 52),
      ck("hall", g05 - 20, EYE, MCH, 54),
      ck("hall", g05 - 12, EYE, RUNH, 56),
      ck("hall", g06 - 8, EYE, RUNH, 56),
      ck("hall", g06, EYE, MCH, 52),
      ck("hall", g07 - 8, EYE, MCH, 50),
      ck("hall", g07 + 2, EYE, LBH, 52),
      ck("hall", S.to, [-4.1, 1.46, 2.2], LBH, 44),
    ], { mood: [[S.from, "scared"], [g05 - 10, "calm"]], amp: 0.8 });
    for (const [t, a] of HITS) camera = shake(camera, f, t, 5 + 9 * a, 3, 9);
    camera = shake(camera, f, NEAR, 30, 3, 20);
    w.setCamera(camera);
    // --- the gun in the hole
    w.prop("mg").put(P("hall", -6.68, 0.86, 1.25), { yaw: -Math.PI / 2 });
    // --- 老班长: on the gun, his back to her -> a half turn for his line -> back -> G07: turned to the boy, hands down
    const turn = Math.max(win(f, g01 - 10, g02 - 2, 8, 8), ky(f, [[e05 + 2, 0], [e05 + 16, 1]]));
    const lbF = -2.25 + (0.85 + 2.25) * turn;
    const gunR = P("hall", -6.24, 1.15, 1.3), gunL = P("hall", -6.58, 1.2, 1.27);
    const onGun = 1 - ky(f, [[e05 + 2, 0], [e05 + 14, 1]]);
    put(w, f, LAO, {
      at: LB, facing: lbF, id: 3, who: "lb",
      expr: [[S.from, "alert"], [g01 - 6, "dry"], [e01 + 4, "halfLaugh"], [g02 - 2, "alert"], [e05, "heavy"]],
      hands: onGun > 0.02 ? [turn > 0.3 ? null : hang(LB, lbF, 0).lerp(gunR, onGun), hang(LB, lbF, 1).lerp(gunL, onGun)] : undefined,
      head: near > 0.05 ? { dy: -0.05 * near } : undefined,
      lookDown: f >= e07 + 20 ? 10 * ky(f, [[e07 + 20, 0], [e07 + 40, 1]]) : 0,
    });
    // --- 满仓: against the wall north of the hole, shouting to her over the noise; the close one; the order
    const toRun = ky(f, [[g05 - 6, 0], [g05 + 4, 1]]) * (1 - ky(f, [[e06 + 6, 0], [e06 + 18, 1]]));
    put(w, f, MANCANG_RIFLE, {
      at: MC, facing: 1.94 - 0.3 * toRun, id: 1, who: "mc",
      expr: [[S.from, "alert"], [g02 - 4, "grinShout"], [e04 + 6, "bright"], [NEAR, "stunned"], [NEAR + 26, "bright"], [g05 - 4, "alert"], [e05 - 6, "stunned"], [g06 - 2, "protest"], [e06 + 10, "sorrow"]],
      head: near > 0.05 ? { dy: -0.14 * near } : flash > 0.3 && f < g02 ? { dy: -0.03 * flash } : undefined,
      lean: near > 0.05 ? { pitch: 10 * near } : undefined,
      lookDown: f >= e07 + 6 ? 12 * ky(f, [[e07 + 6, 0], [e07 + 26, 1]]) : 0,
    });
    // --- the runner: in at a run from the back of the hall; stops short; the order; he stays, breathing
    const R0 = g05 - 38, leg = walkAlong([P("hall", 2.9, 0, 3.9), RUN], 4.3, (f - R0) / 30, { endFacing: -1.7 });
    if (f >= R0) put(w, f, RUNNER, { at: leg.at, facing: leg.facing, id: 7, who: "cl", pose: leg.moving ? leg.pose : undefined, expr: [[R0, "alert"], [g05 - 2, "shout"], [e05 + 2, "alert"], [g07, "heavy"]] });
    // --- two men deep in the hall (seen behind the runner)
    put(w, f, MEN[4], { at: P("hall", 1.2, 0, 1.0), facing: 3.0, id: 41, expr: "alert" }, "d0");
    put(w, f, MEN[6], { at: P("hall", 3.6, 0, 2.1), facing: -1.9, id: 42, expr: "alert" }, "d1");
    w.update();
    const cols = letterCols(), paperK = win(f, g04 - 2, NEAR - 6, 10, 8);
    const overlays = frag(
      h(Fact, { key: "c", f, from: S.from + 18, to: g01 - 12, y: 470, rows: ["这一夜炮火最密的时候", "每秒一发"], stamp: "号外" }),
      h(Fact, { key: "s", f, from: e01 + 4, to: g02 + 46, y: 470, rows: ["守军把炮弹洞", "当成了射击孔"] }),
      h(Letter, { key: "l", f, k: paperK, cols, x: 50, y: 800, scale: 0.84 }),
    );
    const dip = win(f, S.to - 8, S.to + 20, 7, 2);
    return { camera, overlays, top: h(Black, { k: dip }), post: { bloom: 0.6 } };
  },
};
