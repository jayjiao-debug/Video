// THE FILM'S GRAPHICS ON THE TIMELINE: every piece of the skin (hud/, 「信」 the letter) that is timed by the script
// rather than by a shot's camera, keyed by line id (never by a frame). The name tabs and the split's edge follow a
// person or a picture, so their scenes draw them (shots/segA, segB, segC, segD).
//   <FxUnder f />     under the HUD: her whisper's darkened edges; the broken lens after the throw (scenes H-I)
//   <Fx f P />        in the HUD layer: the title, the 插手 tally, her notes, the wax stamp, the fact cards, the end card
//   <FxSubtitle f />  in the subtitle layer: her whisper note, which stands in for the subtitle
// Rules kept here: effects land AFTER a line, never on it; none in the turn (E) or the quiet scene (H); from G07 on every
// effect is gone until her last line, when the tally comes back for its one change (插手 1).
import React from "react";
import { AbsoluteFill } from "remotion";
import { line, seg, segmentAt, TITLE_BLOCK, CARDS, type Pose } from "./story";
import { cap, capWord } from "./captions";
import { whisperAt } from "./whisper";
import { OFF_AT } from "./hud";
import { LetterTitle, MeddleTally, Note, WaxStamp, FactCard, WhisperNote, EndCard } from "./hud/index";
import { clamp01 } from "../group/story";
import { shardAt, Shard } from "./shard";

// ------------------------------------------------------------------------------------------------- the schedule
const L = (id: string) => line(id);
/** her notes: [line the note follows, small, big, x, y, rot]. Placed clear of the faces in each scene's framing. */
export const NOTES: { after: string; small?: string; big: string; x: number; y: number; rot?: number; tone?: "ink" | "red" | "blue"; until?: string; delay?: number; dur?: number }[] = [
  // over his hat and feather, not his face (the joke is his face; stills v9, f790), and gone before the cut to Juliet
  { after: "B04", small: "失恋：", big: "一个白天", x: 420, y: 500, rot: -4, until: "B05" },
  // after the split's tear has opened (shots/segC SPLIT: C08.to + 8, 20 frames), between her balcony and him
  { after: "C08", big: "就在楼下", x: 620, y: 970, rot: 3, tone: "red", delay: 26, dur: 30 },   // its last word clear of the app's avatar (x 890 from y 1000)
  { after: "C10", small: "月亮一月一变，", big: "他一天。", x: 520, y: 1080, rot: -3, until: "C11" },
  { after: "C12", big: "太突然？", x: 600, y: 760, rot: 4, tone: "red" },
  { after: "F06", small: "信里写着：", big: "她是假死", x: 520, y: 1125, rot: -3, tone: "red", until: "F07" },   // under his beard, not on it
];
/** a note's frames: `delay` after its line (3), for `dur` (40), never past the next line it names or its own scene */
const noteSpan = (n: (typeof NOTES)[number]) => {
  const from = L(n.after).to + (n.delay ?? 3), sceneEnd = segmentAt(L(n.after).to).to - 2;
  const to = Math.min(n.until ? Math.min(from + (n.dur ?? 40), L(n.until).from - 2) : from + (n.dur ?? 40), sceneEnd);
  return { from, to };
};
/** the 插手 tally's windows: shown A-D, F, G up to G06 (hidden in the turn, the quiet scene and after G07) */
const TALLY_STAMP = L("A05").to + 4;
const TALLY_BLINKS = [L("B07").to + 3, L("F08").to + 3, L("G04").to + 3];
/** Juliet's name tab (drawn by shots/segB): its banner slams in down the right edge, where the tally hangs, and folds
 *  into the tab 44-52 frames later. The tally steps out of its way meanwhile (stills v9, f830: half of it peeked out
 *  beside the banner), and the tab flaps away before the whisper lean on B08, which leaves it no slot but the tally's. */
export const JU_TAB = { from: cap("B05", 0).from + 6, hold: 136 } as const;
const tallyFade = (f: number) => {
  const away = JU_TAB.from - 1, back = JU_TAB.from + 53;
  if (f < away - 4 || f >= back + 6) return 1;
  return f < away ? (away - f) / 4 : f < back ? 0 : (f - back) / 6;
};
/** in G the tally sits out the card (送信人被瘟疫封了门, whose corner reached under it) and Mantua's opening (the street
 *  runs to the top right, so the leaving rider galloped in under it), and fades in as he asks for the Friar's letter:
 *  插手 0 is back for her 「……没有。」 and its blink */
const G_TALLY_BACK = L("G03").to - 4;
const gCardFade = (f: number) => (f < seg("G").from || f > G_TALLY_BACK + 8 ? 1 : f <= G_TALLY_BACK ? 0 : (f - G_TALLY_BACK) / 8);
const tallyShown = (f: number) =>
  (f >= seg("A").from && f <= seg("D").to) || (f >= seg("F").from && f <= seg("F").to) || (f >= seg("G").from && f < L("G07").from - 2);
/** her last line: the tally comes back and changes to 1 on 「我送」 */
const TALLY_BACK = L("I04").from - 10;
export const TALLY_CHANGE = capWord("I04", "送").from - 3;
/** the G card (送信人被瘟疫封了门): in G01's silent beat, before her first word */
export const G_CARD = { from: seg("G").from + 6, to: L("G01").from - 8 };
/** the wax stamp after the wedding line */
export const STAMP_AT = L("D06").to + 3;
/** the end card unfolds after the power-off has gone to black */
export const END_FROM = OFF_AT + 14;

// ---------------------------------------------------------------------------------------------------- under
/** her whisper's darkened edges (the picture's, under her camera's UI), and the broken lens */
export const FxUnder: React.FC<{ f: number }> = ({ f }) => {
  // on Mantua's white noon street the edges are taken down to half (taste review of v1: there they read as a dirty lens)
  const w = whisperAt(f), e = w ? w.edge * (w.id === "G01" ? 0.5 : 1) : 0, s = shardAt(f);
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
  // the tally
  const tOp = tallyFade(f) * gCardFade(f);
  if (tallyShown(f) && tOp > 0) {
    const t = <MeddleTally key="tally" f={f} stampAt={TALLY_STAMP} blinks={TALLY_BLINKS} until={f <= seg("D").to ? undefined : L("G07").from - 3} />;
    out.push(tOp < 1 ? <div key="tally-fade" style={{ position: "absolute", inset: 0, opacity: tOp }}>{t}</div> : t);
  }
  if (f >= TALLY_BACK && f < OFF_AT) out.push(<MeddleTally key="tally-end" id="romeo-tally-end" f={f} stampAt={TALLY_BACK} changeAt={TALLY_CHANGE} x={700} y={360} scale={1.15} />);
  // her notes
  NOTES.forEach((n, i) => {
    const { from, to } = noteSpan(n);
    if (f >= from && f <= to) out.push(<Note key={`note${i}`} id={`romeo-note${i}`} f={f} from={from} to={to} big={n.big} small={n.small} x={n.x} y={n.y} rot={n.rot} tone={n.tone} />);
  });
  // the wedding's wax stamp
  if (f >= STAMP_AT && f <= Math.min(STAMP_AT + 60, seg("D").to - 2)) out.push(<WaxStamp key="stamp" f={f} at={STAMP_AT} small="认识一天" big="已婚" cx={520} cy={540} />);
  // the fact cards: E03's (CARD_RAW) and G's opening card
  for (const c of CARDS) if (f >= c.from && f <= c.to) out.push(<FactCard key={`card${c.n}`} id={`romeo-card${c.n}`} f={f} from={c.from} to={c.to} rows={c.zh.replace(/。(?=.)/g, "。\n").split("\n")} seal="令" />);
  if (f >= G_CARD.from && f <= G_CARD.to) out.push(<FactCard key="gcard" id="romeo-gcard" f={f} from={G_CARD.from} to={G_CARD.to} rows={["送信人被瘟疫封了门。", "信没出城。"]} seal="疫" cy={560} />);
  // the end card
  if (f >= END_FROM) out.push(<EndCard key="end" f={f} from={END_FROM} />);
  return out.length ? <>{out}</> : null;
};

// ------------------------------------------------------------------------------------------------- subtitles
export const FxSubtitle: React.FC<{ f: number }> = ({ f }) => {
  const w = whisperAt(f);
  if (!w || !w.note) return null;
  return <WhisperNote f={f} from={w.from} to={w.to} text={line(w.id).zh} />;
};

export const fxClamp = clamp01;
