/* Motion test B, in the opening's own language (dark stage, the slot wheel, bold slammed type), channel track 29.3 → 35.3 s
   (hit at 32.806 = 3.506 s here): the wheel spins through the reasons people don't pick up and lands on 骚扰或诈骗 (63%);
   on the hit it is blown away and 36亿 slams in. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Bars, Subs, Canvas, glowDot, clamp, lerp, pr, eo, hit } from './kit';
import { sparks } from './lightkit';
import { stage, bokeh, spot, floorFade, W } from './hero';

export const MT2_FRAMES = 180;
const HIT = 32.806 - 29.3, B = 0.50625;
const MAG = '255,110,205';
type G = CanvasRenderingContext2D;
const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };

const REASONS = ['在忙', '不想被打扰', '想先知道是谁', '骚扰或诈骗'];
const SPIN_A = 0.15, SPIN_LAND = HIT - 4 * B;          // lands two bars before the hit, on a beat
const spin = (t: number) => { const q = clamp((t - SPIN_A) / (SPIN_LAND - SPIN_A)), e = 1 - Math.pow(1 - q, 3); return e * (REASONS.length - 1 + 2 * REASONS.length); };

const card = (g: G, x: number, y: number, text: string, a: number, hot = 0) => {
  const w = 640, h = 140;
  g.save(); g.globalAlpha *= a;
  const body = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); body.addColorStop(0, '#1d1b26'); body.addColorStop(1, '#0d0c13');
  g.fillStyle = body; g.beginPath(); (g as any).roundRect(x - w / 2, y - h / 2, w, h, 26); g.fill();
  g.strokeStyle = hot ? `rgba(${MAG},${0.6 + 0.4 * hot})` : 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = hot ? '#ffd0ec' : '#f3ede2'; g.font = '900 66px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + 2);
  g.restore();
};

const LINES: [number, number, string][] = [
  [0.15, 3.35, '不接电话的头号理由：怕是[骚扰或诈骗]'],
  [HIT + 0.05, 6.0, '2025年，全国拦截诈骗电话{36亿}次'],
];

export const MotionTest2: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / 30;
  const [h] = useState(() => delayRender('mt2-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '不接电话的头号理由怕是骚扰或诈骗在忙想被打扰先知道谁年全国拦截次亿0123456789%'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const after = t >= HIT, boom = hit(t, HIT, 0.35), land = t >= SPIN_LAND;
  const blow = after ? eo(t, HIT, 0.22) : 0;
  const pct = land ? Math.round(63 * eo(t, SPIN_LAND, 0.7)) : 0;
  const big = eo(t, HIT, 0.22), sub2 = eo(t, HIT + 2 * B, 0.25);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <AbsoluteFill style={{ background: '#030305' }}>
            <Canvas dep={fr} draw={(g) => {
              stage(g, t); bokeh(g, t, 24, 0.9 + 0.8 * boom);
              g.save(); const s = 1 + 0.035 * boom + 0.02 * pr(t, HIT, 2.5); g.translate(960, 560); g.scale(s, s); g.translate(-960, -560);
              spot(g, 960, 760, 0.5 + 0.2 * hit(t, SPIN_LAND, 0.6) + 0.4 * boom, after ? '255,214,235' : '235,228,255');
              // the wheel: spins, lands, then is blown apart by the hit (cards fly out and fade)
              if (blow < 1) {
                const p = spin(t), base = Math.floor(p), frac = p - base;
                g.save(); g.globalAlpha = 1 - blow; g.beginPath(); g.rect(0, 300, W, 460); g.clip();
                for (let j = -2; j <= 2; j++) {
                  const idx = ((base + j) % REASONS.length + REASONS.length) % REASONS.length;
                  const y = 530 + (j - frac) * 170 + (j === 0 ? -1 : j) * 520 * blow, near = 1 - Math.min(1, Math.abs(y - 530) / 260);
                  card(g, 960 - 120, y, REASONS[idx], eo(t, 0, 0.25) * (0.25 + 0.75 * near), land && j === 0 ? 1 : 0);
                }
                g.restore();
                const speed = clamp(1 - (t - SPIN_A) / (SPIN_LAND - SPIN_A));
                if (speed > 0.15 && !land) add(g, () => { g.fillStyle = `rgba(255,255,255,${0.05 * speed})`; for (let k = 0; k < 6; k++) g.fillRect(640 + k * 64, 300, 2, 460); });
                if (land && !after) add(g, () => { glowDot(g, 840, 530, 460, 0.4 * hit(t, SPIN_LAND, 0.5), MAG); sparks(g, 840, 530, SPIN_LAND, t, 70, MAG, 1.3, 3); });
              }
              if (after) add(g, () => {
                const r = 60 + 1400 * eo(t, HIT, 0.9); g.strokeStyle = `rgba(255,190,225,${0.55 * (1 - pr(t, HIT, 0.9))})`; g.lineWidth = 4; g.beginPath(); g.ellipse(960, 460, r, r * 0.55, 0, 0, 6.3); g.stroke();
                sparks(g, 960, 460, HIT, t, 220, '255,200,220', 3.2, 5); glowDot(g, 960, 460, 900, 0.35 * boom, '255,190,220');
                if (t >= HIT + 2 * B) sparks(g, 960, 650, HIT + 2 * B, t, 70, MAG, 1.4, 9);
              });
              floorFade(g);
              g.restore();
            }} />
            {/* the share beside the landed card */}
            {land && !after && (
              <div style={{ position: 'absolute', left: 1220, top: 470, opacity: eo(t, SPIN_LAND, 0.25), fontFamily: F.serif, fontWeight: 900, fontSize: 110, color: '#ff9ed6', fontVariantNumeric: 'lining-nums', textShadow: '0 4px 30px rgba(0,0,0,.9)', transform: `scale(${lerp(1.2, 1, eo(t, SPIN_LAND, 0.2))})` }}>
                {pct}%
              </div>
            )}
            {land && !after && (
              <div style={{ position: 'absolute', left: 1226, top: 610, opacity: 0.8 * eo(t, SPIN_LAND + 0.3, 0.3), fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.2em', color: 'rgba(239,232,218,.85)' }}>OPINIUM / USWITCH · 2024</div>
            )}
            {/* 36亿, slammed in */}
            {after && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center' }}>
                <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 230, lineHeight: 1, letterSpacing: '0.02em', opacity: big, transform: `scale(${lerp(1.4, 1, big)})`, fontVariantNumeric: 'lining-nums',
                  background: 'linear-gradient(180deg,#ffe1f2 0%,#ff9ed6 55%,#c04a90 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 8px 40px rgba(0,0,0,.9))' }}>36亿</div>
                <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 84, marginTop: 34, color: C.cream, letterSpacing: '0.06em', opacity: sub2, transform: `scale(${lerp(1.2, 1, eo(t, HIT + 2 * B, 0.22))})`, textShadow: '0 6px 40px rgba(0,0,0,.9)' }}>通诈骗电话，被拦了下来</div>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, marginTop: 30, letterSpacing: '0.24em', color: 'rgba(239,232,218,.75)', opacity: eo(t, HIT + 3 * B, 0.3) }}>公安部 · 2025 全年</div>
              </div>
            )}
          </AbsoluteFill>
          <Grade warm={0.03} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.32 * hit(t, HIT, 0.08) + 0.14 * hit(t, HIT + 2 * B, 0.07) + 0.12 * hit(t, SPIN_LAND, 0.07), mixBlendMode: 'screen' }} />
          <Bars />
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>
          <Subs T={t} lines={LINES as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
