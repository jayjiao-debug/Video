/* 《是菜还是非？》 key frames, v2 look: low-key product photography in 2D. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { C, F, LNUM, FontFaces, FONT_LOADS, Grade, Grain, Bars, Canvas, glowDot, rnd, clamp, lerp } from './kit';
import { textPts, particleText, sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, withReflection, floorFade, strip, king, stone, tile, card, die, coin, hexPedestal, shards, FLOOR, W, H } from './hero';

const mixc = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',');
const BLUE = [120, 175, 255], MAGE = [255, 110, 205];
const specAt = (u: number) => mixc(BLUE, MAGE, clamp(u));

const Sub: React.FC<{ s: string }> = ({ s }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, textAlign: 'center', fontFamily: F.sans, fontWeight: 500, fontSize: 50, letterSpacing: '0.05em', color: C.cream, ...LNUM }}>
    {s.split(/(\[[^\]]+\])/).map((x, j) => x.startsWith('[') ? <span key={j} style={{ color: C.goldHi }}>{x.slice(1, -1)}</span> : <span key={j}>{x}</span>)}
  </div>
);
const Lb: React.FC<{ x: number; y: number; s: string; size?: number; col?: string; sub?: string }> = ({ x, y, s, size = 30, col = '#efe8da', sub }) => (
  <div style={{ position: 'absolute', left: x - 600, width: 1200, top: y, textAlign: 'center' }}>
    <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: size, letterSpacing: '0.18em', color: col, textShadow: '0 2px 12px rgba(0,0,0,.9)' }}>{s}</div>
    {sub && <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 15, letterSpacing: '0.3em', color: 'rgba(239,232,218,.45)', marginTop: 6 }}>{sub}</div>}
  </div>
);
const Frame: React.FC<{ f: number; T: number; draw: (g: CanvasRenderingContext2D) => void; sub?: string; children?: React.ReactNode }> = ({ f, T, draw, sub, children }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Canvas dep={f} draw={draw} />
    {children}
    <Grade warm={0.02} />
    <Grain T={T} />
    <Bars />
    <div style={{ position: 'absolute', right: 56, top: 36, fontFamily: F.sans, fontWeight: 500, fontSize: 18, letterSpacing: '0.3em', color: 'rgba(243,237,226,.45)' }}><span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏</div>
    {sub && <Sub s={sub} />}
  </AbsoluteFill>
);

/* ---------------------------------------------------------------- H1 · the spectrum as a gallery of objects */
const X0 = 120, X1 = 1800;
const OBJ: { u: number; name: string; en: string; draw: (g: CanvasRenderingContext2D, x: number) => void; w: number }[] = [
  { u: 0.0, name: '围棋', en: 'GO', w: 220, draw: (g, x) => { [[-40, 0, true], [30, -4, false], [0, -26, false], [-60, 22, false], [52, 20, true], [10, 18, true]].forEach(([dx, dy, wh]) => stone(g, x + (dx as number), FLOOR - 14 + (dy as number), 34, wh as boolean)); } },
  { u: 0.12, name: '国际象棋', en: 'CHESS', w: 260, draw: (g, x) => king(g, x, FLOOR, 0.92, '120,175,255', '150,160,255') },
  { u: 0.42, name: '金铲铲', en: 'AUTO-BATTLER', w: 300, draw: (g, x) => { hexPedestal(g, x, FLOOR - 40, 120, specAt(0.42)); glowDot(g, x, FLOOR - 120, 70, 0.5, specAt(0.42)); king(g, x, FLOOR - 50, 0.28, '255,214,140', specAt(0.5), 1); } },
  { u: 0.58, name: '麻将', en: 'MAHJONG', w: 260, draw: (g, x) => { tile(g, x - 78, FLOOR, 1.0, '中', '#b4161b'); tile(g, x - 16, FLOOR, 1.0, '發', '#1f7a3d'); tile(g, x + 46, FLOOR, 1.0, '', '', false); } },
  { u: 0.72, name: '德州扑克', en: "HOLD'EM", w: 260, draw: (g, x) => { card(g, x - 26, FLOOR, 0.95, 'A', '♠', false, -0.16); card(g, x + 28, FLOOR + 6, 0.95, 'K', '♥', true, 0.14); } },
  { u: 0.87, name: '飞行棋', en: 'DICE', w: 220, draw: (g, x) => die(g, x, FLOOR - 62, 1.0, [5, 3, 1]) },
  { u: 1.0, name: '掷硬币', en: 'COIN', w: 220, draw: (g, x) => coin(g, x, FLOOR - 22, 78, 0.34, true) },
];
const H1: React.FC<{ f: number }> = ({ f }) => { const T = 3; return (
  <Frame f={f} T={T} sub="把游戏排成一条线：左边全靠[实力]，右边全靠[运气]" draw={(g) => {
    stage(g, T); bokeh(g, T, 12, 0.55);
    OBJ.forEach((o) => spot(g, lerp(X0 + 90, X1 - 90, o.u), o.w * 1.2, 0.9, o.u < 0.3 ? '200,220,255' : o.u > 0.7 ? '255,215,235' : '235,225,255'));
    OBJ.forEach((o) => { const x = lerp(X0 + 90, X1 - 90, o.u); withReflection(g, () => o.draw(g, x), 0.25); });
    floorFade(g);
    strip(g, X0, X1, FLOOR + 92, 1);
  }}>
    {OBJ.map((o) => <Lb key={o.name} x={lerp(X0 + 90, X1 - 90, o.u)} y={FLOOR + 120} s={o.name} size={28} sub={o.en} />)}
    <div style={{ position: 'absolute', left: X0, top: FLOOR + 210, fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em', color: '#9cc8ff' }}>← 全靠实力</div>
    <div style={{ position: 'absolute', right: W - X1, top: FLOOR + 210, fontFamily: F.serif, fontWeight: 700, fontSize: 26, letterSpacing: '0.3em', color: '#ff9ed6' }}>全靠运气 →</div>
  </Frame>
); };

/* ---------------------------------------------------------------- H2 · hook: the 8th place, a pedestal shattering */
const H2: React.FC<{ f: number }> = ({ f }) => { const T = 1.4; return (
  <Frame f={f} T={T} sub="金铲铲连输三把：是你[菜]，还是你[非]？" draw={(g) => {
    stage(g, T); bokeh(g, T, 30, 1.2);
    spot(g, 960, 520, 1.1, '255,200,235');
    withReflection(g, () => { hexPedestal(g, 960, FLOOR - 60, 210, '255,110,205', 1); king(g, 960, FLOOR - 80, 0.55, '255,140,210', '255,110,205', 0.9); }, 0.22);
    floorFade(g);
    shards(g, 960, FLOOR - 200, 0.55, 140);
    g.save(); g.globalCompositeOperation = 'lighter'; glowDot(g, 960, FLOOR - 220, 380, 0.18, '255,110,205'); g.restore();
  }}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center' }}>
      <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: 'rgba(255,170,220,.8)' }}>DEFEAT · 3 IN A ROW</div>
      <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 120, color: '#ffd1ea', textShadow: '0 0 30px rgba(255,110,205,.8), 0 0 90px rgba(255,110,205,.45)', marginTop: 6 }}>第 8 名</div>
    </div>
  </Frame>
); };

/* ---------------------------------------------------------------- H3 · chess: the king, and every game folding into three endings */
const H3: React.FC<{ f: number }> = ({ f }) => { const T = 34; return (
  <Frame f={f} T={T} sub="数学家证明过：国际象棋的结局，理论上[早就注定]" draw={(g) => {
    stage(g, T); bokeh(g, T, 18, 0.8);
    spot(g, 960, 420, 1.2, '210,225,255');
    const root = [960, FLOOR - 330], outs = [[560, 270], [960, 235], [1360, 270]];
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 420; i++) {
      const o = outs[i % 3], mx = 960 + (rnd(i, 1) - 0.5) * 1600, my = 330 + (rnd(i, 2) - 0.5) * 140;
      g.strokeStyle = `rgba(150,190,255,${0.025 + 0.05 * rnd(i, 3)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(root[0], root[1]); g.quadraticCurveTo(mx, my, o[0], o[1]); g.stroke();
    }
    outs.forEach(([x, y]) => { glowDot(g, x, y, 110, 0.3, '255,214,140'); glowDot(g, x, y, 12, 1, '255,244,220'); });
    glowDot(g, root[0], root[1], 80, 0.4, '200,220,255');
    g.restore();
    withReflection(g, () => king(g, 960, FLOOR, 1.05), 0.3);
    floorFade(g);
  }}>
    {['先手赢', '和棋', '后手赢'].map((s, i) => <Lb key={s} x={[560, 960, 1360][i]} y={[190, 155, 190][i]} s={s} size={32} col={C.goldHi} />)}
  </Frame>
); };

/* ---------------------------------------------------------------- H4 · mahjong: a wall of hidden tiles, your 14 lit */
const H4: React.FC<{ f: number }> = ({ f }) => { const T = 72; return (
  <Frame f={f} T={T} sub="麻将更难：每一步，藏着超过[10⁴⁸]种可能" draw={(g) => {
    stage(g, T); bokeh(g, T, 16, 0.7);
    spot(g, 960, 1300, 0.7, '255,235,200');
    // the wall: two rows of face-down tiles receding
    for (let r = 1; r >= 0; r--) for (let i = 0; i < 17; i++) tile(g, 270 + i * 80 + r * 18, FLOOR - 140 - r * 34, 0.95, '', '', false);
    // your hand: 14 face-up tiles in front, lit
    const HAND = [['一', '#1b1b1b'], ['二', '#1b1b1b'], ['三', '#1b1b1b'], ['五', '#b4161b'], ['五', '#b4161b'], ['中', '#b4161b'], ['中', '#b4161b'], ['中', '#b4161b'], ['東', '#1b1b1b'], ['南', '#1b1b1b'], ['西', '#1b1b1b'], ['北', '#1b1b1b'], ['發', '#1f7a3d'], ['九', '#1a3c8f']];
    withReflection(g, () => HAND.forEach(([ch, col], i) => tile(g, 380 + i * 82, FLOOR, 1.08, ch, col, true, 0.4)), 0.22);
    floorFade(g);
  }}>
    <Lb x={960} y={150} s="136 张牌 · 你只看得见自己这 14 张" size={30} col="#f0d9a8" />
  </Frame>
); };

/* ---------------------------------------------------------------- H5 · drop: half of the chess games become coin tosses */
const H5: React.FC<{ f: number }> = ({ f }) => { const T = 82.2; return (
  <Frame f={f} T={T} sub="有人把[一半]国际象棋对局，换成掷硬币" draw={(g) => {
    stage(g, T); bokeh(g, T, 20, 1);
    spot(g, 960, 1500, 0.8, '255,230,190');
    const cols = 9, R = 1.9;
    for (let r = 2; r >= 0; r--) for (let i = 0; i < cols; i++) {
      const s = 0.42 + r * -0.08 + 0.18, x = 960 + (i - (cols - 1) / 2) * (190 - r * 22), y = FLOOR - r * 70;
      const flip = (i + r) % 2 === 1, d = Math.hypot(x - 960, (y - FLOOR) * 3);
      const k = clamp((R * 600 - d) / 160);
      if (flip && k > 0) { coin(g, x, y - 40 - 120 * Math.sin(k * Math.PI) * (1 - k), 52 - r * 6, lerp(0.05, 0.38, k), true); if (k < 1) sparks(g, x, y - 40, T - 0.25, T, 26, GOLD, 0.6, i * 7 + r); }
      else king(g, x, y, s * (flip ? 1 - k * 0.6 : 1), '120,175,255', '160,150,255', flip ? 1 - k : 1);
    }
    floorFade(g);
    strip(g, 170, 1750, FLOOR + 92, 0.9, 1);
    g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(255,214,140,.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(960, FLOOR - 40, R * 600, R * 600 / 3, 0, 0, 6.3); g.stroke(); g.restore();
  }}>
    <Lb x={960} y={130} s="一半国际象棋 ＋ 一半掷硬币 ＝「一半运气」标准线" size={28} col={C.goldHi} />
  </Frame>
); };

const KEYS = [H2, H1, H3, H4, H5];
export const HKEY_COUNT = KEYS.length;
export const HKeys: React.FC = () => {
  const f = useCurrentFrame();
  const [h] = useState(() => delayRender('hk-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all([...FONT_LOADS, '400 40px "DejaVu Sans"', '900 40px "Noto Serif CJK SC"'].map((x) => document.fonts.load(x, '是菜還是非中發東南西北九♠♥AK').catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  const K = KEYS[Math.min(KEYS.length - 1, f)];
  return <><FontFaces />{ok && <K f={f} />}</>;
};
