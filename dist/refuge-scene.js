import {contactStation,contactStatue,REFUGE_STATUE_APPROACH_OFFSET_X} from './refuge-contact.js';
import {paintRefugeGroundShadow,paintRefugePlatform,REFUGE_COAST,REFUGE_BOUNDARY,REFUGE_BOUNDARY_ERROR,refugeFoundation,refugeArtY} from './refuge-terrain.js';
// Local paint units = World /2. Art, input and navigation consume one layout.
export const REFUGE_SIZE=Object.freeze({width:2000,height:1240});
export const REFUGE_SPAWN=Object.freeze({x:450,y:370});
export const REFUGE_EXPANSION_ZONES=Object.freeze([{x:325,y:345,width:70,height:65},{x:620,y:465,width:70,height:50}].map(Object.freeze));
export const REFUGE_SHORE=REFUGE_COAST;
export const REFUGE_STATIONS=Object.freeze([
 {id:'forge',name:'FORJA',type:'forge',x:300,y:265,width:120,height:146},
 {id:'tree',name:'ÁRVORE DE ECOS',type:'tree',x:500,y:200,width:130,height:165,foundationWidth:85},
 {id:'lift',name:'ELEVADOR',type:'lift',x:700,y:265,width:105,height:156},
 {id:'well',name:'POÇO DOS DESEJOS',type:'well',x:245,y:365,width:95,height:113,approach:{x:265,y:403}},
 {id:'miner',name:'MINERADORA',type:'miningMachine',x:380,y:415,width:75,height:101,foundationFront:14},
 {id:'missions',name:'MISSÕES',type:'board',x:500,y:455,width:90,height:106,foundationSlopes:[.30,.70]},
 {id:'zag',name:'ZAG',type:'roulette',x:690,y:405,width:95,height:140,foundationWidth:84,hit:{x:718,y:346,width:168,height:168}},
 {id:'stars',name:'RELICÁRIO',type:'shrine',x:780,y:340,width:80,height:129},
 {id:'records',name:'VITROLA',type:'gramophone',x:610,y:295,width:75,height:95,hit:{x:610,y:268,width:87,height:56}}
].map(contactStation).map(s=>Object.freeze({...s,artY:refugeArtY(s),approach:Object.freeze(s.approach??{x:s.x,y:s.y+(s.foundationFront??10)+28})})));
// Approved copper art; provisional account-score query wired in this isolated candidate only.
export const REFUGE_STATUE=Object.freeze(contactStatue({x:520,y:350,width:74,height:104,baseWidth:88,baseDepth:44,baseHeight:10,pending:false,artStatus:'copper-initial-human-approved',scoreInteractionPending:false}));
// Semantic lists include the one existing statue; rendering/base/obstacle lists do not duplicate it.
export const REFUGE_STATUE_INTERACTION=Object.freeze({id:'statue',name:'ESTÁTUA',type:'statueCopper',x:REFUGE_STATUE.x,y:REFUGE_STATUE.y,artY:REFUGE_STATUE.y,width:REFUGE_STATUE.width,height:REFUGE_STATUE.height,approach:Object.freeze({x:REFUGE_STATUE.x+REFUGE_STATUE_APPROACH_OFFSET_X,y:REFUGE_STATUE.y+28})});
export const REFUGE_INTERACTIONS=Object.freeze([...REFUGE_STATIONS,REFUGE_STATUE_INTERACTION]);
export const REFUGE_HOTSPOTS=Object.freeze(REFUGE_INTERACTIONS.map(s=>Object.freeze({id:s.id,name:s.name,x:(s.hit?.x??s.x)*2,y:(s.hit?.y??s.artY-s.height/2)*2,w:(s.hit?.width??s.width+12)*2,h:(s.hit?.height??s.height+12)*2,labelY:(s.y+20)*2})));
export const REFUGE_STATUE_GROUND=Object.freeze([[570,1072],[920,1220],[565,1392],[215,1223]].map(([x,y])=>Object.freeze([REFUGE_STATUE.x+(x-565)*74/851,REFUGE_STATUE.y+(y-1392)*74/851])));
const pavingExclusions=Object.freeze([REFUGE_STATUE_GROUND]);
export const REFUGE_PROPS=Object.freeze([
 ...REFUGE_STATIONS.map(s=>[s.type,s.x,s.artY,s.width]),['zag',758,415,43],['statueCopper',REFUGE_STATUE.x,REFUGE_STATUE.y,REFUGE_STATUE.width],
 ['grove',225,288,48],['grove',400,190,48],['grove',620,440,43],
 ['bush',170,321,31],['bush',370,190,25],['bush',590,200,28],['bush',590,455,26]
].map(Object.freeze));
export const REFUGE_ANCHORS=Object.freeze(Object.fromEntries(REFUGE_STATIONS.filter(s=>['well','zag','records'].includes(s.id)).map(s=>[({zag:'roulette',records:'gramophone'})[s.id]??s.id,Object.freeze({x:s.x,y:s.artY,width:s.width})])));
export const REFUGE_LIGHTS=Object.freeze([{kind:'crystal',x:REFUGE_ANCHORS.well.x,y:REFUGE_ANCHORS.well.y-REFUGE_ANCHORS.well.width*.63}].map(Object.freeze));
export const REFUGE_INTERACTIVE_PARTS=Object.freeze([...REFUGE_INTERACTIONS.map(s=>({id:s.id,type:s.type,x:s.x,y:s.artY,width:s.width,depth:s.artY})),{id:'zag',type:'zag',x:758,y:415,width:43,depth:415}].sort((a,b)=>a.depth-b.depth).map(Object.freeze));
export const REFUGE_PICK_PARTS=Object.freeze(REFUGE_PROPS.map(([type,x,y,width])=>Object.freeze({id:REFUGE_INTERACTIONS.find(s=>s.type===type)?.id??(type==='zag'?'zag':null),type,x,y,width,depth:y})).sort((a,b)=>a.depth-b.depth));
export const REFUGE_NAVIGATION=Object.freeze({revision:5,units:'local',worldScale:2,boundary:REFUGE_BOUNDARY,boundaryError:REFUGE_BOUNDARY_ERROR,spawn:REFUGE_SPAWN,actorRadius:15.5,obstacles:Object.freeze([...REFUGE_STATIONS.map(s=>Object.freeze({id:s.id,polygon:Object.freeze(refugeFoundation(s).ground.map(Object.freeze))})),Object.freeze({id:'statue',polygon:REFUGE_STATUE_GROUND})]),approaches:Object.freeze(Object.fromEntries(REFUGE_INTERACTIONS.map(s=>[s.id,s.approach]))),statue:Object.freeze({pending:false,anchor:REFUGE_STATUE})});
export function paintRefugeTerrain(c){paintRefugePlatform(c,REFUGE_SHORE,REFUGE_STATIONS,[],pavingExclusions);paintRefugeGroundShadow(c,REFUGE_STATUE_GROUND,REFUGE_STATUE.width/90);}

