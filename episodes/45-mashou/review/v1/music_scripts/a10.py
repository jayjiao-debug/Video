import numpy as np, json, librosa
from scipy.signal import butter, sosfilt
from common import *
x=load_bed(); mono=x.mean(1)
lo=sosfilt(butter(4,120,'lp',fs=SR,output='sos'),mono)
fb=film_beats()
# bar phase per film beat: song-time based. part1 (song<182.0): downbeat if (k-1)%4==0 ; part2 (song>=182.2 & <=252.2): (k-2)%4==0
def pos(k,s):
    if s>=182.2 and s<=252.2: return (k-2)%4
    return (k-1)%4
# verify with kick energy per position in body sections
acc={0:[],1:[],2:[],3:[]}; acc2={0:[],1:[],2:[],3:[]}
for t,k,s in fb:
    e=10*np.log10((lo[int(t*SR):int((t+0.12)*SR)]**2).mean()+1e-12)
    o=librosa.onset.onset_strength(y=mono[int((t-0.05)*SR):int((t+0.08)*SR)],sr=SR).max()
    if 20.95<t<75 : acc[pos(k,s)].append(o)
    if 116.1<t<125: acc2[pos(k,s)].append(o)
print('part1 onset by pos', {p:round(np.mean(v),2) for p,v in acc.items()})
print('part2 onset by pos', {p:round(np.mean(v),2) for p,v in acc2.items()})
cuts=json.load(open('/home/claude/video/episodes/45-mashou/review/v1/probe.json'))['hard_cuts']
bt=np.array([b[0] for b in fb])
out=[]
for c in cuts:
    i=np.argmin(np.abs(bt-(c-1/60)))  # probe time is frame start; cut frame shows from c
    t,k,s=fb[i]; p=pos(k,s)
    out.append((c,t,round(1000*(c-t)),p))
    print('%.2f nearest beat %.3f off %+4d ms  beat %d of bar%s'%(c,t,1000*(c-t),p+1,'' if p in (0,2) else '   <-- not bar/half-bar'))
json.dump(out,open('cuts.json','w'))
