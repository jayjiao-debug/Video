# Wanbi short: the English version (WP13)

The same picture as 《完璧归赵》, frame for frame (2107 frames); the English narration and captions are behind the
input prop `lang: "en"` (`src/videos/wanbi/lang.ts`, `src/kit/film/lang.ts`). The recipe: `scripts/kit/lang/README.md`.
No personal name anywhere in English: the envoy, the eunuch's retainer, the King of Qin, Zhao.

- `script_en.json`: one English group per Chinese caption group (23 lines, 71 groups), written to each group's time
  (about 4.4 syllables a second). `say` respells Qin as Chin and Zhao as Jow for the voice. `alt` keeps the other
  wordings by take letter. Line 1 is one group shown from frame 0 in rows (three in English).
- `fit_en.py`: the kit's `fit_lang.py` without the loop (this film does not loop) and with Wanbi's paths as defaults.
- `gen_en.py`: writes `src/videos/wanbi/captions_en.ts` (`CAPTIONS_EN`, `captionAtEN`, `QUOTE_RAW_EN`, `CaptionEN`)
  from the fitted timing. Without a timing file it lays the chunks over the Chinese windows (enough for stills).

Voice: Alex (ElevenLabs library voice, eleven_v4, stability 0.2, similarity 0.8, style 0.75, speed 1.2: the Hongmen
English settings), voice-farm requests `wanbi-en-01` (every line, two takes, third wordings of nine lines) and
`wanbi-en-02` (shorter wordings of lines 4, 7, 8, 14, 15, 18, 22). The clips and the merged report:
`/home/user/wanbi_work/voice/en_raw/` (`report_all.json`).

The commands that made the files in use:

```
python3 scripts/wanbi/en/fit_en.py /home/user/wanbi_work/voice/en_raw /home/user/wanbi_work/voice/en_raw/report_all.json \
  /home/user/wanbi_work/voice/en_v1/narration.wav /home/user/wanbi_work/voice/en_v1/voice_timing_en.json \
  --takes abcdef 1=c 3=c 4=f 7=e 8=e 10=c 14=d 15=f 18=f 22=d 11@1.18 14@1.18 16@1.18
python3 scripts/wanbi/en/gen_en.py /home/user/wanbi_work/voice/en_v1/voice_timing_en.json
bash scripts/kit/tsc.sh --film wanbi
```

(fit_en.py needs scipy.) Result: group starts 3.1 frames from their Chinese windows on average, 90 % within 7 frames;
every line ends before the next Chinese line starts; the last word at 69.32 s. The final wording line by line:
`/home/user/wanbi_work/voice/en_v1/lines.md`. Sound: `bash scripts/wanbi/sound/build.sh --lang en` (it finds the
timing through the link `en_v1/en_timing.json` -> `voice_timing_en.json`). Nothing here keeps audio or images.
