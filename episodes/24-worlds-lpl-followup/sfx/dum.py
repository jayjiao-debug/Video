# Three "dum" slam designs over the first 17 s of the series track (music untouched; SFX on top).
import numpy as np, soundfile as sf, subprocess
SR=44100;B=lambda n:0.383+2.0248*n;BEAT=0.5062
rng=np.random.default_rng(24)
mus,_=sf.read('../../ep23/film/s130f.wav');L=int(SR*17.6);mus=mus[:L]
def bp(x,lo,hi):
    X=np.fft.rfft(x);f=np.fft.rfftfreq(len(x),1/SR);X[(f<lo)|(f>hi)]=0;return np.fft.irfft(X,len(x))
def env(n,a,d):t=np.arange(n)/SR;return np.minimum(1,t/a)*np.exp(-t/d)
def sweep(n,f0,f1,tau):t=np.arange(n)/SR;f=f1+(f0-f1)*np.exp(-t/tau);return np.sin(2*np.pi*np.cumsum(f)/SR)
def paper(g=1.0):   # the sheet hitting the table: short bright slap
    n=int(SR*.09);return bp(rng.standard_normal(n),900,6500)*env(n,.0008,.012)*.5*g
def thud(g=1.0):    # A: deep felt-mallet thud, tuned near F#1
    n=int(SR*.9);x=sweep(n,140,46.25,.035)*env(n,.002,.22)*1.0+sweep(n,300,92.5,.02)*env(n,.001,.06)*.35
    return (x+np.pad(paper(.8),(0,n-int(SR*.09))))*g
def press(g=1.0):   # B: printing-press stamp: thud + metal clank + ring
    n=int(SR*.9);x=sweep(n,180,55,.025)*env(n,.001,.12)*.9
    cl=bp(rng.standard_normal(n),1800,4200)*env(n,.0005,.02)*.45
    t=np.arange(n)/SR;ring=(np.sin(2*np.pi*1480*t)+.6*np.sin(2*np.pi*2217*t))*env(n,.001,.09)*.07
    return (x+cl+ring+np.pad(paper(.6),(0,n-int(SR*.09))))*g
def boom(g=1.0):    # C: cinematic boom with a short room tail
    n=int(SR*1.6);x=sweep(n,110,40,.06)*env(n,.003,.45)*1.0+sweep(n,400,92.5,.015)*env(n,.001,.05)*.4
    tail=bp(rng.standard_normal(n),80,900)*env(n,.02,.35)*.12
    return (x+tail+np.pad(paper(.7),(0,n-int(SR*.09))))*g
def suck(d):        # reverse whoosh into the big hit
    n=int(SR*d);t=np.arange(n)/SR;x=bp(rng.standard_normal(n),250,5000)*(t/d)**3;return x/np.abs(x).max()*.22
def rumble(d):      # the slow-motion bed under the freeze (sub swell, then fade)
    n=int(SR*d);t=np.arange(n)/SR;e=np.minimum(1,t/.15)*np.exp(-t/1.4)
    return (np.sin(2*np.pi*46.25*t)*.6+bp(rng.standard_normal(n),30,160)*.8)*e*.35
HITS=[0,2,4,5,6,6.5,7,7.5]          # beats from bar 0: accelerating
BIG=B(2)                             # the 0–4 clipping lands on bar 2 → slow-mo until bar 4
for name,f in [('A_闷鼓',thud),('B_印刷机',press),('C_电影重击',boom)]:
    o=np.zeros((L,2))
    def add(x,t,pan=0.):
        i=int(t*SR);j=min(L,i+len(x));o[i:j,0]+=x[:j-i]*(1-max(0,pan));o[i:j,1]+=x[:j-i]*(1+min(0,pan))
    for k,b in enumerate(HITS): add(f(.42+.05*k),B(0)+b*BEAT,pan=(-.35 if k%2 else .35))
    s=suck(.6);add(s,BIG-.6);add(f(1.05),BIG);add(rumble(4.0),BIG)
    add(f(.7),B(8))                  # title lands
    # clip guard on the SFX bus only (same as ep23 mix17): the music is never scaled
    from scipy.ndimage import minimum_filter1d,uniform_filter1d
    o*=.8;lim=10**(-0.3/20);m=mus+o;gg=np.ones(L)
    for c in range(2):
        k=np.where((np.abs(m[:,c])>lim)&(o[:,c]!=0))[0];gg[k]=np.minimum(gg[k],np.clip((np.sign(m[k,c])*lim-mus[k,c])/o[k,c],0,1))
    gg=minimum_filter1d(gg,441);gg=np.minimum(gg,uniform_filter1d(gg,441));mix=mus+o*gg[:,None];pk=round(float(gg.min()),2)
    sf.write(f'{name}.wav',mix.astype(np.float32),SR,subtype='FLOAT')
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{name}.wav','-b:a','192k',f'{name}.mp3']);print(name,round(pk,3))
