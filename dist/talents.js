import {P} from './palette.js';

export const TALENT_SECTORS=[
 {name:'CADÊNCIA',color:P.cyan,icon:'ear',skills:['ear','breath','dash','guard','flow'],effects:['timing','breath','rhythmGuard']},
 {name:'FRENESI',color:P.pink,icon:'fury',skills:['force','shatter','stun','chain','fury'],effects:['critical','criticalPower','lowLifePower']},
 {name:'RESSONÂNCIA',color:P.orange,icon:'echo',skills:['echo','thunder','bossbane'],effects:['procPower','burnPower','bossPower']},
 {name:'VIGÍLIA',color:P.yellow,icon:'guard',skills:['revive','starter','renewal'],effects:['potion','lowLifeGuard','shield']},
 {name:'LAPIDAÇÃO',color:P.lime,icon:'gem',skills:['fortune','gemcraft','geologist','caravan'],effects:['rareYield','focusYield','salvage']},
 {name:'SIMBIOSE',color:P.blue,icon:'seed',skills:['harvest','seed','symbiosis','hunter','questluck'],effects:['killHeal','xp','vision']}
];
export const TALENT_EFFECTS={
 timing:{name:'JANELA DE RITMO',unit:'ms',minor:.5,major:2,cap:18},
 breath:{name:'FÔLEGO POR ACERTO',unit:'',minor:.025,major:.12,cap:1},
 rhythmGuard:{name:'PROTEÇÃO DO FÔLEGO',unit:'%',minor:.003,major:.014,cap:.22},
 critical:{name:'CHANCE CRÍTICA',unit:'%',minor:.002,major:.012,cap:.2},
 criticalPower:{name:'DANO CRÍTICO EXTRA',unit:'%',minor:.01,major:.045,cap:.7},
 lowLifePower:{name:'DANO COM VIDA BAIXA',unit:'%',minor:.01,major:.05,cap:.6},
 procPower:{name:'DANO DAS EXPLOSÕES',unit:'%',minor:.008,major:.04,cap:.6},
 burnPower:{name:'DANO DE QUEIMADURA',unit:'%',minor:.012,major:.06,cap:.8},
 bossPower:{name:'DANO EM CHEFES',unit:'%',minor:.006,major:.03,cap:.4},
 potion:{name:'CURA DAS POÇÕES',unit:'%',minor:.006,major:.03,cap:.4},
 lowLifeGuard:{name:'DEFESA COM VIDA BAIXA',unit:'%',minor:.004,major:.018,cap:.25},
 shield:{name:'DURAÇÃO DO ESCUDO',unit:'s',minor:.05,major:.25,cap:2},
 rareYield:{name:'SAQUE DOS VEIOS RAROS',unit:'%',minor:.008,major:.04,cap:.45},
 focusYield:{name:'CRISTAL DO BIOMA',unit:'%',minor:.006,major:.03,cap:.35},
 salvage:{name:'RESGATE NA DERROTA',unit:'%',minor:.001,major:.005,cap:.08},
 killHeal:{name:'VIDA POR CRIATURA',unit:'',minor:.04,major:.2,cap:2},
 xp:{name:'EXPERIÊNCIA',unit:'%',minor:.006,major:.03,cap:.35},
 vision:{name:'CAMPO DE VISÃO',unit:'%',minor:.005,major:.025,cap:.25},
 abyssPower:{name:'PODER NO ABISMO',unit:'%',minor:0,major:0,cap:Infinity}
};
const nodes=[],edges=[];const point=(radius,angle)=>({x:1500+Math.cos(angle)*radius,y:1500+Math.sin(angle)*radius});
const link=(a,b)=>{if(a!==b&&!edges.some(e=>e.includes(a)&&e.includes(b)))edges.push([a,b]);};
// Eight concentric webs, 24 nodes per ring, with lateral and diagonal routes.
for(let ring=0;ring<8;ring++)for(let spoke=0;spoke<24;spoke++){
 const sector=Math.floor(spoke/4),notable=ring%2===1&&spoke%4===2,effect=TALENT_SECTORS[sector].effects[(ring+spoke)%3];
 const id=`web-${ring}-${spoke}`,name=TALENT_EFFECTS[effect].name;
 nodes.push({id,name,sector,kind:notable?'notable':'minor',effect,amount:TALENT_EFFECTS[effect][notable?'major':'minor'],max:notable?3:3,ring,...point(460+ring*110,spoke*Math.PI/12-Math.PI/2)});
 link(id,`web-${ring}-${(spoke+1)%24}`);
 if(ring){link(id,`web-${ring-1}-${spoke}`);if(spoke%2===ring%2)link(id,`web-${ring-1}-${(spoke+1)%24}`);}
}
for(let sector=0;sector<6;sector++){
 const id='mastery-'+sector;nodes.push({id,name:['PULSO ETERNO','FÚRIA ETERNA','ECO ETERNO','GUARDA ETERNA','BRILHO ETERNO','VIDA ETERNA'][sector],sector,kind:'mastery',effect:TALENT_SECTORS[sector].effects[1],amount:0,max:Infinity,ring:8,...point(1390,(sector*4+1.5)*Math.PI/12-Math.PI/2)});link(id,`web-7-${sector*4+1}`);link(id,`web-7-${sector*4+2}`);
}
export const TALENTS=Object.freeze(nodes.map(Object.freeze));
export const TALENT_SIZE=3000;
export const createTalents=()=>({version:1,revision:0,ranks:{},spent:{}});
let network;
export function talentNetwork(skills){if(network)return network;const all=[{id:'root',name:'ORIGEM',kind:'root',x:1500,y:1500,sector:0},...TALENTS],connections=edges.map(e=>[...e]);
 for(let sector=0;sector<6;sector++){const group=TALENT_SECTORS[sector];group.skills.forEach((id,index)=>{const skill=skills.find(k=>k.id===id);if(!skill)return;const angle=(sector*4+index/(group.skills.length-1||1)*2.6+.2)*Math.PI/12-Math.PI/2;all.push({...skill,...point(205+(index%2)*100,angle),kind:'skill',sector});connections.push([id,`web-0-${sector*4+Math.min(3,index)}`]);for(const p of skill.parents)connections.push([p,id]);});}
 const unique=[...new Map(connections.map(e=>[[...e].sort().join('|'),e])).values()];network={nodes:all,edges:unique};return network;
}
export const talentRank=(s,id)=>id==='root'?1:id.startsWith('web-')||id.startsWith('mastery-')?(s.talents?.ranks[id]||0):s.unlocked.includes(id)?(s.skillRanks?.[id]||1):0;
export function talentConnected(s,id,skills){return talentNetwork(skills).edges.some(([a,b])=>(a===id&&talentRank(s,b)>0)||(b===id&&talentRank(s,a)>0));}
export function talentCost(s,id){const node=TALENTS.find(n=>n.id===id),rank=talentRank(s,id);if(!node)return 0;return node.kind==='mastery'?Math.min(1e9,5+Math.floor(rank/5)+Math.floor(rank*rank/200)):node.kind==='notable'?3+rank:1+Math.floor(node.ring/3)+rank;}
export function buyTalent(s,id,skills){const n=TALENTS.find(n=>n.id===id),rank=talentRank(s,id),cost=talentCost(s,id);if(s.run&&!s.run.rest?.active&&!s.run.recovery?.active||!n||rank>=n.max||rank>=1000000||!talentConnected(s,id,skills)||s.experience.points<cost)return false;s.talents??=createTalents();s.experience.points-=cost;s.talents.ranks[id]=rank+1;s.talents.spent[id]=(s.talents.spent[id]||0)+cost;s.talents.revision=(s.talents.revision||0)+1;return true;}
export function refundTalent(s,id,skills){if(s.run)return false;const rank=talentRank(s,id);if(!rank||!TALENTS.some(n=>n.id===id))return false;const candidate={...s,talents:{...s.talents,ranks:{...s.talents.ranks,[id]:rank-1}}};if(rank===1){const net=talentNetwork(skills),seen=new Set(['root',...s.unlocked]),queue=[...seen];for(let i=0;i<queue.length;i++)for(const [a,b]of net.edges){const next=a===queue[i]?b:b===queue[i]?a:null;if(next&&!seen.has(next)&&talentRank(candidate,next)){seen.add(next);queue.push(next);}}if(Object.keys(candidate.talents.ranks).some(k=>talentRank(candidate,k)&&!seen.has(k)))return false;}
 const refund=talentCost(candidate,id);if((s.talents.spent[id]||0)<refund)return false;s.experience.points+=refund;s.talents.spent[id]-=refund;if(rank===1){delete s.talents.ranks[id];delete s.talents.spent[id];}else s.talents.ranks[id]--;s.talents.revision=(s.talents.revision||0)+1;return true;}
export function talentEffects(s){const totals=Object.fromEntries(Object.keys(TALENT_EFFECTS).map(k=>[k,0]));for(const [id,rank]of Object.entries(s.talents?.ranks||{})){const node=TALENTS.find(n=>n.id===id);if(!node)continue;if(node.kind==='mastery'){totals.abyssPower+=Math.log2(1+rank)*.035;totals[node.effect]+=TALENT_EFFECTS[node.effect].major*Math.log2(1+rank);}else totals[node.effect]+=node.amount*rank;}for(const [id,def]of Object.entries(TALENT_EFFECTS))totals[id]=Math.min(def.cap,totals[id]);return totals;}
export function talentText(n,rank=1){if(n.kind==='mastery')return 'Poder no Abismo e '+TALENT_EFFECTS[n.effect].name.toLowerCase()+'. Ganhos decrescentes.';const def=TALENT_EFFECTS[n.effect],v=n.amount*rank*(def.unit==='%'?100:1);return '+'+Number(v.toFixed(2)).toLocaleString('pt-BR')+def.unit+' '+def.name.toLowerCase();}
export function restoreTalents(raw){if(raw===undefined)return createTalents();if(!raw||raw.version!==1||!raw.ranks||!raw.spent||Array.isArray(raw.ranks)||Array.isArray(raw.spent))return null;const t=createTalents();for(const [id,rank]of Object.entries(raw.ranks)){const n=TALENTS.find(n=>n.id===id);if(!n||!Number.isSafeInteger(rank)||rank<1||rank>Math.min(n.max,1000000)||!Number.isSafeInteger(raw.spent[id])||raw.spent[id]!==talentInvestment(n,rank))return null;t.ranks[id]=rank;t.spent[id]=raw.spent[id];}if(Object.keys(raw.spent).some(id=>!t.ranks[id]))return null;return t;}

export function talentInvestment(n,rank){let total=0;for(let i=0;i<rank;i++)total+=n.kind==='mastery'?Math.min(1e9,5+Math.floor(i/5)+Math.floor(i*i/200)):n.kind==='notable'?3+i:1+Math.floor(n.ring/3)+i;return total;}
