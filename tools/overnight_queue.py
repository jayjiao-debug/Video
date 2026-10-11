#!/usr/bin/env python3
"""Overnight queue for Juno episodes: a plain-text queue that survives crashes and session restarts.

Queue file: overnight/queue.md, one item per line:
    - [ ] 你以为大家都在看你 | 聚光灯效应 | optional notes
States: [ ] todo · [~] running · [x] done · [!] failed · [p] partial

Usage:
    python3 tools/overnight_queue.py status              # print every item with its state
    python3 tools/overnight_queue.py next                # print the next item to work on (a [~] left from a crash first, then [ ])
    python3 tools/overnight_queue.py start N             # mark item N running
    python3 tools/overnight_queue.py done N "note"       # mark done, log the note
    python3 tools/overnight_queue.py partial N "note"    # some outputs exist, something is missing
    python3 tools/overnight_queue.py fail N "reason"     # mark failed, log the reason, the batch moves on
    python3 tools/overnight_queue.py log "text"          # append a free line to today's report
Never raises on a bad call: it prints the problem and exits 0, so a batch never stops on the queue tool.
"""
import sys, re, os, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUEUE = os.path.join(ROOT, "overnight", "queue.md")
MARK = {"todo": " ", "running": "~", "done": "x", "failed": "!", "partial": "p"}
LINE = re.compile(r"^(\s*-\s*\[)(.)(\]\s*)(.*)$")


def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M")


def report_path():
    d = os.path.join(ROOT, "reports")
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, "overnight_%s.md" % datetime.date.today().isoformat())


def log(text):
    p = report_path()
    new = not os.path.exists(p)
    with open(p, "a", encoding="utf-8") as f:
        if new:
            f.write("# Overnight report %s\n\n" % datetime.date.today().isoformat())
        f.write("- %s  %s\n" % (now(), text))


def load():
    if not os.path.exists(QUEUE):
        os.makedirs(os.path.dirname(QUEUE), exist_ok=True)
        with open(QUEUE, "w", encoding="utf-8") as f:
            f.write("# Overnight queue\n\n<!-- one topic per line: - [ ] title | topic | notes -->\n")
    with open(QUEUE, encoding="utf-8") as f:
        lines = f.read().split("\n")
    items = [(i, m) for i, l in enumerate(lines) if (m := LINE.match(l))]
    return lines, items


def save(lines):
    tmp = QUEUE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    os.replace(tmp, QUEUE)


def set_state(n, state, note=""):
    lines, items = load()
    if not 1 <= n <= len(items):
        print("no item %d (queue has %d)" % (n, len(items)))
        return
    i, m = items[n - 1]
    lines[i] = m.group(1) + MARK[state] + m.group(3) + m.group(4)
    save(lines)
    log("#%d %s — %s%s" % (n, state.upper(), m.group(4).split("|")[0].strip(), (" · " + note) if note else ""))
    print("#%d -> %s" % (n, state))


def main(a):
    cmd = a[0] if a else "status"
    lines, items = load()
    if cmd == "status":
        if not items:
            print("queue is empty: %s" % QUEUE)
        for k, (i, m) in enumerate(items, 1):
            print("%2d [%s] %s" % (k, m.group(2), m.group(4)))
    elif cmd == "next":
        for want in ("~", " "):
            for k, (i, m) in enumerate(items, 1):
                if m.group(2) == want:
                    print("%d | %s" % (k, m.group(4)))
                    return
        print("NONE")
    elif cmd in ("start", "done", "partial", "fail") and len(a) >= 2 and a[1].isdigit():
        state = {"start": "running", "fail": "failed"}.get(cmd, cmd)
        set_state(int(a[1]), state, " ".join(a[2:]))
    elif cmd == "log" and len(a) >= 2:
        log(" ".join(a[1:]))
        print("logged")
    else:
        print(__doc__)


if __name__ == "__main__":
    try:
        main(sys.argv[1:])
    except Exception as e:  # the queue tool must never be the thing that stops a batch
        print("queue.py error (ignored): %r" % (e,))
    sys.exit(0)
