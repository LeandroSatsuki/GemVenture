import {writeFile} from 'node:fs/promises';
import * as E from '../dist/core.js';
import {playFloor,prepareVeteran} from '../tests/player-bot.mjs';
import {beatTime} from '../dist/score.js';
import {FORGE_PROJECTS,forgeRecipe} from '../dist/forge.js';
import {depthDifficulty,forgeCoinCost} from '../dist/balance.js';
import {TALENTS,talentInvestment} from '../dist/talents.js';
const samples=[];
for(const profile of ['new','veteran'])for(const seed of [712,991,43]){const s=E.createState(seed);if(profile==='veteran')prepareVeteran(s);E.startRun(s);let beats=0;const previous=s.experience.level;playFloor(s,(_,beat)=>beats=beat+1);const r=s.run;samples.push({profile,seed,cleared:!!r?.room.cleared,alive:!!r,beats,seconds:Math.round(beatTime(1,beats)),crystals:r?.materials.reduce((a,b)=>a+b,0)||s.lastResult?.keptMaterials.reduce((a,b)=>a+b,0)||0,coins:r?.bag||s.lastResult?.bag||0,levels:s.experience.level-previous,health:r?.health||0,stars:r?.score.earned||0});console.log(JSON.stringify(samples.at(-1)));}
const output={model:'perfect timing, lookahead bot; not a human time estimate',samples,forge:FORGE_PROJECTS.map(p=>({id:p.id,first:p.costs[0],last:p.costs[99],total:p.costs.reduce((a,b)=>a+b,0),lastMaterials:forgeRecipe(p.id,99)})),pickaxeTotal:Array.from({length:99},(_,i)=>forgeCoinCost(i)).reduce((a,b)=>a+b,0),finiteWebPoints:TALENTS.filter(n=>n.max!==Infinity).reduce((a,n)=>a+talentInvestment(n,n.max),0),abyss:[1,5,10,20,50,100,1000].map(section=>({section,...depthDifficulty({mode:'abyss',abyss:{section}})}))};
await writeFile(new URL('../asset-work/balance-results.json',import.meta.url),JSON.stringify(output,null,2));
