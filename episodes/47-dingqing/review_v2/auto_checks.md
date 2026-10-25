# Automatic checks: ep47_v2.mp4

## Technical (probe.py)
```
1920x1080 30fps 145.1s video 1.56 Mbps, 33.0 MB
loudness -14.03 LUFS, peak -2.03 dBTP
hard cuts: 19, glitches: 0, black: 0, frozen: 2
  [MAJOR] video bitrate 1.56 Mbps: too low to upload; dark/grainy scenes turn to mush and Douyin may flag 画质模糊. Upload the master (≥8 Mbps)
  [MINOR] picture almost static 123.9–127.0s (fine for a title/end card; dead air otherwise)
```

## Reading pace (pace.py)
```
time    n    on  need  text
   0.0-  2.8   11   2.8   2.7  你们的情侣头像，[一人一半]。  
   2.8-  5.7   11   2.8   2.7  这招，[1400多年前]就有人用了。  
   5.7-  9.1   12   3.4   2.8  相传，是一面[分成两半的镜子]。  
  11.9- 14.2    9   2.3   2.4  两千多年前，《诗经》里唱：  
  14.2- 16.4    7   2.3   2.1  你送我一个[木瓜]，  
  16.4- 18.7    7   2.3   2.1  我回你一块[美玉]。  
  18.7- 20.9    6   2.3   2.0  不是为了还礼，  
  20.9- 24.4    7   3.4   2.1  是想[永远好下去]。  WAIT
  25.5- 28.3   10   2.8   2.5  东汉末年，一首[《定情诗》]里：  
  28.3- 30.6    7   2.3   2.1  金臂环，明珠耳环，  
  30.6- 32.8    7   2.3   2.1  还有一对[银戒指]。  
  32.8- 35.7    9   2.8   2.4  1800多年前，就送[戒指]了。  
  35.7- 38.5   11   2.8   2.7  诗里的信物，好多都是[一对]。  
  39.1- 41.3    7   2.3   2.1  相传，陈朝将亡时，  
  41.3- 44.2   12   2.8   2.8  驸马徐德言把铜镜[一分为二]，  
  44.2- 47.5    7   3.3   2.1  和妻子[一人一半]。  WAIT
  48.1- 51.5   13   3.4   3.0  约好正月十五，在集市[卖镜相认]。  
  51.5- 54.3   12   2.8   2.8  国破，她被送进权臣[杨素]府里。  
  54.3- 57.2   13   2.8   3.0  正月十五，真有人在卖[半面镜子]。  
  57.2- 59.4    7   2.3   2.1  两半一合，[对上了]。  
  59.4- 61.7    8   2.3   2.2  他题诗：[镜归人不归]。  
  61.7- 64.0    8   2.3   2.2  杨素动容，[成全二人]。  
  64.0- 66.2    7   2.2   2.1  这就是，[破镜重圆]。  
  66.2- 69.6   12   3.4   2.8  白居易笔下，杨贵妃死后成仙，  
  69.6- 71.9    8   2.3   2.2  她把金钗[掰成两股]，  
  71.9- 74.2    9   2.3   2.4  留一股，[托人寄给玄宗]。  
  74.2- 76.4    7   2.3   2.1  她说：只要心不变，  
  76.4- 79.2    8   2.8   2.2  [天上人间]，总会相见。  
  79.8- 82.6   12   2.8   2.8  七十年代，结婚讲究[三转一响]：  
  82.6- 85.5   11   2.8   2.7  自行车、手表、缝纫机、收音机。  
  85.5- 88.3   13   2.8   3.0  一辆自行车，约等于[三个月工资]。  
  88.3- 91.1   11   2.8   2.7  1998年的歌里，[520]就是“我爱你”。  
  91.1- 93.4    9   2.3   2.4  2016年5月20日这一天，  
  93.4- 95.6    9   2.2   2.4  微信红包上限，[200变520]。  
  96.2- 98.5    5   2.3   1.8  可你回头看：  
  98.5-100.8    6   2.3   2.0  镜子，[一人一半]。  
 100.8-103.0    6   2.3   2.0  金钗，[一人一股]。  
 103.0-105.8    6   2.8   2.0  1400多年过去了，  
 107.0-110.4   13   3.4   3.0  今天的情侣头像，[还是一人一半]。  
 110.4-113.2   11   2.8   2.7  东西换了又换，这一招[还在]：  
 113.2-116.0    7   2.8   2.1  我把一半，[留给你]。  
 117.2-120.3   11   3.1   2.7  破镜的那一对，后来[重圆]了。  
 120.3-123.6   13   3.3   3.0  金钗那一对，一个天上，[一个人间]。  
 123.6-127.0    9   3.4   2.4  你手里那一半，[给了谁]？  
 129.3-131.5    7   2.3   2.1  你们的情侣头像，  
 131.5-137.7    5   6.2   1.8  [换过几次]了？  WAIT

waiting after reading: 6.9s = 5% of the film (target ≤ 12%)
  [CHECK] no subtitle 9.1–11.9s (2.8s): is a named visual beat happening here?
  [MINOR] 20.9s "是想[永远好下去]。" holds 1.3s after it is read
  [MINOR] 44.2s "和妻子[一人一半]。" holds 1.2s after it is read
  [CHECK] no subtitle 127.0–129.3s (2.3s): is a named visual beat happening here?
  [MINOR] 131.5s "[换过几次]了？" holds 4.3s after it is read
```

## Sources (facts.py)
```
[MAJOR] 2.8s "这招，[1400多年前]就有人用了。": the number 1400 is not in the facts table; add its source or fix the line
  [MAJOR] 32.8s "1800多年前，就送[戒指]了。": the number 1800 is not in the facts table; add its source or fix the line
  [MAJOR] 79.8s "七十年代，结婚讲究[三转一响]：": the number 七十 is not in the facts table; add its source or fix the line
  [MAJOR] 103.0s "1400多年过去了，": the number 1400 is not in the facts table; add its source or fix the line
```

## Brand rule (never "Juno 出品" on screen)
```
no hits
```

## Frames for the visual pass (frames.py)
```
114 frames on 19 sheets in review_v2
```

Sheets to look at, in order:
- review_v2/sheet_01.png
- review_v2/sheet_02.png
- review_v2/sheet_03.png
- review_v2/sheet_04.png
- review_v2/sheet_05.png
- review_v2/sheet_06.png
- review_v2/sheet_07.png
- review_v2/sheet_08.png
- review_v2/sheet_09.png
- review_v2/sheet_10.png
- review_v2/sheet_11.png
- review_v2/sheet_12.png
- review_v2/sheet_13.png
- review_v2/sheet_14.png
- review_v2/sheet_15.png
- review_v2/sheet_16.png
- review_v2/sheet_17.png
- review_v2/sheet_18.png
- review_v2/sheet_19.png
