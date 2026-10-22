# per-frame luma + |delta| + spatial detail (std) around given times, from a 320x180 gray decode
import subprocess, numpy as np, sys
V=sys.argv[1]; TS=[float(x) for x in sys.argv[2].split(',')]; A=int(sys.argv[3]) if len(sys.argv)>3 else 6; B=int(sys.argv[4]) if len(sys.argv)>4 else 5
W,H=320,180
p=subprocess.run(['ffmpeg','-v','error','-i',V,'-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],capture_output=True).stdout
F=np.frombuffer(p,np.uint8).reshape(-1,H,W).astype(np.float32)
np.save('gray320.npy',F)
for t in TS:
    f0=int(round(t*30)); print(f'--- t={t} (frame {f0})')
    for f in range(f0-A,f0+B):
        d=np.abs(F[f]-F[f-1]).mean(); dn=np.abs(F[f+1]-F[f]).mean(); pn=np.abs(F[f+1]-F[f-1]).mean()
        # spatial detail: mean abs gradient
        g=np.abs(np.diff(F[f],axis=1)).mean()+np.abs(np.diff(F[f],axis=0)).mean()
        print(f'f{f} {f/30:7.3f} mean {F[f].mean():5.1f} L {F[f][:,:160].mean():5.1f} R {F[f][:,160:].mean():5.1f} |d prev| {d:5.2f} |d next| {dn:5.2f} |prev-next| {pn:5.2f} detail {g:5.2f}')
