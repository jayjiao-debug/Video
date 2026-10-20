/* 10 s motion test: the phone rings in the living room → the call → "allow screen sharing" → someone else's cursor types the code → the phone goes dark → 《最后一步》 */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, SERIF, SANS, txt, subtitle, mark, grain, vignette, glow, ramp, eio, eo, back, setSeed, rnd, FONT_CHARS } from './lib';
import { livingRoom, phone, callScreen, shareAsk, transfer } from './sets';
export const MOTION_LEN = 300;
const dark = (g: G) => { const b = g.createRadialGradient(960, 540, 100, 960, 540, 1100); b.addColorStop(0, '#2a2119'); b.addColorStop(1, '#0a0806'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(2); for (let i = 0; i < 26; i++) glow(g, rnd() * W, rnd() * H, 40 + rnd() * 90, '255,200,140', 0.05 + rnd() * 0.06); };
const draw = (g: G, T: number) => {
  if (T < 2.4) {
    /* the room, pushing slowly toward the ringing phone */
    const z = 1 + 0.25 * eio(ramp(T, 0, 2.4)); g.save(); g.translate(930, 742); g.scale(z, z); g.translate(-930, -742); livingRoom(g, { lamp: 1, ring: 1, t: T, dusk: 0.7 }); g.restore();
    grain(g); vignette(g, 0.5); mark(g); subtitle(g, '一位70岁的老人，接到一个“客服”电话'); return;
  }
  dark(g);
  const k = eo(ramp(T, 2.4, 0.5)); const sc = 0.55 + 0.25 * k; const y = 470 + 120 * (1 - k);
  let scr = callScreen(T); let line = '对方说：您的账户有异常，要配合处理';
  if (T >= 4.4 && T < 6.0) { scr = shareAsk(ramp(T, 5.3, 0.1)); line = '先下载一个软件，再打开“屏幕共享”'; }
  if (T >= 6.0) {
    /* the cursor travels by itself, then the code types itself, one digit every 0.32 s */
    const c0 = { x: 380, y: 300 }, c1 = { x: 90, y: 560 }; const m = eio(ramp(T, 6.0, 0.7)); const typed = Math.min(5, Math.max(0, Math.floor((T - 6.8) / 0.32) + 1));
    const cx = c0.x + (c1.x - c0.x) * m + (typed > 0 ? Math.min(typed, 5) * 64 : 0), cy = c0.y + (c1.y - c0.y) * m;
    scr = transfer(T < 6.8 ? 0 : typed, { x: cx, y: cy }); line = '民警找到他时，骗子正在远程输入{验证码}';
  }
  const off = ramp(T, 8.45, 0.06);
  phone(g, 960, y, sc, scr, { tilt: -0.04, buzz: T < 4.4 ? T : 0, off });
  if (T >= 8.45) { g.fillStyle = `rgba(0,0,0,${0.75 * off})`; g.fillRect(0, 0, W, H); const s = back(ramp(T, 8.8, 0.35)); g.save(); g.translate(960, 500); g.scale(0.6 + 0.4 * s, 0.6 + 0.4 * s); txt(g, '《最后一步》', 0, 0, 120, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.5)', alpha: ramp(T, 8.8, 0.15) }); g.restore(); txt(g, '骗子的开场白千变万化，最后一步只有几种', 960, 600, 36, 'rgba(243,237,226,.8)', { w: 700, alpha: ramp(T, 9.2, 0.3) }); }
  grain(g); vignette(g); mark(g, T >= 8.45 ? 0 : 1); if (T < 8.45) subtitle(g, line);
};
export const Motion: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '一位岁的老人接到个客服电话对方说您账户有异常要配合处理先下载软件再打开屏幕共享民警找他时骗子正在远程输入验证码最后步的开场白千变万化只有几种来未知号码挂断接听转账金额短信确认始将能看你上所内容包括密和拒绝允许平台“”¥';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `500 26px ${SANS}`, `700 120px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / 30); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
