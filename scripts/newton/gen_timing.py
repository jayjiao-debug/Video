#!/usr/bin/env python3
"""Writes src/videos/newton/voice.ts and captions.ts from the dialogue's line timing (《跟着牛顿过一天》, 55 lines, scenes A-G).
An adapted copy of scripts/qin/gen_timing.py. What is different in this film:
  - three speakers: ji 记者 (the camera: never animated; she speaks CHINESE), nt Newton and hm Humphrey (they speak
    ENGLISH). Every line is a quote of its speaker: QUOTE_RAW has one per line, the words actually said (zh for ji, en
    for nt / hm) with their syllable count (Han characters; English syllables, estimated) for the rig's lip-sync;
  - the caption groups are the lines file's "screens" (one screen = Chinese large + English small, one at a time), not
    cut automatically. A screen starts where its first SPOKEN token starts: the first Chinese character for a ji line,
    the first English word of the screen's "en" for an nt / hm line (the voice timing's "words": Chinese characters for
    ji lines, English words for nt / hm lines);
  - the segments are the scenes A-G of the lines file; a scene OWNS the silent beat ("pre") before its first line;
  - the lines file's "pre" / "after" (silent seconds before / after a line), "card" (zh + en, a fact card after the
    line), "card_hold" (its seconds) and "card_delay" (seconds after the line before it shows) go to voice.ts (LINE_RAW,
    CARD_RAW); the scenes' "time" / "en" / "place" to SCENE_RAW; the title block (PLAN 5: on the shut door after
    TITLE_AFTER, TITLE_DELAY s after its last word, for TITLE_HOLD s) to TITLE_RAW. No 时辰 HUD in this film.

  gen_timing.py --placeholder [--json <timing.json>]   a bring-up timing laid out by length: no voice needed
  gen_timing.py <voice_timing.json>                    the real dialogue (/home/user/newton_work/film/voice/voice_timing.json)
  options: --lines <newton_lines.json>  --rate-zh 3.6  --rate-en 2.3  --out <dir>  --md <table.md>
           --no-words (real voice only: ignore the word times, place the screens by token count)

  The run of record (WP1, until the voice is final):
    python3 scripts/newton/gen_timing.py --placeholder
  The real voice (when the producer's voice_timing.json is final):
    python3 scripts/newton/gen_timing.py /home/user/newton_work/film/voice/voice_timing.json

voice_timing.json:
  {"lines": [{"line": n, "id": "A01", "who": "ji", "start": s, "end": s, "words": [[token, start s, end s], ...]}, ...],
   "speech_end": s, "frames": n}
  seconds from the first frame of the film. "words" (optional): the line's spoken tokens in order: Chinese characters for
  a ji line, English words for an nt / hm line. They are matched to the line letter by letter (Han characters / a-z 0-9,
  punctuation and case ignored), so a token split differently ("I'd" / "I", "'d") still lines up; when they do not spell
  the line but there are as many as the line's words, one by one; else the screens are placed by token count (a
  WARNING). Without "words" (or with --no-words) a screen starts in proportion to the tokens before it. The film is
  "frames" long (else speech_end's frame + "tail_f", else + the last line's "after" + TAIL_S).

--placeholder lays the lines out the way the voice lane assembles the clips (lead LEAD s, GAP s between two lines, each
  line's "pre" before it and "after" held after it, TAIL_S after the last hold), a ji line saying its Han characters at
  RATE_ZH a second, an nt / hm line its English words at RATE_EN a second (+ HOLD_DASH per ——/—, HOLD_DOTS per ……/...,
  at least MIN_SAY; LAUGH_LEAD s of laugh before the words of the lines named there). --json writes that layout as a
  voice_timing.json with placeholder "words" (the real-mode input format: a test of the real path).

Shots never copy a number out of voice.ts / captions.ts: story.ts and beats.ts look every frame up (line(n), lineId(id),
cap(n, k), capWord(n, word), quote(who, n), SEGMENTS, CARDS, TITLE_SPAN), so a re-timed voice moves every beat by itself."""
import argparse, json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FPS = 30
RATE_ZH = 3.6     # placeholder: Chinese characters a second (ji)
RATE_EN = 2.3     # placeholder: English words a second (nt, hm)
GAP = 0.3         # seconds between two lines (the lines file's "gap" overrides it)
LEAD = 0.1        # silence before the first line, s (the lines file's "lead" overrides it)
TAIL_S = 0.8      # film after the last line's hold, s
MIN_SAY = 0.45    # placeholder: the shortest line, s
HOLD_DASH = 0.3   # placeholder: a cut-off / held sound (—— or —), s
HOLD_DOTS = 0.35  # placeholder: a trailing-off pause (…… or ...), s
SAY = {}          # placeholder: {id: seconds} how long a line takes when it is not words
LAUGH_LEAD = {"G02": 1.0}   # placeholder: seconds of the non-verbal laugh before the line's first word (PLAN 7 G.2:
                            # "What... use!" goes over the laugh's tail, its subtitle appears mid-laugh)
WORD_SLACK = 0.15 # real voice: word times may run this far outside their line (then they are clamped into it)
LINGER = 12       # a caption stays up to this many frames after its last token, or until the next one starts
MAXW = 16         # a screen's Chinese: at most this many full-width characters (PLAN 5), else a WARNING
LEAD_CUT = 2      # a segment whose first line has no "pre" starts this many frames before its first word
CARD_HOLD = 3.5   # a fact card is shown for the line's "card_hold" s, else its "after" s, else this long
TITLE_AFTER, TITLE_DELAY, TITLE_HOLD = "A02", 0.4, 3.0   # PLAN 5: the title block lands on the shut door after
                                                          # "Good night" (A02): 0.4 s after its last word, for 3 s
SCENES = "ABCDEFG"
SPEAKERS = ["ji", "nt", "hm"]
SPOKEN = {"ji": "zh", "nt": "en", "hm": "en"}   # the language each speaker's lines are SAID in
PLACES = ["stairs", "room", "garden", "street", "schools", "elaboratory"]

HAN = r"[一-鿿]"
cjk = lambda s: len(re.findall(HAN, s))
strip = lambda s: re.sub(r"[^一-鿿]", "", s)
width = lambda s: sum(0.5 if ord(c) < 128 else 1 for c in s)      # ASCII marks are half as wide
frame = lambda s: int(math.floor(s * FPS + 0.5))      # the same rounding as Math.round in story.ts
r3 = lambda s: round(s + 1e-9, 3)


def fail(msg):
    sys.exit("gen_timing: " + msg)


# ------------------------------------------------------------------------------------------------------------ tokens
def en_words(s):
    """the English words of a text, as story.ts / captions.ts split them (capWord): lower case, a-z 0-9 and ' only;
    split at white space, dashes and ellipses"""
    s = s.replace("’", "'").replace("‘", "'")
    return [w for w in (re.sub(r"[^a-z0-9']", "", x.lower()) for x in re.split(r"[\s—–…]+|\.{2,}", s)) if w]


def tokens(text, lang):
    """the spoken tokens of a text: Han characters (zh) or English words (en)"""
    return list(strip(text)) if lang == "zh" else en_words(text)


key = lambda tok: re.sub(r"[^一-鿿a-z0-9]", "", tok.lower().replace("’", "'"))   # letters a token adds to the alignment


def syllables(word):
    """English syllables of a word, estimated (vowel groups, a silent final e): for the rig's lip-sync only"""
    w = re.sub(r"[^a-z]", "", word.lower())
    if not w: return 1 if re.search(r"[0-9]", word) else 0
    n = len(re.findall(r"[aeiouy]+", w))
    if w.endswith("e") and not w.endswith(("le", "ee", "ye")) and n > 1: n -= 1
    return max(1, n)


def syl_of(text, lang):
    return cjk(text) if lang == "zh" else sum(syllables(w) for w in en_words(text))


# ------------------------------------------------------------------------------------------------------------ lines
def load_lines(path):
    j = json.load(open(path, encoding="utf8"))
    lines, sp, scenes = j["lines"], j.get("speakers", {}), j.get("scenes", {})
    seen, last = set(), "A"
    for i, l in enumerate(lines, 1):
        if l["n"] != i: fail(f"line numbers must run 1..n, got {l['n']} at place {i}")
        if l["id"] in seen: fail(f"line id {l['id']} twice")
        seen.add(l["id"])
        if l["scene"] not in SCENES or SCENES.index(l["scene"]) < SCENES.index(last): fail(f"line {i}: scene {l['scene']} out of order")
        if not l["id"].startswith(l["scene"]): fail(f"line {i}: id {l['id']} is not in scene {l['scene']}")
        last = l["scene"]
        if l["who"] not in SPEAKERS or l["who"] not in sp: fail(f"line {i}: unknown speaker {l['who']} (speakers: {', '.join(SPEAKERS)})")
        if not cjk(l["zh"]) or not en_words(l["en"]): fail(f"line {i}: a line needs zh and en")
        scr = l.get("screens") or fail(f"line {i}: no screens")
        for s in scr:
            if not (strip(s.get("zh", "")) and en_words(s.get("en", ""))): fail(f"line {i}: every screen needs zh and en")
        if "".join(strip(s["zh"]) for s in scr) != strip(l["zh"]): fail(f"line {i}: the screens' zh do not spell the line's zh")
        if sum((en_words(s["en"]) for s in scr), []) != en_words(l["en"]): fail(f"line {i}: the screens' en do not spell the line's en")
        lang = SPOKEN[l["who"]]
        if "tts" in l:
            said = re.sub(r"\[[^\]]*\]", "", l["tts"])
            if tokens(said, lang) != tokens(l["zh" if lang == "zh" else "en"], lang): fail(f"line {i}: tts and {'zh' if lang == 'zh' else 'en'} do not have the same words")
        for k in ("pre", "after", "card_hold", "card_delay"):
            if l.get(k, 0) < 0: fail(f"line {i}: {k} cannot be negative")
        c = l.get("card")
        if c is not None and not (c.get("zh") and c.get("en")): fail(f"line {i}: a card needs zh and en")
    for s in sorted({l["scene"] for l in lines}):
        sc = scenes.get(s) or {}
        if not (sc.get("time") and sc.get("en")): fail(f"scene {s} needs time and en in the lines file's scenes")
        if sc.get("place") not in PLACES: fail(f"scene {s}: place {sc.get('place')} is not one of {', '.join(PLACES)}")
    for k in list(SAY) + list(LAUGH_LEAD) + [TITLE_AFTER]:
        if k not in seen: fail(f"SAY / LAUGH_LEAD / TITLE_AFTER names line {k}, which is not in the lines file")
    global GAP, LEAD
    GAP, LEAD = float(j.get("gap", GAP)), float(j.get("lead", LEAD))
    return lines, sp, scenes, j


def said(l):
    """the words a line actually says (zh for ji, en for nt / hm) and their language"""
    lang = SPOKEN[l["who"]]
    return (l["zh"] if lang == "zh" else l["en"]), lang


# ------------------------------------------------------------------------------------------------------- placeholder
def pauses(text, lang):
    """placeholder: [(token, weight, pause s after it)] of a line: a Han character weighs 1, an English word its
    syllables (at least 1); a pause after a token that a dash or an ellipsis follows inside the line"""
    out = []
    if lang == "zh":
        for m in re.finditer(r"([一-鿿])([^一-鿿]*)", text):
            tail = m.group(2)
            out.append([m.group(1), 1.0, HOLD_DASH * ("—" in tail) + HOLD_DOTS * ("…" in tail)])
    else:
        parts = re.split(r"(\s+|—+|–+|…+|\.{2,})", text.replace("’", "'"))
        for p in parts:
            if not p: continue
            w = re.sub(r"[^a-z0-9']", "", p.lower())
            if w: out.append([w, float(syllables(w)), 0.0])
            elif out and re.search(r"—|–", p): out[-1][2] += HOLD_DASH
            elif out and re.search(r"…|\.{2,}", p): out[-1][2] += HOLD_DOTS
    if out: out[-1][2] = 0.0          # a dash / dots at the very end: held by say_of instead
    return out


def say_of(l):
    """placeholder: (seconds the line takes, its tokens with times relative to its start)"""
    text, lang = said(l)
    toks = pauses(text, lang)
    base = len(toks) / (RATE_ZH if lang == "zh" else RATE_EN)
    tail = HOLD_DASH * bool(re.search(r"(——|—)\s*$", text)) + HOLD_DOTS * bool(re.search(r"(……|\.\.\.)\s*$", text))
    lead = LAUGH_LEAD.get(l["id"], 0.0)
    if l["id"] in SAY: d = SAY[l["id"]]
    else: d = max(MIN_SAY, lead + base + sum(p for _, _, p in toks) + tail)
    unit = max(1e-3, d - lead - tail - sum(p for _, _, p in toks)) / max(1e-6, sum(wt for _, wt, _ in toks))
    t, words = lead, []
    for tok, wt, p in toks:
        words.append([tok, r3(t), r3(t + wt * unit)])
        t += wt * unit + p
    return d, words


def layout(lines):
    """the placeholder: the clips laid out as the voice lane lays them, with placeholder word times"""
    t, rows = LEAD, []
    for i, l in enumerate(lines):
        if i: t += GAP
        t += l.get("pre", 0)
        d, ws = say_of(l)
        rows.append({"line": l["n"], "id": l["id"], "who": l["who"], "start": r3(t), "end": r3(t + d),
                     "words": [[w, r3(t + a), r3(t + b)] for w, a, b in ws]})
        t += d + l.get("after", 0)
    return rows, frame(t + TAIL_S)


# ---------------------------------------------------------------------------------------------- caption groups (screens)
def align(l, r, warn, use_words):
    """the line's spoken tokens (in order) with their (start s, end s) from the voice's word times; None when they cannot
    be placed (the caller then places by token count)"""
    text, lang = said(l)
    toks = tokens(text, lang)
    ws = r.get("words") if use_words else None
    if not ws: return toks, None
    ws = [(str(w[0]), float(w[1]), float(w[2])) for w in ws if key(str(w[0]))]
    s, e = r["start"], r["end"]
    # the recogniser's word edges may overlap a little and run a little past the cut: WORD_SLACK s is tolerated, then
    # every time is clamped into the line
    ok = ws and all(a <= b + 0.01 for _, a, b in ws) and all(ws[i][1] <= ws[i + 1][1] + 0.01 for i in range(len(ws) - 1)) \
        and ws[0][1] >= s - WORD_SLACK and ws[-1][2] <= e + WORD_SLACK
    if not ok:
        warn.append(f"line {l['id']}: \"words\" are out of order or outside the line, placed by token count"); return toks, None
    cl = lambda t: min(e, max(s, t))
    ws = [(w, cl(a), cl(max(a, b))) for w, a, b in ws]
    lk = "".join(key(t) for t in toks)
    if "".join(key(w) for w, _, _ in ws) == lk:
        cum, j, out = [], 0, []
        for w, a, b in ws: cum.append((j, j + len(key(w)), a, b)); j += len(key(w))
        pos = 0
        for t in toks:
            k0, k1 = pos, pos + len(key(t)) - 1
            a = next(c[2] for c in cum if c[0] <= k0 < c[1])
            b = next(c[3] for c in cum if c[0] <= k1 < c[1])
            out.append((a, b)); pos += len(key(t))
        return toks, out
    if len(ws) == len(toks):
        warn.append(f"line {l['id']}: \"words\" do not spell the line ({' '.join(w for w, _, _ in ws)}), matched one by one")
        return toks, [(a, b) for _, a, b in ws]
    warn.append(f"line {l['id']}: \"words\" do not spell the line ({' '.join(w for w, _, _ in ws)}), placed by token count")
    return toks, None


def place(lines, rows, use_words=True):
    """the caption groups (= screens) and the quote of every line, in frames and seconds"""
    caps, quotes, warn = [], [], []
    for l, r in zip(lines, rows):
        n, s, e = r["line"], r["start"], r["end"]
        text, lang = said(l)
        toks, tt = align(l, r, warn, use_words)
        tot = len(toks)
        if tt is None: tt = [(s + (e - s) * i / tot, s + (e - s) * (i + 1) / tot) for i in range(tot)]
        acc, line_caps = 0, []
        for k, sc in enumerate(l["screens"]):
            st = tokens(sc["zh"] if lang == "zh" else sc["en"], lang)
            a, b = tt[acc][0], tt[acc + len(st) - 1][1]
            at = [frame(tt[acc + j][0]) for j in range(len(st))]
            acc += len(st)
            if width(sc["zh"]) > MAXW: warn.append(f"line {l['id']} screen {k} 「{sc['zh']}」 is {width(sc['zh']):g} wide (at most {MAXW})")
            line_caps.append({"line": n, "id": l["id"], "k": k, "seg": l["scene"], "who": l["who"], "lang": lang,
                              "zh": sc["zh"], "en": sc["en"], "a": a, "b": b, "at": at})
        if acc != tot: fail(f"line {l['id']}: the screens have {acc} tokens, the line {tot}")
        for i, c in enumerate(line_caps):
            c["from"] = frame(c["a"])
            c["end"] = frame(e) if i == len(line_caps) - 1 else frame(line_caps[i + 1]["a"]) - 1
            c["end"] = max(c["from"], c["end"])
            c["at"][0] = c["from"]
        caps += line_caps
        quotes.append((n, l["who"], r3(s), r3(e), syl_of(text, lang), text))
    return caps, quotes, warn


def finish(caps, lines, rows, total, j):
    """no two groups on one frame; how long each caption stays; the segments; the fact cards; the title block"""
    warn = []
    for a, b in zip(caps, caps[1:]):
        if b["from"] <= a["end"]: a["end"] = b["from"] - 1
        if a["end"] < a["from"]: fail(f"line {a['id']}: the screen 「{a['zh']}」 has no frame of its own")
    first, last = {}, {}
    for l in lines: first.setdefault(l["scene"], l["n"]); last[l["scene"]] = l["n"]
    ids = list(first)
    seg_from = {}
    for i, sc in enumerate(ids):
        l, r = lines[first[sc] - 1], rows[first[sc] - 1]
        if i == 0: seg_from[sc] = 0; continue
        seg_from[sc] = frame(r["start"] - l["pre"]) if l.get("pre", 0) > 0 else frame(r["start"]) - LEAD_CUT
        prev = rows[first[sc] - 2]
        if seg_from[sc] <= frame(prev["end"]): fail(f"segment {sc} would start on frame {seg_from[sc]}, inside line {prev['id']} (ends {frame(prev['end'])})")
    segs = [(sc, first[sc], last[sc], seg_from[sc], (seg_from[ids[i + 1]] if i + 1 < len(ids) else total) - 1) for i, sc in enumerate(ids)]
    for i, c in enumerate(caps):
        nx = caps[i + 1] if i + 1 < len(caps) else None
        to = c["end"] + LINGER if nx is None else min(nx["from"] - 1, c["end"] + LINGER)
        if nx is not None and nx["seg"] != c["seg"]: to = min(to, seg_from[nx["seg"]] - 1)    # not across the cut into the next segment
        if nx is None: to = min(to, total - 1)
        c["to"] = max(c["end"], to)
    cards = []
    for l, r in zip(lines, rows):
        if not l.get("card"): continue
        fr = frame(r["end"]) + 1 + frame(l.get("card_delay", 0))
        to = fr + frame(l.get("card_hold") or l.get("after") or CARD_HOLD) - 1
        nx = rows[l["n"]] if l["n"] < len(rows) else None
        if nx is not None and to >= frame(nx["start"]): warn.append(f"the card after {l['id']} ({fr}-{to}) runs into line {nx['id']} (starts {frame(nx['start'])})")
        cards.append((l["n"], l["id"], fr, min(to, total - 1), l["card"]["zh"], l["card"]["en"]))
    ta = next(r for r in rows if r["id"] == TITLE_AFTER)
    t0 = frame(ta["end"]) + 1 + frame(TITLE_DELAY)
    title = (t0, t0 + frame(TITLE_HOLD) - 1, j["title"]["zh"], j["title"]["en"], j["subtitle"]["zh"], j["subtitle"]["en"])
    if title[0] <= 0: fail("the title block would sit on frame 0")
    for c in cards:
        if c[2] <= title[1] and c[3] >= title[0]: warn.append(f"the title block ({title[0]}-{title[1]}) overlaps the card after {c[1]} ({c[2]}-{c[3]})")
    sa = next(s for s in segs if s[0] == "A")
    if title[1] > sa[4]: warn.append(f"the title block ({title[0]}-{title[1]}) runs past segment A ({sa[4]})")
    return segs, cards, title, warn


# ------------------------------------------------------------------------------------------------------------ writing
TS_TAIL = r'''export const CAPTIONS: CaptionGroup[] = RAW.map(([shot, from, to, zh, en, line, k, end, , who, spoken]) => ({ shot, from, to, text: zh, zh, en, line, k, end, who, spoken }));
/** the caption group shown on frame f, or null */
export const captionAt = (f: number): CaptionGroup | null => {
  let lo = 0, hi = CAPTIONS.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, c = CAPTIONS[m];
    if (f < c.from) hi = m - 1; else if (f > c.to) lo = m + 1; else return c;
  }
  return null;
};
/** "举着【和氏璧】要往" -> [{text: "举着", gold: false}, {text: "和氏璧", gold: true}, {text: "要往", gold: false}] (no gold
 *  words in this film's captions today; the HUD keeps the support) */
export const captionRuns = (text: string): CaptionRun[] => {
  const out: CaptionRun[] = [];
  const re = /【([^】]*)】/g;
  let i = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > i) out.push({ text: text.slice(i, m.index), gold: false });
    out.push({ text: m[1], gold: true });
    i = m.index + m[0].length;
  }
  if (i < text.length) out.push({ text: text.slice(i), gold: false });
  return out;
};
/** trailing punctuation that is pulled back by half an em so the line stays optically centred */
export const TRAILING_PUNCT = "？！，。：”";
for (let i = 1; i < CAPTIONS.length; i++) {
  if (CAPTIONS[i].from <= CAPTIONS[i - 1].to) throw new Error(`caption groups overlap at ${CAPTIONS[i].zh}`);
}

// ------------------------------------------------------------------------------------------- beats from the captions
const BY_LINE: CaptionGroup[][] = [];
const AT_OF = new Map<CaptionGroup, number[]>();
CAPTIONS.forEach((c, i) => { (BY_LINE[c.line] || (BY_LINE[c.line] = [])).push(c); AT_OF.set(c, RAW[i][8]); });
/** a line given by its number (1-based) or its id ("A03") -> its number. Throws on an unknown id. */
export const lineNum = (l: number | string): number => {
  if (typeof l === "number") return l;
  const i = LINE_IDS.indexOf(l);
  if (i < 0) throw new Error(`line "${l}": no such line id (A01 .. ${LINE_IDS[LINE_IDS.length - 1]})`);
  return i + 1;
};
/** the caption groups (screens) of line `line` (its number or its id), in order */
export const capsOf = (line: number | string): CaptionGroup[] => BY_LINE[lineNum(line)] ?? [];
/** screen k of line `line` (number or id): k counts from 0, a negative k from the end (cap("F09", -1)).
 *  .from = the frame the screen is shown from = the frame its first spoken token starts on. Throws when there is none. */
export const cap = (line: number | string, k: number): CaptionGroup => {
  const g = capsOf(line), c = g[k < 0 ? g.length + k : k];
  if (!c) throw new Error(`cap(${JSON.stringify(line)}, ${k}): the line has ${g.length} screens`);
  return c;
};
/** the English words of a text as the timing generator splits them: lower case, a-z 0-9 ' only; split at white space,
 *  dashes and ellipses */
export const enWords = (s: string): string[] =>
  s.replace(/[’‘]/g, "'").split(/[\s—–…]+|\.{2,}/).map((w) => w.toLowerCase().replace(/[^a-z0-9']/g, "")).filter(Boolean);
/** THE FRAME OF A WORD: the screen of line `line` (number or id) that SAYS `word`, with `from` = the frame the word starts
 *  on: put the hit there. The word is in the language the line is SPOKEN in: Chinese characters for a ji line
 *  (capWord("A01", "好")), English words for an nt / hm line (capWord("F14", "burn"), capWord("G02", "use")). When the
 *  word opens its screen, it equals cap(line, k).from. `to`, `end`, `zh`, `en` and `k` are the screen's own. Throws when
 *  no screen, or more than one, says the word, or it occurs twice in its screen (give a longer word). */
export const capWord = (line: number | string, word: string): CaptionGroup => {
  const g = capsOf(line), id = JSON.stringify(line);
  if (!g.length) throw new Error(`capWord(${id}, "${word}"): no such line`);
  if (g[0].spoken === "zh") {
    const w = word.replace(/[^一-鿿]/g, "");
    if (!w) throw new Error(`capWord(${id}, "${word}"): the line is spoken in Chinese: give Chinese characters`);
    const han = (c: CaptionGroup) => c.zh.replace(/[^一-鿿]/g, "");
    const hit = g.filter((c) => han(c).includes(w));
    if (hit.length !== 1) throw new Error(`capWord(${id}, "${word}"): ${hit.length} screens of the line say it`);
    const t = han(hit[0]), i = t.indexOf(w);
    if (t.indexOf(w, i + 1) >= 0) throw new Error(`capWord(${id}, "${word}"): it occurs twice in 「${t}」 (give a longer word)`);
    return { ...hit[0], from: (AT_OF.get(hit[0]) as number[])[i] };
  }
  if (/[一-鿿]/.test(word)) throw new Error(`capWord(${id}, "${word}"): the line is spoken in English: give the English word(s) said`);
  const q = enWords(word);
  if (!q.length) throw new Error(`capWord(${id}, "${word}"): give a word`);
  const hits: { c: CaptionGroup; i: number }[] = [];
  for (const c of g) { const ws = enWords(c.en); for (let i = 0; i + q.length <= ws.length; i++) if (q.every((x, j) => ws[i + j] === x)) hits.push({ c, i }); }
  if (hits.length !== 1) throw new Error(`capWord(${id}, "${word}"): the line says it ${hits.length} times (give one or more words that occur once)`);
  return { ...hits[0].c, from: (AT_OF.get(hits[0].c) as number[])[hits[0].i] };
};
'''


def write_ts(d, src, lines, rows, end_s, total, segs, caps, quotes, cards, title, scenes, speakers):
    js = lambda v: json.dumps(v, ensure_ascii=False)
    head = f"// GENERATED by scripts/newton/gen_timing.py from {src}: do not edit by hand.\n"
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "voice.ts"), "w", encoding="utf8") as f:
        f.write(head)
        f.write("/** who speaks a line: " + ", ".join(f"{k} {speakers[k]}" for k in SPEAKERS) + " (ji is the camera: never animated) */\n")
        f.write("export type Speaker = " + " | ".join(js(s) for s in SPEAKERS) + ";\n")
        f.write("/** the language each speaker SAYS her / his lines in (the captions show both: zh large, en small) */\n")
        f.write("export const SPOKEN: Record<Speaker, \"zh\" | \"en\"> = " + js(SPOKEN) + ";\n")
        f.write("/** \"placeholder\" = laid out by length before the voice exists; \"voice\" = measured from the dialogue */\n")
        f.write(f"export const VOICE_SOURCE: \"placeholder\" | \"voice\" = {js('placeholder' if src.startswith('the placeholder') else 'voice')};\n")
        f.write("/** [line number, start s, end s] */\nexport const VOICE_RAW: [number, number, number][] = [\n")
        for r in rows: f.write(f"  [{r['line']}, {r3(r['start'])}, {r3(r['end'])}],\n")
        f.write("];\n")
        f.write("/** [line number, id, scene, who, pre s (silent beat before it, for action), after s (held after it), zh, en] (the lines file) */\n")
        f.write("export const LINE_RAW: [number, string, string, Speaker, number, number, string, string][] = [\n")
        for l in lines: f.write(f"  [{l['n']}, {js(l['id'])}, {js(l['scene'])}, {js(l['who'])}, {l.get('pre', 0)}, {l.get('after', 0)}, {js(l['zh'])}, {js(l['en'])}],\n")
        f.write("];\n")
        f.write(f"export const VOICE_END_S = {r3(end_s)};\n")
        f.write("/** frames before the first word, frames of film after the last word, the film's length in frames */\n")
        f.write(f"export const VOICE_LEAD_F = {frame(rows[0]['start'])};\nexport const VOICE_TAIL_F = {total - frame(end_s)};\nexport const VOICE_TOTAL_F = {total};\n")
        f.write("/** each line is a quote of its speaker: [line, who, start s, end s, syllables (Han characters / English, estimated), the words said] */\n")
        f.write("export const QUOTE_RAW: [number, Speaker, number, number, number, string][] = [\n")
        for q in quotes: f.write(f"  [{q[0]}, {js(q[1])}, {q[2]}, {q[3]}, {q[4]}, {js(q[5])}],\n")
        f.write("];\n")
        f.write("/** the build segments = the scenes: [id, first line, last line, first frame, last frame (inclusive)]; a scene starts\n"
                f" *  where its first line's silent beat (pre) starts ({LEAD_CUT} frames before its first word when it has none) */\n")
        f.write("export const SEGMENT_RAW: [string, number, number, number, number][] = [\n")
        for s in segs: f.write(f"  [{js(s[0])}, {s[1]}, {s[2]}, {s[3]}, {s[4]}],\n")
        f.write("];\n")
        f.write(f"/** the fact cards: [line, line id, first frame, last frame (inclusive), zh, en]: from the end of the line (+ its \"card_delay\")\n *  for its \"card_hold\" seconds (else its \"after\", else {CARD_HOLD} s) */\n")
        f.write("export const CARD_RAW: [number, string, number, number, string, string][] = [\n")
        for c in cards: f.write(f"  [{c[0]}, {js(c[1])}, {c[2]}, {c[3]}, {js(c[4])}, {js(c[5])}],\n")
        f.write("];\n")
        f.write(f"/** the title block (PLAN 5): [first frame, last frame (inclusive), title zh, title en, subtitle zh, subtitle en]: on the\n *  shut door, {TITLE_DELAY} s after the last word of {TITLE_AFTER}, for {TITLE_HOLD} s */\n")
        f.write(f"export const TITLE_RAW: [number, number, string, string, string, string] = [{title[0]}, {title[1]}, {js(title[2])}, {js(title[3])}, {js(title[4])}, {js(title[5])}];\n")
        f.write("/** the scenes (the lines file): [id, time of day zh, en, place] */\n")
        f.write("export const SCENE_RAW: [string, string, string, string][] = [\n")
        for s in segs: f.write(f"  [{js(s[0])}, {js(scenes[s[0]]['time'])}, {js(scenes[s[0]]['en'])}, {js(scenes[s[0]]['place'])}],\n")
        f.write("];\n")
    with open(os.path.join(d, "captions.ts"), "w", encoding="utf8") as f:
        f.write(head)
        f.write("// Caption groups = the lines file's SCREENS: [segment, first frame, last frame shown (inclusive), zh, en, line, index in the\n")
        f.write("// line, last frame of its speech, the frame each SPOKEN token starts on (Han characters for ji, English words for nt / hm),\n")
        f.write("// speaker, spoken language]. One screen at a time: Chinese large, English small under it. A caption stays up after its\n")
        f.write(f"// last token until the next one starts, at most {LINGER} frames, never across a segment's first frame. Drawn by the HUD (hud/).\n")
        f.write("import type { Speaker } from \"./voice\";\n")
        f.write("/** from..to = the frames the screen is shown; from..end = the frames its words are spoken; zh / en = its two rows\n")
        f.write(" *  (text = zh); line = the line number (1-based), k = its index among that line's screens (0-based); shot = the segment\n")
        f.write(" *  letter; who = the speaker; spoken = the language the line is SAID in (ji \"zh\", nt / hm \"en\") */\n")
        f.write("export type CaptionGroup = { from: number; to: number; text: string; zh: string; en: string; shot: string; line: number; k: number; end: number; who: Speaker; spoken: \"zh\" | \"en\" };\n")
        f.write("export type CaptionRun = { text: string; gold: boolean };\n")
        f.write(f"/** the widest screen in full-width Chinese characters (PLAN 5) */\nexport const CAP_MAXW = {MAXW};\n")
        f.write("/** the line ids in order: LINE_IDS[n - 1] is line n's id */\n")
        f.write("export const LINE_IDS: string[] = " + js([l["id"] for l in lines]) + ";\n\n")
        f.write("type Raw = [shot: string, from: number, to: number, zh: string, en: string, line: number, k: number, end: number, at: number[], who: Speaker, spoken: \"zh\" | \"en\"];\n")
        f.write("const RAW: Raw[] = [\n")
        for c in caps:
            f.write(f"  [{js(c['seg'])}, {c['from']}, {c['to']}, {js(c['zh'])}, {js(c['en'])}, {c['line']}, {c['k']}, {c['end']}, {js(c['at'])}, {js(c['who'])}, {js(c['lang'])}],\n")
        f.write("];\n" + TS_TAIL)


def write_md(path, src, lines, rows, end_s, total, segs, caps, cards, title):
    o = [f"Source: {src}. Frames are 0-based at {FPS} fps; ranges are inclusive.", "",
         f"- Speech ends at {end_s} s = frame {frame(end_s)}; **film length {total} frames = {total / FPS:.3f} s** (last frame {total - 1}).",
         f"- {len(rows)} lines, {len(caps)} screens, {len(cards)} fact cards; title block {title[0]}-{title[1]}.", "",
         "### Segments", "", "| Segment | Lines | First frame | Last frame | Frames | Seconds |", "|---|---|---|---|---|---|"]
    for s in segs: o.append(f"| {s[0]} | {s[1]}-{s[2]} | {s[3]} | {s[4]} | {s[4] - s[3] + 1} | {s[3] / FPS:.2f}-{(s[4] + 1) / FPS:.2f} |")
    o += ["", "### Lines", "", "| Line | Id | Who | From | To | Pre | After | Screens `k from-end` |", "|---|---|---|---|---|---|---|---|"]
    for l, r in zip(lines, rows):
        cs = [c for c in caps if c["line"] == r["line"]]
        o.append(f"| {r['line']} | {l['id']} | {l['who']} | {frame(r['start'])} | {frame(r['end'])} | {l.get('pre', 0)} | {l.get('after', 0)} | "
                 + "<br>".join(f"`{c['k']} {c['from']}-{c['end']}` {c['zh']} / {c['en']}" for c in cs) + " |")
    o += ["", "### Fact cards", "", "| After | From | To | Text |", "|---|---|---|---|"]
    for c in cards: o.append(f"| {c[1]} | {c[2]} | {c[3]} | {c[4]} |")
    open(path, "w", encoding="utf8").write("\n".join(o) + "\n")


def main():
    global RATE_ZH, RATE_EN
    ap = argparse.ArgumentParser(description="dialogue timing -> voice.ts + captions.ts (Newton)")
    ap.add_argument("timing", nargs="?", help="voice_timing.json (the producer's voice lane)")
    ap.add_argument("--placeholder", action="store_true", help="lay the lines out by length instead")
    ap.add_argument("--rate-zh", type=float, default=RATE_ZH, help=f"placeholder only: Chinese characters a second (default {RATE_ZH})")
    ap.add_argument("--rate-en", type=float, default=RATE_EN, help=f"placeholder only: English words a second (default {RATE_EN})")
    ap.add_argument("--no-words", action="store_true", help="real voice: place the screens by token count, not by the word times")
    ap.add_argument("--lines", default=os.path.join(ROOT, "scripts/newton/voice/newton_lines.json"))
    ap.add_argument("--out", default=os.path.join(ROOT, "src/videos/newton"), help="folder for voice.ts and captions.ts")
    ap.add_argument("--json", help="placeholder only: also write the layout as a voice_timing.json")
    ap.add_argument("--md", help="also write the timing as markdown tables")
    a = ap.parse_args()
    if a.placeholder == bool(a.timing): fail("give a voice_timing.json or --placeholder (not both)")
    lines, speakers, scenes, j = load_lines(a.lines)
    if a.placeholder:
        if a.rate_zh <= 0 or a.rate_en <= 0: fail("the rates must be more than 0")
        RATE_ZH, RATE_EN = a.rate_zh, a.rate_en
        rows, total = layout(lines); end_s = rows[-1]["end"]
        src = f"the placeholder layout ({RATE_ZH:g} characters / {RATE_EN:g} words a second, {GAP} s between lines, lead {LEAD} s)"
        if a.json:
            json.dump({"voice": "placeholder", "rate_zh": RATE_ZH, "rate_en": RATE_EN, "gap": GAP, "lead": LEAD, "speech_end": end_s,
                       "frames": total, "lines": rows}, open(a.json, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    else:
        if a.json or a.rate_zh != RATE_ZH or a.rate_en != RATE_EN: fail("--json and the rates are for --placeholder")
        jt = json.load(open(a.timing, encoding="utf8")); rows = jt["lines"]
        if len(rows) != len(lines): fail(f"{len(rows)} lines in {a.timing}, {len(lines)} in the lines file")
        for i, (r, l) in enumerate(zip(rows, lines), 1):
            if r["line"] != i: fail(f"timing rows must be lines 1..n in order, got {r['line']} at place {i}")
            if "id" in r and r["id"] != l["id"]: fail(f"line {i}: the timing file says id {r['id']}, the lines file {l['id']}")
            if "who" in r and r["who"] != l["who"]: fail(f"line {l['id']}: the timing file says who {r['who']}, the lines file {l['who']}")
            if i > 1 and r["start"] < rows[i - 2]["end"]: fail(f"line {l['id']} starts before line {lines[i - 2]['id']} ends")
            if r["end"] <= r["start"]: fail(f"line {l['id']} ends before it starts")
        end_s = jt.get("speech_end", rows[-1]["end"])
        if "frames" in jt: total = int(jt["frames"])
        elif "tail_f" in jt: total = frame(end_s) + int(jt["tail_f"])
        else: total = frame(end_s + lines[-1].get("after", 0) + TAIL_S)
        if total <= frame(end_s): fail(f"the film ({total} frames) ends before the speech (frame {frame(end_s)})")
        src = f"the recorded dialogue ({os.path.basename(a.timing)})"
    caps, quotes, warn = place(lines, rows, use_words=not a.no_words)
    segs, cards, title, w2 = finish(caps, lines, rows, total, j)
    warn += w2
    write_ts(a.out, src, lines, rows, end_s, total, segs, caps, quotes, cards, title, scenes, speakers)
    if a.md: write_md(a.md, src, lines, rows, end_s, total, segs, caps, cards, title)
    for c in caps:
        if c["to"] - c["from"] + 1 < 12: warn.append(f"line {c['id']} screen {c['k']} 「{c['zh']}」: on screen for only {c['to'] - c['from'] + 1} frames")
    print(f"{src}\nlines {len(rows)}  screens {len(caps)}  cards {len(cards)}  title {title[0]}-{title[1]}  speech end {end_s} s  frames {total} ({total / FPS:.3f} s)  first word f{frame(rows[0]['start'])}")
    print("segments  " + "  ".join(f"{s[0]} {s[3]}-{s[4]}" for s in segs))
    for w in warn: print("WARNING", w)
    print("wrote", os.path.join(a.out, "voice.ts"), os.path.join(a.out, "captions.ts"), *(x for x in (a.json, a.md) if x))


main()
