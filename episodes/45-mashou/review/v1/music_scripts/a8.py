import numpy as np, librosa, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from common import *
x=load_bed(); song=load_song(); mono=x.mean(1); sm=song.mean(1)
# spectral flux at join vs flux at all downbeats in bed
def flux_at(sig,t,n_fft=2048,hop=256):
    s=sig[int((t-0.1)*SR):int((t+0.1)*SR)]
    S=np.log1p(np.abs(librosa.stft(s,n_fft=n_fft,hop_length=hop,center=False))*50)
    f=np.maximum(0,np.diff(S,axis=1)).sum(0); return f.max()
fb=film_beats(); 
db=[t for t,k,s in fb if 21<t<105 or 116<t<125]
ref=np.array([flux_at(mono,t) for t in db])
for jt,label in [(5.097,'loop'),(9.626,'loop'),(20.947,'A->B'),(75.287,'valley'),(125.100,'coda cut'),(136.088,'dead stop')]:
    v=flux_at(mono,jt); print('%-9s %.3f flux %.1f = pct %.0f of beats in body (median %.1f)'%(label,jt,v,100*(ref<v).mean(),np.median(ref)))
# natural flux at incoming song points
for st,lab in [(18.682,'song B(33) natural'),(149.996,'song B(265) natural'),(0.569,'song first note')]:
    print(lab,'%.1f'%flux_at(sm,st))
# click test: highpass >8k energy in 2 ms around join vs median of 2ms windows within +-0.5s
h=sosfilt(butter(4,8000,'hp',fs=SR,output='sos'),mono)
for jt in [5.097,9.626,20.947,75.287,125.100,136.088,137.773]:
    w=int(0.002*SR); i=int(jt*SR)
    e=[(h[k:k+w]**2).mean() for k in range(i-int(0.5*SR),i+int(0.5*SR),w)]
    c=(h[i-w:i+w]**2).mean(); print('HF burst at %.3f: %.1f dB vs local median, %.1f vs local p95'%(jt,10*np.log10(c/np.median(e)),10*np.log10(c/np.percentile(e,95))))
# phone sim momentary around lead-in/breath/drop
ph=sosfilt(butter(4,250,'hp',fs=SR,output='sos'),x,axis=0)
m=pyln.Meter(SR,block_size=0.4)
def L(sig,a,b): return m.integrated_loudness(sig[int(a*SR):int(b*SR)])
print('full / phone loudness per bar:')
for a in np.arange(104.72,125.1,2.2642):
    print(' %.2f-%.2f full %.1f phone %.1f'%(a,a+2.264,L(x,a,a+2.264),L(ph,a,a+2.264)))
print('breath 114.91-116.04 full %.1f phone %.1f; drop first bar 116.04-118.31 full %.1f phone %.1f'%(L(x,114.91,116.04),L(ph,114.91,116.04),L(x,116.04,118.31),L(ph,116.04,118.31)))
print('title bar 18.11-20.38 full %.1f phone %.1f; final 146.82-149.09 full %.1f phone %.1f'%(L(x,18.11,20.38),L(ph,18.11,20.38),L(x,146.82,149.09),L(ph,146.82,149.09)))
print('valley per bar (low band <120 Hz RMS dB):')
lo=sosfilt(butter(4,120,'lp',fs=SR,output='sos'),mono)
for t in np.arange(75.287,90,0.56605):
    s=lo[int(t*SR):int((t+0.25)*SR)]; print('  %.3f %.1f'%(t,10*np.log10((s**2).mean()+1e-12)),end='')
print()
