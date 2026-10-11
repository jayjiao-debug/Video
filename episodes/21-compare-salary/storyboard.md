# Storyboard v3: 为什么一比，就觉得穷？ · 满意度热像 (thermal, rendered from real three.js scenes)

The producer wrote this storyboard from the art director's Look C plan (looks.md) and the director's r1b notes, and built the proof scenes alongside it.
Proofs:
- stills: style/proof_t3.png, proof_t38.png, proof_t81.9.png
- clip: style/proof_drop_clip.mp4 (79.4–82.4 s, through the drop)

## Look
- **World and metaphor:** the whole film is seen through a thermal camera that measures 满意度. What you feel good about glows hot. The camera **auto-ranges** to the hottest thing in view, so your thing reads colder the moment something hotter enters the frame, even though it hasn't changed. That one mechanic carries every scene, including the ending, where the reference switches to last year's you and your phone flares white again.
- **Palette:** an ironbow ramp #260A68 → #681696 → #BA2280 → #EE3E56 → #FF761A → #FFBE28 → #FFEC96 → #FFFFFA, plus an ice ramp for "below ambient": #2152C7 → #50E6FF → #EBFFFF, with an ice-white rim on cold bodies.
  - No navy, no black voids. The ambient floor is deep violet.
  - Isotherm contour lines are drawn as thin white lines around every warm form; this is the look's texture.
  - Bloom only on the hottest band. Heat shimmer above hot objects. Steam.
- **Type:** Noto Sans CJK SC 900 for all HUD labels, white with a violet shadow; gold #F6CF78 only for 你 and the subtitle keywords. Engine subtitles (64 px, dark strip). Corner mark. Juno end card (violet radial, gold J).
- **HUD:** one legend, the vertical ironbow bar "满意度 · 越开心越热" on the right (0–16.4 s), with markers that slide as the range changes.
  - Big numbers (150 px): 95/60/20 %, 48 %, 85 %.
  - No brackets, no reticle, no °C, no MAX/IR text.
- **Must not look like:** surveillance or military targeting, horror, green night vision, flat clip-art, or navy + gold.
- **Engine:** three.js scenes render a signed heat scalar per pixel into a half-float target. The heat is blurred at 1/4 and 1/16 resolution for diffusion, then the composite pass applies:
  - the LUT, auto-range (lo/hi) and contours
  - bloom, shimmer and the haze transition
  - frost, used for the drop

  Heat lights warm the walls near hot objects. Measured 1.2–2.4 s per frame on the 2-core box; the heaviest shot is the hall (≈2.0 s).

## Camera rules
- One operator. Moves are eased (quintic in/out) between keys that sit on bars or half-bars; a hold is just two identical keys.
- The camera never passes through a body or a wall. In the hook it rises over your head before pulling back.
- One travel direction per section. The only lateral moves are motivated head turns (the hook: you look at the roommate, then back).

## Scenes and beat map
Bars: bar n = 0.383 + 2.0248·n.

| # | Time (bar) | Shot / camera | Key visual | Hits (on beats) | Transition OUT (motivation) |
|---|---|---|---|---|---|
| 1 HOOK | 0–4.43 (b0–2) | First person: your phone fills ~60 % of the height, slow push | white-hot phone, dark print ¥4000, legend 你的 ¥4000 at the top of the bar | frame 0 is already hot and moving | rise over your head, pull back |
| | 4.43–8.48 (b2–4) | pull back behind you; desk, laptop, mug steam, window | the sun crosses the window 3 times; 开心的第 1/2/3 天 | each day on a half-bar (4.43, 5.44, 6.46) | head-turn right |
| | 8.48–12.53 (b4–6) | turn to the top bunk and zoom | the roommate holds out ¥6000: it flares past white (bloom); label 室友 · ¥6000 | phone ignites on b4; **auto-range** on b5 (10.51): the legend rescales, the 室友 ¥6000 marker lands at the top, yours slides down | turn back over your shoulder |
| | 12.53–16.4 (b6–8) | over the shoulder onto your phone, slow push | your phone, same number, now magenta-red | b7 (14.56, music dip): stillness | — |
| | **16.58 (b8) TITLE** | plaque erupts from your screen toward the lens | white-hot cast plaque 为什么一比，就觉得穷？ / THE COMPARISON TRAP, flash decays in 0.3 s | groove downbeat | plaque cools and drops; camera dives into the mug's steam → **heat-haze wipe** |
| 2 LAB | 20.63–24.68 (b10–12) | crane down out of the haze to a wide shot of two cages | two capuchins in side profile, warm | haze clears on b10 | — |
| | 24.68–28.73 (b12–14) | push to monkey A's exchange | stone (cold) out → cucumber (lukewarm) in, one exchange per bar | every bar: token out on beat 1, food in on beats 2–3, eat on beat 4 | — |
| | 28.73–32.78 (b14–16) | wide two-shot | big 95 % | 95 % lands on b14 | truck right |
| | 32.78–36.83 (b16–18) | push to monkey B | the grape is the hottest object in the room; A turns its head toward it and cools | grape in on b16 | whip back to A |
| | 36.83–40.88 (b18–20) | close on A | A turns ice-blue, takes the cucumber and **throws it out of the cage**; 95 → 60 % | 60 % on b18; the throw on beat 3 of each bar | pull back |
| | 40.88–44.93 (b20–22) | two-shot | B gets a grape without giving a stone; A is ice; 20 % | 20 % on b20 | — |
| | 44.93–48.98 (b22–24) | push into the grape | the grape's white bloom fills the frame | — | **grape bloom → coin**: the white fill resolves into a white-hot coin |
| 3 WORLDS (breakdown) | 48.98–53.03 (b24–26) | pull back from the coin: two floating plateaus A and B, each with a small warm town; 257 small figures on the plain between | the question set-up | — | slow orbit (one direction) |
| | 53.03–57.08 (b26–28) | onto A | coin towers rise: yours 20 coins (5万) vs others' 10 (2.5万); 1 coin = 2.5万 | towers rise on beats | glide to B |
| | 57.08–61.13 (b28–30) | onto B | yours 40 (10万), others' 80 (20万). B ranges on its tallest tower, so your 40 reads cooler there | towers on beats | pull back |
| | 61.13–65.18 (b30–32) | wide | 257 figures walk; 123 go to A; 48 % | 48 % on b30, figures settle by b31 | — |
| | 65.18–69.23 (b32–34) build | wide, slow push | coin towers turn into day tiles (假期); the figures re-sort, 85 % to the world where they themselves have more | tiles flip on beats; 85 % on b33 | — |
| | 69.23–73.27 (b34–36) | push into your coin tower | day tiles cool and fade; the coins alone glow hot (钱上最爱比) | coins re-ignite on b34 | **match: the stacked hot coin edges = the hot rows of the 2008 pay list** |
| 4 WALL | 73.27–79.35 (b36–39) | close on the giant hot list, slow drift | 加州大学 · 员工工资 · 全部可查 (2008 · 报纸网站): rows grow on beats; the scan sweeps the rows (可以去查同事) | rows on beats; the scan stops on your row on b39 | pull back: every row is a person on the tiers |
| | 79.35–81.37 (b39 gap) | pulling back | tiers of staff in pay order; 你 ringed in gold, just under the middle | quiet bar | — |
| | **81.375 (b40) DROP** | crane down | the median isotherm slams across, white-hot; a cold front runs down the tiers over 2 beats and everyone below turns ice; 满意度▼ on beat 2 | the hardest hit of the film | — |
| | 85.42–89.47 (b42–44) | truck right | the cold ones turn and drift toward a warm doorway: 找新工作 | the door ignites on b42 | — |
| | 89.47–93.52 (b44–46) | crane up | upper tiers hold exactly the same heat: 高于中位数 · 满意度 不变 | — | — |
| | 93.52–97.57 (b46–48) | follow the walkers to the door | only the ones who lost the comparison are cold | — | **through the warm doorway** |
| 5 STREET | 97.57–101.62 (b48–50) | out on a night street, dolly along it | your house stays the same while the neighbours' houses heat up, window by window | each neighbour on a beat | — |
| | 101.62–105.67 (b50–52) | push toward your window | auto-range: your unchanged house reads colder (越不快乐) | range shift on b50 | **through your window** |
| 6 END | 105.67–109.72 (b52–54) | back at your desk (the hook's room), over the shoulder | your ¥4000, cool, against the roommate's | — | — |
| | 109.72–113.77 (b54–56) | look up to the bunk | the roommate's phone burns like the grape; a hot grape blooms beside it (callback) | grape on b54 | — |
| | 113.77–117.82 (b56–58) | between two placards | 跟室友比 −¥2,000 (cold) / 跟去年的自己比 +¥4,000 (hot) | placards on beats | — |
| | 117.82–121.87 (b58–60) | onto your phone | the **reference switches**: the legend's top marker becomes 去年的你 ¥0 at the bottom; the range re-centres and your phone flares white-hot: +¥4,000 · 去年这时候：¥0 | flare on b58 | — |
| | 121.87–125.4 (b60–62) | slow pull back, the room warm | your question | — | end card at 125.4 |

## Text placement
- Subtitles sit in y 900–1010 on the engine strip.
- The top-left stays clear (Douyin watermark).
- The legend is on the right.
- Big numbers sit at the top-left area (x 96, y 150), below the watermark zone.
- 3D labels are projected next to their object.
- Source lines are 19 px at the very bottom.

## Sound
Music s130f untouched. SFX, quiet and in one family, tuned to F#:
- a soft "ignite" swell when something heats (the roommate's phone, the grape, the line)
- a low frost crackle on the drop
- one whoosh for each haze/fill transition
- the existing two pings removed

All sit ≥10 dB under the music except the drop.
