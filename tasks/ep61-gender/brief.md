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
