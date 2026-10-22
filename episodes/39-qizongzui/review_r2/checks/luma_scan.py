# per-frame luminance scan: whole frame, left half, right half; and A/B/C test for single-frame events
import subprocess, numpy as np, json, sys
V=sys.argv[1]; OUT=sys.argv[2]
W,H=320,180
p=subprocess.Popen(['ffmpeg','-v','error','-i',V,'-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],stdout=subprocess.PIPE)
fr=[]
while True:
    b=p.stdout.read(W*H)
    if len(b)<W*H: break
    fr.append(np.frombuffer(b,np.uint8).reshape(H,W))
F=np.array(fr).astype(np.float32)
mean=F.mean((1,2)); left=F[:,:,:W//2].mean((1,2)); right=F[:,:,W//2:].mean((1,2))
# fraction of near-white pixels (>200)
white=(F>200).mean((1,2))
np.save(OUT+'/luma.npy',np.stack([mean,left,right,white]))
n=len(F)
print('frames',n)
# flash detector: frame whose mean is > neighbours' mean by >6 and whose white-fraction jumps
ev=[]
for i in range(1,n-1):
    up=mean[i]-max(mean[i-1],mean[i+1])
    if up>4 or (white[i]-max(white[i-1],white[i+1]))>0.03:
        ev.append((i,i/30,round(float(mean[i-1]),1),round(float(mean[i]),1),round(float(mean[i+1]),1),round(float(white[i-1]),3),round(float(white[i]),3),round(float(white[i+1]),3)))
print('isolated brightness bumps (frame,t,mean prev/this/next, white frac prev/this/next):')
for e in ev: print(e)
# biggest 2-frame brightness spike relative to 0.3 s median
import numpy as np
med=np.array([np.median(mean[max(0,i-9):i+10]) for i in range(n)])
top=np.argsort(mean-med)[::-1][:12]
print('top brightness excess over local median:')
for i in sorted(top): print(i, f'{i/30:.3f}', round(float(mean[i]),1), round(float(med[i]),1), 'L',round(float(left[i]),1),'R',round(float(right[i]),1))
# A/B/C: is frame i different from both i-1 and i+1 while they resemble each other?
for t in [4.267,16.433,28.6,40.767,48.867]:
    i=int(round(t*30))
    for j in (i-1,i):
        a,b,c=F[j-1],F[j],F[j+1]
        print(f't={j/30:.3f} |prev-this|={np.abs(a-b).mean():.1f} |this-next|={np.abs(b-c).mean():.1f} |prev-next|={np.abs(a-c).mean():.1f} mean {a.mean():.1f}/{b.mean():.1f}/{c.mean():.1f}')
