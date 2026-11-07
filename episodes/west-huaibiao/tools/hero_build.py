"""Assemble the western hero cold open: shots trimmed to the edit, black bars that open/close with the story, text, voice, sound.
usage: python3 hero_build.py <shots dir> <voice dir> <sfx.wav> <out.mp4>"""
import sys, subprocess, json, os
SH, VO, SFX, OUT = sys.argv[1:5]
W, H = 1080, 1920
# edit: (shot, first frame, frames)
EDIT = [("DUEL", 0, 234), ("HHAND", 0, 16), ("TUMBLE", 0, 18), ("OHAND", 0, 14), ("HEYES", 0, 14), ("OEYES", 0, 9), ("FLASH", 0, 8), ("BLACK", 0, 66), ("REVEAL", 0, 132), ("WATCH", 0, 204)]
starts = {}; f = 0
for s, a, n in EDIT: starts[s] = f / 30; f += n
END = f / 30

# visible picture height over time (the rest is black bars): 608 = 16:9, 452 = 2.39:1, 330 = the squint slit
def ss(a, b):   # smoothstep of t between a and b, as an ffmpeg expression
    return f"(st(0,clip((t-{a:.3f})/{b - a:.3f},0,1))*0+ld(0)*ld(0)*(3-2*ld(0)))"
d = starts["HHAND"]
segs = [  # (until, expression for visible height)
    (1.4, "608"), (3.4, f"(608+1312*{ss(1.4, 3.4)})"), (4.9, "1920"), (5.9, f"(1920-1312*{ss(4.9, 5.9)})"), (6.9, f"(608-156*{ss(5.9, 6.9)})"),
    (d, f"(452-72*{ss(7.0, 7.5)})"), (starts["HEYES"], "608"), (starts["FLASH"], "380"), (starts["BLACK"], "608"), (starts["REVEAL"], "0"),
    (starts["WATCH"], f"(608+1312*{ss(starts['REVEAL'] + 1.0, starts['REVEAL'] + 3.0)})"), (99, "1920")]
expr = segs[-1][1]
for until, e in reversed(segs[:-1]): expr = f"if(lt(t,{until:.3f}),{e},{expr})"
open("/dev/shm/hero/vis.txt", "w").write(expr)

# text track (ASS): kicker in the black bars, subtitles, the 69 m label, the title
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h}:{m:02d}:{s:05.2f}"
R0 = starts["REVEAL"]; W0 = starts["WATCH"]
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Kick,Noto Serif CJK SC,92,&H0060C8F2,&H0060C8F2,&H00101418,&H00000000,1,0,0,0,100,100,4,0,1,0,0,5,40,40,0,1
Style: Year,Noto Serif CJK SC,46,&H00B8D4E6,&H00B8D4E6,&H00101418,&H00000000,0,0,0,0,100,100,8,0,1,0,0,5,40,40,0,1
Style: Sub,Noto Sans CJK SC,58,&H00F2F5F7,&H00F2F5F7,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,2,90,90,420,1
Style: Mid,Noto Sans CJK SC,62,&H00F2F5F7,&H00F2F5F7,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,5,90,90,0,1
Style: Tag,Noto Serif CJK SC,86,&H00EAF4FF,&H00EAF4FF,&H00203040,&H96000000,1,0,0,0,100,100,2,0,1,4,4,5,40,40,0,1
Style: Title,Noto Serif CJK SC,104,&H0068C4F0,&H0068C4F0,&H00102030,&H96000000,1,0,0,0,100,100,6,0,1,5,6,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 2,{ts(0)},{ts(1.45)},Kick,,0,0,0,,{{\\pos(563,470)\\fad(0,250)}}谁会先拔枪？
Dialogue: 2,{ts(0)},{ts(1.45)},Year,,0,0,0,,{{\\pos(540,1470)\\fad(0,250)}}1865 · 美国西部
Dialogue: 1,{ts(starts['BLACK'] + 0.2)},{ts(starts['BLACK'] + 2.45)},Mid,,0,0,0,,{{\\pos(540,960)\\fad(150,150)}}这是电影里的西部对决。
Dialogue: 1,{ts(R0 + 0.35)},{ts(R0 + 3.2)},Sub,,0,0,0,,真实的那一场，两个人，隔着69米。
Dialogue: 2,{ts(R0 + 3.3)},{ts(W0)},Tag,,0,0,0,,{{\\pos(700,930)\\fad(200,0)}}69 米
Dialogue: 1,{ts(W0 + 0.3)},{ts(W0 + 2.3)},Sub,,0,0,0,,而起因，只是一块怀表。
Dialogue: 3,{ts(W0 + 2.5)},{ts(END)},Title,,0,0,0,,{{\\pos(540,1290)\\fad(400,500)\\fs124}}一块怀表，\\N{{\\fs74}}引发了西部史上第一场对决
"""
open("/dev/shm/hero/hero.ass", "w").write(ass)

# picture: trims, a 1.6 s black, bars, text
inputs = []; parts = []; k = 0
for s, a, n in EDIT:
    if s == "BLACK":
        parts.append(f"color=black:s={W}x{H}:r=30:d={n / 30:.4f}[p{k}]")
    else:
        inputs += ["-i", f"{SH}/{s}.mp4"]
        parts.append(f"[{len(inputs) // 2 - 1}:v]trim=start_frame={a}:end_frame={a + n},setpts=PTS-STARTPTS,fps=30[p{k}]")
    k += 1
fc = ";".join(parts) + ";" + "".join(f"[p{i}]" for i in range(k)) + f"concat=n={k}:v=1:a=0[cat]"
fc += f";color=black:s={W}x{H // 2}:r=30[t1];color=black:s={W}x{H // 2}:r=30[t2]"
fc += f";[cat][t1]overlay=x=0:y='({H}-({expr}))/2-{H // 2}':eval=frame:shortest=1[o1]"
fc += f";[o1][t2]overlay=x=0:y='{H}-({H}-({expr}))/2':eval=frame:shortest=1,subtitles=/dev/shm/hero/hero.ass[v]"
# sound: voice lines on the edit, bed underneath, the whole to -14 LUFS / -1 dBTP
vo = [("V1", starts["BLACK"] + 0.2), ("V2", R0 + 0.4), ("V3", W0 + 0.35), ("V4", W0 + 2.75)]
ai = len(inputs) // 2
inputs += ["-i", SFX]
for name, at in vo: inputs += ["-i", f"{VO}/{name}.mp3"]
afc = []
for i, (name, at) in enumerate(vo):
    afc.append(f"[{ai + 1 + i}:a]aresample=48000,atempo=1.06,adelay={int(at * 1000)}|{int(at * 1000)},volume=1.55[v{i}]")
afc.append(f"[{ai}:a]volume=1.0[bed]")
afc.append("[bed]" + "".join(f"[v{i}]" for i in range(len(vo))) + f"amix=inputs={len(vo) + 1}:normalize=0,atrim=0:{END:.3f},loudnorm=I=-14:TP=-1.0:LRA=14[a]")
cmd = ["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", fc + ";" + ";".join(afc), "-map", "[v]", "-map", "[a]",
       "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{END:.3f}", "-movflags", "+faststart", OUT]
subprocess.run(cmd, check=True)
print(json.dumps({k: round(v, 3) for k, v in starts.items()}), "end", round(END, 3))
