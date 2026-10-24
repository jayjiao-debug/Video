import numpy as np, soundfile as sf, subprocess
SR=48000; P=0.56605; T0=0.5688; STOP=252.128
B=lambda k: T0+(k-1)*P
# film segments: (film_start_of_segment_audio, song_start, song_end) ; join times = film start + xf
SEG=[(0.000,0.0,5.097),(5.087,0.559,5.097),(9.616,0.559,11.890),(20.937,18.672,73.023),(75.277,149.996,181.139),(106.410,181.695,200.384),(125.060,241.100,252.128),(136.073,None,None),(137.763,0.0,16.418)]
def _fix():
    out=[];
    for k,(fs,a,b) in enumerate(SEG):
        out.append((fs,a,b))
    return out
def film_beats(downbeats=False):
    res=[]
    for k,(fs,a,b) in enumerate(SEG):
        if a is None: continue
        fe = SEG[k+1][0] if k+1<len(SEG) else 154.181
        # beats in [a,b)
        k0=int(np.ceil((a-T0)/P))+1
        kk=k0
        while True:
            t=B(kk)
            if t>=b-1e-3: break
            ft=fs+(t-a)
            if ft>=fs+0.005 or k==0:
                if ft<=fe+0.005: res.append((round(ft,4),kk,t))
            kk+=1
    return res
def load_song():
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i','/home/claude/video/episodes/41-sanqiannian/audio/bgm2.mp3','-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32).reshape(-1,2).copy()
def load_bed():
    x,_=sf.read('/home/claude/video/episodes/45-mashou/music/ep45_film_bed.wav',dtype='float32'); return x
