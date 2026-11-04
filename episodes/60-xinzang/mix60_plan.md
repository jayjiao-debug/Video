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
| y | m02_heart | cue | 2.8 | tension_loop | 3.0769 | 0.2769 | 7.75 | -1 | 0.002 | 0.2 | lock=0.76923 | lock<-2:heartbeat#1 | heartbeat bed; its bar line on the 2.8 cut, so the lub-dubs land on the two glow pulses (3.57, 4.34); fades after the 7.42 beat |
| y | m03_flourish | sting | 8.0 | sting_reed_flourish | hit | 0 | - | -6 | 0.01 | 0.4 | - | t<-4:cartouche+lands | the reed run (7.6-8.0) bridges the cut and lands with the cartouche slam (8.00): the title is the hardest hit so far |
| y | m04_title | cue | 8.0 | mystic_loop | 0 | 0 | 14.3 | -1 | 0.002 | 0.08 | - | t<-4:cartouche+lands | title + Thebes: bowl + bendir on the slam (8.00); palette tap 12.25 sits on a mystic beat |
| y | m05_embalm | cue | 14.3 | groove_loop | 0 | 0 | 20.4 | 0 | 0.002 | 0.3 | - | - | embalming: jars on groove beats from 14.30 (builder A locked 14.88-16.61, boing 18.35, pop 18.92, thup 20.07 to it) |
| y | m05b_memory | cue | 20.4 | mystic_loop | 13.846 | - | 26.5 | 0 | 0.3 | 0.08 | - | - | inside the mummy: mystic from bar 5 (the Eb colour, darker than the title) under the heart-lantern and the scarab |
| y | m06_book | cue | 26.5 | playful_loop | 0 | 0 | 40.8 | -1 | 0.002 | 0.08 | - | - | Book of the Dead, spell menu, CB1 |
| y | m07_duat | cue | 40.8 | tension | 24.615 | 24.315 | 49.7 | 0 | 0.3 | 0.3 | - | - | the journey: tension bars 9-11 (heartbeat, rub, teks); pad pre-laps the cut by 0.3 s; a breath (0.1 s) before the hall downbeat |
| y | m08_hall | cue | 49.8 | mystic_loop | 0 | 0 | 58.4 | 0 | 0.002 | 0.6 | - | - | HALL REVEAL on the mystic downbeat (bowl + bendir), runs under the 42 judges and the three names |
| y | m09_roll | sting | 58.4 | sting_roll_hit | hit | 0.55 | 58.4 | -4 | 0.02 | 0.01 | - | - | one-beat darbuka roll into the oath groove (shot 21: "darbuka groove starts"); stops on the groove's own dum |
| y | m10_oath | cue | 58.4 | groove_loop | 0 | 0 | 70.65 | 0 | 0.002 | 0.01 | tapestop=0.3 | end<-25:freeze~stop@+0.25 | the oath groove; tape-stops on the freeze (70.40, 话太多) and is dead by 70.65 |
| y | m11_weigh | cue | 94.4 | tension_hushdry | hit | 29.99 | 97.3 | 0 | 0.01 | 0.7 | ramp=-6>0@3.0 | - | heartbeat enters on the 72.1 cut (beat 4 of bar 10); bar 11 downbeat 72.86 = the judge eyes lock; climb 79.0-91.3; hush (drone only) 91.32; music silent 93.63; HIT 94.40 = 「等等——」 |
| y | m12_magic | cue | 97.0 | playful_loop | 0 | 0 | 115.0 | -1 | 0.002 | 0.04 | - | - | the scarab spell, Ani, Hatnefer (CB3); bar-8 "bwoop" lands on 改个名 |
| y | m13_doom | sting | 115.32 | sting_doom | hit | 0 | 118.42 | -1 | 0.002 | 0.03 | - | t<-41:pan+crash | 秤歪了: the red cut, 0.3 s of air, then the doom on the pan bang; cut dead on the bite |
| y | m14_lastbeats | cue | 118.42 | tension_hush | 51.538 | 49.221 | +0 | -2 | 0.05 | 0.015 | - | t<-42:chomp | callback: shot 33's accelerating heartbeat, this time no rescue; stops dead on the bite |
| y | m15_void | synth | 118.45 | drone:D2,D3,A2 | 0 | 0 | 123.1 | -8 | 0.6 | 0.02 | ramp=-9>0@4.6 | t<-42:chomp@+0.03 | the void: a low drone rises out of the chomp (no dead air over the black frame, owner ep29), swells under the sand, dead stop at 123.1 |
| y | m16_rewind | sting | 124.3 | sting_reveal | hit | 0 | - | -4 | 0.01 | 0.5 | - | t<-44:bright+chime | qanun glissando = the sand rewinding; D-major chord + bowl when the pans level |
| y | m17_paradise | cue | 124.3 | paradise_loop | 0 | 0 | 135.8 | 0 | 0.02 | 0.02 | tapestop=0.2 | t<-44:bright+chime | the release: harp over D, Gm, Eb, D; Osiris, 言语真实, the Field of Reeds, and on under the plough until the deadpan look (135.80), where it hiccups (a 0.2 s tape-stop) |
| y | m18_hiccup | sting | 135.8 | sting_comic | hit | 0 | 137.5 | -3 | 0.002 | 0.3 | - | t<-48:deadpan | 「但是——」... the deadpan look (135.80): oud dun-dun + reed wah |
| y | m19_shabti | cue | 137.2 | playful_loop | 34.286 | 34.286 | 146.6 | -1 | 0.002 | 0.06 | - | - | playful bars 17-21: claps = the shabti march |
| y | m20_rest | cue | 146.6 | paradise_loop | 41.154 | 41.154 | 154.6 | -1 | 0.06 | 0.03 | ramp=0>-5@8 | - | boat + museum: the last bar (D, the ney's last phrase) from 151.6; falls away (-5 dB over the section: owner "endings fall apart"), dead stop on the end card |
| y | m21_seal_bowl | synth | 155.65 | bowl:D4 | 0 | 0 | 160.5 | -8 | 0.002 | 0.8 | - | - | after ~1 s of air, the seal resolves to D: bowl ring-out under the end card (owner: endings fade) |

## SFX (one family: bronze, stone, papyrus, the beast; tonal ones tuned to D Hijaz). `t` = the hit (loudest moment).

| on | id | type | t | file | at | in | end | gain | fin | fout | fx | sync | note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| n | s01_thup | sfx | 1.2 | X22_comic_plop | hit | - | - | 3 | - | - | - | t<-1:basket~lands~thup | (muted: it lands 70 ms before a bed heartbeat and merges with it) |
| y | s03_pan | sfx | 5.45 | X18_scale_tip_heavy | hit | - | - | 0 | - | - | - | t<-3:heart+lands | CLANG + chain rattle as the heart drops on the pan (the scale's own sound; it returns at 115.0) |
| y | s03_eyes | sfx | 7.5 | S04_beast_growl | hit | - | 8.05 | -3 | 0.05 | 0.4 | - | t<-3:yellow+eyes@+0.4 | low growl as the yellow eyes open (7.15) |
| y | s04_gong | sfx | 8.0 | S07_gong | hit | - | - | -4 | - | - | - | t<-4:cartouche+lands | deep gong on the cartouche slam |
| y | s06_jar1 | sfx | 14.88 | X02_canopic_lid_clink | hit | - | +0.35 | -1 | - | 0.1 | pan=-0.3 | t<-6:canopic#1 | four jars land |
| y | s06_jar2 | sfx | 15.45 | X02_canopic_lid_clink | hit | - | +0.35 | -2 | - | 0.1 | pan=-0.1 | t<-6:canopic#2 |  |
| y | s06_jar3 | sfx | 16.03 | X02_canopic_lid_clink | hit | - | +0.35 | -2 | - | 0.1 | pan=0.1 | t<-6:canopic#3 |  |
| y | s06_jar4 | sfx | 16.61 | X02_canopic_lid_clink | hit | - | +0.35 | -1 | - | 0.1 | pan=0.3 | t<-6:canopic#4 |  |
| y | s07_basket | sfx | 20.07 | X22_comic_plop | hit | - | - | 3 | - | - | - | t<-7:puff+lands | the puff lands in the basket (callback of 1.20), on a groove beat |
| y | s08_beat1 | sfx | 20.65 | synth:heart | hit | - | +0.6 | 0 | - | 0.12 | - | t<-8:heartbeat#1 | the heart-lantern pulses (heartbeat under) |
| y | s08_beat2 | sfx | 21.50 | synth:heart | hit | - | +0.6 | 0 | - | 0.12 | - | t<-8:heartbeat#2 |  |
| y | s08_beat3 | sfx | 22.35 | synth:heart | hit | - | +0.6 | 0 | - | 0.12 | - | t<-8:heartbeat#3 |  |
| y | s08_beat4 | sfx | 23.20 | synth:heart | hit | - | +0.6 | 0 | - | 0.12 | - | t<-8:heartbeat#4 |  |
| y | s09_ring | sfx | 24.75 | G3_zills | hit | - | - | -2 | - | - | - | t<-9:gold+ring | scarab highlight: the zill motif is planted (pays off at 94.4) |
| y | s10_unroll | sfx | 28.0 | X04_papyrus_unroll | hit | - | - | 3 | - | 0.3 | - | t<-10:whips+open@+0.6 | the roll whips open like a banner (27.45-28.10): crackle peaks as it lands flat |
| y | s13_blink | sfx | 36.1 | G3_zills | hit | - | - | -3 | - | - | - | t<-13:slot+blinks | CB1: the empty name slot blinks (the zill family: magic / the cheat) |
| y | s14_pen | sfx | 38.95 | X05_reed_pen_scratch | 0.8 | 0.8 | 40.0 | -1 | - | 0.15 | - | t<-14:pen+writes | Ani name written into the gap (38.95-39.95) |
| y | s15_door | sfx | 41.58 | S08_stone_door | hit | 0.75 | - | -1 | 0.05 | 0.3 | - | t<-15:thud~shut~door | tomb door grinds shut behind you |
| y | s16_knife1 | sfx | 43.8 | X19_knife_shing | hit | - | - | -1 | - | - | pan=-0.45 | t<-16:knife 1~glint 1 | knives glint one after another |
| y | s16_knife2 | sfx | 44.4 | X19_knife_shing | hit | - | - | -2 | - | - | pan=-0.15 | t<-16:knife 2~glint 2 |  |
| y | s16_knife3 | sfx | 45.0 | X19_knife_shing | hit | - | - | -2 | - | - | pan=0.15 | t<-16:knife 3~glint 3 |  |
| y | s16_knife4 | sfx | 45.6 | X19_knife_shing | hit | - | - | -3 | - | - | pan=0.45 | t<-16:knife_4~glint_4~glint#4 | - |
| y | s17_hiss | sfx | 46.75 | X07_serpent_hiss | hit | - | - | -3 | - | - | - | t<-17:cobra~hiss | the cobra rears |
| y | s17_croc | sfx | 47.6 | S03_croc_snap | hit | - | - | 3 | - | - | - | t<-17:croc~snap~lunge | the crocodile lunges at the lens |
| y | s18_doors | sfx | 50.0 | X08_bronze_gate_creak | hit | - | - | -2 | - | 0.3 | - | t<-18:doors~open~boom | huge doors open on the hall |
| y | s19_whisper | amb | 52.7 | X09_judges_42_whisper_loop | 0 | 0 | 55.6 | 0 | 1.2 | 0.4 | - | - | murmur rising along the 42 judges |
| y | s20_stab1 | sfx | 55.4 | S11_frame_drum | hit | - | - | 0 | - | - | - | t<-20:punch 1~punch-in 1~碎骨者 | three stabs, one per punch-in |
| y | s20_stab2 | sfx | 56.3 | S11_frame_drum | hit | - | - | 0 | - | - | - | t<-20:punch 2~punch-in 2~吞影者 |  |
| y | s20_stab3 | sfx | 57.2 | S11_frame_drum | hit | - | - | 1 | - | - | - | t<-20:punch 3~punch-in 3~食血者 |  |
| y | s22_tick1 | sfx | 62.0 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-22:check 1~tick 1~nod 1 | gold check-marks: one stone "tock" each |
| y | s22_tick2 | sfx | 62.6 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-22:check 2~tick 2~nod 2 |  |
| y | s22_tick3 | sfx | 63.2 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-22:check 3~tick 3~nod 3 |  |
| y | s23_tick | sfx | 65.65 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-23:check~tick~nod |  |
| y | s24_glint | sfx | 67.3 | X12_scale_ding | hit | - | - | -3 | - | 0.4 | - | t<-24:glint~ting | the scale glints behind you (plant for the twist) |
| y | s24_tick | sfx | 68.9 | X10_scarab_clack | hit | - | +0.14 | 0 | - | 0.04 | - | t<-24:check~tick~nod | |
| y | s25_squeak | sfx | 70.5 | synth:squeak | hit | - | - | 2 | - | - | - | t<-25:squeak | one reed squeaks as the band stops |
| y | s25_cricket | sfx | 71.3 | X20_cricket | hit | - | 72.9 | 0 | - | 0.5 | abs=-17 | t<-25:cricket | one cricket in the dead air |
| y | s27_tick1 | sfx | 75.5 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-27:tick_1~ticks#1~tick#1 | the plumb-bob taps the post |
| y | s27_tick2 | sfx | 76.0 | X10_scarab_clack | hit | - | +0.14 | -4 | - | 0.04 | - | t<-27:tick_2~ticks#2~tick#2 | - |
| y | s27_tick3 | sfx | 76.45 | X10_scarab_clack | hit | - | +0.14 | -5 | - | 0.04 | - | t<-27:tick_3~ticks#3~tick#3 | - |
| y | s29_pen | sfx | 81.75 | X05_reed_pen_scratch | hit | - | - | -1 | - | 0.2 | - | t<-29:scratch~pen~writes | Thoth's first stroke |
| y | s30_growl | sfx | 83.25 | S04_beast_growl | hit | - | - | -3 | - | 0.4 | - | t<-30:growl~ammit | Ammit under the scale |
| y | s31_jaw | sfx | 85.9 | S03_croc_snap | hit | - | +0.5 | -1 | - | 0.15 | - | t<-31:jaw~clack~croc | tilt 1: crocodile jaws clack |
| y | s31_plop | sfx | 87.75 | X22_comic_plop | hit | - | - | 1 | - | - | - | t<-31:wiggle~hippo~plop | tilt 3: the hippo bottom wiggles |
| y | s33_creak | sfx | 92.7 | S02_scale_settle | hit | - | 93.6 | -2 | - | 0.25 | - | t<-33:wobble~creak~dip | chain creak as the pans wobble (kept out of the silent beat) |
| y | s33_beat1 | sfx | 91.7 | synth:heart | hit | - | +0.6 | - | - | 0.1 | abs=-18 | t<-33:beat_1~beats#1 | the heart alone, speeding up on the picture pulses, through the silent beat into the HIT |
| y | s33_beat2 | sfx | 92.35 | synth:heart | hit | - | +0.55 | - | - | 0.1 | abs=-17 | t<-33:beat_2~beats#2 | - |
| y | s33_beat3 | sfx | 92.9 | synth:heart | hit | - | +0.45 | - | - | 0.08 | abs=-16 | t<-33:beat_3~beats#3 | - |
| y | s33_beat4 | sfx | 93.35 | synth:heart | hit | - | +0.35 | - | - | 0.08 | abs=-15 | t<-33:beat_4~beats#4 | - |
| y | s33_beat5 | sfx | 93.7 | synth:heart1 | hit | - | +0.28 | - | - | 0.06 | abs=-14 | t<-33:beat_5~beats#5 | - |
| y | s33_beat6 | sfx | 93.98 | synth:heart1 | hit | - | +0.22 | - | - | 0.05 | abs=-13 | t<-33:beat_6~beats#6 | - |
| y | s33_beat7 | sfx | 94.2 | synth:heart1 | hit | - | +0.2 | - | - | 0.05 | abs=-12 | t<-33:beat_7~beats#7 | - |
| y | s34_zills | sfx | 94.4 | G3_zills | hit | - | - | -1 | - | - | - | t<-34:crash | the scarab: finger-cymbal crash on the verdict hit (pays off 25.0) |
| y | s35_flip | sfx | 97.85 | X10_scarab_clack | hit | - | - | 0 | - | - | - | t<-35:lands | the scarab flips over |
| y | s36_lid | sfx | 101.18 | X02_canopic_lid_clink | hit | - | - | 0 | - | 0.1 | - | t<-36:lid+click | the heart's lid clicks shut |
| y | s37_whisper | amb | 102.45 | X09_judges_42_whisper_loop | 0 | 0 | 105.4 | -3 | 0.6 | 0.6 | - | t<-37:whispering | Ani whispering the spell under the music |
| y | s38_wink | sfx | 106.86 | G3_zills | hit | - | - | -4 | - | - | - | t<-38:ting | a tiny tink on the wink |
| y | s39_tap1 | sfx | 110.4 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-39:chisel#1 | three chisel taps: her name cut in |
| y | s39_tap2 | sfx | 110.75 | X10_scarab_clack | hit | - | +0.14 | -3 | - | 0.04 | - | t<-39:chisel#2 | - |
| y | s39_tap3 | sfx | 111.1 | X10_scarab_clack | hit | - | +0.14 | -2 | - | 0.04 | - | t<-39:chisel#3 | - |
| y | s40_roll | sting | 113.5 | sting_roll_hit | hit | 0.35 | 115.0 | -6 | 0.05 | 0.3 | - | t<-40:ending+shrug | the sly darbuka roll (112.8) ending on Hatnefer shrug (113.50): dum + zills = the cheat motif |
| y | s41_tip | sfx | 115.32 | X18_scale_tip_heavy | hit | - | - | 2 | - | - | - | t<-41:pan+crash | the pan crashes down |
| y | s41_roar | sfx | 115.98 | S04_beast_growl | hit | - | - | -2 | - | 0.4 | - | t<-41:roar | Ammit roars (jaws wide) |
| y | s42_chomp | sfx | 118.42 | S03_croc_snap | hit | - | - | 0 | - | - | abs=-9,impact | t<-42:chomp | CHOMP: the one impact allowed above the music (owner ep13); music cut on it |
| y | s43_sand | amb | 120.35 | S09_sand_wind_loop | 0 | 0 | 122.55 | 2 | 0.5 | 0.3 | abs=-30 | t<-43:sand+dissolve | the silhouette crumbles (120.35-122.5) and blows away as sand |
| y | s44_rewind | sfx | 123.05 | S09_sand_wind_loop | 0.6 | 0.6 | 124.0 | - | 0.05 | 0.02 | rev,ramp=-14>0@1.2,abs=-15 | t<-44:reverse+whoosh | the same sand, reversed: it rewinds into you, swelling into the level (124.3) |
| n | s44_ding | sfx | 123.63 | X12_scale_ding | hit | - | - | 0 | - | - | - | t<-44:level~flat~gold | (muted: the reveal sting already rings its chord + bowl on the level; a second ding only piled up) |
| y | s45_sistrum | sfx | 126.4 | S06_sistrum | hit | - | - | -2 | - | - | - | t<-45:sistrum@+0.3 | sistrum as Osiris is revealed |
| y | s46_gong | sfx | 129.25 | S07_gong | hit | - | - | -2 | - | 0.8 | - | t<-46:gong | warm low gong: 言语真实 (rhymes with the title gong) |
| y | s47_reeds | amb | 130.5 | X14_reeds_birds_water_loop | 0 | 0 | 137.45 | 3 | 0.8 | 0.6 | - | - | birds and water over the Field of Reeds, carried through the deadpan plough beat (no dead air before the shabtis) |
| y | s49_shabti | sfx | 138.2 | X16_shabti_clatter | 0 | 0 | - | -1 | - | 0.3 | - | t<-49:clatter@-0.05 | the shabtis stand up in rows |
| y | s51_whip | sfx | 145.4 | X23_whip_crack | hit | - | - | 4 | - | - | - | t<-51:whip | one overseer's whip crack |
| y | s52_reeds | amb | 146.6 | X14_reeds_birds_water_loop | 2.0 | 2.0 | 149.6 | -1 | 0.3 | 1.0 | - | - | water and birds round the reed boat |
| y | s53_roll | sfx | 149.95 | X04_papyrus_unroll | 0 | 0 | +0.95 | 1 | 0.05 | 0.25 | - | t<-53:scroll+rolling | the scroll rolls up into the case |
| y | s54_heart | sfx | 153.0 | synth:heart | hit | - | +0.7 | 1 | - | 0.15 | - | t<-54:last+heartbeat | one last heartbeat as the beam settles |
| y | s55_seal | sfx | 155.65 | S11_frame_drum | hit | - | - | 0 | - | - | abs=-11 | - | the J seal pressed in: a deep thump |
| y | s55_zills | sfx | 155.65 | G3_zills | hit | - | - | 0 | - | - | abs=-19 | - | one finger-cymbal ring-out |
