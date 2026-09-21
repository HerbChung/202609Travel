(() => {
  'use strict';
  const cloud=window.PackingCloud;
  const items=window.PACKING_ITEMS, members=window.PACKING_MEMBERS, categories=window.PACKING_CATEGORIES;
  const $=id=>document.getElementById(id), allowed=new Set(items.map(i=>i.id));
  let room='', state={}, pending={}, note='', member='all', syncing=false, editingNote=false, cacheProblem=false, lastSync=null;
  function safeGet(k){try{return localStorage.getItem(k);}catch{return null;}}
  function safeSet(k,v){try{localStorage.setItem(k,v);return true;}catch{return false;}}
  const fragment=new URLSearchParams(location.hash.slice(1)).get('family');
  room=/^[a-f0-9]{64}$/.test(fragment||'')?fragment:(safeGet('kyushu-packing-family')||'');
  if(!/^[a-f0-9]{64}$/.test(room))room='';
  const key=()=> 'kyushu-packing-cache-v1-'+room;
  function cache(){if(room&&!safeSet(key(),JSON.stringify({state,pending,note}))){cacheProblem=true;error('当前浏览器无法暂存离线操作。请保持联网，等显示“已同步”后再关闭页面。');}}
  function error(message){$('error').textContent=message;$('error').hidden=!message;}
  function status(message){$('sync-status').textContent=message;}
  function validStatus(s){return ['todo','packed','skip'].includes(s);}
  function loadCache(){try{const c=JSON.parse(safeGet(key())||'null');if(c){state=Object.fromEntries(Object.entries(c.state||{}).filter(([k,v])=>allowed.has(k)&&validStatus(v)));note=typeof c.note==='string'?c.note.slice(0,2000):'';pending=Object.fromEntries(Object.entries(c.pending||{}).filter(([k,v])=>(allowed.has(k)||k==='$note')&&v&&typeof v.opId==='string'&&(k==='$note'?typeof v.value==='string':validStatus(v.value))));}}catch{error('本机缓存无法读取，将从云端重新获取清单。');}}
  function current(id){return pending[id]?.value??state[id]??'todo';}
  function counts(list){const skip=list.filter(i=>current(i.id)==='skip').length,packed=list.filter(i=>current(i.id)==='packed').length;return {skip,packed,total:list.length-skip};}
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
  function renderMembers(){const container=$('members');container.replaceChildren();for(const [id,name] of Object.entries(members)){const c=counts(id==='all'?items:items.filter(i=>i.owner===id));const b=el('button','member');b.type='button';b.dataset.member=id;b.setAttribute('aria-pressed',String(member===id));b.append(el('strong','',name),el('span','',`${c.packed} / ${c.total} 项`));b.onclick=()=>{member=id;render();};container.append(b);}}
  function render(){const c=counts(items), pct=c.total?Math.round(c.packed/c.total*100):0;$('packed-count').textContent=c.packed;$('total-count').textContent=` / ${c.total} 项已装好`;$('percent').textContent=pct+'%';$('progress').value=pct;$('remaining').textContent=c.total===c.packed?'这一份行李，准备好了。':`还有 ${c.total-c.packed} 项 · 本次不带 ${c.skip} 项`;
    renderMembers();const category=$('category').value,filter=$('status').value;const visible=items.filter(i=>(member==='all'||i.owner===member)&&(category==='all'||i.cat===category)&&(filter==='all'||current(i.id)===filter));$('list').replaceChildren();$('empty').hidden=visible.length>0;
    for(const [cat,title] of categories){const rows=visible.filter(i=>i.cat===cat);if(!rows.length)continue;const group=el('section','group');const head=el('div','group-head');const c=counts(items.filter(i=>i.cat===cat&&(member==='all'||i.owner===member)));head.append(el('h2','',title),el('span','',`${c.packed} / ${c.total} 已装好`));group.append(head);
      for(const item of rows){const value=current(item.id),row=el('div','item'+(value==='packed'?' done':value==='skip'?' skipped':''));row.dataset.id=item.id;const label=el('label');const box=el('input');box.type='checkbox';box.checked=value==='packed';box.disabled=!room||value==='skip';box.setAttribute('aria-label',members[item.owner]+'：'+item.name);box.onchange=()=>change(item.id,box.checked?'packed':'todo');const body=el('span','item-text');body.append(el('span','item-name',item.name));const meta=el('span','meta');meta.append(el('span','owner',members[item.owner]),el('span','qty',item.qty),el('span','bag',item.bag));body.append(meta);if(item.note)body.append(el('span','item-note',item.note));label.append(box,body);const skip=el('button','skip',value==='skip'?'恢复携带':'本次不带');skip.disabled=!room;skip.setAttribute('aria-label',(value==='skip'?'恢复携带':'本次不带')+'：'+members[item.owner]+' '+item.name);skip.onclick=()=>change(item.id,value==='skip'?'todo':'skip');row.append(label,skip);group.append(row);}$('list').append(group);
    }
    $('connection').hidden=!!room&&cloud.connected;$('create').textContent=room?'连接 GitHub 同步':'连接并建立清单';for(const id of ['share','refresh','export','import','reset','family-note','save-note'])$(id).disabled=!room;
    if(!editingNote)$('family-note').value=pending.$note?.value??note;
  }
  function change(id,value){pending[id]={id,value,opId:crypto.randomUUID()};cache();render();status('正在保存…');void sync();}
  async function request(path,method='GET',body){if(path==='/api/rooms')return cloud.create();return method==='PATCH'?cloud.save(room,body.operations):cloud.load(room);}
  async function sync(){if(!room||syncing)return;syncing=true;const batch=Object.values(pending);try{status(batch.length?'正在同步…':'正在检查更新…');const data=await request('/api/state',batch.length?'PATCH':'GET',batch.length?{operations:batch}:undefined);state=data.state||{};note=data.note||'';for(const op of batch){if(pending[op.id]?.opId===op.opId)delete pending[op.id];}lastSync=new Date();cache();if(!cacheProblem)error('');status(Object.keys(pending).length?'正在保存…':`已同步 · ${lastSync.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`);render();}catch(e){status(Object.keys(pending).length?'尚未同步 · 已暂存本机':'连接中断 · 显示上次进度');error(e.message+'。请保持页面打开或稍后点击“同步”。');}finally{syncing=false;}
    if(Object.keys(pending).length&&lastSync&&Date.now()-lastSync.getTime()<2000)setTimeout(sync,500);
  }
  function modal(title,text,button='确定',link=''){return new Promise(resolve=>{$('modal-title').textContent=title;$('modal-text').textContent=text;$('confirm').textContent=button;$('share-link').hidden=!link;$('share-link').value=link;$('cancel').textContent=link?'关闭':'取消';const d=$('modal');$('confirm').onclick=()=>d.close('yes');$('cancel').onclick=()=>d.close('no');d.onclose=()=>resolve(d.returnValue==='yes');d.showModal();});}
  async function createFamily(){$('create').disabled=true;error('');try{if(!room){const data=await request('/api/rooms','POST',{});room=data.token;state={};pending={};note='';safeSet('kyushu-packing-family',room);history.replaceState(null,'','#family='+room);}render();await sync();}catch(e){error('暂时无法建立清单：'+e.message);}finally{$('create').disabled=false;}}
  function connectDialog(){$('github-token').value='';$('github-error').textContent='';$('remember-token').checked=false;$('github-dialog').showModal();}
  $('create').onclick=()=>cloud.connected?createFamily():connectDialog();$('github-connect').onclick=connectDialog;
  $('github-cancel').onclick=()=>$('github-dialog').close();
  $('github-confirm').onclick=()=>{try{cloud.connect($('github-token').value.trim(),$('remember-token').checked);$('github-token').value='';$('github-dialog').close();void createFamily();}catch(e){$('github-error').textContent=e.message;}};
  $('github-disconnect').onclick=()=>{cloud.disconnect();$('github-token').value='';$('github-dialog').close();status('GitHub 已断开');render();};
  $('share').onclick=async()=>{const url=new URL(location.href);url.hash='family='+room;const accepted=await modal('把这份清单发给家人','两台手机分别连接 GitHub，再打开同一个完整链接即可共同勾选。链接包含解密钥匙，请仅分享给同行家人。','复制专属链接',url.href);if(accepted){try{await navigator.clipboard.writeText(url.href);status('专属链接已复制');}catch{await modal('请手动复制链接','长按或全选下方链接，再发送给家人。','关闭',url.href);}}};
  $('refresh').onclick=sync;$('category').onchange=render;$('status').onchange=render;
  $('family-note').oninput=()=>{editingNote=true;};$('save-note').onclick=()=>{const v=$('family-note').value;editingNote=false;change('$note',v);};
  $('export').onclick=()=>{const effective=Object.fromEntries(items.map(i=>[i.id,current(i.id)]));const blob=new Blob([JSON.stringify({format:'kyushu-packing-v1',exportedAt:new Date().toISOString(),state:effective,note:pending.$note?.value??note},null,2)],{type:'application/json'});const a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='九州家庭打包清单备份.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};
  $('import').onclick=()=>$('file').click();$('file').onchange=async()=>{const file=$('file').files[0];$('file').value='';if(!file)return;try{if(file.size>200000)throw new Error('文件过大');const b=JSON.parse(await file.text());if(b.format!=='kyushu-packing-v1'||!b.state||typeof b.state!=='object'||Array.isArray(b.state)||typeof b.note!=='string'||b.note.length>2000)throw new Error('备份格式不正确');const entries=Object.entries(b.state);if(entries.some(([id,v])=>!allowed.has(id)||!validStatus(v)))throw new Error('备份包含未知物品或状态');if(!await modal('导入到当前家庭清单？','这会替换全家的现有勾选和备注，并同步到另一台手机。建议先导出当前备份。','导入并同步'))return;for(const i of items)pending[i.id]={id:i.id,value:b.state[i.id]??'todo',opId:crypto.randomUUID()};pending.$note={id:'$note',value:b.note,opId:crypto.randomUUID()};editingNote=false;cache();render();await sync();}catch(e){error('没有导入：'+e.message);}};
  $('reset').onclick=async()=>{if(!await modal('重置全家的勾选状态？','全部物品将恢复为“还没装好”，包括本次不带的物品。家庭备注保留。重置会同步给家人，建议先导出备份。','重置并同步'))return;for(const i of items)pending[i.id]={id:i.id,value:'todo',opId:crypto.randomUUID()};cache();render();void sync();};
  for(const [value,label] of categories){const o=el('option','',label);o.value=value;$('category').append(o);}
  if(room){loadCache();history.replaceState(null,'','#family='+room);safeSet('kyushu-packing-family',room);}render();if(room)void sync();else status('建立清单后自动同步');
  setInterval(()=>{if(!document.hidden&&cloud.connected)void sync();},15000);addEventListener('online',()=>{if(cloud.connected)void sync();});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&cloud.connected)void sync();});
  addEventListener('beforeunload',e=>{if(editingNote||Object.keys(pending).length){e.preventDefault();e.returnValue='';}});
})();
