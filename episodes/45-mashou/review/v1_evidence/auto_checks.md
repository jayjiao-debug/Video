# Automatic checks: 七个回国一个回家_v1.mp4

## Technical (probe.py)
```
1920x1080 30fps 134.8s video 4.01 Mbps, 71.8 MB
loudness -17.38 LUFS, peak -5.91 dBTP
hard cuts: 7, glitches: 0, black: 0, frozen: 0
  [MAJOR] video bitrate 4.01 Mbps: too low to upload; dark/grainy scenes turn to mush and Douyin may flag 画质模糊. Upload the master (≥8 Mbps)
  [MINOR] silence 76.5–78.1s mid-film (intended?)
```

## Reading pace (pace.py)
```
time    n    on  need  text
   0.0-  4.0   14   4.0   3.1  圆明园十二兽首，你猜回来了几个？  
   4.0-  6.8    7   2.8   2.1  有人花[6910万港元]，  
   6.8-  9.1    7   2.2   2.1  买下一个，却[捐了]。  
  11.6- 15.3   13   3.7   3.0  十二兽首，原本是喷泉的出水口。  
  15.3- 18.7   11   3.4   2.7  正午12点，十二个[一起喷水]。  
  18.7- 22.4   10   3.7   2.5  1860年，英法联军进了园子。  
  22.4- 26.4   10   4.0   2.5  十二个兽首，全被带走了。  WAIT
  26.4- 29.5   11   3.1   2.7  后来回来了几个？先说马首。  
  29.5- 32.6   11   3.1   2.7  一百多年后，它出现在伦敦。  
  32.6- 35.4    7   2.8   2.1  你猜，它卖了多少？  
  35.4- 38.2   10   2.8   2.5  锤子落下：三四十万美元。  
  38.2- 42.2    8   4.0   2.2  2007年，它又要上拍了。  WAIT
  42.2- 45.0    9   2.8   2.4  这一次，锤子[没有落下]。  
  45.0- 48.1   11   3.1   2.7  国家文物局反对公开拍卖。  
  48.1- 51.5   12   3.4   2.8  拍卖前，何鸿燊私下买下了它：  
  51.5- 53.8    4   2.3   1.7  [6910万港元]。  
  53.8- 56.9   11   3.1   2.7  比伦敦那次，贵了[二十多倍]。  
  56.9- 60.3   10   3.4   2.5  兄弟鼠和兔，在巴黎上拍。  
  60.3- 64.6   13   4.2   3.0  锤子落下，两个共拍出3149万欧元。  WAIT
  64.6- 68.2   13   3.7   3.0  5天后，买家却说：[这个款不能付]。  
  68.2- 72.2   14   4.0   3.1  一个法国家族，把鼠和兔无偿捐回。  
  72.2- 76.2   11   4.0   2.7  何鸿燊，也把它捐给了国家。  WAIT
  76.2- 80.1   11   4.0   2.7  2020年5月，何鸿燊去世，98岁。  WAIT
  80.1- 83.0   10   2.8   2.5  他[没等到]，它回家的那天。  
  83.0- 87.2    6   4.2   2.0  同年12月1日，  WAIT
  87.2- 89.5    7   2.3   2.1  它回到了圆明园。  
  89.5- 92.0    6   2.5   2.0  它离开了[160年]。  
  92.0- 94.8   10   2.8   2.5  十二兽首，[七个]回了中国。  
  94.8- 97.7   10   2.8   2.5  可住回圆明园的，[只有它]。  
  97.7-101.6   11   4.0   2.7  2023年，四个兄弟回来看过它，  WAIT
 101.6-104.5    8   2.8   2.2  只待了[12天]，又走了。  
 104.5-107.6   11   3.1   2.7  细看，它是红铜一次铸成的。  
 107.6-110.4    9   2.8   2.4  只有一只耳朵，是卷的。  
 110.4-113.8   12   3.4   2.8  研究的人说：它这一路被撞过。  
 113.8-117.5   12   3.7   2.8  正午12点，它们本该一起喷水。  
 117.5-120.3   10   2.8   2.5  还有五个，至今[没回中国]。  
 120.3-123.7   12   3.4   2.8  法国还拍出过一个疑似龙首，  
 123.7-126.0    5   2.3   1.8  真假，说不清。  
 126.0-130.3   14   4.3   3.1  五个要是上拍，该不该[花钱买回来]？  WAIT

waiting after reading: 11.8s = 9% of the film (target ≤ 12%)
  [CHECK] no subtitle 9.1–11.6s (2.6s): is a named visual beat happening here?
  [MINOR] 22.4s "十二个兽首，全被带走了。" holds 1.4s after it is read
  [MINOR] 38.2s "2007年，它又要上拍了。" holds 1.7s after it is read
  [MINOR] 60.3s "锤子落下，两个共拍出3149万欧元。" holds 1.3s after it is read
  [MINOR] 72.2s "何鸿燊，也把它捐给了国家。" holds 1.3s after it is read
  [MINOR] 76.2s "2020年5月，何鸿燊去世，98岁。" holds 1.3s after it is read
  [MINOR] 83.0s "同年12月1日，" holds 2.3s after it is read
  [MINOR] 97.7s "2023年，四个兄弟回来看过它，" holds 1.3s after it is read
  [MINOR] 126.0s "五个要是上拍，该不该[花钱买回来]？" holds 1.2s after it is read
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
185 frames on 31 sheets in /dev/shm/rev45/out
```

Sheets to look at, in order:
- /dev/shm/rev45/out/sheet_01.png
- /dev/shm/rev45/out/sheet_02.png
- /dev/shm/rev45/out/sheet_03.png
- /dev/shm/rev45/out/sheet_04.png
- /dev/shm/rev45/out/sheet_05.png
- /dev/shm/rev45/out/sheet_06.png
- /dev/shm/rev45/out/sheet_07.png
- /dev/shm/rev45/out/sheet_08.png
- /dev/shm/rev45/out/sheet_09.png
- /dev/shm/rev45/out/sheet_10.png
- /dev/shm/rev45/out/sheet_11.png
- /dev/shm/rev45/out/sheet_12.png
- /dev/shm/rev45/out/sheet_13.png
- /dev/shm/rev45/out/sheet_14.png
- /dev/shm/rev45/out/sheet_15.png
- /dev/shm/rev45/out/sheet_16.png
- /dev/shm/rev45/out/sheet_17.png
- /dev/shm/rev45/out/sheet_18.png
- /dev/shm/rev45/out/sheet_19.png
- /dev/shm/rev45/out/sheet_20.png
- /dev/shm/rev45/out/sheet_21.png
- /dev/shm/rev45/out/sheet_22.png
- /dev/shm/rev45/out/sheet_23.png
- /dev/shm/rev45/out/sheet_24.png
- /dev/shm/rev45/out/sheet_25.png
- /dev/shm/rev45/out/sheet_26.png
- /dev/shm/rev45/out/sheet_27.png
- /dev/shm/rev45/out/sheet_28.png
- /dev/shm/rev45/out/sheet_29.png
- /dev/shm/rev45/out/sheet_30.png
- /dev/shm/rev45/out/sheet_31.png
