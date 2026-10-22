'use strict';
let libraryEntries=[],libraryBusy=false,libraryDecision=null;
function libraryFeedback(text,error=false){for(const feedback of document.querySelectorAll('.library-feedback')){feedback.textContent=text;feedback.classList.toggle('error',error);}}
function libraryStore(){if(window.HanaDiagramLibraryStore)return window.HanaDiagramLibraryStore;return DiagramLibrary.browserStore(localStorage);}
function libraryButtons(){for(const id of ['saveDiagram','refreshDiagrams','savedDiagram','diagramName','diagramSearch','closeSave','confirmLibraryAction','cancelLibraryAction'])$(id).disabled=libraryBusy;$('loadDiagram').disabled=libraryBusy||!$('savedDiagram').value;for(const button of $('diagramResults').querySelectorAll('button'))button.disabled=libraryBusy;}
function cancelLibraryDecision() {libraryDecision=null;$('libraryDecision').hidden=true;}
function askLibraryDecision(text,buttonText,action){libraryDecision=action;$('decisionFeedback').textContent='';$('decisionFeedback').classList.remove('error');$('libraryDecisionText').textContent=text;$('confirmLibraryAction').textContent=buttonText;$('libraryDecision').hidden=false;}
async function libraryAction(action){if(libraryBusy)return;libraryBusy=true;libraryButtons();try{await action();}catch(error){libraryFeedback(error?.message||String(error),true);}finally{libraryBusy=false;libraryButtons();}}
async function refreshLibrary(selectedId,report=true){const raw=await libraryStore().list(),entries=[],invalid=[];for(const item of raw){try{entries.push(DiagramLibrary.normalize(item,validate));}catch(error){invalid.push(error.message);}}libraryEntries=entries.sort((a,b)=>b.updatedAt-a.updatedAt);const chosen=selectedId??$('savedDiagram').value;$('savedDiagram').replaceChildren();const first=document.createElement('option');first.value='';first.textContent=entries.length?'选择已保存的交换图':'尚无已保存交换图';$('savedDiagram').append(first);for(const entry of libraryEntries){const option=document.createElement('option');option.value=entry.id;option.textContent=entry.name+' · '+new Date(entry.updatedAt).toLocaleString();$('savedDiagram').append(option);}if(libraryEntries.some(entry=>entry.id===chosen))$('savedDiagram').value=chosen;renderLibraryResults();libraryButtons();if(report)libraryFeedback('已读取 '+entries.length+' 幅交换图。'+(invalid.length?' '+invalid.length+' 条损坏记录未显示，原数据未删除。':''),!!invalid.length);}
function renderLibraryResults(){const query=$('diagramSearch').value.trim().normalize('NFC').toLocaleLowerCase(),results=$('diagramResults');results.replaceChildren();const filtered=libraryEntries.filter(entry=>entry.name.normalize('NFC').toLocaleLowerCase().includes(query));for(const entry of filtered){const button=document.createElement('button');button.type='button';button.textContent=entry.name;button.dataset.diagramId=entry.id;button.className='diagram-load';button.disabled=libraryBusy;button.onclick=()=>{$('savedDiagram').value=entry.id;return $('loadDiagram').onclick();};const row=document.createElement('div');row.className='diagram-row';const remove=document.createElement('button');remove.type='button';remove.className='diagram-delete';remove.dataset.deleteDiagramId=entry.id;remove.disabled=libraryBusy;remove.setAttribute('aria-label','删除已保存交换图：'+entry.name);const icon=el('svg',{viewBox:'0 0 24 24','aria-hidden':'true'},remove);el('path',{d:'M6 6l12 12M18 6 6 18'},icon);remove.onclick=event=>{event?.preventDefault();event?.stopPropagation();return deleteSavedDiagram(entry.id);};row.append(button,remove);results.append(row);}if(!filtered.length){const empty=document.createElement('p');empty.className='hint';empty.textContent=libraryEntries.length?'未找到匹配的交换图':'尚无已保存交换图';results.append(empty);}}
function savedEntryEqual(a,b){const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(key=>[key,canonical(v[key])])):v;return JSON.stringify(canonical(a))===JSON.stringify(canonical(b));}
function removeLibraryUndo(action){const index=history.indexOf(action);if(index>=0)history.splice(index,1);$('undo').disabled=!history.length;}
async function deleteSavedDiagram(id){return libraryAction(async()=>{
 cancelLibraryDecision();const visible=libraryEntries.find(entry=>entry.id===id);if(!visible)throw Error('记录列表已变化，请刷新后重试。');const store=libraryStore(),raw=await store.get(id);if(!raw)throw Error('该记录已不存在，请刷新列表。');const entry=DiagramLibrary.normalize(raw,validate);if(!savedEntryEqual(entry,visible))throw Error('该记录已在其他页面更新，请刷新后再删除。');
 const action={kind:'saved-diagram-delete',entry:clone(entry)};history.push(action);$('undo').disabled=false;
 try{await store.remove(id);}catch(error){let retained=true;try{const still=await store.get(id);if(still&&savedEntryEqual(DiagramLibrary.normalize(still,validate),entry)){removeLibraryUndo(action);retained=false;}}catch{}if(retained){if(history.length>100)history.shift();future=[];}try{await refreshLibrary(undefined,false);}catch{}throw Error('删除未能确认：'+error.message+(retained?'。备份已保留，可按 Ctrl+Z 尝试恢复。':'。原记录仍在。'));}
 if(history.length>100)history.shift();future=[];
 try{await refreshLibrary(undefined,false);}catch(error){libraryFeedback('已删除“'+entry.name+'”，可 Ctrl+Z 撤销；列表刷新失败：'+error.message,true);message('已删除保存记录，可 Ctrl+Z 撤销');return;}
 libraryFeedback('已删除“'+entry.name+'”。按 Ctrl+Z 可撤销删除，当前画布不变。');message('已删除保存记录：'+entry.name+'；Ctrl+Z 撤销');
 });}
async function undoSavedDiagramDeletion(action){if(libraryBusy){libraryFeedback('正在读写保存记录，请完成后再撤销。',true);return;}return libraryAction(async()=>{
 const entry=DiagramLibrary.normalize(action.entry,validate),store=libraryStore(),existing=await store.get(entry.id);
 if(existing){if(!savedEntryEqual(DiagramLibrary.normalize(existing,validate),entry))throw Error('该位置已有不同记录，未自动覆盖。删除备份仍保留。');}
 else{const records=await store.list();if(records.some(item=>item&&item.id!==entry.id&&item.name===entry.name))throw Error('已存在同名交换图，未自动覆盖；删除备份仍保留，请处理同名记录后重试。');await store.put(entry);}
 removeLibraryUndo(action);try{await refreshLibrary(entry.id,false);}catch(error){libraryFeedback('已恢复“'+entry.name+'”，但列表刷新失败：'+error.message,true);return;}
 libraryFeedback('已撤销删除，恢复“'+entry.name+'”。');message('已撤销删除：'+entry.name);
 });}
function closeLibraryPanel(panel,button){$(panel).hidden=true;$(button).setAttribute('aria-expanded','false');}
function captureDiagram(){return DiagramLibrary.snapshot(model,camera,{dirty:sourceDirty,text:$('output').value});}
async function writeNamedDiagram(name,existing){
 const store=libraryStore();
 if(existing){const latest=await store.get(existing.id);if(!latest||latest.updatedAt!==existing.updatedAt)throw Error('该记录已在其他页面更新，请刷新列表后重试。');}
 const now=Date.now(),entry={schema:1,id:existing?.id||('d-'+(crypto.randomUUID?crypto.randomUUID():now.toString(36)+'-'+Math.random().toString(36).slice(2))),name,createdAt:existing?.createdAt||now,updatedAt:Math.max(now,(existing?.updatedAt||0)+1),snapshot:captureDiagram()};
 DiagramLibrary.normalize(entry,validate);
 const stored=await store.put(entry);DiagramLibrary.normalize(stored,validate);cancelLibraryDecision();
 // A successful durable write is still a save if refreshing the list fails.
 try{await refreshLibrary(entry.id,false);}catch(error){libraryFeedback('“'+name+'”已保存并回读确认，但列表刷新失败：'+error.message,true);return;}
 libraryFeedback('已保存“'+name+'”。节点、连线、标签、样式、布局及源码草稿均已记录。');message('已保存交换图：'+name);closeLibraryPanel('savePanel','toggleSave');
}
$('saveDiagram').onclick=()=>libraryAction(async()=>{
 cancelLibraryDecision();const name=$('diagramName').value.trim().normalize('NFC');if(!name)throw Error('请先填写交换图名称。');if(name.length>100)throw Error('名称最多 100 个字符。');
 await refreshLibrary(undefined,false);const sameName=libraryEntries.filter(entry=>entry.name===name);if(sameName.length>1)throw Error('存在多个同名记录，请换一个名称保存，避免覆盖错误记录。');
 if(sameName.length){const existing=sameName[0];askLibraryDecision('已有“'+name+'”。覆盖会替换这幅已保存交换图；当前画布不会改变。','确认覆盖',()=>libraryAction(()=>writeNamedDiagram(name,existing)));return;}
 await writeNamedDiagram(name,null);
});
async function loadNamedDiagram(id){const raw=await libraryStore().get(id);if(!raw)throw Error('该交换图已不存在，请刷新列表。');const entry=DiagramLibrary.normalize(raw,validate),saved=entry.snapshot;
 // Parse and validate everything before touching the active drawing.
 rememberDiagramLoad();model=saved.model;selection=null;fontOverrides={cells:true,labels:true};sourceDirty=saved.source.dirty;
 if(sourceDirty)$('output').value=saved.source.text;
 camera={...saved.camera};refresh();panels();sourceRevision=canvasRevision;saveSourceDraft();
 $('diagramName').value=entry.name;cancelLibraryDecision();
 libraryFeedback('已加载“'+entry.name+'”，可以继续编辑。'+(sourceDirty?' 已恢复未应用源码，请先检查再决定是否应用。':''));message('已载入交换图：'+entry.name);closeLibraryPanel('loadPanel','toggleLoad');
}
$('loadDiagram').onclick=()=>libraryAction(async()=>{cancelLibraryDecision();const id=$('savedDiagram').value;if(!id)throw Error('请先选择已保存的交换图。');const entry=libraryEntries.find(item=>item.id===id);if(!entry)throw Error('保存列表已变化，请刷新后重试。');
 if(model.nodes.length||model.edges.length||sourceDirty){askLibraryDecision('加载“'+entry.name+'”将替换当前画布和源码草稿。尚未保存的内容请先命名保存；Ctrl+Z 可整体恢复载入前的画布、源码草稿和视图。','加载并替换',()=>libraryAction(()=>loadNamedDiagram(id)));return;}
 await loadNamedDiagram(id);
});
$('confirmLibraryAction').onclick=()=>{const action=libraryDecision;if(action)return action();};
$('cancelLibraryAction').onclick=()=>{cancelLibraryDecision();libraryFeedback('已取消，未修改当前图或保存记录。');};
$('refreshDiagrams').onclick=()=>libraryAction(async()=>{cancelLibraryDecision();await refreshLibrary();});
$('savedDiagram').onchange=()=>{cancelLibraryDecision();libraryButtons();};$('diagramName').oninput=cancelLibraryDecision;
$('diagramSearch').oninput=()=>{cancelLibraryDecision();renderLibraryResults();};
for(const id of ['toggleSource','toggleParams'])$(id).addEventListener('click',cancelLibraryDecision);
$('toggleSave').addEventListener('click',()=>{cancelLibraryDecision();if(!$('savePanel').hidden){const name=$('diagramName');name.focus({preventScroll:true});name.setSelectionRange(0,name.value.length);}});
$('toggleLoad').addEventListener('click',async()=>{cancelLibraryDecision();if(!$('loadPanel').hidden){$('diagramSearch').value='';await libraryAction(()=>refreshLibrary());if(!$('loadPanel').hidden)$('diagramSearch').focus({preventScroll:true});}});
$('closeSave').onclick=()=>{cancelLibraryDecision();closeLibraryPanel('savePanel','toggleSave');};
$('diagramName').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing){event.preventDefault();void $('saveDiagram').onclick();}});
libraryButtons();
