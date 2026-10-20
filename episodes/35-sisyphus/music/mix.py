"""ep35 soundtrack: music only (series rule). Placeholder track = 'Cry For Me' (owner's ep28 BGM) from 29.5 s,
so its drop (42.478 s) lands on the title plank at film 12.978 s. Fade in 1.0 s, fade out over the end card.
-14 LUFS / -1.5 dBTP, two-pass loudnorm. Usage: BGM=... OUT=... DUR=141.542 python3 mix.py"""
import os, json, subprocess
BGM, OUT, DUR = os.environ['BGM'], os.environ['OUT'], float(os.environ['DUR'])
OFF = 29.5
af = f"afade=t=in:st=0:d=1.0,afade=t=out:st={DUR - 2.6:.3f}:d=2.6"
m = subprocess.run(['ffmpeg', '-hide_banner', '-ss', str(OFF), '-t', f'{DUR:.3f}', '-i', BGM, '-af', af + ',loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
js = json.loads(m[m.rindex('{'):m.rindex('}') + 1])
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(OFF), '-t', f'{DUR:.3f}', '-i', BGM, '-af', af + f",loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true", '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', OUT], check=True)
print('ok', js['input_i'])
