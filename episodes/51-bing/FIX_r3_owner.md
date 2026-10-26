# ep51 round 3: owner notes (2026-10-26 15:29)

The owner is "generally happy" with the film. He sent screenshots and four notes.

## 1. Quick fixes (do now)
- **(owner) 0:57, Builder B.** The Song buyer walks backwards: his body faces left while he moves right (moonwalk). Every walking figure must face the way it moves, and its gait must step that way.
- **(owner) 1:22, Builder B.** The 酸梅汤 seller also walks backwards: body and legs don't match the direction of travel. Same rule. Check every other walking extra in your range too: queue, officials, workers, vendors, the buyer, the seller.
  - **Builder A:** check the same in 0–56 (labourers, servant, carvers, nobles).
- **(owner) Builder A, master51.**
  - **Remove the bottom-left counter for the whole film.** The stamp top-right already gives the era.
  - Keep the stamp exactly as it is.
- **(owner) Builder A, master51.**
  - **Make the J seal hollow:** an outline ring + the J in line only, no filled disc, about 60–70 % opacity. It should attract less attention.
  - Same position (phone-safe), still hidden on the end card.
  - The end card's red J stamp stays as it is.

## 2. Colour: too monotone (owner)
> "The whole color scheme is too monotone, a bit difficult to make out the characters and background. This is good for bringing out the main character (the ice) but it takes away from the aesthetically pleasingness."

**Goal:** more colour and more value separation, so figures read clearly against the background and the film is pleasing to look at, while the ice stays the hero: the brightest and only true cool white in frame.

**Before the whole film is recoloured, the owner picks a direction from style frames.** Make **two options on the same 4 frames**:
- **Builder A:** 13.6 (周 river, night) and 33.5 (鉴缶 room).
- **Builder B:** 58.5 (宋 street, day) and 82.5 (清 hutong).

Build each option as a theme switch (e.g. a `LOOK` constant or prop) so it can later apply film-wide. **Builder A creates `src/qq51/palette51.ts`** with both palettes as tokens and exports them first; B imports it.

### Option 1 「暖层次」: the same family, opened up
- Keep the warm lacquer family, but lift and layer the values:
  - far planes lighter and hazier (atmospheric depth);
  - near planes darker;
  - **a soft lit backdrop behind every figure** (a sky glow, a lit wall, a lantern pool), so the silhouette reads as dark-on-mid. Backgrounds sit at roughly 20–40 % luma in the subject area instead of ~10 %.
- Stronger warm rim on characters (2–3 px, brighter).
- Props in their local colour at moderate saturation: wood, bronze, cloth, paper, umbrellas.
- The gold hairlines stay.

### Option 2 「时代色」: each era its own colour key
Characters stay one-tone silhouettes with the warm rim, but each era gets its own mid-value colour field. Suggestions (refine them):

| Era | Colour key |
|---|---|
| 周 snow night | deep indigo-violet sky with a moonlit horizon band |
| 战国 | lacquer red-black with bronze gold |
| 唐 | vermilion and gold |
| 宋 summer day | warm ochre street under a pale teal sky |
| 清 night | vermilion wall and slate blue; 清 summer is jade/celadon and warm grey |
| 乾隆 hall | gold and cloisonné blue |
| today | neutral warm-grey kitchen |

Keep it harmonious and painterly, not garish. Saturation stays moderate (about 35–55 %).

### Rules for both
- **Ice stays the hero:** the highest luma, with a white core and its cool glow.
- Where the background is blueish (周 night), separate the ice with brightness and a thin warm edge, never by making the background darker again.
- Subtitles stay readable: keep the soft dark scrim behind the text where the background is lighter.
- Phone check: at 25 % size, figure vs background must read in under a second.
- No new elements or story changes; it's colour and value only (a lit backdrop shape behind a figure is fine).

### Deliver
- PNG stills at full size, both options, to `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/look51/`, named `opt1_13.6.png`, `opt2_13.6.png` and so on.
- Also the current look at the same times as `cur_13.6.png` etc., for comparison.
- Then a short note on what each option changes.
- Don't apply the colour film-wide yet. The quick fixes in §1 do go film-wide.
- Typecheck. No full render. Delete bundles. Don't commit.
- Budget: about 45 minutes.
