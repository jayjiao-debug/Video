"""Mix the cold-open audio: the channel track from 0 s, cut dead at the pause, the ringtone inside the pause, then the
track resumes from exactly where it stopped. Usage: python3 scripts/ring_mix.py <ringtone file> <picture.mp4> <out.mp4>
The ringtone is the owner's own recording (never committed)."""
import subprocess, sys
PAUSE_AT, RESUME_AT, RING_START, RING_DUR, END = 1.0, 5.3, 1.22, 3.8, 14.0
ring, pic, out = sys.argv[1:4]
fc = (
    # music part 1: 0 → 1.0 s, a 4 ms tail only to avoid a click: it must sound like a hard stop
    f"[0:a]atrim=0:{PAUSE_AT},asetpts=PTS-STARTPTS,afade=t=out:st={PAUSE_AT-0.004}:d=0.004[m1];"
    # music part 2: resumes at track 1.0 s (where it stopped), at film time RESUME_AT
    f"[0:a]atrim={PAUSE_AT}:{PAUSE_AT + END - RESUME_AT},asetpts=PTS-STARTPTS,afade=t=in:d=0.004,adelay={int(RESUME_AT*1000)}|{int(RESUME_AT*1000)}[m2];"
    # the ring, cut off abruptly like a call that stops
    f"[1:a]aformat=channel_layouts=stereo,atrim=0:{RING_DUR},asetpts=PTS-STARTPTS,afade=t=out:st={RING_DUR-0.006}:d=0.006,adelay={int(RING_START*1000)}|{int(RING_START*1000)}[r];"
    f"[m1][m2][r]amix=inputs=3:normalize=0:duration=longest,atrim=0:{END}[a]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/bgm.mp3", "-i", ring, "-i", pic, "-filter_complex", fc,
                "-map", "2:v", "-map", "[a]", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", out], check=True)
print("ok", out)
