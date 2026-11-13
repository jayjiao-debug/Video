// THE SCHOOLS (place "schools", island x 500): the university lecture room on a May afternoon, 1686 (PLAN 1, 7D).
// WP2's set; the exports are the contract of sets/index.ts: SCHOOLS_LOOK, SCHOOLS_PARAMS { dust }, buildSchools(K) ->
// { group, animate, setParam, cast }. Every place-number is layout/schools.ts SCHOOLS_SET.
//
// WHAT THERE IS (the camera mostly looks -z, from the tall door toward the lectern)
//   - a tall hall: limewashed stone walls over an oak wainscot, an open timber roof (tie beams, king posts, principal
//     rafters, braces on wall posts), oak boards underfoot;
//   - rows of EMPTY oak benches with backs and book ledges either side of a middle aisle;
//   - THE LECTERN at the front (a sloped desk on a turned column), a carved master's chair against the front wall, the
//     royal arms painted on a board above;
//   - high leaded windows (two lights and a transom) down both side walls; ONE SUNBEAM: the sun comes through the
//     middle window of the left (south) wall only, a slanting shaft with dust turning in it (param dust 0..1), its
//     patch (cut by the leading) on the aisle and the front benches;
//   - THE TALL DOOR at the back: two panelled oak leaves under a four-centred arch, one standing open on the daylight.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, mix, blotch } from "../../../kit/sets/okit";
import { SCHOOLS_SET as S, SCX } from "../layout/schools";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, wallQuad, lathe, quad4, Part } from "./parts/common";
import { NC, NOINK, holedWall, revealG, wallPoly, leadedWindow, doorLeaf, doorTex, panelTex, plasterTex, oakBoardsTex, sunShaft, dustMotes, type Hole } from "./parts/newton";

const BAKED = { bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2" };
const CAST: Partial<CastLight> = { key: [-0.6, 0.55, 0.5], tint: [1.0, 0.96, 0.9], tintK: 0.55, gain: 1.0, shade: [1.04, 0.95, 1.32], broad: 0.15, sheen: 0.1 } as unknown as Partial<CastLight>;
const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.32, 0.27, 0.22]], [-10, [0.38, 0.33, 0.28]], [10, [0.5, 0.47, 0.43]], [90, [0.56, 0.55, 0.53]]],
  boxes: [{ az: 180, el: 35, rot: 0, w: 40, h: 26, soft: 16, col: [0.98, 0.94, 0.86] }],
};
/** the hall's look */
export const SCHOOLS_LOOK: PlaceLook = {
  bg: "#2e2824",
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 1.8, color: "#2a201c" },
  cast: { grad: 0.22, bodyGrad: 0.16, sideTint: [0.92, 0.92, 1.0], shadeK: 0.4, wrap: [30, 60], edge: 0.14, bodySat: 0.13, lift: 0.03, contactLen: 0.2, ...CAST, ...BAKED } as unknown as CastLight,
  fill: FILL,
  bloom: 0.4,
};
/** the per-frame dressing: dust 0..1 (the motes turning in the sunbeam) */
export const SCHOOLS_PARAMS: Record<string, ParamValue> = { dust: 1 };

const W = S.walls, X0 = SCX + W.x0, X1 = SCX + W.x1, Z0 = W.z0, Z1 = W.z1, WI = S.windows, B = S.benches, L = S.lectern, D = S.door;

// ---------------------------------------------------------------------------------------------------- paintings
/** THE ROYAL ARMS on a board: a crowned quartered shield between a lion and a unicorn, a motto ribbon */
const armsTex = () => paint(320, 260, (g, Wd, H) => {
  g.fillStyle = "#3a2a22"; g.fillRect(0, 0, Wd, H);
  g.fillStyle = "#5a3e2c"; g.fillRect(8, 8, Wd - 16, H - 16);
  const cx = Wd / 2, top = 70;
  // the shield, quartered
  g.save(); g.beginPath(); g.moveTo(cx - 60, top); g.lineTo(cx + 60, top); g.lineTo(cx + 60, top + 80); g.quadraticCurveTo(cx + 56, top + 130, cx, top + 150); g.quadraticCurveTo(cx - 56, top + 130, cx - 60, top + 80); g.closePath(); g.clip();
  g.fillStyle = "#b02a2a"; g.fillRect(cx - 60, top, 60, 75); g.fillRect(cx, top + 75, 60, 80);
  g.fillStyle = "#2a3a8a"; g.fillRect(cx, top, 60, 75); g.fillRect(cx - 60, top + 75, 60, 80);
  g.fillStyle = "#e0b84a"; for (const [x, y] of [[cx - 30, top + 38], [cx + 30, top + 112]]) { g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); }
  g.fillStyle = "#e8e0d0"; for (const [x, y] of [[cx + 30, top + 38], [cx - 30, top + 112]]) { g.fillRect(x - 3, y - 18, 6, 36); g.fillRect(x - 14, y - 3, 28, 6); }
  g.restore();
  g.strokeStyle = "#e0b84a"; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 60, top); g.lineTo(cx + 60, top); g.lineTo(cx + 60, top + 80); g.quadraticCurveTo(cx + 56, top + 130, cx, top + 150); g.quadraticCurveTo(cx - 56, top + 130, cx - 60, top + 80); g.closePath(); g.stroke();
  // the crown
  g.fillStyle = "#e0b84a"; g.fillRect(cx - 34, top - 22, 68, 14);
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(cx - 34 + i * 17, top - 22); g.lineTo(cx - 26 + i * 17, top - 46); g.lineTo(cx - 18 + i * 17, top - 22); g.fill(); }
  // the supporters (a gold lion, a white unicorn: rearing blobs)
  for (const [sx, col] of [[-1, "#d8a83a"], [1, "#ece4d4"]] as [number, string][]) {
    const x = cx + sx * 102;
    g.fillStyle = col; g.beginPath(); g.ellipse(x, top + 80, 26, 50, sx * 0.25, 0, 7); g.fill();
    g.beginPath(); g.arc(x + sx * 4, top + 22, 18, 0, 7); g.fill();
    g.fillRect(x - 6 - sx * 14, top + 120, 12, 40); g.fillRect(x - 6 + sx * 10, top + 120, 12, 40);
    if (sx > 0) { g.strokeStyle = "#e0b84a"; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 8, top + 8); g.lineTo(x + 22, top - 14); g.stroke(); }
  }
  // the motto ribbon
  g.fillStyle = "#e8dcc0"; g.fillRect(cx - 110, top + 160, 220, 22);
  g.fillStyle = "#4a3428"; for (let i = 0; i < 14; i++) g.fillRect(cx - 96 + i * 14, top + 168, 8, 5);
});
/** THE DAYLIGHT outside the tall door: a sunlit stone front across a paved court */
const outsideTex = () => paint(256, 320, (g, Wd, H) => {
  const sky = g.createLinearGradient(0, 0, 0, H * 0.3); sky.addColorStop(0, "#9cc0e4"); sky.addColorStop(1, "#d6e4ee");
  g.fillStyle = sky; g.fillRect(0, 0, Wd, H * 0.3);
  g.fillStyle = "#e8dcc0"; g.fillRect(0, H * 0.18, Wd, H * 0.52);
  g.fillStyle = "#d8c8a6"; for (let x = 0; x < Wd; x += 26) g.fillRect(x, H * 0.14, 14, H * 0.05);
  g.fillStyle = "#6a7488"; for (let x = 18; x < Wd; x += 64) { g.fillRect(x, H * 0.28, 24, H * 0.14); g.fillRect(x, H * 0.5, 24, H * 0.12); }
  g.fillStyle = "#cfc2a4"; g.fillRect(0, H * 0.7, Wd, H * 0.3);
  const r = rng(501); for (let i = 0; i < 60; i++) { g.fillStyle = css(r() < 0.5 ? "#bcae90" : "#ddd2b8", 0.6); g.fillRect(Wd * r(), H * (0.7 + 0.3 * r()), 30, 10); }
  g.fillStyle = "rgba(255,250,236,0.3)"; g.fillRect(0, 0, Wd, H);
});

// ---------------------------------------------------------------------------------------------------- the builder
export function buildSchools(K: Kit) {
  const group = new THREE.Group(); group.name = "schools";
  const Mk = maker(K, group);
  const mPlaster = Mk.tex(plasterTex(502, "#e8dcc2", "#d2c4a6"), 0.9), mPanel = Mk.tex(panelTex({ seed: 503, cols: 2, rows: 3, tw: 1.2, th: S.panel, base: "#7e5435", lo: "#5a3c26", hi: "#a87c54" }), 0.75);
  const mBoards = Mk.tex(oakBoardsTex({ seed: 504, n: 4, base: "#9a7048", lo: "#6a4a30" }), 0.8), mOak = Mk.flat("#6e4a30", 0.75), mOakHi = Mk.flat("#8a6040", 0.75), mOakDark = Mk.flat("#4e3424", 0.8);
  const mStone = Mk.flat(NC.stone, 0.88), mStoneLo = Mk.flat(NC.stoneLo, 0.9), mIron = Mk.flat(NC.iron, 0.5), mTimber = Mk.flat("#5e4030", 0.8);

  // =================================================================================================== floor, walls, wainscot
  Mk.mesh("schools.floor", levelQuad(X0, X1, Z0, Z1, 0, (x, z) => [(x - X0) / 1.2, -z / 2.4]), mBoards, { cast: false });
  const aL: [number, number] = [X0, Z1], bL: [number, number] = [X0, Z0];        // left (south) wall, faces +x, u = Z1 - z
  const aR: [number, number] = [X1, Z0], bR: [number, number] = [X1, Z1];        // right (north) wall, faces -x, u = z - Z0
  const aF: [number, number] = [X0, Z0], bF: [number, number] = [X1, Z0];        // front wall, faces +z, u = x - X0
  const aB: [number, number] = [X1, Z1], bB: [number, number] = [X0, Z1];        // back wall (the door), faces -z, u = X1 - x
  const winL: Hole[] = WI.z.map((z) => ({ u0: Z1 - z - WI.w / 2, u1: Z1 - z + WI.w / 2, y0: WI.y0, y1: WI.y1 }));
  const winR: Hole[] = WI.z.map((z) => ({ u0: z - Z0 - WI.w / 2, u1: z - Z0 + WI.w / 2, y0: WI.y0, y1: WI.y1 }));
  const dHole: Hole = { u0: W.x1 - (D.x + D.w / 2), u1: W.x1 - (D.x - D.w / 2), y0: 0, y1: D.h, arch: D.rise };
  Mk.mesh("schools.wall.left", holedWall(aL, bL, 0, S.plate, winL, 1.6, 1.6), mPlaster, { cast: true });
  Mk.mesh("schools.wall.right", holedWall(aR, bR, 0, S.plate, winR, 1.6, 1.6), mPlaster, { cast: true });
  Mk.mesh("schools.wall.front", holedWall(aF, bF, 0, S.plate, [], 1.6, 1.6), mPlaster, { cast: true });
  Mk.mesh("schools.wall.back", holedWall(aB, bB, 0, S.plate, [dHole], 1.6, 1.6), mPlaster, { cast: true });
  // the gables above the wall plate (front and back)
  const mid = (X1 - X0) / 2;
  const mGable = Mk.tex(plasterTex(508, "#c8b898", "#b2a282"), 0.9);
  Mk.mesh("schools.gable.front", wallPoly(aF, bF, [[0, S.plate - 0.01], [X1 - X0, S.plate - 0.01], [mid, S.ridge + 0.1]], 0, 1.6, 1.6), mGable, { cast: true });
  Mk.mesh("schools.gable.back", wallPoly(aB, bB, [[0, S.plate - 0.01], [X1 - X0, S.plate - 0.01], [mid, S.ridge + 0.1]], 0, 1.6, 1.6), mGable, { cast: true });
  // the wainscot (a panelled skin 1 cm proud, the back wall's pieces either side of the door) and its cap rail
  const P = S.panel, k = 0.012;
  const skin = (name: string, a: [number, number], b: [number, number], u0: number, u1: number) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-d[1], d[0]];
    const A: [number, number] = [a[0] + d[0] * u0 + n[0] * k, a[1] + d[1] * u0 + n[1] * k], Bp: [number, number] = [a[0] + d[0] * u1 + n[0] * k, a[1] + d[1] * u1 + n[1] * k];
    Mk.mesh(name, wallQuad(A, Bp, 0, P, { u0: u0 / 1.2, tileU: 1.2 }), mPanel, { cast: false });
    const ca = [A[0] + n[0] * 0.03, A[1] + n[1] * 0.03], cb = [Bp[0] + n[0] * 0.03, Bp[1] + n[1] * 0.03];
    Mk.mesh(name + ".cap", boxG(Math.min(A[0], Bp[0], ca[0], cb[0]) - 0.02, Math.max(A[0], Bp[0], ca[0], cb[0]) + 0.02, P - 0.02, P + 0.06, Math.min(A[1], Bp[1], ca[1], cb[1]) - 0.02, Math.max(A[1], Bp[1], ca[1], cb[1]) + 0.02), mOakDark);
  };
  skin("schools.panel.left", aL, bL, 0, Z1 - Z0); skin("schools.panel.right", aR, bR, 0, Z1 - Z0); skin("schools.panel.front", aF, bF, 0, X1 - X0);
  skin("schools.panel.backR", aB, bB, 0, dHole.u0 - 0.14); skin("schools.panel.backL", aB, bB, dHole.u1 + 0.14, X1 - X0);
  // the window reveals (deep stone walls) and the door's (jambs and head as their own meshes)
  for (const h of winL) Mk.mesh("schools.window.reveal", revealG(aL, bL, h, 0.6, 1.2), mStone, { cast: true });
  for (const h of winR) Mk.mesh("schools.window.reveal", revealG(aR, bR, h, 0.6, 1.2), mStone, { cast: true });
  for (const [i, nm] of ["jambL", "jambR", "head"].entries()) Mk.mesh(`schools.door.${nm}`, revealG(aB, bB, { ...dHole, arch: 0, y1: D.h - D.rise }, D.wall, 1.2, [i]), mStone, { cast: true });

  // =================================================================================================== the windows and the sun
  const glassSun = new THREE.MeshBasicMaterial({ color: "#fff4d8", fog: false }), glassN = new THREE.MeshBasicMaterial({ color: "#e4ecf0", fog: false }), glassS = new THREE.MeshBasicMaterial({ color: "#f0ece0", fog: false });
  const wm = (glass: THREE.MeshBasicMaterial) => ({ glass, frame: mStone, bar: mIron });
  for (const [i, h] of winL.entries()) { const g = i === WI.sunWin ? glassSun : glassS; group.add(leadedWindow(K, { a: aL, b: bL, hole: h, inset: 0.38, mats: wm(g), lights: 2, transom: WI.transom, q: 0.12, name: "schools.window.L" + i, glassMat: g, mullionW: 0.09 }).group); }
  for (const [i, h] of winR.entries()) group.add(leadedWindow(K, { a: aR, b: bR, hole: h, inset: 0.38, mats: wm(glassN), lights: 2, transom: WI.transom, q: 0.12, name: "schools.window.R" + i, glassMat: glassN, mullionW: 0.09 }).group);
  // the shaded south windows: something outside (unseen) keeps the sun off them, so there is ONE beam
  const hidden = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false });
  for (const [i, z] of WI.z.entries()) if (i !== WI.sunWin) { const m = new THREE.Mesh(boxG(X0 - 1.6, X0 - 1.2, 2.6, 9.5, z - 1.4, z + 2.4), hidden); m.castShadow = true; m.receiveShadow = false; m.layers.set(NOINK); m.name = "schools.shade"; group.add(m); }
  const sun = new THREE.Vector3(...S.sun).normalize(), into = sun.clone().negate();
  const zs = WI.z[WI.sunWin], gx = X0 - 0.38 + 0.02;
  const corners = [new THREE.Vector3(gx, WI.y0, zs + WI.w / 2), new THREE.Vector3(gx, WI.y0, zs - WI.w / 2), new THREE.Vector3(gx, WI.y1, zs - WI.w / 2), new THREE.Vector3(gx, WI.y1, zs + WI.w / 2)];
  const shaft = sunShaft(corners, into, 7.4, "#ffe2a8", 0.17, 0.0); shaft.name = "schools.sunbeam"; group.add(shaft);
  const dust = dustMotes(90, corners, into, 7.0, { size: 0.026, col: "#fff2d2", seed: 505 }); group.add(dust.points);

  // =================================================================================================== the open timber roof
  {
    const roofT = oakBoardsTex({ seed: 506, n: 5, base: "#6e4c32", lo: "#4a3222" });
    const mRoof = Mk.tex(roofT, 0.85), slope = Math.hypot(mid, S.ridge - S.plate);
    Mk.mesh("schools.roof.L", quad4(new THREE.Vector3(X0, S.plate, Z1), new THREE.Vector3(X0, S.plate, Z0), new THREE.Vector3(SCX, S.ridge, Z0), new THREE.Vector3(SCX, S.ridge, Z1), (Z1 - Z0) / 2.4, slope / 1.2), mRoof, { cast: true });
    Mk.mesh("schools.roof.R", quad4(new THREE.Vector3(X1, S.plate, Z0), new THREE.Vector3(X1, S.plate, Z1), new THREE.Vector3(SCX, S.ridge, Z1), new THREE.Vector3(SCX, S.ridge, Z0), (Z1 - Z0) / 2.4, slope / 1.2), mRoof, { cast: true });
    const Pt = new Part(K), ang = Math.atan2(S.ridge - S.plate, mid);
    for (const x of [X0, X1]) Pt.add(mTimber, boxG(x - 0.16, x + 0.16, S.plate - 0.22, S.plate + 0.04, Z0, Z1), 0.006);     // wall plates
    Pt.add(mTimber, boxG(SCX - 0.1, SCX + 0.1, S.ridge - 0.26, S.ridge - 0.02, Z0, Z1), 0.006);                              // ridge
    for (const sx of [-1, 1]) Pt.add(mTimber, new THREE.BoxGeometry(0.16, 0.2, Z1 - Z0).rotateZ(-sx * ang).translate(SCX + sx * mid * 0.5, (S.plate + S.ridge) / 2 - 0.16, (Z0 + Z1) / 2), 0.006);   // purlins
    for (let z = Z0 + 1.2; z < Z1 - 0.6; z += 2.8) {
      Pt.add(mTimber, boxG(X0, X1, S.plate - 0.32, S.plate - 0.02, z - 0.15, z + 0.15), 0.008);                             // tie beam
      Pt.add(mTimber, boxG(SCX - 0.11, SCX + 0.11, S.plate - 0.02, S.ridge - 0.2, z - 0.11, z + 0.11), 0.008);              // king post
      for (const sx of [-1, 1]) {
        const len = Math.hypot(mid, S.ridge - S.plate);
        Pt.add(mTimber, new THREE.BoxGeometry(len, 0.24, 0.2).rotateZ(-sx * ang).translate(SCX + sx * mid / 2, (S.plate + S.ridge) / 2 - 0.12, z), 0.008);   // principal rafters
        const wx = sx < 0 ? X0 : X1;
        Pt.add(mTimber, boxG(wx - 0.12, wx + 0.12, 4.2, S.plate - 0.3, z - 0.11, z + 0.11), 0.008);                         // wall post
        Pt.add(mStone, boxG(wx - 0.18 * sx - 0.1, wx - 0.18 * sx + 0.1, 3.95, 4.22, z - 0.16, z + 0.16), 0.006);           // its stone corbel
        const bl = Math.hypot(1.25, 1.55), ba = Math.atan2(1.55, 1.25);
        Pt.add(mTimber, new THREE.BoxGeometry(bl, 0.16, 0.14).rotateZ(sx < 0 ? ba : -ba).translate(wx - sx * 0.62, 4.5 + 0.75, z), 0.006);   // the brace up to the tie beam
      }
    }
    Pt.into(group, "schools.roof.timber", { cast: true });
  }

  // =================================================================================================== the benches
  {
    const Pt = new Part(K);
    for (const z of B.rows) for (const sx of [-1, 1]) {
      const xa = SCX + sx * B.aisle, xb = SCX + sx * B.outer, x0 = Math.min(xa, xb), x1 = Math.max(xa, xb), zb = z + B.depth;
      Pt.add(mOakHi, boxG(x0, x1, B.seat - 0.05, B.seat, z, zb), 0.006);                                                   // the seat
      Pt.add(mOak, boxG(x0 + 0.04, x1 - 0.04, B.seat + 0.12, B.back, zb - 0.03, zb + 0.01), 0.006);                       // the back board
      Pt.add(mOakHi, boxG(x0, x1, B.back - 0.02, B.back + 0.03, zb - 0.06, zb + 0.18), 0.006);                            // the book ledge on top (for the row behind)
      for (const ex of [x0, x1 - 0.06]) Pt.add(mOakDark, boxG(ex, ex + 0.06, 0, B.back + 0.06, z - 0.02, zb + 0.04), 0.006);   // the bench ends
      Pt.add(mOak, boxG(x0 + 0.06, x1 - 0.06, 0.08, 0.14, zb - 0.06, zb - 0.01), 0.006);                                  // the foot rail
      const mx = (x0 + x1) / 2; Pt.add(mOak, boxG(mx - 0.03, mx + 0.03, 0, B.seat - 0.05, z + 0.12, z + 0.18), 0.006);     // a middle leg
    }
    Pt.into(group, "schools.benches", { cast: true });
  }

  // =================================================================================================== the lectern, the chair, the arms
  {
    const Pt = new Part(K), x = SCX + L.x, z = L.z;
    Pt.add(mOakDark, lathe([[0.28, 0], [0.28, 0.06], [0.2, 0.09], [0.08, 0.13], [0.065, 0.26], [0.085, 0.36], [0.055, 0.46], [0.055, 0.62], [0.085, 0.67], [0.095, 0.71], [0, 0.71]], 8).rotateY(Math.PI / 8).translate(x, 0, z), 0.006);
    const ang = Math.atan2(L.high - L.low, L.d), dd = Math.hypot(L.d, L.high - L.low);
    Pt.add(mOak, new THREE.BoxGeometry(L.w, 0.05, dd).rotateX(-ang).translate(x, (L.low + L.high) / 2, z), 0.006);      // the sloped desk
    Pt.add(mOakDark, boxG(x - L.w / 2, x + L.w / 2, L.low - 0.02, L.low + 0.05, z - L.d / 2 - 0.04, z - L.d / 2 + 0.01), 0.004);   // the book lip
    // the desk's box under it: a panelled front toward the benches, open toward him
    Pt.add(mOakDark, boxG(x - L.w / 2 + 0.02, x + L.w / 2 - 0.02, 0.7, L.high - 0.03, z + L.d / 2 - 0.05, z + L.d / 2), 0.004);
    for (const sx of [-1, 1]) Pt.add(mOakDark, boxG(x + sx * (L.w / 2 - 0.04) - 0.02, x + sx * (L.w / 2 - 0.04) + 0.02, 0.7, L.low + 0.02, z - L.d / 2 + 0.02, z + L.d / 2 - 0.02), 0.004);
    Pt.add(mOakHi, boxG(x - L.w / 2 + 0.08, x + L.w / 2 - 0.08, 0.76, L.high - 0.08, z + L.d / 2, z + L.d / 2 + 0.012), 0.003);
    // the master's chair against the front wall (to his left), high-backed, carved cresting
    const cx = SCX + 2.4, cz = Z0 + 0.45;
    Pt.add(mOakHi, boxG(cx - 0.32, cx + 0.32, 0.44, 0.5, cz - 0.24, cz + 0.26), 0.005);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Pt.add(mOakDark, boxG(cx + sx * 0.29 - 0.03, cx + sx * 0.29 + 0.03, 0, sz < 0 ? 1.55 : 0.72, cz + sz * 0.22 - 0.03, cz + sz * 0.22 + 0.03), 0.005);
    Pt.add(mOak, boxG(cx - 0.29, cx + 0.29, 0.55, 1.45, cz - 0.25, cz - 0.21), 0.005);
    Pt.add(mOakDark, boxG(cx - 0.36, cx + 0.36, 1.45, 1.62, cz - 0.27, cz - 0.19), 0.005);
    for (const sx of [-1, 1]) Pt.add(mOakDark, boxG(cx + sx * 0.29 - 0.03, cx + sx * 0.29 + 0.03, 0.7, 0.75, cz - 0.22, cz + 0.28), 0.004);
    Pt.into(group, "schools.lectern", { cast: true });
    Mk.mesh("schools.arms", new THREE.PlaneGeometry(1.7, 1.38).translate(SCX, 3.85, Z0 + 0.02), Mk.tex(armsTex(), 0.8), { cast: false });
    Mk.mesh("schools.arms.frame", boxG(SCX - 0.9, SCX + 0.9, 3.12, 4.58, Z0, Z0 + 0.015), mOakDark, { cast: false });
  }

  // =================================================================================================== the tall door
  {
    const hx = SCX + D.x, lw = D.w / 2, lh = D.h - D.rise;
    const face = Mk.tex(doorTex({ w: lw, h: lh, base: "#6e4a30", lo: "#4e3424", hi: "#8a6244", rows: 4, cols: 1, seed: 507 }), 0.8);
    const open = doorLeaf(K, { w: lw, h: lh, t: 0.08, face, edge: mOakDark, iron: mIron, name: "schools.door.leafL" });
    open.position.set(hx - lw, 0, Z1 - 0.005); open.rotation.y = 1.62; group.add(open);
    const shut = doorLeaf(K, { w: lw, h: lh, t: 0.08, face, edge: mOakDark, iron: mIron, name: "schools.door.leafR" });
    shut.position.set(hx + lw, 0, Z1 + 0.05); shut.rotation.y = Math.PI; group.add(shut);
    // the tympanum in the arch's head, the threshold, the daylight beyond
    Mk.mesh("schools.door.tympanum", new THREE.PlaneGeometry(D.w + 0.02, D.rise + 0.02).rotateY(Math.PI).translate(hx, lh + D.rise / 2, Z1 + 0.04), mOakDark, { cast: false });
    Mk.mesh("schools.door.sill", boxG(hx - lw - 0.05, hx + lw + 0.05, 0, 0.004, Z1 - 0.02, Z1 + D.wall), mStoneLo, { cast: false });
    Mk.mesh("schools.outside", new THREE.PlaneGeometry(5.0, 5.4).rotateY(Math.PI).translate(hx, 2.4, Z1 + D.wall + 1.6), Mk.basic("#ffffff", { map: outsideTex() }), { cast: false, noink: true });
    Mk.mesh("schools.outside.floor", levelQuad(hx - 2.5, hx + 2.5, Z1 + D.wall - 0.01, Z1 + D.wall + 1.6, 0, (x, z) => [x / 1.2, -z / 1.2]), mStoneLo, { cast: false });
    Mk.mesh("schools.door.architrave", boxG(hx - lw - 0.16, hx - lw - 0.02, 0, lh + 0.1, Z1 - 0.04, Z1), mOakDark);
    Mk.mesh("schools.door.architrave", boxG(hx + lw + 0.02, hx + lw + 0.16, 0, lh + 0.1, Z1 - 0.04, Z1), mOakDark);
  }

  // =================================================================================================== the light
  const Lr = lightRig(group, { dir: S.sun, k: 9.0, col: "#ffe2b0", at: [SCX, 0, -0.5], half: 9, hemi: ["#e4dccc", "#6e5a48", 0.8], point: { col: "#ffffff", k: 0, at: [SCX, 3, 0], dist: 1 } });
  void Lr; void mix; void blotch;
  let dustK = 1;
  return {
    group,
    animate(t: number) { dust.update(t, dustK); shaft.visible = true; },
    setParam(name: string, v: ParamValue) { if (name === "dust") dustK = Math.max(0, Math.min(1, Number(v))); },
    cast(): Partial<CastLight> { return CAST; },
  };
}
