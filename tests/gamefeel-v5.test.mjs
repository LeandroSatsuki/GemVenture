import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as E from '../dist/core.js';
import {applyRhythmTalents} from '../dist/rhythm-talents.js';
import {compactTalentNetwork} from '../dist/compact-talents.js';
import {comboColor,spinningStarSvg} from '../dist/gamefeel-v5.js';
import {sampleLobbyIdle,resolvePlayerAppearance} from '../dist/player-appearance.js';
import {occludingWallPlan} from '../dist/cave-wall-occlusion.js';
import {validateLayout} from '../dist/cave-layout.js';
test('new passives are inert until learned, trigger only on their cadence and survive saves',()=>{
 const s=E.createState(41001);s.unlocked=['guard','breath'];s.experience.points=20;assert.ok(E.learn(s,'prism-shelter'));assert.ok(E.learn(s,'breath-encore'));assert.ok(!s.equipped.includes('prism-shelter'));E.startRun(s);
 s.run.combo=11;s.run.rhythm=40;assert.equal(applyRhythmTalents(s).length,0);
 s.run.combo=12;s.run.beat=20;s.run.acted=20;assert.equal(applyRhythmTalents(s)[0].id,'prism-shelter');assert.equal(s.run.guardUntil,22);
 s.run.combo=16;applyRhythmTalents(s);assert.equal(s.run.rhythm,48);
 s.run.rhythm=98;applyRhythmTalents(s);assert.equal(s.run.rhythm,100);
 assert.ok(E.restoreState(JSON.stringify(s)).unlocked.includes('breath-encore'));
 const old=E.createState(41001);E.startRun(old);old.run.combo=48;assert.deepEqual(applyRhythmTalents(old),[]);
});
test('spread branch nodes do not overlap and preserve every skill and all grouped ranks',()=>{
 const net=compactTalentNetwork(E.SKILLS),nodes=net.nodes;assert.equal(nodes.filter(n=>n.kind==='skill').length,E.SKILLS.length);
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)assert.ok(Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y)>105,nodes[i].id+'/'+nodes[j].id);
});
test('star actually rotates volumetric faces; combo colors respond to progression',()=>{
 const frames=Array.from({length:48},(_,i)=>spinningStarSvg(i));assert.equal(new Set(frames).size,48);assert.ok(frames.every(s=>!s.includes('NaN')&&s.includes('<polygon')));assert.notEqual(comboColor(1),comboColor(42));assert.equal(spinningStarSvg(48),frames[0]);
});
test('living clips preserve sharp source density after cropping and cover four outfits',()=>{
 for(const hat of ['hardhat','duck'])for(const shirt of ['blue','pink']){const rig=resolvePlayerAppearance({homeCollection:{outfit:{hat,shirt}}});assert.deepEqual(rig.frame,[320,320]);assert.equal(rig.clips.jamal.frames/rig.clips.jamal.seconds,30);
 for(const clip of Object.values(rig.clips)){const b=fs.readFileSync(new URL('../dist/'+clip.url,import.meta.url));assert.equal(b.readUInt32BE(16),Math.min(8,clip.frames)*320);assert.equal(b.readUInt32BE(20),Math.ceil(clip.frames/8)*320);}}
 const a=sampleLobbyIdle(0,false,'idle',2026);assert.equal(a.name,'idle');for(let t=0;t<120;t+=.5)assert.deepEqual(sampleLobbyIdle(t,true),{name:'idle',time:0});
});
test('fifteen main rooms retain connectivity across all biomes; all wall faces keep two courses',()=>{
 for(let seed=1;seed<=70;seed++){const s=E.createState(seed);s.seals=6;E.startRun(s);s.run.floor=1+5*(seed%7);E.generateRoom(s);const room=s.run.room;assert.ok(validateLayout(room));assert.equal(room.layout.rooms.filter(r=>r.kind==='main').length,15);assert.ok(E.pathTo(room,s.run.player,room.exit).length);const faces=occludingWallPlan(room);assert.ok(faces.some(f=>f.height===30));for(const f of faces)assert.equal(f.height,30);}
});
