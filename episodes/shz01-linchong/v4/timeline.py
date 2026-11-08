"""v4 narration timeline: measured clips (tempo 1.08) placed on the 笛子戏 grid at the script's target times, never
overlapping (gap >= 0.25 s), with hard anchors: W05 ends before the title (18.657), W06 on the drill thrust, W25 inside
the music's near-silence before the drop, W26 on the drop (93.565), W38 on the brushed 依旧夫妻完聚 (134.21).
usage: timeline.py <vo_dir> <out.json>"""
import sys, json, subprocess
vo, out = sys.argv[1:3]
TEMPO = 1.08
TARGET = {'W01': 0.3, 'W02': 6.4, 'W03': 10.15, 'W04': 13.25, 'W05': 16.75, 'W06': 27.05, 'W07': 31.45, 'W08': 35.65,
          'W09': 39.45, 'W10': 43.4, 'W11': 45.85, 'W12': 49.3, 'W13': 52.9, 'W14': 55.45, 'W15': 58.55, 'W16': 60.6,
          'W17': 63.85, 'W18': 68.35, 'W19': 70.75, 'W20': 75.35, 'W21': 78.55, 'W22': 82.15, 'W23': 85.85, 'W24': 88.1,
          'W25': 91.8, 'W26': 93.65, 'W27': 95.6, 'W28': 100.3, 'W29': 104.65, 'W30': 107.45, 'W31': 110.15, 'W32': 112.75,
          'W33': 116.0, 'W34': 121.6, 'W35': 123.1, 'W36': 126.25, 'W37': 129.95, 'W38': 134.15, 'W39': 137.55}
HARD = {'W06': 27.05, 'W26': 93.65, 'W38': 134.15}
TEXT = {}
for l in open(sys.argv[3] if len(sys.argv) > 3 else 'v4/lines.txt', encoding='utf-8'):
    if '|' in l: k, t = l.strip().split('|', 1); TEXT[k] = t
def dur(k):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{vo}/{k}.mp3'], capture_output=True, text=True)
    return round(float(r.stdout) / TEMPO, 3)
lines, prev_end = [], 0.0
for k in sorted(TARGET, key=lambda x: int(x[1:])):
    d = dur(k)
    st = HARD.get(k, max(TARGET[k], prev_end + 0.2))
    lines.append({'id': k, 'start': round(st, 3), 'dur': d, 'end': round(st + d, 3), 'text': TEXT[k]})
    prev_end = st + d
for a, b in zip(lines, lines[1:]):
    if b['start'] < a['end'] + 0.2: print('OVERLAP', a['id'], a['end'], b['id'], b['start'])
for k, lim in (('W05', 18.5), ('W25', 93.45), ('W37', 133.9), ('W39', 141.6)):
    l = next(x for x in lines if x['id'] == k)
    if l['end'] > lim: print('LATE', k, l['end'], '>', lim)
json.dump({'tempo': TEMPO, 'voice': 'WuLq5z7nEcrhppO0ZQJw (same narrator as v2), eleven_v4, run shz01-vo-03', 'lines': lines}, open(out, 'w'), ensure_ascii=False, indent=1)
for l in lines: print(l['id'], l['start'], l['end'], l['text'])
