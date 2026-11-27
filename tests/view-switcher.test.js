const test = require('node:test');
const assert = require('node:assert/strict');
const vs = require('../view-switcher.js');
const NOW = Date.parse('2026-11-27T16:00:00Z');
test('HKT stamp parses as UTC+8', () => assert.equal(vs.parseTs('2026-10-27 21:19:36 HKT'), Date.UTC(2026, 9, 27, 13, 19, 36)));
test('30-day-old snapshot is stale and blocks light-up', () => {
  const ms = vs.age('2026-10-27 21:19:36 HKT', NOW);
  assert.equal(vs.judge(ms, vs.SNAPSHOT_FRESH_MS), 'stale');
  assert.equal(vs.lightUpAllowed(ms), false);
});
test('unknown or missing timestamp is never live', () => {
  for (const s of [undefined, null, '', 'garbage']) { const ms = vs.age(s, NOW); assert.equal(vs.judge(ms, 1e12), 'unknown'); assert.equal(vs.lightUpAllowed(ms), false); }
});
test('fresh heartbeat is live, 6 min old is stale', () => {
  assert.equal(vs.judge(vs.age('2026-11-27T15:58:00Z', NOW), vs.HEARTBEAT_FRESH_MS), 'live');
  assert.equal(vs.judge(vs.age('2026-11-27T15:54:00Z', NOW), vs.HEARTBEAT_FRESH_MS), 'stale');
});
test('future timestamp clamps to 0, not negative', () => assert.equal(vs.age('2026-11-27T17:00:00Z', NOW), 0));

const NOW2 = Date.parse('2026-11-27T16:00:00Z');
test('worker eta wins and shows basis', () => {
  const r = vs.etaResolve({ state: 'running', eta_hkt: '2026-11-28 10:00 HKT', eta_basis: 'worker', due: '2026-11-30' }, NOW2);
  assert.equal(r.kind, 'worker'); assert.match(r.text, /set by worker/); assert.match(r.text, /2026-11-28 10:00 HKT/);
});
test('deadline stays labelled deadline, not estimate', () => {
  assert.equal(vs.etaResolve({ state: 'queued', due: '2026-11-10' }, NOW2).kind, 'deadline');
  assert.equal(vs.etaResolve({ state: 'queued', eta_hkt: '2026-12-01 09:00 HKT', eta_basis: 'deadline' }, NOW2).kind, 'deadline');
});
test('estimate only from real step data, labelled ESTIMATE', () => {
  const r = vs.etaResolve({ state: 'running', steps_done: 2, steps_total: 4, started_hkt: '2026-11-27 22:00 HKT' }, NOW2); // started 14:00Z, 2h for 2 steps -> +2h = 18:00Z = 02:00 HKT
  assert.equal(r.kind, 'estimate'); assert.match(r.text, /ESTIMATE by Instinct/); assert.match(r.text, /2026-11-28 02:00 HKT/);
  for (const bad of [{ steps_total: 4 }, { steps_done: 0, steps_total: 4, started_hkt: '2026-11-27 22:00 HKT' }, { steps_done: 5, steps_total: 4, started_hkt: '2026-11-27 22:00 HKT' }]) assert.equal(vs.etaResolve(Object.assign({ state: 'running' }, bad), NOW2).kind, 'none');
});
test('passed worker eta is flagged, finished items have no eta', () => {
  assert.match(vs.etaResolve({ state: 'running', eta_hkt: '2026-11-20 10:00 HKT' }, NOW2).text, /PASSED/);
  assert.equal(vs.etaResolve({ state: 'Done', eta_hkt: '2026-12-01 10:00 HKT' }, NOW2).kind, 'none');
});
