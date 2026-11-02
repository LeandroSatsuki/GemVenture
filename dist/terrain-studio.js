import {P} from './palette.js';
import {TERRAIN_SLOTS,TERRAIN_MATERIALS,terrainMaskAt,terrainPolygon} from './terrain-kit.js';
const $=id=>document.getElementById(id),atlas=$('atlas'),map=$('map'),c=map.getContext('2d'),pc=$('piece').getContext('2d');
let material=TERRAIN_MATERIALS[0],walls=false,grid=false,selected=0;
$('materials').innerHTML=TERRAIN_MATERIALS.map(m=>`<button data-material="${m.id}" aria-pressed="${m===material}">${m.name}</button>`).join('');
document.querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{material=TERRAIN_MATERIALS.find(m=>m.id===b.dataset.material);document.querySelectorAll('[data-material]').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));if(['agua','lava'].includes(material.id))$('scene').value='lake';downloads();draw();});
function downloads(){for(const [id,suffix,label]of [['templateDownload','-template.png','TEMPLATE PNG'],['promptDownload','-prompt.txt','PROMPT']]){const link=$(id);link.href='assets/terrain-kit-v1/'+material.id+suffix;link.textContent=label+' · '+material.name+' ↓';}}
$('scene').onchange=draw;$('walls').onclick=()=>{walls=!walls;$('walls').setAttribute('aria-pressed',String(walls));draw();};$('grid').onclick=()=>{grid=!grid;$('grid').setAttribute('aria-pressed',String(grid));draw();};
function scene(){const kind=$('scene').value;return Array.from({length:14},(_,y)=>Array.from({length:20},(_,x)=>{
 if(kind==='cave')return ((x-5)**2/19+(y-5)**2/12<1||(x-14)**2/17+(y-8)**2/12<1||x>=5&&x<=14&&y>=5&&y<=7)?1:0;
 if(kind==='lake')return ((x-9)**2/49+(y-6)**2/22<1&&!(x>=8&&x<=11&&y>=5&&y<=7))?1:0;
 return x>1&&x<18&&y>1&&y<12&&!(x<4&&y<4)&&!(x>15&&y>9)?1:0;
}));}
function face(points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function draw(){
 c.fillStyle=P.ink;c.fillRect(0,0,map.width,map.height);const cells=scene(),liquid=['agua','lava'].includes(material.id),height=walls&&!liquid?76:0;
 c.save();c.translate(78,36);c.scale(1.8,1.8);
 const world=(p,x,y,z=0)=>[22*(x+p[0])+2*(y+p[1]),16*(y+p[1])-z/8];
 const add=(path,points)=>{points.forEach(([x,y],i)=>i?path.lineTo(x,y):path.moveTo(x,y));path.closePath();};
 if($('scene').value==='lake')face([[0,0],[440,0],[468,224],[28,224]],material.id==='lava'?P.slate:P.forest);
 const surface=new Path2D(),sides=new Path2D(),outlines=new Path2D();
 for(let y=0;y<14;y++)for(let x=0;x<20;x++)if(cells[y][x]){
  const outline=terrainPolygon(terrainMaskAt(cells,x,y)),top=outline.map(p=>world(p,x,y,height));add(surface,top);add(outlines,top);
  if(height)for(let i=0;i<outline.length;i++){
   const a=outline[i],b=outline[(i+1)%outline.length];if(b[1]-a[1]-(b[0]-a[0])<=1e-8)continue;
   if(Math.abs(a[0]-1)<1e-8&&Math.abs(b[0]-1)<1e-8&&cells[y]?.[x+1])continue;
   if(Math.abs(a[1]-1)<1e-8&&Math.abs(b[1]-1)<1e-8&&cells[y+1]?.[x])continue;
   add(sides,[world(a,x,y,height),world(b,x,y,height),world(b,x,y),world(a,x,y)]);
  }
 }
 // One compound fill removes anti-alias seams between neighboring polygons.
 c.fillStyle=material.shadow;c.fill(sides);c.fillStyle=material.base;c.fill(surface);
 if(grid){c.strokeStyle=P.ink;c.lineWidth=.4;c.stroke(outlines);}
 c.restore();c.fillStyle=P.silver;c.font='700 19px system-ui';c.fillText(material.name+' · '+$('scene').selectedOptions[0].textContent,24,458);
}
function select(id){selected=id;const slot=TERRAIN_SLOTS[id];$('pieceName').textContent='PEÇA '+String(id).padStart(2,'0');$('pieceInfo').textContent=slot.label+' · LINHA '+(slot.row+1)+' · COLUNA '+(slot.column+1);
 pc.clearRect(0,0,384,384);if(atlas.complete&&atlas.naturalWidth)pc.drawImage(atlas,slot.frame.x,slot.frame.y,256,256,0,0,384,384);
}
atlas.onload=()=>select(selected);atlas.onclick=e=>{const r=atlas.getBoundingClientRect(),column=Math.min(7,Math.max(0,Math.floor((e.clientX-r.left)/r.width*8))),row=Math.min(7,Math.max(0,Math.floor((e.clientY-r.top)/r.height*8)));select(row*8+column);};
downloads();select(0);draw();
