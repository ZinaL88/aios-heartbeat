(function(){
function title(id){return {UC_5lJHgnMP_lb_VpIiXV0hQ:"#11 课代表立正",UCJAPsTtcJJWGk8e-_CJL8TQ:"一个狠人",UCGWYKICLOE8Wxy7q3eYXmPA:"bestpartners",UCPpdGTNbIKdiWgxCrbka4Zw:"huanyihe777",UCAxQ8sjHgjXh26la7jEBw3w:"mike1111",UCeTLfPD7thTMabtL7w87Aug:"清流君",UCP76ZVB1x9udP2UFcQkSvMA:"大卢和小田",UCROR3SZDrohSela1sjD1STg:"王理元",UCaIIFXfdQUYf3OHPIFNDdrQ:"Alan"}[id]||id||"—";}
function eta(min){if(min==null)return "—";if(min<=0)return "done";if(min<60)return "~"+min+"m";return "~"+Math.floor(min/60)+"h "+(min%60)+"m";}
function paint(d,src){
  var tr=(d.collector&&d.collector.tracks)||{};
  var cap=tr.captions||{}, stt=tr.stt||{};
  var capDone=cap.done||0, capLeft=cap.left||0, capTot=cap.total||(capDone+capLeft);
  var sttPend=stt.pending||0;
  document.getElementById("ping").textContent=(d.written_at_hkt||"—")+" · "+src;
  document.getElementById("age").textContent=d.written_at_hkt||"—";
  document.getElementById("allNum").textContent=((capLeft||0)+sttPend)+" left";
  document.getElementById("allEta").textContent=eta((cap.eta_min||0)+(stt.eta_min||0));
  document.getElementById("capDot").className="dot"+(cap.running?" on":"");
  document.getElementById("capState").textContent=cap.running?"running":"idle";
  document.getElementById("capCh").textContent=title(cap.channel_id);
  document.getElementById("capNum").textContent=capTot?(capDone+" / "+capTot):"—";
  document.getElementById("capEta").textContent=capLeft+" left · "+eta(cap.eta_min);
  document.getElementById("capBar").style.width=(capTot?Math.min(99,capDone/capTot*100):0)+"%";
  document.getElementById("sttDot").className="dot"+(stt.running?" on":"");
  document.getElementById("sttState").textContent=stt.running?"running":"idle";
  document.getElementById("sttCh").textContent=title(stt.channel_id);
  document.getElementById("sttNum").textContent=sttPend+" pending";
  document.getElementById("sttEta").textContent=eta(stt.eta_min);
  var res=d.resources||{};
  document.getElementById("ram").textContent="RAM avail "+(res.mem_available_gi!=null?res.mem_available_gi:"—")+"G / "+(res.mem_total_gi!=null?res.mem_total_gi:"—")+"G · load "+(res.load1!=null?res.load1:"—");
  document.getElementById("src").textContent="live "+src;
}
function pull(){
  var u="status.json?t="+Date.now();
  fetch(u,{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){paint(d,"json");}).catch(function(){});
}
pull();
setInterval(pull,20000);
})();
