/* 《身体里住着两个人》 full film. Three worlds: the mirror (the myth), the orchestra that lost its beat (what really splits),
   the radio (the voices), and the three renamed nameplates whose common character is 调. Melancholic grade. bgm 117.94 bpm. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, INK, RED, SERIF, SANS, txt, mono, subtitle, mark, grain, vignette, glow, rr, ramp, eio, eo, back, clamp, setSeed, rnd, FONT_CHARS } from './lib';
import { mirror, orchestra, radio, voiceWave, PARTS } from './Looks';

export const FPS = 30, LEN_S = 122.4, FILM_LEN = Math.round(LEN_S * FPS);
const TITLE = 16.613, STORY = 20.683, BRK = 49.172, BLD = 65.451, DROP = 82.239, CODA = 108.184, END = 115.815;

const LINES: [number, number, string][] = [
  [0.33, 3.54, '你可能也随口说过：“我精分了”'],
  [4.40, 7.76, '在电影里，精神分裂常常是这样：'],
  [8.47, 11.40, '一个身体里，住着{两个人}'],
  [12.54, 15.75, '可医生说的“分裂”，到底是什么？'],
  [20.68, 24.61, '“好几个人格”，是另一种病：分离性身份障碍'],
  [25.12, 29.19, '1908年，瑞士医生布洛伊勒造了这个词'],
  [29.70, 32.91, '他说的“分裂”，不是分成两个人'],
  [33.42, 36.35, '而是看见、听见、思考、感受——'],
  [36.86, 40.36, '这些本该一起动的部分，[不再合拍]'],
  [40.87, 44.51, '全世界，大约每300人里就有1个'],
  [45.02, 48.66, '它最常出现在十几岁末到二十几岁'],
  [49.17, 51.96, '和你我，差不多的年纪'],
  [52.53, 56.17, '最常见的，是听见别人听不到的声音'],
  [56.74, 59.95, '对他来说，那声音和真的一样'],
  [60.52, 64.88, '斯坦福的人类学家，问了三座城市的60位患者'],
  [65.45, 68.95, '美国加州：声音大多刺耳，带着{威胁}'],
  [69.51, 73.43, '印度金奈：过半的人听到家人，像长辈叮嘱'],
  [73.99, 77.77, '加纳阿克拉：一半人说，大多是好的声音'],
  [78.33, 81.68, '同一种病，为什么听到的不一样？'],
  [82.24, 85.74, '研究者认为：声音，也有[文化]的口音'],
  [86.44, 90.65, '名字也是一种声音。日本、韩国、台湾先后改了名'],
  [91.29, 94.65, '三个新名字里，都有同一个字：[调]'],
  [95.28, 98.78, '韩国的新名字，意思是“给琴弦调音”'],
  [99.42, 102.92, '不是两个人，是一个人的弦，[走了调]'],
  [103.55, 107.62, '世卫组织说：至少三分之一的人，能完全康复'],
  [108.18, 111.55, '所以，下次别再随口说“我精分了”'],
  [111.75, 115.75, '身体里没有两个人，只有一个人，在慢慢调弦'],
];

/* ---------------------------------------------------------------- helpers */
const cam = (g: G, s: number, x: number, y: number, f: () => void) => { g.save(); g.translate(x, y); g.scale(s, s); g.translate(-x, -y); f(); g.restore(); };
const fadeIn = (g: G, T: number, t0: number, d = 0.5) => { const k = 1 - ramp(T, t0, d); if (k > 0) { g.fillStyle = `rgba(4,5,8,${k})`; g.fillRect(0, 0, W, H); } };
const card = (g: G, x: number, y: number, w: number, h: number, a: number, edge = 'rgba(243,237,226,.28)') => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(8,9,12,.82)'; rr(g, x - w / 2, y - h / 2, w, h, 16); g.fill(); g.strokeStyle = edge; g.lineWidth = 2; rr(g, x - w / 2 + 6, y - h / 2 + 6, w - 12, h - 12, 12); g.stroke(); g.restore(); };
const grade = (g: G, warm = 0) => { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgb(${200 + 40 * warm},${210 + 20 * warm},${225 - 10 * warm})`; g.fillRect(0, 0, W, H); g.restore(); };
const rain = (g: G, T: number, a = 0.18) => { g.save(); g.globalAlpha = a; g.strokeStyle = '#b8c8dc'; g.lineWidth = 1.3; setSeed(77); for (let i = 0; i < 70; i++) { const x = rnd() * W, sp = 0.6 + rnd(); const y = ((rnd() * H + T * 520 * sp) % (H + 80)) - 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 22 + rnd() * 18); g.stroke(); } g.restore(); };
/* fog on the mirror with a word written in it */
const fogWord = (g: G, s: string, k: number, a: number) => { if (a <= 0) return; g.save(); g.beginPath(); g.arc(960, 470, 360, 0, 7); g.clip(); g.fillStyle = `rgba(200,210,220,${0.42 * a})`; g.fillRect(560, 100, 800, 760); g.globalCompositeOperation = 'destination-out'; g.font = `900 150px ${SANS}`; g.textAlign = 'center'; g.lineWidth = 26; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = 'rgba(0,0,0,1)'; const full = g.measureText(s).width; g.beginPath(); g.rect(960 - full / 2 - 20, 250, (full + 40) * k, 300); g.clip(); g.fillText(s, 960, 470); g.restore(); };

/* ---------------------------------------------------------------- scenes */
const hook = (g: G, T: number) => {
  const split = eio(ramp(T, 4.6, 2.6)) * (1 - eio(ramp(T, 12.6, 1.2)) * 0.0), crack = eo(ramp(T, 12.55, 0.45));
  const z = 1 + 0.06 * eio(ramp(T, 0, 16));
  cam(g, z, 960, 470, () => mirror(g, { split, crack }));
  fogWord(g, '精分', ramp(T, 0.6, 1.6), (1 - ramp(T, 3.6, 0.8)));
  /* the second "person" is the one we were told about: warm vs cold; at the crack, a flash */
  if (T > 12.55 && T < 12.9) { g.fillStyle = `rgba(230,240,255,${0.5 * (1 - ramp(T, 12.55, 0.35))})`; g.fillRect(0, 0, W, H); }
  grade(g); rain(g, T, 0.06); grain(g); vignette(g, 0.62); fadeIn(g, T, 0, 0.5);
};
const title = (g: G, T: number) => {
  /* the cracked mirror holds; the title is stamped into the glass one character per half-beat; then the shards fall into light */
  const fall = eio(ramp(T, 20.0, 0.68));
  cam(g, 1.06 + 0.1 * fall, 960, 470, () => mirror(g, { split: 0, crack: 1 }));
  g.fillStyle = `rgba(4,5,8,${0.45 + 0.5 * fall})`; g.fillRect(0, 0, W, H);
  const ch = ['《', '身', '体', '里', '住', '着', '两', '个', '人', '》']; const size = 104, cw = 108, x0 = 960 - (ch.length * cw) / 2 + cw / 2;
  const at = [0, 0, 0.254, 0.509, 0.763, 1.018, 1.272, 1.527, 1.781, 1.781]; const pour = ramp(T, 18.648, 0.6); const a = 1 - ramp(T, 20.0, 0.35);
  txt(g, 'SCHIZOPHRENIA · BLEULER · MCMVIII', 960, 300, 24, 'rgba(243,237,226,.55)', { w: 500, f: SERIF, alpha: a * ramp(T, TITLE + 0.2, 0.4) });
  ch.forEach((c, i) => { const t0 = TITLE + at[i]; if (T < t0) return; const k = eo(ramp(T, t0, 0.2)); const sc = 1 + 0.3 * (1 - k);
    /* each glyph arrives split in two (warm/cold) and closes into one */
    const off = (1 - k) * 18; g.save(); g.translate(x0 + i * cw, 470); g.scale(sc, sc); g.font = `700 ${size}px ${SERIF}`; g.textAlign = 'center'; g.globalAlpha = a;
    if (off > 0.5) { g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,160,90,.8)'; g.fillText(c, -off, 0); g.fillStyle = 'rgba(110,170,255,.8)'; g.fillText(c, off, 0); g.globalCompositeOperation = 'source-over'; }
    g.fillStyle = INK; g.fillText(c, 0, 0); const lit = clamp(pour * 1.6 - (i / ch.length) * 0.6); if (lit > 0) { const gr = g.createLinearGradient(0, -size, 0, 10); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a'); g.globalAlpha = a * lit; g.shadowColor = 'rgba(241,197,109,.5)'; g.shadowBlur = 22; g.fillStyle = gr; g.fillText(c, 0, 0); } g.restore(); });
  const ta = a * ramp(T, TITLE + 1.6, 0.5);
  txt(g, '精神分裂，到底分裂了什么？', 960, 620, 42, INK, { w: 700, alpha: ta }); txt(g, 'What, exactly, splits?', 960, 672, 28, 'rgba(243,237,226,.6)', { w: 400, f: SERIF, alpha: ta }); txt(g, '— VIBE知识大赏 —', 960, 740, 24, 'rgba(243,237,226,.5)', { w: 500, alpha: ta });
  /* shards fall into a spotlight cone: the match into the stage */
  if (fall > 0) { setSeed(21); g.save(); for (let i = 0; i < 26; i++) { const x = 700 + rnd() * 520, y = 200 + rnd() * 500 + fall * fall * (500 + rnd() * 400); g.fillStyle = `rgba(200,215,235,${0.35 * (1 - fall)})`; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20 + rnd() * 30, y + 10); g.lineTo(x + 8, y + 30 + rnd() * 20); g.closePath(); g.fill(); } g.restore(); g.save(); g.globalAlpha = 0.35 * fall; g.fillStyle = '#ffe2b0'; g.beginPath(); g.moveTo(930, 0); g.lineTo(990, 0); g.lineTo(1160, 900); g.lineTo(760, 900); g.closePath(); g.fill(); g.restore(); }
  grain(g); vignette(g, 0.6);
};
const story = (g: G, T: number) => {
  if (T < 25.12) {
    /* the mirror again, now honest: one person; a museum label beside it names the other illness */
    cam(g, 1.0 + 0.04 * ramp(T, STORY, 4), 960, 470, () => mirror(g, { split: 0.35 * (1 - ramp(T, 21.5, 2.2)), crack: 0 }));
    card(g, 1560, 470, 420, 190, ramp(T, 21.2, 0.4)); txt(g, '多重人格', 1560, 440, 40, INK, { w: 900, alpha: ramp(T, 21.2, 0.4) }); txt(g, '= 分离性身份障碍', 1560, 500, 30, 'rgba(243,237,226,.8)', { w: 700, alpha: ramp(T, 21.4, 0.4) });
    g.save(); g.globalAlpha = ramp(T, 21.6, 0.4); g.strokeStyle = RED; g.lineWidth = 5; g.beginPath(); g.moveTo(1370, 560); g.lineTo(1750, 560); g.stroke(); g.restore(); txt(g, '≠ 精神分裂', 1560, 600, 30, RED, { w: 900, alpha: ramp(T, 21.8, 0.4) });
    grade(g); grain(g); vignette(g, 0.62); fadeIn(g, T, STORY, 0.35); return;
  }
  if (T < 33.42) {
    /* the stage before the music: an old programme on the floor, 1908, Berlin */
    const k = ramp(T, 25.12, 0.6); cam(g, 1.0 + 0.05 * ramp(T, 25.12, 8), 960, 600, () => orchestra(g, { drift: 0, t: T }));
    g.fillStyle = 'rgba(4,5,8,.55)'; g.fillRect(0, 0, W, H);
    g.save(); g.globalAlpha = k; g.translate(960, 500); g.rotate(-0.03); g.fillStyle = '#e8dcc2'; g.fillRect(-300, -220, 600, 440); g.strokeStyle = '#8a6a3a'; g.lineWidth = 3; g.strokeRect(-280, -200, 560, 400); g.restore();
    txt(g, 'BERLIN · 24. APRIL 1908', 960, 370, 26, '#5a4a3a', { f: SERIF, w: 700, alpha: k }); mono(g, '1908', 960, 490, 120, '#2b2620', { f: SERIF, alpha: k }); txt(g, 'Schizophrenie', 960, 570, 44, '#7a2a1c', { f: SERIF, w: 700, alpha: k });
    txt(g, 'schizo 分裂 · phren 心智', 960, 640, 30, '#5a4a3a', { w: 700, alpha: k * ramp(T, 29.7, 0.4) });
    grade(g); grain(g); vignette(g, 0.6); fadeIn(g, T, 25.12, 0.3); return;
  }
  if (T < 40.87) {
    /* the four parts play together, then drift apart */
    const drift = eio(ramp(T, 36.9, 2.4)); cam(g, 1.02, 960, 600, () => orchestra(g, { drift, t: T }));
    grade(g); grain(g); vignette(g, 0.55); fadeIn(g, T, 33.42, 0.3); return;
  }
  /* 1 in 300: a hall of 300 empty seats, one lit */
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b0c12'); bg.addColorStop(1, '#16110c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const k = ramp(T, 40.9, 1.2); const zoom = 1 + 0.25 * eio(ramp(T, 41.5, 6));
  cam(g, zoom, 1188, 640, () => { for (let r = 0; r < 12; r++) for (let c = 0; c < 25; c++) { const x = 230 + c * 60 + (r % 2) * 10, y = 300 + r * 52; const lit = r === 7 && c === 16; const a = clamp(k * 3 - (r * 25 + c) / 300 * 2); if (a <= 0) continue; g.save(); g.globalAlpha = a; g.fillStyle = lit ? '#e9b56a' : '#3a2a22'; rr(g, x - 20, y - 18, 40, 30, 6); g.fill(); g.fillStyle = lit ? '#c7893a' : '#2a1d17'; rr(g, x - 20, y - 26, 40, 12, 5); g.fill(); g.restore(); if (lit) glow(g, x, y, 90, '241,197,109', 0.5 * a); } });
  card(g, 300, 160, 380, 120, ramp(T, 41.6, 0.4)); mono(g, '1/300', 300, 182, 64, GOLD, { f: SERIF, alpha: ramp(T, 41.6, 0.4) });
  if (T > 45.02) { const a = ramp(T, 45.1, 0.4); card(g, 1600, 160, 460, 120, a); txt(g, '十几岁末 — 二十几岁', 1600, 172, 34, INK, { w: 700, alpha: a }); }
  grade(g); grain(g); vignette(g, 0.6); fadeIn(g, T, 40.87, 0.3);
};
const voices = (g: G, T: number) => {
  if (T < 60.52) {
    /* the radio in a dark room picks up a station nobody else hears */
    const z = 1 + 0.08 * eio(ramp(T, BRK, 11)); cam(g, z, 760, 560, () => radio(g, { t: T }));
    const a = ramp(T, 52.6, 1.0); if (a > 0) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = a; setSeed(Math.floor(T * 12)); voiceWave(g, 300, 250, 900, T, 1, 'rgba(160,200,255,.85)'); g.restore(); }
    rain(g, T, 0.08); grade(g); grain(g); vignette(g, 0.62); fadeIn(g, T, BRK, 0.6); return;
  }
  /* three cities */
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d1220'); bg.addColorStop(1, '#05070c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  txt(g, '斯坦福 · 三座城市 · 60位患者听到的声音', 960, 130, 30, 'rgba(243,237,226,.7)', { w: 700, alpha: ramp(T, 60.6, 0.4) });
  const cities: [string, string, string, number, string, number][] = [['美国 · 加州', '刺耳、带威胁', '20人中，没有人以正面为主', 0, '229,83,63', 65.45], ['印度 · 金奈', '像长辈在叮嘱', '20人中，11人听到家人', 1, '241,197,109', 69.51], ['加纳 · 阿克拉', '大多是好的声音', '20人中，10人以正面为主', 2, '120,200,160', 73.99]];
  cities.forEach(([c, d, n, kind, col, t0], i) => { const pre = 0.35 * ramp(T, 60.9 + i * 0.5, 0.5); if (T < t0 - 0.2 && pre > 0) { const x = 330 + i * 630; g.save(); g.globalAlpha = pre; g.strokeStyle = `rgba(${col},.6)`; g.lineWidth = 2; rr(g, x - 280, 230, 560, 560, 26); g.stroke(); g.restore(); txt(g, c, x, 320, 44, INK, { w: 900, alpha: pre * 2 }); g.save(); g.globalAlpha = pre; g.strokeStyle = 'rgba(243,237,226,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 230, 480); g.lineTo(x + 230, 480); g.stroke(); g.restore(); }
    const a = ramp(T, t0 - 0.2, 0.4); if (a <= 0) return; const x = 330 + i * 630; const lift = 30 * (1 - eo(ramp(T, t0 - 0.2, 0.5))); g.save(); g.globalAlpha = a; g.translate(0, lift);
    g.fillStyle = 'rgba(255,255,255,.04)'; rr(g, x - 280, 200, 560, 560, 26); g.fill(); g.strokeStyle = `rgba(${col},.6)`; g.lineWidth = 2; rr(g, x - 280, 200, 560, 560, 26); g.stroke(); g.restore();
    txt(g, c, x, 290 + lift, 44, INK, { w: 900, alpha: a }); setSeed(Math.floor(T * 10) + i); g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'screen'; voiceWave(g, x - 230, 450 + lift, 460, T, kind, `rgba(${col},.95)`); g.restore();
    txt(g, d, x, 620 + lift, 40, `rgb(${col})`, { w: 700, alpha: a }); txt(g, n, x, 690 + lift, 26, 'rgba(243,237,226,.7)', { w: 500, alpha: a }); });
  if (T > 78.33) { const q = ramp(T, 78.4, 0.5); txt(g, '？', 960, 900, 80, 'rgba(243,237,226,.5)', { f: SERIF, alpha: q * 0 }); }
  grain(g); vignette(g, 0.5); fadeIn(g, T, 60.52, 0.3);
};
/* the three new names; 調 lights in each and they merge into one 调 */
const NAMES: [string, string, string, number][] = [['日本 · 2002', '統合失調症', '统合失调症', 3], ['韩国 · 2011', '調絃病', '조현병 · 调弦病', 0], ['台湾 · 2014', '思覺失調症', '思觉失调症', 3]];
const answer = (g: G, T: number) => {
  if (T < 86.44) {
    /* the drop: the three voices fold into one waveform that becomes a sound wave of culture */
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d1220'); bg.addColorStop(1, '#05070c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const m = eio(ramp(T, DROP, 1.2)); ['229,83,63', '241,197,109', '120,200,160'].forEach((col, i) => { setSeed(Math.floor(T * 10) + i); g.save(); g.globalCompositeOperation = 'screen'; voiceWave(g, 330 + i * 630 - 230 + (960 - 330 - i * 630) * m, 450, 460, T, i, `rgba(${col},${0.95 - 0.3 * m})`); g.restore(); });
    txt(g, '文化', 960, 700, 90, GOLD, { f: SERIF, w: 700, alpha: ramp(T, DROP + 0.8, 0.4), glow: 'rgba(241,197,109,.4)' });
    if (T < DROP + 0.25) { g.fillStyle = `rgba(255,240,210,${0.3 * (1 - ramp(T, DROP, 0.25))})`; g.fillRect(0, 0, W, H); }
    grain(g); vignette(g, 0.55); return;
  }
  if (T < 99.42) {
    /* brass nameplates on a dark wall */
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#15120f'); bg.addColorStop(1, '#0a0806'); g.fillStyle = bg; g.fillRect(0, 0, W, H); glow(g, 960, 380, 900, '255,190,120', 0.12);
    const merge = eio(ramp(T, 92.6, 1.6)); const hl = ramp(T, 91.4, 0.5);
    NAMES.forEach(([lbl, nm, sub, ti], i) => { const a = ramp(T, 86.6 + i * 0.6, 0.4) * (1 - 0.75 * merge); if (a <= 0) return; const x = 380 + i * 580, y = 470;
      g.save(); g.globalAlpha = a; const pl = g.createLinearGradient(x - 250, y - 120, x + 250, y + 120); pl.addColorStop(0, '#6b5226'); pl.addColorStop(0.5, '#a88a4c'); pl.addColorStop(1, '#5a4320'); g.fillStyle = pl; rr(g, x - 250, y - 120, 500, 240, 14); g.fill(); g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 3; rr(g, x - 238, y - 108, 476, 216, 10); g.stroke(); g.restore();
      txt(g, lbl, x, y - 62, 26, 'rgba(30,22,10,.85)', { w: 700, alpha: a });
      /* the name, with its 調 lit gold */
      g.save(); g.globalAlpha = a; g.font = `700 64px ${SERIF}`; g.textAlign = 'left'; const wNm = g.measureText(nm).width; let cx = x - wNm / 2; [...nm].forEach((c, k) => { const isT = k === ti; g.fillStyle = isT && hl > 0 ? `rgba(${Math.round(30 + 211 * hl)},${Math.round(22 + 175 * hl)},${Math.round(10 + 99 * hl)},1)` : '#1e160a'; if (isT && hl > 0) { g.shadowColor = `rgba(241,197,109,${0.8 * hl})`; g.shadowBlur = 24; } g.fillText(c, cx, y + 28); g.shadowBlur = 0; cx += g.measureText(c).width; }); g.restore();
      txt(g, sub, x, y + 88, 24, 'rgba(30,22,10,.75)', { w: 500, alpha: a }); });
    /* the three 調 fly to the centre and become one 调 */
    if (merge > 0) { const big = eo(ramp(T, 93.6, 0.8)); txt(g, '调', 960, 560, 140 + 140 * big, GOLD, { f: SERIF, w: 700, alpha: merge, glow: 'rgba(241,197,109,.6)' }); }
    if (T > 95.28) { /* a tuning peg turning under the character */ const a = ramp(T, 95.4, 0.5); g.save(); g.globalAlpha = a; g.translate(960, 820); g.rotate((T - 95.4) * 1.4); g.fillStyle = '#3a2618'; g.beginPath(); g.ellipse(0, 0, 70, 24, 0, 0, 7); g.fill(); g.fillStyle = '#c9a66b'; g.beginPath(); g.arc(0, 0, 14, 0, 7); g.fill(); g.restore(); g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(243,237,226,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(960, 806); g.lineTo(1800, 806 + Math.sin(T * 30) * 3 * (1 - ramp(T, 97.5, 1))); g.stroke(); g.restore(); }
    grain(g); vignette(g, 0.6); fadeIn(g, T, 86.44, 0.25); return;
  }
  /* back to the stage: the four parts snap back onto the beat; at 103.55 one in three stands is lit gold */
  const drift = 1 - eio(ramp(T, 99.5, 2.6)); cam(g, 1.0 + 0.05 * ramp(T, 99.42, 8), 960, 600, () => orchestra(g, { drift, t: T }));
  if (T > 103.55) { const a = ramp(T, 103.7, 0.6); g.save(); g.globalCompositeOperation = 'screen'; glow(g, 330, 740, 300, '241,197,109', 0.45 * a); g.restore(); card(g, 1560, 160, 520, 130, a, 'rgba(241,197,109,.5)'); txt(g, '至少 1/3 能完全康复', 1560, 175, 40, GOLD, { w: 900, alpha: a }); txt(g, 'WHO', 1560, 215, 22, 'rgba(243,237,226,.6)', { w: 500, alpha: a }); }
  grade(g, 0.3); grain(g); vignette(g, 0.55); fadeIn(g, T, 99.42, 0.3);
};
const coda = (g: G, T: number) => {
  /* the mirror at dawn: the crack gone, one reflection, warm light */
  const dawn = ramp(T, CODA, 6);
  cam(g, 1.08 - 0.06 * eio(ramp(T, CODA, 7)), 960, 470, () => mirror(g, { split: 0, crack: 0 }));
  g.save(); g.globalCompositeOperation = 'screen'; glow(g, 1500, 200, 1100, '255,200,140', 0.28 * dawn); g.restore();
  fogWord(g, '精分', 1, 0.5 * (1 - ramp(T, 109.5, 1.5)));
  grade(g, dawn); grain(g); vignette(g, 0.55 - 0.15 * dawn); fadeIn(g, T, CODA, 0.4);
};
const endCard = (g: G, T: number) => {
  const k = ramp(T, END, 0.5); if (k <= 0) return;
  g.save(); g.fillStyle = `rgba(6,7,10,${0.9 * k})`; g.fillRect(0, 0, W, H); g.restore();
  const ring = eio(ramp(T, END + 0.1, 0.9)); g.save(); g.globalAlpha = k; g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(960, 150, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring); g.stroke(); g.restore();
  txt(g, 'J', 958, 176, 70, GOLD, { f: SERIF, alpha: k * ramp(T, END + 0.5, 0.4) }); txt(g, 'JUNO', 960, 232, 20, 'rgba(243,237,226,.7)', { w: 500, alpha: k * ramp(T, END + 0.6, 0.4) });
  const ta = k * ramp(T, END + 0.4, 0.5); const gr = g.createLinearGradient(0, 300, 0, 380); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a');
  g.save(); g.globalAlpha = ta; g.font = `700 76px ${SERIF}`; g.textAlign = 'center'; g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.4)'; g.shadowBlur = 20; g.fillText('《身体里住着两个人》', 960, 360); g.restore();
  /* motif: four short lines (the four parts) back on one beat, a tuning peg beside */
  g.save(); g.globalAlpha = ta; for (let i = 0; i < 4; i++) { g.fillStyle = GOLD; g.beginPath(); g.ellipse(840 + i * 80, 450, 13, 9, -0.4, 0, 7); g.fill(); g.fillRect(850 + i * 80, 400, 3, 50); } g.restore();
  txt(g, '三个新名字，你觉得哪个最贴切？评论区见', 960, 580, 46, INK, { w: 700, alpha: k * ramp(T, END + 0.9, 0.5) });
  txt(g, '如果你或身边的人正在经历，可以拨打 12356 全国心理援助热线（24小时）', 960, 650, 28, 'rgba(243,237,226,.75)', { w: 500, alpha: k * ramp(T, END + 1.1, 0.5) });
  const pa = k * ramp(T, END + 1.3, 0.5); g.save(); g.globalAlpha = pa; g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.roundRect(960 - 260, 720, 520, 74, 37); g.stroke(); g.restore(); txt(g, '关注 Juno · 一起看懂世界', 960, 770, 34, GOLD, { w: 700, alpha: pa });
  txt(g, '资料：Bleuler 1908（AJP 2008）· Luhrmann et al., Br J Psychiatry 2015 · Cho et al., Psychiatry Investig 2018 · 台湾卫福部 2014 · WHO', 960, 900, 21, 'rgba(243,237,226,.45)', { w: 400, alpha: k * ramp(T, END + 1.6, 0.5) });
};

const draw = (g: G, T: number) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (T < TITLE) hook(g, T); else if (T < STORY) title(g, T); else if (T < BRK) story(g, T); else if (T < DROP) voices(g, T); else if (T < CODA) answer(g, T); else coda(g, T);
  endCard(g, T);
  mark(g, T >= TITLE && T < STORY ? 0 : 1 - ramp(T, END, 0.4));
  const L = LINES.find(([a, b]) => T >= a && T < b); if (L) subtitle(g, L[2], ramp(T, L[0], 0.12) * (1 - ramp(T, L[1] - 0.1, 0.1)));
};
export const Film: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + LINES.map((l) => l[2]).join('') + PARTS.join('') + '身体里住着两个人精分多重人格分离性身份障碍≠精神分裂节拍斯坦福三座城市位患者听到的声音美国加州刺耳带威胁中没有以正面为主印度金奈像长辈在叮嘱家加纳阿克拉大多好十几岁末二十日本韩国台湾統合失調症调絃病조현병思覺统合失调觉调弦病至少能完全康复文化三个新名字你觉得哪最贴切评论区见如果或边正经历可拨打全国心理援助热线小时关注一起看懂世界资料到底了什么BERLINAPRILSchizophreniechizophrenWHOSCHIZOPHRENIABLEULERMCMVIIIJUNO·—《》？';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `900 150px ${SANS}`, `700 40px ${SANS}`, `500 26px ${SANS}`, `400 21px ${SANS}`, `700 104px ${SERIF}`, `700 64px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); draw(g, f / FPS); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} />
    <Audio src={staticFile('bgm.mp3')} volume={(fr) => interpolate(fr, [(LEN_S - 2.6) * FPS, LEN_S * FPS], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
  </AbsoluteFill>;
};
