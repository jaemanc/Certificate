import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSession, selectAnswer, remainingSeconds, finishSession, gradeSession, restoreSession } from '../site/dist/core.mjs';
import { createAppServer } from '../server.mjs';
const bank = JSON.parse(await readFile(new URL('../site/dist/questions.json', import.meta.url)));
const now = 1800000000000;

test('mock 1 has 45 unique authored items, complete explanations and the blueprint allocation', () => {
  assert.equal(bank.questions.length, 45);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 45);
  assert.equal(new Set(bank.questions.map(q => q.prompt)).size, 45);
  assert.equal(bank.domains.reduce((sum, d) => sum + d.weight, 0), 100);
  assert.deepEqual(bank.domains.map(d => bank.questions.filter(q => q.domain === d.id).length), [3,9,10,7,5,4,7]);
  const positions = new Set();
  for (const q of bank.questions) {
    assert.ok(bank.domains.some(d => d.id === q.domain));
    assert.ok(['scenario','concept','code','troubleshooting'].includes(q.type));
    assert.ok(typeof q.promptEn === 'string' && q.promptEn.length > 40);
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options.map(o => o.text)).size, 4);
    assert.ok(Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 4);
    positions.add(q.correctIndex);
    q.options.forEach(o => assert.ok(o.rationale.length > 12));
    if (q.type === 'code') assert.ok(q.code);
    assert.ok(q.sources.length > 0);
    q.sources.forEach(s => assert.ok(['docs.databricks.com','spark.apache.org'].includes(new URL(s.url).hostname)));
  }
  assert.equal(positions.size, 4);
});

test('exam lifecycle: save/restore, partial grading, immutable submission, and domain totals', () => {
  const session = createSession(bank, 'exam', null, now);
  assert.equal(new Set(session.ids).size, 45);
  assert.equal(remainingSeconds(session, now), 5400);
  const first = bank.questions.find(q => q.id === session.ids[0]);
  const second = bank.questions.find(q => q.id === session.ids[1]);
  assert.ok(selectAnswer(session, first, first.correctIndex, now + 1000));
  assert.ok(selectAnswer(session, second, (second.correctIndex + 1) % 4, now + 1000));
  session.flags.push(second.id);
  session.index = 3;
  const restored = restoreSession(bank, JSON.stringify(session));
  assert.deepEqual(restored, session);
  assert.equal(remainingSeconds(restored, now + 60000), 5340);
  finishSession(restored, 'submit', now + 70000);
  assert.equal(selectAnswer(restored, second, second.correctIndex, now + 71000), false);
  const result = gradeSession(bank, restored);
  assert.deepEqual([result.correct,result.answered,result.unanswered,result.percent], [1,2,43,2]);
  assert.equal(result.domains.reduce((sum,d) => sum+d.correct,0), 1);
  assert.equal(result.domains.reduce((sum,d) => sum+d.total,0), 45);
  finishSession(restored, 'timeout', now + 80000);
  assert.equal(restored.finishReason, 'submit');
});

test('deadline is absolute across reloads; expired answers cannot be changed', () => {
  const s = createSession(bank, 'exam', null, now);
  const q = bank.questions.find(q => q.id === s.ids[0]);
  selectAnswer(s,q,q.correctIndex,now+1000);
  const restored = restoreSession(bank,JSON.stringify(s));
  assert.equal(remainingSeconds(restored,now+5400000),0);
  assert.equal(selectAnswer(restored,q,(q.correctIndex+1)%4,now+5400000),false);
  assert.equal(restored.answers[q.id],q.correctIndex);
  finishSession(restored,'timeout',restored.deadline);
  assert.equal(restoreSession(bank,JSON.stringify(restored)).finishedAt,now+5400000);
});

test('practice filters one domain, locks revealed answers, supports complete scoring', () => {
  const s = createSession(bank,'practice','transformation',now);
  assert.equal(s.ids.length,10);
  assert.equal(remainingSeconds(s,now+9000000),null);
  const qs = bank.questions.filter(q=>s.ids.includes(q.id));
  for (const q of qs) assert.ok(selectAnswer(s,q,q.correctIndex,now+1000));
  s.revealed.push(qs[0].id);
  assert.equal(selectAnswer(s,qs[0],(qs[0].correctIndex+1)%4,now+2000),false);
  assert.ok(restoreSession(bank,JSON.stringify(s)));
  finishSession(s,'submit',now+3000);
  assert.equal(gradeSession(bank,s).percent,100);
  assert.deepEqual(gradeSession(bank,s).domains.map(d=>d.id),['transformation']);
  assert.throws(()=>createSession(bank,'practice','invalid',now));
});

test('broken, stale, and structurally invalid local sessions are ignored', () => {
  assert.equal(restoreSession(bank,'{bad json'),null);
  assert.equal(restoreSession(bank,'null'),null);
  const s=createSession(bank,'exam',null,now);
  const invalids=[{version:'old'},{index:45},{answers:{[s.ids[0]]:9}},{ids:[s.ids[0]]},{deadline:now+1},{flags:['bad']},{revealed:[s.ids[0]]},{startedAt:null}];
  for(const invalid of invalids) assert.equal(restoreSession(bank,JSON.stringify({...s,...invalid})),null);
});

test('HTTP request handler serves assets, rejects writes and protects private files', async () => {
  const server=createAppServer();
  const handler=server.listeners('request')[0];
  async function request(url, method='GET') {
    const result={status:0,headers:{},body:null};
    const response={writeHead(status,headers={}){result.status=status;result.headers=headers;return this;},end(body){result.body=body;return this;}};
    await handler({url,method},response);
    return result;
  }
  const page=await request('/');
  assert.equal(page.status,200);
  assert.match(page.body.toString(),/DEA Practice/);
  const data=await request('/questions.json');
  assert.equal(JSON.parse(data.body).questions.length,45);
  assert.match(data.headers['Content-Type'],/application\/json/);
  assert.equal((await request('/package.json')).status,404);
  assert.equal((await request('/%2e%2e%2f%2e%2e%2fpackage.json')).status,403);
  assert.equal((await request('/questions.json','POST')).status,405);
  assert.equal((await request('/%zz')).status,400);
  assert.equal((await request('/','HEAD')).body,undefined);
  for(const path of ['/styles.css','/app.mjs','/core.mjs','/concepts.mjs']) assert.equal((await request(path)).status,200);
});
