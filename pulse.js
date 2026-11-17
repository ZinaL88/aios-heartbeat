/* Public heartbeat observations, never proof that the Pages status artifact is fresh. */
(function(global){
"use strict";
var RAW="https://raw.githubusercontent.com/ZinaL88/aios-heartbeat/main/";
var URLS=[RAW+"status.json","https://zinal88.github.io/aios-heartbeat/status.json"];
var LIMIT=5*60*1000;
function age(d){
  var s=d&&d.written_at_utc;
  if(typeof s!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(s)) return Infinity;
  var t=Date.parse(s), a=Date.now()-t;
  return Number.isFinite(t)&&a>=0?a:Infinity;
}
function create(render,report){
  var last=null, source="baked snapshot", unavailable=true, busy=false;
  function state(){
    var a=age(last);
    report({kind:unavailable?"UNAVAILABLE":(a<=LIMIT?"OBSERVED":"STALE"),
      age:a,source:source,data:last,history:RAW+"history/index.json",limit:LIMIT});
  }
  function show(d,src,failed){last=d;source=src;unavailable=!!failed;if(d) render(d);if(d&&!failed){try{localStorage.setItem("aios-hb-v1",JSON.stringify(d));}catch(e){}}state();}
  function refresh(){
    if(busy)return Promise.resolve();busy=true;
    var best=last, bestSource=source;
    function at(i){
      if(i===URLS.length){show(best,bestSource,true);return;}
      var ctl=new AbortController(),timer=setTimeout(function(){ctl.abort();},4000);
      return Promise.resolve().then(function(){return fetch(URLS[i],{cache:"no-cache",credentials:"omit",signal:ctl.signal});})
        .then(function(r){if(!r.ok)throw Error("HTTP "+r.status);return r.json();})
        .then(function(d){
          if(!d||typeof d!=="object"||Array.isArray(d))throw Error("invalid heartbeat");
          var a=age(d);
          if(a<=LIMIT){show(d,URLS[i],false);return;}
          if(!best||a<age(best)){best=d;bestSource=URLS[i];}
          return at(i+1);
        }).catch(function(){return at(i+1);}).finally(function(){clearTimeout(timer);});
    }
    return at(0).finally(function(){busy=false;});
  }
  return {refresh:refresh, seed:function(d,src){show(d,src||"baked snapshot",true);},tick:state};
}
function report(s){
  function put(id,text){var e=document.getElementById(id);if(e)e.textContent=text;}
  var detail=Number.isFinite(s.age)?Math.floor(s.age/1000)+"s old":"timestamp missing/invalid/future";
  var prefix=s.kind==="UNAVAILABLE"?"UNAVAILABLE / STALE last observation":s.kind;
  put("ping",prefix+" · "+detail+" · "+s.source);
  put("age",detail);
  put("src",prefix+" · "+s.source+" · contract ≤5min when awake; raw/UI does not verify Pages artifact freshness");
  var e=document.getElementById("src");
  if(e&&document.createElement){var a=document.createElement("a");a.href=s.history;a.textContent=" · public history (raw main)";e.appendChild(a);}
  put("runningHeading",s.kind==="OBSERVED"?"WORKERS · LAST OBSERVATION":"WORKERS · UNVERIFIED LAST OBSERVATION");
  put("runningEvidence",prefix+" · "+detail+" · "+s.source+". Listed workers/PIDs are from that observation, not a live process check.");
  var pane=document.getElementById("running");
  if(pane)pane.setAttribute("data-observation",s.kind);
  if(s.kind!=="OBSERVED"){
    put("capState","unknown · last observation");put("sttState","unknown · last observation");
    ["capDot","sttDot"].forEach(function(id){var e=document.getElementById(id);if(e)e.className="dot";});
  }
}
global.HeartbeatData={create:create,report:report,age:age,LIMIT:LIMIT,URLS:URLS,HISTORY:RAW+"history/index.json"};
})(window);

(function(){
function $(id){return document.getElementById(id);}
var NAMES={"UC_5lJHgnMP_lb_VpIiXV0hQ": "#11 课代表立正", "UCJAPsTtcJJWGk8e-_CJL8TQ": "一个狠人", "UCGWYKICLOE8Wxy7q3eYXmPA": "bestpartners", "UCPpdGTNbIKdiWgxCrbka4Zw": "huanyihe777", "UCAxQ8sjHgjXh26la7jEBw3w": "mike1111", "UCaA2cfCpytaARHcNcApboSw": "麥克老李", "UCeTLfPD7thTMabtL7w87Aug": "清流君", "UCP76ZVB1x9udP2UFcQkSvMA": "大卢和小田", "UCROR3SZDrohSela1sjD1STg": "王理元", "UCaIIFXfdQUYf3OHPIFNDdrQ": "Alan", "UC1CXs5dtO8_Zrsm-48saJfg": "Vicky Zhao", "UCPtFFY5sw8WEi--Ki9SebkA": "Web3 101"};
function title(id){return NAMES[id]||id||"—";}
function eta(min){if(min==null)return "—";if(min<=0)return "done";if(min<60)return "~"+min+"m";return "~"+Math.floor(min/60)+"h "+(min%60)+"m";}
function killRefresh(){
  document.querySelectorAll('meta[http-equiv="refresh"]').forEach(function(m){m.remove();});
}
killRefresh();
function pat(){return (localStorage.getItem("aios.pat")||"").trim();}
function gh(path, opt){
  opt=opt||{};
  var h={Accept: opt.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json"};
  if(pat()) h.Authorization="Bearer "+pat();
  if(opt.headers) Object.assign(h, opt.headers);
  return fetch("https://api.github.com"+path,{method:opt.method||"GET",headers:h,cache:"no-store",body:opt.body||null});
}
function paint(d){
  var pane=$("running");
  if(pane){
    pane.textContent="";
    var tracks=(d.collector&&d.collector.tracks)||{},c=tracks.captions||{},t=tracks.stt||{},p=d.processes||{};
    function row(text){var li=document.createElement("li");li.className="mono";li.textContent=text;pane.appendChild(li);}
    if(p.whisper||t.running)row("STT · "+title(t.channel_id)+" · "+(t.pending||0)+" pending");
    if(p.backfill||c.running)row("CAPTIONS ×"+(c.jobs||p.backfill_n||1)+" · "+title(c.channel_id)+" · "+(c.done||0)+"/"+(c.total||((c.done||0)+(c.left||0))));
    (Array.isArray(p.sample)?p.sample:[]).slice(0,4).forEach(function(s){row("pid "+s.pid+" · "+(s.cmd||"unknown command"));});
    if(!pane.children.length)row("No workers listed in this observation");
  }
  var tr=(d.collector&&d.collector.tracks)||{};
  var cap=tr.captions||{}, stt=tr.stt||{};
  var capDone=cap.done||0, capLeft=cap.left||0, capTot=cap.total||(capDone+capLeft);
  var sttPend=stt.pending||0;
  if($("ping")) $("ping").textContent=(d.written_at_hkt||"—")+" · live API";
  if($("age")) $("age").textContent=d.written_at_hkt||"—";
  if($("allNum")) $("allNum").textContent=((capLeft||0)+sttPend)+" left";
  if($("allEta")) $("allEta").textContent=eta((cap.eta_min||0)+(stt.eta_min||0));
  if($("capDot")) $("capDot").className="dot"+(cap.running?" on":"");
  var jobs=(d.processes&&d.processes.backfill_n)||cap.jobs||0;
  if($("capHead")) $("capHead").textContent="CAPTIONS";
  if($("capState")) $("capState").textContent=cap.running?"running":"idle";
  if($("capCh")) $("capCh").textContent=cap.running?title(cap.channel_id):"off";
  if($("capNum")) $("capNum").textContent=String(cap.running?(jobs||1):0);
  if($("capEta")) $("capEta").textContent=cap.running?"jobs":"not started";
  if($("sttEta")) $("sttEta").textContent=stt.inflight||"—";
  if($("capBar")) $("capBar").style.width=(capTot?Math.min(99,capDone/capTot*100):0)+"%";
  if($("sttDot")) $("sttDot").className="dot"+(stt.running?" on":"");
  if($("sttState")) $("sttState").textContent=stt.running?"running":"idle";
  if($("sttCh")) $("sttCh").textContent=title(stt.channel_id);
  if($("sttNum")) $("sttNum").textContent=sttPend+" pending";
  if($("sttEta")) $("sttEta").textContent="ETA "+(stt.eta_hkt||"unknown"); if($("sttDeadline")) $("sttDeadline").textContent="ETA "+(stt.eta_hkt||"unknown"); if($("sttDisk")) $("sttDisk").textContent=(stt.transcripts_on_disk!=null?stt.transcripts_on_disk:"—")+" transcripts on disk"; if($("capNum") && d.collector && d.collector.tracks && d.collector.tracks.captions) $("capNum").textContent=String(d.collector.tracks.captions.left!=null?d.collector.tracks.captions.left:0);
  var res=d.resources||{};
  if($("ram")) $("ram").textContent="RAM "+(res.mem_available_gi!=null?res.mem_available_gi:"—")+"G / "+(res.mem_total_gi!=null?res.mem_total_gi:"—")+"G · load "+(res.load1!=null?res.load1:"—");
  if($("src")) $("src").textContent="public observation (freshness checked below)";
  killRefresh();
}
function timed(url, headers){
  var c=new AbortController();
  var t=setTimeout(function(){c.abort();},8000);
  var h=headers||{};
  return fetch(url,{cache:"no-cache",headers:h,signal:c.signal}).finally(function(){clearTimeout(t);});
}
var heartbeat=window.HeartbeatData.create(paint,window.HeartbeatData.report);
function pull(){return heartbeat.refresh();}

function move(li, dir){
  var ol=li.parentNode;
  if(dir<0 && li.previousElementSibling) ol.insertBefore(li, li.previousElementSibling);
  if(dir>0 && li.nextElementSibling) ol.insertBefore(li.nextElementSibling, li);
  number();
}
function number(){
  var n=1;
  document.querySelectorAll("#channels>li").forEach(function(li){
    var s=li.querySelector(".n"); if(s) s.textContent=n++;
  });
}
function b64(s){
  return btoa(unescape(encodeURIComponent(s)));
}
function save(){
  var st=$("saveState");
  if(!pat()){ if(st) st.textContent="paste a GitHub PAT first (Contents write on ai-os). Token stays on this phone."; return; }
  if(st) st.textContent="saving…";
  gh("/repos/ZinaL88/ai-os/contents/jobs/channel_queue.json").then(function(r){
    if(!r.ok) throw new Error("read "+r.status);
    return r.json();
  }).then(function(meta){
    var doc=JSON.parse(decodeURIComponent(escape(atob(meta.content.replace(/\n/g,"")))));
    var map={};
    (doc.queue||[]).forEach(function(c){map[c.channel_id]=c;});
    doc.queue=[].map.call(document.querySelectorAll("#channels>li"), function(li){
      var id=(li.querySelector(".uc")?li.querySelector(".uc").value:li.getAttribute("data-cid")||"").trim();
      var name=li.querySelector(".nm")?li.querySelector(".nm").value.trim():"";
      var skip=li.querySelector(".sk")?li.querySelector(".sk").checked:false;
      var prev=map[id]||{access:"public",mode:"captions"};
      prev.channel_id=id; prev.name=name; prev.skip=skip;
      if(!prev.access) prev.access="public";
      if(!prev.mode) prev.mode="captions";
      return prev;
    }).filter(function(c){return c.channel_id;});
    var now=new Date();
    var hkt=new Date(now.getTime()+8*3600*1000);
    doc.updated_at_hkt=hkt.toISOString().slice(0,16).replace("T"," ")+" HKT";
    return gh("/repos/ZinaL88/ai-os/contents/jobs/channel_queue.json",{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        message:"queue: safari editor "+doc.updated_at_hkt,
        content: b64(JSON.stringify(doc,null,2)+"\n"),
        sha: meta.sha,
        branch:"main"
      })
    });
  }).then(function(r){
    if(!r.ok) throw new Error("write "+r.status);
    if(st) st.textContent="saved. box pulls within 5 min.";
  }).catch(function(e){
    if(st) st.textContent=String(e.message||e);
  });
}
function addCh(){
  var ol=$("channels"); if(!ol) return;
  var li=document.createElement("li");
  li.innerHTML='<span class="mv"><button type="button">▲</button><button type="button">▼</button></span><span class="n">+</span><div class="txt"><b>new</b></div><div class="edit-only"><input class="nm" placeholder="name"/><input class="uc" placeholder="UC…"/><label class="skl"><input type="checkbox" class="sk"/> skip — box will not start this</label><button type="button" class="rm" onclick="this.closest(\'li\').remove()">remove</button></div>';
  ol.appendChild(li);
}
function qtab(id){
  // No-op on sandbox board (#qList + qFilter); legacy #channels/#playlists only
  if($("qList") && !$("channels")) return;
  document.querySelectorAll("#qTabs button").forEach(function(b){ b.classList.remove("on"); });
  var btn=document.getElementById("tab-"+id);
  if(btn) btn.classList.add("on");
  if($("channels")) $("channels").hidden = (id!=="ch");
  if($("playlists")) $("playlists").hidden = (id==="ch");
  document.querySelectorAll("#playlists details").forEach(function(d){
    var sum=(d.querySelector("summary")||{}).textContent||"";
    var show = id==="tk" || id==="all" || (id==="p0"&&sum.indexOf("P0")===0) || (id==="p1"&&sum.indexOf("P1")===0) || (id==="p2"&&sum.indexOf("P2")===0);
    d.hidden = (id==="ch") ? true : !show && id!=="tk";
    if(id==="tk") d.hidden=false;
  });
}
window.qtab=qtab;
function bootTabs(){
  // Do not attach legacy qtab listeners when sandbox QUEUE (#qList) is present —
  // those strip .on and conflict with onclick="qFilter(this)".
  if($("qList") && !$("channels")) return;
  document.querySelectorAll("#qTabs button").forEach(function(b){
    b.addEventListener("click", function(){
      var id=(b.id||"").replace("tab-","");
      qtab(id||"ch");
    });
  });
}
function toggleEdit(){
  document.body.classList.toggle("editing");
  var ed=$("editBtn");
  if(ed) ed.textContent=document.body.classList.contains("editing")?"Done":"Edit";
}
window.toggleEdit=toggleEdit;
function bootEdit(){
  var ed=$("editBtn");
  if(ed) ed.onclick=toggleEdit;
  var sv=$("saveBtn"); if(sv) sv.onclick=save;
  var ad=$("addCh"); if(ad) ad.onclick=addCh;
  var inp=$("patIn");
  if(inp){
    inp.value=pat()?"••••saved••••":"";
    inp.onchange=function(){ if(inp.value && inp.value.indexOf("•")<0) localStorage.setItem("aios.pat", inp.value.trim()); };
  }
}
try{ var __c=localStorage.getItem("aios-hb-v1"); heartbeat.seed(__c?JSON.parse(__c):null,"cached/baked snapshot"); }catch(e){heartbeat.seed(null);}
pull();
setInterval(pull, 15000);
setInterval(heartbeat.tick,1000);
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", function(){ bootTabs(); bootEdit(); filterQueue(); var _ob=document.querySelector("#oTabs button.on"); if(_ob) oFilter(_ob); });
else { bootTabs(); bootEdit(); filterQueue(); var _ob=document.querySelector("#oTabs button.on"); if(_ob) oFilter(_ob); }
})();
