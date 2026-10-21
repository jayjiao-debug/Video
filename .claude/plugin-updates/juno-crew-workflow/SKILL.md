---
name: "juno-crew-workflow"
description: "Entry point for a Juno / VIBE知识大赏 episode: attach the jayjiao-debug/Video repo and follow its production-crew skill. Use for every new episode or when asked how the workflow runs."
---

# Juno crew workflow

The workflow lives in one place: the repo **jayjiao-debug/Video**, `.claude/skills/`.

1. Attach the repo and check out the working branch.
2. Read `.claude/skills/production-crew/SKILL.md` (order of work, gates, files, roles).
3. Every role works from `.claude/skills/production-crew/references/house-rules.md` (the owner's taste).
4. Build and render with `.claude/skills/video-engine-v1/SKILL.md`; review with
   `.claude/skills/video-reviewer/SKILL.md`.

Don't keep rules in this file: add them to the repo, so there is only one copy to keep right.
