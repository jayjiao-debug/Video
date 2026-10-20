/* 10 s motion test: building at 22:00 → push into one window → the night in that room, hour by hour → 02:00 black → 07:30 alarm */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, SERIF, SANS, INK, mono, subtitle, mark, grain, vignette, ramp, eio, clamp, FONT_CHARS } from './lib';
import { bedroom, facade } from './sets';
export const MOTION_LEN = 300;
const hh = (m: number) => { const t = ((Math.floor(m) % 1440) + 1440) % 1440; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
const draw = (g: G, T: number) => {
  if (T < 1.6) {
    /* the building, pushing into the window that will stay lit */
    const z = eio(ramp(T, 0.2, 1.4)); const s = 1 + 5 * z; const fx = 360 + 5 * 120 + 60, fy = 180 + 40 + 3 * 107.5 + 36;
    g.save(); g.translate(960 - fx * s + (fx - 960) * (1 - z) * s / s, 540 - fy * s + (fy - 540) * (1 - z)); g.scale(s, s); facade(g, { hour: 0, focus: z }); g.restore();
    g.fillStyle = `rgba(150,190,255,${0.9 * ramp(T, 1.3, 0.3)})`; g.fillRect(0, 0, W, H);
    grain(g); mark(g); mono(g, '22:00', 960, 140, 90, INK, { f: SERIF, alpha: 1 - ramp(T, 1.0, 0.3) });
    return;
  }
  /* the room: 22:00 → 02:00 in a time-lapse, then black, then 07:30 */
  const min = T < 2.6 ? 22 * 60 : T < 7.0 ? 22 * 60 + 30 + (210 * eio(ramp(T, 3.6, 3.2))) : T < 8.0 ? 120 : 7 * 60 + 30;
  const lamp = 1 - ramp(T, 2.5, 0.12); const phone = T < 7.0 ? ramp(T, 2.62, 0.1) : 0;
  const flick = Math.max(0, Math.sin(T * 9.3) * Math.sin(T * 3.1));
  const day = ramp(T, 8.0, 0.15) * 0.85;
  bedroom(g, { lamp, phone, flick, day, clock: hh(min), alarm: T > 8.0 ? T : undefined });
  grain(g); vignette(g, 0.5 - 0.3 * day);
  /* the dark beat: phone dies */
  const blk = ramp(T, 7.0, 0.08) * (1 - ramp(T, 7.98, 0.04)); if (blk > 0) { g.fillStyle = `rgba(0,0,0,${0.94 * blk})`; g.fillRect(0, 0, W, H); }
  if (T > 8.0) { g.fillStyle = `rgba(255,255,255,${0.7 * (1 - ramp(T, 8.0, 0.4))})`; g.fillRect(0, 0, W, H); }
  mono(g, hh(min), 1700, 560, 120, 'rgba(243,237,226,.92)', { f: SERIF, glow: 'rgba(0,0,0,.8)', alpha: T > 7.0 && T < 8.0 ? 0.4 : 1 });
  if (T > 4.0 && T < 7.0) { const bat = Math.max(0, Math.round(42 - 42 * clamp((T - 4.0) / 3.0))); mono(g, `${bat}%`, 1700, 640, 40, bat < 10 ? '#ff7a5c' : 'rgba(243,237,226,.7)'); }
  mark(g);
  const line = T < 2.5 ? '困得眼睛睁不开' : T < 3.6 ? '一躺下，突然清醒' : T < 4.8 ? '刷会儿手机' : T < 5.9 ? '最后一个视频' : T < 7.0 ? '看完这个就睡' : T < 8.0 ? '手机没电了' : '生不如死';
  subtitle(g, line);
};
export const Motion: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '困得眼睛睁不开一躺下突然清醒刷会儿手机最后个视频看完这就睡没电了生如死';
    Promise.all([`700 68px ${SANS}`, `700 46px ${SANS}`, `700 120px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / 30); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
