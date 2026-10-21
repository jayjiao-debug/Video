# Craft: choosing the tool and the camera

What this engine builds well, learned from 《它在瞄准谁》, 《应该没事吧》 and later episodes. Taste rules are in
`production-crew/references/house-rules.md`; this file is about execution.

## Choosing the tool for each shot
| Content | Tool | Why |
|---|---|---|
| Places, scale, physical events (a ship, a sea, a city) | 3D (three.js in Remotion) with downloaded models | depth and camera moves give the "大片" feel |
| Data (seats, people, counts) | instanced meshes / SVG dots and squares | thousands of marks stay cheap and exact |
| People acting | 2D cast (`templates/people2d.tsx`, figure-rules) | expressive and controllable; 3D people looked crude |
| Maps and comparisons | 2D SVG contour maps, split screen | clean and legible (no national borders) |
| Phone stories | real-looking app screens in 2D | the viewer's own world |
| Data prep, terrain, timing | Python | verify every number in code |

Spend the effort on light, camera and data overlays, not on modelling: the first procedural ship was "太粗糙了".

## Data that feels "wow"
Numbers come with the picture that makes them felt: one dot per person, seats that light up, counters that count,
tallies (74 grey of 108; 500 squares for 99.8 %). The number lives on the object, not in a caption.

## Camera and framing
- Keyframe cameras (`camAt`) with easeInOut; one deliberate move per phrase rather than aimless drifting.
- **The camera shows what the line says:** when the line is "40个座位只坐了12个人", look down into the boat so the
  seats are readable (a low side view failed: "看不清救生船里面").
- **Never let the camera path cross geometry.** Check every key-to-key segment against buildings and props;
  track with a clamped side offset; remove props near the camera path; near plane ≥ 0.03 small / ≥ 0.1 big worlds.
- **One place to look at a time.** Tell comparisons in acts: A alone, then B alone, then both side by side.
- Keep the action above the subtitle band.
- Keep backgrounds (sea, sky) from upstaging the subject: darker, calmer, slower.

## Transitions the engine does well
- Push into an object until it fills the frame, then the next scene opens on that object or its colour.
- A shape or light that becomes the next shape or light (smoke → white → a bright beach).
- Return to the first image at the end.
- Each scene owns its in/out inside its own window; the film just stacks scenes. Labels leave before the move.

## Tying scenes together
When the facts allow, link scenes (Kamaishi's children had watched footage of the 2004 tsunami, the previous
scene). Look for such links while researching.
