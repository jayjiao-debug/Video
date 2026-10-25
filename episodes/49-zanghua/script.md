# Script: 听不懂，为啥知道在骂人？ (v1)

Screenwriter, 2026-10-25. Files: this script; `lines.json` (42 subtitles, `[[start, end, "text"], ...]`); `vo_lines.json` (42 entries, `{id, text}`, the words the narrator says, numbers in characters).

**Logline:** You hear two clips in a language nobody speaks and pick the one that's swearing. You're right, because you heard the anger. Then a flat machine voice says two made-up words, and you still pick one. A 2022 study did exactly this to 215 people. Without being told, they leaned the same way: away from l, r, w, y.
**Takeaway:** You can hear a swear word coming from two things: the tone (easy, and it works across countries) and, more faintly, the sound itself. Soft sounds like l, r, w, y make a word seem less like swearing. That's a tendency in what we *perceive*, not a law of how swear words are built, and nobody has tested Chinese swear words.
**Length:** 162.7 s (2:43). That's the speech budget at 4.5 字/s plus 0.35 s of breath per line, never under the reading budget (0.5 + 字/7 + 0.6), on a 0.25 s grid, with the guessing pauses added. If 2:40 is a hard cap, the cut is the Tan beat (K1–K5, 16.2 s → 2:26), but I'd keep it (see "Open questions").
**Pace check:** `pace.py lines.json` reports 9.7 s waiting = 6 %, with no TOO FAST lines. Six CHECK gaps are all named beats: the clips, the two choice cards, the title, and the viewer's own pause at E2. The MINOR holds are lines where speech is slower than reading, which is expected in a narrated film.
**Narrator:** a warm, curious man talking to one friend, not a lecturer. He plays a game with you, admits he invented the clips (T2), and says what he couldn't find (X4). 「我」 appears in R5, T2, X4 and E6.

## Title options (≤ 10 字)
1. **听不懂，为啥知道在骂人？** (10). **The search one.** It's how people actually type the question (听不懂 + 骂人/脏话 + 为什么). The film answers it literally: round 1 = tone, round 2 = the sound. It says 骂人 rather than claiming you can spot real foreign swear words, so it doesn't overclaim.
2. **哪个词，更像脏话？** (7). **The participation one.** It's the paper's own task, and it's the game the viewer plays in the film. It promises a test, not a result, and doesn't spoil the twist. The safest cover for the platform too, since it reads as a quiz rather than as vulgar content.
3. **为什么它听着像骂人？** (9). **The perception one.** It's honest about what the study measured: what *sounds* like swearing (L12). 「它」 makes people ask "what is 它?", and the film's first frame answers that (two clips).
- Dropped: 「这两个词，都不存在」. It's a great line but it gives the T1 twist away on the cover (owner's cover rule). 「脏话为什么听着脏」 suggests real swear words share a sound, which L2 doesn't support.
- In the film, the title card sits at 33.4 s, right after 「如果语气一模一样呢？」, as the door into round 2. All three titles work there. The editor moves it onto the track's hardest drop if that's nearby.

## Beat sheet
| Beat | Time | Purpose | What the viewer does / learns / feels |
|---|---|---|---|
| Hook | 0–6.7 | The challenge on frame 0: two clips, one is 骂人, you won't understand a word | Sound on. "OK, let me try." |
| Round 1: tone | 6.7–17.2 | **Clip 1A (angry) 6.7–9.3 · Clip 1B (calm) 9.8–12.4 · Choice card 1: 14.15–17.15** | Commits to A or B. Easy. |
| Reveal 1 | 17.2–33.4 | 答案是A → 两段是同一句话 → you heard 语气 → 9 countries, 七成多 | First 原来如此: it wasn't the words. Then the narrator's real question: what if the tone were identical? |
| Title | 33.4–35.9 | Title card (silent) | |
| Round 2: sound | 35.9–52.8 | Calm machine voice. **Clip 2A "yog" 41.85–44.05 · Clip 2B "tsog" 44.55–46.75 · Choice card 2: 48.75–52.75** | Has to guess with nothing to go on, and still picks one. |
| Twist | 52.8–63.6 | 「其实，这两个词，都不存在。」 The round-1 sentence was invented too, and there's no real swear word in the whole film. | Surprise, then curiosity: "but I still chose." |
| The study | 63.6–88.4 | 2022: 215 people fooled the same way. zog "鸟" → yog / tsog = the pair you just heard. 10次里6次多 picked the one without l r w y (chance = half). The 37 Chinese speakers did too. 「你刚才选的，是B吗？」 | Second 原来如此: their gut did what mine did. |
| Why | 88.4–109.6 | l r w y sound 顺滑. The researchers' guess is that they sound calm, while distress sounds harsh. English speakers add them to soften a swear word (原版12 → 文明版29, on screen). | Third 原来如此: a soft sound = not angry. |
| Human story | 109.6–125.8 | 1861: a patient who could only say "tan", but when angry, always the same one swear. | Swearing isn't just a sound; it's stuck to feeling. Warm, a little moving. |
| Honest limit | 125.8–138.8 | It's about what we *think* sounds like swearing, not how swear words really are; Chinese swear words: I couldn't find anyone who tested them. | Trust: the narrator doesn't oversell. |
| Ending | 138.8–162.7 | Say 来, then 拆, quietly. Which one blocks the air, then bursts out? That's tsog's sound. The paper's Chinese pair was exactly lai and chai. Comment: A or B? | The viewer feels it in their own mouth, and the last fact lands on them. Comments: "B". |

## Lines
Times are nominal (the speech budget). The editor retimes to the music. **Min s** = the window the line needs (max of speech and reading). Facts: row ids in `facts.md`.

| id | Start–End | VO (spoken; numbers in characters) | Subtitle (≤ 16 字; [highlight]) | What the viewer sees | Sound effect (real recording) | Min s | Fact |
|---|---|---|---|---|---|---|---|
| H1 | 0.00–3.00 | 下面两段话，有一段在骂人。 | 下面两段话，有一段在[骂人]。 | Frame 0, already moving: two big cards side by side, **A** and **B**, each with a flat waveform strip waiting. A small 「开声音」 pill sits on the cards (not a separate card, so the hook isn't delayed). The subtitle types out from frame 0. | Small quiet room tone (bed for the whole game section) · a cassette deck's PLAY key being pressed down, on 0.3 s | 3.00 | (game; see T2) |
| H2 | 3.00–6.70 | 你一个字都听不懂。猜猜，是哪一段？ | 你一个字都听不懂。猜猜是哪段？ | Card A slides forward a little, its waveform starts to tremble: about to play. | Room tone | 3.70 | |
| **CLIP 1A** | 6.70–9.30 | *(clip, no narration)* invented sentence, **angry** | (none; on-screen label 「A ▶」) | Card A's waveform draws live as the voice plays: tall, jagged. Card B dims. | Cassette PLAY clunk at the start, STOP click at the end | 2.60 | T2 |
| gap | 9.30–9.80 | | | Card A settles back; card B slides forward. | Room tone | 0.50 | |
| **CLIP 1B** | 9.80–12.40 | *(clip)* the **same** invented sentence, **calm** | (none; 「B ▶」) | Card B's waveform draws: low, rounded. | PLAY clunk / STOP click | 2.60 | |
| Q1 | 12.40–14.15 | A，还是B？ | A 还是 B？ | Both cards side by side, waveforms frozen. | Room tone | 1.75 | |
| **CHOICE 1** | 14.15–17.15 | *(silence: the viewer chooses)* | (none) | **Choice card:** two big buttons 「A」「B」 under 「哪段在骂人？」, a ring counting down **3 · 2 · 1**. | A mechanical kitchen timer ticking, one tick per digit; the bell is NOT used | 3.00 | |
| R1 | 17.15–19.10 | 答案是A。 | 答案是 A。 | Card A flips over: the back reads 「生气」 in red. | One paper card flip | 1.95 | |
| R2 | 19.10–22.35 | 可你仔细听，两段是同一句话。 | 仔细听：两段是[同一句话]。 | Under each waveform, the same line of invented letters types out, identical in A and B (e.g. *Venoka telu, mirado posen kavi*). Letter for letter the same; only the waveforms differ. | (none) | 3.25 | |
| R3 | 22.35–25.35 | 你听出来的不是词，是语气。 | 你听出的不是词，是[语气]。 | The letters fade; the two waveforms grow and overlap: jagged vs rounded. A label 「语气」 on the gap between them. | (none) | 3.00 | |
| R4 | 25.35–29.35 | 九个国家测过：生气，平均七成多听得出。 | 9个国家测过：生气，[七成多]听得出。 | Nine small listener icons in a row (no flags, no map). 76 % of each fills in on average; the number **76%** big. | (none) | 4.00 | T2 |
| R5 | 29.35–33.40 | 可我好奇的是：如果语气一模一样呢？ | 我好奇的是：如果语气一样呢？ | The jagged waveform is pressed flat until both waveforms are the same calm shape. | (none) | 4.05 | |
| **TITLE** | 33.40–35.90 | *(no narration)* | (title card) | Title card, built from the film's own parts (the two cards / the waveform). | (on the music drop) | 2.50 | |
| S1 | 35.90–39.15 | 第二轮，换机器来念，没有语气。 | 第二轮：机器来念，没有语气。 | The two cards come back, now plain grey with a small speaker grille: a machine. 「第二轮」 tag. | Room tone | 3.25 | L5 |
| S2 | 39.15–41.85 | 两个词，有一个是脏话。 | 两个词，有一个是脏话。 | Each card now holds **one** short word slot (blank: the viewer must not see the spelling). | Room tone | 2.70 | L4 |
| **CLIP 2A** | 41.85–44.05 | *(clip)* "yog … yog", flat machine voice | (none; 「A ▶」) | A's waveform: two short, identical blips. | PLAY clunk / STOP click | 2.20 | L7 |
| gap | 44.05–44.55 | | | | Room tone | 0.50 | |
| **CLIP 2B** | 44.55–46.75 | *(clip)* "tsog … tsog", same voice and settings | (none; 「B ▶」) | B's waveform: two blips of nearly the same shape. | PLAY clunk / STOP click | 2.20 | L7 |
| Q2 | 46.75–48.75 | 哪个是脏话？ | 哪个是脏话？ | Both cards side by side. | Room tone | 2.00 | |
| **CHOICE 2** | 48.75–52.75 | *(silence: the viewer chooses)* | (none) | **Choice card:** 「A」「B」 under 「哪个是脏话？」, countdown **4 · 3 · 2 · 1** (longer: harder). | Kitchen timer ticks, one per digit | 4.00 | |
| T1 | 52.75–56.50 | 其实，这两个词，都不存在。 | 其实，这两个词[都不存在]。 | Both cards flip at once: both backs are blank. A stamp 「不存在」 across both. Hold 1 s. **The film's one impact.** | One rubber stamp on paper (the only impact) | 3.75 | L4 |
| T2 | 56.50–59.50 | 第一轮那句话，也是我编的。 | 第一轮那句话，也是我编的。 | The round-1 cards slide back in with the same 「不存在」 stamp. | (none) | 3.00 | (honesty) |
| T3 | 59.50–63.55 | 一个真脏话都没有，你还是选了一个。 | 没有一个真脏话，你却[选了一个]。 | The viewer's choice card from CHOICE 2 slides back in, with the 「A」「B」 buttons and a glowing ring around both: "you chose." | (none) | 4.05 | |
| T4 | 63.55–68.05 | 二〇二二年，有研究这样骗了二百一十五人。 | 2022年，有研究这样骗了[215人]。 | The choice card multiplies into a grid of **215** small choice cards. Stamp: 「— 2022 · Lev-Ari & McKay」. | One paper sheet sliding out across a desk | 4.50 | L3, L4 |
| T5 | 68.05–71.05 | 比如阿尔巴尼亚语的“鸟”，zog， | 比如阿尔巴尼亚语的“鸟”：zog， | One word tile 「zog」 with a small gloss 「阿尔巴尼亚语 · 鸟」 and a simple bird line drawing. Small tag in the corner: 「20种语言，都这样编」. | (none) | 3.00 | L7 |
| T6 | 71.05–74.55 | 换掉一个音，就是你听到的yog和tsog。 | 换掉一个音：yog 和 tsog。 | The **z** tile pops out; a **y** slides in → 「yog」 (left), a **ts** slides in → 「tsog」 (right). They drop onto cards A and B: what you heard. *(Splice the clip audio for "yog"/"tsog" into the VO.)* | Two wooden letter tiles clicking into place | 3.50 | L7 |
| T7 | 74.55–77.80 | 瞎猜是一半。可十次里有六次多， | 瞎猜是一半，可10次里有[6次多]， | A bar of 10 slots; a dashed line at 5 labelled 「瞎猜 50%」, then the bar fills past it to **63%**. | Kitchen timer ticks while the bar fills (ticks only where the number moves) | 3.25 | L6 |
| T8 | 77.80–82.30 | 人们选了没有L、R、W、Y的那个。 | 人们选了没有 l r w y 的那个。 | The filled part of the bar is labelled with the tsog card; four letter tiles **l r w y** float above the yog card, greyed. | (none) | 4.50 | L1, L6 |
| T9 | 82.30–85.80 | 其中三十七个说中文的人，也一样。 | 其中37个说中文的人，也一样。 | 37 of the 215 mini-cards light up (label 「说中文 · 37人」); their own bar also passes the dashed line (no number). | (none) | 3.50 | C1, L8 |
| T10 | 85.80–88.35 | 你刚才选的，是B吗？ | 你刚才选的，是 B 吗？ | Back to the viewer's own choice card; button B glows softly. | (none) | 2.55 | |
| W1 | 88.35–92.10 | 为什么偏偏是L、R、W、Y？ | 为什么偏偏是 l r w y？ | The four tiles **l r w y** big in the centre. | (none) | 3.75 | L1 |
| W2 | 92.10–95.10 | 这几个音，念起来都很顺滑。 | 这几个音，念起来都很[顺滑]。 | Each tile's sound drawn as a smooth, unbroken wave flowing out of it. | (none) | 3.00 | L1 |
| W3 | 95.10–98.35 | 研究者推测：它们听起来更平静。 | 研究者推测：它们听着更[平静]。 | Next to it, a small hand-drawn label 「推测」 (so it reads as a guess). The smooth waves settle like a calm water line. | (none) | 3.25 | L10 |
| W4 | 98.35–102.60 | 而人和动物难受时，叫声往往又粗又刺耳。 | 人和动物难受时，叫声又粗又刺耳。 | A rough, broken waveform beside it, with two simple silhouettes (a person, a cat) as its source. | Optional: one short real cat hiss, quiet (cut it if it's annoying) | 4.25 | L10 |
| W5 | 102.60–105.85 | 英语里，人们想把脏话改文明点， | 英语里，想把脏话改“文明”点， | Two glass jars labelled 「原版」 and 「文明版 (67个)」. **No real word is spelled anywhere:** the original words are only blank grey tiles. | (none) | 3.25 | L11 |
| W6 | 105.85–109.60 | 就会往里加L、R、W、Y。 | 就会往里加 l r w y。 | l/r/w/y tiles drop into the jars: 原版 counts to **12**, 文明版 to **29**. Both numbers stay on screen. | Wooden letter tiles dropping into a glass jar, one clink per count while it rises | 3.75 | L11 |
| K1 | 109.60–112.35 | 可脏话，不只是一串声音。 | 可脏话，不只是一串声音。 | The jars and tiles blur back; one old paper page slides over them. | One page turn | 2.75 | |
| K2 | 112.35–116.35 | 一八六一年，一位病人几乎失去了语言， | 1861年，一位病人几乎失去了语言， | An 1861 casebook page, handwritten ink; stamp 「— 1861 · 布罗卡的病例记录」. A quiet, respectful silhouette of a man in a hospital chair (no face caricature). | Fountain pen scratching on paper, low | 4.00 | B1 |
| K3 | 116.35–118.60 | 只会说一个音：tan。 | 只会说一个音：“tan”。 | In the casebook, the hand writes 「tan, tan」. Label: 「大家叫他 Tan」. | Pen scratch (2 short strokes) | 2.25 | B1 |
| K4 | 118.60–122.35 | 可一生气，他会骂出一句，总是同一句。 | 可一生气，他总会骂出[同一句]。 | One more line appears in the casebook, but it's a blank ink bar (Broca's report doesn't spell it, and neither do we). It appears again in the same place: the same one. | (none) | 3.75 | B1 |
| K5 | 122.35–125.75 | 别的话都丢了，这一句还在。 | 别的话都丢了，这一句还在。 | All the other words on the page fade to nothing; the ink bar and "tan" stay. | (none) | 3.40 | B1 |
| X1 | 125.75–127.75 | 不过，说句实话： | 不过，说句实话： | Back to the 215-card grid from T4, calmer. | (none) | 2.00 | |
| X2 | 127.75–131.75 | 这个研究讲的，是我们觉得什么像脏话， | 它讲的是：我们觉得什么像脏话， | The 63 % bar, relabelled 「觉得像」. | (none) | 4.00 | L12 |
| X3 | 131.75–134.75 | 不是说，脏话真的都长这样。 | 不是脏话真的都长这样。 | A second, empty bar beside it labelled 「真实脏话」 with a 「?」: no clear answer. | (none) | 3.00 | L2, L12 |
| X4 | 134.75–138.80 | 中文脏话呢？我查了，没找到有人测过。 | 中文脏话呢？我没找到[有人测过]。 | A third empty bar 「中文脏话」, marked 「没人测过」. | (none) | 4.05 | C2, C5 |
| E1 | 138.80–141.05 | 最后，你自己试试。 | 最后，你自己试试。 | Everything clears. One clean frame. | Room tone only | 2.25 | |
| E2 | 141.05–144.05 | 小声说一个“来”，再说一个“拆”。 | 小声说一个“来”，再说一个“拆”。 | Two huge characters side by side: **来** and **拆**. | Room tone | 3.00 | |
| **PAUSE** | 144.05–146.65 | *(silence: the viewer says them)* | (none) | Hold on 来 / 拆; each glows in turn (来, then 拆) as a gentle cue for when to speak. | Room tone only, music dips | 2.60 | |
| E3 | 146.65–150.15 | 哪一个，气像是先被堵住，再冲出来？ | 哪个音，气是先[堵住]再冲出来？ | Under each character, a simple air line: under 来 it flows straight out; under 拆 it stops at a small wall, then bursts. The lines draw only after the question, so the viewer feels it first. | (none) | 3.50 | (phonetics gloss, see Open questions) |
| **PAUSE** | 150.15–151.65 | *(silence)* | (none) | 拆 lights up. | | 1.50 | |
| E4 | 151.65–153.65 | tsog，就是这种音。 *(splice the clip "tsog")* | tsog，就是这种音。 | The 「tsog」 card from round 2 slides in beside 拆; same burst line under its ts. | (none) | 2.00 | L7 |
| E5 | 153.65–157.15 | 论文里中文的那一对，正是lai和chai。 | 论文里中文那一对：[lai] 和 [chai]。 | 来 and 拆 turn into 「lai」 and 「chai」 tiles; stamp 「— 论文原表 · 中文词对」. | One paper card flip | 3.50 | C3, L7 |
| E6 | 157.15–161.15 | 第二轮你选了A还是B？评论区告诉我。 | 第二轮你选了 A 还是 B？评论告诉我。 | **End card** comes up under this line: the question big, two buttons 「A」「B」 as the visual, follow pill, sources. | (none) | 4.00 | |
| END | 161.15–162.65 | | | End card holds. | | 1.50 | |

## End card
**Question:** 「第二轮，你选了 A 还是 B？」 It costs one letter to answer, so it invites comments. It also never asks anyone to type a swear word (no 「你知道哪些脏话…」 prompts).
**@ prompt:** 「@一个和你一起玩的朋友，看TA选哪个」
**Sources line:** Lev-Ari & McKay 2022, *Psychon. Bull. Rev.* · Scherer, Banse & Wallbott 2001 · Broca 1861 · 内容含AI配音

## Audio assets
### Narration
- One ElevenLabs Mandarin voice (the owner's pick), warm, mid-pace (~4.5 字/s), smiling on the game lines, plain and honest on X1–X4. Text: `vo_lines.json`.
- Pronunciation: say **L R W Y** as English letter names. Read **lai / chai** as the Mandarin syllables 来 / 拆, and **tan** as "tan". **yog / tsog** in T6 and E4 are **spliced from the round-2 clips**, so they sound exactly as the viewer heard them (don't let the narrator say 约格/次格).

### Invented-word clips (no real word in any language)
| Clip | Content | Voice | Delivery |
|---|---|---|---|
| 1A (answer) | Invented sentence, e.g. ***Venoka telu, mirado posen kavi!*** (~2.3 s) | One ElevenLabs voice clearly **different from the narrator** (e.g. a woman's voice if the narrator is a man), neutral accent, not imitating any real language | **Angry:** raised, clipped, fast, hard onsets, scolding someone in front of you. No shouting into distortion, and no more than ~3 LU louder than 1B, so it's the tone and not just the volume. |
| 1B | **The exact same sentence**, same voice | same | **Calm/friendly:** relaxed, like giving directions. Length within ±0.3 s of 1A. |
| 2A | **yog** /joɡ/, said twice: "yog … yog" (0.5 s apart) | A deliberately plain machine voice (TTS with stability up, style 0, no emotion), **different from both** voices above | Flat, identical pitch contour, same stress (L5) |
| 2B | **tsog** /tsoɡ/ ("ts" as in *cats*), twice | Same voice and **same settings** as 2A | Generate several takes; pick the pair whose length, pitch and loudness match most closely (measure them). |

Checks before use:
1. A Mandarin speaker listens to the round-1 sentence (both deliveries) and to yog/tsog for any accidental 谐音 of Chinese swear words (avoid syllables like *ma*, *sha*, *cao*, *bi* in a stressed position) and for any resemblance to a real language. Change the sentence if anything comes up.
2. The cards never show the round-2 spelling before T1: the test is ears only.
3. If the paper's own stimuli are on OSF (CC BY, link in facts.md L), the real yog/tsog clips could replace 2A/2B. That would be a nice touch ("这就是当年的录音"), but it isn't needed.

### Real sound effects (one family: a quiet desk, paper and analogue objects; few and quiet, under the music except T1)
| # | Sound | Where | Note |
|---|---|---|---|
| 1 | **Small quiet room tone** (a soft air hum, nobody speaking) | Under the whole game section (0–53 s) and the ending (139–163 s), so the guessing pauses aren't dead silence | Very low. It carries the pauses when the music dips. |
| 2 | **Cassette deck PLAY key clunk** and **STOP key click** | Start and end of each of the 4 clips; H1 at 0.3 s (something happens in the first second) | Mechanical, dry |
| 3 | **Mechanical kitchen timer ticking** (no bell) | CHOICE 1 (3 ticks), CHOICE 2 (4 ticks), T7 while the bar fills | One tick per digit; the timer's own clock, not the beat |
| 4 | **Paper card flip** | R1, E5 | |
| 5 | **Rubber stamp on paper** | T1 「不存在」: the film's only impact | |
| 6 | **Paper sheet sliding across a desk** | T4 (the study appears) | |
| 7 | **Wooden letter tiles** clicking into place | T6 (y / ts slot in) | |
| 8 | **Wooden letter tiles dropping into a glass jar** | W6, one clink per count 12 / 29 | Only while the counts move |
| 9 | **Page turn** (old, heavier paper) | K1 | |
| 10 | **Fountain pen scratching on paper** | K2–K3 | Low |
| 11 | *Optional:* one short **cat hiss** | W4 | Cut it if it sticks out |

Sources: BigSoundBank (CC0) via the asset farm, Sonniss GDC, Kenney, Freesound CC0/CC-BY. List every file in `sfx/CREDITS.md`. No generated SFX.

## Platform and caveat checklist
- No real swear word is heard, spelled, subtitled, abbreviated or hinted by 谐音, in any language. Tan's oath is a blank ink bar; the minced-oath originals are blank tiles. No bleeps.
- 63 % is said as 「10次里6次多」 against 「瞎猜是一半」. Nowhere does the film say "most people were right". The only "right answer" is round 1 (tone), and that's backed by T2 (七成多), not by this paper.
- Chinese: only "37 Chinese speakers chose the same way" (C1) and "I couldn't find anyone who tested Chinese swear words" (C2, C5). The paper's Chinese pair is **not** used as the test (C3: 肉/臭 are real syllables); it only appears at the end as a fact about the paper.
- "Calm" is labelled 推测 (L10). Real swear words "really all look like this" is explicitly denied (X3, L2/L12).
- No plosive claim and no bouba/kiki (S3: Mandarin speakers were below chance).
- The ice water / pain beat (P1–P4) is **not** in the film. There was no room for it, and it's a different question (pain, not hearing). So no "骂人能止痛" risk.
- Didn't encourage anyone to swear; the comment prompt asks for one letter.

## Open questions for the director and producer
1. **H1 「有一段在骂人」 is a game statement** that's only half true (1A is invented words said angrily). T2 comes clean (「第一轮那句话，也是我编的」), the same way the paper did with its participants (L4). Please confirm the owner is fine with this deliberate setup-then-confess.
2. **E3 is a phonetics gloss not in facts.md:** 拆/ts are affricates (the air is blocked, then released with friction), while 来/l lets the air flow. That's the textbook definition of an affricate (L7 names ts/ch as affricates). The researcher could add a one-line source if the director wants one.
3. **The Tan beat (K1–K5, 16 s)** is the film's one human story and gives the honest limit its feeling ("swearing isn't just a sound"). It's also the cut if the owner wants ≤ 2:40 (→ 2:26).
4. **The title card at 33.4 s** goes on the music's drop; if the drop is earlier, the ep43 owner note applies: title on the drop, round 1 follows.
5. **The round-1 voice gender:** I suggested a voice of the other gender from the narrator purely for contrast. The angry clip must not read as mocking a gender or a nationality.
