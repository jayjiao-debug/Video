"""《第四维度》 script v2: faster, more knowledge (owner: 节奏快，我们可以讲一些相关的知识). Reading 0.4 + n/7 + 0.5 s."""
import re, sys
CPS = 7.0
n = lambda s: len(re.sub(r'[\[\]{}「」，。：？、“”…—\s！"《》%·]', '', s))
need = lambda s: max(1.6, 0.4 + n(s) / CPS + 0.5)
S = [
 ('HOOK 0–15.6', None),
 (0.5, '一只蚂蚁，住在一条线上'), (None, '它只能往前，或者往后'), (None, '前面挡着另一只蚂蚁，它一辈子也过不去'),
 (None, '在它的世界里，这叫[一维]'), (None, '除非，世界多出一个方向'),
 ('limit', 15.6), ('TITLE 16.104', None),
 ('A 20.4–48 · what a dimension is + Flatland', None),
 (19.9, '维度，就是确定位置需要几个数'), (None, '线上一个数，平面两个，空间三个'),
 (None, '1884年，英国校长艾勃特写了《平面国》'), (None, '居民都是二维图形'), (None, '它们看彼此，只能看到一条线段'),
 (None, '二维动物甚至不能有一根贯穿的肠子'), (None, '不然它会裂成两半'),
 (None, '而我们从上面看，它的房子没有秘密'), (None, '能拿走屋里的东西，不碰一面墙'), (None, '对它们来说，这就是[魔法]'),
 ('limit', 48.0),
 ('B 48–64 · break: the sphere slice', None),
 (48.3, '一个球穿过平面国'), (None, '正方形只看见一条线，变长，又变短'), (None, '然后凭空消失'),
 (None, '低维只能看见高维的[切片]'), (None, '那我们呢？'),
 ('limit', 63.9),
 ('C 64–81.37 · build: drag', None),
 (64.3, '一个点，拖一下，成了线'), (None, '线，拖一下，成了正方形'), (None, '正方形，拖一下，成了立方体'),
 (None, '立方体，往一个我们指不出的方向拖'), (None, '这个方向，和长、宽、高都垂直'),
 ('limit', 81.2),
 ('D 81.37 DROP', None),
 (81.4, '就是[超立方体]'), (None, '每多一维，顶点翻一倍：1、2、4、8、16'), (None, '它由8个立方体围成'),
 (None, '我们看到的，只是它在三维里的影子'), (None, '它没在变形，它在四维里转身'),
 (None, '1888年，辛顿给它起了名字：tesseract'),
 ('E peak · if a 4D being came', None),
 (None, '如果四维生物路过我们的世界'), (None, '我们会看到一个球凭空出现，又消失'),
 (None, '它能看见你身体里的每个器官'), (None, '能从锁着的保险柜里，直接拿走东西'), (None, '能把左手手套，翻成右手的'),
 (None, '在四维里，任何绳结都会自己散开'),
 ('E2 · second layer', None),
 (None, '1954年，达利把超立方体展开，画成了十字架'), (None, '我们的视网膜是二维的，大脑拼出三维'),
 (None, '四维生物的"眼睛"，得是三维的'), (None, '高维的橙子，几乎全是皮'),
 (None, '1917年，埃伦费斯特算过'), (None, '空间多于三维，行星轨道就稳定不了'), (None, '也许正因为三维，我们才能存在'),
 (None, '相对论里，时间也叫第四维'), (None, '但今天说的，是第四个空间方向'),
 (None, '弦理论认为，宇宙可能有十维'), (None, '多出来的，卷得极小，小到看不见'),
 ('limit', 149.6),
 ('F coda 149.89', None),
 (149.9, '蚂蚁不知道，自己住在一条线上'), (None, '我们，又住在什么上面？'),
 ('limit', 157.5),
]
t = 0; rows = []
for a, s in S:
    if a == 'limit': print(f'    -- limit {s}: ends {t - 0.12:.2f}  slack {s - (t - 0.12):+.2f}'); continue
    if isinstance(a, str): print('\n' + a); continue
    st = a if a is not None else t
    if st < t - 0.01: print(f'    OVERLAP {t - st:.2f}')
    d = need(s); print(f'  {st:6.2f}-{st + d:6.2f} {d:4.1f}s {n(s):2d}  {s}'); t = st + d + 0.12
