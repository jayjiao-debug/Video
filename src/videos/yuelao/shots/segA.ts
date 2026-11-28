// SCENE A · 08:00, 天庭姻缘司. THE COLD OPEN (v6: rebuilt after the owner's notes 4, 5, 6, 7 and 8 on v5). She pushes the
// door open on a small old god waist-deep in a heap of tangled red cord, three-quarters on to her, working a knot
// between his hands. 「月老？您被线绑架了？」 He FREEZES: the hands stop dead, only his eyes slide to her, and on 绑架 his
// head comes round. 「别动！一动，三对离婚。」 While his name comes down on his jade token (no freeze card: viewers scroll away
// on it) he goes back to the knot and, holding his breath, draws it tight... it SNAPS in his hands, and three paper 囍
// tear in two (三对离婚, said in his world's own sign). His eyes find her lens: someone saw that. 「等等……您是天庭派来考核
// 的吧？」 He wades out of the heap to her, wringing his hands, nodding before she can finish; 「懂！暗访。」 he leans in
// and checks left and right like a conspirator; 「您记，随便记。」 a bow, then one sweep of the arm presents his bureau, and
// the title comes down over the room while he strokes his beard, pleased with himself. No walk: scene B opens at the desk.
// GONE FOR GOOD from v5: the thread in his teeth (note 4: nobody would get it), the raised finger and the hush (note 7),
// the trot to the desk (note 8), the freeze card (note 5), the 「离婚 +3」 花字 (note 6).
// HIS FACES, one per thought (9 in 21 s; note 4): the knot (peer) · caught: don't move (warn) · back to the knot (peer) ·
// it snaps (panic) · her lens (suspicious) · the inspector! (fawn) · I get it (sly) · write anything (fawn) · my bureau
// (proud). His hands do his tics: still as stone at the freeze, wringing while he fawns, the beard stroke when pleased.
// CAMERA PLAN (her eyes, one take; 21 s, seven moves):
//   open     LOOK AT a red heap with a small old god in it   wide, a little above                she walks in from the door (the bob)
//   A01      him freezing: the eyes, then the head          medium wide                         she stops: still
//   A02      his face on 「三对离婚」                         close (snap zoom, 30 % tighter)      lands on 三, held to the end of the line
//   token    the knot in his hands; the token on the right  medium, he is low on the left       eased back out after the line, held
//   snap     the cord parting, the three 囍 tearing          the same                            one kick on the snap
//   A03      his face as he comes to her lens               medium close                        a slow push as he looks at her; she gives way half a step as he wades up
//   A05      the conspirator, the bow                        medium close                        a small tilt down with the bow
//   title    the bureau, and him presenting it               wide                                she steps back: the room, with the title on it
import * as THREE from "three";
import { seg, TITLE_BLOCK, type Segment } from "../story";
import { punchIn } from "../cam";
import { TOKEN } from "../fx";
import { OFFICE } from "../places";
import { P, startOf, endOf, wordAt, ky, rel, V, walkAlong, kick, VERBS, smooth, shotCam, faceTo, type ShotKey } from "./kit";
import { act, YL, stroke, offer, type MoodKey } from "./act";
import { droop, recoil, limp, lay, FLAT } from "./thread";
import { tornXi, draw, type Fx } from "./fx";

const S = seg("A");
/** NEAR: where he stops when he has waded out, a clear step beyond the heap's outer coils (1 m from its middle) */
const HEAP = P("office", OFFICE.tangle.x, 0, OFFICE.tangle.z), NEAR = P("office", -0.22, 0, 1.46);
/** how he stands in the heap when she walks in: three-quarters on to the door, bent over his knot (his face and the knot
 *  in his hands both read: a full profile hid them) */
const PROFILE = -0.35;
/** where he faces her from once he is out of the heap (her lens is about at x 0.24, z 3.3 then) */
const TO_HER = faceTo(NEAR, P("office", 0.24, 0, 3.3));
/** THE MOUND under the heap's cord (sets/office.ts THE TANGLE: half an ellipsoid a wide and b high, its height scaled by
 *  0.8 + 0.2 x the tangle param): the point just inside its surface over p, where a cord comes up out of the heap */
const MOUND = { a: OFFICE.tangle.r * 0.8, b: OFFICE.tangle.h * 0.86 };
const onHeap = (p: THREE.Vector3, k: number, sink = 0.025) => {
  const r = Math.hypot(p.x - HEAP.x, p.z - HEAP.z) / MOUND.a;
  return V(p.x, Math.max(0.01, MOUND.b * (0.8 + 0.2 * k) * Math.sqrt(Math.max(0, 1 - r * r)) - sink), p.z);
};
/** the cord he is working comes up out of the heap in front of him on either side (fixed in the heap, whatever he does) */
const FROM_R = rel(HEAP, PROFILE, -0.26, 0, 0.42), FROM_L = rel(HEAP, PROFILE, 0.28, 0, 0.4);
/** his hands' working place: in front of his belly and well out from it (clear of the beard that hangs over his chest) */
const HANDS_Y = 0.62, HANDS_Z = 0.34;
/** THE KNOT on the cord between his hands: a lump of wraps round its middle (a tight helix), rr = how fat it is */
const knotLump = (a: THREE.Vector3, b: THREE.Vector3, sag: number, rr: number): THREE.Vector3[] => {
  const mid = a.clone().lerp(b, 0.5).add(V(0, -sag, 0)), dir = b.clone().sub(a).normalize();
  const up = V(0, 1, 0).addScaledVector(dir, -dir.y).normalize(), out = dir.clone().cross(up).normalize(), L = 0.04, turns = 3, pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 30; i++) { const u = i / 30, th = u * turns * Math.PI * 2; pts.push(mid.clone().addScaledVector(dir, (u - 0.5) * L).addScaledVector(up, Math.cos(th) * rr).addScaledVector(out, Math.sin(th) * rr)); }
  return pts;
};
/** the cord between his hands, sagging by `sag` in the middle */
const between = (a: THREE.Vector3, b: THREE.Vector3, sag: number): THREE.Vector3[] => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 8; i++) { const u = i / 8; pts.push(a.clone().lerp(b, u).add(V(0, -sag * 4 * u * (1 - u), 0))); }
  return pts;
};

/** a hand's place in front of him, `deg` degrees round from straight ahead toward its own side, r m out from his middle,
 *  y high: hands that go between places go ROUND his robe this way (a straight line from his side to his front cut
 *  through the cloth) */
const round = (at: THREE.Vector3, facing: number, side: -1 | 1, deg: number, r: number, y: number) => { const a = (deg * Math.PI) / 180; return rel(at, facing, side * r * Math.sin(a), y, r * Math.cos(a)); };
/** his hands at rest after the snap: low, out to the sides of his front, clear of the robe */
const LOW_DEG = 45, LOW_R = 0.31, LOW_Y = 0.6;
/** HE WRINGS HIS HANDS (act.ts wring) low and well out in front, so the beard that hangs over his chest never hides them;
 *  they come in from the low rest round the robe */
const wringOut = (at: THREE.Vector3, facing: number, f: number, k: number): [THREE.Vector3, THREE.Vector3] | undefined => {
  if (k <= 0.01) return undefined;
  const a = f * 0.42, e = smooth(k), hand = (side: -1 | 1, ph: number) => {
    const deg = LOW_DEG + (9 - LOW_DEG) * e, r = LOW_R + (0.314 - LOW_R) * e, y = LOW_Y + (0.56 - LOW_Y) * e;
    return round(at, facing, side, deg, r, y).add(V(0, 0.016 * Math.sin(a + ph) * e, 0)).add(rel(V(0, 0, 0), facing, side * 0.014 * Math.cos(a) * e * -1, 0, 0));
  };
  return [hand(-1, 0), hand(1, Math.PI)];
};

export const SEG: Segment = {
  id: "A", from: S.from, to: S.to,
  enter() {}, exit() {},
  pose(w, f) {
    w.setPlace("office");
    // ---------------------------------------------------------------------------------------------- the beats
    const a01 = startOf("A01"), name = wordAt("A01", "月老"), bang = wordAt("A01", "绑架");
    const a02 = startOf("A02"), three = wordAt("A02", "三对"), e02 = endOf("A02");
    const a03 = startOf("A03"), you = wordAt("A03", "您是");
    const a04 = startOf("A04"), e04 = endOf("A04");
    const a05 = startOf("A05"), sneak = wordAt("A05", "暗访"), write = wordAt("A05", "您记"), any = wordAt("A05", "随便"), e05 = endOf("A05");
    const T0 = TITLE_BLOCK.from;
    const freeze = name + 1;                                  // the hands stop dead on 月老
    const eyes = freeze + 7;                                  // only his eyes slide to her
    const turnA = bang + 2, turnA1 = turnA + 11;              // on 绑架 his head and shoulders come round
    const back0 = e02 + 3, back1 = back0 + 9;                 // back to the knot as the token comes down
    const snap = TOKEN.from + 40;                             // the cord parts (the token has been up a second and a half)
    const look = snap + 20;                                   // his eyes come up from the broken cord to her lens
    const wade0 = you - 4;                                    // out of the heap to her on 您是天庭派来考核的吧
    const nods = ["我", "其", "实", "是"].map((c) => wordAt("A04", c) + 1);
    const bow0 = write - 4, bow1 = any + 2, sweep0 = any + 4, sweep1 = e05 + 6, strokeAt = e05 + 16;
    const tangle = ky(f, [[snap, 1], [snap + 6, 0.84], [wade0, 0.84], [wade0 + 34, 0.6], [S.to, 0.5]]);
    w.set.param("tangle", tangle);
    // ---------------------------------------------------------------------------------------------- where he is
    const wadeAt = (g: number) => walkAlong([HEAP, NEAR], 0.72, (g - wade0) / 30, { endFacing: TO_HER });
    const posAt = (g: number) => (g < wade0 ? HEAP.clone() : wadeAt(g).at);
    const HEAD = (g: number) => posAt(g).add(V(0, 1.05, 0)), BOWED = (g: number) => posAt(g).add(V(0, 0.86, 0));
    // ---------------------------------------------------------------------------------------------- the camera
    const SNAPPED = { pos: [0.4, 1.5, 2.8], at: HEAD, sx: 320, sy: 1135, fov: 58 };
    const UP = { pos: [0.24, 1.5, 3.3], at: HEAD, sx: 540, sy: 840, fov: 60 };     // (medium: his nods, his wringing hands and the bow all read above the subtitles)
    const keys: ShotKey[] = [
      { f: S.from, pos: [0.22, 1.52, 3.3], at: HEAD, sx: 430, sy: 860, fov: 60 },               // the door: the heap, the room above it
      { f: a01 - 6, pos: [0.12, 1.5, 2.5], at: HEAD, sx: 470, sy: 820, fov: 54 },               // she stops
      { f: e02 + 2, pos: [0.12, 1.5, 2.5], at: HEAD, sx: 470, sy: 820, fov: 54 },
      { f: e02 + 16, ...SNAPPED }, { f: snap + 14, ...SNAPPED },                                  // him low on the left, the token on the right
      { f: a03 + 22, pos: [0.3, 1.5, 2.5], at: HEAD, sx: 500, sy: 860, fov: 48 },               // the slow push: someone saw that
      { f: wade0 + 42, ...UP }, { f: bow0, ...UP },                                               // she gives way half a step as he comes up
      { f: bow0 + 12, ...UP, at: BOWED, sy: 860 }, { f: e05 + 2, ...UP, at: BOWED, sy: 860 },     // a little tilt down with the bow
      // she steps aside and back: his bureau, the title over it (v7: his head at y 1320, not 1190, so the title's 采访 tag hangs
      // clear above his tall topknot)
      { f: T0 + 16, pos: [0.66, 1.6, 3.32], at: HEAD, sx: 300, sy: 1320, fov: 68 },
      { f: S.to, pos: [0.66, 1.6, 3.32], at: HEAD, sx: 300, sy: 1320, fov: 68 },
    ];
    let camera = shotCam("office", f, keys, { mood: "calm", amp: 0.55, walk: [[S.from, 0.75], [a01 - 12, 0.75], [a01 - 4, 0], [wade0 + 4, 0], [wade0 + 12, 0.3], [wade0 + 30, 0], [e05, 0], [e05 + 6, 0.4], [T0 + 16, 0]] });
    camera = punchIn(camera, f, three - 5, { k: 0.7, len: 5, off: e02 + 6 });
    camera = kick(camera, f, snap, 0.03);
    w.setCamera(camera);
    // ---------------------------------------------------------------------------------------------- 月老
    const t = f / 30, wading = f >= wade0, leg = wading ? wadeAt(f) : null, at = posAt(f);
    const towardHer = faceTo(HEAP, P("office", 0.12, 0, 2.5));
    const facingAt = (g: number) => ky(g, [[turnA, PROFILE], [turnA1, towardHer]]);
    const facing = leg ? leg.facing : facingAt(f);
    const turn = f < turnA ? 1 : f < turnA1 ? 1 - smooth((f - turnA) / (turnA1 - turnA)) : undefined;
    // HIS HANDS. Working the knot (a cat's cradle: the two hands circle out of step); FROZEN from 月老 on (held as they
    // were on that frame); back on the knot, drawing it tight very slowly, a tremble in them; at the snap FLUNG WIDE (a
    // fist out on each side, clear of the robe, a loose end hanging from each), then they sink and hang.
    const work = (g: number) => Math.min(g, freeze);
    const handAt = (g: number, side: -1 | 1): THREE.Vector3 => {
      const fc = g < wade0 ? facingAt(g) : facing;
      const c = work(g), ph = side < 0 ? 0 : 1.9;
      const pull = ky(g, [[back1 + 2, 0], [snap - 1, 1]]), tremble = g > back1 && g < snap ? 0.0028 * Math.sin(g * 2.7 + ph) : 0;
      const dx = 0.075 + 0.016 * Math.sin(c * 0.52 + ph) * (1 - pull) + 0.12 * smooth(pull);
      const tight = rel(at, fc, side * dx, HANDS_Y + 0.02 * Math.sin(c * 0.95 + ph) * (1 - pull) + 0.03 * pull + tremble, HANDS_Z + 0.012 * Math.cos(c * 0.52 + ph) * (1 - pull));
      if (g < snap) return tight;
      const wide = rel(at, fc, side * (0.31 + 0.012 * Math.sin((g - snap) * 0.9) * Math.exp(-(g - snap) / 8)), 1.0, 0.14), low = round(at, fc, side, LOW_DEG, LOW_R, LOW_Y);
      return g < snap + 14 ? tight.lerp(wide, smooth((g - snap + 1) / 3)) : wide.lerp(low, smooth((g - snap - 14) / 16));
    };
    const fawnK = ky(f, [[wade0 - 4, 0], [wade0 + 4, 1]]);
    const bowK = ky(f, [[bow0, 0], [bow0 + 8, 1], [bow1 - 6, 1], [bow1 + 2, 0]]);
    const sweepK = ky(f, [[sweep0, 0], [sweep1, 1]]), strokeK = ky(f, [[strokeAt, 0], [strokeAt + 10, 1]]);
    let hands: [THREE.Vector3 | null, THREE.Vector3 | null] | undefined;
    // after the bow: the left arm opens out to the room (palm up: his bureau); the right comes to rest low in front, then
    // goes up to stroke the beard (from there: never from his side through the robe)
    const after = (): [THREE.Vector3, THREE.Vector3] => {
      const open = offer(at, facing, sweepK, 1, 0.9, 0.12, 0.36), beard = stroke(at, facing, f, 1), rest0 = round(at, facing, -1, 30, 0.32, 0.62);
      return [beard ? rest0.clone().lerp(beard[0]!, smooth(strokeK)) : rest0, open ? round(at, facing, 1, LOW_DEG, LOW_R, LOW_Y).lerp(open[1]!, smooth(sweepK)) : round(at, facing, 1, LOW_DEG, LOW_R, LOW_Y)];
    };
    if (f < snap + 30) hands = [handAt(f, -1), handAt(f, 1)];
    else if (f < wade0 - 4) hands = [round(at, facing, -1, LOW_DEG, LOW_R, LOW_Y), round(at, facing, 1, LOW_DEG, LOW_R, LOW_Y)];
    else if (f < bow0) hands = wringOut(at, facing, f, Math.max(0.02, fawnK));
    else {
      // THE BOW (拱手): the hands go up together in front of his beard from the wringing, and come down into what follows
      const SAL: [THREE.Vector3, THREE.Vector3] = [rel(at, facing, -0.05, 0.8, 0.36), rel(at, facing, 0.05, 0.8, 0.36)];
      const from = f < bow0 + 10 ? wringOut(at, facing, f, 1)! : after(), k = smooth(bowK);
      hands = [from[0].clone().lerp(SAL[0], k), from[1].clone().lerp(SAL[1], k)];
    }
    // HIS HEAD AND EYES
    const lookDown = f < turnA1 ? 12 * (1 - smooth((f - turnA) / (turnA1 - turnA))) : f >= back0 && f < look + 12 ? (f < snap ? 16 * smooth((f - back0) / (back1 - back0)) : 16 - 9 * smooth((f - snap) / 5) - 7 * smooth((f - look) / 12)) : undefined;
    const sneakLR = f >= sneak - 3 && f < sneak + 13 ? (f < sneak + 4 ? -1 : 1) : undefined;
    const gaze = f < eyes ? 0 : f < turnA1 ? 1 : f >= back1 && f < wade0 ? 0 : sneakLR ?? (f >= wade0 ? 0 : undefined);
    const lean = f < freeze ? { roll: 4 * Math.sin(f * 0.95), pitch: 6 }
      : f < turnA ? { roll: 4 * Math.sin(freeze * 0.95), pitch: 6 }
      : f >= back1 && f < snap ? { pitch: 6 + 3 * smooth((f - back1) / 20) }
      : f >= snap && f < snap + 12 ? { pitch: 9 - 13 * smooth((f - snap) / 3) + 4 * smooth((f - snap - 3) / 9) }
      : f >= a04 && f < a05 + 8 ? { pitch: (5 + 5 * smooth((f - nods[0] + 6) / 14)) * (1 - smooth((f - a05) / 7)) }
      : f >= sneak - 6 && f < write - 2 ? { pitch: 9 * smooth((f - sneak + 6) / 6) * (1 - smooth((f - write + 8) / 6)) }
      : undefined;
    const head = VERBS.heads(
      VERBS.accent("nod", f, a02 + 1, { amp: 0.6 }),
      ...nods.map((n) => VERBS.accent("nod", f, n, { amp: 0.7 })),
      VERBS.accent("nod", f, a05 + 1, { amp: 1.25 }),
    );
    const faces: MoodKey[] = [
      [S.from, "peer"], [freeze + 2, "warn", "take", 0.4], [back1, "peer"], [snap, "panic", "take"], [look, "suspicious"],
      [you + 7, "fawn"], [a05, "sly"], [bow0 - 2, "fawn"], [e05 + 4, "proud"],
    ];
    const r = act(w, f, YL, {
      at, facing, faces, turn, lookDown, gaze, lean, head,
      pose: leg && leg.moving ? leg.pose : undefined,
      hands,
      more: bowK > 0.01 ? { ...VERBS.salute(bowK, at, facing, t), hands } : undefined,
    });
    w.update();
    // ---------------------------------------------------------------------------------------------- the cords
    const h0 = r.handWorld(0), h1 = r.handWorld(1), TH = { r: 0.0065 };
    const fromR = onHeap(FROM_R, tangle), fromL = onHeap(FROM_L, tangle);
    if (f < snap) {
      // the cord he is working: up out of the heap to his right hand, the knot between his hands, down to the heap again
      const sag = 0.012 * (1 - ky(f, [[back1 + 2, 0], [snap - 1, 1]]));
      w.props.thread("knot", between(h0, h1, sag), TH);
      w.props.thread("knotLump", knotLump(h0, h1, sag, ky(f, [[back1 + 2, 0.017], [snap - 1, 0.0105]])), { r: 0.006 });
    } else if (f < wade0 + 30) {
      // snapped at the knot: each half is a loose end in its fist (it swings in under the hand and hangs; the hand's own
      // motion sends waves down it)
      const d = f - snap, half = 0.1;
      const end = (key: string, hand: THREE.Vector3, side: -1 | 1) => {
        const L = V(Math.cos(facing), 0, -Math.sin(facing));
        w.props.thread(key, limp(hand, hand.clone().addScaledVector(L, -side * half), d, FLAT, { n: 9, trail: (u) => handAt(f - 3 * u, side).sub(handAt(f, side)) }), TH);
      };
      end("knot", h0, -1); end("knot2", h1, 1);
    }
    if (f < wade0 - 6) { w.props.thread("heapR", droop(fromR, h0, 0.05, FLAT), TH); w.props.thread("heapL", droop(fromL, h1, 0.05, FLAT), TH); }
    else if (f < wade0 + 22) {
      // he lets go as he wades out: the two cords drop back onto the heap
      const d = f - (wade0 - 6);
      w.props.thread("heapR", recoil(fromR, h0.clone().lerp(fromR, smooth(d / 10)), d, FLAT), TH);
      w.props.thread("heapL", recoil(fromL, h1.clone().lerp(fromL, smooth(d / 10)), d, FLAT), TH);
    }
    // one cord snagged on his hem trails after him out of the heap and lies there behind him on the floor
    if (f >= wade0 + 8) {
      const from = onHeap(rel(HEAP, 0, 0.12, 0, 0.56), tangle, 0.04), foot = at.clone().add(V(0.06, 0, -0.07));
      w.props.thread("trail", lay([from, from.clone().lerp(foot, 0.5).setY(0), foot], FLAT, { wander: 0.03, seed: 4 }), TH);
    }
    // ---------------------------------------------------------------------------------------------- over the picture
    // three 囍 slapped on under the token, each torn in two (三对离婚): they land in the gap after the snap, clear of his
    // flung fists and of the token
    const FX: Fx[] = [tornXi(f, { from: snap + 2, to: snap + 2 + 8 + 9 + 15, at: [[660, 990], [790, 1050], [690, 1160]], px: 100, gap: 4, tear: 9 })];
    return { camera, overlays: draw(f, FX), shown: FX, post: { bloom: 0.5 } };
  },
};
