import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR=44100;END=90.49;FADE0=87.02
song,_=sf.read('song44.wav',dtype='float64');song=song[:int(END*SR)]
t=np.arange(len(song))/SR;g=np.ones(len(song));m=t>=FADE0;g[m]=np.cos((t[m]-FADE0)/(END-FADE0)*np.pi/2)**2;song=song*g[:,None]
rng=np.random.default_rng(22)
def bp(x,lo,hi):return sosfilt(butter(4,[lo,hi],'band',fs=SR,output='sos'),x)
def lp(x,f):return sosfilt(butter(4,f,'low',fs=SR,output='sos'),x)
def hiss(dur,att=.012,rel=.35,lo=1800,hi=9000,shape=1.):
    n=int(dur*SR);tt=np.arange(n)/SR;x=bp(rng.standard_normal(n),lo,hi)
    env=np.minimum(1,tt/att)*np.exp(-np.maximum(0,tt-dur*.25)/rel*shape);return x*env/np.abs(x).max()
def thump(f0=55,dur=.6):
    n=int(dur*SR);tt=np.arange(n)/SR;f=f0*(1+1.2*np.exp(-tt*18));ph=2*np.pi*np.cumsum(f)/SR
    x=np.sin(ph)*np.exp(-tt*7)+.3*lp(rng.standard_normal(n),300)*np.exp(-tt*16);return x/np.abs(x).max()
def skid(dur=1.3):
    n=int(dur*SR);tt=np.arange(n)/SR;x=bp(rng.standard_normal(n),900,3200)*(1+.4*np.sin(2*np.pi*31*tt))
    env=np.minimum(1,tt/.05)*np.exp(-tt/.7);return x*env/np.abs(x).max()
def swell(dur=.9):
    n=int(dur*SR);tt=np.arange(n)/SR;x=bp(rng.standard_normal(n),300,2500);env=(tt/dur)**2.5*np.exp(-np.maximum(0,tt-dur*.93)*40);return x*env/np.abs(x).max()
o=np.zeros_like(song)
def put(x,at,db,pan=0.):
    i=int(at*SR);x=x[:max(0,len(o)-i)]*10**((db+6)/20);o[i:i+len(x),0]+=x*(1-max(0,pan));o[i:i+len(x),1]+=x*(1+min(0,pan))
# events (times on the measured grid)
put(hiss(1.6,rel=.5,lo=1200,hi=7000),34.95,-26)            # rear jets on the ceiling run
put(swell(.6),37.3-.6,-27)                                 # time freezes
put(swell(.7),20.97-.7,-28)
put(hiss(1.1,att=.006,rel=.25),40.31,-20,-.3)               # flip: one side fires
put(hiss(2.0,att=.2,rel=.9,lo=900,hi=6000),45.1,-23)        # hover brake
put(thump(52,.7),47.04,-17)                                 # landing 1
put(hiss(1.0,att=.005,rel=.3,lo=700,hi=8000),54.22,-18)     # jump blast
put(thump(60,.5),54.22,-22)
put(hiss(.35,att=.004,rel=.08),55.0,-27,.4);put(hiss(.35,att=.004,rel=.08),57.9,-27,-.4)  # attitude puffs
put(thump(50,.8),59.21,-16)                                 # landing 2
put(hiss(1.4,att=.01,rel=.45,lo=600,hi=7000),62.68,-18)     # thrust burst
put(skid(1.4),68.12,-24)                                    # hard stop
pk=lambda x:20*np.log10(np.abs(x).max()+1e-12)
mix=song+o;over=np.abs(mix).max()
if over>10**(-.3/20):
    # turn down only the SFX where the sum would clip
    need=np.clip((10**(-.3/20)-np.abs(song))/np.maximum(np.abs(o),1e-9),0,1).min(axis=1);
    from scipy.ndimage import minimum_filter1d,uniform_filter1d
    gg=uniform_filter1d(minimum_filter1d(need,2048),1024);o*=gg[:,None];mix=song+o
print('song peak',pk(song),'sfx peak',pk(o),'mix peak',pk(mix))
w=int(SR*.4);rs=lambda x:np.sqrt(np.convolve((x**2).mean(1),np.ones(w)/w,'same'))
r1,r2=rs(song),rs(o);i=r2>1e-4;print('sfx-over-music RMS dB (max)',20*np.log10((r2[i]/(r1[i]+1e-9)).max()))
sf.write('mix22.wav',mix.astype(np.float32),SR,subtype='FLOAT');sf.write('sfx22.wav',o.astype(np.float32),SR,subtype='FLOAT')
