# ep46 《汉柏的孩子，去守汉武帝》: handoff (written overnight, 2026-10-25)

## What it is
- A 2:36 history film in the 「假如你是…」 format. 「你」 is the Han cypress 汉柏连理 in 岱庙, at the foot of 泰山.
- The camera stays at the tree for 2,100 years while the emperors, wars and visitors come and go behind it.
- It ends with the tree's own seedlings guarding 汉武帝's tomb 茂陵 (2024), on the music's drop.
- Look: 「岱庙 · 同一个机位」. A warm flat-gouache courtyard with one-tone silhouette people; the tree is the only glowing thing. Dashed outlines mean 相传.

## Decisions taken while the owner slept (all logged in crew_log.md)
- **Title:** 「汉柏的孩子，去守汉武帝」, the director's and cold reader's #1. Alternatives in script.md: 「皇帝走了，这棵树还在」 and 「它真是汉武帝种的吗」.
- **Look:** a single look, with no gate-2a choice of looks.
- **Lines v3:** the 赤眉 legend block was cut so the peak line lands on the drop (make_lines_v3.py).
- **Music:** bgm2.mp3 cut with the ep42 plan "A" plus one 2-bar intro loop (music/build46.py), as the owner asked ("cut it with the scripts in episodes/42-yiyi/music/").

## Reviews run
| Round | Reviewer | File | Result |
|---|---|---|---|
| Gate 1 | director + cold reader | notes_gate1_r1.md | applied |
| Gate 3 r1–r2 | director | notes_gate3_r1.md, notes_gate3_r2.md | applied |
| Logic r1–r3 | logic checker | logic_check_r1.md, logic_check_r2.md, logic_check_r3.md | applied |
| Cut v2 | video-reviewer | review/REVIEW_v2.md | applied |
| Gate 4 | director | notes_gate4_r1.md | APPROVE v3 (overall 4/5); polish → v4 delivered |

The code body-logic check is `scripts/check46.mjs` in the 37-qiqing Remotion project. It covers R2/R3/R4/R5/R7/R8 and passes.

## Files
- **Code:** episodes/37-qiqing/remotion/src/qq46/ (FILM46 + KF46 entry). Render with `scripts/frame.mjs` (ENTRY=qq46/FILM46).
- **Farm:** tools/farm46.sh runs the film on the farm. The farm was busy with another chat's ep47, so v2 and v3 were rendered locally (about 45 min on 2 cores).
- **Mux and send version:** tools/finish46.sh. Glitch scan: tools/glitch_scan.py.
- **Outputs:** in /tmp/claude-0/r46/ (local only, never committed).
- **Final v4:** 156.4 s, 4693 frames, 0 glitches, −14.0 LUFS, TP −2.2 dBTP. Send version 27.0 MB.
- **HD master:** Hanbai_v4_HD.mp4 (80.8 MB, md5 8cfd9d85bbd355bf7fdb8f04bc0b0618) on branch deliver-hanbai (2 parts); get_hanbai_HD.bat downloads and joins it. Keep the branch until the owner has the file.

## Open
- A raw audio dump from the v2 review (episodes/46-hanbai/review/v2/a.raw, about 57 MB) was committed by mistake in 975c363 and removed in 8a8d3ab.
  - It contains the film's soundtrack, which is the owner's BGM.
  - It is still in that commit's history. Purging it needs a history rewrite and force-push (owner's call; his rule is no rebase/amend).
  - .gitignore now blocks review raw/wav/mp4.
- douyin-publish package: only after the owner says the video is final.
