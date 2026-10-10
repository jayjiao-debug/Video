import numpy as np, soundfile as sf
SR=44100;DUR=129.97
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def ping(f1=880.0,f2=1318.5):
    n=int(SR*.7);t=np.arange(n)/SR;x=np.zeros(n)
    for f,o,g,d in ((f1,0,.55,.12),(f2,.06,.8,.22)):
        i=int(o*SR);tt=t[:n-i];x[i:]+=g*(np.sin(2*np.pi*f*tt)+.2*np.sin(2*np.pi*f*2*tt)*np.exp(-tt/.03))*np.minimum(1,tt/.003)*np.exp(-tt/d)
    return bp(x,200,6000)*.4
o=np.zeros((int(SR*DUR),2))
for k,t in enumerate([0.15,8.6]):
    x=ping()*0.7;p=[-.15,.3][k];i=int(t*SR);o[i:i+len(x),0]+=x*(1-max(0,p));o[i:i+len(x),1]+=x*(1+min(0,p))
sf.write('sfx21.wav',o.astype(np.float32),SR,subtype='FLOAT');print(np.abs(o).max())
