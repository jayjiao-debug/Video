# House rules: the owner's standing taste, one rule per idea

This is the file every role reads. Each rule is the general lesson, with a short why and the episode where the
owner said it. The owner's exact words for each note are kept in
`.claude/skills/video-reviewer/references/owner-notes.md` (the raw log).

How to keep it lean:
- A new owner note goes into the raw log first. Then **edit the rule here it belongs to** (sharpen it, or replace
  it if the owner changed their mind). Add a new rule only when no existing one covers it.
- Rules are general. Episode-specific numbers (bar grids, keys, pixel offsets, prop names) belong in that
  episode's `crew_log.md`, not here.
- When a rule can be checked by code, write the check and point to it; the rule then gets shorter.
- Never drop a rule without the owner saying so. When two rules disagree, the newer owner statement wins; record
  the change in the raw log.

Roles: **S** screenwriter · **R** researcher · **A** art director · **N** animator/builder · **E** editor/music
· **P** producer · **D** director/reviewer (checks all of them).

---

## 1. Topic (P, R, S)

1. **The topic is about the viewer's own life** (habits, feelings, friends, time, money). A famous event is only
   the illustration, never the subject. Test: in the first 3 s, would a 20-year-old say 这说的就是我? (ep14)
2. **Shareable beats clever.** Ask "看完会发给谁？" Topics you send to someone (love, friends) had 3–5× the share
   rate of the rest. (account data)
3. **Avoid textbook classics** (survivorship-bias bombers, Monte Carlo, Concorde, Braess, Tacoma, Titanic again).
   Look for lesser-known true stories with a strong physical image. (topic list)
4. **Every film has one thing no earlier episode had** (a set-piece, metaphor or device). The last 3 episodes'
   look, central metaphor and opening device are off limits. (ep13)

## 2. Script (S)

1. **Subtitle-only.** The lines are the narration; no voiceover, no TTS. (ep13)
2. **One line, one idea, readable alone on first read.** ≤ 16 字 where possible. No line that needs the next one
   to decode it. (ep6)
3. **Nothing overclaims.** No line or title whose plain reading is not what the film or the source shows;
   suspense is fine, a false result is not. (ep6, ep13)
4. **Every scene adds something new;** cut repeats, keep the essence. (ep6)
5. **Plain words.** Finance, science and economics topics start from an everyday situation, at most one or two
   plain numbers, no jargon on screen; an unavoidable term is explained in daily words on the next line. (ep26)
6. **Every study or story comes with why it was done,** not only what was found. (ep13)
7. **Don't announce a classic** ("你在中学做过这道题"). Show the situation for real and let viewers recognise it;
   invite recognition only in the end-card question. (pond)
8. **Length is set by the story, not the track.** The owner's comfortable length is about 2:00 (range ~1:40–2:10).
   Cut anything that only repeats. (ep14, ep27, ep35)
9. **Titles:** short, concrete, curiosity without misleading. Always 3 options with reasons. (ep6)
10. **End on the viewer:** a question in the end card that invites comments and sharing. (series)
11. **One idea, varied examples:** when a principle is told through several cases, take them from different
    places, eras and scales ("为什么都是船"), and link them when the facts allow. (《应该没事吧》)

## 3. The opening, first 3 seconds (S, A, N, E)

Viewers decide in 2 s: films with 2s跳出 ≤ 29 % got pushed, ≥ 34.7 % did not. (account data)

1. **Frame 0 is already half the answer:** one recognisable object filling the frame, already moving, subtitle on
   frame 0, no black, empty or intro frame. (ep9, ep11, ep14)
2. **Line 1 is the viewer's own situation and the topic itself,** no detour (galaxy, movie, office). (ep11)
3. **The contradiction lands by ~3 s,** shown as something countable on the picture, not stated. (ep14)
4. **Don't ask the question for them;** show the contradiction so the viewer asks 为什么. (ep14)
5. **Put the viewer in the moment** (first person, their own screen, a specific everyday experience they have
   lived), not a faceless figure decoded from outside. (ep14)
6. **The intro is a tiny story** with a character and an emotional turn, not static panels. (ep13)
7. **Something happens on the music inside the first second.** (ep11)

## 4. Look and visual design (A)

1. **Reuse the engine, never the look.** Every episode gets 2–3 looks from different worlds (not just different
   colours), at least one bold, none repeating the last 3 episodes (§1.4); the owner picks. Log it in
   `looks.md`. (ep11, ep13)
2. **The world belongs to the subject.** Serious/prestige topics get no flat cartoon figures; engineering topics
   suit technical drawings; phone stories suit real app screens. (ep26, ep27, ep14)
3. **Cheap = flat clip-art** (colour blocks, simple houses, cartoon figures), fixed frames, crossfade-only
   editing. **Stunning = rich colour, real light (glow, sheen, refraction), depth, texture** and a look the
   series hasn't used. (ep21)
4. **Not proven, don't reuse as house looks:** 3Blue1Brown black analytic, procedural WebGL landscapes, AI
   anime stills, bright flat game-UI cards, black-with-thin-lines throughout. (ep13)
5. **Pick the medium per shot.** 3D only when a real model holds up at that distance, the light carries it and
   the camera move is the point; otherwise 2.5D (textured layers in a moving camera) or 2D. Write the choice per
   scene before building. Stylised capsule people in 3D read cheap. (ep14)
6. **Dark ≠ black.** A night look still needs mid-tone backgrounds and lit subjects; check mean frame
   luminance (27/255 read as "too dark"). (ep21)
7. **Light:** one motivated key light on the hero; the hero is the brightest readable thing; everything else
   falls off; a dim rim from behind; shadows on; no stacked hard-edged beams; light pools follow the surface
   they land on. (ep26, ep35)
8. **One coherent palette** for every element, UI included; background accents muted toward the ground colour so
   the centre of attention is clear. (ep15)
9. **Fill the frame for a phone.** A landscape film is ~¼ of a portrait phone screen: subjects big, page scenes
   ~80 % of the frame, bigger type beats a different background colour. Quality bar is 1080p, not 4K. (ep11, ep14)
10. **Props carry the joke and the meaning at a glance** (an "embarrassing" T-shirt must look embarrassing).
    Abstract colour blocks read as nothing. Payoff visuals are designed images, never placeholder shapes. (ep14)
11. **Inner states get a literal, concrete picture** (the mind as a see-through copy walking off toward labelled
    worries), never a vague symbol. Don't answer "this scene is weak" with more symbols; act the line out as a
    moment the viewer has lived. (ep14, ep35)
12. **Original designs only:** no real game characters, skins, brand marks or app sound files; make parodies of
    our own. Keep the series' own drawn props over stock pictograms. (ep11, ep13, ep14)
13. **Titles inside the film look like titles** (big, framed), built from the film's own visual language. (ep13, ep29)
14. **No mood effects** (blur, eyelids, dimming, slow-push "emotion") and no extra UI noise. (ep14)
15. **Emotional peaks get the biggest image:** gather energy before, then release; it should be the most
    spectacular frame of the film. (ep28)
16. **Feelings and values get a visible, comparable object** (a heart whose size = how much we care), reused on
    later charts. (ep28)

## 5. People, bodies and contact (A, N)

Code checks the body before the owner sees a person: `references/figure-rules.md`.

1. **No body a real body couldn't make.** Legs start at the hip, joints within human range, standing bodies
   balanced, seated bodies on a declared surface, nothing through solid surfaces. (pond)
2. **Contact poses are solved, never eyeballed.** Whatever a body touches (push, hold, sit, lean, carry) is built
   backwards from contact points with IK, then checked per frame. Only the contact parts touch the object. (ep35)
3. **An action reads in one glance:** whole body, the object and the ground in view, contact visible, the full
   cycle of the task (pick up → do → put down), never a repeating bob that reads as waving. (pond, ep35)
4. **True scale** between figures and props. (ep35)
5. **When direction matters, use profile.** Front-on faceless silhouettes have no direction. (ep14)
6. **Odd anatomy is worse than none.** Avoid realistic hands and faces unless asked. (ep6)
7. **Deaths with restraint:** the body itself fades from inside and gives off light, never dark debris or masks;
   a readable arc (stand → falter → lie down → fade). No depiction of real victims. (ep28, series)

## 6. Motion, camera, transitions (N, E, A)

1. **No slideshow.** No header + figure + caption per scene, no "pop in and hold". One continuous world where
   objects transform into the next idea and something always moves. (ep11, ep12)
2. **Camera through a world:** long moving shots that flow into the next scene, a cinematic push, orbit, fly-in
   or reveal. 运镜舒服、爽. Prefer this over many hard cuts. (ep13, ep21)
3. **Camera discipline:** keep one travel direction in a one-take; no 180° turn-arounds or fast sideways sweeps;
   follow moving things at a fraction of their speed; never through geometry. (ep15, ep14)
4. **Every transition is motivated and different:** a thing that travels, a light that becomes the next light, a
   push into an object, a match shape. Never the same move twice in a film, no dips to black, no white flashes,
   no unrelated jumps. (ep7, ep28)
5. **Clean hand-overs:** the outgoing scene's labels and props leave before the move starts; an object that
   travels between scenes starts from its exact last position. (ep28, ep14)
6. **No interpenetration (穿模)** of props, figures, camera or floors; check with geometry, not only by eye; no
   flickering floors (z-fighting). (ep14, ep15)
7. **Counters match the picture** (no 0→100 count over one visible fish). (pond)
8. **No dead stop before a drop:** keep music and motion running into the hit. (ep29)
9. **When an earlier scene changes, re-check that the next scene still follows from it.** (ep14)

## 7. Text on screen and readability (A, N)

1. **Subtitles:** bold sans (Noto Sans CJK SC Bold / 思源黑体), 64 px at 1080p, white with gold key words,
   centred, a soft dark edge (stroke + blurred shadow) over a borderless feathered shade. No solid box; check on
   the brightest frames. (ep14 v15, ep28)
2. **Labels and demonstrations:** 思源黑体 Bold/Black; key numbers 96–160 px, labels ≥ 56 px, tags ≥ 40 px.
   Serif only on title and end cards. (pond)
3. **Label backgrounds:** a feathered scrim in the scene's own dark colour plus a thin dark halo on the words;
   solid cards only when they are props in the world. (pond)
4. **Centred lines ending in full-width punctuation** (？！。，：；、) pull the trailing half-em back; this lives in
   the shared subtitle/title component and is measured on a rendered frame. (ep28, ep35)
5. **Named categories match their pictures:** each named example carries exactly that label, in spoken order,
   never overlapping. (ep35)
6. **Reasoning in steps:** each step gets its own line on a step-by-step board, one per beat; an analogy sits
   side by side with the case it borrows from. Let the viewer play a model: change one input, show the outcome
   flip. (pond, ep11)
7. **Safe areas:** subtitles in the bottom band, top-left clear for the Douyin watermark, corner mark top-right.

## 8. Music, rhythm and sound (E)

1. **The music is the owner's track, untouched.** One continuous piece from 0:00, sample-identical: no loops,
   cuts, crossfades, resampling, loudnorm or limiting on it. The only edit is one fade-out over the final bar,
   ending on a downbeat. The film fits the song, never the reverse. (ep14) *(see AUDIT: open question 1)*
2. **Measure the music, don't trust metadata:** find the real beat grid and sections from the audio (bar energy,
   onsets) before storyboarding. (ep11, ep14)
3. **Title on the hardest drop,** slammed in (fast scale-down, short damped jolt, no flash), even if it is 40 s
   in; a hook question fills the gap before it. The main payoff lands on the big drop. (ep11, ep28)
4. **Hit what matters, not every beat.** Scene cuts on bars, reveals and stamps on beats, structural moments on
   story turns. Continuous actions keep their own clock. Never pulse the whole frame on the beat; emphasis only on
   the thing that appears. (ep14, edit-rhythm skill)
5. **No long quiet stretch:** on a phone speaker a breakdown more than ~6 dB under the body for longer than a bar
   sounds broken. (ep14)
6. **Endings fall apart and fade;** nothing gets brighter or louder after the last climax. (ep29)
7. **Sound effects: off by default.** Music carries the emotion. Use SFX only when the film's world needs them
   (phone/UI stories), the minimal set (real typing clicks, one soft low message pop tuned to the song's key,
   counter ticks only where a number visibly rolls), sitting at the music's level, never above its peaks. No
   whooshes, thuds or piles of different noises. Prefer CC0 recordings. (ep13, ep14)
8. **Demos must be clean:** struck decaying notes instead of sustained drones; per-ear demos measured per
   channel. (ep29)

## 9. Facts and sources (R, S, D)

Full rules: `references/sources.md`. In short: every on-screen number traces to a verified row in `facts.md`
with a credible primary source; never Wikipedia, 百度百科, 知乎, blogs or AI summaries. (ep9, 抖音小安)

## 10. Brand and platform (P, A, N)

1. **Never write "Juno 出品".** Corner mark ◆ Juno · VIBE知识大赏; the Juno end card (J monogram, gold title,
   question, follow pill `关注 Juno · 一起看懂世界`, sources). 反直觉 is retired. (series)
2. **Platform safety:** no maps with national borders, no QR codes or links, nothing that reads as an ad,
   declare 内容由AI生成, post at most one a day. Bitrate was not why a film got 低质. (2026-10-05)
3. **Never split a film into parts.**

## 11. Process (P)

1. **Preview before render.** After any correction, send the owner the corrected still(s) of exactly that change
   and wait for an OK before re-rendering any part of the film. (pond, 2026-10-12)
2. **Owner's explicit instruction wins** over the crew process (e.g. "skip the gates, send me the scene list").
   (ep14)
3. **The publish package only after the owner says the film is final** (douyin-publish skill).
