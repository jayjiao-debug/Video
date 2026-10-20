/* 2D articulated wooden puppet: flat wooden pieces joined by pin joints, posed from the baked CMU takes (src/puppet/pts.json:
   3D joint positions per frame, projected here with a 3/4 view). Also a 皮影 (shadow puppet) skin of the same figure. */
import PTS from './puppet/pts.json';
import { G, rnd, setSeed } from './lib';

type V3 = number[]; type P2 = { x: number; y: number; z: number };
const D = PTS as unknown as { fps: number; keys: string[]; frames: V3[][]; seatY: number };
const K: Record<string, number> = {}; D.keys.forEach((k, i) => (K[k] = i));
export const PUPPET_DUR = D.frames.length / D.fps;

/* sample joints at time t (linear between baked frames) */
export const joints = (t: number): Record<string, V3> => { const x = Math.max(0, Math.min(D.frames.length - 1, t * D.fps)); const a = Math.floor(x), b = Math.min(D.frames.length - 1, a + 1), k = x - a; const o: Record<string, V3> = {}; D.keys.forEach((n, i) => { const A = D.frames[a][i], B = D.frames[b][i]; o[n] = [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k]; }); return o; };

export type View = { cx: number; gy: number; s: number; yaw: number };
export const proj = (v: V3, w: View): P2 => { const c = Math.cos(w.yaw), s = Math.sin(w.yaw); return { x: w.cx + (v[0] * c + v[2] * s) * w.s, y: w.gy - v[1] * w.s, z: -v[0] * s + v[2] * c }; };

export type Skin = 'wood' | 'shadow';
const WOOD = { light: ['#d8b382', '#b98a55', '#8d6236'], joint: ['#6b3f22', '#3d2312'] };
const SHADOW = { fill: 'rgba(120,40,24,.88)', edge: 'rgba(40,14,8,.95)', light: 'rgba(255,170,90,.55)' };

/* a flat tapered piece from a to b; rim light from the lamp direction */
const piece = (g: G, a: P2, b: P2, wa: number, wb: number, skin: Skin, seed: number, lampX = -1) => {
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  g.beginPath(); g.moveTo(a.x + nx * wa, a.y + ny * wa); g.lineTo(b.x + nx * wb, b.y + ny * wb); g.arc(b.x, b.y, wb, Math.atan2(ny, nx), Math.atan2(-ny, -nx)); g.lineTo(a.x - nx * wa, a.y - ny * wa); g.arc(a.x, a.y, wa, Math.atan2(-ny, -nx), Math.atan2(ny, nx)); g.closePath();
  if (skin === 'shadow') { g.fillStyle = SHADOW.fill; g.fill(); g.strokeStyle = SHADOW.edge; g.lineWidth = 2; g.stroke();
    /* carved holes in the leather */
    g.save(); g.clip(); g.fillStyle = SHADOW.light; setSeed(seed); for (let k = 1; k < 5; k++) { const u = k / 5; const cx = a.x + dx * u, cy = a.y + dy * u; const r = (wa + (wb - wa) * u) * 0.32; g.beginPath(); g.ellipse(cx, cy, r, r * 0.55, Math.atan2(dy, dx), 0, 7); g.fill(); } g.restore(); return; }
  const gr = g.createLinearGradient(a.x + nx * wa, a.y + ny * wa, a.x - nx * wa, a.y - ny * wa); const lit = nx * lampX > 0; gr.addColorStop(0, lit ? '#e9c896' : WOOD.light[1]); gr.addColorStop(0.5, WOOD.light[0]); gr.addColorStop(1, lit ? WOOD.light[2] : '#e2bd88'); g.fillStyle = gr; g.fill();
  g.save(); g.clip(); setSeed(seed); g.strokeStyle = 'rgba(110,70,35,.28)'; g.lineWidth = 1.4;
  for (let k = 0; k < 7; k++) { const off = (rnd() - 0.5) * 2 * Math.max(wa, wb) * 0.9; const wob = (rnd() - 0.5) * 6; g.beginPath(); g.moveTo(a.x + nx * off, a.y + ny * off); g.quadraticCurveTo((a.x + b.x) / 2 + nx * (off + wob), (a.y + b.y) / 2 + ny * (off + wob), b.x + nx * off, b.y + ny * off); g.stroke(); }
  g.restore(); g.strokeStyle = 'rgba(60,35,18,.55)'; g.lineWidth = 1.6; g.stroke();
};
const pin = (g: G, p: P2, r: number, skin: Skin) => {
  if (skin === 'shadow') { g.fillStyle = SHADOW.edge; g.beginPath(); g.arc(p.x, p.y, r * 0.55, 0, 7); g.fill(); g.fillStyle = 'rgba(255,200,120,.8)'; g.beginPath(); g.arc(p.x, p.y, r * 0.18, 0, 7); g.fill(); return; }
  const gr = g.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r); gr.addColorStop(0, '#9a6640'); gr.addColorStop(1, WOOD.joint[1]); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fill();
  g.fillStyle = '#c9a25a'; g.beginPath(); g.arc(p.x, p.y, r * 0.22, 0, 7); g.fill(); g.fillStyle = 'rgba(255,240,200,.5)'; g.beginPath(); g.arc(p.x - r * 0.08, p.y - r * 0.08, r * 0.08, 0, 7); g.fill();
};
const quad = (g: G, pts: P2[], skin: Skin, seed: number, round = 16) => {
  /* a rounded flat plate through four corners (chest / pelvis) */
  g.beginPath(); const n = pts.length; for (let i = 0; i < n; i++) { const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n]; const ax = p1.x + (p0.x - p1.x) * 0.18, ay = p1.y + (p0.y - p1.y) * 0.18, bx = p1.x + (p2.x - p1.x) * 0.18, by = p1.y + (p2.y - p1.y) * 0.18; i ? g.lineTo(ax, ay) : g.moveTo(ax, ay); g.quadraticCurveTo(p1.x, p1.y, bx, by); } g.closePath();
  if (skin === 'shadow') { g.fillStyle = SHADOW.fill; g.fill(); g.strokeStyle = SHADOW.edge; g.lineWidth = 2; g.stroke(); g.save(); g.clip(); g.fillStyle = SHADOW.light; const cx = pts.reduce((s, p) => s + p.x, 0) / n, cy = pts.reduce((s, p) => s + p.y, 0) / n; for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; g.beginPath(); g.ellipse(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, 9, 5, a, 0, 7); g.fill(); } g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill(); g.restore(); return; }
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y); const gr = g.createLinearGradient(Math.min(...xs), 0, Math.max(...xs), 0); gr.addColorStop(0, '#e6c393'); gr.addColorStop(0.55, WOOD.light[0]); gr.addColorStop(1, WOOD.light[2]); g.fillStyle = gr; g.fill();
  g.save(); g.clip(); setSeed(seed); g.strokeStyle = 'rgba(110,70,35,.25)'; g.lineWidth = 1.4; const y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs); for (let k = 0; k < 10; k++) { const x = x0 + (x1 - x0) * rnd(); g.beginPath(); g.moveTo(x, y0); g.bezierCurveTo(x + 8, y0 + (y1 - y0) * 0.3, x - 8, y0 + (y1 - y0) * 0.7, x + 3, y1); g.stroke(); } g.restore();
  g.strokeStyle = 'rgba(60,35,18,.55)'; g.lineWidth = 1.6; g.stroke();
};
const head = (g: G, neck: P2, top: P2, s: number, skin: Skin) => {
  const cx = neck.x + (top.x - neck.x) * 0.62, cy = neck.y + (top.y - neck.y) * 0.62; const ang = Math.atan2(top.y - neck.y, top.x - neck.x) + Math.PI / 2; const rx = 0.085 * s, ry = 0.118 * s;
  g.save(); g.translate(cx, cy); g.rotate(ang); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, 7);
  if (skin === 'shadow') { g.fillStyle = SHADOW.fill; g.fill(); g.strokeStyle = SHADOW.edge; g.lineWidth = 2; g.stroke(); g.fillStyle = SHADOW.light; g.beginPath(); g.ellipse(rx * 0.25, -ry * 0.1, rx * 0.35, ry * 0.12, 0, 0, 7); g.fill(); g.restore(); return; }
  const gr = g.createRadialGradient(-rx * 0.4, -ry * 0.4, 4, 0, 0, ry * 1.1); gr.addColorStop(0, '#f0d3a6'); gr.addColorStop(0.6, WOOD.light[0]); gr.addColorStop(1, WOOD.light[2]); g.fillStyle = gr; g.fill();
  g.save(); g.clip(); g.strokeStyle = 'rgba(110,70,35,.22)'; g.lineWidth = 1.4; for (let k = -4; k <= 4; k++) { g.beginPath(); g.ellipse(k * rx * 0.18, 0, rx * 0.5, ry * 1.05, 0, -1.2, 1.2); g.stroke(); } g.restore();
  g.strokeStyle = 'rgba(60,35,18,.55)'; g.lineWidth = 1.6; g.stroke(); g.restore();
};

/** draw the whole puppet at time t; returns screen points (for the chair/props to align to) */
export const drawPuppet = (g: G, t: number, w: View, skin: Skin = 'wood', J?: Record<string, V3>) => {
  const j = J ?? joints(t); const P: Record<string, P2> = {}; for (const k of D.keys) P[k] = proj(j[k], w);
  const s = w.s;
  /* parts: [depth, draw] — painter's order, far first */
  const parts: [number, () => void][] = [];
  const limb = (a: string, b: string, wa: number, wb: number, seed: number, pinA = true) => parts.push([(P[a].z + P[b].z) / 2, () => { piece(g, P[a], P[b], wa * s, wb * s, skin, seed); if (pinA) pin(g, P[a], Math.max(wa, wb) * s * 1.05, skin); }]);
  /* pelvis and chest plates */
  const mid = (a: P2, b: P2, k = 0.5): P2 => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
  parts.push([P.Hips.z - 0.02, () => { const c = Math.cos(w.yaw) * s; const lbL = { ...P.LowerBack, x: P.LowerBack.x + 0.11 * c }, lbR = { ...P.LowerBack, x: P.LowerBack.x - 0.11 * c }; const hl = { ...P.LeftUpLeg, x: P.LeftUpLeg.x + 0.03 * c, y: P.LeftUpLeg.y + 0.03 * s }, hr = { ...P.RightUpLeg, x: P.RightUpLeg.x - 0.03 * c, y: P.RightUpLeg.y + 0.03 * s }; quad(g, [lbL, lbR, hr, hl], skin, 3); }]);
  parts.push([P.Spine1.z - 0.01, () => { const waistL = { ...P.Spine1, x: P.Spine1.x + 0.09 * s * Math.cos(w.yaw), y: P.Spine1.y + 0.13 * s }, waistR = { ...P.Spine1, x: P.Spine1.x - 0.09 * s * Math.cos(w.yaw), y: P.Spine1.y + 0.13 * s }; quad(g, [mid(P.LeftArm, P.Spine1, 0.08), mid(P.RightArm, P.Spine1, 0.08), waistR, waistL], skin, 5); pin(g, mid(P.LowerBack, P.Spine1, 0.6), 0.04 * s, skin); }]);
  /* neck, head */
  parts.push([P.Neck.z, () => { piece(g, P.Neck, P.Head, 0.028 * s, 0.024 * s, skin, 9); head(g, P.Head, P.Head_end, s, skin); pin(g, P.Neck, 0.032 * s, skin); }]);
  /* legs */
  for (const side of ['Left', 'Right']) {
    limb(`${side}UpLeg`, `${side}Leg`, 0.062, 0.046, side === 'Left' ? 11 : 12);
    limb(`${side}Leg`, `${side}Foot`, 0.044, 0.032, side === 'Left' ? 13 : 14);
    parts.push([(P[`${side}Foot`].z + P[`${side}ToeBase_end`].z) / 2 + 0.01, () => { piece(g, P[`${side}Foot`], P[`${side}ToeBase_end`], 0.03 * s, 0.038 * s, skin, 15); pin(g, P[`${side}Foot`], 0.03 * s, skin); }]);
  }
  /* arms */
  for (const side of ['Left', 'Right']) {
    limb(`${side}Arm`, `${side}ForeArm`, 0.04, 0.032, side === 'Left' ? 21 : 22);
    limb(`${side}ForeArm`, `${side}Hand`, 0.031, 0.025, side === 'Left' ? 23 : 24);
    parts.push([P[`${side}Hand`].z + 0.005, () => { piece(g, P[`${side}Hand`], P[`${side}HandIndex1_end`], 0.03 * s, 0.036 * s, skin, 25); pin(g, P[`${side}Hand`], 0.026 * s, skin); }]);
  }
  parts.sort((a, b) => a[0] - b[0]).forEach(([, f]) => f());
  return P;
};
export const SEAT_Y = D.seatY;
