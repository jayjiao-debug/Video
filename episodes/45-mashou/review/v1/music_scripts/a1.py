import numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import correlate
f,sr=sf.read('film.wav',dtype='float32'); b,_=sf.read('/home/claude/video/episodes/45-mashou/music/ep45_film_bed.wav',dtype='float32')
# align on 10-20 s
seg=lambda x,a,c: x[int(a*sr):int(c*sr),0]
A=seg(f,10,20); Bb=seg(b,9.9,20.1)
c=correlate(Bb,A,mode='valid',method='fft'); lag=np.argmax(c); off=(lag/sr+9.9)-10
print('film lags bed by (s):', -off)
sh=int(round(-off*sr))
n=min(len(f)-max(sh,0), len(b))
fa=f[sh:sh+n] if sh>=0 else np.vstack([np.zeros((-sh,2),np.float32),f])[:n]
bb=b[:n]
g=np.dot(fa[:,0],bb[:,0])/np.dot(bb[:,0],bb[:,0]); print('gain film/bed',g, 20*np.log10(g))
res=fa-g*bb
# residual level per 1 s
for t in range(0,int(n/sr)):
    r=res[t*sr:(t+1)*sr]; s=bb[t*sr:(t+1)*sr]
    rr=10*np.log10((r**2).mean()+1e-12); ss=10*np.log10((s**2).mean()+1e-12)
    if rr-ss>-25: print(t,'resid %.1f dB rel bed'%(rr-ss))
m=pyln.Meter(sr)
for nm,x in [('film',f),('bed',b)]:
    L=m.integrated_loudness(x)
    # true peak 4x oversample
    from scipy.signal import resample_poly
    tp=max(np.abs(resample_poly(x[:,c],4,1)).max() for c in range(2))
    print(nm,'LUFS %.2f TP %.2f dBTP sample peak %.2f'%(L,20*np.log10(tp),20*np.log10(np.abs(x).max())))
np.save('shift.npy',np.array([sh]))
