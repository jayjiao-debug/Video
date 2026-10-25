import numpy as np, json, pyloudnorm as pyln
from scipy.signal import butter, sosfiltfilt, sosfilt
from common import *
x=load_bed(); mono=x.mean(1)
# 1) fine attack analysis around title / final / drop / coda / stop hit / re-entry 
hp=sosfiltfilt(butter(4,4000,'hp',fs=SR,output='sos'),mono); lp=sosfiltfilt(butter(4,150,'lp',fs=SR,output='sos'),mono)
def env(s,t0,t1,w=0.003):
    h=int(w*SR); i0=int(t0*SR); i1=int(t1*SR); out=[]
    for i in range(i0,i1,h): out.append(10*np.log10((s[i:i+h]**2).mean()+1e-14))
    return np.arange(t0,t1,w)[:len(out)],np.array(out)
for nm,t in [('title',18.117),('final',146.823),('drop',116.043),('coda',125.100),('stopHIT',105.288),('reentry?',57.174),('D4 63.97',63.966),('D12',88.872),('firstnote',138.332)]:
    r=[]
    for lab,s in [('full',mono),('hi>4k',hp),('lo<150',lp)]:
        tt,e=env(s,t-0.3,t+0.2)
        base=np.median(e[:30]); pk=e.max()
        # attack = first time env rises within 6 dB of its max in window after t-0.2
        k=np.where(e>=pk-6)[0][0]
        r.append('%s attack %+4.0f ms (peak %+4.0f ms)'%(lab,1000*(tt[k]-t),1000*(tt[np.argmax(e)]-t)))
    print('%-9s %.3f | '%(nm,t)+' | '.join(r))
# 2) silent spans < -60 dBFS (10ms)
h=int(0.01*SR); e=np.array([10*np.log10((mono[i:i+h]**2).mean()+1e-14) for i in range(0,len(mono)-h,h)])
q=e<-50; st=None
for i,v in enumerate(q):
    if v and st is None: st=i
    if (not v) and st is not None:
        if (i-st)*0.01>0.15: print('below -50 dBFS: %.2f-%.2f (%.2f s)'%(st*0.01,i*0.01,(i-st)*0.01))
        st=None
q=e<-40; st=None
for i,v in enumerate(q):
    if v and st is None: st=i
    if (not v) and st is not None:
        if (i-st)*0.01>0.3: print('below -40 dBFS: %.2f-%.2f (%.2f s)'%(st*0.01,i*0.01,(i-st)*0.01))
        st=None
# 3) phone-speaker sim: HPF 250 Hz 4th order + gentle LPF 10k ; per-section loudness
ph=sosfilt(butter(4,250,'hp',fs=SR,output='sos'),x,axis=0); ph=sosfilt(butter(2,10000,'lp',fs=SR,output='sos'),ph,axis=0)
m=pyln.Meter(SR)
secs=[('cold open',0,18.1),('title',18.1,20.95),('A body',20.95,34.5),('S2',34.5,48.1),('S3',48.1,63.97),('S3b',63.97,75.29),('valley',75.29,88.87),('crash-build',88.87,105.29),('lead-in',106.96,113.2),('lead-in2',113.2,116.04),('DROP',116.04,125.1),('coda',125.1,136.09),('intro ret',138.3,146.82),('final',146.82,150.8)]
print('section            full-band  phone-sim   L/R corr  mono loss dB  2-5k rel')
for nm,a,b in secs:
    s=x[int(a*SR):int(b*SR)]; p=ph[int(a*SR):int(b*SR)]
    Lf=m.integrated_loudness(s) if b-a>0.5 else np.nan; Lp=m.integrated_loudness(p)
    c=np.corrcoef(s[:,0],s[:,1])[0,1]
    mono_db=10*np.log10(((s.mean(1))**2).mean()/(((s**2).mean(0).sum())/2))
    S=np.abs(np.fft.rfft(s.mean(1)))**2; f=np.fft.rfftfreq(len(s),1/SR); hr=10*np.log10(S[(f>2000)&(f<5000)].sum()/S.sum())
    print('%-14s %8.1f %10.1f %10.2f %10.1f %10.1f'%(nm,Lf,Lp,c,mono_db,hr))
