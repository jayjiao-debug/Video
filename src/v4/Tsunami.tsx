import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { ThreeCanvas } from '@remotion/three';
import { AbsoluteFill, continueRender, delayRender, staticFile, useVideoConfig } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut, lerp, clamp } from '../lib';
import { mulberry } from '../v1/data';
import { Vignette, Grain } from '../ui';
import { Sub, Chapter, GOLD_TEXT } from './Titanic2';

/* 《应该没事吧》 part 4, b96-b168: 26 December 2004, Phuket.
   On many beaches the sea drew back and people walked out onto the seabed (region A, x < 0).
   At Mai Khao (region B, x > 0) ten-year-old Tilly Smith saw the sea frothing and coming in, remembered a geography
   lesson from two weeks before, and the beach (about 100 people) was cleared to the upper floor of a hotel.
   Nobody on that beach died. 1 world unit ~ 5 m. Every frame is a pure function of T. */
const b = (i: number) => beats[i];
export const TS_IN = b(96), TS_OUT = b(168);
const GAP = b(156), DROP2 = b(160);
/* time warp: the world nearly stops during the gap before drop 2 */
const warp = (T: number) => (T < GAP ? T : T < DROP2 ? GAP + (T - GAP) * 0.2 : GAP + (DROP2 - GAP) * 0.2 + (T - DROP2));
const wb = (i: number) => warp(b(i));
const HIT = wb(160);
const rnd = (() => { const r = mulberry(2004); return Array.from({ length: 20000 }, () => r()); })();
const smooth = (a: number, z: number, x: number) => { const t = clamp((x - a) / (z - a)); return t * t * (3 - 2 * t); };

/* ---------------- terrain ---------------- */
const shoreOff = (x: number) => 2.5 * Math.sin(x * 0.045) + 1.2 * Math.sin(x * 0.13 + 1);
const HOTEL = { x0: 30, x1: 52, z0: 16, z1: 23, base: 1.12, h: 2.3 };
export const groundY = (x: number, z: number) => {
  const zz = z + shoreOff(x);
  let y: number;
  if (zz < 0) y = Math.max(-0.0125 * -zz, -3.6) + 0.03 * Math.sin(x * 0.3 + zz * 0.2);
  else if (zz < 12) y = 0.05 * zz;
  else if (zz < 30) y = 0.6 + 0.08 * (zz - 12);
  else y = 2.04 + 0.32 * (zz - 30) + 0.9 * Math.sin(x * 0.08) * Math.min(1, (zz - 30) / 10);
  // the hotel stands on a levelled pad
  const pad = smooth(HOTEL.x0 - 6, HOTEL.x0 - 1, x) * (1 - smooth(HOTEL.x1 + 1, HOTEL.x1 + 6, x)) * smooth(HOTEL.z0 - 4, HOTEL.z0 - 1, z) * (1 - smooth(HOTEL.z1 + 1, HOTEL.z1 + 5, z));
  return lerp(y, HOTEL.base, pad);
};
const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(200, 360, 220, 260);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -120);
    const p = g.attributes.position as THREE.BufferAttribute;
    const col = new Float32Array(p.count * 3), c = new THREE.Color();
    const dry = new THREE.Color('#ecdcb2'), wet = new THREE.Color('#c7ae80'), bed = new THREE.Color('#a8946c'), deep = new THREE.Color('#6f6450'), grass = new THREE.Color('#5f8c3e'), hill = new THREE.Color('#3f6a33');
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = groundY(x, z);
      p.setY(i, y);
      const zz = z + shoreOff(x), n = rnd[(i * 7) % 20000];
      if (zz < -2) c.copy(bed).lerp(deep, clamp(-y / 2.5));
      else if (zz < 1.5) c.copy(wet);
      else if (zz < 13) c.copy(dry);
      else if (zz < 30) c.copy(dry).lerp(grass, smooth(13, 17, zz));
      else c.copy(grass).lerp(hill, clamp((zz - 30) / 12));
      c.offsetHSL(0, 0, (n - 0.5) * 0.04);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo}><meshStandardMaterial vertexColors roughness={0.95} metalness={0} /></mesh>;
};

/* ---------------- the sea: a displaced grid ---------------- */
const regionA = (x: number) => 1 - smooth(-16, -4, x);
const regionB = (x: number) => smooth(4, 14, x);
const drain = (Tw: number) => easeInOut(prog(Tw, b(102), b(111)));
const front = (Tw: number) => (Tw < HIT ? lerp(-280, 0, Math.pow(prog(Tw, wb(136), HIT), 1.8)) : lerp(0, 9, easeOut(prog(Tw, HIT, HIT + 2.2))));
const crestA = (Tw: number) => (Tw < HIT ? lerp(0.5, 3.2, Math.pow(prog(Tw, wb(140), HIT), 1.4)) : lerp(3.2, 0.25, easeOut(prog(Tw, HIT, HIT + 1.2))));
const surgeE = (Tw: number) => (Tw < HIT ? 0.35 * prog(Tw, wb(140), HIT) : lerp(0.35, 1.95, easeOut(prog(Tw, HIT, HIT + 1.0))) - 0.35 * easeInOut(prog(Tw, HIT + 2.5, HIT + 6)));
export const waterH = (x: number, z: number, Tw: number) => {
  const s = z - front(Tw);
  const ahead = smooth(-3, 3, s);
  const trough = -0.82 * drain(Tw) * regionA(x) * smooth(-230, -150, z);
  const rise = 0.12 * regionB(x) * easeInOut(prog(Tw, b(116), b(130)));
  const behind = surgeE(Tw) * Math.exp(Math.min(0, s) / 140);
  const crest = crestA(Tw) * (s > 0 ? Math.exp(-((s / 1.8) ** 2)) : Math.exp(-((s / 7) ** 2)));
  const swell = 0.025 * Math.sin(0.6 * x + 1.4 * Tw) + 0.02 * Math.sin(0.9 * z - 1.1 * Tw);
  return ahead * (trough + rise) + (1 - ahead) * behind + crest + swell;
};
const froth = (x: number, z: number, Tw: number) => {
  const on = regionB(x) * easeOut(prog(Tw, b(117), b(122)));
  if (on <= 0) return 0;
  const u = x * 0.8 + z * 0.6, v = -x * 0.6 + z * 0.8;
  const n = Math.sin(u * 0.6 + Tw * 0.9) * Math.sin(v * 0.75 - Tw * 0.7) + 0.7 * Math.sin(x * 0.37 - z * 0.93 + Tw) + 0.5 * Math.sin(z * 1.3 + x * 0.21 - Tw * 1.4);
  return on * (1 - prog(Tw, b(150), b(156))) * clamp((n + 0.1) * 0.8) * smooth(-22, -4, z + shoreOff(x));
};
const Sea: React.FC<{ Tw: number; normals: THREE.Texture }> = ({ Tw, normals }) => {
  const { geo, ground } = useMemo(() => {
    const g = new THREE.PlaneGeometry(220, 330, 170, 480);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -135);
    const p = g.attributes.position as THREE.BufferAttribute;
    const gr = new Float32Array(p.count);
    for (let i = 0; i < p.count; i++) gr[i] = groundY(p.getX(i), p.getZ(i));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(p.count * 3), 3));
    return { geo: g, ground: gr };
  }, []);
  const mat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.18, metalness: 0.05, normalMap: normals, normalScale: new THREE.Vector2(0.35, 0.35) });
    return m;
  }, [normals]);
  normals.repeat.set(60, 90);
  normals.offset.set(Tw * 0.012, Tw * 0.02);
  const p = geo.attributes.position as THREE.BufferAttribute;
  const col = geo.attributes.color as THREE.BufferAttribute;
  const shallow = new THREE.Color('#4fc7bf'), deep = new THREE.Color('#0d527c'), foam = new THREE.Color('#f4f8f6'), c = new THREE.Color();
  const fz = front(Tw), A = crestA(Tw);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const h = waterH(x, z, Tw);
    p.setY(i, h);
    const d = h - ground[i];
    c.copy(shallow).lerp(deep, smooth(0.05, 2.6, d));
    const s = z - fz;
    // the wave: a dark face, a white lip just behind the front, foam trailing behind
    const cf = A > 0.7 ? clamp((s > 0 ? Math.exp(-((s / 0.6) ** 2)) : Math.exp(-(((s + 0.4) / 2.2) ** 2))) * 1.3) * clamp((A - 0.7) / 1.2) : 0;
    if (A > 0.7 && s > 0.2 && s < 4) c.lerp(deep, 0.6 * clamp((A - 0.7) / 1.5));
    const wash = d < 0.06 ? 0.55 : 0;
    const f = Math.max(cf, wash, froth(x, z, Tw), Tw > HIT && Tw < HIT + 4 ? 0.6 * smooth(-40, -4, s) * (1 - prog(Tw, HIT + 1, HIT + 4)) : 0);
    c.lerp(foam, clamp(f));
    col.setXYZ(i, c.r, c.g, c.b);
  }
  p.needsUpdate = true; col.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <>
      <mesh geometry={geo} material={mat} />
      <mesh position={[0, 0.02 * Math.sin(Tw), -700]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2400, 800]} /><meshStandardMaterial color="#0d527c" roughness={0.2} /></mesh>
    </>
  );
};

/* ---------------- sky, sun ---------------- */
const SUN = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 40), THREE.MathUtils.degToRad(35));
const domeMaterial = () => new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { sun: { value: SUN.clone() } },
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: `uniform vec3 sun; varying vec3 vP;
    void main(){
      float h = clamp(vP.y, 0.0, 1.0);
      vec3 hor = vec3(0.80, 0.90, 0.96), mid = vec3(0.45, 0.68, 0.90), zen = vec3(0.18, 0.42, 0.78);
      vec3 c = mix(hor, mid, smoothstep(0.0, 0.18, h));
      c = mix(c, zen, smoothstep(0.18, 0.75, h));
      float sd = max(dot(normalize(vP), normalize(sun)), 0.0);
      c += vec3(1.0, 0.92, 0.75) * (pow(sd, 400.0) * 3.0 + pow(sd, 8.0) * 0.25);
      if (vP.y < 0.0) c = hor;
      gl_FragColor = vec4(c, 1.0);
    }`,
});
const SkyEnv: React.FC = () => {
  const { scene, gl } = useThree();
  const dome = useMemo(() => new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), domeMaterial()), []);
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const sc = new THREE.Scene();
    sc.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), domeMaterial()));
    return pm.fromScene(sc).texture;
  }, [gl]);
  scene.environment = env;
  (scene as any).environmentIntensity = 0.8;
  return <primitive object={dome} />;
};

/* ---------------- resort dressing: palms, umbrellas, hotel ---------------- */
const Palms: React.FC = () => {
  const { trunks, leaves } = useMemo(() => {
    const spots: number[][] = [];
    for (let i = 0; spots.length < 95 && i < 2000; i++) {
      const x = -85 + rnd[1000 + i] * 170, z = 11 + rnd[3000 + i] * 22;
      const zz = z + shoreOff(x);
      if (zz < 11 || (x > HOTEL.x0 - 3 && x < HOTEL.x1 + 3 && z > HOTEL.z0 - 3 && z < HOTEL.z1 + 3)) continue;
      spots.push([x, z, rnd[5000 + i], rnd[6000 + i]]);
    }
    const tg = new THREE.CylinderGeometry(0.07, 0.11, 2.4, 6); tg.translate(0, 1.2, 0);
    const lg = new THREE.PlaneGeometry(1.5, 0.3); lg.translate(0.75, 0, 0);
    const tm = new THREE.InstancedMesh(tg, new THREE.MeshStandardMaterial({ color: '#7a5a3a', roughness: 0.9 }), spots.length);
    const lm = new THREE.InstancedMesh(lg, new THREE.MeshStandardMaterial({ color: '#3f7a32', roughness: 0.8, side: THREE.DoubleSide }), spots.length * 8);
    const o = new THREE.Object3D(), top = new THREE.Object3D(), leaf = new THREE.Object3D();
    top.add(leaf);
    spots.forEach(([x, z, r1, r2], i) => {
      const h = 0.8 + 0.5 * r1, lean = (r2 - 0.5) * 0.35;
      o.position.set(x, groundY(x, z) - 0.05, z); o.rotation.set(lean, r1 * 6, lean * 0.6); o.scale.set(1, h, 1); o.updateMatrix();
      tm.setMatrixAt(i, o.matrix);
      o.updateMatrixWorld();
      const tip = new THREE.Vector3(0, 2.4, 0).applyMatrix4(o.matrix);
      for (let k = 0; k < 8; k++) {
        top.position.copy(tip); top.rotation.set(0, (k / 8) * Math.PI * 2 + r1 * 3, 0); top.updateMatrixWorld();
        leaf.rotation.set(0, 0, -0.35 - 0.25 * ((k * 7) % 3) / 2); leaf.updateMatrixWorld(true);
        lm.setMatrixAt(i * 8 + k, leaf.matrixWorld);
      }
    });
    return { trunks: tm, leaves: lm };
  }, []);
  return <><primitive object={trunks} /><primitive object={leaves} /></>;
};
const Umbrellas: React.FC = () => {
  const { tops, poles } = useMemo(() => {
    const pts: number[][] = [];
    for (let i = 0; pts.length < 46 && i < 500; i++) {
      const x = -80 + rnd[7000 + i] * 160, zz = 4 + rnd[7500 + i] * 6;
      if (Math.abs(x) < 8 || Math.abs(x - 44) < 10) continue; // keep the camera path around Tilly clear
      pts.push([x, zz - shoreOff(x), rnd[8000 + i]]);
    }
    const cg = new THREE.ConeGeometry(0.55, 0.28, 10); cg.translate(0, 0.95, 0);
    const pg = new THREE.CylinderGeometry(0.02, 0.02, 0.95, 4); pg.translate(0, 0.47, 0);
    const tm = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ roughness: 0.7 }), pts.length);
    const pm = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: '#e8e2d4' }), pts.length);
    const cols = ['#d9473a', '#f2efe6', '#2f7fb8', '#f2b33d'];
    const o = new THREE.Object3D();
    pts.forEach(([x, z, r], i) => {
      o.position.set(x, groundY(x, z), z); o.rotation.set(0, r * 6, 0); o.updateMatrix();
      tm.setMatrixAt(i, o.matrix); pm.setMatrixAt(i, o.matrix);
      tm.setColorAt(i, new THREE.Color(cols[Math.floor(r * 4)]));
    });
    return { tops: tm, poles: pm };
  }, []);
  return <><primitive object={tops} /><primitive object={poles} /></>;
};
const HOTEL_TOP = HOTEL.base + HOTEL.h;
const Hotel: React.FC = () => {
  const w = HOTEL.x1 - HOTEL.x0, d = HOTEL.z1 - HOTEL.z0, cx = (HOTEL.x0 + HOTEL.x1) / 2, cz = (HOTEL.z0 + HOTEL.z1) / 2;
  return (
    <group>
      <mesh position={[cx, HOTEL.base + HOTEL.h / 2 - 0.3, cz]}><boxGeometry args={[w, HOTEL.h + 0.6, d]} /><meshStandardMaterial color="#f1ede3" roughness={0.8} /></mesh>
      {[0.55, 1.55].map((y) => (
        <mesh key={y} position={[cx, HOTEL.base + y, HOTEL.z0 - 0.02]}><boxGeometry args={[w - 1.2, 0.42, 0.05]} /><meshStandardMaterial color="#3a5a6a" roughness={0.3} metalness={0.2} /></mesh>
      ))}
      <mesh position={[cx, HOTEL.base + 1.12, HOTEL.z0 - 0.35]}><boxGeometry args={[w, 0.08, 0.7]} /><meshStandardMaterial color="#d9d2c0" /></mesh>
      <mesh position={[cx, HOTEL_TOP + 0.12, cz]}><boxGeometry args={[w + 0.2, 0.24, d + 0.2]} /><meshStandardMaterial color="#c9a07a" roughness={0.8} /></mesh>
      <mesh position={[cx, HOTEL_TOP + 0.2, cz]}><boxGeometry args={[w - 0.4, 0.1, d - 0.4]} /><meshStandardMaterial color="#e9e2d2" /></mesh>
    </group>
  );
};

/* ---------------- people ---------------- */
type Person = { kind: 'A' | 'B'; x0: number; z0: number; x1: number; z1: number; tOut: number; tBack: number; xs: number; zs: number; speed: number; col: number; kid?: boolean; id: number };
const NA = 46, NB = 100;
const PEOPLE: Person[] = (() => {
  const out: Person[] = [];
  for (let i = 0; i < NA; i++) {
    const x0 = -50 + rnd[9000 + i] * 24, zz0 = 1 + rnd[9100 + i] * 7;
    const z0 = zz0 - shoreOff(x0);
    const out1 = -5 - rnd[9200 + i] * 24;
    out.push({ kind: 'A', x0, z0, x1: x0 + (rnd[9300 + i] - 0.5) * 10, z1: out1 - shoreOff(x0), tOut: b(105) + rnd[9400 + i] * 4, tBack: 1e9, xs: 0, zs: 0, speed: 1.8 + 0.8 * rnd[9500 + i], col: Math.floor(rnd[9600 + i] * 8), id: i });
  }
  // Mai Khao: Tilly (index NA), her mother, father, sister; then the rest of the beach
  const TX = 42;
  const fam = [[TX, 0.5, true], [TX - 2.4, 3.6, false], [TX - 1.4, 4.2, false], [TX - 2.0, 4.9, true]] as const;
  fam.forEach(([x, zz, kid], k) => out.push({ kind: 'B', x0: x, z0: zz - shoreOff(x), x1: x, z1: zz - shoreOff(x), tOut: 1e9, tBack: wb(136) + 0.3 + k * 0.25, xs: 40 + k * 1.2, zs: 19.2 + (k % 2) * 1.2, speed: k === 0 ? 3.2 : 3.4, col: k === 0 ? 8 : k, kid, id: NA + k }));
  for (let i = 4; i < NB; i++) {
    let x0 = 27 + rnd[10000 + i] * 30, zz0 = -3.5 + rnd[10100 + i] * 15;
    if (Math.abs(x0 - TX) < 6 && zz0 < 9) x0 = x0 < TX ? x0 - 6 : x0 + 6;
    const row = Math.floor((i - 4) / 16), colI = (i - 4) % 16;
    out.push({ kind: 'B', x0, z0: zz0 - shoreOff(x0), x1: x0, z1: zz0 - shoreOff(x0), tOut: 1e9, tBack: wb(142) + rnd[10200 + i] * 1.6, xs: HOTEL.x0 + 1.2 + colI * ((HOTEL.x1 - HOTEL.x0 - 2.4) / 15), zs: HOTEL.z0 + 1 + row * 0.95 + rnd[10300 + i] * 0.3, speed: 3.6 + 0.8 * rnd[10400 + i], col: Math.floor(rnd[10500 + i] * 8), id: NA + i });
  }
  return out;
})();
export const TILLY = PEOPLE[NA];
const DOOR_Z = HOTEL.z0 - 1.2;
/* where a person is at world time Tw: x, z, y, moving */
const personAt = (p: Person, Tw: number) => {
  let x = p.x0, z = p.z0, moving = 0, y = 0;
  if (p.kind === 'A') {
    const u = (Tw - p.tOut) * p.speed / Math.max(0.01, Math.hypot(p.x1 - p.x0, p.z1 - p.z0));
    const k = clamp(u);
    x = lerp(p.x0, p.x1, k); z = lerp(p.z0, p.z1, k); moving = u > 0 && u < 1 ? 1 : 0;
  } else if (Tw > p.tBack) {
    // run to the hotel door, then up the stairs to the roof terrace
    const d1 = Math.hypot(p.xs - p.x0, DOOR_Z - p.z0);
    const t1 = d1 / p.speed;
    const u = Tw - p.tBack;
    if (u < t1) { const k = u / t1; x = lerp(p.x0, p.xs, k); z = lerp(p.z0, DOOR_Z, k); moving = 1; }
    else { const k = easeInOut(clamp((u - t1) / 0.9)); x = p.xs; z = lerp(DOOR_Z, p.zs, k); y = k * (HOTEL_TOP + 0.25 - groundY(x, z)); moving = k < 1 ? 1 : 0; }
  }
  return { x, z, y: groundY(x, z) + y, moving };
};
const SHIRTS = ['#d9473a', '#2f7fb8', '#f2b33d', '#3aa37a', '#f2efe6', '#8a4ab8', '#e8805a', '#1f3a5a', '#ff5fa2'];
const People: React.FC<{ Tw: number; T: number }> = ({ Tw, T }) => {
  const { body, head, glow } = useMemo(() => {
    const bg = new THREE.CapsuleGeometry(0.1, 0.24, 4, 8); bg.translate(0, 0.22, 0);
    const hg = new THREE.SphereGeometry(0.085, 10, 8); hg.translate(0, 0.52, 0);
    const bm = new THREE.InstancedMesh(bg, new THREE.MeshStandardMaterial({ roughness: 0.6 }), PEOPLE.length);
    const hm = new THREE.InstancedMesh(hg, new THREE.MeshStandardMaterial({ color: '#d9a882', roughness: 0.6 }), PEOPLE.length);
    PEOPLE.forEach((p, i) => bm.setColorAt(i, new THREE.Color(SHIRTS[p.col])));
    const gg = new THREE.PlaneGeometry(1, 1); gg.rotateX(-Math.PI / 2);
    const gm = new THREE.InstancedMesh(gg, new THREE.MeshBasicMaterial({ map: haloTexture(), color: '#ffcf6e', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), NB);
    return { body: bm, head: hm, glow: gm };
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const safeGlow = easeOut(prog(T, DROP2 + 1.2, DROP2 + 2.4));
  PEOPLE.forEach((p, i) => {
    const { x, z, y, moving } = personAt(p, Tw);
    const hideA = p.kind === 'A' && T > b(141) ? 0.0001 : 1;
    const s = (p.kid ? 0.72 : 1) * hideA;
    const bob = moving ? Math.abs(Math.sin(Tw * 11 + i)) * 0.05 : 0;
    // A-beach people stoop to pick things up while out on the seabed
    const stoop = p.kind === 'A' && !moving && Tw > p.tOut ? 0.5 + 0.5 * Math.sin(Tw * 1.3 + i) : 0;
    o.position.set(x, y + bob, z); o.rotation.set(stoop * 0.9, 0, 0); o.scale.setScalar(s); o.updateMatrix();
    body.setMatrixAt(i, o.matrix); head.setMatrixAt(i, o.matrix);
    if (p.kind === 'B') {
      const gi = i - NA;
      o.position.set(x, y + 0.03, z); o.rotation.set(0, 0, 0); o.scale.setScalar(Math.max(0.0001, 1.2 * safeGlow)); o.updateMatrix();
      glow.setMatrixAt(gi, o.matrix);
    }
  });
  body.instanceMatrix.needsUpdate = true; head.instanceMatrix.needsUpdate = true; glow.instanceMatrix.needsUpdate = true;
  return <><primitive object={body} /><primitive object={head} /><primitive object={glow} /></>;
};
let HALO: THREE.Texture | null = null;
const haloTexture = () => {
  if (HALO) return HALO;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  HALO = new THREE.CanvasTexture(c);
  return HALO;
};
/* Tilly's ring on the sand */
const TillyRing: React.FC<{ Tw: number; T: number }> = ({ Tw, T }) => {
  const o = easeOut(prog(T, b(121), b(121) + 0.4)) * (1 - prog(T, b(150), b(152)));
  if (o <= 0) return null;
  const { x, z, y } = personAt(TILLY, Tw);
  const pulse = 1 + 0.12 * Math.sin(T * 5);
  return (
    <group position={[x, y + 0.04, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={pulse}><ringGeometry args={[0.42, 0.5, 48]} /><meshBasicMaterial color="#ffcf6e" transparent opacity={o} toneMapped={false} depthWrite={false} /></mesh>
    </group>
  );
};
/* fish flapping on the exposed seabed (region A) */
const Fish: React.FC<{ Tw: number }> = ({ Tw }) => {
  const mesh = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.22, 0.08);
    return new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: '#dfe6ea', metalness: 0.8, roughness: 0.25, side: THREE.DoubleSide }), 140);
  }, []);
  const o = useMemo(() => new THREE.Object3D(), []);
  const dr = drain(Tw);
  for (let i = 0; i < 140; i++) {
    const x = -72 + rnd[12000 + i] * 58, zz = -4 - rnd[12200 + i] * 50, z = zz - shoreOff(x);
    const show = dr > 0.6 && waterH(x, z, Tw) < groundY(x, z) ? 1 : 0.0001;
    o.position.set(x, groundY(x, z) + 0.05 + 0.04 * Math.abs(Math.sin(Tw * 7 + i)), z);
    o.rotation.set(-Math.PI / 2 + 0.6 * Math.sin(Tw * 9 + i * 3), rnd[12400 + i] * 6, 0);
    o.scale.setScalar(show); o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
/* spray when the wave breaks on the beach */
const Spray: React.FC<{ Tw: number }> = ({ Tw }) => {
  const pts = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2400 * 3), 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: '#f4f8f6', size: 0.35, map: haloTexture(), transparent: true, depthWrite: false, opacity: 0.85 }));
  }, []);
  const u = Tw - HIT;
  const p = pts.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < 2400; i++) {
    const x = -5 + rnd[14000 + i] * 90, z0 = -shoreOff(x) - 2 + rnd[16000 + i] * 3;
    const t = u - rnd[18000 + i] * 0.6;
    if (t < 0 || t > 2.4) { p.setXYZ(i, 0, -50, 0); continue; }
    const vy = 4 + rnd[(i * 3) % 20000] * 6, vz = 2 + rnd[(i * 5) % 20000] * 5;
    p.setXYZ(i, x + (rnd[(i * 7) % 20000] - 0.5) * 2 * t, 0.5 + vy * t - 4.9 * t * t, z0 + vz * t);
  }
  p.needsUpdate = true;
  (pts.material as THREE.PointsMaterial).opacity = 0.85 * (1 - clamp((u - 1.2) / 1.2));
  return u > 0 && u < 2.6 ? <primitive object={pts} /> : null;
};

/* ---------------- camera ---------------- */
type Key = [number, number[], number[]];
const TXp = TILLY.x0, TZp = TILLY.z0;
const KEYS: Key[] = [
  [b(96), [-10, 34, 58], [-5, 0, -30]],
  [b(103), [-44, 9, 26], [-40, 0, -24]],
  [b(112), [-30, 4.2, 16], [-38, 0, -14]],
  [b(118), [-28, 3.6, 12], [-40, 0, -20]],
  [b(120), [4, 11, 18], [24, 0, -12]],
  [b(123), [TXp + 3.2, 1.4, TZp + 5.6], [TXp, 0.4, TZp - 1.5]],
  [b(132), [TXp + 1.7, 0.85, TZp + 3.0], [TXp, 0.38, TZp - 0.4]],
  [b(136), [TXp + 2.2, 1.1, TZp + 4.0], [TXp, 0.4, TZp]],
  [b(142), [TXp + 6, 3.2, 26], [TXp - 1, 0.8, 8]],
  [b(148), [76, 13, 36], [36, 0.5, -6]],
  [b(154), [64, 4.4, 20], [40, 2.4, -20]],
  [b(160), [63, 5.0, 22], [40, 1.4, -6]],
  [b(164), [62, 13, 44], [40, 0.5, 4]],
  [b(168), [44, 24, 56], [40, 0, 6]],
];
const camAt = (T: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && T > KEYS[i + 1][0]) i++;
  const [ta, pa, la] = KEYS[i], [tb, pb, lb] = KEYS[i + 1];
  const k = easeInOut(prog(T, ta, tb));
  const pos = pa.map((x, j) => lerp(x, pb[j], k)), look = la.map((x, j) => lerp(x, lb[j], k));
  // follow Tilly while she runs
  if (T > b(136) && T < b(144)) {
    const { x, z } = personAt(TILLY, warp(T));
    const f = easeInOut(prog(T, b(136), b(137))) * (1 - easeInOut(prog(T, b(142), b(144))));
    pos[0] += (x - TXp) * f; pos[2] += (z - TZp) * f; look[0] += (x - TXp) * f; look[2] += (z - TZp) * f;
  }
  const sh = T > DROP2 ? 0.22 * Math.exp(-(T - DROP2) * 2.2) : 0;
  return { pos: [pos[0] + sh * Math.sin(T * 47), pos[1] + sh * Math.sin(T * 61), pos[2]], look };
};
const CamRig: React.FC<{ T: number }> = ({ T }) => {
  const { camera } = useThree();
  const { pos, look } = camAt(T);
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  camera.updateProjectionMatrix();
  return null;
};
const PROJ = new THREE.PerspectiveCamera(36, 1920 / 1080, 0.1, 6000);
const toScreen = (T: number, v: number[]) => {
  const { pos, look } = camAt(T);
  PROJ.position.set(pos[0], pos[1], pos[2]); PROJ.lookAt(look[0], look[1], look[2]); PROJ.updateMatrixWorld(); PROJ.updateProjectionMatrix();
  const p = new THREE.Vector3(v[0], v[1], v[2]).project(PROJ);
  return { x: (p.x + 1) / 2 * 1920, y: (1 - p.y) / 2 * 1080, front: p.z < 1 };
};

const Scene: React.FC<{ T: number; normals: THREE.Texture }> = ({ T, normals }) => {
  const Tw = warp(T);
  return (
    <>
      <CamRig T={T} />
      <SkyEnv />
      <fog attach="fog" args={['#cfe4f2', 300, 2600]} />
      <hemisphereLight args={['#cfe6ff', '#c9b48a', 0.55]} />
      <directionalLight position={[SUN.x * 100, SUN.y * 100, SUN.z * 100]} intensity={2.4} color="#fff3dc" />
      <Terrain />
      <Sea Tw={Tw} normals={normals} />
      <Palms />
      <Umbrellas />
      <Hotel />
      <People Tw={Tw} T={T} />
      <TillyRing Tw={Tw} T={T} />
      <Fish Tw={Tw} />
      <Spray Tw={Tw} />
    </>
  );
};

/* ---------------- 2D overlay ---------------- */
type Line = [number, number, string, string];
const LINES: Line[] = [
  [TS_IN + 0.15, b(104) - 0.1, '2004年12月26日，泰国普吉岛', '26 December 2004, Phuket, Thailand.'],
  [b(104) + 0.06, b(112) - 0.1, '很多海滩上，海水突然退去，露出了海床', 'On many beaches the sea suddenly drew back.'],
  [b(112) + 0.06, b(120) - 0.1, '人们走下去捡鱼、拍照', 'People walked out to pick up fish and take photos.'],
  [b(120) + 0.06, b(128) - 0.1, '迈考海滩上，10岁的蒂莉发现海水在冒泡', 'At Mai Khao, ten-year-old Tilly saw the sea frothing.'],
  [b(128) + 0.06, b(136) - 0.1, '两周前的地理课上，她刚学过：这是海啸', 'Two weeks earlier, in geography class, she had learned what that means.'],
  [b(136) + 0.06, b(144) - 0.1, '她拉着爸妈喊：必须马上离开海滩！', '"We have to get off the beach. Now."'],
  [b(144) + 0.06, GAP - 0.1, '整片海滩的人，撤到了酒店楼上', 'The whole beach went up to the hotel\'s upper floor.'],
  [DROP2 + 0.5, TS_OUT - 0.12, '这片海滩约100人，[没有一个人遇难]', 'About 100 people on that beach. Not one of them died.'],
];
const TillyTag: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, b(121) + 0.2, b(121) + 0.6)) * (1 - prog(T, b(140), b(141)));
  if (o <= 0) return null;
  const { x, y, z } = personAt(TILLY, warp(T));
  const s = toScreen(T, [x, y + 0.75, z]);
  if (!s.front) return null;
  return (
    <div style={{ position: 'absolute', left: s.x, top: s.y, transform: 'translate(-50%, -100%)', opacity: o, textAlign: 'center' }}>
      <div style={{ background: 'rgba(8,12,22,0.72)', borderRadius: 30, padding: '8px 22px 10px' }}>
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 30, color: '#f6cf78', whiteSpace: 'nowrap' }}>蒂莉 · 10岁</div>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 20, color: 'rgba(255,255,255,0.75)' }}>Tilly Smith</div>
      </div>
      <div style={{ width: 2, height: 30, background: 'rgba(246,207,120,0.8)', margin: '6px auto 0' }} />
    </div>
  );
};
const Result: React.FC<{ T: number }> = ({ T }) => {
  const o = easeOut(prog(T, DROP2 + 1.6, DROP2 + 2.1));
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', top: 110, right: 70, textAlign: 'right', opacity: o }}>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 110, lineHeight: 1, ...GOLD_TEXT }}>0</div>
      <div style={{ fontFamily: ZH, fontSize: 26, letterSpacing: '0.12em', color: '#f3ede2', marginTop: 8, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>迈考海滩 · 遇难人数</div>
    </div>
  );
};
export const TsunamiScene: React.FC<{ T: number }> = ({ T }) => {
  const { width, height } = useVideoConfig();
  const [normals, setNormals] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => delayRender('tsunami textures'));
  useEffect(() => {
    new THREE.TextureLoader().loadAsync(staticFile('waternormals.jpg')).then((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      setNormals(t);
      continueRender(handle);
    });
  }, [handle]);
  const inO = easeOut(prog(T, TS_IN - 0.05, TS_IN + 0.6));
  const outO = 1 - easeIn(prog(T, TS_OUT - 0.35, TS_OUT));
  return (
    <AbsoluteFill style={{ backgroundColor: '#e9ecf1' }}>
      <AbsoluteFill style={{ opacity: inO * outO }}>
        {normals && (
          <ThreeCanvas width={width} height={height} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.85 }} camera={{ fov: 36, near: 0.1, far: 6000, position: [0, 30, 50] }}>
            <Scene T={T} normals={normals} />
          </ThreeCanvas>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.45) 55%, rgba(5,7,13,0.7) 100%)' }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 170, background: 'linear-gradient(180deg, rgba(5,7,13,0.55) 0%, rgba(5,7,13,0) 100%)' }} />
        <div style={{ position: 'absolute', right: 0, top: 60, width: 520, height: 260, background: 'radial-gradient(ellipse 60% 60% at 80% 40%, rgba(5,7,13,0.55), rgba(5,7,13,0))', opacity: easeOut(prog(T, DROP2 + 1.6, DROP2 + 2.1)) }} />
        <TillyTag T={T} />
        <Result T={T} />
        <Chapter T={T} at={TS_IN + 0.4} out={b(120) - 0.1} text="2004.12.26 · 泰 国 普 吉 岛" />
        <Chapter T={T} at={b(120) + 0.2} out={TS_OUT - 0.2} text="迈 考 海 滩 · MAI KHAO" />
        {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
        <Vignette strength={0.35} />
        <Grain />
      </AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: '#05070d', opacity: easeIn(prog(T, TS_OUT - 0.35, TS_OUT)) }} />
    </AbsoluteFill>
  );
};
