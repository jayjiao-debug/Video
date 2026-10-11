# Brief v3: 为什么一比，就觉得穷？ (look overhaul)

- **Episode:** ep21 · **Series:** VIBE知识大赏 (Juno)
- **Idea in one sentence:** Feeling poor is mostly a comparison, not an amount: monkeys refuse cucumber when the neighbour gets a grape, people pick a poorer world to be richer than others, staff who learn they earn below the median get less satisfied, richer neighbours make you less happy, but you can choose whom you compare with.
- **Why an 18–23 viewer cares:** their first internship pay (¥4,000) feels great until the roommate says ¥6,000.
- **Takeaway:** 比较是天性，但跟谁比，你能选。
- **Length:** 129.97 s, fixed by the song (end card at 125.4 s). 1920×1080, 30 fps, subtitle-only, music + a few designed sounds.

## Why v3 exists: the owner's words (2026-10-10, on v2)
> "Im not happy with this video, it's very cheap looking, no 运镜，no 转场，No 爽的卡点，把画风给我完全变了，换一个从来没有出现过的，炫丽的 … master class, master piece video"

v1 (navy + gold silhouettes) was "too dark". v2 (flat moonlit illustration, tank-video style) was "very cheap looking".
What failed in v2, and must not come back:
- **Static slides.** Each scene was a fixed frame where things faded in. There was no camera movement at all, only a 3 % zoom.
- **Crossfade transitions.** Every scene change was a 1-second crossfade. Nothing on screen carried the eye into the next scene.
- **Hits off the beat.** The big drop at 81.375 s only recoloured some bars, and nothing landed on the bar lines.
- **A flat clip-art look.** Plain colour blocks, simple houses and cartoon figures read as cheap.

## What v3 must be
1. **A completely new look, never used in this series, and 炫丽 (dazzling).** Rich colour, real light (glow, refraction, sheen, bloom), depth and texture. The series has always been navy night + gold (see looks.md). v3 must leave that family, and it must not be flat clip-art either. "Master piece / 大制作" means every frame would work as a still.
2. **运镜 (camera movement).** One continuous world that a camera travels through: push-ins, pull-backs, orbits, crane moves, fly-throughs and reveals, all eased and physical. A shot never just sits; there is purposeful motion every 1–2 beats. In a one-take section, keep one direction of travel (owner: no 180° turn-arounds, no fast sideways sweeps).
3. **转场 (transitions).** Every scene change is carried by something on screen. For example, the camera flies into an object and comes out in the next world, a match-cut on a shape (the phone becomes a box, the coin becomes the moon), a morph, or a whip-pan along a motivated object. No dips to black and no plain crossfades between unrelated pictures.
4. **爽的卡点 (satisfying beat sync).** Every reveal, number and stamp lands on a beat. Every scene cut lands on a bar or half-bar. The big structural moments hit hard (see the music map). The beat emphasis goes on the thing that appears; the whole frame never pulses or shakes on the beat (owner rule).

## Fixed (do not change)
- **The script.** Keep the 30 lines and their timings (lines.json). The script was approved; only the picture changes. A line may be reworded only if the director shows that the picture requires it.
- **The music.** s130f from 0:00, untouched, with only the existing one-bar fade. The bar grid is bar n = 0.383 + 2.0248·n s (118.5 bpm); a beat is 0.5062 s.
- **The numbers and sources** in script.md: 95 / 60 / 20 %, 257 people, 5万/2.5万 vs 10万/20万, 48 %, 85 %, the 2008 Sacramento Bee pay site, the median, Luttmer 2005. ¥4,000 and ¥6,000 are illustrative examples.
- **The engine layer:**
  - Subtitle standard: Noto Sans CJK SC weight 900, 64 px, white with gold #F6CF78 keywords, on a dark rounded strip rgba(6,8,13,.80), bottom 70 px. The v2 serif subtitles broke this standard; go back to it.
  - Corner mark: "◆ Juno · VIBE知识大赏", top right.
  - The title lands on a big framed plaque at 16.58 s, the groove entry.
  - The Juno end card at 125.4 s, with the follow pill "关注 Juno · 一起看懂世界" and the sources line.

## Music map (measured bar RMS of s130f)
| Bars | Time (s) | Section | Story there |
|---|---|---|---|
| 0–6 | 0.38–14.56 | intro, medium energy | hook: ¥4000 → roommate ¥6000 → 不香了 |
| 7 | 14.56–16.58 | dip before the groove (−16 dB) | tension: the comparison sinks in |
| 8 | 16.58 | **groove enters: TITLE HIT** | plaque |
| 8–23 | 16.58–48.98 | groove (full, every 4th bar slightly lighter) | monkeys (20.6–48.9) |
| 24–31 | 48.98–65.18 | breakdown (quiet, −16.7 dB) | Harvard thought experiment, A vs B worlds |
| 32–38 | 65.18–79.35 | build | vacation flip 85 %, 钱上最爱比, pay site 2008 |
| 39 | 79.35–81.37 | pre-drop gap (−17.9 dB) | "可以去查同事": the scan finds your row |
| 40 | **81.375** | **BIG DROP** | "低于中位数的人：满意度[下降]": the hardest visual hit of the film |
| 40–63 | 81.4–130 | full to the end | 跳槽, 并没有更开心, 邻居, ending, end card 125.4 |

## Must include / must avoid
- Figures are faceless, with no realistic faces or hands. Capuchins are allowed but must be stylised.
- No real IP, logos, brand marks or real app chrome. No maps with borders.
- Numbers live ON the picture, readable on a phone: HUD numbers 64–92 px or larger, labels ≥ 40 px. The first frame is striking and already moving.
- Rejected before (looks.md / owner-notes.md):
  - navy + gold night (every film so far, and v1)
  - flat moonlit illustration (v2)
  - 3Blue1Brown analytic
  - procedural WebGL landscape (太丑)
  - bright flat game-UI cards (太low)
  - pixel art, manga, AI anime stills
  - stylised capsule 3D figures in downloaded rooms
  - black with thin lines throughout
- **Buildable:** HTML + Canvas2D/SVG/CSS, or three.js (WebGL 2, rendered headless with SwiftShader on a CPU render farm).
  - `window.renderAt(T)` must be a pure function of T.
  - Budget: about 1.5 s of CPU per frame at most; 3899 frames are split over 60 workers.
  - Post effects (bloom, chromatic aberration, light leaks) are fine if done in a shader or canvas.
- Owner approvals: the owner is asleep and said "不要问…你自己可以做决定，我只想看成品". The producer takes the director's top-ranked look and continues. Only the finished film goes to the owner.
