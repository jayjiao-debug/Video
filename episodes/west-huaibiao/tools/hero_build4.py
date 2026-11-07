"""Assemble the western hero cold open v4: the duel + bullet (one Godot shot, the gunslinger dissolving away as we enter his
eyes), the screen breaking onto the watch, bars in the duel only, subtitles, voice, sound.
usage: python3 hero_build4.py <shots dir> <voice dir> <sfx.wav> <work dir> <out.mp4> <nose x> <nose y>"""
import sys, subprocess, os, glob
SH, VO, SFX, WK, OUT = sys.argv[1:6]; EX, EY = sys.argv[6], sys.argv[7]
W, H = 1080, 1920; HERE = os.path.dirname(os.path.abspath(__file__))
NA, NS = 263, 36                      # duel+bullet frames; shatter frames (4 grow + 8 hold + 24 fall)
C0 = (NA + 12) / 30                   # the watch is underneath from the first falling frame
END = C0 + 250 / 30
os.makedirs(WK, exist_ok=True)
run = lambda c: subprocess.run(c, shell=True, check=True)
# 1. the frozen impact frame and the first watch frames, then the shatter
run(f"ffmpeg -v error -y -i {SH}/DUEL4.mp4 -vf select='eq(n\\,{NA - 1})' -frames:v 1 {WK}/freeze.png")
run(f"rm -rf {WK}/w {WK}/s && mkdir -p {WK}/w && ffmpeg -v error -y -i {SH}/WATCH4.mp4 -frames:v 24 -start_number 0 {WK}/w/w%04d.png")
run(f"python3 {HERE}/shatter.py {WK}/freeze.png {WK}/w {WK}/s {EX} {EY}")

def ss(a, b): return f"(st(0,clip((t-{a:.3f})/{b - a:.3f},0,1))*0+ld(0)*ld(0)*(3-2*ld(0)))"
segs = [(0.5, "608"), (1.1, f"(608+1312*{ss(0.5, 1.1)})"), (1.6, "1920"), (2.4, f"(1920-1312*{ss(1.6, 2.4)})"), (2.75, "608"),
        (3.15, f"(608-278*{ss(2.75, 3.15)})"), (3.95, "330"), (4.6, f"(330+278*{ss(3.95, 4.6)})"), (5.9, "608"),
        (6.6, f"(608+1312*{ss(5.9, 6.6)})"), (99, "1920")]
expr = segs[-1][1]
for until, e in reversed(segs[:-1]): expr = f"if(lt(t,{until:.3f}),{e},{expr})"

def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h}:{m:02d}:{s:05.2f}"
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Noto Sans CJK SC,58,&H00F2F5F7,&H00F2F5F7,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,2,90,90,420,1
Style: Title,Noto Serif CJK SC,104,&H0068C4F0,&H0068C4F0,&H00102030,&H96000000,1,0,0,0,100,100,6,0,1,5,6,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 1,{ts(C0 + 1.55)},{ts(C0 + 3.95)},Sub,,0,0,0,,{{\\fad(120,150)}}而起因，只是一块怀表。
Dialogue: 3,{ts(C0 + 4.05)},{ts(END)},Title,,0,0,0,,{{\\pos(540,1290)\\fad(400,500)\\fs124}}一块怀表，\\N{{\\fs74}}引发了西部史上第一场对决
"""
open(f"{WK}/hero.ass", "w").write(ass)
fc = (f"[0:v]trim=start_frame=0:end_frame={NA},setpts=PTS-STARTPTS,fps=30[a];"
      f"[1:v]trim=start_frame=0:end_frame=36,setpts=PTS-STARTPTS,fps=30,format=yuva420p,fade=t=in:st=0.45:d=0.4:alpha=1[a2];"
      f"[a][a2]overlay=0:0:eof_action=pass,format=yuv420p[a1];"
      f"[2:v]fps=30,format=yuv420p,setpts=PTS-STARTPTS[s];"
      f"[3:v]trim=start_frame=24:end_frame=250,setpts=PTS-STARTPTS,fps=30,format=yuv420p[c];"
      f"[a1][s][c]concat=n=3:v=1:a=0[cat];"
      f"color=black:s={W}x{H // 2}:r=30[t1];color=black:s={W}x{H // 2}:r=30[t2];"
      f"[cat][t1]overlay=x=0:y='({H}-({expr}))/2-{H // 2}':eval=frame:shortest=1[o1];"
      f"[o1][t2]overlay=x=0:y='{H}-({H}-({expr}))/2':eval=frame:shortest=1,subtitles={WK}/hero.ass[v]")
inputs = ["-i", f"{SH}/DUEL4.mp4", "-i", f"{SH}/DUEL4B.mp4", "-framerate", "30", "-start_number", "0", "-i", f"{WK}/s/s%04d.png", "-i", f"{SH}/WATCH4.mp4", "-i", SFX]
vo = [("V3", C0 + 1.6), ("V4", C0 + 4.1)]
for name, at in vo: inputs += ["-i", f"{VO}/{name}.mp3"]
afc = [f"[{5 + i}:a]aresample=48000,atempo=1.06,adelay={int(at * 1000)}|{int(at * 1000)},volume=1.55[v{i}]" for i, (name, at) in enumerate(vo)]
afc.append("[4:a]volume=1.0[bed]")
afc.append("[bed]" + "".join(f"[v{i}]" for i in range(len(vo))) + f"amix=inputs={len(vo) + 1}:normalize=0,atrim=0:{END:.3f},loudnorm=I=-14:TP=-1.5:LRA=14,alimiter=limit=0.8:level=false[aout]")
cmd = ["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", fc + ";" + ";".join(afc), "-map", "[v]", "-map", "[aout]",
       "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{END:.3f}", "-movflags", "+faststart", OUT]
subprocess.run(cmd, check=True)
print("ok", round(END, 3))
