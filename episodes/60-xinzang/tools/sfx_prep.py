"""ep60 sound effects: pick the good ElevenLabs takes, tune the tonal ones onto D Hijaz tones (owner: tonal SFX in the
track's key), trim lead-in silence, fade abrupt ends, peak-normalise to -3 dBFS, write 48 kHz 24-bit WAV.

    python3 sfx_prep.py NEW_DIR OLD_DIR OUT_DIR          (ONLY=name1,name2 ... to rebuild some and merge into sfx_rows.json)

NEW_DIR = the mp3s from voice-output out/ep60-sfx-01 ... -04; OLD_DIR = the first 15 (S01-S12, G1-G3).
Tuning is varispeed (pitch and length move together), measured first: the strongest partial -> nearest D/F#/A
(or an in-scale tone when that is the smaller move). Prints name, length, peak time, loudness.
"""
import sys, os, json, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fractions import Fraction
from scipy import signal
SR = 48000
NEW, OLD, OUT = sys.argv[1:4]
# (out name, dir, source file, semitones, kind, what it is)   kind: shot = one-shot, amb = ambience take, loop = seamless loop,
#   chorus = one voice layered into a tiny crowd (4 copies detuned -1..+2 st, 0-31 ms apart, spread L-R, cut short)
#   layer  = the take + a second take under it (LAYERS: partner, low-pass, segment, gain), cut to `keep` s with a fade
ITEMS = [
 ('X01_linen_wrap', NEW, 'X01_linen_wrap', 0, 'shot', 'linen bandage wrapped round a body: soft dry cloth rustle and pulls (embalming)'),
 ('X02_canopic_lid_clink', NEW, 'X02_canopic_lid', +1.12, 'shot', 'stone lid set on a canopic jar: clinks + short scrape (tuned F7 -> F#7)'),
 ('X03_natron_salt_pour', NEW, 'X03_natron_pour', 0, 'shot', 'dry coarse salt (natron) poured onto linen: granular trickle'),
 ('X04_papyrus_unroll', NEW, 'X04_papyrus_unroll_c', 0, 'shot', 'papyrus scroll unrolling: continuous crisp crackle'),
 ('X04b_papyrus_unroll_slap', NEW, 'X04_papyrus_unroll_b', 0, 'shot', 'alt: quick unroll flutter, then the scroll slaps flat at ~2.0 s'),
 ('X05_reed_pen_scratch', NEW, 'X05_reed_pen', 0, 'shot', 'reed pen on papyrus: scratchy strokes + a tap in the ink palette (Thoth writes)'),
 ('X06_boat_oars_duat', NEW, 'X06_boat_oars_c', 0, 'amb', 'two slow oar strokes on dark water, splash and drip (Duat river); repeat for longer'),
 ('X06b_boat_oars_busy', NEW, 'X06_boat_oars_b', 0, 'amb', 'alt: steadier rowing, more strokes and boat creak'),
 ('X07_serpent_hiss', NEW, 'X07_serpent_hiss', 0, 'shot', 'large serpent hiss swelling and fading (Apep / underworld snakes)'),
 ('X08_bronze_gate_creak', NEW, 'X08_bronze_gate', 0, 'shot', 'heavy bronze gate groaning open + soft thud (main resonance F#2: already in key)'),
 ('X09_judges_42_whisper_loop', NEW, 'X09_judges_whisper', 0, 'loop', 'hushed whispering crowd in a stone hall, no words (the 42 judges); seamless loop'),
 ('X10_scarab_clack', NEW, 'X10_scarab_clack', -1.73, 'shot', 'stone scarab amulet clacks on stone + tiny bounce (tuned B7 -> A7)'),
 ('X11_feather_land', NEW, 'X11_feather_land', 0, 'shot', 'feather drifting down: airy whoosh swelling to ~0.65 s, tiny high chime as it lands'),
 ('X12_scale_ding', NEW, 'X12_scale_ding_b', +1.90, 'shot', 'ONE soft brass ding, long ring: the pans come level (tuned C7 -> D7)'),
 ('X12b_scale_ding_settle', NEW, 'X12_scale_ding', +2.02, 'shot', 'alt: three dings as the beam settles, ~0.25 s apart (tuned C6 -> D6)'),
 ('X13_ammit_gulp', NEW, 'X13_ammit_gulp', 0, 'shot', 'comic monster gulp (0-0.4 s) then a satisfied grunt (0.85-1.75 s): Ammit eats the heart'),
 ('X14_reeds_birds_water_loop', NEW, 'X14_reeds_birds_water', 0, 'loop', 'Field of Reeds: flowing water, birdsong, warm morning; seamless loop'),
 ('X15_sickle_wheat', NEW, 'X15_sickle_wheat_b', 0, 'shot', 'sickle cuts through wheat twice (0.1 s and 1.45 s): harvest in the Field of Reeds'),
 ('X16_shabti_clatter', NEW, 'X16_shabti_clatter', 0, 'shot', 'many small clay figurines rattling/scuttling to life (shabtis), 2.2 s'),
 ('X17_heart_on_pan', NEW, 'X17_heart_on_pan_c', 0, 'shot', 'heart set on the bronze pan: wet thump + short metal ring (hit at ~0.75 s)'),
 ('X18_scale_tip_heavy', NEW, 'X18_scale_tip_heavy', -0.19, 'shot', 'scale tips hard: chains rattle, heavy clunk at ~0.45 s, rings on D4'),
 ('X19_knife_shing', NEW, 'X19_knife_shing', +0.43, 'shot', 'bronze knife glint: one bright metallic shing, peak ~0.6 s (gate guardians, shot 16; ring tuned to F#8)'),
 ('X20_cricket', NEW, 'X20_cricket', +0.40, 'shot', 'lone cricket in an empty hall, chirps at 1.3-2.5 s and 3.0-3.9 s: the awkward-silence joke (shots 25-26; tuned to Eb8)'),
 ('X21_stone_footsteps', NEW, 'X21_stone_footsteps', 0, 'shot', 'four slow barefoot steps on stone with soft echo, ~0.93 s apart (shots 27, 45)'),
 ('X22_comic_plop', NEW, 'X22_comic_plop', +1.93, 'shot', 'cartoon cork plop, 0.35 s (Ammit\'s hippo wiggle, shot 31; tuned C4 -> D4)'),
 ('X23_whip_crack', NEW, 'X23_whip_crack', 0, 'shot', 'one leather whip crack + short echo (the overseer shabti, shot 51)'),
 ('X24_hoe_chops', NEW, 'X24_hoe_chops', 0, 'shot', 'wooden hoe into soft earth, four chops ~0.88 s apart: slice them onto beats (shot 51)'),
 ('X25_tiny_chorus', NEW, 'X25b_tiny_chorus_hey', 0, 'chorus', 'a tiny crowd of squeaky voices answers at once, 0.6 s (the shabtis\' 「我在！」, shot 50)'),
 ('X26_ammit_roar', NEW, 'X26_ammit_roar_a', 0, 'layer', 'AMMIT: the full roar, raspy lioness snarl + a low chest punch (2nd take < 300 Hz), 1.55 s, hit ~0.1 s'),
 ('X27_ammit_grunt', NEW, 'X27_ammit_grunt_a', 0, 'layer', 'AMMIT: a low menacing grunt + a wet throat rattle under it, 0.75 s (her reveal)'),
 ('X28_ammit_growl', NEW, 'X28_ammit_growl_a', 0, 'shot', 'AMMIT: deep guttural crocodile-lion growl rising, 2.6 s (into the bite); its throat tone ~Eb4 rubs the D drone on purpose'),
 ('X30_lioness_roar', NEW, 'X30_lioness_roar_a', 0, 'layer', 'AMMIT v3 (owner 17:07 "similar to the lioness roar sample"): a real lioness roar, raspy, ~1 s, + a faint croc hiss under it'),
 ('X31_lion_snarl', NEW, 'X31_lion_snarl_short_b', 0, 'shot', 'AMMIT v3: a short snarling roar (shot 41, before the bite), 0.8 s'),
 ('X32_mean_chomp', OLD, 'S03_croc_snap', 0, 'layer', 'AMMIT v3: a mean crunchy chomp: the jaws slam (croc snap) + teeth crunching (2nd take) on top'),
 ('X33_bone_snap', NEW, 'X33_bone_snap_a', 0, 'shot', 'a bone snapped between two fists: crack + splinter (碎骨者, shot 20)'),
 ('X34_ba_wings', NEW, 'X34_small_wings_a', 0, 'shot', 'a small bird takes off: six soft feathery flaps over ~0.85 s (the ba, shot 11)'),
 ('X35_papyrus_flick', NEW, 'X35_papyrus_flick_a', 0, 'shot', 'one crisp papyrus page flick at ~0.1 s (two softer ones follow: take 0-0.22 s for a single flip)'),
 ('X40_ammit_roar_deep', NEW, 'X40_deep_roar_b', -2.0, 'layer', 'AMMIT v4 (owner 19:21 "not deep enough"): a deep lioness roar -2 st (rasp + ~200 Hz body), a chest layer an extra -3 st under it, a stone-hall tail'),
 ('X41_ammit_slam', NEW, 'X41_jaw_slam_b', -2.0, 'layer', 'AMMIT v4 bite (owner: "too crispy like an apple"): a heavy wet jaw SLAM -2 st + a low frame-drum body, no crunch'),
 ('X42_shadow_chomp', NEW, 'X41_jaw_slam_a', 3.0, 'shot', 'a small wet chomp (+3 st): the shadow eater (吞影者) shuts its beak'),
 ('X43_blood_lick', NEW, 'X43_lick_a', 0, 'shot', 'a wet slurpy lick (食血者 licks the red drop)'),
 ('X44_magic_whoosh', NEW, 'X44_magic_whoosh_a', 0, 'shot', 'magic: glowing energy whooshing forward, sparkly (the glyph burst, shot 17)'),
 ('X45_magic_blast', NEW, 'X45_magic_impact_b', 0, 'shot', 'magic: the shield blasting outward, warm thump + whoosh + glitter (shot 17)'),
 ('X46_magic_shield', NEW, 'X46_magic_shield', -1.95, 'shot', 'magic: a shield forming, shimmering hum + sparkles (tuned E6 -> D6)'),
 ('S01_heartbeat', OLD, 'S01_heartbeat', 0, 'shot', 'slow deep heartbeat, close'),
 ('S02_scale_settle', OLD, 'S02_scale_settle', +0.61, 'shot', 'balance tilting and settling, creak + small tick (tick tuned to D6)'),
 ('S03_croc_snap', OLD, 'S03_croc_snap', 0, 'shot', 'crocodile jaws snap with a short low growl'),
 ('S04_beast_growl', OLD, 'S04_beast_growl', 0, 'shot', 'low monster growl: croc hiss + lion rumble'),
 ('S05_wings', OLD, 'S05_wings', 0, 'shot', 'large wings unfold and beat twice'),
 ('S06_sistrum', OLD, 'S06_sistrum', 0, 'shot', 'sistrum shaken once, dry jingle'),
 ('S07_gong', OLD, 'S07_gong', +0.12, 'shot', 'deep temple gong, shimmering tail (centred on D2, abrupt end faded)'),
 ('S08_stone_door', OLD, 'S08_stone_door', 0, 'shot', 'heavy stone door grinding open, grit (abrupt end faded)'),
 ('S09_sand_wind_loop', OLD, 'S09_sand_wind', 0, 'loop', 'desert wind over stone; loop'),
 ('S10_magic_reveal', OLD, 'S10_magic_reveal', 0, 'shot', 'reversed shimmer swelling into a soft chime'),
 ('S11_frame_drum', OLD, 'S11_frame_drum', 0, 'shot', 'single deep frame drum with room'),
 ('S12_torch_loop', OLD, 'S12_torch', 0, 'loop', 'torch crackling in a tomb; loop'),
 ('G1_reed_flourish', OLD, 'G1_reed_flourish', 0, 'shot', 'ElevenLabs reed flourish stinger (already A5, in key)'),
 ('G2_darbuka_roll_hit', OLD, 'G2_darbuka_roll_hit', 0, 'shot', 'ElevenLabs darbuka roll into a hit'),
 ('G3_zills', OLD, 'G3_zills', -0.20, 'shot', 'finger cymbals (tuned to F#7)'),
]
LAYERS = {'X26_ammit_roar': dict(src='X26_ammit_roar_b', lp=300, seg=(0.0, 0.6), db=-4, keep=1.55),
          'X27_ammit_grunt': dict(src='X27_ammit_grunt_b', lp=None, seg=(0.0, 0.8), db=-6, keep=0.75),
          'X30_lioness_roar': dict(src='X07_serpent_hiss', lp=None, seg=(0.9, 1.9), db=-14, keep=1.3),
          'X32_mean_chomp': dict(src='X32_crunchy_bite_a', lp=None, seg=(0.0, 0.7), db=-3, keep=1.0, dir='NEW'),
          'X40_ammit_roar_deep': dict(parts=[dict(src='X40_deep_roar_a', st=-3.0, lp=700, seg=(0.0, 2.6), db=-10, delay=0.04)], room=(1.6, -12), keep=2.4, fade=0.8),
          'X41_ammit_slam': dict(parts=[dict(src='X41_jaw_slam_a', lp=1800, seg=(0.0, 0.9), db=-9),
                                        dict(src='S11_frame_drum', dir='OLD', st=-3.0, lp=260, seg=(0.0, 1.2), db=-5)], keep=1.1, fade=0.4)}
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
def retune(y, st):
    if not st: return y
    r = Fraction(2 ** (st / 12)).limit_denominator(400); return signal.resample_poly(y, r.denominator, r.numerator, axis=0)
if __name__ == '__main__':
    import pyloudnorm as pyln
    os.makedirs(OUT, exist_ok=True); rows = []
    only = set(filter(None, os.environ.get('ONLY', '').split(',')))
    for name, d, src, st, kind, what in ITEMS:
        if only and name not in only: continue
        y = load(f'{d}/{src}.mp3'); y = signal.sosfilt(signal.butter(2, 25, 'high', fs=SR, output='sos'), y, axis=0); y = retune(y, st)
        pk = np.abs(y).max()
        if kind == 'shot':   # keep 10 ms before the first sound; fade an abrupt end (or a 50 ms safety fade)
            e = np.abs(y).max(1); i0 = max(0, int(np.argmax(e > pk * 10 ** (-45 / 20))) - int(0.01 * SR)); y = y[i0:]
            abrupt = np.abs(y[-int(0.03 * SR):]).max() / pk > 10 ** (-30 / 20)
            k = min(int((0.5 if abrupt else 0.05) * SR), len(y) // 3); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
            k = int(0.002 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]
        elif kind == 'layer':   # the take + partner layers (each: src, dir, seg, st, lp, hp, db, delay), optional room, cut to keep
            L_ = LAYERS[name]; e = np.abs(y).max(1); i0 = max(0, int(np.argmax(e > pk * 10 ** (-40 / 20))) - int(0.005 * SR)); y = y[i0:]
            pk = np.abs(y).max()
            for P_ in L_.get('parts', [L_]):
                z = load(f'{NEW if P_.get("dir") == "NEW" else OLD if P_.get("dir") == "OLD" else d}/{P_["src"]}.mp3')
                z = retune(z, P_.get('st', 0)); z = z[int(P_['seg'][0] * SR):int(P_['seg'][1] * SR)]
                if P_.get('lp'): z = signal.sosfilt(signal.butter(4, P_['lp'], 'low', fs=SR, output='sos'), z, axis=0)
                if P_.get('hp'): z = signal.sosfilt(signal.butter(2, P_['hp'], 'high', fs=SR, output='sos'), z, axis=0)
                kz = min(len(z) // 3, int(0.08 * SR)); z[-kz:] *= np.linspace(1, 0, kz)[:, None]
                z *= pk / (np.abs(z).max() + 1e-9) * 10 ** (P_['db'] / 20); dl = int(P_.get('delay', 0) * SR)
                n_ = max(len(y), dl + len(z)); y = np.pad(y, ((0, n_ - len(y)), (0, 0))); y[dl:dl + len(z)] += z
            if L_.get('room'):   # a stone hall: the long resonant tail (owner 19:21 "not deep enough")
                import egypt_cues as E_; rt, wet = L_['room']; y = np.pad(y, ((0, int(rt * SR)), (0, 0)))
                y = y + 10 ** (wet / 20) * E_.conv_st(y, E_.make_ir(rt, seed=41))
            y = y[:int(L_['keep'] * SR)]; k = int(L_.get('fade', 0.3) * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
            k = int(0.002 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]
        elif kind == 'chorus':
            e = np.abs(y).max(1); i0 = max(0, int(np.argmax(e > pk * 10 ** (-45 / 20))) - int(0.005 * SR)); y = y[i0:i0 + int(0.62 * SR)]
            out = np.zeros((len(y) + int(0.05 * SR), 2))
            for st_, d_, pan in ((0, 0.0, 0.0), (-1.0, 0.012, -0.6), (1.0, 0.022, 0.6), (2.0, 0.031, -0.25)):
                v = retune(y, st_).mean(1)[:len(y)]; i = int(d_ * SR); th = (pan + 1) * np.pi / 4
                out[i:i + len(v), 0] += v * np.cos(th); out[i:i + len(v), 1] += v * np.sin(th)
            y = out; k = int(0.15 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2; k = int(0.002 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]
        elif kind == 'amb':
            k = int(0.08 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]; k = int(0.3 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None]
        g = 10 ** (-3 / 20) / np.abs(y).max(); y = y * g
        sf.write(f'{OUT}/{name}.wav', y.astype(np.float32), SR, subtype='PCM_24')
        L = pyln.Meter(SR, block_size=min(0.4, len(y) / SR - 0.01)).integrated_loudness(y)
        row = dict(name=name, len=round(len(y) / SR, 2), hit=round(float(np.argmax(np.abs(y).max(1)) / SR), 2), lufs=round(L, 1), kind=kind, st=st, what=what)
        rows.append(row); print(json.dumps(row, ensure_ascii=False))
    if only and os.path.exists(f'{OUT}/sfx_rows.json'):   # merge: keep the other rows, in ITEMS order
        old = {r['name']: r for r in json.load(open(f'{OUT}/sfx_rows.json'))}; old.update({r['name']: r for r in rows})
        rows = [old[n] for n, *_ in ITEMS if n in old]
    json.dump(rows, open(f'{OUT}/sfx_rows.json', 'w'), ensure_ascii=False, indent=1)
