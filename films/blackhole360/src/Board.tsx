import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { Bot, Expr } from './Bot3D';

/* Storyboard for 《掉进黑洞》 360° v4: 小J talks less and shows more — props, effects, easter eggs, a HUD.
   Each panel is the main view at that moment (the 360 world around it is noted in the caption and the little compass). */

const GOLD = '#f1c56d', INK = '#f3ede2', DIM = 'rgba(243,237,226,0.6)', RED = '#ff6a4a', BLUE = '#8fc4ff';
const SANS = '"Noto Sans CJK SC", "Noto Sans SC", sans-serif', SERIF = '"Noto Serif CJK SC", serif', MONO = '"DejaVu Sans Mono", monospace';
const Z = 200, X = (px: number) => (px - 960) / Z, Y = (py: number) => (540 - py) / Z;

type BotP = { x: number; y: number; s?: number; yaw?: number; tilt?: number; e?: Expr; hl?: number; hr?: number; stretch?: number; ghost?: boolean };
const Bots: React.FC<{ bots: BotP[] }> = ({ bots }) => (
  <ThreeCanvas width={1920} height={1080} orthographic camera={{ zoom: Z, position: [0, 0, 10] }} style={{ position: 'absolute', inset: 0 }}>
    <ambientLight intensity={0.55} />
    <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#fff3df" />
    <directionalLight position={[5, 0.5, 1]} intensity={1.6} color="#ffc98a" />
    <pointLight position={[0, -2, 2]} intensity={1.2} color="#bfe3ff" />
    {bots.map((b, i) => <Bot key={i} pos={[X(b.x), Y(b.y), 0]} scale={b.s ?? 1} yaw={b.yaw ?? 0.35} tilt={b.tilt ?? 0} e={b.e ?? 'normal'} handL={b.hl ?? 0} handR={b.hr ?? 0} stretch={b.stretch ?? 1} />)}
  </ThreeCanvas>
);
const Bubble: React.FC<{ x: number; y: number; t: string; red?: boolean }> = ({ x, y, t, red }) => (
  <div style={{ position: 'absolute', left: x, top: y, padding: '16px 26px', borderRadius: 28, background: 'rgba(12,14,24,0.9)', border: `2px solid ${red ? RED : GOLD}`, whiteSpace: 'nowrap',
    fontFamily: SANS, fontWeight: 700, fontSize: 44, color: red ? RED : INK, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontVariantNumeric: 'lining-nums' }}>{t}</div>
);
const Tag: React.FC<{ x: number; y: number; t: string; c?: string; size?: number }> = ({ x, y, t, c = GOLD, size = 30 }) => (
  <div style={{ position: 'absolute', left: x, top: y, padding: '6px 14px', borderRadius: 10, background: 'rgba(8,10,18,0.82)', border: `1.5px solid ${c}`, fontFamily: SANS, fontWeight: 700, fontSize: size, color: c, whiteSpace: 'nowrap' }}>{t}</div>
);
/** caption bar + the little 360 compass (which way the viewer is looking, where things are) */
const Caption: React.FC<{ n: number; t: string; title: string; line?: string; look: '前' | '后' | '下' | '左' | '右' | '侧'; kind?: string }> = ({ n, t, title, line, look, kind }) => {
  const ang = { 前: 0, 右: 90, 后: 180, 左: -90, 侧: 90, 下: 0 }[look];
  return (
    <>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: 'linear-gradient(transparent, rgba(4,5,10,0.94) 30%)', display: 'flex', alignItems: 'flex-end', padding: '0 40px 26px', gap: 26 }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: GOLD, minWidth: 170 }}>{String(n).padStart(2, '0')} · {t}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <div style={{ fontFamily: SANS, fontWeight: 900, fontSize: 36, color: INK }}>{kind && <span style={{ color: '#1a1206', background: GOLD, borderRadius: 8, padding: '2px 10px', fontSize: 26, marginRight: 12 }}>{kind}</span>}{title}</div>
          {line && <div style={{ fontFamily: SANS, fontSize: 28, color: DIM }}>小J：「{line}」</div>}
        </div>
      </div>
      <svg width={150} height={150} style={{ position: 'absolute', left: 30, top: 30 }}>
        <circle cx={75} cy={75} r={60} fill="rgba(8,10,18,0.75)" stroke="rgba(243,237,226,0.35)" strokeWidth={2} />
        <circle cx={75} cy={20} r={9} fill="#000" stroke={GOLD} strokeWidth={2} />
        <text x={75} y={47} textAnchor="middle" fontFamily={SANS} fontSize={14} fill={DIM}>黑洞</text>
        {look === '下' ? <circle cx={75} cy={75} r={22} fill="none" stroke={BLUE} strokeWidth={4} strokeDasharray="6 4" />
          : <g transform={`rotate(${ang} 75 75)`}><polygon points="75,75 55,22 95,22" fill={BLUE} opacity={0.35} /></g>}
        <circle cx={75} cy={75} r={6} fill={INK} />
        <text x={75} y={140} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={18} fill={INK}>看：{look === '侧' ? '侧面' : look === '下' ? '脚下' : look === '前' ? '正前方' : look === '后' ? '身后' : look + '边'}</text>
      </svg>
    </>
  );
};
const Plate: React.FC<{ p: string; dim?: number }> = ({ p, dim = 0 }) => (
  <>
    <Img src={staticFile(`board/${p}.jpg`)} style={{ position: 'absolute', width: 1920, height: 1080 }} />
    {dim > 0 && <AbsoluteFill style={{ background: `rgba(3,4,8,${dim})` }} />}
  </>
);

/* ---------------------------------------------------------------- props */
const JConstellation = () => {
  const pts: [number, number][] = [[1040, 230], [1120, 230], [1080, 240], [1082, 360], [1078, 470], [1050, 540], [990, 560], [940, 520]];
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      <polyline points={pts.slice(2).map((p) => p.join(',')).join(' ')} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5} />
      <line x1={1040} y1={230} x2={1120} y2={230} stroke={GOLD} strokeWidth={2} opacity={0.5} />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 6 : 9} fill="#fff6dc" style={{ filter: `drop-shadow(0 0 10px ${GOLD})` }} />)}
      <circle cx={1030} cy={400} r={250} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.25} strokeDasharray="4 10" />
    </svg>
  );
};
const SunRow = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs><radialGradient id="sun"><stop offset="0" stopColor="#fff7d6" /><stop offset="0.6" stopColor="#ffc24a" /><stop offset="1" stopColor="#ff8a1a" stopOpacity={0.2} /></radialGradient></defs>
    {Array.from({ length: 17 }, (_, i) => <circle key={i} cx={830 + i * 23} cy={545} r={11.5} fill="url(#sun)" />)}
    <line x1={818} y1={575} x2={1220} y2={575} stroke={GOLD} strokeWidth={3} /><line x1={818} y1={565} x2={818} y2={585} stroke={GOLD} strokeWidth={3} /><line x1={1220} y1={565} x2={1220} y2={585} stroke={GOLD} strokeWidth={3} />
  </svg>
);
const OrbitInset = () => (
  <div style={{ position: 'absolute', left: 1080, top: 150, width: 720, height: 330, borderRadius: 18, background: 'rgba(8,10,18,0.9)', border: `2px solid ${GOLD}`, padding: 20 }}>
    <svg width={680} height={290}>
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${170 + k * 340} 150)`}>
          <circle r={100} fill="none" stroke="rgba(143,196,255,0.6)" strokeWidth={2} strokeDasharray="6 6" />
          {k === 0 ? <circle r={26} fill="#ffc24a" style={{ filter: 'drop-shadow(0 0 14px #ffb020)' }} /> : <><circle r={14} fill="#000" stroke={GOLD} strokeWidth={2} /><circle r={4} fill="#000" /></>}
          <circle cx={100} cy={0} r={9} fill="#5aa0ff" />
          <text x={0} y={135} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={22} fill={INK}>{k === 0 ? '太阳' : '同样重的黑洞'}</text>
        </g>
      ))}
      <text x={340} y={24} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={22} fill={GOLD}>地球轨道：一模一样</text>
    </svg>
  </div>
);
const Letter = () => (
  <div style={{ position: 'absolute', left: 300, top: 300, width: 420, height: 270, transform: 'rotate(-9deg)', background: '#e9dfc8', borderRadius: 6, boxShadow: '0 16px 50px rgba(0,0,0,0.6)', padding: 26, fontFamily: SERIF, color: '#3a2c1c' }}>
    <div style={{ fontSize: 26, fontWeight: 900 }}>前线来信 · 1916</div>
    <div style={{ fontSize: 20, marginTop: 14, lineHeight: 1.6, opacity: 0.8 }}>…我找到了爱因斯坦方程的一个精确解…</div>
    <div style={{ position: 'absolute', right: 22, top: 18, width: 70, height: 84, border: '3px solid #8c1c1c', color: '#8c1c1c', fontFamily: MONO, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(8deg)' }}>1916</div>
    <div style={{ position: 'absolute', left: 26, bottom: 20, fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: 26 }}>K. Schwarzschild</div>
  </div>
);
const Checker = () => {
  /* the A/B board from 《大脑的懒惰》, wrapped by the lens into an Einstein arc hugging the shadow (sketch) */
  const cx = 1230, cy = 560, N = 16, A0 = Math.PI * 1.06, DA = Math.PI * 0.88 / N;
  const P = (a: number, r: number) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a) * 0.8}`;
  const cell = (i: number, row: number) => { const a0 = A0 + i * DA, a1 = a0 + DA, r0 = 360 + row * 48, r1 = r0 + 48; return `${P(a0, r0)} ${P(a1, r0)} ${P(a1, r1)} ${P(a0, r1)}`; };
  const iA = 5, iB = 10; // A sits on a light square's row, B in the shadowed row: both are the same grey
  const mid = (i: number, row: number) => { const a = A0 + (i + 0.5) * DA, r = 360 + row * 48 + 24; return [cx + r * Math.cos(a), cy + r * Math.sin(a) * 0.8]; };
  const [ax, ay] = mid(iA, 1), [bx, by] = mid(iB, 0);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
      {[0, 1].map((row) => Array.from({ length: N }, (_, i) => {
        const isA = i === iA && row === 1, isB = i === iB && row === 0;
        const light = (i + row) % 2 === 0;
        return <polygon key={`${row}-${i}`} points={cell(i, row)} fill={isA || isB ? '#8a8a8a' : light ? '#d9d6cf' : row === 0 ? '#3e3d3b' : '#5d5c59'} stroke="rgba(0,0,0,0.35)" strokeWidth={1} opacity={0.92} />;
      }))}
      <text x={ax} y={ay + 9} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={28} fill="#fff">A</text>
      <text x={bx} y={by + 9} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={28} fill="#fff">B</text>
      <text x={cx} y={cy - 470} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={GOLD}>棋盘在黑洞背后，光被弯过来，成了一道弧</text>
    </svg>
  );
};
const Beams = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    {/* traced-looking rays from 小J's torch: straight far away, bent near the hole, one goes round the back */}
    {[[-60, 0.35], [-25, 0.6], [0, 0.85]].map(([dy, k], i) => (
      <path key={i} d={`M 560 ${520 + dy} C 820 ${520 + dy}, 930 ${430 + dy * 2}, ${1020 + 30 * i} ${360 - 20 * i} S 1500 ${250 - 60 * i}, 1900 ${200 - 90 * i}`} fill="none" stroke="#fff3c4" strokeWidth={5} opacity={k} style={{ filter: 'drop-shadow(0 0 10px #ffd86a)' }} />
    ))}
    <path d="M 560 545 C 850 545, 960 610, 1050 640 C 1180 690, 1230 560, 1150 470 C 1080 400, 960 430, 930 470" fill="none" stroke="#fff3c4" strokeWidth={5} strokeDasharray="14 10" style={{ filter: 'drop-shadow(0 0 10px #ffd86a)' }} />
    <path d="M 560 560 C 800 560, 900 590, 990 580" fill="none" stroke="#fff3c4" strokeWidth={5} opacity={0.6} />
    <circle cx={995} cy={580} r={8} fill="#000" stroke="#fff3c4" strokeWidth={2} />
  </svg>
);
const Spectrum = () => {
  const bands: [string, number, string][] = [['射电', 260, '#3b4a6b'], ['红外', 180, '#7a3b2e'], ['可见光', 70, 'linear-gradient(90deg,#f33,#fa0,#ff0,#3f3,#39f,#a3f)'], ['紫外', 230, '#6b45c9'], ['X 射线', 300, '#3c8cd8']];
  let x = 0;
  return (
    <div style={{ position: 'absolute', left: 420, top: 640, width: 1080 }}>
      <div style={{ display: 'flex', height: 46, borderRadius: 10, overflow: 'hidden', border: '1.5px solid rgba(243,237,226,0.4)' }}>
        {bands.map(([n, w, c], i) => <div key={i} style={{ width: w, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: INK }}>{n}</div>)}
      </div>
      <div style={{ position: 'absolute', left: 510, top: -64, width: 530, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 28, color: GOLD }}>它的光大多在这里 ↓</div>
      <div style={{ position: 'absolute', left: 440, top: 56, width: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 700, fontSize: 22, color: INK }}>↑ 人眼</div>
      <span style={{ display: 'none' }}>{x}</span>
    </div>
  );
};
const HUD: React.FC<{ rows: [string, string][]; big?: string }> = ({ rows, big }) => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <ellipse cx={960} cy={620} rx={560} ry={210} fill="none" stroke={BLUE} strokeWidth={3} opacity={0.6} />
    <ellipse cx={960} cy={620} rx={520} ry={190} fill="none" stroke={BLUE} strokeWidth={1.5} opacity={0.35} strokeDasharray="10 8" />
    {rows.map(([k, v], i) => (
      <g key={i} transform={`translate(${560 + i * 400} ${i === 1 ? 470 : 560})`}>
        <rect x={-150} y={-60} width={300} height={110} rx={16} fill="rgba(6,10,20,0.82)" stroke={BLUE} strokeWidth={2} />
        <text x={0} y={-22} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={24} fill={DIM}>{k}</text>
        <text x={0} y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={v.length > 7 ? 34 : 44} fill={INK}>{v}</text>
      </g>
    ))}
    {big && <text x={960} y={720} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={110} fill={RED} style={{ filter: 'drop-shadow(0 0 20px rgba(255,80,60,0.6))' }}>{big}</text>}
  </svg>
);
const Chirp = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <path d={Array.from({ length: 400 }, (_, i) => { const t = i / 399, f = 4 + 60 * t ** 3, a = 18 + 70 * t ** 2 * (t < 0.93 ? 1 : (1 - t) / 0.07); return `${i ? 'L' : 'M'} ${700 + t * 800} ${300 + a * Math.sin(2 * Math.PI * f * t)}`; }).join(' ')}
      fill="none" stroke={GOLD} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${GOLD})` }} />
    <text x={1100} y={420} textAnchor="middle" fontFamily={SANS} fontWeight={900} fontSize={34} fill={INK}>啾——</text>
  </svg>
);
const Pip = () => (
  <div style={{ position: 'absolute', left: 1180, top: 170, width: 600, height: 380, borderRadius: 16, border: `3px solid ${RED}`, background: '#05060b', overflow: 'hidden', boxShadow: '0 10px 50px rgba(0,0,0,0.6)' }}>
    <div style={{ position: 'absolute', left: 0, top: 0, right: 0, padding: '8px 14px', background: 'rgba(255,106,74,0.15)', fontFamily: SANS, fontWeight: 900, fontSize: 26, color: RED }}>远处的人看到的我们</div>
    <div style={{ position: 'absolute', right: -160, top: 40, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, #000 60%, rgba(150,40,20,0.4) 72%, transparent 76%)' }} />
    <div style={{ position: 'absolute', left: 120, top: 150, width: 120, height: 110, borderRadius: 28, background: 'linear-gradient(#7a2e22, #3a120c)', opacity: 0.75, filter: 'blur(1px)' }} />
    <div style={{ position: 'absolute', left: 30, bottom: 20, fontFamily: MONO, fontSize: 22, color: 'rgba(255,140,110,0.9)' }}>越来越慢 · 越来越红 · 定格</div>
  </div>
);
const GPS = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <defs><radialGradient id="earth" cx="0.35" cy="0.35"><stop offset="0" stopColor="#7fc0ff" /><stop offset="0.7" stopColor="#1f5fae" /><stop offset="1" stopColor="#0b2a55" /></radialGradient></defs>
    <ellipse cx={1340} cy={400} rx={330} ry={110} fill="none" stroke="rgba(143,196,255,0.5)" strokeWidth={2} strokeDasharray="8 8" />
    <circle cx={1340} cy={400} r={95} fill="url(#earth)" />
    {[[1030, 420], [1600, 330], [1450, 500]].map(([x, y], i) => <g key={i}><rect x={x - 22} y={y - 10} width={44} height={20} rx={4} fill="#d8dde6" /><rect x={x - 54} y={y - 6} width={28} height={12} fill="#3a6fd8" /><rect x={x + 26} y={y - 6} width={28} height={12} fill="#3a6fd8" /></g>)}
    <rect x={1530} y={520} width={300} height={70} rx={12} fill="rgba(8,10,18,0.9)" stroke={GOLD} strokeWidth={2} />
    <text x={1680} y={566} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={GOLD}>+38 μs / 天</text>
  </svg>
);
const LightTurnsBack = () => (
  <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
    <path d="M 760 520 C 600 470, 520 420, 540 360 C 560 300, 760 300, 940 380" fill="none" stroke="#fff3c4" strokeWidth={6} style={{ filter: 'drop-shadow(0 0 10px #ffd86a)' }} />
    <polygon points="940,380 912,358 918,392" fill="#fff3c4" />
    <text x={420} y={300} fontFamily={SANS} fontWeight={700} fontSize={28} fill={INK}>往外射的光，也被拖回来</text>
  </svg>
);
const EndEgg = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #151a2a, #05060b 70%)' }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: GOLD }}>《掉进黑洞》</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 52, color: INK }}>如果还能回来，你愿意再掉一次吗？</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center' }}><div style={{ padding: '10px 32px', borderRadius: 40, border: `2px solid ${GOLD}`, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: GOLD }}>关注 Juno · 一起看懂世界</div></div>
    {/* the stuck message: stretched and reddened, it never gets out */}
    <div style={{ position: 'absolute', left: 980, top: 560, padding: '14px 24px', borderRadius: 26, border: `2px solid ${RED}`, background: 'rgba(40,10,6,0.6)', fontFamily: SANS, fontWeight: 900, fontSize: 40, color: RED, transform: 'scaleX(1.6) scaleY(0.7)', transformOrigin: '0 50%', opacity: 0.8, filter: 'blur(1.2px)' }}>救——命——</div>
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- panels */
type Panel = { el: React.ReactNode };
const P: Panel[] = [
  { el: <><Plate p="p1_far" /><Bots bots={[{ x: 430, y: 560, s: 1.3, e: 'wink', hr: 0.9 }]} /><Bubble x={580} y={330} t="嗨，我是这趟的向导，小J。" /><Caption n={1} t="0:00" title="小J 嗖地飞进来，挥手打招呼" look="前" /></> },
  { el: <><Plate p="p1_far" dim={0.6} /><div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: GOLD, textShadow: '0 0 34px rgba(241,197,109,0.6)' }}>《掉进黑洞》</div><Bots bots={[{ x: 240, y: 800, s: 0.9, e: 'happy', yaw: 0.6 }]} /><Caption n={2} t="0:08" title="金色标题落在第一个重拍，小J 退到一边抬头看" look="前" /></> },
  { el: <><Plate p="p2_back" /><JConstellation /><Bots bots={[{ x: 520, y: 620, s: 1.1, e: 'surprised', hr: 0.8, yaw: 0.6 }]} /><Bubble x={620} y={380} t="先回头，跟正常的星空说再见。" /><Tag x={1200} y={600} t="彩蛋：只有回头的人才看到 J 星座" /><Caption n={3} t="0:12" kind="彩蛋" title="小J 飞到你身后：正常的星空和银河，还有一个 J 星座" look="后" /></> },
  { el: <><Plate p="p3_mid" /><SunRow /><Tag x={830} y={600} t="视界直径 ≈ 17 个太阳" /><Bots bots={[{ x: 380, y: 600, s: 1.1, e: 'happy', hl: 0.7, hr: 0.7, yaw: 0.5 }]} /><Bubble x={480} y={330} t="它的视界，能并排放下17个太阳。" /><Caption n={4} t="0:17" kind="道具" title="一排太阳从黑影这头排到那头" look="前" /></> },
  { el: <><Plate p="p3_mid" /><Letter /><Bots bots={[{ x: 820, y: 700, s: 0.9, e: 'surprised', yaw: -0.3 }]} /><Bubble x={900} y={760} t="1916年，有人在战壕里算出了黑洞。" /><Caption n={5} t="0:22" kind="彩蛋" title="一封旧信飘过：史瓦西在一战前线写给爱因斯坦" look="左" /></> },
  { el: <><Plate p="p3_mid" dim={0.45} /><OrbitInset /><Bots bots={[{ x: 420, y: 560, s: 1.1, e: 'squint', yaw: 0.4 }]} /><Bubble x={520} y={330} t={'别怕，它不会把你"吸"过去。'} /><Caption n={6} t="0:28" kind="道具" title="太阳换成同样重的黑洞：地球轨道一模一样" look="前" /></> },
  { el: <><Plate p="p1_far" /><Checker /><Bots bots={[{ x: 430, y: 560, s: 1.1, e: 'wink' }]} /><Bubble x={540} y={330} t="A和B，还是同一个颜色。" /><Caption n={7} t="0:33" kind="彩蛋" title="《大脑的懒惰》的棋盘飘过，被黑洞弯成一道弧" look="前" /></> },
  { el: <><Plate p="p3_mid" /><Beams /><Bots bots={[{ x: 470, y: 560, s: 1.0, e: 'normal', hr: 0.6, yaw: 0.9 }]} /><Bubble x={300} y={250} t="我开个手电：看，光绕过去了。" /><Caption n={8} t="0:37" kind="道具" title="小J 打手电：光线按真实物理弯折，有一束绕到黑洞背后" look="前" /></> },
  { el: <><Plate p="p5_near" /><Tag x={200} y={700} t="→ 冲你转来：更亮、更蓝" c={BLUE} /><Tag x={1350} y={700} t="← 远离你：更暗、更红" c={RED} /><Bots bots={[{ x: 1500, y: 330, s: 0.8, e: 'squint', yaw: -0.4 }]} /><Bubble x={640} y={130} t="左边亮右边暗，不是我没开灯。" /><Caption n={9} t="0:43" kind="道具" title="盘上浮出两个箭头：气体转得接近一半光速" look="前" /></> },
  { el: <><Plate p="p5_near" dim={0.55} /><Spectrum /><Bots bots={[{ x: 420, y: 400, s: 1.0, e: 'squint', yaw: 0.3 }]} /><Bubble x={540} y={200} t="大部分光你看不见，颜色是我翻译的。" /><Caption n={10} t="0:49" kind="道具" title="一条光谱尺：它的光大多在紫外和 X 射线" look="前" /></> },
  { el: <><Plate p="p4_down" /><HUD rows={[['距离', '6.0 倍半径'], ['速度', '41% 光速'], ['你的 1 秒 = 外面', '1.2 秒']]} /><Bots bots={[{ x: 960, y: 300, s: 0.9, e: 'happy', yaw: 0 }]} /><Bubble x={1060} y={150} t="低头。感觉到重量了吗？没有吧。" /><Caption n={11} t="0:54" kind="体感" title="低头：脚下是盘和一圈仪表盘，数字按真实物理实时跳" look="下" /></> },
  { el: <><Plate p="p4_down" dim={0.3} /><Chirp /><Bots bots={[{ x: 520, y: 420, s: 1.0, e: 'surprised', yaw: 0.3 }]} /><Bubble x={520} y={620} t="2015年，人类第一次听见两个黑洞相撞。" /><Caption n={12} t="0:58" kind="彩蛋" title="小J 的天线收到一声「啾——」：引力波" look="前" /></> },
  { el: <><Plate p="p5_near" /><Bots bots={[{ x: 420, y: 520, s: 1.0, e: 'worried', stretch: 2.0, yaw: 0.3 }]} /><Tag x={180} y={170} t="小黑洞：还没到视界就被拉长" c={RED} /><Tag x={180} y={230} t="这个：感觉不到" c={GOLD} /><Bubble x={600} y={420} t="小一点的黑洞，早把我拉成面条了。" /><Caption n={13} t="1:01" kind="特效" title="小J 被拉成长条，再「啪」地弹回来" look="前" /></> },
  { el: <><Plate p="p5_near" /><Pip /><Bots bots={[{ x: 420, y: 560, s: 1.0, e: 'happy', yaw: 0.6 }]} /><Bubble x={520} y={330} t="外面看我们：越来越慢、越来越红。" /><Caption n={14} t="1:05" kind="道具" title="画中画：远处的人看到的小J 变红、变慢、定格；本人一切正常" look="前" /></> },
  { el: <><Plate p="p5_near" dim={0.5} /><GPS /><Bots bots={[{ x: 420, y: 560, s: 1.0, e: 'normal', yaw: 0.5, hr: 0.6 }]} /><Bubble x={420} y={260} t="你手机里的GPS，每天都要修正这个。" /><Caption n={15} t="1:09" kind="道具" title="迷你地球和 GPS 卫星：卫星钟每天快 38 微秒" look="前" /></> },
  { el: <><Plate p="p6_photon" /><Bots bots={[{ x: 760, y: 560, s: 1.0, e: 'surprised', yaw: 1.2 }, { x: 1250, y: 560, s: 1.0, e: 'normal', yaw: Math.PI }]} /><div style={{ position: 'absolute', left: 1120, top: 400, width: 260, height: 300, background: 'rgba(5,6,11,0.35)' }} /><Tag x={1120} y={720} t="绕了一圈回来的光：小J 的后脑勺" /><Bubble x={420} y={240} t="停在这儿，你能看到自己的后脑勺。" /><Caption n={16} t="1:13" kind="特效" title="光子球：小J 侧身，旁边出现它自己的背影" look="侧" /></> },
  { el: <><Plate p="p7_horizon" /><HUD rows={[['距离', '1.0 倍半径'], ['速度', '≈ 光速'], ['到中心', '倒计时 ↓']]} big="26 s" /><Bots bots={[{ x: 230, y: 330, s: 1.0, e: 'happy', yaw: 0.5, hl: 0.8, hr: 0.8 }]} /><Bubble x={340} y={110} t="恭喜，越过视界。什么都没发生。" /><Caption n={17} t="1:21" kind="体感" title="drop：金光一闪，仪表盘变成真实时间倒计时" look="前" /></> },
  { el: <><Plate p="p7_horizon" dim={0.55} /><LightTurnsBack /><Bots bots={[{ x: 820, y: 560, s: 1.0, e: 'worried', yaw: -0.6, hr: 0.7 }]} /><Bubble x={930} y={300} t="我们的光，再也出不去了。" /><Caption n={18} t="1:32" kind="道具" title="小J 往外打手电，光却被拖回来" look="后" /></> },
  { el: <><EndEgg /><Bots bots={[{ x: 700, y: 640, s: 1.1, e: 'wink', yaw: 0.4, hr: 0.9 }]} /><Bubble x={980} y={700} t="好消息：黑洞会蒸发。坏消息：要10⁸⁷年。" /><Caption n={19} t="1:41" kind="彩蛋" title="片尾：小J 的消息被拉长变红，卡在半空出不去" look="前" /></> },
];
export const N_PANELS = P.length;
export const Board: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: '#000' }}>{P[f]?.el}</AbsoluteFill>;
};
