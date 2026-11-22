// preview/hud_panels.tsx: the cells of the skin's proof sheet (preview/hud_sheet.tsx): each of the film's on-screen
// graphics (hud/) at a local frame t, with the plain ground and the stand-in figure it is shown over.
import React from "react";
import { letterDefs, sheet, wax, quill } from "../hud/marks";
import { C, TONE } from "../hud/skin";
import { LetterTitle } from "../hud/title";
import { NameTab, FriarBanner } from "../hud/tabs";
import { MeddleTally } from "../hud/tally";
import { WhisperNote } from "../hud/whisper";
import { Note } from "../hud/notes";
import { FactCard } from "../hud/fact";
import { WaxStamp } from "../hud/stamp";
import { SplitDivider, dividerEdges } from "../hud/divider";
import { EndCard } from "../hud/end";
import type { Rect } from "../../../kit/overlay";

export type Panel = { label?: string; ground?: keyof typeof GROUNDS; guides?: boolean; back?: (t: number) => React.ReactNode; node: (t: number, id: string) => React.ReactNode };
/** plain mid-tone grounds: Verona's warm stone by day, the orchard at night, the tomb, the end's black */
export const GROUNDS = { stone: "#a08a72", night: "#46506e", tomb: "#5a5560", sky: "#7d95a8", black: "#140d09" } as const;

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>{children}</svg>
);

/** a stand-in figure (a round head, a body) so a piece is seen beside a person: head centre (cx, cy), head radius r */
export const figure = (cx: number, cy: number, r: number, tint = "#00000026") => (
  <Svg>
    <path d={`M${cx - r * 0.78},${cy + r * 0.9} L${cx + r * 0.78},${cy + r * 0.9} L${cx + r * 1.05},${cy + r * 5.4} L${cx - r * 1.05},${cy + r * 5.4} Z`} fill={tint} />
    <circle cx={cx} cy={cy} r={r} fill="#ffffff55" stroke="#00000030" strokeWidth={8} />
  </Svg>
);

/** a stand-in person who drifts across the frame as the camera moves: head centre and radius on frame t, and the
 *  head-and-shoulders box a tab is given */
const walk = (x0: number, y0: number, r: number, vx: number, vy = 0) => {
  const at = (t: number) => ({ cx: x0 + vx * t, cy: y0 + vy * t, r });
  return { at, back: (t: number) => { const p = at(t); return figure(p.cx, p.cy, p.r); }, box: (t: number): Rect => { const p = at(t); return { x0: p.cx - p.r * 1.05, y0: p.cy - p.r, x1: p.cx + p.r * 1.05, y1: p.cy + p.r * 2.1 }; } };
};
const ROMEO = walk(600, 660, 165, 0.35), JULIET = walk(470, 640, 160, -0.3), FRIAR_W = walk(420, 700, 170, 0.5);
/** the tally as it stands through the film (插手 0), drawn with a piece so the two are seen together */
const tally0 = (id: string) => <MeddleTally f={400} stampAt={0} id={`${id}t`} />;
const note = (big: string, small: string | undefined, x: number, y: number, tone?: "ink" | "red" | "blue"): Panel => ({ label: `note ${small ?? ""}${big}`, guides: true, back: () => figure(540, 640, 170), node: (t, id) => <>{tally0(id)}<Note f={t} from={0} big={big} small={small} x={x} y={y} tone={tone} id={id} /></> });

export const PANELS: Record<string, Panel> = {
  romeo: { label: "Romeo tab", guides: true, back: ROMEO.back, node: (t, id) => <NameTab f={t} from={0} who="romeo" box={ROMEO.box} id={id} /> },
  juliet: { label: "Juliet tab", ground: "night", guides: true, back: JULIET.back, node: (t, id) => <NameTab f={t} from={0} who="juliet" box={JULIET.box} id={id} /> },
  friar: { label: "Friar banner", ground: "tomb", guides: true, back: FRIAR_W.back, node: (t, id) => <FriarBanner f={t} from={0} box={FRIAR_W.box} id={id} /> },
  tally: { label: "tally", guides: true, back: () => figure(540, 700, 170), node: (t, id) => <MeddleTally f={t} stampAt={0} blinks={[40]} changeAt={80} id={id} /> },
  whisper: { label: "whisper", guides: true, back: () => figure(540, 640, 170), node: (t, id) => <>{tally0(id)}<WhisperNote f={t} from={0} to={90} text="他昨天还在为别人哭呢。" id={id} /></> },
  whisper2: { label: "whisper, two rows", guides: true, back: () => figure(540, 640, 170), node: (t, id) => <WhisperNote f={t} from={0} to={90} text="认识不到一天就要结婚，我该不该拦一下？" id={id} /> },
  note1: note("一个白天", "失恋：", 500, 1090),
  note2: note("就在楼下", undefined, 500, 1100, "blue"),
  note3: note("太突然？", undefined, 500, 1100, "red"),
  note4: note("他一天。", "月亮一月一变，", 500, 1090),
  note5: note("她是假死", "信里写着：", 500, 1090, "red"),
  fact1: { label: "fact card", ground: "sky", guides: true, node: (t, id) => <FactCard f={t} from={0} to={120} rows={["判决：驱逐。", "回来就是死。"]} id={id} /> },
  fact2: { label: "fact card 2", ground: "tomb", guides: true, node: (t, id) => <FactCard f={t} from={0} to={120} rows={["送信人被瘟疫封了门。", "信没出城。"]} seal="疫" id={id} /> },
  stamp: { label: "wax stamp", guides: true, back: () => figure(540, 640, 170), node: (t, id) => <>{tally0(id)}<WaxStamp f={t} at={0} cx={500} cy={1096} id={id} /></> },
  split: {
    label: "split edge", ground: "night",
    back: (t) => { const E = dividerEdges(960, t / 100); return (
      <Svg>
        <rect x={0} y={0} width={1080} height={1920} fill="#59607a" />
        <rect x={0} y={0} width={1080} height={Math.max(0, E.upper)} fill="#6b4a58" />
        <rect x={0} y={E.lower} width={1080} height={Math.max(0, 1920 - E.lower)} fill="#3d4f78" />
      </Svg>
    ); },
    node: (t, id) => <SplitDivider y={960} open={t / 100} id={id} />,
  },
  end: { label: "end card", ground: "black", node: (t, id) => <EndCard f={t} from={0} id={id} /> },
  title: { label: "title", guides: true, back: () => figure(540, 640, 170), node: (t, id) => <LetterTitle f={t} from={0} id={id} /> },
  /** the marks on one leaf: parchment, the quill hand at its sizes, the wax in its tones */
  proof: {
    label: "marks", node: (_t, id) => (
      <Svg>
        <defs>{letterDefs(id, ["red", "blue", "gold", "herb"])}</defs>
        {sheet(id, "leaf", { x0: 120, y0: 380, x1: 960, y1: 1240 }, { creases: [{ y: 660, a: 120, b: 960 }, { y: 950, a: 120, b: 960, valley: true }], seed: 3 }, (
          <>
            {quill(id, "a", "罗密欧", 330, 470, 110, TONE.blueDeep, { seed: 2 })}
            {quill(id, "b", "朱丽叶", 740, 470, 110, TONE.redDeep, { seed: 4 })}
            {quill(id, "c", "与", 540, 484, 70, TONE.goldDeep, { seed: 6 })}
            {quill(id, "d", "从相识到墓穴，一共四天。", 540, 600, 56, C.ink, { seed: 8 })}
            {quill(id, "e", "送信人被瘟疫封了门。信没出城。", 540, 720, 46, C.ink, { seed: 9, body: true })}
            {quill(id, "f", "劳伦斯神父 · 草药行家", 540, 800, 38, TONE.inkSoft, { seed: 10, body: true })}
            {quill(id, "g", "悄悄说 · 恋爱脑 · 行动派 · 太突然？", 540, 870, 30, TONE.inkRed, { seed: 11, body: true })}
            {wax(id, "w1", 250, 1080, 96, { rows: ["已婚"], rot: -8, seed: 2 })}
            {wax(id, "w2", 470, 1070, 70, { rows: ["演绎"], rot: 6, seed: 5 })}
            {wax(id, "w3", 630, 1060, 44, { emblem: "0", seed: 7 })}
            {wax(id, "w4", 730, 1060, 44, { emblem: "1", seed: 9, rot: 8 })}
            {wax(id, "w5", 820, 1040, 30, { rows: ["四"], seed: 3 })}
            {wax(id, "w6", 620, 1170, 26, { emblem: "heart", tone: "blue", seed: 4 })}
            {wax(id, "w7", 700, 1170, 26, { emblem: "arrow", tone: "red", seed: 6 })}
            {wax(id, "w8", 780, 1170, 26, { emblem: "leaf", tone: "herb", seed: 8 })}
            {wax(id, "w9", 860, 1170, 26, { emblem: "heart", tone: "gold", seed: 10 })}
          </>
        ))}
      </Svg>
    ),
  },
};
