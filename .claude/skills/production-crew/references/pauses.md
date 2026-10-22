# 停顿: pauses that make hits land (from the owner's reference, 2026-10-22)

Source: an editing tutorial the owner sent (screen recording, 2 min 24 s). Its whole point: power needs a pause before it.
"动作的力量感就是爽点的最好体现，就只需在发力前给他一个停顿——一个蓄力。" Three kinds:

## 1. 动作停顿 (action pause / wind-up)
- Shoot (or animate) the action at normal speed. Split at the wind-up (character raises the hand) and at the completion.
- Wind-up part: speed curve slow → fast. Completion part: fast → slow. Add a shake on the first frame of the strike.
- In our engine: before a reveal or a strike, hold or slow the element for ~½–1 beat (it gathers: scale up a few %, trembles),
  then snap on the downbeat; ease out after the hit (out3), never linearly; a 2–4 frame camera shake on the hit frame.

## 2. 声音停顿 (sound pause) — "让耳朵休息一下"
- When the sound stops, the next entry of the music hits harder.
- Case A, BGM only in the second half: delete the first half's audio, start the music on the hit.
- Case B, music all the way: split just before the chorus/drop, mute the tail of the first part (silence), optionally add a
  vocal/riser SFX in the gap, and land the picture's key moment on the chorus.
- Use it sparingly: one or two real silences per film (the first big reveal, the title). Smaller dips (a filter/duck of
  ½ beat) can prepare other hits. A silence every scene stops being a surprise.

## 3. 画面停顿 (picture pause / density)
- Control the density of cuts: keep shots switching fast, then stop switching. The stop grabs the viewer and prepares
  the strong beat that follows.
- In our engine: quick pops on half beats (chips, icons, flips), then one bar where nothing new appears, then the hit.

## Workflow notes from the tutorial
- Auto beat marking (自动踩点) snaps material to the beat; stretch ONE clip to hold across the pause.
- Combine all three on the moment that matters most: picture holds + music stops + then everything lands together.
- "现在可以根据自己的感觉，尝试加上特效、音效、转场": effects, SFX and transitions come after the pause structure works.
