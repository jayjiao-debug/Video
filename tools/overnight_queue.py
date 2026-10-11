#!/usr/bin/env python3
"""Overnight queue: python3 tools/overnight_queue.py status | next | start N | done N "note" | partial N "note" | fail N "reason" | log "text"
Queue: overnight/queue.md, lines `- [ ] working title | topic | notes`; states [ ] todo, [~] running, [x] done, [!] failed, [p] partial.
Every change is appended to reports/overnight_<date>.md. Never raises; `next` returns a crashed [~] item first."""
import datetime as dt, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
Q = ROOT / 'overnight' / 'queue.md'
LINE = re.compile(r'^- \[(.)\] (.*)$')

def now():
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=2))).strftime('%Y-%m-%d %H:%M')

def report(text):
    try:
        day = dt.datetime.now(dt.timezone(dt.timedelta(hours=2))).strftime('%Y-%m-%d')
        p = ROOT / 'reports' / f'overnight_{day}.md'
        p.parent.mkdir(parents=True, exist_ok=True)
        if not p.exists():
            p.write_text(f'# Overnight batch {day}\n\n')
        with p.open('a') as f:
            f.write(f'- {now()} · {text}\n')
    except Exception as e:  # never fail
        print(f'(report write failed: {e})')

def items():
    try:
        lines = Q.read_text().splitlines()
    except Exception:
        return [], []
    out = []
    for i, l in enumerate(lines):
        m = LINE.match(l)
        if m:
            out.append([i, m.group(1), m.group(2)])
    return lines, out

def setstate(n, st, note=''):
    lines, its = items()
    if not 1 <= n <= len(its):
        print(f'no item {n}')
        return
    i, _, body = its[n - 1]
    lines[i] = f'- [{st}] {body}'
    try:
        Q.write_text('\n'.join(lines) + '\n')
    except Exception as e:
        print(f'(queue write failed: {e})')
    label = {'~': 'start', 'x': 'done', '!': 'FAIL', 'p': 'partial'}[st]
    report(f'#{n} {label}: {body.split("|")[0].strip()}' + (f' — {note}' if note else ''))
    print(f'#{n} -> [{st}]')

def main(a):
    cmd = a[0] if a else 'status'
    if cmd == 'status':
        _, its = items()
        for k, (_, st, body) in enumerate(its, 1):
            print(f'{k}. [{st}] {body}')
        if not its:
            print('(queue empty)')
    elif cmd == 'next':
        _, its = items()
        for st in ('~', ' '):
            for k, (_, s, body) in enumerate(its, 1):
                if s == st:
                    print(f'{k} | {body}')
                    return
        print('NONE')
    elif cmd in ('start', 'done', 'partial', 'fail'):
        try:
            n = int(a[1])
        except Exception:
            print('need N')
            return
        setstate(n, {'start': '~', 'done': 'x', 'partial': 'p', 'fail': '!'}[cmd], ' '.join(a[2:]))
    elif cmd == 'log':
        report(' '.join(a[1:]))
        print('logged')
    else:
        print(__doc__)

try:
    main(sys.argv[1:])
except Exception as e:
    print(f'(overnight_queue error ignored: {e})')
