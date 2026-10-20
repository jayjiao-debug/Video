/* 2D puppet model sheet: front, 3/4, profile (flat wooden cut-out) and the same figure as a 皮影 shadow puppet. */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender } from 'remotion';
import { G, W, H, SANS, SERIF, txt, glow, rr, FONT_CHARS } from './lib';
import { drawPuppet, View } from './Puppet2D';
import { chair2D } from './Puppet2DTest';
const draw = (g: G) => {
  g.fillStyle = '#0f1318'; g.fillRect(0, 0, W, H);
  txt(g, '木偶定妆照 · 2D', 60, 82, 40, '#e9e1d2', { w: 900, a: 'left' }); txt(g, '《身体里的两个人》 · 平面木片 + 销钉关节 · 动作来自 CMU 动作捕捉', 400, 80, 24, 'rgba(233,225,210,.6)', { w: 500, a: 'left' });
  const panels: [string, number, 'wood' | 'shadow'][] = [['正面', 0, 'wood'], ['3/4 侧', -0.55, 'wood'], ['侧面', -1.45, 'wood'], ['皮影版本', -1.45, 'shadow']];
  panels.forEach(([lbl, yaw, skin], i) => {
    const x0 = 50 + i * 460, y0 = 120, pw = 440, ph = 820;
    if (skin === 'shadow') { const s = g.createRadialGradient(x0 + pw / 2, y0 + ph / 2, 40, x0 + pw / 2, y0 + ph / 2, 520); s.addColorStop(0, '#f6c98a'); s.addColorStop(1, '#a8622c'); g.fillStyle = s; } else { const s = g.createLinearGradient(0, y0, 0, y0 + ph); s.addColorStop(0, '#1d2530'); s.addColorStop(1, '#151a20'); g.fillStyle = s; }
    rr(g, x0, y0, pw, ph, 14); g.fill();
    g.save(); rr(g, x0, y0, pw, ph, 14); g.clip();
    if (skin === 'wood') glow(g, x0 + 80, y0 + 200, 420, '255,180,110', 0.18);
    const view: View = { cx: x0 + pw / 2 + (yaw < -1 ? 90 : yaw < 0 ? 50 : 0), gy: y0 + ph - 110, s: 400, yaw };
    if (skin === 'wood') { g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(view.cx + 30, view.gy + 4, 170, 18, 0, 0, 7); g.fill(); chair2D(g, view); }
    else { /* the chair as a carved leather piece */ g.save(); g.globalAlpha = 0.9; chair2D(g, view); g.restore(); }
    drawPuppet(g, 1.0, view, skin);
    g.restore();
    txt(g, lbl, x0 + 24, y0 + ph - 26, 30, skin === 'shadow' ? '#3a1a0c' : 'rgba(233,225,210,.9)', { w: 900, a: 'left' });
  });
  txt(g, '浅木 · 胡桃木销钉关节 · 黄铜钉 · 冷灰蓝场景 + 一盏暖灯　|　皮影：镂空皮革，背光暖幕', 60, 1010, 24, 'rgba(233,225,210,.55)', { w: 500, a: 'left' });
};
export const Puppet2DSheet: React.FC = () => { const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('f')); const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([`900 40px ${SANS}`, `500 24px ${SANS}`].map((x) => document.fonts.load(x, FONT_CHARS + '木偶定妆照平面片销钉关节动作来自捕捉身体里的两个人正面侧皮影版本浅胡桃黄铜冷灰蓝场景一盏暖灯镂空革背光幕').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; draw(ref.current.getContext('2d')!); }, [ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>; };
