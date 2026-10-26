# ep51 key frames: shared brief (two builders, in parallel)

The owner approved script v2 (hook B′) on 2026-10-26 11:31 and asked: "give me key frames". Make 15 key frames + a character sheet for 《古代没有冰箱，夏天怎么吃冰？》 in the **ep50 look (style B「漆」, night)**, to the ep50 key-frame standard. The owner checks every frame and catches mistakes (characters, facts, hands): no "gacha", every frame must pass the quality bar before you hand it back.

## Read first
- Script with picture notes per line: `/home/claude/video/episodes/51-bing/script.md` (v2). Timeline: `lines_read.json` (`[start, end, text, N|Q]`, `{…}` = gloss row, `[ ]` = highlight). Facts/props: `facts.md` (only ✓ rows on screen).
- ep50 reference (the target look, approved): `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/kf50/kf50_sheet.jpg` and KF01–KF13.png in that folder; code in `/home/claude/video/episodes/37-qiqing/remotion/src/qq50/`: `KF50.tsx` (key frames, LOOKS, ikArm, Carrier), `kit50.tsx` (Subs, Stamp, Counter, Walker, shop…), `styleB.tsx` (palette B/BG/thB, Lacquer, Vignette, Pool, RimFig, NearArm, curl, ScrollBand…), `master50.tsx` (Subtitles/StampLayer/CounterLayer/TitleCard plaque, Pillar wipes), `partB.tsx` (EndCard ~line 822). Rig: `src/qq44/figure44.tsx` (Figure4, Look4: dress/head options).
- Quality bar (mandatory): `/home/claude/video/docs/history-video-style/QUALITY_BAR.md`.

## The look (keep ep50's, add one accent)
- Dark lacquer ground, receding dark-on-dark sets with gold hairlines, one warm pool of light on the subject, vignette, the one-tone faceless walker with warm rim light (ep50 silhouette and gait; costumes change by era).
- **New accent for this film: ice = cool blue-white** (e.g. core `#EAF6FF`, body `#BFE3F2`, shade `#6FA9C4`, faint glow) — the only cool colour, and the cold thing in his hand is the brightest object in frame. Bronze/gold/silver/cream stay warm. Don't turn the whole frame blue; at most one cool pool where the story says so (K3 hall turning cool, C2 vault).
- Ice must read as ice at phone size: translucent facets, a bright edge, an inner highlight, crisp chisel marks; never a white rectangle.
- Hands: ep50 mitten hands / one-tone forearm (NearArm); no fingers outlined, no nails, no claws. Hands touch what they hold (ikArm). Feet on the ground.
- No faces, no brands/logos, no real-photo copies of museum pieces (draw generic, plain decoration), no maps, no tomb/bones.

## Furniture on every frame (as in ep50)
- Subtitle (layout D, top-left; Q lines and the end-card question centred), verbatim from `lines_read.json` with the quotes as curly “ ” (not ASCII). Q lines: row 1 in the period face + the `{gloss}` row (≥ 40 px). Highlight = cream with a gold underline.
- Stamp top-right (two lines, from the script's Stamp column; `〃` = keep line 1), counter bottom-left (era/year per the Counter column), red J seal bottom-right. Hidden where the script says (rewind, title, 先猜？, end card).
- Phone-safe: corner items ≥ 120 px from the sides, ≥ 58 px from top/bottom; nothing important in the right ~200 px column except the stamp/seal.
- Labels/tags that carry meaning ≥ 40 px; big numbers ≥ 96 px with ≥ 56 px labels on a dark panel.

## The frames (time = film seconds; render the frame as the film would look at that time)
| KF | t | Line | What must be in it | Builder |
|---|---|---|---|---|
| CHARS | — | — | Character sheet: the walker in 周 padded winter robe (bun), 战国 robe, 唐 round-collar robe + 幞头, 北宋 short tunic + soft 幞头, 清 robe (a simple Qing cap/queue silhouette, respectful), today jacket; plus the Zhou officials with tallies, a labourer hauling a block, the Tang noble, the Song vendor, the Qing clerk at the cellar window, the 酸梅汤 seller with two brass bowls. Labels as in ep50's sheet. | A |
| KF01 | 0.0 | H1 | **Frame 0** (must read in 2 s on a phone): first person, your one-tone forearm pulling open a generic white fridge (no brand), iced drink in the other hand; inside, in place of shelves, the square bronze 鉴缶 (basin with an inner jar, plain bronze, warm rim, the brightest thing). Fridge's cold light on. Row 1 subtitle visible; counter 2026. | A |
| KF02 | 2.9 | H1 [不会冷] | Same shot one beat later: the fridge's light is dead (dark interior), the vessel keeps its warm rim and stays the brightest thing; row 2 typed with 不会冷 highlighted; counter spun to 战国早期; stamp 战国早期 · 湖北随州 / 曾侯乙墓的铜鉴缶. | A |
| KF03 | 9.0 | H3 end of rewind | Frozen river at night, snow, the ice block on the ice, the walker revealed (周 winter robe) with a chisel resting on it. Counter 周. No stamp. | A |
| KF04 | 11.0 | TITLE | The ep50 plaque 「古代没有冰箱 / 夏天怎么吃冰？」 above the walker on the frozen river, snow drifting. No subtitle, no stamp. | A |
| KF05 | 19.5 | Z1 row 2 | By the dark pit mouth (label 冰窖): two robed officials with bamboo tallies checking blocks in, a file of tiny labourers hauling blocks on ropes, tag 「干活的 × 80」 (countable small crowd). The walker passing. | A |
| KF06 | 22.5 | Z3 | Three blocks side by side in the pit, tag 「×3」, a small 「？」 hanging over them (it will pay off at C3). | A |
| KF07 | 33.5 | J3 | Banquet room, the 鉴缶 on a low stand in a **section cut**: the outer square basin 鉴, the inner square jar 缶, the ring of ice in the gap (blue-white), frost on the bronze, small arrow to the gap, labels 「鉴 · 盆」「缶 · 罐」 (≥ 56 px). The walker packing the block. | A |
| KF08 | 36.0 | 先猜？ | Same room, no subtitle, no stamp: prompt 「先猜？」 by the jar, three options over the jar mouth 肉？ · 瓜果？ · 酒？ (≥ 44 px, one baseline). | A |
| KF09 | 48.0 | Q3 | Tang summer banquet: a big carved translucent ice mountain among the mats, guests leaning back from its mist, two craftsmen chipping its peaks; centred classical line + gloss. Counter 唐. | B |
| KF10 | 61.5 | S3 [银器] | Song street, June day: blue cloth umbrellas along the road, the best stall where every vessel is silver; the walker handed a silver bowl of 冰雪 — the silver glint is the brightest thing in the film so far. Counter 北宋. | B |
| KF11 | 65.0 | Q4 | Night, frozen Qing city moat below a vermilion wall: workers' silhouettes chiselling in a row, ice sparks; the walker (清 robe) mid-swing. Centred classical + gloss. Counter 清. | B |
| KF12 | 75.0 | C3 | Inside the half-underground vault (section: floor ~¼ wall height below the street line, wall drawn 2 m thick with a 「两米」 dimension line): the stack shrunk, the gauge at ~⅓ with 「约2/3 化掉」 still visible, and the three Zhou ghost blocks from KF06 with two melting away, one staying, the 「？」 popping; [一份] highlighted. | B |
| KF13 | 92.0 | K2 | Hot summer palace hall: a cloisonné box on a stand (blue enamel, gold wire, generic pattern), lid with coin-shaped holes, cold breath curling out of each hole; section hint of ice inside; the walker beside it. Counter 清 · 乾隆. | B |
| KF14 | 100.0 | M2 | Night village: a grid of 100 small house windows under roofs, exactly 1.22 lit by a fridge's cold light (one window + a sliver); big panel 「农村 · 每百户 1.22 台」 (≥ 96 px numeral). Counter 1990. Walker in the modern jacket. | B |
| KF15 | 107.5 | P1 | The pull-back: the whole walk as one line left → right with each cold thing where he left it (冰块 → 鉴缶 → 冰山 → 酥山 → 银碗 → 冰票 → 酸梅汤 → 珐琅冰箱 → 冰箱), props ≥ 100 px, snow falling inside each on [冬天]. Counter 2026. | A |
| KF16 | 115.0 | END | Juno end card over the dimmed P2 shot (today's fridge frosting by itself): red J stamp, title 「古代没有冰箱 / 夏天怎么吃冰？」, the question 「你家冰箱里，现在冻着什么？」 centred one row ~76 px (trailing ？ ½-em centring rule), pill 「关注 Juno · 一起看懂世界」, sources line from script.md. No counter/stamp/seal. | A |

## Files (do not edit each other's files or anything in qq50/)
- Folder: `/home/claude/video/episodes/37-qiqing/remotion/src/qq51/`.
- **Builder A:** `props51.tsx` (fridge, 鉴缶 incl. section view, ice block, chisel, cup, snow, frozen river — A owns it; B may import it but must not edit it), `KF51A.tsx` with registerRoot and compositions `KF51A-ALL` (frame i = CHARS, KF01…KF08, KF15, KF16) and one id per frame.
- **Builder B:** `KF51B.tsx` (+ `partsB51.tsx` if wanted) with registerRoot, `KF51B-ALL` (KF09…KF14) and one id per frame. Import from qq50 / qq44 / props51 freely; if you need a changed version of something, copy it into your own file. Build your own ice-block drawing to the accent spec above until `props51.tsx` exists, then switch to A's `IceBlock` if it fits (check for it, don't wait).
- Stills, run from `/home/claude/video/episodes/37-qiqing/remotion`: `ENTRY=qq51/KF51A CID=KF51A-ALL BUNDLE_DIR=<your own dir under the scratchpad> REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node scripts/frame_ms.mjs stills <outdir> <t…>` (t in seconds at 30 fps: frame i = i/30; add `JPG=1 SCALE=0.5` for quick looks). Final PNGs at full 1920×1080 to `/tmp/claude-0/-home-claude/bf206d1e-1152-5595-9b84-b15be6e5a777/scratchpad/kf51/` named `CHARS.png`, `KF01.png` … `KF16.png`.
- Typecheck: `npx tsc --noEmit -p .` (ignore errors in other episodes).
- Disk is tight (~4.5 GB free): one bundle dir each, delete it when done. Never `pkill -f` a pattern from your own command line. Don't commit.

## Before handing back
- Look at every frame at full size and at 25 % (phone) against QUALITY_BAR.md and against the ep50 sheet: same family, same walker, same furniture. Fix anything weak; don't hand back a frame you wouldn't show the owner.
- Hand back: a short list (frame → what's in it → anything unsure), and the PNG paths. Budget about 70 minutes.
