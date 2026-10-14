// Collectible arrangements share the expedition clock. A record changes the sound,
// never the beat used by input, enemies, or the score rail.
export const RECORDS=Object.freeze([
 {id:'pulse',name:'PRISMA PULSE',genre:'ELETRÔNICA',color:'#5ee9e9',cost:0,source:'VITROLA',groove:'pulse',previewTrack:0},
 {id:'iron',name:'FERRO EM BRASA',genre:'ROCK',color:'#ef6e10',cost:85,source:'ANDAR 5',floor:5,groove:'rock',previewTrack:3},
 {id:'aria',name:'ÁRIA DO ECO',genre:'ÓPERA',color:'#f94e6d',cost:130,source:'ANDAR 10',floor:10,groove:'opera',previewTrack:5},
 {id:'moss',name:'RAÍZES VIVAS',genre:'FLORESTA',color:'#47f641',cost:110,source:'ANDAR 15',floor:15,groove:'forest',previewTrack:1},
 {id:'amber',name:'ÂMBAR GROOVE',genre:'FUNK',color:'#ece910',cost:145,source:'ANDAR 20',floor:20,groove:'funk',previewTrack:10},
 {id:'night',name:'NOITE DE NEON',genre:'DISCO',color:'#2890dc',cost:165,source:'ANDAR 25',floor:25,groove:'disco',previewTrack:0},
 {id:'choir',name:'CORO DO MANTO',genre:'ÓPERA',color:'#fbbe82',cost:220,source:'ANDAR 30',floor:30,groove:'opera',previewTrack:7},
 {id:'storm',name:'TEMPESTADE PRISMA',genre:'METAL',color:'#e8ff75',cost:260,source:'MISSÕES',mission:true,groove:'rock',previewTrack:10},
 {id:'circuit',name:'CIRCUITO PROFUNDO',genre:'TECHNO',color:'#5ee9e9',cost:180,source:'MISSÕES',mission:true,groove:'techno',previewTrack:1},
 {id:'dusk',name:'HORIZONTE VIOLETA',genre:'SYNTHWAVE',color:'#c12458',cost:200,source:'MISSÕES',mission:true,groove:'synthwave',previewTrack:0},
 {id:'voice',name:'ECO DIGITAL',genre:'VOCAL ELETRÔNICO',color:'#f94e6d',cost:120,source:'MISSÕES',mission:true,groove:'vocalpop',previewTrack:1},
 {id:'rush',name:'BATIDA DO ABISMO',genre:'DRUM & BASS',color:'#ef6e10',cost:210,source:'MISSÕES',mission:true,groove:'dnb',previewTrack:3},
 {id:'pixel',name:'MINA 8-BIT',genre:'CHIPTUNE',color:'#ece910',cost:95,source:'MISSÕES',mission:true,groove:'chip',previewTrack:0},
 {id:'swing',name:'ZAG SWING',genre:'ELECTRO SWING',color:'#fbbe82',cost:155,source:'MISSÕES',mission:true,groove:'swing',previewTrack:0},
 {id:'turbo',name:'DESCIDA TURBO',genre:'EUROBEAT',color:'#5ee9e9',cost:235,source:'MISSÕES',mission:true,groove:'eurobeat',previewTrack:3}
]);
export const RECORD_GENRES=Object.freeze(['TODOS',...new Set(RECORDS.map(r=>r.genre))]);
export const recordById=id=>RECORDS.find(r=>r.id===id);
export const currentRecord=s=>recordById(s.records?.active)||RECORDS[0];
export const createRecords=()=>({owned:['pulse'],active:'pulse'});
export function restoreRecords(value){
 if(value===undefined)return createRecords();
 if(!value||!Array.isArray(value.owned)||value.owned.length>RECORDS.length||!value.owned.includes('pulse')||new Set(value.owned).size!==value.owned.length||value.owned.some(id=>!recordById(id))||!value.owned.includes(value.active))return null;
 return {owned:[...value.owned],active:value.active};
}
export function buyRecord(s,id){
 const record=recordById(id);
 if(s.run||!record||s.records.owned.includes(id)||s.essence<record.cost)return false;
 s.essence-=record.cost;s.records.owned.push(id);s.records.active=id;return true;
}
export function equipRecord(s,id){if(s.run||!s.records.owned.includes(id))return false;s.records.active=id;return true;}
export function grantRecord(s,id){if(!recordById(id)||s.records.owned.includes(id))return false;s.records.owned.push(id);return true;}
function roll(seed){let n=(seed>>>0)+0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}
// Boss-floor records are intentionally scarce; the same seed cannot be rerolled by
// reopening the game. Mission rolls happen only on delivery in the village.
export function floorRecordDrop(s,floor,seed){
 const record=RECORDS.find(r=>r.floor===floor);
 if(!record||s.records.owned.includes(record.id))return null;
 return roll(seed^0x57a721)<.018&&grantRecord(s,record.id)?record:null;
}
export function missionRecordDrop(s,mission){
 const candidates=RECORDS.filter(r=>r.id!=='pulse'&&(r.mission||!r.floor||s.best>=r.floor-1));
 if(!candidates.length)return null;
 const hash=[...mission.id].reduce((n,c)=>Math.imul(n^c.charCodeAt(0),16777619)>>>0,2166136261);
 const chance=mission.tier==='gold'?.035:mission.tier==='rare'?.008:.0015;
 if(roll(hash^s.seed)>=chance)return null;
 const record=candidates[Math.floor(roll(hash^0x193abc)*candidates.length)];
 return grantRecord(s,record.id)?record:null;
}
