# 《为了跟你说一句话，人类努力了三千年》· brief v3（producer，2026-10-24 00:10）

The owner reviewed v2 (`out/三千年_v2_发送版.mp4`, 3:08) at midnight. He wants a **film-grade masterpiece** by morning,
made by the whole crew, with no logical errors in props, animation or visuals, and with creative camera moves (运镜)
and transitions (转场). He is asleep: decide, record what you decided, keep going.

## What the film is
- A relay through 3,000 years. Each era's person tries to get a sentence to someone far away.
- **Title:** 《为了跟你说一句话，人类努力了三千年》
- **Hook (0:00):** 「人类打出的第一通电话，第一句话说的是什么？」 It is answered at Bell: "Mr. Watson — come here — I want to see you." (我想见你)
- **Core:** 人类发明的每一种传话方式，都是为了离想见的人近一点。
- **Ending:** the Voyager Golden Record (1977). Ann Druyan's phone call to Carl Sagan ended in their engagement. The record's Mandarin greeting is 「各位都好吧？我们都很想念你们，有空请到这儿来玩。」
- **Comment question:** 「你最想对谁说一句话？」
- **Format:**
  - 1920×1080, 30 fps, about 3:00.
  - Narration changes language with the scene: zh for 商 / 杜甫 / 北京; en (American) for Morse / ARPANET / 1977; fr for Scott; en (Scottish) for Bell; it for Marconi.
  - Each person's quote is voiced by a different voice.
  - Subtitles: Chinese always; the native line above it when the line is not Chinese.
  - **Every story caption is voiced** (owner note).

## Owner notes on v2 (2026-10-24 00:01) — each one must be visibly fixed
1. **Era-correct props; nothing floats** (杜甫 shot): no Western envelopes in 757, and no cities or walls floating above the ground. Every layer's buildings stand on that layer's own ground or hill.
2. **The opening is boring.** v2 was a still room with a caption. The first seconds must move and promise.
3. **The rewind:** rewind signals (◀◀ REW, tracking noise, timecode running backwards) and much faster. Flashes of a few frames each, about 2 s total.
4. **Characters:** one flat tone, recognisable, human. v2 had lighter far limbs, visible segments and odd legs.
5. **No unrecognisable props.** Morse's white stepped "tape" read as junk ("What the heck is that").
6. **Bell:** too static. Show one man in one room; push in as he speaks; then travel **inside the wire** into the other room, where Watson hears.
7. **No silent story captions.** "这是人类第一通电话里的第一句话" had no voice.
8. **Marconi was illogical.** What does a kite flying away have to do with "S"? State the setup:
   - Poldhu, Cornwall sends the single letter S again and again.
   - In Newfoundland, a kite lifts the receiving aerial.
   - Kemp listens; three clicks arrive across the ocean.
9. **ARPANET:** the walker froze mid-stride, and the lights were wrong. Indicator lamps floated across cabinets; ceiling lights were bars on the wall. He should sit at the terminal and type.
10. **The 1977 call must be far more powerful.** v2 had two icons on a starfield.
11. **The finale:** people stood in space, and the Voyager drawing was cheap. People stand on ground (a hilltop at night); draw Voyager with real detail.
12. **Use the whole crew**, with different transitions besides walking. Be creative with 运镜 and 转场.

Also from earlier tonight (still binding):
- The walker principle: the person stays in place, layers slide past. Not every scene must walk, though; vary the staging.
- Background vignettes act out the narration.
- No static frames.
- Music a little louder than the opening test: currently BGM −4 LU under voice, −3 dB more while speaking.
- Seamless transitions.

## Music (fixed; do not change without a reason)
- **Track:** バケモノの唄 (instrumental), 106 BPM, beat ≈ 0.566 s, bar ≈ 2.264 s. File: `audio/bgm2.mp3` (gitignored).
- **Kept song spans:** [0, 54.875) + [91.41, 209.47) + [238.0, 253.2), joined with 40 ms crossfades. Film length ≈ 188.1 s.
- **Film-time landmarks (s):**

| Moment | Film time | Note |
|---|---|---|
| Quiet intro | 0–9.30 | |
| Hit | 9.30 | |
| Build | 9.30–18.965 | |
| Verse | 18.965–34.836 | |
| Full | 34.836–54.875 | first cut lands here; song resumes at 91.41 |
| Full | 54.875–70.755 | pulse section |
| Full | 70.755–90.845 | stop at 90.845 |
| Full | 90.845–110.385 | |
| Breakdown build | 110.385–144.165 | |
| **Total silence** | 144.165–145.70 | 1.53 s |
| Filtered | 145.70–154.095 | |
| **Climax hit** | 154.095 | |
| Climax | 154.095–172.935 | second cut lands here; song resumes at 238.0 |
| Quiet outro | 172.935–188.1 | |

- **v2 scene windows** (keep unless the storyboard argues otherwise):

| Scene | Film window (s) | Note |
|---|---|---|
| Cold open | 0–9.30 | |
| Rewind | 9.30–12.70 | v3: shorten to ~2 s and give the rest to the title |
| Title | 12.70–18.965 | |
| 商 | 18.965–34.836 | |
| 杜甫 | 34.836–54.875 | |
| 莫尔斯 | 54.875–73.015 | |
| 斯科特 | 73.015–90.845 | |
| 贝尔 | 90.845–110.385 | |
| 马可尼 | 110.385–127.265 | |
| 阿帕网 | 127.265–145.70 | crash = the silence at 144.165 |
| 北京 | 145.70–160.885 | the climax hit at 154.095 is under the quote |
| 1977 | 160.885–172.935 | |
| Outro | 172.935–188.1 | greeting, title, question |

## Engine (what the build can do — design to it)
- **Remotion SVG**, every frame a pure function of time. Rendering is parallel: 20 GitHub machines plus local, 3–4 min for the film.
- **Parallax layers**, any number. Sprites come from AI-generated silhouettes cut out and flat-tinted per layer. Procedural sky, ridges, rain, stars, glows. Painted backgrounds are available as far plates.
- **Real mocap walking** (CMU database). Other poses — standing, sitting, typing, kneeling, turning — will be drawn as designed silhouette poses. Simple secondary motion: cloth lag, hair.
- **Camera:** pans, push-ins, pull-outs, tilts, dolly through objects, match cuts, wipes along a line, light flashes, whip pans.
- **Voice:** ElevenLabs (v3 is more emotional, v4 more accurate for Chinese), 5 languages.

## Facts verified so far (researcher: confirm or correct, and add the rest)
- **Morse:** in February 1825 he was in Washington painting Lafayette. A letter from his father reported his wife Lucretia's death; by the time he reached New Haven she had been buried (National Geographic). Whether this inspired the telegraph is unknown, so the film must not say it did. 1844: "What hath God wrought", Washington–Baltimore.
- **Bell:** his notebook for 10 March 1876 reads "Mr. Watson — Come here — I want to see you." (Library of Congress). The notebook continues that Watson came and said he had heard and understood — verify.
- **Marconi:** 12 December 1901, Signal Hill. Balloons failed and one kite was blown away; a linen kite lifted the aerial. He handed Kemp the receiver: "Can you hear anything, Mr Kemp?" Three dots, S, came from Poldhu, Cornwall (Oxford History of Science Museum).
- **ARPANET:** 29 October 1969, 22:30. Charley Kline at UCLA (SDS Sigma 7) to Bill Duvall at SRI (SDS 940). "LO", then the crash (Kleinrock's page). The phone exchange "Did you get the L? — Yes" is from Kleinrock's interviews; verify.
- **1987 China email:** "Across the Great Wall we can reach every corner in the world", from CSNET host ZE1 at ICA Beijing. Edited 14 September, sent 20 September 1987 (Zorn, KIT).
- **1977:** Druyan called Sagan after finding a 2,500-year-old Chinese song for the record (流水 «Flowing Streams», guqin, Guan Pinghu — verify). By the end of the call they were engaged. Days later her EEG and heartbeat, "a body newly in love", were recorded for the record (NPR).
- **Golden Record Mandarin greeting**, NASA translation: "Hope everyone's well. We are thinking about you all. Please come here to visit when you have time."
- **Scott:** 9 April 1860 «Au clair de la lune» phonautogram; first played in 2008 by First Sounds; in 2009 re-speeded and heard as a man, probably Scott. Verify the details.
- **Shang:** oracle-bone rain divinations such as 「其自东来雨？」 (合集12870); 验辞 records of rain exist. 杜甫《春望》 dates to 757.
