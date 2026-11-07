"""Assemble the western hero cold open v3: three continuous shots, a white flash (the shot) and a dissolve (line → chain),
black bars that open/close with the camera in shot A only, a 0→69 米 counter, subtitles, voice, sound.
usage: python3 hero_build.py <shots dir> <voice dir> <sfx.wav> <work dir> <out.mp4>"""
import sys, subprocess, json, os
SH, VO, SFX, WK, OUT = sys.argv[1:6]
W, H = 1080, 1920
B0, C0, XF = 7.2, 13.1, 0.5           # shot B starts under the white; shot C dissolves in over B's last 0.5 s
END = C0 + 8.0

def ss(a, b):   # smoothstep of t between a and b, as an ffmpeg expression
    return f"(st(0,clip((t-{a:.3f})/{b - a:.3f},0,1))*0+ld(0)*ld(0)*(3-2*ld(0)))"
# visible picture height (the rest is black bars): 608 = 16:9, 330 = the eye slit, 1920 = the whole 9:16 frame
segs = [(0.6, "608"), (1.6, f"(608+1312*{ss(0.6, 1.6)})"), (2.4, "1920"), (2.8, f"(1920-1312*{ss(2.4, 2.8)})"), (4.0, "608"),
        (4.35, f"(608-278*{ss(4.0, 4.35)})"), (4.95, "330"), (5.6, f"(330+278*{ss(4.95, 5.6)})"), (B0, "608"), (99, "1920")]
expr = segs[-1][1]
for until, e in reversed(segs[:-1]): expr = f"if(lt(t,{until:.3f}),{e},{expr})"

def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h}:{m:02d}:{s:05.2f}"
def g2(x): u = min(max((x - (B0 + 0.6)) / 2.6, 0.0), 1.0); return u * u * (3 - 2 * u)   # same curve as the line in west.gd
ev = []
f0 = int((B0 + 0.6) * 30); f1 = int((B0 + 3.25) * 30)
for f in range(f0, f1):
    a = f / 30; v = round(69 * g2(a))
    ev.append(f"Dialogue: 2,{ts(a)},{ts(a + 1 / 30 + 0.004)},Count,,0,0,0,,{{\\pos(540,1230)}}{v} 米")
ev.append(f"Dialogue: 2,{ts(f1 / 30)},{ts(C0)},Count,,0,0,0,,{{\\pos(540,1230)\\fad(0,300)\\t(0,180,\\fscx118\\fscy118)\\t(180,420,\\fscx100\\fscy100)}}69 米")
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Noto Sans CJK SC,58,&H00F2F5F7,&H00F2F5F7,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,2,90,90,420,1
Style: Count,Noto Serif CJK SC,128,&H00EAF4FF,&H00EAF4FF,&H00182430,&H96000000,1,0,0,0,100,100,4,0,1,5,4,5,40,40,0,1
Style: Title,Noto Serif CJK SC,104,&H0068C4F0,&H0068C4F0,&H00102030,&H96000000,1,0,0,0,100,100,6,0,1,5,6,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 1,{ts(B0 + 0.4)},{ts(B0 + 4.6)},Sub,,0,0,0,,{{\\fad(120,150)}}真实的那一场，两个人，隔着69米。
""" + "\n".join(ev) + f"""
Dialogue: 1,{ts(C0 + 1.3)},{ts(C0 + 3.7)},Sub,,0,0,0,,{{\\fad(120,150)}}而起因，只是一块怀表。
Dialogue: 3,{ts(C0 + 3.85)},{ts(END)},Title,,0,0,0,,{{\\pos(540,1290)\\fad(400,500)\\fs124}}一块怀表，\\N{{\\fs74}}引发了西部史上第一场对决
"""
os.makedirs(WK, exist_ok=True)
open(f"{WK}/hero.ass", "w").write(ass)

fc = (f"[0:v]trim=start_frame=0:end_frame=216,setpts=PTS-STARTPTS,fps=30[a];"
      f"[1:v]trim=start_frame=0:end_frame=192,setpts=PTS-STARTPTS,fps=30[b];"
      f"[2:v]trim=start_frame=0:end_frame=240,setpts=PTS-STARTPTS,fps=30[c];"
      # the gunslinger dissolves away as the camera pushes into his eyes (a second pass rendered without him)
      f"[3:v]trim=start_frame=0:end_frame=54,setpts=PTS-STARTPTS,fps=30,format=yuva420p,fade=t=in:st=0.9:d=0.4:alpha=1[a2];"
      f"[a][a2]overlay=0:0:eof_action=pass[a1];"
      f"[a1][b]concat=n=2:v=1:a=0,settb=1/30[ab];"
      f"[ab][c]xfade=transition=fade:duration={XF}:offset={C0:.3f}[cat];"
      f"color=black:s={W}x{H // 2}:r=30[t1];color=black:s={W}x{H // 2}:r=30[t2];"
      f"[cat][t1]overlay=x=0:y='({H}-({expr}))/2-{H // 2}':eval=frame:shortest=1[o1];"
      f"[o1][t2]overlay=x=0:y='{H}-({H}-({expr}))/2':eval=frame:shortest=1[o2];"
      # the shot: white in 2 frames over everything (bars too), held, then fading up on the real street
      f"color=white:s={W}x{H}:r=30:d=0.62,format=yuva420p,fade=t=in:st=0:d=0.07:alpha=1,fade=t=out:st=0.25:d=0.37:alpha=1,setpts=PTS+6.97/TB[wf];"
      f"[o2][wf]overlay=0:0:eof_action=pass,subtitles={WK}/hero.ass[v]")
inputs = ["-i", f"{SH}/DUEL3.mp4", "-i", f"{SH}/REVEAL3.mp4", "-i", f"{SH}/WATCH3.mp4", "-i", f"{SH}/DUEL3B.mp4", "-i", SFX]
vo = [("V2", B0 + 0.45), ("V3", C0 + 1.35), ("V4", C0 + 3.9)]
for name, at in vo: inputs += ["-i", f"{VO}/{name}.mp3"]
afc = [f"[{5 + i}:a]aresample=48000,atempo=1.06,adelay={int(at * 1000)}|{int(at * 1000)},volume=1.55[v{i}]" for i, (name, at) in enumerate(vo)]
afc.append("[4:a]volume=1.0[bed]")
afc.append("[bed]" + "".join(f"[v{i}]" for i in range(len(vo))) + f"amix=inputs={len(vo) + 1}:normalize=0,atrim=0:{END:.3f},loudnorm=I=-14:TP=-1.5:LRA=14,alimiter=limit=0.89:level=false[aout]")
cmd = ["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", fc + ";" + ";".join(afc), "-map", "[v]", "-map", "[aout]",
       "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{END:.3f}", "-movflags", "+faststart", OUT]
subprocess.run(cmd, check=True)
print("ok", round(END, 3))
