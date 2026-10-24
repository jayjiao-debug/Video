import numpy as np, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, sosfiltfilt
from common import *
x=load_bed(); song=load_song(); mono=x.mean(1); sm=song.mean(1)
hp=butter(4,6000,'hp',fs=SR,output='sos')
def hf(sig,t,w=0.002): s=sosfiltfilt(hp,sig[int((t-0.05)*SR):int((t+0.05)*SR)]); c=int(0.05*SR); h=int(w*SR/2); return 10*np.log10((s[c-h:c+h]**2).mean()+1e-14)
# 75.287: compare bed vs song continuing at outgoing (73.023+0.01) and song at incoming natural 150.006
print('HF6k 2ms @join: bed %.1f | song natural outgoing (73.023) %.1f | song natural incoming (150.006) %.1f'%(hf(mono,75.287),hf(sm,73.023),hf(sm,150.006)))
for d in [-0.02,-0.01,-0.005,0,0.005,0.01,0.02]:
    print('  bed %+.3f: %.1f'%(d,hf(mono,75.287+d)),' song150 %.1f'%hf(sm,150.006+d))
# drop contrast fix simulation on phone
t=np.arange(len(x))/SR
ph=lambda s: sosfilt(butter(4,250,'hp',fs=SR,output='sos'),s,axis=0)
m=pyln.Meter(SR)
def L(s,a,b): return m.integrated_loudness(s[int(a*SR):int(b*SR)])
DROP=116.043; Pb=P
g=np.ones(len(x))
# lead-in -2 dB from 106.986 (ramp in over 1 beat), breath extra -3 (total -8)
li=np.clip((t-106.986)/Pb,0,1); li[t>=DROP]=0; g*=10**(-2*li/20)
up=np.clip((t-(DROP-2*Pb))/Pb,0,1); w=0.5-0.5*np.cos(np.pi*up); w[t>=DROP]=0; g*=10**(-3*w/20)
y=x*g[:,None]; py=ph(y); px=ph(x)
for nm,s,ps in [('now',x,px),('fix',y,py)]:
    print(nm,'phone: lead-in %.1f breath %.1f drop bar %.1f  -> drop-breath %+.1f dB, drop-leadin %+.1f | full lead-in %.1f, integrated %.2f'%(L(ps,106.99,114.91),L(ps,115.48,116.04),L(ps,116.04,118.31),L(ps,116.04,118.31)-L(ps,115.48,116.04),L(ps,116.04,118.31)-L(ps,106.99,114.91),L(s,106.99,114.91),m.integrated_loudness(s)))
