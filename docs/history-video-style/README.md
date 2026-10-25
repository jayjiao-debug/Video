# History video style: picture references (our own frames only)

The reference video (iwanau 《假如你是传国玉玺》) is someone else's work: never commit its frames here. Its rhythm is described in words in the history-video-style skill.

- `ep41_style_sheet.jpg`: ep41 final (approved). One-tone silhouettes, warm lamp/moon rim light, flat vector rooms, period props (Bell's liquid transmitter, Du Fu's brush), the light-trail transition, the 2026 bedroom drawn in the same style (the generated anime bedroom was rejected).
- `ep42_rough_sheet.jpg`: ep42 rough cut v1, one still per 5 s: a relay through eras in one family of looks.
- `ep44_keyframes_sheet.jpg`: ep44 key frames: 「你」 as the only glowing colour (rose-gold). Use for the picture only. Its red chip / red key words / serif furniture came from the reference and is being replaced by an episode-specific skin; frames 5 and 11 use generated painterly plates that clash with the flat-vector rooms (owner note): redraw backgrounds as flat vector.
- `ep44_final_sheet.jpg`: ep44 《假如说你是爱因斯坦的大脑》 final (approved 2026-10-25), one still per 5 s. The current standard: layout D captions, 他/你 counter, two-line 霞鹜文楷 stamp, phone-safe corners, red J stamp, end card.

Tools (copied from ep44; edit the paths at the top before reuse):
- `jseal.png`: the owner's red hand-pressed J stamp (transparent PNG, 256 px). The brand seal, bottom-right, and on the end card.
- `make_cover_template.py`: covers (kicker, cream line 1, rose-gold line 2, sub line, the film picture fading up into dark), 3:4 1080×1440 and 4:3 1440×1080.
- `stripsig.py` / `glitchscan.py`: render checks (the farm's copied-strip glitch; single-frame outliers).
- `assemble.sh`: join locally rendered segments, encode HD + send versions with the music bed (BT.709 tv range).
