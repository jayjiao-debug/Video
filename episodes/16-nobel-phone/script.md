# Ep16 「诺贝尔奖得主的点子，就藏在你手机里」 — script draft v0 (2026-10-10)

The Economics prize is announced Mon 12 Oct 2026, 11:45 Stockholm (= 11:45 Johannesburg).
The frame (hook + ending) is fixed; the middle is one of two pre-written versions, chosen when the winner is named.
Every fact below is UNVERIFIED until the researcher fills facts.md from primary sources.

Market favourites on 10 Oct (Polymarket / Kalshi): Pakes 20–24%, Athey 13–14%, Woodford 12%, Blundell 10%, Varian 7%.

## Frame (any winner)
| t | line |
|---|---|
| 0:00 | 你刚刚滑过的那条广告 / 你点开的那家外卖 |
| 0:03 | 不是巧合 |
| 0:06 | 背后有一个[经济学公式] |
| 0:10 | 而它的发明者，刚刚拿了[诺贝尔奖] |
| 0:14 | (title on the drop) |
| 1:50 | 诺贝尔经济学奖，听起来离你很远 |
| 1:55 | 可它每天都在你的手机里，[算你] |
| 2:02 | 下次刷到广告 / 换一家店的时候，想想这一秒 |

## Version A — ad auctions (if Athey, Varian, or anyone on auction / platform design wins)
| t | line | fact to verify |
|---|---|---|
| 0:20 | 你每打开一次App | |
| 0:24 | 就有一场[拍卖]，在0.1秒里结束 | real-time bidding ~100 ms |
| 0:28 | 拍的不是东西，是[你的注意力] | |
| 0:34 | 几十个广告主同时出价 | |
| 0:38 | 但出价最高的，[不一定]付最多的钱 | generalized second-price: winner pays next bid |
| 0:44 | 它只付「第二名」的价 | GSP rule |
| 0:50 | 为什么这么设计？ | |
| 0:54 | 因为这样，大家才敢[说真话] | Vickrey 1961 (Nobel 1996) |
| 1:00 | 设计这套规则的人之一：<得主> | Varian: Google chief economist, "Position auctions" 2007 / Athey: Microsoft chief economist, search-ad auctions |
| 1:08 | 一个广告位，能值多少钱？ | |
| 1:12 | 全世界一年：[数字] | global digital ad spend, official source |
| 1:20 | 你看到的每一个广告 | |
| 1:24 | 都是一场你没看见的[比赛]的冠军 | |
| 1:30 | 甚至「猜你喜欢」 | |
| 1:36 | 也在算：你值多少钱 | |

## Version B — choices and switching (if Pakes wins)
| t | line | fact to verify |
|---|---|---|
| 0:20 | 如果你常点的奶茶，涨价2块 | |
| 0:24 | 你会换哪一家？ | |
| 0:28 | 你自己可能都不知道 | |
| 0:32 | 但有人能[算出来] | BLP 1995 (Berry, Levinsohn & Pakes, Econometrica) |
| 0:38 | 把上百万次选择放在一起 | |
| 0:42 | 就能算出：谁和谁，是真正的[对手] | substitution / cross-price elasticities |
| 0:50 | 这套方法最早用来算——汽车 | BLP used US car market data |
| 0:56 | 现在，监管用它判断：两家公司能不能[合并] | merger simulation in antitrust practice |
| 1:04 | 合并之后，你会不会[多花钱] | |
| 1:12 | 平台用它决定：给你推哪一家、定多少价 | |
| 1:20 | 你每一次「换一家」 | |
| 1:24 | 都是一个[数据点] | |
| 1:30 | 你以为你在点外卖 | |
| 1:36 | 其实你在帮经济学家[填一张表] | |

## Fallback (Woodford, Blundell, others)
Same frame; the phone moment becomes 房贷利率 / 工资条 / 个税App:
- Woodford: why the central bank only "says" it will cut rates and prices already move (expectations).
- Blundell: why a tax change shows up in how many hours people choose to work.
Decide Monday; if no phone story is honest, say so and switch to idea 1 (双十一满减).

## Plan
Sat–Sun: research both A and B, build shared scenes (phone UI, tap → auction / choice grid), pick music.
Mon 11:45: winner named → lock version, fill name, photo-free (no real portraits), render on the farm, deliver the same day.
