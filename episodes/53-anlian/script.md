# Script: 你们互相喜欢，却都在等对方先开口 (v1)

**Logline:** Two people secretly like each other; each is sure their own feelings are obvious and reads the
other's silence as "not interested" — the exact same silence, read two opposite ways, for three years.
**Takeaway:** 你以为自己很明显，其实对方什么都没看出来——所以别等了。
**Length:** 122.43 s (fixed to `music/bgm.mp3`, fade 120.39 → 122.43)

## Title options
1. **没人先开口** (5字) — plain, matches the brief's working title exactly; names the paradox with zero decoding
   needed; does not overclaim a number or a guaranteed outcome.
2. **同一个沉默，两个答案** (9字) — states the film's actual twist (one silence, two different readings) rather
   than a generic "暗恋" label; still a question in the viewer's head, not an answer given away.
3. **你以为很明显，TA没看出来** (10字) — pulls directly from the brief's frame-0 hook line and the takeaway;
   the clearest "about you" framing of the three, safest against overclaiming since it states a finding
   (illusion of transparency), not a promise ("will work on your crush").

*Recommendation: title card at 16.61 s reads 为什么，没人先开口 (already in the lines); any of the three options
above can sit on the Juno title stamp without changing a single timed line.*

## Beat sheet
| Beat | Time (s) | Purpose | What the viewer learns / feels |
|---|---|---|---|
| Hook (ending first) | 0 – 9.49 | Pose the paradox with a concrete image: a wedding invitation, the wrong bride, a note that reveals he liked her too | Curiosity: if he liked her, why did she end up watching him marry someone else? |
| Turn + rewind | 9.49 – 16.61 | Ask the question out loud, then rewind the picture (not just a hard cut) back three years | Sets up "we are about to find out what actually happened" |
| Title / setup (her side) | 16.61 – 49.17 | 三年前: she likes him, thinks it's obvious (big visible heart); illusion-of-transparency numbers land as "about you" | 原来如此 #1: what feels obvious to you is invisible to everyone else |
| Break (the almost-text) | 49.17 – 65.45 | Quiet, intimate: she types and deletes a confession, sends "没事，晚安" instead; hard cut reveals he did the identical thing at the identical time | This isn't just her problem — it's symmetrical, and it's happening right now to real people |
| Build (the mirror, stated twice) | 65.45 – 81.73 | Her fear → his reading; his fear → her reading, same mechanism run on both sides | 原来如此 #2: the barrier isn't rejection, it's a translation error |
| DROP = the reveal | 81.73 – 111.75 | Split-screen: the *same* silence, read as "不" by both; "你给自己的沉默找理由，却不给对方同样的理由"; liking-gap fact widens the mechanism to everyone, not just crushes | 原来如此 #3: this cognitive trap is named, measured, and happens to strangers and roommates alike |
| Fast-forward bookend | 111.75 – 114.29 | The rewind runs forward again, back to the wedding invitation from the cold open | Returns the viewer to the opening image with new understanding |
| Payoff + end card | 114.29 – 122.43 | Hedged regret fact, "也许ta也在等", paper plane finally crosses, end-card question | Takeaway lands + prompts a forward/comment |

## Timed table

Hit/bar column cites `music/music_map.md` and `music/hits.json`. All picture/animation is coded (Remotion
scene graph driving three.js planet/character objects + SVG overlays for paper props, text and the heart
meter); no AI-generated stills in the film (the `style/hook_concept/*.png` frames are mood reference only).

| Time (s) | Hit/bar | Subtitle | Picture & animation (coded) | Transition → next (exact s) |
|---|---|---|---|---|
| 0.00–1.35 | beat 1.35 | 三年后 | Remotion: cold open on her tiny round planet (three.js, pastel toon shading), she (short bob, yellow sweater) stands on it; a red wedding invitation already mid-flight toward camera, moving from frame 0 — no black/empty frame. | Card visibly opens (hinge-fold, SVG paper-grain/feTurbulence edge) exactly on the hit → 1.35 |
| 1.35–3.39 | beat 3.39 | 她收到一张请帖 | Invitation fully open in her hands; camera pushes in on the gold-foil text (coded SVG text reveal, letters fade up in reading order, not per-beat). | Hard cut, match-cut on the invitation's shape morphing into a wedding arch on a second, farther planet → 3.39 |
| 3.39–5.42 | beat 5.42 | 新娘，不是她 | Wide shot: the wedding-arch planet, a groom (messy dark hair, black suit) and a bride with clearly long/pinned-up hair (three.js chibi rig) — her planet sits small and grey in the background, she is not in the scene. | A folded note slips out of the invitation prop still in frame and drifts down (physical fall, eased, not beat-locked) → 5.42 |
| 5.42–7.46 | beat 7.46 | 一张纸条，掉了出来 | Close-up: the note unfolds on its own fold line (SVG path animation); a small hand-drawn heart is visible on it before the text resolves. | Text on the note sharpens into focus, timed to land with the line at 7.46 |
| 7.46–9.49 | beat 9.49 | 他也喜欢过她 | The note's handwriting renders in full (思源黑体-styled handwriting font via SVG), heart icon pulses once (not looping) next to it. | Freeze-frame punch (scale snap, ≤3 per scene budget) → the whole frame starts visibly running in reverse on the next beat |
| 9.49–12.00 | bar (9.49) | 那三年，发生了什么 | Everything on screen (invitation, note, planets) begins sliding backward/shrinking — the rewind's own physical clock (petals/confetti flying up, not beat-locked), speed lines and a small ◀◀ mark appear (SVG). | Rewind visibly accelerates frame over frame (easing curve, not linear) |
| 12.00–14.30 | — (named visual beat: rewind) | 倒带 | Rewind at full speed: note slides back into its fold, into the envelope, the envelope back into an unopened invitation; a floating calendar counter runs backward (3D text counter, three.js) toward "−3年"; paper-flutter and grain overlay throughout. | Continuous accelerating rewind, no cut, into the next line |
| 14.30–16.61 | lands on 16.61 | 回到三年前 | Rewind reaches top speed, planets spin backward hard, counter reads "−3年" and locks. | Hard stop exactly on the 16.61 downbeat — the strongest entry in the intro |
| 16.61–18.65 | bar 16.61 (first big entry) | 三年前 | Title-card beat: the calendar counter freezes on "三年前" in large type over her planet, now in full colour (vs. the grey/background version from the cold open). | Title card holds (named exception to the gap rule, ≤3s total across 16.61–20.68) then the counter card dissolves to reveal her planet in a normal daytime scene → 18.65 |
| 18.65–20.68 | bar 18.65 | 为什么，没人先开口 | One of the 3 title options stamps in on this line (slam-in: fast scale-down + short damped jolt, no flash) over the same planet shot. | Title stamp clears, cut to a two-planet establishing wide (her + his, both visible, far apart) → 20.68 |
| 20.68–23.42 | bar 20.68 | 这样的故事，你身边一定有 | Wide shot holds: both planets visible, small and distant from each other in the pastel sky — establishes this is a fictional illustrative scene, not a real couple. | Camera drifts in toward her planet only (slow, continuous, not a cut) → 23.42 |
| 23.42–25.19 | bar 23.42 | 她喜欢他 | Push-in completes on her planet; she looks across the gap toward his distant planet (eyeline established with a dotted SVG sightline). | A heart icon begins growing above her head (SVG, scale animates over the next 2 lines, not a hard cut) |
| 25.19–27.39 | bar 25.19 | 她以为，自己很明显 | The heart above her head is now large and bright, pulsing gently (slow, not on-beat) to read as "obvious to her." | Hold on the heart, no cut — motion carries the beat |
| 27.39–29.64 | bar 27.39 | 心里有颗大心 | Same heart, now rendered with a soft glow/bloom (three.js post-process) to emphasize scale. | Camera whip-pans across the gap to his planet, arriving as the heart from her side shrinks in the distance behind → 29.64 |
| 29.64–32.07 | bar 29.64 | 可落到他眼里 | On his planet: he is looking at her tiny, distant planet — her heart icon is now barely a pixel-sized dot from his point of view (same object, rendered to scale, proving the signal-amplification bias visually). | Hard cut in to a close-up on his face, blank/unaware expression → 32.07 |
| 32.07–34.11 | bar 32.07 | 什么，都没有 | Extreme close on his eyes scanning her direction — nothing registers; no heart, no highlight, flat neutral reaction. | Cut to a direct-camera framing (his planet's view becomes the viewer's view) for the address line → 34.11 |
| 34.11–36.65 | bar 34.11 (pre-break fill zone) | 你是不是也以为 | Direct-address shot: the "camera" is now looking back at the viewer from inside the scene (a light vignette treatment marks this as an address beat, reused for every "about you" line in the film). | Cut back to her planet, now showing a stylised speech/thought bubble above her head → 36.65 |
| 36.65–38.69 | bar 36.65 | 自己的暗示很明显 | Her thought bubble fills with a bright, oversized version of a signal (a glowing wave/ripple icon labelled implicitly by size, not text — "明显" shown as scale). | The same ripple icon is redrawn tiny and faded on his side of a split-frame → 38.69 |
| 38.69–41.23 | fill 46.63 zone is later; here on bar 38.69 | 对方根本没收到 | Split-screen holds: her large ripple vs. his nearly invisible one, same icon, same moment, radically different sizes — the signal-amplification bias made literal (fact #4, mechanism only, no number). | Cut to direct-address framing again → 41.23 |
| 41.23–43.27 | bar 41.23 | 撒谎时，你以为 | Direct-address shot (reused treatment); a small "lie" prop appears in the viewer's hand (a playing card face-down, simple SVG) to cue the upcoming experiment. | A percentage dial begins drawing in (SVG arc, draws over the next 2 lines, not snapped to a beat) → 43.27 |
| 43.27–45.81 | bar 43.27 | 近一半人能看穿你 | Dial draws up to "48.8%" (fact #5, Gilovich et al. 1998, Study 1a) in large 思源黑体 Black numerals on a dark panel. | Dial holds at 48.8%, a second smaller dial starts drawing below it → 45.81 |
| 45.81–48.05 | bar 45.81 | 其实只有四分之一 | Second dial completes at "25.6%" directly under the first, same scale, inviting a visual comparison (both numbers on screen together). | Both dials freeze side by side (no further motion — this is the held "read it" moment) → 48.05 |
| 48.05–50.17 | bar 48.05 | 和瞎猜，没区别 | A faint dashed line/band appears across both dials marking "chance level," visually proving 25.6% sits on it. | Hard cut to a night scene: her bedroom, phone in hand → 50.17 |
| 50.17–52.30 | break, quiet | 那晚，她打字 | Slow intimate shot: her phone screen fills frame, a message draft being typed character by character (continuous typing clock, NOT beat-locked, small irregularities per edit-rhythm.md). | Backspace animation clears the draft (physical typing/deleting clock) → 52.30 |
| 52.30–54.43 | break | 删掉，又打字 | She retypes, pauses, the cursor blinks (its own steady clock, not the beat). | Hold on the blinking cursor as text resolves differently this time → 54.43 |
| 54.43–56.80 | break | 这句话，你也删过吧 | Direct-address treatment layered over her phone screen (the viewer's own thumb briefly implied hovering near the send button). | Cut back to her screen alone → 56.80 |
| 56.80–58.60 | break | 最后发的是 | Her thumb hovers over send; the draft behind it is still visible but greyed, about to vanish. | The real message types itself in (short, 2-word) → 58.60 |
| 58.60–60.40 | break | 没事，晚安 | Message sends; a small "sent" check appears (no sound sting here — break stays quiet per music_map). | Hold on the sent bubble, slow fade starts → 60.40 |
| 60.40–63.42 | break, lands on riser 63.42 | 你是不是，也发过 | Direct-address treatment again (same vignette cue) — the sent bubble from her phone is still faintly visible behind the viewer framing. | On 63.42, the first of four riser hits triggers a hard pop-cut to his planet |
| 63.42–65.45 | risers 63.42/63.93/64.43/64.94 | 同一时间，他也是 | Four quick pop-cuts (one per riser hit, tier-1 structural per edit-rhythm.md) land on: his phone, his draft, his backspace, his own "没事，晚安" sent — mirroring her sequence beat for beat without repeating any shot. | Last pop-cut holds on his sent message → 65.45 |
| 65.45–68.00 | build 65.45 | 她没开口，怕被拒绝 | Her planet: a small "我怕" label appears beside her (simple SVG tag, not a number), her heart icon from earlier now looks smaller/guarded. | Cut across the gap to his planet, looking at her → 68.00 |
| 68.00–70.20 | build | 他看她沉默 | His planet: he watches her silence (a stylised static/frozen speech bubble above her distant planet, rendered from his POV). | Hold, a thought-bubble opens above his head → 70.20 |
| 70.20–73.07 | build | 以为她没兴趣 | His thought bubble fills with "没兴趣" (text label, plain), not a question mark — he's certain, not wondering. | Cut to direct-address framing → 73.07 |
| 73.07–75.61 | build | 换成你，是不是也是 | Direct-address shot (reused vignette), the "没兴趣" label from his thought bubble lingers faintly behind the frame. | Cut to his planet, now the one who stays silent → 75.61 |
| 75.61–78.16 | build | 他没开口，怕被拒绝 | Mirrors the earlier her-side shot exactly (same "我怕" tag style) beside him now, proving visual symmetry. | Cut across the gap to her planet watching him → 78.16 |
| 78.16–79.95 | build | 她看他沉默 | Her planet: she watches his silence (mirrored framing of the earlier "他看她沉默" shot, same camera angle flipped). | Her thought bubble opens → 79.95 |
| 79.95–81.73 | build, lands on 81.73 drop | 以为他没兴趣 | Her thought bubble fills with "没兴趣" — identical label/style to his, landing exactly as the drop hits. | On the drop, hard cut to the full split-screen reveal shot |
| 81.73–83.77 | DROP 81.73 | 同一个沉默 | Split-screen: her planet (left) and his planet (right) simultaneously, both frozen in the identical silent pose, the same beat of silence shown twice. | Both "没兴趣" thought-bubbles (from the two previous scenes) fly in and land, one over each side → 83.77 |
| 83.77–86.30 | bar 83.77 | 两个人都读成了 | Both bubbles pulse once together (synchronized, a rare intentional beat-tied moment — budget allows one tier-2 hit here). | The two bubbles merge into one giant shared bubble in the centre seam of the split screen → 86.30 |
| 86.30–88.50 | bar 86.30 | 一个字：不 | The merged bubble resolves to a single large "不" character, filling the seam between both planets. | The "不" character shatters into two mirrored "我怕" tags that fly back to their own sides → 88.50 |
| 88.50–91.00 | bar 88.50 | 你给沉默找理由 | Direct-address shot: the viewer is handed one of the "我怕" tags directly (simple hand-to-camera prop motion). | The same tag is shown being offered toward the other planet and bouncing off → 91.00 |
| 91.00–92.90 | bar 91.00 | 我怕 | Close on the tag, label large and alone on screen — the shortest line in the film, held just long enough to read once. | Tag flips over, revealing blank other side → 92.90 |
| 92.90–95.20 | bar 92.90 | 却不给对方 | The blank tag drifts toward the other planet and fails to stick (bounces off, no label applied there). | Cut to direct-address → 95.20 |
| 95.20–97.50 | bar 95.20 | 你也一样吧 | Direct-address shot, same vignette treatment, closing the thought. | Cut to a new scene: two small featureless chibi silhouettes meeting for the first time (new props, not her/him — signals a new, separate example) → 97.50 |
| 97.50–100.55 | bar 97.50, approaching 100.55 hit | 两个陌生人，聊5分钟 | Two strangers (generic silhouettes, intentionally not her/him) talk; a small timer counts up in the corner (its own steady clock) to "5:00". | Timer hits 5:00 exactly on the beat → 100.55 |
| 100.55–102.80 | bar 100.55 | 你也会，低估 | Direct-address shot, same vignette, timer still visible faintly behind. | Cut to both strangers shown with a "liking" meter above each head → 102.80 |
| 102.80–105.34 | bar 102.80 | 对方有多喜欢自己 | Both meters reveal: actual liking (fuller bar, labelled subtly by fill level only) vs. each person's *guess* of the other's liking (shorter bar) — fact #7 (Boothby et al. 2018), shown as a gap, no raw numbers needed on screen. | Cut to direct-address → 105.34 |
| 105.34–106.86 | bar 105.34 | 你也错过 | Direct-address shot, same vignette treatment. | Cut to a dorm-room scene (two roommate silhouettes) with a calendar on the wall → 106.86 |
| 106.86–108.69 | bar 106.86 | 能从9月拖到 | Calendar page flips from "9月" forward (physical page-turn clock, its own pace, not beat-locked). | Pages keep flipping → 108.69 |
| 108.69–111.75 | fill 111.75 | 次年2月才散 | Calendar lands on "2月" of the following year exactly as the big fill hits; the liking-gap meters from the earlier scene finally equalize on this frame. | On the fill (111.75–113.27, four strong hits), hard cut begins the forward-rewind sequence |
| 111.75–114.29 | fill 111.75/112.25/112.76/113.27, lands on bar 114.29 | 快进，回到现在 | The forward-rewind: all previous scenes (dorm, strangers, the split-screen, the mirror build) flash forward rapidly in reverse order of how they appeared — the exact visual inverse of the opening rewind (same assets, played forward now), landing back on the wedding-invitation shot from frame 0. | Lands precisely back on the cold-open composition (same camera framing as 0.00–1.35) → 114.29 |
| 114.29–116.83 | bar 114.29 (last phrase begins) | 多年后，你更可能后悔 | On the wedding-invitation shot: the note with the heart (from the cold open) is now held in her hand, in focus. | Direct-address vignette fades in softly over the same shot (no hard cut, just a treatment change) → 116.83 |
| 116.83–118.87 | bar 116.83 | 没说的那句话 | Same shot continues, the note's heart icon glows once, gently (fact #8, hedged "更可能"). | A small paper plane folds itself from the note (SVG fold animation) → 118.87 |
| 118.87–120.90 | bar 118.87 | 此刻，ta也在等 | The paper plane lifts off her hand, the camera pulls back to show both planets again, now closer together than at 20.68 (visual callback). | The plane begins its flight across the gap between the two planets → 120.90 |
| 120.90–122.43 | fade 120.39 → 122.43 | 发给ta | The paper plane completes its crossing and lands on his planet exactly as the music fades; Juno end card fades in starting ~116.3 and is fully up by the final frame. | Film ends at 122.43 (hard stop, no further audio) |

## End card
**Question for comments:** 你有没有一句，一直没说出口的话？
**@ prompt:** @ 那个你一直没开口的人 (forward target per brief: the person you like, or a friend with a crush)
**Sources line:** Vorauer & Ratner 1996 · Gilovich, Savitsky & Medvec 1998 · Boothby et al. 2018 · Gilovich & Medvec 1994 — 心理学研究，细节见评论区置顶

## Fact citations used on screen
- Fact #4 (row 4, facts.md) — signal-amplification bias, mechanism only, no number: lines at 36.65–41.23 ("自己的暗示很明显" / "对方根本没收到").
- Fact #5 (row 5) — 48.8% vs 25.6%, verified: lines at 43.27–48.05.
- Fact #7 (row 7) — the liking gap, strangers after 5 min + roommates to February, verified: lines at 97.50–111.75.
- Fact #8 (row 8) — regret of inaction, hedged ("更可能", never "84%"): line at 114.29–116.83.
- Rows 1–3 (pluralistic ignorance mechanism) carry the film's central "same silence, two readings" beat
  (81.73–92.90) as mechanism only — no percentage from Vorauer & Ratner 1996 appears on screen, per facts.md's
  flag that those numbers are unverified-strength.
- Rows 10–11 (unverified "暗恋成功率" stats, no China-specific data) — not used anywhere in the film.
- The story itself (her/him/the wedding) is explicitly flagged as fictional/illustrative at 20.68–23.42
  ("这样的故事，你身边一定有"), per the outline's requirement.
