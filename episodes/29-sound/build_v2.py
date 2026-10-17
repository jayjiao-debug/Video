"""ep29 v2: subtitles + live effect cues from timing_v2.json → lines_v2_arr.json + preview_v2.ass"""
import json
E = json.load(open('music/timing_v2.json')); B = lambda k: E['bars'][str(k)]
g = lambda k, i=0: E[k][i]
# (anchor time, line)   None = a visual beat with no subtitle
L = [
    (0.4, "你听的这首歌，被放慢过"), (2.8, "把它调快一点——"), (4.9, "声音一下子变高了"), (7.2, "放回去，又低了下来"),
    (g('pingpong'), "声音还能在两只耳朵间跳"), (g('pingpong') + 3.1, "因为声音，就是振动"),
    (g('pump'), "喇叭往前一推，空气被挤紧"), (g('pump') + 2.9, "往后一退，空气又松开"), (g('pump') + 5.5, "一秒挤松几次，就是几赫兹"),
    (g('pump') + 8.3, "拆开听——"),
    (g('lp'), "只留最低的鼓声：每秒约45次"), (g('hp'), "只留高音：镲片每秒振动上万次"),
    (g('phantom'), "低音全删了，你还听得见鼓吗？"),
    (g('cancel'), "删掉正中间：主旋律不见了"),
    (g('cancel', 1), "合回来！主音约360赫兹"), (g('cancel', 1) + 2.9, "正好是鼓声的8倍"),
    (g('binaural'), "左耳363，右耳369赫兹"), (g('binaural') + 2.65, "听到那个“呜哇”的摇晃了吗？"),
    (g('binaural') + 5.9, "两只耳朵里，都没有它"), (g('age'), "它是你大脑自己算出来的"), (g('age') + 2.7, "年纪越大，高音越先听不见"),
    (g('age') + 5.5, "就像这样——"),
    (g('gotcha'), "声音在左边 ←"), (g('gotcha', 1), "现在在右边 →"), (g('gotcha', 2), "骗你的！"),
    (g('gotcha', 2) + 1.6, "两耳一样响，一边只晚0.02秒"), (g('gotcha', 2) + 4.4, "大脑只信先到的那只耳朵"),
    (g('shepard') + 3.0, "一个永远在上升的音——"), (g('shepard') + 5.5, "整首歌绕着你转——"),
    (g('drop') - 0.42, None),
    (g('drop') + 2.6, "可为什么，有的声音好听？"), (g('root'), "先听它的主音——"), (g('oct') - 2.1, "再加一个高八度——"),
    (g('oct'), "频率翻倍，2比1：步步对齐"), (g('fifth'), "换成五度：频率比3比2"), (g('fifth') + 2.5, "高音走三步，低音走两步，就对齐"),
    (g('fifth') + 5.6, "比例越简单，耳朵越舒服"), (g('clash'), "如果只差一点点——"), (g('clash') + 2.3, "两个波总对不齐，听着发酸"),
    (g('clash') + 4.95, "这首歌的和弦都对得齐"), (g('clash') + 7.6, "所以它好听"),
    (g('rot_slow'), "那为什么慢放版，更让人难过？"), (g('rot_slow') + 2.9, "研究发现：又慢又低的音乐"),
    (g('slow'), "再放慢一点——"), (g('slow') + 2.2, "常常被听成悲伤"), (g('slow', 1), "就像人难过时，说话也变慢变低"),
    (g('slow', 1) + 3.2, "慢慢绕着你转，最易起鸡皮疙瘩"),
    (g('recap'), "低音"), (g('recap', 1), "高音"), (g('recap', 2), "去掉中间"), (g('recap', 3), "左右跳"), (g('recap', 4), "绕着你转"),
    (g('recap', 5), "你听见的，是一场振动接力"), (g('recap', 5) + 2.9, "下次戴上耳机，闭上眼"),
    (g('recap', 5) + 5.5, "每秒几十到上万次的振动"), (g('recap', 5) + 8.3, "正在你耳朵里，排成一首歌"), (g('recap', 5) + 11.4, None),
]
out = [[round(s, 2), round(L[i + 1][0] - 0.1, 2), tx] for i, (s, tx) in enumerate(L) if tx]
json.dump(out, open('lines_v2_arr.json', 'w'), ensure_ascii=False)

cues = [
    (0, 4.45, "原曲（慢放版）"), (4.45, 8.6, "▶ 变速 ×1.26：升高4个半音（大三度）"), (8.6, g('pingpong'), "▶ 平滑降回原速"),
    (*E['pingpong'], "▶ 声音每拍在左右耳之间跳"), (*E['pump'], "▶ 每个鼓点“推一下”：音量随空气一挤一松"),
    (*E['lp'], "▶ 只留低音：220 Hz 以下"), (*E['hp'], "▶ 只留高音：3000 Hz 以上"), (*E['phantom'], "▶ 删掉 130 Hz 以下的一切（幽灵低音）"),
    (*E['cancel'], "▶ 左右声道相减：正中间的声音被抵消"), (g('cancel', 1), g('binaural'), "▶ 全部合回来"),
    (*E['binaural'], "▶ 双耳拍频：左耳 363 Hz，右耳 369 Hz"), (g('age'), g('age', 2), "▶ 高音逐渐消失：18000 → 2500 Hz"),
    (g('gotcha'), g('gotcha', 1), "▶ 恶作剧：画面说左边，声音其实只在右耳"), (g('gotcha', 1), g('gotcha', 2), "▶ 恶作剧：画面说右边，声音其实只在左耳"),
    (g('prec'), g('prec', 1), "▶ 优先效应：两耳一样响，右耳晚 18 毫秒"), (g('prec', 1), g('prec', 2), "▶ 优先效应：换成左耳晚 18 毫秒"),
    (g('shepard'), g('rot_build'), "▶ 组合技①：无限上升音阶 ＋ 滤波慢慢打开 ＋ 渐强"),
    (g('rot_build'), g('drop') - 0.42, "▶ 组合技②：上面全部 ＋ 360° 绕头加速旋转"), (g('drop') - 0.42, g('drop'), "▶ 0.4 秒静音"),
    (*E['bright'], "▶ 主鼓点：全部同时进来，更亮、更宽"), (g('bright', 1), g('root'), "原曲"),
    (g('root'), g('oct'), "▶ 加入正弦音：主音 363 Hz"), (*E['oct'], "▶ 363 Hz ＋ 727 Hz：八度 2:1"), (*E['fifth'], "▶ 363 Hz ＋ 545 Hz：五度 3:2"),
    (g('fifth', 1), g('clash'), "原曲"), (*E['clash'], "▶ 363 Hz ＋ 385 Hz：只差半音，互相打架"), (g('clash', 1), g('rot_slow'), "原曲"),
    (g('rot_slow'), g('slow'), "▶ 360° 慢转：每 8 秒一圈"), (*E['slow'], "▶ 再放慢：降2个半音 ＋ 继续慢转"), (g('slow', 1), g('recap'), "▶ 360° 慢转"),
    (g('recap'), g('recap', 1), "▶ 回顾：只留低音"), (g('recap', 1), g('recap', 2), "▶ 回顾：只留高音"), (g('recap', 2), g('recap', 3), "▶ 回顾：去掉中间"),
    (g('recap', 3), g('recap', 4), "▶ 回顾：左右快速跳"), (g('recap', 4), g('tapestop'), "▶ 360° 环绕收尾"), (*E['tapestop'], "▶ 磁带停转"),
]
def ts(x): return f"0:{int(x // 60):02d}:{x % 60:05.2f}"
head = open('preview.ass').read().split('[Events]')[0] + "[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
ev = [f"Dialogue: 0,{ts(a)},{ts(b)},Sub,,0,0,0,,{{\\pos(960,420)\\fad(120,120)}}{tx}" for a, b, tx in out]
ev += [f"Dialogue: 0,{ts(a)},{ts(b)},Cue,,0,0,0,,{{\\fad(150,150)}}正在做：{tx}" for a, b, tx in cues]
ev.append(f"Dialogue: 1,{ts(g('drop'))},{ts(g('drop') + 2.5)},Title,,0,0,0,,{{\\pos(960,420)\\fad(40,300)\\fscx140\\fscy140\\t(0,180,\\fscx100\\fscy100)}}为什么好听？")
ev.append(f"Dialogue: 0,{ts(g('recap', 5) + 11.4)},{ts(g('end'))},Sub,,0,0,0,,{{\\pos(960,420)\\fad(300,300)}}你单曲循环最多的是哪首歌？")
open('preview_v2.ass', 'w').write(head + "\n".join(ev) + "\n")
print(len(out), 'lines')
