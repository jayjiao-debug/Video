import numpy as np, wave, json, sys
SR=48000;DUR=95.6;rng=np.random.default_rng(11);out=np.zeros((int(SR*DUR),2),np.float32)
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
BANK=list(np.load('iphone_keys_bank.npy',allow_pickle=True))
def key():   # real iPhone keyboard presses (BigSoundBank #447, CC0), one of 7, random
    return BANK[rng.integers(len(BANK))].astype(np.float64)*rng.uniform(.85,1)*.55
def msg():   # deeper, softer message pop (C#5 -> F#5, in the song's key), marimba-like
    n=int(SR*.6);t=np.arange(n)/SR;x=np.zeros(n)
    for f,o,g,d in ((554.4,0,.6,.09),(740.0,.07,1.0,.17)):
        i=int(o*SR);tt=t[:n-i];x[i:]+=g*(np.sin(2*np.pi*f*tt)+.25*np.sin(2*np.pi*f*tt*2)*np.exp(-tt/.03)+.08*np.sin(2*np.pi*f*tt*4)*np.exp(-tt/.01))*np.minimum(1,tt/.004)*np.exp(-tt/d)
    return bp(x,180,4000)*.5
def tick():  # scroll-wheel detent
    n=int(SR*.008);t=np.arange(n)/SR;return (np.sin(2*np.pi*3200*t)*.6+bp(rng.standard_normal(n),1500,6000)*.4)*np.exp(-t/.0015)*.5
P={'key':key,'msg':msg,'tick':tick}
for t,nm,g,*pan in json.load(open(sys.argv[1])):
    x=P[nm]();i=int(t*SR);n=min(len(x),len(out)-i);p=pan[0] if pan else 0
    out[i:i+n,0]+=x[:n]*g*(1-max(0,p));out[i:i+n,1]+=x[:n]*g*(1+min(0,p))
w=wave.open(sys.argv[2],'wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());w.close();print('peak',np.abs(out).max())
