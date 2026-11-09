/* Static open-task board. Data is escaped before HTML rendering; links stay local. */
(function (root) {
  'use strict';
  const columns = ['Queued', 'Running', 'Review', 'Held', 'Done'];
  function columnFor(task) {
    const status = String(task.status || task.state || 'queued').toLowerCase().trim().replace(/[ _]+/g, '-');
    if (['done', 'completed', 'complete'].includes(status)) return 'Done';
    if (['review', 'in-review', 'awaiting-review'].includes(status)) return 'Review';
    if (['held', 'hold', 'on-hold', 'blocked', 'waiting', 'waiting-on-zina'].includes(status)) return 'Held';
    if (['running', 'in-progress'].includes(status)) return 'Running';
    return 'Queued';
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));
  }
  function briefPath(value) {
    // Only repository paths; reject protocols, traversal, encoded syntax and backslashes.
    const path = String(value || '');
    return /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+(?:#[a-zA-Z0-9_-]+)?$/.test(path) && !path.split('/').some(part => part === '.' || part === '..') ? path : '';
  }
  function progressAge(value, now = Date.now()) {
    const raw = String(value || '');
    const timestamp = Date.parse(raw.replace(/ HKT$/, '+08:00').replace(/^(\d{4}-\d\d-\d\d) /, '$1T'));
    if (!Number.isFinite(timestamp)) return 'unknown';
    const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return minutes + 'm ago';
    if (minutes < 1440) return Math.floor(minutes / 60) + 'h ago';
    return Math.floor(minutes / 1440) + 'd ago';
  }
  function renderCard(task, now) {
    const brief = briefPath(task.brief_path || task.brief);
    const held = columnFor(task) === 'Held';
    return '<article class="card"><h3>' + escapeHtml(task.title || task.goal || task.id || 'Untitled task') + '</h3>' +
      '<p class="owner">Owner tool: ' + escapeHtml(task.owner || task.holder_tool || 'Unassigned') + '</p>' +
      '<p>Next: ' + escapeHtml(task.next_step || 'No next step recorded') + '</p>' +
      '<p class="age">Last progress: ' + escapeHtml(progressAge(task.last_progress_hkt || task.updated_at, now)) + '</p>' +
      (held ? (brief ? '<a href="' + escapeHtml(brief) + '">Brief: ' + escapeHtml(brief) + '</a>' : '<p class="age">Brief path unavailable</p>') : '') + '</article>';
  }
  function renderBoard(data, now = Date.now()) {
    if (!data || !Array.isArray(data.tasks) || data.tasks.some(task => !task || typeof task !== 'object' || Array.isArray(task))) throw new Error('Invalid open-task list');
    return columns.map(column => {
      const tasks = data.tasks.filter(task => columnFor(task) === column);
      return '<section class="column"><h2>' + column + ' <span>' + tasks.length + '</span></h2>' +
        (tasks.map(task => renderCard(task, now)).join('') || '<p class="empty">No tasks</p>') + '</section>';
    }).join('');
  }
  const api = {columns, columnFor, escapeHtml, briefPath, progressAge, renderCard, renderBoard};
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof document === 'undefined') return;
  root.HeartbeatKanban = api;
  let data;
  const message = document.getElementById('load-status');
  function render() { document.getElementById('kanban').innerHTML = renderBoard(data); }
  fetch('./open_tasks.json', {credentials: 'omit', redirect: 'error', cache: 'no-store'})
    .then(response => { if (!response.ok) throw new Error('HTTP ' + response.status); return response.json(); })
    .then(value => { data = value; render(); message.textContent = data.tasks.length + ' tasks · open_tasks.json'; setInterval(render, 60000); })
    .catch(() => { message.textContent = 'Could not load open_tasks.json. Serve this page from the repository and retry.'; });
})(typeof window !== 'undefined' ? window : globalThis);
