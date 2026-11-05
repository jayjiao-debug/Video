The ep61 storyboard is finished and committed on `api-task/ep61-storyboard`. It has 22 shots, a family-tree design, the iconography table, verified facts and boards as code. All 22 board frames and the standalone family-tree image render on the runner; I checked the frames visually and fixed the layouts. I committed only code and markdown, no images.

**What's in it**
- **Shots:** the 43 lines are grouped into 22 shots of one or two lines each. `storyboard.md` gives each shot's time range, framing, camera move, layer order, gods, animation beat, transition, SFX and music mood.
- **Family tree:** it is the throughline. Each god lights up in it the moment they appear, with a small tree chip on most shots. Shots 1, 18, 21 and 22 show the tree full-screen, and shot 22 is the final frame. A `TREE61` composition exports it as a standalone image for the pinned comment.
- **Facts:** all nine ⚠ rows are now ✓ with quotes in `facts.md`, and the sixteen I-rows are added.
- **Boards:** `episodes/37-qiqing/remotion/src/qq61/board61.tsx` registers `BOARD61` (1440×1080, 30 fps, 22 frames, frame i = key frame of shot i+1). The ep60 gods are reused unchanged. The new gods are built on the same rig, with the new heads and headdresses painted over it. The one edit to an ep60 file is `export {crown};` added at the end of `rig60.tsx`, which doesn't change what it renders.
- **Summary:** `tasks/ep61-storyboard/result.md` is the Chinese summary with the render command.

**What the fact check changed**
- **Line 35:** "也个个不好惹" contradicts lines 38–39. A Penn Museum curator calls Bastet Sekhmet's gentle counterpart. I changed it to 「太阳神的女儿们，脾气天差地别。」 in the storyboard; `script.md` is unchanged.
- **Sekhmet (F19):** the tomb text names the goddess Hathor, and the red is beer flooding the fields, not a red sky. I kept your red sky and fleeing silhouettes as a stylisation. The flooded red fields are the alternative.
- **"80 years" (F16):** it is the myth's own figure, said twice in the Contendings of Horus and Seth, and it means years in court. The optional exact line is 「叔侄俩，在法庭上争了80年」.
- **Isis (F10):** "最会魔法" overstates it, since "Great of Magic" is a shared epithet. The optional safer line is 「伊西斯，法力强大的女神」.
- **Atum (F3):** the double crown is attested, but the sceptre is not.

**Decisions and gaps for you**
- **Unattested designs.** Geb's green skin, Nut's nu-jar and Sekhmet's red dress have no object I could find. Set's ochre colour has none either, though a scholarly paper supports the squared ears and curved snout. These are design choices in the boards, not "attested" claims. I dropped Geb's goose because nothing supports it. Please confirm or change these, in particular Geb's green.
- **British Museum.** Its pages, and Brooklyn's and the Walters', would not open. I could only confirm the Greenfield papyrus as BM 1910,0509.1.87 through Google Arts & Culture. The "EA 10554" number is unverified and should be checked in a browser before it goes on screen.
- **Pyramid Text 600.** I never got a verbatim line for the mound or for F4, so those still lack a direct quote.
- **Boards are static.** They are one key frame per shot. No animation or audio has been built.

To render the boards:
```
cd episodes/37-qiqing/remotion && npm ci
SFPS=1 REMOTION_BROWSER=/usr/bin/chromium ENTRY=qq61/board61 CID=BOARD61 JPG=1 node scripts/frame.mjs stills /tmp/board $(seq 0 21)
REMOTION_BROWSER=/usr/bin/chromium ENTRY=qq61/board61 CID=TREE61 JPG=1 node scripts/frame.mjs stills /tmp/tree 0
```
This writes `f_0.0.jpg` through `f_21.0.jpg`; file N is shot N+1.

Files are in `episodes/61-zhongshen/`:
- storyboard.md
- facts.md

Files are in `tasks/ep61-storyboard/`:
- result.md
- out/research_facts.md
- out/research_icons.md
