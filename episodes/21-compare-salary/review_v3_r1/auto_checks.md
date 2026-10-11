# Automatic checks: master_v3.mp4

## Technical (probe.py)
```
1920x1080 30fps 130.0s video 10.25 Mbps, 171.1 MB
loudness -9.96 LUFS, peak 1.44 dBTP
hard cuts: 6, glitches: 0, black: 0, frozen: 2
  [MINOR] loudness -9.96 LUFS (aim -16 to -14 for phones)
  [MINOR] true peak 1.44 dBTP (clipping risk; keep ≤ -1)
  [MINOR] picture almost static 110.6–113.8s (fine for a title/end card; dead air otherwise)
```

## Reading pace (pace.py)
```
time    n    on  need  text
   0.0-  4.4   13   4.4   3.0  你拿到人生第一份实习工资：[4000]  WAIT
   4.4-  8.5    7   4.1   2.1  开心了[整整三天]  WAIT
   8.5- 12.5    9   4.0   2.4  然后室友说：他的是[6000]  WAIT
  12.5- 16.4    9   3.9   2.4  你的4000，突然就[不香了]  WAIT
  20.6- 24.7   10   4.1   2.5  别怪自己。连[猴子]都这样  WAIT
  24.7- 28.7   14   4.0   3.1  科学家让卷尾猴，用小石子换[黄瓜]  
  28.7- 32.8   12   4.1   2.8  两只都换到黄瓜：[95%]照常交换  WAIT
  32.8- 36.8   13   4.0   3.0  可旁边那只，同样干活，换到[葡萄]  
  36.8- 40.9    9   4.1   2.4  这只就不干了：掉到[60%]  WAIT
  40.9- 44.9   15   4.0   3.2  旁边那只[啥也不干]就拿葡萄：只剩[20%]  
  44.9- 48.9   14   4.0   3.1  不是黄瓜变难吃了，是[旁边有葡萄]  
  49.0- 53.0   12   4.0   2.8  人呢？哈佛问过257个人一道题  WAIT
  53.0- 57.0   12   4.0   2.8  A世界：你年入5万，别人[2.5万]  
  57.0- 61.1   12   4.1   2.8  B世界：你年入10万，别人[20万]  WAIT
  61.1- 65.1   12   4.0   2.8  B多挣一倍，可[48%]的人选了A  
  65.2- 69.2   13   4.0   3.0  换成假期呢？[85%]的人只要自己多  
  69.2- 73.2   12   4.0   2.8  原来我们，偏偏在[钱]上最爱比  
  73.2- 77.2   18   4.0   3.7  2008年，一家报纸把加州大学的工资[放上了网]  
  77.2- 81.3   16   4.1   3.4  研究者提醒一部分员工：[可以去查同事]  
  81.4- 85.4   12   4.0   2.8  低于中位数的人：满意度[下降]  
  85.4- 89.5    6   4.1   2.0  而且[更想跳槽]  WAIT
  89.5- 93.5   14   4.0   3.1  高于中位数的人呢？[并没有更开心]  
  93.5- 97.6   13   4.1   3.0  比较这笔账，只有[比输的人]在痛  
  97.6-101.6   18   4.0   3.7  还有研究发现：自己收入不变，[邻居]挣得越多  
 101.6-105.7    6   4.1   2.0  人就[越不快乐]  WAIT
 105.7-109.7   11   4.0   2.7  所以觉得穷，不一定是[钱少]  WAIT
 109.7-113.8   10   4.1   2.5  是你身边，总有一颗[葡萄]  WAIT
 113.8-117.8   12   4.0   2.8  比较是天性，但[跟谁比]，你能选  
 117.8-121.9   11   4.1   2.7  跟去年的自己比，你[多了4000]  WAIT
 121.9-125.4    9   3.5   2.4  你最常拿自己，跟[谁]比？  

waiting after reading: 22.2s = 17% of the film (target ≤ 12%)
  [MINOR] 0.0s "你拿到人生第一份实习工资：[4000]" holds 1.4s after it is read
  [MINOR] 4.4s "开心了[整整三天]" holds 2.0s after it is read
  [MINOR] 8.5s "然后室友说：他的是[6000]" holds 1.6s after it is read
  [MINOR] 12.5s "你的4000，突然就[不香了]" holds 1.5s after it is read
  [CHECK] no subtitle 16.4–20.6s (4.2s): is a named visual beat happening here?
  [MINOR] 20.6s "别怪自己。连[猴子]都这样" holds 1.6s after it is read
  [MINOR] 28.7s "两只都换到黄瓜：[95%]照常交换" holds 1.3s after it is read
  [MINOR] 36.8s "这只就不干了：掉到[60%]" holds 1.7s after it is read
  [MINOR] 49.0s "人呢？哈佛问过257个人一道题" holds 1.2s after it is read
  [MINOR] 57.0s "B世界：你年入10万，别人[20万]" holds 1.3s after it is read
  [MINOR] 85.4s "而且[更想跳槽]" holds 2.1s after it is read
  [MINOR] 101.6s "人就[越不快乐]" holds 2.1s after it is read
  [MINOR] 105.7s "所以觉得穷，不一定是[钱少]" holds 1.3s after it is read
  [MINOR] 109.7s "是你身边，总有一颗[葡萄]" holds 1.6s after it is read
  [MINOR] 117.8s "跟去年的自己比，你[多了4000]" holds 1.4s after it is read
  [MAJOR] 17% of the runtime is waiting: tighten lines or add story
```

## Sources (facts.py)
```
sources: no problems found
```

## Brand rule (never "Juno 出品" on screen)
```
no hits
```

## Frames for the visual pass (frames.py)
```
67 frames on 12 sheets in /home/claude/video/episodes/21-compare-salary/review_v3_r1
```

Sheets to look at, in order:
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_01.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_02.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_03.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_04.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_05.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_06.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_07.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_08.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_09.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_10.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_11.png
- /home/claude/video/episodes/21-compare-salary/review_v3_r1/sheet_12.png
