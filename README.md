# 采访月老的一天 v7: the ElevenLabs music and effects, SEALED

Every file here is encrypted: `<name>.mp3.aes` is the recording under AES-256-CBC, and `<name>.mp3.k0`, `.k1` ... hold
its key and iv wrapped with RSA-OAEP, one copy per machine allowed to open it. Nothing here plays without one of those
machines' private keys, which never leave them. Opened and cut by `scripts/yuelao/sound/make_el.py` (fetch, open,
clips) as listed in `scripts/yuelao/sound/el.json` on the film branch; the film's sound build
(`scripts/yuelao/sound/build_sound.sh`) runs it.

Who holds the keys: `.k0` opens in the cloud workspace, `.k1` on the owner's Mac mini (made there; its private key stays
there). Public keys only ever travel; no private key is in this repo.
