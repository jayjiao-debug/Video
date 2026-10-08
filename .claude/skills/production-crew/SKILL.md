---
name: production-crew
description: Make a Juno / VIBE知识大赏 episode with a crew of role agents and approval gates — researcher, screenwriter, art director, director (quality gate), cold reader — with the main agent as producer who briefs, routes notes, builds and renders. Use for every new episode and for any request to run, change or explain the production workflow.
---

# Production crew

One episode, made by roles that each see only what their job needs, with gates where work is approved before
the next (more expensive) step starts. Nobody grades their own work. The owner approves the cheap decisions
early (title + script) and watches the cut at the end.

```
Producer + owner: brief.md
  → researcher: facts.md
  → screenwriter: script.md + lines.json
  → GATE 1  director + cold-reader (parallel)  ── REVISE → screenwriter (≤ 3 rounds)
            owner: picks the title, OKs the script            ◀ owner touchpoint
  → art-director: 2–3 looks (2 style frames each: hook + key visual)
  → GATE 2a director (buildable? readable on a phone? ranks them) + cold-reader 5-second test on every frame
            owner: picks one look (1 minute)                    ◀ owner touchpoint
  → art-director: storyboard.md for the chosen look
  → GATE 2b director on the storyboard ── REVISE → art-director (≤ 3)
  → producer/animator: build scene by scene, stills per scene
  → GATE 3  director on each scene's contact sheet ── REVISE → animator
  → full render → finish (music, sound) → upload master
  → GATE 4  video-reviewer (QA, automatic + visual) → director (full cut)
            owner: watches the cut on a phone, with sound      ◀ owner touchpoint
  → owner notes → routed to the owning role (and added to owner-notes.md)
  → owner OK → douyin-publish package
```

## Files (the contract between roles)

Each episode lives in `/home/claude/diji/episodes/<NN-slug>/` (create it with
`python3 <this skill>/scripts/new_episode.py <NN-slug> "<working title>"`). Code stays in `src/vN/`.

| File | Written by | Read by |
|---|---|---|
| `brief.md` | producer (with owner) | everyone |
| `facts.md` | researcher | screenwriter, director, reviewer |
| `script.md`, `lines.json` | screenwriter | director, cold-reader (lines only), art director, animator |
| `storyboard.md`, `style/*.png` | art director | director, cold-reader (frames only), animator |
| `notes_gate<N>_r<k>.md` | director | the roles the notes are routed to, producer |
| `coldread_*.json` | cold-reader | director, screenwriter / art director |
| `crew_log.md` | producer | owner (what happened, when, how long) |

Owner's standing taste: `/home/claude/video/.claude/skills/video-reviewer/references/owner-notes.md` (each row
tagged with the role that owns it). Rubric: `references/rubric.md`.

## Producer (the main agent)

- Write `brief.md` from the owner's request (template). If the owner said "自由发挥", choose and say so.
- Launch roles with the Agent tool: `subagent_type` = `researcher`, `screenwriter`, `art-director`, `director`,
  `cold-reader`, `video-reviewer`. Give each the episode folder and exactly the files it should read. Launch
  independent roles in the same turn (director + cold-reader at each gate).
- At each gate: if the director says REVISE, send the routed notes (and the cold-read) back to that role; at most 3
  rounds, then ESCALATE to the owner with the options. If APPROVE, move on.
- Owner touchpoints: gate 1 (show 3 titles with reasons + the lines, ask for the pick/OK), gate 2a (show the
  2–3 looks side by side as one contact sheet, with the director's ranking and the cold-reader's 5-second reads,
  ask which one) and gate 4 (the cut). When the owner is away, take the director's top title / top look, note
  that in `crew_log.md`, and continue.
- While the owner is choosing at gate 1, the art director can already sketch looks from the brief; don't idle.
- Build (animator role, done by the producer for now): follow `storyboard.md` and `lines.json` exactly; stills per
  scene → gate 3 before the full render. Two layers:
  - **Engine (always reuse):** subtitle bar and reading timing, music beat grid and cut timing, title on the
    hardest drop, 2D transitions (no CSS 3D), phone zoom, grain, corner mark, Juno end card, QA scripts.
    Copy the latest kit's mechanics instead of rewriting them.
  - **Look (new every episode):** palette, the central metaphor and its props, layout, motifs. Never carry the
    previous episode's look over just because its code exists.
- After the owner picks a look, add a row to `references/looks.md`; after publishing, fill in its numbers.
- After the render: `finish` as usual, then `python3 <this skill>/scripts/upload_master.py <film.mp4>` to make the
  upload master (≥ 8 Mbps, −14 LUFS, ≤ −1.5 dBTP). Gate 4 reviews the upload master.
- Owner notes: route each to its role; add a row to owner-notes.md with the owner's words and the role tag.
- Log every hand-off in `crew_log.md` with the time, so we can see where the time goes.
- One fresh session per episode when possible; the files carry the memory.

## Researcher
Fill `facts.md`; credible primary sources only; mark 估算 and UNVERIFIED; end with "Story-worthy" and "Risks".

## Screenwriter
`script.md` + `lines.json`: hook with a concrete number/image in 8 s; ≤ 16 字 per line; each line clear alone;
facts only from verified rows; reading budget checked with pace.py; three titles with reasons; picture column.

## Art director
First 2–3 looks, then `storyboard.md` for the one the owner picks.
- **Looks:** each has a name, a 3-line pitch (the world/metaphor, palette as hex, type, what it must NOT look
  like) and 2 style frames (the hook frame and the key-visual frame, HTML → PNG via `scripts/render_html.py`),
  plus one contact sheet with all looks side by side. The looks must differ in the world they come from (e.g.
  a ledger vs a casino table vs a chat screen), not just in colour. At least one is a bold, riskier take. None
  may reuse the previous episode's main look (check `references/looks.md`). All share the engine layer: the same
  subtitle style, corner mark and Juno end card, so the series stays recognisable. The end card's follow pill
  reads `关注 Juno · 一起看懂这个世界` (the channel slogan since 2026-10-08; 反直觉 is retired).
- **Storyboard:** one coherent look; every transition motivated; first frame striking; text in safe zones;
  buildable in our engine; Juno end card for Juno episodes.

## Director
Gate reviews against the brief, rubric and owner notes; APPROVE / REVISE (routed, concrete notes) / ESCALATE.
Keeps a "don't change" list. Never makes the work. At gate 2a it does not pick for the owner: it checks each
look is buildable and readable on a phone (send back any that fail), then ranks them with one line of reasoning
each, using the cold-read and `references/looks.md` numbers when there are any.

## Cold reader
A first-time viewer who sees only lines/titles/frames; reports hook, swipe points, confusion, takeaway, title
pick, and 5-second reads of frames.

## Which looks work
`references/looks.md` has one row per published episode: the look's name and pitch, and after publishing its 2s跳出,
5s完播, 完播, 分享率 and whether it got pushed. Read it before proposing looks; after ~5 rows, say which kinds of
look this audience stays for. The sample is small, so treat it as a hint, not a rule.

## Measuring whether the crew helps
Per episode, in `crew_log.md`: total time, time per stage, director rounds per gate, owner feedback rounds after
gate 4, the owner's 1–5 rating, and later the Douyin completion rate. Compare with the pre-crew episodes
(~3 h, 1–3 owner rounds).
