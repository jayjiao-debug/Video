// ep45 skin on the house style (history-video-style, ep44 standard, applied to ep45 by the producer 2026-10-25):
// ONE accent colour = deep copper (the hero's colour) for the key-word tags · corner items ≥ 120 px from left/right and ≥ 58 px
// from top/bottom (iPhone feed crop; Douyin's right-column buttons) · two-line stamp in 霞鹜文楷 (year · place / note) ·
// the owner's red hand-pressed J (jseal.png) bottom-right, 74 px, opacity .9, rotated −6°.
K.CSS4 += `
.sub{left:150px;top:124px}
.sub .k,.subc .k{color:#FFF1DC;background:#A84A26;box-shadow:-.08em 0 0 #A84A26,.08em 0 0 #A84A26;text-shadow:none}
.stamp{right:120px;top:62px;scale:1;border-right:4px solid #C8693A;padding-right:18px;font-family:'LXGW WenKai','Noto Serif CJK SC',serif}
.stamp .s1{font-size:34px;font-weight:700;line-height:1.25;letter-spacing:.03em}
.stamp .s2{font-size:24px;font-weight:700;line-height:1.4;opacity:.82;margin-top:2px}
.blk{left:140px;bottom:64px}
.era{background:#A84A26;color:#FFF1DC}
.seal{right:120px;bottom:60px;opacity:.9;filter:none;line-height:0}
.seal img{width:74px;height:74px;transform:rotate(-6deg);display:block}
`;
K.seal = () => `<img src="${window.JSEAL}">`;
K.hud4 = ((base) => (c) => { const st = typeof c.stamp === 'string' ? {s1: c.stamp} : c.stamp;
	let h = base({...c, stamp: st ? st.s1 : null});
	if (st && st.s2) h = h.replace(`<div class="s1">${st.s1}</div>`, `<div class="s1">${st.s1}</div><div class="s2">${st.s2}</div>`);
	return h; })(K.hud4);
