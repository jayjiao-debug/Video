# Skills audit (2026-10-21, branch `claude/lean-skills`)

Goal: one place for each rule, no contradictions, nothing that only mattered for one scene.

## The new shape

| Where | What it holds | Who reads it |
|---|---|---|
| `skills/production-crew/SKILL.md` | the order of work, gates, files, roles (was 120 lines of mixed rules) | producer |
| `skills/production-crew/references/house-rules.md` | **new:** the owner's taste as 75 general rules in 11 stage sections, each with the episode it came from | every role reads its sections |
| `skills/production-crew/references/sources.md` | **new:** the facts and sources rules (were in 4 files) | researcher, screenwriter, reviewer |
| `skills/production-crew/references/figure-rules.md` | bodies and contact, now including contact poses (push) and rule R9 | animator, art director |
| `skills/video-engine-v1/` | build, render, finish only (story and taste moved out) | animator |
| `skills/video-engine-v1/references/render.md` | **new:** farm routing (was half of the engine SKILL.md) | animator |
| `skills/video-reviewer/references/owner-notes.md` | unchanged rows, now labelled the raw log behind house-rules | when a rule needs its origin |
| `archive/` | the legacy explainer-video skill and the 2026-10-06 handoff | nobody, by default |
| `plugin-updates/` | corrected copies of the installed plugin skills (see below) | you, to re-install |

Agents now read their house-rules sections instead of every owner-notes row (~100 rows, many with one-scene
detail).

## Contradictions found, and which side now stands

| Topic | Said in one place | Said in another | Now |
|---|---|---|---|
| Film length | 80–100 s (brief template, screenwriter) | 100–130 s (crew plugin) · ≈2:10 (engine) · ~2:00 (owner, ep14, ep35) | story-led, ~2:00 (range ~1:40–2:10) |
| Opening | "concrete number in the first 8 s" · "cold open slow, ≈16 beats, asks the question" | owner: frame 0 is half the answer, contradiction by 3 s, never ask the question | owner's opening formula (house-rules §3) |
| Subtitles | 56 px serif with gold glow (engine) · 62 px (plugin) · dark strip (ep14 v15) | sans 64 px, no box, soft edge + feathered shade (ep28, latest) | latest (house-rules §7.1) |
| Label sizes | ≥ 18 px text, ≥ 60 px numbers (qa-lessons) | labels ≥ 56 px, numbers 96–160 px (pond) | owner's sizes |
| Line length | ≤ 22 字 (explainer, pacing) | ≤ 16 字 (crew, Netflix SC) | ≤ 16 字 |
| Sound effects | "music only, no sound effects" (engine) · rubric 5 = whooshes, impacts, ambience | owner: minimal SFX only for phone films, no whooshes | off by default; minimal set when the world needs it; rubric rewritten |
| Film grain | part of the engine (crew plugin) | owner: no film grain | no grain |
| Revision rounds | ≤ 3 (crew) | ≤ 2 (plugin) | 2, then escalate |
| Posting package | covers + posting copy every round (engine delivery) | only after the owner says final (douyin-publish) | only after final |
| Hashtags | `#vibe知识大赏 #<主题> #心理学 #冷知识` (delivery.md) | three fixed tags (douyin-publish) | douyin-publish |
| Cover gold text | gold gradient `cv-gold` (douyin-publish) | gradient text vanishes in headless renders (qa-lessons) | solid gold + glow |
| Paths | `/home/claude/diji/...` (crew, reviewer, handoff) | episodes are in this repo's `episodes/` | repo paths; `new_episode.py` defaults to `episodes/` |
| Workflow skills | explainer-video (9-beat, `episode.yaml`) | production-crew (`episodes/<NN>/`) | production-crew; explainer-video archived |

## Open questions for you (I didn't decide these)

1. **Music processing.** You said (ep14): one untouched track from 0:00, no loops, cuts, crossfades or loudnorm,
   only a fade over the last bar. But `finish.py` and `upload_master.py` still loudnorm the music to −14 LUFS, the
   pacing plugin tells agents to cut whole bars, and ep35 started the track at 29.5 s. Which is the rule now:
   untouched track, or entry point + loudness normalising allowed?
2. **Waiting time.** The pace check targets ≤ 12 % waiting; on ep14 you preferred ~2:00 with ~20 % waiting so
   the picture can land. The rules now say "≤ 12 %, up to ~20 % only where the picture carries it". OK?
3. **Which file goes to Douyin.** One note says deliver one file ≤ 28 MB (~2 Mbps); the HD-delivery skill says
   upload the master, not the 发送版; `upload_master.py` makes a 12 Mbps file. The rules now say: 发送版 for
   review, master for upload. Correct?

## Still missing in code (rules that point at tools that aren't here)

- The pond-episode figure rig (`<Person>`, `seatOn`, `ikArm`) and `pose_check.mjs` are imported by
  `episodes/22–26` but not committed. The ep35 push solver is only in `episodes/35-sisyphus/build/`. Both should
  move into one shared engine folder.
- `beatlock.py` / `stillness.py` (edit-rhythm) and the `pipeline.pace` module (pacing) exist only on branch
  `claude/hopeful-curie-hm3mlq`. A reading-pace check does exist here: `video-reviewer/scripts/pace.py`.
- The ？-centring rule should live in one shared subtitle component; today each episode kit has its own.
- Motion checks (planted contacts, speed jumps, onion-skin sheets) are not built yet.
- The ep35 `Grade` (and likely earlier kits) still draws animated film grain, against house-rules §4.9. The
  style-test looks turn it off; the shared engine `Grade` should drop it.
- `video-engine-v1/templates/ui.tsx` still draws 56 px serif subtitles, and `cloud_render.py` defaults
  `VE_PROJECT` to `/home/claude/diji`. Copy the latest episode kit instead of the template, and always set
  `VE_PROJECT`.

## Installed plugin skills (outside this repo)

These load from your claude.ai plugins, not from the repo, so the branch can't change them. Corrected copies are
in `plugin-updates/`; re-install from there:

| Plugin skill | Problem | Action |
|---|---|---|
| juno-crew-workflow | a second copy of the workflow with its own numbers (100–130 s, grain, ep11 music recipe) | replace with the short pointer in `plugin-updates/` |
| video-engine-v1 | a second copy of the engine skill (≈2:10, no SFX, slow cold open) | uninstall; the repo copy loads when the repo is attached |
| pacing | points at the explainer pipeline; tells agents to cut music bars | replace |
| edit-rhythm | good rules; its checks only exist on another branch; listed a cold-open freeze and flashes as hits | replace (says where the checks are; hit list matches house-rules) |
| overnight-batch | read owner-notes rows | replace (reads house-rules) |
| douyin-publish | explainer cover paths, a `juno-brand` skill that doesn't exist, gradient gold | replace |
| github-hd-delivery | fine | keep |

## What was removed from the active skills

Nothing the owner said was deleted: every quote stays in `owner-notes.md`. What left the active skills:
episode-specific numbers (bar grids, keys, entry points, pixel offsets, the ep11 music recipe, Modal benchmark
dates), duplicated sections (sources rules ×4, engine-vs-look ×3, the workflow ×3), and rules overruled by a later
owner note (listed in the table above).

## Added 2026-10-21 (visual quality)

- house-rules §4.17–23: hero frame first, references not adjectives, squint test, composition, depth layers,
  palette with a job, finish layer without grain; §6.10 one image-to-image transformation per film.
- `video-reviewer/scripts/look_check.py`: brightness, squint spread (calibrated on ep35: 0:19 = 114 reads,
  0:22 = 65 flat), subject numbers, greyscale + 3-tone views and a phone-size sheet. Wired into the art director
  (before handing in looks), the director (gate 2a) and the reviewer.
- `references/taste/`: the taste board, started with the ep35 push before/after.
- Storyboard template: layers, light and camera height per scene.
- Style test of the ep35 0:22 shot: `episodes/35-sisyphus/style/022/`.
