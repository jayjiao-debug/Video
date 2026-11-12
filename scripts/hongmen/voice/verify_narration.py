#!/usr/bin/env python3
"""Moved to the shared kit: scripts/kit/voice/verify_narration.py. Same arguments as before."""
import os, runpy, sys
sys.dont_write_bytecode = True
K = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../kit/voice/verify_narration.py")
sys.argv[0] = K
runpy.run_path(K, run_name="__main__")
