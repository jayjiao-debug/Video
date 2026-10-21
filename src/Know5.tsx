/* 《身体里住着两个人》 multiple-personality version: the new scenes.
   a child and the gate of dissociation; glass booths with one person in different colours and a clock with a missing hour;
   the film version crossed out, the quiet switch at an office desk, alone; a therapy room; the colours coming back into one.
   Everything code-drawn. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { M, add, canvasTex, herm, Key, beam } from './Sets3D';
import { posable, sign } from './Know2';
import { glowSprite } from './Set';
import { floorTex } from './PuppetTest';
import { ramp, eio, eo, SANS, SERIF, GOLD } from './lib';

const at = (X: number, keys: Key[]): Key[] => keys.map(([t, a, b, c, d, e, f, fov]) => [t, a + X, b, c, d + X, e, f, fov]);
const room = (g: THREE.Group, floor = '#3a3129', wall = '#1c1916', x = 0) => {
  const ft = floorTex(); ft.repeat.set(3, 3); add(g, new THREE.PlaneGeometry(14, 14).rotateX(-Math.PI / 2), M({ map: ft, color: floor, roughness: 0.6 }), x, 0, 0, false);
  const wl = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 7, 64, 1, true, Math.PI * 0.55, Math.PI * 0.9), M({ color: wall, roughness: 0.95, side: THREE.BackSide })); wl.position.set(x, 3.5, 1); wl.receiveShadow = true; g.add(wl);
};
const tint = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.3, clearcoat: 0.7, transparent: true, opacity: 1 });
const fade = (m: THREE.Mesh) => m.material as THREE.MeshBasicMaterial;
export const ALTERS = ['#d8d2c8', '#9fbfe8', '#e8aaa0', '#a8d8b8'];

/* ================================================================== a child, the hurt behind him, and the gate that comes down */
export const CHILD_X = 880;
export const buildChild = (o: { t0: number; hurt: number; gate: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = CHILD_X; room(g, '#2a2420', '#120f0e');
  const kid = posable(); kid.root.scale.setScalar(0.62); kid.root.position.set(0, 0, 0.4); g.add(kid.root); kid.head.rotation.x = 0.32; kid.arms.forEach((a, i) => { a.sh.rotation.set(-0.25, 0, i ? -0.18 : 0.18); a.el.rotation.x = -0.9; });
  const redC = canvasTex(512, 512); { const c = redC.g; const gr = c.createRadialGradient(256, 256, 10, 256, 256, 256); gr.addColorStop(0, 'rgba(255,60,40,1)'); gr.addColorStop(0.45, 'rgba(180,20,20,.55)'); gr.addColorStop(1, 'rgba(60,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512); }
  const red = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), new THREE.MeshBasicMaterial({ map: redC.tex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); red.position.set(0, 1.4, -1.6); g.add(red);
  const redL = new THREE.PointLight('#ff3a28', 0, 5, 2); redL.position.set(0, 1.2, -1.2); g.add(redL);
  /* the gate: frosted glass in a dark frame, dropping from above */
  const gate = new THREE.Group(); g.add(gate);
  const glassM = new THREE.MeshStandardMaterial({ color: '#9aa4ac', roughness: 0.95, transparent: true, opacity: 0.72, depthWrite: false });
  add(gate, new THREE.PlaneGeometry(2.6, 2.4), glassM, 0, 1.2, -0.7, false);
  const frameM = M({ color: '#1a1c1e', metalness: 0.7, roughness: 0.4 }); add(gate, new THREE.BoxGeometry(2.7, 0.08, 0.08), frameM, 0, 2.42, -0.7); add(gate, new THREE.BoxGeometry(2.7, 0.06, 0.08), frameM, 0, 0.0, -0.7);
  for (const x of [-1.33, 1.33]) add(g, new THREE.BoxGeometry(0.06, 3.0, 0.1), frameM, x, 1.5, -0.7);
  const sg = sign('解离', '像拉下一道闸，让痛进不来', GOLD, 1.5, 0.45, 150); sg.position.set(0, 1.55, 0.2); g.add(sg);
  g.add(new THREE.HemisphereLight('#6d7a8a', '#120e0b', 0.3));
  const key = new THREE.SpotLight('#d8e2ee', 30, 0, 0.5, 0.7, 2); key.position.set(0.8, 3, 2.4); key.target.position.set(0, 0.6, 0.4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); g.add(key, key.target);
  const keys = at(CHILD_X, [[o.t0, 0.0, 1.2, 3.4, 0, 0.8, -0.4, 40], [o.gate - 0.1, 0.0, 1.15, 2.7, 0, 1.0, -0.4, 40], [o.t1, 0.0, 1.2, 3.0, 0, 1.1, -0.4, 40]]);
  const update = (t: number) => {
    const pulse = 0.75 + 0.25 * Math.sin(t * 5.2) * Math.sin(t * 1.7);
    const grow = eio(ramp(t, o.t0 + 0.4, o.gate - o.t0 - 0.4)); const after = t >= o.gate ? 0.45 : 1;
    fade(red).opacity = Math.min(1, (0.45 + 1.2 * grow) * pulse * after); redL.intensity = (4 + 22 * grow) * pulse * after;
    const k = t < o.gate - 0.35 ? 0 : eo(ramp(t, o.gate - 0.35, 0.35)); const bounce = t > o.gate ? 0.05 * Math.exp(-(t - o.gate) * 9) * Math.cos((t - o.gate) * 30) : 0;
    gate.position.y = 3.4 * (1 - k) + bounce; glassM.opacity = 0.62;
    fade(sg).opacity = ramp(t, o.gate + 0.4, 0.4);
    kid.torso.position.y = 1.0 + 0.004 * Math.sin(t * 2.2);
    const p = herm(keys, t); const sh = t > o.gate ? 0.015 * Math.exp(-(t - o.gate) * 6) : 0; p[1] += sh * Math.sin(t * 60); return p;
  };
  return { g, update };
};

/* ================================================================== glass booths: one person, four colours; the walls frost; one goes dark; the clock with a lost hour */
export const BOOTH_X = 940;
export const buildBooths = (o: { t0: number; frost: number; dark: number; clock: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = BOOTH_X; room(g, '#2a2622', '#16181b');
  const XS = [-1.2, -0.4, 0.4, 1.2], BW = 0.78, BH = 2.2, Z = -0.2;
  const glass = new THREE.MeshStandardMaterial({ color: '#dfe8f0', roughness: 0.2, metalness: 0.0, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide });
  const frameM = M({ color: '#1d2023', metalness: 0.6, roughness: 0.4 });
  add(g, new THREE.BoxGeometry(3.3, 0.06, 0.9), frameM, 0, BH, Z); add(g, new THREE.BoxGeometry(3.3, 0.04, 0.9), frameM, 0, 0.02, Z);
  for (let i = 0; i <= 4; i++) { const x = -1.6 + i * 0.8; add(g, new THREE.PlaneGeometry(0.86, BH).rotateY(Math.PI / 2), glass, x, BH / 2, Z, false); add(g, new THREE.BoxGeometry(0.04, BH, 0.04), frameM, x, BH / 2, Z + 0.44); }
  const fronts = XS.map((x) => { const m = new THREE.MeshStandardMaterial({ color: '#0b0c0e', roughness: 0.4, transparent: true, opacity: 0, depthWrite: false }); add(g, new THREE.PlaneGeometry(BW, BH), m, x, BH / 2, Z + 0.45, false); return m; });
  const people = XS.map((x, i) => { const m = posable(tint(ALTERS[i])); m.root.position.set(x, 0, Z); m.root.rotation.y = -x * 0.12; m.head.rotation.y = [0.2, -0.1, 0.15, -0.2][i]; g.add(m.root);
    const l = new THREE.PointLight(ALTERS[i], 1.2, 1.6, 2); l.position.set(x, 2.0, Z + 0.2); g.add(l); return m; });
  const labels = ['身份 A', '身份 B', '身份 C', '身份 D'].map((s, i) => { const sg = sign(s, '', ALTERS[i] === '#d8d2c8' ? '#f3ede2' : ALTERS[i], 0.72, 0.18, 120); sg.position.set(XS[i], BH - 0.18, Z + 0.47); g.add(sg); return sg; });
  const qm = sign('？', '', '#f3ede2', 0.4, 0.4, 600); qm.position.set(XS[3], 1.3, Z + 0.47); g.add(qm);
  /* the clock above, with an hour missing */
  const clock = canvasTex(1024, 1024); const CK = new THREE.Vector3(0, 3.05, -0.9);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 64), new THREE.MeshBasicMaterial({ map: clock.tex, toneMapped: false })); face.position.copy(CK); g.add(face);
  add(g, new THREE.TorusGeometry(0.5, 0.025, 12, 64), M({ color: '#2a2a2c', metalness: 0.8, roughness: 0.3 }), CK.x, CK.y, CK.z + 0.01);
  const cs = sign('时间“丢了”一段', '', '#f3ede2', 1.4, 0.16, 110); cs.position.set(0, 2.42, -0.88); g.add(cs);
  const drawClock = (miss: number, t: number) => { const c = clock.g; c.fillStyle = '#ece6d8'; c.beginPath(); c.arc(512, 512, 510, 0, 7); c.fill();
    c.fillStyle = '#1b1712'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 110px ${SERIF}`; for (let h = 1; h <= 12; h++) { const a = (h / 12) * Math.PI * 2 - Math.PI / 2; c.fillText(String(h), 512 + Math.cos(a) * 390, 512 + Math.sin(a) * 390); }
    if (miss > 0) { c.fillStyle = `rgba(10,10,12,${miss})`; c.beginPath(); c.moveTo(512, 512); c.arc(512, 512, 505, -Math.PI / 2, -Math.PI / 2 + Math.PI * 0.5 * miss); c.closePath(); c.fill(); c.fillStyle = `rgba(255,200,110,${miss})`; c.font = `900 220px ${SANS}`; c.fillText('?', 512 + 200, 512 - 200); }
    const mh = (t * 0.6) % (Math.PI * 2); c.strokeStyle = '#1b1712'; c.lineCap = 'round'; c.lineWidth = 22; c.beginPath(); c.moveTo(512, 512); c.lineTo(512 + Math.cos(2.2 - Math.PI / 2) * 230, 512 + Math.sin(2.2 - Math.PI / 2) * 230); c.stroke();
    c.lineWidth = 12; c.beginPath(); c.moveTo(512, 512); c.lineTo(512 + Math.cos(mh - Math.PI / 2) * 340, 512 + Math.sin(mh - Math.PI / 2) * 340); c.stroke(); clock.tex.needsUpdate = true; };
  g.add(new THREE.HemisphereLight('#7d8ea0', '#131110', 0.35));
  const key = new THREE.SpotLight('#ffe6c8', 50, 0, 0.7, 0.6, 2); key.position.set(0.5, 3.6, 3.0); key.target.position.set(0, 1.0, Z); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); g.add(key, key.target);
  const keys = at(BOOTH_X, [[o.t0, 0.0, 1.5, 4.4, 0, 1.35, -0.3, 40], [o.frost, 0.3, 1.4, 3.8, 0.1, 1.2, -0.3, 40], [o.dark, 0.8, 1.4, 3.5, 0.6, 1.2, -0.3, 38], [o.clock - 0.3, 0.3, 1.9, 3.4, 0.1, 1.9, -0.3, 40], [o.clock + 0.6, 0.0, 2.6, 2.3, 0, 2.85, -0.9, 38], [o.t1, 0.0, 2.65, 1.9, 0, 2.85, -0.9, 36]]);
  const update = (t: number) => {
    const fr = eio(ramp(t, o.frost, 1.2)); glass.opacity = 0.1 + 0.65 * fr; glass.roughness = 0.2 + 0.75 * fr; glass.color.set('#dfe8f0').lerp(new THREE.Color('#f4f6f8'), fr);
    const dk = eio(ramp(t, o.dark, 0.8)); fronts[3].opacity = 0.93 * dk; fade(qm).opacity = dk; fade(labels[3]).opacity = 1 - 0.6 * dk;
    labels.forEach((l, i) => { if (i < 3) fade(l).opacity = ramp(t, o.t0 + 0.3 + i * 0.2, 0.3); fade(l).opacity *= 1 - ramp(t, o.clock - 0.2, 0.3); }); fade(qm).opacity *= 1 - ramp(t, o.clock - 0.2, 0.3);
    drawClock(eio(ramp(t, o.clock + 0.4, 0.8)), t); fade(cs).opacity = ramp(t, o.clock + 1.0, 0.4);
    people.forEach((m, i) => { m.torso.position.y = 1.0 + 0.003 * Math.sin(t * 1.3 + i); });
    return herm(keys, t);
  };
  return { g, update };
};

/* ================================================================== the film version crossed out; the quiet switch at a desk; alone */
export const SCREEN_X = 1000;
export const buildScreenOffice = (o: { t0: number; drop: number; office: number; alone: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = SCREEN_X;
  /* cinema */
  add(g, new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2), M({ color: '#151212', roughness: 0.9 }), 0, 0, 0, false);
  const scr = canvasTex(1920, 1080); { const c = scr.g; const bg = c.createLinearGradient(0, 0, 1920, 1080); bg.addColorStop(0, '#2a0606'); bg.addColorStop(1, '#070203'); c.fillStyle = bg; c.fillRect(0, 0, 1920, 1080);
    c.save(); c.translate(960, 600); for (const [s, col] of [[-1, '#c8281e'], [1, '#2a4a8a']] as const) { c.save(); c.beginPath(); if (s < 0) { c.moveTo(-600, -600); c.lineTo(10, -600); c.lineTo(-30, -200); c.lineTo(25, 100); c.lineTo(-20, 600); c.lineTo(-600, 600); } else { c.moveTo(600, -600); c.lineTo(10, -600); c.lineTo(-30, -200); c.lineTo(25, 100); c.lineTo(-20, 600); c.lineTo(600, 600); } c.clip();
      c.fillStyle = col; c.beginPath(); c.ellipse(s * 18, -150, 170, 220, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(-420, 480); c.quadraticCurveTo(0, 30, 420, 480); c.fill(); c.restore(); }
    c.restore(); c.textAlign = 'left'; c.fillStyle = 'rgba(255,255,255,.75)'; c.font = `700 64px ${SANS}`; c.fillText('电影里的多重人格', 80, 120); c.font = `900 120px ${SANS}`; c.fillStyle = '#ffd9cc'; c.fillText('一秒变身', 80, 900); c.fillText('人格行凶', 1250, 900); }
  const screen = add(g, new THREE.PlaneGeometry(4.0, 2.25), new THREE.MeshBasicMaterial({ map: scr.tex, toneMapped: false }), 0, 1.9, -2.4, false); void screen;
  const xs = canvasTex(1024, 1024); { const c = xs.g; c.strokeStyle = '#ff2a1a'; c.lineCap = 'round'; c.lineWidth = 120; c.beginPath(); c.moveTo(170, 170); c.lineTo(854, 854); c.moveTo(854, 170); c.lineTo(170, 854); c.stroke(); }
  const X = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), new THREE.MeshBasicMaterial({ map: xs.tex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); X.position.set(0, 1.9, -2.3); g.add(X);
  const ns = sign('不是它常见的样子', '', '#f3ede2', 2.4, 0.26, 120); ns.position.set(0, 0.62, -2.3); g.add(ns);
  const seat = M({ color: '#2a0f10', roughness: 0.85 }); for (let r = 0; r < 3; r++) for (let i = -4; i <= 4; i++) add(g, new RoundedBoxGeometry(0.5, 0.75, 0.12, 2, 0.04), seat, i * 0.58, 0.5 + r * 0.15, 0.4 + r * 0.9);
  const glowS = new THREE.PointLight('#ff4a3a', 2.5, 6, 2); glowS.position.set(0, 1.9, -1.6); g.add(glowS);
  g.add(new THREE.HemisphereLight('#3a3a46', '#0a0808', 0.15));
  /* office, 12 m to the side */
  const OX = 12; const of = new THREE.Group(); of.position.x = OX; g.add(of);
  const ft = floorTex(); ft.repeat.set(3, 3); add(of, new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2), M({ map: ft, color: '#6a6660', roughness: 0.6 }), 0, 0, 0, false);
  add(of, new THREE.PlaneGeometry(10, 4), M({ color: '#4a4e52', roughness: 0.95 }), 0, 2, -1.6, false);
  const deskM = M({ color: '#cfc8bc', roughness: 0.5 }), monM = M({ color: '#141516', roughness: 0.3 });
  const desks = [-0.6, 0.75].map((x) => { add(of, new THREE.BoxGeometry(1.0, 0.04, 0.6), deskM, x, 1.05, -0.5); add(of, new THREE.BoxGeometry(0.05, 1.05, 0.5), deskM, x - 0.45, 0.525, -0.5); add(of, new THREE.BoxGeometry(0.05, 1.05, 0.5), deskM, x + 0.45, 0.525, -0.5);
    add(of, new THREE.BoxGeometry(0.55, 0.34, 0.03), monM, x, 1.32, -0.7); const sc = add(of, new THREE.PlaneGeometry(0.52, 0.31), new THREE.MeshBasicMaterial({ color: '#7fa6c8', toneMapped: false }), x, 1.32, -0.684, false); return sc; });
  const shiftM = tint(ALTERS[0]); const A = posable(shiftM); A.root.position.set(-0.6, 0, -0.05); A.root.rotation.y = Math.PI * 1.05; of.add(A.root);
  const B = posable(tint('#cfc9bf')); B.root.position.set(0.75, 0, -0.05); B.root.rotation.y = Math.PI * 0.97; of.add(B.root);
  for (const m of [A, B]) m.arms.forEach((a) => { a.sh.rotation.x = 0.6; a.el.rotation.x = 0.7; });
  const sA = sign('悄悄切换了', '', '#9fbfe8', 0.9, 0.12, 110); sA.position.set(-0.6, 2.0, 0.0); of.add(sA);
  const sB = sign('同事：没察觉', '', '#c9c2b6', 0.9, 0.12, 110); sB.position.set(0.75, 2.0, 0.0); of.add(sB);
  const room1 = new THREE.SpotLight('#fff1dc', 40, 0, 0.9, 0.7, 2); room1.position.set(0, 3.6, 1.6); room1.target.position.set(0, 0.8, -0.4); room1.castShadow = true; room1.shadow.mapSize.set(1024, 1024); of.add(room1, room1.target);
  const solo = new THREE.SpotLight('#ffe2bf', 0, 0, 0.22, 0.5, 2); solo.position.set(-0.6, 4.2, 0.4); solo.target.position.set(-0.6, 0.9, -0.05); solo.castShadow = true; of.add(solo, solo.target);
  const amb = new THREE.HemisphereLight('#b8c4d0', '#2a2622', 0.6); of.add(amb);
  const keys = [[o.t0, 0.0, 1.3, 3.2, 0, 1.75, -2.4, 40], [o.office - 0.01, 0.0, 1.35, 2.7, 0, 1.8, -2.4, 40]].map(([t, a, b, c, d, e, f, fov]) => [t, a + SCREEN_X, b, c, d + SCREEN_X, e, f, fov]);
  const keysO = at(SCREEN_X + OX, [[o.office, 0.1, 1.65, 3.2, 0.05, 1.3, -0.4, 38], [o.alone, -0.3, 1.55, 2.6, -0.45, 1.35, -0.3, 36], [o.t1, -0.55, 1.5, 2.1, -0.6, 1.4, -0.2, 34]]);
  const update = (t: number) => {
    const xk = ramp(t, o.drop, 0.12); fade(X).opacity = xk; X.scale.setScalar(1 + 0.6 * (1 - eo(xk))); fade(ns).opacity = ramp(t, o.drop + 0.6, 0.4);
    const sw = eio(ramp(t, o.office + 1.6, 1.4)); shiftM.color.set(ALTERS[0]).lerp(new THREE.Color(ALTERS[1]), sw); fade(sA).opacity = ramp(t, o.office + 2.8, 0.4); fade(sB).opacity = ramp(t, o.office + 3.4, 0.4);
    const al = eio(ramp(t, o.alone, 1.0)); room1.intensity = 40 * (1 - 0.92 * al); amb.intensity = 0.6 * (1 - 0.85 * al); solo.intensity = 90 * al; desks.forEach((d) => { (d.material as THREE.MeshBasicMaterial).color.set('#7fa6c8').multiplyScalar(1 - 0.85 * al); });
    fade(sA).opacity *= 1 - al; fade(sB).opacity *= 1 - al; B.root.visible = al < 0.95;
    B.root.traverse((ob) => { const mm = (ob as THREE.Mesh).material as THREE.MeshPhysicalMaterial; if (mm && 'opacity' in mm) mm.opacity = 1 - al; });
    return t < o.office ? herm(keys, t) : herm(keysO, t);
  };
  return { g, update };
};

/* ================================================================== a therapy room: two chairs, warm light */
export const THER_X = 1060;
export const buildTherapy = (o: { t0: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = THER_X; room(g, '#5a4636', '#3a2e26');
  const fab = M({ color: '#8a5f45', roughness: 0.9 }), wood = M({ color: '#4a3020', roughness: 0.5 });
  const chair = (x: number, ry: number) => { const c = new THREE.Group(); c.position.set(x, 0, 0); c.rotation.y = ry; g.add(c);
    add(c, new RoundedBoxGeometry(0.75, 0.18, 0.7, 3, 0.05), fab, 0, 0.45, 0); add(c, new RoundedBoxGeometry(0.75, 0.6, 0.16, 3, 0.05), fab, 0, 0.82, -0.29);
    for (const s of [-1, 1]) add(c, new RoundedBoxGeometry(0.14, 0.32, 0.7, 3, 0.05), fab, s * 0.36, 0.6, 0);
    for (const s of [-1, 1]) for (const z of [-1, 1]) add(c, new THREE.CylinderGeometry(0.02, 0.018, 0.36, 10), wood, s * 0.3, 0.18, z * 0.28); };
  chair(-0.8, 0.9); chair(0.8, -0.9);
  const rug = canvasTex(512, 512); { const c = rug.g; c.fillStyle = '#7a3a2a'; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); c.strokeStyle = '#d8b07a'; c.lineWidth = 10; for (const r of [220, 160, 90]) { c.beginPath(); c.arc(256, 256, r, 0, 7); c.stroke(); } }
  add(g, new THREE.CircleGeometry(1.4, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: rug.tex, roughness: 0.95 }), 0, 0.005, 0, false);
  add(g, new THREE.CylinderGeometry(0.25, 0.25, 0.04, 32), wood, 0, 0.55, -0.6); add(g, new THREE.CylinderGeometry(0.03, 0.03, 0.55, 12), wood, 0, 0.275, -0.6);
  add(g, new THREE.CylinderGeometry(0.06, 0.06, 0.1, 16), M({ color: '#e8e2d4', roughness: 0.3 }), 0.08, 0.62, -0.6); add(g, new THREE.CylinderGeometry(0.08, 0.06, 0.12, 16), M({ color: '#4a6a4a', roughness: 0.6 }), -0.1, 0.63, -0.55);
  const pot = new THREE.Group(); pot.position.set(1.7, 0, -1.2); g.add(pot); add(pot, new THREE.CylinderGeometry(0.2, 0.16, 0.4, 24), M({ color: '#b86a44', roughness: 0.7 }), 0, 0.2, 0);
  for (let i = 0; i < 9; i++) { const l = add(pot, new THREE.SphereGeometry(0.16, 12, 10), M({ color: '#3f6a3c', roughness: 0.8 }), Math.sin(i * 2.1) * 0.18, 0.55 + (i % 3) * 0.18, Math.cos(i * 2.1) * 0.18); l.scale.set(1, 0.6, 1); }
  const lampP = new THREE.Vector3(-1.6, 1.5, -0.9); add(g, new THREE.CylinderGeometry(0.02, 0.02, 1.5, 10), wood, lampP.x, 0.75, lampP.z); add(g, new THREE.CylinderGeometry(0.16, 0.24, 0.26, 24, 1, true), M({ color: '#f2dfb8', emissive: '#ffb86a', emissiveIntensity: 1.2, side: THREE.DoubleSide }), lampP.x, lampP.y, lampP.z, false);
  const lampL = new THREE.PointLight('#ffb86a', 6, 5, 2); lampL.position.copy(lampP); lampL.castShadow = true; g.add(lampL);
  const gl = glowSprite('#ffb86a', 1.2, 0.35); gl.position.copy(lampP); g.add(gl);
  g.add(new THREE.HemisphereLight('#ffe2c0', '#2a1c14', 0.55));
  const sun = new THREE.SpotLight('#ffd7a0', 60, 0, 0.6, 0.6, 2); sun.position.set(2.4, 3.2, 2.0); sun.target.position.set(0, 0.5, 0); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); g.add(sun, sun.target);
  const keys = at(THER_X, [[o.t0, 0.0, 1.5, 3.6, 0, 0.7, -0.2, 40], [o.t1, 0.0, 1.35, 3.0, 0, 0.7, -0.2, 38]]);
  return { g, update: (t: number) => herm(keys, t) };
};

/* ================================================================== the colours come back into one: four tinted figures fold into one gold */
export const MERGE_X = 1120;
export const buildMerge = (o: { t0: number; hit: number; t1: number }) => {
  const g = new THREE.Group(); g.position.x = MERGE_X; room(g, '#30281f', '#1b1714');
  const goldM = new THREE.MeshPhysicalMaterial({ color: '#d8d2c8', metalness: 0, roughness: 0.3, emissive: '#7a5414', emissiveIntensity: 0 });
  const center = posable(goldM); g.add(center.root);
  const SP = [[-1.3, -0.3], [-0.65, -0.7], [0.65, -0.7], [1.3, -0.3]];
  const alters = SP.map(([x, z], i) => { const mat = tint(ALTERS[i]); const m = posable(mat); m.root.position.set(x, 0, z); m.root.rotation.y = -Math.atan2(x, 2.5); g.add(m.root); return { m, mat, x, z }; });
  const streams = SP.map(([x, z], i) => { const s = glowSprite(ALTERS[i], 0.4, 0); s.position.set(x, 1.4, z); g.add(s); return s; });
  const top = new THREE.SpotLight('#ffe2b8', 0, 0, 0.22, 0.4, 2); top.position.set(0, 5, 0.6); top.target.position.set(0, 0, 0); top.castShadow = true; top.shadow.mapSize.set(1024, 1024); g.add(top, top.target);
  const bm = beam('#ffd9a6', 5, 0.22, 0.05); bm.mesh.position.set(0, 2.5, 0.3); g.add(bm.mesh);
  const s1 = sign('一个完整的自己', '', GOLD, 1.6, 0.2, 130); s1.position.set(0, 1.98, 0.1); g.add(s1);
  g.add(new THREE.HemisphereLight('#8a96a6', '#141110', 0.4));
  const fill = new THREE.SpotLight('#dfe6ee', 40, 0, 0.8, 0.7, 2); fill.position.set(1.6, 3.4, 3.2); fill.target.position.set(0, 1.0, -0.2); g.add(fill, fill.target);
  const keys = at(MERGE_X, [[o.t0, 0.0, 1.7, 4.6, 0, 1.25, -0.2, 40], [o.t1, 0.0, 1.55, 3.6, 0, 1.3, -0.1, 36]]);
  const update = (t: number) => {
    const walk = eio(ramp(t, o.t0 + 0.3, o.hit - o.t0 - 0.3)); const hit = eio(ramp(t, o.hit, 0.6));
    alters.forEach(({ m, mat, x, z }, i) => { m.root.position.set(x * (1 - 0.55 * walk), 0, z * (1 - 0.55 * walk)); mat.opacity = 1 - hit; m.root.visible = hit < 0.98;
      const s = streams[i]; const k = eio(ramp(t, o.hit - 0.15, 0.55)); s.position.set(x * (1 - 0.55 * walk) * (1 - k), 1.4, z * (1 - 0.55 * walk) * (1 - k)); (s.material as THREE.SpriteMaterial).opacity = 0.9 * Math.sin(Math.PI * k); });
    goldM.color.set('#d8d2c8').lerp(new THREE.Color('#f1c56d'), hit); goldM.metalness = 0.9 * hit; goldM.emissiveIntensity = 0.9 * hit;
    top.intensity = 80 + 320 * hit; bm.mat.uniforms.uI.value = 0.4 + 0.6 * hit; fade(s1).opacity = ramp(t, o.hit + 0.3, 0.4);
    return herm(keys, t);
  };
  return { g, update };
};
