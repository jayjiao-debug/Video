"""ep42 v2 bed (A_valley without the title section). build_v3.py SPANS/XF semantics; out = beat, in = beat - XF."""
import numpy as np, soundfile as sf, pyloudnorm as pyln, sys, json
from scipy.signal import fftconvolve
from build42 import song, SR, B, P, STOP
V={'v2':     dict(SPANS=[(0.0,B(21)),(B(33)-0.010,B(129)),(B(265)-0.010,B(320)),(B(321)-0.010,B(354)),(B(426)-0.040,STOP),('gap',1.70),(0.0,B(29))],
                  XF=[0.010,0.010,0.010,0.040,0.015,0.010]),
   'v2_alt': dict(SPANS=[(0.0,B(21)),(B(29)-0.010,B(129)),(B(265)-0.010,B(320)),(B(321)-0.010,B(354)),(B(426)-0.040,STOP),('gap',1.70),(0.0,B(29))],
                  XF=[0.010,0.010,0.010,0.040,0.015,0.010])}
def build(o):
    bgm=song[:0]; joins=[]
    for k,sp in enumerate(o['SPANS']):
        seg=np.zeros((int(round(sp[1]*SR)),2),np.float32) if sp[0]=='gap' else song[int(round(sp[0]*SR)):int(round(sp[1]*SR))].copy()
        if len(bgm):
            xf=int(round(o['XF'][k-1]*SR)); r=np.linspace(0,1,xf)[:,None]; bgm[-xf:]=bgm[-xf:]*(1-r)+seg[:xf]*r; seg=seg[xf:]; joins.append(len(bgm)/SR)
        bgm=np.concatenate([bgm,seg])
    n=len(bgm)
    def tail_at(a,b,at,ir,db):
        tl=song[int(a*SR):int(b*SR)]; rv=np.stack([fftconvolve(tl[:,c],ir) for c in range(2)],1).astype(np.float32)*10**(db/20)
        j=int(at*SR); mm=min(len(rv),n-j); bgm[j:j+mm]+=rv[:mm]
    ir=np.random.default_rng(7).standard_normal(int(2.5*SR))*np.exp(-np.arange(int(2.5*SR))/(0.55*SR)); ir/=np.sqrt((ir**2).sum())
    ir2=np.random.default_rng(11).standard_normal(int(4.0*SR))*np.exp(-np.arange(int(4.0*SR))/(1.1*SR)); ir2/=np.sqrt((ir2**2).sum())
    tail_at(B(354)-0.3,B(354),joins[3],ir,-12)          # drop -> coda cut rings
    tail_at(STOP-0.4,STOP,joins[4]-0.4,ir2,-9)         # coda dead stop rings into the gap
    t=np.arange(n)/SR; g=np.ones(n)
    DROP=joins[3]-(B(354)-B(338))                      # film time of song 191.328
    up=np.clip((t-(DROP-2*P))/P,0,1); w=0.5-0.5*np.cos(np.pi*up); w[t>=DROP]=0; g*=10**(-5*w/20)   # pre-drop breath
    jr=int((joins[5]-0.010)*SR); g[jr:]*=10**(-3/20)   # bookend return -3 dB
    F=B(29)-B(21); i=int((n/SR-F)*SR); g[i:]*=np.cos(np.linspace(0,1,n-i)*np.pi/2)**1.5   # fade over the last 2 bars
    return (bgm*g[:,None]).astype(np.float32), joins, DROP
if __name__=='__main__':
    m=pyln.Meter(SR)
    for nm,o in V.items():
        x,j,d=build(o); x*=10**((-14-m.integrated_loudness(x))/20)
        sf.write(f'ep42_bed_{nm}.wav',x,SR,subtype='PCM_24'); sf.write(f'raw_{nm}.wav',x,SR,subtype='FLOAT')
        print(nm,'dur %.3f'%(len(x)/SR),'joins',[round(v,3) for v in j],'drop %.3f'%d,'SPANS',[(round(a,3) if not isinstance(a,str) else a,round(b,3)) for a,b in o['SPANS']])
