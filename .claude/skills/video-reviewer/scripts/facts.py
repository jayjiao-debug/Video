#!/usr/bin/env python3
"""Source checks: banned sources anywhere in the script, and every number on screen traced to the facts table.

usage: facts.py SCRIPT.md [--lines lines.json] [--src DIR]
"""
import argparse, json, re
from pathlib import Path

BANNED = ['wikipedia', 'wiki/', '维基', '百度百科', 'baike.baidu', 'zhihu', '知乎', 'csdn', 'toutiao', '百家号', 'sohu.com/a', 'quora']
CN = {'零': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100, '千': 1000, '万': 10000}


def numbers(s):
    s = re.sub(r'[\[\]{}]', '', s)
    out = set(re.findall(r'\d+(?:[.,]\d+)*%?', s))
    for m in re.findall(r'[一二两三四五六七八九十百千万]{2,}', s):
        out.add(m)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('script'); ap.add_argument('--lines'); ap.add_argument('--src')
    a = ap.parse_args()
    text = Path(a.script).read_text()
    flags = []
    low = text.lower()
    NEG = ('不用', '不引用', '禁用', '禁止', 'never', 'not ', 'no ')
    for b in BANNED:
        for m in re.finditer(re.escape(b), low):
            line_no = text[:m.start()].count('\n') + 1
            line = text.splitlines()[line_no - 1].lower()
            if any(n in line for n in NEG):
                continue  # a rule saying not to use it, not a citation
            flags.append(['BLOCKER', f'{a.script}:{line_no} cites a banned source ({b}); find the primary source'])
    if a.src:
        for f in Path(a.src).rglob('*.tsx'):
            t = f.read_text().lower()
            for b in BANNED[:4]:
                if b in t:
                    flags.append(['BLOCKER', f'{f} mentions {b} (on-screen source?)'])
    if a.lines:
        lines = json.load(open(a.lines))
        norm = text.replace(',', '').replace('，', '')
        for s, e, txt in lines:
            for n in numbers(txt):
                bare = n.replace(',', '').rstrip('%')
                if bare in {'1', '2', '0'}:
                    continue
                if bare not in norm and n not in text:
                    flags.append(['MAJOR', f'{s:.1f}s "{txt}": the number {n} is not in the facts table; add its source or fix the line'])
    has_table = '|' in text and ('来源' in text or 'source' in low)
    if not has_table:
        flags.append(['MAJOR', 'no facts table with sources found in the script'])
    for sev, m in flags:
        print(f'  [{sev}] {m}')
    if not flags:
        print('  sources: no problems found')
    json.dump(flags, open(Path(a.script).with_suffix('.facts_flags.json'), 'w'), ensure_ascii=False)


if __name__ == '__main__':
    main()
