// THE ELABORATORY (place "elaboratory", island x 600): inside Newton's brick outbuilding at night (PLAN 1, 7F, G
// start). WP2's set; the exports are the contract of sets/index.ts: ELAB_LOOK, ELAB_PARAMS { fire, candle, embers },
// buildElaboratory(K) -> { group, animate, setParam, cast }; elabCast(fire, t) is the figure light. Every
// place-number is layout/elaboratory.ts ELAB_SET.
//
// WHAT THERE IS (the camera mostly looks north, -z, from the door's side)
//   - sooty brick walls, a brick floor laid in basket weave (ash toward the furnace), the pent roof's rafters sloping
//     from the back (high) to the front (low);
//   - LEFT: THE FURNACE, its iron fire door swung open on the fire (THE KEY LIGHT: warm orange, flickering from t only;
//     param fire 1 = a roaring yellow-orange, 0 = deep red embers, never out), the ash pit glowing under it, a sand bath
//     with a glass retort on its top, a brick hood up to the ceiling with crucibles on its ledge; beside it in the back
//     corner a round brick ATHANOR with a glass alembic; bellows on a peg; THE CHARCOAL HEAP on the floor by the door;
//     sparks rising from the fire door;
//   - RIGHT: THE BENCH: the big mouldy book lying open, flasks, a cucurbit, crucibles, a mortar, loose papers and the
//     set's CANDLE (param candle 0..1 = its length; below 0 it is hidden, for when he carries his own away); shelves of
//     jars and bottles above, another shelf on the back wall;
//   - FRONT: the plank door standing open inward on the BLUE NIGHT GARDEN (moonlight spills in on the floor) and the
//     little leaded window, dark blue.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch, glowCard, Batch } from "../../../kit/sets/okit";
import { ELAB_SET as S, ELX } from "../layout/elaboratory";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, wallQuad, tileUV, lathe, rockG, quad4, Part } from "./parts/common";
import { NC, NOINK, holedWall, revealG, wallPoly, brickTex, leadedTex, plankTex, pageTex, candleStick, fireFlicker, type Hole } from "./parts/newton";

const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" };
const lerp3 = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k) as [number, number, number];
/** THE FIGURES' LIGHT: the fire at their left-front, warm (deep red at fire 0, orange at 1), its flicker in the gain */
export const elabCast = (fire: number, t: number): Partial<CastLight> => {
  const k = Math.max(0, Math.min(1, fire)), fl = fireFlicker(t, 0.4);
  return { key: [-0.8, 0.3, 0.5], tint: lerp3([1.0, 0.56, 0.34], [1.0, 0.76, 0.5], k), tintK: 0.78, gain: (0.86 + 0.12 * k) * (1 + 0.6 * (fl - 1)), shade: [1.0, 0.88, 1.45], broad: 0.3, sheen: 0.2, contactLen: 0.2 } as unknown as Partial<CastLight>;
};
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.26, 0.2, 0.17]], [-10, [0.32, 0.25, 0.21]], [10, [0.36, 0.3, 0.28]], [90, [0.3, 0.28, 0.3]]],
  boxes: [{ az: -140, el: 8, rot: 0, w: 30, h: 20, soft: 14, col: [1.0, 0.62, 0.34] }],
};
/** the elaboratory's look */
export const ELAB_LOOK: PlaceLook = {
  bg: "#1a1412",
  ao: { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 1.6, color: "#24180f" },
  cast: { grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.92, 1.0], shadeK: 0.4, wrap: [30, 60], edge: 0.14, bodySat: 0.13, lift: 0.04, ...elabCast(1, 0), ...BAKED } as unknown as CastLight,
  fill: FILL,
  bloom: 0.45,
};
/** the per-frame dressing: fire 0..1 (deep red .. roaring), candle 0..1 (the set candle's length; < 0 hides it),
 *  embers 0..1 (0 default = off; 1 = the settled fire hours later: a low red ember bed, the standing flames gone) */
export const ELAB_PARAMS: Record<string, ParamValue> = { fire: 1, candle: 1, embers: 0 };

const W = S.walls, X0 = ELX + W.x0, X1 = ELX + W.x1, Z0 = W.z0, Z1 = W.z1, CB = S.ceilBack, CF = S.ceilFront;
const F = S.furnace, FD = F.door, BN = S.bench, DR = S.door, WN = S.win;
const ceilAt = (z: number) => CB + ((CF - CB) * (z - Z0)) / (Z1 - Z0);

// ---------------------------------------------------------------------------------------------------- paintings
/** the brick floor in basket weave: pairs of bricks turning by squares, sooty and ashy toward the furnace (left) */
const floorTex = () => paint(512, 512, (g, Wd, H) => {
  const r = rng(601), n = 4, s = Wd / n;
  g.fillStyle = "#4e3c34"; g.fillRect(0, 0, Wd, H);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const across = (i + j) % 2 === 0;
    for (let k = 0; k < 2; k++) {
      g.fillStyle = css(mix("#8e6450", r() < 0.5 ? "#6a4a3c" : "#a8826a", 0.25 + 0.5 * r()));
      if (across) g.fillRect(i * s + 3, j * s + k * (s / 2) + 3, s - 6, s / 2 - 6); else g.fillRect(i * s + k * (s / 2) + 3, j * s + 3, s / 2 - 6, s - 6);
    }
  }
  for (let i = 0; i < 30; i++) blotch(g, Wd * r(), H * r(), Wd * (0.04 + 0.08 * r()), r() < 0.6 ? "#3a2a24" : "#8a7a6a", 0.22);
}, true);
/** the mouldy old book's open pages: close old type, a woodcut figure, green-grey mould creeping in from the edges */
const bookTex = () => paint(512, 340, (g, Wd, H) => {
  const r = rng(602);
  g.fillStyle = "#e2d2a8"; g.fillRect(0, 0, Wd, H);
  const gr = g.createLinearGradient(Wd / 2 - 40, 0, Wd / 2 + 40, 0); gr.addColorStop(0, "rgba(90,70,40,0)"); gr.addColorStop(0.5, "rgba(90,70,40,0.45)"); gr.addColorStop(1, "rgba(90,70,40,0)");
  g.fillStyle = gr; g.fillRect(Wd / 2 - 40, 0, 80, H);
  g.fillStyle = "#4a3a30";
  for (const x0 of [30, Wd / 2 + 26]) for (let y = 30; y < H - 30; y += 11) { if (x0 < Wd / 2 && y > 120 && y < 220) continue; let x = x0; while (x < x0 + Wd / 2 - 60) { const w = 6 + 16 * r(); g.fillRect(x, y, w, 4); x += w + 4; } }
  g.strokeStyle = "#4a3a30"; g.lineWidth = 2; g.strokeRect(46, 124, 150, 92);
  g.beginPath(); g.arc(120, 170, 30, 0, 7); g.stroke(); g.beginPath(); g.moveTo(84, 200); g.lineTo(120, 136); g.lineTo(156, 200); g.closePath(); g.stroke();
  for (let i = 0; i < 26; i++) { const e = r() < 0.5, x = e ? (r() < 0.5 ? Wd * 0.06 * r() : Wd * (1 - 0.06 * r())) : Wd * r(), y = e ? H * r() : (r() < 0.5 ? H * 0.1 * r() : H * (1 - 0.1 * r())); blotch(g, x, y, 14 + 30 * r(), r() < 0.5 ? "#7a8a5a" : "#5a6a4a", 0.35); }
  for (let i = 0; i < 80; i++) { g.fillStyle = css("#4e5e3e", 0.5); g.beginPath(); g.arc(Wd * r(), H * r(), 1 + 2 * r(), 0, 7); g.fill(); }
});
/** the fire seen in the fire door: dark red depths, orange flame tongues licking up, a white-yellow bed of coals */
const fireTex = () => paint(128, 128, (g, Wd, H) => {
  g.fillStyle = "#3a0c04"; g.fillRect(0, 0, Wd, H);
  const r = rng(603);
  const glow = g.createRadialGradient(Wd / 2, H, 0, Wd / 2, H, H * 0.9); glow.addColorStop(0, "rgba(255,150,40,0.95)"); glow.addColorStop(0.6, "rgba(200,60,10,0.6)"); glow.addColorStop(1, "rgba(90,20,4,0)");
  g.fillStyle = glow; g.fillRect(0, 0, Wd, H);
  for (let i = 0; i < 7; i++) {   // flame tongues
    const x = Wd * (0.1 + 0.8 * r()), w = 10 + 10 * r(), h = H * (0.45 + 0.4 * r());
    g.fillStyle = css(r() < 0.5 ? "#ff8a20" : "#ffb030", 0.85); g.beginPath(); g.moveTo(x - w, H * 0.85); g.quadraticCurveTo(x - w * 0.6, H - h * 0.6, x + (r() - 0.5) * 8, H - h); g.quadraticCurveTo(x + w * 0.6, H - h * 0.55, x + w, H * 0.85); g.fill();
    g.fillStyle = "rgba(255,230,140,0.8)"; g.beginPath(); g.moveTo(x - w * 0.4, H * 0.85); g.quadraticCurveTo(x - w * 0.2, H - h * 0.35, x, H - h * 0.55); g.quadraticCurveTo(x + w * 0.25, H - h * 0.3, x + w * 0.4, H * 0.85); g.fill();
  }
  for (let i = 0; i < 18; i++) { g.fillStyle = css(r() < 0.5 ? "#fff0a0" : "#ffc048", 0.95); g.beginPath(); g.ellipse(Wd * r(), H * (0.86 + 0.12 * r()), 7 + 6 * r(), 4 + 3 * r(), 0, 0, 7); g.fill(); }
  g.fillStyle = "rgba(60,14,4,0.7)"; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(Wd * r(), H * (0.9 + 0.08 * r()), 5 + 4 * r(), 2.5, 0, 0, 7); g.fill(); }
});
/** THE SETTLED FIRE (param embers): the fire box gone dark red, a low bed of glowing coals along its floor, a few short
 *  licks of flame no higher than a hand, no yellow (the painted fire above, hours later) */
const emberTex = () => paint(128, 128, (g, Wd, H) => {
  g.fillStyle = "#240603"; g.fillRect(0, 0, Wd, H);
  const r = rng(616);
  const glow = g.createRadialGradient(Wd / 2, H * 1.05, 0, Wd / 2, H * 1.05, H * 0.62); glow.addColorStop(0, "rgba(230,80,20,0.95)"); glow.addColorStop(0.55, "rgba(150,30,8,0.55)"); glow.addColorStop(1, "rgba(60,10,4,0)");
  g.fillStyle = glow; g.fillRect(0, 0, Wd, H);
  for (let i = 0; i < 6; i++) {   // short licks of flame
    const x = Wd * (0.12 + 0.76 * r()), w = 5 + 5 * r(), h = H * (0.1 + 0.1 * r());
    g.fillStyle = css(r() < 0.5 ? "#e0501a" : "#f06a22", 0.7); g.beginPath(); g.moveTo(x - w, H * 0.86); g.quadraticCurveTo(x - w * 0.5, H * 0.86 - h * 0.6, x + (r() - 0.5) * 4, H * 0.86 - h); g.quadraticCurveTo(x + w * 0.5, H * 0.86 - h * 0.55, x + w, H * 0.86); g.fill();
  }
  for (let i = 0; i < 26; i++) { g.fillStyle = css(r() < 0.35 ? "#ff8a30" : r() < 0.7 ? "#e85a1c" : "#b83410", 0.95); g.beginPath(); g.ellipse(Wd * r(), H * (0.84 + 0.14 * r()), 6 + 5 * r(), 3 + 3 * r(), 0, 0, 7); g.fill(); }
  g.fillStyle = "rgba(30,6,3,0.8)"; for (let i = 0; i < 16; i++) { g.beginPath(); g.ellipse(Wd * r(), H * (0.86 + 0.12 * r()), 4 + 4 * r(), 2, 0, 0, 7); g.fill(); }
});
/** THE NIGHT GARDEN through the door: blue moonlit gravel, a box cone, the garden wall, the dark range with a lit window */
const nightTex = () => paint(256, 256, (g, Wd, H) => {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.5); sky.addColorStop(0, "#26346a"); sky.addColorStop(1, "#4a5c96");
  g.fillStyle = sky; g.fillRect(0, 0, Wd, H * 0.5);
  const r = rng(604); for (let i = 0; i < 40; i++) { g.fillStyle = css("#e8eeff", 0.5 + 0.5 * r()); g.fillRect(Wd * r(), H * 0.3 * r(), 1.5, 1.5); }
  g.fillStyle = "#2e3a5e"; for (const [x, rr] of [[0.3, 0.16], [0.52, 0.2], [0.72, 0.14]]) { g.beginPath(); g.arc(Wd * x, H * 0.36, Wd * rr, 0, 7); g.fill(); }   // trees beyond the wall
  g.fillStyle = "#5a4a6a"; g.fillRect(0, H * 0.42, Wd, H * 0.12);                                                  // the garden wall
  g.fillStyle = "#7a7090"; g.fillRect(0, H * 0.41, Wd, H * 0.02);                                                  // its coping, moonlit
  g.fillStyle = "#6a77a8"; g.fillRect(0, H * 0.54, Wd, H * 0.46);                                                  // moonlit gravel
  g.strokeStyle = "rgba(90,100,150,0.6)"; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(Wd * (0.1 * i), H); g.lineTo(Wd * (0.45 + 0.012 * i), H * 0.56); g.stroke(); }
  for (const x of [0.36, 0.62]) { g.fillStyle = "#2e4a3e"; g.beginPath(); g.moveTo(Wd * (x - 0.05), H * 0.64); g.quadraticCurveTo(Wd * (x - 0.02), H * 0.4, Wd * x, H * 0.4); g.quadraticCurveTo(Wd * (x + 0.02), H * 0.4, Wd * (x + 0.05), H * 0.64); g.fill(); g.fillStyle = "rgba(150,170,230,0.35)"; g.fillRect(Wd * (x - 0.012), H * 0.44, Wd * 0.02, H * 0.18); }   // clipped box cones, moon on their sides
  g.fillStyle = "#2a3e36"; g.fillRect(Wd * 0.2, H * 0.6, Wd * 0.6, H * 0.06);                                     // the box hedge
  g.fillStyle = "rgba(230,236,255,0.9)"; g.beginPath(); g.arc(Wd * 0.78, H * 0.12, 7, 0, 7); g.fill();             // the moon
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildElaboratory(K: Kit) {
  const group = new THREE.Group(); group.name = "elaboratory";
  const Mk = maker(K, group), BT = new Batch();
  const mBrick = Mk.tex(brickTex({ seed: 605, base: "#9a6a52", lo: "#7a5242", hi: "#ae8064", mortar: "#b8a890", soot: 0.35 }), 0.9), mBrickSoot = Mk.tex(brickTex({ seed: 606, base: "#8a5e4a", lo: "#664436", hi: "#a07460", mortar: "#a49480", soot: 0.7, burnt: 0.3 }), 0.92);
  const mOak = Mk.flat("#6a4a32", 0.75), mOakDark = Mk.flat("#3e2c22", 0.85), mOakHi = Mk.flat("#86603e", 0.75), mIron = Mk.flat("#2e2c30", 0.55), mIronHi = Mk.flat("#4a464c", 0.5);
  const mClay = Mk.flat("#b07a52", 0.8), mClayDark = Mk.flat("#5a3a2a", 0.85), mCoal = Mk.flat("#2a2628", 0.7), mCoalHi = Mk.flat("#3a3436", 0.6), mStone = Mk.flat("#9a8e80", 0.85);
  const mGlassG = new THREE.MeshStandardMaterial({ color: "#a8c8b0", roughness: 0.15, metalness: 0, transparent: true, opacity: 0.62 });
  const mGlassA = new THREE.MeshStandardMaterial({ color: "#c8a060", roughness: 0.15, metalness: 0, transparent: true, opacity: 0.7 });
  const mGlassB = new THREE.MeshStandardMaterial({ color: "#7a9a8a", roughness: 0.15, metalness: 0, transparent: true, opacity: 0.75 });
  const glowMats: { m: THREE.MeshBasicMaterial; k: number; tex: boolean }[] = [];
  const glowMat = (map: THREE.Texture | null, k = 1, o: Partial<THREE.MeshBasicMaterialParameters> = {}) => { const m = new THREE.MeshBasicMaterial({ map, color: "#ffffff", fog: false, ...o }); glowMats.push({ m, k, tex: !!map }); return m; };
  let mEmbers: THREE.MeshBasicMaterial | null = null, emberMesh: THREE.Mesh | null = null, flamesMat: THREE.MeshBasicMaterial | null = null;

  // =================================================================================================== floor, walls, roof
  Mk.mesh("elab.floor", levelQuad(X0, X1, Z0, Z1, 0, (x, z) => [(x - X0) / 0.92, -z / 0.92]), Mk.tex(floorTex(), 0.92), { cast: false });
  const aB: [number, number] = [X0, Z0], bB: [number, number] = [X1, Z0];         // back (faces +z)
  const aF: [number, number] = [X1, Z1], bF: [number, number] = [X0, Z1];         // front (faces -z), u = X1 - x
  const aL: [number, number] = [X0, Z1], bL: [number, number] = [X0, Z0];         // left (faces +x), u = Z1 - z
  const aR: [number, number] = [X1, Z0], bR: [number, number] = [X1, Z1];         // right (faces -x), u = z - Z0
  const dHole: Hole = { u0: W.x1 - (DR.x + DR.w / 2), u1: W.x1 - (DR.x - DR.w / 2), y0: 0, y1: DR.h };
  const wHole: Hole = { u0: W.x1 - (WN.x + WN.w / 2), u1: W.x1 - (WN.x - WN.w / 2), y0: WN.y0, y1: WN.y1 };
  const len = Z1 - Z0;
  Mk.mesh("elab.wall.back", holedWall(aB, bB, 0, CB + 0.05, [], 0.96, 0.68), mBrick, { cast: true });
  Mk.mesh("elab.wall.front", holedWall(aF, bF, 0, CF + 0.05, [dHole, wHole], 0.96, 0.68), mBrick, { cast: true });
  Mk.mesh("elab.wall.left", wallPoly(aL, bL, [[0, 0], [len, 0], [len, CB + 0.05], [0, CF + 0.05]], 0, 0.96, 0.68), mBrickSoot, { cast: true });
  Mk.mesh("elab.wall.right", wallPoly(aR, bR, [[0, 0], [len, 0], [len, CF + 0.05], [0, CB + 0.05]], 0, 0.96, 0.68), mBrick, { cast: true });
  for (const [i, nm] of ["jambL", "jambR", "head"].entries()) Mk.mesh(`elab.door.${nm}`, revealG(aF, bF, dHole, DR.wall, 1, [i]), mBrick, { cast: true });
  Mk.mesh("elab.window.reveal", revealG(aF, bF, wHole, DR.wall, 1), mBrick, { cast: true });
  Mk.mesh("elab.door.lintel", boxG(ELX + DR.x - DR.w / 2 - 0.12, ELX + DR.x + DR.w / 2 + 0.12, DR.h, DR.h + 0.16, Z1 - 0.04, Z1), mOakDark);
  // the ceiling boards and the rafters (sloping down to the front), a beam across
  Mk.mesh("elab.ceiling", quad4(new THREE.Vector3(X0, CB, Z0), new THREE.Vector3(X1, CB, Z0), new THREE.Vector3(X1, CF, Z1), new THREE.Vector3(X0, CF, Z1), 4.4 / 0.9, 3.7 / 0.9), Mk.tex(plankTex("#4a382c", 607), 0.9), { cast: true });
  const ang = Math.atan2(CB - CF, len), rl = Math.hypot(len, CB - CF);
  for (let x = X0 + 0.3; x < X1 - 0.1; x += 0.58) BT.add(mOakDark, new THREE.BoxGeometry(0.09, 0.14, rl).rotateX(ang).translate(x, (CB + CF) / 2 - 0.08, (Z0 + Z1) / 2));
  BT.add(mOakDark, boxG(X0, X1, ceilAt(-0.2) - 0.3, ceilAt(-0.2) - 0.08, -0.32, -0.08));

  // =================================================================================================== THE FURNACE
  const fx = ELX + F.x1, fz0 = F.z0, fz1 = F.z1, fh = F.h, fzc = FD.z;
  {
    const aFu: [number, number] = [fx, fz1], bFu: [number, number] = [fx, fz0];      // its face (faces +x), u = fz1 - z
    const door: Hole = { u0: fz1 - (fzc + FD.w / 2), u1: fz1 - (fzc - FD.w / 2), y0: FD.y0, y1: FD.y1 };
    const ash: Hole = { u0: fz1 - (fzc + F.ash.w / 2), u1: fz1 - (fzc - F.ash.w / 2), y0: F.ash.y0, y1: F.ash.y1 };
    Mk.mesh("elab.furnace.face", holedWall(aFu, bFu, 0, fh, [door, ash], 0.96, 0.68), mBrickSoot, { cast: true });
    Mk.mesh("elab.furnace.side", wallQuad([X0, fz1], [fx, fz1], 0, fh, { tileU: 0.96, vTile: 0.68 }), mBrickSoot, { cast: true });
    Mk.mesh("elab.furnace.mass", tileUV(boxG(X0, fx - 0.36, 0, fh, fz0, fz1), 0.96, 0.68), mBrickSoot, { cast: true });
    Mk.mesh("elab.furnace.top", boxG(X0, fx + 0.04, fh, fh + 0.07, fz0, fz1 + 0.04), mIronHi, { cast: true });
    // the fire box behind the door: hot firebrick walls (unlit glow), the fire, the coals; the ash pit's dull glow
    const mHot = glowMat(null, 0.4);
    Mk.mesh("elab.furnace.firebox", revealG(aFu, bFu, door, 0.34, 1), mHot, { cast: false, noink: true });
    const mFire = glowMat(fireTex(), 1);
    Mk.mesh("elab.furnace.fire", new THREE.PlaneGeometry(FD.w + 0.02, FD.y1 - FD.y0 + 0.02).rotateY(Math.PI / 2).translate(fx - 0.33, (FD.y0 + FD.y1) / 2, fzc), mFire, { cast: false, noink: true });
    const mCoals = glowMat(null, 0.95);
    // the flames standing in the middle of the fire box (additive: the dark of the painting adds nothing)
    const mFlames = glowMat(fireTex(), 0.9, { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    Mk.mesh("elab.furnace.flames", new THREE.PlaneGeometry(FD.w - 0.04, FD.y1 - FD.y0 - 0.02).rotateY(Math.PI / 2).translate(fx - 0.15, (FD.y0 + FD.y1) / 2, fzc), mFlames, { cast: false, noink: true });
    // param embers (default 0 = off, the look above unchanged): the SETTLED fire, hours later: a low bed of red embers
    // painted over the fire, the standing flames gone (WP5-F, director round 1: the time cut must read)
    mEmbers = glowMat(emberTex(), 1.3, { transparent: true, opacity: 0, depthWrite: false });
    emberMesh = Mk.mesh("elab.furnace.embers", new THREE.PlaneGeometry(FD.w + 0.02, FD.y1 - FD.y0 + 0.02).rotateY(Math.PI / 2).translate(fx - 0.31, (FD.y0 + FD.y1) / 2, fzc), mEmbers, { cast: false, noink: true });
    emberMesh.visible = false;
    flamesMat = mFlames;
    for (let i = 0; i < 9; i++) { const r = rng(610 + i); const c = new THREE.Mesh(rockG(620 + i, 0.07 + 0.04 * r(), 0.05, 0.07 + 0.04 * r(), 1, 0).translate(fx - 0.06 - 0.24 * r(), FD.y0 + 0.02, fzc + (r() - 0.5) * (FD.w - 0.08)), mCoals); c.layers.set(NOINK); c.name = "elab.furnace.coals"; group.add(c); }
    const mAsh = glowMat(null, 0.3);
    Mk.mesh("elab.furnace.ash", new THREE.PlaneGeometry(F.ash.w, F.ash.y1 - F.ash.y0).rotateY(Math.PI / 2).translate(fx - 0.2, (F.ash.y0 + F.ash.y1) / 2, fzc), mAsh, { cast: false, noink: true });
    Mk.mesh("elab.furnace.ashReveal", revealG(aFu, bFu, ash, 0.2, 1), mClayDark, { cast: false });
    // the iron fire door, swung open toward the room's front on its hinge
    const plate = new THREE.Group(); plate.name = "elab.furnace.door";
    const pm = new THREE.Mesh(boxG(0, 0.025, FD.y0 - 0.04, FD.y1 + 0.04, 0, FD.w + 0.06), Mk.flat("#1c1a1e", 0.95)); pm.castShadow = true; plate.add(pm);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 14).rotateY(Math.PI / 2).translate(0.035, (FD.y0 + FD.y1) / 2, FD.w - 0.02), mIronHi); plate.add(ring);
    plate.position.set(fx + 0.01, 0, fzc - FD.w / 2 - 0.03); plate.rotation.y = 1.95; group.add(plate);
    for (const y of [FD.y0 + 0.04, FD.y1 - 0.04]) BT.add(mIron, boxG(fx - 0.005, fx + 0.03, y - 0.015, y + 0.015, fzc - FD.w / 2 - 0.06, fzc - FD.w / 2));
    // the iron frame round the door, a lintel bar
    BT.add(mIron, boxG(fx - 0.005, fx + 0.02, FD.y1, FD.y1 + 0.05, fzc - FD.w / 2 - 0.05, fzc + FD.w / 2 + 0.05));
    BT.add(mIron, boxG(fx - 0.005, fx + 0.02, FD.y0 - 0.04, FD.y0, fzc - FD.w / 2 - 0.05, fzc + FD.w / 2 + 0.05));
    // the hood: a lower brick box over the back half of the top, the flue up into the ceiling (a ledge between)
    const hz0 = (fz0 + fz1) / 2 - F.hood.w / 2 - 0.1, hz1 = (fz0 + fz1) / 2 + F.hood.w / 2 + 0.1;
    BT.add(mBrickSoot, tileUV(boxG(X0, X0 + 0.5, fh + 0.07, fh + 0.62, Math.max(fz0, hz0 - 0.1), hz1 + 0.05), 0.96, 0.68));
    BT.add(mBrickSoot, tileUV(boxG(X0, X0 + F.hood.d * 0.62, fh + 0.62, CB + 0.1, hz0 + 0.12, hz1 - 0.15), 0.96, 0.68));
    BT.add(mOakDark, boxG(X0 + 0.48, X0 + 0.56, fh + 0.5, fh + 0.66, Math.max(fz0, hz0 - 0.1), hz1 + 0.05));
    // the sand bath on the front part of the top, a glass retort in it, a crucible
    BT.add(mIron, boxG(fx - 0.42, fx - 0.04, fh + 0.07, fh + 0.15, fzc - 0.25, fzc + 0.25));
    BT.add(Mk.flat("#b8a074", 0.95), boxG(fx - 0.4, fx - 0.06, fh + 0.15, fh + 0.152, fzc - 0.23, fzc + 0.23));
    const P = new Part(K);
    P.add(mGlassA, lathe([[0, 0], [0.06, 0.01], [0.1, 0.06], [0.11, 0.12], [0.08, 0.2], [0.03, 0.24], [0, 0.245]], 18).translate(fx - 0.22, fh + 0.12, fzc + 0.05), 0.004);
    P.add(mGlassA, new THREE.CylinderGeometry(0.018, 0.012, 0.36, 10).rotateZ(-1.1).translate(fx - 0.22 + 0.15, fh + 0.12 + 0.3, fzc + 0.05), 0.003);
    P.add(mClay, lathe([[0, 0], [0.04, 0.005], [0.055, 0.08], [0.06, 0.1], [0.05, 0.1], [0.042, 0.02], [0, 0.02]], 14).translate(fx - 0.2, fh + 0.152, fzc - 0.16), 0.004);
    // crucibles and a jar on the hood's ledge
    for (const [i, z] of [-1.55, -1.28, -1.02, -0.66].entries()) P.add(i === 3 ? mGlassB : mClay, (i === 3 ? lathe([[0, 0], [0.05, 0], [0.06, 0.06], [0.05, 0.14], [0.03, 0.17], [0.032, 0.2], [0, 0.2]], 14) : lathe([[0, 0], [0.035, 0.005], [0.05, 0.075], [0.055, 0.09], [0.045, 0.09], [0.038, 0.02], [0, 0.02]], 14)).translate(X0 + 0.25, fh + 0.62, z), 0.004);
    P.into(group, "elab.furnace.ware", { cast: true });
    // tongs and a rake hanging on the furnace's side
    BT.add(mIronHi, new THREE.CylinderGeometry(0.008, 0.008, 0.62, 6).rotateZ(0.08).translate(fx - 0.25, 0.75, fz1 + 0.02));
    BT.add(mIronHi, new THREE.CylinderGeometry(0.008, 0.008, 0.62, 6).rotateZ(-0.08).translate(fx - 0.2, 0.75, fz1 + 0.02));
    BT.add(mIronHi, boxG(fx - 0.62, fx - 0.58, 0.35, 1.08, fz1 + 0.01, fz1 + 0.03));
    BT.add(mIronHi, boxG(fx - 0.7, fx - 0.5, 0.33, 0.37, fz1 + 0.01, fz1 + 0.06));
  }
  const fireGlow = glowCard(0.5, "#ff8a2a", 0); fireGlow.position.set(fx + 0.06, (FD.y0 + FD.y1) / 2, fzc); group.add(fireGlow);

  // =================================================================================================== the athanor
  {
    const A = S.athanor, ax = ELX + A.x, P = new Part(K);
    Mk.mesh("elab.athanor", tileUV(new THREE.CylinderGeometry(A.r, A.r + 0.04, A.h, 16).translate(ax, A.h / 2, A.z), 0.96, 0.68), mBrickSoot, { cast: true });
    Mk.mesh("elab.athanor.dome", new THREE.SphereGeometry(A.r, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 0.7, 1).translate(ax, A.h, A.z), mClayDark, { cast: true });
    const mPort = glowMat(null, 0.45);
    Mk.mesh("elab.athanor.port", new THREE.CircleGeometry(0.07, 14).translate(ax, 0.32, A.z + A.r + 0.025), mPort, { cast: false, noink: true });
    // the alembic on top: a cucurbit, the head and its beak
    const top = A.h + A.r * 0.7 - 0.02;
    P.add(mGlassG, lathe([[0, 0], [0.08, 0.01], [0.12, 0.08], [0.11, 0.18], [0.06, 0.24], [0.06, 0.28], [0, 0.28]], 18).translate(ax, top, A.z), 0.004);
    P.add(mGlassG, lathe([[0, 0], [0.07, 0], [0.09, 0.05], [0.07, 0.12], [0.02, 0.16], [0, 0.17]], 16).translate(ax, top + 0.27, A.z), 0.004);
    P.add(mGlassG, new THREE.CylinderGeometry(0.014, 0.01, 0.4, 8).rotateX(-1.25).translate(ax, top + 0.34, A.z + 0.2), 0.003);
    P.into(group, "elab.athanor.glass", { cast: true });
  }

  // =================================================================================================== the bellows, the charcoal heap
  {
    const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.22, 0.02, 0.24, 0.3); sh.quadraticCurveTo(0.2, 0.52, 0, 0.56); sh.quadraticCurveTo(-0.2, 0.52, -0.24, 0.3); sh.quadraticCurveTo(-0.22, 0.02, 0, 0);
    const z = 0.38, y = 0.82, x = X0 + 0.02;
    const board = new THREE.ExtrudeGeometry(sh, { depth: 0.025, bevelEnabled: false }).rotateY(Math.PI / 2);
    BT.add(mOak, board.clone().translate(x, y, z)); BT.add(mOak, board.clone().translate(x + 0.12, y, z));
    BT.add(Mk.flat("#5a3a26", 0.9), new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false }).scale(0.92, 0.9, 1).rotateY(Math.PI / 2).translate(x + 0.02, y + 0.03, z));
    BT.add(Mk.flat("#b08a3a", 0.4), new THREE.CylinderGeometry(0.015, 0.03, 0.22, 10).translate(x + 0.07, y - 0.1, z));
    BT.add(mOakDark, new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8).rotateZ(Math.PI / 2).translate(x + 0.06, y + 0.62, z));
    // the charcoal heap: a dark mound under a skin of lumps, a few strays toward the fire door
    const C = S.charcoal, cx = ELX + C.x, cz = C.z, rr = rng(611);
    Mk.mesh("elab.charcoal", lathe([[0, C.h], [C.r * 0.45, C.h * 0.85], [C.r * 0.8, C.h * 0.45], [C.r, 0.04], [C.r + 0.05, 0], [0, 0]], 18).translate(cx, 0, cz), mCoal, { cast: true });
    for (let i = 0; i < 70; i++) {
      const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * C.r, hy = C.h * (1 - (d / C.r) ** 1.6);
      BT.add(i % 3 ? mCoal : mCoalHi, rockG(630 + i, 0.05 + 0.05 * rr(), 0.04 + 0.03 * rr(), 0.05 + 0.04 * rr(), 1, 0).translate(cx + Math.cos(a) * d, hy, cz + Math.sin(a) * d));
    }
    for (let i = 0; i < 9; i++) { const a = -0.2 + 2.7 * rr(), d = C.r + 0.04 + 0.06 * rr(); BT.add(mCoal, rockG(710 + i, 0.05, 0.035, 0.05, 1, 0).translate(cx + Math.cos(a) * d, 0.015, cz + Math.sin(a) * d)); }   // strays round its foot (not on the walking floor)
  }

  // =================================================================================================== the bench, its ware, the shelves
  {
    const bx0 = ELX + BN.x0, bx1 = ELX + BN.x1, P = new Part(K);
    P.add(mOakHi, boxG(bx0, bx1, BN.top - 0.07, BN.top, BN.z0, BN.z1), 0.006);
    for (const x of [bx0 + 0.06, bx1 - 0.06]) for (const z of [BN.z0 + 0.08, BN.z1 - 0.08]) P.add(mOak, boxG(x - 0.04, x + 0.04, 0, BN.top - 0.07, z - 0.04, z + 0.04), 0.005);
    P.add(mOak, boxG(bx0 + 0.04, bx1 - 0.04, 0.12, 0.18, BN.z0 + 0.06, BN.z1 - 0.06), 0.005);
    // THE BOOK: boards, two page blocks bowed up from the gutter, the painted spread
    const B = S.book, bxm = ELX + B.x, bzm = B.z, by = BN.top;
    P.add(Mk.flat("#5a3a2a", 0.85), boxG(bxm - B.d / 2 - 0.01, bxm + B.d / 2 + 0.01, by, by + 0.015, bzm - B.w / 2 - 0.01, bzm + B.w / 2 + 0.01), 0.004);
    P.add(Mk.flat("#d8c8a0", 0.9), boxG(bxm - B.d / 2, bxm + B.d / 2, by + 0.015, by + 0.06, bzm - B.w / 2, bzm + B.w / 2), 0.004);
    P.into(group, "elab.bench", { cast: true });
    const spread = new THREE.PlaneGeometry(B.w, B.d, 16, 1), sp = spread.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < sp.count; i++) { const u = sp.getX(i) / (B.w / 2); sp.setZ(i, 0.018 * (1 - Math.abs(u)) ** 0.5 * Math.min(1, Math.abs(u) * 6)); }
    spread.computeVertexNormals();
    Mk.mesh("elab.book.pages", spread.rotateX(-Math.PI / 2).rotateY(Math.PI / 2).translate(bxm, by + 0.061, bzm), Mk.tex(bookTex(), 0.9), { cast: false });
    // loose papers by the book
    for (let i = 0; i < 3; i++) Mk.mesh("elab.papers", new THREE.PlaneGeometry(0.2, 0.27).rotateX(-Math.PI / 2).rotateY(0.3 + i * 0.5).translate(bxm - 0.12 + 0.05 * i, by + 0.002 + 0.0008 * i, bzm + 0.42 + 0.06 * i), Mk.tex(pageTex(640 + i, { figure: i === 1 }), 0.9), { cast: false });
    // flasks, a cucurbit, crucibles, a mortar on the bench
    const W2 = new Part(K), flask = lathe([[0, 0], [0.05, 0.005], [0.075, 0.05], [0.07, 0.1], [0.03, 0.14], [0.018, 0.17], [0.018, 0.28], [0.024, 0.29], [0, 0.29]], 16);
    W2.add(mGlassG, flask.clone().translate(bxm + 0.12, by, bzm - 0.5), 0.004);
    W2.add(mGlassA, flask.clone().scale(0.8, 0.8, 0.8).translate(bxm - 0.05, by, bzm - 0.62), 0.004);
    W2.add(mGlassB, lathe([[0, 0], [0.08, 0.01], [0.1, 0.1], [0.09, 0.16], [0.06, 0.2], [0.065, 0.24], [0, 0.24]], 16).translate(bxm + 0.15, by, bzm - 0.85), 0.004);
    for (const [i, z] of [0.1, 0.18, 0.62].entries()) W2.add(mClay, lathe([[0, 0], [0.035, 0.005], [0.05, 0.075], [0.055, 0.09], [0.045, 0.09], [0.038, 0.02], [0, 0.02]], 14).translate(bxm + 0.2 - 0.07 * i, by, bzm + z + 0.5), 0.004);
    W2.add(mStone, lathe([[0, 0], [0.08, 0], [0.1, 0.05], [0.1, 0.1], [0.08, 0.1], [0.07, 0.04], [0, 0.03]], 16).translate(bxm + 0.18, by, bzm + 1.05), 0.004);
    W2.add(mStone, new THREE.CylinderGeometry(0.015, 0.025, 0.2, 8).rotateZ(0.5).translate(bxm + 0.2, by + 0.14, bzm + 1.05), 0.003);
    // the shelves over the bench (right wall) and on the back wall, with jars, bottles and crucibles
    const shelf = (x0: number, x1: number, z0: number, z1: number, y: number) => W2.add(mOak, boxG(x0, x1, y - 0.03, y, z0, z1), 0.004);
    const jar = (m: THREE.Material, x: number, y: number, z: number, s: number, kind: number) => W2.add(m, (kind === 0 ? lathe([[0, 0], [0.05, 0], [0.06, 0.06], [0.05, 0.14], [0.03, 0.17], [0.032, 0.2], [0, 0.2]], 12) : kind === 1 ? lathe([[0, 0], [0.04, 0], [0.045, 0.1], [0.02, 0.15], [0.014, 0.22], [0, 0.22]], 12) : lathe([[0, 0], [0.035, 0.005], [0.05, 0.075], [0.055, 0.09], [0.045, 0.09], [0.038, 0.02], [0, 0.02]], 12)).scale(s, s, s).translate(x, y, z), 0.003);
    const rr = rng(612), jm = [mGlassG, mGlassA, mGlassB, mClay, mClayDark];
    for (const y of S.shelves.right) {
      shelf(X1 - 0.27, X1, BN.z0, BN.z1 - 0.1, y);
      for (let z = BN.z0 + 0.1; z < BN.z1 - 0.2; z += 0.14 + 0.1 * rr()) jar(jm[Math.floor(rr() * 5)], X1 - 0.13, y, z, 0.8 + 0.5 * rr(), Math.floor(rr() * 3));
      for (const z of [BN.z0 + 0.3, BN.z1 - 0.4]) W2.add(mIron, boxG(X1 - 0.24, X1 - 0.02, y - 0.12, y - 0.03, z - 0.015, z + 0.015), 0.002);   // brackets
    }
    const BS = S.shelves.back;
    shelf(ELX + BS.x0, ELX + BS.x1, Z0, Z0 + 0.26, BS.y);
    for (let x = ELX + BS.x0 + 0.1; x < ELX + BS.x1 - 0.08; x += 0.13 + 0.1 * rr()) jar(jm[Math.floor(rr() * 5)], x, BS.y, Z0 + 0.13, 0.8 + 0.5 * rr(), Math.floor(rr() * 3));
    // under the bench: a crate and a big earthen jar
    W2.add(mOakDark, boxG(bx0 + 0.08, bx1 - 0.05, 0, 0.32, BN.z0 + 0.25, BN.z0 + 0.75), 0.004);
    W2.add(mClayDark, lathe([[0, 0], [0.12, 0], [0.18, 0.12], [0.17, 0.3], [0.1, 0.4], [0.11, 0.44], [0, 0.44]], 16).translate(bx0 + 0.35, 0, BN.z1 - 0.35), 0.004);
    W2.into(group, "elab.ware", { cast: true });
  }
  // the set candle on the bench (param candle), its halo
  const cand = candleStick(K, { wax: Mk.flat(NC.candle, 0.6), pewter: Mk.flat("#8a8a90", 0.4) });
  cand.group.position.set(ELX + S.candle.x, BN.top, S.candle.z); cand.group.name = "elab.candle"; group.add(cand.group);
  const candHalo = glowCard(0.14, "#ffc870", 0.5); group.add(candHalo);

  // =================================================================================================== the door, the window, the night outside
  {
    const leaf = new THREE.Group(); leaf.name = "elab.door.leaf";
    const lm = new THREE.Mesh(boxG(0, DR.w - 0.02, 0.01, DR.h - 0.01, -0.025, 0.025), [mOakDark, mOakDark, mOakDark, mOakDark, Mk.tex(plankTex("#6e5038", 613), 0.85), Mk.tex(plankTex("#5e4430", 614), 0.85)]);
    lm.castShadow = true; leaf.add(lm);
    for (const y of [0.3, 1.6]) leaf.add(new THREE.Mesh(boxG(0, 0.5, y - 0.025, y + 0.025, -0.035, -0.025), mIron));
    leaf.position.set(ELX + DR.x - DR.w / 2 + 0.01, 0, Z1 - 0.03); leaf.rotation.y = DR.open; group.add(leaf);
    const mNight = new THREE.MeshBasicMaterial({ map: nightTex(), fog: false });
    Mk.mesh("elab.night", new THREE.PlaneGeometry(3.2, 3.2).rotateY(Math.PI).translate(ELX + DR.x, 1.3, Z1 + DR.wall + 1.4), mNight, { cast: false, noink: true });
    Mk.mesh("elab.night.ground", levelQuad(ELX + DR.x - 1.6, ELX + DR.x + 1.6, Z1, Z1 + DR.wall + 1.4, 0, (x, z) => [x, z]), Mk.basic("#56628e"), { cast: false, noink: true });
    // the moonlight spilling in over the threshold: a faint blue-grey cooling of the bricks, strongest AT the threshold
    // (the canvas' top row = v 1 = the threshold) and fading into the room, every edge feathered (no shape to point at;
    // director round 1: the old hard-edged 0.28 lilac wedge read as a colour block in F's corner shot). WP5-F.
    const spill = paint(64, 128, (g, Wd, H) => {
      const img = g.createImageData(Wd, H), D = img.data, ss = (a: number, b: number, x: number) => { const u = Math.max(0, Math.min(1, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
      for (let py = 0; py < H; py++) for (let px = 0; px < Wd; px++) {
        const d = py / (H - 1), u = (px + 0.5) / Wd;                      // d: 0 at the threshold .. 1 at 1.3 m inside
        const uc = 0.42 + 0.22 * d, hw = 0.3 + 0.12 * d;                   // the beam drifts right and widens as it goes in
        const side = ss(hw, hw * 0.35, Math.abs(u - uc));                  // soft sides
        const a = side * (0.1 * Math.pow(1 - d, 1.7) + 0.06 * Math.exp(-d / 0.07));
        const i = 4 * (py * Wd + px); D[i] = 150; D[i + 1] = 165; D[i + 2] = 198; D[i + 3] = Math.round(255 * Math.min(1, a));
      }
      g.putImageData(img, 0, 0);
    });
    Mk.mesh("elab.moonspill", levelQuad(ELX + DR.x - DR.w / 2 + 0.06, ELX + DR.x + DR.w / 2 + 0.3, Z1 - 1.3, Z1, 0.0008, (x, z) => [(x - (ELX + DR.x - DR.w / 2)) / (DR.w + 0.3), 1 - (Z1 - z) / 1.3]), Mk.basic("#ffffff", { map: spill, additive: true }), { cast: false, noink: true });
    // the little window: dark blue leaded glass set in the wall
    const mWin = new THREE.MeshBasicMaterial({ map: leadedTex({ w: WN.w, h: WN.y1 - WN.y0, q: 0.1, glass: "#4a5a90", hi: "#5e70a8", lo: "#3a4878", lead: "#20222c" }), fog: false });
    Mk.mesh("elab.window.glass", new THREE.PlaneGeometry(WN.w, WN.y1 - WN.y0).rotateY(Math.PI).translate(ELX + WN.x, (WN.y0 + WN.y1) / 2, Z1 + DR.wall * 0.6), mWin, { cast: false, noink: true });
    Mk.mesh("elab.window.sill", boxG(ELX + WN.x - WN.w / 2 - 0.05, ELX + WN.x + WN.w / 2 + 0.05, WN.y0 - 0.04, WN.y0, Z1 - 0.06, Z1 + DR.wall * 0.6), mOakDark);
  }

  // =================================================================================================== sparks rising from the fire door
  const NS = 16, sparkPos = new Float32Array(NS * 3), sparkGeo = new THREE.BufferGeometry(); sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({ size: 0.022, color: "#ffc060", transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false });
  const sparks = new THREE.Points(sparkGeo, sparkMat); sparks.layers.set(NOINK); sparks.frustumCulled = false; sparks.name = "elab.sparks"; group.add(sparks);
  const sr = rng(615), sparkSeed = Array.from({ length: NS }, () => [sr(), sr(), sr(), 0.5 + sr()]);

  BT.flush(group, "elab.parts");

  // =================================================================================================== the light
  const Lr = lightRig(group, { dir: [-0.78, 0.14, -0.6], k: 4.0, col: "#ffb47c", at: [ELX + 0.2, 0, 0], half: 4.2, hemi: ["#7a7c98", "#3a302c", 0.75], point: { col: "#ffa860", k: 6, at: [fx + 0.7, 0.95, fzc + 0.5], dist: 6.5 } });
  const red = new THREE.Color("#e06a44"), roar = new THREE.Color("#ffbc84"), tmp = new THREE.Color();
  let fire = 1, candle = 1, embers = 0;
  const animate = (t: number) => {
    const fl = fireFlicker(t, 0.4), k = fire;
    tmp.copy(red).lerp(roar, k);
    Lr.key.color.copy(tmp); Lr.key.intensity = (2.0 + 2.4 * k) * fl;
    Lr.point.color.copy(tmp); Lr.point.intensity = (1.8 + 2.6 * k) * (1 + 1.4 * (fl - 1));
    for (const { m, k: w, tex } of glowMats) {
      const g = (0.55 + 0.45 * k) * (1 + 1.5 * (fl - 1)) * w;
      if (tex) m.color.setRGB(Math.min(1, g), Math.min(1, g * (0.45 + 0.55 * k)), Math.min(1, g * (0.3 + 0.7 * k)));      // the painted fire keeps its own colours (deep red at 0)
      else m.color.setRGB(Math.min(1, g), Math.min(1, (0.05 + 0.3 * k) * g), Math.min(1, (0.01 + 0.06 * k) * g));
    }
    // the settled fire (param embers, default 0 = nothing changes): the ember bed over the painting, the flames sunk
    if (emberMesh && mEmbers && flamesMat) {
      emberMesh.visible = embers > 0.001; mEmbers.opacity = embers;
      if (embers > 0) flamesMat.color.multiplyScalar(1 - 0.94 * embers);
    }
    fireGlow.material.opacity = (0.1 + 0.16 * k) * fl;
    // sparks: each rises from the door mouth on its own loop, drifting, fading as it climbs
    for (let i = 0; i < NS; i++) {
      const [a, b, c, sp] = sparkSeed[i], u = (t * 0.6 * sp + a) % 1;
      sparkPos[3 * i] = fx + 0.06 + 0.25 * u + 0.05 * Math.sin(t * 3 + 6 * b);
      sparkPos[3 * i + 1] = FD.y1 - 0.02 + 0.9 * u * (0.6 + 0.4 * k);
      sparkPos[3 * i + 2] = fzc + (b - 0.5) * 0.3 + 0.06 * Math.sin(t * 2.3 + 6 * c);
    }
    (sparkGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    sparkMat.opacity = 0.35 + 0.55 * k;
    // the candle: its length, the flame's flicker, the halo at the flame
    cand.group.visible = candle >= 0; candHalo.visible = candle >= 0;
    const L = 0.012 + Math.max(0, Math.min(1, candle)) * S.candle.len;
    cand.set(L, t);
    candHalo.position.set(ELX + S.candle.x, BN.top + 0.087 + L + 0.03, S.candle.z);
    candHalo.material.opacity = 0.45 * (1 + 0.1 * Math.sin(t * 9.1));
  };
  animate(0);
  return {
    group,
    view(cam: THREE.Vector3) { fireGlow.lookAt(cam); candHalo.lookAt(cam); },
    animate,
    setParam(name: string, v: ParamValue) {
      if (name === "fire") fire = Math.max(0, Math.min(1, Number(v)));
      if (name === "candle") candle = Number(v);
      if (name === "embers") embers = Math.max(0, Math.min(1, Number(v)));
    },
    cast(t: number): Partial<CastLight> { return elabCast(fire, t); },
  };
}
