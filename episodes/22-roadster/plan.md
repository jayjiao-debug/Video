# ep22 Roadster — plan v1 (for owner review)

Title (recommended): 倒挂靠抽气，起飞靠喷气 · alt: 车开上天花板，凭什么不掉？ / 会"飞"的车，其实是一口气
Look: 落日试车场 — golden hour (apricot horizon → cobalt zenith), bone-white spiral wall inside graphite hoops with warm light strips,
signal-red original car. Explain mode = time freezes, world cools, car turns to glass; air = glass-cyan arrows, thin air/fans = amber,
jets = frost white, numbers gold. Key frames: pitch/.

Music (measured): kick pattern repeats every 3.474 s, bars at 0.12 + 3.474k (92 BPM is the triplet pulse); quiet 20.97–27.91 and
69.64–76.59; 4-bar fills at 12.50 / 40.31 / 54.22 / 68.12 / 82.02 = the five big hits. Film ends 90.49 (bar 26), fade 87.02–90.49.

| time | picture | subtitle |
|---|---|---|
| 0.12 | car already on the wall, chase cam | 这车正往一面墙上开 |
| 3.59 | wall twists steeper | 墙越来越陡，它还在[加速] |
| 7.07 | passes 90° | 直到整辆车[倒过来] |
| 10.54 | reaches ceiling; 12.50 hit = stops | 然后，它[停]在了天花板上 |
| 14.01 | side-below view, title plaque | (title) |
| 17.50 | hanging still | 停着都不掉，靠的不是速度 |
| 20.97 | FREEZE, x-ray, fans pull amber air out | 车底有风扇，把空气[往外抽] |
| 24.44 | arrows of outside air rise | 车底空气少了，外面的就把它[按住] |
| 27.91 | groove back: 约40吨 pops | 车底约4㎡，外面空气推着约[40吨] |
| 31.40 | 约2吨, 约5% pop | 车只有约[2吨]：少约[5%]就够 |
| 34.88 | drives off the top | 然后，它从顶上[冲了出去] |
| 36.61 | mid-air freeze, tanks + 10 nozzles | 车里塞满了[高压气瓶] (HUD: 据报道 600升 / 10个喷口) |
| 40.31 | hit: one side fires, flips upright | 一侧猛喷，车就[翻个身] |
| 45.30 | down jets brake; 48.79 lands | 往下喷，落地前[刹一下] |
| 48.79 | drives at the row of clay cars | 再来：前面停着[一排车] |
| 52.26 | jets charge | 这次，往下[猛喷] |
| 54.22 | hit: take-off; 55.73 slow-mo flip | 一边喷，一边在空中[翻转] |
| 59.21 | | 特斯拉称：推力是抓地力的[4–5倍] |
| 62.68 | | 还说：0到60英里/时[不到1秒] |
| 66.17 | 68.12 hit: landing burst | 这些都还[没人实测过] |
| 69.64 | quiet: rolls to a stop, version cards | 会飞的版本：[单座]，受邀才能买 |
| 73.11 | | 也[不能上路]；能飞多久，[没公布] |
| 76.59 | downbeat: 2028 pops | [2028]年，才开始量产 |
| 80.06 | | 最便宜的版本，定金[5万美元] |
| 83.53 | camera rises, recap | 倒挂靠[抽气]，起飞靠[喷气] |
| 87.02 | Juno end card, fade | 你最想看它跳过什么？ |

## v5 build log (2026-10-16)
- Title: 倒挂靠抽气，起飞靠喷气 (owner OK). Built by me, no agents.
- Render: Modal T4 ×10 via modal-farm (`render_ep22.py`, Vulkan, "NVIDIA Tesla T4" confirmed), ~95 ms/frame, ~1.5 min per full film.
- 穿模 check over all 2,715 frames (`chk.mjs`, `mar.mjs`): 0 bad frames. Minimum clearances: body to wall 2.5 cm (wheels on the true surface,
  per-wheel suspension), body to ground 1.5 cm, car over the clay row 2.66 m, camera ≥1.1 m inside the tube wall, camera ≥3.2 m from the car.
- Fixes on the way: NaN black frame (glass roughness too low → specular overflow in bloom; NaN guard pass added), light-shaft gather
  flicker (removed), camera roll levelled near the ceiling so the car reads upside down, take-off camera, run-out orbit, ending pull-back.
- Sound: song untouched 0–90.49 s, cos² fade over the last bar (87.02–90.49); synthesized compressed-air hisses, two landing thumps, one skid;
  SFX RMS ≤ music RMS (−2 dB max).
- Deliverables: 倒挂靠抽气，起飞靠喷气.mp4 (send, 18.9 MB), _高清原片.mp4 (138 MB, not committed).
