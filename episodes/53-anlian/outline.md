# Outline agreed with the owner (2026-10-28) — the screenwriter builds script.md from this

## Owner decisions
- **Hook = 结局先行 (ending first), then a REWIND.** 狗血 is fine. The film opens on the sad ending, then rewinds three years.
- **Music:** `music/bgm.mp3` (same track as ep52; map in `music/music_map.md`). Film ends at **122.43 s**, fade 120.39 → 122.43.
- **Visuals must be coded** (Remotion + three.js / SVG / canvas). **No AI-generated images in the film.** The watercolor
  frames in `style/hook_concept/` are a mood reference only (light, 治愈, handmade, tiny planets, cute characters).
- The story is a **fictional illustrative scenario**; say so once in the lines (e.g. 「这样的故事，你身边一定有」).
  Facts on screen only from verified rows of `facts.md` (rows 5, 6, 7, 8; rows 1–4 as mechanism only, no numbers;
  rows 10–11 never). Regret line must be hedged (「更可能」), never 84 %.

## Structure on the music (times = music_map.md)
| Music | Time | Story |
|---|---|---|
| Intro hits 1.35 / 3.39 / 5.42 / 7.46 | 0 – 9.5 | **Present day, ending first.** Frame 0 subtitle: 「三年后，她收到他的婚礼请帖」 (red invitation on her tiny planet; card opens on 1.35). 「新娘不是她」 (far planet: wedding arch, groom + a bride with clearly different hair; reveal on 3.39). An old note with a heart slips out of the invitation: 「那天她才知道，他也喜欢过她」 (5.42 / 7.46). |
| hit 9.49 → 16.61 | 9.5 – 16.6 | 「那三年里，到底发生了什么？」 then the **REWIND**: everything plays backwards fast — petals fly back up, the note slides back into the card, the card back into its envelope, the planets spin backwards, a calendar / counter runs back 「−3年」, with a tape-rewind feel (handmade: paper flutter, speed lines, a rewind ◀◀ mark). The rewind must accelerate and **land exactly on 16.61** (first big entry). |
| 16.61 | | **三年前** + title on the entry: 为什么，没有人先开口？ (or one of the 3 titles you propose) |
| Section A 16.61 – 49.17 (fills 30.86, 46.63) | | Three years ago: her side. She likes him and thinks it shows (a big heart floating over her head). The **illusion of transparency** numbers as "about you" beats every 6–8 s: liars think 48.8 % can see through them, really 25.6 % (= guessing); the bad drink: 4.91 of 10 vs 3.56. From his point of view, her heart is tiny/invisible. 「你以为自己暗示得很明显，对方根本没收到」 (row 4, no number). |
| Break 49.17 – 65.45 (quiet) | | The night she almost said it: she types, deletes, 「没事，晚安」. Quiet, intimate, slow. |
| Risers 63.42 / 63.93 / 64.43 / 64.94 | | Count-in: four cuts/pops switching to HIS planet — he is doing exactly the same thing. |
| Build 65.45 – 81.73 | | The mirror, set up: 「她没开口，因为怕被拒绝」/「他看到她没开口，心想：她对我没兴趣」/ and the same for him. |
| **DROP 81.73** | 81.73 – 111.75 | **Reveal:** 「同一个沉默，两个人都读成了『不』」 — split screen, both heads, the same silence read as "not interested". 「你给自己的沉默找理由：我怕；却不给对方同样的理由」. Then the **liking gap** (row 7): after 5 minutes of talking people underestimate how much the other likes them; roommates kept misreading until the next February. |
| Fill 111.75 / 112.25 / 112.76 / 113.27 | 111.75 – 114.3 | Fast-forward back to the present (the reverse of the opening rewind): the invitation again — bookend. |
| Last phrase 114.29 – 122.43 | | 「多年以后，人更可能后悔没说的话」/「也许ta，也在等」/ last line = 发给谁: 「发给那个你一直没开口的人」. A paper plane (or a sent message) finally crosses from one planet to another. Fade 120.39 → 122.43. End-card question: 你有没有一句，一直没说出口的话？ |

## Visual direction for the picture column (coded)
- Tiny round planets (three.js, soft toon shading, pastel; or SVG/canvas) floating in a light sky; paper grain and
  watercolor-edge treatment done in code (SVG feTurbulence / displacement, noise textures).
- Two original cute characters (SVG puppets or simple 3D chibis): **她** short dark bob + yellow knitted sweater;
  **他** short messy dark hair + navy sweater (black suit at the wedding). The bride must have long or pinned-up hair.
- Every scene says what moves and how it explains the line; transitions and big effects on the listed hits / bar lines.
