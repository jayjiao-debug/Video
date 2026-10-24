"""Write lines_v3.json (the mix's clip list) from vo_timeline_v3.json (the single source of times). GAIN: per-clip level offsets in dB
relative to the narration target (e.g. the caller's whispered line sits under the narrator)."""
import json
GAIN = {'vo08/YOU0': -4.0, 'vo08/MOM1': -2.0}
V = json.load(open('vo_timeline_v3.json'))
json.dump([dict(file=e[0], at=e[1], fx=e[2], extra=e[3], **({'gain': GAIN[e[0]]} if e[0] in GAIN else {})) for e in V], open('lines_v3.json', 'w'), ensure_ascii=False, indent=1)
print(len(V), 'lines')
