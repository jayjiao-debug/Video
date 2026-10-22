# Review: 七情 v9d (发送版) — verdict: FIX FIRST
Strong, on-beat and coherent (all 8 hits within ±11 ms of the kick, −14 LUFS, every character renders whole); the risks are an empty first frame, a grey flash with no title on the title hit, closing lines that are on screen too briefly, and 惧 still carrying the two things the owner flagged at 18:23.

| # | Sev | Time | What's wrong | Evidence | Suggested fix |
|---|-----|------|--------------|----------|---------------|
| 1 | MAJOR | 0:00.00 | Frame 0 is an empty dark screen (mean luminance 8/255); the first words fade in after it. Owner rows 22/47: frame 0 must already carry the subtitle and something moving. | sheet_01 frame 1 | Show 两千年前，《礼记》写道 and the big line already on frame 0 (no fade-in), with a faint glow moving behind them. |
| 2 | MAJOR | 0:54.80 | The title-slam frame is a full grey frame with no title on it (the title fades in from the next frame), so it reads as a white flash. Owner rows 55/84: no white flashes; the title slams in. | sheet_11 frame 1 | Put the title fully on the hit frame (like the characters) and centre the lift on the title. |
| 3 | MAJOR | 0:08–0:47 | Each closing line (被在乎的感觉，藏不住。 etc.) appears 4 beats after the hit and stays only ~1.8 s for 8–12 characters (needs 2.2–2.8 s), while the name above it sits for 3.8 s with nothing new. Owner row 104: every line inside its reading time. | auto_checks.md pace table | Bring each closing line in on beat 2 after the hit (rv + 2 beats) → ~2.8 s on screen; no other timing changes. |
| 4 | MAJOR | 0:24.4–0:28.3 | 惧 still reads bald (a ring of spikes round a bare dome) and her hands are the version the owner flagged: "make it not appear bold, the hands doesnt look right" (18:23). The owner then chose to keep v9, so this needs his call. | sheet_06 frames 1–5 | Option: v9b's hair standing on end over the crown, keeping v9's hands-over-mouth; or leave as is. |
| 5 | MINOR | 0:48.8–0:54.6 | 你心里，哪个声音最大？ is 24 px left of centre (ink centre 936 of 960) because of the full-width ？. Owner rows 89/97. | measured on frame at 0:52.5 | Pull the trailing ？ back ½em (or shift the line +0.25em). |
| 6 | MINOR | each voice | The scene caption (它在你…时说) is 36 px light serif and sits with the quote for only ~1.8 s; small on a phone. Owner row 69 (labels ≥ 40 px). | sheet_02 frame 1 | Raise the caption to 42 px (keeps the serif look the owner chose). |

Not issues (checked): the 6 "single-frame glitches" are the intended one-frame lift on each character's hit (sample style) and the one-frame dip between scenes; the 0.16 s black at 48.7 s is the 欲 → outro dip; 2.75 Mbps / 22 MB is the owner's delivery spec (≤ 28 MB; the HD master goes by .bat); no "Juno 出品", no maps, no real people; the 《礼记·礼运》 quote (喜怒哀惧爱恶欲，七者弗学而能) and "两千年前" are accurate (compiled in the Western Han).

What works (keep):
- Every reveal lands on the kick (6.13 … 54.80 s, within ±11 ms), with 喜 on the 6.14 s hit after the bass gap.
- The sample-style entrance: name and figure on the same frame, impact streak from the name to the figure.
- 哀's slow tear, 爱's streaming ribbons, 恶's fan opening a beat later, themed clothing on narrower shoulders.
- Clean, legible seven-icon row in intro and outro; calm backgrounds.

Not checked / can't judge: the music choice itself (only sync and loudness measured); how the Douyin copyright match treats the track (pick the same track from Douyin's library when posting).
