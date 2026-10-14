"""Subtitle-only timeline for Ep1 《消失的13号房》, laid on the owner's BGM.

The story sets the length: every line gets its reading budget (0.5 s + chars/7 + 0.6 s); structural
moments are pinned to the music (title on the first return of the kick, the question in the long
quiet before the big drop, the answer on the drop, the wall torn open on the next return); whole
bars are cut out of the track so those pins fall where the story needs them. Lines start on beats.

python3 ep_timeline.py   -> timeline.json, audio/bgm_edit.wav, and a pace report
"""
import json, math, pathlib, sys
import numpy as np

HERE = pathlib.Path(__file__).resolve().parent
MUSIC = json.load(open(HERE / "audio" / "music.json"))
BEATS = np.array(MUSIC["beats"])
BARS = np.array([b["t"] for b in MUSIC["bars"]])

# ------------------------------------------------------------------ music edit (original-track seconds)
START = 28.72                 # bar 14: one full bar, then the kick drops out under the hook
CUTS = [(75.58, 85.78)]       # bars 37-41 removed: five bars of repeated groove in the search
END = 187.66                  # end of bar 91, faded


def v(track):
    """Original-track time -> video time."""
    t = track - START
    for a, b in CUTS:
        if track >= b:
            t -= b - a
        elif track > a:
            t -= track - a
    return t


VBEATS = np.array([v(b) for b in BEATS if START <= b < END and not any(a <= b < c for a, c in CUTS)])
DUR = v(END)

# pins (video seconds), named by what lands there
PIN = dict(
    title=v(34.85),        # the kick returns after the quiet bar
    question=v(132.61),    # the long quiet before the big drop
    answer=v(140.81),      # the drop's strongest downbeat
    verdict=v(167.30),     # the music drops out: the culprit's name in the quiet
    tear=v(169.34),        # the kick returns: the wallpaper is torn open
)

CPS, BASE, LOOK = 7.0, 0.5, 0.6

# ------------------------------------------------------------------ the script
# kind: n = narrator (Holmes, narrator band), a/m/b/l = Ada, manager, porter, maid (dialogue box),
#       card = full-screen text card, beat = a scripted visual beat with no line (named event)
# scene: which picture is on screen
S = [
    # hook
    dict(id="h1", kind="a", scene="hook", text="昨晚，哥哥住进了13号房。", at=0.25),
    dict(id="h2", kind="a", scene="hook", text="今早，13号房不见了。", pin="h2"),
    dict(id="title", kind="beat", scene="title", dur=2.4, pin="title"),
    # Holmes
    dict(id="me", kind="n", scene="holmes", text="我是福尔摩斯。"),
    dict(id="past", kind="n", scene="holmes", text="三年前，我说错过一个名字。"),
    dict(id="vow", kind="n", scene="holmes", text="所以这一次，我不出手。"),
    dict(id="you", kind="n", scene="holmes", text="侦探，是你。"),
    dict(id="rule", kind="card", scene="rule", text="我看到的，你都能看到。|但我不会替你指出来。", dur=3.4),
    dict(id="three", kind="n", scene="three", text="旅馆里，有三个人。", extra=0.6),
    # front desk
    dict(id="a1", kind="a", scene="desk_ada", text="九点四十五我们到的。|他住13号，就在我隔壁！"),
    dict(id="m1", kind="m", scene="desk_mgr", text="小姐，本店从来没有13号房。"),
    dict(id="m2", kind="m", scene="desk_mgr", text="您是一个人来的。"),
    dict(id="a2", kind="a", scene="desk_ada", text="哥哥一进门就盯着您看，|说好像在哪儿见过您！"),
    dict(id="a3", kind="a", scene="desk_ada", text="我累坏了，一沾枕头就睡死了。"),
    dict(id="kb", kind="n", scene="keyboard", text="你看了一眼前台的钥匙板。", extra=1.2),
    dict(id="book", kind="n", scene="register", text="登记簿上，昨晚只有她一个人。", extra=1.6),
    dict(id="m3", kind="m", scene="desk_mgr", text="每一位客人，都是我亲手登记的。"),
    dict(id="m4", kind="m", scene="desk_mgr_porter", text="他？他连自己的名字都不会写。"),
    dict(id="b1", kind="b", scene="desk_porter", text="她是一个人坐马车来的。"),
    dict(id="b2", kind="b", scene="desk_porter", text="十点半，我就锁了大门。"),
    # upstairs
    dict(id="up", kind="n", scene="corridor", text="你上了二楼。", extra=2.4),
    dict(id="m5", kind="m", scene="corr_mgr", text="这条走廊的墙纸，十年没换过。"),
    dict(id="l1", kind="l", scene="corr_maid", text="经理说，二楼今早只收拾12号。"),
    dict(id="l2", kind="l", scene="corr_maid", text="昨晚十点四十五，|二楼一股浆糊味。"),
    dict(id="street", kind="n", scene="facade", text="你走到街上，抬头看了看二楼。", extra=1.8),
    dict(id="a4", kind="a", scene="facade_ada", text="托马斯……你到底在哪？"),
    dict(id="ready", kind="n", scene="ready", text="好了，侦探。|所有线索，都已经出现在你眼前。"),
    # pause
    dict(id="ask", kind="card", scene="board", text="13号房去哪了？|是谁让它消失的？", pin="question", until="answer"),
    # answer
    dict(id="r0", kind="n", scene="most", text="大多数人会说：她记错了。|再不然，就是门房。", pin="answer"),
    dict(id="r1", kind="n", scene="count", text="二楼有五扇窗，走廊只有四扇门。|13号房，就在这面墙后面。", extra=0.6),
    dict(id="r3", kind="n", scene="cuff", text="墙是门房贴的。|可他只是个跑腿的。"),
    dict(id="r4", kind="n", scene="pages", text="登记簿整页一样新，|是一夜之间重抄的。"),
    dict(id="r5", kind="n", scene="quotes", text="经理说每位客人都是他亲手写的。|门房，不会写字。"),
    dict(id="r6", kind="n", scene="plate", text="拆掉门牌、重抄登记簿的，|只能是经理。"),
    dict(id="r7", kind="n", scene="verdict", text="让13号房消失的，是经理。", pin="verdict"),
    dict(id="tear", kind="beat", scene="tear", dur=1.6, pin="tear"),
    dict(id="r8", kind="n", scene="thomas", text="墙后，托马斯被下了药，还活着。"),
    dict(id="r9", kind="n", scene="motive", text="他认出了经理：|五年前卷款潜逃的会计。"),
    dict(id="end", kind="n", scene="leave", text="你看出来了吗？|下一案，还交给你。", extra=0.8),
    dict(id="lights", kind="beat", scene="lights", dur=4.0),
]


def budget(e):
    if e["kind"] == "beat":
        return e["dur"]
    n = len(e["text"].replace("|", ""))
    return max(e.get("dur", 0), BASE + n / CPS + LOOK) + e.get("extra", 0.0)


def next_beat(t, tol=0.08):
    i = np.searchsorted(VBEATS, t - tol)
    return float(VBEATS[min(i, len(VBEATS) - 1)])


def plan():
    """Place each event at the first beat after the previous one ends; pinned events at their pin.
    Returns events with t0/t1 and a list of problems (overlaps into pins, long waits)."""
    out, probs = [], []
    t = 0.0
    pins = {k: v for k, v in PIN.items()}
    pins["h2"] = PIN["title"] - 2.75 - 0.05      # the second hook line holds over the quiet bar
    for i, e in enumerate(S):
        e = dict(e)
        need = budget(e)
        if "at" in e:
            t0 = e["at"]
        elif "pin" in e:
            t0 = pins[e["pin"]]
            if t0 < t - 0.05:
                probs.append(f"{e['id']}: previous lines run {t - t0:.2f}s past the pin '{e['pin']}'")
        else:
            t0 = next_beat(t)
        e["t0"] = round(t0, 3)
        e["need"] = round(need, 2)
        out.append(e)
        t = t0 + need
    # each event ends where the next begins (the last one ends at DUR)
    for a, b in zip(out, out[1:]):
        a["t1"] = b["t0"]
    out[-1]["t1"] = round(DUR, 3)
    for e in out:
        if e.get("until"):
            e["t1"] = pins[e["until"]]
    return out, probs


def report(ev, probs):
    wait = 0.0
    print(f"{'id':7s} {'t0':>7s} {'t1':>7s} {'need':>5s} {'wait':>5s}  text")
    for e in ev:
        held = e["t1"] - e["t0"]
        w = max(0.0, held - e["need"]) if e["kind"] not in ("beat",) and e["id"] != "ask" else 0.0
        wait += w
        flag = "  <-- WAIT" if w > 1.2 else ("  <-- SHORT" if held < e["need"] - 0.25 else "")
        print(f"{e['id']:7s} {e['t0']:7.2f} {e['t1']:7.2f} {e['need']:5.2f} {w:5.2f}  {e.get('text', e['scene'])[:24]}{flag}")
    print(f"duration {DUR:.2f}s, waiting {wait:.1f}s = {100 * wait / DUR:.1f}%")
    for p in probs:
        print("PROBLEM", p)


if __name__ == "__main__":
    ev, probs = plan()
    report(ev, probs)
    json.dump(dict(duration=DUR, start=START, cuts=CUTS, end=END, pins=PIN, beats=VBEATS.round(3).tolist(),
                   events=ev), open(HERE / "timeline.json", "w"), ensure_ascii=False, indent=1)
