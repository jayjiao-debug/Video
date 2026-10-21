# ep35 《推石头的人，是幸福的》 — handoff (2026-10-21)

Everything needed to finish the film is in this folder **except the BGM**, which is never committed (public repo).
The owner attaches it to the new chat; save it as `audio/bgm.mp3` (and copy to `remotion/public/bgm.mp3` only if a tool asks for it — the farm never uploads it).

## Where things are

| What | Path |
|---|---|
| Script (lines, sources) | `script.md`, `facts.md`, `brief.md` |
| **The film** (Remotion project, self-contained) | `remotion/` — `src/ep35/Puppet35.tsx` (all scenes), `src/ep35/pushIK.ts` (push IK solver), `src/looks26/b/kit.tsx` (fonts), `public/fonts/` |
| Full film composition | `FILM2` (164.4 s = 4932 frames @30 fps). Cold open alone: `OPEN8`. Older compositions in the file are earlier drafts — ignore. |
| Line timings | `SCRIPT2` in Puppet35.tsx: each line starts on a bar of the BGM, `bar35(k) = 0.416 + 2.025·k` (beats: `bt(k) = 0.416 + 0.50625·k`) |
| Soundtrack builder | `music/soundtrack.py <bgm.mp3> <out.wav> 164.4` → BGM untouched (float) + cold-open TV sounds |
| Push checker | `remotion/checks/push_check.mjs` (see below) |
| Local still/video renderer | `remotion/scripts/frame.mjs` |
| Farm render script | `/home/claude/video/.claude/skills/video-engine-v1/scripts/cloud_render.py` |
| Owner rules (read first) | `/home/claude/video/.claude/skills/video-reviewer/references/owner-notes.md` (ep35 rows at the bottom) |

## State

Approved by the owner: the cold open v9 (platform → CRT TV channel flips → TV off "然后呢？" → 第二天 → clock face match-cuts into the boulder → light beam → sky title), the TV sounds (no hum), the music-box / turntable ideas are dropped.

Done after the last full render (v2, not yet rendered into a video):
1. 0:25 push readable; then **re-done by IK from contact points** (palms on the rock outline at shoulder height, soles on the slope, reach-driven steps, light pool along the slope). Check passes on every frame 0:19–0:30.76.
2. 1:10 he looks up at the control bar (camera tilts up with his gaze).
3. 1:13 Paris: the writer at true scale (k 1.55), typewriter under his hands.
4. 1:50–1:56 "心不在焉": a see-through copy of him drifts to labelled worries (明天的会 / 房贷 / 消息没回); body left behind goes grey; comes back on 心在这儿.
5. 2:08 the three named answers are 只是份工作 / 是我的事业 / 是我的使命, spread apart.

**Next:** the owner was sent before/after stills of the push fix and keyframes of 2–5; get their OK, then render the full film, check, deliver.

## Commands

```bash
cd /home/claude/video/episodes/35-sisyphus/remotion
npm ci                                    # once
export REMOTION_BROWSER="$(ls -d /opt/pw-browsers/chromium_headless_shell-1194/*/)headless_shell"

# stills (seconds), e.g. to show keyframes before any full render
ENTRY=ep35/Puppet35 CID=FILM2 JPG=1 SCALE=0.5 node scripts/frame.mjs stills out 19 25.6 29.8
rm -rf /tmp/remotion-webpack-bundle-*     # disk is tight: always clean after renders

# push check (every frame of the boulder push; must print ALL CHECKS PASS)
npx esbuild src/ep35/pushIK.ts --format=esm --outfile=checks/pushIK.mjs && node checks/push_check.mjs

# full film on the GitHub farm (free CPU)
git clone -q --depth 1 --branch render-farm https://github.com/jayjiao-debug/Video /home/claude/vibe-render   # once
VE_PROJECT=$PWD VE_FARM=/home/claude/vibe-render VE_REPO=jayjiao-debug/Video \
  python3 /home/claude/video/.claude/skills/video-engine-v1/scripts/cloud_render.py FILM2 film_v3 --start 0 --end 4931 --chunks 20
#   → out/film_v3_pic.mp4 (~160 MB). If the disk fills while joining, the parts are in /tmp/claude-0/render-output:
#     delete its .git, `cat film_v3.mp4.part* > out/film_v3_pic.mp4`.

# soundtrack + master + chat-size send version (≤ 28 MB)
python3 ../music/soundtrack.py ../audio/bgm.mp3 out/mix.wav 164.4
ffmpeg -y -i out/film_v3_pic.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -movflags +faststart -shortest out/推石头的人_v3.mp4
ffmpeg -y -i out/推石头的人_v3.mp4 -c:v libx264 -preset slow -b:v 1250k -pass 1 -an -f null /dev/null && \
ffmpeg -y -i out/推石头的人_v3.mp4 -c:v libx264 -preset slow -b:v 1250k -pass 2 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart out/推石头的人_v3_发送版.mp4
```

## Still to deliver (after the owner approves the cut)
- 发送版 (≤ 28 MB) in chat; HD master as a GitHub Actions download link (skill: github-hd-delivery).
- New covers (横版 4:3, 竖版 3:4) from the new look — the covers in `out/` are from v1 and outdated.
- Douyin publish package (skill: douyin-publish) only after the owner says the video is final.

## Owner rules that bite on this episode
Never draw hands reaching in (no GodHand); no 3D; not black-and-white; no AI images in the film; the BGM is one untouched piece (only a fade over the last bar); subtitles centred by ink (trailing ？ pulled back — built into `Sub`); every scene change motivated and different, outgoing labels leave before the move; any body contact pose is solved (IK) and checked, not eyeballed; **show the owner keyframes and wait for OK before every full render**; never commit video or the BGM.
