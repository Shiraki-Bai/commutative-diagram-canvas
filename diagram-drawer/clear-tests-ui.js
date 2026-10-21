(()=>{const checks=[];const check=(value,name)=>{if(!value)throw Error(name);checks.push(name);};
const oldConfirm=window.confirm,oldApp=window.HanaApp;let confirmCalls=0;
window.confirm=()=>{confirmCalls++;return false;};window.HanaApp={testOnly:true};
const baseline={nodes:[{id:'a',name:'A',row:0,col:0},{id:'b',name:'B',row:0,col:1}],edges:[{id:'ab',from:'a',to:'b',type:'single',upper:'f',lower:'',bend:0,loopSide:'above'}],params:{cells:'Huge',labels:'small',width:.73,row:77,column:88}};
function seed(){sourceDirty=false;model=clone(baseline);selection={kind:'node',id:'a'};history=[];future=[];refresh();panels();}
try{
seed();const params=JSON.stringify(model.params);$('clear').click();check(confirmCalls===0,'App clear never calls confirm');check(!model.nodes.length&&!model.edges.length,'App button clears nodes and edges');check(selection===null&&$('selectionPanel').hidden,'selection cleared and panel hidden');check(JSON.stringify(model.params)===params,'parameters preserved');check(history.length===1&&!$('undo').disabled,'single undo record');check(document.querySelectorAll('#canvas .node').length===0&&document.querySelectorAll('#canvas .edge').length===0,'rendered graph cleared');const saved=JSON.parse(draftStore.getItem('visual-tikzcd-v1'));check(!saved.nodes.length&&!saved.edges.length&&saved.params.row===77,'cleared draft persisted');$('undo').click();check(JSON.stringify(model)===JSON.stringify(baseline),'undo restores entire graph');
seed();$('canvas').focus();const event=new KeyboardEvent('keydown',{key:'e',ctrlKey:true,bubbles:true,cancelable:true});$('canvas').dispatchEvent(event);check(event.defaultPrevented&&!model.nodes.length&&confirmCalls===0,'CtrlE uses no-confirm App clear');check(history.length===1,'CtrlE not duplicated');
seed();$('output').value='UNAPPLIED SOURCE DRAFT';$('output').dispatchEvent(new Event('input'));$('clear').click();check(sourceDirty&&$('output').value==='UNAPPLIED SOURCE DRAFT','unapplied source preserved');
window.HanaApp=undefined;seed();$('clear').click();check(confirmCalls===0&&model.nodes.length===0&&model.edges.length===0,'standalone HTML also clears without confirmation');$('undo').click();check(JSON.stringify(model)===JSON.stringify(baseline),'standalone clear undo restores graph');
return {clearChecks:checks.length,checks};
}finally{window.confirm=oldConfirm;if(oldApp===undefined)delete window.HanaApp;else window.HanaApp=oldApp;sourceDirty=false;}
})()
