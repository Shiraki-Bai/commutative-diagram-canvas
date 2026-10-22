import { hana } from './sdk.js';
const status=document.getElementById('status');
const SCOPE_KEY='diagram-workspace-v1';
try{
 hana.ready();
 const stored=await hana.storage.global.get(SCOPE_KEY,{timeoutMs:6000});
 const cache=new Map(Object.entries(stored.value&&typeof stored.value==='object'?stored.value:{}).filter(([key,value])=>key.startsWith('visual-tikzcd-')&&typeof value==='string'));
 let timer,chain=Promise.resolve();
 function persist(){clearTimeout(timer);const snapshot=Object.fromEntries(cache);chain=chain.catch(()=>{}).then(()=>hana.storage.global.set(SCOPE_KEY,snapshot));chain.catch(error=>{status.textContent='草稿保存失败：'+error.message;});return chain;}
 function schedule(){clearTimeout(timer);timer=setTimeout(persist,250);}
 window.HanaDraftStore={getItem:key=>cache.get(key)??null,setItem:(key,value)=>{cache.set(key,String(value));schedule();},removeItem:key=>{cache.delete(key);schedule();}};
 window.HanaDiagramLibraryStore=DiagramLibrary.hanaStore(hana);
 window.HanaApp={
  clipboard:text=>hana.clipboard.writeText(text),
  saveFile:async(text,suggestedName,mimeType)=>{
   const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=16384)binary+=String.fromCharCode(...bytes.subarray(i,i+16384));
   return hana.resources.saveFile({suggestedName,mimeType,contentBase64:btoa(binary)});
  }
 };
 window.addEventListener('pagehide',()=>void persist());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)void persist();});
 // Host-controlled UI inspection uses the official SDK, not remote scripting.
 try{hana.window.onInspect(()=>({description:'交换图画布，可编辑节点、箭头和 tikz-cd 源码',state:{surface:'editor',status:status.textContent}}));}catch{}
 for(const file of ['app.js','snippet-ui.js','toolbar-shortcuts.js','diagram-library-ui.js'])await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(file,import.meta.url).href;script.onload=resolve;script.onerror=()=>reject(Error('加载失败：'+file));document.body.append(script);});
}catch(error){status.textContent='App 初始化失败：'+error.message+'。为保护已保存草稿，未启动编辑器。';console.error(error);}
