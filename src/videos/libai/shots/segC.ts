// SEGMENT C, lines C19-C22: 午时, 沉香亭 (Qin's terrace with peonies). beats.ts BEAT.C.
//   write   C19-C20   he writes at a low desk, face still wet; the emperor's back at the parapet far off; 高力士 stands
//                     at his left, smug. C20 the couplet: the sheet fills.
//   foot    C21       高公公，靴子太紧: he turns to 高力士, smug.
//   boot    C21 after silence: 高力士 kneels, pulls the boot off, stands with it, turns and glares into the lens.
//   aside   C22       完了: her whisper (whisper.ts), the lens stays on them. Card 3. Whip out.
import * as THREE from "three";
import { SEGMENTS, FPS, lineId, type Segment, type CamPose } from "../story";
import { BEAT } from "../beats";
import { TRACK } from "../track";
import * as C from "../cam";
import { LI, GAO, EMPEROR } from "../people";
import { TX } from "../layout";
import { transitionAt } from "../hud";
import { V, rel, yawTo, lid, says, accent, heads, headPop, at, kneel, standing } from "./common";
import { aim, ramp, mixCam, table, putTable, type St } from "./lb";
import { LETTER } from "../props/things";
import { whisperLean } from "../whisper";

const S = SEGMENTS[2], Cb = BEAT.C;
const L20 = lineId("C20"), L21 = lineId("C21");
const T = table(V(TX + 0.2, 0, -0.55), 0);
const HEAD = rel(T.at, T.facing, 0, 0.98, 0);
const GAO_AT = V(TX + 0.95, 0, -1.05), GAO_F = yawTo(V(TX + 0.95, 0, -1.05), V(TX + 0.2, 0, 2.5));
/** he kneels a step from where he stood, beside 李白's stuck-out foot, turned to it: far enough to the side that his head
 *  never passes in front of 李白's face from her spot */
const GAO_KNEEL = V(TX + 0.85, 0, -1.2), GAO_KF = yawTo(GAO_KNEEL, V(TX + 0.2, 0, -0.8));
const EMP_AT = V(TX - 0.75, 0, -2.45);
const PEONIES = [V(TX - 1.35, 0, -1.6), V(TX + 1.75, 0, -1.9), V(TX - 1.0, 0, 0.55), V(TX + 1.55, 0, 0.35)];
/** THE CAMERA PLAN (one take):
 *    open     he writes at the low desk, 高力士 standing smug at his left, the emperor's back far off (his banner)
 *    C20      the couplet: a slow push (the poem landing), about 10 % over the two lines
 *    C21      靴子: he turns to 高力士 and sticks his foot out: she turns a little with his look to hold both
 *    boot     held, still (the room goes silent while 高力士 kneels)
 *    glare    高力士 turns and glares into the lens: snap in on him, landing on the glare, held a second
 *    C22      back to the two of them for her whisper (whisper.ts: the lean, he carries on); card 3; the whip out */
const CAM0 = V(TX + 0.5, 1.36, 1.75);
/** HE WRITES ON THE PAGE (Jay, 15 Nov: "he is holding the brush wrong, also he isnt writing on the page but instead the
 *  table": the rig's own writing hand worked at the desk's near edge, 0.2 m short of the sheet, and the brush stood in
 *  his fist tip up). The sheet now lies in front of him, within reach; his right hand is pinned over the cell being
 *  written (props/things.ts LETTER: 8 columns of 7, the first on his right, each written from the far side toward
 *  him), the brush upright in it, tip down on the paper; the left hand rests by the sheet. The page fills a little
 *  while she speaks (C19) and the rest with the couplet. When it is done he lays the brush down at his right, by the
 *  ink stone (which is on his writing side now). */
const PAGE = T.on(-0.04, -0.14), STONE = T.on(-0.44, 0.02), BRUSH_REST = T.on(-0.27, -0.1);
const WROTE = [S.from + 8, L20.from - 2, L20.from, L20.to] as const, LAY = [L20.to + 5, L21.from - 8] as const;
const inkAt = (f: number) => 0.22 * ramp(f, WROTE[0], WROTE[1]) + 0.78 * ramp(f, WROTE[2], WROTE[3]);
/** the brush in the writing hand: a little off upright, the tip down; lying on the desk at rest */
const BRUSH_UP: [number, number, number] = [Math.PI + 0.3, 0, -0.12], BRUSH_FLAT: [number, number, number] = [Math.PI / 2, 0.15, 0];
const GRIP_TO_TIP = 0.155;
const brushDir = (r: [number, number, number]) => new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(r[0], r[1], r[2], "YXZ"));
/** the brush tip on the page: down the column being written, a lifted hop back up to the next one */
const tipAt = (f: number) => {
  const u = Math.min(LETTER.cols - 0.001, inkAt(f) * LETTER.cols), col = Math.floor(u), v = u - col;
  const cw = (LETTER.w - 0.05) / LETTER.cols, x = (c: number) => -LETTER.w / 2 + 0.025 + (c + 0.5) * cw;
  const z0 = LETTER.d / 2 - 0.045, z1 = -LETTER.d / 2 + 0.04, back = Math.max(0, (v - 0.86) / 0.14), e = back * back * (3 - 2 * back);
  const along = back > 0 ? 1 - e : v / 0.86, moving = inkAt(f) > 0 && inkAt(f) < 1;
  const wig = moving ? 1 : 0;
  return PAGE.clone().add(V(x(col) + (x(Math.min(LETTER.cols - 1, col + 1)) - x(col)) * e + 0.006 * wig * Math.sin(f * 1.9),
    0.004 + 0.03 * Math.sin(Math.PI * back) + 0.004 * wig * (0.5 + 0.5 * Math.sin(f * 2.7)), z0 + (z1 - z0) * along + 0.004 * wig * Math.cos(f * 2.3)));
};
/** his right hand and the brush's turn on frame f while the brush is in it */
const brushHand = (f: number) => {
  const k = ramp(f, LAY[0], LAY[1]), e = k * k * (3 - 2 * k);
  const rot = BRUSH_UP.map((a, i) => a + (BRUSH_FLAT[i] - a) * e) as [number, number, number];
  const up = tipAt(f).sub(brushDir(BRUSH_UP).multiplyScalar(GRIP_TO_TIP));
  // laid down: the shaft's middle on BRUSH_REST, so the grip (3 cm from the middle, away from the tip) is the hand
  const down = BRUSH_REST.clone().add(V(0, 0.012, 0)).sub(brushDir(BRUSH_FLAT).multiplyScalar(0.03));
  return { hand: up.lerp(down, e).add(V(0, 0.05 * Math.sin(Math.PI * k), 0)), rot };
};
const GAO_HEAD = V(TX + 0.95, 1.5, -1.05);

const cam = (f: number): CamPose => {
  const two = aim(CAM0, HEAD.clone().add(V(0.32, -0.1, 0)), 880, 520);
  let c = C.slowPush(two, f, L20.from, L20.to, 0.35);
  // C21: with his look toward 高力士
  const turn = ramp(f, Cb.foot - 8, Cb.foot + 10);
  if (turn) c = C.nudge(c, { yaw: 5 * turn });
  // the glare: onto 高力士's face, landing on the glare, then back for her whisper
  const g = ramp(f, Cb.glare - 5, Cb.glare) * (1 - ramp(f, lineId("C22").from - 14, lineId("C22").from - 2));
  if (g) c = mixCam(c, { ...aim(CAM0, GAO_HEAD, 760, 560), fov: c.fov * 0.7 }, g);
  c = C.handheld(c, f, { mood: f >= Cb.kneel - 10 && f < lineId("C22").from ? "still" : "calm", amp: 0.7 });
  return whisperLean(f, c, { at: HEAD });
};

const li = (f: number): St => {
  const t = f / FPS, writing = f < L21.from - 6;
  const bh = brushHand(f);
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "focus"], [lineId("C19").to, "happy"], [L20.from, "smile_closed"], [L20.to, "happy"], [L21.from, "smug"], [Cb.kneel, "smile_closed"], [Cb.glare, "happy"]]);
  const m = says("li", ["C20", "C21"], f, 2);
  return {
    at: T.at.clone(), facing: T.facing + (f >= Cb.foot - 8 && f < Cb.glare ? 0.35 : 0), seat: T.seat, pose: { kind: "sit", t },
    hands: writing ? [bh.hand, T.on(0.19, -0.2).add(V(0, 0.035, 0))] : undefined,
    expr, mouth: m.mouth, head: heads(m.head, headPop(f, Cb.foot)), blink: m.blink ?? lid(t, 2), gaze: f >= Cb.foot - 8 && f < Cb.glare ? 1 : 0, visible: true,
    // foot out, he lolls further back and stops listing sideways, so his head stays clear of 高力士's while he kneels
    lean: f >= Cb.foot - 8 && f < Cb.glare ? { pitch: -5 - 4 * ramp(f, Cb.foot - 8, Cb.foot + 6), roll: 3 * (1 - ramp(f, Cb.foot - 8, Cb.foot + 6)) }
      : f < LAY[1] + 6 ? { pitch: 7 * (1 - ramp(f, LAY[0], LAY[1] + 6)) } : undefined,   // bent over the page while he writes
  };
};
const gao = (f: number): St => {
  const t = f / FPS;
  const k = ramp(f, Cb.kneel - 8, Cb.kneel + 6) * (1 - ramp(f, Cb.up - 6, Cb.up + 4));
  const p = GAO_AT.clone().lerp(GAO_KNEEL, ramp(f, Cb.kneel - 16, Cb.kneel - 2) * (1 - ramp(f, Cb.up, Cb.glare)));
  const facing = f < Cb.kneel - 16 ? GAO_F : f < Cb.up + 4 ? GAO_KF : yawTo(p, CAM0);
  const expr = at<NonNullable<St["expr"]>>(f, [[0, "smug"], [Cb.foot + 4, "shock"], [Cb.kneel, "pained"], [Cb.boot, "wince"], [Cb.glare, "huff"], [Cb.card[0], "stern"]]);
  const hold = f >= Cb.boot - 6;
  const bootAt = rel(p, facing, 0, 0.82, 0.38);
  return {
    ...standing(p, facing, f, 4), ...kneel(k, p), facing, expr, blink: lid(t, 4),
    pose: hold ? { kind: "hold", t } : { kind: "idle", t }, hands: hold ? [bootAt.clone().add(V(0, 0, 0)), bootAt.clone()] : [null, null],
    head: heads(accent("jolt", f, Cb.foot + 4, { amp: 0.7 }), accent("shake", f, Cb.glare, { amp: 0.5 })), turn: f < Cb.up + 4 && f >= Cb.kneel - 16 ? 1 : undefined,
  };
};

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to,
  enter() {}, exit(w) { w.actor(GAO).set({ visible: false }); w.actor(EMPEROR).set({ visible: false }); },
  pose(w, f) {
    w.setPlace("terrace");
    w.set.param("carriages", 0);
    // the join to D: the last 4 frames whip right
    const W = C.whip(cam(f), f, S.to - 3, { dir: 1, out: 4, in: 0 });
    const camera = W.cam;
    w.setCamera(camera);
    putTable(w, T);
    PEONIES.forEach((p, i) => w.prop("peony", `p${i}`).put(p, { rot: i }));
    w.prop("inkstone").put(STONE);
    w.prop("letter").put(PAGE, { ink: inkAt(f) });
    w.actor(LI).set(li(f));
    w.actor(GAO).set(gao(f));
    w.actor(EMPEROR).set({ at: EMP_AT, facing: Math.PI + 0.3, pose: { kind: "idle", t: f / FPS }, turn: 1, visible: true });
    w.update();
    // where 高力士's head is on screen: his banner follows him (hud/intro.tsx GaoBanner)
    { const hd = w.actor(GAO).headWorld(), c = w.project(hd), tp = w.project(hd.clone().add(new THREE.Vector3(0, 0.34, 0))); TRACK.gao = { f, x: c.x, y: c.y, top: tp.y }; }
    const r = w.actor(LI), writing = f < L21.from - 6;
    if (writing) w.prop("brush").put(r.handWorld(0), { grip: "hilt", rot: brushHand(f).rot });
    else w.prop("brush").put(BRUSH_REST.clone().add(V(0, 0.012, 0)), { rot: BRUSH_FLAT });
    if (f >= Cb.boot - 6) w.prop("boot").put(w.actor(GAO).handWorld(1), { grip: "hilt", rot: yawTo(V(), V(1, 0, 0)) });
    return { camera, post: W.post, overlays: C.whipSmear(W.smear, 1) ?? transitionAt(f)?.node, slate: "C 沉香亭" };
  },
};
void THREE;
