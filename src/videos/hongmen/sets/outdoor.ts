// THE DAYLIGHT PLACES of the Hongmen film outside the command tent, built from layout.ts with the outdoor kit (okit.ts):
//   buildGate    "gate"  lines 8, 9, 18: the gate of Xiang Yu's camp at Hongmen (CAMS.gate, gateXY)
//   buildFacade  "camp"  lines 2 (second beat), 17, 19 (first beat): outside the command tent's door (CAMS.outside,
//                        tentDoor, tentDoorIn, tentSky); owns the door flap seen from outside and the sun disc
//   buildPath    "path"  line 18 (second beat): the back road round the hill (CAMS.hill)
// (the night places and Liu Bang's camp: sets/night.ts; the sand table: sets/card.ts)
// Each builder returns a Built: ONE group with its meshes AND its three lights (the contract of sets/index.ts), hidden
// until the HongmenSet shows it, and animate(t), a pure function of t.
//
// WHOSE CAMP, WITHOUT READING: Xiang Yu's camp is charcoal cloth under DEEP PURPLE roofs and purple banners with gold;
// Liu Bang's is undyed cloth under RED roofs and red banners. The far view of every place is one painted card.
import * as THREE from "three";
import type { Mats } from "../../bt/pbr";
import type { CastLight } from "../../group/kit/cast";
import { YARD_CAST_LIGHT } from "../../arthur/sets/yard";
import * as L from "../layout";
import {
  V, PAL, Batch, boxG, limb, tile, extrudeXY, faceBox, hipRoofG, facesG, flatOf, paint, texOf, canvasOf, clothTex, logsTex, planksTex, bannerTex, makeBanner, skyDome, skyAt, farCard,
  groundG, groundTex, mottle, uvXY, fireBasketG, soft, shape, blotch, css, mix, toHex, lightRig, SUN_DIR, rng, NOINK, FONT, clamp, lerp, type G2, type SkyStops, type RGB,
} from "./okit";

export type Built = { group: THREE.Group; animate(t: number): void; tris: number };

// =====================================================================================================================
// shared looks
// =====================================================================================================================
/** the day sky by elevation (degrees): a pale horizon, a clear mid blue above */
export const DAY_SKY: SkyStops = [[-6, "#e2edf8"], [5, "#d6e7f6"], [24, "#a9cdf0"], [55, "#80b3e6"], [90, "#6fa6df"]];
export const DAY_BG = "#d9e9f7";
const HAZE = "#dbe8f4";
/** a colour seen far away: toward the horizon's haze */
const far = (c: string, k: number) => toHex(mix(c, HAZE, k));

/** toon clouds on a painted card: a flat white heap with a pale blue underside */
export const cloud = (g: G2, x: number, y: number, w: number, seed: number) => {
  const r = rng(seed), n = 5, h = w * 0.32;
  g.save();
  g.beginPath(); g.rect(x - w, y - h * 3, 2 * w, h * 3.42); g.clip();          // a flat base
  g.fillStyle = "rgba(174,200,230,0.9)"; g.beginPath();
  for (let i = 0; i < n; i++) { const u = i / (n - 1), rr = h * (0.55 + 0.45 * Math.sin(Math.PI * u) + 0.12 * r()); g.moveTo(x + w * (u - 0.5) + rr, y + h * 0.1); g.arc(x + w * (u - 0.5), y + h * 0.1, rr, 0, 7); }
  g.fill();
  g.fillStyle = "#ffffff"; g.beginPath();
  for (let i = 0; i < n; i++) { const u = i / (n - 1), rr = h * (0.5 + 0.45 * Math.sin(Math.PI * u) + 0.12 * r()); g.moveTo(x + w * (u - 0.5) + rr, y - h * 0.08); g.arc(x + w * (u - 0.5), y - h * 0.08, rr, 0, 7); }
  g.fill();
  g.restore();
};
/** soft far hills along a painted card: a ridge line between x0 and x1 (px), base y (px), heights up to h (px) */
export const hills = (g: G2, x0: number, x1: number, base: number, h: number, seed: number, fill: string, line: string | null, bumps = 5) => {
  const r = rng(seed), pts: [number, number][] = [[x0, base]];
  const ph = [r() * 7, r() * 7, r() * 7];
  for (let i = 0; i <= 80; i++) {
    const u = i / 80, x = lerp(x0, x1, u);
    const y = 0.55 + 0.3 * Math.sin(u * bumps * 2.1 + ph[0]) + 0.18 * Math.sin(u * bumps * 5.3 + ph[1]) + 0.08 * Math.sin(u * bumps * 11 + ph[2]);
    pts.push([x, base - h * clamp(y, 0.08, 1)]);
  }
  pts.push([x1, base]);
  shape(g, pts, fill, line, 3);
};
/** a tent drawn on a far card, front view: a cloth body under a hip roof, a door slit. (cx, base) = the middle of
 *  its foot in px, w x h its size in px. k = how far away (0 near .. 1 lost in the haze) */
export const farTent = (g: G2, cx: number, base: number, w: number, h: number, k: number, o: { wall: string; roof: string; door?: boolean; flag?: string } = { wall: PAL.xWall, roof: PAL.xRoof }) => {
  const wall = far(o.wall, k), roof = far(o.roof, k), line = far(PAL.inkLine, 0.35 + 0.6 * k), lw = Math.max(2, 3.2 - 1.2 * k);
  const eh = h * 0.5, ov = w * 0.06;
  shape(g, [[cx - w / 2, base], [cx + w / 2, base], [cx + w / 2, base - eh], [cx - w / 2, base - eh]], wall, line, lw);
  if (o.door !== false) shape(g, [[cx - w * 0.07, base], [cx + w * 0.07, base], [cx + w * 0.05, base - eh * 0.72], [cx - w * 0.05, base - eh * 0.72]], far(PAL.xDark, k), null);
  shape(g, [[cx - w / 2 - ov, base - eh], [cx + w / 2 + ov, base - eh], [cx + w * 0.2, base - h], [cx - w * 0.2, base - h]], roof, line, lw);
  if (o.flag) {
    g.strokeStyle = line; g.lineWidth = lw; g.beginPath(); g.moveTo(cx, base - h); g.lineTo(cx, base - h * 1.5); g.stroke();
    shape(g, [[cx, base - h * 1.5], [cx + w * 0.2, base - h * 1.5], [cx + w * 0.2, base - h * 1.18], [cx + w * 0.1, base - h * 1.25], [cx, base - h * 1.18]], far(o.flag, k * 0.8), line, lw * 0.8);
  }
};

// =====================================================================================================================
// shared pieces
// =====================================================================================================================
/** a palisade of upright sharpened logs along x from x0 to x1 at z (0.28 m thick): ONE solid with a saw-tooth top
 *  (the joints between the logs are paint: geometry there would be a slat every 54 px and sparkle). */
export const palisadeG = (x0: number, x1: number, z: number, h = 2.7, seed = 1) => {
  const r = rng(seed), W = 0.3, n = Math.max(1, Math.round((x1 - x0) / W)), w = (x1 - x0) / n, pts: [number, number][] = [[0, 0]];
  for (let i = 0; i < n; i++) { const hh = h + 0.16 * (r() - 0.5); pts.push([i * w, hh - 0.2], [i * w + w / 2, hh], [(i + 1) * w, hh - 0.2]); }
  pts.push([n * w, 0]);
  const g = extrudeXY(pts, -0.14, 0.14);
  // one log per `w` metres across, the log's whole height up the texture (4 logs per tile: logsTex)
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / (4 * w), uv.getY(i) / (h + 0.25));
  return g.translate(x0, 0, z);
};
/** a pawn (a soldier as a playing piece): a turned body and a ball head; s = scale. Body and head are separate
 *  geometries (two materials). The head's upper part is painted as a helmet. */
export const pawnG = (x: number, z: number, s = 1, y = 0) => {
  // (no foot lip, and the shoulders run INTO the head as a cone: a lip of 5 cm and a head that only touched the body
  // were slivers that sparkled from 11 m)
  const prof: [number, number][] = [[0, 0], [0.17, 0], [0.15, 0.42], [0.13, 0.7], [0.06, 0.86], [0, 0.86]];   // (the bible's cone: 0.17 at the foot, 0.13 at the shoulder; wider feet touch at the card's 0.4 m spacing)
  const body = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a * s, b * s)), 14).translate(x, y, z);
  const head = new THREE.SphereGeometry(0.17 * s, 16, 12).translate(x, y + 0.98 * s, z);
  return { body, head };
};
/** the pawn head's paint: skin with a helmet over the top (u runs round the head, v up) */
export const pawnHeadTex = (skin: string, helmet: string) => paint(64, 64, (g, S) => {
  g.fillStyle = skin; g.fillRect(0, 0, S, S);
  g.fillStyle = helmet; g.fillRect(0, 0, S, S * 0.46);
  g.fillStyle = css(mix(helmet, "#000000", 0.35)); g.fillRect(0, S * 0.43, S, S * 0.05);
});
/** a hip-roofed army tent of cloth on poles: walls w x d round (x, z) up to `eaves`, the roof (overhanging 0.25 m,
 *  with a fascia band 0.28 m deep) up to `ridge`. Adds to the batch in three materials. */
export const hipTent = (B: Batch, m: { wall: THREE.Material; roof: THREE.Material; roofFront: THREE.Material; fascia: THREE.Material }, o: { x: number; z: number; w: number; d: number; eaves: number; ridge: number; ridgeZ?: number; front?: boolean }) => {
  const { x, z, w, d, eaves, ridge } = o, ov = 0.25, fh = 0.28, rz = o.ridgeZ ?? z;
  if (o.front !== false) B.add(m.wall, tile(boxG(x - w / 2, x + w / 2, 0, eaves - 0.02, z - d / 2, z + d / 2), Math.max(1, Math.round(w / 2.4)), 1));
  // the fascia: a shallow box under the roof's edge, all round (its top is inside the roof)
  B.add(m.fascia, tile(boxG(x - w / 2 - ov, x + w / 2 + ov, eaves - fh, eaves + 0.02, z - d / 2 - ov, z + d / 2 + ov), Math.max(2, Math.round(w / 0.8)), 1));
  const rl = Math.max(0.3, w - d * 0.9) / 2, R = hipRoofG(x - w / 2 - ov, x + w / 2 + ov, z - d / 2 - ov, z + d / 2 + ov, eaves, ridge, x - rl, x + rl, rz);
  B.add(m.roofFront, tile(R.front, Math.max(1, Math.round(w / 1.6)), 1)); B.add(m.roof, R.rest);
};
/** the roof's paint: cloth widths sewn together (seams run up the slope), a light neutral */
export const roofTex = (seed: number) => clothTex(seed, { seams: 1, folds: 2, size: 256 });
/** the fascia's paint: a band of the camp's colour with a gold edge and a row of scallops (one scallop per tile) */
export const fasciaTex = (field: string, edge: string) => paint(128, 128, (g, S) => {
  g.fillStyle = field; g.fillRect(0, 0, S, S);
  g.fillStyle = edge; g.fillRect(0, 0, S, S * 0.16);
  g.beginPath(); g.arc(S / 2, S * 0.16, S * 0.34, 0, Math.PI); g.fill();
  g.fillStyle = css(mix(field, "#000000", 0.25)); g.fillRect(0, S * 0.93, S, S * 0.07);
}, true);
/** a banner pole with a cross arm and a hanging banner: the pole's foot at (x, 0, z), `h` tall; the banner
 *  (bw x bh) hangs from the arm at the pole's top, facing +z. Returns the banner (animate it). */
export const bannerPole = (B: Batch, into: THREE.Object3D, mWood: THREE.Material, mCloth: THREE.Material, x: number, z: number, h: number, bw: number, bh: number, ph: number, o: { r?: number; dags?: number; amp?: number; side?: number } = {}) => {
  const r = o.r ?? 0.055, sd = o.side ?? 0;
  // a banner that hangs in FRONT of its pole hides it: the pole is built in two pieces (the foot up to the cloth's
  // lowest point, the tip above the cross bar), because the cloth is not in the ink pass and the outline of a pole
  // behind it would be drawn across it
  if (sd) B.add(mWood, limb(V(x, 0, z), V(x, h, z), r, r * 0.8, 10));
  else { B.add(mWood, limb(V(x, 0, z), V(x, h - 0.22 - bh, z), r, r * 0.86, 10)); B.add(mWood, limb(V(x, h - 0.24, z), V(x, h, z), r * 0.82, r * 0.8, 10)); }
  B.add(mWood, limb(V(x + Math.min(sd, 0) - (sd ? 0.08 : bw / 2 + 0.08), h - 0.22, z), V(x + sd + bw / 2 + 0.08, h - 0.22, z), 0.04, 0.04, 8));
  const b = makeBanner(mCloth, bw, bh, { dags: o.dags ?? 3, amp: o.amp ?? 0.06, ph });
  b.mesh.position.set(x + sd, h - 0.22, sd ? z : z + r + 0.03); into.add(b.mesh);
  return b;
};
/** the camp banners' cloth (double-sided, lit) */
/** a camp banner's cloth: 项 in gold on purple / 刘 in cream on red; chY = where the character sits (0 top .. 1 bottom) */
export const bannerMat = (M: Mats, camp: "x" | "l", ratio: number, chY = 0.4) => M.paint({
  color: "#ffffff", roughness: 0.85, side: THREE.DoubleSide,
  map: bannerTex(camp === "x" ? { field: PAL.xBanner, border: PAL.gold, ch: "项", chCol: PAL.gold, ratio, chY } : { field: PAL.lBanner, border: PAL.gold, ch: "刘", chCol: "#f6e6b4", ratio, chY }),
});

// =====================================================================================================================
// THE GATE (lines 8, 9, 18)
// =====================================================================================================================
// What the picture must say in one second: THE ENTRANCE OF THE BIG PURPLE CAMP. So the gate is dressed as seen from
// OUTSIDE: a palisade of sharpened logs on BOTH sides of a heavy timber gate with the camp's name board (鸿门), purple
// roofs and purple banners over the palisade, and through the gateway the camp's avenue and its tents, pale and far
// (one painted card: calm behind the two heads). Liu Bang's carriage (a two-wheeled chariot with a parasol) and his
// red escort stand in front of it. (layout.ts's comment says "seen from inside looking out, palisade to the left
// only": the marks and cameras are used exactly as they are; only the dressing reads the other way. See w_outdoor.md.)
export function buildGate(M: Mats): Built {
  const group = new THREE.Group(); group.name = "gate"; group.visible = false;
  const flat = flatOf(M), B = new Batch(), NC = new Batch();
  const G = L.GATE, C = L.CART, gx = G.at.x, gz = G.at.z, half = G.postDx;
  const eye = L.CAMS.gate.pos, anim: ((t: number) => void)[] = [];

  // ---- ground: beaten earth, a paler worn road through the gateway, dry grass along the palisade's foot
  const GC = { x: gx, z: gz + 6, size: 52 };
  const gTex = groundTex(GC.x, GC.z, GC.size, 2048, PAL.earth, (g, k) => {
    mottle(g, k.S, 11, PAL.earthHi, PAL.earthLo, 70, 0.14);
    soft(g, 26, () => {
      g.fillStyle = css(PAL.grass, 0.55);
      g.fillRect(k.px(gx - 26), k.pz(gz + 0.4), k.px(gx - 3.4) - k.px(gx - 26), 2.4 * k.s);
      g.fillRect(k.px(gx + 6.5), k.pz(gz + 0.4), 20 * k.s, 2.0 * k.s);
      g.fillStyle = css(PAL.earthHi, 0.85);
      shape(g, [[k.px(gx - 1.2), k.pz(gz - 20)], [k.px(gx + 1.2), k.pz(gz - 20)], [k.px(gx + 1.5), k.pz(gz)], [k.px(gx + 6.5), k.pz(gz + 24)], [k.px(gx - 6.5), k.pz(gz + 24)], [k.px(gx - 1.5), k.pz(gz)]], css(PAL.earthHi, 0.85));
    });
  });
  const ground = new THREE.Mesh(groundG(GC.x, GC.z, GC.size), flat("#ffffff", gTex, 0.95)); ground.receiveShadow = true; ground.name = "gate.ground"; group.add(ground);

  // ---- sky and the far card: the camp inside, seen through the gateway and over the palisade
  group.add(skyDome(V(gx, 0, gz), DAY_SKY));
  const CZ = gz - 24, Dc = eye[2] - CZ, ex = eye[0], ey = eye[1];
  group.add(farCard(gx - 22, gx + 22, -0.6, 21.4, CZ, 2048, 1024, (g, k) => {
    for (let y = 0; y < k.H; y++) { const yw = 21.4 - (22 * (y + 0.5)) / k.H; g.fillStyle = css(skyAt(DAY_SKY, (Math.atan2(yw - ey, Dc) * 180) / Math.PI)); g.fillRect(0, y, k.W, 1); }
    cloud(g, k.px(gx - 4.6), k.py(6.4), 4.6 * k.s, 3); cloud(g, k.px(gx + 9.5), k.py(12.5), 6.5 * k.s, 5); cloud(g, k.px(gx - 13), k.py(10), 5.5 * k.s, 8);
    hills(g, 0, k.W, k.py(ey), 3.6 * k.s, 21, far("#8fa8cc", 0.45), null, 4);
    hills(g, 0, k.W, k.py(ey), 1.5 * k.s, 22, far("#a9b48a", 0.5), null, 7);
    // the far ground: from the card's foot up to the horizon (the eye's height on the card)
    const gr = g.createLinearGradient(0, k.py(ey), 0, k.py(-0.6));
    gr.addColorStop(0, far(PAL.earthHi, 0.55)); gr.addColorStop(1, far(PAL.earth, 0.12));
    g.fillStyle = gr; g.fillRect(0, k.py(ey), k.W, k.py(-0.6) - k.py(ey));
    // the camp: tents at virtual distances D from the eye, drawn where the eye sees them on the card
    const tent = (X: number, D: number, w: number, h: number, flag = false) => {
      const q = Dc / D, cx = ex + (X - ex) * q, base = ey * (1 - q);
      farTent(g, k.px(cx), k.py(base), w * q * k.s, h * q * k.s, clamp((D - 30) / 110, 0.25, 0.8), { wall: PAL.xWall, roof: PAL.xRoof, flag: flag ? PAL.xBanner : undefined });
    };
    const rows: [number, number, number, number][] = [];
    const r = rng(41);
    for (let i = 0; i < 26; i++) rows.push([gx - 62 + i * 5.2 + 2.5 * r(), 120 + 30 * r(), 7, 5.2]);
    for (let i = 0; i < 16; i++) rows.push([gx - 42 + i * 5.6 + 2 * r(), 84 + 12 * r(), 6.5, 4.8]);
    for (let i = 0; i < 10; i++) { const X = gx - 27 + i * 6.2 + 1.5 * r(); if (Math.abs(X - (gx - 5.6)) > 5.5) rows.push([X, 60 + 6 * r(), 6.2, 4.6]); }
    rows.sort((a, b) => b[1] - a[1]);
    for (const [X, D, w, h] of rows) tent(X, D, w, h, false);
    tent(gx - 5.6, 70, 11, 8.6, true);                                    // the command tent: between the two heads from CAMS.gate
    for (const X of [gx - 13.5, gx + 6.5]) tent(X, 50, 6, 4.4, false);
  }));

  // ---- the palisade, both sides of the gate
  const tLogs = logsTex(5), mLogs = flat(PAL.log, tLogs, 0.92), mPost = flat(PAL.woodLo, planksTex(7, 2), 0.9), mBeam = flat(PAL.wood, planksTex(9, 3, true), 0.9);
  const PW = 0.46;                                                        // the gate posts: square timbers
  // the palisade stands half a metre BEHIND the posts' line and ends behind them: the step from a post's face to the
  // logs is 0.6 m (a clear outline from every camera; a step of a few centimetres was a line that came and went)
  B.add(mLogs, palisadeG(gx - 22.1, gx - half - PW / 2 + 0.1, gz - 0.5, 2.7, 3));
  B.add(mLogs, palisadeG(gx + half + PW / 2 - 0.1, gx + 22.1, gz - 0.5, 2.7, 4));
  // the gate: two tall posts with pointed heads (one outline each), a deep header board between them
  for (const s of [-1, 1]) B.add(mPost, tile(extrudeXY([[-PW / 2, 0], [PW / 2, 0], [PW / 2, 5.45], [0, 5.8], [-PW / 2, 5.45]], -PW / 2, PW / 2), 1 / PW, 1 / 5.8).translate(gx + s * half, 0, gz));
  const HB = { y0: 3.95, y1: 4.85, d: 0.3 }, hw = 2 * half - PW + 0.02;
  const tBoard = paint(1024, 256, (g, W, H) => {
    const r = rng(15);
    for (let i = 0; i < 3; i++) { const v = 206 + 26 * r(); g.fillStyle = css([v, v * 0.82, v * 0.58]); g.fillRect(0, (i * H) / 3, W, H / 3 + 1); g.fillStyle = "rgba(70,50,40,0.85)"; g.fillRect(0, (i * H) / 3 - 2, W, 4); }
    g.fillStyle = "rgba(70,50,40,0.85)"; g.fillRect(0, H - 3, W, 3);
    // the name board: black lacquer, a gold line, the place's name
    const bw = W * 0.44, bh = H * 0.78, x0 = (W - bw) / 2, y0 = (H - bh) / 2;
    g.fillStyle = "#3a2f38"; g.fillRect(x0, y0, bw, bh);
    g.strokeStyle = PAL.gold; g.lineWidth = 7; g.strokeRect(x0 + 12, y0 + 12, bw - 24, bh - 24);
    g.fillStyle = "#f0c654"; g.font = `700 ${Math.round(bh * 0.66)}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("鸿", W / 2 - bw * 0.2, H / 2 + 4); g.fillText("门", W / 2 + bw * 0.2, H / 2 + 4);
    for (const x of [W * 0.06, W * 0.2, W * 0.8, W * 0.94]) { g.fillStyle = "#4a4048"; g.beginPath(); g.arc(x, H / 2, 13, 0, 7); g.fill(); g.fillStyle = "#b99a50"; g.beginPath(); g.arc(x - 3, H / 2 - 3, 5, 0, 7); g.fill(); }
  });
  const header = faceBox(hw, HB.y1 - HB.y0, HB.d, flat("#ffffff", tBoard, 0.85), mBeam);
  header.position.set(gx, (HB.y0 + HB.y1) / 2, gz); header.name = "gate.header"; group.add(header);

  // ---- purple roofs and banners over the palisade (inside the camp, 4 to 7 m behind it)
  const mWall = flat(PAL.xWall, clothTex(21, { seams: 2 })), mRoofF = flat(PAL.xRoof, roofTex(23)), mRoof = flat(PAL.xRoofLo), mFascia = flat("#ffffff", fasciaTex(PAL.xRoofLo, PAL.gold));
  const tm = { wall: mWall, roof: mRoof, roofFront: mRoofF, fascia: mFascia };
  for (const [x, z, w] of [[gx + 6.4, gz - 5.2, 5.4], [gx + 12.6, gz - 6.4, 5.0], [gx - 6.6, gz - 5.4, 5.4], [gx - 13, gz - 6.6, 5.0]] as [number, number, number][])
    hipTent(B, tm, { x, z, w, d: 3.6, eaves: 2.5, ridge: 4.5 });
  const mPole = flat(PAL.woodLo), mBan = bannerMat(M, "x", 2.6);
  for (const [i, x] of [gx + 3.55, gx + 9.4, gx - 3.55, gx - 9.6].entries()) anim.push(bannerPole(B, group, mPole, mBan, x, gz - 1.3, 6.5, 0.95, 2.45, 1.3 * i + 0.4).animate);

  // ---- Liu Bang's carriage: a two-wheeled chariot seen from behind, a parasol on a pole, its two shafts
  // pointing away (the horse stands between them: props; when the horse is gone they point at nothing: "丢下车队")
  {
    const cx = C.at.x, zf = C.at.z + C.d / 2, zb = zf - 1.34, y0 = C.axle + 0.035, y1 = C.axle + C.h, wz = (zf + zb) / 2;
    const tPanel = paint(256, 256, (g, S) => {
      g.fillStyle = "#3b3640"; g.fillRect(0, 0, S, S);
      g.strokeStyle = "#b5332b"; g.lineWidth = 12; g.strokeRect(20, 20, S - 40, S - 40);
      g.strokeStyle = PAL.gold; g.lineWidth = 4; g.strokeRect(38, 38, S - 76, S - 76);
      shape(g, [[S / 2, S / 2 - 46], [S / 2 + 46, S / 2], [S / 2, S / 2 + 46], [S / 2 - 46, S / 2]], "#b5332b", PAL.gold, 4);
    });
    B.add(flat("#ffffff", tPanel, 0.6), boxG(cx - C.w / 2, cx + C.w / 2, y0, y1, zb, zf));
    const mLac = flat(PAL.lacquer, null, 0.6), mShaft = flat(PAL.woodLo);
    B.add(mLac, boxG(cx - C.w / 2 - 0.04, cx + C.w / 2 + 0.04, y1 - 0.01, y1 + 0.09, zb - 0.04, zf + 0.04));              // the rail's cap
    B.add(mShaft, limb(V(cx - C.w / 2 - 0.14, C.axle, wz), V(cx + C.w / 2 + 0.14, C.axle, wz), 0.05, 0.05, 8));            // the axle (it runs 1.5 cm into the box: no gap to see the ground through)
    const tWheel = paint(256, 256, (g, S) => {
      g.fillStyle = "#4a3c34"; g.fillRect(0, 0, S, S);
      g.fillStyle = "#b08a58"; g.beginPath(); g.arc(S / 2, S / 2, S * 0.5, 0, 7); g.fill();
      g.fillStyle = "#57463c"; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, 7); g.fill();
      g.strokeStyle = "#b08a58"; g.lineWidth = 11; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6; g.beginPath(); g.moveTo(S / 2, S / 2); g.lineTo(S / 2 + Math.cos(a) * S * 0.42, S / 2 + Math.sin(a) * S * 0.42); g.stroke(); }
      g.fillStyle = "#8a6540"; g.beginPath(); g.arc(S / 2, S / 2, S * 0.1, 0, 7); g.fill();
    });
    const mTread = flat("#6a5444"), mHub = flat("#ffffff", tWheel, 0.85);
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(C.axle, C.axle, 0.1, 28).rotateZ(Math.PI / 2), [mTread, mHub, mHub]);
      w.position.set(cx + s * (C.w / 2 + 0.1), C.axle, wz); w.castShadow = w.receiveShadow = true; w.name = "gate.wheel"; group.add(w);
      B.add(mShaft, limb(V(cx + s * 0.44, y0 + 0.1, zb + 0.06), V(cx + s * 0.44, 1.0, C.at.z - C.d / 2 - 1.25), 0.048, 0.042, 8));
    }
    // the parasol: forward of the box's middle and high, clear of a horse's head behind the box
    const pz = wz + 0.12, mSilk = flat("#ffffff", paint(256, 96, (g, W, H) => {
      // u runs round the parasol, v along its outline (top, rim, underside): the RED RIM is paint on the same surface
      g.fillStyle = "#e6dab8"; g.fillRect(0, 0, W, H); g.fillStyle = "rgba(150,120,90,0.5)"; for (let i = 0; i < 16; i++) g.fillRect((i * W) / 16 - 1.5, 0, 3, H);
      g.fillStyle = PAL.lacquerRed; g.fillRect(0, H * (1 - 0.69), W, H * (0.69 - 0.27));
    }, true), 0.8, THREE.DoubleSide);
    B.add(mShaft, limb(V(cx, y1 - 0.2, pz), V(cx, 2.5, pz), 0.045, 0.045, 10));
    B.add(mSilk, new THREE.LatheGeometry([[0.03, 2.7], [0.72, 2.42], [0.72, 2.34], [0.03, 2.46]].map(([a, b]) => new THREE.Vector2(a, b)), 28).translate(cx, 0, pz));
    B.add(flat(PAL.gold, null, 0.5), new THREE.SphereGeometry(0.07, 12, 10).translate(cx, 2.74, pz));
  }
  // ---- his escort: eight red pawns
  {
    const c = G.retinue, s = 1.15, body: THREE.BufferGeometry[] = [], head: THREE.BufferGeometry[] = [];
    for (let i = 0; i < c.cols * c.rows; i++) { const p = pawnG(c.at.x + ((i % c.cols) - (c.cols - 1) / 2) * c.dx, c.at.z - Math.floor(i / c.cols) * c.dz, s); body.push(p.body); head.push(p.head); }
    const mB = flat("#c4382e"), mH = flat("#ffffff", pawnHeadTex("#eccfb4", "#6a2a26"));
    for (const q of body) B.add(mB, q); for (const q of head) B.add(mH, q);
  }

  B.flush(group, "gate.static"); NC.flush(group, "gate.nocast", false, true);
  lightRig(group, { dir: SUN_DIR, k: 2.4, col: "#ffe9c8", at: [gx + 0.8, 0, gz + 4.5], half: 10, hemi: ["#ffffff", "#ffffff", 0.5] });
  return { group, animate(t) { for (const a of anim) a(t); }, tris: B.tris + NC.tris };
}

// =====================================================================================================================
// OUTSIDE THE COMMAND TENT (line 2 second beat, line 17, line 19 first beat)
// =====================================================================================================================
// The dialogue cameras (outside, tentDoor, tentDoorIn) see only the tent's front wall, its door and the start of the
// roof: a CALM, mid-dark wall (the black figure of line 2 and the pale and red figures of line 17 all stand out on
// it), the pale door flap, a purple valance with gold under the eaves. The wide camera (tentSky) adds the purple roof,
// the two banner poles, two cold fire baskets outside them and the sky the sun crosses.
// The valance and the door's binding are PAINT on the wall (a band a few centimetres proud of it would be an ink
// sliver); the flap hangs 0.42 m behind the wall's face: a doorway with a reveal, and a depth step the ink pass
// outlines firmly from every camera (at 3 cm the outline came and went when the camera moved: the shimmer test's
// worst spot); the dark inside is half a metre behind the wall.
const FLAP_BACK = 0.42;
export function buildFacade(M: Mats): Built & { setFlap(k: number): void; setSun(u: number | null): void } {
  const group = new THREE.Group(); group.name = "camp"; group.visible = false;
  const flat = flatOf(M), B = new Batch(), NC = new Batch();
  const F = L.CAMP.facade, D = L.CAMP.door, fx = F.x, x0 = F.x - F.w / 2, x1 = F.x + F.w / 2, DEPTH = 2 * (F.z - F.ridgeZ);
  const eye = L.CAMS.tentSky.pos, anim: ((t: number) => void)[] = [];

  const GC = { x: fx, z: 2, size: 48 };
  const tG = groundTex(GC.x, GC.z, GC.size, 2048, PAL.earth, (g, k) => {
    mottle(g, k.S, 51, PAL.earthHi, PAL.earthLo, 70, 0.14);
    soft(g, 30, () => { shape(g, [[k.px(fx - 1.6), k.pz(F.z)], [k.px(fx + 1.6), k.pz(F.z)], [k.px(fx + 5), k.pz(F.z + 22)], [k.px(fx - 5), k.pz(F.z + 22)]], css(PAL.earthHi, 0.85)); });
  });
  const ground = new THREE.Mesh(groundG(GC.x, GC.z, GC.size), flat("#ffffff", tG, 0.95)); ground.receiveShadow = true; ground.name = "camp.ground"; group.add(ground);

  group.add(skyDome(V(fx, 0, F.z), DAY_SKY));
  const CZ = F.z - 66, Dc = eye[2] - CZ, ey = eye[1];
  group.add(farCard(fx - 64, fx + 64, -1, 63, CZ, 2048, 1024, (g, k) => {
    for (let y = 0; y < k.H; y++) { const yw = 63 - (64 * (y + 0.5)) / k.H; g.fillStyle = css(skyAt(DAY_SKY, (Math.atan2(yw - ey, Dc) * 180) / Math.PI)); g.fillRect(0, y, k.W, 1); }
    cloud(g, k.px(fx - 15), k.py(13), 12 * k.s, 3); cloud(g, k.px(fx + 17), k.py(9.5), 10 * k.s, 7); cloud(g, k.px(fx + 3), k.py(30), 14 * k.s, 9); cloud(g, k.px(fx - 30), k.py(24), 12 * k.s, 4);
    hills(g, 0, k.W, k.py(ey), 6 * k.s, 61, far("#8fa8cc", 0.45), null, 5);
    g.fillStyle = far(PAL.earthHi, 0.4); g.fillRect(0, k.py(ey), k.W, k.H);
  }));

  // ---- the front wall: three sheets round the doorway with ONE painting across them
  const TW = 2048, TH = 512;
  const tFront = paint(TW, TH, (g, W, H) => {
    const r = rng(53), sx = W / F.w, sy = H / F.eaves, X = (x: number) => (x - x0) * sx, Y = (y: number) => H - y * sy;
    g.fillStyle = PAL.xWall; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) blotch(g, W * r(), H * r(), 120 + 140 * r(), r() < 0.5 ? "#7a7192" : "#5b5370", 0.2);
    for (let i = 1; i < 11; i++) { const x = (W * i) / 11 + 16 * (r() - 0.5); const gr = g.createLinearGradient(x - 22, 0, x + 22, 0); gr.addColorStop(0, "rgba(160,150,190,0)"); gr.addColorStop(0.45, "rgba(160,150,190,0.25)"); gr.addColorStop(0.6, "rgba(50,40,70,0.22)"); gr.addColorStop(1, "rgba(50,40,70,0)"); g.fillStyle = gr; g.fillRect(x - 22, 0, 44, H); }
    // the valance under the eaves: purple, a gold edge with scallops
    const fh = 0.32;
    g.fillStyle = PAL.xRoofLo; g.fillRect(0, 0, W, fh * sy);
    g.fillStyle = PAL.gold; g.fillRect(0, 0, W, 0.045 * sy); for (let x = 0.25; x < F.w; x += 0.5) { g.beginPath(); g.arc(x * sx, 0.045 * sy, 0.14 * sx, 0, Math.PI); g.fill(); }
    g.fillStyle = css(PAL.inkLine, 0.9); g.fillRect(0, fh * sy - 3, W, 6);
    // the foot band
    g.fillStyle = PAL.xRoofLo; g.fillRect(0, Y(0.3), W, H - Y(0.3)); g.fillStyle = PAL.gold; g.fillRect(0, Y(0.33), W, 0.03 * sy);
    g.fillStyle = css(PAL.inkLine, 0.9); g.fillRect(0, Y(0.34), W, 5);
    // the doorway's binding: black lacquer cloth with a gold line (the hole itself is cut out of the wall)
    const dl = X(D.at.x - D.w / 2), dr = X(D.at.x + D.w / 2), dt = Y(D.h), bw = 0.11 * sx;
    g.fillStyle = "#3a3448"; g.fillRect(dl - bw, dt - bw, dr - dl + 2 * bw, H - dt + bw);
    g.strokeStyle = PAL.gold; g.lineWidth = 0.022 * sx; g.strokeRect(dl - bw * 0.5, dt - bw * 0.5, dr - dl + bw, H - dt + bw);
    g.strokeStyle = css(PAL.inkLine, 0.95); g.lineWidth = 6; g.strokeRect(dl - bw, dt - bw, dr - dl + 2 * bw, H - dt + bw + 10);
  });
  const mFront = flat("#ffffff", tFront, 0.92);
  const sheet = (a: number, b: number, y0: number, y1: number) => NC.add(mFront, uvXY(new THREE.PlaneGeometry(b - a, y1 - y0).translate((a + b) / 2, (y0 + y1) / 2, F.z), x0, x1, 0, F.eaves));
  sheet(x0, D.at.x - D.w / 2, 0, F.eaves); sheet(D.at.x + D.w / 2, x1, 0, F.eaves); sheet(D.at.x - D.w / 2, D.at.x + D.w / 2, D.h, F.eaves);
  // the tent's body behind the wall (its sides and back) and the dark inside behind the doorway
  const mSide = flat(PAL.xWallLo, clothTex(55, { seams: 2 }), 0.92);
  B.add(mSide, boxG(x0, x1, 0, F.eaves - 0.02, F.z - DEPTH, F.z - 0.6));
  for (const s of [-1, 1]) B.add(mSide, boxG(s < 0 ? x0 : x1 - 0.06, s < 0 ? x0 + 0.06 : x1, 0, F.eaves - 0.02, F.z - 0.61, F.z - 0.02));
  NC.add(flat("#3b3350"), boxG(D.at.x - D.w / 2 - 0.5, D.at.x + D.w / 2 + 0.5, 0, D.h + 0.3, F.z - 0.62, F.z - 0.52));
  // the roof: no overhang in front (its edge IS the wall's top)
  const rl = (F.w - DEPTH * 0.9) / 2, R = hipRoofG(x0, x1, F.z - DEPTH, F.z, F.eaves, F.ridge, fx - rl, fx + rl, F.ridgeZ);
  B.add(flat(PAL.xRoof, roofTex(57), 0.9), tile(R.front, 7, 1)); B.add(flat(PAL.xRoofLo), R.rest);

  // ---- the flap: it hangs FLAP_BACK behind the wall's face from a bar above the lintel; setFlap rolls it up out of sight
  const tFlap = paint(256, 512, (g, W, H) => {
    g.fillStyle = "#efe4c2"; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 4; i++) { const x = W * (0.14 + 0.24 * i); const gr = g.createLinearGradient(x - 20, 0, x + 20, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.45, "rgba(255,255,255,0.4)"); gr.addColorStop(0.62, "rgba(170,140,100,0.25)"); gr.addColorStop(1, "rgba(170,140,100,0)"); g.fillStyle = gr; g.fillRect(x - 20, 0, 40, H); }
    g.fillStyle = css(PAL.inkLine, 0.9); g.fillRect(W / 2 - 3, 0, 6, H);
    for (const y of [0.36, 0.64]) { g.fillStyle = "#5b36a0"; g.fillRect(W / 2 - 22, H * y - 7, 44, 14); g.strokeStyle = css(PAL.inkLine, 0.9); g.lineWidth = 4; g.strokeRect(W / 2 - 22, H * y - 7, 44, 14); }
    g.fillStyle = "#c9b68c"; g.fillRect(0, H - 14, W, 14);
  });
  // (the cloth is wider and taller than the hole and its picture is mapped to the hole; outside it the picture's edge
  // colour runs on, so that an oblique camera never sees past the cloth)
  const FM = 0.45, FT = 0.3, FH = D.h + FT;
  const flap = new THREE.Mesh(uvXY(new THREE.PlaneGeometry(D.w + 2 * FM, FH).translate(0, -FH / 2, 0), -D.w / 2, D.w / 2, -FH, -FT), flat("#ffffff", tFlap, 0.9));
  flap.position.set(D.at.x, D.h + FT, F.z - FLAP_BACK); flap.receiveShadow = true; flap.name = "camp.flap"; group.add(flap);

  // ---- two banner poles, two cold fire baskets outside them (the wall right of the door stays bare: line 2)
  const mPole = flat(PAL.woodLo), mBan = bannerMat(M, "x", 2.6);
  for (const s of [-1, 1]) anim.push(bannerPole(B, group, mPole, mBan, fx + s * L.CAMP.poleDx, F.z + 0.5, 5.5, 0.95, 2.45, 0.6 + s).animate);
  const mIron = flat(PAL.iron, null, 0.6), mLog = flat("#4e4038");
  for (const s of [-1, 1]) {
    const bx = fx + s * (L.CAMP.poleDx + 0.75), bz = F.z + 0.62, fb = fireBasketG(0.78, 0.27);
    B.add(mIron, fb.legs.translate(bx, 0, bz)); B.add(mIron, fb.bowl.translate(bx, 0, bz));
    for (const [a, tilt] of [[0.3, 0.5], [2.4, 0.45], [4.4, 0.55]] as [number, number][]) B.add(mLog, limb(V(bx - Math.cos(a) * 0.16, 0.7, bz - Math.sin(a) * 0.16), V(bx + Math.cos(a) * 0.18, 0.8 + tilt * 0.22, bz + Math.sin(a) * 0.18), 0.05, 0.045, 8));
  }

  // ---- the sun disc of line 19 (time passes): unlit, brighter than white, never outlined
  const sun = new THREE.Group(); sun.name = "camp.sun"; sun.visible = false; group.add(sun);
  { const d = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.0, 0.9), fog: false })); d.layers.set(NOINK); sun.add(d);
    const h = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), new THREE.MeshBasicMaterial({ map: paint(128, 128, (g, S) => { const gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2); gr.addColorStop(0, "rgba(255,236,170,0.9)"); gr.addColorStop(0.3, "rgba(255,236,170,0.4)"); gr.addColorStop(1, "rgba(255,236,170,0)"); g.fillStyle = gr; g.fillRect(0, 0, S, S); }), transparent: true, depthWrite: false, fog: false }));
    h.position.z = -0.5; h.layers.set(NOINK); sun.add(h); }

  B.flush(group, "camp.static"); NC.flush(group, "camp.walls", false, true);
  lightRig(group, { dir: SUN_DIR, k: 2.4, col: "#ffe9c8", at: [fx, 0, -2], half: 9, hemi: ["#ffffff", "#ffffff", 0.5] });
  return {
    group, tris: B.tris + NC.tris,
    /** 0 = the flap hangs shut .. 1 = rolled up under the lintel */
    setFlap(k) { flap.scale.y = 1 - 0.89 * clamp(k); },
    /** the sun's travel across the sky, 0..1 (left to right, an arc over the roof); null = no disc */
    setSun(u) { sun.visible = u !== null; if (u !== null) sun.position.set(fx - 7 + 14 * u, 14 + 6 * Math.sin(Math.PI * u), F.z - 46); },
    animate(t) { for (const a of anim) a(t); },
  };
}

// =====================================================================================================================
// THE BACK ROAD ROUND THE HILL (line 18, second beat)
// =====================================================================================================================
// A long lens from far off: one horse and four men on a NARROW track that comes round the foot of a green hill, no
// camp, no banner, nobody else: the opposite of the gate's broad road. The hill is two rounded masses (one mesh
// each); its trees are fat toon shapes; everything further is the painted card.
export function buildPath(M: Mats): Built {
  const group = new THREE.Group(); group.name = "path"; group.visible = false;
  const flat = flatOf(M), B = new Batch(), NC = new Batch();
  const H = L.HILL, a = H.path[0], b = H.path[1], mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, eye = L.CAMS.hill.pos;
  const zAt = (x: number) => a.z + ((x - a.x) / (b.x - a.x)) * (b.z - a.z);

  // ---- ground: grass, the narrow pale track with soft edges winding out of the frame at both ends
  const GC = { x: mx, z: mz + 8, size: 64 };
  const tG = groundTex(GC.x, GC.z, GC.size, 2048, "#b7b673", (g, k) => {
    mottle(g, k.S, 71, "#c9c684", "#9fa85e", 110, 0.2);
    const r = rng(73);
    // the track: 1.5 m wide where they run, bending toward the camera on the left and away behind the hill on the right
    const pts: [number, number][] = [];
    for (let i = 0; i <= 60; i++) { const x = mx - 30 + i, d = x - mx; pts.push([x, zAt(clamp(x, a.x, b.x)) + (d < -11 ? 0.035 * (d + 11) * (d + 11) : d > 11 ? -0.05 * (d - 11) * (d - 11) : 0)]); }
    soft(g, 5, () => {
      g.strokeStyle = css("#ecdcaa", 0.98); g.lineWidth = 2.6 * k.s; g.lineJoin = "round"; g.lineCap = "round";
      g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(k.px(x), k.pz(z)) : g.moveTo(k.px(x), k.pz(z)))); g.stroke();
    });
    g.strokeStyle = css("#cdb882", 0.5); g.lineWidth = 0.12 * k.s;
    for (const off of [-0.5, 0.5]) { g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(k.px(x), k.pz(z + off)) : g.moveTo(k.px(x), k.pz(z + off)))); g.stroke(); }
    // darker grass in soft drifts on the camera's side (the foreground of a long lens)
    for (let i = 0; i < 26; i++) blotch(g, k.px(mx - 14 + 28 * r()), k.pz(mz + 4 + 16 * r()), (1.5 + 2.5 * r()) * k.s, "#8f9c54", 0.3);
  });
  const ground = new THREE.Mesh(groundG(GC.x, GC.z, GC.size), flat("#ffffff", tG, 0.95)); ground.receiveShadow = true; ground.name = "path.ground"; group.add(ground);

  group.add(skyDome(V(mx, 0, mz), DAY_SKY));
  const CZ = mz - 80, Dc = eye[2] - CZ, ey = eye[1];
  group.add(farCard(mx - 60, mx + 60, -2, 58, CZ, 2048, 1024, (g, k) => {
    for (let y = 0; y < k.H; y++) { const yw = 58 - (60 * (y + 0.5)) / k.H; g.fillStyle = css(skyAt(DAY_SKY, (Math.atan2(yw - ey, Dc) * 180) / Math.PI)); g.fillRect(0, y, k.W, 1); }
    cloud(g, k.px(mx - 9), k.py(26), 13 * k.s, 3); cloud(g, k.px(mx + 13), k.py(33), 11 * k.s, 6); cloud(g, k.px(mx + 30), k.py(22), 12 * k.s, 8);
    hills(g, 0, k.W, k.py(ey), 20 * k.s, 81, far("#7f9cc6", 0.4), null, 3);
    hills(g, 0, k.W, k.py(ey), 11 * k.s, 82, far("#8fae8a", 0.35), null, 5);
    g.fillStyle = far("#b7b673", 0.3); g.fillRect(0, k.py(ey), k.W, k.H);
  }));

  // ---- the hill: two rounded masses behind the track (flattened spheres sunk into the ground: one outline each)
  const tHill = paint(512, 512, (g, S) => { const r = rng(75); g.fillStyle = "#f2f2f2"; g.fillRect(0, 0, S, S); for (let i = 0; i < 40; i++) blotch(g, S * r(), S * r(), S * (0.05 + 0.1 * r()), r() < 0.5 ? [255, 255, 255] : [196, 204, 180], 0.3); }, true);
  const dome = (x: number, z: number, rx: number, h: number, rz: number, col: string) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 20, 0, Math.PI * 2, 0, Math.PI / 2), flat(col, tHill, 0.95));
    // no outline on the hills (a far, long silhouette against the sky would be a crawling dashed line)
    m.scale.set(rx, h, rz); m.position.set(x, -0.02, z); m.receiveShadow = true; m.castShadow = false; m.layers.set(NOINK); m.name = "path.hill"; group.add(m);
  };
  const HA = { x: H.hill.at.x - 6, z: H.hill.at.z + 2, rx: H.hill.rx * 0.8, h: H.hill.h * 1.15, rz: H.hill.rz };
  dome(HA.x, HA.z, HA.rx, HA.h, HA.rz, "#9db868");
  dome(H.hill.at.x + 26, H.hill.at.z + 9, H.hill.rx * 0.55, H.hill.h * 0.7, H.hill.rz * 0.8, "#aac272");
  /** the main hill's height at (x, z) */
  const hillY = (x: number, z: number) => HA.h * Math.sqrt(Math.max(0, 1 - ((x - HA.x) / HA.rx) ** 2 - ((z - HA.z) / HA.rz) ** 2));

  // ---- trees and bushes: fat toon shapes (a trunk 0.5 m thick, a crown of three balls), far from the track
  const mTrunk = flat("#8a6540"), mLeafA = flat("#6f9a4e"), mLeafB = flat("#84aa58"), mRock = flat("#b3ad9f");
  const tree = (x: number, z: number, s: number, y = 0, m = mLeafA) => {
    B.add(mTrunk, limb(V(x, y - 0.1, z), V(x, y + 2.2 * s, z), 0.28 * s, 0.2 * s, 8));
    B.add(m, new THREE.SphereGeometry(1.5 * s, 14, 10).translate(x, y + 3.3 * s, z));
    B.add(m, new THREE.SphereGeometry(1.1 * s, 12, 9).translate(x - 1.15 * s, y + 2.7 * s, z + 0.2 * s));
    B.add(m, new THREE.SphereGeometry(1.15 * s, 12, 9).translate(x + 1.2 * s, y + 2.8 * s, z - 0.1 * s));
  };
  const bush = (x: number, z: number, s: number, m = mLeafB) => { B.add(m, new THREE.SphereGeometry(0.7 * s, 12, 8).scale(1.3, 0.75, 1).translate(x, 0.28 * s, z)); B.add(m, new THREE.SphereGeometry(0.5 * s, 10, 8).scale(1.2, 0.8, 1).translate(x + 0.75 * s, 0.2 * s, z + 0.1 * s)); };
  // the trees stand ON the hillside, above and beside the runners' heads; the strip behind the track stays bare
  for (const [x, z, sc, m] of [[mx - 5.6, mz - 9.5, 1.0, mLeafA], [mx + 4.4, mz - 11, 1.1, mLeafB], [mx - 0.4, mz - 17, 1.0, mLeafB], [mx + 9.5, mz - 13, 1.1, mLeafA], [mx - 11.5, mz - 11, 1.15, mLeafB]] as [number, number, number, typeof mLeafA][]) tree(x, z, sc, hillY(x, z), m);
  // low tufts in front of the track, under the runners' feet line (the camera looks over them), and two rocks behind it
  bush(mx - 3.3, mz + 7.5, 0.55, mLeafA); bush(mx + 2.7, mz + 8.5, 0.5);
  for (const [x, z, sc] of [[mx + 2.2, mz - 2.6, 0.42], [mx - 3.9, mz - 3.0, 0.36]] as [number, number, number][]) B.add(mRock, new THREE.SphereGeometry(sc, 9, 7).scale(1.3, 0.7, 1).translate(x, sc * 0.25, z));

  B.flush(group, "path.static"); NC.flush(group, "path.nocast", false, true);
  lightRig(group, { dir: SUN_DIR, k: 2.4, col: "#ffe9c8", at: [mx, 0, mz], half: 13, hemi: ["#ffffff", "#ffffff", 0.5] });
  return { group, animate() {}, tris: B.tris + NC.tris };
}

// =====================================================================================================================
// looks (sets/index.ts PLACE_LOOKS takes them)
// =====================================================================================================================
/** the three values the rig bakes into a figure when it is first built: the film's (sets/index.ts BAKED_LIGHT) */
export const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as const;
/** daylight on the figures: the Arthur yard's light (key = SUN_DIR) */
export const DAY_CAST = { ...YARD_CAST_LIGHT, ...BAKED } as unknown as CastLight;
export const DAY_AO = { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.9, color: "#2b2a4a" };
export const OUTDOOR_LOOKS = {
  gate: { bg: DAY_BG, ao: DAY_AO, cast: DAY_CAST },
  camp: { bg: DAY_BG, ao: DAY_AO, cast: DAY_CAST },
  path: { bg: DAY_BG, ao: DAY_AO, cast: DAY_CAST },
};
