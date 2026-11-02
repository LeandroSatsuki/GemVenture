import {missionSlots} from './village.js';
import {ASTRAL_COST,ASTRAL_SLOTS} from './astral.js';
import {accountScoreView} from './account-score.js';
import {STATUE_FAMILY} from './statue-family-manifest.js';
const number=n=>Number.isFinite(n)?n.toLocaleString('pt-BR'):'—';
export const GUIDE_ART=Object.freeze({lift:'assets/refuge-night-v3/lift.png',forge:'assets/forge-v6/anvil-v05-attempt-3-256.png',missions:'assets/refuge-night-v3/scroll.png',tree:'assets/refuge-night-v3/echo-tree.png',stars:'assets/approved-reliquary-v1/emblem.webp',records:'assets/refuge-v1/gramophone.png'});
export const GUIDE_NAMES=Object.freeze({lift:'Elevador',forge:'Forja',missions:'Missões',tree:'Árvore dos Ecos',stars:'Relicário',records:'Vitrola',statue:'Pontuação'});
const summaries={lift:'Escolha o destino e desça.',forge:'Melhore sua picareta e seus equipamentos.',missions:'Aceite, cumpra e receba a recompensa.',tree:'Conecte talentos à sua build.',stars:'Descubra e equipe relíquias permanentes.',records:'Escolha a trilha. Ouça prévias e explore discos e álbuns.',statue:'Acompanhe seus pontos e a evolução dos elos.'};
export function approvedGuidePresentation(profile,model){
 if(!model||!Object.hasOwn(GUIDE_NAMES,model.id))return null;
 const id=model.id,score=accountScoreView(profile),albums=profile.records.albumOwned?.length||0,count=profile.records.owned.length;
 const contexts={lift:'Andares · paradas · Abismo',forge:'Contribua aos poucos. Forje quando completar.',missions:number(missionSlots(profile))+' '+(missionSlots(profile)===1?'vaga disponível':'vagas disponíveis'),tree:number(profile.experience.points)+' pontos disponíveis',stars:number(ASTRAL_COST)+' estrelas por invocação · até '+number(ASTRAL_SLOTS)+' equipadas',records:number(count)+' '+(count===1?'disco':'discos')+' na coleção'+(albums?' · '+number(albums)+' '+(albums===1?'álbum':'álbuns'):''),statue:score?number(score.total)+' pontos · '+(score.next===null?'último elo':'próximo elo: '+number(score.next)):model.status};
 return {id,name:GUIDE_NAMES[id],image:GUIDE_ART[id]||STATUE_FAMILY[Math.min(6,Math.max(0,score?.tier||0))].file,statueImage:STATUE_FAMILY[Math.min(6,Math.max(0,score?.tier||0))].file,summary:summaries[id],context:contexts[id],text:id==='records'?'Escolha a trilha entre os discos e álbuns da coleção e ouça uma prévia. Cada opção mostra como obter e o preço antes da compra.':model.text,status:id==='stars'?model.status.replace('por escolha','por invocação'):id==='records'?model.status+(albums?' Álbuns na coleção: '+number(albums)+'.':''):model.status,inRun:!!profile.run};
}
