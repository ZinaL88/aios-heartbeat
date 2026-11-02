/* Jump bar: Heartbeat board <-> map <-> SIT ROOM (room + job board). Links only.
   Public-safe: no private URL ships in this file. The owner sets the SIT ROOM address once per device by opening
   any Heartbeat page with ?sitroom=<url>; it is kept in this browser's localStorage only.
   ?task=<id> on any page shows deep links for that task (map spot, SIT ROOM thread, job card). */
(function (root) {
  const KEY = "aios.sitroom";
  function base(store) {
    try { return ((store || root.localStorage).getItem(KEY) || "").replace(/\/+$/, ""); } catch (e) { return ""; }
  }
  function links(task, sitroom) {
    const t = task ? encodeURIComponent(task) : "";
    const s = sitroom || "";
    return {
      board: t ? "index.html?task=" + t : "index.html",
      map: t ? "map.html?task=" + t : "map.html",
      machines: "machines.html", library: "library.html",
      room: s ? s + (t ? "/?task=" + t : "/") : "",
      jobs: s ? s + "/board/jobs.html" + (t ? "#task-" + t : "") : "",
    };
  }
  function barHtml(task, sitroom) {
    const l = links(null, sitroom);
    const sr = sitroom
      ? '<a href="' + l.room + '" target="_blank" rel="noopener">SIT ROOM ↗</a> · <a href="' + l.jobs + '" target="_blank" rel="noopener">Job board ↗</a>'
      : '<a href="#" data-aios-set-sitroom>SIT ROOM (set link)</a>';
    return '<nav class="aios-jump" aria-label="Jump between Heartbeat and SIT ROOM"><a href="' + l.board + '">Board</a> · <a href="' +
      l.map + '">Map</a> · <a href="' + l.machines + '">Machines</a> · <a href="' + l.library + '">Library</a> · ' + sr + "</nav>";
  }
  function taskHtml(task, sitroom) {
    const l = links(task, sitroom);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    return '<div class="aios-jump-task">Task <b>' + esc(task) + '</b>: <a href="' + l.map + '">map</a> · <a href="' + l.board + '">board</a>' +
      (sitroom ? ' · <a href="' + l.room + '" target="_blank" rel="noopener">SIT ROOM thread ↗</a> · <a href="' + l.jobs +
        '" target="_blank" rel="noopener">job card ↗</a>' : "") + "</div>";
  }
  const api = { links, barHtml, taskHtml, base, KEY };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof document === "undefined") return;
  root.AIOSNav = api;
  document.addEventListener("DOMContentLoaded", function () {
    const q = new URLSearchParams(location.search);
    const set = q.get("sitroom");
    if (set && /^https?:\/\//.test(set)) { try { localStorage.setItem(KEY, set); } catch (e) {} }
    const s = base(), task = q.get("task");
    const css = document.createElement("style");
    css.textContent = ".aios-jump,.aios-jump-task{font:12px/1.6 ui-monospace,monospace;padding:4px 12px}.aios-jump a,.aios-jump-task a{color:inherit;font-weight:600}.aios-jump-task{background:rgba(200,255,0,.12)}";
    document.head.appendChild(css);
    document.body.insertAdjacentHTML("afterbegin", barHtml(task, s) + (task ? taskHtml(task, s) : ""));
    const btn = document.querySelector("[data-aios-set-sitroom]");
    if (btn) btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      const v = prompt("SIT ROOM address (kept in this browser only):");
      if (v && /^https?:\/\//.test(v)) { localStorage.setItem(KEY, v); location.reload(); }
    });
  });
})(typeof window !== "undefined" ? window : globalThis);
