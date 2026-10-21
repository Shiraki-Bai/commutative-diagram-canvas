const assert=require('assert'),P=require('./tikz-parser');let count=0;function test(fn){fn();count++;}
const sample=String.raw`\usepackage{tikz-cd}
\usepackage{amsmath, amssymb}
\usepackage{mathrsfs}
\begin{document}
\begin{tikzcd}[
 cells={font=\small},labels={font=\footnotesize},arrows={line width=.5pt},row sep=50pt,column sep=50pt
]
U \arrow[r,"a"] \arrow[d,"\alpha",swap,two heads] & X \arrow[r,"b"] \arrow[d,"f"] & Y \arrow[r,"c"] \arrow[d,"g"] & Z \arrow[r,"d"] \arrow[d,"h"] & W \arrow[d,"\beta",hook] \\
U' \arrow[r,"a'"] & X' \arrow[r,"b'"] & Y' \arrow[r,"c'"] & Z' \arrow[r,"d'"] & W'
\end{tikzcd}
\end{document}`;
test(()=>{const m=P.parse(sample);assert.equal(m.nodes.length,10);assert.equal(m.edges.length,13);assert.equal(m.edges[1].type,'epi');assert.equal(m.edges[1].lower,'\\alpha');assert.equal(m.params.cells,'small');});
test(()=>assert.equal(P.parse('```tikz\n'+sample+'\n>```\n```').nodes.length,10));
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A \arrow[r,"{f_{i,j}}","{g^*}"'] & B\end{tikzcd}`);assert.equal(m.edges[0].upper,'f_{i,j}');assert.equal(m.edges[0].lower,'g^*');});
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A\arrow[r,shift left=1.5pt,"{f}"]\arrow[r,shift left=-1.5pt,"{g}"'] & B\end{tikzcd}`);assert.equal(m.edges.length,1);assert.equal(m.edges[0].type,'double');});
test(()=>assert.equal(P.parse(String.raw`\begin{tikzcd}A\arrow[r,shift left=3pt]\arrow[r]\arrow[r,shift left=-3pt] & B\end{tikzcd}`).edges[0].type,'triple'));
test(()=>assert.equal(P.parse(String.raw`\begin{tikzcd}A \ar[dr] & \\ & B\end{tikzcd}`).edges.length,1));
test(()=>assert.equal(P.parse(String.raw`\begin{tikzcd}{}\arrow[r] & B\end{tikzcd}`).nodes[0].name,''));
test(()=>assert.throws(()=>P.parse(String.raw`\begin{tikzcd}A\arrow[r] & \end{tikzcd}`),/空单元格/));
test(()=>assert.throws(()=>P.parse(sample.replace('row sep=50pt','row sep=small')),/只支持/));
test(()=>assert.throws(()=>P.parse(sample.replace('two heads','dashed')),/不支持的箭头/));
test(()=>assert.throws(()=>P.parse(sample.replace('line width=.5pt','line width=3pt')),/0.1/));
test(()=>assert.throws(()=>P.parse(sample.replace('font=\\small','font=\\small,inner sep=2pt')),/只支持/));
test(()=>assert.throws(()=>P.parse('\\newcommand{\\a}{A}\n'+sample),/环境外/));
test(()=>assert.throws(()=>P.parse(sample+sample),/恰好一个/));
test(()=>assert.throws(()=>P.parse(String.raw`\begin{tikzcd}A \arrow[rr] & B\end{tikzcd}`),/空单元格/));
test(()=>assert.throws(()=>P.parse(String.raw`\begin{tikzcd}A \arrow[r,shift left=1pt] & B\end{tikzcd}`),/单独偏移/));
test(()=>assert.throws(()=>P.parse(String.raw`\begin{tikzcd}A \arrow[r,"f","g"] & B\end{tikzcd}`),/重复同侧/));
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A \arrow[r] & B % ignore & X
\\ C & D\end{tikzcd}`);assert.equal(m.nodes.length,4);});
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A\otimes B & \{X\}\end{tikzcd}`);assert.equal(m.nodes.length,2);});
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A\arrow[r,Rightarrow,bend left=40] & B\end{tikzcd}`);assert.equal(m.edges[0].type,'double');assert.equal(m.edges[0].bend,40);});
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A\arrow[loop above,"f"]\end{tikzcd}`);assert.equal(m.edges[0].from,m.edges[0].to);assert.equal(m.edges[0].loopSide,'above');});
test(()=>{const m=P.parse(String.raw`\begin{tikzcd}A\arrow[r,Rightarrow,double distance=2pt,postaction={draw, -, double=none, line width=0.5pt, shorten >=4pt}] & B\end{tikzcd}`);assert.equal(m.edges[0].type,'triple');});
console.log(count+' parser tests passed.');
