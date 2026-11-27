/* Top view switcher (Board | Map | Job board | AI SIT ROOM) + freshness chips.
   Rules: never draw stale data as live. Freshness is computed from timestamps, not asserted.
   Public-safe: no private URL ships here. SIT ROOM address comes from AIOSNav (localStorage, set once via ?sitroom=). */
(function (root) {
  var HEARTBEAT_FRESH_MS = 5 * 60 * 1000;      // same bar as the map's STALE rule
  var SNAPSHOT_FRESH_MS = 30 * 60 * 1000;      // building states older than this are "last known", never lit
  function parseTs(s) {
    if (!s) return NaN;
    var m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?\s*(HKT)?$/);
    if (m && m[7]) return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4] - 8, +m[5], +(m[6] || 0)); // HKT = UTC+8
    return Date.parse(s);
  }
  function age(ts, now) { var t = parseTs(ts); return isNaN(t) ? NaN : Math.max(0, (now == null ? Date.now() : now) - t); }
  function human(ms) {
    if (isNaN(ms)) return "age unknown";
    var m = Math.round(ms / 60000);
    if (m < 1) return "just now";
    if (m < 90) return m + " min ago";
    var h = Math.round(m / 60);
    return h < 48 ? h + " h ago" : Math.round(h / 24) + " days ago";
  }
  // state: "live" only when a timestamp exists AND is within the bar. Unknown age is never live.
  function judge(ms, barMs) { return isNaN(ms) ? "unknown" : (ms < barMs ? "live" : "stale"); }
  function lightUpAllowed(snapshotMs) { return judge(snapshotMs, SNAPSHOT_FRESH_MS) === "live"; }
  // ETA resolution. Priority: worker-set eta_hkt (basis "worker") > deadline ("due") > step-count estimate (basis "estimate", by Instinct) > not tracked.
  // Never guesses without data: the estimate needs steps_total>0, steps_done>0 and a started time.
  function etaResolve(rec, now) {
    rec = rec || {}; now = now == null ? Date.now() : now;
    var st = String(rec.state || "").toLowerCase(), finished = /done|fail|hand/.test(st);
    if (finished) return { ok: false, kind: "none", text: "n/a (" + (rec.state || "finished") + ")" };
    function fmt(ms) { return new Date(ms + 8 * 3600000).toISOString().slice(0, 16).replace("T", " ") + " HKT"; }
    if (rec.eta_hkt) {
      var t = parseTs(rec.eta_hkt);
      if (!isNaN(t)) {
        var basis = rec.eta_basis === "deadline" ? "deadline" : "worker";
        var late = t < now;
        return { ok: true, kind: basis, text: (basis === "deadline" ? "deadline " : "") + fmt(t) + " · set by " + (basis === "deadline" ? "owner" : "worker") + (late ? " · PASSED, not updated" : "") };
      }
    }
    if (rec.due) return { ok: true, kind: "deadline", text: "deadline " + rec.due + " · not an estimate" };
    var d = +rec.steps_done, n = +rec.steps_total, s0 = parseTs(rec.started_hkt);
    if (n > 0 && d > 0 && d <= n && !isNaN(s0) && s0 < now) {
      var eta = now + (now - s0) / d * (n - d);
      return { ok: true, kind: "estimate", text: "≈ " + fmt(eta) + " · ESTIMATE by Instinct from " + d + "/" + n + " steps" };
    }
    return { ok: false, kind: "none", text: "not tracked" };
  }
  var api = { etaResolve: etaResolve, parseTs: parseTs, age: age, human: human, judge: judge, lightUpAllowed: lightUpAllowed,
              HEARTBEAT_FRESH_MS: HEARTBEAT_FRESH_MS, SNAPSHOT_FRESH_MS: SNAPSHOT_FRESH_MS };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof document === "undefined") return;
  root.HBView = api;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  var page = /map\.html/.test(location.pathname) ? "map" : /jobboard\.html/.test(location.pathname) ? "jobs" : "board";
  var CSS = ".vs-bar{position:sticky;top:0;z-index:100;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 12px;background:#1f2430;color:#f4efe6;font:13px/1.4 system-ui,sans-serif;border-bottom:2px solid #d9c9a8}"
    + ".vs-tabs{display:flex;gap:4px}.vs-tab{padding:4px 12px;border-radius:999px;color:#f4efe6;text-decoration:none;border:1px solid #556;font-weight:600}"
    + ".vs-tab[aria-current=page]{background:#f7c948;color:#241a00;border-color:#f7c948}.vs-tab.vs-off{opacity:.6;border-style:dashed}"
    + ".vs-spacer{flex:1}.vs-chip{padding:2px 10px;border-radius:999px;font:12px ui-monospace,monospace;border:1px solid}"
    + ".vs-chip.live{background:#1d3b24;color:#9df0a8;border-color:#3f8a50}.vs-chip.stale{background:#4a3410;color:#ffd27a;border-color:#b58420}.vs-chip.unknown{background:#3a2222;color:#ffb0a8;border-color:#a04a42}"
    + ".vs-toggle{padding:4px 12px;border-radius:999px;border:1px solid #f7c948;background:transparent;color:#f7c948;font-weight:600;cursor:pointer}"
    + ".vs-toggle[aria-pressed=true]{background:#f7c948;color:#241a00}"
    + ".vs-banner{width:100%;padding:4px 10px;border-radius:6px;background:#4a3410;color:#ffd27a;font-size:12px}"
    /* light-up board: words first, colour second. Stale rows are grey and say "was ...". */
    + ".vs-board{position:fixed;left:0;right:0;bottom:0;top:var(--vs-top,46px);z-index:90;overflow:auto;background:#12151c;color:#f4efe6;font:15px/1.4 system-ui,sans-serif;padding:14px}"
    + ".vs-board[hidden]{display:none}.vs-board h2{margin:14px 0 6px;font-size:14px;letter-spacing:.08em;color:#9aa3b5;text-transform:uppercase}"
    + ".vs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px}"
    + ".vs-card{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;padding:8px 10px;border-radius:10px;background:#1c212c;border:1px solid #2c3445}"
    + ".vs-lamp{grid-row:span 3;width:16px;height:16px;border-radius:50%;margin-top:4px;background:#556;box-shadow:none}"
    + ".vs-word{font-weight:800;letter-spacing:.04em}.vs-name{font-size:14px;word-break:break-word}.vs-meta{font:12px ui-monospace,monospace;color:#9aa3b5}"
    + ".vs-eta{font:13px ui-monospace,monospace;color:#f4efe6}.vs-eta.none{color:#8a93a5}"
    + ".vs-live .vs-doing .vs-lamp{background:#ffd34d;box-shadow:0 0 12px 4px #ffb300}.vs-live .vs-doing .vs-word{color:#ffd34d}"
    + ".vs-live .vs-stalled .vs-lamp{background:#ff6a5a;box-shadow:0 0 10px 3px #e05a47}.vs-live .vs-stalled .vs-word{color:#ff8a7c}"
    + ".vs-live .vs-waiting .vs-lamp{background:#c792ff;box-shadow:0 0 10px 3px #a35cf0}.vs-live .vs-waiting .vs-word{color:#d7b0ff}"
    + ".vs-live .vs-queued .vs-lamp{background:#5aa9ff}.vs-live .vs-queued .vs-word{color:#8cc3ff}"
    + ".vs-live .vs-done .vs-lamp{background:#4cc27a}.vs-live .vs-done .vs-word{color:#7fe0a2}"
    + ".vs-stale-board .vs-card{opacity:.7}.vs-stale-board .vs-word{color:#b9b2a0}"
    + ".vs-legend{font-size:12px;color:#9aa3b5;margin:4px 0 8px}";
  document.addEventListener("DOMContentLoaded", function () {
    var st = el("style"); st.textContent = CSS; document.head.appendChild(st);
    var N = root.AIOSNav, room = N ? N.base() : "";
    var bar = el("div", "vs-bar"); bar.setAttribute("role", "navigation"); bar.setAttribute("aria-label", "Heartbeat views");
    var tabs = el("div", "vs-tabs");
    function tab(label, href, current, extra) {
      var a = el("a", "vs-tab" + (extra || ""), label);
      if (href) a.setAttribute("href", href);
      if (current) a.setAttribute("aria-current", "page");
      return a;
    }
    tabs.appendChild(tab("Board", "index.html", page === "board"));
    tabs.appendChild(tab("Map", "map.html", page === "map"));
    tabs.appendChild(tab("Job board", "jobboard.html", page === "jobs"));
    var sit = tab("AI SIT ROOM", room || "#", false, room ? "" : " vs-off");
    if (room) { sit.setAttribute("target", "_blank"); sit.setAttribute("rel", "noopener"); sit.href = room + "/"; }
    else { sit.title = "Address not set on this device. Open any Heartbeat page once with ?sitroom=<url>."; sit.addEventListener("click", function (e) { e.preventDefault(); if (N) { var v = N.safeHttpUrl(prompt("SIT ROOM address (kept in this browser only):")); if (v) { localStorage.setItem(N.KEY, v); location.reload(); } } }); }
    tabs.appendChild(sit); bar.appendChild(tabs);
    bar.appendChild(el("span", "vs-spacer"));
    var hb = el("span", "vs-chip unknown", "heartbeat · checking"); bar.appendChild(hb);
    var snap = null, banner = null;
    if (page === "map") {
      snap = el("span", "vs-chip unknown", "building data · checking"); bar.appendChild(snap);
      banner = el("div", "vs-banner"); banner.hidden = true; bar.appendChild(banner);
    }
    document.body.insertBefore(bar, document.body.firstChild);
    function paint(chip, label, ms, barMs) {
      var j = judge(ms, barMs); chip.className = "vs-chip " + j;
      chip.textContent = label + " · " + (j === "live" ? "LIVE " : j === "stale" ? "STALE " : "UNKNOWN ") + human(ms);
      return j;
    }
    function refreshHb() {
      fetch("status.json?cb=" + Date.now(), { cache: "no-store" }).then(function (r) { return r.json(); })
        .then(function (d) { paint(hb, "heartbeat", age(d.written_at_utc || d.written_at_hkt), HEARTBEAT_FRESH_MS); })
        .catch(function () { hb.className = "vs-chip unknown"; hb.textContent = "heartbeat · UNKNOWN (unreachable)"; });
    }
    refreshHb(); setInterval(refreshHb, 60000);
    if (page === "map") {
      var gen = ""; try { gen = JSON.parse(document.getElementById("snapshot-data").textContent).generated_hkt; } catch (e) {}
      var update = function () {
        var ms = age(gen), j = paint(snap, "buildings", ms, SNAPSHOT_FRESH_MS);
        document.body.classList.toggle("vs-live", j === "live"); document.body.classList.toggle("vs-stale", j !== "live");
        banner.hidden = j === "live";
        banner.textContent = "Map buildings are from " + (gen || "an unknown time") + " (" + human(ms) + "). They are a snapshot, not live. The Job board tab shows task state with proof.";
      };
      update(); setInterval(update, 60000);
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
