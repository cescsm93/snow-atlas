import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { answerFromCorpus } from '../local-copilot.mjs';

const resorts = JSON.parse(readFileSync(new URL('../resorts.json', import.meta.url)));
const facts = JSON.parse(readFileSync(new URL('../copilot-facts.json', import.meta.url)));

test('global steepest answer declines unsupported ranking and cites operators', () => {
  const answer = answerFromCorpus('全世界最陡的雪道是哪条？', resorts, facts);
  assert.match(answer.text, /不能确定/);
  assert.equal(answer.sources.length, 3);
  assert.match(answer.scope, /非 DeepSeek/);
});

test('price answer includes date, currency and original source', () => {
  const answer = answerFromCorpus('索尔登雪票多少钱？', resorts, facts);
  assert.match(answer.text, /84\.5 EUR/);
  assert.match(answer.text, /2026–27/);
  assert.match(answer.sources[0].url, /^https:\/\//);
});

test('missing story is stated as unverified', () => {
  const answer = answerFromCorpus('采尔马特有明星故事吗？', resorts, facts);
  assert.match(answer.text, /没有已核实/);
});
