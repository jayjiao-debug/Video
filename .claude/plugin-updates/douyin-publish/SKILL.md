---
name: "douyin-publish"
description: "Generate the Douyin publish package (标题, 简介+hashtags, 4:3 and 3:4 covers, 合集, 自主声明) for a Juno / VIBE知识大赏 episode, ONLY after the owner explicitly confirms the video is final."
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

Exception: when the episode title itself is already a strong question (e.g. 《生命平等吗？》),
the owner may want the 标题 to be just that title with no extra hook text. Follow what they say.

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
  episode title).
- The story paragraph usually opens with the year, the way past ones do ("1950年，一位数学…",
  "1943年，盟军…"); for everyday-life topics open on the viewer's situation instead. Facts must match the
  episode's `facts.md`. No invented numbers.
- Hashtags: the three fixed ones first, always in this order and spelling:
  `#vibe知识大赏 #AI把知识拍成大片了 #ai新星计划`, then 2–3 topic tags
  (e.g. #统计学 #概率论 #数学之美 #二战 #反直觉 #心理学 #群体智慧).
  Space-separated, on one line.

### 3. Covers: 横版 4:3 and 竖版 3:4

Douyin asks for both. Build them as Remotion stills from the episode's own art. Copy the latest
episode's cover pair (e.g. `episodes/31-baoji/build/Cover31.tsx` + `cover31.mjs`) into
`episodes/<NN>/build/`, point it at this episode's set, and render both sizes:
wide 1440×1080 and tall 1080×1440. Export PNG (and a high-quality JPG copy if over ~5 MB).
- Look: a dark, cinematic frame using the episode's hero art (the same set,
  props and palette as the video, not new art), a vignette, and a **2-line hook**
  in solid gold serif with a soft glow (gradient text via background-clip fails in headless renders), built on the most striking number or
  fact (like "40个座位 / 只坐了12人"). Small series line (VIBE知识大赏) and the
  episode title (《片名》) beneath. The two lines must not repeat the 标题 word for word.
  If the owner says the title alone is strong enough, use only the title (plus the small series line).
- Must read at thumbnail size: check both at 25% scale. Hook text at least
  ~100 px tall on the full-size cover, nothing important within 6% of the edges,
  and on the tall cover keep the lower ~18% free of key content (Douyin overlays UI there).
- A short title such as 生命平等吗？ stays on **one line**. Never let it wrap so that
  one or two characters (e.g. 吗？) fall onto a line of their own: set `whiteSpace: 'nowrap'`
  and size the font to fit, or break deliberately where the owner asks.
- Full-width punctuation ending a centred line is pulled back and the ink centre measured on the PNG
  (house-rules §7.4).
- Brand rules from `production-crew/references/house-rules.md` §10 apply (never "Juno 出品", corner mark).

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
- The cover title is on the intended number of lines, and if it ends in full-width punctuation
  its ink is optically centred (measured on the PNG).
- Commit the cover code (not the rendered images or the video; the repo is public).