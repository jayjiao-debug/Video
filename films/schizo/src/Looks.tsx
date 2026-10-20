/* 《身体里的两个人》 gate: three looks × (hook frame, key frame). Everything drawn in code. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, INK, RED, SERIF, SANS, txt, mono, subtitle, mark, grain, vignette, glow, rr, setSeed, rnd, FONT_CHARS } from './lib';

/* ================================================================ A · the mirror */
const silhouette = (g: G, x: number, y: number, s: number, col: string) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col;
  g.beginPath(); g.ellipse(0, -150, 72, 92, 0, 0, 7); g.fill(); g.fillRect(-28, -70, 56, 60);
  g.beginPath(); g.moveTo(-200, 160); g.bezierCurveTo(-190, 20, -110, -20, 0, -20); g.bezierCurveTo(110, -20, 190, 20, 200, 160); g.closePath(); g.fill(); g.restore(); };
export const mirror = (g: G, o: { split: number; crack?: number }) => {
  /* tiled wall, warm sconce */
  g.fillStyle = '#1e2224'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 90) for (let x = (y / 90) % 2 ? -45 : 0; x < W; x += 90) { g.fillStyle = `rgba(255,255,255,${0.02 + ((x * 7 + y * 3) % 5) * 0.004})`; g.fillRect(x + 3, y + 3, 84, 84); }
  glow(g, 1560, 300, 700, '255,190,120', 0.35); glow(g, 360, 300, 700, '255,190,120', 0.18);
  /* mirror */
  const cx = 960, cy = 470, R = 360;
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
  const m = g.createRadialGradient(cx - 80, cy - 120, 40, cx, cy, R); m.addColorStop(0, '#3a4148'); m.addColorStop(1, '#14181c'); g.fillStyle = m; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  /* the reflected room: a doorway of light behind */
  g.fillStyle = 'rgba(255,200,140,.10)'; g.fillRect(cx + 120, cy - 300, 160, 520);
  /* the reflection: one person, then two, offset and tinted */
  const d = o.split * 120;
  /* two dark figures, each rim-lit in its own colour: the warm one and the cold one */
  if (o.split > 0.05) { [[-d, '255,160,90'], [d, '110,170,255']].forEach(([dx, col]) => { g.save(); g.shadowColor = `rgba(${col},.9)`; g.shadowBlur = 40; silhouette(g, cx + (dx as number), cy + 140, 1.15, 'rgba(8,9,11,.92)'); g.restore(); g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = 0.18; silhouette(g, cx + (dx as number), cy + 140, 1.15, `rgb(${col})`); g.restore(); }); }
  else silhouette(g, cx, cy + 140, 1.15, '#0c0e10');
  /* glass sheen */
  const sh = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R); sh.addColorStop(0.3, 'rgba(255,255,255,0)'); sh.addColorStop(0.42, 'rgba(255,255,255,.08)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  /* crack */
  if (o.crack) { g.strokeStyle = `rgba(230,240,255,${0.7 * o.crack})`; g.lineWidth = 2.5; setSeed(4); for (let k = 0; k < 9; k++) { g.beginPath(); g.moveTo(cx + 40, cy - 60); let x = cx + 40, y = cy - 60; const a = (k / 9) * Math.PI * 2 + rnd() * 0.4; for (let s = 0; s < 6; s++) { x += Math.cos(a + (rnd() - 0.5) * 0.6) * 70 * o.crack; y += Math.sin(a + (rnd() - 0.5) * 0.6) * 70 * o.crack; g.lineTo(x, y); } g.stroke(); } }
  g.restore();
  g.strokeStyle = '#b48a4a'; g.lineWidth = 22; g.beginPath(); g.arc(cx, cy, R + 11, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,230,180,.4)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R + 4, 0, 7); g.stroke();
  /* basin edge at the bottom */
  g.fillStyle = '#d8d6d0'; rr(g, 420, 900, 1080, 200, 30); g.fill(); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(420, 900, 1080, 14);
};

/* ================================================================ B · the orchestra that lost its beat */
export const PARTS = ['看见', '听见', '思考', '感受'];
export const orchestra = (g: G, o: { drift: number; t: number; labels?: boolean }) => {
  /* stage */
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0b0a10'); bg.addColorStop(1, '#17110c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  /* curtain */
  for (let i = 0; i < 24; i++) { const x = i * 84; const c = g.createLinearGradient(x, 0, x + 84, 0); c.addColorStop(0, '#2a0d10'); c.addColorStop(0.5, '#4a161a'); c.addColorStop(1, '#2a0d10'); g.fillStyle = c; g.fillRect(x, 0, 84, 560); }
  g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, 560);
  /* floor with perspective boards */
  const fl = g.createLinearGradient(0, 560, 0, H); fl.addColorStop(0, '#3a2516'); fl.addColorStop(1, '#1c120a'); g.fillStyle = fl; g.fillRect(0, 560, W, H - 560);
  g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; for (let k = -12; k <= 12; k++) { g.beginPath(); g.moveTo(960 + k * 60, 560); g.lineTo(960 + k * 260, H); g.stroke(); }
  /* four stands under four spotlights */
  PARTS.forEach((p, i) => {
    const x = 330 + i * 420, y = 700;
    glow(g, x, y + 40, 330, '255,220,170', 0.28); g.save(); g.globalAlpha = 0.18; g.fillStyle = '#ffe2b0'; g.beginPath(); g.moveTo(x - 30, 0); g.lineTo(x + 30, 0); g.lineTo(x + 200, y + 120); g.lineTo(x - 200, y + 120); g.closePath(); g.fill(); g.restore();
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(x, y + 120, 170, 34, 0, 0, 7); g.fill();
    /* music stand */
    g.strokeStyle = '#151515'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, y + 115); g.lineTo(x, y - 30); g.moveTo(x - 50, y + 118); g.lineTo(x, y + 80); g.lineTo(x + 50, y + 118); g.stroke();
    g.save(); g.translate(x, y - 110); g.fillStyle = '#1b1b1b'; rr(g, -120, -70, 240, 150, 6); g.fill(); g.fillStyle = '#efe6d2'; rr(g, -108, -62, 216, 132, 4); g.fill();
    g.strokeStyle = 'rgba(40,30,20,.5)'; g.lineWidth = 2; for (let l = 0; l < 5; l++) { g.beginPath(); g.moveTo(-96, -40 + l * 12); g.lineTo(96, -40 + l * 12); g.stroke(); }
    txt(g, p, 0, 54, 34, '#2b2620', { f: SERIF, w: 700 }); g.restore();
    /* this part's beats: notes on a timeline, drifting off the common beat */
    const off = o.drift * [0.0, 0.35, -0.42, 0.22][i]; const by = 300;
    for (let b = 0; b < 4; b++) { const bx = x - 135 + b * 90 + off * 90 + Math.sin(o.t * 2 + i) * 6 * o.drift; g.fillStyle = Math.abs(off) < 0.05 ? GOLD : 'rgba(243,237,226,.85)'; g.beginPath(); g.ellipse(bx, by + 20, 14, 10, -0.4, 0, 7); g.fill(); g.fillRect(bx + 11, by - 34, 3.5, 54); }
  });
  /* the common beat: a metronome line of ticks across the top */
  for (let b = 0; b < 16; b++) { const bx = 195 + b * 105; g.fillStyle = 'rgba(241,197,109,.5)'; g.fillRect(bx - 1.5, 250, 3, 22); }
  txt(g, '节拍', 120, 270, 24, 'rgba(241,197,109,.7)', { w: 700, a: 'left' });
};

/* ================================================================ C · the radio that picks up voices */
export const radio = (g: G, o: { t: number; city?: number }) => {
  const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d1220'); bg.addColorStop(1, '#05070c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  /* window with night city */
  g.fillStyle = '#0a1426'; rr(g, 1180, 90, 560, 520, 8); g.fill(); setSeed(3); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,210,150,${0.2 + rnd() * 0.4})`; g.fillRect(1200 + rnd() * 520, 350 + rnd() * 240, 6, 9); } g.strokeStyle = '#2a2420'; g.lineWidth = 16; g.strokeRect(1180, 90, 560, 520); g.beginPath(); g.moveTo(1460, 90); g.lineTo(1460, 610); g.stroke();
  /* table */
  g.fillStyle = '#3b2818'; g.fillRect(0, 760, W, 320); g.fillStyle = 'rgba(255,220,170,.08)'; g.fillRect(0, 760, W, 6);
  /* the radio */
  const x = 760, y = 560; g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 20; g.fillStyle = '#6b4226'; rr(g, x - 380, y - 220, 760, 420, 60); g.fill(); g.restore();
  const wood = g.createLinearGradient(x - 380, 0, x + 380, 0); wood.addColorStop(0, '#5a3720'); wood.addColorStop(0.5, '#8a5a34'); wood.addColorStop(1, '#5a3720'); g.fillStyle = wood; rr(g, x - 370, y - 210, 740, 400, 54); g.fill();
  /* grille */
  g.fillStyle = '#2a1c12'; rr(g, x - 330, y - 170, 340, 320, 30); g.fill(); g.strokeStyle = 'rgba(200,160,110,.35)'; g.lineWidth = 3; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(x - 320, y - 150 + k * 22); g.lineTo(x, y - 150 + k * 22); g.stroke(); }
  /* dial window, glowing */
  glow(g, x + 190, y - 70, 260, '255,190,110', 0.45); g.fillStyle = '#f2c27a'; rr(g, x + 40, y - 150, 300, 150, 16); g.fill(); g.fillStyle = 'rgba(60,30,10,.8)'; for (let k = 0; k <= 10; k++) g.fillRect(x + 60 + k * 26, y - 120, 2, k % 5 ? 14 : 26); mono(g, '88  92  96  100  104  108', x + 190, y - 50, 18, 'rgba(60,30,10,.85)');
  const nx = x + 60 + ((Math.sin(o.t * 0.7) + 1) / 2) * 260; g.fillStyle = '#c0281c'; g.fillRect(nx, y - 140, 3, 120);
  /* knobs */
  [x + 110, x + 270].forEach((kx) => { g.fillStyle = '#2a1c12'; g.beginPath(); g.arc(kx, y + 90, 46, 0, 7); g.fill(); g.fillStyle = '#c9a66b'; g.beginPath(); g.arc(kx, y + 90, 34, 0, 7); g.fill(); g.strokeStyle = '#2a1c12'; g.lineWidth = 5; g.beginPath(); g.moveTo(kx, y + 90); g.lineTo(kx + 24, y + 70); g.stroke(); });
};
const voiceWave = (g: G, x: number, y: number, w: number, t: number, kind: number, col: string) => { g.strokeStyle = col; g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 200; i++) { const px = x + (i / 200) * w; const u = i / 200; const a = kind === 0 ? (Math.sin(i * 1.3 + t * 9) * 0.6 + (rnd() - 0.5) * 0.9) * 70 : kind === 1 ? Math.sin(i * 0.25 + t * 3) * Math.sin(i * 0.05) * 60 : Math.sin(i * 0.18 + t * 2) * 40 * (0.6 + 0.4 * Math.sin(i * 0.03)); i ? g.lineTo(px, y + a * Math.sin(Math.PI * u)) : g.moveTo(px, y); } g.stroke(); };

/* ================================================================ frames */
const A1 = (g: G) => { mirror(g, { split: 1 }); grain(g); vignette(g, 0.6); mark(g); subtitle(g, '电影里，精神分裂是：身体里住着两个人'); };
const A2 = (g: G) => { mirror(g, { split: 0, crack: 1 }); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H); txt(g, '《身体里的两个人》', 960, 500, 110, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.4)' }); txt(g, '精神分裂，到底分裂了什么？', 960, 600, 40, INK, { w: 700 }); grain(g); vignette(g, 0.6); };
const B1 = (g: G) => { orchestra(g, { drift: 0, t: 0 }); grain(g); vignette(g, 0.55); mark(g); subtitle(g, '他说的分裂，是心智的各个部分，彼此脱节'); };
const B2 = (g: G) => { orchestra(g, { drift: 1, t: 1 }); grain(g); vignette(g, 0.55); mark(g); subtitle(g, '看到的、听到的、想到的、感受到的，不再合拍'); };
const C1 = (g: G) => { radio(g, { t: 1 }); setSeed(5); voiceWave(g, 1160, 760 - 90, 0, 0, 0, 'rgba(0,0,0,0)'); g.save(); g.globalCompositeOperation = 'screen'; setSeed(8); voiceWave(g, 340, 250, 860, 1, 1, 'rgba(160,200,255,.8)'); g.restore(); grain(g); vignette(g, 0.55); mark(g); subtitle(g, '最常见的，是听见别人听不到的声音'); };
const C2 = (g: G) => { const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0d1220'); bg.addColorStop(1, '#05070c'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  const cities: [string, string, string, number, string][] = [['美国 · 加州', '刺耳、带威胁', '20人中，没有人以正面为主', 0, '229,83,63'], ['印度 · 金奈', '像长辈在叮嘱', '20人中，11人听到家人', 1, '241,197,109'], ['加纳 · 阿克拉', '大多是好的声音', '20人中，10人以正面为主', 2, '120,200,160']];
  cities.forEach(([c, d, n, k, col], i) => { const x = 330 + i * 630; g.fillStyle = 'rgba(255,255,255,.04)'; rr(g, x - 280, 200, 560, 560, 26); g.fill(); g.strokeStyle = `rgba(${col},.6)`; g.lineWidth = 2; rr(g, x - 280, 200, 560, 560, 26); g.stroke(); txt(g, c, x, 290, 44, INK, { w: 900 }); setSeed(11 + i); g.save(); g.globalCompositeOperation = 'screen'; voiceWave(g, x - 230, 450, 460, 1.2, k, `rgba(${col},.95)`); g.restore(); txt(g, d, x, 620, 40, `rgb(${col})`, { w: 700 }); txt(g, n, x, 690, 26, 'rgba(243,237,226,.7)', { w: 500 }); });
  txt(g, '斯坦福 · 三个城市、60位患者听到的声音', 960, 130, 30, 'rgba(243,237,226,.7)', { w: 700 }); grain(g); vignette(g, 0.5); mark(g); subtitle(g, '同一种病，声音却带着各自文化的口音'); };

export const LOOKS = [A1, A2, B1, B2, C1, C2];
export const Looks: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '电影里精神分裂是身体住着两个人《》到底了什么他说的心智各部分彼此脱节看见听思考感受想不再合拍节最常听别听不到声音美国加州刺耳带威胁中没有以正面为主印度金奈像长辈在叮嘱家加纳阿克拉大多好斯坦福三城市位患者同一种病却文化口';
    Promise.all([`700 68px ${SANS}`, `900 44px ${SANS}`, `500 26px ${SANS}`, `700 110px ${SERIF}`, `700 34px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); LOOKS[f](g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
