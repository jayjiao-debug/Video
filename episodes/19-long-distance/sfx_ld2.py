import numpy as np, soundfile as sf
SR=44100;DUR=129.97
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def msg():
    n=int(SR*.6);t=np.arange(n)/SR;x=np.zeros(n)
    for f,o,g,d in ((554.4,0,.6,.09),(740.0,.07,1.0,.17)):
        i=int(o*SR);tt=t[:n-i];x[i:]+=g*(np.sin(2*np.pi*f*tt)+.25*np.sin(2*np.pi*f*tt*2)*np.exp(-tt/.03)+.08*np.sin(2*np.pi*f*tt*4)*np.exp(-tt/.01))*np.minimum(1,tt/.004)*np.exp(-tt/d)
    return bp(x,180,4000)*.5
o=np.zeros((int(SR*DUR),2))
for t,d in [(9.5,0),(10.3,1),(11.1,0),(11.9,1),(12.7,0),(13.4,1)]:
    x=msg()*0.8;p=0.25 if d==0 else -0.25;i=int(t*SR);o[i:i+len(x),0]+=x*(1-max(0,p));o[i:i+len(x),1]+=x*(1+min(0,p))
sf.write('sfx_ld2.wav',o.astype(np.float32),SR,subtype='FLOAT');print(np.abs(o).max())
