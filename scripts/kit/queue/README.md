# queue/: the machine-wide render queue (one render at a time, shortest first)

Parallel renders crash this machine, and many people render at once. EVERY render goes through `q.sh`.

```bash
bash scripts/kit/queue/still.sh <preview entry.ts> <out.png | out dir> [render.mjs options]     # the three.js harness
bash scripts/kit/queue/still.sh src/videos/hongmen/preview/film.ts /home/user/hm_work/x/pick --pick 200,600 --size 540x960
bash scripts/kit/queue/remotion_still.sh <Composition> <frame> <out.png> [remotion flags]       # a real film frame (~30 s)
bash scripts/kit/queue/remotion_still.sh HongmenFilm 600 /home/user/hm_work/x/en600.png --props='{"lang":"en"}'
bash scripts/kit/queue/q.sh <cost in 0.1 s> <any command>                                       # anything else that renders
```

The old names `/home/user/hm_tools/{q,still,remotion_still}.sh` are two-line wrappers around these (same queue, same
lock). The scripts find the repo from their own location; relative paths are taken from the repo root, so give
absolute out paths (and never write pictures into the repo).

**How it orders jobs.** Each job writes `<cost> <start time> <kind>` into `/tmp/hm_render.q/<pid>`; the first one takes
`/tmp/hm_render.lock` (flock) and runs. Served by CLASS, then shortest first inside a class; every second of waiting
takes 0.2 s off a job's cost, so a long job is delayed, never starved. Kinds: `cut` (the cut's chunks: the command
mentions film_cut / cut_overlay / ovonly, or `HM_RENDER_KIND=cut`), `low` (`/flick/` paths or a stated cost of 60 s or
more), `norm` (everything else). `/tmp/hm_render.policy` holds one word: `anim-first` (default: norm, cut, low) or
`cut-first` (cut, norm, low). `HM_RENDER_COST` / `HM_RENDER_KIND` override a job's estimate.
still.sh's estimate: 10 s + frames x 1.4 s at 540 wide (x 6 s at 1080); film segment previews count half.

**Rules.** Render at 540 x 960 unless you truly need 1080; never more frames than you will look at; start long
sequences (more than ~40 frames) in the background. `KIT_CHROME` sets the headless Chromium for remotion_still.sh.
