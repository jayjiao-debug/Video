import numpy as np,soundfile as sf
from scipy.ndimage import minimum_filter1d,uniform_filter1d
s,sr=sf.read('s130f.wav',dtype='float64');x,sr2=sf.read('sfx3_44.wav',dtype='float64');assert sr==sr2==44100
n=len(s);x=np.pad(x,((0,max(0,n-len(x))),(0,0)))[:n]*0.6
def rms(a):return 20*np.log10(np.sqrt((a**2).mean())+1e-12)
for a,b in [(0,3),(3.4,7),(32.8,34),(38,44),(49,53),(81,85)]:
    i,j=int(a*sr),int(b*sr);print(a,b,'song',round(rms(s[i:j]),1),'sfx',round(rms(x[i:j]),1))
lim=10**(-0.3/20);m=s+x;g=np.ones(n)
for c in range(2):
    k=np.where((np.abs(m[:,c])>lim)&(x[:,c]!=0))[0]
    need=np.clip((np.sign(m[k,c])*lim-s[k,c])/x[k,c],0,1);g[k]=np.minimum(g[k],need)
g=minimum_filter1d(g,441);g=np.minimum(g,uniform_filter1d(g,441))
m=s+x*g[:,None];print('ducked',(g<1).sum(),'peak',20*np.log10(np.abs(m).max()),'song peak',20*np.log10(np.abs(s).max()))
sf.write('mix3.wav',m,sr,subtype='PCM_24')
