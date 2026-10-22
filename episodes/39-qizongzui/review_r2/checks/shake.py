# does the reveal shake move the whole frame? track the watermark (bottom-right) and left column vs disc rim per frame
import subprocess, numpy as np, sys
V=sys.argv[1]; S=int(sys.argv[2]); N=int(sys.argv[3]); W,H=1920,1080
raw=subprocess.run(['ffmpeg','-v','error','-ss',f'{S/30-0.5:.3f}','-i',V,'-ss','0.5','-frames:v',str(N),'-f','rawvideo','-pix_fmt','gray','-'],capture_output=True).stdout
F=np.frombuffer(raw,np.uint8)[:N*W*H].reshape(-1,H,W).astype(np.float32)
ref_wm=F[0,1000:1050,1650:1880]
def best_shift(ref,img,y0,x0,r=14):
    h,w=ref.shape; best=(1e9,0,0)
    for dy in range(-r,r+1):
        for dx in range(-r,r+1):
            c=img[y0+dy:y0+dy+h,x0+dx:x0+dx+w]
            e=np.abs(c-ref).mean()
            if e<best[0]: best=(e,dx,dy)
    return best
for k in range(len(F)):
    e,dx,dy=best_shift(ref_wm,F[k],1000,1650)
    print(f'f{S+k} {(S+k)/30:.3f}s watermark shift dx={dx:+d} dy={dy:+d} (err {e:.1f})')
