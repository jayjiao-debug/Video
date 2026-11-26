// SCENE C · 09:30, the case-file cabinet. HIS OLD RESULTS. He bustles to the wall of drawers and pulls five famous
// files, each a brag that goes wrong in his own hands:
//   牛郎织女   out of its drawer with a flourish; "once a year" and the file goes quietly back, the drawer pushed shut
//   梁祝       two paper butterflies flutter out of the folder and away; the file goes behind his back (这单别记)
//   许仙白娘子  a bale of approvals from the bottom drawer, hauled up with both arms, dropped on the floor (a thousand years)
//   宝玉黛玉   his hands shake as they did then; the file slips and falls (绑成了宝钗)
//   董永七仙女  a top drawer opened a crack, shut again at once; the whisper with a finger on his lips (玉帝的亲闺女)
// Each file's CARD (the film's 喜帖 skin) sits in the upper left, clear of him, its verdict stamped on the word.
// CAMERA PLAN (her eyes, one take; 37 s, six moves; he stays right of centre, the cards own the upper left):
//   arrive    LOOK AT him reaching the wall of drawers      medium wide (the whip pan lands here)       still: the drawers, the files and the floor all play in this frame
//   变蝴蝶了   the butterflies                               tilt up after them, and back to him          along his own look
//   跨物种     the bale on the floor                         tilt down (5 frames), one kick on the thud   then back up to him
//   宝钗       his face                                      close (snap zoom)                           lands on the word, held a second
//   那是       the whisper                                   close, the lens leans in and tips            she leans in to hear
//   三百年     him small before the open drawers             wide                                         she steps back; the clock races on it
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, whip, whipSmear, aimCam } from "../cam";
import { P, ck, startOf, endOf, wordAt, ky, rel, V, VERBS, smooth, walkAlong, kick, hang, faceTo, v3, through, turnTo, hit } from "./kit";
import { act, YL, type MoodKey } from "./act";
import { caseFile, disclaimer, draw, type Fx } from "./fx";
import { CAM_C0, TO_CAB, GO_CAB, CAB_SPEED } from "./segB";
import { OFFICE } from "../places";
import type { World } from "../world";

const S = seg("C");
const CABX = OFFICE.cabinetX, OUT = 0.22;
type Cell = { z: number; y: number; knob: number };
const cell = (c: number, r: number): Cell => { const top = 2.2 - r * 0.26; return { z: OFFICE.cabinet.z1 - (c + 0.5) * 0.25, y: top - 0.13, knob: top - 0.161 }; };
/** the five drawers: 牛郎织女, 梁祝 (waist high), 白蛇 (the bottom but one), 宝黛 (knee high), 七仙女 (head high: top secret) */
const CELLS = [cell(4, 4), cell(5, 4), cell(4, 6), cell(5, 5), cell(4, 3)];
const BASE = P("office", -2.1, 0, -0.3);
export const CAM_C1 = { pos: [-0.35, 1.52, 1.45], look: [-2.72, 1.0, -0.5], fov: 58 };
const knob = (c: Cell, out: number) => P("office", CABX + out + 0.024, c.knob, c.z);
const inD = (c: Cell, out: number) => P("office", CABX + out - 0.075, c.y + 0.16, c.z);

/** the frames of the scene's business (also read by scene D, which goes on in the same room without a cut) */
const T = () => {
  const c02 = startOf("C02"), c05 = startOf("C05"), c06 = startOf("C06"), c07 = startOf("C07"), c09 = startOf("C09");
  return {
    c02, c05, c06, c07, c09, mine: wordAt("C01", "我的"), g1: c02 - 26, b1: wordAt("C04", "也算") + 2, g2: c05 - 12, bf: wordAt("C05", "变") - 8, hide: wordAt("C05", "这单"),
    g3: c06 - 14, kua: wordAt("C06", "跨"), wipe: wordAt("C06", "审批"), g4: c07 - 6, shake: wordAt("C07", "手"), slip: wordAt("C07", "绑成") - 6, chai: wordAt("C07", "宝钗"),
    g5: c09 - 12, slam: wordAt("C09", "那是") - 12, that: wordAt("C09", "那是"),
  };
};
/** how far each of the five drawers is out on frame f */
const outs = (f: number) => {
  const t = T();
  return [
    f < t.b1 ? ky(f, [[t.g1 + 5, 0], [t.g1 + 11, OUT]]) : ky(f, [[t.b1 + 18, OUT], [t.b1 + 23, 0]]),
    ky(f, [[t.g2 + 5, 0], [t.g2 + 11, OUT]]),
    ky(f, [[t.g3 + 6, 0], [t.g3 + 13, 0.3]]),
    ky(f, [[t.g4 + 5, 0], [t.g4 + 11, OUT]]),
    f < t.slam ? ky(f, [[t.g5 + 6, 0], [t.g5 + 11, 0.1]]) : ky(f, [[t.slam, 0.1], [t.slam + 4, 0]]),
  ];
};
/** where the bale and the dropped file lie on the floor */
const FLOOR3 = P("office", -1.74, 0, -0.04), FLOOR4 = P("office", -1.95, 0.014, 0.14);
/** THE STATE OF THE CABINET from scene C on: the drawers left open, the bale and the dropped file on the floor.
 *  Scene C draws the moving parts itself; scene D calls this for what stays behind. */
export const cabinetMess = (w: World, f: number, o: { stack?: boolean; file4?: boolean } = {}) => {
  const out = outs(f);
  out.forEach((x, i) => { if (x > 0.004) w.prop("drawer", `d${i}`).put(P("office", CABX + x, CELLS[i].y, CELLS[i].z)); });
  if (o.stack !== false) w.prop("stack").put(FLOOR3, { yaw: 0.5 });
  if (o.file4 !== false) w.prop("file", "f4").put(FLOOR4, { yaw: 0.9, pitch: -Math.PI / 2 });
};

export const SEG: Segment = {
  id: "C", from: S.from, to: S.to, enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office"); w.set.param("tangle", 0.46); w.set.param("kpi", 0); w.set.param("smoke", 0);
    const t = T(), c03 = startOf("C03"), c04 = startOf("C04"), c08 = startOf("C08"), c10 = startOf("C10"), c11 = startOf("C11"), e11 = endOf("C11");
    const { c02, c05, c06, c07, c09, mine, g1, b1, g2, bf, hide, g3, kua, wipe, g4, shake, slip, chai, g5, slam, that } = t;
    const out = outs(f), [C1, C2, C3, C4, C5] = CELLS;
    // ---------------------------------------------------------------------------------------------- the camera
    const CP: [number, number, number] = [-0.55, 1.5, 1.2], C0 = { pos: CP, look: [-2.72, 1.0, -0.4], fov: 55 }, UP = { pos: CP, look: [-2.6, 1.66, -0.42], fov: 55 };
    const DOWN = { pos: C0.pos, look: [-2.2, 0.36, -0.12], fov: 55 }, HEAD: [number, number, number] = [-2.1, 1.17, -0.3];
    // the snap zoom and the lean-in aim by where his head lands on the frame (clear of the card, the face above the subtitles)
    const FACE = aimCam(CP, HEAD, 690, 1030, 41) as { pos: number[]; look: number[]; fov: number }, LEAN = aimCam([-1.0, 1.43, 0.66] as [number, number, number], HEAD, 560, 850, 52) as { pos: number[]; look: number[]; fov: number };
    const K = (at: number, c: { pos: number[]; look: number[]; fov: number }, roll = 0) => ck("office", at, c.pos, c.look, c.fov, { roll });
    let camera = povCam(f, [
      K(S.from, C0), K(bf + 3, C0), K(bf + 15, UP), K(hide - 12, UP), K(hide - 2, C0),
      K(kua + 1, C0), K(kua + 6, DOWN), K(kua + 22, DOWN), K(kua + 34, C0),
      K(chai - 6, C0), K(chai - 1, FACE), K(c08 + 14, FACE), K(c08 + 26, C0),
      K(that - 9, C0), K(that + 3, LEAN, -3), K(c10 - 2, LEAN, -3), K(c10 + 10, C0),
      K(c11 + 14, C0), K(e11 + 4, CAM_C1), K(S.to, CAM_C1),
    ], { mood: "calm", amp: 0.6, walk: [[S.from, 0], [c11 + 14, 0], [c11 + 20, 0.3], [e11 + 4, 0]] });
    camera = kick(camera, f, kua + 4, 0.035);
    const W = whip(camera, f, S.from - 4, { dir: -1, to: camera });
    camera = W.cam;
    w.setCamera(camera);
    const camP = v3(camera.pos);
    // ---------------------------------------------------------------------------------------------- where he stands
    const leg = walkAlong(TO_CAB, CAB_SPEED, (f - GO_CAB) / 30);
    const walking = leg.moving;
    const win = (a: number, up: number, hold: number, down: number) => ky(f, [[a, 0], [a + up, 1], [hold, 1], [hold + down, 0]]);
    // side-on at a drawer (he faces along the wall, the drawer at his right hand); back-on at the bottom drawer
    const wk = [win(g1, 5, g1 + 17, 9), win(b1, 7, b1 + 23, 6), win(g2, 5, g2 + 17, 9), win(g4, 5, g4 + 17, 9), win(g5, 5, slam + 3, 6)];
    const wkCell = [C1, C1, C2, C4, C5];
    const low = win(g3, 6, g3 + 21, 10), bend = ky(f, [[g3 + 3, 0], [g3 + 12, 1], [g3 + 20, 1], [g3 + 31, 0]]);
    const at = BASE.clone();
    wk.forEach((k, i) => at.lerp(P("office", -2.36, 0, wkCell[i].z - 0.2), smooth(k)));
    at.lerp(P("office", -2.1, 0, C3.z - 0.25), smooth(low));
    at.y -= 0.1 * bend;
    const front = faceTo(BASE, camP), side = Math.max(...wk);
    let facing = turnTo(front, -0.6, smooth(side));
    facing = turnTo(facing, -1.05, smooth(low));
    if (walking) { at.copy(leg.at); facing = leg.facing; }
    const H = (dx: number, y: number, z: number) => rel(at, facing, dx, y, z);
    // ---------------------------------------------------------------------------------------------- his hands
    const tremble = hit(f, shake - 2, 30) > 0 && f < slip ? 0.012 * Math.sin(f * 2.9) : 0, lowerK = ky(f, [[c03 + 46, 0], [c03 + 66, 1]]) * (f < b1 + 8 ? 1 : 0);
    const holdR = H(-0.105, 0.8 - 0.1 * lowerK + tremble, 0.26), holdL = H(0.105, 0.8 - 0.1 * lowerK - tremble, 0.26), hangR = hang(at, facing, 0), hangL = hang(at, facing, 1);
    const lowR = H(-0.13, 0.57, 0.25), lowL = H(0.13, 0.57, 0.25), behindR = H(-0.07, 0.6, -0.19), behindL = H(0.07, 0.6, -0.19);
    const take = (g: number, c: Cell, o: number, to: THREE.Vector3): [number, THREE.Vector3][] => [[g, hangR], [g + 5, knob(c, 0)], [g + 11, knob(c, o)], [g + 17, inD(c, o)], [g + 27, to]];
    const K0: [number, THREE.Vector3][] = [
      [S.from, hangR], [mine - 5, hangR], [mine + 3, H(-0.33, 0.92, 0.02)], [g1 - 1, H(-0.33, 0.92, 0.02)],
      ...take(g1, C1, OUT, holdR), [b1, holdR], [b1 + 8, inD(C1, OUT).add(V(0, 0.2, 0))], [b1 + 13, inD(C1, OUT)], [b1 + 18, knob(C1, OUT)], [b1 + 23, knob(C1, 0)], [b1 + 30, hangR],
      ...take(g2, C2, OUT, holdR), [hide - 5, holdR], [hide + 3, behindR], [g3 - 12, behindR], [g3 - 4, inD(C2, OUT).add(V(0, 0.1, 0))],
      [g3, hangR], [g3 + 6, knob(C3, 0).add(V(0, 0, -0.045))], [g3 + 13, knob(C3, 0.3).add(V(0, 0, -0.045))], [g3 + 19, P("office", CABX + 0.14, C3.y + 0.1, C3.z - 0.12)], [g3 + 31, lowR],
      [kua - 2, lowR], [kua + 5, H(-0.24, 0.66, 0.16)], [wipe - 6, H(-0.2, 0.6, 0.12)], [wipe + 3, H(-0.03, 0.84 + 0.012 * Math.sin(f * 0.8), 0.235)], [g4 - 8, H(-0.03, 0.84 + 0.012 * Math.sin(f * 0.8), 0.235)], [g4 - 1, hangR],
      ...take(g4, C4, OUT, holdR), [slip + 2, holdR], [slip + 5, H(-0.15, 0.86, 0.26)], [c08 - 6, H(-0.15, 0.86, 0.26)], [c08 + 6, H(-0.05, 0.64, 0.2)], [g5 - 1, H(-0.05, 0.64, 0.2)],
      [g5, hangR], [g5 + 6, knob(C5, 0)], [g5 + 11, knob(C5, 0.1)], [slam, knob(C5, 0.1)], [slam + 4, knob(C5, 0)], [slam + 10, hangR],
    ];
    const K1: [number, THREE.Vector3][] = [
      [S.from, hangL], [mine - 5, hangL], [mine + 3, H(0.3, 0.84, 0.12)], [g1 + 2, H(0.3, 0.84, 0.12)], [g1 + 9, hangL],
      [g1 + 19, hangL], [g1 + 27, holdL], [b1, holdL], [b1 + 7, hangL],
      [g2 + 19, hangL], [g2 + 27, holdL], [hide - 5, holdL], [hide + 3, behindL], [g3 - 10, behindL], [g3 - 2, hangL],
      [g3, hangL], [g3 + 6, knob(C3, 0).add(V(0, 0, 0.045))], [g3 + 13, knob(C3, 0.3).add(V(0, 0, 0.045))], [g3 + 19, P("office", CABX + 0.14, C3.y + 0.1, C3.z + 0.12)], [g3 + 31, lowL],
      [kua - 2, lowL], [kua + 5, H(0.24, 0.66, 0.16)], [wipe - 6, H(0.2, 0.6, 0.12)], [wipe + 3, H(0.16, 0.52, 0.1)], [g4 - 1, hangL],
      [g4 + 19, hangL], [g4 + 27, holdL], [slip + 2, holdL], [slip + 5, H(0.15, 0.86, 0.26)], [c08 - 6, H(0.15, 0.86, 0.26)], [c08 + 6, H(0.05, 0.64, 0.2)], [g5 - 1, H(0.05, 0.64, 0.2)], [g5 + 6, hangL],
    ];
    const hush = f >= that - 5 && f < c10 - 2;
    const hands: [THREE.Vector3, THREE.Vector3] | undefined = walking || hush || f < mine - 5 || f > slam + 10 ? undefined : [through(f, K0), through(f, K1)];
    // ---------------------------------------------------------------------------------------------- his face
    const faces: MoodKey[] = [
      [S.from, "eager"], [mine - 2, "proud"], [wordAt("C02", "我绑") - 1, "joy"], [wordAt("C02", "牢") - 1, "sly"],
      [c03 + 22, "look"], [c03 + 50, "small", "sink"], [c04 - 2, "sheepish"], [b1 + 4, "grumble"],
      [g2 + 2, "proud"], [bf + 1, "wonder", "take", 0.7], [bf + 30, "sheepish"], [hide - 2, "hush"],
      [g3 + 2, "resolve"], [g3 + 18, "strain"], [kua + 7, "tired", "sink"], [wipe - 2, "sag"],
      [g4 + 2, "proud"], [c07 - 1, "tender"], [shake - 2, "worry"], [slip + 1, "panic", "take"], [chai - 1, "aghast", "take", 0.6], [c08 - 2, "grumble"], [wordAt("C08", "两百") - 2, "small"],
      [g5 + 2, "peer"], [wordAt("C09", "七仙女") - 2, "dread", "take", 0.6], [that - 6, "hush"], [wordAt("C09", "亲闺女") - 2, "grave"], [c10 + 8, "worry"], [c11 - 2, "sag", "sink"], [wordAt("C11", "三百") - 2, "lost"],
    ];
    const sagK = ky(f, [[c03 + 50, 0], [c03 + 62, 1], [b1 + 20, 1], [g2, 0]]) + ky(f, [[c08 - 2, 0], [c08 + 10, 0.8], [g5 - 4, 0.8], [g5 + 2, 0]]) + ky(f, [[c11 - 2, 0], [c11 + 12, 1]]);
    const haulK = ky(f, [[g3 + 19, 0], [g3 + 31, 1], [kua - 2, 1], [kua + 6, 0]]), pant = f > kua + 6 && f < g4 - 10 ? 1 : 0, up = ky(f, [[bf + 4, 0], [bf + 14, 1], [hide - 14, 1], [hide - 6, 0]]);
    const peek = ky(f, [[g5 + 8, 0], [g5 + 14, 1], [slam - 2, 1], [slam + 4, 0]]), working = side > 0.5 || low > 0.5;
    const r = act(w, f, YL, {
      at, facing, faces,
      pose: walking ? leg.pose : hush ? { kind: "shh", t: f / 30, arm: 1, amount: ky(f, [[that - 5, 0], [that + 2, 1], [c10 - 8, 1], [c10 - 2, 0]]) } : undefined,
      hands, show: hush ? ["finger"] : undefined,
      turn: low > 0.5 ? 1 : side > 0.5 ? 0.6 : undefined,
      lookDown: 10 * Math.min(1, sagK) + 14 * bend + (working && low < 0.5 ? 6 : 0) - 14 * up,
      gaze: working ? 0 : up > 0.5 ? 0 : f >= kua + 2 && f < kua + 30 ? 0 : undefined,
      lean: { pitch: 22 * bend - 9 * haulK + 6 * Math.min(1, sagK) + 4 * pant * Math.sin(f * 0.42), roll: side > 0.3 && low < 0.3 ? -7 * side * (f > g5 && f < slam + 6 ? 1.3 : 1) : 3.5 * haulK * Math.sin(f * 0.5) },
      head: { dy: -0.06 * Math.min(1, sagK) + 0.05 * up + 0.05 * hit(f, wordAt("C02", "我绑"), 8), tilt: peek * -9 + (up > 0.3 ? 5 * Math.sin(f * 0.16) : 0) },
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the drawers and the files
    out.forEach((x, i) => { if (x > 0.004) w.prop("drawer", `d${i}`).put(P("office", CABX + x, CELLS[i].y, CELLS[i].z)); });
    const h0 = r.handWorld(0), h1 = r.handWorld(1), mid = h0.clone().lerp(h1, 0.5);
    // a file carried: hanging from the right hand's pinch as it leaves the drawer, then between both hands in front of the chest
    const carry = (key: string, two: number, yaw0: number) => {
      const p = h0.clone().add(V(0, -0.235, 0)).lerp(mid.clone().add(V(0, -0.125, 0)).add(V(Math.sin(facing), 0, Math.cos(facing)).multiplyScalar(0.012)), smooth(two));
      w.prop("file", key).put(p, { yaw: turnTo(yaw0, facing, smooth(two)), pitch: -0.2 * smooth(two) });
    };
    if (f >= g1 + 17 && f < b1 + 13) carry("f1", f < b1 ? (f - g1 - 19) / 8 : 1 - (f - b1) / 7, Math.PI / 2);
    if (f >= g2 + 17 && f < g3 - 4) {
      const back = ky(f, [[hide - 5, 0], [hide + 3, 1]]);
      if (back < 0.02) carry("f2", (f - g2 - 19) / 8, Math.PI / 2);
      else w.prop("file", "f2").put(h0.clone().lerp(h1, 0.5 * (1 - ky(f, [[g3 - 12, 0], [g3 - 6, 1]]))).add(V(0, -0.13 - 0.1 * ky(f, [[g3 - 12, 0], [g3 - 6, 1]]), 0)), { yaw: turnTo(facing, Math.PI / 2, ky(f, [[g3 - 12, 0], [g3 - 5, 1]])), pitch: -0.2 * (1 - back) });
    }
    if (f >= g4 + 17 && f < slip + 2) carry("f4", (f - g4 - 19) / 8, Math.PI / 2);
    else if (f >= slip + 2) {
      // it slips: a short fall, turning flat, to the floor by his feet
      const u = Math.min(1, (f - slip - 2) / 8), from = mid.clone().add(V(0, -0.125, 0)), p = from.lerp(FLOOR4, u); p.y = from.y + (FLOOR4.y - from.y) * u * u;
      if (u < 1) w.prop("file", "f4").put(p, { yaw: turnTo(facing, 0.9, u), pitch: -0.2 - (Math.PI / 2 - 0.2) * u, roll: 0.5 * Math.sin(u * 7) * (1 - u) });
      else w.prop("file", "f4").put(FLOOR4, { yaw: 0.9, pitch: -Math.PI / 2 });
    }
    // the bale: in the bottom drawer, hauled up against his belly, dropped
    if (f >= g3 + 13 && f < g3 + 19) w.prop("stack").put(P("office", CABX + 0.13, C3.y - 0.1, C3.z), { yaw: Math.PI / 2 });
    else if (f >= g3 + 19 && f < kua - 2) w.prop("stack").put(mid.clone().add(V(0, -0.14, 0)), { yaw: facing });
    else if (f >= kua - 2) {
      const u = Math.min(1, (f - kua + 2) / 6), from = mid.clone().add(V(0, -0.14, 0));
      if (f < kua + 4) { const p = from.lerp(FLOOR3, u); p.y = Math.max(0, 0.43 * (1 - u * u)); w.prop("stack").put(p, { yaw: turnTo(facing, 0.5, u), roll: 0.12 * Math.sin(u * 5) }); }
      else w.prop("stack").put(FLOOR3.clone().add(V(0, 0.035 * hit(f, kua + 4, 5), 0)), { yaw: 0.5 });
    }
    // the two paper butterflies of 梁祝: out of the folder's top, up in a wavering spiral, away over the cabinet
    if (f >= bf && f < bf + 84) {
      const start = rel(BASE, front, 0, 0.99, 0.3);
      [0, 1].forEach((i) => {
        const tt = (f - bf - i * 6) / 30; if (tt < 0) return;
        const a = tt * (2.4 + i * 0.5) + i * 2.4, rad = 0.05 + 0.12 * Math.min(1, tt);
        const p = start.clone().add(V(Math.sin(a) * rad, 0.5 * (1 - Math.exp(-3.2 * tt)) + 0.22 * tt + 0.035 * Math.sin(tt * 9 + i), Math.cos(a) * rad * 0.7 + 0.05 * tt));
        const yaw = a + Math.PI / 2, flap = 0.2 + 1.0 * Math.abs(Math.sin(tt * 17 + i * 1.3));
        w.prop("wing", `b${i}a`).put(p, { yaw, roll: flap, scale: 1.5 }); w.prop("wing", `b${i}b`).put(p, { yaw: yaw + Math.PI, roll: flap, scale: 1.5 });
      });
    }
    // ---------------------------------------------------------------------------------------------- over the picture
    // (each card is up only while he stands and shows that file: when he goes to a drawer his head passes under the spot)
    const Y = 540, card = (from: number, to: number, kind: Parameters<typeof caseFile>[1]["kind"], stampOn: number, rot: number, s = 0.8): Fx[] => {
      const X = 114 + 290 * s;   // its left edge stays on the phone-safe line
      return [caseFile(f, { from, to, x: X, y: Y, s, kind, stampAt: stampOn - from, rot, seal: true }), disclaimer(f, { from: from + 10, to, x: X, y: Y + 245 * s, text: "以上卷宗，纯属演绎" })];
    };
    const FX: Fx[] = [
      ...card(g1 + 27, b1 - 2, "niulang", wordAt("C04", "异地"), -3),
      ...card(g2 + 27, g3 - 14, "liangzhu", wordAt("C05", "变"), 2),
      ...card(g3 + 33, g4 - 2, "baishe", kua + 4, -2, 0.72),   // smaller: he stands close beside it over the bale
      ...card(g4 + 28, g5 - 2, "baodai", wordAt("C07", "绑成"), 3),
      ...card(c10 + 2, e11 + 6, "qixian", c10 + 16, -3),
    ];
    return { camera, overlays: [draw(f, FX), whipSmear(W.smear, -1)], shown: FX, post: W.post };
  },
};
void CAM_C0; void VERBS;
