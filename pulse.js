(function(){
function $(id){return document.getElementById(id);}
var NAMES={UC_5lJHgnMP_lb_VpIiXV0hQ:"#11 课代表立正",UCJAPsTtcJJWGk8e-_CJL8TQ:"一个狠人",UCGWYKICLOE8Wxy7q3eYXmPA:"bestpartners",UCPpdGTNbIKdiWgxCrbka4Zw:"huanyihe777",UCAxQ8sjHgjXh26la7jEBw3w:"mike1111",UCeTLfPD7thTMabtL7w87Aug:"清流君",UCP76ZVB1x9udP2UFcQkSvMA:"大卢和小田",UCROR3SZDrohSela1sjD1STg:"王理元",UCaIIFXfdQUYf3OHPIFNDdrQ:"Alan"};
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
  if($("capState")) $("capState").textContent=cap.running?"running":"idle";
  if($("capCh")) $("capCh").textContent=title(cap.channel_id);
  if($("capNum")) $("capNum").textContent=capTot?(capDone+" / "+capTot):"—";
  if($("capEta")) $("capEta").textContent=capLeft+" left · "+eta(cap.eta_min);
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
  var t=setTimeout(function(){c.abort();},4000);
  return fetch(url,{cache:"no-store",headers:headers||{},signal:c.signal}).finally(function(){clearTimeout(t);});
}
function pull(){
  timed("status.json?t="+Date.now()).then(function(r){
    if(!r.ok) throw r.status;
    return r.json();
  }).then(paint).catch(function(){
    gh("/repos/ZinaL88/aios-heartbeat/contents/status.json",{raw:true}).then(function(r){
      if(!r.ok) throw r.status;
      return r.json();
    }).then(paint).catch(function(){});
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
  var ids=[].map.call(document.querySelectorAll("#channels>li"), function(li){return li.getAttribute("data-cid");});
  gh("/repos/ZinaL88/ai-os/contents/jobs/channel_queue.json").then(function(r){
    if(!r.ok) throw new Error("read "+r.status);
    return r.json();
  }).then(function(meta){
    var doc=JSON.parse(decodeURIComponent(escape(atob(meta.content.replace(/\n/g,"")))));
    var map={};
    (doc.queue||[]).forEach(function(c){map[c.channel_id]=c;});
    doc.queue=ids.map(function(id){return map[id];}).filter(Boolean);
    var left=(doc.queue||[]).map(function(c){return c.channel_id;});
    Object.keys(map).forEach(function(id){ if(left.indexOf(id)<0) doc.queue.push(map[id]); });
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
function bootEdit(){
  document.querySelectorAll("#channels>li").forEach(function(li){
    if(li.querySelector(".mv")) return;
    var wrap=document.createElement("span");
    wrap.className="mv";
    wrap.innerHTML='<button type="button" class="up" aria-label="up">▲</button><button type="button" class="dn" aria-label="down">▼</button>';
    wrap.querySelector(".up").onclick=function(){move(li,-1);};
    wrap.querySelector(".dn").onclick=function(){move(li,1);};
    li.insertBefore(wrap, li.firstChild);
  });
  var tog=$("editBtn");
  if(tog) tog.onclick=function(){
    document.body.classList.toggle("editing");
    tog.textContent=document.body.classList.contains("editing")?"Done":"Edit queue";
  };
  var sv=$("saveBtn"); if(sv) sv.onclick=save;
  var inp=$("patIn");
  if(inp){
    inp.value=pat()?"••••saved••••":"";
    inp.onchange=function(){ if(inp.value && inp.value.indexOf("•")<0) localStorage.setItem("aios.pat", inp.value.trim()); };
  }
}
pull();
setInterval(pull, pat()?20000:55000);
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", bootEdit);
else bootEdit();
})();
