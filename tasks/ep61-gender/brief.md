# Task: make the female characters more feminine and the male characters more masculine (古埃及神话故事 series)

Owner (2026-11-06): "can we make the female more feminine and male more masculine?" Right now most gods share one body; only the
heads differ. Code: `episodes/37-qiqing/remotion/src/qq61/` (cast61.tsx, chars61.tsx, heads61.tsx, sheetkit61.tsx, sheets61.tsx:
SHEETS61 / RIGTEST61 / FACECHECK61, board61.tsx: BOARD61, shots61.tsx) and the shared rig `src/qq60/rig60.tsx`.
Canon: `episodes/61-zhongshen/designbook.md`. Follow ancient Egyptian canon, which draws the sexes very distinctly.

## Who is who
- Female: Isis, Nephthys, Nut, Tefnut, Sekhmet, Bastet, Ma'at.
- Male: Atum, Ra, Shu, Geb, Osiris, Set, Horus, Anubis, Thoth (and the deceased protagonist, ep60 `ANI`).

## Female body (Egyptian canon, tasteful and modest)
- Narrower shoulders (about 80 % of the male width), slimmer upper arms and forearms, small hands and feet, long slender neck, a
  narrow waist and a gentle hip curve, the bust suggested by the dress line in the canonical profile (no nudity).
- The ankle-length close-fitting sheath dress (kalasiris) with shoulder straps or the bead-net overdress, a deep broad collar,
  bracelets and anklets; the tripartite wig with long lappets for human-headed goddesses; slightly shorter than the gods (~0.94×).
- Graceful poses: narrow stance (feet close, the walk with a shorter stride), softer arm angles, the protective winged pose for Isis
  and Ma'at; hands open and elegant (no fists unless holding an object).
## Male body
- Broad shoulders, a muscular chest (pectorals, defined deltoids and biceps), a thicker neck, a narrow waist under a strong V torso,
  sturdy calves; the short kilt (shendyt) with belt and apron, arm bands; a wider stance and a longer stride; slightly taller.
- Fists and firm grips on sceptres; Osiris stays mummiform (his wrapped body, but shoulders broad).

## Rules
- Build it as body types in the rig (e.g. a `body: 'f' | 'm'` cast option driving widths, limb thickness, waist/hip, stride and the
  dress/kilt), so every pose, walk and action keeps working: joints must stay seamless at every angle (no gaps, no outline crossing),
  hands still hold objects, feet on the ground, the dress follows the legs naturally in the walk.
- ep60 must render EXACTLY as before (its characters use the old bodies): new behaviour only behind options that default to the old
  drawing. Verify EP60PIC frames 1500, 2500 and 4300 are pixel-identical before/after.
- Update the LINE-UP sheet, every character sheet, RIGTEST61 and the BOARD61 boards; render and look at every one at full size, fix
  layering, clipping and proportions until clean. DO NOT COMMIT IMAGES, VIDEO OR AUDIO (public repo) — code and markdown only.
- Update `designbook.md` (body-type section: measurements, dress/kilt rules, pose rules per sex).
- `tasks/ep61-gender/result.md`: a short Chinese summary + render commands.
- Only change `episodes/37-qiqing/remotion/src/qq61/`, `src/qq60/rig60.tsx` (non-breaking), the designbook, `tasks/ep61-gender/`.
  No keys in files. Set a git identity before committing (git config user.name "Claude"; user.email "noreply@anthropic.com").
  End commits with: Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

## Round 2 (owner 2026-11-06 10:50, with a screenshot of BOARD61 shot 17: Nephthys + Anubis)
- NO NIPPLES on any character, ever: remove every nipple dot/mark on male chests (Anubis in shot 17 shows one) — keep only the
  pectoral contour line; female dresses get a clean straight neckline (or the strap line) with no bust mark, no curve or dot that
  can read as a nipple (Nephthys in shot 17 shows a curved mark under the collar). Check every character sheet, RIGTEST61 and all
  BOARD61 frames at full size.
- Osiris: give him NORMAL HANDS. Keep his mummiform wrapped body, but his two hands come out of the wrappings crossed over the chest
  and grip the crook and the flail properly (fingers wrapped round the shafts, hand drawn over the shaft), as on Osiris statues.
- Owner 10:53: "for the female the breast is showing". Round 1 drew the bust through the dress line and gave the male chest nipple
  dots — both must go. Female: the dress (and the broad collar) covers the chest COMPLETELY, up to the collar, with a modest, smooth
  profile line from collar to waist — no bust contour, no breast shape, no cleavage, no bare-chest gap between collar and dress top.
  Femininity comes from the narrow shoulders, slim arms, long neck, small waist, the hip line, the long dress, wig, jewellery and
  graceful poses — never from the chest. Male: pectoral contour only, no nipples.
- Re-render every character sheet, the line-up, RIGTEST61 key frames and all BOARD61 frames and check each female figure at full
  size for any chest shape before committing.

## Round 3 (owner 2026-11-06 11:27): "all the characters having blue hair makes it difficult to distinguish"
Make every character instantly distinguishable at phone size, staying within attested Egyptian iconography:
- Human-headed gods and goddesses get BLACK wigs (the most common colour in tomb painting), each with its own headdress so the
  silhouettes differ: Isis — vulture headdress (New Kingdom, e.g. tomb of Nefertari QV66) under her throne sign; Nephthys — gold
  fillet + her house-and-basket sign; Ma'at — red headband with the ostrich feather; Nut — plain black wig (her starry body/dress is
  the identifier); Shu — feather on a black wig; Geb — the goose on his head; Atum — the double crown over a black wig. Reserve the
  lapis-blue wig/lappets for the animal-headed gods (Anubis, Horus, Ra, Thoth, Set, Tefnut, Sekhmet, Bastet), whose heads identify them.
- One SIGNATURE COLOUR per character, used for the dress/kilt or a dominant accent, and repeated on their node ring in the family
  tree (TREE61, BOARD61 mini-tree) and on their name tag edge:
  Isis red · Nephthys green · Nut deep starry blue · Ma'at white + gold · Tefnut ochre gold · Sekhmet red linen (her epithet "Lady of
  the Red Linen") with a darker crimson than Isis · Bastet turquoise · Osiris green skin + white wrappings · Set red-ochre · Horus
  blue + gold · Ra gold (sun) · Anubis black + gold · Thoth deep blue + white · Shu sky blue · Geb earth brown + green · Atum white +
  red (the double crown). Tefnut vs Sekhmet (both lionesses): different dress colour AND Sekhmet's fuller, darker mane; Horus vs Ra
  (both falcons): Ra with the sun disk and uraeus, Horus with the double crown.
- Put a "辨识" row on each character sheet (silhouette at 1/4 size + the signature colour swatch) and re-render the line-up so all
  characters stand side by side in their colours. Check the boards: in every multi-character shot each figure must be distinguishable.
- Same rules as before: ep60 renders unchanged; code + markdown only; update designbook (§ colours / headdresses + sources).
