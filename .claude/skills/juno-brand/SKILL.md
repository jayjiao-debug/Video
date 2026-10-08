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
| credit | retired: never show 「Juno 出品」 on screen (owner) |
| series | **VIBE知识大赏** |
| corner mark | **◆ Juno · VIBE知识大赏** |
| follow line (channel slogan since 2026-10-08) | **关注 Juno · 一起看懂世界** (the old 反直觉 line is retired) |
| brand gold | `#f1c56d` (deep `#c8913a`), on near-black `#05060b`, text `#f3ede2` |
| title type | Noto Serif SC Black in a metallic gold gradient, inside 《 》, with one light sweep |
| latin type | Cormorant (small caps kicker above the title, italic English tagline below) |
| monogram | the italic gold **J** inside a drawn ring, wordmark JUNO underneath |

Changing any of these is a brand decision for the owner, not an edit: ask first,
then change `identity.ts` once so every video follows.

## 2. The four brand moments (every video, same order, same look)

1. **Cold open (length decided by the script, not a clock).** The video starts on
   the most striking image of the episode, already moving. No logo, no title, no
   black lead-in. The first subtitle is on screen by ~1 s. Land it on the track's
   accents (read them from the analysis; e.g. a freeze on the first hit, the
   claim's number on the next). A slow abstract pan is too weak (the owner
   rejected a pan along a book's page edge as 太弱); something striking must be
   moving within 3 s. No text label (kicker) over the cold open: subtitles only.
   Before the title arrives, the cold open must have done two jobs, in this order:
   - **What are we looking at?** The place, object or situation is established and
     held long enough to read: the viewer can name what is on screen.
   - **What is the question?** The episode's question is asked in everyday words.
   A 4-second cold open was too fast: viewers had not yet understood what they
   were watching (the owner's note). Size it from the hook lines instead; see
   "Timing the title" below.
2. **Gold title card (lands on the first strong beat after the hook, lasts 3.2–5.3 s).**
   It must land on a strong beat of the track (`hit`); **卡点 is not optional**. The owner prefers the
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
   - `— VIBE知识大赏 —` (no 「Juno 出品」).
   Nothing from the scene underneath may show while the card fades in (hide the
   scene art for the card's first frames).
   **The card must also leave through an object, not a fade or a cut to an
   unrelated world.** In 《第一位数字》 the hook's nine gold tubes become the card's
   motif bars, and at the end of the card the words rise away while the bars widen
   into the nine worn sections of a book's fore-edge, which is the first frame of
   the story. Stamp the title one character per half-beat from an accent, so the
   strongest accent lands on a character; pour the gold on a later accent.
   **Timing the title (do this when planning the script):**
   1. Write the hook: usually two lines, one that shows *what* ("1906年，一场
      家畜展，一头牛…") and one that asks the *question*. Add a line only if the
      viewer still could not say what they are looking at.
   2. Estimate its length: for each line, reading time (0.9 s + characters ÷ 4.6,
      the pipeline's rule) plus ~1 s for the picture to land, plus ~1 s of hold
      after the question. Two lines usually come to 7–12 s.
   3. Pick the **first strong hit of the track at or after that point** from
      `python3 make.py <id> --plan` (section markers, and the accents in
      `music.json` → `hits`). The title lands on it.
   4. If that hit is more than ~2 s after the hook ends, don't pad with dead air
      and don't squeeze the hook: either give the hook one more visual beat (an
      action, a reveal of scale), or trim the start of the track (`trim`, or a cut
      copy of the track) so a strong hit falls right where the hook ends.
   5. Keep the cold open under ~18 s. If the hook needs longer, it is two hooks:
      cut one.
   Check: freeze the frame just before the title, with the sound off. Could a
   stranger say what is on screen and what the question is? If not, the cold open
   is too short.
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
- Add new motifs to `Motif` in `Brand.tsx` and the `motif` union, never inline in a
  scene. (Exception so far: 《第一位数字》 draws its nine-bar motif in its own
  scenes because the bars are animated from the hook; move it into `Motif` when
  its end card is built.)
- The best motif is the shape the whole episode keeps returning to (the hook, the
  reveal and the end card): for Benford's law, nine descending gold bars.

## 4. Copy rules (the "voice")

- **Title:** 3–6 characters, a noun phrase or a short question. Examples:
  《第几个人》《好人会赢吗》《缘分方程》《德国坦克问题》《大脑的懒惰》.
- **Register: academic, not casual.** The audience comes to *learn*; the title and subtitles should feel like
  knowledge, not a chat. Prefer 《大脑的懒惰》 over 《大脑是个懒鬼》/《大脑在偷懒》, 「省力策略」 over 「偷懒」,
  「推断」 over 「瞎猜」. Plain words are fine; slang, memes and jokey phrasing are not (owner, 2026-10).
- **Tagline:** one question in everyday words. It is the viewer's question, not
  the scientist's: 「什么时候，该停止相亲？」 not 「最优停止理论简介」.
- **Kicker:** the real source in English small caps, as proof that this is real
  research: `OPTIMAL STOPPING · KEPLER · MDCXI`.
- **End question:** asks the viewer to answer in the comments with something
  short (a number, a letter, a choice): 「你会在第几个停下？评论区见」.
- **Sources:** always on the end card: authors, year, the paper or book.
- Subtitles: see §4a (type, size, keywords). Never use highlight colours other than gold and red.
- Numbers on screen use lining figures (`fontVariantNumeric: 'lining-nums'`):
  Cormorant's default old-style "1" reads as "I".

## 4a. Subtitles: type, size, readability, keywords

Settled with the owner on 《大脑是个赌徒》 (2026-10). Most viewers watch a landscape film on a phone held upright,
so the 1920-wide frame is shown about 390 pt wide (scale ≈ 0.2). Size and type are chosen for that screen.

**Type**
- Subtitles use a sans: **Noto Sans CJK SC (思源黑体), weight 700**. Serif (宋体) hairlines vanish on a phone after
  video compression; a sans keeps even strokes. Do not use the heaviest weight (900) for whole lines: dense characters
  (糖、懂、赢) fill in.
- The serif stays for brand moments only: title card, end-card title, big kinetic words.
- Licence: only fonts free for commercial use in video. Noto/Source Han (OFL), 阿里巴巴普惠体 and HarmonyOS Sans are
  fine. Never PingFang (苹方) or other system fonts: their licence does not allow embedding in a published video.
- Numbers: lining figures (`fontVariantNumeric: 'lining-nums'`). A number that changes on screen (a countdown,
  a counter) uses the monospaced face (JunoMono), so the digits do not change width and the number does not shiver.

**Size and placement**
- **68 px** on 1920×1080 (≈ 6.3 % of the frame height, ≈ 14 pt on an upright phone; 56 px was ≈ 11 pt, too small).
- One line, centred in the bottom letterbox bar (bar 952–1080, line top ≈ 972, line-height 1.25). If a line will not
  fit in one row at 68 px, shorten the line; do not drop to two rows or shrink the type.
- Cream ink `#f3ede2` with a tight dark outline plus a soft shadow:
  `textShadow: '0 0 3px #000, 0 0 3px #000, 0 2px 14px rgba(0,0,0,0.95)'`, so it reads over a bright frame too.

**Keywords (emphasis)**
- **At most one keyword per line**, marked in the line text: `[词]` gold = the answer / the win / the key idea,
  `{词}` red = the miss / the wrong belief / the trap. Many lines have none (counting lines, transitions).
- Emphasis is **colour + weight (900)** only. Never change the keyword's size: the whole line would jump.
- Pick the word the viewer should still remember if they only glance: 「马上要"[炸]"了」, 「……{没炸}？」,
  「就是大脑{押空}了」, 「却[被骗了]」, 「每个人的"[甜区]"」.
- Numbers keep their own number colour and are not also marked as keywords.
- The pacing script ignores the markers when it counts characters (`[`, `]`, `{`, `}` are stripped in `need()`), and any
  code that looks lines up by their text must strip them too.

**On-screen labels (not subtitles)**
- Labels, tags and axis text hold still. No drift, no wobble, no slow scaling. A label may fade in/out or land with
  a fast rise; it may move only with the object it is attached to.
- A label must never cross a drawing: put it in clear space with a thin leader line, and give text over graphs
  a halo (`paint-order: stroke` with a dark stroke) so curves never run through letters.

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
  - Put the title card in the second scene's `overlay` (the scene starts on the title hit; `lead` ≈ the card's length, `props: {quietLead: true}`).
  - Put `EndCard` in the last scene's overlay. `episodes/tanks/scenes.tsx` is the reference.
- **Existing / outside video** (cut elsewhere):
  - Add it to `explainer/brand/videos.yaml` (`card`, `trim`, `cuts`, `hit`, `extend`).
  - Run `python brand.py <id>`.

## 7. Brand QA (run before sending any video)

Pull stills at 0.5 s, at the title hit and 1 s after it, at the end card at +2 s
and +5 s, and one mid-video frame. Then check:

- [ ] The first frame is already moving and is the most striking image in the episode; no logo or black frame comes first.
- [ ] The cold open lands on the track's accents, has something striking moving by 3 s, shows what we are looking at and asks the question before the title (sound-off test), and stays under ~18 s.
- [ ] The title lands exactly on a strong beat of the track (卡点); it enters from the hook's object and leaves into the first story shot through an object (no fade to an unrelated world).
- [ ] Nothing from the scene underneath flashes before or under the title card.
- [ ] The title card layout matches §2 exactly.
- [ ] Every brand string comes from `JUNO`: series `VIBE知识大赏`, follow line `关注 Juno · 一起看懂世界`; no 「Juno 出品」 and no retired 反直觉 slogan anywhere.
- [ ] The motif is readable and overlaps nothing.
- [ ] The corner mark is at the top right, small and faint, and the top-left is clear.
- [ ] The end card has: monogram, title, motif, one comment question, follow pill and sources. The music is still playing under it.
- [ ] Only gold, ink and the dark background on the cards; gold in scenes only for answers.
- [ ] Copy follows §4: the title is 3–6 characters, the tagline is a question, the kicker names a real source.
- [ ] Subtitles follow §4a: 思源黑体 700 at 68 px in the bottom bar, outlined; at most one gold/red keyword per line, colour + weight only; labels hold still and never cross a drawing; changing numbers are monospaced.

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
- Series "VIBE知识大赏"; follow line "关注 Juno · 一起看懂世界". Never write "Juno 出品".

STRUCTURE (every video, in this order):
1. Cold open, as long as the hook needs (usually 7–12 s, under 18 s): the most striking image, already
   moving, subtitle by 1 s, no logo first. It must first show what we are looking at, then ask the question.
2. Gold title card, 3–5 s long, landing exactly on the first strong music beat after the hook.
   Kicker "[TOPIC · NAME · YEAR]", 《[3–6 字标题]》, motif [one gold object],
   tagline "[一个日常问题？]", English tagline, "— VIBE知识大赏 —".
3. The story. Corner mark "◆ Juno · VIBE知识大赏" small and faint at the top right the whole time.
   Gold highlights only for answers, red only for the wrong belief.
4. End card, last 6 s, music continues: J monogram drawing itself, 《标题》, the same motif,
   one comment question "[评论区问题]", the follow pill, and one faint line of sources "[作者 年份]".

LOOK: dark, warm, cinematic; one warm light per shot plus cool ambient;
illustrated sets and expressive characters, not diagrams on black;
never put question marks on objects; show "unknown" with motion instead.
```
