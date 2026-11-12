"""Moved to the shared kit: scripts/kit/voice/audio.py. `import hmaudio` gives that very module (same globals)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../kit/voice"))
import audio as _kit_audio
sys.modules[__name__] = _kit_audio
