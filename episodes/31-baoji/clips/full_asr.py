"""Transcribe the whole 4.5 h podcast in 30 s windows (5 s overlap) with token times → full_asr.jsonl.
Streams audio from the mp3 with ffmpeg, so nothing large is written to disk."""
import json, subprocess, numpy as np, sherpa_onnx, sys
d = 'sherpa-onnx-sense-voice-zh-en-ja-ko-yue-int8-2024-07-17'
rec = sherpa_onnx.OfflineRecognizer.from_sense_voice(model=f'{d}/model.int8.onnx', tokens=f'{d}/tokens.txt', num_threads=2, language='zh', use_itn=True)
M = '/mnt/user-data/uploads/1792436005312_videoplayback__4_.mp3'
SR = 16000; WIN, HOP = 30, 25
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', M, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], stdout=subprocess.PIPE)
buf = np.zeros(0, 'float32'); t0 = 0.0
with open('full_asr.jsonl', 'w') as out:
    while True:
        chunk = p.stdout.read(SR * 4 * HOP)
        if chunk: buf = np.concatenate([buf, np.frombuffer(chunk, 'float32')])
        if len(buf) < SR * WIN and chunk: continue
        if not len(buf): break
        seg = buf[:SR * WIN]
        s = rec.create_stream(); s.accept_waveform(SR, seg); rec.decode_stream(s); r = s.result
        out.write(json.dumps({'t0': t0, 'text': r.text, 'tok': list(r.tokens), 'ts': [round(t0 + x, 2) for x in r.timestamps]}, ensure_ascii=False) + '\n'); out.flush()
        buf = buf[SR * HOP:]; t0 += HOP
        if not chunk and len(buf) < SR * 2: break
print('done', t0)
