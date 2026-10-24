import numpy as np, subprocess
SR=48000
def load(path, sr=SR):
    raw = subprocess.run(['ffmpeg','-loglevel','error','-i',path,'-f','f32le','-ac','2','-ar',str(sr),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).reshape(-1,2).copy()
SONG='/home/claude/video/episodes/41-sanqiannian/audio/bgm2.mp3'
