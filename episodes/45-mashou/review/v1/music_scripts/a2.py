import numpy as np, librosa
from common import *
x=load_bed(); m=x.mean(1)
hop=240  # 5 ms
oenv=librosa.onset.onset_strength(y=m,sr=SR,hop_length=hop,n_mels=128,lag=1,max_size=1)
ot=librosa.times_like(oenv,sr=SR,hop_length=hop)
# low-band onset (kick) via spectral flux < 150 Hz
S=np.abs(librosa.stft(m,n_fft=2048,hop_length=hop))
fr=librosa.fft_frequencies(sr=SR,n_fft=2048)
low=S[fr<150].sum(0); lowf=np.maximum(0,np.diff(np.log1p(low*10),prepend=0))
np.save('oenv.npy',oenv); np.save('lowf.npy',lowf)
fb=film_beats()
bt=np.array([b[0] for b in fb])
# grid check: for each beat, find max onset within +-60ms, report offset where onset strong
offs=[]
for t in bt:
    i=(ot>t-0.06)&(ot<t+0.06)
    if i.sum()==0: continue
    j=np.argmax(oenv[i]); val=oenv[i][j]
    if val>np.percentile(oenv,90): offs.append((t, ot[i][j]-t))
offs=np.array(offs)
print('beats with strong onset:',len(offs),'of',len(bt),' median offset ms %.1f, p10 %.1f p90 %.1f'%tuple(1000*np.percentile(offs[:,1],[50,10,90])))
# by segment
for k,(fs,a,b) in enumerate(SEG):
    fe=SEG[k+1][0] if k+1<len(SEG) else 154.18
    s=offs[(offs[:,0]>=fs)&(offs[:,0]<fe)]
    if len(s): print('seg %.2f-%.2f n=%d median %.1f ms'%(fs,fe,len(s),1000*np.median(s[:,1])))
# landmarks: strongest onset within +-150 ms
LM={'title 18.115':18.115,'B sect 20.947':20.947,'stop HIT 105.29':105.29,'drop 116.04':116.04,'coda 125.10':125.10,'dead stop 136.09':136.09,'intro ret 137.77':137.77,'first note 138.32':138.318,'FINAL 146.82':146.82,'D4 63.97':63.97,'D12 88.87':88.87}
for nm,t in LM.items():
    i=(ot>t-0.15)&(ot<t+0.15); j=np.argmax(oenv[i]); 
    jl=np.argmax(lowf[i])
    print('%-18s onset max at %.3f (%+.0f ms) strength %.1f (pct %.0f) | low-band max at %.3f (%+.0f ms)'%(nm,ot[i][j],1000*(ot[i][j]-t),oenv[i][j],100*(oenv<oenv[i][j]).mean(),ot[i][jl],1000*(ot[i][jl]-t)))
