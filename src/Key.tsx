/* 《一把钥匙》 opening proof (0 → 21 s). A crew list with one name struck out; a brass key with a paper tag; the locked
   locker in the crow's nest with binoculars behind glass; pull back to the ship lit on a glass-flat, moonless sea with a
   dark iceberg ahead; the key turns on the title hit. Everything drawn in code. */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { M, add, canvasTex, herm, Key, at, glowSprite, makeEnv, woodTex, rng } from './kit';
import { W, H, GOLD, INK, SERIF, SANS, txt, subtitle, mark, grain, vignette, ramp, eio, eo, clamp, FONT_CHARS } from './lib';

export const KEY_LEN_S = 21.2, KEY_FRAMES = Math.round(KEY_LEN_S * 30);
const KEYHIT = 4.404, LOCK = 8.473, PULL = 12.54, INSERT = 16.25, TITLE = 16.613, NEXT = 20.683;
const LINES: [number, number, string][] = [
  [0.33, 3.9, '1912年，泰坦尼克号起航前，一个人被临时调下了船'],
  [4.40, 7.9, '他走的时候，口袋里多了一把钥匙'],
  [8.47, 11.9, '据说，这把钥匙锁着瞭望台的望远镜'],
  [12.54, 15.9, '有人说：就是它，害死了{1500人}'],
];

/* ------------------------------------------------------------------ the key: an ornate brass bow, a shaft, a bit */
const brassKey = (mat: THREE.Material) => {
  const k = new THREE.Group();
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0042, 16, 48), mat); k.add(bow);
  for (const a of [0, Math.PI / 2]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.0035, 0.003), mat); c.rotation.z = a + Math.PI / 4; k.add(c); }
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0055, 0.012, 16).rotateZ(Math.PI / 2), mat); neck.position.x = 0.024; k.add(neck);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0032, 0.0032, 0.062, 16).rotateZ(Math.PI / 2), mat); shaft.position.x = 0.06; k.add(shaft);
  const bit = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.014, 0.003), mat); bit.position.set(0.083, -0.009, 0); k.add(bit);
  for (const x of [0.079, 0.087]) { const n = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.005, 0.0032), new THREE.MeshBasicMaterial({ color: '#000' })); n.position.set(x, -0.014, 0); k.add(n); }
  return k;
};

/* ------------------------------------------------------------------ desk at Southampton */
const drawList = (c: CanvasRenderingContext2D, t: number) => {
  const w = 1100, h = 1440; const r = rng(4); const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#efe6d0'); bg.addColorStop(1, '#ddcfae'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(120,90,50,${r() * 0.07})`; c.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 4); }
  c.textAlign = 'center'; c.fillStyle = '#2a2218'; c.font = `700 46px ${SERIF}`; c.fillText('WHITE STAR LINE', w / 2, 120); c.font = `700 64px ${SERIF}`; c.fillText('R.M.S. “TITANIC”', w / 2, 200);
  c.font = `600 34px ${SERIF}`; c.fillText('LIST OF OFFICERS · SOUTHAMPTON · APRIL 1912', w / 2, 260); c.fillRect(140, 290, w - 280, 3);
  c.textAlign = 'left'; c.font = `500 44px ${SERIF}`;
  const rows: [string, string][] = [['Commander', 'E. J. Smith'], ['Chief Officer', 'H. T. Wilde'], ['First Officer', 'W. M. Murdoch'], ['Second Officer', 'D. Blair'], ['Third Officer', 'H. J. Pitman'], ['Fourth Officer', 'J. G. Boxhall'], ['Fifth Officer', 'H. G. Lowe'], ['Sixth Officer', 'J. P. Moody']];
  rows.forEach(([a, b], i) => { const y = 400 + i * 120; c.fillStyle = '#3a3024'; c.fillText(a, 140, y); c.fillStyle = '#1a140c'; c.fillText(b, 620, y); c.strokeStyle = 'rgba(60,40,20,.25)'; c.lineWidth = 2; c.setLineDash([4, 10]); c.beginPath(); c.moveTo(140, y + 26); c.lineTo(w - 140, y + 26); c.stroke(); c.setLineDash([]); });
  /* the strike, drawn as if by a pen, and the new name written above */
  const k = eio(ramp(t, 1.0, 1.3)); const y = 400 + 3 * 120 - 14; if (k > 0) { c.strokeStyle = 'rgba(150,20,14,.92)'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(600, y + 4); for (let x = 600; x <= 600 + 300 * k; x += 10) c.lineTo(x, y + Math.sin(x * 0.05) * 2.5); c.stroke(); }
  const n = ramp(t, 2.3, 1.0); if (n > 0) { c.save(); c.globalAlpha = n; c.fillStyle = '#1b2a5c'; c.font = `italic 600 46px ${SERIF}`; c.translate(640, y - 50); c.rotate(-0.04); c.fillText('C. H. Lightoller', 0, 0); c.restore(); }
};
const buildDesk = (gl: THREE.WebGLRenderer) => {
  const g = new THREE.Group(); const env = makeEnv(gl);
  add(g, new THREE.BoxGeometry(1.8, 0.05, 1.0), M({ map: woodTex(11, '#3e2616', 1024, 1024, 2, 1), roughness: 0.45 }), 0, 0.725, 0);
  add(g, new THREE.PlaneGeometry(3, 2.4), M({ map: woodTex(5, '#2c2018', 1024, 1024, 4, 1), roughness: 0.8 }), 0, 1.2, -0.55, false);
  const list = canvasTex(1100, 1440); const paper = add(g, new THREE.PlaneGeometry(0.3, 0.393).rotateX(-Math.PI / 2), M({ map: list.tex, roughness: 0.9 }), -0.06, 0.7505, 0.0, false); paper.rotation.y = 0.06;
  const brass = M({ color: '#c99a4a', metalness: 1, roughness: 0.28, envMap: env, envMapIntensity: 1.4 });
  const key = brassKey(brass); key.position.set(0.24, 0.756, 0.09); key.rotation.set(-Math.PI / 2, 0, 0.45); key.scale.setScalar(1.3); key.traverse((o) => { o.castShadow = true; }); g.add(key);
  const tag = canvasTex(400, 220); { const c = tag.g; c.fillStyle = '#e4d6b4'; c.beginPath(); c.moveTo(60, 0); c.lineTo(400, 0); c.lineTo(400, 220); c.lineTo(60, 220); c.lineTo(0, 110); c.closePath(); c.fill(); c.fillStyle = '#6a5a40'; c.beginPath(); c.arc(50, 110, 14, 0, 7); c.fill(); c.fillStyle = '#231a10'; c.font = `700 58px ${SERIF}`; c.textAlign = 'center'; c.fillText("CROW'S NEST", 225, 132); }
  const tg = add(g, new THREE.PlaneGeometry(0.075, 0.041).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: tag.tex, transparent: true, roughness: 0.9 }), 0.205, 0.7512, 0.165, false); tg.rotation.y = -0.5;
  const str = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0.222, 0.753, 0.12), new THREE.Vector3(0.214, 0.752, 0.15), new THREE.Vector3(0.188, 0.752, 0.16)]), new THREE.LineBasicMaterial({ color: '#8a7a5a' })); g.add(str);
  /* pen, inkwell, an officer's cap at the edge of frame */
  add(g, new THREE.CylinderGeometry(0.006, 0.006, 0.15, 16).rotateZ(Math.PI / 2).rotateY(0.6), M({ color: '#0e0e10', roughness: 0.2 }), 0.12, 0.756, -0.13);
  add(g, new THREE.CylinderGeometry(0.03, 0.035, 0.045, 24), M({ color: '#1a2228', roughness: 0.1, metalness: 0.2 }), 0.3, 0.772, -0.18);
  add(g, new THREE.CylinderGeometry(0.11, 0.1, 0.06, 32), M({ color: '#141822', roughness: 0.7 }), -0.42, 0.78, -0.22); add(g, new THREE.CylinderGeometry(0.115, 0.115, 0.012, 32), M({ color: '#0b0d12', roughness: 0.4 }), -0.42, 0.81, -0.22);
  const badge = add(g, new THREE.CircleGeometry(0.02, 24).rotateX(-0.3), brass, -0.42, 0.79, -0.11, false); void badge;
  /* a porthole of morning light behind, and its beam across the desk */
  const port = canvasTex(256, 256); { const c = port.g; const gr = c.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#fff6e2'); gr.addColorStop(0.8, '#cfe0ec'); gr.addColorStop(1, '#9fb4c4'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256); }
  add(g, new THREE.CircleGeometry(0.16, 48), new THREE.MeshBasicMaterial({ map: port.tex, toneMapped: false }), 0.55, 1.15, -0.548, false);
  add(g, new THREE.TorusGeometry(0.17, 0.02, 12, 48), brass, 0.55, 1.15, -0.54);
  g.add(new THREE.HemisphereLight('#c9d4e0', '#2a1c12', 0.25));
  const sun = new THREE.SpotLight('#ffe9cc', 26, 0, 0.35, 0.6, 2); sun.position.set(0.7, 1.35, -0.85); sun.target.position.set(0.0, 0.75, 0.1); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0003; g.add(sun, sun.target);
  const lamp = new THREE.SpotLight('#ffbf7a', 8, 0, 0.7, 0.8, 2); lamp.position.set(-0.5, 1.4, 0.4); lamp.target.position.set(0, 0.75, 0); g.add(lamp, lamp.target);
  const glint = new THREE.PointLight('#fff2d0', 0, 0.5, 2); g.add(glint);
  const keys: Key[] = [[0, -0.04, 1.2, 0.36, -0.06, 0.75, -0.03, 32], [KEYHIT - 0.1, -0.02, 1.08, 0.3, -0.05, 0.75, 0.0, 30], [KEYHIT + 0.9, 0.2, 0.9, 0.3, 0.24, 0.756, 0.1, 28], [LOCK, 0.29, 0.85, 0.24, 0.245, 0.756, 0.095, 25]];
  const update = (t: number) => { drawList(list.g, t); list.tex.needsUpdate = true; const s = ramp(t, KEYHIT + 0.6, 2.2); glint.position.set(0.15 + 0.2 * s, 0.8, 0.0 + 0.2 * s); glint.intensity = 0.6 * Math.sin(Math.PI * s); return herm(keys, t); };
  return { g, update };
};

/* ------------------------------------------------------------------ the ship at night on a glass-flat sea */
const SX = 5000, CN = new THREE.Vector3(0, 46, -96.5); // crow's nest (local to the ship group)
const buildShip = (gl: THREE.WebGLRenderer) => {
  const g = new THREE.Group(); g.position.x = SX; const env = makeEnv(gl, '#ffb36b', '#3a4a66');
  /* sea: a mirror, because that night the Atlantic was "like glass" */
  const sea = new Reflector(new THREE.PlaneGeometry(9000, 9000), { textureWidth: 1600, textureHeight: 900, color: 0x5d6c7c, clipBias: 0.003 }); sea.rotation.x = -Math.PI / 2; g.add(sea);
  /* hull: top-view outline extruded upward; black below, white superstructure above */
  const sh = new THREE.Shape(); sh.moveTo(0, 134); sh.quadraticCurveTo(14, 105, 14, 60); sh.lineTo(14, -118); sh.quadraticCurveTo(14, -134, 0, -134); sh.quadraticCurveTo(-14, -134, -14, -118); sh.lineTo(-14, 60); sh.quadraticCurveTo(-14, 105, 0, 134);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 26, bevelEnabled: false, curveSegments: 24 }); hg.rotateX(-Math.PI / 2); hg.translate(0, -8, 0);
  const black = M({ color: '#0d0e10', roughness: 0.55, metalness: 0.2 }), white = M({ color: '#d8d4cc', roughness: 0.6 }), buff = M({ color: '#8a6a3a', roughness: 0.7 }), dark = M({ color: '#0a0a0a', roughness: 0.6 });
  const hull = new THREE.Mesh(hg, black); g.add(hull);
  add(g, new THREE.BoxGeometry(26.5, 1.0, 230), M({ color: '#7a2a1a', roughness: 0.7 }), 0, -0.4, 0, false); // boot topping at the waterline
  add(g, new THREE.BoxGeometry(22, 7, 175), white, 0, 21.5, 12); add(g, new THREE.BoxGeometry(18, 3.2, 120), white, 0, 26.6, 4); add(g, new THREE.BoxGeometry(14, 3, 10), white, 0, 29.6, -52);
  /* four funnels, raked */
  [-42, -14, 14, 42].map((z) => { const f = new THREE.Group(); f.position.set(0, 28, z); f.rotation.x = 0.08; g.add(f); add(f, new THREE.CylinderGeometry(3.1, 3.3, 22, 32), buff, 0, 11, 0); add(f, new THREE.CylinderGeometry(3.15, 3.15, 4, 32), dark, 0, 20.5, 0); return f; });
  /* masts, crow's nest, rigging */
  const mastM = M({ color: '#6a5a44', roughness: 0.7 }); add(g, new THREE.CylinderGeometry(0.35, 0.5, 60, 12), mastM, 0, 45, -95); add(g, new THREE.CylinderGeometry(0.35, 0.5, 55, 12), mastM, 0, 43, 110);
  const nest = new THREE.Group(); nest.position.copy(CN); g.add(nest);
  add(nest, new THREE.CylinderGeometry(1.15, 1.05, 1.25, 32, 1, true), M({ color: '#4a4036', roughness: 0.6, side: THREE.DoubleSide }), 0, 0, 0); add(nest, new THREE.CylinderGeometry(1.2, 1.2, 0.08, 32), M({ color: '#2a241e', roughness: 0.6 }), 0, -0.62, 0);
  const rig = new THREE.LineBasicMaterial({ color: '#3a3a3e', transparent: true, opacity: 0.6 });
  const line = (a: number[], b: number[]) => g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]), rig));
  line([0, 75, -95], [0, 75, 110]); line([0, 75, -95], [0, 12, -133]); line([0, 70, 110], [0, 12, 133]); for (const s of [-1, 1]) { line([0, 60, -95], [s * 13, 18, -80]); line([0, 60, 110], [s * 13, 18, 95]); }
  /* lights: rows of warm portholes and deck windows, mirrored in the sea */
  const r = rng(9); const pm = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffcf8a').multiplyScalar(2.2), toneMapped: false }), 1600); let n = 0; const o = new THREE.Object3D();
  for (const s of [-1, 1]) { for (const y of [7, 10, 13, 16]) for (let z = -112; z < 116; z += 2.6) { if (r() < 0.3) continue; o.position.set(s * 14.05, y, z); o.rotation.set(0, s * Math.PI / 2, 0); o.updateMatrix(); pm.setMatrixAt(n++, o.matrix); }
    for (const y of [19.5, 23]) for (let z = -72; z < 98; z += 2.2) { if (r() < 0.25) continue; o.position.set(s * 11.05, y, z); o.rotation.set(0, s * Math.PI / 2, 0); o.updateMatrix(); pm.setMatrixAt(n++, o.matrix); } }
  pm.count = n; g.add(pm);
  const mast = glowSprite('#fff2d8', 4, 0.9); mast.position.set(0, 58, -95); g.add(mast);
  for (const z of [-60, 0, 60]) { const l = new THREE.PointLight('#ffc27a', 260, 70, 2); l.position.set(0, 32, z); g.add(l); }
  /* the iceberg, dark on dark, far ahead */
  const ig = new THREE.IcosahedronGeometry(30, 5); const pa = ig.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
  for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); const d = 1 + 0.18 * Math.sin(v.x * 0.15 + 1) * Math.cos(v.z * 0.13) + 0.1 * Math.sin(v.y * 0.4 + v.x * 0.2); v.multiplyScalar(d); if (v.y > 0) v.y *= 1.1; pa.setXYZ(i, v.x, v.y, v.z); } ig.computeVertexNormals();
  const berg = new THREE.Mesh(ig, M({ color: '#9fb2c2', roughness: 0.85, flatShading: true })); berg.scale.set(2.0, 1.4, 2.4); berg.position.set(16, 2, -1000);
  const bergL = new THREE.DirectionalLight('#9fb8d8', 0.6); bergL.position.set(-200, 300, -300); bergL.target = berg; g.add(bergL); g.add(berg);
  /* sky: stars, a faint milky band */
  const N = 4200, sp = new Float32Array(N * 3), sc = new Float32Array(N * 3); const rs = rng(21);
  for (let i = 0; i < N; i++) { const th = rs() * Math.PI * 2, ph = Math.acos(rs() * 0.98); const band = rs() < 0.45; const tt = band ? (rs() - 0.5) * 0.35 : 0; const dir = new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)); if (band) dir.set(Math.cos(th) * 0.9, 0.35 + tt, Math.sin(th) * 0.9).normalize(); dir.multiplyScalar(3600); sp.set([dir.x, Math.abs(dir.y) + 20, dir.z], i * 3); const b = 0.45 + rs() * 0.55; sc.set([b * (0.85 + rs() * 0.15), b * 0.92, b], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, fog: false, toneMapped: false })));
  g.add(new THREE.HemisphereLight('#3a4c6a', '#05070a', 0.35));
  /* the locker on the back wall of the crow's nest, facing forward; binoculars behind its little window */
  const locker = new THREE.Group(); locker.position.set(0, -0.05, 0.92); locker.rotation.y = Math.PI; nest.add(locker);
  const wood = M({ map: woodTex(3, '#5a3a22', 512, 512), roughness: 0.55 }); const brass = M({ color: '#c99a4a', metalness: 1, roughness: 0.28, envMap: env, envMapIntensity: 1.2 });
  add(locker, new THREE.BoxGeometry(0.48, 0.34, 0.24), wood, 0, 0, -0.12);
  add(locker, new THREE.BoxGeometry(0.44, 0.3, 0.02), wood, 0, 0, 0.005);
  add(locker, new THREE.PlaneGeometry(0.2, 0.11), new THREE.MeshStandardMaterial({ color: '#9fb2c0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25 }), -0.07, 0.04, 0.016, false);
  const binoc = new THREE.Group(); binoc.position.set(-0.07, 0.03, -0.03); locker.add(binoc); const bm = M({ color: '#1a1714', roughness: 0.4 });
  for (const x of [-0.035, 0.035]) add(binoc, new THREE.CylinderGeometry(0.022, 0.026, 0.11, 24).rotateX(Math.PI / 2), bm, x, 0, 0);
  const tagT = canvasTex(512, 160); { const c = tagT.g; c.fillStyle = '#e4d6b4'; c.fillRect(0, 0, 512, 160); c.fillStyle = '#231a10'; c.textAlign = 'center'; c.font = `700 46px ${SERIF}`; c.fillText('SECOND OFFICER', 256, 66); c.fillText('S.S. TITANIC', 256, 124); }
  add(binoc, new THREE.PlaneGeometry(0.1, 0.031), new THREE.MeshStandardMaterial({ map: tagT.tex, roughness: 0.9 }), 0, -0.03, 0.058, false);
  add(locker, new THREE.CylinderGeometry(0.03, 0.03, 0.006, 32).rotateX(Math.PI / 2), brass, 0.14, -0.02, 0.018);
  add(locker, new THREE.CylinderGeometry(0.0055, 0.0055, 0.01, 16).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#000' }), 0.14, -0.012, 0.02, false);
  add(locker, new THREE.BoxGeometry(0.004, 0.014, 0.01), new THREE.MeshBasicMaterial({ color: '#000' }), 0.14, -0.024, 0.02, false);
  for (const y of [0.1, -0.1]) add(locker, new THREE.BoxGeometry(0.02, 0.05, 0.012), brass, -0.215, y, 0.018);
  /* the key, for the title: it slides into the keyhole and turns */
  const tk = brassKey(brass); tk.rotation.set(0, Math.PI / 2, 0); const holder = new THREE.Group(); holder.position.set(0.14, -0.018, 0.02); locker.add(holder); holder.add(tk); tk.position.set(0, 0, 0.11);
  const hole = glowSprite('#ffd08a', 0.12, 0); hole.position.set(0.14, -0.018, 0.03); locker.add(hole);
  const lantern = new THREE.PointLight('#ffb867', 3.2, 3, 2); lantern.position.set(0.5, 0.6, -0.2); nest.add(lantern);
  const coldL = new THREE.PointLight('#8aa6c8', 0.8, 3, 2); coldL.position.set(-0.4, 0.4, -0.4); nest.add(coldL);
  const W2 = new THREE.Vector3(); const lockerWorld = () => { locker.updateMatrixWorld(true); return locker.localToWorld(new THREE.Vector3(0, 0, 0)).sub(g.position); };
  g.updateMatrixWorld(true); const L = lockerWorld(); const KH = locker.localToWorld(new THREE.Vector3(0.14, -0.018, 0.02)).sub(g.position); void W2;
  /* camera: in front of the locker (it faces -z, towards the bow), then a long pull back out to sea, ahead of the bow */
  const keys = at(SX, [[LOCK, L.x + 0.25, L.y + 0.12, L.z - 0.62, L.x, L.y, L.z, 36], [PULL, L.x + 0.1, L.y + 0.03, L.z - 0.34, L.x + 0.04, L.y - 0.01, L.z, 32]]);
  /* the pull-back: one long move along smooth curves (no overshoot), slow at first then racing out */
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const posC = new THREE.CatmullRomCurve3([V(L.x + 0.1, L.y + 0.03, L.z - 0.34), V(CN.x + 0.3, CN.y + 1.6, CN.z - 3.0), V(10, 66, -60), V(40, 64, 120), V(55, 62, 250)], false, 'centripetal');
  const lookC = new THREE.CatmullRomCurve3([V(L.x + 0.04, L.y - 0.01, L.z), V(CN.x, CN.y - 0.5, CN.z + 1.5), V(0, 25, -200), V(0, 15, -480), V(0, 14, -560)], false, 'centripetal');
  const keysT = at(SX, [[INSERT, KH.x + 0.07, KH.y + 0.03, KH.z - 0.2, KH.x, KH.y, KH.z, 30], [NEXT, KH.x + 0.03, KH.y + 0.015, KH.z - 0.12, KH.x, KH.y, KH.z, 28]]);
  const update = (t: number) => {
    const ins = eo(ramp(t, INSERT, TITLE - INSERT)); tk.position.z = 0.11 * (1 - ins); tk.visible = t >= INSERT - 0.05;
    const turn = eo(ramp(t, TITLE, 0.12)); holder.rotation.z = -Math.PI / 2 * turn;
    (hole.material as THREE.SpriteMaterial).opacity = t >= TITLE ? 0.9 * Math.exp(-(t - TITLE) * 1.2) : 0;
    if (t >= INSERT) return herm(keysT, t);
    if (t < PULL) return herm(keys, t);
    const u = Math.pow(eio(ramp(t, PULL, INSERT - PULL)), 1.6); const ps = posC.getPoint(u), lk = lookC.getPoint(Math.min(1, u * 1.1));
    return [ps.x + SX, ps.y, ps.z, lk.x + SX, lk.y, lk.z, 32 + 10 * u];
  };
  return { g, update };
};

/* ------------------------------------------------------------------ the world */
const World: React.FC<{ t: number }> = ({ t }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo(() => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.background = new THREE.Color('#000');
    const desk = buildDesk(gl), ship = buildShip(gl); scene.add(desk.g, ship.g); return { desk, ship }; }, [scene, gl]);
  const onDesk = t < LOCK; S.desk.g.visible = onDesk; S.ship.g.visible = !onDesk;
  scene.fog = onDesk ? new THREE.FogExp2('#0d0b09', 0.2) : null;
  const p = onDesk ? S.desk.update(t) : S.ship.update(t);
  const cam = camera as THREE.PerspectiveCamera; const hand = 0.0015;
  cam.position.set(p[0] + Math.sin(t * 0.7) * hand, p[1] + Math.sin(t * 0.9 + 1) * hand, p[2]); cam.lookAt(p[3], p[4], p[5]); cam.fov = p[6]; cam.near = onDesk || t >= INSERT ? 0.01 : 0.05; cam.far = onDesk ? 20 : 9000; cam.updateProjectionMatrix();
  return null;
};

const BAR = 100;
const Overlay: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H);
    vignette(g, 0.55); grain(g, 11 + Math.floor(t * 30), 0.05);
    let blk = Math.max(1 - ramp(t, 0, 0.6), ramp(t, KEY_LEN_S - 0.5, 0.5)); for (const c of [LOCK, INSERT]) blk = Math.max(blk, 1 - clamp(Math.abs(t - c) / 0.12));
    if (blk > 0) { g.fillStyle = `rgba(0,0,0,${blk})`; g.fillRect(0, 0, W, H); }
    /* title: on the turn of the key */
    if (t >= TITLE) { const a = ramp(t, TITLE, 0.15) * (1 - ramp(t, NEXT - 0.4, 0.4)); const s = 1 + 0.06 * (1 - eo(ramp(t, TITLE, 0.5)));
      if (t < TITLE + 0.2) { g.fillStyle = `rgba(255,220,160,${0.35 * (1 - ramp(t, TITLE, 0.2))})`; g.fillRect(0, 0, W, H); }
      g.save(); g.globalAlpha = a; g.translate(960, 470); g.scale(s, s); g.font = `700 150px ${SERIF}`; g.textAlign = 'center'; const gr = g.createLinearGradient(0, -130, 0, 20); gr.addColorStop(0, '#fff3cc'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#b07a2c');
      g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 30; g.fillStyle = gr; g.fillText('《一把钥匙》', 0, 0); g.restore();
      txt(g, '它真的能救下泰坦尼克号吗？', 960, 580, 46, INK, { w: 700, alpha: a * ramp(t, TITLE + 0.8, 0.4) }); txt(g, 'R.M.S. TITANIC · 14 APRIL 1912', 960, 640, 26, 'rgba(243,237,226,.6)', { w: 500, f: SERIF, alpha: a * ramp(t, TITLE + 1.1, 0.4) });
      txt(g, '— VIBE知识大赏 —', 960, 700, 24, 'rgba(243,237,226,.5)', { w: 500, alpha: a * ramp(t, TITLE + 1.4, 0.4) }); }
    g.fillStyle = '#000'; g.fillRect(0, 0, W, BAR); g.fillRect(0, H - BAR, W, BAR);
    mark(g, t >= TITLE ? 0 : 0.9 * ramp(t, 0.6, 0.5));
    const L = LINES.find(([a, b]) => t >= a && t < b); if (L) subtitle(g, L[2], ramp(t, L[0], 0.12) * (1 - ramp(t, L[1] - 0.1, 0.1)));
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};

export const KeyFilm: React.FC = () => {
  const f = useCurrentFrame(); const t = f / 30;
  const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + LINES.map((l) => l[2]).join('') + '《一把钥匙》它真的能救下泰坦尼克号吗？R.M.S.TITANIC14APRIL1912WHITESTARLINELISTOFOFFICERSSOUTHAMPTONCommanderChiefOfficerFirstSecondThirdFourthFifthSixthE.J.SmithH.T.WildeW.M.MurdochD.BlairC.H.LightollerH.J.PitmanJ.G.BoxhallH.G.LoweJ.P.MoodyCROW\'SNESTS.S.“”—VIBE知识大赏';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `700 150px ${SERIF}`, `700 46px ${SERIF}`, `700 64px ${SERIF}`, `600 34px ${SERIF}`, `500 44px ${SERIF}`, `italic 600 46px ${SERIF}`, `700 58px ${SERIF}`, `700 46px ${SANS}`, `500 22px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3, preserveDrawingBuffer: true }} camera={{ fov: 36, near: 0.01, far: 9000 }}>
        <World t={t} />
      </ThreeCanvas>
      <AbsoluteFill style={{ background: t < LOCK ? 'linear-gradient(180deg, rgba(90,60,30,.18), rgba(30,20,12,.25))' : 'linear-gradient(180deg, rgba(30,50,80,.3), rgba(10,20,35,.32))', mixBlendMode: 'soft-light' }} />
      <Overlay t={t} />
    </AbsoluteFill>
  );
};
