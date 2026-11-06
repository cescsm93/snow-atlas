import { answerFromCorpus } from './local-copilot.mjs';

const localMode = location.hostname.endsWith('github.io');
const panel = document.querySelector('#copilot-panel');
const log = document.querySelector('#copilot-messages');
const form = document.querySelector('#copilot-form');
const input = document.querySelector('#copilot-input');
let resortId = null, busy = false, corpusPromise;

const accessLabel = document.createElement('label');
const accessInput = document.createElement('input');
if (localMode) {
  document.querySelector('#copilot-mode').textContent = '资料库';
  document.querySelector('.copilot-foot').textContent = 'GitHub 在线版为站内资料检索，非 DeepSeek 实时对话；答案仅引用已收录来源。';
} else {
  accessLabel.textContent = '演示访问码（仅本次页面使用）';
  accessInput.type = 'password';
  accessInput.autocomplete = 'off';
  accessInput.placeholder = '向演示者获取访问码';
  accessInput.maxLength = 200;
  accessInput.style.cssText = 'display:block;width:100%;padding:10px;margin:6px 0 12px;background:#12282d;color:#fff;border:1px solid #52727a;border-radius:8px';
  accessLabel.append(accessInput);
  form.before(accessLabel);
}

export function openCopilot(resort) {
  resortId = resort?.id || null;
  document.querySelector('#copilot-context').textContent = resort ? '正在了解 · ' + (resort.nameZh || resort.name) : '全球雪场资料库 · 85个目的地';
  panel.hidden = false;
  input.focus();
}
document.querySelector('#copilot-launch').onclick = () => openCopilot(null);
document.querySelector('#copilot-close').onclick = () => panel.hidden = true;

function message(role, content) {
  const div = document.createElement('div');
  div.className = 'copilot-message ' + role;
  const label = document.createElement('small');
  label.textContent = role === 'user' ? '你' : '雪旅问答';
  const body = document.createElement('p');
  body.textContent = content;
  div.append(label, body);
  log.append(div);
  log.scrollTop = log.scrollHeight;
  return { div, body };
}

async function localAnswer(question) {
  corpusPromise ||= Promise.all(['resorts.json', 'copilot-facts.json'].map(async path => {
    const response = await fetch(path);
    if (!response.ok) throw Error('资料暂时无法加载，请刷新后重试。');
    return response.json();
  }));
  const [resorts, facts] = await corpusPromise;
  return answerFromCorpus(question, resorts, facts, resortId);
}

async function remoteAnswer(question) {
  const response = await fetch('/api/snow-copilot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Demo-Code': accessInput.value.trim() },
    body: JSON.stringify({ question, resortId }),
    signal: AbortSignal.timeout(60000)
  });
  let data;
  try { data = await response.json(); } catch { throw Error('问答服务暂时不可用，请稍后重试。'); }
  if (!response.ok) throw Error(data.error || '问答服务暂不可用。');
  return data;
}

async function ask(question) {
  if (busy) return;
  if (!localMode && !accessInput.value.trim()) {
    accessInput.focus();
    message('assistant', '请先输入演示访问码。');
    return;
  }
  busy = true;
  input.value = '';
  form.querySelector('button').disabled = true;
  message('user', question);
  const answer = message('assistant', localMode ? '正在检索站内资料…' : '正在检索资料并请 DeepSeek 回答…');
  try {
    const data = await (localMode ? localAnswer(question) : remoteAnswer(question));
    answer.body.textContent = data.text;
    const sources = document.createElement('div');
    sources.className = 'copilot-sources';
    for (const item of data.sources || []) {
      if (!/^https:\/\//.test(item.url)) continue;
      const link = document.createElement('a');
      link.href = item.url;
      link.textContent = `[${item.id}] ${item.title} ↗`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      sources.append(link);
    }
    const note = document.createElement('small');
    note.textContent = `${data.scope || (localMode ? '站内资料检索' : 'DeepSeek 资料库回答')} · 核实日 ${data.checkedAt || '见来源'}`;
    answer.div.append(sources, note);
  } catch (error) {
    answer.body.textContent = error.name === 'TimeoutError' ? '回答超时，请稍后重试。' : error.message;
    answer.div.classList.add('error');
    if (localMode) corpusPromise = null;
  } finally {
    busy = false;
    form.querySelector('button').disabled = false;
    log.scrollTop = log.scrollHeight;
  }
}
form.onsubmit = event => {
  event.preventDefault();
  const question = input.value.trim();
  if (question.length >= 2 && question.length <= 600) ask(question);
};
document.querySelectorAll('[data-prompt]').forEach(button => button.onclick = () => ask(button.dataset.prompt));
