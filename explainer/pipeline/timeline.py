"""Turn an episode script (episode.yaml) plus the music analysis into timeline.json.

There is no narration: subtitle lines are timed by reading speed, scenes can be
anchored to music markers ("at: drop"), the lines in between are stretched or
squeezed to fill each anchored window, and line starts snap to nearby beats.
"""

import re

LAYOUTS = {"vertical": (1080, 1920), "horizontal": (1920, 1080)}
MARKUP = re.compile(r"[\[\]{}]")


def plain(text):
    return MARKUP.sub("", text)


def natural_seconds(text, reading):
    n = len(re.sub(r"[\s，。、：；！？“”‘’「」《》（）—…·,.!?:;\"'()\-]", "", plain(text)))
    return min(reading["max"], max(reading["min"], reading["base"] + n / reading["cps"]))


def resolve_at(at, markers):
    if isinstance(at, (int, float)):
        return float(at)
    m = re.fullmatch(r"\s*([a-z_]+)\s*(?:([+-])\s*([\d.]+))?\s*", str(at))
    if not m or m.group(1) not in markers:
        raise ValueError(f"unknown anchor {at!r}; markers are {sorted(markers)}")
    t = markers[m.group(1)]
    if m.group(2):
        t += float(m.group(3)) * (1 if m.group(2) == "+" else -1)
    return t


def normalise_lines(scene):
    out = []
    for item in scene.get("lines", []):
        if isinstance(item, str):
            item = {"text": item}
        out.append(item)
    return out


def build(ep, music, warn=print):
    fps = ep.get("fps", 30)
    width, height = LAYOUTS[ep.get("format", "vertical")]
    reading = {"cps": 4.6, "base": 0.9, "min": 1.9, "max": 6.0, "gap": 0.25,
               "lead": 0.5, "tail": 0.6, "snap": 0.22, **ep.get("reading", {})}
    markers = {**music["markers"], **ep.get("markers", {})}
    end = ep.get("end", "music")
    total = music["duration"] if end == "music" else float(end)
    markers["end"] = total
    beats = [b for b in music["beats"] if b < total]

    scenes = ep["scenes"]
    for i, s in enumerate(scenes):
        s["_lines"] = normalise_lines(s)
        if i == 0 and "at" not in s:
            s["at"] = 0
    anchored = [i for i, s in enumerate(scenes) if "at" in s] + [len(scenes)]

    timed = []
    for gi in range(len(anchored) - 1):
        lo, hi = anchored[gi], anchored[gi + 1]
        start = resolve_at(scenes[lo]["at"], markers)
        stop = resolve_at(scenes[hi]["at"], markers) if hi < len(scenes) else total
        group = scenes[lo:hi]
        # natural length of every slot in the window
        slots = []
        for s in group:
            row = [s.get("lead", reading["lead"])]
            for ln in s["_lines"]:
                if "pause" in ln:
                    row.append(float(ln["pause"]))
                else:
                    row.append(float(ln.get("hold", natural_seconds(ln["text"], reading))) + reading["gap"])
            row.append(s.get("tail", reading["tail"]))
            slots.append(row)
        natural = sum(map(sum, slots))
        scale = (stop - start) / natural
        if not 0.8 <= scale <= 1.6:
            ids = ", ".join(s["id"] for s in group)
            warn(f"warning: scenes [{ids}] have {natural:.1f}s of text for a {stop - start:.1f}s window "
                 f"(x{scale:.2f}); add or cut lines, or move the anchor")
        t = start
        for s, row in zip(group, slots):
            s_start = t
            t += row[0] * scale
            lines = []
            for ln, dur in zip(s["_lines"], row[1:-1]):
                lines.append({"text": ln.get("text", ""), "start": t, "silent": "pause" in ln})
                t += dur * scale
            t += row[-1] * scale
            timed.append((s, s_start, t, lines))

    # snap line starts to the beat grid, keeping order and a minimum spacing
    for s, s_start, s_end, lines in timed:
        prev = s_start
        for ln in lines:
            near = min(beats, key=lambda b: abs(b - ln["start"])) if beats else ln["start"]
            if abs(near - ln["start"]) <= reading["snap"] and near >= prev + 0.6 and near < s_end - 0.5:
                ln["start"] = near
            prev = ln["start"]

    f = lambda sec: int(round(sec * fps))
    out_scenes, subtitles = [], []
    for s, s_start, s_end, lines in timed:
        a, b = f(s_start), f(s_end)
        rel = []
        for i, ln in enumerate(lines):
            nxt = lines[i + 1]["start"] if i + 1 < len(lines) else s_end
            la, lb = f(ln["start"]), f(nxt) - (3 if i + 1 < len(lines) else 6)
            rel.append({"text": ln["text"], "from": la - a, "duration": max(1, lb - la), "silent": ln["silent"]})
            if not ln["silent"] and ln["text"]:
                subtitles.append({"text": ln["text"], "from": la, "to": lb, "scene": s["id"]})
        out_scenes.append({
            "id": s["id"], "component": s.get("component", "Blank"), "props": s.get("props", {}),
            "kicker": s.get("kicker"), "cite": s.get("cite"),
            "from": a, "duration": b - a, "lines": rel,
        })

    return {
        "id": ep["id"], "series": ep.get("series", ""), "title": ep.get("title", ""),
        "subtitle": ep.get("subtitle", ""), "format": ep.get("format", "vertical"),
        "width": width, "height": height, "fps": fps, "durationInFrames": f(total),
        "music": {"tempo": music["tempo"], "markers": {k: f(v) for k, v in markers.items()},
                  "beats": [f(b) for b in beats], "energyHz": music["energy_hz"], "energy": music["energy"],
                  "hits": [[f(t), s] for t, s in music.get("hits", []) if t < total]},
        "scenes": out_scenes,
        "subtitles": subtitles,
    }
