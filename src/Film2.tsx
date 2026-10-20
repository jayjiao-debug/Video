/* 《妈，是我》 v2 — production cut. Three tables seen from above (mum's, the police desk, a young person's), phones that live
   on them, a camera that never stands still, and code-drawn UI only. Timed to bgm.mp3 (117.94 bpm). */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, INK, RED, SERIF, SANS, txt, mono, subtitle, mark, grain, vignette, glow, rr, ramp, eio, eo, back, clamp, lerp, setSeed, rnd, FONT_CHARS } from './lib';
import { phone, inCall, shareAsk, transfer, Screen } from './sets';
import { sms, isYou, chat, calling, recents, safeWord, ring, lock, chatPay, powerOff, dial110 } from './screens';
import { Cam, withCam, lerpCam, mumTable, MUM_PHONE, MUM_W, MUM_H, deskScene, DESK_W, DESK_H, youDesk, YOU_PHONE, YOU_W, YOU_H } from './desks';

export const FPS = 30, LEN_S = 117.8, FILM2_LEN = Math.round(LEN_S * FPS);
const TITLE = 16.613, CLIMB = 20.683, DROP = 82.239, END = 111.745;

export const LINES2: [number, number, string][] = [
  [0.33, 3.3, '如果明天，你妈接到一个电话'],
  [3.39, 5.85, '是[你的声音]'],
  [5.93, 9.4, '“妈，我出事了，先别告诉爸”'],
  [9.49, 12.45, '“你快转两万给我，急用”'],
  [12.54, 16.2, '她会转吗？'],
  [20.68, 24.0, '北京一位奶奶，接到了“孙子”的电话'],
  [24.05, 27.3, '“奶奶，我刮了别人的车，要一万块”'],
  [27.4, 30.0, '声音一模一样。她转了'],
  [30.1, 33.3, '孙子回到家，她才知道是{AI合成}的'],
  [33.4, 37.6, '你发过的语音、拍过的视频，都可能被拿来模仿你'],
  [37.7, 40.8, '“您的快递丢了，给您三倍理赔”'],
  [40.9, 44.4, '“您开通了百万保障，不取消每月扣两千”'],
  [44.5, 47.6, '别以为，只有爸妈会被骗'],
  [49.17, 51.6, '受骗的人，平均37岁'],
  [51.7, 55.1, '18到40岁的，占了[六成多]'],
  [55.2, 59.0, '“你开过校园贷吧？不注销，影响征信”'],
  [59.1, 62.4, '开场白不一样，[最后一步]都一样'],
  [62.5, 65.7, '让你说验证码，或者点“是我本人”'],
  [65.8, 69.0, '让你下载App，打开“屏幕共享”'],
  [69.1, 71.9, '让你转账，或者刷脸'],
  [72.0, 74.9, '有位70岁老人，就停在这一步'],
  [75.0, 78.2, '骗子已经在远程，输他的转账验证码'],
  [78.3, 82.1, '他卡里有1421万。民警6分钟赶到，一分没少'],
  [82.24, 85.3, '电话里让你[动手]的，先挂掉'],
  [85.4, 87.3, '再打给家里人'],
  [87.4, 90.0, '不要回拨对方的号码'],
  [90.1, 94.3, '已经开了屏幕共享？关机，拔卡，用别的手机报警'],
  [94.4, 97.5, '96110 打来的，一定要接'],
  [97.6, 100.0, '那是警察在提醒你'],
  [101.57, 105.5, '再约一个[暗号]：声音再像，答不上来就是假的'],
  [105.64, 108.1, '骗子用的是你的声音'],
  [108.18, 111.6, '能拆穿他的，也只有[你]'],
];

/* ---------------------------------------------------------------- camera helpers */
const MUMP = { x: MUM_PHONE.x, y: MUM_PHONE.y };
const onMumPhone = (s: number, up = 1): Cam => ({ x: MUMP.x, y: MUMP.y, s, r: -MUM_PHONE.r * up });
const onYouPhone = (s: number, up = 1): Cam => ({ x: YOU_PHONE.x, y: YOU_PHONE.y, s, r: -YOU_PHONE.r * up });
/* keyframed camera: [t, cam][] with eased moves between keys */
const track = (T: number, keys: [number, Cam][]): Cam => { if (T <= keys[0][0]) return keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [a, ca] = keys[i], [b, cb] = keys[i + 1]; if (T <= b) return lerpCam(ca, cb, eio(clamp((T - a) / (b - a)))); } return keys[keys.length - 1][1]; };
/* a little handheld life on every camera */
const breathe = (c: Cam, T: number, amt = 1): Cam => ({ ...c, x: c.x + Math.sin(T * 0.7) * 6 * amt, y: c.y + Math.sin(T * 0.53 + 1) * 5 * amt, r: (c.r ?? 0) + Math.sin(T * 0.41) * 0.004 * amt });
const shake = (c: Cam, T: number, t0: number, amt = 14): Cam => { const k = Math.max(0, 1 - (T - t0) / 0.35); if (T < t0 || k <= 0) return c; return { ...c, x: c.x + Math.sin(T * 90) * amt * k / c.s, y: c.y + Math.cos(T * 77) * amt * k / c.s }; };
/* whip transition: a bright directional smear for a few frames */
const whip = (g: G, T: number, t0: number) => { const d = T - t0; if (d < -0.18 || d > 0.18) return; const k = 1 - Math.abs(d) / 0.18; g.save(); g.globalAlpha = 0.85 * k; const b = g.createLinearGradient(0, 0, W, 0); b.addColorStop(0, 'rgba(20,16,12,0)'); b.addColorStop(0.5, 'rgba(30,24,18,1)'); b.addColorStop(1, 'rgba(20,16,12,0)'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(Math.floor(T * 30)); g.globalAlpha = 0.25 * k; for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,230,190,1)'; g.fillRect(rnd() * W, rnd() * H, 200 + rnd() * 600, 2 + rnd() * 3); } g.restore(); };
const flash = (g: G, T: number, t0: number, col = '255,250,240', a = 0.6, d = 0.25) => { const k = 1 - (T - t0) / d; if (T < t0 || k <= 0) return; g.fillStyle = `rgba(${col},${a * k})`; g.fillRect(0, 0, W, H); };
const plaque = (g: G, x: number, y: number, s: string, a: number, size = 34) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = `700 ${size}px ${SANS}`; const w = g.measureText(s).width + 56; g.fillStyle = 'rgba(12,10,8,.86)'; rr(g, x - w / 2, y - size - 14, w, size + 40, 14); g.fill(); g.strokeStyle = 'rgba(243,237,226,.28)'; g.lineWidth = 2; rr(g, x - w / 2 + 5, y - size - 9, w - 10, size + 30, 10); g.stroke(); g.restore(); txt(g, s, x, y, size, INK, { w: 700, alpha: a }); };
const sharingBorder = (g: G, x: number, y: number, w: number, h: number, T: number) => { const p = 0.6 + 0.4 * Math.sin(T * 8); g.save(); g.strokeStyle = `rgba(229,69,58,${p})`; g.lineWidth = 10; g.shadowColor = 'rgba(229,69,58,.8)'; g.shadowBlur = 30; rr(g, x - w / 2, y - h / 2, w, h, 40); g.stroke(); g.restore(); };

/* ---------------------------------------------------------------- the six last steps as index cards */
const STEPS6 = ['说验证码', '点“是我本人”', '开屏幕共享', '下载App', '转账', '刷脸'];
const cards = (g: G, T: number, lit: number[], gone = 0) => {
  STEPS6.forEach((s, i) => {
    const t0 = 59.15 + i * 0.254; const a = ramp(T, t0, 0.12); if (a <= 0) return;
    const col = i % 3, row = Math.floor(i / 3); let x = 230 + col * 330, y = 330 + row * 300; const rot = [-0.05, 0.03, -0.02, 0.04, -0.03, 0.02][i];
    const drop = 1 - eo(ramp(T, t0, 0.3)); x += drop * -200; y += drop * -120;
    if (gone > 0) { y += gone * gone * (900 + i * 80); x += gone * (i - 2.5) * 60; }
    g.save(); g.translate(x, y); g.rotate(rot + drop * 0.3 + gone * (i - 2.5) * 0.2); g.globalAlpha = a;
    g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 12; g.fillStyle = '#f4eee2'; g.fillRect(-140, -110, 280, 220); g.shadowColor = 'transparent';
    g.fillStyle = 'rgba(200,60,50,.5)'; g.fillRect(-140, -70, 280, 3); g.strokeStyle = 'rgba(80,120,170,.25)'; g.lineWidth = 2; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-130, -20 + k * 42); g.lineTo(130, -20 + k * 42); g.stroke(); }
    mono(g, String(i + 1), -112, -82, 30, '#9a8e7c', { f: SERIF }); txt(g, s, 0, 30, s.length > 5 ? 36 : 44, '#2b2620', { w: 900 });
    /* the red marker circle when this step is named */
    const on = lit.includes(i) ? 1 : 0; if (on) { const k = ramp(T, [62.6, 63.9, 65.9, 67.2, 69.2, 70.4][i], 0.35); g.strokeStyle = '#d23a2a'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 18, 128, 62, -0.05, -0.6, -0.6 + Math.PI * 2 * k); g.stroke(); }
    g.restore();
  });
};

/* ---------------------------------------------------------------- scenes */
const hook = (g: G, T: number) => {
  /* mum's table, the phone ringing; it is answered; the camera ends upright on the phone */
  const cam = breathe(track(T, [[0, { x: 1300, y: 760, s: 0.78, r: 0.03 }], [3.2, { x: 1310, y: 800, s: 1.08, r: 0.06 }], [5.2, onMumPhone(1.5)], [12.5, onMumPhone(1.58)], [15.9, onMumPhone(1.72)], [16.62, onMumPhone(4.2)]]), T);
  const scr: Screen = T < 3.39 ? ring('192 **** 3721', '山东 济南', T) : T < 12.54 ? inCall(T - 3.39, 1) : chatPay(0.5 + 0.5 * Math.sin(T * 7));
  withCam(g, cam, () => mumTable(g, { t: T, screen: scr, glowA: 1, buzz: T < 3.39 ? T : 0 }));
  /* heartbeat on the transfer: two soft pulses of darkness */
  if (T > 12.54) { const hb = Math.pow(Math.max(0, Math.sin(T * 6.6)), 8); g.fillStyle = `rgba(0,0,0,${0.18 * hb})`; g.fillRect(0, 0, W, H); }
  vignette(g, 0.55 + 0.25 * ramp(T, 12.54, 3)); { const k = ramp(T, 16.25, 0.36); if (k > 0) { g.fillStyle = `rgba(200,220,255,${0.55 * k * k})`; g.fillRect(0, 0, W, H); } } grain(g);
};
/* ---------------------------------------------------------------- the title: we are inside the call */
const BEAT = 0.5087;
/* a glyph with a fake-voice glitch: red/cyan copies that snap together */
const glitchText = (g: G, s: string, x: number, y: number, size: number, k: number, gold: number, a: number) => {
  g.save(); g.globalAlpha = a; g.font = `700 ${size}px ${SERIF}`; g.textAlign = 'center';
  const off = (1 - k) * 22; if (off > 0.5) { g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,40,60,.85)'; g.fillText(s, x - off, y); g.fillStyle = 'rgba(40,220,255,.85)'; g.fillText(s, x + off, y + off * 0.3); g.globalCompositeOperation = 'source-over'; }
  g.fillStyle = INK; g.fillText(s, x, y);
  if (gold > 0) { const gr = g.createLinearGradient(0, y - size, 0, y + 10); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a'); g.globalAlpha = a * gold; g.shadowColor = 'rgba(241,197,109,.5)'; g.shadowBlur = 24; g.fillStyle = gr; g.fillText(s, x, y); }
  g.restore();
};
/* the call's voice print: bars that kick on every beat */
const voiceBars = (g: G, T: number, cx: number, cy: number, w: number, amp: number, col: string, flat = 0) => {
  const n = 64; const bw = w / n; const beat = Math.exp(-((((T - 0.334) % BEAT) + BEAT) % BEAT) * 7);
  g.save(); const base = g.globalAlpha; g.fillStyle = col; for (let i = 0; i < n; i++) { const x = cx - w / 2 + i * bw; const e = Math.exp(-Math.pow((i - n / 2) / (n / 3.2), 2)); const v = (0.25 + 0.75 * Math.abs(Math.sin(i * 1.9 + T * 8) * Math.sin(i * 0.47 + T * 3.1))) * e * (0.55 + 0.45 * beat) * amp * (1 - flat); const hh = 4 + v * 150; g.globalAlpha = base * (0.35 + 0.65 * e); g.beginPath(); g.roundRect(x + bw * 0.2, cy - hh / 2, bw * 0.6, hh, 3); g.fill(); } g.restore();
};
const scan = (g: G, a: number) => { g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2); g.restore(); };
const callBg = (g: G) => { const b = g.createRadialGradient(960, 420, 50, 960, 540, 1150); b.addColorStop(0, '#1d2638'); b.addColorStop(1, '#05070c'); g.fillStyle = b; g.fillRect(0, 0, W, H); };
const title = (g: G, T: number) => {
  callBg(g);
  const out = ramp(T, 20.0, 0.12);           // the hang-up press
  const crt = eio(ramp(T, 20.18, 0.38));     // the screen collapsing to a line
  g.save(); g.translate(960, 540); g.scale(1 + 0.04 * crt, Math.max(0.004, 1 - crt)); g.translate(-960, -540);
  callBg(g);
  /* top: kicker and the call status, like the top of a call screen */
  const a0 = ramp(T, TITLE, 0.12);
  txt(g, 'ANTI-FRAUD · MINISTRY OF PUBLIC SECURITY · MMXXV', 960, 150, 24, 'rgba(243,237,226,.55)', { w: 500, f: SERIF, alpha: a0 * ramp(T, TITLE + 0.2, 0.4) });
  mono(g, `通话中  00:${String(14 + Math.floor(T - TITLE)).padStart(2, '0')}`, 960, 215, 30, 'rgba(243,237,226,.7)', { alpha: a0 });
  /* the title, one character per half-beat, each arriving as a glitch that snaps clean; gold pours on 19.157 */
  const ch = ['《', '妈', '，', '是', '我', '》']; const size = 150, cw = 150, x0 = 960 - (ch.length * cw) / 2 + cw / 2;
  const at = [0, 0, 0.509, 0.763, 1.018, 1.018];
  const pour = ramp(T, 19.157, 0.5);
  ch.forEach((c, i) => { const t0 = TITLE + at[i]; if (T < t0) return; const k = eo(ramp(T, t0, 0.22)); const flick = T - t0 < 0.12 ? (Math.sin((T - t0) * 160) > 0 ? 1 : 0.35) : 1;
    glitchText(g, c, x0 + i * cw + (1 - k) * 8, 440, size, k, clamp(pour * 1.6 - (i / ch.length) * 0.6), a0 * flick); });
  /* a second, brief glitch across the whole title on 18.648 (the voice "slips") */
  if (T > 18.648 && T < 18.8) { g.save(); g.globalAlpha = 0.6; g.fillStyle = 'rgba(255,60,80,.5)'; g.fillRect(0, 360 + Math.sin(T * 300) * 30, W, 14); g.fillStyle = 'rgba(60,220,255,.4)'; g.fillRect(0, 410, W, 8); g.restore(); }
  /* the voice */
  voiceBars(g, T, 960, 610, 1100, ramp(T, TITLE, 0.3), 'rgba(156,195,255,.95)', out);
  /* the tell-tale tag */
  const tagA = ramp(T, 18.15, 0.2) * (T < 18.5 ? (Math.sin(T * 50) > 0 ? 1 : 0.4) : 1);
  if (tagA > 0) { g.save(); g.globalAlpha = tagA; g.fillStyle = 'rgba(229,69,58,.15)'; g.strokeStyle = 'rgba(229,69,58,.9)'; g.lineWidth = 2; rr(g, 960 - 190, 712, 380, 52, 26); g.fill(); g.stroke(); g.restore(); txt(g, '● 号码未知 · 声音可被AI合成', 960, 748, 26, '#ff8a7a', { w: 700, alpha: tagA }); }
  /* taglines */
  const ta = ramp(T, TITLE + 1.3, 0.5);
  txt(g, '电话那头，真的是你吗？', 960, 850, 44, INK, { w: 700, alpha: ta });
  txt(g, 'Is it really you on the line?', 960, 902, 28, 'rgba(243,237,226,.6)', { w: 400, f: SERIF, alpha: ta });
  txt(g, '— VIBE知识大赏 —', 960, 965, 24, 'rgba(243,237,226,.5)', { w: 500, alpha: ta });
  /* the hang-up: a red button rises and is pressed */
  const hb = ramp(T, 19.75, 0.2); if (hb > 0) { const press = 1 - 0.12 * out; g.save(); g.translate(1640, 860); g.scale(press, press); g.globalAlpha = hb; glow(g, 0, 0, 120, '229,69,58', 0.4 * hb + 0.4 * out); g.fillStyle = '#e5453a'; g.beginPath(); g.arc(0, 0, 54, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 9; g.lineCap = 'round'; g.rotate(2.3); g.beginPath(); g.arc(0, 0, 22, -0.9, 0.9); g.stroke(); g.restore(); }
  scan(g, 0.5);
  g.restore();
  /* after the collapse: a bright line, then black */
  if (crt > 0) { g.fillStyle = `rgba(0,0,0,${crt})`; g.fillRect(0, 0, W, H); const la = Math.sin(Math.PI * crt); g.fillStyle = `rgba(200,225,255,${la})`; g.fillRect(960 - 900 * (1 - crt * 0.9), 538, 1800 * (1 - crt * 0.9), 4); glow(g, 960, 540, 300 * (1 - crt), '160,200,255', 0.5 * la); }
  /* entrance: the hook's phone screen expands into this frame */
  const inK = 1 - ramp(T, TITLE, 0.18); if (inK > 0) { g.fillStyle = `rgba(200,220,255,${0.5 * inK})`; g.fillRect(0, 0, W, H); }
  grain(g);
};
const caseA = (g: G, T: number) => {
  const cam = breathe(track(T, [[20.68, { x: 600, y: 520, s: 1.5, r: -0.03 }], [24.0, { x: 640, y: 640, s: 1.6, r: 0.02 }], [27.4, { x: 1100, y: 600, s: 1.7, r: 0.04 }], [30.1, { x: 1000, y: 700, s: 1.25, r: 0 }], [33.3, { x: 900, y: 760, s: 1.12, r: -0.01 }]]), T);
  withCam(g, shake(cam, T, 30.35), () => deskScene(g, { t: T, wave: ramp(T, 24.1, 3.0), stampA: ramp(T, 30.3, 0.22), stampB: 0, reportBars: 0 }));
  flash(g, T, 30.3, '255,240,230', 0.25); vignette(g, 0.6); grain(g); whip(g, T, 20.68);
};
const yourPhone = (g: G, T: number) => {
  const cam = breathe(track(T, [[33.4, { x: YOU_PHONE.x - 200, y: YOU_PHONE.y - 60, s: 1.1, r: -0.05 }], [35.5, onYouPhone(1.55)], [37.6, onYouPhone(1.62)]]), T);
  withCam(g, cam, () => youDesk(g, { t: T, screen: chat(ramp(T, 34.8, 2.6)), glowA: 1 }));
  plaque(g, 1500, 360, '你的语音', ramp(T, 34.2, 0.3)); plaque(g, 1500, 470, '你的视频', ramp(T, 34.8, 0.3)); plaque(g, 1500, 640, '都可能被拿来模仿你', ramp(T, 35.8, 0.3));
  vignette(g, 0.6); grain(g); whip(g, T, 33.4);
};
const openings = (g: G, T: number) => {
  const notes: [string, string, string][] = [['电话', '未接来电 192 **** 5502', '“快递丢了，三倍理赔”'], ['短信', '百万保障即将扣费', '不取消，每月扣2000元']];
  const n = ramp(T, 37.85, 0.35) + ramp(T, 41.0, 0.35);
  const cam = breathe(track(T, [[37.7, onMumPhone(1.5)], [44.4, onMumPhone(1.68)]]), T);
  withCam(g, cam, () => mumTable(g, { t: T, screen: lock(notes, n, T), glowA: 0.8, buzz: (T > 37.85 && T < 38.6) || (T > 41.0 && T < 41.7) ? T : 0 }));
  vignette(g, 0.6); grain(g); whip(g, T, 37.7);
};
const twist = (g: G, T: number) => {
  if (T < 47.6) { const cam = breathe(track(T, [[44.5, { x: 1250, y: 760, s: 0.86, r: 0.02 }], [47.6, { x: 1350, y: 800, s: 0.95, r: -0.02 }]]), T); withCam(g, cam, () => youDesk(g, { t: T, screen: (gg, w, h) => { gg.fillStyle = '#05070b'; gg.fillRect(0, 0, w, h); }, glowA: 0 })); vignette(g, 0.6); grain(g); whip(g, T, 44.5); return; }
  if (T < 55.2) { const cam = breathe(track(T, [[47.6, { x: 1500, y: 1360, s: 1.55, r: 0.03 }], [51.7, { x: 1480, y: 1330, s: 1.95, r: 0.0 }], [55.1, { x: 1460, y: 1320, s: 2.05, r: -0.01 }]]), T);
    withCam(g, cam, () => deskScene(g, { t: T, wave: 1, stampA: 1, stampB: 0, reportBars: eio(ramp(T, 48.0, 1.4)), hi: ramp(T, 51.8, 0.4) }));
    if (T > 49.17) { const a = ramp(T, 49.3, 0.3); g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(10,8,6,.88)'; rr(g, 70, 90, 420, 200, 18); g.fill(); g.restore(); txt(g, '受害人平均年龄', 280, 150, 30, 'rgba(243,237,226,.7)', { w: 700, alpha: a }); mono(g, '37岁', 280, 250, 92, GOLD, { f: SERIF, alpha: a, glow: 'rgba(241,197,109,.35)' }); }
    vignette(g, 0.55); grain(g); whip(g, T, 47.6); return; }
  const cam = breathe(track(T, [[55.2, { x: YOU_PHONE.x - 160, y: YOU_PHONE.y, s: 1.05, r: 0 }], [57.0, onYouPhone(1.5)], [59.0, onYouPhone(1.58)]]), T);
  withCam(g, cam, () => youDesk(g, { t: T, screen: ring('192 **** 0816', '江苏 苏州', T), glowA: 1, buzz: T }));
  plaque(g, 1500, 420, '“影响征信”', ramp(T, 56.6, 0.3)); vignette(g, 0.6); grain(g); whip(g, T, 55.2);
};
/* the steps: cards on a dim desk, the phone beside them showing each one */
const steps = (g: G, T: number) => {
  g.save(); g.filter = 'blur(7px)'; withCam(g, { x: 1500, y: 800, s: 0.75 + 0.03 * ramp(T, 59.1, 13) }, () => deskScene(g, { t: T, wave: 1, stampA: 1, stampB: 0, reportBars: 1 })); g.restore();
  g.fillStyle = 'rgba(8,7,6,.84)'; g.fillRect(0, 0, W, H);
  const lit = T < 62.5 ? [] : T < 65.8 ? [0, 1] : T < 69.1 ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5];
  cards(g, T, lit);
  const scr: Screen | null = T < 62.5 ? null : T < 64.1 ? sms() : T < 65.8 ? isYou() : T < 69.1 ? shareAsk(ramp(T, 68.2, 0.1)) : chatPay(0.6);
  const t0 = T < 64.1 ? 62.5 : T < 65.8 ? 64.1 : T < 69.1 ? 65.8 : 69.1; if (scr) { const k = eo(ramp(T, t0, 0.35)); phone(g, 1480, 500 + 50 * (1 - k), 0.82, scr, { tilt: 0.03 }); }
  if (T < 62.5) { const a = ramp(T, 59.2, 0.4); txt(g, '最后一步', 1480, 470, 120, GOLD, { f: SERIF, w: 700, alpha: a, glow: 'rgba(241,197,109,.45)' }); txt(g, '骗局千变万化，都停在这几个动作上', 1480, 560, 34, 'rgba(243,237,226,.8)', { w: 700, alpha: a * ramp(T, 59.8, 0.4) }); }
  if (T > 65.8 && T < 69.1) plaque(g, 1480, 950 - 120, '警方：让你开屏幕共享的，100%是诈骗', ramp(T, 66.6, 0.3), 30);
  vignette(g, 0.5); grain(g); whip(g, T, 59.1);
};
const remote = (g: G, T: number) => {
  if (T < 78.3) {
    withCam(g, onMumPhone(1.62), () => mumTable(g, { t: T, screen: (gg, w, h) => { const c0 = { x: 380, y: 300 }, c1 = { x: 90, y: 560 }; const m = eio(ramp(T, 72.6, 1.6)); const typed = Math.min(6, Math.max(0, Math.floor((T - 75.1) / 0.45) + 1)); transfer(T < 75.1 ? 0 : typed, { x: c0.x + (c1.x - c0.x) * m + (typed > 0 ? Math.min(typed, 5) * 64 : 0), y: c0.y + (c1.y - c0.y) * m }, '500,000')(gg, w, h); }, glowA: 1, night: 0.7 }));
    sharingBorder(g, 960, 540, 500 * 0.6 * 1.62 + 30, 1040 * 0.6 * 1.62 + 30, T);
    plaque(g, 1560, 460, '这个鼠标，不是他的', ramp(T, 73.4, 0.3));
    vignette(g, 0.6); grain(g); whip(g, T, 72.0); return;
  }
  const cam = breathe(track(T, [[78.3, { x: 2050, y: 640, s: 1.6, r: 0.03 }], [80.6, { x: 2050, y: 760, s: 1.35, r: 0 }], [82.1, { x: 2100, y: 800, s: 1.3, r: -0.01 }]]), T);
  withCam(g, shake(cam, T, 80.85), () => deskScene(g, { t: T, wave: 1, stampA: 1, stampB: ramp(T, 80.8, 0.22), reportBars: 1 }));
  flash(g, T, 80.8, '255,240,230', 0.25); vignette(g, 0.6); grain(g); whip(g, T, 78.3);
};
const rule = (g: G, T: number) => {
  if (T < 85.4) {
    /* the drop: the camera slams into the ringing phone; one huge red hang-up blooms out of it */
    const cam = shake(track(T, [[DROP - 0.05, onMumPhone(1.05)], [DROP + 0.25, onMumPhone(1.7)], [85.3, onMumPhone(1.78)]]), T, DROP + 0.25, 24);
    withCam(g, cam, () => mumTable(g, { t: T, screen: ring('192 **** 3721', '山东 济南', T), glowA: 1, night: 0.6 }));
    const k = back(ramp(T, DROP + 0.2, 0.35)); g.save(); g.translate(960, 540); g.scale(k, k); glow(g, 0, 0, 520, '229,69,58', 0.55); g.fillStyle = '#e5453a'; g.beginPath(); g.arc(0, 0, 220, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 30; g.lineCap = 'round'; g.rotate(2.3); g.beginPath(); g.arc(0, 0, 90, -0.9, 0.9); g.stroke(); g.restore();
    flash(g, T, DROP + 0.2, '255,120,100', 0.35, 0.3); vignette(g, 0.6); grain(g); return;
  }
  if (T < 90.1) { const scr = T < 87.4 ? calling('孩子') : recents(eio(ramp(T, 87.9, 0.6))); withCam(g, breathe(onMumPhone(T < 87.4 ? 1.5 : 1.6), T), () => mumTable(g, { t: T, screen: scr, glowA: 1, night: 0.6 })); vignette(g, 0.6); grain(g); whip(g, T, 85.4); return; }
  if (T < 94.4) {
    /* power off, the SIM tray out, then the other phone dials 110 */
    const other = { x: 1980, y: 820 };
    const cam = breathe(track(T, [[90.1, onMumPhone(1.45)], [91.9, { x: MUMP.x + 180, y: MUMP.y, s: 1.3, r: 0.05 }], [92.7, { x: other.x, y: other.y, s: 1.45, r: 0 }], [94.3, { x: other.x, y: other.y, s: 1.5, r: 0 }]]), T);
    withCam(g, cam, () => { mumTable(g, { t: T, screen: powerOff(ramp(T, 90.4, 0.9)), glowA: 1 - ramp(T, 90.4, 0.9), night: 0.6, phoneOff: ramp(T, 91.3, 0.2) });
      /* SIM tray sliding out of the phone's right side */
      const sk = eo(ramp(T, 91.5, 0.5)); if (sk > 0) { g.save(); g.translate(MUMP.x, MUMP.y); g.rotate(MUM_PHONE.r); g.translate(150 + 70 * sk, -60); g.fillStyle = '#9ea3ab'; rr(g, -20, -60, 90, 120, 8); g.fill(); g.fillStyle = '#c8a34a'; rr(g, -6, -36, 56, 70, 6); g.fill(); g.restore(); }
      /* the other phone (a family member's) */
      g.save(); g.translate(other.x, other.y); g.rotate(0.06); phone(g, 0, 0, 0.55, dial110(Math.min(3, Math.floor((T - 92.8) / 0.3) + 1 > 0 ? Math.floor((T - 92.8) / 0.3) + 1 : 0)), {}); g.restore(); });
    plaque(g, 360, 200, '① 关机', ramp(T, 90.3, 0.25)); plaque(g, 360, 300, '② 拔卡', ramp(T, 91.5, 0.25)); plaque(g, 360, 400, '③ 别的手机报警', ramp(T, 92.6, 0.25));
    vignette(g, 0.6); grain(g); whip(g, T, 90.1); return;
  }
  if (T < 101.57) { const ans = T > 100.0; withCam(g, breathe(track(T, [[94.4, onMumPhone(1.3)], [100.0, onMumPhone(1.55)]]), T), () => mumTable(g, { t: T, screen: ans ? inCall(T - 100, 0.3, '96110') : ring('96110', '反诈预警专线', T), glowA: 1, night: 0.6, buzz: ans ? 0 : T }));
    plaque(g, 1520, 420, '警察打来的', ramp(T, 97.7, 0.3)); vignette(g, 0.6); grain(g); whip(g, T, 94.4); return; }
  withCam(g, breathe(onMumPhone(1.6), T), () => mumTable(g, { t: T, screen: safeWord(ramp(T, 103.1, 0.5), T), glowA: 1, night: 0.6 }));
  vignette(g, 0.6); grain(g); whip(g, T, 101.57);
};
const ending = (g: G, T: number) => {
  const cam = track(T, [[105.64, { x: 1300, y: 820, s: 1.3, r: 0.04 }], [111.6, { x: 1300, y: 800, s: 0.8, r: 0.0 }]]);
  withCam(g, cam, () => mumTable(g, { t: T, screen: ring('', '', 0), glowA: 0.9 * ramp(T, 110.6, 1.0), night: 0.85, phoneFace: 1 }));
  vignette(g, 0.65); grain(g); whip(g, T, 105.64);
};
/* the end card: the phone lights up again — this time it is a family message, and the voice print is calm */
const endCard = (g: G, T: number) => {
  const k = ramp(T, END - 0.25, 0.4); if (k <= 0) return;
  /* the face-down phone glows at its edges just before the card */
  g.save(); g.globalAlpha = k; callBg(g); g.restore();
  const flashK = 1 - ramp(T, END - 0.05, 0.3); if (flashK > 0 && T > END - 0.05) { g.fillStyle = `rgba(200,220,255,${0.35 * flashK})`; g.fillRect(0, 0, W, H); }
  /* monogram drawn like the clock on a lock screen */
  const ringK = eio(ramp(T, END + 0.1, 0.9)); g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(960, 150, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ringK); g.stroke(); g.restore();
  txt(g, 'J', 958, 176, 70, GOLD, { f: SERIF, alpha: k * ramp(T, END + 0.5, 0.4) }); txt(g, 'JUNO', 960, 232, 20, 'rgba(243,237,226,.7)', { w: 500, alpha: k * ramp(T, END + 0.6, 0.4) });
  /* the title settles out of one last glitch */
  const tk = eo(ramp(T, END + 0.35, 0.4)); const ch = ['《', '妈', '，', '是', '我', '》']; ch.forEach((c, i) => glitchText(g, c, 960 - 2.5 * 96 + i * 96, 350, 92, tk, 1, k * ramp(T, END + 0.35, 0.15)));
  /* motif: the voice print, calm now, with the red hang-up beside it */
  g.save(); g.globalAlpha = k * ramp(T, END + 0.6, 0.4); voiceBars(g, T, 920, 445, 520, 0.45, 'rgba(156,195,255,.9)'); g.fillStyle = '#e5453a'; g.beginPath(); g.arc(1240, 445, 26, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; g.translate(1240, 445); g.rotate(2.3); g.beginPath(); g.arc(0, 0, 11, -0.9, 0.9); g.stroke(); g.restore();
  /* the question arrives as a notification from the family chat */
  const nk = eo(ramp(T, END + 0.9, 0.35)); if (nk > 0) { const y = 540 - 30 * (1 - nk); g.save(); g.globalAlpha = k * nk; g.fillStyle = 'rgba(255,255,255,.93)'; rr(g, 560, y, 800, 150, 28); g.fill(); g.fillStyle = '#34c759'; rr(g, 588, y + 24, 46, 46, 12); g.fill(); g.restore();
    txt(g, '家人群', 650, y + 58, 28, '#555', { w: 500, a: 'left', alpha: k * nk }); txt(g, '现在', 1330, y + 58, 26, '#777', { w: 500, a: 'right', alpha: k * nk }); txt(g, '你家有暗号吗？评论区见', 588, y + 120, 44, '#111', { w: 700, a: 'left', alpha: k * nk }); }
  txt(g, '把这个视频，发给你爸妈', 960, 760, 32, 'rgba(243,237,226,.8)', { w: 700, alpha: k * ramp(T, END + 1.2, 0.5) });
  /* follow pill, shaped like a call action */
  const pa = k * ramp(T, END + 1.4, 0.5); g.save(); g.globalAlpha = pa; g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.roundRect(960 - 290, 800, 580, 78, 39); g.stroke(); g.fillStyle = GOLD; g.beginPath(); g.arc(960 - 240, 839, 22, 0, 7); g.fill(); g.strokeStyle = '#05070c'; g.lineWidth = 5; g.lineCap = 'round'; g.translate(960 - 240, 839); g.rotate(0.8); g.beginPath(); g.arc(0, 0, 9, -0.9, 0.9); g.stroke(); g.restore();
  txt(g, '关注 Juno · 一起看懂世界', 990, 851, 34, GOLD, { w: 700, alpha: pa });
  txt(g, '资料：公安部发布会 2026-06 · 公安部刑侦局 2024-06 · 国家反诈中心民警（澎湃）· 光明网 2026-08 · 北京朝阳反诈中心 2026-08 · 96110', 960, 960, 21, 'rgba(243,237,226,.45)', { w: 400, alpha: k * ramp(T, END + 1.7, 0.5) });
  scan(g, 0.25 * k); grain(g);
};
const draw = (g: G, T: number) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (T < TITLE) hook(g, T);
  else if (T < CLIMB) title(g, T);
  else if (T < 33.4) caseA(g, T);
  else if (T < 37.7) yourPhone(g, T);
  else if (T < 44.5) openings(g, T);
  else if (T < 59.1) twist(g, T);
  else if (T < 72.0) steps(g, T);
  else if (T < DROP) remote(g, T);
  else if (T < 105.64) rule(g, T);
  else ending(g, T);
  endCard(g, T);
  mark(g, T >= TITLE && T < CLIMB ? 0 : 1 - ramp(T, END, 0.4));
  const L = LINES2.find(([a, b]) => T >= a && T < b);
  if (L) subtitle(g, L[2], ramp(T, L[0], 0.12) * (1 - ramp(T, L[1] - 0.1, 0.1)));
};

export const Film2: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => {
    const s = FONT_CHARS + LINES2.map((l) => l[2]).join('') + STEPS6.join('') + '十月星期二九月初十案件卷宗北京拟声冒充亲属转账凭证收款方孙子的朋友合成声音本人年龄两张卡内万民警赶到分钟客服屏幕共享正在一分未损电信网络诈骗受害人分布公安部刑侦局岁其他学生证交作业周五还花呗山东济南江苏苏州拒绝接听快递您包裹异常三倍理赔请回电保险百万保障即将扣费儿子妈到这个我同急用确认未接来电短信元现在月日星期反诈预警专线警察打来的你的语音视频都可能被拿模仿影响征信最后骗局千变万化停几动作上方让开享鼠标不是他关机拔卡别手机报警正在关机通话记录孩子昨天老伴星期一小区物业回拨们家暗号未知号码挂断呼叫短信银行您验证码为请勿告诉任何人是你本登录吗新设备位置我始将能看所有内容包括密和允许拒绝金额平均ANTIFRDMSYOPUBLCEX¥“”…①②③×';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `700 34px ${SANS}`, `500 26px ${SANS}`, `300 120px ${SANS}`, `400 22px ${SANS}`, `700 132px ${SERIF}`, `700 56px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / FPS); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}>
    <canvas ref={ref} width={W} height={H} />
    <Audio src={staticFile('mix.wav')} volume={(fr) => interpolate(fr, [(LEN_S - 2.6) * FPS, LEN_S * FPS], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  </AbsoluteFill>;
};
