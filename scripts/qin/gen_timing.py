#!/usr/bin/env python3
"""Writes src/videos/qin/voice.ts and captions.ts from the dialogue's line timing (《采访秦始皇的一天》, 65 lines, scenes A-G).
An adapted copy of scripts/wanbi/gen_timing.py. What is different in this film:
  - EVERY line is a quote of its speaker (who: ji 小记者 (off-screen, never animated), di 秦始皇, xufu, boshi, huanguan):
    QUOTE_RAW has one quote per line, the whole line;
  - the caption groups are cut AUTOMATICALLY (no CAP table): at most MAXW full-width characters, split at punctuation
    (a sentence end is the preferred place, a comma the next best), every group carries its speaker (Film's caption
    colour);
  - the segments are the scenes A-G of the lines file; a scene OWNS the silent beat ("pre") before its first line (the
    action that opens it), except the scenes in SEG_WORD (their pre is the end of the scene before);
  - the lines file's "pre" / "after" (silent seconds before a line / held after it) and "card" (a fact card shown after
    the line) are written to voice.ts (LINE_RAW, CARD_RAW), the scenes' 时辰 to SCENE_RAW.

  gen_timing.py --placeholder                       a bring-up timing laid out by character count: no voice needed
  gen_timing.py <voice_timing.json>                 the real dialogue (scripts/qin/voice/assemble.py writes it)
  options: --lines <qin_lines.json>  --rate 4.6  --out <dir>  --json <timing.json> (placeholder)  --md <table.md>
           --no-words (real voice only: ignore the word times, place the groups by character count)

  The run of record (WP1, until the voice is final):
    python3 scripts/qin/gen_timing.py --placeholder
  The real voice (when /home/user/qin_work/voice/voice_timing.json is final):
    python3 scripts/qin/gen_timing.py /home/user/qin_work/voice/voice_timing.json

voice_timing.json (Wanbi's format, as assemble.py writes it):
  {"lines": [{"line": n, "id": "A01", "who": "ji", "text": "...", "start": s, "end": s, "words": [["嘘", s, s], ...]}, ...],
   "speech_end": s, "frames": n, "tail_f": n}
  seconds from the first frame of the film. "words" (optional): one [character, start s, end s] per Chinese character
  of the line, in order: with them a caption group starts where its first character starts; without them (or with
  --no-words) the groups are placed in proportion to the Chinese characters before them. The film is "frames" long
  (else speech_end's frame + "tail_f", else + the last line's "after" + TAIL_S).

--placeholder lays the lines out exactly the way assemble.py lays the clips (lead LEAD s, GAP s between two lines, each
  line's "pre" before it and "after" held after it, TAIL_S after the last hold), each line SAYING its Chinese characters
  at RATE a second (+ HOLD_DASH per —— and HOLD_DOTS per ……, at least MIN_SAY; SAY overrides a line).
--json also writes the placeholder layout as a voice_timing.json.

Shots never copy a number out of voice.ts / captions.ts: story.ts and beats.ts look every frame up (line(n), lineId(id),
cap(n, k), capWord(n, word), quote(who, n), SEGMENTS, CARDS), so a re-timed voice moves every beat by itself."""
import argparse, json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FPS = 30
RATE = 4.6        # placeholder: Chinese characters a second
GAP = 0.18        # seconds between two lines (assemble.py's default; the lines file's "gap" overrides it)
LEAD = 0.1        # silence before the first line, s (assemble.py's default; the lines file's "lead" overrides it)
TAIL_S = 0.8      # film after the last line's hold, s (assemble.py TAIL_S)
MIN_SAY = 0.5     # placeholder: the shortest line, s
HOLD_DASH = 0.35  # placeholder: a held sound (——), s
HOLD_DOTS = 0.3   # placeholder: a trailing-off pause (……), s
SAY = {"A04": 1.4}  # placeholder: how long a line takes when it is not words (A04: the strain of the stuck sword)
LINGER = 12       # a caption stays up to this many frames after its last syllable, or until the next one starts
MAXW = 14         # width of one caption group in full-width characters, punctuation included
LEAD_CUT = 2      # a segment whose first line has no "pre" starts this many frames before its first word
CARD_HOLD = 2.4   # a fact card is shown for the line's "card_hold" seconds, else its "after" seconds, else this long
# scenes whose first line's "pre" belongs to the scene BEFORE them: the segment starts LEAD_CUT frames before its first
# word. C: C01's pre is B's cutaway (he nods off over the slips, jerks awake, glares at the lens: PLAN 7 B.5, in the hall).
SEG_WORD = {"C"}
# a fact card that starts later than the end of its line: {line id: seconds} (none today: PLAN 7 D.3 asked for 0.6 s after
# D04, but the lines file's D05 pre (2.6 s) leaves room only for the 2.4 s card right after the line)
CARD_DELAY = {}
TRIM = {}         # the lines file's "trim" ({id: keep only the first N s}), read by load_lines
SCENES = "ABCDEFG"
SPEAKERS = ["ji", "di", "xufu", "boshi", "huanguan"]

STRONG = "。！？!?"
WEAK = "，、；：,;:"
DOTS = "…"
PUNCT = STRONG + WEAK + DOTS + "—“”‘’（）《》「」()"
cjk = lambda s: len(re.findall(r"[一-鿿]", s))
strip = lambda s: re.sub(r"[^一-鿿]", "", s)
plain = lambda s: s.replace("【", "").replace("】", "")
width = lambda s: sum(0.5 if ord(c) < 128 else 1 for c in plain(s))      # ASCII marks are half as wide
frame = lambda s: int(math.floor(s * FPS + 0.5))      # the same rounding as Math.round in story.ts
r3 = lambda s: round(s + 1e-9, 3)


def fail(msg):
    sys.exit("gen_timing: " + msg)


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
        if l["who"] not in SPEAKERS or l["who"] not in sp: fail(f"line {i}: unknown speaker {l['who']}")
        if not cjk(l["zh"]): fail(f"line {i}: no Chinese character in {l['zh']}")
        if "tts" in l and strip(re.sub(r"\[[^\]]*\]", "", l["tts"])) != strip(l["zh"]): fail(f"line {i}: tts and zh do not have the same words")
        for k in ("pre", "after"):
            if l.get(k, 0) < 0: fail(f"line {i}: {k} cannot be negative")
        c = l.get("card")
        if c is not None and not (c.get("zh") and c.get("en")): fail(f"line {i}: a card needs zh and en")
    for s in sorted({l["scene"] for l in lines}):
        if s not in scenes or not scenes[s].get("time"): fail(f"scene {s} has no time in the lines file's scenes")
    for k in list(SAY) + list(CARD_DELAY):
        if k not in seen: fail(f"SAY / CARD_DELAY names line {k}, which is not in the lines file")
    for k in SEG_WORD:
        if k not in {l["scene"] for l in lines}: fail(f"SEG_WORD names scene {k}, which is not in the lines file")
    global GAP, LEAD
    GAP, LEAD = float(j.get("gap", GAP)), float(j.get("lead", LEAD))
    for k, v in j.get("trim", {}).items():
        if k not in seen: fail(f"trim names line {k}, which is not in the lines file")
        TRIM[k] = float(v)
    return lines, sp, scenes


def say_of(l, rate):
    """placeholder: how long the line takes to say (a "trim" of the lines file cuts it, as assemble.py cuts the clip)"""
    t = SAY[l["id"]] if l["id"] in SAY else max(MIN_SAY, cjk(l["zh"]) / rate + HOLD_DASH * l["zh"].count("——") + HOLD_DOTS * l["zh"].count("……"))
    return min(t, TRIM.get(l["id"], math.inf))


def layout(lines, rate):
    """the placeholder: the clips laid out as assemble.py lays them"""
    t, rows = LEAD, []
    for i, l in enumerate(lines):
        if i: t += GAP
        t += l.get("pre", 0)
        d = say_of(l, rate)
        rows.append({"line": l["n"], "id": l["id"], "who": l["who"], "text": l["zh"], "start": r3(t), "end": r3(t + d)})
        t += d + l.get("after", 0)
    frames = frame(t + TAIL_S)
    return rows, frames


# ---------------------------------------------------------------------------------------------------- caption groups
def phrases_of(text):
    """a line cut after every run of punctuation: [(phrase, break)] with break 'strong' (。！？), 'dots' (……), 'weak'
    (，、；：) or 'end' (the line's last phrase)"""
    out, cur, i = [], "", 0
    while i < len(text):
        c = text[i]
        cur += c
        if c in PUNCT and (i + 1 == len(text) or text[i + 1] not in PUNCT):
            tail = re.search(r"[" + re.escape(PUNCT) + r"]+$", cur).group(0)
            out.append([cur, "strong" if any(x in STRONG for x in tail) else "dots" if DOTS in tail else "weak"])
            cur = ""
        i += 1
    if cur: out.append([cur, "weak"])
    if out: out[-1][1] = "end"
    # a phrase wider than MAXW (none today) is cut into balanced pieces between Chinese characters
    res = []
    for p, b in out:
        if width(p) <= MAXW: res.append((p, b)); continue
        n = math.ceil(width(p) / MAXW); k = math.ceil(len(p) / n)
        for j in range(0, len(p), k): res.append((p[j:j + k], b if j + k >= len(p) else "none"))
    return res


END_COST = {"strong": 0, "end": 0, "dots": 2, "weak": 4, "none": 12}


def groups_of(n, text):
    """the caption groups of one line: the cut with the least cost (20 a group; a break after a comma 4, after …… 2,
    inside a word 12; a sentence end INSIDE a group 25; a group narrower than 3 characters 6), each group at most MAXW
    wide. Returns [(shown text, Chinese characters of the group)]."""
    ph = phrases_of(text)
    best = [(0, None)] + [(math.inf, None)] * len(ph)
    for i in range(1, len(ph) + 1):
        for j in range(i - 1, -1, -1):
            g = "".join(p for p, _ in ph[j:i])
            if width(g) > MAXW: break
            inner = sum(1 for _, b in ph[j:i - 1] if b == "strong")
            c = best[j][0] + 20 + END_COST[ph[i - 1][1]] + 25 * inner + (6 if width(g) < 3 else 0)
            if c < best[i][0]: best[i] = (c, j)
    cuts, i = [], len(ph)
    while i > 0: j = best[i][1]; cuts.append((j, i)); i = j
    out = []
    for j, i in reversed(cuts):
        raw = "".join(p for p, _ in ph[j:i])
        shown = re.sub(r"[，、；：。,;:]+$", "", raw)       # a group drops its closing ，、；：。 (keeps ！？…… and ——)
        if not strip(shown): fail(f"line {n}: the caption group {raw} has no Chinese character")
        out.append((shown, strip(raw)))
    if "".join(s for _, s in out) != strip(text): fail(f"line {n}: the caption groups do not spell the line")
    return out


def words_of(r, warn):
    """the line's word times when the timing file has them and they fit the line: [(start, end)] per character, else None"""
    ws = r.get("words")
    if not ws: return None
    n, s, e = r["line"], r["start"], r["end"]
    if "".join(w[0] for w in ws) != strip(r["text"]):
        warn.append(f"line {n}: \"words\" do not spell the line, placed by character count"); return None
    t = [(float(w[1]), float(w[2])) for w in ws]
    ok = all(a <= b + 1e-6 for a, b in t) and all(t[i][1] <= t[i + 1][0] + 1e-6 for i in range(len(t) - 1)) \
        and t[0][0] >= s - 0.005 and t[-1][1] <= e + 0.005
    if not ok:
        warn.append(f"line {n}: \"words\" are out of order or outside the line, placed by character count"); return None
    return t


def place(lines, rows, use_words=True):
    """caption groups and quotes of every line, in frames and seconds"""
    caps, quotes, warn = [], [], []
    for l, r in zip(lines, rows):
        n, s, e = r["line"], r["start"], r["end"]
        if r["text"] != l["zh"]: fail(f"line {n}: the timing file says {r['text']}, the lines file says {l['zh']}")
        tot = cjk(l["zh"])
        wt = words_of(r, warn) if use_words else None
        def when(k, side):
            """film second of the boundary after k characters: side 1 = character k starts, side 0 = character k - 1 ends"""
            if wt is None: return s + (e - s) * k / tot
            if k <= 0: return s
            if k >= tot: return e
            return wt[k][0] if side == 1 else wt[k - 1][1]
        acc, line_caps = 0, []
        for gi, (shown, han) in enumerate([] if l.get("silent") else groups_of(n, l["zh"])):   # a silent line: no caption
            k = len(han); a, b = when(acc, 1), when(acc + k, 0)
            at = [frame(when(acc + j, 1)) for j in range(k)]
            acc += k
            line_caps.append({"line": n, "k": gi, "seg": l["scene"], "who": l["who"], "text": shown, "a": a, "b": b, "at": at})
        for i, c in enumerate(line_caps):
            c["from"] = frame(s) if i == 0 else frame(c["a"])
            c["end"] = frame(e) if i == len(line_caps) - 1 else frame(c["b"]) - 1
            c["end"] = max(c["from"], c["end"])
            c["at"][0] = c["from"]
        caps += line_caps
        quotes.append((n, l["who"], r3(s), r3(e), strip(l["zh"])))
    return caps, quotes, warn


def finish(caps, lines, rows, total):
    """no two groups on one frame; how long each caption stays; the segments; the fact cards"""
    warn = []
    for a, b in zip(caps, caps[1:]):
        if b["from"] <= a["end"]: a["end"] = b["from"] - 1
        if a["end"] < a["from"]: fail(f"line {a['line']}: the caption group {a['text']} has no frame of its own")
    first, last = {}, {}
    for l in lines: first.setdefault(l["scene"], l["n"]); last[l["scene"]] = l["n"]
    ids = list(first)
    seg_from = {}
    for i, sc in enumerate(ids):
        l, r = lines[first[sc] - 1], rows[first[sc] - 1]
        if i == 0: seg_from[sc] = 0; continue
        if l.get("pre", 0) > 0 and sc not in SEG_WORD: seg_from[sc] = frame(r["start"] - l["pre"])
        else: seg_from[sc] = frame(r["start"]) - LEAD_CUT
        prev = rows[first[sc] - 2]
        if seg_from[sc] <= frame(prev["end"]): fail(f"segment {sc} would start on frame {seg_from[sc]}, inside line {prev['line']} (ends {frame(prev['end'])})")
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
        fr = frame(r["end"]) + 1 + frame(CARD_DELAY.get(l["id"], 0))
        to = fr + frame(l.get("card_hold") or l.get("after") or CARD_HOLD) - 1   # "card_hold" (s) overrides
        nx = rows[l["n"]] if l["n"] < len(rows) else None
        if nx is not None and to >= frame(nx["start"]): warn.append(f"the card after {l['id']} ({fr}-{to}) runs into line {nx['id']} (starts {frame(nx['start'])})")
        cards.append((l["n"], l["id"], fr, min(to, total - 1), l["card"]["zh"], l["card"]["en"]))
    return segs, cards, warn


TS_TAIL = '''export const CAPTIONS: CaptionGroup[] = RAW.map(([shot, from, to, text, line, k, end, , who]) => ({ shot, from, to, text, line, k, end, who }));
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
  if (CAPTIONS[i].from <= CAPTIONS[i - 1].to) throw new Error(`caption groups overlap at ${CAPTIONS[i].text}`);
}

// ------------------------------------------------------------------------------------------- beats from the captions
const BY_LINE: CaptionGroup[][] = [];
const AT_OF = new Map<CaptionGroup, number[]>();
CAPTIONS.forEach((c, i) => { (BY_LINE[c.line] || (BY_LINE[c.line] = [])).push(c); AT_OF.set(c, RAW[i][7]); });
/** a line given by its number (1-based) or its id ("A03") -> its number. Throws on an unknown id. */
export const lineNum = (l: number | string): number => {
  if (typeof l === "number") return l;
  const i = LINE_IDS.indexOf(l);
  if (i < 0) throw new Error(`line "${l}": no such line id (A01 .. ${LINE_IDS[LINE_IDS.length - 1]})`);
  return i + 1;
};
/** the caption groups of line `line` (its number or its id), in order */
export const capsOf = (line: number | string): CaptionGroup[] => BY_LINE[lineNum(line)] ?? [];
/** caption group k of line `line` (number or id): k counts from 0, a negative k from the end (cap("A07", -1)).
 *  .from = the frame the group is shown from = the frame its first syllable starts on. Throws when there is no such group. */
export const cap = (line: number | string, k: number): CaptionGroup => {
  const g = capsOf(line), c = g[k < 0 ? g.length + k : k];
  if (!c) throw new Error(`cap(${JSON.stringify(line)}, ${k}): the line has ${g.length} caption groups`);
  return c;
};
/** THE FRAME OF A WORD: the caption group of line `line` (number or id) that shows `word` (Chinese characters only), with
 *  `from` = the frame the word's FIRST syllable starts on: put the hit there. capWord("A12", "拍").from. When the word
 *  opens its group, it equals cap(line, k).from. `to`, `end`, `text` and `k` are the group's own. Survives a regrouping
 *  of the line. Throws when no group, or more than one, shows the word, or the word occurs twice in its group (give a
 *  longer word). */
export const capWord = (line: number | string, word: string): CaptionGroup => {
  const w = word.replace(/[^一-鿿]/g, "");
  if (!w) throw new Error(`capWord(${JSON.stringify(line)}, "${word}"): give Chinese characters`);
  const han = (c: CaptionGroup) => c.text.replace(/[^一-鿿]/g, "");
  const g = capsOf(line).filter((c) => han(c).includes(w));
  if (g.length !== 1) throw new Error(`capWord(${JSON.stringify(line)}, "${word}"): ${g.length} caption groups of the line show it`);
  const t = han(g[0]), i = t.indexOf(w);
  if (t.indexOf(w, i + 1) >= 0) throw new Error(`capWord(${JSON.stringify(line)}, "${word}"): it occurs twice in 「${t}」 (give a longer word)`);
  return { ...g[0], from: (AT_OF.get(g[0]) as number[])[i] };
};
'''


def write_ts(d, src, lines, rows, end_s, total, segs, caps, quotes, cards, scenes, speakers):
    js = lambda v: json.dumps(v, ensure_ascii=False)
    head = f"// GENERATED by scripts/qin/gen_timing.py from {src}: do not edit by hand.\n"
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "voice.ts"), "w", encoding="utf8") as f:
        f.write(head)
        f.write("/** who speaks a line: " + ", ".join(f"{k} {speakers[k]}" for k in SPEAKERS) + " (ji is the camera: never animated) */\n")
        f.write("export type Speaker = " + " | ".join(js(s) for s in SPEAKERS) + ";\n")
        f.write("/** \"placeholder\" = laid out by character count before the voice exists; \"voice\" = measured from the dialogue */\n")
        f.write(f"export const VOICE_SOURCE: \"placeholder\" | \"voice\" = {js('placeholder' if src.startswith('the placeholder') else 'voice')};\n")
        f.write("/** [line number, start s, end s, text] */\nexport const VOICE_RAW: [number, number, number, string][] = [\n")
        for r in rows: f.write(f"  [{r['line']}, {r['start']}, {r['end']}, {js(r['text'])}],\n")
        f.write("];\n")
        f.write("/** [line number, id, scene, who, pre s (silent beat before it, for action), after s (held after it)] (the lines file) */\n")
        f.write("export const LINE_RAW: [number, string, string, Speaker, number, number][] = [\n")
        for l in lines: f.write(f"  [{l['n']}, {js(l['id'])}, {js(l['scene'])}, {js(l['who'])}, {l.get('pre', 0)}, {l.get('after', 0)}],\n")
        f.write("];\n")
        f.write(f"export const VOICE_END_S = {end_s};\n")
        f.write("/** frames before the first word, frames of film after the last word, the film's length in frames */\n")
        f.write(f"export const VOICE_LEAD_F = {frame(rows[0]['start'])};\nexport const VOICE_TAIL_F = {total - frame(end_s)};\nexport const VOICE_TOTAL_F = {total};\n")
        f.write("/** each line is a quote of its speaker: [line, who, start s, end s, the words] */\n")
        f.write("export const QUOTE_RAW: [number, Speaker, number, number, string][] = [\n")
        for q in quotes: f.write(f"  [{q[0]}, {js(q[1])}, {q[2]}, {q[3]}, {js(q[4])}],\n")
        f.write("];\n")
        f.write("/** the build segments = the scenes: [id, first line, last line, first frame, last frame (inclusive)]; a scene starts\n"
                f" *  where its first line's silent beat (pre) starts ({LEAD_CUT} frames before its first word when it has none, and for\n *  {', '.join(sorted(SEG_WORD))}: that pre belongs to the scene before) */\n")
        f.write("export const SEGMENT_RAW: [string, number, number, number, number][] = [\n")
        for s in segs: f.write(f"  [{js(s[0])}, {s[1]}, {s[2]}, {s[3]}, {s[4]}],\n")
        f.write("];\n")
        f.write(f"/** the fact cards: [line, line id, first frame, last frame (inclusive), zh, en]: from the end of the line (+ CARD_DELAY) for\n *  the line's \"after\" seconds, else {CARD_HOLD} s */\n")
        f.write("export const CARD_RAW: [number, string, number, number, string, string][] = [\n")
        for c in cards: f.write(f"  [{c[0]}, {js(c[1])}, {c[2]}, {c[3]}, {js(c[4])}, {js(c[5])}],\n")
        f.write("];\n")
        f.write("/** each scene's 时辰 card text (the lines file's scenes) */\n")
        f.write("export const SCENE_RAW: [string, string][] = [\n")
        for s in segs: f.write(f"  [{js(s[0])}, {js(scenes[s[0]]['time'])}],\n")
        f.write("];\n")
    with open(os.path.join(d, "captions.ts"), "w", encoding="utf8") as f:
        f.write(head)
        f.write("// Caption groups: [segment, first frame, last frame shown (inclusive), text, line, index in the line, last frame of\n")
        f.write("// its speech, the frame each Chinese character starts on, speaker]. Cut automatically at punctuation, at most\n")
        f.write(f"// {MAXW} full-width characters. A caption stays up after its last syllable until the next one starts, at most {LINGER} frames,\n")
        f.write("// never across a segment's first frame. Drawn by the HUD's Caption (hud/), in the speaker's colour, no box.\n")
        f.write("import type { Speaker } from \"./voice\";\n")
        f.write("/** from..to = the frames the caption is shown; from..end = the frames its words are spoken; line = the line number\n")
        f.write(" *  (1-based), k = its index among that line's groups (0-based); shot = the segment letter; who = the speaker */\n")
        f.write("export type CaptionGroup = { from: number; to: number; text: string; shot: string; line: number; k: number; end: number; who: Speaker };\n")
        f.write("export type CaptionRun = { text: string; gold: boolean };\n")
        f.write(f"/** the widest caption group in full-width characters */\nexport const CAP_MAXW = {MAXW};\n")
        f.write("/** the line ids in order: LINE_IDS[n - 1] is line n's id */\n")
        f.write("export const LINE_IDS: string[] = " + js([l["id"] for l in lines]) + ";\n\n")
        f.write("type Raw = [shot: string, from: number, to: number, text: string, line: number, k: number, end: number, at: number[], who: Speaker];\n")
        f.write("const RAW: Raw[] = [\n")
        for c in caps:
            f.write(f"  [{js(c['seg'])}, {c['from']}, {c['to']}, {js(c['text'])}, {c['line']}, {c['k']}, {c['end']}, {js(c['at'])}, {js(c['who'])}],\n")
        f.write("];\n" + TS_TAIL)


def write_md(path, src, lines, rows, end_s, total, segs, caps, cards):
    o = [f"Source: {src}. Frames are 0-based at {FPS} fps; ranges are inclusive.", "",
         f"- Speech ends at {end_s} s = frame {frame(end_s)}; **film length {total} frames = {total / FPS:.3f} s** (last frame {total - 1}).",
         f"- {len(rows)} lines, {sum(cjk(r['text']) for r in rows)} 字, {len(caps)} caption groups, {len(cards)} fact cards.", "",
         "### Segments", "", "| Segment | Lines | First frame | Last frame | Frames | Seconds |", "|---|---|---|---|---|---|"]
    for s in segs: o.append(f"| {s[0]} | {s[1]}-{s[2]} | {s[3]} | {s[4]} | {s[4] - s[3] + 1} | {s[3] / FPS:.2f}-{(s[4] + 1) / FPS:.2f} |")
    o += ["", "### Lines", "", "| Line | Id | Who | Text | From | To | Pre | After | Caption groups `k from-end` |", "|---|---|---|---|---|---|---|---|---|"]
    for l, r in zip(lines, rows):
        cs = [c for c in caps if c["line"] == r["line"]]
        o.append(f"| {r['line']} | {l['id']} | {l['who']} | {r['text']} | {frame(r['start'])} | {frame(r['end'])} | {l.get('pre', 0)} | {l.get('after', 0)} | "
                 + "<br>".join(f"`{c['k']} {c['from']}-{c['end']}` {c['text']}" for c in cs) + " |")
    o += ["", "### Fact cards", "", "| After | From | To | Text |", "|---|---|---|---|"]
    for c in cards: o.append(f"| {c[1]} | {c[2]} | {c[3]} | {c[4]} |")
    open(path, "w", encoding="utf8").write("\n".join(o) + "\n")


def main():
    ap = argparse.ArgumentParser(description="dialogue timing -> voice.ts + captions.ts (Qin)")
    ap.add_argument("timing", nargs="?", help="voice_timing.json from scripts/qin/voice/assemble.py")
    ap.add_argument("--placeholder", action="store_true", help="lay the lines out by character count instead")
    ap.add_argument("--rate", type=float, default=RATE, help=f"placeholder only: Chinese characters a second (default {RATE})")
    ap.add_argument("--no-words", action="store_true", help="real voice: place the caption groups by character count, not by the word times")
    ap.add_argument("--lines", default=os.path.join(ROOT, "scripts/qin/voice/qin_lines.json"))
    ap.add_argument("--out", default=os.path.join(ROOT, "src/videos/qin"), help="folder for voice.ts and captions.ts")
    ap.add_argument("--json", help="placeholder only: also write the layout as a voice_timing.json")
    ap.add_argument("--md", help="also write the timing as markdown tables")
    a = ap.parse_args()
    if a.placeholder == bool(a.timing): fail("give a voice_timing.json or --placeholder (not both)")
    lines, speakers, scenes = load_lines(a.lines)
    if a.placeholder:
        if a.rate <= 0: fail("--rate must be more than 0")
        rows, total = layout(lines, a.rate); end_s = rows[-1]["end"]
        src = f"the placeholder layout ({a.rate:g} characters a second, {GAP} s between lines, lead {LEAD} s)"
        if a.json:
            json.dump({"voice": "placeholder", "rate": a.rate, "gap": GAP, "lead": LEAD, "speech_end": end_s, "frames": total,
                       "tail_f": total - frame(end_s), "lines": rows}, open(a.json, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    else:
        if a.json or a.rate != RATE: fail("--json and --rate are for --placeholder")
        j = json.load(open(a.timing, encoding="utf8")); rows = j["lines"]
        if len(rows) != len(lines): fail(f"{len(rows)} lines in {a.timing}, {len(lines)} in the lines file")
        for i, (r, l) in enumerate(zip(rows, lines), 1):
            if r["line"] != i: fail(f"timing rows must be lines 1..n in order, got {r['line']} at place {i}")
            if "id" in r and r["id"] != l["id"]: fail(f"line {i}: the timing file says id {r['id']}, the lines file {l['id']}")
            if i > 1 and r["start"] < rows[i - 2]["end"]: fail(f"line {i} starts before line {i - 1} ends")
            if r["end"] <= r["start"]: fail(f"line {i} ends before it starts")
        end_s = j.get("speech_end", rows[-1]["end"])
        if "frames" in j: total = int(j["frames"])
        elif "tail_f" in j: total = frame(end_s) + int(j["tail_f"])
        else: total = frame(end_s + lines[-1].get("after", 0) + TAIL_S)
        if total <= frame(end_s): fail(f"the film ({total} frames) ends before the speech (frame {frame(end_s)})")
        src = f"the recorded dialogue ({os.path.basename(a.timing)})"
    caps, quotes, warn = place(lines, rows, use_words=not a.no_words)
    segs, cards, w2 = finish(caps, lines, rows, total)
    warn += w2
    write_ts(a.out, src, lines, rows, end_s, total, segs, caps, quotes, cards, scenes, speakers)
    if a.md: write_md(a.md, src, lines, rows, end_s, total, segs, caps, cards)
    for c in caps:
        if c["to"] - c["from"] + 1 < 9: warn.append(f"line {c['line']} group {c['k']} {c['text']}: on screen for only {c['to'] - c['from'] + 1} frames")
    print(f"{src}\nlines {len(rows)}  captions {len(caps)}  cards {len(cards)}  speech end {end_s} s  frames {total} ({total / FPS:.3f} s)  first word f{frame(rows[0]['start'])}")
    print("segments  " + "  ".join(f"{s[0]} {s[3]}-{s[4]}" for s in segs))
    print("widest caption group: " + max((c["text"] for c in caps), key=width) + f" ({max(width(c['text']) for c in caps):g})")
    for w in warn: print("WARNING", w)
    print("wrote", os.path.join(a.out, "voice.ts"), os.path.join(a.out, "captions.ts"), *(x for x in (a.json, a.md) if x))


main()
