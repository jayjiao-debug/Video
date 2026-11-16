#!/usr/bin/env python3
"""gen_en.py [timing.json] : writes src/videos/wanbi/captions_en.ts, the English captions and the characters' quotes
(the mouths), from script_en.json. An adapted copy of scripts/hongmen/en/gen_en.py (the recipe: scripts/kit/lang/README.md).

The picture is the Chinese film's: every English group is spoken inside the window of the Chinese caption group it
stands for (src/videos/wanbi/captions.ts). Without a timing file the chunks of a group share that window in proportion
to their characters (a placeholder for stills). With the timing json (written by fit_en.py from the word times of the
fitted narration) every chunk starts on its first word; within a line a chunk stays up until the next one starts, the
last chunk of a line at most 12 frames after its last word (as the Chinese captions), never across a segment's first
frame, the very last one to the film's last frame (the film does not loop).

LINE 1 is ONE caption group shown from frame 0 (the thumbnail), as in Chinese: its caption chunks in script_en.json are
the ROWS of that group (`rows`), drawn one under the other by Film.tsx at ROW_PX (64) or smaller when the widest row
would pass ROW_MAXW (792 px: the Chinese rows' 12 characters at 64 px). It stays up until line 2's first caption.

Each caption carries its font size: 72 px, smaller if the chunk would be wider than 730 px, so that it stays between
x 175 and 905 like the Chinese captions (the app's button column covers the picture from about x 900 at the
captions' height, and tall phones cut about 50 px off each side). Each caption also carries its line, its group's index
in the line (k) and the last frame of its words (end: Film.tsx puts the gold word's punch between from and end).

The quotes (QUOTE_RAW_EN, which story.ts uses for the mouths when lang is en): one per line and speaker, from the first
QUOTED word (a group that opens with narration, line 6's He says: “I'll go., starts on the word after the opening
quote mark) to the end of the last quoted word, with the syllables of script_en.json (`syl`, quoted words only)."""
import json, os, re, sys
from PIL import ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
FPS, FRAMES, PX, MAXW, LS, HOLD = 30, 2107, 72, 730, 0.5, 12
ROW_PX, ROW_MAXW = 64, 792
font = ImageFont.truetype(os.path.join(ROOT, "public/bt/sans700.ttf"), PX)
plain = lambda t: re.sub("[【】]", "", t)
words = lambda t: re.sub(r"[^a-z0-9]+", " ", re.sub("[【】'’]", "", t).lower()).split()   # = fit_en.py's words_of
SEG_OF = lambda n: "A" if n <= 6 else "B" if n <= 11 else "C" if n <= 15 else "D" if n <= 19 else "E"
width = lambda t, px: (font.getlength(plain(t)) + LS * len(plain(t))) * px / PX   # Film.tsx: letter-spacing 0.5 px in English

script = json.load(open(os.path.join(HERE, "script_en.json"), encoding="utf8"))
CAP_TS = open(os.path.join(ROOT, "src/videos/wanbi/captions.ts"), encoding="utf8").read()
zh = re.findall(r'\["([A-E])", (\d+), (\d+), "(.*?)", (\d+), (\d+), (\d+)[,\]]', CAP_TS)
zh = [(s, int(a), int(b), t, int(e)) for s, a, b, t, _, _, e in zh]
VOICE_TS = open(os.path.join(ROOT, "src/videos/wanbi/voice.ts"), encoding="utf8").read()
SEG_START = {s: int(a) for s, a in re.findall(r'\["([A-E])", \d+, \d+, (\d+), \d+\]', VOICE_TS)}
assert sorted(SEG_START) == list("ABCDE"), SEG_START
timing = {l["n"]: l for l in json.load(open(sys.argv[1], encoding="utf8"))["lines"]} if len(sys.argv) > 1 else None
if timing: assert json.load(open(sys.argv[1], encoding="utf8"))["frames"] == FRAMES

caps, quotes, gi = [], [], 0
for ln in script["lines"]:
    n = ln["n"]; qs = {}; rows = []
    take = timing[n].get("take") if timing else None
    G = ln.get("alt", {}).get(take, ln["groups"]) if timing else ln["groups"]
    W = timing[n]["words"] if timing else None
    if timing: assert [w[0] for w in W] == [w for g in G for w in words(g["t"])], (n, "the timing's words are not the script's")
    wi = 0
    for k, g in enumerate(G):
        seg, a, b, zt, ze = zh[gi]; gi += 1
        assert seg == SEG_OF(n), (n, seg)
        assert words(" ".join(g["cap"])) == words(g["t"]), (n, g["cap"], g["t"])
        if timing:
            ch = timing[n]["groups"][k]["chunks"]; assert len(ch) == len(g["cap"]), (n, k)
            spans = [(s, e) for s, e in ch]
        else:   # placeholder: share the Chinese group's window by characters
            tot = sum(len(plain(c)) for c in g["cap"]); acc = 0; spans = []
            for c in g["cap"]:
                s0 = a + (ze + 1 - a) * acc / tot; acc += len(plain(c)); spans.append((s0 / FPS, (a + (ze + 1 - a) * acc / tot) / FPS))
        if n == 1:   # line 1: ONE group in rows, shown from frame 0 (the thumbnail)
            assert len(G) == 1 and a == 0, (n, len(G), a)
            rows.append([0, max(0, round(spans[-1][1] * FPS) - 1), " ".join(g["cap"]), k, list(g["cap"])])
        else:
            for c, (s0, e0) in zip(g["cap"], spans): rows.append([round(s0 * FPS), max(round(s0 * FPS), round(e0 * FPS) - 1), c, k, None])
        nw = len(words(g["t"]))
        if g.get("who"):
            # the quoted words of the group: after an opening quote mark when the group opens with narration
            t = g["t"]; mq = re.search(r'"(?=\w)', t); q0 = mq.start() if mq else 0   # an OPENING quote mark (a word follows it)
            pre = len(words(t[:q0]))
            if timing: s_q, e_q = W[wi + pre][1], W[wi + nw - 1][2]
            else: s_q, e_q = spans[0][0], spans[-1][1]
            q = qs.setdefault(g["who"], {"s": s_q, "e": e_q, "syl": 0, "t": ""})
            q["e"] = e_q; q["syl"] += g["syl"]
            q["t"] = (q["t"] + " " + t[q0:]).strip()
        wi += nw
    for i, r in enumerate(rows):
        to = rows[i + 1][0] - 1 if i + 1 < len(rows) else (FRAMES - 1 if n == len(script["lines"]) else r[1] + HOLD)
        if r[4]:   # rows: the widest row sets the size
            wide = max(width(x, PX) for x in r[4]); px = ROW_PX if wide * ROW_PX / PX <= ROW_MAXW else int(ROW_PX * ROW_MAXW / (wide * ROW_PX / PX))
            w = round(wide * px / PX)
        else:
            wide = width(r[2], PX); px = PX if wide <= MAXW else int(PX * MAXW / wide); w = round(wide * px / PX)
        caps.append([SEG_OF(n), r[0], max(r[0], to), r[2], n, r[3], r[1], px, w] + ([r[4]] if r[4] else []))
    for who, q in qs.items(): quotes.append([n, who, round(q["s"], 3), round(q["e"], 3), q["syl"], q["t"].replace('"', "")])
assert gi == len(zh), (gi, len(zh))
for i in range(1, len(caps)):   # captions of consecutive lines must not overlap
    if caps[i][1] <= caps[i - 1][2]: caps[i - 1][2] = caps[i][1] - 1
    s0 = SEG_START[caps[i][0]]   # never across a segment's first frame (the cut): the previous segment's caption ends before it
    if caps[i - 1][0] != caps[i][0] and caps[i - 1][2] >= s0: caps[i - 1][2] = s0 - 1
    assert caps[i - 1][2] >= caps[i - 1][1], caps[i - 1]
    caps[i - 1][6] = min(caps[i - 1][6], caps[i - 1][2])
assert caps[0][1] == 0 and caps[-1][2] == FRAMES - 1, (caps[0], caps[-1])
with open(os.path.join(ROOT, "src/videos/wanbi/captions_en.ts"), "w", encoding="utf8") as f:
    f.write("// GENERATED by scripts/wanbi/en/gen_en.py from script_en.json" + (" and the fitted English narration (fit_en.py's timing json)" if timing else " (PLACEHOLDER timing: the Chinese windows)") + ": do not edit by hand.\n")
    f.write("// The English captions: [segment, first frame, last frame shown (inclusive), text, line, index of its group in the line,\n// last frame of its words, font px, width px, rows?]. 【】 marks the gold key words. Line 1 is ONE group shown from frame 0\n// in rows (as the Chinese one; English: three rows). Drawn by <Caption> in Film.tsx when lang is \"en\".\n")
    f.write('import type { CaptionGroup } from "./captions";\nimport type { Speaker } from "./voice";\n\n/** an English caption chunk: its own font px and its measured width px (rows: the widest row) */\nexport type CaptionEN = CaptionGroup & { px: number; w: number };\n')
    f.write("const RAW: [string, number, number, string, number, number, number, number, number, string[]?][] = [\n")
    for c in caps: f.write("  " + json.dumps(c, ensure_ascii=False) + ",\n")
    f.write("];\n")
    f.write('''export const CAPTIONS_EN: CaptionEN[] = RAW.map(([shot, from, to, text, line, k, end, px, w, rows]) => (rows ? { shot, from, to, text, line, k, end, px, w, rows } : { shot, from, to, text, line, k, end, px, w }));
/** the English caption shown on frame f, or null */
export const captionAtEN = (f: number): CaptionEN | null => {
  let lo = 0, hi = CAPTIONS_EN.length - 1;
  while (lo <= hi) {
    const m = (lo + hi) >> 1, c = CAPTIONS_EN[m];
    if (f < c.from) hi = m - 1; else if (f > c.to) lo = m + 1; else return c;
  }
  return null;
};
for (let i = 1; i < CAPTIONS_EN.length; i++) {
  if (CAPTIONS_EN[i].from <= CAPTIONS_EN[i - 1].to) throw new Error(`English caption groups overlap at ${CAPTIONS_EN[i].text}`);
}
/** a character's own words in the English narration: [line, who, start s, end s, syllables, the words] */
export const QUOTE_RAW_EN: [number, Speaker, number, number, number, string][] = [
''')
    for q in quotes: f.write("  " + json.dumps(q, ensure_ascii=False) + ",\n")
    f.write("];\n")
print("captions", len(caps), "| narrowed:", [(c[3], c[7]) for c in caps if c[7] < (ROW_PX if len(c) > 9 else PX)], "| line 1:", caps[0][:3], caps[0][7:], "| quotes", len(quotes))
for q in quotes: print("  ", q)
