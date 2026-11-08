# 林冲 · storyboard v2 (16:9, layered)

20 key frames, 1920x1080, script v3. Code: chars/scenes16.mjs; render + check: node chars/render6.mjs <outdir> (self-test: node chars/qa_selftest.mjs).

Every frame is a stack of named layers with a z order and a parallax depth (0 = sky, 1 = subject plane, >1 = foreground). Typical stack: sky/bg → far → mid → characters → foreground props → effects (snow, glow, vignette) → subtitle.

The checker runs on every frame: a layer crossing the frame edge without being marked to bleed; a face cut by the frame; a face covered by a higher layer (hit-test on the real shapes); text spilling out of its paper; subtitles outside the side safe area, too low, or over a face. v2 result: 0 issues.

| Shot | ~Time (s) | Frame |
|---|---|---|
| S01 | 0.5 | 木桌上的休书，第八回原文；砚台、毛笔；灯光 |
| S02 | 5.5 | 她攥着休书的两只手，一滴泪落下，墨字晕开 |
| S03 | 9.8 | 林冲特写（右三分）：红眼、咬牙、套着枷；左侧虚化的她 |
| S04 | 14.6 | 雪中长街：远处公差押着他，她瘫坐在近处门口 |
| S05 | 19.5 | 片名「林冲 · 豹子头」，风雪中的剪影 |
| S06 | 27.0 | 东京校场：绿袍头巾的禁军教头；远处士兵操练 |
| S07 | 31.5 | 夜里亮灯的窗，窗上是她缝衣的剪影；灯笼 |
| S08 | 38.8 | 岳庙：香炉青烟；高衙内（簪花）拦住她 |
| S09 | 42.4 | 他扳过那人，拳头举起；对面是得意的笑脸 |
| S10 | 49.0 | 特写：拳头一点点松开（颤抖线） |
| S11 | 50.8 | 隐忍：侧脸咬紧牙关（左三分） |
| S12 | 52.4 | 过肩：前景林冲的背影，陆谦笑着斟酒，半张脸在阴影里 |
| S13 | 60.3 | 脸上刺了字，戴着枷，低下头（冷色） |
| S14 | 75.1 | 雪夜山神庙：石头抵门；远处草料场火光；前景枯枝 |
| S15 | 86.9 | 大特写：黑暗里的双眼，被火光映红（遮幅） |
| S16 | 96.2 | 远景：他一个人走进风雪（斗笠、花枪、葫芦剪影） |
| S17 | 109.8 | 梁山泊：小船归来，芦苇；「已故半载」 |
| S18 | 113.6 | 悲：一滴泪（右三分，冷色） |
| S19 | 124.8 | 六和寺空屋：窗光；斗笠在地，花枪靠门 |
| S20 | 138.8 | 回到开场的休书，手印淡去；结尾提问 |
| End | 142–148.5 | End card |
