import { Buf, K0, K1, K2, K3, SKW, SHW, WD, BR, O, P0, P1, R, Y, C, G1, G2, R2, glyph, rnd } from './core';

/** draw a sprite given as rows of palette letters ('.' = transparent); x,y = top-left; s = pixel scale */
export const spr = (b: Buf, rows: string[], x: number, y: number, s: number, pal: Record<string, number>, flip = false) => {
  const w = rows[0].length;
  for (let j = 0; j < rows.length; j++) for (let i = 0; i < w; i++) {
    const ch = rows[j][flip ? w - 1 - i : i]; if (ch === '.' || ch === ' ') continue;
    const c = pal[ch]; if (c === undefined) continue;
    b.rect(Math.round(x) + i * s, Math.round(y) + j * s, s, s, c);
  }
};
const HERO_TOP = [
  '....KKKK....',
  '...KKKKKKK..',
  '..KKSSSSKK..',
  '..KSSSKSSE..',
  '..KSSSSSS...',
  '...SSSSS....',
  '...RRRRRR...',
  '..RRRRRRRS..',
  '..SRRRRRR...',
  '...RRRRRR...',
];
const LEGS = [
  ['...NN..NN...', '...NN..NN...', '..KKK..KKK..'],
  ['...NN.NN....', '..NN...NN...', '..KK...KKK..'],
];
export const HERO_PAL = { K: K0, S: SKW, E: K0, R: R, N: K2 };
/** the game hero, 12×13 cells; (x,y) = feet centre; walk = animate legs */
export const hero = (b: Buf, x: number, y: number, s: number, f: number, o: { walk?: boolean; flip?: boolean; sweat?: boolean; yawn?: boolean; arm?: boolean } = {}) => {
  const legs = LEGS[o.walk ? Math.floor(f / 4) % 2 : 0];
  const rows = [...HERO_TOP, ...legs];
  const x0 = x - 6 * s, y0 = y - rows.length * s;
  spr(b, rows, x0, y0, s, HERO_PAL, o.flip);
  if (o.arm) { const hx = o.flip ? x0 - 2 * s : x0 + 10 * s; b.rect(hx, y0 + 6 * s, 3 * s, s, SKW); }
  if (o.sweat) { const sx = o.flip ? x0 - s : x0 + 11 * s; b.rect(sx, y0 + 2 * s + (Math.floor(f / 4) % 3) * s, s, 2 * s, C); }
  if (o.yawn) { const mx = o.flip ? x0 + 3 * s : x0 + 7 * s; b.rect(mx, y0 + 4 * s, 2 * s, 2 * s, K0); for (let k = 0; k < 3; k++) { const z = (f / 6 + k * 3) % 9; if (z < 7) b.text('z', x0 + 12 * s + k * 4, y0 - 2 - z * 2, 1, K3); } }
};

/** a 12 px label in a small box */
export const tag = (b: Buf, t: string, x: number, y: number, fg = P0, bg = K0, align: 'left' | 'center' | 'right' = 'left') => {
  const w = glyph(t).w + 8, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  b.rect(x0, y, w, 15, bg); b.text(t, x0 + 4, y + 2, 1, fg);
  return w;
};
/** a framed plaque with red ends (the 学得最快的正确率 look) opening from the centre; k = frames since start */
export const plaque = (b: Buf, t: string, cx: number, y: number, k: number, sc = 2) => {
  if (k < 0) return;
  const pw = glyph(t).w * sc + 36, ph = 12 * sc + 8;
  const w = Math.round((pw * Math.min(1, (k + 1) / 4)) / 2) * 2, x = Math.round(cx - w / 2);
  b.rect(x - 2, y - 2, w + 4, ph + 4, P0); b.rect(x, y, w, ph, K0);
  b.rect(x + 2, y + 2, w - 4, 1, P0); b.rect(x + 2, y + ph - 3, w - 4, 1, P0);
  b.rect(x, y, 5, ph, R); b.rect(x + w - 5, y, 5, ph, R);
  if (k >= 3) b.text(t, cx, y + 4, sc, k === 3 || k === 4 ? Y : P0, 'center');
};
/** RPG box (no typing), centred text lines */
export const box = (b: Buf, x: number, y: number, w: number, h: number) => {
  b.rect(x - 1, y - 1, w + 2, h + 2, K0); b.rect(x, y, w, h, K0);
  b.rect(x + 1, y + 1, w - 2, 1, P0); b.rect(x + 1, y + h - 2, w - 2, 1, P0); b.rect(x + 1, y + 1, 1, h - 2, P0); b.rect(x + w - 2, y + 1, 1, h - 2, P0);
};
/** sparkle (+ shape) of size e */
export const spark = (b: Buf, x: number, y: number, e: number, c = Y) => { b.rect(x - e, y, 2 * e + 1, 1, c); b.rect(x, y - e, 1, 2 * e + 1, c); b.set(x, y, P0); };

/* ---- the catch device: an original glowing capture cube (8×8 cells) ---- */
const CUBE = [
  '.KKKKKK.',
  'KCCCCCCK',
  'KCCYYCCK',
  'KCYYYYCK',
  'KKKKKKKK',
  'KPPPPPPK',
  'KPPPPPPK',
  '.KKKKKK.',
];
export const cube = (b: Buf, x: number, y: number, s: number, tilt = 0) => {
  // tilt: -1 / 0 / 1 → shear the top half sideways for the wobble
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const ch = CUBE[j][i]; if (ch === '.') continue;
    const dx = j < 4 ? tilt * s : 0;
    b.rect(Math.round(x) + i * s + dx, Math.round(y) + j * s, s, s, ({ K: K0, C: C, Y: Y, P: P0 } as Record<string, number>)[ch]);
  }
};

/* ---- homework creatures (original): exam-paper demon, a 1+1 slip, a mistakes notebook ---- */
export const examDemon = (b: Buf, cx: number, by: number, f: number, flash = false) => {
  const w = 120, h = 128, x = cx - w / 2, y = by - h;
  const shake = Math.floor(f / 3) % 2;
  // horns: folded paper corners
  b.poly([[x + 8, y + 18], [x + 22, y - 18], [x + 36, y + 18]], flash ? P0 : P1); b.poly([[x + w - 36, y + 18], [x + w - 22, y - 18], [x + w - 8, y + 18]], flash ? P0 : P1);
  b.rect(x - 2, y - 2, w + 4, h + 4, K0); b.rect(x, y, w, h, flash ? P0 : P0);
  for (let k = 0; k < 9; k++) b.rect(x + 10, y + 52 + k * 8, w - 20 - (k % 3) * 14, 2, flash ? P0 : P1);
  b.text('期末', x + 10, y + 6, 1, K3);
  // red score circle with a big question mark
  b.disc(x + w - 24, y + 22, 12, R); b.disc(x + w - 24, y + 22, 10, P0); b.text('?', x + w - 27, y + 16, 1, R);
  // eyes and teeth
  for (const sx of [-1, 1]) { const ex = cx + sx * 24, ey = y + 34 + shake; b.poly([[ex - 12, ey - 6 - sx * 0], [ex + 12, ey - 6], [ex + 12 * -sx, ey - 12]], K0); b.rect(ex - 9, ey - 4, 18, 10, K0); b.rect(ex - 3 + sx * 2, ey - 1, 6, 5, R); }
  b.rect(cx - 30, y + 54 + shake, 60, 14, K0);
  for (let k = 0; k < 6; k++) b.poly([[cx - 28 + k * 10, y + 54 + shake], [cx - 20 + k * 10, y + 54 + shake], [cx - 24 + k * 10, y + 62 + shake]], P0);
  // arms with a giant red pen
  b.line(x - 2, y + 80, x - 24, y + 60 - shake * 2, K0, 4); b.line(x + w + 2, y + 80, x + w + 22, y + 50 + shake * 2, K0, 4);
  b.line(x + w + 22, y + 50 + shake * 2, x + w + 30, y + 16 + shake * 2, R, 5); b.rect(x + w + 28, y + 12 + shake * 2, 5, 5, K0);
};
export const slip = (b: Buf, cx: number, by: number, f: number) => {
  const w = 26, h = 14, x = cx - w / 2, y = by - h - (Math.floor(f / 10) % 2);
  b.rect(x - 1, y - 1, w + 2, h + 2, K0); b.rect(x, y, w, h, P0);
  b.text('1+1', x + 3, y + 1, 1, K3);
  b.line(x + 6, y + h - 4, x + 9, y + h - 4, K0); b.line(x + 16, y + h - 4, x + 19, y + h - 4, K0);   // sleepy eyes
};
export const notebook = (b: Buf, cx: number, by: number, f: number) => {
  const w = 48, h = 56, bob = Math.floor(f / 8) % 2, x = cx - w / 2, y = by - h - bob;
  b.rect(x - 2, y - 2, w + 4, h + 4, K0); b.rect(x, y, w, h, O); b.rect(x, y, 6, h, WD);
  b.rect(x + 10, y + 6, w - 16, 16, P0); b.text('错题本', x + 11, y + 8, 1, K0);
  for (const sx of [-1, 1]) { const ex = cx + 3 + sx * 9, ey = y + 32; b.rect(ex - 4, ey - 3, 8, 7, P0); b.rect(ex - 1, ey - 1, 3, 4, K0); b.line(ex - 4, ey - 6, ex + 4, ey - 6 + sx, K0); }
  b.rect(cx - 1, y + 44, 9, 2, K0);
  b.line(x - 2, y + 34, x - 10, y + 28 + bob * 2, K0, 2); b.line(x + w + 2, y + 34, x + w + 10, y + 28 - bob * 2, K0, 2);
};
/** a generic slime enemy (feedback battle) */
const SLIME = ['...CCCC...', '..CCCCCC..', '.CCKCCKCC.', '.CCCCCCCC.', 'CCCCCCCCCC', 'CCCCCCCCCC', '.CCCCCCCC.'];
export const slime = (b: Buf, cx: number, by: number, s: number, f: number, hit = false) => {
  const sq = Math.floor(f / 6) % 2;
  spr(b, sq ? SLIME : ['..........', ...SLIME.slice(0, 6)], cx - 5 * s, by - 7 * s, s, { C: hit ? P0 : C, K: K0 });
};
/** pixel tree / bush tiles for the overworld */
export const tree = (b: Buf, x: number, by: number) => { b.rect(x - 2, by - 10, 4, 10, WD); b.disc(x, by - 16, 9, G2); b.disc(x - 3, by - 19, 5, G1); };
export const castle = (b: Buf, x: number, by: number) => {
  b.rect(x, by - 40, 46, 40, K3); for (let k = 0; k < 6; k++) b.rect(x + k * 8, by - 46, 5, 6, K3);
  b.rect(x + 16, by - 18, 14, 18, K0); b.rect(x - 8, by - 56, 14, 56, K2); b.poly([[x - 10, by - 56], [x - 1, by - 70], [x + 8, by - 56]], R2);
  b.rect(x + 40, by - 60, 14, 60, K2); b.poly([[x + 38, by - 60], [x + 47, by - 74], [x + 56, by - 74 + 14]], R2);
};
/** a sky + grass overworld; scroll = horizontal offset in px */
export const overworld = (b: Buf, scroll: number, groundY = 140) => {
  b.rect(0, 0, 384, groundY, C);
  for (let y = 0; y < groundY; y++) if (y < 70) b.dither(0, y, 384, 1, P0, 0.25 * (1 - y / 70));
  for (let k = 0; k < 4; k++) { const cx = ((k * 120 - scroll * 0.3) % 480 + 480) % 480 - 48, cy = 24 + (k % 2) * 18; b.ellipse(cx, cy, 22, 7, P0); b.ellipse(cx + 12, cy - 4, 12, 6, P0); }
  for (let k = 0; k < 6; k++) { const hx = ((k * 90 - scroll * 0.5) % 540 + 540) % 540 - 80; b.ellipse(hx, groundY + 4, 70, 26, G2); }
  b.rect(0, groundY, 384, 216 - groundY, G1);
  for (let x = 0; x < 384; x++) { const t = (x + Math.floor(scroll)) % 16; if (t < 2) b.set(x, groundY, G2); }
  for (let y = groundY + 6; y < 216; y += 7) for (let x = 0; x < 384; x += 16) { const xx = ((x + (y % 14 ? 8 : 0) - Math.floor(scroll)) % 384 + 384) % 384; b.rect(xx, y, 3, 1, G2); }
};
/** a damage number that floats up and fades in steps */
export const dmg = (b: Buf, t: string, x: number, y: number, k: number, c = Y, s = 2) => { if (k < 0 || k > 26) return; b.text(t, x, y - Math.min(14, k), s, c, 'center', K0); };
export const bars = (b: Buf, x: number, y: number, w: number, p: number, c: number, h = 6) => { b.rect(x - 1, y - 1, w + 2, h + 2, K0); b.rect(x, y, w, h, K2); b.rect(x, y, Math.round(w * p), h, c); b.rect(x, y, Math.round(w * p), 1, P0); };

/* ---- people ---- */
/** tiny office worker, 7×11 cells at scale 1 */
export const worker = (b: Buf, x: number, y: number, seed: number, beep = false) => {
  const hair = [K0, BR, K1][Math.floor(rnd(seed) * 3)], shirt = [K3, C, P1, O][Math.floor(rnd(seed + 1) * 4)];
  b.rect(x + 2, y, 3, 1, hair); b.rect(x + 1, y + 1, 5, 3, SKW); b.rect(x + 1, y + 1, 5, 1, hair);
  b.rect(x, y + 4, 7, 5, shirt); b.rect(x + 1, y + 9, 2, 2, K2); b.rect(x + 4, y + 9, 2, 2, K2);
  b.rect(x + 5, y + 6, 2, 2, K0);                       // pager on the belt
  if (beep) { b.rect(x + 5, y + 6, 2, 2, Y); b.rect(x + 3, y - 5, 1, 3, Y); b.set(x + 3, y - 1, Y); }
};
export const SHW_ = SHW;
