# 林冲 v2 — delivery notes (2026-11-08, overnight build)

**Files (not committed; kept in the session):** `林冲_v2_发送版.mp4` (1080p two-pass, 27.5 MB, sent in chat) and
`林冲_v2_高清原片.mp4` (1080p x264 crf 17 + AAC 256k, 75 MB). 148.5 s, 30 fps, −14.2 LUFS, true peak ≤ −1.2 dBTP.

## How it was made
- Engine: `film/` — Playwright SVG frames, 2.5D parallax camera layers, baked static layers, particles, subtitles
  from the measured narration (`vo_timeline.json`), 沧州 stamp, J brand seal. `film/assemble.sh` renders and encodes.
- 林冲: traced vector rig (`chars/rig/linchong.mjs`): traced bodies, faces drawn in code (thin drooping
  moustache, long pointed goatee), the 毡笠, spear with red tassel and the gourd, cangue, tattoo, costume recolours.
- 13 takes built by 7 builder agents from storyboard_v3 + `film/timing.md` (retimed to the recorded voice);
  independent review `reviews/gate4_v1.md` (9 MUST, 13 SHOULD) → all MUST and most SHOULD fixed in v2.
- Sound: the owner's 《笛子戏》 at a static −9 dB with the end fade only (no ducking), narration, quiet synthesised
  cues (`tools/sfx.py`), final static gain + true-peak limiter (`tools/mix_final.py`).

## Decisions taken while the owner slept (all reversible)
1. Same native zh narrator voice as the narration test; V20/V21 cut to fit the music — 沧州 is carried by the stamp
   「沧州 · 草料场 / 那年冬天，大雪」.
2. Accuracy retakes (old takes kept as V03.mp3 / V29.mp3):
   - V03 「你说不出口——你是怕自己回不来…」 → 「你只说：我是好意。怕自己回不来，误了她一辈子。」 (第八回: 「娘子，我是好意」).
   - V29 「那一夜雪越下越大，你一个人，上了梁山。」 → 「又一个雪夜，你一个人，上了梁山。」 (梁山 is reached on a later
     snowy night, 第十一回).
3. Summer farewell (第八回 「六月天气」); the first snow arrives with the dissolve into 沧州.
4. He takes the 毡笠 off inside the 山神庙 and leaves it on the 供桌 (第十回), and puts it back on for the snow walk.
5. 「已故半载」 and 「依旧夫妻完聚」 are brushed on screen in sync with the voice instead of subtitled.
6. The wife's face is never shown; the killing is hidden by the whiteout.
7. Subtitles: Noto Sans CJK Bold 64 px, white, gold key words (休书 / 林冲 / 忍 / 依旧夫妻完聚).

## Known limits (SHOULD items left)
- At extreme close-up the traced faces are flatter than painted art; crowds are simple; the "拳头，软了" hand
  overlaps the hat crown for ~0.7 s; the door-leaf wipe has 1–2 nearly flat frames at 77.45.

## Open for the owner
- Taste calls (storyboard §11): serif vs sans subtitles; simplified vs traditional on the 休书; hat brim size.
- 巨量算数 check of 林冲 keywords before posting; how to deliver the 75 MB master (the public deliver branch
  route was declined before).
