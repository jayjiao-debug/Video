# ep53 v3 overlay — self-check

Files changed: `episodes/37-qiqing/remotion/src/qq53/lines53v3.ts` (LINES53V3 filled; SOURCES53V3 and CARD_T3 unchanged),
`episodes/37-qiqing/remotion/src/qq53/master53v3.tsx` (Overlay53v3 replaces the stub, same props `{t, quad}`). I did not
touch `EP53V3.tsx`, because no extra props were needed. `master53.tsx` was not edited: master53v3 imports `TitleOnGlass`,
`frameOf`, `onHit` and `H1_ROW2` from it and holds its own copies of the subtitles, scrim, stamp and seal with a `lines`
parameter. `tsc --noEmit` reports no errors in these files. The film renders.

All renders are under /tmp/r, nothing is in the repository. Stills checked: every line start + 0.6 s (31 lines), 9.6, 19.5,
20.2, 20.6, 26.0, 32.0, 34.4, 38.9, 64.5, 70.0, 75.0, 85.0, 101.0, 105.5, 118.2, 118.5, 126.1, 126.5, 128.0, 130.0, 132.5, 136.0,
140.9, 141.4 s; frames 284–286, 556/557, 3001/3002, 3069/3070, 3137/3138 and 4224–4226. Low-res videos: 17–41 s and 99–132 s.

| # | Item | State | What I checked |
|---|---|---|---|
| 1 | Subtitles | done | All 31 lines are verbatim from lines_v3.json, with IDs from MUSIC_NOTES_v3. Layout D, typing, scrim and `[ ]` underline are as in v2, and H1 row 1 is on screen from frame 0. I0 is the centred Q line with its gloss (43.5 ✓). Nothing shows during the title (f284 shows H2, f285–286 show only the title) or from 140.824 (f4225/4226 and 140.9/141.4 are clean). |
| 2 | Stamps | done | Stamps come from stamps_v3_draft, with 〃 meaning "same as the previous stamp" (G6 = G5, M3 = M2). G3 reads 「《左传》：吴其为沼」 (64.5 ✓), G4 reads 「《国语》：在吴三年」 (70.0 ✓) and R2 reads 「1965 → 今 · 湖北省博物馆 / 据后德俊 · 渐失光泽」 (132.5 ✓). v2 behaviour is kept: the stamp types after the line, holds while unchanged and retypes only the changed part. The S4 roll 2026 → 1965 presses on beat 41 (21.4 shows the roll mid-way, 24.8 shows 1965). The second line is 38 px with the dark shadow. Added: a faint feathered scrim behind the stamp, which storyboard_v3 asks for over bright top-right frames. |
| 3 | Hollow J seal | done | Same 92 px SVG, same place (right SAFE_X+1, bottom SAFE_Y−1), opacity 0.65. Added a 180 px radial dark halo (no edge) and a small drop shadow. It reads over the bright blade at 100.07 and 101.0. It is shown at every t < 140.824, and the overlay draws nothing from the card on. |
| 4 | Title | done | `TitleOnGlass` is unchanged (imported). f284 has no title, f285 shows it complete, and the 9.6 s still is correct. |
| 5 | Depth tags | done (overlay side) | Uses `DepthTag` from parts53. Descent: 0.0 from 24.9 (fade 0.25 s), holds 0.0 to 29.9, then counts at 2.4 m/s to 10.8 at 34.4, holds, and fades out over 38.5–38.935. Stills: 26.0 → 0.0, 29.9 → 0.0, 32.0 → 5.0, 34.4 → 10.8, 38.9 → fading. Second chamber: 10.8 from 118.2, counting down over 126.1–130.069, fading out by 130.6. Stills: 118.5 → 10.8, 126.5 → 9.7, 128.0 → 5.6, 130.0 → 0.2, 130.7 → gone. Constants are in `DEPTH3` (exported). **Outside my files:** the TakeD3 stub reuses v2 `TakeD`, and `take53d.tsx` line 72 still draws its own `DepthTag` (about 119.2–126.6 v3). This gives a doubled number in the same place, visible at 126.1 ("1027"). The TakeD3 builder must leave that tag out of the v3 picture. Also, the TakeB3 stub's picture (shaft ruler, chamber) does not yet follow the 2.4 m/s timing; its builder is meant to build to `DEPTH3`. |
| 6 | Element tiles | done | `ElementTile53`, 214 px, all in one bottom-right zone. Slot L is centred at (1452, 790) and slot R at (1683, 790), so the zone spans x 1345–1790, y 683–897: inside the safe area, above and clear of the seal (y ≥ 931) and clear of the subtitles. Cr (question, never struck) is in slot L both times. Hits, each complete on its own frame: Cr at f557 (f556 empty), Cu + Pb at f3002 (100.068; f3001 empty), Cr at f3070 (f3069 empty), Sn at f3138 (f3137 shows only Cr). The landing is a 3-frame scale settle (1.035 → 1, no fade-in). Each tile leaves with a 0.2 s fade, gone by 20.6 / 102.2 / 106.7. Pb shows 「≈ 0」 and is dimmed by a dark veil instead of transparency, so the bright blade doesn't show through. Sn uses the `hi` state. The zone was shifted 30 px right so the tiles clear the v2 picture tag 「铜 · 锡 约18–20% · 铅 ≈ 0」 in M1 (gap ≈ 55 px). |
| 7 | Stills + frames | done | See the lists above; I looked at every still. f4224 is the last frame before the card and still shows the P1 stamp and seal. f4225/4226 show no overlay element (the red J there is TakeD3's card). |

Frame-difference (0.25-scale video, mean grey per frame): the overlay's own steps are the planned hits only. At f557 the
difference is 3.2. At f3002 it is 10.3, against the picture's moving background of about 8.8. At f3070 it is 11.6, where the
tile coincides with the picture's 「镀铬？」 event. At f3138 it is under 3. The other values above 3 in 17–41 s and 99–132 s
come from the camera moves of the stub takes (TakeB3, TakeD3) and v2 TakeC, not from the overlay. Every overlay change is a
typed character, a fade of 0.2 s or longer, or a planned hit.

Notes for others (not in my files):
- `take53d.tsx`'s in-picture `DepthTag` must not appear in v3 (see item 5).
- Continuity suggests dropping v2 TakeC's text tag 「铜 · 锡 约18–20% · 铅 ≈ 0」 in M1 once the tiles land, because it says the same thing as the tiles. That tag belongs to the picture (TakeC, shared with v2), so I left it.
