import {rabbitDirtEmission} from './vfx-actor-emission.js';
import {sampleDungeonMotes} from './dungeon-environment.js';
// Faint light from existing motes and live sparks, never a second particle emitter.
export const PARTICLE_LIGHT_SPEC=Object.freeze({maxLights:48,maxSparks:24,maxColors:8,textureSize:32,moteRadius:5,sparkRadius:8,alpha:.06,nightReveal:.035});
const clamp=x=>Math.max(0,Math.min(1,x));
export function sampleGeodeParticleLights(world,{scene=world.campaignScene,time=0,soft=false,fallbackColor='#2fbfcd'}={}){
 const room=scene?.room;if(!room)return [];
 const viewport={x:world.camera.x/2,y:world.camera.y/2,w:world.viewWidth/2,h:world.viewHeight/2};
 const motes=sampleDungeonMotes({biome:scene.biome,seed:room.seed,time,soft,energy:world.comboDisco?.energy||0,viewport});
 const sparks=(world.fx?.particles||[]).filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.life>0&&p.total>0).slice(0,PARTICLE_LIGHT_SPEC.maxSparks).map(p=>({x:p.x,y:p.y,radius:PARTICLE_LIGHT_SPEC.sparkRadius,alpha:clamp(p.life/p.total)*(soft?.5:1),color:p.color}));
 const emitted=world.fx?.emissionSources?.({soft,limit:PARTICLE_LIGHT_SPEC.maxSparks})||[];
 const character=[...(world.fx?.playerHeal?.emissionSources?.(world.fx.age,{soft})||[]),...(world.fx?.playerShield?.emissionSources?.(world.fx.age)||[]),...(world.fx?.playerTitan?.emissionSources?.(world.fx.age)||[]),...(world.fx?.age>.1?world.powerVfx?.emissionSources?.()||[]:[])];
 character.push(...rabbitDirtEmission(world.rabbitPresentation,{soft}));
 const wing=world.crystalWingFrame;if(wing?.active&&wing.bodyWorld)for(const side of [-1,1])character.push({x:wing.bodyWorld.x/2+side*18,y:wing.bodyWorld.y/2-22,radius:8,alpha:.7,color:'#5ee9e9'});
 const balanced=[];for(let i=0;balanced.length<PARTICLE_LIGHT_SPEC.maxSparks;i++){if(!character[i]&&!emitted[i])break;for(const g of[character,emitted])if(g[i]&&balanced.length<PARTICLE_LIGHT_SPEC.maxSparks)balanced.push(g[i]);}
 const effects=world.fx?.emissionSources?balanced.filter(p=>[p.x,p.y,p.radius,p.alpha].every(Number.isFinite)&&p.radius>0&&p.alpha>0).slice(0,PARTICLE_LIGHT_SPEC.maxSparks).map(p=>({...p,emissive:true,radius:Math.min(PARTICLE_LIGHT_SPEC.sparkRadius,p.radius),alpha:clamp(p.alpha)*(soft?.5:1)})):sparks;
 const sources=[...effects,...motes.map(p=>({...p,radius:PARTICLE_LIGHT_SPEC.moteRadius}))].slice(0,PARTICLE_LIGHT_SPEC.maxLights);
 // A burst at one contact must not combine many weak lights into one bright flash.
 const cell=p=>Math.floor(p.x/16)+','+Math.floor(p.y/16),counts=new Map();for(const p of sources)counts.set(cell(p),(counts.get(cell(p))||0)+1);
 return sources.map(p=>({...p,alpha:p.alpha/Math.max(1,counts.get(cell(p))/3),color:/^#[0-9a-f]{6}$/i.test(p.color||'')?p.color:fallbackColor}));
}
