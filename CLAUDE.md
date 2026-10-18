# Juno / VIBE知识大赏 — standing rules

## Unattended runs (overnight, scheduled, or "I'm going to bed")
The owner is not watching. A question or a stop means nothing happens until morning. So:

1. **Never stop to ask.** Take the most reasonable reading, write it at the top of the log, and keep going.
   Only stop for something that cannot be undone and could go either way (deleting the owner's files,
   publishing, force-pushing). Do the prep, write the decision into the log, and move on to the next item.
2. **A failed source is not a failed task.** If a page is denied (403/404/429, paywall, captcha, robots,
   "declined", timeout, redirect loop), retry once, then go down the fallback chain:
   doi.org → publisher page → PubMed / PMC → Europe PMC → the authors' or university's own PDF →
   Semantic Scholar / OpenAlex record → a peer-reviewed review that quotes it (mark "secondary").
   Statistics: the official agency site → its PDF report → the UN/OECD/World Bank mirror.
   If nothing opens, mark the row **UNVERIFIED** with what you tried, and continue.
   Never get around a site that refuses the tools (no curl/mirror/cache tricks); use another source.
3. **A failed step is not a failed batch.** If a step errors (a subagent fails, a script crashes, a gate
   says REVISE twice), log it, keep whatever was produced, mark the item `failed` or `partial`, and
   go to the next item. Allow at most one extra REVISE round per gate when unattended.
4. **Save as you go.** Commit after each finished item (`git add` the episode folder, commit, push to
   the working branch), so nothing is lost if the session ends.
5. **Leave a morning report.** Everything goes in `reports/overnight_<YYYY-MM-DD>.md`: what got done,
   what failed and why, what's UNVERIFIED, and what needs the owner. Send it with SendUserMessage at the end.

For a batch of topics, use the `overnight-batch` skill (`.claude/skills/overnight-batch/SKILL.md`).
