// segment D, frames 1367-2002 (lines 11-15) and the loop back to f0.
//  1367  match cut: the back-wall clock exactly where segment C's dial was (rim 0.92 W wide, centre 540,760), square-on;
//        the camera pulls back and down (segD_cam.ts) to the four at eye level, the clock above them. Line 11: the worker
//        types, the three scroll (phones held at chest height, the whole phone showing); on 看得见 the worker turns to
//        YOU / mate2 and holds the look through 你出了多少力, then mate1, then sighs and types on.
//  line 12  "78项研究" + 78 page icons above the heads (segD_ov Study78): 放在一起看 = a frame round all of them,
//        结论都一样 = the same gold ✓ on every page. Gone by f1583.
//  line 13  the slide outline 小组展示 floats up (找资料 / 写讲稿 / 做PPT / 上台讲, one column above each person). On
//        单独看见 a name tag drops into each part and a line in that person's colour runs to their head; the three
//        scrollers notice their name ("!"), lift the phone, set it on the desk and lay it flat (segD_props: the drawn
//        phone becomes a real one that tips over, the hand riding it down), then write with a focused face, 10 f apart;
//        on 消失 all four work (the worker, no longer alone, is relieved).
//  line 14  a cutaway: the room dims, a clean phone slides up with the group chat of the evening they split the work
//        (周一晚上 20:15): 阿杰 asks how to split it, YOU type (keyboard up, above the caption band) and send
//        "分工：大家一起做！", replies 收到 / 收到 / 👍. The phone slides away.
//  line 15  谁出了多少力: the lines retract, the tags fly off, the done parts turn grey (the work is there, nobody can
//        tell whose); one by one the three stop writing, check nobody is looking, stand the phone up and pick it up;
//        看不见: the card leaves, the worker looks at them (sad) and types on; the camera glides back to OPEN (arrives
//        f1985, holds); the phones stay at chest height (the loop pose); from f1975 the four are exactly teamLoopState: f2002 == f0.
// The clock is animated on loopT + 12 h (animate() clamps negative times), so f2002 reads 10:42:08 like f0.
import type React from "react";
import { getInputProps } from "remotion";
import * as THREE from "three";
import type { Segment } from "../story";
import { SEGMENTS, FPS, h, spl, smooth, lerp } from "../story";
import { SEAT, acquireTeam, releaseTeam, teamLoopState, loopT, type Team } from "./common";
import type { World } from "../world";
import { EMPTY_CROWD } from "../world";
import { lidAt, type Figure, type FigState, type FxKind } from "../kit/cast";
import { dimsOf, SU, type Expr, type PoseReq } from "../kit/toon";
import { camD, CLOCK_C, CLOCK_R } from "./segD_cam";
import { Study78, SlidePlan, ChatInsert, chatUp, type PlanPart, type ChatMsg } from "./segD_ov";
import { phonesEnter, phonesExit, phonesPose, dressingEnter, dressingHidden, dressingCount, type PhoneLie } from "./segD_props";

const S = SEGMENTS.find((s) => s.id === "D")!;
const IP = getInputProps() as { dbg?: boolean };

// ---------------------------------------------------------------------------------------------------- beats (frames)
// captions: 因为人一多 1375 · 就没人【看得见】1405-1440 · 你出了多少力 1441 · 【78项】研究 1481 · 放在一起看 1516 · 结论都一样 1546 ·
// 只要每个人那份 1588 · 能被【单独看见】1629 · 划水几乎就【消失】了 1665-1733 · 可我们分工时 1741 · 最爱写的 1785 · 偏偏是 1814 ·
// 【"大家一起做"】1836-1876 · 谁出了多少力 1881 · 谁也【看不见】1925 · 所以—— 1972-2002
const B = {
  /** the worker's look on 看得见: YOU / mate2 from G (held through 你出了多少力), mate1 from G1, back to the laptop at G2 */
  glance: 1422, glance1: 1447, glanceBack: 1465,
  s78: 1483, s78together: 1518, s78same: 1548, s78out: 1576,
  card: 1592,
  /** tag landing frames, screen left to right: mate2, you, worker, mate1 */
  tags: [1631, 1636, 1641, 1646],
  /** 消失: everyone works */
  gone: 1703,
  /** the scrollers start putting the phone down (P) */
  put: { mate2: 1652, you: 1662, mate1: 1672 },
  chat: { in0: 1734, in1: 1746, out0: 1869, out1: 1881, kb0: 1781, kb1: 1789, type0: 1790, type1: 1830, send: 1837 },
  /** lines retract / tags fly off, same order as tags */
  off: [1886, 1890, 1894, 1898],
  /** the scrollers have the phone back in hand (Q) */
  pick: { mate2: 1904, you: 1914, mate1: 1924 },
  cardOut: 1922,
  /** the worker looks at them again (看不见) */
  glance2: 1936,
  /** the phones rise to the kit's loop pose (under the chin) and the pose switches to it */
  rise0: 1950, rise1: 1961,
  loop: 1975,                                           // from here: teamLoopState exactly
};
const MSGS: ChatMsg[] = [
  { at: 1750, who: "worker", text: "这次展示怎么分工？" },
  { at: B.chat.send, who: "you", text: "分工：大家一起做！" },
  { at: 1843, who: "mate2", text: "收到" },
  { at: 1849, who: "mate1", text: "收到" },
  { at: 1855, who: "worker", thumb: true },
];

// ---------------------------------------------------------------------------------------------------- acting helpers
/** keyframes with a smooth ease inside each interval */
const ky = (f: number, keys: [number, number][]) => spl(keys, f, smooth);
const exprAt = (f: number, keys: [number, Expr][]) => { let e = keys[0][1]; for (const [k, x] of keys) if (f >= k) e = x; return e; };
/** blink on teamLoopState's clock (loopT + 50), plus a blink across each expression swap */
const lid = (f: number, id: number, keys: [number, Expr][]) => lidAt(loopT(f) + 50, id, keys.slice(1).map(([k]) => loopT(k) + 50));
const fxAt = (f: number, kind: FxKind, at: number, out: number): { kind: FxKind; t: number }[] => {
  if (f < at || f >= out + 5) return [];
  if (f < out) return [{ kind, t: (f - at) / FPS }];
  return [{ kind, t: 0.2 * (1 - (f - out + 1) / 5) }];
};
/** the idle extras fade out over f1950-1975 so the hand-off into teamLoopState is exact */
const rEnd = (f: number) => 1 - smooth((f - (B.loop - 25)) / 25);
/** phone scrolling (as segA): the eyes hop up a touch every ~1.6 s and drift back; the head sways slowly */
const scrollEyes = (t: number, seed: number) => {
  const per = 1.45 + 0.35 * seed, x = (((t + seed * 0.9) % per) + per) % per / per;
  return 0.09 * (x < 0.12 ? smooth(x / 0.12) : 1 - smooth((x - 0.12) / 0.5));
};
const sway = (t: number, seed: number) => 1.6 * Math.sin(t * 1.3 + seed * 2.1) + 0.7 * Math.sin(t * 2.9 + seed);
/** a scrolling thumb flick every ~1.5 s (as segA): the phone bobs a touch */
const flick = (t: number, off: number) => { const x = ((((t + off) % 1.5) + 1.5) % 1.5) / 1.5; return x < 0.1 ? Math.sin((x / 0.1) * Math.PI) : 0; };

type Who = "mate1" | "you" | "mate2";
type Aim = { dir: number; reach: number };
/** hold aims (kit hold pose, arm 1 = canvas right), solved from the cast's measured shoulders / arm lengths:
 *  REST  scrolling: the phone in front of the chest, its bottom edge on the desk line (hand y 0.80), the whole phone shows
 *  LIFT  2.5 cm higher (the anticipation before setting it down, the bob after picking it up)
 *  LOW   the hand down on the desk top at the phone's x (riding the phone as it tips flat / stands up)
 *  DESK  where the desk pose puts hand 1 (so hold <-> desk switches do not jump)
 *  CHIN  where the kit phone pose (teamLoopState) holds it, at lean 0 (the hand-off into the loop) */
const AIMS: Record<Who, { REST: Aim; LIFT: Aim; LOW: Aim; DESK: Aim; CHIN: Aim; x: number }> = {
  you: { REST: { dir: -151.6, reach: 0.52 }, LIFT: { dir: -158.5, reach: 0.491 }, LOW: { dir: -143.2, reach: 0.57 }, DESK: { dir: -130.1, reach: 0.446 }, CHIN: { dir: -183.3, reach: 0.374 }, x: 0.126 },
  mate1: { REST: { dir: -155.7, reach: 0.502 }, LIFT: { dir: -163.2, reach: 0.478 }, LOW: { dir: -146.5, reach: 0.549 }, DESK: { dir: -133.1, reach: 0.415 }, CHIN: { dir: -183.4, reach: 0.3725 }, x: -1.196 },
  mate2: { REST: { dir: -146.3, reach: 0.548 }, LIFT: { dir: -152.7, reach: 0.513 }, LOW: { dir: -138.7, reach: 0.607 }, DESK: { dir: -129.4, reach: 0.518 }, CHIN: { dir: -182.9, reach: 0.437 }, x: 0.756 },
};
const mixAim = (a: Aim, b: Aim, k: number): Aim => ({ dir: lerp(a.dir, b.dir, k), reach: lerp(a.reach, b.reach, k) });
/** the body's total lean (deg) is kept at LEAN through every pose switch (the kit adds 2 for desk, 7 for write and
 *  -3 cos(dir) for hold: compensated), so the head never jumps sideways; it eases to 0 for the loop's phone pose */
const LEAN = 2.6;

/** the phone on the desk as scrollerAct sees it (actScroller adds the sitter's scale; pose() the card's mirror) */
type Lie0 = { x: number; tip: number; glow: number; hand: boolean } | null;
type Act = { pose: PoseReq; lie: Lie0; phase: "scroll" | "put" | "work" | "pick" | "rise" };
/** a scroller's body and phone at f. P: put-down start, Q: phone back in hand */
function scrollerAct(who: Who, f: number, P: number, Q: number, t: number, r: number): Act {
  const A = AIMS[who];
  const hold = (aim: Aim, phone: boolean, E = LEAN): PoseReq =>
    ({ kind: "hold", t, base: "seat", aim: [null, aim], props: [null, phone ? "phone" : null], lean: E + 3 * Math.cos((aim.dir * Math.PI) / 180) });
  const desk = (): PoseReq => ({ kind: "desk", t, lean: LEAN - 2 });
  // writing leans 1.5 deg into the writing hand, eased in (no jump)
  const write = (k: number): PoseReq => ({ kind: "write", t, lean: LEAN + 1.5 * k - 7 });
  // the screen: lit as it is laid down, it sleeps ~1.5 s later; tapped awake as the hand reaches for it (Q-6)
  const glow = f >= Q - 16 ? (f >= Q - 6 ? smooth((f - Q + 6) / 2) : 0) : 1 - smooth((f - P - 40) / 20);
  const scrolling = (E = LEAN): PoseReq => { const fl = flick(t, A.x) * r; return hold({ dir: A.REST.dir + 3 * fl, reach: A.REST.reach - 0.02 * fl }, true, E); };
  // ---- the put-down: lift (anticipation), down to the desk line, tip flat with the hand riding it, hands on the desk, write
  if (f >= P && f < Q - 16) {
    if (f < P + 4) return { pose: hold(mixAim(A.REST, A.LIFT, smooth((f - P) / 4)), true), lie: null, phase: "put" };
    if (f < P + 7) return { pose: hold(mixAim(A.LIFT, A.REST, smooth((f - P - 4) / 3)), true), lie: null, phase: "put" };
    if (f < P + 12) { const k = smooth((f - P - 7) / 5); return { pose: hold(mixAim(A.REST, A.LOW, k), false), lie: { x: A.x, tip: k, glow, hand: true }, phase: "put" }; }
    const lie = { x: A.x, tip: 1, glow, hand: false };
    if (f < P + 14) return { pose: hold(mixAim(A.LOW, A.DESK, smooth((f - P - 12) / 2)), false), lie, phase: "put" };
    if (f < P + 18) return { pose: desk(), lie, phase: "put" };
    return { pose: write(smooth((f - P - 18) / 6)), lie, phase: "work" };
  }
  // ---- the pick-up: stop writing (Q-16), a look round (desk), the hand to the phone (Q-6), stand it up (Q-4), in hand
  if (f >= Q - 16 && f < Q + 6) {
    const lie = { x: A.x, tip: 1, glow, hand: false };
    if (f < Q - 6) return { pose: desk(), lie, phase: "pick" };
    if (f < Q - 4) return { pose: hold(mixAim(A.DESK, A.LOW, smooth((f - Q + 6) / 2)), false), lie, phase: "pick" };
    if (f < Q) { const k = smooth((f - Q + 4) / 4); return { pose: hold(mixAim(A.LOW, A.REST, k), false), lie: { x: A.x, tip: 1 - k, glow, hand: true }, phase: "pick" }; }
    if (f < Q + 3) return { pose: hold(mixAim(A.REST, A.LIFT, smooth((f - Q) / 3)), true), lie: null, phase: "pick" };
    return { pose: hold(mixAim(A.LIFT, A.REST, smooth((f - Q - 3) / 3)), true), lie: null, phase: "pick" };
  }
  // ---- the hand-off: the loop pose (common.ts teamLoopState) is this same chest hold at REST; the idle extras (flick)
  //      fade with r, so from B.loop the pose equals teamLoopState exactly
  if (f >= B.rise0) return { pose: scrolling(), lie: null, phase: "rise" };
  return { pose: scrolling(), lie: null, phase: "scroll" };
}

// expressions (frames). The scrollers: key-word reactions while scrolling; "!" when their name lands; a nervous beat
// while setting the phone down; focused ("focus": lids down to the page, brows a little knit) while writing; line 15: the sly look round
// the worker: on 看得见 a short huff (the "o" mouth reads at this size) settling into stern; on 看不见 sad, then a sigh
// (closed eyes, "o" mouth) as he turns back, stern again for the loop (teamLoopState)
const WORKER_EX: [number, Expr][] = [[0, "neutral"], [B.glance, "huff"], [B.glance + 9, "stern"], [B.glanceBack + 1, "sigh"], [B.glanceBack + 16, "neutral"], [1551, "sigh"], [1574, "neutral"],
  [B.tags[2] + 5, "relief"], [B.tags[2] + 24, "neutral"], [B.gone, "relief"], [B.gone + 22, "neutral"], [B.off[2] + 2, "stern"], [B.glance2 + 1, "sad"], [B.glance2 + 12, "sigh"], [B.glance2 + 20, "stern"]];
const youEx = (P: number, Q: number): [number, Expr][] => [[0, "smug"], [1442, "grin"], [1466, "smug"], [1530, "happy"], [1556, "smug"],
  [P - 6, "shock"], [P + 2, "nervous"], [P + 12, "focus"], [Q - 14, "smug"], [Q - 4, "smug"]];
const mate1Ex = (P: number, Q: number): [number, Expr][] => [[0, "happy"], [1386, "laugh"], [1404, "happy"], [1494, "laugh"], [1511, "happy"],
  [P - 6, "shock"], [P + 2, "nervous"], [P + 12, "focus"], [Q - 14, "whistle"], [Q + 2, "happy"]];
const mate2Ex = (P: number, Q: number): [number, Expr][] => [[0, "deadpan"], [1452, "grin"], [1480, "deadpan"], [1534, "smug"], [1558, "deadpan"],
  [P - 6, "shock"], [P + 2, "nervous"], [P + 12, "focus"], [Q - 14, "smug"], [Q + 2, "deadpan"]];
const SEED: Record<Who, number> = { you: 0.3, mate1: 0.7, mate2: 1.3 };
const OFF: Record<Who, number> = { you: 0, mate1: 0.7, mate2: 1.3 };
/** the look round before the pick-up (toward the worker: + = screen right) */
const SLY: Record<Who, number> = { you: 0.8, mate1: -0.8, mate2: 0.7 };

function actScroller(w: World, fig: Figure, who: Who, f: number): PhoneLie {
  const t = loopT(f), r = rEnd(f), P = B.put[who], Q = B.pick[who], tt = t + OFF[who];
  const ex = who === "you" ? youEx(P, Q) : who === "mate1" ? mate1Ex(P, Q) : mate2Ex(P, Q);
  const expr = exprAt(f, ex);
  const act = scrollerAct(who, f, P, Q, tt, r);
  const onPhone = act.phase === "scroll" || act.phase === "rise";
  // eyes: scrolling hops on the phone; P: a dip (anticipation), up at the card ("!"), down to the phone as it goes down,
  // to the desk; writing: down, focused; Q: up and a look round, then down to the phone
  let lookUp: number | undefined = onPhone ? -0.85 + scrollEyes(t, SEED[who]) * r : act.phase === "work" ? -1.0 : -0.9;
  if (f >= P - 10 && f < P + 20) lookUp = ky(f, [[P - 10, -0.85], [P - 8, -1.0], [P - 5, 0.15], [P - 1, 0.15], [P + 3, 0.05], [P + 7, -0.75], [P + 12, -0.95], [P + 18, -0.95], [P + 20, -1.0]]);
  if (f >= Q - 18 && f < Q + 8) lookUp = ky(f, [[Q - 18, -1.0], [Q - 14, -0.45], [Q - 11, 0.05], [Q - 7, 0.05], [Q - 4, -0.8], [Q, -0.95], [Q + 3, -0.8], [Q + 8, -0.85]]);
  const look = f >= Q - 14 && f < Q - 3 ? ky(f, [[Q - 14, 0], [Q - 12, -0.25 * Math.sign(SLY[who])], [Q - 10, SLY[who]], [Q - 6, SLY[who]], [Q - 3, 0]]) : undefined;
  const laughing = expr === "laugh";
  const lk = ex.filter(([k, e]) => e === "laugh" && k <= f).pop()?.[0] ?? f;
  // head: a slow sway while scrolling; a writing nod (+-2 deg at 2 Hz) while writing; the "!" jolt; the lift's tilt
  const wk = f >= P + 18 && f < Q - 12 ? smooth((f - P - 18) / 6) * (1 - smooth((f - Q + 16) / 4)) : 0;
  let tilt = (onPhone ? sway(t, SEED[who]) : 0) * r + 2 * Math.sin(tt * Math.PI * 2 * 2) * wk + (laughing ? 2.6 * Math.sin((f - lk) * 0.9) : 0);
  if (f >= P - 6 && f < P + 18) tilt += ky(f, [[P - 6, 0], [P - 5, 3], [P - 2, 2], [P, 0], [P + 3, -2], [P + 7, 1.5], [P + 12, -1], [P + 18, 0]]);
  if (f >= Q - 16 && f < Q + 6) tilt += ky(f, [[Q - 16, 0], [Q - 14, 1.5], [Q - 10, -1], [Q - 4, 0], [Q, 1.5], [Q + 6, 0]]);
  const fx = fxAt(f, "!", P - 6, P + 6);
  const C = w.classroom;
  fig.set({ ...C.seatOf(SEAT[who]), pose: { ...act.pose, headTilt: tilt }, expr, blink: lid(f, SEAT[who], ex), lookUp, look, fx, visible: true } as FigState);
  // the desk phone at the drawn phone's scale (the kit draws it in this sitter's head heights)
  return act.lie ? { ...act.lie, hh: dimsOf(fig.look).HH * SU, mirror: false } : null;
}

function actWorker(w: World, fig: Figure, f: number) {
  const t = loopT(f), r = rEnd(f), C = w.classroom;
  // typing (as segA): the eyes run along a line of the laptop screen and snap back; a small typing bob
  const per = 1.25, x = (((t % per) + per) % per) / per, run = x < 0.82 ? x / 0.82 : 1 - smooth((x - 0.82) / 0.18);
  let look = r * (-0.35 + 0.7 * run), lookUp = -0.45;
  let tilt = r * (1.1 * Math.sin(t * Math.PI * 2 * 1.9) + 0.8 * Math.sin(t * 1.1));
  let faceTurn: -1 | 0 | 1 = 0;
  const G = B.glance, G1 = B.glance1, GB = B.glanceBack, G2 = B.glance2, T3 = B.tags[2] + 4;
  // 看得见: a flick of the eyes the other way, then he turns to YOU / mate2 (screen left) and holds it through
  // 你出了多少力 (they are on their phones), then mate1 (screen right), then a sigh and back to the laptop
  if (f >= G - 3 && f < GB + 8) {
    const g = ky(f, [[G - 3, 0], [G, 1], [GB, 1], [GB + 6, 0]]);
    const gl = ky(f, [[G - 3, 0], [G - 1, 0.35], [G + 2, -1], [G1 - 1, -1], [G1 + 3, 1], [GB, 1], [GB + 5, 0]]);
    // the eyes come up to them (lookUp 0.2) and the head leans well into each look (10 deg, a 2-frame overshoot settle)
    look = lerp(look, gl, g); lookUp = lerp(lookUp, 0.2, g);
    tilt = lerp(tilt, ky(f, [[G - 3, 0], [G - 1, 1.5], [G + 3, -11.5], [G + 5, -10], [G1 - 1, -10], [G1 + 3, 11.5], [G1 + 5, 10], [GB, 10], [GB + 3, 3], [GB + 7, 0]]), g);
    faceTurn = f >= G + 1 && f < G1 + 1 ? -1 : f >= G1 + 1 && f < GB + 2 ? 1 : 0;
  }
  // his tag lands: he looks up at the plan, relieved
  if (f >= T3 - 3 && f < T3 + 20) {
    const g = ky(f, [[T3 - 3, 0], [T3, 1], [T3 + 15, 1], [T3 + 19, 0]]);
    look = lerp(look, 0, g); lookUp = lerp(lookUp, 0.15, g);
  }
  // 看不见: he turns to YOU / mate2, back on their phones, sad, holds it, then back to typing
  if (f >= G2 - 3 && f < G2 + 22) {
    const g = ky(f, [[G2 - 3, 0], [G2, 1], [G2 + 16, 1], [G2 + 21, 0]]);
    look = lerp(look, ky(f, [[G2 - 3, 0], [G2 - 1, 0.3], [G2 + 2, -1], [G2 + 21, -1]]), g); lookUp = lerp(lookUp, -0.1, g);
    tilt = lerp(tilt, ky(f, [[G2 - 3, 0], [G2 - 1, 1.2], [G2 + 3, -11.5], [G2 + 5, -10], [G2 + 16, -10], [G2 + 21, 0]]), g);
    faceTurn = f >= G2 + 1 && f < G2 + 18 ? -1 : 0;
  }
  // a sweat drop with the sigh after the 78 studies, and with the sad look on 看不见 (it separates sad from stern)
  const fx = [...fxAt(f, "sweat", 1553, 1578), ...fxAt(f, "sweat", G2 + 4, G2 + 18)].map((e) => ({ ...e, s: 0.68, dy: 0.2 }));   // (segA's sweat size: at the temple, not oversized)
  fig.set({ ...C.seatOf(SEAT.worker), pose: { kind: "desk", t, headTilt: tilt }, expr: exprAt(f, WORKER_EX), blink: lid(f, SEAT.worker, WORKER_EX),
    look, lookUp, faceTurn: faceTurn || undefined, fx, visible: true } as FigState);
}

// ---------------------------------------------------------------------------------------------------- the plan card
/** the card's column centres: over the four heads in the hold framing (CAM_B: heads at x ~153 / 418 / 695 / 954), pulled
 *  in where a box would leave the card (x 44..1036, boxes 212 wide); screen left to right */
const COL_X = [160, 420, 690, 925];
const PLAN: { who: keyof Team; label: string; name: string; col: string }[] = [
  { who: "mate2", label: "找资料", name: "小雨", col: "#d9a832" },
  { who: "you", label: "写讲稿", name: "你", col: "#3567b8" },
  { who: "worker", label: "做PPT", name: "阿杰", col: "#5d9b5a" },
  { who: "mate1", label: "上台讲", name: "大刘", col: "#f08a3c" },
];

/** a part fills while its person works on it, from when they start writing (the worker: when his name lands) until the
 *  end of line 13; it holds under the phone insert and turns grey with the tags in line 15 (done, but nobody's) */
const WORK_END = 1733, FILL_RATE = 1 / 140;
const doneAt = (who: keyof Team, f: number) => {
  const start = who === "worker" ? B.tags[2] + 6 : B.put[who as Who] + 18;
  return Math.max(0, Math.min(f, WORK_END) - start) * FILL_RATE;
};

// ---------------------------------------------------------------------------------------------------- segment
let T: Team | null = null;
const hv = new THREE.Vector3();
export const SEG: Segment = {
  id: "D", from: S.from, to: S.to,
  enter(w) {
    T = acquireTeam(w);
    phonesEnter(w);
    dressingEnter(w, [SEAT.mate1, SEAT.worker, SEAT.you, SEAT.mate2]);
    // the match cut is solved on segD_cam's clock constants: say so loudly if the set's clock moved
    const bc = w.classroom.set.backClock;
    if (Math.hypot(bc.centre.x - CLOCK_C[0], bc.centre.y - CLOCK_C[1], bc.centre.z - CLOCK_C[2]) > 0.002 || Math.abs(bc.radius - CLOCK_R) > 0.002)
      console.error(`[segD] backClock moved: set (${bc.centre.x}, ${bc.centre.y}, ${bc.centre.z}) r ${bc.radius} vs segD_cam CLOCK_C ${CLOCK_C} r ${CLOCK_R}: the f1367 match cut is off`);
  },
  exit(w) { releaseTeam(w, T); T = null; phonesExit(); dressingHidden(false); void w; },
  pose(w, f) {
    const cam = camD(f);
    w.setCamera(cam);
    const up = chatUp(f, B.chat.in0, B.chat.in1, B.chat.out0, B.chat.out1);
    const chat = up > 0 ? h(ChatInsert, { key: "chat", f, ...B.chat, msgs: MSGS, draft: "分工：大家一起做！" }) : null;
    if (up >= 1) return { scene: "phone2d", camera: cam, overlays: chat };   // the phone covers the frame: no 3D

    const C = w.classroom, team = T!;
    C.set.animate(loopT(f) + 12 * 3600);
    C.set.objects.heroSheet.visible = false; C.set.objects.heroPen.visible = false;
    C.crowd.state = EMPTY_CROWD;
    // the set's desk phones on the four's desks: hidden until the insert (restored while the room is not drawn)
    dressingHidden(f < B.chat.out0);
    teamLoopState(w, team, f);
    const lies: PhoneLie[] = [null, null, null];
    if (f < B.loop) {
      actWorker(w, team.worker, f);
      lies[0] = actScroller(w, team.you, "you", f); lies[1] = actScroller(w, team.mate1, "mate1", f); lies[2] = actScroller(w, team.mate2, "mate2", f);
    }
    C.update(loopT(f));
    // after the cast update (the cards are placed): a mirrored card draws the camera bump screen right
    ([team.you, team.mate1, team.mate2] as Figure[]).forEach((F, i) => { const l = lies[i]; if (l) l.mirror = F.mesh.scale.x < 0; });
    phonesPose(lies);

    // overlays
    const ov: React.ReactNode[] = [];
    if (f >= B.s78 && f <= B.s78out + 7) ov.push(h(Study78, { key: "s78", f, at: B.s78, together: B.s78together, same: B.s78same, out: B.s78out, x: 540, y: 330 }));
    if (f >= B.card && f <= B.cardOut + 7) {
      const parts: PlanPart[] = PLAN.map((p, i) => {
        const fig = team[p.who], hw = fig.headWorld(hv), q = w.project(hw);
        const r = (fig.headR / Math.max(0.1, q.z)) * (1920 / (2 * Math.tan((cam.fov * Math.PI) / 360)));
        return { label: p.label, name: p.name, col: p.col, x: COL_X[i], head: { x: q.x, y: q.y, r }, tagAt: B.tags[i], offAt: B.off[i], done: doneAt(p.who, f) };
      });
      ov.push(h(SlidePlan, { key: "plan", f, at: B.card, out: B.cardOut, top: 230, parts }));
    }
    if (chat) ov.push(chat);

    if (IP.dbg) {
      const row = (n: string, F: Figure) => { const p = F.headWorld(); const q = w.project(p); return `${n} head (${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}) -> ${q.x.toFixed(0)},${q.y.toFixed(0)} r ${(F.headR / q.z * 1920 / (2 * Math.tan((cam.fov * Math.PI) / 360))).toFixed(0)}px ${F.sv?.view} h1 ${F.handWorld(1).toArray().map((v) => v.toFixed(3))}`; };
      const ck = w.project(C.set.backClock.centre), ce = w.project(C.set.backClock.centre.clone().add(new THREE.Vector3(C.set.backClock.radius, 0, 0)));
      console.log(`[segD] f${f} clock ${ck.x.toFixed(1)},${ck.y.toFixed(1)} d ${(2 * Math.abs(ce.x - ck.x)).toFixed(1)} dressing ${dressingCount()} | ${row("mate2", team.mate2)} | ${row("you", team.you)} | ${row("worker", team.worker)} | ${row("mate1", team.mate1)} | lies ${JSON.stringify(lies)}`);
    }
    const post = up > 0 ? { dof: { focus: 0.4, amount: 16 * up } } : undefined;
    return { scene: "classroom", camera: cam, overlays: ov.length ? h("div", { style: { position: "absolute", inset: 0 } }, ...ov) : undefined, post };
  },
};
