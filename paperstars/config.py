"""Global constants and the film's master timeline (all times in seconds)."""

W, H = 1280, 720
FPS = 24
SS = 2  # supersampling factor for vector drawing (anti-aliasing)
SAMPLE_RATE = 48000
SEED = 20260929

TITLE = "PAPER STARS"

# (name, start, end). Shots are contiguous; see story/shot_list.md.
SHOTS = [
    ("title", 0.0, 7.0),
    ("city_open", 7.0, 19.0),
    ("rooftop_wait", 19.0, 32.0),
    ("fold", 32.0, 42.0),
    ("release", 42.0, 57.0),
    ("drift", 57.0, 72.0),
    ("blackout", 72.0, 102.0),  # lights-out ripple + star reveal, one take
    ("together", 102.0, 116.0),
    ("end", 116.0, 126.0),
]
DURATION = SHOTS[-1][2]

# Cross-dissolves between shots: boundary time -> half-width in seconds.
DISSOLVES = {
    7.0: 1.0,
    32.0: 0.5,
    42.0: 0.5,
    57.0: 0.75,
    102.0: 1.0,
    116.0: 1.5,
}

# Story beats shared by picture and sound.
PLANE_POINT = 24.5  # Mira points at the plane
FOLD_START = 32.0
FOLD_PUFF = 38.5  # pentagon puffs into a star
FOLD_GLOW = 39.0
FIRST_RELEASE = 46.2  # first star leaves her hands
JAR_OPEN = 50.5
JAR_STREAM = (51.0, 56.5)
PEOPLE_APPEAR = (59.0, 66.0)
FIRST_LIGHTS_OFF = (66.0, 71.5)
RIPPLE_START = 73.0
RIPPLE_END = 83.5
STUBBORN_OFF = 86.6  # the last window
SILENCE = (84.6, 89.5)  # music stops; one window is still on
STARS_IN = (89.5, 97.0)
MILKY_WAY_IN = (92.0, 101.0)
TILT = (93.0, 101.5)
NEIGHBOR_WAVE = 106.0
MIRA_WAVE = 107.6
SHOOTING_STAR = 111.0
