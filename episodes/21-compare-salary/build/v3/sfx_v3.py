# ep21 v3 sound design: three sound types only, tuned to F# (the track's key).
#  1) "ignite": a soft warm swell (filtered noise + F# fifth) when something heats up (roommate's phone, title, grape, door, your phone flaring)
#  2) "haze whoosh": an airy rising band of noise into each heat-haze transition
#  3) "frost": the one impact, on the big drop: low thump + crystalline crackle spreading over ~1 s
import numpy as np, soundfile as sf
SR=44100;DUR=129.97;rng=np.random.default_rng(21)
B=lambda n:0.383+2.0248*n
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def env(n,a,r):
    t=np.arange(n)/SR;return np.minimum(1,t/a)*np.exp(-np.maximum(0,t-a)/r)
def ignite(dur=.9,g=1.0):
    n=int(SR*dur);t=np.arange(n)/SR
    noise=bp(rng.standard_normal(n),300,2500)*.25
    tone=sum(a*np.sin(2*np.pi*f*t) for f,a in ((185.0,.5),(277.2,.35),(370.0,.25)))  # F#3, C#4, F#4
    e=np.sin(np.pi*np.clip(t/dur,0,1))**1.5
    return (noise+tone*.6)*e*g
def whoosh(dur=.75,g=1.0):
    n=int(SR*dur);t=np.arange(n)/SR;x=rng.standard_normal(n);out=np.zeros(n)
    for k in range(6):  # moving band, rising
        lo=400+k*250;seg=bp(x,lo*(1+0*k),lo*2.2);w=np.exp(-((t/dur-(.25+k*.12))/.18)**2);out+=seg*w
    e=(t/dur)**2*np.exp(-np.maximum(0,t/dur-.85)*12)
    return out*e*.35*g
def frost(g=1.0):
    n=int(SR*1.6);t=np.arange(n)/SR
    thump=np.sin(2*np.pi*(46*t+30*np.exp(-t*18)/18*0))*np.exp(-t/.22)*np.minimum(1,t/.004)
    thump+=.5*np.sin(2*np.pi*92.5*t)*np.exp(-t/.12)  # F#2
    cr=np.zeros(n)
    for i in range(140):  # crackles spreading out over ~1 s
        tt=abs(rng.normal(.0,.45));i0=int(min(tt,1.4)*SR);L=int(SR*.012);
        if i0+L>=n:continue
        c=bp(rng.standard_normal(L),2500,9000)*np.exp(-np.arange(L)/SR/.003)*(1-min(tt,1.2)/1.4)
        cr[i0:i0+L]+=c*(.5+rng.random()*.5)
    shimmer=bp(rng.standard_normal(n),6000,12000)*np.exp(-t/.5)*.15
    return (thump*.9+cr*.5+shimmer)*g
o=np.zeros((int(SR*DUR),2))
def put(x,t,pan=0.,g=1.):
    i=int(t*SR);x=x[:max(0,len(o)-i)];o[i:i+len(x),0]+=x*g*(1-max(0,pan));o[i:i+len(x),1]+=x*g*(1+min(0,pan))
db=lambda d:10**(d/20)
# ignite events (the swell peaks ~0.3 s after the downbeat it belongs to)
for t,pan,d in [(B(4)-.15,.35,-10),(B(8)-.25,0,-7),(B(16)-.15,.3,-11),(B(42)-.15,.4,-11),(B(58)-.2,0,-8)]:
    put(ignite(),t,pan,db(d))
# haze whooshes into each transition (end on the cut)
for tc in [B(10),B(24),B(36),B(48),B(52)]:
    w=whoosh();put(w,tc-len(w)/SR+.05,0,db(-6))
# the drop
put(frost(),B(40),0,db(-6))
pk=np.abs(o).max();print('peak dBFS',20*np.log10(pk))
sf.write('sfx_v3.wav',o.astype(np.float32),SR,subtype='FLOAT')
