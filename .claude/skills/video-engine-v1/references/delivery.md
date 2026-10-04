# Delivery, posting, archive

## What the creator gets each round
1. **Send version** `<标题>_<tag>_发送版.mp4` under 30 MB (chat upload limit): two-pass x264 1600k + AAC 160k
   (finish.py). Music at −14 LUFS (two-pass loudnorm), 1 s fade-out at the end.
2. **Scene clips** `<标题>_<tag>_分场景/S1_…mp4` (with music) so feedback can name a scene and a time.
3. **Master** `<标题>_<tag>.mp4` (~10 Mbps). Too big for chat (30 MB) and for the Google Drive connector (uploads go
   inline as base64). Hand it over through GitHub: push it in ≤ 90 MB parts to a `deliver` branch with a workflow
   that joins the parts and uploads one Actions artifact (`compression-level: 0`); the creator downloads it from the
   run page. GitHub Releases are not available from these sessions.
4. **Covers**, drawn natively at size (never a frame grab, never "cut and paste"):
   4:3 landscape 1440×1080 and 3:4 portrait 1080×1440. Render the film's own 3D/2D scene from a cover camera,
   add the hook in huge type (e.g. "40个座位 / 只坐了12人" with the second line gold), the gold title and the tagline.
   Corner mark "◆ Juno · VIBE知识大赏". Never write "Juno 出品" (the creator finds it cringe).
5. **Posting copy** (发布文案.md) and, if Google Drive is connected, a Google Doc copy in an episode folder.

## Douyin upload form (抖音发布页)
- **作品标题** ≤ 30 字: the paradox as a question ("泰坦尼克号的救生艇，为什么空着400多个座位？").
- **作品简介** ≤ 1000 字: 3–5 short lines retelling the hook and the principle, the question to the viewer,
  CC-BY credits for downloaded models, then the topics: `#vibe知识大赏 #<主题> #心理学/#数学之美 #反直觉 #冷知识`.
- **官方活动**: skip unless one genuinely fits.
- **设置封面**: 横封面 4:3 and 竖封面 3:4 files above.
- **添加合集**: "VIBE知识大赏".
- **自主声明**: "内容由AI生成" (AI-assisted, code-built animation; declaring avoids being down-ranked as unlabelled).
- **置顶评论**: the end-card question with 👇.

## Sources and platform fact-checks
- The end card and the 简介 (or a pinned comment) list the credible sources from the facts table — never
  Wikipedia (see qa-lessons → Sources).
- Douyin may ask for proof of authenticity (抖音小安 私信). Reply in two messages: (1) the content is real events and
  published research, visuals are code-built animation (示意, declared 内容由AI生成), then each claim with its
  number; (2) the source list with official / journal / government links. No original footage exists, so none is
  attached. Do not edit the title or delete and re-post the video.

## Credits and licences
- Sketchfab models are CC-BY: credit `"<model>" by <author> (Sketchfab)` in the end card and the description.
- Poly Haven assets are CC0; three.js textures MIT. The asset farm writes credits.json for every download.
- Never commit tokens. SKETCHFAB_TOKEN lives only in the repo's Actions secrets.

## Archive (every delivered version)
`python3 scripts/archive.py <ep>-<tag> out/<film>.mp4 <Composition> --note "..."` commits, tags, appends ARCHIVE.md
and writes `out/archive/<tag>_source.zip` (zip via git archive — the `zip` CLI mangles Chinese names on Windows).
