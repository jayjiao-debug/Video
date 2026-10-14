/* 《是菜还是非？》 scenes. Low-key product photography in 2D: objects on a glossy black floor, key lights from above,
   a blue→magenta light strip for the luck spectrum, gold for the brand moments. T = track seconds. */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, LNUM, Canvas, glowDot, rnd, clamp, lerp, pr, eo, eio, pop, hit, easeInOut } from './kit';
import { textPts, particleText, sparks, GOLD } from './lightkit';
import { stage, bokeh, spot, withReflection, floorFade, strip, king, stone, tile, card, die, coin, hexPedestal, shards, cardBack as backOf, coinFace, spatula, shopCard, FLOOR, W, H } from './hero';
import { CUT, bt } from './time';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
const mixc = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',');
const specAt = (u: number) => mixc([120, 175, 255], [255, 110, 205], clamp(u));
const cam = (g: G, s: number, cx = 960, cy = 600, dx = 0) => { g.translate(cx + dx, cy); g.scale(s, s); g.translate(-cx, -cy); };
const kingAt = (g: G, x: number, y: number, s: number, rot = 0, light = 1, rimL = '120,175,255', rimR = '150,160,255', ivory = false) => {
  if (!rot) return king(g, x, y, s, rimL, rimR, light, ivory);
  const px = x + 74 * s * Math.sign(rot); g.save(); g.translate(px, y); g.rotate(rot); g.translate(-px, -y); king(g, x, y, s, rimL, rimR, light, ivory); g.restore();
};

/* ---------------------------------------------------------------- labels */
/* legibility rules (phone, portrait feed: 1080p px ≈ 0.035 mm): anything to be read in Chinese is at least 44 px and set in
   黑体 below 60 px (宋体 hairlines vanish when small); notes in brackets at least 30 px; Latin footnotes at least 22 px;
   nothing to be read below 70 % opacity. Big display text (60 px and up) keeps the brand serif. */
const readable = (col: string) => col.replace(/rgba\(([^)]*),\s*([0-9.]+)\)/, (m, rgb, a) => `rgba(${rgb},${Math.max(0.75, parseFloat(a))})`);
const Lb: React.FC<{ x: number; y: number; s: string; size?: number; col?: string; sub?: string; o?: number; ls?: string }> = ({ x, y, s, size = 30, col = '#efe8da', sub, o = 1, ls = '0.18em' }) => {
  if (o <= 0) return null;
  const latin = /^[\x00-\x7F·×→←—\s]+$/.test(s), note = /^[（(]/.test(s);
  const px = latin ? Math.max(size, 22) : Math.max(size, note ? 30 : 44);
  const display = px >= 60;
  return (
    <div style={{ position: 'absolute', left: x - 700, width: 1400, top: y, textAlign: 'center', opacity: o }}>
      <div style={{ fontFamily: display ? F.serif : latin ? F.mono : F.sans, fontWeight: display ? 700 : latin ? 700 : 700, fontSize: px, letterSpacing: display || latin ? ls : '0.06em', color: readable(col), textShadow: '0 2px 10px rgba(0,0,0,.95), 0 0 2px rgba(0,0,0,.9)', ...LNUM }}>{s}</div>
      {sub && <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.24em', color: 'rgba(239,232,218,.72)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
};
const Scene: React.FC<{ f: number; draw: (g: G) => void; children?: React.ReactNode; o?: number }> = ({ f, draw, children, o = 1 }) => (
  <AbsoluteFill style={{ background: '#030305', opacity: o }}>
    <Canvas dep={f} draw={(g) => { g.save(); draw(g); g.restore(); g.globalCompositeOperation = 'source-over'; }} />
    {children}
  </AbsoluteFill>
);
const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };

/* ================================================================ S0 · cold open (0 – 16.6) */
export const S0: React.FC<{ T: number; f: number; pt?: number }> = ({ T, f, pt }) => {
  const part = pt ?? (T < CUT.cards ? 0 : T < CUT.king ? 1 : T < CUT.strip ? 2 : 3);
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
    const RANKS = ['3', '3', '3', '4', '5', '5', '7', '7', '7', '8', '9', '9', 'J', 'J', 'Q', 'K', 'K'], SUITS: [string, boolean][] = [['♠', false], ['♥', true], ['♣', false], ['♦', true]];
    const HAND: [string, string, boolean][] = RANKS.map((r, i) => [r, SUITS[(i * 3 + 1) % 4][0], SUITS[(i * 3 + 1) % 4][1]]);
    return (
      <Scene f={f} draw={(g) => {
        stage(g, T); bokeh(g, T, 18, 0.8);
        g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.cards, 4)));
        spot(g, 960, 760, 1, '255,225,235');
        // the hand fans open wide (the cards' own motion), with a soft trail while it opens, then a light sweeps across it
        const open = eio(T, CUT.cards + 0.05, 0.8), PX = 960, PY = FLOOR - 24, R = 120, STEP = 0.15;
        const fan = (k: number, alpha: number) => HAND.forEach(([r, su, red], i) => { const a = (i - 8) * STEP * k; g.save(); g.globalAlpha *= alpha; card(g, PX + Math.sin(a) * R, PY - Math.cos(a) * R, 1.38, r, su, red, a); g.restore(); });
        add(g, () => { const sh = g.createRadialGradient(PX, FLOOR + 4, 0, PX, FLOOR + 4, 420); sh.addColorStop(0, 'rgba(255,190,220,.10)'); sh.addColorStop(1, 'rgba(255,190,220,0)'); g.fillStyle = sh; g.fillRect(PX - 420, FLOOR - 60, 840, 120); });
        if (open < 1) [0.06, 0.12, 0.18].forEach((d, j) => fan(eio(T - d, CUT.cards + 0.05, 0.8), 0.12 - j * 0.03));
        fan(open, 1);
        const sw = pr(T, CUT.cards + 1.1, 0.9);
        if (sw > 0 && sw < 1) add(g, () => { const x = lerp(PX - 520, PX + 520, sw); const gr = g.createLinearGradient(x - 90, 0, x + 90, 0); gr.addColorStop(0, 'rgba(255,245,230,0)'); gr.addColorStop(0.5, 'rgba(255,245,230,.28)'); gr.addColorStop(1, 'rgba(255,245,230,0)'); g.save(); g.translate(x, PY - 180); g.rotate(0.35); g.translate(-x, -(PY - 180)); g.fillStyle = gr; g.fillRect(x - 90, PY - 460, 180, 520); g.restore(); });
        floorFade(g);
        g.restore();
      }}>
        <Lb x={960} y={150} s="一手烂牌" size={40} col="#ffd1ea" sub="NO 2 · NO JOKER · NO BOMB" o={eo(T, CUT.cards + 1.2, 0.4)} />
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
        withReflection(g, () => { kingAt(g, 1110, FLOOR, 0.9, 0, 1, '255,236,200', '255,214,160', true); kingAt(g, 820, FLOOR, 0.9, -fall * 1.45); }, 0.28);
        floorFade(g);
        if (fall >= 1) add(g, () => { sparks(g, 640, FLOOR - 10, bt(19) + 0.7, T, 40, '200,220,255', 0.7, 5); });
        g.restore();
      }}>
        <Lb x={960} y={170} s="将死" size={44} col="#cfe0ff" sub="CHECKMATE" o={eo(T, bt(20), 0.4)} />
      </Scene>
    );
  }
  // part 3: the strip ignites; luck vs skill
  const k = eio(T, CUT.strip, 1.1);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.9);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.strip, 4.5)));
      floorFade(g);
      if (k > 0) strip(g, 960 - 820 * k, 960 + 820 * k, FLOOR + 40, 1);
      { const a = eo(T, bt(25), 0.5); if (a > 0) { g.save(); g.globalAlpha = a; coinFace(g, 960, FLOOR + 40 - 100 * 0.2, 100, 1, 0.3, '菜', [0, 1]); g.restore(); add(g, () => glowDot(g, 960, FLOOR + 20, 200, 0.25 * a, GOLD)); } }
      add(g, () => { glowDot(g, 960 - 820 * k, FLOOR + 40, 120, 0.4 * k, '120,175,255'); glowDot(g, 960 + 820 * k, FLOOR + 40, 120, 0.4 * k, '255,110,205'); });
      g.restore();
    }}>
      <Lb x={300} y={FLOOR + 90} s="实力" size={56} col="#a8ccff" sub="SKILL" o={eo(T, CUT.strip + 0.8, 0.4)} />
      <Lb x={1620} y={FLOOR + 90} s="运气" size={56} col="#ffaee0" sub="LUCK" o={eo(T, CUT.strip + 1.0, 0.4)} />
    </Scene>
  );
};

/* ================================================================ S1 · title: a coin tossed between 菜 and 非, landing on the hit */
export const TITLE_START = bt(27);
const COIN_R = 100, LAND_Y = FLOOR + 40;
const strip3 = (g: G, T: number) => {
  floorFade(g); strip(g, 140, 1780, LAND_Y, 1);
  add(g, () => { glowDot(g, 140, LAND_Y, 120, 0.4, '120,175,255'); glowDot(g, 1780, LAND_Y, 120, 0.4, '255,110,205'); });
};
export const S1: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const HIT = CUT.title, t0 = TITLE_START, crisp = eo(T, HIT + 0.03, 0.35), out = 1 - pr(T, CUT.gallery - 0.25, 0.25);
  const q = clamp((T - t0) / (HIT - t0));
  const PH0 = Math.acos(0.3), REVS = 5;                           // leaves the strip lying flat, lands edge-on after 5 turns
  const phi = PH0 + q * (REVS * 2 * Math.PI + Math.PI / 2 - PH0);
  const air = T < HIT, cy = LAND_Y - 4 * 450 * q * (1 - q);
  // after the landing it spins on its edge, slowing (an own clock: ~3.4 → 2.6 turns a second)
  const ts = Math.max(0, T - HIT), theta = 2 * Math.PI * (3.4 * ts - 0.1 * ts * ts) + Math.PI / 2;
  const showA = air ? Math.cos(phi) >= 0 : Math.cos(theta) >= 0;   // 菜 or 非 facing us
  const tint = showA ? '120,175,255' : '255,110,205';
  return (
    <Scene f={f} o={out} draw={(g) => {
      stage(g, T); bokeh(g, T, 22, 0.9);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.strip, 4.5)) + 0.015 * hit(T, HIT, 0.25));
      strip3(g, T);
      add(g, () => {
        particleText(g, textPts('《是菜还是非？》', '900 150px "Noto Serif CJK SC"', 960, 430, 3), T, bt(29), HIT, GOLD, 21, 1100);
        if (T >= HIT) { sparks(g, 960, LAND_Y - 4, HIT, T, 160, GOLD, 2.6, 9); sparks(g, 960, 430, HIT, T, 120, GOLD, 3.0, 4); g.fillStyle = `rgba(255,244,220,${0.6 * hit(T, HIT, 0.25)})`; g.fillRect(200, 429, 1520, 3); }
        glowDot(g, 960, 430, 760, 0.1 * crisp);
        glowDot(g, 960, (air ? cy : LAND_Y - COIN_R), 190, 0.22, tint);
      });
      if (air) {
        const c = Math.cos(phi), y = cy - COIN_R * 0.2;
        // the reflection on the floor, then the coin
        g.save(); g.globalAlpha = 0.1 * clamp(1 - (LAND_Y - y) / 400); g.translate(0, 2 * LAND_Y); g.scale(1, -1); coinFace(g, 960, y, COIN_R, 1, Math.abs(c), showA ? '菜' : '非', [0, Math.sin(phi) > 0 ? 1 : -1]); g.restore();
        coinFace(g, 960, y, COIN_R, 1, Math.abs(c), showA ? '菜' : '非', [0, Math.sin(phi) > 0 ? 1 : -1]);
      } else {
        const c = Math.cos(theta), y = LAND_Y - COIN_R, wob = 0.03 * Math.sin(ts * 5);
        g.save(); g.translate(960, LAND_Y); g.rotate(wob); g.translate(-960, -LAND_Y);
        g.save(); g.globalAlpha = 0.08; g.translate(0, 2 * LAND_Y); g.scale(1, -1); coinFace(g, 960, y, COIN_R, Math.abs(c), 1, showA ? '菜' : '非', [Math.sin(theta) > 0 ? 1 : -1, 0]); g.restore();
        coinFace(g, 960, y, COIN_R, Math.abs(c), 1, showA ? '菜' : '非', [Math.sin(theta) > 0 ? 1 : -1, 0]);
        g.restore();
      }
      g.restore();
    }}>
      <Lb x={300} y={FLOOR + 90} s="实力" size={56} col="#a8ccff" sub="SKILL" o={1 - pr(T, HIT - 0.2, 0.3)} />
      <Lb x={1620} y={FLOOR + 90} s="运气" size={56} col="#ffaee0" sub="LUCK" o={1 - pr(T, HIT - 0.2, 0.3)} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="s1g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
        <text x={960} y={482} textAnchor="middle" opacity={crisp * 0.92} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 150, letterSpacing: '0.04em' }} fill="url(#s1g)">《是菜还是非？》</text>
        <text x={960} y={572} textAnchor="middle" opacity={eo(T, HIT + 0.5, 0.5)} style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.42em' }} fill={C.dim}>SKILL · LUCK · EVERY GAME YOU PLAY</text>
      </svg>
    </Scene>
  );
};

/* ================================================================ the gallery (shared by S2, S8, S12) */
const GX0 = 120, GX1 = 1800;
type Obj = { u: number; name: string; en: string; w: number; draw: (g: G, x: number, t: number) => void };
/* each object has its own idle action on its own clock (periods are not multiples of the beat; see edit-rhythm §2) */
/* v3: no loops. each object performs its action once when it appears, then rests (the owner: too much movement is worse) */
const once = (t: number, a: number, b: number, P: number) => ({ c: 0, p: a + clamp(t / ((b - a) * P)) * (b - a) });
const GO_BASE: [number, number, boolean][] = [[-40, 0, true], [30, -4, false], [0, -26, false], [-60, 22, false], [52, 20, true], [10, 18, true]];
const GO_MORE: [number, number][] = [[-22, 28, ], [64, -10], [-70, -8], [36, 34], [-8, -48], [80, 30], [-86, 30], [20, -30]];
const goStones = (g: G, x: number, t: number) => {
  GO_BASE.forEach(([dx, dy, wh]) => stone(g, x + dx, FLOOR - 14 + dy, 34, wh));
  // stones placed one at a time, unhurried and uneven, like a player thinking
  let tk = 0.7;
  for (let k = 0; k < 1; k++) {
    if (t < tk) break;
    const e = clamp((t - tk) / 0.28), drop = (1 - e) * (1 - e) * 70, bounce = e >= 1 ? 0 : 0;
    const [dx, dy] = GO_MORE[k];
    g.save(); g.globalAlpha *= clamp(e * 3); stone(g, x + dx, FLOOR - 14 + dy - drop - bounce, 34, k % 2 === 0); g.restore();
    if (e >= 1 && t - tk < 0.9) add(g, () => { g.strokeStyle = `rgba(255,236,200,${0.5 * (1 - (t - tk - 0.28) / 0.62)})`; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x + dx, FLOOR - 14 + dy + 4, 20 + 50 * (t - tk), 6 + 15 * (t - tk), 0, 0, 6.3); g.stroke(); });
    tk += 1.55 + 0.9 * rnd(k, 61);
  }
};
const chessMove = (g: G, x: number, t: number) => {
  const { c, p } = once(t, 0.6, 0.9, 3.7), from = c % 2 ? 26 : -26, to = -from;
  const m = easeInOut(clamp((p - 0.6) / 0.3)), lift = Math.sin(Math.PI * clamp((p - 0.6) / 0.3)) * 22;
  king(g, x + lerp(from, to, m), FLOOR - lift, 0.92);
  if (p > 0.9 && p < 0.99) add(g, () => glowDot(g, x + to, FLOOR, 60, 0.35 * (1 - (p - 0.9) / 0.09), '200,220,255'));
};
const shopRoll = (g: G, x: number, t: number) => {
  // the spatula, a light glint running up it now and then
  const gl = once(t, 0, 0.3, 4.3);
  spatula(g, x + 6, FLOOR, 0.74, 0.05, gl.p < 0.3 ? gl.p / 0.3 : -1);
  // a three-slot shop above it that rerolls (fast click-click, then a pause)
  const { c, p } = once(t, 0.78, 0.96, 2.35), roll = clamp((p - 0.78) / 0.18);
  [-1, 0, 1].forEach((j) => {
    const cx = x + j * 70, cy = FLOOR - 322, kOld = Math.floor(rnd(c * 3 + j, 71) * 5), kNew = Math.floor(rnd((c + 1) * 3 + j, 71) * 5);
    const r = clamp(roll * 1.6 - (j + 1) * 0.25), sq = Math.abs(Math.cos(r * Math.PI));
    g.save(); g.translate(cx, cy); g.scale(Math.max(0.03, sq), 1); g.translate(-cx, -cy);
    const tier = r < 0.5 ? kOld : kNew; shopCard(g, cx, cy, 60, 82, tier, tier === 4);
    g.restore();
  });
};
const mjFlip = (g: G, x: number, t: number) => {
  tile(g, x - 78, FLOOR, 1.0, '中', '#b4161b'); tile(g, x - 16, FLOOR, 1.0, '發', '#1f7a3d');
  const { c, p } = once(t, 0.4, 0.84, 4.1), DRAW = [['東', '#1b1b1b'], ['九萬', '#1b1b1b'], ['白', '#1b1b1b'], ['五萬', '#1b1b1b'], ['北', '#1b1b1b']][c % 5];
  const ang = p < 0.4 ? 0 : p < 0.5 ? (p - 0.4) / 0.1 : p < 0.85 ? 1 : p < 0.95 ? 1 - (p - 0.85) / 0.1 : 0;
  const sq = Math.abs(Math.cos(ang * Math.PI)), up = ang >= 0.5, cx = x + 46 + 28, lift = Math.sin(ang * Math.PI) * 26;
  g.save(); g.translate(cx, 0); g.scale(Math.max(0.03, sq), 1); g.translate(-cx, 0);
  tile(g, x + 46, FLOOR - lift, 1.0, up ? DRAW[0] : '', up ? DRAW[1] : '', up); g.restore();
};
const pokerFlip = (g: G, x: number, t: number) => {
  card(g, x - 26, FLOOR, 0.95, 'A', '♠', false, -0.16);
  const { p } = once(t, 0.35, 0.84, 3.45), ang = p < 0.35 ? 0 : p < 0.45 ? (p - 0.35) / 0.1 : p < 0.85 ? 1 : p < 0.95 ? 1 - (p - 0.85) / 0.1 : 0;
  const cx = x + 28, sq = Math.abs(Math.cos(ang * Math.PI)), lift = Math.sin(ang * Math.PI) * 18;
  g.save(); g.translate(cx, 0); g.scale(Math.max(0.03, sq), 1); g.translate(-cx, 0);
  if (ang >= 0.5) card(g, cx, FLOOR + 6 - lift, 0.95, 'K', '♥', true, 0.14); else backOf(g, cx, FLOOR + 6 - lift, 0.95, 0.14);
  g.restore();
};
const DIE_FACES: [number, number, number][] = [[5, 3, 1], [6, 2, 4], [1, 4, 5], [3, 6, 5], [2, 1, 3], [4, 5, 6]];
/* gallery die: three takes for the owner (0 = v3 hop-and-spin) */
export const GAL = { die: 1 };   // the owner picked take 1 (dropped, no spin)
const ivoryDie = (g: G, x: number, y: number, a: number, pips: number, top = 5, side = 3) => {
  const d = a * 0.26, P: Record<number, number[][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  g.fillStyle = '#fbf8f2'; g.beginPath(); g.moveTo(x - a / 2, y - a); g.lineTo(x - a / 2 + d, y - a - d); g.lineTo(x + a / 2 + d, y - a - d); g.lineTo(x + a / 2, y - a); g.closePath(); g.fill();
  g.fillStyle = '#cfc8bb'; g.beginPath(); g.moveTo(x + a / 2, y - a); g.lineTo(x + a / 2 + d, y - a - d); g.lineTo(x + a / 2 + d, y - d); g.lineTo(x + a / 2, y); g.closePath(); g.fill();
  const fr = g.createLinearGradient(x - a / 2, y - a, x + a / 2, y); fr.addColorStop(0, '#fffdf8'); fr.addColorStop(1, '#e2dccf');
  g.fillStyle = fr; g.beginPath(); (g as any).roundRect(x - a / 2, y - a, a, a, a * 0.14); g.fill();
  g.fillStyle = pips === 1 ? '#c8102e' : '#1b1b22'; P[pips].forEach(([i, j]) => { g.beginPath(); g.arc(x + i * a * 0.26, y - a / 2 + j * a * 0.26, a * (pips === 1 ? 0.11 : 0.075), 0, 6.3); g.fill(); });
  g.fillStyle = 'rgba(27,27,34,.75)'; P[top].forEach(([i, j]) => { g.beginPath(); g.ellipse(x + d / 2 + i * a * 0.24 + j * d * 0.25, y - a - d / 2 + j * d * 0.28, a * 0.055, a * 0.022, 0, 0, 6.3); g.fill(); });
  g.fillStyle = 'rgba(27,27,34,.65)'; P[side].forEach(([i, j]) => { g.beginPath(); g.ellipse(x + a / 2 + d / 2 + i * d * 0.25, y - a / 2 - d / 2 + j * a * 0.24 - i * d * 0.25, a * 0.02, a * 0.05, 0, 0, 6.3); g.fill(); });
};
const dieTakes = (g: G, x: number, t: number) => {
  const A = 112;
  if (GAL.die === 1) {
    // take 1 · dropped: falls straight, two small bounces, a squash, no spin
    t += 0.3;                                                    // falls from the moment it appears
    const FALL = 0.34, k = clamp(t / FALL), after = Math.max(0, t - FALL);
    const y = t < FALL ? -(1 - k * k) * 300 : -Math.abs(Math.sin(after * 11)) * 34 * Math.exp(-after * 5.5);
    const sq = t < FALL ? 0 : 0.07 * Math.exp(-after * 9) * Math.abs(Math.cos(after * 11));
    const pips = t < FALL ? 2 : after < 0.29 ? 6 : 5;
    g.save(); g.translate(x, FLOOR); g.scale(1 + sq * 0.6, 1 - sq); g.translate(-x, -FLOOR); ivoryDie(g, x, FLOOR + y, A, pips); g.restore();
    return;
  }
  if (GAL.die === 2) {
    // take 2 · rolled in: tumbles over its edges from the right, a new face every quarter turn, slowing to rest
    const dur = 0.95, q = clamp(t / dur), u = 1 - Math.pow(1 - q, 2.2), N = 3;
    const turns = (1 - u) * N, face = Math.ceil(turns - 1e-6), resid = -(face - turns) * (Math.PI / 2);
    const xx = lerp(x + 320, x, u), lift = (A / 2) * (Math.abs(Math.cos(resid)) + Math.abs(Math.sin(resid)) - 1), cy = FLOOR - lift - A / 2;
    g.save(); g.translate(xx, cy); g.rotate(resid); g.translate(-xx, -cy); ivoryDie(g, xx, FLOOR - lift, A, [5, 2, 6, 4][face % 4], [3, 3, 5, 1][face % 4], [1, 6, 4, 2][face % 4]); g.restore();
    return;
  }
  // take 3 · under a cup: a dice cup lifts away and the die is simply there
  ivoryDie(g, x, FLOOR, A, 5);
  const lift = eio(t, 0.15, 0.7), cx = x + 18, top = FLOOR - 230 - lift * 420, tilt = lift * 0.18;
  if (lift < 1) {
    g.save(); g.globalAlpha *= 1 - pr(t, 0.6, 0.25); g.translate(cx, top + 115); g.rotate(tilt); g.translate(-cx, -(top + 115));
    const cg = g.createLinearGradient(cx - 100, 0, cx + 100, 0); cg.addColorStop(0, '#1a0f0a'); cg.addColorStop(0.45, '#4a2a18'); cg.addColorStop(0.6, '#6b3e22'); cg.addColorStop(1, '#140a06');
    g.fillStyle = cg; g.beginPath(); g.moveTo(cx - 70, top); g.lineTo(cx + 70, top); g.lineTo(cx + 104, top + 230); g.lineTo(cx - 104, top + 230); g.closePath(); g.fill();
    g.fillStyle = goldRim; g.fillRect(cx - 106, top + 214, 212, 16); g.fillRect(cx - 72, top - 4, 144, 10);
    g.restore();
  }
};
const goldRim = '#c9973f';
const dieRoll = (g: G, x: number, t: number) => {
  if (GAL.die) return dieTakes(g, x, t);
  const { c, p } = once(t, 0.5, 1.0, 3.1), q = clamp((p - 0.5) / 0.5);
  if (q <= 0) return die(g, x, FLOOR - 62, 1.0, DIE_FACES[c % 6]);
  // three hops, each lower and shorter, tumbling
  const hops = [0.45, 0.33, 0.22], hs = [80, 32, 10]; let acc = 0, y = 0, hopI = 3, hq = 0;
  for (let i = 0; i < 3; i++) { if (q < acc + hops[i]) { hopI = i; hq = (q - acc) / hops[i]; break; } acc += hops[i]; }
  if (hopI < 3) y = 4 * hs[hopI] * hq * (1 - hq);
  const spin = hopI < 3 ? (1 - hopI / 3) * Math.sin(hq * Math.PI) * 0.9 * (c % 2 ? 1 : -1) : 0;
  const faces = hopI < 3 ? DIE_FACES[(c + hopI + 2) % 6] : DIE_FACES[(c + 1) % 6];
  g.save(); g.translate(x, FLOOR - 62 - y); g.rotate(spin); g.translate(-x, -(FLOOR - 62 - y)); die(g, x, FLOOR - 62 - y, 1.0, faces); g.restore();
};
const coinToss = (g: G, x: number, t: number) => {
  const { p } = once(t, 0.42, 0.86, 2.85), q = clamp((p - 0.42) / 0.42);
  if (q <= 0 || q >= 1) { const s = q >= 1 ? hit(p, 0.84, 0.03) : 0; return coin(g, x, FLOOR - 22 - 6 * s, 78, 0.35 + 0.05 * s, true); }
  const ph = Math.acos(0.35) + q * (6 * Math.PI), y = 4 * 180 * q * (1 - q);
  coin(g, x, FLOOR - 22 - y, 78, Math.max(0.04, Math.abs(Math.cos(ph))), true);
};
const OBJ: Obj[] = [
  { u: 0.0, name: '围棋', en: 'GO', w: 220, draw: goStones },
  { u: 0.12, name: '国际象棋', en: 'CHESS', w: 260, draw: chessMove },
  { u: 0.42, name: '金铲铲', en: 'AUTO-BATTLER', w: 300, draw: shopRoll },
  { u: 0.58, name: '麻将', en: 'MAHJONG', w: 260, draw: mjFlip },
  { u: 0.72, name: '德州扑克', en: "HOLD'EM", w: 260, draw: pokerFlip },
  { u: 0.87, name: '扔骰子', en: 'DICE', w: 220, draw: dieRoll },
  { u: 1.0, name: '掷硬币', en: 'COIN', w: 220, draw: coinToss },
];
const gx = (u: number) => lerp(GX0 + 90, GX1 - 90, u);
const gallery = (g: G, T: number, appear: (i: number) => number, dim: (i: number) => number = () => 1, at: (i: number) => number = () => T) => {
  OBJ.forEach((o, i) => { const k = appear(i); if (k > 0) spot(g, gx(o.u), o.w * 1.2, 0.9 * k * dim(i), o.u < 0.3 ? '200,220,255' : o.u > 0.7 ? '255,215,235' : '235,225,255'); });
  OBJ.forEach((o, i) => { const k = appear(i); if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 1.5) * (0.25 + 0.75 * dim(i)); g.translate(0, (1 - easeInOut(clamp(k))) * 40); g.save(); g.beginPath(); g.rect(0, 0, W, FLOOR + 84); g.clip(); withReflection(g, () => o.draw(g, gx(o.u), at(i)), 0.25); g.restore(); g.restore(); });
};
const GalleryLabels: React.FC<{ appear: (i: number) => number; dim?: (i: number) => number }> = ({ appear, dim = () => 1 }) => (
  <>{OBJ.map((o, i) => <Lb key={o.name} x={gx(o.u)} y={FLOOR + 104} s={o.name} size={28} o={clamp(appear(i) * 1.4) * (0.3 + 0.7 * dim(i))} />)}</>
);

/* ================================================================ S2 · the spectrum (20.66 – 28.76) */
const APPEAR = [bt(40), bt(41), bt(43), bt(44), bt(45), bt(47), bt(48)];
export const S2: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const ap = (i: number) => eo(T, APPEAR[i], 0.45);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 12, 0.55);
      g.save(); cam(g, lerp(1.0, 1.03, pr(T, CUT.gallery, 8)), 960, 700);
      gallery(g, T, ap, () => 1, (i) => Math.max(0, T - APPEAR[i] - 0.3));
      floorFade(g); strip(g, GX0, GX1, FLOOR + 92, 1);
      OBJ.forEach((o, i) => { if (T > APPEAR[i]) add(g, () => sparks(g, gx(o.u), FLOOR + 92, APPEAR[i], T, 26, specAt(o.u), 0.6, i)); });
      g.restore();
    }}>
      <GalleryLabels appear={ap} />
      <Lb x={960} y={130} s="（位置为示意）" size={30} col="rgba(239,232,218,.75)" o={eo(T, bt(49), 0.4)} />
    </Scene>
  );
};

/* ================================================================ S3 · chess: settled in theory (28.76 – 40.91) */
export const S3: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const tree = pr(T, CUT.tree, 1.6), outsK = [bt(72), bt(74), bt(76)].map((t) => pop(T, t, 0.3));
  const root = [960, FLOOR - 0.8 * 330 - 6], outs = [[600, 230], [960, 215], [1320, 230]];
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 16, 0.7);
      g.save(); cam(g, lerp(1.0, 1.06, pr(T, CUT.chess, 12)), 960, 560);
      spot(g, 960, 460, 1.2, '210,225,255'); spot(g, 620, 320, 0.85 * (1 - pr(T, CUT.tree, 0.6)), '220,230,255');
      withReflection(g, () => { king(g, 960, FLOOR, 0.8); if (T < CUT.tree + 0.6) [[-40, 0, true], [30, -4, false], [0, -26, false], [-60, 22, false], [52, 20, true], [10, 18, true]].forEach(([dx, dy, wh]) => stone(g, 620 + (dx as number), FLOOR - 14 + (dy as number), 34, wh as boolean)); }, 0.3);
      if (tree > 0) add(g, () => {
        // every move branches (3 shown per node), level by level, up to 81 positions; then each ends in one of three results
        const RY = root[1], LV = 4, X0 = 470, X1 = 1450, STEP = (RY - 287) / LV;
        const node = (l: number, j: number): [number, number] => [X0 + ((j + 0.5) * (X1 - X0)) / Math.pow(3, l + 1), RY - (l + 1) * STEP];
        for (let l = 0; l < LV; l++) {
          const k = clamp(tree * LV * 1.05 - l), n = Math.pow(3, l + 1); if (k <= 0) break;
          for (let j = 0; j < n; j++) {
            const [cx, cy] = node(l, j), [px, py] = l ? node(l - 1, Math.floor(j / 3)) : [root[0], root[1]];
            g.strokeStyle = `rgba(150,190,255,${0.5 - l * 0.09})`; g.lineWidth = 1.6 - l * 0.3; g.beginPath(); g.moveTo(px, py); g.lineTo(lerp(px, cx, k), lerp(py, cy, k)); g.stroke();
            if (k >= 1) glowDot(g, cx, cy, 7 - l, 0.8, '200,220,255');
          }
        }
        for (let j = 0; j < 81; j++) {
          const o = Math.floor(rnd(j, 41) * 3), k = clamp(outsK[o]); if (k <= 0) continue;
          const [lx, ly] = node(LV - 1, j), [ox, oy] = outs[o];
          g.strokeStyle = `rgba(255,214,140,${0.16 * k})`; g.lineWidth = 1; g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx, (ly + oy) / 2, lerp(lx, ox, k), lerp(ly, oy, k)); g.stroke();
        }
        glowDot(g, root[0], root[1], 90, 0.45, '200,220,255');
        outs.forEach(([x, y], i) => { const k = outsK[i]; if (k > 0) { glowDot(g, x, y, 110 * k, 0.32, '255,214,140'); glowDot(g, x, y, 12, k, '255,244,220'); } });
      });
      floorFade(g);
      g.restore();
    }}>
      {['先手赢', '和棋', '后手赢'].map((s, i) => <Lb key={s} x={[560, 960, 1360][i]} y={[145, 130, 145][i]} s={s} size={34} col={C.goldHi} o={clamp(outsK[i])} />)}
      <Lb x={790} y={FLOOR + 104} s="围棋 · 国际象棋" size={28} o={1 - pr(T, CUT.tree, 0.5)} />
      <Lb x={960} y={150} s="信息全公开 · 没有骰子" size={40} col="#cfe0ff" sub="EVERYTHING ON THE TABLE" o={eo(T, 28.95, 0.4) * (1 - pr(T, CUT.tree - 0.3, 0.3))} />
      <Lb x={960} y={FLOOR + 140} s="ZERMELO · 1913" size={16} col="rgba(239,232,218,.75)" ls="0.4em" o={eo(T, CUT.tree + 0.5, 0.5)} />
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
      <Lb x={560} y={190} s={T < 52.9 ? '五子棋' : '五子棋：先手必胜'} size={36} col={T < 52.9 ? '#efe8da' : C.goldHi} o={eo(T, 49.3, 0.4)} />
      <Lb x={1360} y={190} s={`跳棋：和棋`} size={36} col="#efe8da" sub={`SOLVED ${years >= 1989 ? '1989 → ' + years : ''}`} o={eo(T, 54.5, 0.4)} />
      <Lb x={960} y={120} s="已被电脑「算穿」的游戏" size={24} col="#a8ccff" ls="0.3em" o={eo(T, CUT.solved + 0.2, 0.4)} />
    </Scene>
  );
};

/* ================================================================ S6 · poker: hidden information, then a bluff (57.11 – 65.21)
   the AI pushes its chips, you fold your A-K, it takes the pot, and only then shows what it had: 2-7, nothing */
export const S6: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const PUSH = 61.2, FOLD = 61.95, TAKE = 62.6, SHOW = 63.25;
  const push = eio(T, PUSH, 0.5), fold = eio(T, FOLD, 0.45), take = eio(T, TAKE, 0.5), flip = pr(T, SHOW, 0.45);
  const cardBack = (g: G, x: number, y: number, s: number, rot: number) => backOf(g, x, y, s, rot);
  const chips = (g: G, x: number, y: number, n: number, gold: boolean) => { for (let k = 0; k < n; k++) coin(g, x, y - k * 9, 30, 0.35, gold); };
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 16, 0.7);
      g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.poker, 8)), 960, 650);
      spot(g, 960, 900, 1, '255,215,235'); spot(g, 1300, 360, 0.25 + 0.5 * flip, '255,200,235');
      withReflection(g, () => {
        // the AI's two cards: hidden, then shown
        [[-70, -0.12], [60, 0.1]].forEach(([dx, rot], i) => {
          const x = 1300 + dx, sq = Math.abs(Math.cos(flip * Math.PI));
          g.save(); g.translate(x, 0); g.scale(Math.max(0.02, sq), 1); g.translate(-x, 0);
          if (flip < 0.5) cardBack(g, x, FLOOR - 40, 1.15, rot); else card(g, x, FLOOR - 40, 1.15, i ? '7' : '2', i ? '♦' : '♣', !!i, rot);
          g.restore();
        });
        // your A-K: folded (slides back and turns down, dims)
        g.save(); g.globalAlpha *= 1 - 0.55 * fold;
        [[560, -0.12, 'A'], [650, 0.1, 'K']].forEach(([x, rot, r]) => {
          const xx = (x as number) - 70 * fold, sq = Math.abs(Math.cos(Math.min(1, fold) * Math.PI));
          g.save(); g.translate(xx, 0); g.scale(Math.max(0.02, sq), 1); g.translate(-xx, 0);
          if (fold < 0.5) card(g, xx, FLOOR, 1.15, r as string, '♠', false, rot as number); else cardBack(g, xx, FLOOR, 1.15, rot as number);
          g.restore();
        });
        g.restore();
        // chips: your stack stays; the AI's stack is pushed into the pot, then the pot goes to the AI
        chips(g, 790, FLOOR - 10, 6, true);
        const aiX = lerp(lerp(1110, 960, push), 1040, take);
        chips(g, aiX, FLOOR - 10, 12, false); chips(g, lerp(960, 985, take), FLOOR - 10, 4 * Math.min(1, push * 3) | 0, true);
      }, 0.22);
      floorFade(g);
      g.restore();
    }}>
      <Lb x={1300} y={150} s={flip < 0.5 ? (T < PUSH ? '隐藏信息：对手的牌' : 'AI：全押') : '2 · 7 —— 什么都没有'} size={34} col={flip < 0.5 ? '#ffaee0' : C.goldHi} sub={flip < 0.5 ? (T < PUSH ? 'HIDDEN INFORMATION' : 'ALL IN') : 'BLUFF'} />
      <Lb x={600} y={FLOOR + 118} s={T < FOLD + 0.2 ? '你的牌' : '你：弃牌'} size={26} col={T < FOLD + 0.2 ? '#efe8da' : '#a8ccff'} />
      <Lb x={1300} y={FLOOR + 118} s="AI · PLURIBUS" size={22} col="rgba(239,232,218,.75)" ls="0.25em" o={eo(T, 61.1, 0.4)} />
      <Lb x={960} y={110} s="PLURIBUS · CMU × FACEBOOK AI · 2019" size={16} col="rgba(239,232,218,.6)" ls="0.4em" o={eo(T, 61.1, 0.4)} />
    </Scene>
  );
};

/* ================================================================ S7 · mahjong (65.21 – 73.31) */
export const S7: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const HAND = [['一萬', '#1b1b1b'], ['二萬', '#1b1b1b'], ['三萬', '#1b1b1b'], ['五萬', '#1b1b1b'], ['五萬', '#1b1b1b'], ['中', '#b4161b'], ['中', '#b4161b'], ['中', '#b4161b'], ['東', '#1b1b1b'], ['南', '#1b1b1b'], ['西', '#1b1b1b'], ['北', '#1b1b1b'], ['發', '#1f7a3d'], ['九萬', '#1b1b1b']];
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
      <Lb x={760} y={150} s={T < 69.2 ? '136 张牌 · 你只看得见自己这 14 张' : 'SUPHX · 微软亚洲研究院'} size={28} col="#f0d9a8" sub={T < 69.2 ? 'HIDDEN INFORMATION' : undefined} />
      <div style={{ position: 'absolute', left: 1460, width: 400, top: 160, textAlign: 'center', opacity: eo(T, 69.3, 0.4) }}>
        <div style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 58, color: C.goldHi, textShadow: '0 0 24px rgba(255,214,140,.6)' }}>{['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][dan - 1]}段</div>
      </div>
      <Lb x={1660} y={790} s="天凤段位" size={22} col={C.dim} o={eo(T, 69.3, 0.4)} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: eo(T, 65.6, 0.4) * (1 - pr(T, 69.0, 0.3)), fontFamily: F.serif, fontWeight: 900, fontSize: 110, color: '#ffe7b8', textShadow: '0 0 30px rgba(255,214,140,.7)', ...LNUM }}>
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
      gallery(g, T, () => 1, (i) => (i === 4 || i === 1 ? 0.75 : lerp(0.55, 0.22, line)), () => 99);
      floorFade(g); strip(g, GX0, GX1, FLOOR + 92, 1, line);
      g.restore();
    }}>
      <GalleryLabels appear={() => 1} dim={(i) => (i === 4 || i === 1 ? 0.85 : lerp(0.6, 0.25, line))} />
      <Lb x={960} y={96} s="？" size={120} col={C.goldHi} o={clamp(pop(T, CUT.question + 0.2, 0.3)) * (1 - line)} />
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
      strip(g, GX0, GX1, FLOOR + 92, 0, lift);                 // only the 50% marker, behind the pieces
      const cols = 9;
      for (let r = 2; r >= 0; r--) for (let i = 0; i < cols; i++) {
        const s = 0.6 - r * 0.08, x = 960 + (i - (cols - 1) / 2 + r * 0.34) * (190 - r * 22), y = FLOOR - r * 70;
        const flipme = (i + r) % 2 === 1, d = Math.hypot(x - 960, (y - FLOOR) * 3);
        const k = R > 0 ? clamp((R * 600 - d) / 160) : 0;
        const piece = () => { if (flipme && k > 0) coin(g, x, y - 40 - 120 * Math.sin(k * Math.PI) * (1 - k), 52 - r * 6, lerp(0.05, 0.38, k), true); else king(g, x, y, s * (flipme ? 1 - k * 0.6 : 1), '120,175,255', '160,150,255', (flipme ? 1 - k : 1) * (T < CUT.drop ? 0.4 + 0.6 * eo(T, CUT.gap + i * 0.06, 0.3) : 1)); };
        g.save(); g.globalAlpha *= 0.2; g.translate(0, 2 * y); g.scale(1, -1); piece(); g.restore(); piece();
        if (flipme && k > 0 && k < 1) add(g, () => sparks(g, x, y - 40, T - 0.25, T, 26, GOLD, 0.6, i * 7 + r));
      }
      floorFade(g);
      strip(g, GX0, GX1, FLOOR + 92, 0.9, 0);
      if (R > 0 && R < 3) add(g, () => { g.beginPath(); g.rect(0, FLOOR - 230, W, 320); g.clip(); g.strokeStyle = `rgba(255,214,140,${0.4 * (1 - R / 3)})`; g.lineWidth = 3; g.beginPath(); g.ellipse(960, FLOOR - 40, R * 600, R * 200, 0, 0, 6.3); g.stroke(); });
      g.restore();
    }}>
      <Lb x={960} y={130} s="一半国际象棋 ＋ 一半掷硬币 ＝「一半运气」标准线" size={28} col={C.goldHi} o={eo(T, 85.1, 0.4)} />
      <Lb x={960} y={130} s="每个王 = 一局国际象棋" size={30} col="#cfe0ff" o={eo(T, 79.6, 0.35) * (1 - pr(T, CUT.drop + 0.05, 0.25))} />
      <Lb x={960} y={136} s="DUERSCH · LAMBRECHT · OECHSSLER · 2020" size={16} col="rgba(239,232,218,.6)" ls="0.4em" o={eo(T, CUT.drop + 0.45, 0.4) * (1 - pr(T, 84.8, 0.3))} />
    </Scene>
  );
};

/* ================================================================ S10 · the result (89.51 – 97.61), staged like everything else
   part 1: chess / chess-with-half-coin-flips / hold'em on their stands, the rating spread above each (Duersch et al. 2020:
   171.7, 44.9, 22.9). part 2: four 105-game races between a player one level better (53.3 % per game) and an average one */
const WALKS = (() => {
  const walk = (seed: number) => { const out = [0]; for (let i = 1; i <= 105; i++) out.push(out[i - 1] + (rnd(i, seed) < 0.533 ? 1 : -1)); return out; };
  const ups: number[][] = [], downs: number[][] = [];
  for (let sd = 1; sd < 900 && (ups.length < 3 || downs.length < 1); sd++) { const w = walk(sd * 7 + 3), e = w[105], cross = w.slice(5, 40).some((v) => v <= 0) && w.slice(5, 40).some((v) => v >= 0); if (!cross) continue; if (e >= 6 && e <= 16 && ups.length < 3) ups.push(w); else if (e <= -4 && e >= -10 && downs.length < 1) downs.push(w); }
  return [...ups, ...downs];
})();
const STANDS = [
  { x: 420, name: '国际象棋', num: '170+', u: 0.18 },
  { x: 960, name: '一半掷硬币的国际象棋', num: '45', u: 0.5 },
  { x: 1500, name: '德州扑克', num: '< 30', u: 0.82 },
];
export const S10: React.FC<{ T: number; f: number; sec?: boolean }> = ({ T, f, sec }) => {
  const second = sec ?? T >= 93.5;
  const ap = (i: number) => eo(T, 89.6 + i * 0.22, 0.35);
  const n = Math.floor(lerp(1, 105, eio(T, 93.7, 2.1)));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 14, 0.6);
      g.save(); cam(g, lerp(1.02, 1.0, pr(T, CUT.result, 4)), 960, 640);
      if (!second) {
        STANDS.forEach((st, i) => spot(g, st.x, 380, 0.85 * ap(i), i === 2 ? '255,205,235' : i === 1 ? '240,230,255' : '205,220,255'));
        g.save(); g.beginPath(); g.rect(0, 0, W, FLOOR + 84); g.clip();
        withReflection(g, () => {
          g.save(); g.globalAlpha *= ap(0); king(g, 420, FLOOR, 0.62); g.restore();
          g.save(); g.globalAlpha *= ap(1); king(g, 920, FLOOR, 0.52); coin(g, 1010, FLOOR - 22, 48, 0.35, true); g.restore();
          g.save(); g.globalAlpha *= ap(2); card(g, 1470, FLOOR, 0.95, 'A', '♠', false, -0.16); card(g, 1530, FLOOR + 4, 0.95, 'K', '♥', true, 0.14); g.restore();
        }, 0.22);
        g.restore();
        floorFade(g);
        strip(g, GX0, GX1, FLOOR + 92, 1, 1);
        add(g, () => STANDS.forEach((st, i) => { const x = st.x; glowDot(g, x, FLOOR + 92, 46, 0.6 * ap(i), specAt(st.u)); glowDot(g, x, FLOOR + 92, 8, ap(i), '255,244,220'); }));
        if (T > 91.0) add(g, () => glowDot(g, 1500, 400, 260, 0.22 * eo(T, 91.0, 0.4), '255,110,205'));
      } else {
        // four races on a glass plane above the floor; zero line = level
        const X = (i: number) => 330 + i * 12.6, Y = (v: number) => 470 - v * 13;
        spot(g, 960, 1500, 0.55, '235,225,255');
        floorFade(g);
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(X(0), Y(0)); g.lineTo(X(105), Y(0)); g.stroke(); g.setLineDash([]);
        WALKS.forEach((w) => {
          const col = w[105] > 0 ? '120,175,255' : '255,110,205';
          g.strokeStyle = `rgba(${col},.92)`; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath(); for (let i = 0; i <= n; i++) { const y = Y(w[i]); if (i) g.lineTo(X(i), y); else g.moveTo(X(i), y); } g.stroke();
          add(g, () => { glowDot(g, X(n), Y(w[n]), 30, 0.6, col); glowDot(g, X(n), Y(w[n]), 5, 1, '255,244,220'); });
        });
        if (n >= 105) { const ups = WALKS.filter((w) => w[105] > 0), dn = WALKS.find((w) => w[105] <= 0)!; const yu = Math.min(...ups.map((w) => Y(w[105]))); g.font = '700 38px "Noto Sans CJK SC"'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#9cc8ff'; g.fillText('赢得多 ×3', X(105) + 28, yu - 26); g.fillStyle = '#ff9ed6'; g.fillText('输得多 ×1', X(105) + 28, Y(dn[105]) + 4); }
      }
      g.restore();
    }}>
      {!second && (
        <>
          <Lb x={960} y={110} s="数字越大 = 越看实力" size={34} col="#efe8da" sub="RATING SPREAD · DUERSCH ET AL. 2020" o={eo(T, 89.55, 0.35)} />
          {STANDS.map((st, i) => (
            <React.Fragment key={st.name}>
              <div style={{ position: 'absolute', left: st.x - 200, width: 400, top: 250, textAlign: 'center', opacity: ap(i), transform: `scale(${lerp(1.1, 1, ap(i))})`, fontFamily: F.serif, fontWeight: 900, fontSize: 96, color: i === 2 ? '#ffc4e6' : i === 0 ? '#cfe0ff' : C.goldHi, textShadow: '0 0 24px rgba(0,0,0,.8)', ...LNUM }}>{st.num}</div>
              <Lb x={st.x} y={FLOOR + 110} s={st.name} size={26} col={i === 2 ? '#ffaee0' : i === 0 ? '#a8ccff' : '#efe8da'} o={ap(i)} />
            </React.Fragment>
          ))}
          <Lb x={1500} y={392} s="比一半运气还靠运气" size={24} col="#ff9ed6" o={eo(T, 91.0, 0.4)} />
        </>
      )}
      {second && (
        <>
          <Lb x={960} y={110} s={`第 ${n} 局`} size={40} col="#efe8da" />
          <Lb x={960} y={170} s="强一档的人 vs 普通人：谁赢得多（示意）" size={22} col={C.dim} />
          <Lb x={960} y={680} s="4 场里 3 场是强的人领先 ≈ 75%" size={40} col={C.goldHi} o={eo(T, 95.85, 0.35)} />
        </>
      )}
    </Scene>
  );
};

/* ================================================================ S11 · 金铲铲: the shop (luck) and the pool everyone shares (97.61 – 105.71) */
const REROLLS = [98.38, 99.27, 99.93, 100.47];                 // a player clicking refresh: a pause, then faster (own clock)
const SHOPS = [[0, 1, 0, 2, 1], [1, 0, 2, 0, 1], [2, 1, 1, 0, 3], [0, 2, 1, 1, 0], [1, 4, 0, 2, 1]];
const STACK_X = (c: number) => 960 + (c - 3) * 150, STACK_Y = FLOOR - 90, GOLD_COL = 3;
const RIVALS: [number, number][] = [[200, FLOOR + 60], [300, FLOOR - 120], [560, FLOOR - 270], [1360, FLOOR - 270], [1620, FLOOR - 120], [1720, FLOOR + 60], [960, FLOOR - 380]];
const GRABS = (() => { const out: { t: number; col: number; to: number }[] = []; let t = 102.25; for (let k = 0; k < 26; k++) { const col = k % 3 === 0 || k % 7 === 2 ? GOLD_COL : Math.floor(rnd(k, 81) * 7); out.push({ t, col, to: Math.floor(rnd(k, 82) * 7) }); t += 0.05 + 0.1 * rnd(k, 83); } return out; })();
export const S11: React.FC<{ T: number; f: number; pb?: boolean }> = ({ T, f, pb }) => {
  const partB = pb ?? T >= 101.85;
  if (!partB) {
    const n = REROLLS.filter((r) => T >= r).length, coins = 10 - 2 * n, last = n ? REROLLS[n - 1] : -1;
    return (
      <Scene f={f} draw={(g) => {
        stage(g, T); bokeh(g, T, 16, 0.7);
        g.save(); cam(g, lerp(1.0, 1.05, pr(T, CUT.pool, 4.3)), 960, 640);
        spot(g, 860, 1100, 1, '235,225,255'); spot(g, 1560, 340, 0.6, '255,230,190');
        withReflection(g, () => {
          for (let j = 0; j < 5; j++) {
            const cx = 460 + j * 200, r = n ? clamp((T - last - j * 0.03) / 0.16) : 1;
            const tier = r < 0.5 ? SHOPS[n - 1][j] : SHOPS[n][j];
            g.save(); g.translate(cx, 0); g.scale(Math.max(0.03, Math.abs(Math.cos(r * Math.PI))), 1); g.translate(-cx, 0);
            shopCard(g, cx, FLOOR, 160, 220, tier, tier === 4, eo(T, CUT.pool + j * 0.06, 0.3));
            g.restore();
          }
          // the gold you spend on each refresh
          for (let k = 0; k < coins; k++) coin(g, 1560, FLOOR - 10 - k * 11, 44, 0.35, true);
        }, 0.22);
        // a coin leaves the stack on every refresh
        REROLLS.forEach((r0) => [0, 0.06].forEach((dl, j) => { const q = pr(T, r0 - 0.02 + dl, 0.32); if (q > 0 && q < 1) coin(g, lerp(1560, 1660 + j * 40, q), FLOOR - 60 - j * 11 - 160 * Math.sin(q * Math.PI), 34, Math.abs(Math.cos(q * 9)) * 0.9 + 0.05, true); }));
        floorFade(g);
        if (n === 4) add(g, () => { glowDot(g, 660, FLOOR - 130, 220, 0.35 * eo(T, REROLLS[3] + 0.15, 0.2), GOLD); sparks(g, 660, FLOOR - 130, REROLLS[3] + 0.15, T, 50, GOLD, 1, 31); });
        g.restore();
      }}>
        <Lb x={860} y={150} s="刷新 = 看运气" size={40} col="#ffaee0" sub="REFRESH THE SHOP · 2 金币一次" o={eo(T, 97.9, 0.4) * (1 - pr(T, 99.75, 0.25))} />
        <Lb x={960} y={150} s="什么时候刷、刷几次、留多少金币 = 看实力" size={36} col="#a8ccff" sub="ECONOMY · TEAM BUILDING" o={eo(T, 99.95, 0.35)} />
        <Lb x={1560} y={FLOOR + 110} s={`金币 ${coins}`} size={24} col={C.goldHi} o={eo(T, CUT.pool + 0.3, 0.3)} />
      </Scene>
    );
  }
  // part B · the shared pool: everyone draws from the same stacks
  const left = Array.from({ length: 7 }, (_, c) => (c === GOLD_COL ? 15 : 9) - GRABS.filter((x) => x.col === c && T >= x.t).length);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 14, 0.6);
      g.save(); cam(g, lerp(1.04, 1.0, eio(T, 101.85, 3.8)), 960, 600);
      spot(g, 960, 900, 0.9, '235,225,255');
      // rival seats (back first)
      [...RIVALS].sort((a, b) => a[1] - b[1]).forEach(([x, y]) => hexPedestal(g, x, y, lerp(56, 92, (y - (FLOOR - 380)) / 440), '190,150,240', 0.9));
      // the stacks
      for (let c = 0; c < 7; c++) {
        const x = STACK_X(c);
        for (let k = 0; k < Math.max(0, left[c]); k++) { const tier = c === GOLD_COL ? 4 : c % 4; g.save(); g.translate(0, 0); shopCardSlab(g, x, STACK_Y - k * 10, tier); g.restore(); }
        if (c === GOLD_COL) add(g, () => glowDot(g, x, STACK_Y - 70, 160, 0.3, GOLD));
      }
      // cards in flight to the rivals
      GRABS.forEach((gr) => {
        const q = pr(T, gr.t, 0.45); if (q <= 0 || q >= 1) return;
        const [tx, ty] = RIVALS[gr.to], sx = STACK_X(gr.col), sy = STACK_Y - 10 * 9, e = easeInOut(q);
        const x = lerp(sx, tx, e), y = lerp(sy, ty - 40, e) - Math.sin(q * Math.PI) * 140;
        shopCard(g, x, y, 52, 70, gr.col === GOLD_COL ? 4 : gr.col % 4, false);
      });
      // you
      hexPedestal(g, 960, FLOOR + 80, 120, '255,214,140', 1);
      const yours = clamp((T - 104.55) / 0.2);
      if (yours > 0) [0, 1, 2, 3, 4].forEach((j) => shopCard(g, 960 + (j - 2) * 76, FLOOR + 22, 62, 84, [0, 2, 1, 0, 1][j], false, clamp(yours * 2 - j * 0.15)));
      floorFade(g);
      g.restore();
    }}>
      <Lb x={960} y={110} s="8 个人 · 共用一个卡池（示意）" size={24} col="#d6c8ff" ls="0.3em" o={1 - pr(T, 102.1, 0.3)} />
      <Lb x={STACK_X(GOLD_COL)} y={STACK_Y + 14} s="↑ 你要的 ★" size={26} col={C.goldHi} o={eo(T, 102.0, 0.3) * (1 - pr(T, 104.05, 0.25))} />
      <Lb x={960} y={FLOOR + 126} s="你" size={30} col={C.goldHi} />
      <Lb x={960} y={110} s="被别人拿走的，你就刷不到" size={34} col="#efe8da" o={eo(T, 103.8, 0.35)} />
    </Scene>
  );
};
/* a card lying in a stack: a thin slab seen from the front-top */
const shopCardSlab = (g: G, x: number, y: number, tier: number) => {
  const w = 124, d = 34, c = ['160,160,172', '90,200,120', '80,150,255', '190,110,255', '255,200,90'][tier];
  g.fillStyle = '#121019'; g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2, y); g.lineTo(x + w / 2 - 10, y - d); g.lineTo(x - w / 2 + 10, y - d); g.closePath(); g.fill();
  g.strokeStyle = `rgba(${c},.85)`; g.lineWidth = 1.5; g.stroke();
  g.fillStyle = `rgba(${c},.6)`; g.fillRect(x - w / 2, y, w, 7);
};

/* ================================================================ S12 · close (105.71 – 113.81) */
export const S12: React.FC<{ T: number; f: number }> = ({ T, f }) => {
  const off = (i: number) => 1 - eo(T, 110.2 + (6 - i) * 0.25, 0.4);
  const coins = Math.floor(lerp(0, 100, pr(T, 106.6, 2.4)));
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 12, 0.5);
      g.save(); cam(g, lerp(1.04, 1.0, pr(T, CUT.close, 8)), 960, 700);
      gallery(g, T, () => 1, (i) => Math.max(0.15, off(i)), () => 99);
      floorFade(g); strip(g, GX0, GX1, FLOOR + 92, 0.6 + 0.4 * (1 - pr(T, 110, 2)));
      g.restore();
      // one game vs a hundred: a tally of tiny coins along the top
      add(g, () => {
        const win = (i: number) => rnd(i, 99) < 0.6, order: number[] = []; for (let i = 0; i < 100; i++) if (win(i)) order.push(i); for (let i = 0; i < 100; i++) if (!win(i)) order.push(i);
        const sortK = eio(T, 109.7, 0.9);
        for (let i = 0; i < coins; i++) { const j = order.indexOf(i), x = lerp(360 + (i % 50) * 24, 360 + (j % 50) * 24, sortK), y = lerp(170 + Math.floor(i / 50) * 34, 170 + Math.floor(j / 50) * 34, sortK); glowDot(g, x, y, 9, 0.85, win(i) ? '120,175,255' : '255,110,205'); }
      });
    }}>
      <Lb x={960} y={232} s={coins > 0 ? `${coins} 局　·　蓝 = 赢　粉 = 输` : ''} size={30} col={C.goldHi} />
      <Lb x={960} y={96} s="强一档的人：约 6 : 4" size={26} col="#9cc8ff" o={eo(T, 110.4, 0.4)} />
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
        <text x={960} y={432} textAnchor="middle" opacity={fo(0.5)} style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 100 }} fill="url(#gec2)">《是菜还是非？<tspan dx="-34">》</tspan></text>
        <text x={960} y={540} textAnchor="middle" opacity={fo(0.9)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 46, letterSpacing: '0.06em' }} fill={C.cream}>你最常玩的游戏，运气占几成？</text>
        <text x={960} y={592} textAnchor="middle" opacity={fo(1.1)} style={{ fontFamily: F.sans, fontWeight: 500, fontSize: 26, letterSpacing: '0.12em' }} fill={C.dim}>@ 那个总说自己"非"的朋友</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: fo(1.4) }}>
        <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 28, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 770, textAlign: 'center', opacity: fo(1.8), fontFamily: F.sans, fontSize: 22, color: 'rgba(239,232,218,.75)', lineHeight: '34px', ...LNUM }}>
        <div>资料：Duersch, Lambrecht & Oechssler, European Economic Review 2020 · Schaeffer et al., Science 2007 · Brown & Sandholm, Science 2019</div>
        <div>Li et al. 2020 (Suphx) · Tromp 2016 (Go positions) · Zermelo 1913 · 100 局曲线为示意</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: black }} />
    </Scene>
  );
};

export { Lb, Scene, add, cam };
