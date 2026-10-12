import { concepts } from './concepts.mjs';
import { STORAGE_KEY, createSession, remainingSeconds, selectAnswer, finishSession, gradeSession, restoreSession } from './core.mjs';
const main = document.querySelector('#main');
const dialog = document.querySelector('#confirm-dialog');
const types = { scenario: '상황 판단', code: '코드 해석', troubleshooting: '장애 진단', concept: '개념 이해' };
const letters = ['A', 'B', 'C', 'D'];
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
// ponytail: one device-local session; add server storage for accounts or concurrent-device sync.
let bank, session = null, view = 'home', reviewFilter = 'all', conceptFilter = 'all', confirmAction = null, timer;
function notify(message) { document.querySelector('#notice').textContent = message; }
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }
  catch { notify('브라우저 저장을 사용할 수 없습니다. 이 창을 닫으면 진행 상태가 사라집니다.'); }
}
function confirm(title, description, label, action) {
  document.querySelector('#dialog-title').textContent = title;
  document.querySelector('#dialog-description').textContent = description;
  document.querySelector('#dialog-confirm').textContent = label;
  confirmAction = action; dialog.showModal();
}
document.querySelector('#dialog-cancel').onclick = () => { confirmAction = null; dialog.close(); };
document.querySelector('#dialog-confirm').onclick = () => { const action = confirmAction; confirmAction = null; dialog.close(); action?.(); };
dialog.addEventListener('cancel', () => { confirmAction = null; });
function home() { if (!bank) return; view = 'home'; render(); }
function focusMain() { main.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
function start(mode, domain = null, ask = true) {
  if (ask && session && session.finishedAt === null) {
    confirm('진행 중인 학습을 바꿀까요?', '새 학습을 시작하면 현재 답안과 검토 표시가 초기화됩니다.', '새로 시작', () => start(mode, domain, false)); return;
  }
  session = createSession(bank, mode, domain); view = 'question'; save(); render(); focusMain();
}
function resume() { if (!session) return; view = session.finishedAt === null ? 'question' : 'result'; render(); focusMain(); }
function expire() {
  if (session?.mode === 'exam' && session.finishedAt === null && remainingSeconds(session) === 0) {
    finishSession(session, 'timeout', session.deadline); save(); view = 'result'; render();
    notify('시험 시간이 종료되어 현재 답안으로 자동 제출했습니다.'); return true;
  }
  return false;
}
function submit(ask = true) {
  if (!session || session.finishedAt !== null) return;
  if (expire()) return;
  const unanswered = gradeSession(bank, session).unanswered;
  if (ask) {
    confirm('답안을 제출할까요?', `${unanswered ? `미응답 ${unanswered}문항은 오답으로 채점됩니다. ` : '모든 문항에 응답했습니다. '}제출 후에는 답안을 변경할 수 없습니다.`, '제출하고 채점', () => submit(false)); return;
  }
  finishSession(session); save(); view = 'result'; render(); focusMain();
}
function render() {
  document.querySelector('#home-nav').classList.toggle('active', view === 'home');
  document.querySelector('#concepts-nav').classList.toggle('active', view === 'concepts');
  document.querySelector('#exam-nav').classList.toggle('active', ['question', 'result'].includes(view) && session?.mode === 'exam');
  clearInterval(timer);
  if (view === 'home') renderHome();
  else if (view === 'concepts') renderConcepts();
  else if (view === 'question') renderQuestion();
  else renderResult();
  if (session?.finishedAt === null && session.mode === 'exam') timer = setInterval(() => {
    if (!expire()) {
      const clock = document.querySelector('#clock');
      if (clock) { clock.textContent = clockText(remainingSeconds(session)); clock.classList.toggle('urgent', remainingSeconds(session) <= 300); }
    }
  }, 1000);
}
function clockText(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function renderHome() {
  main.innerHTML = `
    <div class="page-intro"><div><p class="eyebrow">YOUR STUDY WORKSPACE</p><h1>배운 내용을, 실력으로.</h1><p class="muted">Data Engineer Associate · 영역별로 연습하고 실전처럼 점검하세요.</p></div><span class="blueprint">2026.05 시험 범위</span></div>
    ${session ? `<section class="resume"><div><strong>${session.finishedAt === null ? '진행 중인 학습이 있어요' : '최근 학습 결과'}</strong><p>${session.mode === 'exam' ? '모의고사 1회' : escape(bank.domains.find(d => d.id === session.domain).name)} · ${Object.keys(session.answers).length}/${session.ids.length}문항 응답${session.mode === 'exam' && session.finishedAt === null ? ' · 남은 ' + clockText(remainingSeconds(session)) : ''}</p></div><button class="button secondary" id="resume">${session.finishedAt === null ? '이어서 풀기' : '결과 보기'}</button></section>` : ''}
    <div class="home-layout">
      <section class="mock-card" aria-labelledby="mock-title"><div class="card-top"><span class="eyebrow">FULL MOCK EXAM</span><span class="tag dark">01</span></div><h2 id="mock-title">모의고사 1회</h2><p>처음부터 끝까지,<br>실제 시험의 흐름으로.</p><div class="exam-metrics"><div><strong>45</strong><span>문항</span></div><div><strong>90</strong><span>분</span></div><div><strong>7</strong><span>출제 영역</span></div></div><ul class="exam-rules"><li>4지선다 · 문항별 정답 1개</li><li>검토 표시 및 자유로운 문항 이동</li><li>제출 후 채점과 선택지별 해설</li></ul><button class="button coral" id="start-exam">모의고사 시작</button><p class="fine">공식 출제 비중을 반영한 독립 제작 세트</p><div class="stack-decoration" aria-hidden="true"><span></span><span></span><span></span></div></section>
      <section class="category-section" aria-labelledby="category-title"><div class="section-heading"><h2 id="category-title">카테고리별 연습</h2><span class="muted">정답 확인 · 시간 제한 없음</span></div><div class="category-list">${bank.domains.map((d, i) => `<button class="category-row" data-practice="${d.id}"><span class="category-no">${String(i + 1).padStart(2, '0')}</span><span class="category-copy"><strong>${escape(d.name)}</strong><small>${escape(d.summary)}</small></span><span class="category-weight">${d.weight}%<small>출제 비중</small></span><span class="category-count">${d.count}문항</span></button>`).join('')}</div><p class="fine">연습과 모의고사는 같은 45문항을 사용합니다. 연습한 문항이 실전 점수에 영향을 줄 수 있습니다.</p></section>
    </div>
    <section class="study-note"><div><p class="eyebrow">HOW TO PRACTICE</p><h2>틀린 이유까지 이해하세요.</h2><p>상황 판단 · 코드 해석 · 장애 진단 · 개념 이해</p></div><ol><li><span>01</span>영역별로 약점 진단</li><li><span>02</span>해설과 공식 문서 확인</li><li><span>03</span>Databricks에서 직접 실습</li></ol></section>
    <details class="source-note"><summary>학습 자료와 문제 제작 기준</summary><p>업로드한 AI Prep Guide는 문제집이 아닌 학습 방법 가이드입니다. 공식 시험 가이드로 범위를 정하고, 진단 → 개념 학습 → 모의고사 → 오답 보완 → 실습으로 진행하도록 권합니다.</p><p>문제는 2026년 5월 공식 범위와 공개 샘플의 상황·코드 중심 형식을 참고해 새로 작성했습니다. 실제 기출문항이나 공식 난이도 검증 세트가 아닙니다.</p><a href="https://www.databricks.com/sites/default/files/2026-05/databricks-certified-data-engineer-associate-exam-guide-may-2026-000.pdf" target="_blank" rel="noopener noreferrer">공식 시험 가이드</a> · <a href="https://github.com/kengio/databricks-certification-study-guide/tree/main/certifications/data-engineer-associate" target="_blank" rel="noopener noreferrer">참고 학습 저장소</a></details>`;
  document.querySelector('#start-exam').onclick = () => start('exam');
  document.querySelector('#resume')?.addEventListener('click', resume);
  main.querySelectorAll('[data-practice]').forEach(b => b.onclick = () => start('practice', b.dataset.practice));
}
function renderConcepts() {
  const visible = concepts.filter(c => conceptFilter === 'all' || c.domain === conceptFilter);
  main.innerHTML = `<div class="page-intro"><div><p class="eyebrow">CONCEPT NOTES</p><h1>중요한 개념부터, 짧고 확실하게.</h1><p class="muted">핵심을 읽고 헷갈리는 차이를 확인한 뒤 영역별 문제로 점검하세요.</p></div><span class="blueprint">핵심 ${concepts.length}개</span></div>
    ${session?.finishedAt === null && session.mode === 'exam' ? '<section class="resume"><div><strong>모의고사가 진행 중입니다.</strong><p>개념을 읽는 동안에도 시험 시간은 계속 흐릅니다.</p></div><button class="button secondary" id="concept-resume">시험 이어서 풀기</button></section>' : ''}
    <p class="concept-order">먼저 수집·변환의 기본기를, 이어서 Jobs·보안·배포·최적화를 확인하세요. 공식 영역 비중과 학습 선후 관계에 따른 추천 순서입니다.</p>
    <div class="review-filters concept-filters" role="group" aria-label="개념 카테고리"><button class="filter ${conceptFilter === 'all' ? 'active' : ''}" data-concept-filter="all" aria-pressed="${conceptFilter === 'all'}">전체 · 추천 순서</button>${bank.domains.map(d => `<button class="filter ${conceptFilter === d.id ? 'active' : ''}" data-concept-filter="${d.id}" aria-pressed="${conceptFilter === d.id}">${escape(d.name)}</button>`).join('')}</div>
    <div class="concept-grid">${visible.map(c => {
      const domain = bank.domains.find(d => d.id === c.domain);
      return `<article class="concept-card"><div class="concept-meta"><span class="eyebrow">${String(concepts.indexOf(c)+1).padStart(2,'0')}</span><span class="tag">${escape(domain.name)}</span></div><h2>${escape(c.title)}</h2><p class="concept-summary">${escape(c.summary)}</p><p class="concept-memory">${escape(c.memory)}</p><details><summary>시험 포인트 · 헷갈리는 점</summary><div class="concept-detail"><h3>시험 포인트</h3><ul>${c.points.map(p => `<li>${escape(p)}</li>`).join('')}</ul><h3>헷갈리는 점</h3><p>${escape(c.trap)}</p>${c.code ? `<pre><code>${escape(c.code)}</code></pre>` : ''}</div></details><div class="concept-actions"><a href="${escape(c.source)}" target="_blank" rel="noopener noreferrer">공식 문서</a><button class="text-button" data-concept-practice="${c.domain}">이 영역 문제 풀기</button></div></article>`;
    }).join('')}</div>
    <p class="fine">실제 기출 빈도 통계가 공개된 순위는 아닙니다. 먼저 이해해야 할 핵심 개념을 골랐으며 전체 시험 목표를 모두 담은 교재는 아닙니다.</p>`;
  document.querySelector('#concept-resume')?.addEventListener('click', resume);
  main.querySelectorAll('[data-concept-filter]').forEach(b => b.onclick = () => { conceptFilter = b.dataset.conceptFilter; render(); main.querySelector(`[data-concept-filter="${conceptFilter}"]`).focus(); });
  main.querySelectorAll('[data-concept-practice]').forEach(b => b.onclick = () => start('practice', b.dataset.conceptPractice));
}
function explanation(q) {
  const choice = session.answers[q.id];
  return `<section class="explanation"><div class="explanation-heading"><span class="tag ${choice === q.correctIndex ? 'success' : 'error'}">${choice === q.correctIndex ? '정답' : Number.isInteger(choice) ? '오답' : '미응답'}</span><strong>정답 ${letters[q.correctIndex]}</strong></div><p>${escape(q.options[q.correctIndex].rationale)}</p><details><summary>선택지별 해설</summary><div class="rationale-list">${q.options.map((o, i) => `<p><strong>${letters[i]} ${i === q.correctIndex ? '· 정답' : ''}${i === choice ? ' · 내 선택' : ''}</strong><span>${escape(o.rationale)}</span></p>`).join('')}</div></details><div class="source-links">${q.sources.map(s => `<a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">공식 문서 · ${escape(s.title)}</a>`).join('')}</div></section>`;
}
function renderQuestion() {
  const q = bank.questions.find(q => q.id === session.ids[session.index]);
  const domain = bank.domains.find(d => d.id === q.domain);
  const answered = Object.keys(session.answers).length;
  const revealed = session.mode === 'practice' && session.revealed.includes(q.id);
  main.innerHTML = `<div class="exam-top"><div><p class="eyebrow">${session.mode === 'exam' ? 'MOCK EXAM 01' : 'CATEGORY PRACTICE'}</p><h1>${session.mode === 'exam' ? '모의고사 1회' : escape(domain.name)}</h1></div><div class="timer-box">${session.mode === 'exam' ? '<span>남은 시간</span><strong id="clock">' + clockText(remainingSeconds(session)) + '</strong>' : '<span>학습 모드</span><strong>시간 제한 없음</strong>'}</div></div>
    <div class="progress-line"><span>응답 ${answered} / ${session.ids.length}</span><progress max="${session.ids.length}" value="${answered}" aria-label="답안 작성 진행률"></progress><button class="text-button" id="session-home">학습 홈</button></div>
    <div class="exam-layout"><section class="question-card"><div class="question-meta"><span class="eyebrow">QUESTION ${String(session.index + 1).padStart(2,'0')}</span><span class="tag">${types[q.type]}</span><button class="flag-button ${session.flags.includes(q.id) ? 'flagged' : ''}" id="flag" aria-pressed="${session.flags.includes(q.id)}">${session.flags.includes(q.id) ? '★ 검토 표시됨' : '☆ 검토 표시'}</button></div><p class="domain-label">${escape(domain.name)} · ${escape(q.topic)}</p><h2>${escape(q.prompt)}</h2><p class="question-english" lang="en">${escape(q.promptEn)}</p>${q.code ? `<pre><code>${escape(q.code)}</code></pre>` : ''}<fieldset class="options"><legend>가장 적절한 답 하나를 선택하세요.</legend>${q.options.map((o, i) => `<label class="option ${session.answers[q.id] === i ? 'selected' : ''} ${revealed && i === q.correctIndex ? 'correct' : ''} ${revealed && session.answers[q.id] === i && i !== q.correctIndex ? 'incorrect' : ''}"><input type="radio" name="answer" value="${i}" ${session.answers[q.id] === i ? 'checked' : ''} ${revealed ? 'disabled' : ''}><span class="option-letter">${letters[i]}</span><span>${escape(o.text)}</span>${revealed && i === q.correctIndex ? '<span class="option-result">정답</span>' : ''}</label>`).join('')}</fieldset>
    ${session.mode === 'practice' ? revealed ? explanation(q) : `<button class="button primary" id="check-answer" ${session.answers[q.id] === undefined ? 'disabled' : ''}>정답 확인</button>` : '<p class="fine">실전 모드에서는 제출 후 정답과 해설이 공개됩니다.</p>'}
    <div class="question-navigation"><button class="button secondary" id="prev" ${session.index === 0 ? 'disabled' : ''}>이전 문항</button><span>${session.index + 1} / ${session.ids.length}</span><button class="button secondary" id="next" ${session.index === session.ids.length - 1 ? 'disabled' : ''}>다음 문항</button></div></section>
    <aside class="question-aside"><div class="section-heading"><h2>문항 목록</h2><span>${session.ids.length}문항</span></div><div class="question-grid">${session.ids.map((id, i) => `<button data-jump="${i}" class="grid-item ${i === session.index ? 'current' : ''} ${session.answers[id] !== undefined ? 'answered' : ''} ${session.flags.includes(id) ? 'flagged' : ''}" aria-label="${i + 1}번 문항${session.answers[id] !== undefined ? ', 응답 완료' : ', 미응답'}${session.flags.includes(id) ? ', 검토 표시' : ''}" ${i === session.index ? 'aria-current="step"' : ''}>${i + 1}${session.flags.includes(id) ? '<span aria-hidden="true">★</span>' : ''}</button>`).join('')}</div><div class="grid-legend"><span>□ 미응답</span><span>■ 응답 완료</span><span>★ 검토</span></div><div class="submission-summary"><p>미응답 <strong>${session.ids.length - answered}</strong></p><p>검토 표시 <strong>${session.flags.length}</strong></p></div><button class="button primary full" id="submit">제출하고 채점</button><p class="fine">진행 상태는 이 브라우저에 저장됩니다.</p></aside></div>`;
  document.querySelector('#session-home').onclick = home;
  document.querySelector('#flag').onclick = () => {
    if (expire()) return;
    session.flags = session.flags.includes(q.id) ? session.flags.filter(id => id !== q.id) : [...session.flags, q.id]; save(); render(); document.querySelector('#flag').focus();
  };
  main.querySelectorAll('[name="answer"]').forEach(input => input.onchange = () => {
    if (selectAnswer(session, q, Number(input.value))) { save(); render(); main.querySelector(`[name="answer"][value="${input.value}"]`).focus(); }
    else expire();
  });
  document.querySelector('#check-answer')?.addEventListener('click', () => { session.revealed.push(q.id); save(); render(); });
  const jump = index => { if (expire()) return; session.index = index; save(); render(); focusMain(); };
  document.querySelector('#prev').onclick = () => jump(session.index - 1);
  document.querySelector('#next').onclick = () => jump(session.index + 1);
  main.querySelectorAll('[data-jump]').forEach(b => b.onclick = () => jump(Number(b.dataset.jump)));
  document.querySelector('#submit').onclick = () => submit();
}
function renderResult() {
  const result = gradeSession(bank, session);
  const elapsed = Math.max(0, Math.round((session.finishedAt - session.startedAt) / 1000));
  const qs = session.ids.map(id => bank.questions.find(q => q.id === id));
  const wrong = qs.filter(q => session.answers[q.id] !== q.correctIndex);
  const filtered = qs.filter(q => reviewFilter === 'all' || (reviewFilter === 'wrong' && session.answers[q.id] !== q.correctIndex) || (reviewFilter === 'unanswered' && session.answers[q.id] === undefined) || (reviewFilter === 'flagged' && session.flags.includes(q.id)));
  main.innerHTML = `<div class="page-intro"><div><p class="eyebrow">EXAM REVIEW</p><h1>${session.mode === 'exam' ? '모의고사 1회' : escape(bank.domains.find(d => d.id === session.domain).name)} 결과</h1><p class="muted">${session.finishReason === 'timeout' ? '시간 종료로 자동 제출되었습니다.' : '수고하셨습니다. 오답의 이유를 확인하고 다시 실습해 보세요.'}</p></div><button class="button secondary" id="result-home">학습 홈</button></div>
    <div class="result-layout"><section class="score-card"><p class="eyebrow">YOUR SCORE</p><p class="score-number">${result.percent}<span>%</span></p><strong>${result.correct} / ${result.total} 정답</strong><p>미응답 ${result.unanswered}문항 · 소요 ${Math.floor(elapsed / 60)}분 ${elapsed % 60}초</p><p class="fine">${session.mode === 'practice' ? '연습 모드에서 확인한 정답이 포함된 결과입니다.' : '학습용 점수이며 공식 합격 여부를 예측하지 않습니다.'}</p><button class="button coral full" id="retry">다시 풀기</button></section><section class="domain-results"><h2>영역별 결과</h2>${result.domains.map(d => `<div class="domain-result"><div><strong>${escape(d.name)}</strong><span>${d.correct} / ${d.total} 정답</span></div><progress max="${d.total}" value="${d.correct}" aria-label="${escape(d.name)} 정답률"></progress></div>`).join('')}</section></div>
    <section class="review-section"><div class="section-heading"><h2>문항 복습</h2><span class="muted">틀린 개념은 공식 문서와 실습으로 보완하세요.</span></div><div class="review-filters" role="group" aria-label="복습 문항 필터">${[['all','전체',qs.length],['wrong','오답 · 미응답',wrong.length],['unanswered','미응답',result.unanswered],['flagged','검토 표시',session.flags.length]].map(([value,label,count]) => `<button class="filter ${reviewFilter === value ? 'active' : ''}" data-filter="${value}" aria-pressed="${reviewFilter === value}">${label} ${count}</button>`).join('')}</div><div class="review-list">${filtered.length ? filtered.map(q => {
      const choice = session.answers[q.id];
      return `<details class="review-item"><summary><span class="tag ${choice === q.correctIndex ? 'success' : 'error'}">${choice === q.correctIndex ? '정답' : choice === undefined ? '미응답' : '오답'}</span><span><small>문항 ${qs.indexOf(q)+1} · ${escape(q.topic)}</small>${escape(q.prompt)}</span></summary><div class="review-content"><p class="question-english" lang="en">${escape(q.promptEn)}</p>${q.code ? `<pre><code>${escape(q.code)}</code></pre>` : ''}<p class="muted">내 답: ${choice === undefined ? '미응답' : letters[choice]} · 정답: ${letters[q.correctIndex]}</p><ol class="review-options" type="A">${q.options.map(o => `<li>${escape(o.text)}</li>`).join('')}</ol>${explanation(q)}</div></details>`;
    }).join('') : '<p class="empty">이 조건에 해당하는 문항이 없습니다.</p>'}</div></section>`;
  document.querySelector('#result-home').onclick = home;
  document.querySelector('#retry').onclick = () => confirm('같은 세트를 다시 풀까요?', '현재 답안과 결과를 초기화하고 같은 문제를 다시 시작합니다.', '다시 풀기', () => start(session.mode, session.domain, false));
  main.querySelectorAll('[data-filter]').forEach(b => b.onclick = () => { reviewFilter = b.dataset.filter; render(); main.querySelector(`[data-filter="${reviewFilter}"]`).focus(); });
}
document.querySelector('#home-nav').onclick = home;
document.querySelector('#concepts-nav').onclick = () => { if (!bank) return; view = 'concepts'; render(); focusMain(); };
document.querySelector('#exam-nav').onclick = () => { if (!bank) return; if (session?.mode === 'exam') resume(); else start('exam'); };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') expire(); });
window.addEventListener('pagehide', () => { if (session) save(); });
function registerTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const tool = (name, description, properties, required, execute, readOnly = false) => {
    try { Promise.resolve(context.registerTool({ name, description, inputSchema: { type: 'object', properties, required, additionalProperties: false }, annotations: { readOnlyHint: readOnly }, execute })).catch(() => {}); } catch { /* Optional browser capability. */ }
  };
  tool('get_practice_session', '현재 학습 모드와 답안 진행 상태를 확인한다. 시험 중 정답은 공개하지 않는다.', {}, [], () => {
    if (!session) return { active: false };
    return { mode: session.mode, questionId: session.ids[session.index], answered: Object.keys(session.answers).length, total: session.ids.length, remainingSeconds: remainingSeconds(session), finished: session.finishedAt !== null };
  }, true);
  tool('start_practice_session', '새 모의고사 또는 영역 연습을 시작한다. 진행 중인 학습이 있으면 오류를 반환한다.', { mode: { enum: ['exam','practice'] }, domain: { type: 'string' } }, ['mode'], input => {
    if (!input || !['exam','practice'].includes(input.mode) || (input.mode === 'practice' && !bank.domains.some(d => d.id === input.domain))) throw new Error('올바른 mode와 domain을 지정하세요.');
    if (session?.finishedAt === null) throw new Error('진행 중인 학습이 있습니다. 화면에서 이어서 풀거나 새 학습을 선택하세요.');
    start(input.mode, input.domain ?? null, false); return { started: true, total: session.ids.length };
  });
  tool('answer_practice_question', '현재 문항에 답을 선택한다. answerIndex는 0부터 3까지이며 제출된 답안은 변경할 수 없다.', { answerIndex: { type: 'integer', minimum: 0, maximum: 3 } }, ['answerIndex'], input => {
    if (!session || view !== 'question') throw new Error('문제 풀이 화면에서 사용하세요.');
    const q = bank.questions.find(q => q.id === session.ids[session.index]);
    if (!selectAnswer(session, q, input?.answerIndex)) { expire(); throw new Error('답안을 선택할 수 없습니다.'); }
    save(); render(); return { questionId: q.id, selectedIndex: input.answerIndex };
  });
  tool('submit_practice_session', '현재 답안을 최종 제출하고 채점한다. 제출 후 수정할 수 없고 미응답은 오답 처리된다.', { confirm: { type: 'boolean', const: true } }, ['confirm'], input => {
    if (input?.confirm !== true || !session || session.finishedAt !== null) throw new Error('진행 중인 학습과 confirm: true가 필요합니다.');
    submit(false); const result = gradeSession(bank, session); return { submitted: true, correct: result.correct, total: result.total, percent: result.percent };
  });
}
try {
  const response = await fetch('./questions.json');
  if (!response.ok) throw new Error('자료 요청 실패');
  bank = await response.json();
  try { session = restoreSession(bank, localStorage.getItem(STORAGE_KEY)); } catch { notify('브라우저 저장이 비활성화되어 있습니다. 현재 창에서 학습을 계속할 수 있습니다.'); }
  if (!expire()) render();
  registerTools();
} catch {
  main.innerHTML = '<section class="empty"><h1>학습 자료를 불러오지 못했습니다.</h1><p>웹서버가 실행 중인지 확인한 뒤 다시 시도하세요.</p><button class="button primary" id="reload">다시 불러오기</button></section>';
  document.querySelector('#reload').onclick = () => location.reload();
}
