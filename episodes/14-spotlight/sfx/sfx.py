import numpy as np, wave, json, sys
SR=48000;DUR=108.0;rng=np.random.default_rng(7)
out=np.zeros((int(SR*DUR),2),np.float32)
def env(n,a=0.003,d=0.2):
    t=np.arange(n)/SR;return np.minimum(1,t/a)*np.exp(-t/d)
def tone(f,dur,d=0.15,h=((1,1),)):
    n=int(SR*dur);t=np.arange(n)/SR;s=sum(g*np.sin(2*np.pi*f*k*t) for k,g in h);return s*env(n,0.002,d)
def noise(dur):return rng.standard_normal(int(SR*dur))
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def sweep_noise(dur,f0,f1,att=0.3):
    n=int(SR*dur);x=noise(dur);t=np.arange(n)/SR;out=np.zeros(n);w=int(SR*0.02)
    for i in range(0,n,w):
        fc=f0*(f1/f0)**(i/n);seg=x[i:i+w*2];out[i:i+len(seg)]+=bp(np.pad(seg,(0,0)),fc*0.6,fc*1.6)[:len(seg)]*np.hanning(len(seg))
    e=np.sin(np.pi*np.clip(t/dur,0,1))**att*np.exp(-t/(dur*0.8));return out*e
# --- the palette (original, WeChat-style)
def S_receive():  # short bright two-note "叮"
    a=tone(1318.5,0.22,0.09,((1,1),(2,.18),(3,.05)));b=tone(1760,0.35,0.13,((1,1),(2,.2),(4,.04)))
    x=np.zeros(int(SR*0.5));x[:len(a)]+=a*.7;o=int(SR*0.07);x[o:o+len(b)]+=b;return x*.5
def S_send():     # quick airy "嗖"
    return sweep_noise(0.16,700,4200,0.6)*1.6
def S_key():      # soft key tap
    n=int(SR*0.03);t=np.arange(n)/SR;x=bp(noise(0.03),1800,7000)*np.exp(-t/0.004)*.6+np.sin(2*np.pi*(180+rng.uniform(-20,20))*t)*np.exp(-t/0.008)*.35;return x*rng.uniform(.75,1)
def S_tap():
    n=int(SR*0.04);t=np.arange(n)/SR;return (bp(noise(0.04),900,5000)*np.exp(-t/0.006)*.6+np.sin(2*np.pi*260*t)*np.exp(-t/0.012)*.4)
def S_tick():
    n=int(SR*0.012);t=np.arange(n)/SR;return np.sin(2*np.pi*2600*t)*np.exp(-t/0.0025)*.35
def S_buzz():     # phone vibration, two pulses
    x=np.zeros(int(SR*0.42));
    for o in (0,0.2):
        n=int(SR*0.14);t=np.arange(n)/SR;v=np.sign(np.sin(2*np.pi*150*t))*0.5+np.sin(2*np.pi*300*t)*.3;v*=np.sin(np.pi*t/0.14)**.5;i=int(SR*o);x[i:i+n]+=bp(v,90,900)*.9
    return x
def S_error():
    return (tone(392,0.25,0.12,((1,1),(2,.3)))*.55)
def S_pop():
    n=int(SR*0.09);t=np.arange(n)/SR;f=900*np.exp(-t/0.03)+260;ph=2*np.pi*np.cumsum(f)/SR;return np.sin(ph)*np.exp(-t/0.03)*.6
def S_thud():
    n=int(SR*0.35);t=np.arange(n)/SR;f=120*np.exp(-t/0.08)+55;ph=2*np.pi*np.cumsum(f)/SR;return (np.sin(ph)*np.exp(-t/0.12)+bp(noise(0.35),200,2500)*np.exp(-t/0.02)*.5)*.9
def S_whoosh(d=0.35,f0=300,f1=2500):return sweep_noise(d,f0,f1,0.8)*1.4
def S_marker():
    n=int(SR*0.55);t=np.arange(n)/SR;return bp(noise(0.55),2500,7000)*np.sin(np.pi*t/0.55)**.4*(0.5+0.5*np.abs(np.sin(2*np.pi*14*t)))*.35
def S_chime():
    x=np.zeros(int(SR*1.0))
    for i,f in enumerate((1046.5,1318.5,1568)):
        a=tone(f,0.7,0.25,((1,1),(2,.12)));o=int(SR*0.06*i);x[o:o+len(a)]+=a*.45
    return x
def S_shimmer():
    x=np.zeros(int(SR*1.6))
    for i in range(10):
        f=rng.choice([1568,1760,2093,2349,2637,3136]);a=tone(f,0.6,0.18,((1,1),));o=int(SR*rng.uniform(0,0.8));x[o:o+len(a)]+=a*.18
    return x
P={'receive':S_receive,'send':S_send,'key':S_key,'tap':S_tap,'tick':S_tick,'buzz':S_buzz,'error':S_error,'pop':S_pop,'thud':S_thud,'whoosh':S_whoosh,'marker':S_marker,'chime':S_chime,'shimmer':S_shimmer}
def put(t,name,g=1.0,pan=0.0):
    x=P[name]();i=int(t*SR);n=min(len(x),len(out)-i)
    if n<=0:return
    out[i:i+n,0]+=x[:n]*g*(1-max(0,pan));out[i:i+n,1]+=x[:n]*g*(1+min(0,pan))
cues=json.load(open(sys.argv[1]))
for c in cues: put(*c)
pk=np.abs(out).max();print('cues',len(cues),'peak',pk)
out*=0.5/max(pk,1e-6)  # SFX bus peak at -6 dBFS; level vs music is set in the mix
w=wave.open(sys.argv[2],'wb');w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(out,-1,1)*32767).astype(np.int16).tobytes());w.close()
