# 林冲 · art log (image-model design references)

Date: 2026-11-08. Model: Z-Image-Turbo (HF MCP `gr1_z_image_turbo_generate`), steps 9, shift 3, `random_seed: false`
with the seeds below, so you can regenerate any image exactly. Images live in `/dev/shm/shz01/art/` only. None are
committed, because the repo is public.

**Scope change (coordinator, mid-task):** the characters in the film are drawn in code (vector, rigged). These
paintings are **design references to trace**, not final frames. Painting of the 33 storyboard shots stopped after 6.

## Files

| File | What | Seed | Size |
|---|---|---|---|
| `ref_linchong_A_front.png` | 林冲, 东京 look, front, neutral A-pose | 7003 | 864×1536 |
| `ref_linchong_A_side.png` | 林冲, 东京, strict profile (**faces left**) | 7005 | 864×1536 |
| `ref_linchong_A_threequarter.png` | 林冲, 东京, 3/4 (bonus) | 7003 | 864×1536 |
| `ref_linchong_C_front.png` | 林冲, 沧州 look (毡笠, cloak), front | 7003 | 864×1536 |
| `ref_linchong_C_side.png` | 林冲, 沧州, profile (**faces left**) | 7005 | 864×1536 |
| `ref_linchong_face_front.png` | face close-up, front, neutral | 7003 | 1104×1472 |
| `ref_linchong_face_profile.png` | face close-up, near-profile (about 80°: the far eye peeks) | 7007 | 1024×1024 |
| `ref_linchong_face_profile_strict.png` | strict profile head, cropped from `ref_linchong_A_side` and upscaled 3× (soft) | — | 1080×1080 |
| `ref_wife_front.png` | 娘子 front (face shown small, reference only) | 7101 | 864×1536 |
| `ref_wife_threequarter.png` | 娘子 3/4 (the model would not give a true profile) | 7101 | 864×1536 |
| `ref_gaoyanei_front.png` | 高衙内 front | 7201 | 864×1536 |
| `ref_gaoyanei_threequarter.png` | 高衙内 3/4 (hands inside the sleeves) | 7202 | 864×1536 |
| `ref_luqian_front.png` | 陆谦 front (the model's frame border painted out) | 7301 | 864×1536 |
| `ref_luqian_threequarter.png` | 陆谦 3/4 | 7202 | 864×1536 |
| `chars.jpg` | contact sheet of all the refs above | — | 1968×1930 |

Storyboard key frames painted before the stop (kept, not continued): `shot_S01.png`, `shot_S02.png`, `shot_S03.png`,
`shot_S04.png`, `shot_S05.png`, `shot_S26.png` (1536×864).

Early explorations (semi-realistic look, before the vector scope), in `explore/`: `lin_face_calm / restrained / fury /
grief.png` (one face, four expressions, seed 2202), `lin_A_front.png` and `lin_A_side.png` (2204), `lin_B_front.png`
(convict look **with a correct cangue**, 2207), `lin_C_try.png` (2213, rejected: a second spear and an oversized gourd).

## Style prompt (reference sheets, appended word for word)

> Flat 2D vector illustration, Chinese guofeng manhua style, clean confident dark brown outlines, flat colours with simple
> two-tone cel shading, elegant muted palette, handsome. No text, no watermark.

Opening frame for every full-body sheet:

> Costume design plate for an animated film, full body front view of one very tall man standing in a neutral relaxed pose
> with both arms held slightly away from his sides, hands open, feet slightly apart, the whole figure inside the frame
> with clear margin, on a plain flat light background #F4EFE6, no props. Realistic adult anatomy, 7.5 heads tall like a
> classical figure drawing, small head, long legs, broad square shoulders.

Side views replace the first sentence with:

> Costume design plate for an animated film, full length strict profile view: one very tall man turned 90 degrees to face
> the right edge of the frame, we see only his left side, his face in pure profile with only one eye visible, standing
> upright in a calm neutral pose, arms relaxed with the near hand open a little in front of the hip, the whole figure
> inside the frame with clear margin, on a plain flat light background #F4EFE6, no props.

"Costume design plate … 7.5 heads tall like a classical figure drawing" was the phrase that fixed the proportions.
"Character turnaround / flat vector" alone gave 5.5–6 heads (seeds 7001, 7002 rejected).

## Fixed character descriptions (reused word for word)

- **林冲 face:** Lin Chong, a 35-year-old Song dynasty imperial spear instructor, a handsome mature man with a lean face and
  sharp refined features: strong square jaw, high cheekbones, straight nose, sharp slightly round eyes with dark irises,
  thick sword-like black eyebrows, a thin black moustache and a pointed black goatee, light stubble along the jaw
- **林冲 A (东京):** black hair tied up in a topknot under a black gauze headscarf with two short stiff tails behind, two
  small white jade rings at the back of his head. He wears a fitted dark green round-collar silk robe with narrow sleeves
  and gold round flower medallions, reaching to mid-calf, a red-brown sash at the waist, leg wrappings and black boots.
  Neutral calm expression.
- **林冲 C (沧州):** Lin Chong in winter exile … a small patch of abstract dark dotted marks on his left cheek. On his head a
  pale felt hat with a low rounded crown that fully covers his hair and a broad round brim, tied under the chin with a
  red cord. He wears a brown padded cloak over the shoulders, open at the front over a dark navy coat with narrow sleeves
  and a dark sash, dark trousers with leg wrappings and black boots.
- **林冲 B (convict, explorations only):** plain dark head cloth, plain off-white coarse cloth convict tunic, dark trousers,
  straw sandals, a small patch of abstract dark dotted marks on his left cheek. **Cangue phrase that works:** "He wears a
  cangue: a big flat rectangular wooden board with rounded ends fitted around his neck like a wide wooden collar, his neck
  passing through a round hole in the board, the board lying flat and horizontal on his shoulders like a small table top,
  extending well beyond both shoulders, dark iron plates on both ends, a white paper seal strip pasted across it." (Seen
  from slightly above. Seen from behind, it still turns into a pole.)
- **娘子:** Madam Zhang, Lin Chong's wife, a 25-year-old Song dynasty woman with a gentle oval face, calm almond eyes, fine
  eyebrows, black hair gathered into a high bun with one gold hairpin. She wears a long pale lotus-pink beizi jacket open
  at the front with narrow sleeves over a white inner top, and a long white pleated skirt reaching the floor, small
  embroidered shoes just visible. (Realistic adult proportions about 7 heads tall, graceful and delicate.)
- **高衙内:** Gao Yanei, a spoiled young Song dynasty nobleman about 25, pale smooth face, half-lidded arrogant eyes, thin arched
  eyebrows, a faint smug smile with one corner of the mouth raised, black hair in a topknot under a small black cap with a
  pink peony flower pinned to it. He wears a rich magenta-purple silk round-collar robe with wide sleeves and a faint gold
  pattern, a jade belt, black boots.
- **陆谦:** Lu Qian, a Song dynasty officer about 35, a neat oval face, narrow eyes, a thin black moustache and a bare chin, a
  polite warm smile, black hair under a neat black futou cap with two short soft tails at the back. He wears a dark violet
  round-collar robe with narrow sleeves, a black belt, black boots.

## Reference prompts and seeds (the kept images)

- `ref_linchong_A_front`, seed 7003: front opening + 林冲 face + A + style.
- `ref_linchong_A_threequarter`, seed 7003: "Costume design plate for an animated film, full length side view of one very
  tall man facing right, standing upright in a calm neutral pose, arms relaxed with the near hand open a little in front
  of the hip, …" + face + A + style. (Asked for a side view; got 3/4.)
- `ref_linchong_A_side`, seed 7005: side opening + face (profile wording: "a lean face in profile: strong square jaw,
  straight nose, sharp eye, thick sword-like black eyebrow …") + A + style.
- `ref_linchong_C_front`, seed 7003: front opening + face + C + style.
- `ref_linchong_C_side`, seed 7005: side opening + profile face + C ("broad round brim tilted slightly forward") + style.
- `ref_linchong_face_front`, seed 7003, 3:4: "Character face reference, close-up of the head, neck and top of the shoulders,
  straight-on front view, perfectly centred and symmetrical, on a plain flat light background #F4EFE6." + face + A (collar
  only) + "Neutral calm expression, looking straight at the viewer, mouth closed." + style.
- `ref_linchong_face_profile`, seed 7007, 1:1: "Character reference, half-length portrait in strict profile like a figure on
  an ancient coin or a shadow puppet: one man seen exactly from the side, facing right, his nose pointing at the right
  edge, only his left eye and left ear visible, the back of his skull and his neck fully drawn …" + face + A + style.
  Seeds 7003, 7005 (English) and 7006 (Chinese, 正侧面) all came out 3/4.
- `ref_wife_front`, seed 7101: front opening (woman, feet together, "about 7 heads tall, graceful and delicate") + 娘子 +
  "Neutral calm expression." + style ("beautiful").
- `ref_wife_threequarter`, seed 7101: side opening (woman) + 娘子 + style. Seeds 7005 and 7102 (Chinese) also gave 3/4.
- `ref_gaoyanei_front`, seed 7201: front opening ("young man … about 7 heads tall, a little narrow-shouldered") + 高衙内 +
  style.
- `ref_gaoyanei_threequarter`, seed 7202, Chinese: "动画服装设定图，全身正侧面（身体和脸完全转向画面右侧，纯侧面，只露一只眼睛），一名男子自然站立，
  手臂自然下垂，全身完整在画面内，四周留白，纯色浅米色背景，无道具。成年男子比例约七头身，肩膀略窄。高衙内，北宋权贵家的公子，约二十五岁，脸白净，
  眼皮半垂显得傲慢，细挑的眉毛，嘴角微微上扬，黑发束髻，戴黑色小冠，冠上插一朵粉色牡丹花。穿华贵的品红紫色圆领丝袍，宽袖，腰系玉带，黑靴。
  扁平二维矢量插画，国风漫画风格，干净利落的深棕色线条，平涂色块加简单两层赛璐璐阴影，雅致的色调。没有文字，没有水印。"
- `ref_luqian_front`, seed 7301: front opening ("one man … medium build") + 陆谦 + style.
- `ref_luqian_threequarter`, seed 7202: the same Chinese side template with 陆谦's description.

## Storyboard key frames painted before the stop (seed: notes)

Frame style suffix: "Chinese guofeng illustration, semi-realistic manhua, high-end 2D animated feature key frame, fine
clean ink lineart with varied line weight, flat colours with two-tone cel shading and a soft rim light, elegant limited
palette, cinematic composition with foreground, midground and background depth. No text, no watermark. Not painterly,
not 3D, not photorealistic, not chibi."

- **S01** (103): a 50° insert of the portrait 休书 on the table. Ruled blank columns (code adds the L8 text). A crisp
  vermilion right-hand palm print, the hand lifting with five fingers, the brush laid on the paste dish, lattice daylight
  from the top left. Weak: the brush rests on the red paste dish, not the inkstone; the sleeve reads slate rather than
  off-white. Rejected: 101 (pen-style grip, pseudo-glyph signature, drippy print) and 102 (faint pseudo-characters).
- **S02** (204): OTS behind her; her hands hold the backlit sheet, thumbs in front; the tear lands on the upper right. Only
  her ear and jaw edge show, no features. 林冲 is left out (the model could not put the cangue on him behind the paper:
  201–203 rejected).
- **S03** (302): CU 3/4 with the cangue board around his neck (iron bands), wet red-rimmed eyes, a doorway rim light. **The
  wife's profile at the left edge was blurred in post** (Gaussian r22 over x < 300) so her face cannot be read.
- **S04** (403): WS from inside the tavern door. She has sunk to the threshold, seen from directly behind. He is led away
  down a summer street between guards, no snow. A pseudo-text shop sign was blurred out in post. Weak: from behind, the
  cangue reads as a pole; he is not looking back.
- **S05** (501): the title background on paper: the ink silhouette in 毡笠 with spear and gourd on the right third, the
  left two-thirds clear for 「林冲」. A strong frame.
- **S26** (2601): EWS snow night with a tiny figure, spear and gourd, footprints back to a faint fire glow, 梁山 silhouette
  on the right. A strong frame. No falling snow, which suits the Canvas snow layers. The figure is ≈ 27 % of frame
  height (spec 15 %).

## What I could not get right, and notes for tracing

- **True profiles:** the model gave a strict profile only for 林冲 (both looks, facing left). For the wife, 高衙内 and 陆谦
  it always drew 3/4 (6 attempts across seeds and languages). They are saved as `_threequarter`. Mirror the 林冲 side
  views if you need them facing right; the round-collar robe's shoulder fastening will flip.
- **Proportions:** measured on `ref_linchong_A_front`: skull top ≈ y175 (estimated under the headscarf), chin y335, soles
  y1468, ≈ 7.6–8 H. The A side view is ≈ 8 H. The wife ≈ 7.1 H, 高衙内 ≈ 7.2 H, 陆谦 ≈ 7.0 H. The wide 东京 sleeves make
  the shoulders read ≈ 2.4 H wide; trace the shoulder line at 1.95 H from model_sheet §2, not the sleeve silhouette.
- **陆谦 looks too much like 林冲** (same cap shape, and the model added a small chin tuft both times despite "bare chin").
  When tracing, drop his chin tuft and keep the moustache only; 林冲's long pointed goatee and 陆谦's violet robe and soft
  futou tails then separate them.
- **毡笠:** the crown came out peaked (conical) rather than a low dome; the brim ≈ 3 face widths (spec 2.9). The red chin cord
  is thin and partly brown.
- **Jade rings:** the model draws one ring on the topknot instead of two rings behind the head (第七回 「脑后」). Place them
  per model_sheet §5 when tracing. (The producer brief said "at the temples"; the novel and the model sheet say behind
  the head. I followed the novel.)
- **Convict tunic colour:** I followed the producer brief (off-white), not the colour script's slate #3B4356. The art
  director should confirm which.
- **高衙内's robe pattern** has faint glyph-like squiggles; trace it as a plain robe or a simple roundel pattern.
- **Spear + gourd prop sheet:** not made (the brief asked for no props overlapping the body). The prop reads correctly in
  `shot_S05` and `shot_S26`.
- **Content filter:** the HF space returned a "maybe not safe" placeholder for about 20 harmless prompts (full-body
  characters especially; seemingly random, sometimes on the same text that passed at another aspect ratio). Rewording
  or changing the seed got past it; nothing kept was affected.

## Side cast in 林冲's style (cast v4, 2026-11-08)

The owner asked for the side cast in the same style and quality as 林冲 ("just make them really relevant"): they stay
subordinate through staging only. References regenerated with HF Z-Image-Turbo, 864x1536 (9:16), steps 9, shift 3,
saved as `/dev/shm/shz01/art/ref_<name>.png` (not committed). Each prompt = the art_log opening + description + the
style prompt above, word for word. Traced by `film/cast/v4/build/trace_cast.py` → `film/cast/v4/data/*.json`.

| file | seed | prompt (opening + description) | notes |
| --- | --- | --- | --- |
| ref_gao_front | 7201 | art_log 高衙内 front prompt | as logged above |
| ref_gao_tq | 7202 | art_log 高衙内 Chinese side template | 3/4 facing right, hands in sleeves |
| ref_lu_front | 7301 | art_log 陆谦 front prompt | thin painted frame, erased before tracing; chin tuft inpainted (moustache drawn in code) |
| ref_lu_tq | 7303 | English side opening with "one man of medium build" + 陆谦 description | the Chinese side template hit the safety placeholder on seeds 7202 and 7302; came out 3/4 facing right with a frame |
| ref_wife_back | 7103 | "full body back view of one young woman seen from directly behind … her face not visible at all, we see the back of her head with a high bun and one gold hairpin … about 7 heads tall … graceful and delicate" + 娘子 hair/clothes + style ("beautiful") | her face is never shown, so the 7101 front / 3/4 plates were not used |
| ref_wife_back34 | 7105 | "seen from behind and slightly from her left side, her head turned away from us so that her face is completely hidden, we see only the back of her head, her hair bun and the edge of her ear" + same | 7104 showed her face (rejected) |
| ref_zhang_front | 7401 | front opening with "one old man … about 7 heads tall like a classical figure drawing, small head, slightly stooped." + "Zhang Jiaotou, Lin Chong's father-in-law, a kind retired Song dynasty arms instructor about 60, a lined gentle face, kind narrow eyes with crow's feet, grey eyebrows, a long grey beard and a grey moustache, grey hair in a topknot under a plain dark brown cloth head wrap. He wears a plain brown round-collar cotton robe with wide sleeves reaching to the ankles, a dark sash, black cloth shoes." | slight 3/4 |
| ref_zhang_tq | 7402 | Chinese template: 动画服装设定图，全身正侧面（身体和脸完全转向画面右侧，纯侧面，只露一只眼睛），一名老人自然站立，手臂自然下垂，全身完整在画面内，四周留白，纯色浅米色背景，无道具。成年男子比例约七头身，背微驼。张教头，林冲的岳父，北宋退休的教头，约六十岁，慈祥的脸上有皱纹，眼角有鱼尾纹，细长温和的眼睛，灰白的眉毛，留灰白长须和灰白胡子，灰白头发束髻，裹素色深棕布巾。穿朴素的棕色圆领布袍，宽袖，长及脚踝，系深色腰带，黑布鞋。+ 扁平二维矢量插画，国风漫画风格，干净利落的深棕色线条，平涂色块加简单两层赛璐璐阴影，雅致的色调。没有文字，没有水印。 | 3/4 facing right; grey topknot shows |
| ref_scribe_front | 7501 | front opening with "one thin man … about 7 heads tall … small head, long legs." + "A hired letter-writer of the Song dynasty, a modest thin man about 45, a plain narrow face, calm small eyes, thin eyebrows, a small neat moustache, black hair under a small round black cap. He wears a plain grey cotton robe with wide sleeves reaching to the ankles, a grey sash, black cloth shoes." | |
| ref_scribe_tq | 7502 | English side opening with "one thin man" + same description | 3/4 facing left, frame erased |
| ref_guard_front | 7601 | "Costume design plate for an animated film, full body front view of one strong man standing in a neutral relaxed pose, his left arm held slightly away from his side with the hand open, his right hand holding one long wooden staff upright beside him, feet slightly apart, the whole figure and the whole staff inside the frame with clear margin, on a plain flat light background #F4EFE6. Realistic adult anatomy, 7.5 heads tall like a classical figure drawing, small head, long legs, broad square shoulders. A Song dynasty prisoner-escort guard about 30, a hard square face, narrow suspicious eyes, thick short eyebrows, dark stubble, black hair under a black cap with a small red knob on top. He wears a black-grey knee-length tunic with narrow sleeves, a red cloth belt, dark trousers with leg wrappings and black boots; the staff is painted half red and half black." | staff came out all dark red; the lower half is recoloured black in code (水火棍) |
| ref_guard_tq | 7602 | English side opening, "walking forward with a long stride, his near hand holding one long wooden staff upright" + same description | 3/4 walking facing right |

Tracing notes: the model draws heads 11–39 % larger than 林冲's (by 林冲's own ratio, eye line → chin = 0.443 head), so
`traced.mjs` scales the head through a graded neck (s ≥ 0.84) and lengthens the lower legs to 7.5 heads (张教头 and the
wife 7.0). Painted eyes, brows, moustaches and chin tufts are inpainted; faces are drawn with 林冲's face construction
(`film/cast/v4/face.mjs`). 张教头 keeps the traced grey beard, moustache and brow tails.

## Background plates for the texture test, route B (2026-11-08)

The owner asked for clearly more texture and detail in sets and props. Route B tests AI-painted empty-set plates traced into flat
vector layers (`film/tex_demo/trace_plates.py`, the rig's `tracelib`), placed by `film/tex_demo/hooksB.mjs`. HF Z-Image-Turbo,
2048x1152 (16:9), steps 9, shift 3, `random_seed: false`. Saved as `/dev/shm/shz01/art/bg/<name>.png` (not committed).
Style suffix = the reference-sheet style prompt above, word for word, **without "handsome"** (it is a character word and
could pull a person into an empty set).

| file | seed | prompt (before the style suffix) | notes |
| --- | --- | --- | --- |
| bg_tavern | 8101 | "Background plate for a 2D animated film, the empty interior of a small Song dynasty tavern by the city gate on a summer day, no people, eye-level straight-on view of the back wall: dark warm brown wooden plank walls, a bright open doorway on the right half with a short indigo cloth door curtain hanging from the lintel and white sunlit street glare outside, wooden wall shelves on the left with round clay wine jars sealed with red cloth and stacked ceramic bowls, a hanging wooden sign board beside the door, a heavy roof beam with simple wooden brackets across the top, a small clay oil lamp on the shelf, a low wooden counter in the lower left. Clear foreground, midground and background depth." | pseudo-text on the hanging sign (flattened, 酒 drawn in code); a modern hurricane lantern (inpainted, dish lamp drawn in code); 福 on the jars (flattened to red diamonds); roof tiles at the top cropped |
| bg_table | 8102 | "Background plate for a 2D animated film, top-down view looking straight down at an old dark brown wooden tavern table top made of wide horizontal planks, visible wood grain, knots, scratches, worn edges and two faint cup-ring stains, diagonal stripes of warm summer daylight and lattice-window shadow bars falling across it from the top left, the table is empty, nothing on it, no people, no paper, no objects." | the lattice light fell on the floor, not the table; cropped to the boards |
| bg_temple | 8103 | "Background plate for a 2D animated film, the empty interior of a small ruined mountain-god temple on a snowy winter night, no people, eye-level side view of the back wall: cracked old lime plaster walls with water stains and a broken carved cloud relief, a dim seated clay deity statue on an altar at the left with a faded red altar cloth, two red candles and a bronze incense pot full of ash on the altar, cobwebs under a heavy dark roof beam, a fallen wooden beam leaning against the wall, heaps of straw on the packed earth floor, a closed wooden plank door on the right with a thin vertical crack of cold blue moonlight and a little snow blown in at its foot. Dark, cold, moody, low light." | the statue came out Buddha/Guanyin-like, not a 山神; its door competes with the take's door prop |
| bg_courtyard | 8104 | "Background plate for a 2D animated film, high-angle view from above of the empty stone-paved front courtyard of a large Song dynasty temple on a sunny spring day, no people: the main hall across the top of the frame with red columns and lattice doors, a grey tiled double-eave roof with curling ridge ornaments and round tile ends along the eaves, a raised stone platform with carved stone balustrades and wide stone steps in the middle, tall red and yellow cloth banners on poles beside the steps, a big bronze tripod incense burner with grey ash on the left side of the courtyard, large square grey-beige paving stones filling the lower two thirds of the frame." | the plate's burner replaced by copied paving (the take keeps its 鼎); paving mirrored 420 px at the bottom; cooler grey than the colour script |

Tracing: mean-shift flattening, k-means palette (12–28 colours), mode filter, small-region merge, vtracer stacked splines,
centre-line ink. Far / mid / near split by polygons; each deeper layer is filled under the nearer ones so they can slide.
Big painted surfaces (walls, paving, the table top) posterise into blotches; fine plank and joint lines are mostly lost.
