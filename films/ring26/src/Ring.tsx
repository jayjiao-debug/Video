/* Cold open: the video starts like any other, then at 1.0 s the picture freezes mid-motion and the music stops dead,
   as if paused, while a phone ringtone plays (the owner supplies the original recording). The video then resumes and
   answers the moment: 别找了，不是你的手机。 Picture time `v` stands still during the pause. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, FontFaces, FONT_LOADS, Grade, Bars, Subs, Canvas, glowDot, clamp, lerp, pr, eo, eio, hit, rnd } from './kit';
import { textPts, particleText, sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, withReflection, floorFade, FLOOR, W, H } from './hero';

export const PAUSE_AT = 1.0;          // film seconds: picture and music stop here
export const RESUME_AT = 5.3;         // film seconds: picture and music carry on from where they stopped
export const RING = { start: 1.22, dur: 3.8 };   // where the ringtone sits inside the pause (film seconds)
export const OPEN_FRAMES = Math.round(14.0 * 30);
const PAUSE = RESUME_AT - PAUSE_AT;
export const vt = (t: number) => (t < PAUSE_AT ? t : t < RESUME_AT ? PAUSE_AT : t - PAUSE);   // picture time
const bt = (k: number) => 0.4058 + k * 0.50625;                                                  // the channel track's beat grid (picture time = track time)
const FLIP = bt(16);                                                                              // the phone turns over on the 8.5 s slam

type G = CanvasRenderingContext2D;
const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };

/** a generic phone (no brand): face down shows a plain back with a lens; face up shows a dark, empty screen */
const phone = (g: G, x: number, y: number, s: number, faceUp: boolean, squash = 1, glow = 0) => {
  const w = 150 * s, h = 300 * s, r = 26 * s;
  g.save(); g.translate(x, y); g.scale(1, Math.max(0.02, squash)); g.translate(-x, -y);
  g.fillStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.ellipse(x, y + h / 2 + 8, w * 0.62, 14 * s, 0, 0, 6.3); g.fill();
  const body = g.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
  body.addColorStop(0, '#2a2a31'); body.addColorStop(0.5, '#121216'); body.addColorStop(1, '#060608');
  g.fillStyle = body; g.beginPath(); (g as any).roundRect(x - w / 2, y - h / 2, w, h, r); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.5; g.stroke();
  if (faceUp) {
    const scr = g.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); scr.addColorStop(0, '#0d0f16'); scr.addColorStop(1, '#030305');
    g.fillStyle = scr; g.beginPath(); (g as any).roundRect(x - w / 2 + 7 * s, y - h / 2 + 7 * s, w - 14 * s, h - 14 * s, r * 0.75); g.fill();
    g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(x - w / 2 + 10 * s, y - h / 2 + 10 * s); g.lineTo(x + w * 0.1, y - h / 2 + 10 * s); g.lineTo(x - w / 2 + 10 * s, y); g.closePath(); g.fill();
    if (glow > 0) add(g, () => glowDot(g, x, y, 200 * s, 0.25 * glow, '200,215,255'));
  } else {
    g.fillStyle = '#0a0a0d'; g.beginPath(); (g as any).roundRect(x - w / 2 + 14 * s, y - h / 2 + 14 * s, 46 * s, 46 * s, 12 * s); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.stroke();
    g.fillStyle = '#1c1f2a'; g.beginPath(); g.arc(x - w / 2 + 37 * s, y - h / 2 + 37 * s, 12 * s, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(160,190,255,.35)'; g.beginPath(); g.arc(x - w / 2 + 34 * s, y - h / 2 + 34 * s, 4 * s, 0, 6.3); g.fill();
  }
  g.restore();
};

const LINES: [number, number, string][] = [
  [0.12, 3.0, '每天，你的大脑都在悄悄做一件事——'],
  [3.3, 6.0, '但你刚刚，是不是已经伸手了？'],
  [6.15, 8.45, '明明没有响，你却[听见]了'],
  [8.6, 11.5, '为什么大脑会听见根本没响的铃声？'],
];

export const Ring: React.FC = () => {
  const fr = useCurrentFrame(), t = fr / 30, v = vt(t);
  const [h] = useState(() => delayRender('ring-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(FONT_LOADS.map((x) => document.fonts.load(x, '你的大脑别找了不是手机伸听见'))).catch(() => null).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const resumed = v > PAUSE_AT;
  const scatter = resumed ? eo(v, PAUSE_AT, 0.7) : 0;
  const phoneIn = eo(v, 3.25, 0.6), flip = pr(v, FLIP - 0.18, 0.36), faceUp = flip >= 0.5;
  // a paused frame keeps its grain still too; only the picture clock moves it
  const dep = Math.round(v * 30);
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          <AbsoluteFill style={{ background: '#030305' }}>
            <Canvas dep={dep} draw={(g) => {
              stage(g, v); bokeh(g, v, 24, 0.9);
              g.save(); const s = lerp(1.0, 1.06, eio(v, 0, 10)); g.translate(960, 600); g.scale(s, s); g.translate(-960, -600);
              spot(g, 960, 760, 0.55 + 0.4 * eo(v, 3.1, 0.6), '235,228,255');
              // the 'normal' opening: gold dust drawing itself into 你的大脑 (caught mid-flight by the pause), blown away on resume
              add(g, () => { const pts = textPts('你的大脑', '900 170px "Noto Serif CJK SC"', 960, 430, 3); for (let k = 0; k < 2; k++) particleText(g, pts, Math.min(v, PAUSE_AT), -0.35, 1.12, GOLD, 7, 1000, scatter); glowDot(g, 960, 430, 520, 0.12 * eo(v, 0.2, 0.8) * (1 - scatter)); });
              // the phone
              if (phoneIn > 0) {
                withReflection(g, () => { g.save(); g.globalAlpha *= phoneIn; phone(g, 960, FLOOR - 170 + (1 - phoneIn) * 30, 1.0, faceUp, Math.abs(Math.cos(flip * Math.PI)), hit(v, FLIP, 0.6)); g.restore(); }, 0.2);
              }
              floorFade(g);
              if (v >= FLIP) add(g, () => { sparks(g, 960, FLOOR - 170, FLIP, v, 50, '200,215,255', 0.8, 3); });
              g.restore();
            }} />
            {/* 别找了。不是你的手机。 */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 230, textAlign: 'center', opacity: resumed ? 1 - pr(v, 3.0, 0.3) : 0 }}>
              <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 130, color: C.cream, letterSpacing: '0.08em', opacity: eo(v, PAUSE_AT + 0.12, 0.2), transform: `scale(${lerp(1.08, 1, eo(v, PAUSE_AT + 0.12, 0.25))})`, textShadow: '0 4px 30px rgba(0,0,0,.9)' }}>别找了。</div>
              <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 84, marginTop: 26, letterSpacing: '0.08em', opacity: eo(v, PAUSE_AT + 0.95, 0.3), background: 'linear-gradient(180deg,#fff3cf,#f0c873 55%,#b07c32)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,.9))' }}>不是你的手机。</div>
            </div>
          </AbsoluteFill>
          <Grade warm={0.03} />
          <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: 0.16 * hit(v, FLIP, 0.09), mixBlendMode: 'screen' }} />
          <Bars />
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.5)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>
          <Subs T={v} lines={LINES.filter(([a]) => !(a < PAUSE_AT && resumed)) as any} />
        </>
      )}
    </AbsoluteFill>
  );
};
