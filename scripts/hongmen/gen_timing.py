#!/usr/bin/env python3
"""Writes src/videos/hongmen/voice.ts and captions.ts from the narration's line timing (script v4, 22 lines).

  gen_timing.py --placeholder                        the frozen bring-up timing: no voice needed
  gen_timing.py <voice_timing.json>                  the real narration (written by the voice assembler)
  options: --lines <hongmen_lines.json>  --rate 5.4  --lead 3  --tail 12  --out <dir>  --json <timing.json>  --md <table.md>
           --no-words (real voice only: ignore the word times, place the groups by character count)

voice_timing.json: {"lines": [{"line": 1, "text": "...", "start": s, "end": s, "cuts": [s], "holds": [s],
                               "words": [["他", s, s], ...]}, ...], "speech_end": s, "tail_f": n}
  seconds from the first frame of the film. "cuts" (only on a line that has a hold_before in the lines file): the film
  second at which the speech starts again after each silent beat. "holds" (optional): how long each beat is; without it
  the length in the lines file is used.
  "words" (optional): one [character, start s, end s] per Chinese character of the line, in order. With it a caption
  group (and a quote) starts where its first character starts and ends where its last character ends; without it,
  or with --no-words, the groups are placed in proportion to the characters before them.
  "tail_f" (optional): the frames of film after "speech_end". The narration that loops is cut so that the end of the
  track + its head is the comma of 「至于刘邦，他靠…」: the film MUST be speech_end + tail_f long, so --tail is only
  needed to overrule it.

--placeholder lays the lines out at RATE characters a second with GAP between lines, plus what the lines file asks for:
  hold_before (0.20 s before 「生的。」 inside line 15), hold_after (0.25 s after line 9, 0.30 s after line 21) and
  shot_min_f (line 1: the privy shot is at least 78 frames, so line 2 waits).
  --lead N = silent frames before the first word. Default 3: the film opens on the gesture and 「他」 starts on frame 3.
  With a real voice the lead is whatever the narration file starts with (0.1 s of silence).
  --tail N = frames of film after the last word. Default: "tail_f" of the timing file, else 12 (the placeholder:
  「至于刘邦，」 + 12 frames + frame 0).
  --json also writes the layout as a voice_timing.json, the slots a later narration is fitted into.
  A hold_before may carry "say_s": the seconds the words after the beat get, instead of characters / RATE (a deadpan
  「生的。」 is spoken slower than the run of the line).

How a line is cut into caption groups: the CAP table below. A group's frames are placed in proportion to the Chinese
characters before it (pauses inside a line are squeezed out in the edit, so the rate inside a line is nearly even),
separately on each side of a "cuts" time, so a group that follows a silent beat starts exactly where the speech does.
Every group carries its line number and its index in the line: shots ask cap(line, k) or capWord(line, "生的") for a
frame instead of typing frame numbers."""
import argparse, json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FPS = 30
RATE = 5.4        # placeholder: Chinese characters a second
GAP = 0.06        # placeholder: silence between two lines, s
LEAD = 3          # placeholder: silent frames before the first word (the opening gesture is already running)
TAIL = 12         # frames of film after the last word (then the film loops to frame 0)
LINGER = 12       # a caption stays up to this many frames after its last syllable, or until the next one starts
MAXLEN = 10       # width of one caption group in full-width characters, punctuation included (one line of 64 px type)
LEAD_CUT = 2      # a segment starts this many frames before its first word

# One entry per narration line: its caption groups. 【】 = the gold key words (the brackets are not drawn).
# A group is "text", or ("text", who) when it is a character's own words (who = a key of PEOPLE in people.ts), or a
# list of such pieces when the narrator's word and the quote share one caption.
# The groups of a line, joined and stripped to their Chinese characters, must equal the line's text (checked).
# Size: at most 10 full-width characters, cut where the phrase breaks; a word that is a hit in the picture starts its
# own group (【必须死】, 【曹无伤】说的, 【生的】) so the hit has a frame.
# Punctuation: a group drops its closing ，。：； except where the full stop is the joke (生的。), inside a quote's last
# group, and on the last line (至于刘邦，: the comma says the sentence goes on, into the loop). Next to a quote mark
# write the ASCII ! ? and : (the full-width ！ ？ and ： leave a half-character hole beside ” and “: seen on a sheet).
# Gold: the hook and its pay-off (上厕所, 暗杀, 只死了一个人, 不在席上), the numbers (四十万, 十万, 三次, 一匹马), the
# informer thread (告密, 小人, 曹无伤, 说漏), each name the first time the narrator says it (刘邦 3, 项羽 4, 叔叔 7,
# 范增 10, 樊哙 14), the words the picture stamps (鸿门宴, 亲家, 舞剑, 刀俎, 鱼肉) and the deadpan beats (必须死,
# 没反应, 生的, 喝多了).
CAP = [
 ["他靠【上厕所】", "躲过了一场【暗杀】"],                                                                   # 1
 ["这顿饭叫【鸿门宴】", "满屋刀剑", "最后【只死了一个人】", "还【不在席上】"],                               # 2
 ["秦朝刚灭亡", "【刘邦】抢先", "打下了都城"],                                                               # 3
 ["可【项羽】强得多", "【四十万】大军", "对他【十万】"],                                                     # 4
 ["刘邦手下有个军官", "向项羽【告密】", ("“刘邦想称王。”", "caoWushang")],                                   # 5
 ["项羽大怒", ("“明天就打他!”", "xiangYu")],                                                                # 6
 ["当晚", "项羽的【叔叔】", "跑来报信", "刘邦当场和他", "约为【亲家】"],                                     # 7
 ["第二天一早", "刘邦上门赔罪", ("“一定是”", "liuBang"), ("“有【小人】挑拨。”", "liuBang")],                 # 8
 ["项羽张口就说", ("“是你手下”", "xiangYu"), ("“【曹无伤】说的。”", "xiangYu")],                             # 9
 ["项羽留刘邦喝酒", "可项羽的谋士【范增】", "认定刘邦", "【必须死】"],                                       # 10
 ["范增【三次】举起玉佩", "催项羽动手", "项羽【没反应】"],                                                   # 11
 ["范增就叫人", "进来【舞剑】", "想趁机刺死刘邦"],                                                           # 12
 ["项羽的叔叔", "也下场舞剑", "用身子挡着【亲家】"],                                                         # 13
 ["刘邦的保镖【樊哙】", "撞倒卫兵", "冲了进来"],                                                             # 14
 ["项羽夸他是壮士", "赏他一条猪腿", "【生的】。"],                                                           # 15
 ["刘邦起身去【上厕所】", "把樊哙也叫了出去"],                                                               # 16
 ["刘邦说还没告辞", "樊哙说", ("“人为【刀俎】”", "fanKuai"), ("“我为【鱼肉】”", "fanKuai"), ("“告什么辞!”", "fanKuai")],   # 17
 ["刘邦丢下车队", "只骑【一匹马】", "抄小路回了军营"],                                                       # 18
 ["等刘邦到了军营", "他的谋士才进去说", ("“他【喝多了】。”", "zhangLiang")],                                 # 19
 ["刘邦回营第一件事", "杀了【曹无伤】", "那个【告密】的军官"],                                               # 20
 ["而这个名字", "是项羽自己【说漏】的"],                                                                     # 21
 ["至于刘邦，"],                                                                                             # 22
]
# the five build segments: A = lines 1-4 (the first 15 seconds), B = 5-9, C = 10-13, D = 14-17, E = 18-22
SEG_OF = lambda n: "A" if n <= 4 else "B" if n <= 9 else "C" if n <= 13 else "D" if n <= 17 else "E"
# who may speak a quote: keys of PEOPLE in src/videos/hongmen/people.ts (曹无伤 the informer, 项羽, 刘邦, 樊哙, 张良)
SPEAKERS = ["caoWushang", "xiangYu", "liuBang", "fanKuai", "zhangLiang"]

cjk = lambda s: len(re.findall(r"[一-鿿]", s))
strip = lambda s: re.sub(r"[^一-鿿]", "", s)
plain = lambda s: s.replace("【", "").replace("】", "")
width = lambda s: sum(0.5 if c in "“”" or ord(c) < 128 else 1 for c in plain(s))   # “ ” and ASCII marks are half as wide
frame = lambda s: int(math.floor(s * FPS + 0.5))      # the same rounding as Math.round in story.ts
r3 = lambda s: round(s + 1e-9, 3)


def fail(msg):
    sys.exit("gen_timing: " + msg)


def load_lines(path):
    j = json.load(open(path, encoding="utf8"))
    lines = j["lines"]
    if len(lines) != len(CAP): fail(f"{len(lines)} lines in {path}, {len(CAP)} entries in CAP")
    for i, l in enumerate(lines, 1):
        if l["id"] != i: fail(f"line ids must run 1..n, got {l['id']} at place {i}")
        for k in ("tts", "alt"):
            if k in l and cjk(l[k]) != cjk(l["text"]): fail(f"line {i}: {k} has {cjk(l[k])} characters, text has {cjk(l['text'])}")
        if l.get("shot_min_f", 0) < 0 or l.get("hold_after", 0) < 0: fail(f"line {i}: shot_min_f and hold_after cannot be negative")
        for q in l.get("quotes", []):
            if q["who"] not in SPEAKERS or j["speakers"].get(q["who"]) != q["name"]: fail(f"line {i}: unknown speaker {q}")
            if q["text"] not in l["text"]: fail(f"line {i}: the quote {q['text']} is not in the line")
        for h in l.get("hold_before", []):
            if l["text"].count(h["at"]) != 1: fail(f"line {i}: hold_before at {h['at']} must occur exactly once in the line")
    lp = j.get("loop")
    if lp:      # the film loops: the last line + the first line are one recorded sentence
        a, b = lp["lines"]
        if (a, b) != (len(lines), 1): fail(f"loop: lines must be [{len(lines)}, 1], got {lp['lines']}")
        if lines[a - 1]["text"] + lines[b - 1]["text"] != lp["record"]: fail("loop: record must be the last line followed by the first line")
        if lines[a - 1]["text"] != lp["cut_after"]: fail("loop: cut_after must be the last line")
    return lines


def layout(lines, lead_f, RATE=RATE):
    """the placeholder: every line at RATE with GAP between lines, the script's silences added"""
    t, rows = lead_f / FPS, []
    for l in lines:
        n, tx = l["id"], l["text"]
        cut_in = 0 if not rows else frame(t) - LEAD_CUT        # the frame this line's picture starts on
        start, at, cuts, holds, say = t, 0, [], [], None
        for h in l.get("hold_before", []):
            k = cjk(tx[:tx.index(h["at"])])
            t += (say if say is not None else (k - at) / RATE) + h["s"]; at = k
            cuts.append(r3(t)); holds.append(h["s"])
            say = h.get("say_s")      # optional: how long the words after this beat take, instead of characters / RATE
        t += say if say is not None else (cjk(tx) - at) / RATE
        row = {"line": n, "text": tx, "start": r3(start), "end": r3(t), "rate": RATE}
        if cuts: row["cuts"] = cuts; row["holds"] = holds
        rows.append(row)
        t += l.get("hold_after", GAP)
        # shot_min_f: the next line's cut (LEAD_CUT frames before its first word) comes no earlier than this
        if "shot_min_f" in l: t = max(t, (cut_in + l["shot_min_f"] + LEAD_CUT) / FPS)
    return rows


def pieces_of(n, groups):
    """[(group index, text, who or None)] for one line, and the checks on the CAP entry"""
    out = []
    for gi, g in enumerate(groups):
        ps = g if isinstance(g, list) else [g]
        shown = "".join(p if isinstance(p, str) else p[0] for p in ps)
        if width(shown) > MAXLEN: fail(f"line {n}: the caption group {shown} is {width(shown)} characters wide (at most {MAXLEN})")
        if shown.count("【") != shown.count("】") or re.search(r"【[^】]*【", shown): fail(f"line {n}: unbalanced 【】 in {shown}")
        for p in ps:
            tx, who = (p, None) if isinstance(p, str) else p
            if who is not None and who not in SPEAKERS: fail(f"line {n}: unknown speaker {who}")
            if cjk(tx) == 0: fail(f"line {n}: the piece {tx} has no Chinese character")
            out.append((gi, tx, who))
    return out


def words_of(l, r, warn):
    """the line's word times when the timing file has them and they fit the line: [(start, end)] per character, else None"""
    ws = r.get("words")
    if not ws: return None
    n, s, e = r["line"], r["start"], r["end"]
    if "".join(w[0] for w in ws) != strip(l["text"]):
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
    place.far = []          # (line, group text, frames between the word time and the place by character count)
    for l, r, groups in zip(lines, rows, CAP):
        n, s, e = r["line"], r["start"], r["end"]
        if r["text"] != l["text"]: fail(f"line {n}: the timing file says {r['text']}, the lines file says {l['text']}")
        ps = pieces_of(n, groups)
        if strip("".join(p[1] for p in ps)) != strip(l["text"]): fail(f"line {n}: the caption groups read {''.join(p[1] for p in ps)}, the line is {l['text']}")
        # the quotes of the CAP entry must be the quotes of the lines file, in order
        # (a narrator piece between two quotes of one speaker closes the first quote)
        said, open_who = [], None
        for _, tx, who in ps:
            if who is None: open_who = None; continue
            if who == open_who: said[-1][1] += strip(tx)
            else: said.append([who, strip(tx)]); open_who = who
        want = [[q["who"], strip(q["text"])] for q in l.get("quotes", [])]
        if said != want: fail(f"line {n}: quotes in CAP {said} are not the quotes of the lines file {want}")
        # the spans of even speech: one for the whole line, or one on each side of a silent beat
        tot = cjk(l["text"])
        holds = l.get("hold_before", [])
        marks = [cjk(l["text"][:l["text"].index(h["at"])]) for h in holds]        # characters spoken before each beat
        if any(m <= 0 or m >= tot for m in marks): fail(f"line {n}: a hold_before must have words on both sides")
        cuts = r.get("cuts")
        if holds and not cuts:
            warn.append(f"line {n}: no \"cuts\" in the timing file, so {holds[0]['at']} is placed by character count, not where the speech starts")
            spans = [(0, tot, s, e)]
        elif cuts and not holds:
            fail(f"line {n}: the timing file has \"cuts\" but the lines file has no hold_before for this line")
        elif cuts:
            if len(cuts) != len(holds): fail(f"line {n}: {len(cuts)} cuts in the timing file, {len(holds)} hold_before in the lines file")
            hl = r.get("holds", [h["s"] for h in holds])
            spans, c0, t0 = [], 0, s
            for m, c, h in zip(marks, cuts, hl):
                if not (t0 < c - h < c < e): fail(f"line {n}: the cut at {c} s (hold {h} s) is not inside the line {s}..{e}")
                spans.append((c0, m, t0, c - h)); c0, t0 = m, c
            spans.append((c0, tot, t0, e))
        else:
            spans = [(0, tot, s, e)]
        def by_count(k, side):
            """film second of the boundary after k characters; on a beat, side 0 = where speech stops, 1 = where it resumes"""
            for c0, c1, a, b in spans:
                if c0 <= k <= c1 and not (k == c1 and side == 1 and c1 != tot) and not (k == c0 and side == 0 and c0 != 0):
                    return a + (b - a) * (k - c0) / (c1 - c0)
            raise AssertionError((n, k, side, spans))
        wt = words_of(l, r, warn) if use_words else None
        def when(k, side):
            """the same from the word times, when the line has them: side 1 = character k starts, side 0 = character k - 1 ends"""
            if wt is None: return by_count(k, side)
            if k <= 0: return s
            if k >= tot: return e
            return wt[k][0] if side == 1 else wt[k - 1][1]
        # every beat must fall between two caption groups
        acc, bounds = 0, set()
        for i, (gi, tx, who) in enumerate(ps):
            if i == 0 or ps[i - 1][0] != gi: bounds.add(acc)
            acc += cjk(tx)
        for m, h in zip(marks, holds):
            if m not in bounds: fail(f"line {n}: the hold before {h['at']} is inside a caption group; start a group there")
        # place the pieces
        acc, line_caps, qs, open_who = 0, [], [], None
        for gi, tx, who in ps:
            k = cjk(tx); a, b = when(acc, 1), when(acc + k, 0); acc += k
            if line_caps and line_caps[-1]["k"] == gi: line_caps[-1]["b"] = b; line_caps[-1]["text"] += tx
            else:
                line_caps.append({"line": n, "k": gi, "seg": SEG_OF(n), "text": tx, "a": a, "b": b})
                if wt is not None: place.far.append((n, plain(tx), frame(a) - frame(by_count(acc - k, 1))))
            if who is None: open_who = None
            elif who == open_who: qs[-1][3] = b; qs[-1][4] += strip(tx)
            else: qs.append([n, who, a, b, strip(tx)]); open_who = who
        for i, c in enumerate(line_caps):
            c["from"] = frame(s) if i == 0 else frame(c["a"])
            c["end"] = frame(e) if i == len(line_caps) - 1 else frame(c["b"]) - 1
            c["end"] = max(c["from"], c["end"])
        caps += line_caps
        quotes += [(q[0], q[1], r3(q[2]), r3(q[3]), q[4]) for q in qs]
    return caps, quotes, warn


def finish(caps, rows, end_s, tail, lines):
    """no two groups on one frame; how long each caption stays; the segments; the film length"""
    total = frame(end_s) + tail
    for a, b in zip(caps, caps[1:]):
        if b["from"] <= a["end"]: a["end"] = b["from"] - 1
        if a["end"] < a["from"]: fail(f"line {a['line']}: the caption group {a['text']} has no frame of its own")
    first = {}
    for r in rows: first.setdefault(SEG_OF(r["line"]), r["line"])
    last = {SEG_OF(r["line"]): r["line"] for r in rows}
    ids = list(first)
    seg_from = {s: 0 if i == 0 else frame(rows[first[s] - 1]["start"]) - LEAD_CUT for i, s in enumerate(ids)}
    segs = [(s, first[s], last[s], seg_from[s], (seg_from[ids[i + 1]] if i + 1 < len(ids) else total) - 1) for i, s in enumerate(ids)]
    for i, c in enumerate(caps):
        if i + 1 == len(caps): c["to"] = total - 1; continue          # the last words stay up to the loop point
        nx = caps[i + 1]
        to = min(nx["from"] - 1, c["end"] + LINGER)
        if nx["seg"] != c["seg"]: to = min(to, seg_from[nx["seg"]] - 1)      # not across the cut into the next segment
        if nx["line"] != c["line"] and lines[c["line"] - 1].get("cut_after"): to = min(to, nx["from"] - LEAD_CUT - 1)   # nor a declared cut
        c["to"] = max(c["end"], to)
    return total, segs


TS_TAIL = '''export const CAPTIONS: CaptionGroup[] = RAW.map(([shot, from, to, text, line, k, end]) => ({ shot, from, to, text, line, k, end }));
export const captionAt = (f: number): CaptionGroup | null => {
  let lo = 0, hi = CAPTIONS.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, c = CAPTIONS[m];
    if (f < c.from) hi = m - 1; else if (f > c.to) lo = m + 1; else return c;
  }
  return null;
};
/** "他靠【上厕所】" -> [{text: "他靠", gold: false}, {text: "上厕所", gold: true}] */
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
for (const c of CAPTIONS) (BY_LINE[c.line] || (BY_LINE[c.line] = [])).push(c);
/** the caption groups of narration line `line` (1-based), in order */
export const capsOf = (line: number): CaptionGroup[] => BY_LINE[line] ?? [];
/** caption group k of line `line`: k counts from 0, a negative k from the end (cap(10, -1) = 【必须死】).
 *  .from = the frame its first syllable starts on: put the hit there. Throws when the line has no such group. */
export const cap = (line: number, k: number): CaptionGroup => {
  const g = capsOf(line), c = g[k < 0 ? g.length + k : k];
  if (!c) throw new Error(`cap(${line}, ${k}): line ${line} has ${g.length} caption groups`);
  return c;
};
/** the one caption group of line `line` that shows `word` (capWord(15, "生的")): survives a regrouping of the line.
 *  Throws when no group, or more than one, shows it. */
export const capWord = (line: number, word: string): CaptionGroup => {
  const g = capsOf(line).filter((c) => c.text.replace(/[【】]/g, "").includes(word));
  if (g.length !== 1) throw new Error(`capWord(${line}, "${word}"): ${g.length} caption groups of line ${line} show it`);
  return g[0];
};
'''


def write_ts(d, src, rows, end_s, total, tail, segs, caps, quotes):
    js = lambda v: json.dumps(v, ensure_ascii=False)
    head = f"// GENERATED by scripts/hongmen/gen_timing.py from {src}: do not edit by hand.\n"
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "voice.ts"), "w", encoding="utf8") as f:
        f.write(head)
        f.write("/** who speaks a quote: a key of PEOPLE in people.ts */\n")
        f.write("export type Speaker = " + " | ".join(js(s) for s in SPEAKERS) + ";\n")
        f.write("/** \"placeholder\" = laid out by character count before the voice exists; \"voice\" = measured from the narration */\n")
        f.write(f"export const VOICE_SOURCE: \"placeholder\" | \"voice\" = {js('placeholder' if src.startswith('the placeholder') else 'voice')};\n")
        f.write("/** [line number, start s, end s, text] */\nexport const VOICE_RAW: [number, number, number, string][] = [\n")
        for r in rows: f.write(f"  [{r['line']}, {r['start']}, {r['end']}, {js(r['text'])}],\n")
        f.write("];\n")
        f.write(f"export const VOICE_END_S = {end_s};\n")
        f.write("/** frames before the first word, frames of film after the last word, the film's length in frames */\n")
        f.write(f"export const VOICE_LEAD_F = {frame(rows[0]['start'])};\nexport const VOICE_TAIL_F = {tail};\nexport const VOICE_TOTAL_F = {total};\n")
        f.write("/** a character's own words inside a line: [line, who, start s, end s, the words] */\n")
        f.write("export const QUOTE_RAW: [number, Speaker, number, number, string][] = [\n")
        for q in quotes: f.write(f"  [{q[0]}, {js(q[1])}, {q[2]}, {q[3]}, {js(q[4])}],\n")
        f.write("];\n")
        f.write(f"/** the build segments: [id, first line, last line, first frame, last frame (inclusive)]; a segment starts\n *  {LEAD_CUT} frames before its first word */\n")
        f.write("export const SEGMENT_RAW: [string, number, number, number, number][] = [\n")
        for s in segs: f.write(f"  [{js(s[0])}, {s[1]}, {s[2]}, {s[3]}, {s[4]}],\n")
        f.write("];\n")
    with open(os.path.join(d, "captions.ts"), "w", encoding="utf8") as f:
        f.write(head)
        f.write("// Caption groups: [segment, first frame, last frame shown (inclusive), text, line, index in the line, last frame of\n")
        f.write("// its speech]. 【】 marks the gold key words (the brackets are not drawn). Drawn by <Caption> in Film.tsx.\n")
        f.write(f"// A caption stays up after its last syllable until the next one starts, at most {LINGER} frames; the last one stays to the last frame (the loop point).\n")
        f.write("/** from..to = the frames the caption is shown; from..end = the frames its words are spoken; line = the narration\n")
        f.write(" *  line (1-based), k = its index among that line's groups (0-based); shot = the segment letter */\n")
        f.write("export type CaptionGroup = { from: number; to: number; text: string; shot: string; line: number; k: number; end: number };\n")
        f.write("export type CaptionRun = { text: string; gold: boolean };\n\n")
        f.write("const RAW: [string, number, number, string, number, number, number][] = [\n")
        for c in caps: f.write(f"  [{js(c['seg'])}, {c['from']}, {c['to']}, {js(c['text'])}, {c['line']}, {c['k']}, {c['end']}],\n")
        f.write("];\n" + TS_TAIL)


def write_md(path, src, rows, end_s, total, tail, segs, caps, quotes):
    bold = lambda t: re.sub(r"【([^】]*)】", r"**\1**", t)
    keys = lambda t: re.findall(r"【([^】]*)】", t)
    o = [f"Source: {src}. Frames are 0-based at {FPS} fps; ranges are inclusive.", ""]
    o += [f"- Speech ends at {end_s} s = frame {frame(end_s)}; tail {tail} frames; **film length {total} frames = {total / FPS:.3f} s** (last frame {total - 1}).",
          f"- First word on frame {frame(rows[0]['start'])}. {len(rows)} lines, {sum(cjk(r['text']) for r in rows)} 字, {len(caps)} caption groups, {len(quotes)} quotes.", ""]
    o += ["### Segments", "", "| Segment | Lines | First frame | Last frame | Frames | Seconds |", "|---|---|---|---|---|---|"]
    for s in segs: o.append(f"| {s[0]} | {s[1]}-{s[2]} | {s[3]} | {s[4]} | {s[4] - s[3] + 1} | {s[3] / FPS:.2f}-{(s[4] + 1) / FPS:.2f} |")
    o += ["", "### Lines", "", "Caption groups: `k from-end` then the text, gold words in bold. `from` = the frame the group's first syllable starts on (put the hit there), `end` = the last frame of its speech.", "",
          "| Line | Seg | Text | Start | End | Frames | Seconds | Caption groups: `k from-end` text | Key words |", "|---|---|---|---|---|---|---|---|---|"]
    for r in rows:
        cs = [c for c in caps if c["line"] == r["line"]]
        f0, f1 = frame(r["start"]), frame(r["end"])
        o.append(f"| {r['line']} | {SEG_OF(r['line'])} | {r['text']} | {f0} | {f1} | {f1 - f0 + 1} | {r['start']}-{r['end']} | "
                 + "<br>".join(f"`{c['k']} {c['from']}-{c['end']}` {bold(c['text'])}" for c in cs) + " | " + "、".join(w for c in cs for w in keys(c["text"])) + " |")
    o += ["", "### Quotes (lip-sync)", "", "| Line | Who | Start s | End s | First frame | Last frame | Words | Syllables |", "|---|---|---|---|---|---|---|---|"]
    for q in quotes: o.append(f"| {q[0]} | {q[1]} | {q[2]} | {q[3]} | {frame(q[2])} | {frame(q[3])} | {q[4]} | {len(q[4])} |")
    o += ["", "### Silences longer than a line gap", "", "| Where | From frame | To frame | Frames |", "|---|---|---|---|"]
    for a, b in zip(caps, caps[1:]):
        if b["from"] - a["end"] - 1 >= 5: o.append(f"| after {plain(a['text'])} (line {a['line']}), before {plain(b['text'])} (line {b['line']}) | {a['end'] + 1} | {b['from'] - 1} | {b['from'] - a['end'] - 1} |")
    open(path, "w", encoding="utf8").write("\n".join(o) + "\n")


def main():
    ap = argparse.ArgumentParser(description="narration timing -> voice.ts + captions.ts (Hongmen)")
    ap.add_argument("timing", nargs="?", help="voice_timing.json from the voice assembler")
    ap.add_argument("--placeholder", action="store_true", help="lay the lines out by character count instead")
    ap.add_argument("--lead", type=int, default=None, help=f"placeholder only: silent frames before the first word (default {LEAD})")
    ap.add_argument("--rate", type=float, default=RATE, help=f"placeholder only: Chinese characters a second (default {RATE})")
    ap.add_argument("--tail", type=int, default=None, help=f"frames of film after the last word (default: tail_f of the timing file, else {TAIL})")
    ap.add_argument("--no-words", action="store_true", help="real voice: place the caption groups by character count, not by the word times")
    ap.add_argument("--lines", default=os.path.join(ROOT, "scripts/hongmen/voice/hongmen_lines.json"))
    ap.add_argument("--out", default=os.path.join(ROOT, "src/videos/hongmen"), help="folder for voice.ts and captions.ts")
    ap.add_argument("--json", help="placeholder only: also write the layout as a voice_timing.json")
    ap.add_argument("--md", help="also write the timing as markdown tables")
    a = ap.parse_args()
    if a.placeholder == bool(a.timing): fail("give a voice_timing.json or --placeholder (not both)")
    if (a.lead or 0) < 0 or (a.tail or 0) < 0: fail("--lead and --tail are frame counts, 0 or more")
    lines = load_lines(a.lines)
    if a.placeholder:
        lead = LEAD if a.lead is None else a.lead
        if a.rate <= 0: fail("--rate must be more than 0")
        rows = layout(lines, lead, a.rate); end_s = rows[-1]["end"]
        if a.tail is None: a.tail = TAIL
        src = f"the placeholder layout ({a.rate:g} characters a second, {GAP} s between lines, lead {lead} frames)"
        if a.json:
            json.dump({"voice": "placeholder", "rate": a.rate, "gap": GAP, "lead": r3(lead / FPS), "speech_end": end_s, "lines": rows},
                      open(a.json, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    else:
        if a.lead is not None: fail("--lead is for --placeholder; with a real voice put the silence at the head of the narration file")
        if a.json or a.rate != RATE: fail("--json and --rate are for --placeholder")
        j = json.load(open(a.timing, encoding="utf8")); rows = j["lines"]
        if len(rows) != len(CAP): fail(f"{len(rows)} lines in {a.timing}, {len(CAP)} entries in CAP")
        for i, r in enumerate(rows, 1):
            if r["line"] != i: fail(f"timing rows must be lines 1..n in order, got {r['line']} at place {i}")
            if i > 1 and r["start"] < rows[i - 2]["end"]: fail(f"line {i} starts before line {i - 1} ends")
        end_s = j.get("speech_end", rows[-1]["end"])
        if a.tail is None: a.tail = int(j.get("tail_f", TAIL))
        elif "tail_f" in j and a.tail != j["tail_f"]: print(f"WARNING --tail {a.tail} overrules the timing file's tail_f {j['tail_f']}: the loop's comma is no longer the take's own")
        if "frames" in j and frame(end_s) + a.tail != j["frames"]: print(f"WARNING the film comes out {frame(end_s) + a.tail} frames long, the narration track is {j['frames']} frames")
        src = f"the recorded narration ({os.path.basename(a.timing)})"
    caps, quotes, warn = place(lines, rows, use_words=not a.no_words)
    total, segs = finish(caps, rows, end_s, a.tail, lines)
    for l, r, nx in zip(lines, rows, rows[1:]):      # the shot lengths the lines file asks for
        if "shot_min_f" in l:
            got = frame(nx["start"]) - LEAD_CUT - (0 if r["line"] == 1 else frame(r["start"]) - LEAD_CUT)
            if got < l["shot_min_f"]: warn.append(f"line {r['line']}: its picture is {got} frames long, the lines file asks for {l['shot_min_f']} (line {nx['line']} starts too early)")
    write_ts(a.out, src, rows, end_s, total, a.tail, segs, caps, quotes)
    if a.md: write_md(a.md, src, rows, end_s, total, a.tail, segs, caps, quotes)
    short = [c for c in caps if c["to"] - c["from"] + 1 < 9]
    for c in short: warn.append(f"line {c['line']} group {c['k']} {plain(c['text'])}: on screen for only {c['to'] - c['from'] + 1} frames")
    print(f"{src}\nlines {len(rows)}  captions {len(caps)}  quotes {len(quotes)}  speech end {end_s} s  frames {total} ({total / FPS:.3f} s)  first word f{frame(rows[0]['start'])}")
    print("segments  " + "  ".join(f"{s[0]} {s[3]}-{s[4]}" for s in segs))
    for q in quotes: print("quote", *q)
    if place.far:
        d = [abs(x[2]) for x in place.far]
        print(f"caption groups placed by the word times: {len(d)}; against the place by character count: mean {sum(d) / len(d):.1f} frames, "
              + "largest " + ", ".join(f"{t} (line {n}) {v:+d}" for n, t, v in sorted(place.far, key=lambda x: -abs(x[2]))[:4]))
    for w in warn: print("WARNING", w)
    print("wrote", os.path.join(a.out, "voice.ts"), os.path.join(a.out, "captions.ts"), *(x for x in (a.json, a.md) if x))


main()
