// THE SKIN BOARD (review only): every piece of hud/skin.tsx at rest, a page per frame, on a dim warm ground like the
// office, at film size (1080 x 1920). Frame p = page p; `t` = how many frames into each piece's life it is shown.
//   npx remotion still src/videos/yuelao/preview/skin_entry.tsx YuelaoSkin out.png --frame=<page> --props='{"t":40}'
import React from "react";
import { Composition, registerRoot, useCurrentFrame, getInputProps } from "remotion";
import { ThreadTitle, NameToken, SideCard, Fact, Meter, Hua, FateStamp, Truth, Zhupi, OS, CaseFile, OrderSlip, Snaps, SK } from "../hud/skin";

const P = getInputProps() as { t?: number; bg?: string };
const T = P.t ?? 40;
const Ground: React.FC<{ tone?: "warm" | "night" | "cool" }> = ({ tone = "warm" }) => {
  const g = tone === "night" ? ["#24304a", "#141a28", "#0b0f18"] : tone === "cool" ? ["#8c9aa6", "#5f6d78", "#38424b"] : ["#8a6446", "#5a3f2c", "#2d1f18"];
  return (
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={g[0]} /><stop offset="0.55" stopColor={g[1]} /><stop offset="1" stopColor={g[2]} /></linearGradient>
        <radialGradient id="bgL" cx="0.35" cy="0.3" r="0.6"><stop offset="0" stopColor="#ffe9c4" stopOpacity="0.35" /><stop offset="1" stopColor="#ffe9c4" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#bgG)" />
      <rect width={1080} height={1920} fill="url(#bgL)" />
      {/* a few soft shapes so the pieces are judged over a picture, not a flat colour */}
      <circle cx={760} cy={1250} r={260} fill="#000" opacity={0.12} />
      <rect x={60} y={1500} width={960} height={300} rx={40} fill="#000" opacity={0.1} />
      {/* the phone-safe frame (thin): words stay inside it */}
      <rect x={110} y={340} width={860} height={1150} fill="none" stroke="#ffffff" strokeOpacity={0.18} strokeDasharray="10 12" strokeWidth={2} />
    </svg>
  );
};
const Label: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 0, top: 1830, width: 1080, textAlign: "center", fontFamily: "FrSans, sans-serif", fontSize: 40, color: "#ffffffcc", fontWeight: 700 }}>{text}</div>
);
const f0 = 0, at = (t: number) => f0 - t;   // a piece that came up t frames ago
const PAGES: { label: string; tone?: "warm" | "night" | "cool"; node: (f: number) => React.ReactNode }[] = [
  { label: "片名 · 月老祠匾额", node: (f) => <ThreadTitle f={f} from={at(T)} to={f + 200} cut /> },
  { label: "人物 · 月老的玉腰牌（不再定格）", node: (f) => <NameToken f={f} from={at(T)} to={f + 200} x={820} y={300} side="left" /> },
  { label: "人物 · 凡人案卷签", tone: "cool", node: (f) => <SideCard f={f} from={at(T)} to={f + 200} x={430} y={560} name="林小满" note="30岁 · 程序员 · 天天加班" tx={330} ty={980} /> },
  { label: "史料卡 · 账簿挂轴", node: (f) => <><Fact f={f} from={at(T)} to={f + 200} y={420} rows={["2025年 结婚【676.3万】对", "离婚【274.3万】对"]} src="民政部 · 2025年全年登记数" seal="真事" /><Fact f={f} from={at(T)} to={f + 200} y={900} rows={["唐《定婚店》：", "赤绳“以系【夫妻之足】”"]} src="李复言《续玄怪录》" seal="传说" /></> },
  { label: "指标香 · 断线计数 · 花字", node: (f) => <><Meter f={f} from={at(T)} to={f + 200} bumps={[]} done={f + 400} start={at(400)} /><g /><Snaps f={f} from={at(T)} to={f + 200} x={540} y={760} hits={[at(30), at(20), at(10)]} /><Hua f={f} from={at(T)} to={f + 200} text="就差1对！" x={540} y={1120} px={110} /></> },
  { label: "印章 · 缘分未到 / 已到 · 真事", node: (f) => <><FateStamp f={f} from={at(T)} to={f + 200} x={330} y={640} /><FateStamp f={f} from={at(T)} to={f + 200} x={750} y={980} ok rot={7} /><Truth f={f} from={at(T)} to={f + 200} x={300} y={1240} kind="传说" /><Truth f={f} from={at(T)} to={f + 200} x={540} y={1240} kind="真事" /><Truth f={f} from={at(T)} to={f + 200} x={780} y={1240} kind="演绎" /></> },
  { label: "朱批 · 记者OS", node: (f) => <><Zhupi f={f} from={at(T)} to={f + 200} x={200} y={560} text="此单不记" px={84} mark="cross" mx={-20} my={80} mw={420} mh={220} /><OS f={f} from={at(T)} to={f + 200} x={150} y={1150} text="他好像很怕考核" /></> },
  { label: "许愿牌（月老庙来单）", node: (f) => <OrderSlip f={f} from={at(T)} to={f + 200} x={540} y={820} /> },
  { label: "姻缘簿 · 线装书卷宗", node: (f) => <CaseFile f={f} from={at(T)} to={f + 200} x={540} y={760} kind="niulang" stampAt={14} noteAt={4} rot={-2} /> },
  { label: "姻缘簿 · 红楼梦", node: (f) => <CaseFile f={f} from={at(T)} to={f + 200} x={540} y={760} kind="baodai" stampAt={14} noteAt={4} rot={2} seal /> },
  { label: "达标", node: (f) => <Meter f={f} from={at(T)} to={f + 200} bumps={[]} done={at(12)} start={at(400)} /> },
];
const Board: React.FC = () => {
  const p = useCurrentFrame(), pg = PAGES[Math.min(p, PAGES.length - 1)];
  return (
    <div style={{ position: "absolute", width: 1080, height: 1920, background: SK.ink, overflow: "hidden" }}>
      <Ground tone={pg.tone} />
      {pg.node(f0)}
      <Label text={pg.label} />
    </div>
  );
};
registerRoot(() => <Composition id="YuelaoSkin" component={Board} durationInFrames={PAGES.length} fps={30} width={1080} height={1920} />);
