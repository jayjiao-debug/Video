---
name: juno-brand
description: Keep every Juno video instantly recognisable as Juno. The fixed brand identity (name, credit, series, follow line, gold, J monogram), the four brand moments every video must have (cold open, gold title card on the music hit, quiet corner mark, end card with the question and follow line), copy rules, motif rules and a brand QA checklist. Use whenever making, branding, re-branding or reviewing any Juno / VIBE知识大赏 video, title card, end card, cover, intro or outro, or when the user asks about brand consistency or 品牌识别.
---

# Juno brand

The goal: a viewer who has seen one Juno video recognises the next one within
the first 3 seconds and again in the last 3 seconds, without reading the name.
Recognition comes from **repetition of a few fixed things**, never from novelty.
So: change the story every episode, never the brand.

## Where the code is

The pipeline and art library live in the GitHub repo **jayjiao-debug/Video**
(branch `claude/hopeful-curie-hm3mlq` until it is merged to `main`), under `explainer/`.
If this session has no checkout, clone it first. If the session cannot run code at all
(a plain chat), still follow the rules here and produce scripts, designs and
prompts. Say so to the owner instead of pretending to render.

## 1. The identity (fixed, single source)

All of it lives in `explainer/src/brand/identity.ts` (`JUNO`). Import it; never
retype a brand string or colour in a scene, a yaml or a prompt.

| | value |
|---|---|
| name | **Juno** |
| credit | **Juno 出品** |
| series | **VIBE知识大赏** |
| corner mark | **◆ Juno · VIBE知识大赏** |
| follow line | **关注 Juno · 每期一个反直觉的知识** |
| brand gold | `#f1c56d` (deep `#c8913a`), on near-black `#05060b`, text `#f3ede2` |
| title type | Noto Serif SC Black in a metallic gold gradient, inside 《 》, with one light sweep |
| latin type | Cormorant (small caps kicker above the title, italic English tagline below) |
| monogram | the italic gold **J** inside a drawn ring, wordmark JUNO underneath |

Changing any of these is a brand decision for the owner, not an edit: ask first,
then change `identity.ts` once so every video follows.

## 2. The four brand moments (every video, same order, same look)

1. **Cold open (0–~4 s).** The video starts on the most striking image or question
   of the episode, already moving. No logo, no title, no black lead-in. The first
   subtitle is on screen by ~1 s.
2. **Gold title card (starts by `JUNO.timing.titleCardBy` = 4 s, lasts 3.2–5.3 s).**
   It must land on a strong beat of the track (`hit`). The owner prefers the
   entrance **built from the episode's own object**, carried over from the cold
   open by a match cut. In 《德国坦克问题》 the hook slams into plate 82731, the card
   opens on that same plate, and the title is stamped into the brass one character
   per half-beat before gold fills it (`TankTitle` in `episodes/tanks/scenes.tsx`).
   Do not use a horizontal light-line sweep or a white flash to bring the title in;
   the owner found those generic. A weak motif (a row of small numbers) is not
   enough: the motif should be the episode's hero object. `TitleCard` in
   `src/brand/Brand.tsx` remains the fallback for re-branding videos made
   elsewhere. Whatever the entrance, the card carries these elements:
   - Latin kicker: `TOPIC IN ENGLISH · KEY NAME · YEAR`.
   - 《Title》 in gold, 3–6 characters.
   - The episode motif.
   - Chinese tagline: one question.
   - English tagline.
   - `— Juno 出品 · VIBE知识大赏 —`.
   Nothing from the scene underneath may show while the card fades in (hide the
   scene art for the card's first frames).
3. **Corner mark (whole video, landscape).** `◆ Juno · VIBE知识大赏` at the top right,
   about 20 px, 55 % opacity. Draw it with `Chrome`. Keep the top-left clear,
   because Douyin puts its own download watermark there. It hides while the title
   card is up and fades out under the end card. Do not put a big centred header
   on screen.
4. **End card (last `JUNO.timing.endCard` = 6 s, the music keeps playing).** Use
   `EndCard`. Layout:
   - The J monogram drawing itself.
   - 《Title》 again.
   - The motif again.
   - **One comment question** (the episode's `question`).
   - The follow pill.
   - One faint line of sources.
   Same order every time.

The first three seconds of each card are what people learn to recognise; do not
restyle them per episode. What changes per episode is only the words in
`VideoCfg` (title, kicker, tagline, taglineEn, question, sources) and the motif.

## 3. The motif: the one per-episode brand element

Each episode gets one small **motif**: the episode's key object, drawn in brand
gold on the title card and the end card. Examples: `cards` (a fan of candidate
cards), `duel` (two coins), `stars` (a constellation that resolves into the
Drake equation), `serials` (the four drawn numbers).
- It must be readable in 1 s at phone size: one object or one short row, not a diagram.
- It uses only gold, ink and the dark background (no new colours).
- It must not overlap the title or the tagline. Check the still.
- Add new motifs to `Motif` in `Brand.tsx` and the `motif` union, never inline in a scene.

## 4. Copy rules (the "voice")

- **Title:** 3–6 characters, a noun phrase or a short question. Examples:
  《第几个人》《好人会赢吗》《缘分方程》《德国坦克问题》.
- **Tagline:** one question in everyday words. It is the viewer's question, not
  the scientist's: 「什么时候，该停止相亲？」 not 「最优停止理论简介」.
- **Kicker:** the real source in English small caps, as proof that this is real
  research: `OPTIMAL STOPPING · KEPLER · MDCXI`.
- **End question:** asks the viewer to answer in the comments with something
  short (a number, a letter, a choice): 「你会在第几个停下？评论区见」.
- **Sources:** always on the end card: authors, year, the paper or book.
- Subtitles: Noto Serif SC, cream text. Gold `[...]` is for the answer, red `{...}`
  for the wrong belief or the trap. Never use other highlight colours.

## 5. Visual rules that read as Juno

- Dark, warm, cinematic. One warm practical light per shot (lamp, torch, fire) and
  cool ambient. Never use flat white backgrounds or diagrams on black with no set.
- Gold is reserved for answers, titles and the brand. Do not use gold for decoration.
- Do not put question marks on objects (balls, plates, faces). Show "unknown" with
  motion instead: a rolling counter, a fading silhouette, a dashed outline.
- Use the shared art library (`src/art/`) and palette (`P`) so the characters,
  sets and grain look the same from episode to episode.
- Format: 1920×1080, 30 fps, no narration, the owner's own track only, mastered to −14 LUFS.

## 6. Where things live

- `explainer/src/brand/identity.ts`: the identity (§1).
- `explainer/src/brand/Brand.tsx`:
  - `TitleCard`, `EndCard`, `Monogram`, `Motif`, `GoldTitle`.
  - `Branded`: overlays the cards on an already-finished video.
- `explainer/src/components/Chrome.tsx`: the corner mark.
- **New episode** (made with the `explainer-video` skill):
  - Define an `EPISODE: VideoCfg` in its `scenes.tsx`.
  - Put `TitleCard` in the second scene's `overlay` (scene `lead` ≈ 3.6 s, `props: {quietLead: true}`).
  - Put `EndCard` in the last scene's overlay. `episodes/tanks/scenes.tsx` is the reference.
- **Existing / outside video** (cut elsewhere):
  - Add it to `explainer/brand/videos.yaml` (`card`, `trim`, `cuts`, `hit`, `extend`).
  - Run `python brand.py <id>`.

## 7. Brand QA (run before sending any video)

Pull stills at 0.5 s, at the title hit and 1 s after it, at the end card at +2 s
and +5 s, and one mid-video frame. Then check:

- [ ] The first frame is already moving and is the most striking image in the episode; no logo or black frame comes first.
- [ ] The title card starts by 4 s and lands on a beat.
- [ ] Nothing from the scene underneath flashes before or under the title card.
- [ ] The title card layout matches §2 exactly.
- [ ] Every brand string comes from `JUNO`: credit `Juno 出品`, series `VIBE知识大赏`.
- [ ] The motif is readable and overlaps nothing.
- [ ] The corner mark is at the top right, small and faint, and the top-left is clear.
- [ ] The end card has: monogram, title, motif, one comment question, follow pill and sources. The music is still playing under it.
- [ ] Only gold, ink and the dark background on the cards; gold in scenes only for answers.
- [ ] Copy follows §4: the title is 3–6 characters, the tagline is a question, the kicker names a real source.

If any box fails, fix it before sending. If the owner asks for a one-off
exception, do it for that video only and do not change `identity.ts`.

## 8. Portable prompt (for any other tool or a fresh chat)

When the owner wants to brief another tool or a new session, give them this
block. Fill in the bracketed fields from the episode:

```
You are producing a video for the Douyin channel "Juno" (series: VIBE知识大赏).
Keep the brand identical to previous episodes; only the story changes.

FORMAT: 1920×1080 landscape, 30 fps, no narration, burned-in Chinese subtitles,
the owner's own background track only.

BRAND (fixed, do not restyle):
- Brand gold #f1c56d (deep #c8913a) on near-black #05060b; text #f3ede2.
- Title: 《标题》 in a heavy Chinese serif with a metallic gold gradient and one light sweep.
- Small caps English kicker above it; italic English tagline below; Cormorant for Latin.
- Monogram: italic gold "J" inside a thin gold ring, wordmark "JUNO".
- Credit "Juno 出品"; series "VIBE知识大赏"; follow line "关注 Juno · 每期一个反直觉的知识".

STRUCTURE (every video, in this order):
1. Cold open, 0–4 s: the most striking image or question, already moving, subtitle by 1 s. No logo first.
2. Gold title card by 4 s, 3–5 s long, landing on a music beat with a flare.
   Kicker "[TOPIC · NAME · YEAR]", 《[3–6 字标题]》, motif [one gold object],
   tagline "[一个日常问题？]", English tagline, "— Juno 出品 · VIBE知识大赏 —".
3. The story. Corner mark "◆ Juno · VIBE知识大赏" small and faint at the top right the whole time.
   Gold highlights only for answers, red only for the wrong belief.
4. End card, last 6 s, music continues: J monogram drawing itself, 《标题》, the same motif,
   one comment question "[评论区问题]", the follow pill, and one faint line of sources "[作者 年份]".

LOOK: dark, warm, cinematic; one warm light per shot plus cool ambient;
illustrated sets and expressive characters, not diagrams on black;
never put question marks on objects; show "unknown" with motion instead.
```
