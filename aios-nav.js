/* Jump bar: Heartbeat board <-> map <-> SIT ROOM (room + job board). Links only.
   Public-safe: no private URL ships in this file. The owner sets the SIT ROOM address once per device by opening
   any Heartbeat page with ?sitroom=<url>; it is kept in this browser's localStorage only.
   ?task=<id> on any page shows deep links for that task (map spot, SIT ROOM thread, job card).
   URLs are assigned via DOM properties (never string-interpolated into HTML) to avoid XSS. */
(function (root) {
  const KEY = "aios.sitroom";
  function base(store) {
    try { return ((store || root.localStorage).getItem(KEY) || "").replace(/\/+$/, ""); } catch (e) { return ""; }
  }
  function safeHttpUrl(raw) {
    const s = String(raw || "").trim();
    if (!/^https?:\/\//i.test(s)) return "";
    try {
      const u = new URL(s);
      if (u.protocol !== "http:" && u.protocol !== "https:") return "";
      return u.toString().replace(/\/+$/, "");
    } catch (e) { return ""; }
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
  function el(tag, attrs, text) {
    const n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "href") n.setAttribute("href", attrs[k]); // still setAttribute after validation
      else if (k === "className") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    if (text != null) n.textContent = text;
    return n;
  }
  function appendSep(parent) {
    parent.appendChild(document.createTextNode(" · "));
  }
  function buildBar(task, sitroom) {
    const l = links(null, sitroom);
    const nav = el("nav", { className: "aios-jump", "aria-label": "Jump between Heartbeat and SIT ROOM" });
    [["Board", l.board], ["Map", l.map], ["Machines", l.machines], ["Library", l.library]].forEach(function (pair, i) {
      if (i) appendSep(nav);
      nav.appendChild(el("a", { href: pair[1] }, pair[0]));
    });
    appendSep(nav);
    if (sitroom) {
      const a1 = el("a", { href: l.room, target: "_blank", rel: "noopener" }, "SIT ROOM ↗");
      a1.href = l.room; // property assign after validation
      nav.appendChild(a1);
      appendSep(nav);
      const a2 = el("a", { href: l.jobs, target: "_blank", rel: "noopener" }, "Job board ↗");
      a2.href = l.jobs;
      nav.appendChild(a2);
    } else {
      const a = el("a", { href: "#", "data-aios-set-sitroom": "" }, "SIT ROOM (set link)");
      nav.appendChild(a);
    }
    return nav;
  }
  function buildTask(task, sitroom) {
    const l = links(task, sitroom);
    const div = el("div", { className: "aios-jump-task" });
    div.appendChild(document.createTextNode("Task "));
    const b = el("b", null, String(task));
    div.appendChild(b);
    div.appendChild(document.createTextNode(": "));
    div.appendChild(el("a", { href: l.map }, "map"));
    appendSep(div);
    div.appendChild(el("a", { href: l.board }, "board"));
    if (sitroom) {
      appendSep(div);
      const a1 = el("a", { target: "_blank", rel: "noopener" }, "SIT ROOM thread ↗");
      a1.href = l.room;
      div.appendChild(a1);
      appendSep(div);
      const a2 = el("a", { target: "_blank", rel: "noopener" }, "job card ↗");
      a2.href = l.jobs;
      div.appendChild(a2);
    }
    return div;
  }
  // Keep string helpers for any Node tests that import the module without DOM.
  function barHtml(task, sitroom) {
    if (typeof document === "undefined") {
      const l = links(null, sitroom);
      const sr = sitroom
        ? '[SIT ROOM](' + l.room + ') · [Job board](' + l.jobs + ')'
        : 'SIT ROOM (set link)';
      return "Board · Map · Machines · Library · " + sr;
    }
    return buildBar(task, sitroom).outerHTML;
  }
  function taskHtml(task, sitroom) {
    if (typeof document === "undefined") return "Task " + String(task);
    return buildTask(task, sitroom).outerHTML;
  }
  const api = { links, barHtml, taskHtml, base, KEY, safeHttpUrl, buildBar, buildTask };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof document === "undefined") return;
  root.AIOSNav = api;
  document.addEventListener("DOMContentLoaded", function () {
    const q = new URLSearchParams(location.search);
    const set = safeHttpUrl(q.get("sitroom"));
    if (set) { try { localStorage.setItem(KEY, set); } catch (e) {} }
    const s = base(), task = q.get("task");
    const css = document.createElement("style");
    css.textContent = ".aios-jump,.aios-jump-task{font:12px/1.6 ui-monospace,monospace;padding:4px 12px}.aios-jump a,.aios-jump-task a{color:inherit;font-weight:600}.aios-jump-task{background:rgba(200,255,0,.12)}";
    document.head.appendChild(css);
    document.body.insertBefore(buildBar(task, s), document.body.firstChild);
    if (task) document.body.insertBefore(buildTask(task, s), document.body.children[1] || null);
    const btn = document.querySelector("[data-aios-set-sitroom]");
    if (btn) btn.addEventListener("click", function (ev) {
      ev.preventDefault();
      const v = safeHttpUrl(prompt("SIT ROOM address (kept in this browser only):"));
      if (v) { localStorage.setItem(KEY, v); location.reload(); }
    });
  });
})(typeof window !== "undefined" ? window : globalThis);
