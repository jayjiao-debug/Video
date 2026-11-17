"""Private voice cloning on a public repo.

The repo is public, so a client's voice must never sit in it in the clear: not the recordings we
clone from, and not the narration made with the clone (minutes of clean speech = a new clone).

  python vault.py pre    (before speak.py)
    * derives a vault key pair from the ELEVENLABS_API_KEY secret (so only this runner can open
      what is sealed to it) and writes the PUBLIC key to out/vault_pub.txt;
    * "clone": {"name", "samples": ["vault/a.sealed", ...], "description", "labels",
                "remove_background_noise": false, "reuse": true}
      opens the sealed samples in /tmp, makes an Instant Voice Clone (or reuses a voice of that name),
      and replaces "@clone" in every item's voice_id in the runner's working copy of request.json.
  python vault.py post   (after speak.py, before publish)
    * "seal_to": "<hex public key>" seals every out/*.mp3 to that key (held only by whoever asked)
      and deletes the plain files, so only .sealed files reach the public voice-output branch.

Open locally:  SealedBox(PrivateKey(sk)).decrypt(data)   (PyNaCl)
"""
import hashlib, json, os, sys, glob, requests
from nacl.public import PrivateKey, PublicKey, SealedBox

API = "https://api.elevenlabs.io"
KEY = os.environ.get("ELEVENLABS_API_KEY", "")
H = {"xi-api-key": KEY}
req = json.load(open("request.json"))
os.makedirs("out", exist_ok=True)
rep = {}

def vault_key():
    return PrivateKey(hashlib.sha256(b"jj-voice-vault-v1:" + KEY.encode()).digest())

def pre():
    if not KEY: print("vault: no key"); return
    sk = vault_key()
    open("out/vault_pub.txt", "w").write(bytes(sk.public_key).hex() + "\n")
    if req.get("transcribe"):   # sealed audio in -> sealed transcript out (needs seal_to)
        box = SealedBox(sk); res = []
        for p in req["transcribe"]:
            raw = box.decrypt(open(p, "rb").read()); tmp = "/tmp/tr_in.mp3"; open(tmp, "wb").write(raw)
            data = {"model_id": req.get("scribe_model", "scribe_v3"), "timestamps_granularity": "word", "tag_audio_events": "false"}
            r = requests.post(f"{API}/v1/speech-to-text", headers=H, data=data, files={"file": ("in.mp3", open(tmp, "rb"), "audio/mpeg")}, timeout=300)
            if not r.ok and r.status_code in (400, 404, 422):
                data["model_id"] = "scribe_v2"; r = requests.post(f"{API}/v1/speech-to-text", headers=H, data=data, files={"file": ("in.mp3", open(tmp, "rb"), "audio/mpeg")}, timeout=300)
            j = r.json() if r.ok else {}
            res.append({"src": p, "status": r.status_code, "text": j.get("text"), "lang": j.get("language_code"),
                        "words": [[w.get("text"), w.get("start"), w.get("end")] for w in j.get("words", []) if w.get("type") == "word"],
                        "error": None if r.ok else r.text[:300]})
            os.remove(tmp)
        out = SealedBox(PublicKey(bytes.fromhex(req["seal_to"]))).encrypt(json.dumps(res, ensure_ascii=False).encode())
        open("out/transcripts.json.sealed", "wb").write(out)
        rep["transcribe"] = [{"src": x["src"], "status": x["status"]} for x in res]; print("vault transcribed", rep["transcribe"])
    c = req.get("clone")
    if not c: return
    name = c["name"]
    vid = None
    if c.get("reuse", True):
        vs = requests.get(f"{API}/v2/voices?page_size=100&search={name}", headers=H, timeout=30).json().get("voices", [])
        for v in vs:
            if v.get("name") == name and v.get("category") == "cloned": vid = v["voice_id"]; rep["clone"] = {"reused": vid}
    if not vid:
        box = SealedBox(sk); files = []
        for i, p in enumerate(c["samples"]):
            raw = box.decrypt(open(p, "rb").read())
            tmp = f"/tmp/sample_{i}.mp3"; open(tmp, "wb").write(raw)
            files.append(("files", (f"sample_{i}.mp3", open(tmp, "rb"), "audio/mpeg")))
        data = {"name": name, "remove_background_noise": str(bool(c.get("remove_background_noise", False))).lower()}
        if c.get("description"): data["description"] = c["description"]
        if c.get("labels"): data["labels"] = json.dumps(c["labels"], ensure_ascii=False)
        r = requests.post(f"{API}/v1/voices/add", headers=H, data=data, files=files, timeout=300)
        rep["clone"] = {"status": r.status_code}
        if r.ok:
            j = r.json(); vid = j.get("voice_id"); rep["clone"].update(created=vid, requires_verification=j.get("requires_verification"))
        else:
            rep["clone"]["error"] = r.text[:500]
        for p in glob.glob("/tmp/sample_*.mp3"): os.remove(p)
    print("vault clone:", json.dumps(rep["clone"]))
    if vid:
        for it in req.get("items", []):
            if it.get("voice_id") == "@clone": it["voice_id"] = vid
        json.dump(req, open("request.json", "w"), ensure_ascii=False, indent=1)   # runner copy only, never committed

def post():
    to = req.get("seal_to")
    if not to: return
    box = SealedBox(PublicKey(bytes.fromhex(to)))
    n = 0
    for p in glob.glob("out/*.mp3"):
        open(p + ".sealed", "wb").write(box.encrypt(open(p, "rb").read())); os.remove(p); n += 1
    rep["sealed"] = n; print("vault sealed", n, "files")

if __name__ == "__main__":
    {"pre": pre, "post": post}[sys.argv[1]]()
    old = json.load(open("out/vault.json")) if os.path.exists("out/vault.json") else {}
    old.update(rep); json.dump(old, open("out/vault.json", "w"), ensure_ascii=False, indent=1)
