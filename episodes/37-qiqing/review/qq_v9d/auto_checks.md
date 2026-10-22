# Automatic checks: 七情_v9d_发送版.mp4

## Technical (probe.py)
```
1920x1080 30fps 59.5s video 2.75 Mbps, 22.0 MB
loudness -13.99 LUFS, peak -4.0 dBTP
hard cuts: 7, glitches: 6, black: 1, frozen: 1
  [MAJOR] video bitrate 2.75 Mbps: too low to upload; dark/grainy scenes turn to mush and Douyin may flag 画质模糊. Upload the master (≥8 Mbps)
  [MAJOR] black frames 48.67–48.83s (unintended gap or failed chunk?)
  [MAJOR] single-frame glitch at 16.17s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
  [MAJOR] single-frame glitch at 18.30s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
  [MAJOR] single-frame glitch at 28.33s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
  [MAJOR] single-frame glitch at 30.47s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
  [MAJOR] single-frame glitch at 36.57s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
  [MAJOR] single-frame glitch at 54.80s (one frame differs from both neighbours: a flash that is too short, a missing asset, or a render error)
```

## Reading pace (pace.py)
```
time    n    on  need  text
   0.1-  3.8    8   3.8   2.2  两千年前，《礼记》写道：  WAIT
   1.1-  3.8   11   2.7   2.7  人心里，天生住着七个声音。  
   4.2-  5.9   13   1.8   3.0  它在你收到他消息的那一秒说  TOO FAST
   4.4-  5.9    6   1.6   2.0  “嘴角，压不住了。”  TOO FAST
   6.1- 10.0    7   3.8   2.1  七情之一，它叫 喜  WAIT
   8.2- 10.0    9   1.8   2.4  被在乎的感觉，藏不住。  TOO FAST
  10.2- 12.0    8   1.8   2.2  它在你被冤枉时说  TOO FAST
  10.5- 12.0    5   1.6   1.8  “凭什么是我?”  
  12.2- 16.1    7   3.8   2.1  七情之二，它叫 怒  WAIT
  14.3- 16.1   11   1.8   2.7  心里有火，是因为在乎公平。  TOO FAST
  16.3- 18.1    9   1.8   2.4  它在你删掉合照时说  TOO FAST
  16.5- 18.1    7   1.6   2.1  “原来，真的结束了。”  TOO FAST
  18.3- 22.1    7   3.8   2.1  七情之三，它叫 哀  WAIT
  20.3- 22.1    9   1.8   2.4  会疼，是因为真的爱过。  TOO FAST
  22.4- 24.2    9   1.8   2.4  它在你按下发送前说  TOO FAST
  22.6- 24.2    6   1.6   2.0  “万一，他不回呢?”  TOO FAST
  24.4- 28.2    7   3.8   2.1  七情之四，它叫 惧  WAIT
  26.4- 28.2    9   1.8   2.4  怕失去，所以不敢开口。  TOO FAST
  28.5- 30.3   13   1.8   3.0  它在你记住他随口一句话时说  TOO FAST
  28.7- 30.3    6   1.6   2.0  “他说过，他怕冷。”  TOO FAST
  30.5- 34.3    7   3.8   2.1  七情之五，它叫 爱  WAIT
  32.5- 34.3    8   1.8   2.2  心里有人，才会记得。  TOO FAST
  34.6- 36.4   12   1.8   2.8  它在你听见虚伪的客套时说  TOO FAST
  34.8- 36.4    3   1.6   1.5  “别装了。”  
  36.6- 40.4    7   3.8   2.1  七情之六，它叫 恶  WAIT
  38.6- 40.4   10   1.8   2.5  讨厌，是在替你守住底线。  TOO FAST
  40.7- 42.4   11   1.8   2.7  它在你深夜刷购物车时说  TOO FAST
  40.9- 42.4    4   1.6   1.7  “就这一次。”  
  42.6- 48.5    7   5.9   2.1  七情之七，它叫 欲  WAIT
  44.7- 48.5   12   3.8   2.8  想要，让人往前，也让人停不下。  
  48.8- 54.6    9   5.8   2.4  你心里，哪个声音最大？  WAIT
  54.8- 59.0    9   4.2   2.4  七情 喜怒哀惧爱恶欲  WAIT

waiting after reading: 20.9s = 35% of the film (target ≤ 12%)
  [MINOR] 0.1s "两千年前，《礼记》写道：" holds 1.5s after it is read
  [MAJOR] 4.2s "它在你收到他消息的那一秒说" shows 1.8s, needs 3.0s
  [MAJOR] 4.4s "“嘴角，压不住了。”" shows 1.6s, needs 2.0s
  [MINOR] 6.1s "七情之一，它叫 喜" holds 1.7s after it is read
  [MAJOR] 8.2s "被在乎的感觉，藏不住。" shows 1.8s, needs 2.4s
  [MAJOR] 10.2s "它在你被冤枉时说" shows 1.8s, needs 2.2s
  [MINOR] 12.2s "七情之二，它叫 怒" holds 1.7s after it is read
  [MAJOR] 14.3s "心里有火，是因为在乎公平。" shows 1.8s, needs 2.7s
  [MAJOR] 16.3s "它在你删掉合照时说" shows 1.8s, needs 2.4s
  [MAJOR] 16.5s "“原来，真的结束了。”" shows 1.6s, needs 2.1s
  [MINOR] 18.3s "七情之三，它叫 哀" holds 1.7s after it is read
  [MAJOR] 20.3s "会疼，是因为真的爱过。" shows 1.8s, needs 2.4s
  [MAJOR] 22.4s "它在你按下发送前说" shows 1.8s, needs 2.4s
  [MAJOR] 22.6s "“万一，他不回呢?”" shows 1.6s, needs 2.0s
  [MINOR] 24.4s "七情之四，它叫 惧" holds 1.7s after it is read
  [MAJOR] 26.4s "怕失去，所以不敢开口。" shows 1.8s, needs 2.4s
  [MAJOR] 28.5s "它在你记住他随口一句话时说" shows 1.8s, needs 3.0s
  [MAJOR] 28.7s "“他说过，他怕冷。”" shows 1.6s, needs 2.0s
  [MINOR] 30.5s "七情之五，它叫 爱" holds 1.7s after it is read
  [MAJOR] 32.5s "心里有人，才会记得。" shows 1.8s, needs 2.2s
  [MAJOR] 34.6s "它在你听见虚伪的客套时说" shows 1.8s, needs 2.8s
  [MINOR] 36.6s "七情之六，它叫 恶" holds 1.7s after it is read
  [MAJOR] 38.6s "讨厌，是在替你守住底线。" shows 1.8s, needs 2.5s
  [MAJOR] 40.7s "它在你深夜刷购物车时说" shows 1.8s, needs 2.7s
  [MINOR] 42.6s "七情之七，它叫 欲" holds 3.8s after it is read
  [MINOR] 48.8s "你心里，哪个声音最大？" holds 3.4s after it is read
  [MINOR] 54.8s "七情 喜怒哀惧爱恶欲" holds 1.8s after it is read
  [MAJOR] 35% of the runtime is waiting: tighten lines or add story
```

## Brand rule (never "Juno 出品" on screen)
```
no hits
```

## Frames for the visual pass (frames.py)
```
63 frames on 11 sheets in review/qq_v9d
```

Sheets to look at, in order:
- review/qq_v9d/sheet_01.png
- review/qq_v9d/sheet_02.png
- review/qq_v9d/sheet_03.png
- review/qq_v9d/sheet_04.png
- review/qq_v9d/sheet_05.png
- review/qq_v9d/sheet_06.png
- review/qq_v9d/sheet_07.png
- review/qq_v9d/sheet_08.png
- review/qq_v9d/sheet_09.png
- review/qq_v9d/sheet_10.png
- review/qq_v9d/sheet_11.png
