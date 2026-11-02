import {createLayout,locateHedgehog} from '../../dist/cave-layout.js';
import {rng} from '../../dist/core.js';
// Geometry-independent action tests use an explicit legacy room. Campaign
// generation and its versioned metadata are exercised by integration tests.
export function rectangularRoom(state,{cols=42,rows=30,player={x:3,y:11}}={}){
 const r=state.run,room=r.room;delete room.campaignCave;delete room.abyssCave;delete room.zagShop;delete room.caveZag;delete room.caveFinds;delete room.miniboss;
 Object.assign(room,{cols,rows,floorMask:Array.from({length:cols*rows},(_,i)=>+(i%cols>0&&i%cols<cols-1&&Math.floor(i/cols)>0&&Math.floor(i/cols)<rows-1)),layout:{version:1,style:'TEST_RECTANGLE',rooms:[],protectedTiles:[]},terrain:Array(cols*rows).fill(0),explored:null,visible:null,exit:{x:cols-3,y:2},hedgehog:{x:7,y:0,facing:1,biome:Math.floor((r.floor-1)/5),pulseBeat:-1},rocks:[],nodes:[],enemies:[]});r.player={...player};return room;
}

// Exercise the still-supported legacy art planners against their own generator.
export function legacyArtRoom(seed,biome=0){const r={seed,cols:42,rows:30,nodes:[],rocks:[],enemies:[],exit:{x:39,y:2}};createLayout(r,rng(seed),biome);locateHedgehog(r,biome);return r;}
