// THE STAIRS (place "stairs", island x 100): the top of a dark oak staircase in Trinity at 5 a.m. in May, the sun well
// up (PLAN 1, 7A). WP2's set; the exports are the contract of sets/index.ts: STAIRS_LOOK, STAIRS_PARAMS,
// buildStairs(K) -> { group, view, animate, setParam, cast }. Every place-number is layout/stairs.ts STAIRS_SET.
//
// WHAT THERE IS (the camera comes up the flight looking -z)
//   - the flight of dark oak steps running down toward +z (worn paler in the middle), a lower landing far below;
//   - limewashed walls over an oak plank dado that follows the flight, an oak handrail on the left wall;
//   - the landing (wide oak boards), a plaster ceiling with two oak beams;
//   - HIS DOOR in the right wall: dark oak, six raised panels, iron strap hinges and a ring handle, a chunky oak
//     architrave; it opens INWARD (param door 0..1) on hinges at its far edge; a 2.5 cm gap under it;
//   - THE CANDLE GLOW (param glow 0..1): a warm strip in the gap under the door, a soft fan of light on the boards in
//     front of it, and the place's point light behind the door (it lights his dim room and spills on the landing);
//   - THE STAIR WINDOW in the back wall (two leaded lights, a mullion, a deep plaster reveal, an oak sill): the LOW
//     MORNING SUN comes through it from the back left (the shadowed key: the walls and the ceiling cast, a hidden caster
//     in the glass throws the leading) and lays a slanting slab of warm light, cut into diamonds, across the door; a
//     faint shaft with dust turning in it;
//   - behind the door, only seen through the doorway: a corner of his room in candle light (dark panelling, closed
//     shutters with day leaking round them, a table heaped with paper, a shelf of books).
//   OPTIONAL PARAMS (added by WP5-A; their defaults keep the set as it was): `leak` 0..1 (1: the bright day round the
//   shutters; 0: the shutters shut tight, no bright seams: segA, so no white line hangs over a head in the doorway);
//   `gapLine` 0..1 (0: off; 1: the candle light as a bright warm line IN the gap under the shut door, landing side, and
//   a short spill on the boards in front of it: the strip behind the leaf is hidden from eye height).
//   `puff` / `puff2` (seconds since a rap; < 0 = none, the default): THE INVISIBLE KNOCK (Jay, 14 Nov: no hand, no mic):
//   each rap shakes a little dust out of the panel's mouldings at STAIRS.knock; it puffs out toward the landing, slows,
//   sinks and fades in about 0.6 s, catching the sun (WP5-A).
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css } from "../../../kit/sets/okit";
import { STAIRS_SET as S, STAIRS, STX } from "../layout/stairs";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, ceilQuad, wallQuad, tileUV, Part, glowSprite } from "./parts/common";
import { NC, NOINK, holedWall, wallPoly, revealG, leadedWindow, doorLeaf, doorTex, panelTex, plasterTex, oakBoardsTex, sunShaft, dustMotes, pageTex, pageEdgeTex, spinesTex } from "./parts/newton";

const SUN = new THREE.Vector3(...S.sun).normalize();
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.22, 0.18, 0.15]], [-10, [0.28, 0.24, 0.21]], [10, [0.36, 0.32, 0.29]], [90, [0.4, 0.37, 0.36]]],
  boxes: [{ az: Math.atan2(SUN.z, SUN.x) * 180 / Math.PI, el: 21, rot: 0, w: 30, h: 22, soft: 14, col: [0.9, 0.74, 0.55] }],
};
/** MORNING ON THE STAIRS: a low warm sun from the stair window (back left of the landing), warm rose shade */
export const STAIRS_LOOK: PlaceLook = {
  bg: "#2e2620",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.8, color: "#2a1e1a" },
  cast: {
    key: [-0.75, 0.36, -0.55], tint: [1.0, 0.86, 0.68], tintK: 0.6, gain: 0.96, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.9, 1.0],
    shade: [1.08, 0.95, 1.18], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.25, bodySat: 0.14, sheen: 0.14, lift: 0.03, contactLen: 0.2,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.4,
};
/** the per-frame dressing: door 0..1 (0 shut, 1 open inward ~100 deg), glow 0..1 (his candle's light under the door);
 *  leak 0..1 (the day round his room's shutters: 1 bright seams, 0 shut tight), gapLine 0..1 (the glow as a bright line
 *  in the gap under the shut door, seen from the landing: 0 off) */
export const STAIRS_PARAMS: Record<string, ParamValue> = { door: 0, glow: 0, leak: 1, gapLine: 0, puff: -1, puff2: -1 };
/** THE KNOCK'S DUST PUFF (params puff / puff2): motes, their life (s) */
const PUFF = { n: 21, life: 0.62, size: 0.0085 };

const W = S.well, L = S.landing, ST = S.steps, D = S.door, WI = S.window, R = S.room;
const X0 = STX + W.x0, X1 = STX + W.x1;
const ZB = L.z0, ZH = L.z1, ZE = ZH + ST.go * ST.n, YLOW = -ST.n * ST.rise;        // back wall, stair head, flight's end, lower landing
const ZEND = ZE + 1.3;                                                              // the far wall at the bottom of the flight

// ---------------------------------------------------------------------------------------------------- paintings
/** a TREAD (u across the flight, v along the going): dark oak, a paler worn path up the middle, a dark nosing line */
const treadTex = () => paint(512, 128, (g, Wd, H) => {
  const r = rng(51);
  g.fillStyle = NC.oakDark; g.fillRect(0, 0, Wd, H);
  for (let i = 0; i < 26; i++) { const y = H * r(); g.strokeStyle = css(NC.oakDarkLo, 0.5); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(Wd * 0.3, y + 4 * (r() - 0.5), Wd * 0.7, y + 4 * (r() - 0.5), Wd, y); g.stroke(); }
  const gr = g.createRadialGradient(Wd * 0.48, H * 0.55, 0, Wd * 0.48, H * 0.55, Wd * 0.32); gr.addColorStop(0, "rgba(160,118,80,0.55)"); gr.addColorStop(1, "rgba(160,118,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, Wd, H);
  g.fillStyle = "rgba(255,226,180,0.18)"; g.fillRect(0, H - 8, Wd, 4);            // the worn nosing catches the light
  g.fillStyle = css(NC.oakDarkLo, 0.9); g.fillRect(0, H - 4, Wd, 4);
}, true);
/** a RISER: darker oak, scuffed at the foot */
const riserTex = () => paint(256, 64, (g, Wd, H) => {
  g.fillStyle = "#4e3322"; g.fillRect(0, 0, Wd, H);
  const r = rng(53); for (let i = 0; i < 18; i++) { g.fillStyle = css("#3a2a20", 0.35); g.fillRect(r() * Wd, H * 0.6 + r() * H * 0.4, 6 + 20 * r(), 2); }
}, true);
/** THE DADO: vertical oak boards with a capping line (u, v in metres: one tile = 1 m) */
const dadoTex = () => paint(512, 512, (g, Wd, H) => {
  const r = rng(55), n = 6, bw = Wd / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = css(i % 2 ? NC.oak : NC.oakLo); g.fillRect(i * bw, 0, bw, H);
    g.strokeStyle = css(NC.oakDarkLo, 0.4); g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { const x = i * bw + bw * r(); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 6, H / 3, x - 6, 2 * H / 3, x, H); g.stroke(); }
    g.fillStyle = css(NC.oakDarkLo, 0.9); g.fillRect(i * bw - 2, 0, 4, H);
    g.fillStyle = "rgba(255,220,170,0.10)"; g.fillRect(i * bw + 3, 0, 5, H);
  }
}, true);
/** the SHUTTERS behind his room's far wall: closed oak boards, bright cracks of day round them */
const shutterTex = () => paint(256, 384, (g, Wd, H) => {
  g.fillStyle = "#fff3d0"; g.fillRect(0, 0, Wd, H);
  const m = 6; g.fillStyle = "#3e2c22"; g.fillRect(m, m, Wd / 2 - m * 1.3, H - 2 * m); g.fillRect(Wd / 2 + m * 0.3, m, Wd / 2 - m * 1.3, H - 2 * m);
  g.strokeStyle = "rgba(20,14,12,0.6)"; g.lineWidth = 2; for (let i = 1; i < 4; i++) { const x = (Wd / 2) * i / 4; g.beginPath(); g.moveTo(x + m, m); g.lineTo(x + m, H - m); g.stroke(); g.beginPath(); g.moveTo(Wd / 2 + x, m); g.lineTo(Wd / 2 + x, H - m); g.stroke(); }
});
/** the same SHUTTERS shut tight (param leak 0): no bright seams, only a dim warm edge round the boards */
const shutterShutTex = () => paint(256, 384, (g, Wd, H) => {
  g.fillStyle = "#5a3e2c"; g.fillRect(0, 0, Wd, H);
  const m = 6; g.fillStyle = "#3e2c22"; g.fillRect(m * 0.5, m * 0.5, Wd / 2 - m * 0.5, H - m); g.fillRect(Wd / 2, m * 0.5, Wd / 2 - m * 0.5, H - m);
  g.strokeStyle = "rgba(20,14,12,0.6)"; g.lineWidth = 2; for (let i = 1; i < 4; i++) { const x = (Wd / 2) * i / 4; g.beginPath(); g.moveTo(x + m, m); g.lineTo(x + m, H - m); g.stroke(); g.beginPath(); g.moveTo(Wd / 2 + x, m); g.lineTo(Wd / 2 + x, H - m); g.stroke(); }
});
/** the candle light spilling a hand's breadth onto the boards from the gap under the door (bright at v 0; additive) */
const spillTex = () => paint(256, 64, (g, Wd, H) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,214,140,1)"); gr.addColorStop(0.35, "rgba(255,180,96,0.5)"); gr.addColorStop(1, "rgba(255,160,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, Wd, H);
  const ex = g.createLinearGradient(0, 0, Wd, 0); ex.addColorStop(0, "rgba(0,0,0,1)"); ex.addColorStop(0.06, "rgba(0,0,0,0)"); ex.addColorStop(0.94, "rgba(0,0,0,0)"); ex.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = ex; g.fillRect(0, 0, Wd, H);
});
/** the soft fan of candle light on the boards in front of the door (a half ellipse; additive) */
const fanTex = () => paint(256, 128, (g, Wd, H) => {
  const gr = g.createRadialGradient(Wd / 2, 0, 0, Wd / 2, 0, Wd * 0.5); gr.addColorStop(0, "rgba(255,200,120,1)"); gr.addColorStop(0.4, "rgba(255,170,90,0.45)"); gr.addColorStop(1, "rgba(255,150,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, Wd, H);
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildStairs(K: Kit) {
  const group = new THREE.Group(); group.name = "stairs";
  const Mk = maker(K, group);
  const mPlaster = Mk.tex(plasterTex(61), 0.95), mBoards = Mk.tex(oakBoardsTex({ seed: 62, n: 3, base: NC.oak, lo: NC.oakDarkLo }), 0.8);
  const mTread = Mk.tex(treadTex(), 0.7), mRiser = Mk.tex(riserTex(), 0.8), mDado = Mk.tex(dadoTex(), 0.75);
  const mOak = Mk.flat(NC.oakDark, 0.6), mOakMid = Mk.flat(NC.oak, 0.65), mIron = Mk.flat(NC.iron, 0.5), mSill = Mk.flat(NC.oakWarm, 0.6);
  const mBeam = Mk.flat(NC.oakDarkLo, 0.7), mCeil = Mk.tex(plasterTex(63, "#e2d4b8", "#c8b796"), 0.95);

  // =================================================================================================== floors and steps
  Mk.mesh("stairs.landing", levelQuad(X0, X1, ZB, ZH, 0, (x, z) => [x / 0.6, -z / 1.2]), mBoards, { cast: false });
  for (let k = 1; k <= ST.n; k++) {
    // a solid step: its top is the tread (u across, v along the going), its +z face the riser she sees coming up
    const y = -k * ST.rise, z0 = ZH + ST.go * (k - 1), z1 = ZH + ST.go * k;
    const blk = new THREE.Mesh(boxG(X0, X1, y - 0.3, y, z0, z1 + 0.001), [mRiser, mRiser, mTread, mRiser, mRiser, mRiser]);
    blk.name = "stairs.step"; blk.castShadow = true; blk.receiveShadow = true;
    group.add(blk);
  }
  Mk.mesh("stairs.lowLanding", levelQuad(X0, X1, ZE, ZEND, YLOW, (x, z) => [x / 0.6, -z / 1.2]), mBoards, { cast: false });

  // =================================================================================================== walls
  const yW0 = YLOW - 0.4, yC = S.ceil;
  // the back wall with the window
  const aB: [number, number] = [X0, ZB], bB: [number, number] = [X1, ZB];
  const hole = { u0: WI.x0 - W.x0, u1: WI.x1 - W.x0, y0: WI.y0, y1: WI.y1 };
  Mk.mesh("stairs.wall.back", holedWall(aB, bB, -0.05, yC, [hole], 1.2), mPlaster, { cast: true });
  Mk.mesh("stairs.window.reveal", revealG(aB, bB, hole, S.backWall, 1.2), mPlaster, { cast: true });
  Mk.mesh("stairs.window.sill", boxG(STX + WI.x0 - 0.04, STX + WI.x1 + 0.04, WI.y0 - 0.02, WI.y0 + 0.035, ZB - 0.3, ZB + 0.06), mSill);
  // the left wall (faces +x), the whole height of the well
  const aL: [number, number] = [X0, ZEND], bL: [number, number] = [X0, ZB];
  Mk.mesh("stairs.wall.left", holedWall(aL, bL, yW0, yC, [], 1.2), mPlaster, { cast: true });
  // the right wall (faces -x) with the door
  const aR: [number, number] = [X1, ZB], bR: [number, number] = [X1, ZEND];
  const dHole = { u0: D.z0 - ZB, u1: D.z1 - ZB, y0: 0, y1: D.h };
  Mk.mesh("stairs.wall.right", holedWall(aR, bR, yW0, yC, [dHole], 1.2), mPlaster, { cast: true });
  for (const [k, nm] of ["jambL", "jambR", "head"].entries()) Mk.mesh(`stairs.door.${nm}`, revealG(aR, bR, { ...dHole, y0: 0.0 }, S.wall, 1, [k]), mOakMid, { cast: true });
  // the far wall at the foot of the flight (faces -z, toward the camera looking down)
  Mk.mesh("stairs.wall.end", wallQuad([X1, ZEND], [X0, ZEND], yW0, yC, { tileU: 1.2, vTile: 1.2 }), mPlaster, { cast: true });
  // the ceiling and two beams
  Mk.mesh("stairs.ceiling", ceilQuad(X0, X1, ZB, ZEND, yC, (x, z) => [x / 1.2, z / 1.2]), mCeil, { cast: true });
  for (const z of [ZB + 0.55, ZH + 0.6]) Mk.mesh("stairs.beam", tileUV(boxG(X0, X1, yC - 0.2, yC + 0.01, z - 0.11, z + 0.11), 0.5), mBeam);

  // the dado: oak boards 3.5 cm off the two side walls, its top flat over the landing and sloping with the flight (a
  // constant height over the nosings' pitch line), cut round the door on the right
  {
    const top = S.dado, k = 0.035, uH = ZH - ZB, uE = ZE - ZB, uF = ZEND - ZB, ud0 = D.z0 - S.arch.w - ZB, ud1 = D.z1 + S.arch.w - ZB;
    // the right wall: u = z - ZB (a = the back end)
    Mk.mesh("stairs.dado.right", wallPoly(aR, bR, [[0, yW0], [uF, yW0], [uF, YLOW + top], [uE, YLOW + top], [uH, top], [ud1, top], [ud1, -0.02], [ud0, -0.02], [ud0, top], [0, top]], k), mDado);
    // the left wall: u = ZEND - z (a = the far end)
    Mk.mesh("stairs.dado.left", wallPoly(aL, bL, [[0, yW0], [uF, yW0], [uF, top], [uF - uH, top], [uF - uE, YLOW + top], [0, YLOW + top]], k), mDado);
  }
  // the capping rail on both dados (chunky, inked): over the landing level and along the slope
  {
    const cap = (x: number, s: number) => {
      const xs = s > 0 ? x : x - 0.06, xe = s > 0 ? x + 0.06 : x;
      Mk.mesh("stairs.dadoCap", boxG(xs, xe, S.dado - 0.005, S.dado + 0.045, s > 0 ? ZB : D.z1 + S.arch.w, ZH), mOak);
      if (s < 0) Mk.mesh("stairs.dadoCap", boxG(xs, xe, S.dado - 0.005, S.dado + 0.045, ZB, D.z0 - S.arch.w), mOak);
      const len = Math.hypot(ZE - ZH, ST.n * ST.rise), ang = Math.atan2(ST.n * ST.rise, ZE - ZH);
      const g = new THREE.BoxGeometry(0.06, 0.05, len).rotateX(ang).translate((xs + xe) / 2, S.dado + 0.02 - ST.n * ST.rise / 2, (ZH + ZE) / 2);
      Mk.mesh("stairs.dadoCap.slope", g, mOak);
    };
    cap(X0, 1); cap(X1, -1);
  }
  // the handrail on the left wall: a round oak rail on iron brackets, along the flight and on over the landing
  {
    const P = new Part(K), rh = S.rail.h, xr = X0 + S.rail.off + 0.035;
    const a = new THREE.Vector3(xr, rh + 0.04, ZB + 0.3), b = new THREE.Vector3(xr, rh + 0.04, ZH), c = new THREE.Vector3(xr, YLOW + rh, ZE + 0.1);
    const rod = (p: THREE.Vector3, q: THREE.Vector3) => { const d = q.clone().sub(p), len = d.length(); return new THREE.CylinderGeometry(S.rail.r, S.rail.r, len, 12).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())).translate((p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2); };
    P.add(mOak, rod(a, b), 0.006); P.add(mOak, rod(b, c), 0.006);
    for (const t of [0.15, 0.5, 0.85]) { const q = b.clone().lerp(c, t); P.add(mIron, boxG(X0, xr, q.y - 0.07, q.y - 0.04, q.z - 0.015, q.z + 0.015), 0.004); }
    P.add(mIron, boxG(X0, xr, a.y - 0.07, a.y - 0.04, a.z + 0.2 - 0.015, a.z + 0.2 + 0.015), 0.004);
    P.into(group, "stairs.handrail", { cast: true });
  }

  // =================================================================================================== the door
  const dTex = doorTex({ w: D.z1 - D.z0, h: D.h, base: NC.oakDark, lo: "#3a281c", hi: "#8a6444", rows: 3, cols: 2 });
  const mDoor = Mk.tex(dTex, 0.6), mDoorBack = Mk.tex(dTex, 0.7);
  const leaf = doorLeaf(K, { w: D.z1 - D.z0, h: D.h, t: D.t, face: mDoor, back: mDoorBack, edge: mOak, iron: mIron, name: "stairs.door", gap: 0.025 });
  leaf.position.copy(STAIRS.hinge).setX(STAIRS.hinge.x + 0.02);
  leaf.rotation.y = -Math.PI / 2;
  group.add(leaf);
  // the architrave on the landing side (chunky, 5 cm proud) and the oak threshold
  {
    const aw = S.arch.w, ad = 0.05;
    Mk.mesh("stairs.architrave", boxG(X1 - ad, X1 + 0.005, 0, D.h + aw, D.z0 - aw, D.z0), mOak);
    Mk.mesh("stairs.architrave", boxG(X1 - ad, X1 + 0.005, 0, D.h + aw, D.z1, D.z1 + aw), mOak);
    Mk.mesh("stairs.architrave", boxG(X1 - ad, X1 + 0.005, D.h, D.h + aw, D.z0 - aw, D.z1 + aw), mOak);
    Mk.mesh("stairs.architrave.cornice", boxG(X1 - ad - 0.03, X1 + 0.005, D.h + aw, D.h + aw + 0.05, D.z0 - aw - 0.03, D.z1 + aw + 0.03), mOak);
  }
  // the glow under the door: a warm strip behind the gap, and a soft fan on the boards in front of it
  const mGap = Mk.basic("#ffb35a"); const gapStrip = Mk.mesh("stairs.glow.gap", new THREE.PlaneGeometry(D.z1 - D.z0 - 0.02, 0.03).rotateY(-Math.PI / 2).translate(X1 + 0.11, 0.015, (D.z0 + D.z1) / 2), mGap, { cast: false, receive: false, noink: true });
  const mFan = new THREE.MeshBasicMaterial({ map: fanTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const fan = Mk.mesh("stairs.glow.fan", new THREE.PlaneGeometry(1.3, 0.75).rotateX(-Math.PI / 2).translate(0, 0.0008, 0.375).rotateY(-Math.PI / 2).translate(X1 - 0.01, 0, (D.z0 + D.z1) / 2), mFan, { cast: false, receive: false, noink: true });
  fan.renderOrder = 4;
  // param gapLine: the same light as a LINE in the gap itself, just behind the leaf's landing face (2.5 cm tall: seen
  // from eye height on the landing, unlike the strip behind the leaf), and a hand's breadth of spill on the boards
  const xFace = STAIRS.hinge.x + 0.02 - D.t / 2, mLine = Mk.basic("#ffd08a");
  const gapLine = Mk.mesh("stairs.glow.line", new THREE.PlaneGeometry(D.z1 - D.z0 - 0.03, 0.021).rotateY(-Math.PI / 2).translate(xFace + 0.004, 0.0125, (D.z0 + D.z1) / 2), mLine, { cast: false, receive: false, noink: true });
  const mSpill = new THREE.MeshBasicMaterial({ map: spillTex(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const spill = Mk.mesh("stairs.glow.spill", new THREE.PlaneGeometry(D.z1 - D.z0 - 0.02, 0.09).rotateX(-Math.PI / 2).translate(0, 0.0012, 0.045).rotateY(-Math.PI / 2).translate(xFace + 0.004, 0, (D.z0 + D.z1) / 2), mSpill, { cast: false, receive: false, noink: true });
  spill.renderOrder = 5; gapLine.visible = false; spill.visible = false;

  // =================================================================================================== the window
  const mGlass = new THREE.MeshBasicMaterial({ color: "#fff1d6", fog: false });
  const win = leadedWindow(K, { a: aB, b: bB, hole, inset: WI.inset, mats: { glass: mGlass, frame: Mk.flat(NC.stone, 0.85) }, lights: WI.lights, q: 0.13, name: "stairs.window", glassMat: mGlass, mullionW: 0.08 });
  group.add(win.group);
  // the sun shaft from the glass toward the door, and dust turning in it
  const gz = ZB - WI.inset + 0.02, corners = [new THREE.Vector3(STX + WI.x0, WI.y0, gz), new THREE.Vector3(STX + WI.x1, WI.y0, gz), new THREE.Vector3(STX + WI.x1, WI.y1, gz), new THREE.Vector3(STX + WI.x0, WI.y1, gz)];
  const travel = SUN.clone().negate();
  const shaft = sunShaft(corners, travel, 1.75, "#ffd9a0", 0.05); group.add(shaft);
  const dust = dustMotes(26, corners, travel, 1.6, { size: 0.011, seed: 57 }); group.add(dust.points);

  // =================================================================================================== the knock's dust
  // two puffs (one per rap): a soft warm haze blooming off the panel at the knock point, and fine motes of two sizes
  // out toward the landing (-x) in a loose cone, slowed by the air (tau 0.12 s), sinking a little, fading; additive and
  // unlit like the shaft's dust (NOINK); the haze card turns to the lens (view)
  const moteT = paint(32, 32, (g, Sz) => { const gr = g.createRadialGradient(Sz / 2, Sz / 2, 0, Sz / 2, Sz / 2, Sz / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,0.4)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, Sz, Sz); });
  const puffFrom = new THREE.Vector3(STX + D.x + 0.012, STAIRS.knock.y, STAIRS.knock.z);
  const puffs = [0, 1].map((k) => {
    const r = rng(81 + k), seeds = Array.from({ length: PUFF.n }, () => {
      const a = (r() - 0.5) * 2.2, b = (r() - 0.35) * 1.4;
      return { d: new THREE.Vector3(-1, b * 0.6, a * 0.6).normalize(), v: 0.08 + 0.3 * r(), ph: r() * 6.28, sink: 0.04 + 0.1 * r(), o: new THREE.Vector3(0, (r() - 0.5) * 0.06, (r() - 0.5) * 0.07) };
    });
    const groups = [0, 1].map((big) => {
      const idx = seeds.map((_, i) => i).filter((i) => i % 3 === 0 ? big === 1 : big === 0);
      const pos = new Float32Array(idx.length * 3), geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ size: big ? PUFF.size : PUFF.size * 0.55, map: moteT, color: "#ffe9c8", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
      const pts = new THREE.Points(geo, mat); pts.layers.set(NOINK); pts.frustumCulled = false; pts.renderOrder = 7; pts.name = "stairs.knockDust"; pts.visible = false;
      group.add(pts);
      return { idx, pos, geo, mat, pts, big };
    });
    const haze = glowSprite(1, "#ffdcaa", 0); haze.name = "stairs.knockHaze"; haze.position.copy(puffFrom); haze.visible = false; group.add(haze);
    const mHaze = haze.material as THREE.MeshBasicMaterial;
    const update = (age: number) => {
      const on = age >= 0 && age < PUFF.life;
      haze.visible = on && age < PUFF.life * 0.8;
      for (const G of groups) G.pts.visible = on;
      if (!on) return;
      const tau = 0.12, run = tau * (1 - Math.exp(-age / tau)), fade = Math.min(1, age / 0.035) * Math.pow(1 - age / PUFF.life, 1.4);
      const hk = age / (PUFF.life * 0.8);
      haze.scale.setScalar(0.03 + 0.07 * Math.sqrt(Math.min(1, hk))); haze.position.copy(puffFrom).add(new THREE.Vector3(-0.025 * Math.sqrt(Math.min(1, hk)), -0.01 * hk, 0));
      mHaze.opacity = 0.2 * Math.min(1, age / 0.035) * Math.pow(Math.max(0, 1 - hk), 1.6);
      for (const G of groups) {
        G.mat.opacity = (G.big ? 0.42 : 0.6) * fade;
        G.idx.forEach((i, j) => {
          const m = seeds[i];
          G.pos[3 * j] = puffFrom.x + m.o.x + m.d.x * m.v * run;
          G.pos[3 * j + 1] = puffFrom.y + m.o.y + m.d.y * m.v * run - m.sink * age * age + 0.004 * Math.sin(age * 9 + m.ph);
          G.pos[3 * j + 2] = puffFrom.z + m.o.z + m.d.z * m.v * run;
        });
        (G.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }
    };
    return { update, haze };
  });
  const puffAge = [-1, -1];

  // =================================================================================================== his room behind the door
  let shutOpen: THREE.Object3D | null = null, shutShut: THREE.Object3D | null = null, mShut: THREE.MeshBasicMaterial | null = null;
  {
    const rx0 = X1 + S.wall, rx1 = STX + W.x1 + R.x1, mPanel = Mk.tex(panelTex({ seed: 64, cols: 2, rows: 2, tw: 1.2, th: 1.2, base: "#5a3e2a", lo: "#3e2a1e", hi: "#7a5a3e" }), 0.8);
    Mk.mesh("stairs.room.floor", levelQuad(X1, rx1, R.z0, R.z1, 0, (x, z) => [x / 0.6, -z / 1.2]), mBoards, { cast: false });
    Mk.mesh("stairs.room.far", wallQuad([rx1, R.z0], [rx1, R.z1], 0, R.h, { tileU: 1.2, vTile: 1.2 }), mPanel, { cast: false });
    Mk.mesh("stairs.room.back", wallQuad([rx0, R.z0], [rx1, R.z0], 0, R.h, { tileU: 1.2, vTile: 1.2 }), mPanel, { cast: false });
    Mk.mesh("stairs.room.front", wallQuad([rx1, R.z1], [rx0, R.z1], 0, R.h, { tileU: 1.2, vTile: 1.2 }), mPanel, { cast: false });
    Mk.mesh("stairs.room.ceiling", ceilQuad(X1, rx1, R.z0, R.z1, R.h, (x, z) => [x / 1.2, z / 1.2]), mCeil, { cast: false });
    // the shuttered window on the far wall (day leaking round the shutters), a table heaped with paper, a shelf
    shutOpen = Mk.mesh("stairs.room.shutters", new THREE.PlaneGeometry(0.9, 1.3).rotateY(-Math.PI / 2).translate(rx1 - 0.01, 1.55, -0.4), Mk.basic("#ffffff", { map: shutterTex() }), { cast: false, receive: false, noink: true });
    // param leak < 1: the shutters shut tight, laid 2 mm in front (opacity 1 - leak)
    mShut = new THREE.MeshBasicMaterial({ map: shutterShutTex(), transparent: true, opacity: 1, fog: false });
    shutShut = Mk.mesh("stairs.room.shuttersShut", new THREE.PlaneGeometry(0.9, 1.3).rotateY(-Math.PI / 2).translate(rx1 - 0.012, 1.55, -0.4), mShut, { cast: false, receive: false, noink: true });
    shutShut.visible = false;
    const P = new Part(K), mPaper = Mk.tex(pageEdgeTex(65), 0.9), mPage = Mk.tex(pageTex(66, { figure: true }), 0.9), tz = -0.4, tx = rx1 - 0.55;
    P.add(mOakMid, boxG(tx - 0.35, tx + 0.35, 0.7, 0.75, tz - 0.6, tz + 0.6), 0.006);
    for (const [dx, dz] of [[-0.3, -0.5], [0.3, -0.5], [-0.3, 0.5], [0.3, 0.5]]) P.add(mOakMid, boxG(tx + dx - 0.03, tx + dx + 0.03, 0, 0.7, tz + dz - 0.03, tz + dz + 0.03), 0.005);
    const r = rng(67);
    for (let i = 0; i < 6; i++) { const h = 0.04 + 0.12 * r(), x = tx - 0.2 + 0.4 * r(), z = tz - 0.45 + 0.9 * r(), w = 0.21, d = 0.29; P.shell([[mPaper, boxG(x - w / 2, x + w / 2, 0.75, 0.75 + h, z - d / 2, z + d / 2)], [mPage, new THREE.PlaneGeometry(w - 0.004, d - 0.004).rotateX(-Math.PI / 2).translate(x, 0.751 + h, z)]], 0.004); }
    P.into(group, "stairs.room.table", { cast: true });
    Mk.mesh("stairs.room.books", new THREE.PlaneGeometry(1.4, 0.36).translate(0, 0, 0).rotateY(0).translate((rx0 + rx1) / 2 + 0.3, 1.35, R.z0 + 0.01), Mk.tex(spinesTex(68, 1.4, 0.36), 0.8), { cast: false });
    Mk.mesh("stairs.room.shelf", boxG((rx0 + rx1) / 2 - 0.42, (rx0 + rx1) / 2 + 1.02, 1.12, 1.17, R.z0, R.z0 + 0.28), mOakMid);
  }

  // =================================================================================================== the light
  const at: [number, number, number] = [STX - 0.1, 0, 0.9];
  const Lr = lightRig(group, { dir: S.sun, k: 6.0, col: "#ffd29a", at, half: 4.6, hemi: ["#d4c4b0", "#5a4434", 0.8], point: { col: "#ffa850", k: 0, at: [X1 + S.glow.x, S.glow.y, S.glow.z], dist: S.glow.dist } });
  Lr.key.shadow.bias = -0.0004; Lr.key.shadow.normalBias = 0.015;

  // the walls the camera stands behind (outside the well): hidden by view()
  const hideable: [THREE.Object3D, (p: THREE.Vector3) => boolean][] = [];
  group.traverse((o) => {
    if (o.name === "stairs.wall.left" || o.name === "stairs.dado.left") hideable.push([o, (p) => p.x < X0 - 0.02]);
    if (o.name === "stairs.wall.right" || o.name.startsWith("stairs.dado.right")) hideable.push([o, (p) => p.x > X1 + 0.02]);
    if (o.name === "stairs.wall.back") hideable.push([o, (p) => p.z < ZB - 0.02]);
    if (o.name === "stairs.wall.end") hideable.push([o, (p) => p.z > ZEND + 0.02]);
  });
  let glow = 0, door = 0, line = 0;
  const showLine = () => { const on = glow > 0.01 && line > 0.01 && door < 0.02; gapLine.visible = on; spill.visible = on; };
  return {
    group,
    view(cam: THREE.Vector3) { for (const [o, behind] of hideable) o.visible = !behind(cam); for (const P of puffs) P.haze.lookAt(cam); },
    animate(t: number) {
      dust.update(t, 1);
      puffs[0].update(puffAge[0]); puffs[1].update(puffAge[1]);
      // the candle behind the door breathes a little (its light under the door)
      const k = glow * (1 + 0.06 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 12.9 + 1.1));
      Lr.point.intensity = 1.6 * k; mFan.opacity = 0.5 * k;
      mGap.color.setRGB(1.0 * Math.min(1, 0.15 + k), 0.7 * Math.min(1, 0.15 + k), 0.35 * Math.min(1, 0.15 + k));
      const kl = Math.min(1, k * line); mLine.color.setRGB(1.0 * kl, 0.74 * kl, 0.4 * kl); mSpill.opacity = 0.8 * kl;
    },
    setParam(name: string, v: ParamValue) {
      if (name === "door") { door = Math.max(0, Math.min(1, Number(v))); leaf.rotation.y = -Math.PI / 2 + door * D.swing; showLine(); }
      if (name === "glow") { glow = Math.max(0, Math.min(1, Number(v))); gapStrip.visible = glow > 0.01; fan.visible = glow > 0.01; showLine(); }
      if (name === "gapLine") { line = Math.max(0, Math.min(1, Number(v))); showLine(); }
      if (name === "puff") puffAge[0] = Number(v);
      if (name === "puff2") puffAge[1] = Number(v);
      if (name === "leak" && shutOpen && shutShut && mShut) {
        const lk = Math.max(0, Math.min(1, Number(v)));
        shutOpen.visible = lk > 0.001; shutShut.visible = lk < 0.999; mShut.opacity = 1 - lk;
      }
    },
    cast(): Partial<CastLight> { return {}; },
  };
}
void NOINK;
