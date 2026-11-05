# ep61 research_facts: verification of the warning rows (2026-11-05)

Method: every quote below was read on a page or PDF I actually fetched (curl or WebFetch, then text extraction). No Wikipedia, Baidu or Zhihu. Where a museum page could not be fetched I say so at the end and do not quote it.

## Source key (all fetched and read)

| Key | Source | URL |
|---|---|---|
| **LICH2** | M. Lichtheim, *Ancient Egyptian Literature* vol. II (UC Press 1976): "Horus and Seth" (P. Chester Beatty I), "The Destruction of Mankind" (Book of the Heavenly Cow), "Great Hymn to Osiris". Read as the archive.org OCR scan, so wording is OCR text. | https://archive.org/details/MiriamLichtheimAncientEgyptianLiteratureVolII |
| **UCL** | UCL Digital Egypt (Petrie Museum / UCL), "Gods and goddesses in ancient Egypt: creation", (c) 2002 UCL | https://www.ucl.ac.uk/museums-static/digitalegypt/religion/deitiescreation.html |
| **UEE-Cow** | N. Guilhou, "Myth of the Heavenly Cow", UCLA Encyclopedia of Egyptology 2010 (peer reviewed) | https://escholarship.org/uc/item/2vh551hn |
| **UEE-Feathers** | E. Teeter, "Feathers", UCLA Encyclopedia of Egyptology 2010 (peer reviewed) | https://escholarship.org/uc/item/4737m1mb |
| **GLEN-Cats** | J. Houser Wegner (Associate Curator, Penn Museum), "Cats, Lions, and the Fabulous Felines of Ancient Egypt", Glencairn Museum News, July 2015 | https://www.glencairnmuseum.org/newsletter/july-2015-cats-lions-and-the-fabulous-felines-of-ancient-egy.html |
| **GLEN-Mothers** | J. Houser Wegner, "Divine Mothers: Power and Protection", Glencairn Museum News no. 8, 2020 | https://www.glencairnmuseum.org/newsletter/2020/11/12/divine-mothers-power-and-protection |
| **GLEN-Creation** | "Ancient Egyptian Creation Myths: From Watery Chaos to Cosmic Egg", Glencairn Museum News no. 5, 2021 (author not shown in the fetched text) | https://www.glencairnmuseum.org/newsletter/2021/7/13/ancient-egyptian-creation-myths-from-watery-chaos-to-cosmic-egg |
| **PENN-Ranke** | H. Ranke, "Egyptian Deities and Their Sacred Animals", Penn Museum *Museum Bulletin* XV, 2-3 (1950), pp. 17-20. The page says it is a historical reference and may not reflect current views. | https://www.penn.museum/sites/bulletin/3283/ |
| **GEM** | Global Egyptian Museum glossary, "Heliopolis" | https://globalegyptianmuseum.org/glossary.aspx?id=177 |
| **CMA** | Cleveland Museum of Art open-access records (descriptions read via the museum's API) | https://clevelandart.org/art/1978.90 , /1942.776 , /1920.1990 , /1916.2011 |
| **WALT** | Walters Art Museum, Shu amulet 48.1683 | https://art.thewalters.org/object/48.1683/ |
| **SHANLEY** | A. J. Shanley, *God of Confusion? The Egyptian God Seth in New Kingdom Expressions of Royal Ideology*, PhD diss., Emory University (advisor G. Robins) | https://etd.library.emory.edu/downloads/9s1616296 |
| **OUDA** | A. M. Ouda, "Who or what is Werethekau 'Great of Magic'?", *Papers from the Institute of Archaeology* 23(1), 2013, doi:10.5334/pia.424 | https://student-journals.ucl.ac.uk/pia/article/id/153/ |

## Verdict table

| Row | Verdict | Supported by | Script change |
|---|---|---|---|
| F2 | ✓ | GLEN-Creation, UCL, LICH2 | none |
| F3 | ✓ (mound wording soft; scepter UNVERIFIED) | PENN-Ranke, GLEN-Creation, GEM, UCL, LICH2 | optional: drop "持权杖" |
| F5 | ✓ (Tefnut sun disk and uraeus UNVERIFIED) | GLEN-Creation, WALT, PENN-Ranke, UEE-Feathers, GLEN-Cats | optional: drop "日盘和眼镜蛇" on Tefnut |
| F10 | ✓ | GLEN-Mothers, OUDA, LICH2, PENN-Ranke | none (optional safer wording below) |
| F11 | ✓ | SHANLEY, LICH2, UCL, PENN-Ranke | none |
| F16 | ✓ (80 years is the myth's own figure, said twice) | LICH2, GLEN-Mothers | optional: "在法庭上争了80年" |
| F18 | ✓ for Ma'at and Sekhmet, ✓ for Bastet as "thought to be a daughter" only; "Eye of Ra" for Bastet not found | PENN-Ranke, GLEN-Cats, UCL | **change line 35** ("个个不好惹" contradicts lines 38-39) |
| F19 | ✓ with one nuance: in the tomb text the Eye is named **Hathor**, who becomes Sekhmet by wordplay | LICH2, UEE-Cow, UCL, GLEN-Cats | line 36-37 stay; fix the pictures of 36 and 37 |
| F20 | ✓ for cat head, protector of home and children; sistrum, aegis and basket partly attested | GLEN-Cats, CMA, PENN-Ranke, UCL | picture of line 38 |

## F2. Nun, the dark primeval water: ✓

- GLEN-Creation: the Ogdoad "represented the dark, watery, unknown, and eternal state of the cosmos prior to creation. Nun and Naunet represented water." For the Heliopolitan version: "there is a chaotic, watery state of pre-creation, in which Atum resides before he is born."
- UCL: "Nun and Nunet - from the word nnw 'watery expanse', the lack of solidity"; "Kek and Keket - from the word kkw 'darkness', the lack of light".
- LICH2, Destruction of Mankind, note 2 on Nun: "The primordial water in which creation began."
- Supports "一开始只有一片黑水" (the water is Nun; the darkness is the neighbouring pair Kek and Keket). Line 3 stays as written.

## F3. Atum, mound, Atum-Ra, double crown: ✓

- Atum = Ra (the Heliopolis sun god):
  - UCL: "The principal creator god in Ancient Egyptian religion is the sun-god; ... Ra, and this was one name for the sun-god, but he was also regularly called Atum".
  - PENN-Ranke: "Atum, worshipped at Heliopolis. Early identified with the sun god Re".
  - LICH2, letter in Horus and Seth: "The King of Upper and Lower Egypt: Re-Atum, beloved of Thoth".
  - GLEN-Creation: "a creator god named Atum (or Re-Atum)".
- Double crown (yes, attested): PENN-Ranke: "Atum ... usually in human form, often with the double crown of Upper and Lower Egypt." Line 4 "戴红白双冠" holds. Safe form: "常戴双冠".
- Rising from the water onto a mound:
  - GLEN-Creation: Atum "is self-created and arises in the shape of an obelisk-like pillar (the benben) in Heliopolis".
  - GEM: the benben "was a symbol of the primeval mound ... 'weben', which means 'to rise'"; Atum is "the creator god who commenced his work here".
  - UCL: "the mound itself offers the original sacred ground - temples are said to be sited on the primeval mound of the first time of creation".
  - **Not obtained:** the Pyramid Text 600 wording (the Brown handout and sacred-texts were unreachable), so I have no verbatim "mounted as a hill" line.
  - Wording that holds: "水里升起创世神亚图姆" (line 4 as written). The picture of Atum standing on a small hill is the usual retelling; the texts say he rises and is himself the mound or benben.
- Scepter: not verified for Atum. I suggest dropping "持权杖" from the picture column, or marking it as art licence.
- Line 5 "他也是太阳神，叫拉" is fine. GLEN-Creation caption: "The falcon-headed sun god Re is adored by the priest Diefankh (UPMAA E2044)" covers the falcon head.

## F5. Shu, Tefnut: ✓

- GLEN-Creation: "Atum spits out a pair of divine beings: Shu, the god of air, and Tefnut, his female counterpart, the goddess of moisture". This also confirms 吐出.
- WALT (Shu 48.1683): "represents the principle of air. Together with his consort, Tefnut - the principle of moisture".
- Shu feather:
  - PENN-Ranke: "Shu, god of the air. Always human. Often the hieroglyph of his name, the feather, is on his head."
  - UEE-Feathers: "The same sign [ostrich feather] was used to write the name of the gods Shu and Maat."
  - So Shu and Ma'at share the feather. This is a risk if both appear with the same feather.
- Tefnut as lioness:
  - GLEN-Cats: "Numerous deities including Sekhmet, Mut, Mehyt, Pakhet, Tefnut and Mahes all can appear in leonine form."
  - So "狮子头" is attested (she can also appear in other forms).
  - **UNVERIFIED on a fetched page:** sun disk and uraeus on Tefnut. Only Sekhmet's disk and uraeus are confirmed (see F19). The Carlos and British Museum pages came up in search but could not be opened.
  - Suggest dropping "头顶日盘和眼镜蛇" for Tefnut, or keeping it as art licence.
- Nuance: UCL derives the names from "Sw 'to be dry'" and "tfn ... to be moist". "Air" is the standard museum gloss. Line 7 "是空气" and line 8 "是湿气" stay.

## F10. Isis: ✓

- Great of magic:
  - OUDA, quoting an inscription from Nelson 1981 (Great Hypostyle Hall, Karnak): "'Isis, the great, mother of the god, lady of heaven, Great of Magic'".
  - GLEN-Mothers: "By means of her great magic, and with the assistance of Anubis ... Isis was able to reassemble and reanimate her husband".
  - Caution: "Great of Magic" (wer-hekau) is a shared epithet. OUDA says it is an epithet of other deities, and SHANLEY has Seth as "Great of Magic" on monuments. So line 21 "最会魔法的女神" is a superlative the sources do not state. The safer text is "[伊西斯]，法力强大的女神。" (11 字). The current text is acceptable if the owner prefers it.
- Throne sign:
  - GLEN-Mothers: "Often the hieroglyph for her name is shown atop her head. The hieroglyph that spells her name is that of a seat or throne".
  - PENN-Ranke: "with the sign of her name, a throne, on her head".
- Wings: LICH2, Great Hymn to Osiris (stela of Amenmose): "Mighty Isis who protected her brother ... Who made a shade with her plumage, Treated breath with her wings." Wings are attested in text. The colours ("彩色") are art licence.
- Not verified, so out of the picture column: Isis horns and sun disk. CMA 1993.110 does state "the modius, cow's horns, and a sun disk" on Isis, if wanted.

## F11. Set: ✓

- Animal:
  - SHANLEY: "The Seth animal is a creature with erect squared-off ears, a curved snout, and a raised tail shaped like an arrow."
  - PENN-Ranke: Seth, "Animal: unidentified mammal".
  - This matches the picture "弯长鼻、方顶高耳".
- Desert:
  - SHANLEY: "generally agreed that the being was viewed as a desert dweller by the ancient Egyptians".
  - UCL: "In some versions Seth is given the deserts as his area of authority."
- Storms:
  - SHANLEY, note 17: "As early as the Pyramid Texts Seth is associated with storms".
  - LICH2, Horus and Seth, ending: "Let Seth, son of Nut, be given to me to dwell with me and be my son. And he shall thunder in the sky and be feared." The speaker is Pre-Harakhti.
  - LICH2, Report of Wenamun: "Amun makes thunder in the sky ever since he placed Seth beside him!"
- Line 22 "沙漠和风暴之神" holds. Scholars also stress "foreign lands" and "chaos". The line is not wrong, just incomplete.

## F16. Eighty years: ✓ (two exact passages, both in LICH2, "Horus and Seth", P. Chester Beatty I, Ramesses V)

1. The All-Lord (Re-Atum) dictates a letter, written by Thoth, to the goddess Neith. The scene is at the start of the trial, when Banebdjede has told the Ennead to ask Neith.
   > "What shall we do about these two people, who for eighty years now have been before the tribunal, and no one knows how to judge between the two? Write us what we should do!"
2. Later, Horus himself speaks to Neith at Sais.
   > "Let me be judged with Seth! For it is now eighty years that we are in the court, but they don't know how to judge between us."
3. Secondary, museum: GLEN-Mothers (J. Houser Wegner): "The Contendings of Horus and Seth ... describes in a rather satirical way how these two gods fought for a period of eighty years."
- What exactly is 80 years: time "before the tribunal / in the court", which is the lawsuit over the office of Osiris (fights and tricks are inside it). The figure is the tale's own, a literary number. The tale is New Kingdom, in Lichtheim's words "coarsely humorous".
- Line 32 "叔侄俩，一争就是80年" is OK. If you want it exact, use "叔侄俩，在法庭上争了80年。" (12 字) and show the tribunal of the Ennead with Thoth, not only a duel. Line 31 "要向叔叔讨回王位" is fine.

## F18. Daughters of the sun god: ✓ Ma'at and Sekhmet, ✓ Bastet as "thought to be", Bastet as "Eye of Ra" not found

- Ma'at: PENN-Ranke: "Ma'at, goddess of truth and justice. Always human. Considered to be the daughter of Re. The hieroglyphic sign of her name, a feather, often seen on her head." Same page under Re: "His daughter Ma'at." Solid.
- Sekhmet: GLEN-Cats: "Like Bastet, Sekhmet, whose name means 'The-powerful-female-one,' was thought to be a daughter of the sun god"; "Her sun disk with a rearing uraeus (cobra) illustrates her connection to her father, the sun god Re. In Egyptian mythology, Sekhmet represents the 'Eye' of the sun."
- Bastet: GLEN-Cats: "She was thought to be a daughter of the sun god, Re." Only that sentence; no "Eye of Re" claim in what I read, and the same article calls Sekhmet's peaceful counterpart Bastet. Solidity: medium (one museum source). On screen, say "daughter" only, never "Eye of Ra" for Bastet.
- Disagreements to avoid:
  - At Memphis Sekhmet is Ptah's wife (GLEN-Cats). Do not draw her as "Ra's only family".
  - In the Heavenly Cow text the daughter-Eye is **Hathor** (UEE-Cow: "Ra sends his daughter Hathor, the fiery, protective 'Sun Eye'").
  - UCL: the Eye is "a separate offshoot, a 'daughter'".
- **Line 35 "太阳神的女儿们，也个个不好惹。" is wrong against the sources.** The next lines show Bastet protecting children and Ma'at as truth, and GLEN-Cats stresses "Sekhmet's peaceful counterpart was Bastet ... opposite in activity and action". Change it to **"太阳神的女儿们，脾气天差地别。"** (13 字). The picture stays.

## F19. Sekhmet and the destruction of mankind, red beer: ✓

- LICH2, Destruction of Mankind (Book of the Cow of Heaven; tombs of Tutankhamun, Seti I, Ramses II, Ramses III, Ramses VI):
  - "The goddess returned after slaying mankind in the desert, and the majesty of this god said: 'Welcome in peace, Hathor, Eye who did what I came for!' Said the goddess: 'As you live for me, I have overpowered mankind, and it was balm to my heart.' ... Thus the Powerful One (Sakhmet) came into being." Note 6: "A word play on sfym, 'power,' and shmt, the lion-goddess Sakhmet."
  - "the red ochre was put into the beer-mash, and it became like human blood; and seven thousand jars of beer were made."
  - "the fields were flooded three palms high with the liquid ... She drank and it pleased her heart. She returned drunk without having perceived mankind." Re: "It is good; I shall save mankind by it!"
- UEE-Cow (peer reviewed): "Ra sends his daughter Hathor, the fiery, protective 'Sun Eye,' to kill the rebels ... Ra feels pity for humankind and decides against continuing the massacre. ... beer be mixed with red ochre, so as to make it look like blood". The tomb of Seti I has the most complete version.
- UCL: "As Sekhmet (meaning 'the mighty goddess') she almost annihilates mankind; the gods trick her into becoming sweetly drunk, by colouring a lake of beer red to look like human blood - she reverts to her sweet character as the loving and maternal Hathor."
- Lioness and sun disk: GLEN-Cats ("Sekhmet has the ruff typical of a lioness ... sun disk with a rearing uraeus"); CMA 1916.2011 ("wears a wig, once crowned with a sun disk and uraeus").
- Lines 36-37 stay as text ("差点把人类灭光" matches "almost annihilates"). Fix the pictures:
  - In the text the red is the **beer flooding the fields**, not a red sky. The best visual is red-beer fields, the goddess drinking and falling asleep. Suggest changing "血红的天" to "田野被血红的啤酒淹没".
  - "红衣" for Sekhmet is not in a fetched source (CMA says only "long, tight-fitting dress"). Treat red as art licence or drop it.
  - If the owner wants strict accuracy, mention that the tomb text calls her Hathor. The line can stay because Egyptologists use both names (UCL: "As Sekhmet").

## F20. Bastet: ✓ solid core, ✓ props with caveats

- Cat head, home, children:
  - GLEN-Cats: "At first her iconography is that of a cat. By the time of the New Kingdom she appears as a woman with a cat's head. Bastet's place was in the home. She was primarily a protective domestic goddess who, like a mother cat with her kittens, took good care of the children in the house."
  - GLEN-Cats: "Representations of cats or cat-headed goddesses were likely connected to Bastet, who was revered as a goddess of fertility and protector of the home."
  - CMA 1942.776: "Bastet, Egyptian goddess of fire, cats, and protector of the home."
  - Line 38 "猫头的巴斯特，守护家和孩子" holds.
- Props:
  - GLEN-Cats (Late Period votives): "Bastet is shown with a feline head and a human body. She wears a long tight-fitting dress, and holds an aegis in her hand. ... From her arm, a situla hangs. ... Her other hand is broken away, but it is likely that she originally held a sistrum."
  - CMA 1978.90: "the basket was associated with the cat-goddess Bastet. Statuettes of Bastet frequently show her carrying basketfuls of kittens."
  - CMA 1920.1990: the sistrum had "a calming effect on the nerves of various deities, especially the goddesses Hathor and Bastet".
  - So the standard votive pose is a lion-headed aegis in one hand, a basket or situla on the arm, and a sistrum (usually broken off). The sistrum is only "likely" for that figure, but it is a firmly attested attribute of Bastet. The "basketfuls of kittens" idea comes only from the Cleveland record; do not put kittens in the basket.
  - Suggested picture for line 38: "一手举叉铃，臂弯挂篮，胸前一个狮头护身符(aegis)". The current "一手摇叉铃一手提篮" is acceptable if the aegis is added or left out.
- Disagreement on her early form:
  - UCL: "Bast ... until the first millennium BC depicted as lion(ess), from the Twenty-second Dynasty as cat".
  - GLEN-Cats: cat first, cat-headed woman by the New Kingdom.
  - "猫头" holds either way, as the classic Late Period image.
- Also Ranke (PENN): "Bastet, goddess of joy, worshipped at Bubastis ... Animal: cat".

## What I could not open (so not quoted)

- Met Museum collection pages and exhibition pages, Brooklyn Museum, British Museum, Louvre, Carlos Museum: all returned 429, 403 or empty. The Met "Great One of Magic" amulet note, the BM "Atum in double crown" record and the Met statement that the kitten-basket idea is unfounded came only from search snippets, so they are not used.
- Brown University PT 600 handout and sacred-texts.com (Mercer, Pyramid Texts) were unreachable. Existing F4 and the "on the mound" wording therefore still lack a verbatim Pyramid Text quote from me.
- Lichtheim is quoted from the archive.org scan (OCR). The two "eighty years" lines are clean. For the printed credit use "Lichtheim, AEL II (1976), 'Horus and Seth'". I did not get a reliable page number from the OCR.
