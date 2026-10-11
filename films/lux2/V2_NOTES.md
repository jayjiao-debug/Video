# v2 notes (read with BRIEF.md and /tmp/claude-0/critic/review.md)

An independent creative director scored v1 4.5/10 (look 4, camera 4.5, transitions 3, beat hits 5.5, readability 5).
Full review: /tmp/claude-0/critic/review.md (frames in /tmp/claude-0/critic/{sheet,full,strip}/). Read it.

## Already changed in the shared engine (do not undo)
- Whips are now whip-PANS: the outgoing shot holds its last key and pans hard right over the last 0.28 s, the cut lands
  exactly on t0 mid-pan, the incoming shot decelerates out of the pan over 0.36 s from its first key. No more flying
  through empty space, no black frames. So for a 'whip' scene: make your LAST key (t1 − 0.3) and FIRST key (t0 + 0.3)
  frame something bright and rich (the pan blurs it into a streak); avoid empty black at both ends.
- Colour fringing is gone except 2–4 frames on A hits and whips. Flash is smaller.
- The HeroBag now carries its own product lighting (warm key front-right, cool rim behind-left; prop `light`, default 1)
  and a brighter crimson lacquer. It should now be the brightest thing in frame.
- Confetti count is cut to 40 % and is mostly gold; use it only where it celebrates something.
- A soft dark gradient sits behind the subtitles (bottom 270 px).

## What the critic wants from every scene (apply to yours)
1. One camera move with intent per shot, with speed ramps that RESOLVE on a bar line or hit (no constant slow drifts,
   no frozen stretches > 1.5 s: the critic measured 46.6–48.3, 102.7–105.5, 123.2–129.9 as frozen).
2. Brightness: key moments must be bright and rich, not 5–15/255 black. Mostly-black is fine only if the subject is lit.
3. Holo only as reward/accent (price tag, one sheen on a hit), not wallpaper. Gold/black/crimson palette; no purple
   floors or cyan/magenta rings except the UV world in S10.
4. Nothing important in the bottom 230 px; nothing cropped by the frame edge; text crisp and big.
5. Object-led transitions: end each scene on an object/light that the next scene picks up (match cuts).
