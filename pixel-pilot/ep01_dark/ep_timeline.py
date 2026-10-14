"""Subtitle-only timeline for Ep1 《三十秒的黑暗》 on the owner's BGM, from the very start of the track.

The story sets the length: each line gets its reading budget (0.5 s + chars/7 + 0.6 s) and starts on a
beat. Four moments are pinned to the music, and whole bars are cut from the middle of each section so
the lines arrive at the pin with no waiting:
  lights out  = a quiet bar (the kick drops out)      lights on  = the kick's return
  the question = the long quiet before the big drop   the answer = the drop
  the verdict = a quiet bar                           the flip   = the kick's return
Any slack shorter than a bar goes to one named visual moment per section (the clock, the painting,
the replay through the colonel's eyes), never to a line.

python3 ep_timeline.py   -> timeline.json and a pace report
"""
import json, math, pathlib
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
MUSIC = json.load(open(HERE.parent / "ep01_room13" / "audio" / "music.json"))
BEATS = np.array(MUSIC["beats"])
BARS = np.array([b["t"] for b in MUSIC["bars"]])
CPS, BASE, LOOK = 7.0, 0.5, 0.6
START = 0.0

# pins in original-track seconds
PIN_T = dict(dark=65.39, lights=67.43, question=132.61, answer=140.81, verdict=199.88, flip=201.92)
# where whole bars may be cut: (centre bar, first bar, last bar) per section
CUT_WINDOWS = [(16, 4, 29), (49, 35, 62), (82, 72, 95)]

S = [
    # ---- before the dark
    dict(id="h1", kind="n", scene="hook", text="灯只灭了三十秒。", at=0.2),
    dict(id="h2", kind="n", scene="hook", text="蓝宝石，就不见了。"),
    dict(id="me", kind="n", scene="holmes", text="我是福尔摩斯。"),
    dict(id="past", kind="n", scene="holmes", text="三年前，我说错过一个名字。"),
    dict(id="vow", kind="n", scene="holmes", text="所以这一次，我不出手。|侦探，是你。"),
    dict(id="look", kind="n", scene="room", text="灯灭之前，看清楚每一个人。", extra=1.0),
    dict(id="v1", kind="v", scene="c_lady", text="这颗「蓝星」，|今晚只给各位看一眼。"),
    dict(id="l1", kind="l", scene="c_lily", text="别碰！画上的颜料还没干！"),
    dict(id="z1", kind="z", scene="c_mag", text="要不要我把它变没？"),
    dict(id="g1", kind="g", scene="c_col", text="我眼睛怕光，见谅。"),
    dict(id="g2", kind="g", scene="c_col", text="这幅画画完，|我出一千镑买下。"),
    dict(id="b1", kind="h", scene="c_but", text="煤气表九点四十五投了一先令，|够烧一个钟头。"),
    dict(id="clock", kind="beat", scene="clock", dur=1.6, elastic=True),
    dict(id="dark", kind="beat", scene="dark", dur=1.9, pin="dark"),
    # ---- lights on: the investigation
    dict(id="v2", kind="v", scene="lights", text="我的蓝星！", pin="lights"),
    dict(id="title", kind="beat", scene="title", dur=2.4),
    dict(id="n1", kind="n", scene="room_after", text="门一直锁着，没有人离开。"),
    dict(id="n2", kind="n", scene="room_after", text="每个人都搜过身。|宝石，还在这间屋子里。"),
    dict(id="v3", kind="v", scene="a_lady", text="灯一灭，我什么都看不见！"),
    dict(id="z2", kind="z", scene="a_mag", text="我的手一直在琴键上！|琴声一秒都没停！"),
    dict(id="l2", kind="l", scene="a_lily", text="我吓了一跳，|把洗笔的水罐都打翻了。"),
    dict(id="b2", kind="h", scene="a_but", text="煤气表就在门边，|我摸黑投了一先令，再点上灯。"),
    dict(id="g3", kind="g", scene="a_col", text="漆黑一片，谁也看不见。"),
    dict(id="g4", kind="g", scene="a_col", text="……不过我看见，|莉莉小姐在画架旁边动了一下。"),
    dict(id="paint", kind="n", scene="painting", text="你又看了一眼那幅画。", extra=1.2, elastic=True),
    dict(id="ready", kind="n", scene="ready", text="好了，侦探。|灯灭之前、灯亮之后，你都看清楚了。"),
    dict(id="ask", kind="card", scene="board", text="蓝宝石在哪？|是谁拿走的？", pin="question", until="answer"),
    # ---- the answer
    dict(id="r0", kind="n", scene="most", text="大多数人会说：魔术师。|找到宝石的人会说：莉莉。", pin="answer"),
    dict(id="r1", kind="n", scene="piano", text="魔术师的琴声，一秒也没停过。"),
    dict(id="r2", kind="n", scene="gem", text="宝石就在这幅画里。|它被按进了没干的颜料。"),
    dict(id="r3", kind="n", scene="jar", text="可莉莉在黑暗里，|连自己的水罐都看不见。"),
    dict(id="r4", kind="n", scene="replay", text="黑暗里，只有一个人|说他看见了东西。", extra=1.0, elastic=True),
    dict(id="r5", kind="n", scene="lenses", text="他说他怕光。|灯一亮，他却把深色镜片翻了上去。"),
    dict(id="r6", kind="n", scene="pirate", text="深色镜片戴久了，眼睛早就适应了黑暗。|海盗戴眼罩，也是这个道理。"),
    dict(id="r7", kind="n", scene="meter", text="他知道灯什么时候灭：|九点四十五的一先令，正好烧到十点四十五。"),
    dict(id="r8", kind="n", scene="glove", text="还有他的白手套。|指尖上，是没干的蓝颜料。"),
    dict(id="r9", kind="n", scene="verdict", text="偷走蓝星的，是上校。", pin="verdict"),
    dict(id="r10", kind="n", scene="flip", text="他出一千镑买这幅画，|就是想把宝石光明正大地带出门。", pin="flip"),
    dict(id="end", kind="n", scene="end", text="你看出来了吗？|这一次，说出名字的是你。", extra=0.6),
    dict(id="lights_out", kind="beat", scene="ink", dur=4.0),
]
SECTION_PIN = ["dark", "question", "verdict"]      # each section ends at one of these


def budget(e):
    if e["kind"] == "beat":
        return e["dur"]
    n = len(e["text"].replace("|", ""))
    return BASE + n / CPS + LOOK + e.get("extra", 0.0)


class Edit:
    def __init__(self, cuts):
        self.cuts = sorted(cuts)

    def v(self, track):
        t = track - START
        for a, b in self.cuts:
            if track >= b:
                t -= b - a
            elif track > a:
                t -= track - a
        return t

    def beats(self, end):
        return np.array([self.v(b) for b in BEATS if START <= b < end and not any(a <= b < c for a, c in self.cuts)])


def plan(cuts, end_track):
    E = Edit(cuts)
    vb = E.beats(end_track)
    pins = {k: E.v(t) for k, t in PIN_T.items()}

    def next_beat(t, tol=0.08):
        i = np.searchsorted(vb, t - tol)
        return float(vb[min(i, len(vb) - 1)])

    out, probs, t = [], [], 0.0
    sec_start = 0
    for i, e in enumerate(S):
        e = dict(e)
        e["need"] = round(budget(e), 2)
        if "at" in e:
            t0 = e["at"]
        elif "pin" in e:
            t0 = pins[e["pin"]]
            if t0 < t - 0.05:
                probs.append(f"{e['id']}: previous lines run {t - t0:.2f}s past the pin '{e['pin']}'")
            elif e["pin"] in SECTION_PIN or e["pin"] == "dark":
                # slack before the pin: shift everything after the section's elastic moment by whole beats
                slack = t0 - t
                el = next((j for j in range(sec_start, len(out)) if out[j].get("elastic")), None)
                if el is not None and slack > 0:
                    beat = float(np.median(np.diff(vb)))
                    sh = math.floor(slack / beat) * beat
                    for j in range(el + 1, len(out)):
                        out[j]["t0"] = round(out[j]["t0"] + sh, 3)
        else:
            t0 = next_beat(t)
        e["t0"] = round(t0, 3)
        out.append(e)
        t = t0 + e["need"]
        if e.get("pin") in SECTION_PIN or e.get("pin") in ("lights", "answer", "flip"):
            sec_start = len(out)
    for a, b in zip(out, out[1:]):
        a["t1"] = b["t0"]
    out[-1]["t1"] = round(E.v(end_track), 3)
    for e in out:
        if e.get("until"):
            e["t1"] = round(pins[e["until"]], 3)
    return out, probs, E, vb, pins


def bar_index(t):
    return int(np.argmin(np.abs(BARS - t)))


def cut_run(win, n):
    c, lo, hi = win
    a = max(lo, c - n // 2)
    b = min(hi + 1, a + n)
    a = b - n
    return (float(BARS[a]), float(BARS[b])) if n > 0 else None


def solve():
    """Largest whole-bar cut per section that still lets every line finish before the section's pin."""
    cuts = []
    end_track = float(BARS[-1])
    for k, win in enumerate(CUT_WINDOWS):
        best = None
        for n in range(0, win[2] - win[1] + 2):
            c = cut_run(win, n)
            trial = cuts + ([c] if c else [])
            ev, probs, *_ = plan(trial, end_track)
            pin = SECTION_PIN[k]
            if any(p.split(":")[0] == next(e["id"] for e in S if e.get("pin") == pin) for p in probs):
                break
            best = c
        if best:
            cuts.append(best)
    ev, probs, E, vb, pins = plan(cuts, end_track)
    # end of the film: the bar after the last event's natural end, so the fade lands on a downbeat
    last = ev[-1]
    need_end = last["t0"] + last["need"]
    track_end = next(b for b in BARS if E.v(b) >= need_end - 0.05)
    ev, probs, E, vb, pins = plan(cuts, float(track_end))
    return cuts, float(track_end), ev, probs, E, vb, pins


def report(ev, probs, dur):
    wait = 0.0
    print(f"{'id':7s} {'t0':>7s} {'t1':>7s} {'need':>5s} {'wait':>5s}  text")
    for e in ev:
        held = e["t1"] - e["t0"]
        w = max(0.0, held - e["need"]) if e["kind"] != "beat" and e["id"] != "ask" and not e.get("elastic") else 0.0
        wait += w
        flag = "  <-- WAIT" if w > 1.2 else ("  <-- SHORT" if held < e["need"] - 0.25 else "")
        print(f"{e['id']:7s} {e['t0']:7.2f} {e['t1']:7.2f} {e['need']:5.2f} {w:5.2f}  {e.get('text', e['scene'])[:24]}{flag}")
    print(f"duration {dur:.2f}s, waiting {wait:.1f}s = {100 * wait / dur:.1f}%")
    for p in probs:
        print("PROBLEM", p)


if __name__ == "__main__":
    cuts, end, ev, probs, E, vb, pins = solve()
    dur = E.v(end)
    print("cuts", [(round(a, 2), round(b, 2)) for a, b in cuts], "end", round(end, 2))
    report(ev, probs, dur)
    json.dump(dict(duration=dur, start=START, cuts=cuts, end=end, pins=pins, beats=vb.round(3).tolist(), events=ev),
              open(HERE / "timeline.json", "w"), ensure_ascii=False, indent=1)
