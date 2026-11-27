/* Top view switcher (Board | Map | AI SIT ROOM) + freshness chip + map light-up mode.
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
  var api = { parseTs: parseTs, age: age, human: human, judge: judge, lightUpAllowed: lightUpAllowed,
              HEARTBEAT_FRESH_MS: HEARTBEAT_FRESH_MS, SNAPSHOT_FRESH_MS: SNAPSHOT_FRESH_MS };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof document === "undefined") return;

  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  var page = /map\.html/.test(location.pathname) ? "map" : "board";
  var CSS = ".vs-bar{position:sticky;top:0;z-index:100;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:6px 12px;background:#1f2430;color:#f4efe6;font:13px/1.4 system-ui,sans-serif;border-bottom:2px solid #d9c9a8}"
    + ".vs-tabs{display:flex;gap:4px}.vs-tab{padding:4px 12px;border-radius:999px;color:#f4efe6;text-decoration:none;border:1px solid #556;font-weight:600}"
    + ".vs-tab[aria-current=page]{background:#f7c948;color:#241a00;border-color:#f7c948}.vs-tab.vs-off{opacity:.6;border-style:dashed}"
    + ".vs-spacer{flex:1}.vs-chip{padding:2px 10px;border-radius:999px;font:12px ui-monospace,monospace;border:1px solid}"
    + ".vs-chip.live{background:#1d3b24;color:#9df0a8;border-color:#3f8a50}.vs-chip.stale{background:#4a3410;color:#ffd27a;border-color:#b58420}.vs-chip.unknown{background:#3a2222;color:#ffb0a8;border-color:#a04a42}"
    + ".vs-toggle{padding:4px 12px;border-radius:999px;border:1px solid #f7c948;background:transparent;color:#f7c948;font-weight:600;cursor:pointer}"
    + ".vs-toggle[aria-pressed=true]{background:#f7c948;color:#241a00}"
    + ".vs-banner{width:100%;padding:4px 10px;border-radius:6px;background:#4a3410;color:#ffd27a;font-size:12px}"
    /* light-up: live data. Idle dims; running and waiting glow. */
    + "body.vs-lightup .building-node{transition:none}"
    + "body.vs-lightup.vs-live .building-node{opacity:.28;filter:grayscale(.8) brightness(.8)}"
    + "body.vs-lightup.vs-live .building-node[data-state=running],body.vs-lightup.vs-live .building-node[data-state=waiting],body.vs-lightup.vs-live .building-node[data-state=blocked]{opacity:1;filter:drop-shadow(0 0 7px #ffd34d) drop-shadow(0 0 16px #ffb300)}"
    + "body.vs-lightup.vs-live .building-node[data-state=waiting],body.vs-lightup.vs-live .building-node[data-state=blocked]{filter:drop-shadow(0 0 7px #ff7a66) drop-shadow(0 0 14px #e05a47)}"
    /* light-up on stale data: no glow, hatched dim, so nothing looks live */
    + "body.vs-lightup.vs-stale .building-node{opacity:.45;filter:grayscale(1) sepia(.3)}";
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
    var sit = tab("AI SIT ROOM", room || "#", false, room ? "" : " vs-off");
    if (room) { sit.setAttribute("target", "_blank"); sit.setAttribute("rel", "noopener"); sit.href = room + "/"; }
    else { sit.title = "Address not set on this device. Open any Heartbeat page once with ?sitroom=<url>."; sit.addEventListener("click", function (e) { e.preventDefault(); if (N) { var v = N.safeHttpUrl(prompt("SIT ROOM address (kept in this browser only):")); if (v) { localStorage.setItem(N.KEY, v); location.reload(); } } }); }
    tabs.appendChild(sit); bar.appendChild(tabs);
    bar.appendChild(el("span", "vs-spacer"));
    var hb = el("span", "vs-chip unknown", "heartbeat · checking"); bar.appendChild(hb);
    var snap = null, toggle = null, banner = null;
    if (page === "map") {
      snap = el("span", "vs-chip unknown", "building data · checking"); bar.appendChild(snap);
      toggle = el("button", "vs-toggle", "Light-up"); toggle.type = "button"; toggle.setAttribute("aria-pressed", "false"); bar.appendChild(toggle);
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
        var on = toggle.getAttribute("aria-pressed") === "true";
        banner.hidden = !(on && j !== "live");
        banner.textContent = "Building states are from " + (gen || "an unknown time") + " (" + human(ms) + "). Light-up is paused: nothing here is drawn as live until the map data refreshes.";
      };
      update(); setInterval(update, 60000);
      toggle.addEventListener("click", function () {
        var on = toggle.getAttribute("aria-pressed") !== "true";
        toggle.setAttribute("aria-pressed", String(on)); document.body.classList.toggle("vs-lightup", on); update();
      });
      if (/[?&]lightup=1/.test(location.search)) toggle.click();
    }
  });
})(typeof window !== "undefined" ? window : globalThis);
