# ep45 《马首回家，用了160年》 — handover (交接) for the polish chat

Written 2026-10-25 by the chat that built the demo/full cut. The owner considers v3 a **demo**; the other chat has since changed the layout and art style. This file lists everything this cut uses so you can keep the story, facts, timing and music and restyle the picture.

- **Repo:** `jayjiao-debug/Video` (public), working branch `claude/original-short-film-nhwy85`. Pull first, merge before every push (no amend, no rebase).
- **Status:** v3 delivered 03:05. Owner: "pretty good for a demo". Covers and the publish package are **not** made (only after the owner confirms the final).

---

## 1. What to keep vs. what is style-specific

| Keep (style-independent) | Replace freely (this cut's look) |
|---|---|
| facts.md, script.md (v4 table), lines.json timings | `qq45/kit45.tsx`, `sets45.tsx`, `skin45.tsx` (palette, sets, subtitle/stamp/counter skin) |
| The music bed + its landmarks (§4) | The look "铜版 · 午时" (hand-tinted engraving), `style/look.md` |
| The scene order, picture beats and transitions (§5) | Every scene's drawing code in `demo45.tsx` / `film45.tsx` |
| The logic rules from the reviews (§6) | |
| Counter logic (在家 12 → 回国 n → 回家 1/12) | The counter's dial design |

---

## 2. Files

### Episode folder `episodes/45-mashou/`
| File | What |
|---|---|
| `brief.md` | Owner's brief and constraints |
| `facts.md` | F1–F27 (+F8b), sources, corrections. Key corrections: the head lives at **正觉寺 · 文殊亭**, not its original site (海晏堂 is a ruin); 2007 was a **private sale before the auction** (HK$6910万, brokered by Sotheby's; the auction was stopped); 回国 7 vs 回园/回家 1; 2018 France dragon lot is disputed; F19 now cites NYRB for 佳士得 Paris 2009 |
| `script.md` | **Script v4 table at the top** = the current lines with times; v3 and v2.1 below for history |
| `lines.json` / `lines_v3.json` | `[start, end, text]` (film time, untrimmed); `[]` marks the key word |
| `lines_v3_meta.json` | Same with `id` and `kind` (`typed` / `cut` / `punch` / `stack` / `end`) |
| `plan45.py` | Line timing: anchors on music landmarks, the rest shared by reading need, snapped to the beat. Edit the `L` list → run → writes lines_v3*.json. Then regenerate `qq45/lines45.ts` (snippet in §7) and copy `lines_v3.json` → `lines.json` |
| `music/build45film.py` | Builds the film bed `ep45_film_bed.wav` (154.17 s, −14 LUFS) |
| `music/build45.py` | The old 0–34.5 s demo bed |
| `crew_log.md` | Everything that happened, with times |
| `notes_gate1_r1/r2.md`, `coldread_gate1.json` | Script gate notes |
| `notes_gate4_r1.md` | Director's full-cut notes (N1–N17) |
| `review/v1/` | Round 1: `REVIEW.md` (video reviewer), `animator_review.md`, `music_review.md` + `music_cuts.json` + scripts, `coldread_gate4.json`, `probe.json` |
| `review/v2/` | Round 2 on v2: `REVIEW.md`, `animator_review.md`, `auto_checks.md`, `evidence/edge_scan.py` (frame-edge scan, reusable) |
| `style/look.md`, `ep45_keyframes_v1/v2.jpg` | This cut's look (v2 approved by the owner on 2026-10-24) |

Contact sheets and evidence PNGs are **gitignored** (local only); re-make them with the reviewer scripts.

### Remotion code `episodes/37-qiqing/remotion/src/qq45/` (shares the ep37 Remotion project)
| File | What |
|---|---|
| `FILM45.tsx` | **Entry for the full film** (composition `FILM45`, 4625 frames @30): subtitles, `STAMPS` table (year · place · lines), counter logic `dialAt`, title slam at `TL.C7 + 3.395`, Juno end card (J monogram, gold title, pill, sources) |
| `film45.tsx` | All film scenes + `SCENES45` table (start time → scene) + `Cam` (clamped camera: never shows the canvas edge) + `Streaks` (whip pans) |
| `demo45.tsx` | Cold-open scenes S1–S9, `Rewind`, `PrivateRoom` (C4/D8), `Unveil` (C5/E2), `T45` beat times |
| `sets45.tsx` | Sets: sky, trees, 海晏堂, the zodiac pool (`Pool3`, `ZPos3` seat positions, arcs/ripple), 12 profile heads `ZHead3` (with name tags), `Courtyard` (正觉寺·文殊亭, doors/light/city/smoke), `Fire`, `Embers`, `SmokeCols`, `Kepi` |
| `kit45.tsx` | Palette, `HorseHead` (the hero: copper engraving, `curl` = folded near ear, `flip`, `glow`; collar bottom is local y 276 → place on a surface at `y = top − s·276`; origin ≈ eye; mouth ≈ local (−160, 194)) |
| `frames45.tsx` | Key frames + shared auction room (`AuctionRoom` with gavel blend `k`), seated `Bidders`, looks `LK` |
| `skin45.tsx` | Subtitle `Story`, `Punch` (size prop), `Stamp`, `Brand`, counter `Dial` (scale prop) |
| `pose45.ts` | Body logic for the shared figure44 rig: `grounded`, `seated`, `walkArms`, `phaseFor`, `jointAt`, registry `reg` for the checker |
| `lines45.ts` | Generated from lines_v3_meta.json |
| `EP45DEMO.tsx`, `KF45.tsx`, `KQ45.tsx` | Old demo / key-frame entries |

Figures use the shared rig `../qq44/figure44.tsx` + `kit44.tsx` (`Rimmed`, `Look4`). Don't edit figure44 (other episodes use it).

### Things that are NOT in the repo
- **BGM:** `episodes/41-sanqiannian/audio/bgm2.mp3` (owner's file, never commit). If your chat doesn't have it, ask the owner to attach it again and copy it there.
- **Film bed:** `ep45_film_bed.wav` is untracked. Rebuild: `cd episodes/45-mashou/music && python3 build45film.py` (needs bgm2.mp3 + `episodes/42-yiyi/music/build42.py`).
- **Note:** two bed wavs were committed by mistake earlier (commits 891382a, f2679f5) and later untracked. They are still in git history. Purging needs a force-push, which is the owner's call.

---

## 3. Renders and deliverables

| What | Where |
|---|---|
| HD upload master v3 (1080p, 12 Mbps, −14 LUFS, 153.63 s, md5 `268fb45e889bc7b10b73bbf9acfc2eb6`) | branch `deliver-mashou`, `parts/master.mp4.part00–04` (join in order); the owner's `.bat` is `get_MaShou_ep45_v3_HD.bat` (tools/hd_bat.py) |
| Picture-only renders (untrimmed, 154.17 s) | branch `render-output-mashou`: `ep45_film_v3.mp4.part00–01` (also v1, v2) |
| Render farm | branch `render-farm-mashou` (workflow `render.yml`, concurrency group `render-mashou`). Copy `src/qq45`, `qq44`, `qq42`, `qq` into the farm checkout, set `render.json` `{id, composition: "FILM45", start: 0, end: 4624, chunks: 20, output}`, push → ~23 min. Download: `gh api "repos/jayjiao-debug/video/contents/<name>.mp4.partNN?ref=render-output-mashou" -H "Accept: application/vnd.github.raw"`, then `cat` the parts |
| **Delivery trim** | Cut the **first 16 frames (0.533 s)** of picture **and** audio, so the film opens right on the first beat. Mux: `ffmpeg -i pic.mp4 -i ep45_film_bed.wav -filter_complex "[0:v]trim=start_frame=16,setpts=PTS-STARTPTS[v];[1:a]atrim=start=0.53333,asetpts=PTS-STARTPTS[a]" …` Then run `.claude/skills/production-crew/scripts/upload_master.py`, plus a 720p 2-pass ~1.3 Mbps chat file (≤ 28 MB) |

Local stills: `ENTRY=qq45/FILM45 CID=FILM45 REMOTION_BROWSER=<chromium> JPG=1 SCALE=0.5 node scripts/frame.mjs stills <dir> <secs…>`. Chromium comes from `npm i @sparticuz/chromium`; its `executablePath()` unpacks it to /tmp/chromium.
Body-logic check: `node scripts/check45.mjs` (STEP=0.1) → must print `POSE CHECK: PASS`. If you rename the entry files, update the imports in it.

---

## 4. Music (bgm2, cut with the ep42 scripts)

Grid: beat P = 0.56605 s, first downbeat 0.5688 → `B(k) = 0.5688 + (k−1)·P`. The bed = 4-bar intro looped twice (so the title lands on the first crash) + the ep42 "v2" cut. Bed v2 tweaks: −2 dB from 106.986 to the drop, breath −8 dB, −3 dB bookend ramped over the gap.

**Landmarks (film time, untrimmed — subtract 0.533 for the delivered file):**
title crash **18.115** · B section 20.947 (A1) · S2 **34.53** (noon) · S3 48.12 (B4) · **D2 hammer hit 57.175** · D4 hammer 63.97 (grid, not a music hit) · valley/808 75.29, **79.815** (D9 price), **84.344** (D11) · crash **88.87** (D12 hammer) · **stop hit 105.29** · silence 105.98–106.96 · re-entry 106.986 · lead-in 109.25 (H1a) · **DROP 116.04** · coda cut **125.10** · coda chords 128.16 / 131.64 / 134.98 · **dead STOP 136.088** · intro return **138.332** (K1) · **final hit 146.82** (K5 hammer) · end 154.18.

Owner-rule risk: the bed loops, inserts a silence, a dead stop and a restart. Older owner notes forbade cutting the BGM like this, and the owner has only heard the demo bed. **Ask the owner** if the music changes. A soft gavel-knock SFX on the hammers is also an open question for the owner.

---

## 5. Scene list (film time, untrimmed) — the picture beats

| Start | Line(s) | Picture | Code |
|---|---|---|---|
| 0.00 | C1 假如说，你是圆明园的马首。 | You in a museum case, copper glow on frame 0, light sweep, eased push | `F_S1` |
| 3.40 | C2 1860年，你被抢走， | A soldier carries you off in smoke; your stone seat empty | `S2` |
| 5.66 | C3 在伦敦，被拍卖， | London auction, hammer on the beat | `S3` |
| 7.93 | C4 又被人花6910万买下， | **Private room**: Ho at a desk, card 「私下成交 HK$6910万」 (fixed price, no count-up, no paddles) | `S4` / `PrivateRoom` |
| 10.19 | C5 又被捐了出去。 | Unveiling: cloth pulled off, receiver claps | `S5` / `Unveil` |
| 12.46 | C6 2020年，你回家了。 | 正觉寺·文殊亭 courtyard, doors open | `S6` / `Courtyard` |
| 14.72 | C7 可十二个里，还有五个没回来。 (punch) | Twelve niches, pull back; counter 回国 7 | `S7` |
| 17.55 | — | Rewind, each flash labelled with its year (2026 → 乾隆年间) | `Rewind` |
| 18.115 | title 马首回家，用了160年 | Title slams on the crash | `S8` + FILM45 |
| 20.95 | A1 乾隆年间，你由红铜一次铸成。 | A founder pours, the mould is broken off, you on its base (head ≈ ¼ of his height) | `S9` |
| 24.91 | A3–A6 (水池两边 / 谁就喷水 / 你是午时) | Fountain at 海晏堂; hours go round one spout at a time; 「水力钟」 label; push to you; **only you spout during 你是午时** | `F_A3` |
| 34.53 | A7 正午十二点，十二个一起喷水。 | All twelve spout on the downbeat (ripple from you in the last 0.2 s) | `F_A7` |
| 40.19 | B1 英法联军进了园子 | Soldiers enter on the **front flagstones** (never on the pool) | `F_B1` |
| 43.59 | B2 …然后一把火。 | Looters carry crate/vase; **fire behind 海晏堂 on 一把火 (45.29)**, embers | `F_B2` |
| 48.12 | B4 你被带走了，不知去了哪。 | A looter lifts you with both hands and walks off; then the other seats empty **in step with the counter** (12 → 0); tilt up into smoke | `F_B4` |
| 52.08 | D1–D2 1989 London… 锤子落下… | Tilt down from the ceiling; bidding alternates on the beat; hammer at **57.175** | `F_D1` |
| 59.44 | D3–D4 牛、猴、虎… 买回中国 | Whip pan in; heads set down one per beat (with name tags); bidding war; hammer 63.97 | `F_D3` |
| 66.23 | D5 何鸿燊，买回了猪首。 | Handshake (pumping), pig head on a crate | `F_D5` |
| 69.63 | D6–D7 2007… 锤子没有落下。 | Gavel resting → lifts slow→fast, trembles; room dims; **撤拍**; no paddles; push into you | `F_D6` |
| 75.29 | D8–D9 拍卖前…买下了你：6910万港元。 | Opens close on you; Ho walks in and signs at the desk; card rises on 79.815; big punch (132 px) | `F_D8` |
| 81.51 | D10 比上一次，贵了二十多倍。 | Two bars in USD, 「二十多倍」 bracket, ≈6910万港元 note | `F_D10` |
| 84.34 | D11–D13 Paris 2009 … 3149万欧元 … 拒绝付款 | Rat + rabbit; hammer on 88.87; result board on an easel; 未付款 stamp | `F_D11` |
| 93.40 | D14 4年后…送回。 | Certificate handed over in front of rat + rabbit; whip out | `F_D14` |
| 96.80 | E1 2007到2019年，你在港澳展出。 | Whip in; museum hall; one visitor stops to look, two walk past | `F_E1` |
| 99.63 | E2 2019年，何鸿燊把你捐给国家。 | Unveiling at 国博; dims to the spotlight | `F_E2` |
| 102.46 | E3 2020年5月，他去世了，98岁。 / E4 punch | Armchair room, lamp switches on; **lamp off on 105.29**; star in the window; push into the star from 106.986 | `F_E3` |
| 109.25 | H1a 2020年12月1日， | The star becomes the glowing crate; truck tracked with parallax, night → dawn; stops at the 圆明园 gate (114.91) | `F_H1a` |
| 116.04 | H1b–H5 你回到圆明园 / 160年 / 七个 / 只有你 / 唯一幸存 | One courtyard: doors open on the drop + copper light; push in; H3 six returned heads gather (tagged); **H4 they fly to 保利艺术博物馆 (4) / 国家博物馆 (2)** behind the wall, counter pops 回国 7 · 回家 1; H5 pulled back, old smoke beyond the wall fades | `F_H1b` |
| 131.64 | H7–H8 耳朵卷了 / 一路被撞过 | Big head, push into the **folded near ear** (far ear straight); ring closes on the dead stop 136.088, light narrows; bloom | `F_H7` |
| 138.33 | K1–K4 noon memory / 十一个 / 五个 | Sepia memory of the fountain; the eleven go; five dashed outlines (龙蛇羊鸡狗); stamps say 12:00 · 正午 (not 今天) | `F_K1` |
| 146.25 | K5 2018年，法国拍出疑似龙首， / K5b 真假，说不清。 | Opens with the gavel up and a paddle raised; strike on 146.82 + shake; flickering dragon outline with a 「?」 | `F_K5` |
| 151.36 | Q 如果找到了，该花钱买回来吗？ | Juno end card: gold title, question, J ring + follow pill, sources | `F_Q` + FILM45 `EndCard` |

Counter: 在家 12 (A section) → B4 empties with the seats → 回国 0 → 3 (D4) → 4 (D5) → 5 (D9) → 7 (D14) → second row 回家 1/12 from H4 (pop) to the end. Ear: straight before 1860, folded from 1989 on (`curl` default 1; pass `curl={0}` in the pool, the casting and C2).

---

## 6. Logic rules learned from the reviews (keep whatever the style)

1. **No live auction for 2007.** No paddles, no LOT count, no gavel strike; the price must not count up (that reads as bidding).
2. **Counter = picture.** Never drain the counter while heads are still visible on their seats.
3. **True scale.** The head is about ¼ of a person's height, including in the casting scene and in doorways.
4. **Feet on real ground.** Nobody walks on the pool water or through the plinths. Sort figures by depth.
5. **Hands on props.** Ladle, cloth, certificate, crate and head all sit at the hand joints. Arms raised from the shoulder (paddles in front of the face, never sprouting from the crown).
6. **Nothing pops.** The horse leaves its seat because someone lifts it. Walk → stand transitions keep the hips in place.
7. **The spout faces the pool and comes from the mouth.** During 你是午时 only you spout.
8. **1860 soldiers** wear a kepi/forage cap, not a top hat, fedora or baseball cap.
9. **Today vs memory.** 海晏堂 is a ruin today; the intact fountain only appears as the past or a memory (stamp 「12:00 · 正午」, never 「今天」 over it). You live at 正觉寺, not next to the ruins.
10. **No canvas edges.** Every camera move stays inside the set (the clamped `Cam`). Re-run `review/v2/evidence/edge_scan.py`.
11. **No white flashes on cuts.** Use copper light from the doorway.
12. **No frozen frames,** especially during the silences (105.98–106.96 and 136.09–138.33). Keep one living motion.
13. **Motivated transitions** between rooms (whip pan, match on a head, star → crate light, smoke tilt, bloom). The cold-open hard cuts are the format and stay.
14. **Subtitle-only, top-left, key word in the accent colour; stamps top-right; counter bottom-left.** Keep props and walkers out of those boxes. Labels ≥ 40–44 px.

---

## 7. Open issues (from round-2 reviews, not fixed in v3)

- **Zodiac heads** (牛, 猴, 虎, 猪 especially) are simple brown profiles that read as blobs up close. They need the same quality pass as the horse. The head order in the fountain may not match the sources.
- The auctioneer's hand reads as a claw (shared figure44 hand).
- The counter overlaps bidders' legs in the auction rooms and the plinths in K1/K5. The E3 window frame runs behind the date stamp. A fountain arc crosses the 「1」 of 160 in the title.
- At H3 the six returned heads float as glowing spirits around the gate. That is a stylised device; check the owner is happy with it.
- D4 and K5b are about 0.1 s under reading time (pace.py passes them).
- 36 hard cuts in total (the cold open and the auction set-piece are intentional).
- Owner questions: the bed cut (§4), a gavel SFX, and purging the committed wavs from history.

Regenerate `lines45.ts` after `plan45.py`:
```python
import json
m = json.load(open('lines_v3_meta.json'))
open('../37-qiqing/remotion/src/qq45/lines45.ts', 'w').write('/* generated from episodes/45-mashou/lines_v3_meta.json (plan45.py) */\nexport type Ln = {id: string; a: number; b: number; text: string; kind: string};\nexport const LINES45: Ln[] = ' + json.dumps(m, ensure_ascii=False) + ';\nexport const TL: Record<string, number> = Object.fromEntries(LINES45.map((l) => [l.id, l.a]));\n')
```

QA scripts: `.claude/skills/video-reviewer/scripts/` — `probe.py --out DIR film.mp4` (glitches/black/frozen/loudness), `pace.py --film-end 154.18 lines.json`, `facts.py --lines lines.json --src <qq45 dir> script.md`.
