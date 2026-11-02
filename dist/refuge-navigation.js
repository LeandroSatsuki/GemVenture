// Isolated proposal. Coordinates are ground/paint units, not World's doubled units.
const EPS=1e-7,finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),copy=p=>({x:p.x,y:p.y});
function pointSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/d)):0;return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
function intersects(a,b,c,d){const u=cross(a,b,c),v=cross(a,b,d),w=cross(c,d,a),z=cross(c,d,b);if(((u>EPS&&v< -EPS)||(u< -EPS&&v>EPS))&&((w>EPS&&z< -EPS)||(w< -EPS&&z>EPS)))return true;return Math.abs(u)<EPS&&pointSegment(c,a,b)<EPS||Math.abs(v)<EPS&&pointSegment(d,a,b)<EPS||Math.abs(w)<EPS&&pointSegment(a,c,d)<EPS||Math.abs(z)<EPS&&pointSegment(b,c,d)<EPS;}
function segmentDistance(a,b,c,d){return intersects(a,b,c,d)?0:Math.min(pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));}
function inside(p,polygon){let result=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const a=polygon[i],b=polygon[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)result=!result;}return result;}
function edges(polygon){return polygon.map((p,i)=>[p,polygon[(i+1)%polygon.length]]);}

// Reads the renderer's canonical M/L/Q/Z coast, rather than maintaining another island.
// Every flattened quadratic stays within tolerance of its curve; clearance adds that tolerance.
export function coastFromPath(path,tolerance=.025){
 if(typeof path!=='string'||!Number.isFinite(tolerance)||tolerance<=0)throw new TypeError('Invalid canonical coast');
 const tokens=path.match(/[A-Za-z]|[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)||[],out=[];let i=0,current=null,closed=false;
 const number=()=>{const n=Number(tokens[i++]);if(!Number.isFinite(n))throw Error('Malformed coast');return n;};
 const quadratic=(a,b,c,depth=0)=>{if(depth>20)throw Error('Coast subdivision overflow');if(pointSegment(b,a,c)<=tolerance){out.push(copy(c));return;}const ab={x:(a.x+b.x)/2,y:(a.y+b.y)/2},bc={x:(b.x+c.x)/2,y:(b.y+c.y)/2},m={x:(ab.x+bc.x)/2,y:(ab.y+bc.y)/2};quadratic(a,ab,m,depth+1);quadratic(m,bc,c,depth+1);};
 while(i<tokens.length){const cmd=tokens[i++];if(cmd==='M'&&!current){current={x:number(),y:number()};out.push(copy(current));}else if(cmd==='L'&&current){current={x:number(),y:number()};out.push(copy(current));}else if(cmd==='Q'&&current){const control={x:number(),y:number()},end={x:number(),y:number()};quadratic(current,control,end);current=end;}else if(cmd==='Z'&&i===tokens.length){closed=true;}else throw Error('Unsupported canonical coast command: '+cmd);}
 if(!closed||out.length<3)throw Error('Coast must be a closed surface');if(distance(out[0],out.at(-1))<EPS)out.pop();
 return Object.freeze({boundary:Object.freeze(out.map(p=>Object.freeze(p))),error:tolerance});
}

export function createRefugeNavigation({surface,obstacles=[],radius,spacing,contains=null}){
 if(!surface||!Array.isArray(surface.boundary)||surface.boundary.length<3||surface.boundary.length>4096||!surface.boundary.every(finite)||!Number.isFinite(surface.error??0)||(surface.error??0)<0||!Number.isFinite(radius)||radius<=0||!Number.isFinite(spacing)||spacing<=0||!Array.isArray(obstacles)||obstacles.length>256)throw new TypeError('Invalid navigation geometry');
 const boundary=surface.boundary.map(copy),error=surface.error||0,clearance=radius+error+EPS,shore=edges(boundary),solids=obstacles.map(o=>{if(!Array.isArray(o.points)||o.points.length<3||!o.points.every(finite))throw new TypeError('Invalid obstacle');const points=o.points.map(copy);return {id:o.id,points,edges:edges(points)};}),allEdges=[...shore,...solids.flatMap(o=>o.edges)].map(([a,b])=>({a,b,left:Math.min(a.x,b.x),right:Math.max(a.x,b.x),top:Math.min(a.y,b.y),bottom:Math.max(a.y,b.y)}));
 const bounds={left:Math.min(...boundary.map(p=>p.x)),right:Math.max(...boundary.map(p=>p.x)),top:Math.min(...boundary.map(p=>p.y)),bottom:Math.max(...boundary.map(p=>p.y))};
 if((bounds.right-bounds.left)*(bounds.bottom-bounds.top)/spacing**2>65536)throw new RangeError('Navigation mesh exceeds finite budget');
 function safe(p){return finite(p)&&(!contains||contains(p.x,p.y))&&inside(p,boundary)&&!solids.some(o=>inside(p,o.points))&&allEdges.every(e=>p.x+clearance<e.left||p.x-clearance>e.right||p.y+clearance<e.top||p.y-clearance>e.bottom||pointSegment(p,e.a,e.b)>clearance);}
 function clearSegment(a,b){const left=Math.min(a.x,b.x)-clearance,right=Math.max(a.x,b.x)+clearance,top=Math.min(a.y,b.y)-clearance,bottom=Math.max(a.y,b.y)+clearance;return allEdges.every(e=>right<e.left||left>e.right||bottom<e.top||top>e.bottom||segmentDistance(a,b,e.a,e.b)>clearance);}
 function segment(a,b){return safe(a)&&safe(b)&&clearSegment(a,b);}
 let mesh=null;
 function prepare(){if(mesh)return mesh;const nodes=[],keys=new Map();for(let y=bounds.top+spacing/2,row=0;y<bounds.bottom;y+=spacing,row++)for(let x=bounds.left+spacing/2,col=0;x<bounds.right;x+=spacing,col++){const p={x,y};if(safe(p)){keys.set(col+','+row,nodes.length);nodes.push({...p,col,row,links:[]});}}
  for(let index=0;index<nodes.length;index++){const n=nodes[index];for(const [dx,dy]of [[1,0],[0,1],[1,1],[-1,1]]){const j=keys.get((n.col+dx)+','+(n.row+dy));if(j!==undefined&&clearSegment(n,nodes[j])){const cost=distance(n,nodes[j]);n.links.push({index:j,cost});nodes[j].links.push({index,cost});}}}
  mesh={nodes};return mesh;
 }
 function route(from,to){
  if(!safe(from))return {ok:false,reason:'invalid-origin',points:[]};
  if(!safe(to))return {ok:false,reason:'invalid-destination',points:[]};
  if(distance(from,to)<EPS)return {ok:true,points:[copy(from)],length:0};
  if(segment(from,to))return {ok:true,points:[copy(from),copy(to)],length:distance(from,to)};
  const {nodes}=prepare(),starts=[],goals=new Map();for(let i=0;i<nodes.length;i++){if(clearSegment(from,nodes[i]))starts.push(i);if(clearSegment(nodes[i],to))goals.set(i,distance(nodes[i],to));}
  if(!starts.length||!goals.size)return {ok:false,reason:'no-route',points:[]};
  const cost=new Float64Array(nodes.length).fill(Infinity),parent=new Int32Array(nodes.length).fill(-1),closed=new Uint8Array(nodes.length),heap=[];
  const push=(i,score)=>{let at=heap.length;heap.push({i,score});while(at){const p=(at-1)>>1;if(heap[p].score<=score)break;heap[at]=heap[p];at=p;heap[at]={i,score};}};
  const pop=()=>{const first=heap[0],tail=heap.pop();if(heap.length){let at=0;heap[0]=tail;while(true){let child=at*2+1;if(child>=heap.length)break;if(child+1<heap.length&&heap[child+1].score<heap[child].score)child++;if(heap[child].score>=tail.score)break;heap[at]=heap[child];at=child;heap[at]=tail;}}return first.i;};
  for(const i of starts){cost[i]=distance(from,nodes[i]);push(i,cost[i]+distance(nodes[i],to));}
  let best=-1,bestCost=Infinity;while(heap.length){const i=pop();if(closed[i])continue;if(cost[i]+distance(nodes[i],to)>=bestCost)continue;closed[i]=1;if(goals.has(i)){const candidate=cost[i]+goals.get(i);if(candidate<bestCost){best=i;bestCost=candidate;}}for(const e of nodes[i].links){const value=cost[i]+e.cost;if(value+EPS<cost[e.index]){cost[e.index]=value;parent[e.index]=i;push(e.index,value+distance(nodes[e.index],to));}}}
  if(best<0)return {ok:false,reason:'no-route',points:[]};const raw=[copy(to)];for(let i=best;i>=0;i=parent[i])raw.push(copy(nodes[i]));raw.push(copy(from));raw.reverse();
  const points=[raw[0]];for(let i=0;i<raw.length-1;){let j=raw.length-1;while(j>i+1&&!segment(raw[i],raw[j]))j--;points.push(raw[j]);i=j;}
  return {ok:true,points,length:points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0)};
 }
 // Station approaches may sit too near a large base. Resolve only along its front normal.
 function approach(from,preferred){if(!finite(preferred)||preferred.x<bounds.left||preferred.x>bounds.right||preferred.y<bounds.top||preferred.y>bounds.bottom)return {ok:false,reason:'invalid-approach',points:[]};for(let y=preferred.y;y<=bounds.bottom;y+=spacing/4){const p={x:preferred.x,y};if(safe(p)){const result=route(from,p);if(result.ok)return {...result,resolvedApproach:copy(p)};}}return {ok:false,reason:'no-approach',points:[]};}
 return Object.freeze({safe,segment,route,approach,prepare:()=>{prepare();return {nodes:mesh.nodes.length,edges:allEdges.length};},bounds:Object.freeze(bounds),radius,clearance,stats:()=>({nodes:mesh?.nodes.length||0,edges:allEdges.length})});
}
