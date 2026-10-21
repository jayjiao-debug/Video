# Delivery, posting, archive

## What the owner gets each review round
1. **Send version** `<标题>_<tag>_发送版.mp4` under 30 MB (chat upload limit): two-pass x264 1600k + AAC 160k
   (finish.py). finish.py currently loudnorms the music to −14 LUFS with a 1 s fade-out, which conflicts with
   house-rules §8.1; see `.claude/AUDIT.md`, question 1.
2. **Scene clips** `<标题>_<tag>_分场景/S1_…mp4` (with music) so feedback can name a scene and a time.
3. **Master** `<标题>_<tag>.mp4` (once the cut is final): the file the owner uploads to Douyin. Too big for
   chat, so it goes through a GitHub Actions artifact (github-hd-delivery skill). Never commit video or music to
   the main history: the repo is public.

## Posting, covers and the HD master
Only after the owner says the film is final: the **douyin-publish** skill makes the 标题, 简介, hashtags, covers,
合集 and 自主声明; the **github-hd-delivery** skill hands over the master. Platform fact-check replies:
`production-crew/references/sources.md`.

## Credits and licences
- Sketchfab models are CC-BY: credit `"<model>" by <author> (Sketchfab)` in the end card and the description.
- Poly Haven assets are CC0; three.js textures MIT. The asset farm writes credits.json for every download.
- Never commit tokens. SKETCHFAB_TOKEN lives only in the repo's Actions secrets.

## Archive (every delivered version)
`python3 scripts/archive.py <ep>-<tag> out/<film>.mp4 <Composition> --note "..."` commits, tags, appends ARCHIVE.md
and writes `out/archive/<tag>_source.zip` (zip via git archive — the `zip` CLI mangles Chinese names on Windows).
