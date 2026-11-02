import {REFUGE_MARKUP} from './approved-refuge-markup.js';
import {STATUE_FAMILY} from './statue-family-manifest.js';
import {minerOutfitKey,outfitMarkup} from './miner-outfit.js';
import {reliquaryUnlocked,earnedStars} from './refuge-journey.js';
import {lobbyTrackLabel} from './lobby-track.js';
import {accountScoreView} from './account-score.js';
import {resourceWalletMarkup} from './refuge-hud.js';
import {nextLevelXP} from './pillars.js';
import {currentRecord} from './records.js';
import {drawPlayerPortrait,drawLobbyPlayer} from './player-appearance.js';
import {petsServiceView} from './pets-service.js';
import {missionList} from './missions.js';
import {missionSlots} from './village.js';
import {glyph} from './ui-art.js';
import {lobbyPetMarkup} from './lobby-pets.js';

const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
export const REFUGE_MAIN_ACTIONS=Object.freeze([
 {id:'forge',name:'FORJA',detail:'Aprimorar equipamentos',image:'assets/forge-v6/anvil-v05-attempt-3-256.png'},
 {id:'tree',name:'ÁRVORE',detail:'Talentos e evolução',image:'assets/refuge-night-v3/echo-tree.png'},
 {id:'stars',name:'RELICÁRIO',detail:'Melhorias com estrelas',image:'assets/approved-reliquary-v1/emblem.webp'},
 {id:'shop',name:'LOJA',detail:'Em breve',image:'assets/refuge-night-v3/bag.png'}
]);
export function createRefugeLobby({document,onAction,onMusic}){
 const root=document.createElement('section');root.id='refugeLobby';root.className='approved-refuge';root.setAttribute('aria-label','Refúgio Mágico');root.hidden=true;root.innerHTML=REFUGE_MARKUP;
 const wallet=root.querySelector('#rf-wallet');wallet.innerHTML='<div class="balance"><img src="assets/hud-v5/coin.png" alt=""><strong id="lobby-bank" data-lobby-coins></strong></div><div class="balance"><img src="assets/hud-v5/star.png" alt=""><strong data-lobby-stars></strong></div><div data-lobby-gems></div>';
 const toolbar=document.querySelector('header.game-toolbar'),toolbarHome=toolbar?.parentNode,toolbarAnchor=toolbar?document.createComment('toolbar home'):null;
 if(toolbar)toolbarHome.insertBefore(toolbarAnchor,toolbar);
 const tools=root.querySelector('[data-lobby-tools]'),decoratedTools=new Set();
 document.getElementById('stage').append(root);const actor=document.createElement('span');actor.id='refugeActorAnchor';actor.setAttribute('aria-hidden','true');root.append(actor);
 root.addEventListener('click',e=>{const a=e.target.closest('[data-refuge-action]');if(a&&!a.disabled&&!root.hidden)onAction(a.dataset.refugeAction);if(e.target.closest('[data-lobby-music]')&&!root.hidden)onMusic();});
 let walletKey='',profile=null,lastPlaying=null,lastPortrait='',motion='';
 const exact=new Intl.NumberFormat('pt-BR'),compact=new Intl.NumberFormat('pt-BR',{notation:'compact',maximumFractionDigits:1,roundingMode:'floor'}),amount=n=>n>=10000?compact.format(n):exact.format(n);
 function balance(field,value){const el=root.querySelector(field);el.textContent=amount(value);el.parentElement.setAttribute('aria-label',(field.includes('coins')?'Moedas':'Estrelas')+': '+exact.format(value));if(value>=10000)el.parentElement.title=exact.format(value);else el.parentElement.removeAttribute('title');}
 function update(s,{visible,balances,paused=false}={}){
  profile=s;root.hidden=!visible;root.inert=!visible;document.body.classList.toggle('night-refuge',!!visible);
  if(toolbar){if(visible){if(toolbar.parentNode!==tools)tools.append(toolbar);toolbar.querySelectorAll('button').forEach(b=>{if(!b.classList.contains('button')){b.classList.add('button');decoratedTools.add(b);}});}else if(toolbar.parentNode===tools){toolbarHome.insertBefore(toolbar,toolbarAnchor);decoratedTools.forEach(b=>b.classList.remove('button'));decoratedTools.clear();}}
  if(!visible)return;
  const score=accountScoreView(s),tier=Math.min(6,Math.max(0,score?.tier||0)),total=score?.total||0;
  const scoreEl=root.querySelector('[data-lobby-score]');scoreEl.textContent=amount(total);scoreEl.setAttribute('aria-label',fmt(total)+' pontos');root.querySelector('[data-lobby-statue]').src=STATUE_FAMILY[tier].file;
  const p=s.experience,amounts=balances?.materials??s.materials,key=amounts.join('|'),maximum=nextLevelXP(p.level),name=s.journey?.name||'MINERADOR';
  root.querySelector('[data-miner-name]').textContent=name;const miner=root.querySelector('[data-refuge-action=wardrobe]');miner.setAttribute('aria-label',name+' — vestiário e pets');miner.title=name;
  balance('[data-lobby-stars]',s.stars);balance('[data-lobby-coins]',balances?.bank??s.bank);
  const unlocked=reliquaryUnlocked(s),need=root.querySelector('[data-relic-need]');need.hidden=unlocked;need.textContent='★ '+Math.min(30,earnedStars(s))+'/30';root.querySelector('[data-refuge-action=stars]').dataset.unlocked=String(unlocked);
  root.querySelector('[data-lobby-level]').textContent='Nv. '+p.level;root.querySelector('[data-lobby-xp]').style.width=Math.min(100,p.xp/maximum*100)+'%';root.querySelector('[data-lobby-progress]').textContent=fmt(p.xp)+' / '+fmt(maximum);
  const bar=root.querySelector('[data-lobby-xp-bar]');bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(maximum));bar.setAttribute('aria-valuenow',String(p.xp));
  if(walletKey!==key){const gems=root.querySelector('[data-lobby-gems]');gems.innerHTML=resourceWalletMarkup(amounts,'lobby-material-');gems.querySelectorAll('.resource-balance').forEach((el,i)=>{el.classList.add('balance');el.querySelector('b').textContent=amount(amounts[i]);if(amounts[i]>=10000)el.title=fmt(amounts[i]);});walletKey=key;}
  const credit=lobbyTrackLabel();root.querySelector('[data-music-title]').textContent=credit;
  const ready=missionList(s).filter(m=>m.status==='ready').length,badge=root.querySelector('[data-mission-badge]');badge.hidden=!ready;badge.textContent=String(ready);badge.setAttribute('aria-label',ready+' recompensa'+(ready===1?'':'s')+' pronta'+(ready===1?'':'s'));root.dataset.musicPaused=String(paused);
 }
 function frame({playing=false,hidden=false,reduced=false,time=0}={}){
  const next=!hidden&&!root.hidden&&!document.hidden&&!reduced&&!document.defaultView.matchMedia('(prefers-reduced-motion:reduce)').matches?'on':'off';if(motion!==next){motion=next;root.dataset.motion=next;}
  if(hidden||root.hidden)return;
  const look=minerOutfitKey(profile);if(lastPortrait!==look&&drawPlayerPortrait(root.querySelector('[data-lobby-portrait]'),profile))lastPortrait=look;
  if(lastPlaying!==playing){lastPlaying=playing;const button=root.querySelector('[data-lobby-music]');button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',(playing?'Pausar':'Reproduzir')+' música do refúgio');button.textContent=playing?'Ⅱ':'▶';root.querySelector('[data-music-status]').textContent=playing?'TOCANDO AGORA':'MÚSICA PAUSADA';}
  const preview=document.querySelector('[data-wardrobe-player]');if(preview&&document.getElementById('dialog').open){const c=preview.getContext('2d');c.clearRect(0,0,preview.width,preview.height);drawLobbyPlayer(c,profile,240,360,280,time,{reduced,pose:'wardrobe'});}
 }
 return {root,update,frame};
}

export function wardrobeMarkup(profile,tab='miner',slot='hat'){
 const view=petsServiceView(profile),p=profile.experience;
 const pets=view.pets.map(p=>`<article class="nl-pet ${p.owned?'owned':'locked'}"><div class="nl-pet-art">${lobbyPetMarkup(p.id)}</div><div><h3>${esc(p.name)}</h3><p>${esc(p.effect)}</p><strong>${p.preview?'ARTE PRONTA — EM PREPARAÇÃO':p.equipped?'ACOMPANHANDO VOCÊ':p.owned?'DESBLOQUEADO':'PARA DESBLOQUEAR'}</strong><ul>${p.journey.steps.map(s=>`<li>${s.done?'✓':'○'} ${esc(s.label)}</li>`).join('')}</ul><button class="${p.equipped?'secondary':'primary'}" data-wardrobe-pet="${esc(p.id)}" ${p.equip.available?'':'disabled'}>${p.preview?'EM PREPARAÇÃO':p.equipped?'DESEQUIPAR':p.owned?'ACOMPANHAR':'BLOQUEADO'}</button></div></article>`).join('');
 return `<section class="nl-wardrobe gv-r2"><nav class="nl-tabs" aria-label="Seções do vestiário"><button data-wardrobe-tab="miner" aria-pressed="${tab==='miner'}">MINERADOR</button><button data-wardrobe-tab="pets" aria-pressed="${tab==='pets'}">PETS <small>${view.pets.filter(p=>p.owned).length}/${view.pets.length}</small></button></nav><div class="nl-wardrobe-layout"><div class="nl-model"><canvas data-wardrobe-player width="480" height="420" aria-label="Minerador atual com as mãos na cintura"></canvas><strong>MINERADOR · NV. ${p.level}</strong></div><div class="nl-wardrobe-detail">${tab==='pets'?pets:`${outfitMarkup(profile,slot)}<dl><div><dt>Experiência</dt><dd>${fmt(p.xp)} / ${fmt(nextLevelXP(p.level))}</dd></div><div><dt>Pontos de talento</dt><dd>${p.points}</dd></div></dl><button class="secondary" data-wardrobe-open="tree">VER TALENTOS</button><button class="secondary" data-wardrobe-open="forge">VER EQUIPAMENTOS</button>`}</div></div><p id="wardrobeStatus" role="status" aria-live="polite"></p></section>`;
}
