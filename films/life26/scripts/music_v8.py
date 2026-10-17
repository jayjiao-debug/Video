#!/usr/bin/env python3
"""v8 music: Cry For Me 0 → 187.9 (the film follows the track exactly up to the end card), then the track's own closing half-phrase
(291.9 → silence) so the end card sits on a real ending instead of a fade across a chorus. Joint: the downbeat at 187.9 is replaced
by the outro's downbeat at 291.9 (offset 104.02 s = 160 beats), a 0.2 s crossfade just before it, the chorus eased down 4 dB over its
last bar. Then two-pass loudnorm to -14 LUFS, true peak -1.5 dBTP."""
import json, re, subprocess, sys
src, out, dur = 'public/bgm.mp3', sys.argv[1] if len(sys.argv) > 1 else 'out/music_v8.wav', 194.2
J, OFF, XF = 187.75, 104.02, 0.2
fc = (f"[0:a]atrim=0:{J + XF},asetpts=PTS-STARTPTS,volume='if(lt(t,186.9),1,if(lt(t,{J}),1-0.37*(t-186.9)/({J}-186.9),0.63))':eval=frame,"
      f"afade=t=out:st={J}:d={XF}[a];"
      f"[0:a]atrim={J + OFF}:{J + OFF + (dur - J)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d={XF},afade=t=out:st={dur - J - 0.6}:d=0.6,adelay={int(J * 1000)}|{int(J * 1000)}[b];"
      f"[a][b]amix=inputs=2:normalize=0:duration=longest,atrim=0:{dur}[m]")
tmp = '/tmp/claude-0/music_v8_raw.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[m]', '-ar', '48000', '-c:a', 'pcm_s16le', tmp], check=True)
meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
d = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', meas, re.S).group(0))
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:"
      f"measured_thresh={d['input_thresh']}:offset={d['target_offset']}:linear=true")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', ln, '-ar', '48000', '-c:a', 'pcm_s16le', out], check=True)
print('input', d['input_i'], 'LUFS', d['input_tp'], 'dBTP ->', out)
