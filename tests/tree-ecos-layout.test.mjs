import test from 'node:test';
import assert from 'node:assert/strict';
import {SKILLS} from '../dist/core.js';
import {talentNetwork,TALENT_SECTORS} from '../dist/talents.js';
import {projectTreeNetwork,treePresentationPoint,applyTreeProjection} from '../dist/tree-layout.js';
const source=talentNetwork(SKILLS),before=JSON.stringify(source),projected=projectTreeNetwork(source);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const skills=projected.nodes.filter(n=>n.kind==='skill');
test('projection preserves all node contracts and 513 original connections without mutation',()=>{
 assert.equal(JSON.stringify(source),before);assert.equal(projected.nodes.length,226);assert.deepEqual(projected.edges,source.edges);assert.equal(projected.edges.length,517);
 for(let i=0;i<source.nodes.length;i++){const{x,y,...a}=source.nodes[i],{x:px,y:py,...b}=projected.nodes[i];assert.deepEqual(a,b);assert.ok(Number.isFinite(px)&&Number.isFinite(py));}
});
test('initial skills clear the full origin ring by35–55px including selection halo at60%',()=>{
 const origin=projected.nodes.find(n=>n.id==='root');
 for(const group of TALENT_SECTORS){const n=skills.find(n=>n.id===group.skills[0]);const clearance=(distance(origin,n)-136-52-13)*.6;assert.ok(clearance>=35&&clearance<=55,`${n.id}:${clearance}`);}
});
test('every skill pair leaves at least16px beyond a selected ring and neighbor outline at60%',()=>{
 for(let i=0;i<skills.length;i++)for(let j=i+1;j<skills.length;j++){
  const gap=(distance(skills[i],skills[j])-52-13-46-3)*.6;
  assert.ok(gap>=16,`${skills[i].id}/${skills[j].id}: ${gap}`);
 }
});
test('expanded minor network clears skill halos and stays inside existing canvas',()=>{
 for(const n of projected.nodes){assert.ok(n.x>=100&&n.x<=2900&&n.y>=100&&n.y<=2900,n.id);}
 for(const skill of skills)for(const node of projected.nodes.filter(n=>n.kind==='minor'||n.kind==='notable')){
  const radius=node.kind==='notable'?40:32;
  assert.ok((distance(skill,node)-65-radius)*.6>=16,`${skill.id}/${node.id}`);
 }
});
test('DOM projection aligns each button and edge endpoint to the same projected coordinates',()=>{
 const buttons=source.nodes.map(n=>({dataset:{talent:n.id},style:{}}));
 const paths=source.edges.map(()=>({d:null,setAttribute(key,value){assert.equal(key,'d');this.d=value;}}));
 applyTreeProjection({querySelectorAll(selector){return selector==='[data-talent]'?buttons:paths;}});
 const lookup=new Map(projected.nodes.map(n=>[n.id,n]));
 buttons.forEach(b=>{const p=lookup.get(b.dataset.talent);assert.equal(b.style.left,p.x+'px');assert.equal(b.style.top,p.y+'px');});
 projected.edges.forEach(([a,b],i)=>{const p=lookup.get(a),q=lookup.get(b);assert.equal(paths[i].d,`M${p.x},${p.y} L${q.x},${q.y}`);});
 for(const n of source.nodes)assert.deepEqual(treePresentationPoint(n),lookup.get(n.id));
});
test('six starting branches fit desktop and compact map with toolbar and legend exclusion',()=>{
 for(const [width,height]of [[1083,793],[954,540]])for(const group of TALENT_SECTORS){
  const n=skills.find(n=>n.id===group.skills[0]);const x=width/2+(n.x-1500)*.6,y=height*.48+(n.y-1500)*.6,r=39;
  assert.ok(x-r>0&&x+r<width&&y-r>0&&y+r<height-56);
  assert.ok(!(x-r<390&&y-r<112),'toolbar area');
 }
});
