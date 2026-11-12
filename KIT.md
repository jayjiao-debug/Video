# KIT: the shared tools for the toon films

Everything a new film can reuse from the Hongmen film (鸿门宴), in two folders: code in `src/kit/`, tools in
`scripts/kit/`. Each folder has a README with the details; this page says what each tool is, when to use it and the
one command. Hongmen keeps working through one-line re-exports and wrappers at its old paths.

## The tools

| tool | when | one command | README |
|---|---|---|---|
| render queue | EVERY render on this machine (parallel renders crash it) | `bash scripts/kit/queue/still.sh <entry.ts> <abs out> --pick 0,100 --size 540x960` / `bash scripts/kit/queue/remotion_still.sh <Comp> <frame> <abs out.png>` | `scripts/kit/queue/` |
| clearance (clipping) checker | before ANY render of a new or changed shot | `bash scripts/kit/qa/clearance/run.sh --film <name> [--seg D]` | `scripts/kit/qa/clearance/` |
| shimmer test | a picture that crawls / sparkles when the camera moves | `python3 scripts/kit/qa/shimmer/shimmer.py run <entry.ts> <abs out dir> --frame F` | `scripts/kit/qa/shimmer/` |
| type check | after every edit | `bash scripts/kit/tsc.sh --film <name>` (`--kit` = only src/kit) | below |
| the cut | the whole film at 540 x 960 with sound, locally, before the farm | `bash scripts/kit/cut/make_cut.sh --film <name> --bg --freeze` (`--status` first) | `scripts/kit/cut/` |
| sound | mix, verify, measure clips, mux the mix onto a picture | `bash scripts/kit/sound/mux.sh <picture.mp4> <mix_48k.wav> <out.mp4>` | `scripts/kit/sound/` |
| voice helpers | checking a narration | `python3 scripts/kit/voice/verify_narration.py <folder> [narr.wav] [timing.json]` | `scripts/kit/voice/` |
| second language | an English (or other) version on the same picture | `python3 scripts/kit/lang/fit_lang.py ...` (the recipe) | `scripts/kit/lang/` |
| covers | Douyin 4:3 / 3:4 covers, Shorts 9:16 and YouTube 16:9 thumbnails | `python3 scripts/kit/cover/cover.py <spec.json>` | `scripts/kit/cover/` |
| farm | the final 1080 x 1920 picture on GitHub runners | `bash scripts/kit/farm/new_farm.sh --film <name>` (writes files only) | `scripts/kit/farm/` |
| stable ink pass | the outline pass of every 3D film (no flicker) | `import { InkPass, noInkFallback } from "../../kit/fx/ink"` | `src/kit/fx/` |
| rim light, stability helpers | soft white rim on heads; AO / shadow / texture settings that hold still | `src/kit/fx/rim.ts`, `src/kit/fx/stable.ts` | `src/kit/fx/` |
| prop kit + period props | held / carried things, a horse | `src/kit/props/{kit,things,horse}.ts` | `src/kit/props/` |
| outdoor kit | building outdoor places | `src/kit/sets/okit.ts` | `src/kit/sets/` |
| wardrobe | Qin / Han robes, armour, hats, beards, a halberd for the rig's figures | `src/kit/acc/*.ts` | `src/kit/acc/` |
| film contract, input props, language switch | every film | `src/kit/film/{contract,env,lang}.ts` | `src/kit/film/` |

**The rig is not in the kit.** `src/videos/group/kit` (rig3d, toon, cast, overlay, rigacc) is the rig layer, owned by
another team: import it from there, never edit it (nor `vasa/`, `bt/`, `arthur/`, `scripts/rig3d/`, `scripts/arthur/`).
The kit itself imports `group/kit`, `bt/pbr`, `vasa/ink` and `arthur/sets/yard_paint`, read only.
Sets tied to Hongmen's story (`src/videos/hongmen/sets/{tent,outdoor,privy,night,card}.ts`) stay there; borrow them by
import, the way Hongmen borrows Arthur's yard.

## Starting a new film

1. Branch from the newest film branch (until the kit is merged into the trunk, that is the branch that carries
   `src/kit`). Copy a film folder's shape: `story.ts` (exports `FPS, W, H, TOTAL, SEGMENTS`), `shots/segX.ts` (each
   exports `SEG`), `world.ts` (the World: `src/kit/film/README.md` has the contract), `Film.tsx`, `preview/`.
2. Add `src/videos/<film>/kit.json` and `kit.world.ts` (copy Hongmen's; change names, paths and the segment list;
   put every output path under `/home/user/<film>_work/`). In `kit.world.ts` drop Hongmen's `seeds` and `rigNames`
   (they read Hongmen's seating and World internals) until the film has its own; `src/kit/film/README.md` has the
   minimal file.
3. Import the kit: ink pass, rim light, props, wardrobe, `env.ts` for input props, `lang.ts` for a second language.
   Give the World Hongmen's `aspect()` (the lens takes the drawing buffer's shape) so covers can be rendered at their
   own shape.
4. Check: `bash scripts/kit/tsc.sh --film <film>`, then `bash scripts/kit/qa/clearance/run.sh --film <film>`, then a
   few stills through the queue at 540 wide, the shimmer test on a moving shot.
5. Whole film locally: the cut needs four film files first (a picture entry, its post chain, `chain.sha` and a
   sound build: `scripts/kit/cut/README.md`, "What a NEW film must give the cut"). Then
   `bash scripts/kit/cut/make_cut.sh --film <film> --status`, then `--bg --freeze`.
6. Final render: `bash scripts/kit/farm/new_farm.sh --film <film>`, and with the owner's go-ahead push the
   `render-farm-<film>` branch; mux the sound locally.
7. Covers: a `scripts/<film>/cover/spec.json` (Hongmen's is the example) and `cover.py`.

## House rules

- Renders only through the queue (`scripts/kit/queue`), 540 x 960 unless 1080 is truly needed, few frames, long
  sequences in the background.
- No media in the repo (video, audio, pictures, fonts not already there; it is public). Outputs go under
  `/home/user/<film>_work/`. No keys or tokens anywhere.
- Never touch `render.json` or `blender.json` on a film branch; the farm branch is the only place render.json changes.
- No commit or push without the owner's go-ahead.

## Lessons from Hongmen (each one cost a re-render)

- **Clipping checker before render.** A robe swallowing a commode, a cup floating 8 cm over a table, a sword through a
  belt: all invisible in a few stills, all found per frame by the headless checker in about 2.5 minutes for the
  whole film, with no GPU and no queue. Run it before every render of a changed shot; `--seed` proves it catches
  the known faults.
- **Flicker-free ink pass.** The old screen-space outline popped dots and broke dashes when the camera moved. The kit's
  `InkPass` samples 8 sub-pixel offsets and keeps lines steady; props carry their own hull outline and stay out of
  the ink pass; AO, shadow boxes and textures need the settings in `fx/stable.ts`. Measure with the shimmer test, not
  by eye.
- **Lens aspect for covers.** Render cover stills at the cover's shape; the lens follows the drawing buffer, so 4:3
  shows more of the set instead of a squashed 9:16 frame.
- **Never stretch covers.** `cover.py` refuses any non-uniform resize.
- **Fair render queue.** One render at a time, shortest first with aging, classes for the cut; nobody waits behind a
  1080 sheet, nobody starves.
- **Farm render + local mux.** The farm renders the muted 1080 picture in 20 chunks (about 25 min); the sound is
  mixed and muxed locally in seconds (`mux.sh` refuses a length mismatch). The local cut at 540 is for checking.
- **English version pipeline.** Same picture, `lang: "en"`; script per original caption group, voice farm with word
  times, `fit_lang.py` tempo-fits each group to its window, captions generated, own mix, farm with
  `--props={"lang":"en"}`, English cover. Without the prop the original renders exactly as before.
