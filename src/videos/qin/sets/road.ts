// THE ROAD (place "road", island x 500): the summer road at 沙丘, 210 BC (PLAN 1, 7G). WP2's set; the exports are the
// contract of sets/index.ts: ROAD_LOOK, ROAD_PARAMS, buildRoad(K) -> { group, view, animate, setParam }. Every
// place-number is layout/road.ts ROAD_SET (colours, painting and small proportions live here).
//
// WHAT THERE IS (the camera looks -z along the road; the closed carriage, the baskets and the fish cart are WP3's
// props, put by the shots at ROAD.carriage / ROAD.rack / ROAD.fishCart: the set never draws them)
//   - THE ROAD: packed ochre earth, two dark wheel ruts at the carriage's track (ROAD_SET.carriage.wheel.track),
//     hoof prints and pebbles between them, dry grass creeping in at the edges;
//   - the dry land on both sides: cracked sun-baked earth with pale and dark patches and grass strokes, flat by the
//     road, rising into low dunes further out; tufts of dry grass (swaying a little), camel-thorn shrubs, rocks, a
//     dead tree, a stone road marker;
//   - the halted tour far down the road: tents (cream and red) and black Qin banners on poles;
//   - the far dunes (沙丘) on a painted card, a pale heat band on the horizon and a bleached blue sky with thin wisps;
//   - THE HEAT (param heat): a shimmering mirage pool on the far road and a wavering haze band over the horizon.
// INK / FLICKER: grass, the mirage, the haze, the card, the far camp's cloth are NOINK; inked geometry is chunky
// (shrubs >= 40 cm, the marker, the dead tree). Seeded painting only; animate / setParam are pure functions.
import * as THREE from "three";
import type { EnvSpec } from "../../bt/pbr";
import type { Kit } from "../../../kit/props/kit";
import type { CastLight } from "../../group/kit/cast";
import { lightRig, paint, rng, css, blotch, skyDome, farCard, soft, Batch, type SkyStops, type G2 } from "../../../kit/sets/okit";
import { ROAD_SET as S, ROAD, RX } from "../layout/road";
import type { PlaceLook, ParamValue } from "./index";
import { maker, boxG, levelQuad, terrainG, rockFit, bar, wrapBlotch, smooth01, makeCloth, Part, NOINK } from "./parts/common";
import { strandField, type Strand } from "./parts/strands";

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.56, 0.48, 0.4]], [-20, [0.62, 0.54, 0.46]], [-3, [0.74, 0.68, 0.6]], [4, [0.92, 0.88, 0.8]], [30, [0.8, 0.82, 0.86]], [90, [0.66, 0.72, 0.86]]],
  boxes: [{ az: -150, el: 55, rot: 0, w: 36, h: 18, soft: 14, col: [1.0, 0.94, 0.8] }],
};
/** SUMMER HEAT: a hard warm sun from high up, hazy warm sky; the figures under 1 */
export const ROAD_LOOK: PlaceLook = {
  bg: "#e8d9b8",
  ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.8, color: "#4a3a30" },
  cast: {
    key: [0.4, 0.78, 0.45], tint: [1.0, 0.93, 0.8], tintK: 0.85, gain: 0.94, grad: 0.22, bodyGrad: 0.16, sideTint: [0.95, 0.93, 0.98],
    shade: [1.06, 0.95, 1.3], shadeK: 0.32, wrap: [26, 52], edge: 0.13, broad: 0, bodySat: 0.12, sheen: 0.08, lift: 0, contactLen: 0.5,
    bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
  } as unknown as CastLight,
  fill: FILL,
  bloom: 0.25,
};
/** the per-frame dressing: flies on / off (round the fish cart and the baskets: WP3's props draw them; the set keeps
 *  the switch and draws nothing for it); heat 0..1 (the mirage and the haze band's strength) */
export const ROAD_PARAMS: Record<string, ParamValue> = { flies: false, heat: 1 };

const COL = {
  earth: "#d6b47a", earthHi: "#e8cc96", earthLo: "#bf9862", crack: "#9c7a4c", pebble: "#a89070",
  road: "#cfa472", roadHi: "#e0bc88", rut: "#a47c4c", rutLo: "#8e6a40", hoof: "#b08858",
  grass: "#9a8c3e", grassTip: "#dcc878", grassGreen: "#7e9a44", shrub: "#8c9446", shrubLo: "#6e7a3a", shrubHi: "#aab25a",
  rock: "#b0987a", rockLo: "#94806a", bark: "#7a6450", barkLo: "#5e4c3e", marker: "#c8bca8",
  tent: "#efe4c8", tentRed: "#c8483a", flag: "#2a2630", flagEdge: "#c8322c", pole: "#6a5040",
  dune: "#ecc488", duneLo: "#d09a5e", duneFar: "#e8cfa8", haze: "#fff6e0", mirage: "#dff0ff",
};
/** the bleached summer sky by elevation (degrees) */
const SKY: SkyStops = [[-10, "#e6d2a8"], [0, "#f4e8cc"], [5, "#e8ece6"], [16, "#c4dcee"], [40, "#98c6ec"], [90, "#7cb2e6"]];
const G = S.ground, RW = S.road, kx0 = RW.x - RW.w / 2, kx1 = RW.x + RW.w / 2;
/** the land's height: flat by the road (and under the near staging), rising into low dunes further out */
const landH = (x: number, z: number) => {
  const d = Math.abs(x - RW.x) - RW.w / 2, near = smooth01(4, 26, d) * (0.4 + 0.6 * smooth01(-30, 10, -z));
  const ridge = 0.5 + 0.5 * Math.sin(x * 0.11 + z * 0.045 + Math.sin(z * 0.03) * 2) * Math.sin(z * 0.07 - x * 0.02 + 1.3);
  return near * (0.4 + 3.2 * ridge) + 0.04 * smooth01(1.5, 6, d) * Math.sin(x * 1.3) * Math.sin(z * 1.1);
};

// ---------------------------------------------------------------------------------------------------- the paintings
/** the dry land (repeats, 6 m): cracked earth, pale and dark patches, pebbles, dry grass strokes */
const earthTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(301);
  g.fillStyle = COL.earth; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) wrapBlotch(g, W, H, W * r(), H * r(), 30 + 80 * r(), r() < 0.55 ? COL.earthHi : COL.earthLo, 0.35);
  // cracks: short polygonal nets in a few patches
  g.strokeStyle = css(COL.crack, 0.55); g.lineWidth = 1.6;
  for (let p = 0; p < 8; p++) {
    const cx = W * r(), cy = H * r();
    for (let k = 0; k < 14; k++) { let x = cx + 60 * (r() - 0.5), y = cy + 60 * (r() - 0.5); g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 3; s++) { x += 16 * (r() - 0.5); y += 16 * (r() - 0.5); g.lineTo(x, y); } g.stroke(); }
  }
  for (let i = 0; i < 300; i++) { g.fillStyle = css(r() < 0.5 ? COL.pebble : "#efe0c0", 0.7); g.beginPath(); g.ellipse(W * r(), H * r(), 1.5 + 2 * r(), 1 + 1.5 * r(), r() * 3, 0, 7); g.fill(); }
  g.lineCap = "round";
  for (let i = 0; i < 260; i++) { const x = W * r(), y = H * r(); g.strokeStyle = css(r() < 0.6 ? COL.grass : COL.grassTip, 0.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 5 * (r() - 0.5), y - 5 - 6 * r()); g.stroke(); }
}, true);
/** THE ROAD (u across its width, v along 6 m; repeats in v): packed earth, the two ruts at the wheel track (centred
 *  on the carriage's line, ROAD.carriage.x), hoof prints and pebbles in the middle, grass creeping in at the edges */
const roadTex = () => paint(512, 704, (g, W, H) => {
  const r = rng(303), U = (x: number) => ((x / RW.w) + 0.5) * W, tr = S.carriage.wheel.track / 2, cx = ROAD.carriage.x - RW.x;
  g.fillStyle = COL.road; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 30; i++) wrapBlotch(g, W, H, W * r(), H * r(), 20 + 50 * r(), r() < 0.55 ? COL.roadHi : COL.earthLo, 0.3);
  // the ruts: a dark groove with a pale lip each side, wavering a little (wrapping in v)
  for (const s of [-1, 1]) {
    const x0 = U(cx + s * tr);
    for (let y = 0; y < H; y += 2) {
      const wob = 3 * Math.sin((y / H) * Math.PI * 2 * 2 + s) + 2 * Math.sin((y / H) * Math.PI * 2 * 5);
      g.fillStyle = css(COL.roadHi, 0.6); g.fillRect(x0 + wob - 15, y, 5, 2); g.fillRect(x0 + wob + 10, y, 5, 2);
      g.fillStyle = COL.rut; g.fillRect(x0 + wob - 10, y, 20, 2);
      g.fillStyle = COL.rutLo; g.fillRect(x0 + wob - 4, y, 8, 2);
    }
  }
  // hoof prints between the ruts
  for (let i = 0; i < 46; i++) { const x = U(cx + (r() - 0.5) * 1.2), y = H * r(); g.fillStyle = css(COL.hoof, 0.8); g.beginPath(); g.ellipse(x, y, 6, 7, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = css(COL.road, 1); g.beginPath(); g.ellipse(x, y + 2, 2.5, 3.5, 0, 0, Math.PI * 2); g.fill(); }
  for (let i = 0; i < 220; i++) { g.fillStyle = css(r() < 0.5 ? COL.pebble : "#f0dcb4", 0.75); g.beginPath(); g.ellipse(W * r(), H * r(), 1.5 + 2.5 * r(), 1.2 + 1.5 * r(), r() * 3, 0, 7); g.fill(); }
  // the edges: the land's colour and grass strokes creeping in
  for (const e of [0, W]) {
    const gr = g.createLinearGradient(e, 0, e === 0 ? 40 : W - 40, 0); gr.addColorStop(0, css(COL.earth, 1)); gr.addColorStop(1, css(COL.earth, 0)); g.fillStyle = gr; g.fillRect(e === 0 ? 0 : W - 40, 0, 40, H);
    for (let i = 0; i < 70; i++) { const x = e === 0 ? 30 * r() : W - 30 * r(), y = H * r(); g.strokeStyle = css(r() < 0.5 ? COL.grass : COL.grassTip, 0.7); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 * (r() - 0.5), y - 8 - 8 * r()); g.stroke(); }
  }
}, true);
/** the mirage (repeats in v): soft pale horizontal streaks, transparent between */
const mirageTex = () => paint(256, 256, (g, W, H) => {
  g.clearRect(0, 0, W, H); const r = rng(305);
  for (let i = 0; i < 40; i++) { const y = H * r(), w = W * (0.3 + 0.6 * r()), x = W * r(); soft(g, 3, () => { g.fillStyle = css(COL.mirage, 0.35 + 0.4 * r()); g.fillRect(x - w / 2, y, w, 3 + 4 * r()); g.fillRect(x - w / 2 + (r() < 0.5 ? W : -W), y, w, 4); }); }
}, true);
/** the heat haze band (repeats in u): wavering pale vertical-soft bands, strongest at the foot */
const hazeTex = () => paint(512, 128, (g, W, H) => {
  g.clearRect(0, 0, W, H); const r = rng(307);
  for (let i = 0; i < 60; i++) {
    const x = W * r(), y = H * (0.35 + 0.6 * r()), w = 40 + 120 * r();
    soft(g, 4, () => { g.strokeStyle = css(COL.haze, 0.25 + 0.35 * r()); g.lineWidth = 2 + 3 * r(); for (const dx of [-W, 0, W]) { g.beginPath(); g.moveTo(x + dx - w / 2, y); g.bezierCurveTo(x + dx - w / 4, y - 4, x + dx + w / 4, y + 4, x + dx + w / 2, y); g.stroke(); } });
  }
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,246,224,0)"); gr.addColorStop(1, "rgba(255,246,224,0.35)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}, true);

// ---------------------------------------------------------------------------------------------------- the builder
export function buildRoad(K: Kit) {
  const group = new THREE.Group(); group.name = "road";
  const Mk = maker(K, group);

  // =================================================================================================== the land
  {
    const m = earthTex(); m.repeat.set((kx0 - G.x0) / 6, (G.z1 - G.z0) / 6);
    const mE = earthTex(); mE.repeat.set((G.x1 - kx1) / 6, (G.z1 - G.z0) / 6);
    Mk.mesh("road.land", terrainG(G.x0, kx0, G.z0, G.z1, 80, 120, 0, landH), Mk.tex(m, 0.95), { cast: false });
    Mk.mesh("road.land", terrainG(kx1, G.x1, G.z0, G.z1, 80, 120, 0, landH), Mk.tex(mE, 0.95), { cast: false });
    Mk.mesh("road.road", levelQuad(kx0, kx1, G.z0, G.z1, 0, (x, z) => [(x - kx0) / RW.w, -z / 6]), Mk.tex(roadTex(), 0.95), { cast: false });
    // the land runs on to the far card in one colour
    Mk.mesh("road.land.far", levelQuad(G.x0 - 120, G.x1 + 120, G.z0 - 40, G.z0, 0), Mk.flat(COL.earth, 0.95), { cast: false });
  }

  // =================================================================================================== grass, shrubs, rocks
  const strands: Strand[] = [];
  {
    const r = rng(311);
    const staged = [...ROAD.officials, ...ROAD.lifters];
    const tuft = (x: number, z: number, h: number, green = false) => {
      if (staged.some((p) => Math.hypot(x - p.x, z - p.z) < 0.6)) return;
      const y = landH(x, z) - 0.01, ph = r() * 6.28, n = 6 + Math.floor(4 * r());
      for (let b = 0; b < n; b++) {
        const la = r() * 6.28, lean = 0.08 + 0.18 * r(), root = new THREE.Vector3(x + 0.08 * (r() - 0.5), y, z + 0.08 * (r() - 0.5));
        strands.push({ root, tip: root.clone().add(new THREE.Vector3(Math.cos(la) * lean, h * (0.55 + 0.45 * r()), Math.sin(la) * lean)), w: 0.035, c0: green ? COL.grassGreen : COL.grass, c1: COL.grassTip, ph, amp: 0.05, seg: 2, face: r() * 3 });
      }
    };
    // along both road edges (never on the road: the officials and the lifters stand there)
    for (let z = G.z1 - 1; z > -60; z -= 0.5 + 0.9 * r()) {
      if (r() < 0.8) tuft(kx0 - 0.1 - 0.6 * r(), z, 0.3 + 0.25 * r(), r() < 0.25);
      if (r() < 0.8) tuft(kx1 + 0.1 + 0.6 * r(), z, 0.3 + 0.25 * r(), r() < 0.25);
    }
    // scattered over the land
    for (let i = 0; i < S.grass * 3; i++) {
      const side = r() < 0.5 ? -1 : 1, x = RW.x + side * (RW.w / 2 + 0.8 + 26 * r() * r()), z = G.z1 - 2 - 80 * r();
      tuft(x, z, 0.25 + 0.3 * r(), r() < 0.2);
    }
  }
  const grass = strandField(Mk, strands, "road.grass");
  group.add(grass.mesh);
  {
    // camel-thorn shrubs (props-kit Part: NOINK + hull) and rocks
    const P = new Part(K), sh = [Mk.flat(COL.shrub, 0.9), Mk.flat(COL.shrubLo, 0.9), Mk.flat(COL.shrubHi, 0.9)], r = rng(313);
    const blob = new THREE.IcosahedronGeometry(1, 2);
    for (let i = 0; i < 26; i++) {
      const side = i % 2 ? 1 : -1, x = RW.x + side * (RW.w / 2 + 1.5 + 22 * r()), z = 6 - 60 * r(), s = 0.35 + 0.35 * r(), y = landH(x, z);
      for (let k = 0; k < 3; k++) P.add(sh[k], blob.clone().scale(s * (1 - 0.2 * k), s * 0.7 * (1 - 0.2 * k), s * (1 - 0.2 * k)).translate(x + 0.25 * s * (k - 1), y + s * 0.45 + 0.12 * k * s, z + 0.15 * s * (k % 2)), 0.02);
    }
    const mR = [Mk.flat(COL.rock, 0.9), Mk.flat(COL.rockLo, 0.9)];
    for (let i = 0; i < 18; i++) {
      const side = i % 2 ? 1 : -1, x = RW.x + side * (RW.w / 2 + 0.7 + 14 * r()), z = 8 - 50 * r(), s = 0.25 + 0.4 * r();
      P.add(mR[i % 2], rockFit(400 + i, s * 1.4, s * 0.7, s, 1, 0.08).translate(x, landH(x, z), z), 0.015);
    }
    // the stone road marker (west side, near) and the dead tree (east, middle distance)
    const mx = kx0 - 0.9, mz = -1.2;
    P.add(Mk.flat(COL.marker, 0.9), boxG(mx - 0.16, mx + 0.16, -0.05, 0.85, mz - 0.1, mz + 0.1), 0.015);
    P.add(Mk.flat(COL.rockLo, 0.9), boxG(mx - 0.24, mx + 0.24, -0.05, 0.1, mz - 0.18, mz + 0.18), 0.015);
    P.add(Mk.flat(COL.marker, 0.9), new THREE.ConeGeometry(0.2, 0.16, 4).rotateY(Math.PI / 4).scale(1, 1, 0.6).translate(mx, 0.93, mz), 0.012);
    const tb = new THREE.Vector3(RX + 9.5, landH(RX + 9.5, -15), -15), bark = Mk.flat(COL.bark, 0.9), barkLo = Mk.flat(COL.barkLo, 0.9);
    const tt = tb.clone().add(new THREE.Vector3(-0.5, 3.4, 0.2));
    P.add(bark, bar(tb.clone().setY(tb.y - 0.2), tt, 0.28, 0.14, 10), 0.03);
    const limbs: [number, number, number][] = [[-1.6, 1.4, 0.3], [1.3, 1.6, -0.2], [0.4, 2.0, 0.6], [-0.7, 1.1, -0.8]];
    for (const [dx, dy, dz] of limbs) { const e = tt.clone().add(new THREE.Vector3(dx, dy, dz)); P.add(barkLo, bar(tt.clone().add(new THREE.Vector3(0, -0.5, 0)), e, 0.11, 0.04, 8), 0.02); P.add(barkLo, bar(e, e.clone().add(new THREE.Vector3(dx * 0.35, 0.5, dz * 0.4)), 0.04, 0.02, 6), 0.012); }
    P.into(group, "road.dressing");
  }

  // =================================================================================================== the halted tour
  const banners: { sway: (t: number, a: number) => void }[] = [];
  {
    const B = new Batch(), r = rng(317), tent = Mk.flat(COL.tent, 0.85), tentRed = Mk.flat(COL.tentRed, 0.85), pole = Mk.flat(COL.pole, 0.8);
    const tents: [number, number, number][] = [[RX - 9, -38, 2.2], [RX - 13, -44, 2.6], [RX + 10, -40, 2.4], [RX + 14.5, -47, 2.0], [RX - 7.5, -52, 2.0], [RX + 8, -56, 2.2], [RX - 16, -58, 2.6]];
    tents.forEach(([x, z, s], i) => {
      const y = landH(x, z);
      B.add(i % 3 === 1 ? tentRed : tent, new THREE.ConeGeometry(s, s * 1.1, 6, 1).translate(x, y + s * 0.55, z));
      B.add(i % 3 === 1 ? tent : tentRed, new THREE.CylinderGeometry(s * 0.98, s, s * 0.35, 6, 1, true).translate(x, y + s * 0.17, z));
    });
    B.flush(group, "road.camp", false, false);
    group.children.filter((c) => c.name === "road.camp").forEach((c) => c.layers.set(NOINK));
    // black Qin banners on poles along the road beyond the carriage (cloth: NOINK, swaying in a hot breeze)
    const flagT = paint(128, 256, (g, W, H) => { g.fillStyle = COL.flag; g.fillRect(0, 0, W, H); g.fillStyle = COL.flagEdge; g.fillRect(0, 0, W, 10); g.fillRect(0, 0, 10, H); g.fillRect(W - 10, 0, 10, H); g.fillStyle = "rgba(220,170,80,0.85)"; g.beginPath(); g.arc(W / 2, H * 0.36, 22, 0, 7); g.fill(); g.fillStyle = COL.flag; g.beginPath(); g.arc(W / 2, H * 0.36, 13, 0, 7); g.fill(); });
    const mF = Mk.K.flat("#ffffff", { map: flagT, rough: 0.9, side: THREE.DoubleSide });
    const poles: [number, number][] = [[kx0 - 1.4, -20], [kx1 + 1.4, -22], [kx0 - 1.6, -31], [kx1 + 1.5, -33], [kx0 - 2.0, -44], [kx1 + 2.2, -47]];
    poles.forEach(([x, z], i) => {
      const y = landH(x, z), h = 4.2;
      B.add(pole, new THREE.CylinderGeometry(0.06, 0.07, h, 6).translate(x, y + h / 2, z));
      const c = makeCloth(mF, 0.75, 1.5, { nx: 4, ny: 6, ph: i * 1.3, tails: 0.18 });
      c.mesh.position.set(x + 0.4 * (x < RX ? 1 : -1), y + h - 0.1, z); c.mesh.name = "road.banner"; group.add(c.mesh); banners.push(c);
      void r;
    });
    B.flush(group, "road.poles", true, true);
  }

  // =================================================================================================== THE HEAT
  const mirage = mirageTex(), haze = hazeTex();
  const mMir = Mk.basic(COL.mirage, { map: mirage, additive: true, opacity: 0.5 });
  const mirMesh = new THREE.Mesh(levelQuad(kx0 - 1.5, kx1 + 1.5, -95, -34, 0.06, (x, z) => [(x - kx0) / RW.w, -z / 9]), mMir);
  mirMesh.name = "road.mirage"; mirMesh.layers.set(NOINK); mirMesh.renderOrder = 3; group.add(mirMesh);
  const mHaze = Mk.basic(COL.haze, { map: haze, transparent: true, opacity: 0.6, depthWrite: false });
  const hazeMesh = new THREE.Mesh(new THREE.PlaneGeometry(240, 6).translate(RX, 2.4, -78), mHaze);
  hazeMesh.name = "road.haze"; hazeMesh.layers.set(NOINK); hazeMesh.renderOrder = 3; group.add(hazeMesh);
  haze.repeat.set(4, 1);

  // =================================================================================================== the far view
  {
    const Z = S.dunes.z, x0 = RX - 140, x1 = RX + 140, y0 = S.dunes.y0, y1 = S.dunes.y1 + 6;
    const card = farCard(x0, x1, y0, y1, Z, 2048, Math.round(2048 * (y1 - y0) / (x1 - x0)), (g: G2, k) => {
      g.clearRect(0, 0, k.W, k.H);
      const r = rng(319);
      // dune ranges: far (pale, hazy) to near (warm, a lit face and a shaded face each)
      const range = (base: number, amp: number, n: number, lit: string, dark: string, ph: number) => {
        const crest: [number, number][] = [];
        for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * (i / n), hh = base + amp * (0.55 + 0.45 * Math.sin(i * 1.7 + ph) * Math.sin(i * 0.6 + ph * 2)); crest.push([x, hh]); }
        g.fillStyle = dark; g.beginPath(); g.moveTo(0, k.H); crest.forEach(([x, hh]) => g.lineTo(k.px(x), k.py(hh))); g.lineTo(k.W, k.H); g.closePath(); g.fill();
        // the lit faces: from each crest down its left slope
        g.fillStyle = lit;
        for (let i = 0; i < n; i++) { const [xa, ha] = crest[i], [xb, hb] = crest[i + 1]; const hi = ha > hb ? [xa, ha] : [xb, hb]; g.beginPath(); g.moveTo(k.px(hi[0]), k.py(hi[1])); g.lineTo(k.px(xa), k.py(Math.min(ha, hb) - 0.6)); g.lineTo(k.px(xb), k.py(Math.min(ha, hb) - 0.6)); g.closePath(); g.fill(); }
      };
      range(5.5, 6, 18, "#efdcbc", COL.duneFar, 0.4);
      range(2.5, 5, 26, COL.dune, "#e2b47a", 1.7);
      range(0.5, 3, 34, "#f2cc90", COL.duneLo, 2.9);
      // the heat band at the foot
      const hz = g.createLinearGradient(0, k.py(4), 0, k.py(y0)); hz.addColorStop(0, "rgba(250,240,220,0)"); hz.addColorStop(1, "rgba(250,240,220,0.65)"); g.fillStyle = hz; g.fillRect(0, k.py(4), k.W, k.py(y0) - k.py(4));
      for (let i = 0; i < 30; i++) blotch(g, k.W * r(), k.py(0.5 + 2 * r()), 40 + 60 * r(), "#fff4dc", 0.25);
    });
    (card.material as THREE.MeshBasicMaterial).transparent = true;
    card.name = "road.far"; group.add(card);
  }
  group.add(skyDome(new THREE.Vector3(RX, 0, 0), SKY, (g, W, H) => {
    const r = rng(321), elY = (el: number) => H * (90 - el) / 180;
    // thin wisps (cirrus), never thick clouds: the sky is empty and hot
    for (let i = 0; i < 40; i++) {
      const x = W * r(), y = elY(10 + 40 * r()), w = 80 + 200 * r();
      soft(g, 5, () => { g.strokeStyle = css("#ffffff", 0.45 + 0.3 * r()); g.lineWidth = 4 + 6 * r(); g.lineCap = "round"; g.beginPath(); g.moveTo(x - w / 2, y); g.quadraticCurveTo(x, y - 10 - 10 * r(), x + w / 2, y + 4); g.stroke(); });
    }
  }));

  // =================================================================================================== the light
  lightRig(group, { dir: [0.4, 0.82, 0.4], k: 2.3, col: "#fff0d6", at: [RX, 0, -5], half: 10, hemi: ["#dfe6ee", "#b08e60", 0.95], point: { col: "#ffffff", k: 0, at: [RX, 2, 0], dist: 4 } });

  let clock = 0, heat = 1;
  const pose = (t: number) => {
    grass.update(t, 1);
    for (const b of banners) b.sway(t * 0.9, 0.18);
    mirage.offset.set(0.04 * Math.sin(t * 0.7), -t * 0.08);
    mMir.opacity = 0.5 * heat * (0.85 + 0.15 * Math.sin(t * 1.9));
    haze.offset.set(t * 0.012, 0.03 * Math.sin(t * 1.3));
    mHaze.opacity = 0.6 * heat;
  };
  pose(0);
  return {
    group,
    animate(t: number) { clock = t; pose(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "heat") { heat = Math.max(0, Math.min(1, Number(v))); pose(clock); }
      // "flies": WP3's fish cart / basket props draw the flies (put({ on })); the set has nothing to switch
    },
  };
}
