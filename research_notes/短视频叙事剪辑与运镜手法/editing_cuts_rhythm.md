# Where to Cut and How to Cut to Music (adapted to music-only, subtitle-only animated explainers)

Scope: rules for a ~2-minute landscape knowledge video with no narration (one music track, burned-in subtitles, code-built 3D/2D animation), where every scene is a pure function of time and cuts are written as music beat indices.

Local context found in repo: the existing pipeline's subtitle reader model is `duration = clamp(base 0.9 s + n_chars / 4.6 cps, min 1.9 s, max 6.0 s)`, gap 0.25 s (`/home/claude/video/explainer/pipeline/timeline.py` lines 20 and 47). That is far more conservative than broadcast subtitle norms, which is appropriate when the viewer must also read animated data (see Q6).

---

## Q1. Murch's Rule of Six and blink theory, applied when there are no actors, only animated scenes and text

### Takeaway
Murch ranks a cut's justification as Emotion 51% > Story 23% > Rhythm 10% > Eye-trace 7% > 2D screen plane 5% > 3D space 4%, and tells editors to give up the lower items first. The ideal cut falls where a thought ends (the "blink"). In an explainer with no actors, "emotion" means the viewer's surprise or understanding, and the "blink" is the moment a visual claim has been fully shown and read.

### Cited Findings
- The six criteria in priority order: emotion, story, rhythm, eye trace, 2D plane of screen, 3D space. Emotion carries 51%, which outweighs the other five combined. Murch: "If you have to give up something, don't ever give up emotion before story. Don't give up story before rhythm..." — [No Film School](https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch)
- Full weights: Emotion 51%, Story 23%, Rhythm 10%, Eye Trace 7%, 2D Screen Plane 5%, 3D Spatial Continuity 4% — [FilmDaft](https://filmdaft.com/walter-murchs-rule-of-six-the-editors-formula-for-choosing-the-right-cut/); also listed at [UT Austin RTF318 wiki](https://cloud.wikis.utexas.edu/wiki/spaces/rtf318/pages/80022510/Murch+s+Rule+of+Six) and [The Script Lab](https://thescriptlab.com/features/screenwriting-101/10523-what-screenwriters-can-learn-from-academy-award-winner-walter-murch-rule-of-6)
- Blink theory as summarised: "We blink when a thought ends or an emotion shifts. Cut at that moment, and the viewer won't notice the edit." — [FilmDaft](https://filmdaft.com/walter-murchs-rule-of-six-the-editors-formula-for-choosing-the-right-cut/)
- 2D plane means keeping screen direction (a subject leaving left re-enters from the right in the next shot). 3D space means the viewer understands where things are in space. Both rank lowest because strong emotion and story can override them — [FilmDaft](https://filmdaft.com/walter-murchs-rule-of-six-the-editors-formula-for-choosing-the-right-cut/)

### Inferences (engine rules)
- **R1.1 Map the six criteria to explainer terms.** Emotion = the beat of surprise, tension or relief in the argument (a counter-intuitive number landing). Story = the logical step (claim, then evidence, then consequence). Rhythm = the music grid. Eye-trace = the focal point's screen position. 2D plane = direction of motion and axis layout (time flowing left to right, "up" meaning more). 3D space = camera orientation in 3D scenes.
- **R1.2 Cut-priority function.** When choosing between candidate beat indices for a cut, score them in this order: (1) Does the previous scene's idea land, with the key number or object fully revealed and the subtitle read? (2) Does the cut start the next logical step? (3) Is it on a musically meaningful position? (4) Does the focal point stay close across the cut? (5) Is motion direction consistent? (6) Is the camera orientation consistent? Never move a cut earlier onto a nicer beat if that truncates the reveal or the reading time. That would trade emotion or story (51% + 23%) for rhythm (10%).
- **R1.3 Engine "blink" = a thought boundary.** A cut is allowed only after (a) the scene's last reveal animation has settled (its easing has reached at least about 95%), and (b) the current subtitle has reached its minimum reading time. Encode this as `earliestCut = max(lastRevealSettleT, subtitleStartT + minReadT) + holdT`, then snap forward to the next eligible beat.
- **R1.4 Hold after the reveal.** Give the viewer a short "absorb" hold after the key reveal before cutting, so the thought can end. A reasonable default is 0.5 to 1 beat at a typical 90 to 120 BPM tempo (an inference; no source gives a number).
- **R1.5 Screen direction is part of the grammar.** If a sequence shows time or causality, keep it flowing left to right in every scene (2D-plane rule). Reverse it only on purpose, for example to show a reversal in the story.

### Gaps
- I did not access Murch's own text of *In the Blink of an Eye* directly. The blink quote above is a secondary paraphrase. Murch's broader claim that blinks punctuate thought, and his anecdote about Gene Hackman's blinks, come from my own background knowledge and were not verified in this session.
- No source addresses how to apply the Rule of Six to non-performative, animated or data content. R1.1 to R1.5 are my own adaptation.

---

## Q2. Continuity, cutting on action, match cuts, J/L-cuts: equivalents when the only audio is music

### Takeaway
The classical tools (match on action, graphic or shape or colour match, sound bridges) all carry something continuous across the cut. When there is no dialogue, the carriers become motion vectors, shapes, colours or screen positions, the subtitle layer, and the music itself. A J/L-cut becomes a deliberate offset between the visual cut, the subtitle change and the musical accent.

### Cited Findings
- Graphic match cuts use "elements from the previous scene to fluidly bring the viewer through to the next scene". Subtypes include symbolic, colour (for example flame to sunrise in *Lawrence of Arabia*) and shape (bone to satellite in *2001*) — [StudioBinder](https://www.studiobinder.com/blog/match-cuts-types-of-cuts/)
- Match-on-action cuts "draw a direct connection between the actions within both scenes"; movement carries the viewer to the next location. Cutting on action transitions "at the moment impact occurs" — [StudioBinder](https://www.studiobinder.com/blog/match-cuts-types-of-cuts/)
- A sound bridge is "any time audio is used in a scene transition", including J-cuts and L-cuts, where audio overlaps the visual transition — [StudioBinder](https://www.studiobinder.com/blog/match-cuts-types-of-cuts/); see also [Vimeo on J/L cuts](https://vimeo.com/blog/post/j-cuts-l-cuts)
- A repeat cut "overlaps frames to create a stutter effect, emphasizing a movement" — [StudioBinder](https://www.studiobinder.com/blog/match-cuts-types-of-cuts/)
- Off-beat cuts are justified by action: "a hand reaching for a door, a dancer's turn, or camera movement. The gesture supplies continuity while the music supplies momentum" — [davinciresolve21.com](https://davinciresolve21.com/blog/how-to-edit-video-to-music-without-cutting-on-beat)
- Eye-tracking research found that viewers re-orient faster after cuts whose two shots are visually similar: saccadic reaction times were 23 ms shorter after high-similarity cuts than low-similarity ones, and 9 ms shorter for within-scene than between-scene cuts. Colour similarity was measured with RGB histograms — [Valuch et al., "The Effect of Cinematic Cuts on Human Attention", Univ. Vienna](https://csc.univie.ac.at/paper/ValAnsBucPatSch14.pdf)

### Inferences (engine rules)
- **R2.1 Motion-carry cut, the analogue of a match on action.** If the outgoing scene has an object moving with velocity v at the cut, the incoming scene should begin with something moving in the same direction, at a similar screen speed, near the same screen position. For example, a camera dolly forward becomes the next scene's dolly forward, and a bar growing upward becomes a rocket rising. In engine terms, scene B's camera or primary motion at `t=0` should match scene A's at `t=end`, with velocity direction within about ±30°. Cut mid-motion (around 1/3 to 1/2 of the way through the move), not after the move has stopped.
- **R2.2 Shape, colour and position match, the analogue of a graphic match.** End scene A with the focal object (a circle, a coin, a planet, a data dot) at screen position P and colour C, and open scene B with a different object of similar silhouette, colour and position. Per Valuch et al., visual similarity speeds re-orientation, so for data-heavy transitions reuse the palette and focal position.
- **R2.3 Morph or "continuous object" transition.** Code-built scenes can do better than a cut: the same object (a number, a dot, a shape) persists and transforms into the next scene's element, like a cut with zero eye-trace cost. Use this for the main logical chain. Save hard cuts for change-of-topic or impact moments.
- **R2.4 Subtitle J-cut.** The next scene's subtitle may appear 2 to 6 frames before the visual cut, leading the viewer into the new idea, much as dialogue leads in a J-cut. Use this when the next scene's first frame is visually ambiguous without the text.
- **R2.5 Subtitle L-cut.** The previous subtitle may persist briefly over the new scene, landing like a conclusion. Use this sparingly, because it conflicts with subtitle norms on crossing shot changes (see Q6). Only do it when the line is a punchline and has enough remaining reading time. Otherwise clear it before the cut.
- **R2.6 Music as the sound bridge.** A sustained musical phrase that runs across a cut is the music-only version of an L-cut. Its continuity is what lets a cut that is not on the beat still feel connected. So cuts placed mid-phrase feel joined; cuts placed on a phrase boundary feel like a chapter change.
- **R2.7 Repeat or stutter cut on an accent.** For a big reveal on a drop, a 2 to 3 beat stutter (replaying the last 4 to 8 frames of an impact) is the equivalent of a repeat cut. Use it at most about once per video.

### Gaps
- I found no empirical studies of match cuts in motion graphics or explainer contexts. R2.x are extrapolations from live-action practice plus the one eye-tracking study.

---

## Q3. Cutting to music (卡点): what lands on beats and drops, what should not, phrase structure, builds and breaks, rhythm variation

### Takeaway
Professional guidance agrees on five points. Cut on phrase boundaries rather than on every pulse. Reserve hard sync for big musical changes, used once or twice per sequence. Let action or motion justify off-beat cuts. Vary shot lengths so the rhythm has shape. Consider placing a cut a few frames before or after the accent rather than exactly on it. Beat-detection tools (剪映 踩节拍) give dense or sparse markers, but the editor still chooses which to use.

### Cited Findings
- "You never want to cut your film too closely to the beat of the track." Cutting to "a big change in your music cue" works "once or twice in a sequence ... but doing it on every cut will start to feel redundant." — [Noam Kroll via PremiumBeat](https://www.premiumbeat.com/blog/wp-json/wp/v2/posts/46125)
- Kroll suggests placing "your edit points just a few frames before or after the change in the song", which can feel "more powerful and organic" than perfect sync — [PremiumBeat / Noam Kroll](https://www.premiumbeat.com/blog/wp-json/wp/v2/posts/46125)
- Cut when "a complete musical thought" ends, which you can identify by changes in melody, chord, vocal or instrumentation. "The beat still matters, but it becomes the floor under the edit rather than a grid that every shot must obey." — [davinciresolve21.com](https://davinciresolve21.com/blog/how-to-edit-video-to-music-without-cutting-on-beat)
- A cut slightly before an accent builds anticipation, putting the new image up before the snare or downbeat. The same source cautions: "Do not turn 'a little before' into a hidden timing rule." — [davinciresolve21.com](https://davinciresolve21.com/blog/how-to-edit-video-to-music-without-cutting-on-beat)
- Alternate long holds with brief shots: "Extended static shots can make subsequent cuts feel faster; rapid sequences can make later longer holds feel restful." — [davinciresolve21.com](https://davinciresolve21.com/blog/how-to-edit-video-to-music-without-cutting-on-beat)
- Pearlman (*Cutting Rhythms*): rhythm is "a felt experience that guides an audience through cycles of tension and release." The editor shapes timing, pacing and "trajectory phrasing" (manipulating "time, energy and movement") across physical, emotional and event rhythms — [Senses of Cinema review](https://www.sensesofcinema.com/2026/book-reviews/feeling-the-screen-storys-pulse-karen-peralmans-cutting-rhythms-creative-film-editing/); book: [Routledge](https://www.routledge.com/9781138856516)
- 剪映's 踩节拍 auto-beat feature offers two levels: Level I gives sparse markers and Level II gives dense markers. Manual markers can be added with the M key, and can be clip markers or track markers. Clips with embedded music need the audio extracted first — [Bilibili 剪映 tutorial](https://www.bilibili.com/opus/997245505859747861)
- Adobe community threads, CapCut "beat detection workflow" pages and AI-pacing blogs also discuss beat-cutting, but they are vendor or community material — [CapCut](https://www.capcut.com/create/beat-detection-workflow-goal-compilation-edits), [Adobe Community](https://community.adobe.com/t5/video-lounge-discussions/editing-with-music/m-p/12801378/highlight/true), [Nemo: fix pacing and repetition](https://www.nemovideo.com/blog/ai-video-editing/ai-dance-video-editing-pacing-repetition)

### Inferences (engine rules for cuts as beat indices)
- **R3.1 Three tiers of grid.** Precompute `beats[]`, `downbeats[]` (bar starts) and `phrases[]` (every 4 or 8 bars, or from detected section changes: build, break, drop, chorus). A cut's index must reference one tier explicitly, e.g. `{tier:'phrase', i:3}`, `{tier:'bar', i:17}`, or `{tier:'beat', i:70, offsetFrames:-2}`.
- **R3.2 What lands on the phrase boundary (hard sync).** Chapter or scene changes (new question, new data scene), the main reveal of the video (the counter-intuitive number) on the drop, the title card, and the final answer. Cap this at about 1 hard-synced "event" per 8-bar phrase, and at most about 2 to 4 per video at drop-level emphasis (following Kroll's "once or twice in a sequence").
- **R3.3 What lands on downbeats (soft sync).** Ordinary cuts within a chapter, and the appearance of the key element in each scene (a number popping, a bar hitting its value, an object landing). Put the impact frame of the animation (when the value lands), not its start, on the downbeat.
- **R3.4 What must NOT lock to the beat.** Continuous motions: camera drift, rotation, particle flow, counters counting up, characters walking, data lines drawing. These run on their own time curves (ease-in/out over several seconds), independent of beats. Locking them to beats makes motion stutter in steps, which is the "mechanical" or 突兀 feel. Subtitle reading time is also not beat-locked; it is set by character count (Q6). Secondary decorative pops should fall on off-beats or not be synced at all.
- **R3.5 Offset policy.** Default offset for a hard cut is 0 frames, or -1 to -2 frames at 30 fps so the new image is already present when the transient hits; this is an inference from the "slightly before" guidance. Do not apply one fixed offset to every cut. The source explicitly warns against a hidden rule. Vary offsets within about ±3 frames, or tie them to motion: cut where the motion is, then snap to within ±3 frames of a beat if one is nearby, otherwise leave the cut off-beat.
- **R3.6 Density follows the music's energy.** Intro or verse: 1 cut per 2 to 4 bars. Build: cut density increases (1 per bar, then 1 per 2 beats in the last bar). Drop: one big hard cut or reveal, then hold for 1 to 2 bars to let it land. Break or breakdown: the longest holds in the video (4 to 8 bars), the "restful" contrast. Final section: return to a medium density, then a long hold for the ending.
- **R3.7 Silence or gap beats.** If the track has a stop or gap (a beat of silence before the drop), freeze or slow the visual too: hold the frame, slow the camera, or cut to black or a clean frame. Then cut to the reveal on the first beat after the gap. This is the strongest tension-and-release device available in a music-only edit.
- **R3.8 Avoid uniform spacing.** Never place more than about 3 consecutive cuts at the same interval. Mix 1-bar, 2-bar and half-bar shot lengths. Following the davinciresolve21 source, a long hold before a fast cluster makes the cluster feel faster.
- **R3.9 Beat-lock QA check.** Compute the fraction of visual events (cuts plus animation impacts) that lie within ±2 frames of a beat. If it is above about 70 to 80%, the edit will read as a music video or mechanical. If it is below about 20%, the music will feel detached. These thresholds are an inference; I found no published numbers. The existing skill `anthropic-skills:edit-rhythm` describes a "beat-lock check" and may already encode this.

### Gaps
- I found no academic quantification of the ideal fraction of on-beat cuts, or of the ideal offset in frames. Practitioner guidance is qualitative.
- Chinese-language 卡点 sources found here were tool tutorials (how to place markers). I did not retrieve analyses from 影视飓风 or 知乎 on when not to 卡点. The 剪映 Level I/II detail is from a single Bilibili tutorial.
- I could not retrieve Pearlman's primary text. Her concepts are summarised from a review.

---

## Q4. Average shot length (ASL) trends; how long a shot or scene can hold; "something must change every N seconds"

### Takeaway
Hollywood ASL fell roughly linearly from about 10 s in the 1930s to 40s, to under 4 s after 2000. Modern films couple short shots with more motion and long shots with less. I found no rigorous evidence for a universal "change every N seconds" rule for short-form or explainer video. For a 2-minute explainer, the practical rule is that hold time scales inversely with on-screen motion and information.

### Cited Findings
- 160 English-language films, 1935 to 2010: ASL went from about 10 s (1930s and 40s) to below 4 s after 2000, a "generally linear decline" (r = −.75, p < .0001) — [Cutting, Brunick, DeLong, Iricinschi & Candan, "Quicker, Faster, Darker: Changes in Hollywood Film over 75 Years", i-Perception 2011 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/)
- The visual activity (motion) index increased over time (r = .583). *Barry Lyndon* (1975) had the lowest at 0.008 and *Toy Story 3* (2010) the highest at 0.122, so an animated film was the most visually active — [Cutting et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/)
- In contemporary films, "shorter shots tend to have more motion, and longer shots less" (r = −.46). Older films showed no such relationship — [Cutting et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/)
- The authors interpret these trends as filmmakers increasingly exercising "control over the attention of filmgoers" — [Cutting et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/)
- Cutting and colleagues also reported 1/f (pink-noise) structure in shot-length sequences of modern films, and linked it to fluctuations of human attention. These are pointers only; I did not fetch the content: [Yale fractals page "1/f characteristics of shot duration"](https://gauss.math.yale.edu/fractals/Panorama/Literature/Film/Cutting.html), [ScienceDaily 2010](https://www.sciencedaily.com/releases/2010/02/100223121435.htm), [APS Observer](https://www.psychologicalscience.org/observer/the-science-of-hollywood-blockbusters-2)
- TikTok "ideal length" studies (Metricool, Socialinsider, OpusClip and others) concern total video length and retention, not shot length — [Metricool TikTok Study 2024](https://metricool.com/wp-content/uploads/TikTok-Study-2024-Metricool.pdf), [Socialinsider](https://socialinsider.io/blog/how-long-are-tiktok-videos), [OpusClip](https://www.opus.pro/blog/tiktok-length-format-retention-data)

### Inferences (engine rules)
- **R4.1 Shot-length budget.** A 120 s video at about 4 s film ASL would have about 30 shots. At explainer-appropriate ASL with readable data (about 3 to 6 s per shot) it would have about 20 to 40 shots. But each code-built "scene" can contain internal camera moves and reveals that work like cuts. So count *visual events* (cuts plus major reveals plus camera-move starts), not just cuts.
- **R4.2 Motion and length coupling (Cutting).** Long holds need internal motion (slow camera drift, progressive reveal, counters). Static frames should be short. Rule: if a scene's visual activity is low (static text or a static chart), cap it at about 2 to 3 s or 1 to 2 bars. A scene with continuous camera motion and staged reveals can hold 8 to 15 s (4 to 8 bars). These thresholds are inferences, not sourced.
- **R4.3 "Change every N seconds" (heuristic, unsourced).** Some new visual event (cut, reveal, camera move start, subtitle change) should happen roughly every 1 to 2 bars (about 2 to 4 s at 100 to 120 BPM). This is a working heuristic consistent with the about 4 s modern film ASL, not a researched constant.
- **R4.4 Use 1/f-like variation.** Shot-length sequences should not be uniform. Mix short clusters with long holds, nested at phrase scale (consistent with R3.8 and the 1/f pointer).

### Gaps
- I found no peer-reviewed ASL measurements for TikTok, Douyin or Bilibili short-form, or for animated explainers and data visualisation. Popular claims such as "a cut every 2 to 3 seconds on TikTok" lack primary sources in this research.
- I found no evidence-based "maximum hold before attention drops" number for animated data scenes.
- I did not fetch the full 1/f paper (Cutting, DeLong & Nothelfer 2010, *Psychological Science*), so its specific numbers are not reported here.

---

## Q5. Eye-trace: keeping the focal point continuous across cuts; directing attention in data-heavy frames

### Takeaway
Eye-trace means the viewer's gaze should land where it already is, or where it is led, after a cut. Re-orientation is measurably faster when the two shots are visually similar. In data frames, show one focal point at a time and direct attention with motion, contrast, saturation and isolation.

### Cited Findings
- Eye trace: "The viewer's eyes should land in the same area from one shot to the next. That way, they don't need to search the frame to know where to look." — [FilmDaft](https://filmdaft.com/walter-murchs-rule-of-six-the-editors-formula-for-choosing-the-right-cut/)
- Practical eye-trace guidance: match screen direction, keep subjects in the same general screen area across cuts, use looks and gestures to lead to the next shot's subject position, and use contrast anchors (brightness, saturation, focus) consistently across cuts — [Artlist](https://artlist.io/blog/eye-trace-and-rule-of-six-editing/)
- Re-orientation (saccadic reaction time) was 23 ms faster after high-similarity cuts. The authors recommend including "visual elements that repeat" across views to minimise attention-shifting time — [Valuch et al., Univ. Vienna](https://csc.univie.ac.at/paper/ValAnsBucPatSch14.pdf)
- The modern-film trend toward more motion is interpreted as greater control over attention — [Cutting et al. 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3485803/)

### Inferences (engine rules)
- **R5.1 Track the focal point per scene.** Each scene exports `focus(t) -> {x, y}` in normalised screen coordinates. At a cut at time T, require `|focusA(T−) − focusB(T+)| < ~0.15` of frame width, unless the cut is a deliberate "jolt" on a hard-sync phrase boundary.
- **R5.2 One point of interest at a time.** In data-heavy frames, only the active element is at full contrast and saturation. Other elements are dimmed (about 30 to 50% opacity or desaturated). Reveal sequentially. Bring in a new element only after the previous one's reveal has settled.
- **R5.3 Attention cues, in rough order of strength.** Motion onset (the newly moving thing wins), luminance and colour contrast against a desaturated field, isolation (empty space around the element), scale, then position. This ordering is a standard perception heuristic; it was not explicitly sourced here beyond Artlist's "contrast anchors" and Cutting's motion-attention finding.
- **R5.4 Subtitles and focus.** Subtitles fixed at the bottom-centre are a second focal point. Place the data focal point so that the gaze path from it to the subtitle is short, for example in the upper-middle or centre of the frame. Do not trigger a major visual reveal at the same instant a new subtitle appears; stagger them by about 0.3 to 0.5 s so the eye can read one thing, then the other (an inference).
- **R5.5 Lead into the cut.** In the last 0.5 s of scene A, move the focal object (or camera) toward where scene B's focal point will appear. This is the animation equivalent of an eyeline lead.

### Gaps
- Valuch et al. measured millisecond effects of similarity across cuts. I found no study quantifying the screen-distance threshold for eye-trace continuity; the 0.15 width figure is an inference.
- I did not retrieve eye-tracking research specifically on data visualisation in video, or on subtitles combined with dense graphics.

---

## Q6. Subtitle timing: relative to cuts and beats; minimum on-screen time per Chinese character count; avoiding changes on top of a cut

### Takeaway
Netflix's general norms (minimum about 5/6 s, maximum 7 s per event) were confirmed via a secondary source. I could not retrieve Netflix's Chinese-specific numbers and shot-change frame rules (the partnerhelp.netflixstudios.com site was blocked). For a no-narration explainer where the viewer must also read graphics, timing should be much slower than broadcast norms, like the repo's current 4.6 chars/s. Subtitle changes should coincide with a cut or clearly avoid it, not land a few frames off it.

### Cited Findings
- Netflix event duration: minimum 5/6 of a second, maximum 7 seconds. Subtitles are centred and must not overlap on-screen text — [DailyTranscription summary of Netflix standards](https://dailytranscription.com/subtitling-standards-netflixs-captioning/)
- Netflix publishes a specific Simplified Chinese (PRC) Timed Text Style Guide and a separate Subtitle Timing Guidelines document. Both now redirect to partnerhelp.netflixstudios.com, which was blocked from this environment — [Simplified Chinese TTSG](https://backlothelp.netflix.com/hc/en-us/articles/215986007-Chinese-Simplified-Timed-Text-Style-Guide), [Subtitle Timing Guidelines](https://backlothelp.netflix.com/hc/en-us/articles/360051554394-Timed-Text-Style-Guide-Subtitle-Timing-Guidelines), [General Requirements](https://backlothelp.netflix.com/hc/en-us/articles/215758617)
- Repo context: the current pipeline uses `cps 4.6, base 0.9 s, min 1.9 s, max 6.0 s, gap 0.25 s` — `/home/claude/video/explainer/pipeline/timeline.py`

### Inferences (engine rules)
- **R6.1 Reading time.** Keep the existing model: `dur = clamp(0.9 + n/4.6, 1.9, 6.0)` s. For example, 12 characters gives about 3.5 s. This is deliberately well below broadcast reading speeds because there is no audio carrying the meaning, the viewer is also parsing animation, and Douyin or Bilibili viewers often watch on phones. Let any line that sits on top of a dense data reveal get +0.5 to 1 s.
- **R6.2 Line length.** One line per event in landscape, and short. Split at punctuation or clause boundaries, never mid-word. (The general Netflix guidance says to break after punctuation, conjunctions or prepositions — [DailyTranscription](https://dailytranscription.com/subtitling-standards-netflixs-captioning/).)
- **R6.3 Subtitles versus cuts (shot-change rule).** Either change the subtitle exactly on the cut frame (in-cue = cut, or the previous out-cue = cut), or keep it at least about 0.4 to 0.5 s (about 12 to 15 frames) away from the cut. Never change it 1 to 10 frames from a cut, because that produces a "flash" double-change. This mirrors the industry practice of snapping subtitle cues to shot changes when they are close; the 12-frame figure is from professional subtitling practice in my background knowledge and was not verified in this session.
- **R6.4 Subtitles versus beats.** Let subtitle in-cues fall on beats or downbeats where convenient (a line popping on a downbeat feels intentional). Do not stretch or shorten reading time to hit a beat. Reading time has priority (Murch's story above rhythm). Prefer to start the subtitle on a beat and let it end wherever the reading time ends, rounding up to the next beat only if that adds 0.5 s or less.
- **R6.5 Subtitle as lead (J-cut).** For scenes that need the text to make sense, the subtitle may appear 2 to 6 frames before the cut (R2.4). For punchlines, the subtitle may appear 1 beat after the visual reveal lands, so the image hits on the beat and the words confirm it (image first, caption second).
- **R6.6 Gaps between subtitles.** Keep a 0.25 s gap (the current pipeline value) between unrelated lines. Chain continuous lines with no gap within a sentence.
- **R6.7 Do not compete.** Never start a new subtitle on the same frame as a major on-screen text or number reveal in the graphic. Stagger them by about 0.3 to 0.5 s (see R5.4). Also, subtitles must not overlap on-screen text spatially ([DailyTranscription](https://dailytranscription.com/subtitling-standards-netflixs-captioning/)).

### Gaps
- **The Netflix Simplified Chinese numbers could not be verified** because the partnerhelp.netflixstudios.com domain was blocked by the proxy (403 on CONNECT, and WebFetch provenance refused the redirect). From background knowledge only (unverified), that guide is commonly cited as specifying up to 16 characters per line and a reading speed of about 9 characters per second for adult content (lower for children's content). Netflix's general timing guidelines are commonly cited as specifying a 2-frame minimum gap between events and rules for snapping cues to shot changes within about 12 frames. The report writer should treat these as unverified or flag them.
- I found no research on optimal subtitle duration for music-only (no narration) videos specifically.

---

## Consolidated engine checklist (synthesis of R-rules above; inferences, not sourced claims)

1. **Cut eligibility:** `cut ≥ max(lastRevealSettle, subStart + minRead) + absorbHold`; then snap to the beat tier the cut's role demands (phrase for a chapter change, bar for an ordinary cut, beat or off-beat for a motion-carried cut).
2. **Role → tier:** chapter or drop reveal → phrase or drop (hard sync, about 2 to 4 per video); scene cut and element impact → downbeat; motion-carried or match cut → wherever the motion is, ±3 frames from a beat optional; continuous motion → never beat-locked.
3. **Offsets:** 0 to −2 frames for hard cuts, varied; no single global offset.
4. **Shot length:** vary (1/f-like); static scenes ≤ about 2 to 3 s; moving or revealing scenes can hold 4 to 8 bars; a long hold in the break; a dense cluster in the build; a hold after the drop.
5. **Continuity carrier at each cut:** at least one of matched motion vector, matched shape/colour/position (focus distance < 0.15 W), persistent or morphing object, or a continuing musical phrase.
6. **Attention:** one active element at full contrast; others dimmed; the newly moving thing is the focal point; stagger graphic reveal and subtitle by 0.3 to 0.5 s.
7. **Subtitles:** reading time from character count (4.6 cps model); in-cue on a beat when possible; never 1 to 10 frames from a cut; never stretched to fit the beat.
8. **QA metrics:** % of events within ±2 frames of a beat (target roughly 30 to 70%); longest run of equal-interval cuts (≤ 3); focal-point jump at each cut; minimum subtitle read time satisfied; no subtitle change within (0, 12) frames of a cut.
