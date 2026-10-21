# Style test: the 0:22 shot (2026-10-21)

The same moment (line 希腊神话里，西西弗斯得罪了众神) in the current cut and three looks, rendered from
`build/Puppet35.tsx` → composition `STY022` with `--props '{"look":"A"|"B"|"C"}'` (no props = the cut's scene
without grain). Checked with `.claude/skills/video-reviewer/scripts/look_check.py` (`look_check.json`).

| Frame | Look | Squint spread | Verdict |
|---|---|---|---|
| current.jpg | the cut as approved | 65 | FAIL: figure, rock and hill share one tone |
| lookA_light.jpg | low sun behind his back, rim light, background pushed down | 81 | FAIL (close): light alone doesn't fix the flat values |
| lookB_camera.jpg | closer, horizon lowered, figure and rock against the sky, lens-near foreground | 93 | PASS |
| lookC_palette.jpg | teal → magenta → orange sky, the sun brightest, he reads as a silhouette | 92 | PASS |

Known nits: in B the control bar crowds the header; the looks drop the film grain the cut still has (Grade).
