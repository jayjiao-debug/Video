"""Mix cold open v2: track 0→1.0 s, dead stop, the owner's ringtone (1.2→4.4 s, stops dead), silence, then the track
slams back in from its 16.603 s hit at film 4.6 s. Usage: python3 scripts/ring_mix2.py <ringtone> <picture.mp4> <out.mp4>"""
import subprocess, sys
P0, RS, RD, SLAM, TS, END = 1.0, 1.2, 3.2, 4.6, 16.603, 15.2
ring, pic, out = sys.argv[1:4]
fc = (f"[0:a]atrim=0:{P0},asetpts=PTS-STARTPTS,afade=t=out:st={P0-0.004}:d=0.004[m1];"
      f"[0:a]atrim={TS}:{TS + END - SLAM},asetpts=PTS-STARTPTS,adelay={int(SLAM*1000)}|{int(SLAM*1000)}[m2];"
      f"[1:a]aformat=channel_layouts=stereo,atrim=0:{RD},asetpts=PTS-STARTPTS,afade=t=out:st={RD-0.006}:d=0.006,adelay={int(RS*1000)}|{int(RS*1000)}[r];"
      f"[m1][m2][r]amix=inputs=3:normalize=0:duration=longest,atrim=0:{END}[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "public/bgm.mp3", "-i", ring, "-i", pic, "-filter_complex", fc, "-map", "2:v", "-map", "[a]",
                "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", out], check=True)
print("ok", out)
