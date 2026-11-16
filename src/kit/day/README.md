# The day engine (采访XX的一天)

The engine the four day films (秦始皇, 苏东坡, 李白, Newton) each carried as their own copy, now in one place. It was
taken from Newton's copy, the newest one. The finished films keep their own copies and are not touched. A new film
builds on this engine instead of copying a film folder.

**Proof that it is the same engine.** `node scripts/kit/day/proof/run.mjs` compares the kit with Newton's own engine,
function by function, on every frame of the film: the timeline, the camera moves, the verbs, and the caption and vlog
HUDs as rendered markup. About 137,000 values are compared and every one matches. `bash scripts/kit/day/proof/render_compare.sh`
renders Newton frames twice, once through its own `Film.tsx`, `World` and sets and once through `makeDayFilm`,
`DayWorld` and `makeSets` (the shots and HUD stay Newton's), then compares them pixel by pixel. The film is not
changed: the script adds a temporary composition and removes it on exit.

## Start a film

Copy the starter film: `src/videos/day_template/` (composition `DayTemplate`) and `scripts/day_template/`. Then:

1. Write `scripts/<film>/voice/<film>_lines.json`. It holds the speakers, scenes, lines, screens, cards, the title and the
   optional `"engine"` block (`scripts/kit/day/gen_timing.py --help` lists it).
2. Run `python3 scripts/kit/day/gen_timing.py --film <film> --placeholder`. It writes `src/videos/<film>/voice.ts` and
   `captions.ts`. When the real voice is in, run `gen_timing.py --film <film> <voice_timing.json>` instead.
3. Write `story.ts` (`makeTimeline`), `sets.ts` (`makeSets` and one builder per place), `people.ts`, `props.ts`,
   `world.ts` (`DayWorld`), `cam.ts` (`makeCam`), `shots/common.ts` (`makeVerbs`), `hud.tsx` (`makeCaption`,
   `makeVlog`), one `shots/segX.ts` per scene, and `Film.tsx` (`makeDayFilm`). Then add the composition to `src/Root.tsx`.
4. Voice and sound: `scripts/kit/day/voice/{assemble,cut_lines}.py --film <film>` and
   `scripts/kit/day/sound/build.py --film <film>` (cues come from `scripts/<film>/sound/cues.json`).

## What is in it

| file | what | the call |
|---|---|---|
| `types.ts` | the contract: `CamPose`, `PostPose`, `DayPose<X>`, `DaySegment<W, P>`, `PlaceLook`, `PlaceBuild`, `ParamValue` | types only |
| `timeline.ts` | lines, quotes, segments, cards, scene stamps, title block and the HUD hook, all read from the generated `voice.ts` / `captions.ts` | `makeTimeline({ voice, captions, L, fps, what?, clock? })`, `makeLens(H, lensH?)`, `clockText` |
| `sets.ts` | the places behind one interface (`DaySet`): one group per island, per-frame params, the figures' light following the params | `makeSets(gl, PLACES, DEF, { name })`, `BAKED_LIGHT`, `placeTables` |
| `world.ts` | the World: the places, props and cast, built once per page. A shot calls `setPlace`, `set.param`, `setCamera`, `actor`, `update`, `prop`, `project` | `class World extends DayWorld<…>`; the spec takes `onActor` / `onUpdate` for a film's own figure rules |
| `cam.ts` | her eyes: `povCam`, `keyCam`, `handheld` (moods, walk), `punchIn`, `whip`, `follow`, `dip`, `duck`, `aside`, `creep`, `lean`, `lower`, the lens move (`zoomFov`, `aimCam`, `lensCam`), `toScreen` / `fromScreen`, `whipSmear`, `palm` | `makeCam({ fps, W, H, FOV, EYE, lensTan, lensH?, smearBand? })` |
| `verbs.ts` | the action library: lip-sync (`speak`), head accents, eased keys, `walkAlong`, `seated` (on a `Seat`), `kneel`, `bow`, `salute`, `standing`, `saying`, `shake`, … | `makeVerbs({ fps, EYE, FOV, quotes })` |
| `film.tsx` | the film shell: the canvas, the post chain (N8AO → ink → lens blur → cut-out → bloom → tone mapping → grade), the first-frame kick, the freeze clock, the DOM layers | `makeDayFilm({ name, W, H, segments, timeline, makeWorld, layers, hold?, afterPose?, iso?, prepare? })` |
| `hud/style.ts` | the HUD's colours, the 9:16 phone-safe frame (`FRAME`, `SAFE`), text widths, box overlap | constants and pure functions |
| `hud/caption.tsx` | the subtitles: Chinese large, English small only under another language, rows balanced at a mark, anchored on the band's bottom, 3-frame fades, clipped before a join | `makeCaption({ captions, captionAt, captionRuns, trailingPunct, speakerCol, joinClip? })` |
| `hud/vlog.tsx` | her camera's recording UI: the breathing REC lamp, the timestamp (big slide-in per scene, the clock racing at clock joins), the battery on the clock, the switch-off | `makeVlog({ fps, scenes, stamp, segments, segmentAt, en, offAt?, joins?, wordFrom?, battery? })` |
| `hud/phone.tsx` | the phone mask for review stills (input prop `mask`) | `<PhoneMask />` |

The scripts are in `scripts/kit/day/`: `gen_timing.py`, `voice/assemble.py`, `voice/cut_lines.py`, `sound/build.py`
and `sound/make_poweroff.py`. Each takes `--film`. The film's constants come from its lines file's `"engine"` block and
its `cues.json`.

## Still per film

The fact card, the title block, the whisper captions and the screen-effect skin (Newton's `hud/ms`) are still each
film's own. Each film designs them on top of `src/kit/overlay`. Her mic and hands (Newton's `cam.ts` micPose and the
helpers after it) are still per film too.
