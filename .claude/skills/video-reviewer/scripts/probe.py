#!/usr/bin/env python3
"""Technical checks on a finished film: format, bitrate, loudness, silence, black frames,
single-frame glitches, hard cuts. Writes probe.json into OUT and prints a short summary.

usage: probe.py VIDEO --out DIR
"""
import argparse, json, re, subprocess, sys
from pathlib import Path
import numpy as np


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def ffprobe(video):
    r = run(['ffprobe', '-v', 'error', '-show_entries',
             'stream=codec_type,codec_name,width,height,r_frame_rate,bit_rate,pix_fmt:format=duration,size,bit_rate',
             '-of', 'json', str(video)])
    return json.loads(r.stdout)


def loudness(video):
    r = run(['ffmpeg', '-hide_banner', '-i', str(video), '-af', 'loudnorm=print_format=json', '-f', 'null', '-'])
    err = r.stderr
    try:
        j = json.loads(err[err.rindex('{'):err.rindex('}') + 1])
        return {'integrated_lufs': float(j['input_i']), 'true_peak_db': float(j['input_tp']), 'lra': float(j['input_lra'])}
    except Exception:
        return None


def black_frames(video):
    r = run(['ffmpeg', '-hide_banner', '-i', str(video), '-vf', 'blackdetect=d=0.12:pix_th=0.07', '-an', '-f', 'null', '-'])
    return [{'start': float(a), 'end': float(b)} for a, b in re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', r.stderr)]


def silences(video):
    r = run(['ffmpeg', '-hide_banner', '-i', str(video), '-af', 'silencedetect=noise=-45dB:d=1.2', '-vn', '-f', 'null', '-'])
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r.stderr)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r.stderr)]
    return [{'start': s, 'end': e} for s, e in zip(starts, ends + [None] * (len(starts) - len(ends)))]


def frame_diffs(video, fps):
    """mean abs difference between consecutive frames (160x90 grey)"""
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', str(video), '-vf', 'scale=160:90,format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    prev, diffs = None, []
    n = 160 * 90
    while True:
        buf = p.stdout.read(n)
        if len(buf) < n:
            break
        f = np.frombuffer(buf, np.uint8).astype(np.int16)
        if prev is not None:
            diffs.append(float(np.abs(f - prev).mean()))
        prev = f
    p.wait()
    return np.array(diffs)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    info = ffprobe(a.video)
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    au = next((s for s in info['streams'] if s['codec_type'] == 'audio'), None)
    num, den = map(int, v['r_frame_rate'].split('/'))
    fps = num / den
    dur = float(info['format']['duration'])
    vbr = int(v.get('bit_rate') or info['format']['bit_rate'])
    res = {'file': a.video, 'width': v['width'], 'height': v['height'], 'fps': fps, 'duration': dur,
           'video_mbps': round(vbr / 1e6, 2), 'size_mb': round(int(info['format']['size']) / 1e6, 1),
           'audio': bool(au), 'audio_kbps': round(int(au.get('bit_rate', 0)) / 1e3) if au else 0}
    flags = []
    if (v['width'], v['height']) not in ((1920, 1080), (1080, 1920)):
        flags.append(['MAJOR', f"resolution {v['width']}x{v['height']} (want 1920x1080)"])
    if res['video_mbps'] < 6:
        flags.append(['MAJOR', f"video bitrate {res['video_mbps']} Mbps: too low to upload; dark/grainy scenes turn to mush and Douyin may flag 画质模糊. Upload the master (≥8 Mbps)"])
    if not au:
        flags.append(['BLOCKER', 'no audio stream'])
    ld = loudness(a.video) if au else None
    res['loudness'] = ld
    if ld:
        if ld['integrated_lufs'] < -20 or ld['integrated_lufs'] > -11:
            flags.append(['MINOR', f"loudness {ld['integrated_lufs']} LUFS (aim -16 to -14 for phones)"])
        if ld['true_peak_db'] > -0.5:
            flags.append(['MINOR', f"true peak {ld['true_peak_db']} dBTP (clipping risk; keep ≤ -1)"])
    sil = silences(a.video) if au else []
    res['silences'] = sil
    for s in sil:
        if s['start'] < 0.5:
            flags.append(['MAJOR', f"audio silent at the start ({s['start']:.1f}–{s['end'] or dur:.1f}s): the first second must already have sound"])
        elif s['end'] is not None and s['end'] < dur - 3:
            flags.append(['MINOR', f"silence {s['start']:.1f}–{s['end']:.1f}s mid-film (intended?)"])
    blacks = [b for b in black_frames(a.video) if b['start'] > 0.2 and b['end'] < dur - 2.0]
    res['black'] = blacks
    for b in blacks:
        flags.append(['MAJOR', f"black frames {b['start']:.2f}–{b['end']:.2f}s (unintended gap or failed chunk?)"])
    d = frame_diffs(a.video, fps)
    med = float(np.median(d)) + 0.3
    cuts, glitches = [], []
    for i in range(1, len(d) - 1):
        t = (i + 1) / fps
        if d[i] > max(12, 8 * med) and d[i] > 2.5 * max(d[i - 1], d[i + 1]):
            cuts.append(round(t, 2))
        # a single odd frame: big jump in and straight back out
        if d[i] > max(10, 6 * med) and d[i + 1] > max(10, 6 * med) and d[i - 1] < 0.5 * d[i] and i + 2 < len(d) and d[i + 2] < 0.5 * d[i + 1]:
            glitches.append(round(t, 2))
    res['hard_cuts'] = cuts
    res['single_frame_glitches'] = glitches
    for g in glitches:
        flags.append(['MAJOR', f"single-frame glitch at {g:.2f}s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)"])
    # frozen stretches: picture barely moving for > 3 s (dead air unless a held title/end card)
    still = d < 0.15
    run_start = None
    frozen = []
    for i, s in enumerate(list(still) + [False]):
        if s and run_start is None:
            run_start = i
        if not s and run_start is not None:
            if (i - run_start) / fps > 3:
                frozen.append([round(run_start / fps, 2), round(i / fps, 2)])
            run_start = None
    res['frozen'] = frozen
    for f0, f1 in frozen:
        if f1 < dur - 1:
            flags.append(['MINOR', f"picture almost static {f0:.1f}–{f1:.1f}s (fine for a title/end card; dead air otherwise)"])
    res['flags'] = flags
    (out / 'probe.json').write_text(json.dumps(res, ensure_ascii=False, indent=1))
    np.save(out / 'diffs.npy', d)
    print(f"{v['width']}x{v['height']} {fps:.0f}fps {dur:.1f}s video {res['video_mbps']} Mbps, {res['size_mb']} MB")
    if ld:
        print(f"loudness {ld['integrated_lufs']} LUFS, peak {ld['true_peak_db']} dBTP")
    print(f"hard cuts: {len(cuts)}, glitches: {len(glitches)}, black: {len(blacks)}, frozen: {len(frozen)}")
    for sev, msg in flags:
        print(f"  [{sev}] {msg}")


if __name__ == '__main__':
    main()
