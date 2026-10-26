# ep25 build runbook (Manim look) — for the 02:30 SAST scheduled run

1. Data: asset farm → gol.gg Worlds 2026 Main Event match list + new game pages (ids 83662+) as in lol-ep25-01;
   `cd ep25/an && python3 parse_games.py <files> && python3 an25.py`.
2. Model: write ep23/an/r3b.json {"results":[[W,L,gW,gL],…4 day-2 matches], "r4":[[A,B],…] if Riot published them};
   `cd ep23/an && python3 sim5.py 200000` → sim5_out.json.
3. AI poll on Modal (mf/poll_ai.py pattern) → ep25/an/ai25.json = [{model, top3:[abbr…], lpl:bool}].
4. `cd ep25/an && python3 mkdata25.py` → ep25/film/data.json; copy to ep25/m2/data.json. Set D.end_title/D.end_q if wanted.
5. Text: ep25/m2/lines.json (bars 10–61.74, [keyword]); ep25/intro/intro.html CFG (l1,l2,l3,title,tag).
   Check every number in the lines against data.json. No 赔率/押注/竞猜.
6. `cd ep25 && ./assemble25.sh` → out/ep25_send.mp4 (≤30 MB) + out/ep25_hd.mp4 (~5 min locally, no farm needed).
7. QA: luma jumps (signalstats), ebur128, reading pace (lines ≤ ~6 chars/s), stills contact sheet.
