import React from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, inOut } from '../lib';
import { Subtitle, YearStamp, Glow, Dust } from '../ui';
import { CanvasLayer, rnd, glowDot } from '../ep2/common';
import { STARS } from '../ep2/scenes1';
import { PeepFig } from '../v/scenesV';
import { Steam } from '../ep2/ink';
import { INK, CREAM, ROUGE, WARM, Suitcase, FoodBag, Train, Fu, Frame, IconBottle, IconSchoolbag, IconBike, IconCake, IconLetter } from './props';

/* ---------- cast ---------- */
export const MOM = { body: 'Sweater', face: 'Smile', hair: 'GrayBun' };
export const MOM_STAND = { body: 'RestingWB', face: 'Smile', hair: 'GrayBun' };
export const MOM_YOUNG = { body: 'Sweater', face: 'Smile', hair: 'Bun' };
export const DAD = { body: 'PoloSweater', face: 'Smile', hair: 'GrayShort', acc: 'GlassRoundThick' };
export const DAD_STAND = { body: 'ShirtPantsWB', face: 'Smile', hair: 'GrayShort', acc: 'GlassRoundThick' };
export const DAD_YOUNG = { body: 'PoloSweater', face: 'Smile', hair: 'Short', fh: 'MoustacheThin' };

const warmDefs = (
  <defs>
    <linearGradient id="warmIn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f6dfae" /><stop offset="0.7" stopColor="#e6b877" /><stop offset="1" stopColor="#c98f52" />
    </linearGradient>
    <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f3c98a" stopOpacity="0.55" /><stop offset="1" stopColor="#f3c98a" stopOpacity="0" />
    </linearGradient>
  </defs>
);

/* ---------- S01 · the doorway (own clock, 0 → 10.1) ---------- */
export const Intro3: React.FC<{ t: number }> = ({ t }) => {
  const fin = easeOut(prog(t, 0, 0.8));
  const out = 1 - easeInOut(prog(t, 9.45, 10.1));
  const dim = 1 - 0.3 * easeInOut(prog(t, 6.0, 6.8));
  const br = 0.9 + 0.08 * Math.sin(t * Math.PI * 0.6);
  const pp = easeOut(prog(t, 0.25, 1.1));
  const bag = easeOut(prog(t, 3.1, 3.7));
  return (
    <AbsoluteFill style={{ opacity: fin * out }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1a1d28 0%, #13151d 75%, #0d0e13 100%)' }} />
        <AbsoluteFill style={{ transform: 'translateY(-115px)' }}>
        <svg width={1920} height={1300} style={{ position: 'absolute', left: 0, top: 0 }}>
          {warmDefs}
          {/* hallway wall seams + floor */}
          {[260, 1330, 1640].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={905} stroke="#232737" strokeWidth={3} />)}
          <rect x={0} y={905} width={1920} height={400} fill="#0f1016" />
          <polygon points="560,905 1020,905 1320,1195 270,1195" fill="url(#spill)" opacity={br} />
          {/* interior */}
          <rect x={560} y={150} width={460} height={755} fill="url(#warmIn)" />
          <rect x={640} y={250} width={120} height={90} rx={4} fill="#d49c62" stroke={INK} strokeWidth={4} opacity={0.8} />
          <path d="M 790 150 L 790 205" stroke={INK} strokeWidth={4} />
          <path d="M 750 238 L 830 238 L 812 205 L 768 205 Z" fill={CREAM} stroke={INK} strokeWidth={4} />
          {/* frame */}
          <rect x={552} y={142} width={476} height={771} fill="none" stroke={INK} strokeWidth={22} />
          <rect x={552} y={142} width={476} height={771} fill="none" stroke="#6b4a30" strokeWidth={12} />
          {/* open door leaf with 福 */}
          <polygon points="1028,150 1170,110 1170,955 1028,905" fill="#5a3b24" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <polygon points="1046,190 1152,160 1152,470 1046,480" fill="none" stroke={INK} strokeWidth={3} opacity={0.6} />
          <g transform="translate(1099 360) scale(0.62)"><Fu /></g>
          <circle cx={1150} cy={560} r={9} fill="#d9a96a" stroke={INK} strokeWidth={3} />
          {/* door plate */}
          <rect x={1215} y={286} width={96} height={52} rx={6} fill={CREAM} stroke={INK} strokeWidth={4} />
          <text x={1263} y={324} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontWeight={600} fontSize={34} fill={INK}>302</text>
        </svg>
        <div style={{ opacity: pp, transform: `translateY(${(1 - pp) * 24}px)` }}>
          <PeepFig kind="stand" {...DAD_STAND} x={895} y={908} h={600} glow={false} />
          <PeepFig kind="stand" {...MOM_STAND} x={700} y={908} h={560} glow={false} />
        </div>
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          <g transform={`translate(630 ${772 + (1 - bag) * 20}) scale(0.95)`} opacity={bag}><FoodBag /></g>
        </svg>
        </AbsoluteFill>
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          {/* POV: your suitcase, close to camera */}
          <g transform="translate(240 1130) scale(1.6)"><Suitcase /></g>
        </svg>
      </AbsoluteFill>
      <Subtitle t={t} at={0.25} out={2.95} zh="国庆七天，一眨眼就过完了" />
      <Subtitle t={t} at={3.1} out={5.9} zh="临走前，妈又塞给你|一大袋吃的" />
      <Subtitle t={t} at={6.07} out={10.0} zh="你有没有算过：|以后，还能和爸妈待*多少天*？" />
    </AbsoluteFill>
  );
};

/* ---------- S02 · title (16.63 → 20.69) ---------- */
export const Title3: React.FC<{ t: number }> = ({ t }) => {
  const at = 16.63;
  const o = 1 - prog(t, 20.45, 20.8);
  const tp = easeOut(prog(t, at, at + 0.7));
  const glow = t < at ? 0 : Math.min(prog(t, at, at + 0.25), 1) * lerp(0.4, 0.15, easeOut(prog(t, at + 0.25, at + 2.2)));
  const sweep = lerp(-60, 160, easeInOut(prog(t, at + 0.05, at + 1.5)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={480} r={720} color="rgba(233,178,110,0.9)" opacity={glow} />
      <Dust t={t} at={at} cx={960} cy={480} seed="title3" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: easeOut(prog(t, at + 0.2, at + 0.8)) }}>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginRight: 22, opacity: 0.7 }} />
        <span style={{ fontFamily: ZH, fontSize: 30, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</span>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginLeft: 8, opacity: 0.7 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 370, textAlign: 'center', opacity: prog(t, at, at + 0.2),
        transform: `scale(${lerp(1.08, 1, tp)})`, filter: `blur(${(1 - tp) * 10}px)` }}>
        <span style={{ fontFamily: ZH, fontSize: 176, fontWeight: 900, letterSpacing: '0.1em',
          backgroundImage: `linear-gradient(105deg, ${C.paper} 0%, ${C.paper} ${sweep - 14}%, ${C.goldHi} ${sweep}%, ${C.paper} ${sweep + 14}%, ${C.paper} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>《还能见几次》</span>
      </div>
      {/* a row of days: the motif */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', gap: 14 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const p = easeOut(prog(t, beatAfter(at, 1) + i * 0.06, beatAfter(at, 1) + i * 0.06 + 0.3));
          return <div key={i} style={{ width: 26, height: 26, borderRadius: 4, background: i === 11 ? C.goldHi : 'rgba(235,228,210,0.85)', opacity: p * (i === 11 ? 1 : 0.8),
            transform: `translateY(${(1 - p) * 10}px)`, boxShadow: i === 11 ? '0 0 16px rgba(240,213,154,0.8)' : 'none' }} />;
        })}
      </div>
      <Subtitle t={t} at={at + 0.6} out={21} zh="一道关于陪伴的算术" y={760} size={72} band={false} />
    </AbsoluteFill>
  );
};

/* ---------- S03 · Tim Urban's notebook (20.69 → 26.77) ---------- */
export const Tim3: React.FC<{ t: number }> = ({ t }) => {
  const S = 20.69, E = 26.773;
  const o = Math.min(prog(t, S, S + 0.4), 1 - prog(t, E - 0.25, E + 0.1));
  const nb = easeOut(prog(t, S + 0.2, S + 0.9));
  const n = Math.floor(easeInOut(prog(t, S + 1.0, E - 0.6)) * 93);
  const cell = (k: number) => ({ x: -225 + (k % 10) * 46, y: -150 + Math.floor(k / 10) * 36 });
  const pen = cell(Math.max(0, n - 1));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #181b26 0%, #12141c 100%)' }} />
      <YearStamp t={t} at={S} out={E - 0.2} year="2015" place="美国 · 作家的书桌" />
      <Glow x={1300} y={520} r={620} color="rgba(233,178,110,0.8)" opacity={0.16} />
      <div style={{ opacity: easeOut(prog(t, S + 0.3, S + 1.0)), transform: `translateY(${(1 - easeOut(prog(t, S + 0.3, S + 1.1))) * 30}px)` }}>
        <PeepFig body="Paper" face="Calm" hair="ShortScratch" acc="GlassRound" x={520} y={860} h={500} />
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <g transform={`translate(1290 ${500 + (1 - nb) * 30}) rotate(-4)`} opacity={nb} strokeLinejoin="round" strokeLinecap="round">
          <rect x={-300} y={-250} width={600} height={500} rx={10} fill={CREAM} stroke={INK} strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-290} x2={290} y1={-200 + i * 36} y2={-200 + i * 36} stroke="#9fb3cc" strokeWidth={1.5} opacity={0.6} />)}
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-240 + i * 60} cy={-250} r={10} fill="none" stroke={INK} strokeWidth={4} />)}
          <text x={0} y={-176} textAnchor="middle" fontFamily="Ma Shan Zheng, serif" fontSize={44} fill={INK}>和爸妈在一起的日子</text>
          {Array.from({ length: 100 }, (_, k) => {
            const c = cell(k);
            return <rect key={k} x={c.x} y={c.y} width={30} height={26} rx={3} fill={k < n ? '#e8a54a' : 'none'} stroke={INK} strokeWidth={2.5} opacity={k < n ? 0.95 : 0.55} />;
          })}
          {n > 0 && n < 93 && (
            <g transform={`translate(${pen.x + 30} ${pen.y + 22}) rotate(35)`}>
              <rect x={0} y={-6} width={120} height={12} rx={4} fill={ROUGE} stroke={INK} strokeWidth={3} />
              <path d="M 0 -6 L -18 0 L 0 6 Z" fill={CREAM} stroke={INK} strokeWidth={3} />
            </g>
          )}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 790, height: 290, background: 'linear-gradient(180deg, #3a2818 0px, #3a2818 16px, #1c140d 16px, #120d09 100%)' }} />
      <Subtitle t={t} at={S + 0.2} out={23.6} zh="2015年，美国作家蒂姆·厄班|算了一笔账" />
      <Subtitle t={t} at={23.75} out={E - 0.1} zh="他算的不是钱，|是和爸妈在一起的日子" />
    </AbsoluteFill>
  );
};

/* ---------- S04 · childhood: every square is a day (26.77 → 40.94) ---------- */
const GX0 = 930, GY0 = 250, CS = 5, CP = 6, BW = 20, BH = 19, BG = 16;
export const blockXY = (k: number) => ({ x: GX0 + (k % 6) * (BW * CP + BG), y: GY0 + Math.floor(k / 6) * (BH * CP + BG) });
const ICONS: [number, React.FC, number, number][] = [[1, IconBottle, 150, 300], [7, IconSchoolbag, 730, 270], [10, IconBike, 170, 640], [16, IconCake, 740, 640], [18, IconLetter, 450, 150]];

export const Childhood3: React.FC<{ t: number }> = ({ t }) => {
  const S = 26.773, E = 40.937;
  const o = Math.min(prog(t, S, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const yr = Array.from({ length: 18 }, (_, k) => beatAfter(S + 0.5, k));
  const age = yr.filter((y) => t >= y + 0.4).length;
  const fillOf = (k: number) => Math.floor(easeOut(prog(t, yr[k], yr[k] + 0.4)) * 365);
  const days = Array.from({ length: 18 }, (_, k) => fillOf(k)).reduce((a, b) => a + b, 0);
  const warm = easeInOut(prog(t, 37.4, 38.4));
  const lbl = easeOut(prog(t, S + 0.2, S + 0.8));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={1330} y={440} r={640} color="rgba(233,178,110,0.9)" opacity={0.08 + warm * 0.2} />
      {/* young parents in a frame */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <g transform="translate(450 420)"><Frame w={460} h={330} /></g>
      </svg>
      <div style={{ position: 'absolute', left: 220, top: 255, width: 460, height: 330, overflow: 'hidden' }}>
        <PeepFig {...MOM_YOUNG} x={150} y={345} h={300} glow={false} />
        <PeepFig {...DAD_YOUNG} x={315} y={345} h={320} glow={false} />
      </div>
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {ICONS.map(([a, I, x, y], i) => {
          const at = yr[a - 1] + 0.3;
          if (t < at) return null;
          const s = spring({ frame: (t - at) * 30, fps: 30, config: { damping: 11, stiffness: 140 } });
          return <g key={i} transform={`translate(${x} ${y}) scale(${0.85 * s}) rotate(${(i % 2 ? 8 : -8)})`}><I /></g>;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 220, width: 460, top: 640, textAlign: 'center', opacity: lbl }}>
        <div style={{ fontFamily: ZH, fontSize: 34, color: C.paper, opacity: 0.8, letterSpacing: '0.1em' }}>你的年龄</div>
        <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 96, color: C.goldHi, lineHeight: 1.1 }}>{age}<span style={{ fontFamily: ZH, fontSize: 52, marginLeft: 8 }}>岁</span></div>
      </div>
      {/* the grid */}
      <div style={{ position: 'absolute', left: GX0, width: 6 * BW * CP + 5 * BG, top: 170, textAlign: 'center', opacity: lbl, fontFamily: ZH, fontSize: 40, color: C.paper, letterSpacing: '0.06em' }}>
        每一格 = 和爸妈在一起的<span style={{ color: C.goldHi }}>一天</span>
      </div>
      <CanvasLayer t={t} draw={(ctx) => {
        for (let k = 0; k < 18; k++) {
          const b = blockXY(k);
          ctx.strokeStyle = 'rgba(235,228,210,0.12)';
          ctx.lineWidth = 1;
          ctx.strokeRect(b.x - 3, b.y - 3, BW * CP + 5, BH * CP + 5);
          const f = fillOf(k);
          for (let c = 0; c < f; c++) {
            const x = b.x + (c % BW) * CP, y = b.y + Math.floor(c / BW) * CP;
            ctx.fillStyle = `rgba(${warm > 0 ? '240,213,154' : '235,228,210'},${0.78 + 0.2 * warm})`;
            ctx.fillRect(x, y, CS, CS);
          }
        }
      }} />
      <div style={{ position: 'absolute', left: GX0, width: 6 * BW * CP + 5 * BG, top: 650, textAlign: 'center', opacity: lbl }}>
        <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 84, color: C.goldHi }}>≈ {days.toLocaleString('en-US')}</span>
        <span style={{ fontFamily: ZH, fontSize: 44, color: C.paper, marginLeft: 12 }}>天</span>
      </div>
      <Subtitle t={t} at={S + 0.2} out={30.4} zh="从出生到18岁，|你几乎每天都和爸妈在一起" />
      <Subtitle t={t} at={30.55} out={33.9} zh="上学、吃饭、写作业、挨骂……" />
      <Subtitle t={t} at={34.05} out={37.3} zh="18年，加起来大约*6,500天*" />
      <Subtitle t={t} at={37.45} out={E - 0.1} zh="那时候觉得，|这样的日子没有尽头" />
    </AbsoluteFill>
  );
};

/* ---------- S05 · the train out (40.94 → 49.04) ---------- */
export const Train3: React.FC<{ t: number }> = ({ t }) => {
  const S = 40.937, E = 49.041;
  const o = Math.min(prog(t, S, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const tx = lerp(-1900, 2100, prog(t, S + 0.2, E + 0.6));
  const stat = easeOut(prog(t, 44.25, 44.9));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #121828 0%, #1a2032 60%, #10131b 100%)' }} />
      <CanvasLayer t={t} draw={(ctx) => { for (let i = 0; i < 260; i++) { const s = STARS[i]; glowDot(ctx, s.x, s.y * 0.55 - 40, s.r, s.a * 0.75, '235,228,210', 3); } }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <circle cx={1580} cy={180} r={46} fill="#efe1b8" opacity={0.9} />
        <path d="M 0 560 Q 300 470 620 540 T 1240 520 T 1920 540 L 1920 1080 L 0 1080 Z" fill="#171c2b" />
        <path d="M 0 640 Q 420 580 900 630 T 1920 610 L 1920 1080 L 0 1080 Z" fill="#12151f" />
        {/* viaduct */}
        <rect x={0} y={722} width={1920} height={14} fill={CREAM} stroke={INK} strokeWidth={4} />
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M ${i * 200 - 20} 736 L ${i * 200 - 20} 820 Q ${i * 200 + 80} 760 ${i * 200 + 180} 820 L ${i * 200 + 180} 736`} fill="none" stroke={CREAM} strokeWidth={6} opacity={0.35} />
        ))}
        <g transform={`translate(${tx} 722)`}><Train L={1700} /></g>
        {[180, 420, 1120, 1480, 1760].map((x, i) => (
          <g key={i}>{[0, 1, 2].map((k) => <rect key={k} x={x + k * 16} y={600 - (i % 2) * 20} width={7} height={10} fill={WARM} opacity={0.5} />)}</g>
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: stat, transform: `translateY(${(1 - stat) * 16}px)` }}>
        <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 150, color: C.goldHi, lineHeight: 1 }}>3.76<span style={{ fontFamily: ZH, fontSize: 96 }}>亿</span></div>
        <div style={{ fontFamily: ZH, fontSize: 44, color: C.paper, marginTop: 14, letterSpacing: '0.06em' }}>人生活在户籍地以外</div>
        <div style={{ fontFamily: ZH, fontSize: 28, color: C.dim, marginTop: 10, letterSpacing: '0.1em' }}>2020年 第七次全国人口普查</div>
      </div>
      <Subtitle t={t} at={S + 0.15} out={44.1} zh="后来，你去了外地|读书、工作" />
      <Subtitle t={t} at={44.25} out={E - 0.1} zh="和你一样离开家乡的，|全国约有*3.76亿*人" />
    </AbsoluteFill>
  );
};

export { rnd, Steam, inOut };
