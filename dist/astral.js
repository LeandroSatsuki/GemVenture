// Stars buy permanent rule variants. Rolls are saved immediately and never use cash.
export const ASTRAL_COST=35;
export const ASTRAL_SLOTS=3;
const data=[
 ['first-light','PRIMEIRA LUZ','Comece com escudo.','guard','startShield',8],
 ['provisions','BOLSA VITAL','Comece com duas curas.','tonic','startTonic',2],
 ['powder','PÓ ESTELAR','Comece com duas bombas.','blast','startBlast',2],
 ['echo-ward','ECO PROTETOR','Comece com dois escudos.','ward','startWard',2],
 ['compass','BÚSSOLA VIVA','+20% de visão.','sight','vision',.2],
 ['anchor','ÂNCORA','Salve +8% da mochila na derrota.','guard','salvage',.08],
 ['rare-heart','CORAÇÃO DO VEIO','+35% de saque nos veios raros.','gem','rareYield',.35],
 ['homeland','PEDRA NATAL','+25% do cristal do bioma.','gem','focusYield',.25],
 ['scholar','MEMÓRIA VIVA','+25% de experiência.','ear','xp',.25],
 ['second-air','AR RESERVA','Erros tiram 12% menos fôlego.','breath','rhythmGuard',.12],
 ['precision','PONTA ESTELAR','+8% de chance crítica.','force','critical',.08],
 ['fracture','ESTRELA PARTIDA','Críticos: +35% do dano base.','shatter','criticalPower',.35],
 ['embers','BRASA ANTIGA','+35% de dano de queimadura.','fury','burnPower',.35],
 ['resonator','RESSOADOR','+25% de dano das explosões.','chain','procPower',.25],
 ['giant-slayer','QUEDA DO TITÃ','+20% de dano em chefes.','hunter','bossPower',.2],
 ['defiance','DESAFIO','+30% de dano com pouca vida.','force','lowLifePower',.3],
 ['last-wall','ÚLTIMA MURALHA','−15% dano recebido com pouca vida.','guard','lowLifeGuard',.15],
 ['spring','FONTE VITAL','+25% de cura das poções.','tonic','potion',.25],
 ['mercy','MISERICÓRDIA','+1 vida por criatura derrotada.','harvest','killHeal',1],
 ['metronome','METRÔNOMO','+0,5 fôlego por acerto.','breath','breath',.5],
 ['long-ward','GUARDA LONGA','Escudo dura +1,5 segundo.','ward','shield',1.5],
 ['titan-cache','ARSENAL','Chefes deixam uma bomba.','blast','bossBomb',1],
 ['boss-spring','VITÓRIA VIVA','Vencer um chefe cura 15 de vida.','tonic','bossHeal',15],
 ['rescue-kit','KIT DO REFÚGIO','Resgatar carga dá uma cura.','tonic','rescueTonic',1],
 ['deep-spark','FAÍSCA PROFUNDA','+15% de poder no Abismo.','fury','abyssPower',.15],
 ['rare-ward','CASCA RARA','Quebrar veio dá escudo.','ward','rareWard',1],
 ['flow-shield','COMPASSO GUARDIÃO','Combo de 40 dá proteção.','guard','comboShield',2],
 ['seeker','BUSCADOR','+25% cristais por desafio.','hunter','questYield',.25],
 ['lifeline','FIO DA VIDA','Comece com cura e escudo.','revive','supplyPair',1],
 ['conductor','CONDUTOR','+8 ms para acertar o ritmo.','ear','timing',8]
];
export const ASTRAL_RELICS=Object.freeze(data.map(([id,name,text,icon,effect,amount])=>Object.freeze({id,name,text,icon,effect,amount})));
export const createAstral=()=>({version:1,revision:0,rolls:0,owned:[],equipped:[],offer:[],last:null});
export function rollAstral(s){const a=s.astral;if(s.run||!a||a.offer.length||s.stars<ASTRAL_COST||a.owned.length===ASTRAL_RELICS.length||a.rolls>=1000000)return false;
 let seed=(s.seed^Math.imul(a.rolls+1,2654435761))>>>0;const random=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
 const pool=ASTRAL_RELICS.filter(r=>!a.owned.includes(r.id));const offer=[];while(offer.length<3&&pool.length)offer.push(pool.splice(Math.floor(random()*pool.length),1)[0].id);s.stars-=ASTRAL_COST;a.rolls++;a.offer=offer;a.last=null;return true;
}
export function chooseAstral(s,id){const a=s.astral;if(s.run||!a?.offer.includes(id)||a.owned.includes(id))return false;a.owned.push(id);a.offer=[];a.last=id;if(a.equipped.length<ASTRAL_SLOTS)a.equipped.push(id);a.revision=(a.revision||0)+1;return true;}
export function equipAstral(s,id){const a=s.astral;if(s.run||!a?.owned.includes(id))return false;if(a.equipped.includes(id))a.equipped=a.equipped.filter(k=>k!==id);else if(a.equipped.length<ASTRAL_SLOTS)a.equipped.push(id);else return false;a.revision=(a.revision||0)+1;return true;}
export function astralEffects(s){const totals={};for(const id of s.astral?.equipped||[]){const r=ASTRAL_RELICS.find(r=>r.id===id);if(r)totals[r.effect]=(totals[r.effect]||0)+r.amount;}return totals;}
export function restoreAstral(raw){if(raw===undefined)return createAstral();if(!raw||raw.version!==1||!Number.isSafeInteger(raw.rolls)||raw.rolls<0||raw.rolls>1000000)return null;for(const key of ['owned','equipped','offer'])if(!Array.isArray(raw[key])||new Set(raw[key]).size!==raw[key].length||raw[key].some(id=>!ASTRAL_RELICS.some(r=>r.id===id)))return null;if(raw.equipped.length>ASTRAL_SLOTS||raw.equipped.some(id=>!raw.owned.includes(id))||raw.offer.length>3||raw.offer.some(id=>raw.owned.includes(id))||raw.last!==null&&!raw.owned.includes(raw.last))return null;return {...raw,revision:0,owned:[...raw.owned],equipped:[...raw.equipped],offer:[...raw.offer]};}
