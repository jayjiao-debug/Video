# farm/: a film's render farm branch (GitHub Actions), and the local mux

The final 1080 x 1920 picture renders on GitHub's runners, in chunks, muted; the sound is put on locally. Each film
has its own branch `render-farm-<film>` = the film's branch + one workflow file + `render.json`. A push that changes
`render.json` starts a run: `plan` (chunks from render.json, `scripts/plan.mjs`) -> `render` (each chunk on its own
runner: `npx remotion render ... --gl=swangle --muted`) -> `combine` (ffmpeg concat without re-encoding, split into
95 MB parts, force-pushed as one commit to `render-output-<film>` with `result.json`). Hongmen's 2092 frames in 20
chunks took about 25 minutes.

`render-film.yml.tmpl` is Hongmen's workflow with `__FILM__` placeholders. It sits here, outside `.github/workflows`,
so it never runs by itself.

```bash
bash scripts/kit/farm/new_farm.sh --film <name> [--comp <Composition>] [--end <last frame>] [--chunks 20] [--out /tmp/kit_farm_<name>]
```

writes `<out>/.github/workflows/render-<name>.yml` and `<out>/render.json` (composition and length from the film's
kit.json and story.ts when it has them) and prints the git commands. It creates no branch and pushes nothing: the repo
is public and a push starts a render, so that step waits for the owner's go-ahead.

render.json: `{"id": "hongmen-en-02", "composition": "HongmenFilm", "start": 0, "end": 2091, "chunks": 20,
"concurrency": 1, "timeout": 900000, "output": "hongmen_en2", "flags": "--crf=14 --props={\"lang\":\"en\"}"}`.
A new render = a new `id` and `output` (and `flags` for another language), commit, push.

When the run is done:

```bash
git fetch origin render-output-<film> && git show origin/render-output-<film>:result.json
for p in $(git ls-tree --name-only origin/render-output-<film> | grep part); do git show origin/render-output-<film>:$p; done > /home/user/<film>_work/picture.mp4
bash scripts/kit/sound/mux.sh /home/user/<film>_work/picture.mp4 <the film's mix_48k.wav> /home/user/<film>_work/<film>_final_1080.mp4
```

Why farm + local mux: the farm has no sound pipeline and the mix changes more often than the picture; muxing locally
takes seconds and `mux.sh` refuses a picture and a sound of different lengths. For checking the whole film before the
farm, the local cut (`scripts/kit/cut`, 540 x 960) is enough.
