import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Easing, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { Buf, W, H, S, FAM, K0, P0, ip, ioc, rnd, bay, vnoise } from './core';
import { OT, intro, page2, page3, CX, CY } from './open';
import { cf, sceneC, sceneD, sceneE, sceneF, sceneG, sceneQ, endCard, captions } from './body';
import TL from './tl.json';

/* 《心流》pixel film (~2 min, voiced by the owner from our SRT). Opening = the approved pixel teaser;
   then: the interviews → three things games get right (with the catch battles) → challenge × skill map
   → the pager study (on the second drop) → the ending → last question → end card. */
const FPS = 30;
export const PXF_FRAMES = Math.round(TL.film_end * FPS);
const HIT = Math.round(TL.hit * FPS);
Object.assign(OT, { TURN: 258, P2: 270, RISE: HIT - 56, HIT, LINE: HIT + 14, BLEED: cf('T1') - 58, BLEED_END: cf('T1') + 8 });
const C0 = cf('C1') - 6, D0 = cf('D1') - 8, E0 = cf('E1') - 8, F0 = Math.round(TL.drop2 * FPS), G0 = cf('G1') - 8, Q0 = cf('G8') - 6, END0 = Math.round(TL.vo_end * FPS) + 24;
OT.OUT = C0;
const WIPE = 12;

const bufs = [new Buf(), new Buf()];
const scene = (b: Buf, f: number) => {
  if (f < C0) { if (f < OT.BLEED_END + 2) page2(b, f, false); else page3(b, f); return; }
  if (f < D0) return sceneC(b, f);
  if (f < E0) return sceneD(b, f);
  if (f < F0) return sceneE(b, f);
  if (f < G0) return sceneF(b, f);
  if (f < Q0) return sceneG(b, f);
  if (f < END0) return sceneQ(b, f);
  return endCard(b, f, END0);
};
/** 8 px block wipe from right to left (the pixel page turn) */
const blockWipe = (A: Buf, B: Buf, tt: number) => {
  for (let cy = 0; cy < 27; cy++) for (let cx = 0; cx < 48; cx++) {
    const thr = (47 - cx + cy * 0.5) / (47 + 13), mode = tt > thr ? 1 : tt > thr - 0.04 ? 2 : 0;
    if (!mode) continue;
    for (let y = cy * 8; y < cy * 8 + 8; y++) for (let x = cx * 8; x < cx * 8 + 8; x++) A.d[y * W + x] = mode === 1 ? B.d[y * W + x] : K0;
  }
};
const compose = (f: number): Uint32Array => {
  const [A, B] = bufs;
  const impact = f >= OT.HIT && f < OT.HIT + 3;
  if (f < OT.TURN) {
    intro(A, f);
    if (f < 6) { const hh = [0, 1, 4, 16, 44, 80][f]; for (let y = 0; y < H; y++) { const d = Math.abs(y - 108); for (let x = 0; x < W; x++) if (d > hh) A.d[y * W + x] = K0; else if (f < 3 || d >= hh - 1) A.d[y * W + x] = P0; } }
    return A.d;
  }
  if (f < OT.P2) { intro(A, f); page2(B, f, false); blockWipe(A, B, ip(f, OT.TURN, OT.P2, 0, 1, ioc)); }
  else if (impact) {
    page2(A, f, true);
    for (let i = 0; i < A.d.length; i++) A.d[i] = (A.d[i] & 0xff000000) | (~A.d[i] & 0x00ffffff);
    for (let i = 0; i < 30; i++) {
      const k = i * 13 + (f - OT.HIT) * 101, ang = ((i + 0.5) / 30) * Math.PI * 2 + (rnd(k) - 0.5) * 0.22, rr = 60 + rnd(k + 1) * 44, hw = (7 + rnd(k + 2) * 16) / 1300;
      A.poly([[CX + Math.cos(ang) * rr, CY + Math.sin(ang) * rr], [CX + Math.cos(ang - hw) * 300, CY + Math.sin(ang - hw) * 300], [CX + Math.cos(ang + hw) * 300, CY + Math.sin(ang + hw) * 300]], i % 4 === 0 ? K0 : P0);
    }
    return A.d;
  } else if (f >= OT.BLEED && f < OT.BLEED_END + 2) {
    page2(A, f, false); page3(B, f);
    const Rr = ip(f, OT.BLEED, OT.BLEED_END - 4, 0, 340, Easing.out(Easing.quad));
    if (Rr > 0.5) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const v = Math.hypot(x - CX, y - 112) / Rr + (bay(x, y) / 16 - 0.5) * 0.18 + (vnoise(x / 22 + f * 0.03, y / 22) - 0.5) * 0.35;
      if (v < 1) A.d[y * W + x] = B.d[y * W + x];
    }
  } else {
    const cuts = [C0, D0, E0, G0];
    const w = cuts.find((c) => f >= c - WIPE && f < c);
    if (w !== undefined) { scene(A, w - WIPE - 1); scene(B, w); blockWipe(A, B, ip(f, w - WIPE, w - 1, 0, 1, ioc)); }
    else if (f >= END0 - 10 && f < END0) {                       // dither dissolve into the end card
      scene(A, END0 - 11); endCard(B, END0, END0); const t = (f - (END0 - 10)) / 10;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (bay(x, y) < t * 16) A.d[y * W + x] = B.d[y * W + x];
    } else scene(A, f);
  }
  captions(A, f);
  if (f >= F0 && f < F0 + 2) for (let i = 0; i < A.d.length; i++) A.d[i] = P0;   // flash on the second drop
  return A.d;
};

export const PixelFilm: React.FC = () => {
  const f = useCurrentFrame();
  const big = useRef<HTMLCanvasElement>(null);
  const low = useRef<HTMLCanvasElement | null>(null);
  const [handle] = useState(() => delayRender('pixel font'));
  const [ready, setReady] = useState(false);
  const released = useRef(false);
  useEffect(() => {
    const ff = new FontFace(FAM, `url(${staticFile('fonts/fusion-pixel.ttf')})`);
    ff.load().then((l) => { document.fonts.add(l); setReady(true); }).catch((e) => cancelRender(e));
  }, []);
  useLayoutEffect(() => {
    if (!ready || !big.current) return;
    if (!low.current) { low.current = document.createElement('canvas'); low.current.width = W; low.current.height = H; }
    const src = compose(f);
    const since = f - (OT.HIT + 3), env = since >= 0 ? 2.6 * Math.exp(-since / 2.4) : 0;
    const shx = Math.round(env * Math.sin(since * 3.7)), shy = Math.round(env * 0.7 * Math.sin(since * 5.1 + 0.9));
    const split = f >= OT.HIT && f < OT.HIT + 3, jy = (f - OT.HIT) % 2 === 0 ? 1 : -1;
    const lv = Math.ceil((1 - ip(f, PXF_FRAMES - 19, PXF_FRAMES - 1)) * 4) / 4;
    const lctx = low.current.getContext('2d')!;
    const img = lctx.createImageData(W, H); const o = new Uint32Array(img.data.buffer);
    const at = (x: number, y: number) => { x = Math.min(W - 1, Math.max(0, x)); y = Math.min(H - 1, Math.max(0, y)); return src[y * W + x]; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = x - shx, sy = y - shy;
      let c = sx < 0 || sy < 0 || sx >= W || sy >= H ? K0 : src[sy * W + sx];
      if (split) { const cr = at(x - 2, y - jy), cb = at(x + 2, y + jy); c = (c & 0xff00ff00) | (cr & 0xff) | (cb & 0xff0000); }
      if (lv < 1) { const r = Math.round((c & 255) * lv), g = Math.round(((c >> 8) & 255) * lv), bl = Math.round(((c >> 16) & 255) * lv); c = (0xff000000 | (bl << 16) | (g << 8) | r) >>> 0; }
      o[y * W + x] = c;
    }
    lctx.putImageData(img, 0, 0);
    const ctx = big.current.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(low.current, 0, 0, W * S, H * S);
    if (!released.current) { released.current = true; continueRender(handle); }
  }, [f, ready, handle]);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <canvas ref={big} width={W * S} height={H * S} style={{ width: W * S, height: H * S }} />
    </AbsoluteFill>
  );
};
