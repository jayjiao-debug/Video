"""Assemble the body of 一块怀表 (everything after the cold open) and then the full film.
usage: python3 body_build.py <body shots dir> <REVEAL3.mp4> <hero_v4.mp4> <voice dir> <timeline.json> <sfx_body.wav> <work dir> <out_body.mp4> <out_full.mp4>"""
import sys, subprocess, json, os, random
SH, REV, HERO, VO, TL, SFX, WK, OUTB, OUTF = sys.argv[1:10]
W, H = 1080, 1920; END = 164.0
os.makedirs(WK, exist_ok=True)
run = lambda c: subprocess.run(c, shell=True, check=True)
# room take: four segments rendered in parallel, joined back into one 40.4 s shot
open(f"{WK}/room.txt", "w").write("".join(f"file '{os.path.abspath(SH)}/B2_ROOM_{k}.mp4'\n" for k in "ABCD"))
run(f"ffmpeg -v error -y -f concat -safe 0 -i {WK}/room.txt -c copy {WK}/B2_ROOM.mp4")
# (file, src start, src dur, abs start, dissolve-in seconds, speed)
EDIT = [(f"{SH}/B1_NIGHT.mp4", 0, None, 0.0, 0, 1), (f"{WK}/B2_ROOM.mp4", 0, None, 5.8, 0.5, 1), (f"{SH}/B3_SQA.mp4", 0, None, 45.6, 0.6, 1),
        (REV, 0, None, 55.0, 0, 1), (f"{SH}/B4_SQB.mp4", 0, None, 61.4, 0, 1), (f"{SH}/B4_SQC.mp4", 0, None, 71.6, 0, 1), (f"{SH}/B5_TRIAL.mp4", 0, None, 76.8, 0, 1),
        (f"{SH}/B6_PRESS.mp4", 0, None, 90.3, 0.35, 1), (f"{SH}/B6_NOVELS.mp4", 0, None, 99.7, 0.3, 1), (HERO, 0.0, 3.95, 103.1, 0, 1), (HERO, 4.45, 1.4, 107.05, 0, 1),
        (f"{SH}/B6_WIDE.mp4", 0, None, 108.45, 0, 0.707), (f"{SH}/B7_ARCHIVE.mp4", 0, None, 115.4, 0.4, 1), (f"{SH}/B7_MAP.mp4", 0, None, 121.3, 0.4, 1),
        (f"{SH}/B8_SALOON.mp4", 0, None, 128.9, 0.5, 1), (f"{SH}/B8_CARDS.mp4", 0, None, 139.9, 0.3, 1), (f"{SH}/B9_DUSK.mp4", 0, None, 154.0, 0.6, 1)]
CUT_TO_BLACK = {14: 139.5}   # the saloon ends in black before the shot
inputs = []; fc = [f"color=black:s={W}x{H}:r=30:d={END}[base]"]; last = "base"
for i, (f, s0, sd, S, d, sp) in enumerate(EDIT):
    nxt = EDIT[i + 1] if i + 1 < len(EDIT) else None
    until = CUT_TO_BLACK.get(i, (nxt[3] + nxt[4]) if nxt else END)
    dur = until - S
    inputs += ["-i", f]
    src_need = dur * sp
    chain = f"[{i}:v]trim=start={s0}:duration={src_need + 0.05:.3f},setpts=(PTS-STARTPTS)/{sp},fps=30,tpad=stop_mode=clone:stop_duration=6,trim=duration={dur:.3f},format=yuva420p"
    if d > 0: chain += f",fade=t=in:st=0:d={d}:alpha=1"
    if i == 15: chain += ",fade=t=in:st=0:d=0.3"   # cards rise out of the black
    chain += f",setpts=PTS+{S}/TB[s{i}]"
    fc.append(chain); fc.append(f"[{last}][s{i}]overlay=0:0:eof_action=pass[o{i}]"); last = f"o{i}"
# the white of the trial's door → the press; the movie's gunshot → the wide square
fc.append(f"color=white:s={W}x{H}:r=30:d=0.9,format=yuva420p,fade=t=in:st=0:d=0.3:alpha=1,fade=t=out:st=0.45:d=0.45:alpha=1,setpts=PTS+89.85/TB[w1]")
fc.append(f"color=white:s={W}x{H}:r=30:d=0.7,format=yuva420p,fade=t=in:st=0:d=0.05:alpha=1,fade=t=out:st=0.15:d=0.5:alpha=1,setpts=PTS+108.42/TB[w2]")
fc.append(f"[{last}][w1]overlay=0:0:eof_action=pass[x1];[x1][w2]overlay=0:0:eof_action=pass[x2]"); last = "x2"
# end card: the last frame dims to 30 %
fc.append(f"[{last}]fade=t=out:st=159.5:d=0.6:color=0x000000@0.0[x3]")
fc.append(f"color=black:s={W}x{H}:r=30:d=4.5,format=yuva420p,colorchannelmixer=aa=0.7,fade=t=in:st=0:d=0.6:alpha=1,setpts=PTS+159.5/TB[dim]")
fc.append(f"[x3][dim]overlay=0:0:eof_action=pass,fade=t=out:st={END - 0.6}:d=0.6[x4]"); last = "x4"

# ---- text
def ts(x): h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60; return f"{h}:{m:02d}:{s:05.2f}"
lines = json.load(open(TL))["lines"]
ev = []
def split(sub):
    if len(sub) <= 16: return [sub]
    cands = [i for i, c in enumerate(sub) if c in "，：；。—" and 4 < i < len(sub) - 3]
    if not cands: return [sub]
    k = min(cands, key=lambda i: abs(i - len(sub) / 2)); a, b = sub[:k + 1], sub[k + 1:]
    a = a.rstrip("，；：")
    return [a] + split(b)
for l in lines:
    parts = split(l["sub"]); tot = sum(len(p) for p in parts); t = l["start"]
    sty = "SubT" if l["name"].startswith("T") else ("SubH" if l["name"].startswith("H") else "Sub")
    if l["name"] == "N39": continue
    for p in parts:
        dd = l["dur"] * len(p) / tot
        ev.append(f"Dialogue: 1,{ts(t)},{ts(t + dd + 0.08)},{sty},,0,0,0,,{{\\fad(80,100)}}{p}"); t += dd
# the 0 → 69 米 counter on the flight (same curve as the line)
B0 = 55.0
def g2(x): u = min(max((x - (B0 + 0.6)) / 2.6, 0.0), 1.0); return u * u * (3 - 2 * u)
f0 = int((B0 + 0.6) * 30); f1 = int((B0 + 3.25) * 30)
for fr in range(f0, f1):
    a = fr / 30; ev.append(f"Dialogue: 2,{ts(a)},{ts(a + 1 / 30 + 0.004)},Count,,0,0,0,,{{\\pos(540,1230)}}{round(69 * g2(a))} 米")
ev.append(f"Dialogue: 2,{ts(f1 / 30)},{ts(61.3)},Count,,0,0,0,,{{\\pos(540,1230)\\fad(0,250)\\t(0,180,\\fscx118\\fscy118)\\t(180,420,\\fscx100\\fscy100)}}69 米")
# the reported 100 men
for k in range(100):
    x = 95.95 + 3.2 * (k / 99) ** 0.7; x2 = 95.95 + 3.2 * ((k + 1) / 99) ** 0.7 if k < 99 else 99.65
    ev.append(f"Dialogue: 2,{ts(x)},{ts(x2)},Count,,0,0,0,,{{\\pos(540,560)}}{k + 1}{{\\fs64}} 人")
# the map: 69 米 beside the line, steady, then breaking up
ev.append(f"Dialogue: 2,{ts(121.6)},{ts(125.6)},Tag,,0,0,0,,{{\\pos(760,960)\\fad(250,0)}}69 米")
rnd = random.Random(69); x = 125.6
while x < 128.0:
    d = rnd.uniform(0.04, 0.16)
    if rnd.random() < 0.6: ev.append(f"Dialogue: 2,{ts(x)},{ts(x + d)},Tag,,0,0,0,,{{\\pos({760 + rnd.randint(-8, 8)},{960 + rnd.randint(-5, 5)})\\alpha&H{rnd.choice(['00', '40', '90'])}&}}69 米")
    x += d
# the closing question and the end card
ev.append(f"Dialogue: 3,{ts(154.4)},{ts(END - 0.6)},Q,,0,0,0,,{{\\pos(540,960)\\fad(500,0)}}为了10块钱和一块表，\\N你会走进那个广场吗？")
ev.append(f"Dialogue: 3,{ts(159.7)},{ts(END - 0.6)},Title,,0,0,0,,{{\\pos(540,560)\\fad(500,0)\\fs96}}一块怀表，\\N{{\\fs64}}引发了西部史上第一场对决")
ev.append(f"Dialogue: 3,{ts(160.0)},{ts(END - 0.6)},Pill,,0,0,0,,{{\\pos(540,1290)\\fad(400,0)}}  关注 Juno · 一起看懂世界  ")
ev.append(f"Dialogue: 3,{ts(160.0)},{ts(END - 0.6)},Src,,0,0,0,,{{\\pos(540,1640)\\fad(400,0)}}资料：美国国家牛仔与西部遗产博物馆 · 密苏里州档案馆 · Britannica · History.com · KY3（2026）\\N有争议的细节以“据说”表述")
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Noto Sans CJK SC,58,&H00F2F5F7,&H00F2F5F7,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,2,90,90,420,1
Style: SubT,Noto Sans CJK SC,58,&H008CC8FF,&H008CC8FF,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,2,90,90,420,1
Style: SubH,Noto Sans CJK SC,58,&H00FFE6CF,&H00FFE6CF,&H00101010,&H78000000,0,0,0,0,100,100,2,0,1,3,2,2,90,90,420,1
Style: Count,Noto Serif CJK SC,128,&H00EAF4FF,&H00EAF4FF,&H00182430,&H96000000,1,0,0,0,100,100,4,0,1,5,4,5,40,40,0,1
Style: Tag,Noto Serif CJK SC,86,&H00EAF4FF,&H00EAF4FF,&H00203040,&H96000000,1,0,0,0,100,100,2,0,1,4,4,5,40,40,0,1
Style: Q,Noto Serif CJK SC,76,&H00F4F8FA,&H00F4F8FA,&H00101418,&H96000000,1,0,0,0,100,100,3,0,1,4,3,5,60,60,0,1
Style: Title,Noto Serif CJK SC,96,&H0068C4F0,&H0068C4F0,&H00102030,&H96000000,1,0,0,0,100,100,6,0,1,4,4,5,40,40,0,1
Style: Pill,Noto Sans CJK SC,44,&H00F4F4F4,&H00F4F4F4,&H00304A8C,&H00000000,1,0,0,0,100,100,2,0,3,14,0,5,40,40,0,1
Style: Src,Noto Sans CJK SC,28,&H00B4BEC8,&H00B4BEC8,&H00101010,&H00000000,0,0,0,0,100,100,1,0,1,1,0,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""" + "\n".join(ev) + "\n"
open(f"{WK}/body.ass", "w").write(ass)
fc.append(f"[{last}]subtitles={WK}/body.ass[v]")
# ---- sound: the bed plus every voice line at its time, -14 LUFS
ai = len(EDIT); inputs += ["-i", SFX]
afc = []
for k, l in enumerate(lines):
    inputs += ["-i", f"{VO}/{l['name']}.mp3"]; ms = int(l["start"] * 1000)
    vol = 1.55 if l["name"].startswith("N") else 1.7
    afc.append(f"[{ai + 1 + k}:a]aresample=48000,atempo=1.06,adelay={ms}|{ms},volume={vol}[v{k}]")
afc.append(f"[{ai}:a]acompressor=threshold=0.08:ratio=5:attack=4:release=250,volume=4.5,alimiter=limit=0.9:level=false[bed]")   # the bed sits ~10 dB under the voice
afc.append("[bed]" + "".join(f"[v{k}]" for k in range(len(lines))) + f"amix=inputs={len(lines) + 1}:normalize=0,atrim=0:{END},loudnorm=I=-14:TP=-1.5:LRA=14,aresample=192000,alimiter=limit=0.82:attack=1:release=40:level=false,aresample=48000[aout]")
cmd = ["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", ";".join(fc) + ";" + ";".join(afc), "-map", "[v]", "-map", "[aout]",
       "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-t", f"{END}", "-movflags", "+faststart", OUTB]
subprocess.run(cmd, check=True)
# ---- the full film: cold open, a half-second dissolve, the body
hd = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", HERO], capture_output=True, text=True).stdout)
run(f'ffmpeg -v error -y -i {HERO} -i {OUTB} -filter_complex "[0:v][1:v]xfade=transition=fade:duration=0.5:offset={hd - 0.5:.3f},format=yuv420p[v];'
    f'[0:a][1:a]acrossfade=d=0.5,aresample=192000,alimiter=limit=0.82:level=false,aresample=48000[a]" -map "[v]" -map "[a]" -c:v libx264 -preset medium -crf 18 '
    f'-pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a aac -b:a 192k -ar 48000 -movflags +faststart {OUTF}')
print("ok body", END, "full", round(hd + END - 0.5, 2))
