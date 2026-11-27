/* Job board + roadmap. Source: open_tasks.json (optional fields: eta_hkt, eta_basis, steps_done, steps_total, started_hkt,
   acceptance:[{text,status:"pass"|"fail"|"pending",evidence}]). Rules:
   - A task is DONE only if state is done AND it has acceptance criteria AND every one is "pass" with non-empty evidence.
   - A dependency counts as met only when that task is proven done.
   - Roadmap wave = 1 + max wave of its dependencies. Same wave = can run in parallel. */
(function (root) {
  function isDoneState(t) { return /^done/i.test(String((t && (t.state || t.status)) || "")); }
  function proof(t) {
    var ac = (t && t.acceptance) || [];
    if (!Array.isArray(ac) || !ac.length) return { proven: false, reason: "no acceptance criteria defined", pass: 0, total: 0 };
    var pass = ac.filter(function (c) { return c && c.status === "pass" && String(c.evidence || "").trim() !== ""; }).length;
    return { proven: pass === ac.length, reason: pass === ac.length ? "all criteria passed with evidence" : (ac.length - pass) + " of " + ac.length + " criteria not proven", pass: pass, total: ac.length };
  }
  function verdict(t) {
    var p = proof(t), claimed = isDoneState(t);
    if (claimed && p.proven) return { key: "done", word: "DONE, PROVEN", p: p };
    if (claimed) return { key: "unproven", word: "CLAIMED DONE, NOT PROVEN", p: p };
    return { key: "open", word: null, p: p };
  }
  function waves(tasks) {
    var by = {}; tasks.forEach(function (t) { by[t.id] = t; });
    var memo = {}, visiting = {}, cyc = {}, missing = {};
    function w(id) {
      if (memo[id] != null) return memo[id];
      if (visiting[id]) { cyc[id] = true; return 1; }
      visiting[id] = true;
      var m = 0;
      ((by[id] && by[id].depends_on) || []).forEach(function (d) {
        if (!by[d]) { (missing[id] = missing[id] || []).push(d); return; }
        m = Math.max(m, w(d));
      });
      visiting[id] = false; memo[id] = m + 1; return memo[id];
    }
    tasks.forEach(function (t) { w(t.id); });
    return { wave: memo, cycle: cyc, missing: missing };
  }
  function depState(t, by) {
    return ((t.depends_on) || []).map(function (d) {
      var x = by[d];
      if (!x) return { id: d, ok: false, label: "unknown task" };
      var v = verdict(x);
      return { id: d, ok: v.key === "done", label: v.key === "done" ? "done, proven" : v.key === "unproven" ? "claimed done, not proven" : "not done", title: x.title };
    });
  }
  function word(t) {
    var v = verdict(t); if (v.word) return [v.key === "done" ? "done" : "stalled", v.word];
    var k = String(t.live && /stall/i.test(t.live) ? "stalled" : (t.state || t.status || "")).toLowerCase();
    if (/stall/.test(k)) return ["stalled", "STALLED"];
    if (/waiting/.test(k)) return ["waiting", "WAITING ON YOU"];
    if (/block/.test(k)) return ["stalled", "BLOCKED"];
    if (/running|doing/.test(k)) return ["doing", "DOING"];
    if (/queue|next/.test(k)) return ["queued", "QUEUED"];
    return ["queued", "UNKNOWN"];
  }
  var api = { proof: proof, verdict: verdict, waves: waves, depState: depState, word: word, isDoneState: isDoneState };
  if (typeof module !== "undefined") module.exports = api;
  if (typeof document === "undefined") return;
  var VS = root.HBView;
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function safeUrl(u) { return root.AIOSNav ? root.AIOSNav.safeHttpUrl(u) : ""; }
  function newest(tasks) { var m = NaN; tasks.forEach(function (t) { var x = VS.parseTs(t.updated_at || t.last_progress_hkt); if (!isNaN(x) && (isNaN(m) || x > m)) m = x; }); return m; }
  document.addEventListener("DOMContentLoaded", function () {
    var out = document.getElementById("jb"), status = document.getElementById("jb-status");
    fetch("open_tasks.json?cb=" + Date.now(), { cache: "no-store" }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
      var tasks = (d.tasks || []).filter(function (t) { return t && t.id; }), by = {}; tasks.forEach(function (t) { by[t.id] = t; });
      var fresh = newest(tasks), j = VS.judge(isNaN(fresh) ? NaN : Date.now() - fresh, VS.SNAPSHOT_FRESH_MS), stale = j !== "live";
      status.className = "vs-chip " + j; status.textContent = "task data · " + (j === "live" ? "LIVE " : j === "stale" ? "STALE " : "UNKNOWN ") + VS.human(isNaN(fresh) ? NaN : Date.now() - fresh);
      document.getElementById("jb-legend").textContent = stale
        ? "Task data was last written " + VS.human(Date.now() - fresh) + ". Lamps are off and words say what each task WAS. Nothing here is live."
        : "Lit lamp = state now. A task is DONE only when every acceptance criterion passed with evidence.";
      out.className = stale ? "vs-stale-board" : "vs-live";
      var W = waves(tasks), groups = {};
      tasks.forEach(function (t) { var n = W.wave[t.id] || 1; (groups[n] = groups[n] || []).push(t); });
      Object.keys(groups).map(Number).sort(function (a, b) { return a - b; }).forEach(function (n) {
        out.appendChild(el("h2", null, n === 1 ? "Wave 1 · no dependencies, can start now, in parallel (" + groups[n].length + ")" : "Wave " + n + " · after wave " + (n - 1) + " is proven done (" + groups[n].length + ")"));
        var grid = el("div", "vs-grid jb-grid"); out.appendChild(grid);
        groups[n].forEach(function (t) {
          var w = word(t), v = verdict(t), c = el("div", "vs-card vs-" + w[0]);
          c.appendChild(el("span", "vs-lamp"));
          c.appendChild(el("div", "vs-word", (stale && !v.word ? "WAS " : "") + w[1]));
          c.appendChild(el("div", "vs-name", t.title || t.id));
          c.appendChild(el("div", "vs-meta", "id " + t.id + " · " + (t.owner || t.lane || "no owner")));
          var eta = VS.etaResolve({ state: v.key === "done" ? "done" : (t.state || ""), eta_hkt: t.eta_hkt, eta_basis: t.eta_basis, due: t.due, steps_done: t.steps_done, steps_total: t.steps_total, started_hkt: t.started_hkt });
          var e = el("div", "vs-eta" + (eta.kind === "none" ? " none" : "") + (eta.kind === "estimate" ? " est" : ""), "ETA: " + eta.text); e.style.gridColumn = "2"; c.appendChild(e);
          var dd = depState(t, by), dl = el("div", "jb-sec"); dl.style.gridColumn = "2";
          dl.appendChild(el("b", null, "Depends on: ")); if (!dd.length) dl.appendChild(document.createTextNode("nothing"));
          dd.forEach(function (x, i) { if (i) dl.appendChild(document.createTextNode(" · ")); dl.appendChild(el("span", x.ok ? "jb-ok" : "jb-no", (x.ok ? "✓ " : "✗ ") + x.id + " (" + x.label + ")")); });
          if (W.cycle[t.id]) dl.appendChild(el("div", "jb-no", "dependency loop: fix the data"));
          c.appendChild(dl);
          var al = el("div", "jb-sec"); al.style.gridColumn = "2"; al.appendChild(el("b", null, "Acceptance (all must pass with proof): "));
          var ac = Array.isArray(t.acceptance) ? t.acceptance : [];
          if (!ac.length) al.appendChild(el("span", "jb-no", "none defined, so this cannot be DONE"));
          ac.forEach(function (x) {
            var ok = x.status === "pass" && String(x.evidence || "").trim() !== "", row = el("div", ok ? "jb-ok" : x.status === "fail" ? "jb-no" : "jb-pend");
            row.appendChild(document.createTextNode((ok ? "✅ " : x.status === "fail" ? "❌ " : x.status === "pass" ? "⚠ passed but no evidence: " : "☐ ") + (x.text || "")));
            var u = safeUrl(x.evidence);
            if (ok && u) { var a = el("a", null, " · evidence"); a.setAttribute("href", u); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); a.href = u; row.appendChild(a); }
            else if (ok) row.appendChild(document.createTextNode(" · evidence: " + String(x.evidence)));
            al.appendChild(row);
          });
          c.appendChild(al); grid.appendChild(c);
        });
      });
    }).catch(function () { status.className = "vs-chip unknown"; status.textContent = "task data · UNKNOWN (unreachable)"; });
  });
})(typeof window !== "undefined" ? window : globalThis);
