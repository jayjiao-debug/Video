# Task: independent fact check of everything on screen in ep53 v3 「越王勾践剑 / 真的没锈吗？」. Verify, don't write new content.

You are a fact checker for a Chinese Douyin channel of subtitle-only history shorts. The owner's instruction: **"make sure our facts are indeed correct."** You did not write this film; check it as a sceptical editor. A wrong date, number, attribution or overstated claim on screen is a real problem for us (viewers correct us in the comments).

## What is on screen (check all of it)
1. **Subtitles:** `episodes/53-goujian/lines_v3_draft.json` (`[start, end, text, flag]`; `[x]` = underlined keyword, `{…}` = small second row).
2. **Stamps** (top-right, year · place / note): `episodes/53-goujian/stamps_v3_draft.json`.
3. **Tags and labels inside the picture:** 「划破20多张」「共30多张」「40多封信」「鸠浅 ＝ 勾践」「原因之一：料好」「铜 · 锡 约18–20% · 铅 ≈ 0」「镀铬？」「热镀锡 · 2025研究」「剑首 · 11道同心圆」「剑在墓主人左侧」「①外棺 ②内棺」 the layer labels 「剑鞘 / 两层棺 / 木椁 / 白膏泥 / 夯土」, the depth tag 「深 x 米」 counting to 10.8, the stamp notes 「长55.6厘米 · 重875克」「7年多无损检测」「据后德俊 · 渐失光泽」「锈蚀"十分轻微"」「距会稽之围21年」「剑比主人活得久」「夫差为父报仇」「请为臣，妻为妾」「《左传》：吴其为沼」「《国语》：在吴三年」「《史记》：置胆于坐」「唐兰读出，郭沫若认同」, the element tiles (29 Cu 铜 Copper · 50 Sn 锡 Tin · 82 Pb 铅 Lead · 24 Cr 铬 Chromium), and the end-card sources line 「资料：湖北省博物馆（2025研究成果）· 光明日报（陈振裕 2016；江旭东 2025）· 北京日报（后德俊 2016）」 (it must now also cover the 勾践 sources).
4. **What the pictures assert** (from `episodes/53-goujian/storyboard_v3.md` and `script_v3.md`): e.g. the sword lies on the occupant's left in the inner coffin in a black lacquer sheath; a bronze knife beside it; two lids and the 椁 roof lifted; the 1977 paper test (a stack of 30-odd sheets, 20-odd cut); 勾践's story as silhouettes: the 会稽 siege, the envoy kneeling to 夫差, 勾践 and his wife behind, 伍子胥 walking away, 勾践 on foot leading the horse of 夫差's chariot, the gall hanging at his seat, 越 troops advancing, 吴's palace going under water, a fallen cap and sword for 夫差's death, chariots not cavalry, period dress.

## How
- `episodes/53-goujian/facts.md` is our sources table (✓ / ? / UNVERIFIED per row, quotes and URLs). Do not trust it: for every claim, find the row, **re-open the source** (WebFetch the URL; search for a better one if it is dead or weak) and check that the quote really says what the screen says. For classical texts (《史记·越王句践世家》《吴太伯世家》《伍子胥列传》、《左传》哀公元年 / 哀公二十二年、《国语·吴语》《越语上》《越语下》) read the original wording from a reliable full-text site (ctext.org, zh.wikisource.org for the text only, 国学大师, 中国古典文学网), ideally two transcriptions, and note where the texts disagree.
- Pay special attention to: the years (前494, 前490, 前473, 勾践's death), the numbers (五千, 三年, 21年, 10.8米, 55.6厘米, 875克, 约5厘米, 18–20%, 7年多, 2017–2025, 40多封信, 十几位学者, 30多张/20多张, 1965年冬, 1977), who said what (伍子胥's prophecy and when he said it; 唐兰 vs 郭沫若; 陈振裕; 后德俊; 江旭东), word choices that overstate (「跪着」, 「奴仆/婢女」 for 臣/妾, 「亲自在马前开路」, 「夫差自尽」, 「吴王答应了」, 「从没被盗过」, 「同一座墓里的其他剑，也几乎没锈」, 「热镀锡」 vs 「镀铬」 wording, 「铅几乎为零」), the sequence implied by the lines (e.g. 「吴国没了，勾践也死了」), the element data (atomic numbers and names), and anything in the pictures that contradicts the record (for example: was 勾践's wife with him in 吴? Did 勾践 go to 吴 at all according to 《史记》 vs 《国语》? Is 「戈」 right for the siege? Is a chariot right for 夫差?).
- Sources we never use as evidence: 百度百科, 维基百科 articles (Wikisource texts are fine), 知乎, 搜狐/网易/头条 self-media, AI summaries.

## Output
Write `tasks/ep53-factcheck3/out/factcheck.md`:
1. A verdict line and the problems that must be fixed before the rebuild, ranked (MUST FIX / SHOULD FIX / OK-with-note).
2. A table: every on-screen claim → status (✓ verified / ✓ with wording change / ? soften / ✗ wrong) → the source you opened (URL + the exact quote) → the exact replacement wording if a change is needed (keep subtitle rows ≤ 16 字, same meaning and length if possible).
3. Corrected rows or new rows for `episodes/53-goujian/facts.md`: write them into `facts.md` directly (mark each changed row with 「(复核 2026-10-30)」), and a proposed end-card sources line (≤ 2 rows at about 22 px).
Your final reply: the verdict and the MUST/SHOULD list in Chinese, short.

You have about 55 minutes. Note the start time with `date`; write factcheck.md early and extend it, so a cut-off run still leaves a usable list.
