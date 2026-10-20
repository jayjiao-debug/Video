/* Douyin covers for 《妈，是我》: mum's table, the phone ringing with a 192 number, a two-line gold hook. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { G, GOLD, INK, SERIF, SANS, txt, glow, FONT_CHARS } from './lib';
import { withCam, mumTable, MUM_PHONE } from './desks';
import { ring } from './screens';

const gold = (g: G, s: string, x: number, y: number, size: number) => { g.save(); g.font = `700 ${size}px ${SERIF}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = size * 0.08; g.strokeStyle = 'rgba(0,0,0,.85)'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 30; g.strokeText(s, x, y); g.shadowBlur = 0;
  const gr = g.createLinearGradient(0, y - size, 0, y + 10); gr.addColorStop(0, '#fff0c4'); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, '#c8913a'); g.fillStyle = gr; g.shadowColor = 'rgba(241,197,109,.45)'; g.shadowBlur = 26; g.fillText(s, x, y); g.restore(); };

const draw = (g: G, W: number, H: number, tall: boolean) => {
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  g.save(); const px = tall ? 560 : 1080, py = tall ? 1030 : 560, s = tall ? 1.3 : 1.1; g.translate(px, py); g.rotate(-MUM_PHONE.r * 0.6); g.scale(s, s); g.translate(-MUM_PHONE.x, -MUM_PHONE.y);
  mumTable(g, { t: 1.2, screen: ring('192 **** 3721', '山东 济南', 0.3), glowA: 1.2, night: 0.35, buzz: 0.02 }); g.restore();
  /* darken toward the text side */
  const v = tall ? g.createLinearGradient(0, 0, 0, H) : g.createLinearGradient(0, 0, W, 0);
  v.addColorStop(0, 'rgba(5,6,10,.92)'); v.addColorStop(0.55, 'rgba(5,6,10,.55)'); v.addColorStop(1, 'rgba(5,6,10,.1)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
  const r = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.8); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = r; g.fillRect(0, 0, W, H);
  const x = tall ? W / 2 : 430, y0 = tall ? 270 : 400, size = tall ? 140 : 150;
  txt(g, '电话那头', x, y0 - (tall ? 150 : 170), tall ? 52 : 50, 'rgba(243,237,226,.85)', { w: 700 });
  gold(g, '是你的声音', x, y0, size);
  gold(g, '却不是你', x, y0 + size * 1.12, size);
  /* the tell-tale tag */
  g.save(); g.fillStyle = 'rgba(229,69,58,.18)'; g.strokeStyle = 'rgba(229,69,58,.95)'; g.lineWidth = 3; g.beginPath(); g.roundRect(x - 230, y0 + size * 1.12 + 50, 460, 64, 32); g.fill(); g.stroke(); g.restore();
  txt(g, '● 声音可被AI合成', x, y0 + size * 1.12 + 94, 34, '#ff9a8a', { w: 700 });
  /* title and series */
  const ty = tall ? y0 + size * 1.12 + 200 : H - 150;
  txt(g, '《妈，是我》', x, ty, tall ? 64 : 58, INK, { f: SERIF, w: 700 });
  txt(g, '— VIBE知识大赏 —', x, ty + 56, 28, 'rgba(243,237,226,.6)', { w: 500 });
  /* monogram, top corner */
  g.save(); g.strokeStyle = GOLD; g.lineWidth = 3; g.beginPath(); g.arc(W - 110, 110, 44, 0, 7); g.stroke(); g.restore(); txt(g, 'J', W - 112, 134, 62, GOLD, { f: SERIF });
};

export const Cover: React.FC<{ layout: 'wide' | 'tall' }> = ({ layout }) => {
  const tall = layout === 'tall'; const W = tall ? 1080 : 1440, H = tall ? 1440 : 1080;
  const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '电话那头是你的声音却不是可被AI合成妈我知识大赏十月星期二九月初拒绝接听山东济南';
    Promise.all([`700 150px ${SERIF}`, `700 52px ${SANS}`, `500 28px ${SANS}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; draw(g, W, H, tall); }, [ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
