"""Sound cues for the v4 cut: the v2 cue family (tools/sfx.py generators) re-placed through the v4 edit, plus cues for
the new shots (the stone push, the fight). usage: sfx_v4.py <timeline_v4.json> <push_contact_s> <out.wav>"""
import sys, json
src = open(__file__.replace('v4/sfx_v4.py', 'tools/sfx.py')).read().split('# ---- the cue list')[0]
exec(src)
T = {l['id']: l for l in json.load(open(sys.argv[1]))['lines']}
st = lambda k: T[k]['start']
contact = float(sys.argv[2])
def mapv(t, a, b, s0, s1):           # v2 time inside a v4 segment -> v4 time
    return a + (t - s0) * (b - a) / (s1 - s0)
# ---- opening, title (same times as v2)
put(swish(0.09, 3000, 9000), 0.30, -30, -0.2)
put(thump(140, 60, 0.35, 0.6), 2.833, -27, -0.2)
put(rustle(0.8), 4.50, -33, 0.1)
put(rustle(0.5, 70), 8.673, -31, 0.0)
put(fade(cicadas(4.2), 0.8, 0.02), 14.45, -34)
for tt in (18.657, 18.866, 19.075, 19.284, 19.493, 20.329):
    put(swish(0.16, 1500, 7000), tt - 0.02, -33)
put(thump(120, 55, 0.6, 0.5), 22.814, -24, 0.2)
put(rip(0.3), 26.92, -27, -0.3)
put(whoosh(0.35, 300, 2200), 26.80, -30, -0.2)
# ---- 东京
put(pour(0.6), mapv(55.30, st('W11'), st('W12'), 53.21, 56.93), -34, -0.1)        # wine (陆谦)
put(clack(760), mapv(61.125, st('W13'), st('W14'), 59.87, 62.42), -24, 0.0)        # cangue clack
put(rustle(1.2, 30, 3000, 9000), st('W14') + 0.4, -36, 0.1)                         # the scribe's brush on paper
put(fade(cicadas(2.0, 4), 0.4, 0.3), st('W15'), -35)                                # road
put(pour(0.8), mapv(35.70, st('W16'), st('W17'), 35.306, 38.638), -34, 0.2)        # tea at home
put(rustle(0.5, 70), mapv(8.673, st('W17'), st('W18'), 5.341, 9.913), -31, 0.0)    # her crumple
# ---- the promise, 沧州
put(fade(wind(6.0, 5, 160, 700), 2.5, 0.0), mapv(71.4, st('W19'), st('W20'), 67.8, 72.4), -36)
put(fade(wind(4.6, 6, 160, 900, gust_at=(1.2,)), 0.6, 0.4), st('W20') + 1.4, -32)
put(thump(70, 30, 1.2, 0.8) + 0.4 * lp(noise(1.2), 600) * env(int(1.2 * SR), 0.05, 0.9), mapv(75.256, st('W21'), st('W22'), 74.3, 77.748), -27)
# ---- the push (motion capture): scrape while it slides, thud on the door
p0 = st('W22'); c = p0 + (contact - 0.25)
put(fade(wind(2.5, 7, 120, 400), 0.2, 1.0), p0, -40)
put(fade(0.6 * bp(noise(c - p0 + 0.1), 180, 1600) * env(int((c - p0 + 0.1) * SR), 0.2, 0.3), 0.15, 0.05), p0, -30)
put(thump(80, 40, 0.5, 0.6), c, -26)
# ---- fire through the crack -> the music's silence
fire_a = p0 + 2.55; fire_b = mapv(92.05, 90.0, 93.565, 87.9, 93.565)
put(fade(fire(fire_b - fire_a), 0.25, 0.01), fire_a, -22)
put(rustle(0.32, 60, 200, 1800), 93.25, -34)
put(thump(65, 30, 1.0, 1.0), 93.565, -17)                                           # the doors (the one loud cue)
put(fade(wind(7.0, 8, 200, 1400, gust_at=(0.4, 3.0)), 0.05, 1.2), 93.565, -24)
put(fade(fire(16.0, seed=21), 0.3, 1.5), 94.2, -27)                                 # the burning depot behind the fight
# ---- the fight
k27 = st('W27'); k28 = k27 + 1.65
for tt in (k27, k28):
    put(whoosh(0.28, 500, 3000), tt - 0.18, -24, 0.2)                              # spear thrust
    put(thump(90, 40, 0.45, 0.7), tt + 0.04, -23, 0.1)                             # the hit / the fall
put(thump(70, 32, 0.8, 0.5) + 0.3 * lp(noise(0.8), 900) * env(int(0.8 * SR), 0.02, 0.6), st('W28'), -22)  # thrown into the snow
put(swish(0.35, 4000, 11000), st('W28') + 2.3, -28, -0.2)                            # the blade drawn
put(thump(55, 28, 1.2, 0.3), st('W29'), -28)                                        # the face: low hit
put(whoosh(0.5, 250, 2600), st('W30') - 0.12, -22) ; put(rip(0.35), st('W30'), -25)  # the blow -> ink
# ---- 梁山, the news, the end (v2 times from 132.2 on)
put(fade(water(10.0), 1.5, 2.0), st('W32'), -30)
for tt in (134.21, 134.49, 134.77, 135.05, 135.33, 135.61):
    put(swish(0.18, 1500, 6500), tt - 0.02, -34)
put(fade(whoosh(0.9, 300, 1500), 0.3, 0.4), 136.0, -33)
put(thump(120, 55, 0.6, 0.5), 141.862, -23, 0.0)
sf.write(sys.argv[3], out, SR, subtype='FLOAT')
print('sfx v4 ok', sys.argv[3], 'peak', float(np.max(np.abs(out))))
