# Gate 2a notes: 旋转的硬币（配音版） looks A/B/C — verdict: APPROVE A · 示波器 Phosphor Scope (owner's rule: most analytical + dynamic), with the 9 pre-build fixes below

Scores (rubric 1–5, this gate): visual A 4 · B 3 · C 3 — info design A 4 · B 4 · C 3

Checked: looks_sheet.png, lookA_hook/key.png, lookB_key.png, lookC_hook.png (B hook / C key on the sheet), make_frames.py.
Phone test: a landscape film is ~1/4 of the phone screen (scale ≈ 0.2), so 30 px renders at about 6 pt (unreadable) and 46 px (subtitle) at about 9 pt.
Treat ≥ 40 px as the minimum for anything the viewer must read.

## Buildability, difference, repeat check
| Look | Buildable (Remotion, SVG/canvas, 1920×1080, 30 fps, no CSS 3D) | Phone-readable | Repeats navy+gold? |
|---|---|---|---|
| A Phosphor Scope | Yes. Per-frame SVG paths or Canvas 2D, counting readouts, cursor sweeps. Set glow filters with an oversized/userSpaceOnUse region so peaks don't clip. | Hero readouts yes (10²⁵ row ≈ 75 px, <5 分钟 ≈ 170 px, 94.1 % ≈ 90 px). Every label is 22–30 px, too small (fix 1). | No (black/phosphor green/red) |
| B Drafting Plate | Yes. SVG with stroke-dashoffset. | Equations/=0/×2 yes. 路径 1/2 at 20 px, histogram axis at 17 px and 注 at 22 px no. | No (cream/ink/red/blue) |
| C Split-Flap | **No, as specified.** looks.md builds the flaps with CSS rotateX half-tiles (CSS 3D). They would need redoing as 2D SVG half-tiles with a scaleY flip. | Flaps yes. The hook "2¹⁰⁵" is drawn as same-height flaps "2 | 1 0 5", which reads as **2105** on a phone. | Black + amber #FFB81C sits close to the gold family |

They really differ: an instrument screen, a paper drafting plate and a departure board are three different worlds.

## Ranking
1. **A · Phosphor Scope**: the **most analytical and the most dynamic**. It is the only look where interference physically happens on screen (waves add and go flat on the MATH channel), and every scene is a live-drawn trace with a counting readout. Its key frame passes the 5-second test.
2. **B · Drafting Plate**: the clearest single diagram of the mechanism (路径1 + 路径2 = 0 / ×2), but it's a static plate, so motion is mostly drawing-on. The light paper changes the brand feel, and the blurred dark subtitle pill looks smudged on cream.
3. **C · Split-Flap**: the most fun and has built-in sound design, but it shows the result (a table of 已抵消) and not the mechanism. Its build spec breaks the no-CSS-3D rule, the hook exponent misreads, and "105 个量子比特 · 可能的组合 = 2¹⁰⁵" leans into the "tries every combination" myth the film corrects.

## Pre-build fixes for A (all before storyboard sign-off)
| # | Sev | Where | Note | Route to | Owner note it relates to |
|---|---|---|---|---|---|
| 1 | MAJOR | all scenes: labels | Anything the viewer must read goes to **≥ 44 px**: 波峰 + 波谷 = 0, ▲ 互相加强, CH labels that carry meaning (CH1 经典超算 / CH2 Willow), \|000⟩…\|111⟩ (30 → 44 px Mono Bold), 示意, Google 估计, the ×100+ cursor readout, and the 少数题/大多数题 rows. Chapter label top-left 22 → **34 px**. The top status strip (MATH Σ 振幅 · 3 qubits …) and the 0.x % column may stay at 24–26 px, but at ≤ 60 % opacity so they read as instrument texture and not as text to read. | art-director, animator | "屏幕本来就不大…变大" |
| 2 | MAJOR | key frame (r6–r8) | Collision: "▲ 互相加强" (y≈636) runs into the \|110⟩ row's "0.9%" (y≈665). Put the 94.1 % block in its own right-hand panel aligned to the \|101⟩ row, and fade the other rows' % to 40 % when it lands, or drop them. Add **示意** under 94.1 % (gate 1 note 6). | art-director | no text over text |
| 3 | MAJOR | hook frame, top bar | **"T = 0.010 K" next to "Willow 105 qubits" breaks facts row 6** (Google gives no Willow mK figure). Remove it from the hook. The temperature appears only at s4 as "≈ 10 mK · 超导量子芯片". Also change "CH1 ▸ 经典超算 · 需要" → **"CH1 ▸ 顶级超算 · Google 估计"** (row 2). | art-director | no misleading numbers |
| 4 | MAJOR | subtitle band on phosphor | In the hook frame the red dashed cursor runs straight through the subtitle and the green burst peaks at y≈800, right against it. On every scene, **clip the graticule, traces, cursors and glow to y ≤ 800**, like the key frame does. Raise the band to rgba(2,6,4,.85) with a 14 px blur so no phosphor glow or trace shows under the text. The subtitle stays #FFFFFF 46 px, and nothing green or red goes in y 820–960. | art-director, animator | subtitle readability |
| 5 | MAJOR | right edge / safe area | Keep every readout inside **x 96–1824** (90 % title-safe). Only traces may run off the right edge (h4, r20). The 10²⁵ readout is 26 digits plus 年 ≈ 1645 px wide. Lay it out at its final width from the start (fixed-width mono, left-anchored at x 150, ending ≤ 1790) and count the zeros in place, so it never pushes the text rightward past the safe area. Do the same for 64,000,000,000 vs 105 (s5), the 2³⁰⁰ readout that "overflows its box" (u4: overflow the box, not the frame), and the log-cursor labels at r16–r17. | animator | frame edges (ep9 scissors) |
| 6 | MINOR | dashed ghost (anti-phase wave) | This is the trace that explains the cancellation, and it's invisible at phone size. Draw it at #3E9D6C, 2.5 px, dashed, at full opacity during r4 and r6, then fade it out. | art-director | 5-second test |
| 7 | MINOR | 120 s of green on black | Risk of "单调" (owner, ep8). Change the instrument layout every ~5 s (1 ch → 2 ch compare → log temperature axis → single coin sine → 4/8/2ⁿ channels → MATH → XY Lissajous molecule → REF slot → log cursors). Keep red for Willow, the right answer and cursors only, so each red appearance means something. No scanlines and no falling code. | art-director, animator | "节奏…单调，spice it up" |
| 8 | MINOR | first frame | Frame 0 must already show a running trace, the h1 subtitle and the 00 · 传说 label (script h1). Never start on an empty graticule. The burst lands on the first beat, inside 1 s. | animator | "第一帧和前3秒就要抓人" |
| 9 | NOTE | end card | Gold appears only on the Juno end card, as in looks.md. Hard-cut from the last red ✗ trace to the card. No "Juno 出品". | animator | brand rules |

What must not change (it works):
- A's world rules: CH1/CH2/MATH as story devices, the trigger = measurement, the cursor sweep on beats, and the trace morphs as motivated transitions.
- The key frame layout: 8 labelled rows, seven going flat, one red and growing, one big white readout.
- The hook pairing: a huge white mono 10²⁵ over a huge red < 5 分钟.
- Palette: #020604/#07140D screen, #7DFFB3 trace, #F4FFF8 readout, #FF3B30 signal. Shared engine layer (subtitle band position, corner mark).
