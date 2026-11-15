# Build scripts/su/voice/su_lines.json (lines file, Qin format + screens/en) and /home/user/su_work/voice/voice_timing.json
# (Wanbi format with per-character word times) from the approved voice draft v1 (3:23).
import json, re, subprocess, numpy as np
SRC='/mnt/project-files/next-video/sudongpo/voice/'
L=json.load(open(SRC+'su_lines_v1.json'))['lines']
T=json.load(open(SRC+'su_voice_draft_v1_timeline.json'))
SR=16000
pcm=subprocess.run(['ffmpeg','-v','error','-i',SRC+'su_voice_draft_v1.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True,check=True).stdout
x=np.frombuffer(pcm,dtype=np.float32)
hop=160  # 10 ms
n=len(x)//hop
db=20*np.log10(np.sqrt((x[:n*hop].reshape(n,hop)**2).mean(1))+1e-9)
SCENE='ABCDEFGHI'
WHO={'记':'ji','苏':'su','苏过':'guo','差役':'chai'}
han=lambda s: re.findall(r'[一-鿿]', s)
tl={l['id']:l for l in T['lines']}
beats=T['beats']
def beat_after(t):
    for b in beats:
        if abs(b['at']-t)<0.02 and b.get('what')!='scene opening': return b['len']
    return 0
def opening_before(t):
    for b in beats:
        if b.get('what')=='scene opening' and abs(b['at']+b['len']-t)<0.03: return b['len']
    return 0
cards={c['n']:c for c in T['cards']}
CARD_EN={1:"He wrote to his brother: Huizhou kills one sheep a day, and he buys only the spine.",
 2:"A Song-era note: the poem reached the capital. The chief minister laughed: \"Still this happy?\"",
 3:"His real letter: in Hainan, first make a coffin, then a grave.",
 4:"True. He kept telling his son to keep quiet, for fear northerners would come to share.",
 5:"Two months later, on his way home north, he died in Changzhou."}
CARD_AFTER={'05':1,'26':2,'39':3,'55':4,'57':5}
out=[]; rows=[]
for i,l in enumerate(L,1):
    r=tl[l['id']]; sc=SCENE[l['scene']-1]; lid=sc+l['id']
    e={'n':i,'id':lid,'scene':sc,'who':WHO[l['who']],'tts':l['tts'],'zh':l['zh'],'screens':l['zh_screens'],'en':l['en']}
    p=opening_before(r['start'])
    if p: e['pre']=round(p-0.04,2)   # 0.04 s: the segment's first frame clears the last line's end frame
    a=beat_after(r['end'])
    if a: e['after']=round(a,2)
    if l['id'] in CARD_AFTER:
        c=cards[CARD_AFTER[l['id']]]
        e['card']={'zh':c['zh'],'en':CARD_EN[c['n']]}
        e['card_delay']=round(c['start']-r['end'],2); e['card_hold']=round(c['end']-c['start'],2)
    out.append(e)
    # per-character times: characters advance with voiced time only
    a0,b0=int(r['start']*100),int(r['end']*100)
    seg=db[a0:b0]; thr=max(seg.max()-30, np.percentile(seg,10)+6)
    v=(seg>thr).astype(float)
    # close tiny gaps (<60 ms) so consonant dips don't count as pauses
    cum=np.concatenate([[0],np.cumsum(v)]); tot=cum[-1]
    cs=han(l['zh']); N=len(cs); words=[]
    def t_at(q):  # time where cumulative voiced = q*tot
        k=int(np.searchsorted(cum,q*tot,side='left')); k=min(max(k,0),len(seg))
        return r['start']+k/100
    for k,ch in enumerate(cs):
        s=t_at(k/N) if k else r['start']; en=t_at((k+1)/N) if k<N-1 else r['end']
        # a character starts at the first voiced frame at/after its share
        words.append([ch,round(s,3),round(max(s+0.01,en),3)])
    for k in range(1,N):
        if words[k][1]<words[k-1][2]: words[k][1]=words[k-1][2]
        if words[k][2]<=words[k][1]: words[k][2]=round(words[k][1]+0.01,3)
    words[-1][2]=min(words[-1][2],r['end'])
    rows.append({'line':i,'id':lid,'who':e['who'],'text':l['zh'],'start':r['start'],'end':r['end'],'words':words})
lines={'film':'su','speakers':{'ji':'记者','su':'苏东坡','guo':'苏过','chai':'差役'},
 'scenes':{'A':{'time':'清晨 · 惠州集市'},'B':{'time':'上午 · 白鹤峰新居'},'C':{'time':'中午 · 荔枝树下'},'D':{'time':'下午 · 新居门口'},
  'E':{'time':'傍晚 · 新居里'},'F':{'time':'夜 · 西湖边的松林'},'G':{'time':'黎明 · 江边'},'H':{'time':'两年后 · 儋州'},'I':{'time':'四年后 · 金山寺'}},
 'source':'voice draft v1 (3:23), approved by Jay', 'lines':out}
json.dump(lines,open(__import__('os').path.join(__import__('os').path.dirname(__file__),'su_lines.json'),'w'),ensure_ascii=False,indent=1)
total=int(np.floor(T['total']*30+0.5))
json.dump({'voice':'draft v1','speech_end':T['lines'][-1]['end'],'frames':total,'lines':rows},open('/home/user/su_work/voice/voice_timing.json','w'),ensure_ascii=False,indent=1)
print('lines',len(out),'frames',total, 'pre:',{e['id']:e['pre'] for e in out if 'pre' in e})
print('after:',{e['id']:e['after'] for e in out if 'after' in e})
print('cards:',[(e['id'],e['card_delay'],e['card_hold']) for e in out if 'card' in e])
# sanity: screen split times
for rr,e in zip(rows,out):
    if len(e['screens'])>1:
        k=len(han(e['screens'][0])); print(e['id'], e['screens'][0], '->', rr['words'][k][1], 'of', rr['start'], rr['end'])
