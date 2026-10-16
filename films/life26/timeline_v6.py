"""《生命平等吗？》 v6: lines on the ORIGINAL track (Cry For Me, 0–3:07 with a fade), paired to its 8-bar phrases.
Phrase starts (32 beats, 20.81 s, beat 0.6502, first beat 0.743): 1.4 22.2 43.0 63.8 84.6 105.4 126.2 147.0 167.8 188.6"""
import re,sys
need=lambda s: max(1.9,0.5+len(re.sub(r'[\[\]{}「」，。：？、“”…—\s！"《》%]','',s))/7+0.6)
PH=[1.39+20.81*i for i in range(10)]
# (start, text)  start=None -> right after previous line ends (+0.12)
S=[
('P1 前奏 · 冷开场',None),
(0.6,'路边一只猫被车撞了'),(None,'很多人会难过一整天'),(None,'2018年，肯尼亚'),
(None,'世界上最后一只雄性北方白犀牛死了'),(None,'它叫苏丹，45岁'),(None,'全世界都为它难过'),
(17.0,'一只苍蝇落在窗台上'),(19.6,'一巴掌，没人会多看一眼'),
('P2 22.2',None),
(22.4,'苍蝇、猫、犀牛'),(None,'都是一条命'),(27.0,'为什么心疼的程度，差这么多'),
('片名 32.07 《生命平等吗？》',None),
(36.9,'法国研究者问了三千多人'),(None,'52种生物，只能救一个，你救谁'),
('P3 43.0',None),
(43.1,'答案排成了一条线'),(None,'和人类越近，越被同情'),(None,'我们心里有一把尺子'),(None,'刻度是：[像不像我们]'),
(None,'两千多年前，庄子和惠子在桥上看鱼'),(None,'庄子说：鱼真快乐'),(None,'惠子问：{你不是鱼}，怎么知道鱼快乐'),
('P4 63.8 满编',None),
(63.9,'1974年，内格尔问'),(None,'做一只蝙蝠，是什么感觉'),(None,'我们永远进不到另一个生命里面'),(None,'只能用"像不像我"，去猜它疼不疼'),(None,'所以猫让人心疼，苍蝇不会'),
(78.6,'那么，这条线该画在哪里'),
('P5 84.6 (82–84 音乐停一下)',None),
(84.6,'康德说：画在[理性]'),(None,'只有会思考的人，才是目的本身'),(None,'对动物，我们没有直接的义务'),(None,'可他也说：虐待动物的人'),(None,'对人，也会变得冷酷'),
(None,'边沁说：画在[痛苦]'),(None,'问题不是它们能不能思考，能不能说话'),(None,'而是：它们会不会痛苦'),
('P6 105.4',None),
(None,'1975年，辛格在《动物解放》里说'),(None,'同样的痛苦，就该被同样地在乎'),(None,'一只鸡的痛，和一只狗的痛，一样重'),(None,'只因为不是人，就不算数'),(None,'这叫作{物种歧视}'),(None,'就像种族歧视、性别歧视一样'),
(None,'史怀哲说：画在[生命本身]'),
('P7 126.2 (稍微收一点)',None),
(126.3,'一百多年前，非洲河上，船穿过一群河马'),(None,'他想到四个字：敬畏生命'),(None,'我是想活下去的生命'),(None,'活在同样想活下去的生命之中'),
(None,'他拒绝给生命排高低'),(None,'活着，免不了伤害'),(None,'但不该{毫无必要}'),
('P8 147.0',None),
(147.1,'1869年，莱基写道'),(None,'人的善意，最先只给家人'),(None,'后来是阶层、国家、全人类'),(None,'最后，才轮到动物'),
(None,'所以，生命平等吗'),(None,'在我们的感觉里，从来不平等'),(None,'但这个圈，一直在变大'),
('P9 167.8',None),
(167.9,'苏丹让全世界难过'),(None,'不是因为它比苍蝇更值钱'),(None,'是因为我们[看见了它]'),
(None,'庄子说'),(None,'天地与我并生，而[万物与我为一]'),
]
t=0;rows=[]
for a,s in S:
    if s is None: rows.append(('#',a)); continue
    st=a if a is not None else t
    if st < t-0.01: print('OVERLAP',st,t,s,file=sys.stderr)
    n=need(s); rows.append((st,st+n,s)); t=st+n+0.12
for r in rows:
    if r[0]=='#': print('\n——',r[1]); continue
    a,z,s=r; m,sec=divmod(a,60); print('%d:%05.2f  (%.1fs)  %s'%(m,sec,z-a,s))
print('\nlast line ends', round(t,2))
import json; json.dump([r for r in rows if r[0]!='#'],open('lines_v6.json','w'),ensure_ascii=False)
