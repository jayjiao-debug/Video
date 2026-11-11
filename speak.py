"""Generate the clips listed in request.json with ElevenLabs, then transcribe each with Whisper as a check."""
import json, os, re, sys, requests
KEY = os.environ.get("ELEVENLABS_API_KEY", "")
H = {"xi-api-key": KEY}
API = "https://api.elevenlabs.io"
req = json.load(open("request.json"))
report = {"id": req["id"], "clips": []}
SONGS = {}
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
def find_shared(lang, accent, gender, age=None, search=None, use_case=None, pick=0):
    try:
        p = {"page_size": 20, "language": lang, "sort": "usage_character_count_1y"}
        if accent: p["accent"] = accent
        if gender: p["gender"] = gender
        if age: p["age"] = age
        if search: p["search"] = search
        if use_case: p["use_cases"] = use_case
        r = requests.get(f"{API}/v1/shared-voices", headers=H, params=p, timeout=30).json()
        vs = r.get("voices", [])
        for v in vs[pick:]:
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
    if it.get("url"):   # fetch a public, openly licensed recording (e.g. First Sounds, CC BY) instead of synthesising
        rec = {"name": it["name"], "lang": it.get("lang", ""), "text": it.get("text", ""), "url": it["url"]}
        try:
            r = requests.get(it["url"], timeout=60, headers={"User-Agent": "Mozilla/5.0 (voice-farm)"})
            rec["status"] = r.status_code
            if r.ok: fn = f"{it['name']}.mp3"; open(f"out/{fn}", "wb").write(r.content); rec["file"] = fn; rec["bytes"] = len(r.content)
        except Exception as e: rec["error"] = str(e)[:300]
        log(json.dumps(rec, ensure_ascii=False)); report["clips"].append(rec); continue
    if it.get("type") == "voices":   # list voices of the shared library (no generation): {"type":"voices","name","lang","accent"?,"gender"?,"age"?,"use_case"?,"search"?,"n"?}
        p = {"page_size": it.get("n", 30), "language": it.get("lang", "zh"), "sort": it.get("sort", "usage_character_count_1y")}
        for k_src, k_dst in (("accent", "accent"), ("gender", "gender"), ("age", "age"), ("search", "search"), ("use_case", "use_cases"), ("category", "category")):
            if it.get(k_src): p[k_dst] = it[k_src]
        r = requests.get(f"{API}/v1/shared-voices", headers=H, params=p, timeout=30)
        rec = {"name": it["name"], "type": "voices", "status": r.status_code, "query": p}
        if r.ok:
            keys = ("name", "voice_id", "public_owner_id", "accent", "language", "gender", "age", "descriptive", "use_case", "category", "description", "usage_character_count_1y", "cloned_by_count", "preview_url")
            rec["voices"] = [{k: v.get(k) for k in keys} for v in r.json().get("voices", [])]
        else: rec["error"] = r.text[:400]
        log(json.dumps({"name": rec["name"], "status": rec["status"], "n": len(rec.get("voices", []))})); report["clips"].append(rec); continue
    if it.get("type") == "sfx":   # ElevenLabs text-to-sound-effects: {"type":"sfx","name","text","duration"?,"influence"?,"loop"?,"model"?}
        body = {"text": it["text"], "model_id": it.get("model", "eleven_text_to_sound_v2"), "prompt_influence": it.get("influence", 0.3)}
        if it.get("duration"): body["duration_seconds"] = it["duration"]
        if it.get("loop"): body["loop"] = True
        r = requests.post(f"{API}/v1/sound-generation?output_format=mp3_44100_128", headers=H, json=body, timeout=180)
        rec = {"name": it["name"], "type": "sfx", "text": it["text"], "model": body["model_id"], "status": r.status_code, "sfx": True}
        if r.ok: fn = f"{it['name']}.mp3"; open(f"out/{fn}", "wb").write(r.content); rec["file"] = fn; rec["bytes"] = len(r.content)
        else: rec["error"] = r.text[:400]
        log(json.dumps(rec, ensure_ascii=False)); report["clips"].append(rec); continue
    if it.get("type") == "upload":   # ElevenLabs Music upload (for audio-reference conditioning): {"type":"upload","name","file","extract_plan"?}
        files = {"file": (os.path.basename(it["file"]), open(it["file"], "rb"), "audio/mpeg")}
        data = {}
        if it.get("extract_plan"): data["extract_composition_plan"] = it["extract_plan"]
        r = requests.post(f"{API}/v1/music/upload", headers=H, files=files, data=data, timeout=600)
        rec = {"name": it["name"], "type": "upload", "file_in": it["file"], "status": r.status_code}
        if r.ok:
            j = r.json(); SONGS[it["name"]] = j.get("song_id"); rec["song_id"] = j.get("song_id"); rec["composition_plan"] = j.get("composition_plan")
        else: rec["error"] = r.text[:600]
        log(json.dumps(rec, ensure_ascii=False)[:3000]); report["clips"].append(rec); continue
    if it.get("type") == "music":   # ElevenLabs Music: {"type":"music","name","text" (prompt) | "plan" (composition plan),"ms"?,"model"?,"instrumental"?}
        body = {}
        if it.get("plan"): body["composition_plan"] = json.loads(re.sub(r'"@([A-Za-z0-9_]+)"', lambda m: json.dumps(SONGS.get(m.group(1), m.group(0))), json.dumps(it["plan"])))
        else:
            body["prompt"] = it["text"]; body["music_length_ms"] = int(it.get("ms", 30000))
            if it.get("instrumental", True): body["force_instrumental"] = True
        mm = it.get("model") or next((m for m in ids if m and "music" in m), None)
        if mm: body["model_id"] = mm
        url = f"{API}/v1/music?output_format=mp3_44100_192"
        r = requests.post(url, headers=H, json=body, timeout=900)
        if not r.ok and "model_id" in body:
            log("music retry without model_id:", r.status_code, r.text[:300]); body.pop("model_id"); r = requests.post(url, headers=H, json=body, timeout=900)
        if not r.ok and "force_instrumental" in body:
            log("music retry without force_instrumental:", r.status_code, r.text[:300]); body.pop("force_instrumental"); r = requests.post(url, headers=H, json=body, timeout=900)
        rec = {"name": it["name"], "type": "music", "text": it.get("text", ""), "model": body.get("model_id"), "status": r.status_code, "sfx": True}
        if r.ok: fn = f"{it['name']}.mp3"; open(f"out/{fn}", "wb").write(r.content); rec["file"] = fn; rec["bytes"] = len(r.content)
        else: rec["error"] = r.text[:600]
        log(json.dumps(rec, ensure_ascii=False)); report["clips"].append(rec); continue
    vid, vname = (it.get("voice_id"), it.get("voice_id"))
    added = None
    if it.get("add"):   # a shared-library voice by its ids {"owner","voice_id","name"}: add it to the account, speak, remove it again
        ad = it["add"]
        a = requests.post(f"{API}/v1/voices/add/{ad['owner']}/{ad['voice_id']}", headers=H, json={"new_name": ("s-" + ad.get("name", it["name"]))[:40]}, timeout=30)
        if a.ok: vid = added = a.json().get("voice_id", ad["voice_id"]); vname = "shared:" + ad.get("name", "")
        else:
            rec = {"name": it["name"], "lang": it.get("lang", ""), "text": it["text"], "voice": ad.get("name", ""), "status": a.status_code, "error": "add failed: " + a.text[:300]}
            log(json.dumps(rec, ensure_ascii=False)); report["clips"].append(rec); continue
    if not vid and it.get("shared", True): vid, vname = find_shared(it["lang"], it.get("accent"), it.get("gender"), it.get("age"), it.get("search"), it.get("use_case"), it.get("pick", 0))
    if not vid: vid, vname = find_own(it.get("accent"), it.get("gender"))
    body = {"text": it["text"], "model_id": it.get("model", MODEL), "language_code": it["lang"]}
    if it.get("settings"): body["voice_settings"] = it["settings"]
    url = f"{API}/v1/text-to-speech/{vid}?output_format=mp3_44100_128"
    r = requests.post(url, headers=H, json=body, timeout=120)
    if not r.ok and r.status_code in (400, 422):
        log("retry without language_code:", r.text[:200]); body.pop("language_code"); r = requests.post(url, headers=H, json=body, timeout=120)
    rec = {"name": it["name"], "lang": it["lang"], "text": it["text"], "voice": vname, "voice_id": vid, "model": body["model_id"], "status": r.status_code}
    if r.ok:
        fn = f"{it['name']}.mp3"; open(f"out/{fn}", "wb").write(r.content); rec["file"] = fn; rec["bytes"] = len(r.content)
    else: rec["error"] = r.text[:400]
    if added and it.get("remove", True):
        try: rec["removed"] = requests.delete(f"{API}/v1/voices/{added}", headers=H, timeout=30).status_code
        except Exception as e: rec["removed"] = str(e)[:100]
    log(json.dumps(rec, ensure_ascii=False)); report["clips"].append(rec)

# check: what does Whisper hear?
try:
    from faster_whisper import WhisperModel
    wm = WhisperModel("small", device="cpu", compute_type="int8")
    for rec in report["clips"]:
        if "file" not in rec: continue
        if rec.get("sfx"):   # no transcript for sound effects, only the length
            import soundfile as _sf
            try: rec["seconds"] = round(_sf.info(f"out/{rec['file']}").duration, 2)
            except Exception: pass
            continue
        segs, info = wm.transcribe(f"out/{rec['file']}", beam_size=5)
        rec["heard"] = "".join(s.text for s in segs).strip(); rec["heard_lang"] = info.language
        rec["heard_lang_p"] = round(info.language_probability, 3); rec["seconds"] = round(info.duration, 2)
except Exception as e: report["whisper_error"] = str(e)
# check for sound effects (request: "tag": true): what does an AudioSet tagger (AST) hear in each clip?
if req.get("tag"):
    try:
        import numpy as np, soundfile as sf, torch
        from scipy.signal import resample_poly
        from transformers import ASTFeatureExtractor, ASTForAudioClassification
        name = "MIT/ast-finetuned-audioset-10-10-0.4593"
        fe = ASTFeatureExtractor.from_pretrained(name); am = ASTForAudioClassification.from_pretrained(name).eval()
        for rec in report["clips"]:
            if "file" not in rec or not rec.get("sfx"): continue
            try:
                x, sr = sf.read(f"out/{rec['file']}", dtype="float32", always_2d=True); x = x.mean(axis=1)
                rec["seconds"] = round(len(x) / sr, 2)
                if sr != 16000: x = resample_poly(x, 16000, sr).astype("float32")
                with torch.no_grad(): p = torch.sigmoid(am(**fe(x, sampling_rate=16000, return_tensors="pt")).logits)[0]
                top = torch.topk(p, 8)
                rec["tags"] = [[am.config.id2label[int(i)], round(float(v), 3)] for v, i in zip(top.values, top.indices)]
                log(rec["name"], rec["tags"])
            except Exception as e: rec["tag_error"] = repr(e)[:300]
    except Exception as e: report["tag_error"] = repr(e)[:500]; log("tag error", report["tag_error"])
json.dump(report, open("out/report.json", "w"), ensure_ascii=False, indent=2)
log(json.dumps(report["clips"], ensure_ascii=False, indent=1))
