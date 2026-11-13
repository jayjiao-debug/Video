#!/usr/bin/env python3
"""Writes src/videos/wanbi/voice.ts and captions.ts from the narration's line timing (《完璧归赵》, script v2, 23 lines).
A copy of scripts/hongmen/gen_timing.py; what is new: the CAP table of this film, a caption group shown as several
ROWS (line 1: one group in two rows), a group forced to start before its first word (line 1 from frame 0), the start
frame of every Chinese character of every group (capWord gives the frame of a word INSIDE a group), the film length
read from the timing file's "frames", and "speakers" in the lines file as a list or as {key: name}.

  gen_timing.py <voice_timing.json> --tail 24        the real narration (written by scripts/wanbi/voice/assemble_wanbi.py)
  gen_timing.py --placeholder                        a bring-up timing laid out by character count: no voice needed
  options: --lines <wanbi_lines.json>  --rate 5.5  --lead 3  --tail N  --out <dir>  --json <timing.json>  --md <table.md>
           --no-words (real voice only: ignore the word times, place the groups by character count)

  The run of record (WP1a):
    python3 scripts/wanbi/gen_timing.py /home/user/wanbi_work/voice/zh_v1/voice_timing.json \
        --lines scripts/wanbi/voice/wanbi_lines.json --tail 24
  -> 23 lines, speech end 69.43 s = frame 2083, 2083 + 24 = 2107 frames = the narration track's "frames".

voice_timing.json: {"lines": [{"line": 1, "text": "...", "start": s, "end": s, "cuts": [s], "holds": [s],
                               "words": [["宦", s, s], ...]}, ...], "speech_end": s, "tail_f": n, "frames": n}
  seconds from the first frame of the film. "cuts" (only on a line that has a hold_before in the lines file): the film
  second at which the speech starts again after each silent beat. "holds" (optional): how long each beat is; without it
  the length in the lines file is used.
  "words" (optional): one [character, start s, end s] per Chinese character of the line, in order. With it a caption
  group (and a quote, and every character) starts where its first character starts and ends where its last character
  ends; without it, or with --no-words, the groups are placed in proportion to the characters before them.
  "tail_f" (optional): the frames of film after "speech_end". "frames" (optional): the length of the narration track
  in frames. The film is speech_end + tail long; the tail is --tail, else "tail_f", else "frames" - the speech end's
  frame, else 12. The Wanbi json has "frames" 2107 and no "tail_f": --tail 24 and the default agree (2083 + 24).
  This film does not loop (no "loop" in the lines file): the last caption stays to the last frame.

--placeholder lays the lines out at RATE characters a second with GAP between lines, plus what the lines file asks for
  (hold_before, hold_after, shot_min_f: none of them in the Wanbi lines file today).
  --lead N = silent frames before the first word (default 3, as the real take: 「宦」 starts on frame 3).
  --json also writes the layout as a voice_timing.json, the slots a later narration is fitted into.

How a line is cut into caption groups: the CAP table below. A group's frames come from the word times (else in
proportion to the Chinese characters before it, separately on each side of a "cuts" time). Every group carries its
line number and its index in the line: shots ask cap(line, k) or capWord(line, "撞") for a frame instead of typing
frame numbers; capWord's frame is the word's OWN first syllable (from the character times written to captions.ts)."""
import argparse, json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FPS = 30
RATE = 5.5        # placeholder: Chinese characters a second (the take's rate)
GAP = 0.08        # placeholder: silence between two lines, s (the take's between_lines)
LEAD = 3          # placeholder: silent frames before the first word (the take starts 「宦」 on frame 3)
TAIL = 12         # frames of film after the last word when neither --tail, "tail_f" nor "frames" says otherwise
LINGER = 12       # a caption stays up to this many frames after its last syllable, or until the next one starts
MAXLEN = 10       # width of one caption group in full-width characters, punctuation included (one line of 72 px type)
ROW_MAX = 12      # width of one ROW of a multi-row group (Rows): drawn smaller, ROW_PX
ROW_PX = 64       # the type size of a multi-row group (12 full-width characters at 64 px fit 1080 with the margins)
LEAD_CUT = 2      # a segment starts this many frames before its first word


class Rows(list):
    """a caption group shown as several rows, one narrator string per row (no quotes inside). Its text is the rows
    joined; Film.tsx draws each row on its own line at ROW_PX. Width: each row at most ROW_MAX."""


# Groups that start on an earlier frame than their first word: {line: frame}. Line 1's two-row subtitle is on screen
# from frame 0 (frame 0 is the thumbnail: it must carry the subtitle), not from its first word on frame 3.
FORCE_FROM = {1: 0}

# One entry per narration line: its caption groups. 【】 = the gold key words (the brackets are not drawn).
# A group is "text", or ("text", who) when it is a character's own words (who = a key of PEOPLE in people.ts), or a
# list of such pieces when the narrator's words and the quote share one caption, or Rows(...) (line 1).
# The groups of a line, joined and stripped to their Chinese characters, must equal the line's text (checked).
# Size: at most 10 full-width characters, cut where the phrase breaks (STORYBOARD.md's groups, one action each).
# Punctuation: a group drops its closing ，。：；; it keeps ？ and the 。 / ! inside a quote's last group, before the ”.
# Next to a quote mark write the ASCII ! ? and : (the full-width ！ ？ and ： leave a half-character hole beside ” and “:
# Hongmen saw it on a sheet): 他说:“ (line 6), 柱子上!” (line 11). A quote opens with “ in its first group and closes
# with ” in its last; the groups between carry no marks (as the storyboard; 「“赵王斋戒五天才送玉」 then fits 10).
# Gold: as STORYBOARD.md (the names, the hits the picture lands on, the idioms, the numbers, the punchlines).
CAP = [
 [Rows(["宦官的门客【蔺相如】", "举着【和氏璧】要往柱子上【撞】"])],                                   # 1
 ["对面急得【直摆手】的", "是【秦王】"],                                                                # 2
 ["这块玉", "秦王开价【十五座城】"],                                                                   # 3
 ["赵国给了", "城可能不来", "不给", "秦兵【一定来】"],                                                 # 4
 ["派谁去？", "【没人】", "最后，宦官把自家门客", "【推了出来】"],                                     # 5
 [["他说:", ("“【我去】", "lin")], ("城不来", "lin"), ("我把玉【完整带回来】。”", "lin")],             # 6
 ["秦王接过玉", "【乐坏了】", "传给【美人们】看"],                                                     # 7
 ["满屋子喊【万岁】", "没人提【城】的事"],                                                             # 8
 ["他走上前", ("“这玉有个【瑕疵】", "lin"), ("我指给大王看。”", "lin")],                               # 9
 ["玉一到手", "他退到柱子边", "【怒发冲冠】"],                                                         # 10
 [("“再逼我", "lin"), ("我的头和这块玉", "lin"), ("一起【碎】在柱子上!”", "lin")],                     # 11
 ["秦王赶紧道歉", "摊开地图【一指】", ("“这【十五座城】", "qinWang"), ("给赵国。”", "qinWang")],       # 12
 ["他看得出来", "秦王【在演】"],                                                                       # 13
 ["他【也演】", ("“赵王斋戒五天才送玉", "lin"), ("大王也得斋戒五天", "lin"), ("摆上【大礼】", "lin"),
  ("我才交。”", "lin")],                                                                                # 14
 ["秦王【抢不到】", "只好答应"],                                                                       # 15
 ["转头，他让随从", "穿上【粗布衣服】", "【揣着玉】", "抄小路溜回【赵国】"],                           # 16
 ["【五天后】", "大礼摆好", "秦王【要玉】"],                                                           # 17
 ["他说", ("“秦国二十多个国君", "lin"), ("没一个【守约】的", "lin"), ("玉已经到【赵国】了。”", "lin")], # 18
 [("“骗了大王", "lin"), ("【该死】", "lin"), ("把我【下锅煮了】吧。”", "lin")],                       # 19
 ["满朝大臣【面面相觑】", "有人要【拖他出去】"],                                                       # 20
 ["秦王说", ("“杀了他", "qinWang"), ("玉也【回不来】", "qinWang"), ("放他回去吧。”", "qinWang")],     # 21
 ["最后", "秦国【没给城】", "赵国也【没给玉】"],                                                       # 22
 ["【价值连城】的玉", "一座城也【没换到】", "倒是那个门客", "回国就当了【大官】"],                     # 23
]
# the five build segments: A = lines 1-6, B = 7-11, C = 12-15, D = 16-19, E = 20-23
SEG_OF = lambda n: "A" if n <= 6 else "B" if n <= 11 else "C" if n <= 15 else "D" if n <= 19 else "E"
# who may speak a quote: keys of PEOPLE in src/videos/wanbi/people.ts (蔺相如 the envoy, 秦王 the King of Qin)
SPEAKERS = ["lin", "qinWang"]

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
            sp = j.get("speakers", [])          # ["lin", "qinWang"] or {"lin": "蔺相如", ...}
            if q["who"] not in SPEAKERS or q["who"] not in sp: fail(f"line {i}: unknown speaker {q}")
            if isinstance(sp, dict) and "name" in q and sp[q["who"]] != q["name"]: fail(f"line {i}: the quote's name {q['name']} is not speakers[{q['who']}]")
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
        if isinstance(g, Rows):        # a multi-row group: narrator rows only, each row at most ROW_MAX wide
            if len(g) < 2 or not all(isinstance(r, str) for r in g): fail(f"line {n}: Rows takes two or more narrator strings")
            for r in g:
                if width(r) > ROW_MAX: fail(f"line {n}: the row {r} is {width(r)} characters wide (at most {ROW_MAX})")
                if r.count("【") != r.count("】") or re.search(r"【[^】]*【", r): fail(f"line {n}: unbalanced 【】 in the row {r}")
        shown = "".join(p if isinstance(p, str) else p[0] for p in ps)
        if not isinstance(g, Rows) and width(shown) > MAXLEN: fail(f"line {n}: the caption group {shown} is {width(shown)} characters wide (at most {MAXLEN})")
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
            k = cjk(tx); a, b = when(acc, 1), when(acc + k, 0)
            at = [frame(when(acc + j, 1)) for j in range(k)]      # the frame each Chinese character starts on
            acc += k
            if line_caps and line_caps[-1]["k"] == gi: line_caps[-1]["b"] = b; line_caps[-1]["text"] += tx; line_caps[-1]["at"] += at
            else:
                line_caps.append({"line": n, "k": gi, "seg": SEG_OF(n), "text": tx, "a": a, "b": b, "at": at})
                if isinstance(groups[gi], Rows): line_caps[-1]["rows"] = list(groups[gi])
                if wt is not None: place.far.append((n, plain(tx), frame(a) - frame(by_count(acc - k, 1))))
            if who is None: open_who = None
            elif who == open_who: qs[-1][3] = b; qs[-1][4] += strip(tx)
            else: qs.append([n, who, a, b, strip(tx)]); open_who = who
        for i, c in enumerate(line_caps):
            c["from"] = frame(s) if i == 0 else frame(c["a"])
            if i == 0 and n in FORCE_FROM:          # shown before its first word (line 1 from frame 0)
                if FORCE_FROM[n] > c["from"]: fail(f"line {n}: FORCE_FROM {FORCE_FROM[n]} is after the line's first word (frame {c['from']})")
                if caps and FORCE_FROM[n] <= caps[-1]["end"]: fail(f"line {n}: FORCE_FROM {FORCE_FROM[n]} is inside the speech of line {caps[-1]['line']}")
                c["from"] = FORCE_FROM[n]
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
        if i + 1 == len(caps): c["to"] = total - 1; continue          # the last words stay up to the last frame
        nx = caps[i + 1]
        to = min(nx["from"] - 1, c["end"] + LINGER)
        if nx["seg"] != c["seg"]: to = min(to, seg_from[nx["seg"]] - 1)      # not across the cut into the next segment
        if nx["line"] != c["line"] and lines[c["line"] - 1].get("cut_after"): to = min(to, nx["from"] - LEAD_CUT - 1)   # nor a declared cut
        c["to"] = max(c["end"], to)
    return total, segs


TS_TAIL = '''export const CAPTIONS: CaptionGroup[] = RAW.map(([shot, from, to, text, line, k, end, , rows]) => (rows ? { shot, from, to, text, line, k, end, rows } : { shot, from, to, text, line, k, end }));
/** the caption group shown on frame f, or null */
export const captionAt = (f: number): CaptionGroup | null => {
  let lo = 0, hi = CAPTIONS.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, c = CAPTIONS[m];
    if (f < c.from) hi = m - 1; else if (f > c.to) lo = m + 1; else return c;
  }
  return null;
};
/** "举着【和氏璧】要往" -> [{text: "举着", gold: false}, {text: "和氏璧", gold: true}, {text: "要往", gold: false}] */
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
/** the caption groups of narration line `line` (1-based), in order */
export const capsOf = (line: number): CaptionGroup[] => BY_LINE[line] ?? [];
/** caption group k of line `line`: k counts from 0, a negative k from the end (cap(10, -1) = 【怒发冲冠】).
 *  .from = the frame the group is shown from = the frame its first syllable starts on (line 1: frame 0, forced; its
 *  first word is on frame 3). Throws when the line has no such group. */
export const cap = (line: number, k: number): CaptionGroup => {
  const g = capsOf(line), c = g[k < 0 ? g.length + k : k];
  if (!c) throw new Error(`cap(${line}, ${k}): line ${line} has ${g.length} caption groups`);
  return c;
};
/** THE FRAME OF A WORD: the caption group of line `line` that shows `word` (Chinese characters only), with
 *  `from` = the frame the word's FIRST syllable starts on (the narration's character times): put the hit there.
 *  capWord(1, "撞").from is the 撞 inside line 1's one group, capWord(6, "把").from the 把 inside 「我把玉…」. When the
 *  word opens its group, it equals cap(line, k).from (except line 1, whose group is shown from frame 0). `to`, `end`,
 *  `text` and `k` are the group's own. Survives a regrouping of the line. Throws when no group, or more than one, shows
 *  the word, or the word occurs twice in its group (give a longer word). */
export const capWord = (line: number, word: string): CaptionGroup => {
  const w = word.replace(/[^一-鿿]/g, "");
  if (!w) throw new Error(`capWord(${line}, "${word}"): give Chinese characters`);
  const han = (c: CaptionGroup) => c.text.replace(/[^一-鿿]/g, "");
  const g = capsOf(line).filter((c) => han(c).includes(w));
  if (g.length !== 1) throw new Error(`capWord(${line}, "${word}"): ${g.length} caption groups of line ${line} show it`);
  const t = han(g[0]), i = t.indexOf(w);
  if (t.indexOf(w, i + 1) >= 0) throw new Error(`capWord(${line}, "${word}"): it occurs twice in 「${t}」 (give a longer word)`);
  return { ...g[0], from: (AT_OF.get(g[0]) as number[])[i] };
};
'''


def write_ts(d, src, rows, end_s, total, tail, segs, caps, quotes):
    js = lambda v: json.dumps(v, ensure_ascii=False)
    head = f"// GENERATED by scripts/wanbi/gen_timing.py from {src}: do not edit by hand.\n"
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
        f.write("// its speech, the frame each Chinese character starts on, rows]. 【】 marks the gold key words (the brackets are not\n")
        f.write("// drawn). Drawn by <Caption> in Film.tsx. A group with rows (line 1) is drawn as those rows, one under the other,\n")
        f.write(f"// at ROW_PX; its text is the rows joined. A caption stays up after its last syllable until the next one starts, at\n")
        f.write(f"// most {LINGER} frames, never across a segment's first frame; the last one stays to the last frame.\n")
        f.write("/** from..to = the frames the caption is shown; from..end = the frames its words are spoken; line = the narration\n")
        f.write(" *  line (1-based), k = its index among that line's groups (0-based); shot = the segment letter; rows = the rows of a\n")
        f.write(" *  multi-row group (line 1: 「宦官的门客【蔺相如】」 over 「举着【和氏璧】要往柱子上【撞】」), drawn at ROW_PX */\n")
        f.write("export type CaptionGroup = { from: number; to: number; text: string; shot: string; line: number; k: number; end: number; rows?: string[] };\n")
        f.write("export type CaptionRun = { text: string; gold: boolean };\n")
        f.write(f"/** the type size of a multi-row group (each row is at most {ROW_MAX} full-width characters); a one-row group is 72 px */\n")
        f.write(f"export const ROW_PX = {ROW_PX};\n\n")
        f.write("type Raw = [shot: string, from: number, to: number, text: string, line: number, k: number, end: number, at: number[], rows?: string[]];\n")
        f.write("const RAW: Raw[] = [\n")
        for c in caps:
            rw = f", {js(c['rows'])}" if c.get("rows") else ""
            f.write(f"  [{js(c['seg'])}, {c['from']}, {c['to']}, {js(c['text'])}, {c['line']}, {c['k']}, {c['end']}, {js(c['at'])}{rw}],\n")
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
    ap = argparse.ArgumentParser(description="narration timing -> voice.ts + captions.ts (Wanbi)")
    ap.add_argument("timing", nargs="?", help="voice_timing.json from the voice assembler")
    ap.add_argument("--placeholder", action="store_true", help="lay the lines out by character count instead")
    ap.add_argument("--lead", type=int, default=None, help=f"placeholder only: silent frames before the first word (default {LEAD})")
    ap.add_argument("--rate", type=float, default=RATE, help=f"placeholder only: Chinese characters a second (default {RATE})")
    ap.add_argument("--tail", type=int, default=None, help=f"frames of film after the last word (default: tail_f of the timing file, else its frames - the speech end, else {TAIL})")
    ap.add_argument("--no-words", action="store_true", help="real voice: place the caption groups by character count, not by the word times")
    ap.add_argument("--lines", default=os.path.join(ROOT, "scripts/wanbi/voice/wanbi_lines.json"))
    ap.add_argument("--out", default=os.path.join(ROOT, "src/videos/wanbi"), help="folder for voice.ts and captions.ts")
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
        if a.tail is None:
            if "tail_f" in j: a.tail = int(j["tail_f"])
            elif "frames" in j: a.tail = int(j["frames"]) - frame(end_s)
            else: a.tail = TAIL
            if a.tail < 0: fail(f"the timing file's frames ({j.get('frames')}) end before the speech (frame {frame(end_s)})")
        elif "tail_f" in j and a.tail != j["tail_f"]: print(f"WARNING --tail {a.tail} overrules the timing file's tail_f {j['tail_f']}")
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
