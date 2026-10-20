/* 《妈，是我》 full film. Told from the young viewer's side: the call that reaches your mum in your voice, the one last step
   every scam ends on, and what you teach your parents tonight. Timed to bgm.mp3 (117.94 bpm). */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, INK, RED, SERIF, SANS, txt, mono, subtitle, mark, grain, vignette, glow, rr, ramp, eio, eo, back, clamp, setSeed, rnd, FONT_CHARS } from './lib';
import { livingRoom, phone, callScreen, inCall, shareAsk, transfer, caseFile, Screen } from './sets';
import { pay, sms, isYou, chat, calling, recents, safeWord } from './screens';
import { stepCards, STEPS } from './Looks';

export const FPS = 30, LEN_S = 117.8, FILM_LEN = Math.round(LEN_S * FPS);
const TITLE = 16.613, CLIMB = 20.683, END = 111.745;

const LINES: [number, number, string][] = [
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
  [40.9, 44.1, '“您的医保卡异常，不处理就停用”'],
  [44.2, 47.9, '“您开通了百万保障，不取消每月扣两千”'],
  [49.17, 52.4, '开场白不一样，[最后一步]都一样'],
  [52.5, 54.6, '让你说出验证码'],
  [54.7, 57.0, '让你点“是我本人”'],
  [57.1, 60.3, '让你下载App，打开“屏幕共享”'],
  [60.4, 62.9, '让你转账，或者刷脸'],
  [63.0, 65.9, '有位70岁老人，就停在这一步'],
  [66.0, 69.3, '骗子已经在远程，输他的转账验证码'],
  [69.4, 72.7, '他卡里有1421万。民警6分钟赶到'],
  [72.8, 74.6, '一分钱没少'],
  [74.7, 79.0, '警察说：让你开屏幕共享的，[100%]是诈骗'],
  [79.1, 82.1, '所以今晚，教爸妈一句话'],
  [82.24, 85.3, '电话里让你[动手]的，先挂掉'],
  [85.4, 87.3, '再打给我'],
  [87.4, 90.0, '不要回拨对方给的号码'],
  [90.1, 94.3, '已经开了屏幕共享？关机，拔卡，用别的手机报警'],
  [94.4, 97.5, '96110 打来的，一定要接'],
  [97.6, 100.0, '那是警察在提醒你'],
  [101.57, 105.5, '再约一个[暗号]：声音再像，答不上来就是假的'],
  [105.64, 108.1, '骗子用的是你的声音'],
  [108.18, 111.6, '能拆穿他的，也只有[你]'],
];

/* ---------------------------------------------------------------- backdrops */
const bokeh = (g: G, warm = 1) => { const b = g.createRadialGradient(960, 540, 100, 960, 540, 1100); b.addColorStop(0, '#2a2119'); b.addColorStop(1, '#0a0806'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(2); for (let i = 0; i < 26; i++) glow(g, rnd() * W, rnd() * H, 40 + rnd() * 90, warm ? '255,200,140' : '150,180,255', 0.05 + rnd() * 0.06); };
/* the phone enters with a small rise; cuts between screens happen on the line changes */
const hero = (g: G, scr: Screen, T: number, t0: number, o: { x?: number; sc?: number; buzz?: number; off?: number } = {}) => { const k = eo(ramp(T, t0, 0.45)); phone(g, o.x ?? 960, 470 + 80 * (1 - k), (o.sc ?? 0.8) * (0.92 + 0.08 * k), scr, { tilt: -0.035, buzz: o.buzz, off: o.off }); };
const label = (g: G, x: number, y: number, s: string, a: number) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = `700 34px ${SANS}`; const w = g.measureText(s).width + 48; g.fillStyle = 'rgba(10,8,6,.85)'; rr(g, x - w / 2, y - 44, w, 64, 12); g.fill(); g.strokeStyle = 'rgba(243,237,226,.3)'; g.lineWidth = 2; rr(g, x - w / 2, y - 44, w, 64, 12); g.stroke(); g.restore(); txt(g, s, x, y, 34, INK, { w: 700, alpha: a }); };
const evidence = (g: G, x: number, y: number, rows: [string, string][], a: number, rot = 0.04) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.fillStyle = '#f6efe0'; g.fillRect(-230, -40, 460, 60 + rows.length * 62); rows.forEach(([k, v], i) => { txt(g, k, -200, 10 + i * 62, 28, '#6b6258', { w: 500, a: 'left' }); txt(g, v, 200, 12 + i * 62, 34, i === rows.length - 1 ? '#b3261b' : '#2b2620', { w: 700, a: 'right' }); }); g.restore(); };
const icons = (g: G, T: number) => {
  const items: [string, (x: number, y: number) => void][] = [
    ['关机', (x, y) => { g.strokeStyle = INK; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.arc(x, y, 48, -Math.PI / 2 + 0.6, -Math.PI / 2 - 0.6 + Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(x, y - 62); g.lineTo(x, y - 8); g.stroke(); }],
    ['拔卡', (x, y) => { g.fillStyle = INK; g.beginPath(); g.moveTo(x - 40, y - 56); g.lineTo(x + 20, y - 56); g.lineTo(x + 40, y - 36); g.lineTo(x + 40, y + 56); g.lineTo(x - 40, y + 56); g.closePath(); g.fill(); g.fillStyle = '#b8945a'; rr(g, x - 24, y - 16, 48, 44, 6); g.fill(); }],
    ['别的手机报警', (x, y) => { mono(g, '110', x, y + 26, 84, RED, { w: 900 }); }],
  ];
  items.forEach(([s, draw], i) => { const t0 = 90.3 + i * 0.85; const a = ramp(T, t0, 0.25); if (a <= 0) return; const x = 560 + i * 400, y = 420; const sc = 0.8 + 0.2 * back(ramp(T, t0, 0.35));
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(12,10,9,.9)'; rr(g, x - 160, y - 160, 320, 360, 22); g.fill(); g.strokeStyle = 'rgba(243,237,226,.3)'; g.lineWidth = 2; rr(g, x - 150, y - 150, 300, 340, 18); g.stroke(); g.translate(x, y - 20); g.scale(sc, sc); g.translate(-x, -(y - 20)); draw(x, y - 20); g.restore();
    mono(g, String(i + 1), x - 120, y - 110, 30, 'rgba(243,237,226,.5)', { f: SERIF, alpha: a }); txt(g, s, x, y + 150, 40, INK, { w: 700, alpha: a }); });
};

/* ---------------------------------------------------------------- scenes */
const MOTIF = { x: 960, y: 650, s: 0.2 };
const hook = (g: G, T: number) => {
  if (T < 3.39) { const z = 1 + 0.22 * eio(ramp(T, 0, 3.39)); g.save(); g.translate(930, 742); g.scale(z, z); g.translate(-930, -742); livingRoom(g, { lamp: 1, ring: 1, t: T, dusk: 0.7 }); g.restore(); grain(g); vignette(g, 0.5); return; }
  bokeh(g);
  /* the phone: call → your voice → the transfer page; then it shrinks into the title motif */
  const z = eio(ramp(T, 15.8, 0.8)); const sc = 0.8 + (MOTIF.s - 0.8) * z; const y = 470 + (MOTIF.y - 470) * z;
  const scr = T < 12.54 ? inCall(T - 3.39, 1) : pay('20,000', 0.5 + 0.5 * Math.sin(T * 6));
  const k = eo(ramp(T, 3.39, 0.45)); phone(g, 960, y + 80 * (1 - k), sc * (0.92 + 0.08 * k), scr, { tilt: -0.035 * (1 - z) });
  grain(g); vignette(g);
};
const title = (g: G, T: number) => {
  bokeh(g); g.fillStyle = 'rgba(5,6,11,.55)'; g.fillRect(0, 0, W, H);
  const out = ramp(T, 20.0, 0.35); const grow = eio(ramp(T, 20.05, 0.63));
  phone(g, 960, MOTIF.y + (470 - MOTIF.y) * grow, MOTIF.s + (0.8 - MOTIF.s) * grow, inCall(T, 0.6), {});
  const a = (1 - out) * ramp(T, TITLE, 0.12); if (a <= 0) return;
  txt(g, 'ANTI-FRAUD · MINISTRY OF PUBLIC SECURITY · MMXXV', 960, 250, 24, 'rgba(243,237,226,.55)', { w: 500, f: SERIF, alpha: a * ramp(T, TITLE + 0.25, 0.4) });
  const ch = ['《', '妈', '，', '是', '我', '》']; const size = 120, cw = 120, x0 = 960 - (ch.length * cw) / 2 + cw / 2, ty = 430 - 30 * out;
  const at = [0, 0, 0.509, 0.763, 1.018, 1.018]; const pour = ramp(T, 19.157, 0.5);
  ch.forEach((c, i) => { const t0 = TITLE + at[i]; const st = ramp(T, t0, 0.1); if (st <= 0) return; const sc = 1 + 0.35 * (1 - eo(ramp(T, t0, 0.18)));
    g.save(); g.translate(x0 + i * cw, ty); g.scale(sc, sc); g.globalAlpha = a * st; g.font = `700 ${size}px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = INK; g.fillText(c, 0, 0);
    const lit = clamp(pour * 1.6 - (i / ch.length) * 0.6); if (lit > 0) { const gr = g.createLinearGradient(0, -size, 0, 10); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a'); g.globalAlpha = a * st * lit; g.shadowColor = 'rgba(241,197,109,.5)'; g.shadowBlur = 22; g.fillStyle = gr; g.fillText(c, 0, 0); }
    g.restore(); });
  const ta = a * ramp(T, TITLE + 1.2, 0.5);
  txt(g, '骗子的开场白千变万化，最后一步只有几种', 960, 860 - 30 * out, 40, INK, { w: 700, alpha: ta });
  txt(g, 'The opening lines change. The last step never does.', 960, 912 - 30 * out, 26, 'rgba(243,237,226,.6)', { w: 400, f: SERIF, alpha: ta });
  txt(g, '— VIBE知识大赏 —', 960, 985 - 30 * out, 24, 'rgba(243,237,226,.5)', { w: 500, alpha: ta });
};
const story = (g: G, T: number) => {
  if (T < 33.4) {
    /* the Beijing case on the case file */
    caseFile(g, { stamp: ramp(T, 30.1, 0.3), ev: ['“孙子”', 'AI合成声音'], stampText: 'AI合成声音' });
    evidence(g, 1530, 560, [['地点', '北京'], ['来电', '“孙子”'], ['理由', '刮了别人的车'], ['转出', '¥10,000']], ramp(T, 24.1, 0.4) * (T < 27.4 ? 0.999 : 1), 0.05);
    if (T > 27.4) { const k = back(ramp(T, 27.45, 0.3)); g.save(); g.translate(1560, 880); g.rotate(-0.1); g.scale(k, k); g.strokeStyle = '#c0281c'; g.lineWidth = 6; rr(g, -110, -40, 220, 70, 8); g.stroke(); txt(g, '已转出', 0, 10, 40, '#c0281c', { f: SERIF, w: 700 }); g.restore(); }
    g.fillStyle = `rgba(0,0,0,${0.15})`; g.fillRect(0, 0, W, H); grain(g); vignette(g); return;
  }
  bokeh(g, T < 37.7 ? 0 : 1);
  if (T < 37.7) { hero(g, chat(ramp(T, 34.8, 2.6)), T, 33.4); label(g, 1420, 300, '你的语音', ramp(T, 34.0, 0.3)); label(g, 1420, 400, '你的视频', ramp(T, 34.6, 0.3)); label(g, 1420, 600, '→ 被拿来模仿你', ramp(T, 35.8, 0.3)); }
  else { const who = T < 40.9 ? '“快递客服”' : T < 44.2 ? '“医保中心”' : '“保险客服”'; const t0 = T < 40.9 ? 37.7 : T < 44.2 ? 40.9 : 44.2; hero(g, callScreen(T, who, '未知号码'), T, t0, { buzz: T });
    /* the three openings pile up beside the phone */
    [['三倍理赔', 37.9], ['医保卡异常', 41.1], ['每月扣两千', 44.4]].forEach(([s, t], i) => label(g, 1450, 330 + i * 110, s as string, ramp(T, t as number, 0.3))); }
  grain(g); vignette(g);
};
const steps = (g: G, T: number) => {
  bokeh(g);
  const hi = T < 52.5 ? -1 : T < 54.7 ? 0 : T < 57.1 ? 1 : T < 60.4 ? (T < 58.8 ? 2 : 3) : T < 63.0 ? 4 : -1;
  const ca = ramp(T, 49.3, 0.5) * (1 - ramp(T, 62.9, 0.4));
  /* cards arrive one per beat, then the active one lights red */
  stepCards(g, 110, ca, hi, Math.floor(clamp((T - 49.3) / 0.509) * 0) + Math.min(6, 1 + Math.floor(Math.max(0, T - 49.3) / 0.509)));
  { const a = ramp(T, 49.5, 0.4) * (1 - ramp(T, 52.3, 0.3)); if (a > 0) { txt(g, '最后一步', 960, 560, 120, GOLD, { f: SERIF, w: 700, alpha: a, glow: 'rgba(241,197,109,.45)' }); txt(g, '骗局千变万化，都停在这六种动作上', 960, 660, 36, 'rgba(243,237,226,.75)', { w: 700, alpha: a * ramp(T, 50.2, 0.4) }); } }
  const scr: Screen | null = T < 52.5 ? null : T < 54.7 ? sms() : T < 57.1 ? isYou() : T < 60.4 ? shareAsk(ramp(T, 59.4, 0.1)) : T < 63.0 ? pay('50,000', 0.6) : transfer(0, { x: 380, y: 300 });
  if (scr) { const t0 = T < 54.7 ? 52.5 : T < 57.1 ? 54.7 : T < 60.4 ? 57.1 : T < 63.0 ? 60.4 : 63.0; const k = eo(ramp(T, t0, 0.4)); phone(g, 960, 650 + 60 * (1 - k), 0.55, scr, { tilt: -0.03 }); }
  if (T >= 63.0) { const k = eo(ramp(T, 63.0, 0.6)); /* settle into the remote-control shot */ }
  grain(g); vignette(g);
};
const remote = (g: G, T: number) => {
  if (T < 69.4) {
    bokeh(g, 0); const c0 = { x: 380, y: 300 }, c1 = { x: 90, y: 560 }; const m = eio(ramp(T, 63.6, 1.2)); const typed = Math.min(6, Math.max(0, Math.floor((T - 66.1) / 0.5) + 1));
    const cx = c0.x + (c1.x - c0.x) * m + (typed > 0 ? Math.min(typed, 5) * 64 : 0), cy = c0.y + (c1.y - c0.y) * m;
    hero(g, transfer(T < 66.1 ? 0 : typed, { x: cx, y: cy }, '500,000'), T, 63.0);
    label(g, 1450, 420, '鼠标不是他的', ramp(T, 64.2, 0.3)); grain(g); vignette(g); return;
  }
  caseFile(g, { stamp: ramp(T, 72.8, 0.3), ev: ['“平台客服”', '屏幕共享 · 已开启'], stampText: '一分未损' });
  evidence(g, 1530, 600, [['年龄', '70岁'], ['民警赶到', '6分钟'], ['两张卡里', '1421万']], ramp(T, 69.5, 0.4));
  if (T > 74.7) { g.fillStyle = `rgba(8,6,4,${0.78 * ramp(T, 74.7, 0.4)})`; g.fillRect(0, 0, W, H); const a = ramp(T, 74.9, 0.4) * (1 - ramp(T, 81.8, 0.4));
    txt(g, '“让你下载软件、开屏幕共享的，', 960, 420, 56, INK, { f: SERIF, w: 700, alpha: a }); txt(g, '100%是电信网络诈骗。”', 960, 510, 56, INK, { f: SERIF, w: 700, alpha: a }); mono(g, '100%', 960 - 4.5 * 56 + 2, 510, 56, GOLD, { f: SERIF, alpha: 0 }); txt(g, '— 警方', 1300, 600, 32, 'rgba(243,237,226,.6)', { w: 500, alpha: a });
    if (T > 79.1) { g.fillStyle = `rgba(8,6,4,${0.6 * ramp(T, 79.1, 0.6)})`; g.fillRect(0, 0, W, H); } }
  grain(g); vignette(g);
};
const rule = (g: G, T: number) => {
  bokeh(g);
  if (T < 85.4) {
    /* the drop: the six cards fall away, one red hang-up button lands */
    const fall = eio(ramp(T, 82.24, 0.8)); g.save(); g.translate(0, 600 * fall); stepCards(g, 110, 1 - fall, -1); g.restore();
    const k = back(ramp(T, 82.3, 0.4)); g.save(); g.translate(960, 470); g.scale(k, k); glow(g, 0, 0, 380, '229,69,58', 0.5); g.fillStyle = '#e5453a'; g.beginPath(); g.arc(0, 0, 170, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 24; g.lineCap = 'round'; g.rotate(2.3); g.beginPath(); g.arc(0, 0, 70, -0.9, 0.9); g.stroke(); g.restore();
    txt(g, '挂断', 960, 740, 48, INK, { w: 900, alpha: ramp(T, 82.6, 0.3) });
  } else if (T < 90.1) { hero(g, T < 87.4 ? calling('孩子') : recents(eio(ramp(T, 87.8, 0.6))), T, T < 87.4 ? 85.4 : 87.4); }
  else if (T < 94.4) icons(g, T);
  else if (T < 101.57) { hero(g, callScreen(T, '96110', '反诈预警专线'), T, 94.4, { buzz: T }); label(g, 1450, 420, '警察打来的', ramp(T, 97.7, 0.3)); const p = 0.5 + 0.5 * Math.sin(T * 7); glow(g, 960 + 96, 470 + 330, 120, '52,199,89', 0.4 * p * ramp(T, 94.6, 0.3)); }
  else hero(g, safeWord(ramp(T, 103.0, 0.5), T), T, 101.57);
  grain(g); vignette(g);
};
const ending = (g: G, T: number) => { livingRoom(g, { lamp: 1, ring: 0, t: T, dusk: 0.95 }); grain(g); vignette(g, 0.6); };

const endCard = (g: G, T: number) => {
  const k = ramp(T, END, 0.5); if (k <= 0) return;
  g.save(); g.fillStyle = `rgba(6,6,8,${0.93 * k})`; g.fillRect(0, 0, W, H); g.restore();
  const ring = eio(ramp(T, END + 0.1, 0.9)); g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(960, 165, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
  txt(g, 'J', 958, 192, 74, GOLD, { f: SERIF, alpha: k * ramp(T, END + 0.5, 0.4) }); txt(g, 'JUNO', 960, 252, 20, 'rgba(243,237,226,.7)', { w: 500, alpha: k * ramp(T, END + 0.6, 0.4) });
  const ta = k * ramp(T, END + 0.4, 0.5); const gr = g.createLinearGradient(0, 320, 0, 400); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a');
  g.save(); g.globalAlpha = ta; g.font = `700 84px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.4)'; g.shadowBlur = 20; g.fillText('《妈，是我》', 960, 385); g.restore();
  g.save(); g.globalAlpha = ta; phone(g, 960, 520, 0.16, inCall(T, 0.5)); g.restore();
  txt(g, '你家有暗号吗？评论区见', 960, 690, 50, INK, { w: 700, alpha: k * ramp(T, END + 0.9, 0.5) });
  txt(g, '把这个视频，发给你爸妈', 960, 750, 32, 'rgba(243,237,226,.75)', { w: 700, alpha: k * ramp(T, END + 1.1, 0.5) });
  const pa = k * ramp(T, END + 1.3, 0.5); g.save(); g.globalAlpha = pa; g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.roundRect(960 - 260, 790, 520, 74, 37); g.stroke(); g.restore();
  txt(g, '关注 Juno · 一起看懂世界', 960, 840, 34, GOLD, { w: 700, alpha: pa });
  txt(g, '资料：公安部发布会 2026-06 · 国家反诈中心民警（澎湃）· 光明网 2026-08 · 北京朝阳反诈中心 2026-08 · 96110', 960, 940, 22, 'rgba(243,237,226,.45)', { w: 400, alpha: k * ramp(T, END + 1.6, 0.5) });
};

const draw = (g: G, T: number) => {
  if (T < TITLE) hook(g, T);
  else if (T < CLIMB) title(g, T);
  else if (T < 49.17) story(g, T);
  else if (T < 63.0) steps(g, T);
  else if (T < 82.24) remote(g, T);
  else if (T < 105.64) rule(g, T);
  else ending(g, T);
  endCard(g, T);
  mark(g, T >= TITLE && T < CLIMB ? 0 : 1 - ramp(T, END, 0.4));
  const L = LINES.find(([a, b]) => T >= a && T < b);
  if (L) subtitle(g, L[2], ramp(T, L[0], 0.12) * (1 - ramp(T, L[1] - 0.1, 0.1)));
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => {
    const s = FONT_CHARS + LINES.map((l) => l[2]).join('') + STEPS.join('') + '来电未知号码挂断接听正在共享屏幕转账金额短信验证码确认收款人儿子的朋友银行您为请勿告诉任何人是你本登录吗新设备位置不家人呼叫孩子通话记录刚昨天老伴星期一日小区物业回拨们暗号快递客服医保中心保险反诈预警专线警察打来的语音视频被拿模仿鼠标他三倍理赔卡异常每月扣两千地点北京理由刮了别车转出已年龄岁民警赶到分钟张里一分未损关机拔卡别手机报警屏幕共享开始将能看所有内容包括密和拒绝允许AI合成声音资料公安部发布会光明网朝阳澎湃评论区见把这发给你爸妈关注一起看懂世界ANTIFRDMSYOPUBLCECX¥“”…→—';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `700 34px ${SANS}`, `500 26px ${SANS}`, `400 22px ${SANS}`, `700 120px ${SERIF}`, `700 56px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); });
  }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / FPS); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}>
    <canvas ref={ref} width={W} height={H} />
    <Audio src={staticFile('bgm.mp3')} volume={(fr) => interpolate(fr, [(LEN_S - 2.6) * FPS, LEN_S * FPS], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  </AbsoluteFill>;
};
