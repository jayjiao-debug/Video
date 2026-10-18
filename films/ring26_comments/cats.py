import json, re, collections
R = json.load(open('rows.json'))
for r in R: r['t'] = re.sub(r'@\S+', '', r['text']).strip()
sub = [r for r in R if len(re.sub(r'[\W\d_a-zA-Z]', '', r['t'])) >= 2]
cats = {
 '以为真有人来电': r'以为.{0,12}(打电话|打来|来电|打视频|打语音|给我打|找我|电话来|有人|打的|来电话)|真以为|还以为.{0,8}(打|电话|来)|以为是(我|他|她)',
 '真去查了手机/微信': r'(去|切|退|回|滑|划|打开|点开|看了?一?眼?).{0,4}(微信|后台|是谁)|退出去|退出来|划走|切出去|暂停|找手机|看手机',
 '被吓到/心慌': r'吓|心慌|一紧|一惊|心跳|心脏|骤停|慌|害怕|恐惧|应激|手抖|一激灵|一哆嗦|尿了|PTSD|ptsd',
 '以为卡了': r'卡了|卡住|又卡|手机卡|以为卡',
 '没人会给我打': r'没人会|没有人会|不可能有人|没人找|根本就?没人|谁会给我打|没人给我打|没人打|从来没人|没有人给我',
 '没上当': r'不是我的|不是这个|不是这样|铃声不|免打扰|静音|设置了铃声|不是默认|知道不是|骗不到|休想|没感觉|没反应|没微信|没有微信|没登',
}
who = {'妈妈/父母/家人': r'妈|爸|父母|家长|家人|亲戚|老家', '老师/班主任/学校': r'班主任|老师|导师|辅导员|上课|晚自习|作业|学校|宿管', '领导/老板/工作': r'领导|老板|上司|加班|工作|开会|上班|同事|客户|售后|企业微信|甲方',
       '对象/恋人/前任': r'女朋友|男朋友|对象|老公|老婆|前任|前女友|前男友|暧昧|喜欢的人|crush', '朋友/同学/队友': r'发小|朋友|同学|室友|上号|队友|兄弟|闺蜜', '外卖/快递': r'外卖|快递|骑手', '诈骗/骚扰': r'诈骗|骚扰|推销|反诈|贷款'}
print('all', len(R), 'substantive', len(sub))
C = {}
for k, p in cats.items():
    m = [r for r in sub if re.search(p, r['t'])]; C[k] = m; print(f'{k}: {len(m)} ({100*len(m)/len(sub):.1f}%)')
print('-- mentions of who')
W = {k: [r for r in sub if re.search(p, r['t'])] for k, p in who.items()}
for k, m in sorted(W.items(), key=lambda x: -len(x[1])): print(f'{k}: {len(m)}')
print('tag-only comments', sum(1 for r in R if r['tags'] and not re.sub(r'@\S+|\s', '', r['text'])))
print('any tag', sum(1 for r in R if r['tags']), 'total tags', sum(r['tags'] for r in R))
json.dump({k: [r['id'] for r in v] for k, v in {**C, **W}.items()}, open('cats.json', 'w'), ensure_ascii=False)
