import {TOTAL_FLOORS,FLOORS_PER_BIOME} from './campaign.js';
import {validHomeCollection,restoreHomeCollection,createHomeCollection,PET_CATALOG} from './home-collection.js';
import {earnedStars} from './refuge-journey.js';
import {validPetPower} from './pet-powers.js';
import {isFloor} from './cave-layout.js';
export const PET_RHYTHM_GOAL=100;
const count=n=>Number.isSafeInteger(n)&&n>=0;
const add=(p,k,n)=>{p[k]=Math.min(Number.MAX_SAFE_INTEGER,p[k]+n);};
const floors=a=>Array.isArray(a)&&a.length<=TOTAL_FLOORS&&new Set(a).size===a.length&&a.every(f=>Number.isInteger(f)&&f>=1&&f<=TOTAL_FLOORS);
export const createPetProgress=()=>({version:1,rocks:0,safeReturns:0,combo100Runs:0,coins:0,bankedGems:0,exploredFloors:[],undamagedFloors:[]});
export const validPetProgress=p=>!!p&&p.version===1&&['rocks','safeReturns','combo100Runs','coins','bankedGems'].every(k=>count(p[k]))&&floors(p.exploredFloors)&&floors(p.undamagedFloors);
export const createPetBonds=()=>({version:1,slime:{discovered:false,complete:false},bat:{discovered:false,complete:false},progress:createPetProgress()});
export const validPetBonds=b=>!!b&&b.version===1&&['slime','bat'].every(k=>b[k]&&typeof b[k].discovered==='boolean'&&typeof b[k].complete==='boolean'&&(!b[k].complete||b[k].discovered))&&(b.progress===undefined||validPetProgress(b.progress)||Number.isSafeInteger(b.progress?.version)&&b.progress.version>1);
export function restorePetBonds(raw){if(raw===undefined)return createPetBonds();if(validPetBonds(raw))return structuredClone(raw);if(raw&&typeof raw==='object'&&!Array.isArray(raw)&&Number.isSafeInteger(raw.version)&&raw.version>1)return structuredClone(raw);return null;}
function progress(s,create=false){if(!validPetBonds(s.petBonds)||!validHomeCollection(s.homeCollection))return null;if(s.petBonds.progress===undefined&&create)s.petBonds.progress={...createPetProgress(),coins:0,bankedGems:(s.materials||[]).reduce((a,b)=>a+b,0),combo100Runs:s.bestCombo>=100?1:0};return validPetProgress(s.petBonds.progress)?s.petBonds.progress:null;}
function runProof(s){const r=s.run;if(!r||r.trainingClock)return null;r.petJourney??={version:1,combo100Counted:false,returnRecorded:false};return r.petJourney.version===1?r.petJourney:null;}
export function restorePetState(s,raw){s.homeCollection=raw.homeCollection===undefined?createHomeCollection():restoreHomeCollection(raw.homeCollection);s.petBonds=restorePetBonds(raw.petBonds);if(!s.petBonds)return false;
 if(s.run?.petPower!==undefined&&!validPetPower(s.run.petPower)&&!(Number.isSafeInteger(s.run.petPower?.version)&&s.run.petPower.version>1))return false;
 if(s.run?.petJourney!==undefined&&!(s.run.petJourney.version===1&&typeof s.run.petJourney.combo100Counted==='boolean'&&typeof s.run.petJourney.returnRecorded==='boolean'))return false;
 if(s.run?.room?.petDamage!==undefined&&(!Number.isFinite(s.run.room.petDamage)||s.run.room.petDamage<0))return false;
 const migrating=raw.petBonds===undefined||raw.petBonds?.progress===undefined;if(migrating&&validPetBonds(s.petBonds)){s.petBonds.progress=undefined;progress(s,true);if(s.run?.peak>=100&&s.bestCombo>=100){const proof=runProof(s);if(proof)proof.combo100Counted=true;}}
 if(s.run?.petId&&validHomeCollection(s.homeCollection)&&!s.homeCollection.pets.includes(s.run.petId))s.run.petId=null;syncPetBonds(s);return true;}
// Legacy discoveries and ownership remain intact; this function never grants a pet.
export function syncPetBonds(s){const b=s.petBonds;if(!validPetBonds(b)||!validHomeCollection(s.homeCollection))return [];
 const facts={slime:Object.entries(s.descent?.records||{}).some(([f,r])=>Number(f)>=2&&r.clears>0),bat:s.descent?.bosses?.includes(5)===true},events=[];
 for(const [key,id]of [['slime','slime-friend'],['bat','bat-friend']]){if(s.homeCollection.pets.includes(id)){b[key].discovered=true;b[key].complete=true;}else if(facts[key]&&!b[key].discovered){b[key].discovered=true;events.push({type:'petDiscovered',id});}}return events;}
function requirements(s,id){const p=progress(s)||createPetProgress(),records=Object.entries(s.descent?.records||{}).filter(([f,r])=>Number(f)>=1&&Number(f)<=TOTAL_FLOORS&&r.clears>0),bosses=new Set(s.descent?.bosses||[]),biomes=a=>new Set(a.map(f=>Math.floor((f-1)/FLOORS_PER_BIOME))).size;
 const step=(id,label,value,goal)=>({id,label:label+' · '+Math.min(value,goal)+' / '+goal,done:value>=goal,value,goal});
 const table={
 'slime-friend':()=>[step('boss10','Vencer o chefe do andar 10',bosses.has(10)?1:0,1),step('safe','Voltar em segurança com saque',p.safeReturns,10)],
 'bat-friend':()=>[step('combo100','Combo 100 em expedições diferentes',p.combo100Runs,3)],
 cascalhito:()=>[step('rocks','Quebrar pedras',p.rocks,500),step('floors','Concluir andares diferentes',records.length,15)],
 fagulhito:()=>[step('explored','Explorar 100% de andares diferentes',p.exploredFloors.length,15),step('biomes','Exploração completa em biomas',biomes(p.exploredFloors),3)],
 bolota:()=>[step('missions','Concluir missões',s.missionsCompleted||0,20),step('coins','Obter moedas em expedições',p.coins,5000)],
 garim:()=>[step('gems','Guardar gemas ao longo do jogo',p.bankedGems,750),step('biomes','Concluir andares em biomas',biomes(records.map(([f])=>+f)),4)],
 nimbo:()=>[step('stars','Obter estrelas ao longo do jogo',earnedStars(s),60),step('no-damage','Concluir andares diferentes sem dano',p.undamagedFloors.length,3)],
 trufa:()=>[step('floors','Concluir andares diferentes',records.length,20),step('five-stars','Concluir andares com 5 estrelas',records.filter(([f,r])=>Math.max(r.stars||0,s.floorStars?.[f]||0)>=5).length,5)],
 mizu:()=>[step('bosses','Derrotar chefes diferentes',bosses.size,5),step('stars','Obter estrelas ao longo do jogo',earnedStars(s),75)],
 cadencio:()=>[step('combo200','Alcançar combo',s.bestCombo||0,200),step('bosses','Derrotar chefes diferentes',bosses.size,6)]};return table[id]?.()||[];}
export function petJourneyView(s,id){const valid=!!PET_CATALOG.find(p=>p.id===id)&&!!progress(s),owned=validHomeCollection(s.homeCollection)&&s.homeCollection.pets.includes(id),steps=requirements(s,id);
 return {supported:valid,owned,discovered:owned||steps.some(q=>q.done),complete:owned,steps,hint:owned?'VÍNCULO FEITO':!valid?'JORNADA INDISPONÍVEL':steps.find(q=>!q.done)?.label||'VÍNCULO PRONTO'};}
export function recordPetProgress(s){if(s.run?.trainingClock||!progress(s,true))return [];const events=syncPetBonds(s);
 for(const pet of PET_CATALOG){if(s.homeCollection.pets.includes(pet.id))continue;const steps=requirements(s,pet.id);if(steps.length&&steps.every(q=>q.done)){s.homeCollection.pets.push(pet.id);events.push({type:'petUnlocked',id:pet.id,name:pet.name});}}
 syncPetBonds(s);return events;}
export function recordPetRhythm(s){const p=progress(s,true),proof=runProof(s);if(!p||!proof)return;if(s.run.combo>=100&&!proof.combo100Counted){proof.combo100Counted=true;add(p,'combo100Runs',1);}}
export function recordPetRock(s,target){const p=progress(s,true);if(!p||s.run?.trainingClock||target.petCounted||target.type!=='rock'||target.hp>0)return;target.petCounted=true;add(p,'rocks',1);}
export function recordPetCoins(s,value){const p=progress(s,true);if(p&&!s.run?.trainingClock&&count(value))add(p,'coins',value);}
export function recordPetBank(s,materials){if(s.run?.trainingClock)return [];const p=progress(s,true);if(p&&!s.run?.trainingClock&&Array.isArray(materials)&&materials.length===4&&materials.every(count))add(p,'bankedGems',materials.reduce((a,b)=>a+b,0));return recordPetProgress(s);}
export function recordPetExploration(s){const r=s.run,p=progress(s,true);if(!r||r.mode!=='floors'||r.trainingClock||!p||!r.room.explored||r.room.petFullyExplored)return;
 const room=r.room,cols=room.cols,rows=room.rows;let total=0,seen=0;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(isFloor(room,x,y)){total++;if(room.explored[y*cols+x])seen++;}
 if(total>0&&seen===total){room.petFullyExplored=true;if(!p.exploredFloors.includes(r.floor))p.exploredFloors.push(r.floor);}}
export function recordPetClear(s){const r=s.run,p=progress(s,true);if(!r||r.mode!=='floors'||r.trainingClock||!r.room.cleared||r.room.petClearRecorded||!p)return [];r.room.petClearRecorded=true;
 if(r.room.petDamage===0&&!p.undamagedFloors.includes(r.floor))p.undamagedFloors.push(r.floor);recordPetExploration(s);return recordPetProgress(s);}
export function recordPetReturn(s,reason,keptMaterials){const r=s.run,p=progress(s,true),proof=runProof(s);if(!r||!p||!proof||proof.returnRecorded)return [];proof.returnRecorded=true;
 const loot=(s.lastResult?.kept||0)+(keptMaterials||[]).reduce((a,b)=>a+b,0)+(r.secured?.coins||0)+(r.secured?.materials||[]).reduce((a,b)=>a+b,0);if(['return','victory'].includes(reason)&&loot>0)add(p,'safeReturns',1);
 return recordPetBank(s,keptMaterials);}
