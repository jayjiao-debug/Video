# Camera Movement (运镜) and Transitions (转场) for Cinematic Animated Explainers (3D three.js / 2D SVG, ~2 min, music + subtitles only)

Scope note: research covered cinematography references (StudioBinder, Videomaker), motion-design transition guides, an academic study of animated transitions in data graphics (Heer & Robertson 2007), VR comfort guidelines (Meta), news 3D-graphics write-ups (NYT via Hypertextual), Kurzgesagt process material, Powers of Ten, and Chinese platform/editing articles. Chinese creator-specific breakdowns (影视飓风, 何同学, 回形针, 星球研究所, 小Lin说, 毕导) were mostly not retrievable (Zhihu 403, Bilibili/Douyin pages render empty to the fetcher, search returned off-topic pages); this is flagged in Gaps. Items under "Inferences" are the researcher's synthesis or practitioner knowledge and are not independently sourced.

---

## 1. Core camera moves: meaning, duration, easing, motivation

### Takeaway
Every camera move carries a stock emotional meaning (push-in = tension/intimacy/"pay attention"; pull-out = context/isolation; crane/boom = grandeur/establishing; arc = dynamism/unease; roll = discomfort), and in an explainer the move should be justified either by the subject (follow what moves) or by an information change (reveal context, isolate a detail). Cinematic camera moves use ease-in-out; abrupt, rotational and accelerating moves are the ones that cause discomfort.

### Cited Findings
- **Static shot**: "focus, intimacy"; lets elements in frame move instead of the camera; overuse "can reduce visual engagement." — [StudioBinder, camera movements](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Pan**: horizontal rotation that "reveals information, adds energy"; **whip pan** is a fast pan that creates "energetic connections between subjects." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Tilt**: up/down rotation; "establishes scale, dominance, awe"; used to introduce grand vertical subjects. — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Push-in (dolly in)**: "tension, intimacy, psychological intensity"; "subtle push-ins have an enormous impact on how we perceive characters." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Pull-out**: "isolation, distance, detachment"; reveals broader context. — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Zoom (focal-length change, not camera travel)**: reads as "tension, unease, unnaturalness" because "there is no equivalent to it in the experience of the human eye"; overuse reduces effectiveness. — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Dolly zoom / vertigo (希区柯克变焦/滑动变焦)**: camera travel combined with opposite zoom so subject size stays constant while background stretches/compresses; conveys disorientation, sudden realization, existential dread; "most film applications last two to six seconds because extended use dilutes impact." Push-in + zoom-out compresses background toward viewer; pull-back + zoom-in stretches it. — [Morphic glossary, Vertigo Shot (zh)](https://morphic.com/zh/ai-glossary/Vertigo-Shot); StudioBinder calls it an "incredibly intentional camera movement because they have such a specific effect." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Roll (Dutch rotation in motion)**: "dizziness, unease, disorientation"; "should only be used when wanting to elicit discomfort." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Tracking / truck**: physically moves through the scene; "immersion, fluidity, engagement"; truck = lateral movement. — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Arc / orbit**: circles a subject, "adding dynamism to a static scene"; can read as "menace, uneasiness." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Boom / crane (rise)**: vertical move; "grandeur, scale, establishment"; used for establishing shots and to "immediately add production value." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Handheld**: "raw authenticity, subjectivity, immediacy"; "random movement can be overused." — [StudioBinder](https://www.studiobinder.com/blog/different-types-of-camera-movements-in-film)
- **Easing**: ease-in-out reads as "elegant, deliberate" and is recommended "for cinematic" camera movement; ease-out (fast start, slow end) for entrances; ease-in for exits; linear is "mechanical" and should be used sparingly. Same duration with different easing "feels very different." — [Playbooks: slow-in/slow-out mastery](https://playbooks.com/skills/dylantarre/animation-principles/slow-in-out-mastery)
- **Motion sickness / comfort**: high optic-flow speed increases vection and discomfort; "Disorientation occurs whenever the user loses track of their position… most commonly… when the camera perspective suddenly changes significantly." Mitigations: limit optic flow (vignettes darkening edges during movement), stable reference frames, consistent frame rate. (VR context — stronger than flat-screen video, but direction of effect applies.) — [Meta Horizon, Locomotion comfort](https://developers.meta.com/horizon/design/locomotion-comfort-usability/)
- Real 3D news graphics use directed camera travel for weight/scale: NYT's Syria mass-grave piece "drop[s] you straight into the trench" and "the camera moves through the grave"; the Mount Rushmore piece uses angled views, close-ups and reveals behind the faces. The principle stated: 3D should "clarify" and reveal, not "distract." — [Hypertextual, "From the mountain to the grave"](https://hypertextual.substack.com/p/from-the-mountain-to-the-grave-how)

### Inferences
Practical catalogue for code-built cameras (durations at 30 fps; adjust to music phrase lengths — durations are researcher recommendations, not sourced numbers unless cited above):

| Move (中文) | Use in explainer | Conveys | Typical length | Easing / implementation note |
|---|---|---|---|---|
| Slow drift (缓推/漂移) | Default "alive" state on any held frame, especially under subtitles | Calm, documentary | Whole shot (4–10 s), 2–5% scale or a few units of travel | Linear or very gentle sine; must be slow enough that text stays readable. Prevents "dead PPT" look. |
| Push-in (推) | "Look at this" — isolate the key number/object | Focus, tension, importance | 1.5–4 s | easeInOutCubic/Quint; end on the subject, then hold ≥1 s |
| Pull-out / reveal (拉) | Show the subject is part of something bigger; ending a section | Context, scale, loneliness | 2–5 s | easeInOut; longer than push-ins, since the viewer must take in more |
| Crane / rise (升) | Establishing shot; "rise above" to god view | Grandeur, overview | 2–5 s | Combine with slight tilt-down to keep subject centred |
| Top-down god view (俯视/上帝视角) | Maps, flows, distributions, "the whole system" | Objectivity, control, overview | Hold-oriented | Orthographic or long-lens perspective reduces distortion for data |
| Orbit / arc (环绕) | Show a 3D object's form; add energy to a static model | Dynamism; prolonged = showy | 3–6 s, 15–60° of arc (full 360° reads as product-ad) | Keep target fixed (lookAt); ease-in-out; avoid passing behind occluders |
| Truck / track (横移/跟) | Move along a timeline, a row of bars, a street | Progression, continuity | Matches subject speed | Direction should follow reading direction (left→right = forward in time) |
| Tilt (摇上/下) | Tall things: skyscraper, stacked bars, rocket | Scale, awe | 1.5–3 s | Pure rotation; keep slow — rotation is the main sickness trigger |
| Whip pan (甩镜) | Energetic jump between two related subjects / as a transition | Energy, "meanwhile" | 6–12 frames of blur | Add directional motion blur; cut hidden inside blur |
| Dolly zoom (希区柯克变焦) | One realization beat ("wait, it's THIS big") | Disorientation, revelation | 2–4 s, once per film max | three.js: keep `distance * tan(fov/2)` constant |
| Rack focus (变焦点/焦点转移) | Shift attention foreground → background (e.g., from label to object) | Attention shift, depth | 0.5–1.5 s | Bokeh/DOF postprocess; in SVG fake with blur filter + opacity |
| POV / first-person (主观视角) | Follow a particle/vehicle/person through the system | Immersion, empathy | Short (3–6 s) | Constrain speed; add a stable frame element (vignette, HUD) to reduce sickness |
| Roll (旋转) | Rarely; chaos/instability beat | Unease | <1 s | Avoid in data scenes |

- Motivation rule: if something in frame moves (particle, vehicle, growing bar), the camera should follow or lead it; if nothing moves, the camera move must be motivated by an information change (new reveal, focus). Unmotivated moves are the most common "AI/template" tell.
- In three.js, animate camera position and lookAt-target separately with the same easing (or target slightly lagging) so pushes feel like a dolly operator rather than a mathematical lerp; never lerp Euler rotations directly (use quaternion slerp or lookAt).
- Prefer travel (dolly) over FOV zoom for normal moves; reserve FOV change for deliberate "unnatural" beats per the StudioBinder note.

### Gaps
- No primary source found giving numeric "standard" durations for camera moves in explainer animation; the table's durations are researcher recommendations.
- Blain Brown's *Cinematography: Theory and Practice* and the "Five C's" were not fetched; their treatment of motivated movement is not quoted here.
- Manim's camera defaults (e.g., default run_time and smooth rate function) could not be verified from a fetched source in this session.

---

## 2. Data-visualisation camera grammar (macro → micro, zoom into number, follow one particle)

### Takeaway
The dominant grammar is continuous scale change (Powers of Ten), establishing shot before detail, and object constancy — the viewer should always be able to track "the same thing" across a camera or layout change. Research on animated data transitions supports ~1 s transitions, slow-in/slow-out, simple translation over rotation, and staging (one kind of change at a time).

### Cited Findings
- **Powers of Ten (1977, Eames)**: starts on a picnic blanket near Chicago; zooms out so the frame becomes "ten times larger on each side" every ten seconds, past the Virgo Cluster, then reverses "zooming back in a factor of ten every two seconds" down to a single proton. — [NASA APOD, Powers of Ten](https://science.nasa.gov/image-article/apod-2022-december-4-video-powers-of-ten/)
- Powers of Ten "presages the kind of pop science explainer videos found on YouTube"; ground-level zoom-outs have since become near-ubiquitous ("I don't think you're allowed to operate a phone company unless you've used at least one in your advertising"), with *Contact*'s opening as a descendant. — [The Solute](https://the-solute.com/?p=104922)
- **Heer & Robertson (2007), animated transitions in statistical graphics**:
  - Congruence: intermediate frames should remain valid graphics; a mark must keep representing the same datum across the transition.
  - Apprehension: group elements that move together (Gestalt common fate), minimise occlusion, maximise predictability via **slow-in/slow-out**, prefer **simple transitions (translation) over rotation**.
  - Staging: separate e.g. axis rescaling from value changes; move before morphing; stagger to reduce overlap. Participants "strongly preferred staged animation to direct animation" (p < 0.003), and animation beat static (p < 0.001). But very complex multi-stage animations lost the advantage; they recommend "simple staging" over aggressive "do one thing at a time."
  - Timing: "transition times around 1 second"; faster for small movements; stages and dwells must be long enough to track but not so slow they drag.
  - Axis rescaling was a persistent source of error.
  — [Heer & Robertson, Animated Transitions in Statistical Data Graphics (InfoVis 2007)](https://homes.cs.washington.edu/~jheer/files/2007-AnimatedTrans-InfoVis.pdf)
- Transition guide: zoom-in for "moving overview to detail" (0.5–1 s), zoom-out for "revealing context/big picture" (0.5–1 s; "overuse risks dizziness"); zoom between "unrelated scenes" should be avoided. — [Editframe, transition styles](https://editframe.com/skills/brand-video-generator/transition-styles)
- Screen orientation: establish spatial orientation early with establishing shots, then maintain consistency. — [Videomaker, Screen Direction](https://www.videomaker.com/article/12986-screen-direction)
- Kurzgesagt plans "visual metaphors, transitions between ideas" during the illustration stage (before animation), averaging ~200 illustrated panels, with 2–3 animators spending 8–10 weeks; every moving element is keyed manually in After Effects/Cinema 4D; narration "provides the timing for the animation team"; original music is composed to the finished video "to highlight the important parts." — [Kurzgesagt process (LingQ transcript)](https://www.lingq.com/en/learn-english-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/); [kurzgesagt.org/youtube](https://kurzgesagt.org/youtube/)
- NYT 3D pieces use guided camera paths through photogrammetry models with angled views → close-ups → reveals; the goal is clarification, with transparency about how the model was built. — [Hypertextual](https://hypertextual.substack.com/p/from-the-mountain-to-the-grave-how)

### Inferences
Data-viz camera patterns for a 2-minute film:
- **Establish → Isolate → Explain → Return** (建立-聚焦-解释-回到全局): open each scene wide (god view / map / full chart) for at least ~1.5–2 s so the viewer learns the space, push to the detail, hold for the subtitle, then pull back so the detail is re-seated in context. The return is what makes the "aha" of scale land.
- **Macro → micro chain (city → street → person)**: implement as one continuous camera path through nested scenes (Powers-of-Ten style) with log-space interpolation of camera distance (interpolate `log(distance)`, not distance) so each order of magnitude takes equal time; linear distance interpolation spends almost all the time at the large end and then crashes into the detail. Swap LOD/scene content while the subject fills the frame.
- **"Zoom into the number"**: push into a digit/bar until it fills frame, then the inside of the digit becomes the next scene (zoom-through). Text must be counter-scaled or swapped to a sharp version at the end so it doesn't blur (SVG: scale the viewBox; three.js: use SDF/troika text or swap to an HTML/SVG overlay).
- **Follow one particle among thousands**: dim/desaturate the crowd, highlight one (colour + glow + slight scale), let the camera track it with a soft lag (critically damped spring on camera target), then pull out to reveal the thousands again. Object constancy (Heer & Robertson) is the reason this works: the highlighted particle must remain the same object across the zoom.
- **Keep the subject readable while moving**: subject stays in a stable screen region (usually centre or a rule-of-thirds point) while the background moves; avoid simultaneous camera move + layout morph + axis rescale (stage them, per Heer & Robertson).
- Creator observations (practitioner knowledge, not verified in this session): Kurzgesagt is known for continuous zooms between scales and nested worlds; 3Blue1Brown typically moves the camera slowly with smooth easing and keeps formulas fixed in frame while 3D objects rotate behind; 星球研究所 videos rely heavily on aerial/terrain flyovers and slow crane-reveals over landscapes for grandeur; 回形针PaperClip uses flat/isometric infographic style with continuous object-to-object transformations rather than cuts.

### Gaps
- No primary write-ups found for The Pudding, Reuters Graphics, Real Engineering, 回形针 or 星球研究所 camera practice; their techniques above are practitioner observation only.
- No sourced guidance on log-space zoom interpolation; this is an implementation recommendation.

---

## 3. Transitions catalogue: types, premium vs. cheap, clichés on Chinese platforms

### Takeaway
The cut remains the default; premium transitions are "motivated" ones that carry an element (shape, motion, colour, sound) across the boundary — match cuts, morphs, zoom-throughs, and sound bridges. Menu-preset transitions (geometric wipes, spins, glitches, random dissolves, unmotivated zooms) read as cheap and date quickly; consistency of a small vocabulary matters more than variety.

### Cited Findings
- Match cut = "any transition, audio or visual, that uses elements from the previous scene to fluidly bring the viewer through to the next scene"; provides "a thematic connection." Types: **graphic match** (shape/colour/composition; e.g., *Psycho* drain → eye; *Lawrence of Arabia* colour match; *2001* bone → satellite temporal bridge), **match on action** (movement continues across the cut; "generate narrative momentum"), **sound bridge** (audio carries over — equivalent of J/L cuts), and repeat cuts. — [StudioBinder, Match cuts](https://www.studiobinder.com/blog/match-cuts-types-of-cuts/)
- Premium vs. overused: premium = match cuts ("invisible, narratively sophisticated"), speed ramps with audio sync, morphs "executed cleanly with aligned elements"; overused/cheap = "excessive geometric wipes," "random dissolves in fast-paced content," "unmotivated zoom effects." Dissolves/fades 300–500 ms look professional; 800 ms+ for major emotional moments. "The best cuts are often ones you don't notice." Consistency: keep swipes in one direction; "random effects create chaos." — [ShortGenius, 视频转场 guide](https://shortgenius.com/cn/blog/shipin-zhuanchang)
- Cuts are "the least obtrusive transition and… the most common"; dissolves show time passage ("If you can't resolve it, dissolve it"); wipes are period/stylistic and date a project ("the only reason anybody should be using a clock wipe is to reference George Lucas"); editors misuse transitions "simply because they exist in menus." — [Videomaker, The Only Transitions You'll Ever Need](https://www.videomaker.com/article/c10/17658-the-only-transitions-youll-ever-need/)
- Transition timing table: cut 0 s; fade to black 0.5–2 s (section endings); fade to white 0.5–1.5 s; cross-fade 0.5–2 s; slide/push 0.3–0.8 s; zoom in/out 0.5–1 s; rotation 0.5–1 s ("feels gimmicky" in professional contexts); glitch 0.1–0.3 s (tech/edgy only); morph 0.5–1.5 s ("transformations, premium content"). Pitfalls: over-complex transitions replacing simple cuts; random mixing of styles; slide direction contradicting narrative meaning. — [Editframe, transition styles](https://editframe.com/skills/brand-video-generator/transition-styles)
- Duration feel: 0.1–0.3 s "snappy, urgent," jarring if overused; 0.5–1 s "balanced… can feel generic"; 1–2 s "contemplative… risks momentum loss." — [Editframe](https://editframe.com/skills/brand-video-generator/transition-styles)
- Dolly zoom overuse dilutes its power; potency comes from "concentrated presentation during genuinely significant narrative moments." — [Morphic, Vertigo Shot](https://morphic.com/zh/ai-glossary/Vertigo-Shot)
- CapCut/剪映 offers large libraries of preset transition templates (e.g., "剪映转场" template collections), which is what makes those looks recognisable. — [CapCut 剪映轉場 templates](https://www.capcut.com/zh-tw/explore/%E5%89%AA%E6%98%A0%E8%BD%89%E5%A0%B4/7512744752069052417)
- Chinese tutorial ecosystem centres on "无缝转场" (seamless transitions), "拉镜转场," "百万级转场合集," and "影视飓风同款运镜" courses — i.e., these are mass-taught, widely replicated looks. — [Bilibili: 剪出和影视飓风一样的视频](https://www.bilibili.com/video/BV16iGi6qEMw/); [Bilibili: 影视飓风百万运镜AE字幕跟踪](https://www.bilibili.com/video/BV1ZYyPBHE4t/); [知乎: 顶级40个PR拉镜无缝转场](https://zhuanlan.zhihu.com/p/471970767); [CSDN: 百万级转场合集](https://blog.csdn.net/weixin_39783149/article/details/112682579)

### Inferences
Catalogue for code-built scenes (procedural, no footage):

| Transition (中文) | How to build in three.js / SVG | Feels | Use when |
|---|---|---|---|
| Hard cut on beat (卡点硬切) | Switch scene on a music downbeat | Confident, modern; premium when compositions are strong | Default between sections |
| Match cut / graphic match (匹配剪辑/形状匹配) | End frame A and start frame B share a shape/position (circle → planet → coin) | Premium, "clever" | Linking two concepts with a visual metaphor |
| Morph / shape match (形变转场) | SVG path interpolation (flubber-style), or three.js morph targets / instanced points re-targeted | Premium if shapes align; cheap if it's a random blob | Data A becomes data B (bar → map → dots) |
| Zoom-through / dive into object (穿梭/钻入) | Push camera into an object until it fills frame; inside is the next scene (Powers-of-Ten nesting) | Premium, continuous "一镜到底" | Macro→micro; "inside the number" |
| Camera through a surface (穿墙/穿屏) | Camera passes near-plane through a screen, cloud, wall, or page; swap scene while occluded | Invisible, premium | 3D scene changes without a cut |
| Wipe by object (物体遮挡转场) | Foreground object (train, wave, building, big digit) sweeps across; scene swaps behind it | Good if the object belongs to the story; cheap if generic | Moving along a timeline/space |
| Whip / smear (甩镜/拖影) | 6–12 frames of fast pan with directional motion blur; swap mid-blur | Energetic; overuse = vlog cliché | High-energy jump between parallel examples |
| Light flash / white-out (闪白) | Bloom ramp to white over 4–8 frames, cut, ramp down | Impact; cheap if repeated | Once or twice at big reveals, on a strong music hit |
| Fade to black (黑场) | Opacity | Chapter break, gravity | Act breaks, ending |
| Colour match (色彩匹配) | End A dominated by a colour; B opens on the same colour field | Subtle, premium | Emotional continuity |
| Mask / iris / shape mask (遮罩转场) | Grow a shape mask from the subject (e.g., a circle from a dot expands to reveal next scene) | Clean infographic look | 2D SVG scenes; from a data point to its story |
| Cut on action (动作剪辑) | Motion begun in A completes in B (ball thrown → lands on map) | Invisible momentum | Keep pace without effects |
| Text carry-over (L/J-style, 字幕桥接) | Subtitle or key number persists/animates across the cut while the background changes; next scene's music hit arrives slightly before the picture (J) | Smooth, "editorial" | Music-and-subtitle-only films (the text is the only "voice," so it can bridge) |
| Number/label as anchor (数字锚定转场) | A number stays fixed on screen while the scene behind morphs from chart to 3D | Premium data-journalism feel | Data scenes |

Premium vs. cheap for Chinese 18–25 viewers (2024–2026) — researcher judgement, not survey data:
- Likely read as cheap / 烂大街: generic 剪映/CapCut presets (spin/rotate 3D cube, glitch, page-curl, "lens shake" zoom-blur preset, clock/geometric wipes, random cross-dissolves), frequent 闪白, every-cut zoom-blur "冲屏", Hitchcock zoom used repeatedly, "百万运镜" handheld-style fake shakes, Powers-of-Ten "zoom out to Earth from space" when unmotivated (also flagged as ubiquitous by [The Solute](https://the-solute.com/?p=104922)).
- Likely read as premium / 高级: transitions that are part of the world (zoom-through, object wipes, camera through surfaces), clean morphs where the data is preserved (Heer & Robertson congruence), restrained hard cuts on musical downbeats, and a small, consistent transition vocabulary across the whole film.
- Rule of thumb: pick 2–3 signature transition types for the film and repeat them deliberately; one "big" transition (dolly zoom, white-out, long zoom-through) per act at most.

### Gaps
- No survey or platform data found on which transitions Chinese 18–25 viewers perceive as cheap vs. premium; the classification above is synthesis. Douyin/Bilibili/小红书 comment-level evidence (e.g., "转场好土") could not be retrieved.
- Toutiao article on 转场 (7550501486216890418) returned 404.

---

## 4. Pacing of moves: moves per scene, holding for text, motion sickness, screen direction, 180° rule

### Takeaway
One deliberate move per idea, holds whenever text must be read, ~1 s for data transitions, and consistent screen direction (left→right = forward/east/time) with a respected axis of action are the backbone. Sickness comes mostly from rotation, acceleration, high optic flow and sudden large perspective jumps.

### Cited Findings
- 180° rule: draw an imaginary line through the subjects and keep the camera on one side so orientation stays consistent; for movement (chases, races, parades) keep a consistent side to avoid apparent reversal; reset with "direction-neutral" shots (subject moving directly toward/away from camera). — [Videomaker, Screen Direction](https://www.videomaker.com/article/12986-screen-direction)
- Screen direction convention: map orientation — westward moves left, eastward right; sunsets screen-left, sunrises screen-right; reversing direction implies collision rather than continued pursuit; "maintain a sense that time, distance and objects continue through time in a logical way." — [Videomaker](https://www.videomaker.com/article/12986-screen-direction)
- Slide direction contradicting narrative meaning is a listed pitfall. — [Editframe](https://editframe.com/skills/brand-video-generator/transition-styles)
- Data transitions ~1 s; stages/dwells long enough to track; overly complex staging degrades performance; translation preferred over rotation. — [Heer & Robertson 2007](https://homes.cs.washington.edu/~jheer/files/2007-AnimatedTrans-InfoVis.pdf)
- Discomfort drivers: high optic-flow speed, perceived acceleration, sudden significant perspective change; mitigations include edge vignettes during motion and stable reference elements. — [Meta Horizon, Locomotion comfort](https://developers.meta.com/horizon/design/locomotion-comfort-usability/)
- Overly fast cutting is not automatically better: a Bilibili creator article argues Douyin creators overcorrect with "every 3 seconds a new shot," and "内容有价值，比'节奏快'更重要." — [Bilibili opus](https://www.bilibili.com/opus/1165140042381787140)
- Kurzgesagt times animation to narration and composes music to the finished picture to highlight key moments. — [Kurzgesagt process (LingQ)](https://www.lingq.com/en/learn-english-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/)

### Inferences
- **Budget**: a 2-minute film ≈ 10–20 shots of 4–10 s. Per shot: one primary move (push / pull / truck / orbit) + an optional continuous micro-drift. Two primary moves in one shot only when they're a single phrase (e.g., rise-then-push), never more than two.
- **Text-hold rule** (critical for subtitle-only video): when a subtitle or on-screen number appears, the camera should be static or in slow drift for the subtitle's reading time (Chinese reading roughly 4–6 characters/s is a common subtitle norm — unverified here) and for ≥0.5 s after a number lands. Fast moves go *between* text beats, not under them. Never move the camera and change the subtitle simultaneously on the same beat if the move is large.
- **Move → settle → hold**: ease-in-out the move, let it settle (slight overshoot only for playful 2D), then hold 1–2 s before the next event. The hold is where comprehension happens.
- **Sickness avoidance on flat screens**: cap angular velocity (orbits ≲ 20–30°/s; tilts/pans slower than trucks), avoid combining roll with anything, avoid long fast POV flights over high-frequency textures (grids, city blocks), keep a fixed screen anchor (subtitle bar, label, vignette) during fast travel; use cuts rather than 180° swings for large reorientations.
- **Screen direction in data**: time and growth move left→right and bottom→top; keep this consistent across all scenes (a timeline that trucks right in scene 2 shouldn't truck left in scene 5). For a 3D city, pick a "north" and keep the camera on one side of the main axis (e.g., the street the particle travels along); cross it only via a top-down god-view (direction-neutral reset).
- **Music**: land move *endings* (arrival on subject) on strong beats/downbeats, start moves on upbeats; continuous drifts should run on their own clock, not pulse with the beat (see the project's edit-rhythm skill if present).

### Gaps
- No sourced numeric thresholds for flat-screen (non-VR) camera angular velocity before discomfort; VR guidance is directionally applicable but not calibrated for video.
- No sourced Chinese subtitle reading-speed figure retrieved this session.

---

## 5. How top Chinese creators use camera/transitions; Douyin vs Bilibili

### Takeaway
Evidence retrievable in this session is thin. What is sourced: 影视飓风's camera-move and transition style has been turned into mass tutorials ("影视飓风同款运镜/转场"), meaning that look is widely imitated; Douyin's algorithm treats completion rate as an entry ticket and then rewards engagement, while creators warn that cutting every ~3 s is not a substitute for value density. Specific production interviews with 何同学, 回形针, 星球研究所, 小Lin说, 毕导 about camera/transition practice were not found.

### Cited Findings
- 影视飓风 has ~14 million Bilibili followers (late 2025). — [Huxiu](https://www.huxiu.com/article/4805697.html)
- Multiple paid/free courses explicitly teach "剪出和影视飓风一样的视频" and "影视飓风百万运镜" (AE subtitle tracking with camera moves), and 剪映 tutorials replicate the 影视飓风 motion style — evidence the style is widely copied. — [Bilibili BV16iGi6qEMw](https://www.bilibili.com/video/BV16iGi6qEMw/); [Bilibili BV1ZYyPBHE4t](https://www.bilibili.com/video/BV1ZYyPBHE4t/); [Douyin: 影视飓风运镜剪映教程](https://www.douyin.com/shipin/7576086603480598538)
- Douyin: "完播率 only as an entry ticket," then comments/shares drive distribution; must hook within 3 s; over-fast cutting ("every 3 seconds a new shot") is a common overcorrection; value density matters more than speed. — [Bilibili opus 1165140042381787140](https://www.bilibili.com/opus/1165140042381787140)
- Seamless-transition (无缝转场) tutorials teach a small set of mass-replicated patterns (遮挡转场, 甩镜转场, 拉镜/推镜转场, 相似物转场). — [万兴喵影: 无缝转场四种方式](https://miao.wondershare.cn/help/video-guide/seamless-transition.html); [爱剪辑: 视频转场如何无缝衔接](https://www.ijianji.com/pages/?id=220)

### Inferences (practitioner knowledge, unverified in this session — treat as hypotheses)
- **影视飓风**: high-production-value camera moves (gimbal/drone/robotic-arm), speed ramps synced to music, and kinetic subtitles tracked to the camera; their signature transitions are motivated by in-camera movement. Imitation via templates has made "speed-ramp + whoosh + zoom-blur" feel generic when used without the underlying shot quality.
- **何同学**: known for meticulously staged practical "one-take" style reveals and physical/graphic match transitions (objects becoming other objects), often slow and precise rather than fast; the premium feel comes from planning, not effects.
- **回形针PaperClip**: flat/isometric 2D infographic style, continuous transformations between diagrams, mostly lateral/axial camera moves in a 2.5D space, restrained palette; transitions are morphs and pans across a continuous canvas rather than cuts.
- **星球研究所**: grand aerial/terrain shots and slow crane/drift reveals with large typography; scale and awe, long holds, music-led pacing.
- **小Lin说 / 毕导**: presenter-led with inserted charts/animations; transitions mostly hard cuts and chart animations; momentum comes from script and jokes rather than camera.
- **Douyin vs Bilibili**: Douyin (vertical, swipe-away) rewards a strong visual hook in the first 1–3 s, faster scene turnover, and a clear payoff; Bilibili (landscape, longer, 弹幕 culture) tolerates longer holds and more elaborate continuous sequences and rewards perceived craft ("用心"/"制作精良") that viewers comment on. For a ~2-minute landscape film aimed at both, front-load one spectacular continuous move (zoom-through or crane reveal) in the first 3 s, then settle into readable move-hold rhythm.

### Gaps
- No interviews or breakdowns retrieved on camera/transition practice by 何同学, 回形针PaperClip, 星球研究所, 小Lin说 or 毕导 (Zhihu returned 403; Bilibili/Douyin pages rendered empty for the fetcher; searches returned off-topic pages).
- No quantitative data comparing Douyin and Bilibili audience reactions to transition styles.
- No source found documenting which specific transitions Chinese viewers now call "土" or "烂大街"; claims about clichés rely on inference from the volume of template/tutorial content.
