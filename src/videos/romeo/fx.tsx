// THE FILM'S GRAPHICS ON THE TIMELINE: every piece of the skin (hud/, 「信」 the letter) that is timed by the script
// rather than by a shot's camera, keyed by line id (never by a frame). The name tabs and the split's edge follow a
// person or a picture, so their scenes draw them (shots/segA, segB, segC, segD).
//   <FxUnder f />     under the HUD: her whisper's darkened edges; the broken lens after the throw (scenes H-I)
//   <Fx f P />        in the HUD layer: the title, the 插手 tally, her notes, the wax stamp, the fact cards, the end card
//   <FxSubtitle f />  in the subtitle layer: her whisper note, which stands in for the subtitle
// Rules kept here: effects land AFTER a line, never on it; none in the turn (E) or the quiet scene (H); from G07 on every
// effect is gone until her last line, when the tally comes back for its one change (插手 1).
// v5, the owner's two exceptions: the duel gets one label of context (E, before her first word), and the friar's long
// exchange in the cell gets her two notes on what the plan IS (F02, F03): those two come on the second half of a line,
// at the top of the frame, clear of both faces and of the subtitle.
import React from "react";
import { AbsoluteFill } from "remotion";
import { line, seg, segmentAt, TITLE_BLOCK, CARDS, type Pose, type SceneId } from "./story";
import { cap, capWord } from "./captions";
import { whisperAt } from "./whisper";
import { OFF_AT } from "./hud";
import { LetterTitle, MeddleTally, Note, WaxStamp, FactCard, WhisperNote, EndCard } from "./hud/index";
import { clamp01 } from "../group/story";
import { shardAt, Shard } from "./shard";

// ------------------------------------------------------------------------------------------------- the schedule
const L = (id: string) => line(id);
/** her notes: [line the note follows, small, big, x, y, rot]. Placed clear of the faces in each scene's framing.
 *  `scene` instead of `after`: the note comes `delay` frames after that scene's first frame (the duel has no line).
 *  `from` instead of `after`: the note's own first frame (a caption group inside a long line). */
export const NOTES: { after?: string; scene?: SceneId; from?: number; small?: string; big: string; x: number; y: number; rot?: number; tone?: "ink" | "red" | "blue"; until?: string; delay?: number; dur?: number; size?: number }[] = [
  // over his hat and feather, not his face (the joke is his face; stills v9, f790), and gone before the cut to Juliet
  { after: "B04", small: "失恋：", big: "一个白天", x: 420, y: 500, rot: -4, until: "B05" },
  // after the split's tear has opened (shots/segC SPLIT: C08.to + 8, 20 frames), between her balcony and him
  { after: "C08", big: "就在楼下", x: 620, y: 970, rot: 3, tone: "red", delay: 26, dur: 30 },   // its last word clear of the app's avatar (x 890 from y 1000)
  { after: "C10", small: "月亮一月一变，", big: "他一天。", x: 520, y: 1080, rot: -3, until: "C11" },
  { after: "C12", big: "太突然？", x: 600, y: 760, rot: 4, tone: "red" },
  // THE DUEL'S WHY (v5, the owner: "with some labels perhaps to give more context"): once Tybalt lies there and she has
  // walked up to Romeo's back. Over his hat and the house fronts (he has his back to us: no face is covered), until
  // just before she says his name
  { scene: "E", delay: 124, dur: 46, small: "提伯尔特先杀了他好友", big: "报仇", x: 700, y: 500, rot: 3, tone: "red", until: "E01" },
  // WHAT THE PLAN IS (v5, the owner on the cell: "quite a long sequence of dialog, maybe add some labels to give context
  // that she is trying to fake her death to escape with Romeo"): on the friar's "no warmth, no breath" and on his
  // "awake as from a pleasant sleep", over the shelves at the top of the two-shot: under the REC row's label (its
  // scrap starts at y 345), above the two heads (her hair from y 540, his crown from y 565), so set a size smaller
  { from: cap("F02", 1).from + 6, dur: 84, small: "神父的主意：", big: "假死逃婚", x: 575, y: 478, rot: -3, tone: "red", until: "F03", size: 92 },
  { from: cap("F03", 1).from + 8, dur: 80, small: "醒了就和罗密欧", big: "私奔", x: 575, y: 478, rot: 3, until: "F04", size: 92 },
  { after: "F06", small: "信里写着：", big: "她是假死", x: 520, y: 1125, rot: -3, tone: "red", until: "F07" },   // under his beard, not on it
];
/** a note's frames: `delay` after its line (3), for `dur` (40), never past the next line it names or its own scene */
export const noteSpan = (n: (typeof NOTES)[number]) => {
  const from = n.from ?? (n.scene ? seg(n.scene).from + (n.delay ?? 0) : L(n.after!).to + (n.delay ?? 3)), sceneEnd = (n.scene ? seg(n.scene) : segmentAt(n.from ?? L(n.after!).to)).to - 2;
  const to = Math.min(n.until ? Math.min(from + (n.dur ?? 40), L(n.until).from - 2) : from + (n.dur ?? 40), sceneEnd);
  return { from, to };
};
/** THE 插手 TALLY'S WINDOWS (v5, the owner: "The 插手 counter only needs to show up when she rejects"): it is on screen only
 *  round each of her refusals. It flaps in as she says it, the wax 0 thunks on eight frames later, the 0 blinks as the
 *  line ends (still 0), and about a second and a half after that it flaps away. (Until v4 it hung there through A-D, F
 *  and G.) The first one stamps on 「不插手」 itself and rides over the cut to the feast: A ends a second after the line. */
const refusal = (id: string, word: string, hold = 44) => ({ id, from: capWord(id, word).from - 5, blink: L(id).to + 3, to: L(id).to + 3 + hold });
export const TALLY_WINS = [
  { ...refusal("A05", "不插手"), to: L("B01").from - 6 },
  refusal("B07", "我只拍"),
  refusal("F08", "我只拍"),
  refusal("G04", "没有"),
];
/** Juliet's name tab (drawn by shots/segB): its banner slams in down the right edge, where the tally hangs, and folds
 *  into the tab 44-52 frames later; the tab flaps away before the whisper lean on B08. (The tally's B07 window opens
 *  after the banner has folded.) */
export const JU_TAB = { from: cap("B05", 0).from + 6, hold: 136 } as const;
/** her last line (v6: 「……我得买新手机了。」; until v5 「……拍不了了。我送。」): the tally comes back and changes to 1 on
 *  「新手机」 (until v5 on 「我送」) */
const TALLY_BACK = L("I04").from - 10;
export const TALLY_CHANGE = capWord("I04", "新手机").from - 3;
/** the G card (送信人被瘟疫封了门): in G01's silent beat, before her first word */
export const G_CARD = { from: seg("G").from + 6, to: L("G01").from - 8 };
/** the verdict card's centre (the kit's default 1040 is where Tybalt lies) */
const CARD_CY = 610;
/** the wax stamp after the wedding line */
export const STAMP_AT = L("D06").to + 3;
/** the end card unfolds after the power-off has gone to black */
export const END_FROM = OFF_AT + 14;

// ---------------------------------------------------------------------------------------------------- under
/** her whisper's darkened edges (the picture's, under her camera's UI), and the broken lens */
export const FxUnder: React.FC<{ f: number }> = ({ f }) => {
  // on Mantua's white noon street the edges are taken down to half (taste review of v1: there they read as a dirty lens)
  const w = whisperAt(f), e = w ? w.edge * (w.id === "G01" || w.id === "G07" ? 0.5 : 1) : 0, s = shardAt(f);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {e > 0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 72% 58% at 50% 46%, rgba(20,13,9,0) 52%, rgba(20,13,9,0.62) 100%)", opacity: e }} /> : null}
      {s ? <Shard f={f} s={s} /> : null}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------------ HUD
export const Fx: React.FC<{ f: number; P: Pose }> = ({ f, P }) => {
  if (P.hud === false) return null;
  const out: React.ReactNode[] = [];
  // the title, in the gap after Romeo's blank 「……朱丽叶是谁？」
  if (f >= TITLE_BLOCK.from && f <= TITLE_BLOCK.to && P.cards !== false) out.push(<LetterTitle key="title" f={f} from={TITLE_BLOCK.from} to={TITLE_BLOCK.to} y={1110} />);
  // the tally: only round her refusals
  for (const w of TALLY_WINS) if (f >= w.from && f <= w.to) out.push(<MeddleTally key={`tally${w.id}`} id={`romeo-tally-${w.id}`} f={f} stampAt={w.from} blinks={[w.blink]} until={w.to} />);
  if (f >= TALLY_BACK && f < OFF_AT) out.push(<MeddleTally key="tally-end" id="romeo-tally-end" f={f} stampAt={TALLY_BACK} changeAt={TALLY_CHANGE} x={700} y={360} scale={1.15} />);
  // her notes
  NOTES.forEach((n, i) => {
    const { from, to } = noteSpan(n);
    if (f >= from && f <= to) out.push(<Note key={`note${i}`} id={`romeo-note${i}`} f={f} from={from} to={to} big={n.big} small={n.small} x={n.x} y={n.y} rot={n.rot} tone={n.tone} size={n.size} />);
  });
  // the wedding's wax stamp
  if (f >= STAMP_AT && f <= Math.min(STAMP_AT + 60, seg("D").to - 2)) out.push(<WaxStamp key="stamp" f={f} at={STAMP_AT} small="认识一天" big="已婚" cx={520} cy={540} />);
  // the fact cards: E03's (CARD_RAW) and G's opening card
  // (E03's hangs over the far end of the street: v5, the man lies across the street below it and the two rapiers below him)
  for (const c of CARDS) if (f >= c.from && f <= c.to) out.push(<FactCard key={`card${c.n}`} id={`romeo-card${c.n}`} f={f} from={c.from} to={c.to} rows={c.zh.replace(/。(?=.)/g, "。\n").split("\n")} seal="令" cy={CARD_CY} />);
  if (f >= G_CARD.from && f <= G_CARD.to) out.push(<FactCard key="gcard" id="romeo-gcard" f={f} from={G_CARD.from} to={G_CARD.to} rows={["送信人被瘟疫封了门。", "信没出城。"]} seal="疫" cy={560} />);
  // the end card
  if (f >= END_FROM) out.push(<EndCard key="end" f={f} from={END_FROM} />);
  return out.length ? <>{out}</> : null;
};

// ------------------------------------------------------------------------------------------------- subtitles
export const FxSubtitle: React.FC<{ f: number }> = ({ f }) => {
  const w = whisperAt(f);
  if (!w || !w.note) return null;
  // (on the street a man lies behind her note, and in the tomb she lies on her bier: no red wax drops there, they would
  // read as blood)
  return <WhisperNote f={f} from={w.from} to={w.to} text={line(w.id).zh} drips={w.id !== "E03" && w.id !== "H03"} />;
};

export const fxClamp = clamp01;
