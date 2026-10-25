import numpy as np, librosa, pyloudnorm as pyln
from scipy.signal import butter, sosfilt
from common import *
x=load_bed(); song=load_song(); sm=song.mean(1); mono=x.mean(1)
print('song len %.3f; L/R corr %.4f; song RMS after 252.128: %.1f dB, 251.5-252.1: %.1f'%(len(song)/SR,np.corrcoef(song[:,0],song[:,1])[0,1],10*np.log10((sm[int(252.15*SR):int(252.6*SR)]**2).mean()+1e-12),10*np.log10((sm[int(251.5*SR):int(252.1*SR)]**2).mean())))
# click at 75.287: song's own max dsample around 149.996+0.01
i=int(150.006*SR); print('song own max dsample near 150.006: %.4f ; bed at join: %.4f'%(np.abs(np.diff(song[i-144:i+144],axis=0)).max(),np.abs(np.diff(x[int(75.287*SR)-144:int(75.287*SR)+144],axis=0)).max()))
# coda chord changes via chroma novelty
hop=480; C=librosa.feature.chroma_cqt(y=mono[int(124*SR):int(137*SR)],sr=SR,hop_length=hop); C=librosa.util.normalize(C,axis=0)
k=10; nov=np.array([0]*k+[1-np.dot(C[:,i-k:i].mean(1),C[:,i:i+k].mean(1))/(np.linalg.norm(C[:,i-k:i].mean(1))*np.linalg.norm(C[:,i:i+k].mean(1))+1e-9) for i in range(k,C.shape[1]-k)]+[0]*k)
pk=librosa.util.peak_pick(nov,pre_max=20,post_max=20,pre_avg=20,post_avg=20,delta=0.02,wait=40)
print('coda chord-change peaks:',[round(124+p*hop/SR,2) for p in pk],'vals',[round(float(nov[p]),2) for p in pk])
# phone-sim per bar over film
ph=sosfilt(butter(4,250,'hp',fs=SR,output='sos'),x,axis=0)
m=pyln.Meter(SR)
bars=[0.5688+2.26421*n for n in range(0,9)]
for a,lab in [(14.155,'bar before title'),(16.418,'bar w/ title pickup'),(18.683,'title downbeat bar'),(104.722,'stop bar'),(138.332,'return bar1'),(144.558,'pre-final'),(146.823,'final bar')]:
    s=slice(int(a*SR),int((a+2.264)*SR)); print('%-20s %.2f full %.1f phone %.1f'%(lab,a,m.integrated_loudness(x[s]),m.integrated_loudness(ph[s])))
# bars > 6 dB under body (short-term per bar)
body=m.integrated_loudness(x[int(21*SR):int(105*SR)])
print('body (21-105) %.1f'%body)
grid=[]
fb=film_beats()
for t,k_,s in fb:
    pass
t=0.5688
