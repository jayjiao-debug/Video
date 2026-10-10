import numpy as np, wave, json, sys
SR=48000;DUR=129.97;N=int(SR*DUR);out=np.zeros((N,2));rng=np.random.default_rng(15)
D='../sfx15b/'
def rd(f):
    w=wave.open(D+f);x=np.frombuffer(w.readframes(w.getnframes()),np.int16).reshape(-1,2)/32768.;return x
def bp(x,lo,hi):
    X=np.fft.rfft(x,axis=0);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x),axis=0)
def put(x,t,g=1.0,pan=0.0):
    if x.ndim==1:x=np.stack([x,x],1)
    i=int(t*SR);n=min(len(x),N-i);out[i:i+n,0]+=x[:n,0]*g*(1-max(0,pan));out[i:i+n,1]+=x[:n,1]*g*(1+min(0,pan))
def norm(x):return x/(np.abs(x).max()+1e-9)
H=[norm(rd(f)) for f in ['bsb0258_car_horn2.wav','bsb0850_car_horn5.wav','bsb0969_car_horn7.wav','bsb3438_honk90.wav','bsb3506_horn3.wav','bsb3593_bus_horns.wav']]
# trim long horn files to short honks (random 0.3-1.4 s slices with fades)
def slice_(x,mx):
    L=int(SR*rng.uniform(0.18,mx));st=rng.integers(0,max(1,len(x)-L));y=x[st:st+L].copy();f=int(SR*0.02);y[:f]*=np.linspace(0,1,f)[:,None];y[-f*3:]*=np.linspace(1,0,f*3)[:,None];return y
# opening: a few friendly two-tone "beep-beep"s (in the song's key, F# minor), all over by 0.8 s
def beep(f1,f2,d,g=1.0):
    n=int(SR*(d+0.06));t=np.arange(n)/SR;y=np.zeros(n)
    for f in (f1,f2):
        for h,a in ((1,1.0),(2,0.18),(3,0.22),(5,0.06)):y+=a*np.sin(2*np.pi*f*h*t*(1+0.0015*np.sin(2*np.pi*5*t)))
    e=np.minimum(1,t/0.006)*np.clip((d+0.035-t)/0.035,0,1);return bp(y*e,150,5000)/4*g
# v3.5: the sweet spot — a small 1.4 s traffic-jam chorus, louder, still soft-edged
for t0,f1,f2,d,g,p in [(0.00,554.4,659.3,0.13,1.0,-0.4),(0.20,554.4,659.3,0.13,1.0,-0.4),(0.46,370.0,440.0,0.36,0.9,0.4),
                       (0.62,440.0,554.4,0.11,0.8,0.0),(0.78,440.0,554.4,0.11,0.8,0.0),(1.02,554.4,659.3,0.30,0.95,-0.4)]:
    put(beep(f1,f2,d),t0,g*1.45,p)
def whoosh(d,f0,f1,peak=0.6):
    n=int(SR*d);x=rng.standard_normal(n);t=np.arange(n)/SR;y=np.zeros(n);fc=f0*(f1/f0)**(t/d)
    # time-varying lowpass via one-pole
    a=np.exp(-2*np.pi*fc/SR);s=0
    for k in range(n):s=a[k]*s+(1-a[k])*x[k];y[k]=s
    e=np.sin(np.pi*np.clip(t/d,0,1))**2*np.exp(-((t/d-peak)**2)*0)
    w=(t/d);e=np.where(w<peak,np.sin(np.pi/2*w/peak)**2,np.cos(np.pi/2*(w-peak)/(1-peak))**2)
    y=norm(y*e);return np.stack([y,np.roll(y,int(SR*0.012))],1)
def air(d,f0,fp,f1,peak=0.55,pan=(-0.6,0.6)):
    n=int(SR*d);w=rng.standard_normal(n);W=np.fft.rfft(w);fr=np.fft.rfftfreq(n,1/SR);W[1:]/=np.sqrt(fr[1:]);p=np.fft.irfft(W,n);p/=np.abs(p).max()
    hop=512;win=2048;out_=np.zeros(n+win);hw=np.hanning(win);ff=np.fft.rfftfreq(win,1/SR)
    for i in range(0,n-win,hop):
        u=(i+win/2)/n;fc=np.exp(np.interp(u,[0,peak,1],np.log([f0,fp,f1])));G=np.exp(-0.5*(np.log2(np.maximum(ff,1)/fc)/0.7)**2)
        out_[i:i+win]+=np.fft.irfft(np.fft.rfft(p[i:i+win]*hw)*G,win)*hw
    y=out_[:n];t=np.arange(n)/n;e=np.where(t<peak,np.sin(np.pi/2*t/peak)**2,np.cos(np.pi/2*(t-peak)/(1-peak))**2);y=y*e;y/=np.abs(y).max()
    pn=np.interp(t,[0,1],pan);return np.stack([y*np.sqrt((1-pn)/2),y*np.sqrt((1+pn)/2)],1)*1.4
put(air(2.6,350,1800,700,0.55),4.6,0.32)        # rush to the front of the queue
put(air(4.0,250,1500,500,0.45,(0.4,-0.4)),81.0,0.45)       # crane up on the drop
put(whoosh(3.0,300,1400,0.5),44.9,0.14)        # dive to the chase cam
def squeak(d=0.42,f=2300,g=1):
    n=int(SR*d);t=np.arange(n)/SR;ph=2*np.pi*np.cumsum(f*(1+0.012*np.sin(2*np.pi*31*t))-300*t/d)/SR;y=(np.sin(ph)+0.3*np.sin(2*ph))*np.minimum(1,t/0.03)*np.exp(-t/0.18);return bp(y,900,7000)*g
put(squeak(),32.62,0.22,-0.2)
# freeze: downward tape-stop + soft thump; release: rising swell
def tapestop(d=0.7):
    n=int(SR*d);t=np.arange(n)/SR;f=900*(1-t/d)**2+40;ph=2*np.pi*np.cumsum(f)/SR;y=(np.sin(ph)*0.6+bp(rng.standard_normal(n),200,3000)*0.4*(1-t/d))*np.exp(-t/0.5)
    th=np.sin(2*np.pi*55*t)*np.exp(-t/0.12);return norm(y*0.7+th*0.8)
put(tapestop(),32.9,0.65)
rv=whoosh(0.8,300,3000,0.92);put(rv,35.4,0.4)
# chain reaction: one soft pop per car that stops, getting a little brighter each time
for k,t0 in enumerate([38.8,39.05,39.35,39.65,39.95,40.2,40.5,40.8,41.05,41.35,41.6,41.9,42.15,42.4,42.7,42.95,43.2,43.75,44,44.05,44.2]):
    n=int(SR*0.12);t=np.arange(n)/SR;f=520*2**(k/24);y=(np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*2*f*t)*np.exp(-t/0.02))*np.exp(-t/0.035)*np.minimum(1,t/0.002)
    put(norm(y),t0,0.30+0.008*k,np.sin(k*1.7)*0.4)
# fast-forward chirps
def chirp(d,f0,f1):
    n=int(SR*d);t=np.arange(n)/SR;f=f0*(f1/f0)**(t/d);ph=2*np.pi*np.cumsum(f)/SR;y=(np.sin(ph)+0.25*np.sin(3*ph))*np.sin(np.pi*t/d)**2;return bp(y,150,8000)
put(chirp(0.45,300,1400),49.05,0.3);put(chirp(0.45,1400,300),52.3,0.3)
mx=np.abs(out).max();print('sfx peak',mx)
import soundfile as sf;sf.write('sfx3.wav',out.astype(np.float32),SR,subtype='FLOAT')
