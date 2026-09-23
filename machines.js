/* Public UI shell, browser-local machine metadata. No control API or credential storage. */
(function (root) {
  'use strict';
  const STORAGE = 'heartbeat.hosts.v1';
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  function text(value, name, max) {
    if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x1f\x7f]/.test(value)) throw Error('Invalid ' + name + '.');
    return value;
  }
  function normalize(d) {
    if (!d || d.schema !== 'heartbeat-terminal-pilot/v1' || d.state !== 'ready') throw Error('Use a ready terminal-pilot status JSON. Failed or starting connections cannot be saved.');
    if (d.password || d.token || d.secret || d.credential || d.credentials) throw Error('Remove credentials. Paste only the status JSON.');
    const host = d.host;
    if (!host || host.schema !== 'heartbeat-host/v1' || !uuid.test(host.host_id) || !uuid.test(d.connection_id)) throw Error('Missing or invalid machine identity.');
    if (host.os !== 'Linux' || host.architecture !== 'x86_64') throw Error('This pilot currently supports Linux x86_64 VMs. Macs are not enrolled by this page.');
    const label = text(host.label, 'machine name', 100);
    const url = new URL(text(d.url, 'terminal address', 255));
    if (url.protocol !== 'https:' || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.trycloudflare\.com$/.test(url.hostname) || url.port || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw Error('Use the plain HTTPS trycloudflare.com pilot address, with no password or extra path.');
    if (d.session_id !== host.host_id + '/terminal/heartbeat') throw Error('Session identity does not match the selected machine.');
    const expires = Date.parse(d.expires_at_utc);
    if (!Number.isFinite(expires) || !/Z$/.test(d.expires_at_utc)) throw Error('A valid UTC connection expiry is required.');
    const cwd = text(d.cwd, 'VM workspace path', 1024);
    if (!cwd.startsWith('/')) throw Error('The VM workspace must be an absolute path.');
    // Explicit projection: checks, log paths and unknown fields never enter storage.
    return {schema:d.schema,state:'ready',host:{schema:host.schema,host_id:host.host_id,label,os:host.os,architecture:host.architecture},connection_id:d.connection_id,session_id:d.session_id,url:url.origin,expires_at_utc:new Date(expires).toISOString(),cwd};
  }
  function parse(value) {
    if (typeof value !== 'string' || value.length > 32768) throw Error('Paste one status JSON, under 32 KB.');
    let data;
    try { data = JSON.parse(value); } catch (_) { throw Error('Paste valid JSON without Markdown fences.'); }
    return normalize(data);
  }
  function upsert(hosts, item) {
    item = normalize(item);
    const other = hosts.find(h => h.host.host_id !== item.host.host_id && (h.url === item.url || h.connection_id === item.connection_id));
    if (other) throw Error('This connection is already assigned to another machine. Verify its identity before adding it.');
    const next = hosts.filter(h => h.host.host_id !== item.host.host_id);
    if (next.length >= 12) throw Error('This pilot supports up to 12 saved machines.');
    return [...next,item];
  }
  function expired(host, now = Date.now()) { return Date.parse(host.expires_at_utc) <= now; }
  if (typeof module !== 'undefined' && module.exports) module.exports = {parse,normalize,upsert,expired};
  if (!root.document) return;
  const doc = root.document, $ = id => doc.getElementById(id);
  let hosts = [], pending = null;
  function node(tag, value, cls) { const el = doc.createElement(tag); if(value) el.textContent=value; if(cls) el.className=cls; return el; }
  function message(value) { $('message').textContent=value; }
  function persist() {
    try {
      if ($('remember').checked) root.localStorage.setItem(STORAGE,JSON.stringify({schema:'heartbeat-host-registry/v1',hosts}));
      else root.localStorage.removeItem(STORAGE);
    } catch (_) { message('Browser storage is unavailable. Links remain in this page only.'); $('remember').checked=false; }
  }
  try {
    const raw = root.localStorage.getItem(STORAGE);
    if (raw) {
      if (raw.length > 65536) throw Error('Saved machine data is too large.');
      const saved = JSON.parse(raw);
      if (saved.schema !== 'heartbeat-host-registry/v1' || !Array.isArray(saved.hosts)) throw Error('Invalid saved registry.');
      saved.hosts.forEach(h => {hosts=upsert(hosts,normalize(h));});
      $('remember').checked=true;
    }
  } catch (_) { hosts=[];message('Saved links could not be read. Import fresh status JSON to reconnect.'); }
  function render() {
    const list=$('machines');list.replaceChildren();$('count').textContent=hosts.length+' saved';
    if (!hosts.length) {
      const empty=node('div',null,'empty');
      empty.append(node('span','↗','empty-mark'),node('h3','Start with your first VM'),node('p','Add its pilot status to see the machine name, workspace and terminal expiry here.'));
      list.append(empty);return;
    }
    hosts.forEach(h => {
      const stale=expired(h), card=node('article',null,'machine');
      card.append(node('span',stale?'Connection expired':'Saved link · reachability unchecked','status'+(stale?' expired':'')),node('h3',h.host.label),node('p',h.host.os+' · '+h.host.architecture,'muted'),node('p',h.cwd,'mono'),node('p','Machine '+h.host.host_id,'mono'),node('p','Connection '+h.connection_id,'mono'),node('p','Expires '+new Date(h.expires_at_utc).toLocaleString(),'small'));
      const actions=node('div',null,'actions');
      if (!stale) {
        const link=node('a','Open terminal ↗','terminal');link.href=h.url;link.target='_blank';link.rel='noopener noreferrer';link.referrerPolicy='no-referrer';
        link.addEventListener('click',e=>{if(expired(h)){e.preventDefault();message('This connection has expired. Renew the pilot on this VM and paste its new status.');render();}});
        actions.append(link);
      } else actions.append(node('span','Renew the pilot on this VM to reconnect.','terminal-disabled'));
      const remove=node('button','Forget link','subtle');remove.type='button';remove.addEventListener('click',()=>{hosts=hosts.filter(x=>x.host.host_id!==h.host.host_id);persist();render();message('Link forgotten. No VM service or running job was stopped.');});actions.append(remove);
      card.append(actions);list.append(card);
    });
  }
  $('pairForm').addEventListener('submit',e=>{
    e.preventDefault();pending=null;$('pairPreview').replaceChildren();$('pairPreview').hidden=true;
    try {
      pending=parse($('pairing').value);upsert(hosts,pending);
      const h=pending, replacing=hosts.some(x=>x.host.host_id===h.host.host_id), preview=$('pairPreview');
      preview.append(node('h3',h.host.label),node('p',h.cwd,'mono'),node('p','Machine '+h.host.host_id,'mono'),node('p',h.url,'mono'),node('p',expired(h)?'This link has expired. It can be saved as a record, but cannot open a terminal.':'Verify this machine ID against the pilot output. The page has not authenticated the VM.','small'));
      if(replacing) preview.append(node('p','This will replace the saved connection for the same machine.','small'));
      const save=node('button',replacing?'Update this machine':'Save this machine','primary');save.type='button';save.addEventListener('click',()=>{
        try {hosts=upsert(hosts,h);persist();render();pending=null;preview.hidden=true;$('pairing').value='';message('Machine saved. Sign in only at its terminal address.');} catch(err){message(err.message);}
      });preview.append(save);preview.hidden=false;message('');
    } catch(err) { message(err.message); }
  });
  $('remember').addEventListener('change',persist);
  $('clear').addEventListener('click',()=>{hosts=[];pending=null;$('pairPreview').hidden=true;$('pairing').value='';$('remember').checked=false;persist();render();message('Links forgotten. VM services and jobs remain unchanged.');});
  root.addEventListener('storage',e=>{if(e.key===STORAGE){message('Saved connections changed in another tab. Reload to use the latest links.');}});
  render();root.setInterval(render,15000);
})(typeof window !== 'undefined' ? window : globalThis);
