import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { bt, prog, easeOut, smooth, win, clamp } from './eng10';
import { OpenScene, S1_IN, S1_OUT } from './Open10';
import { RiverScene } from './River10';
import { CityScene } from './City10';
import { KnotScene, FILM_END10, RISE0 } from './Knot10';
import { Grain, Vignette } from '../ui';

/* 《红线》 a short film about love. Original score (v10/score.py, 72 BPM). Every frame is a pure function of T. */
export const LOVE_FRAMES = Math.round(FILM_END10 * 30);
const SERIF = '"Noto Serif CJK SC", "Noto Serif SC", serif';
type L = [number, number, string];
const LINES: L[] = [
  [0.0, 3.3, '你的脚踝上，系着一根线'],
  [3.4, 6.6, '看不见，也剪不断'],
  [6.7, 9.9, '一千多年前，就有人这么说'],
  [10.2, 13.4, '唐代《续玄怪录》里'],
  [13.5, 16.6, '有个老人，在月下翻书'],
  [16.7, 19.9, '他说，袋子里是红绳'],
  [20.0, 23.3, '专系夫妻的脚'],
  [23.4, 26.6, '哪怕一个在吴，一个在楚'],
  [26.7, 30.0, '系上了，就逃不掉'],
  [30.3, 33.3, '后来，宋代的李之仪写'],
  [33.4, 36.6, '我住长江头，君住长江尾'],
  [36.7, 39.9, '日日思君不见君'],
  [40.0, 43.3, '共饮长江水'],
  [43.4, 46.6, '那根红线，就顺着江水'],
  [46.7, 49.9, '一头在楚，一头在吴'],
  [50.2, 53.3, '后来，你们去了同一座城市'],
  [53.4, 56.6, '春天，在同一个地铁站换乘'],
  [56.7, 59.9, '夏天，隔着一条街躲雨'],
  [60.0, 63.3, '秋天，排过同一家店的队'],
  [63.4, 66.6, '冬天，只差一个路口'],
  [66.7, 69.9, '每一次，都擦肩而过'],
  [70.0, 73.2, '红线却越收越紧'],
  [73.7, 76.5, '直到那天'],
  [77.0, 80.0, '人群里，你回过头'],
  [80.1, 83.3, '刚好，对方也在看你'],
  [83.4, 86.6, '那根线，终于收紧了'],
  [86.7, 89.9, '绕成一个同心结'],
  [90.1, 96.5, '系上了，就再也分不开'],
  [96.7, 99.9, '只愿君心似我心'],
  [100.1, 103.3, '定不负相思意'],
  [110.0, 114.6, '愿你，也被那根线温柔地找到'],
  [115.0, 120.0, '@ 那个让你想起这根线的人'],
];

const Sub: React.FC<{ T: number; l: L }> = ({ T, l: [a, z, s] }) => {
  const o = a <= 0 ? 1 - prog(T, z - 0.35, z) : Math.min(easeOut(prog(T, a, a + 0.45)), 1 - prog(T, z - 0.35, z));
  if (o <= 0) return null;
  const blur = a <= 0 ? 0 : (1 - easeOut(prog(T, a, a + 0.6))) * 8;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 872, textAlign: 'center', opacity: o, filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
      <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 50, letterSpacing: '0.14em', color: '#f7efe6', textShadow: '0 2px 18px rgba(0,0,0,0.95), 0 0 30px rgba(255,90,100,0.18)' }}>{s}</span>
    </div>
  );
};

/** a vertical column of classical text that bleeds in character by character, like ink */
const Column: React.FC<{ T: number; at: number; out: number; text: string; x: number; y: number; size?: number; red?: boolean }> = ({ T, at, out, text, x, y, size = 44, red }) => {
  const fade = 1 - prog(T, out - 0.6, out);
  if (T < at || fade <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, writingMode: 'vertical-rl', fontFamily: SERIF, fontWeight: 600, fontSize: size, letterSpacing: '0.32em', opacity: fade }}>
      {[...text].map((ch, i) => {
        const k = clamp((T - at - i * 0.16) / 0.7);
        return <span key={i} style={{ opacity: easeOut(k), filter: `blur(${(1 - k) * 10}px)`, color: red ? '#ff6b78' : '#efe3cf', textShadow: red ? '0 0 22px rgba(255,60,80,0.8), 0 0 4px rgba(0,0,0,0.8)' : '0 0 16px rgba(0,0,0,0.9)' }}>{ch}</span>;
      })}
    </div>
  );
};
const Seal: React.FC<{ T: number; at: number; out: number; x: number; y: number }> = ({ T, at, out, x, y }) => {
  const k = easeOut(prog(T, at, at + 0.35)), o = k * (1 - prog(T, out - 0.6, out));
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 76, height: 76, opacity: o, transform: `scale(${1.25 - 0.25 * k}) rotate(-4deg)`, background: '#b8202e', borderRadius: 8, boxShadow: '0 0 30px rgba(255,40,60,0.45)', display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center', padding: 6, fontFamily: SERIF, fontWeight: 900, fontSize: 26, color: '#fbe9df', lineHeight: 1 }}>
      {['老', '月', '人', '下'].map((c) => <span key={c}>{c}</span>)}
    </div>
  );
};
const Note: React.FC<{ T: number; at: number; out: number; text: string }> = ({ T, at, out, text }) => {
  const o = win(T, at, out, 0.6, 0.5);
  if (o <= 0) return null;
  return <div style={{ position: 'absolute', left: 60, bottom: 34, opacity: 0.6 * o, fontFamily: SERIF, fontSize: 18, letterSpacing: '0.12em', color: 'rgba(247,239,230,0.8)' }}>{text}</div>;
};
const Title: React.FC<{ T: number }> = ({ T }) => {
  const at = bt(33);
  const k = easeOut(prog(T, at, at + 1.6));
  const o = k * (1 - smooth(FILM_END10 - 1.6, FILM_END10, T));
  if (o <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: o }}>
      <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 20, letterSpacing: '1.1em', color: 'rgba(255,200,200,0.7)', marginBottom: 18 }}>THE RED THREAD</div>
      <div style={{ fontFamily: SERIF, fontWeight: 900, fontSize: 168, lineHeight: 1, letterSpacing: '0.5em', marginRight: '-0.5em', filter: `blur(${(1 - k) * 14}px)`, background: 'linear-gradient(180deg, #ffe7d6 0%, #ff8a8f 45%, #d92a3c 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: '0 0 60px rgba(255,60,80,0.35)' }}>红线</div>
      <div style={{ fontFamily: SERIF, fontSize: 17, letterSpacing: '0.2em', color: 'rgba(247,239,230,0.45)', marginTop: 300, opacity: easeOut(prog(T, bt(34), bt(34) + 1)) }}>典出 李复言《续玄怪录·定婚店》（唐）　词引 李之仪《卜算子·我住长江头》（宋）　音乐 原创</div>
    </div>
  );
};

export const LoveFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const T = frame / fps;
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('fonts10', { timeoutInMilliseconds: 60000 }));
  useEffect(() => {
    Promise.all(['400 40px "Noto Serif CJK SC"', '500 40px "Noto Serif CJK SC"', '600 40px "Noto Serif CJK SC"', '900 40px "Noto Serif CJK SC"']
      .map((f) => document.fonts.load(f, '红线你的脚踝上系着一根月老人')).map((p) => p.catch(() => null))).then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  if (!ready) return null;
  const colOut = bt(10) - 0.2;
  return (
    <AbsoluteFill style={{ backgroundColor: '#030205' }}>
      <OpenScene T={T} />
      <RiverScene T={T} />
      <CityScene T={T} />
      <KnotScene T={T} />
      <Column T={T} at={16.8} out={colOut} text="赤绳子耳" x={1790} y={120} />
      <Column T={T} at={20.1} out={colOut} text="以系夫妇之足" x={1712} y={120} />
      <Column T={T} at={23.4} out={colOut} text="天涯从宦" x={1634} y={120} />
      <Column T={T} at={24.7} out={colOut} text="吴楚异乡" x={1556} y={120} />
      <Column T={T} at={26.8} out={colOut} text="此绳一系" x={1470} y={120} red />
      <Column T={T} at={28.0} out={colOut} text="终不可逭" x={1392} y={120} red />
      <Seal T={T} at={29.0} out={colOut} x={1300} y={560} />
      <Column T={T} at={bt(28, 1)} out={RISE0 + 1} text="此绳一系" x={520} y={170} size={72} red />
      <Column T={T} at={bt(28, 2.5)} out={RISE0 + 1} text="终不可逭" x={1310} y={170} size={72} red />
      <Note T={T} at={S1_IN + 0.5} out={S1_OUT - 0.6} text="李复言《续玄怪录·定婚店》（唐）" />
      <Note T={T} at={S1_OUT - 0.2} out={bt(16)} text="李之仪《卜算子·我住长江头》（宋）　江流与城市灯光为示意" />
      <Title T={T} />
      {LINES.map((l, i) => <Sub key={i} T={T} l={l} />)}
      <Vignette strength={0.55} />
      <Grain />
    </AbsoluteFill>
  );
};
