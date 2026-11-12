#!/usr/bin/env python3
"""Writes the voice-farm request for the Hongmen film's sound effects (ElevenLabs text-to-sound through the farm).
usage: make_request.py <request id> <out request.json>      e.g. make_request.py hongmen-sfx-01 /home/user/video/request.json
The id picks the round: hongmen-sfx-01 = the first list (two takes of every sound: <name>_1, <name>_2);
hongmen-sfx-02 = retakes of what the first round got wrong by measurement (see ROUND2; names <name>_r1 ...);
hongmen-sfx-03 = the fix round after the picture check (see ROUND3; names <name>_t1 ...). Spot effects 0.5 to 3 s, influence 0.6; ambience 5 to 10 s, influence 0.5
(the Arthur film's style). "tag": true = the farm's AudioSet tagger writes what it hears into report.json.
The request holds effect descriptions only: no names, no keys, no music items."""
import json, sys
DRY = " Single sound effect, close, dry, no reverb, no music."
SPOT = [  # name, seconds, prompt
    ("whoosh", 0.5, "A tiny quick soft whoosh, like a head turning fast in a cartoon: one short airy swish." + DRY),
    ("pop", 0.5, "A soft cartoon pop, like a small bubble popping. One pop only, short, dry."),
    ("seal", 0.5, "A big carved stone seal stamped down hard onto paper on a wooden desk: one short dry heavy thump."),
    ("flag", 0.7, "A wooden flag pole rammed firmly into the top of a wall: one solid wooden thunk, then a short flap of cloth. Dry, close, no music."),
    ("army", 0.9, "Thousands of soldiers stamp their feet once, all together: one massive low thud with a rattle of armour and spears. One stamp only, no voices, no music."),
    ("slam", 0.8, "A fist slammed down hard on a low wooden table, the cups on it rattle: one heavy wooden bang and a short rattle of crockery. Dry, close, no voice."),
    ("hooves_in", 2.0, "A single horse gallops up fast on a dirt road at night and pulls up: quick hoofbeats coming closer, then stopping. No voices, no music."),
    ("clink", 0.5, "Two small bronze wine cups clinked together once: one short bright metallic clink." + DRY),
    ("drum", 1.2, "One single hit on a large low war drum: a dark heavy boom with a short decay. One hit only, dry, no music."),
    ("jade", 0.6, "A small jade pendant tapped once: one tiny clear high glassy chime, like a little stone bell. One note only, short, dry."),
    ("shing", 1.2, "Sword unsheathed fast: one short bright metallic shing with a clean ringing tail." + DRY),
    ("swish", 0.5, "A sword blade swung fast through the air: one sharp quick whoosh, no impact." + DRY),
    ("clash", 0.7, "Two steel swords clash once: one short hard metallic clang with a brief ring. One hit only, dry, close, no music."),
    ("ram", 0.8, "A heavy round wooden shield rammed into two men in armour: one big dull wooden impact with a clatter of metal plates. Short, dry, no voices."),
    ("armour", 1.0, "Two soldiers in metal armour fall flat on the ground: a heavy clattering crash of armour plates and one thud. Short, no voices, no music."),
    ("flap", 0.6, "A heavy canvas tent door flap thrown open fast: one quick cloth whump and flutter. Short, dry, close."),
    ("meat", 0.5, "A big piece of raw meat slapped down onto a hard flat surface: one wet heavy smack. One hit only, dry, close."),
    ("chop", 0.5, "One single chop of a blade into raw meat on a wooden board: one short wet thunk. One chop only, dry, close."),
    ("sneak", 1.5, "Two men tiptoeing away quickly on packed earth: a few fast soft careful footsteps. Quiet, dry, no voices, no music."),
    ("gallop", 3.0, "A single horse gallops away fast on a dirt road, the hoofbeats fade into the distance. Starts at once. No voices, no music."),
    ("run", 2.5, "Four men running fast on a dirt path: quick steady footfalls with a light rattle of gear. No voices, no music."),
    ("cap", 0.7, "A small stiff cloth cap drops onto dirt ground and rolls a little: one soft light thump, then a tiny scuff. Quiet, dry, close."),
    ("march", 1.5, "Two soldiers marching in step on packed earth: four heavy even steps with a light clink of armour. No voices, no music, dry."),
    ("whisper", 1.0, "A man whispering a secret quickly into someone's ear: a few hushed whispered syllables, no clear words. Close, dry, no music."),
    ("fly", 1.2, "A single housefly buzzing lazily close by: one short lazy buzz that passes. Nothing else, dry."),
]
BED = [
    ("tent", 10, "Inside a large army command tent during a small banquet: a few men talking in low voices, a fire crackling softly in a brazier, now and then a cup set down on a table. Calm, even, continuous. No clear words, no music."),
    ("night", 10, "Night in a military camp: crickets chirping steadily and a torch flame crackling softly close by. Quiet, even, continuous. No voices, no music."),
    ("day", 8, "Daytime at the gate of a military camp outdoors: a light wind, cloth banners flapping softly, soldiers and a horse far away now and then. Quiet, even, continuous. No clear words, no music."),
    ("privy", 6, "A quiet corner outdoors in the daytime behind a reed screen: a very soft breeze through dry reeds and one or two small birds far away. Calm, even, nearly silent. No voices, no music."),
    ("troops", 5, "A huge army of thousands of soldiers standing in a field: a low massed murmur of men, armour rustling, a few spears knocking. Continuous and even, heard from a short distance. No shouting, no music."),
]
# round 2: the first round's meat slaps came back silent, the drum and the sword swish as sub-bass thuds (nothing over
# 150 Hz: a phone does not play them), the troops as animals / birds, the privy air as a hiss, the jade as three clicks
# or a low tone, the march as one step, the day camp as a rumble; plus a tent bed without voices.
ROUND2 = [  # name, seconds, influence, takes, prompt
    ("meat", 0.6, 0.6, 3, "A wet slap: a heavy raw steak slapped down hard on a wooden table. One loud wet smack, mid-range, clearly audible. One hit only, close, dry."),
    ("drum", 1.0, 0.6, 3, "One hard hit with a wooden stick on a big Chinese war drum: a loud punchy thud with a clear attack and a short tail. One hit only, close, dry, no music."),
    ("swish", 0.5, 0.6, 3, "Whoosh of a thin sword blade slicing through the air: one fast bright airy swoosh, no impact, no thump. Single short sound effect, close, dry."),
    ("jade", 0.6, 0.6, 3, "One single clear note of a small stone chime struck once: a soft high ting with a short clean ring. One strike only, no second hit, dry, no music."),
    ("stamp", 0.5, 0.6, 2, "A rubber stamp slammed down hard on a wooden desk: one short dry thump."),
    ("slam", 0.8, 0.6, 2, "A fist bangs hard on a wooden table, the cups and dishes on it jump and rattle: one loud bang, then a short rattle. Close, dry, loud, no voice."),
    ("march", 1.6, 0.6, 2, "Two soldiers marching in step on hard earth: left, right, left, right, four clear even footsteps with armour clinking. Close, dry, no voices, no music."),
    ("troops", 5, 0.5, 3, "The low murmur of a very large crowd of men, thousands of soldiers waiting in a field: deep indistinct male voices and rustling, continuous and even. No single voice in the foreground, no animals, no birds, no music."),
    ("privy", 6, 0.5, 3, "Quiet outdoor room tone in the daytime: a faint gentle breeze and two or three soft bird chirps far away. Very calm and even. No hiss, no insects, no voices, no music."),
    ("day", 8, 0.5, 2, "Daytime outdoor ambience at an army camp: cloth flags fluttering in a light breeze, a few distant voices of men, far-off clatter. Even and continuous. No footsteps close by, no horses, no music."),
    ("fire", 10, 0.5, 2, "Inside a large tent: a wood fire crackling softly in a brazier, quiet room tone. Calm, even, continuous. No voices, no music."),
]
# round 3 (the fix round, after segments A and B were animated and the mix was checked against them):
#   feet  = the uncle RUNS in on foot in shot 7 (there is no horse in the picture): one runner who stops dead
#   day, fire = LONGER beds: the 4.7 s / 8.6 s clips were heard looping (the tent is on screen for 23 s)
#   air   = one steady quiet layer under both privy shots (the birds alone leave the loop point almost bare)
#   meat, tiptoe = the two picks that measured wrong (a metallic tick; three crunches)
ROUND3 = [  # name, seconds, influence, takes, prompt
    ("feet", 1.2, 0.6, 3, "One man running fast on packed earth in soft cloth shoes: five quick light footsteps coming closer, then he stops dead. Human footsteps only, no horse, no hooves, no voice, no music. Close, dry."),
    ("day", 14, 0.5, 2, "Daytime outdoor ambience at an army camp: cloth flags fluttering steadily in a light breeze, far-off clatter and a faint distant murmur. Even and continuous from start to finish, no loud single events. No footsteps close by, no horses, no clear words, no music."),
    ("fire", 20, 0.5, 2, "A wood fire burning steadily in an iron brazier: a soft continuous flame with gentle irregular crackles. Calm, even, continuous from start to finish. Mid-range, not bassy. No clicks, no tapping, no voices, no music."),
    ("air", 6, 0.5, 2, "Leaves rustling very softly and steadily in a light breeze outdoors: quiet, smooth, even and continuous from start to finish. No gusts, no hiss, no birds, no insects, no voices, no music."),
    ("meat", 0.6, 0.6, 3, "Cartoon wet splat: a big slab of raw meat flops onto a flat wooden board. One squelchy wet slap, loud and clear. One hit only, close, dry."),
    ("tiptoe", 1.5, 0.6, 2, "Cartoon sneaking: four quick soft tiptoe footsteps on a wooden floor, light and careful, evenly spaced. Footsteps only, no voice, no music. Close, dry."),
]
items = []
if sys.argv[1].endswith("-03"):
    for name, dur, infl, n, text in ROUND3:
        for k in range(1, n + 1): items.append({"type": "sfx", "name": f"{name}_t{k}", "text": text, "duration": dur, "influence": infl})
    SPOT, BED = [], []
if sys.argv[1].endswith("-02"):
    for name, dur, infl, n, text in ROUND2:
        for k in range(1, n + 1): items.append({"type": "sfx", "name": f"{name}_r{k}", "text": text, "duration": dur, "influence": infl})
    SPOT, BED = [], []

for name, dur, text in SPOT:
    for k in (1, 2): items.append({"type": "sfx", "name": f"{name}_{k}", "text": text, "duration": dur, "influence": 0.6})
for name, dur, text in BED:
    for k in (1, 2): items.append({"type": "sfx", "name": f"{name}_{k}", "text": text, "duration": dur, "influence": 0.5})
req = {"id": sys.argv[1], "tag": True, "items": items}
json.dump(req, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print(f"{sys.argv[1]}: {len(items)} items, {sum(i['duration'] for i in items):.1f} s asked")
