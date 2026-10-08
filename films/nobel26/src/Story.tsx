import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ZH, SANS, MONO, INK, DIM, GOLD, BRONZE, RED, rnd } from './lib';
import { Fonts, Finish, Sub, Hall, GLOW, Podium, Auction, Cars } from './Frames';
import { JUNO } from './brand/identity';

/* Key frames for every beat of 《谁会拿诺奖》 (storyboard for approval). */

/* ---------------------------------------------------------------- the envelope on the lectern */
const Envelope: React.FC<{ sub: string; podium?: boolean; title?: boolean }> = ({ sub, podium, title }) => (
  <AbsoluteFill style={{ background: '#05060c' }}>
    <Hall floorY={840} spots={[{ x: 960, w: 300, a: 0.9, warm: true }]} />
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <linearGradient id="lect" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2016" /><stop offset="1" stopColor="#0c0906" /></linearGradient>
        <linearGradient id="env" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe9b5" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8742c" /></linearGradient>
      </defs>
      {/* podium silhouettes far behind */}
      {podium && [[560, 210], [960, 300], [1360, 150]].map(([x, h], i) => <rect key={i} x={x - 180} y={840 - h} width={360} height={h} fill="#141a2c" opacity={0.75} />)}
      {/* the lectern */}
      <polygon points="800,600 1120,600 1080,840 840,840" fill="url(#lect)" />
      <polygon points="770,575 1150,575 1120,600 800,600" fill="#3a2c1c" />
      <rect x={930} y={640} width={60} height={60} rx={30} fill="none" stroke={GOLD} strokeOpacity={0.35} strokeWidth={3} />
      {/* the envelope, lying on the lectern */}
      <g transform="translate(960 548) rotate(-4)" style={{ filter: `drop-shadow(0 0 ${podium ? 40 : 22}px ${GLOW})` }}>
        <rect x={-150} y={-46} width={300} height={92} rx={6} fill="url(#env)" />
        <polyline points="-150,-46 0,10 150,-46" fill="none" stroke="#8a5d22" strokeWidth={3} />
        <circle cx={0} cy={10} r={17} fill="#8c1c1c" /><circle cx={0} cy={10} r={9} fill="none" stroke="#c74a3a" strokeWidth={2} />
      </g>
      {/* the clock on the wall */}
      <g transform="translate(1560 250)">
        <circle r={110} fill="#0d1120" stroke="rgba(243,237,226,0.5)" strokeWidth={5} />
        {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={Math.sin(a) * 88} y1={-Math.cos(a) * 88} x2={Math.sin(a) * 100} y2={-Math.cos(a) * 100} stroke={INK} strokeWidth={i % 3 ? 3 : 6} />; })}
        {/* 11:45: hour hand between 11 and 12, minute hand at 9 */}
        <line x1={0} y1={0} x2={Math.sin(((11.75) / 12) * Math.PI * 2) * 58} y2={-Math.cos(((11.75) / 12) * Math.PI * 2) * 58} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        <line x1={0} y1={0} x2={-86} y2={0} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
        <circle r={9} fill={GOLD} />
      </g>
    </svg>
    <div style={{ position: 'absolute', left: 1450, width: 220, top: 380, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: DIM, letterSpacing: '0.15em' }}>STOCKHOLM</div>
    {title && <>
      <AbsoluteFill style={{ background: 'rgba(3,4,8,0.72)' }} />
      <div className="gold" style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 150, filter: `drop-shadow(0 0 30px ${GLOW})` }}>谁会拿诺奖</div>
      <div style={{ position: 'absolute', left: 560, width: 800, top: 600, height: 3, background: GOLD, boxShadow: `0 0 12px ${GLOW}` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 622, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.45em', color: DIM }}>{JUNO.series}</div>
    </>}
    <Finish />
    {sub && <Sub s={sub} />}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- small set pieces */
const Dark: React.FC<{ children: React.ReactNode; sub: string; warm?: boolean }> = ({ children, sub, warm }) => (
  <AbsoluteFill style={{ background: '#05060c' }}>
    <Hall floorY={900} spots={[{ x: 960, w: 340, a: 0.7, warm }]} />
    {children}
    <Finish />
    <Sub s={sub} />
  </AbsoluteFill>
);
const Medal: React.FC = () => (
  <Dark sub="2007年，她成为[第一位]拿到克拉克奖的女性" warm>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs><radialGradient id="md" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#fff" stopOpacity={0.9} /><stop offset="0.3" stopColor={GOLD} /><stop offset="1" stopColor="#5a3c14" /></radialGradient></defs>
      <path d="M 900 120 L 960 330 L 1020 120" fill="none" stroke="#8c1c1c" strokeWidth={46} />
      <circle cx={960} cy={480} r={170} fill="url(#md)" style={{ filter: `drop-shadow(0 0 40px ${GLOW})` }} />
      <circle cx={960} cy={480} r={140} fill="none" stroke="#7a5420" strokeWidth={4} opacity={0.6} />
      <text x={960} y={505} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={84} fill="#3a2508">2007</text>
    </svg>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 48, color: INK }}>约翰·贝茨·克拉克奖</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 762, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DIM, letterSpacing: '0.2em' }}>授予 40 岁以下、在美国工作的经济学家</div>
  </Dark>
);
const Tower: React.FC = () => (
  <Dark sub="她也是最早走进[科技公司]的经济学家之一">
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <defs><linearGradient id="tw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#101830" /><stop offset="1" stopColor="#1d2a4a" /></linearGradient></defs>
      <polygon points="760,140 1160,190 1160,900 760,900" fill="url(#tw)" stroke="#2c3a60" strokeWidth={3} />
      {Array.from({ length: 14 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
        const lit = r === 5 && c === 3, x = 790 + c * 52, y = 230 + r * 46;
        return <rect key={`${r}-${c}`} x={x} y={y} width={36} height={28} fill={lit ? GOLD : '#9fb6d8'} opacity={lit ? 1 : 0.06 + 0.12 * rnd(r * 7 + c)} style={lit ? { filter: `drop-shadow(0 0 16px ${GLOW})` } : undefined} />;
      }))}
    </svg>
    <div style={{ position: 'absolute', left: 1210, top: 440, padding: '14px 24px', borderRadius: 14, border: `2px solid ${GOLD}`, background: 'rgba(10,12,22,0.92)', fontFamily: SANS, color: INK }}>
      <div style={{ fontSize: 36, fontWeight: 900 }}>微软 · 顾问首席经济学家</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: DIM, marginTop: 6 }}>6 年 · 最早的"科技经济学家"之一</div>
    </div>
  </Dark>
);
const Payslip: React.FC<{ mode: 'tax' | 'hours' }> = ({ mode }) => (
  <Dark sub={mode === 'tax' ? '政府加税，人会不会就[不想干活]了？' : '工资涨了，人会多干一些，但[没想象中多]'}>
    <div style={{ position: 'absolute', left: 520, top: 210, width: 520, height: 560, borderRadius: 16, background: '#f1ece2', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '36px 40px', fontFamily: SANS, color: '#1b1b20', transform: 'rotate(-2deg)' }}>
      <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: '0.2em' }}>工资条</div>
      <div style={{ height: 3, background: '#1b1b20', margin: '14px 0 26px', opacity: 0.3 }} />
      {[['税前工资', '¥10,000'], ['税率', mode === 'tax' ? '20% → 25%' : '20%'], ['到手', mode === 'tax' ? '¥7,500' : '¥8,000']].map(([k, v], i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 38, fontWeight: 700, margin: '18px 0', color: i === 1 && mode === 'tax' ? '#c0302a' : '#1b1b20' }}><span>{k}</span><span style={{ fontFamily: MONO }}>{v}</span></div>
      ))}
      <div style={{ position: 'absolute', bottom: 26, left: 40, fontSize: 22, color: 'rgba(27,27,32,0.5)' }}>示意数字</div>
    </div>
    {/* hours bar */}
    <div style={{ position: 'absolute', left: 1200, top: 230, width: 300, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 34, color: INK }}>{mode === 'tax' ? '工作时间' : '工资 vs 工时'}</div>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {mode === 'tax' ? <>
        <rect x={1300} y={330} width={100} height={420} rx={10} fill="none" stroke="rgba(243,237,226,0.35)" strokeWidth={3} />
        <rect x={1300} y={470} width={100} height={280} rx={10} fill={INK} opacity={0.8} />
        <text x={1350} y={430} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={90} fill={GOLD}>?</text>
      </> : <>
        <rect x={1220} y={330} width={100} height={420} rx={10} fill={GOLD} opacity={0.9} />
        <text x={1270} y={310} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill={GOLD}>↑↑</text>
        <rect x={1380} y={560} width={100} height={190} rx={10} fill={INK} opacity={0.85} />
        <text x={1430} y={540} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={40} fill={INK}>↑</text>
        <text x={1270} y={800} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={DIM}>工资</text>
        <text x={1430} y={800} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={DIM}>工时</text>
      </>}
    </svg>
  </Dark>
);
const Forms: React.FC = () => (
  <Dark sub="他把80年代英国的几次税改，当成[天然实验]">
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: 'absolute', left: 600 + i * 230, top: 230 + i * 30, width: 420, height: 520, borderRadius: 12, background: i === 2 ? '#f6f1e6' : '#d8d2c4', transform: `rotate(${-6 + i * 5}deg)`,
        boxShadow: '0 16px 50px rgba(0,0,0,0.6)', padding: '30px 34px', fontFamily: SANS, color: '#1b1b20' }}>
        <div style={{ fontSize: 30, fontWeight: 900 }}>英国税表</div>
        <div style={{ fontFamily: MONO, fontSize: 26, marginTop: 6, color: '#7a2a20' }}>税改 {['①', '②', '③'][i]} · 198X</div>
        {Array.from({ length: 7 }, (_, k) => <div key={k} style={{ height: 14, background: '#1b1b20', opacity: 0.12, margin: '22px 0', width: `${60 + 35 * rnd(k, i)}%` }} />)}
      </div>
    ))}
    <div style={{ position: 'absolute', left: 260, top: 420, fontFamily: SANS, fontWeight: 900, fontSize: 40, color: INK, lineHeight: 1.5 }}>改革前<br /><span style={{ color: GOLD }}>→</span> 改革后<br /><span style={{ fontSize: 28, color: DIM }}>同一批人，怎么变？</span></div>
  </Dark>
);
const Report: React.FC = () => (
  <Dark sub="他还参与主编了英国[税制改革]的权威报告" warm>
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <polygon points="700,700 1220,700 1260,760 740,760" fill="#1c140c" />
      <rect x={720} y={420} width={480} height={280} fill="#2b4a6e" />
      <rect x={720} y={420} width={480} height={34} fill="#203a58" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1={1200} y1={430 + i * 30} x2={1240} y2={440 + i * 30} stroke="#e8e0cc" strokeWidth={6} />)}
      <polygon points="1200,420 1240,450 1240,730 1200,700" fill="#e8e0cc" />
    </svg>
    <div style={{ position: 'absolute', left: 720, width: 480, top: 500, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 44, color: '#f1ece2' }}>米尔利斯税制评论</div>
    <div style={{ position: 'absolute', left: 720, width: 480, top: 570, textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: GOLD, letterSpacing: '0.15em' }}>Mirrlees Review · 2011</div>
  </Dark>
);
const Burst: React.FC = () => (
  <AbsoluteFill style={{ background: '#05060c' }}>
    <Hall floorY={900} spots={[{ x: 960, w: 420, a: 1, warm: true }]} />
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 28 }, (_, i) => { const a = (i / 28) * Math.PI * 2; return <line key={i} x1={960 + Math.cos(a) * 330} y1={470 + Math.sin(a) * 210} x2={960 + Math.cos(a) * 980} y2={470 + Math.sin(a) * 640} stroke={GOLD} strokeWidth={3 + 5 * rnd(i)} opacity={0.12 + 0.25 * rnd(i, 2)} />; })}
    </svg>
    <div style={{ position: 'absolute', left: 560, width: 800, top: 260, height: 420, borderRadius: 28, background: 'linear-gradient(180deg, rgba(30,26,18,0.96), rgba(12,10,8,0.96))', border: `4px solid ${GOLD}`, boxShadow: `0 0 120px ${GLOW}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <div className="gold" style={{ fontFamily: ZH, fontWeight: 900, fontSize: 120 }}>帕克斯</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.2em', color: INK }}>ARIEL PAKES</div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: DIM }}>哈佛大学 · 产业组织</div>
    </div>
    <Finish />
    <Sub s="[帕克斯]" />
  </AbsoluteFill>
);
const BackRow: React.FC = () => (
  <AbsoluteFill>
    <Podium lit={[0.4, 0.75, 0.4]} sub="当然，也可能[三个都不是]" />
    {['迈克尔·伍德福德', '罗伯特·巴罗', '大卫·奥托', '恩斯特·费尔'].map((n, i) => (
      <div key={i} style={{ position: 'absolute', left: 150 + i * 440, top: 110, width: 300, height: 92, borderRadius: 14, border: '2px dashed rgba(243,237,226,0.3)', background: 'rgba(12,14,24,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 34, color: 'rgba(243,237,226,0.6)' }}>{n}</div>
    ))}
  </AbsoluteFill>
);
const EndCard: React.FC = () => (
  <AbsoluteFill style={{ background: '#05060c' }}>
    <Hall floorY={900} spots={[{ x: 960, w: 360, a: 0.6, warm: true }]} />
    <div className="gold" style={{ position: 'absolute', left: 0, right: 0, top: 200, textAlign: 'center', fontFamily: ZH, fontWeight: 900, fontSize: 96 }}>谁会拿诺奖</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', gap: 28 }}>
      {[['苏珊·阿西', BRONZE], ['理查德·布伦德尔', '#cfd6de'], ['阿里尔·帕克斯', GOLD]].map(([n, c], i) => (
        <div key={i} style={{ padding: '14px 30px', borderRadius: 14, border: `2px solid ${c}`, fontFamily: ZH, fontWeight: 900, fontSize: 38, color: c }}>{n}</div>
      ))}
      <div style={{ padding: '14px 30px', borderRadius: 14, border: '2px dashed rgba(243,237,226,0.4)', fontFamily: ZH, fontWeight: 900, fontSize: 38, color: 'rgba(243,237,226,0.6)' }}>其他人？</div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: INK }}>你觉得是谁？</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 596, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 36, color: DIM }}>评论区说说你的理由 · 周一 11:45 揭晓</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center' }}>
      <div style={{ padding: '12px 36px', borderRadius: 40, border: `2px solid ${GOLD}`, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: GOLD }}>{JUNO.follow}</div>
    </div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', fontFamily: SANS, fontSize: 20, color: 'rgba(243,237,226,0.4)' }}>
      资料：Athey & Ellison 2011 QJE · Blundell, Duncan & Meghir 1998 Econometrica · Berry, Levinsohn & Pakes 1995 Econometrica · Stanford GSB · IFS · nobelprize.org
    </div>
    <Finish />
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- the list */
export const KEYS: { t: string; el: React.ReactNode }[] = [
  { t: '0:00 前奏', el: <Envelope sub="下周一[11:45]，斯德哥尔摩会念出一个名字" /> },
  { t: '0:04', el: <Envelope sub="今年的诺贝尔经济学奖，[会是谁]？" podium /> },
  { t: '0:08 重拍', el: <Envelope sub="" podium title /> },
  { t: '0:12', el: <Podium lit={[0.3, 0.3, 1]} sub="第三位热门：[苏珊·阿西]，斯坦福" /> },
  { t: '0:15', el: <Medal /> },
  { t: '0:19', el: <Auction /> },
  { t: '0:24', el: <Auction rule sub="规则怎么定，决定[你先看到谁]、商家付多少钱" /> },
  { t: '0:28', el: <Tower /> },
  { t: '0:31', el: <Podium lit={[1, 0.3, 0.3]} sub="第二位：[理查德·布伦德尔]，伦敦大学学院" /> },
  { t: '0:35', el: <Payslip mode="tax" /> },
  { t: '0:38', el: <Forms /> },
  { t: '0:42', el: <Payslip mode="hours" /> },
  { t: '0:46', el: <Report /> },
  { t: '0:49 间奏', el: <Podium lit={[0.3, 1, 0.3]} sub="呼声最高的：[阿里尔·帕克斯]，哈佛" /> },
  { t: '0:53', el: <Cars mode="tag" sub="一辆车涨价，买家会[跑去哪]？" /> },
  { t: '0:56', el: <Cars mode="old" sub="旧模型说：按份额平均分，连皮卡都分到一份" /> },
  { t: '1:00', el: <Cars mode="new" sub="1995年他和合作者提出：口味不同，买家会跑向[最像的那辆]" /> },
  { t: '1:04', el: <Cars mode="merge" sub="能算出：公司合并后，[价格涨多少]" /> },
  { t: '1:05 渐强', el: <Podium lit={[0.55, 0.55, 0.55]} dimAll={0.6} sub="那[谁会赢]？" /> },
  { t: '1:09', el: <Podium lit={[0.3, 0.6, 0.3]} years={[{ seat: 2, y: '2020' }, { seat: 0, y: '2021' }, { seat: 0, y: '2023' }]} sub="2020年拍卖理论、2021和2023年劳动经济学，都刚拿过奖" /> },
  { t: '1:14', el: <Podium lit={[0.25, 1, 0.25]} years={[{ seat: 1, y: '2014', good: true }]} sub="帕克斯所在的产业组织，上一次是[2014年]" /> },
  { t: '1:18', el: <Podium lit={[0.15, 1, 0.15]} zoom={1.35} sub="所以，我们猜——" /> },
  { t: '1:21 drop', el: <Burst /> },
  { t: '1:25', el: <BackRow /> },
  { t: '1:29 片尾', el: <EndCard /> },
];

export const Story: React.FC = () => {
  const f = useCurrentFrame();
  const k = KEYS[f];
  return (
    <AbsoluteFill>
      <Fonts />
      {k?.el}
      <div style={{ position: 'absolute', left: 40, top: 30, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: RED, background: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: 8 }}>{k?.t}</div>
    </AbsoluteFill>
  );
};
