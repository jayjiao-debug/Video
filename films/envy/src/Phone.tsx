/* 《七宗罪·嫉妒》 phone version: every beat is told on a phone screen, late at night, one desk lamp. Key frames: frame i = scene i. */
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { M, add, canvasTex, woodTex, makeEnv } from './kit';
import { W, H, GOLD, INK, SERIF, SANS, txt, subtitle, mark, grain, vignette, FONT_CHARS } from './lib';

const ENVY = '#8fdc8a';
type C = CanvasRenderingContext2D;
const SW = 990, SH = 2160; // screen canvas
const BG = '#0f1012', CARD = '#1b1d21', LINE = '#2a2d33', MUTED = '#8c8f96', TXT = '#f2f0ec';

/* ---------------------------------------------------------------- tiny phone UI kit (2D) */
const rr = (c: C, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
const T = (c: C, s: string, x: number, y: number, size: number, col = TXT, w = 700, a: CanvasTextAlign = 'left') => { c.font = `${w} ${size}px ${SANS}`; c.fillStyle = col; c.textAlign = a; c.textBaseline = 'alphabetic'; c.fillText(s, x, y); };
const status = (c: C, time = '23:47') => { T(c, time, 70, 92, 46, TXT, 700); c.fillStyle = TXT; for (let i = 0; i < 4; i++) c.fillRect(760 + i * 18, 84 - i * 9, 12, 12 + i * 9); rr(c, 850, 58, 76, 36, 9); c.strokeStyle = TXT; c.lineWidth = 3; c.stroke(); c.fillRect(855, 63, 50, 26); };
const avatar = (c: C, x: number, y: number, r: number, col: string, ch: string) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); T(c, ch, x, y + r * 0.36, r, '#101010', 900, 'center'); };
const header = (c: C, title: string) => { T(c, '‹', 60, 230, 90, TXT, 400); T(c, title, SW / 2, 222, 54, TXT, 700, 'center'); c.fillStyle = LINE; c.fillRect(0, 280, SW, 2); };
const heart = (c: C, x: number, y: number, s: number, fill: string | null, stroke = MUTED) => { c.beginPath(); c.moveTo(x, y + s * 0.35); c.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.4, y - s, x, y - s * 0.35); c.bezierCurveTo(x + s * 0.4, y - s, x + s, y - s * 0.4, x, y + s * 0.35); if (fill) { c.fillStyle = fill; c.fill(); } else { c.strokeStyle = stroke; c.lineWidth = 5; c.stroke(); } };
const screen = (draw: (c: C) => void) => { const { g: c, tex } = canvasTex(SW, SH); c.fillStyle = BG; c.fillRect(0, 0, SW, SH); status(c); draw(c); return tex; };

/* the choice card, used at the top and the end */
const pollScreen = (end: boolean) => screen((c) => {
  header(c, end ? '评论区' : '先做个选择');
  T(c, end ? '你选了哪个？' : '别多想，', 80, 470, 96, TXT, 900); T(c, end ? '告诉我，也告诉自己' : '选一个', 80, 590, 96, end ? GOLD : TXT, 900);
  const opt = (y: number, L: string, you: number, oth: number, col: string) => { rr(c, 60, y, SW - 120, 560, 36); c.fillStyle = CARD; c.fill(); c.strokeStyle = col; c.lineWidth = 6; c.stroke();
    T(c, L, 110, y + 150, 120, col, 900);
    const bar = (yy: number, who: string, v: number, fill: string) => { T(c, who, 260, yy, 64, TXT, 700); T(c, `${v}万`, SW - 110, yy, 72, TXT, 900, 'right'); rr(c, 260, yy + 26, SW - 370, 54, 14); c.fillStyle = '#2a2d33'; c.fill(); rr(c, 260, yy + 26, (SW - 370) * (v / 40), 54, 14); c.fillStyle = fill; c.fill(); };
    bar(y + 120, '你', you, col); bar(y + 330, '同事', oth, '#6b6f78'); T(c, '年薪', 110, y + 500, 44, MUTED, 600); };
  opt(720, 'A', 10, 5, '#e2a03a'); opt(1340, 'B', 20, 40, '#5fbf72');
  if (end) { rr(c, 60, 1960, SW - 120, 120, 60); c.fillStyle = '#23262b'; c.fill(); T(c, '我选……', 120, 2038, 52, MUTED, 600); }
});

/* lock screen with one notification */
const lockScreen = () => screen((c) => {
  const g = c.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#16231a'); g.addColorStop(1, '#070908'); c.fillStyle = g; c.fillRect(0, 120, SW, SH); status(c);
  T(c, '10月23日 星期五', SW / 2, 330, 50, '#cfe6d0', 600, 'center'); T(c, '23:47', SW / 2, 560, 230, '#e8f4e8', 300, 'center');
  rr(c, 50, 760, SW - 100, 300, 44); c.fillStyle = 'rgba(40,52,44,.92)'; c.fill(); avatar(c, 140, 850, 48, '#e7c27a', '王');
  T(c, '同事 小王 · 刚刚', 220, 868, 46, '#cfe6d0', 600); T(c, '升职了！谢谢大家这些年', 100, 980, 62, TXT, 800); T(c, '的照顾～', 100, 1050, 62, TXT, 800);
});

/* short-video player: the capuchin experiment, drawn */
const monkeyScreen = () => screen((c) => {
  c.fillStyle = '#000'; c.fillRect(0, 300, SW, 640);
  const plate = (x: number, lit: string) => { const g = c.createRadialGradient(x, 640, 10, x, 640, 300); g.addColorStop(0, lit); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - 300, 340, 600, 560);
    c.fillStyle = '#e8e4dc'; c.beginPath(); c.ellipse(x, 760, 170, 46, 0, 0, 7); c.fill(); };
  plate(250, 'rgba(120,160,200,.35)'); plate(740, 'rgba(255,200,120,.45)');
  for (const [x, y] of [[200, 745], [270, 755], [235, 735]]) { c.fillStyle = '#2f6a2a'; c.beginPath(); c.ellipse(x, y, 46, 18, 0, 0, 7); c.fill(); c.fillStyle = '#cfe8a8'; c.beginPath(); c.ellipse(x, y - 4, 38, 13, 0, 0, 7); c.fill(); }
  for (let i = 0; i < 14; i++) { const row = i < 6 ? 0 : i < 11 ? 1 : 2, k = i < 6 ? i : i < 11 ? i - 6 : i - 11, n = [6, 5, 3][row]; c.fillStyle = '#6a2f7e'; c.beginPath(); c.arc(740 - (n - 1) * 22 + k * 44, 735 - row * 36, 24, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(732 - (n - 1) * 22 + k * 44, 727 - row * 36, 7, 0, 7); c.fill(); }
  T(c, '黄瓜', 250, 880, 60, '#a8d89a', 900, 'center'); T(c, '葡萄', 740, 880, 60, '#d6a8ec', 900, 'center');
  c.fillStyle = '#e5533f'; c.fillRect(0, 936, SW * 0.62, 8); c.fillStyle = '#444'; c.fillRect(SW * 0.62, 936, SW * 0.38, 8);
  T(c, '同样的活，', 70, 1090, 84, TXT, 900); T(c, '一只拿黄瓜，一只拿葡萄', 70, 1200, 72, TXT, 900);
  T(c, '卷尾猴实验 · 2003年《Nature》', 70, 1290, 46, MUTED, 600);
  rr(c, 60, 1360, SW - 120, 360, 30); c.fillStyle = CARD; c.fill();
  T(c, '拿黄瓜的那只：', 110, 1460, 60, TXT, 700); T(c, '把黄瓜扔了回去', 110, 1560, 84, '#ff7a6a', 900); T(c, '它刚才明明吃得很开心', 110, 1660, 52, MUTED, 600);
  heart(c, 900, 1880, 46, '#ff5a6a'); T(c, '12.8万', 900, 1960, 40, MUTED, 600, 'center');
});

/* news article: Barcelona 1992 */
const podiumScreen = () => screen((c) => {
  header(c, '研究 · 1995');
  T(c, '1992 巴塞罗那奥运会', 70, 410, 70, TXT, 900); T(c, '谁更开心？', 70, 510, 70, GOLD, 900);
  c.fillStyle = '#16181c'; c.fillRect(60, 570, SW - 120, 560);
  const step = (x: number, h: number, n: string, col: string) => { c.fillStyle = '#d9d4ca'; c.fillRect(x - 130, 1130 - h, 260, h); T(c, n, x, 1130 - h / 2 + 40, 110, '#2a2016', 900, 'center');
    c.fillStyle = '#cfcac0'; c.beginPath(); c.arc(x, 1130 - h - 170, 46, 0, 7); c.fill(); rr(c, x - 60, 1130 - h - 120, 120, 120, 30); c.fill(); c.fillStyle = col; c.beginPath(); c.arc(x, 1130 - h - 70, 22, 0, 7); c.fill(); };
  step(SW / 2, 260, '1', '#e8c060'); step(SW / 2 - 270, 170, '2', '#cfd4dc'); step(SW / 2 + 270, 110, '3', '#c98a50');
  T(c, '开心程度（10 分制）', 70, 1250, 54, MUTED, 600);
  const bar = (y: number, who: string, v: number, col: string) => { T(c, who, 70, y + 66, 64, TXT, 800); rr(c, 260, y, 520 * (v / 10), 90, 18); c.fillStyle = col; c.fill(); T(c, v.toFixed(1), 260 + 520 * (v / 10) + 30, y + 72, 84, col, 900); };
  bar(1300, '银牌', 4.8, '#cfd4dc'); bar(1440, '铜牌', 7.1, '#e0a46a');
  T(c, '银牌在想：差一点就是金牌', 70, 1700, 58, TXT, 700); T(c, '铜牌在想：差一点就没牌了', 70, 1800, 58, TXT, 700);
});

/* a peer's post: potter envies potter */
const potterScreen = () => screen((c) => {
  header(c, '动态');
  avatar(c, 130, 400, 56, '#c98a50', '陈'); T(c, '老陈 · 陶艺', 215, 390, 52, TXT, 800); T(c, '你关注的同行 · 2小时前', 215, 448, 40, MUTED, 600);
  T(c, '新作被美术馆收藏了，', 70, 580, 66, TXT, 700); T(c, '十年，值了。', 70, 670, 66, TXT, 700);
  const g = c.createRadialGradient(SW / 2, 1000, 20, SW / 2, 1000, 420); g.addColorStop(0, '#2c3a3e'); g.addColorStop(1, '#121618'); c.fillStyle = g; c.fillRect(60, 720, SW - 120, 600);
  c.fillStyle = '#3e7a8a'; c.beginPath(); c.moveTo(SW / 2 - 70, 790); c.bezierCurveTo(SW / 2 - 70, 860, SW / 2 - 230, 920, SW / 2 - 210, 1080); c.bezierCurveTo(SW / 2 - 190, 1230, SW / 2 - 80, 1260, SW / 2, 1260); c.bezierCurveTo(SW / 2 + 80, 1260, SW / 2 + 190, 1230, SW / 2 + 210, 1080); c.bezierCurveTo(SW / 2 + 230, 920, SW / 2 + 70, 860, SW / 2 + 70, 790); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(SW / 2 - 110, 1030, 26, 110, 0.1, 0, 7); c.fill(); c.fillStyle = '#2a2622'; c.fillRect(SW / 2 - 260, 1262, 520, 26);
  heart(c, 120, 1420, 40, null, TXT); T(c, '赞', 170, 1436, 50, TXT, 600); T(c, '评论', 330, 1436, 50, TXT, 600); T(c, '1,204 人赞过', SW - 80, 1436, 44, MUTED, 600, 'right');
  c.fillStyle = LINE; c.fillRect(60, 1490, SW - 120, 2);
  rr(c, 60, 1560, SW - 120, 420, 30); c.fillStyle = '#1c2119'; c.fill(); c.fillStyle = ENVY; c.fillRect(60, 1560, 10, 420);
  T(c, '“陶匠嫉妒陶匠，', 110, 1680, 74, '#d6efd2', 900); T(c, '  乞丐嫉妒乞丐。”', 110, 1790, 74, '#d6efd2', 900); T(c, '—— 赫西俄德，约公元前700年', 110, 1900, 46, MUTED, 600);
});

/* scan: envy hurts, their fall rewards */
const brainScreen = () => screen((c) => {
  header(c, '2009 ·《Science》');
  T(c, '看到同龄人比你强', 70, 410, 70, TXT, 900);
  c.fillStyle = '#0a0c10'; c.fillRect(60, 470, SW - 120, 820);
  c.save(); c.translate(SW / 2, 880); c.strokeStyle = 'rgba(160,190,230,.55)'; c.lineWidth = 6; c.beginPath(); c.ellipse(0, 0, 330, 260, 0, 0, 7); c.stroke();
  c.lineWidth = 3; c.strokeStyle = 'rgba(160,190,230,.25)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(0, 0, 300 - i * 30, 230 - i * 24, 0, 0, 7); c.stroke(); }
  const spot = (x: number, y: number, r: number, col: string) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  spot(-40, -110, 120, 'rgba(255,80,60,.95)'); spot(60, 60, 90, 'rgba(255,200,90,.9)'); c.restore();
  rr(c, 60, 1340, SW - 120, 280, 30); c.fillStyle = '#2a1714'; c.fill(); T(c, '嫉妒时', 110, 1440, 56, '#ff9a8a', 700); T(c, '亮起的是“疼痛区”', 110, 1560, 80, '#ff6a5a', 900);
  rr(c, 60, 1660, SW - 120, 280, 30); c.fillStyle = '#2a2414'; c.fill(); T(c, '他倒霉时', 110, 1760, 56, '#ffd27a', 700); T(c, '亮起的是“奖励区”', 110, 1880, 80, '#ffc65a', 900);
});

/* two replies: drag him down, or catch up */
const twoScreen = () => screen((c) => {
  header(c, '小王 · 升职了！');
  T(c, '你会怎么回？', 70, 420, 84, TXT, 900);
  rr(c, 60, 500, SW - 120, 640, 36); c.fillStyle = '#26130f'; c.fill(); c.strokeStyle = '#e5533f'; c.lineWidth = 6; c.stroke();
  T(c, '评论', 110, 600, 50, '#ff9a8a', 700); rr(c, 110, 650, SW - 220, 170, 24); c.fillStyle = '#3a1f1a'; c.fill(); T(c, '呵，关系户吧', 150, 760, 70, '#ffd0c8', 800);
  T(c, '拉他下来', 110, 1060, 110, '#ff6a5a', 900);
  rr(c, 60, 1220, SW - 120, 640, 36); c.fillStyle = '#251e0e'; c.fill(); c.strokeStyle = GOLD; c.lineWidth = 6; c.stroke();
  T(c, '私信', 110, 1320, 50, '#ffd27a', 700); rr(c, 110, 1370, SW - 220, 170, 24); c.fillStyle = '#3a3018'; c.fill(); T(c, '你是怎么做到的？', 150, 1480, 70, '#fff0c8', 800);
  T(c, '追上去', 110, 1780, 110, GOLD, 900);
});

/* ---------------------------------------------------------------- the desk */
type Scene = { g: THREE.Group; cam: number[]; screenCol: string };
const phone = (tex: THREE.Texture) => {
  const p = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.078, 0.165, 0.0085, 6, 0.011), M({ color: '#1a1b1e', metalness: 0.8, roughness: 0.28 })); body.castShadow = true; p.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.0715, 0.156), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: '#e6e6e6' })); scr.position.z = 0.0044; p.add(scr);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.0735, 0.1605), new THREE.MeshPhysicalMaterial({ color: '#000', roughness: 0.05, transparent: true, opacity: 0.12, clearcoat: 1, depthWrite: false })); glass.position.z = 0.0046; p.add(glass);
  const isl = new THREE.Mesh(new RoundedBoxGeometry(0.02, 0.006, 0.001, 2, 0.003), new THREE.MeshBasicMaterial({ color: '#000' })); isl.position.set(0, 0.074, 0.0047); p.add(isl);
  return p;
};
const desk = (X: number, tex: THREE.Texture, screenCol: string, pose: 'stand' | 'flat', cam: number[], extra?: (g: THREE.Group) => void): Scene => {
  const g = new THREE.Group(); g.position.x = X;
  add(g, new THREE.BoxGeometry(1.6, 0.04, 0.9), M({ map: woodTex(4, '#3a2416', 1024, 1024, 2, 1), roughness: 0.45 }), 0, 0.73, 0, false);
  add(g, new THREE.PlaneGeometry(6, 4), M({ color: '#141210', roughness: 1 }), 0, 1.4, -0.9, false);
  const p = phone(tex);
  if (pose === 'stand') { p.position.set(0, 0.84, 0); p.rotation.x = -0.2; const st = add(g, new THREE.BoxGeometry(0.06, 0.07, 0.05), M({ color: '#2a2a2c', metalness: 0.6, roughness: 0.4 }), 0, 0.785, -0.03); st.rotation.x = -0.35; }
  else { p.position.set(0, 0.755, 0); p.rotation.x = -Math.PI / 2; p.rotation.z = 0.12; }
  g.add(p);
  // props: a mug, a notebook, the lamp
  const mug = add(g, new THREE.CylinderGeometry(0.04, 0.036, 0.095, 32), M({ color: '#cfc8bc', roughness: 0.35 }), 0.2, 0.797, -0.12); void mug;
  add(g, new THREE.BoxGeometry(0.22, 0.012, 0.3), M({ color: '#2a3a4a', roughness: 0.8 }), -0.26, 0.756, 0.02).rotation.y = 0.2;
  const lampHead = add(g, new THREE.ConeGeometry(0.07, 0.1, 32, 1, true), M({ color: '#1e1e20', metalness: 0.5, roughness: 0.4, side: THREE.DoubleSide }), -0.32, 1.12, -0.2); lampHead.rotation.z = 0.9;
  add(g, new THREE.CylinderGeometry(0.008, 0.008, 0.4, 12), M({ color: '#1e1e20', metalness: 0.6 }), -0.42, 0.95, -0.22).rotation.z = 0.25;
  const s = new THREE.SpotLight('#ffcf9a', 6, 0, 0.6, 0.7, 2); s.position.set(-0.3, 1.1, -0.18); s.target.position.set(0.05, 0.75, 0.02); s.castShadow = true; s.shadow.mapSize.set(1024, 1024); s.shadow.bias = -0.0004; g.add(s, s.target);
  const sl = new THREE.PointLight(screenCol, 0.35, 0.6, 2); sl.position.copy(p.position).add(new THREE.Vector3(0, pose === 'flat' ? 0.06 : 0.02, pose === 'flat' ? 0 : 0.08)); g.add(sl);
  g.add(new THREE.HemisphereLight('#6a7a90', '#120c08', 0.18));
  extra?.(g);
  return { g, cam: [X + cam[0], cam[1], cam[2], X + cam[3], cam[4], cam[5], cam[6]], screenCol };
};
const STAND = [0.06, 0.88, 0.5, 0.0, 0.84, 0, 30];
const BUILD: ((x: number) => Scene)[] = [
  (x) => desk(x, pollScreen(false), '#c8d0ff', 'stand', STAND),
  (x) => desk(x, lockScreen(), ENVY, 'flat', [0.0, 1.2, 0.3, 0.06, 0.755, 0, 30]),
  (x) => desk(x, monkeyScreen(), '#ffd0a0', 'stand', [-0.09, 0.9, 0.48, 0.0, 0.84, 0, 30]),
  (x) => desk(x, podiumScreen(), '#e8e0d0', 'stand', [0.1, 0.86, 0.5, 0.0, 0.84, 0, 30]),
  (x) => desk(x, potterScreen(), ENVY, 'stand', STAND),
  (x) => desk(x, brainScreen(), '#ff8a6a', 'stand', [-0.08, 0.87, 0.5, 0.0, 0.84, 0, 30]),
  (x) => desk(x, twoScreen(), GOLD, 'stand', [0.08, 0.89, 0.49, 0.0, 0.84, 0, 30]),
  (x) => desk(x, pollScreen(true), GOLD, 'stand', [0.0, 0.92, 0.75, 0.0, 0.85, 0, 30]),
];
export const PHONE_LINES = ['先做个选择，别多想', '', '两只猴子，做一样的活', '1992年奥运会：银牌没有铜牌开心', '你不会嫉妒马云，你只嫉妒[同行]', '嫉妒，在大脑里就是一种{疼}', '一种让你想把他拉下来，另一种让你想[追上去]', 'A 还是 B，你选了哪个？'];

const World: React.FC<{ i: number }> = ({ i }) => {
  const { scene, camera, gl } = useThree();
  const S = useMemo(() => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap; scene.background = new THREE.Color('#000'); scene.environment = makeEnv(gl); (scene as any).environmentIntensity = 0.25;
    return BUILD.map((b, k) => { const s = b(k * 20); scene.add(s.g); return s; }); }, [scene, gl]);
  S.forEach((s, k) => { s.g.visible = k === i; });
  const p = S[i].cam; const cam = camera as THREE.PerspectiveCamera; cam.position.set(p[0], p[1], p[2]); cam.lookAt(p[3], p[4], p[5]); cam.fov = p[6]; cam.near = 0.01; cam.far = 30; cam.updateProjectionMatrix();
  return null;
};
const Overlay: React.FC<{ i: number }> = ({ i }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const g = ref.current!.getContext('2d')!; g.clearRect(0, 0, W, H); vignette(g, 0.6); grain(g, 11 + i, 0.05);
    if (i === 1) { g.save(); g.translate(1240, 520); g.font = `700 160px ${SERIF}`; g.textAlign = 'left'; const gr = g.createLinearGradient(0, -140, 0, 20); gr.addColorStop(0, '#e8ffd8'); gr.addColorStop(0.5, ENVY); gr.addColorStop(1, '#3f8a54'); g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 30; g.fillStyle = gr; g.fillText('嫉妒', 0, 0); g.restore();
      txt(g, '七 宗 罪', 1400, 330, 46, 'rgba(243,237,226,.75)', { w: 700, f: SERIF }); txt(g, '你宁愿少赚一半，也不想输给他？', 1440, 640, 40, INK, { w: 700 }); txt(g, '— VIBE知识大赏 —', 1440, 700, 24, 'rgba(243,237,226,.5)', { w: 500 }); }
    g.fillStyle = '#000'; g.fillRect(0, 0, W, 100); g.fillRect(0, H - 100, W, 100); mark(g, i === 1 ? 0 : 0.9);
    if (PHONE_LINES[i]) subtitle(g, PHONE_LINES[i], 1); }, [i]);
  return <canvas ref={ref} width={W} height={H} style={{ position: 'absolute', inset: 0 }} />;
};
const ALL = '先做个选择评论区你选了哪个告诉我也自己别多想选一个年薪万同事AB我…10月23日星期五23:47同事小王刚刚升职了！谢谢大家这些年的照顾～黄瓜葡萄同样的活，一只拿卷尾猴实验2003年《Nature》拿黄瓜的那：把扔回去它刚才明明吃得很开心12.8研究1995巴塞罗那奥运会谁更（10分制）银牌铜牌在差点就是金没4.87.1动态老陈陶艺关注行2小前新作被美术馆收藏，十值。赞人过“匠嫉妒乞丐。”—赫西俄德约公元700看到龄比强亮起疼痛区他倒霉奖励区会怎么回呵关系户吧拉下来私信做到的？追上去‹1,204七宗罪宁愿少赚半不输给大脑里种[]{}马云只';
export const Phone: React.FC = () => {
  const f = useCurrentFrame(); const i = Math.min(BUILD.length - 1, f); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + ALL + PHONE_LINES.join('');
    Promise.all([300, 400, 500, 600, 700, 800, 900].flatMap((w) => [`${w} 60px ${SANS}`, `${w} 60px ${SERIF}`]).map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  if (!ok) return null;
  return <AbsoluteFill style={{ background: '#000' }}>
    <ThreeCanvas width={W} height={H} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, preserveDrawingBuffer: true }} camera={{ fov: 30, near: 0.01, far: 30 }}><World i={i} /></ThreeCanvas>
    <Overlay i={i} />
  </AbsoluteFill>;
};
