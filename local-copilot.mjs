// GitHub Pages has no server-side API. Answer only from the published, cited corpus.
const source = (url, title, id = 1) => /^https:\/\//.test(url || '') ? [{ id, title, url }] : [];
const nameOf = resort => resort.name || resort.nameEn || resort.id;

export function answerFromCorpus(question, resorts, facts, resortId = null) {
  const q = question.trim().toLowerCase();
  const checkedAt = '2026-11-04';
  const scope = '站内资料检索 · 非 DeepSeek';
  const answer = (text, sources = [], date = checkedAt) => ({ text, sources, scope, checkedAt: date });
  const fact = id => facts.find(item => item.id === id);
  if (/最陡|steepest|black ibex|harakiri|langer zug|坡度.*排名/.test(q)) {
    const selected = ['black-ibex', 'harakiri', 'langer-zug'].map(fact).filter(Boolean);
    return answer('目前没有同口径的全球完整测量，不能确定“全世界最陡”是哪条。已核实的运营方资料包括：' + selected.map(item => item.text).join('\n') + '\n请区分压雪道、未压雪线路，以及局部最大坡度和全程平均坡度。', selected.flatMap((item, i) => source(item.url, item.title, i + 1)));
  }
  if (/百分比|角度|78%|80%|度数|坡度.*计算/.test(q)) {
    const item = fact('harakiri');
    return answer('坡度百分比 = 垂直高差 ÷ 水平距离 × 100%；角度 = arctan(坡度百分比 ÷ 100)。因此 78% 约为 38°，不是 78°。', item ? source(item.url, item.title) : []);
  }
  const matched = resorts.find(item => [item.name, item.nameEn].filter(Boolean).some(name => q.includes(name.toLowerCase()))) || resorts.find(item => item.id === resortId);
  if (!matched) return answer('我只检索站内已收录的 85 座雪场及少量有来源的坡度资料。请在问题中写出雪场名称；未收录的事实目前无法核实。');
  const title = nameOf(matched);
  const base = source(matched.officialUrl, `${title} · 官方网站`);
  if (/票价|价格|多少钱|雪票|缆车票|price|cost/.test(q)) {
    const p = matched.price;
    if (!p) return answer(`${title}：没有核实到适用日期的票价。${matched.priceStatus || '请到官网选择日期和票种查询。'}`, base, matched.checkedAt);
    return answer(`${title}：已采集 ${p.amount} ${p.currency}（${p.label}）。适用雪季 ${p.season}，日期 ${p.period}。这不是实时结算价，预订时请以官网为准。`, source(p.source, `${title} · 票价来源`), p.checkedAt);
  }
  if (/电影|007|幽灵党|名人|明星|故事|spectre|film|movie/.test(q)) {
    const story = matched.depth?.story;
    const asksFilmOrCelebrity = /电影|007|幽灵党|名人|明星|spectre|film|movie/.test(q);
    if (!story || (asksFilmOrCelebrity && !/电影|007|幽灵党|名人|明星|spectre|取景|主演/.test(story.title + story.text))) return answer(`${title}：站内没有已核实的电影或名人故事，不能据此推断曾被取景或有明星到访。`, base, matched.checkedAt);
    return answer(`${title}：${story.text}`, source(story.source, story.title), matched.depth.checkedAt || matched.checkedAt);
  }
  if (/雪道|线路|坡度|地形|缆车|lift|piste|run/.test(q)) {
    const sections = (matched.depth?.sections || []).filter(s => /雪道|缆车|索道|坡度|地形|海拔/.test(s.title + s.text));
    if (!sections.length) return answer(`${title}：站内没有足够的已核实线路或坡度文字资料。请打开该雪场的 3D 模型查看有 OSM 来源标记的线路；缺失线路会标明。`, base, matched.checkedAt);
    return answer(`${title}：${sections.slice(0, 2).map(s => s.text).join('\n')}`, sections.slice(0, 2).flatMap((s, i) => source(s.source, s.title, i + 1)), matched.depth.checkedAt || matched.checkedAt);
  }
  return answer(`${title}：${matched.description || '站内暂无更多已核实的介绍。'}${matched.price ? ` 已采集票价 ${matched.price.amount} ${matched.price.currency}，具体日期与票种请查看详情。` : ''}`, base, matched.checkedAt);
}
