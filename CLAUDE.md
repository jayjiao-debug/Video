# Notes for Claude

This repo holds two video projects: `paperstars/` (an animated short rendered
in Python) and `explainer/` (cinematic science explainers made with Remotion).

For anything about explainer videos (a new episode, characters, sets, props,
animation, rendering), use the `explainer-video` skill (with `character-motion` for every pose and `edit-rhythm` for every hit, cut and repeated action timed to the music)
(`.claude/skills/explainer-video/SKILL.md`) and follow its workflow in order:
reference → research → art direction → **user approval** → animate → QA → render.

Brand: every video is a Juno video. Use the `juno-brand` skill
(`.claude/skills/juno-brand/SKILL.md`): fixed identity in `explainer/src/brand/identity.ts`,
the four brand moments (cold open sized by the script → gold title card exactly on a music hit → corner mark → end card),
and its brand QA before sending anything.

Pacing: the owner should never finish a subtitle and wait. Follow the `pacing` skill
(`.claude/skills/pacing/SKILL.md`): reading budget per line, no stretched windows, whole-bar
music cuts when the track is longer than the story, and `python3 -m pipeline.pace <id>` before sending.

Publishing: once the owner explicitly confirms an episode is final (满意 / 可以发了),
and not before, generate the Douyin publish package with the `douyin-publish` skill
(`.claude/skills/douyin-publish/SKILL.md`): title, description with hashtags, 4:3 and 3:4 covers,
合集, 自主声明, in the owner's habitual format.

No AI-generated video: the owner removed the ManyMotions plugin (`ai-video-editor:*`: ai-video-edit,
ai-video-shot, video-editing, video-generation). Never generate video clips with AI tools. The other plugin skills
(`video-shotcraft`, `animation-studio`, `remotion:*`) are fine to use where they fit.

What the owner wants:
- Talks in Chinese; reply in Chinese.
- Landscape 1920×1080, no narration, subtitles plus the owner's own background track.
- Quality bar: the "Vibe知识大赏" reference series on Douyin, and higher. That means
  illustrated sets with motivated lighting, consistent palette, camera moves and
  impact beats. Not diagrams on black.
- Play to our strengths: people may appear (portraits, person cards, figures
  sitting or standing with idle life), but actions are told by objects, places,
  light, numbers and the camera. A figure performing an action in a way no person
  would is what looks wrong; avoid acted actions unless backed by real motion
  reference (explainer-video §2).
- Design and approve assets (model sheets + a short motion test) before
  building full scenes.
