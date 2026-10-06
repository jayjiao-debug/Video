import { Easing } from 'remotion';
import { Buf, W, H, K0, K1, K2, K3, SKC, SKW, SHW, WD, BR, O, P0, P1, R, Y, C, G1, G2, R2, ip, oc, ic, rnd, rng, bay, glyph, maskOf, panel, rmask, tint, outlinePoly } from './core';
import { spr, hero, tag, plaque, box, spark, cube, examDemon, slip, notebook, slime, tree, castle, overworld, dmg, bars, worker } from './sprites';
import { sceneGame, sceneHW } from './open';
import TL from './tl.json';

type Seg = { id: string; block: string; caption: string; t0: number; t1: number };
const SEGS = TL.segments as Seg[];
const CUE: Record<string, Seg> = Object.fromEntries(SEGS.map((s) => [s.id, s]));
/** frame where segment id starts (+ seconds offset) / ends */
export const cf = (id: string, dt = 0) => Math.round((CUE[id].t0 + dt) * 30);
export const ce = (id: string) => Math.round(CUE[id].t1 * 30);
/** frame where a phrase starts inside a segment, by its share of the caption's characters */
export const cw = (id: string, phrase: string) => {
  const s = CUE[id], i = s.caption.indexOf(phrase), n = [...s.caption].length;
  return Math.round((s.t0 + ((i < 0 ? 0 : [...s.caption.slice(0, i)].length) / n) * (s.t1 - s.t0)) * 30);
};

/* ================= C · the interviews: three panels, then a current carries all three ================= */
const CP = [[[8, 8], [128, 8], [120, 164], [8, 164]], [[134, 8], [252, 8], [244, 164], [126, 164]], [[258, 8], [376, 8], [376, 164], [250, 164]]];
let cMasks: Uint8Array[] | null = null;
const wave = (b: Buf, f: number, x1: number, lift: number) => {
  const t = f / 30;
  for (let k = 0; k < 6; k++) {
    const col = k === 2 ? R : k % 2 ? C : P0; let prev: number | null = null;
    for (let x = 0; x <= Math.min(W, x1); x++) {
      const yy = Math.round(132 - lift + 7 * Math.sin(x / 26 + k * 0.5 - t * 3) + k * 5);
      const a = prev === null ? yy : prev;
      for (let y = Math.min(a, yy); y <= Math.max(a, yy) + (k === 2 ? 1 : 0); y++) b.set(x, y, col);
      prev = yy;
    }
  }
};
export const sceneC = (b: Buf, f: number) => {
  if (!cMasks) cMasks = CP.map(maskOf);
  b.rect(0, 0, W, H, P0);
  const p1 = cw('C1', '下棋'), p2 = cw('C1', '攀岩'), p3 = cw('C1', '跳舞'), q = cf('C2'), flow = cf('C3', 1.2);
  if (f < p1) {
    // who asked: a name card with a microphone
    const k = f - cf('C1') + 4;
    b.dither(0, 0, W, H, P1, 0.25);
    box(b, 92, 48, 200, 88);
    b.text('契克森米哈赖', 192, 60, 2, P0, 'center');
    b.text('心理学家 · 1934–2021', 192, 92, 1, P1, 'center');
    // microphone
    const mx = 192, my = 112 + (k < 6 ? 6 - k : 0);
    b.rect(mx - 3, my, 7, 10, K3); b.rect(mx - 2, my + 1, 5, 8, P1); b.line(mx, my + 10, mx, my + 16, K0); b.rect(mx - 4, my + 16, 9, 2, K0);
    if (Math.floor(f / 8) % 2) { b.line(mx - 8, my + 2, mx - 10, my + 6, P0); b.line(mx + 8, my + 2, mx + 10, my + 6, P0); }
    return;
  }
  const lift = f >= flow ? Math.min(14, Math.floor((f - flow) / 3)) : 0;
  const ask = f >= q && f < flow;
  panel(b, CP[0], cMasks[0], f, p1, () => {            // chess
    b.rect(0, 0, 140, H, K1);
    b.dither(0, 0, 140, 60, K2, 0.5);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
      const y0 = 92 + r * 11 - lift, sh = r * 2, x0 = 18 + c * 12 - sh + r;
      b.rect(x0, y0, 12, 11, (r + c) % 2 ? K2 : P1);
    }
    const kx = 54 + (Math.floor((f - p1) / 20) % 2) * 12, ky = 72 - lift - (Math.floor((f - p1) / 10) % 2) * 3;
    spr(b, ['..KK..', '.KKKK.', 'KKKKK.', '..KKK.', '..KKK.', '.KKKK.', 'KKKKKK'], kx, ky, 2, { K: K0 });
    b.ellipse(kx + 8, ky - 8, 8, 6, SKW); b.rect(kx + 12, ky - 12, 8, 4, SKW);   // the hand
    tag(b, '下棋', 14, 14);
  });
  panel(b, CP[1], cMasks[1], f, p2, () => {            // climber
    b.rect(120, 0, 140, H, WD);
    const r = rng(7); for (let k = 0; k < 18; k++) { const x = 132 + r() * 110, y = 12 + r() * 150; b.disc(x, y - lift, 2, r() > 0.5 ? R : Y); }
    for (let y = 0; y < H; y += 5) for (let x = 120; x < 260; x += 7) if (rnd(x * 7 + y) > 0.8) b.set(x, y, BR);
    const cyc = Math.floor((f - p2) / 6), cy0 = 110 - Math.min(30, cyc * 2) - lift;
    b.line(190, 0, 190, cy0, P1);
    spr(b, ['.KK.', 'KKKK', '.KK.', 'KKKK', 'K.KK', '.KK.', 'K..K', 'K..K'], 184, cy0, 3, { K: K0 });
    b.line(182, cy0 + 4, 176, cy0 - 8 + (cyc % 2) * 3, K0, 2); b.line(196, cy0 + 4, 202, cy0 - 6 - (cyc % 2) * 3, K0, 2);
    tag(b, '攀岩', 140, 14);
  });
  panel(b, CP[2], cMasks[2], f, p3, () => {            // dancer under a spotlight
    b.rect(240, 0, 144, H, K1);
    for (let y = 0; y < 150; y++) { const half = 6 + y * 0.32; for (let x = Math.round(316 - half); x <= Math.round(316 + half); x++) if (bay(x, y) < 4) b.set(x, y, Y); }
    b.ellipse(316, 150 - lift, 34, 6, K2);
    const pose = Math.floor((f - p3) / 5) % 3, dx = 306, dy = 98 - lift;
    b.disc(dx + 10, dy, 5, K0); b.rect(dx + 7, dy + 5, 7, 18, K0);
    if (pose === 0) { b.line(dx + 7, dy + 8, dx - 6, dy - 2, K0, 2); b.line(dx + 14, dy + 8, dx + 26, dy + 2, K0, 2); b.line(dx + 9, dy + 22, dx + 4, dy + 44, K0, 3); b.line(dx + 12, dy + 22, dx + 24, dy + 38, K0, 3); }
    if (pose === 1) { b.line(dx + 7, dy + 8, dx + 2, dy - 8, K0, 2); b.line(dx + 14, dy + 8, dx + 18, dy - 8, K0, 2); b.line(dx + 10, dy + 22, dx + 10, dy + 46, K0, 3); b.line(dx + 11, dy + 24, dx - 6, dy + 30, K0, 3); }
    if (pose === 2) { b.line(dx + 7, dy + 8, dx - 8, dy + 14, K0, 2); b.line(dx + 14, dy + 8, dx + 28, dy + 12, K0, 2); b.line(dx + 9, dy + 22, dx + 2, dy + 44, K0, 3); b.line(dx + 12, dy + 22, dx + 20, dy + 44, K0, 3); }
    tag(b, '跳舞', 266, 14);
  });
  if (ask) for (const [k, x] of [[0, 92], [1, 216], [2, 340]] as number[][]) { if (f >= q + k * 4) { b.disc(x, 34, 9, P0); b.disc(x, 34, 8, P0); b.rect(x - 9, 25, 18, 18, K0); b.rect(x - 8, 26, 16, 16, P0); b.text('?', x - 3, 28, 1, R); } }
  if (f >= flow - 30) wave(b, f, (f - (flow - 30)) * 14, lift);
};

/* ================= D · games got three things right ================= */
const SLOT_X = [150, 192, 234];
const slots = (b: Buf, f: number) => {
  const on = [cf('D3'), cf('D8'), cf('D11')], pop = [cw('D2', '三件事'), cw('D2', '三件事') + 4, cw('D2', '三件事') + 8];
  SLOT_X.forEach((x, i) => {
    if (f < pop[i]) return;
    const lit = f >= on[i], k = f - on[i], e = lit && k < 3 ? 2 : 0;
    b.rect(x - 15 - e, 6 - e, 30 + 2 * e, 30 + 2 * e, K0); b.rect(x - 13, 8, 26, 26, lit ? P0 : K2);
    if (!lit) { b.text('?', x - 3, 15, 1, K3); return; }
    if (i === 0) { b.disc(x, 21, 9, R); b.disc(x, 21, 6, P0); b.disc(x, 21, 3, R); }
    if (i === 1) b.poly([[x + 3, 10], [x - 6, 23], [x, 23], [x - 3, 32], [x + 7, 18], [x + 1, 18]], Y);
    if (i === 2) { b.rect(x - 1, 11, 2, 19, K0); b.rect(x - 9, 14, 18, 2, K0); b.rect(x - 11, 22, 7, 2, K3); b.rect(x + 4, 22, 7, 2, K3); b.line(x - 9, 16, x - 11, 22, K0); b.line(x + 9, 16, x + 11, 22, K0); b.rect(x - 4, 29, 8, 2, K0); }
  });
};
const homeworkDesk = (b: Buf) => {
  b.rect(0, 0, W, H, BR); for (let x = 0; x < W; x += 12) b.dither(x, 0, 1, H, K0, 0.5);
  b.within(rmask(0, 0, W, H), () => tint(b, 192, 90, 220, 120, BR, O, 0.12));
  b.rect(0, 150, W, 66, WD); b.rect(0, 150, W, 2, O);
};
/** catch encounter: kind 0 = too hard (breaks free), 1 = too easy (instant), 2 = just right (clicks after 3 wobbles) */
const encounter = (b: Buf, f: number, kind: number, t0: number) => {
  const k = f - t0;
  overworld(b, 0, 132);
  if (kind !== 2) for (let i = 0; i < b.d.length; i++) {
    const c = b.d[i], x = i % W, y = (i / W) | 0;
    if (kind === 0) { if (c === C) b.d[i] = y < 50 ? R2 : bay(x, y) < 8 ? R2 : O; else if (c === P0) b.d[i] = O; else if (c === G1) b.d[i] = G2; }
    else { if (c === C || c === P0) b.d[i] = P1; else if (c === G1) b.d[i] = K3; else if (c === G2) b.d[i] = K2; }
  }
  const T = [{ throw: 14, hit: 24, wob: [32, 42, 52], end: 62 }, { throw: 6, hit: 14, wob: [], end: 18 }, { throw: 12, hit: 22, wob: [28, 40, 52], end: 64 }][kind];
  const mx = 280, my = 150;
  const captured = k >= T.hit + 3 && (kind !== 0 || k < T.end);
  const ex = 70, ey = 170;
  // the creature
  if (!captured) {
    const fl = k >= T.hit && k < T.hit + 3;
    if (kind === 0) examDemon(b, mx, my + 10, f, fl);
    if (kind === 1) slip(b, mx, my, f);
    if (kind === 2) notebook(b, mx, my + 2, f);
    if (kind === 0 && k >= T.end && k < T.end + 4) for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; b.line(mx + Math.cos(a) * 20, my - 60 + Math.sin(a) * 20, mx + Math.cos(a) * (40 + (k - T.end) * 8), my - 60 + Math.sin(a) * (40 + (k - T.end) * 8), P0, 2); }
  }
  // hero (back-left, big)
  hero(b, ex, ey, 4, f, { sweat: kind === 0 && k > T.end - 4, yawn: kind === 1 && k > T.end + 6, arm: k >= T.throw - 4 && k < T.throw + 2 });
  // the cube: flight then wobble on the ground
  if (k >= T.throw && k < T.hit) { const u = (k - T.throw) / (T.hit - T.throw), x = ex + 30 + (mx - ex - 40) * u, y = 120 - 70 * 4 * u * (1 - u); cube(b, x, y, 2); }
  if (captured) {
    const wi = T.wob.findIndex((w) => k >= w && k < w + 6);
    const tilt = wi >= 0 ? ((k - T.wob[wi]) < 3 ? -1 : 1) : 0;
    cube(b, mx - 12, my - 24, 3, tilt);
    const done = kind === 1 ? k >= T.end : kind === 2 ? k >= T.end : false;
    if (done) { const d = k - T.end; if (d < 10) { spark(b, mx - 14, my - 22, 2 + (d % 3)); spark(b, mx + 12, my - 26, 3 - (d % 3)); spark(b, mx, my - 34, 2); } }
  }
  // name plate
  const names = ['期末卷大魔王', '1+1 小纸条', '错题本'], lv = ['Lv.99', 'Lv.1', 'Lv.12'], rate = ['2%', '100%', '85%'];
  box(b, 8, 10, 162, 44);
  b.text(names[kind], 16, 15, 1, P0); b.text(lv[kind], 162, 15, 1, Y, 'right');
  b.text('捕获率', 16, 33, 1, P1); b.text(rate[kind], 162, 31, 1, [R, K3, G1][kind], 'right');
  bars(b, 64, 37, 54, [0.02, 1, 0.85][kind], [R, K3, G1][kind], 4);
  box(b, 8, 60, 84, 24); b.text('你 Lv.10', 16, 65, 1, P0);
  // result line
  if (kind === 0 && k >= T.end + 2) tag(b, '挣脱了！', 170, 78, P0, R, 'center');
  if (kind === 1 && k >= T.end + 2) tag(b, '抓到了……', mx, 92, P0, K3, 'center');
  if (kind === 2 && k >= T.end + 2) { const e = k < T.end + 4 ? 2 : 0; b.rect(mx - 46 - e, 80 - e, 92 + 2 * e, 22 + 2 * e, Y); b.rect(mx - 44, 82, 88, 18, K0); b.text('抓到了！', mx, 85, 1, Y, 'center'); }
};
export const sceneD = (b: Buf, f: number) => {
  const d6 = cf('D6'), d8 = cf('D8'), d10 = cf('D10'), d11 = cf('D11'), d12 = cf('D12'), d13 = cf('D13'), d14 = cf('D14');
  if (f >= d12) { const kind = f >= d14 ? 2 : f >= d13 ? 1 : 0; encounter(b, f, kind, [d12, d13, d14][kind]); return; }
  if (f >= d6 && f < d8) {                                     // homework: no goal in sight
    homeworkDesk(b);
    const scroll = f >= cf('D7') ? Math.floor((f - cf('D7')) / 2) : 0;
    b.within(rmask(110, 14, 164, 150), () => {
      b.rect(110, 14, 164, 150, P0);
      for (let k = 0; k < 20; k++) { const y = 54 + k * 8 - scroll; b.rect(122, y, 140 - (k * 37 % 50), 2, P1); }
    });
    b.rect(110, 14, 164, 34, P0); b.text('复习第三章', 192, 20, 2, K0, 'center'); b.rect(124, 46, 136, 1, K3);
    outlinePoly(b, [[109, 13], [274, 13], [274, 164], [109, 164]], K0, 2);
    const p = 0.1 + 0.8 * rnd(Math.floor(f / 5));
    tag(b, '进度', 290, 70, P0, K0); bars(b, 290, 90, 80, p, K3, 6); b.text('??%', 330, 100, 1, P0, 'center', K0);
    if (Math.floor(f / 6) % 2) b.text('?', 60, 60 + (f % 30) / 3, 2, P1);
    return;
  }
  if (f >= d10 && f < d11) {                                   // homework feedback: a week of waiting
    homeworkDesk(b);
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日', '周一'];
    const di = Math.min(7, Math.floor((f - d10) / 8));
    box(b, 132, 22, 120, 116); b.rect(134, 24, 116, 24, R); b.text('日历', 192, 30, 1, P0, 'center');
    b.rect(134, 48, 116, 88, P0); b.text(days[di], 192, 70, 3, di === 7 ? R : K0, 'center');
    if (di === 7) { const k = f - d10 - 56; b.poly([[262, 150 - Math.min(40, k * 4)], [330, 146 - Math.min(40, k * 4)], [336, 200], [266, 204]], P0); b.text('发卷', 298, 166 - Math.min(40, k * 4), 1, R, 'center'); }
    b.text('zzz', 70, 70 - (f % 24) / 4, 1, P1);
    return;
  }
  // the game: overworld with the hero walking toward the castle
  const scroll = f * 1.2;
  overworld(b, scroll, 140);
  tree(b, ((300 - scroll) % 460 + 460) % 460 - 40, 140); tree(b, ((120 - scroll) % 460 + 460) % 460 - 40, 140);
  castle(b, 300, 140);
  const battle = f >= cf('D9') && f < d10;
  if (!battle) hero(b, 120, 158, 3, f, { walk: true });
  slots(b, f);
  // ① goals: quest log + waypoint
  if (f >= cf('D4') && f < d8) {
    box(b, 8, 46, 140, 40); b.text('主线任务', 16, 51, 1, P1); b.text('击败BOSS  0/1', 16, 67, 1, P0);
    if (Math.floor(f / 8) % 2) b.text('▶', 136, 67, 1, Y);
    const by = 70 + (Math.floor(f / 6) % 2) * 3; b.poly([[316, by], [332, by], [324, by + 10]], Y); b.rect(321, by - 8, 6, 8, Y);
  }
  // ② feedback: a fight with damage numbers, XP and a level up
  if (battle) {
    const k = f - cf('D9'), hitK = k % 14, hits = Math.floor(k / 14);
    hero(b, 140 + (hitK < 3 ? 8 : 0), 158, 3, f, { arm: hitK < 4 });
    slime(b, 220, 158, 3, f, hitK < 2);
    const nums = ['-12', '-15', '暴击 -40', '-13', '-16', '-14', '-18'];
    for (let j = 0; j <= hits && j < nums.length; j++) dmg(b, nums[j], [236, 270, 196, 238, 268, 200, 240][j], [114, 100, 76, 110, 96, 112, 92][j], k - j * 14, j === 2 ? R : Y);
    box(b, 8, 46, 150, 28); b.text('EXP', 14, 54, 1, P1);
    bars(b, 44, 56, 104, Math.min(1, k / 66), Y, 6);
    const lu = cw('D9', '升级'); if (f >= lu) { const kk = f - lu; plaque(b, 'LEVEL UP!', 192, 82, kk, 2); if (kk < 12) { spark(b, 120, 80, 3); spark(b, 268, 90, 2); } }
  }
  // the three banners
  for (const [id, t] of [['D3', '① 目标清楚'], ['D8', '② 马上反馈'], ['D11', '③ 难度刚好']] as string[][]) {
    const k = f - cf(id); if (k >= 0 && k < 44) plaque(b, t, 192, 60, k, 2);
  }
};

/* ================= E · the challenge × skill map ================= */
const OX = 52, OY = 158, AX = 360, AY = 18;
const chan = (x: number) => OY - (x - OX) * 0.42 - 6;           // centre line of the flow channel
export const sceneE = (b: Buf, f: number) => {
  b.rect(0, 0, W, H, P0);
  const e1 = cf('E1'), e2 = cf('E2'), e3 = cf('E3'), e4 = cf('E4'), e5 = cf('E5'), e6 = cf('E6');
  const reg = f >= e2 ? Math.min(1, (f - e2) / 16) : 0;
  if (reg > 0) {
    for (let y = AY; y < OY; y++) for (let x = OX + 1; x < AX; x++) {
      const c = chan(x), d = y - c;
      if (x - OX > (AX - OX) * reg + (OY - y) * 0.4) continue;
      if (d < -16) {                                              // anxiety: lava, bubbling
        const v = bay(x, y) / 16 + 0.25 * Math.sin(x * 0.2 + f * 0.3 + y * 0.1);
        b.set(x, y, v > 0.75 ? Y : v > 0.35 ? O : R);
      } else if (d > 16) b.set(x, y, bay(x, y) < 5 ? P1 : K3 === 0 ? P1 : P1);   // boredom: flat grey sand
      else { const tile = (Math.floor((x - OX) / 8) + Math.floor((y - c + 16) / 8)) % 2; b.set(x, y, tile ? P0 : P1); if (Math.abs(d) >= 15) b.set(x, y, K0); }
    }
    if (reg >= 1) {
      for (let y = AY; y < OY; y++) for (let x = OX + 1; x < AX; x++) { const d = y - chan(x); if (d > 16 && bay(x, y) < 6) b.set(x, y, K3); }
      b.text('焦虑', 100, 44, 2, P0, 'left', K0);
      b.text('无聊', 304, 72, 2, K3, 'center', P0);
      b.text('心流', 300, chan(300) - 12, 2, K0, 'center', P0);
    }
  }
  // the staircase the hero climbs: skill step, then challenge step
  if (f >= e3) {
    const k = f - e3, n = Math.min(10, Math.floor(k / 6));
    let x = OX + 14, y = chan(OX + 14);
    for (let i = 0; i < n; i++) { const nx = i % 2 === 0 ? x + 28 : x, ny = i % 2 === 0 ? y : chan(x) ; b.line(x, y, nx, ny, K0, 2); x = nx; y = ny; }
    if (f >= e4) for (let j = 0; j < 5; j++) { const fx = OX + 14 + j * 28 + 2, fy = chan(fx - 2); if (f >= e4 + j * 4) { b.line(fx, fy - 1, fx, fy - 14, K0); b.rect(fx + 1, fy - 14, 16, 8, R); b.text(`${j + 1}`, fx + 6, fy - 16, 1, P0); } }
    hero(b, x, y, 2, f, { walk: n < 10 });
  }
  // axes
  const ka = f >= e1 ? Math.min(1, (f - e1) / 18) : 0;
  b.line(OX, OY, OX + (AX - OX) * ka, OY, K0, 2); b.line(OX, OY, OX, OY - (OY - AY) * ka, K0, 2);
  if (ka >= 1) { b.poly([[AX, OY - 4], [AX + 7, OY], [AX, OY + 4]], K0); b.poly([[OX - 4, AY], [OX, AY - 7], [OX + 4, AY]], K0); }
  if (f >= cw('E1', '横轴')) b.text('能力 →', AX - 2, OY + 3, 1, K0, 'right');
  if (f >= cw('E1', '纵轴')) { b.text('挑', OX - 14, AY + 2, 1, K0); b.text('战', OX - 14, AY + 15, 1, K0); b.text('↑', OX - 14, AY + 28, 1, K0); }
  // the paper and its guess
  if (f >= e5) {
    const sl = Math.max(0, 14 - (f - e5)) * 8, x = 232 + sl, y = 102;
    box(b, x, y, 144, 40); b.text('Nature Commun. 2019', x + 8, y + 4, 1, P1);
    b.rect(x + 7, y + 20, 110, 13, Y); b.text('"levels" in games', x + 9, y + 20, 1, K0);
  }
  if (f >= e6) {
    const k = f - e6;
    for (let x = OX + 2; x < AX - 4; x += 3) if ((x + k * 2) % 18 < 6) b.set(x, Math.round(chan(x)), Y);
    if (k > 20) tag(b, '作者的猜想：学得最快的地方？', 66, 22, P0, R);
  }
};

/* ================= F · the pager study ================= */
const city = (b: Buf, f: number) => {
  b.rect(0, 0, W, H, C); for (let y = 0; y < 90; y++) b.dither(0, y, W, 1, P0, 0.35 * (1 - y / 90));
  const r = rng(31);
  for (let i = 0; i < 16; i++) {
    const x = i * 25 - 6, h = 50 + r() * 110, w = 20 + r() * 8, top = 168 - h;
    b.rect(x, top, w, h, i % 3 ? K3 : K2);
    for (let yy = top + 5; yy < 164; yy += 7) for (let xx = x + 3; xx < x + w - 3; xx += 5) b.rect(xx, yy, 2, 3, rnd(xx * 3 + yy) > 0.3 ? P1 : K1);
    if (i === 7) { b.rect(x + w / 2 - 1, top - 22, 2, 22, K2); }
  }
  b.rect(0, 166, W, 50, K2);
};
export const sceneF = (b: Buf, f: number) => {
  const f2 = cf('F2'), f3 = cf('F3'), f4 = cf('F4'), f5 = cf('F5'), f6 = cf('F6'), f7 = cf('F7'), f8 = cf('F8');
  if (f < f4) {
    city(b, f);
    if (f >= f2) {
      // 78 workers = 13 × 6, popping in row by row
      b.dither(0, 0, W, 166, K0, 0.25);
      const shown = Math.min(78, Math.floor((f - f2) * 2.2));
      const beeps = new Set<number>(); if (f >= f3) for (let j = 0; j < 4; j++) beeps.add(Math.floor(rnd(Math.floor(f / 3) * 11 + j) * 78));
      for (let i = 0; i < shown; i++) { const c = i % 13, r = Math.floor(i / 13); worker(b, 54 + c * 22, 40 + r * 21, i, beeps.has(i)); }
      box(b, 8, 8, 82, 26); b.text(`${shown} 人`, 49, 14, 1, P0, 'center');
      if (f >= f3) { const n = Math.min(56, Math.floor((f - f3) / 0.8)); box(b, 290, 8, 86, 26); b.text(`响了 ${n} 次`, 333, 14, 1, Y, 'center'); const days = ['一', '二', '三', '四', '五', '六', '日']; b.text(`周${days[Math.min(6, Math.floor(n / 8))]}`, 192, 14, 1, P0, 'center', K0); }
    }
    return;
  }
  if (f < f5) {                                                // the form
    b.rect(0, 0, W, H, K2); b.dither(0, 0, W, H, K1, 0.5);
    worker(b, 60, 70, 3, Math.floor(f / 6) % 2 === 0);
    b.rect(52, 84, 24, 2, K0);
    box(b, 120, 24, 200, 130); b.rect(122, 26, 196, 126, P0);
    b.text('第 23 次 · 周三 15:12', 132, 32, 1, K3);
    const rows: [string, number][] = [['在干嘛', 0], ['难不难', 4], ['会不会', 3]];
    rows.forEach(([lab, v], i) => {
      const at = cw('F4', ['在干嘛', '难不难', '会不会'][i]); if (f < at) return;
      const y = 56 + i * 30; b.text(lab, 132, y, 1, K0);
      if (i === 0) b.text('开会', 200, y, 1, R);
      else for (let j = 0; j < 5; j++) { b.rect(200 + j * 14, y + 1, 11, 10, K0); if (j < v && f >= at + 4 + j * 2) b.rect(201 + j * 14, y + 2, 9, 8, i === 1 ? R : C); }
    });
    return;
  }
  if (f < f7) {                                                // 54% vs 17%
    b.rect(0, 0, W, H, P0);
    const draw = (lab: string, v: number, y: number, at: number, col: number) => {
      if (f < f5) return;
      const p = f < at ? 0 : ip(f, at, at + 20, 0, v, oc);
      b.text(lab, 30, y + 6, 2, K0);
      bars(b, 92, y + 8, 180, p, col, 14);
      b.text(`${Math.round(p * 100)}%`, 284, y, 3, col, 'left', K0);
    };
    b.text('处在心流里的时刻', 192, 22, 1, K3, 'center');
    draw('上班', 0.54, 48, cw('F5', '54%') - 6, R);
    draw('下班', 0.17, 104, cw('F6', '17%') - 6, K3);
    return;
  }
  if (f < f8) {                                                // wish to be elsewhere
    b.rect(0, 0, W, H, K3); b.dither(0, 0, W, H, K2, 0.3);
    b.rect(60, 120, 160, 8, WD); b.rect(70, 128, 6, 40, WD); b.rect(204, 128, 6, 40, WD);
    b.rect(100, 92, 50, 28, K0); b.rect(103, 95, 44, 22, C);
    worker(b, 160, 96, 5); b.rect(158, 108, 4, 4, SKW);
    const k = f - f7;
    for (let j = 0; j < 3; j++) if (k > 6 + j * 4) b.disc(190 + j * 8, 84 - j * 8, 2 + j, P0);
    if (k > 18) { const bx = 230, by = 18; b.ellipse(bx + 60, by + 40, 70, 40, P0); b.within(rmask(bx, by, 120, 80), () => { b.rect(bx, by + 44, 120, 40, C); b.disc(bx + 90, by + 24, 10, Y); b.rect(bx, by + 60, 120, 20, Y); b.line(bx + 30, by + 60, bx + 36, by + 30, WD, 2); b.ellipse(bx + 36, by + 28, 12, 4, G2); }); }
    return;
  }
  // TV on the couch at night
  b.rect(0, 0, W, H, K1); b.dither(0, 0, W, H, K0, 0.4);
  const tvx = 250, flick = [C, P1, Y, C][Math.floor(f / 5) % 4];
  b.rect(tvx - 4, 70, 98, 66, K0); b.rect(tvx, 74, 90, 58, K2); b.dither(tvx, 74, 90, 58, flick, 0.5); b.ellipse(tvx + 30 + (Math.floor(f / 15) % 2) * 20, 104, 9, 10, K0); b.rect(tvx + 20 + (Math.floor(f / 15) % 2) * 20, 112, 20, 20, K0); for (let y = 75; y < 132; y += 2) b.rect(tvx, y, 90, 1, K1); b.rect(tvx + 40, 136, 10, 14, K0); b.rect(tvx + 20, 150, 50, 4, K0);
  for (let y = 40; y < 200; y++) for (let x = 120; x < tvx; x++) if (bay(x, y) < 2 && Math.abs(y - 103) < (tvx - x) * 0.6) b.set(x, y, flick);
  const sink = f >= cf('F9') ? Math.min(10, Math.floor((f - cf('F9')) / 4)) : 0;
  b.rect(30, 120, 150, 50, BR); b.rect(30, 104, 150, 22, WD); b.rect(24, 110, 14, 60, WD); b.rect(172, 110, 14, 60, WD);
  b.ellipse(104, 116 + sink, 14, 13, SKW); b.ellipse(104, 108 + sink, 15, 9, K0); b.rect(86, 128 + sink, 40, 26 - sink, K2);
  b.line(96, 118 + sink, 101, 118 + sink, K0); b.line(108, 118 + sink, 113, 118 + sink, K0);
  b.rect(118, 140, 20, 6, K0);
};

/* ================= G · the ending ================= */
const GP = [[[8, 8], [126, 8], [118, 168], [8, 168]], [[132, 8], [252, 8], [244, 168], [124, 168]], [[258, 8], [376, 8], [376, 168], [250, 168]]];
let gMasks: Uint8Array[] | null = null;
export const sceneG = (b: Buf, f: number) => {
  if (!gMasks) gMasks = GP.map(maskOf);
  const g1 = cf('G1'), g2 = cf('G2'), g3 = cf('G3'), g4 = cf('G4'), g5 = cf('G5'), g6 = cf('G6'), g7 = cf('G7');
  if (f < g4) {
    b.rect(0, 0, W, H, P0);
    panel(b, GP[0], gMasks[0], f, g1, () => {                   // 躺平: grey couch
      b.rect(0, 0, 130, H, K3); b.rect(16, 100, 96, 34, P1); b.rect(16, 86, 96, 18, P1);
      b.ellipse(50, 92, 10, 8, P1); b.rect(40, 100, 50, 12, K3); b.text('zzz', 70, 70 - (f % 30) / 5, 1, P0);
      tag(b, '躺平', 64, 140, P0, K0, 'center');
    });
    panel(b, GP[2], gMasks[2], f, g2, () => {                   // 硬撑: buried under books
      b.rect(250, 0, 134, H, R2);
      for (let k = 0; k < 9; k++) b.rect(272 + (k % 2) * 6, 132 - k * 12, 72 - (k % 3) * 8, 11, [R, O, C, P1][k % 4]);
      b.ellipse(312, 146, 12, 11, SKW); b.ellipse(312, 139, 13, 7, K0); b.rect(322, 140 + (Math.floor(f / 4) % 3), 2, 4, C);
      tag(b, '硬撑', 314, 150, P0, K0, 'center');
    });
    panel(b, GP[1], gMasks[1], f, g3, () => {                   // just hard enough: the hero on the glowing path
      b.rect(120, 0, 140, H, P0);
      for (let x = 124; x < 252; x++) { const yc = 150 - (x - 124) * 0.8; for (let d = -10; d <= 10; d++) b.set(x, Math.round(yc + d), Math.abs(d) >= 9 ? K0 : (Math.floor(x / 6) + Math.floor((yc + d) / 6)) % 2 ? P0 : P1); }
      for (let x = 124; x < 252; x += 3) if ((x + (f - g3) * 2) % 18 < 6) b.set(x, Math.round(150 - (x - 124) * 0.8), Y);
      hero(b, 186, 106, 2, f, { walk: true });
      tag(b, '刚刚好难', 188, 140, Y, K0, 'center');
    });
    return;
  }
  // homework turned into levels
  homeworkDesk(b);
  b.rect(30, 14, 324, 150, P0); outlinePoly(b, [[29, 13], [354, 13], [354, 164], [29, 164]], K0, 2);
  const nodes: [number, number, string, string][] = [[70, 128, '1', '背10个公式'], [140, 96, '2', '做5道基础题'], [214, 116, '3', '错题重做'], [300, 84, 'B', '整套卷子']];
  const k4 = f - g4, path = Math.min(1, k4 / 20);
  for (let i = 0; i < 3; i++) { const [x0, y0] = nodes[i], [x1, y1] = nodes[i + 1]; const u = Math.min(1, Math.max(0, path * 3 - i)); for (let s = 0; s < u; s += 0.02) { const x = x0 + (x1 - x0) * s, y = y0 + (y1 - y0) * s; if (Math.floor(s * 50) % 2 === 0) b.rect(x - 1, y - 1, 3, 3, K3); } }
  nodes.forEach(([x, y, n, lab], i) => {
    const at = g4 + 6 + i * 5; if (f < at) return;
    const boss = n === 'B', r0 = boss ? 16 : 12, done = i === 0 && f >= g6 + 6;
    b.disc(x, y, r0 + 1, K0); b.disc(x, y, r0, done ? G1 : boss ? R : Y);
    if (done) { b.line(x - 6, y, x - 2, y + 4, P0, 2); b.line(x - 2, y + 4, x + 6, y - 5, P0, 2); }
    else b.text(boss ? 'BOSS' : `LV${n}`, x, y - 6, 1, boss ? P0 : K0, 'center');
    const lt = cf('G5') + i * 14; if (f >= lt) tag(b, lab, x, y + r0 + 4, P0, K0, 'center');
  });
  if (f >= g6) { const k = f - g6; dmg(b, '+50 XP', 70, 92, k - 6, Y, 1); box(b, 40, 22, 128, 24); b.text('EXP', 46, 28, 1, P1); bars(b, 76, 30, 84, Math.min(0.5, Math.max(0, (k - 6) / 30)), Y, 6); }
  if (f >= g7) {                                               // pick problems you'd miss 1–2 in 10
    const k = f - g7;
    box(b, 190, 18, 156, 40); b.text('正确率', 198, 23, 1, P1);
    const bx = 240, bw = 98; b.rect(bx, 26, bw, 8, K2); b.rect(bx + Math.round(bw * 0.8), 26, Math.round(bw * 0.1), 8, G1);
    const px = bx + Math.round(bw * ip(k, 0, 18, 0.5, 0.85, oc)); b.poly([[px - 3, 40], [px + 3, 40], [px, 35]], Y); b.text('85%', px, 41, 1, Y, 'center');
  }
};

/* ================= the last question + end card ================= */
export const sceneQ = (b: Buf, f: number) => {
  sceneGame(b, 70);
  for (let i = 0; i < b.d.length; i++) { const c = b.d[i]; const r = (c & 255) >> 1, g = ((c >> 8) & 255) >> 1, bl = ((c >> 16) & 255) >> 1; b.d[i] = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0; }
};
const SOURCES = ['Wilson et al. 2019 · Nat Commun', 'Csikszentmihalyi & LeFevre 1989 · JPSP', 'Nakamura & Csikszentmihalyi 2002', 'Kubey & Csikszentmihalyi 2002 · Sci Am'];
export const endCard = (b: Buf, f: number, at: number) => {
  const k = f - at;
  b.rect(0, 0, W, H, P0);
  for (let y = 0; y < 60; y++) b.dither(0, y, W, 1, P1, 0.4 * (1 - y / 60));
  if (k >= 0) { b.text('心流', 192, 28 - (k < 2 ? 3 : 0), 5, K0, 'center'); }
  if (k >= 6) { const e = k < 8 ? 2 : 0; b.rect(258 - e, 40 - e, 26 + 2 * e, 16 + 2 * e, R); b.text('flow', 271, 41, 1, P0, 'center'); }
  if (k >= 12) b.text('你最近一次忘了时间，是在做什么？', 192, 96, 1, K0, 'center');
  if (k >= 16) b.text('@ 那个总说"学不进去"的朋友', 192, 114, 1, K3, 'center');
  if (k >= 20) { const t = '关注 Juno · 每期一个反直觉的知识', w = glyph(t).w + 20; box(b, 192 - w / 2, 140, w, 22); b.text(t, 192, 145, 1, Y, 'center'); }
  if (k >= 24) SOURCES.forEach((s, i) => b.text(s, 192, 166 + i * 12, 1, K3, 'center'));
};

/* ================= captions: an RPG box at the bottom, typed at the voice's pace ================= */
const HIDE = new Set(['B1', 'T1']);
const TOP = new Set(['B2', 'B3', 'B4', 'B5']);
const wrap = (t: string) => {
  if (glyph(t).w <= 330) return [t];
  const ch = [...t], mid = ch.length / 2; let best = -1, bd = 1e9;
  ch.forEach((c, i) => { if ('，、：；——'.includes(c) && Math.abs(i - mid) < bd && i < ch.length - 2) { best = i; bd = Math.abs(i - mid); } });
  if (best < 0) best = Math.floor(mid) - 1;
  return [ch.slice(0, best + 1).join(''), ch.slice(best + 1).join('')];
};
export const captions = (b: Buf, f: number) => {
  for (let i = 0; i < SEGS.length; i++) {
    const s = SEGS[i], a = Math.round(s.t0 * 30), z = Math.round(s.t1 * 30), nx = SEGS[i + 1] ? Math.round(SEGS[i + 1].t0 * 30) : 1e9;
    const until = nx - z < 24 ? nx : z + 10;
    if (f < a - 1 || f >= until || HIDE.has(s.id)) continue;
    const big = s.id === 'G8';
    const txt = s.caption.replace(/[；，：]$/, '');
    const lines = big ? ['你最近一次忘了时间，', '是在做什么？'] : wrap(txt);
    const n = [...txt].length, rate = (n / Math.max(6, z - a)) * 1.25;
    const sc = big ? 2 : 1, lh = 12 * sc + 3, pad = 6;
    const w = Math.max(...lines.map((l) => glyph(l).w * sc)) + pad * 2 + 4, h = lines.length * lh + pad * 2 - 1;
    const x = TOP.has(s.id) ? 18 : Math.round(192 - w / 2), y = TOP.has(s.id) ? 18 : big ? Math.round(108 - h / 2) : 206 - h;
    // reuse the dialog look: border, typing, blinking cursor
    const k = f - a + 1, open = Math.min(1, k / 3), hh = Math.max(4, Math.round(h * open)), yy = y + Math.round((h - hh) / 2);
    b.rect(x - 1, yy - 1, w + 2, hh + 2, K0);
    b.rect(x + 1, yy + 1, w - 2, 1, P0); b.rect(x + 1, yy + hh - 2, w - 2, 1, P0); b.rect(x + 1, yy + 1, 1, hh - 2, P0); b.rect(x + w - 2, yy + 1, 1, hh - 2, P0);
    if (open < 1) continue;
    let budget = Math.floor((f - a) * rate) + 1;
    lines.forEach((l, j) => { const ch = [...l]; const m = Math.max(0, Math.min(ch.length, budget)); budget -= ch.length; if (m > 0) b.text(ch.slice(0, m).join(''), x + pad + 2, y + pad + 1 + j * lh, sc, P0); });
    if (budget >= 0 && Math.floor(f / 8) % 2 === 0) { const cx = x + w - 10, cy = y + h - 8; b.rect(cx, cy, 5, 1, R); b.rect(cx + 1, cy + 1, 3, 1, R); b.rect(cx + 2, cy + 2, 1, 1, R); }
  }
};
export { SKC, SHW, WD, G2, ic, Easing, sceneHW };
