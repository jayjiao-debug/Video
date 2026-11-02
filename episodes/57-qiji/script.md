# ep57 《新世界七大奇迹，你去过几个？》 · script v6 (2026-11-02 23:40)

v5 is kept in script_v5.md (cold read 6/10; storyboard v2 is built on v5).

## What changed from v5 (owner 23:21 and 23:26, plus the cold read)
- **Open (owner):** 「世界这么大！今天我们一起去看看！」 as a POV of **catching the flight** (running through the terminal, the departures board flipping the 7 destinations). Then the camera dives (运镜) into the first stop. **The trip ends back at 长城** (长城 is now the last stop and the 7/7 photo, a homecoming).
- **Arrival voice (owner):** at every landing, an AI voice says **"you have arrived in X" in that country's language** (ElevenLabs, native voices; elevenlabs-voiceover skill). Ending in Mandarin: 「欢迎回家。」 The arrival board shows the original line with the Chinese under it.
- **Each stop (owner 23:21):** a **vector (SVG) drawing** of the scene tells the place's story → **the camera comes up** (an instant-camera viewfinder mask / hands) → **咔嚓** → a **拍立得 polaroid slides out blank and develops into the real photo**, matching the drawing exactly → it goes **into the album** with tape, a sticker, a handwritten caption and a passport-style entry stamp. The album step happens **on the plane's tray table during the next flight**, so it costs no extra screen time (the cold read felt the v5 photo freezes were padding).
- **A different photo moment at each stop** (owner 23:13 「switch things up」): we shoot / self-timer jump / the lightning is the flash / a passer-by shoots / slow develop by candlelight / the whole crowd faces the Taj except you / the selfie at 长城.
- **The counter is a race, not a spoiler (cold read):** the question is a bet, 「够不够绕地球一圈？」, and the odometer reads **已飞 N / 40,075**. After the Taj: 「只差4108公里」 → the last leg is 3,769 → **差340公里**.
- **The pyramid is the second question at ~31–38 s:** the album has an odd **8th slot**. It is answered over Egypt, and the slot gets a gold 「荣誉」 sticker instead of a photo.
- **Three weak facts replaced (to verify; researcher running → facts.md):** 马丘比丘 without mortar, 斗兽场 holes from the iron clamps, 佩特拉's urn full of bullet holes.
- **Ending:** cold read wanted a lower bar than "post a photo": 「你去过几个？评论区打个数字」, then 「真去过的，晒出你的照片」.

Subtitle-only plus the 7 short arrival voice lines. 16:9. **About 2:40** (cap 2:59). Times are a draft: the BGM is not chosen yet; they snap to its bars later. pace.py: 0 MAJOR, waiting 3%. **[x]** = key word, underlined. Lines live in lines.json.

## The route (great circle, Earth radius 6,371 km; all 720 orders of the 6 stops checked)
Start: 北京首都机场 (40.080 N, 116.603 E). End: 长城·八达岭 (40.360 N, 116.020 E).

| Leg | km | 已飞 / 40,075 |
|---|---|---|
| 北京 → 奇琴伊察 | 12,772 | 12,772 |
| → 马丘比丘 | 4,151 | 16,923 |
| → 基督像 | 3,279 | 20,202 |
| → 斗兽场 (Atlantic) | 9,203 | 29,405 |
| → 佩特拉 (over Egypt) | 2,418 | 31,823 |
| → 泰姬陵 | 4,143 | 35,967 (4,108 to go) |
| → 长城 (home) | 3,769 | **39,735: 差 340 公里** |

Shortest of the 720 orders; the worst is 89,694 km. (v5's 八达岭 → 八达岭 loop was 39,729 / 346; the airport start changes it slightly.)

## Script
| # | Time | Subtitle | Picture | Sound |
|---|---|---|---|---|
| 1 | 0:00 | 世界这么大！<br>新七大奇迹，你是不是只去过[长城]？ | **Frame 0:** POV sprinting through a drawn terminal, the boarding pass in our hand (乘客：你). The **departures board** flips: 墨西哥 · 秘鲁 · 巴西 · 意大利 · 约旦 · 印度 · 中国（长城）, all 「登机」. | footsteps, the board's flaps |
| 2 | 0:04 | 今天，我们一起去看看！ | Through the gate, down the jet bridge, into seat 7A. | |
| — | 0:06 | (title) | **Title 《新世界七大奇迹，你去过几个？》** lands on the departures board; the plane takes off. Holds ≥ 2.5 s. | hit |
| 3 | 0:09 | 7个地方连成一圈飞回来，<br>够不够[绕地球一圈]？ | Window seat: a borderless globe outside, 7 points; a faint ring traces the route. **The bet: held to the end.** | |
| 4 | 0:13 | 地球一圈，40075公里。<br>出发！ | The odometer appears bottom-left: **已飞 0 / 40,075 公里**. The empty album on the tray table: 7 slots. | |
| — | 0:16 | — | Hop over the Pacific; the odometer spins to 12,772. | **VO (es-MX): "Ha llegado a México."** |
| 5 | 0:18 | 第一站，墨西哥，<br>奇琴伊察。 | **运镜:** dive through the clouds into the drawn 奇琴伊察. Arrival board: Ha llegado a México / 您已到达：墨西哥. | stamp thump |
| 6 | 0:21 | 四面台阶加上顶上的平台，<br>一共[365]级——一年365天。 | Drawn: the steps light up one by one to 365. 你 at the foot, shading eyes. | |
| 7 | 0:25 | 每年春分秋分，影子会变成<br>一条[蛇]，从台阶上爬下来。 | **The big drawn moment:** the serpent shadow forms and slides down to the stone head. Then we raise the camera: viewfinder, **咔嚓**, the polaroid develops into the real photo. | lift on the music |
| 8 | 0:31 | 咦，这相册怎么有[8个]格子？ | Tray table: the polaroid taped into slot 1, a snake sticker, caption 「365级 = 一年」. The album has **8 slots**; the 8th has a grey pyramid outline. Odometer → 16,923. | |
| 9 | 0:34 | 第8格是金字塔——<br>它怎么不在七大奇迹里？ | Close on slot 8. **Second question.** | **VO (es-PE): "Ha llegado al Perú."** |
| 10 | 0:39 | 第二站，秘鲁，<br>马丘比丘。 | Dive into the drawn 马丘比丘 (the classic view). Entry stamp. | |
| 11 | 0:42 | 它建在两千多米高的山上，<br>石头之间[没用水泥]。 | Drawn close-up: stones slot together with no mortar (wording waits for facts.md). | |
| 12 | 0:46 | 相机放石头上，<br>倒计时10秒—— | **Self-timer:** the camera on a rock, the red light blinking; 你 runs and **jumps**. 咔嚓 mid-air; the polaroid develops. | beeps, click |
| — | 0:50 | — | Tray table: llama sticker, caption 「没用水泥！」. Odometer → 20,202. | **VO (pt-BR): "Você chegou ao Brasil."** |
| 13 | 0:52 | 第三站，巴西，<br>基督像。 | Dive into the drawn 基督像 above the bay. | |
| 14 | 0:55 | 它是七个里最年轻的：<br>[1931年]才落成。 | Ages over the 7 points on a small globe; this one is the youngest (95). | |
| 15 | 0:59 | 它还常被雷劈，<br>手指和头都被[劈坏]过。 | Storm; 你 copies the statue, arms open. **The lightning strike is the flash**: 咔嚓 on the bolt; the polaroid develops. | thunder = shutter |
| 16 | 1:03 | 下一段，横跨[大西洋]。 | Tray table: lightning sticker. The longest leg: the odometer spins 20,202 → 29,405. | **VO (it): "Sei arrivato in Italia."** |
| 17 | 1:07 | 第四站，意大利，<br>罗马斗兽场。 | Dive into the drawn 斗兽场. | |
| 18 | 1:10 | 两千年前，<br>它能坐下[5万人]。 | The stands fill with small silhouettes, row by row. | crowd swell |
| 19 | 1:13 | 墙上这些坑，是中世纪的人<br>撬走[铁夹子]留下的。 | Push in on the pocked wall; a drawn iron clamp pops out of a hole. (Wording waits for facts.md.) A **passer-by** takes the photo: 你 hands on hips, 咔嚓. | |
| 20 | 1:20 | 往东飞，下面就是[埃及]。<br>还记得第8格吗？ | Window: desert, three small pyramids; slot 8 in the album blinks. | |
| 21 | 1:23 | 金字塔本来也在候选名单里，<br>埃及人[不干了]： | The pyramids among the candidate points on the globe. | |
| 22 | 1:27 | 它是古代七大奇迹里[唯一还在的]，<br>根本不需要投票。 | The pyramids at sunset, alone. | |
| 23 | 1:32 | 最后，它成了<br>“[荣誉]候选”。 | **Slot 8 gets a gold 「荣誉」 sticker** (no photo). | **VO (ar-JO): "لقد وصلتَ إلى الأردن"** |
| 24 | 1:36 | 第五站，约旦，<br>佩特拉。 | Night. Dive down the canyon into the drawn Treasury and the lantern sea. | |
| 25 | 1:39 | 这座“宝库”顶上的石罐，<br>全是[弹孔]—— | Push in on the urn at the top: small holes. (Wording waits for facts.md.) | |
| 26 | 1:43 | 有人以为宝藏藏在里面，<br>朝它开枪。 | Drawn: shots ping off the urn; nothing falls out. 你 sits among the lanterns holding one; the polaroid **develops slowly by candlelight**. | **VO (hi): "आप भारत पहुँच गए हैं"** |
| 27 | 1:50 | 第六站，印度，<br>泰姬陵。 | Dive into the drawn 泰姬陵 at dawn. | |
| 28 | 1:53 | 这么美的地方，其实是一座[坟]，<br>一位皇帝为去世的妻子修的。 | Slow push to the dome. In the crowd, everyone faces the Taj; **only 你 turns round** and waves: 咔嚓. Heart sticker on the tray table. | |
| 29 | 1:59 | 已经飞了35967公里，<br>离一圈只差[4108公里]。 | The odometer close up: **35,967 / 40,075**. | |
| 30 | 2:04 | 回家这一段，<br>够不够？ | (centred) The last flight, toward home. | build |
| — | 2:07 | — | The odometer rolls the last leg and slows… | |
| 31 | 2:10 | [39735公里]。 | It stops. **The drop.** The flight ring closes just inside the equator ring. | **drop** |
| 32 | 2:12 | 差340公里，<br>没绕满一圈。 | The two rings, a hair apart. | **VO (zh): 「欢迎回家。」** |
| 33 | 2:17 | 差的那340公里？<br>在长城上走走就补上了—— | **长城, golden hour: 你 takes the only selfie of the trip** (selfie 3). 咔嚓; the polaroid develops: **打卡 7/7**. | |
| 34 | 2:21 | 历代长城加起来，<br>有[21196公里]。 | The wall winding off into the mountains. | |
| 35 | 2:25 | 这一圈，你的7张[打卡照]。<br>截图存好！ | **The finished album:** 7 polaroids + the gold 荣誉 slot, stamps, stickers, captions. Holds still 2 s for the screenshot. | |
| 36 | 2:29 | 你去过几个？评论区打个数字👇<br>真去过的，晒出你的照片！ | | |
| 37 | 2:34 | **End card** (≥ 5.5 s) | 《新世界七大奇迹，你去过几个？》 · the closing question · pill 「关注 Juno · 一起看懂世界」 · 「距离按大圆直线计算：从北京首都机场出发，经6处，回到长城八达岭；720种顺序中最短」 · 「新七大奇迹为瑞士私人基金会2007年发起的投票」 · sources · photo credits. Dim, red J stamp. | fade |
| | ~2:40 | end | | |

## Arrival voice lines: 「XXX欢迎你」 (owner 23:36; ElevenLabs, native voices from the shared library; test before locking)
| Stop | Language | Line | On screen |
|---|---|---|---|
| 墨西哥 | es-MX | ¡Bienvenido a México! | 墨西哥欢迎你 |
| 秘鲁 | es-PE | ¡Bienvenido al Perú! | 秘鲁欢迎你 |
| 巴西 | pt-BR | Bem-vindo ao Brasil! | 巴西欢迎你 |
| 意大利 | it | Benvenuto in Italia! | 意大利欢迎你 |
| 约旦 | ar (Jordanian) | أهلاً وسهلاً بك في الأردن! | 约旦欢迎你 |
| 印度 | hi | भारत में आपका स्वागत है! | 印度欢迎你 |
| 中国 (home, 长城) | zh (standard Mandarin) | 北京欢迎你！(alt: 欢迎回家) | 北京欢迎你 |
Each line about 1.5 s, on a bar just before the stop's first subtitle; the on-screen 「XXX欢迎你」 sits on the arrival board with the original line under it. Native check: the report's Whisper transcript plus the owner's ear.

## v7 plan: 科普 about each monument itself (owner 23:32 「我也想做科普」, 23:36 「about the monument itself」)
Each stop answers one 为什么 / 怎么做到的 about the monument (who built it, why, how it works); the vector drawing turns into a diagram for the answer; the real photo is the proof. Trivia moves onto the 拍立得 (caption, date stamp, sticker) so the subtitles carry the 科普 (about 15 s a stop). No flight / map 科普. **All rows below are unverified** (the fact check was stopped at 23:36 before writing anything).
| Stop | Monument story | 科普 question → answer (diagram) | On the 拍立得 |
|---|---|---|---|
| 奇琴伊察 | Maya temple to Kukulcán, the feathered serpent | 蛇影为什么只在春分秋分？→ the sun sets due west; the stepped corner cuts the light into a row of triangles: the serpent god coming down | 365级 = 一年 |
| 马丘比丘 | Inca royal estate (Pachacuti, mid-1400s) | 地震这么多，没水泥的墙为什么不倒？→ stones cut to fit, walls lean inward; in a quake they shift and settle back | 没用水泥！ |
| 基督像 | 1922–1931; reinforced concrete covered in small soapstone tiles | 它是什么做的？为什么老被雷劈？→ concrete + soapstone mosaic; the highest point on the mountain → lightning rods | date stamp 1931 |
| 斗兽场 | built AD 70–80 | 它为什么少了一半？→ the 1349 earthquake, then centuries as a quarry; the holes = iron clamps pried out | 5万人 |
| 佩特拉 | Al-Khazneh = a Nabataean royal tomb | 没有脚手架，怎么凿？→ carved from the top down | bullet-hole sticker: 「宝藏？没有」 |
| 泰姬陵 | a tomb Shah Jahan built for Mumtaz Mahal | 四座塔为什么往外歪？→ to fall away from the tomb in an earthquake (may be lore) | ♥ |
| 长城 | Ming walls | 砖靠什么粘了几百年？→ 「糯米」: lime mortar with sticky-rice soup | 糯米！ |

## The album (拍立得) kit
- Polaroid: thick white bottom border, slight curl and shadow; it **slides out blank and develops** (blank → drawing-tone → the real photo).
- In the album: washi tape on two corners, a die-cut sticker per stop (snake, llama, lightning, gladiator helmet, lantern, heart, brick), a handwritten caption in 霞鹜文楷 (the stop's fact in ≤ 6 字), a passport-style entry stamp (country name + 「入境」, round or rectangular; no maps, no flags), the boarding-pass stub taped on the first page.
- Slot 8: the grey pyramid outline → the gold 「荣誉」 sticker.
- Doodles: 「我在这！」 with an arrow on one photo; a hand-drawn heart on the Taj.

## Photos and poses (licensed; credits on the end card; never committed)
| Stop | Photo | 你 | Photo moment |
|---|---|---|---|
| 奇琴伊察 | chichen.jpg (poser removed roughly: **a clean tourist-angle replacement wanted**) | shading eyes | we shoot |
| 马丘比丘 | machu2.jpg (owner) | jump | self-timer |
| 基督像 | christ.jpg (Pexels 24039432) | arms open like the statue | lightning = flash |
| 斗兽场 | colosseum.jpg | hands on hips | a passer-by |
| 佩特拉 | petra2.jpg (owner) | sitting, holding a lantern | slow candle-lit develop |
| 泰姬陵 | taj.jpg | turns round in the crowd | crowd |
| 长城 | greatwall2.jpg (owner) | selfie 3 (big head) | the only selfie |

## Facts
See facts.md (researcher, 2026-11-02 night) for the new and pending rows. Already sourced in v5: F1 (2007 vote, China Daily), F2 (21,196.18 km, 新华网), F6 (365 steps, serpent, INAH via Mexico News Daily), F7 (pyramids honorary candidate, Daily News Egypt), F10 (Christ 1931, lightning damage, Fox News), F11 (route, our computation).

## Open
- facts.md verdicts → reword lines 11, 18, 19, 25, 26, 28 if needed.
- The BGM (times snap to its bars).
- Voice test (7 lines).
- A clean 奇琴伊察 photo.
- Look test of one full stop: drawing → viewfinder → developing polaroid → album on the tray table.
