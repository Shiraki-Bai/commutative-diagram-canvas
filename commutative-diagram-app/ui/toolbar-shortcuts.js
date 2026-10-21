/* Reuse button handlers; do not hijack text editing shortcuts. */
(()=>{'use strict';const shortcuts={z:{id:'undo',label:'撤销'},l:{id:'fit',label:'定位'},e:{id:'clear',label:'清空'},s:{id:'download',label:'下载代码'},q:{id:'remove',label:'删除选中对象'}};
for(const [key,action]of Object.entries(shortcuts)){const button=document.getElementById(action.id),text=action.label+'（Ctrl+'+key.toUpperCase()+'）';button.removeAttribute('title');button.dataset.tooltip=text;button.setAttribute('aria-label',text);button.setAttribute('aria-keyshortcuts','Control+'+key.toUpperCase());}
function isEditing(event){return event.composedPath().some(node=>node instanceof Element&&node.matches('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'));}
document.addEventListener('keydown',event=>{if(event.defaultPrevented||event.isComposing||!event.ctrlKey||event.altKey||event.shiftKey||event.metaKey||isEditing(event))return;const action=shortcuts[event.key.toLowerCase()];if(!action)return;const target=event.target;if(target instanceof Element&&target!==document.body&&!target.closest('main'))return;
 // Consume even disabled Undo: browser must not undo page/form state instead.
 event.preventDefault();event.stopPropagation();if(event.repeat)return;const button=document.getElementById(action.id);if(button&&!button.disabled&&!button.hidden)button.click();
},true);
const canvas=document.getElementById('canvas');canvas.setAttribute('tabindex','0');canvas.addEventListener('pointerdown',()=>canvas.focus({preventScroll:true}),true);
})();
