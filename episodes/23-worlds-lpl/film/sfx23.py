import numpy as np, soundfile as sf
SR=44100;DUR=129.97;B=lambda n:0.383+2.0248*n;BEAT=0.5062
rng=np.random.default_rng(23)
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def ping(f1=739.99,f2=1108.73,g=1.0):  # F#5 + C#6, the track's key
    n=int(SR*.8);t=np.arange(n)/SR;x=np.zeros(n)
    for f,o,gg,d in ((f1,0,.55,.14),(f2,.05,.75,.25)):
        i=int(o*SR);tt=t[:n-i];x[i:]+=gg*(np.sin(2*np.pi*f*tt)+.2*np.sin(2*np.pi*f*2*tt)*np.exp(-tt/.03))*np.minimum(1,tt/.003)*np.exp(-tt/d)
    return bp(x,200,6000)*.4*g
def click():
    n=int(SR*.12);t=np.arange(n)/SR;nz=bp(rng.standard_normal(n),1500,7000)*np.exp(-t/.006)*.25
    tone=np.sin(2*np.pi*554.37*t)*np.exp(-t/.05)*.35*np.minimum(1,t/.002)
    return (nz+tone)*.55
def whoosh(d=.9):
    n=int(SR*d);t=np.arange(n)/SR;e=np.sin(np.pi*t/d)**2*np.exp(-((t/d-.62)**2)/.05)
    x=bp(rng.standard_normal(n),300,3500)*e;return x/np.abs(x).max()*.35
o=np.zeros((int(SR*DUR),2))
def add(x,t,p=0.):
    i=int(t*SR);j=min(len(o),i+len(x));o[i:j,0]+=x[:j-i]*(1-max(0,p));o[i:j,1]+=x[:j-i]*(1+min(0,p))
for t in [B(24)+.15,B(28)+.1,B(30)+.1]: add(ping(g=.8),t)
for k,t in enumerate([B(34)+BEAT,B(34)+BEAT*3,B(34)+BEAT*5,B(36)+BEAT,B(36)+BEAT*3,B(36)+BEAT*5,B(38)+BEAT,B(38)+BEAT*2,B(38)+BEAT*3,B(39)+.02]): add(click(),t,-.25)
for k,t in enumerate([B(54)+BEAT,B(54)+BEAT*3,B(54)+BEAT*5]):
    w=whoosh();n=len(w);i=int((t-.62*.9)*SR);pan=np.linspace(-.6,.6,n);o[i:i+n,0]+=w*(1-np.maximum(0,pan));o[i:i+n,1]+=w*(1+np.minimum(0,pan))
sf.write('sfx23.wav',o.astype(np.float32),SR,subtype='FLOAT');print(np.abs(o).max())
