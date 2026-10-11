import React from 'react';
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from 'remotion';
import { C, ZH, EN, clamp, prog, easeOut, easeIn, inOut, lerp } from './lib';

/* ---------- atmosphere ---------- */

export const Background: React.FC<{ warm?: number }> = ({ warm = 0 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 70% at 50% 45%, ${C.ink2} 0%, ${C.ink} 70%)` }} />
    {warm > 0 && (
      <AbsoluteFill
        style={{
          opacity: warm,
          background: 'radial-gradient(ellipse 70% 60% at 50% 60%, rgba(150,96,40,0.22) 0%, rgba(60,30,10,0.10) 50%, rgba(0,0,0,0) 80%)',
        }}
      />
    )}
  </AbsoluteFill>
);

export const Grain: React.FC = () => {
  const f = useCurrentFrame();
  const i = 0; void f;
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <Img src={staticFile(`grain${i}.png`)} style={{ width: '100%', height: '100%', imageRendering: 'auto' }} />
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.6 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity: number }> = ({ x, y, r, color, opacity }) => (
  <div
    style={{
      position: 'absolute',
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: '50%',
      opacity,
      background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`,
      pointerEvents: 'none',
    }}
  />
);

/** gold dust: burst at `at` from (cx,cy), then drift upward and fade */
export const Dust: React.FC<{ t: number; at: number; cx: number; cy: number; n?: number; seed?: string; spread?: number }> = ({
  t, at, cx, cy, n = 90, seed = 'd', spread = 520,
}) => {
  const d = t - at;
  if (d < 0 || d > 6) return null;
  return (
    <>
      {new Array(n).fill(0).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const sp = (0.25 + random(`${seed}s${i}`) * 0.75) * spread;
        const k = 1 - Math.exp(-d * 2.2);
        const x = cx + Math.cos(a) * sp * k * 1.3;
        const y = cy + Math.sin(a) * sp * k * 0.55 - d * (18 + random(`${seed}u${i}`) * 30);
        const size = 2 + random(`${seed}z${i}`) * 3.5;
        const op = Math.min(prog(d, 0, 0.15), 1 - prog(d, 1.5 + random(`${seed}o${i}`) * 3, 6)) * (0.35 + random(`${seed}b${i}`) * 0.6);
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: '50%',
              background: C.goldHi, opacity: op, boxShadow: `0 0 ${size * 3}px ${C.gold}`,
            }}
          />
        );
      })}
    </>
  );
};

/* ---------- typography ---------- */

/** renders *emphasis* segments in gold */
export const Rich: React.FC<{ s: string }> = ({ s }) => (
  <>
    {s.split('*').map((seg, i) =>
      i % 2 ? (
        <span key={i} style={{ color: C.gold }}>{seg}</span>
      ) : (
        <React.Fragment key={i}>{seg}</React.Fragment>
      ),
    )}
  </>
);

/** split a line longer than `max` visible chars at the punctuation nearest the middle */
export const splitLine = (s: string, max = 13): string[] => {
  if (s.includes('|')) return s.split('|');
  const vis = s.replace(/\*/g, '');
  if (vis.length <= max) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 1; i < s.length - 1; i++) if ('，。：；、？！'.includes(s[i]) && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  if (best < 0) best = Math.floor(mid) - 1;
  return [s.slice(0, best + 1), s.slice(best + 1)];
};

/** Ep1 subtitle, as published: one line of ~56px serif Chinese with a small italic English line under it, no band. */
export const Subtitle: React.FC<{
  t: number; at: number; out: number; zh: string; en?: string; y?: number; size?: number; enSize?: number; weight?: number; showEn?: boolean; band?: boolean;
}> = ({ t, at, out, zh, en, y = SUB_Y, size = SUB_SIZE, enSize = SUB_EN, weight = SUB_W, showEn = true }) => {
  const o = inOut(t, at, out);
  if (o <= 0) return null;
  const rise = (1 - easeOut(prog(t, at, at + 0.5))) * 18;
  const lh = size * SUB_LH;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: y - size * SUB_K, textAlign: 'center', opacity: o, transform: `translateY(${rise}px)` }}>
      <div style={{ fontFamily: ZH, fontSize: size, lineHeight: `${lh}px`, fontWeight: weight, color: C.paper, letterSpacing: SUB_LS,
        textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
        <Rich s={zh.replace(/\|/g, '')} />
      </div>
      {showEn && en && (
        <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: enSize, color: C.dim, marginTop: SUB_GAP, letterSpacing: '0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>
          {en}
        </div>
      )}
    </div>
  );
};
export const SUB_SIZE = 54, SUB_EN = 30, SUB_W = 500, SUB_GAP = 9, SUB_Y = 868, SUB_K = 0.51, SUB_LS = '0.08em', SUB_LH = 1.45;

/** Ep1 year stamp, as published (the later episodes enlarged it). */
export const YS = { left: 110, top: 78, size: 92, line: 250, gap: 10, place: 24, ls: '0.15em' };
export const YearStamp: React.FC<{ t: number; at: number; out: number; year: string; place: string; approx?: string }> = ({ t, at, out, year, place, approx }) => {
  const o = inOut(t, at, out, 0.6, 0.4);
  if (o <= 0) return null;
  const ln = easeOut(prog(t, at + 0.15, at + 0.9));
  return (
    <div style={{ position: 'absolute', left: YS.left, top: YS.top, opacity: o }}>
      <div style={{ fontFamily: EN, fontWeight: 600, fontSize: YS.size, color: C.gold, letterSpacing: '0.04em', lineHeight: 1, fontVariantNumeric: 'lining-nums' }}>
        {approx && <span style={{ fontFamily: ZH, fontSize: 24, color: C.dim, marginRight: 8, verticalAlign: 'top' }}>{approx}</span>}
        {year}
      </div>
      <div style={{ width: YS.line, height: 2, background: C.gold, opacity: 0.6, marginTop: YS.gap + 2, transform: `scaleX(${ln})`, transformOrigin: 'left' }} />
      <div style={{ fontFamily: ZH, fontSize: YS.place, color: C.paper, opacity: 0.8, marginTop: YS.gap + 1, letterSpacing: YS.ls }}>{place}</div>
    </div>
  );
};

/* ---------- motif: red string + profile cards ---------- */

export const STR = { x0: -60, x1: 1980, y0: 350, sag: 46 };
export const stringY = (x: number, y0 = STR.y0, sag = STR.sag) => {
  const u = (x - STR.x0) / (STR.x1 - STR.x0);
  return y0 + sag * 4 * u * (1 - u);
};
export const cardX = (i: number) => 330 + i * 140;

export const RedString: React.FC<{ p?: number; y0?: number; sag?: number; opacity?: number }> = ({ p = 1, y0 = STR.y0, sag = STR.sag, opacity = 1 }) => {
  const mx = (STR.x0 + STR.x1) / 2;
  const d = `M ${STR.x0} ${y0} Q ${mx} ${y0 + sag * 2} ${STR.x1} ${y0}`;
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, opacity, overflow: 'visible' }}>
      <path d={d} stroke={C.rouge} strokeWidth={3} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p}
        style={{ filter: 'drop-shadow(0 0 6px rgba(184,72,59,0.55))' }} />
    </svg>
  );
};

export type CardProps = {
  x: number; y: number; n: number; score?: number | string; flip?: number; gold?: number; dim?: number; glow?: number;
  seal?: number; sealText?: string; rot?: number; dy?: number; opacity?: number; ghost?: boolean; w?: number;
};

export const Card: React.FC<CardProps> = ({
  x, y, n, score = '', flip = 0, gold = 0, dim = 0, glow = 0, seal = 0, sealText = '就是Ta', rot = 0, dy = 0, opacity = 1, w = 128,
}) => {
  const h = w * 1.375;
  const face: React.CSSProperties = {
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 3, overflow: 'hidden',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  };
  const b = 1 - dim * 0.72;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - 8, width: w, height: h + 18, transformOrigin: `${w / 2}px 0px`,
      transform: `translateY(${dy}px) rotate(${rot}deg)`, opacity, zIndex: seal > 0 ? 20 : 1 }}>
      {glow > 0 && (
        <div style={{ position: 'absolute', left: -w * 0.9, top: -h * 0.4, width: w * 2.8, height: h * 2, borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(233,190,110,${0.5 * glow}) 0%, rgba(0,0,0,0) 65%)` }} />
      )}
      {/* clip */}
      <div style={{ position: 'absolute', left: w / 2 - 6, top: 0, width: 12, height: 26, background: '#6d5a3c', borderRadius: 2, zIndex: 3,
        boxShadow: '0 1px 2px rgba(0,0,0,0.5)', filter: `brightness(${b})` }} />
      <div style={{ position: 'absolute', left: 0, top: 16, width: w, height: h, perspective: 900, filter: `brightness(${b})` }}>
        <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${flip * 180}deg)`,
          boxShadow: '0 12px 26px rgba(0,0,0,0.55)' }}>
          {/* back: not met yet */}
          <div style={{ ...face, background: C.cardBack }}>
            <div style={{ position: 'absolute', inset: 7, border: `1.5px solid ${C.rouge}`, opacity: 0.55 }} />
            <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: w * 0.5, color: '#5a3a2e', lineHeight: 1 }}>?</div>
            <div style={{ fontFamily: ZH, fontSize: w * 0.12, color: '#7a6a52', marginTop: w * 0.1, letterSpacing: '0.15em' }}>第{n}位</div>
          </div>
          {/* front: met */}
          <div style={{ ...face, transform: 'rotateY(180deg)',
            background: gold > 0 ? `linear-gradient(160deg, rgba(240,213,154,${gold}) 0%, rgba(201,164,92,${gold}) 100%), ${C.cardFront}` : C.cardFront }}>
            <div style={{ fontFamily: ZH, fontSize: w * 0.11, color: '#7a6a52', letterSpacing: '0.3em', marginBottom: w * 0.02 }}>心动值</div>
            <div style={{ fontFamily: EN, fontWeight: 600, fontSize: w * 0.62, color: C.cardInk, lineHeight: 1 }}>{score}</div>
            <div style={{ fontFamily: ZH, fontSize: w * 0.1, color: '#7a6a52', marginTop: w * 0.06, letterSpacing: '0.15em' }}>第{n}位</div>
          </div>
        </div>
      </div>
      {seal > 0 && (
        <div style={{ position: 'absolute', left: w * 0.48, top: h * 0.78, zIndex: 5, padding: '4px 10px', border: `3px solid ${C.rouge}`,
          color: C.rouge, background: 'rgba(239,230,208,0.92)', fontFamily: ZH, fontWeight: 900, fontSize: w * 0.19, whiteSpace: 'nowrap',
          opacity: clamp(seal * 3), transform: `rotate(-12deg) scale(${lerp(1.7, 1, easeOut(seal))})`, letterSpacing: '0.05em' }}>
          {sealText}
        </div>
      )}
    </div>
  );
};

/** small tag above a card */
export const Chip: React.FC<{ x: number; y: number; text: string; o: number; color?: string; fill?: boolean }> = ({ x, y, text, o, color = C.rouge, fill = true }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, ${(1 - o) * 10}px)`, opacity: o, padding: '5px 14px',
      borderRadius: 3, fontFamily: ZH, fontSize: 24, letterSpacing: '0.1em', whiteSpace: 'nowrap',
      background: fill ? color : 'transparent', border: `1.5px solid ${color}`, color: fill ? C.paper : color }}>
      {text}
    </div>
  );

/** "you are here" marker */
export const YouMarker: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) =>
  o <= 0 ? null : (
    <div style={{ position: 'absolute', left: x - 24, top: y, width: 48, opacity: o, textAlign: 'center' }}>
      <svg width={48} height={16}><path d="M24 2 L34 14 L14 14 Z" fill={C.gold} /></svg>
      <div style={{ width: 44, height: 44, margin: '2px auto 0', borderRadius: '50%', border: `2px solid ${C.gold}`, color: C.gold,
        fontFamily: ZH, fontSize: 24, lineHeight: '40px', fontWeight: 600 }}>你</div>
    </div>
  );

/** drawn line icon */
export const LineIcon: React.FC<{ d: string[]; p: number; size?: number; stroke?: string; sw?: number; circles?: [number, number, number][] }> = ({
  d, p, size = 110, stroke = C.gold, sw = 3, circles = [],
}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
    {d.map((path, i) => (
      <path key={i} d={path} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1}
        strokeDasharray="1 1" strokeDashoffset={1 - clamp(p * 1.3 - i * 0.12)} />
    ))}
    {circles.map(([cx, cy, r], i) => (
      <circle key={`c${i}`} cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw} pathLength={1} strokeDasharray="1 1"
        strokeDashoffset={1 - clamp(p * 1.3 - 0.3)} />
    ))}
  </svg>
);

export { easeIn };
