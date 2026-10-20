/* 《最后一步》 gate: three looks × (hook frame, key frame) */
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { G, W, H, GOLD, INK, RED, SERIF, SANS, txt, mono, subtitle, mark, grain, vignette, glow, rr, FONT_CHARS, setSeed, rnd } from './lib';
import { livingRoom, phone, callScreen, transfer, caseFile } from './sets';

export const STEPS = ['说验证码', '点“是我本人”', '开屏幕共享', '下载App', '转账', '刷脸'];
export const stepCards = (g: G, y: number, a = 1, hi = -1, n = 6) => {
  const cw = 270, gap = 22, x0 = 960 - (STEPS.length * cw + (STEPS.length - 1) * gap) / 2;
  STEPS.forEach((s, i) => { if (i >= n) return; const x = x0 + i * (cw + gap); g.save(); g.globalAlpha = a; g.fillStyle = i === hi ? 'rgba(120,20,14,.92)' : 'rgba(12,10,9,.88)'; rr(g, x, y, cw, 150, 16); g.fill(); g.strokeStyle = i === hi ? RED : 'rgba(243,237,226,.35)'; g.lineWidth = 2; rr(g, x + 6, y + 6, cw - 12, 138, 12); g.stroke(); g.restore();
    mono(g, String(i + 1), x + 34, y + 52, 30, 'rgba(243,237,226,.5)', { f: SERIF, alpha: a }); txt(g, s, x + cw / 2, y + 102, s.length > 5 ? 30 : 36, INK, { w: 700, alpha: a }); });
};
const dark = (g: G) => { const b = g.createRadialGradient(960, 540, 100, 960, 540, 1100); b.addColorStop(0, '#2a2119'); b.addColorStop(1, '#0a0806'); g.fillStyle = b; g.fillRect(0, 0, W, H); setSeed(2); for (let i = 0; i < 26; i++) glow(g, rnd() * W, rnd() * H, 40 + rnd() * 90, rnd() < 0.5 ? '255,190,120' : '255,220,170', 0.05 + rnd() * 0.06); };

const A1 = (g: G) => { livingRoom(g, { lamp: 1, ring: 1, t: 0.3, dusk: 0.7 }); grain(g); vignette(g, 0.5); mark(g); subtitle(g, '一位70岁的老人，接到一个“客服”电话'); };
const A2 = (g: G) => { livingRoom(g, { lamp: 1, ring: 0, t: 0.3, dusk: 0.85 }); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, 0, W, H); txt(g, '最后一步', 960, 300, 64, GOLD, { f: SERIF, w: 700, glow: 'rgba(241,197,109,.4)' }); stepCards(g, 380); mark(g); subtitle(g, '开场白不一样，[最后一步]都一样'); };
const B1 = (g: G) => { dark(g); phone(g, 960, 470, 0.78, callScreen(0.2), { tilt: -0.04 }); grain(g); vignette(g); mark(g); subtitle(g, '对方说：您的账户有异常，要配合处理'); };
const B2 = (g: G) => { dark(g); phone(g, 960, 470, 0.78, transfer(3, { x: 290, y: 560 }), { tilt: -0.04 }); grain(g); vignette(g); mark(g); subtitle(g, '骗子正在远程，输入转账{验证码}'); };
const C1 = (g: G) => { caseFile(g); g.save(); g.translate(1560, 820); g.rotate(0.05); g.fillStyle = '#f6efe0'; g.fillRect(-170, -70, 340, 150); txt(g, '两张银行卡', 0, -12, 30, '#3a332b', { w: 700 }); mono(g, '1421万', 0, 56, 64, '#b3261b', { f: SERIF }); g.restore(); grain(g); vignette(g); mark(g); subtitle(g, '他两张银行卡里，有1421万'); };
const C2 = (g: G) => { caseFile(g, { stamp: 1 }); g.fillStyle = 'rgba(8,6,4,.7)'; g.fillRect(0, 0, W, H);
  txt(g, '2025年 · 公安部', 960, 230, 34, 'rgba(243,237,226,.7)', { w: 700 });
  const tile = (x: number, big: string, l1: string, l2: string) => { g.fillStyle = 'rgba(243,237,226,.06)'; rr(g, x - 300, 300, 600, 420, 20); g.fill(); mono(g, big, x, 500, 150, GOLD, { f: SERIF, glow: 'rgba(241,197,109,.35)' }); txt(g, l1, x, 600, 40, INK, { w: 700 }); txt(g, l2, x, 660, 30, 'rgba(243,237,226,.6)', { w: 500 }); };
  tile(620, '25%', '刷单返利', '发案最多：占全部案件'); tile(1300, '40%', '虚假投资理财', '损失最大：约占全部损失');
  mark(g); subtitle(g, '去年，警方破获电诈案件25.8万起'); };

export const LOOKS = [A1, A2, B1, B2, C1, C2];
export const Looks: React.FC = () => {
  const f = useCurrentFrame(); const ref = useRef<HTMLCanvasElement>(null); const [h] = useState(() => delayRender('fonts')); const [ok, setOk] = useState(false);
  useEffect(() => { const s = FONT_CHARS + '一位岁的老人接到个客服电话开场白不样最后步都对方说您账户有异常要配合处理骗子正在远程输入转账验证码他两张银行卡里万去年警方破获电诈案件起公安部刷单返利发案最多占全部虚假投资理财损失大约说点是我本屏幕共享下载刷脸来未知号码挂断接听金额短信确认始将能看到你上所有内容包括密和拒绝允许案件卷宗信网络欺¥“”';
    Promise.all([`700 68px ${SANS}`, `900 68px ${SANS}`, `500 26px ${SANS}`, `700 64px ${SERIF}`].map((x) => document.fonts.load(x, s).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  useLayoutEffect(() => { if (!ok || !ref.current) return; const g = ref.current.getContext('2d')!; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); LOOKS[f](g); }, [f, ok]);
  return <AbsoluteFill style={{ background: '#000' }}><canvas ref={ref} width={W} height={H} /></AbsoluteFill>;
};
