---
name: "overnight-batch"
description: "Run several Juno / VIBE知识大赏 topics unattended (research → script → gate 1) from overnight/queue.md without stopping on denied sites or failed steps; use when the owner leaves a batch and goes to bed, or says to continue the queue."
---

# Overnight batch

The owner is asleep. A question or a stop means nothing happens until morning.

## Rules for the whole run
1. **Never stop to ask.** Take the most reasonable reading, write it in the log, keep going. Only hold back on something that cannot be undone and could go either way (deleting the owner's files, publishing, force-pushing): do the prep, write the decision into the report, move to the next item.
2. **A failed source is not a failed task.** On a denied/failed page (403/404/429, paywall, captcha, robots, "declined", timeout, redirect loop): retry once, then go down the fallback chain: doi.org → publisher page → PubMed / PMC → Europe PMC → the authors' or university's own PDF → Semantic Scholar / OpenAlex record → a peer-reviewed review quoting it (mark "secondary"). For statistics: the official agency site → its PDF report → UN/OECD/World Bank. If nothing opens, mark the row UNVERIFIED with what was tried, and continue. Never get around a site that refuses the tools (no curl/mirror/cache tricks); use another source.
3. **A failed step is not a failed batch.** If a subagent errors, a script crashes or a gate says REVISE twice: log it, keep what was produced, mark the item failed or partial, go to the next item. At most one extra REVISE round per gate.
4. **Save as you go.** Commit the episode folder after each item; a failed push is logged, not fatal.

## Queue tool
`python3 tools/overnight_queue.py status | next | start N | done N "note" | partial N "note" | fail N "reason" | log "text"`
Queue: `overnight/queue.md`, lines `- [ ] working title | topic | notes` (states: [ ] todo, [~] running, [x] done, [!] failed, [p] partial). Every state change is also appended to `reports/overnight_<date>.md`. The tool never errors, and `next` returns a crashed `[~]` item first, so a cut-off batch resumes cleanly.

## Setup
1. If the owner listed topics in the message, append each to `overnight/queue.md`. Otherwise use the queue as it is.
2. `status`, then `log "batch start: N topics, scope = research + script + gate 1"`.
3. Load SendUserMessage and send one line: what will run and where the report will be.

## Loop (until `next` prints NONE)
1. `next` → N; `start N`.
2. Create the folder with `python3 .claude/skills/production-crew/scripts/new_episode.py <NN>-<slug> "<title>"` and write `brief.md` from the queue line and `production-crew/references/house-rules.md` §1–3; note assumptions.
3. **Research:** spawn `researcher`, adding: "Unattended run: never ask; on any denied/blocked page retry once, then use the fallback chain; mark UNVERIFIED and continue; return even if some rows are unverified." If the agent errors, retry once with a shorter brief; if again → `fail N "researcher: <error>"`, next item.
4. Fewer than 5 verified rows → `partial N "only K verified rows"`, commit, next item.
5. **Script:** spawn `screenwriter`, then gate 1 (`director` + `cold-reader` in parallel). On REVISE, one revision round; if still REVISE, keep the latest draft and mark partial with the notes.
6. Commit: `git add episodes/<folder> overnight reports && git commit -m "overnight: <title> (<state>)"`, push to the working branch.
7. `done N "<verified rows> rows · gate1 <verdict> · title <recommended>"` (or partial/fail).

Never end the turn while `next` still returns an item, unless the session itself is ending.

## Morning report
When the queue is empty, add a table per topic to `reports/overnight_<date>.md` (state, verified rows, UNVERIFIED items, gate-1 verdict, recommended title, what needs the owner), commit, and send it with SendUserMessage. If the session was cut off, the next session resumes with "继续 overnight queue".