// v7/v8 title overlay (v8 text 「兽首，到底回来了几个？」; v7 was 「七个回国，一个回家」) at 9.05 s (drop 1), on screen to 11.07 s: no card. The hook's push has reached the
// copper horse (the same RING, ×2.1 around the head); the rest of the ring is out of focus and dimmed, the cases gone off
// frame right. The title slams centred-low over the seat (scale-down + damped jolt; this is the settled frame), 「一个回家」
// in the hero's copper, the owner's J seal pressed at its end. The subtitle has cleared; the counter is hidden for the title.
const pos = K.ringPos();
window.NOHERO = true; const r = K.ring(pos, {马: 'hero'}); window.NOHERO = false;
// v8: the horse is at brother scale on the ring; the title's size comes from the camera (the push reaches ×2.0 at 9.6 s and drifts
// on to ×2.4 under the title). v8: the question title 「兽首，到底回来了几个？」; every head is still on its seat behind it.
const L = K.ringHeroLight(pos), hero = r.seats['马'].hero, Z = 2.4, cx = hero.x - 0.28 * hero.h, cy = hero.y - 0.52 * hero.h;
const T = `translate(960,470) scale(${Z}) translate(${-cx},${-cy})`;
const svg = `<defs>${K.blur('dof', 7)}
 <radialGradient id="tvig" cx="960" cy="470" r="1100" gradientUnits="userSpaceOnUse"><stop offset=".35" stop-color="#0A0E0F" stop-opacity="0"/><stop offset="1" stop-color="#0A0E0F" stop-opacity=".7"/></radialGradient>
 <linearGradient id="tfloor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0E1112" stop-opacity="0"/><stop offset="1" stop-color="#0E1112" stop-opacity=".78"/></linearGradient></defs>
<g transform="${T}"><g filter="url(#dof)">${K.ringNightWide({heroX: L.x, heroY: L.y})}${r.svg}</g></g>
<rect width="1920" height="1080" fill="#0E1416" opacity=".28"/>
<g transform="${T}"><g filter="url(#r7rimN)">${r.seats["马"].back}</g>${K.heroSeatLight(r.seats["马"].top, r.seats["马"].p.s)}${K.horseHead(hero)}</g>
<rect y="640" width="1920" height="440" fill="url(#tfloor)"/>
<rect width="1920" height="1080" fill="url(#tvig)"/>`;
const title = `<div id="title" style="position:absolute;left:0;right:0;top:806px;text-align:center;font-family:'Noto Serif CJK SC',serif;font-weight:900;font-size:128px;line-height:1;letter-spacing:.06em;white-space:nowrap">
 <div style="position:absolute;left:0;right:0;top:-40px;height:2px;background:linear-gradient(90deg,rgba(200,105,58,0) 22%,rgba(232,150,90,.85) 50%,rgba(200,105,58,0) 78%)"></div>
 <span style="color:#FFF1DC;text-shadow:0 0 3px rgba(10,8,6,.9),0 4px 26px rgba(10,8,6,.85)">兽首<span style="margin-right:-.5em">，</span>到底回来了</span><span style="color:#FFB070;background:linear-gradient(180deg,#FFD9A6 0%,#F09A5E 55%,#C8693A 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 18px rgba(255,140,70,.45)) drop-shadow(0 3px 6px rgba(10,8,6,.9))">几个？</span><img src="${window.JSEAL}" style="width:92px;height:92px;transform:rotate(-6deg);vertical-align:top;margin-left:6px;margin-top:-30px;opacity:.95">
</div>`;
K.page(svg, K.hud4({}).replace('<div class="seal">', title + '<div class="seal" style="display:none">'), K.CSS4 + '.era{display:none}');
