// Rope prop system for 《你的朋友，有几个也把你当朋友？》: the film's central metaphor (友谊是根绳，你只握得到自己这头).
// Rules used the same way in every scene: thickness = the score given (3 thin .. 5 thick); GOLD = held at both ends
// (two-way); GREY = one end lies on the floor (one-way: the holder holds it, the other end lies unheld at the target's
// feet). Everything here is deterministic: geometry is a pure function of the pose you pass, motion helpers are pure
// functions of the time since an event, the network generator is seeded. Materials ride the BtCannon PBR rig
// (pbr.ts mats(): MeshPhysical + env fill + GROUND_AO) with a code-drawn three-strand laid rope albedo plus a packed
// bump(R)/roughness(G) sheet in the woodtex.ts convention.
//
// ===================================================================================================================
// API
// ===================================================================================================================
// Scale: metres, floor y = 0 (pass floorY otherwise), figures 1.45 m. All points are WORLD space.
//
//  ropeRadius(score)            3 -> 0.011 m, 4 -> 0.0165, 5 -> 0.024 (continuous between). Reads at 1080x1920: a thin
//                               rope is ~6 px wide in the classroom wide shot, ~11 px in the dorm wide; thick ~2.2x.
//  ROPE_COL                     gold / grey / glow / glint colours (sRGB hex).  TAUT = slack ratio of a taut rope.
//
//  new Rope(M, { score | radius, gold, radial, ink, outlinePx, castShadow, seed })   hero rope (rebuilt per frame)
//    rope.mesh                  add to the scene (two draw calls: the rope + its outline child). ink: "hull" (default)
//                               = constant 2.4 px outline in a dark shade of the rope colour, on NOINK, because the
//                               film's InkPass paints any rope under ~12 px solid black and the gold/grey is lost;
//                               "pass" = layer 0, inked black by InkPass; "none".
//    rope.update(pose)          rebuild from a RopePose (below); returns the rope. ~100 rings, < 0.3 ms.
//    rope.points / rope.s       last centreline (world) and its arc lengths; rope.length = total length (m).
//    rope.pointAt(f) / rope.spanPointAt(f)   point at a fraction of the whole rope / of the span between the attaches
//                               (tags, the red x on a slack rope, a camera that follows a rope).
//    rope.clearance(boxes, cyls?)  geometric 穿模 check of the last centreline: {hits, worst (m of penetration)}.
//    ropeRaycast(rope.points, set.group)  segment raycasts against a built set: {hits, at, objects} (previews / tests;
//                               ~0.3 s per rope against the dorm, so not per frame).
//    rope.setScore(s) / rope.setRadius(r) / rope.dispose()
//
//  RopePose (all optional except a, b):
//    a          holder end: stick-limb tip / post axis point (knot) / ankle centre / phone
//    b          far end: the other holder's hand, OR where the free end lies on the floor (free rope)
//    via        points the rope's centre passes over (desk edge + radius, window opening): pieces are catenaries
//               between them, corners filleted so the rope bends round the edge
//    length     rope length along the span (m). Default = sum of chords x (1 + TAUT) = straight with a slight sag
//    slack      metres added to length (what the motion helpers return)
//    floorY     floor height (default 0). The rope never goes below floorY + radius; it lies along the floor
//    bFrom,endT,endPath   moving free end: the end travels bFrom -> b, endT 0..1; endPath "drop" (gravity, from a hand
//               to the floor) or "lift" (floor to a grabbing hand). The end is kept within the rope's length of the
//               holder, so a released taut rope swings in like a pendulum instead of stretching
//    endLift    extra height of the far end (landing bounce from ropeMotion.drop)
//    vib, vib2  mode-1 (sag direction, + = down) and mode-2 (lateral) amplitudes in metres (twang / boing)
//    gold       0 grey .. 1 gold (colour blend)       glow   0..1 gold emissive ("glows gold" beats)
//    glint      0..1 position of a travelling glint from a to b (outside = off); glintAmt its strength
//    reveal     0..1 drawn fraction from a (a thrown rope growing toward b; rounded tip)
//    dash       { from?, period? (0.21 m), duty? (0.62) }: dashed rope (ghost / imagined) from `from` (fraction of span) on
//               (defaults chosen so the dashes still read as dashes, not a blur, on a phone at 1080 x 1920)
//    attachA / attachB   how each end is held (default: a hand at a, a hand at b, or a free end when bFrom is set):
//      { kind: "hand", tail? }                      gripped at a stick-limb tip; `tail` m of rope sticks out behind
//      { kind: "coil", axis, limbR?, turns?, offset? }   a few coils round the END of a stick arm (axis = shoulder->tip);
//                                                   turns default by thickness (2.5 at score 3, ~1.9 at 4, 1.25 at 5) so
//                                                   a thick rope's coil does not read as a glove
//      { kind: "knot", axis?, postR, turns? (2), tail? (0.04), front? }   tied round a post (wraps + one diagonal
//                                                   crossing over them, short tail): point = on the post axis at knot
//                                                   height, axis = post axis, postR = post radius (half-diagonal for
//                                                   a square tube: bunk ladder rail 0.032 -> 0.023; radiator pipe 0.011)
//      { kind: "ankle", legR? }                     a loop round an ankle (point = ankle centre on the leg stick)
//      { kind: "end" }                              a bare rope end (free end, the phone)
//
//  ropeMotion.*   pure functions of t = seconds since the event (negative = before it):
//    twang(t, {from, amp, freq, decay, pull, glint})  -> {slack, vib, vib2, glint, glintAmt}   snap taut + overshoot
//    boing(t, {to, from, freq, zeta, wobble})         -> {slack, vib, vib2}   go slack: droops past rest, bounces, settles
//    drop(t, {dur, bounce})                           -> {endT, endLift}      a free end falling to the floor
//    haul(t, {dist, pulls, dur})                      -> {pulled, stroke, vib}   hand-over-hand haul (length -= pulled)
//    snap(t, {lift, from, amp})                       -> {endT, slack, vib, vib2, glint, glintAmt, gold, glow}
//                                                      someone grabs the floor end: it lifts and the rope snaps taut gold
//    throwRope(t, {dur})                              -> {reveal, glint, glintAmt}   rope shoots from a to b
//    glowPulse(t, {dur})                              -> glow 0..1
//  lieSlack(a, b, floorY?, r?, drape?)   slack (m over the taut length) for a rope from a hand to b ON the floor to lie
//                                         with a natural drape; lieLength(...) = the same as an absolute length
//                                         (an end dropping: length = tautLen + boing(t, {to: lieLength - tautLen}).slack)
//  freeEndAt(a, toward, length, floorY?, r?, drape?)   where a free end lies for a given length (hauling in)
//
//  new GhostHolder(parent, { height?, face? })        dotted-outline ghost figure card (line 05), camera-facing
//    ghost.update({ feet, camera, toward, pop? }) -> world hand point (attach the rope's b there, attachB hand).
//    pop = seconds since the ghost bursts into dots (0.45 s), then it hides. ghost.mesh is on NOINK.
//
//  Seat = { hand, spot, chair?, lane?, row?, hands?, head?, headR? }
//    hand  where this person holds their ropes (one point; the spot-side hand when `hands` is given)
//    hands [hand0, hand1] the two drawn stick-arm ends: every rope leaves from the hand on the side it goes (handFor)
//    spot  floor point beside the chair where an uncaught end lies at their feet (and their own one-way ropes touch down)
//    head, headR   head centre / radius: the network then only ties pairs whose taut rope passes clear of every head.
//          Real cast, seated: head centre = hip + 0.681 m (1.153 m), radius 0.205 (0.95-1.36 m); a raised hand is at
//          ~1.0-1.27 m, i.e. AT head height, so a rope cannot pass over the heads: it must pass BETWEEN them. Neighbouring
//          heads are 0.64 m apart, so a hand must sit 0.24-0.40 m (in plan) from its own head (0.32 = midway).
//  handFor(seat, toward) -> V3      the hand a rope toward that point leaves from
//  spanClearsHeads(seats, i, j, margin = 0.022) -> boolean   the i-j hand-to-hand span misses every head (plan test)
//
//  classroomSeats(set.anchors, { hands?, headY? (0.681), headR? (0.205), handY? (1.21), handOut? (0.31) })
//      -> { seats, route, boxes, cyls, deskX, deskZ, lanes }        *** use this for the real classroom (sets/classroom v2)
//    Seats from anchors.seats (84) + anchors.aisleX. hands(i) -> [hand0, hand1] should be the real cast's drawn hands for
//    the SHOT camera (crowd.handWorld(i, 0 / 1) after cast.update(camera, t)): the cards are yaw-only billboards, so the
//    hands move when the camera yaws (an orbit drifts them ~0.32 m x the yaw change in radians; re-solve per shot, not
//    per frame, and keep orbits small). Solve each person's two arm aims so each hand lands ~0.32 m from the own head in
//    plan (see preview/rope_g_common.ts: 4 passes of aim -= (offset - 0.32) / (0.37 sin aim)). Default hands (no
//    hands()): handOut either side of the hip at handY.
//    spot: outer seats -> their aisle, inner seats -> the gap between the two chairs of their desk, at the chair's z.
//    route(H, T): H's gap -> strip behind H's row (chair backs .. next row's desk legs) -> nearest aisle -> strip behind
//    T's row -> T's gap: floor ropes never cross a desk, a desk leg or a chair.
//    boxes / cyls: desk tops, legs, runners, chair seats / backs / legs; seated torsos (r 0.16) and heads (r 0.205)
//    for ropeClearance(path, r, boxes, cyls) on web.paths[i].real / .imag (preview g: 0 hits on all 775 x 2 paths).
//  classSeats({ cols, rows, colPitch, rowPitch, handY, centre }) -> { seats, desks, deskCentres, chairs, route }
//    SYNTHETIC demo layout (6 x 7 double desks on a regular 2.05 x 1.2 m pitch, one hand per seat at handY 1.3 m); it
//    has no heads, so its web is not head-checked. Kept for quick tests; the film uses classroomSeats.
//  generateClassNetwork(seats, seed, { lambda=1.9, far=0.006, popular=6, headMargin=0.022 }) -> { ties, popularity, popular, stats }
//    exactly 775 ties: 413 two-way + 362 one-way (1188 nominations), near-neighbour weighted (exp(-d/lambda) + far),
//    a few popular people, everyone >= 3 ties; one-way holders are mostly the less popular one. When seats carry `head`,
//    only head-clear pairs (spanClearsHeads) are used; the random stream is drawn for every pair, so a seed gives the
//    same network whether or not a pair is filtered. Throws "only N head-clear pairs for 775 ties" when the hands sit
//    too close to / too far from the heads (real classroom with solved aims: 823 clear pairs, minDeg 8). Because heads
//    block most same-row sideways spans, the head-clear web is mostly front-back diagonals (a lattice from above).
//    Tie = { holder, target, two, score, order (sweep key 0..1, front -> back), rnd, delay (flop key 0..1), imagGrey }
//  new RopeWeb(M, seats, ties, { route?, radius?, minY?, pts?, radial?, outlinePx?, castShadow?, floorY? })
//    ALL ropes in ONE mesh / one draw call (+ one outline draw call); static geometry built once (~0.1 s), every state
//    below is a shader uniform. Gold / imagined ropes: taut hand-to-hand catenaries whose sag never takes them below minY
//    (1.18; a rope between low hands stays nearly straight). Seated heads are avoided by the network's choice of pairs
//    (head-clear spans), not by height. Real one-way ropes: hang from the hand, lie along to the holder's spot, follow route() to the target's spot.
//    Lambert + rope albedo + flat fill (cheap: ~0.45 s / 1080x1920 frame on SwiftShader for 775 ropes), on NOINK.
//    web.paths[i] = { real, imag, r } centrelines (for ropeClearance checks against the set).
//    web.set({ grey, gold, greyLight, sweep, sweepGlow, sweepDim, flop, flopSpread, dash, stagger, inflate, glow })
//      grey/gold   0..1 reveal of the one-way / two-way ropes (grow from the holder / from both holders, staggered
//                  all over the room by `stagger`)
//      greyLight   0..1 the grey floor ropes light up (line 09 beat 1); `inflate` fattens them while lit
//      sweep       0..1 counting sweep across the room (front -> back); counted ropes flash (sweepGlow), uncounted go
//                  dark and greyish (sweepDim 0..1: x0.2, 65 % desaturated at 1); web.counts(sweep) -> {gold, total, grey}
//                  for the 413/775 counter (1 -> 413/775)
//      flop        seconds since the line-06 chain reaction began: one-way ropes go from the imagined state (taut
//                  gold to the target's hand) to the real one (grey, on the floor) with a springy boing; < 0 =
//                  imagined, default 99 = real. flopSpread = seconds the chain takes across the room
//      dash        0..1 dashes the still-imagined one-way ropes (0.2 m period, 62 % on);  glow  gold emissive
//    web.U.uWFill.value  flat fill light (default 0.55), web.U.uWGoldCol / uWGreyCol / uWLightCol colours
//
// Usage (hero ropes, line 01 slack rope):
//   const r = new Rope(M, { score: 4, gold: 1 }); scene.add(r.mesh);
//   // per frame f: released at T0 (s)
//   const t = f / 30 - T0, tw = ropeMotion.twang(f / 30 - 0.2), L0 = hand.distanceTo(friendHand) * (1 + TAUT),
//         bo = ropeMotion.boing(t, { to: lieLength(hand, feet) - L0 }), dr = ropeMotion.drop(t);
//   r.update(t < 0 ? { a: hand, b: friendHand, ...tw, gold: 1 }
//                  : { a: hand, b: feet, bFrom: friendHand, endT: dr.endT, endLift: dr.endLift, length: L0 + bo.slack,
//                      vib2: bo.vib2, gold: 1 - Math.min(1, t / 0.35) });
// Knot round the bunk-ladder rail (dorm): tie BETWEEN rungs (rungs every 0.355 m: knot heights 0.51 / 0.865 / 1.22);
//   anchors.ladderKnot (y 1.0) is too close to the 1.065 rung for a 2-turn score-4 knot.
//   r.update({ a: youHand, b: V(K.x, 0.865, K.z), attachA: { kind: "coil", axis: armAxis },
//              attachB: { kind: "knot", postR: 0.0226, turns: 2, front: V(1, 0, 0.35) } })
// Web (line 09) on the real classroom (set = classroom(M, {}), set.setCeilingOpen(1), crowd seated in "hold"):
//   cast.update(camera, t);   // the shot camera, after solving the arm aims (preview/rope_g_common.ts)
//   const CS = classroomSeats(set.anchors, { hands: (i) => [crowd.handWorld(i, 0), crowd.handWorld(i, 1)] });
//   const net = generateClassNetwork(CS.seats, 2016);
//   const web = new RopeWeb(M, CS.seats, net.ties, { route: CS.route, radius: (s) => ropeRadius(s) * 0.95 }); scene.add(web.mesh);
//   web.set({ grey: 1, greyLight: 1, gold: 0 });  ...  web.set({ gold: 1, greyLight: 0.3, sweep: s, sweepDim: 1 });
//   counter = web.counts(s)  (gold / total)
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";

type V3 = THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a || 1e-9)); return t * t * (3 - 2 * t); };
const easeOut3 = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const easeInOut = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const acosh1p = (x: number) => Math.log1p(x + Math.sqrt(x * (2 + x))); // acosh(1 + x), precise for small x
/** mulberry32 (seeded, deterministic) */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ===================================================================================================================
// constants
// ===================================================================================================================
/** slack ratio of a taut rope (length = chord x (1 + TAUT)): sag ~1.2 % of the span (3.6 cm over 3 m) */
export const TAUT = 4e-4;
export const ROPE_COL = {
  gold: "#f0b631", // warm saturated gold-yellow fibre (two-way)
  grey: "#c3c6cd", // cool mid grey (one-way): never reads beige under the warm dorm lamps
  glow: "#ffb020", // emissive for "glows gold"
  glint: "#fff1c8", // travelling twang glint
} as const;
/** rope radius (m) from the score: 3 thin, 5 thick */
export function ropeRadius(score: number): number {
  const s = clamp(score, 2.5, 5.5);
  return s <= 4 ? 0.011 + (s - 3) * 0.0055 : 0.0165 + (s - 4) * 0.0075;
}
/** lay length (m along the rope for one full twist of a strand): ~6 diameters, like real laid rope */
const layOf = (r: number) => 12 * r;

// ===================================================================================================================
// texture: three-strand laid rope, neutral (tinted by the material colour), albedo + packed bump R / roughness G
// ===================================================================================================================
let TEX: { map: THREE.CanvasTexture; surf: THREE.CanvasTexture } | null = null;
const mkTex = (c: HTMLCanvasElement, srgb: boolean) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** the shared rope maps (built once, 512 x 256: u = one lay along the rope, v = once round). Painted like the
 *  BtCannon rope: smooth strands with a soft light crest, gentle grooves (~45 % toward dark, never black), a faint
 *  steeper fibre twist inside each strand. */
export function ropeTextures() {
  if (TEX) return TEX;
  const W = 512, H = 256, R = rng(91);
  const ca = document.createElement("canvas"), ch = document.createElement("canvas");
  ca.width = ch.width = W; ca.height = ch.height = H;
  const ga = ca.getContext("2d", { willReadFrequently: true })!, gh = ch.getContext("2d", { willReadFrequently: true })!;
  const ia = ga.createImageData(W, H), ih = gh.createImageData(W, H);
  const ph = [0, 1, 2].map(() => R() * 6.283), tone = [0.975, 1.0, 1.02];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x + 0.5) / W, v = (y + 0.5) / H, q = 3 * (v - u), f = q - Math.floor(q), idx = ((Math.floor(q) % 3) + 3) % 3;
    const prof = Math.pow(Math.sin(Math.PI * f), 0.5);                                  // strand cross-section
    const fib = 0.5 + 0.5 * Math.sin(2 * Math.PI * (19 * v + 41 * u) + ph[idx] + 0.6 * Math.sin(2 * Math.PI * 7 * u));
    const crest = Math.exp(-Math.pow((f - 0.4) / 0.17, 2));                              // soft light band per strand
    const groove = Math.exp(-Math.pow(Math.min(f, 1 - f) / 0.06, 2));                    // the lay line itself
    let c = (0.56 + 0.44 * prof) * tone[idx] * (0.965 + 0.035 * fib) + 0.07 * crest - 0.08 * groove;
    c = clamp(c, 0, 1.08);
    const i4 = (y * W + x) * 4, g = 232 * c;
    ia.data[i4] = clamp(g, 0, 255); ia.data[i4 + 1] = clamp(g * 0.995, 0, 255); ia.data[i4 + 2] = clamp(g * 0.985, 0, 255); ia.data[i4 + 3] = 255;
    ih.data[i4] = clamp(255 * (0.18 + 0.74 * prof) + 10 * (fib - 0.5), 0, 255);           // height
    ih.data[i4 + 1] = clamp(255 * (0.9 - 0.16 * crest * prof), 0, 255);                   // roughness
    ih.data[i4 + 2] = 0; ih.data[i4 + 3] = 255;
  }
  ga.putImageData(ia, 0, 0); gh.putImageData(ih, 0, 0);
  TEX = { map: mkTex(ca, true), surf: mkTex(ch, false) };
  return TEX;
}

const GOLD = new THREE.Color(ROPE_COL.gold), GREY = new THREE.Color(ROPE_COL.grey);
const makeRopeMaterial = (M: Mats | null) => {
  const T = ropeTextures();
  const o = { map: T.map, bumpMap: T.surf, bumpScale: 1.4, roughnessMap: T.surf, roughness: 1, color: "#ffffff" };
  const m = M ? (M.paint(o) as THREE.MeshPhysicalMaterial) : new THREE.MeshPhysicalMaterial({ ...o, metalness: 0 });
  m.specularIntensity = 0.45;
  return m;
};

// ===================================================================================================================
// catenary solver: a heavy flexible rope between two points, lying on the floor where it reaches it
// ===================================================================================================================
/** z > 0 with sinh(z) / z = k (k > 1): Newton from the right of the root (f convex) */
function solveSinhc(k: number): number {
  if (k <= 1 + 1e-12) return 1e-6;
  let z = k < 3 ? Math.sqrt(6 * (k - 1)) : Math.log(2 * k) + Math.log(Math.log(2 * k) + 1);
  for (let i = 0; i < 60 && Math.sinh(z) - k * z < 0; i++) z *= 1.3;
  for (let i = 0; i < 50; i++) {
    const f = Math.sinh(z) - k * z, df = Math.cosh(z) - k;
    if (df <= 0) { z *= 1.2; continue; }
    const dz = f / df; z -= dz; if (z <= 1e-9) z = 1e-9;
    if (Math.abs(dz) < 1e-13 * Math.max(1, z)) break;
  }
  return z;
}
export type PieceOpts = { floor: number; ppm?: number; minPts?: number; maxPts?: number; seed?: number; wobble?: number };
/** centreline of one rope piece from A to B with arc length L (metres; clamped to >= chord): a free catenary, or,
 *  where that would dip below `floor` (= floorY + radius), the exact frictionless-floor solution: two half-catenaries
 *  with one tension parameter touching down tangentially, joined by a run lying on the floor (with a gentle natural
 *  meander; extra length that cannot hang snakes sideways). Points are uniform in arc length on each part. */
export function ropePiece(A: V3, B: V3, L: number, o: PieceOpts): V3[] {
  const f = o.floor, ppm = o.ppm ?? 20, minN = o.minPts ?? 6, maxN = o.maxPts ?? 72;
  const a0 = A.clone(), b0 = B.clone();
  if (a0.y < f) a0.y = f; if (b0.y < f) b0.y = f;
  const dx = b0.x - a0.x, dz = b0.z - a0.z, D0 = Math.hypot(dx, dz), dy = b0.y - a0.y, chord = Math.hypot(D0, dy);
  const nOf = (len: number) => Math.round(clamp(len * ppm, minN, maxN));
  if (chord < 1e-6) return [a0, b0];
  const e = D0 > 1e-6 ? V(dx / D0, 0, dz / D0) : V(1, 0, 0);
  if (L <= chord * (1 + 1e-7)) {
    const n = nOf(chord), out: V3[] = [];
    for (let i = 0; i <= n; i++) out.push(a0.clone().lerp(b0, i / n));
    return out;
  }
  const D = Math.max(D0, 1e-4);
  const k = Math.sqrt(L * L - dy * dy) / D, z = solveSinhc(k), a = D / (2 * z);
  const x0 = D / 2 - a * Math.atanh(clamp(dy / L, -0.9999999, 0.9999999));
  const yMin = x0 > 0 && x0 < D ? a0.y - 2 * a * Math.pow(Math.sinh(x0 / (2 * a)), 2) : Math.min(a0.y, b0.y);
  if (isFinite(yMin) && yMin >= f - 1e-6) {
    const n = nOf(L), q = Math.sinh(-x0 / a), out: V3[] = [];
    let ok = isFinite(q);
    for (let i = 0; i <= n && ok; i++) {
      const s = (L * i) / n, x = x0 + a * Math.asinh(s / a + q), y = a0.y + 2 * a * Math.sinh((x - 2 * x0) / (2 * a)) * Math.sinh(x / (2 * a));
      if (!isFinite(x) || !isFinite(y)) ok = false; else out.push(V(a0.x + e.x * x * (D0 / D), y, a0.z + e.z * x * (D0 / D)));
    }
    if (ok) { out[0].copy(a0); out[out.length - 1].copy(b0); return out; }
  }
  return floorPiece(a0, b0, L, e, D0, o);
}
const AMIN = 0.03; // tightest bend where a slack rope meets the floor (m): no sharp corner
const sigma = (a: number, h: number) => (h <= 1e-9 ? 0 : Math.sqrt(h * h + 2 * a * h) - a * acosh1p(h / a));
function floorPiece(A: V3, B: V3, L: number, e: V3, D: number, o: PieceOpts): V3[] {
  const f = o.floor, ppm = o.ppm ?? 20, minN = o.minPts ?? 6, maxN = o.maxPts ?? 72;
  const nOf = (len: number) => Math.round(clamp(len * ppm, minN, maxN));
  const h1 = A.y - f, h2 = B.y - f, S = L - D;
  let a = AMIN;
  if (S < sigma(AMIN, h1) + sigma(AMIN, h2)) { // bisection on ln a: g decreasing in a
    let lo = Math.log(AMIN), hi = Math.log(1e5);
    for (let i = 0; i < 64; i++) { const m = 0.5 * (lo + hi), am = Math.exp(m); if (sigma(am, h1) + sigma(am, h2) > S) lo = m; else hi = m; }
    a = Math.exp(0.5 * (lo + hi));
  }
  let x1 = h1 > 1e-9 ? a * acosh1p(h1 / a) : 0, x2 = h2 > 1e-9 ? a * acosh1p(h2 / a) : 0;
  const s1 = h1 > 1e-9 ? Math.sqrt(h1 * h1 + 2 * a * h1) : 0, s2 = h2 > 1e-9 ? Math.sqrt(h2 * h2 + 2 * a * h2) : 0;
  let run = D - x1 - x2, k1 = 1, k2 = 1;
  if (run < 0) { const k = D / Math.max(1e-9, x1 + x2); k1 = k2 = k; x1 *= k; x2 *= k; run = 0; }
  const F = L - s1 - s2, extra = Math.max(0, F - run);
  const lat = V(-e.z, 0, e.x), out: V3[] = [], R = rng((o.seed ?? 1) * 7919 + 13);
  // part 1: A down to the touchdown T1 (arc s from s1 to 0 measured from T1)
  if (s1 > 1e-6) {
    const n = nOf(s1);
    for (let i = 0; i <= n; i++) {
      const s = s1 * (1 - i / n), x = a * Math.asinh(s / a) * k1, y = f + (Math.sqrt(a * a + s * s) - a);
      out.push(V(A.x + e.x * (x1 - x), y, A.z + e.z * (x1 - x)));
    }
    out[0].copy(A);
  } else out.push(V(A.x, f, A.z));
  // part 2: the run on the floor, T1 -> T2, with meander (extra length) + a gentle natural wobble
  const T1 = V(A.x + e.x * x1, f, A.z + e.z * x1);
  const runLen = run + extra;
  if (runLen > 1e-4) {
    const m = Math.max(1, Math.round(run / 0.55)), Aex = run > 0.05 ? Math.min(0.3, ((2 * run) / (Math.PI * m)) * Math.sqrt(extra / run)) : 0;
    const Anat = (o.wobble ?? 1) * Math.min(0.03, 0.06 * run), ph = R() * 6.283, per = 0.7 + 0.5 * R();
    const n = nOf(runLen);
    for (let i = 1; i <= n; i++) {
      const t = i / n, along = run * t;
      const side = Aex * Math.sin(Math.PI * m * t) + Anat * Math.sin(Math.PI * t) * Math.sin((2 * Math.PI * along) / per + ph);
      out.push(V(T1.x + e.x * along + lat.x * side, f, T1.z + e.z * along + lat.z * side));
    }
  }
  // part 3: T2 up to B
  if (s2 > 1e-6) {
    const n = nOf(s2);
    for (let i = 1; i <= n; i++) {
      const s = (s2 * i) / n, x = a * Math.asinh(s / a) * k2, y = f + (Math.sqrt(a * a + s * s) - a);
      out.push(V(B.x - e.x * (x2 - x), y, B.z - e.z * (x2 - x)));
    }
  }
  out[out.length - 1].copy(B);
  if (out.length < 2) out.push(B.clone());
  return out;
}
/** slack (m over the taut length) for a rope from hand `a` to `b` on the floor to lie with a natural drape (the
 *  hanging part's tension parameter, m: 0.25 = droops close to the holder, 1+ = long shallow curve) */
export function lieSlack(a: V3, b: V3, floorY = 0, r = 0.016, drape = 0.4): number {
  const f = floorY + r, h = Math.max(0, a.y - f), D = Math.hypot(b.x - a.x, b.z - a.z);
  const xh = h > 0 ? drape * acosh1p(h / drape) : 0, sh = Math.sqrt(h * h + 2 * drape * h);
  const L = D > xh ? sh + (D - xh) : Math.hypot(D, h) * 1.15;
  return Math.max(0, L - a.distanceTo(V(b.x, f, b.z)) * (1 + TAUT));
}
/** absolute rope length from hand `a` to `b` on the floor lying with a natural drape (see lieSlack) */
export function lieLength(a: V3, b: V3, floorY = 0, r = 0.016, drape = 0.4): number {
  return lieSlack(a, b, floorY, r, drape) + a.distanceTo(V(b.x, floorY + r, b.z)) * (1 + TAUT);
}
/** where a free end lies (on the floor) when a rope of `length` hangs from `a` toward `toward` with a given drape:
 *  for hauling in (length shrinks, the end slides toward the holder) */
export function freeEndAt(a: V3, toward: V3, length: number, floorY = 0, r = 0.016, drape = 0.4): V3 {
  const f = floorY + r, h = Math.max(0, a.y - f), e = V(toward.x - a.x, 0, toward.z - a.z);
  if (e.lengthSq() < 1e-12) e.set(1, 0, 0); e.normalize();
  const sh = Math.sqrt(h * h + 2 * drape * h), xh = drape * acosh1p(h / Math.max(1e-6, drape));
  const x = length >= sh ? xh + (length - sh) : Math.sqrt(Math.max(0, length * length - h * h)) * 0.9;
  return V(a.x + e.x * x, floorY, a.z + e.z * x);
}

// ===================================================================================================================
// attachments: knot round a post, coils round a stick arm, loop round an ankle, hand grip, bare end
// ===================================================================================================================
export type Attach =
  | { kind: "hand"; tail?: number }
  | { kind: "coil"; axis: V3; limbR?: number; turns?: number; offset?: number; pitch?: number }
  | { kind: "knot"; axis?: V3; postR: number; turns?: number; tail?: number; front?: V3 }
  | { kind: "ankle"; legR?: number; axis?: V3 }
  | { kind: "end" };
type AttachOut = { pts: V3[]; exit: V3 };
const basis = (k: V3) => {
  const e1 = Math.abs(k.y) < 0.9 ? V(0, 1, 0).cross(k).normalize() : V(1, 0, 0).cross(k).normalize();
  return [e1, k.clone().cross(e1).normalize()] as const;
};
/** the exit angle on a wrap round axis k so the rope leaves tangentially toward d (wrap winding: phi increasing) */
const exitPhi = (k: V3, e1: V3, e2: V3, d: V3) => {
  const dp = d.clone().addScaledVector(k, -d.dot(k));
  if (dp.lengthSq() < 1e-6) dp.copy(e2);
  return Math.atan2(-dp.dot(e1), dp.dot(e2));
};
/** path of an attachment from the rope's END to its exit point (where the span starts), d = unit direction from
 *  the attach point toward the span's next control point */
function attachPath(at: Attach, p: V3, d: V3, r: number): AttachOut {
  if (at.kind === "end") return { pts: [p.clone()], exit: p.clone() };
  if (at.kind === "hand") {
    const tail = at.tail ?? 0.05;
    if (tail <= 1e-4) return { pts: [p.clone()], exit: p.clone() };
    const back = d.clone().negate(), end = p.clone().addScaledVector(back, tail * 0.8).addScaledVector(UP, -tail * 0.55);
    const c = p.clone().addScaledVector(back, tail * 0.55), pts: V3[] = [];
    for (let i = 0; i <= 5; i++) { const t = i / 5, s = 1 - t; pts.push(V(s * s * end.x + 2 * s * t * c.x + t * t * p.x, s * s * end.y + 2 * s * t * c.y + t * t * p.y, s * s * end.z + 2 * s * t * c.z + t * t * p.z)); }
    return { pts, exit: p.clone() };
  }
  if (at.kind === "coil") {
    const k = at.axis.clone().normalize(), [e1, e2] = basis(k), Rr = (at.limbR ?? 0.013) + r * 1.02;
    // default turns shrink with the rope's thickness so a thick rope's wraps read as wraps, not a lump (3: 2.5, 4: 1.9, 5: 1.25)
    const turns = at.turns ?? clamp(2.5 - (r - 0.011) * 96, 1.25, 2.5), pitch = at.pitch ?? 2.04 * r, p1 = exitPhi(k, e1, e2, d), p0 = p1 - 2 * Math.PI * turns;
    const base = p.clone().addScaledVector(k, -((at.offset ?? 0) + 0.008 + r + turns * pitch));
    const at_ = (ph: number, rad = Rr) => base.clone().addScaledVector(k, (pitch * (ph - p0)) / (2 * Math.PI))
      .addScaledVector(e1, rad * Math.cos(ph)).addScaledVector(e2, rad * Math.sin(ph));
    const pts: V3[] = [];
    // the rope's end: a short tail leaving the first turn tangentially (backward along the helix)
    const t0 = at_(p0), tan0 = at_(p0 + 0.01).sub(t0).normalize();
    pts.push(t0.clone().addScaledVector(tan0, -0.035).addScaledVector(k, -0.004));
    const n = Math.max(12, Math.round(16 * turns));
    for (let i = 0; i <= n; i++) pts.push(at_(p0 + ((p1 - p0) * i) / n));
    return { pts, exit: pts[pts.length - 1].clone() };
  }
  if (at.kind === "knot") { // clove-hitch look: wraps, a DIAGONAL crossing back over them, a short tail tucked out below
    const k = (at.axis ?? UP).clone().normalize(), [e1, e2] = basis(k), Rr = at.postR + r * 1.02, Rc = at.postR + r * 3.1;
    const turns = at.turns ?? 2, pitch = 2.3 * r, p1 = exitPhi(k, e1, e2, d), tail = at.tail ?? 0.04;
    let pc = p1 + Math.PI; // crossing side: opposite the exit unless asked
    if (at.front) { const fp = at.front.clone().addScaledVector(k, -at.front.dot(k)); if (fp.lengthSq() > 1e-6) pc = Math.atan2(fp.dot(e2), fp.dot(e1)); }
    while (pc > p1) pc -= 2 * Math.PI; while (pc < p1 - 2 * Math.PI) pc += 2 * Math.PI;
    const pTop = pc - 2 * Math.PI * turns; // helix from pTop (top) to p1 (axial 0)
    const ax = (ph: number) => (pitch * (p1 - ph)) / (2 * Math.PI);
    const ring = (ph: number, h: number, rad: number) => p.clone().addScaledVector(k, h).addScaledVector(e1, rad * Math.cos(ph)).addScaledVector(e2, rad * Math.sin(ph));
    // the crossing runs diagonally across the front of the wraps (lean ~ 45 deg on the post's surface) instead of
    // straight up, and only just tops the upper wrap, so it reads as a hitch, not a hook
    const pts: V3[] = [], hTop = ax(pTop), H = hTop + pitch * 1.1, lean = Math.min(1.25, (0.9 * H) / Rc);
    // tail end (short, angled out from under the lowest wrap) -> up the crossing (outside the wraps) to the top
    pts.push(ring(pc + lean + 0.18, -pitch * 0.9 - tail, Rc + 0.01));
    pts.push(ring(pc + lean + 0.08, -pitch * 0.9 - tail * 0.5, Rc + 0.004));
    const nc = 10;
    for (let i = 0; i <= nc; i++) { const t = i / nc; pts.push(ring(pc + lean * (1 - t), -pitch * 0.9 + (H + pitch * 0.9) * t, Rc)); }
    // over the top into the wraps (radius eases in), then the wraps down to the exit
    const nh = Math.round(18 * turns);
    for (let i = 1; i <= nh; i++) {
      const t = i / nh, ph = pTop + (p1 - pTop) * t, e = Math.max(0, 1 - t * turns * 2.2), rad = Rr + (Rc - Rr) * e;
      pts.push(ring(ph, ax(ph) + pitch * 1.1 * e, rad));
    }
    return { pts, exit: pts[pts.length - 1].clone() };
  }
  // ankle loop: one turn round the leg (slight pitch so the turn clears itself), tail sticking out, exit toward d
  const k = (at.axis ?? UP).clone().normalize(), [e1, e2] = basis(k), Rr = (at.legR ?? 0.012) + r * 1.05;
  const pitch = 2.2 * r, p1 = exitPhi(k, e1, e2, d), p0 = p1 - 2 * Math.PI * 1.1;
  const ring = (ph: number) => p.clone().addScaledVector(k, (pitch * (ph - p0)) / (2 * Math.PI) - pitch * 0.5).addScaledVector(e1, Rr * Math.cos(ph)).addScaledVector(e2, Rr * Math.sin(ph));
  const pts: V3[] = [];
  const s0 = ring(p0), tn = ring(p0 + 0.01).sub(s0).normalize();
  pts.push(s0.clone().addScaledVector(tn, -0.04).addScaledVector(k, -0.006));
  for (let i = 0; i <= 22; i++) pts.push(ring(p0 + ((p1 - p0) * i) / 22));
  return { pts, exit: pts[pts.length - 1].clone() };
}

// ===================================================================================================================
// tube builder (preallocated buffers, rebuilt in place): rings with parallel-transport frames, rounded end caps
// ===================================================================================================================
type Ring = { c: V3; t: V3; n: V3; b: V3; rad: number; nc: number; tilt: number; s: number };
const CAP = [[0.5, 0.866], [0.866, 0.5], [0.995, 0.1]]; // [sin, cos] of the cap ring angles
/** rings along a centreline (radius r) with rounded caps; frame0 = optional start normal for continuity */
function stripRings(pts: V3[], s: number[], r: number, cap0: boolean, cap1: boolean): Ring[] {
  const n = pts.length, out: Ring[] = [];
  if (n < 2) return out;
  const T: V3[] = [];
  for (let i = 0; i < n; i++) {
    const t = pts[Math.min(n - 1, i + 1)].clone().sub(pts[Math.max(0, i - 1)]);
    if (t.lengthSq() < 1e-14) t.copy(i > 0 ? T[i - 1] : V(1, 0, 0)); T.push(t.normalize());
  }
  let N = Math.abs(T[0].y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
  N.addScaledVector(T[0], -N.dot(T[0])).normalize();
  const rings: Ring[] = [];
  for (let i = 0; i < n; i++) {
    if (i > 0) { N = N.clone().addScaledVector(T[i], -N.dot(T[i])); if (N.lengthSq() < 1e-10) N = Math.abs(T[i].y) < 0.9 ? V(0, 1, 0).addScaledVector(T[i], -T[i].y) : V(1, 0, 0); N.normalize(); }
    rings.push({ c: pts[i], t: T[i], n: N, b: T[i].clone().cross(N), rad: r, nc: 1, tilt: 0, s: s[i] });
  }
  if (cap0) for (let j = CAP.length - 1; j >= 0; j--) { const [sn, cs] = CAP[j], R0 = rings[0]; out.push({ ...R0, c: R0.c.clone().addScaledVector(R0.t, -r * sn), rad: r * cs, nc: cs, tilt: -sn, s: R0.s - r * sn }); }
  for (const R1 of rings) out.push(R1);
  if (cap1) for (let j = 0; j < CAP.length; j++) { const [sn, cs] = CAP[j], R1 = rings[n - 1]; out.push({ ...R1, c: R1.c.clone().addScaledVector(R1.t, r * sn), rad: r * cs, nc: cs, tilt: sn, s: R1.s + r * sn }); }
  return out;
}
class TubeBuffer {
  geo = new THREE.BufferGeometry(); cap = 0;
  pos!: Float32Array; nor!: Float32Array; uv!: Float32Array; sA!: Float32Array; idx!: Uint32Array;
  constructor(public radial: number, rings = 160) { this.ensure(rings); }
  ensure(rings: number) {
    if (rings <= this.cap) return;
    const cap = Math.max(rings, Math.ceil(this.cap * 1.5)), nv = cap * (this.radial + 1);
    this.pos = new Float32Array(nv * 3); this.nor = new Float32Array(nv * 3); this.uv = new Float32Array(nv * 2); this.sA = new Float32Array(nv);
    this.idx = new Uint32Array(cap * this.radial * 6);
    const g = this.geo;
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("uv", new THREE.BufferAttribute(this.uv, 2).setUsage(THREE.DynamicDrawUsage));
    g.setAttribute("aS", new THREE.BufferAttribute(this.sA, 1).setUsage(THREE.DynamicDrawUsage));
    g.setIndex(new THREE.BufferAttribute(this.idx, 1).setUsage(THREE.DynamicDrawUsage));
    this.cap = cap;
  }
  build(strips: Ring[][], lay: number) {
    let total = 0; for (const s of strips) total += s.length;
    this.ensure(total);
    const R = this.radial, P = this.pos, Nn = this.nor, U = this.uv, S = this.sA, I = this.idx;
    let v = 0, ii = 0;
    const mn = V(1e9, 1e9, 1e9), mx = V(-1e9, -1e9, -1e9); let rmax = 0;
    const dir = V(), nrm = V();
    for (const st of strips) {
      const v0 = v;
      for (const ring of st) {
        mn.min(ring.c); mx.max(ring.c); rmax = Math.max(rmax, ring.rad);
        for (let j = 0; j <= R; j++) {
          const th = (j / R) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
          dir.copy(ring.n).multiplyScalar(c).addScaledVector(ring.b, s);
          nrm.copy(dir).multiplyScalar(ring.nc).addScaledVector(ring.t, ring.tilt).normalize();
          P[v * 3] = ring.c.x + dir.x * ring.rad; P[v * 3 + 1] = ring.c.y + dir.y * ring.rad; P[v * 3 + 2] = ring.c.z + dir.z * ring.rad;
          Nn[v * 3] = nrm.x; Nn[v * 3 + 1] = nrm.y; Nn[v * 3 + 2] = nrm.z;
          U[v * 2] = ring.s / lay; U[v * 2 + 1] = j / R; S[v] = ring.s;
          v++;
        }
      }
      for (let k = 0; k < st.length - 1; k++) for (let j = 0; j < R; j++) {
        const a = v0 + k * (R + 1) + j, b = a + R + 1;
        I[ii++] = a; I[ii++] = a + 1; I[ii++] = b; I[ii++] = b; I[ii++] = a + 1; I[ii++] = b + 1;
      }
    }
    const g = this.geo;
    for (const k of ["position", "normal", "uv", "aS"]) (g.attributes[k] as THREE.BufferAttribute).needsUpdate = true;
    g.index!.needsUpdate = true; g.setDrawRange(0, ii);
    if (v > 0) { const c = mn.clone().add(mx).multiplyScalar(0.5); g.boundingSphere = new THREE.Sphere(c, mn.distanceTo(mx) / 2 + rmax + 0.01); }
    g.boundingBox = null;
  }
}
const arcLengths = (pts: V3[]) => { const s = [0]; for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + pts[i].distanceTo(pts[i - 1])); return s; };
/** sub-polyline between arc lengths s0 and s1 (interpolated ends) */
function slice(pts: V3[], s: number[], s0: number, s1: number): { p: V3[]; s: number[] } {
  const at = (x: number) => {
    let i = 1; while (i < s.length - 1 && s[i] < x) i++;
    const t = (x - s[i - 1]) / Math.max(1e-9, s[i] - s[i - 1]);
    return pts[i - 1].clone().lerp(pts[i], clamp(t));
  };
  const p: V3[] = [at(s0)], ss: number[] = [s0];
  for (let i = 0; i < s.length; i++) if (s[i] > s0 + 1e-6 && s[i] < s1 - 1e-6) { p.push(pts[i].clone()); ss.push(s[i]); }
  p.push(at(s1)); ss.push(s1);
  return { p, s: ss };
}
/** replace the corner at index i (a via point) by a quadratic through it, from e before to e after (arc length) */
function filletAt(pts: V3[], i: number, e: number): V3[] {
  const s = arcLengths(pts), sv = s[i], s0 = Math.max(0, sv - e), s1 = Math.min(s[s.length - 1], sv + e);
  if (s1 - s0 < 1e-4) return pts;
  const A = slice(pts, s, s0, s0).p[0], Bp = slice(pts, s, s1, s1).p[0], Vv = pts[i];
  const C = Vv.clone().multiplyScalar(2).sub(A.clone().add(Bp).multiplyScalar(0.5));
  const mid: V3[] = [];
  for (let k = 0; k <= 8; k++) { const t = k / 8, u = 1 - t; mid.push(V(u * u * A.x + 2 * u * t * C.x + t * t * Bp.x, u * u * A.y + 2 * u * t * C.y + t * t * Bp.y, u * u * A.z + 2 * u * t * C.z + t * t * Bp.z)); }
  const out: V3[] = [];
  for (let k = 0; k < pts.length; k++) if (s[k] < s0 - 1e-6) out.push(pts[k]);
  out.push(...mid);
  for (let k = 0; k < pts.length; k++) if (s[k] > s1 + 1e-6) out.push(pts[k]);
  return out;
}

// ===================================================================================================================
// hero rope
// ===================================================================================================================
export type RopePose = {
  a: V3; b: V3; via?: V3[]; length?: number; slack?: number; floorY?: number;
  bFrom?: V3; endT?: number; endPath?: "drop" | "lift"; endLift?: number;
  vib?: number; vib2?: number; gold?: number; glow?: number; glint?: number; glintAmt?: number;
  reveal?: number; dash?: { from?: number; period?: number; duty?: number } | null;
  attachA?: Attach; attachB?: Attach;
};
/** ink: "hull" (default) = a constant-pixel outline in a dark shade of the rope's own colour (inverted hull, NOINK),
 *  so the gold / grey survives at any size; "pass" = layer 0, outlined black by the vasa InkPass (only for ropes wider
 *  than ~12 px on screen); "none" = no outline. outlinePx = hull width in px at 1920 px frame height. */
export type RopeOpts = { score?: number; radius?: number; gold?: number; radial?: number; ink?: "hull" | "pass" | "none"; outlinePx?: number; castShadow?: boolean; seed?: number };
/** constant-pixel inverted-hull outline material (back faces pushed out along the screen-space normal) */
export function outlineMaterial(color: THREE.ColorRepresentation, px: number) {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  const uPx = { value: px }, uRes = { value: new THREE.Vector2(1080, 1920) };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uOutPx = uPx; sh.uniforms.uOutRes = uRes;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uOutPx; uniform vec2 uOutRes;")
      .replace("#include <project_vertex>", `#include <project_vertex>
        { vec4 nC = projectionMatrix * vec4( normalize( normalMatrix * normal ), 0.0 ); vec2 dS = nC.xy; float l = length( dS );
          if ( l > 1e-6 ) gl_Position.xy += ( dS / l ) * ( uOutPx * uOutRes.y / 1920.0 ) * 2.0 / uOutRes * gl_Position.w; }`);
  };
  m.customProgramCacheKey = () => "ropeOutline1";
  m.userData.uPx = uPx; m.userData.uRes = uRes;
  return m;
}
const _sz = new THREE.Vector2();
const bindRes = (mesh: THREE.Mesh, uRes: { value: THREE.Vector2 }) => {
  mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); if (rt) uRes.value.set(rt.width, rt.height); else { r.getDrawingBufferSize(_sz); uRes.value.copy(_sz); } };
};
/** where a moving free end is at progress t along its path */
function endPathAt(from: V3, to: V3, t: number, mode: "drop" | "lift") {
  const q = clamp(t);
  if (mode === "drop") { // horizontal eases out, height falls with gravity (t^2)
    const h = 1 - (1 - q) * (1 - q);
    return V(from.x + (to.x - from.x) * h, from.y + (to.y - from.y) * q * q, from.z + (to.z - from.z) * h);
  }
  const h = easeInOut(q), y = easeOut3(q);
  return V(from.x + (to.x - from.x) * h, from.y + (to.y - from.y) * y, from.z + (to.z - from.z) * h);
}
export class Rope {
  readonly mesh: THREE.Mesh; readonly material: THREE.MeshPhysicalMaterial; readonly outline: THREE.Mesh | null = null;
  r: number; score: number; seed: number;
  points: V3[] = []; s: number[] = []; length = 0;
  /** index range of the span (between the attachments) in `points` */
  span: [number, number] = [0, 0];
  private tube: TubeBuffer;
  private uGlint = { value: new THREE.Vector3(-99, 0.06, 0) };
  private uGlintCol = { value: new THREE.Color(ROPE_COL.glint) };
  constructor(M: Mats | null, o: RopeOpts = {}) {
    this.score = o.score ?? 4; this.r = o.radius ?? ropeRadius(this.score); this.seed = o.seed ?? 1;
    this.tube = new TubeBuffer(o.radial ?? 10, 160);
    const m = makeRopeMaterial(M);
    const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey.call(m);
    const uG = this.uGlint, uC = this.uGlintCol;
    m.onBeforeCompile = function (this: THREE.Material, sh, rr) {
      prev.call(this, sh, rr);
      sh.uniforms.uRopeGlint = uG; sh.uniforms.uRopeGlintCol = uC;
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute float aS;\nvarying float vRopeS;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRopeS = aS;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vRopeS; uniform vec3 uRopeGlint; uniform vec3 uRopeGlintCol;")
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          { float gq = (vRopeS - uRopeGlint.x) / uRopeGlint.y; totalEmissiveRadiance += uRopeGlintCol * (uRopeGlint.z * exp(-gq * gq)); }`);
    };
    m.customProgramCacheKey = () => `${prevKey}|ropeGlint1`;
    this.material = m;
    this.mesh = new THREE.Mesh(this.tube.geo, m);
    this.mesh.castShadow = o.castShadow ?? true; this.mesh.receiveShadow = true; this.mesh.frustumCulled = true;
    const ink = o.ink ?? "hull";
    if (ink !== "pass") this.mesh.layers.set(NOINK);
    if (ink === "hull") {
      const om = outlineMaterial("#3a2a10", o.outlinePx ?? 2.4), ol = new THREE.Mesh(this.tube.geo, om);
      ol.castShadow = false; ol.receiveShadow = false; ol.layers.set(NOINK); bindRes(ol, om.userData.uRes);
      this.mesh.add(ol); this.outline = ol;
    }
    this.setGold(o.gold ?? 1, 0);
  }
  setScore(score: number) { this.score = score; this.r = ropeRadius(score); return this; }
  setRadius(r: number) { this.r = r; return this; }
  /** colour state: gold 0 (grey, one-way) .. 1 (gold, two-way); glow 0..1 adds a gold emissive */
  setGold(gold: number, glow = 0) {
    const g = clamp(gold), m = this.material;
    m.color.copy(GREY).lerp(GOLD, g);
    m.roughness = 1 - 0.22 * g; // gold fibre a little silkier
    m.emissive.copy(GOLD).multiplyScalar(0.55 * clamp(glow));
    if (this.outline) (this.outline.material as THREE.MeshBasicMaterial).color.copy(m.color).multiplyScalar(0.16 + 0.1 * clamp(glow));
    return this;
  }
  update(p: RopePose): this {
    const r = this.r, f = (p.floorY ?? 0) + r, via = p.via ?? [];
    const A = p.a.clone();
    const free = !!p.bFrom;
    let Bt = free && (p.endT ?? 1) < 1 ? endPathAt(p.bFrom!, p.b, p.endT ?? 1, p.endPath ?? "drop") : p.b.clone();
    if (p.endLift) Bt.y += p.endLift;
    const atAspec: Attach = p.attachA ?? { kind: "hand" };
    const atBspec: Attach = p.attachB ?? (free ? { kind: "end" } : { kind: "hand" });
    const dirTo = (from: V3, to: V3) => { const d = to.clone().sub(from); return d.lengthSq() > 1e-12 ? d.normalize() : V(1, 0, 0); };
    let atA = attachPath(atAspec, A, dirTo(A, via[0] ?? Bt), r);
    let atB = attachPath(atBspec, Bt, dirTo(Bt, via[via.length - 1] ?? A), r);
    let ctrl = [atA.exit, ...via, atB.exit];
    const chords = () => ctrl.slice(1).map((q, i) => q.distanceTo(ctrl[i]));
    let c = chords(), C = c.reduce((x, y) => x + y, 0);
    let L = (p.length ?? C * (1 + TAUT)) + (p.slack ?? 0);
    // a free end can't be farther from its last support than the rope reaches: pull it in (pendulum swing)
    if (free) {
      const prev = ctrl[ctrl.length - 2], reach = L - (C - c[c.length - 1]);
      const dEnd = atB.exit.distanceTo(prev);
      if (dEnd > reach && reach > 1e-3) {
        const k = reach / dEnd;
        Bt = prev.clone().add(Bt.clone().sub(prev).multiplyScalar(k)); Bt.y = Math.max(Bt.y, (p.floorY ?? 0));
        atB = attachPath(atBspec, Bt, dirTo(Bt, prev), r); ctrl = [atA.exit, ...via, atB.exit]; c = chords(); C = c.reduce((x, y) => x + y, 0);
      }
    }
    L = Math.max(L, C);
    // pieces
    let pts: V3[] = []; const viaIdx: number[] = [];
    const cmax = Math.max(...c, 1e-6);
    for (let i = 0; i < c.length; i++) {
      const Li = c[i] + ((L - C) * c[i]) / Math.max(1e-9, C);
      const pc = ropePiece(ctrl[i], ctrl[i + 1], Li, { floor: f, ppm: 22, minPts: 8, maxPts: 90, seed: this.seed * 31 + i });
      // vibration (twang / boing): mode 1 along the sag direction, mode 2 lateral; fades out where it lies on the floor
      const vib = (p.vib ?? 0) * (c[i] / cmax), vib2 = (p.vib2 ?? 0) * (c[i] / cmax);
      if (Math.abs(vib) + Math.abs(vib2) > 1e-6 && pc.length > 2) {
        const ch = ctrl[i + 1].clone().sub(ctrl[i]).normalize(), dn = V(0, -1, 0).addScaledVector(ch, ch.y);
        if (dn.lengthSq() < 1e-6) dn.set(1, 0, 0); dn.normalize();
        const lat = ch.clone().cross(UP); if (lat.lengthSq() < 1e-6) lat.set(0, 0, 1); lat.normalize();
        const ss = arcLengths(pc), tot = ss[ss.length - 1];
        for (let k = 1; k < pc.length - 1; k++) {
          const sg = ss[k] / tot, w = sstep(f + 0.005, f + 0.2, pc[k].y);
          pc[k].addScaledVector(dn, vib * Math.sin(Math.PI * sg) * w).addScaledVector(lat, vib2 * Math.sin(2 * Math.PI * sg) * w);
        }
      }
      if (i > 0) { viaIdx.push(pts.length - 1); pts.push(...pc.slice(1)); } else pts.push(...pc);
    }
    for (let k = viaIdx.length - 1; k >= 0; k--) pts = filletAt(pts, viaIdx[k], Math.max(0.035, 3 * r));
    for (const q of pts) if (q.y < f) q.y = f;
    // attachments: [rope end ... exit] + span + [exit ... rope end]
    const head = atA.pts.slice(0, -1), tailB = atB.pts.slice(0, -1).reverse();
    const all = [...head, ...pts, ...tailB];
    this.span = [head.length, head.length + pts.length - 1];
    const s = arcLengths(all), total = s[s.length - 1];
    this.points = all; this.s = s; this.length = total;
    // strips: reveal (thrown rope) and dash (ghost rope)
    const reveal = clamp(p.reveal ?? 1), sEnd = reveal >= 1 ? total : total * reveal;
    const strips: Ring[][] = [];
    if (sEnd > 1e-4) {
      const dash = p.dash;
      if (dash) {
        const sSpan0 = s[this.span[0]], sSpan1 = s[this.span[1]];
        const s0 = sSpan0 + (sSpan1 - sSpan0) * clamp(dash.from ?? 0), per = dash.period ?? 0.21, duty = dash.duty ?? 0.62;
        if (s0 > 1e-4) { const q = slice(all, s, 0, Math.min(s0, sEnd)); strips.push(stripRings(q.p, q.s, r, true, true)); }
        const rd = r * 0.92; // dashes are inset by their cap length so the gaps stay open
        for (let x = s0 + per * (1 - duty) * 0.5; x < sEnd; x += per) {
          const xa = x + rd, xb = Math.min(sEnd, x + per * duty) - rd; if (xb - xa < 0.002) continue;
          const q = slice(all, s, xa, xb); strips.push(stripRings(q.p, q.s, rd, true, true));
        }
      } else if (sEnd < total) { const q = slice(all, s, 0, sEnd); strips.push(stripRings(q.p, q.s, r, true, true)); }
      else strips.push(stripRings(all, s, r, true, true));
    }
    this.tube.build(strips, layOf(r));
    this.mesh.visible = strips.length > 0;
    // colour, glow, glint (glint position as a fraction of the span a -> b)
    if (p.gold !== undefined || p.glow !== undefined) this.setGold(p.gold ?? 1, p.glow ?? 0);
    const gl = p.glint ?? -1, ga = p.glintAmt ?? (gl >= 0 && gl <= 1 ? 1 : 0);
    if (ga > 0 && gl > -0.2 && gl < 1.2) {
      const sa = s[this.span[0]], sb = s[this.span[1]];
      this.uGlint.value.set(sa + (sb - sa) * gl, Math.max(0.05, 0.035 * (sb - sa)), 2.2 * ga);
    } else this.uGlint.value.set(-99, 0.06, 0);
    return this;
  }
  /** point at fraction f (0..1) of the whole rope's length */
  pointAt(f: number, out = V()) { return this.atS(clamp(f) * this.length, out); }
  /** point at fraction f of the span (between the attachments) */
  spanPointAt(f: number, out = V()) { const a = this.s[this.span[0]] ?? 0, b = this.s[this.span[1]] ?? 0; return this.atS(a + (b - a) * clamp(f), out); }
  private atS(x: number, out: V3) {
    const s = this.s, p = this.points; if (p.length === 0) return out.set(0, 0, 0);
    let i = 1; while (i < s.length - 1 && s[i] < x) i++;
    return out.copy(p[i - 1]).lerp(p[i], clamp((x - s[i - 1]) / Math.max(1e-9, s[i] - s[i - 1])));
  }
  /** geometric interpenetration check of the last centreline against boxes (and vertical cylinders {x, z, r, y0, y1}):
   *  hits = number of samples inside an obstacle grown by the rope radius, worst = deepest penetration (m) */
  clearance(boxes: THREE.Box3[], cyls: { x: number; z: number; r: number; y0: number; y1: number }[] = []) {
    return ropeClearance(this.points, this.r, boxes, cyls);
  }
  dispose() { this.tube.geo.dispose(); this.material.dispose(); (this.outline?.material as THREE.Material | undefined)?.dispose(); }
}
/** 穿模 check for any centreline: samples every ~2 cm */
export function ropeClearance(pts: V3[], r: number, boxes: THREE.Box3[], cyls: { x: number; z: number; r: number; y0: number; y1: number }[] = []) {
  let hits = 0, worst = 0; const q = V();
  for (let i = 1; i < pts.length; i++) {
    const n = Math.max(1, Math.ceil(pts[i].distanceTo(pts[i - 1]) / 0.02));
    for (let k = 0; k < n; k++) {
      q.copy(pts[i - 1]).lerp(pts[i], k / n);
      for (const b of boxes) {
        const dx = Math.min(q.x - (b.min.x - r), b.max.x + r - q.x), dy = Math.min(q.y - (b.min.y - r), b.max.y + r - q.y), dz = Math.min(q.z - (b.min.z - r), b.max.z + r - q.z);
        if (dx > 0 && dy > 0 && dz > 0) { hits++; worst = Math.max(worst, Math.min(dx, dy, dz)); }
      }
      for (const c of cyls) {
        if (q.y < c.y0 || q.y > c.y1) continue;
        const d = c.r + r - Math.hypot(q.x - c.x, q.z - c.z);
        if (d > 0) { hits++; worst = Math.max(worst, d); }
      }
    }
  }
  return { hits, worst };
}

/** 穿模 check against a built set: raycasts every centreline segment against root's layer-0 meshes and returns the
 *  surfaces it crosses (hits) and where. Surfaces closer than the rope radius are not caught, pair it with
 *  clearance(). No BVH: ~0.5-2 s per rope on a merged set, for previews and tests, not per frame. */
export function ropeRaycast(pts: V3[], root: THREE.Object3D) {
  const rc = new THREE.Raycaster(), at: V3[] = [], objects: THREE.Object3D[] = [], d = V();
  root.updateMatrixWorld(true);
  for (let i = 1; i < pts.length; i++) {
    d.copy(pts[i]).sub(pts[i - 1]); const L = d.length(); if (L < 1e-6) continue;
    rc.set(pts[i - 1], d.divideScalar(L)); rc.near = 0; rc.far = L;
    const hit = rc.intersectObject(root, true).filter((h) => (h.object as THREE.Mesh).isMesh);
    if (hit.length) { at.push(hit[0].point.clone()); objects.push(hit[0].object); }
  }
  return { hits: at.length, at, objects };
}

// ===================================================================================================================
// motion: pure functions of t = seconds since the event
// ===================================================================================================================
/** damped spring step response 0 -> 1 with overshoot */
const stepResp = (t: number, freq: number, zeta: number) => {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * freq, wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t));
};
export const ropeMotion = {
  /** snap taut: slack (m) runs out in `pull` s, the rope overshoots past straight (upward), quivers and settles;
   *  a glint runs from a to b. amp ~ 2 % of the span reads well. */
  twang(t: number, o: { from?: number; amp?: number; freq?: number; decay?: number; pull?: number; glint?: number } = {}) {
    const from = o.from ?? 0.15, pull = o.pull ?? 0.07, amp = o.amp ?? 0.05, fq = o.freq ?? 5.5, dec = o.decay ?? 0.2, gd = o.glint ?? 0.38;
    if (t < 0) return { slack: from, vib: 0, vib2: 0, glint: -1, glintAmt: 0 };
    const k = clamp(t / pull), slack = from * Math.pow(1 - k, 3);
    const vib = -amp * Math.sin(2 * Math.PI * fq * t) * Math.exp(-t / dec);
    const vib2 = 0.3 * amp * Math.sin(2 * Math.PI * fq * 1.7 * t + 0.6) * Math.exp(-t / (0.7 * dec));
    const gp = t / gd;
    return { slack, vib, vib2, glint: gp <= 1.1 ? gp : -1, glintAmt: gp <= 1.1 ? Math.sin(Math.PI * clamp(gp / 1.1)) ** 0.5 : 0 };
  },
  /** go slack with a springy boing: slack (m) from `from` to `to`, overshooting (the rope droops past its rest and
   *  bounces back up) and settling in ~0.8 s; a small lateral wobble rides on it */
  boing(t: number, o: { to: number; from?: number; freq?: number; zeta?: number; wobble?: number }) {
    const from = o.from ?? 0;
    if (t < 0) return { slack: from, vib: 0, vib2: 0 };
    const s = stepResp(t, o.freq ?? 2.3, o.zeta ?? 0.24);
    const w = o.wobble ?? 0.04;
    return { slack: Math.max(0, from + (o.to - from) * s), vib: 0, vib2: w * Math.sin(2 * Math.PI * 3.2 * t) * Math.exp(-t / 0.3) };
  },
  /** a released end falling to the floor: endT is the time fraction of the fall (Rope applies gravity), then two
   *  small landing hops (endLift, m) */
  drop(t: number, o: { dur?: number; bounce?: number } = {}) {
    const dur = o.dur ?? 0.42, b = o.bounce ?? 0.035;
    if (t < 0) return { endT: 0, endLift: 0 };
    if (t < dur) return { endT: t / dur, endLift: 0 };
    const u = t - dur;
    return { endT: 1, endLift: b * Math.abs(Math.sin((Math.PI * u) / 0.13)) * Math.exp(-u / 0.09) };
  },
  /** hand-over-hand haul: `pulled` metres so far (subtract from the length), `stroke` 0..1 within the current pull
   *  (for the arm: 0..0.55 pulling back, 0.55..1 reaching forward again), a small vib on each pull */
  haul(t: number, o: { dist: number; pulls?: number; dur?: number }) {
    const n = o.pulls ?? 3, dur = o.dur ?? 1.2, P = dur / n;
    if (t <= 0) return { pulled: 0, stroke: 0, vib: 0 };
    if (t >= dur) return { pulled: o.dist, stroke: 1, vib: 0 };
    const i = Math.floor(t / P), lt = (t - i * P) / P, k = easeInOut(lt / 0.55);
    return { pulled: (o.dist * (i + k)) / n, stroke: lt, vib: -0.015 * Math.sin(Math.PI * clamp(lt / 0.55)) };
  },
  /** someone grabs the floor end: it lifts to their hand in `lift` s (pose: bFrom = floor point, b = hand,
   *  endPath "lift"), the slack runs out and the rope snaps taut, turning gold with a glow pulse */
  snap(t: number, o: { lift?: number; from?: number; amp?: number } = {}) {
    const lift = o.lift ?? 0.2, from = o.from ?? 0.6;
    if (t < 0) return { endT: 0, slack: from, vib: 0, vib2: 0, glint: -1, glintAmt: 0, gold: 0, glow: 0 };
    const endT = easeOut3(t / lift), pre = from * (1 - easeInOut(t / lift)) + 0.0;
    const tw = ropeMotion.twang(t - lift, { from: 0, amp: o.amp ?? 0.05 });
    const g = sstep(lift - 0.04, lift + 0.12, t), glow = t < lift ? 0 : Math.exp(-(t - lift) / 0.45) * sstep(lift, lift + 0.06, t);
    return { endT, slack: t < lift ? pre : tw.slack, vib: tw.vib, vib2: tw.vib2, glint: tw.glint, glintAmt: tw.glintAmt, gold: g, glow };
  },
  /** a rope shooting from a to b (thrown from a card / the phone): reveal 0..1, then a glint on arrival */
  throwRope(t: number, o: { dur?: number } = {}) {
    const dur = o.dur ?? 0.32;
    if (t < 0) return { reveal: 0, glint: -1, glintAmt: 0 };
    const tw = ropeMotion.twang(t - dur, { from: 0 });
    return { reveal: 1 - Math.pow(1 - clamp(t / dur), 2), glint: tw.glint, glintAmt: tw.glintAmt };
  },
  /** "glows gold": rises in 0.15 s, holds, fades over `dur` */
  glowPulse(t: number, o: { dur?: number } = {}) {
    if (t < 0) return 0;
    return sstep(0, 0.15, t) * Math.exp(-Math.max(0, t - 0.15) / (o.dur ?? 0.8));
  },
};

// ===================================================================================================================
// ghost holder (line 05): dotted-outline figure card holding the far end; pops into dots
// ===================================================================================================================
const GH = { W: 1.4, H: 1.6, foot: 0.04, ppm: 560 }; // card size (m) at height 1.45, canvas px per m
const ghostCache = new Map<string, THREE.CanvasTexture>();
const ghostKey: string[] = [];
type GhostStyle = { face: boolean; dot: string; rim: string; halo: string; fill: string };
/** draws the ghost on a canvas: arm = [side, angle deg], pop progress 0..1 (0 = intact) */
function drawGhost(g: CanvasRenderingContext2D, side: number, ang: number, pop: number, st: GhostStyle) {
  const P = GH.ppm, W = GH.W * P, H = GH.H * P;
  g.clearRect(0, 0, W, H);
  const X = (x: number) => W / 2 + x * P, Y = (y: number) => H - (y + GH.foot) * P;
  const dots: [number, number][] = [];
  const path = (pts: [number, number][], gap = 0.046, closed = false) => {
    const q = closed ? [...pts, pts[0]] : pts;
    let carry = 0;
    for (let i = 1; i < q.length; i++) {
      const [x0, y0] = q[i - 1], [x1, y1] = q[i], L = Math.hypot(x1 - x0, y1 - y0);
      let d = carry;
      while (d <= L) { const t = d / L; dots.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); d += gap; }
      carry = d - L;
    }
  };
  const circle = (cx: number, cy: number, r: number, n = 48): [number, number][] => Array.from({ length: n }, (_, i) => [cx + r * Math.cos((i / n) * 6.283), cy + r * Math.sin((i / n) * 6.283)]);
  const bean: [number, number][] = Array.from({ length: 56 }, (_, i) => {
    const t = (i / 56) * 6.283, c = Math.cos(t), s = Math.sin(t);
    return [0.165 * Math.sign(c) * Math.pow(Math.abs(c), 0.8) * (1 - 0.13 * s), 0.765 + 0.27 * s];
  });
  const head = circle(0, 1.235, 0.2);
  // fills (ghostly volume), drawn first and faded quickly when popping
  const fa = Math.pow(1 - pop, 2);
  if (fa > 0.01) {
    g.fillStyle = st.fill; g.globalAlpha = fa;
    for (const shp of [bean, head]) { g.beginPath(); shp.forEach(([x, y], i) => (i ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.closePath(); g.fill(); }
    g.globalAlpha = 1;
  }
  path(head, 0.046, true); path(bean, 0.046, true);
  for (const sd of [-1, 1]) { path([[sd * 0.06, 0.52], [sd * 0.075, 0.27], [sd * 0.085, 0.03]]); path([[sd * 0.085, 0.03], [sd * 0.15, 0.025]], 0.036); }
  const sh: [number, number] = [side * 0.14, 0.93], a = (ang * Math.PI) / 180, L = 0.47;
  const hand: [number, number] = [sh[0] + side * L * Math.cos(a), sh[1] + L * Math.sin(a)];
  path([sh, [sh[0] + side * L * 0.5 * Math.cos(a) , sh[1] + L * 0.5 * Math.sin(a) + 0.015], hand]);
  path([[-side * 0.14, 0.93], [-side * 0.2, 0.74], [-side * 0.215, 0.56]]);
  if (st.face) { dots.push([-0.068, 1.255], [0.068, 1.255]); path([[-0.05, 1.165], [-0.02, 1.15], [0.02, 1.15], [0.05, 1.165]], 0.033); }
  // dots (halo, rim, core); pop scatters them outward, shrinking and fading
  const R = rng(4242), cx = 0, cy = 0.9, ep = easeOut3(pop);
  const pts = dots.map(([x, y], i) => {
    const r0 = R(), r1 = R(); void i;
    if (pop <= 0) return [x, y, 1] as [number, number, number];
    const dx = x - cx, dy = y - cy, l = Math.hypot(dx, dy) || 1, th = Math.atan2(dy, dx) + (r0 - 0.5) * 0.9, dist = (0.06 + 0.42 * r1) * ep;
    return [x + Math.cos(th) * dist, y + Math.sin(th) * dist - 0.12 * pop * pop, Math.max(0, 1 - pop * (0.8 + 0.4 * r1))] as [number, number, number];
  });
  const rad = 0.0095 * P;
  for (const [x, y, k] of pts) { if (k <= 0) continue; g.fillStyle = st.halo; g.globalAlpha = 0.42 * k; g.beginPath(); g.arc(X(x), Y(y), rad * 2.7 * (0.6 + 0.4 * k), 0, 6.283); g.fill(); }
  g.globalAlpha = 1;
  for (const [x, y, k] of pts) { if (k <= 0) continue; const rr = rad * (0.35 + 0.65 * k); g.fillStyle = st.rim; g.beginPath(); g.arc(X(x), Y(y), rr + 1.8, 0, 6.283); g.fill(); g.fillStyle = st.dot; g.beginPath(); g.arc(X(x), Y(y), rr, 0, 6.283); g.fill(); }
  if (pop > 0 && pop < 1) { // burst: a ring and a few four-point sparkles
    g.strokeStyle = st.dot; g.globalAlpha = 0.8 * (1 - pop); g.lineWidth = 5 * (1 - pop) + 1;
    g.beginPath(); g.arc(X(cx), Y(cy), (0.2 + 0.45 * ep) * P, 0, 6.283); g.stroke();
    const S = rng(77);
    for (let i = 0; i < 9; i++) {
      const th = S() * 6.283, d = (0.25 + 0.4 * S()) * (0.4 + 0.6 * ep), sz = (0.03 + 0.03 * S()) * Math.sin(Math.PI * pop) * P;
      const x = X(cx + Math.cos(th) * d), y = Y(cy + Math.sin(th) * d * 1.3);
      g.fillStyle = st.halo; g.globalAlpha = 1;
      g.beginPath(); g.moveTo(x, y - sz); g.lineTo(x + sz * 0.25, y); g.lineTo(x, y + sz); g.lineTo(x - sz * 0.25, y); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x - sz, y); g.lineTo(x, y + sz * 0.25); g.lineTo(x + sz, y); g.lineTo(x, y - sz * 0.25); g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
  }
  return hand;
}
export class GhostHolder {
  readonly mesh: THREE.Mesh; readonly material: THREE.MeshBasicMaterial;
  hand = V(); height: number; style: GhostStyle;
  constructor(parent: THREE.Object3D, o: { height?: number; face?: boolean; dot?: string; rim?: string; halo?: string; fill?: string } = {}) {
    this.height = o.height ?? 1.45;
    this.style = { face: o.face ?? true, dot: o.dot ?? "#fffdf4", rim: o.rim ?? "rgba(64,74,120,0.9)", halo: o.halo ?? "#ffe9a8", fill: o.fill ?? "rgba(232,240,255,0.30)" };
    const k = this.height / 1.45, geo = new THREE.PlaneGeometry(GH.W * k, GH.H * k);
    geo.translate(0, (GH.H / 2 - GH.foot) * k, 0);
    this.material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    this.mesh = new THREE.Mesh(geo, this.material);
    this.mesh.layers.set(NOINK); this.mesh.renderOrder = 3; this.mesh.visible = false;
    parent.add(this.mesh);
  }
  /** place the ghost at `feet`, facing the camera (yaw only), its arm reaching toward `toward` (the rope's next point);
   *  returns the world hand point. pop = seconds since it burst (0.45 s, then hidden). */
  update(o: { feet: V3; camera: THREE.Camera | V3; toward: V3; pop?: number; opacity?: number }): V3 {
    const cam = (o.camera as THREE.Camera).isObject3D ? (o.camera as THREE.Camera).getWorldPosition(V()) : (o.camera as V3);
    const yaw = Math.atan2(cam.x - o.feet.x, cam.z - o.feet.z), R = V(Math.cos(yaw), 0, -Math.sin(yaw)), k = this.height / 1.45;
    const pop = o.pop === undefined || o.pop < 0 ? 0 : clamp(o.pop / 0.45);
    if (pop >= 1) { this.mesh.visible = false; return this.hand; }
    const sh = (side: number) => o.feet.clone().addScaledVector(R, side * 0.14 * k).addScaledVector(UP, 0.93 * k);
    const d0 = o.toward.clone().sub(sh(0)), side = d0.dot(R) >= 0 ? 1 : -1, d = o.toward.clone().sub(sh(side));
    const dx = Math.abs(d.dot(R)), dy = d.y;
    const ang = Math.round(clamp((Math.atan2(dy, Math.max(0.05, dx)) * 180) / Math.PI, -65, 55) / 3) * 3;
    const ps = Math.round(pop * 14);
    const key = `${side}|${ang}|${ps}|${JSON.stringify(this.style)}`;
    let tex = ghostCache.get(key), hand2: [number, number] | null = null;
    if (!tex) {
      const c = document.createElement("canvas"); c.width = Math.round(GH.W * GH.ppm); c.height = Math.round(GH.H * GH.ppm);
      hand2 = drawGhost(c.getContext("2d")!, side, ang, ps / 14, this.style);
      tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      ghostCache.set(key, tex); ghostKey.push(key);
      while (ghostKey.length > 48) { const old = ghostKey.shift()!; ghostCache.get(old)?.dispose(); ghostCache.delete(old); }
    }
    if (!hand2) { const a = (ang * Math.PI) / 180; hand2 = [side * 0.14 + side * 0.47 * Math.cos(a), 0.93 + 0.47 * Math.sin(a)]; }
    if (this.material.map !== tex) { const first = !this.material.map; this.material.map = tex; if (first) this.material.needsUpdate = true; }
    this.material.opacity = o.opacity ?? 1;
    this.mesh.visible = true; this.mesh.position.copy(o.feet); this.mesh.rotation.set(0, yaw, 0);
    const fwd = V(Math.sin(yaw), 0, Math.cos(yaw));
    this.hand.copy(o.feet).addScaledVector(R, hand2[0] * k).addScaledVector(UP, hand2[1] * k).addScaledVector(fwd, 0.01);
    return this.hand;
  }
}

// ===================================================================================================================
// class network (line 09): 84 seats, 775 ties = 413 two-way + 362 one-way
// ===================================================================================================================
export type Seat = {
  /** where this person holds their ropes (the spot-side hand when `hands` is given) */
  hand: V3;
  /** floor point beside the chair where an uncaught rope end lies (and where this person's own one-way ropes touch down) */
  spot: V3; chair?: V3; lane?: number; row?: number;
  /** both raised hands (the exact ends of the drawn stick arms): every rope leaves from the hand on the side it goes */
  hands?: [V3, V3];
  /** head centre + radius (m): the network only ties pairs whose taut rope passes clear of every head (the real cast:
   *  seated head centre 1.153 m, radius 0.205, i.e. 0.95-1.36 m; a seated raised hand is at 1.21-1.27 m, AT head height,
   *  so ropes pass between heads, not over them) */
  head?: V3; headR?: number;
};
/** the plan centre of a seat (head, else the mid point of the hands, else the hand) */
const seatCentre = (s: Seat) => s.head ?? (s.hands ? s.hands[0].clone().lerp(s.hands[1], 0.5) : s.hand);
/** the hand a rope from seat `s` toward world point `to` leaves from: of `hands`, the one on the side it goes */
export function handFor(s: Seat, to: V3): V3 {
  if (!s.hands) return s.hand;
  const c = s.hands[0].clone().lerp(s.hands[1], 0.5), dx = to.x - c.x, dz = to.z - c.z;
  const k0 = (s.hands[0].x - c.x) * dx + (s.hands[0].z - c.z) * dz;
  return k0 >= 0 ? s.hands[0] : s.hands[1];
}
/** plan (xz) distance from point c to segment ab */
const planSegDist = (c: V3, a: V3, b: V3) => {
  const ux = b.x - a.x, uz = b.z - a.z, L2 = ux * ux + uz * uz, t = L2 > 1e-12 ? clamp(((c.x - a.x) * ux + (c.z - a.z) * uz) / L2) : 0;
  return Math.hypot(a.x + ux * t - c.x, a.z + uz * t - c.z);
};
/** the taut hand-to-hand span between seats i and j clears every head (plan test with `margin`, for heads whose height
 *  range contains the span's height) */
export function spanClearsHeads(seats: Seat[], i: number, j: number, margin = 0.022): boolean {
  const A = handFor(seats[i], seatCentre(seats[j])), Bh = handFor(seats[j], seatCentre(seats[i]));
  const yLo = Math.min(A.y, Bh.y) - 0.06, yHi = Math.max(A.y, Bh.y);
  for (let k = 0; k < seats.length; k++) {
    const s = seats[k]; if (!s.head) continue;
    const R = s.headR ?? 0.205;
    if (yHi < s.head.y - R || yLo > s.head.y + R) continue;
    if (planSegDist(s.head, A, Bh) < R + margin) return false;
  }
  return true;
}
export type Tie = {
  holder: number; target: number; two: boolean; score: 3 | 4 | 5;
  /** sweep key 0..1 (front -> back across the room): the counter counts ropes with order <= sweep */
  order: number;
  /** random key 0..1 (all-over-the-room reveal stagger) */
  rnd: number;
  /** flop key 0..1 for the line-06 chain reaction (across the room, left -> right, jittered) */
  delay: number;
  /** one-way rope that stays grey even in the imagined version (about 1 in 16 ropes: 94 %, not 100 %) */
  imagGrey: boolean;
};
/** demo seat layout: cols x rows double desks (default 6 x 7 = 42 desks = 84 seats) on the classroom's pitch
 *  (2.05 m x 1.2 m, desk 1.3 x 0.55, seats 0.32 m off the desk centre, chairs 0.55 m behind it, desks face -z).
 *  hand = where a seated person holds their ropes: raised (default 1.3 m) and toward the aisle, so the taut gold web
 *  clears the desks (NOTE: the real seated cast's head spans 0.95-1.36 m, so for the real set use classroomSeats with heads); spot = floor beside
 *  the chair on the aisle side (where an uncaught rope end lies); lane = x of that aisle's centre line.
 *  route(H, T, i): the floor path of a one-way rope from H.spot to T.spot that keeps to the aisles and to the strip
 *  between a row's chair backs and the next row's desk fronts, so floor ropes never cross a desk or chair leg. */
export function classSeats(o: { cols?: number; rows?: number; colPitch?: number; rowPitch?: number; handY?: number; centre?: V3 } = {}) {
  const cols = o.cols ?? 6, rows = o.rows ?? 7, cp = o.colPitch ?? 2.05, rp = o.rowPitch ?? 1.2, hy = o.handY ?? 1.3, c0 = o.centre ?? V();
  const seats: Seat[] = [], desks: THREE.Box3[] = [], deskCentres: V3[] = [], chairs: V3[] = [];
  const zRow = (r: number) => c0.z + (r - (rows - 1) / 2) * rp;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c0.x + (c - (cols - 1) / 2) * cp, z = zRow(r);
    deskCentres.push(V(x, 0, z));
    desks.push(new THREE.Box3(V(x - 0.65, 0.71, z - 0.275), V(x + 0.65, 0.765, z + 0.275)));
    for (const sd of [-1, 1]) {
      const chair = V(x + sd * 0.32, 0, z + 0.55); chairs.push(chair);
      const j = rng(4243 + seats.length * 17); // per-person hand jitter (outward / up-down / fore-aft) so the web isn't a rigid truss
      seats.push({ hand: V(x + sd * (0.56 + 0.06 * j()), hy + (j() - 0.5) * 0.1, z + 0.32 + 0.08 * j()), spot: V(x + sd * 0.86, 0, z + 0.44), chair, lane: x + sd * cp / 2, row: r });
    }
  }
  // cross strips: strip k lies in front of row k (k = rows: behind the last row). Between rows it is the gap from the
  // chair backs (z + 0.77) to the next desk's front legs (z + rp - 0.255); in front / behind the room it is open floor.
  const strip = (k: number) => (k <= 0 ? zRow(0) - 0.6 : k >= rows ? zRow(rows - 1) + 1.0 : zRow(k - 1) + (0.77 + rp - 0.255) / 2);
  const stripHalf = (k: number) => (k <= 0 || k >= rows ? 0.12 : Math.max(0.01, (rp - 0.255 - 0.77) / 2 - 0.03));
  const aisleHalf = Math.max(0.02, (cp - 1.3) / 2 - 0.12);
  const route = (H: Seat, T: Seat, i: number): V3[] => {
    const R = rng(7919 + i * 31), lh = (H.lane ?? H.spot.x) + (R() * 2 - 1) * aisleHalf, lt = (T.lane ?? T.spot.x) + (R() * 2 - 1) * aisleHalf;
    const a = V(H.spot.x, 0, H.spot.z), b = V(T.spot.x, 0, T.spot.z);
    if (Math.abs((H.lane ?? 0) - (T.lane ?? 0)) < 1e-3) return [a, V(lh, 0, a.z + 0.05), V(lh, 0, b.z + 0.05), b];
    const rH = H.row ?? 0, rT = T.row ?? 0;
    const k = rH === rT ? rH + 1 : rT > rH ? rH + 1 + Math.floor(R() * (rT - rH)) : rT + 1 + Math.floor(R() * (rH - rT));
    const zs = strip(k) + (R() * 2 - 1) * stripHalf(k);
    return [a, V(lh, 0, a.z + 0.05), V(lh, 0, zs), V(lt, 0, zs), V(lt, 0, b.z + 0.05), b];
  };
  return { seats, desks, deskCentres, chairs, route };
}
/** a seat anchor of sets/classroom.ts (structural type so this kit does not import the set) */
export type ClassSeatAnchor = { i: number; row: number; col: number; side: 0 | 1; pos: V3; facing: number };
/** the REAL seminar room (sets/classroom.ts v2): Seats for RopeWeb / generateClassNetwork built from set.anchors, a
 *  route() through its real aisles, and the obstacles to check the web against.
 *  Layout read from the anchors: 3 blocks x 2 abutting desks x 7 rows (desk 1.3 x 0.55, desk centre = mean hip x of a
 *  desk column, desk z = row hip z - 0.6), inner aisles at anchors.aisleX, outer aisles by the radiators / lockers.
 *  - hands: o.hands(i) -> [hand0, hand1] = the two raised hands of person i, from the cast after posing it for the shot
 *    camera (crowd.handWorld(i, 0 / 1)); default: both stick arms raised out to the sides (the cast's seated "hold" with
 *    aim [{dir: 130}, {dir: 50}] puts hands only roughly 0.3 m out: solve the aims per person to 0.32 m, see
 *    preview/rope_g_common.ts). The cards are yaw-only billboards,
 *    so a drawn hand moves when the camera yaws: take the hands at the shot's camera (a slow orbit drifts them ~0.3 m
 *    x the yaw change in radians).
 *  - head: the seated cast head (centre hip + 0.68 m, radius 0.205) so generateClassNetwork only ties head-clear pairs.
 *  - spot: each person's own floor gap beside the chair (outer seats: the aisle; inner seats: the gap between the two
 *    chairs of their desk), at the chair's z: where an uncaught end lies at their feet.
 *  - route(H, T): H's gap -> back between the chairs to the strip behind H's row (chair backs .. next row's desk legs)
 *    -> along it to the nearest aisle -> along the aisle -> the strip behind T's row -> forward into T's gap. Never under
 *    a desk, never through a chair or desk leg.
 *  - obstacles: boxes (desk tops, legs, floor runners; chair seats, backs, legs) and cylinders (seated torsos, heads)
 *    for ropeClearance / RopeWeb.paths checks. */
export function classroomSeats(A: { seats: ClassSeatAnchor[]; aisleX: number[] }, o: { hands?: (i: number) => [V3, V3]; headY?: number; headR?: number; handY?: number; handOut?: number } = {}) {
  const S = A.seats, nRow = Math.max(...S.map((s) => s.row)) + 1, nCol = Math.max(...S.map((s) => s.col)) + 1;
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  const deskZ = Array.from({ length: nRow }, (_, r) => mean(S.filter((s) => s.row === r).map((s) => s.pos.z)) - 0.6);
  const deskX = Array.from({ length: nCol }, (_, c) => mean(S.filter((s) => s.col === c).map((s) => s.pos.x)));
  const nBlk = Math.ceil(nCol / 2), blkL = (b: number) => deskX[2 * b] - 0.65, blkR = (b: number) => deskX[Math.min(nCol - 1, 2 * b + 1)] + 0.65;
  const hy = o.headY ?? 0.681, hr = o.headR ?? 0.205, handY = o.handY ?? 1.21, out = o.handOut ?? 0.31;
  // lanes: outer aisles (clear of the backpacks by the block edge and the radiators / lockers), the inner aisles
  const lanes: { x: number; half: number }[] = [{ x: blkL(0) - 0.43, half: 0.08 }, ...A.aisleX.map((x) => ({ x, half: 0.26 })), { x: blkR(nBlk - 1) + 0.45, half: 0.1 }];
  // strip k = the floor between row k-1's chair backs and row k's desk front legs (k = nRow: behind the last row)
  const stripZ = (k: number) => (k >= nRow ? deskZ[nRow - 1] + 0.97 : deskZ[k - 1] + 0.887);
  const stripHalf = (k: number) => (k >= nRow ? 0.15 : 0.055);
  const info: { row: number; gapX: number; chairZ: number }[] = [];
  const seats: Seat[] = S.map((s, i) => {
    const p = (s.col % 2) * 2 + s.side, b = Math.floor(s.col / 2);
    const gapX = p === 0 ? blkL(b) - 0.17 : p === 3 ? blkR(b) + 0.17 : deskX[s.col];
    const back = V(Math.sin(s.facing), 0, Math.cos(s.facing)), lat = V(Math.cos(s.facing), 0, -Math.sin(s.facing));
    const chair = V(s.pos.x - back.x * 0.06, 0, s.pos.z - back.z * 0.06);
    info.push({ row: s.row, gapX, chairZ: chair.z });
    const hands: [V3, V3] = o.hands ? o.hands(i) : [V(s.pos.x - lat.x * out, handY, s.pos.z - lat.z * out), V(s.pos.x + lat.x * out, handY, s.pos.z + lat.z * out)];
    const spot = V(gapX, 0, chair.z);
    const seat: Seat = { hand: V(), spot, chair, row: s.row, lane: gapX, hands, head: V(s.pos.x, s.pos.y + hy, s.pos.z), headR: hr };
    seat.hand = handFor(seat, spot);
    return seat;
  });
  const idx = new Map<Seat, number>(); seats.forEach((s, i) => idx.set(s, i));
  const route = (H: Seat, T: Seat, i: number): V3[] => {
    const h = info[idx.get(H)!], t = info[idx.get(T)!], R = rng(7919 + i * 31);
    const zH = stripZ(h.row + 1) + (R() * 2 - 1) * stripHalf(h.row + 1), zT = stripZ(t.row + 1) + (R() * 2 - 1) * stripHalf(t.row + 1);
    const a = V(H.spot.x, 0, H.spot.z), b = V(T.spot.x, 0, T.spot.z);
    if (h.row === t.row) { const z = zH; return [a, V(a.x, 0, z), V(b.x, 0, z), b]; }
    let best = lanes[0], bc = 1e9;
    for (const L of lanes) { const c = Math.abs(a.x - L.x) + Math.abs(b.x - L.x); if (c < bc) { bc = c; best = L; } }
    const lx = best.x + (R() * 2 - 1) * best.half;
    return [a, V(a.x, 0, zH), V(lx, 0, zH), V(lx, 0, zT), V(b.x, 0, zT), b];
  };
  // obstacles (axis-aligned, 1 cm proud of the modelled parts for the small random chair yaw / offsets)
  const boxes: THREE.Box3[] = [], cyls: { x: number; z: number; r: number; y0: number; y1: number }[] = [];
  const bx = (x: number, y: number, z: number, w: number, h: number, d: number) => boxes.push(new THREE.Box3(V(x - w / 2, y - h / 2, z - d / 2), V(x + w / 2, y + h / 2, z + d / 2)));
  for (let r = 0; r < nRow; r++) for (let c = 0; c < nCol; c++) {
    const x = deskX[c], z = deskZ[r];
    bx(x, 0.735, z, 1.32, 0.04, 0.57);                                                     // desk top + edge band
    for (const sx of [-0.6, 0.6]) { bx(x + sx, 0.37, z, 0.05, 0.74, 0.5); }                 // legs + runner frame (one slab per side)
  }
  S.forEach((s, i) => {
    const c = seats[i].chair!, sg = Math.cos(s.facing) >= 0 ? 1 : -1;
    bx(c.x, 0.45, c.z - 0.01 * sg, 0.46, 0.05, 0.44);                                        // seat shell
    bx(c.x, 0.745, c.z + 0.235 * sg, 0.44, 0.22, 0.06);                                      // back (bent, tilted)
    for (const lx of [-0.195, 0.195]) for (const lz of [-0.18, 0.2]) bx(c.x + lx, 0.23, c.z + lz * sg, 0.035, 0.46, 0.035);
    cyls.push({ x: s.pos.x, z: s.pos.z, r: 0.16, y0: 0.47, y1: s.pos.y + hy - hr });          // seated torso (card bean)
    cyls.push({ x: s.pos.x, z: s.pos.z, r: hr, y0: s.pos.y + hy - hr, y1: s.pos.y + hy + hr }); // head
  });
  return { seats, route, boxes, cyls, deskX, deskZ, lanes };
}
/** deterministic friendship network over the seats: exactly n ties (default 775), `two` of them two-way (413).
 *  Pair weight = (near-neighbour falloff + a small long-range floor) x popularity; ties drawn by weighted sampling
 *  without replacement (exponential races), every person gets >= 3 ties; the `two` most reciprocal pairs (close,
 *  similar popularity, a little luck) become two-way; one-way ropes are held by the less popular person 80 % of the
 *  time (aspirational, line 10), so the popular few collect grey ends at their feet. */
export function generateClassNetwork(seats: (Seat | V3)[], seed = 2016, o: { n?: number; two?: number; lambda?: number; far?: number; popular?: number; headMargin?: number } = {}) {
  const P = seats.map((s) => ((s as Seat).hand ? seatCentre(s as Seat) : (s as V3)));
  // seats with heads: only pairs whose taut span clears every head can be tied (no rope through a seated head)
  const withHeads = seats.some((s) => !!(s as Seat).head);
  const clearOK = (i: number, j: number) => !withHeads || spanClearsHeads(seats as Seat[], i, j, o.headMargin ?? 0.022);
  const N = P.length, nT = o.n ?? 775, nTwo = o.two ?? 413, lam = o.lambda ?? 1.9, far = o.far ?? 0.006, R = rng(seed);
  const gauss = () => { const u = Math.max(1e-9, R()), v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283 * v); };
  const pop = P.map(() => Math.exp(0.3 * gauss()));
  const popular: number[] = [];
  while (popular.length < Math.min(o.popular ?? 6, N)) { const i = Math.floor(R() * N); if (!popular.includes(i)) { popular.push(i); pop[i] = 3.2 + R(); } }
  type Pair = { i: number; j: number; d: number; key: number };
  const pairs: Pair[] = [];
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const d = Math.hypot(P[i].x - P[j].x, P[i].z - P[j].z), w = (Math.exp(-d / lam) + far) * Math.sqrt(pop[i] * pop[j]);
    const key = Math.log(Math.max(1e-12, R())) / w; // drawn for every pair so the stream (and the result) is seed-stable
    if (clearOK(i, j)) pairs.push({ i, j, d, key });
  }
  if (pairs.length < nT) throw new Error(`generateClassNetwork: only ${pairs.length} head-clear pairs for ${nT} ties`);
  pairs.sort((a, b) => b.key - a.key);
  const chosen = new Set<number>(), deg = new Array(N).fill(0);
  for (let k = 0; k < Math.min(nT, pairs.length); k++) { chosen.add(k); deg[pairs[k].i]++; deg[pairs[k].j]++; }
  // everyone has at least 3 ties: swap in their best unchosen pair, drop the weakest chosen pair between two busy people
  for (let pass = 0; pass < 4; pass++) for (let v = 0; v < N; v++) while (deg[v] < 3) {
    let add = -1; for (let k = 0; k < pairs.length; k++) if (!chosen.has(k) && (pairs[k].i === v || pairs[k].j === v)) { add = k; break; }
    let drop = -1; for (let k = pairs.length - 1; k >= 0; k--) if (chosen.has(k) && deg[pairs[k].i] > 8 && deg[pairs[k].j] > 8) { drop = k; break; }
    if (add < 0 || drop < 0) break;
    chosen.delete(drop); deg[pairs[drop].i]--; deg[pairs[drop].j]--; chosen.add(add); deg[pairs[add].i]++; deg[pairs[add].j]++;
  }
  const list = [...chosen].map((k) => pairs[k]);
  const recip = list.map((p) => ({ p, s: Math.exp(-p.d / 1.8) + 0.6 * (1 - Math.min(1, Math.abs(Math.log(pop[p.i] / pop[p.j])) / 1.5)) + 0.55 * R() }));
  recip.sort((a, b) => b.s - a.s);
  // sweep / flop keys from the room's extent
  let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
  for (const q of P) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); }
  const ties: Tie[] = recip.map(({ p }, k) => {
    const two = k < nTwo, lowFirst = pop[p.i] <= pop[p.j];
    const holderLow = R() < 0.8, holder = two ? p.i : (lowFirst === holderLow ? p.i : p.j), target = holder === p.i ? p.j : p.i;
    const close = Math.exp(-p.d / 2), u = R();
    const score = (two ? (u < 0.3 + 0.35 * close ? 5 : u < 0.92 ? 4 : 3) : (u < 0.55 ? 3 : u < 0.9 ? 4 : 5)) as 3 | 4 | 5;
    const mz = (P[p.i].z + P[p.j].z) / 2, mx = (P[p.i].x + P[p.j].x) / 2;
    return {
      holder, target, two, score,
      order: clamp((mz - z0) / Math.max(1e-6, z1 - z0) * 0.97 + 0.03 * R()),
      rnd: R(),
      delay: clamp((mx - x0) / Math.max(1e-6, x1 - x0) * 0.85 + 0.15 * R()),
      imagGrey: false,
    };
  });
  const one = ties.filter((t) => !t.two), nGrey = Math.round(ties.length / 16);
  for (let k = 0; k < nGrey && one.length; k++) { const i = Math.floor(R() * one.length); one[i].imagGrey = true; one.splice(i, 1); }
  const stats = { total: ties.length, two: ties.filter((t) => t.two).length, one: ties.filter((t) => !t.two).length, imagGrey: nGrey,
    nominations: 2 * nTwo + (ties.length - nTwo), minDeg: Math.min(...deg) };
  return { ties, popularity: pop, popular, stats };
}

// ===================================================================================================================
// rope web: every rope of the class in ONE mesh, all states driven in the shader
// ===================================================================================================================
export type WebState = {
  grey?: number; gold?: number; greyLight?: number; sweep?: number; sweepGlow?: number; sweepDim?: number;
  flop?: number; flopSpread?: number; dash?: number; stagger?: number; inflate?: number; glow?: number;
};
const WEB_GLSL_HEAD = /* glsl */ `
attribute vec3 alt; attribute vec3 altN; attribute vec4 aT; attribute vec4 aD;
uniform float uWFlop, uWFlopSpread, uWGrey, uWGold, uWGreyLight, uWSweep, uWStagger, uWFloorY, uWInflate;
varying float vWCut; varying float vWGold; varying float vWLight; varying float vWFlash; varying float vWCounted; varying float vWS; varying float vWDash;
float webBoing(float t) {
  if (t <= 0.0) return 0.0;
  float z = 0.24, w = 6.2832 * 2.3, q = sqrt(1.0 - z * z), wd = w * q;
  return 1.0 - exp(-z * w * t) * (cos(wd * t) + z / q * sin(wd * t));
}
float webK() { // 1 = real shape; one-way ropes flop from the imagined (alt) shape with a springy overshoot
  float kind = aT.x;
  return (kind > 0.5 && kind < 1.5) ? webBoing(uWFlop - aD.x * uWFlopSpread) : 1.0;
}
void webShape(out vec3 P, out vec3 Nn) {
  float k = webK(), kind = aT.x;
  P = mix(alt, position, k);
  Nn = normalize(mix(altN, normal, clamp(k, 0.0, 1.0)));
  float lit = kind > 0.5 ? uWGreyLight : 0.0;
  P += Nn * aT.w * uWInflate * lit;
  P.y = max(P.y, uWFloorY + 0.0015);
}
void webVary() {
  float k = webK(), kind = aT.x;
  float u = kind < 0.5 ? uWGold : uWGrey;
  float g = clamp(u * (1.0 + uWStagger) - aD.y * uWStagger, 0.0, 1.0);
  float along = kind < 0.5 ? (1.0 - abs(aT.z * 2.0 - 1.0)) : aT.z;
  vWCut = g * 1.03 - along - 0.015;
  vWGold = kind < 0.5 ? 1.0 : (kind > 1.5 ? 0.0 : 1.0 - clamp(k, 0.0, 1.0));
  vWLight = kind > 0.5 ? uWGreyLight * clamp(k, 0.0, 1.0) : 0.0;
  vWCounted = step(aT.y, uWSweep);
  vWFlash = vWCounted * exp(-(uWSweep - aT.y) / 0.045);
  vWS = aD.z;
  vWDash = (kind > 0.5 && kind < 1.5) ? 1.0 - clamp(k, 0.0, 1.0) : 0.0;
}`;
let WEBMAP: THREE.Texture | null = null;
export class RopeWeb {
  readonly mesh: THREE.Mesh; readonly material: THREE.MeshLambertMaterial; readonly depth: THREE.MeshDepthMaterial;
  /** the web's outline (inverted hull, a child of mesh): a second draw call with the same shader states */
  readonly outline: THREE.Mesh | null = null;
  readonly ties: Tie[]; readonly tris: number;
  /** per tie: the real and the imagined centreline (resampled, as built) and its radius, for 穿模 checks */
  readonly paths: { real: V3[]; imag: V3[]; r: number }[] = [];
  readonly U = {
    uWFlop: { value: 99 }, uWFlopSpread: { value: 1.2 }, uWGrey: { value: 1 }, uWGold: { value: 1 }, uWGreyLight: { value: 0 },
    uWSweep: { value: 0 }, uWSweepGlow: { value: 0.8 }, uWSweepDim: { value: 0 }, uWStagger: { value: 0.6 }, uWFloorY: { value: 0 },
    uWInflate: { value: 0.35 }, uWDash: { value: 0 }, uWGlow: { value: 0 }, uWFill: { value: 0.55 },
    uWGoldCol: { value: new THREE.Color(ROPE_COL.gold) }, uWGreyCol: { value: new THREE.Color(ROPE_COL.grey) },
    uWLightCol: { value: new THREE.Color("#dfe9ff") }, uWGlowCol: { value: new THREE.Color(ROPE_COL.glow) },
  };
  private sorted: Tie[];
  /** seats: hand + floor spot per person; ties from generateClassNetwork. o.radius(score) defaults to the hero radius
   *  x 0.85; minY = lowest a gold rope may sag (default 1.18; >= 0.8 clears desk tops; heads are avoided by the network choosing head-clear pairs). Cheap on SwiftShader:
   *  18 rings x 5 sides per rope, no end caps, Lambert + albedo map + flat fill (U.uWFill), no shadows by default
   *  (castShadow: true adds ~0.1 s / frame). o.route(H, T, i) = floor waypoints for a one-way rope from H.spot to T.spot (default: straight). */
  constructor(M: Mats | null, seats: Seat[], ties: Tie[], o: { floorY?: number; radial?: number; pts?: number; radius?: (s: number) => number; minY?: number; caps?: boolean; castShadow?: boolean; receiveShadow?: boolean; ink?: boolean; outlinePx?: number; route?: (H: Seat, T: Seat, i: number) => V3[] } = {}) {
    this.ties = ties;
    const fy = o.floorY ?? 0, RAD = o.radial ?? 5, NP = Math.max(16, o.pts ?? 24), radOf = o.radius ?? ((s: number) => ropeRadius(s) * 0.85), minY = o.minY ?? 1.18;
    const caps = o.caps ?? false, capL = caps ? CAP.length : 0;
    const capN = capL * 2, ringsPer = NP + capN, vPer = ringsPer * (RAD + 1), nv = ties.length * vPer;
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), alt = new Float32Array(nv * 3), altN = new Float32Array(nv * 3);
    const uv = new Float32Array(nv * 2), aT = new Float32Array(nv * 4), aD = new Float32Array(nv * 4);
    const idx = new Uint32Array(ties.length * (ringsPer - 1) * RAD * 6);
    const resample = (pts: V3[], n: number) => {
      const s = arcLengths(pts), L = s[s.length - 1], out: V3[] = [];
      let i = 1;
      for (let k = 0; k < n; k++) {
        const x = (L * k) / (n - 1); while (i < s.length - 1 && s[i] < x) i++;
        out.push(pts[i - 1].clone().lerp(pts[i], clamp((x - s[i - 1]) / Math.max(1e-9, s[i] - s[i - 1]))));
      }
      return out;
    };
    // one-way rope, real shape: hangs from the hand, touches down and lies along to the holder's floor spot, then
    // follows the floor route to the target's spot. Corners are chamfered (5 cm) and kept as exact samples so the
    // resampled tube never cuts a corner across a desk or chair leg.
    const oneWay = (H: Seat, T: Seat, ti: number, f: number): V3[] => {
      const a = V(H.spot.x, f, H.spot.z), hd = handFor(H, H.spot);
      const drop = ropePiece(hd, a, hd.distanceTo(a) * 1.22, { floor: f, ppm: 24, minPts: 12, maxPts: 48, seed: ti * 3 + 1 });
      for (const q of drop) q.y = Math.max(q.y, f);
      const raw = (o.route ? o.route(H, T, ti) : [H.spot, T.spot]).map((q) => V(q.x, f, q.z));
      const fl: V3[] = [a]; for (const q of raw.slice(1)) if (q.distanceTo(fl[fl.length - 1]) > 0.02) fl.push(q);
      if (fl.length < 2) fl.push(V(T.spot.x, f, T.spot.z));
      const keys: V3[] = [];
      let din = a.clone().sub(drop[Math.max(0, drop.length - 3)]).setY(0); if (din.lengthSq() < 1e-8) din.set(1, 0, 0); din.normalize();
      for (let k = 0; k < fl.length - 1; k++) {
        const dout = fl[k + 1].clone().sub(fl[k]), lo = dout.length(); dout.normalize();
        const li = k === 0 ? 0.12 : fl[k].distanceTo(fl[k - 1]);
        if (1 - din.dot(dout) > 0.02) { const e = Math.min(0.05, 0.4 * lo, 0.4 * li); if (k > 0) keys.push(fl[k].clone().addScaledVector(din, -e)); keys.push(fl[k].clone().addScaledVector(dout, e)); }
        else if (k > 0) keys.push(fl[k]);
        din = dout;
      }
      keys.push(fl[fl.length - 1]);
      const nD = Math.max(6, Math.min(10, NP - keys.length - 2));
      const head = resample(drop, nD);                                  // ends exactly at a
      const fp = [a, ...keys], seg = fp.slice(1).map((q, k) => q.distanceTo(fp[k])), Ls = seg.reduce((x, y) => x + y, 0);
      let spare = NP - nD - keys.length;
      const add = seg.map((l) => Math.floor((spare * l) / Math.max(1e-6, Ls)));
      spare -= add.reduce((x, y) => x + y, 0);
      const rem = seg.map((l, k) => ({ k, f: (spare * l) / Math.max(1e-6, Ls) - add[k] })).sort((x, y) => y.f - x.f);
      for (let k = 0; k < spare && k < rem.length; k++) add[rem[k].k]++;
      const out = [...head];
      for (let k = 0; k < keys.length; k++) { for (let j = 1; j <= add[k]; j++) out.push(fp[k].clone().lerp(fp[k + 1], j / (add[k] + 1))); out.push(fp[k + 1]); }
      return out.length === NP ? out : resample(out, NP);
    };
    let v = 0, ii = 0;
    const dir = V(), nrm = V();
    ties.forEach((t, ti) => {
      const r = radOf(t.score), f = fy + r, H = seats[t.holder], T = seats[t.target];
      // imagined / two-way: taut gold between the hands, sag limited so it stays above minY (desk tops, seated heads)
      const hH = handFor(H, seatCentre(T)), hT = handFor(T, seatCentre(H));
      const c = hH.distanceTo(hT), sag = Math.min(0.035 * c + 0.01, Math.max(0.006, Math.min(hH.y, hT.y) - minY - r));
      const air = resample(ropePiece(hH, hT, c * (1 + (8 / 3) * (sag / c) ** 2), { floor: f, ppm: 12, minPts: 6, maxPts: 40, seed: ti }), NP);
      const Rl = t.two ? air : oneWay(H, T, ti, f), A = t.imagGrey ? Rl : air;
      this.paths.push({ real: Rl, imag: A, r });
      const sR = arcLengths(Rl), sA = arcLengths(A), lay = layOf(r), LR = Math.max(1e-6, sR[sR.length - 1]);
      const ringsR = stripRings(Rl, sR, r, caps, caps), ringsA = stripRings(A, sA, r, caps, caps);
      const kind = t.two ? 0 : t.imagGrey ? 2 : 1;
      const v0 = v;
      for (let k = 0; k < ringsR.length; k++) {
        const qR = ringsR[k], qA = ringsA[k], along = sR[Math.min(NP - 1, Math.max(0, k - capL))] / LR;
        for (let j = 0; j <= RAD; j++) {
          const th = (j / RAD) * Math.PI * 2, cs = Math.cos(th), sn = Math.sin(th);
          dir.copy(qR.n).multiplyScalar(cs).addScaledVector(qR.b, sn); nrm.copy(dir).multiplyScalar(qR.nc).addScaledVector(qR.t, qR.tilt).normalize();
          pos[v * 3] = qR.c.x + dir.x * qR.rad; pos[v * 3 + 1] = qR.c.y + dir.y * qR.rad; pos[v * 3 + 2] = qR.c.z + dir.z * qR.rad;
          nor[v * 3] = nrm.x; nor[v * 3 + 1] = nrm.y; nor[v * 3 + 2] = nrm.z;
          dir.copy(qA.n).multiplyScalar(cs).addScaledVector(qA.b, sn); nrm.copy(dir).multiplyScalar(qA.nc).addScaledVector(qA.t, qA.tilt).normalize();
          alt[v * 3] = qA.c.x + dir.x * qA.rad; alt[v * 3 + 1] = qA.c.y + dir.y * qA.rad; alt[v * 3 + 2] = qA.c.z + dir.z * qA.rad;
          altN[v * 3] = nrm.x; altN[v * 3 + 1] = nrm.y; altN[v * 3 + 2] = nrm.z;
          uv[v * 2] = qR.s / lay; uv[v * 2 + 1] = j / RAD;
          aT[v * 4] = kind; aT[v * 4 + 1] = t.order; aT[v * 4 + 2] = along; aT[v * 4 + 3] = r;
          aD[v * 4] = t.delay; aD[v * 4 + 1] = t.rnd; aD[v * 4 + 2] = qR.s; aD[v * 4 + 3] = 0;
          v++;
        }
      }
      for (let k = 0; k < ringsR.length - 1; k++) for (let j = 0; j < RAD; j++) {
        const a = v0 + k * (RAD + 1) + j, b = a + RAD + 1;
        idx[ii++] = a; idx[ii++] = a + 1; idx[ii++] = b; idx[ii++] = b; idx[ii++] = a + 1; idx[ii++] = b + 1;
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    g.setAttribute("alt", new THREE.BufferAttribute(alt, 3)); g.setAttribute("altN", new THREE.BufferAttribute(altN, 3));
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setAttribute("aT", new THREE.BufferAttribute(aT, 4)); g.setAttribute("aD", new THREE.BufferAttribute(aD, 4));
    g.setIndex(new THREE.BufferAttribute(idx, 1)); g.setDrawRange(0, ii);
    g.computeBoundingSphere();
    this.tris = ii / 3;
    this.U.uWFloorY.value = fy;
    // lit material (PBR rig) with the shader-driven states
    // cheap lit material: Lambert with the rope albedo, the rig's sun + shadows, and a flat fill term standing in for
    // the environment light. From 12 m up a rope is 2-4 px wide; PBR + PMREM shading cost ~4x more on SwiftShader
    // (measured: +840 ms vs +220 ms per 1080x1920 frame) for no visible difference.
    const U = this.U;
    WEBMAP ??= (() => { const t = ropeTextures().map.clone(); t.anisotropy = 1; t.needsUpdate = true; return t; })(); // aniso 8 cost ~100 ms here
    const m = new THREE.MeshLambertMaterial({ map: WEBMAP, color: "#ffffff" });
    void M;
    m.onBeforeCompile = function (this: THREE.Material, sh) {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\n" + WEB_GLSL_HEAD)
        .replace("#include <beginnormal_vertex>", "vec3 webP; vec3 webN; webShape(webP, webN); webVary();\nvec3 objectNormal = webN;\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3( tangent.xyz );\n#endif")
        .replace("#include <begin_vertex>", "vec3 transformed = webP;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
        varying float vWCut; varying float vWGold; varying float vWLight; varying float vWFlash; varying float vWCounted; varying float vWS; varying float vWDash;
        uniform vec3 uWGoldCol; uniform vec3 uWGreyCol; uniform vec3 uWLightCol; uniform vec3 uWGlowCol; uniform float uWSweepGlow; uniform float uWSweepDim; uniform float uWDash; uniform float uWGlow; uniform float uWFill;`)
        .replace("void main() {", "void main() {\n  if (vWCut < 0.0) discard;\n  if (vWDash * uWDash > 0.5 && fract(vWS / 0.2) > 0.62) discard;")
        .replace("#include <color_fragment>", `#include <color_fragment>
          // sweep: ropes not yet counted go dark and greyish (x0.2, 65 % desaturated) so the counting front reads on a phone
          float wUn = uWSweepDim * (1.0 - vWCounted), wDim = 1.0 - 0.8 * wUn;
          vec3 wBase = mix(uWGreyCol, uWGoldCol, vWGold);
          wBase = mix(wBase, vec3(dot(wBase, vec3(0.3, 0.5, 0.2))), 0.65 * wUn);
          diffuseColor.rgb *= wBase * wDim;`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          totalEmissiveRadiance += diffuseColor.rgb * uWFill + (uWLightCol * (0.85 * vWLight) + uWGlowCol * (uWGlow * vWGold * 0.5)) * wDim + mix(uWLightCol, uWGlowCol, vWGold) * (vWFlash * uWSweepGlow);`);
    };
    m.customProgramCacheKey = () => "ropeWeb3";
    this.material = m;
    // shadow depth: same vertex states + discard, so shadows follow the reveal and the flop
    const dm = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    dm.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\n" + WEB_GLSL_HEAD)
        .replace("#include <begin_vertex>", "vec3 webP; vec3 webN; webShape(webP, webN); webVary();\nvec3 transformed = webP;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vWCut; varying float vWS; varying float vWDash; uniform float uWDash;")
        .replace("void main() {", "void main() {\n  if (vWCut < 0.0) discard;\n  if (vWDash * uWDash > 0.5 && fract(vWS / 0.2) > 0.62) discard;");
    };
    dm.customProgramCacheKey = () => "ropeWebDepth1";
    this.depth = dm;
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.customDepthMaterial = dm;
    this.mesh.castShadow = o.castShadow ?? false; this.mesh.receiveShadow = o.receiveShadow ?? false; this.mesh.frustumCulled = false;
    if (!(o.ink ?? false)) this.mesh.layers.set(NOINK);
    if ((o.outlinePx ?? 1.6) > 0) { // dark-shade outline so crossing ropes and gold over the floor separate from 12 m up
      const om = new THREE.MeshBasicMaterial({ side: THREE.BackSide }), uPx = { value: o.outlinePx ?? 1.6 }, uRes = { value: new THREE.Vector2(1080, 1920) };
      om.onBeforeCompile = (sh) => {
        Object.assign(sh.uniforms, U, { uOutPx: uPx, uOutRes: uRes });
        sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform float uOutPx; uniform vec2 uOutRes;\n" + WEB_GLSL_HEAD)
          .replace("#include <begin_vertex>", "vec3 webP; vec3 webN; webShape(webP, webN); webVary();\nvec3 transformed = webP;")
          .replace("#include <project_vertex>", `#include <project_vertex>
            { vec4 nC = projectionMatrix * vec4( normalize( normalMatrix * webN ), 0.0 ); vec2 dS = nC.xy; float l = length( dS );
              if ( l > 1e-6 ) gl_Position.xy += ( dS / l ) * ( uOutPx * uOutRes.y / 1920.0 ) * 2.0 / uOutRes * gl_Position.w; }`);
        sh.fragmentShader = sh.fragmentShader.replace("#include <common>", `#include <common>
            varying float vWCut; varying float vWGold; varying float vWLight; varying float vWS; varying float vWDash;
            uniform vec3 uWGoldCol; uniform vec3 uWGreyCol; uniform vec3 uWLightCol; uniform float uWDash;`)
          .replace("void main() {", "void main() {\n  if (vWCut < 0.0) discard;\n  if (vWDash * uWDash > 0.5 && fract(vWS / 0.2) > 0.62) discard;")
          .replace("#include <color_fragment>", "#include <color_fragment>\n  diffuseColor.rgb = mix(uWGreyCol * 0.22, uWGoldCol * 0.18, vWGold) + uWLightCol * (0.5 * vWLight);");
      };
      om.customProgramCacheKey = () => "ropeWebOutline1";
      const ol = new THREE.Mesh(g, om); ol.frustumCulled = false; ol.layers.set(NOINK); ol.castShadow = false; ol.receiveShadow = false;
      bindRes(ol, uRes); this.mesh.add(ol); this.outline = ol;
    }
    this.sorted = [...ties].sort((a, b) => a.order - b.order);
    this.set({});
  }
  set(s: WebState) {
    const U = this.U;
    if (s.grey !== undefined) U.uWGrey.value = s.grey;
    if (s.gold !== undefined) U.uWGold.value = s.gold;
    if (s.greyLight !== undefined) U.uWGreyLight.value = s.greyLight;
    if (s.sweep !== undefined) U.uWSweep.value = s.sweep;
    if (s.sweepGlow !== undefined) U.uWSweepGlow.value = s.sweepGlow;
    if (s.sweepDim !== undefined) U.uWSweepDim.value = s.sweepDim;
    if (s.flop !== undefined) U.uWFlop.value = s.flop;
    if (s.flopSpread !== undefined) U.uWFlopSpread.value = s.flopSpread;
    if (s.dash !== undefined) U.uWDash.value = s.dash;
    if (s.stagger !== undefined) U.uWStagger.value = s.stagger;
    if (s.inflate !== undefined) U.uWInflate.value = s.inflate;
    if (s.glow !== undefined) U.uWGlow.value = s.glow;
    return this;
  }
  /** what the counter shows at a sweep value: ropes counted so far (order <= sweep); counts(1) = 413 / 775 */
  counts(sweep: number) {
    let gold = 0, total = 0;
    for (const t of this.sorted) { if (t.order > sweep) break; total++; if (t.two) gold++; }
    return { gold, total, grey: total - gold };
  }
  dispose() { this.mesh.geometry.dispose(); this.material.dispose(); this.depth.dispose(); (this.outline?.material as THREE.Material | undefined)?.dispose(); }
}
