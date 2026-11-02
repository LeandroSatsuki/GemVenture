import {P} from './palette.js';
export function paintCaveMiniboss(c,run,enemy,x,y){
 if(!enemy.miniboss||enemy.hp<=0||!run.room.miniboss)return;
 c.save();c.beginPath();c.ellipse(x,y+1,22,7,0,0,Math.PI*2);c.fillStyle=P.gold;c.globalAlpha=.04;c.fill();c.globalAlpha=.32;c.strokeStyle=P.gold;c.lineWidth=.9;c.stroke();c.restore();
}
