/* Motion test C for 《0.1秒》: documentary look in the Vibe知识大赏 style.
   Overhead shot of a case desk under a warm lamp: two prints land on the 0.402 s hit (A / B), "你的钱包，敢交给谁？";
   the camera leans in; cut to a dark lab where a slide projector flashes a face on a screen for 3 frames (0.1 s);
   0.1秒 slams in on the 8.505 s hit. Film grain, gate weave and a warm grade throughout. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, Canvas, clamp, lerp, eo, eio, pr, hit, rnd, glowDot } from './kit';
import { sparks } from './lightkit';

export const MT3_FRAMES = Math.round(10.6 * 30);
const H1 = 0.402, H2 = 8.505, CUT = 5.6;
const LINES: [number, number, string][] = [
  [0.5, 3.1, '你的钱包，敢交给谁？'],
  [3.2, 5.5, '你一眼就选好了，对吧？'],
  [5.75, 8.4, '2006年，普林斯顿：判断一张脸，要多久？'],
  [H2 + 0.05, 10.6, '答案是：[0.1秒]'],
];
type G = CanvasRenderingContext2D;

/** overhead desk: dark walnut planks, a warm lamp pool from the upper left, a folder and a pen at the edges */
const desk = (g: G, T: number) => {
  g.fillStyle = '#140d09'; g.fillRect(0, 0, 1920, 1080);
  for (let i = 0; i < 9; i++) {
    const y = i * 132 - 20, c = 18 + 6 * rnd(i, 2);
    g.fillStyle = `rgb(${c + 14},${c + 4},${c - 4})`; g.fillRect(0, y, 1920, 130);
    g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(1920, y); g.stroke();
    g.strokeStyle = 'rgba(255,200,150,.035)'; g.lineWidth = 1.2;
    for (let k = 0; k < 14; k++) { const yy = y + 8 + k * 9 + 3 * rnd(i, k); g.beginPath(); g.moveTo(0, yy); for (let x = 0; x <= 1920; x += 120) g.lineTo(x, yy + Math.sin(x * 0.004 + k + i) * 3); g.stroke(); }
  }
  // lamp pool
  g.save(); g.globalCompositeOperation = 'lighter';
  const p = g.createRadialGradient(760, 380, 40, 860, 480, 1000); p.addColorStop(0, 'rgba(255,190,120,.30)'); p.addColorStop(0.5, 'rgba(255,170,100,.10)'); p.addColorStop(1, 'rgba(255,160,90,0)');
  g.fillStyle = p; g.fillRect(0, 0, 1920, 1080); g.restore();
  // a manila case folder under everything, and a pen
  g.save(); g.translate(980, 560); g.rotate(-0.03);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(-640, -330, 1300, 690);
  const f = g.createLinearGradient(0, -340, 0, 340); f.addColorStop(0, '#b89a68'); f.addColorStop(1, '#8c7148');
  g.fillStyle = f; g.fillRect(-650, -345, 1300, 690);
  g.fillStyle = '#a88a58'; g.fillRect(-650, -385, 360, 50);
  g.fillStyle = 'rgba(60,40,20,.75)'; g.font = '700 30px "JunoMono"'; g.textAlign = 'left'; g.fillText('CASE 0.1 s', -620, -350);
  g.strokeStyle = 'rgba(80,50,20,.25)'; g.lineWidth = 2; for (let y = -280; y < 320; y += 46) { g.beginPath(); g.moveTo(-600, y); g.lineTo(600, y); g.stroke(); }
  g.restore();
  g.save(); g.translate(1650, 860); g.rotate(-0.5); g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(-150, -6, 300, 22); g.fillStyle = '#1b1a1e'; g.fillRect(-160, -14, 300, 22); g.fillStyle = '#c9a25e'; g.fillRect(110, -14, 30, 22); g.restore();
};

/** the dark lab: a screen on the left, a slide projector on the right whose shutter opens only for the exposure */
const lab = (g: G, T: number, flash: number) => {
  const wall = g.createLinearGradient(0, 0, 0, 1080); wall.addColorStop(0, '#0b0b10'); wall.addColorStop(1, '#040406'); g.fillStyle = wall; g.fillRect(0, 0, 1920, 1080);
  // the screen, barely visible in the dark until the shutter opens
  g.fillStyle = `rgba(230,226,214,${0.035 + 0.3 * flash})`; g.fillRect(230, 180, 800, 600);
  g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 3; g.strokeRect(230, 180, 800, 600);
  g.fillStyle = '#09090c'; g.fillRect(222, 168, 816, 14);
  const bx = 1600, by = 640;
  g.save(); g.globalCompositeOperation = 'lighter';
  if (flash > 0) {
    const bm = g.createLinearGradient(bx, by, 630, 480); bm.addColorStop(0, 'rgba(255,236,200,.55)'); bm.addColorStop(1, 'rgba(255,236,200,.10)');
    g.fillStyle = bm; g.beginPath(); g.moveTo(bx - 40, by - 14); g.lineTo(230, 180); g.lineTo(230, 780); g.lineTo(bx - 40, by + 14); g.closePath(); g.fill();
    glowDot(g, bx - 40, by, 260, 0.9, '255,230,190');
  } else glowDot(g, bx - 40, by, 40, 0.25 + 0.1 * Math.sin(T * 3), '255,200,140');
  // dust always hangs in the room, lit faintly
  for (let i = 0; i < 120; i++) { const q = (rnd(i, 3) + T * 0.015 * (0.5 + rnd(i, 4))) % 1, x = lerp(bx, 230, q), spread = lerp(14, 300, q), y = lerp(by, 480, q) + (rnd(i, 5) - 0.5) * 2 * spread; glowDot(g, x, y, 3 + 3 * rnd(i, 6), (0.05 + 0.3 * flash) * rnd(i, 7), '255,236,200'); }
  g.restore();
  // the projector: body, lens barrel, a rim of warm light
  const body = g.createLinearGradient(bx, by - 90, bx, by + 90); body.addColorStop(0, '#2a2a30'); body.addColorStop(1, '#0c0c0f');
  g.fillStyle = body; g.beginPath(); (g as any).roundRect(bx, by - 90, 240, 180, 14); g.fill();
  g.fillStyle = '#18181d'; g.beginPath(); (g as any).roundRect(bx - 60, by - 34, 70, 68, 8); g.fill();
  g.fillStyle = '#050506'; g.beginPath(); g.arc(bx - 60, by, 30, 0, 6.3); g.fill();
  g.strokeStyle = 'rgba(255,214,170,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(bx - 60, by, 30, 0, 6.3); g.stroke();
  g.strokeStyle = 'rgba(255,214,170,.22)'; g.beginPath(); (g as any).roundRect(bx, by - 90, 240, 180, 14); g.stroke();
  for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(bx + 120 + k * 16, by - 60, 6, 120); }
  g.fillStyle = 'rgba(255,214,170,.3)'; g.font = '700 22px "JunoMono"'; g.fillText('TACHISTOSCOPE', bx + 18, by + 124);
};

const Print: React.FC<{ src: string; x: number; y: number; rot: number; tag: string; land: number; t: number; o?: number }> = ({ src, x, y, rot, tag, land, t, o = 1 }) => {
  if (t < land) return null;
  const k = eo(t, land, 0.22), drop = lerp(1.12, 1, k);
  return (
    <div style={{ position: 'absolute', left: x - 230, top: y - 300, width: 460, height: 600, opacity: k * o, transform: `rotate(${rot}deg) scale(${drop})`, background: '#eee6d6', padding: '20px 20px 70px', boxShadow: `0 ${lerp(40, 14, k)}px ${lerp(60, 28, k)}px rgba(0,0,0,.65)` }}>
      <Img src={staticFile(src)} style={{ width: 420, height: 510, objectFit: 'cover', objectPosition: '50% 30%', filter: 'sepia(.18) contrast(1.05) saturate(.9)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center', fontFamily: F.serif, fontWeight: 900, fontSize: 52, color: '#2a2016' }}>{tag}</div>
      <div style={{ position: 'absolute', left: 190, top: -14, width: 80, height: 34, background: 'linear-gradient(180deg,#d7d2c4,#a9a493)', borderRadius: 6, opacity: 0.9 }} />
    </div>
  );
};

export const MotionTest3: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / 30;
  const [h] = useState(() => delayRender('mt3', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '你的钱包敢交给谁一眼就选好了对吧年普林斯顿的心理学家想知道要多快答案是秒0123456789.'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const inLab = t >= CUT;
  // the lab: two flashes of exactly 3 frames, the second right before the slam
  const f1 = Math.round(7.0 * 30), f2 = Math.round(7.9 * 30);
  const flashOn = (fr >= f1 && fr < f1 + 3) || (fr >= f2 && fr < f2 + 3);
  const camS = 1 + 0.05 * eio(t, 0, 5.6) + 0.06 * eio(t, 3.2, 2.4);
  const weave = Math.sin(t * 23) * 0.6 + Math.sin(t * 7.3) * 0.4;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          {!inLab && (
            <AbsoluteFill style={{ transform: `translate(${weave}px,${weave * 0.6}px) scale(${camS})`, transformOrigin: '48% 48%' }}>
              <Canvas dep={0} draw={(g) => desk(g, 0)} />
              <Print src="faces/m30_cold.webp" x={660} y={520} rot={-4} tag="A" land={H1} t={t} />
              <Print src="faces/m30_kind.webp" x={1280} y={540} rot={3} tag="B" land={H1 + 0.06} t={t} />
            </AbsoluteFill>
          )}
          {inLab && (
            <AbsoluteFill style={{ transform: `translate(${weave}px,0) scale(${1 + 0.03 * pr(t, CUT, 3)})` }}>
              <Canvas dep={fr} draw={(g) => lab(g, t, flashOn ? 1 : 0)} />
              {flashOn && <Img src={staticFile('faces/m30.webp')} style={{ position: 'absolute', left: 230, top: 180, width: 800, height: 600, objectFit: 'cover', objectPosition: '50% 32%', opacity: 0.9, filter: 'sepia(.3) contrast(1.15) brightness(1.1)' }} />}
              <div style={{ position: 'absolute', left: 120, top: 136, opacity: eo(t, CUT + 0.2, 0.3), fontFamily: F.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(239,232,218,.85)' }}>PRINCETON · 2006</div>
              {t >= f1 / 30 && t < H2 && <div style={{ position: 'absolute', left: 1390, top: 760, fontFamily: F.mono, fontWeight: 700, fontSize: 56, color: C.goldHi, opacity: 0.9 }}>100 ms</div>}
              {t >= H2 && (
                <>
                  <Canvas dep={fr} draw={(g) => { g.save(); g.globalCompositeOperation = 'lighter'; sparks(g, 960, 470, H2, t, 200, '255,214,140', 3, 7); g.restore(); }} />
                  <div style={{ position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', opacity: eo(t, H2, 0.18), transform: `scale(${lerp(1.4, 1, eo(t, H2, 0.22))})`, fontFamily: F.serif, fontWeight: 900, fontSize: 230, lineHeight: 1,
                    background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 55%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 40px rgba(0,0,0,.9))', fontVariantNumeric: 'lining-nums' }}>0.1秒</div>
                </>
              )}
            </AbsoluteFill>
          )}
          <Grade warm={0.08} />
          <Grain T={t} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.1 * hit(t, H1, 0.08) + 0.25 * hit(t, H2, 0.08) + 0.15 * hit(t, CUT, 0.06), mixBlendMode: 'screen' }} />
          <Bars />
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>
          <Subs T={t} lines={LINES as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
