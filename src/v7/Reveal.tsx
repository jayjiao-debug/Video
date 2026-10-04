import React from 'react';
import { AbsoluteFill } from 'remotion';
import { b, prog, easeOut, easeInOut, lerp, clamp, zlerp, pop, win, Subs, SubBand, Chapter, Line, CAST, Who, Avatar, Bust, GOLD, BLUE, CREAM, NIGHT, ZH, EN, easeIn3 } from '../v6/ui6';
import { Phone, Feed, Post } from '../v6/Phone';
import { Room, Shoulder, PK, PX, PY } from '../v6/S1Cold';
import { SX, SY } from '../v6/Phone';
import { GoldTitle } from '../brand/Brand';
import { JUNO } from '../brand/identity';
import { HER } from './people7';
import { Vignette, Grain } from '../ui';

/* S6a, b159.6 -> b176: that night, on 阿杰's page, there she is. And the end card (b194 -> end). */
export const R_IN = b(159.6), R_OUT = b(176), END_IN = b(194), FILM_END7 = b(194) + 7.6;
const LINES: Line[] = [
  [b(160) + 0.12, b(168) - 0.08, '晚上，他在阿杰的朋友圈看到了她', 'That night, on A-Jie\'s page, he saw her.'],
  [b(168) + 0.06, R_OUT - 0.12, '你们之间，只隔着[一个阿杰]', 'Between you two: just A-Jie.'],
];
const POST: Post = { who: 2, text: '高中同学聚会，好久不见', n: 7, bg: '#6a5a8a', likes: 58, seed: 41, mood: 'laugh' };
const SCROLL = 300; // the header is scrolled away; the post sits at the top of the screen
/* the reunion photo: 阿杰 and his classmates, she is in the front row */
const CLASS: Who[] = [
  { name: 'a', hair: 'slick', hairColor: '#222', shirt: '#5d8fc9' }, { name: 'b', hair: 'updo', hairColor: '#4a2f22', shirt: '#e0b24e' },
  { name: 'c', hair: 'bald', hairColor: '#222', shirt: '#6aa37a' }, { name: 'd', hair: 'cap', hairColor: '#222', shirt: '#9a6fc0' },
  CAST[2], HER, { name: 'e', hair: 'slick', hairColor: '#5a3c26', shirt: '#e08a4a' },
];
const PHOTO_W = 232, PHOTO_H = 176;
const Reunion: React.FC<{ ring: number }> = ({ ring }) => {
  const back = [0, 1, 2, 3], front = [4, 5, 6];
  const hr = 20;
  return (
    <g>
      <clipPath id="reunion"><rect width={PHOTO_W} height={PHOTO_H} rx={10} /></clipPath>
      <g clipPath="url(#reunion)">
        <rect width={PHOTO_W} height={PHOTO_H} fill="#6a5a8a" />
        <rect y={PHOTO_H * 0.62} width={PHOTO_W} height={PHOTO_H * 0.38} fill="rgba(0,0,0,0.18)" />
        {back.map((k, i) => <g key={k} transform={`translate(${36 + i * 53} 58)`}><Bust who={CLASS[k]} mood="laugh" r={hr} /></g>)}
        {front.map((k, i) => <g key={k} transform={`translate(${56 + i * 60} 112)`}><Bust who={CLASS[k]} mood={k === 5 ? 'calm' : 'laugh'} r={hr * 1.08} /></g>)}
      </g>
      {ring > 0 && <circle cx={116} cy={110} r={30 + 6 * (1 - ring)} fill="none" stroke={GOLD} strokeWidth={3.5} opacity={ring} />}
    </g>
  );
};
export const RevealScene: React.FC<{ T: number }> = ({ T }) => {
  if (T < R_IN - 0.02 || T > R_OUT + 0.05) return null;
  // camera: start on the phone, then push into the photo
  const k = easeInOut(prog(T, b(165.6), b(167.8)));
  const photoX = PX + (SX + 76) * PK + 116 * PK, photoY = PY + (SY + 78 + 300 - SCROLL + 0) * PK + 110 * PK;
  const s = zlerp(1.06, 3.0, k), fx = lerp(990, photoX, k), fy = lerp(520, photoY - 55, k);
  const ring = easeOut(prog(T, b(166.6), b(167.3)));
  const chain = easeOut(prog(T, b(168.4), b(169.2)));
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(960 540) scale(${s}) translate(${-fx} ${-fy})`}>
          <Room T={T} />
          <ellipse cx={1060} cy={470} rx={520} ry={420} fill="#5f86d8" opacity={0.1} />
          <g transform={`translate(${PX} ${PY}) scale(${PK})`}>
            <Phone id="r7" glow={1.1}>
              <Feed posts={[POST, { who: 1, text: '烧烤局，下次还约', n: 14, bg: '#8a4a3a', likes: 95, seed: 15 }]} scroll={SCROLL - 30 * (1 - easeOut(prog(T, R_IN, R_IN + 1.4)))} me={2} meMood="calm" id="r7f" />
              <g transform={`translate(76 ${300 + 78 - SCROLL + 30 * (1 - easeOut(prog(T, R_IN, R_IN + 1.4)))})`}><Reunion ring={ring} /></g>
            </Phone>
          </g>
          <Shoulder T={T} thumbY={0} />
        </g>
        {/* the chain: 小张 — 阿杰 — 她 */}
        {chain > 0 && (
          <g opacity={chain} transform="translate(960 150)">
            <rect x={-380} y={-86} width={760} height={190} rx={24} fill="rgba(7,10,20,0.82)" stroke="rgba(246,207,120,0.4)" />
            {[[-260, CAST[0], '小张'], [0, CAST[2], '阿杰'], [260, HER, '她']].map(([x, who, name]: any, i) => (
              <g key={i} transform={`translate(${x} 0)`}>
                <Avatar who={who} mood={i === 0 ? 'worry' : 'calm'} r={46} ring={i === 1 ? GOLD : 'rgba(255,255,255,0.4)'} ringW={i === 1 ? 4 : 2} id={`ch${i}`} bg="#2a3348" />
                <text y={80} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 26, fill: i === 1 ? GOLD : CREAM }}>{name}</text>
              </g>
            ))}
            {[-1, 1].map((d) => <line key={d} x1={d * 52} y1={0} x2={d * (52 + 156 * easeOut(prog(T, b(168.6), b(169.4))))} y2={0} stroke={GOLD} strokeWidth={4} />)}
          </g>
        )}
      </svg>
      <Chapter T={T} at={R_IN + 0.4} out={b(168.2)} text="当 天 晚 上 · 宿 舍" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES} />
      <Vignette strength={0.5} />
      <Grain />
    </AbsoluteFill>
  );
};

export const EndCard7: React.FC<{ T: number }> = ({ T }) => {
  const t = T - END_IN;
  if (t < -0.05) return null;
  const f = t * 30;
  const card = easeInOut(prog(t, 0, 0.8));
  const black = easeIn3(prog(T, FILM_END7 - 0.7, FILM_END7));
  const o = (a: number, d = 0.5) => easeOut(prog(t, a, a + d));
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <rect width={1920} height={1080} fill="#05060b" opacity={0.84 * card} />
        <text x={960} y={262} textAnchor="middle" style={{ fontFamily: EN, fontWeight: 600, fontSize: 24, letterSpacing: '0.42em', fill: '#f1c56d' }} opacity={o(0.2)}>SMALL WORLD · 小 世 界</text>
        <GoldTitle text="隔着几个人" f={f} at={8} size={104} y={400} />
        <g transform="translate(960 478)" opacity={o(0.9)}>
          {[-90, 0, 90].map((x, i) => <circle key={i} cx={x} cy={0} r={i === 1 ? 10 : 8} fill={i === 1 ? GOLD : CREAM} />)}
          <line x1={-82} y1={0} x2={-10} y2={0} stroke={GOLD} strokeWidth={2} /><line x1={10} y1={0} x2={82} y2={0} stroke={GOLD} strokeWidth={2} />
        </g>
        <text x={960} y={590} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 46, fill: CREAM, letterSpacing: '0.06em' }} opacity={o(1.4)}>评论区说说：你离谁，只隔一个人？</text>
        <text x={960} y={640} textAnchor="middle" style={{ fontFamily: ZH, fontSize: 26, fill: 'rgba(243,237,226,0.6)', letterSpacing: '0.1em' }} opacity={o(1.8)}>@ 一个你认识的、人脉最广的朋友</text>
        <g opacity={o(2.3)}>
          <rect x={960 - 330} y={690} width={660} height={56} rx={28} fill="none" stroke="#f1c56d" strokeOpacity={0.6} />
          <text x={960} y={727} textAnchor="middle" style={{ fontFamily: ZH, fontWeight: 500, fontSize: 26, letterSpacing: '0.2em', fill: '#f1c56d' }}>{JUNO.follow}</text>
        </g>
        <g opacity={o(2.7)} style={{ fontFamily: ZH, fontSize: 17, letterSpacing: '0.03em', fill: 'rgba(243,237,226,0.42)' }}>
          <text x={960} y={968} textAnchor="middle">资料：Travers & Milgram, Sociometry (1969) · Backstrom 等, Four Degrees of Separation (2012) · Bhagat 等, Facebook Research (2016)</text>
          <text x={960} y={996} textAnchor="middle">地铁、宿舍、寄信路线与网络画面均为示意</text>
        </g>
        <rect width={1920} height={1080} fill="#000" opacity={black} />
      </svg>
    </AbsoluteFill>
  );
};
