import {P} from './palette.js';
// Shared by combat and previews. Stable IDs preserve existing saves.
export const CARDS=Object.freeze([
 {id:'muscle',name:'Braço de pedra',text:'Todos os golpes ficam mais fortes.',role:'DANO',group:'attack',icon:'force',color:P.orange},
 {id:'lucky',name:'Golpe de sorte',text:'Seus golpes podem causar dano dobrado.',role:'DANO',group:'attack',max:3,icon:'fortune',color:P.yellow},
 {id:'popcorn',name:'Pipoca mineral',text:'Seus golpes podem explodir ao redor.',role:'EXPLOSÃO',group:'attack',icon:'fury',color:P.orange},
 {id:'ricochet',name:'Pedrinha voadora',text:'Cada golpe também acerta um alvo próximo.',role:'DANO',group:'attack',icon:'echo',color:P.cyan},
 {id:'pockets',max:8,name:'Bolso sem fundo',text:'Cada cristal quebrado dá gemas extras.',role:'GEMAS',group:'utility',icon:'gem',color:P.cyan},
 {id:'candy',name:'Cristal de açúcar',text:'Quebrar cristais recupera sua vida.',role:'CURA',group:'survival',icon:'harvest',color:P.pink},
 {id:'ember',name:'Tá quentinho',text:'Seus golpes deixam o alvo queimando.',role:'FOGO',group:'attack',icon:'fury',color:P.orange},
 {id:'ice',name:'Gelo protetor',text:'Golpes podem enfraquecer inimigos e chefes.',role:'DEFESA',group:'survival',max:5,icon:'stun',color:P.cyan},
 {id:'vampire',name:'Lanchinho',text:'Derrotar inimigos recupera sua vida.',role:'CURA',group:'survival',icon:'breath',color:P.pink},
 {id:'skates',name:'Patins de pedra',text:'Você vai mais longe ao se mover.',role:'MOVIMENTO',group:'utility',max:6,icon:'dash',color:P.blue},
 {id:'elastic',name:'Ritmo fácil',text:'Fica mais fácil acertar o ritmo.',role:'RITMO',group:'utility',max:5,icon:'ear',color:P.cyan},
 {id:'secondwind',name:'Último fôlego',text:'Com pouca vida, atacar inimigos cura você.',role:'CURA',group:'survival',icon:'flow',color:P.lime},
 {id:'shell',name:'Casca grossa',text:'Ataques inimigos tiram menos vida.',role:'DEFESA',group:'survival',max:4,icon:'guard',color:P.silver},
 {id:'laser',name:'Raio de bolso',text:'Seus golpes podem soltar raios em cruz.',role:'EXPLOSÃO',group:'attack',icon:'chain',color:P.yellow},
 {id:'echohit',name:'Toc toc',text:'Seus golpes podem acertar duas vezes.',role:'DANO',group:'attack',icon:'echo',color:P.blue},
 {id:'greed',name:'Brilhou, é meu',text:'Cristais valiosos rendem ainda mais gemas.',role:'GEMAS',group:'utility',icon:'fortune',color:P.yellow},
 {id:'bombgift',name:'Presente explosivo',text:'Inimigos derrotados podem deixar bombas.',role:'BOMBAS',group:'utility',max:3,icon:'blast',color:P.orange},
 {id:'battery',name:'Elevador turbo',text:'Geodos carregam mais rápido o elevador.',role:'MINERAÇÃO',group:'utility',icon:'lift',color:P.yellow},
 {id:'sprouts',name:'Adubo suspeito',text:'Novos cristais aparecem mais rápido.',role:'MINERAÇÃO',group:'utility',max:4,icon:'seed',color:P.lime},
 {id:'revival',name:'Só mais uma',text:'Você revive quando a vida acaba.',role:'VIDA EXTRA',group:'survival',icon:'revive',color:P.pink},
 {id:'lantern',name:'Lanterna Viva',text:'Veja mais longe ao seu redor.',role:'VISÃO',group:'utility',max:3,icon:'sight',color:P.yellow}
].map(Object.freeze));
export const cardCount=(run,id)=>Math.max(0,Math.floor(run?.cards?.[id]||0));
// Healing keeps the first two copies intact, then grows slowly for long Abyss builds.
export function cardValues(id,level=1,power=1){const n=Math.max(0,level),healing=n<=2?n:2+Math.log2(n-1)*.5,heal=base=>Math.round(base*healing*10)/10;return {
 muscle:{amount:n},lucky:{chance:Math.min(.6,n*.2)},popcorn:{chance:.35,damage:4*n+Math.round(power*.5)},
 ricochet:{damage:2*n+Math.round(power*.35)},pockets:{amount:Math.min(8,n)},candy:{heal:heal(4)},ember:{damage:2*n},
 ice:{chance:.4,reduction:Math.min(.45,.2+.05*n)},vampire:{heal:heal(8)},skates:{amount:n},elastic:{amount:Math.min(40,8*n)},
 secondwind:{heal:heal(2)},shell:{reduction:Math.min(.6,.15*n)},laser:{chance:.25,damage:5*n+Math.round(power*.6)},
 echohit:{chance:.4,damage:3*n+Math.round(power*.5)},greed:{amount:7*n},bombgift:{chance:.5,amount:Math.min(3,n)},
 battery:{amount:n},sprouts:{amount:n},revival:{amount:n,heal:30},lantern:{amount:Math.min(3,n)*20}
}[id];}
export function cardLimit(card,state){if(card.id==='skates')return 6-(state?.equipped?.includes('dash')?(state.skillRanks?.dash||1):0);if(card.id==='sprouts')return state?.equipped?.includes('seed')?2:4;return card.max||16;}
export function cardOffer(random,run,state,allowed=()=>true){const pool=CARDS.filter(c=>allowed(c)&&cardCount(run,c.id)<cardLimit(c,state)),result=[];
 // Every floor offers survival, offense and one open choice.
 for(const group of ['survival','attack',null]){const options=pool.filter(c=>!result.includes(c.id)&&(!group||c.group===group));const candidates=options.length?options:pool.filter(c=>!result.includes(c.id));if(candidates.length)result.push(candidates[Math.floor(random()*candidates.length)].id);}
 return result;
}
export const activeCards=run=>CARDS.filter(c=>cardCount(run,c.id)>0);
export function cardDetail(card,level=1,power=1,previous=0,state){const v=cardValues(card.id,level,power),old=cardValues(card.id,previous,power);
 const show=(value,key)=>key==='heal'?Number(value.toFixed(1)).toLocaleString('pt-BR'):String(Math.round(value));
 const number=(key,scale=1)=>previous?show(old[key]*scale,key)+' → '+show(v[key]*scale,key):show(v[key]*scale,key);
 switch(card.id){
 case 'muscle':return '+'+number('amount')+' dano em cada golpe';
 case 'lucky':return number('chance',100)+'% de chance · dano ×2';
 case 'popcorn':case 'laser':case 'echohit':return Math.round(v.chance*100)+'% de chance · '+number('damage')+' dano';
 case 'ricochet':return number('damage')+' dano no outro alvo';
 case 'pockets':return '+'+number('amount')+' gemas por cristal';
 case 'candy':return '+'+number('heal')+' vida por cristal';
 case 'ember':return number('damage',3)+' dano de fogo ao longo do tempo';
 case 'ice':return '40% de chance · inimigo causa −'+number('reduction',100)+'% dano';
 case 'vampire':return '+'+number('heal')+' vida por inimigo';
 case 'skates':return '+'+number('amount')+' alcance de movimento';
 case 'lantern':return '+'+number('amount')+'% de alcance de visão';
 case 'elastic':return '+'+number('amount')+'% de tolerância ao ritmo';
 case 'secondwind':return '+'+number('heal')+' vida ao bater · abaixo de 40% de vida';
 case 'shell':return '−'+number('reduction',100)+'% dano recebido';
 case 'greed':return '+'+number('amount')+'% gemas nos cristais';
 case 'bombgift':return '50% de chance · +'+number('amount')+' bombas';
 case 'battery':return '+'+number('amount')+' carga por geodo';
 case 'sprouts':{const base=state?.equipped?.includes('seed')?4:6;const rate=n=>Math.round((base/Math.max(2,base-n)-1)*100);return '+'+(previous?rate(previous)+' → ':'')+rate(level)+'% velocidade de crescimento';}
 case 'revival':{const lives=Math.max(0,level-(state?.run?.cardRevives||0));return lives+(lives===1?' vida extra':' vidas extras')+' · volta com 30 de vida';}
 }
}
