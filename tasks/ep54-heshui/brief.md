# Task: research, script and storyboard for a Douyin knowledge short 「假如你7天不喝水」

You are the whole crew for one run: researcher, screenwriter and storyboard artist. Nobody can answer questions. The owner (Jay) reviews the result afterwards. Work economically: no review loops, look at each rendered frame once, and fix what is weak.

## 1. The film
- **Channel:** Juno (Douyin), horizontal 1920×1080.
- **Format:** subtitle-only knowledge short. **No voice-over.** There is music (the owner's BGM, cut later on bar lines) and about 12–15 sound effects. Length about **1:45–2:15**.
- **Topic:** 「假如你7天不喝水，身体会一天天发生什么？」
  - Day 1 → day 7, with a falling **身体含水量** gauge as the spine.
  - Frame it as science and survival, **never a challenge**. One clear 「别试」 moment.
  - End with practical advice and a question to the viewer.

## 2. What makes our hooks work (owner's Douyin data)
- 5-second retention predicts completion (Spearman 0.76 across our videos).
- The hooks that won combine:
  - a known reference everyone has heard;
  - a big or surprising number;
  - a contradiction;
  - emotion or suspense.
- The first line must be on screen at 0.0 s and read in under 2 s.
- **Draft hook to test and improve (keep the shape, fix any fact):**
  - 0:00 「人3天不喝水，就会死？」 (the known 「3天」 rule of thumb)
  - 0:03 「有人被关了18天，活下来了。」 (Andreas Mihavecz, Austria, 1979, forgotten in a police cell; reportedly licked condensation; Guinness record). **Verify** with Guinness World Records or a reputable newspaper. If it can't be verified, or the condensation detail undercuts "no water", reword honestly (e.g. 「几乎没喝水」) or replace it with another sourced case.
  - 0:06 「假如是你，7天不喝水——身体会一天天发生什么？」
- Write the hook first, then the rest. Give **3 title options**.

## 3. Facts: the hard rules
Every number and every medical claim on screen needs a source row in facts.md with its URL and the exact supporting quote or figure. If something can't be sourced, cut it.

- **Good sources:**
  - NCBI Bookshelf / StatPearls, PubMed reviews, physiology textbooks;
  - WHO; 中国营养学会《中国居民膳食指南（2022）》 (daily water intake);
  - 国家卫健委, 应急管理部 / 中国地震局 official guidance;
  - 新华社 / 人民网 / 央视 for rescue cases;
  - Guinness World Records.
- **Never cite:** Wikipedia, 百度百科, 知乎, content farms, or the viral "day-by-day dehydration" infographics.
- **Day-by-day honesty:** how fast someone dehydrates depends on heat, activity and body size.
  - Build the timeline from sourced physiology, not invented day labels:
    - total body water ≈ 60 % of body weight;
    - the minimum unavoidable daily loss (insensible loss through skin and breath, plus obligatory urine);
    - symptoms by % of body weight lost (thirst, reduced performance, heat-exhaustion range, life-threatening range).
  - Convert to days with a stated assumption, e.g. 「一个70公斤的成年人，躺在凉爽的房间里」, and show that assumption on screen once.
  - Use 「大约」 / 「可能」 where the source is a range.
  - Say plainly that in heat it can be far faster (sourced).
  - The 「3天」 rule is a rule of thumb, not a law: present it as 「常说」.
- **Medical safety:** no dosing, no "how to survive without water" tricks that could hurt someone. Don't advise drinking urine or seawater; if you mention them, only as sourced "don't" items. Emergency advice comes only from official guidance (e.g. trapped after an earthquake: conserve energy, avoid sweating, signal for help).
- **The emotional beat:** use one real, sourced earthquake-rescue case (e.g. 汶川 2008 survivors rescued after many days, or the 「黄金72小时」 rescue window), handled with respect.
  - Name the person only if official media named them.
  - No injuries, no bodies, no faces.

## 4. House rules for the script
- **Lines:** ≤ 16 汉字 per subtitle row, at most two rows per line.
- **Reading budget per line:** on screen ≈ 0.5 s + 字数 / 7 + 0.6 s. Never hold a line much longer unless the picture is delivering something new.
- **Highlights:** mark the 1–3 most important words per line with [ ], e.g. 「身体会先[抢水]。」
- **Rhythm:** a 先猜？ moment or two (a question with 2–3 on-screen options, the answer on the next beat) keeps viewers in.
- **Music grid (placeholder):** beat 0.566 s, bar 2.264 s. Put big reveals and scene changes on bar lines. The real cut may shift times slightly.
- **No moralising.**
- **Ending:** one practical line, then the 「别试」 line, then a question for the comments.

## 5. Visual style for the storyboard (match the house look)
- **Look:** flat-vector lacquer style.
  - Figures are one-tone silhouettes with a thin warm rim light, faceless, with simple mitten hands that touch what they hold.
  - Gold hairlines.
  - **「时代色」 idea adapted:** each day has its own colour key, drifting from a fresh, cool day 1 to a hot, parched ochre/red around day 3–5 to a cold, dim grey-violet at day 6–7.
- **The hero is water:** the only bright, true cool-white/blue thing in frame — the gauge, a droplet, a glass. Like the ice in our last film.
- **Reference code for exact colours and layout:** `episodes/37-qiqing/remotion/src/qq51/palette51.ts`, `master51.tsx` (subtitles, stamp, seal, title plaque) and `props51.tsx` (the walker). Also read `docs/history-video-style/QUALITY_BAR.md`.
- **Furniture on every frame:**
  - **Subtitles:** top-left (layout D), cream text, highlights cream with a gold underline, curly “ ” quotes.
  - **Stamp top-right, two lines:** day / condition, then a short source note, e.g. 「第3天 · 失水约5%」 / 「StatPearls」.
  - **Seal:** a hollow J seal bottom-right (outline ring + J line, ~65 % opacity).
  - **No bottom-left counter.**
  - **Phone-safe:** ≥ 120 px from the sides, ≥ 58 px from top and bottom. Labels ≥ 40 px; big numbers ≥ 96 px on a feathered dark scrim.
- **Pictures:**
  - Show the body's response as clear visual metaphors: the gauge draining, blood thickening, kidneys holding water back, the brain shrinking slightly, skin tenting. Use simple diagrams inside the silhouette; no gore, no medical photos.
  - No real photos copied, no logos, no maps.
- **End card:** a red J stamp, the title, the question, and the pill 「关注 Juno · 一起看懂世界」.

## 6. Deliverables (all in `tasks/ep54-heshui/out/`)
1. **`facts.md`:** numbered rows — claim · figure · source title · URL · exact quote · ✓/✗ — plus a short list of the most surprising, story-worthy facts.
2. **`script.md`:**
   - the 3 titles (mark your pick);
   - the hook (with a note on why it should hold 5 s);
   - a beat sheet;
   - a timed line table: start · end · line · stamp · fact row;
   - a sources line for the end card;
   - a short "risks / what I wasn't sure of" list.
3. **`lines.json`:** `[[start, end, "text with [highlights] and \n for row 2", "factRow"], …]` on the timeline in script.md.
4. **`storyboard.md`:** every scene and every transition, in time order — time range, lines, what we see, camera move, transition into the next scene (wipe, match or camera move; **no plain cross-dissolves**), music cue (bar), sound effect.
5. **Key frames:** one per scene (about 12–16) as self-contained HTML/SVG at 1920×1080 in `out/board/` (`B01.html`, `B02.html`, …), using the furniture above with the real subtitle text.
   - Render them for your own check with `python3 .claude/skills/production-crew/scripts/render_html.py out/board/*.html --out /tmp/board` and look at them at full size and at 25 %. Fix what is weak.
   - **Do not save PNG/JPG files in the repository folder.** The repo is public and only the HTML sources are committed; the owner's side renders them.
   - Keep the sheet order and the time + line for each frame listed in storyboard.md.
6. **Final reply:**
   - the chosen title and the hook lines;
   - a 5-line summary of the film;
   - any fact you dropped or weren't sure of;
   - the file list.

## 7. Don'ts
- Only add files under `tasks/ep54-heshui/`.
- Never print secrets.
- Don't edit other folders.
