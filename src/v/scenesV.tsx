import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { C, ZH, EN } from '../lib';
import { Grain } from '../ui';
import { CanvasLayer, glowDot, rnd } from '../ep2/common';
import { Person, CAST } from './rig';
import Peep from 'react-peeps';

/** Open Peeps character (CC0 illustrations by Pablo Stanley), ink lines on cream, anchored at bottom-centre. */
export const PeepFig: React.FC<{ kind?: 'stand' | 'bust'; body: string; face: string; hair: string; acc?: string; fh?: string; x: number; y: number; h: number; flip?: boolean; glow?: boolean }> = ({
  kind = 'bust', body, face, hair, acc = 'None', fh = 'None', x, y, h, flip = false, glow = true,
}) => {
  const vb = kind === 'stand' ? { x: '-200', y: '0', width: '1700', height: '3050' } : { x: '-100', y: '0', width: '1300', height: '1300' };
  const w = kind === 'stand' ? (h * 1700) / 3050 : h;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h, width: w, height: h, transform: flip ? 'scaleX(-1)' : undefined }}>
      {glow && <div style={{ position: 'absolute', left: '-20%', top: '-10%', width: '140%', height: '120%', background: 'radial-gradient(ellipse at 45% 45%, rgba(233,190,120,0.22) 0%, rgba(0,0,0,0) 60%)' }} />}
      <Peep style={{ width: w, height: h, position: 'absolute', left: 0, top: 0, filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.55))' }}
        body={body as any} face={face as any} hair={hair as any} accessory={acc as any} facialHair={fh as any}
        strokeColor="#1b1714" backgroundColor="#efe6d0" viewBox={vb} />
    </div>
  );
};

export const VW = 1080, VH = 1920;
/* Douyin-safe layout (vertical 1080×1920)
   - top 0–200: status bar + feed tabs
   - right x>920, y 860–1660: avatar / like / comment / share column
   - bottom y>1560: account name, caption, music bar
   Main picture: y 220–1240. Subtitles: centred on y≈1400, max width 800. */
export const SAFE = { top: 220, subY: 1400, subW: 800, bottom: 1560, right: 920 };

/* ---------- shared layers ---------- */
export const VBackground: React.FC<{ top?: string; bottom?: string }> = ({ top = '#141827', bottom = '#0b0c11' }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }} />
);

export const Stars: React.FC<{ n?: number; h?: number; seed?: string; milky?: boolean }> = ({ n = 520, h = 1150, seed = 'v', milky = true }) => (
  <>
    {milky && (
      <div style={{ position: 'absolute', left: -300, top: 120, width: 1700, height: 360, transform: 'rotate(-28deg)',
        background: 'radial-gradient(ellipse at center, rgba(170,180,215,0.16) 0%, rgba(170,180,215,0.05) 45%, rgba(0,0,0,0) 70%)', filter: 'blur(8px)' }} />
    )}
    <CanvasLayer t={0} w={VW} h={VH} draw={(ctx) => {
      for (let i = 0; i < n; i++) {
        const x = rnd(`${seed}x${i}`) * VW, y = Math.pow(rnd(`${seed}y${i}`), 1.25) * h;
        const r = 0.6 + Math.pow(rnd(`${seed}r${i}`), 4) * 2.6;
        glowDot(ctx, x, y, r, 0.3 + rnd(`${seed}a${i}`) * 0.6, r > 2 ? '240,220,170' : '230,228,220', 3.2);
      }
    }} />
  </>
);

export const VVignette: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
);

/** Chinese-first subtitle for vertical: big, short lines, soft dark band behind for legibility. */
export const VSub: React.FC<{ lines: string[]; y?: number; size?: number; o?: number; en?: string }> = ({ lines, y = SAFE.subY, size = 66, o = 1, en }) => (
  <>
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - 170, height: 340, opacity: o,
      background: 'linear-gradient(180deg, rgba(8,9,13,0) 0%, rgba(8,9,13,0.62) 35%, rgba(8,9,13,0.62) 65%, rgba(8,9,13,0) 100%)' }} />
    <div style={{ position: 'absolute', left: (VW - SAFE.subW) / 2 - 20, width: SAFE.subW, top: y - (lines.length * size * 1.35) / 2 - (en ? 18 : 0), textAlign: 'center', opacity: o }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: ZH, fontWeight: 600, fontSize: size, lineHeight: 1.35, color: C.paper, letterSpacing: '0.04em',
          textShadow: '0 3px 14px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)' }}>
          {l.split('*').map((seg, j) => (j % 2 ? <span key={j} style={{ color: C.goldHi }}>{seg}</span> : <React.Fragment key={j}>{seg}</React.Fragment>))}
        </div>
      ))}
      {en && <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 32, color: C.dim, marginTop: 10 }}>{en}</div>}
    </div>
  </>
);

export const VStamp: React.FC<{ year: string; place: string }> = ({ year, place }) => (
  <div style={{ position: 'absolute', left: 70, top: SAFE.top + 10 }}>
    <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 120, color: C.gold, lineHeight: 1 }}>{year}</div>
    <div style={{ width: 280, height: 2, background: C.gold, opacity: 0.6, margin: '14px 0' }} />
    <div style={{ fontFamily: ZH, fontSize: 34, color: C.paper, opacity: 0.8, letterSpacing: '0.2em' }}>{place}</div>
  </div>
);

/* ---------- props & sets ---------- */
const Skyline: React.FC<{ y0: number; seed: string; tower?: boolean; lit?: number }> = ({ y0, seed, tower = false, lit = 0.35 }) => {
  const b: JSX.Element[] = [];
  let x = -20, i = 0;
  while (x < VW + 20) {
    const w = 60 + rnd(`${seed}w${i}`) * 100, h = 120 + rnd(`${seed}h${i}`) * 260;
    const top = y0 - h;
    b.push(<rect key={`b${i}`} x={x} y={top} width={w} height={VH - top} fill="url(#bldV)" />);
    for (let yy = top + 16; yy < VH - 10; yy += 24) for (let xx = x + 10; xx < x + w - 12; xx += 18) {
      if (rnd(`${seed}l${i}-${xx}-${yy}`) < lit) b.push(<rect key={`w${i}-${xx}-${yy}`} x={xx} y={yy} width={7} height={11} fill="#e9c27a" opacity={0.35 + rnd(`${seed}o${xx}${yy}`) * 0.55} />);
    }
    x += w + 3;
    i++;
  }
  return (
    <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
      <defs><linearGradient id="bldV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2030" /><stop offset="1" stopColor="#0c0e15" /></linearGradient></defs>
      {tower && (
        <g fill="#161a26">
          <rect x={760} y={y0 - 560} width={70} height={560} />
          <rect x={750} y={y0 - 470} width={90} height={80} />
          <circle cx={795} cy={y0 - 430} r={28} fill="#e9d6a0" opacity={0.85} />
          <path d={`M 760 ${y0 - 560} L 795 ${y0 - 660} L 830 ${y0 - 560} Z`} />
        </g>
      )}
      {b}
    </svg>
  );
};

const Dish: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g stroke={C.gold} strokeWidth={4} fill="none">
      <path d="M -120 300 L 0 20 L 120 300" /><path d="M -70 180 L 70 180" /><path d="M 0 20 L 0 300" />
    </g>
    <g transform="rotate(-28)">
      <path d="M -260 -40 Q 0 170 260 -40" fill="rgba(201,164,92,0.14)" stroke={C.gold} strokeWidth={5} />
      <ellipse cx={0} cy={-40} rx={260} ry={62} fill="#11141d" stroke={C.goldHi} strokeWidth={6} />
      <path d="M -160 -30 L 0 -250 L 160 -30 M 0 -20 L 0 -250" stroke={C.gold} strokeWidth={3} fill="none" />
      <rect x={-13} y={-268} width={26} height={22} fill={C.goldHi} />
      {[1, 2, 3].map((k) => <path key={k} d={`M ${-70 * k} ${-270 - 70 * k} A ${100 * k} ${100 * k} 0 0 1 ${70 * k} ${-270 - 70 * k}`} stroke={C.gold} strokeOpacity={0.5 - k * 0.12} strokeWidth={3} fill="none" />)}
    </g>
  </g>
);

const Hills: React.FC<{ y: number }> = ({ y }) => {
  const ridge = (base: number, amp: number, seed: string, fill: string) => {
    let d = `M -20 ${VH} L -20 ${base}`;
    for (let xx = -20; xx <= VW + 20; xx += 30) d += ` L ${xx} ${(base - amp * (0.5 + 0.5 * Math.sin(xx / 170 + rnd(seed) * 6))).toFixed(1)}`;
    return <path d={d + ` L ${VW + 20} ${VH} Z`} fill={fill} />;
  };
  const trees: JSX.Element[] = [];
  for (let i = 0; i < 70; i++) {
    const tx = rnd(`tx${i}`) * VW, th = 40 + rnd(`th${i}`) * 60, ty = y + 70 + rnd(`ty${i}`) * 40;
    trees.push(<path key={i} d={`M ${tx} ${ty - th} L ${tx + th * 0.28} ${ty} L ${tx - th * 0.28} ${ty} Z`} fill="#0e1219" />);
  }
  return (
    <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
      {ridge(y - 40, 110, 'h1', '#1a2031')}
      {ridge(y + 10, 70, 'h2', '#141926')}
      {trees}
      {ridge(y + 90, 30, 'h3', '#0d1017')}
    </svg>
  );
};

/* ---------- key frames ---------- */
export const KeyFrame: React.FC<{ k: number }> = ({ k }) => {
  const frames: Record<number, JSX.Element> = {
    1: ( // hook: you on a rooftop, looking up
      <>
        <VBackground top="#1a2034" /><Stars seed="k1" />
        <Skyline y0={1250} seed="k1" lit={0.42} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M 0 1230 L 1080 1270 L 1080 1920 L 0 1920 Z" fill="#0a0b10" />
          <path d="M 0 1230 L 1080 1270" stroke="rgba(233,194,122,0.25)" strokeWidth={3} />
        </svg>
        <PeepFig kind="stand" body="ShirtPantsWB" face="Calm" hair="Long" x={380} y={1250} h={640} />
        <VSub lines={['银河系里', '有几千亿颗星星']} />
      </>
    ),
    2: ( // title
      <>
        <VBackground /><Stars seed="k2" />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M 250 560 C 420 700 640 380 830 520" stroke={C.rouge} strokeWidth={4} fill="none" style={{ filter: 'drop-shadow(0 0 8px rgba(184,72,59,0.8))' }} />
        </svg>
        <CanvasLayer t={0} w={VW} h={VH} draw={(ctx) => { glowDot(ctx, 250, 560, 10, 1, '240,213,154', 7); glowDot(ctx, 830, 520, 10, 1, '240,213,154', 7); }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 700, textAlign: 'center' }}>
          <div style={{ fontFamily: ZH, fontSize: 34, color: C.gold, letterSpacing: '0.5em' }}>VIBE知识大赏</div>
          <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 230, color: C.paper, lineHeight: 1.12, marginTop: 30, letterSpacing: '0.08em' }}>缘分<br />方程</div>
          <div style={{ fontFamily: ZH, fontSize: 58, color: C.paper, marginTop: 40, letterSpacing: '0.08em' }}>遇见<span style={{ color: C.goldHi }}>Ta</span>的概率，能算吗？</div>
        </div>
      </>
    ),
    3: ( // Green Bank 1961
      <>
        <VBackground top="#161c2e" /><Stars seed="k3" h={1000} />
        <Hills y={1080} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <Dish x={690} y={860} s={0.95} />
        </svg>
        <PeepFig body="PointingUp" face="Explaining" hair="Pomp" acc="GlassRound" x={300} y={1330} h={560} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}><path d="M 0 1180 C 200 1150 420 1200 620 1190 C 820 1180 960 1150 1080 1170 L 1080 1920 L 0 1920 Z" fill="#0b0d13" /></svg>
        <VStamp year="1961" place="绿岸 · 美国" />
        <VSub lines={['天文学家德雷克想知道', '有多少文明能和我们对话']} />
      </>
    ),
    4: ( // Drake equation as a vertical list
      <>
        <VBackground /><Stars seed="k4" n={260} />
        <div style={{ position: 'absolute', left: 150, top: 300 }}>
          <div style={{ fontFamily: ZH, fontSize: 36, color: C.gold, letterSpacing: '0.3em', marginBottom: 30 }}>德雷克方程</div>
          {[['N', '=', '能对话的文明数'], ['R*', '', '恒星诞生速度'], ['× fp', '', '有行星的比例'], ['× ne', '', '宜居的行星'], ['× fl', '', '出现生命'], ['× fi', '', '出现智慧'], ['× fc', '', '能发出信号'], ['× L', '', '文明的寿命']].map(([a, b, c], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'baseline', height: 108, opacity: i === 3 ? 1 : 0.9 }}>
              <span style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 84, color: i === 0 ? C.goldHi : i === 3 ? C.goldHi : C.paper, width: 230 }}>{a} {b}</span>
              <span style={{ fontFamily: ZH, fontSize: 46, color: i === 3 ? C.gold : C.paper, opacity: i === 3 ? 1 : 0.75, letterSpacing: '0.06em' }}>{c}</span>
            </div>
          ))}
        </div>
        <VSub lines={['把没法回答的大问题', '拆成*一串小问题*']} />
      </>
    ),
    5: ( // 2010 study
      <>
        <VBackground top="#171b28" bottom="#0e1017" />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs>
            <radialGradient id="lampV"><stop offset="0" stopColor="#ffe3a8" stopOpacity="0.9" /><stop offset="1" stopColor="#ffb760" stopOpacity="0" /></radialGradient>
            <linearGradient id="winV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c2440" /><stop offset="1" stopColor="#2b2a3a" /></linearGradient>
          </defs>
          <rect x={0} y={0} width={VW} height={VH} fill="#161a25" />
          <rect x={470} y={330} width={520} height={560} fill="url(#winV)" stroke="#2a2f3f" strokeWidth={14} />
        </svg>
        <div style={{ position: 'absolute', left: 477, top: 337, width: 506, height: 546, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: -477, top: -337, width: VW, height: VH }}>
            <Stars seed="k5" n={160} h={700} milky={false} />
            <div style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH, transform: 'translateY(-620px)' }}><Skyline y0={1500} seed="k5" tower lit={0.3} /></div>
          </div>
        </div>
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M 470 610 L 990 610 M 730 330 L 730 890" stroke="#2a2f3f" strokeWidth={10} />
          <circle cx={820} cy={1040} r={330} fill="url(#lampV)" opacity={0.7} />
          {/* desk */}
          <rect x={380} y={1010} width={700} height={26} fill="#3a2818" />
          <rect x={400} y={1036} width={20} height={220} fill="#2a1d12" /><rect x={1020} y={1036} width={20} height={220} fill="#2a1d12" />
          {/* paper + lamp */}
          <rect x={640} y={998} width={90} height={10} fill="#efe6d0" transform="rotate(-4 685 1003)" />
          <path d="M 800 1008 L 840 1008 L 830 1000 L 810 1000 Z M 818 1000 L 822 900" stroke="#2a1d12" strokeWidth={6} fill="#2a1d12" />
          <path d="M 780 905 L 860 905 L 840 860 L 800 860 Z" fill="#b8483b" />
        </svg>
        <PeepFig body="Geek" face="Calm" hair="ShortWavy" x={430} y={1170} h={620} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}><rect x={0} y={1010} width={1080} height={30} fill="#3a2818" /><rect x={0} y={1040} width={1080} height={200} fill="#1a120c" /></svg>
        <VStamp year="2010" place="英国 · 华威大学" />
        <VSub lines={['经济学博士巴克斯', '想算算自己的机会']} />
      </>
    ),
    6: ( // the funnel
      <>
        <VBackground /><Stars seed="k6" n={120} milky={false} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 260, textAlign: 'center' }}>
          <div style={{ fontFamily: ZH, fontSize: 36, color: C.dim, letterSpacing: '0.25em' }}>剩下的人</div>
          <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 150, color: C.goldHi, lineHeight: 1.1 }}>808,529</div>
          <div style={{ display: 'inline-block', marginTop: 16, padding: '10px 30px', border: `2px solid ${C.gold}`, borderRadius: 40, fontFamily: ZH, fontSize: 44, color: C.paper }}>
            <span style={{ fontFamily: EN, color: C.gold, marginRight: 14 }}>× 20%</span>24–34岁
          </div>
        </div>
        <CanvasLayer t={0} w={VW} h={VH} draw={(ctx) => {
          for (let i = 0; i < 740; i++) glowDot(ctx, 90 + rnd(`d${i}`) * 820, 700 + rnd(`e${i}`) * 520, 2.4 + rnd(`f${i}`) * 1.4, 0.85, '240,213,154', 3.5);
          for (let i = 0; i < 500; i++) glowDot(ctx, 90 + rnd(`g${i}`) * 820, 700 + rnd(`hh${i}`) * 520, 2, 0.18, '111,125,145', 2);
        }} />
        <div style={{ position: 'absolute', left: 70, top: 1250, fontFamily: ZH, fontSize: 26, color: C.dim }}>女性 · 住伦敦 · 24–34岁 → …</div>
        <VSub lines={['每乘一项', '合适的人就少一大片']} y={1440} />
      </>
    ),
    7: ( // 26
      <>
        <VBackground /><Stars seed="k7" n={200} milky={false} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 400, height: 700, background: 'radial-gradient(circle, rgba(201,164,92,0.35) 0%, rgba(0,0,0,0) 60%)' }} />
        <CanvasLayer t={0} w={VW} h={VH} draw={(ctx) => {
          for (let j = 0; j < 26; j++) { const a = (j / 26) * Math.PI * 2; glowDot(ctx, 540 + Math.cos(a) * 400, 760 + Math.sin(a) * 430, 6, 1, '240,213,154', 5); }
        }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 520, textAlign: 'center', fontFamily: EN, fontWeight: 600, fontSize: 460, lineHeight: 1,
          backgroundImage: `linear-gradient(180deg, ${C.goldHi}, ${C.gold} 55%, #9c7a3c)`, WebkitBackgroundClip: 'text', color: 'transparent' }}>26</div>
        <VSub lines={['整个伦敦', '适合他的只有*26*个']} />
      </>
    ),
    8: ( // dinner with Rose
      <>
        <VBackground top="#22180f" bottom="#0e0b09" />
        <CanvasLayer t={0} w={VW} h={VH} draw={(ctx) => {
          for (let i = 0; i < 26; i++) {
            const x = rnd(`bk${i}`) * VW, y = 250 + rnd(`bl${i}`) * 650, r = 20 + rnd(`bm${i}`) * 50;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, 'rgba(255,190,110,0.28)'); g.addColorStop(1, 'rgba(255,190,110,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
          }
        }} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs><radialGradient id="candle"><stop offset="0" stopColor="#ffd08a" stopOpacity="0.75" /><stop offset="1" stopColor="#ff9c50" stopOpacity="0" /></radialGradient></defs>
        </svg>
        <PeepFig body="ButtonShirt" face="Smile" hair="ShortWavy" x={260} y={1110} h={470} glow={false} />
        <PeepFig body="Coffee" face="Smile" hair="Bangs" x={820} y={1110} h={470} flip glow={false} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs><radialGradient id="candle2"><stop offset="0" stopColor="#ffd08a" stopOpacity="0.55" /><stop offset="1" stopColor="#ff9c50" stopOpacity="0" /></radialGradient></defs>
          <circle cx={540} cy={940} r={300} fill="url(#candle2)" />
          <rect x={0} y={1000} width={1080} height={24} fill="#3a2616" />
          <path d="M 0 1000 L 1080 1000 L 1080 1260 L 0 1260 Z" fill="#efe6d0" opacity={0.95} />
          <path d="M 0 1030 L 1080 1030" stroke="rgba(0,0,0,0.12)" strokeWidth={3} />
          <rect x={528} y={900} width={24} height={100} fill="#efe6d0" />
          <path d="M 540 868 Q 552 888 540 902 Q 528 888 540 868 Z" fill="#ffd27a" />
          <path d="M 440 1000 L 440 950 M 424 910 Q 440 960 456 910 Z M 640 1000 L 640 950 M 624 910 Q 640 960 656 910 Z" stroke="#e9e2d3" strokeWidth={4} fill="rgba(160,40,50,0.6)" />
        </svg>
        <VSub lines={['朋友的晚餐上', '他偶然遇见了*Rose*']} />
      </>
    ),
    9: ( // the boat
      <>
        <VBackground top="#131827" bottom="#07080c" /><Stars seed="k9" h={1000} />
        <svg width={VW} height={VH} style={{ position: 'absolute', left: 0, top: 0 }}>
          <defs><radialGradient id="lanV"><stop offset="0" stopColor="#ffcf86" stopOpacity="0.8" /><stop offset="1" stopColor="#ffb760" stopOpacity="0" /></radialGradient>
            <linearGradient id="waterV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141a27" /><stop offset="1" stopColor="#07080c" /></linearGradient></defs>
          <path d="M 0 1040 L 0 900 C 200 820 360 960 540 880 C 720 800 880 900 1080 860 L 1080 1040 Z" fill="#1b2131" />
          <path d="M 0 1060 L 0 980 C 240 930 420 1010 640 960 C 820 920 960 980 1080 950 L 1080 1060 Z" fill="#131826" />
          <rect x={0} y={1050} width={VW} height={870} fill="url(#waterV)" />
          {new Array(40).fill(0).map((_, i) => <line key={i} x1={rnd(`q${i}`) * VW} x2={rnd(`q${i}`) * VW + 40 + rnd(`qq${i}`) * 90} y1={1080 + Math.pow(rnd(`qy${i}`), 1.3) * 800} y2={1080 + Math.pow(rnd(`qy${i}`), 1.3) * 800} stroke="#9aa8bd" strokeOpacity={0.12} strokeWidth={1.5} />)}
          <g transform="translate(420 1120) scale(2)">
            <path d="M -150 0 Q -120 34 0 38 Q 120 34 158 -6 Q 60 10 -150 0 Z" fill="#0a0b10" stroke="#3a4152" strokeWidth={1} />
            <path d="M -80 2 Q -60 -62 0 -66 Q 62 -62 82 4 Z" fill="#12151e" stroke="#2a2f3d" strokeWidth={1} />
            <line x1={120} y1={-4} x2={120} y2={-70} stroke="#0a0b10" strokeWidth={3} />
            <circle cx={146} cy={-54} r={60} fill="url(#lanV)" />
            <rect x={139} y={-66} width={14} height={20} rx={4} fill="#e9a24e" />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 800, top: 280, writingMode: 'vertical-rl', fontFamily: '"Ma Shan Zheng", serif', fontSize: 104, color: C.paper, letterSpacing: '0.1em' }}>百年修得同船渡</div>
        <VSub lines={['能遇见任何一个人', '本来就是*天文数字*']} />
      </>
    ),
  };
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink, overflow: 'hidden', fontVariantNumeric: 'lining-nums' }}>
      {frames[k]}
      <VVignette />
      <Grain />
    </AbsoluteFill>
  );
};

/* ---------- Douyin UI overlay, for the legibility check ---------- */
export const DouyinUI: React.FC<{ light?: boolean }> = () => {
  const icon = (y: number, label: string, shape: string) => (
    <div style={{ position: 'absolute', left: 950, top: y, width: 110, textAlign: 'center' }}>
      <svg width={84} height={76} viewBox="0 0 100 90"><path d={shape} fill="#fff" opacity={0.95} /></svg>
      <div style={{ fontFamily: '"Noto Sans CJK SC", sans-serif', fontSize: 30, color: '#fff', marginTop: 2, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{label}</div>
    </div>
  );
  const heart = 'M50 84 C20 62 6 44 18 26 C30 10 46 16 50 30 C54 16 70 10 82 26 C94 44 80 62 50 84 Z';
  const bubble = 'M12 40 C12 18 30 8 50 8 C70 8 88 18 88 40 C88 62 70 72 50 72 L30 86 L32 70 C18 64 12 54 12 40 Z';
  const star = 'M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36 Z';
  const share = 'M56 10 L92 44 L56 78 L56 58 C30 58 16 66 8 84 C10 56 26 34 56 30 Z';
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontFamily: '"Noto Sans CJK SC", sans-serif', fontSize: 38, color: 'rgba(255,255,255,0.7)' }}>
        热点　直播　关注　<span style={{ color: '#fff', fontWeight: 700, borderBottom: '4px solid #fff', paddingBottom: 6 }}>推荐</span>
      </div>
      <div style={{ position: 'absolute', left: 945, top: 860, width: 110, height: 110, borderRadius: '50%', border: '4px solid #fff', background: 'radial-gradient(circle at 40% 40%, #3f5a86, #10172a)' }} />
      {icon(1010, '2.1万', heart)}{icon(1165, '1342', bubble)}{icon(1320, '8876', star)}{icon(1475, '3021', share)}
      <div style={{ position: 'absolute', left: 36, top: 1600, width: 860, fontFamily: '"Noto Sans CJK SC", sans-serif', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: 42, fontWeight: 700 }}>@Juno</div>
        <div style={{ fontSize: 36, marginTop: 10, lineHeight: 1.4 }}>Vibe知识大赏｜《缘分方程》1961年，天文学家用一个公式估算外星文明… <b>展开</b></div>
        <div style={{ fontSize: 30, marginTop: 14, opacity: 0.9 }}>♪ 原声 · Vibe知识大赏</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1890, height: 4, background: 'rgba(255,255,255,0.3)' }}><div style={{ width: '42%', height: '100%', background: '#fff' }} /></div>
    </AbsoluteFill>
  );
};

/** side-by-side: today's landscape video in a vertical phone vs the new native vertical */
export const Compare: React.FC = () => (
  <AbsoluteFill style={{ background: '#e9e6df' }}>
    {[0, 1].map((i) => (
      <div key={i} style={{ position: 'absolute', left: 60 + i * 1180, top: 170, width: 1080, height: 1920, borderRadius: 60, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', background: '#000' }}>
        {i === 0 ? (
          <>
            <Img src={staticFile('old_land.png')} style={{ position: 'absolute', left: 0, top: (1920 - 608) / 2, width: 1080, height: 608 }} />
            <DouyinUI />
          </>
        ) : (
          <><KeyFrame k={5} /><DouyinUI /></>
        )}
      </div>
    ))}
    <div style={{ position: 'absolute', left: 60, top: 40, width: 1080, textAlign: 'center', fontFamily: ZH, fontSize: 60, color: '#333' }}>现在：横屏视频在手机上</div>
    <div style={{ position: 'absolute', left: 1240, top: 40, width: 1080, textAlign: 'center', fontFamily: ZH, fontSize: 60, color: '#333' }}>改版：原生竖屏 + 大字幕</div>
  </AbsoluteFill>
);

/** landscape video letterboxed in a vertical phone: old text size vs new */
export const CompareL: React.FC = () => (
  <AbsoluteFill style={{ background: '#e9e6df' }}>
    {['old55.png', 'new55.png'].map((f, i) => (
      <div key={i} style={{ position: 'absolute', left: 60 + i * 1180, top: 170, width: 1080, height: 1920, borderRadius: 60, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.35)', background: '#000' }}>
        <Img src={staticFile(f)} style={{ position: 'absolute', left: 0, top: (1920 - 608) / 2 - 120, width: 1080, height: 608 }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: (1920 + 608) / 2 - 90, textAlign: 'center' }}>
          <span style={{ display: 'inline-block', padding: '12px 30px', borderRadius: 40, border: '2px solid rgba(255,255,255,0.5)', color: '#fff', fontFamily: '"Noto Sans CJK SC", sans-serif', fontSize: 34 }}>⟲ 全屏观看</span>
        </div>
        <DouyinUI />
      </div>
    ))}
    <div style={{ position: 'absolute', left: 60, top: 40, width: 1080, textAlign: 'center', fontFamily: ZH, fontSize: 60, color: '#333' }}>之前：54px 字幕</div>
    <div style={{ position: 'absolute', left: 1240, top: 40, width: 1080, textAlign: 'center', fontFamily: ZH, fontSize: 60, color: '#333' }}>现在：88px 大字幕</div>
  </AbsoluteFill>
);
