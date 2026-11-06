# Task: build the FIRST CUT (picture) of ep61 《古埃及众神，其实是一家人》 — 第2集｜古埃及神话故事

You build the animated film's PICTURE in Remotion (the producer mixes music + SFX locally afterwards from your cue sheet).
Format: subtitle-only, 4:3 1440 × 1080, 30 fps, about 2:30. Everything you need is in the repo:
- Script: `episodes/61-zhongshen/script.md` (43 timed lines). Storyboard: `episodes/61-zhongshen/storyboard.md` (22 shots: framing,
  camera, layering, actions, transitions, SFX, the family-tree throughline). Facts: `episodes/61-zhongshen/facts.md`.
  Canon: `episodes/61-zhongshen/designbook.md` (characters, body types, wigs, signature colours, face rigs) and
  `episodes/61-zhongshen/setsbook.md` (set dressing). Code: `episodes/37-qiqing/remotion/src/qq61/` (cast61, chars61, heads61,
  ammit61, sets61*, tree61, board61 = the storyboard frames you start from, shots61) and the series' first film
  `src/qq60/` (EP60.tsx = the master pattern: frame bands, Subtitle with god names light blue + [key] words highlighted, Stage60,
  wobble at ~38 %, transitions 'cut' | 'dissolve' | 'own', EndCard with the Egyptian J cartouche, TitleCartouche, FollowPlaque).
- Keep the CURRENT designs (old wig layering: `wigFront` stays OFF).

## Line changes to apply before timing (owner-approved defaults, facts.md)
- 21 → 「[伊西斯]，法力强大的女神。」 · 32 → 「叔侄俩，在法庭上争了[80年]。」 · 35 → 「太阳神的女儿们，脾气天差地别。」
- Keep the reading rule: line time = max(2.2, 0.68 + 0.237 × 字, digits count half); ≤ 16 字 per line.

## Build
1. `src/qq61/story61.ts`: the timeline (shots with a/b and lines with t0/t1), like qq60/story60.ts.
2. `src/qq61/EP61.tsx` (registerRoot): composition `EP61PIC` (the whole film, picture only) and `SHOT61` (one shot, input props
   {n, from}), the frame drawn once over the shots (bands, subtitle, the series stamp if any), the seamless Egyptian end card
   (picture keeps running, J cartouche, the title 《古埃及众神，其实是一家人》 in the TitleCartouche, the follow plaque
   「关注 Juno · 一起看懂世界」, the sources line from facts.md; last 0.9 s to black). The title lives inside a scene early (by ~12 s),
   never a separate title card.
3. The 22 shots as animated components (files `src/qq61/shot61_*.tsx`), following the storyboard: every shot has camera motion
   (≤ 25 px/frame, no shake, no whip pans) and the acting beat on its line; each god's signature action (Tefnut and Sekhmet ROAR with
   the face rig's roar, Shu lifts Nut, Thoth plays senet with the Moon / writes, Isis spreads her wings, Set sneers in a sandstorm,
   Horus falcon cry, Bastet sistrum + paw lick, Anubis at the balance, Ma'at's feather drifting onto the pan); the family tree grows
   generation by generation (mini-tree + the full-screen tree shots) with the signature colours; motivated transitions as written.
   DRESS EVERY SHOT with the set library (architecture, nature, props, animals, crowds, ambient motion) so the frames are as rich as
   the reference films — background / middle / foreground layers behind and around the characters, never empty.
4. House rules (owner): a first-time viewer understands every shot in ~2 s; frame 0 reads "ancient Egypt" and grabs; layering always
   correct (hands over held objects, nothing through heads, the speaker on top); no unexplained glows; nothing cut off; no gore
   (Osiris's murder = the chest closing; Sekhmet's rampage = red sky + fleeing silhouettes); no nipples; females' chests covered;
   god names light blue in subtitles; smooth transitions, elements fade back in gradually after a dark moment.
5. `episodes/61-zhongshen/sync61.md`: the CUE SHEET for the producer's mix — absolute times (s, 2 decimals) of every sound event in the
   film (each SFX hit with a short name from this family: sistrum, finger cymbals, darbuka hit, frame drum, gong, ney phrase, harp
   gliss, wind, sand hiss, water, stone grind, door boom, chest lid slam, nail taps, falcon cry, lioness roar (ammit_roar_1: short for
   Tefnut, full + music ducked for Sekhmet), purr, page flip, papyrus unroll, senet piece tap, magic shimmer, glyph light, sparkle),
   plus the music sections (start/end, mood: mysterious creation / wonder / playful / tension / danger / warm resolve) and any
   deliberate near-silence with its reason.
6. Check as you go: render key frames of each shot (`SHOT61` / `EP61PIC` stills) and look at them at full size; fix problems; at the
   end render ~1 frame per 2 s of EP61PIC and review the whole film. DO NOT COMMIT IMAGES, VIDEO OR AUDIO (public repo) — code and
   markdown only. COMMIT AFTER EVERY 3–4 SHOTS (so progress is kept if the run stops); if you run short, finish the remaining shots
   simply but completely so the film plays end to end, and list what to polish.
7. `tasks/ep61-film/result.md`: a short Chinese summary (shot list, what is rich/animated, known issues) + render commands
   (full film segments, e.g. node scripts with frame ranges).
Rules: only change `src/qq61/`, `episodes/61-zhongshen/`, `tasks/ep61-film/` (ep60 must render exactly as before). No keys in files.
Set git identity (git config user.name "Claude"; git config user.email "noreply@anthropic.com"). End commits with:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
