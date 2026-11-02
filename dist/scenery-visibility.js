import {visible} from './cavern.js';
// Rendering policy only. Discovery, targeting and interaction keep their own rules.
export const sceneEntityVisible=(room,node)=>node?.type!=='enemy'||visible(room,node);
export const sceneryBurrowVisible=room=>!!room?.hedgehog&&!(room.abyssCave?.version===1&&room.hedgehog.x===0);
