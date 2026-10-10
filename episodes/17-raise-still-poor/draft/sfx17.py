import numpy as np, soundfile as sf, sys
SR=44100;DUR=129.97;rng=np.random.default_rng(17)
S='../sfx/'
bank=[np.interp(np.arange(int(len(x)*SR/48000))*48000/SR,np.arange(len(x)),x.astype(float)) for x in np.load(S+'iphone_keys_bank.npy',allow_pickle=True)]
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def key(): return bank[rng.integers(len(bank))]*rng.uniform(.85,1)*.55
def msg():
    n=int(SR*.6);t=np.arange(n)/SR;x=np.zeros(n)
    for f,o,g,d in ((554.4,0,.6,.09),(740.0,.07,1.0,.17)):
        i=int(o*SR);tt=t[:n-i];x[i:]+=g*(np.sin(2*np.pi*f*tt)+.25*np.sin(2*np.pi*f*tt*2)*np.exp(-tt/.03)+.08*np.sin(2*np.pi*f*tt*4)*np.exp(-tt/.01))*np.minimum(1,tt/.004)*np.exp(-tt/d)
    return bp(x,180,4000)*.5
def tick():
    n=int(SR*.008);t=np.arange(n)/SR;return (np.sin(2*np.pi*3200*t)*.6+bp(rng.standard_normal(n),1500,6000)*.4)*np.exp(-t/.0015)*.5
def build(cues,out):
    o=np.zeros((int(SR*DUR),2))
    for t,fn,g,p in cues:
        x=fn();i=int(t*SR);n=min(len(x),len(o)-i);o[i:i+n,0]+=x[:n]*g*(1-max(0,p));o[i:i+n,1]+=x[:n]*g*(1+min(0,p))
    sf.write(out,o.astype(np.float32),SR,subtype='FLOAT');print(out,np.abs(o).max())
def typing(t0,t1,n,g=0.9):return [(t0+(t1-t0)*k/n+rng.uniform(-.03,.03),key,g,0.1) for k in range(n)]
def ticks(t0,t1,n,g=0.6):return [(t0+(t1-t0)*(1-(1-k/n)**2),tick,g,0) for k in range(n)]
sal=[(0.05,msg,0.9,0),(7.45,msg,0.8,0.2),(121.4,msg,0.0,0)]+typing(69.45,71.6,6)+ticks(117.9,120.2,24)
build(sal,'sfx_salary.wav')
rd=[(0.0,msg,0.9,0),(121.45,msg,1.0,-0.1)]+typing(14.0,15.2,6)+typing(15.6,16.3,6,0.7)
build(rd,'sfx_read.wav')
