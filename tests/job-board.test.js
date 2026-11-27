const test = require('node:test');
const assert = require('node:assert/strict');
const jb = require('../job-board.js');
const ok = (t) => ({ text: t, status: 'pass', evidence: 'https://example.test/e' });
test('done needs all criteria pass with evidence', () => {
  assert.equal(jb.verdict({ state: 'done' }).key, 'unproven');
  assert.equal(jb.verdict({ state: 'done', acceptance: [] }).key, 'unproven');
  assert.equal(jb.verdict({ state: 'done', acceptance: [ok('a'), { text: 'b', status: 'pending' }] }).key, 'unproven');
  assert.equal(jb.verdict({ state: 'done', acceptance: [ok('a'), { text: 'b', status: 'pass', evidence: ' ' }] }).key, 'unproven');
  assert.equal(jb.verdict({ state: 'done', acceptance: [ok('a'), ok('b')] }).key, 'done');
});
test('not-done state is never proven even if criteria pass', () => assert.equal(jb.verdict({ state: 'running', acceptance: [ok('a')] }).key, 'open'));
test('waves: parallel roots, chained dependents, diamond', () => {
  const t = [{ id: 'a' }, { id: 'b' }, { id: 'c', depends_on: ['a', 'b'] }, { id: 'd', depends_on: ['c'] }];
  const w = jb.waves(t).wave; assert.deepEqual([w.a, w.b, w.c, w.d], [1, 1, 2, 3]);
});
test('cycle and missing deps are flagged, not crashed', () => {
  const r = jb.waves([{ id: 'x', depends_on: ['y'] }, { id: 'y', depends_on: ['x'] }, { id: 'z', depends_on: ['nope'] }]);
  assert.ok(Object.keys(r.cycle).length >= 1); assert.deepEqual(r.missing.z, ['nope']);
});
test('dependency met only when proven done', () => {
  const by = { a: { id: 'a', state: 'done' }, b: { id: 'b', state: 'done', acceptance: [ok('x')] }, c: { id: 'c', state: 'running' } };
  const d = jb.depState({ depends_on: ['a', 'b', 'c', 'q'] }, by).map((x) => x.ok);
  assert.deepEqual(d, [false, true, false, false]);
});
