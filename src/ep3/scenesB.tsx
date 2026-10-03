import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp } from '../lib';
import { Subtitle, Glow } from '../ui';
import { CanvasLayer } from '../ep2/common';
import { PeepFig } from '../v/scenesV';
import { Steam } from '../ep2/ink';
import { INK, CREAM, ROUGE, WARM, NoodleCup, Bowl, Dish, Chopsticks } from './props';
import { MOM, DAD, blockXY } from './scenesA';

/* ---------- S06 · the video call (breakdown 49.04 → 63.20) ---------- */
export const Call3: React.FC<{ t: number }> = ({ t }) => {
  const S = 49.041, E = 63.2;
  const o = Math.min(prog(t, S - 0.25, S + 0.3), 1 - prog(t, E - 0.25, E + 0.1));
  const ph = easeOut(prog(t, S + 0.1, S + 0.9));
  const secs = Math.floor(t - S) + 23;
  const PX = 740, PY = 70, PW = 440, PH = 740;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #161926 0%, #11131b 100%)' }} />
      {/* rented room: small window with the city */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x={150} y={130} width={380} height={300} fill="#1c2438" stroke="#2a2f3f" strokeWidth={14} />
        <line x1={340} y1={130} x2={340} y2={430} stroke="#2a2f3f" strokeWidth={10} />
        {[[160, 300, 70], [235, 250, 60], [300, 320, 50], [350, 270, 70], [425, 310, 60], [480, 240, 45]].map(([x, y, w], i) => (
          <g key={i}><rect x={x} y={y} width={w} height={430 - y} fill="#141a2a" />
            {Array.from({ length: Math.floor((430 - y) / 26) * Math.floor(w / 18) }, (_, j) => {
              const cols = Math.floor(w / 18), r = Math.floor(j / cols), c = j % cols;
              return (j * 7 + i * 3) % 5 < 2 ? <rect key={j} x={x + 6 + c * 18} y={y + 8 + r * 26} width={7} height={11} fill={WARM} opacity={0.6} /> : null;
            })}</g>
        ))}
      </svg>
      {/* noodles on the desk */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g transform="translate(1400 812)"><NoodleCup /></g>
        <g transform="translate(1400 690)"><Steam t={t} period={2.4} /></g>
      </svg>
      {/* the phone */}
      <div style={{ position: 'absolute', left: PX, top: PY + (1 - ph) * 40, width: PW, height: PH, opacity: ph, borderRadius: 56, background: CREAM, border: `6px solid ${INK}`,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 120px rgba(255,214,150,0.12)' }}>
        <div style={{ position: 'absolute', left: 18, top: 18, right: 18, bottom: 18, borderRadius: 40, overflow: 'hidden', background: 'linear-gradient(180deg, #e7c48f 0%, #caa06c 100%)', border: `4px solid ${INK}` }}>
          {/* mum and dad squeezed into one frame — dad's forehead cut off */}
          <PeepFig {...DAD} x={265} y={790} h={660} glow={false} />
          <PeepFig body="Device" face="Smile" hair="GrayBun" x={130} y={790} h={470} glow={false} />
          {/* self view: just your ceiling light */}
          <div style={{ position: 'absolute', left: 16, top: 16, width: 96, height: 140, borderRadius: 14, background: '#2a2f3f', border: `3px solid ${INK}` }}>
            <div style={{ position: 'absolute', left: 30, top: 38, width: 36, height: 14, borderRadius: 7, background: '#f3e3b8', boxShadow: '0 0 20px rgba(243,227,184,0.8)' }} />
          </div>
          <div style={{ position: 'absolute', right: 16, top: 16, padding: '4px 12px', borderRadius: 14, background: 'rgba(27,23,20,0.55)', fontFamily: ZH, fontSize: 24, color: CREAM }}>
            视频通话 <span style={{ fontFamily: EN, fontWeight: 600 }}>12:{String(secs % 60).padStart(2, '0')}</span>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 26, display: 'flex', justifyContent: 'center', gap: 70 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: CREAM, border: `4px solid ${INK}` }} />
            <div style={{ width: 70, height: 70, borderRadius: 35, background: ROUGE, border: `4px solid ${INK}` }} />
            <div style={{ width: 70, height: 70, borderRadius: 35, background: CREAM, border: `4px solid ${INK}` }} />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 820, height: 260, background: 'linear-gradient(180deg, #3a2818 0px, #3a2818 14px, #1c140d 14px, #120d09 100%)' }} />
      <Subtitle t={t} at={S + 0.2} out={52.3} zh="现在，你一年回几次家？" />
      <Subtitle t={t} at={52.45} out={55.6} zh="春节一次，国庆一次" />
      <Subtitle t={t} at={55.75} out={58.9} zh="每次，住上四五天" />
      <Subtitle t={t} at={59.05} out={E - 0.1} zh="电话里，妈总说：|“家里都好，你忙你的”" />
    </AbsoluteFill>
  );
};

/* ---------- S07–S10 · the companionship equation (63.20 → 115.87) ---------- */
const B1 = 101.7, B2 = 105.75, D = 109.85, GAP = 79.412, R = 81.432, CMP = 85.5, BACK = 97.64;
const roll = (t: number, at: number, a: number, b: number) => Math.round(lerp(a, b, easeInOut(prog(t, at + 0.2, at + 1.1))));

const EqTerm: React.FC<{ n: React.ReactNode; label: string; o: number; hi?: number; flip?: number }> = ({ n, label, o, hi = 0, flip = 1 }) => (
  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity: o, transform: `translateY(${(1 - o) * 16}px)`, minWidth: 170 }}>
    <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 108, lineHeight: 1, color: hi > 0.5 ? C.goldHi : C.paper, transform: `scaleY(${flip})`,
      textShadow: hi > 0 ? `0 0 ${26 * hi}px rgba(240,213,154,${0.8 * hi})` : 'none' }}>{n}</div>
    <div style={{ fontFamily: ZH, fontSize: 34, color: C.paper, opacity: 0.8, marginTop: 14, letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ height: 4, width: 90, marginTop: 8, background: C.gold, opacity: hi * 0.9, borderRadius: 2 }} />
  </div>
);
const Op: React.FC<{ s: string; o: number }> = ({ s, o }) => (
  <div style={{ fontFamily: EN, fontSize: 70, color: C.dim, margin: '0 10px', opacity: o, alignSelf: 'flex-start', lineHeight: '108px' }}>{s}</div>
);

export const Equation3: React.FC<{ t: number }> = ({ t }) => {
  const S = 63.2, E = 115.87;
  const o = Math.min(prog(t, S - 0.1, S + 0.3), 1 - prog(t, E - 0.25, E + 0.1));
  const ap = [0, 1, 2, 3].map((k) => easeOut(prog(t, beatAfter(S + 0.25, k), beatAfter(S + 0.25, k) + 0.4)));
  const v1 = t < B1 + 0.5 ? 2 : 3, v2 = t < B2 + 0.5 ? 5 : 7;
  const f1 = t > B1 && t < B1 + 1 ? Math.abs(Math.cos(prog(t, B1, B1 + 1) * Math.PI)) : 1;
  const f2 = t > B2 && t < B2 + 1 ? Math.abs(Math.cos(prog(t, B2, B2 + 1) * Math.PI)) : 1;
  const total = t < B1 ? 300 : t < B2 ? roll(t, B1, 300, 450) : roll(t, B2, 450, 630);
  const blank = easeInOut(prog(t, D, D + 0.6));
  // phases
  const gapDim = 1 - 0.55 * easeInOut(prog(t, GAP, GAP + 0.4)) * (1 - prog(t, R, R + 0.2));
  const eqO = Math.min(1 - easeInOut(prog(t, GAP + 0.2, R)), 1) + easeOut(prog(t, BACK + 0.1, BACK + 0.8));
  const hero = Math.min(prog(t, R, R + 0.15), 1 - easeInOut(prog(t, CMP - 0.2, CMP + 0.3)));
  const heroTp = easeOut(prog(t, R, R + 0.7));
  const toCmp = easeInOut(prog(t, CMP, CMP + 0.9)) * (1 - easeInOut(prog(t, BACK, BACK + 0.8)));
  const toRef = easeInOut(prog(t, BACK, BACK + 0.8));
  const childO = easeOut(prog(t, CMP + 0.3, CMP + 1.1)) * (1 - easeInOut(prog(t, BACK, BACK + 0.6)));
  const barP = easeInOut(prog(t, 89.55, 90.6)) * (1 - easeInOut(prog(t, BACK, BACK + 0.5)));
  const nowGlow = easeInOut(prog(t, 93.6, 94.3));
  const hlStep = Math.floor((t - (BACK + 0.4)) / 0.5);
  const cellsO = 1 - easeInOut(prog(t, D, D + 0.5)) * 0.75;
  // cell layouts: build (step 22) → compare (step 6) → reframe (step 17)
  const L0 = { st: 22, cs: 18, x: 630, y: 440 }, L1 = { st: 6, cs: 5, x: 1380, y: 568 }, L2 = { st: 17, cs: 14, x: 705, y: 395 };
  const Lc = toRef > 0 ? { st: lerp(L1.st, L2.st, toRef), cs: lerp(L1.cs, L2.cs, toRef), x: lerp(L1.x, L2.x, toRef), y: lerp(L1.y, L2.y, toRef) }
    : { st: lerp(L0.st, L1.st, toCmp), cs: lerp(L0.cs, L1.cs, toCmp), x: lerp(L0.x, L1.x, toCmp), y: lerp(L0.y, L1.y, toCmp) };
  const colAt = (c: number) => 67.45 + c * 0.253;
  const rows = t < B1 ? 10 : t < B2 ? 15 : 21;
  const yearNow = 2026 + Math.max(0, Math.min(29, Math.floor((t - 67.45) / 0.253)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ opacity: gapDim }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center', fontFamily: ZH, fontSize: 34, color: C.gold, letterSpacing: '0.4em', opacity: ap[0] * Math.min(eqO, 1) }}>
          陪伴方程 · 示例
        </div>
        {/* equation row */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', opacity: Math.min(eqO, 1) }}>
          <EqTerm n={blank > 0.5 ? '?' : v1} label="每年回家（次）" o={ap[0]} hi={(t > B1 && t < B1 + 2.5 ? 1 : 0) + (hlStep === 0 && t < B1 ? 1 : 0) + blank} flip={f1} />
          <Op s="×" o={ap[1]} />
          <EqTerm n={blank > 0.5 ? '?' : v2} label="每次住（天）" o={ap[1]} hi={(t > B2 && t < B2 + 2.5 ? 1 : 0) + (hlStep === 1 && t < B1 ? 1 : 0) + blank} flip={f2} />
          <Op s="×" o={ap[2]} />
          <EqTerm n={blank > 0.5 ? '?' : 30} label="接下来（年）" o={ap[2]} hi={(hlStep === 2 && t < B1 ? 1 : 0) + blank} />
          <Op s="=" o={ap[3]} />
          <EqTerm n={t < BACK ? '?' : blank > 0.5 ? '?' : total} label="天" o={ap[3]} hi={t > BACK ? 1 : 0} />
        </div>
        {/* the cells */}
        <CanvasLayer t={t} opacity={cellsO} draw={(ctx) => {
          // childhood block for comparison
          if (childO > 0) {
            for (let k = 0; k < 18; k++) {
              const b0 = blockXY(k), bx = b0.x - 930 + 260, by = b0.y;
              ctx.fillStyle = `rgba(235,228,210,${0.55 * childO})`;
              for (let c = 0; c < 365; c++) ctx.fillRect(bx + (c % 20) * 6, by + Math.floor(c / 20) * 6, 5, 5);
            }
          }
          for (let c = 0; c < 30; c++) {
            const p = easeOut(prog(t, colAt(c), colAt(c) + 0.25));
            if (p <= 0) continue;
            for (let r = 0; r < rows; r++) {
              let a = p;
              const extra = r >= 10 ? (r < 15 ? prog(t, B1 + 0.3 + c * 0.025, B1 + 0.6 + c * 0.025) : prog(t, B2 + 0.3 + c * 0.025, B2 + 0.6 + c * 0.025)) : 1;
              a *= extra;
              if (a <= 0) continue;
              const x = Lc.x + c * Lc.st, y = Lc.y + (rows > 10 && toRef > 0.5 ? (20 - r) : (9 - r)) * Lc.st;
              const isNew = r >= 10;
              const glow = nowGlow * (1 - toRef);
              ctx.fillStyle = isNew ? `rgba(255,226,160,${a})` : `rgba(240,213,154,${a * (0.8 + 0.2 * glow)})`;
              ctx.fillRect(x, y, Lc.cs, Lc.cs);
            }
          }
        }} />
        {/* year ticker during the build */}
        <div style={{ position: 'absolute', left: 1330, top: 520, opacity: easeOut(prog(t, 67.4, 67.9)) * (1 - easeInOut(prog(t, 75.4, 76.2))), fontFamily: EN, fontWeight: 600, fontSize: 64, color: C.paper }}>
          {yearNow}<span style={{ fontFamily: ZH, fontSize: 30, marginLeft: 8, color: C.dim }}>年</span>
        </div>
        <div style={{ position: 'absolute', left: 630, width: 660, top: 676, display: 'flex', justifyContent: 'space-between', opacity: easeOut(prog(t, 67.4, 67.9)) * (1 - toCmp) * (1 - easeInOut(prog(t, 75.4, 76.2))),
          fontFamily: ZH, fontSize: 28, color: C.dim }}>
          <span>一年 10 天</span><span>……</span><span>第 30 年</span>
        </div>
        {/* comparison labels + bar */}
        <div style={{ position: 'absolute', left: 260, width: 810, top: 176, textAlign: 'center', opacity: childO, fontFamily: ZH, fontSize: 42, color: C.paper }}>
          18岁以前 <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 52 }}>≈ 6,570</span> 天
        </div>
        <div style={{ position: 'absolute', left: 1250, width: 440, top: 470, textAlign: 'center', opacity: childO, fontFamily: ZH, fontSize: 42, color: C.goldHi }}>
          18岁以后 <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 52 }}>≈ 300</span> 天
        </div>
        {barP > 0 && (
          <div style={{ position: 'absolute', left: 260, top: 690, width: 1400, height: 64, opacity: Math.min(1, barP * 1.5) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: 64, width: 1338 * barP, background: 'rgba(235,228,210,0.28)', borderRadius: '10px 0 0 10px' }}>
              <div style={{ position: 'absolute', left: 24, top: 10, fontFamily: ZH, fontSize: 36, color: C.paper, whiteSpace: 'nowrap' }}>已经过去 <span style={{ fontFamily: EN, fontWeight: 600 }}>95%</span></div>
            </div>
            <div style={{ position: 'absolute', left: 1342, top: 0, height: 64, width: 58, background: C.goldHi, borderRadius: '0 10px 10px 0', opacity: prog(barP, 0.9, 1),
              boxShadow: `0 0 ${10 + 30 * nowGlow}px rgba(240,213,154,${0.5 + 0.4 * nowGlow})` }} />
            <div style={{ position: 'absolute', left: 1270, top: -58, width: 200, textAlign: 'center', fontFamily: ZH, fontSize: 36, color: C.goldHi, opacity: prog(barP, 0.9, 1) }}>
              剩下 <span style={{ fontFamily: EN, fontWeight: 600 }}>5%</span>
            </div>
          </div>
        )}
      </AbsoluteFill>
      {/* the reveal */}
      {hero > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: hero,
          transform: `scale(${lerp(1.14, 1, heroTp)})`, filter: `blur(${(1 - easeOut(prog(t, R, R + 0.45))) * 14}px)` }}>
          <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 300, lineHeight: 1,
            backgroundImage: `linear-gradient(180deg, ${C.goldHi} 0%, ${C.gold} 60%, #9c7a3c 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>300</span>
          <span style={{ fontFamily: ZH, fontSize: 110, color: C.goldHi, marginLeft: 20 }}>天</span>
        </div>
      )}
      <Glow x={960} y={330} r={700} color="rgba(233,178,110,0.9)" opacity={hero * lerp(0.4, 0.12, easeOut(prog(t, R + 0.2, R + 2.4)))} />
      <Subtitle t={t} at={S + 0.2} out={67.3} zh="按这样算，接下来30年……" />
      <Subtitle t={t} at={67.45} out={71.3} zh="一年10天，又一年10天……" />
      <Subtitle t={t} at={71.45} out={R - 0.1} zh="加起来是——" />
      <Subtitle t={t} at={R + 0.9} out={CMP - 0.1} zh="30年，加起来还不到*一年*" />
      <Subtitle t={t} at={CMP + 0.15} out={89.4} zh="和18岁前的6,500天放在一起" />
      <Subtitle t={t} at={89.55} out={93.5} zh="你和爸妈在一起的日子，|大约*95%*已经过去了" />
      <Subtitle t={t} at={93.65} out={BACK - 0.05} zh="剩下的*5%*，就是现在" />
      <Subtitle t={t} at={BACK + 0.15} out={B1 - 0.1} zh="但这道算式里，|每一项都可以改" />
      <Subtitle t={t} at={B1 + 0.05} out={B2 - 0.1} zh="每年多回一次家：|多出*150天*" />
      <Subtitle t={t} at={B2 + 0.05} out={D - 0.1} zh="每次多住两天：|一共*630天*" />
      <Subtitle t={t} at={D + 0.05} out={E - 0.1} zh="你的数字是多少？|算出来，写在评论区" />
    </AbsoluteFill>
  );
};

/* ---------- S11 · dinner at home (texture 115.87 → 121.95) ---------- */
export const Dinner3: React.FC<{ t: number }> = ({ t }) => {
  const S = 115.87, E = 121.95;
  const o = Math.min(prog(t, S - 0.2, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const reach = easeInOut(prog(t, S + 0.4, S + 1.5));
  const back = easeInOut(prog(t, S + 1.9, S + 2.8));
  const drop = easeOut(prog(t, S + 1.5, S + 1.9));
  const cx = lerp(lerp(900, 520, reach), 900, back), cy = lerp(lerp(470, 610, reach), 470, back);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 30%, #4a3222 0%, #2a1c14 55%, #150e0a 100%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d="M 960 0 L 960 70" stroke={INK} strokeWidth={4} />
        <path d="M 880 120 L 1040 120 L 1005 70 L 915 70 Z" fill={CREAM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={960} cy={140} r={260} fill="rgba(255,220,160,0.10)" />
      </svg>
      <PeepFig {...MOM} face="Smile" x={800} y={560} h={400} />
      <PeepFig {...DAD} face="EatingHappy" x={1200} y={560} h={430} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {/* table */}
        <path d="M 220 520 L 1700 520 L 1920 1080 L 0 1080 Z" fill="#c9a574" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 220 520 L 1700 520 L 1716 546 L 204 546 Z" fill="#b08a5a" stroke={INK} strokeWidth={4} />
        <g transform="translate(1000 610)"><Dish kind="fish" w={300} /></g>
        <g transform="translate(1390 640)"><Dish kind="greens" w={220} /></g>
        <g transform="translate(760 620)"><Dish kind="pork" w={220} /></g>
        <g transform="translate(1250 720)"><Dish kind="eggs" w={210} /></g>
        <g transform="translate(1000 570)"><Steam t={t} period={2.2} /></g>
        <g transform="translate(760 585)"><Steam t={t + 0.7} period={2.6} /></g>
        {/* POV: your bowl */}
        <g transform="translate(470 790)"><Bowl w={300} food={drop} /></g>
        <g transform="translate(470 580)"><Steam t={t + 1.3} period={2.3} /></g>
        {/* mum's chopsticks */}
        <g transform={`translate(${cx} ${cy})`}>
          <g transform="rotate(-38)"><Chopsticks len={320} /></g>
          {drop < 0.05 && reach > 0.2 && <rect x={-24} y={-18} width={48} height={32} rx={8} fill="#9b4a2c" stroke={INK} strokeWidth={4} />}
        </g>
      </svg>
      <Subtitle t={t} at={S + 0.15} out={118.85} zh="这个数字，不是为了让你难过" />
      <Subtitle t={t} at={119.0} out={E - 0.1} zh="而是提醒你：|每一次回家，都很*珍贵*" />
    </AbsoluteFill>
  );
};

/* ---------- S12 · the call you make (final 121.95 → 130.5) ---------- */
export const Final3: React.FC<{ t: number }> = ({ t }) => {
  const S = 121.95, END = 130.5;
  const o = Math.min(prog(t, S - 0.2, S + 0.5), 1 - easeInOut(prog(t, 129.2, END)));
  const ph = easeOut(prog(t, S + 0.1, S + 0.9));
  const endO = easeOut(prog(t, 126.4, 127.2));
  const phDim = 1 - 0.55 * endO;
  const dots = Math.floor((t * 2) % 4);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #14161f 0%, #0f1016 100%)' }} />
      <Glow x={960} y={430} r={560} color="rgba(233,178,110,0.9)" opacity={0.18 * ph * phDim} />
      <div style={{ position: 'absolute', left: 760, top: 90 + (1 - ph) * 30, width: 400, height: 700, borderRadius: 52, background: CREAM, border: `6px solid ${INK}`, opacity: ph * phDim,
        boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ position: 'absolute', left: 16, top: 16, right: 16, bottom: 16, borderRadius: 38, overflow: 'hidden', background: 'linear-gradient(180deg, #2a3350 0%, #1a2032 100%)', border: `4px solid ${INK}` }}>
          <div style={{ position: 'absolute', left: 84, top: 90, width: 200, height: 200, borderRadius: 100, overflow: 'hidden', background: '#e7c48f', border: `5px solid ${INK}` }}>
            <PeepFig {...DAD} x={128} y={215} h={190} glow={false} />
            <PeepFig {...MOM} x={66} y={225} h={170} glow={false} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 320, textAlign: 'center', fontFamily: ZH, fontSize: 52, fontWeight: 600, color: C.paper }}>爸妈</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 392, textAlign: 'center', fontFamily: ZH, fontSize: 30, color: C.dim }}>正在呼叫{'·'.repeat(dots + 1)}</div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 44, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 90, height: 90, borderRadius: 45, background: ROUGE, border: `4px solid ${INK}` }} />
          </div>
        </div>
      </div>
      <Subtitle t={t} at={S + 0.3} out={126.3} zh="今晚，给爸妈打个电话吧" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 830, textAlign: 'center', opacity: endO }}>
        <div style={{ fontFamily: ZH, fontSize: 64, fontWeight: 700, color: C.paper, letterSpacing: '0.1em' }}>《还能见几次》</div>
        <div style={{ fontFamily: ZH, fontSize: 34, color: C.gold, marginTop: 16, letterSpacing: '0.3em' }}>算出你的数字，写在评论区</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, textAlign: 'center', opacity: endO * 0.8, fontFamily: ZH, fontSize: 26, color: C.dim, letterSpacing: '0.3em' }}>
        VIBE知识大赏 · 灵感来自 Tim Urban《The Tail End》
      </div>
    </AbsoluteFill>
  );
};

export { WARM };
