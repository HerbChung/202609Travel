/* GitHub is the storage service. Tokens are supplied by the user, never shipped. */
(() => {
  const REPO='HerbChung/202609Travel',PREFIX='kyushu-packing-github-token';
  let token='';try{token=localStorage.getItem(PREFIX)||'';}catch{}
  const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
  const b64=b=>btoa(Array.from(b,x=>String.fromCharCode(x)).join(''));
  const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  async function params(secret){if(!/^[a-f0-9]{64}$/.test(secret))throw new Error('家庭链接不完整');const raw=Uint8Array.from(secret.match(/../g),x=>parseInt(x,16));const digest=hex(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)));return {key:await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']),path:'packing-state/'+digest+'.json'};}
  async function api(path,method='GET',body){if(!token)throw new Error('请先连接 GitHub');const r=await fetch('https://api.github.com/repos/'+REPO+'/contents/'+path,{method,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+token,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,cache:'no-store',signal:AbortSignal.timeout(15000)});if(r.status===409||r.status===422){const e=new Error('家人刚更新了清单，正在合并');e.conflict=true;throw e;}if(!r.ok){if(r.status===404){const e=new Error('找不到这份家庭清单，或令牌没有仓库权限');e.missing=true;throw e;}throw new Error(r.status===401?'GitHub 令牌无效或已过期，请重新连接':r.status===403?'GitHub 拒绝请求，请检查令牌的 Contents 读写权限或稍后重试':'GitHub 暂时无法连接（'+r.status+'）');}return r.json();}
  async function encrypt(p,data){const iv=crypto.getRandomValues(new Uint8Array(12));const content=new TextEncoder().encode(JSON.stringify(data));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(p.path)},p.key,content);return {format:'kyushu-encrypted-v1',iv:b64(iv),ciphertext:b64(new Uint8Array(encrypted))};}
  async function read(secret){const p=await params(secret);const file=await api(p.path);let envelope,data;try{envelope=JSON.parse(new TextDecoder().decode(bytes(file.content.replace(/\s/g,''))));if(envelope.format!=='kyushu-encrypted-v1')throw new Error();const plaintext=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(envelope.iv),additionalData:new TextEncoder().encode(p.path)},p.key,bytes(envelope.ciphertext));data=JSON.parse(new TextDecoder().decode(plaintext));if(data.format!=='kyushu-packing-v1'||!data.state||!Array.isArray(data.applied))throw new Error();}catch{throw new Error('清单无法解密，请检查家庭专属链接是否完整');}return {p,sha:file.sha,data};}
  async function write(p,data,sha){const envelope=await encrypt(p,data);return api(p.path,'PUT',{message:'Update encrypted family packing progress [skip ci]',content:b64(new TextEncoder().encode(JSON.stringify(envelope))),...(sha?{sha}:{})});}
  window.PackingCloud={
    get connected(){return !!token;},
    connect(value,remember=false){if(!/^github_pat_[A-Za-z0-9_]+$/.test(value))throw new Error('请输入 GitHub fine-grained token');token=value;try{if(remember)localStorage.setItem(PREFIX,value);else localStorage.removeItem(PREFIX);}catch{if(remember)throw new Error('浏览器不能记住令牌，本次打开期间仍可使用');}},
    disconnect(){token='';try{localStorage.removeItem(PREFIX);}catch{}},
    async create(){const secret=hex(crypto.getRandomValues(new Uint8Array(32))),p=await params(secret);await write(p,{format:'kyushu-packing-v1',state:{},note:'',applied:[]});return {token:secret};},
    async load(secret){const {data}=await read(secret);return {state:data.state,note:data.note};},
    async save(secret,operations){for(let attempt=0;attempt<4;attempt++){const {p,sha,data}=await read(secret);const seen=new Set(data.applied);for(const op of operations){if(seen.has(op.opId))continue;if(op.id==='$note')data.note=op.value;else data.state[op.id]=op.value;seen.add(op.opId);}data.applied=Array.from(seen).slice(-2000);try{await write(p,data,sha);return {state:data.state,note:data.note};}catch(e){if(!e.conflict||attempt===3)throw e;await new Promise(r=>setTimeout(r,300+Math.random()*300));}}}
  };
})();
