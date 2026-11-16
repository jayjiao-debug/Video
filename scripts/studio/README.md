# studio/: the Mac mini studio

One folder and one command on the Mac mini for everything heavy: render, voice, sound, the delivery gate and the
hand-over. The cloud threads write code and push commits; the Mac makes the film from a commit. Built from items 1 to
5 and 12 of the November 2026 pipeline review. Nothing here writes into the repo, and no media or keys are ever in it.

## Setup (once)

```bash
mkdir -p ~/Claude/studio && git clone --depth 1 -b claude/pipeline-tools https://github.com/jayjiao-debug/video ~/Claude/studio/tools
bash ~/Claude/studio/tools/scripts/studio/studio setup
```

Setup makes `~/Claude/studio/{repo,work,library,voice,logs,bin}` and `~/Claude/films`, finds or installs node (the
portable one in `~/Claude/libai-render-test` is used if present), ffmpeg and ffprobe (Homebrew, or a static build in
`~/Claude/studio/bin`), a Python venv `~/Claude/studio/py` (numpy, scipy, pillow, soundfile, requests,
faster-whisper), and an empty film checkout that fetches one commit at a time. `~/Claude/studio/studio` is then the
command. `studio update` pulls new tools.

The ElevenLabs key, once, by the owner (it asks for the key and shows nothing; it lives only in the Mac's keychain):

```bash
security add-generic-password -U -a "$USER" -s elevenlabs -w
```

## The one command

```bash
~/Claude/studio/studio film newton --ref claude/newton-day          # the next version number, Chinese
~/Claude/studio/studio film newton --ref 1a2b3c4 --version v7 --lang en
```

Steps, each with a clock-time estimate from its last run, all logged to `work/<film>/versions/<v>/log.txt`:

1. **fetch** the commit into `~/Claude/studio/repo` (detached; `npm ci` only when the lock file changed)
2. **render** the 1080 x 1920 picture, muted (`npx remotion render ... --gl=angle --concurrency=50% --crf=16`, about
   3 minutes for a 3-minute film)
3. **sound**: the film's own sound build (its config), with the voice from `work/<film>/voice/` and the clips folder
   `work/<film>/sound/clips/` (every approved library sound is linked in by name); then the stems for the gate
4. **mux** (fails if picture and sound differ by more than a frame), a **phone copy** (1080, small), a 540 **watch
   copy** and a **contact sheet**
5. **the gate** (below). A FAIL stops here.
6. **deliver** to `~/Claude/films/<film>/<version>/`

Useful flags: `--frames 0-299` (a test range), `--mix file.wav` (a ready mix instead of the build), `--skip
render,sound,stems,gate,deliver`, `--accept "why"` (deliver despite a FAIL; the reason is written into the delivery),
`--reveal` (show it in Finder). One studio job runs at a time (`logs/studio.lock`). `studio status` shows what was made.

## Voice, sound effects and music on the Mac (item 2)

```bash
~/Claude/studio/studio voice request.json --film newton     # or: ... voice - < request.json
~/Claude/studio/studio voice request.json --dry-run         # check it and count the billed characters, no call
```

The request is exactly the voice-farm format (`tts`, `dialogue`, `sfx`, `music`, `voices`, `upload`, `transcribe`
items; `voice/speak.py` is the farm's script with a local output folder). Clips, `report.json` (with Whisper's
transcript and word times) and `run.txt` land in `~/Claude/studio/voice/<id>/`, linked into
`work/<film>/voice/takes/<id>`. The report also says how many credits the request used and how many are left. No
GitHub, no public branch, no approval stop. A cloud thread hands a request over in its Remote Control brief (paste
the JSON) or in its commit; the summary table comes back in the session's reply.

## Delivery (item 3)

`~/Claude/films/<film>/<version>/`: `<film>_<v>_hd.mp4` (the master), `<film>_<v>_phone.mp4`, `<film>_<v>_sheet.jpg`,
`review/` (the gate report and its sheets, the masked watch copy, what changed), `sound/` (the sound page, when made),
`delivery.json`. `~/Claude/films/<film>/versions.md` lists every delivery with its commit; `latest` points at the
newest. AirDrop from Finder for now. For a synced folder later, set one line in the shell profile:
`export STUDIO_DELIVER="$HOME/Library/Mobile Documents/com~apple~CloudDocs/Films"`.

## The delivery gate (item 4)

`studio gate <film> --version v7` (the film command runs it). Checks: **clipping** (the kit's clearance checker),
**overlays** (cards against in-world signs and each other; a sheet of what each card covers), **text** (time on
screen against reading time), **sound** (length, loudness, true peak, clicks, holes, line edges, voice over the rest,
loops, low thump), **ground** (pixels that pop and come back: a jiggling ground, crawling outline or sparkle), **mask**
(the phone mask over a sheet and a masked watch copy), **changes** (every second that changed since the last version,
with before / after frames). Output: `gate/gate.md` with the review checklist at the end, `gate/gate.json`, the
evidence images. The gate records the master's hash; `deliver` refuses a master that changed after its gate, so any
change after the gate runs it again. Thresholds are in `gate/gate.py RULES`, overridable per film.

Overlays against in-world signs need the film to say where its signs are: a `gate.export` command in the film config
that writes the timeline JSON described in `gate/timeline.py`. Without it the gate reads captions, cards and scenes
from the film's generated `captions.ts` / `voice.ts` and the sheet `under_cards.jpg` is for the eye.

## Sound library and sound page (item 12)

`studio library add <file> --name knock_wood_2 --cat knock --approved "owner, 16 Nov" [--loop]`, `studio library
list`, `studio library page` (a page with a play button per sound). Files in `~/Claude/studio/library/`, never in the
repo. One-shots are never looped; only beds carry `--loop`. `studio soundpage <film> --version v3 --deliver` writes a
page with the mix, each layer alone and the mix without each layer, into the delivery's `sound/` folder.

## A film's config

`films/<film>.json` here, or `src/videos/<film>/studio.json` in the film's own commit (that one wins):

```json
{ "film": "newton", "composition": "NewtonFilm",
  "render": {"crf": 16, "gl": "angle", "concurrency": "50%"},
  "langs": {"zh": {}, "en": {"props": {"lang": "en"}}},
  "voice": {"build": "optional: a command that assembles the voice track before the sound build"},
  "sound": {"build": "python3 scripts/newton/sound/build.py --voice {VOICE}/voice_48k.wav --clips {CLIPS} --out {MIX}",
            "stems": "... --only {GROUP} --nosafety --out {STEM}", "groups": ["voice", "music", "amb", "sfx"]},
  "gate": {"export": "optional: a command that writes {GATE_JSON}", "rules": {"flicker_look": 1.5}} }
```

Placeholders: `{REPO}` the checkout, `{WORK}` `~/Claude/studio/work/<film>`, `{VOICE}` its `voice/`, `{CLIPS}`,
`{MIX}` the version's `mix_48k.wav`, `{VER}` the version folder, `{LANG}`, `{LIB}`, `{STEM}` / `{GROUP}` for stems.
The film's sound scripts run with the studio's python (numpy, scipy) and ffmpeg on PATH.
