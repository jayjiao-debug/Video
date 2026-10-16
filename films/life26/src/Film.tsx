/* 《生命平等吗？》 demo · look D 纸板手偶. Cardboard stick puppets (pre-rendered PNGs, public/cut) over soft-focus
   backgrounds (public/bg), on Cry For Me (feat. 愛海). Foreigners speak their own language in cardboard bubbles; the
   Chinese subtitles carry the meaning. Timing = timeline_v7.py (lines_v7.json). Kept deliberately simple. */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from 'remotion';
import '@fontsource/ma-shan-zheng';
import CUT from './cut.json';
import RAW from '../lines_v7.json';
import { JUNO } from './brand/identity';
import { BAR, FontFaces, Subs, clamp, eo, lerp, pr } from './kit';

export const FIN = 188.8;
export const FILM_FRAMES = Math.round(FIN * 30);
const TITLE = 42.27, TITLE_END = 47.0, END = 182.6;
const ZH = '"Ma Shan Zheng", serif', LAT = '"PatrickHand", "Ma Shan Zheng", sans-serif';
const INK = '#1d1915';

/* subtitles: each line holds to the next one (at most 0.6 s past its reading time) */
const LINES = (RAW as [number, number, string][]).map(([a, z, s], i, arr) => {
  const nxt = i + 1 < arr.length ? arr[i + 1][0] : END;
  return [a, Math.min(nxt - 0.12, z + 0.6), s] as [number, number, string];
});

/* ------------------------------------------------------------ backgrounds */
const BGS: [string, number][] = [['night', 0], ['savanna', 5.45], ['room', 16.75], ['studio', 22.45], ['pond', 62.95], ['dusk', 71.15], ['studio', 83.75], ['river', 122.6], ['studio', 146.15], ['dusk', 167.0]];

/* ------------------------------------------------------------ cast: [id, x, y (feet), scale, in, out, opts] */
type Opt = { from?: 'below' | 'top' | 'left' | 'right'; name?: string; talk?: number[]; drift?: number; flip?: boolean; bob?: number; z?: number };
type Cast = [string, number, number, number, number, number, Opt?];
const CAST: Cast[] = [
  // 1 the cat under the lamp
  ['lamp', 800, 1010, 0.95, 0.0, 5.45], ['cat', 1060, 1000, 0.95, 0.2, 5.45],
  // 2 Sudan
  ['rhino', 980, 1000, 1.05, 5.6, 16.7, { drift: -40 }],
  // 3 the fly on the window sill; the swatter comes down at 20.0
  ['window', 960, 930, 0.9, 16.8, 22.4, { bob: 0.3 }], ['fly', 1080, 880, 0.75, 17.1, 20.12],
  ['swatter', 1080, 1060, 0.95, 19.75, 21.0, { from: 'top' }],
  // 4 fly, cat, rhino; hearts of different sizes
  ['fly', 470, 930, 0.9, 22.6, 39.4], ['cat', 900, 960, 0.8, 23.0, 39.4], ['rhino', 1440, 960, 0.72, 23.4, 39.4],
  ['heart', 470, 600, 0.16, 27.7, 39.4, { from: 'below' }], ['heart', 900, 560, 0.55, 28.0, 39.4], ['heart', 1440, 570, 0.95, 28.3, 39.4],
  // 5 the survey, the line
  ['researcher', 470, 1000, 1.0, 47.2, 53.0, { name: '研究者 · 法国', talk: [47.5] }], ['clipboard', 820, 1000, 0.75, 47.8, 53.0],
  ['ruler', 1000, 800, 1.0, 53.0, 62.9, { from: 'left' }],
  ['we', 330, 700, 0.42, 53.3, 62.9], ['dog', 560, 700, 0.5, 53.6, 62.9], ['bird', 840, 700, 0.55, 53.9, 62.9], ['frog', 1100, 700, 0.55, 54.2, 62.9], ['fish', 1360, 700, 0.55, 54.5, 62.9], ['fly', 1630, 700, 0.6, 54.8, 62.9],
  // 6 庄子 and 惠子 on the bridge
  ['bridge', 960, 1010, 1.0, 63.0, 71.1, { bob: 0.2 }],
  ['zhuang', 470, 990, 1.0, 63.15, 71.1, { name: '庄子', talk: [65.85] }], ['hui', 1450, 990, 1.0, 63.3, 71.1, { name: '惠子', talk: [68.07], flip: true }],
  // 7 Nagel and the bat
  ['nagel', 520, 1000, 1.0, 71.2, 82.7, { name: '内格尔 · Thomas Nagel', talk: [71.4] }], ['bat', 1380, 720, 0.95, 72.2, 82.7, { bob: 2.2, drift: 60 }],
  // 8 Kant
  ['kant', 500, 1000, 1.0, 83.9, 97.0, { name: '康德 · Kant', talk: [84.1, 91.2] }], ['dog', 1480, 1000, 0.75, 88.0, 97.0],
  // 9 Bentham
  ['bentham', 500, 1000, 1.0, 97.1, 105.3, { name: '边沁 · Bentham', talk: [99.4] }], ['chicken', 1500, 1000, 0.75, 99.6, 105.3],
  // 10 Singer
  ['singer', 470, 1000, 1.0, 105.4, 122.5, { name: '辛格 · Peter Singer', talk: [105.6, 117.6] }],
  ['chicken', 1180, 1000, 0.72, 111.7, 122.5], ['dog', 1600, 1000, 0.7, 111.9, 122.5],
  ['heart', 1180, 660, 0.42, 112.3, 122.5], ['heart', 1580, 660, 0.42, 112.3, 122.5],
  // 11 Schweitzer on the river
  ['boat', 980, 1010, 0.95, 122.7, 146.0, { drift: 160, bob: 0.6 }], ['schweitzer', 940, 905, 0.82, 122.9, 146.0, { name: '史怀哲 · Schweitzer', talk: [129.2, 131.9], drift: 160 }],
  ['hippo', 330, 975, 0.75, 125.8, 146.0, { bob: 0.4 }], ['hippo', 1650, 985, 0.6, 126.3, 146.0, { bob: 0.4 }],
  // 12 Lecky and the circle
  ['lecky', 420, 1000, 1.0, 146.3, 157.4, { name: '莱基 · Lecky', talk: [146.6] }],
  ['we', 1180, 820, 0.62, 148.9, 167.0], ['researcher', 980, 840, 0.48, 151.6, 167.0], ['singer', 1380, 840, 0.48, 151.8, 167.0],
  ['dog', 820, 900, 0.5, 154.3, 167.0], ['cat', 1560, 900, 0.5, 154.5, 167.0],
  // 13 the circle grows: everyone inside
  ['we', 960, 860, 0.62, 167.1, END], ['cat', 640, 900, 0.55, 167.4, END], ['dog', 1290, 900, 0.5, 167.6, END], ['rhino', 1600, 960, 0.5, 167.9, END], ['chicken', 330, 940, 0.5, 168.1, END],
  ['fly', 470, 640, 0.55, 168.4, END], ['bird', 1470, 600, 0.55, 168.6, END], ['frog', 790, 640, 0.5, 168.8, END], ['fish', 1150, 600, 0.5, 169.0, END],
  ['zhuang', 1760, 1040, 0.62, 177.3, END, { name: '庄子' }],
];

/* bubbles: [asset, x, y (bottom-centre of the bubble), in, out, text, latin?, size] */
type Bub = [string, number, number, number, number, string, boolean, number];
const BUBS: Bub[] = [
  ['b_l_l', 1060, 400, 47.5, 52.9, "Si vous ne pouviez en\nsauver qu'un, lequel ?", true, 54],
  ['b_l_l', 860, 360, 65.85, 70.9, '儵鱼出游从容，\n是鱼之乐也。', false, 58],
  ['b_l_r', 1060, 600, 68.07, 70.9, '子非鱼，\n安知鱼之乐？', false, 62],
  ['b_l_l', 1000, 330, 71.4, 82.5, 'What is it like\nto be a bat?', true, 64],
  ['b_xl_l', 1020, 360, 84.1, 90.9, 'Der Mensch existiert als\nZweck an sich selbst.', true, 58],
  ['b_xl_l', 1020, 360, 91.2, 96.8, 'Wer gegen Tiere grausam ist,\nwird auch hart gegen Menschen.', true, 52],
  ['b_xl_l', 1010, 380, 99.4, 105.1, 'The question is not, Can they reason?\nnor, Can they talk? but, Can they suffer?', true, 44],
  ['b_m_l', 900, 380, 105.6, 111.4, 'All animals are equal.', true, 60],
  ['b_m_l', 880, 380, 117.6, 122.3, 'Speciesism.', true, 66],
  ['b_m_r', 600, 420, 129.2, 131.7, 'Ehrfurcht vor dem Leben.', true, 52],
  ['b_xl_r', 760, 420, 131.9, 137.4, 'Ich bin Leben, das leben will,\ninmitten von Leben, das leben will.', true, 50],
  ['b_xl_l', 1040, 360, 146.6, 152.9, '…soon the circle expanding…\nand finally, the animal world.', true, 52],
];

/* the circle of light (Lecky → the end): [time, radius] keys */
const RING: [number, number][] = [[148.6, 0], [149.4, 170], [151.5, 170], [152.4, 330], [154.0, 330], [154.9, 520], [160.0, 520], [163.2, 520], [165.0, 260], [167.1, 260], [169.5, 1300], [END + 4, 1400]];
const ringAt = (T: number) => {
  if (T < RING[0][0] || T > END + 0.5) return 0;
  for (let i = 1; i < RING.length; i++) if (T <= RING[i][0]) { const [a, ra] = RING[i - 1], [b, rb] = RING[i]; const k = clamp((T - a) / (b - a)); const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; return lerp(ra, rb, e); }
  return RING[RING.length - 1][1];
};

/* ------------------------------------------------------------ pieces */
const backOut = (x: number) => { x = clamp(x); const c = 1.4; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const Pup: React.FC<{ c: Cast; T: number; i: number }> = ({ c, T, i }) => {
  const [id, x0, y, s, t0, t1, o = {}] = c;
  if (T < t0 - 0.01 || T > t1 + 0.5) return null;
  const a = (CUT as any)[id]; if (!a) return null;
  const kin = backOut(pr(T, t0, 0.5)), kout = eo(T, t1, 0.4);
  const from = o.from ?? 'below';
  let dx = 0, dy = 0;
  if (from === 'below') dy = (1 - kin) * 700 + kout * 800;
  if (from === 'top') dy = -(1 - kin) * 900 - kout * 900;
  if (from === 'left') dx = -(1 - kin) * 1400 - kout * 1400;
  if (from === 'right') dx = (1 - kin) * 1400 + kout * 1400;
  const ph = i * 1.7, b = o.bob ?? 1;
  const rot = b * 1.4 * Math.sin(T * 2.1 + ph) + b * 0.6 * Math.sin(T * 3.7 + ph * 2);
  dy += b * 5 * Math.sin(T * 2.6 + ph);
  const talk = (o.talk ?? []).reduce((m, t) => m + (T >= t ? Math.exp(-(T - t) / 0.12) * Math.sin((T - t) * 30) : 0), 0);
  const x = x0 + (o.drift ?? 0) * pr(T, t0, t1 - t0);
  // the swatter slams at 20.0
  if (id === 'swatter') { const k = eo(T, 19.75, 0.25); dy = lerp(-900, 0, k) + eo(T, 20.55, 0.5) * -1000; }
  const sc = s * (1 + 0.03 * talk);
  return (
    <div style={{ position: 'absolute', left: x - a.ax * sc + dx, top: y - a.ay * sc + dy, width: a.w * sc, height: a.h * sc, transformOrigin: `${a.ax * sc}px ${a.ay * sc}px`, transform: `rotate(${rot + talk * 2}deg)${o.flip ? ' scaleX(-1)' : ''}`, zIndex: o.z ?? 1 }}>
      <Img src={staticFile(`cut/${id}.png`)} style={{ width: '100%', height: '100%' }} />
      {o.name && (
        <div style={{ position: 'absolute', left: a.ax * sc - 170, top: (a.ay - 150) * sc, width: 340, textAlign: 'center', transform: o.flip ? 'scaleX(-1)' : undefined }}>
          <span style={{ display: 'inline-block', padding: '4px 18px', background: '#ecd6ad', border: `3px solid ${INK}`, borderRadius: 6, fontFamily: o.name.match(/[A-Za-z]/) ? ZH : ZH, fontSize: 40, color: INK, boxShadow: '3px 4px 0 #7d5d3a', transform: 'rotate(-2deg)', whiteSpace: 'nowrap' }}>{o.name}</span>
        </div>
      )}
    </div>
  );
};
const Bubble: React.FC<{ b: Bub; T: number }> = ({ b, T }) => {
  const [id, x, y, t0, t1, text, lat, size] = b;
  if (T < t0 || T > t1 + 0.3) return null;
  const a = (CUT as any)[id];
  const k = backOut(pr(T, t0, 0.3)) * (1 - eo(T, t1, 0.25));
  const tail = id.endsWith('_l') ? -1 : 1;
  const hh = id.startsWith('b_xl') ? 300 : id.startsWith('b_l') ? 250 : id.startsWith('b_m') ? 210 : 170;
  const ww = id.startsWith('b_xl') ? 1060 : id.startsWith('b_l') ? 860 : id.startsWith('b_m') ? 680 : 520;
  return (
    <div style={{ position: 'absolute', left: x - a.ax, top: y - a.ay, width: a.w, height: a.h, transformOrigin: `${a.ax + tail * 120}px ${a.ay + 70}px`, transform: `scale(${k}) rotate(${tail * -1.5 + Math.sin(T * 1.9) * 0.6}deg)`, opacity: clamp(k * 2), zIndex: 5 }}>
      <Img src={staticFile(`cut/${id}.png`)} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', left: a.ax - ww / 2 + 30, top: a.ay - hh + 10, width: ww - 60, height: hh - 20, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', whiteSpace: 'pre', fontFamily: lat ? LAT : ZH, fontSize: size, lineHeight: 1.15, color: INK }}>{text}</div>
    </div>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const zh = Array.from(new Set([...LINES.map((l) => l[2]).join(''), ...BUBS.map((b) => b[5]).join(''), ...CAST.map((c) => c[6]?.name ?? '').join(''), '生命平等吗？《》你的圈，画到了哪里评论区说说'])).join('');
    Promise.all(['40px "Ma Shan Zheng"', '40px "PatrickHand"', '700 40px "Noto Sans CJK SC"', '900 40px "Noto Serif CJK SC"', '700 40px "Noto Serif CJK SC"', '500 40px "Noto Sans CJK SC"'].map((x) => document.fonts.load(x, zh + 'ABCabc').catch(() => null)))
      .then(() => { setOk(true); continueRender(h); });
  }, [h]);
  // background crossfades (0.5 s)
  let bi = 0; for (let i = 0; i < BGS.length; i++) if (T >= BGS[i][1]) bi = i;
  const bgFade = bi > 0 ? eo(T, BGS[bi][1], 0.5) : 1;
  // the swat: a short shake
  const shake = T >= 20.0 ? Math.exp(-(T - 20.0) / 0.08) : 0;
  const titleO = T < TITLE ? 0 : 1 - pr(T, TITLE_END - 0.5, 0.5);
  const endO = eo(T, END, 0.6);
  const ring = ringAt(T);
  const push = 1 + 0.03 * ((T - BGS[bi][1]) / 20);
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <FontFaces />
      <style>{`@font-face { font-family: "PatrickHand"; src: url(${staticFile('fonts/patrick-hand-latin-400-normal.woff2')}) format("woff2"); }
        @font-face { font-family: "PatrickHand"; src: url(${staticFile('fonts/patrick-hand-latin-ext-400-normal.woff2')}) format("woff2"); unicode-range: U+0100-024F, U+1E00-1EFF; }`}</style>
      {ok && <>
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${14 * shake * Math.sin(T * 90)}px, ${10 * shake * Math.cos(T * 77)}px) scale(${push})`, transformOrigin: '960px 560px' }}>
          {bi > 0 && <Img src={staticFile(`bg/${BGS[bi - 1][0]}.jpg`)} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }} />}
          <Img src={staticFile(`bg/${BGS[bi][0]}.jpg`)} style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, opacity: bgFade }} />
          {ring > 0 && <div style={{ position: 'absolute', left: 1000 - ring, top: 760 - ring * 0.62, width: ring * 2, height: ring * 1.24, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,214,150,.42), rgba(255,214,150,.22) 70%, rgba(255,214,150,0))', mixBlendMode: 'screen' }} />}
          {/* the survey line: warm near us, cold far away */}
          {T > 53 && T < 63.4 && <div style={{ position: 'absolute', left: 200, top: 360, width: 1600, height: 480, opacity: eo(T, 54.6, 1.2) * (1 - pr(T, 62.6, 0.6)), background: 'linear-gradient(90deg, rgba(255,214,150,.38), rgba(255,214,150,.12) 55%, rgba(120,150,190,.18))', borderRadius: 40, filter: 'none', mixBlendMode: 'screen' }} />}
          {CAST.map((c, i) => <Pup key={i} c={c} T={T} i={i} />)}
          {BUBS.map((b, i) => <Bubble key={i} b={b} T={T} />)}
        </div>
        {/* title card */}
        {titleO > 0 && <>
          <div style={{ position: 'absolute', inset: 0, background: `rgba(6,5,4,${0.55 * titleO})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: titleO, fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 900, fontSize: 150, whiteSpace: 'nowrap' }}>
            {Array.from('《生命平等吗？》').map((ch, i) => { const t0 = TITLE + Math.max(0, i - 1) * 0.12, k = eo(T, t0, 0.25); return <span key={i} style={{ display: 'inline-block', opacity: k, transform: `scale(${lerp(1.35, 1, k)})`, background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 30px rgba(0,0,0,.9))' }}>{ch}</span>; })}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center', opacity: titleO * eo(T, TITLE + 1.2, 0.4), fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: JUNO.colors.gold }}>— {JUNO.series} —</div>
        </>}
        {/* end card */}
        {endO > 0 && <>
          <div style={{ position: 'absolute', inset: 0, background: `rgba(6,5,4,${0.72 * endO})` }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', opacity: endO * eo(T, END + 0.4, 0.4), fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 900, fontSize: 104, background: 'linear-gradient(180deg,#fff3cf 0%,#f0c873 52%,#b07c32 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>《生命平等吗？》</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: eo(T, END + 0.8, 0.4), fontFamily: '"Noto Serif CJK SC", serif', fontWeight: 700, fontSize: 52, color: '#efe8da' }}>你的圈，画到了哪里？评论区说说</div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', justifyContent: 'center', opacity: eo(T, END + 1.2, 0.4) }}>
            <div style={{ padding: '10px 36px', borderRadius: 40, border: `1.5px solid ${JUNO.colors.gold}`, fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 500, fontSize: 30, letterSpacing: '0.2em', color: JUNO.colors.gold }}>{JUNO.follow}</div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center', opacity: eo(T, END + 1.6, 0.4), fontFamily: '"Noto Sans CJK SC", sans-serif', fontSize: 23, color: 'rgba(239,232,218,.85)', lineHeight: '36px' }}>
            <div>资料：Miralles 等 2019 · 《庄子》秋水 / 齐物论 · Nagel 1974 · Kant · Bentham 1789 · Singer 1975</div>
            <div>Schweitzer · Lecky 1869 · CBC（苏丹，2018）　　音乐：Cry For Me (feat. 愛海) · MICHITA</div>
          </div>
        </>}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: BAR, background: '#000' }} />
        <div style={{ position: 'absolute', right: 56, top: 44, opacity: 0.9 * (1 - titleO) * (1 - endO), fontFamily: '"Noto Sans CJK SC", sans-serif', fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}><span style={{ color: '#e3b765' }}>◆ </span>{JUNO.mark}</div>
        <Subs T={T} lines={LINES as any} />
      </>}
    </AbsoluteFill>
  );
};
