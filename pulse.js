(function(){
function $(id){return document.getElementById(id);}
function title(id){return {UC_5lJHgnMP_lb_VpIiXV0hQ:"#11 课代表立正",UCJAPsTtcJJWGk8e-_CJL8TQ:"一个狠人",UCGWYKICLOE8Wxy7q3eYXmPA:"bestpartners",UCPpdGTNbIKdiWgxCrbka4Zw:"huanyihe777",UCAxQ8sjHgjXh26la7jEBw3w:"mike1111",UCeTLfPD7thTMabtL7w87Aug:"清流君",UCP76ZVB1x9udP2UFcQkSvMA:"大卢和小田",UCROR3SZDrohSela1sjD1STg:"王理元",UCaIIFXfdQUYf3OHPIFNDdrQ:"Alan"}[id]||id||"—";}
function eta(min){if(min==null)return "—";if(min<=0)return "done";if(min<60)return "~"+min+"m";return "~"+Math.floor(min/60)+"h "+(min%60)+"m";}
function killRefresh(){
  var m=document.querySelector('meta[http-equiv="refresh"]');
  if(m) m.parentNode.removeChild(m);
}
function paint(d){
  var tr=(d.collector&&d.collector.tracks)||{};
  var cap=tr.captions||{}, stt=tr.stt||{};
  var capDone=cap.done||0, capLeft=cap.left||0, capTot=cap.total||(capDone+capLeft);
  var sttPend=stt.pending||0;
  if($("ping")) $("ping").textContent=(d.written_at_hkt||"—")+" · live json";
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
  if($("src")) $("src").textContent="live json 15s · meta-refresh off";
  killRefresh();
}
function pull(){
  fetch("status.json?t="+Date.now(),{cache:"no-store"}).then(function(r){
    if(!r.ok) throw 0; return r.json();
  }).then(paint).catch(function(){});
}
pull();
setInterval(pull,15000);
})();
