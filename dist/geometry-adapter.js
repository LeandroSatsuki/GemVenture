import {createRefugeNavigation} from './refuge-navigation.js';
export function navigationFromContract(contract){
 if(!contract||contract.units!=='local'||contract.worldScale!==2||!Number.isInteger(contract.revision)||contract.revision<1||!Array.isArray(contract.boundary)||!Number.isFinite(contract.boundaryError)||contract.boundaryError<0||!contract.approaches)throw new TypeError('Unsupported canonical refuge contract');
 const point=q=>{if(!Array.isArray(q)||q.length!==2||!q.every(Number.isFinite))throw new TypeError('Invalid canonical point');return {x:q[0],y:q[1]};};
 const nav=createRefugeNavigation({surface:{boundary:contract.boundary.map(point),error:contract.boundaryError},obstacles:contract.obstacles.map(o=>({id:o.id,points:o.polygon.map(point)})),radius:contract.actorRadius,spacing:Math.min(16,contract.actorRadius)});
 if(!nav.safe(contract.spawn))throw Error('Canonical spawn is not walkable with the actor radius');
 for(const [id,approach]of Object.entries(contract.approaches))if(!nav.safe(approach))throw Error('Canonical approach is not walkable: '+id);
 return nav;
}
