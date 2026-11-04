"""ep60 sound effects: pick the good ElevenLabs takes, tune the tonal ones onto D Hijaz tones (owner: tonal SFX in the
track's key), trim lead-in silence, fade abrupt ends, peak-normalise to -3 dBFS, write 48 kHz 24-bit WAV.

    python3 sfx_prep.py NEW_DIR OLD_DIR OUT_DIR

NEW_DIR = the mp3s from voice-output out/ep60-sfx-01, -02, -03; OLD_DIR = the first 15 (S01-S12, G1-G3).
Tuning is varispeed (pitch and length move together), measured first: the strongest partial -> nearest D/F#/A
(or an in-scale tone when that is the smaller move). Prints name, length, peak time, loudness.
"""
import sys, os, json, subprocess, numpy as np, soundfile as sf
from fractions import Fraction
from scipy import signal
SR = 48000
NEW, OLD, OUT = sys.argv[1:4]
# (out name, dir, source file, semitones, kind, what it is)   kind: shot = one-shot, amb = ambience take, loop = seamless loop
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
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', p, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).astype(np.float64)
def retune(y, st):
    if not st: return y
    r = Fraction(2 ** (st / 12)).limit_denominator(400); return signal.resample_poly(y, r.denominator, r.numerator, axis=0)
if __name__ == '__main__':
    import pyloudnorm as pyln
    os.makedirs(OUT, exist_ok=True); rows = []
    for name, d, src, st, kind, what in ITEMS:
        y = load(f'{d}/{src}.mp3'); y = signal.sosfilt(signal.butter(2, 25, 'high', fs=SR, output='sos'), y, axis=0); y = retune(y, st)
        pk = np.abs(y).max()
        if kind == 'shot':   # keep 10 ms before the first sound; fade an abrupt end (or a 50 ms safety fade)
            e = np.abs(y).max(1); i0 = max(0, int(np.argmax(e > pk * 10 ** (-45 / 20))) - int(0.01 * SR)); y = y[i0:]
            abrupt = np.abs(y[-int(0.03 * SR):]).max() / pk > 10 ** (-30 / 20)
            k = min(int((0.5 if abrupt else 0.05) * SR), len(y) // 3); y[-k:] *= np.linspace(1, 0, k)[:, None] ** 2
            k = int(0.002 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]
        elif kind == 'amb':
            k = int(0.08 * SR); y[:k] *= np.linspace(0, 1, k)[:, None]; k = int(0.3 * SR); y[-k:] *= np.linspace(1, 0, k)[:, None]
        g = 10 ** (-3 / 20) / np.abs(y).max(); y = y * g
        sf.write(f'{OUT}/{name}.wav', y.astype(np.float32), SR, subtype='PCM_24')
        L = pyln.Meter(SR, block_size=min(0.4, len(y) / SR - 0.01)).integrated_loudness(y)
        row = dict(name=name, len=round(len(y) / SR, 2), hit=round(float(np.argmax(np.abs(y).max(1)) / SR), 2), lufs=round(L, 1), kind=kind, st=st, what=what)
        rows.append(row); print(json.dumps(row, ensure_ascii=False))
    json.dump(rows, open(f'{OUT}/sfx_rows.json', 'w'), ensure_ascii=False, indent=1)
