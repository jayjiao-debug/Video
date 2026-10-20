/* 10 s motion test: mum's living room, the phone rings → a call from an unknown number speaking in your voice → the ask → 《妈，是我》 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, SERIF, SANS, txt, subtitle, mark, grain, vignette, glow, ramp, eio, eo, back, setSeed, rnd, FONT_CHARS } from './lib';
import { livingRoom, phone, callScreen, inCall } from './sets';
export const MOTION_LEN = 300;
const dark = (g: G) => { const b = g.createRadialGradient(960, 540, 100, 960, 540, 1100); b.addColorStop(0, '#2a2119'); b.addColorStop(1, '#0a0806'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(2); for (let i = 0; i < 26; i++) glow(g, rnd() * W, rnd() * H, 40 + rnd() * 90, '255,200,140', 0.05 + rnd() * 0.06); };
const draw = (g: G, T: number) => {
  if (T < 2.3) {
    const z = 1 + 0.25 * eio(ramp(T, 0, 2.3)); g.save(); g.translate(930, 742); g.scale(z, z); g.translate(-930, -742); livingRoom(g, { lamp: 1, ring: 1, t: T, dusk: 0.7 }); g.restore();
    grain(g); vignette(g, 0.5); mark(g); subtitle(g, '如果明天，你妈接到一个电话'); return;
  }
  dark(g);
  const k = eo(ramp(T, 2.3, 0.5)); const sc = 0.55 + 0.25 * k; const y = 470 + 120 * (1 - k);
  const talking = T >= 3.2; const scr = talking ? inCall(T - 3.2, T < 8.1 ? 1 : 0.1) : callScreen(T, '未知号码', '');
  const out = ramp(T, 8.2, 0.3);
  phone(g, 960, y, sc, scr, { tilt: -0.04, buzz: talking ? 0 : T, off: 0 });
  if (out > 0) { g.fillStyle = `rgba(0,0,0,${0.8 * out})`; g.fillRect(0, 0, W, H); const s = back(ramp(T, 8.5, 0.35)); g.save(); g.translate(960, 500); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s); txt(g, '《妈，是我》', 0, 0, 120, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.5)', alpha: ramp(T, 8.5, 0.15) }); g.restore(); txt(g, '骗子的开场白千变万化，最后一步只有几种', 960, 600, 36, 'rgba(243,237,226,.8)', { w: 700, alpha: ramp(T, 8.9, 0.3) }); }
  grain(g); vignette(g); mark(g, 1 - out);
  const line = T < 3.2 ? '如果明天，你妈接到一个电话' : T < 4.6 ? '是[你的声音]' : T < 6.2 ? '“妈，我出事了，先别告诉爸”' : T < 7.4 ? '“你快转两万给我，急用”' : T < 8.2 ? '她会转吗？' : '';
  if (line) subtitle(g, line);
};
export const Motion: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '如果明天你妈接到一个电话是的声音我出事了先别告诉爸快转两万给急用她会吗骗子开场白千变化最后步只有几种来未知号码挂断接听平台客服“”';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `500 26px ${SANS}`, `700 120px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / 30); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
