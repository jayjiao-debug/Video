import React from 'react';
import { ZH, EN, CAST, Who, Bust, Avatar, Heart, clamp } from './ui6';
import { Mood } from '../v4/Why';
import { mulberry } from '../v1/data';

/* A phone in phone units (PW x PH), screen-facing. A generic social feed (not any real app's UI). */
export const PW = 360, PH = 740, SX = 14, SY = 16, SW = PW - 28, SH = PH - 32;

export type Post = { who: number | Who; text: string; n: number; bg: string; likes: number; seed: number; mood?: Mood; crowdMood?: Mood; star?: number };
const whoOf = (w: number | Who) => (typeof w === 'number' ? CAST[w] : w);

/** a group photo: n tiny people on a coloured backdrop */
export const GroupPhoto: React.FC<{ w: number; h: number; n: number; bg: string; seed: number; mood?: Mood; star?: number; id: string }> = ({ w, h, n, bg, seed, mood = 'laugh', star, id }) => {
  const r = mulberry(seed);
  const cols = Math.ceil(Math.sqrt(n * (w / h) * 0.9));
  const rows = Math.ceil(n / cols);
  const people: React.ReactNode[] = [];
  const hr = Math.min(w / (cols + 0.6), (h / (rows + 0.6)) * 1.1) * 0.34;
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = Math.min(cols, n - row * cols);
    const x = w / 2 + (col - (inRow - 1) / 2) * (w / (cols + 0.4)) + (r() - 0.5) * hr * 0.4;
    const y = h * 0.42 + (row - (rows - 1) / 2) * hr * 2.3 + hr * 0.6;
    const base = CAST[Math.floor(r() * CAST.length)];
    const who: Who = i === star ? CAST[0] : { ...base, shirt: ['#d06b5a', '#5d8fc9', '#e0b24e', '#6aa37a', '#9a6fc0', '#e08a4a', '#4aa0a8'][Math.floor(r() * 7)], hairColor: ['#1d1a1c', '#3a2a1f', '#5a3c26', '#222'][Math.floor(r() * 4)] };
    people.push(<g key={i} transform={`translate(${x},${y})`}><Bust who={who} mood={mood} r={hr} /></g>);
  }
  return (
    <g>
      <defs><clipPath id={`gp-${id}`}><rect width={w} height={h} rx={10} /></clipPath></defs>
      <g clipPath={`url(#gp-${id})`}>
        <rect width={w} height={h} fill={bg} />
        <rect y={h * 0.62} width={w} height={h * 0.38} fill="rgba(0,0,0,0.18)" />
        {people}
        <rect width={w} height={h} fill="url(#photo-shade)" />
      </g>
    </g>
  );
};
export const POST_H = 330;
export const PostView: React.FC<{ p: Post; id: string }> = ({ p, id }) => {
  const who = whoOf(p.who);
  return (
    <g>
      <g transform="translate(40, 34)"><Avatar who={who} mood={p.mood ?? 'calm'} r={24} id={`pa-${id}`} bg="#2a3348" /></g>
      <text x={76} y={30} style={{ fontFamily: ZH, fontWeight: 700, fontSize: 21, fill: '#8fb0e8' }}>{who.name}</text>
      <text x={76} y={60} style={{ fontFamily: ZH, fontSize: 21, fill: '#e9e4da' }}>{p.text}</text>
      <g transform="translate(76, 78)"><GroupPhoto w={232} h={176} n={p.n} bg={p.bg} seed={p.seed} mood={p.crowdMood} star={p.star} id={id} /></g>
      <Heart x={86} y={270} s={1} />
      <text x={104} y={286} style={{ fontFamily: EN, fontWeight: 600, fontSize: 22, fill: 'rgba(233,228,218,0.75)' }}>{p.likes}</text>
      <rect x={20} y={POST_H - 8} width={SW - 40} height={1} fill="rgba(255,255,255,0.08)" />
    </g>
  );
};
/** the feed: a profile header (cover + own avatar) then posts; scroll in px (0 = top) */
export const Feed: React.FC<{ posts: Post[]; scroll: number; me?: number | Who; meMood?: Mood; id: string; headerH?: number }> = ({ posts, scroll, me = 0, meMood = 'worry', id, headerH = 300 }) => {
  const who = whoOf(me);
  return (
    <g>
      <rect width={SW} height={SH} fill="#11151f" />
      <g transform={`translate(0, ${-scroll})`}>
        {/* header */}
        <rect width={SW} height={240} fill="url(#cover-grad)" />
        {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={(i * 97) % SW} cy={30 + ((i * 53) % 180)} r={1.2 + (i % 3) * 0.6} fill="#fff" opacity={0.5} />)}
        <path d={`M 0 200 Q ${SW * 0.3} 160 ${SW * 0.55} 190 T ${SW} 175 L ${SW} 240 L 0 240 Z`} fill="#0d1220" />
        <text x={SW - 118} y={262} textAnchor="end" style={{ fontFamily: ZH, fontWeight: 700, fontSize: 24, fill: '#f3ede2' }}>{who.name}</text>
        <g transform={`translate(${SW - 62}, 236)`}>
          <rect x={-44} y={-44} width={88} height={88} rx={14} fill="#2a3348" stroke="#11151f" strokeWidth={4} />
          <defs><clipPath id={`me-${id}`}><rect x={-42} y={-42} width={84} height={84} rx={12} /></clipPath></defs>
          <g clipPath={`url(#me-${id})`}><g transform="translate(0, 6)"><Bust who={who} mood={meMood} r={24} /></g></g>
        </g>
        {posts.map((p, i) => <g key={i} transform={`translate(0, ${headerH + i * POST_H})`}><PostView p={p} id={`${id}-${i}`} /></g>)}
      </g>
      {/* status bar */}
      <rect width={SW} height={34} fill="rgba(10,12,18,0.85)" />
      <text x={22} y={24} style={{ fontFamily: EN, fontWeight: 600, fontSize: 20, fill: '#e9e4da' }}>1:07</text>
      <rect x={SW - 52} y={11} width={30} height={13} rx={3} fill="none" stroke="#e9e4da" strokeWidth={1.6} />
      <rect x={SW - 50} y={13} width={8} height={9} fill="#ff6a5c" />
    </g>
  );
};
/** phone body around a screen; children drawn in screen units (SW x SH) */
export const Phone: React.FC<{ id: string; glow?: number; children?: React.ReactNode }> = ({ id, glow = 1, children }) => (
  <g>
    <defs>
      <clipPath id={`scr-${id}`}><rect width={SW} height={SH} rx={30} /></clipPath>
      <linearGradient id="cover-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d2a4e" /><stop offset="1" stopColor="#3a3260" /></linearGradient>
      <linearGradient id="photo-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.25" /></linearGradient>
    </defs>
    <rect x={-30} y={-30} width={PW + 60} height={PH + 60} rx={80} fill="#8fb0ff" opacity={0.10 * glow} />
    <rect width={PW} height={PH} rx={44} fill="#0b0c10" stroke="#2c2f38" strokeWidth={3} />
    <g transform={`translate(${SX}, ${SY})`}>
      <g clipPath={`url(#scr-${id})`}>{children}</g>
    </g>
    <rect x={PW / 2 - 50} y={SY + 8} width={100} height={22} rx={11} fill="#0b0c10" />
  </g>
);
export const FEED_A: Post[] = [
  { who: 2, text: '生日快乐！谢谢12个兄弟', n: 12, bg: '#6b4a7a', likes: 46, seed: 11 },
  { who: 1, text: '周五五排，冲！', n: 5, bg: '#2f5a6e', likes: 88, seed: 12 },
  { who: 3, text: '社团迎新 · 38人', n: 38, bg: '#7a5a3a', likes: 120, seed: 13 },
  { who: 4, text: '毕业旅行 Day 3', n: 9, bg: '#3a7a8a', likes: 73, seed: 14 },
  { who: 1, text: '烧烤局，下次还约', n: 14, bg: '#8a4a3a', likes: 95, seed: 15 },
  { who: 5, text: '球赛赢了！', n: 11, bg: '#3a6a3a', likes: 64, seed: 16 },
];
/** inertial thumb flicks: list of [start, distance, duration]; the screen glides and slows */
export const flickScroll = (T: number, flicks: [number, number, number][], base = 0) => {
  let s = base;
  for (const [a, d, dur] of flicks) {
    const k = clamp((T - a) / dur);
    s += d * (1 - Math.pow(1 - k, 3));
  }
  return s;
};
