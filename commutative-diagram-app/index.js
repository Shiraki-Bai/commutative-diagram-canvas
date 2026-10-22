// Hana App v2 official entry-context API. No filesystem/network/model access.
export const name='commutative-diagram';
export default {
 async apply(context){
  const registration=context.tools.register({
   name:'open_diagram_editor',
   description:'打开交换图画布 App 的独立窗口，可视化编辑节点、箭头、自环和 tikz-cd 源码。',
   parameters:{type:'object',properties:{},additionalProperties:false},
   execute:async({context:callContext}={})=>{
    const callToken=callContext?.callToken;
    const windows=await context.windows.list(callToken?{callToken}:{});
    const existing=windows.find(w=>w.title==='交换图画布'&&w.state!=='closed'&&w.state!=='closing');
    if(existing){await context.windows.control({windowId:existing.windowId,action:'focus',...(callToken?{callToken}:{})});return {ok:true,windowId:existing.windowId,reused:true};}
    const window=await context.windows.create({entry:'/editor.html',title:'交换图画布',bounds:{width:1380,height:920},chrome:'native',...(callToken?{callToken}:{})});
    return {ok:true,windowId:window.windowId};
   }
  });
  if(registration?.ready)await registration.ready;
  await context.logger.info('交换图画布 1.6.0 已载入');
 }
};
