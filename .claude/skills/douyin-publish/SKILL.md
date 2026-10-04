---
name: douyin-publish
description: Generate the Douyin publish package for a finished Juno / VIBE知识大赏 episode (标题, 简介 with hashtags, 4:3 horizontal cover, 3:4 vertical cover, 合集, 自主声明) in the owner's habitual format. Use ONLY after the owner explicitly confirms the final video is satisfactory (满意 / 可以发了 / 定稿); never before. Use when the owner asks for 发布信息, 标题简介, 封面, or to publish/post an episode.
---

# Douyin publish package

The owner posts every episode to Douyin (抖音) by hand. Once a video is final,
they need everything the upload form asks for, in the format they already use,
so they can paste and upload without editing.

## The gate: only after explicit confirmation

**Do not generate any of this until the owner explicitly says the video is done**
(e.g. 满意, 可以发了, 定稿, 就这版, 发布吧). A fix list, "looks good so far",
silence, or a finished render is **not** confirmation. Until then:

- Do not draft titles, descriptions or hashtags, not even as "ideas".
- Do not build or render the covers.
- When sending a render for review, don't attach publish info. At most say in
  one line that the publish package comes once they confirm.

If the owner asks for a single item early ("先给我个标题"), that is their call:
make just that item and keep the rest gated.

## What to deliver (in this order, in one reply)

Reply in Chinese. Put each text field in its own code block so it copies cleanly,
and give the character count next to each limit.

### 1. 标题 (≤ 30 characters, counting punctuation)

The owner's titles are an everyday **hook question** a viewer would ask, often
carrying a striking number or a twist. No series name, no hashtags, no emoji.
Past titles (match this voice):

- 第几个人，才是对的人？数学家算出了一个数字
- 泰坦尼克号的救生艇，为什么空着400多个座位？
- 倒霉的事总扎堆，是被针对了吗？
- 只看编号，能算出德国造了多少坦克？

Shape: `<a concrete, curious question>？` or `<question>？<a payoff hint with a number>`.
Give **one** recommended title plus two alternatives, each with its count.

### 2. 简介 (≤ 1000 characters)

Exact layout, three parts, blank line between them:

```
Vibe知识大赏｜《片名》

<年份>年，<one short story paragraph: who, what happened, the number that
surprised everyone, ending on the question the video answers. 2–4 sentences,
no spoilers of the final answer beyond what the hook needs.>

#vibe知识大赏 #AI把知识拍成大片了 #ai新星计划 #<topic> #<topic> #<topic>
```

- The first line is always `Vibe知识大赏｜《片名》` (full-width ｜, 《》 around the
  episode title from `brand.ts`).
- The story paragraph opens with the year, the way past ones do ("1950年，一位数学…",
  "1943年，盟军…", "1944年，2419枚V-1飞…"). Facts must match the episode's
  sources (the comment block in `episode.yaml`). No invented numbers.
- Hashtags: the three fixed ones first, always in this order and spelling:
  `#vibe知识大赏 #AI把知识拍成大片了 #ai新星计划`, then 2–3 topic tags
  (e.g. #统计学 #概率论 #数学之美 #二战 #反直觉 #心理学 #群体智慧).
  Space-separated, on one line.

### 3. Covers: 横版 4:3 and 竖版 3:4

Douyin asks for both. Build them as Remotion stills from the episode's own art,
following `explainer/episodes/tanks/cover.tsx`:

- One component per episode: `explainer/episodes/<id>/cover.tsx` exporting
  `<Id>Cover({layout: 'wide' | 'tall'})`.
- Point the `CoverWide` (1440×1080) and `CoverTall` (1080×1440) compositions in
  `src/Root.tsx` at it, then render:
  `COMPOSITION=CoverWide node scripts/stills.mjs <id> out/cover 0` and the same with `CoverTall`.
  Export PNG (and a high-quality JPG copy if over ~5 MB).
- Look: a dark, cinematic frame using the episode's hero art (the same set,
  props and palette as the video, not new art), a vignette, and a **2-line hook**
  in the gold gradient (`cv-gold`) serif, built on the most striking number or
  fact (like "40个座位 / 只坐了12人"). Small series line (VIBE知识大赏) and the
  episode title (《片名》) beneath. The two lines must not repeat the 标题 word for word.
- Must read at thumbnail size: check both at 25% scale. Hook text at least
  ~100 px tall on the full-size cover, nothing important within 6% of the edges,
  and on the tall cover keep the lower ~18% free of key content (Douyin overlays UI there).
- Brand rules from `juno-brand` apply (gold, monogram, lining numerals, no white flash).

Send both images with SendUserFile (`display: 'render'`).

### 4. 合集

Suggest which collection the episode goes in. Ask the owner which existing 合集
they use if it isn't known yet, and remember their answer for later episodes by
adding it below.

Known collections: _(none recorded yet)_

### 5. 自主声明

Default: **内容由AI生成** (the video is generated with AI). Mention it as the
choice to tick. If the episode reuses real archival footage/photos, also flag
whether a source/版权 note is needed.

## Checks before sending

- 标题 ≤ 30 characters and 简介 ≤ 1000 characters, counted with
  `python3 -c "print(len('…'))"`, not by eye.
- Every number in the 标题, 简介 and covers matches the video and its sources.
- The three fixed hashtags are present, in order, spelled exactly.
- Both covers render, are the right sizes (1440×1080 and 1080×1440), and are legible at 25%.
- Commit the cover code (not the rendered images or the video; the repo is public).
