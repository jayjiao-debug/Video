"""What the film shows and when, for the gate: captions, cards, overlays and in-world signs.

Two sources, best first:
1. The film's own export (film config "gate.export": a command that writes {GATE_JSON}), in this shape:
     {"fps": 30, "frames": N,
      "captions": [{"from": f, "to": f, "text": "...", "end": f_speech_end, "lang": "zh"}],
      "overlays": [{"id": "card1", "kind": "card|title|fx|caption|rec", "from": f, "to": f, "box": [x, y, w, h]}],
      "signs":    [{"id": "E4 board", "from": f, "to": f, "box": [x, y, w, h]}]}
   Boxes are 1080 x 1920 film px. A box may instead be "boxes": {"<frame>": [x, y, w, h], ...} for things that move
   (an in-world board projected by the camera). Only the export knows where in-world signs are; without it the gate
   still shows what each overlay covers on a sheet for the eye.
2. A fallback that reads the generated timing files of the day films (captions.ts RAW rows, voice.ts CARD_RAW and
   SEGMENT_RAW), so captions, cards and scenes are known for every film made so far.
"""
import json, os, re


def parse_captions_ts(path):
    """rows ["A", from, to, "zh", ("en",)? line, k, end, [...], "who", ("spoken")?] -> captions"""
    out = []
    if not os.path.exists(path):
        return out
    src = open(path, encoding="utf-8").read()
    m = re.search(r"const RAW[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if not m:
        return out
    for row in re.finditer(r'^\s*\["([A-Z])",\s*(\d+),\s*(\d+),\s*"((?:[^"\\]|\\.)*)",\s*(?:"((?:[^"\\]|\\.)*)",\s*)?(\d+),\s*(\d+),\s*(\d+)', m.group(1), re.M):
        seg, f0, f1, zh, en, line, k, end = row.groups()
        out.append({"from": int(f0), "to": int(f1), "text": zh, "en": en or "", "end": int(end), "seg": seg,
                    "line": int(line), "k": int(k), "kind": "caption"})
    return out


def parse_voice_ts(path):
    """CARD_RAW [n, "line", first, last, "zh", "en"] and SEGMENT_RAW ["A", l0, l1, f0, f1] from voice.ts"""
    cards, segs = [], []
    if not os.path.exists(path):
        return cards, segs
    src = open(path, encoding="utf-8").read()
    m = re.search(r"export const CARD_RAW[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if m:
        for r in re.finditer(r'\[\s*(\d+),\s*"([A-Z]\d{2}[a-z]?)",\s*(\d+),\s*(\d+),\s*"((?:[^"\\]|\\.)*)"(?:,\s*"((?:[^"\\]|\\.)*)")?', m.group(1)):
            n, line, f0, f1, zh, en = r.groups()
            cards.append({"id": f"card{n}", "kind": "card", "from": int(f0), "to": int(f1), "text": zh, "en": en or "", "after": line})
    m = re.search(r"export const SEGMENT_RAW[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if m:
        for r in re.finditer(r'\[\s*"([A-Z])",\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\s*\]', m.group(1)):
            segs.append({"id": r.group(1), "from": int(r.group(4)), "to": int(r.group(5))})
    return cards, segs


def parse_voice_lines(path):
    """VOICE_RAW [n, start s, end s] + LINE_RAW [n, "id", ...] -> [(id, start s, end s)] on the film's clock"""
    if not os.path.exists(path):
        return []
    src = open(path, encoding="utf-8").read()
    m = re.search(r"export const VOICE_RAW[^=]*=\s*\[(.*?)\n\];", src, re.S)
    if not m:
        return []
    ids = dict((int(a), b) for a, b in re.findall(r'^\s*\[(\d+),\s*"([A-Z]\d{2}[a-z]?)"', src, re.M))
    return [(ids.get(int(n), f"line{n}"), float(s0), float(s1)) for n, s0, s1 in re.findall(r"\[(\d+),\s*([\d.]+),\s*([\d.]+)", m.group(1))]


def load(repo, film, export_json=None):
    t = {"source": "fallback", "captions": [], "overlays": [], "signs": [], "scenes": [], "lines": []}
    if export_json and os.path.exists(export_json):
        e = json.load(open(export_json, encoding="utf-8"))
        t.update({k: e.get(k, []) for k in ("captions", "overlays", "signs", "scenes", "lines")})
        t["source"] = "film export"
        return t
    d = os.path.join(repo, "src", "videos", film)
    t["captions"] = parse_captions_ts(os.path.join(d, "captions.ts"))
    cards, segs = parse_voice_ts(os.path.join(d, "voice.ts"))
    t["overlays"] = cards
    t["scenes"] = segs
    t["lines"] = parse_voice_lines(os.path.join(d, "voice.ts"))
    return t


def box_at(item, f):
    """the box of an overlay or sign on frame f (None when unknown)"""
    if item.get("boxes"):
        ks = sorted(int(k) for k in item["boxes"])
        k = min(ks, key=lambda x: abs(x - f))
        return item["boxes"][str(k)]
    return item.get("box")


def han_count(s):
    return len(re.findall(r"[㐀-鿿豈-﫿]", s))


def reading_s(text, spoken=False):
    """seconds a phone viewer needs for a caption or card (pacing skill: about 7 Chinese characters a second plus
    half a second to find the words; English about 3 words a second). A caption of words being SPOKEN is read with the
    voice, so it needs less: about 9 characters a second plus 0.2 s."""
    h = han_count(text)
    base, cps, wps = (0.2, 9.0, 4.0) if spoken else (0.5, 7.0, 3.0)
    if h:
        return base + h / cps
    return base + len(re.findall(r"[A-Za-z']+", text)) / wps
