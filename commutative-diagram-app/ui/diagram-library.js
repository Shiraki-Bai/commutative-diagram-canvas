/* Named editable diagram storage. No image serialization; writes are read back. */
(function(root){'use strict';
const PREFIX='diagram-library-v1:';
function copy(value){return JSON.parse(JSON.stringify(value));}
function browserStore(storage){return {
 async list(){const result=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(PREFIX)){const raw=storage.getItem(key);if(raw!==null)result.push(JSON.parse(raw));}}return result;},
 async get(id){const value=storage.getItem(PREFIX+id);return value===null?null:JSON.parse(value);},
 async put(entry){const raw=JSON.stringify(entry),key=PREFIX+entry.id;storage.setItem(key,raw);const stored=storage.getItem(key);if(stored!==raw)throw Error('写入后校验失败，无法确认已保存。');return JSON.parse(stored);},
 async remove(id){const key=PREFIX+id;storage.removeItem(key);if(storage.getItem(key)!==null)throw Error('删除后校验失败，记录仍然存在。');return true;}
};}
function hanaStore(sdk){return {
 async list(){const result=await sdk.storage.global.getAll();if(!result||typeof result.entries!=='object'||result.entries===null)throw Error('应用存储返回了无效列表。');return Object.entries(result.entries).filter(([key])=>key.startsWith(PREFIX)).map(([,value])=>copy(value));},
 async get(id){const result=await sdk.storage.global.get(PREFIX+id);if(!result||typeof result!=='object')throw Error('应用存储未返回有效读取结果。');return result.value==null?null:copy(result.value);},
 async put(entry){const key=PREFIX+entry.id,request=copy(entry),result=await sdk.storage.global.set(key,request);if(result?.ok!==true)throw Error('应用存储未确认写入。');const read=await sdk.storage.global.get(key);if(JSON.stringify(read?.value)!==JSON.stringify(request))throw Error('写入后读取校验失败，无法确认已保存。');return copy(read.value);},
 async remove(id){const key=PREFIX+id,result=await sdk.storage.global.delete(key);if(result?.ok!==true)throw Error('应用存储未确认删除。');const read=await sdk.storage.global.get(key);if(!read||typeof read!=='object')throw Error('删除后读取未返回有效结果，无法确认删除。');if(read.value!=null)throw Error('删除后回读校验失败，记录仍然存在。');return true;}
};}
function normalize(entry,validateModel){if(!entry||entry.schema!==1||typeof entry.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(entry.id)||typeof entry.name!=='string'||!entry.name.trim()||entry.name.length>100||!Number.isFinite(entry.createdAt)||!Number.isFinite(entry.updatedAt))throw Error('保存记录格式无效。');const snapshot=entry.snapshot;if(!snapshot||typeof snapshot!=='object')throw Error('缺少完整绘图数据。');const model=validateModel(copy(snapshot.model));const camera=snapshot.camera;if(!camera||!['x','y','zoom'].every(key=>Number.isFinite(camera[key]))||Math.abs(camera.x)>1e9||Math.abs(camera.y)>1e9||camera.zoom<.2||camera.zoom>3)throw Error('保存的视图位置或缩放无效。');const source=snapshot.source;if(!source||typeof source.dirty!=='boolean'||typeof source.text!=='string'||source.text.length>300000)throw Error('保存的源码草稿无效。');return {...entry,name:entry.name.trim(),snapshot:{model,camera:{...camera},source:{...source}}};}
function snapshot(model,camera,source){return {model:copy(model),camera:{x:camera.x,y:camera.y,zoom:camera.zoom},source:{dirty:!!source.dirty,text:String(source.text)}};}
const api={browserStore,hanaStore,normalize,snapshot,PREFIX};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DiagramLibrary=api;
})(typeof window==='undefined'?globalThis:window);
