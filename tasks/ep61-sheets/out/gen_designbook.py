import re, sys
R='/home/runner/work/Video/Video/episodes/37-qiqing/remotion/src/'
src=open(R+'qq61/chars61.tsx').read()
geo=open(R+'qq60/geo60.ts').read()
PAL=dict(re.findall(r"(\w+): '(#[0-9A-Fa-f]{6})'",geo))
def hexof(k): return PAL.get(k,k).upper()
# split chars
start=src.index('export const CHARS')
body=src[start:]
blocks=re.split(r"\n\t/\* \d+ [^*]*\*/\n",body)[1:]
chars=[]
for b in blocks:
    d={}
    d['n']=int(re.search(r"\{n: (\d+)",b).group(1)); d['key']=re.search(r"key: '(\w+)'",b).group(1)
    for f in ['zh','role','sub','en','height','joints']:
        m=re.search(r"\b%s: (?:'([^']*)'|\"([^\"]*)\")"%f,b); d[f]=m.group(1) or m.group(2)
    pal=re.search(r"pal: \[(.*?)\],\n\t\tmust",b,re.S).group(1)
    d['pal']=re.findall(r"\['([^']+)', '([^']+)'\]",pal)
    must=re.search(r"must: \[(.*?)\], dont|must: \[(.*?)\],\n\t\tdont",b,re.S); mt=(must.group(1) or must.group(2))
    d['must']=re.findall(r"'([^']*)'",mt)
    dont=re.search(r"dont: \[(.*?)\],\n\t\theight",b,re.S).group(1)
    d['dont']=re.findall(r"'([^']*)'",dont)
    d['notes']=re.findall(r"C\('([^']*)', '([^']*)', '([^']*)'",b)
    poses=re.search(r"poses: \[(.*?)\],\n\t\tstress",b,re.S).group(1)
    d['poses']=re.findall(r"\{label: '([^']*)'",poses)
    stress=re.search(r"stress: \[(.*?)\],\n\t\tfaces",b,re.S)
    d['stress']=re.findall(r"\{label: '([^']*)'",stress.group(1)) if stress else []
    chars.append(d)
H={'atum':23.0,'ra':21.7,'shu':22.2,'tefnut':21.7,'geb':19.9,'nut':21.4,'osiris':24.2,'isis':21.9,'set':21.4,'nephthys':21.6,'horus':23.0,'anubis':21.5,'thoth':21.8,'sekhmet':21.7,'bastet':21.0,'maat':22.2,'ani':20.1}
ANI=20.1
ICON={
'atum':("**阿图姆**（I1）：人形、有须；戴 pschent（红白双冠）；站姿，羽毛胸甲、短裙、兽尾、卷曲假胡须；手持 ankh 与 was（记录里两者都列在 Atum 条下）。**拉 / 拉-荷拉赫提**（I2）：隼首，头顶红日轮 + 圣蛇；一手 ankh、一手长杖（Met 22.3.31 看到）；肤色并不统一（22.3.31：橙红身体、绿松石领与裙、黄色围布、深色隼头金眼；22.3.34：金黄身体、红色披肩领、隼头深色白脸）。**没有逐像上色的 Atum**（Louvre 只给整块碑的颜色），所以他的肤色是本系列的设计选择（与 ep60 男神同为赤陶红）。",
 "I1 · Louvre E 52（Stele of Taperet，也编 N 3663）；I2 · Met 22.3.31（Stela of Saiah）、Met 22.3.34（Djedbastet 拜 Re-Harakhty-Atum）"),
'shu':("人形（Ranke：“Always human”）；头顶一根鸵鸟羽毛 = 他名字的象形字（“常见”，并非所有物件都有；Met 04.2.372 的 Shu 护身符据搜索摘要是日轮，**未打开核实**）；标志姿势是双臂高举托住努特（Louvre N 3293：“Shu debout, bras levés” 在 “Nout penchée” 之下；BM Greenfield：双手托举）。没有已核实的上色 Shu → 肤色为设计选择。",
 "I3 · H. Ranke, Penn Museum Bulletin XV 2–3 (1950) pp.17–20；Louvre N 3293（Imenemsaouf 神话纸草）；BM Greenfield 纸草"),
'tefnut':("狮首的站立女神，头顶日轮 + 圣蛇（Louvre 编目：“Tefnout: déesse à tête de lionne, debout, disque solaire à uraeus”）；另有人头鸟形（Louvre N 381）作备选。注意：狮首 + 日轮 + 圣蛇与塞赫迈特是同一副样子，Louvre 编目员靠名字区分。没有逐像上色 → 肤色/裙色是设计选择，手里的 ankh + was 也是（记录“无”）。",
 "I4 · Louvre N 2699（Stele of Ousirour，第 2 栏左）；Louvre N 381（naos）"),
'geb':("人形男性。**我没有找到任何博物馆物件显示盖布的鹅或肤色**；已核实的只有：Louvre E 52 把盖布列为“托着”天柱的人物，N 381 只记名字。因此：不画鹅（没有依据），绿皮肤是**设计选择**（取大地/植物之意，ep61 cast61 注释已写明）。",
 "I5 · Louvre E 52；Louvre N 381"),
'nut':("女性，裸身，弯成拱形罩在大地上（Louvre E 52：“Nout (femme, nu, penché, soleil, étoiles)”）；Met 96.4.4 上看到：蓝色天拱，黑假发的头在右上、脚在左下、手在右下，**那件上没有星**。头顶红色 nu 罐（I6 标 unverified）→ 设计选择。站立形态（ep61 cast61.nut）= 女性身体 + nu 罐 + 窄身长裙；拱形态 = `NutArch`（星拱 + 头 + 触地的手脚）。",
 "I6 · Louvre E 52；Met 96.4.4（Tabakenkhonsu 木板画，c.680–670 BCE）"),
'osiris':("人形、有须，木乃伊形（身体紧裹、腿并拢）；阿特夫冠（白冠 + 两侧卷羽毛，Met 看到）；弯钩与连枷交叉捧在胸前（Met 96.4.4、30.3.31）；**绿色皮肤**、红色裹布（Met 96.4.4；Petrie UC14226 “identifiable by his green skin”）；Met 30.3.31 坐王座、白冠、握弯钩。",
 "I7 · Met 96.4.4（SEEN）、Met 30.3.31（Nauny 纸草，SEEN）、Petrie Museum UC14226"),
'isis':("女性；头上是“王座”符（Met 96.4.4 看到黑假发上绿色的王座字；Louvre N 2699：“Isis (debout, signe d’Isis)”）；**带翼、跪着哭泣**（Louvre N 2609：Isis 与 Nephthys “déesses ailées, à genoux, pleurant”）。Met 96.4.4 上她是绿皮肤、红色紧身裙、黑假发；本系列沿用 ep60 `CAST.isis`：女性黄赭肤 + 红裙 + 金珠网，王座符画成蓝色（ep61 cast61）。",
 "I8 · Met 96.4.4；Louvre N 2609（Soutymes 外棺）；Louvre N 2699；Louvre N 255"),
'set':("Set 兽（动物学上未定，Ranke：“unidentified mammal”，Louvre：“dieu à tête d’animal”）：长而下弯的鼻、方顶的竖耳；站姿，戴宽领、三段假发、短裙，一手持 ankh（Louvre E 3374：“tient un signe ânkh”，该件为灰色皂石，拉美西斯二世时期）；记录里他戴 pschent，**ep61 cast61 没有给他加冠**（设计选择，见 cast61.tsx）。Met 25.3.284h 是 was 杖头（Set 兽头）。肤色（赭红）未核实 → 设计选择。",
 "I9 · Louvre E 3374（Seth 与 Nephthys 雕像残件）；Met 25.3.284h（was 杖头，十二王朝）；Ranke 1950"),
'nephthys':("女性；头顶“房屋 + 篮子”符：Met 12.182.23a 上是黑假发上的红色 T 形块（Louvre N 2699：“Nephthys (debout, signe de Nephthys)”）；**跪着、一手到脸边**（哀悼）；Met 上皮肤浅奶色、红头饰、黑领与手镯、绿裙；Louvre N 2609 也有带翼跪哭的形象（本系列默认不带翼，需要时用 `wings`）。",
 "I10 · Met 12.182.23a（Mourning Nephthys，332–30 BCE，SEEN）；Louvre N 2699；Louvre N 2609"),
'horus':("隼首、人身；戴 pschent（Louvre N 255：“Horus (dieu à tête de faucon, debout, couronne pschent)”）；Met 30.3.31 上只有隼形（站在架子上、绿翅、斑点胸，无冠）。没有已核实的“戴双冠的荷鲁斯”上色 → 隼头深蓝灰、白脸颊、黑钩喙是 ep60 的设计，沿用。",
 "I11 · Louvre N 255（Ounnefer 碑）；Met 30.3.31；Met 86.… 青铜隼（双冠）"),
'anubis':("黑色豺/犬科头；Met 38.5（SEEN）：黑头、耳内金/白、**红褐色皮肤**、蓝色假发垂片、红蓝白菱纹裙、红蓝回纹底座；Met 30.3.31：黑头、绿色胸领、黄白裙，**跪在秤旁扶稳它**（ep60 的核心动作）；两手向前伸出（38.5）。ep60 另有正面面具 `MaskFront`（金面具 + 青金耳）。",
 "I12 · Met 38.5（Statuette of a canid-headed god）；Met 30.3.31（Nauny 纸草，SEEN）；Louvre N 2609"),
'thoth':("朱鹮头（长而下弯的喙；另有狒狒形）；头顶月轮（Louvre N 2609：“dieu à tête d’ibis, debout, disque lunaire”，含新月）；手持书记员调色板（“palette de scribe”）；Met 96.4.4 上他是蓝头、绿皮肤、红裙、没有月 —— 本系列取黑朱鹮头 + 赤陶肤 + 月冠（ep60 设计）。狒狒形：Louvre E 17496（蓝色费昂斯，银脸，金盘）。",
 "I13 · Louvre N 2609（Soutymes 外棺）；Louvre E 17496；Met 96.4.4"),
'sekhmet':("狮首女神，头顶日轮 + 圣蛇（Louvre N 1，阿蒙霍特普三世闪长岩坐像，高 240 cm：“déesse à tête de lionne, assis, robe, collier ousekh, disque solaire à uraeus”）；双臂缺失，手里没有记录；红裙是设计选择（I14 标 unverified）。Ranke 1950：“Mostly with head of lioness”。",
 "I14 · Louvre N 1（Drovetti 401）；Ranke 1950"),
'bastet':("女人身体、猫头；Met 04.2.425（青铜，二十六至三十王朝）：一手持叉铃（已断）、臂上挎篮、胸前托狮头盾牌（aegis）；穿长而贴身、刻有网纹的衣裙；**头上没有日轮**。青铜原件无彩绘，配色是设计选择。",
 "I15 · Met 04.2.425；Met 58.67；Met 45.4.5"),
'maat':("女性；头顶**一根**鸵鸟羽毛；三段假发（记录：tripartite wig）；Louvre N 665 称之为“protecting”（带翼的双臂）；Louvre E 4436 是蹲姿裹布的小铜像。没有已核实的上色 → 皮肤/裙色是设计选择。",
 "I16 · Louvre E 4436（Figurine of Ma’at）；Louvre N 665（Ramesses III 拱形碑残片）"),
'ammit':("前半鳄鱼头、中段狮身、后半河马（“the head of a crocodile, the forepart of a lion, and the hindquarters of a hippopotamus”）；蹲在秤下，心脏不平衡时吃掉心脏。本系列画法 = ep60 `Ammit2`（独立的小骨架：颈/下颌/尾/前肢）。",
 "ep60 facts F34/F38 · BM EA9901/3、BM EA10470/3"),
'ani':("本系列的凡人主角：一个书吏（ep60）。人形，双层黑假发 + 红发带、透明亚麻长袍、素领（无垂饰）；手掌平摊（`palm`）、不握物。他是**唯一的凡人参照**，神的身高以他为 1.00。",
 "ep60 · cast60.tsx · CAST.ani；原型：阿尼纸草 BM EA10470"),
}
SIG={'atum':'阿图姆：双臂展开（创世）；拉：隼鸣（头后仰、喙张开）','shu':'双臂高举托天','tefnut':'怒吼：下颌大张、獠牙、头后仰、眉压低','geb':'斜倚在地、身上长出草木（同一骨架转 −90°）','nut':'弯身成拱，身上是星星','osiris':'登基坐在王座上，弯钩与连枷捧在胸前','isis':'展开双翼（双臂高举，羽毛由臂骨带出）','set':'冷笑逼近：嘴角下压、耳朵方顶','nephthys':'跪下、一手到脸边哀悼','horus':'隼鸣：头后仰、喙张开','anubis':'跪在秤旁扶稳铅锤','thoth':'书写：后手托调色板、前手握芦苇笔','sekhmet':'怒吼（同泰芙努特，裙与名字牌不同）','bastet':'舔爪（前臂抬到嘴边）与摇叉铃','maat':'展翼守护；手持秤上的羽毛','ammit':'怒吼：下颌 46°、颈后仰、背鬃竖起','ani':'被审判：低头、双手合在腹前；跪地双手上举'}
out=[]
w=out.append
w('# 古埃及神话故事 · 角色设计册（designbook）\n')
w('> 目的：整个系列里每个反复出现的角色，在所有集里长得一模一样。**画法的唯一来源是代码**：每张设定图都由同一批组件画出（ep60 神骨架 `God`、ep61 演员 `God61`、`Ammit2`、`Balance2`、`HeartScarab`……），设定图和影片因此永远不会漂移。本文把这套“正典”写成文字，并说明以后每一集怎么用。\n')
w('- 设定图：`episodes/37-qiqing/remotion/src/qq61/sheets61.tsx` 的 `SHEETS61`（1440×1080，30 fps，19 帧，**帧 i = 第 i+1 张**）；动起来的关节测试：`RIGTEST61`（17 位 × 6 秒 = 3060 帧）。')
w('- 渲染：`cd episodes/37-qiqing/remotion && SFPS=1 ENTRY=qq61/sheets61 CID=SHEETS61 JPG=1 node scripts/frame.mjs stills /tmp/sheets 0 1 2 … 18`（`SFPS=1` 让“秒数”直接等于帧号，文件名 `f_<帧>.0.jpg`）；RIGTEST 同理：`CID=RIGTEST61`，例如 `… stills /tmp/rt 30 81 114 160`（第 1 位的走 / 标志动作 / 压力姿势 / 表情），整段：`node scripts/frame.mjs video out.mp4 0 102`（整个 102 秒）。')
w('- 需要字体：系统里的 Noto Serif CJK SC（设定图文字）。不提交任何图片/视频/音频，只提交代码和 markdown。\n')
w('## 0. 全系列通用规则\n')
w('1. **一副骨架**：所有神与凡人共用 ep60 的 `rig60.tsx` 骨架：单位 = 1 个方格，脚底 y=0、膝 6、髋 9.5、肩 16；阿尼连假发实测 **20.1 格**。同一个 `s`（px/格）画出来就是同一身高 → **神 = 凡人 × 1.00（身体）**。神靠头（豺/朱鹮/隼/狮/猫/Set 兽）、头饰、手里的东西来辨认，不靠变高。')
w('2. **含头饰的总高**（渲染后量出，格；÷20.1 = 倍数）：'+'；'.join(f"{n} {v}（×{v/ANI:.2f}）" for n,v in [('阿图姆',H['atum']),('拉',H['ra']),('舒',H['shu']),('泰芙努特',H['tefnut']),('盖布',H['geb']),('努特',H['nut']),('奥西里斯',H['osiris']),('伊西斯',H['isis']),('赛特',H['set']),('奈芙蒂斯',H['nephthys']),('荷鲁斯',H['horus']),('阿努比斯',H['anubis']),('托特',H['thoth']),('塞赫迈特',H['sekhmet']),('巴斯特',H['bastet']),('玛阿特',H['maat']),('阿尼',H['ani'])])+'。')
w('3. 例外只有两种：孩童荷鲁斯（ep61 镜 14）= 同骨架 ×0.75；特写时整体放大（所有人一起放大，比例不变）。阿米特是非人形的独立小骨架，不与人形比身高：ep60 称重厅里阿米特 s = 34～42，阿尼 s = 26（≈ ×1.3～1.6）。')
w('4. **画法**：头侧面、肩正面、腿侧面（埃及正统）；墨线外轮廓（`OW = 2.7/s`）、扁平填色、不画手指甲；手握物体时“拳头盖在物体前面”（`FingersOver` / `FistOver`）；金/青金/赤陶/墨线是主色。')
w('5. **表情只画骨架真能做的**：眼（睁/半/闭、看向）、眉（扬/皱）、嘴/下颌/喙（闭/半张/大张）、耳（前/平/后）、人脸微笑；见下“表情部件”。\n')
w('## 1. 帧索引（SHEETS61）\n')
w('| 帧 | 张 | 内容 |\n|---|---|---|')
w('| 0 | 01 | 总排：17 位（神 + 阿尼）同地平线同比例尺，含量出来的总高 + 脸的索引 + 身高规则 |')
for d in chars: w(f"| {d['n']-1} | {d['n']:02d} | {d['zh']} · {d['role']}（{d['en']}） |")
w('| 18 | 19 | 道具表：坛形心脏、羽毛、天平、ankh、was、弯钩与连枷、叉铃、调色板与笔、心脏圣甲虫、正面面具 + 握法 |\n')
w('每张角色表的版面（左→右）：左上 **主视图**（头侧面/肩正面，实际渲染，带身高尺、阿尼头顶线、量出的含冠总高）+ 两侧**引线标注**（部位 + 一句话 + 出处标签）；左下 **色板**（hex 来自代码）与 **必须 / 不要**；右上 **4 个关键姿势**（静/走/标志动作/…）；右中 **关节 / 动作**：3 个压力姿势（红点 = 枢轴，虚线 = 骨链）；右下 **头部特写 3 种表情** + **部件行**（下颌/喙/耳/眼/翅的 3–4 档）。\n')
w('## 2. 角色\n')
w('出处标签写法：I 行 = `episodes/61-zhongshen/facts.md` 里的 iconography 表（物件 · 博物馆 · 编号）；F 行 = 同文件/ep60 facts 的事实表。“设计选择”= 查不到已核实的上色/细节、由本系列决定；这些都在设定图上标了“设计选择/未核实”。\n')
def rows(d):
    return '、'.join(f"{n}（{x}）" for n,x,_ in [])
for d in chars:
    k=d['key']; hs=f"总高 {H[k]} 格（×{H[k]/ANI:.2f}）" if k in H else ('非人形独立骨架（见通用规则 3）' if k=='ammit' else '')
    if k=='atum': hs=f"阿图姆 {H['atum']} 格（×{H['atum']/ANI:.2f}）；拉 {H['ra']} 格（×{H['ra']/ANI:.2f}）"
    w(f"### {d['n']-1:02d}. {d['zh']} · {d['role']}  （{d['en']}；SHEETS61 帧 {d['n']-1}）\n")
    w(f"- **一句话**：{d['sub']}")
    ic=ICON[k]; w(f"- **考据（已知的图像证据）**：{ic[0]}"); w(f"- **出处**：{ic[1]}")
    w('- **画法 / 部位**（设定图上的引线标注）：'+'；'.join(f"{a}——{b}〔{c}〕" for a,b,c in d['notes']) if d['notes'] else '- **画法 / 部位**：见设定图')
    w('- **色板（hex 来自代码）**：'+'、'.join(f"{n} `{hexof(c)}`" for c,n in d['pal']))
    w(f"- **比例 / 身高**：{d['height']}；{hs}")
    w(f"- **标志动作**：{SIG[k]}")
    w(f"- **关键姿势**：{'、'.join(d['poses'])}；**压力姿势**：{'、'.join(d['stress'])}")
    w(f"- **关节**：{d['joints']}")
    w('- **必须**：'+'；'.join(d['must'])); w('- **不要**：'+'；'.join(d['dont'])); w('')
open('/home/runner/work/Video/Video/episodes/61-zhongshen/designbook_body.md','w').write('\n'.join(out))
print(len(chars),'chars', sum(len(x) for x in out))
