# faces: the face vs HUD checker of NewtonFilm

Headless (no GL, no browser, no render queue). For every frame it poses the film's real World the way the clearance
checker does, takes every visible figure's face from the rig's own face drawing, projects it to the 9:16 screen
(1080 x 1920) with the frame's camera and reports where it lies under that frame's HUD. The zones are hud/style.ts
`FRAME` (the kit's FRAME_9x16 with the film's one override, 15 Nov): the cut sides x < 58 and x > 1024 (`margin`),
the app's icons (y 143-222), button column (x >= 890 from y 1000) and post text (x 58-805 from y 1505) plus everything
below y 1490 (`phone`), the subtitle band x 110-890, y 1280-1460 (`band`). The header of `check.ts` has
the whole contract (face regions, the HUD items, the freeze and the cut-out, the joins and the words).

```
bash scripts/newton/qa/faces/run.sh                     # whole film (about 20 s) -> /home/user/newton_work/film/check/whole/faces/faces.txt / faces.json
bash scripts/newton/qa/faces/run.sh --seg F,G           # some scenes
bash scripts/newton/qa/faces/run.sh --from 4380 --to 4420
  [--out DIR] [--step 1] [--gap 4] [--min 1] [--pad 0] [--zone skin|face|head] [--dump F,G] [--quiet] [--words]
```

## Sections of faces.txt

- **FACE UNDER THE HUD**: one row per range of frames where one figure's face lies under one HUD item (REC, the stamp
  small or big, the battery, a fact card, the title, the subtitle rows, the empty subtitle band, the phone app's own
  things and the frame's bottom line, the cut sides, the skin's effect boxes).
- **HIDDEN ONLY**: the same, where the face's five key points are all behind another solid.
- **JOINS**: the 11 joins of beats.ts against the picture's cuts (and the clock races of hud/vlog.tsx).
- **WORDS vs JOINS**: every subtitle, card and whisper bubble against the next join (`--words` prints only this).
- **THE CUT-OUT vs THE CARD**: the lead's lifted cut-out on his intro card against the card's words.
- **NEWTON'S EYES BELOW THE UPPER THIRD**: info.

## Severity

| severity | meaning |
|---|---|
| HIGH | the drawn features (brows, eyes, mouth) 400 px² or more, or 6000 px² of skin, under the item |
| med | 800 px² of skin or more |
| low | less, or only the empty subtitle band (outside the rows' box) |
| info | **a `margin` crossing while the camera or the face is moving** (see below) |

### `margin` is HIGH only on held frames (gate-5 note F7, 15 Nov)

The cut sides (x < 58 and x > 1024: Douyin fills the screen and cuts them off). A face that crosses the frame
edge during a move or an exit is part of that move, not a framing fault. So every `margin` hit is classified after
all frames are posed:

- **the camera moves** when the face's own world points (the head ball's centre and its left and right sides) shift
  `CAM_PX` = 1.5 px or more on screen per frame from the camera's change alone, to the frame before or after (so the
  first and last frames of an eased move count);
- **the face moves** when its head box's centre shifts, or its radius changes, by `FACE_PX` = 2.5 px **and** by
  `FACE_REL` = 2 % of its radius or more per frame (a talking head's bob in an extreme close, about 1 % of its radius,
  stays held), or when it is out of frame on a neighbouring frame of the same place (entering or exiting).

Neighbours across a cut (a change of place) do not count. A `margin` range made only of such moving frames is
reported as **info** with the reason and the largest speeds (`moving: camera, camera <= 98.8 px/f, face <= 139.1
px/f`); a range of held frames keeps the usual severity (`held, camera <= 0 px/f, face <= 0.6 px/f`) and is HIGH when
the face is under the margin by the HIGH measure. Moving and held frames of one face are never merged into one range.
The header line `HIGH: n ranges (m margin on held frames) ...` counts them. Only `margin` is treated this way: a face
under REC, a stamp, the battery, a card, a subtitle or an effect box is reported at its severity whether or not
anything moves.

faces.json carries the same: each margin hit has `mv: { cam, face, gone }` (px per frame) and `moving` (the reason,
when it is not held); each range has `moving`, `why`, `cam`, `spd` and `severity`.

Sanity test (a held face forced under the margin by padding the boxes): `--from 4440 --to 4460 --pad 500` gives
`HIGH F f4440-4460 ... held, camera <= 0 px/f, face <= 5.1 px/f` (F's held extreme close; 5.1 px/f is his talking bob
at a 400 px head radius, under 2 %).
