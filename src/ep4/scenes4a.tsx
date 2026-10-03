import React from 'react';
import { AbsoluteFill, spring } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp } from '../lib';
import { Subtitle, YearStamp, Glow, Dust } from '../ui';
import { PeepFig } from '../v/scenesV';
import { INK, CREAM, ROUGE, WARM } from '../ep3/props';
import { Coin, CoinStack, PlayCard, Avatar, STRATS } from './props4';

export const YOU = { body: 'Geek', face: 'Tired', hair: 'Bangs' };
const desk = (top = 790) => <div style={{ position: 'absolute', left: 0, right: 0, top, height: 1080 - top, background: 'linear-gradient(180deg, #3a2818 0px, #3a2818 16px, #1c140d 16px, #120d09 100%)' }} />;

/* ---------- S01 · group project (own clock 0 → 10.1) ---------- */
export const Intro4: React.FC<{ t: number }> = ({ t }) => {
  const fin = easeOut(prog(t, 0, 0.7));
  const out = 1 - easeInOut(prog(t, 7.45, 8.05));
  const bO = easeInOut(prog(t, 2.35, 2.85));
  const dim = 1 - 0.35 * easeInOut(prog(t, 5.0, 5.6));
  const sec = Math.floor(t * 1.5);
  return (
    <AbsoluteFill style={{ opacity: fin * out }}>
      <AbsoluteFill style={{ opacity: dim }}>
        {/* A: you, working late */}
        <AbsoluteFill style={{ opacity: 1 - bO }}>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, #181b26 0%, #12141c 100%)' }} />
          <Glow x={1180} y={640} r={560} color="rgba(255,214,150,0.9)" opacity={0.16} />
          <div style={{ position: 'absolute', left: 1330, top: 150, padding: '10px 26px', borderRadius: 12, background: '#0b0c10', border: `4px solid ${INK}`, fontFamily: EN, fontWeight: 600, fontSize: 64, color: '#e46b5c', letterSpacing: '0.08em', boxShadow: '0 0 30px rgba(228,107,92,0.25)' }}>
            02:{String(13 + Math.floor(sec / 60)).padStart(2, '0')}
          </div>
          <PeepFig {...YOU} x={820} y={930} h={600} />
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
            {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1200 + (i % 2) * 6} y={760 - i * 14} width={180} height={14} rx={2} fill={CREAM} stroke={INK} strokeWidth={3} transform={`rotate(${(i % 3) - 1} 1290 ${760 - i * 14})`} />)}
            <path d="M 1450 700 L 1530 700 L 1510 650 L 1470 650 Z" fill={ROUGE} stroke={INK} strokeWidth={4} />
            <line x1={1490} y1={700} x2={1490} y2={788} stroke={INK} strokeWidth={6} />
          </svg>
          {desk(790)}
        </AbsoluteFill>
        {/* B: someone else takes the credit */}
        <AbsoluteFill style={{ opacity: bO }}>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, #1b1e2a 0%, #13151d 100%)' }} />
          <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
            <rect x={300} y={120} width={720} height={440} rx={8} fill={CREAM} stroke={INK} strokeWidth={6} />
            <text x={660} y={190} textAnchor="middle" fontFamily="Noto Serif CJK SC, serif" fontWeight={700} fontSize={40} fill={INK}>小组项目汇报</text>
            {[[380, 120], [490, 200], [600, 160], [710, 260], [820, 300]].map(([x, h], i) => (
              <rect key={i} x={x} y={520 - h * easeOut(prog(t, 2.7 + i * 0.12, 3.2 + i * 0.12))} width={70} height={h * easeOut(prog(t, 2.7 + i * 0.12, 3.2 + i * 0.12))} fill={i === 4 ? '#e8b85a' : '#9fb3cc'} stroke={INK} strokeWidth={4} />
            ))}
            <circle cx={1180} cy={360} r={330} fill="rgba(255,226,170,0.10)" />
          </svg>
          <PeepFig kind="stand" body="PointingFingerBW" face="SmileBig" hair="ShortMessy" x={1180} y={900} h={640} flip />
          <PeepFig {...YOU} face="Concerned" x={170} y={930} h={380} glow={false} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 790, height: 290, background: '#121319' }} />
        </AbsoluteFill>
      </AbsoluteFill>
      <Subtitle t={t} at={0.15} out={2.4} zh="小组作业，你做得最多" />
      <Subtitle t={t} at={2.55} out={4.9} zh="汇报那天，功劳却成了别人的" />
      <Subtitle t={t} at={5.07} out={7.95} zh="做好人，|是不是注定*吃亏*？" />
    </AbsoluteFill>
  );
};

/* ---------- S02 · title (16.63 → 20.69) ---------- */
export const Title4: React.FC<{ t: number }> = ({ t }) => {
  const at = 16.63;
  const o = 1 - prog(t, 20.45, 20.8);
  const tp = easeOut(prog(t, at, at + 0.7));
  const glow = t < at ? 0 : Math.min(prog(t, at, at + 0.25), 1) * lerp(0.4, 0.15, easeOut(prog(t, at + 0.25, at + 2.2)));
  const sweep = lerp(-60, 160, easeInOut(prog(t, at + 0.05, at + 1.5)));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Glow x={960} y={480} r={720} color="rgba(201,164,92,0.9)" opacity={glow} />
      <Dust t={t} at={at} cx={960} cy={480} seed="title4" />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: easeOut(prog(t, at + 0.2, at + 0.8)) }}>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginRight: 22, opacity: 0.7 }} />
        <span style={{ fontFamily: ZH, fontSize: 30, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</span>
        <span style={{ display: 'inline-block', width: 70, height: 1, background: C.gold, verticalAlign: 'middle', marginLeft: 8, opacity: 0.7 }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 370, textAlign: 'center', opacity: prog(t, at, at + 0.2), transform: `scale(${lerp(1.08, 1, tp)})`, filter: `blur(${(1 - tp) * 10}px)` }}>
        <span style={{ fontFamily: ZH, fontSize: 176, fontWeight: 900, letterSpacing: '0.1em',
          backgroundImage: `linear-gradient(105deg, ${C.paper} 0%, ${C.paper} ${sweep - 14}%, ${C.goldHi} ${sweep}%, ${C.paper} ${sweep + 14}%, ${C.paper} 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>《好人会赢吗》</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 628, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {(['c', 'd'] as const).map((k, i) => {
          const p = easeOut(prog(t, beatAfter(at, 1 + i), beatAfter(at, 1 + i) + 0.35));
          return <div key={k} style={{ transform: `translateY(${(1 - p) * 20}px) rotate(${i ? 6 : -6}deg)`, opacity: p }}><PlayCard kind={k} w={70} /></div>;
        })}
      </div>
      <Subtitle t={t} at={at + 0.6} out={21} zh="一场程序之间的比赛" y={800} size={68} band={false} />
    </AbsoluteFill>
  );
};

/* ---------- S03–S04 · the game & the dilemma (20.69 → 40.94) ---------- */
const MX = 560, MY = 150, HC = 150, CW = 330, HR = 64, CH = 176;
const cellXY = (r: number, c: number) => ({ x: MX + HC + c * CW, y: MY + HR + r * CH });
export const Game4: React.FC<{ t: number }> = ({ t }) => {
  const S = 20.69, E = 40.937;
  const o = Math.min(prog(t, S, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const pp = easeOut(prog(t, S + 0.2, S + 0.9));
  const cardP = [0, 1].map((k) => easeOut(prog(t, beatAfter(23.45, k), beatAfter(23.45, k) + 0.35)));
  const mxO = easeOut(prog(t, 26.1, 26.7));
  const h1 = inRange(t, 26.35, 29.2), h2 = inRange(t, 29.25, 32.85), h3 = inRange(t, 32.9, 35.9);
  const cmp = easeOut(prog(t, 35.95, 36.6));
  const stamp = t >= 38.95 ? spring({ frame: (t - 38.95) * 30, fps: 30, config: { damping: 12, stiffness: 160 } }) : 0;
  // rows: you (C, D); cols: them (C, D). payoffs [you, them]
  const PAY = [[[3, 3], [0, 5]], [[5, 0], [1, 1]]];
  const lit = (r: number, c: number) => (r === 0 && c === 0 ? h1 : (r !== c ? h2 : r === 1 && c === 1 ? h3 : 0));
  const shown = (r: number, c: number) => t >= (r === 0 && c === 0 ? 26.35 : r !== c ? 29.25 : 32.9);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ opacity: pp }}>
        <PeepFig body="Shirt" face="Calm" hair="Bangs" x={270} y={760} h={400} />
        <PeepFig body="Shirt" face="Calm" hair="ShortWavy" x={1650} y={760} h={420} flip />
      </div>
      <div style={{ position: 'absolute', left: 170, width: 200, top: 280, textAlign: 'center', fontFamily: ZH, fontSize: 40, color: C.goldHi, opacity: pp }}>你</div>
      <div style={{ position: 'absolute', left: 1550, width: 200, top: 280, textAlign: 'center', fontFamily: ZH, fontSize: 40, color: C.paper, opacity: pp }}>对方</div>
      {/* cards before the matrix appears */}
      {mxO < 1 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 60, opacity: 1 - mxO }}>
          {(['c', 'd'] as const).map((k, i) => <div key={k} style={{ opacity: cardP[i], transform: `translateY(${(1 - cardP[i]) * 30}px) rotate(${i ? 5 : -5}deg)` }}><PlayCard kind={k} w={170} /></div>)}
        </div>
      )}
      {/* payoff matrix */}
      <div style={{ position: 'absolute', left: MX, top: MY, width: HC + 2 * CW, height: HR + 2 * CH, opacity: mxO, transform: `translateY(${(1 - mxO) * 20}px)` }}>
        <div style={{ position: 'absolute', left: HC, top: 0, width: CW, height: HR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ZH, fontSize: 32, color: C.paper }}>对方 <span style={{ color: CREAM, background: 'rgba(235,228,210,0.15)', padding: '0 10px', marginLeft: 8, borderRadius: 6 }}>合作</span></div>
        <div style={{ position: 'absolute', left: HC + CW, top: 0, width: CW, height: HR, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ZH, fontSize: 32, color: C.paper }}>对方 <span style={{ color: CREAM, background: ROUGE, padding: '0 10px', marginLeft: 8, borderRadius: 6 }}>背叛</span></div>
        {['合作', '背叛'].map((k, r) => (
          <div key={k} style={{ position: 'absolute', left: 0, top: HR + r * CH, width: HC, height: CH, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: ZH, fontSize: 32, color: C.goldHi }}>
            你<span style={{ color: CREAM, background: r ? ROUGE : 'rgba(235,228,210,0.15)', padding: '0 10px', marginTop: 6, borderRadius: 6, fontSize: 32, boxShadow: r && cmp > 0 ? `0 0 ${24 * cmp}px rgba(240,213,154,0.9)` : 'none' }}>{k}</span>
          </div>
        ))}
        {[0, 1].map((r) => [0, 1].map((c) => {
          const L = lit(r, c), sh = shown(r, c);
          return (
            <div key={`${r}${c}`} style={{ position: 'absolute', left: HC + c * CW, top: HR + r * CH, width: CW, height: CH, border: `3px solid ${INK}`, background: L > 0 ? 'rgba(240,213,154,0.18)' : 'rgba(235,228,210,0.06)',
              boxShadow: L > 0 ? 'inset 0 0 0 3px rgba(240,213,154,0.8)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 24px' }}>
              {sh && [0, 1].map((w) => (
                <div key={w} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: ZH, fontSize: 24, color: w ? C.paper : C.goldHi, opacity: 0.85 }}>{w ? '对方' : '你'}</div>
                  <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 76, lineHeight: 1, color: w ? C.paper : C.goldHi }}>{PAY[r][c][w]}</div>
                </div>
              ))}
            </div>
          );
        }))}
        {/* comparison arrows: in each column, 背叛 beats 合作 for you */}
        {cmp > 0 && [0, 1].map((c) => (
          <div key={c} style={{ position: 'absolute', left: HC + c * CW + 34, top: HR + CH - 36, width: 72, height: 72, borderRadius: 36, background: C.goldHi, border: `4px solid ${INK}`, opacity: cmp,
            transform: `scale(${lerp(0.6, 1, cmp)})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: EN, fontWeight: 700, fontSize: 30, color: INK }}>
            {c ? '1>0' : '5>3'}
          </div>
        ))}
      </div>
      {/* coins flying into the lit cell */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        {[[0, 0, 26.35, 3, 3], [1, 0, 29.25, 5, 0], [0, 1, 29.25, 0, 5], [1, 1, 32.9, 1, 1]].map(([r, c, at, a, b], i) => {
          const p = easeOut(prog(t, (at as number) + 0.2, (at as number) + 1.0));
          if (p <= 0 || i > 3) return null;
          const cx = cellXY(r as number, c as number);
          return (
            <g key={i} opacity={mxO}>
              <g transform={`translate(${cx.x + 70} ${cx.y + CH - 22})`}><CoinStack n={a as number} r={14} p={p} /></g>
              <g transform={`translate(${cx.x + CW - 70} ${cx.y + CH - 22})`}><CoinStack n={b as number} r={14} p={p} /></g>
            </g>
          );
        })}
      </svg>
      {stamp > 0 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 612, textAlign: 'center', transform: `scale(${lerp(1.5, 1, stamp)}) rotate(-3deg)`, opacity: Math.min(1, stamp) }}>
          <span style={{ display: 'inline-block', padding: '8px 28px', border: `5px solid ${ROUGE}`, borderRadius: 10, fontFamily: ZH, fontWeight: 900, fontSize: 56, color: ROUGE, letterSpacing: '0.2em', background: 'rgba(15,16,22,0.7)' }}>囚徒困境</span>
          <div style={{ fontFamily: ZH, fontSize: 26, color: C.dim, marginTop: 10 }}>1950年 · 美国兰德公司提出</div>
        </div>
      )}
      <Subtitle t={t} at={S + 0.15} out={23.3} zh="先看一个游戏：|两个人，各选一张牌" />
      <Subtitle t={t} at={23.45} out={26.2} zh="“合作”，还是“背叛”" />
      <Subtitle t={t} at={26.35} out={29.1} zh="都合作：各得*3分*" />
      <Subtitle t={t} at={29.25} out={32.75} zh="一个背叛、一个合作：|背叛的拿*5分*，老实人*0分*" />
      <Subtitle t={t} at={32.9} out={35.8} zh="都背叛：各得*1分*" />
      <Subtitle t={t} at={35.95} out={38.8} zh="不管对方选什么，|你选“背叛”都多拿分" />
      <Subtitle t={t} at={38.95} out={E - 0.1} zh="这就是“囚徒困境”" />
    </AbsoluteFill>
  );
};
const inRange = (t: number, a: number, b: number) => Math.min(easeOut(prog(t, a, a + 0.3)), 1 - prog(t, b - 0.2, b));

/* ---------- S05–S06 · Axelrod's tournament (40.94 → 63.20) ---------- */
const RING = (i: number) => {
  const a = (i / 14) * Math.PI * 2 - Math.PI / 2;
  return { x: 960 + Math.cos(a) * 560, y: 420 + Math.sin(a) * 285 };
};
export const Tourney4: React.FC<{ t: number }> = ({ t }) => {
  const S = 40.937, B = 49.041, E = 63.2;
  const o = Math.min(prog(t, S, S + 0.35), 1 - prog(t, E - 0.25, E + 0.1));
  const aO = 1 - easeInOut(prog(t, B - 0.3, B + 0.3));
  const r200 = easeOut(prog(t, 44.5, 45.3));
  const lines = easeInOut(prog(t, 52.6, 54.4));
  const hl = easeOut(prog(t, 55.75, 56.3)) * (1 - easeInOut(prog(t, 59.0, 59.5)));
  const win = easeOut(prog(t, 59.15, 59.9));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* part 1: Axelrod */}
      <AbsoluteFill style={{ opacity: aO }}>
        <YearStamp t={t} at={S} out={B} year="1980" place="美国 · 密歇根大学" />
        <PeepFig body="Explaining" face="Explaining" hair="Short" fh="Full" acc="GlassRound" x={560} y={860} h={500} />
        <div style={{ position: 'absolute', left: 1020, top: 250, width: 700, opacity: r200, transform: `translateY(${(1 - r200) * 20}px)` }}>
          <div style={{ fontFamily: ZH, fontSize: 40, color: C.paper, textAlign: 'center', marginBottom: 18 }}>同一个对手 · 连玩 <span style={{ fontFamily: EN, fontWeight: 600, fontSize: 64, color: C.goldHi }}>200</span> 轮</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(25, 1fr)', gap: 6 }}>
            {Array.from({ length: 200 }, (_, i) => <div key={i} style={{ height: 18, borderRadius: 3, background: i % 7 === 3 ? ROUGE : CREAM, opacity: prog(t, 44.6 + i * 0.012, 44.8 + i * 0.012) * 0.85 }} />)}
          </div>
        </div>
        {desk(790)}
      </AbsoluteFill>
      {/* part 2: the ring of 14 programs */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {lines > 0 && STRATS.map((_, i) => STRATS.map((__, j) => {
          if (j <= i) return null;
          const a = RING(i), b = RING(j), k = (i * 14 + j) / 196;
          const p = prog(lines, k * 0.6, k * 0.6 + 0.4);
          if (p <= 0) return null;
          return <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={lerp(a.x, b.x, p)} y2={lerp(a.y, b.y, p)} stroke={C.gold} strokeOpacity={0.22 * (1 - win * 0.6)} strokeWidth={1.5} />;
        }))}
      </svg>
      {STRATS.map((s, i) => {
        const at = beatAfter(B + 0.2, 0) + i * 0.25;
        const p = t >= at ? spring({ frame: (t - at) * 30, fps: 30, config: { damping: 13, stiffness: 150 } }) : 0;
        if (p <= 0) return null;
        const r = RING(i);
        const isHl = i === 3 || i === 4;
        const isW = i === 0;
        const sc = 1 + (isHl ? 0.25 * hl : 0) + (isW ? 0.45 * win : 0);
        const op = Math.min(1, p) * (isW ? 1 : 1 - 0.6 * win);
        return (
          <div key={i} style={{ position: 'absolute', left: 0, top: 0, transform: `translate(${r.x}px, ${r.y}px) scale(${sc * Math.min(1, p)})`, transformOrigin: '0 0' }}>
            <Avatar s={s} d={120} x={0} y={0} o={op} ring={isW && win > 0 ? C.goldHi : INK} glow={isW ? win : 0} label={s.name !== '' && (i < 6)} lsize={26} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: easeOut(prog(t, 52.45, 53.0)) * (1 - win), fontFamily: EN, fontWeight: 600, fontSize: 110, color: C.goldHi }}>
        14<span style={{ fontFamily: ZH, fontSize: 44, color: C.paper, marginLeft: 10 }}>个程序 · 两两对战</span>
      </div>
      <Subtitle t={t} at={S + 0.15} out={44.2} zh="1980年，政治学家阿克塞尔罗德|想知道一件事：" />
      <Subtitle t={t} at={44.35} out={B - 0.1} zh="如果这个游戏，|要和同一个人玩200轮呢？" />
      <Subtitle t={t} at={B + 0.15} out={52.3} zh="他请各路专家写程序，|来一场比赛" />
      <Subtitle t={t} at={52.45} out={55.6} zh="14个程序，两两对战，|每场200轮" />
      <Subtitle t={t} at={55.75} out={59.0} zh="有的永不原谅，|有的偷偷试探" />
      <Subtitle t={t} at={59.15} out={E - 0.1} zh="最后的冠军，|却是最简单的那一个" />
    </AbsoluteFill>
  );
};

export { WARM, Coin };
