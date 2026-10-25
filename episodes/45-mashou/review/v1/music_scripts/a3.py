import numpy as np, pyloudnorm as pyln, librosa, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt, json
from common import *
from scipy.signal import butter, sosfilt
x=load_bed(); n=len(x)
# K-weighted momentary loudness 400ms, hop 100ms
m=pyln.Meter(SR)
# implement K-weighting via pyloudnorm filters
xk=x.copy()
for f in m._filters.values():
    xk=np.stack([f.apply_filter(xk[:,c]) if hasattr(f,'apply_filter') else xk[:,c] for c in range(2)],1)
hop=int(0.1*SR); w=int(0.4*SR)
T=[];Lm=[]
for i in range(0,n-w,hop):
    s=xk[i:i+w]; z=(s**2).mean(0).sum(); T.append((i+w/2)/SR); Lm.append(-0.691+10*np.log10(z+1e-12))
T=np.array(T); Lm=np.array(Lm)
# short-term 3s
w3=int(3*SR); Ls=[]
for i in range(0,n-w3,hop):
    s=xk[i:i+w3]; Ls.append(-0.691+10*np.log10((s**2).mean(0).sum()+1e-12))
Ts=np.arange(len(Ls))*0.1+1.5; Ls=np.array(Ls)
# brightness: spectral centroid, sub energy
mono=x.mean(1)
cen=librosa.feature.spectral_centroid(y=mono,sr=SR,n_fft=4096,hop_length=4800)[0]
S=np.abs(librosa.stft(mono,n_fft=4096,hop_length=4800))**2; fr=librosa.fft_frequencies(sr=SR,n_fft=4096)
sub=10*np.log10(S[fr<80].sum(0)+1e-12); hi=10*np.log10(S[(fr>2000)&(fr<5000)].sum(0)+1e-12); tot=10*np.log10(S.sum(0)+1e-12)
tc=np.arange(len(cen))*0.1
np.savez('curves.npz',T=T,Lm=Lm,Ts=Ts,Ls=Ls,tc=tc,cen=cen,sub=sub-tot,hi=hi-tot)
fig,ax=plt.subplots(3,1,figsize=(22,11),sharex=True)
ax[0].plot(T,Lm,lw=.6,label='momentary 400ms'); ax[0].plot(Ts,Ls,lw=1.5,label='short-term 3s'); ax[0].axhline(-14,c='k',ls=':'); ax[0].set_ylim(-45,-5); ax[0].legend(); ax[0].set_ylabel('LUFS')
ax[1].plot(tc,cen,lw=.7); ax[1].set_ylabel('centroid Hz')
ax[2].plot(tc,sub-tot,lw=.7,label='<80Hz rel'); ax[2].plot(tc,hi-tot,lw=.7,label='2-5k rel'); ax[2].legend()
lines=json.load(open('/home/claude/video/episodes/45-mashou/lines_v3_meta.json'))
LM=[18.115,20.947,63.97,75.29,88.87,105.29,105.98,116.04,125.10,136.09,137.77,146.82]
for a in ax:
    for t in LM: a.axvline(t,c='r',lw=.6,alpha=.6)
    for l in lines: a.axvline(l['a'],c='g',lw=.3,alpha=.4)
for t in LM: ax[0].text(t,-7,str(t),rotation=90,fontsize=7,color='r')
ax[2].set_xticks(np.arange(0,155,5)); ax[2].grid(alpha=.3)
plt.tight_layout(); plt.savefig('/home/claude/video/episodes/45-mashou/review/v1/music_energy.png',dpi=70)
# summary: body loudness, quiet stretches
body=np.median(Ls); print('median short-term',body)
q=Lm<body-6
# runs
runs=[];st=None
for i,v in enumerate(q):
    if v and st is None: st=i
    if not v and st is not None: runs.append((T[st],T[i-1])); st=None
if st is not None: runs.append((T[st],T[-1]))
for a,b in runs:
    if b-a>=1.0: print('quiet >6dB under body: %.1f-%.1f (%.1fs) min %.1f'%(a,b,b-a,Lm[(T>=a)&(T<=b)].min()))
# per section mean
secs=[(0,18.1),(18.1,20.95),(20.95,34.5),(34.5,48.1),(48.1,63.97),(63.97,75.29),(75.29,88.87),(88.87,105.29),(105.29,106.96),(106.96,113.2),(113.2,116.04),(116.04,125.1),(125.1,136.09),(136.09,137.77),(137.77,146.82),(146.82,150.8),(150.8,154.18)]
for a,b in secs:
    i=(T>=a)&(T<b); j=(tc>=a)&(tc<b)
    print('%6.2f-%6.2f  M mean %.1f max %.1f  centroid %.0f  sub %.1f'%(a,b,Lm[i].mean(),Lm[i].max(),cen[j].mean(),(sub-tot)[j].mean()))
