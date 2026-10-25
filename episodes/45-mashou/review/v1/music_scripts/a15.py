import numpy as np, librosa, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from scipy.signal import butter, sosfiltfilt
from common import *
x=load_bed(); mono=x.mean(1)
hop=480
seg=mono[:int(17.6*SR)]
C=librosa.util.normalize(librosa.feature.chroma_cqt(y=seg,sr=SR,hop_length=hop),axis=0)
k=12; nov=np.zeros(C.shape[1])
for i in range(k,C.shape[1]-k):
    a=C[:,i-k:i].mean(1); b=C[:,i:i+k].mean(1); nov[i]=1-a@b/(np.linalg.norm(a)*np.linalg.norm(b)+1e-9)
pk=librosa.util.peak_pick(nov,pre_max=15,post_max=15,pre_avg=15,post_avg=15,delta=0.03,wait=25)
print('cold-open chord changes:',[round(p*hop/SR,2) for p in pk])
print('cold-open picture cuts: 3.40 5.67 7.93 10.20 12.47 14.73 ; downbeats:',[round(0.5688+2.26421*n,3) for n in range(8)])
# break/re-entry plot
fig,ax=plt.subplots(2,1,figsize=(14,7))
for r,(a,b,ttl,marks) in enumerate([(54.5,60.0,'D2 hammer: 1-beat break 56.609 -> re-entry HIT 57.175 (picture gavel moves 56.40-56.53)',[55.476,56.43,56.609,57.175]),(78.5,81.0,'D9 6910: text appears 79.27; valley 808 boom 79.815',[79.25,79.27,79.815])]):
    s=mono[int(a*SR):int(b*SR)]; h=int(0.01*SR)
    e=[10*np.log10((s[i:i+h]**2).mean()+1e-14) for i in range(0,len(s)-h,h)]
    lo=sosfiltfilt(butter(4,120,'lp',fs=SR,output='sos'),s); el=[10*np.log10((lo[i:i+h]**2).mean()+1e-14) for i in range(0,len(s)-h,h)]
    tt=a+np.arange(len(e))*0.01; ax[r].plot(tt,e,label='full'); ax[r].plot(tt,el,label='<120 Hz')
    for m_ in marks: ax[r].axvline(m_,c='r',ls='--')
    ax[r].set_title(ttl); ax[r].legend(); ax[r].set_ylim(-70,-5)
plt.tight_layout(); plt.savefig('/home/claude/video/episodes/45-mashou/review/v1/music_hammer_sync.png',dpi=65)
s=mono[int(56.3*SR):int(57.4*SR)]; h=int(0.02*SR)
print('56.3-57.4 20ms RMS:',' '.join('%.2f:%.0f'%(56.3+i*0.02,10*np.log10((s[i*h:(i+1)*h]**2).mean()+1e-14)) for i in range(len(s)//h)))
