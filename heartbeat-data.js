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
