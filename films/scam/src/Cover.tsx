/* Douyin covers for 《妈，是我》: mum's table, the phone ringing with a 192 number, a two-line gold hook. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { G, GOLD, INK, SERIF, SANS, txt, glow, FONT_CHARS } from './lib';
import { withCam, mumTable, MUM_PHONE } from './desks';
import { ring } from './screens';

const gold = (g: G, s: string, x: number, y: number, size: number) => { g.save(); g.font = `700 ${size}px ${SERIF}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = size * 0.08; g.strokeStyle = 'rgba(0,0,0,.85)'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 30; g.strokeText(s, x, y); g.shadowBlur = 0;
  const gr = g.createLinearGradient(0, y - size, 0, y + 10); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a'); g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.45)'; g.shadowBlur = 26; g.fillText(s, x, y); g.restore(); };

const punch = (g: G, s: string, x: number, y: number, size: number, fill: string | CanvasGradient, glitch = 0) => {
  g.save(); g.font = `900 ${size}px ${SANS}`; g.textAlign = 'center'; g.lineJoin = 'round';
  g.lineWidth = size * 0.16; g.strokeStyle = '#0b0b0e'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 40; g.shadowOffsetY = 10; g.strokeText(s, x, y); g.shadowColor = 'transparent';
  if (glitch) { g.globalCompositeOperation = 'screen'; g.fillStyle = 'rgba(255,40,70,.95)'; g.fillText(s, x - glitch, y - glitch * 0.3); g.fillStyle = 'rgba(40,230,255,.9)'; g.fillText(s, x + glitch, y + glitch * 0.3); g.globalCompositeOperation = 'source-over'; }
  g.fillStyle = fill; g.fillText(s, x, y); g.restore();
};
const draw = (g: G, W: number, H: number, tall: boolean) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  /* close on the ringing phone: the caller is "your son" */
  g.save(); const px = tall ? 600 : 1090, py = tall ? 1120 : 560, s = tall ? 1.7 : 1.55; g.translate(px, py); g.rotate(tall ? 0.1 : 0.08); g.scale(s, s); g.translate(-MUM_PHONE.x, -MUM_PHONE.y);
  mumTable(g, { t: 1.2, screen: ring('“儿子”', '192 **** 3721 · 山东济南', 0.25), glowA: 1.4, night: 0.1, buzz: 0.02 }); g.restore();
  /* an alarm-red rim around the phone and a cool bloom off its screen */
  glow(g, px, py, tall ? 760 : 720, '229,69,58', 0.32); glow(g, px, py - 60, 380, '160,200,255', 0.25);
  /* darken behind the words */
  const v = tall ? g.createLinearGradient(0, 0, 0, H * 0.62) : g.createLinearGradient(0, 0, W * 0.62, 0);
  v.addColorStop(0, 'rgba(6,6,10,.95)'); v.addColorStop(0.7, 'rgba(6,6,10,.75)'); v.addColorStop(1, 'rgba(6,6,10,0)'); g.fillStyle = v; g.fillRect(0, 0, tall ? W : W * 0.62, tall ? H * 0.62 : H);
  /* scanlines for the "fake voice" feel */
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < H; y += 5) g.fillRect(0, y, W, 2);
  const x = tall ? W / 2 : 480; const y1 = tall ? 230 : 360, sz1 = tall ? 158 : 160, sz2 = tall ? 138 : 132;
  /* line 1: the voice, glitched */
  punch(g, '“妈，是我”', x, y1, sz1, '#ffffff', tall ? 9 : 8);
  /* line 2: the twist, in gold */
  const gr = g.createLinearGradient(0, y1 + 40, 0, y1 + 40 + sz2); gr.addColorStop(0, '#fff3c8'); gr.addColorStop(0.5, '#f6c75e'); gr.addColorStop(1, '#d08f2c');
  punch(g, '是AI合成的', x, y1 + sz2 + 60, sz2, gr);
  /* the warning tag */
  const ty = y1 + sz2 + (tall ? 110 : 130); g.save(); g.fillStyle = '#e5453a'; g.shadowColor = 'rgba(229,69,58,.7)'; g.shadowBlur = 30; g.beginPath(); g.roundRect(x - 260, ty, 520, 78, 39); g.fill(); g.restore();
  txt(g, '⚠ 骗子在用你的声音', x, ty + 54, 40, '#fff', { w: 900 });
  txt(g, 'VIBE知识大赏 · 反诈', x, ty + (tall ? 128 : 140), 30, 'rgba(243,237,226,.75)', { w: 700 });
};

export const Cover: React.FC<{ layout: 'wide' | 'tall' }> = ({ layout }) => {
  const tall = layout === 'tall'; const W = tall ? 1080 : 1440, H = tall ? 1440 : 1080;
  const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '电话那头是你的声音却不是可被AI合成妈我知识大赏十月星期二九月初拒绝接听山东济南儿子骗在用反诈“”⚠';
    Promise.all([`900 190px ${SANS}`, `700 150px ${SERIF}`, `700 52px ${SANS}`, `500 28px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; draw(g, W, H, tall); }, [ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
