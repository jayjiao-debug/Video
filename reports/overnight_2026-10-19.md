# Overnight report — 2026-10-19 (ep23 《五分之一》)

**Request (23:12):** a finished video by morning on the chances of China (LPL) winning Worlds 2026: big-data estimate, the most favourable
paths, a poll of other AIs for their top 3, lots of visualisation and simulations, fun facts, the usual BGM.

**Readings I took (you were asleep):**
- Title 《五分之一》 (the option I'd recommended). BGM = s130f, the series track (118.5 bpm), untouched; SFX are mixed on top.
- "Ask DeepSeek, ChatGPT, Gemini, Grok…": no browser on your computer was reachable tonight (Claude in Chrome and the desktop
  browser were both offline) and there are no API keys for those services. So I asked the **open-weights models those labs publish**,
  run on Modal GPUs, all with the same briefing, 6 times each: DeepSeek-R1 (distilled 14B), OpenAI gpt-oss-20b, Alibaba Qwen3-14B,
  Zhipu GLM-4-9B, Microsoft Phi-4, Mistral Small 24B. Google's Gemma and Meta's Llama need a signed licence on Hugging Face, and no Grok
  model is small enough to run, so Gemini/Grok are **not** in the poll. The film says "开源模型 · 同一份资料 · 离线作答" on the panel and
  in the end-card note. If you paste me the ChatGPT / Gemini / Grok app answers, I can swap them in and re-render in ~15 minutes.

## Done
- ep23 film 《五分之一》, 2:10, 1080p30: `五分之一.mp4` (send version, 26 MB) is in the chat; HD master (218 MB) via a download link on request.
- Data: gol.gg (1,746 games of the 17 teams this season, every 2025–26 international series), Leaguepedia 2017–24 international history,
  Riot GPR. Model = 100,000 simulated Worlds with the real format, ratings = blend of Riot GPR and a 2026-results rating.
- Findings used in the film: LPL 21% (LCK 71%); BLG 17.8% (84% of China's chance); T1 10–0 vs LPL in Worlds Bo5 since 2017;
  LPL 0–7 vs LCK in 2025 international Bo5; BLG 3 Bo5 wins over LCK in 2026. Paths: Round-1 draw changes LPL's odds by <1 point;
  BLG 3–0 in Swiss → 24%; no LCK team in BLG's half → 29%; both → LPL 35%; GEN and HLE both out before the semis → LPL 46%.
- AI poll (33 valid answers): first-place votes HLE 19, T1 12, BLG 2. Several models got facts wrong (e.g. called BLG the LPL champion).
- Dashboard with all the data: "Worlds 2026 LPL Odds" artifact (built last night).

## Problems and fixes
- Leaguepedia rate-limited our fetcher → used gol.gg (same Riot match records). Oracle's Elixir S3 links 404 (they moved).
- First AI-poll run hung for 60 min: the Modal container couldn't find the prompt file. Fixed by embedding it; re-run took 8 min.
- Render v1 had fast "wipes" when the camera passed close beside a screen (luma jumps up to 43/frame). Spread the stations out,
  turned the camera before moving; v3 scanned clean (see QA below).

## QA (v6, the file sent)
- 3,899 frames, 129.97 s, 1080p30. Luma scan: 0 flicker, 0 black or white frames, no frame-to-frame jump > 18; mean luma 58/255.
- No 穿模: the camera stays ≥ 6.5 units from every screen, ≥ 11 from the tubes, ≥ 3.3 from the gate rings (checked on every 2nd frame).
- Music: s130f untouched (sample-identical wherever the SFX are silent). SFX: 3 soft pings in F#, 10 console clicks, 3 gate whooshes,
  peaks 2–5 dB over the music RMS. Loudness −9.9 LUFS (same as ep20/ep21). Send version 26.4 MB (2-pass 1450 kbps).
- Subtitles: standard strip, ≤ 16 CJK-width per line, one line per 2 bars (≈4 s). Title on bar 8 (16.58 s), drop on bar 40 (81.375 s),
  end card 125.4 s. Every number on screen is from analysis/ or aipoll/ (see script.md table).
- Not checked by a separate reviewer agent (you asked me not to use agents); I did the checks myself.
- UNVERIFIED: nothing in the film. The Swiss board is "其中一次模拟" (one simulated run, labelled as such).

## Needs you
- OK on the cut (then I make the Douyin publish package).
- Optional: real ChatGPT / Gemini / Grok answers to swap into the AI section.
- Git: everything is committed; backed up on branch `claude/ep23-overnight` (your working branch is 60 behind origin, so I did not merge
  or force-push). CLAUDE.md is still untracked.
- Re-run after the Round 1 draw is published if you want the exact draw in the film.
