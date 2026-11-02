import test from 'node:test';import assert from 'node:assert/strict';
import * as E from '../dist/core.js';
import {awardScore,STAR_MARKS,scoreBeats} from '../dist/stars.js';
import {RECORDS,buyRecord} from '../dist/records.js';
import {ASTRAL_COST} from '../dist/astral.js';
import {minerOutfitKey,setMinerOutfit,OUTFIT_SLOTS} from '../dist/miner-outfit.js';
import {sampleLobbyIdle,resolvePlayerAppearance} from '../dist/player-appearance.js';
import {compactTalentNetwork,buyCompactTalent,compactRank} from '../dist/compact-talents.js';
import {TALENTS,talentEffects} from '../dist/talents.js';
import {validateLayout} from '../dist/cave-layout.js';
import {occludingWallPlan,wallOcclusion} from '../dist/cave-wall-occlusion.js';
import {dungeonMineralShapes} from '../dist/dungeon-volumes.js';
const fresh=()=>{const s=E.createState(41001);s.seals=6;E.startRun(s);return s;};
test('floor rating resets, expedition score persists, replay only pays improvements, lifetime maximum 175',()=>{
 const s=fresh();let sum=0;
 for(let floor=1;floor<=35;floor++){s.run.floor=floor;E.generateRoom(s);assert.equal(s.run.score.points,0);assert.equal(s.run.score.earned,0);const target=s.run.score.target;awardScore(s,Math.ceil(target*.85),0);assert.equal(s.run.score.earned,5);sum+=s.run.score.points;assert.equal(s.run.score.totalPoints,sum);assert.equal(s.stars,floor*5);}
 assert.equal(s.journey.earnedStars,175);E.finishRun(s);assert.equal(s.lastResult.earnedStars,175);const saved=E.restoreState(JSON.stringify(s));assert.ok(saved);saved.stars-=4;E.startRun(saved);awardScore(saved,saved.run.score.target,0);assert.equal(saved.stars,171);assert.equal(saved.run.score.awarded,0);
});
test('a 10000-point floor awards five stars at 8500; late beats stop scoring; best-only gains survive reload',()=>{
 const s=fresh();Object.assign(s.run.score,{target:10000});s.run.room.scoreLimit=10000;
 for(let i=0;i<5;i++){const goal=10000*STAR_MARKS[i];awardScore(s,goal-s.run.score.points-1,0);assert.equal(s.run.score.earned,i);awardScore(s,1,0);assert.equal(s.run.score.earned,i+1);}
 assert.equal(s.run.score.points,8500);assert.equal(awardScore(s,100,scoreBeats(s.run)),0);const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);assert.equal(restored.stars,5);awardScore(restored,100,1);assert.equal(restored.stars,5);
});
test('old currency converts once to coins, removed from runtime; records and relics share finite stars',()=>{
 const old=E.createState(41001);old.essence=12;const migrated=E.restoreState(JSON.stringify(old));assert.equal(migrated.bank,150);assert.ok(!('essence' in migrated));assert.equal(E.restoreState(JSON.stringify(migrated)).bank,150);
 migrated.stars=6;const disc=RECORDS.find(x=>x.id==='iron');assert.equal(buyRecord(migrated,disc.id),true);assert.equal(migrated.stars,6-disc.cost);assert.equal(ASTRAL_COST,4);assert.equal(buyRecord(migrated,disc.id),false);
});
test('duck and pink are available and roundtrip all five slots without changing gameplay',()=>{
 const s=E.createState(41001),before=E.power(s);assert.equal(Object.keys(OUTFIT_SLOTS).length,5);assert.ok(setMinerOutfit(s,'hat','duck'));assert.ok(setMinerOutfit(s,'shirt','pink'));assert.equal(minerOutfitKey(s),'duck-pink');assert.match(resolvePlayerAppearance(s).url,/duck-pink/);assert.equal(E.power(s),before);assert.equal(minerOutfitKey(E.restoreState(JSON.stringify(s))),'duck-pink');E.startRun(s);assert.equal(setMinerOutfit(s,'hat','hardhat'),false);
});
test('idle schedule includes quiet, dance, sit and wave, is seeded and honors reduced motion and 1.5 speed',()=>{
 const seen=new Set();for(let t=0;t<180;t+=.3){const a=sampleLobbyIdle(t,false,'idle',41001);assert.deepEqual(a,sampleLobbyIdle(t,false,'idle',41001));seen.add(a.name);assert.deepEqual(sampleLobbyIdle(t,true),{name:'idle',time:0});}
 assert.deepEqual([...seen].sort(),['idle','jamal','look','sit','step','sway','wave']);assert.equal(resolvePlayerAppearance({}).clips.jamal.seconds,6.4);
});
test('compact branches represent all 192 small nodes once; investments/effects remain in original save schema',()=>{
 const s=E.createState(41001);s.unlocked=E.SKILLS.map(k=>k.id);s.experience.points=100000;const net=compactTalentNetwork(E.SKILLS),groups=net.nodes.filter(n=>n.members);assert.equal(groups.length,18);assert.equal(new Set(groups.flatMap(n=>n.members.map(q=>q.id))).size,TALENTS.filter(n=>n.kind!=='mastery').length);
 const before=talentEffects(s);let count=0;for(let loop=0;loop<8;loop++)for(const g of groups)if(buyCompactTalent(s,g.id,E.SKILLS))count++;assert.ok(count>30);assert.equal(groups.reduce((n,g)=>n+compactRank(s,g.id),0),count);assert.ok(Object.keys(s.talents.ranks).every(id=>id.startsWith('web-')));assert.notDeepEqual(talentEffects(s),before);
});
test('200 seeds keep connected rooms and complete finite walls; foreground occlusion fades instead of shortening',()=>{
 for(let seed=0;seed<200;seed++){const s=E.createState(seed);E.startRun(s);assert.ok(validateLayout(s.run.room));const faces=occludingWallPlan(s.run.room);assert.ok(faces.length>20);for(const f of faces){assert.ok([30,48].includes(f.height));assert.ok([...f.a,...f.b,...f.cap.flat()].every(Number.isFinite));}assert.ok(s.run.room.layout.rooms.filter(r=>r.kind==='main').length===15);}
 const s=fresh(),f=occludingWallPlan(s.run.room)[0],player={x:(f.a[0]+f.b[0]),y:(Math.max(f.a[1],f.b[1])-20)*2};assert.ok(wallOcclusion(f,player)<.3);assert.equal(wallOcclusion(f,{x:player.x+500,y:player.y}),1);assert.ok([30,48].includes(f.height));
});
test('three rock types and seven biome crystal silhouettes stay different, with no invalid geometry',()=>{
 for(let biome=0;biome<7;biome++){assert.equal(new Set([0,1,2].map(variant=>JSON.stringify(dungeonMineralShapes('rock',{biome,variant})))).size,3);for(let variant=0;variant<4;variant++)for(const shape of dungeonMineralShapes('crystal',{biome,variant}))assert.doesNotMatch(shape.d,/NaN|Infinity/);}
});

test('account score resumes after a floor reset and reload without losing its cumulative cursor',()=>{
 const s=fresh();s.run.acted=0;awardScore(s,500,0);const old=s.accountScore.total;
 s.run.floor=2;E.generateRoom(s);assert.equal(s.run.score.points,0);const restored=E.restoreState(JSON.stringify(s));assert.ok(restored);restored.run.acted=0;awardScore(restored,100,0);assert.equal(restored.accountScore.total,old+100);assert.equal(restored.accountScore.current.rawCursor,600);
});
