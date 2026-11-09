const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const kanban = require('../kanban.js');
const fixture = require('./fixtures/open_tasks.json');

test('fixture statuses map to all five columns; status takes precedence over state and live', () => {
  const expected = {queued: 'Queued', running: 'Running', blocked: 'Held', 'waiting-on-zina': 'Held', done: 'Done'};
  for (const task of fixture.tasks) assert.equal(kanban.columnFor(task), expected[task.status]);
  for (const status of ['review', 'in_review', 'awaiting-review']) assert.equal(kanban.columnFor({status}), 'Review');
  assert.equal(kanban.columnFor({state: 'on hold'}), 'Held');
  assert.equal(kanban.columnFor({status: 'running', state: 'queued', live: 'STALLED'}), 'Running');
  assert.equal(kanban.columnFor({status: 'unknown'}), 'Queued');
  const html = kanban.renderBoard(fixture);
  for (const column of kanban.columns) assert.ok(html.includes('<h2>' + column + ' <span>'));
  assert.equal((html.match(/<article /g) || []).length, fixture.tasks.length);
});

test('cards escape every text field and allow only repository brief links', () => {
  const attack = '\"><img src=x onerror=alert(1)>&\'';
  const task = {status: 'held', title: attack, owner: attack, next_step: attack, last_progress_hkt: attack, brief_path: 'ops/briefs/task.md'};
  const html = kanban.renderCard(task);
  assert.ok(!html.includes('<img'));
  assert.equal((html.match(/&lt;img/g) || []).length, 3);
  assert.ok(html.includes('&quot;&gt;&lt;img src=x onerror=alert(1)&gt;&amp;&#39;'));
  assert.ok(html.includes('href="ops/briefs/task.md"'));
  for (const path of ['javascript:alert(1)', '//evil.test/x', 'https://evil.test', '../outside.md', 'ops/../x.md', 'ops\\x.md', '%2f%2fevil', attack]) {
    assert.equal(kanban.briefPath(path), '');
    assert.ok(!kanban.renderCard({...task, brief_path: path}).includes('href='));
  }
  assert.match(kanban.renderCard({...task, brief_path: ''}), /Brief path unavailable/);
});

test('progress age parses HKT explicitly and handles missing timestamps', () => {
  const now = Date.parse('2026-11-09T11:12:00Z');
  assert.equal(kanban.progressAge('2026-11-09 19:02 HKT', now), '10m ago');
  assert.equal(kanban.progressAge('2026-11-09 17:12 HKT', now), '2h ago');
  assert.equal(kanban.progressAge('2026-11-07 19:12 HKT', now), '2d ago');
  assert.equal(kanban.progressAge('invalid', now), 'unknown');
  assert.equal(kanban.progressAge('2026-11-10 19:12 HKT', now), 'just now');
});

test('browser loads only the repository JSON and renders the fixture', async () => {
  const board = {}, message = {};
  const requests = [];
  let completion;
  const context = {
    document: {getElementById: id => id === 'kanban' ? board : message},
    fetch: (url, options) => {
      requests.push([url, options]);
      completion = Promise.resolve({ok: true, json: () => Promise.resolve(fixture)});
      return completion;
    },
    setInterval: () => {}
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../kanban.js'), 'utf8'), context);
  await completion;
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.length, 1);
  assert.equal(requests[0][0], './open_tasks.json');
  assert.equal(requests[0][1].redirect, 'error');
  assert.match(message.textContent, /40 tasks/);
  assert.equal((board.innerHTML.match(/<article /g) || []).length, fixture.tasks.length);
  assert.equal(require('../aios-nav.js').links().kanban, 'kanban.html');
  assert.match(fs.readFileSync(require.resolve('../index.html'), 'utf8'), /href="kanban.html"/);
});
