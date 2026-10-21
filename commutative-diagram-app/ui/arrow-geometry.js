/* Shared path geometry: square boundaries, tangent-oriented ends, curves/loops. */
(function(root){'use strict';
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y}),sub=(a,b)=>({x:a.x-b.x,y:a.y-b.y}),mul=(a,k)=>({x:a.x*k,y:a.y*k});
const unit=a=>{const l=Math.hypot(a.x,a.y)||1;return mul(a,1/l);};
const normal=a=>({x:a.y,y:-a.x});
function boundary(center,size,toward){const u=unit(sub(toward,center)),t=(size/2+7)/Math.max(Math.abs(u.x),Math.abs(u.y),1e-6);return add(center,mul(u,t));}
function route(a,b,sa,sb,edge){let points;
 if(edge.from===edge.to){const side=edge.loopSide||'above';const v={above:{x:0,y:-1},below:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}}[side],n=normal(v),r=sa/2+7,k=Math.min(r*.58,26),reach=Math.max(85,sa*.9);const start=add(add(a,mul(v,r)),mul(n,-k)),end=add(add(a,mul(v,r)),mul(n,k));points=[start,add(add(start,mul(v,reach)),mul(n,-reach*.7)),add(add(end,mul(v,reach)),mul(n,reach*.7)),end];
 }else{const delta=sub(b,a),n=normal(unit(delta)),bend=Number(edge.bend)||0,mid=mul(add(a,b),.5),control=add(mid,mul(n,Math.hypot(delta.x,delta.y)*bend/45*.42));const p0=boundary(a,sa,control),p2=boundary(b,sb,control);points=[p0,control,p2];}
 function at(t){const q=points;if(q.length===3)return add(add(mul(q[0],(1-t)**2),mul(q[1],2*t*(1-t))),mul(q[2],t*t));return add(add(mul(q[0],(1-t)**3),mul(q[1],3*t*(1-t)**2)),add(mul(q[2],3*t*t*(1-t)),mul(q[3],t**3)));}
 function tangent(t){const q=points;if(q.length===3)return unit(add(mul(sub(q[1],q[0]),2*(1-t)),mul(sub(q[2],q[1]),2*t)));return unit(add(add(mul(sub(q[1],q[0]),3*(1-t)**2),mul(sub(q[2],q[1]),6*(1-t)*t)),mul(sub(q[3],q[2]),3*t*t)));}
 function path(offset=0,from=0,to=1){const samples=[];for(let i=0;i<=48;i++){const t=from+(to-from)*i/48,p=add(at(t),mul(normal(tangent(t)),offset));samples.push((i?'L':'M')+p.x.toFixed(3)+' '+p.y.toFixed(3));}return samples.join(' ');}
 let length=0;for(let i=1;i<=80;i++)length+=Math.hypot(...Object.values(sub(at(i/80),at((i-1)/80))));
 return {at,tangent,path,length,points};
}
function build(a,b,sa,sb,edge,width){const r=route(a,b,sa,sb,edge),stroke=Math.max(.6,width*1.6),multiple=edge.type==='double'||edge.type==='triple',half=multiple?(edge.type==='triple'?4:2.7):0,headLength=Math.max(10,stroke*5+half),headHalf=Math.max(5,half+4+stroke*.5),trim=Math.min(.4,headLength/Math.max(r.length,1));
 const shaftEnd=1-trim;const offsets=edge.type==='double'?[-half,half]:edge.type==='triple'?[-half,0,half]:[0];
 const tip=r.at(1),u=r.tangent(1),n=normal(u),base=sub(tip,mul(u,headLength));
 function chevron(point){const back=sub(point,mul(u,headLength));const left=add(back,mul(n,headHalf)),right=add(back,mul(n,-headHalf));return `M${left.x} ${left.y}L${point.x} ${point.y}L${right.x} ${right.y}`;}
 const heads=[chevron(tip)];if(edge.type==='epi')heads.push(chevron(sub(tip,mul(u,Math.max(8,headLength*.8)))));
 // Terminate each offset shaft on the EXISTING head's sloping edge.
 // The previous common truncation + inner V adapter did not meet that edge.
 const cross=(a,b)=>a.x*b.y-a.y*b.x;
 const offsetAt=(t,offset)=>add(r.at(t),mul(normal(r.tangent(t)),offset));
 const headLegs=[add(base,mul(n,headHalf)),add(base,mul(n,-headHalf))].map(back=>[back,tip]);
 function contact(offset){
  if(!offset)return {t:1,point:tip};
  let hit=null;
  for(const [start,end]of headLegs){const leg=sub(end,start);
   for(let i=1;i<=256;i++){const lo=(i-1)/256,hi=i/256,p=offsetAt(lo,offset),q=offsetAt(hi,offset),step=sub(q,p),den=cross(step,leg);if(Math.abs(den)<1e-12)continue;
    const a=cross(sub(start,p),leg)/den,b=cross(sub(start,p),step)/den;
    if(a<0||a>1||b<0||b>1)continue;
    let left=lo,right=hi,fl=cross(sub(p,start),leg);
    for(let j=0;j<40;j++){const mid=(left+right)/2,fm=cross(sub(offsetAt(mid,offset),start),leg);if(fl*fm<=0)right=mid;else{left=mid;fl=fm;}}
    const t=(left+right)/2;if(!hit||t>hit.t)hit={t,point:offsetAt(t,offset)};
   }
  }
  // Degenerate short routes: end on the head itself, never on a detached V.
  return hit||{t:shaftEnd,point:add(sub(tip,mul(u,headLength*Math.abs(offset)/headHalf)),mul(n,offset)),fallback:true};
 }
 const shaftContacts=offsets.map(offset=>multiple?contact(offset):{t:1,point:r.at(1)});
 const shafts=offsets.map((offset,index)=>{const hit=shaftContacts[index];let path=r.path(offset,0,hit.t);if(hit.fallback)path+=' L'+hit.point.x.toFixed(3)+' '+hit.point.y.toFixed(3);return path;});
 const bridge=null;
 // Hook ends EXACTLY at the shaft start. Smooth half-circle in local tangent frame.
 let hook=null;if(edge.type==='hook'){const p=r.at(0),t=r.tangent(0),v=normal(t),rad=Math.max(4,stroke*2.4);const start=add(p,mul(v,2*rad)),c1=sub(start,mul(t,rad*1.4)),c2=sub(p,mul(t,rad*1.4));hook=`M${start.x} ${start.y}C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p.x} ${p.y}`;}
 return {...r,stroke,shafts,heads,hook,bridge,offsets,headLength,headHalf,shaftContacts};
}
const api={build,route,boundary,normal,add,mul};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ArrowGeometry=api;
})(typeof window==='undefined'?globalThis:window);
