Design C 「课本金」 is now the one sword in all of ep53 v3, and every item in the brief is done. I checked all 32 brief stills, a few extra times, the hand-off frames, and low-res videos of 0–21 s, 38.9–56 s and 92.7–111.4 s against the untouched code. Nothing is committed and no renders are in the repo; they're all under /tmp.

**What changed**
- **One spec (`swordspec53s.tsx`):** the geometry and colours of design C are ported in. That gives:
  - the outline: widest at the guard, a slight narrowing in the front third, a long point;
  - plain 4.5 mm edge bands;
  - square 12.4 mm diamonds, each in a pale frame, with a dark 8-point star at every crossing;
  - a near-black hilt, pommel and guard: the beast mask, round eye and comma cells (blue glass on the front, turquoise on the back), a thin outturned pommel dish, two low rings on the grip;
  - the 8 real characters, pale, 22.5 mm apart, starting 33 mm from the guard and sitting on the pattern, with no plain patch.

  The export names other files import still work.
- **Renderers:** the flat sword, the 3-D sword, the hook glide, both macros, the blooms, the pommel face and the grip all read that spec. The stand-in hilts in the chamber scenes and the other swords in the tomb are dark too.
- **Inscription leg:** the characters now light in reading order: 越王, then 鸠浅 (which stays lit), then 自作, then 用剑. The 鸠浅＝勾践 bracket sits under 鸠 and 浅.

**Hand-offs**
- Frames 3337–3341 are identical, and 3341→3342 differs only by bloom 1 and the subtitle.
- 1558/1559 and 2781/2782 differ about as much as their neighbouring frames, as they did before the change.
- The end of the macro leg (3319→3320) lands on `HandoffMacro` with no visible difference below the subtitle band.
- The pommel ring match at 20.821 s is continuous.

**Decisions you should know about**
- **Pattern position across the blade:** I put the diamonds centred on the ridge, not half a row off as in the design frame. `macro53c` (not my file) works out its featured diamond in the 1:39 macro shot from the old grid layout. The pattern looks the same; it is shifted 3.1 mm sideways.
- **Characters in the macro shots:** the macro view now starts 4 cells (49.6 mm) from the blade base. `macro53c`'s featured diamond sits at 80.6 mm, and with the characters now running to about 106 mm it would otherwise end up behind the camera. So the macro shots (98–117 s, including the "其实，它也锈了" shot) show some characters on the pattern, which is new in those shots. The switch from `macro53c`'s own characters to mine happens without a jump.
- **Pommel centre stays gold-brown (`#A8783C`):** the tomb dive (`tomb53b3`, not my file) hard-codes that colour, and a dark centre made a visible jump at 20.821 s.
- **More frame-to-frame change in camera moves:** the denser star pattern raises the frame-to-frame difference in moving shots by about 10–30% over the old sword. The jumps are at the same frames as before.

**For the other engineers**
- `tomb53b3`/`tomb53`: switch to the `FACE_BOSS` export if the pommel centre should go dark.
- `kfF53`/`macro53c`: their `strip: 3.4` setting no longer has any effect, and `macro53c`'s comments saying "5 cells" and "past the inscription" are now out of date.
- `shadow53g`: its window lattice now picks up the new pattern through a compatibility value; I checked it at 60 s.

The self-check, with the numbers, is in `tasks/ep53-v31-sword/out/selfcheck.md`. The changed files are in `episodes/37-qiqing/remotion/src/qq53/`: `swordspec53s`, `flat53s`, `blade53c`, `hiltflat53e`, `sword3d`, `land53`, `macro53`, `macrob53c`, `blooms53s`, `face53`, `inscr53c` and `props53` (all `.tsx`).
