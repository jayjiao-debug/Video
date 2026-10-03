import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, ZH, EN, beatAfter, prog, easeOut, easeInOut, lerp, inOut } from './lib';
import { Subtitle, YearStamp, Glow } from './ui';

const Candle: React.FC<{ t: number; x: number; y: number; o: number; s?: number }> = ({ t, x, y, o, s = 1 }) => {
  const fl = 1 + 0.035 * Math.sin(t * 5.1) + 0.02 * Math.sin(t * 8.3 + 1); // gentle, < 2 Hz
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: o, transform: `scale(${s})`, transformOrigin: 'bottom center' }}>
      <Glow x={0} y={-30} r={420} color="rgba(233,170,90,0.55)" opacity={0.55 * fl} />
      <div style={{ position: 'absolute', left: -12, top: -62 * fl, width: 24, height: 50 * fl, borderRadius: '50% 50% 45% 45% / 65% 65% 35% 35%',
        background: 'radial-gradient(ellipse at 50% 70%, #fff6da 0%, #ffd27a 40%, rgba(230,140,50,0.0) 80%)', filter: 'blur(1px)' }} />
      <div style={{ position: 'absolute', left: -2, top: -14, width: 4, height: 14, background: '#2a2018' }} />
      <div style={{ position: 'absolute', left: -26, top: 0, width: 52, height: 170, background: 'linear-gradient(90deg, #cfc2a3, #efe5cc 45%, #bfb192)', borderRadius: '6px 6px 2px 2px' }} />
    </div>
  );
};

/* S06 · History 36.90 → 49.04 */
export const History: React.FC<{ t: number }> = ({ t }) => {
  const S = 36.9, B = 40.94, Cc = 45.0, E = 49.04;
  const o = Math.min(prog(t, S, S + 0.4), 1 - prog(t, E - 0.1, E + 0.25));
  // year roll 1960 -> 1611
  const roll = easeInOut(prog(t, Cc + 0.3, Cc + 3.2));
  const yr = t < B ? '1950' : t < Cc + 0.3 ? '1960' : String(Math.round(lerp(1960, 1611, roll)));
  const place = t < B ? '华盛顿 · WASHINGTON' : t < Cc + 0.3 ? '纽约 · NEW YORK' : roll < 1 ? '……' : '布拉格 · PRAGUE';
  const swapA = 1 - Math.abs(prog(t, B - 0.2, B + 0.2) * 2 - 1) * 0; // keep simple
  const stampFade = t > B - 0.18 && t < B + 0.18 ? 0.35 : 1;
  // part a: index card
  const aO = inOut(t, S + 0.1, B + 0.05, 0.6, 0.35);
  const stampP = easeOut(prog(t, S + 1.3, S + 1.55));
  // part b: magazine page
  const bO = inOut(t, B, Cc + 0.1, 0.6, 0.4);
  const bx = (1 - easeOut(prog(t, B, B + 0.8))) * 50;
  const lines = 14;
  // part c: candle
  const cO = easeOut(prog(t, Cc + 0.2, Cc + 1.8));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ opacity: cO * 0.9, background: 'radial-gradient(ellipse 70% 60% at 50% 70%, rgba(150,96,40,0.25), rgba(0,0,0,0) 75%)' }} />
      <div style={{ opacity: stampFade * swapA }}>
        <YearStamp t={t} at={S} out={E + 0.5} year={yr} place={place} />
      </div>
      {aO > 0 && (
        <div style={{ position: 'absolute', left: 960 - 400, top: 250, width: 800, height: 400, opacity: aO,
          transform: `rotate(-2deg) translateY(${(1 - easeOut(prog(t, S, S + 0.8))) * 30}px)`, background: C.cardFront,
          boxShadow: '0 20px 50px rgba(0,0,0,0.55)', padding: '44px 56px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: EN, fontSize: 22, letterSpacing: '0.28em', color: '#7a6a52' }}>JANUARY 1950 · WASHINGTON</div>
          <div style={{ height: 1, background: '#b9a986', margin: '16px 0 34px' }} />
          <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 84, color: C.cardInk, lineHeight: 1 }}>The Fiancée Problem</div>
          <div style={{ fontFamily: EN, fontSize: 28, color: '#6a5a44', marginTop: 26, letterSpacing: '0.06em' }}>Merrill M. Flood</div>
          <div style={{ position: 'absolute', right: 48, bottom: 40, padding: '8px 16px', border: `3px solid ${C.rouge}`, color: C.rouge,
            fontFamily: ZH, fontWeight: 900, fontSize: 36, letterSpacing: '0.12em', opacity: Math.min(1, stampP * 3),
            transform: `rotate(-8deg) scale(${lerp(1.6, 1, stampP)})` }}>
            未婚妻问题
          </div>
        </div>
      )}
      {bO > 0 && (
        <div style={{ position: 'absolute', left: 960 - 300, top: 190, width: 600, height: 560, opacity: bO, transform: `translateX(${bx}px) rotate(1.2deg)`,
          background: '#e9e0c8', boxShadow: '0 20px 50px rgba(0,0,0,0.55)', padding: '40px 48px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: EN, fontSize: 20, letterSpacing: '0.3em', color: '#7a6a52' }}>FEBRUARY 1960</div>
          <div style={{ fontFamily: EN, fontWeight: 600, fontSize: 46, color: C.cardInk, letterSpacing: '0.08em', marginTop: 10 }}>MATHEMATICAL GAMES</div>
          <div style={{ fontFamily: EN, fontStyle: 'italic', fontSize: 24, color: '#6a5a44', marginTop: 4 }}>by Martin Gardner</div>
          <div style={{ height: 1, background: '#b9a986', margin: '20px 0 22px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 26px' }}>
            {new Array(lines * 2).fill(0).map((_, i) => {
              const lp = easeOut(prog(t, B + 0.5 + i * 0.06, B + 0.9 + i * 0.06));
              const w = [100, 92, 97, 88, 100, 76, 95, 99, 90, 84, 100, 70, 96, 93][i % lines];
              return <div key={i} style={{ height: 7, margin: '0 0 13px', width: `${w * lp}%`, background: '#b3a483', opacity: 0.7 }} />;
            })}
          </div>
        </div>
      )}
      <Candle t={t} x={960} y={600} o={cO} />
      <Subtitle t={t} at={S + 0.3} out={B - 0.05} zh="数学家弗勒德提出了它，名叫*「未婚妻问题」*" en="Mathematician Merrill Flood called it “the fiancée problem”." />
      <Subtitle t={t} at={B + 0.25} out={Cc - 0.05} zh="《科学美国人》刊出，数学家们争相求解" en="Scientific American publishes it, and mathematicians race to solve it." />
      <Subtitle t={t} at={Cc + 0.2} out={E - 0.15} zh="而三百多年前，早有人用人生，把这道题做了一遍" en="Centuries earlier, someone had already lived it." />
    </AbsoluteFill>
  );
};

/* S07–S08 · Kepler 49.04 → 63.20 */
const keplerPos = (M: number, a: number, e: number) => {
  let E = M;
  for (let i = 0; i < 6; i++) E = M + e * Math.sin(E);
  return { x: a * (Math.cos(E) - e), y: a * Math.sqrt(1 - e * e) * Math.sin(E) };
};

export const Kepler: React.FC<{ t: number }> = ({ t }) => {
  const S = 49.04, P = 57.14, E = 63.2;
  const o = Math.min(prog(t, S - 0.25, S + 0.1), 1 - prog(t, E - 0.25, E + 0.1));
  const cam = lerp(1, 1.05, prog(t, S, E));
  // orbit
  const a = 640, ecc = 0.93, b = a * Math.sqrt(1 - ecc * ecc);
  const cx = 960, cy = 205;
  const orbitP = easeInOut(prog(t, S, S + 6));
  const pl = keplerPos((t - S) * 0.55 + 2.2, a, ecc);
  const sunX = cx + a * ecc; // focus
  const chosen = easeInOut(prog(t, P, P + 0.9));
  const yearRoll = easeInOut(prog(t, P + 0.2, P + 1.4));
  const year = String(Math.round(lerp(1611, 1613, yearRoll)));
  const place = yearRoll < 0.99 ? '布拉格 · PRAGUE' : '埃弗丁 · EFERDING';
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 55% at 78% 70%, rgba(150,96,40,0.28), rgba(0,0,0,0) 70%)' }} />
      <YearStamp t={t} at={S - 0.3} out={E + 0.5} year={year} place={place} />
      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform={`rotate(-3 ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={a} ry={b} fill="none" stroke={C.gold} strokeOpacity={0.22} strokeWidth={1.5} pathLength={1}
              strokeDasharray="1 1" strokeDashoffset={1 - orbitP} />
            <circle cx={sunX} cy={cy} r={9} fill={C.goldHi} opacity={0.55 * orbitP} />
            <circle cx={sunX} cy={cy} r={26} fill={C.gold} opacity={0.1 * orbitP} />
            <circle cx={cx + a * ecc + pl.x} cy={cy + pl.y} r={5} fill={C.paper} opacity={0.7 * orbitP} />
          </g>
        </svg>
        {new Array(11).fill(0).map((_, i) => {
          const at = beatAfter(S + 2.0, i);
          const ap = easeOut(prog(t, at, at + 0.6));
          const x = 330 + i * 126;
          const y = 540 - 46 * Math.sin((Math.PI * i) / 10);
          const isFive = i === 4;
          const d = isFive ? 0 : chosen * 0.68;
          const lift = isFive ? chosen * -60 : 0;
          const sc = isFive ? lerp(1, 1.35, chosen) : 1;
          const gold = isFive ? chosen : 0;
          return (
            <div key={i} style={{ position: 'absolute', left: x - 50, top: y - 34, width: 100, height: 68, opacity: ap * (1 - d),
              transform: `translateY(${(1 - ap) * 22 + lift}px) scale(${sc})` }}>
              {isFive && <Glow x={50} y={34} r={150} color="rgba(233,190,110,0.6)" opacity={gold * 0.8} />}
              <div style={{ position: 'absolute', inset: 0, boxShadow: '0 8px 18px rgba(0,0,0,0.5)',
                background: gold > 0 ? `linear-gradient(160deg, rgba(240,213,154,${gold}), rgba(201,164,92,${gold})), ${C.cardBack}` : C.cardBack }}>
                <svg width={100} height={68} style={{ position: 'absolute', left: 0, top: 0 }}>
                  <path d="M2 2 L50 40 L98 2" fill="none" stroke="#9c8b6a" strokeWidth={1.5} />
                </svg>
                <div style={{ position: 'absolute', left: 50 - 11, top: 40 - 11, width: 22, height: 22, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #d8665a, #8e2f25)' }} />
              </div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 80, textAlign: 'center', fontFamily: EN, fontSize: 24,
                color: isFive && gold > 0.5 ? C.gold : C.dim }}>{i + 1}</div>
            </div>
          );
        })}
        {/* label under #5 */}
        <div style={{ position: 'absolute', left: 330 + 4 * 126 - 200, width: 400, top: 670, textAlign: 'center',
          opacity: easeOut(prog(t, P + 1.0, P + 1.6)) }}>
          <div style={{ fontFamily: ZH, fontSize: 30, color: C.paper, letterSpacing: '0.12em' }}>第5位 · 苏珊娜</div>
          <div style={{ fontFamily: ZH, fontSize: 22, color: C.gold, marginTop: 6, letterSpacing: '0.15em' }}>1613年成婚 · 婚后幸福</div>
        </div>
        {/* teaser bracket over the first four */}
        {(() => {
          const bp = easeOut(prog(t, 61.18, 61.9));
          const x0 = 330 - 50, x1 = 330 + 3 * 126 + 50;
          return (
            <div style={{ position: 'absolute', left: x0, top: 440, width: x1 - x0, opacity: bp * 0.9 }}>
              <div style={{ height: 14, borderTop: `1.5px solid ${C.slateHi}`, borderLeft: `1.5px solid ${C.slateHi}`, borderRight: `1.5px solid ${C.slateHi}`,
                transform: `scaleX(${bp})` }} />
              <div style={{ textAlign: 'center', fontFamily: ZH, fontSize: 22, color: C.slateHi, marginTop: -48, letterSpacing: '0.2em' }}>前4位</div>
            </div>
          );
        })()}
      </AbsoluteFill>
      <Subtitle t={t} at={S + 0.55} out={S + 3.95} zh="天文学家开普勒，失去了妻子" en="The astronomer Johannes Kepler loses his wife." />
      <Subtitle t={t} at={S + 4.06} out={P - 0.1} zh="之后两年，他先后考虑了*11*位再婚对象" en="Over two years, he considers eleven possible matches." />
      <Subtitle t={t} at={P + 0.05} out={60.3} zh="犹豫、错过、再回头，他选了*第5位*" en="He hesitated, moved on, came back, and chose the fifth." />
      <Subtitle t={t} at={60.45} out={E - 0.1} zh="后来算出的最优解，也恰好指向*第5位*" en="The maths, worked out later, points to the fifth as well." />
    </AbsoluteFill>
  );
};

export { lerp };
