// hud/fx.tsx: THE 综艺 EFFECTS and THE SIDE BANNERS of the Su film (v3, Jay 2026-11-14: standard in every film). Pure
// functions of the STORY frame, all in the skin (hud/skin.ts: rice-cream panels on a warm ink line, lychee-red tags,
// ochre highlights, KUAILE words, XING names; everything plops in and jiggles, then shrinks away).
// The rules (bible 后期): each one is earned by something in the picture or the line, lands in the gap after a line
// (never on the punch line, never repeating the subtitle), one or two in a scene, never over a face, the subtitles or
// the REC display; none in the turn's weight (D after the order is read), the quiet scene (F) or the ending (G, I).
//   FX list (scene, family, when, why):
//   B  花字 label    「当事狗 很不高兴」 on the dog       after B09, the dog cutaway      his own letter: 众狗不悦矣
//   B  记者OS        「这是被贬，还是度假？」             after B11, into her B12        the day's contradiction
//   C  counter       「今日已吃 298 / 300 颗」            the tilt down to the shells     pays off his card's 今日目标
//   D  banner        差役 · 带来坏消息 ●●●●●              he reins in, before D27         he changes the story
//   E  checklist     海南待办 ① coffin ② grave ③ bowl ★   after E35 / E37 / E39           icons, not the words again
//   H  banner        苏过 · 小儿子 · 唯一跟来海南的家人    H opens on the two of them      E33 said 只带小儿子
//   H  truth-ish stamp 「绝密」                           after H53 (别让北方人知道)       his own letter: 慎勿说
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutCubic, lineId, seg } from "../story";
import { type Rect } from "./style";
import { KUAILE, XING } from "./fonts";
import { SK, plop, shrink, skinText } from "./skin";

const from = (id: string) => lineId(id).from;
const to = (id: string) => lineId(id).to;
type Span = [number, number];

/** when each one shows (story frames, inclusive) */
export const FX: Record<string, Span> = {
  dog: [to("B09") + 4, from("B10") - 6],
  os: [to("B11") + 2, to("B12") - 2],
  counter: [to("C20") + 30, from("C22") - 3],
  courier: [seg("D").from + 22, seg("D").from + 88],
  todo: [to("E35") + 2, from("E40") - 8],
  guo: [seg("H").from + 4, seg("H").from + 50],
  secret: [to("H53") + 3, to("H54") + 8],
};
/** the boxes they take while they show (a shot keeps faces out from under them) */
export const FX_RECT: Record<string, Rect> = {
  dog: { x0: 540, y0: 660, x1: 930, y1: 900 },
  os: { x0: 120, y0: 1060, x1: 700, y1: 1220 },
  counter: { x0: 120, y0: 330, x1: 600, y1: 470 },
  courier: { x0: 460, y0: 1030, x1: 910, y1: 1245 },
  todo: { x0: 110, y0: 330, x1: 470, y1: 760 },
  guo: { x0: 330, y0: 1060, x1: 900, y1: 1250 },
  secret: { x0: 650, y0: 860, x1: 930, y1: 1110 },
};
export const fxRectsAt = (f: number): { what: string; r: Rect }[] =>
  Object.entries(FX).filter(([, [a, b]]) => f >= a && f <= b).map(([k]) => ({ what: `fx ${k}`, r: FX_RECT[k] }));

// ---------------------------------------------------------------------------------------------------- shared bits
const ink = { paintOrder: "stroke fill" } as React.CSSProperties;
/** a box that plops in at its bottom centre and shrinks away at the end of its span */
const Plop: React.FC<{ f: number; span: Span; at?: number; x: number; y: number; rot?: number; h?: number; k?: number; children: React.ReactNode }> = ({ f, span, at = 0, x, y, rot = 0, h = 110, k = 1, children }) => {
  const p = plop(f - span[0] - at, 5, h), out = shrink(f, span[1] + 1, 5);
  if (p.o <= 0 || out.o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -100%) translateY(${p.y.toFixed(1)}px) scale(${(k * p.sx * out.s).toFixed(4)}, ${(k * p.sy * out.s).toFixed(4)}) rotate(${rot}deg)`, transformOrigin: "50% 100%", opacity: p.o * out.o }}>
      {children}
    </div>
  );
};
const Tag: React.FC<{ s: string; px?: number; bg?: string }> = ({ s, px = 34, bg = SK.lychee }) => (
  <span style={{ display: "inline-block", padding: `2px ${Math.round(px * 0.45)}px ${Math.round(px * 0.18)}px`, borderRadius: px * 0.45, background: bg, border: `5px solid ${SK.ink}`, fontFamily: KUAILE, fontSize: px, lineHeight: 1.15, color: SK.rice, whiteSpace: "nowrap" }}>{s}</span>
);
const Pips: React.FC<{ n: number; on: number; r?: number }> = ({ n, on, r = 14 }) => (
  <svg width={n * (2 * r + 10)} height={2 * r + 10} style={{ verticalAlign: "middle" }}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(${r + 5 + i * (2 * r + 10)},${r + 5})`}>
        <circle r={r} fill={i < on ? SK.lychee : "rgba(255,243,214,0.3)"} stroke={SK.ink} strokeWidth={4} />
        {i < on ? <circle cx={-r * 0.35} cy={-r * 0.4} r={r * 0.25} fill="#fff" opacity={0.55} /> : null}
      </g>
    ))}
  </svg>
);
const panel = (extra: React.CSSProperties = {}): React.CSSProperties => ({ background: SK.rice, border: `6px solid ${SK.ink}`, borderRadius: 22, boxShadow: `0 8px 0 ${SK.shadow}`, ...extra });

// ---------------------------------------------------------------------------------------------------- B: the dog
const DogLabel: React.FC<{ f: number }> = ({ f }) => {
  const s = FX.dog, t = f - s[0];
  const vein = t >= 6 ? Math.max(1, [1.6, 1.2, 0.9, 1.05][t - 6] ?? 1) : 0;
  return (
    <Plop f={f} span={s} x={760} y={880} rot={-4} k={1.25}>
      <div style={{ position: "relative", ...panel({ padding: "8px 22px 12px" }) }}>
        <div style={{ marginBottom: 2 }}><Tag s="当事狗" px={30} /></div>
        <div style={{ ...skinText(KUAILE, 56, SK.pork, 0), textShadow: "none" }}>很不高兴</div>
        {vein > 0 ? (
          <svg width={70} height={70} viewBox="-35 -35 70 70" style={{ position: "absolute", right: -30, top: -34, transform: `scale(${vein.toFixed(3)}) rotate(10deg)` }}>
            {[0, 90, 180, 270].map((a) => <path key={a} transform={`rotate(${a})`} d="M6,-6 Q16,-8 22,-20 M6,-6 Q8,-16 20,-22" stroke={SK.lychee} strokeWidth={9} strokeLinecap="round" fill="none" />)}
          </svg>
        ) : null}
        {/* the pointer to the dog's head, lower left */}
        <svg width={120} height={90} style={{ position: "absolute", left: -96, top: 58, overflow: "visible" }}>
          <path d="M110,10 Q50,20 14,70" stroke={SK.ink} strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d="M110,10 Q50,20 14,70" stroke={SK.robeLight} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d="M2,52 L14,74 L34,62" stroke={SK.ink} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    </Plop>
  );
};

// ---------------------------------------------------------------------------------------------------- B: her thought
const ReporterOS: React.FC<{ f: number }> = ({ f }) => (
  <Plop f={f} span={FX.os} x={400} y={1210} rot={-2}>
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 26, top: -30, zIndex: 2 }}><Tag s="记者OS" px={30} bg={SK.robeDeep} /></div>
      <div style={{ ...panel({ borderRadius: 60, padding: "18px 40px 18px" }), ...skinText(KUAILE, 52, SK.ink, 0), textShadow: "none" }}>
        这是被贬，<span style={{ color: SK.lychee }}>还是度假</span>？
      </div>
      {/* the thought dots, down toward her (the lens, lower left) */}
      <div style={{ position: "absolute", left: 40, bottom: -34, width: 26, height: 26, borderRadius: 13, ...panel({ boxShadow: "none", borderWidth: 5 }) }} />
      <div style={{ position: "absolute", left: 14, bottom: -58, width: 16, height: 16, borderRadius: 8, ...panel({ boxShadow: "none", borderWidth: 4 }) }} />
    </div>
  </Plop>
);

// ---------------------------------------------------------------------------------------------------- C: the counter
const LycheeCounter: React.FC<{ f: number }> = ({ f }) => {
  const s = FX.counter, t = f - s[0];
  const n = Math.round(298 * easeOutCubic(clamp01((t - 2) / 12)));
  const slamNum = t >= 14 ? Math.max(1, [1.35, 1.1, 0.96][t - 14] ?? 1) : 1;
  return (
    <Plop f={f} span={s} x={350} y={466} h={140}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, ...panel({ background: "rgba(43,22,12,0.9)", border: `6px solid ${SK.robe}`, padding: "6px 24px 10px" }) }}>
        <svg width={52} height={58} viewBox="-26 -30 52 58">
          <path d="M-2,-22 q4,-8 12,-8" stroke="#4d8a33" strokeWidth={5} strokeLinecap="round" fill="none" />
          <circle r={21} fill={SK.lychee} stroke={SK.ink} strokeWidth={4} />
          {[[-8, -6], [6, -9], [9, 5], [-5, 8], [0, 0]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={3} fill={SK.lycheeDeep} />)}
          <circle cx={-8} cy={-9} r={5} fill="#fff" opacity={0.5} />
        </svg>
        <span style={{ fontFamily: KUAILE, fontSize: 40, color: SK.rice, whiteSpace: "nowrap" }}>今日已吃</span>
        <span style={{ display: "inline-block", fontFamily: KUAILE, fontSize: 72, lineHeight: 1, color: SK.robeLight, minWidth: 116, textAlign: "right", transform: `scale(${slamNum.toFixed(3)})`, fontVariantNumeric: "tabular-nums" }}>{n}</span>
        <span style={{ fontFamily: KUAILE, fontSize: 44, color: SK.rice, whiteSpace: "nowrap" }}>/ 300 颗</span>
      </div>
    </Plop>
  );
};

// ---------------------------------------------------------------------------------------------------- the side banners
/** a side character's banner on the live shot (no freeze): 出场人物 tag, the name in running script, one line */
const Banner: React.FC<{ f: number; span: Span; x: number; y: number; name: string; children: React.ReactNode; rot?: number }> = ({ f, span, x, y, name, children, rot = -3 }) => (
  <Plop f={f} span={span} x={x} y={y} rot={rot} h={120}>
    <div style={{ position: "relative", ...panel({ background: `linear-gradient(${SK.porkTop}, ${SK.pork} 45%, ${SK.porkDeep})`, padding: "14px 30px 16px" }) }}>
      <div style={{ position: "absolute", left: 22, top: -30 }}><Tag s="出场人物" px={30} bg={SK.robeDeep} /></div>
      <div style={{ ...skinText(XING, 96, SK.rice, 16), marginTop: 6 }}>{name}</div>
      <div style={{ marginTop: 8, whiteSpace: "nowrap" }}>{children}</div>
    </div>
  </Plop>
);
const sub: React.CSSProperties = { fontFamily: KUAILE, fontSize: 38, color: SK.rice, verticalAlign: "middle" };
const CourierBanner: React.FC<{ f: number }> = ({ f }) => (
  <Banner f={f} span={FX.courier} x={680} y={1240} name="差役">
    <span style={sub}>带来：坏消息 </span><Pips n={5} on={5} r={13} />
  </Banner>
);
const GuoBanner: React.FC<{ f: number }> = ({ f }) => (
  <Banner f={f} span={FX.guo} x={610} y={1240} name="苏过" rot={3}>
    <span style={sub}>小儿子 · <span style={{ color: SK.robeLight }}>唯一跟来海南的家人</span></span>
  </Banner>
);

// ---------------------------------------------------------------------------------------------------- E: the to-do list
const Coffin: React.FC = () => (
  <svg width={70} height={46} viewBox="0 0 70 46"><path d="M4,14 L16,4 L62,4 L66,14 L62,42 L16,42 Z" fill="#8a5a2b" stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" /><path d="M16,4 L16,42" stroke={SK.ink} strokeWidth={3} /></svg>
);
const Mound: React.FC = () => (
  <svg width={70} height={46} viewBox="0 0 70 46"><path d="M4,42 Q35,0 66,42 Z" fill="#9b7a4a" stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" /><rect x={29} y={10} width={12} height={22} rx={3} fill="#c9c2b0" stroke={SK.ink} strokeWidth={3} /></svg>
);
const Bowl: React.FC = () => (
  <svg width={70} height={46} viewBox="0 0 70 46"><path d="M12,22 Q35,0 58,22 Z" fill="#fff" stroke={SK.ink} strokeWidth={3.5} /><path d="M6,22 L64,22 Q60,44 35,44 Q10,44 6,22 Z" fill={SK.lychee} stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" /><path d="M44,2 L62,26 M52,0 L66,22" stroke={SK.ink} strokeWidth={4} strokeLinecap="round" /></svg>
);
const TodoList: React.FC<{ f: number }> = ({ f }) => {
  const s = FX.todo;
  const rows: [number, React.ReactNode][] = [[s[0], <Coffin key="c" />], [to("E37") + 2, <Mound key="m" />], [to("E39") + 2, <Bowl key="b" />]];
  const star = to("E39") + 8, st = f - star, starS = st >= 0 ? Math.max(1, [1.8, 1.25, 0.92, 1.05][st] ?? 1) : 0;
  const out = shrink(f, s[1] + 1, 5), p0 = plop(f - s[0], 5, 100);
  if (p0.o <= 0 || out.o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 120, top: 340, opacity: p0.o * out.o, transform: `translateY(${p0.y.toFixed(1)}px) scale(${(1.3 * p0.sx * out.s).toFixed(4)}, ${(1.3 * p0.sy * out.s).toFixed(4)}) rotate(-3deg)`, transformOrigin: "0% 0%", width: 250, ...panel({ padding: "12px 20px 16px" }) }}>
      <div style={{ ...skinText(KUAILE, 44, SK.pork, 0), textShadow: "none", marginBottom: 6 }}>海南待办</div>
      {rows.map(([at, icon], i) => {
        const p = plop(f - at, 4, 50);
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, height: 70, opacity: p.o, transform: `translateY(${p.y.toFixed(1)}px)` }}>
            <span style={{ fontFamily: KUAILE, fontSize: 40, color: SK.ink, width: 40 }}>{["①", "②", "③"][i]}</span>
            {icon}
            {i === 2 && starS > 0 ? (
              <svg width={64} height={64} viewBox="-32 -32 64 64" style={{ transform: `scale(${starS.toFixed(3)}) rotate(-8deg)` }}>
                <path d="M0,-28 L8,-9 L28,-8 L12,5 L18,26 L0,14 L-18,26 L-12,5 L-28,-8 L-8,-9 Z" fill={SK.robe} stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" />
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------- H: 绝密
const SecretStamp: React.FC<{ f: number }> = ({ f }) => {
  const s = FX.secret, t = f - s[0];
  if (t < 0 || f > s[1]) return null;
  const k = t === 0 ? 2.2 : t === 1 ? 1.4 : t === 2 ? 0.9 : t === 3 ? 1.05 : 1, out = shrink(f, s[1] + 1, 5);
  return (
    <div style={{ position: "absolute", left: 790, top: 985, transform: `translate(-50%, -50%) scale(${(k * out.s).toFixed(3)}) rotate(-14deg)`, opacity: out.o * clamp01((t + 1) / 2) }}>
      <div style={{ padding: "6px 22px 10px", border: `9px solid ${SK.lychee}`, borderRadius: 14, boxShadow: `0 0 0 4px ${SK.rice}, 0 0 0 9px ${SK.ink}`, background: "rgba(255,243,214,0.88)" }}>
        <span style={{ fontFamily: XING, fontSize: 104, lineHeight: 1, color: SK.lychee, letterSpacing: 6, ...ink }}>绝密</span>
      </div>
    </div>
  );
};

/** every effect and banner showing on story frame f */
export const Fx: React.FC<{ f: number }> = ({ f }) => {
  const on = (k: string) => f >= FX[k][0] && f <= FX[k][1];
  if (!Object.keys(FX).some(on)) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {on("dog") ? <DogLabel f={f} /> : null}
      {on("os") ? <ReporterOS f={f} /> : null}
      {on("counter") ? <LycheeCounter f={f} /> : null}
      {on("courier") ? <CourierBanner f={f} /> : null}
      {on("todo") ? <TodoList f={f} /> : null}
      {on("guo") ? <GuoBanner f={f} /> : null}
      {on("secret") ? <SecretStamp f={f} /> : null}
    </AbsoluteFill>
  );
};
