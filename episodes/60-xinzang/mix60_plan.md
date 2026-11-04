# ep60 《死后称心脏》 mix placement table (read by `tools/mix60.py`)

Clock: `story60.ts` (= script.md shot list), 160.6 s, fixed. Audio: cues/stings in `$S/snd60/cues/`, SFX in `$S/snd60/sfx/`
(`S` = the session scratchpad; override with env `SND60`). Re-time = edit `t` here or let the builders' sync tables move it, then
`python3 episodes/60-xinzang/tools/mix60.py` (≈ 1 min, writes `$S/snd60/mix60.wav` + `.mp3` + a loudness plot).

Columns
- `type`: `cue` (music, mastered −14 LUFS), `sting`, `sfx` (one-shot, auto-levelled), `amb` (bed, auto-levelled), `synth` (made here from egypt_cues instruments).
- `t`: film second at which source second `at` sounds. `at`: number or `hit` (cues.json hit / VERDICT_HIT, sfx_rows hit); default 0 for cues, `hit` for sfx.
- `in`: first source second played (default `at` for cues, 0 for sfx). Loops (`*_loop`) wrap, so `in` may run past the end.
- `end`: film second where it stops (fade-out ends there); `+x` = t + x; blank = natural end of the file.
- `gain`: dB. Music: straight gain on the −14 LUFS file. sfx: offset from the auto level (peak = local music momentary loudness +2 dB,
  capped 1 dB under the local music peak unless `impact`; owner ep14 v10 "+1…+4 dB peak, never above the music"). amb: offset from local −8 LU.
- `fin`/`fout`: equal-power fade lengths (s). `fx`: `tapestop=d` (slow to a stop over the last d s), `ramp=a>b@d` (dB ramp from the entry),
  `pan=p`, `abs=x` (sfx peak / amb loudness fixed at x, for moments with no music), `impact`, `lock=p` (shift by < p/2 so a beat lands on the synced time).
- `sync`: `[t|end|lock]<-shot:label` (label = substring of a builder's event in `sync60_*.md`; `a~b` = either). Found → that time replaces it.
- `on`: `n` mutes a row.

## Music (cue changes only on scene changes; every incoming cue starts on its own downbeat)

| on | id | type | t | file | at | in | end | gain | fin | fout | fx | sync | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| y | m01_frame0 | sting | 0 | sting_roll_hit | hit | 1.152 | - | -3 | 0.002 | 0.3 | - | - | frame 0: dum + zills on the first sample (owner: something happens on the music inside the first second) |
| y | m02_heart | cue | 0 | tension_loop | 0 | 0 | 7.55 | -1 | 0.002 | 0.2 | lock=0.76923 | lock<-2:pulse~glow~heartbeat | heartbeat bed under the cold open; one beat of air before the title (fades out 7.35-7.55) |
| y | m03_flourish | sting | 7.9 | sting_reed_flourish | hit | 0 | - | -6 | 0.01 | 0.4 | - | - | the D-Hijaz reed run fills the gap and lands on the title (the hardest hit so far) |
| y | m04_title | cue | 7.9 | mystic_loop | 0 | 0 | 14.3 | -1 | 0.002 | 0.08 | - | - | title + Thebes: bowl + bendir on the title downbeat |
| y | m05_embalm | cue | 14.3 | groove_loop | 0 | 0 | 26.5 | 0 | 0.002 | 0.08 | - | - | embalming → heart memory → scarab (script's 6-s mystic at 20.4 merged in: no ping-pong) |
| y | m06_book | cue | 26.5 | playful_loop | 0 | 0 | 40.8 | -1 | 0.002 | 0.08 | - | - | Book of the Dead, spell menu, CB1 |
| y | m07_duat | cue | 40.8 | tension | 24.615 | 24.315 | 49.7 | 0 | 0.3 | 0.3 | - | - | the journey: tension bars 9-11 (heartbeat, rub, teks); pad pre-laps the cut by 0.3 s; a breath (0.1 s) before the hall downbeat |
| y | m08_hall | cue | 49.8 | mystic_loop | 0 | 0 | 58.4 | 0 | 0.002 | 0.6 | - | - | HALL REVEAL on the mystic downbeat (bowl + bendir), runs under the 42 judges and the three names |
| y | m09_roll | sting | 58.4 | sting_roll_hit | hit | 0.55 | 58.4 | -4 | 0.02 | 0.01 | - | - | one-beat darbuka roll into the oath groove (shot 21: "darbuka groove starts"); stops on the groove's own dum |
| y | m10_oath | cue | 58.4 | groove_loop | 0 | 0 | 70.3 | 0 | 0.002 | 0.01 | tapestop=0.3 | end<-25:stop~freeze~话太多 | the oath groove; tape-stops dead on 话太多 (the joke) |
| y | m11_weigh | cue | 94.4 | tension_hush | hit | 29.221 | 97.3 | 0 | 0.01 | 0.7 | ramp=-6>0@3.5 | - | heartbeat enters 1 s after the tape-stop (71.32, beat 3 of bar 10); climb 79.0-91.3, hush 91.32, silent beat 93.63, HIT 94.40 = 「等等——」 |
| y | m12_magic | cue | 97.0 | playful_loop | 0 | 0 | 115.0 | -1 | 0.002 | 0.04 | - | - | the scarab spell, Ani, Hatnefer (CB3); bar-8 "bwoop" lands on 改个名 |
| y | m13_doom | sting | 115.0 | sting_doom | hit | 0 | 118.6 | -1 | 0.002 | 0.03 | - | end<-42:bite~chomp~jaws | 秤歪了: sub drop + growl + falling reed; cut dead on the bite |
| y | m14_lastbeats | cue | 118.6 | tension_hush | 51.538 | 49.221 | +0 | -2 | 0.05 | 0.015 | - | t<-42:bite~chomp~jaws | callback: shot 33's accelerating heartbeat, this time no rescue; stops dead on the bite |
| y | m15_void | synth | 119.9 | drone:D2,D3,A2 | 0 | 0 | 123.1 | -8 | 1.2 | 0.02 | ramp=-10>0@3.0 | - | 第二次死亡: a low drone swelling under the sand, dead stop at 123.1 |
| y | m16_rewind | sting | 123.63 | sting_reveal | hit | 0 | - | -4 | 0.01 | 0.5 | - | t<-44:level~flat~gold | qanun glissando = the sand rewinding; D-major chord + bowl when the pans level |
| y | m17_paradise | cue | 123.63 | paradise_loop | 0 | 0 | 134.4 | 0 | 0.02 | 0.03 | - | t<-44:level~flat~gold | the release: harp over D, Gm, Eb, D; Osiris, 言语真实, the Field of Reeds |
| y | m18_hiccup | sting | 134.4 | sting_comic | hit | 0 | - | -3 | 0.002 | 0.3 | - | - | 「但是——」 the music hiccups: oud dun-dun + reed wah |
| y | m19_shabti | cue | 137.2 | playful_loop | 34.286 | 34.286 | 146.6 | -1 | 0.002 | 0.06 | - | - | playful bars 17-21: claps = the shabti march |
| y | m20_rest | cue | 146.6 | paradise_loop | 41.154 | 41.154 | 154.6 | -1 | 0.06 | 0.03 | ramp=0>-5@8 | - | boat + museum: the last bar (D, the ney's last phrase) from 151.6; falls away (-5 dB over the section: owner "endings fall apart"), dead stop on the end card |
| y | m21_seal_bowl | synth | 155.65 | bowl:D4 | 0 | 0 | 160.5 | -8 | 0.002 | 0.8 | - | t<-55:seal | after ~1 s of air, the seal resolves to D: bowl ring-out under the end card (owner: endings fade) |

## SFX (one family: bronze, stone, papyrus, the beast; tonal ones tuned to D Hijaz). `t` = the hit (loudest moment).

| on | id | type | t | file | at | in | end | gain | fin | fout | fx | sync | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| y | s03_pan | sfx | 5.5 | X17_heart_on_pan | hit | - | - | 1 | - | - | - | t<-3:heart~drop~clang~lands | heart drops on the pan |
| y | s03_eyes | sfx | 6.9 | S04_beast_growl | hit | - | - | -3 | 0.05 | 0.4 | - | t<-3:eyes~growl | low growl as the yellow eyes open |
| y | s04_gong | sfx | 7.9 | S07_gong | hit | - | - | -4 | - | - | - | - | deep gong on the title |
| y | s06_jar1 | sfx | 15.2 | X02_canopic_lid_clink | hit | - | +0.35 | -1 | - | 0.1 | pan=-0.3 | t<-6:jar 1~jar1 | four jars land |
| y | s06_jar2 | sfx | 15.8 | X02_canopic_lid_clink | hit | - | +0.35 | -2 | - | 0.1 | pan=-0.1 | t<-6:jar 2~jar2 | |
| y | s06_jar3 | sfx | 16.4 | X02_canopic_lid_clink | hit | - | +0.35 | -2 | - | 0.1 | pan=0.1 | t<-6:jar 3~jar3 | |
| y | s06_jar4 | sfx | 17.0 | X02_canopic_lid_clink | hit | - | +0.35 | -1 | - | 0.1 | pan=0.3 | t<-6:jar 4~jar4 | |
| y | s07_basket | sfx | 19.4 | X22_comic_plop | hit | - | - | 3 | - | - | - | t<-7:basket~lands~thup | brain puff lands in the basket |
| y | s09_ring | sfx | 25.0 | G3_zills | hit | - | - | -2 | - | - | - | t<-9:ring~highlight | scarab highlight: the zill motif is planted (pays off at 94.4) |
| y | s10_unroll | sfx | 28.0 | X04b_papyrus_unroll_slap | hit | - | - | 3 | - | - | - | t<-10:unroll~open~slap | the roll whips open like a banner |
| y | s14_pen | sfx | 39.4 | X05_reed_pen_scratch | hit | - | - | -1 | - | 0.2 | - | t<-14:pen~writes~name | Ani's name written into the gap |
| y | s15_door | sfx | 41.7 | S08_stone_door | hit | - | - | -1 | 0.05 | 0.3 | - | t<-15:door | tomb door grinds shut behind you |
| y | s16_knife1 | sfx | 44.1 | X19_knife_shing | hit | - | - | -1 | - | - | pan=-0.3 | t<-16:knife 1~glint 1 | knives glint one after another |
| y | s16_knife2 | sfx | 44.9 | X19_knife_shing | hit | - | - | -2 | - | - | pan=0 | t<-16:knife 2~glint 2 | |
| y | s16_knife3 | sfx | 45.7 | X19_knife_shing | hit | - | - | -3 | - | - | pan=0.3 | t<-16:knife 3~glint 3 | |
| n | s17_hiss | sfx | 47.0 | X07_serpent_hiss | hit | - | - | -3 | - | - | - | t<-17:cobra~hiss | (muted: one sound per beat; the croc snap carries the shot) |
| y | s17_croc | sfx | 48.0 | S03_croc_snap | hit | - | - | 3 | - | - | - | t<-17:croc~snap~lunge | the crocodile lunges at the lens |
| y | s18_doors | sfx | 50.1 | X08_bronze_gate_creak | hit | - | - | -2 | - | 0.3 | - | t<-18:doors~open~boom | huge doors open on the hall |
| y | s19_whisper | amb | 52.7 | X09_judges_42_whisper_loop | 0 | 0 | 55.6 | 0 | 1.2 | 0.4 | - | - | murmur rising along the 42 judges |
| y | s20_stab1 | sfx | 55.55 | S11_frame_drum | hit | - | - | 0 | - | - | - | t<-20:punch 1~punch-in 1~碎骨者 | three stabs, one per punch-in |
| y | s20_stab2 | sfx | 56.45 | S11_frame_drum | hit | - | - | 0 | - | - | - | t<-20:punch 2~punch-in 2~吞影者 | |
| y | s20_stab3 | sfx | 57.35 | S11_frame_drum | hit | - | - | 1 | - | - | - | t<-20:punch 3~punch-in 3~食血者 | |
| y | s22_tick1 | sfx | 62.2 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-22:check 1~tick 1~nod 1 | gold check-marks: one stone "tock" each |
| y | s22_tick2 | sfx | 62.8 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-22:check 2~tick 2~nod 2 | |
| y | s22_tick3 | sfx | 63.4 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-22:check 3~tick 3~nod 3 | |
| y | s23_tick | sfx | 66.2 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-23:check~tick~nod | |
| y | s24_glint | sfx | 67.9 | X12_scale_ding | hit | - | - | -3 | - | 0.4 | - | t<-24:glint~ting | the scale glints behind you (plant for the twist) |
| y | s24_tick | sfx | 68.9 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-24:check~tick~nod | |
| y | s25_cricket | sfx | 70.6 | X20_cricket | hit | - | 73.4 | 0 | - | 0.5 | abs=-17 | - | one cricket in the dead air |
| y | s29_pen | sfx | 81.9 | X05_reed_pen_scratch | hit | - | - | -1 | - | 0.2 | - | t<-29:scratch~pen~writes | Thoth's first stroke |
| y | s30_growl | sfx | 83.4 | S04_beast_growl | hit | - | - | -3 | - | 0.4 | - | t<-30:growl~ammit | Ammit under the scale |
| y | s31_jaw | sfx | 85.9 | S03_croc_snap | hit | - | +0.5 | -1 | - | 0.15 | - | t<-31:jaw~clack~croc | tilt 1: crocodile jaws clack |
| y | s31_plop | sfx | 87.7 | X22_comic_plop | hit | - | - | 1 | - | - | - | t<-31:wiggle~hippo~plop | tilt 3: the hippo bottom wiggles |
| y | s33_creak | sfx | 92.6 | S02_scale_settle | hit | - | 93.6 | -2 | - | 0.25 | - | t<-33:wobble~creak~dip | chain creak as the pans wobble (kept out of the silent beat) |
| y | s34_zills | sfx | 94.4 | G3_zills | hit | - | - | -1 | - | - | - | - | the scarab: finger-cymbal crash on the verdict hit (pays off 25.0) |
| y | s35_flip | sfx | 97.7 | X10_scarab_clack | hit | - | - | 0 | - | - | - | t<-35:flip | the scarab flips over |
| y | s36_lid | sfx | 101.6 | X02_canopic_lid_clink | hit | - | - | 0 | - | 0.1 | - | t<-36:click~lid~shut | the heart's lid clicks shut |
| y | s37_whisper | amb | 102.4 | X09_judges_42_whisper_loop | 0 | 0 | 105.4 | -3 | 0.6 | 0.6 | - | - | Ani whispering the spell under the music |
| y | s38_wink | sfx | 106.7 | G3_zills | hit | - | - | -4 | - | - | - | t<-38:wink | a tiny tink on the wink |
| y | s41_tip | sfx | 115.0 | X18_scale_tip_heavy | hit | - | - | 2 | - | - | - | t<-41:crash~drop~bang~pan | the pan crashes down |
| y | s42_chomp | sfx | 118.6 | S03_croc_snap | hit | - | - | 0 | - | - | abs=-9,impact | t<-42:bite~chomp~jaws | CHOMP: the one impact allowed above the music (owner ep13); music cut on it |
| y | s43_sand | amb | 119.9 | S09_sand_wind_loop | 0 | 0 | 123.1 | 2 | 0.6 | 0.05 | abs=-30 | - | the silhouette blows away as sand |
| n | s44_ding | sfx | 123.63 | X12_scale_ding | hit | - | - | 0 | - | - | - | t<-44:level~flat~gold | (muted: the reveal sting already rings its chord + bowl on the level; a second ding only piled up) |
| y | s45_sistrum | sfx | 126.4 | S06_sistrum | hit | - | - | -2 | - | - | - | t<-45:osiris~shrine~sistrum | sistrum as Osiris is revealed |
| y | s46_gong | sfx | 129.6 | S07_gong | hit | - | - | -2 | - | 0.8 | - | t<-46:verdict~glyph~crook | warm low gong: 言语真实 (rhymes with the title gong) |
| y | s47_reeds | amb | 130.8 | X14_reeds_birds_water_loop | 0 | 0 | 136.0 | 3 | 0.8 | 1.2 | - | - | birds and water over the Field of Reeds |
| y | s49_shabti | sfx | 138.6 | X16_shabti_clatter | hit | - | - | -1 | - | 0.3 | - | t<-49:stand~clatter~box | the shabtis stand up in rows |
| y | s51_whip | sfx | 145.2 | X23_whip_crack | hit | - | - | 4 | - | - | - | t<-51:whip | one overseer's whip crack |
| y | s52_reeds | amb | 146.6 | X14_reeds_birds_water_loop | 2.0 | 2.0 | 149.6 | -1 | 0.3 | 1.0 | - | - | water and birds round the reed boat |
| y | s53_roll | sfx | 150.0 | X04_papyrus_unroll | hit | - | - | 1 | 0.05 | 0.3 | - | t<-53:roll~scroll | the scroll rolls up into the case |
| y | s54_heart | sfx | 152.6 | S01_heartbeat | hit | - | +0.55 | 2 | - | 0.15 | - | t<-54:heartbeat~settle~level | one last heartbeat as the beam settles |
| y | s55_seal | sfx | 155.65 | S11_frame_drum | hit | - | - | 0 | - | - | abs=-11 | t<-55:seal | the J seal pressed in: a deep thump |
| y | s55_zills | sfx | 155.65 | G3_zills | hit | - | - | 0 | - | - | abs=-19 | t<-55:seal | one finger-cymbal ring-out |
