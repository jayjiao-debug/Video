/* Cold open v2 (电话恐惧): normal start → at 1.0 s the picture freezes and the music dies → the owner's WeChat ringtone
   → it stops dead → the music slams back in on a hit of the channel track (16.603 s, the track's first big slam) and
   the frozen frame explodes into the question, then a slot machine of callers lands on 陌生号码. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Bars, Subs, Canvas, glowDot, clamp, lerp, pr, eo, eio, hit, rnd } from './kit';
import { textPts, particleText, sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, floorFade, FLOOR, W, H } from './hero';

// film-time anchors
export const P0 = 1.0;                       // freeze + music cut
export const RING2 = { start: 1.2, dur: 3.2 };
export const SLAM = 4.6;                     // music returns here, at track 16.603
export const TRACK_SLAM = 16.603;
export const OPEN2_FRAMES = Math.round(15.2 * 30);
const beat = (k: number) => SLAM + k * 0.50625;            // film time of the k-th beat after the slam
// picture clock: runs, stands still during the pause, then runs again from the slam
const pic = (t: number) => (t < P0 ? t : t < SLAM ? P0 : P0 + (t - SLAM));

type G = CanvasRenderingContext2D;
const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };
const BLUE = '120,175,255', MAG = '255,110,205';

// the slot machine of callers (own clock: fast, then slowing, landing on a beat)
const CALLERS = ['妈妈', '老板', '快递', '前任', '客服', '班主任', '房东', '外卖', '领导', '陌生号码'];
const SLOT_A = beat(6), SLOT_LAND = beat(12);
const slotPos = (t: number) => {            // index (float) of the card in the window
  const q = clamp((t - SLOT_A) / (SLOT_LAND - SLOT_A)), e = 1 - Math.pow(1 - q, 3);
  return e * (CALLERS.length - 1 + 3 * 10) ;   // spins through the list three times, lands on the last
};

const callerCard = (g: G, x: number, y: number, name: string, a: number, hot = 0) => {
  const w = 520, h = 140;
  g.save(); g.globalAlpha *= a;
  const body = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); body.addColorStop(0, '#1d1b26'); body.addColorStop(1, '#0d0c13');
  g.fillStyle = body; g.beginPath(); (g as any).roundRect(x - w / 2, y - h / 2, w, h, 26); g.fill();
  g.strokeStyle = hot ? `rgba(${MAG},${0.6 + 0.4 * hot})` : 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
  // a plain avatar circle (no app UI)
  g.fillStyle = hot ? `rgba(${MAG},.35)` : 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(x - w / 2 + 80, y, 44, 0, 6.3); g.fill();
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x - w / 2 + 80, y - 10, 15, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(x - w / 2 + 80, y + 22, 24, 14, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#f3ede2'; g.font = '900 64px "Noto Sans CJK SC"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(name, x - w / 2 + 160, y + 2);
  g.restore();
};

const LINES: [number, number, string][] = [
  [0.12, 1.6, '每天，你的大脑都在悄悄做一件事——'],
  [beat(6) - 0.05, SLOT_LAND - 0.1, '第一反应：谁打来的？'],
  [SLOT_LAND + 0.05, 14.8, '56%的英国年轻人觉得：突然来电，多半{没好事}'],
];

export const Ring2: React.FC<{ bare?: boolean }> = ({ bare = false }) => {
  const fr = useCurrentFrame(), t = fr / 30, v = pic(t);
  const [h] = useState(() => delayRender('ring2-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '铃声一响你是开心还是心里一紧谁打来的妈老板快递前任客服班主任房东外卖领导陌生号码'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const after = t >= SLAM;
  const boom = after ? hit(t, SLAM, 0.35) : 0;
  const l1 = eo(t, SLAM, 0.18), l2 = eo(t, beat(2), 0.2), out12 = 1 - pr(t, beat(6) - 0.25, 0.25);
  const slotOn = t >= SLOT_A - 0.2;
  const dep = Math.round(v * 30);
  const sub = (s: number) => (t < SLAM && s > P0 ? P0 : t < SLAM ? Math.min(t, P0) : t);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <AbsoluteFill style={{ background: '#030305' }}>
            <Canvas dep={fr < P0 * 30 ? fr : t < SLAM ? Math.round(P0 * 30) : fr} draw={(g) => {
              stage(g, v); bokeh(g, v, 24, 0.9 + 0.8 * boom);
              g.save(); const s = 1 + 0.035 * boom + 0.02 * eio(t, SLAM, 6); g.translate(960, 560); g.scale(s, s); g.translate(-960, -560);
              spot(g, 960, 760, 0.55 + 0.4 * boom, after ? '255,214,235' : '235,228,255');
              // the 'normal' opening, then blown apart by the slam
              const scatter = after ? eo(t, SLAM, 0.9) : 0;
              add(g, () => { const pts = textPts('你的大脑', '900 170px "Noto Serif CJK SC"', 960, 430, 3); for (let k = 0; k < 2; k++) particleText(g, pts, Math.min(v, P0), -0.35, 1.12, GOLD, 7, 1000, scatter * 2.2); });
              if (after) add(g, () => {
                // shockwave + sparks on the slam
                const r = 60 + 1400 * eo(t, SLAM, 0.9); g.strokeStyle = `rgba(255,214,180,${0.55 * (1 - pr(t, SLAM, 0.9))})`; g.lineWidth = 4; g.beginPath(); g.ellipse(960, 470, r, r * 0.55, 0, 0, 6.3); g.stroke();
                sparks(g, 960, 470, SLAM, t, 220, '255,200,220', 3.2, 5); glowDot(g, 960, 470, 900, 0.35 * boom, '255,190,220');
                // a second, smaller hit for line two
                if (t >= beat(2)) sparks(g, 960, 600, beat(2), t, 90, MAG, 1.6, 9);
              });
              // the slot machine of callers
              if (slotOn) {
                const p = slotPos(t), base = Math.floor(p), frac = p - base, land = t >= SLOT_LAND;
                const a = eo(t, SLOT_A - 0.2, 0.25), sx = 960 - 230 * eio(t, SLOT_LAND + 0.25, 0.45);
                g.save(); g.beginPath(); g.rect(0, 330, W, 420); g.clip();
                for (let j = -2; j <= 2; j++) {
                  const idx = ((base + j) % CALLERS.length + CALLERS.length) % CALLERS.length, y = 540 + (j - frac) * 170;
                  const near = 1 - Math.min(1, Math.abs(y - 540) / 260);
                  callerCard(g, sx, y, CALLERS[idx], a * (0.25 + 0.75 * near), land && j === 0 ? 1 : 0);
                }
                g.restore();
                // motion streaks while spinning fast
                const speed = clamp(1 - (t - SLOT_A) / (SLOT_LAND - SLOT_A));
                if (speed > 0.15 && !land) add(g, () => { g.fillStyle = `rgba(255,255,255,${0.05 * speed})`; for (let k = 0; k < 6; k++) g.fillRect(700 + k * 90, 330, 2, 420); });
                if (land) add(g, () => { glowDot(g, sx, 540, 420, 0.4 * hit(t, SLOT_LAND, 0.5), MAG); sparks(g, sx, 540, SLOT_LAND, t, 80, MAG, 1.4, 3); });
              }
              floorFade(g);
              g.restore();
            }} />
            {/* the question, slammed in */}
            {after && t < beat(6) && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: out12 }}>
                <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 150, color: C.cream, letterSpacing: '0.06em', opacity: l1, transform: `scale(${lerp(1.35, 1, eo(t, SLAM, 0.22))})`, textShadow: '0 6px 40px rgba(0,0,0,.9)' }}>铃声一响——</div>
                <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 108, marginTop: 24, letterSpacing: '0.04em', opacity: l2, transform: `scale(${lerp(1.25, 1, eo(t, beat(2), 0.22))})`, textShadow: '0 6px 40px rgba(0,0,0,.9)' }}>
                  <span style={{ color: '#ffd59a' }}>你是开心，</span><span style={{ color: '#ff9ed6' }}>还是心里一紧？</span>
                </div>
              </div>
            )}
            {t >= SLOT_LAND + 0.45 && (
              <div style={{ position: 'absolute', left: 1060, top: 452, opacity: eo(t, SLOT_LAND + 0.45, 0.25) }}>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 120, lineHeight: 1, color: '#ff9ed6', textShadow: '0 4px 30px rgba(0,0,0,.9)' }}>{Math.round(56 * eo(t, SLOT_LAND + 0.45, 0.8))}%</div>
                <div style={{ fontFamily: F.sans, fontWeight: 700, fontSize: 44, marginTop: 14, color: C.cream, opacity: eo(t, SLOT_LAND + 1.1, 0.3) }}>觉得突然来电<span style={{ color: '#ff9ed6' }}>没好事</span></div>
                <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, marginTop: 16, letterSpacing: '0.2em', color: 'rgba(239,232,218,.75)', opacity: eo(t, SLOT_LAND + 1.3, 0.3) }}>OPINIUM / USWITCH · 2024 · 18–34 岁</div>
              </div>
            )}
          </AbsoluteFill>
          {!bare && <Grade warm={0.03} />}
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.32 * hit(t, SLAM, 0.08) + 0.14 * hit(t, beat(2), 0.07) + 0.14 * hit(t, SLOT_LAND, 0.07), mixBlendMode: 'screen' }} />
          {!bare && <Bars />}
          {!bare && <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>}
          {!bare && <Subs T={t < SLAM ? Math.min(t, P0) : t} lines={LINES.filter(([a]) => !(a < P0 && t >= SLAM)) as any} />}
        </>
      )}
    </AbsoluteFill>
  );
};
