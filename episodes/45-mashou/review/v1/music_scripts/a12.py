import numpy as np, librosa, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from scipy.signal import butter, sosfiltfilt
from common import *
x=load_bed(); mono=x.mean(1)
oenv=np.load('oenv.npy'); ot=np.arange(len(oenv))*240/SR
fb=film_beats()
# intro onset by position (0-17.5) at 8th-note resolution
P8=P/2
for nm,a,b,g0 in [('intro',0.5,17.6,0.5688),('coda',125.1,136.0,125.100),('return',138.3,146.8,138.332)]:
    acc={}
    for t in np.arange(g0,b,P8):
        if t<a: continue
        i=(ot>t-0.03)&(ot<t+0.05); p=int(round((t-g0)/P8))%8
        acc.setdefault(p,[]).append(oenv[i].max())
    print(nm,'onset by 8th pos (0=bar line):',{p:round(float(np.mean(v)),2) for p,v in sorted(acc.items())})
# fine band envelopes around title and final and stop
fig,ax=plt.subplots(4,1,figsize=(14,12))
bands=[('<150',None,150),('150-2k',150,2000),('>4k',4000,None)]
for r,(t0,lab) in enumerate([(18.115,'title 18.115'),(146.82,'final 146.82'),(116.04,'drop 116.04'),(136.09,'dead stop 136.09')]):
    for nm,lo,hi in bands:
        if lo is None: sos=butter(4,hi,'lp',fs=SR,output='sos')
        elif hi is None: sos=butter(4,lo,'hp',fs=SR,output='sos')
        else: sos=butter(4,[lo,hi],'bp',fs=SR,output='sos')
        s=sosfiltfilt(sos,mono[int((t0-0.6)*SR):int((t0+0.6)*SR)]); h=int(0.005*SR)
        e=[10*np.log10((s[i:i+h]**2).mean()+1e-14) for i in range(0,len(s)-h,h)]
        ax[r].plot(np.arange(len(e))*0.005-0.6,e,label=nm)
    for t,k,s in fb:
        if abs(t-t0)<0.6: ax[r].axvline(t-t0,c='k',ls=':')
    ax[r].axvline(0,c='r'); ax[r].set_title(lab+' (red = intended, dotted = beats)'); ax[r].legend(); ax[r].set_ylim(-80,-5)
plt.tight_layout(); plt.savefig('/home/claude/video/episodes/45-mashou/review/v1/music_hits.png',dpi=60)
# where does the music actually stop at the dead stop
s=mono[int(135.5*SR):int(136.6*SR)]; h=int(0.01*SR)
e=[10*np.log10((s[i:i+h]**2).mean()+1e-14) for i in range(0,len(s)-h,h)]
print('dead-stop 10ms RMS from 135.5:',' '.join('%.2f:%.0f'%(135.5+i*0.01,v) for i,v in enumerate(e) if i%3==0))
