"""《第四维度》 script v1 on the owner's Slowed track (164.5 s). Anchors: 16.104 first hit (title), 48 break, 64 build, 81.37 drop,
149.89 coda. Reading: 0.5 + n/6.3 + 0.6 s per line."""
import re
CPS = 6.3
n = lambda s: len(re.sub(r'[\[\]{}「」，。：？、“”…—\s！"《》%·]', '', s))
need = lambda s: max(1.9, 0.5 + n(s) / CPS + 0.6)
S = [
 ('HOOK 0–15.6 · intro: one glowing line in the dark, an ant on it', None),
 (0.6, '一只蚂蚁，住在一条线上'), (None, '它只能往前，或者往后'), (None, '前面有另一只蚂蚁，它一辈子也过不去'),
 (None, '除非，世界多出一个方向'),
 ('limit', 15.6),
 ('TITLE 16.104 · the line widens into a plane on the hit: 《第四维度》', None),
 ('A 20.6–48 · Flatland', None),
 (20.6, '1884年，一位英国校长写了本小说'), (None, '《平面国》，里面住着一群二维图形'), (None, '在它们眼里，同伴只是一条线段'),
 (None, '一个正方形的房子，四面都是墙'), (None, '可从上面看，屋里的一切一览无余'), (None, '我们能把东西直接拿出来，不碰一面墙'),
 (None, '对它们来说，这就是[魔法]'),
 ('limit', 48.0),
 ('B 48–64 · break, quiet: the sphere passes through Flatland', None),
 (48.4, '有一天，一个球穿过了平面国'), (None, '正方形只看见一条线，变长，又变短'), (None, '然后凭空消失'),
 (None, '它看不见球，只看见球的切片'), (None, '那我们呢？'),
 ('limit', 63.9),
 ('C 64–81.37 · build: drag a point, a line, a square, a cube', None),
 (64.4, '一个点，往旁边拖，成了线'), (None, '线往旁边拖，成了正方形'), (None, '正方形往上拖，成了立方体'),
 (None, '立方体，往一个我们指不出的方向拖'),
 ('limit', 81.2),
 ('D 81.37 · DROP: the tesseract unfolds out of the cube', None),
 (81.4, '就是[超立方体]'), (None, '16个顶点，32条棱，8个立方体当它的面'), (None, '我们看到的，只是它在三维里的影子'),
 (None, '1888年，辛顿给它起了名字：tesseract'),
 ('E ~96–150 · peak: what a 4D being could do; second layer', None),
 (None, '如果一个四维生物路过我们的世界'), (None, '我们会看到一个球凭空出现，变大，变小，消失'), (None, '它能看见你身体里的每一个器官'),
 (None, '能从锁着的保险柜里，直接拿走东西'), (None, '能把左手手套，翻成右手的'), (None, '在四维里，任何绳结都能解开，不用剪'),
 (None, '1954年，达利把超立方体展开，画成了十字架'), (None, '相对论把时间叫第四维，这里说的，是第四个空间方向'),
 (None, '有些物理理论认为，宇宙不止三个空间维度'), (None, '多出来的维度可能卷得极小，小到看不见'),
 ('limit', 149.6),
 ('F 149.89 · coda: back to the ant on its line; pull back through every dimension', None),
 (149.9, '蚂蚁不知道，自己住在一条线上'), (None, '我们，又住在什么上面？'),
 ('limit', 157.5),
 ('END CARD 157.8–164.5: 如果能多一个方向，你最想去哪？评论区说说', None),
]
t = 0
for r in S:
    a, s = r
    if isinstance(a, str) and a == 'limit': print(f'    -- limit {s}: ends {t - 0.12:.2f}  slack {s - (t - 0.12):+.2f}'); continue
    if isinstance(a, str): print('\n' + a); continue
    st = a if a is not None else t
    if st < t - 0.01: print(f'    OVERLAP {t - st:.2f}')
    d = need(s); print(f'  {st:6.2f}-{st + d:6.2f} {d:4.1f}s {n(s):2d}  {s}'); t = st + d + 0.12
