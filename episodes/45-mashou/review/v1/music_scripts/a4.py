import numpy as np, librosa, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from common import *
x=load_bed(); song=load_song(); mono=x.mean(1)
# joins: (film join time, song time of outgoing side at join, song time of incoming side at join)
J=[]
for k in range(1,len(SEG)):
    fs,a,b=SEG[k]; pfs,pa,pb=SEG[k-1]
    xf={1:.010,2:.010,3:.010,4:.010,5:.010,6:.040,7:.015,8:.010}[k]
    jt=fs+xf
    out_song = (pa + (jt-pfs)) if pa is not None else None
    in_song = (a + xf) if a is not None else None
    J.append((jt,out_song,in_song,xf))
def rms_db(sig,t,w=0.02):
    i=int(t*SR); h=int(w*SR/2); s=sig[max(0,i-h):i+h]; return 10*np.log10((s**2).mean()+1e-12)
def mel(sig,t0,t1):
    s=sig[int(t0*SR):int(t1*SR)]
    M=librosa.feature.melspectrogram(y=s,sr=SR,n_fft=2048,hop_length=512,n_mels=40); return 10*np.log10(M.mean(1)+1e-10)
sm=song.mean(1)
fig,axs=plt.subplots(len(J),2,figsize=(20,3*len(J)))
for r,(jt,os_,is_,xf) in enumerate(J):
    # 10ms rms trace +-0.3s
    tt=np.arange(-0.3,0.3,0.005)
    bed=[rms_db(mono,jt+d,0.01) for d in tt]
    line='join %.3f (xf %d ms): '%(jt,xf*1000)
    # level 50ms before vs after
    pre=rms_db(mono,jt-0.03,0.05); post=rms_db(mono,jt+0.03,0.05)
    line+='RMS 50ms pre %.1f post %.1f (%+.1f dB)'%(pre,post,post-pre)
    if os_ is not None and os_<len(sm)/SR-0.1:
        # natural: song continuing past outgoing point
        npre=rms_db(sm,os_-0.03,0.05); npost=rms_db(sm,os_+0.03,0.05); line+=' | song-natural at out %+.1f'%(npost-npre)
    if is_ is not None:
        ipre=rms_db(sm,is_-0.03,0.05); ipost=rms_db(sm,is_+0.03,0.05); line+=' | song-natural at in %+.1f'%(ipost-ipre)
    # spectral: 250ms windows
    if True:
        a=mel(mono,jt-0.25,jt-0.01); b=mel(mono,jt+0.01,jt+0.25); d=np.abs(a-b).mean()
        line+=' | mel dist pre/post %.1f dB'%d
        if os_ is not None and is_ is not None:
            c=mel(sm,os_+0.01,os_+0.25); line+=' (vs. what song would play next %.1f)'%(np.abs(c-b).mean())
    # click: max abs sample diff in +-3ms vs local
    i=int(jt*SR); seg=x[i-int(0.003*SR):i+int(0.003*SR)]; d1=np.abs(np.diff(seg,axis=0)).max()
    loc=np.abs(np.diff(x[i-int(0.2*SR):i-int(0.01*SR)],axis=0)); line+=' | max dsample %.4f vs local p99.9 %.4f'%(d1,np.percentile(loc,99.9))
    print(line)
    axs[r,0].plot(tt*1000,bed); axs[r,0].axvline(0,c='r'); axs[r,0].set_title('join %.3f  10ms RMS dB'%jt); axs[r,0].set_ylim(-70,0)
    s=mono[int((jt-1)*SR):int((jt+1)*SR)]
    D=librosa.amplitude_to_db(np.abs(librosa.stft(s,n_fft=2048,hop_length=256)),ref=np.max)
    axs[r,1].imshow(D[:400],origin='lower',aspect='auto',extent=[-1,1,0,400*SR/2048],vmin=-80,cmap='magma'); axs[r,1].axvline(0,c='c',lw=.5); axs[r,1].set_ylim(0,8000)
plt.tight_layout(); plt.savefig('/home/claude/video/episodes/45-mashou/review/v1/music_joins.png',dpi=55)
