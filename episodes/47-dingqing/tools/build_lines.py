"""ep47 lines → lines.json, starts snapped to the bgm2 v2 beat grid (music_map_ep42.json "v2").

Main grid: 0.5688 + 0.56605*k until the coda; coda lines sit on the coda's chord changes;
after the intro return (128.705) the grid restarts at 128.705 + 0.5688 + 0.56605*k.
Each row: (id, start_s, end_s or None, text, facts). end None = next line's start.
"""
import json, sys
from pathlib import Path

P, T0, RET = 0.56605, 0.5688, 128.705
CODA = [117.157, 118.17, 119.10, 120.26, 121.34, 122.58, 123.61, 124.77, 125.92]   # v2 film times

def snap(t):
    if t < 0.3: return 0.0
    if 116.0 < t < 128.0: return min(CODA, key=lambda c: abs(c - t))
    base = RET + T0 if t >= RET else T0
    return round(base + round((t - base) / P) * P, 3)

L = [
 # cold open 0–9.06
 ('C1',   0.00, None,   '你们的情侣头像，', 'F17'),
 ('C2',   2.27, None,   '一张图，[一人一半]。', 'F17'),
 ('C3',   4.53, 9.06,   '这一招，[一千四百多年前]就有人用了。', 'F10'),
 # 9.06 HIT → title card (picture beat, no subtitle) until 11.89
 # S1 先秦
 ('A1',  11.89, None,   '两千多年前，《诗经》里唱：', 'F1'),
 ('A2',  14.15, None,   '你送我一个[木瓜]，', 'F1'),
 ('A3',  16.42, None,   '我回你一块[美玉]。', 'F1'),
 ('A4',  18.68, None,   '不是为了还礼，', 'F1'),
 ('A5',  20.95, 24.35,  '是想[永远好下去]。', 'F1'),
 # S2 东汉
 ('B1',  25.48, None,   '东汉末年，一首[《定情诗》]里：', 'F2'),
 ('B2',  28.31, None,   '金臂环，明珠耳环，', 'F2'),
 ('B3',  30.57, None,   '还有一对[银戒指]。', 'F2'),
 ('B4',  32.84, None,   '一千八百年前，就送[戒指]了。', 'F3'),
 ('B5',  35.67, 38.5,   '而且，好多都是[一对]。', 'F2'),
 # S3 破镜 (break 47.55, re-entry HIT 48.117)
 ('D1',  39.06, None,   '相传，南朝陈快亡国时，', 'F4'),
 ('D2',  41.33, None,   '驸马徐德言打破一面镜子，', 'F4'),
 ('D3',  44.16, 47.50,  '和妻子[一人一半]。', 'F4'),
 ('D4',  48.12, None,   '约好：将来正月十五，在集市上[卖镜子]。', 'F5'),
 ('D5',  51.50, None,   '国破了，她被送进[杨素]府里。', 'F6'),
 ('D6',  54.33, None,   '他一路找到京城，', 'F7'),
 ('D7',  56.60, None,   '正月十五，真有人在卖[半面镜子]。', 'F7'),
 ('D8',  59.43, None,   '两个一半，[对上了]。', 'F7'),
 ('D9',  61.70, None,   '杨素把她[还给了他]。', 'F9'),
 ('D10', 63.97, 66.2,   '这就是，[破镜重圆]。', 'F4'),
 # S5 valley 唐
 ('E1',  66.23, None,   '唐朝，白居易写杨贵妃：', 'F11'),
 ('E2',  69.63, None,   '她把金钗[掰成两股]，', 'F11'),
 ('E3',  71.89, None,   '留下一股，[寄一股给他]。', 'F11'),
 ('E4',  74.15, None,   '“但教心似金钿坚，', 'F11'),
 ('E5',  76.42, 79.2,   '天上人间会相见。”', 'F11'),
 # S6 build: modern, faster
 ('G1',  79.82, None,   '1970年代，谈婚论嫁要[三转一响]：', 'F13'),
 ('G2',  82.65, None,   '自行车、手表、缝纫机、收音机。', 'F13'),
 ('G3',  85.48, None,   '一辆自行车，约等于[三个月工资]。', 'F14'),
 ('G4',  88.31, None,   '1998年，一首歌把[520]唱成了“我爱你”。', 'F15'),
 ('G5',  91.14, 95.6,   '2016年5月20日，红包上限变成[520]。', 'F16'),
 # stop HIT 96.231, silence 96.92–97.9, lead-in
 ('H1',  96.23, None,   '可你回头看：', 'F4,F11'),
 ('H2',  98.50, None,   '镜子，[一人一半]。', 'F4'),
 ('H3', 100.76, None,   '金钗，[一人一股]。', 'F11'),
 ('H4', 103.03, 105.8,  '两千多年过去了，', 'F1'),
 # DROP 106.986
 ('P1', 106.99, None,   '今天的情侣头像，[还是一人一半]。', 'F17'),
 ('P2', 110.38, None,   '东西一直在换，意思[没变过]：', ''),
 ('P4', 113.21, 116.0,  '我把一半，[留给你]。', ''),
 # coda on chord changes
 ('K1', 117.16, None,   '破镜的那一对，后来[重圆]了。', 'F9'),
 ('K2', 120.26, None,   '金钗的那一对，只能[天上人间]。', 'F11'),
 ('K3', 123.61, 127.0,  '你手里那一半，[给了谁]？', ''),
 # intro return 128.705 → FINAL HIT 137.765 → end card
 ('Q1', 129.26, None,   '你们的情侣头像，', ''),
 ('Q2', 131.53, 137.7,  '[换过几次]了？', ''),
]

rows, meta = [], []
for i, (lid, s, e, txt, f) in enumerate(L):
    s2 = snap(s)
    if e is None:
        e2 = snap(L[i + 1][1])
    else:
        e2 = e
    rows.append([s2, round(e2, 3), txt]); meta.append({'id': lid, 'start': s2, 'end': round(e2, 3), 'text': txt, 'facts': f})
out = Path(sys.argv[1] if len(sys.argv) > 1 else '.')
(out / 'lines.json').write_text(json.dumps(rows, ensure_ascii=False, indent=0))
(out / 'lines_meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1))
print(len(rows), 'lines; last end', rows[-1][1])
