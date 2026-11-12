// THE MAP OF THE FIFTEEN CITIES (12b-15): a hanging scroll on the hall's map stand (sets/hall.ts setMapStand). WP5.
//   w.prop("mapScroll").put(HALL.mapBar, { open })     origin = the middle of the TOP roller; the sheet faces +z
//
// What it is (BIBLE 7): two dark-wood rollers 0.95 long, Ø 0.04, with gold caps; the top roller hangs from the stand's
// bar (the bar's underside is 5 mm into it: sets/hall.ts), the bottom roller hangs MAP.drop0 (open 0, rolled up) to
// MAP.drop1 (open 1, the sheet hangs open) below it. The silk unrolls from the bottom roller: at open k the TOP part of
// the map shows at its full size (the texture is cropped, never stretched) and the rest is still rolled round the
// bottom roller (a silk roll that thins as it opens). On the silk, painted: a brown mounting band, a dotted frame,
// Qin (the west, -x, grey-black) and Zhao (the north-east, teal), the Yellow River down the frontier between them and
// east along the bottom, the Wei inside Qin, a few hills, and the 15 cities as cream dots ringed in black in Qin's
// north-east, along its frontier with Zhao, in the top third of the sheet. No writing on the map (the English film
// shows the same sheet). MAP_CITIES = those 15 dots in the prop's own axes: the cities HUD (hud "map" mode) lights
// them through w.project (mapCitiesWorld()).
// Hands: the official holds the BOTTOM roller at MAP_HANDS (x +-0.25) from his kneel; the king pulls it down by its
// middle. holdPoints("mapScroll", ...) in props/index.ts gives the world points for any `open`.
// INK: the rollers, caps and the silk roll are kit Parts with their own hull (layer NOINK); the silk sheet is a cloth
// with no hull: its edge is painted (a dark line round the mounting band), as the kit's flags and banners do.
import * as THREE from "three";
import { C, Part, paint, turned, NOINK, type Kit, type G2 } from "../../../kit/props/kit";

/** the map's sizes (m): roller length and radius, the sheet (silk) width and its whole length, the bottom roller's
 *  drop below the top one at open 0 and at open 1, the sheet's plane in front of the rollers' axis (z) */
export const MAP = { roller: 0.95, r: 0.02, sheetW: 0.85, sheetH: 0.6, drop0: 0.10, drop1: 0.60, z: 0.008, cap: 0.035 };
/** how far below the origin the bottom roller's axis hangs at `open` (0..1) */
export const mapDrop = (open = 1) => MAP.drop0 + (MAP.drop1 - MAP.drop0) * Math.max(0, Math.min(1, open));
/** the official's two hands on the BOTTOM roller, relative to its middle (prop axes): x -+0.25 (BIBLE 3, reach-checked by WP1b) */
export const MAP_HANDS: [number, number, number][] = [[-0.25, 0, 0], [0.25, 0, 0]];

// ---------------------------------------------------------------------------------------------------- the painting
/** the painting's coordinates: u 0 (the west edge, -x) .. 1 (east), v 0 (the top, at the top roller) .. 1 (the bottom
 *  roller at open 1). Sheet point = ((u - 0.5) * sheetW, -v * sheetH, z). */
type UV = [number, number];
/** the map field inside the mounting band */
const FIELD = { u0: 0.035, u1: 0.965, v0: 0.085, v1: 0.93 };
/** Qin: the west, its east edge running down the Yellow River's frontier */
const QIN: UV[] = [[0.05, 0.12], [0.2, 0.11], [0.35, 0.11], [0.47, 0.115], [0.52, 0.16], [0.535, 0.30], [0.54, 0.45], [0.545, 0.60], [0.55, 0.70], [0.52, 0.80], [0.47, 0.88], [0.30, 0.905], [0.05, 0.90]];
/** Zhao: the north-east, east of the river */
const ZHAO: UV[] = [[0.6, 0.12], [0.75, 0.11], [0.93, 0.12], [0.94, 0.33], [0.92, 0.50], [0.82, 0.555], [0.70, 0.54], [0.62, 0.50], [0.595, 0.38], [0.59, 0.24]];
/** the other states (south of Zhao, east of Qin): faint dotted borders only */
const OTHERS: UV[][] = [[[0.6, 0.62], [0.72, 0.60], [0.83, 0.62], [0.94, 0.60]], [[0.76, 0.75], [0.78, 0.92]]];
/** the Yellow River: down the frontier from the north, then east along the bottom of Zhao's neighbours */
const HUANGHE: UV[] = [[0.565, 0.09], [0.558, 0.18], [0.565, 0.30], [0.57, 0.44], [0.572, 0.58], [0.58, 0.69], [0.635, 0.715], [0.72, 0.70], [0.82, 0.715], [0.965, 0.70]];
/** the Wei, inside Qin, into the river's bend */
const WEI: UV[] = [[0.035, 0.80], [0.14, 0.785], [0.27, 0.79], [0.40, 0.765], [0.50, 0.745], [0.575, 0.705]];
/** a few hills (little peaks), in the pale parts and in Zhao */
const HILLS: UV[] = [[0.67, 0.30], [0.71, 0.26], [0.745, 0.32], [0.70, 0.83], [0.66, 0.86], [0.87, 0.82]];
/** THE FIFTEEN CITIES (u, v): three rows of five in Qin's NORTH-EAST, along its frontier with Zhao (jittered, no
 *  grid). They stay in the top third of the sheet (v <= 0.33), where nothing covers them in `map` and `stageTwo`: the
 *  official who holds the bottom roller from a high kneel has his head and cap over the sheet's lower middle */
const CITIES_UV: UV[] = [
  [0.205, 0.158], [0.282, 0.150], [0.352, 0.163], [0.424, 0.150], [0.486, 0.172],
  [0.170, 0.232], [0.245, 0.240], [0.320, 0.228], [0.392, 0.243], [0.462, 0.236],
  [0.208, 0.318], [0.283, 0.310], [0.356, 0.322], [0.428, 0.308], [0.494, 0.320],
];
const SILK = "#efe4c8", MOUNT = "#9b7d52", MOUNT_LO = "#7a6040", EDGE = "#3a3040", QIN_COL = "#625c66", ZHAO_COL = "#5aa8a2";
const SILK_BACK = "#e3d5b2", RIVER = "#8aa1b4", DOTS = "#5b4a3a", CITY = "#f1ead5", CITY_RING = "#2e2a33";
/** the sheet's point of a painting coordinate, in the prop's axes (z = just in front of the silk) */
const onSheet = ([u, v]: UV, dz = 0.0015): [number, number, number] => [(u - 0.5) * MAP.sheetW, -v * MAP.sheetH, MAP.z + dz];
/** the 15 cities in the prop's axes at open 1 (x across, y down from the top roller, z = on the sheet's face) */
export const MAP_CITIES: [number, number, number][] = CITIES_UV.map((c) => onSheet(c));

const TW = 1024, TH = Math.round((TW * MAP.sheetH) / MAP.sheetW);   // 1024 x 723 px: 1.2 px per mm
const mapTex = () => paint(TW, TH, (g: G2, w, h) => {
  const X = (u: number) => u * w, Y = (v: number) => v * h, px = w / MAP.sheetW / 1000;   // px per mm
  const poly = (pts: UV[]) => { g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo(X(u), Y(v)) : g.moveTo(X(u), Y(v)))); g.closePath(); };
  /** a smooth line through the points (quadratic midpoints) */
  const curve = (pts: UV[]) => {
    g.beginPath(); g.moveTo(X(pts[0][0]), Y(pts[0][1]));
    for (let i = 1; i < pts.length - 1; i++) { const [u, v] = pts[i], [u2, v2] = pts[i + 1]; g.quadraticCurveTo(X(u), Y(v), X((u + u2) / 2), Y((v + v2) / 2)); }
    const [ul, vl] = pts[pts.length - 1]; g.lineTo(X(ul), Y(vl));
  };
  /** dots along a polyline, every `step` mm */
  const dotted = (pts: UV[], closed: boolean, r: number, step: number, col: string) => {
    g.fillStyle = col; const P = closed ? [...pts, pts[0]] : pts; let carry = 0;
    for (let i = 0; i + 1 < P.length; i++) {
      const ax = X(P[i][0]), ay = Y(P[i][1]), bx = X(P[i + 1][0]), by = Y(P[i + 1][1]), L = Math.hypot(bx - ax, by - ay), s = step * px;
      for (let d = carry; d < L; d += s) { g.beginPath(); g.arc(ax + ((bx - ax) * d) / L, ay + ((by - ay) * d) / L, r * px, 0, Math.PI * 2); g.fill(); carry = d + s - L; }
    }
  };
  // the mounting: a brown silk band all round, a darker line inside it, and the dark edge (the cloth has no hull)
  g.fillStyle = MOUNT; g.fillRect(0, 0, w, h);
  g.fillStyle = SILK; g.fillRect(X(FIELD.u0), Y(FIELD.v0), X(FIELD.u1 - FIELD.u0), Y(FIELD.v1 - FIELD.v0));
  g.strokeStyle = MOUNT_LO; g.lineWidth = 4 * px; g.strokeRect(X(FIELD.u0), Y(FIELD.v0), X(FIELD.u1 - FIELD.u0), Y(FIELD.v1 - FIELD.v0));
  g.strokeStyle = EDGE; g.lineWidth = 7 * px * 2; g.strokeRect(0, 0, w, h);                       // half of it shows: 7 mm
  // the lands
  g.fillStyle = QIN_COL; poly(QIN); g.fill();
  g.fillStyle = ZHAO_COL; poly(ZHAO); g.fill();
  // the rivers (round ends), over the lands
  g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = RIVER;
  g.lineWidth = 9 * px; curve(HUANGHE); g.stroke();
  g.lineWidth = 6 * px; curve(WEI); g.stroke();
  // the frontiers: dotted, in the brown ink (on Qin's and Zhao's own edges, and the other states' lines)
  dotted(QIN, true, 1.6, 8, DOTS); dotted(ZHAO, true, 1.6, 8, DOTS);
  for (const o of OTHERS) dotted(o, false, 1.4, 8, DOTS);
  // a few hills: little brown peaks
  g.strokeStyle = DOTS; g.lineWidth = 2.6 * px;
  for (const [u, v] of HILLS) { const s = 14 * px; g.beginPath(); g.moveTo(X(u) - s, Y(v) + s * 0.55); g.lineTo(X(u), Y(v) - s * 0.55); g.lineTo(X(u) + s, Y(v) + s * 0.55); g.stroke(); }
  // the dotted frame of the field
  const f = FIELD, i0 = 0.012;
  dotted([[f.u0 + i0, f.v0 + i0 * 1.4], [f.u1 - i0, f.v0 + i0 * 1.4], [f.u1 - i0, f.v1 - i0 * 1.4], [f.u0 + i0, f.v1 - i0 * 1.4]], true, 1.8, 7, DOTS);
  // THE FIFTEEN CITIES: cream dots ringed in black (the HUD lights them gold one by one)
  for (const c of CITIES_UV) {
    g.beginPath(); g.arc(X(c[0]), Y(c[1]), 8.5 * px, 0, Math.PI * 2); g.fillStyle = CITY; g.fill();
    g.lineWidth = 3.2 * px; g.strokeStyle = CITY_RING; g.stroke();
  }
});

// ---------------------------------------------------------------------------------------------------- the prop
export type MapHook = (o: { open?: number }) => void;
/** builds the map scroll into g (origin = the middle of the top roller, the sheet facing +z); the hook sets `open` */
export const mapScroll = (K: Kit, g: THREE.Group): MapHook => {
  const wood = K.flat("#5a4030", { rough: 0.55 }), gold = K.flat(C.gold, { rough: 0.4 }), half = MAP.roller / 2;
  /** a roller along x: the wood between two gold caps, round-ended (one hull over all three) */
  const roller = (P: Part) => {
    const body = new THREE.CylinderGeometry(MAP.r, MAP.r, MAP.roller - 2 * MAP.cap + 0.01, 20).rotateZ(Math.PI / 2);
    const capGeo = (s: number) => turned([[0, 0], [MAP.r + 0.001, 0], [MAP.r + 0.001, MAP.cap - 0.012], [MAP.r - 0.004, MAP.cap - 0.003], [0, MAP.cap]], 20).rotateZ(-s * Math.PI / 2).translate(s * (half - MAP.cap), 0, 0);
    P.shell([[wood, body], [gold, capGeo(1)], [gold, capGeo(-1)]], 0.0045);
  };
  const top = new Part(K); roller(top); top.into(g, "mapScroll.top");
  const bot = new THREE.Group(); bot.name = "mapScroll.bottomRoller"; g.add(bot);
  const pb = new Part(K); roller(pb); pb.into(bot, "mapScroll.bottom");
  // the silk still rolled round the bottom roller: built at the open-0 radius, thinned by scaling its section
  const ROLL_R = MAP.r + 0.012, roll = new THREE.Group(); roll.name = "mapScroll.roll"; bot.add(roll);
  new Part(K).add(K.flat(SILK_BACK, { rough: 0.85 }), new THREE.CylinderGeometry(ROLL_R, ROLL_R, MAP.sheetW, 24).rotateZ(Math.PI / 2), 0.0045).into(roll, "mapScroll.roll");
  // the sheet: a quad whose top is at the top roller and whose bottom is at the bottom roller; its uv is cropped
  const geo = new THREE.BufferGeometry();
  const sw = MAP.sheetW / 2, pos = new Float32Array([-sw, 0, MAP.z, sw, 0, MAP.z, -sw, -1, MAP.z, sw, -1, MAP.z]);
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]), 3));
  const uv = new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), 2); geo.setAttribute("uv", uv);
  geo.setIndex([0, 2, 1, 1, 2, 3]);
  const sheet = new THREE.Mesh(geo, K.flat("#ffffff", { map: mapTex(), rough: 0.9, side: THREE.DoubleSide }));
  sheet.name = "mapScroll.sheet"; sheet.layers.set(NOINK); sheet.castShadow = true; sheet.receiveShadow = true; sheet.frustumCulled = false;
  g.add(sheet);
  return (o) => {
    const k = Math.max(0, Math.min(1, o.open ?? 1)), drop = mapDrop(k);
    bot.position.set(0, -drop, 0);
    pos[7] = pos[10] = -drop; geo.attributes.position.needsUpdate = true;
    uv.setY(2, 1 - drop / MAP.sheetH); uv.setY(3, 1 - drop / MAP.sheetH); uv.needsUpdate = true;
    geo.computeBoundingBox(); geo.computeBoundingSphere();
    // the roll: all the unseen silk (open 0) .. none (open 1: hidden, the bare roller)
    const left = 1 - (drop - MAP.drop0) / (MAP.drop1 - MAP.drop0), rr = MAP.r + 0.012 * Math.sqrt(left);
    roll.visible = left > 0.04; roll.scale.set(1, rr / ROLL_R, rr / ROLL_R);
  };
};
