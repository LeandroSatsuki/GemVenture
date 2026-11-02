import assert from 'node:assert/strict';
import * as E from '../../dist/core.js';
import {explored} from '../../dist/cavern.js';
// After a won arena fight, take actual on-beat steps; no teleport or clear flag.
export function pathToStair(s){for(let i=0;i<100&&s.run&&!s.run.room.cleared;i++){const r=s.run,b=Math.max(r.acted,r.beat)+1,path=E.pathTo(r.room,r.player,r.room.exit),step=path.slice(0,E.movement(s)).reverse().find(p=>explored(r.room,p));assert.ok(step,'reachable stair');E.enemyBeat(s,b);assert.ok(E.act(s,{type:'move',...step},b).ok);E.tick(s,b);}assert.ok(s.run?.room.cleared);}
