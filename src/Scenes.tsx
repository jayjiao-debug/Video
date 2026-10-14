/* 《谁打来的？》 scenes. One language for the whole film, set by the cold open: a dark glossy stage, a key spot,
   haze and bokeh; the slot wheel of names; bold serif words slammed on the music's big hits; numbers in mono.
   Colour: magenta = the tightening (fear, scams, the wrong belief); gold = the answer / the warm side; cream = data.
   Each scene is a Canvas (the set and objects) plus HTML text as direct children (so the film's dissolve can fade
   text separately from the picture). */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, F, Canvas, clamp, lerp, pr, eo, eio, hit, rnd, glowDot } from './kit';
import { sparks } from './lightkit';
import { stage, bokeh, spot, floorFade, withReflection, FLOOR, W } from './hero';
import { callerCard, onAir, bubble, handset, envelope, gauge, flapBoard, calendar, glow, feather } from './art';
import { CUT, beat, B } from './time';
import { JUNO } from './brand/identity';

type G = CanvasRenderingContext2D;
type P = { T: number; f: number };
const MAG = '255,110,205', GOLD = '255,214,140', COOL = '190,210,255', CREAMC = '243,237,226';
const MAGH = '#ff9ed6', GOLDH = '#f6d58e';
export const add = (g: G, fn: () => void) => { g.save(); g.globalCompositeOperation = 'lighter'; fn(); g.restore(); };
const rr = (g: G, x: number, y: number, w: number, h: number, r: number) => { g.beginPath(); (g as any).roundRect(x, y, w, h, r); };
const cam = (g: G, s: number, cx = 960, cy = 540, dx = 0, dy = 0) => { g.translate(cx + dx, cy + dy); g.scale(s, s); g.translate(-cx, -cy); };
/** the shared set: stage, bokeh, one key spot */
const base = (g: G, T: number, o: { x?: number; w?: number; a?: number; col?: string; bok?: number } = {}) => {
  stage(g, T); bokeh(g, T, 22, o.bok ?? 0.8); spot(g, o.x ?? 960, o.w ?? 760, o.a ?? 0.55, o.col ?? '235,228,255');
};

export const Scene: React.FC<{ f: number; draw: (g: G) => void; children?: React.ReactNode }> = ({ f, draw, children }) => (
  <AbsoluteFill style={{ background: '#030305' }}>
    <Canvas dep={f} draw={draw} />
    {children}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ type */
const shadow = '0 4px 30px rgba(0,0,0,.9)';
/** a word slammed in: scale 1.35 → 1 with the hit */
const Slam: React.FC<{ T: number; a: number; top: number; size: number; col?: string; o?: number; gold?: boolean; children: React.ReactNode }> = ({ T, a, top, size, col = C.cream, o = 1, gold, children }) => {
  const k = eo(T, a, 0.22); if (T < a) return null;
  const goldStyle: React.CSSProperties = gold ? { background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 55%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 30px rgba(0,0,0,.9))' } : { color: col, textShadow: shadow };
  return <div style={{ position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: k * o, transform: `scale(${lerp(1.35, 1, k)})`, fontFamily: F.serif, fontWeight: 900, fontSize: size, letterSpacing: '0.05em', lineHeight: 1.1, ...goldStyle }}>{children}</div>;
};
/** a counting number (mono, so the digits don't change width) */
const Count: React.FC<{ T: number; a: number; to: number; x: number; y: number; size?: number; col?: string; suffix?: string; o?: number; align?: 'left' | 'center' }> = ({ T, a, to, x, y, size = 130, col = C.cream, suffix = '%', o = 1, align = 'left' }) => (
  T < a ? null : <div style={{ position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, opacity: eo(T, a, 0.2) * o, fontFamily: F.mono, fontWeight: 700, fontSize: size, lineHeight: 1, color: col, textShadow: shadow }}>{Math.round(to * eo(T, a, 0.8))}{suffix}</div>
);
const Lbl: React.FC<{ T: number; a: number; x: number; y: number; s: React.ReactNode; size?: number; col?: string; o?: number; align?: 'left' | 'center' | 'right'; w?: number; serif?: boolean }> = ({ T, a, x, y, s, size = 44, col = C.cream, o = 1, align = 'center', w = 800, serif }) => (
  <div style={{ position: 'absolute', left: align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, width: w, top: y, textAlign: align, opacity: eo(T, a, 0.3) * o, transform: `translateY(${(1 - eo(T, a, 0.35)) * 12}px)`, fontFamily: serif ? F.serif : F.sans, fontWeight: serif ? 900 : 700, fontSize: size, color: col, letterSpacing: '0.04em', textShadow: shadow, whiteSpace: 'nowrap' }}>{s}</div>
);
/** a source note: Latin-only notes stay small mono; anything with Chinese is 30 px so it reads on a phone */
const Src: React.FC<{ T: number; a: number; x: number; y: number; s: string; o?: number; align?: 'left' | 'center' }> = ({ T, a, x, y, s, o = 1, align = 'left' }) => {
  const cjk = /[\u4e00-\u9fff]/.test(s);
  return <div style={{ position: 'absolute', left: align === 'center' ? 0 : x, right: align === 'center' ? 0 : undefined, top: y, textAlign: align, opacity: eo(T, a, 0.3) * o, fontFamily: cjk ? F.sans : F.mono, fontWeight: cjk ? 500 : 700, fontSize: cjk ? 30 : 22, letterSpacing: cjk ? '0.08em' : '0.2em', color: 'rgba(239,232,218,.9)', whiteSpace: 'nowrap', textShadow: shadow }}>{s}</div>;
};

/* ------------------------------------------------------------------ small objects */
/** a small standing phone glyph for the 100-person grids. state: 0 ringing (cool), 1 dead (dark, magenta slash), 2 warm (gold) */
const miniPhone = (g: G, x: number, y: number, s: number, a: number, T: number, i: number, dead: number, warm: number) => {
  if (a <= 0) return;
  const w = 30 * s, h = 54 * s;
  g.save(); g.globalAlpha *= a;
  g.fillStyle = '#0c0c11'; rr(g, x - w / 2, y - h / 2, w, h, 7 * s); g.fill();
  const breathe = 0.55 + 0.25 * Math.sin(T * 5 + i * 1.7);
  const sc = warm > 0 ? `rgba(${GOLD},${0.35 + 0.6 * warm})` : `rgba(${COOL},${(0.25 + 0.45 * breathe) * (1 - dead)})`;
  g.fillStyle = sc; rr(g, x - w / 2 + 3 * s, y - h / 2 + 4 * s, w - 6 * s, h - 8 * s, 4 * s); g.fill();
  if (dead > 0) {
    g.strokeStyle = `rgba(${MAG},${0.9 * dead})`; g.lineWidth = 2.2 * s; rr(g, x - w / 2, y - h / 2, w, h, 7 * s); g.stroke();
    g.beginPath(); g.moveTo(x - w * 0.42, y + h * 0.36); g.lineTo(x + w * 0.42, y - h * 0.36); g.stroke();
  } else { g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1; rr(g, x - w / 2, y - h / 2, w, h, 7 * s); g.stroke(); }
  g.restore();
  if (warm > 0) add(g, () => glow(g, x, y, 46 * s, 0.35 * warm, GOLD));
  else if (dead > 0) add(g, () => glow(g, x, y, 40 * s, 0.18 * dead * hit(T, 0, 1e9), MAG));
};
/** a small message-bubble glyph (for the 61% grid) */
const miniBubble = (g: G, x: number, y: number, s: number, a: number, lit: number) => {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  g.fillStyle = lit > 0 ? `rgba(240,222,186,${0.25 + 0.7 * lit})` : 'rgba(255,255,255,.08)';
  rr(g, x - 22 * s, y - 15 * s, 44 * s, 30 * s, 12 * s); g.fill();
  g.beginPath(); g.moveTo(x + 10 * s, y + 12 * s); g.lineTo(x + 20 * s, y + 22 * s); g.lineTo(x + 18 * s, y + 8 * s); g.fill();
  g.restore();
};
/** the 20 × 5 grid of a hundred people (as phones or bubbles) */
const GRID = { cols: 20, rows: 5, dx: 66, dy: 84, y0: 340 };
const gridPos = (i: number) => { const c = i % GRID.cols, r = Math.floor(i / GRID.cols); return [960 + (c - (GRID.cols - 1) / 2) * GRID.dx, GRID.y0 + r * GRID.dy] as const; };
const pick = (n: number, seed: number, from?: number[]) => {
  const pool = (from ?? Array.from({ length: 100 }, (_, i) => i)).slice();
  pool.sort((a, b) => rnd(a, seed) - rnd(b, seed));
  return pool.slice(0, n);
};
const DEAD23 = pick(23, 11), DEAD_SET = new Set(DEAD23);
const WARM53 = pick(53, 17);
const ORDER = (set: number[]) => { const m = new Map<number, number>(); set.forEach((v, j) => m.set(v, j)); return m; };
const DEAD_ORD = ORDER(DEAD23), WARM_ORD = ORDER(WARM53);

/** a standing phone on the stage floor, screen lit in `col` */
const phoneUp = (g: G, x: number, y: number, s: number, col: string, lit: number) => {
  const w = 190 * s, h = 380 * s, r = 30 * s;
  const body = () => {
    const bd = g.createLinearGradient(x - w / 2, y - h, x + w / 2, y);
    bd.addColorStop(0, '#2c2c34'); bd.addColorStop(0.5, '#121216'); bd.addColorStop(1, '#060608');
    g.fillStyle = bd; rr(g, x - w / 2, y - h, w, h, r); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.2)'; g.lineWidth = 1.5; g.stroke();
    const sc = g.createLinearGradient(0, y - h, 0, y);
    sc.addColorStop(0, `rgba(${col},${0.2 + 0.55 * lit})`); sc.addColorStop(1, `rgba(${col},${0.08 + 0.3 * lit})`);
    g.fillStyle = sc; rr(g, x - w / 2 + 9 * s, y - h + 9 * s, w - 18 * s, h - 18 * s, r * 0.75); g.fill();
    g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.moveTo(x - w / 2 + 12 * s, y - h + 12 * s); g.lineTo(x + w * 0.1, y - h + 12 * s); g.lineTo(x - w / 2 + 12 * s, y - h * 0.45); g.closePath(); g.fill();
  };
  withReflection(g, body, 0.22);
  add(g, () => glow(g, x, y - h / 2, 360 * s, 0.22 * lit, col));
};
/** expanding ring arcs (a phone ringing), on their own clock */
const ringArcs = (g: G, x: number, y: number, T: number, col: string, a = 1, period = 1.0, r0 = 120, r1 = 420) => {
  add(g, () => {
    for (let k = 0; k < 3; k++) {
      const q = ((T / period) + k / 3) % 1, r = lerp(r0, r1, q);
      g.strokeStyle = `rgba(${col},${0.35 * a * (1 - q)})`; g.lineWidth = 3;
      g.beginPath(); g.arc(x, y, r, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke();
    }
  });
};
/** a slot wheel of name cards (the film's recurring device). land: film time it stops on the last item */
const wheelPos = (T: number, a: number, land: number, n: number, turns = 2) => { const q = clamp((T - a) / (land - a)), e = 1 - Math.pow(1 - q, 3); return e * (n - 1 + turns * n); };
const wheel = (g: G, T: number, items: string[], a: number, land: number, x: number, y: number, o: { turns?: number; alpha?: number; col?: string; avatar?: boolean; w?: number } = {}) => {
  const p = wheelPos(T, a, land, items.length, o.turns ?? 2), base = Math.floor(p), frac = p - base, landed = T >= land, col = o.col ?? MAG;
  feather(g, y - 240, y + 240, 90, (c) => {
    for (let j = -2; j <= 2; j++) {
      const idx = ((base + j) % items.length + items.length) % items.length, yy = y + (j - frac) * 170;
      const near = 1 - Math.min(1, Math.abs(yy - y) / 260);
      const fadeOthers = landed && j !== 0 ? 1 - eo(T, land + 0.2, 0.4) : 1;
      if (o.avatar === false) nameCard(c, x, yy, items[idx], (o.alpha ?? 1) * (0.25 + 0.75 * near) * fadeOthers, landed && j === 0 ? 1 : 0, col, o.w);
      else callerCard(c, x, yy, items[idx], (o.alpha ?? 1) * (0.25 + 0.75 * near) * fadeOthers, landed && j === 0 ? 1 : 0, 1, col);
    }
  });
  const speed = clamp(1 - (T - a) / (land - a));
  if (T > a && speed > 0.15 && !landed) add(g, () => { g.fillStyle = `rgba(255,255,255,${0.05 * speed * (o.alpha ?? 1)})`; for (let k = 0; k < 6; k++) g.fillRect(x - 200 + k * 80, y - 230, 2, 460); });
  if (landed) add(g, () => { glowDot(g, x, y, 460, 0.4 * hit(T, land, 0.5), col); sparks(g, x, y, land, T, 70, col, 1.3, 3); });
};
/** a plain text card for the reasons wheel */
const nameCard = (g: G, x: number, y: number, text: string, a: number, hot = 0, col = MAG, w = 640) => {
  if (a <= 0) return;
  const h = 140;
  g.save(); g.globalAlpha *= a;
  const body = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); body.addColorStop(0, '#1d1b26'); body.addColorStop(1, '#0d0c13');
  g.fillStyle = body; rr(g, x - w / 2, y - h / 2, w, h, 26); g.fill();
  g.strokeStyle = hot ? `rgba(${col},${0.6 + 0.4 * hot})` : 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.stroke();
  g.fillStyle = hot ? '#ffd0ec' : '#f3ede2'; g.font = '900 66px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, x, y + 2);
  g.restore();
};
/** a soft shockwave + spark burst for the big hits */
const boom = (g: G, x: number, y: number, t0: number, T: number, col: string, n = 200) => {
  if (T < t0) return;
  add(g, () => {
    const r = 60 + 1400 * eo(T, t0, 0.9); g.strokeStyle = `rgba(${col},${0.5 * (1 - pr(T, t0, 0.9))})`; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, r, r * 0.55, 0, 0, 6.3); g.stroke();
    sparks(g, x, y, t0, T, n, col, 3, 5); glowDot(g, x, y, 900, 0.32 * hit(T, t0, 0.35), col);
  });
};

/* ================================================================== S1 · 23% never answer (15.2 → 18.52) */
export const S1: React.FC<P> = ({ T, f }) => {
  const a = CUT.p23, why = CUT.why, d0 = CUT.dead23;
  const dim = 1 - 0.45 * eo(T, why, 0.6);
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 });
      g.save(); cam(g, 1 + 0.03 * pr(T, a, 4) + 0.05 * eio(T, why, 2.4));
      for (let i = 0; i < 100; i++) {
        const [x, y] = gridPos(i), c = i % GRID.cols, r = Math.floor(i / GRID.cols);
        const ap = eo(T, a - 0.4 + c * 0.016 + r * 0.04, 0.3);
        const dj = DEAD_ORD.get(i), dead = dj === undefined ? 0 : eo(T, d0 + dj * 0.035, 0.15);
        miniPhone(g, x, y, 1, ap * (dead > 0 ? 1 : dim), T, i, dead, 0);
        if (dj !== undefined && dead > 0) add(g, () => glow(g, x, y, 60, 0.35 * hit(T, d0 + dj * 0.035, 0.25), MAG));
      }
      floorFade(g); g.restore();
    }}>
      <Count T={T} a={d0} to={23} x={0} y={150} size={130} col={MAGH} align="center" />
      <Src T={T} a={d0 + 0.7} x={0} y={790} s="OPINIUM / USWITCH · 2024 · 18–34 岁 · 每格 = 1 人" align="center" o={1 - pr(T, why, 0.4)} />
    </Scene>
  );
};

/* ================================================================== Title (18.52 → 24.05): the wheel lands on the title */
const TITLE = '谁打来的？';
const CALLERS = ['妈妈', '老板', '快递', '前任', '客服', '班主任', '房东', '外卖', '领导', '陌生号码'];
const goldText: React.CSSProperties = { background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' };
export const Title: React.FC<P> = ({ T, f }) => {
  const h = CUT.title, out = eio(T, CUT.tOut - 0.5, 0.5);
  const card = T >= h;
  const glyphs = ['《', ...TITLE, '》'];
  // 《 谁 》 land on the hit; 打 来 的 ？ follow one per half-beat
  const at = (i: number) => (i === 0 || i === 1 || i === glyphs.length - 1 ? h : h + (i - 1) * B / 2);
  const pour = eio(T, beat(35), 0.45), sw = pr(T, beat(36.5), 0.6);
  const textO = 1 - eo(T, CUT.tOut - 0.6, 0.3);
  const sheen = sw > 0 && sw < 1 ? `linear-gradient(105deg, rgba(255,250,235,0) ${sw * 160 - 40}%, rgba(255,252,240,.95) ${sw * 160 - 25}%, rgba(255,250,235,0) ${sw * 160 - 10}%), ` : '';
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 + 0.35 * hit(T, h, 0.5), col: card ? '255,226,180' : '235,228,255', bok: 0.8 + 0.6 * hit(T, h, 0.5) });
      g.save(); cam(g, 1 + 0.03 * hit(T, h, 0.35) + 0.02 * pr(T, h, 3) * (1 - out));
      if (!card) wheel(g, T, CALLERS, CUT.why + 0.05, h, 960, 470, { turns: 2, alpha: eo(T, CUT.why, 0.3), col: GOLD });
      else {
        // the title card: a big gold caller card (the motif); on the way out it becomes the next scene's message bubble
        const x = lerp(960, 729, out), y = lerp(470, 440, out), w = lerp(1140, 262, out), hh = lerp(230, 147, out);
        add(g, () => glow(g, x, y, lerp(900, 300, out), (0.25 + 0.3 * hit(T, h, 0.5)) * (1 - out), GOLD));
        const body = g.createLinearGradient(0, y - hh / 2, 0, y + hh / 2);
        body.addColorStop(0, `rgba(${lerp(34, 240, out) | 0},${lerp(28, 222, out) | 0},${lerp(22, 186, out) | 0},.95)`);
        body.addColorStop(1, `rgba(${lerp(14, 225, out) | 0},${lerp(11, 205, out) | 0},${lerp(9, 165, out) | 0},.95)`);
        g.fillStyle = body; rr(g, x - w / 2, y - hh / 2, w, hh, lerp(40, 51, out)); g.fill();
        g.strokeStyle = `rgba(${GOLD},${(0.55 + 0.45 * hit(T, h, 0.6)) * (1 - out)})`; g.lineWidth = 3; g.stroke();
        const ax = x - w / 2 + 130 * (1 - out), ao = clamp(1 - out * 2.5);
        if (ao > 0) {
          g.save(); g.globalAlpha = ao;
          g.fillStyle = `rgba(${GOLD},.28)`; g.beginPath(); g.arc(ax, y, 70, 0, 6.3); g.fill();
          g.fillStyle = `rgba(${GOLD},.9)`; g.beginPath(); g.arc(ax, y - 16, 23, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(ax, y + 36, 38, 22, 0, Math.PI, 0); g.fill();
          g.restore();
          ringArcs(g, ax, y, T, GOLD, 0.8 * ao, 1.2, 80, 160);
        }
        sparks(g, 960, 470, h, T, 160, GOLD, 2.4, 21);
      }
      floorFade(g); g.restore();
    }}>
      {card && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', opacity: eo(T, h + 0.4, 0.4) * textO, fontFamily: F.lat, fontWeight: 600, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>TELEPHOBIA · KUMAR & EPLEY · MMXXI</div>
          <div style={{ position: 'absolute', left: 580, width: 960, top: 470 - 76, textAlign: 'center', opacity: textO, fontFamily: F.serif, fontWeight: 900, fontSize: 120, lineHeight: '152px', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            {glyphs.map((c, i) => {
              const a = at(i), k = eo(T, a, 0.16);
              return <span key={i} style={{ display: 'inline-block', opacity: T < a ? 0 : k, transform: `scale(${lerp(1.4, 1, k)})`, color: C.cream, marginLeft: c === '》' ? '-0.42em' : undefined }}>{c}</span>;
            })}
            {/* the gold pour (left → right) and one light sweep, both clipped to the glyphs */}
            <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 ${100 - 100 * pour}% 0 0)` }}>
              {glyphs.map((c, i) => <span key={i} style={{ display: 'inline-block', marginLeft: c === '》' ? '-0.42em' : undefined, ...goldText, backgroundImage: `${sheen}linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)` }}>{c}</span>)}
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 628, textAlign: 'center', opacity: eo(T, h + 0.9, 0.4) * textO, fontFamily: F.serif, fontWeight: 700, fontSize: 48, letterSpacing: '0.06em', color: C.cream, textShadow: shadow }}>铃声一响，你是<span style={{ color: '#ffd59a' }}>开心</span>，还是<span style={{ color: MAGH }}>心里一紧</span>？</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 702, textAlign: 'center', opacity: 0.9 * eo(T, h + 1.2, 0.4) * textO, fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 34, color: 'rgba(239,232,218,.9)' }}>Who's calling, and why does the ring make us flinch?</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 768, textAlign: 'center', opacity: eo(T, h + 1.5, 0.4) * textO, fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: C.gold }}>— {JUNO.series} —</div>
        </>
      )}
    </Scene>
  );
};

/* ================================================================== S2 · draft vs live (24.05 → 33.2) */
const typed = (t: number) => {         // the draft: types 在吗, deletes it, types 这周末有空吗？ (own clock)
  if (t < 0.15) return { s: '', n: 0, done: false };
  if (t < 1.2) return { s: '在吗', n: clamp((t - 0.15) / 0.3) * 2, done: false };
  if (t < 1.5) return { s: '在吗', n: 2 * (1 - clamp((t - 1.2) / 0.25)), done: false };
  if (t < 1.65) return { s: '', n: 0, done: false };
  return { s: '这周末有空吗？', n: clamp((t - 1.65) / 0.9) * 7, done: false };
};
const wave = (x: number, t: number) => { const u = x * 0.035 - t * 9; return (Math.sin(u) * 0.5 + Math.sin(u * 2.3 + 1) * 0.3 + Math.sin(u * 5.1 + 2) * 0.2) * (0.55 + 0.45 * Math.sin(u * 0.21)); };
export const S2: React.FC<P> = ({ T, f }) => {
  const a = CUT.draft, live = CUT.live, slip = 30.1, still = 31.65, end = CUT.sixty;
  const lit = eo(T, live, 0.12);
  const leftDim = 1 - 0.6 * eo(T, live, 0.5);
  const d = typed(T - a);
  const WX0 = 1040, WX1 = 1700, WY = 600;
  const flat = eio(T, still, 0.35);
  const slipX = WX1 - (T - slip) * 420;        // the slip scrolls left with the voice and can't be pulled back
  const slipO = T < slip ? 0 : clamp((slipX - WX0 + 20) / 80);
  // the key light: from the title's centre to the draft, over to the lamp, then back to centre for the 61% grid
  const spX = T < live ? lerp(960, 640, eio(T, a, 0.5)) : T < end - 0.6 ? lerp(640, 1370, eio(T, live, 0.6)) : lerp(1370, 960, eio(T, end - 0.6, 0.5));
  const spCol = T >= live && T < end - 0.6 ? '255,215,215' : '235,228,255';
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { x: spX, a: 0.5 + 0.25 * hit(T, live, 0.6), col: spCol });
      g.save(); cam(g, 1 + 0.02 * pr(T, a, 9));
      g.save(); g.globalAlpha = leftDim;
      bubble(g, 860, 440, 1.75, d.s, d.n, true, 1, T, true);
      g.restore();
      onAir(g, 1370, 330, 1.3, lit);
      if (T >= live) {
        const ap = eo(T, live, 0.3);
        add(g, () => {
          for (let x = WX0; x <= WX1; x += 6) {
            const amp = 130 * (1 - 0.94 * flat) * clamp((x - WX0) / 60);
            const v = Math.abs(wave(x, T)) * amp + 3;
            const isSlip = T >= slip && Math.abs(x - slipX) < 55 && slipO > 0;
            g.fillStyle = isSlip ? `rgba(${MAG},${0.95 * ap * slipO})` : `rgba(255,${200 - 60 * lit | 0},${200 - 60 * lit | 0},${0.75 * ap})`;
            g.fillRect(x - 2, WY - v, 4, 2 * v);
          }
          g.fillStyle = `rgba(255,120,120,${ap})`; g.fillRect(WX1 + 8, WY - 130, 3, 260);
          glowDot(g, WX1 + 9, WY - 132, 24, 0.8 * ap, '255,110,110');
        });
        if (slipO > 0) add(g, () => glow(g, slipX, WY, 110, 0.35 * slipO, MAG));
      }
      floorFade(g); g.restore();
    }}>
      <Lbl T={T} a={a + 0.1} x={700} y={230} s="发消息" o={leftDim} />
      <Lbl T={T} a={live} x={1370} y={150} s="打电话" />
      {slipO > 0 && <Lbl T={T} a={slip + 0.1} x={slipX} y={WY - 160} s="说错了" col={MAGH} o={slipO} w={300} />}
      {T >= slip + 0.9 && <Lbl T={T} a={slip + 0.9} x={WX0 - 30} y={WY + 150} s="撤不回" col={MAGH} align="left" w={300} o={1 - pr(T, still - 0.1, 0.3)} />}
      {T >= still && (
        <>
          <Lbl T={T} a={still + 0.15} x={1370} y={WY - 160} s="冷场" col={MAGH} w={300} o={1 - pr(T, end - 0.5, 0.3)} />
          <div style={{ position: 'absolute', left: 1370 - 200, width: 400, top: WY + 130, textAlign: 'center', opacity: eo(T, still + 0.2, 0.3) * (1 - pr(T, end - 0.5, 0.3)), fontFamily: F.mono, fontWeight: 700, fontSize: 56, color: MAGH, textShadow: shadow }}>00:0{Math.min(9, Math.floor((T - still) * 1.6))}</div>
        </>
      )}
    </Scene>
  );
};

/* ================================================================== S2c · 61% would rather receive a message (33.2 → 37.0) */
export const S2c: React.FC<P> = ({ T, f }) => {
  const a = CUT.sixty;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 });
      g.save(); cam(g, 1 + 0.025 * pr(T, a, 4));
      for (let i = 0; i < 100; i++) {
        const [x, y] = gridPos(i), c = i % GRID.cols, r = Math.floor(i / GRID.cols);
        const ap = eo(T, a - 0.2 + c * 0.015 + r * 0.04, 0.3);
        const on = i < 61 ? eo(T, a + 0.5 + i * 0.012, 0.15) : 0;
        miniBubble(g, x, y, 1.05, ap, on);
        if (on > 0) add(g, () => glow(g, x, y, 50, 0.12 * on, '240,222,186'));
      }
      floorFade(g); g.restore();
    }}>
      <Count T={T} a={a + 0.5} to={61} x={0} y={150} size={130} align="center" />
      <Src T={T} a={a + 1.1} x={0} y={790} s="OPINIUM / USWITCH · 2024 · 18–34 岁 · 更想收到消息" align="center" />
    </Scene>
  );
};

/* ================================================================== S3a · the unknown number (37.0 → 40.1) */
const GHOSTS: [string, number, number, number][] = [['推销？', 560, 300, 37.75], ['诈骗？', 1380, 380, 38.25], ['出事了？', 600, 590, 38.75]];
export const S3a: React.FC<P> = ({ T, f }) => {
  const a = CUT.breakA, s = 1.35, PH = 380 * s;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.45, col: '245,215,235' });
      g.save(); cam(g, 1 + 0.04 * eio(T, a - 0.5, 4), 960, 560);
      phoneUp(g, 960, FLOOR, s, MAG, 0.55 + 0.15 * Math.sin(T * 3.2));
      ringArcs(g, 960, FLOOR - PH / 2, T, MAG, 0.6, 1.4, PH * 0.6, PH * 1.1);
      // the screen: a plain avatar and the words 陌生号码 (no app UI)
      const cy = FLOOR - PH * 0.62;
      g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(960, cy - 70, 46, 0, 6.3); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(960, cy - 82, 15, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(960, cy - 46, 25, 15, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#fff'; g.font = '900 50px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('陌生号码', 960, cy + 20);
      GHOSTS.forEach(([, x, y, t0]) => { if (T >= t0) add(g, () => glow(g, x, y + 30, 160, 0.25 * eo(T, t0, 0.4), MAG)); });
      floorFade(g); g.restore();
    }}>
      {GHOSTS.map(([w, x, y, t0], i) => (
        <div key={i} style={{ position: 'absolute', left: x - 200, width: 400, top: y, textAlign: 'center', opacity: eo(T, t0, 0.4) * (0.75 + 0.25 * Math.sin(T * 4 + i * 2)), transform: `translateY(${(1 - eo(T, t0, 0.5)) * 14}px)`, fontFamily: F.sans, fontWeight: 900, fontSize: 56, color: MAGH, textShadow: shadow }}>{w}</div>
      ))}
    </Scene>
  );
};

/* ================================================================== S3b · why people don't pick up (40.1 → 44.09) */
const REASONS = ['在忙', '不想被打扰', '想先知道是谁', '骚扰或诈骗'];
export const S3b: React.FC<P> = ({ T, f }) => {
  const a = CUT.reasons, land = CUT.land63;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 + 0.2 * hit(T, land, 0.6), col: T >= land ? '255,214,235' : '235,228,255' });
      g.save(); cam(g, 1 + 0.02 * pr(T, a, 4));
      wheel(g, T, REASONS, a + 0.05, land, 760, 520, { turns: 1, alpha: eo(T, a, 0.25), avatar: false, w: 620 });
      floorFade(g); g.restore();
    }}>
      <Lbl T={T} a={a + 0.1} x={760} y={190} s="不接电话的理由" col="rgba(239,232,218,.85)" />
      <Count T={T} a={land + 0.05} to={63} x={1140} y={440} size={130} col={MAGH} />
      <Lbl T={T} a={land + 0.4} x={1146} y={590} s="选了这一条" align="left" w={500} />
      <Src T={T} a={land + 0.6} x={1146} y={666} s="OPINIUM / USWITCH · 2024 · 全体受访者" />
    </Scene>
  );
};

/* ================================================================== S3c · 36亿 (44.09 → 53.2) */
const DIGITS = '0123456789';
export const S3c: React.FC<P> = ({ T, f }) => {
  const a = CUT.notOver, land = CUT.flap, per = CUT.perDay;
  const up = eio(T, per - 0.1, 0.6);
  const tiles = '36亿';
  const lockAt = (i: number) => land - 0.5 + i * 0.25;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.45 + 0.25 * hit(T, land, 0.6), col: '255,214,235' });
      g.save(); cam(g, 1 + 0.02 * pr(T, a, 9));
      const ap = eo(T, a + 0.1, 0.4);
      const txt = tiles.split('').map((c, i) => (T >= lockAt(i) ? c : DIGITS[Math.floor(T * 14 + i * 3.7) % 10])).join('');
      const flips = tiles.split('').map((_, i) => (T >= lockAt(i) ? eo(T, lockAt(i), 0.12) : (T * 14 + i * 3.7) % 1));
      g.save(); g.globalAlpha = ap;
      const by = lerp(450, 270, up), bs = lerp(1.6, 0.75, up);
      flapBoard(g, 960, by, bs, txt, flips, T >= land ? MAGH : '#f3ede2');
      g.restore();
      if (T >= land) add(g, () => { glow(g, 960, by, 700 * bs, 0.3 * hit(T, land, 0.8) + 0.08, MAG); sparks(g, 960, by, land, T, 110, MAG, 2.0, 31); });
      // one year of days: 365 cells filling, one cell = one day
      if (T >= per) {
        const cols = 73, cw = 18, ch = 18, gap = 4, x0 = 960 - (cols * (cw + gap)) / 2, y0 = 470;
        for (let i = 0; i < 365; i++) {
          const c = i % cols, r = Math.floor(i / cols), on = eo(T, per + 0.3 + c * 0.012, 0.12);
          g.fillStyle = on > 0 ? `rgba(${MAG},${0.25 + 0.6 * on})` : 'rgba(255,255,255,.06)';
          g.fillRect(x0 + c * (cw + gap), y0 + r * (ch + gap), cw, ch);
        }
      }
      floorFade(g); g.restore();
    }}>
      {T >= land && <Lbl T={T} a={land + 0.3} x={960} y={650} s="被拦下的诈骗电话 · 2025 年" o={1 - pr(T, per - 0.2, 0.3)} />}
      {T >= land && <Src T={T} a={land + 0.6} x={0} y={724} s="公安部 · 2026-01-08 新闻发布会" align="center" o={1 - pr(T, per - 0.2, 0.3)} />}
      {T >= per && <Lbl T={T} a={per + 0.3} x={960} y={384} s="1 格 = 1 天" col="rgba(239,232,218,.85)" />}
      {T >= per && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 620, textAlign: 'center', opacity: eo(T, per + 1.27, 0.3), transform: `translateY(${(1 - eo(T, per + 1.27, 0.35)) * 24}px)`, fontFamily: F.serif, fontWeight: 900, fontSize: 92, color: C.cream, textShadow: shadow }}>
          每天 <span style={{ fontFamily: F.mono, color: MAGH }}>≈986万</span> 通
        </div>
      )}
    </Scene>
  );
};

/* ================================================================== S4a · the researchers (53.2 → 55.8) */
const PEOPLE = [{ name: 'Amit Kumar', aff: '德州大学奥斯汀分校', ini: 'AK' }, { name: 'Nicholas Epley', aff: '芝加哥大学', ini: 'NE' }];
const PX = [620, 1300];
export const S4a: React.FC<P> = ({ T, f }) => {
  const a = CUT.build;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 + 0.3 * hit(T, a, 0.6), col: '235,228,255', w: 1100 });
      g.save(); cam(g, 1 + 0.02 * pr(T, a, 3));
      PX.forEach((x, i) => {
        const y = 470, k = eo(T, a + i * 0.2, 0.4);
        g.save(); g.globalAlpha = k; g.translate(0, (1 - k) * 30);
        const w = 640, h = 250;
        const bd = g.createLinearGradient(0, y - h / 2, 0, y + h / 2); bd.addColorStop(0, 'rgba(30,29,38,.95)'); bd.addColorStop(1, 'rgba(12,11,17,.95)');
        g.fillStyle = bd; rr(g, x - w / 2, y - h / 2, w, h, 26); g.fill();
        g.strokeStyle = 'rgba(239,232,218,.25)'; g.lineWidth = 2; g.stroke();
        g.strokeStyle = 'rgba(239,232,218,.5)'; g.beginPath(); g.arc(x - w / 2 + 104, y, 62, 0, 6.3); g.stroke();
        g.restore();
      });
      sparks(g, 960, 470, a, T, 60, CREAMC, 1.2, 41);
      floorFade(g); g.restore();
    }}>
      {PEOPLE.map((p, i) => {
        const x = PX[i], k = eo(T, a + i * 0.2, 0.4);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: x - 320 + 104 - 62, width: 124, top: 470 - 30, textAlign: 'center', opacity: k, fontFamily: F.lat, fontWeight: 600, fontSize: 48, lineHeight: '60px', color: C.cream }}>{p.ini}</div>
            <div style={{ position: 'absolute', left: x - 320 + 190, top: 470 - 78, opacity: k, fontFamily: F.lat, fontWeight: 700, fontSize: 52, color: C.cream, whiteSpace: 'nowrap' }}>{p.name}</div>
            <div style={{ position: 'absolute', left: x - 320 + 192, top: 470 + 4, opacity: 0.9 * k, fontFamily: F.sans, fontWeight: 700, fontSize: 44, color: 'rgba(239,232,218,.9)', whiteSpace: 'nowrap' }}>{p.aff}</div>
          </React.Fragment>
        );
      })}
    </Scene>
  );
};

/* ================================================================== S4b · an old friend (55.8 → 58.7) */
export const S4b: React.FC<P> = ({ T, f }) => {
  const a = CUT.friend, L = 560, R = 1360, Y = 470, cs = 0.9, half = 280 * cs;
  const draw = eio(T, a + 0.25, 1.1);
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.45, col: '255,226,190', w: 1100 });
      g.save(); cam(g, 1 + 0.03 * pr(T, a, 3.5));
      callerCard(g, L, Y, '你', eo(T, a, 0.4), 0, cs, GOLD);
      callerCard(g, R, Y, '老朋友', eo(T, a + 0.15, 0.4), 0.4 * eo(T, a + 1.4, 0.5), cs, GOLD);
      // a thread between them, drawn in from both ends; it never meets: frayed in the middle
      const x0 = L + half, x1 = R - half, mid = (x0 + x1) / 2, gapW = 46;
      g.strokeStyle = 'rgba(239,232,218,.6)'; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, Y); g.lineTo(lerp(x0, mid - gapW, draw), Y + Math.sin(T * 1.3) * 2); g.stroke();
      g.beginPath(); g.moveTo(x1, Y); g.lineTo(lerp(x1, mid + gapW, draw), Y - Math.sin(T * 1.1) * 2); g.stroke();
      if (draw > 0.95) {
        g.lineWidth = 1.5; g.strokeStyle = 'rgba(239,232,218,.45)';
        for (let k = 0; k < 4; k++) {
          const sd = k % 2 ? 1 : -1, ex = mid + sd * gapW, ang = (rnd(k, 7) - 0.5) * 1.2 + Math.sin(T * 2 + k) * 0.15;
          g.beginPath(); g.moveTo(ex, Y); g.lineTo(ex - sd * Math.cos(ang) * 22, Y + Math.sin(ang) * 22); g.stroke();
        }
      }
      floorFade(g); g.restore();
    }}>
      <Lbl T={T} a={a + 1.2} x={960} y={Y - 110} s="很久没聊了" col="rgba(239,232,218,.85)" />
    </Scene>
  );
};

/* ================================================================== S4c · the experiment and the drop (58.7 → 74.97) */
export const S4c: React.FC<P> = ({ T, f }) => {
  const a = CUT.split, pred = CUT.predict, chose = CUT.chose, res = CUT.result, drop = CUT.drop, bond = CUT.bond;
  const LX = 620, RX = 1300, OY = 640, GY = 450, GS = 0.8;
  const gaugeIn = eo(T, pred, 0.4) * (1 - eo(T, bond - 0.1, 0.35));
  const spring = (t0: number, v: number) => { if (T < t0) return 0.05; const q = T - t0; return v + (0.05 - v) * Math.exp(-q * 5) * Math.cos(q * 14); };
  const tremble = T >= res && T < drop ? 0.014 * Math.sin(T * 47) * pr(T, res, 2) : 0;
  const predL = spring(pred + 0.15, 0.86) + tremble, predR = spring(pred + 0.35, 0.36) - tremble * 0.6;
  const actL = T >= drop ? 0.86 + (0.37 - 0.86) * (1 - Math.exp(-(T - drop) * 9) * Math.cos((T - drop) * 10)) : 0.86;
  const ghost = T >= drop ? 0.35 : 1;
  const focusL = 1 - 0.55 * eo(T, chose, 0.4) * (1 - eo(T, res, 0.6));
  const focusR = 1 - 0.45 * eo(T, res, 0.4) * (1 - eo(T, drop, 0.3));
  const objO = 1 - 0.7 * eo(T, bond - 0.1, 0.4), objDY = 70 * eio(T, bond - 0.1, 0.5);
  const camK = eio(T, res, 2.2) * (1 - eio(T, drop, 0.4));
  const camS = 1 + 0.02 * pr(T, a, 6) + 0.12 * camK + 0.03 * hit(T, drop, 0.3) + 0.05 * eio(T, bond, 2.7);
  const bondK = eo(T, bond, 0.9);
  return (
    <Scene f={f} draw={(g) => {
      const spX = T < chose ? 960 : T < res ? lerp(960, RX, eio(T, chose, 0.6)) : T < drop ? lerp(RX, LX, eio(T, res, 0.6)) : lerp(LX, 960, eio(T, drop, 0.5));
      base(g, T, { x: spX, w: T >= chose && T < drop + 0.4 ? 560 : 900, a: 0.5 + 0.4 * hit(T, drop, 0.5), col: T >= drop ? '255,226,180' : '235,228,255', bok: 0.8 + 0.8 * hit(T, drop, 0.5) });
      g.save(); cam(g, camS, lerp(960, LX, camK), lerp(520, GY - 40, camK), (960 - LX) * camK * 0.6, 0);
      // twenty participants split into the two rooms
      for (let i = 0; i < 20; i++) {
        const side = i % 2 ? 1 : -1, k = eio(T, a + 0.1 + i * 0.03, 0.8);
        const x = lerp(960 + (rnd(i, 3) - 0.5) * 120, (side > 0 ? RX : LX) + ((i >> 1) - 4.5) * 26, k), y = lerp(560 + (rnd(i, 4) - 0.5) * 60, 742, k);
        g.fillStyle = `rgba(${CREAMC},${0.75 * eo(T, a, 0.3) * (1 - eo(T, bond - 0.2, 0.4))})`; g.beginPath(); g.arc(x, y, 7, 0, 6.3); g.fill();
      }
      g.save(); g.globalAlpha = eo(T, a, 0.4) * focusL * objO; g.translate(0, objDY);
      withReflection(g, () => handset(g, LX, OY - 30, 1.15, -0.1, 1), 0.12);
      g.restore();
      g.save(); g.globalAlpha = eo(T, a + 0.15, 0.4) * focusR * objO; g.translate(0, objDY);
      withReflection(g, () => envelope(g, RX, OY - 70 - 10 * eo(T, chose, 0.5) * (1 - eo(T, res, 0.4)), 0.95, 0.06), 0.12);
      g.restore();
      if (T >= chose && T < res + 0.4) add(g, () => glow(g, RX, OY - 70, 320, 0.25 * eo(T, chose, 0.5) * (1 - pr(T, res, 0.4)), GOLD));
      // the room labels live in the picture, so they move with the camera
      const lab = (x: number, s: string, o: number) => { g.save(); g.globalAlpha = o; g.fillStyle = C.cream; g.font = '700 44px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'top'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 20; g.fillText(s, x, 790 + objDY); g.restore(); };
      const labO = 1 - eo(T, bond - 0.2, 0.3);
      lab(LX, '打电话', eo(T, a + 0.3, 0.3) * (0.55 + 0.45 * focusL) * labO);
      lab(RX, '写邮件', eo(T, a + 0.45, 0.3) * (0.55 + 0.45 * focusR) * labO);
      if (gaugeIn > 0) {
        g.save(); g.globalAlpha = gaugeIn;
        gauge(g, LX, GY - 40, GS, '', predL, actL, ghost, T >= drop ? 1 : 0);
        gauge(g, RX, GY - 40, GS, '', predR, 0.36, ghost, T >= drop ? eo(T, drop + 0.2, 0.3) : 0);
        g.restore();
      }
      // connection: two bars on a baseline above the (now dimmed) objects. 示意: the paper reports a significant difference, not a scale
      if (T >= bond - 0.2) {
        const BY = 440;
        g.fillStyle = `rgba(${CREAMC},${0.4 * bondK})`; g.fillRect(LX - 150, BY, RX - LX + 300, 2);
        const bar = (x: number, v: number, col: string, lit: number) => {
          const hh = 250 * v * bondK, w = 130;
          const gr = g.createLinearGradient(0, BY - hh, 0, BY); gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(1, `rgba(${col},.3)`);
          g.fillStyle = gr; rr(g, x - w / 2, BY - hh, w, Math.max(1, hh), 12); g.fill();
          if (lit) add(g, () => glow(g, x, BY - hh, 170, 0.45 * bondK, col));
        };
        bar(LX, 1.0, GOLD, 1); bar(RX, 0.75, '170,170,182', 0);
      }
      if (T >= drop) add(g, () => { sparks(g, LX, GY - 40, drop, T, 220, GOLD, 3, 5); glowDot(g, LX, GY - 40, 700, 0.35 * hit(T, drop, 0.35), GOLD); });
      floorFade(g); g.restore();
    }}>
      <Lbl T={T} a={a + 0.1} x={960} y={190} s="随机分成两组" col="rgba(239,232,218,.85)" o={1 - pr(T, pred - 0.2, 0.3)} />
      {gaugeIn > 0 && T < bond && <Lbl T={T} a={pred + 0.1} x={960} y={330} s={T >= drop ? <span style={{ color: GOLDH }}>实际</span> : <span style={{ color: MAGH }}>事前预测</span>} o={gaugeIn * (1 - eo(T, res, 0.3) * (1 - eo(T, drop + 0.3, 0.3)))} />}
      {gaugeIn > 0 && <Lbl T={T} a={pred + 0.1} x={960} y={400} s="尴尬度（示意）" col="rgba(239,232,218,.85)" o={gaugeIn * (1 - eo(T, res, 0.3) * (1 - eo(T, drop + 0.3, 0.3)))} />}
      {T >= bond - 0.2 && <Lbl T={T} a={bond} x={960} y={300} s="连接感" />}
      {T >= bond && <Src T={T} a={bond + 0.5} x={0} y={880} s="示意：只表示“显著更高”，非实际比例" align="center" />}
      <Slam T={T} a={drop} top={122} size={104} gold o={1 - pr(T, bond - 0.25, 0.3)}>并没有更尴尬</Slam>
    </Scene>
  );
};

/* ================================================================== S5c · strangers: text, video, voice (74.97 → 82.4) */
/** solid lit objects: a chat bubble, a small camera, a speaker grille with a live voice */
const mediaIcon = (g: G, kind: number, x: number, y: number, a: number, lit: number, T: number, sc = 1.5) => {
  g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(sc, sc);
  const col = lit ? GOLD : CREAMC;
  const mat = g.createLinearGradient(0, -60, 0, 60);
  mat.addColorStop(0, lit ? '#fff1cf' : '#f3ead6'); mat.addColorStop(1, lit ? '#b58a42' : '#9c8f78');
  if (kind === 0) {
    g.fillStyle = mat; rr(g, -74, -50, 148, 100, 32); g.fill();
    g.beginPath(); g.moveTo(30, 44); g.lineTo(58, 70); g.lineTo(52, 40); g.fill();
    for (let k = 0; k < 3; k++) { const b = 0.5 + 0.5 * Math.sin(T * 7 - k * 0.9); g.fillStyle = `rgba(42,30,16,${0.45 + 0.45 * b})`; g.beginPath(); g.arc(-32 + k * 32, -6 * b, 9, 0, 6.3); g.fill(); }
  } else if (kind === 1) {
    g.fillStyle = mat; rr(g, -84, -48, 118, 96, 18); g.fill();
    g.beginPath(); g.moveTo(40, -14); g.lineTo(84, -40); g.lineTo(84, 40); g.lineTo(40, 14); g.closePath(); g.fill();
    g.fillStyle = '#1a1612'; g.beginPath(); g.arc(-25, 0, 24, 0, 6.3); g.fill();
    g.fillStyle = `rgba(255,70,70,${Math.floor(T * 1.6) % 2 ? 0.2 : 0.95})`; g.beginPath(); g.arc(-66, -30, 7, 0, 6.3); g.fill();
  } else {
    g.fillStyle = mat; g.beginPath(); g.arc(0, 0, 66, 0, 6.3); g.fill();
    g.strokeStyle = '#2a2016'; g.lineWidth = 6; g.lineCap = 'round';
    for (let k = -3; k <= 3; k++) { const hh = 6 + 34 * Math.abs(wave(k * 40, T)) * (1 - Math.abs(k) / 4.5); g.beginPath(); g.moveTo(k * 15, -hh); g.lineTo(k * 15, hh); g.stroke(); }
  }
  g.restore();
  if (lit) add(g, () => glow(g, x, y, 140 * sc, 0.18, col));
};
export const S5c: React.FC<P> = ({ T, f }) => {
  const a = CUT.exp2, bars = CUT.bars;
  const XS = [560, 960, 1360], V = [0.65, 0.9, 0.9], IY = 600;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { x: lerp(960, 1100, eio(T, a, 7)), a: 0.5, col: '255,232,200', w: 1100 });
      g.save(); cam(g, 1 + 0.05 * eio(T, a, 7.4), 960, 560);
      XS.forEach((x, i) => {
        const k = eo(T, a + 0.15 + i * 0.25, 0.4);
        mediaIcon(g, i, x, IY, k, T >= bars && i > 0 ? 1 : 0, T);
        g.save(); g.globalAlpha = eo(T, a + 0.3 + i * 0.25, 0.3); g.fillStyle = T >= bars && i ? GOLDH : C.cream; g.font = '700 44px "Noto Sans CJK SC"'; g.textAlign = 'center'; g.textBaseline = 'top'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 20;
        g.fillText(['打字', '视频', '语音'][i], x, IY + 140);
        if (i === 2 && T >= bars + 1.4) { g.globalAlpha = eo(T, bars + 1.4, 0.3); g.fillStyle = GOLDH; g.fillText('不必看见脸', x, IY + 200); }
        g.restore();
        if (T >= bars) {
          const hh = 270 * V[i] * eo(T, bars + 0.1 + i * 0.12, 0.8), w = 120, by = IY - 130;
          const col = i ? GOLD : '170,170,182';
          const gr = g.createLinearGradient(0, by - hh, 0, by); gr.addColorStop(0, `rgba(${col},.95)`); gr.addColorStop(1, `rgba(${col},.25)`);
          g.fillStyle = gr; rr(g, x - w / 2, by - hh, w, Math.max(1, hh), 12); g.fill();
          if (i) add(g, () => glow(g, x, by - hh, 150, 0.3, GOLD));
        }
      });
      if (T >= bars + 1.4) add(g, () => { g.strokeStyle = `rgba(${GOLD},${0.75 * eo(T, bars + 1.4, 0.4)})`; g.lineWidth = 3; g.beginPath(); g.arc(1360, IY, 122, 0, 6.3); g.stroke(); });
      floorFade(g); g.restore();
    }}>
      <Lbl T={T} a={a + 0.1} x={960} y={170} s="实验二：陌生人两两聊天" col="rgba(239,232,218,.85)" o={1 - pr(T, bars - 0.3, 0.3)} />
      {T >= bars && <Lbl T={T} a={bars + 0.2} x={960} y={140} s="连接感" />}
      {T >= bars && <Src T={T} a={bars + 0.6} x={0} y={880} s="示意：语音、视频都显著高于打字，非实际比例" align="center" />}
    </Scene>
  );
};

/* ================================================================== S5e · same time (82.4 → 85.6) */
const stopwatch = (g: G, x: number, y: number, r: number, v: number, a: number, col: string) => {
  g.save(); g.globalAlpha = a;
  g.fillStyle = '#0d0c12'; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
  g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = 5; g.stroke();
  g.fillStyle = `rgba(${col},.85)`; g.fillRect(x - 14, y - r - 26, 28, 18);
  for (let k = 0; k < 12; k++) { const an = k / 12 * Math.PI * 2; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + Math.sin(an) * (r - 18) - 2, y - Math.cos(an) * (r - 18) - 2, 4, 4); }
  add(g, () => { g.fillStyle = `rgba(${col},.18)`; g.beginPath(); g.moveTo(x, y); g.arc(x, y, r - 8, -Math.PI / 2, -Math.PI / 2 + v * Math.PI * 2); g.closePath(); g.fill(); });
  const an = v * Math.PI * 2; g.strokeStyle = `rgba(${col},1)`; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(an) * (r - 24), y - Math.cos(an) * (r - 24)); g.stroke();
  g.restore();
};
export const S5e: React.FC<P> = ({ T, f }) => {
  const a = CUT.timeSame;
  const vL = 0.62 * eo(T, a + 0.2, 1.6), vR = 0.66 * eo(T, a + 0.3, 1.6);
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5, w: 1100 });
      g.save(); cam(g, 1 + 0.02 * pr(T, a, 3));
      stopwatch(g, 620, 450, 180, vL, eo(T, a, 0.35), GOLD);
      stopwatch(g, 1300, 450, 180, vR, eo(T, a + 0.1, 0.35), CREAMC);
      handset(g, 620, 735, 0.5, -0.1); envelope(g, 1300, 735, 0.42, 0.05);
      floorFade(g); g.restore();
    }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 380, textAlign: 'center', opacity: eo(T, a + 1.6, 0.3), fontFamily: F.serif, fontWeight: 900, fontSize: 130, color: C.cream, textShadow: shadow }}>≈</div>
      <Src T={T} a={a + 1.9} x={0} y={880} s="KUMAR & EPLEY 2021 · 实验一" align="center" />
    </Scene>
  );
};

/* ================================================================== S6a · the same survey (85.6 → 92.18) */
export const S6a: React.FC<P> = ({ T, f }) => {
  const a = CUT.coda, w0 = CUT.warm;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 + 0.25 * hit(T, a, 0.6), col: T >= w0 ? '255,226,180' : '235,228,255' });
      g.save(); cam(g, 1 + 0.03 * pr(T, a, 6.6));
      for (let i = 0; i < 100; i++) {
        const [x, y] = gridPos(i), c = i % GRID.cols, r = Math.floor(i / GRID.cols);
        const ap = eo(T, a - 0.2 + c * 0.012 + r * 0.03, 0.3);
        const wj = WARM_ORD.get(i), warm = wj === undefined ? 0 : eo(T, w0 + wj * 0.025, 0.2);
        const dead = DEAD_SET.has(i) ? 1 - eo(T, w0 - 0.3, 0.4) : 0;
        miniPhone(g, x, y, 1, ap * (T >= w0 && !warm ? 0.5 : 1), T, i, dead, warm);
        if (warm > 0) add(g, () => glow(g, x, y, 70, 0.4 * hit(T, w0 + (wj ?? 0) * 0.025, 0.3), GOLD));
      }
      floorFade(g); g.restore();
    }}>
      <Lbl T={T} a={a + 0.1} x={960} y={170} s="18–34 岁" col="rgba(239,232,218,.85)" o={1 - pr(T, w0 - 0.3, 0.3)} />
      <Count T={T} a={w0} to={53} x={0} y={150} size={130} col={GOLDH} align="center" />
      <Lbl T={T} a={w0 + 0.7} x={960} y={790} s={<>有好消息，<span style={{ color: GOLDH }}>希望你打电话来说</span></>} />
    </Scene>
  );
};

/* ================================================================== S6c · a booked call (92.18 → 95.2) */
export const S6c: React.FC<P> = ({ T, f }) => {
  const a = CUT.booked;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { x: lerp(960, 740, eio(T, a, 0.5)), a: 0.5, col: '255,226,180' });
      g.save(); cam(g, 1 + 0.025 * pr(T, a, 3));
      g.save(); g.globalAlpha = eo(T, a, 0.4); g.translate(0, (1 - eo(T, a, 0.5)) * 30);
      calendar(g, 740, 480, 1.3, '20:00', '通话', 1, eo(T, a + 0.5, 0.4));
      g.restore();
      add(g, () => glow(g, 740, 480 + 1.3 * (-90 + 2 * 56 + 28), 300, 0.3 * eo(T, a + 0.5, 0.4), GOLD));
      floorFade(g); g.restore();
    }}>
      <Count T={T} a={a + 0.3} to={68} x={1120} y={380} size={130} col={GOLDH} />
      <Lbl T={T} a={a + 0.8} x={1126} y={530} s="先约好时间，再打" align="left" w={600} />
      <Src T={T} a={a + 1.0} x={1126} y={606} s="OPINIUM / USWITCH · 2024 · 18–34 岁" />
    </Scene>
  );
};

/* ================================================================== S6d · 方便吗？ (95.2 → 98.8) */
export const S6d: React.FC<P> = ({ T, f }) => {
  const a = CUT.ask;
  const n1 = clamp((T - a - 0.25) / 0.6) * 4, n2 = T >= a + 2.0 ? clamp((T - a - 2.0) / 0.5) * 5 : 0;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { x: lerp(740, 960, eio(T, a, 0.5)), a: 0.5, col: '255,226,180', w: 1000 });
      g.save(); cam(g, 1 + 0.03 * pr(T, a, 3.6));
      bubble(g, 1300, 400, 1.8, '方便吗？', n1, true, eo(T, a, 0.3), T, n1 < 4);
      if (T >= a + 1.2) bubble(g, 620, 580, 1.8, n2 > 0 ? '方便，打吧' : '', n2, false, eo(T, a + 1.2, 0.3), T, n2 > 0 && n2 < 5);
      if (T >= a + 2.6) add(g, () => glow(g, 860, 580, 380, 0.25 * hit(T, a + 2.6, 0.6), GOLD));
      floorFade(g); g.restore();
    }} />
  );
};

/* ================================================================== S6e · the call goes out (98.8 → 101.8) */
const FRIENDS = ['同事', '同学', '外婆', '室友', '老朋友'];
export const S6e: React.FC<P> = ({ T, f }) => {
  const a = CUT.call, land = CUT.callLand;
  return (
    <Scene f={f} draw={(g) => {
      base(g, T, { a: 0.5 + 0.35 * hit(T, land, 0.6), col: '255,226,180', bok: 0.8 + 0.5 * hit(T, land, 0.5) });
      g.save(); cam(g, 1 + 0.03 * pr(T, a, 3));
      wheel(g, T, FRIENDS, a + 0.05, land, 960, 540, { turns: 1, alpha: eo(T, a, 0.25), col: GOLD });
      if (T >= land) ringArcs(g, 960 - 280 + 86, 540, T, GOLD, 0.8, 1.0, 70, 200);
      floorFade(g); g.restore();
    }}>
      {T >= land && <Lbl T={T} a={land + 0.3} x={960} y={660} s="呼叫中……" col={GOLDH} />}
    </Scene>
  );
};

/* ================================================================== End card (101.8 → 108) */
export const SEnd: React.FC<P> = ({ T, f }) => {
  const t = T - CUT.end, ring = eio(t, 0, 0.8), fo = (a: number) => eo(t, a, 0.35), black = pr(T, CUT.fin - 0.5, 0.5);
  const mv = eio(t, 0, 0.6);
  const tk = eo(t, 0, 0.25);
  return (
    <Scene f={f} draw={(g) => {
      stage(g, T); bokeh(g, T, 20, 0.6); floorFade(g);
      add(g, () => { glowDot(g, 960, 420, 800, 0.07, GOLD); sparks(g, 960, 232, CUT.end, T, 80, GOLD, 1.2, 77); });
      // the 老朋友 card carried over from the last shot, settling into the motif
      const x = 960, y = lerp(540, 532, mv), w = lerp(560, 420, mv), hh = lerp(150, 96, mv);
      g.fillStyle = 'rgba(30,25,20,.95)'; rr(g, x - w / 2, y - hh / 2, w, hh, lerp(28, 22, mv)); g.fill();
      g.strokeStyle = `rgba(${GOLD},.85)`; g.lineWidth = 2; g.stroke();
      const ax = x - w / 2 + lerp(86, 56, mv), ar = lerp(46, 30, mv);
      g.fillStyle = `rgba(${GOLD},.3)`; g.beginPath(); g.arc(ax, y, ar, 0, 6.3); g.fill();
      g.fillStyle = `rgba(${GOLD},.9)`; g.beginPath(); g.arc(ax, y - ar * 0.22, ar * 0.33, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(ax, y + ar * 0.5, ar * 0.53, ar * 0.32, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#f6d58e'; g.font = `900 ${lerp(66, 46, mv)}px "Noto Sans CJK SC"`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('老朋友', ax + lerp(80, 56, mv), y + 2);
      ringArcs(g, ax, y, T, GOLD, 0.6, 1.3, ar + 10, ar + 60);
    }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs><linearGradient id="gec" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff3cf" /><stop offset=".5" stopColor="#f0c873" /><stop offset="1" stopColor="#b07c32" /></linearGradient></defs>
        <circle cx={960} cy={222} r={46} fill="none" stroke={C.gold} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform="rotate(-90 960 222)" />
        <text x={960} y={242} textAnchor="middle" style={{ fontFamily: F.lat, fontStyle: 'italic', fontWeight: 500, fontSize: 64 }} fill={C.gold} opacity={fo(0.3)}>J</text>
        <text x={960} y={296} textAnchor="middle" style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 22, letterSpacing: '0.5em' }} fill={C.gold} opacity={0.85 * fo(0.5)}>JUNO</text>
        <g style={{ transformOrigin: '960px 390px', transform: `scale(${lerp(1.15, 1, tk)})` }} opacity={tk}>
          <text x={960} y={420} textAnchor="middle" style={{ fontFamily: F.serif, fontWeight: 900, fontSize: 100 }} fill="url(#gec)">《谁打来的？<tspan dx="-34">》</tspan></text>
        </g>
        <text x={960} y={652} textAnchor="middle" opacity={fo(1.0)} style={{ fontFamily: F.serif, fontWeight: 700, fontSize: 50, letterSpacing: '0.06em' }} fill={C.cream}>看完这条，你最想打给谁？评论区说说</text>
      </svg>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 706, display: 'flex', justifyContent: 'center', opacity: fo(1.3) }}>
        <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${C.gold}`, fontFamily: F.sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: C.gold }}>{JUNO.follow}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center', opacity: fo(1.6), fontFamily: F.sans, fontSize: 26, color: 'rgba(239,232,218,.88)', lineHeight: '38px' }}>
        <div>资料：Opinium / Uswitch 2024（英国 2000 名成年人）· 公安部 2026-01-08 新闻发布会（2025 年数据）</div>
        <div>Kumar & Epley, Journal of Experimental Psychology: General, 2021 · 柱状图为示意</div>
      </div>
      <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: black }} />
    </Scene>
  );
};
