// SCENE H · 31 Oct, before dawn. The bridge: they cross at a run under a searchlight ("低头！"). At the south end the
// rifles go on a pile. "记者，信。" "放心。" A Shanghai reporter behind the sandbags: "里面到底多少人？" She looks back
// at the dark warehouse; the tally lands (对外 800 / 实有 377); "八百。" Her camera dies. The end slate.
// THE ENEMY IS NEVER DRAWN: the beam and the tracers only.
// CAMERA:
//   1  pre      running south on the deck behind 满仓 and others' backs; the beam sweeping
//   2  H01      tracers overhead: he has turned, a hand down at her; she drops; then up and on; a dip
//   3  pre H02  the south end: the lamp, the cordon, a pile of rifles; he looks at his rifle, lays it down
//   4  H02-H03  he turns to her, empty-handed; her answer; the letter shows whole for a moment; he walks through the gap
//   5  H04      the newsman behind the sandbags, a hand to his mouth
//   6  after    she turns round (a whip): the warehouse, dark, men still coming over; the tally
//   7  H05      "八百。" the red line under 800; black; the slate
import { seg, type Segment } from "../story";
import { povCam, whip, duck } from "../cam";
import { MANCANG, MANCANG_RIFLE, LAO, MEN, BRIT_A, BRIT_B, NEWSMAN, CIVS } from "../people";
import { P, ck, put, startOf, endOf, ky, rel, h, frag, win, hit, shake, hang, walkAlong, sec } from "./kit";
import { Tally, Letter, Black, EndSlate } from "../hud/skin";
import { OFF_AT } from "../hud";
import { letterCols } from "./segG";

const S = seg("H");
const SLATE = [
  { rows: ["走进四行仓库的，约420人。", "四天后走出来，377人。"], hold: 2.9 },
  { rows: ["他们没能归队。被缴了械，", "在租界的“孤军营”里关了四年。"], hold: 3.3 },
  { rows: ["1941年4月24日，", "谢晋元在营中遇刺，36岁。", "此后，许多人被押去做苦工，", "最远到了新几内亚。"], hold: 4.2 },
  { rows: ["他们留下的298封遗书，", "今天还陈列在那栋楼里。", "墙上找回了354个名字。"], hold: 3.5 },
  { rows: ["他们说八百。历史就记了八百。"], hold: 2.4 },
];
/** how long the slate needs after the camera dies (s): the story's pad after H05 must cover it */
export const SLATE_S = 0.8 + SLATE.reduce((a, b) => a + b.hold, 0);
export const SEG: Segment = {
  id: "H", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("bridge");
    const h01 = startOf("H01"), e01 = endOf("H01"), h02 = startOf("H02"), e02 = endOf("H02"), e03 = endOf("H03"), h04 = startOf("H04"), e04 = endOf("H04");
    const h05 = startOf("H05"), e05 = endOf("H05");
    const CUT = h02 - sec(3.2) + 6, south = f >= CUT, TURN = e04 + 12, north = f >= TURN + 4, off = f >= OFF_AT;
    let camera, overlays: React.ReactNode = null, post: Record<string, unknown> = { bloom: 0.6 };
    if (!south) {
      // ------------------------------------------------------------------------------------------------ the run
      const burst = win(f, h01 - 22, e01 + 26, 5, 12);
      w.set.param("beam", 1); w.set.param("tracer", burst); w.set.param("flash", 0.25 + 0.5 * burst + 0.3 * hit(f, h01 - 22, 10));
      const STOP = h01 - 6, GO = e01 + 30;
      const zc = ky(f, [[S.from, 15.5], [STOP, 6.6], [GO, 6.2], [CUT + 8, -0.5]]);
      const moving = f < STOP || f >= GO;
      const mcZ = ky(f, [[S.from, 12.6], [STOP - 4, 4.3], [GO + 4, 4.3], [CUT + 8, -3.4]]);
      const MC = P("bridge", 0.05, 0, mcZ), MCH = [0.05, 1.1, mcZ];
      camera = povCam(f, [
        ck("bridge", S.from, [0.5, 1.5, zc], [0.1, 1.15, zc - 30], 62),
        ck("bridge", STOP - 8, [0.5, 1.5, zc], [0.1, 1.15, zc - 30], 62),
        ck("bridge", STOP + 4, [0.5, 1.5, zc], MCH, 58),
        ck("bridge", GO - 6, [0.5, 1.5, zc], MCH, 58),
        ck("bridge", GO + 8, [0.5, 1.5, zc], [0.1, 1.15, zc - 30], 62),
        ck("bridge", CUT + 8, [0.5, 1.5, zc], [0.1, 1.15, zc - 30], 62),
      ], { mood: "scared", amp: 0.9, walk: [[S.from, 1.5], [STOP, 1.5], [STOP + 6, 0], [GO, 0], [GO + 6, 1.5]] });
      camera = duck(camera, f, h01 - 2, GO - 6, { to: 0.98, len: 6 });
      camera = shake(camera, f, h01 - 22, 10, 3, 10);
      w.setCamera(camera);
      // 满仓: running ahead (his back) -> stopped, turned to her, a hand pushing down -> on again
      const turned = !moving || (f >= STOP - 4 && f < GO + 4);
      const mcF = turned ? 0.25 : Math.PI, down = win(f, h01 - 4, e01 + 14, 5, 8);
      put(w, f, MANCANG_RIFLE, {
        at: MC, facing: mcF, id: 1, who: "mc", turn: turned ? 0 : 1,
        pose: turned ? undefined : { kind: "walk", phase: (((15 - mcZ) / 1.5) % 1 + 1) % 1, stride: 0.42, amount: 1 } as never,
        expr: [[S.from, "alert"], [STOP - 4, "shout"], [e01 + 8, "alert"]],
        hands: down > 0.02 ? [null, hang(MC, mcF, 1).lerp(rel(MC, mcF, 0.3, 1.0 - 0.12 * Math.sin(f * 0.6), 0.34), down)] : undefined,
        head: turned ? { dy: -0.1 * down } : undefined,
      });
      // others ahead of them, backs, running
      [[1.7, 5.5, 3], [-2.3, 8.0, 4], [0.9, 10.5, 5], [2.6, 13.0, 6]].forEach(([x, d, m], i) => {
        const z = zc - d - (f - S.from) * 0.006 * (i + 1);
        put(w, f, MEN[m], { at: P("bridge", x, 0, z), facing: Math.PI, id: 70 + i, turn: 1, pose: { kind: "walk", phase: ((((20 - z) / 1.5 + i * 0.3) % 1) + 1) % 1, stride: 0.42, amount: 1 } as never, expr: "alert" }, `r${i}`);
      });
      w.update();
    } else {
      // ------------------------------------------------------------------------------------------ the south end
      const LAY = h02 - 34;
      w.set.param("beam", north ? 0.8 : 0.5); w.set.param("tracer", 0); w.set.param("flash", 0.15);
      const MC0 = P("bridge", 0.3, 0, -21.0), GAPH = [0.2, 1.1, -24.0];
      const EYE = [0.3, 1.5, -19.5], NEWS = P("bridge", 2.75, 0, -23.35), NEWSH = [2.75, 1.22, -23.35];
      const camS = povCam(f, [
        ck("bridge", CUT, [0.3, 1.5, -16.6], [0.7, 0.8, -21.4], 60),
        ck("bridge", LAY - 20, [0.3, 1.5, -18.6], [0.8, 0.7, -21.1], 58),
        ck("bridge", LAY + 12, [0.3, 1.5, -19.2], [0.75, 0.75, -21.1], 56),
        ck("bridge", h02 - 6, EYE, [0.3, 1.1, -21.0], 54),
        ck("bridge", e03 + 8, EYE, [0.3, 1.1, -21.0], 52),
        ck("bridge", e03 + 34, EYE, GAPH, 52),
        ck("bridge", h04 - 12, EYE, GAPH, 50),
        ck("bridge", h04 - 2, EYE, NEWSH, 40),
        ck("bridge", TURN + 8, EYE, NEWSH, 38),
      ], { mood: "calm", amp: 0.7, walk: [[CUT, 1], [LAY, 0.6], [h02 - 10, 0]] });
      const camN = povCam(f, [
        ck("bridge", TURN, [0.3, 1.5, -19.3], [-13, 10.5, 42], 56),
        ck("bridge", h05, [0.3, 1.5, -19.3], [-13.5, 10.5, 42], 52),
        ck("bridge", OFF_AT, [0.3, 1.5, -19.3], [-14, 10.5, 42], 49),
      ], { mood: "calm", amp: 0.5 });
      const wp = whip(camS, f, TURN, { dir: -1, to: camN, deg: 34, out: 5, in: 5 });
      camera = wp.cam; if (wp.post) post = { ...post, ...wp.post };
      w.setCamera(camera);
      // the pile, the two British soldiers (plain khaki: no badge, no flag)
      w.prop("rifles").put(P("bridge", 1.25, 0, -21.3), {});
      put(w, f, BRIT_A, { at: P("bridge", -2.25, 0, -21.6), facing: 0.5, id: 80, expr: "calm" });
      put(w, f, BRIT_B, { at: P("bridge", -1.25, 0, -23.7), facing: 0.6, id: 81, expr: "calm" });
      // 满仓: at the pile, looking at his rifle -> lays it down -> turns to her -> nods -> walks through the gap
      const armed = f < LAY, lay = win(f, LAY - 10, LAY + 16, 8, 10);
      const WALK = e03 + 16, leg = walkAlong([MC0, P("bridge", 0.25, 0, -22.7), P("bridge", 0.1, 0, -27.5)], 1.25, (f - WALK) / 30);
      const toHer = ky(f, [[LAY + 14, 0], [LAY + 28, 1]]);
      const mcF = f >= WALK ? leg.facing : 1.88 * (1 - toHer);
      const mcAt = f >= WALK ? leg.at : MC0;
      const nod = hit(f, e03 + 4, 14);
      put(w, f, armed ? MANCANG_RIFLE : MANCANG, {
        at: mcAt, facing: mcF, id: 1, who: "mc", turn: f >= WALK + 8 ? 1 : undefined,
        pose: f >= WALK && leg.moving ? leg.pose : undefined,
        expr: [[CUT, "sorrow"], [LAY + 20, "steady"], [e02 + 4, "shy"], [e03 + 2, "bright"], [WALK, "steady"]],
        lookDown: armed ? 14 : 14 * (1 - toHer),
        hands: !armed && lay > 0.02 ? [hang(mcAt, mcF, 0).lerp(rel(mcAt, mcF, -0.1, 0.62, 0.42), lay), hang(mcAt, mcF, 1).lerp(rel(mcAt, mcF, 0.1, 0.62, 0.42), lay)] : undefined,
        head: nod > 0.02 ? { dy: -0.05 * Math.sin(Math.PI * (1 - nod)) } : undefined,
      });
      // 老班长: through already, waiting under the lamp; they go on together. Two more walking away, empty-handed
      const lbGo = Math.max(0, (f - (WALK + 44)) / 30), lbLeg = walkAlong([P("bridge", -0.55, 0, -25.4), P("bridge", -0.6, 0, -29.5)], 1.2, lbGo);
      put(w, f, LAO, { at: lbLeg.at, facing: lbGo > 0 ? lbLeg.facing : 0.25, id: 3, turn: lbGo > 0.2 ? 1 : undefined, pose: lbGo > 0 && lbLeg.moving ? lbLeg.pose : undefined, expr: "heavy" });
      [[0.9, -24.6, 6], [-0.3, -26.2, 7]].forEach(([x, z0, m], i) => {
        const lg = walkAlong([P("bridge", x, 0, z0), P("bridge", x - 0.4, 0, z0 - 9)], 1.15, Math.max(0.01, (f - CUT) / 30));
        put(w, f, MEN[m], { at: lg.at, facing: lg.facing, id: 84 + i, turn: 1, pose: lg.moving ? lg.pose : undefined, expr: "calm" }, `s${i}`);
      });
      // the newsman behind the sandbags, a hand to his mouth; the people behind the cordon
      const call = win(f, h04 - 8, e04 + 6, 6, 8);
      put(w, f, NEWSMAN, {
        at: NEWS, facing: -0.58, id: 8, who: "th", expr: [[CUT, "alert"], [h04 - 4, "shout"], [e04 + 2, "alert"]],
        hands: call > 0.02 ? [hang(NEWS, -0.58, 0).lerp(rel(NEWS, -0.58, -0.13, 1.3, 0.2), call), null] : undefined,
      });
      [[4.1, -23.5, -0.5], [3.5, -24.5, -0.4], [-2.7, -23.6, 0.45], [-3.7, -24.3, 0.5], [-4.4, -23.4, 0.6]].forEach(([x, z, fc], i) => put(w, f, CIVS[i % CIVS.length], { at: P("bridge", x, 0, z), facing: fc, id: 90 + i, expr: "calm" }, `c${i}`));
      // seen when she turns round: men still coming over the bridge toward her
      if (f >= TURN) [[-1.6, 9, 3], [1.3, 2, 4], [-0.3, -5, 5]].forEach(([x, z0, m], i) => {
        const lg = walkAlong([P("bridge", x, 0, z0), P("bridge", x * 0.6, 0, -20)], 1.5, Math.max(0.01, (f - TURN) / 30) + i * 0.2);
        put(w, f, MEN[m], { at: lg.at, facing: lg.facing, id: 94 + i, pose: lg.moving ? lg.pose : undefined, expr: "calm" }, `n${i}`);
      });
      w.update();
      const paperK = win(f, e02 + 2, e03 + 22, 8, 8);
      overlays = frag(
        h(Letter, { key: "l", f, k: off ? 0 : paperK, cols: letterCols(), x: 50, y: 800, scale: 0.84 }),
        !off && h(Tally, { key: "t", f, from: TURN + 16, to: OFF_AT + 30, real: 377, mark: ky(f, [[h05 + 4, 0], [e05 + 2, 1]]) }),
      );
    }
    // --- black: the cut to the south end; her camera dies; the slate
    const dip = !off ? win(f, CUT - 8, CUT + 9, 7, 7) : 1;
    let at = OFF_AT + sec(0.8);
    const blocks = SLATE.map((b) => { const r = { rows: b.rows, at }; at += sec(b.hold); return r; });
    const top = frag(
      h(Black, { key: "b", k: dip }),
      off && h(EndSlate, { key: "e", f, from: OFF_AT, blocks, note: ["片中谢晋元、杨瑞符的话均为史料原话。", "满仓、老班长为演绎人物。"], noteAt: blocks[blocks.length - 1].at + 24 }),
    );
    return { camera, overlays, top, post, cards: !off };
  },
};
