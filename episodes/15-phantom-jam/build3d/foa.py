import json,numpy as np,soundfile as sf
from scipy.signal import butter,sosfilt
rng=np.random.default_rng(7)
D=json.load(open('cars.json'));HZ=D['hz'];OFF=D['OFF'];X=np.array(D['x']);V=np.array(D['v'])
sr=44100;DUR=16.58;N=round(DUR*sr);t=np.arange(N)/sr
RAD=230/(2*np.pi);CH=12.0;CARY=0.9
def interp(a):return np.interp(t*HZ,np.arange(len(a)),a)
lo=butter(2,220,fs=sr,output='sos');hi=butter(2,1100,fs=sr,output='sos');bp=butter(2,[1700,2900],btype='band',fs=sr,output='sos')
foa=np.zeros((N,4))
dist=np.hypot(RAD,CH-CARY);el=np.arctan2(CARY-CH,RAD)
for j in range(22):
    x=interp(X[:,j]);v=interp(V[:,j]);a=x/230*2*np.pi+OFF
    px=np.sin(a)*RAD;pz=-np.cos(a)*RAD
    az=np.arctan2(-px,-pz) # ambiX: + to the left, 0 = front (-z)
    b=np.cumsum(rng.standard_normal(N));b-=np.convolve(b,np.ones(4410)/4410,'same');b/=np.abs(b).max()+1e-9
    sp=np.clip(v/11.1,0,1);w=sp
    roar=(1-w)*sosfilt(lo,b)*2.2+w*sosfilt(hi,b)
    s=roar*(0.02+0.12*sp*sp)*1.6
    # brake hiss events
    vv=V[:,j];acc=np.gradient(vv)*HZ;armed=True
    for n in range(len(vv)):
        if armed and acc[n]<-1.6:
            t0=n/HZ;i0=int(t0*sr);L=int(0.8*sr)
            if i0+L<N:
                env=np.minimum(np.arange(L)/(0.05*sr),1)*np.exp(-np.arange(L)/(0.16*sr))
                s[i0:i0+L]+=sosfilt(bp,rng.standard_normal(L))*env*0.9
            armed=False;last=n
        if not armed and acc[n]>-0.5 and n-last>1.5*HZ:armed=True
    s*=0.6 # sfx bus
    ce=np.cos(el)
    foa[:,0]+=s;foa[:,1]+=s*np.sin(az)*ce;foa[:,2]+=s*np.sin(el);foa[:,3]+=s*np.cos(az)*ce
# music: untouched, head-locked, one-bar fade ending on the downbeat
song,_=sf.read('song16.wav',dtype='float32');song=song[:N].astype(np.float64)
f0,f1=14.557,16.58;u=np.clip((t-f0)/(f1-f0),0,1);song*=np.where(t<f0,1,np.cos(u*np.pi/2)**2)[:,None]
lim=10**(-0.3/20)
pk=np.abs(foa).max();
if pk>0.7: foa*=0.7/pk
six=np.concatenate([foa,song],1)
sf.write('spatial6.wav',six.astype(np.float32),sr,subtype='PCM_16')
# stereo fallback for players without spatial audio: front-facing L/R cardioid decode + music
fx=np.stack([0.5*(foa[:,0]+foa[:,1]),0.5*(foa[:,0]-foa[:,1])],1)
from scipy.ndimage import minimum_filter1d,uniform_filter1d
mix=song+fx;need=np.ones(N)
with np.errstate(divide='ignore',invalid='ignore'):
    for c in range(2):
        o=np.abs(mix[:,c])>lim;gg=np.where(o,(np.sign(mix[:,c])*lim-song[:,c])/fx[:,c],1);need=np.minimum(need,np.clip(np.nan_to_num(gg,nan=1),0,1))
need=uniform_filter1d(minimum_filter1d(need,2205),2205);st=song+fx*need[:,None];g=float(need.min())
sf.write('stereo_fb.wav',st.astype(np.float32),sr,subtype='PCM_24')
print('foa peak',round(np.abs(foa).max(),3),'stereo gain',round(g,3),'song peak dB',round(20*np.log10(np.abs(song).max()),2))
# sanity: left/right energy of Y channel over time (positive = left)
for s0 in range(0,16,2):
    seg=slice(s0*sr,(s0+2)*sr);print(s0,'W',round(float(np.sqrt((foa[seg,0]**2).mean())),4),'Y·W corr',round(float((foa[seg,0]*foa[seg,1]).mean()/((foa[seg,0]**2).mean()+1e-12)),2))
