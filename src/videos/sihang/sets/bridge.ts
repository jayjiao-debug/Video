// THE BRIDGE (place "bridge", island x 400): 31 Oct 1937, before dawn. 新垃圾桥 over the Suzhou Creek: the men cross it
// at a run under a searchlight and machine-gun fire, into the Settlement, where they hand in their rifles.
// Local: the deck runs along z, 10 m wide, y 0; NORTH (+z 26) the warehouse stands dark behind them (a painted block);
// SOUTH (-z -27) the Settlement's cordon: sandbags, wire trestles pulled aside, a street lamp, people behind the rail.
// THE ENEMY IS NEVER DRAWN: only the searchlight's beam and the tracers' streaks.
// PARAMS  beam 0..1 (the searchlight on the deck; it sweeps with t)   tracer 0..1   flash 0..1 (the figures' lift in the beam)
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import { Part } from "../../../kit/props/kit";
import type { PlaceDef } from "../../../kit/day/sets";
import { BAKED_LIGHT } from "../../../kit/day/sets";
import type { CastLight } from "../../group/kit/cast";
import type { EnvSpec } from "../../bt/pbr";
import type { PlaceBuild, PlaceLook, ParamValue } from "../../../kit/day/types";
import { lightRig } from "../../../kit/sets/okit";
import { levelQuad, tileUV, lightPool as pool } from "../../romeo/sets/parts/b_common";
import { ISLAND } from "../places";
import { maker, boxG, paint, rng, css, blotch, NOINK, V, concreteTex, stackSacks, sackMats, buildBank, glowCard } from "./common";

const X0 = ISLAND.bridge;
export const BRIDGE = { hw: 5, zn: 26, zs: -27, lamp: [3.6, 4.4, -24.5] as [number, number, number], cordon: -22.5 } as const;

const FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.12, 0.12, 0.15]], [0, [0.2, 0.2, 0.26]], [90, [0.22, 0.24, 0.34]]],
  boxes: [{ az: 180, el: 30, rot: 0, w: 30, h: 16, soft: 14, col: [0.75, 0.62, 0.5] }],
};
const LOOK: PlaceLook = {
  bg: "#0a0d1c",
  ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 1.7, color: "#0c0c16" },
  cast: { key: [0.3, 0.6, -0.7], tint: [0.9, 0.9, 1.0], tintK: 0.6, gain: 0.82, grad: 0.24, bodyGrad: 0.16, sideTint: [0.88, 0.9, 1.0], shade: [0.98, 0.95, 1.45], shadeK: 0.46, wrap: [30, 62], edge: 0.14, broad: 0.3, bodySat: 0.12, sheen: 0.2, lift: 0.02, contactLen: 0.15, ...BAKED_LIGHT } as unknown as CastLight,
  fill: FILL,
  bloom: 0.6,
};
const PARAMS: Record<string, ParamValue> = { beam: 0, tracer: 0, flash: 0 };

const deckTex = () => paint(512, 512, (g, W, H) => {
  const r = rng(71); g.fillStyle = "#3e4048"; g.fillRect(0, 0, W, H);
  const n = 8, s = W / n;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { g.fillStyle = css(r() < 0.5 ? "#353740" : "#484a54", 0.6); g.fillRect(a * s + 2, b * s + (a % 2 ? s / 2 : 0) + 2, s - 4, s - 4); }
  for (let i = 0; i < 30; i++) blotch(g, W * r(), H * r(), W * 0.12, r() < 0.5 ? "#2a2c34" : "#565862", 0.14);
}, true);
/** a steel lattice rail (alpha): verticals, a top chord, crossed braces */
const railTex = () => paint(256, 128, (g, W, H) => {
  g.clearRect(0, 0, W, H); g.strokeStyle = "#ffffff"; g.fillStyle = "#ffffff";
  g.fillRect(0, 0, W, 14); g.fillRect(0, H - 12, W, 12); g.fillRect(0, 0, 12, H); g.fillRect(W - 12, 0, 12, H);
  g.lineWidth = 8; g.beginPath(); g.moveTo(6, 10); g.lineTo(W - 6, H - 8); g.moveTo(W - 6, 10); g.lineTo(6, H - 8); g.stroke();
  g.fillRect(W / 2 - 4, 0, 8, H);
}, true);
/** the warehouse seen from the bridge at night: a five-storey block, its windows black, scars, smoke, a little fire light */
const houseTex = () => paint(1024, 512, (g, W, H) => {
  const r = rng(81); g.clearRect(0, 0, W, H);
  g.fillStyle = "#1a1e2e"; g.fillRect(0, H * 0.1, W, H * 0.9);
  for (let i = 0; i < 40; i++) blotch(g, W * r(), H * (0.1 + 0.9 * r()), W * 0.08, r() < 0.5 ? "#10131e" : "#262b3e", 0.3);
  const fl = 5, bays = 16, fh = (H * 0.86) / fl, bw = W / bays;
  for (let j = 0; j < fl; j++) for (let i = 0; i < bays; i++) {
    const x = i * bw + bw * 0.2, y = H * 0.14 + j * fh + fh * 0.18;
    g.fillStyle = "#07080e"; g.fillRect(x, y, bw * 0.6, fh * 0.56);
    if (r() < 0.75) { g.fillStyle = "#24252a"; g.fillRect(x, y + fh * 0.2, bw * 0.6, fh * 0.36); }           // sacks in the window
    if (r() < 0.07) { g.fillStyle = "rgba(255,150,70,0.5)"; g.fillRect(x, y, bw * 0.6, fh * 0.2); }
  }
  g.fillStyle = "#222738"; g.fillRect(0, H * 0.1, W, H * 0.03);
  for (let i = 0; i < 22; i++) { g.fillStyle = "rgba(6,7,12,0.7)"; g.beginPath(); g.arc(W * r(), H * (0.2 + 0.7 * r()), 4 + 14 * r(), 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) blotch(g, W * r(), H * 0.12 * r(), W * 0.09, "#2a2c3a", 0.5);                   // smoke off the roof
});
const beamTex = () => paint(64, 256, (g, W, H) => {
  const img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = x / (W - 1), v = y / (H - 1), a = Math.pow(Math.sin(Math.PI * u), 1.6) * (0.25 + 0.75 * v); const i = 4 * (y * W + x); img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(255 * a); }
  g.putImageData(img, 0, 0);
});

const build = (K: Kit): PlaceBuild => {
  const group = new THREE.Group(); group.name = "bridge";
  const Mk = maker(K, group), X = (x: number) => X0 + x, B = BRIDGE;
  const mDeck = Mk.tex(deckTex(), 0.9), mConc = Mk.tex(concreteTex(72, "#5c5e68"), 0.95), mSteel = Mk.flat("#2c303c", 0.6);
  // the deck, its pavements and kerbs, the approach at each end
  Mk.mesh("bridge.deck", levelQuad(X(-B.hw), X(B.hw), B.zs - 12, B.zn + 14, 0, (x, z) => [x / 2.4, -z / 2.4]), mDeck, { cast: false });
  Mk.mesh("bridge.body", boxG(X(-B.hw - 0.3), X(B.hw + 0.3), -1.1, -0.02, B.zs, B.zn), mConc, { noink: true });
  for (const s of [-1, 1]) {
    Mk.mesh("bridge.pavement", tileUV(boxG(X(s * B.hw - (s > 0 ? 1.3 : 0)), X(s * B.hw + (s > 0 ? 0 : 1.3)), 0, 0.14, B.zs, B.zn), 2), mConc);
    // the lattice rail: a painted strip between posts, a steel top rail
    const rail = Mk.own("#2c303c", { map: railTex(), rough: 0.6, side: THREE.DoubleSide }); rail.alphaTest = 0.5; rail.map!.repeat.set((B.zn - B.zs) / 2.2, 1);
    Mk.mesh("bridge.rail", new THREE.PlaneGeometry(B.zn - B.zs, 1.15).rotateY(Math.PI / 2).translate(X(s * (B.hw + 0.02)), 0.14 + 0.575, (B.zn + B.zs) / 2), rail, { noink: true, cast: false });
    Mk.mesh("bridge.rail.top", boxG(X(s * (B.hw + 0.02) - 0.06), X(s * (B.hw + 0.02) + 0.06), 1.27, 1.36, B.zs, B.zn), mSteel);
    for (let z = B.zs; z <= B.zn + 0.01; z += 6.6) {
      Mk.mesh("bridge.post", boxG(X(s * (B.hw + 0.02) - 0.16), X(s * (B.hw + 0.02) + 0.16), 0, 1.6, z - 0.16, z + 0.16), mConc);
      // lamp standards (dark: the north half is blacked out)
      if (Math.abs(z - B.zs) > 3) Mk.mesh("bridge.standard", new THREE.CylinderGeometry(0.05, 0.07, 3.4, 8).translate(X(s * (B.hw + 0.02)), 3.3, z), mSteel);
    }
  }
  // THE NORTH END: the warehouse, dark, at the bridge's north-west corner; fire light low behind it
  const mHouse = Mk.basic("#ffffff", { map: houseTex(), transparent: true }); mHouse.alphaTest = 0.3; mHouse.depthWrite = true;
  Mk.mesh("bridge.warehouse", new THREE.PlaneGeometry(64, 30).rotateY(Math.PI).translate(X(-26), 13.5, B.zn + 16), mHouse, { cast: false, receive: false, noink: true });
  Mk.mesh("bridge.north.block", new THREE.PlaneGeometry(40, 16).rotateY(Math.PI).translate(X(30), 7, B.zn + 22), Mk.basic("#0c0f1a"), { cast: false, receive: false, noink: true });
  const mGlowN = Mk.basic("#ff6a2a", { map: (glowCard(1, "#ffffff", 1).material as THREE.MeshBasicMaterial).map, additive: true, opacity: 0.5 });
  const glowN = Mk.mesh("bridge.north.glow", new THREE.PlaneGeometry(170, 84).rotateY(Math.PI).translate(X(-16), 25, B.zn + 30), mGlowN, { cast: false, receive: false, noink: true }); glowN.renderOrder = 1;   // the burning quarter behind the warehouse: its light stands over the roof line
  Mk.mesh("bridge.north.sky", new THREE.PlaneGeometry(260, 110).rotateY(Math.PI).translate(X(0), 40, B.zn + 46), Mk.basic("#0a0d1c"), { cast: false, receive: false, noink: true });
  // THE SOUTH END: the cordon (sandbags either side of a 3.4 m gap), wire trestles pulled aside, a sentry box, the lamp
  const P = new Part(K), sm = sackMats(K), mWood = Mk.flat("#5c4a36", 0.85), mWire = Mk.flat("#6a6c74", 0.5);
  stackSacks(P, sm, { x0: X(-B.hw), x1: X(-1.7), y0: 0, rows: 6, z: B.cordon, seed: 41 }); stackSacks(P, sm, { x0: X(-B.hw), x1: X(-1.7), y0: 0, rows: 4, z: B.cordon + 0.38, seed: 42 });
  stackSacks(P, sm, { x0: X(1.7), x1: X(B.hw), y0: 0, rows: 6, z: B.cordon, seed: 43 }); stackSacks(P, sm, { x0: X(1.7), x1: X(B.hw), y0: 0, rows: 4, z: B.cordon + 0.38, seed: 44 });
  const trestle = (cx: number, cz: number, yaw: number) => {
    const m = new THREE.Matrix4().makeRotationY(yaw); m.setPosition(X(cx), 0, cz);
    for (const e of [-1, 1]) for (const k of [-1, 1]) P.add(mWood, new THREE.CylinderGeometry(0.03, 0.03, 1.5, 6).rotateZ(k * 0.62).translate(e * 1.1, 0.6, 0), 0.004, m);
    P.add(mWood, new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6).rotateZ(Math.PI / 2).translate(0, 0.62, 0), 0.004, m);
    for (let i = 0; i < 5; i++) P.add(mWire, new THREE.TorusGeometry(0.42, 0.008, 4, 14).rotateY(Math.PI / 2).translate(-0.9 + i * 0.45, 0.62, 0), 0, m);
  };
  trestle(-3.0, B.cordon + 2.2, 0.5); trestle(3.2, B.cordon + 2.0, -0.4);
  // the sentry box (plain dark boards, a pointed roof)
  P.add(mWood, boxG(X(-4.4), X(-3.5), 0, 2.2, B.cordon - 2.4, B.cordon - 1.5), 0.006);
  P.add(Mk.flat("#3a3430", 0.8), new THREE.ConeGeometry(0.85, 0.5, 4).rotateY(Math.PI / 4).translate(X(-3.95), 2.45, B.cordon - 1.95), 0.005);
  // the street lamp (lit): a post, an arm, a glass, its halo and its pool on the road
  const [lx, ly, lz] = B.lamp;
  P.add(mSteel, new THREE.CylinderGeometry(0.06, 0.09, ly, 10).translate(X(lx + 0.9), ly / 2, lz), 0.005);
  P.add(mSteel, boxG(X(lx - 0.05), X(lx + 0.9), ly - 0.05, ly + 0.02, lz - 0.03, lz + 0.03), 0.004);
  P.into(group, "bridge.dressing", { cast: true, receive: true });
  const glass = Mk.mesh("bridge.lamp.glass", new THREE.SphereGeometry(0.17, 12, 10).translate(X(lx), ly - 0.2, lz), Mk.basic("#ffe2b0"), { cast: false, receive: false, noink: true });
  (glass.material as THREE.MeshBasicMaterial).color.setRGB(2.2, 1.7, 1.0);
  const halo = glowCard(1.3, "#ffb868", 0.4); halo.position.set(X(lx), ly - 0.2, lz); halo.name = "bridge.lamp.halo"; group.add(halo);
  const lampPool = pool(V(X(lx - 0.6), 0.003, lz + 0.4), V(0, 1, 0), 11, 11, "#ffb060", 0.3); lampPool.name = "bridge.lamp.pool"; group.add(lampPool);
  // the Settlement beyond (the south bank builder: the creek under the bridge, the quay, the street the bridge runs into)
  const bank = buildBank(X0, B.zn + 4, 0, { gap: B.hw + 1.2 }); bank.setMode("night"); group.add(bank.group);

  // THE SEARCHLIGHT: a cold pool on the deck that sweeps, and its beam down from the north-west
  const beamPool = pool(V(X(0), 0.004, 0), V(0, 1, 0), 9, 13, "#cfe0ff", 0.0); beamPool.name = "bridge.beam.pool"; group.add(beamPool);
  const mBeam = Mk.basic("#bcd2ff", { map: beamTex(), additive: true, opacity: 0, side: THREE.DoubleSide });
  const beam = new THREE.Group(); beam.name = "bridge.beam"; group.add(beam);
  for (const rot of [0, Math.PI / 2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0).rotateY(rot), mBeam); m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.frustumCulled = false; m.renderOrder = 6; beam.add(m); }
  const SRC = V(X(-58), 22, B.zn + 60);
  // THE TRACERS: streaks overhead, north to south
  const NT = 9, mTr = Mk.basic("#ffd27a", { additive: true, opacity: 0 }); mTr.color.setRGB(2.4, 1.6, 0.6);
  const tr: THREE.Mesh[] = [], trS = Array.from({ length: NT }, (_, i) => ({ x: -4.5 + 9 * ((i * 0.618) % 1), y: 2.3 + 2.4 * ((i * 0.37) % 1), ph: (i * 0.731) % 1, per: 0.5 + 0.35 * ((i * 0.53) % 1) }));
  for (let i = 0; i < NT; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 7), mTr); m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.frustumCulled = false; m.renderOrder = 6; m.name = "bridge.tracer"; group.add(m); tr.push(m); }

  const Lr = lightRig(group, { dir: [-0.35, 0.7, 0.5], k: 0.55, col: "#aebcf0", at: [X(0), 0, -8], half: 14, hemi: ["#3a4468", "#17171e", 0.85], point: { col: "#ffb676", k: 10, at: [X(lx), ly - 0.4, lz], dist: 16 } });
  Lr.point.decay = 1.5;
  let beamK = 0, tracerK = 0, flash = 0;
  const up = V(0, 1, 0), tmp = V(), q = new THREE.Quaternion();
  return {
    group,
    view(c: THREE.Vector3) { halo.rotation.set(0, Math.atan2(c.x - halo.position.x, c.z - halo.position.z), 0); },
    animate(t: number) {
      bank.animate(t);
      // the beam's foot sweeps the deck: along z slowly, across x faster
      const fz = 4 + 15 * Math.sin(t * 0.55 + 0.4), fx = 2.6 * Math.sin(t * 0.9 + 1.2);
      beamPool.position.set(X(fx), 0.004, fz); (beamPool.material as THREE.MeshBasicMaterial).opacity = 0.42 * beamK;
      const foot = tmp.set(X(fx), 0, fz), d = foot.clone().sub(SRC), len = d.length();
      beam.position.copy(SRC); q.setFromUnitVectors(up, d.normalize()); beam.quaternion.copy(q); beam.scale.set(4.2, len, 4.2);
      mBeam.opacity = 0.16 * beamK; beam.visible = beamK > 0.01;
      mGlowN.opacity = 0.5 + 0.06 * Math.sin(t * 3.1) + 0.3 * flash;
      for (let i = 0; i < NT; i++) {
        const s = trS[i], u = ((t / s.per + s.ph) % 1 + 1) % 1, on = tracerK > 0.01 && (Math.floor(t / s.per + s.ph) * 7 + i) % 3 !== 0 && i < Math.ceil(NT * tracerK);
        tr[i].visible = on; if (on) tr[i].position.set(X(s.x), s.y + 0.4 * u, B.zn + 20 - u * 80);
      }
      mTr.opacity = 0.9 * Math.min(1, tracerK * 2);
      Lr.hemi.intensity = 0.85 + 1.2 * flash;
    },
    setParam(name: string, v: ParamValue) {
      const k = Math.max(0, Math.min(1, Number(v)));
      if (name === "beam") beamK = k; else if (name === "tracer") tracerK = k; else if (name === "flash") flash = k;
    },
    cast(): Partial<CastLight> { return { gain: 0.82 + 0.5 * flash, tint: (flash > 0.3 ? [0.9, 0.95, 1.0] : [0.9, 0.9, 1.0]) as unknown as CastLight["tint"] }; },
  };
};

export const BRIDGE_PLACE: PlaceDef = { look: LOOK, params: PARAMS, build };
