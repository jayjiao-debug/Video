import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ZH, SANS, MONO, EN, INK, DIM, GOLD, SILVER, BRONZE, RED, FPS, clamp, prog, easeOut, easeInOut, lerp, hit, rnd } from './lib';
import { Fonts, Hall, GLOW, Podium, Car, CARS } from './Frames';
import { CornerMark } from './brand/CornerMark';
import { JUNO } from './brand/identity';
import { SUBS } from './subs';
import music from './music.json';

/* 《谁会拿诺奖》 — the film. The owner's track from 0:00, uncut. Title on B16 (8.47), Pakes on the break (49.17),
   "who will win" on the build (65.45), the guess lands on the drop (81.40), end card drop + 3 bars, end drop + 7 bars.
   Every frame is a pure function of T. Shots cut ~0.15 s before their line and dissolve in over 0.3 s. */

export const EV = music.events as Record<string, number>;
const BEAT = music.beat as number;
export const FILM_END = EV.end;
export const FILM_FRAMES = Math.round(FILM_END * FPS);
const TITLE = EV.title, TITLE_OUT = TITLE + 3.55, DROP = EV.drop, END_CARD = EV.endcard;

const strip = (s: string) => s.replace(/[[\]{}]/g, '');
const at = (frag: string) => { const l = SUBS.find(([, , s]) => strip(s).includes(frag)); if (!l) throw new Error(frag); return l[0]; };
const L = {
  athey: at('苏珊·阿西'), clark: at('克拉克奖'), auction: at('网上拍卖'), rule: at('规则怎么定'), tower: at('科技公司'),
  blundell: at('布伦德尔'), tax: at('政府加税'), forms: at('天然实验'), hours: at('没想象中多'), report: at('税制改革'),
  pakes: at('呼声最高'), car: at('一辆车'), old: at('旧模型'), blp: at('BLP'), merge: at('反垄断'),
  who: at('谁会赢'), years: at('2020年'), y14: at('2014年'), guess: at('我们猜'), maybe: at('三个都不是'),
};
const vis = (T: number, a: number, z: number, fi = 0.25, fo = 0.25) => Math.min(easeOut(prog(T, a, a + fi)), 1 - prog(T, z - fo, z));
const nextBeat = (t: number) => { const b = (music.beats as number[]).find((x) => x >= t - 0.02); return b ?? t; };

/* ---------------------------------------------------------------- subtitles */
const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>{s.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((seg, i) => seg.startsWith('[') ? <span key={i} style={{ color: GOLD, fontWeight: 900 }}>{seg.slice(1, -1)}</span>
    : seg.startsWith('{') ? <span key={i} style={{ color: RED, fontWeight: 900 }}>{seg.slice(1, -1)}</span> : <span key={i}>{seg}</span>)}</>
);
const Subtitles: React.FC<{ T: number }> = ({ T }) => {
  const cur = SUBS.find(([a, z]) => T >= a - 0.05 && T < z + 0.1);
  if (!cur) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 972, textAlign: 'center', opacity: Math.min(easeOut(prog(T, cur[0] - 0.05, cur[0] + 0.12)), 1 - prog(T, cur[1], cur[1] + 0.1)) }}>
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 68, color: INK, letterSpacing: '0.03em', textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)', fontVariantNumeric: 'lining-nums' }}>
        <Rich s={cur[2].replace(/[。，；：、——]+$/, '')} />
      </span>
    </div>
  );
};

/* ---------------------------------------------------------------- cold open: the envelope on the lectern */
const Envelope: React.FC<{ T: number; open?: number }> = ({ T, open = 0 }) => {
  const push = 1 + 0.07 * easeInOut(prog(T, 0, TITLE));
  const pod = easeOut(prog(T, 4.7, 6.2));
  const glow = 22 + 26 * pod + 30 * hit(T, TITLE, 0.4);
  const sec = Math.floor(T); // the second hand ticks on its own clock, not the music
  return (
    <AbsoluteFill style={{ background: '#05060c', transform: `scale(${push})`, transformOrigin: '960px 560px' }}>
      <Hall floorY={840} spots={[{ x: 960, w: 300, a: 0.6 + 0.3 * easeOut(prog(T, 0, 1.2)), warm: true }]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="lect" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2016" /><stop offset="1" stopColor="#0c0906" /></linearGradient>
          <linearGradient id="env" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe9b5" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8742c" /></linearGradient>
        </defs>
        {[[560, 210], [960, 300], [1360, 150]].map(([x, h], i) => <rect key={i} x={x - 180} y={840 - h * pod} width={360} height={h * pod} fill="#141a2c" opacity={0.75} />)}
        <polygon points="800,600 1120,600 1080,840 840,840" fill="url(#lect)" />
        <polygon points="770,575 1150,575 1120,600 800,600" fill="#3a2c1c" />
        <rect x={930} y={640} width={60} height={60} rx={30} fill="none" stroke={GOLD} strokeOpacity={0.35} strokeWidth={3} />
        <g transform="translate(960 548) rotate(-4)" style={{ filter: `drop-shadow(0 0 ${glow}px ${GLOW})` }}>
          <rect x={-150} y={-46} width={300} height={92} rx={6} fill="url(#env)" />
          {/* the flap opens for the title */}
          <polygon points={`-150,-46 0,${lerp(10, -110, open)} 150,-46`} fill={open > 0 ? '#e9c27a' : 'none'} stroke="#8a5d22" strokeWidth={3} />
          {open < 0.5 && <><circle cx={0} cy={10} r={17} fill="#8c1c1c" /><circle cx={0} cy={10} r={9} fill="none" stroke="#c74a3a" strokeWidth={2} /></>}
        </g>
        <g transform="translate(1560 250)">
          <circle r={110} fill="#0d1120" stroke="rgba(243,237,226,0.5)" strokeWidth={5} />
          {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={Math.sin(a) * 88} y1={-Math.cos(a) * 88} x2={Math.sin(a) * 100} y2={-Math.cos(a) * 100} stroke={INK} strokeWidth={i % 3 ? 3 : 6} />; })}
          <line x1={0} y1={0} x2={Math.sin((11.75 / 12) * Math.PI * 2) * 58} y2={-Math.cos((11.75 / 12) * Math.PI * 2) * 58} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <line x1={0} y1={0} x2={-86} y2={0} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={0} x2={Math.sin(((50 + sec) / 60) * Math.PI * 2) * 96} y2={-Math.cos(((50 + sec) / 60) * Math.PI * 2) * 96} stroke={RED} strokeWidth={2.5} />
          <circle r={9} fill={GOLD} />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 1450, width: 220, top: 380, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: DIM, letterSpacing: '0.15em' }}>STOCKHOLM</div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the gold title card, out of the envelope */
const MotifPodium: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <svg width={240 * s} height={70 * s} viewBox="-120 -60 240 70">
    {[[-70, 34, 0.6], [0, 52, 1], [70, 22, 0.6]].map(([dx, h, o], i) => <rect key={i} x={dx - 30} y={-h} width={60} height={h} fill={GOLD} opacity={o} />)}
  </svg>
);
const TitleCard: React.FC<{ T: number }> = ({ T }) => {
  if (T < TITLE - 0.25 || T > TITLE_OUT) return null;
  const open = easeOut(prog(T, TITLE - 0.25, TITLE));
  const grow = easeOut(prog(T, TITLE, TITLE + 0.45));
  const out = easeInOut(prog(T, TITLE_OUT - 0.55, TITLE_OUT));
  const chars = [...'谁会拿诺奖'];
  const stamp = (i: number) => TITLE + 0.3 + i * BEAT / 2;
  const pour = nextBeat(stamp(4) + BEAT);
  return (
    <AbsoluteFill>
      <Envelope T={T} open={open} />
      <AbsoluteFill style={{ background: `rgba(3,4,8,${0.55 + 0.35 * grow})` }} />
      {/* the card rises from the envelope and fills the frame; at the end it falls back into its motif, which becomes the podium */}
      <div style={{ position: 'absolute', left: 960 - 560, top: 540 - 300, width: 1120, height: 600, borderRadius: 26,
        transform: `translate(0px, ${lerp(10, 0, grow)}px) scale(${lerp(0.26, 1, grow) * (1 - 0.25 * out)})`, transformOrigin: '50% 52%', opacity: 1 - out,
        background: 'linear-gradient(180deg, #14110c, #0a0907)', border: `3px solid ${GOLD}`, boxShadow: `0 0 ${60 + 60 * hit(T, pour, 0.5)}px ${GLOW}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 30, letterSpacing: '0.32em', color: GOLD, fontVariant: 'small-caps', opacity: easeOut(prog(T, TITLE + 0.2, TITLE + 0.5)) }}>economic sciences · stockholm · mmxxvi</div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 10 }}>
          {['《', ...chars, '》'].map((c, i) => {
            const k = i === 0 || i === 6 ? prog(T, stamp(0), stamp(0) + 0.12) : prog(T, stamp(i - 1), stamp(i - 1) + 0.12);
            const gold = prog(T, pour, pour + 0.4);
            return <span key={i} className={gold > 0.5 ? 'gold' : undefined} style={{ fontFamily: ZH, fontWeight: 900, fontSize: 138, opacity: k, color: gold > 0.5 ? undefined : INK,
              transform: `scale(${1 + 0.25 * (1 - easeOut(k))})`, display: 'inline-block' }}>{c}</span>;
          })}
        </div>
        <div style={{ marginTop: 12, opacity: easeOut(prog(T, pour, pour + 0.3)) }}><MotifPodium /></div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: INK, marginTop: 16, opacity: easeOut(prog(T, pour + 0.2, pour + 0.5)) }}>这三位，做了什么研究？</div>
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 30, color: DIM, marginTop: 6, opacity: easeOut(prog(T, pour + 0.3, pour + 0.6)) }}>Who will win the 2026 prize in economics?</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: '0.4em', color: 'rgba(241,197,109,0.7)', marginTop: 16, opacity: easeOut(prog(T, pour + 0.4, pour + 0.7)) }}>— {JUNO.series} —</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the research set pieces (animated) */
const Dark: React.FC<{ children: React.ReactNode; warm?: boolean; spot?: number }> = ({ children, warm, spot = 0.7 }) => (
  <AbsoluteFill style={{ background: '#05060c' }}>
    <Hall floorY={900} spots={[{ x: 960, w: 340, a: spot, warm }]} />
    {children}
  </AbsoluteFill>
);
const Medal: React.FC<{ t: number }> = ({ t }) => {
  const sw = 9 * Math.exp(-t / 0.9) * Math.sin(t * 4.2) * (t > 0 ? 1 : 0);
  const drop = easeOut(prog(t, 0, 0.5));
  const shine = prog(t, 0.6, 1.4);
  return (
    <Dark warm>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id="md" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset="0.3" stopColor={GOLD} /><stop offset="1" stopColor="#5a3c14" /></radialGradient>
          <clipPath id="mdc"><circle cx={960} cy={480} r={170} /></clipPath>
        </defs>
        <g transform={`translate(0 ${lerp(-500, 0, drop)}) rotate(${sw} 960 100)`}>
          <path d="M 900 100 L 960 330 L 1020 100" fill="none" stroke="#8c1c1c" strokeWidth={46} />
          <circle cx={960} cy={480} r={170} fill="url(#md)" style={{ filter: `drop-shadow(0 0 40px ${GLOW})` }} />
          <circle cx={960} cy={480} r={140} fill="none" stroke="#7a5420" strokeWidth={4} opacity={0.6} />
          <text x={960} y={505} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={84} fill="#3a2508">2007</text>
          <rect x={760 + 440 * shine} y={280} width={60} height={420} fill="#fff" opacity={0.35 * Math.sin(Math.PI * shine)} transform={`rotate(20 960 480)`} clipPath="url(#mdc)" />
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 48, color: INK, opacity: easeOut(prog(t, 0.4, 0.8)) }}>约翰·贝茨·克拉克奖</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 762, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DIM, letterSpacing: '0.2em', opacity: easeOut(prog(t, 0.6, 1)) }}>授予 40 岁以下、在美国工作的经济学家</div>
    </Dark>
  );
};
const BIDS = [3.2, 2.85, 2.4, 1.9, 1.75, 1.6, 1.4, 1.2, 1.05, 0.9, 0.8, 0.65, 0.55, 0.45, 0.4, 0.3];
const Auction: React.FC<{ t: number; ruleO: number }> = ({ t, ruleO }) => {
  const slots = [{ y: 390, b: 3.2, name: 'A 店 · 轻量跑鞋' }, { y: 520, b: 2.85, name: 'B 店 · 专业竞速' }, { y: 650, b: 2.4, name: 'C 店 · 学生特价' }];
  const typed = Math.min(2, Math.floor(t / 0.18));
  return (
    <AbsoluteFill style={{ background: '#04050b' }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs><radialGradient id="screen" cx="0.5" cy="0.35" r="0.6"><stop offset="0" stopColor="#1b2a4a" stopOpacity={0.9} /><stop offset="1" stopColor="#04050b" stopOpacity={0} /></radialGradient></defs>
        <rect width={1920} height={1080} fill="url(#screen)" />
        {/* all the bids rise at once; the losers settle below, dimmed */}
        {BIDS.slice(3).map((b, i) => {
          const col = i % 7, row = Math.floor(i / 7), x = 420 + col * 180 + (row ? 90 : 0), y = 856 + row * 72;
          const k = easeOut(prog(t, 0.45 + 0.04 * i, 0.85 + 0.04 * i)), lose = prog(t, 1.5, 1.9);
          const shown = b * clamp((t - 0.45) / 0.6);
          return (
            <g key={i} opacity={k * lerp(1, 0.5, lose)} transform={`translate(0 ${lerp(120, 0, k)})`}>
              <rect x={x - 66} y={y - 24} width={132} height={48} rx={24} fill="rgba(20,26,44,0.9)" stroke={lose > 0.5 ? 'rgba(200,210,240,0.3)' : GOLD} strokeWidth={2} />
              <text x={x} y={y + 10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={lose > 0.5 ? '#8f9abd' : INK}>¥{shown.toFixed(2)}</text>
              <line x1={x - 40} y1={y} x2={x + 40} y2={y} stroke="#8f9abd" strokeWidth={2} opacity={0.6 * lose} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', left: 460, width: 1000, top: 200, height: 112, borderRadius: 56, background: 'linear-gradient(180deg, rgba(36,44,70,0.95), rgba(18,22,38,0.95))', border: '2px solid rgba(243,237,226,0.3)',
        boxShadow: `0 0 ${60 + 60 * hit(t, 0.4, 0.4)}px rgba(90,130,220,0.3)`, display: 'flex', alignItems: 'center', paddingLeft: 44, gap: 26 }}>
        <svg width={48} height={48} viewBox="0 0 48 48"><circle cx={20} cy={20} r={13} fill="none" stroke={INK} strokeWidth={4} /><line x1={30} y1={30} x2={42} y2={42} stroke={INK} strokeWidth={5} strokeLinecap="round" /></svg>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, color: INK }}>{'跑鞋'.slice(0, typed)}</span>
        <span style={{ width: 4, height: 54, background: GOLD, marginLeft: -16, opacity: Math.floor(t * 2) % 2 ? 1 : 0.2 }} />
      </div>
      {slots.map((s, i) => {
        const k = easeOut(prog(t, 1.5 + i * 0.22, 1.85 + i * 0.22));
        return (
          <div key={i} style={{ position: 'absolute', left: 460, width: 1000, top: s.y, height: 104, borderRadius: 18, background: 'rgba(14,18,32,0.92)', border: `2px solid ${i === 0 ? GOLD : 'rgba(241,197,109,0.45)'}`,
            boxShadow: i === 0 ? `0 0 34px ${GLOW}` : 'none', display: 'flex', alignItems: 'center', padding: '0 34px', gap: 22, opacity: 0.25 + 0.75 * k }}>
            <span style={{ fontFamily: SANS, fontWeight: 900, fontSize: 24, color: '#1a1206', background: GOLD, borderRadius: 8, padding: '4px 12px' }}>广告位 {i + 1}</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: INK, flexGrow: 1, opacity: k, transform: `translateX(${lerp(60, 0, k)}px)` }}>{s.name}</span>
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 36, color: GOLD, opacity: k }}>¥{s.b.toFixed(2)}</span>
            <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 22, color: DIM, opacity: k }}>/ 每次点击</span>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 772, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: 'rgba(243,237,226,0.45)', opacity: prog(t, 1.6, 2) }}>其余出价 · 落选</div>
      {ruleO > 0 && <div style={{ position: 'absolute', left: 1490, top: 392, width: 330, padding: '18px 22px', borderRadius: 16, background: 'rgba(10,12,22,0.94)', border: `2px solid ${GOLD}`, fontFamily: SANS, color: INK, opacity: ruleO, transform: `translateX(${lerp(40, 0, ruleO)}px)` }}>
        <div style={{ fontSize: 22, letterSpacing: '0.25em', color: DIM, fontWeight: 700 }}>拍卖规则</div>
        <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>谁排第一？</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8, color: GOLD }}>谁付多少？</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, color: 'rgba(243,237,226,0.7)' }}>你先看到谁？</div>
      </div>}
    </AbsoluteFill>
  );
};
const Tower: React.FC<{ t: number }> = ({ t }) => {
  const lit = easeOut(prog(t, 0.6, 1.0));
  return (
    <Dark>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#101830" /><stop offset="1" stopColor="#1d2a4a" /></linearGradient></defs>
        <g transform={`translate(0 ${lerp(30, 0, easeOut(prog(t, 0, 0.6)))})`}>
          <polygon points="760,140 1160,190 1160,900 760,900" fill="url(#tw)" stroke="#2c3a60" strokeWidth={3} />
          {Array.from({ length: 14 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
            const g = r === 5 && c === 3, x = 790 + c * 52, y = 230 + r * 46;
            const tw = 0.06 + 0.12 * rnd(r * 7 + c) + 0.05 * Math.sin(t * (0.6 + rnd(r * 7 + c, 3)) + r);
            return <rect key={`${r}-${c}`} x={x} y={y} width={36} height={28} fill={g ? GOLD : '#9fb6d8'} opacity={g ? 0.15 + 0.85 * lit : tw} style={g ? { filter: `drop-shadow(0 0 ${16 * lit}px ${GLOW})` } : undefined} />;
          }))}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 1210, top: 440, padding: '14px 24px', borderRadius: 14, border: `2px solid ${GOLD}`, background: 'rgba(10,12,22,0.92)', fontFamily: SANS, color: INK, opacity: lit, transform: `translateX(${lerp(30, 0, lit)}px)` }}>
        <div style={{ fontSize: 36, fontWeight: 900 }}>微软 · 顾问首席经济学家</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: DIM, marginTop: 6 }}>6 年 · 最早的"科技经济学家"之一</div>
      </div>
    </Dark>
  );
};
const Payslip: React.FC<{ t: number; mode: 'tax' | 'hours' }> = ({ t, mode }) => {
  const flip = mode === 'tax' ? prog(t, 0.7, 0.9) : 1;
  const enter = easeOut(prog(t, 0, 0.45));
  return (
    <Dark>
      <div style={{ position: 'absolute', left: 520, top: 210, width: 520, height: 560, borderRadius: 16, background: '#f1ece2', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '36px 40px', fontFamily: SANS, color: '#1b1b20',
        transform: `rotate(-2deg) translateY(${mode === 'tax' ? lerp(60, 0, enter) : 0}px)`, opacity: mode === 'tax' ? enter : 1 }}>
        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '0.2em' }}>工资条</div>
        <div style={{ height: 3, background: '#1b1b20', margin: '14px 0 26px', opacity: 0.3 }} />
        {[['税前工资', mode === 'hours' ? `¥${Math.round(lerp(10000, 12000, easeOut(prog(t, 0.2, 1.0)))).toLocaleString('en-US')}` : '¥10,000'],
          ['税率', mode === 'tax' ? (flip > 0.5 ? '25%' : '20%') : '20%'], ['到手', mode === 'tax' ? (flip > 0.5 ? '¥7,500' : '¥8,000') : `¥${Math.round(lerp(8000, 9600, easeOut(prog(t, 0.2, 1.0)))).toLocaleString('en-US')}`]].map(([k, v], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 700, margin: '18px 0', color: i === 1 && mode === 'tax' && flip > 0.5 ? '#c0302a' : '#1b1b20',
            transform: i === 1 && mode === 'tax' ? `scale(${1 + 0.12 * hit(t, 0.8, 0.25)})` : undefined }}><span>{k}</span><span style={{ fontFamily: MONO }}>{v}</span></div>
        ))}
        <div style={{ position: 'absolute', bottom: 26, left: 40, fontSize: 22, color: 'rgba(27,27,32,0.5)' }}>示意数字</div>
      </div>
      <div style={{ position: 'absolute', left: 1200, top: 230, width: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 34, color: INK }}>{mode === 'tax' ? '工作时间' : '工资 vs 工时'}</div>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {mode === 'tax' ? (() => {
          const h = 280 + (t > 0.9 ? 22 * Math.sin((t - 0.9) * 2.4) * Math.exp(-(t - 0.9) / 2.5) : 0);
          return <>
            <rect x={1300} y={330} width={100} height={420} rx={10} fill="none" stroke="rgba(243,237,226,0.35)" strokeWidth={3} />
            <rect x={1300} y={750 - h} width={100} height={h} rx={10} fill={INK} opacity={0.8} />
            <text x={1350} y={430} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={90} fill={GOLD} opacity={prog(t, 1.0, 1.3)}>?</text>
          </>;
        })() : (() => {
          const w = 420 * easeOut(prog(t, 0.2, 1.0)), h = 190 * easeOut(prog(t, 0.9, 2.2));
          return <>
            <rect x={1220} y={750 - w} width={100} height={w} rx={10} fill={GOLD} opacity={0.9} />
            <rect x={1380} y={750 - h} width={100} height={h} rx={10} fill={INK} opacity={0.85} />
            <text x={1270} y={800} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={DIM}>工资</text>
            <text x={1430} y={800} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={DIM}>工时</text>
          </>;
        })()}
      </svg>
    </Dark>
  );
};
const Forms: React.FC<{ t: number }> = ({ t }) => (
  <Dark>
    {[0, 1, 2].map((i) => {
      const k = easeOut(prog(t, 0.1 + i * 0.35, 0.55 + i * 0.35));
      return (
        <div key={i} style={{ position: 'absolute', left: 600 + i * 230, top: 230 + i * 30, width: 420, height: 520, borderRadius: 12, background: i === 2 ? '#f6f1e6' : '#d8d2c4',
          transform: `translateX(${lerp(500, 0, k)}px) rotate(${lerp(12, -6 + i * 5, k)}deg)`, opacity: k, boxShadow: '0 16px 50px rgba(0,0,0,0.6)', padding: '30px 34px', fontFamily: SANS, color: '#1b1b20' }}>
          <div style={{ fontSize: 30, fontWeight: 900 }}>英国税表</div>
          <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6, color: '#7a2a20' }}>税改 {['①', '②', '③'][i]} · 198X</div>
          {Array.from({ length: 7 }, (_, n) => <div key={n} style={{ height: 14, background: '#1b1b20', opacity: 0.12, margin: '22px 0', width: `${60 + 35 * rnd(n, i)}%` }} />)}
        </div>
      );
    })}
    <div style={{ position: 'absolute', left: 260, top: 420, fontFamily: SANS, fontWeight: 900, fontSize: 40, color: INK, lineHeight: 1.5, opacity: easeOut(prog(t, 1.2, 1.6)) }}>改革前<br /><span style={{ color: GOLD }}>→</span> 改革后<br /><span style={{ fontSize: 28, color: DIM }}>同一批人，怎么变？</span></div>
  </Dark>
);
const Report: React.FC<{ t: number }> = ({ t }) => {
  const k = prog(t, 0, 0.55), y = -260 * (1 - easeOut(k)) + 18 * Math.sin(Math.PI * clamp((t - 0.55) / 0.25)) * (t > 0.55 && t < 0.8 ? 1 : 0);
  return (
    <Dark warm>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <polygon points="700,700 1220,700 1260,760 740,760" fill="#1c140c" />
        <g transform={`translate(0 ${y})`}>
          <rect x={720} y={420} width={480} height={280} fill="#2b4a6e" />
          <rect x={720} y={420} width={480} height={34} fill="#203a58" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1200} y1={430 + i * 30} x2={1240} y2={440 + i * 30} stroke="#e8e0cc" strokeWidth={6} />)}
          <polygon points="1200,420 1240,450 1240,730 1200,700" fill="#e8e0cc" />
          <text x={960} y={540} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={44} fill="#f1ece2">米尔利斯税制评论</text>
          <text x={960} y={598} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={GOLD} letterSpacing="0.15em">Mirrlees Review · 2011</text>
        </g>
      </svg>
    </Dark>
  );
};

/* ---------------------------------------------------------------- the cars */
const Cars: React.FC<{ T: number }> = ({ T }) => {
  const floor = 700, xs = [300, 640, 960, 1280, 1620], Lc = 270;
  const tagO = easeOut(prog(T, L.car + 0.3, L.car + 0.6)), buyers = easeOut(prog(T, L.car + 0.8, L.car + 1.3));
  const draw = easeInOut(prog(T, L.old - 0.05, L.old + 0.9));
  const mix = easeInOut(prog(T, L.blp + 0.2, L.blp + 1.4)); // 0 = old model (even), 1 = BLP (to the most similar)
  const merge = easeOut(prog(T, L.merge, L.merge + 0.6));
  const priceUp = easeOut(prog(T, L.merge + 0.9, L.merge + 1.3));
  return (
    <AbsoluteFill style={{ background: '#05060c' }}>
      <Hall floorY={floor} spots={[{ x: 300, w: 230, a: 0.8, warm: true }, { x: 640, w: 230, a: 0.4 + 0.4 * mix, warm: true }, { x: 960, w: 200, a: 0.35 }, { x: 1280, w: 200, a: 0.3 }, { x: 1620, w: 200, a: 0.25 }]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {Array.from({ length: 22 }, (_, i) => { const u = i / 21; return <line key={i} x1={960 + (u - 0.5) * 2200} y1={floor} x2={960 + (u - 0.5) * 5200} y2={1080} stroke="#fff" strokeOpacity={0.035} strokeWidth={2} />; })}
        {Array.from({ length: 36 }, (_, i) => <circle key={i} cx={300 + (rnd(i) - 0.5) * 210 + 4 * Math.sin(T * 1.3 + i)} cy={300 + rnd(i, 1) * 90 + 3 * Math.cos(T * 1.1 + i)} r={7} fill={INK} opacity={0.75 * buyers * (1 - merge)} />)}
        {CARS.map((c, i) => {
          if (i === 0 || draw <= 0) return null;
          const f = lerp(0.42, c.flow, mix), w = 2 + 26 * f, gold = mix > 0.6 && c.flow > 0.9;
          const d = `M 330 330 C ${430 + i * 60} ${170 - i * 18}, ${xs[i] - 120} ${200 - i * 10}, ${xs[i]} ${floor - Lc * 0.62}`;
          return <path key={i} d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} fill="none" stroke={gold ? GOLD : '#e9e2d0'} strokeOpacity={(0.3 + 0.7 * f) * (1 - merge)}
            strokeWidth={w} strokeLinecap="round" style={{ filter: gold ? `drop-shadow(0 0 12px ${GLOW})` : 'none' }} />;
        })}
        {CARS.map((c, i) => <g key={i} transform={merge > 0 && i < 2 ? `translate(${(i === 0 ? 1 : -1) * 40 * merge} 0)` : undefined}><Car x={xs[i]} y={floor} L={Lc} k={c.k} col={c.col} id={`fc${i}`} /></g>)}
        {merge > 0 && <g opacity={merge}>
          <rect x={160} y={560} width={620} height={170} rx={18} fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray="14 10" />
        </g>}
      </svg>
      <div style={{ position: 'absolute', left: 190, top: 420, padding: '8px 18px', borderRadius: 12, background: 'rgba(14,16,26,0.92)', border: `2px solid ${RED}`, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: INK,
        opacity: tagO * (1 - merge), transform: `scale(${1 + 0.2 * hit(T, L.car + 0.3, 0.25)})` }}>价格 <span style={{ color: RED }}>↑ 10%</span></div>
      {CARS.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: xs[i] - 150, width: 300, top: floor + 28, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 34,
          color: i === 1 && mix > 0.6 ? GOLD : i === 0 ? RED : 'rgba(243,237,226,0.7)' }}>{i === 0 ? '这辆涨价' : i === 1 && mix > 0.6 ? '最像的轿车' : ['', '轿车', '两厢车', 'SUV', '皮卡'][i]}</div>
      ))}
      <div style={{ position: 'absolute', left: 1180, top: 150, padding: '10px 22px', borderRadius: 12, border: `2px solid ${mix > 0.5 ? GOLD : 'rgba(243,237,226,0.4)'}`, fontFamily: SANS, fontWeight: 900, fontSize: 34,
        color: mix > 0.5 ? GOLD : INK, background: 'rgba(14,16,26,0.9)', opacity: draw * (1 - merge) }}>{mix > 0.5 ? 'BLP（1995）：跑向最像的' : '旧模型：按份额平分'}</div>
      {merge > 0 && <>
        <div style={{ position: 'absolute', left: 160, width: 620, top: 160, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 40, color: INK, opacity: merge }}>
          <span style={{ border: '2px solid rgba(243,237,226,0.5)', borderRadius: 12, padding: '8px 18px' }}>甲公司</span>
          <span style={{ color: GOLD, margin: '0 18px' }}>＋</span>
          <span style={{ border: '2px solid rgba(243,237,226,0.5)', borderRadius: 12, padding: '8px 18px' }}>乙公司</span>
        </div>
        <div style={{ position: 'absolute', left: 300, width: 340, top: 280, textAlign: 'center', padding: '8px 0', borderRadius: 12, background: 'rgba(14,16,26,0.92)', border: `2px solid ${GOLD}`, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: GOLD, opacity: priceUp,
          transform: `translateY(${lerp(20, 0, priceUp)}px)` }}>合并后：价格 ↑ ？</div>
      </>}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- drop, back row, end card */
const Burst: React.FC<{ T: number }> = ({ T }) => {
  const k = easeOut(prog(T, DROP, DROP + 0.5)), punch = 1 + 0.06 * hit(T, DROP, 0.25);
  return (
    <AbsoluteFill style={{ background: '#05060c' }}>
      <Hall floorY={900} spots={[{ x: 960, w: 420, a: 1, warm: true }]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(960 470) scale(${lerp(0.5, 1, k)}) rotate(${(T - DROP) * 3}) translate(-960 -470)`}>
          {Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return <line key={i} x1={960 + Math.cos(a) * 330} y1={470 + Math.sin(a) * 210} x2={960 + Math.cos(a) * 980} y2={470 + Math.sin(a) * 640} stroke={GOLD} strokeWidth={3 + 5 * rnd(i)} opacity={(0.12 + 0.25 * rnd(i, 2)) * k} />; })}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 560, width: 800, top: 260, height: 420, borderRadius: 28, background: 'linear-gradient(180deg, rgba(30,26,18,0.96), rgba(12,10,8,0.96))', border: `4px solid ${GOLD}`, boxShadow: `0 0 ${120 + 100 * hit(T, DROP, 0.5)}px ${GLOW}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, transform: `scale(${lerp(0.7, 1, k) * punch})` }}>
        <div className="gold" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 120 }}>帕克斯</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.2em', color: INK }}>ARIEL PAKES</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DIM }}>哈佛大学 · 产业组织</div>
      </div>
    </AbsoluteFill>
  );
};
const BackRow: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <Podium lit={[0.4, 0.75, 0.4]} sub="" bare />
    {['迈克尔·伍德福德', '罗伯特·巴罗', '大卫·奥托', '恩斯特·费尔'].map((n, i) => {
      const k = easeOut(prog(t, 0.3 + i * 0.25, 0.7 + i * 0.25));
      return <div key={i} style={{ position: 'absolute', left: 150 + i * 440, top: 110, width: 300, height: 92, borderRadius: 14, border: '2px dashed rgba(243,237,226,0.3)', background: 'rgba(12,14,24,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 34, color: 'rgba(243,237,226,0.6)', opacity: k, transform: `translateY(${lerp(-20, 0, k)}px)` }}>{n}</div>;
    })}
  </AbsoluteFill>
);
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const ring = easeInOut(prog(t, 0, 0.8)), f = (a: number) => easeOut(prog(t, a, a + 0.4));
  return (
    <AbsoluteFill style={{ background: '#05060c' }}>
      <Hall floorY={900} spots={[{ x: 960, w: 360, a: 0.6, warm: true }]} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={960} cy={92} r={46} fill="none" stroke={GOLD} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 92)" />
        <text x={960} y={112} textAnchor="middle" fontFamily={EN} fontStyle="italic" fontWeight={700} fontSize={64} fill={GOLD} opacity={f(0.4)}>J</text>
        <text x={960} y={164} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={18} letterSpacing="0.5em" fill={GOLD} opacity={0.8 * f(0.6)}>JUNO</text>
      </svg>
      <div className="gold" style={{ position: 'absolute', left: 0, right: 0, top: 196, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 96, opacity: f(0.5) }}>《谁会拿诺奖》</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 316, display: 'flex', justifyContent: 'center', opacity: f(0.8) }}><MotifPodium s={0.9} /></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', gap: 28, opacity: f(1.0) }}>
        {[['苏珊·阿西', BRONZE], ['理查德·布伦德尔', SILVER], ['阿里尔·帕克斯', GOLD]].map(([n, c], i) => (
          <div key={i} style={{ padding: '14px 30px', borderRadius: 14, border: `2px solid ${c}`, fontFamily: ZH, fontWeight: 900, fontSize: 38, color: c }}>{n}</div>
        ))}
        <div style={{ padding: '14px 30px', borderRadius: 14, border: '2px dashed rgba(243,237,226,0.4)', fontFamily: ZH, fontWeight: 900, fontSize: 38, color: 'rgba(243,237,226,0.6)' }}>其他人？</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 530, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: INK, opacity: f(1.3) }}>你觉得是谁？</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 622, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 36, color: DIM, opacity: f(1.5) }}>评论区说说你的理由 · 周一 11:45 揭晓</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 708, display: 'flex', justifyContent: 'center', opacity: f(1.8) }}>
        <div style={{ padding: '12px 36px', borderRadius: 40, border: `2px solid ${GOLD}`, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: GOLD }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 812, textAlign: 'center', fontFamily: SANS, fontSize: 20, color: 'rgba(243,237,226,0.4)', opacity: f(2.0) }}>
        资料：Athey & Ellison 2011 QJE · Blundell, Duncan & Meghir 1998 Econometrica · Berry, Levinsohn & Pakes 1995 Econometrica · Stanford GSB · IFS · nobelprize.org
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- the edit */
const lit = (T: number, from: [number, number, number], to: [number, number, number], a: number, d = 0.5): [number, number, number] => {
  const k = easeInOut(prog(T, a, a + d)); return [0, 1, 2].map((i) => lerp(from[i], to[i], k)) as [number, number, number];
};
const PodiumShot: React.FC<{ T: number }> = ({ T }) => {
  const AT: [number, number, number] = [0.3, 0.3, 1], BL: [number, number, number] = [1, 0.3, 0.3], PK: [number, number, number] = [0.3, 1, 0.3], ALL: [number, number, number] = [0.45, 0.45, 0.45];
  let l: [number, number, number] = ALL, dim = 0, zoom = 1;
  let years: { seat: number; y: string; good?: boolean; o?: number }[] = [];
  if (T < L.blundell - 0.2) l = lit(T, ALL, AT, TITLE_OUT - 0.1);
  else if (T < L.pakes - 0.2) l = lit(T, ALL, BL, L.blundell - 0.2);
  else if (T < L.who - 0.2) l = lit(T, ALL, PK, L.pakes - 0.2);
  else {
    l = lit(T, PK, [0.3, 0.6, 0.3], L.years); dim = (1 - prog(T, L.years, L.years + 0.5)) * 0.6 * easeOut(prog(T, L.who - 0.2, L.who + 0.3));
    const y1 = nextBeat(L.years + 0.6), y2 = nextBeat(L.years + 2.0), y3 = nextBeat(L.years + 3.2), y4 = nextBeat(L.y14 + 1.6);
    years = [{ seat: 2, y: '2020', o: prog(T, y1, y1 + 0.15) }, { seat: 0, y: '2021', o: prog(T, y2, y2 + 0.15) }, { seat: 0, y: '2023', o: prog(T, y3, y3 + 0.15) }];
    if (T >= L.y14) { l = lit(T, [0.3, 0.6, 0.3], [0.2, 1, 0.2], L.y14); years.push({ seat: 1, y: '2014', good: true, o: prog(T, y4, y4 + 0.15) }); }
    zoom = 1 + 0.35 * easeInOut(prog(T, L.guess, DROP));
  }
  return <Podium lit={l} dimAll={dim} years={years.filter((y) => (y.o ?? 1) > 0)} zoom={zoom} sub="" bare />;
};

type Shot = { a: number; z: number; el: (T: number) => React.ReactNode };
const SHOTS: Shot[] = [
  { a: 0, z: TITLE - 0.2, el: (T) => <Envelope T={T} /> },
  { a: TITLE_OUT - 0.5, z: L.clark - 0.15, el: (T) => <PodiumShot T={T} /> },
  { a: L.clark - 0.15, z: L.auction - 0.15, el: (T) => <Medal t={T - (L.clark - 0.15)} /> },
  { a: L.auction - 0.15, z: L.tower - 0.15, el: (T) => <Auction t={T - (L.auction - 0.15)} ruleO={easeOut(prog(T, L.rule, L.rule + 0.35))} /> },
  { a: L.tower - 0.15, z: L.blundell - 0.15, el: (T) => <Tower t={T - (L.tower - 0.15)} /> },
  { a: L.blundell - 0.15, z: L.tax - 0.15, el: (T) => <PodiumShot T={T} /> },
  { a: L.tax - 0.15, z: L.forms - 0.15, el: (T) => <Payslip t={T - (L.tax - 0.15)} mode="tax" /> },
  { a: L.forms - 0.15, z: L.hours - 0.15, el: (T) => <Forms t={T - (L.forms - 0.15)} /> },
  { a: L.hours - 0.15, z: L.report - 0.15, el: (T) => <Payslip t={T - (L.hours - 0.15)} mode="hours" /> },
  { a: L.report - 0.15, z: L.pakes - 0.15, el: (T) => <Report t={T - (L.report - 0.15)} /> },
  { a: L.pakes - 0.15, z: L.car - 0.15, el: (T) => <PodiumShot T={T} /> },
  { a: L.car - 0.15, z: L.who - 0.15, el: (T) => <Cars T={T} /> },
  { a: L.who - 0.15, z: DROP, el: (T) => <PodiumShot T={T} /> },
  { a: DROP, z: L.maybe - 0.1, el: (T) => <Burst T={T} /> },
  { a: L.maybe - 0.1, z: END_CARD, el: (T) => <BackRow t={T - (L.maybe - 0.1)} /> },
  { a: END_CARD, z: FILM_END + 1, el: (T) => <EndCard t={T - END_CARD} /> },
];

export const Film: React.FC = () => {
  const T = useCurrentFrame() / FPS;
  const markO = (1 - vis(T, TITLE - 0.25, TITLE_OUT, 0.15, 0.3)) * (1 - prog(T, END_CARD, END_CARD + 0.4));
  return (
    <AbsoluteFill style={{ background: '#05060c' }}>
      <Fonts />
      {SHOTS.map((s, i) => {
        if (T < s.a - (i ? 0.3 : 0) || T >= s.z) return null;
        const o = i === 0 || s.a === DROP ? 1 : easeInOut(prog(T, s.a - 0.3, s.a));
        return <AbsoluteFill key={i} style={{ opacity: o }}>{s.el(T)}</AbsoluteFill>;
      })}
      <TitleCard T={T} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 80% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)' }} />
      <AbsoluteFill style={{ opacity: 0.05 }}><Img src={staticFile('grain0.png')} style={{ width: '100%', height: '100%' }} /></AbsoluteFill>
      <CornerMark o={markO} />
      <Subtitles T={T} />
    </AbsoluteFill>
  );
};
