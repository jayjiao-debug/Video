# Automatic checks: ep45_film_v2_review.mp4

## Technical (probe.py)
```
1920x1080 30fps 154.2s video 7.42 Mbps, 147.9 MB
loudness -14.03 LUFS, peak -1.93 dBTP
hard cuts: 36, glitches: 1, black: 0, frozen: 0
  [MAJOR] video bitrate 7.42 Mbps: too low to upload; dark/grainy scenes turn to mush and Douyin may flag 画质模糊. Upload the master (≥8 Mbps)
  [MAJOR] single-frame glitch at 102.60s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
```

## Reading pace (pace.py)
```
time    n    on  need  text
   0.0-  3.4   11   3.4   2.7  假如说，你是圆明园的[马首]。  
   3.4-  5.7    6   2.3   2.0  1860年，你被[抢走]，  
   5.7-  7.9    6   2.3   2.0  在伦敦，被[拍卖]，  
   7.9- 10.2    8   2.3   2.2  又被人花[6910万]买下，  
  10.2- 12.5    6   2.3   2.0  又被[捐了出去]。  
  12.5- 14.7    6   2.3   2.0  2020年，你[回家]了。  
  14.7- 17.6   12   2.8   2.8  可十二个里，还有[五个]没回来。  
  20.9- 24.9   12   4.0   2.8  乾隆年间，你由红铜[一次铸成]。  
  24.9- 28.9   13   4.0   3.0  你和十一个兄弟，坐在[水池两边]。  
  28.9- 32.3   11   3.4   2.7  每两小时，轮到谁，[谁就喷水]。  
  32.3- 34.5    4   2.3   1.7  你是[午时]。  
  34.5- 40.2   12   5.7   2.8  正午十二点，十二个[一起喷水]。  WAIT
  40.2- 43.6   10   3.4   2.5  1860年，英法联军[进了园子]。  
  43.6- 48.1   13   4.5   3.0  能搬走的都被搬走，然后[一把火]。  WAIT
  48.1- 52.1   10   4.0   2.5  你被带走了，[不知去了哪]。  WAIT
  52.1- 55.5   11   3.4   2.7  一百多年后，你出现在[伦敦]。  
  55.5- 59.4   13   4.0   3.0  锤子落下，你被台湾收藏家[买走]。  
  59.4- 64.0   11   4.5   2.7  兄弟牛、猴、虎，也[上了拍卖台]。  WAIT
  64.0- 66.2    9   2.3   2.4  锤子落下：被[买回中国]。  
  66.2- 69.6   13   3.4   3.0  港澳企业家何鸿燊，买回了[猪首]。  
  69.6- 72.5    8   2.8   2.2  2007年，你又要[上拍]了。  
  72.5- 75.3    9   2.8   2.4  这一次，锤子[没有落下]。  
  75.3- 79.8   12   4.5   2.8  拍卖前，还是何鸿燊，买下了你：  WAIT
  79.8- 81.5    4   1.7   1.7  [6910万港元]。  
  81.5- 84.3   10   2.8   2.5  比上一次，贵了[二十多倍]。  
  84.3- 88.9   11   4.5   2.7  巴黎，你的兄弟鼠和兔上拍，  WAIT
  88.9- 91.1    8   2.3   2.2  锤子落下：[3149万欧元]。  
  91.1- 93.4    7   2.3   2.1  买家却[拒绝付款]。  
  93.4- 96.8   14   3.4   3.1  4年后，鼠和兔被法国一家人[送回]。  
  96.8- 99.6   10   2.8   2.5  2007到2019年，你在港澳[展出]。  
  99.6-102.5   11   2.8   2.7  2019年，何鸿燊把你[捐给国家]。  
 102.5-105.3   10   2.8   2.5  2020年5月，他去世了，[98岁]。  
 105.3-109.2    9   4.0   2.4  他没等到，[你回家]那天。  WAIT
 109.2-116.0    6   6.8   2.0  2020年12月1日，  WAIT
 116.0-118.9    6   2.8   2.0  你回到[圆明园]。  
 118.9-121.1    6   2.3   2.0  你离开了[160年]。  
 121.1-125.1   12   4.0   2.8  十二个里，回到中国的有[七个]。  
 125.1-128.2   11   3.1   2.7  如今回到圆明园的，[只有你]。  
 128.2-131.6   13   3.5   3.0  你住进园里唯一[幸存]的古建筑。  
 131.6-135.0   12   3.3   2.8  人们发现，你的一只耳朵[卷了]。  
 135.0-138.3   11   3.4   2.7  研究的人说：你一路[被撞过]。  
 138.3-141.7   13   3.4   3.0  正午十二点，你们本该[一起喷水]。  
 141.7-144.6   11   2.8   2.7  还差[十一个]：六个在博物馆，  
 144.6-146.8    8   2.3   2.2  五个，至今[没回中国]。  
 146.8-149.7   10   2.8   2.5  2018年，法国拍出[疑似龙首]，  
 149.7-151.4    5   1.7   1.8  真假，[说不清]。  
 151.4-154.2   12   2.8   2.8  如果找到了，该[花钱买回来]吗？  

waiting after reading: 17.7s = 11% of the film (target ≤ 12%)
  [CHECK] no subtitle 17.6–20.9s (3.4s): is a named visual beat happening here?
  [MINOR] 34.5s "正午十二点，十二个[一起喷水]。" holds 2.8s after it is read
  [MINOR] 43.6s "能搬走的都被搬走，然后[一把火]。" holds 1.6s after it is read
  [MINOR] 48.1s "你被带走了，[不知去了哪]。" holds 1.4s after it is read
  [MINOR] 59.4s "兄弟牛、猴、虎，也[上了拍卖台]。" holds 1.9s after it is read
  [MINOR] 75.3s "拍卖前，还是何鸿燊，买下了你：" holds 1.7s after it is read
  [MINOR] 84.3s "巴黎，你的兄弟鼠和兔上拍，" holds 1.9s after it is read
  [MINOR] 105.3s "他没等到，[你回家]那天。" holds 1.6s after it is read
  [MINOR] 109.2s "2020年12月1日，" holds 4.8s after it is read
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
191 frames on 32 sheets in /home/claude/video/episodes/45-mashou/review/v2
```

Sheets to look at, in order:
- /home/claude/video/episodes/45-mashou/review/v2/sheet_01.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_02.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_03.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_04.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_05.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_06.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_07.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_08.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_09.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_10.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_11.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_12.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_13.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_14.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_15.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_16.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_17.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_18.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_19.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_20.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_21.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_22.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_23.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_24.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_25.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_26.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_27.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_28.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_29.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_30.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_31.png
- /home/claude/video/episodes/45-mashou/review/v2/sheet_32.png
