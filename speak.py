"""Generate the clips listed in request.json with ElevenLabs, then transcribe each with Whisper as a check."""
import json, os, sys, requests
KEY = os.environ.get("ELEVENLABS_API_KEY", "")
H = {"xi-api-key": KEY}
API = "https://api.elevenlabs.io"
req = json.load(open("request.json"))
report = {"id": req["id"], "clips": []}
def log(*a): print(*a, flush=True)
if not KEY: log("NO KEY: add the ELEVENLABS_API_KEY repository secret"); sys.exit(1)

# account + models
try:
    u = requests.get(f"{API}/v1/user/subscription", headers=H, timeout=30).json()
    report["plan"] = {k: u.get(k) for k in ("tier", "character_count", "character_limit", "status")}
except Exception as e: report["plan"] = str(e)
log("plan:", report["plan"])
models = requests.get(f"{API}/v1/models", headers=H, timeout=30).json()
ids = [m.get("model_id") for m in models] if isinstance(models, list) else []
if not ids: log("models response:", str(models)[:300])
report["models"] = ids
log("models:", ids)
def pick_model():
    for pref in req.get("model_prefs", []):
        if pref in ids: return pref
    for m in ids:
        if "v4" in m and "turbo" not in m and "flash" not in m: return m
    for m in ("eleven_v3", "eleven_multilingual_v2"):
        if m in ids: return m
    return "eleven_multilingual_v2"
MODEL = pick_model(); report["model"] = MODEL; log("model:", MODEL)

# voices: own library (premade) with labels; optionally the shared library per language
own = requests.get(f"{API}/v2/voices?page_size=100", headers=H, timeout=30).json().get("voices", [])
report["own_voices"] = [{"id": v["voice_id"], "name": v["name"], "labels": v.get("labels"), "category": v.get("category")} for v in own]
def find_shared(lang, accent, gender, age=None):
    try:
        p = {"page_size": 20, "language": lang, "sort": "usage_character_count_1y"}
        if accent: p["accent"] = accent
        if gender: p["gender"] = gender
        if age: p["age"] = age
        r = requests.get(f"{API}/v1/shared-voices", headers=H, params=p, timeout=30).json()
        vs = r.get("voices", [])
        for v in vs:
            a = requests.post(f"{API}/v1/voices/add/{v['public_owner_id']}/{v['voice_id']}", headers=H, json={"new_name": f"{lang}-{v['name']}"[:40]}, timeout=30)
            if a.ok: return a.json().get("voice_id", v["voice_id"]), f"shared:{v['name']} ({v.get('accent')}, {v.get('language')})"
            log("add shared failed", a.status_code, a.text[:200]); break
    except Exception as e: log("shared search failed", e)
    return None, None
def find_own(accent, gender):
    for v in own:
        lb = {k: str(x).lower() for k, x in (v.get("labels") or {}).items()}
        if accent and accent in lb.get("accent", "") and (not gender or lb.get("gender") == gender): return v["voice_id"], f"own:{v['name']} {lb}"
    for v in own:
        lb = {k: str(x).lower() for k, x in (v.get("labels") or {}).items()}
        if not gender or lb.get("gender") == gender: return v["voice_id"], f"own:{v['name']} {lb}"
    return own[0]["voice_id"], f"own:{own[0]['name']}"

for it in req["items"]:
    vid, vname = (None, None)
    if it.get("shared", True): vid, vname = find_shared(it["lang"], it.get("accent"), it.get("gender"), it.get("age"))
    if not vid: vid, vname = find_own(it.get("accent"), it.get("gender"))
    body = {"text": it["text"], "model_id": MODEL, "language_code": it["lang"]}
    if it.get("settings"): body["voice_settings"] = it["settings"]
    url = f"{API}/v1/text-to-speech/{vid}?output_format=mp3_44100_128"
    r = requests.post(url, headers=H, json=body, timeout=120)
    if not r.ok and r.status_code in (400, 422):
        log("retry without language_code:", r.text[:200]); body.pop("language_code"); r = requests.post(url, headers=H, json=body, timeout=120)
    rec = {"name": it["name"], "lang": it["lang"], "text": it["text"], "voice": vname, "status": r.status_code}
    if r.ok:
        fn = f"{it['name']}.mp3"; open(f"out/{fn}", "wb").write(r.content); rec["file"] = fn; rec["bytes"] = len(r.content)
    else: rec["error"] = r.text[:400]
    log(json.dumps(rec, ensure_ascii=False)); report["clips"].append(rec)

# check: what does Whisper hear?
try:
    from faster_whisper import WhisperModel
    wm = WhisperModel("small", device="cpu", compute_type="int8")
    for rec in report["clips"]:
        if "file" not in rec: continue
        segs, info = wm.transcribe(f"out/{rec['file']}", beam_size=5)
        rec["heard"] = "".join(s.text for s in segs).strip(); rec["heard_lang"] = info.language
        rec["heard_lang_p"] = round(info.language_probability, 3); rec["seconds"] = round(info.duration, 2)
except Exception as e: report["whisper_error"] = str(e)
json.dump(report, open("out/report.json", "w"), ensure_ascii=False, indent=2)
log(json.dumps(report["clips"], ensure_ascii=False, indent=1))
