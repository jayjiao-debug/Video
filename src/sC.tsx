import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, FILM_END, SANS, MONO, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, hit } from './lib';
import { stageStyle, keyCam } from './camera';
import { useLook } from './look';
import { Pin, ProfileCard, heart } from './ui';
import { JUNO } from './brand/identity';

/* Stage E (CUT.pay → CUT.end): a map app. The high street (rent high, people pass anyway) and the alleys. In the
   alleys the bad shops close (已歇业); the ones still open are the good ones: the same sieve, on food. Then the
   three sieves (约会, 医院, 小店) drop into one ring: "被谁筛过？". Stage F: the end card. */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };

const MAIN = [3.6, 4.1, 3.3, 4.4, 3.8, 3.5].map((r, i) => ({ x: 330 + i * 250, y: 640, r }));
const ALLEY = [
  { x: 420, y: 360, r: 4.8, close: false }, { x: 640, y: 290, r: 3.1, close: true }, { x: 860, y: 380, r: 4.7, close: false },
  { x: 1080, y: 300, r: 2.9, close: true }, { x: 1300, y: 370, r: 3.4, close: true }, { x: 1520, y: 290, r: 4.9, close: false },
];

export const Pay: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, CUT.pay, CUT.end, [0, 0]);
  if (!st) return null;
  const a = CUT.pay;
  const cam = keyCam(T, [[a, 1.12, 960, 480, 960, 500], [84.6, 1.12, 960, 480, 960, 500], [84.61, 1, 960, 540, 960, 540], [85.4, 1.35, 960, 360, 960, 470], [87.0, 1.35, 960, 360, 960, 470], [87.8, 1, 960, 540, 960, 540]]);
  const map = easeOut(prog(T, a + 0.2, a + 0.7)) * (1 - easeIn(prog(T, 87.1, 87.6)));
  const ring = easeOut(prog(T, 87.3, 87.9));
  return (
    <AbsoluteFill style={st}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {map > 0 && (
          <g opacity={map} transform={cam.t}>
            {/* roads */}
            <rect x={-200} y={600} width={2320} height={90} fill="rgba(255,242,246,0.09)" />
            <line x1={-200} y1={645} x2={2120} y2={645} stroke="rgba(255,242,246,0.35)" strokeWidth={3} strokeDasharray="30 26" strokeDashoffset={-T * 60} />
            <path d="M 160 600 C 260 420, 520 470, 640 300 S 980 250, 1080 300 S 1400 440, 1520 290 S 1760 200, 1900 260" stroke="rgba(255,242,246,0.12)" strokeWidth={22} fill="none" />
            <path d="M 520 600 C 560 520, 440 430, 420 360 M 860 600 C 900 520, 840 460, 860 380 M 1300 600 C 1260 520, 1340 450, 1300 370" stroke="rgba(255,242,246,0.12)" strokeWidth={14} fill="none" />
            <text x={150} y={740} style={{ ...BLACK, fontSize: 36, fill: L.ink }}>主街 <tspan style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 }} fill={L.dim}>人流大，位置好</tspan></text>
            <text x={150} y={230} style={{ ...BLACK, fontSize: 36, fill: L.ink }}>巷子 <tspan style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24 }} fill={L.dim}>难找，没人路过</tspan></text>
            {MAIN.map((p, i) => <g key={`m${i}`} transform={`translate(${p.x} ${p.y})`}><Pin L={L} rating={p.r} s={pop(T, a + 0.35 + i * 0.08, 0.3)} /></g>)}
            {ALLEY.map((p, i) => {
              const close = p.close ? easeOut(prog(T, 83.4 + i * 0.12, 83.8 + i * 0.12)) : 0;
              const glow = !p.close ? hit(T, 84.9 + i * 0.05, 0.6) : 0;
              return (
                <g key={`a${i}`} transform={`translate(${p.x} ${p.y})`}>
                  {glow > 0.02 && <circle cx={0} cy={-46} r={40 + 50 * (1 - glow)} fill="none" stroke="#ffd36b" strokeWidth={4} opacity={glow} />}
                  <Pin L={L} rating={p.r} closed={close} s={pop(T, a + 0.6 + i * 0.08, 0.3) * (1 + 0.15 * (!p.close ? easeOut(prog(T, 84.8, 85.2)) : 0))} />
                </g>
              );
            })}
            <g opacity={easeOut(prog(T, 85.0, 85.5))}>
              <text x={960} y={140} textAnchor="middle" style={{ ...BLACK, fontSize: 44, fill: '#ffd36b' }}>位置差还活着的，只能靠好吃</text>
            </g>
            <text x={1780} y={790} textAnchor="end" opacity={easeOut(prog(T, a + 1, a + 1.5))} style={{ fontFamily: SANS, fontSize: 18, fill: L.dim }}>示意 · "难找的店常是好兆头"：经济学家 Tyler Cowen，2012</text>
          </g>
        )}
        {/* three sieves into one ring */}
        {ring > 0 && (() => {
          const q = easeOut(prog(T, 90.5, 91.0));
          const thumbs = [{ lab: '约会', x: 560 }, { lab: '医院', x: 960 }, { lab: '小店', x: 1360 }];
          return (
            <g opacity={ring}>
              <ellipse cx={960} cy={560} rx={520} ry={120} fill="rgba(255,79,139,0.05)" stroke={L.accent} strokeWidth={6} style={{ filter: `drop-shadow(0 0 16px ${L.accentGlow})` }} />
              {Array.from({ length: 7 }, (_, r) => Array.from({ length: 13 }, (_, c) => {
                const u = (c - 6) / 6.6, v = (r - 3) / 3.6;
                if (u * u + v * v > 0.9) return null;
                return <ellipse key={`${r}-${c}`} cx={960 + u * 520} cy={560 + v * 120} rx={12} ry={4.5} fill="none" stroke={L.accent} strokeOpacity={0.5} strokeWidth={2} />;
              }))}
              {thumbs.map((t, k) => {
                const enter = easeOut(prog(T, 87.4 + k * 0.15, 87.9 + k * 0.15));
                const d = easeIn(prog(T, 90.1 + k * 0.12, 90.7 + k * 0.12));
                const y = lerp(lerp(-120, 330, enter), 560, d) + Math.sin(T * 2 + k) * 8 * (1 - d), o = enter * (1 - prog(d, 0.8, 1));
                return (
                  <g key={k} transform={`translate(${t.x} ${y}) scale(${1.3 - 0.7 * d})`} opacity={o * ring}>
                    <rect x={-110} y={-70} width={220} height={140} rx={18} fill="#24122a" stroke="rgba(255,242,246,0.25)" strokeWidth={2} />
                    {k === 0 && <g transform="translate(0 -8) scale(0.26)"><ProfileCard L={L} id={`th${k}`} seed={3} looks={0.85} pers={0.4} /></g>}
                    {k === 1 && <g><rect x={-30} y={-48} width={60} height={60} rx={10} fill={L.accent} /><path d="M -14 -18 h 28 M 0 -32 v 28" stroke="#fff" strokeWidth={8} /></g>}
                    {k === 2 && <g transform="translate(0 20) scale(0.7)"><path d="M 0 0 C -10 -18, -26 -30, -26 -46 A 26 26 0 1 1 26 -46 C 26 -30, 10 -18, 0 0 Z" fill="#ffd36b" /></g>}
                    <text x={0} y={56} textAnchor="middle" style={{ ...BLACK, fontSize: 24, fill: L.ink }}>{t.lab}</text>
                  </g>
                );
              })}
              <g opacity={q} transform={`translate(960 ${300 - 20 * (1 - q)})`}>
                <text x={0} y={0} textAnchor="middle" style={{ ...BLACK, fontSize: 96, fill: L.ink }}>被谁<tspan fill={L.accent}>筛</tspan>过？</text>
              </g>
              <g opacity={easeOut(prog(T, 88.0, 88.5))} transform="translate(960 760)">
                <text x={-30} y={0} textAnchor="end" style={{ ...BLACK, fontSize: 40, fill: L.accent }}>这个好 ↑</text>
                <text x={30} y={0} style={{ ...BLACK, fontSize: 40, fill: L.second }}>那个就差 ↓</text>
              </g>
            </g>
          );
        })()}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ end card
export const End: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, CUT.end, FILM_END + 1, [0, 0]);
  if (!st) return null;
  const t = T - CUT.end;
  const o = (x: number, d = 0.35) => easeOut(prog(t, x, x + d));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  return (
    <AbsoluteFill style={{ ...st, backgroundColor: L.bg }}>
      <svg width={1920} height={1080}>
        <defs><radialGradient id="end-g" cx="0.5" cy="0.4" r="0.55"><stop offset="0" stopColor="#ff4f8b" stopOpacity="0.12" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
        <rect width={1920} height={1080} fill="url(#end-g)" />
        <g opacity={o(0)} transform={`translate(960 300) scale(${0.9 + 0.1 * Math.min(1, pop(t, 0, 0.3))})`}>
          <text x={0} y={0} textAnchor="middle" style={{ ...BLACK, fontSize: 150, fill: L.ink, letterSpacing: '0.08em' }}>筛子</text>
          {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-160 + i * 40} cy={58} r={10} fill="none" stroke={L.accent} strokeWidth={4} style={{ filter: `drop-shadow(0 0 6px ${L.accentGlow})` }} />)}
          <text x={0} y={-150} textAnchor="middle" style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.6em', fill: L.dim }}>BERKSON'S PARADOX</text>
        </g>
        <text x={960} y={530} textAnchor="middle" opacity={o(0.5)} style={{ ...BLACK, fontSize: 62, fill: L.ink }}>你还见过哪种<tspan fill={L.accent}>「此消彼长」</tspan>？</text>
        <text x={960} y={590} textAnchor="middle" opacity={o(0.7)} style={{ fontFamily: SANS, fontSize: 28, fill: L.dim, letterSpacing: '0.06em' }}>评论区说一个，再发给那个说"好看的都渣"的朋友</text>
        <g opacity={o(1.0)}>
          <rect x={960 - 330} y={640} width={660} height={56} rx={28} fill="none" stroke={L.accent} strokeOpacity={0.8} strokeWidth={2} />
          <path d={heart(9)} transform="translate(668 668)" fill={L.accent} />
          <text x={975} y={677} textAnchor="middle" style={{ fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: '0.2em', fill: L.ink }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(1.2)} style={{ fontFamily: SANS, fontSize: 18, fill: 'rgba(255,242,246,0.42)' }}>
          <text x={960} y={770} textAnchor="middle">资料：Berkson (1946) Biometrics Bulletin · Ellenberg《魔鬼数学》(2014) · Griffith 等 (2020) Nature Communications · Miyara 等 (2020) · 尼古丁贴片临床试验 (Intensive Care Med, 2022)</text>
          <text x={960} y={800} textAnchor="middle">1000 人散点为模拟 · 医院、小店数据为示意 · 法国 2020.04.25 限购尼古丁替代品（Euronews）</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
export { rnd, lerp, easeInOut };
