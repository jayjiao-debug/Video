# The cut: a whole film rendered on this machine (no farm)

Any film with a `kit.json` (`src/kit/film/README.md`): `bash scripts/kit/cut/make_cut.sh --film <name> ...` (or
`--config <kit.json>`). What the config gives the cut: `composition`, `dir`, `entries.pic` (the harness entry that draws
the film's picture with its post chain), `entries.overlay` (Film.tsx), `entries.segFile` (`shots/seg{SEG}`: how the
entries import a segment), `domOnly` (folders that are DOM only and never touch the picture), `chainSha`, `cut.dir`,
`cut.name`, `cut.freeze` (what `--freeze` copies), `sound.build` / `sound.mux` / `sound.clips`. The frame count, fps
and segments are read from story.ts. `scripts/hongmen/cut/make_cut.sh` is the old command (= `--film hongmen`).
`--adopt <old deps.json>`: after a move of source files that draws the same (prove it with stills first), the frames
made from the old hashes count as current; the manifest is rewritten (a copy is kept), nothing is rendered.

## What a NEW film must give the cut

Copy each from Hongmen and change the film-specific parts:

1. **The picture entry** `preview/film_cut.ts` (kit.json `entries.pic`): imports the ink pass from the SAME module
   that `Film.tsx` imports it from, imports every `shots/segX.ts` as `SEG`, and calls `runCut({ InkPass,
   noInkFallback }, [A, B, ...])`. The segment imports must follow `entries.segFile` (`shots/seg{SEG}`): the cut
   replaces the other segments with an empty stub to render one segment at a time.
2. **The post chain without React** `preview/film_cut_core.ts` (`entries.picCore`): the same World, Director and post
   passes as `Film.tsx`, ported by hand. Start from Hongmen's and change the World import and the passes.
3. **Two marker comments in `Film.tsx`** (Hongmen and Arthur have both): a `// ---- post defaults` rule at the start of
   the post section, and a comment containing `first frame of the page` after it. `deps.mjs` hashes the text between
   them. Then write the first `chain.sha` (kit.json `chainSha`, e.g. `scripts/<film>/cut/chain.sha`):
   `KIT_CONFIG=src/videos/<film>/kit.json node scripts/kit/cut/deps.mjs /tmp/d.json` and copy `chain.sha` out of
   `/tmp/d.json`. Without the markers, or with a stale value, the cut still renders but every run logs a WARNING.
4. **A sound build** (kit.json `sound.build`): a bash script that the cut runs from the repo root with `NAME=mix_cut`,
   `WORK=<cut.dir>/sound` and `CLIPS=<sound.clips>` in its environment. It must write `$WORK/mix_cut_48k.wav`, exactly
   the film's length. Hongmen's is `scripts/hongmen/sound/build.sh`. A film with no sound yet: `--no-sound`.
5. **`cut.dir`** outside the repo (`/home/user/<film>_work/final`), **`cut.name`**, and **`cut.freeze`** (`src`,
   `scripts/kit`, and the film's own `scripts/<film>` folder if it has one).

Then: `bash scripts/kit/cut/make_cut.sh --film <film> --status` (renders nothing), then a short range
(`--bg --from 0 --to 29`), then the whole film with `--bg --freeze`.

## Hongmen

`/home/user/hm_work/final/hongmen_cut.mp4`: 540 x 960, 30 fps, every frame of the film (2092), H.264 yuv420p
crf 18 +faststart, BT.709 tags, with the sound mix. Three layers, each resumable:

| layer | what draws it | lock | speed (measured, see `/home/user/hm_notes/x_cut.md`) |
|---|---|---|---|
| `pic` the 3D picture with the film's post chain | the preview harness, entry `src/videos/hongmen/preview/film_cut.ts` (`film_cut_core.ts`: the same World, Director and post chain as `Film.tsx`, no React) | `scripts/kit/queue/still.sh`, jobs of at most ~90 s | 2.0 to 2.4 s a frame in a chunk (draw 1.6 to 1.9 s in the privy, 2.4 to 3.1 s in the tent on a busy machine) + about 16 s per job |
| `ov` HUD, `Pose.overlays`, caption, `Pose.top` as transparent PNGs | Remotion with the input prop `ovonly` (the world is posed every frame, nothing is drawn in 3D), from a bundle made once per source state | `scripts/kit/queue/q.sh`, jobs of at most ~60 s | 0.11 to 0.15 s a frame + 19 s per job (118 frames: 33 s) |
| sound | `scripts/hongmen/sound/build.sh` (rebuilt right before the mux, into the cut's own folder) + `scripts/kit/sound/mux.sh` | none | 20 s |

ffmpeg lays `ov` over `pic` (straight alpha, in RGB), encodes, and the sound engineer's `mux.sh` puts the mix on
(no padding, no trimming; it fails if picture and sound differ in length).

EVERY locked job goes through the machine-wide render queue `scripts/kit/queue/q.sh` (shortest first with aging;
the first in line takes `/tmp/hm_render.lock`): the picture chunks through `still.sh`, the overlay chunks as
`q.sh <cost> npx remotion render ...`. Never a raw `flock`: that jumps the queue. Each job states its true cost
(tenths of a second); an `HM_RENDER_COST` set in the environment of `make_cut.sh` is passed on to every job as it is
(`HM_RENDER_COST=150 bash make_cut.sh --bg ...`). Every job is queue class "cut" (`HM_RENDER_KIND=cut`): the
director's policy file `/tmp/hm_render.policy` (`anim-first` | `cut-first`) decides whether the cut's jobs run before
or after everybody else's.

## Commands (from anywhere)

```bash
C="/home/user/jayjiao-debug/video/scripts/kit/cut/make_cut.sh --film hongmen"
bash $C --bg --freeze --jobs 4        # THE WHOLE FILM in the background, from a frozen copy of the sources
tail -f /home/user/hm_work/final/log/cut.log        # progress (one line per chunk, frames left)
cat /home/user/hm_work/final/log/cut.done           # appears when it ends: 0 = hongmen_cut.mp4 is written
bash $C --frozen --status             # what is current / stale / missing against the frozen copy; renders nothing (4 s)
bash $C --status                      # the same against the live tree
bash $C --stop                        # stop the background run (frames made so far are kept)
bash $C --bg --frozen --jobs 4        # go on after a stop, from the SAME frozen copy

bash $C --bg                          # the whole film from the LIVE tree (chunks whose sources change while they wait
                                      # or render are kept as stale frames and come round again, up to --passes 4)
bash $C --bg --from 0 --to 117        # a range -> hongmen_cut_0-117.mp4 (with its piece of the sound)
bash $C --bg --from 0 --to 117 --force            # render that range again whatever the manifest says
bash $C --bg --only ov                # only the overlay layer (HUD / tags / captions changed)
bash $C --bg --only pic               # only the picture layer
bash $C --bg --only compose,sound,mux # no rendering: lay the layers together, rebuild the mix, mux (2 min)
bash $C --bg --only sound,mux         # only the sound again (a cue moved): rebuild the mix, mux onto the silent picture
bash $C --bg --no-sound               # silent picture only (hongmen_cut_silent.mp4)
bash $C --bg --passes 1               # one round only, then compose whatever there is
bash $C --bg --size 1080x1920         # the picture at film size, averaged down by ffmpeg: the film's own sampling,
                                      # smoother lines; about 3.5x the time
```

Options that go with any of them:

- `--freeze`: first copy kit.json `cut.freeze` (Hongmen: `src/`, `scripts/hongmen/`, `scripts/kit/`) to `/home/user/hm_work/final/snap` (node_modules and public are
  links) and read the film from that copy (the driver stays this folder's; `HM_CUT_REPO` names the tree): picture, overlays and the sound's beats all show ONE state of the film,
  however long the render takes and whoever saves a file meanwhile. The copy is checked (it must build; otherwise it is
  taken again 15 s later). The manifest's hashes are the same for the same file contents, live or frozen: freezing
  again later re-renders only the segments that changed. `--frozen` = go on from the copy that is there.
- `--jobs N` (default 2): picture chunks that wait in the render queue at the same time. Every chunk is its own job of
  at most ~90 s under the lock and the queue (`scripts/kit/queue/still.sh`: shortest first, waiting counts) decides
  who goes next, so other people's jobs get in between. On a busy night a job of any size waits many minutes; N
  chunks waiting together divide the film's waiting time by N.
- `--priority`: the picture chunks enter the queue with cost 0 instead of their real cost (the same as
  `HM_RENDER_COST=0` for the picture only). It passes jobs that arrived recently, not jobs that have waited longer.
- `--lens auto|on` (default `on`): `auto` = a frame without depth of field (`Pose.post.dof` unset: every frame
  of the film tonight) skips the two lens-blur passes, which only copy their input there. It saves 0.5 to 0.8 s a
  frame. LENS-AUTO-STATUS: the pixel check is pending; see `/home/user/hm_notes/x_cut.md` section 3.
- `--ink-samples 4`: the outline pass with 4 sub-pixel buffers instead of the film's 8 (saves 0.6 to 1 s a frame,
  edges crawl a little more). Frames made with another value count as made from other sources.

`--bg` is needed for anything real: shell commands here are cut off after about 120 s. Only one `make_cut.sh` runs
at a time (a second one says so and exits).

It is safe to start the full run while segments are still changing. Start it AGAIN when they are done (`--freeze`
again): only the chunks whose sources changed are rendered again, then it composes and muxes again.

## What decides what is rendered again (the manifest)

`/home/user/hm_work/final/manifest.json`. For every layer it records which frames exist and from WHICH SOURCES they
were made (`done`: source key -> frames), plus the last render of every chunk (`chunks`: hash, frames, seconds).

The source key of a frame = the hash of its SEGMENT's sources for that layer + the layer's settings (entry and size
for `pic`, props and scale for `ov`). The hash comes from `deps.mjs`, which asks esbuild for the import graph:

- `pic.<seg>`: every file the picture entry imports with the OTHER four segments left out (so: `shots/seg<X>*.ts`
  and whatever they import, `world.ts`, `story.ts`, `beats.ts`, `captions.ts`, `voice.ts`, `layout.ts`, `people.ts`,
  `acc/*`, `sets/*`, `props/*`, `fx/*`, `env.ts`, `lang.ts`, `preview/film_cut*.ts`, and the kits under `group/`,
  `vasa/`, `bt/`, `arthur/`), minus `src/videos/hongmen/hud/`.
- `ov.<seg>`: the same graph from `Film.tsx` (so also `hud/`, `captions.ts`, `lang.ts`, `Film.tsx`), plus
  `src/Root.tsx` and `src/index.ts`.

So: an edit in `shots/segB.ts`, `segB_ov.ts` or `segB_face.ts` re-renders segment B only (both layers); an edit in
`world.ts`, `people.ts`, a set, an accessory or the rig re-renders everything; an edit in `hud/` or `Film.tsx`
re-renders the overlays only (19 s + 0.11 s a frame); notes, other people's previews and files nobody imports never
count; a NEW file counts from the moment something imports it. `node_modules` is not hashed.

A frame is rendered when its file is missing or its recorded key is not the current one. Chunks never cross a
segment; a chunk's hash is taken before it queues and again after it rendered: if the sources changed in between,
the frames are KEPT but recorded as stale (key `changed-while-rendering|...`; a cut can still be composed from them if
time runs out) and the chunk comes round again (up to `--passes`, default 4). From a frozen copy this cannot happen. The overlay frames are recorded with
the hashes of the BUNDLE they came from. If a source file does not build (somebody is mid-edit), the run waits for it
(`--wait-broken`, default 20 min per pass) instead of failing chunk by chunk.

If frames are still stale when the passes are used up, the mp4 is composed anyway from the newest frames there are,
with a WARNING in the log and the stale ranges in `hongmen_cut.report.json`; if frames are missing, nothing is
composed and the exit code is 1. Run the same command again.

## Keeping the picture entry in step with Film.tsx

`preview/film_cut_core.ts` rebuilds the post section of `Film.tsx` by hand (the passes, their grouping, the per-frame
values). Two guards:

- **the ink pass**: `deps.mjs` reads which module `Film.tsx` imports `InkPass` / `noInkFallback` from. If
  `preview/film_cut.ts` imports another one, the cut renders through a generated copy of the entry with Film.tsx's
  import lines (`/home/user/hm_work/final/build/entry/film_cut_ink.ts`) and says so in the log.
- **everything else in the chain**: `chain.sha` holds the hash of Film.tsx's post section (from the `post defaults`
  rule to the comment that starts `first frame of the page` (just before `FirstKick`), comments and blank lines dropped) as it was when `film_cut_core.ts` was last
  compared with it. When it differs the log prints a WARNING. Then: port the change into `film_cut_core.ts`, run
  `KIT_CONFIG=src/videos/hongmen/kit.json node scripts/kit/cut/deps.mjs /tmp/d.json`, and put the new `chain.sha` value (in `/tmp/d.json`, `chain.sha`)
  into `scripts/hongmen/cut/chain.sha`.

## Checking a frame against the real film

```bash
bash scripts/kit/queue/remotion_still.sh HongmenFilm 100 /home/user/hm_work/final/ref/r0100.png        # the real frame (40 s)
python3 scripts/kit/cut/compare.py 100 /home/user/hm_work/final/ref/r0100.png                   # after the cut has that frame
```
Another film: `KIT_CONFIG=src/videos/<film>/kit.json python3 scripts/kit/cut/compare.py ...` (without it compare.py
reads Hongmen's cut folder; `HM_CUT_DIR=<cut.dir>` works too).
prints the mean absolute difference per channel for the picture, the overlays and their edges, the shift at which
the overlays fit best (0, 0 = same pixels), whether the layer is straight or premultiplied alpha, and writes
`/home/user/hm_work/final/compare/cmp_0100.png` (cut | still | difference x4).

## Files

| file | what |
|---|---|
| `make_cut.sh` | the command (background run, stop, pass-through of the options) |
| `cut.py` | the driver: plan, chunks, manifest, compose, sound, mux, report |
| `deps.mjs` | the source hashes per segment and layer (esbuild import graph), the film's length and segments, the ink and chain guards |
| `compare.py` | a cut frame against a Remotion still |
| `chain.sha` | the hash of Film.tsx's post section that `film_cut_core.ts` was written against |
| `src/videos/hongmen/preview/film_cut.ts`, `film_cut_core.ts` | the picture entry |
| `Film.tsx` / `env.ts` | the input prop `ovonly` (4 changed lines + 1 new; without the prop nothing changes) |

Outputs, all under `/home/user/hm_work/final/` (nothing is written into the repo):
`hongmen_cut.mp4`, `hongmen_cut_silent.mp4`, `hongmen_cut.report.json`, `frames/pic_540x960/f0000.png ..`,
`frames/ov/o0000.png ..`, `manifest.json`, `sound/mix_cut*` (the rebuilt mix; the sound engineer's own files under
`/home/user/hm_work/sound/` are not touched), `build/` (the Remotion bundle, deps.json, temporary chunks),
`log/cut.log`, `log/jobs.log` (every job's own output), `log/qa_figures.txt` (the harness's reach / clear lines).
