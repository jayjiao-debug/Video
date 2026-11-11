# 《石中剑》 storyboard (frames are absolute film frames, 30 fps; TOTAL 1991)

Narration is continuous (5.3 字/s, no pauses), so the picture never rests: every caption group below is a new action
or a new shot. The frame ranges are the caption groups from `captions.ts` (the word is HEARD from its first frame):
land the action ON that frame (a hit 1-2 frames early is fine, never late). Cuts inside a segment are hard cuts on an
action; keep a shot under about 2.5 s.

Shared recipes are in `shots/common.ts` (pullOut, tug, raise, carry, offer, kneel, walkAlong, speak, STAGE, crowd):
use them, do not re-invent a pull. Overlays: `overlay.tsx` (PullCounter, Mark, Burst, Crown, NameTag, Flush) and from
`../group/kit/overlay`: CornerTag (time / place tags), Stamp (red rubber stamp), Rewind.

Who is who: PEOPLE.arthur (blue tunic, red scarf, small), PEOPLE.kay (helmet, red surcoat, EMPTY scabbard),
PEOPLE.ector (grey beard, green cloak), PEOPLE.lord(0..7), PEOPLE.guard(0..3), PEOPLE.commoner(0..15),
PEOPLE.arthurKing (crown + red cloak; only after the crowning in E).

## A (0-451): the hook, the stone, the lords fail          season 0 (snow)

| Frames | Words | Picture |
|---|---|---|
| 0-54 | 他把刚拔出来的【石中剑】 | STAGE.putBack framing, already in motion on frame 0: Arthur on the stone (SPOT.drawR) holds the sword UP (raise), blade shining (setShine), Ector (left) and Kay (right) stare. By f20 he starts to bring it down (pullOut u 1 -> 0.55 by about f50). Slow push-in. |
| 55-82 | 又【插了回去】 | The sword slides down into the anvil (u 0.55 -> 0, home on f66-68; Burst at the slot + a 2-frame camera kick). He lets go and dusts his hands; Ector and Kay: shock (jolt accent, a Mark "!?" over Kay). |
| 83-93 | 等等 | HARD CUT closer on the sword in the anvil and Arthur's face beside it. A big white "?" pops (Mark) above the pommel. |
| 94-143 | 拔出来不就是【国王】吗？ | A Crown icon pops in next to the "?" on 国王 (about f112) and hovers over Arthur's head, never landing; Arthur looks up at it, shrugs (smile -> deadpan). Kay's helmet pokes in from the right edge, mouth open (shock). Quick push-in. |
| 146-189 | 名著【《亚瑟王之死》】里 | HARD CUT: the yard WITHOUT the stone (w.liftStone(null)), snow falling, the church front; camera tilts down from the round window to the yard. CornerTag "《亚瑟王之死》" (white, top left, f150-225). 2-3 townsfolk cross the yard, chatting. |
| 190-227 | 伦敦教堂院子里 | The camera settles on the empty paved circle; the townsfolk stop near it (yardRing spots), one sweeps or waves. CornerTag "伦敦" replaces the first tag (f192-282). |
| 228-260 | 多了块【大石头】 | The stone DROPS out of the sky: w.liftStone(y) from 9 m to 0 in 7 frames, lands on f234 (Burst, camera kick 3 frames, a puff: your own simple white discs if you want). Townsfolk jolt, jump back half a step (shock, Mark "!"). |
| 261-282 | 插着把剑 | Push in fast to the sword in the anvil; one shine sweep (setShine 0 -> 1 -> 0.2); a townsman leans in from the edge, eyes wide. |
| 284-305 | 【金字】写着 | HARD CUT to the inscription on the stone's front face (camera low and close, about [0, 0.55, 2.0] looking at [0, 0.2, 0.5], fov 40): the gold letters light up (setGlow 0 -> 1). |
| 306-327 | 谁拔出来 | Tilt up along the anvil to the hilt (the camera rises to look at [0, 0.98, 0]). |
| 328-356 | 谁就是【国王】 | A Crown icon pops over the pommel (f330); it bobs. A townsman at the frame edge points at it (point pose), another gasps. |
| 357-391 | 【贵族】排队来拔 | HARD CUT, wider: a lord (lord(0)) already heaving on the stone (tug, side "R"), three more lords queue on the right of the stone (x 1.4, 2.1, 2.8; z 0.4), tapping feet, arms waving "my turn". CornerTag none. |
| 392-420 | 脸都憋红了 | Jump cuts, about 9 frames each: lord(1) tugging (side "L"), lord(2) (side "back", facing us), close on the straining faces (huff / pained / wince), a Flush (red face) overlay on each head, sweat. |
| 421-449 | 剑【一动不动】 | Close on the hilt with two shaking hands on it: the sword does not move a millimetre (tug's quiver only); cut wide on f436: three lords bent over panting beside the stone (dazed / sigh), the sword shining untouched. Ends on that picture (hard cut to B). |

## B (452-842): the forgotten sword, the first pull          season 0

| Frames | Words | Picture |
|---|---|---|
| 454-485 | 新年【比武大会】 | HARD CUT to the FIELD: tents, pennants; behind the tilt fence spectators cheer (commoners on set.anchors.fieldCrowd, cheer pose); Kay strides to his mark with Arthur trotting behind (walkAlong). CornerTag "新年" (f454-585). Camera pans with them. |
| 486-524 | 亚瑟的哥哥叫【凯】 | STAGE.field framing. NameTag "亚瑟" over Arthur (f486), NameTag "凯" sub "亚瑟的哥哥" over Kay (f508, on the word 凯); Kay waves to the crowd. |
| 525-551 | 刚当上骑士 | Kay puffs up (smug, head pop), fists on show; a Burst sparkles off his helmet. Arthur claps / looks up at him (happy). Tags leave by f548. |
| 552-567 | 一摸腰 | Kay's hand goes to the scabbard on his belt (pin one hand at the scabbard's mouth: see people.ts notes) and pats twice. Push in toward the belt. |
| 568-590 | 【剑忘带了】 | Kay: shock + Mark "!" (f568). A Burst round the EMPTY scabbard. He turns to Arthur and points away to the right (point pose): "go!" Arthur jolts. |
| 591-617 | 【亚瑟】回去拿 | Arthur RUNS off right (walkAlong, speed 3.4). Whip pan / tracking shot along the path; HARD CUT to the HOUSE on about f606: he skids in to the door mark (17, 0, -2.3), back to us is fine (turn: 1) or three-quarter. |
| 618-639 | 家里【没人】 | He knocks (hand pinned toward the door, 3 knocks with a small Burst each), then tugs the padlock: locked. Mark "?" |
| 640-673 | 全看比武去了 | HARD CUT (f642-658) to the field crowd behind the fence cheering wildly: among them two townsfolk who are obviously "the family" is NOT needed, just the cheering crowd; HARD CUT back (f659): Arthur at the door turns to us, shoulders down (sad / sigh), a head shake. |
| 674-690 | 他想起 | Mark "!" over Arthur (f675), face lights up (grin, head pop). |
| 691-734 | 石头上【还插着一把】 | He sprints off LEFT; tracking / whip pan along the path west, HARD CUT into the YARD about f712: the stone and the shining sword in the middle of the frame, Arthur runs in from the right edge and stops (skid) at SPOT.stepR. |
| 735-761 | 连【十个守卫】 | Camera shows the guard line behind the stone: TEN spears planted upright in the snow in a row (build them once in enter(): simple poles with steel heads, at z about -1.7, x from -2.25 to 2.25; thick enough not to shimmer) and footprints: nobody there. Arthur looks left, looks right (gaze), Mark "?" |
| 762-793 | 都看比武去了 | HARD CUT (f764-778): four guards (PEOPLE.guard(0..3)) behind the fence at the field cheering with the crowd; HARD CUT back (f779): Arthur shrugs and hops up onto the stone (hopArc to SPOT.drawR, lands f792). |
| 794-825 | 他一拔就出来 | pullOut u 0 -> 1 from f795 to f818: one hand, no effort (neutral / smile). Burst when the point clears (u 0.55). Slight low-angle push in. |
| 826-842 | 【第一次】 | PullCounter n=1 at f826 (out f838). He looks at the sword, pleased; on f834 he hops down (hopArc) and runs off LEFT with it (carry). Ends with him leaving frame (hard cut to C). |

## C (843-1264): Kay's lie, the test          season 0

| Frames | Words | Picture |
|---|---|---|
| 845-888 | 凯拿到剑就找爸爸 | FIELD, STAGE.field: Arthur runs in from the right with the sword (carry) and holds it out (offer); Kay takes it on f858 (from then the sword is in Kay's hand), stares at it: shock, Mark "!" (he KNOWS this sword), then a greedy grin; he spins and RUNS left to Ector (Ector waits at about (-21.4, 0, 2.9)); the camera tracks left with him. |
| 889-909 | “爸，【石中剑】！” | Kay lip-syncs (speak(quote("kay"), f, id)): sword held up (raise), bouncing. Ector turns: surprised. |
| 910-943 | “我要当【国王】了！” | Kay still speaking; a Crown icon pops over Kay's OWN head (f915) and he preens (smug). Ector: one long look, deadpan -> stern. Arthur small in the background, waving at the tournament, oblivious. |
| 944-976 | 爸爸让他【发誓】 | Close two-shot: Ector leans in, points at Kay (point pose), stern. The Crown icon over Kay wobbles, Kay: nervous (sweat), gaze sliding away. |
| 977-998 | 凯才承认 | Kay deflates: the sword sinks (hand pinned lower), head squash, sad / sigh; the Crown icon drops away (out f980). |
| 999-1026 | 是【弟弟】拿的 | Kay points at Arthur (point); whip pan / hard cut to Arthur: smile, a small wave; NameTag "弟弟" over him (f1002); Ector: shock (jolt). |
| 1027-1070 | 爸爸让亚瑟【插回去】 | HARD CUT to the YARD, STAGE.putBack framing (the HOOK again, on purpose: same camera, same places): Ector (left) points at the anvil, Arthur on the stone with the sword raised (raise), Kay (right) sulks. Arthur brings it down and slides it in (pullOut u 1 -> 0, home on f1066; Burst). |
| 1071-1092 | 【再拔一次】 | Ector waves "again"; Arthur lets go, looks at him: "?" (Mark). |
| 1093-1103 | 他说 | Arthur turns to the camera, shrug. |
| 1104-1136 | “这有什么难的。” | Arthur lip-syncs (speak(quote("arthur"), f, id)), smile, a little head tilt. Slow push in on him. |
| 1138-1158 | 爸爸先拔 | HARD CUT: Ector on the stone heaving (tug side "R", effort 0.6), beard quivering; Arthur and Kay watch from the ground (stepL side). |
| 1159-1169 | 【不动】 | Smash cut close on the hilt: still. Ector lets go, shakes his head. A red Stamp "不动" is allowed here (small, top). |
| 1170-1208 | 凯使出吃奶的劲 | Kay heaves with everything (tug effort 1, pained, Flush red face, sweat), closer and closer; his feet slip. |
| 1209-1218 | 【不动】 | Kay's hands fly off, he staggers back off the stone (hopArc down, dazed). Stamp "不动" again. |
| 1219-1246 | 亚瑟一伸手 | Arthur hops up (lands f1224), pullOut u 0 -> 1 f1226-f1244, one hand, looking bored / at us. |
| 1247-1263 | 【第二次】 | PullCounter n=2 (f1247). Ector and Kay go down on their knees to him (kneel(k, at), k 0 -> 1 over about 8 frames, Kay a beat later): Arthur: "?" confused. Ends there. |

## D (1265-1714): the lords stall, four more pulls          seasons 0 -> 1 -> 2 -> 3

Each pull must look DIFFERENT (camera side, distance, who watches); the season changes carry the time.

| Frames | Words | Picture |
|---|---|---|
| 1267-1310 | 几天后贵族全来试 | Season 0. CornerTag "几天后" (f1267-1355). The lords crowd the left of the yard; fast montage, about 10 frames each: lord(3), lord(4), lord(5), lord(6) heave and fail (tug: alternate sides R / L / back; jump cuts on the heave). |
| 1311-1343 | 只有他拔得出 | Arthur steps up between them (already on the stone on f1313), pullOut u 0 -> 1 f1315-f1336, one hand, yawning (deadpan, one blink held shut). Lords behind: jaws drop (shock, stagger()ed jolts). |
| 1344-1360 | 【第三次】 | PullCounter n=3 (f1344). |
| 1361-1388 | 他们【气炸了】 | HARD CUT: close pan over three or four lords: stern / huff, Flush red, heads shaking, Mark "!?" popping, one stamps his foot. |
| 1389-1437 | “让个出身不高的小子” | The lead lord (lord(0)) lip-syncs (speak(quote("lord"), f, id)) and points at Arthur (point), who stands small on the right holding the sword, looking at his own plain tunic. Other lords nod. |
| 1438-1453 | “管我们？” | Lords throw their hands up (cheer pose used as outrage, stern faces); still the lord's mouth. |
| 1454-1481 | 说【改天再拔】 | Stamp "改天再拔" slams in (f1456, top third, red). The lords turn and walk off left (turn: 1 for back views); Arthur shrugs and slides the sword back (pullOut reversed). |
| 1484-1498 | 二月 | HARD CUT: SEASON 1 (thaw). CornerTag "二月" (f1484-1560). Camera from the left front this time (about [-2.6, 1.4, 4.6]). |
| 1499-1527 | 雪还没化 | Lords wait in cloaks, arms folded (idle, stern); Arthur walks up, hops on, pulls (u 0 -> 1 f1508-f1526). |
| 1528-1549 | 【第四次】 | PullCounter n=4 (f1528). Lords: heads shake together (shake accent). |
| 1550-1564 | 又拖 | Stamp "又拖" (f1550). Arthur's shoulders drop (sigh). |
| 1566-1580 | 春天 | HARD CUT: SEASON 2 (blossom). CornerTag "春天" (f1566-1644). Camera from the right front, blossom in the frame. |
| 1581-1609 | 花都开了 | A few commoners now watch from the back, bored; Arthur is already on the stone, pulls with one hand while stifling a yawn (u 0 -> 1 f1588-f1606). |
| 1610-1632 | 【第五次】 | PullCounter n=5 (f1610). Commoners clap; lords look away, whistle (whistle expr). |
| 1633-1648 | 还拖 | Stamp "还拖" (f1633). The commoners' faces turn angry (huff), Mark "!?" over them. |
| 1649-1659 | 初夏 | HARD CUT: SEASON 3. CornerTag "初夏" (f1649-1712). STAGE.yardWide: the WHOLE town (crowd()), everyone on their marks. |
| 1660-1697 | 当着所有人的面 | Slow push in over the crowd to Arthur on the stone; all heads follow the sword as he pulls (u 0 -> 1 f1668-f1692). |
| 1698-1714 | 【第六次】 | PullCounter n=6 (f1698), the sword up (raise), shine; commoners cheer (cheer pose), lords frozen. Ends there: E continues from the SAME layout (crowd()) and season. |

## E (1715-1990): the people decide, the crown, the punchline          season 3, last shot season 0

| Frames | Words | Picture |
|---|---|---|
| 1717-1744 | 【老百姓】急了 | HARD CUT close on the commons (right side of crowd()): angry (huff / stern), fists up, pushing forward a step; Mark "!?" |
| 1745-1782 | “就要亚瑟当国王” | Three or four commoners lip-sync together (speak(quote("commons"), f, id) with a different id each), pointing at Arthur (point); camera pans from them to Arthur on the stone with the sword. |
| 1783-1805 | “【别再拖了】！” | Whip pan to the lords: they shrink (nervous, sweat, gaze sliding), one gulps; commoners' fists in the frame edge. Still the commons' mouths while they are in frame. |
| 1806-1850 | 所有人齐刷刷【跪下】 | STAGE.yardWide: EVERYBODY kneels in a wave that runs outward from the stone (kneel(k, at), stagger() by distance; lords last, reluctant), heads bowed. Arthur on the stone, sword lowered, looks around: shock -> shy smile. |
| 1853-1874 | 整整【六次】 | PullCounter n=6 big (f1853, out f1872) over a closer shot of Arthur; six flashes: optional. |
| 1875-1907 | 他才当上国王 | The crown comes down onto his head: a Crown icon drops (f1876) and on f1884 he IS PEOPLE.arthurKing (crown + red cloak; swap the figure on the landing frame under a Burst + head squash). The crowd rises and cheers (cheer). |
| 1908-1929 | 而第一次 | Rewind overlay (group kit, f1905, about 8 frames) -> HARD CUT to season 0, the FIELD, STAGE.field exactly as in B: Kay and Arthur side by side. PullCounter n=1 small (scale 0.7, f1908-1926). |
| 1930-1979 | 只因为哥哥【忘了带剑】 | Kay pats his empty scabbard again (as in B), looks down at it, then at us: embarrassed grin (nervous); Mark "!" then Burst on the scabbard; Arthur shrugs at the camera (smug). Slow push in. |
| 1980-1990 | (tail) | Hold: they blink, Kay scratches / pats once more. No fade. |
