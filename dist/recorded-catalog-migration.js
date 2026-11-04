import {albumById} from './music-albums.js';
import {beatTime,trackForFloor} from './score.js';
import {musicFloor} from './frenzy.js';
// Save compatibility only. No retired audio, cover, beat map or playable entry.
const retiredAlbums=Object.freeze({'dos88-horizon':5,'dos88-prepareto-fight':5,'dos88-smooth-sailing':5,'eric-digital-native':6});
const retiredEditions=Object.freeze({'GV059-L05-03':'dos88-horizon','GV059-L04-13':'dos88-main-objective','GV059-L05-06':'dos88-prepareto-fight','GV059-L04-11':'dos88-race-to-mars','GV059-L04-10':'dos88-smooth-sailing','GV059-L05-04':'eric-digital-native'});
const replacement=Object.freeze({'dos88-main-objective':'GV059-L05-08','dos88-race-to-mars':'GV059-L03-01'});
const priceReduction=Object.freeze({'dos88-main-objective':2,'dos88-race-to-mars':3});
export function migrateRecordedCatalog(state){
 const records=state.records;if(!records||records.albumCatalogVersion!==undefined)return records?.albumCatalogVersion===undefined||records.albumCatalogVersion===1;
 const owned=records.albumOwned;if(owned===undefined)return !Object.hasOwn(retiredEditions,state.run?.albumEdition);
 if(!Array.isArray(owned)||owned.length>11||new Set(owned).size!==owned.length||owned.some(id=>!albumById(id)&&!Object.hasOwn(retiredAlbums,id)))return false;
 for(const id of [records.albumActive,state.run?.albumEdition])if(Object.hasOwn(retiredEditions,id)&&!owned.includes(retiredEditions[id]))return false;
 const refund=owned.reduce((sum,id)=>sum+(retiredAlbums[id]||priceReduction[id]||0),0);
 if(!Number.isSafeInteger(state.stars)||state.stars<0||!Number.isSafeInteger(state.stars+refund))return false;
 state.stars+=refund;records.albumOwned=owned.filter(id=>!Object.hasOwn(retiredAlbums,id));records.albumCatalogVersion=1;
 if(Object.hasOwn(retiredEditions,records.albumActive)){
  const next=replacement[retiredEditions[records.albumActive]];if(next)records.albumActive=next;else delete records.albumActive;
 }
 if(Object.hasOwn(retiredEditions,state.run?.albumEdition)){
  // Keep the expedition, loot, health, combo and beat deadlines. Resume on its
  // original legacy arrangement at the same completed beat, without a missed hit.
  const run=state.run,phase=Math.max(0,Number.isSafeInteger(run.beat)?run.beat:0,Number.isSafeInteger(run.acted)?run.acted:0);
  delete run.albumEdition;run.elapsed=beatTime(musicFloor(run),phase);run.clockBpm=trackForFloor(musicFloor(run)).bpm;run.musicClock=2;
 }
 return true;
}
