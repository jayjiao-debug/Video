// THE DAY ENGINE's timeline: the lines, quotes, segments, fact cards, scene timestamps and the HUD hook of a day film,
// all looked up from the GENERATED voice.ts / captions.ts (scripts/kit/day/gen_timing.py). Taken from Newton's
// story.ts (the newest of the four copies); a film's story.ts calls makeTimeline once and re-exports what it returns:
//
//   import * as VOICE from "./voice";
//   import { cap, capWord, lineNum } from "./captions";
//   const T = makeTimeline({ voice: VOICE, captions: { cap, capWord, lineNum }, L, fps: FPS, what: WHAT, clock: { ... } });
//   export const { LINES, line, lineId, QUOTES, quote, SEGMENTS, CARDS, cardAt, SCENE, SCENE_TIME, TOTAL, ... } = T;
//
// Shots never copy a number out of voice.ts / captions.ts: every frame comes from line(), lineId(), cap(), capWord(),
// quote(), SEGMENTS, CARDS, so a re-timed voice moves every beat by itself.
import type React from "react";

/** voice.ts as gen_timing.py writes it */
export type VoiceData<Sp extends string> = {
  VOICE_RAW: [number, number, number][];
  LINE_RAW: [number, string, string, Sp, number, number, string, string][];
  QUOTE_RAW: [number, Sp, number, number, number, string][];
  SEGMENT_RAW: [string, number, number, number, number][];
  CARD_RAW: [number, string, number, number, string, string][];
  SCENE_RAW: [string, string, string, string][];
  TITLE_RAW: [number, number, string, string, string, string];
  VOICE_END_S: number; VOICE_LEAD_F: number; VOICE_TAIL_F: number; VOICE_TOTAL_F: number;
  SPOKEN: Record<Sp, "zh" | "en">;
};
/** the three lookups captions.ts exports */
export type CaptionLookups<C> = { cap(ln: number | string, k: number): C; capWord(ln: number | string, word: string): C; lineNum(l: number | string): number };

/** a line of the dialogue in frames: from = first frame of speech, to = last; pre / after = the lines file's silent
 *  beat before it / hold after it, in FRAMES; preFrom = from - pre (where its silent beat starts: the action before it).
 *  text = zh (the subtitle's big row), en = the English row; spoken = the language it is SAID in. */
export type VoiceLine<S extends string, Sp extends string> = {
  n: number; id: string; scene: S; who: Sp; text: string; zh: string; en: string; spoken: "zh" | "en";
  from: number; to: number; start: number; end: number;
  pre: number; after: number; preFrom: number;
};
/** a line as its speaker's own words: who speaks, the absolute frames, the seconds, the syllable count (for rigSpeak)
 *  and the words SAID */
export type Quote<Sp extends string> = { line: number; id: string; who: Sp; text: string; syl: number; from: number; to: number; start: number; end: number };
/** a fact card: shown from the end of its line (+ card_delay) for card_hold seconds; text = L(zh, en) */
export type Card = { n: number; id: string; from: number; to: number; zh: string; en: string; text: string };
export type SceneInfo<S extends string, P extends string> = { id: S; time: string; en: string; place: P };
export type SceneStamp = { zh: string; en: string; clock: string; min: number; digits: boolean };
export type SegmentInfo<S extends string> = { id: S; from: number; to: number; lines: [number, number]; what: string };
export type Hud<Pose> = (f: number, P: Pose) => React.ReactNode;

/** "HH:MM" (24-hour) of a clock in minutes (26:00 -> "02:00") */
export const clockText = (min: number) => {
  const m = Math.floor(min), h = Math.floor(m / 60) % 24;
  return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export type TimelineSpec<Sp extends string, S extends string, C> = {
  voice: VoiceData<Sp>;
  captions: CaptionLookups<C>;
  /** the film's L(zh, en) (src/kit/film/lang.ts) */
  L: (zh: string, en: string) => string;
  fps: number;
  /** a line of notes per segment (the build list; shown by the previews) */
  what?: Partial<Record<S, string>>;
  /** THE VLOG'S CLOCK: each scene's time in minutes after the midnight that starts the film's day; digits = whether
   *  the clock shows at rest (default true); word = a timestamp word instead of the lines file's time of day */
  clock?: { min: Record<S, number>; digits?: Partial<Record<S, boolean>>; word?: Partial<Record<S, [string, string]>> };
};

export function makeTimeline<Sp extends string, S extends string, P extends string, C, Pose = unknown>(spec: TimelineSpec<Sp, S, C>) {
  const { voice: V, captions, L, fps: FPS } = spec;
  const { lineNum } = captions;

  // -------------------------------------------------------------------------------------------------- the scenes
  const SCENES = V.SCENE_RAW.map((r) => r[0] as S);
  const SCENE = Object.fromEntries(V.SCENE_RAW.map(([id, zh, en, place]) => [id, { id: id as S, time: zh, en, place: place as P }])) as Record<S, SceneInfo<S, P>>;
  const clock = spec.clock;
  const SCENE_STAMP = clock ? Object.fromEntries(SCENES.map((id) => {
    const [zh, en] = clock.word?.[id] ?? [SCENE[id].time, SCENE[id].en];
    return [id, { zh, en, clock: clockText(clock.min[id]), min: clock.min[id], digits: clock.digits?.[id] ?? true }];
  })) as Record<S, SceneStamp> : null;
  /** each scene's timestamp at rest as one string, L(zh, en): "清晨 05:00" / "05:00 · Early morning", or the word alone */
  const SCENE_TIME = Object.fromEntries(SCENES.map((id) => {
    const s = SCENE_STAMP?.[id];
    if (!s) return [id, L(SCENE[id].time, SCENE[id].en)];
    return [id, s.digits ? L(`${s.zh} ${s.clock}`, `${s.clock} · ${s.en}`) : L(s.zh, s.en)];
  })) as Record<S, string>;

  // ------------------------------------------------------------------------------------------------ the HUD hook
  /** EXTRA HUDs: things that stay on screen across shots besides the cards and the title block. The film shell draws
   *  every registered HUD on every frame, above the 3D picture and UNDER the shot's own overlays, unless the Pose says
   *  hud: false. A HUD is a pure function of the frame (and of the frame's Pose). The same name again replaces it. */
  const HUDS: { name: string; draw: Hud<Pose> }[] = [];
  const registerHud = (name: string, draw: Hud<Pose>) => {
    const i = HUDS.findIndex((x) => x.name === name);
    if (i >= 0) HUDS[i] = { name, draw }; else HUDS.push({ name, draw });
  };
  const huds = (): readonly { name: string; draw: Hud<Pose> }[] => HUDS;

  // -------------------------------------------------------------------------------------------------- the lines
  const META = new Map(V.LINE_RAW.map(([n, id, scene, who, pre, after, zh, en]) => [n, { id, scene: scene as S, who, pre, after, zh, en }]));
  /** the dialogue lines; n starts at 1 (LINES[n - 1]) */
  const LINES: VoiceLine<S, Sp>[] = V.VOICE_RAW.map(([n, s, e]) => {
    const m = META.get(n);
    if (!m) throw new Error(`story: line ${n} has no LINE_RAW entry`);
    const from = Math.round(s * FPS), pre = Math.round(m.pre * FPS);
    return { n, id: m.id, scene: m.scene, who: m.who, text: m.zh, zh: m.zh, en: m.en, spoken: V.SPOKEN[m.who], start: s, end: e, from, to: Math.round(e * FPS), pre, after: Math.round(m.after * FPS), preFrom: from - pre };
  });
  const SPEECH_END = Math.round(V.VOICE_END_S * FPS);
  /** the line with number n (1-based) or id ("A03"). Throws when there is no such line. */
  const line = (n: number | string): VoiceLine<S, Sp> => {
    const k = lineNum(n), l = LINES[k - 1];
    if (!l || l.n !== k) throw new Error(`line(${JSON.stringify(n)}): the dialogue has ${LINES.length} lines`);
    return l;
  };
  const lineId = (id: string): VoiceLine<S, Sp> => line(id);
  /** screen k of line `ln` (number or id): k counts from 0, a negative k from the end. .from = the frame its first
   *  spoken token starts on. Throws when there is none. */
  const cap = (ln: number | string, k: number): C => captions.cap(ln, k);
  /** THE FRAME OF A WORD: the screen of the line that says `word`, with from = the frame the word starts on */
  const capWord = (ln: number | string, word: string): C => captions.capWord(ln, word);
  /** the line spoken at frame f (or null in a pause) */
  const lineAt = (f: number) => LINES.find((l) => f >= l.from && f <= l.to) ?? null;
  /** the number of the line that frame f belongs to as PICTURE: the last line whose silent beat has started */
  const lineNo = (f: number) => { let n = 1; for (const l of LINES) if (f >= l.preFrom - 2) n = l.n; return n; };

  // ------------------------------------------------------------------------------------------------------ quotes
  const QUOTES: Quote<Sp>[] = V.QUOTE_RAW.map(([ln, who, s, e, syl, text]) => ({ line: ln, id: LINES[ln - 1]?.id ?? String(ln), who, text, syl, start: s, end: e, from: Math.round(s * FPS), to: Math.round(e * FPS) }));
  /** the line `n` (number or id) as a quote of `who`. Throws when that line is not `who`'s. */
  const quote = (who: Sp, n: number | string): Quote<Sp> => {
    const k = lineNum(n), q = QUOTES.find((x) => x.line === k);
    if (!q) throw new Error(`quote("${who}", ${JSON.stringify(n)}): no such line`);
    if (q.who !== who) throw new Error(`quote("${who}", ${JSON.stringify(n)}): that line is ${q.who}'s`);
    return q;
  };
  const quotesOf = (who: Sp): Quote<Sp>[] => QUOTES.filter((q) => q.who === who);

  /** film length in frames: the lead, the dialogue with its beats, the tail. The film does not loop. */
  const TOTAL = V.VOICE_TOTAL_F, LEAD = V.VOICE_LEAD_F, TAIL = V.VOICE_TAIL_F;

  // ---------------------------------------------------------------------------------------------------- segments
  /** the build segments = the scenes: a scene starts where its first line's silent beat (pre) starts */
  const SEGMENTS: SegmentInfo<S>[] = V.SEGMENT_RAW.map(([id, l0, l1, from, to]) => ({ id: id as S, from, to, lines: [l0, l1], what: spec.what?.[id as S] ?? "" }));
  if (SEGMENTS[0].from !== 0 || SEGMENTS[SEGMENTS.length - 1].to !== TOTAL - 1) throw new Error("story: SEGMENT_RAW does not cover the film");
  SEGMENTS.forEach((s, i) => { if (i && s.from !== SEGMENTS[i - 1].to + 1) throw new Error(`story: segment ${s.id} does not follow ${SEGMENTS[i - 1].id}`); });
  const segmentAt = (f: number) => SEGMENTS.find((s) => f >= s.from && f <= s.to) ?? (f < 0 ? SEGMENTS[0] : SEGMENTS[SEGMENTS.length - 1]);
  const seg = (id: S) => { const s = SEGMENTS.find((x) => x.id === id); if (!s) throw new Error(`seg("${id}"): no such segment`); return s; };

  // ------------------------------------------------------------------------------------------------------ cards
  const CARDS: Card[] = V.CARD_RAW.map(([n, id, from, to, zh, en]) => ({ n, id, from, to, zh, en, text: L(zh, en) }));
  const cardAt = (f: number): Card | null => CARDS.find((c) => f >= c.from && f <= c.to) ?? null;
  const card = (id: string): Card => { const c = CARDS.find((x) => x.id === id || x.n === lineNum(id)); if (!c) throw new Error(`card("${id}"): that line has no fact card`); return c; };

  // ------------------------------------------------------------------------------------------------------ title
  const T = V.TITLE_RAW;
  const TITLE = L(T[2], T[3]), SUBTITLE = L(T[4], T[5]);
  const TITLE_BLOCK = { from: T[0], to: T[1], zh: T[2], en: T[3], subZh: T[4], subEn: T[5] };

  return {
    SCENES, SCENE, SCENE_STAMP, SCENE_TIME, registerHud, huds,
    LINES, SPEECH_END, line, lineId, cap, capWord, lineAt, lineNo,
    QUOTES, quote, quotesOf, TOTAL, LEAD, TAIL,
    SEGMENTS, segmentAt, seg, CARDS, cardAt, card, TITLE, SUBTITLE, TITLE_BLOCK,
  };
}

// ------------------------------------------------------------------------------------------------------ the lens
/** THE LENS REFERENCE: a CamPose fov is the vertical angle of a frame `lensH` px tall. On a film drawn at H = lensH
 *  (every film since 15 Nov: 9:16) lensTan / lensFov are the identity; on a frame of another height they keep the
 *  width of view (Newton's 9:15 days: H 1800 against LENS_H 1920). */
export const makeLens = (H: number, lensH = H) => {
  /** tan of the half vertical angle the frame really has for a CamPose fov (degrees) */
  const lensTan = (fov: number) => Math.tan((fov * Math.PI) / 360) * (H / lensH);
  /** the real vertical fov (degrees) of the frame for a CamPose fov */
  const lensFov = (fov: number) => (360 / Math.PI) * Math.atan(lensTan(fov));
  return { lensTan, lensFov };
};
