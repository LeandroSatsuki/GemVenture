// Explicit room generations let an active save keep its original geography.
export const CAMPAIGN_CAVE_PROFILES=Object.freeze({
 2:Object.freeze({cols:192,rows:144,halls:24,sideHalls:6,minLinks:23,maxLinks:38,minBurrowDistance:180}),
 3:Object.freeze({cols:160,rows:108,halls:15,sideHalls:3,minLinks:14,maxLinks:22,minBurrowDistance:180})
});
export function campaignCaveProfile(room){
 const p=CAMPAIGN_CAVE_PROFILES[room?.layout?.version];
 return p&&room.campaignCave?.version===1&&!room.bossFloor&&room.layout.style==='EXPEDITION'&&room.cols===p.cols&&room.rows===p.rows?p:null;
}
