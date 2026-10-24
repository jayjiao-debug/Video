import subprocess, numpy as np
V='/tmp/claude-0/-home-claude/7db4c2b1-160e-5062-86b7-9eb552e585fb/scratchpad/out45/ep45_film_v1.mp4'
raw=subprocess.run(['ffmpeg','-loglevel','error','-i',V,'-vf','scale=160:90,format=gray','-f','rawvideo','-'],capture_output=True).stdout
f=np.frombuffer(raw,np.uint8).reshape(-1,90,160).astype(np.float32)
d=np.abs(np.diff(f,axis=0)).mean((1,2))  # d[i] = change into frame i+1
np.save('fdiff.npy',d)
def show(a,b):
    print('%.2f-%.2f:'%(a,b),' '.join('%.2f:%.1f'%((i+1)/30,d[i]) for i in range(int(a*30),int(b*30))))
for a,b in [(41.5,42.0),(114.5,116.3),(105.2,107.3),(135.5,138.6),(56.4,57.4),(63.8,64.2),(146.6,147.1)]: show(a,b)
# motion level per second (mean diff) for quiet zones
for a,b in [(105.95,106.98),(106.98,110.38),(136.09,137.77),(116.04,121.1),(18.1,20.9)]:
    print('mean frame diff %.2f-%.2f = %.3f'%(a,b,d[int(a*30):int(b*30)].mean()))
print('film median frame diff',np.median(d))
