/* 《是菜还是非？》 scenes. Low-key product photography in 2D: objects on a glossy black floor, key lights from above,
   a blue→magenta light strip for the luck spectrum, gold for the brand moments. T = track seconds. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, LNUM, Canvas, glowDot, rnd, clamp, lerp, pr, eo, eio, pop, hit, easeInOut } from './kit';
import { textPts, particleText, sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, withReflection, floorFade, strip, king, stone, tile, card, die, coin, hexPedestal, shards, FLOOR, W, H } from './hero';
import { CUT, bt } from './time';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
const mixc = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',');
const specAt = (u: number) => mixc([120, 175, 255], [255, 110, 205], clamp(u));
const cam = (g: G, s: number, cx = 960, cy = 600, dx = 0) => { g.translate(cx + dx, cy); g.scale(s, s); g.translate(-cx, -cy); };
const kingAt = (g: G, x: number, y: number, s: number, rot = 0, light = 1, rimL = '120,175,255', rimR = '150,160,255') => {
  if (!rot) return king(g, x, y, s, rimL, rimR, light);
  const px = x + 74 * s * Math.sign(rot); g.save(); g.translate(px, y); g.rotate(rot); g.translate(-px, -y); king(g, x, y, s, rimL, rimR, light); g.restore();
};

/* ---------------------------------------------------------------- labels */
const Lb: React.FC<{ x: number; y: number; s: string; size?: number; col?: string; sub?: string; o?: number; ls?: string }> = ({ x, y, s, size = 30, col = '#efe8da', sub, o = 1, ls = '0.18em' }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x - 700, width: 1400, top: y, textAlign: 'center', opacity: o }}>
      <div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: size, letterSpacing: ls, color: col, textShadow: '0 2px 14px rgba(0,0,0,.95)', ...LNUM }}>{s}</div>
      {sub && <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 15, letterSpacing: '0.3em', color: 'rgba(239,232,218,.45)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
const Scene: React.FC<{ f: number; draw: (g: G) => void; children?: React.ReactNode; o?: number }> = ({ f, draw, children, o = 1 }) => (
  <AbsoluteFill style={{ background: '#030305', opacity: o }}>
    <Canvas dep={f} draw={(g) => { g.save(); draw(g); g.restore(); g.globalCompositeOperation = 'source-over'; }} />
    {children}
  </AbsoluteFill>
);
const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };

/* ================================================================ S0 · cold open (0 – 16.6) */
export const S0: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const part = T < CUT.cards ? 0 : T < CUT.king ? 1 : T < CUT.strip ? 2 : 3;
  if (part === 0) {
    const brk = pr(T, 0.5, 1.6), s = lerp(1.0, 1.07, pr(T, 0, CUT.cards));
    return (
      <Scene f={f} draw={(g) => {
        stage(g, T); bokeh(g, T, 26, 1.1);
        g.save(); cam(g, s);
        spot(g, 960, 520, 1.1, '255,200,235');
        withReflection(g, () => { hexPedestal(g, 960, FLOOR - 60, 210, '255,110,205', 1); if (T < 0.4) king(g, 960, FLOOR - 80, 0.55, '255,140,210', '255,110,205', 0.9); }, 0.22);
        floorFade(g);
        if (T >= 0.4) shards(g, 960, FLOOR - 200, Math.max(0.02, brk * 0.9), 160);
        add(g, () => glowDot(g, 960, FLOOR - 220, 380, 0.18 + 0.3 * hit(T, 0.4, 0.2), '255,110,205'));
        g.restore();
      }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center' }}>
          <div style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: 'rgba(255,170,220,.8)', opacity: eo(T, 0.5, 0.4) }}>DEFEAT · 3 IN A ROW</div>
          <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 120, color: '#ffd1ea', textShadow: '0 0 30px rgba(255,110,205,.8), 0 0 90px rgba(255,110,205,.45)', marginTop: 6, opacity: clamp(pop(T, bt(5), 0.25)), transform: `scale(${lerp(1.3, 1, eo(T, bt(5), 0.2))})` }}>第 8 名</div>
        </div>
      </Scene>
    );
  }
  if (part === 1) {
    const HAND: [string, string, boolean][] = [['3', '♣', false], ['4', '♦', true], ['6', '♠', false], ['7', '♥', true], ['9', '♣', false]];
    return (
      <Scene f={f} draw={(g) => {
        stage(g, T); bokeh(g, T, 18, 0.8);
        g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.cards, 4)));
        spot(g, 960, 760, 1, '255,225,235');
        withReflection(g, () => HAND.forEach(([r, su, red], i) => { const k = eo(T, CUT.cards + i * 0.13, 0.35); if (k <= 0) return; const a = (i - 2) * 0.16; card(g, 960 + (i - 2) * 120 * k, FLOOR + 10 - 20 * Math.cos(a) * k + (1 - k) * 60, 1.25, r, su, red, a * k); }), 0.2);
        floorFade(g);
        g.restore();
      }}>
        <Lb x={960} y={180} s="一手烂牌" size={40} col="#ffd1ea" sub="NO PAIRS · NO BOMBS" o={eo(T, CUT.cards + 1.2, 0.4)} />
      </Scene>
    );
  }
  if (part === 2) {
    const fall = easeInOut(pr(T, bt(19), 0.7));
    return (
      <Scene f={f} draw={(g) => {
        stage(g, T); bokeh(g, T, 16, 0.8);
        g.save(); cam(g, lerp(1.04, 1.1, pr(T, CUT.king, 3.5)), 960, 620);
        spot(g, 960, 520, 1.2, '210,225,255');
        withReflection(g, () => { kingAt(g, 1080, FLOOR, 0.62, 0, 0.9, '255,214,140', '255,200,120'); kingAt(g, 840, FLOOR, 0.9, -fall * 1.45); }, 0.28);
        floorFade(g);
        if (fall >= 1) add(g, () => { sparks(g, 700, FLOOR - 10, bt(19) + 0.7, T, 40, '200,220,255', 0.7, 5); });
        g.restore();
      }}>
        <Lb x={960} y={170} s="将死" size={44} col="#cfe0ff" sub="CHECKMATE" o={eo(T, bt(20), 0.4)} />
      </Scene>
    );
  }
  // part 3: the strip ignites; luck vs skill
  const k = eio(T, CUT.strip, 1.1), out = 1 - pr(T, CUT.title - 0.4, 0.25);
  return (
    <Scene f={f} o={out} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.9);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.strip, 4.5)));
      floorFade(g);
      if (k > 0) strip(g, 960 - 820 * k, 960 + 820 * k, FLOOR + 40, 1);
      add(g, () => { glowDot(g, 960 - 820 * k, FLOOR + 40, 120, 0.4 * k, '120,175,255'); glowDot(g, 960 + 820 * k, FLOOR + 40, 120, 0.4 * k, '255,110,205'); });
      const q = pop(T, bt(27), 0.3); if (q > 0) add(g, () => glowDot(g, 960, FLOOR - 120, 300 * q, 0.25, GOLD));
      g.restore();
    }}>
      <Lb x={300} y={FLOOR + 90} s="实力" size={56} col="#a8ccff" sub="SKILL" o={eo(T, CUT.strip + 0.8, 0.4)} />
      <Lb x={1620} y={FLOOR + 90} s="运气" size={56} col="#ffaee0" sub="LUCK" o={eo(T, CUT.strip + 1.0, 0.4)} />
      <Lb x={960} y={FLOOR - 230} s="？" size={150} col={C.goldHi} o={clamp(pop(T, bt(27), 0.3))} />
    </Scene>
  );
};

/* ================================================================ S1 · title */
export const TITLE_START = CUT.title - 0.6;
export const S1: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const HIT = CUT.title, crisp = eo(T, HIT + 0.05, 0.4), out = 1 - pr(T, CUT.gallery - 0.25, 0.25);
  return (
    <Scene f={f} o={out} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.7); floorFade(g);
      strip(g, 140, 1780, FLOOR + 40, 0.7);
      add(g, () => {
        particleText(g, textPts('《是菜还是非？》', '900 150px "Noto Serif CJK SC"', 960, 470, 3), T, TITLE_START, HIT, GOLD, 21, 1100);
        if (T >= HIT) { sparks(g, 960, 470, HIT, T, 180, GOLD, 3.4, 9); g.fillStyle = `rgba(255,244,220,${0.6 * hit(T, HIT, 0.25)})`; g.fillRect(200, 469, 1520, 3); }
        glowDot(g, 960, 470, 760, 0.1 * crisp);
      });
    }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="s1g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
        <text x={960} y={522} textAnchor="middle" opacity={crisp * 0.9} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 150, letterSpacing: '0.04em' }} fill="url(#s1g)">《是菜还是非？》</text>
        <text x={960} y={620} textAnchor="middle" opacity={eo(T, HIT + 0.5, 0.5)} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em' }} fill={C.dim}>LUCK · SKILL · EVERY GAME YOU PLAY</text>
      </svg>
    </Scene>
  );
};

/* ================================================================ the gallery (shared by S2, S8, S12) */
const GX0 = 120, GX1 = 1800;
type Obj = { u: number; name: string; en: string; w: number; draw: (g: G, x: number, T: number) => void };
const OBJ: Obj[] = [
  { u: 0.0, name: '围棋', en: 'GO', w: 220, draw: (g, x) => { [[-40, 0, true], [30, -4, false], [0, -26, false], [-60, 22, false], [52, 20, true], [10, 18, true]].forEach(([dx, dy, wh]) => stone(g, x + (dx as number), FLOOR - 14 + (dy as number), 34, wh as boolean)); } },
  { u: 0.12, name: '国际象棋', en: 'CHESS', w: 260, draw: (g, x) => king(g, x, FLOOR, 0.92) },
  { u: 0.42, name: '金铲铲', en: 'AUTO-BATTLER', w: 300, draw: (g, x) => { hexPedestal(g, x, FLOOR - 40, 120, specAt(0.42)); add(g, () => glowDot(g, x, FLOOR - 120, 70, 0.5, specAt(0.42))); king(g, x, FLOOR - 50, 0.28, '255,214,140', specAt(0.5), 1); } },
  { u: 0.58, name: '麻将', en: 'MAHJONG', w: 260, draw: (g, x) => { tile(g, x - 78, FLOOR, 1.0, '中', '#b4161b'); tile(g, x - 16, FLOOR, 1.0, '發', '#1f7a3d'); tile(g, x + 46, FLOOR, 1.0, '', '', false); } },
  { u: 0.72, name: '德州扑克', en: "HOLD'EM", w: 260, draw: (g, x) => { card(g, x - 26, FLOOR, 0.95, 'A', '♠', false, -0.16); card(g, x + 28, FLOOR + 6, 0.95, 'K', '♥', true, 0.14); } },
  { u: 0.87, name: '飞行棋', en: 'DICE', w: 220, draw: (g, x) => die(g, x, FLOOR - 62, 1.0, [5, 3, 1]) },
  { u: 1.0, name: '掷硬币', en: 'COIN', w: 220, draw: (g, x, T) => coin(g, x, FLOOR - 22 - 30 * Math.abs(Math.sin(T * 3)), 78, 0.12 + 0.3 * Math.abs(Math.cos(T * 6)), true) },
];
const gx = (u: number) => lerp(GX0 + 90, GX1 - 90, u);
const gallery = (g: G, T: number, appear: (i: number) => number, dim: (i: number) => number = () => 1) => {
  OBJ.forEach((o, i) => { const k = appear(i); if (k > 0) spot(g, gx(o.u), o.w * 1.2, 0.9 * k * dim(i), o.u < 0.3 ? '200,220,255' : o.u > 0.7 ? '255,215,235' : '235,225,255'); });
  OBJ.forEach((o, i) => { const k = appear(i); if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 1.5) * (0.25 + 0.75 * dim(i)); g.translate(0, (1 - easeInOut(clamp(k))) * 40); withReflection(g, () => o.draw(g, gx(o.u), T), 0.25); g.restore(); });
};
const GalleryLabels: React.FC<{ appear: (i: number) => number; dim?: (i: number) => number }> = ({ appear, dim = () => 1 }) => (
  <>{OBJ.map((o, i) => <Lb key={o.name} x={gx(o.u)} y={FLOOR + 120} s={o.name} size={28} sub={o.en} o={clamp(appear(i) * 1.4) * (0.3 + 0.7 * dim(i))} />)}</>
);

/* ================================================================ S2 · the spectrum (20.66 – 28.76) */
const APPEAR = [bt(40), bt(41), bt(43), bt(44), bt(45), bt(47), bt(48)];
export const S2: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const ap = (i: number) => eo(T, APPEAR[i], 0.45);
  return (
    <Scene f={f} o={eo(T, CUT.gallery - 0.05, 0.25)} draw={(g) => {
      stage(g, T); bokeh(g, T, 12, 0.55);
      g.save(); cam(g, lerp(1.0, 1.03, pr(T, CUT.gallery, 8)), 960, 700);
      gallery(g, T, ap);
      floorFade(g); strip(g, GX0, GX1, FLOOR + 92, 1);
      OBJ.forEach((o, i) => { if (T > APPEAR[i]) add(g, () => sparks(g, gx(o.u), FLOOR + 92, APPEAR[i], T, 26, specAt(o.u), 0.6, i)); });
      g.restore();
    }}>
      <GalleryLabels appear={ap} />
      <Lb x={300} y={FLOOR + 210} s="← 全靠实力" size={26} col="#9cc8ff" o={eo(T, bt(41), 0.4)} />
      <Lb x={1620} y={FLOOR + 210} s="全靠运气 →" size={26} col="#ff9ed6" o={eo(T, bt(48), 0.4)} />
    </Scene>
  );
};

/* ================================================================ S3 · chess: settled in theory (28.76 – 40.91) */
export const S3: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const tree = pr(T, CUT.tree, 1.6), outsK = [bt(72), bt(74), bt(76)].map((t) => pop(T, t, 0.3));
  const root = [960, FLOOR - 330], outs = [[560, 270], [960, 235], [1360, 270]];
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 16, 0.7);
      g.save(); cam(g, lerp(1.0, 1.06, pr(T, CUT.chess, 12)), 960, 560);
      spot(g, 960, 460, 1.2, '210,225,255'); spot(g, 620, 260, 0.6 * (1 - pr(T, CUT.tree, 0.6)), '200,220,255');
      withReflection(g, () => { king(g, 960, FLOOR, 1.05); if (T < CUT.tree + 0.6) [[-40, 0, true], [30, -4, false], [0, -26, false], [-60, 22, false]].forEach(([dx, dy, wh]) => stone(g, 620 + (dx as number), FLOOR - 14 + (dy as number), 34, wh as boolean)); }, 0.3);
      if (tree > 0) add(g, () => {
        for (let i = 0; i < 420; i++) {
          const o = outs[i % 3], mx = 960 + (rnd(i, 1) - 0.5) * 1600, my = 330 + (rnd(i, 2) - 0.5) * 140;
          const k = clamp(tree * 1.4 - rnd(i, 4) * 0.4); if (k <= 0) continue;
          g.strokeStyle = `rgba(150,190,255,${(0.03 + 0.05 * rnd(i, 3)) * (1 - 0.5 * clamp(outsK[i % 3]))})`; g.lineWidth = 1; g.beginPath(); g.moveTo(root[0], root[1]);
          for (let q = 1; q <= 20 * k; q++) { const u = q / 20, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; g.lineTo(a * root[0] + b * mx + c * o[0], a * root[1] + b * my + c * o[1]); }
          g.stroke();
        }
        glowDot(g, root[0], root[1], 90, 0.45, '200,220,255');
        outs.forEach(([x, y], i) => { const k = outsK[i]; if (k > 0) { glowDot(g, x, y, 110 * k, 0.32, '255,214,140'); glowDot(g, x, y, 12, k, '255,244,220'); } });
      });
      floorFade(g);
      g.restore();
    }}>
      {['先手赢', '和棋', '后手赢'].map((s, i) => <Lb key={s} x={[560, 960, 1360][i]} y={[180, 145, 180][i]} s={s} size={34} col={C.goldHi} o={clamp(outsK[i])} />)}
      <Lb x={620} y={FLOOR + 110} s="围棋 · 国际象棋" size={28} sub="NO DICE · NO HIDDEN CARDS" o={1 - pr(T, CUT.tree, 0.5)} />
      <Lb x={960} y={FLOOR + 140} s="ZERMELO · 1913" size={16} col="rgba(239,232,218,.5)" ls="0.4em" o={eo(T, CUT.tree + 0.5, 0.5)} />
    </Scene>
  );
};

/* ================================================================ S4 · Go: 171 digits (40.91 – 49.01) */
const GO_N = '208168199381979984699478633344862770286522453884530548425639456820927419612738015378525648451698519643907259916015628128546089888314427129715319317557736620397247064840935';
const boardPt = (cx: number, u: number, v: number, wf = 560, wn = 1100, yf = FLOOR - 150, yn = FLOOR + 160) => { const k = Math.pow(v, 1.15), hw = lerp(wf, wn, k) / 2; return [cx + (u - 0.5) * 2 * hw, lerp(yf, yn, k)] as [number, number]; };
const goBoard = (g: G, cx: number, n: number, a = 1) => {
  const c0 = boardPt(cx, 0, 0), c1 = boardPt(cx, 1, 0), c2 = boardPt(cx, 1, 1), c3 = boardPt(cx, 0, 1);
  const wood = g.createLinearGradient(0, c0[1], 0, c2[1]); wood.addColorStop(0, `rgba(120,86,40,${a})`); wood.addColorStop(1, `rgba(196,150,82,${a})`);
  g.fillStyle = wood; g.beginPath(); g.moveTo(...c0); g.lineTo(...c1); g.lineTo(...c2); g.lineTo(...c3); g.closePath(); g.fill();
  g.strokeStyle = `rgba(30,20,10,${0.55 * a})`; g.lineWidth = 1;
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; g.beginPath(); g.moveTo(...boardPt(cx, u, 0.5 / n)); g.lineTo(...boardPt(cx, u, 1 - 0.5 / n)); g.stroke(); g.beginPath(); g.moveTo(...boardPt(cx, 0.5 / n, u)); g.lineTo(...boardPt(cx, 1 - 0.5 / n, u)); g.stroke(); }
};
export const S4: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const typed = Math.floor(lerp(0, GO_N.length, pr(T, CUT.go + 0.1, 2.6)));
  const stonesN = Math.floor(lerp(0, 90, pr(T, CUT.go, 8)));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T);
      add(g, () => { for (let i = 0; i < 500; i++) { const tw = 0.4 + 0.6 * Math.sin(T * (0.5 + rnd(i, 5)) + i) ** 2; glowDot(g, rnd(i, 21) * W, rnd(i, 22) * (FLOOR - 80), 1.5 + 2.5 * rnd(i, 23), 0.45 * tw, '200,220,255'); } });
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.go, 8)), 960, 760);
      spot(g, 960, 1100, 0.8, '255,235,200');
      goBoard(g, 960, 19);
      for (let k = 0; k < stonesN; k++) { const i = Math.floor(rnd(k, 31) * 19), j = Math.floor(rnd(k, 32) * 19); const [x, y] = boardPt(960, (i + 0.5) / 19, (j + 0.5) / 19); const s = lerp(9, 17, (j + 0.5) / 19); stone(g, x, y, s, k % 2 === 0); }
      floorFade(g);
      g.restore();
    }}>
      <div style={{ position: 'absolute', left: 150, right: 150, top: 170, fontFamily: F.type, fontSize: 34, lineHeight: '50px', letterSpacing: '0.05em', color: '#d6e6ff', wordBreak: 'break-all', textAlign: 'center', textShadow: '0 0 18px rgba(120,180,255,.8)' }}>
        {GO_N.slice(0, typed)}<span style={{ opacity: typed < GO_N.length ? 1 : 0, color: C.goldHi }}>▌</span>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: eo(T, bt(88), 0.4), fontFamily: F.serif, fontWeight: 700, fontSize: 40, color: C.goldHi, textShadow: '0 0 20px rgba(255,214,140,.5)' }}>
        ≈ 2.08 × 10<sup style={{ fontSize: 24 }}>170</sup><span style={{ color: C.dim, fontSize: 30 }}>　vs　宇宙里的原子 ≈ 10<sup style={{ fontSize: 18 }}>80</sup></span>
      </div>
      <Lb x={960} y={115} s="19×19 围棋 · 所有合法局面的数量" size={22} col="#a8ccff" ls="0.25em" o={eo(T, CUT.go, 0.4)} />
    </Scene>
  );
};

/* ================================================================ S5 · solved games (49.01 – 57.11) */
export const S5: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const five = pr(T, 52.9, 0.8), years = Math.round(lerp(1989, 2007, pr(T, 54.6, 1.6)));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 12, 0.5);
      g.save(); cam(g, lerp(1.0, 1.04, pr(T, CUT.solved, 8)), 960, 700);
      spot(g, 560, 800, 0.9 * eo(T, CUT.solved, 0.6), '255,235,200'); spot(g, 1360, 800, 0.9 * eo(T, 54.4, 0.5), '255,235,200');
      // gomoku
      const gc = 560, B = (u: number, v: number) => boardPt(gc, u, v, 380, 720, FLOOR - 120, FLOOR + 150);
      g.globalAlpha = eo(T, CUT.solved, 0.6);
      { const c0 = B(0, 0), c1 = B(1, 0), c2 = B(1, 1), c3 = B(0, 1); const wood = g.createLinearGradient(0, c0[1], 0, c2[1]); wood.addColorStop(0, '#6e4e22'); wood.addColorStop(1, '#bd9050'); g.fillStyle = wood; g.beginPath(); g.moveTo(...c0); g.lineTo(...c1); g.lineTo(...c2); g.lineTo(...c3); g.closePath(); g.fill();
        g.strokeStyle = 'rgba(30,20,10,.5)'; for (let i = 0; i < 15; i++) { const u = (i + 0.5) / 15; g.beginPath(); g.moveTo(...B(u, 0.03)); g.lineTo(...B(u, 0.97)); g.stroke(); g.beginPath(); g.moveTo(...B(0.03, u)); g.lineTo(...B(0.97, u)); g.stroke(); } }
      const row = [[4, 9], [5, 8], [6, 7], [7, 6], [8, 5]];
      for (let k = 0; k < 16; k++) { const i = 2 + Math.floor(rnd(k, 51) * 11), j = 2 + Math.floor(rnd(k, 52) * 11); if (row.some(([a, b]) => a === i && b === j)) continue; const [x, y] = B((i + 0.5) / 15, (j + 0.5) / 15); stone(g, x, y, lerp(10, 18, (j + 0.5) / 15), k % 2 === 1); }
      row.forEach(([i, j], k) => { const [x, y] = B((i + 0.5) / 15, (j + 0.5) / 15); stone(g, x, y, lerp(10, 18, (j + 0.5) / 15), false); if (five > k / 5) add(g, () => glowDot(g, x, y, 34, 0.7, GOLD)); });
      g.globalAlpha = 1;
      // checkers
      const cc = 1360, Q = (u: number, v: number) => boardPt(cc, u, v, 380, 720, FLOOR - 120, FLOOR + 150);
      g.globalAlpha = eo(T, 54.4, 0.5);
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const p0 = Q(i / 8, j / 8), p1 = Q((i + 1) / 8, j / 8), p2 = Q((i + 1) / 8, (j + 1) / 8), p3 = Q(i / 8, (j + 1) / 8); g.fillStyle = (i + j) % 2 ? '#2b1d14' : '#d9c7a4'; g.beginPath(); g.moveTo(...p0); g.lineTo(...p1); g.lineTo(...p2); g.lineTo(...p3); g.closePath(); g.fill(); }
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { if ((i + j) % 2 === 0 || (j > 2 && j < 5)) continue; const [x, y] = Q((i + 0.5) / 8, (j + 0.5) / 8); const r = lerp(14, 26, (j + 0.5) / 8); g.fillStyle = j < 3 ? '#a3151b' : '#f2ebdc'; g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, 0, 6.3); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.15, r * 0.3, r * 0.1, 0, 0, 6.3); g.fill(); }
      g.globalAlpha = 1;
      floorFade(g);
      g.restore();
    }}>
      <Lb x={560} y={190} s="五子棋：先手必胜" size={36} col={C.goldHi} o={eo(T, 53.2, 0.4)} />
      <Lb x={1360} y={190} s={`跳棋：和棋`} size={36} col="#efe8da" sub={`SOLVED ${years >= 1989 ? '1989 → ' + years : ''}`} o={eo(T, 54.5, 0.4)} />
      <Lb x={960} y={120} s="已被电脑「算穿」的游戏" size={24} col="#a8ccff" ls="0.3em" o={eo(T, CUT.solved + 0.2, 0.4)} />
    </Scene>
  );
};

/* ================================================================ S6 · poker: hidden cards, a bluff (57.11 – 65.21) */
export const S6: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const flip = pr(T, bt(120) + 0.2, 0.45);
  const cardBack = (g: G, x: number, y: number, s: number, rot: number) => { const w = 110 * s, h = 154 * s; g.save(); g.translate(x, y); g.rotate(rot); const gr = g.createLinearGradient(-w / 2, -h, w / 2, 0); gr.addColorStop(0, '#3b1a4a'); gr.addColorStop(1, '#1a0b22'); g.fillStyle = gr; g.beginPath(); (g as any).roundRect(-w / 2, -h, w, h, 9 * s); g.fill(); g.strokeStyle = 'rgba(255,150,220,.6)'; g.lineWidth = 1.5; g.stroke(); g.strokeStyle = 'rgba(255,150,220,.25)'; for (let k = -6; k < 10; k++) { g.beginPath(); g.moveTo(-w / 2 + 8, -h + 8 + k * 14 * s); g.lineTo(w / 2 - 8, -h + 8 + k * 14 * s + 40 * s); g.stroke(); } g.restore(); };
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 16, 0.7);
      g.save(); cam(g, lerp(1.0, 1.06, pr(T, CUT.poker, 8)), 960, 650);
      spot(g, 960, 900, 1, '255,215,235');
      withReflection(g, () => {
        // the opponent's two cards (hidden → flipped: a bluff with nothing)
        [[-70, -0.12], [60, 0.1]].forEach(([dx, rot], i) => {
          const x = 1300 + dx, sq = Math.abs(Math.cos(flip * Math.PI));
          g.save(); g.translate(x, 0); g.scale(Math.max(0.02, sq), 1); g.translate(-x, 0);
          if (flip < 0.5) cardBack(g, x, FLOOR - 40, 1.15, rot); else card(g, x, FLOOR - 40, 1.15, i ? '7' : '2', i ? '♦' : '♣', !!i, rot);
          g.restore();
        });
        // your cards
        card(g, 560, FLOOR + 10, 1.15, 'A', '♠', false, -0.12); card(g, 650, FLOOR + 16, 1.15, 'K', '♠', false, 0.1);
        // chips
        for (let s = 0; s < 3; s++) for (let k = 0; k < 6 + s * 3; k++) coin(g, 900 + s * 70, FLOOR - 10 - k * 9, 30, 0.35, s !== 1);
      }, 0.22);
      floorFade(g);
      g.restore();
    }}>
      <Lb x={1300} y={170} s={flip < 0.5 ? '对手的牌：看不见' : '2 · 7 —— 什么都没有'} size={34} col={flip < 0.5 ? '#ffaee0' : C.goldHi} sub={flip < 0.5 ? 'HIDDEN' : 'BLUFF'} />
      <Lb x={600} y={FLOOR + 140} s="你的牌" size={26} />
      <Lb x={960} y={120} s="PLURIBUS · CMU × FACEBOOK AI · 2019" size={16} col="rgba(239,232,218,.5)" ls="0.4em" o={eo(T, bt(120), 0.4)} />
    </Scene>
  );
};

/* ================================================================ S7 · mahjong (65.21 – 73.31) */
export const S7: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const HAND = [['一', '#1b1b1b'], ['二', '#1b1b1b'], ['三', '#1b1b1b'], ['五', '#b4161b'], ['五', '#b4161b'], ['中', '#b4161b'], ['中', '#b4161b'], ['中', '#b4161b'], ['東', '#1b1b1b'], ['南', '#1b1b1b'], ['西', '#1b1b1b'], ['北', '#1b1b1b'], ['發', '#1f7a3d'], ['九', '#1a3c8f']];
  const rank = clamp(pr(T, 69.4, 2.2)), dan = Math.max(1, Math.round(lerp(1, 10, easeInOut(rank))));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 16, 0.7);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.mahjong, 8)), 900, 700);
      spot(g, 860, 1300, 0.7, '255,235,200');
      for (let r = 1; r >= 0; r--) for (let i = 0; i < 17; i++) { const k = eo(T, CUT.mahjong + (i + r * 17) * 0.02, 0.3); if (k > 0) { g.globalAlpha = k; tile(g, 170 + i * 80 + r * 18, FLOOR - 140 - r * 34, 0.95, '', '', false); g.globalAlpha = 1; } }
      withReflection(g, () => HAND.forEach(([ch, col], i) => { const k = eo(T, CUT.mahjong + 0.6 + i * 0.05, 0.3); if (k > 0) { g.save(); g.globalAlpha *= k; tile(g, 260 + i * 82, FLOOR, 1.08, ch, col, true, 0.4); g.restore(); } }), 0.22);
      floorFade(g);
      g.restore();
      // the rank meter
      if (T > 69.2) {
        const x = 1660, y0 = 760, y1 = 230;
        g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x - 10, y1, 20, y0 - y1);
        const yy = lerp(y0, y1, easeInOut(rank)); const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#5aa0ff'); gr.addColorStop(1, '#ffd68c'); g.fillStyle = gr; g.fillRect(x - 10, yy, 20, y0 - yy);
        add(g, () => { glowDot(g, x, yy, 60, 0.6, GOLD); if (rank >= 1) sparks(g, x, y1, 71.6, T, 60, GOLD, 1.2, 77); });
      }
    }}>
      <Lb x={760} y={150} s={T < 69.2 ? '136 张牌 · 你只看得见自己这 14 张' : 'SUPHX · 微软亚洲研究院'} size={28} col="#f0d9a8" />
      <div style={{ position: 'absolute', left: 1460, width: 400, top: 160, textAlign: 'center', opacity: eo(T, 69.3, 0.4) }}>
        <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 58, color: C.goldHi, textShadow: '0 0 24px rgba(255,214,140,.6)' }}>{['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][dan - 1]}段</div>
      </div>
      <Lb x={1660} y={790} s="天凤段位" size={22} col={C.dim} o={eo(T, 69.3, 0.4)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: eo(T, 65.6, 0.4) * (1 - pr(T, 69.0, 0.3)), fontFamily: F.lat, fontWeight: 700, fontSize: 120, color: '#ffe7b8', textShadow: '0 0 30px rgba(255,214,140,.7)' }}>
        &gt; 10<sup style={{ fontSize: 64 }}>48</sup>
      </div>
    </Scene>
  );
};

/* ================================================================ S8 · how do you measure it? (73.31 – 79.38) */
export const S8: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const line = eo(T, 76.9, 0.6);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 14, 0.6);
      g.save(); cam(g, lerp(1.04, 1.0, pr(T, CUT.question, 5)), 960, 700);
      gallery(g, T, () => 1, () => 0.55);
      floorFade(g); strip(g, GX0, GX1, FLOOR + 92, 1, line);
      g.restore();
    }}>
      <GalleryLabels appear={() => 1} dim={() => 0.6} />
      <Lb x={960} y={180} s="？" size={150} col={C.goldHi} o={clamp(pop(T, CUT.question + 0.2, 0.3)) * (1 - line)} />
      <Lb x={960} y={FLOOR - 250} s="50%" size={56} col={C.goldHi} o={line} />
    </Scene>
  );
};

/* ================================================================ S9 · the drop: half the chess games become coin tosses (79.38 – 89.51) */
export const S9: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const R = Math.max(0, T - CUT.drop) * 1.4, lift = eo(T, 85.1, 0.8);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 20, 0.8 * eo(T, CUT.drop, 0.3) + 0.2);
      g.save(); cam(g, lerp(1.06, 1.0, eio(T, CUT.gap, 3)) + 0.02 * hit(T, CUT.drop, 0.25), 960, 640);
      spot(g, 960, 1500, 0.4 + 0.5 * eo(T, CUT.drop, 0.3), '255,230,190');
      const cols = 9;
      for (let r = 2; r >= 0; r--) for (let i = 0; i < cols; i++) {
        const s = 0.6 - r * 0.08, x = 960 + (i - (cols - 1) / 2) * (190 - r * 22), y = FLOOR - r * 70;
        const flipme = (i + r) % 2 === 1, d = Math.hypot(x - 960, (y - FLOOR) * 3);
        const k = R > 0 ? clamp((R * 600 - d) / 160) : 0;
        if (flipme && k > 0) { coin(g, x, y - 40 - 120 * Math.sin(k * Math.PI) * (1 - k), 52 - r * 6, lerp(0.05, 0.38, k), true); if (k < 1) add(g, () => sparks(g, x, y - 40, T - 0.25, T, 26, GOLD, 0.6, i * 7 + r)); }
        else king(g, x, y, s * (flipme ? 1 - k * 0.6 : 1), '120,175,255', '160,150,255', (flipme ? 1 - k : 1) * (T < CUT.drop ? 0.4 + 0.6 * eo(T, CUT.gap + i * 0.06, 0.3) : 1));
      }
      floorFade(g);
      strip(g, GX0, GX1, FLOOR + 92, 0.9, lift);
      if (R > 0 && R < 3) add(g, () => { g.strokeStyle = `rgba(255,214,140,${0.4 * (1 - R / 3)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(960, FLOOR - 40, R * 600, R * 200, 0, 0, 6.3); g.stroke(); });
      g.restore();
    }}>
      <Lb x={960} y={130} s="一半国际象棋 ＋ 一半掷硬币 ＝「一半运气」标准线" size={28} col={C.goldHi} o={eo(T, 85.1, 0.4)} />
      <Lb x={960} y={130} s="DUERSCH · LAMBRECHT · OECHSSLER · 2020" size={16} col="rgba(239,232,218,.5)" ls="0.4em" o={eo(T, CUT.drop + 0.4, 0.4) * (1 - pr(T, 84.8, 0.3))} />
    </Scene>
  );
};

/* ================================================================ S10 · the result (89.51 – 97.61) */
export const S10: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const slide = eio(T, 89.9, 1.0), second = T >= 93.5;
  // 100 games: a stronger player's running lead (deterministic walk, tuned so the lead is visible)
  const walk = (seed: number, p: number) => { const out: number[] = [0]; for (let i = 1; i <= 100; i++) out.push(out[i - 1] + (rnd(i, seed) < p ? 1 : -1)); return out; };
  const A = walk(3, 0.6), AMX = Math.max(...A.map(Math.abs), 1);
  const n = Math.floor(lerp(1, 100, pr(T, 93.6, 3.2)));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 12, 0.5);
      if (!second) {
        floorFade(g); strip(g, GX0, GX1, FLOOR - 40, 1, 1);
        const px = lerp(gx(0.12), gx(0.66), slide);
        add(g, () => { glowDot(g, gx(0), FLOOR - 40, 50, 0.5, '120,175,255'); glowDot(g, gx(0.12), FLOOR - 40, 50, 0.5, '120,175,255'); glowDot(g, px, FLOOR - 40, 70, 0.7, '255,110,205'); glowDot(g, px, FLOOR - 40, 12, 1, '255,244,220'); });
      } else {
        const X = (i: number) => 260 + i * 14, Y = (v: number) => 560 - (v / AMX) * 270;
        g.strokeStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(260, 560); g.lineTo(1660, 560); g.stroke();
        add(g, () => {
          g.strokeStyle = 'rgba(255,214,140,.9)'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i <= n; i++) { const y = Y(A[i]); if (i) g.lineTo(X(i), y); else g.moveTo(X(i), y); } g.stroke();
          glowDot(g, X(n), Y(A[n]), 40, 0.6, GOLD);
        });
      }
    }}>
      {!second && (
        <>
          <Lb x={960} y={FLOOR - 290} s="50%" size={48} col={C.goldHi} />
          <Lb x={gx(0.06)} y={FLOOR - 10} s="围棋 · 国际象棋" size={26} col="#a8ccff" />
          <Lb x={lerp(gx(0.12), gx(0.66), slide)} y={FLOOR - 10} s="德州扑克" size={30} col="#ffaee0" />
          <div style={{ position: 'absolute', left: 260, top: 200, width: 1400, display: 'flex', justifyContent: 'space-around', opacity: eo(T, 91.0, 0.4) }}>
            {[['国际象棋', '170+'], ['一半掷硬币的国际象棋', '45'], ['德州扑克', '< 30']].map(([a, b]) => (
              <div key={a} style={{ textAlign: 'center' }}><div style={{ fontFamily: F.lat, fontWeight: 700, fontSize: 92, color: C.goldHi, textShadow: '0 0 24px rgba(255,214,140,.6)', ...LNUM }}>{b}</div><div style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 26, color: C.dim }}>{a}</div></div>
            ))}
          </div>
          <Lb x={960} y={384} s="评分的拉开程度：越大 = 越看实力" size={18} col="rgba(239,232,218,.5)" ls="0.25em" o={eo(T, 91.3, 0.4)} />
        </>
      )}
      {second && (
        <>
          <Lb x={600} y={200} s={`第 ${n} 局`} size={44} col="#efe8da" />
          <Lb x={700} y={600} s="强一档的人：领先越拉越大（示意）" size={24} col={C.dim} />
          <Lb x={1500} y={590} s="75%" size={96} col={C.goldHi} o={eo(T, 96.2, 0.3)} />
        </>
      )}
    </Scene>
  );
};

/* ================================================================ S11 · 金铲铲: a shared pool (97.61 – 105.71) */
export const S11: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const pull = pr(T, 101.9, 3.0);
  const players = Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * 6.283 + Math.PI / 2; return [960 + Math.cos(a) * 620, FLOOR - 80 + Math.sin(a) * 170] as [number, number]; });
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 16, 0.6);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.pool, 8)), 960, 600);
      spot(g, 960, 700, 1, '235,225,255');
      // players' pedestals (back first)
      const order = players.map((p, k) => [p, k] as [[number, number], number]).sort((a, b) => a[0][1] - b[0][1]);
      order.forEach(([[x, y], k]) => { hexPedestal(g, x, y, lerp(48, 70, (y - (FLOOR - 250)) / 340), k === 0 ? '255,214,140' : specAt(0.42), 1); });
      // the shared pool: a cloud of glowing cards
      add(g, () => {
        for (let i = 0; i < 360; i++) {
          const a = rnd(i, 1) * 6.283, r = 150 * Math.sqrt(rnd(i, 2)), owner = i % 8, k = clamp(pull * 1.6 - rnd(i, 3) * 0.6);
          const sx = 960 + Math.cos(a + T * 0.3) * r, sy = FLOOR - 300 + Math.sin(a + T * 0.3) * r * 0.45, [px, py] = players[owner];
          const x = lerp(sx, px, easeInOut(k)), y = lerp(sy, py - 40, easeInOut(k)) - Math.sin(k * Math.PI) * 60;
          glowDot(g, x, y, 5, 0.75, owner === 0 ? GOLD : specAt(0.42));
        }
        glowDot(g, 960, FLOOR - 300, 260, 0.12 * (1 - pull), specAt(0.42));
      });
      floorFade(g);
      g.restore();
    }}>
      <Lb x={960} y={FLOOR - 470} s="公共卡池" size={34} col="#efe8da" sub="SHARED POOL" o={1 - pull} />
      <Lb x={players[0][0]} y={players[0][1] + 40} s="你" size={32} col={C.goldHi} />
      <Lb x={960} y={130} s="8 个人 · 同一个卡池" size={24} col="#d6c8ff" ls="0.3em" />
    </Scene>
  );
};

/* ================================================================ S12 · close (105.71 – 113.81) */
export const S12: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const off = (i: number) => 1 - eo(T, 110.2 + (6 - i) * 0.25, 0.4);
  const coins = Math.floor(lerp(0, 100, pr(T, 106.6, 2.4)));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 12, 0.5);
      g.save(); cam(g, lerp(1.04, 1.0, pr(T, CUT.close, 8)), 960, 700);
      gallery(g, T, () => 1, (i) => Math.max(0.15, off(i)));
      floorFade(g); strip(g, GX0, GX1, FLOOR + 92, 0.6 + 0.4 * (1 - pr(T, 110, 2)));
      g.restore();
      // one game vs a hundred: a tally of tiny coins along the top
      add(g, () => { for (let i = 0; i < coins; i++) { const x = 360 + (i % 50) * 24, y = 170 + Math.floor(i / 50) * 34; glowDot(g, x, y, 9, 0.8, i % 3 ? '255,214,140' : '120,175,255'); } });
    }}>
      <Lb x={960} y={235} s={coins > 0 ? `${coins} 局` : ''} size={30} col={C.goldHi} />
      <GalleryLabels appear={() => 1} dim={off} />
    </Scene>
  );
};

/* ================================================================ end card (113.81 – 121.9) */
export const SEnd: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const t = T - CUT.end, ring = eio(t, 0, 0.8), fo = (a: number) => eo(t, a, 0.4), black = pr(T, CUT.fin - 0.6, 0.6);
  return (
    <Scene f={f} draw={(g) => { stage(g, T); bokeh(g, T, 20, 0.6); floorFade(g); strip(g, 240, 1680, FLOOR + 140, 0.5); add(g, () => { glowDot(g, 960, 420, 800, 0.07, GOLD); sparks(g, 960, 232, CUT.end, T, 80, GOLD, 1.2, 77); }); }}>
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="gec2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
        <circle cx={960} cy={232} r={46} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 232)" />
        <text x={960} y={252} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64 }} fill={C.gold} opacity={fo(0.4)}>J</text>
        <text x={960} y={304} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, letterSpacing: '0.5em' }} fill={C.gold} opacity={0.8 * fo(0.6)}>JUNO</text>
        <text x={960} y={432} textAnchor="middle" opacity={fo(0.5)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 100 }} fill="url(#gec2)">《是菜还是非？》</text>
        <text x={960} y={540} textAnchor="middle" opacity={fo(0.9)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em' }} fill={C.cream}>你最常玩的游戏，运气占几成？</text>
        <text x={960} y={592} textAnchor="middle" opacity={fo(1.1)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.12em' }} fill={C.dim}>@ 那个总说自己"非"的朋友</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: fo(1.4) }}>
        <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 28, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', opacity: fo(1.8), fontFamily: F.sans, fontSize: 17, color: 'rgba(239,232,218,.42)', lineHeight: '28px', ...LNUM }}>
        <div>资料：Duersch, Lambrecht & Oechssler, European Economic Review 2020 · Schaeffer et al., Science 2007 · Brown & Sandholm, Science 2019</div>
        <div>Li et al. 2020 (Suphx) · Tromp 2016 (Go positions) · Zermelo 1913 · 100 局曲线为示意</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: black }} />
    </Scene>
  );
};
