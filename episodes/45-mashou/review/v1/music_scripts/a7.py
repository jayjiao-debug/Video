import numpy as np, librosa
from common import *
x=load_bed(); mono=x.mean(1)
fb=film_beats()
oenv=np.load('oenv.npy'); hop=240; ot=np.arange(len(oenv))*hop/SR
def rms(t0,t1): s=mono[int(t0*SR):int(t1*SR)]; return 10*np.log10((s**2).mean()+1e-12)
rows=[]
for t,k,s in fb:
    i=(ot>t-0.03)&(ot<t+0.05); o=oenv[i].max()
    jump=rms(t,t+0.15)-rms(t-0.3,t-0.02)
    rows.append((t,k,s,o,jump,rms(t,t+0.25)))
rows=np.array(rows)
sc=rows[:,3]/np.median(rows[:,3])
print('top 25 beats by onset strength (x median), with level jump:')
for r in sorted(rows,key=lambda r:-r[3])[:25]:
    print('film %.3f song beat %d (%.3f) bar-pos %d onset %.1fx jump %+.1f dB lvl %.1f'%(r[0],r[1],r[2],(r[1]-1)%4,r[3]/np.median(rows[:,3]),r[4],r[5]))
for t in [56.607,57.174,63.966,88.872,18.117,18.683]:
    r=rows[np.argmin(np.abs(rows[:,0]-t))]; print('at %.3f: onset %.1fx jump %+.1f bar-pos %d'%(t,r[3]/np.median(rows[:,3]),r[4],(r[1]-1)%4))
