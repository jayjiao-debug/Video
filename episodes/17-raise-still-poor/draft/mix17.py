import numpy as np,soundfile as sf,sys
from scipy.ndimage import minimum_filter1d,uniform_filter1d
s,sr=sf.read('s130f.wav',dtype='float64');x,_=sf.read(sys.argv[1],dtype='float64');n=len(s);x=np.pad(x,((0,max(0,n-len(x))),(0,0)))[:n]
lim=10**(-0.3/20);m=s+x;g=np.ones(n)
for c in range(2):
    k=np.where((np.abs(m[:,c])>lim)&(x[:,c]!=0))[0];g[k]=np.minimum(g[k],np.clip((np.sign(m[k,c])*lim-s[k,c])/x[k,c],0,1))
g=minimum_filter1d(g,441);g=np.minimum(g,uniform_filter1d(g,441));sf.write(sys.argv[2],s+x*g[:,None],sr,subtype='PCM_24');print(sys.argv[2])
