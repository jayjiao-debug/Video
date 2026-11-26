// THE ROOF (place "roof", island x 200): 29 Oct 1937, first light. The men stand in rows; a flag goes up a pole made of
// two bamboo poles lashed together. THE FLAG IS NEVER DRAWN: the film shows its SHADOW crossing the roof to the men's
// boots (the lens stays on their faces), and the south bank seeing it (hats in the air on every roof across the creek).
// Local: the roof 26 x 17 m, floor y 0, a parapet 1 m high all round; south = -z (the creek 25 m below, the Settlement
// beyond); the low sun in the east-south-east (+x): shadows run west. The pole stands at (7, -6).
// PARAMS  raise 0..1 (how far up the pole the flag is: its shadow slides away from the pole's foot)   cheer 0..1
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig } from "../../../kit/sets/okit";
import { levelQuad, tileUV, bar } from "../../romeo/sets/parts/b_common";
import { ISLAND } from "../places";
import { maker, boxG, paint, rng, css, blotch, NOINK, V, concreteTex, crateTex, stackSacks, sackMats, buildBank } from "./common";

const X0 = ISLAND.roof;
export const ROOF = { x0: -13, x1: 13, z0: -8, z1: 9, par: 1.0, pole: [7, -6] as [number, number], elev: 25, drop: 25 } as const;
/** toward the sun (horizontal part), and where its shadows run */
const SH = (() => { const a = V(0.948, 0, -0.317).normalize(); return { sun: a, dir: a.clone().negate(), perp: V(-a.z, 0, a.x).negate() }; })();
const TAN = Math.tan((ROOF.elev * Math.PI) / 180);
/** where the shadow of a point `h` m up the pole falls on the roof (local) */
export const poleShadow = (h: number): [number, number, number] => [ROOF.pole[0] + SH.dir.x * (h / TAN), 0, ROOF.pole[1] + SH.dir.z * (h / TAN)];
/** the flag's height on the pole (its lower edge) for raise 0..1 */
export const flagH = (raise: number) => 1.2 + 3.5 * raise;

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.3, 0.3, 0.34]], [0, [0.6, 0.6, 0.66]], [90, [0.62, 0.68, 0.8]]],
  boxes: [{ az: 100, el: 20, rot: 0, w: 40, h: 24, soft: 18, col: [1.2, 0.98, 0.78] }],
};
const LOOK: PlaceLook = {
  bg: "#8a97ae",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.6, color: "#2a2c3a" },
  cast: { key: [0.82, 0.42, -0.2], tint: [1.0, 0.9, 0.78], tintK: 0.6, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.92, 1.0], shade: [0.98, 0.96, 1.36], shadeK: 0.42, wrap: [30, 60], edge: 0.14, broad: 0.2, bodySat: 0.13, sheen: 0.14, lift: 0.03, contactLen: 0.3, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.35,
};
const PARAMS: Record<string, ParamValue> = { raise: 0, cheer: 0 };

const roofTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(61); g.fillStyle = "#77736c"; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 50; i++) blotch(g, W * r(), H * r(), W * (0.05 + 0.13 * r()), r() < 0.5 ? "#5f5c57" : "#8c8880", 0.16);
  g.strokeStyle = css("#3c3a38", 0.5); g.lineWidth = 5; g.strokeRect(0, 0, W, H);   // tar seams
}, true);

const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "roof";
  const Mk = maker(K, group), X = (x: number) => X0 + x, R = ROOF;
  const mPar = Mk.tex(concreteTex(21, "#9a968c"), 0.95), mFloor = Mk.tex(roofTex(), 0.95), mHut = Mk.tex(concreteTex(22, "#8c887e"), 0.95);
  Mk.mesh("roof.floor", levelQuad(X(R.x0 - 0.4), X(R.x1 + 0.4), R.z0 - 0.4, R.z1 + 0.4, 0, (x, z) => [x / 2.6, -z / 2.6]), mFloor, { cast: false });
  const par = (x0: number, x1: number, z0: number, z1: number) => Mk.mesh("roof.parapet", tileUV(boxG(X(x0), X(x1), -0.4, R.par, z0, z1), 3), mPar);
  par(R.x0 - 0.4, R.x1 + 0.4, R.z0 - 0.4, R.z0); par(R.x0 - 0.4, R.x1 + 0.4, R.z1, R.z1 + 0.4); par(R.x0 - 0.4, R.x0, R.z0, R.z1); par(R.x1, R.x1 + 0.4, R.z0, R.z1);
  // the stair head (north-west), a water tank on legs (north-east), a vent or two
  Mk.mesh("roof.hut", tileUV(boxG(X(-12.6), X(-8.6), 0, 2.7, 4.4, 8.6), 3), mHut);
  Mk.mesh("roof.hut.cap", boxG(X(-12.9), X(-8.3), 2.7, 2.85, 4.1, 8.9), mPar);
  Mk.mesh("roof.hut.door", new THREE.PlaneGeometry(1.0, 2.0).rotateY(Math.PI / 2).translate(X(-8.59), 1.0, 6.4), Mk.basic("#14161c"), { cast: false, receive: false, noink: true });
  const P = new Part(K), mIron = Mk.flat("#4a4c50", 0.6), mWood = Mk.tex(crateTex(23, "#6e5a44"), 0.85);
  P.add(mWood, new THREE.CylinderGeometry(1.5, 1.5, 2.0, 20).translate(X(9.5), 3.0, 6.2), 0.008);
  P.add(mIron, new THREE.ConeGeometry(1.62, 0.6, 20).translate(X(9.5), 4.3, 6.2), 0.006);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) P.add(mIron, boxG(X(9.5 + dx * 1.0) - 0.06, X(9.5 + dx * 1.0) + 0.06, 0, 2.0, 6.2 + dz * 1.0 - 0.06, 6.2 + dz * 1.0 + 0.06), 0.005);
  P.add(mPar, boxG(X(1.5), X(2.5), 0, 0.7, 5.5, 6.5), 0.006); P.add(mIron, new THREE.CylinderGeometry(0.2, 0.2, 0.9, 12).translate(X(2.0), 1.1, 6.0), 0.005);
  // sacks along the south and west parapets (the roof's posts), a machine-gun nest's ring at the south-west corner
  const sm = sackMats(K);
  stackSacks(P, sm, { x0: X(-12.6), x1: X(-7.2), y0: 0, rows: 5, z: R.z0 + 0.25, seed: 31 });
  stackSacks(P, sm, { x0: X(8.6), x1: X(12.6), y0: 0, rows: 4, z: R.z0 + 0.25, seed: 32 });
  stackSacks(P, sm, { x0: -6.5, x1: -1.5, y0: 0, rows: 5, z: X(R.x0 + 0.25), alongZ: true, seed: 33 });
  // THE POLE: two bamboo poles lashed together (the top stays out of every frame), stayed with three ropes, its foot in sacks
  const mBam = Mk.flat("#b9a56a", 0.7), mRope = Mk.flat("#9a8a62", 0.9), px = X(R.pole[0]), pz = R.pole[1];
  P.add(mBam, new THREE.CylinderGeometry(0.035, 0.05, 4.2, 10).translate(px, 2.1, pz), 0.005);
  P.add(mBam, new THREE.CylinderGeometry(0.028, 0.036, 4.0, 10).translate(px + 0.05, 5.4, pz), 0.005);
  for (const y of [3.5, 3.75, 4.0]) P.add(mRope, new THREE.TorusGeometry(0.06, 0.014, 6, 12).rotateX(Math.PI / 2).translate(px + 0.025, y, pz), 0.003);
  for (const [dx, dz] of [[2.2, 1.2], [-1.6, 1.9], [0.4, -1.9]]) P.add(mRope, bar(V(px, 3.3, pz), V(px + dx, 0.02, pz + dz), 0.008, 0.008, 5), 0);
  stackSacks(P, sm, { x0: px - 0.66, x1: px + 0.66, y0: 0, rows: 2, z: pz + 0.3, seed: 34 }); stackSacks(P, sm, { x0: px - 0.66, x1: px + 0.66, y0: 0, rows: 2, z: pz - 0.3, seed: 35 });
  P.into(group, "roof.dressing", { cast: true, receive: true });

  // THE SHADOWS: the pole's (a long thin strip) and the flag's (a strip of cloth's shadow, rippling), on the floor
  const mShade = new THREE.MeshBasicMaterial({ color: "#232a44", transparent: true, opacity: 0.5, depthWrite: false, fog: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const mk = (g: THREE.BufferGeometry, name: string) => { const m = new THREE.Mesh(g, mShade); m.name = name; m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.renderOrder = 3; m.frustumCulled = false; group.add(m); return m; };
  const poleLen = 9.4 / TAN, pg = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const poleSh = mk(pg, "roof.shadow.pole");
  { const mid = V(px, 0.004, pz).addScaledVector(SH.dir, poleLen / 2); poleSh.position.copy(mid); poleSh.scale.set(poleLen, 1, 0.11); poleSh.rotation.y = Math.atan2(-SH.dir.z, SH.dir.x); }
  const NU = 14, NV = 8, FW = 2.3, FL = 1.55 / TAN;
  const fgeo = new THREE.PlaneGeometry(1, 1, NU, NV), fpos = fgeo.attributes.position as THREE.BufferAttribute;
  const flagSh = mk(fgeo, "roof.shadow.flag");
  let raise = 0;
  const bank = buildBank(X0, R.z0 - 0.4, -R.drop); bank.setMode("dawn"); group.add(bank.group);
  // the street far below on the near side and the parapet's outer face are never seen; a floor far below closes the gap
  Mk.mesh("roof.below", new THREE.PlaneGeometry(200, 14).rotateX(-Math.PI / 2).translate(X(0), -R.drop + 0.05, R.z0 - 5), Mk.basic("#6f7480"), { cast: false, receive: false, noink: true });
  // THE WEST (behind the men): the sky over the burnt quarter, smoke standing in it
  const westTex = paint(512, 512, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#56627c"); gr.addColorStop(0.62, "#8f97ad"); gr.addColorStop(0.8, "#b7a7a4"); gr.addColorStop(1, "#8d8790");
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = rng(63);
    for (let k = 0; k < 7; k++) { let x = W * (0.08 + 0.84 * r()), y = H * 0.8; for (let i = 0; i < 26; i++) { blotch(g, x, y, W * (0.025 + 0.004 * i), "#5a5a66", 0.16); x += W * (0.006 + 0.01 * r()); y -= H * 0.02; } }
  });
  Mk.mesh("roof.west.sky", new THREE.PlaneGeometry(700, 260).rotateY(Math.PI / 2).translate(X(-190), 130 - 52, 0), Mk.basic("#ffffff", { map: westTex }), { cast: false, receive: false, noink: true });
  Mk.mesh("roof.north.sky", new THREE.PlaneGeometry(700, 260).rotateY(Math.PI).translate(X(0), 130 - 52, 190), Mk.basic("#7f8aa2"), { cast: false, receive: false, noink: true });
  const Lr = lightRig(group, { dir: [SH.sun.x * Math.cos(0.436), Math.sin(0.436), SH.sun.z * Math.cos(0.436)], k: 2.6, col: "#ffd9b0", at: [X(0), 0, -2], half: 12, hemi: ["#aab6cc", "#5e5c60", 0.95], point: { col: "#ffffff", k: 0, at: [X(0), 3, 0], dist: 4 } });
  void Lr;
  const flagAt = (t: number) => {
    const h = flagH(raise), s0 = h / TAN;
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const u = i / NU, v = j / NV, k = j * (NU + 1) + i;
      // u: out from the pole (the cloth's fly), v: up the cloth (further along the shadow)
      const wave = 0.16 * u * Math.sin(u * 7.5 - t * 6.2 + v * 1.4) + 0.07 * u * Math.sin(u * 15 - t * 9.1);
      const sag = -0.35 * u * u * (1 - 0.5 * Math.sin(t * 1.7));
      const along = s0 + (v + wave * 0.5) * FL + sag, across = u * FW * (0.9 + 0.1 * Math.sin(t * 2.3 + v));
      fpos.setXYZ(k, px + SH.dir.x * along + SH.perp.x * across, 0.005, pz + SH.dir.z * along + SH.perp.z * across);
    }
    fpos.needsUpdate = true;
  };
  flagAt(0);
  return {
    group,
    animate(t: number) { bank.animate(t); flagAt(t); },
    setParam(name: string, v: ParamValue) {
      if (name === "raise") raise = Math.max(0, Math.min(1, Number(v)));
      else if (name === "cheer") bank.setCheer(Number(v));
    },
    cast(): Partial<CastLight> { return {}; },
  };
};

export const ROOF_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };
