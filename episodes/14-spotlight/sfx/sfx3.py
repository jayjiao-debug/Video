import numpy as np, wave, json, sys
SR=48000;DUR=108.0;rng=np.random.default_rng(11);out=np.zeros((int(SR*DUR),2),np.float32)
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def key():   # iPhone-style keyboard click: dry, short, no body
    n=int(SR*.02);t=np.arange(n)/SR;c=bp(rng.standard_normal(n),2200,9000)*np.exp(-t/.0018);r=np.sin(2*np.pi*rng.uniform(1300,1500)*t)*np.exp(-t/.003)*.35;return (c+r)*rng.uniform(.8,1)
def msg():   # soft chat-message "叮", tuned to the song (C#6 -> F#6, in F# minor)
    n=int(SR*.45);t=np.arange(n)/SR;x=np.zeros(n)
    for f,o,g,d in ((1108.7,0,.55,.07),(1480.0,.06,1.0,.14)):
        i=int(o*SR);tt=t[:n-i];x[i:]+=g*(np.sin(2*np.pi*f*tt)+.12*np.sin(2*np.pi*2*f*tt))*np.minimum(1,tt/.002)*np.exp(-tt/d)
    return x*.5
def tick():  # scroll-wheel detent
    n=int(SR*.008);t=np.arange(n)/SR;return (np.sin(2*np.pi*3200*t)*.6+bp(rng.standard_normal(n),1500,6000)*.4)*np.exp(-t/.0015)*.5
P={'key':key,'msg':msg,'tick':tick}
for t,nm,g,*pan in json.load(open(sys.argv[1])):
    x=P[nm]();i=int(t*SR);n=min(len(x),len(out)-i);p=pan[0] if pan else 0
    out[i:i+n,0]+=x[:n]*g*(1-max(0,p));out[i:i+n,1]+=x[:n]*g*(1+min(0,p))
w=wave.open(sys.argv[2],'wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());w.close();print('peak',np.abs(out).max())
