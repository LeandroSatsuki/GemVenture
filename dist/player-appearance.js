import {minerOutfitKey} from './miner-outfit.js';
// Approved v3 base. Front-facing lobby revision 5 is a separately reviewed presentation.
// frontSha256 identifies the preserved approved cave source, not the new lobby PNG.
export const PLAYER_APPEARANCE_SOURCE=Object.freeze({id:'generated-player-miner-v1',artRevision:3,motionRevision:3,approved:true,frontSha256:'2be8873159ff4a7c4aa4ac6c69a183ae788303ff6bf21b87ddfd1cbad4c49daf',lobbyRevision:7,lobbyApproval:'pending',lobbyFrontSha256:'32c6ba3e9021ece22bc76dfba4cd280bc069c6922957d0f1f87bd955b10f494a',palette:'Cosmos64',projection:'gemventure-cave-v1'});
const appearances=new Map();
for(const hat of ['hardhat','duck'])for(const shirt of ['blue','pink']){
 const key=hat+'-'+shirt,root='assets/miner-living-v7/'+key+'/';
 appearances.set(key,Object.freeze({id:key,name:'Minerador',url:root+'front.png',frame:[320,320],ground:[160,288],height:246,portrait:[84,41,156,160],directions:1,clips:Object.fromEntries(Object.entries({idle:[168,7],wardrobe:[1,1],jamal:[192,6.4],sit:[192,8],wave:[108,4.5],step:[144,6],sway:[144,6],look:[120,5]}).map(([name,[frames,seconds]])=>[name,{url:root+name+'.png',frames,seconds,columns:frames===1?1:8}]))}));
}
export const PLAYER_APPEARANCE_EMBEDDED=Object.freeze({});
const images=new Map();
const IMAGE_CACHE_LIMIT=192*1024*1024;let activeAppearance=null;
const imageBytes=image=>(image.naturalWidth||0)*(image.naturalHeight||0)*4;
function pruneImages(keep=new Set()){
 let bytes=[...images.values()].reduce((n,image)=>n+imageBytes(image),0);
 for(const [url,image]of images){if(images.size<=4&&bytes<=IMAGE_CACHE_LIMIT)break;if(keep.has(url))continue;bytes-=imageBytes(image);images.delete(url);}
}
export function playerAppearanceCacheStatus(){return{images:images.size,decodedBytes:[...images.values()].reduce((n,image)=>n+imageBytes(image),0),maxImages:4,maxDecodedBytes:IMAGE_CACHE_LIMIT};}
export function registerPlayerAppearance(definition){
 if(!definition?.id||!definition.url||!definition.frame||!definition.ground||!definition.portrait||!definition.clips?.idle||!definition.clips?.wardrobe||!(definition.height>0))throw new TypeError('Complete player appearance required');
 appearances.set(definition.id,Object.freeze({...definition}));
}
export function resolvePlayerAppearance(profile){return appearances.get(profile?.homeCollection?.look)||appearances.get(minerOutfitKey(profile))||appearances.get('hardhat-blue');}
function imageFor(url){let image=images.get(url);if(image){images.delete(url);images.set(url,image);}else if(typeof Image!=='undefined'){image=new Image();image.src=PLAYER_APPEARANCE_EMBEDDED[url]||url;images.set(url,image);}return image?.complete&&image.naturalWidth>0?image:null;}
// A seeded schedule varies action and quiet intervals, but every authored action
// starts/ends standing. No teleport between sitting and dancing.
const schedules=new Map();
export function sampleLobbyIdle(time=0,reduced=false,pose='idle',seed=41001){
 if(pose==='wardrobe')return {name:'wardrobe',time:0};if(reduced)return {name:'idle',time:0};
 let plan=schedules.get(seed);if(!plan){plan={items:[],end:0,rng:(seed>>>0)||1,last:''};schedules.set(seed,plan);}
 const t=Math.max(0,time);
 while(plan.end<=t){plan.rng=(Math.imul(plan.rng,1664525)+1013904223)>>>0;const quiet=plan.rng%3===0?14:7;
  plan.items.push({name:'idle',start:plan.end,end:plan.end+quiet});plan.end+=quiet;
  const names=['jamal','wave','sit','step','sway','look'];plan.rng=(Math.imul(plan.rng,1664525)+1013904223)>>>0;let name=names[(plan.rng>>>16)%names.length];if(name===plan.last)name=names[(names.indexOf(name)+1)%names.length];plan.last=name;
  const duration={jamal:6.4,wave:4.5,sit:8,step:6,sway:6,look:5}[name];plan.items.push({name,start:plan.end,end:plan.end+duration});plan.end+=duration;
 }
 const item=plan.items.find(a=>t>=a.start&&t<a.end);return {name:item.name,time:t-item.start};
}
export function drawPlayerPortrait(canvas,profile){if(!canvas)return false;const rig=resolvePlayerAppearance(profile),image=imageFor(rig.url);if(!image)return false;const c=canvas.getContext('2d'),[x,y,w,h]=rig.portrait;c.clearRect(0,0,canvas.width,canvas.height);const k=Math.min(canvas.width/w,canvas.height/h);c.imageSmoothingEnabled=true;c.drawImage(image,x,y,w,h,(canvas.width-w*k)/2,(canvas.height-h*k)/2,w*k,h*k);canvas.dataset.appearance=rig.id;return true;}
export function drawLobbyPlayer(c,profile,x,y,height,time=0,{reduced=false,pose='idle',direction=0}={}){
 const rig=resolvePlayerAppearance(profile),p=sampleLobbyIdle(time,reduced,pose,profile?.seed||41001),clip=rig.clips[p.name]||rig.clips.idle;
 if(activeAppearance!==rig.id){images.clear();activeAppearance=rig.id;}
 // The eight original atlases exceed 400 MiB decoded per outfit. Keep the
 // current/idle images and warm the next authored action during its quiet lead-in.
 const upcoming=sampleLobbyIdle(time+3,reduced,pose,profile?.seed||41001),next=rig.clips[upcoming.name]||rig.clips.idle;
 imageFor(rig.clips.idle.url);imageFor(next.url);imageFor(clip.url);pruneImages(new Set([rig.clips.idle.url,next.url,clip.url]));
 const image=imageFor(clip.url)||imageFor(rig.clips.idle.url);if(!image)return false;const actual=imageFor(clip.url)?clip:rig.clips.idle,k=height/rig.height,[w,h]=rig.frame,frame=Math.min(actual.frames-1,Math.floor((p.time%actual.seconds)/actual.seconds*actual.frames)),columns=actual.columns||actual.frames,rows=Math.ceil(actual.frames/columns),row=Math.max(0,Math.min((rig.directions||4)-1,direction));
 c.save();c.imageSmoothingEnabled=true;c.drawImage(image,(frame%columns)*w,(row*rows+Math.floor(frame/columns))*h,w,h,x-rig.ground[0]*k,y-rig.ground[1]*k,w*k,h*k);c.restore();return true;
}
