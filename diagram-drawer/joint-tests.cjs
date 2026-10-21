const assert=require('assert'),fs=require('fs'),vm=require('vm'),G=require('./arrow-geometry');
const baseline=fs.readFileSync(__dirname+'/fixtures/arrow-geometry-1.5.1.js','utf8');const sandbox={module:{exports:{}}};vm.runInNewContext(baseline,sandbox);const old=sandbox.module.exports;
function numbers(path){return path.match(/[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi).map(Number);}
function distance(p,a,b){const x=b.x-a.x,y=b.y-a.y,den=x*x+y*y,t=((p.x-a.x)*x+(p.y-a.y)*y)/den;return t>=-1e-5&&t<=1.00001?Math.hypot(p.x-a.x-t*x,p.y-a.y-t*y):Infinity;}
let joins=0,unchanged=0;for(const width of [.1,.5,2])for(const bend of [0,20,-20,40,-40])for(const type of ['single','hook','epi','double','triple'])for(const target of [{x:220,y:0},{x:0,y:220},{x:220,y:140}]){
 const a={x:0,y:0},edge={from:'a',to:'b',type,bend},now=G.build(a,target,62,62,edge,width),before=old.build(a,target,62,62,edge,width);
 assert.deepStrictEqual(JSON.parse(JSON.stringify(now.points)),JSON.parse(JSON.stringify(before.points)));assert.deepStrictEqual(now.heads,Array.from(before.heads));assert.equal(now.stroke,before.stroke);assert.equal(now.hook,before.hook);
 if(type==='single'||type==='hook'||type==='epi'){assert.deepStrictEqual(now.shafts,Array.from(before.shafts));unchanged++;continue;}
 assert.equal(now.bridge,null);const n=numbers(now.heads[0]);const left={x:n[0],y:n[1]},tip={x:n[2],y:n[3]},right={x:n[4],y:n[5]};for(const shaft of now.shafts){const ns=numbers(shaft),p={x:ns.at(-2),y:ns.at(-1)};assert(Math.min(distance(p,left,tip),distance(p,right,tip))<.002,'shaft endpoint must contact original head');joins++;}
}
for(const type of ['double','triple'])for(const loopSide of ['above','below','left','right']){const edge={from:'a',to:'a',type,loopSide};const g=G.build({x:0,y:0},{x:0,y:0},62,62,edge,.5);assert.equal(g.bridge,null);const n=numbers(g.heads[0]),left={x:n[0],y:n[1]},tip={x:n[2],y:n[3]},right={x:n[4],y:n[5]};for(const shaft of g.shafts){const s=numbers(shaft),p={x:s.at(-2),y:s.at(-1)};assert(Math.min(distance(p,left,tip),distance(p,right,tip))<.002);joins++;}}
console.log(`${joins} shaft/head contact assertions passed; ${unchanged} non-target arrow cases unchanged from 1.5.1.`);
