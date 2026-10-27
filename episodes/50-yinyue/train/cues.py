"""Subtitles and LED text for 《开往零点的列车》, timed from the tempo map (lines enter on bar lines).

SUBS: list of (start_s, end_s, text). LED: list of (start_s, end_s, text or callable(t) → text).
Every subtitle is ≤ 16 字, white heavy sans with a soft dark edge, bottom centre (treatment §5.5).
"""
import tempo as T

t = T.t_of


def _subs():
    raw = [
        # 哐当 (hook)
        (0.0, '你总说，自己没节奏感'),
        (t('hook.accel'), '这个声音，你一定听过'),
        (t('hook.accel', 1), '间隔一样，这就是"拍"'),
        (t('hook.accel', 2), '车越快，拍越密'),
        (t('hook.underpass'), '灯灭了，接着拍——'),
        (t('title'), None),
        # 硬座
        (t('yingzuo.bpm'), '一分钟哐几下，就是 BPM'),
        (t('yingzuo.bpm', 2), '手环上的"次/分"，也是它'),
        (t('yingzuo.baba'), '做操时，你这么数——'),
        (t('yingzuo.baba', 2), '第一个数，在数第几组'),
        (t('yingzuo.baba', 4), '乐手也这么数：4 拍一小节'),
        (t('yingzuo.ban'), '做事"一板一眼"：强、弱'),
        (t('yingzuo.ban', 2), '四拍叫"一板三眼"：强 弱 次强 弱'),
        (t('yingzuo.dongci'), '鼓手的普通话：动 次 打 次'),
        (t('yingzuo.dongci', 2), '"打"落在 2、4：流行歌的军鼓'),
        (t('yingzuo.countin'), '换你：只拍"打"'),
        (t('yingzuo.he'), None),
        # 卧铺
        (t('wopu.limp'), '门后这首……怎么瘸了？'),
        (t('wopu.waltz'), '三拍一组，就顺了'),
        (t('wopu.waltz', 2), '生日歌，原来是三拍子'),
        (t('wopu.waltz', 5), '下铺 中铺 上铺：蓬 嚓 嚓'),
        (t('wopu.waltz', 8), '华尔兹，就是这个拍子'),
        (t('wopu.waltz', 11), None),
        (t('wopu.phone'), '半夜，总有人公放……'),
        # 窗外
        (t('window.house'), '电线杆：一拍一根'),
        (t('window.house', 2), '栅栏桩：一拍两根'),
        (t('window.house', 4), '栅栏板：一拍四片'),
        (t('window.house', 6), '间距越小闪越密：这叫"细分"'),
        (t('window.build'), None),
        (t('window.trap'), '再细：一拍塞进八下'),
        (t('window.trap', 2), 'trap 的"哒啦啦啦"，就是它'),
        (t('window.trap', 4), None),
        # 超车
        (t('overtake.offbeat'), '它的灯，亮在两个"哐"中间'),
        (t('overtake.offbeat', 2), '这叫"反拍"——"慢半拍"也是拍'),
        (t('overtake.countin'), '换你：只拍"嚓"'),
        (t('overtake.sync'), '有的灯，提前半拍亮'),
        (t('overtake.sync', 1, 2), '还拖过了车厢缝：这叫"切分"'),
        (t('overtake.brakes'), None),
        # 餐车
        (t('dining.red'), '还赶得上吗？'),
        (t('dining.swing'), '钩住了：一边短了一截'),
        (t('dining.swing', 2), '叮——叮：一长一短'),
        (t('dining.swing', 4), '一拍分三份：哗 啦 啦'),
        (t('dining.swing', 6), '只留第 1、3 份：这就是"摇摆"'),
        (t('dining.swing', 8), '一百年前，布鲁斯钢琴就爱学火车'),
        (t('dining.accel'), None),
        # 饺子
        (t('dumpling.puzzle'), '8 个饺子，分给 3 个人'),
        (t('dumpling.puzzle', 1), '怎么分，最匀？'),
        (t('dumpling.reveal'), '3、3、2'),
        (t('dumpling.reveal', 1), '每人第一个最重：1、4、7'),
        (t('dumpling.tunnel'), '很多拉丁热歌，底下都是它'),
        (t('dumpling.tunnel', 2), None),
        # 推车
        (t('trolley.breath'), '叫卖到"水"，换口气：8 拍'),
        (t('trolley.nobreath'), '不换气，再来'),
        (t('trolley.nobreath', 2), '少一口气：7 拍，2+2+3'),
        (t('trolley.poem'), '这就是 7/8 拍'),
        (t('trolley.poem', 2), '七言诗，也是 2+2+3'),
        (t('trolley.countin'), '换你叫卖：不换气！'),
        (t('trolley.lai'), None),
        # 零点
        (t('zero.drift1'), '城市在四拍，你在七拍'),
        (t('zero.drift1', 2), '各走各的……'),
        (t('zero.drift1', 4), None),
        (t('zero.drift2'), '下一次对上，就是零点'),
        (t('zero.drift2', 3), '一起数——'),
        (t('zero.drift2', 5), None),
        (T.ZERO, '零点。所有节奏，合上了拍'),
        (t('zero.drop', 2), None),
        # 终点站
        (t('arrive.ritard', 0, 4), '节奏感，你一直都有'),
        (t('arrive.end'), None),
    ]
    out = []
    for i, (s, txt) in enumerate(raw):
        if txt is None:
            continue
        e = raw[i + 1][0] if i + 1 < len(raw) else T.END
        out.append((round(s, 3), round(e - 0.08, 3), txt))
    return out


SUBS = _subs()


def led_at(tt):
    """the in-car LED marquee text at film time tt (only the chapters that show it)."""
    if tt < t('hook.underpass'):
        return f'末班车 · 距零点 {T.countdown(tt)}'
    if t('yingzuo.bpm') <= tt < t('yingzuo.bpm', 2):
        return f'车速 {round(T.kmh_for_bpm(T.tempo_at_time(tt)))} km/h ｜ 哐 {round(T.tempo_at_time(tt))} 次/分'
    if t('yingzuo.bpm', 2) <= tt < t('yingzuo.baba'):
        return '温馨提示：点头 · 拍桌 · 跟着念'
    return f'距零点 {T.countdown(tt)}'


def sub_at(tt):
    for s, e, txt in SUBS:
        if s <= tt < e:
            return txt
    return None


if __name__ == '__main__':
    for s, e, txt in SUBS:
        n = sum(1 for c in txt if c.isalnum())
        budget = 0.5 + n / 7 + 0.6
        flag = '' if e - s >= budget else f'  ⚠ needs {budget:.1f}s'
        print(f'{T.fmt(s)}–{T.fmt(e)}  {n:2d}字  {txt}{flag}')
