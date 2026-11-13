// THE MUSEUM (place "museum", island x 600): today, pit no. 1 of the terracotta army under its hall roof (PLAN 1, 7G).
// WP2's set; the exports are the contract of sets/index.ts: MUSEUM_LOOK, MUSEUM_PARAMS, buildMuseum(K) -> { group,
// view, animate, setParam }. Every place-number is layout/museum.ts MUSEUM_SET (colours and small proportions here).
//
// WHAT THERE IS (the camera stands on the raised walkway and looks down -z over the railing into the pit)
//   - the pit floor (y 0): grey-brown brick paving in every corridor; the earthen PARTITION WALLS (隔墙) of rammed
//     earth (layered bands, cracks), their tops darker with the imprints of the old roof logs;
//   - THE GRID: the middle corridor's first 6 ranks are EMPTY (the segments put 4 x 6 rig figures on MUSEUM.grid);
//     behind them, and in the side and outer corridors, the set's own CLAY STATUES (props-kit Parts: NOINK + hull)
//     carry the rows on into the dark: chibi warriors on little plinths, armour, a topknot, a handlebar moustache,
//     facing +z; two arm poses, a small turn each; at the back some headless and a few fallen, then mounds of earth;
//   - the pit's earth walls; above them the hall: dark walls with pilasters and a band of high windows, a shallow
//     arched roof on steel trusses with two skylight strips along the crown;
//   - the walkway (dark stone tiles) and THE RAILING in the foreground: steel posts, a flat steel handrail, a bottom
//     rail, faintly tinted glass panels (NOINK: the pit shows through), a small plaque "一号坑";
//   - light: dim and warm, a soft top light over the pit and a warm pool over the grid; the far rows fall darker;
//   - DUST: faint warm motes drifting slowly in the light over the grid (animate(t): the only moving thing of the set).
// INK / FLICKER: statues, glass, skylights, the plaque and the dust are NOINK (statues carry their hulls); inked geometry is
// chunky (walls 70 cm, trusses 36 cm, rail posts 7 cm only near the camera). Seeded; animate / setParam are pure.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, FONT, type G2 } from "../../../kit/sets/okit";
import { MUSEUM_SET as S, MUSEUM, MX } from "../layout/museum";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, wallQuad, tileUV, lathe, roundBox, rockFit, flagsTex, wrapBlotch, Part, NOINK } from "./parts/common";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.32, 0.3, 0.3]], [-10, [0.4, 0.38, 0.37]], [6, [0.5, 0.48, 0.48]], [40, [0.48, 0.48, 0.5]], [90, [0.44, 0.44, 0.48]]],
  boxes: [{ az: 0, el: 75, rot: 0, w: 40, h: 30, soft: 16, col: [1.0, 0.95, 0.86] }],
};
/** DIM MUSEUM LIGHT: soft top light over the pit, warm earth, nothing bright */
export const MUSEUM_LOOK: PlaceLook = {
  bg: "#1e1c20",
  ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 2.0, color: "#221e1e" },
  cast: {
    key: [0.15, 0.9, 0.4], tint: [1.0, 0.94, 0.84], tintK: 0.6, gain: 0.88, grad: 0.26, bodyGrad: 0.18, sideTint: [0.92, 0.9, 0.96],
    shade: [1.04, 0.94, 1.3], shadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.2, bodySat: 0.1, sheen: 0.08, lift: 0.02, contactLen: 0.3,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.3,
};
/** the per-frame dressing: light 0..1 (the pit's light level) */
export const MUSEUM_PARAMS: Record<string, ParamValue> = { light: 1 };

const COL = {
  // the clay (the rig's terracotta colours, people.ts COL.clay*)
  clay: "#b48c6a", clayLo: "#94704f", clayHi: "#c8a07c", clayInk: "#7a5a40",
  earth: "#967a60", earthHi: "#ac9070", earthLo: "#7c644c", earthTop: "#6a5644", log: "#463c36",
  brick: "#8e7864", grout: "#6a5848",
  hall: "#3c3a3e", hallLo: "#323034", pilaster: "#47424a", window: "#8fa4b8", roof: "#34323a", truss: "#4a4850", sky: "#cfe0ee",
  walk: "#4a4648", walkLo: "#3e3a3c", steel: "#6a6e76", steelHi: "#a4a8b0", glass: "#a8c8d8", plaque: "#2c2a30", plaqueText: "#e8dcc0",
};
const P_ = S.pit, Wk = S.walk, Wl = S.walls, Rl = S.rail, RO = S.rows, RF = S.roof;
const HALL_X = 12, LEDGE = Wk.top + 0.2;                        // the hall's walls (x offsets) and the pit's rim

// ---------------------------------------------------------------------------------------------------- the paintings
/** rammed earth (repeats, 2 m): layered bands, cracks, pebbles */
const earthTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(401);
  g.fillStyle = COL.earth; g.fillRect(0, 0, W, H);
  // the rammed layers: broad soft bands (10-16 cm), their seams faint and broken
  for (let y = 0; y < H; y += 26 + 16 * r()) {
    g.fillStyle = css(r() < 0.5 ? COL.earthHi : COL.earthLo, 0.18); g.fillRect(0, y, W, 20 + 14 * r());
    for (let x = 0; x < W; x += 30 + 60 * r()) { g.fillStyle = css(COL.earthLo, 0.35); g.fillRect(x, y, 20 + 50 * r(), 1.5); }
  }
  for (let i = 0; i < 60; i++) wrapBlotch(g, W, H, W * r(), H * r(), 14 + 60 * r(), r() < 0.5 ? COL.earthHi : COL.earthLo, 0.3);
  // pits and lumps
  for (let i = 0; i < 90; i++) { const x = W * r(), y = H * r(), rr = 2 + 4 * r(); g.fillStyle = css("#6a5038", 0.35); g.beginPath(); g.ellipse(x, y, rr, rr * 0.7, 0, 0, 7); g.fill(); g.fillStyle = css("#c8a882", 0.35); g.beginPath(); g.ellipse(x - 1, y - 1.5, rr * 0.7, rr * 0.4, 0, 0, 7); g.fill(); }
  g.strokeStyle = css("#5e4630", 0.5); g.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) { let x = W * r(), y = H * r(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += 10 * (r() - 0.5); y += 18 * r(); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 200; i++) { g.fillStyle = css(r() < 0.5 ? "#c8b090" : "#6a5038", 0.6); g.beginPath(); g.arc(W * r(), H * r(), 1 + 1.5 * r(), 0, 7); g.fill(); }
}, true);
/** the wall tops (repeats, 2 m along u): darker earth with the imprints of logs laid across */
const topTex = () => paint(256, 256, (g, W, H) => {
  const r = rng(403);
  g.fillStyle = COL.earthTop; g.fillRect(0, 0, W, H);
  // the logs lay ACROSS the corridors (along x): their imprints run across the wall's top (along u), one every 25 cm
  for (let i = 0; i < 8; i++) { const y = (i + 0.5) * H / 8 + 4 * (r() - 0.5); g.fillStyle = css(COL.log, 0.5); g.fillRect(0, y - 10, W, 20); g.fillStyle = css(COL.earthLo, 0.4); g.fillRect(0, y - 12, W, 3); }
  for (let i = 0; i < 20; i++) wrapBlotch(g, W, H, W * r(), H * r(), 12 + 20 * r(), COL.earthLo, 0.3);
}, true);
/** the statues' face (wraps a sphere: the face at u 0.25 = +z): brows, eyes, the handlebar moustache, a little mouth */
const faceTex = () => paint(256, 128, (g, W, H) => {
  g.fillStyle = COL.clayHi; g.fillRect(0, 0, W, H);
  const cx = W * 0.25, ink = COL.clayInk;
  g.fillStyle = ink;
  for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(cx + s * 11, H * 0.53, 2.6, 3.4, 0, 0, 7); g.fill();
    g.strokeStyle = ink; g.lineWidth = 2.5; g.lineCap = "round"; g.beginPath(); g.moveTo(cx + s * 5, H * 0.43); g.lineTo(cx + s * 17, H * 0.41); g.stroke();
    g.lineWidth = 3; g.beginPath(); g.moveTo(cx, H * 0.66); g.quadraticCurveTo(cx + s * 9, H * 0.7, cx + s * 14, H * 0.62); g.stroke();
  }
  g.lineWidth = 1.8; g.beginPath(); g.moveTo(cx - 4, H * 0.76); g.lineTo(cx + 4, H * 0.76); g.stroke();
  g.fillStyle = "rgba(160,110,80,0.35)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 18, H * 0.63, 5, 3, 0, 0, 7); g.fill(); }
});
/** the armour's scales (wraps the torso lathe): rows of small plates with rivets */
const armourTex = () => paint(256, 128, (g, W, H) => {
  g.fillStyle = COL.clay; g.fillRect(0, 0, W, H);
  for (let j = 0; j < 6; j++) for (let i = 0; i < 16; i++) {
    const x = i * W / 16 + (j % 2) * W / 32, y = j * H / 6;
    g.fillStyle = css(j % 2 ? COL.clayHi : COL.clay, 1); g.fillRect(x + 1, y + 1, W / 16 - 2, H / 6 - 2);
    g.fillStyle = COL.clayInk; g.beginPath(); g.arc(x + W / 32, y + H / 12, 1.6, 0, 7); g.fill();
  }
});
/** the hall's wall (u along 6 m, v up the wall from the ledge to the roof's springing): pilasters, the window band */
const hallTex = () => paint(256, 512, (g, W, H) => {
  const r = rng(405), V = (y: number) => H * (1 - (y - LEDGE) / (RF.y0 - LEDGE));
  g.fillStyle = COL.hall; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 12; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 40 * r(), COL.hallLo, 0.25);
  g.fillStyle = COL.window; g.fillRect(W * 0.12, V(8.4), W * 0.76, V(6.6) - V(8.4));
  g.fillStyle = COL.hallLo; for (let i = 1; i < 4; i++) g.fillRect(W * (0.12 + 0.19 * i) - 2, V(8.4), 4, V(6.6) - V(8.4));
  g.fillStyle = COL.pilaster; g.fillRect(0, 0, W * 0.08, H); g.fillRect(W * 0.92, 0, W * 0.08, H);
  g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, V(LEDGE + 0.4), W, 6);
}, true);
/** the roof's underside (u along the arch, v along z 6 m): dark deck with purlin lines */
const roofTex = () => paint(256, 256, (g, W, H) => {
  g.fillStyle = COL.roof; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(90,88,98,0.6)"; for (let i = 0; i < 10; i++) g.fillRect(i * W / 10, 0, 3, H);
  g.fillStyle = "rgba(20,18,24,0.5)"; g.fillRect(0, 0, W, 4);
}, true);

// ---------------------------------------------------------------------------------------------------- the statue
type StatueMats = { clay: THREE.Material; lo: THREE.Material; hi: THREE.Material; face: THREE.Material; armour: THREE.Material };
/** the pieces of one clay warrior (origin = the middle of its plinth's foot, facing +z), in its own frame */
const statuePieces = () => {
  const robe = lathe([[0, 0.07], [0.25, 0.075], [0.25, 0.14], [0.235, 0.34], [0.215, 0.5], [0.24, 0.56], [0.24, 0.8], [0.19, 0.9], [0.09, 0.95], [0, 0.96]], 10);
  const armour = lathe([[0, 0.5], [0.255, 0.52], [0.272, 0.58], [0.272, 0.8], [0.205, 0.9], [0, 0.93]], 10).rotateY(-Math.PI / 2);
  const head = new THREE.SphereGeometry(0.26, 12, 8).translate(0, 1.17, 0.01);
  const hair = new THREE.SphereGeometry(0.268, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.42).rotateX(-0.42).translate(0, 1.17, 0.0);
  const knot = new THREE.SphereGeometry(0.09, 8, 6).translate(0.09, 1.43, -0.07);
  const neck = new THREE.CylinderGeometry(0.09, 0.1, 0.12, 8).translate(0, 0.95, 0);
  const plinth = new THREE.BoxGeometry(0.48, 0.07, 0.44).translate(0, 0.035, 0);
  const armDown = (s: number) => new THREE.CapsuleGeometry(0.075, 0.28, 3, 6).rotateZ(s * 0.12).translate(s * 0.3, 0.64, 0.02);
  const armFwd = (s: number) => new THREE.CapsuleGeometry(0.075, 0.24, 3, 6).rotateX(-1.25).translate(s * 0.29, 0.66, 0.16);
  const fist = (s: number, fwd: boolean) => new THREE.SphereGeometry(0.075, 7, 5).translate(s * (fwd ? 0.29 : 0.32), fwd ? 0.62 : 0.46, fwd ? 0.32 : 0.03);
  return { robe, armour, head, hair, knot, neck, plinth, armDown, armFwd, fist };
};

// ---------------------------------------------------------------------------------------------------- the builder
export function buildMuseum(K: Kit) {
  const group = new THREE.Group(); group.name = "museum";
  const Mk = maker(K, group);
  const mEarth = Mk.tex(earthTex(), 0.95), mTop = Mk.tex(topTex(), 0.95);

  // =================================================================================================== the pit
  {
    // the brick floor (one level over the whole pit; the walls stand on it)
    const brick = flagsTex({ seed: 407, base: COL.brick, grout: COL.grout, nx: 3, ny: 6, bond: true, mottle: ["#b8a48c", "#4a3a2c"], lip: 0.15, px: 512 });
    Mk.mesh("museum.pit.floor", levelQuad(P_.x0, P_.x1, P_.z0, P_.z1, 0, (x, z) => [x / 0.9, -z / 0.9]), Mk.tex(brick, 0.9), { cast: false });
    // the partition walls: rammed earth, rounded tops with the log imprints
    for (const x of Wl.x) {
      const x0 = MX + x - Wl.w / 2, x1 = MX + x + Wl.w / 2;
      Mk.mesh("museum.partition", tileUV(boxG(x0, x1, -0.02, Wl.h - 0.06, Wl.z0, Wl.z1), 2, 2), mEarth);
      Mk.mesh("museum.partition.top", tileUV(roundBox(Wl.w + 0.02, 0.14, Wl.z1 - Wl.z0 + 0.02, 0.06).translate((x0 + x1) / 2, Wl.h - 0.06, (Wl.z0 + Wl.z1) / 2), 2, 2), mTop);
    }
    // the pit's earth walls: the sides (x0 / x1), the far end; and the rim's ledge up to the hall's walls
    Mk.mesh("museum.pit.wallW", tileUV(wallQuad([P_.x0, P_.z1], [P_.x0, P_.z0], 0, LEDGE), 2), mEarth, { cast: false });
    Mk.mesh("museum.pit.wallE", tileUV(wallQuad([P_.x1, P_.z0], [P_.x1, P_.z1], 0, LEDGE), 2), mEarth, { cast: false });
    Mk.mesh("museum.pit.end", tileUV(wallQuad([P_.x0, P_.z0], [P_.x1, P_.z0], 0, LEDGE), 2), mEarth, { cast: false });
    const ledge = Mk.flat(COL.walkLo, 0.9);
    Mk.mesh("museum.ledge", levelQuad(MX - HALL_X, P_.x0, P_.z0 - 1.5, P_.z1, LEDGE), ledge, { cast: false });
    Mk.mesh("museum.ledge", levelQuad(P_.x1, MX + HALL_X, P_.z0 - 1.5, P_.z1, LEDGE), ledge, { cast: false });
    Mk.mesh("museum.ledge", levelQuad(P_.x0, P_.x1, P_.z0 - 1.5, P_.z0, LEDGE), ledge, { cast: false });
    // mounds of unexcavated earth at the back of every corridor
    const r = rng(409);
    for (const cx of [...S.corridors, -8.85, 8.85]) for (let k = 0; k < 2; k++) {
      const x = MX + cx + (r() - 0.5) * 1.6, z = Wl.z0 + 1.4 + 2.2 * r(), s = 1.4 + 0.8 * r();
      Mk.mesh("museum.mound", rockFit(410 + Math.round(cx * 10) + k, s * 1.6, 0.6 + 0.4 * r(), s, 2, 0.1).translate(x, 0, z), mEarth);
    }
  }

  // =================================================================================================== the statues
  {
    const near: StatueMats = { clay: Mk.flat(COL.clay, 0.92), lo: Mk.flat(COL.clayLo, 0.92), hi: Mk.flat(COL.clayHi, 0.92), face: Mk.tex(faceTex(), 0.9), armour: Mk.tex(armourTex(), 0.9) };
    const farFace = Mk.own("#c4bcb4", { map: (near.face as THREE.MeshPhysicalMaterial).map, rough: 0.9 }), farArm = Mk.own("#c4bcb4", { map: (near.armour as THREE.MeshPhysicalMaterial).map, rough: 0.9 });
    const far: StatueMats = { clay: Mk.flat("#9a7658", 0.92), lo: Mk.flat("#7e5e42", 0.92), hi: Mk.flat("#aa8868", 0.92), face: farFace, armour: farArm };
    const sp = statuePieces(), r = rng(411), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const Pn = new Part(K), Pf = new Part(K), INK = 0.012;
    const statue = (x: number, z: number, rank: number) => {
      const P = rank < 9 ? Pn : Pf, M = rank < 9 ? near : far;
      const fallen = rank >= RO.statueRanks - 2 && r() < 0.1, headless = !fallen && rank >= RO.statueRanks - 5 && r() < 0.12, fwd = r() < 0.4, sc = 0.97 + 0.06 * r();
      e.set(fallen ? -Math.PI / 2 + 0.1 : 0, (r() - 0.5) * 0.14 + (fallen ? (r() - 0.5) * 1.2 : 0), 0);
      q.setFromEuler(e); m.compose(new THREE.Vector3(x, fallen ? 0.27 : 0, z + (fallen ? -0.6 : 0)), q, new THREE.Vector3(sc, sc, sc));
      if (!fallen) P.add(M.lo, sp.plinth, INK, m);
      P.add(M.clay, sp.robe, INK, m); P.add(M.armour, sp.armour, INK, m); P.add(M.hi, sp.neck, 0, m);
      for (const s of [-1, 1]) { const f = fwd && s > 0; P.add(M.clay, f ? sp.armFwd(s) : sp.armDown(s), INK, m); P.add(M.hi, sp.fist(s, f), INK, m); }
      if (!headless) { P.add(M.face, sp.head, INK, m); P.add(M.lo, sp.hair, 0, m); P.add(M.lo, sp.knot, INK, m); }
    };
    const files = RO.files;
    // the middle corridor: behind THE GRID (ranks RO.ranks .. statueRanks)
    for (let rk = RO.ranks; rk < RO.statueRanks; rk++) for (const f of files) statue(MX + f, RO.z0 - rk * RO.dz, rk);
    // the side corridors and the outer ones: from the first rank
    for (const cx of [S.corridors[0], S.corridors[2], -8.85, 8.85]) {
      const n = Math.abs(cx) > 8 ? RO.statueRanks - 4 : RO.statueRanks;
      for (let rk = 0; rk < n; rk++) for (const f of files) statue(MX + cx + f, RO.z0 - rk * RO.dz, rk);
    }
    Pn.into(group, "museum.statues", { cast: true, receive: true });
    Pf.into(group, "museum.statues.far", { cast: false, receive: true });
  }

  // =================================================================================================== the hall
  {
    const mHall = Mk.tex(hallTex(), 0.95);
    const wallSeg = (a: [number, number], b: [number, number], name: string) => Mk.mesh(name, wallQuad(a, b, LEDGE, RF.y0, { tileU: 6, vTile: RF.y0 - LEDGE }), mHall, { cast: false });
    wallSeg([MX - HALL_X, Wk.z1], [MX - HALL_X, P_.z0 - 1.5], "museum.hall.wallW");
    wallSeg([MX + HALL_X, P_.z0 - 1.5], [MX + HALL_X, Wk.z1], "museum.hall.wallE");
    // the far end wall up to the arch (a plain dark wall: a soft lighter band where the top light falls)
    const endT = paint(512, 256, (g, W, H) => { g.fillStyle = COL.hallLo; g.fillRect(0, 0, W, H); const gr = g.createLinearGradient(0, H, 0, 0); gr.addColorStop(0, "rgba(120,100,84,0.45)"); gr.addColorStop(0.4, "rgba(70,64,70,0.2)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
    const Rr = (RF.span / 2) ** 2 / (2 * (RF.y1 - RF.y0)) + (RF.y1 - RF.y0) / 2, cy = RF.y1 - Rr, ph = Math.asin(RF.span / 2 / Rr);
    const endShape = new THREE.Shape(); endShape.moveTo(-HALL_X, LEDGE); endShape.lineTo(HALL_X, LEDGE); endShape.lineTo(HALL_X, RF.y0);
    for (let i = 0; i <= 24; i++) { const a = ph - (2 * ph * i) / 24; endShape.lineTo(Rr * Math.sin(a), cy + Rr * Math.cos(a)); }
    endShape.lineTo(-HALL_X, LEDGE);
    const endG = new THREE.ShapeGeometry(endShape); { const p = endG.attributes.position as THREE.BufferAttribute, uv = endG.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + HALL_X) / (2 * HALL_X), (p.getY(i) - LEDGE) / (RF.y1 - LEDGE)); }
    Mk.mesh("museum.hall.end", endG.translate(MX, 0, P_.z0 - 1.5), Mk.tex(endT, 0.95), { cast: false });
    // THE ROOF: the arch's underside (double-sided), trusses every 6 m, two skylight strips along the crown
    const N = 24, z0 = P_.z0 - 1.5, z1 = Wk.z1, pos: number[] = [], uvs: number[] = [];
    for (let i = 0; i < N; i++) {
      const a0 = -ph + (2 * ph * i) / N, a1 = -ph + (2 * ph * (i + 1)) / N;
      const xa = MX + Rr * Math.sin(a0), ya = cy + Rr * Math.cos(a0), xb = MX + Rr * Math.sin(a1), yb = cy + Rr * Math.cos(a1);
      pos.push(xa, ya, z0, xb, yb, z0, xb, yb, z1, xa, ya, z0, xb, yb, z1, xa, ya, z1);
      const u0 = i / N * 6, u1 = (i + 1) / N * 6, v0 = 0, v1 = (z1 - z0) / 6;
      uvs.push(u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1);
    }
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); rg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); rg.computeVertexNormals();
    Mk.mesh("museum.roof", rg, Mk.K.flat("#ffffff", { map: roofTex(), rough: 0.9, side: THREE.DoubleSide }), { cast: false, receive: false });
    const truss = Mk.flat(COL.truss, 0.7);
    for (let z = z0 + 3; z < z1; z += 6) {
      const curve = new THREE.EllipseCurve(0, cy, Rr - 0.35, Rr - 0.35, Math.PI / 2 + ph, Math.PI / 2 - ph, true);
      const pts = curve.getPoints(24).map((p) => new THREE.Vector3(MX - p.x, p.y, z));
      Mk.mesh("museum.truss", new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.18, 6), truss, { cast: false });
      Mk.mesh("museum.truss", boxG(MX - HALL_X, MX + HALL_X, RF.y0 - 0.22, RF.y0 + 0.12, z - 0.12, z + 0.12), truss, { cast: false });
    }
    for (const a of [-0.12, 0.12]) {
      const x = MX + Rr * Math.sin(a * ph * 2.4), y = cy + Rr * Math.cos(a * ph * 2.4) - 0.08;
      const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.6, z1 - z0 - 2).rotateX(Math.PI / 2).rotateZ(-a * ph * 2.4).translate(x, y, (z0 + z1) / 2), Mk.basic(COL.sky));
      sky.name = "museum.skylight"; sky.layers.set(NOINK); group.add(sky);
    }
  }

  // =================================================================================================== the walkway, the railing
  {
    const tiles = flagsTex({ seed: 413, base: COL.walk, grout: "#2e2c2e", nx: 2, ny: 2, mottle: ["#6a666a", "#202022"], lip: 0.12, px: 256 });
    Mk.mesh("museum.walk", levelQuad(Wk.x0, Wk.x1, Wk.z0, Wk.z1, Wk.top, (x, z) => [x / 1.2, -z / 1.2]), Mk.tex(tiles, 0.6), { cast: false });
    Mk.mesh("museum.walk.face", tileUV(wallQuad([Wk.x1, Wk.z0], [Wk.x0, Wk.z0], 0, Wk.top), 2), Mk.flat(COL.walkLo, 0.9), { cast: false });
    // the railing: posts, the flat handrail, a bottom rail, glass panels between the posts
    const steel = Mk.flat(COL.steel, 0.35), steelHi = Mk.flat(COL.steelHi, 0.3), y0 = Wk.top, top = Wk.top + Rl.h, z = Rl.z;
    for (let x = Wk.x0 + 0.4; x <= Wk.x1 - 0.4; x += Rl.post) Mk.mesh("museum.rail.post", boxG(x - 0.035, x + 0.035, y0, top - 0.03, z - 0.035, z + 0.035), steel);
    Mk.mesh("museum.rail.top", new THREE.CylinderGeometry(0.032, 0.032, Wk.x1 - Wk.x0 - 0.6, 20).rotateZ(Math.PI / 2).translate((Wk.x0 + Wk.x1) / 2, top - 0.0, z), steelHi);
    Mk.mesh("museum.rail.bottom", boxG(Wk.x0 + 0.3, Wk.x1 - 0.3, y0 + 0.1, y0 + 0.15, z - 0.025, z + 0.025), steel);
    const glass = Mk.basic(COL.glass, { transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(Wk.x1 - Wk.x0 - 0.8, Rl.h - 0.24).translate((Wk.x0 + Wk.x1) / 2, y0 + 0.15 + (Rl.h - 0.24) / 2, z), glass);
    gl.name = "museum.rail.glass"; gl.layers.set(NOINK); gl.renderOrder = 6; group.add(gl);
    // a faint highlight streak on the glass (it reads as glass, not as nothing)
    const streak = paint(256, 64, (g, W, H) => { g.clearRect(0, 0, W, H); for (let i = 0; i < 6; i++) { const x = (i + 0.3) * W / 6; g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 10, 0); g.lineTo(x - 14, H); g.lineTo(x - 24, H); g.closePath(); g.fill(); } }, true);
    streak.repeat.set((Wk.x1 - Wk.x0) / 3, 1);
    const st = new THREE.Mesh(new THREE.PlaneGeometry(Wk.x1 - Wk.x0 - 0.8, Rl.h - 0.24).translate((Wk.x0 + Wk.x1) / 2, y0 + 0.15 + (Rl.h - 0.24) / 2, z + 0.004), Mk.basic("#ffffff", { map: streak, transparent: true, opacity: 0.18, depthWrite: false }));
    st.name = "museum.rail.glass"; st.layers.set(NOINK); st.renderOrder = 7; group.add(st);
    // the plaque on the railing, a little left of the middle (seen from the walkway: it faces +z)
    const plaqueT = paint(512, 192, (g: G2, W, H) => {
      g.fillStyle = COL.plaque; g.fillRect(0, 0, W, H); g.strokeStyle = "rgba(232,220,192,0.6)"; g.lineWidth = 4; g.strokeRect(10, 10, W - 20, H - 20);
      g.fillStyle = COL.plaqueText; g.font = `700 96px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("一号坑", W / 2, H * 0.44);
      g.font = `500 30px ${FONT}`; g.fillStyle = "rgba(232,220,192,0.75)"; g.fillText("PIT No. 1", W / 2, H * 0.8);
    });
    const plq = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.19).rotateX(-0.5).translate(MX - 0.75, top + 0.07, z + 0.06), Mk.tex(plaqueT, 0.6));
    plq.name = "museum.plaque"; plq.layers.set(NOINK); group.add(plq);
    Mk.mesh("museum.plaque.stand", boxG(MX - 0.77, MX - 0.73, top - 0.02, top + 0.04, z + 0.02, z + 0.08), steel);
  }

  // =================================================================================================== the light
  const L = lightRig(group, { dir: [0.15, 0.9, 0.35], k: 1.25, col: "#ffe8cc", at: [MX, 0, -7], half: 13, hemi: ["#8a8278", "#5a4c44", 1.2], point: { col: "#ffc890", k: 46, at: [MX, 6.8, MUSEUM.grid[10].z], dist: 16 } });
  const setLight = (k: number) => { L.key.intensity = 1.25 * k; L.point.intensity = 46 * k; L.hemi.intensity = 0.6 + 0.6 * k; };
  setLight(1);

  // =================================================================================================== the dust
  // DUST MOTES drifting in the top light over the grid (life in the still hall): soft warm specks (a radial sprite, never
  // a hard pixel), 5-12 px at the film's size, dim (additive, far under the bloom threshold), slow (a few cm a second,
  // sinking a little, wandering); NOINK, no depth write; a pure function of t. They keep 1.7 m off her lens and
  // below 3 m over the grid ranks 0-5 (seen from the walkway against the clay and the floor, never against the dark
  // hall above, where they read as stars).
  const DN = 170, DY = [0.9, 3.0], dust = new Float32Array(DN * 3), dustBase: number[][] = [];
  {
    const r = rng(415);
    for (let i = 0; i < DN; i++) dustBase.push([MX + (r() - 0.5) * 5.4, DY[0] + (DY[1] - DY[0]) * r(), 0.8 - 7.8 * r(), r() * 6.28, 0.6 + 0.8 * r()]);
  }
  const dustCol = new Float32Array(DN * 3);
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3)); dustGeo.setAttribute("color", new THREE.BufferAttribute(dustCol, 3));
  const mote = paint(64, 64, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(255,244,222,1)"); gr.addColorStop(0.35, "rgba(255,232,200,0.55)"); gr.addColorStop(1, "rgba(255,226,190,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); });
  const motes = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: mote, color: "#ffe2bc", size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.62, vertexColors: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  motes.name = "museum.dust"; motes.layers.set(NOINK); motes.frustumCulled = false; motes.renderOrder = 5; group.add(motes);
  const animate = (t: number) => {
    const H = DY[1] - DY[0], y0 = DY[0];
    for (let i = 0; i < DN; i++) {
      const [x, y, z, p, s] = dustBase[i];
      dust[i * 3] = x + 0.22 * Math.sin(t * 0.21 * s + p) + 0.08 * Math.sin(t * 0.53 + p * 2.1);
      // a slow sink (2-4 cm/s) that wraps round inside the light's height; each mote fades out over the last 0.3 m
      // before the wrap and back in over the first 0.3 m after it (additive: a black mote draws nothing), so none pops
      const yy = ((((y - y0 - t * 0.03 * s + 0.12 * Math.sin(t * 0.37 + p)) % H) + H) % H);
      dust[i * 3 + 1] = y0 + yy;
      dust[i * 3 + 2] = z + 0.18 * Math.cos(t * 0.17 * s + p * 0.7);
      const k = Math.min(1, yy / 0.3, (H - yy) / 0.3) * (0.55 + 0.45 * Math.sin(p * 3.7) ** 2);
      dustCol[i * 3] = dustCol[i * 3 + 1] = dustCol[i * 3 + 2] = Math.max(0, k);
    }
    (dustGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (dustGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  };
  animate(0);
  return {
    group,
    view(cam: THREE.Vector3) { void cam; },
    animate(t: number) { animate(t); },
    setParam(name: string, v: ParamValue) { if (name === "light") setLight(Math.max(0, Math.min(1, Number(v)))); },
  };
}
