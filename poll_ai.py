"""Ask several open-weights LLMs (one GPU container each) the same Worlds 2026 question, N samples each."""
import modal, json, pathlib, re
img = (modal.Image.debian_slim(python_version="3.11")
       .pip_install("torch==2.7.1", "transformers==4.56.2", "accelerate==1.10.1", "hf_transfer", "kernels")
       .env({"HF_HUB_ENABLE_HF_TRANSFER": "1", "HF_HOME": "/cache/hf"}))
app = modal.App("juno-aipoll")
vol = modal.Volume.from_name("juno-hf-cache", create_if_missing=True)
PROMPT = pathlib.Path("aipoll/prompt.txt").read_text()
MODELS = [
  ("deepseek-ai/DeepSeek-R1-Distill-Qwen-14B", "DeepSeek", {}),
  ("openai/gpt-oss-20b", "OpenAI", {}),
  ("Qwen/Qwen3-14B", "Alibaba Qwen", {"enable_thinking": False}),
  ("zai-org/GLM-4-9B-0414", "Zhipu GLM", {}),
  ("microsoft/phi-4", "Microsoft", {}),
  ("mistralai/Mistral-Small-24B-Instruct-2501", "Mistral", {}),
]
N = 6
@app.function(image=img, gpu="H100", timeout=1500, volumes={"/cache": vol})
def ask(spec):
    import torch, time
    from transformers import AutoTokenizer, AutoModelForCausalLM
    name, lab, kw = spec; t0 = time.time()
    try:
        tok = AutoTokenizer.from_pretrained(name)
        m = AutoModelForCausalLM.from_pretrained(name, torch_dtype="auto", device_map="cuda")
        msgs = [{"role": "user", "content": PROMPT}]
        if "gpt-oss" in name: msgs = [{"role": "system", "content": "Reasoning: low"}] + msgs
        ids = tok.apply_chat_template(msgs, add_generation_prompt=True, return_tensors="pt", **kw).to("cuda")
        mx = 1600 if "R1" in name else (900 if "gpt-oss" in name else 300)
        out = m.generate(ids, do_sample=True, temperature=0.7, top_p=0.95, max_new_tokens=mx, num_return_sequences=N, pad_token_id=tok.eos_token_id)
        texts = [tok.decode(o[ids.shape[1]:], skip_special_tokens=False) for o in out]
        vol.commit()
        return {"model": name, "lab": lab, "raw": texts, "secs": round(time.time() - t0)}
    except Exception as e:
        return {"model": name, "lab": lab, "error": repr(e)[:800], "secs": round(time.time() - t0)}

def parse(t):
    t = t.split("</think>")[-1]
    if "final<|message|>" in t: t = t.split("final<|message|>")[-1]
    ms = re.findall(r'\{[^{}]*"top3"[^{}]*\}', t)
    for s in reversed(ms):
        try: return json.loads(s)
        except Exception: pass
    return None

@app.local_entrypoint()
def main():
    out = pathlib.Path("out"); out.mkdir(exist_ok=True); res = []
    for r in ask.map(MODELS, order_outputs=False):
        if "raw" in r: r["parsed"] = [parse(t) for t in r["raw"]]
        res.append(r); print(r["lab"], r.get("error", ""), [p and p.get("top3") for p in r.get("parsed", [])], r["secs"], flush=True)
        (out / "poll.json").write_text(json.dumps({"prompt": PROMPT, "samples": N, "results": res}, ensure_ascii=False, indent=1))
