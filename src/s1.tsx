import React from 'react';
import { AbsoluteFill } from 'remotion';
import { CUT, SANS, MONO, prog, easeOut, easeIn, easeInOut, lerp, rnd, pop, hit } from './lib';
import { stageStyle, keyCam } from './camera';
import { useLook, Look } from './look';
import { ChatWindow, Got, Sent, InputBox, DraftTag, Kicker } from './ui';

/* Stage 1 (0 → CUT.net): the unsent draft, the title, two kinds of regret, and the 1994 result.
   0–5.4   one chat window: TA's last message was years ago; in the input box a draft is typed, half deleted,
           retyped, never sent.
   5.5     the camera pulls back: hundreds of chat windows, each with its own unsent draft.
   8.1     title 《草稿箱》 on the first drop.
   10.2    two kinds: 做错了的事 (a sent bubble, blue) | 没去做的事 (a draft, amber).
   15.3    Gilovich & Medvec 1994: last week 53 | 47, a whole life 16 | 84; 30.6 the bars become two lines that cross. */

const BLACK: React.CSSProperties = { fontFamily: SANS, fontWeight: 900 };
export const DRAFTS = ['学吉他', '去看一次海', '跟爸妈说我爱你', '辞职试一次', '对不起', '我喜欢你', '去读研', '再去见他一面',
  '出国看看', '开一家小店', '重新开始画画', '谢谢你', '去学游泳', '把那本书写完', '跟老朋友和好', '搬去另一座城市', '去考那个证', '说出我的想法'];

const DRAFT = '其实，我一直想跟你说……';
const WX = 960 - 400, WY = 470 - 300, WW = 800, WH = 600;

/** the typed draft: type 0.3–2.4, delete back to "其实，" 3.3–4.0, retype 4.3–5.1 */
const typedChars = (T: number) => {
  const n = [...DRAFT].length;
  if (T < 3.3) return Math.floor(n * prog(T, 0.3, 2.4));
  if (T < 4.3) return Math.round(lerp(n, 3, prog(T, 3.3, 4.0)));
  return Math.round(lerp(3, n, prog(T, 4.3, 5.1)));
};

const Window: React.FC<{ L: Look; T: number; id: string; draft: string; chars?: number; name?: string; sub?: string; glow?: number; big?: boolean }> = ({ L, T, id, draft, chars, name = 'TA', sub = '上次聊天：3 年前', glow = 0, big }) => (
  <ChatWindow L={L} w={WW} h={WH} name={name} sub={sub} id={id}>
    <text x={WW / 2} y={140} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 20, fill: L.dim }}>2023年 6月 18日</text>
    <g transform="translate(40 170)"><Got L={L} text="毕业快乐！以后常联系呀" w={380} /></g>
    <g transform="translate(400 280)"><Sent L={L} text="一定！" w={360} /></g>
    {big && <text x={WW / 2} y={430} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 20, fill: L.dim }}>— 之后再没有新消息 —</text>}
    <g transform={`translate(30 ${WH - 104})`}><InputBox L={L} text={draft} chars={chars} T={T} w={WW - 210} size={30} glow={glow} /></g>
  </ChatWindow>
);

// the wall of other people's windows (grid around the centre one)
const WALL = (() => {
  const out: { c: number; r: number; d: string; delay: number }[] = [];
  let k = 0;
  for (let r = -3; r <= 3; r++) for (let c = -4; c <= 4; c++) {
    if (r === 0 && c === 0) continue;
    out.push({ c, r, d: DRAFTS[(k * 7 + 3) % DRAFTS.length], delay: rnd(k, 3) * 0.8 }); k++;
  }
  return out;
})();

// the 1994 numbers (Gilovich & Medvec 1994, Study 5)
const WEEK = { did: 53, not: 47 }, LIFE = { did: 16, not: 84 };
const BX = 440, BW = 1060, BH = 104;

export const Stage1: React.FC<{ T: number }> = ({ T }) => {
  const L = useLook();
  const st = stageStyle(T, 0, CUT.net, [0, 0]);
  if (!st) return null;
  const cam = keyCam(T, [[0, 1.38, 960, 480, 960, 470], [5.5, 1.44, 960, 480, 960, 470], [7.6, 0.5, 960, 470, 960, 480], [10.4, 0.46, 960, 470, 960, 480]]);
  const wallK = easeOut(prog(T, 5.6, 6.6)) * (1 - easeIn(prog(T, 10.1, 10.6)));
  const centreK = 1 - easeIn(prog(T, 10.1, 10.5));
  const titleDim = 1 - 0.85 * easeInOut(prog(T, CUT.title - 0.2, CUT.title + 0.15)) * (1 - easeInOut(prog(T, CUT.intro - 0.25, CUT.intro + 0.2)));

  // intro (10.2 → 15.3) → legend
  const intro = easeOut(prog(T, 10.3, 10.8));
  const toLegend = easeInOut(prog(T, 15.0, 15.8));
  const split2 = easeOut(prog(T, 12.4, 12.9));
  // chart
  const chart = easeOut(prog(T, 15.4, 15.9));
  const weekBar = easeOut(prog(T, 19.2, 20.2));
  const lifeBar = easeOut(prog(T, 24.6, 25.4));
  const lifeNot = easeOut(prog(T, 27.0, 27.9));
  const toLines = easeInOut(prog(T, 30.6, 31.3));
  const draw = easeOut(prog(T, 30.9, 32.2));
  const cross = pop(T, 31.2, 0.3);

  const legendA = { x: lerp(560 + 200 * (1 - split2), 1180, toLegend), y: lerp(500, 200, toLegend), s: lerp(1.1, 0.5, toLegend) };
  const legendB = { x: lerp(1380, 1480, toLegend), y: lerp(500, 200, toLegend), s: lerp(1.1, 0.5, toLegend) };

  const bar = (y: number, label: string, sub: string, did: number, not: number, kDid: number, kNot: number, hl: boolean) => (
    <g>
      <text x={BX - 30} y={y + 50} textAnchor="end" style={{ ...BLACK, fontSize: 38, fill: L.ink }}>{label}</text>
      <text x={BX - 30} y={y + 86} textAnchor="end" style={{ fontFamily: SANS, fontSize: 22, fill: L.dim }}>{sub}</text>
      <rect x={BX} y={y} width={BW} height={BH} rx={18} fill="rgba(255,255,255,0.05)" />
      <rect x={BX} y={y} width={BW * did / 100 * kDid} height={BH} rx={18} fill={L.second} style={{ filter: `drop-shadow(0 0 12px ${L.secondGlow})` }} />
      <rect x={BX + BW * (1 - not / 100 * kNot)} y={y} width={BW * not / 100 * kNot} height={BH} rx={18} fill={L.accent} style={{ filter: `drop-shadow(0 0 ${hl ? 22 : 12}px ${L.accentGlow})` }} />
      {kDid > 0.2 && <text x={BX + 24} y={y + 68} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 52, fill: '#0b1020' }}>{Math.round(did * kDid)}%</text>}
      {kNot > 0.2 && <text x={BX + BW - 24} y={y + 68} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: hl ? 64 : 52, fill: '#1a0d00' }}>{Math.round(not * kNot)}%</text>}
    </g>
  );
  // line chart geometry
  const LX0 = 520, LX1 = 1420, ly = (p: number) => 820 - p * 5.2;
  const bez = (t: number, a: number, b: number) => { const u = 1 - t; return [u*u*u*LX0 + 3*u*u*t*(LX0+360) + 3*u*t*t*(LX1-360) + t*t*t*LX1, u*u*u*ly(a) + 3*u*u*t*ly(a) + 3*u*t*t*ly(b) + t*t*t*ly(b)]; };
  const X = (() => { let best = 0, bd = 1e9; for (let i = 0; i <= 400; i++) { const t = i / 400; const d = Math.abs(bez(t, WEEK.did, LIFE.did)[1] - bez(t, WEEK.not, LIFE.not)[1]); if (d < bd) { bd = d; best = t; } } return bez(best, WEEK.did, LIFE.did); })();
  const curve = (a: number, b: number) => `M ${LX0} ${ly(a)} C ${LX0 + 360} ${ly(a)}, ${LX1 - 360} ${ly(b)}, ${LX1} ${ly(b)}`;

  return (
    <AbsoluteFill style={st}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <g opacity={titleDim}>
          {/* the windows */}
          <g transform={cam.t}>
            {wallK > 0 && WALL.map((w, k) => {
              const o = wallK * easeOut(prog(T, 5.7 + w.delay, 6.2 + w.delay));
              if (o <= 0) return null;
              return (
                <g key={k} transform={`translate(${WX + w.c * 860} ${WY + w.r * 660})`} opacity={o}>
                  <Window L={L} T={T + k * 0.37} id={`w${k}`} draft={w.d} name={['Ta', '妈', '老友', '自己', '他', '她'][k % 6]} sub={['5 年前', '1 年前', '8 年前', '2 年前'][k % 4]} />
                </g>
              );
            })}
            {centreK > 0 && <g transform={`translate(${WX} ${WY})`} opacity={centreK}><Window L={L} T={T} id="w0" draft={DRAFT} chars={typedChars(T)} glow={0.3 + 0.7 * hit(T, 5.1, 0.6)} big /></g>}
          </g>

          {/* intro: two kinds */}
          {intro > 0 && T < 33.8 && (
            <g opacity={intro}>
              <g transform={`translate(${legendA.x} ${legendA.y}) scale(${legendA.s})`}>
                <g transform="translate(-230 -150)"><Sent L={L} text="那句话，我说重了" w={460} size={32} /></g>
                <text x={0} y={60} textAnchor="middle" style={{ ...BLACK, fontSize: 64, fill: L.second }}>做了的事</text>
                <text x={0} y={110} textAnchor="middle" opacity={1 - toLegend} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: L.dim }}>说了、做了、发出去了</text>
              </g>
              <g transform={`translate(${legendB.x} ${legendB.y}) scale(${legendB.s})`} opacity={split2}>
                <g transform="translate(-300 -150)"><InputBox L={L} text="其实，我一直想跟你说……" T={T} w={480} size={30} glow={0.6} /></g>
                <g transform="translate(-300 -170)"><DraftTag L={L} /></g>
                <text x={0} y={60} textAnchor="middle" style={{ ...BLACK, fontSize: 64, fill: L.accent }}>没做的事</text>
                <text x={0} y={110} textAnchor="middle" opacity={1 - toLegend} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, fill: L.dim }}>想过、打好了字、没发</text>
              </g>
              {toLegend < 0.5 && <text x={970} y={530} textAnchor="middle" opacity={split2 * (1 - 2 * toLegend)} style={{ ...BLACK, fontSize: 60, fill: L.dim }}>vs</text>}
            </g>
          )}

          {/* 1994 */}
          {chart > 0 && (
            <g opacity={chart}>
              <Kicker L={L} x={160} y={150} text="1994 · GILOVICH & MEDVEC" />
              <text x={160} y={205} style={{ ...BLACK, fontSize: 40, fill: L.ink }}>你最后悔的，是哪一种？</text>
              <g opacity={1 - toLines}>
                {bar(330, '只看上一周', '最近 7 天', WEEK.did, WEEK.not, weekBar, weekBar, false)}
                {bar(560, '回看一辈子', '整个人生', LIFE.did, LIFE.not, lifeBar, lifeNot, true)}
              </g>
              {toLines > 0 && (
                <g opacity={toLines}>
                  <line x1={LX0} y1={ly(0)} x2={LX1} y2={ly(0)} stroke={L.dim} strokeWidth={2} />
                  <text x={LX0} y={ly(0) + 44} textAnchor="middle" style={{ ...BLACK, fontSize: 30, fill: L.ink }}>上一周</text>
                  <text x={LX1} y={ly(0) + 44} textAnchor="middle" style={{ ...BLACK, fontSize: 30, fill: L.ink }}>一辈子</text>
                  <text x={(LX0 + LX1) / 2} y={ly(0) + 44} textAnchor="middle" style={{ fontFamily: SANS, fontSize: 24, fill: L.dim }}>时间 →</text>
                  <path d={curve(WEEK.did, LIFE.did)} fill="none" stroke={L.second} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: `drop-shadow(0 0 10px ${L.secondGlow})` }} />
                  <path d={curve(WEEK.not, LIFE.not)} fill="none" stroke={L.accent} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} style={{ filter: `drop-shadow(0 0 14px ${L.accentGlow})` }} />
                  <text x={LX0 - 24} y={ly(WEEK.did) + 10} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, fill: L.second }}>53%</text>
                  <text x={LX0 - 24} y={ly(WEEK.not) + 40} textAnchor="end" style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, fill: L.accent }}>47%</text>
                  {draw > 0.95 && <>
                    <text x={LX1 + 24} y={ly(LIFE.did) + 12} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 44, fill: L.second }}>16%</text>
                    <text x={LX1 + 24} y={ly(LIFE.not) + 16} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 60, fill: L.accent }}>84%</text>
                  </>}
                  {cross > 0 && (
                    <g transform={`translate(${X[0]} ${X[1]})`}>
                      <circle r={30 + 50 * (1 - Math.min(1, cross))} fill="none" stroke={L.ink} strokeWidth={3} opacity={Math.max(0, 1 - Math.min(1, cross)) + 0.4} />
                      <circle r={10} fill={L.ink} />
                      <text x={0} y={-50} textAnchor="middle" style={{ ...BLACK, fontSize: 40, fill: L.ink }}>交叉</text>
                    </g>
                  )}
                </g>
              )}
              <text x={160} y={850} style={{ fontFamily: SANS, fontSize: 18, fill: L.dim }}>Gilovich & Medvec (1994), JPSP · 研究 5，32 名成年人</text>
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* title on the first drop: 《草稿箱》 over an input box with a blinking cursor */
export const TitleCard: React.FC<{ T: number; still?: boolean }> = ({ T, still }) => {
  const L = useLook();
  const a = CUT.title, z = CUT.intro;
  if (!still && (T < a - 0.05 || T > z + 0.35)) return null;
  const s = still ? 1 : pop(T, a, 0.22);
  const out = still ? 0 : easeInOut(prog(T, z - 0.1, z + 0.3));
  const k = (d: number, dur = 0.2) => (still ? 1 : easeOut(prog(T, a + d, a + d + dur)));
  const shake = still ? 0 : Math.sin(T * 90) * 6 * hit(T, a, 0.12);
  const blink = Math.floor(T * 2.2) % 2 === 0;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: `translate(${shake}px, 0) scale(${1 + 0.5 * out})`, transformOrigin: '960px 520px' }}>
      <svg width={1920} height={1080}>
        <text x={960} y={330} textAnchor="middle" opacity={k(0.25, 0.3)} style={{ fontFamily: MONO, fontSize: 30, letterSpacing: '0.6em', fill: L.dim }}>THE UNSENT</text>
        <g opacity={k(0.05, 0.2)}>
          <rect x={560} y={430} width={800} height={240} rx={120} fill="rgba(255,255,255,0.05)" stroke={L.accent} strokeWidth={4} style={{ filter: `drop-shadow(0 0 22px ${L.accentGlow})` }} />
        </g>
        <g transform={`translate(960 550) scale(${1.25 - 0.25 * Math.min(1, s)}) translate(-960 -550)`} opacity={Math.min(1, s * 3)}>
          <text x={940} y={630} textAnchor="middle" style={{ ...BLACK, fontSize: 200, fill: L.ink, letterSpacing: '0.06em' }}>草稿箱</text>
        </g>
        {blink && <rect x={1270} y={470} width={8} height={170} fill={L.accent} opacity={k(0.3, 0.1)} />}
        <text x={960} y={760} textAnchor="middle" opacity={k(0.5, 0.3)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: '0.5em', fill: L.dim }}>VIBE知识大赏</text>
      </svg>
    </AbsoluteFill>
  );
};
export { lerp };
