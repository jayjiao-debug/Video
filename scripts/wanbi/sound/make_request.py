#!/usr/bin/env python3
"""Writes the voice-farm request for the Wanbi film's NEW sound effects (ElevenLabs text-to-sound through the farm).
usage: make_request.py <request id> <out request.json>      e.g. make_request.py wanbi-sfx-01 /home/user/vf/request.json
An id ending in -02 writes round 2 (ROUND2: retakes of what round 1 got wrong by measurement, names <name>_r1 ...),
-03 round 3 (ROUND3: the hall bed once more, names hall_s1 ...).
Only what the Hongmen and Arthur libraries lack (out/hongmen-sfx-01..03, out/arthur-sfx-01..03 on voice-output: the
whoosh, pop, stamp, seal, jade ting, drum, swish, flap, feet, march, clap, cheer, rewind, chime, birds, air, night ...
are reused from there; cues.json names which). Two takes of every sound: <name>_1, <name>_2. Spot effects 0.5 to 3 s,
influence 0.6; ambience 12 to 15 s, influence 0.5 (the Hongmen style). "tag": true = the farm's AudioSet tagger writes
what it hears into report.json. The request holds effect descriptions only: no names, no keys, no music items."""
import json, sys
DRY = " Single sound effect, close, dry, no reverb, no music."
SPOT = [  # name, seconds, prompt
    # the hook (shots 1 and 11): the drone under the frozen standoff, the wind-up's riser, the feint's stop
    ("drone", 6.0, "A low dark sustained drone: a deep soft bowed bronze hum holding one steady pitch, tense and quiet, even from start to finish. No melody, no beat, no music."),
    ("riser", 1.0, "A short tension riser: an airy whoosh that swells up fast and stops sharply at its loudest point. One rise only, no impact, no music."),
    ("hit", 1.0, "One deep soft low impact: a muffled heavy boom, like a big padded hit, with a short tail. One hit only, no music."),
    ("knock", 0.5, "A hard stone disc knocks once against a lacquered wooden pillar: one short sharp hollow wooden tock. One hit only." + DRY),
    ("thock", 0.5, "A man's back bumps against a thick wooden pillar: one dull soft hollow thud. One hit only." + DRY),
    # the whips and the flashback
    ("rewind", 0.7, "A reversed whoosh: a soft airy swish played backwards, swelling up from silence and cutting off abruptly at its loudest point." + DRY),
    # cloth and hands
    ("cloth", 0.5, "A quick swish of a wide silk robe sleeve through the air: one short soft cloth whoosh with a light flutter." + DRY),
    ("silk", 1.0, "A silk map scroll unrolled fast from a wooden roller: a quick soft silky rustle and swish that ends with a light wooden tap. Close, dry, no music."),
    ("puff", 0.7, "A heavy coarse cloth thrown over a man: one soft dusty whump of cloth." + DRY),
    ("grab", 0.5, "A hand grabs a thick cloth sleeve hard: one quick cloth thwap." + DRY),
    ("clap", 0.5, "One single sharp clap of two hands. One clap only, close, dry."),
    # comic accents
    ("tick", 0.5, "One tiny dry wooden click, like a single abacus bead flicked. One click only, very short, close, dry."),
    ("deflate", 1.0, "A comic deflating sound: air squeaking out of a small balloon, a short descending fizzle. Cartoon, close, dry, no music."),
    ("boing", 0.6, "A soft comic boing: a short springy wobble, light and playful." + DRY),
    ("gulp", 0.6, "A comic nervous gulp: one loud swallow. Close, dry, no voice, no music."),
    # feet
    ("steps", 3.0, "One man walking at a calm, steady pace on a polished wooden floor in a large hall, soft cloth shoes: six even footsteps. Footsteps only, no voice, no music. Close, dry."),
    ("scuttle", 1.5, "One man scurrying backwards in quick small hurried steps on a wooden floor, soft cloth shoes: eight fast light footsteps. Footsteps only, no voice, no music."),
    ("clank", 2.5, "One guard in metal armour striding fast on a stone floor: five heavy steps with armour clinking. Footsteps only, no voice, no music."),
    # the stage (京剧), the palace bronze
    ("cymbal", 1.2, "One crash of a pair of Chinese opera cymbals: a bright brassy chang with a short shimmering ring. One crash only, no drum, no music."),
    ("gong", 1.5, "One hit on a low Chinese opera gong: a deep dark wobbling bwong with a short decay. One hit only, no music."),
    ("whum", 0.8, "A big theatre spotlight switching on: one deep soft electric whum." + DRY),
    ("bell", 3.0, "One strike of a wooden mallet on an ancient Chinese bronze bell: a warm clear deep bell tone with a long gentle ring. One strike only, no music."),
    ("cauldron", 1.5, "A huge heavy bronze cauldron dropped onto a stone floor: one deep heavy metallic thud with a short low ring. One impact only, no voices, no music."),
    ("steam", 2.5, "Steam hissing softly from a large pot of boiling water: a gentle low continuous hiss. Calm and even, no bubbling clicks, no music."),
    ("bamboo", 1.0, "A bundle of bamboo slips tied with cord, an ancient bamboo scroll, unrolled fast on a wooden table: a quick dry wooden clatter and slide. Close, dry, no music."),
    # 万岁
    ("cheer", 2.0, "A hall full of about forty men cheering together in one big joyful shout, an excited roar of male voices, no clear words. Starts at full volume at once, then holds. No music."),
]
BED = [
    ("hall", 15, "The interior of a vast quiet ancient palace hall: a soft deep room tone, a faint far-off murmur of courtiers, a brazier crackling gently far away. Calm, even and continuous from start to finish. No clear words, no footsteps, no music."),
    ("court", 12, "A quiet palace room in the daytime with open lattice windows: a light breeze and a few soft birds chirping outside, a faint distant murmur. Calm, even and continuous from start to finish. No clear words, no footsteps, no music."),
    ("dusk", 12, "Dusk outdoors on a quiet dirt road beside an old town wall: a soft evening breeze and a few crickets beginning to chirp. Calm, even and continuous from start to finish. No voices, no footsteps, no music."),
]

# round 2 (wanbi-sfx-02; names <name>_r1 ...): measure.py on round 1 found the hall bed a ticking clock (take 1) or a
# sub-bass rumble with nothing over 150 Hz (take 2), the drone and the cauldron all under 150 Hz (a phone plays none of
# it), the opera cymbal tagged as breaking glass.
ROUND2 = [  # name, seconds, influence, takes, prompt
    ("hall", 15, 0.5, 3, "Room tone of a large empty stone palace hall: a soft airy hush with a faint distant murmur of voices far away and the gentle crackle of a brazier. Smooth, even and continuous from start to finish. Mid-range, not bassy. No ticking, no clock, no clicks, no footsteps, no music."),
    ("drone", 6.0, 0.5, 2, "A low tense sustained hum, like a large bronze singing bowl ringing softly: one steady mid-low tone with soft overtones, even from start to finish. Not a rumble, no sub-bass, no melody, no beat, no music."),
    ("cymbal", 1.2, 0.6, 2, "Chinese opera percussion: one crash of a pair of large brass hand cymbals, a bright brassy metallic chang with a short shimmering ring. Brass, not glass. One crash only, no drum, no music."),
    ("cauldron", 1.5, 0.6, 2, "A heavy bronze cauldron dropped onto a stone floor: a loud metallic clang and thud with a bright short ring, clearly audible in the mid and high range, not only bass. One impact only, no voices, no music."),
]

# round 3 (wanbi-sfx-03; names hall_s1 ...): round 2's three "room tone" halls and both drones came back as near-silent
# sub-bass (ElevenLabs makes silence of "room tone"): the hall again, described by what makes its sound.
ROUND3 = [  # name, seconds, influence, takes, prompt
    ("hall", 15, 0.5, 2, "Inside a grand ancient stone hall: a soft breeze blowing through a wide open doorway, silk banners rustling faintly, the distant murmur of people outside echoing softly. Gentle, even and continuous from start to finish. No footsteps, no clear words, no music."),
    ("hall", 15, 0.5, 2, "Quiet ambience inside a large palace hall with high wooden beams: soft echoing air, a faint distant murmur of a crowd and the occasional soft rustle of silk robes, gentle reverb. Even and continuous from start to finish. No bells, no footsteps, no clear words, no music."),
]

if __name__ == "__main__":
    if len(sys.argv) < 3: raise SystemExit(__doc__)
    rid, out = sys.argv[1], sys.argv[2]
    items = []
    if rid.endswith("-03"):
        k = 0
        for name, sec, infl, takes, text in ROUND3:
            for _ in range(takes): k += 1; items.append({"type": "sfx", "name": f"{name}_s{k}", "text": text, "duration": sec, "influence": infl})
        json.dump({"id": rid, "tag": True, "items": items}, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print(f"{out}: {rid}, {len(items)} clips (round 3)"); sys.exit(0)
    if rid.endswith("-02"):
        for name, sec, infl, takes, text in ROUND2:
            for k in range(1, takes + 1): items.append({"type": "sfx", "name": f"{name}_r{k}", "text": text, "duration": sec, "influence": infl})
        json.dump({"id": rid, "tag": True, "items": items}, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print(f"{out}: {rid}, {len(items)} clips (round 2 retakes)"); sys.exit(0)
    for name, sec, text in SPOT:
        for k in (1, 2): items.append({"type": "sfx", "name": f"{name}_{k}", "text": text, "duration": sec, "influence": 0.6})
    for name, sec, text in BED:
        for k in (1, 2): items.append({"type": "sfx", "name": f"{name}_{k}", "text": text, "duration": sec, "influence": 0.5})
    json.dump({"id": rid, "tag": True, "items": items}, open(out, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(f"{out}: {rid}, {len(items)} clips ({len(SPOT)} spot effects, {len(BED)} beds, two takes each)")
