"""《第n维长什么样》 script v3 (owner: ~2 min; 1–3D only as quick transitions; dive into 4D, 5D, 6D, nD).
Music: the Slowed track cut in whole half-phrases (16 beats ≈ 8.14 s): drop the main section's second half (orig ≈32.4–48.6)
and three half-phrases of the peak (orig ≈114.3–138.7) → about 2:04. Windows below are FILM time after the cut:
  0–16.1 intro · 16.1 first hit (title) · 19.6–32.4 main · 32.4–48.6 quiet break · 48.6–65.2 build · 65.2 DROP (orig 81.37) ·
  65.2–98.1 peak · 98.1–109.4 peak (orig 138.7–150) · 109.4 coda (orig 149.9) · end card ≈ 117.5–123.9."""
import re
CPS = 7.0
n = lambda s: len(re.sub(r'[\[\]{}「」，。：？、“”…—\s！"《》%·]', '', s))
need = lambda s: max(1.6, 0.4 + n(s) / CPS + 0.5)
S = [
 ('HOOK 0–15.6 · 1D→2D→3D as fast transitions', None),
 (0.5, '一只蚂蚁活在一条线上：一维'), (None, '把线往旁边一拖，成了面：二维'), (None, '把面往上一拖，成了立方体：三维'),
 (None, '那再往一个新方向拖一下呢？'),
 ('limit', 15.6), ('TITLE 16.1 · 《第n维长什么样》', None),
 ('4D 19.6–32.4', None),
 (19.6, '这个方向，和长宽高都垂直'), (None, '拖出来的，就是四维[超立方体]'), (None, '我们只能看到它在三维里的影子'),
 (None, '它没在变形，是在四维里转身'),
 ('limit', 32.3),
 ('BREAK 32.4–48.6 · a 4D being in our world', None),
 (32.6, '四维生物路过我们，就像球穿过一张纸'), (None, '我们只看到一个球：凭空出现，变大，消失'), (None, '它能看见你体内的每个器官'),
 (None, '绳结在四维里，会自己散开'), (None, '左手手套翻一下，就成了右手'),
 ('limit', 48.5),
 ('BUILD 48.6–65.2 · 5D, 6D, 10D', None),
 (48.8, '再拖一下，五维：32个顶点'), (None, '六维：64个，每多一维翻一倍'), (None, '十维立方体，有1024个顶点'),
 (None, '画出来，已经像一朵曼陀罗'), (None, '那n维，到底长什么样？'),
 ('limit', 65.1),
 ('DROP 65.2 · nD is weird', None),
 (65.25, '画不出来，但能[算]出来'), (None, '球的体积，在五维最大'), (None, '再往上，维度越高，体积越小，趋近于零'),
 (None, '高维的橙子，几乎全是皮'), (None, '一百维的方块，对角线是边长的10倍'), (None, '它的角，像刺一样往外伸'),
 (None, '到了十维，盒子中间的球会戳出盒子'), (None, '随便画两条线，几乎都互相垂直'),
 (None, '而在八维和二十四维，球能堆得最紧'), (None, '2016年被证明，证明者拿了菲尔兹奖'),
 ('limit', 98.0),
 ('REAL WORLD 98.1–109.4', None),
 (98.1, '这不只是数学游戏'), (None, 'AI 理解一个词，用的是几千维的空间'), (None, '意思越近的词，在高维里离得越近'),
 ('limit', 109.3),
 ('CODA 109.4', None),
 (109.5, '蚂蚁看不见第二维'), (None, '我们看不见第四维'), (None, '但我们算得出，第n维'),
 ('limit', 117.4), ('END CARD ≈117.5–123.9 · 你觉得第几维最难想象？评论区说说', None),
]
t = 0
for a, s in S:
    if a == 'limit': print(f'    -- limit {s}: ends {t - 0.12:.2f}  slack {s - (t - 0.12):+.2f}'); continue
    if isinstance(a, str): print('\n' + a); continue
    st = a if a is not None else t
    if st < t - 0.01: print(f'    OVERLAP {t - st:.2f}')
    d = need(s); print(f'  {st:6.2f}-{st + d:6.2f} {d:4.1f}s {n(s):2d}  {s}'); t = st + d + 0.12
