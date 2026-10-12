"""Simulations from the laureates' own models (textbook calibration, Woodford 2003 / Galí 2015 values).
1) Hall 1978: consumption = annuity value of expected lifetime resources -> moves only on news.
2) Hall & Mishkin 1982: 80% forward-looking, 20% hand-to-mouth; response to a one-off transfer.
3) Woodford NK 3-equation model at the zero bound: forward guidance (promise to keep rates at 0 longer)."""
import json, numpy as np
out = {}
# ---- 1) Hall: 40 years of income, quarterly; temporary bonuses + one permanent raise at year 15 (news)
r = 0.01; T = 160
inc = np.full(T, 100.0); bonus = [20, 52, 90, 130]
for q in bonus: inc[q] += 60          # one-off bonuses (expected? no: surprise, transitory)
inc[60:] += 25                        # permanent raise announced at q=60 (news)
# consumption under PIH: c_t = annuity of (assets + PV future expected income); surprises update it
def annuity(pv, n): return pv * r / (1 - (1 + r) ** -n)
c = np.zeros(T); a = 0.0
for t in range(T):
    known = np.full(T, 100.0); known[60:] += 25 if t >= 60 else 0
    pv = sum(known[s] / (1 + r) ** (s - t) for s in range(t, T))
    c[t] = annuity(a + pv, T - t)
    a = (a + inc[t] - c[t]) * (1 + r)
out['hall'] = {'income': inc.round(2).tolist(), 'cons': c.round(2).tolist(), 'bonus': bonus, 'raise': 60}
# ---- 2) Hall-Mishkin: 10 households, each gets 1000 one-off; 8 PIH spend annuity share, 2 spend all now
pih_q = annuity(1000, 160)
out['hm'] = {'pih_per_quarter': round(pih_q, 2), 'h2m_now': 1000, 'first_quarter_total_of_10': round(8 * pih_q + 2 * 1000, 1)}
# ---- 3) NK model, perfect foresight, quarterly. x_t = x_{t+1} - s(i_t - pi_{t+1} - rn_t); pi_t = b pi_{t+1} + k x_t
b, k, s = 0.99, 0.024, 1.0           # Woodford-style calibration (k small: sticky prices)
H = 40
def path(rn, i_rule_zero_until):
    x = np.zeros(H + 1); p = np.zeros(H + 1); i = np.zeros(H)
    for t in range(H - 1, -1, -1):
        # rule: i = max(0, rn + 1.5 pi + 0.5 x)  ->  solve jointly; at ZLB i = 0
        def step(it):
            xt = x[t + 1] - s * (it - p[t + 1] - rn[t]); pt = b * p[t + 1] + k * xt; return xt, pt
        if t < i_rule_zero_until: it = 0.0
        else:
            it = 0.0
            for _ in range(60):
                xt, pt = step(it); it = max(0.0, 0.01 + 1.5 * pt + 0.5 * xt + rn[t] - 0.01)
        xt, pt = step(it); x[t], p[t], i[t] = xt, pt, it
    return x[:H], p[:H], i
rn = np.full(H, 0.01); rn[:8] = -0.01        # natural rate negative for 2 years (a slump)
x0, p0, i0 = path(rn, 8)                     # leave zero as soon as the slump ends
x1, p1, i1 = path(rn, 12)                    # promise: stay at zero 4 quarters longer
out['fg'] = {k_: (v * 400 if 'p' in k_ or 'i' in k_ else v * 100).round(2).tolist() for k_, v in
             {'x_no': x0, 'p_no': p0, 'i_no': i0, 'x_fg': x1, 'p_fg': p1, 'i_fg': i1}.items()}
json.dump(out, open('sim.json', 'w'))
print('PIH bump per quarter from 1000:', round(pih_q, 2), '| first-quarter spend of 10 households:', out['hm']['first_quarter_total_of_10'])
print('output gap today  no promise %.2f%%  promise %.2f%%' % (x0[0] * 100, x1[0] * 100))
print('inflation today   no promise %.2f%%  promise %.2f%% (annualised)' % (p0[0] * 400, p1[0] * 400))
