#!/usr/bin/env python3
"""Build src/timeline.json from the voice-over clips.

    python3 scripts/timeline.py

Reads script/vo.json ([chapter, id, tts_text, display_text|null]), public/vo/<id>.mp3 and public/vo/words.json
(edge-tts word boundaries), public/vo/<id>.wav (the clips with their silence trimmed), src/music.json (beat grid of the full track). The music starts at MUSIC_OFFSET in the
track, so the track's first drop (b32) lands on the title.

Rules: lines in a chapter follow each other with a short breath; a new chapter starts on the next beat after a
longer breath (the picture cuts there, the voice starts just after); the title question (h3) starts on the drop.
Captions: each line is split at its punctuation into chunks of at most ~18 characters, timed from the word
boundaries of the voice.
"""
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VO = json.loads((ROOT / 'script/vo.json').read_text())
WORDS = json.loads((ROOT / 'public/vo/words.json').read_text())
BEATS_TRACK = json.loads((ROOT / 'src/music.json').read_text())['beats']
MUSIC_OFFSET = BEATS_TRACK[16]           # film t=0 is track beat 16 (a bar line)
BEATS = [round(b - MUSIC_OFFSET, 3) for b in BEATS_TRACK if b - MUSIC_OFFSET >= -0.01]
TITLE_DROP = BEATS_TRACK[32] - MUSIC_OFFSET
BREATH, CH_BREATH, LEAD = 0.22, 0.35, 0.08
END_CARD = 4.2


def dur(p):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(p)], capture_output=True, text=True).stdout)


def next_beat(t):
    return min((b for b in BEATS if b >= t - 1e-3), default=t)


PUNCT = '，。；：？！、,.;:?!'


def segments(s):
    """split at punctuation, keeping it with the left part"""
    out, cur = [], ''
    for ch in s:
        cur += ch
        if ch in PUNCT:
            out.append(cur); cur = ''
    if cur.strip():
        out.append(cur)
    return out


def chunk_times(tts, disp, words, a, z):
    ts, ds = segments(tts), segments(disp)
    if len(ts) != len(ds):
        ts = ds = segments(disp)
    # char offset of each tts segment start, mapped to a time through the word boundaries
    pos, starts = 0, []
    for seg in ts:
        starts.append(pos); pos += len(seg)
    wpos, cursor = [], 0
    for off, d, w in words:
        i = tts.find(w, cursor)
        if i < 0:
            continue
        wpos.append((i, off)); cursor = i + len(w)

    def t_at(ci):
        best = None
        for i, off in wpos:
            if i >= ci:
                best = off; break
        return a + (best if best is not None else (z - a) * ci / max(1, len(tts)))
    seg_t = [t_at(s) for s in starts]
    # group segments into chunks of <= 18 display chars
    chunks, cur, cur_a = [], '', None
    for k, seg in enumerate(ds):
        if cur and len(re.sub(r'[“”"]', '', cur + seg)) > 20:
            chunks.append([cur_a, seg_t[k], cur]); cur, cur_a = '', None
        if cur_a is None:
            cur_a = seg_t[k] if k else a
        cur += seg
    chunks.append([cur_a, z, cur])
    for i in range(len(chunks) - 1):
        chunks[i][1] = chunks[i + 1][0]
    return [[round(c[0], 3), round(c[1], 3), c[2].rstrip('，。；：、,;:—')] for c in chunks]


lines, chapters = [], []
t, prev_ch = 0.15, None
for ch, lid, tts, disp in VO:
    disp = disp or tts
    d = dur(ROOT / f'public/vo/{lid}.wav')
    if lid == 'h3':  # the question ends just before the drop; the title lands on the drop
        t = max(t, TITLE_DROP - d - 0.06)
    elif ch != prev_ch and prev_ch is not None:
        cut = next_beat(max(t + CH_BREATH - LEAD, TITLE_DROP + 1.4 if prev_ch == 'hook' else 0))
        chapters[-1]['z'] = cut
        chapters.append({'id': ch, 'a': cut, 'z': None})
        t = cut + LEAD
    if prev_ch is None:
        chapters.append({'id': ch, 'a': 0.0, 'z': None})
    a, z = t, t + d
    words = WORDS.get(lid, [])
    lead = words[0][0] if words else 0.0  # the clip was trimmed to its first sound
    words = [[max(0.0, o - lead), dd, w] for o, dd, w in words]
    wmarks, cur = [], 0
    for off, dd, w in words:
        i = tts.find(w, cur)
        if i >= 0:
            wmarks.append([i, round(a + off, 3)]); cur = i + len(w)
    lines.append({'id': lid, 'ch': ch, 'a': round(a, 3), 'z': round(z, 3), 'text': disp, 'tts': tts, 'w': wmarks,
                  'chunks': chunk_times(tts, disp, words, a, z - 0.05)})
    t = z + BREATH
    prev_ch = ch
end_card = next_beat(t + 0.35)
chapters[-1]['z'] = end_card
end = round(end_card + END_CARD, 3)
tl = {'lines': lines, 'chapters': chapters, 'end': end, 'endCard': end_card, 'title': round(TITLE_DROP, 3),
      'musicOffset': MUSIC_OFFSET, 'beats': [b for b in BEATS if b <= end + 1]}
(ROOT / 'src/timeline.json').write_text(json.dumps(tl, ensure_ascii=False, indent=1))
for c in chapters:
    print(f"{c['id']:8s} {c['a']:7.2f} – {c['z']:7.2f}")
print('title drop', round(TITLE_DROP, 2), '| end card', end_card, '| film', end, 's')
