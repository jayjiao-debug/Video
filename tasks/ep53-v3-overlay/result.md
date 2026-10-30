I've built the v3 overlay for ep53. All seven items are done and the film still renders. One problem is outside my files: during the second chamber, the picture draws its own depth number on top of mine, so you see two numbers in the same spot.

**What I changed** (in `episodes/37-qiqing/remotion/src/qq53/`):
- **`lines53v3.ts`:** `LINES53V3` now holds all 31 lines word for word from `lines_v3.json`, named as in `MUSIC_NOTES_v3.md`, each with its stamp. `SOURCES53V3` and `CARD_T3` are unchanged.
- **`master53v3.tsx`:** `Overlay53v3` replaces the stub and takes the same inputs, so `EP53V3.tsx` didn't need changing. I left `master53.tsx` alone. The title on the glass and the timing helpers are imported from it. The subtitles, scrim, stamp and seal are copied into my file with a `lines` input so v2 keeps working.

**How each item looks in the stills:**
1. **Subtitles:** the v2 look (top-left, typing, soft scrim, underlined keywords). The inscription line 「越王鸠浅」 is centred with its small second row. Nothing shows during the title (9.500–11.764) or from 140.824 on.
2. **Stamps:** they behave as in v2, including the 2026 → 1965 roll that presses on 23.651. Lines marked 〃 in the draft repeat the previous stamp. The fact-check changes are in: G3 「《左传》：吴其为沼」, G4 「《国语》：在吴三年」, R2 「1965 → 今」. I also added a faint dark scrim behind the stamp for bright frames, because `storyboard_v3.md` asks for one.
3. **Hollow J seal:** same size and place, with a soft round dark halo and no box. It now reads over the bright blade (checked at 100.07 and 101.0).
4. **Title:** unchanged. Frame 284 has no title and frame 285 shows it complete.
5. **Depth tags:**
   - **Descent:** 0.0 from 24.9, counting from 29.9 at 2.4 m/s to 10.8 at 34.4, fading out over 38.5–38.935.
   - **Second chamber:** 10.8 from 118.2, counting down to 0.0 between 126.1 and 130.069, gone by 130.6.
   - The timings are exported as `DEPTH3` so the TakeB3 builder can match them.
6. **Element tiles:** 214 px, in one fixed zone at the bottom right (x 1345–1790, y 683–897), above the seal. Cr is in the same left slot both times and is never struck through. Each tile appears complete on its own frame and leaves with a 0.2 s fade:

   | Tile | Appears on frame | Gone by |
   |---|---|---|
   | Cr (question) | 557 | 20.6 s |
   | Cu + Pb | 3002 | 102.2 s |
   | Cr (question) | 3070 | 106.7 s |
   | Sn | 3138 | 106.7 s |

   Pb shows 「≈ 0」 and is dimmed with a dark veil rather than made see-through, so the bright blade doesn't show through it. I moved the zone 30 px right so the tiles clear the existing picture tag 「铜·锡 约18–20%·铅≈0」.
7. **Checks:** I looked at stills at every line start + 0.6 s and every time and frame the brief lists, plus about a dozen more. Frame 4224 still has the P1 stamp and seal; frames 4225–4226 have nothing from the overlay. I also compared consecutive frames in two low-res video ranges (17–41 s and 99–132 s). The overlay itself only jumps on the planned tile hits. The many other frames above 3 come from camera moves in the picture takes.

**Outside my files:**
- The TakeD3 stub reuses the v2 picture, and `take53d.tsx` line 72 still draws its own depth tag (about 119.2–126.6 s). At 126.1 the two numbers overlap and read as 「1027」. Whoever builds TakeD3 needs to leave that tag out.
- The TakeB3 stub doesn't yet follow the 2.4 m/s descent timing, so its picture and my depth numbers don't line up yet.
- The continuity review suggests removing the M1 picture tag 「铜·锡 约18–20%·铅≈0」 once the tiles land, since it repeats them. That tag belongs to the picture shared with v2, so I left it.

The self-check is at `tasks/ep53-v3-overlay/out/selfcheck.md`. All renders are in /tmp only; nothing was committed.
