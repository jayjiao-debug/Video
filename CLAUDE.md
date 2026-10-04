# Notes for Claude

This repo holds two video projects: `paperstars/` (an animated short rendered
in Python) and `explainer/` (cinematic science explainers made with Remotion).

For anything about explainer videos (a new episode, characters, sets, props,
animation, rendering), use the `explainer-video` skill (and `character-motion` for every pose)
(`.claude/skills/explainer-video/SKILL.md`) and follow its workflow in order:
reference → research → art direction → **user approval** → animate → QA → render.

Brand: every video is a Juno video. Use the `juno-brand` skill
(`.claude/skills/juno-brand/SKILL.md`): fixed identity in `explainer/src/brand/identity.ts`,
the four brand moments (cold open → gold title card by 4 s → corner mark → end card),
and its brand QA before sending anything.

What the owner wants:
- Talks in Chinese; reply in Chinese.
- Landscape 1920×1080, no narration, subtitles plus the owner's own background track.
- Quality bar: the "Vibe知识大赏" reference series on Douyin, and higher. That means
  illustrated sets with motivated lighting, expressive characters from the shared
  rig, consistent palette, camera moves and impact beats. Not diagrams on black.
- Design and approve assets (model sheets + a short motion test) before
  building full scenes.
