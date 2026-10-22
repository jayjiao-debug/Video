# Script: 《七宗罪》梗图版 (v2, screenwriter revision after gate 3 r1)

**Logline:** Seven everyday moments, seven meme characters, and under each sin, a normal feeling turned up too loud.
**Takeaway:** 七宗罪不是怪物，是放大版的你：嘴硬是心虚，酸是想要，懒是累，馋的是想象。
**Length:** 59.46 s (music grid unchanged: reveals on bars 3, 6 … 21, title on bar 27).
**Files:** `lines_v2.json` (per-scene fields + times), `lines_v2_pace.json` (flat `[start,end,text]` for pace.py).

## Notes → what changed

| Note | What changed |
|---|---|
| Director 1 (intro on the cast; line 1 to the viewer) | Line 1 is now 七宗罪，你每天都在犯。 (9 字, typed from frame 0 over the seven "?" stickers). Gregory becomes a small caption: 6世纪由教皇格里高利一世列出 (14 字). It is a sentence, not a "——" attribution, so it can't be read as Gregory saying line 1. |
| Director 3 (text diet) | Each scene is context (≤7) → quote in the silhouette's bubble (≤6) → reveal + 七宗罪之X + name → quip in the meme's bubble → closing at +2 beats. No quip repeats its quote any more (before: 4 of 7 did). |
| Director 5 / 9d (sizes, ？) | Lines are short enough for 56 px context and 52 px bubbles. Every ？！ is full-width. Bubbles ending in ？ (scenes 1, 3) need the ½-em pull-back (animator). |
| Director 8 (thesis) | 七个梗，七个放大版的你。 (10 字), shortened from the suggested 14 字 line. Reasons below. |
| Director 9a (凭什么 ×2) | Quote openers are now 我？/ 恭喜 / 你再 / 明天 / 还能 / 就吃 / 最后. All seven differ. |
| Director 9b (被看见 ×2) | Key words are 心虚 / 成为 / 自己 / 累 / 失去 / 胃 / 想象. All seven differ, and 被看见 is gone. |
| Director 9c (袋鼠 quip) | I kept 你的胆子真是肥嘟嘟的啊 and changed the setup instead: 对方等你道歉 → 我？先低头？ The meme line now has a clear speaker (the crowned kangaroo) and a clear target (the person asking for an apology), so it reads as pride talking down. The fallback is 本王，从不低头。 |
| Cold read: 色欲 logic + 他 | New context 又点开ta主页 (ta, gender-neutral). The closing 你馋的，是想象里的ta。 follows from looking at someone's curated photos. |
| Cold read: 贪婪 setup | 存款 → 背包都满了 / 还能塞！, the same looting world as 再摸一个包就撤。 |
| Cold read: 嫉妒 "废话文学" | The closing is now 酸谁，就是想成为谁。 The quip is now a two-faced gag: 恭喜恭喜！ before the reveal, then 运气好而已。 |
| Producer: no shared opener / key | Checked across all slots (table at the end). |
| Not changed (director's keep list) | Closings for 暴怒, 懒惰, 贪婪 and 暴食 are word for word. So are the outro question 你心里，哪一宗罪最大声？, the 再摸一个包就撤。 quip and the "X，是Y" closing formula. |

## Title options (post title)
1. **七宗罪，但全是热梗** (8 字). The cold reader's pick. "X，但Y" shows the contrast at a glance (a serious term next to memes) and promises exactly what the film is. Nothing is overclaimed.
2. **刀盾狗是暴怒，你呢？** (8 字). It opens with the most recognisable pairing in the film (cold read: "满分"), then hands the question to the viewer, which drives comments. It matches the end-card question.
3. **七宗罪，你每天都在犯** (9 字). The film's own first line, so title and hook confirm each other. The mild provocation ("我才没有") makes people want to check, and the seven everyday moments pay it off. It is hyperbole, not a false claim.

Recommendation: **1** for reach. Use **2** if the producer wants comment bait.

## Timing and reading budget (honest version)
The grid is locked (director's keep list), so each scene has **2.03 s before the reveal** and **4.05 s after it**.
The brief's "~4 s before the reveal" doesn't exist on this grid. I cut the lines to fit the real windows instead:

| # | Pre-reveal units (context+quote) | Needs @7字/s | Have | Post-reveal units (quip+closing) | Needs (0.5 + name 0.6 + n/7 + 0.6) | Have |
|---|---|---|---|---|---|---|
| 1 傲慢 | 6+4 = 10 | 1.93 | 2.02 | 11+5 = 16 | 3.99 | 4.06 |
| 2 嫉妒 | 6+4 = 10 | 1.93 | 2.03 | 5+8 = 13 | 3.56 | 4.05 |
| 3 暴怒 | 5+5 = 10 | 1.93 | 2.03 | 4+9 = 13 | 3.56 | 4.05 |
| 4 懒惰 | 4+4 = 8 | 1.64 | 2.03 | 6+10 = 16 | 3.99 | 4.06 |
| 5 贪婪 | 5+3 = 8 | 1.64 | 2.02 | 7+8 = 15 | 3.84 | 4.06 |
| 6 暴食 | 4+4 = 8 | 1.64 | 2.03 | 6+9 = 15 | 3.84 | 4.05 |
| 7 色欲 | 6+4 = 10 | 1.93 | 2.03 | 7+9 = 16 | 3.99 | 4.05 |

- **pace.py:** no line is TOO FAST. Its "61 % waiting" is an artefact of stacked elements: name and bubble are labels that stay up while the next line is read. Counting reading in order, the slack is ~0.1–0.5 s per scene, plus the designed holds (intro line 1 while the caption types; question 6.1 s and thesis 4.6 s as the director's 画面停顿 in bars 24–27). That totals ≈ 11 s, ≈ 19 %. Most of it is the deliberate end hold.
- **At the producer's 4–5 字/s nothing fits a 3-bar scene** (pre-reveal needs ~2.1–2.5 s, post ~4.3–4.9 s). The grid, not the words, is the limit. Three cheap aids for the animator: start the context line on the iris (~¼ beat before the bar line); show the quote bubble at +¼ beat, not +½; and let the closing line hold through the first ¼ beat of the next iris.
- The gap 46.7–48.7 is the director's bar-23 sticker fly-in (a named visual beat).

## Beat sheet
| Beat | Time | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook | 0–4.1 | Seven "?" silhouettes + 七宗罪，你每天都在犯。 | "Me? And who are these seven?" The guessing game starts on frame 0. |
| Scenes 1–7 | 4.1–46.7 | moment → "who's talking?" → meme reveal → gag → sting | Each sin is a moment I've lived. Each meme is the perfect face for it. Each sting names the normal feeling underneath. |
| Collect | 46.7–48.7 | Stickers fly onto the ring | All seven together |
| Question | 48.7–54.8 | 你心里，哪一宗罪最大声？ in the still circle | Picks one: the comment |
| Payoff | 54.8–59.5 | Title slam + 七个梗，七个放大版的你。 | The film's 原来如此 in one line |

---

## Intro (0–4.12)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| line1 (≥84 px, typed from frame 0) | 七宗罪，你每天都在犯。 | 9 | Seven silhouette stickers in their sin-colour discs, white "?", popping one per beat | The topic in the first three characters, then the viewer ("你"), then a claim mild enough to provoke "我才没有". With seven mystery shapes under it, the eye asks two things at once: am I? who are they? It's a statement, not a question (owner formula: let the viewer ask). | 人心里，藏着七宗罪。 (true, but about "people", not me; no bite) · 七宗罪，你今天犯了几宗？ (asks the question for the viewer) · 七宗罪，但全是热梗 (better as the post title; on screen it explains the joke before it lands) · 你身上，住着七宗罪。 (softer, less scroll-stopping) |
| caption (≥40 px, from 1.0 s) | 6世纪由教皇格里高利一世列出 | 14 | Small, under line 1 | Verified (Britannica: first enumerated in the 6th century by St. Gregory the Great). A full sentence, so it can't be misread as Gregory saying line 1. I left out "首次", since Evagrius had an earlier list of eight. | ——公元6世纪，教皇格里高利一世 (dash attribution: looks like Gregory said "你每天都在犯") · 公元6世纪，教皇格里高利一世首次列出 (17 字, and "首次" is debatable) |

Hard questions. *Screenshot?* No, but it doesn't need to be: its job is to stop the thumb, and topic + "你" + seven "?" does that. *Surprise?* The surprise is the cast, which is why line 1 shouldn't give the meme gimmick away.

---

## Scene 1 · 傲慢 · 美团袋鼠 (4.12 / reveal 6.14 / closing 7.16 / end 10.20)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context (56 px) | 对方等你道歉 | 6 | Left column, purple silhouette right | Sets up who is being spoken to, which the cold reader couldn't tell in v1 | 明知错了不道歉 (7, but then the quip has no target) · 冷战第三天 (good image, but the quip needs a person demanding something) |
| quote (bubble from silhouette) | 我？先低头？ | 4 | Bubble from the "?" kangaroo | Two ？ make it indignant, not a sincere question. Pride in four characters. | 凭什么我先低头？ (shares 凭什么 with 嫉妒) · 我又没错。 (flat) · 谁先低头谁就输。 (7; good line, but over the 2-s budget) |
| name | 七宗罪之一 · 傲慢 Superbia | | Crown drops on the kangaroo | | |
| quip (bubble from meme) | 你的胆子真是肥嘟嘟的啊 | 11 | Crowned kangaroo, chin up | The meme's own line, now aimed at the person asking for an apology: "you dare ask *me*?" Condescension is pride. The crown makes it a king talking down. People who know the meme laugh at recognition; people who don't still get a royal brush-off. | 本王，从不低头。 (fallback: clean and short, but cute rather than funny, and it drops the meme's voice) · 错的不是我，是这个世界。 (cold reader; 中二 and funny, but it's the 傲慢 cliché and 12 字 would overrun) |
| closing (key 心虚) | 嘴硬，是[心虚]。 | 5 | Left column under the name | The crown deflates. The kangaroo's bravado is a cover, and 心虚 ties straight back to "you know you were wrong". Five characters: the shortest sting in the film, so it fits after an 11-字 quip. | 不肯低头，是怕被看见不够好。 (13; shared 被看见 with 色欲, over budget) · 傲慢，是怕自己不够好。 (textbook) · 嘴硬，是因为心虚。 (8; the same idea with more words) |

Hard questions. *Funny or cute?* Funny, if the setup lands; that's why the context now names 对方. *Surprise?* "Pride = insecurity" is known, but 嘴硬/心虚 says it in the viewer's own words, so it reads as a 戳 not a lecture.

## Scene 2 · 嫉妒 · 奶蛙 (10.20 / 12.23 / 13.24 / 16.28)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context | 朋友考研上岸 | 6 | Green silhouette | 上岸 is *the* milestone for 18–25 (考研/考公). It hurts more than "升职". | 刷到朋友升职 (fits 30-year-olds) · 室友脱单了 (more 色欲 territory) |
| quote | 恭喜恭喜！ | 4 | Bubble from silhouette | Jealousy's public face. The viewer has typed exactly this in a group chat. | 凭什么不是我？ (repeat opener; also says the quiet part out loud too early) |
| name | 七宗罪之二 · 嫉妒 Invidia | | Frog's eyes flare green, flame tongues | | |
| quip | 运气好而已。 | 5 | Frog, chin on hand, side-eye | The two-faced gag: 恭喜 out loud, then "just lucky" in the thinking-frog pose. Writing off someone's win as luck is the most recognisable jealousy move there is. | 赞点了，酸了一宿。 (cold reader; good, but explains rather than shows) · ta就是运气好。 (the pronoun adds nothing) · 凭什么不是我？ (v1 repeat) |
| closing (key 成为) | 酸谁，就是想[成为]谁。 | 8 | | Turns envy into information: who you envy shows who you want to be. That's a useful 原来如此, not 废话文学, and it answers "运气好而已" (you dismiss them, but you want their life). | 嫉妒，是你也想要。 (v1; "废话") · 酸的，是你想要却没说的。 (10; good, but 你 opener clashes with 色欲) · 嫉妒，是一张愿望清单。 (pretty metaphor, slower to get) |

*Screenshot?* 恭喜恭喜！ → 运气好而已。 is the most screenshot-able pair in the film.

## Scene 3 · 暴怒 · 刀盾狗 (16.28 / 18.31 / 19.32 / 22.36)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context | 被人阴阳了 | 5 | Red silhouette (knife + shield) | 阴阳 (a sarcastic jab) is the Gen-Z trigger. It also matches the quote: someone *said* something. | 被人插队时 (doesn't match 你再说一遍, since nobody spoke) |
| quote | 你再说一遍？ | 5 | Bubble from silhouette | The universal escalation line. Kept from v1 because it's right; now it isn't repeated in the quip. | |
| name | 七宗罪之三 · 暴怒 Ira | | Dog roars; on bar 10 (20.34) a hit-stop and the disc cracks | | |
| quip | 我很冷静！ | 4 | Dog mid-roar, knife up, shield up | Irony: a roaring dog with a knife and shield insists it's calm. Every angry person says this. It also plays well over the hit-stop freeze. | 刀盾已就位，你再插一个？ (cold reader; 插队 setup, 11 字) · 你再说一遍？ (v1 repeat) · 我只是想讲道理。 (7; the same irony, weaker) |
| closing (key 自己) | 怒火，最先烧的是[自己]。 | 9 | Sits in the bar-10 quiet | **Kept** (director's keep list). The cold reader found it a bit 课本; it earns its place by landing in the film's one silence, and after a gag. | 气到最后，只剩你自己。 (not clearly better, and it would break the keep list) |

## Scene 4 · 懒惰 · 牛来 (22.36 / 24.39 / 25.41 / 28.45)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context | deadline前一晚 | 4 units (9 glyphs) | Blue silhouette (bull) | Every student's lived moment | ddl前一晚 (shorter, but not everyone reads ddl) |
| quote | 明天再说。 | 4 | Bubble | Laziness's motto, and it sets up the calendar flipping to 明天 | |
| name | 七宗罪之四 · 懒惰 Acedia | | TO DO calendar flips 周一→…→**明天** (big) | | |
| quip | 牛来了，魂没来。 | 6 | Deadpan yellow bull | Plays on the meme's name (cold reader asked for it) plus the "人在魂不在" feeling, and the dead-eyed face is the punchline. | 牛来了，但没完全来。 (8; a more meme-y format, but over budget with a 10-字 closing; keep as the alternative if the closing ever shortens) · 牛马，今日休业。 (good pun, but 牛马 is about overwork, not laziness) · 摆烂中…… (v1; generic) |
| closing (key 累) | 懒，有时是[累]到不想面对。 | 10 | | **Kept** (keep list; the cold reader nodded). Key narrowed to the single word 累. | |

## Scene 5 · 贪婪 · 三角洲鼠鼠 (28.45 / 30.47 / 31.49 / 34.53)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context | 背包都满了 | 5 | Gold silhouette | The same world as the loot joke (producer + cold reader). 都 says "already more than enough". | 存款又多了一点 (20-year-olds have none) · 购物车满了 (包 pun is cute, but drifts away from 三角洲) |
| quote | 还能塞！ | 3 | Bubble | Greed in three characters, and visual: you can picture the zip straining | 还不够。 (more abstract) · 还能再塞点。 (5; the same joke, longer) |
| name | 七宗罪之五 · 贪婪 Avaritia | | Loot bags pile up in the disc, one per beat | | |
| quip | 再摸一个包就撤。 | 7 | The mouse in its headset | **Kept**: the film's biggest laugh. Players know the next second is 寄. | 再摸一个包就撤…（已寄） (spells out the joke the viewer enjoys finishing) |
| closing (key 失去) | 想要更多，是怕[失去]。 | 8 | | **Kept**. With 鼠鼠 it carries an extra irony: the fear of losing is exactly what gets you 寄. | |

## Scene 6 · 暴食 · 哈基米 (34.53 / 36.56 / 37.57 / 40.61)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context | 凌晨1点 | 4 | Orange silhouette | Kept the time of v1's best-loved scene (cold reader: "凌晨一点刷到会被戳"). The digit avoids an echo with the quote's 一口. | 减肥第一天 (funnier setup, but it points at willpower, while the closing points at emotional hunger) |
| quote | 就吃一口。 | 4 | Bubble | The famous last words | 就吃一点。 (v1; changed so the quip can escalate it) |
| name | 七宗罪之六 · 暴食 Gula | | Takeout boxes stack on the tray, the 5th wobbles | | |
| quip | 曼波~再来亿口。 | 6 | Hungry cat with tray | 曼波 brings the meme's sound. 亿口 (the 亿点点 meme) turns "one bite" into a hundred million as the boxes pile up. Escalation is the joke. | 曼波~就吃一点。 (v1; repeat) · 曼波~再点一份。 (cold reader; good, but literal) |
| closing (key 胃) | 填不满的，往往不是[胃]。 | 9 | | **Kept**: the film's best closing | |

## Scene 7 · 色欲 · 草地牛 (40.61 / 42.64 / 43.65 / 46.69)
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| context | 又点开ta主页 | 6 | Pink silhouette | 又 = for the umpteenth time. ta = anyone, any gender. 主页 = a feed of curated photos, which the closing pays off. | 一遍遍刷他的照片 (他 excluded half the audience; 9 字) · 深夜翻ta主页 (night again, right after 凌晨1点) |
| quote | 最后一眼。 | 4 | Bubble | Said every single time, which makes it the joke | 再看一眼。 (v1; shares 再 with 再摸一个包, and the quip repeated it) |
| name | 七宗罪之七 · 色欲 Luxuria | | Bigger hearts float up | | |
| quip | 千万别手滑点赞。 | 7 | Cow with a smouldering stare | A shared 社死 fear (liking a three-year-old photo). The intense stare now reads as concentration, which makes the cow's look funny instead of just cute. | 已经翻到三年前了。 (also great, but the same escalation shape as 曼波~再来亿口) · 我只是路过。 (cute irony, weaker) |
| closing (key 想象) | 你馋的，是[想象]里的ta。 | 9 | | Its own insight, and it follows: you are looking at curated photos, so what you crave is the ta you imagined. 馋 is the playful Gen-Z word for lust (馋ta身子), so it stays light without being prudish. It explains why the feeling fades once you really know someone, which is the 原来如此. | 渴望，是想被看见。 (v1; logic reversed, and 被看见 was shared) · 看不够的，是得不到的。 (cold reader; correct but well-worn, 得不到的永远在骚动) · 让人上头的，是想象里的ta。 (11; over budget) |

---

## Outro
| Slot | Line | 字 | Picture | Why it works | Rejected |
|---|---|---|---|---|---|
| question (48.72–54.81) | 你心里，哪一宗罪最大声？ | 10 | Seven stickers on the still ring | **Kept** (keep list). It drives comments, and 最大声 echoes the speech bubbles. | 你是哪一只？ (cuter, but loses 七宗罪) |
| thesis (54.81–59.46, 56 px under 七宗罪) | 七个梗，七个放大版的你。 | 10 | Under the slammed title | A callback to what we showed (梗), with the parallel 七个/七个 rhythm. 放大版 is colloquial and slightly funny ("the turned-up version of you"), and it keeps the director's key idea: sins are normal feelings amplified, which every closing line showed. 10 字 reads in the 4.6 s next to the title; the 14-字 version competes with the slam. It also bookends line 1 (你每天都在犯 → 放大版的你). | 它们不是七个梗，是七个被放大的你。 (director; right idea, but 14 字 and "不是X是Y" is a worn frame) · 它们不是七个怪物… (v1; we never showed monsters) · 笑完才发现，七个都是你。 (punchy, but loses 放大, so it overclaims "you ARE all seven") · 七个梗，七面镜子。 (elegant but needs decoding) |

## Uniqueness check (producer constraint)
- **Context openers:** 对方 / 朋友 / 被人 / deadline / 背包 / 凌晨 / 又 (all differ).
- **Quote openers:** 我？ / 恭喜 / 你再 / 明天 / 还能 / 就吃 / 最后 (all differ).
- **Quip openers:** 你的胆子 / 运气 / 我很 / 牛来 / 再摸 / 曼波 / 千万 (all differ). Across slots, only the one-character pronouns 你 and 我 recur. No phrase repeats the way 凭什么 did.
- **Closing openers:** 嘴硬 / 酸谁 / 怒火 / 懒 / 想要 / 填不满 / 你馋 (all differ).
- **Key words:** 心虚 / 成为 / 自己 / 累 / 失去 / 胃 / 想象 (all differ; none reused).
- **Facts:** the only factual claim is the caption (Britannica, verified in the brief). Everything else is opinion or a joke.

## Open questions for the director / producer
1. Is 你的胆子真是肥嘟嘟的啊 clear enough now that 对方等你道歉 sets the target? If the next cold read still asks "who's talking to whom", swap in 本王，从不低头。 (6 字). Nothing else changes.
2. The ~4-s pre-reveal window in the producer's brief doesn't exist on the locked grid (it is 2.03 s). The lines are written for 2.03 s. If the producer moves the reveal, this budget changes.
