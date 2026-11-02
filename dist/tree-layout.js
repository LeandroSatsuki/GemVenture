// Projection of the existing network only. Never mutate domain nodes or edges.
import {talentNetwork,TALENT_SECTORS} from './talents.js';
import {SKILLS} from './core.js';
export const TREE_LAYOUT=Object.freeze({originRadius:136,skillRadius:46,selectedRadius:52,selectionHalo:13,initialZoom:.6});
const origin=1500;
const polar=(radius,angle)=>({x:origin+Math.cos(angle)*radius,y:origin+Math.sin(angle)*radius});
const skillSlots=[[264,0],[405,-18],[405,18],[550,-12],[550,12],[650,0]];
export function projectTreeNetwork(network){
  return {nodes:network.nodes.map(n=>{
    if(n.kind==='root')return {...n};
    if(n.kind==='skill'){
      const index=TALENT_SECTORS[n.sector].skills.indexOf(n.id);
      if(index<0||index>=skillSlots.length)throw Error('Skill needs presentation slot: '+n.id);
      const [radius,offset]=skillSlots[index];
      return {...n,...polar(radius,(n.sector*60-90+offset)*Math.PI/180)};
    }
    const dx=n.x-origin,dy=n.y-origin,radius=Math.hypot(dx,dy);
    const expanded=850+(radius-460)*(540/930);
    return {...n,...polar(expanded,Math.atan2(dy,dx)-Math.PI/8)};
  }),edges:network.edges.map(e=>[...e])};
}
let positions;
export function treePresentationPoint(node){
  positions??=new Map(projectTreeNetwork(talentNetwork(SKILLS)).nodes.map(n=>[n.id,n]));
  return positions.get(node.id)??node;
}
export function applyTreeProjection(root){
  if(root.querySelector?.('[data-compact-talents]'))return;
  const network=projectTreeNetwork(talentNetwork(SKILLS));
  const byId=new Map(network.nodes.map(n=>[n.id,n]));
  root.querySelectorAll('[data-talent]').forEach(button=>{
    const n=byId.get(button.dataset.talent);
    button.style.left=n.x+'px';button.style.top=n.y+'px';
  });
  // TalentView emits edges in this exact order; preserve all 513 connections.
  const paths=root.querySelectorAll('.web-edges path');
  if(paths.length!==network.edges.length)throw Error('Unexpected edge count');
  network.edges.forEach(([a,b],i)=>{
    const p=byId.get(a),q=byId.get(b);
    paths[i].setAttribute('d',`M${p.x},${p.y} L${q.x},${q.y}`);
  });
}
