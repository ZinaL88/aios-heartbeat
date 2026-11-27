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
