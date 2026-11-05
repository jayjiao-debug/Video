# Task: storyboard for ep61 《古埃及众神，其实是一家人》 (Juno / VIBE知识大赏, series 古埃及神话故事, episode 2)

You are working in the repo jayjiao-debug/video. The owner wants a storyboard he can review before any animation is built.
Read first: `episodes/61-zhongshen/script.md` (43 timed subtitle lines, ~2:28, with a first picture idea per line) and
`episodes/61-zhongshen/facts.md` (sources; ✓ = allowed on screen, ⚠ = to verify). Episode 1 of the series is ep60 《死后的心脏》:
its code is `episodes/37-qiqing/remotion/src/qq60/` (look: flat-vector Egyptian tomb-painting style, lapis + gold + terracotta, ink
outlines, the 4:3 frame with Egyptian bands top/bottom and the subtitle band; read `frame60.tsx`, `rig60.tsx`, `cast60.tsx`,
`act60a_kit.tsx` (MaskFront = the frontal Anubis mask), `props60.tsx` (WingedSun, GlyphColumns, featherD), `heart60.tsx`).
The new episode must look like the same series.

## Owner's rules for this episode
- Every god's design must be the ATTESTED ancient Egyptian iconography (head, crown/headdress, held objects, skin colour), each
  backed by a museum object or a scholarly source (Met, British Museum, Louvre, Brooklyn, Egyptian Museum, academic papers).
  Never Wikipedia, 百度百科 or 知乎.
- Every god gets ONE animation beat that sells the character: e.g. Tefnut and Sekhmet ROAR (sound: the ep60 approved lioness roar
  take `ammit_roar_1`; short for Tefnut, full and with the music ducked for Sekhmet), Shu lifts Nut, Thoth writes / plays senet with
  the Moon, Isis spreads her wings, Set sneers in a sandstorm, Horus gives a falcon cry, Bastet licks her paw / shakes the sistrum,
  Anubis's ears twitch, Ma'at's feather drifts onto the balance.
- "Fabulous but simple to understand": a first-time viewer understands every shot within ~2 s from picture + line. The family tree is
  the throughline: it grows generation by generation and each newly introduced god lights up in it.
- No camera shake; camera moves ≤ 25 px per frame, no whip pans; transitions motivated (match on shape, light or motion).
- Layering must make sense (who is in front of whom, hands over held objects, nothing through heads).
- No gore: Set's murder of Osiris is the chest closing, never a body; Sekhmet's rampage is a red sky and fleeing silhouettes.

## Deliverables (commit to this branch, under the paths given)
1. `episodes/61-zhongshen/storyboard.md`
   - Group the 43 lines into ~18–22 shots (a picture holds 1–2 lines, ~4–5 s, as in ep60). For each shot: number, time range (from
     script.md's start times), the line(s), framing (wide / medium / close), camera move, layer order back → front, the god(s) on
     screen with their design (pointing to the iconography table), the animation beat, the transition into the next shot, the SFX
     cue (Egyptian family: sistrum, finger cymbals, darbuka, ney, gong; the lioness roar as above) and the music mood.
   - The family-tree design: a layout of all nodes (Atum-Ra on top; Shu + Tefnut; Geb + Nut; Osiris, Isis, Set, Nephthys; Horus;
     Anubis; Ra's daughters Sekhmet, Bastet, Ma'at; Thoth beside the tree as the scribe), how it lights up shot by shot, and the final
     frame (which will also be exported as a standalone "family tree" image for the pinned comment).
   - An iconography table I1…In: god → head, crown, objects, colours, the source (object name + museum + accession number + URL).
2. Add the I-rows to `episodes/61-zhongshen/facts.md`, and try to verify the ⚠ rows (F2, F3, F5, F10, F11, F16 "80 years",
   F18, F19, F20) with quotes from museum / academic sources; mark each ✓ with the quote or ✗ with what to change in the line.
3. Board frames as CODE: `episodes/37-qiqing/remotion/src/qq61/board61.tsx` (+ any `cast61.tsx` / helpers in `src/qq61/`) that
   calls `registerRoot` and registers composition `BOARD61` (1440 × 1080, 30 fps, durationInFrames = number of shots; frame i = the
   key frame of shot i+1). Rough but readable boards, in the ep60 style, reusing the ep60 components (import from `../qq60/...`):
   the frame bands + subtitle band with the shot's line, a small shot-number label, the gods drawn with the ep60 rig (`God`, `CAST`:
   anubis, thoth, osiris, horus, isis) and new casts for the gods ep60 does not have (Atum, Ra, Shu, Tefnut, Geb, Nut, Set, Nephthys,
   Sekhmet, Bastet, Ma'at) built the same way (extend, don't fork, the rig types; keep ep60 rendering unchanged).
   Render all frames in the runner to check they compile and read well, e.g.
   `cd episodes/37-qiqing/remotion && ENTRY=qq61/board61 CID=BOARD61 JPG=1 node scripts/frame.mjs stills /tmp/board 0 0.0333 0.0667 …`
   (seconds = frame/30), look at them, and fix what is wrong.
   DO NOT COMMIT ANY IMAGE, VIDEO OR AUDIO FILE (the repo is public). Commit only code and markdown.
4. `tasks/ep61-storyboard/result.md`: a short summary for the owner in Chinese (shot count, the family-tree idea, what each god does,
   which ⚠ facts got verified or changed, anything still missing), plus the exact command to render the boards.

## Rules
- No keys/tokens in any file. No Wikipedia/百度百科/知乎. No bordered maps. Do not change files outside `episodes/61-zhongshen/`,
  `episodes/37-qiqing/remotion/src/qq61/` and `tasks/ep61-storyboard/` (except: you may add exports to qq60 files only if needed,
  without changing what they render).
- End git commit messages with:
  Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
