# ep61 角色设定册 · 结果（给 Juno）

## 做了什么
- **19 张设定图**（1440×1080，扁平墓室壁画风）：总排 1 张 + 17 位角色各 1 张（阿图姆·拉合一张、舒、泰芙努特、盖布、努特、奥西里斯、伊西斯、赛特、奈芙蒂斯、荷鲁斯、阿努比斯、托特、塞赫迈特、巴斯特、玛阿特、阿米特、阿尼）+ 道具表 1 张。
- 每张角色表有：主视图（头侧面 / 肩正面，真实渲染）+ 引线标注（部位 + 一句话 + 出处标签 I 行 / 博物馆 / 编号）+ 色板（hex 来自代码）+ 必须 / 不要 + 身高标尺（阿尼头顶线 + 量出的含冠总高）+ 4 个关键姿势 + 3 个关节压力姿势（红点枢轴、虚线骨链）+ 3 种表情的头部特写 + 一行部件（下颌 / 喙 / 耳 / 翅 / 眼 3–4 档）。
- 所有图都由影片用的同一批组件画出（`God` / `God61` / `Ammit2` / `Balance2` / `HeartScarab` / `MaskFront` …），不是另画的。
- **动画测试 `RIGTEST61`**：17 位 × 6 秒（共 3060 帧）：走 → 标志动作 → 3 个压力姿势 → 表情切换，旁边有头部大特写，关节枢轴红点实时显示。
- 新增的骨架能力（默认关闭，影片不受影响）：豺 / 朱鹮 / 隼的**下颌与喙张开**、豺耳折叠、狮首**大怒吼**（下颌 59°、獠牙、舌）、猫 / Set 耳旋转、眼睛睁 / 半 / 闭 + 看向、眉扬 / 皱、人脸微笑 / 小张嘴。
- **身高规则**（量出来的）：所有神与阿尼同骨架同比例，身体 = 凡人 × 1.00（阿尼含假发 20.1 格）；含头饰总高 19.9（盖布）～24.2（奥西里斯阿特夫冠）格，即 ×0.99～×1.20；孩童荷鲁斯 ×0.75；阿米特是独立小骨架（ep60 里 s=34 对阿尼 s=26）。

## 文件
- 代码：`episodes/37-qiqing/remotion/src/qq61/sheets61.tsx`（`registerRoot`，`SHEETS61` 19 帧、`RIGTEST61` 3060 帧）、`chars61.tsx`（设定表数据）、`sheetkit61.tsx`（版面 / Actor / 标注）、`expr61.tsx`（眼眉嘴表情层）。
- 文字：`episodes/61-zhongshen/designbook.md`（每个角色的中文名、角色、考据 + 出处、色板 hex、比例、标志动作、必须 / 不要、关节、帧索引、以后每集怎么用、已知局限）。
- 生成 designbook 正文的脚本：`tasks/ep61-sheets/out/gen_designbook.py`（读 `chars61.tsx` 数据）。
- **没有提交任何图片 / 视频 / 音频**。

## 渲染命令
```
cd episodes/37-qiqing/remotion && npm ci
# 19 张设定图（SFPS=1：“秒数”=帧号，文件名 f_<帧>.0.jpg；帧 i = 第 i+1 张）
SFPS=1 ENTRY=qq61/sheets61 CID=SHEETS61 JPG=1 node scripts/frame.mjs stills /tmp/sheets $(seq 0 18)
# 关节动画抽帧（第 k 位 = 帧 180·(k-1) … 180·k-1），例：托特（第 12 位）的走 / 标志动作 / 压力姿势 / 表情
SFPS=1 ENTRY=qq61/sheets61 CID=RIGTEST61 JPG=1 node scripts/frame.mjs stills /tmp/rt 2010 2061 2094 2140
# 整段 102 秒视频
ENTRY=qq61/sheets61 CID=RIGTEST61 node scripts/frame.mjs video /tmp/rigtest61.mp4 0 102
```
（runner 里需要 `REMOTION_BROWSER` 指向 playwright 的 chrome-headless-shell。）

## 动过的已有文件（画面保持不变）
- `qq60/rig60.tsx`：只加可选项（`jaw`、`ear`、`Cast.faceless`、5 个组件加 `export`）；`qq61/cast61.tsx`：`God61` 加 `roar / jaw / ear / pivots`，狮头加新怒吼画法（旧 `open` 不动），`CAST61` 加 `ani`；`qq61/shots61.tsx`：`NutArch` 加 `export`。
- 验证：改前（git HEAD）与改后逐像素比较 ep61 镜 4、5、6、10、11、12、13、17、19、20、21 和 ep60 `LOOKA`、`LOOKA2`、`RIG60`：全部相同。

## 还缺 / 需要你拍板
1. ep61 影片里泰芙努特（镜 4）、塞赫迈特（镜 19）用旧参数 `open={1}`，嘴被头盖住、吼得不够大；设定册用新参数 `roar`。要不要改影片（会改变这两镜画面）请你定，我没动。
2. 木乃伊形奥西里斯手脚藏在裹布里，只有颈 / 头 / 躯干能动；猫头不能哈气；豺没有舌头；隼的喙张开幅度小；人脸只有小张嘴。
3. 努特的拱形、盖布的躺姿不是独立骨架（星拱组件 / 整体转 −90°）。
4. 没有可考上色的部分都是设计选择，图上已标“设计选择 / 未核实”：阿图姆、舒、泰芙努特、盖布（绿肤）、赛特（赭红，且 Louvre E 3374 上他戴 pschent，ep61 没加冠）、塞赫迈特红裙、巴斯特、玛阿特；盖布的鹅不画（查无依据）。
5. 检查范围：19 张设定图都渲染并看过（舒、奈芙蒂斯只在缩略拼图里看）；RIGTEST61 每位抽样 4 帧共 68 帧看过，没有把 102 秒整段逐帧审；没有请独立评审（video-reviewer / rig-reviewer）复审——建议你或它们在发给 Juno 前再过一遍。
