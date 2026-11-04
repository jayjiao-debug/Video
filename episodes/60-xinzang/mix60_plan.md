# ep60 《死后称心脏》 mix placement table, v2 (read by `tools/mix60.py`)

v2 = the owner's notes on v1 (15:10): Egyptian from frame 0; no loud/silent cliffs or clashing switches between scenes
(cue changes cross-fade on bar lines, related tempi, loop pre-rolls as bridges); fewer, softer SFX in one Egyptian family;
a menacing Ammit (grunt, roar, growl: the one big sound); music under the end card resolving into a final cadence.
Sudden loud/silent moments are kept only where they serve tension or suspense; each is marked **[deliberate]** below.

Clock: `story60.ts` (157.6 s; shot 4 removed, everything after 7.9 s is 3.0 s earlier). Audio: `$S/snd60/cues/`, `$S/snd60/sfx/`
(`S` = the session scratchpad; env `SND60`). Run `python3 episodes/60-xinzang/tools/mix60.py` (about 1 min): it reads the builders'
`sync60_*.md`, and rows with a `sync` key move to the builders' times. The intro is fitted to the title: when builder A reports
the title moment T, re-render `python3 episodes/60-xinzang/tools/egypt_cues.py $S/snd60/cues intro:T`. The rows anchored to the title
(`3,5:title`) then follow by themselves.

Columns: `type` cue | sting | sfx | amb | synth. `t` = film second where source second `at` sounds (`hit` = the file's hit).
`in` = first source second (loops wrap, so a negative `in` = a pre-roll from the loop's last bar). `end` = film second it stops
(`+x` = t + x). `gain` dB (music: on the -14 LUFS file; sfx: offset from the auto level = local music loudness +0 dB, capped
under the music's peak unless `impact`; amb: local -8 LU). `fin`/`fout` equal-power fades (s). `fx`: `wind=d` (soft slow-down +
fade), `ramp=a>b@d`, `env=t:dB;t:dB` (film-time gain curve), `duck=dB` (music dips under this sound), `pan=`, `abs=`, `rev`,
`bright` (skip the default -4 dB shelf at 4.5 kHz), `impact`. `sync` = `[t|end|lock]<-shots:label@offset` (`+` and, `~` or, `#n` n-th).

## Music. Tempi: 104 (groove, intro), 69.33 (mystic, 2/3), 78 (tension/paradise, 3/4), 112 (playful, bridged by its pre-roll)

| on | id | type | t | file | at | in | end | gain | fin | fout | fx | sync | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| y | m01_intro | cue | 0 | intro | 0 | 0 | 8.7 | 0 | 0.002 | 0.7 | - | - | frame 0: dum + finger cymbals + the mizmar climbing D Hijaz (a 1.4 s wail onto the first downbeat); oud ostinato, arghul drone, riq, sistrum; the ney states the Hijaz motif over the heart; light maqsum builds to shot 5 |
| y | m02_title | cue | 8.4 | groove_loop | 18.4615 | 17.8846 | 17.054 | -1 | 0.45 | 0.45 | - | - | shot 5 (8.40): groove bar 9, its own darbuka roll into it and the mizmar Hijaz phrase on Thebes; runs on through the embalming (its 5th beat = builder A 11.30 grid, 15 ms) |
| n | m02b_bridge | sting | 11.3 | sting_roll_hit | hit | 0.55 | 11.3 | -4 | 0.02 | 0.01 | - | - | shot 5->6 dissolve: a one-beat darbuka roll re-phases the groove onto builder A grid (11.30) |
| n | m02c_embalm | cue | 11.3 | groove_loop | 27.6923 | 27.6923 | 17.069 | -1 | 0.03 | 0.45 | - | - | embalming: groove bar 13 (a phrase start) on 11.30; jars, boing, pop, thup sit on its beats |
| y | m03_memory | cue | 17.054 | mystic_loop | 13.846 | 13.246 | 23.9 | -1 | 0.6 | 0.8 | - | - | mystic bar 5 (Eb colour) enters on a groove beat (17.05, the thup; 2:3 tempo, the pulse carries on) |
| y | m04_book | cue | 23.5 | playful_loop | 0 | -0.536 | 38.2 | -1 | 0.45 | 0.9 | - | - | Book of the Dead: playful from 23.50 (builder A's flips sit on its eighths); its last-bar pickup bridges in |
| y | m05_duat | cue | 37.8 | tension | 24.615 | 23.615 | 46.75 | -1 | 1.0 | 0.5 | - | - | the Duat: tension bars 9-11 (arghul rub, heartbeat bendir, teks), swelling in over 1 s as the playful fades |
| y | m06_hall | cue | 47.0 | mystic_loop | 0 | 0 | 55.7 | 0 | 0.002 | 0.7 | - | t<-18:doors+boom | **[deliberate]** the hall reveal: 0.25 s breath, then bowl + bendir on the doors' boom |
| y | m07_roll | sting | 55.4 | sting_roll_hit | hit | 0.55 | 55.4 | -4 | 0.02 | 0.01 | - | - | one-beat darbuka roll bridges the mystic into the oath groove |
| y | m08_oath | cue | 55.4 | groove_loop | 0 | 0 | 67.9 | -1 | 0.002 | 0.01 | wind=0.5 | end<-25:freeze@+0.5 | **[deliberate, the one comic stop]** the oath groove; on 「话太多」 the band slows a little and fades over 0.5 s (a soft drop, not a cliff) |
| y | m09_weigh | cue | 91.4 | tension_hushdry | hit | 29.99 | 94.4 | 0 | 0.05 | 0.8 | ramp=-9>0@3.5,env=82.17:0;83.3:-8;83.47:-30;84.7:-30;85.05:0;85.25:0;88.25:-4;88.4:0 | - | the weighing: heartbeat enters on the 69.1 cut; arghul climb; [deliberate] for Ammit the music sinks under the lead-in and drops out for the roar alone (83.68-84.50), back on the hippo plop; ramp into the drone-only hush (88.32); [deliberate] silent beat 90.63, HIT 91.40 |
| y | m10_twist | cue | 94.0 | playful_loop | 0 | -0.536 | 112.05 | -1 | 0.45 | 0.35 | - | - | the scarab spell, Ani, Hatnefer; the hit's tail cross-fades into the playful pickup |
| y | m11_sly | sting | 110.5 | sting_roll_hit | hit | 0.35 | 112.0 | -9 | 0.05 | 0.3 | - | t<-40:ending+shrug | a soft sly roll ending on Hatnefer's shrug |
| y | m12_doom | sting | 112.32 | sting_doom | hit | 0 | 115.7 | -1 | 0.002 | 0.35 | env=112.9:0;113.0:-12;113.75:-12;114.15:0 | t<-41:pan+crash | **[deliberate]** 秤歪了: the playful fades by 112.05, a breath, then the doom on the pan crash |
| y | m13_lastbeats | cue | 115.42 | tension_hush | 51.538 | 49.221 | +0.03 | -3 | 0.05 | 0.02 | env=113.0:-9;113.75:-9;114.1:0 | t<-42:chomp | **[deliberate]** shot 33's speeding heartbeat returns; it stops on the bite (the heart is eaten) |
| y | m14_darkbed | synth | 115.42 | drone:D2,A2,D3,Eb3 | 0 | 0 | 120.7 | -3 | 0.25 | 0.7 | env=115.4:0;119.8:-3 | t<-42:chomp | after the bite no void: a dark sustained bed (arghul D2/A2, choir D3 + a soft Eb rub) under the sand, fading into the rewind |
| y | m15_rewind | sting | 121.3 | sting_reveal | hit | 0 | - | -5 | 0.01 | 0.5 | - | t<-44:bright+chime | qanun glissando as the sand rewinds; D-major chord + bowl when the pans level |
| y | m16_paradise | cue | 121.3 | paradise_loop | 0 | 0 | 134.5 | 0 | 0.02 | 1.2 | env=132.5:0;132.95:-8 | t<-44:bright+chime | the release: Osiris, 言语真实, the Field of Reeds; dips under the comic sting at the deadpan look and hands over to the playful |
| y | m17_hiccup | sting | 132.8 | sting_comic | hit | 0 | 134.6 | -5 | 0.002 | 0.4 | - | t<-48:deadpan | 「但是——」 the deadpan look: oud dun-dun + reed wah (over the paradise, not a stop) |
| y | m18_shabti | cue | 134.2 | playful_loop | 34.286 | 33.75 | 143.9 | -1 | 0.45 | 0.8 | - | - | playful bars 17-21 (claps; the shabti march and hoes are on this grid) |
| y | m19_close | cue | 143.423 | paradise_loop | 40.0 | 39.4 | 152.6538 | -1 | 0.6 | 0 | env=143.6:0;152.6:-3 | - | boat, museum, the level beam: paradise bars 14-16 (Gm, Eb, D), falling 3 dB; spliced sample-exact into its ending |
| y | m20_cadence | cue | 152.6538 | paradise_end | 0 | 0 | 157.55 | -4 | 0 | 1.6 | - | - | END CARD: the music keeps playing: the cadence resolves on D (harp roll) as the J and the title appear, rings under the card and fades with the picture |

## SFX: only the sounds that carry meaning; one Egyptian family (bronze, stone, papyrus, frame drum, zills, sistrum, the heart, Ammit)

| on | id | type | t | file | at | in | end | gain | fin | fout | fx | sync | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| y | s03_clang | sfx | 5.45 | X18_scale_tip_heavy | hit | - | - | 0 | - | - | - | t<-3:heart+lands | the heart lands on the pan: clang + chains |
| y | s03_eyes | sfx | 7.15 | X27_ammit_grunt | hit | - | - | -8 | - | - | bright | t<-3:yellow+eyes@+0.05 | Ammit's eyes open: a low grunt (first glimpse) |
| y | s05_gong | sfx | 6.3 | S07_gong | hit | - | - | -2 | - | 0.8 | - | t<-3,5:title+lands~title | temple gong on the title (lit into the lintel in shot 3) |
| y | s05_swell | sfx | 6.3 | synth:reedswell | hit | - | - | 0 | - | 0.5 | - | t<-3,5:title+lands~title | the title: a mizmar swell on D5 peaking as the title lands |
| y | s06_jar1 | sfx | 11.88 | X02_canopic_lid_clink | hit | - | +0.35 | -3 | - | 0.1 | pan=-0.3 | t<-6:canopic#1 | four jars land on the groove's beats |
| y | s06_jar2 | sfx | 12.45 | X02_canopic_lid_clink | hit | - | +0.35 | -4 | - | 0.1 | pan=-0.1 | t<-6:canopic#2 | |
| y | s06_jar3 | sfx | 13.03 | X02_canopic_lid_clink | hit | - | +0.35 | -4 | - | 0.1 | pan=0.1 | t<-6:canopic#3 | |
| y | s06_jar4 | sfx | 13.61 | X02_canopic_lid_clink | hit | - | +0.35 | -3 | - | 0.1 | pan=0.3 | t<-6:canopic#4 | |
| y | s07_basket | sfx | 17.07 | X22_comic_plop | hit | - | - | -6 | - | - | - | t<-7:puff+lands | the brain puff lands in the basket |
| y | s08_beat1 | sfx | 17.65 | synth:heart | hit | - | +0.6 | -1 | - | 0.12 | - | t<-8:heartbeat#1 | the heart-lantern pulses |
| y | s08_beat2 | sfx | 18.5 | synth:heart | hit | - | +0.6 | -1 | - | 0.12 | - | t<-8:heartbeat#2 | |
| y | s08_beat3 | sfx | 19.35 | synth:heart | hit | - | +0.6 | -1 | - | 0.12 | - | t<-8:heartbeat#3 | |
| y | s08_beat4 | sfx | 20.2 | synth:heart | hit | - | +0.6 | -1 | - | 0.12 | - | t<-8:heartbeat#4 | |
| y | s09_ring | sfx | 21.75 | G3_zills | hit | - | - | -3 | - | - | - | t<-9:gold+ring | the scarab is marked (zill motif; pays off at 91.4) |
| y | s10_unroll | sfx | 25.05 | X04_papyrus_unroll | hit | - | - | -1 | - | 0.3 | - | t<-10:whips+open@+0.6 | the roll whips open |
| y | s11_wing1 | sfx | 27.30 | X34_ba_wings | 0.39 | 0.33 | +0.11 | 2 | - | 0.04 | - | t<-11:wing+flaps#1 | the ba flies into the sun: one feathery flap per wing beat, fading |
| y | s11_wing2 | sfx | 27.56 | X34_ba_wings | 0.39 | 0.33 | +0.11 | 1 | - | 0.04 | - | t<-11:wing+flaps#2 | - |
| y | s11_wing3 | sfx | 27.82 | X34_ba_wings | 0.39 | 0.33 | +0.11 | 0 | - | 0.04 | - | t<-11:wing+flaps#3 | - |
| y | s11_wing4 | sfx | 28.08 | X34_ba_wings | 0.39 | 0.33 | +0.11 | -1 | - | 0.04 | - | t<-11:wing+flaps#4 | - |
| y | s11_wing5 | sfx | 28.34 | X34_ba_wings | 0.39 | 0.33 | +0.11 | -2 | - | 0.04 | - | t<-11:wing+flaps#5 | - |
| y | s11_wing6 | sfx | 28.60 | X34_ba_wings | 0.39 | 0.33 | +0.11 | -3 | - | 0.04 | - | t<-11:wing+flaps#6 | - |
| y | s12_flip1 | sfx | 29.13 | X35_papyrus_flick | hit | 0.03 | +0.1 | -2 | - | 0.03 | - | t<-12:page+flips#1~spell+sheets#1 | spell sheets flip on the playful eighths: one papyrus flick each |
| y | s12_flip2 | sfx | 29.4 | X35_papyrus_flick | hit | 0.03 | +0.1 | -4 | - | 0.03 | - | t<-12:page+flips#2~spell+sheets#2 | - |
| y | s12_flip3 | sfx | 29.67 | X35_papyrus_flick | hit | 0.03 | +0.1 | -4 | - | 0.03 | - | t<-12:page+flips#3~spell+sheets#3 | - |
| y | s12_flip4 | sfx | 30.2 | X35_papyrus_flick | hit | 0.03 | +0.1 | -2 | - | 0.03 | - | t<-12:page+flips#4~spell+sheets#4 | - |
| y | s12_flip5 | sfx | 30.47 | X35_papyrus_flick | hit | 0.03 | +0.1 | -4 | - | 0.03 | - | t<-12:page+flips#5~spell+sheets#5 | - |
| y | s12_flip6 | sfx | 30.74 | X35_papyrus_flick | hit | 0.03 | +0.1 | -4 | - | 0.03 | - | t<-12:page+flips#6~spell+sheets#6 | - |
| y | s12_flip7 | sfx | 31.27 | X35_papyrus_flick | hit | 0.03 | +0.1 | -2 | - | 0.03 | - | t<-12:page+flips#7~spell+sheets#7 | - |
| y | s14_pen | sfx | 35.95 | X05_reed_pen_scratch | 0.8 | 0.8 | +1.05 | -2 | - | 0.15 | - | t<-14:pen+writes | Ani's name written in |
| y | s15_door | sfx | 37.95 | S08_stone_door | 1.0 | 1.0 | +0.69 | -3 | 0.08 | 0.06 | - | t<-15:stone+door+grinds | the tomb door grinds shut |
| y | s16_knife1 | sfx | 40.8 | X19_knife_shing | hit | - | - | -2 | - | - | pan=-0.45 | t<-16:knife_1 | first and last knife glint only |
| y | s16_knife2 | sfx | 41.4 | X19_knife_shing | hit | - | - | -3 | - | - | pan=-0.15 | t<-16:knife_2 | one glint per guardian (owner: 4 knives) |
| y | s16_knife3 | sfx | 42.0 | X19_knife_shing | hit | - | - | -3 | - | - | pan=0.15 | t<-16:knife_3 | - |
| y | s16_knife4 | sfx | 42.6 | X19_knife_shing | hit | - | - | -3 | - | - | pan=0.45 | t<-16:knife_4 |  |
| y | s17_hiss | sfx | 44.25 | X07_serpent_hiss | 1.65 | 1.0 | 44.95 | -2 | - | 0.3 | - | t<-17:cobra+hiss@+0.5 | the cobra rears and hisses |
| y | s17_growl | sfx | 44.1 | X28_ammit_growl | 1.1 | 0.9 | 44.6 | -3 | 0.05 | 0.12 | bright | t<-17:growl@+0.2 | the crocodile growls as its jaws gape (43.90), then snaps |
| y | s17_croc | sfx | 44.6 | S03_croc_snap | hit | - | - | 0 | - | - | - | t<-17:croc+snap | the crocodile lunges: jaw snap + a short low growl |
| y | s17_burst | sfx | 44.75 | X44_magic_whoosh | hit | - | - | 0 | - | 0.3 | - | t<-17:glyph+burst~burst | the spell: the glyphs burst off the scroll (magic whoosh) |
| y | s17_shield | sfx | 45.0 | X46_magic_shield | hit | - | - | -1 | - | 0.3 | - | t<-17:shield | a shield of light forms (shimmer on D) |
| y | s17_blast | sfx | 45.3 | X45_magic_blast | hit | - | - | 1 | - | 0.4 | - | t<-17:blast~whoomp | the shield blasts the beasts back (magic impact) |
| y | s18_doors | sfx | 47.0 | X08_bronze_gate_creak | 0.05 | - | - | -1 | - | 0.3 | - | t<-18:doors+boom | the hall doors open |
| y | s19_whisper | amb | 50.0 | X09_judges_42_whisper_loop | 0 | 0 | 52.6 | -2 | 1.2 | 0.4 | - | t<-19:murmur | the 42 judges murmur |
| y | s20_stab1 | sfx | 52.4 | S11_frame_drum | hit | - | - | -2 | - | - | - | t<-20:punch+1 | frame-drum stab per punch-in |
| y | s20_bone | sfx | 52.8 | X33_bone_snap | hit | - | - | 0 | - | - | - | t<-20:bone+crack | 碎骨者 snaps a bone |
| y | s20_stab2 | sfx | 53.3 | S11_frame_drum | hit | - | - | -2 | - | - | - | t<-20:punch+2 |  |
| y | s20_chomp | sfx | 53.66 | X42_shadow_chomp | hit | - | - | 0 | - | - | - | t<-20:chomp~beak+shut | 吞影者 chomps the shadow |
| y | s20_stab3 | sfx | 54.2 | S11_frame_drum | hit | - | - | -3 | - | - | - | t<-20:punch+3 |  |
| y | s20_lick | sfx | 54.6 | X43_blood_lick | hit | - | - | 0 | - | - | - | t<-20:lick | 食血者 licks the red drop |
| y | s22_tick1 | sfx | 59.0 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-22:check+1 | a soft stone tock per accepted oath |
| y | s22_tick2 | sfx | 59.6 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-22:check+2 | |
| y | s22_tick3 | sfx | 60.2 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-22:check+3 | |
| y | s23_tick | sfx | 62.65 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-23:check | |
| y | s24_glint | sfx | 64.3 | X12_scale_ding | hit | - | - | -3 | - | 0.4 | - | t<-24:glint | the scale glints (plant) |
| y | s24_tick | sfx | 65.9 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-24:check | |
| y | s25_squeak | sfx | 67.5 | synth:squeak | hit | - | - | 0 | - | - | - | t<-25:squeak | a reed squeaks as the band drops out |
| y | s25_cricket | sfx | 68.3 | X20_cricket | hit | - | 69.9 | 0 | - | 0.6 | abs=-20 | t<-25:cricket | one cricket in the gap |
| y | s28_heart | sfx | 74.9 | X17_heart_on_pan | hit | - | - | -3 | - | - | pan=-0.45 | t<-28:left+pan | the heart on the left pan |
| y | s28_feather | sfx | 75.5 | X11_feather_land | hit | - | - | -3 | - | - | pan=0.45 | t<-28:right+pan | the feather on the right |
| y | s29_pen | sfx | 78.75 | X05_reed_pen_scratch | 0.8 | 0.8 | +0.45 | -4 | - | 0.12 | - | t<-29:first+scratch | Thoth's first stroke |
| y | s30_grunt | sfx | 80.25 | X27_ammit_grunt | hit | - | - | 1 | - | - | duck=3,bright | t<-30:growl~grunt | Ammit revealed: a menacing grunt |
| y | s31_leadin | sfx | 83.45 | synth:leadin=1.28 | hit | - | +0.05 | 4 | - | 0.05 | bright | t<-31:roar@-0.4 | the lead-in: darbuka roll + the mizmar climbing D Hijaz from the bar line (82.17), a breath, then the roar |
| y | s31_roar | sfx | 83.47 | X40_ammit_roar_deep | 0 | 0 | - | 0 | - | 0.5 | abs=-2,impact,bright | t<-31:roar@-0.38 | [deliberate] AMMIT ROARS ALONE (owner 21:04 louder, menacing): deep lioness -2 st + heavier chest layer, saturated, presence EQ, 1.9 s stone-hall tail; BGM out 83.47-84.70 |
| y | s31_plop | sfx | 84.75 | X22_comic_plop | hit | - | - | -2 | - | - | - | t<-31:plop | the hippo rump wiggles |
| y | s33_creak | sfx | 89.7 | S02_scale_settle | hit | - | 90.6 | -3 | - | 0.25 | - | t<-33:creak | the chain creaks as the pans wobble |
| y | s33_beat1 | sfx | 88.7 | synth:heart | hit | - | +0.6 | 0 | - | 0.1 | abs=-18 | t<-33:beat_1 | the heart alone, speeding up into the HIT |
| y | s33_beat2 | sfx | 89.35 | synth:heart | hit | - | +0.55 | 0 | - | 0.1 | abs=-17 | t<-33:beat_2 | |
| y | s33_beat3 | sfx | 89.9 | synth:heart | hit | - | +0.45 | 0 | - | 0.08 | abs=-16 | t<-33:beat_3 | |
| y | s33_beat4 | sfx | 90.35 | synth:heart | hit | - | +0.35 | 0 | - | 0.08 | abs=-15 | t<-33:beat_4 | |
| y | s33_beat5 | sfx | 90.7 | synth:heart1 | hit | - | +0.28 | 0 | - | 0.06 | abs=-14 | t<-33:beat_5 | |
| y | s33_beat6 | sfx | 90.98 | synth:heart1 | hit | - | +0.22 | 0 | - | 0.05 | abs=-13 | t<-33:beat_6 | |
| y | s33_beat7 | sfx | 91.2 | synth:heart1 | hit | - | +0.2 | 0 | - | 0.05 | abs=-12 | t<-33:beat_7 | |
| y | s34_zills | sfx | 91.4 | G3_zills | hit | - | - | -1 | - | - | - | t<-34:crash | the scarab: finger-cymbal crash on the verdict hit |
| y | s34_shine | sfx | 92.4 | synth:shine | hit | - | - | 6 | - | - | bright | t<-34:shine | the scarab SHINE (owner 17:07): a qanun glissando up D Hijaz rises into the white star (92.40), a D6 bowl rings from it, sistrum and sparkles after |
| y | s35_flip | sfx | 94.85 | X10_scarab_clack | hit | - | - | -2 | - | - | - | t<-35:lands | the scarab flips |
| y | s36_lid | sfx | 98.18 | X02_canopic_lid_clink | hit | - | - | -3 | - | 0.1 | - | t<-36:lid+clicks~mouth+snaps | the jar heart lid clicks shut |
| y | s37_whisper | amb | 99.45 | X09_judges_42_whisper_loop | 0 | 0 | 102.4 | -4 | 0.6 | 0.6 | - | t<-37:whispering | Ani whispering the spell |
| y | s38_wink | sfx | 103.86 | G3_zills | hit | - | - | -4 | - | - | - | t<-38:ting | the wink |
| y | s41_tip | sfx | 112.32 | X18_scale_tip_heavy | hit | - | - | 0 | - | - | - | t<-41:pan+crash | the pan crashes down |
| y | s41_snarl | sfx | 113.25 | X31_ammit_snarl_heavy | hit | - | - | 0 | - | 0.3 | abs=-5.5,impact,bright | t<-41:roar@+0.13 | Ammit roars again (41): the heavy snarl (chest layer, saturated, stone hall); the doom and the heartbeats duck hard under it |
| y | s42_growl | sfx | 113.97 | X28_ammit_growl | hit | - | +1.5 | 1 | - | 0.08 | duck=3,bright | t<-42:chomp@-1.45 | Ammit's growl rising into the bite |
| y | s42_chomp | sfx | 115.42 | X41_ammit_slam | hit | - | - | 0 | - | - | abs=-7,impact | t<-42:chomp | [deliberate] the BITE (owner 19:21): a heavy wet jaw SLAM with a low body, no crunch |
| y | s43_sand | amb | 117.35 | X03_natron_salt_pour | 0.4 | 0.4 | 119.5 | -5 | 0.3 | 1.0 | lp=8000,hp=500,env=117.35:0;119.5:-8 | t<-43:sand+dissolve | owner 20:27 (read as a river): a dry fine grain trickle, airy, quiet (about 12 LU under the dark bed), fading as the figure vanishes |
| y | s44_rewind | sfx | 120.05 | X03_natron_salt_pour | 0.6 | 0.6 | 121.25 | 0 | 0.05 | 0.02 | rev,lp=8000,hp=500,ramp=-14>0@1.15,abs=-21 | t<-44:reversed+sand~reverse+whoosh | the same dry sand, reversed: it rewinds into you |
| y | s45_sistrum | sfx | 122.7 | S06_sistrum | hit | - | - | -2 | - | - | - | t<-45:sistrum@+0.3 | Isis's sistrum |
| y | s46_gong | sfx | 126.25 | S07_gong | hit | - | - | -3 | - | 0.8 | - | t<-46:gong | warm gong: 言语真实 |
| y | s47_reeds | amb | 127.5 | X14_reeds_birds_water_loop | 0 | 0 | 134.45 | -4 | 0.8 | 0.6 | - | - | birds and water over the Field of Reeds (5 dB lower, owner 20:27) |
| y | s49_shabti | sfx | 135.2 | X16_shabti_clatter | 0 | 0 | - | -2 | - | 0.3 | - | t<-49:clatter@-0.05 | the shabtis stand up |
| y | s50_chorus | sfx | 138.0 | X25_tiny_chorus | hit | - | - | 1 | - | - | - | t<-50:squeaky+chorus | 「我在！」 |
| y | s51_whip | sfx | 142.4 | X23_whip_crack | hit | - | - | -2 | - | - | - | t<-51:whip | the overseer's whip |
| y | s52_reeds | amb | 143.6 | X14_reeds_birds_water_loop | 2.0 | 2.0 | 146.6 | -7 | 0.3 | 1.0 | - | - | water round the reed boat (5 dB lower, owner 20:27) |
| y | s53_roll | sfx | 146.95 | X04_papyrus_unroll | 0 | 0 | +0.95 | -3 | 0.05 | 0.25 | - | t<-53:scroll+rolling | the scroll rolls up |
| y | s54_heart | sfx | 150.0 | synth:heart | hit | - | +0.7 | 0 | - | 0.15 | - | t<-54:last+heartbeat | one last heartbeat |

Cut from v1 (owner: fewer, softer SFX): the CB1 blink tink, the door thud, knives 2-3, the cobra hiss, the judge's eye-lock tink,
the plumb-bob ticks, the croc jaw clack (Ammit now has her own voice), the chisel taps, the seal thump and zills, the end-card bowl.
