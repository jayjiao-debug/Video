# Review: 《为了跟你说一句话，人类努力了三千年》 v3 r2 — verdict: FIX FIRST

This cut is a big step up from v2. Ten of the owner's 12 notes are visibly fixed. Most transitions are now motivated: the crack match, the fire, the letter match, the wire turning into the trace, the lamp turning into the spark, the three dots turning into the panel lights, and the CRT collapse. The open now moves, and Bell, Marconi and ARPANET finally make sense. The biggest risk is the 1977 climax, where both people hold the receiver in front of their faces like a smartphone instead of at the ear. After that come four "what is that?" or logic slips the owner has already complained about in other forms: ghost telegraph poles, the oil lamp that looks plugged into a wall socket, the blank "148 years" card, and the rewind timecode stuck at 1876.

Film: `scratchpad/farm/r2_mux.mp4`. 1920×1080, 30 fps, 187.8 s, −14.01 LUFS, peak −2.31 dBTP, 6.68 Mbps, 162.8 MB.

## Must-fix (MAJOR: the owner would notice)

| # | Time | What's wrong | Evidence | Suggested fix |
|---|------|--------------|----------|---------------|
| 1 | 2:41–2:52 (161–172.6) | **The 1977 call does not read as a phone call.** Druyan (163 s) holds the handset in front of her mouth. Sagan (167 s, 169–171 s) holds it at chest/chin height, about a head-width in front of his face, like a smartphone. Both receivers are away from the ear. Then the engagement line 「那通电话打完，他们决定结婚了」 plays over a nearly identical split-screen for about 4 s (169 vs 171 are the same frame). The rooms only merge at 172.2, after the line. Owner note 10 asked for this scene to be "far more powerful", and owner-notes row 77 says an action must read in one glance. | `full/crops2.jpg` (163, 167, 170 crops); `r2_sheet3.jpg` tiles 163–171 | Put the receivers on the ears, with the earpiece touching the head at the ear and the cord hanging from the mouthpiece. On 「决定结婚了」 (≈168.1) start a slow push and slide the two halves together so the merge lands on 「结婚了」 (≈170.5), not after it. Optionally warm the light at the merge. |
| 2 | 1:11 (≈70–72.6) | **Ghost telegraph poles.** The poles render as half-transparent grey columns with no tops or crossarms. There are also dark blurred blobs along the grass under them. It looks like a render bug. | `chk1.jpg` tile 71.00; `full/crops1.jpg` (71 crop); compare the solid poles at 65.00 | Keep the poles opaque, with crossarm and insulators, until the camera leaves them, or fade them only during the trace transition (from 72.2). Remove the blob shadows or make them clear cloud shadows. |
| 3 | 0:05–0:10 and 1:31–1:50 | **The oil lamp looks plugged into a wall socket.** The black wire leaves the table right behind the brass oil lamp and climbs the wall into a round black socket plate. In an 1876 room, with the hook about a telephone, a viewer reads it as the lamp's power cord. This is a logic error on the cold-open frames and on the whole Bell scene. | `full/crops2.jpg` (7 s crop); `tr2.jpg` 90.63–91.00, 109.60 | Run the wire from the transmitter stand (left), along the table edge and up the wall at picture-rail height, to a small hole or porcelain knob beside the door frame. Keep it well away from the lamp and drop the round plate. |
| 4 | 1:19 (≈78.5–80.4) | **The "148 years" shot is unreadable:** a big blank tan rectangle with a small white slip. Nobody can say what it is in a second, which is the same as the "What the heck is that" note (owner note 5). | `full/crops1.jpg` (79 crop); `r2_sheet1.jpg` tile 79 | Show the real thing: the soot-blackened phonautogram sheet with its white trace in an archive folder or drawer (Académie des sciences), dust on it, and the year counter 1860 → 2008 running on it. Or cut straight from Scott's sheet (77 s) to the 2008 playback (81 s). |
| 5 | 0:09.8–0:11.6 | **The rewind timecode freezes at "1876"** while the flashes go back through Scott 1860, Morse 1844 and 1825, Chang'an 757 and the Shang bone. "1876" printed over Tang Chang'an is a logic error, and owner note 3 asked for the timecode to run backwards. The counter does run 2007 → 1941 → 1876 at 2–5 s, so the device is there; it just stops. | `rw.jpg` tiles 9.80–11.20 (all read 1876) | Drive the counter from the flash that is on screen: 1860 → 1844 → 1825 → 757 → 公元前1200, blurring as it spins. |
| 6 | 3:04–3:08 (183.8–187.8) | **The end card is not the Juno card.** It has no J monogram, no 「关注 Juno · 一起看懂世界」 pill and no sources. The storyboard (O3, line 689) specified the pill. The First Sounds CC BY licence requires a credit "in the description or end card" (facts S4), and the end card has none. | `full/end_crop.jpg` | Add the J monogram and the follow pill under 「写在评论区…」, plus one small sources line (First Sounds · CC BY (有剪辑) · LoC · NASA …). At minimum, make sure the post description carries the First Sounds credit. |
| 7 | 1:30.63 | **The only plain hard cut in the film:** from the Paris night sky (moon upper left) straight into the static wide Bell room. Every other hand-over is a match. Owner note 12 asks for creative transitions. | `chk2.jpg` 90.60 → 90.63 | Match the moon. Bell's window already shows a moon at 93 s, so make the Paris sky that moon and pull back out through Bell's window into the room. |

## Should-fix (MINOR, but each is a row in owner-notes)

| # | Time | What's wrong | Evidence | Suggested fix |
|---|------|--------------|----------|---------------|
| 8 | 1:07 (≈66–69) | The two standing men in the Capitol room are the same silhouette copied: same profile, coat and pose. They read as clones. | `full/crops1.jpg` (67 crop) | Vary one: a different height and coat, a top hat in hand, a different posture. |
| 9 | 0:40–0:42 | A bright white slab on a leg sits at the right of Du Fu's path. It is the brightest thing in the dusk frame and is unidentifiable (owner note 5). | `full/crops1.jpg` (41 crop, right edge) | Cut it, or make it a clear stone or well in the scene's own colour. |
| 10 | several | Some voiced lines leave the screen before they can be read: 93.02 「沃森在那头等着。」 1.2 s; 143.94 「然后，系统崩溃了。」 1.4 s (it ends at 145.38, before the voice ends at ≈145.5); 176.53 「和身体的声音。」 1.5 s; 45.50 「战火连烧三个月，」 1.8 s. | `scratchpad/rev/out/auto_checks.md` | Extend the ends into the gaps that follow: 93.02→95.30, 143.94→145.90, 176.53→178.15. For 45.50, start at 45.40 and end at 47.30. |
| 11 | 34.3, 72.2, 90.0, 127.8, 160.2 | The outgoing era label is still fading on screen while the next scene's transition is under way, e.g. 「商 · 殷墟」 over the flames and 「莫尔斯 · 华盛顿」 over the trace. This breaks owner-notes row 86. | `tr1.jpg` 34.30; `tr2.jpg` 72.20, 90.00; `tr3.jpg` 127.80, 160.20 | End each LABELS3 entry about 0.5 s earlier, so it is gone before the move starts. |
| 12 | 0:00–0:01 | The phone UI sits in the subtitle band. At 0.3 the red hang-up button is under 「人类打出的第一通电话，」 and at 0.7 「正在呼叫…」 overlaps it. The subtitle is also dimmer on frame 0 than at 0.3. | `tr1.jpg` 0.00, 0.30, 0.70 | Raise the phone, or clip its lower UI out of the bottom band, and show the subtitle at full opacity on frame 0. |
| 13 | 0:20–0:33 | The oracle bone reads as a puffy pillow or marshmallow, not a turtle plastron. | `full/crops2.jpg` (27 crop); `r2_sheet0.jpg` tiles 21, 29 | Redraw the outline as a flat plastron: a long oval with notched sides, a midline seam and a row of chiselled hollows beside the crack. |
| 14 | 3:04–3:08 | The end-card lines are about 18–21 px left of centre. The trailing ，。? were not pulled back (owner-notes rows 89 and 97). | `full/end_crop.jpg`: question ink 565–1320 px, centre ≈942 | Apply the −0.5em trailing-punctuation rule and measure the ink centre at about 960. |

## Nice to have

| # | Time | Note | Evidence |
|---|------|------|----------|
| 15 | throughout | Subtitles are about 48 px (Chinese) and 28 px (native line, italic). Era labels are about 30 px with a 20 px year tag. The series standard is 64 px for subtitles and ≥40 px for labels. Fine on a monitor, small on a phone. | measured on 79 s and 111 s frames |
| 16 | 1:05–1:12 | The bright, painterly green daylight plate is the only frame of its kind in a dusky silhouette film, and it has no person in it. Grade it toward the film's palette or keep Morse in the shot. | `chk1.jpg` 65.00 |
| 17 | 2:53–2:56 | The golden record sits almost still for 3 s (auto-check: static 173.3–176.3) under 「脑电波」. A slow rotation, or the EEG trace drawing across it, would keep it alive. | `scratchpad/rev/out/auto_checks.md` |
| 18 | 2:26 → 2:41 | The years run 1987 → 1977. The voiced 「1977年」 covers it; just confirm the owner is fine with the jump back. | subs3.ts |
| 19 | delivery | The master is 162.8 MB at 6.68 Mbps. The owner's rule is a 发送版 ≤ 28 MB (for 188 s that is about 1.1 Mbps video, 2-pass). | probe |

## Owner's 12 notes: status in r2
1. Era props and nothing floating: **fixed** in the Du Fu scenes. The letter is a Chinese folded letter with a paper band, and the towers stand on the ridges. The white slab is #9.
2. Opening: **fixed.** Frame 0 is the viewer's own phone calling 妈 at 23:47 and moving, then it rewinds out.
3. Rewind: **mostly fixed.** It is about 2 s (9.5–11.6) with ◀◀ REW, PAUSE, tracking lines and few-frame flashes in reverse order, but the timecode is frozen (#5).
4. One-tone humans: **fixed.** All figures are a single flat tone.
5. No junk props: **two new ones**, #4 and #9.
6. Bell: **fixed.** One room, push-in on the speaker (95–99), inside the wire (101), Watson's bedroom (103), Watson at the door (105–109). The lamp wire is #3.
7. Every caption voiced: **appears fixed.** The build JSON's re-cut J1 (「1987年，北京。一封电子邮件，写好了。」) and the 1977 clip show pause patterns that match their subtitle splits. *Not verified by ear* (see below). Note that `vo_timeline_v3.md` is stale: it still lists 「中国的第一封电子邮件」, which the researcher said not to claim (facts.md, "First" claims). Confirm that this take is not the one in the mix.
8. Marconi logic: **fixed.** Poldhu sends S = ···, the kite rises in Newfoundland, Kemp listens, and three dots appear.
9. ARPANET: **fixed.** He sits and types, the lamps are on the panels, the lights are in the ceiling, and the split UCLA/SRI screens show L and LO.
10. 1977 powerful: **not yet** (#1).
11. Finale: **fixed.** People stand on a hilltop, and Voyager is detailed (dish, booms, RTG, record on the bus).
12. Creative transitions: **fixed except one plain cut** (#7).

## Automatic flags checked on frames (not problems)
- Black frames at 1.27–1.43, 18.93–19.40 and 72.80–72.97 are intended: the iris into the tape circle, the title → crack on black, and the wire → trace.
- The single-frame "glitches" at 10.37 and 10.77 are the intended rewind flashes.

## What works (keep)
- The cold open: own phone → years rewinding → Bell's room → ◀◀ REW → title on a crack that becomes the crack in the bone (`tr1.jpg`).
- The match-cut chain: Shang fire → beacon fire, Du Fu's letter → Morse's letter, telegraph wire → phonautogram trace, Bell's lamp → Poldhu spark, three dots → ARPANET lamps, CRT collapse → 1987 terminal.
- Bell staged exactly as the owner asked, and Marconi now told cause → effect.
- The Beijing calendar running 14 → 19 with a falling page, and the email arc flying over the Great Wall.
- The finale: detailed Voyager, the cast on solid ground, the comment question. Loudness is on target at −14.0 LUFS.

## Not checked / can't judge
- **Nothing was heard.** There is no audio playback or speech-to-text here. The music splices (54.875, 172.935), ducking and VO wording were judged only from `audio/vo_timeline_v3.json`, pause patterns in the clips and the build script (2 dB duck, gaps bridged). The r1 music review's MAJOR #2 (pumping) and #3 (late re-entry) look addressed in `build_v3.py`, but this is not verified by ear.
- **Visual pass coverage:** the four 2-second contact sheets (every 2 s) plus about 80 targeted frames at every scene transition and every suspect. I did not open each of the 25 auto sheets in `scratchpad/rev/out/` one by one.
- **Facts:** spot checks only (148 years, 19 years, six days, Tucson hotel, Bell's two rooms, the kite). The 1987 "first" wording is as noted under note 7.
