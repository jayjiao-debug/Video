# kick-onset vs picture-change for every reveal and the title, measured on the delivered mp4
import subprocess, numpy as np, sys
V=sys.argv[1]; SR=48000
raw=subprocess.run(['ffmpeg','-v','error','-i',V,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
x=np.frombuffer(raw,np.float32)
# low band (<150 Hz) via simple FFT filter per window
def onset(t0):
    a=int((t0-0.12)*SR); b=int((t0+0.12)*SR); seg=x[a:b]
    F=np.fft.rfft(seg); f=np.fft.rfftfreq(len(seg),1/SR); F[f>150]=0; lo=np.fft.irfft(F,len(seg))
    env=np.convolve(np.abs(lo),np.ones(48)/48,'same')   # 1 ms smoothing
    d=np.diff(env); i=np.argmax(d)                       # steepest rise
    # also broadband attack
    envb=np.convolve(np.abs(seg),np.ones(48)/48,'same'); ib=np.argmax(np.diff(envb))
    return (a+i)/SR,(a+ib)/SR
# picture: first frame of the reveal (from frame strips)
events={'R1 傲慢':184,'R2 嫉妒':366,'R3 暴怒':549,'R4 懒惰':731,'R5 贪婪':914,'R6 暴食':1096,'R7 色欲':1279,'TITLE':1644}
print(f"{'event':10} {'frame':>5} {'frame start':>11} {'kick(lo)':>9} {'attack(bb)':>10} {'pic-kick ms':>11}")
for k,f in events.items():
    lo,bb=onset(f/30)
    print(f"{k:10} {f:5d} {f/30:11.3f} {lo:9.4f} {bb:10.4f} {1000*(f/30-lo):+11.1f}")
