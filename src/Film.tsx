/* 《谁打来的？》 · 电话恐惧. The cold open (Ring2: freeze, the owner's WeChat ringtone, the slam) and then the story,
   in the same language. Every shot change is a short dissolve with a gentle push (from games26). */
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { FontFaces, FONT_LOADS, Grade, Grain, Bars, Subs, F, hit, pr, eo } from './kit';
import { CUT, LINES, FILM_FRAMES, SLAM, P0 } from './time';
import { Ring2 } from './Ring2';
import { S1, Title, S2, S2c, S3a, S3b, S3c, S4a, S4b, S4c, S5c, S5e, S6a, S6c, S6d, S6e, SEnd } from './Scenes';
export { FILM_FRAMES };

type Shot = { a: number; z: number; el: (T: number, f: number) => React.ReactNode };
const SHOTS: Shot[] = [
  { a: 0, z: CUT.p23, el: () => <Ring2 bare /> },
  { a: CUT.p23, z: CUT.why, el: (T, f) => <S1 T={T} f={f} /> },
  { a: CUT.why, z: CUT.tOut, el: (T, f) => <Title T={T} f={f} /> },
  { a: CUT.tOut, z: CUT.sixty, el: (T, f) => <S2 T={T} f={f} /> },
  { a: CUT.sixty, z: CUT.breakA, el: (T, f) => <S2c T={T} f={f} /> },
  { a: CUT.breakA, z: CUT.reasons, el: (T, f) => <S3a T={T} f={f} /> },
  { a: CUT.reasons, z: CUT.notOver, el: (T, f) => <S3b T={T} f={f} /> },
  { a: CUT.notOver, z: CUT.build, el: (T, f) => <S3c T={T} f={f} /> },
  { a: CUT.build, z: CUT.friend, el: (T, f) => <S4a T={T} f={f} /> },
  { a: CUT.friend, z: CUT.split, el: (T, f) => <S4b T={T} f={f} /> },
  { a: CUT.split, z: CUT.exp2, el: (T, f) => <S4c T={T} f={f} /> },
  { a: CUT.exp2, z: CUT.timeSame, el: (T, f) => <S5c T={T} f={f} /> },
  { a: CUT.timeSame, z: CUT.coda, el: (T, f) => <S5e T={T} f={f} /> },
  { a: CUT.coda, z: CUT.booked, el: (T, f) => <S6a T={T} f={f} /> },
  { a: CUT.booked, z: CUT.ask, el: (T, f) => <S6c T={T} f={f} /> },
  { a: CUT.ask, z: CUT.call, el: (T, f) => <S6d T={T} f={f} /> },
  { a: CUT.call, z: CUT.end, el: (T, f) => <S6e T={T} f={f} /> },
  { a: CUT.end, z: CUT.fin + 1, el: (T, f) => <SEnd T={T} f={f} /> },
];
const PRE = 0.32, POST = 0.18;
const smooth = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };
const Layer: React.FC<{ id: string; o?: number; s?: number; blur?: number; text?: number; children: React.ReactNode }> = ({ id, o = 1, s = 1, blur = 0, text = 1, children }) => (
  <div className={id} style={{ position: 'absolute', inset: 0, opacity: o, transform: s !== 1 ? `scale(${s})` : undefined }}>
    <style>{`.${id} > div > canvas { filter: ${blur > 0.05 ? `blur(${blur}px)` : 'none'}; } .${id} > div > :not(canvas) { filter: opacity(${text.toFixed(3)}); }`}</style>
    {children}
  </div>
);
const picture = (T: number, f: number) => {
  const i = Math.max(0, SHOTS.findIndex((s) => T >= s.a && T < s.z));
  let p = -1, q = -1, b = 0;
  if (i > 0 && T < SHOTS[i].a + POST) { p = i - 1; q = i; b = SHOTS[i].a; }
  else if (i < SHOTS.length - 1 && T >= SHOTS[i].z - PRE) { p = i; q = i + 1; b = SHOTS[i].z; }
  if (p < 0) return SHOTS[i].el(T, f);
  const k = smooth((T - (b - PRE)) / (PRE + POST));
  return (
    <>
      <Layer id="xf-out" s={1 + 0.035 * k} blur={3 * k} text={1 - smooth(k * 1.5)}>{SHOTS[p].el(T, f)}</Layer>
      <Layer id="xf-in" o={k} s={1.03 - 0.03 * k} text={smooth(k * 2 - 1)}>{SHOTS[q].el(T, f)}</Layer>
    </>
  );
};
const SLAMS = [CUT.title, CUT.build, CUT.drop, CUT.coda, CUT.end];
const LOADS = [...FONT_LOADS, '900 40px "Noto Serif CJK SC"'];
const GLYPHS = '推销诈骗出事了亲友突然来电成两组收到消息费时格约好时间再看完这条最想给新闻发布会只表示显著高于非比例必见脸谁打来的？《》铃声一响你是开心还是心里一紧发消息打电话说错了撤不回冷场比起通话更想不接理由都怕这个年被拦下的诈骗全年天平均每通德州大学奥斯汀分校芝加哥老朋友很久没聊随机分配写邮件事前预测实际尴尬度连接感示意研究报告为显著差异未给统一刻度实验二陌生人两两聊天方式打字视频语音看不见脸也一样用时差不多同一份调查岁有好消息希望来约好呼叫中关注一起懂世界评论区资料英国名成年人公安部通报数据柱状图同事学外婆室友妈老板快递前任客服班主任房东外卖领导号码每个从0123456789%≈亿万';

export const Film: React.FC = () => {
  const f = useCurrentFrame(), T = f / 30;
  const [h] = useState(() => delayRender('film-fonts', { timeoutInMilliseconds: 60000 }));
  const [ok, setOk] = useState(false);
  useEffect(() => { Promise.all(LOADS.map((x) => document.fonts.load(x, GLYPHS).catch(() => null))).then(() => { setOk(true); continueRender(h); }); }, [h]);
  // the corner mark: on from the start, hidden while the title card is up, back after it, gone under the end card
  const markO = T < CUT.tOut ? 1 - pr(T, CUT.title - 0.3, 0.3) : T < CUT.end ? eo(T, CUT.tOut, 0.4) * (1 - pr(T, CUT.end - 0.3, 0.3)) : 0;
  const flash = SLAMS.reduce((m, s) => m + 0.1 * hit(T, s, 0.09), 0);
  // during the cold open's pause the picture (and its grain, and the subtitle) stand still
  const frozen = T >= P0 && T < SLAM;
  const subT = frozen ? P0 : T;
  const lines = LINES.filter(([a]) => !(a < P0 && T >= SLAM));
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <FontFaces />
      {ok && (
        <>
          {picture(T, f)}
          {T < CUT.end && <Grade warm={0.03} />}
          <Grain T={frozen ? P0 : T} />
          {T > CUT.p23 - 0.4 && <div style={{ position: 'absolute', inset: 0, background: '#fff1d6', opacity: flash, mixBlendMode: 'screen' }} />}
          <Bars />
          <div style={{ position: 'absolute', right: 56, top: 36, opacity: 0.9 * markO, fontFamily: F.sans, fontWeight: 500, fontSize: 20, letterSpacing: '0.3em', color: 'rgba(243,237,226,.6)' }}>
            <span style={{ color: '#e3b765' }}>◆ </span>Juno · VIBE知识大赏
          </div>
          <Subs T={subT} lines={lines} />
        </>
      )}
    </AbsoluteFill>
  );
};
