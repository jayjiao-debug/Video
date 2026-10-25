# Gate 2b notes, round 3: 假如你是圆明园马首 (Look 1 铜灯影). Verdict: ESCALATE (hero only; everything else is small and routed)

Director, 2026-10-25. Compared with notes_gate2b_v2.md. I opened c1_proof, c1_hook (plus a crop of the head), h1b_return (plus crops of the doorway, hands and feet), a4_noon, d6a_2007, bros_test, check400/strip400, a 2×2 montage of the 400 px files, and sheet.png. I put them next to mashou_bjnews_1.jpg (3/4 view) and mashou_bjnews_zhengjuesi.jpg (mane from behind), read hero3.js, staff45.ts and h1b_staff.json, and ran staff_check.mjs (PASS).

**Why ESCALATE.** This is round 3, and the hero still fails the test I set: does it read as THE 圆明园马首? It is much closer than r2. The stripes, the tiger read and the chess-piece base are gone, and it is now a dark-patina horse bust on the black marble block. But the feature that makes the real head recognisable is its mane, and the mane is still wrong. Next to the photo, the owner would send it back ("拖把"/broom). The rules give me no round 4, so the owner chooses (below).

## Scores (areas this gate covers)
| Area | r2 | r3 | Evidence |
|---|---|---|---|
| Visual | 3 | **3 (rising)** | **Better:**<br>• No banding at 400 px in any frame.<br>• Face 67 vs mane 38 in C1; 85 vs 59 in H1b.<br>• Long tapered face, glossy cast eye, rolled ear, exhibit block.<br>• The H1b staff are real `<Person>`s, and the face is 60 luma above the wall behind it (85 vs 25).<br><br>**Held:**<br>• The mane reads as a straight straw fringe (n1).<br>• The mouth reads as a grin or a duck bill (n2).<br>• The H1b hands are stacked "pancakes" (n4). |
| Info | 4 | **4** | The `r` dots render ivory `#FFF1DC`. The era chip and stamp bar are copper (`#C8693A`), so there is one accent. 「未付款」 is on the copper tag. B5 has not been run. |
| Edit | 5 | 5 | Not touched this round. |
| Motion | 4 | **4** | The stale board text is gone. The staff rig PASSes R1–R7. |

## Round-2 notes: status
| # | Status |
|---|---|
| 1 Hero | **Partly.** (b) face length, (c) eye, (d) ears and (e) base are done. (a) the mane is NOT done: the code's comments describe S-wave locks, but the geometry draws a vertical curtain (n1). |
| 1b Photo | Done. |
| 2 H1b | (b) light: done. (a) staff: rebuilt and PASS, but elbows are bent 133–142° (n4). |
| 3 Brothers | 猴 redrawn; 狗's muzzle is clear in A4. **B5 is still owed** (n6). |
| 4 海晏堂 | Not done; still due before the POOL build (n7). |
| 5 VO | Board row added. The re-timing is the editor's job and stays open. |
| 6 Stale text | Done. |
| 7 `r` dots | Done. |

## The escalation: the owner chooses the hero route
- **A. Keep the flat-vector hero (hero3.js) and make one more geometry pass:** n1, n2 and n3 below, about 45 min. The rest of the hero already works and stays.
- **B. A hero made from a 3D model, baked to sprites under our copper key.** This only makes sense if a licensed scan of *this* head exists. A generic horse-bust model brings back the "generic horse" problem. It costs hours plus the farm, and risks clashing with the flat 铜灯影 world (rows 82 and 98).
- **Recommendation: A.** Every remaining fault is a parameter in one file (lock direction and amplitude, the mouth-corner height, the jowl curve), and the look around the hero is already approved. The owner sees one corrected C1 proof next to the photo (row 127).

## Remaining notes (small, routed)
| # | Sev | Where | Note | Route |
|---|---|---|---|---|
| 1 | **High** | hero3.js `lockGeo` (all shots) | **The mane is a vertical curtain, not locks lying along the neck.**<br>• The cause: every tip is set to `y ≈ CUT+28…98`, directly under its crest root, with an amplitude of only 10–22 over a length of 400–700. The result is parallel straight strands, and the tips form one ragged horizontal edge (a broom or grass skirt).<br>• Fix:<br>  (i) Each lock runs **back and down** from its root along the neck, at a direction of about (0.55, 0.85) and a length of 280–420 local units.<br>  (ii) Amplitude 0.10–0.14 × length, 1–1.5 full waves, so the S is visible at 400 px.<br>  (iii) The tips gather into 4–5 flame clumps that flare **outward and back** past the neck's rear edge, with lengths varying ±80. There is no level fringe line.<br>  (iv) The mane covers only the back ~60 % of the neck side. The front of the neck stays smooth bronze (n3).<br>  (v) Groove highlights (`C.lite`, opacity .45) drop to ≤ .15, with ≤ 3 grooves per lock. The light comes as one soft lit band on each lock's crest side, so the mane reads as cast metal, not fibres. This also cures the lighter "straw" mane in H1b.<br>• Check against mashou_bjnews_zhengjuesi.jpg (parted crest, long waved locks) and mashou_bjnews_1.jpg. | art-director |
| 2 | **High** | hero3.js mouth (all shots) | **The mouth reads as a grin or a duck bill.**<br>• `LIP_LINE` and `MOUTH_IN` run from front (−576,210) to corner (−452,200). After the −20° head rotation, the corner sits about 50 px *above* the front on screen, so the mouth smiles. Move the corner down to about (−452,265) in head-local units, so the slit is level or falls slightly toward the back on screen.<br>• The lower lip sits ≥ 20 units *behind* the upper lip, as in the photo. Drop the bright `CHIN_LIT` rim on the chin lobe.<br>• The open gap at the front is ≤ 25 units, still enough for the spout in A4. | art-director |
| 3 | Med | hero3.js jowl and neck join | The head ends in a near-vertical back edge (`JOWL_RIM`), and the mane starts right there, like a mask on a mop.<br>• Draw the photo's big round jowl: a rounded bottom-back bulge below the cheek line, shown by shading (lit upper edge, shadow under), with no outline.<br>• Add a concave throat notch behind it, then 80–120 units of smooth neck front before the mane.<br>• Keep the hard cheek edge only from the mouth corner to under the eye. My r2 "throat → mouth-corner plane" made it run the full length and look like a visor; that was my error. | art-director |
| 4 | Med | h1b staff | **Pose.** PASS, but the elbows bend 133° and 142° (staff_check). The hands sit folded at the chest as two flat horizontal discs, which reads as holding a plate (row 61).<br>• Stand each man about 60 px farther from his leaf, so the near arm reaches with an elbow bend ≤ 60° and a forearm is visible.<br>• The palm is a vertical mitten flat on the leaf edge. The far hand is hidden or overlaps the near one.<br>• Add a check to staff_check: pushing elbow ≤ 70°. Re-run until it PASSes.<br>**Staging (the producer's question): no, not plausible as drawn.**<br>• The plinth's base is at y 940, about 68 px in front of the staff's floor line (872), so it stands on the threshold, *outside* the inward-opening leaves. The doors open behind you, and no hall displays an object in its doorway.<br>• Move the plinth inside: base on the hall floor at y ≈ 860, width ≤ 180 px, centred on the doorway (x ≈ 975; it is now off-centre at 952–1160), and keep the head ≥ 170 px tall.<br>• The staff then flank it at the leaves, and the doors open onto you. | animator (pose), art-director (plinth) |
| 5 | Low | c1_proof | Re-make it after n1–n3: the same two panels plus the 400 px pair, and add mashou_bjnews_zhengjuesi.jpg as a third reference panel for the mane. This is the only still the owner sees (row 127). | art-director |
| 6 | Med | B5 | A cold reader names ≥ 10/11 from bros_blind.png at 400 px and finds 狗 and 猴 in A4 at 400 px. Do this before the build. | producer (cold reader) |
| 7 | Med | 海晏堂 (r2 n4) | Redraw it from haiyantang_model_bjnews.jpg (now in ref45/) before the POOL build: no clock pediment, with the double curved stair. The owner does not need to see it first. | art-director |
| 8 | — | VO (r2 n5) | Still open; it carries over unchanged. | editor |

## Don't change (it works)
- **Everything on the r1 and r2 lists.**
- **Hero:**
  - the dark patina, carried by copper rim and lit planes;
  - the long tapered face;
  - the glossy cast eye with lid rims and no brow stroke;
  - the cool window reflection on the nasal ridge;
  - the rolled near ear;
  - the black marble block and post.
- **The 400 px results:** no stripes or tiger read anywhere, and the hero is the only saturated thing in A4, d6a and H1b.
- **H1b:**
  - the lighting: frame mean 61, face 85 against a wall of 25;
  - the 隔扇 doors and pines;
  - the staff on the film rig, with both soles on the floor and the shoulders at the top of the torso.
- **The caption layer:** ivory `r` dots, a single copper accent, the 「未付款」 copper tag, the sheet title, and bros_test's new 猴.
