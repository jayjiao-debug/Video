/* 《七宗罪·嫉妒》 key frames: one still per beat (frame i = scene i). Same figure, one lamp, one object per idea. */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { M, add, canvasTex, woodTex, glowSprite, posable, shellMat, sign, rng } from './kit';
import { W, H, GOLD, INK, SERIF, SANS, txt, subtitle, mark, grain, vignette, FONT_CHARS } from './lib';

const ENVY = '#8fdc8a';
type Scene = { g: THREE.Group; cam: number[] };
const room = (g: THREE.Group, floor = '#3a2e24', wall = '#1a1714') => {
  add(g, new THREE.PlaneGeometry(16, 16).rotateX(-Math.PI / 2), M({ map: woodTex(9, floor, 1024, 1024, 4, 4), roughness: 0.6 }), 0, 0, 0, false);
  const wl = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 8, 64, 1, true, Math.PI * 0.55, Math.PI * 0.9), M({ color: wall, roughness: 0.95, side: THREE.BackSide })); wl.position.set(0, 4, 1.5); wl.receiveShadow = true; g.add(wl);
};
const key = (g: THREE.Group, x: number, y: number, z: number, tx: number, ty: number, tz: number, col = '#ffe2bf', I = 60, ang = 0.55) => {
  const s = new THREE.SpotLight(col, I, 0, ang, 0.6, 2); s.position.set(x, y, z); s.target.position.set(tx, ty, tz); s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0005; g.add(s, s.target); return s;
};
const lab = (title: string, sub: string, col: string, w: number, h = w * 0.3) => {
  const cw = 1600, ch = Math.round((cw * h) / w); const { g: c, tex } = canvasTex(cw, ch); c.textAlign = 'center'; c.textBaseline = 'middle';
  let sz = ch * (sub ? 0.5 : 0.8); c.font = `900 ${sz}px ${SANS}`; const tw = c.measureText(title).width; if (tw > cw * 0.94) sz *= (cw * 0.94) / tw;
  c.font = `900 ${sz}px ${SANS}`; c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 24; c.fillStyle = col; c.fillText(title, cw / 2, sub ? ch * 0.34 : ch / 2);
  if (sub) { let ss = ch * 0.28; c.font = `700 ${ss}px ${SANS}`; const sw = c.measureText(sub).width; if (sw > cw * 0.94) ss *= (cw * 0.94) / sw; c.font = `700 ${ss}px ${SANS}`; c.fillStyle = '#e9e1d2'; c.fillText(sub, cw / 2, ch * 0.78); }
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false, fog: false }));
};

/* ---------------------------------------------------------------- 0 / 7 · the choice: two cards */
const card = (letter: string, you: number, other: number, col: string) => {
  const { g: c, tex } = canvasTex(840, 1120); c.fillStyle = '#e8dfcc'; c.fillRect(0, 0, 840, 1120); c.strokeStyle = '#2a2016'; c.lineWidth = 8; c.strokeRect(24, 24, 792, 1072);
  c.textAlign = 'center'; c.fillStyle = col; c.font = `900 260px ${SERIF}`; c.fillText(letter, 420, 300);
  const bar = (y: number, who: string, v: number, fill: string) => { c.textAlign = 'left'; c.fillStyle = '#2a2016'; c.font = `900 84px ${SANS}`; c.fillText(who, 70, y); c.textAlign = 'right'; c.fillText(`${v}万`, 770, y);
    c.fillStyle = 'rgba(42,32,22,.16)'; c.fillRect(70, y + 30, 700, 90); c.fillStyle = fill; c.fillRect(70, y + 30, 700 * (v / 40), 90); };
  bar(500, '你', you, '#c07a12'); bar(740, '同事', other, '#4a443c');
  c.textAlign = 'center'; c.fillStyle = 'rgba(42,32,22,.6)'; c.font = `600 44px ${SANS}`; c.fillText('年薪', 420, 1010);
  return tex;
};
const buildChoice = (X: number, ending = false): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g);
  add(g, new THREE.BoxGeometry(2.2, 0.05, 1.1), M({ map: woodTex(4, '#3a2416', 1024, 1024, 2, 1), roughness: 0.4 }), 0, 0.725, 0);
  [['A', 10, 5, '#c08a2c', -0.34], ['B', 20, 40, '#3f8a54', 0.34]].forEach(([l, y, o, c, x]) => { const tent = new THREE.Group(); tent.position.set(x as number, 0.75, 0); tent.rotation.y = -(x as number) * 0.25; g.add(tent);
    const m = add(tent, new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshBasicMaterial({ map: card(l as string, y as number, o as number, c as string), color: '#d6cebe' }), 0, 0.27, 0.05, true); m.rotation.x = -0.18;
    add(tent, new THREE.BoxGeometry(0.43, 0.56, 0.01), M({ color: '#d9cdb4', roughness: 0.9 }), 0, 0.27, -0.06).rotation.x = 0.22; });
  const or = lab('还是', '', '#e9e1d2', 0.2, 0.09); or.position.set(0, 1.02, 0.1); g.add(or);
  if (ending) { const s = lab('你选哪个？', '评论区告诉我', GOLD, 1.0, 0.26); s.position.set(0, 1.5, 0); g.add(s); }
  g.add(new THREE.HemisphereLight('#8a96a8', '#1a120c', 0.3)); key(g, 0.2, 2.4, 1.2, 0, 0.9, 0, '#ffe2bf', 50, 0.5);
  return { g, cam: ending ? [X, 1.3, 2.15, X, 1.12, 0, 38] : [X, 1.2, 1.55, X, 0.98, 0, 38] };
};

/* ---------------------------------------------------------------- 1 · title: one figure, a green rim */
const buildTitle = (X: number): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#1e1a16', '#0e0d0c');
  const m = posable(shellMat()); m.root.position.set(-0.5, 0, -0.2); m.root.rotation.y = 0.45; g.add(m.root); m.head.rotation.set(0.1, -0.5, 0);
  const rim = new THREE.SpotLight(ENVY, 220, 0, 0.5, 0.7, 2); rim.position.set(-1.9, 2.2, -1.6); rim.target.position.set(-0.5, 1.2, -0.2); g.add(rim, rim.target);
  key(g, 1.2, 2.6, 1.8, -0.5, 1.2, -0.2, '#ffd9a8', 10, 0.35);
  const gl = glowSprite(ENVY, 3.5, 0.18); gl.position.set(-1.0, 1.5, -1.5); g.add(gl);
  return { g, cam: [X, 1.35, 2.9, X + 0.25, 1.2, 0, 36] };
};

/* ---------------------------------------------------------------- 2 · cucumber and grapes */
const buildFruit = (X: number): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g);
  const ped = M({ color: '#16130f', roughness: 0.45 }); const plateM = M({ color: '#ece8e0', roughness: 0.2 });
  for (const x of [-0.55, 0.55]) { add(g, new THREE.BoxGeometry(0.5, 0.95, 0.5), ped, x, 0.475, 0); add(g, new THREE.CylinderGeometry(0.17, 0.13, 0.025, 48), plateM, x, 0.965, 0); }
  const cuc = canvasTex(256, 256); { const c = cuc.g; c.fillStyle = '#2f6a2a'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#cfe8a8'; c.beginPath(); c.arc(128, 128, 112, 0, 7); c.fill(); c.fillStyle = '#e6f2c8'; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; c.beginPath(); c.ellipse(128 + Math.cos(a) * 52, 128 + Math.sin(a) * 52, 10, 6, a, 0, 7); c.fill(); } }
  const sliceM = [M({ color: '#2f6a2a', roughness: 0.5 }), M({ map: cuc.tex, roughness: 0.45 }), M({ map: cuc.tex, roughness: 0.45 })];
  const slice = (x: number, y: number, z: number, rx: number, rz = 0) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 32), sliceM); s.position.set(x, y, z); s.rotation.set(rx, 0, rz); s.castShadow = true; g.add(s); };
  slice(-0.6, 0.985, 0.02, 0.1); slice(-0.52, 0.99, -0.04, 0.2);
  slice(-0.3, 0.008, 0.3, 0); // the one thrown out, on the floor
  const grape = M({ color: '#5a2a6a', roughness: 0.18, clearcoat: 1 } as THREE.MeshStandardMaterialParameters); const r = rng(3);
  for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, rr = r() * 0.07, y = 0.995 + (i < 9 ? 0 : i < 15 ? 0.035 : 0.065); add(g, new THREE.SphereGeometry(0.026, 20, 14), grape, 0.55 + Math.cos(a) * rr * (i < 9 ? 1 : 0.6), y, Math.sin(a) * rr * (i < 9 ? 1 : 0.6)); }
  add(g, new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), M({ color: '#5a4a2a' }), 0.55, 1.1, 0);
  const s1 = lab('同样的活', '', '#e9e1d2', 0.8, 0.16); s1.position.set(0, 1.5, 0); g.add(s1);
  const l1 = lab('黄瓜', '', '#a8d89a', 0.4, 0.13); l1.position.set(-0.55, 1.22, 0.1); g.add(l1);
  const l2 = lab('葡萄', '', '#c9a0e0', 0.4, 0.13); l2.position.set(0.55, 1.22, 0.1); g.add(l2);
  g.add(new THREE.HemisphereLight('#7f8ea0', '#1a120c', 0.3));
  key(g, -0.5, 3, 0.9, -0.45, 0.6, 0.1, '#a8c8e8', 45, 0.32); key(g, 0.55, 3, 0.8, 0.55, 0.95, 0, '#ffd9a0', 90, 0.25);
  return { g, cam: [X, 1.35, 2.2, X, 0.95, 0, 38] };
};

/* ---------------------------------------------------------------- 3 · the podium: silver looks up, bronze looks down */
const buildPodium = (X: number): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#2a2420', '#14161a');
  const box = M({ color: '#e9e4da', roughness: 0.5 });
  const steps: [number, number, string, string, number][] = [[0, 0.75, '1', '#e8c060', 0], [-0.75, 0.5, '2', '#cfd4dc', 0.35], [0.75, 0.32, '3', '#c98a50', -0.18]];
  steps.forEach(([x, h, n, medal, tilt]) => { add(g, new THREE.BoxGeometry(0.72, h, 0.6), box, x, h / 2, 0); const num = lab(n, '', '#2a2016', 0.22, 0.22); num.position.set(x, h / 2, 0.301); g.add(num);
    const m = posable(shellMat()); m.root.position.set(x, h, 0); g.add(m.root); m.head.rotation.x = tilt; m.head.rotation.y = x < 0 ? 0.35 : x > 0 ? 0 : 0;
    const md = add(m.torso, new THREE.CylinderGeometry(0.045, 0.045, 0.012, 32).rotateX(Math.PI / 2), M({ color: medal, metalness: 1, roughness: 0.25 }), 0, 0.22, 0.1); void md; });
  const sS = lab('4.8', '银牌 · 开心程度', '#cfd4dc', 0.8, 0.34); sS.position.set(-0.8, 2.55, 0.2); g.add(sS);
  const sB = lab('7.1', '铜牌 · 开心程度', '#e0a46a', 0.8, 0.34); sB.position.set(0.85, 2.35, 0.2); g.add(sB);
  g.add(new THREE.HemisphereLight('#8a96a8', '#1a120c', 0.4)); key(g, 0.6, 3.6, 3.2, 0, 1.0, 0, '#ffe8cc', 80, 0.6);
  return { g, cam: [X, 1.75, 4.6, X, 1.45, 0, 40] };
};

/* ---------------------------------------------------------------- 4 · potter envies potter */
const buildPotters = (X: number): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#3a2c20', '#1c1814');
  const clay = M({ color: '#a86a44', roughness: 0.8 }), glaze = M({ color: '#3e6a7a', roughness: 0.15, metalness: 0.1 }), wheel = M({ color: '#2a2622', roughness: 0.5 });
  const pot = (x: number, s: number, mat: THREE.Material) => { add(g, new THREE.CylinderGeometry(0.06, 0.08, 0.7, 24), wheel, x, 0.35, 0); add(g, new THREE.CylinderGeometry(0.25, 0.25, 0.05, 48), wheel, x, 0.72, 0);
    const pts: THREE.Vector2[] = []; for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push(new THREE.Vector2(0.06 + 0.1 * Math.sin(u * Math.PI * 0.95) + 0.03 * u, u * 0.36)); }
    const p = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), mat); p.scale.setScalar(s); p.position.set(x, 0.745, 0); p.castShadow = true; g.add(p); };
  pot(-0.55, 1.0, clay); pot(0.55, 1.35, glaze);
  const s = lab('陶匠嫉妒陶匠', '—— 古希腊诗人 赫西俄德', '#e9e1d2', 1.1, 0.3); s.position.set(0, 1.58, 0); g.add(s);
  const gl = glowSprite(ENVY, 1.0, 0.55); gl.position.set(-0.55, 0.95, -0.35); g.add(gl);
  g.add(new THREE.HemisphereLight('#8a96a8', '#1a120c', 0.3)); key(g, 0.4, 3, 2.2, 0, 0.9, 0, '#ffe2bf', 60, 0.5);
  return { g, cam: [X, 1.3, 2.6, X, 1.05, 0, 40] };
};

/* ---------------------------------------------------------------- 5 · the brain: envy lights the pain area; their misfortune lights reward */
const buildBrain = (X: number): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g, '#1e1a16', '#0e0d0c');
  const m = posable(shellMat()); m.root.rotation.y = 0.35; g.add(m.root);
  const hd = m.head.children[0] as THREE.Mesh; hd.material = new THREE.MeshPhysicalMaterial({ color: '#dfe8f0', roughness: 0.05, transparent: true, opacity: 0.18, clearcoat: 1, depthWrite: false });
  const pain = glowSprite('#ff4a3a', 0.12, 1); pain.position.set(0, 0.13, 0.0); m.head.add(pain); const reward = glowSprite('#ffc65a', 0.09, 0.9); reward.position.set(0.02, 0.06, -0.01); m.head.add(reward);
  m.root.updateMatrixWorld(true); const hp = new THREE.Vector3(); m.head.getWorldPosition(hp); hp.sub(g.position);
  const sP = lab('嫉妒 → 亮起“疼痛区”', '', '#ff8a7a', 0.62, 0.09); sP.position.set(-0.5, hp.y + 0.3, 0.1); g.add(sP);
  const sR = lab('他倒霉 → 亮起“奖励区”', '', '#ffd27a', 0.62, 0.09); sR.position.set(0.52, hp.y - 0.08, 0.1); g.add(sR);
  for (const [a, b, c] of [[new THREE.Vector3(-0.3, hp.y + 0.26, 0.1), hp.clone().add(new THREE.Vector3(-0.02, 0.13, 0)), '#ff8a7a'], [new THREE.Vector3(0.24, hp.y - 0.08, 0.1), hp.clone().add(new THREE.Vector3(0.02, 0.06, 0)), '#ffd27a']] as const) g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), new THREE.LineBasicMaterial({ color: c })));
  g.add(new THREE.HemisphereLight('#7a8ba0', '#120e0b', 0.35)); key(g, 1, 2.8, 2.0, 0, 1.4, 0, '#dfe8f0', 40, 0.5);
  return { g, cam: [X, 1.62, 1.75, X, 1.55, 0, 36] };
};

/* ---------------------------------------------------------------- 6 · two kinds: pull him down, or climb up */
const buildTwo = (X: number): Scene => {
  const g = new THREE.Group(); g.position.x = X; room(g);
  add(g, new THREE.BoxGeometry(0.7, 1.4, 0.7), M({ color: '#1a1714', roughness: 0.4 }), 0, 0.7, -0.3);
  const top = posable(shellMat('#f1d38a')); top.root.position.set(0, 1.4, -0.3); g.add(top.root);
  const L = posable(shellMat()), R = posable(shellMat()); L.root.position.set(-0.85, 0, 0.3); L.root.rotation.y = 0.6; R.root.position.set(0.62, 0, 0.25); R.root.rotation.y = -0.9; g.add(L.root, R.root);
  L.arms[1].sh.rotation.set(-1.9, 0, -0.2); L.arms[1].el.rotation.set(-0.1, 0, 0); R.arms[0].sh.rotation.set(-2.2, 0, 0.1); R.arms[1].sh.rotation.set(-1.2, 0, -0.1);
  L.root.updateMatrixWorld(true); const hand = new THREE.Vector3(); L.arms[1].hand.getWorldPosition(hand); hand.sub(g.position);
  { const a = hand, b = new THREE.Vector3(-0.1, 1.55, -0.22), mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, -0.12, 0)); add(g, new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.012, 8), M({ color: '#b8301e', roughness: 0.7 }), 0, 0, 0); }
  const lad = new THREE.Group(); lad.position.set(0.42, 0, 0.12); lad.rotation.set(-0.0, 0, 0.18); g.add(lad); const wd = M({ color: '#8a6a44', roughness: 0.6 });
  for (const x of [-0.16, 0.16]) add(lad, new THREE.BoxGeometry(0.035, 1.7, 0.035), wd, x, 0.85, 0); for (let i = 1; i < 7; i++) add(lad, new THREE.BoxGeometry(0.32, 0.025, 0.025), wd, 0, i * 0.24, 0);
  const sL = lab('拉他下来', '', '#ff7a6a', 0.75, 0.2); sL.position.set(-0.95, 2.25, 0.3); g.add(sL);
  const sR = lab('追上去', '', GOLD, 0.6, 0.2); sR.position.set(0.95, 2.25, 0.3); g.add(sR);
  g.add(new THREE.HemisphereLight('#8a96a8', '#1a120c', 0.35)); key(g, 0, 4, 0.4, 0, 1.4, -0.3, '#ffd99a', 120, 0.35); key(g, 1.4, 2.6, 2.6, 0, 0.9, 0, '#dfe6ee', 30, 0.7);
  return { g, cam: [X, 1.75, 4.3, X, 1.5, 0, 42] };
};

const BUILD = [(x: number) => buildChoice(x), buildTitle, buildFruit, buildPodium, buildPotters, buildBrain, buildTwo, (x: number) => buildChoice(x, true)];
export const FRAME_LINES = ['你年薪10万、同事5万；还是你年薪20万、同事40万？', '', '两只猴子做一样的活，一只拿到黄瓜，一只拿到葡萄', '银牌看的是金牌，铜牌看的是没拿到牌的人', '两千多年前的古希腊诗人就写过：陶匠嫉妒陶匠', '嫉妒时亮起的区域，和身体疼痛时是同一块', '一种让你想把他拉下来，另一种让你想[追上去]', 'A 还是 B，你选了哪个？'];

const World: React.FC<{ i: number }> = ({ i }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo(() => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.background = new THREE.Color('#000'); return BUILD.map((b, k) => { const s = b(k * 60); scene.add(s.g); return s; }); }, [scene, gl]);
  S.forEach((s, k) => { s.g.visible = k === i; }); scene.fog = new THREE.FogExp2('#0a0908', 0.06);
  const p = S[i].cam; const cam = camera as THREE.PerspectiveCamera; cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]); cam.fov = p[6]; cam.near = 0.02; cam.far = 80; cam.updateProjectionMatrix();
  return null;
};
const Overlay: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H); vignette(g, 0.55); grain(g, 11 + i, 0.05);
    if (i === 1) { g.save(); g.translate(1060, 470); g.font = `700 150px ${SERIF}`; g.textAlign = 'left'; const gr = g.createLinearGradient(0, -130, 0, 20); gr.addColorStop(0, '#e8ffd8'); gr.addColorStop(0.5, ENVY); gr.addColorStop(1, '#3f8a54'); g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 30; g.fillStyle = gr; g.fillText('嫉妒', 0, 0); g.restore();
      txt(g, '七 宗 罪', 1180, 300, 44, 'rgba(243,237,226,.7)', { w: 700, f: SERIF }); txt(g, '你宁愿少赚一半，也不想输给他？', 1240, 580, 40, INK, { w: 700 }); txt(g, '— VIBE知识大赏 —', 1240, 640, 24, 'rgba(243,237,226,.5)', { w: 500 }); }
    g.fillStyle = '#000'; g.fillRect(0, 0, W, 100); g.fillRect(0, H - 100, W, 100); mark(g, i === 1 ? 0 : 0.9);
    if (FRAME_LINES[i]) subtitle(g, FRAME_LINES[i], 1); }, [i]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};
export const Frames: React.FC = () => {
  const f = useCurrentFrame(); const i = Math.min(BUILD.length - 1, f); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + FRAME_LINES.join('') + 'AB你同事年薪万还是选哪个评论区告诉我七宗罪嫉妒宁愿少赚一半也不想输给他同样的活黄瓜葡萄4.8银牌铜牌开心程度7.1陶匠嫉妒陶匠古希腊诗人赫西俄德时亮起疼痛区倒霉奖励拉下来追上去123—';
    Promise.all([`900 260px ${SERIF}`, `900 70px ${SANS}`, `600 44px ${SANS}`, `900 120px ${SANS}`, `700 86px ${SANS}`, `700 150px ${SERIF}`, `700 44px ${SERIF}`, `700 40px ${SANS}`, `900 900px ${SANS}`, `700 68px ${SANS}`, `900 68px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return <AbsoluteFill style={{ background: '#000' }}>
    <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3, preserveDrawingBuffer: true }} camera={{ fov: 36, near: 0.02, far: 80 }}><World i={i} /></ThreeCanvas>
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(60,80,50,.18), rgba(20,26,16,.25))', mixBlendMode: 'soft-light' }} />
    <Overlay i={i} />
  </AbsoluteFill>;
};
