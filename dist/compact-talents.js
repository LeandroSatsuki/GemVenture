import {TALENTS,TALENT_SECTORS,TALENT_EFFECTS,talentNetwork,talentRank,talentConnected,talentCost,talentText,buyTalent,refundTalent} from './talents.js';
const groups=new Map();
for(const node of TALENTS.filter(n=>n.kind!=='mastery')){const id='branch-'+node.sector+'-'+node.effect;if(!groups.has(id))groups.set(id,[]);groups.get(id).push(node);}
const polar=(r,a)=>({x:1500+Math.cos(a)*r,y:1500+Math.sin(a)*r});
export function compactTalentNetwork(skills){
 const old=talentNetwork(skills),owner=new Map();for(const [id,ns] of groups)for(const n of ns)owner.set(n.id,id);
 const slots=[[330,0],[520,-17],[520,17],[710,-20],[710,0],[710,20]];
 const nodes=old.nodes.filter(n=>!owner.has(n.id)).map(n=>{if(n.kind==='root')return n;const sector=TALENT_SECTORS[n.sector],i=sector.skills.indexOf(n.id),[radius,offset]=n.kind==='mastery'?[1170,0]:slots[i];return {...n,...polar(radius,(n.sector*60-90+offset)*Math.PI/180)};});
 for(const [id,members] of groups){const n=members[0],i=TALENT_SECTORS[n.sector].effects.indexOf(n.effect);nodes.push({...n,id,kind:'minor',name:TALENT_EFFECTS[n.effect].name,members,max:members.reduce((v,q)=>v+q.max,0),...polar(880,(n.sector*60-90+(i-1)*20)*Math.PI/180)});}
 const edges=[...new Map(old.edges.map(([a,b])=>[owner.get(a)||a,owner.get(b)||b]).filter(([a,b])=>a!==b).map(e=>[[...e].sort().join('|'),e])).values()];// A minimal set of real domain links provides the overview. All additional
 // prerequisites remain in the model and are revealed on selection.
 const lookup=new Map(nodes.map(n=>[n.id,n])),parent=new Map(nodes.map(n=>[n.id,n.id]));
 const find=x=>parent.get(x)===x?x:find(parent.get(x));
 const overview=[];for(const e of [...edges].sort((a,b)=>Math.hypot(lookup.get(a[0]).x-lookup.get(a[1]).x,lookup.get(a[0]).y-lookup.get(a[1]).y)-Math.hypot(lookup.get(b[0]).x-lookup.get(b[1]).x,lookup.get(b[0]).y-lookup.get(b[1]).y))){const a=find(e[0]),b=find(e[1]);if(a!==b){parent.set(a,b);overview.push(e);}}
 return {nodes,edges,overview};
}
export function compactRank(s,id){return groups.has(id)?groups.get(id).reduce((sum,n)=>sum+talentRank(s,n.id),0):talentRank(s,id);}
export function nextBranchMember(s,id,skills){return groups.get(id)?.filter(n=>talentRank(s,n.id)<n.max&&talentConnected(s,n.id,skills)).sort((a,b)=>a.ring-b.ring||talentRank(s,a.id)-talentRank(s,b.id)||a.id.localeCompare(b.id))[0]||null;}
export function compactConnected(s,id,skills){return groups.has(id)?!!nextBranchMember(s,id,skills):talentConnected(s,id,skills);}
export function compactCost(s,id,skills){return talentCost(s,groups.has(id)?nextBranchMember(s,id,skills)?.id:id);}
export function compactText(n,rank=1){if(!n.members)return talentText(n,rank);return 'Melhorias agrupadas de '+TALENT_EFFECTS[n.effect].name.toLowerCase()+'. Cada nível mantém seu bônus e custo originais.';}
export function compactNextText(s,n,skills){const next=nextBranchMember(s,n.id,skills);return next?talentText(next):'';}
export function buyCompactTalent(s,id,skills){const target=groups.has(id)?nextBranchMember(s,id,skills)?.id:id;return !!target&&buyTalent(s,target,skills);}
export function refundCompactTalent(s,id,skills){if(!groups.has(id))return refundTalent(s,id,skills);for(const n of [...groups.get(id)].reverse())if(talentRank(s,n.id)&&refundTalent(s,n.id,skills))return true;return false;}
