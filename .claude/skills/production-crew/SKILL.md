---
name: production-crew
description: Run a Juno / VIBE知识大赏 episode end to end with a crew of role agents and three owner gates — brief, research, script, looks, storyboard, build, QA, delivery — with the main agent as producer. Use for every new episode and for any request to run, change or explain the production workflow.
---

# Production crew

This skill is the order of work. The owner's taste lives in `references/house-rules.md`; how to build and render
lives in the `video-engine-v1` skill; how to review lives in the `video-reviewer` skill. Don't copy rules between
them: point to the one place a rule lives.

Each role sees only what its job needs, nobody grades their own work, and cheap decisions are approved before
expensive work starts.

## Flow

```
P   brief.md (with the owner)                                 new_episode.py
R   facts.md                                                  ~20 min
S   script.md + lines.json                                    ~40 min, ≤ 2 rounds
    GATE 1  director + cold-reader in parallel
            OWNER: picks the title, OKs the lines             ◀ touchpoint 1
A   2–3 looks, 2 style frames each (hook + key visual)        start while gate 1 waits
    GATE 2a director ranks (buildable? readable on a phone?) + cold-reader 5-second reads
            OWNER: picks one look, shown with a phone mock    ◀ touchpoint 2
            and the music map (where the title lands)
A   storyboard.md for the chosen look  → GATE 2b director
N   build scene by scene, stills per scene → GATE 3 director  ~45 min
    render → automatic QA → video-reviewer → director (GATE 4)
            OWNER: watches on a phone, with sound             ◀ touchpoint 3
P   owner notes → raw log + house-rules → the owning role
P   owner says final → douyin-publish, github-hd-delivery
```

Target ≈ 3 h of crew time per episode. Gate 2a is where hook strength, frame size and title-on-drop get
decided, so they don't come back after the render.

## Files (the contract between roles)

Each episode lives in `episodes/<NN-slug>/` in this repo; create it with
`python3 .claude/skills/production-crew/scripts/new_episode.py <NN-slug> "<working title>"`.

| File | Written by | Read by |
|---|---|---|
| `brief.md` | producer (with owner) | everyone |
| `facts.md` | researcher | screenwriter, director, reviewer |
| `script.md`, `lines.json` | screenwriter | director, cold-reader (lines only), art director, animator |
| `looks.md`, `style/*.png` | art director | director, cold-reader (frames only), owner |
| `storyboard.md` | art director | director, animator |
| `notes_gate<N>_r<k>.md` | director | the roles the notes are routed to |
| `coldread_*.json` | cold-reader | director, screenwriter / art director |
| `crew_log.md` | producer | owner (what happened, when, how long, decisions taken alone) |

Shared references (`references/`): `house-rules.md` (owner's taste, by stage), `rubric.md` (scoring),
`sources.md` (facts rules), `figure-rules.md` (bodies and contact), `looks.md` (looks used and their numbers).

## Producer (the main agent)

- Write `brief.md` with the owner (template). If the owner says "自由发挥", choose and say so.
- Launch roles with the Agent tool (`researcher`, `screenwriter`, `art-director`, `director`, `cold-reader`,
  `video-reviewer`, `music-specialist`). Give each the episode folder and exactly the files it needs. Launch
  independent roles in the same turn; never wait idle on the owner.
- **Gates:** director APPROVE → move on. REVISE → send the routed notes back; **at most 2 rounds per gate**, then
  ESCALATE to the owner with the options.
- **Owner away:** take the director's top title / top look, write the decision in `crew_log.md`, continue. A
  decision that can't be undone (publishing, deleting) waits for the owner.
- **Fixing an owner note:** change that one thing, send the corrected still of exactly that shot, and wait for
  an OK before re-rendering anything (house-rules §11).
- **Owner notes:** add the owner's words to `video-reviewer/references/owner-notes.md`, then update the matching
  rule in `house-rules.md` (edit, don't append a near-duplicate), then route to the role.
- **After the owner picks a look:** add a row to `references/looks.md`; ~48 h after publishing, fill in its
  2s跳出, 5s完播, 分享率 and plays.
- **Log** every hand-off in `crew_log.md` with the time, so we can see where the time goes.
- One fresh session per episode; the files carry the memory.

## Roles (each agent file says what it reads)

| Role | Makes | Checks itself against |
|---|---|---|
| Researcher | `facts.md` + "Story-worthy" + "Risks" | `sources.md` |
| Screenwriter | `script.md`, `lines.json`, 3 titles | house-rules §1–3, §9; pace.py |
| Art director | looks, style frames, `storyboard.md` | house-rules §3–7 |
| Animator (producer for now) | scenes, stills | video-engine-v1, `figure-rules.md`, house-rules §5–7 |
| Music specialist | `music_review.md` | house-rules §8 |
| Director | gate notes: APPROVE / REVISE / ESCALATE | brief, `rubric.md`, all of house-rules |
| Cold reader | first-time-viewer reads | only what a viewer sees |
| Video reviewer | `REVIEW.md` before any cut is called final | video-reviewer skill |

## Two layers: reuse the engine, never the look

- **Engine (reuse, copy from the latest kit):** subtitle component (reading timing, ？-centring), beat grid and
  cut timing, title on the hardest drop, transitions without CSS 3D, phone framing, corner mark, Juno end card,
  QA and pose/contact checks.
- **Look (new every episode):** palette, central metaphor and props, layout, motifs.

## Measuring whether the crew helps

Per episode in `crew_log.md`: total time, time per stage, director rounds per gate, owner rounds after gate 4,
the owner's 1–5 rating, and later the Douyin numbers in `looks.md`.
