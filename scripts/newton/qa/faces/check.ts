// FACE vs HUD checker for NewtonFilm (headless: no GL, no browser, no render queue). For every frame it poses the
// film's REAL World exactly as the clearance checker does (scripts/kit/qa/clearance: w.beginFrame(f) -> SEG.pose(w, f)
// -> w.endFrame(P) -> root.updateMatrixWorld), takes every VISIBLE figure's face from the rig's own face drawing
// (the uniforms the face shader draws with: the head ball's centre and radius, the face direction and its right / up
// axes, which already carry the head layer's scale and the slide narrowing), projects the face to the 9:15 screen
// (1080 x 1800, the film's own w.project with the 9:15 lens: story.ts lensFov) with the frame's camera, and reports
// where it lies under the HUD of that frame (the phone-safe layout, layout.ts PHONE / SCREEN):
//   rec, stamp (small) / stampBig (a scene's first 2 s), battery    hud/vlog.tsx (hudRectsAt)
//   card, title                                                      hud/card.tsx, hud/title.tsx (title placed by Pose.title)
//   caption  (the subtitle's real rows' box while one shows)         hud/caption.tsx
//   band     (hud CAPTION_BAND, y 1325..1490, x 54..930, while a subtitle shows and the face misses the rows' box)
//   phone    (the phone app's own things: the icons over the top corners to y 60, the buttons x > 940 from y 950, the
//            post's text from y 1510 left of x 900; layout.ts PHONE; every frame)
//   margin   (the outer 54 px of each side: picture only, another screen shape may trim it; every frame)
// It also checks THE JOINS against the picture: every join of beats.ts JOINS (the camera plans' 12: clock, whip, match)
// inside a scene must sit on a frame where the place changes (the cut), so a re-timed scene that moves a cut without
// its beat is reported; the clock joins are hud/vlog.tsx RACES (== JOINS). And THE WORDS against the joins (camplan
// OVERVIEW item 4): every subtitle screen, fact card and whisper bubble, its last frame as timed and as shown
// (hud/caption.tsx capEnd, hud/card.tsx cardEnd: clipped before the next whip / match join, beats.ts joinClip) against
// the next join after its first frame (== WORDS vs JOINS; --words prints only that table, without posing a frame).
// The Pose's switches are honoured as Film.tsx does: hud:false (no HUD layer; the subtitle and the whisper bubble
// stay), rec:false (no lamp, no stamp), cards:false (no card, no title, the stamp small), captions:false (no subtitle,
// no whisper bubble), and the end black (Pose.top) once it covers the frame.
//   bash scripts/newton/qa/faces/run.sh                        whole film (about 10 s) -> <out>/faces.txt / faces.json
//   bash scripts/newton/qa/faces/run.sh --seg F,G              some scenes;  --from 4380 --to 4420  a range
//   options: --out DIR (default /home/user/newton_work/film/check/whole/faces)  --step 1  --gap 4 (frames between hits
//   that still make one range)  --min 1 (px^2: smaller overlaps are ignored)  --pad 0 (px added round the HUD boxes:
//   the near misses)
//   --zone skin|face|head (which region is tested; default skin)  --dump F,G (print every face and HUD box on those
//   frames)  --quiet  --words (only the words vs joins table, printed; nothing posed, nothing written)
// THE FACE REGIONS, in the face drawing's own coordinates (rig3d drawFace: the drawing spans the head ball's diameter;
// q in ball radii, the eye line at the middle, the eyes at +-0.28, brows about +0.25, the mouth at -0.35):
//   skin  (default) the front of the ball under the hairline (q.y <= 0.45) and inside its outline (|q| <= 0.92): the
//         toon head has no ears or jaw, its cheeks reach the ball's edge; the crown above the brows is hair
//   face  the drawn features: q.x in [-0.62, 0.62], q.y in [-0.78, 0.42] (eyes, brows, mouth, chin)
//   head  the ball's whole outline (hair included)
// The region's points are laid on the front of the ball, projected, and the overlap is measured on their convex hull
// clipped to the HUD box (a round face does not fill its box's corners). Every hit also gives how much of the drawn
// features lies under the item (severity). Occlusion: a face whose five key points (eyes, nose, mouth, chin) are all
// behind another solid (a ray from the camera through the set, the props and the other figures) is listed apart.
import * as THREE from "three";
import * as fs from "fs";
import hooks from "../../../../src/videos/newton/kit.world";
import { hudRectsAt, endBlackAlpha, stampAt, stampRect, titleRect, TITLE_HOME, OFF_AT, VLOG_RECT, CAPTION_BAND, RACES, capEnd, cardEnd, type Rect } from "../../../../src/videos/newton/hud";
import { SCREEN, PHONE } from "../../../../src/videos/newton/layout";
import { BEAT, JOINS, WHIP_CLEAR, joinAfter } from "../../../../src/videos/newton/beats";
import { W, H, CAPTIONS, LINE_IDS, CARDS } from "../../../../src/videos/newton/story";
import { WHISPERS } from "../../../../src/videos/newton/whisper";

const argv = process.argv.slice(2);
const opt = (k: string, d?: string) => { const i = argv.indexOf("--" + k); return i >= 0 ? argv[i + 1] : d; };
const flag = (k: string) => argv.includes("--" + k);
const STEP = Math.max(1, Number(opt("step", "1")));
const GAP = Math.max(Number(opt("gap", "4")), STEP);
const MIN = Number(opt("min", "1"));
const PAD = Number(opt("pad", "0"));
const ZONE = opt("zone", "skin") as "skin" | "face" | "head";
const OUT = opt("out", "/home/user/newton_work/film/check/whole/faces")!;
const QUIET = flag("quiet");
const DUMP = new Set((opt("dump", "") ?? "").split(",").filter(Boolean).map(Number));
const SEGS = hooks.segments;
const fromArg = opt("from"), toArg = opt("to"), segArg = opt("seg");
let F0 = 0, F1 = SEGS[SEGS.length - 1].to;
let segIds = SEGS.map((s) => s.id);
if (fromArg !== undefined || toArg !== undefined) { F0 = Number(fromArg ?? 0); F1 = Number(toArg ?? F1); }
else if (segArg) segIds = segArg.toUpperCase().split(",");
const frames: number[] = [];
for (const s of SEGS) if (segIds.includes(s.id)) for (let f = Math.max(s.from, F0); f <= Math.min(s.to, F1); f += STEP) frames.push(f);

// ---------------------------------------------------------------------------------------------------- the words vs the joins
/** every subtitle screen (a whisper line: its bubble instead), every fact card: its first frame, its last frame as the
 *  timing gives it and as shown, and the next join after its first frame with the frames left clear before that cut.
 *  The rule (camplan OVERVIEW item 4): a whip's cut needs WHIP_CLEAR frames clear before it, a match's cut 0 (nothing
 *  across it); a clock join may be crossed only by card 5 (G04, approved) */
const wordsTable = (): string[] => {
  type WRow = { what: string; kind: "sub" | "whisper" | "card"; from: number; to: number; end: number; speech: number | null };
  const rows: WRow[] = [];
  const wh = new Map(WHISPERS.map((x) => [x.id, x]));
  for (const c of CAPTIONS) {
    const id = LINE_IDS[c.line - 1], w = wh.get(id);
    if (w) { if (c.k === 0) rows.push({ what: `${id} 悄悄说 (the bubble replaces the subtitle)`, kind: "whisper", from: w.word, to: w.capTo, end: w.bubbleOut, speech: w.end }); continue; }
    rows.push({ what: `${id}${c.k ? "/" + (c.k + 1) : ""} ${c.zh}`, kind: "sub", from: c.from, to: c.to, end: capEnd(c), speech: c.end });
  }
  CARDS.forEach((c, i) => rows.push({ what: `card ${i + 1} (${c.id}) ${c.zh}`, kind: "card", from: c.from, to: c.to, end: cardEnd(c), speech: null }));
  rows.sort((a, b) => a.from - b.from);
  let bad = 0;
  const out = rows.map((r) => {
    const j = joinAfter(r.from);
    const clear = j ? j.cut - 1 - r.end : null;
    let st = "ok";
    if (j && clear !== null) {
      if (j.kind === "whip" && clear < WHIP_CLEAR) st = r.kind === "whisper" ? `SHORT: ${clear} clear before the whip (whisper.ts bubble: its own JOIN_GUARD)` : `FAIL: ${clear} clear before the whip (needs ${WHIP_CLEAR})`;
      if (j.kind === "match" && clear < 0) st = "FAIL: across the match cut";
      if (j.kind === "clock" && clear < 0) st = r.kind === "card" && r.what.includes("(G04)") && j.scene === "G" && !j.first ? "ok (approved: card 5 across G's garden clock join)" : "FAIL: across a clock join";
    }
    if (st.startsWith("FAIL")) bad++;
    const clip = r.end < r.to ? (r.kind === "whisper" ? `its subtitle would have run to ${r.to}` : `clipped from ${r.to}`) : "";
    const voice = r.speech !== null && r.end < r.speech ? `gone ${r.speech - r.end} frames before its voice ends (${r.speech})` : "";
    const jn = j ? `${j.kind.padEnd(5)} ${String(j.cut).padStart(4)}` : "none      ";
    return `${r.kind.padEnd(7)} ${String(r.from).padStart(4)}-${String(r.to).padEnd(4)} shown to ${String(r.end).padStart(4)}  next join ${jn}  clear ${clear === null ? "  -" : String(clear).padStart(3)}  ${st}${clip ? "; " + clip : ""}${voice ? "; " + voice : ""}  | ${r.what}`;
  });
  return [`== WORDS vs JOINS (camplan OVERVIEW item 4: ${WHIP_CLEAR} frames clear before a whip's cut, nothing across a whip or match cut; ${bad} FAIL)`,
    `columns: kind, frames as timed, last frame shown (fade / exit included), the next join after its first frame, frames clear before that cut, verdict | what`,
    `joins: ${JOINS.map((j) => `${j.kind} ${j.cut}`).join(", ")}`, ...out];
};
if (flag("words")) { console.log(wordsTable().join("\n")); process.exit(0); }
fs.mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------------------------------------------- the World
const camera = new THREE.PerspectiveCamera(40, W / H, 0.03, 600);
const w: any = hooks.makeWorld((globalThis as any).__mk(), camera);
const SKIP = hooks.skipName ?? /(^|\.)(ink|glow|shadow|light|flame)(\.|$)/;

// ---------------------------------------------------------------------------------------------------- geometry
type Box = { x0: number; y0: number; x1: number; y1: number };
const area = (b: Box) => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
const inter = (a: Box, b: Box): Box => ({ x0: Math.max(a.x0, b.x0), y0: Math.max(a.y0, b.y0), x1: Math.min(a.x1, b.x1), y1: Math.min(a.y1, b.y1) });
const SCR: Box = { x0: 0, y0: 0, x1: W, y1: H };
const BAND: Box = { ...CAPTION_BAND };
/** the phone app's own things on the 9:15 frame (layout.ts PHONE): what the viewer never sees of the picture */
const APP: Box[] = [
  { x0: 0, y0: 0, x1: PHONE.icons.w, y1: PHONE.icons.y1 }, { x0: W - PHONE.icons.w, y0: 0, x1: W, y1: PHONE.icons.y1 },
  { x0: PHONE.buttons.x0, y0: PHONE.buttons.y0, x1: W, y1: H }, { x0: 0, y0: PHONE.post.y0, x1: PHONE.post.x1, y1: H },
];
/** the 54 px picture-only margins */
const MARGIN: Box[] = [{ x0: 0, y0: 0, x1: PHONE.margin, y1: H }, { x0: W - PHONE.margin, y0: 0, x1: W, y1: H }];
const STAMP_SMALL_H = VLOG_RECT.stamp.y1 - VLOG_RECT.stamp.y0;
const fmtB = (b: Box) => `${Math.round(b.x0)},${Math.round(b.y0)}..${Math.round(b.x1)},${Math.round(b.y1)}`;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
/** a convex outline on screen (the projected face region: its convex hull) */
type Poly = [number, number][];
const hull = (ps: Poly): Poly => {
  const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cr = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: Poly = [], up: Poly = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
};
/** the polygon clipped to a box (Sutherland-Hodgman) */
const clipPoly = (poly: Poly, b: Box): Poly => {
  let out = poly;
  const edges: [(q: number[]) => boolean, (a: number[], c: number[]) => [number, number]][] = [
    [(q) => q[0] >= b.x0, (a, c) => [b.x0, a[1] + ((c[1] - a[1]) * (b.x0 - a[0])) / (c[0] - a[0])]],
    [(q) => q[0] <= b.x1, (a, c) => [b.x1, a[1] + ((c[1] - a[1]) * (b.x1 - a[0])) / (c[0] - a[0])]],
    [(q) => q[1] >= b.y0, (a, c) => [a[0] + ((c[0] - a[0]) * (b.y0 - a[1])) / (c[1] - a[1]), b.y0]],
    [(q) => q[1] <= b.y1, (a, c) => [a[0] + ((c[0] - a[0]) * (b.y1 - a[1])) / (c[1] - a[1]), b.y1]],
  ];
  for (const [inside, cut] of edges) {
    const src = out; out = [];
    for (let i = 0; i < src.length; i++) {
      const a = src[(i + src.length - 1) % src.length], c = src[i];
      if (inside(c)) { if (!inside(a)) out.push(cut(a, c)); out.push(c); } else if (inside(a)) out.push(cut(a, c));
    }
    if (!out.length) break;
  }
  return out;
};
const polyArea = (p: Poly) => { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[i], r = p[(i + 1) % p.length]; a += q[0] * r[1] - r[0] * q[1]; } return Math.abs(a) / 2; };
/** the area of a face outline under a box (px^2) */
const under = (poly: Poly, b: Box) => polyArea(clipPoly(poly, b));
/** the face drawing's sample points (ball radii, q.x right, q.y up) and the five key points for occlusion */
const QX = [-0.62, -0.31, 0, 0.31, 0.62], QY = [-0.78, -0.4, 0, 0.42];
/** the skin: the front of the ball under the hairline (q.y <= 0.45) and inside its outline (|q| <= 0.92): the cheeks
 *  reach the ball's edge (the toon head has no ears or jaw), the crown above the brows is hair */
const SKIN: [number, number][] = [];
for (let a = 0; a < 24; a++) { const t = (a / 24) * Math.PI * 2, x = 0.92 * Math.cos(t), y = 0.92 * Math.sin(t); if (y <= 0.45) SKIN.push([x, y]); }
for (const x of [-0.82, -0.4, 0, 0.4, 0.82]) SKIN.push([x, 0.45]);
const KEY: [number, number][] = [[-0.28, 0.03], [0.28, 0.03], [0, -0.15], [0, -0.35], [0, -0.7]];
type Face = { fig: string; box: Box; poly: Poly; featPoly: Poly; feat: Box; full: Box; eyeY: number; faceOn: number; key: THREE.Vector3[]; group: THREE.Object3D };
const visibleUp = (o: THREE.Object3D | null) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };

function facesOf(): Face[] {
  const names: Map<any, string> = hooks.rigNames ? (hooks.rigNames(w) as Map<any, string>) : new Map();
  const out: Face[] = [];
  const camR = V(), camU = V(), camF = V();
  camera.matrixWorld.extractBasis(camR, camU, camF);
  for (const r of (w.rigs as Map<string, any>).values()) {
    if (r.state?.visible === false || !visibleUp(r.group) || !visibleUp(r.headG)) continue;
    const U = r.faceU, h = U.uHead.value as THREE.Vector4, C = V(h.x, h.y, h.z), R = h.w;
    const Fd = (U.uFF.value as THREE.Vector3).clone().normalize();
    const uR = U.uFR.value as THREE.Vector3, uU = U.uFU.value as THREE.Vector3;
    const lenR = 1 / Math.max(1e-6, uR.length()), lenU = 1 / Math.max(1e-6, uU.length());
    const Rd = uR.clone().normalize(), Ud = uU.clone().normalize();
    const hs = r.headG.scale as THREE.Vector3;
    const onBall = (qx: number, qy: number) => {
      const z = Math.sqrt(Math.max(0, 1 - qx * qx - qy * qy)) * hs.x;
      return C.clone().addScaledVector(Rd, qx * lenR * R).addScaledVector(Ud, qy * lenU * R).addScaledVector(Fd, z * R);
    };
    const proj = (p: THREE.Vector3) => w.project(p) as { x: number; y: number; z: number; front: boolean };
    const bb = (ps: THREE.Vector3[]) => {
      const b: Box = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 }; let n = 0;
      for (const p of ps) { const q = proj(p); if (!q.front) continue; n++; b.x0 = Math.min(b.x0, q.x); b.x1 = Math.max(b.x1, q.x); b.y0 = Math.min(b.y0, q.y); b.y1 = Math.max(b.y1, q.y); }
      return n ? { x0: b.x0 - PAD, y0: b.y0 - PAD, x1: b.x1 + PAD, y1: b.y1 + PAD } : null;
    };
    const fp: THREE.Vector3[] = []; for (const qx of QX) for (const qy of QY) fp.push(onBall(qx, qy));
    // the ball's outline: its centre +- R (scaled) along the camera's right and up
    const ring: THREE.Vector3[] = [];
    for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2; ring.push(C.clone().addScaledVector(camR, Math.cos(a) * R * hs.x).addScaledVector(camU, Math.sin(a) * R * hs.y)); }
    const skinP = SKIN.map(([x, y]) => onBall(x, y));
    const face = bb(fp), full = bb(ring), skin = bb(skinP);
    const polyOf = (ps: THREE.Vector3[]): Poly => hull(ps.map((p) => proj(p)).filter((q) => q.front).map((q) => [q.x - 0, q.y - 0] as [number, number]));
    if (!face || !full || !skin) continue;
    const eye = proj(onBall(0, 0.03));
    out.push({ fig: names.get(r) ?? "figure", box: ZONE === "head" ? full : ZONE === "face" ? face : skin, poly: polyOf(ZONE === "head" ? ring : ZONE === "face" ? fp : skinP), featPoly: polyOf(fp), feat: face, full, eyeY: eye.y, faceOn: U.uFaceOn.value as number, key: KEY.map(([x, y]) => onBall(x, y)), group: r.group });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------- occlusion
const ray = new THREE.Raycaster();
ray.layers.enableAll();                      // the figures are drawn on layers of their own (world.ts NOINK, rig3d's)
/** bounding spheres are refreshed when a geometry's positions change (the limbs' tubes, the skirts and coats) */
const bsVer = new WeakMap<THREE.BufferGeometry, number>();
const freshBounds = (g: THREE.BufferGeometry) => {
  const v = (g.attributes.position as THREE.BufferAttribute | undefined)?.version ?? 0;
  if (bsVer.get(g) !== v || !g.boundingSphere) { g.computeBoundingSphere(); g.computeBoundingBox(); bsVer.set(g, v); }
};
/** how many of the face's key points are behind another solid (the set, a prop, another figure) */
function hiddenKeys(fc: Face): number {
  const occ: THREE.Object3D[] = [];
  w.root.traverse((o: any) => {
    if (!o.isMesh || !o.visible || o.userData.hull || o.userData.depthOnly) return;
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    if (!m || m.colorWrite === false || m.side === THREE.BackSide || m.transparent && m.opacity < 0.6) return;
    if (SKIP.test(o.name ?? "")) return;
    for (let p = o; p; p = p.parent) if (p === fc.group) return;
    if (!visibleUp(o)) return;
    freshBounds(o.geometry);
    occ.push(o);
  });
  let n = 0;
  const cp = camera.position;
  for (const k of fc.key) {
    const d = k.clone().sub(cp), L = d.length();
    ray.set(cp, d.divideScalar(L)); ray.near = camera.near; ray.far = L - 0.02;
    if (ray.intersectObjects(occ, false).length) n++;
  }
  return n;
}

// ---------------------------------------------------------------------------------------------------- the HUD of a frame
type Item = { what: string; r: Box };
function hudOf(f: number, P: any): { items: Item[]; black: number } {
  const black = f >= BEAT.G.black[0] ? endBlackAlpha(f, BEAT.G.black[0]) : 0;
  let items: Item[] = hudRectsAt(f).map((x) => ({ what: x.what as string, r: x.r as Rect }));
  if (P.hud === false) items = items.filter((x) => x.what === "caption" || x.what === "whisper");   // Film.tsx: the subtitle and the bubble stay
  if (P.rec === false) items = items.filter((x) => x.what !== "rec" && x.what !== "stamp");
  if (P.cards === false) {
    items = items.filter((x) => x.what !== "card" && x.what !== "title");
    const st = stampAt(Math.min(f, OFF_AT));
    items = items.map((x) => (x.what === "stamp" ? { what: "stamp", r: stampRect(st.id, false) } : x));
  }
  if (P.title) items = items.map((x) => (x.what === "title" ? { what: "title", r: titleRect({ ...TITLE_HOME, ...P.title }) } : x));
  if (P.captions === false) items = items.filter((x) => x.what !== "caption" && x.what !== "whisper");   // Film.tsx: captions:false hides the bubble too
  if (items.some((x) => x.what === "caption")) items.push({ what: "band", r: BAND });
  for (const r of APP) items.push({ what: "phone", r });
  for (const r of MARGIN) items.push({ what: "margin", r });
  items = items.map((x) => (x.what === "stamp" ? { what: x.r.y1 - x.r.y0 > STAMP_SMALL_H + 8 ? "stampBig" : "stamp", r: x.r } : x));
  return { items, black };
}

// ---------------------------------------------------------------------------------------------------- run
type Hit = { f: number; seg: string; shot: string; slate: string; fig: string; what: string; area: number; pct: number; face: Box; rect: Box; hidden: boolean; feat: number };
const hits: Hit[] = [], eyesLow: { f: number; seg: string; fig: string; y: number }[] = [];
/** the place of every posed frame (the joins check) */
const placeOf = new Map<number, string>();
const perSeg = new Map<string, { n: number; hitFrames: Set<number>; faces: number; errs: number }>();
let cur: any = null;
const t0 = Date.now();
for (const f of frames) {
  const s = SEGS.find((g) => f >= g.from && f <= g.to)!;
  const ps = perSeg.get(s.id) ?? { n: 0, hitFrames: new Set<number>(), faces: 0, errs: 0 }; perSeg.set(s.id, ps);
  try {
    if (s !== cur) { cur?.exit?.(w); s.enter?.(w); cur = s; }
    w.beginFrame(f); const P = s.pose(w, f); w.endFrame(P); w.root.updateMatrixWorld(true); camera.updateMatrixWorld();
    ps.n++; placeOf.set(f, String(w.place));
    const hud = hudOf(f, P);
    const faces = hud.black >= 0.97 ? [] : facesOf();
    const shot = hooks.shotAt ? hooks.shotAt(f) : s.id;
    for (const fc of faces) {
      const vis = inter(fc.box, SCR);
      if (area(vis) <= 0 || fc.faceOn < 0.3) continue;
      ps.faces++;
      if (fc.fig.startsWith("newton") && fc.eyeY > SCREEN.eyes && fc.eyeY < H) eyesLow.push({ f, seg: s.id, fig: fc.fig, y: Math.round(fc.eyeY) });
      let caption = false, hidden: boolean | null = null;
      for (const it of hud.items) {
        const rp: Box = PAD ? { x0: it.r.x0 - PAD, y0: it.r.y0 - PAD, x1: it.r.x1 + PAD, y1: it.r.y1 + PAD } : it.r;   // --pad: near misses
        const a = under(fc.poly, inter(rp, SCR));
        if (a < MIN) continue;
        if (it.what === "caption") caption = true;
        if (it.what === "band" && caption) continue;
        if (hidden === null) hidden = hiddenKeys(fc) >= fc.key.length;
        const feat = Math.round(under(fc.featPoly, inter(rp, SCR)));
        hits.push({ f, seg: s.id, shot, slate: String(P.slate ?? ""), fig: fc.fig, what: it.what, area: Math.round(a), pct: Math.round((100 * a) / Math.max(1, polyArea(clipPoly(fc.poly, SCR)))), face: vis, rect: it.r, hidden, feat });
        if (!hidden) ps.hitFrames.add(f);
      }
    }
    if (DUMP.has(f)) {
      console.log(`--- f${f} seg ${s.id} [${shot}] place ${w.place} cam ${camera.position.toArray().map((x: number) => x.toFixed(2))} black ${hud.black.toFixed(2)} pose{hud:${P.hud},rec:${P.rec},cards:${P.cards},captions:${P.captions}}`);
      for (const it of hud.items) console.log(`    hud ${it.what.padEnd(8)} ${fmtB(it.r)}`);
      for (const fc of faces) console.log(`    face ${fc.fig.padEnd(12)} ${ZONE} ${fmtB(fc.box)}  features ${fmtB(fc.feat)}  head ${fmtB(fc.full)}  eyes y ${Math.round(fc.eyeY)}  faceOn ${fc.faceOn.toFixed(2)}  hidden keys ${hiddenKeys(fc)}/5`);
    }
  } catch (e) { ps.errs++; console.log(`EXC f${f}: ${(e as Error).stack?.split("\n").slice(0, 3).join(" | ")}`); }
}
const secs = (Date.now() - t0) / 1000;

// ---------------------------------------------------------------------------------------------------- the report
type Range = { seg: string; fig: string; what: string; f0: number; f1: number; n: number; nHidden: number; max: number; maxPct: number; fMax: number; maxFeat: number; face: Box; rect: Box; shots: Set<string>; slates: Set<string> };
const ranges: Range[] = [];
const byKey = new Map<string, Hit[]>();
for (const x of hits) { const k = `${x.fig}|${x.what}`; let a = byKey.get(k); if (!a) byKey.set(k, (a = [])); a.push(x); }
for (const xs of byKey.values()) {
  xs.sort((a, b) => a.f - b.f);
  let r: Range | null = null;
  for (const x of xs) {
    if (!r || x.f > r.f1 + GAP || x.seg !== r.seg) { r = { seg: x.seg, fig: x.fig, what: x.what, f0: x.f, f1: x.f, n: 0, nHidden: 0, max: -1, maxPct: 0, fMax: x.f, maxFeat: 0, face: x.face, rect: x.rect, shots: new Set(), slates: new Set() }; ranges.push(r); }
    r.f1 = x.f; r.n++; r.shots.add(x.shot); if (x.slate) r.slates.add(x.slate); if (x.hidden) r.nHidden++; else r.maxFeat = Math.max(r.maxFeat, x.feat);
    if (!x.hidden && x.area > r.max) { r.max = x.area; r.maxPct = x.pct; r.fMax = x.f; r.face = x.face; r.rect = x.rect; }
  }
}
for (const r of ranges) if (r.max < 0) { r.max = 0; }
ranges.sort((a, b) => a.f0 - b.f0 || a.what.localeCompare(b.what));
const shown = ranges.filter((r) => r.n > r.nHidden), hiddenOnly = ranges.filter((r) => r.n === r.nHidden);
const sev = (r: Range) => (r.what === "band" ? "low" : r.maxFeat >= 400 || r.max >= 6000 ? "HIGH" : r.max >= 800 ? "med" : "low");
// THE JOINS (beats.ts JOINS): each join inside a scene must sit on a cut (the place changes from the frame before to
// its cut frame); the scene starts are cuts by construction; a clock join names its race (hud/vlog.tsx RACES)
const joins: string[] = [];
for (const j of JOINS) {
  const r = RACES.find((x) => x.cut === j.cut);
  const tag = `${j.kind} ${j.scene}${j.first ? " (first frame)" : ""}${r ? ` race ${r.fromId}->${r.toId} f${r.cut - 10}-${r.cut + 8}` : ""} (cut f${j.cut})`;
  if (j.kind === "clock" && !r) { joins.push(`${tag}: NO RACE in hud/vlog.tsx RACES`); continue; }
  const a = placeOf.get(j.cut - 1), b = placeOf.get(j.cut);
  if (a === undefined || b === undefined) { joins.push(`${tag}: not in the frames checked`); continue; }
  let note = j.first ? `ok (scene ${j.scene}'s first frame${a === b ? `, the same place: ${b}` : ""})` : a !== b ? "ok (the place changes on the cut)" : `NOT ON A CUT: the place is ${b} on both sides`;
  if (a === b && !j.first) {
    // where does the place change near it?
    const near = [...placeOf.keys()].filter((f) => Math.abs(f - j.cut) <= 90 && placeOf.get(f - 1) !== undefined && placeOf.get(f - 1) !== placeOf.get(f));
    if (near.length) note += `; the nearest cut is f${near.sort((x, y) => Math.abs(x - j.cut) - Math.abs(y - j.cut))[0]}`;
  }
  joins.push(`${tag}: ${a} -> ${b}: ${note}`);
}
for (const r of RACES) if (!JOINS.some((j) => j.kind === "clock" && j.cut === r.cut)) joins.push(`race ${r.fromId}->${r.toId} at f${r.cut}: NOT A CLOCK JOIN of beats.ts JOINS`);
const fmtR = (r: Range) => `${sev(r).padEnd(4)} ${r.seg}  f${r.f0}-${r.f1} (${r.n - r.nHidden}/${r.f1 - r.f0 + 1} frames${r.nHidden ? `, ${r.nHidden} hidden` : ""})  ${r.fig.padEnd(12)} x ${r.what.padEnd(8)} max ${String(r.max).padStart(6)} px2 (${String(r.maxPct).padStart(3)} % of the face; features ${r.maxFeat} px2) at f${r.fMax}  face ${fmtB(r.face)}  ${r.what} ${fmtB(r.rect)}  [${[...r.slates].join(" | ") || [...r.shots].join(",")}]`;
const eyeR: { seg: string; fig: string; f0: number; f1: number; maxY: number }[] = [];
for (const e of eyesLow) { const l = eyeR[eyeR.length - 1]; if (l && l.fig === e.fig && l.seg === e.seg && e.f <= l.f1 + GAP) { l.f1 = e.f; l.maxY = Math.max(l.maxY, e.y); } else eyeR.push({ seg: e.seg, fig: e.fig, f0: e.f, f1: e.f, maxY: e.y }); }
const lines = [
  `face vs HUD (NewtonFilm): ${frames.length} frames (${frames[0]}-${frames[frames.length - 1]}, step ${STEP}) in ${secs.toFixed(1)} s; zone ${ZONE}, pad ${PAD} px, min ${MIN} px2, ranges join across ${GAP} frames`,
  `per scene: ${[...perSeg].map(([k, v]) => `${k} ${v.hitFrames.size}/${v.n} frames hit${v.errs ? ` (${v.errs} threw)` : ""}`).join(", ")}`,
  `severity: HIGH = the drawn features (brows, eyes, mouth) 400 px2 or more, or 6000 px2 of skin, under the item; med = 800 px2 of skin; low = less, or only the empty subtitle band (outside the rows' box)`,
  `columns: severity, scene, frames (frames with a visible hit / span), figure x HUD item, worst overlap, worst frame, the face box and the HUD box there (x0,y0..x1,y1 px), shots`,
  "",
  `== FACE UNDER THE HUD (${shown.length} ranges, in film order)`,
  ...shown.map(fmtR),
  "",
  `== HIDDEN ONLY (the face's key points are all behind another solid; ${hiddenOnly.length} ranges)`,
  ...hiddenOnly.map(fmtR),
  "",
  `== JOINS (beats.ts JOINS and the clock races of hud/vlog.tsx against the picture's cuts)`,
  ...joins,
  "",
  ...wordsTable(),
  "",
  `== NEWTON'S EYES BELOW THE UPPER THIRD (y > ${SCREEN.eyes}; info: inserts, seated and low framings may mean it; ${eyeR.length} ranges)`,
  ...eyeR.map((e) => `${e.seg}  f${e.f0}-${e.f1}  ${e.fig}  eyes down to y ${e.maxY}`),
];
fs.writeFileSync(`${OUT}/faces.txt`, lines.join("\n") + "\n");
fs.writeFileSync(`${OUT}/faces.json`, JSON.stringify({ frames: [frames[0], frames[frames.length - 1]], step: STEP, zone: ZONE, pad: PAD, joins, eyesLow: eyeR, ranges: ranges.map((r) => ({ ...r, shots: [...r.shots], slates: [...r.slates], severity: sev(r) })), hits }, null, 0));
if (!QUIET) console.log(lines.slice(0, 80).join("\n"));
console.log(`wrote ${OUT}/faces.txt / faces.json (${secs.toFixed(1)} s)`);
