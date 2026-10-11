import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ZH, EN, beats, prog, easeOut, easeIn, easeInOut } from '../lib';
import { Vignette, Grain } from '../ui';
import { GoldTitle } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { Sub, Finale3D } from './Titanic2';

/* 《应该没事吧》 part 7, b228 -> 130.5 s: back to boat No. 1, then the end card. */
const b = (i: number) => beats[i];
export const EN_IN = b(228), END_IN = 124.482, FILM_END = 130.5;

type Line = [number, number, string, string];
const LINES: Line[] = [
  [EN_IN + 0.3, b(236) - 0.1, '“应该没事吧”，是人最本能的一句话', '"It\'s probably fine" is the most natural thing in the world to think.'],
  [b(236) + 0.06, b(240) - 0.08, '危险来的时候，[最先动起来的那个人]', 'When danger comes, the first person to move'],
  [b(240) + 0.06, END_IN - 0.25, '往往救了一屋子人', 'often saves the whole room.'],
];
const EndCard: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < -0.1) return null;
  const f = t * 30;
  const bg = easeInOut(prog(t, 0, 0.8));
  const black = easeIn(prog(T, FILM_END - 0.6, FILM_END));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <rect width={1920} height={1080} fill="#05060b" opacity={0.78 * bg} />
        <text x={960} y={292} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(0.2)}>NORMALCY BIAS · 常态偏差</text>
        <GoldTitle text="应该没事吧" f={f} at={8} size={104} y={440} />
        {/* the motif: boat No. 1's forty seats, all taken */}
        <g transform="translate(960, 520)" opacity={o(0.9)}>
          {Array.from({ length: 40 }, (_, i) => (
            <rect key={i} x={-20 * 20 + i * 20 + 3} y={-7} width={14} height={14} rx={3} fill={i < 12 ? '#f6cf78' : '#f6cf78'} opacity={i < 12 ? 1 : 0.35 + 0.65 * easeOut(prog(t, 1.0 + (i - 12) * 0.03, 1.3 + (i - 12) * 0.03))} />
          ))}
        </g>
        <text x={960} y={636} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 48, fill: '#f3ede2', letterSpacing: '0.08em' }} opacity={o(1.5)}>火警响了，你会先跑，还是先看别人？</text>
        <text x={960} y={684} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.12em' }} opacity={o(1.9)}>评论区说说你的第一反应</text>
        <g opacity={o(2.4)}>
          <rect x={960 - 330} y={730} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={767} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.8)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.04em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={968} textAnchor="middle">资料：Wormstedt《Titanic Lifeboat Occupancy Totals》· Latané & Darley (1968) · Tilly Smith 事件报道 · 大川小学与釜石市灾后调查</text>
          <text x={960} y={996} textAnchor="middle">3D 模型（CC BY）：“RMS Titanic” by Union (krprom) · “Titanic Lifeboat” by millernathan472 · Sketchfab　|　海面法线贴图：three.js</text>
          <text x={960} y={1024} textAnchor="middle">救生艇人数为估算值，不同资料略有出入</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
export const EndingScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < EN_IN - 0.05) return null;
  const inO = easeOut(prog(T, EN_IN - 0.05, EN_IN + 0.8));
  return (
    <AbsoluteFill style={{ backgroundColor: '#05070d' }}>
      <AbsoluteFill style={{ opacity: inO }}>
        <Finale3D T={T} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 320, background: 'linear-gradient(180deg, rgba(5,7,13,0) 0%, rgba(5,7,13,0.55) 55%, rgba(5,7,13,0.8) 100%)' }} />
        {LINES.map(([at, out, zh, en], i) => <Sub key={i} T={T} at={at} out={out} zh={zh} en={en} />)}
        <Vignette strength={0.45} />
        <Grain />
      </AbsoluteFill>
      <EndCard T={T} />
    </AbsoluteFill>
  );
};
