/* Work feed renderer (counts and coarse states only). Used by the board card and the map panel.
   Reads work-feed.json; writes with textContent only. Shows each source's own age; never one total. */
(function(){
  function age(iso){
    var ms = Date.parse(iso);
    if (isNaN(ms)) return {txt:"age unknown", stale:true};
    var m = Math.max(0, Math.round((Date.now()-ms)/60000));
    var t = m < 90 ? m+" min ago" : (m < 4320 ? Math.round(m/60)+" h ago" : Math.round(m/1440)+" d ago");
    return {txt:t, stale: m > 120};
  }
  function el(tag, text, cls){ var e=document.createElement(tag); if(text!==undefined) e.textContent=text; if(cls) e.className=cls; return e; }
  function paint(root, doc, source){
    root.textContent = "";
    if (!doc || doc.error || !Array.isArray(doc.sources) || !doc.sources.length) {
      root.appendChild(el("p", "Work feed unavailable" + (doc && doc.error ? ": " + doc.error : "") + ". Nothing is claimed.", "mono"));
      return;
    }
    var g = age(doc.checked_at || doc.generated_at);
    root.appendChild(el("p", "Feed checked " + g.txt + " · " + (source||"source unknown") + (doc.content_revision ? " · content rev " + String(doc.content_revision).slice(0,12) : "") + (g.stale ? " · STALE, not live" : ""), "mono"));
    doc.sources.forEach(function(s){
      var a = age(s.source_updated_at);
      var box = el("div", undefined, "wf-src");
      box.appendChild(el("p", s.name + " · " + s.count + " · source " + a.txt + (a.stale ? " (stale)" : ""), "mono wf-h"));
      if (s.states) {
        var ul = el("ul", undefined, "wf-states");
        Object.keys(s.states).forEach(function(k){ if (s.states[k] > 0) ul.appendChild(el("li", k + ": " + s.states[k], "mono")); });
        box.appendChild(ul);
      }
      if (s.coverage) box.appendChild(el("p", s.coverage, "mono wf-note"));
      root.appendChild(box);
    });
    if (doc.overlap) root.appendChild(el("p", doc.overlap, "mono wf-note"));
  }
  function load(root){
    var urls = ["https://raw.githubusercontent.com/ZinaL88/aios-heartbeat/main/work-feed.json", "work-feed.json"];
    (function next(i){
      if (i >= urls.length) { root.__workFeed=null; paint(root, {error:"could not load work-feed.json"}); return; }
      fetch(urls[i], {cache:"no-store", credentials:"omit"}).then(function(r){ if(!r.ok) throw 0; return r.json(); })
        .then(function(d){ if(!d||!Array.isArray(d.sources))throw Error("invalid feed"); root.__workFeed={data:d,source:i===0?"raw main":"Pages fallback — freshness unverified"}; paint(root,d,root.__workFeed.source); }).catch(function(){ next(i+1); });
    })(0);
  }
  window.WorkFeed = {mount: function(id){ var r=document.getElementById(id); if(r){load(r);if(!r.__ageTimer)r.__ageTimer=setInterval(function(){if(r.__workFeed)paint(r,r.__workFeed.data,r.__workFeed.source);},15000);} }};
})();
