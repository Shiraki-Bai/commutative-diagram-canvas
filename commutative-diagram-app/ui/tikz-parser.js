/* Strict importer for the editor's explicitly supported tikz-cd subset. */
(function(root){
'use strict';
const FONTS=['tiny','scriptsize','footnotesize','small','normalsize','large','Large','LARGE','huge','Huge'];
function fail(message){throw Error(message);}
function escaped(s,i){let n=0;while(i>0&&s[--i]==='\\')n++;return n%2===1;}
function clean(source){const lines=source.trim().split(/\r?\n/);while(lines.length&&/^\s*(?:>\s*)*`{3,}(?:tikz|tex|latex)?\s*$/i.test(lines[0]))lines.shift();while(lines.length&&/^\s*(?:>\s*)*`{3,}\s*$/.test(lines.at(-1)))lines.pop();return lines.join('\n').replace(/(^|[^\\])(?:\\\\)*%[^\n]*/g,m=>m.slice(0,m.indexOf('%')));}
function balanced(s,start,open='{',close='}'){
 if(s[start]!==open)fail('缺少 '+open+'。');let depth=1,brace=0,quote=false;
 for(let i=start+1;i<s.length;i++){const c=s[i];if(escaped(s,i))continue;if(open==='['){if(c==='{')brace++;if(c==='}')brace--;if(c==='"'&&brace===0)quote=!quote;if(brace||quote)continue;}if(c===open)depth++;if(c===close&&--depth===0)return {inside:s.slice(start+1,i),end:i+1};}
 fail('未闭合的 '+open+close+'。');
}
// Split only at TeX top level, preserving delimiters inside names and labels.
function split(s,kind){let result=[],start=0,braces=0,squares=0,quote=false;for(let i=0;i<s.length;i++){const c=s[i];if(!escaped(s,i)){if(c==='{')braces++;if(c==='}')braces--;if(braces<0)fail('源码中有多余的右大括号。');if(!braces){if(c==='"')quote=!quote;if(!quote){if(c==='[')squares++;if(c===']')squares--;}}}if(braces||squares||quote)continue;let length=0;if(kind==='rows'&&s.slice(i,i+2)==='\\\\'&&!escaped(s,i))length=2;if(kind==='cells'&&c==='&'&&!escaped(s,i))length=1;if(kind==='options'&&c===','&&!escaped(s,i))length=1;if(length){result.push(s.slice(start,i));i+=length-1;start=i+1;}}
 if(braces||squares||quote)fail('大括号、选项方括号或标签引号未配对。');result.push(s.slice(start));return result;
}
function stripGroup(s){s=s.trim();if(s[0]==='{'){const b=balanced(s,0);if(b.end===s.length)return b.inside;}return s;}
function parseOptions(s,params){const seen=new Set();for(const item of split(s,'options').filter(x=>x.trim())){const match=/^\s*(cells|labels|arrows|row\s+sep|column\s+sep)\s*=([\s\S]*)$/.exec(item);if(!match)fail('不支持的全局选项：'+item.trim());const key=match[1].replace(/\s+/g,' '),v=match[2].trim();if(seen.has(key))fail('重复全局选项：'+key);seen.add(key);if(key==='cells'||key==='labels'){const m=/^font\s*=\s*\\([A-Za-z]+)\s*$/.exec(stripGroup(v));if(!m||!FONTS.includes(m[1]))fail(key+' 当前只支持 font=标准字号命令。');params[key]=m[1];}else{let number;if(key==='arrows'){const m=/^line\s+width\s*=\s*([\d.]+)\s*pt\s*$/.exec(stripGroup(v));if(!m)fail('arrows 当前只支持 line width=数值pt。');number=Number(m[1]);if(!Number.isFinite(number)||number<.1||number>2)fail('箭头线宽范围为 0.1–2pt。');params.width=number;}else{const m=/^([\d.]+)\s*pt$/.exec(v);number=m?Number(m[1]):NaN;if(!Number.isFinite(number)||number<0||number>1000)fail(key+' 当前只支持 0–1000pt。');params[key==='row sep'?'row':'column']=number;}}}}
function parseArrow(options){const edge={dr:0,dc:0,type:'single',upper:'',lower:'',shift:0,bend:0,loopSide:null};let hasDirection=false,hasType=false,side='upper';const occupied=new Set(),labels=[];for(let raw of split(options,'options').map(x=>x.trim()).filter(Boolean)){
 if(/^[udlr]+$/.test(raw)){if(hasDirection)fail('重复箭头方向。');hasDirection=true;for(const char of raw){if(char==='u')edge.dr--;if(char==='d')edge.dr++;if(char==='l')edge.dc--;if(char==='r')edge.dc++;}continue;}
 if(raw==='hook'||raw==='two heads'){if(hasType)fail('同一箭头出现多个类型。');hasType=true;edge.type=raw==='hook'?'hook':'epi';continue;}
 if(raw==='Rightarrow'){if(hasType)fail('重复箭头类型。');hasType=true;edge.type='double';continue;}
 if(/^double\s+distance\s*=\s*2pt$/.test(raw)){edge.tripleWidth=true;continue;}
 if(/^postaction=\{draw,-,double=none,linewidth=[\d.]+pt,shorten>=4pt\}$/.test(raw.replace(/\s+/g,''))){edge.triplePost=true;continue;}
 const bend=/^bend (left|right)(?:\s*=\s*(20|40))?$/.exec(raw);if(bend){edge.bend=(bend[1]==='left'?1:-1)*Number(bend[2]||20);continue;}
 const loop=/^loop (above|below|left|right)$/.exec(raw);if(loop){edge.loopSide=loop[1];continue;}
 if(raw==='swap'){side='lower';continue;}
 if(raw[0]==='"'){let end=1;while(end<raw.length&&(raw[end]!=='"'||escaped(raw,end)))end++;if(end===raw.length)fail('箭头标签缺少结束引号。');let tail=raw.slice(end+1).trim();if(tail&&tail!=="'")fail('不支持的标签定位选项：'+tail);const label={value:stripGroup(raw.slice(1,end)),side:tail? 'lower':null};if(!label.value)fail('请删除空的引号标签，或给出标签内容。');labels.push(label);continue;}
 const m=/^shift\s+left\s*=\s*(-?[\d.]+)\s*pt$/.exec(raw);if(m&&Number.isFinite(Number(m[1]))){if(occupied.has('shift'))fail('重复 shift left。');occupied.add('shift');edge.shift=Number(m[1]);continue;}
 fail('不支持的箭头选项：'+raw+'。暂不支持任意曲线参数、颜色、虚线、from/to 等样式。');}
 if(edge.tripleWidth||edge.triplePost){if(!(edge.tripleWidth&&edge.triplePost&&edge.type==='double'))fail('不完整的三线箭头样式。');edge.type='triple';}
 if(!edge.loopSide&&(!hasDirection||(!edge.dr&&!edge.dc)))fail('箭头需要网格方向或 loop above/below/left/right。');
 if(edge.loopSide&&(hasDirection||edge.bend))fail('自环不应同时指定网格方向或 bend。');
 for(const label of labels){const slot=label.side||side;if(edge[slot])fail('同一条箭头有重复同侧标签。');edge[slot]=label.value;}
 return edge;
}
function parseCell(s){let name='',arrows=[],cursor=0;while(cursor<s.length){const match=/\\(?:arrow|ar)(?![A-Za-z])/g;match.lastIndex=cursor;let found=null,m;while((m=match.exec(s))){if(!escaped(s,m.index)){found=m;break;}}if(!found){name+=s.slice(cursor);break;}name+=s.slice(cursor,found.index);let i=found.index+found[0].length;while(/\s/.test(s[i]||'')&&i<s.length)i++;if(s[i]!=='[')fail('仅支持 \\arrow[...] 或 \\ar[...] 写法。');const b=balanced(s,i,'[',']');arrows.push(parseArrow(b.inside));cursor=b.end;}
 name=name.trim();if(/\\(?:begin|end|node|draw|path|tikzset|tikzcdset|newcommand|def)\b/.test(name))fail('单元格中含模型无法表示的环境或绘图命令。');if(/\\(?:arrow|ar)\b/.test(name))fail('无法解析单元格中的箭头命令。');return {name:name==='{}'?'':name,arrows,present:!!name||arrows.length>0};}
function mergeArrows(raw){const result=[];const groups=new Map();for(const e of raw){const key=e.from+'>'+e.to+'@'+(e.bend||0)+'@'+(e.loopSide||'');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);}for(const group of groups.values()){
 const shifts=group.map(e=>e.shift).sort((a,b)=>a-b);let type=group.length===1?'single':group.length===2?'double':group.length===3?'triple':null;
 if(group.length>1){const expected=type==='double'?[-1.5,1.5]:type==='triple'?[-3,0,3]:[];if(shifts.length!==expected.length||shifts.some((n,i)=>n!==expected[i])||group.some(e=>e.type!=='single'))fail('多条同向箭头只支持本编辑器生成的平行双/三箭头（shift left=±1.5pt 或 ±3pt）。');}else if(group[0].shift!==0)fail('无法表示单独偏移的箭头。');
 const upper=group.filter(e=>e.upper),lower=group.filter(e=>e.lower);if(upper.length>1||lower.length>1)fail('平行箭头组存在多个同侧标签，当前模型无法完整保留。');result.push({id:'edge'+result.length,from:group[0].from,to:group[0].to,type:group.length===1?group[0].type:type,upper:upper[0]?.upper||'',lower:lower[0]?.lower||'',bend:group[0].bend||0,loopSide:group[0].loopSide||'above'});}return result;}
function parse(source,defaults={cells:'small',labels:'footnotesize',width:.5,row:50,column:50}){if(typeof source!=='string'||source.length>200000)fail('源码为空或超过 200KB。');let s=clean(source);const begins=[...s.matchAll(/\\begin\s*\{tikzcd\}/g)],ends=[...s.matchAll(/\\end\s*\{tikzcd\}/g)];if(begins.length!==1||ends.length!==1)fail('需要恰好一个完整的 tikzcd 环境。');let start=begins[0].index+begins[0][0].length,end=ends[0].index;if(end<start)fail('tikzcd 环境顺序无效。');let prefix=s.slice(0,begins[0].index),suffix=s.slice(end+ends[0][0].length);prefix=prefix.replace(/\\usepackage\s*\{([^}]+)\}/g,(_,names)=>{if(names.split(',').some(n=>!['tikz-cd','amsmath','amssymb','mathrsfs'].includes(n.trim())))fail('宏包前导当前仅支持 tikz-cd、amsmath、amssymb、mathrsfs。');return '';}).replace(/\\begin\s*\{document\}/,'');suffix=suffix.replace(/\\end\s*\{document\}/,'');if(prefix.trim()||suffix.trim())fail('环境外存在未支持的命令或文本；无法保证导出时保留。');
 // Missing global options explicitly inherit the editor panel values; this
 // is an editing convention, not an attempt to infer TeX's implicit defaults.
 const params={...defaults};while(/\s/.test(s[start]||'')&&start<s.length)start++;if(s[start]==='['){const b=balanced(s,start,'[',']');parseOptions(b.inside,params);start=b.end;}
 const body=s.slice(start,end),rows=split(body,'rows');while(rows.length&&!rows.at(-1).trim())rows.pop();if(!rows.length)fail('源码中没有节点。');const grid=rows.map(row=>split(row,'cells'));if(grid.length*Math.max(...grid.map(row=>row.length))>20000)fail('网格过大（最多 20000 个矩阵位置）。');const nodes=[],pending=[];for(let row=0;row<grid.length;row++)for(let col=0;col<grid[row].length;col++){const cell=parseCell(grid[row][col]);if(!cell.present)continue;const node={id:'node'+nodes.length,row,col,name:cell.name};nodes.push(node);for(const arrow of cell.arrows)pending.push({from:node.id,row:row+arrow.dr,col:col+arrow.dc,...arrow});}
 if(!nodes.length)fail('源码中没有节点。');const arrows=pending.map(e=>{const target=nodes.find(n=>n.row===e.row&&n.col===e.col);if(!target)fail('箭头指向空单元格或矩阵外：行 '+(e.row+1)+'，列 '+(e.col+1)+'。请在目标处填入节点（空节点用 {}）。');return {...e,to:target.id};});return {nodes,edges:mergeArrows(arrows),params};}
const api={parse,split,clean};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TikzParser=api;
})(typeof window==='undefined'?globalThis:window);
