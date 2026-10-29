I built TakeD, legs 13–18 from 75.162 s to the end of the film (frame 3409). Every leg and the end card are done, but I only rendered stills. I checked about 120 of them across the range and none errored, and `tsc` reports no errors in these files. I have not rendered the full film as video or run the video-reviewer.

Where I chose, the choices are these:

- **Opening frame:** it is `HandoffMacro` with bloom 1 at frame 2255; blooms 2 and 3 switch on at 75.728 and 76.860. The camera holds KF11's pose for about 2 s, then eases back. The blooms shrink to specks beside a thin scale bar, which I left without a number to stay on ✓ facts.
- **Match 4:** the first bloom's find-ring widens into a circular window that shows the sheath's mouth. It covers the frame by 81.954.
- **Legs 14–15:** the sword slides back into its sheath, settling on 84.219. The three other swords light at 86.483, 87.615 and 88.747. The layers close on the beats and each lands on its own frame:
  - 剑鞘 at 91.011
  - 内棺 at 91.577
  - 外棺 at 92.143
  - 木椁 at 92.709
  - 白膏泥 at 93.275
  - 夯土 at 93.841
  
  A label appears with each layer. Air dots bounce off the white clay and two reach the blade.
- **Leg 16:** the top of the fill turns into the museum floor as the camera reaches ground level (Match 5). The case stands on that floor directly above the tomb. The camera goes in through the front glass to 8 cm over the blade.
- **Leg 17:** the camera backs out through the glass. Your kitchen, with the cleaver, resolves from the reflection into the real frame-0 framing. The case sword is carried onto the kitchen sword's position and fades into a faint glow, so there is only one sword on screen at a time.
- **End card:**
  - The J stamp is on f3274 and absent on f3273.
  - The title, question, follow pill and sources line come in at +0.35, +0.7, +1.2 and +1.3 s.
  - The picture dims to about 30 %.
  - A 0.5 s fade to black ends at 113.6.

**Camera speed:** over 81.954–108 s, points deeper than 0.6 m move at most 24.8 px per frame. Closer than that it is faster, up to about 90 px per frame, during the push through the glass and the 5 cm approach (about 101.4–103.9 s).

**Changes from the plan:**
- The L1 depth tag starts at 8.0 m (the camera's depth), not 10.8, because the camera is already above the coffin. It reaches 0.0 at 95.54.
- I draw the depth tag myself in TakeD, since the master's depth tag stops at 43.463.
- The tomb is one cut-away world, so from above it reads as a dark diorama with a straight cut edge.
- The sword is only about 100 px long in L1, because I kept KF12's pose.
- The other swords in E1 are schematic blades.
- T3 has no extra rewind streak beyond the slide-back and the fast pull-out.

I edited no shared files and committed nothing. The stills are in `/tmp/r53`, outside the repo.

Files are in `episodes/37-qiqing/remotion/src/qq53/`:
- `take53d.tsx`
- `macro53d.tsx`
- `world53d.tsx`
- `scene53d.tsx`
- `end53d.tsx`

The self-check is `tasks/ep53-take-d/out/selfcheck.md`. The next step is to render 75–113.6 s as video and run the video-reviewer.
