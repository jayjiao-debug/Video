// SEGMENT E (未时), lines E01-E08: the flashback trip. WP5 segE. Every frame comes from line() / capWord() / BEAT.E /
// SEGMENTS; every mark from layout.ts. The emperor is "plain" all through E (people.ts BLUSH SWAPS: no blush in E).
//   E-hall   S.from .. toTable-1   fade in FROM D's warm black (8 frames). The hall, bright. He stands in front of the
//                                  desk holding a rolled chart, smug: 来 (she steps in: he lifts it), 给你看样东西 (chin
//                                  up), 上回出巡 (he unrolls it at her, head pop). Her lens dives into the chart (push,
//                                  narrowing, lens blur): the cut to the table hides in the blur.
//   E-tai    toTable .. xiangshan-1   泰山 on the sand table, rain. She crouches at the tableau: the tiny emperor shelters
//                                  under the pine (looks up at it, nods on 挡雨有功); HE crouches behind his mountain
//                                  (hidden by it). 封它: he rises over the mountain as she straightens up to him: the
//                                  decree, the hand raised high (the mountain hides him below the chest, so every gesture
//                                  is made high); 五大夫 chin up, head pop; she
//                                  follows his finger down: the hat POPS onto the pine (pop_hat, E02 end + 0.1 s). E03
//                                  her puzzled head tilt, then up to him (prickly when doubted); E04 朕说能，就能: cool,
//                                  the palm comes up on 就能, a nod, a punch-in. A whip pan hides the change of tableau.
//   E-xiang  xiangshan .. back-1   湘山 in the storm: the camera rolls with the tilting boat; up to him on E05 (annoyed,
//                                  he jabs a finger at the shrine); she pans to the BOSHI at the table's end (E06: a bow
//                                  of the head, slow, deadpan); back to him while his face darkens; E07 砍！: huff + head
//                                  shake, the hand chops down twice, she flinches (kick, shake, pulls back); she cranes over the
//                                  mountain as the axes ring: the trees go, the earth turns red (the E07 card); the storm
//                                  drops; she tilts up to him still huffing; he catches the lens, coughs, looks away (哼).
//   E-aside  back .. S.to          the whip (whoosh, E08 start - 0.3 s) back to the hall: she hangs back by the west
//                                  pillar (the west wall at QHALL.asideWall is in deep shadow: it read as a black block),
//                                  HE stands at the desk with his back to her, shoulders heaving; she whispers E08 to the
//                                  audience, leans in on 千万, a nervous glance toward him on 惹陛下. The LAST 5
//                                  frames whip out (C.whip dir 1, out 5, 25 deg + whipSmear): F lands it at night.
import * as THREE from "three";
import { SEGMENTS, line, capWord, quote, FPS, clamp01, lerp, smooth, easeInCubic, easeOutCubic, easeInOutCubic, h, type Segment, type Pose, type CamPose, type Vec3 } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { EMPEROR, BOSHI, type Person } from "../people";
import { QHALL, TABLE, BX } from "../layout";
import { deskSeat, holdPoints } from "../props";
import type { World } from "../world";
import { V, rel, lid, at, ky, accent, heads, headPop, speak, kick, shake, bow as bowHead, swaps, yawTo, type RigState } from "./common";

type Extra = Partial<RigState>;
type Expr = NonNullable<RigState["expr"]>;
const S = SEGMENTS[4], E = BEAT.E;
const sec = (s: number) => Math.round(s * FPS);
/** the film's darkest warm tone (D ends in it, the palm's black): E fades in from it */
const WARM_BLACK = "#2a1d19";

// ---------------------------------------------------------------------------------------------------------- the beats
const L1 = line("E01"), L2 = line("E02"), L3 = line("E03"), L4 = line("E04"), L5 = line("E05"), L6 = line("E06"), L7 = line("E07"), L8 = line("E08");
const T = {
  fade: S.from + 8,                                   // the fade in from warm black ends
  come: capWord("E01", "来").from,                     // 来: he lifts the chart, she steps in
  show: capWord("E01", "看样").from,                   // 给你看样东西: chin up
  tour: capWord("E01", "上回").from,                   // 上回出巡: he unrolls it
  xun: capWord("E01", "出巡").from,
  dive: L1.to + 1,                                    // her lens dives into the chart ..
  cut: E.toTable,                                     // .. and comes out over the table (the rain starts)
  tree: capWord("E02", "这棵树").from,
  rain: capWord("E02", "挡雨").from,
  feng: capWord("E02", "封它").from,
  wdf: E.hat,                                         // 五大夫
  hatOn: L2.to + sec(0.1) - 2,                        // pop_hat (E02 end + 0.1 s): the hat lands on the pine
  e03: L3.from, yeneng: capWord("E03", "也能").from,
  e04: L4.from, neng1: capWord("E04", "说能").from, neng2: capWord("E04", "就能").from,
  swap: E.xiangshan[0],                               // the tableau changes under the whip
  e05: L5.from, shen: capWord("E05", "什么神").from,
  e06: L6.from, yao: capWord("E06", "尧").from, shun: capWord("E06", "舜的妃子").from,
  e07: L7.from, kan1: capWord("E07", "砍全").from, kan2: capWord("E07", "砍了").from,
  axes: L7.to + sec(0.2),                             // axes: the mountain is cut bare
  bareEnd: E.bare[1],
  caught: E.bare[1] + sec(0.5),                       // he notices her lens
  away: E.bare[1] + sec(0.8),                         // coughs, looks away
  back: E.back,                                       // the whip to the hall wall (whoosh at E08 start - 0.3 s)
  e08: L8.from, qian: capWord("E08", "千万").from, re: capWord("E08", "惹陛下").from,
  out: S.to - 4,                                      // the last 5 frames: the whip out
};
const WHIP1 = T.swap - 4;                             // 泰山 -> 湘山: out 4 frames, in 4 frames, cut on T.swap
const ASIDE_CUT = T.back + 4;                         // the table -> the hall wall, inside the whip

// ---------------------------------------------------------------------------------------------------------- the people
/** the tiny emperor on the tableau (a scaled copy of the EMPEROR: World caches one figure per Person) */
const MINI: Person = { ...EMPEROR, name: "emperorMini", scale: 0.08 };
/** the hall: he stands in front of the desk, facing her */
const HE = V(0.12, 0, -1.95);
/** the table room: he stands behind the table (TABLE.behind), the BOSHI at the table's east end */
const TB = TABLE.behind.clone();
const BSH = V(BX + 1.78, 0, -0.5);
const BSH_FACING = yawTo(BSH, V(BX + 0.2, 0, -1.2));
/** the 泰山 pine's crown (the hat lands there) */
const CROWN = TABLE.tree.clone().add(V(0.065, 0.22, -0.018));
/** where an idle hand of his hangs and where his shoulder is */
const hangH = (p: THREE.Vector3, facing: number, arm: 0 | 1) => rel(p, facing, arm ? 0.24 : -0.24, 0.63, 0.03);    // measured (clearance --dump)
const shoulder = (p: THREE.Vector3, facing: number, arm: 0 | 1) => rel(p, facing, (arm ? 0.18 : -0.18), 1.0, 0.02);
/** a hand reaching toward a world point: k 0 = hanging .. 1 = the arm out toward `to` (0.36 m from the shoulder) */
const reach = (p: THREE.Vector3, facing: number, arm: 0 | 1, to: THREE.Vector3, k: number, len = 0.36) => {
  const sh = shoulder(p, facing, arm), out = sh.clone().addScaledVector(to.clone().sub(sh).normalize(), len);
  // the hand swings out in front on its way (never back through the robe)
  return hangH(p, facing, arm).lerp(out, clamp01(k)).add(rel(V(), facing, 0, 0.05, 0.19).multiplyScalar(Math.sin(Math.PI * clamp01(k))));
};
/** an overhead strike with his RIGHT hand (arm 0), made in the picture plane so it reads (a hand reaching toward the lens
 *  foreshortens to nothing): k 0 = hanging .. 1 = raised beside his head (screen left of it, clear of the crown);
 *  s 0 .. 1 = struck down and forward over the mountain (the hand stays above the trees) */
const strike = (p: THREE.Vector3, facing: number, k: number, s: number, to = rel(p, facing, -0.13, 1.04, 0.35)) => {
  const up = rel(p, facing, -0.34, 1.28, 0.1), top = up.lerp(to, clamp01(s));
  return hangH(p, facing, 0).lerp(top, clamp01(k)).add(rel(V(), facing, -0.04, 0, 0.14).multiplyScalar(Math.sin(Math.PI * clamp01(k))));
};
/** 0 -> 1 -> 0 over a gesture: up over `inn` frames from `a`, held, down over `outn` frames ending on `b` */
const gest = (f: number, a: number, b: number, inn = 5, outn = 7) => smooth((f - a) / inn) * (1 - smooth((f - (b - outn)) / outn));
const BREATH = (f: number, hz = 0.28, amp = 0.02) => ({ dy: amp * Math.sin((2 * Math.PI * hz * f) / FPS) });

// ---------------------------------------------------------------------------------------------------------- cameras
const cam = (pos: Vec3, look: Vec3, fov = C.FOV): CamPose => ({ pos, look, fov });
const tcam = (pos: Vec3, look: Vec3, fov = C.FOV): CamPose => cam([BX + pos[0], pos[1], pos[2]], [BX + look[0], look[1], look[2]], fov);
/** the hall: her eyes as she comes in, then a step closer (his eyes in the upper third) */
const H0 = cam([0.34, 1.55, 0.55], [0.12, 0.7, -1.95]);
const H1 = cam([0.27, 1.5, -0.02], [0.12, 0.83, -1.95]);
/** the table room (x from BX) */
const TA0 = tcam([-0.3, 1.12, 0.98], [-0.15, 0.995, -0.01], 48);         // crouched at the 泰山 tableau: the tiny emperor, HIM behind
const TA1 = tcam([-0.27, 1.11, 0.86], [-0.14, 0.995, -0.06], 46);        // creeping in on the pine
const TB0 = tcam([0.5, 1.52, 1.1], [0.07, 0.6, -1.7]);                // up to HIM behind the table
// down his finger to the pine: the popped hat (and its sparkle) below the HUD row, the tiny emperor under it ABOVE the
// caption band (review: the old 34-36 deg framing put the tiny emperor at y 1550-1680, below the caption, and the hat
// at the top edge); HIM out of frame right (hidden behind his mountain below the ridge)
const TC0 = tcam([0.27, 1.46, 1.0], [-0.18, 1.06, 0.05], 46);
const TC1 = tcam([0.265, 1.45, 0.985], [-0.18, 1.058, 0.05], 45.5);         // her puzzled lean toward the hatted pine
const TB1 = tcam([0.46, 1.5, 0.95], [0.07, 0.62, -1.7]);                // E04: on him
const TX0 = tcam([0.62, 1.16, 0.98], [0.32, 0.92, 0.05], 50);           // 湘山: low over the stormy lake, the boat
const TX1 = tcam([0.3, 1.5, 1.08], [0.02, 0.62, -1.7]);                // E05: up to him
const TX2 = tcam([0.5, 1.5, 1.05], [1.78, 0.72, -0.5]);               // E06: the BOSHI
const TX3 = tcam([0.16, 1.5, 0.9], [0.0, 0.64, -1.7]);                 // E07: on him, closer
// she cranes over the mountain from its right (the shrine and the slope below the E07 card; HIM wholly out of frame to
// the right: the old view cut his robe at the top edge under the REC row)
const TX4 = tcam([0.55, 1.5, 0.15], [-0.1, 0.95, -0.45], 60);
// she backs off: the bare red mountain, HIM behind it, his face just UNDER the E07 card (y 276-564, it holds to the whip)
const TX5 = tcam([0.15, 1.48, 1.5], [0.0, 0.58, -1.7], 68);
/** the aside: she ducks beside the hall's west pillar (W1, its edge in the left of the frame; the west wall itself is
 *  in deep shadow and would read as a black block) and whispers; HIM at the desk in the back, his back to her */
const HA = cam([-1.0, 1.5, 0.12], [-0.7, 0.86, -2.5], 62);
const HE_BACK = V(-0.5, 0, -2.12);

/** the boat's tilt (sets/table.ts: the same function of the clock): the camera rolls with it */
const boatRoll = (f: number) => { const t = f / FPS; return 0.38 * Math.sin(t * 1.7) + 0.05 * Math.sin(t); };
const boatPitch = (f: number) => 0.25 * Math.sin((f / FPS) * 1.9 + 0.5);

// ---------------------------------------------------------------------------------------------------------- the hall
/** the hall's own props on their marks (as B and C dress it) */
const dressHall = (w: World) => {
  const ds = deskSeat(QHALL.desk);
  w.prop("desk").put(QHALL.desk);
  w.prop("cushion").put(ds.cushion, { rot: ds.facing });
  w.prop("inkstone").put(V(QHALL.desk.x + 0.32, QHALL.deskTop, QHALL.desk.z - 0.05));
  w.prop("scale").put(QHALL.scale, { tilt: 0.06, rot: Math.PI });
  QHALL.slips.forEach((p, i) => w.prop("slips", `t${i}`).put(p, { n: [8, 6, 10][i] }));
};

function hallShot(w: World, f: number): Pose {
  w.setPlace("hall");
  dressHall(w);
  // her eyes: she comes in calm, steps closer on 来; after the line her lens dives into the chart
  const walk: [number, number][] = [[S.from, 0], [T.come + 2, 0], [T.come + 8, 1], [T.come + 26, 0]];
  let camera = C.povCam(f, [{ f: S.from, ...H0 }, { f: T.come + 2, ...H0 }, { f: T.come + 28, ...H1 }], { mood: [[S.from, "calm"]], walk, seed: 5 });
  const facing = yawTo(HE, V(0.27, 0, -0.02));
  // the chart: held low and rolled, lifted to the chest on 来, unrolled on 上回出巡
  const y = ky(f, [[T.come, 0.82], [T.come + 9, 0.98], [T.tour, 0.98], [T.tour + 10, 1.04]]);
  const open = smooth((f - T.tour) / 12);
  const chartAt = rel(HE, facing, 0, y + 0.012 * Math.sin((2 * Math.PI * 0.3 * f) / FPS), 0.36);
  const chartO = { grip: "pair" as const, rot: facing, open };
  const hp = holdPoints("seaChart", chartAt, chartO), hands: [THREE.Vector3, THREE.Vector3] = [hp[0], hp[1]];
  // the dive: her lens pushes at the sheet, narrowing, blurring (the cut to the table is in the blur)
  let post: Pose["post"];
  if (f >= T.dive) {
    const u = easeInCubic(clamp01((f - T.dive + 1) / (T.cut - T.dive)));
    const sheet = chartAt.clone().add(V(0, -0.2, 0)), A = C.camAxes(camera);
    const p = A.p.clone().lerp(sheet.clone().add(V(0, 0.05, 0.9)), 0.55 * u);
    camera = { ...camera, pos: [p.x, p.y, p.z], look: [lerp(A.l.x, sheet.x, u), lerp(A.l.y, sheet.y, u), lerp(A.l.z, sheet.z, u)], fov: camera.fov * lerp(1, 0.55, u) };
    post = { dof: { focus: 0.05, amount: 24 * u } };
  }
  w.setCamera(camera);
  const r = w.actor(EMPEROR);
  const EX: [number, Expr][] = [[S.from, "smug"], [T.xun, "grin"], [L1.to + 4, "smug"]];
  const sp = speak(quote("di", "E01"), f, 1, [0, 5, 8]);
  r.set({
    at: HE, facing, pose: { kind: "idle", t: f / FPS + 0.3 }, hands,
    expr: at(f, EX), blink: lid(f / FPS, 1, swaps(EX)), gaze: 0,
    lookDown: ky(f, [[T.show - 2, 4], [T.show + 6, -7], [T.tour - 2, -7], [T.tour + 6, 6], [T.xun, 6], [T.xun + 6, -5]]),
    ...sp,
    head: heads(sp.head, accent("nod", f, T.come), headPop(f, T.show + 2), headPop(f, T.xun), accent("lean", f, T.xun + 3, { dur: 0.6, dir: 1, amp: 0.6 })),
    visible: true,
  });
  w.update();
  w.prop("seaChart").put(chartAt, chartO);
  const fade = 1 - smooth((f - S.from) / (T.fade - S.from));
  return {
    camera, post,
    overlays: fade > 0.002 ? h("div", { key: "warmIn", style: { position: "absolute", inset: 0, background: WARM_BLACK, opacity: fade } }) : undefined,
    slate: f < T.dive ? "E-hall 来，给你看样东西" : "E-hall dive",
  };
}

// ---------------------------------------------------------------------------------------------------------- the table
/** her eyes over the table, toTable .. back + 3 (one key list; jumps hidden in the whips) */
const TABLE_KEYS: C.CamKey[] = [
  { f: T.cut, ...TA0 },
  { f: T.rain + 10, ...TA1, ease: easeInOutCubic },
  { f: T.feng - 6, ...TA1 },
  { f: T.feng + 10, ...TB0, ease: easeInOutCubic },
  { f: T.wdf + 4, ...TB0 },
  { f: T.hatOn - 1, ...TC0, ease: easeInOutCubic },
  { f: T.e03 + 6, ...TC1 },
  { f: T.yeneng - 2, ...TC1 },
  { f: T.yeneng + 18, ...TB1, ease: easeInOutCubic },
  { f: T.swap - 1, ...TB1 },
  { f: T.swap, ...TX0, ease: () => 1 },
  { f: T.e05 + 8, ...TX0 },
  { f: T.shen + 2, ...TX1, ease: easeOutCubic },
  { f: T.e06 - 4, ...TX1 },
  { f: T.e06 + 16, ...TX2, ease: easeInOutCubic },
  { f: T.shun, ...TX2 },
  { f: T.shun + 24, ...TX3, ease: easeInOutCubic },
  { f: T.kan2 + 4, ...TX3 },
  { f: T.axes + 3, ...TX4, ease: easeInOutCubic },
  { f: T.bareEnd - 12, ...TX4 },
  { f: T.caught - 4, ...TX5, ease: easeInOutCubic },
];
const TABLE_MOOD: [number, C.Mood][] = [[T.cut, "calm"], [T.hatOn - 4, "excited"], [T.e03, "calm"], [T.swap, "excited"], [T.e07 - 6, "scared"], [T.bareEnd, "calm"]];

function tableCam(f: number): CamPose {
  let c = C.povCam(f, TABLE_KEYS, { mood: TABLE_MOOD, walk: [[T.feng - 6, 0], [T.feng, 0.5], [T.feng + 10, 0], [T.bareEnd - 12, 0], [T.bareEnd - 4, 0.6], [T.caught - 4, 0]], seed: 7, amp: 0.9 });
  // E03: her puzzled head tilt on 树……, straightened as she looks up to him
  c = C.nudge(c, { roll: 6 * smooth((f - T.e03) / 10) * (1 - smooth((f - T.yeneng) / 14)) });
  // E04: a little punch-in on 就能
  c = C.punchIn(c, f, T.neng2, { k: 0.9, len: 5, off: L4.to + 10 });
  // 湘山: she rolls with the boat (a lot down at the lake, less on him), until the storm drops
  if (f >= T.swap) {
    const k = ky(f, [[T.swap, 0.4], [T.e05 + 12, 0.4], [T.shen + 2, 0.14], [T.e07, 0.1], [T.bareEnd, 0.06], [T.caught, 0]]);
    c = C.nudge(c, { roll: k * boatRoll(f) * 57.3, pitch: k * 0.3 * boatPitch(f) * 57.3 });
  }
  // E07: she flinches back on 砍 (and again on the second), the jolt of the shout
  const fl = gest(f, T.kan1, T.axes, 3, 8);
  c = C.nudge(c, { fwd: -0.14 * fl, pitch: 1.5 * fl });
  c = C.punchIn(c, f, T.kan1, { k: 0.88, len: 4, off: T.axes });
  c = kick(c, f, T.kan1, 0.03);
  c = shake(c, f, T.kan1 + 1, 7, 2.5, 8);
  c = shake(c, f, T.kan2, 5, 2.5, 6);
  // the axes: a small jolt as she cranes over
  c = shake(c, f, T.axes, 3, 1.2, 6);
  return c;
}

function tableShot(w: World, f: number): Pose {
  w.setPlace("table");
  const xiang = f >= T.swap;
  if (!xiang) {
    w.set.param("tableau", "taishan");
    w.set.param("rain", 1);
    w.set.param("hat", clamp01((f - T.hatOn) / 23));
  } else {
    w.set.param("tableau", "xiangshan");
    w.set.param("storm", ky(f, [[T.swap, 1], [T.bareEnd - 6, 1], [T.bareEnd + 18, 0.18]]));
    w.set.param("bare", smooth((f - T.axes) / Math.max(1, T.bareEnd - T.axes)));
  }
  // the camera: the whip pan 泰山 -> 湘山 (no `to`: the keys jump on T.swap) and the whip out to the hall wall
  const base = tableCam(f);
  const W1 = C.whip(base, f, WHIP1, { dir: 1 });
  const W2 = C.whip(W1.cam, f, T.back, { dir: -1, to: HA });
  let camera = W2.cam, post: Pose["post"] = W1.post ?? W2.post;
  const smear = Math.max(W1.smear, W2.smear);
  // out of the chart's blur: the first frames over the table open from narrow and soft
  if (f < T.cut + 6) {
    const u = 1 - easeOutCubic((f - T.cut + 1) / 6);
    camera = { ...camera, fov: camera.fov * lerp(1, 0.6, u) };
    post = { dof: { focus: 0.05, amount: 24 * u } };
  }
  w.setCamera(camera);

  // ---- HIM behind the table
  const r = w.actor(EMPEROR);
  const EX: [number, Expr][] = [
    [T.cut, "smug"], [T.feng, "stern"], [T.wdf, "smug"], [T.yeneng + 4, "stern"], [T.e04, "cool"], [L4.to + 6, "smug"],
    [T.swap, "stern"], [T.e06 + 10, "focus"], [T.shun + 6, "stern"], [T.e07 - 8, "huff"], [T.caught, "nervous"], [T.away, "stern"],
  ];
  // the body turns a little toward the BOSHI while he listens; away from the lens when caught
  const facing = ky(f, [[T.e06, 0], [T.e06 + 10, 0.32], [T.shun + 10, 0.32], [T.shun + 20, 0], [T.away - 2, 0], [T.away + 8, -0.35]]);
  let hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined;
  // 封它 .. 五大夫: the decree, his right hand points at the pine
  const pt = gest(f, T.feng - 2, T.hatOn - 1, 6, 8);              // (down while her lens pans to the pine: no stray sleeve in its frame)
  // E04: the palm comes up on 就能 (it is settled)
  const palm = gest(f, T.neng2 - 3, L4.to + 12, 5, 8);
  // E05: a jab at the shrine on 什么神
  const jab = gest(f, T.shen - 6, L5.to + 6, 5, 8);
  // E07: the hand goes up in the silent beat before 砍 and chops down at the mountain on both 砍
  const chop = gest(f, T.kan1 - 7, T.axes + 10, 6, 10);
  // (the mountain hides his body below the chest: every gesture is made high, over it)
  const down = (on: number) => smooth((f - on + 1) / 3) * (1 - smooth((f - on - 6) / 6));
  // (封它: the hand goes up beside his head; 五大夫: flung out to his right, at the pine her lens then follows down)
  if (pt > 0) hands = [strike(TB, facing, pt, smooth((f - T.wdf + 1) / 4), rel(TB, facing, -0.43, 1.1, 0.2)), null];
  else if (palm > 0) hands = [reach(TB, facing, 0, rel(TB, facing, -0.55, 1.3, 0.5), palm, 0.38), null];
  else if (jab > 0) hands = [strike(TB, facing, jab, 0.8 * smooth((f - T.shen + 1) / 3)), null];
  else if (chop > 0) hands = [strike(TB, facing, chop, Math.max(down(T.kan1), down(T.kan2))), null];
  // where he looks: the lens mostly; down at the tableau while it talks of the tree; at the BOSHI while he answers
  const gaze = at(f, [[T.cut, 0], [T.e06 + 6, 1], [T.shun + 16, 0], [T.away, -1]]);
  const lookDown = ky(f, [[T.cut, 12], [T.feng - 4, 12], [T.feng + 4, -4], [T.wdf, -9], [T.hatOn + 6, 4], [T.e03, 0], [T.e04, -3],
    [T.swap, 6], [T.e05, 6], [T.shen, 2], [T.e06, 0], [T.shun, 5], [T.e07, 0], [T.axes, 10], [T.bareEnd, 6], [T.caught, 0], [T.away + 3, 6]]);
  const spk = f < T.swap
    ? (f < L3.from ? speak(quote("di", "E02"), f, 1, [0, 3, 7, 9]) : speak(quote("di", "E04"), f, 1, [2, 4]))
    : (f < L6.from ? speak(quote("di", "E05"), f, 1, [5, 8]) : speak(quote("di", "E07"), f, 1, [0, 4]));
  // the rage builds while the BOSHI explains (heavier breathing), and keeps heaving after
  const heave = gest(f, T.shun, T.away + 6, 10, 10);
  const head = heads(
    spk.head, { dy: heave * 0.06 * Math.sin((2 * Math.PI * 0.9 * f) / FPS) },
    headPop(f, T.feng), headPop(f, T.wdf, [1.14, 1.08, 1.03]), accent("nod", f, T.rain + 6),
    accent("jolt", f, T.yeneng + 4), accent("nod", f, T.neng1 + 2), headPop(f, T.neng2), accent("nod", f, T.neng2 + 2),
    accent("jolt", f, T.shen), accent("shake", f, T.kan1, { amp: 1.3 }), headPop(f, T.kan1, [1.16, 1.09, 1.03]), headPop(f, T.kan2),
    accent("squash", f, T.caught), accent("nod", f, T.away), accent("nod", f, T.away + 9),
  );
  // while she crouches at the miniature he crouches behind his mountain (hidden by it); on 封它 he rises over it
  const sink = 0.55 * (1 - smooth((f - (T.feng - 9)) / 11));
  const atT = TB.clone().add(V(0, -sink, 0));
  if (hands && hands[0]) hands = [hands[0].clone().add(V(0, -sink, 0)), null];
  r.set({
    at: atT, facing, pose: { kind: "idle", t: f / FPS + 1.7 }, ...(hands ? { hands } : {}),
    expr: at(f, EX), blink: spk.blink ?? lid(f / FPS, 1, swaps(EX)), gaze, lookDown,
    ...(spk.mouth ? { mouth: spk.mouth } : {}), head, visible: true,
  });

  // ---- the BOSHI at the table's east end (E06; listens, deadpan, the rest of the time)
  const b = w.actor(BOSHI);
  const bow = gest(f, T.e06 - 4, T.e06 + 40, 12, 12);
  const bsp = speak(quote("boshi", "E06"), f, 3, [0, 3, 8]);
  const sal = bowHead(bow, 14);
  b.set({
    at: BSH, facing: BSH_FACING, pose: { kind: "idle", t: f / FPS + 0.9 }, lookDown: sal.lookDown,
    expr: "deadpan", blink: bsp.blink ?? lid(f / FPS, 3), gaze: at(f, [[T.cut, -1], [T.e06 + 30, 0], [T.shun + 20, -1]]),
    ...(bsp.mouth ? { mouth: bsp.mouth } : {}),
    head: heads(bsp.head, sal.head, accent("nod", f, T.yao), accent("nod", f, T.shun + 4), BREATH(f, 0.22, 0.015)),
    visible: true,
  });

  // ---- the tiny emperor on 泰山, sheltering under the pine
  if (!xiang) {
    const m = w.actor(MINI);
    const mf = 0.45;
    m.set({
      at: TABLE.shelter, facing: mf, pose: { kind: "idle", t: f / FPS + 2.3 }, expr: f >= T.hatOn ? "smug" : "neutral",
      blink: lid(f / FPS, 5), gaze: at(f, [[T.cut, -1], [T.tree + 8, -1], [T.rain + 4, 0], [T.hatOn, -1]]),
      lookDown: ky(f, [[T.cut, -14], [T.rain, -14], [T.rain + 6, -4], [T.hatOn - 2, -4], [T.hatOn + 3, -22]]),
      head: heads(accent("nod", f, T.rain + 8), accent("jolt", f, T.hatOn + 1), BREATH(f, 0.3, 0.02)),
      visible: true,
    });
  }
  w.update();
  return {
    camera, post,
    overlays: smear > 0 ? C.whipSmear(smear, W2.smear > 0 ? -1 : 1) : undefined,
    slate: xiang ? "E-xiang 湘山" : "E-tai 泰山",
  };
}

// ---------------------------------------------------------------------------------------------------------- the aside
function asideShot(w: World, f: number): Pose {
  w.setPlace("hall");
  dressHall(w);
  // she whispers to the wall: leans in on 千万, glances over her shoulder on 惹陛下 (is he listening?)
  let c = C.handheld(HA, f, { mood: "scared", amp: 0.7, seed: 9 });
  const lean = gest(f, T.qian - 2, L8.to + 2, 6, 10);
  c = C.nudge(c, { fwd: 0.06 * lean, roll: -2.5 * lean, pitch: -1.2 * lean });
  const glance = gest(f, T.re - 1, T.re + 16, 5, 8);
  c = C.nudge(c, { yaw: 13 * glance });
  // arriving from the table's whip, and the whip out (the last 5 frames; F lands it)
  const W2 = C.whip(c, f, T.back, { dir: -1 });
  const W3 = C.whip(W2.cam, f, T.out, { dir: 1, out: 5 });
  const camera = W3.cam;
  w.setCamera(camera);
  // HIM in the back, still fuming: his back to her (turn 1), the shoulders heaving, a glance of the head on 惹陛下
  const r = w.actor(EMPEROR);
  r.set({
    at: HE_BACK, facing: Math.PI + 0.25, turn: 1, pose: { kind: "idle", t: f / FPS + 0.6 }, expr: "huff", blink: lid(f / FPS, 1),
    head: heads({ dy: 0.05 * Math.sin((2 * Math.PI * 0.8 * f) / FPS) }, accent("shake", f, T.qian + 4, { amp: 0.6 }), accent("jolt", f, T.re + 6)),
    visible: true,
  });
  w.update();
  const smear = Math.max(W2.smear, W3.smear);
  return {
    camera, post: W3.post ?? W2.post,
    overlays: smear > 0 ? C.whipSmear(smear, W3.smear > 0 ? 1 : -1) : undefined,
    slate: "E-aside 以后，千万别惹陛下",
  };
}

export const SEG: Segment = {
  id: "E", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose: (w, f) => (f < T.cut ? hallShot(w, f) : f < ASIDE_CUT ? tableShot(w, f) : asideShot(w, f)),
};
