export const STORAGE_KEY = 'dea-practice-session-v1';
export function createSession(bank, mode, domain = null, now = Date.now()) {
  if (!['exam', 'practice'].includes(mode)) throw new Error('잘못된 학습 모드');
  let ids = bank.questions.filter(q => mode === 'exam' || q.domain === domain).map(q => q.id);
  if (!ids.length) throw new Error('문제가 없는 카테고리');
  if (mode === 'exam') {
    // One fixed mock form: mix domains, preserve reproducibility on retry.
    ids = ids.map((_, i) => ids[(i * 17 + 4) % ids.length]);
  }
  return { version: bank.version, mode, domain, ids, index: 0, answers: {}, flags: [], revealed: [],
    startedAt: now, deadline: mode === 'exam' ? now + bank.exam.minutes * 60000 : null,
    finishedAt: null, finishReason: null };
}
export function remainingSeconds(session, now = Date.now()) {
  return session.deadline === null ? null : Math.max(0, Math.ceil((session.deadline - now) / 1000));
}
export function finishSession(session, reason = 'submit', now = Date.now()) {
  if (session.finishedAt !== null) return;
  session.finishedAt = now;
  session.finishReason = reason;
}
export function selectAnswer(session, question, value, now = Date.now()) {
  if (session.finishedAt !== null || (session.mode === 'practice' && session.revealed.includes(question.id))) return false;
  if (remainingSeconds(session, now) === 0) return false;
  if (!session.ids.includes(question.id) || !Number.isInteger(value) || value < 0 || value >= question.options.length) return false;
  session.answers[question.id] = value;
  return true;
}
export function gradeSession(bank, session) {
  const selected = bank.questions.filter(q => session.ids.includes(q.id));
  const correct = selected.filter(q => session.answers[q.id] === q.correctIndex).length;
  const answered = selected.filter(q => Number.isInteger(session.answers[q.id])).length;
  return { total: selected.length, correct, answered, unanswered: selected.length - answered,
    percent: Math.round(correct / selected.length * 100),
    domains: bank.domains.map(d => {
      const qs = selected.filter(q => q.domain === d.id);
      return { ...d, total: qs.length, correct: qs.filter(q => session.answers[q.id] === q.correctIndex).length };
    }).filter(d => d.total > 0) };
}
export function restoreSession(bank, raw) {
  try {
    const s = JSON.parse(raw);
    if (!s || s.version !== bank.version || !['exam', 'practice'].includes(s.mode)) return null;
    const expected = createSession(bank, s.mode, s.domain, s.startedAt);
    if (!Array.isArray(s.ids) || JSON.stringify(s.ids) !== JSON.stringify(expected.ids)) return null;
    if (!Number.isInteger(s.index) || s.index < 0 || s.index >= s.ids.length) return null;
    if (!Number.isFinite(s.startedAt) || s.startedAt <= 0 || s.deadline !== expected.deadline) return null;
    if (s.finishedAt !== null && (!Number.isFinite(s.finishedAt) || s.finishedAt < s.startedAt)) return null;
    if (!s.answers || typeof s.answers !== 'object' || Array.isArray(s.answers)) return null;
    for (const [id, value] of Object.entries(s.answers)) {
      const q = bank.questions.find(q => q.id === id);
      if (!q || !s.ids.includes(id) || !Number.isInteger(value) || value < 0 || value >= q.options.length) return null;
    }
    if (![s.flags, s.revealed].every(a => Array.isArray(a) && new Set(a).size === a.length && a.every(id => s.ids.includes(id)))) return null;
    if (s.mode === 'exam' && s.revealed.length) return null;
    if (s.revealed.some(id => !Number.isInteger(s.answers[id]))) return null;
    return s;
  } catch { return null; }
}
