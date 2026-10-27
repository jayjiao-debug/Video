"""Ask several open-weights LLMs (one GPU container each) the same Worlds 2026 question, N samples each."""
import modal, json, pathlib, re
img = (modal.Image.debian_slim(python_version="3.11")
       .pip_install("torch==2.7.1", "transformers==4.56.2", "accelerate==1.10.1", "hf_transfer", "kernels")
       .env({"HF_HUB_ENABLE_HF_TRANSFER": "1", "HF_HOME": "/cache/hf"}))
app = modal.App("juno-aipoll25")
vol = modal.Volume.from_name("juno-hf-cache", create_if_missing=True)
PROMPT = '英雄联盟2026全球总决赛（S16）瑞士轮已经打完三轮。以下是截至2026年10月27日的公开信息：\n\n当前战绩：3-0 已晋级八强：DK、GEN（LCK）。2-1：BLG、TES、IG（LPL），T1（LCK），MKOI（LEC），LYON（LCS）。1-2：HLE（LCK），G2、KC（LEC），TL（LCS），CFO（LCP），LOS（CBLOL）。已淘汰：AL（LPL）、TSW（LCP）。\n\n瑞士轮第一轮LPL四支队全败（IG负GEN、TES负HLE、BLG负MKOI、AL负KC）；第二、三轮LPL共6胜2负（TES赢AL；IG赢TSW、HLE；BLG赢TL、KC；TES赢G2；AL被TL以2-0淘汰）。\n\n拳头官方全球战力排名（2026-10-18）：HLE 1540，GEN 1519，BLG 1513，G2 1478，T1 1471，LYON 1424，DK 1409，AL 1409，KC 1396，TSW 1370，TL 1369，TES 1364，IG 1348，MKOI 1320，CFO 1316，LOS 1183。\n\n2026年主要结果：First Stand 冠军 BLG（决赛3-1 G2）；MSI 冠军 HLE（决赛3-2 BLG）；电竞世界杯冠军 DK（决赛3-0 KC）；LCK 夏季决赛 GEN 3-1 HLE；LPL 总决赛 AL 3-1 BLG；LEC 冠军 G2；LCS 冠军 TL。T1 是2023、2024、2025三届世界赛冠军。\n\n赛制：第四轮2-1的六支队打BO3，赢者晋级八强；1-2的六支队打BO3，输者淘汰；第五轮2-2的队伍争夺最后三个八强名额。八强起全部BO5。\n\n问题：你认为最有可能夺得2026全球总决赛冠军的前三支队伍是谁（按可能性排序）？\n只输出一行JSON，不要输出其它内容，格式：{"top3":["队伍缩写","队伍缩写","队伍缩写"],"reason":"不超过40字的中文理由"}\n'
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
