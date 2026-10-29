# Task: polish the subtitles of ep53 越王勾践剑 (wording only, timing locked)

You are a senior screenwriter and fact-checker for a Chinese Douyin channel of subtitle-only history shorts (no voice-over). The film for episode 53 is about 越王勾践剑, the famous 2,500-year-old bronze sword, told as ONE continuous camera move. Its on-screen title is 「越王勾践剑 / 真的没锈吗？」. The owner has approved the lines and the music is cut, so **the timeline is locked**: line start/end times cannot move.

Your job is to improve the WORDING where it clearly helps: a sharper hook, clearer cause-and-effect, less lecture-like, more natural spoken Chinese, a stronger payoff. You may not change facts or timing.

## Read
- `episodes/53-goujian/lines_bars.json`: the final timeline, [start, end, text, N|Q]. [ ] marks the highlight, {…} a gloss row, \n a second row.
- `episodes/53-goujian/script.md`: the beats, picture notes, and fact IDs per line.
- `episodes/53-goujian/facts.md`: only ✓ rows may appear on screen; ? rows only hedged (「一种说法」「据报道」); never ✗ rows.
- `episodes/53-goujian/coldread_gate1_v2.json`: a first-time viewer's reactions. Known weak spots:
  - The tin/lead percentage line reads like a lecture.
  - 「原因之一」 hangs.
  - The opening 「还是亮的」 vs the later 「它也锈了」 / 「没那么亮了」 causes a moment of doubt.
- `episodes/53-goujian/notes_gate1_r1.md`: the director's notes. Never use 谣言 / 假的 / 不是铬 / 没有铬 / 证伪 on screen. The 镀铬 claim is「一种说法」; 国博 still prints 铬盐.

## Rules
- Each row ≤ 16 Chinese characters, two rows max.
- The reading budget must still fit the locked window: on screen ≥ 0.5 s + characters/7 + 0.6 s.
- Keep about one highlight in three lines, on the payoff word or number only.
- 你 = the viewer.
- Keep these lines unless you have a clearly better version:
  - H1 (the knife/sword hook);
  - T1 「其实，它也[锈]了。」 (lands on the hardest music drop);
  - P1 「它不是不会锈，是那座墓，替它挡了[两千多年]。」;
  - the end question.
- Every changed line must still be supported by the same fact IDs. If you add a claim, cite the facts.md row ID.
- No more than about 8 changed lines: change what matters, not everything.

## Output
Write `tasks/ep53-script-polish/out/script_notes.md` with:
1. A table: line start time | old text | new text | chars per row | window s | budget s | fact IDs | why.
2. A one-paragraph verdict: the biggest remaining weakness of the script, and whether your edits fix it.
3. Anything in facts.md you think is mis-stated on screen.

Do not edit any other files.
