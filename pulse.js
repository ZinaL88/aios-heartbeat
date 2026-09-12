(function(){
function $(id){return document.getElementById(id);}
var NAMES={UC_5lJHgnMP_lb_VpIiXV0hQ:"#11 课代表立正",UCJAPsTtcJJWGk8e-_CJL8TQ:"一个狠人",UCGWYKICLOE8Wxy7q3eYXmPA:"bestpartners",UCPpdGTNbIKdiWgxCrbka4Zw:"huanyihe777",UCAxQ8sjHgjXh26la7jEBw3w:"mike1111",UCeTLfPD7thTMabtL7w87Aug:"清流君",UCP76ZVB1x9udP2UFcQkSvMA:"大卢和小田",UCROR3SZDrohSela1sjD1STg:"王理元",UCaIIFXfdQUYf3OHPIFNDdrQ:"Alan",UCaA2cfCpytaARHcNcApboSw:"麥克老李"};
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
  if($("sttEta")) $("sttEta").textContent=eta(stt.eta_min);
  var res=d.resources||{};
  if($("ram")) $("ram").textContent="RAM "+(res.mem_available_gi!=null?res.mem_available_gi:"—")+"G / "+(res.mem_total_gi!=null?res.mem_total_gi:"—")+"G · load "+(res.load1!=null?res.load1:"—");
  if($("src")) $("src").textContent="live GitHub API · no page reload · cache bypassed";
  killRefresh();
}
function timed(url, headers){
  var c=new AbortController();
  var t=setTimeout(function(){c.abort();},2500);
  return fetch(url,{cache:"no-store",headers:headers||{},signal:c.signal}).finally(function(){clearTimeout(t);});
}
function slot(backMin){
  var t=Date.now()+8*3600*1000-(backMin||0)*60000;
  var d=new Date(t);
  var m=d.getUTCMinutes(); m=m-m%5;
  function p(n){return (n<10?"0":"")+n;}
  return "live/"+d.getUTCFullYear()+p(d.getUTCMonth()+1)+p(d.getUTCDate())+p(d.getUTCHours())+p(m)+".json";
}
function pull(){
  if(window.__hbIn) return;
  window.__hbIn=1;
  function ok(r){ if(!r.ok) throw r.status; return r.json(); }
  function fail(){
    window.__hbIn=0;
    try{
      var c=localStorage.getItem("aios-hb-v1");
      if(c){ paint(JSON.parse(c)); return; }
    }catch(e){}
    if($("ping")) $("ping").textContent="live fetch failed";
  }
  var url="status.json?t="+Date.now();
  timed(url).then(ok).then(function(d){
    try{ localStorage.setItem("aios-hb-v1", JSON.stringify(d)); }catch(e){}
    paint(d);
    window.__hbIn=0;
  }).catch(function(){
    timed("https://cdn.jsdelivr.net/gh/ZinaL88/aios-heartbeat@main/status.json?t="+Date.now()).then(ok).then(function(d){
      try{ localStorage.setItem("aios-hb-v1", JSON.stringify(d)); }catch(e){}
      paint(d);
      window.__hbIn=0;
    }).catch(fail);
  });
}
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
function bootEdit(){
  var ed=$("editBtn");
  if(ed) ed.onclick=function(){
    document.body.classList.toggle("editing");
    ed.textContent=document.body.classList.contains("editing")?"Done editing":"Edit names / skip / add / remove";
  };
  var sv=$("saveBtn"); if(sv) sv.onclick=save;
  var ad=$("addCh"); if(ad) ad.onclick=addCh;
  var inp=$("patIn");
  if(inp){
    inp.value=pat()?"••••saved••••":"";
    inp.onchange=function(){ if(inp.value && inp.value.indexOf("•")<0) localStorage.setItem("aios.pat", inp.value.trim()); };
  }
}
try{ var __c=localStorage.getItem("aios-hb-v1"); if(__c) paint(JSON.parse(__c)); }catch(e){}
pull();
setInterval(pull, 15000);
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", bootEdit);
else bootEdit();
})();
