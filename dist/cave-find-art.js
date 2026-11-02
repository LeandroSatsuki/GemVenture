import {drawAsset} from './art-kit.js';
import {paintChestOpening} from './approved-chest-opening-art.js';
import {comboGuardRemaining,findsEnabled} from './cave-finds.js';
import {P} from './palette.js';
export function caveFindEntities(run){return findsEnabled(run)?(run.room.caveFinds||[]).filter(p=>(!p.used||p.kind==='chest')):[];}
export function paintCaveFind(c,find,project,{opening}={}){
 const p=project(find.x,find.y),x=p.x/2,y=p.y/2,chest=find.kind==='chest';
 c.save();if(find.used&&!chest)c.globalAlpha=.5;
 const animated=chest&&find.used&&paintChestOpening(c,x,y,34,opening?.frameIndex??15);
 if(!animated)drawAsset(c,chest?'cave-chest':'cave-mushroom',x,y,chest?34:27,{seed:1,variant:chest?(find.used?1:0):['heal','combo','blast'].indexOf(find.kind)});
 c.restore();
}
export function paintComboGuard(c,run,player,phase,{soft=false}={}){
 if(comboGuardRemaining(run,phase)<=0)return;
 const pulse=soft?0:Math.sin(phase*Math.PI*2)*.6;c.save();c.strokeStyle=P.cyan;c.lineWidth=1.4;c.globalAlpha=.7;c.setLineDash([4,3]);c.beginPath();c.ellipse(player.x/2,player.y/2+1,13+pulse,5,0,0,Math.PI*2);c.stroke();c.restore();
}
