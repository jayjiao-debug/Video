# Crew log: 旋转的硬币（配音版）

| Time | Step | Who | Result | Minutes |
|---|---|---|---|---|
| 2026-10-06 00:45 | folder created | producer | | |
| 2026-10-06 01:21 | script v1 (VO + on-screen + picture), vo.json, lines.json | screenwriter | 42 VO lines, 463 字, est. film 124.9 s | |
| 2026-10-06 01:30 | script v2 (gate 1 r1 notes 1–8 + producer decisions) | screenwriter | 37 VO lines, 446 字, est. film 119.9 s | |
| 2026-10-06 00:35 | owner asleep: "pick the most analytical and dynamic… tight but enough time for VO… finished product, no permissions" | producer | voiced remake of quantum episode | |
| 2026-10-06 00:45 | brief.md | producer | voice-over episode, Look must be new | 10 |
| 2026-10-06 01:10 | facts.md | researcher | 27 rows (23 verified, 4 估算) | 25 |
| 2026-10-06 01:10 | looks A/B/C + sheet | art-director (parallel) | A Phosphor Scope recommended | 8 |
| 2026-10-06 01:22 | script v1 + vo.json | screenwriter | 124.9 s est | 10 |
| 2026-10-06 01:28 | gate 1 r1 + gate 2a | director + cold-reader | G1 REVISE (8 notes); G2a APPROVE A with 9 fixes | 6 |
| 2026-10-06 01:28 | owner away → title 量子计算机不是同时算 (director top), look A (owner rule: most analytical+dynamic; director #1) | producer | logged | |
| 2026-10-06 01:40 | script v2 | screenwriter | 119.9 s est, all notes addressed; accepted by producer (round cap) | 12 |
| 2026-10-06 01:45 | storyboard.md (look A, 28 scenes, 29 transitions) | art-director | gate 2b: producer accepted (owner away), director pass folded into gate 3/4 | 11 |
| 2026-10-06 01:50 | VO: offline TTS (kokoro v1.1-zh via sherpa-onnx, male sid 62, speed 1.08), ASR round-trip check | producer | 38 lines, ~5.1 字/s | 20 |
| 2026-10-06 02:05 | music re-edit (track [67.15, 97.65) + [49.12, …), 30 ms crossfade) — title on the hardest drop 14.24, 不是 on the 2nd drop 62.77; VO ducked −16 dB; master −14 LUFS / −1.5 dBTP | producer | film 126.0 s | 15 |
| 2026-10-06 02:15 | added line u2b "十枚，就是一千零二十四种" (concrete number in the build) | producer | | |
| 2026-10-06 02:30–03:00 | build: kit.tsx (scope frame), scenes.tsx (27 scenes), film.tsx (end card) | animator (producer) | | 45 |
| 2026-10-06 03:00 | gate 3: 43 stills reviewed; fixes: counter render bug, frame-0 subtitle, MEASURE readout off the spike, padlock size, histogram, doubling rows, end-card sources width | producer | | 15 |
| 2026-10-06 03:05 | full render started (chunked, CRF 16) | producer | | |
| 2026-10-06 04:10 | v1 render (126 s) + automatic checks | producer | true peak +0.28, black at end card, short subs vanish, 1024 not in facts | 20 |
| 2026-10-06 04:20 | gate 4 r1 | video-reviewer | FIX FIRST: 4 MAJOR (crypto ends on fear, mushy transition into 结论, duck too late, amplitude picture contradicts VO) + 8 MINOR | 7 |
| 2026-10-06 04:25–04:55 | v2: new VO line r16b (NIST relief), r12 hedged (理论上), duck 250 ms early, all MAJOR/most MINOR fixed; v3 partial re-render (end card, relief-beat motion) | producer | 130.1 s, 3903 frames, black 0, glitches 0 | 45 |
| 2026-10-06 05:15 | gate 4 r2 | director | APPROVE (script 5 · visual 5 · info 5 · edit 4 · motion 4 · sound 3) | 3 |
| 2026-10-06 05:25 | delivery: upload file 26.5 MB (2-pass 1.5 Mbps, −15.0 LUFS, −2.2 dBTP); HD master 201 MB (12 Mbps CBR, −13.9 LUFS, −1.8 dBTP) via GitHub artifact deliver-qvo, md5 checked | producer | | 15 |
| total | ~4 h 50 min from the owner's message (00:35 → 05:25) | | director rounds: G1 1 revise, G2a approve, G4 1 revise + approve | |
