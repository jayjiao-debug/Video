# Craft: story, visuals, camera

Distilled from 《它在瞄准谁》 and 《应该没事吧》 and the creator's notes on every draft.

## The story
- **One principle, several very different scenes.** 《应该没事吧》: normalcy bias → Titanic lifeboats
  → smoke-filled room (1968) → 2004 tsunami (Tilly Smith) → 2011 Okawa vs Kamaishi → back to the opening image.
  Different places, eras and scales, one idea. The creator rejected "all ships" ("为什么都是船") — vary the scenes.
- **Open on a concrete, data-shaped paradox** (40 seats, 12 people; 1178 seats, 414 empty; 1500 in the water), then say
  the paradox in one line ("不是座位不够，是很多人不肯上船"), then the title card. Title after the paradox works better
  than title first.
- **Cold open must be slow enough to read and must ask the question**: "它为什么没坐满？". A 4-second cold open was too
  fast; 8 seconds with the question landed.
- **Data must look "wow"**: one dot per person, seats that light up, counters that count, tallies (74 grey of 108;
  500 squares for 99.8%). Numbers on screen always come with the visual that makes them felt.
- **Slogan**: the end card's follow pill reads `关注 Juno · 一起看懂世界` (not the retired 反直觉 line).
- **End on the viewer**: a question in the end card ("火警响了，你会先跑，还是先看别人？") and the same question pinned
  in the comments. A separate 8-second "your dorm" scene was cut: it was weaker than giving the time to the data.
- **Tie scenes together** when the facts allow it: Kamaishi's children had watched footage of the 2004 tsunami — the
  previous scene. Look for such links while researching.

## Choosing the tool for each scene
| Content | Tool | Why |
|---|---|---|
| Places, scale, physical events (a ship, a sea, a beach, a wave) | 3D (three.js in Remotion) with downloaded models | depth and camera moves give "大片" feel |
| Data (seats, people, counts) | instanced meshes / SVG squares and dots | thousands of marks stay cheap and exact |
| People acting (a lounge, a deck, a lab, a dorm) | 2D flat illustration (templates/people2d.tsx) | expressive and controllable; 3D people looked crude |
| Maps and comparisons | 2D SVG contour maps, split screen | clean, legible |
| Data prep, terrain, timing | Python | verify every number in code |
Don't build what you're bad at: the first procedural ship was "太粗糙了". Download real models (scripts/assets) and
spend the effort on lighting, camera and data overlays instead.

## Camera and framing
- Keyframe cameras (camAt) with easeInOut; one move per beat-phrase, not constant drifting.
- **Show what the line is about**: when the line is "40个座位只坐了12个人" the camera looks down into the boat so the
  seats are readable. A low side view of the same boat failed ("看不清救生船里面").
- **Never let the camera path cross geometry.** Check every key-to-key segment against buildings, trees, umbrellas,
  the hull. Tracking shots: offset to the side and clamp the offset so it stays outside the building's footprint.
- Remove props near camera paths instead of hoping (an umbrella flickered through the near plane).
- **One place to look at a time.** Two animated panels side by side split attention ("我不知道看哪里"). Tell it in acts:
  A alone (zoomed), then B alone, then both side by side for the comparison.
- Put subtitles' space aside: the bottom ~260 px belongs to text; keep the action above it, move grids up.
- Keep the sea from upstaging the subject: darker water, low distortion, slow time, calm (historically right, too).

## Transitions
- Match cuts and pushes: dive into an empty seat → the seat fills the screen → next scene fades in on that colour;
  smoke fills the room → white → a bright beach; the end returns to the first image (boat No. 1) and fills its seats.
- Fade every scene in and out over ~0.3–0.6 s inside its own window; the film composition simply stacks scenes.

## 2D people
- Seated people need legs, shoes and a chair. Standing people need a floor shadow.
- Give each a readable action (bow strokes, a sip, a wave, a shrug, a glance left-right) and a mood face.
- Speech bubbles: short, pop on a beat, never two overlapping; the tail points at the speaker.
- Small labels explain roles ("演员 · 装没事") — clarity over subtlety.
