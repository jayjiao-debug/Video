# Task: DESIGN TEST — the tripartite wig's front lappet in front of the shoulder (古埃及神话故事 series)

Owner (2026-11-06 13:30): "isn't the hair supposed to be in front? but if it's in front it covers the animal features?" — then
13:42: "先看看设计" (show me the design first). So this is a DESIGN TEST for review only: implement the new wig layering behind an
option that is OFF by default, and build a before/after comparison. Do NOT switch any character, sheet, board or ep60 to it yet.

## The canon to draw
The tripartite wig = two front lappets that hang from behind the ears down in front of the shoulders, lying OVER the upper edge of
the broad collar on the chest, plus the back mass behind the head down the back. In profile, the near front lappet is in front of
the shoulder/collar; the back mass is behind the neck. On animal-headed gods (Papyrus of Ani: Anubis, Thoth, Horus) the lappet starts
behind the ear and the jaw hinge and runs down the neck, so the muzzle/beak, the eye and the ears stay fully visible — the lappet only
covers the neck and the join between head and body (and the jaw hinge of the new face rig).
Code: `episodes/37-qiqing/remotion/src/qq61/` (heads61.tsx, cast61.tsx, chars61.tsx, sheets61.tsx: FACECHECK61 etc.) and
`src/qq60/rig60.tsx`. Canon: `episodes/61-zhongshen/designbook.md`.

## Do
1. An option (e.g. `wigFront: true` on the cast or a global flag) that draws: back mass behind head and neck; the near front lappet in
   front of the shoulder and over the collar's top edge; its top tucked behind the ear / jaw hinge so it never covers the eye, the
   muzzle or beak, or the ear; on the lionesses the mane rings behind and the lappet falls in front of the mane's lower edge; it must
   not cover the open mouth in a roar / screech, and must move with the head and neck (head tilt, roar head-back) without gaps.
   Human-headed gods (black wigs) get the same layering.
2. Composition `WIGTEST61` (new entry file with registerRoot, 1440 × 1080, one frame per pair of characters): for each character a
   BEFORE (current) and AFTER (front lappet) column, at head-close-up scale AND full figure, plus the AFTER head in the roar/wide state
   to prove the face stays clear. Characters: Ra, Horus, Anubis, Thoth, Set, Tefnut, Sekhmet, Bastet (animal-headed) and Isis,
   Nephthys, Ma'at, Shu (human-headed). Chinese labels 「现在」/「垂片在前」.
3. Render all frames in the runner, look at them at full size, fix overlaps (lappet over the eye/beak/mouth, gaps at the neck), repeat.
   DO NOT COMMIT IMAGES, VIDEO OR AUDIO — code and markdown only. ep60 must render exactly as before.
4. `tasks/ep61-wigfront/result.md`: a short Chinese summary + the render command (frames list).
Rules: only change `src/qq61/`, `src/qq60/rig60.tsx` (non-breaking, default off), `tasks/ep61-wigfront/`. No keys in files.
Set git identity (git config user.name "Claude"; user.email "noreply@anthropic.com"). End commits with:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
